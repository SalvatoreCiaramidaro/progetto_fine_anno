import sys
print("DEBUG: server.py avviato", file=sys.stderr)
import os
import sys
import uuid
import logging
from functools import wraps
from dotenv import load_dotenv

# Carica le variabili d'ambiente dal file .env
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env'))
import sys
from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from flask_login import LoginManager, UserMixin, login_user, logout_user, current_user, login_required
import configparser
from urllib.parse import urlparse, urljoin
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from mysql.connector.errors import IntegrityError

# Carica le configurazioni dal file config.ini
config = configparser.ConfigParser()
import os
# Prima tenta il percorso relativo, poi quello assoluto se non trova sezioni
read_files = config.read('config.ini')
if not config.sections():
    # Prova con il percorso assoluto usato in wsgi.py
    project_home = '/home/Ciaramid06/progetto_fine_anno'
    abs_path = os.path.join(project_home, 'config.ini')
    read_files = config.read(abs_path)
if not config.sections():
    raise FileNotFoundError("config.ini non trovato né in percorso relativo né assoluto. Sezioni caricate: {}".format(config.sections()))
print("Config sections:", config.sections())
print("Config sections:", config.sections())

# Importazioni dai moduli personalizzati
from db_config import db_cursor
from email_service import email_service

# Rileva l'ambiente di esecuzione
is_pythonanywhere = 'PYTHONANYWHERE_SITE' in os.environ

logging.basicConfig(level=logging.INFO)

app = Flask(__name__)
secret_key = os.getenv('FLASK_SECRET_KEY')
if not secret_key:
    try:
        secret_key = config.get('FLASK', 'secret_key')
    except Exception:
        print("ATTENZIONE: FLASK_SECRET_KEY non trovata né come variabile d'ambiente né in config.ini!")
        secret_key = None
app.secret_key = secret_key
app.config['SECURITY_PASSWORD_SALT'] = os.getenv('SECURITY_PASSWORD_SALT')

# Funzione per verificare e creare l'utente admin se necessario
def ensure_admin_exists():
    try:
        admin_email = os.getenv('ADMIN_EMAIL')
        admin_password = os.getenv('ADMIN_PASSWORD')
        
        with db_cursor(dictionary=True) as (cursor, conn):
            # Verifica se l'admin esiste
            cursor.execute('SELECT * FROM users WHERE email = %s', (admin_email,))
            admin = cursor.fetchone()
            
            if not admin:
                # Crea l'admin se non esiste
                password_hash = generate_password_hash(admin_password)
                cursor.execute(
                    'INSERT INTO users (username, email, password, confirmed, is_admin) VALUES (%s, %s, %s, %s, %s)',
                    ('admin', admin_email, password_hash, 1, 1)
                )
                logging.info("Utente admin creato con successo")
            elif not admin['is_admin'] or not admin['confirmed']:
                # Aggiorna l'admin se esiste ma non ha i permessi corretti
                cursor.execute(
                    'UPDATE users SET is_admin = 1, confirmed = 1 WHERE email = %s',
                    (admin_email,)
                )
                logging.info("Permessi admin aggiornati")
            
            # Aggiorna la password se necessario
            if admin and not check_password_hash(admin['password'], admin_password):
                new_password_hash = generate_password_hash(admin_password)
                cursor.execute(
                    'UPDATE users SET password = %s WHERE email = %s',
                    (new_password_hash, admin_email)
                )
                logging.info("Password admin aggiornata")
    except Exception as e:
        logging.error(f"Errore durante la verifica dell'admin: {str(e)}")

# Chiamata alla funzione all'avvio dell'app
ensure_admin_exists()

# Configurazione diversa in base all'ambiente
if is_pythonanywhere:
    # Configurazione per PythonAnywhere
    app.config['UPLOAD_FOLDER'] = config.get('PATHS_PYTHONANYWHERE', 'upload_folder')
    app.debug = config.getboolean('FLASK', 'debug_pythonanywhere')
    app.config['SERVER_NAME'] = config.get('PATHS_PYTHONANYWHERE', 'server_name')
    app.config['PREFERRED_URL_SCHEME'] = config.get('PATHS_PYTHONANYWHERE', 'url_scheme')
else:
    # Configurazione per ambiente locale
    app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), config.get('PATHS_LOCAL', 'upload_folder'))
    app.debug = config.getboolean('FLASK', 'debug_local')
    app.config['SERVER_NAME'] = config.get('PATHS_LOCAL', 'server_name')
    app.config['PREFERRED_URL_SCHEME'] = config.get('PATHS_LOCAL', 'url_scheme')

# Configura le estensioni consentite dal config.ini
allowed_extensions = config.get('SECURITY', 'allowed_extensions').split(',')
app.config['ALLOWED_EXTENSIONS'] = {ext.strip() for ext in allowed_extensions}

