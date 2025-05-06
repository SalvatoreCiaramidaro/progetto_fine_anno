from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from flask_login import LoginManager, UserMixin, login_user, logout_user, current_user, login_required
import logging
from urllib.parse import urlparse, urljoin
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from mysql.connector.errors import IntegrityError
import os
import uuid
import sys

# Importazioni dai moduli personalizzati
from db_config import db_cursor
from email_service import email_service

# Rileva l'ambiente di esecuzione
is_pythonanywhere = 'PYTHONANYWHERE_SITE' in os.environ

logging.basicConfig(level=logging.INFO)

app = Flask(__name__)
app.secret_key = 'your_secret_key'
app.config['SECURITY_PASSWORD_SALT'] = 'your_security_password_salt'

# Configurazione diversa in base all'ambiente
if is_pythonanywhere:
    # Configurazione per PythonAnywhere
    app.config['UPLOAD_FOLDER'] = '/home/Ciaramid06/progetto_fine_anno/static/profile_images'
    app.debug = False
else:
    # Configurazione per ambiente locale
    app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static/profile_images')
    app.debug = True

app.config['ALLOWED_EXTENSIONS'] = {'png', 'jpg', 'jpeg', 'gif','svg'}

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
    def __init__(self, id, username, email, password, confirmed=False, profile_image=None):
        self.id = id
        self.username = username
        self.email = email
        self.password = password
        self.confirmed = confirmed
        self.profile_image = profile_image

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
                profile_image=user.get('profile_image')
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
    # Verifica la validità del token
    email = email_service.confirm_token(token)
    
    if email is None:
        flash('Il link per reimpostare la password è scaduto o non è valido.', 'danger')
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
        cursor.execute('SELECT * FROM cars')
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
                if not user['confirmed']:
                    return jsonify(success=False, message='Per favore conferma il tuo account via email prima di accedere')

                user_obj = User(
                    id=user['id'],
                    username=user['username'],
                    email=user['email'],
                    password=user['password'],
                    confirmed=user['confirmed'],
                    profile_image=user.get('profile_image')
                )
                login_user(user_obj)
                next_page = request.form.get('next')
                return jsonify(success=True, next=next_page or url_for('index'))
            else:
                return jsonify(success=False, message='Credenziali non valide')
        except Exception as e:
            logging.error(f"Errore durante il login: {str(e)}")
            return jsonify(success=False, message='Si è verificato un errore durante il login')

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
        # Ottieni i dettagli della macchina
        cursor.execute('SELECT * FROM cars WHERE id = %s', (car_id,))
        car = cursor.fetchone()

        # Ottieni le immagini extra dalla tabella 'car_images'
        cursor.execute('SELECT image FROM car_images WHERE car_id = %s', (car_id,))
        images = cursor.fetchall()

    if car:
        # Converti in lista semplice di link
        car['images'] = [img['image'] for img in images]

    # Controllo se la macchina è già nei preferiti
    is_favorite = False
    if current_user.is_authenticated:
        with db_cursor() as (cursor, conn):
            cursor.execute('SELECT * FROM favorites WHERE user_id = %s AND car_id = %s', (current_user.id, car_id))
            if cursor.fetchone():
                is_favorite = True

    return render_template('car_detail.html', car=car, is_favorite=is_favorite)



@app.route('/favorites')
@login_required
def favorites():
    user_id = current_user.id
    with db_cursor(dictionary=True) as (cursor, conn):
        cursor.execute('SELECT cars.* FROM favorites JOIN cars ON favorites.car_id = cars.id WHERE favorites.user_id = %s', (user_id,))
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
                flash('Auto già presente nei preferiti!', 'info')
            else:
                # Aggiunge l'auto ai preferiti
                cursor.execute('INSERT INTO favorites (user_id, car_id) VALUES (%s, %s)', (user_id, car_id))
                flash('Auto aggiunta ai preferiti!', 'success')
    except Exception as e:
        flash(f'Errore: {str(e)}', 'danger')

    return redirect(request.referrer or url_for('index'))


@app.route('/remove_from_favorites/<int:car_id>', methods=['POST'])
@login_required
def remove_from_favorites(car_id):
    user_id = current_user.id
    try:
        with db_cursor() as (cursor, conn):
            cursor.execute('DELETE FROM favorites WHERE user_id = %s AND car_id = %s', (user_id, car_id))
            flash('Auto rimossa dai preferiti.', 'info')
    except Exception as e:
        flash(f'Errore: {str(e)}', 'danger')

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
            return jsonify(success=False, message='La nuova password e la conferma non corrispondono')

        with db_cursor(dictionary=True) as (cursor, conn):
            # Ottieni la password attuale dell'utente
            cursor.execute('SELECT password FROM users WHERE id = %s', (current_user.id,))
            user_data = cursor.fetchone()

            if not check_password_hash(user_data['password'], current_password):
                return jsonify(success=False, message='Password attuale non corretta')

            # Aggiorna la password
            new_password_hash = generate_password_hash(new_password)
            cursor.execute('UPDATE users SET password = %s WHERE id = %s', (new_password_hash, current_user.id))

        return jsonify(success=True, message='Password modificata con successo!')
    except Exception as e:
        return jsonify(success=False, message=f'Errore: {str(e)}')

@app.route('/logout')
def logout():
    logout_user()
    flash("Logout eseguito!", category="auth")
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(host='0.0.0.0')