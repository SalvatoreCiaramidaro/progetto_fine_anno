from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from flask_login import LoginManager, UserMixin, login_user, logout_user, current_user, login_required
import logging
from urllib.parse import urlparse, urljoin
from flask_mail import Mail, Message
from itsdangerous import URLSafeTimedSerializer, SignatureExpired
from werkzeug.security import generate_password_hash, check_password_hash
from mysql.connector.errors import IntegrityError
from db_config import db_cursor  # Importazione del context manager dal nuovo modulo

logging.basicConfig(level=logging.INFO)

app = Flask(__name__)
app.secret_key = 'your_secret_key'
app.config['SECURITY_PASSWORD_SALT'] = 'your_security_password_salt'
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'
login_manager.login_message_category = "info"  # Per mostrare un messaggio di avviso

class User(UserMixin):
    def __init__(self, id, username, email, password, confirmed=False):
        self.id = id
        self.username = username
        self.email = email
        self.password = password
        self.confirmed = confirmed

# Configura Flask-Mail
app.config['MAIL_SERVER'] = 'smtp.gmail.com'  # Usa il server SMTP di Gmail o un altro
app.config['MAIL_PORT'] = 465
app.config['MAIL_USE_SSL'] = True
app.config['MAIL_USERNAME'] = 'stefaniagitto71@gmail.com'
app.config['MAIL_PASSWORD'] = 'gkry vbeu brft vuue'
app.config['MAIL_DEFAULT_SENDER'] = 'wikisportcars@gmail.com'

mail = Mail(app)

# Funzione per generare un link di conferma
def generate_confirmation_token(email):
    serializer = URLSafeTimedSerializer(app.secret_key)
    return serializer.dumps(email, salt=app.config['SECURITY_PASSWORD_SALT'])

# Funzione per inviare l'email di conferma
def send_confirmation_email(user_email):
    token = generate_confirmation_token(user_email)
    confirm_url = url_for('confirm_email', token=token, _external=True)
    html = f'<p>Per confermare il tuo account, clicca <a href="{confirm_url}">qui</a></p>'
    msg = Message('Conferma il tuo account', recipients=[user_email], html=html)
    mail.send(msg)

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
                confirmed=user['confirmed']
            )
    except Exception as e:
        logging.error(f"Errore durante il caricamento dell'utente: {str(e)}")
    return None


@app.route('/confirm/<token>')
def confirm_email(token):
    try:
        serializer = URLSafeTimedSerializer(app.secret_key)
        email = serializer.loads(token, salt=app.config['SECURITY_PASSWORD_SALT'], max_age=3600)  # Link valido per 1 ora
    except SignatureExpired:
        flash('Il link di conferma è scaduto.', 'danger')
        return redirect(url_for('register'))
    
    with db_cursor(dictionary=True) as (cursor, conn):
        cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
        user = cursor.fetchone()
        if not user:
            flash('Utente non trovato.', 'danger')
            return redirect(url_for('register'))
        
        if user.get('confirmed'):
            flash('Il tuo account è già stato confermato.', 'info')
        else:
            cursor.execute("UPDATE users SET confirmed = 1 WHERE email = %s", (email,))
            flash('Il tuo account è stato confermato con successo!', 'success')
    
    return redirect(url_for('login'))

@app.route('/')
def index():
    with db_cursor(dictionary=True) as (cursor, conn):
        cursor.execute('SELECT * FROM cars')
        cars = cursor.fetchall()
    return render_template('index.html', cars=cars)


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        try:
            with db_cursor(dictionary=True) as (cursor, conn):
                cursor.execute('SELECT * FROM users WHERE username = %s', (username,))
                user = cursor.fetchone()
            
            if user and check_password_hash(user['password'], password):
                if not user['confirmed']:
                    return jsonify(success=False, message='Per favore conferma il tuo account via email prima di accedere')
                
                user_obj = User(
                    id=user['id'], 
                    username=user['username'], 
                    email=user['email'], 
                    password=user['password'], 
                    confirmed=user['confirmed']
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

            # Invia l'email di conferma
            send_confirmation_email(email)

            return jsonify(success=True, message='Registrazione avvenuta con successo! Controlla la tua email per confermare il tuo account.')
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


@app.route('/profile', methods=['GET', 'POST'])
@login_required
def profile():
    if request.method == 'POST':
        # Aggiorna il profilo dell'utente
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
    app.run(debug=True, host='0.0.0.0')