# Assicurati che la cartella per il caricamento delle immagini esista
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Inizializza LoginManager
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'
login_manager.login_message_category = "info"

# Inizializza il servizio email
email_service.init_app(app)

class User(UserMixin):
    def __init__(self, id, username, email, password, confirmed=False, profile_image=None, is_admin=False):
        self.id = id
        self.username = username
        self.email = email
        self.password = password
        self.confirmed = confirmed
        self.profile_image = profile_image
        self.is_admin = is_admin

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

@login_manager.user_loader
def load_user(user_id):
    try:
        with db_cursor(dictionary=True) as (cursor, conn):
            cursor.execute('SELECT * FROM users WHERE id = %s', (user_id,))
            user = cursor.fetchone()

        if user:
            return User(
                id=user['id'],
                username=user['username'],
                email=user['email'],
                password=user['password'],
                confirmed=user['confirmed'],
                profile_image=user.get('profile_image'),
                is_admin=user.get('is_admin', 0)
            )
    except Exception as e:
        logging.error(f"Errore durante il caricamento dell'utente: {str(e)}")
    return None

# Funzione per ottenere l'immagine del profilo corrente dell'utente
def get_profile_image(user_id):
    try:
        with db_cursor(dictionary=True) as (cursor, conn):
            cursor.execute('SELECT profile_image FROM users WHERE id = %s', (user_id,))
            result = cursor.fetchone()
            if result and result['profile_image']:
                return result['profile_image']
    except Exception as e:
        app.logger.error(f"Errore nel recupero dell'immagine del profilo: {str(e)}")
    return None

# Context processor per rendere disponibile l'immagine del profilo in tutti i template
@app.context_processor
def inject_profile_image():
    if current_user.is_authenticated:
        try:
            with db_cursor(dictionary=True) as (cursor, conn):
                cursor.execute('SELECT profile_image FROM users WHERE id = %s', (current_user.id,))
                result = cursor.fetchone()
                app.logger.info(f"Immagine profilo recuperata: {result}")
                
                if result and result['profile_image']:
                    # Percorso semplice senza manipolazioni complesse
                    image_path = result['profile_image']
                    app.logger.info(f"Percorso immagine: {image_path}")
                    return {'user_profile_image': image_path}
        except Exception as e:
            app.logger.error(f"Errore nel recupero dell'immagine del profilo: {str(e)}")
    return {'user_profile_image': None}

@app.route('/confirm/<token>')
def confirm_email(token):
    try:
        email = email_service.confirm_token(token)
        if email is None:
            flash('Il link di conferma è scaduto.', 'danger')
            return redirect(url_for('login'))

        with db_cursor(dictionary=True) as (cursor, conn):
            cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
            user = cursor.fetchone()
            if not user:
                flash('Utente non trovato.', 'danger')
                return redirect(url_for('login'))

            if user.get('confirmed'):
                message = 'Il tuo account è già stato confermato.'
                status = 'info'
            else:
                cursor.execute("UPDATE users SET confirmed = 1 WHERE email = %s", (email,))
                message = 'Il tuo account è stato confermato con successo!'
                status = 'success'

        return render_template('confirmation_result.html', message=message, status=status)
    except Exception as e:
        logging.error(f"Errore nella conferma dell'email: {str(e)}")
        message = 'Si è verificato un errore durante la conferma dell\'account.'
        status = 'danger'
        return render_template('confirmation_result.html', message=message, status=status)

@app.route('/forgot_password', methods=['GET', 'POST'])
def forgot_password():
    if request.method == 'POST':
        email = request.form.get('email')
        
        # Verifica se l'email esiste nel database
        with db_cursor(dictionary=True) as (cursor, conn):
            cursor.execute('SELECT * FROM users WHERE email = %s', (email,))
            user = cursor.fetchone()
            
            if user:
                try:
                    # Invia email con il link per reimpostare la password
                    email_service.send_password_reset_email(email)
                    return jsonify(success=True, message='Ti abbiamo inviato un\'email con le istruzioni per reimpostare la password. Controlla anche la cartella spam.')
                except Exception as e:
                    logging.error(f"Errore nell'invio dell'email di reset: {str(e)}")
                    return jsonify(success=False, message=f'Errore nell\'invio dell\'email: {str(e)}')
            else:
                # Per motivi di sicurezza, non rivelare se l'email esiste o meno
                return jsonify(success=True, message='Se l\'email è registrata, riceverai le istruzioni per reimpostare la password.')
    
    return render_template('forgot_password.html')

@app.route('/reset_password/<token>', methods=['GET', 'POST'])
def reset_password(token):
    try:
        email = email_service.confirm_token(token)
        if email is None:
            flash('Il link per il reset della password è scaduto. Richiedi un nuovo link.', 'danger')
            return redirect(url_for('forgot_password'))
    except Exception as e:
        flash('Token non valido o errore. Richiedi un nuovo link.', 'danger')
        return redirect(url_for('forgot_password'))

    if request.method == 'POST':
        password = request.form.get('password')
        confirm_password = request.form.get('confirm_password')
        
        if password != confirm_password:
            flash('Le password non corrispondono.', 'danger')
            return render_template('reset_password.html', token=token)
        
        # Aggiorna la password nel database
        password_hash = generate_password_hash(password)
        
        try:
            with db_cursor() as (cursor, conn):
                cursor.execute('UPDATE users SET password = %s WHERE email = %s', (password_hash, email))
                
            flash('La tua password è stata reimpostata con successo! Ora puoi accedere.', 'success')
            return redirect(url_for('login'))
        except Exception as e:
            logging.error(f"Errore nel reset della password: {str(e)}")
            flash(f'Si è verificato un errore: {str(e)}', 'danger')
            return render_template('reset_password.html', token=token)
    
    return render_template('reset_password.html', token=token)

@app.route('/')
def index():
    with db_cursor(dictionary=True) as (cursor, conn):
        cursor.execute('''
            SELECT cars.*, COALESCE(AVG(reviews.rating), 0) as avg_rating
            FROM cars
            LEFT JOIN reviews ON cars.id = reviews.car_id
            GROUP BY cars.id
        ''')
        cars = cursor.fetchall()
    return render_template('index.html', cars=cars)


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']

        try:
            with db_cursor(dictionary=True) as (cursor, conn):
                cursor.execute('SELECT * FROM users WHERE email = %s', (email,))
                user = cursor.fetchone()

            if user and check_password_hash(user['password'], password):
                # Se è l'admin, ignora il controllo della conferma
                if not user.get('is_admin', 0) and not user['confirmed']:
                    return jsonify(success=False, message='Per favore conferma il tuo account via email prima di accedere')

                # Forza conferma e permessi admin se è l'admin
                admin_email = os.getenv('ADMIN_EMAIL')
                if email == admin_email:
                    with db_cursor() as (cursor, conn):
                        cursor.execute('UPDATE users SET confirmed = 1, is_admin = 1 WHERE email = %s', (email,))
                
                user_obj = User(
                    id=user['id'],
                    username=user['username'],
                    email=user['email'],
                    password=user['password'],
                    confirmed=user['confirmed'] or email == admin_email,
                    profile_image=user.get('profile_image'),
                    is_admin=user.get('is_admin', 0) or email == admin_email
                )
                login_user(user_obj)
                next_page = request.form.get('next')
                return jsonify(success=True, next=next_page or url_for('index'))
            else:
                return jsonify(success=False, message='Credenziali non valide')
        except Exception as e:
            logging.error(f"Errore durante il login: {str(e)}")
            return jsonify(success=False, message=f'Si è verificato un errore durante il login: {str(e)}')

    return render_template('login.html')


@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        password_hash = generate_password_hash(password)

        try:
            # Aggiungi l'utente al database
            with db_cursor() as (cursor, conn):
                cursor.execute("INSERT INTO users (username, email, password) VALUES (%s, %s, %s)", (username, email, password_hash))

            # Invia l'email di conferma usando il nuovo servizio
            email_service.send_confirmation_email(email)

            return jsonify(success=True, message='Registrazione avvenuta con successo! Controlla la tua email per confermare il tuo account, se non vedi nessuna email controlla pure nella spam.')
        except IntegrityError:
            return jsonify(success=False, message='L\'email è già associata a un account. Per favore, usa un\'altra email.')

    return render_template('register.html')

@app.route('/car/<int:car_id>')
def car_detail(car_id):
    with db_cursor(dictionary=True) as (cursor, conn):
        cursor.execute('SELECT * FROM cars WHERE id = %s', (car_id,))
        car = cursor.fetchone()
    with db_cursor(dictionary=True) as (cursor, conn):
        cursor.execute('SELECT image FROM car_images WHERE car_id = %s', (car_id,))
        images = cursor.fetchall()
    with db_cursor(dictionary=True) as (cursor, conn):
        cursor.execute('SELECT AVG(rating) as avg_rating, COUNT(*) as review_count FROM reviews WHERE car_id = %s', (car_id,))
        rating_data = cursor.fetchone()
    avg_rating = float(rating_data['avg_rating']) if rating_data['avg_rating'] is not None else 0.0
    review_count = rating_data['review_count'] or 0
    with db_cursor(dictionary=True) as (cursor, conn):
        cursor.execute('''SELECT r.*, u.username, u.profile_image FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.car_id = %s ORDER BY r.created_at DESC''', (car_id,))
        reviews = cursor.fetchall()
    user_review = None
    if current_user.is_authenticated:
        with db_cursor(dictionary=True) as (cursor, conn):
            cursor.execute('SELECT * FROM reviews WHERE car_id = %s AND user_id = %s', (car_id, current_user.id))
            user_review = cursor.fetchone()
    if car:
        car['images'] = [img['image'] for img in images]
    is_favorite = False
    if current_user.is_authenticated:
        with db_cursor() as (cursor, conn):
            cursor.execute('SELECT * FROM favorites WHERE user_id = %s AND car_id = %s', (current_user.id, car_id))
            is_favorite = cursor.fetchone() is not None
    # GESTIONE AJAX
    if request.args.get('ajax') == '1':
        return render_template('_car_reviews.html', car=car, is_favorite=is_favorite, avg_rating=avg_rating, review_count=review_count, reviews=reviews, user_review=user_review)
    return render_template('car_detail.html', car=car, is_favorite=is_favorite, avg_rating=avg_rating, review_count=review_count, reviews=reviews, user_review=user_review)


@app.route('/add_review/<int:car_id>', methods=['POST'])
@login_required
def add_review(car_id):
    try:
        rating = int(request.form.get('rating', 0))
        comment = request.form.get('comment', '').strip()
        if rating < 1 or rating > 5:
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return jsonify(success=False, message='La valutazione deve essere tra 1 e 5')
            flash('La valutazione deve essere tra 1 e 5', 'danger')
            return redirect(url_for('car_detail', car_id=car_id) + '#reviewsList')
        with db_cursor() as (cursor, conn):
            cursor.execute('SELECT id FROM reviews WHERE user_id = %s AND car_id = %s', (current_user.id, car_id))
            existing = cursor.fetchone()
            if existing:
                cursor.execute('UPDATE reviews SET rating = %s, comment = %s, created_at = CURRENT_TIMESTAMP WHERE user_id = %s AND car_id = %s', (rating, comment, current_user.id, car_id))
                msg = 'Recensione aggiornata!'
            else:
                cursor.execute('INSERT INTO reviews (car_id, user_id, rating, comment) VALUES (%s, %s, %s, %s)', (car_id, current_user.id, rating, comment))
                msg = 'Recensione aggiunta!'
            conn.commit()
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify(success=True, message=msg)
        flash(msg, 'success')
        return redirect(url_for('car_detail', car_id=car_id) + '#reviewsList')
    except Exception as e:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify(success=False, message=f'Errore: {str(e)}')
        flash(f'Errore: {str(e)}', 'danger')
        return redirect(url_for('car_detail', car_id=car_id) + '#reviewsList')

@app.route('/edit_review/<int:review_id>', methods=['POST'])
@login_required
def edit_review(review_id):
    car_id = request.args.get('car_id', type=int)
    try:
        with db_cursor(dictionary=True) as (cursor, conn):
            cursor.execute('SELECT * FROM reviews WHERE id = %s', (review_id,))
            review = cursor.fetchone()
            if not review:
                flash('Recensione non trovata', 'danger')
                if car_id:
                    return redirect(url_for('car_detail', car_id=car_id) + '#reviewsList')
                return redirect(url_for('index'))
            if review['user_id'] != current_user.id and not current_user.is_admin:
                flash('Non hai il permesso di modificare questa recensione', 'danger')
                return redirect(url_for('car_detail', car_id=review['car_id']) + '#reviewsList')
            # Recupera i nuovi dati dal form (rating e comment)
            rating = int(request.form.get('rating', 0))
            comment = request.form.get('comment', '').strip()
            if rating < 1 or rating > 5:
                flash('La valutazione deve essere tra 1 e 5', 'danger')
                return redirect(url_for('car_detail', car_id=review['car_id']) + '#reviewsList')
            cursor.execute('UPDATE reviews SET rating = %s, comment = %s, created_at = CURRENT_TIMESTAMP WHERE id = %s', (rating, comment, review_id))
            conn.commit()
            flash('Recensione aggiornata!', 'success')
            return redirect(url_for('car_detail', car_id=review['car_id']) + '#reviewsList')
    except Exception as e:
        flash(f'Errore: {str(e)}', 'danger')
        if car_id:
            return redirect(url_for('car_detail', car_id=car_id) + '#reviewsList')
        return redirect(url_for('index'))

@app.route('/delete_review/<int:review_id>', methods=['POST'])
@login_required
def delete_review(review_id):
    car_id = request.args.get('car_id', type=int)
    try:
        with db_cursor(dictionary=True) as (cursor, conn):
            cursor.execute('SELECT * FROM reviews WHERE id = %s', (review_id,))
            review = cursor.fetchone()
            if not review:
                if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                    return jsonify(success=False, message='Recensione non trovata')
                flash('Recensione non trovata', 'danger')
                if car_id:
                    return redirect(url_for('car_detail', car_id=car_id) + '#reviewsList')
                return redirect(url_for('index'))
            if review['user_id'] != current_user.id and not current_user.is_admin:
                if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                    return jsonify(success=False, message='Non hai il permesso di eliminare questa recensione')
                flash('Non hai il permesso di eliminare questa recensione', 'danger')
                return redirect(url_for('car_detail', car_id=review['car_id']) + '#reviewsList')
            car_id = review['car_id']
            cursor.execute('DELETE FROM reviews WHERE id = %s', (review_id,))
            conn.commit()
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify(success=True, message='Recensione eliminata')
        flash('Recensione eliminata', 'success')
        return redirect(url_for('car_detail', car_id=car_id) + '#reviewsList')
    except Exception as e:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify(success=False, message=f'Errore: {str(e)}')
        flash(f'Errore: {str(e)}', 'danger')
        if car_id:
            return redirect(url_for('car_detail', car_id=car_id) + '#reviewsList')
        return redirect(url_for('index'))


@app.route('/favorites')
@login_required
def favorites():
    user_id = current_user.id
    with db_cursor(dictionary=True) as (cursor, conn):
        cursor.execute('''
            SELECT cars.*, COALESCE(AVG(reviews.rating), 0) as avg_rating
            FROM favorites 
            JOIN cars ON favorites.car_id = cars.id 
            LEFT JOIN reviews ON cars.id = reviews.car_id
            WHERE favorites.user_id = %s
            GROUP BY cars.id
        ''', (user_id,))
        favorite_cars = cursor.fetchall()
    return render_template('favorites.html', cars=favorite_cars)

@app.route('/add_to_favorites/<int:car_id>', methods=['POST'])
@login_required
def add_to_favorites(car_id):
    user_id = current_user.id
    try:
        with db_cursor() as (cursor, conn):
            # Verifica se l'auto è già nei preferiti
            cursor.execute('SELECT * FROM favorites WHERE user_id = %s AND car_id = %s', (user_id, car_id))
            if cursor.fetchone():
                # Se è una richiesta AJAX, restituisci JSON
                if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                    return jsonify(success=True, message='Auto già presente nei preferiti!')
                flash('Auto già presente nei preferiti!', 'info')
            else:
                # Aggiunge l'auto ai preferiti
                cursor.execute('INSERT INTO favorites (user_id, car_id) VALUES (%s, %s)', (user_id, car_id))
                # Se è una richiesta AJAX, restituisci JSON
                if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                    return jsonify(success=True, message='Auto aggiunta ai preferiti!')
                flash('Auto aggiunta ai preferiti!', 'success')
    except Exception as e:
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify(success=False, message=f'Errore: {str(e)}')
        flash(f'Errore: {str(e)}', 'danger')

    # Se non è una richiesta AJAX, reindirizza
    return redirect(request.referrer or url_for('index'))


@app.route('/remove_from_favorites/<int:car_id>', methods=['POST'])
@login_required
def remove_from_favorites(car_id):
    user_id = current_user.id
    try:
        with db_cursor() as (cursor, conn):
            cursor.execute('DELETE FROM favorites WHERE user_id = %s AND car_id = %s', (user_id, car_id))
            
            # Se è una richiesta AJAX, restituisci JSON
            if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                return jsonify(success=True, message='Auto rimossa dai preferiti!')
            
            flash('Auto rimossa dai preferiti.', 'info')
    except Exception as e:
        # Se è una richiesta AJAX, restituisci errore JSON
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return jsonify(success=False, message=f'Errore: {str(e)}')
            
        flash(f'Errore: {str(e)}', 'danger')

    # Solo per richieste non-AJAX, reindirizza
    return redirect(request.referrer or url_for('index'))


@app.route('/is_favorite/<int:car_id>', methods=['GET'])
@login_required
def is_favorite(car_id):
    user_id = current_user.id

    try:
        with db_cursor() as (cursor, conn):
            cursor.execute('SELECT * FROM favorites WHERE user_id = %s AND car_id = %s', (user_id, car_id))
            is_favorite = cursor.fetchone() is not None
            return jsonify(success=True, is_favorite=is_favorite), 200
    except Exception as e:
        return jsonify(success=False, message=f'Errore: {str(e)}'), 500

@app.route('/search', methods=['GET', 'POST'])
def search():
    query = request.args.get('query', '')

    if not query:
        return render_template('search.html', cars=[])

    # Usa il carattere % per la ricerca parziale
    search_term = f'%{query}%'

    try:
        with db_cursor(dictionary=True) as (cursor, conn):
            # Cerca corrispondenze in vari campi
            cursor.execute(
                'SELECT * FROM cars WHERE brand LIKE %s OR model LIKE %s OR car_type LIKE %s',
                (search_term, search_term, search_term)
            )
            cars = cursor.fetchall()

        return render_template('search.html', cars=cars, query=query)
    except Exception as e:
        flash(f'Errore nella ricerca: {str(e)}', 'danger')
        return render_template('search.html', cars=[], query=query)


@app.route('/api/search')
def api_search():
    query = request.args.get('query', '')
    start_with = request.args.get('start_with', 'false').lower() == 'true'

    if not query:
        return jsonify({"cars": []})

    # Se start_with è true, cerca solo all'inizio dei campi (senza % all'inizio)
    # altrimenti usa la corrispondenza parziale ovunque nel campo
    search_term = f'{query}%' if start_with else f'%{query}%'

    try:
        with db_cursor(dictionary=True) as (cursor, conn):
            # Cerca corrispondenze solo in brand, model e name
            cursor.execute(
                'SELECT * FROM cars WHERE brand LIKE %s OR model LIKE %s OR name LIKE %s',
                (search_term, search_term, search_term)
            )
            cars = cursor.fetchall()

        # Assicurati che i risultati siano serializzabili in JSON
        safe_cars = []
        for car in cars:
            # Converti tutti i valori che potrebbero non essere JSON serializzabili
            safe_car = {}
            for key, value in car.items():
                if isinstance(value, (int, str, float, bool, type(None))):
                    safe_car[key] = value
                else:
                    # Converti altri tipi in stringhe
                    safe_car[key] = str(value)
            safe_cars.append(safe_car)

        return jsonify({"cars": safe_cars})
    except Exception as e:
        logging.error(f"Errore API ricerca: {str(e)}")
        return jsonify({"error": str(e), "cars": []}), 500


@app.route('/profile', methods=['GET', 'POST'])
@login_required
def profile():
    # Log per debug
    app.logger.info(f"Cartella upload: {app.config['UPLOAD_FOLDER']}")
    app.logger.info(f"Cartella esiste: {os.path.exists(app.config['UPLOAD_FOLDER'])}")

    if request.method == 'POST':
        # Controlla se è una richiesta di aggiornamento immagine
        if 'profile_image' in request.files:
            file = request.files['profile_image']
            app.logger.info(f"File ricevuto: {file.filename}")

            # Verifica che il file esista e sia valido
            if file and file.filename != '':
                if allowed_file(file.filename):
                    try:
                        # Genera un nome di file sicuro e univoco
                        filename = secure_filename(file.filename)
                        file_ext = os.path.splitext(filename)[1]
                        unique_filename = f"{current_user.id}_{uuid.uuid4().hex[:8]}{file_ext}"

                        # Assicurati che la cartella esista
                        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

                        # Percorso completo del file
                        file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
                        app.logger.info(f"Percorso file: {file_path}")

                        # Salva il file
                        file.save(file_path)
                        app.logger.info(f"File salvato in: {file_path}")

                        # Verifica che il file sia stato effettivamente salvato
                        if os.path.exists(file_path):
                            app.logger.info(f"File trovato nel percorso: {file_path}")
                        else:
                            app.logger.error(f"File NON trovato nel percorso: {file_path}")

                        # Percorso relativo per il database
                        relative_path = f"profile_images/{unique_filename}"

                        # Aggiorna il database
                        with db_cursor() as (cursor, conn):
                            cursor.execute('UPDATE users SET profile_image = %s WHERE id = %s',
                                          (relative_path, current_user.id))
                            conn.commit()
                            app.logger.info(f"Database aggiornato per l'utente {current_user.id} con path: {relative_path}")

                        # Verifica che il percorso sia stato salvato nel database
                        with db_cursor(dictionary=True) as (cursor, conn):
                            cursor.execute('SELECT profile_image FROM users WHERE id = %s', (current_user.id,))
                            result = cursor.fetchone()
                            app.logger.info(f"Immagine nel database: {result}")

                        return jsonify(success=True, message='Immagine del profilo aggiornata!', image_path=relative_path)

                    except Exception as e:
                        app.logger.error(f"Errore nel salvataggio dell'immagine: {str(e)}")
                        app.logger.error(f"Dettagli errore: {type(e).__name__}")
                        import traceback
                        app.logger.error(traceback.format_exc())
                        return jsonify(success=False, message=f'Errore nel salvataggio dell\'immagine: {str(e)}')
                else:
                    app.logger.warning(f"Tipo di file non supportato: {file.filename}")
                    return jsonify(success=False, message='Tipo di file non supportato. Utilizza .png, .jpg, .jpeg o .gif')
            else:
                app.logger.warning("Nessun file selezionato")
                return jsonify(success=False, message='Nessun file selezionato')

        try:
            username = request.form['username']
            email = request.form['email']

            with db_cursor() as (cursor, conn):
                # Verifica se il username è disponibile
                cursor.execute('SELECT id FROM users WHERE username = %s AND id != %s', (username, current_user.id))
                if cursor.fetchone():
                    return jsonify(success=False, message='Username già in uso')

                # Verifica se l'email è disponibile
                cursor.execute('SELECT id FROM users WHERE email = %s AND id != %s', (email, current_user.id))
                if cursor.fetchone():
                    return jsonify(success=False, message='Email già in uso')

                # Aggiorna i dati dell'utente
                cursor.execute('UPDATE users SET username = %s, email = %s WHERE id = %s',
                              (username, email, current_user.id))

            # Aggiorna l'oggetto current_user
            current_user.username = username
            current_user.email = email

            return jsonify(success=True, message='Profilo aggiornato con successo!')
        except Exception as e:
            return jsonify(success=False, message=f'Errore: {str(e)}')

    return render_template('profile.html', user=current_user)


@app.route('/change_password', methods=['POST'])
@login_required
def change_password():
    try:
        current_password = request.form['current_password']
        new_password = request.form['new_password']
        confirm_password = request.form['confirm_password']

        # Verifica che la nuova password e la conferma corrispondano
        if new_password != confirm_password:
            return jsonify(success=False, message='Le password non coincidono.')

        with db_cursor(dictionary=True) as (cursor, conn):
            cursor.execute('SELECT password FROM users WHERE id = %s', (current_user.id,))
            user = cursor.fetchone()
            if not user or not check_password_hash(user['password'], current_password):
                return jsonify(success=False, message='Password attuale sbagliata.')
            if check_password_hash(user['password'], new_password):
                return jsonify(success=False, message='La nuova password non può essere uguale a quella attuale.')
            # Aggiorna la password
            new_password_hash = generate_password_hash(new_password)
            cursor.execute('UPDATE users SET password = %s WHERE id = %s', (new_password_hash, current_user.id))
            conn.commit()
        return jsonify(success=True, message='Password modificata con successo!')
    except Exception as e:
        return jsonify(success=False, message=f'Errore: {str(e)}')

@app.route('/logout')
def logout():
    logout_user()
    flash("Logout eseguito!", category="auth")
    return redirect(url_for('index'))

# Decoratore per proteggere le rotte admin
def admin_required(f):
    @login_required
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_admin:
            flash("Accesso non autorizzato. È richiesto un account amministratore.", "danger")
            return redirect(url_for('index'))
        return f(*args, **kwargs)
    return decorated_function

# Rotte di amministrazione
@app.route('/admin')
@admin_required
def admin_dashboard():
    with db_cursor(dictionary=True) as (cursor, conn):
        cursor.execute('SELECT * FROM cars')
        cars = cursor.fetchall()
    return render_template('admin/dashboard.html', cars=cars)


@app.route('/admin/car/add', methods=['GET', 'POST'])
@admin_required
def admin_add_car():
    if request.method == 'POST':
        try:
            # Ottieni i dati della macchina dal form
            name = request.form['name']
            small_description = request.form['small_description']
            description = request.form['description']
            brand = request.form['brand']
            model = request.form['model']
            year = request.form['year']
            engine = request.form['engine']
            car_type = request.form['car_type']
            main_image_url = request.form.get('main_image_url', '')
            
            if not main_image_url:
                flash('URL dell\'immagine principale mancante', 'danger')
                return redirect(url_for('admin_add_car'))
            
            with db_cursor() as (cursor, conn):
                cursor.execute('''
                    INSERT INTO cars (name, small_description, description, image, brand, model, year, engine, car_type)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                ''', (name, small_description, description, main_image_url, brand, model, year, engine, car_type))
                
                car_id = cursor.lastrowid
                
                # Gestisci le immagini aggiuntive
                additional_image_urls = request.form.getlist('additional_image_urls[]')
                for img_url in additional_image_urls:
                    if img_url and img_url.strip():
                        cursor.execute('INSERT INTO car_images (car_id, image) VALUES (%s, %s)', 
                                     (car_id, img_url.strip()))
                conn.commit()
            
            flash('Auto aggiunta con successo!', 'success')
            return redirect(url_for('admin_dashboard'))
            
        except Exception as e:
            flash(f'Errore: {str(e)}', 'danger')
            return redirect(url_for('admin_add_car'))
            
    return render_template('admin/add_car.html')

@app.route('/admin/car/edit/<int:car_id>', methods=['GET', 'POST'])
@admin_required
def admin_edit_car(car_id):
    # Ottieni i dati dell'auto esistente
    with db_cursor(dictionary=True) as (cursor, conn):
        cursor.execute('SELECT * FROM cars WHERE id = %s', (car_id,))
        car = cursor.fetchone()
        cursor.execute('SELECT * FROM car_images WHERE car_id = %s', (car_id,))
        additional_images = cursor.fetchall()

    if not car:
        flash('Auto non trovata', 'danger')
        return redirect(url_for('admin_dashboard'))

    if request.method == 'POST':
        try:
            # Ottieni i dati aggiornati dal form
            name = request.form.get('name')
            small_description = request.form.get('small_description')
            description = request.form.get('description')
            brand = request.form.get('brand')
            model = request.form.get('model')
            year = request.form.get('year')
            engine = request.form.get('engine')
            car_type = request.form.get('car_type')
            main_image_url = request.form.get('main_image_url')

            # Aggiorna l'auto nel database
            with db_cursor() as (cursor, conn):
                cursor.execute('''
                    UPDATE cars SET name = %s, small_description = %s, description = %s,
                    image = %s, brand = %s, model = %s, year = %s, engine = %s, car_type = %s WHERE id = %s
                ''', (name, small_description, description, main_image_url,
                      brand, model, year, engine, car_type, car_id))

                # Elimina immagini selezionate
                image_ids_to_delete = request.form.getlist('delete_image')
                if image_ids_to_delete:
                    format_strings = ','.join(['%s'] * len(image_ids_to_delete))
                    cursor.execute(f"DELETE FROM car_images WHERE id IN ({format_strings})", tuple(image_ids_to_delete))

                # Aggiungi nuove immagini
                additional_image_urls = request.form.getlist('additional_image_urls[]')
                for img_url in additional_image_urls:
                    if img_url.strip():
                        cursor.execute('INSERT INTO car_images (car_id, image) VALUES (%s, %s)', (car_id, img_url.strip()))

                conn.commit()

            flash('Auto aggiornata con successo!', 'success')
            return redirect(url_for('admin_dashboard'))

        except Exception as e:
            app.logger.error(f"Errore nell'aggiornamento dell'auto: {str(e)}")
            import traceback
            app.logger.error(traceback.format_exc())
            flash('Errore durante l\'aggiornamento', 'danger')

    return render_template('admin/edit_car.html', car=car, additional_images=additional_images)



@app.route('/admin/car/delete/<int:car_id>', methods=['POST'])
@admin_required
def admin_delete_car(car_id):
    try:
        with db_cursor() as (cursor, conn):
            # Prima elimina le immagini aggiuntive
            cursor.execute('DELETE FROM car_images WHERE car_id = %s', (car_id,))
            # Poi elimina i possibili preferiti
            cursor.execute('DELETE FROM favorites WHERE car_id = %s', (car_id,))
            # Infine elimina l'auto
            cursor.execute('DELETE FROM cars WHERE id = %s', (car_id,))
            
        return jsonify(success=True, message='Auto eliminata con successo!')
    except Exception as e:
        app.logger.error(f"Errore nell'eliminazione dell'auto: {str(e)}")
        return jsonify(success=False, message=f'Errore: {str(e)}')

@app.route('/admin/car/update_image/<int:car_id>', methods=['POST'])
@admin_required
def admin_update_car_image(car_id):
    try:
        image_url = request.form.get('image_url', '').strip()
        if not image_url:
            return jsonify(success=False, message='URL dell\'immagine mancante')
        
        with db_cursor() as (cursor, conn):
            cursor.execute('UPDATE cars SET image = %s WHERE id = %s', (image_url, car_id))
            conn.commit()
            
        return jsonify(success=True, message='Immagine aggiornata con successo!', image_url=image_url)
        
    except Exception as e:
        app.logger.error(f"Errore nell'aggiornamento dell'immagine: {str(e)}")
        import traceback
        app.logger.error(f"Traceback completo: {traceback.format_exc()}")
        return jsonify(success=False, message=f'Errore: {str(e)}')

@app.route('/api/favorites/count')
@login_required
def api_favorites_count():
    user_id = current_user.id
    try:
        with db_cursor(dictionary=True) as (cursor, conn):
            cursor.execute('SELECT COUNT(*) as count FROM favorites WHERE user_id = %s', (user_id,))
            result = cursor.fetchone()
            count = result['count'] if result else 0
            return jsonify({"success": True, "count": count})
    except Exception as e:
        logging.error(f"Errore nel conteggio dei preferiti: {str(e)}")
        return jsonify({"success": False, "count": 0, "error": str(e)}), 500

if __name__ == '__main__':
    app.run(host=config.get('FLASK', 'host'))