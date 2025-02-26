from flask import Flask, render_template, request, redirect, url_for, flash, session,jsonify
from flask_login import LoginManager, UserMixin, login_user, logout_user, current_user, login_required
import mysql.connector
import logging
from urllib.parse import urlparse, urljoin
from flask_mail import Mail, Message
from itsdangerous import URLSafeTimedSerializer, SignatureExpired




logging.basicConfig(level=logging.INFO)

app = Flask(__name__)
app.secret_key = 'your_secret_key'
app.config['SECURITY_PASSWORD_SALT'] = 'your_security_password_salt'
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'
login_manager.login_message_category = "info"  # Per mostrare un messaggio di avviso

# Removed SQLAlchemy initialization.
# All database interactions now use mysql.connector for MariaDB.

# Configurazione per la connessione al database con MariaDB
db_config = {
    "user": "root",
    "password": "x",
    "host": "localhost",
    "database": "wikisportcars",
}

def get_db_connection():
    return mysql.connector.connect(**db_config)

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
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute('SELECT * FROM users WHERE id = %s', (user_id,))
    user = cursor.fetchone()
    cursor.close()
    conn.close()
    if user:
        return User(id=user['id'], username=user['username'])
    return None

@app.route('/confirm/<token>')
def confirm_email(token):
    try:
        serializer = URLSafeTimedSerializer(app.secret_key)
        email = serializer.loads(token, salt=app.config['SECURITY_PASSWORD_SALT'], max_age=3600)  # Link valido per 1 ora
    except SignatureExpired:
        flash('Il link di conferma è scaduto.', 'danger')
        return redirect(url_for('register'))
    
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    if not user:
        flash('Utente non trovato.', 'danger')
        cursor.close()
        conn.close()
        return redirect(url_for('register'))
    
    if user.get('confirmed'):
        flash('Il tuo account è già stato confermato.', 'info')
    else:
        cursor.execute("UPDATE users SET confirmed = 1 WHERE email = %s", (email,))
        conn.commit()
        flash('Il tuo account è stato confermato con successo!', 'success')
    
    cursor.close()
    conn.close()
    return redirect(url_for('login'))

@app.route('/')
def index():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute('SELECT * FROM cars')
    cars = cursor.fetchall()
    cursor.close()
    conn.close()
    return render_template('index.html', cars=cars)

from urllib.parse import urlparse, urljoin

@app.route('/login', methods=['GET', 'POST'])
def login():
    next_page = request.args.get('next')
    
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute('SELECT * FROM users WHERE username = %s AND password = %s', (username, password))
        user = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if user:
            user_obj = User(id=user['id'], username=user['username'])
            login_user(user_obj)
            flash('Login successful!', 'success')

            # Protezione contro Open Redirects: assicuriamoci che `next_page` sia un URL interno valido
            if next_page and urlparse(next_page).netloc == '':
                return redirect(next_page)
            return redirect(url_for('index'))
        else:
            flash('Invalid credentials', 'danger')

    return render_template('login.html', next=next_page)


from flask import render_template, redirect, url_for, flash, request
from werkzeug.security import generate_password_hash

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        password_hash = generate_password_hash(password)

        # Aggiungi l'utente al database
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("INSERT INTO users (username, email, password) VALUES (%s, %s, %s)", (username, email, password_hash))
        conn.commit()
        cursor.close()
        conn.close()

        # Invia l'email di conferma
        send_confirmation_email(email)

        flash('Registrazione avvenuta con successo! Controlla la tua email per confermare il tuo account.', 'success')
        return redirect(url_for('login'))

    return render_template('register.html')


    # Gestione della richiesta POST (assicurati che il form invii i dati con method="POST")
    username = request.form.get('username')
    password = request.form.get('password')

    if not username or not password:
        flash("Username e password sono obbligatori.", "danger")
        return redirect(url_for("register"))

    conn = None
    cursor = None
    try:
        logging.info(f"Tentativo di registrazione utente: {username}")
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
        user = cursor.fetchone()

        if user:
            logging.info(f"Utente già esistente: {username}")
            flash("Utente già esistente.", "danger")
            return redirect(url_for("register"))

        cursor.execute("""
            INSERT INTO users (username, password)
            VALUES (%s, %s)
        """, (username, password))
        conn.commit()

        logging.info(f"Utente registrato con successo: {username}")
        flash("Registrazione avvenuta con successo. Effettua il login.", "success")
        return redirect(url_for("login"))

    except mysql.connector.Error as e:
        logging.error(f"Database error: {e}")
        flash("Errore del server. Riprova più tardi.", "danger")
        return redirect(url_for("register"))

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@app.route('/car/<int:car_id>')
def car_detail(car_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    
    # Ottieni i dettagli della macchina
    cursor.execute('SELECT * FROM cars WHERE id = %s', (car_id,))
    car = cursor.fetchone()

    # Ottieni le immagini extra dalla tabella 'car_images'
    cursor.execute('SELECT image FROM car_images WHERE car_id = %s', (car_id,))
    images = cursor.fetchall()
    cursor.close()
    conn.close()

    if car:
        # Converti in lista semplice di link
        car['images'] = [img['image'] for img in images]

    # Controllo se la macchina è già nei preferiti
    is_favorite = False
    if current_user.is_authenticated:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM favorites WHERE user_id = %s AND car_id = %s', (current_user.id, car_id))
        if cursor.fetchone():
            is_favorite = True
        cursor.close()
        conn.close()

    return render_template('car_detail.html', car=car, is_favorite=is_favorite)



@app.route('/favorites')
@login_required
def favorites():
    user_id = current_user.id
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute('SELECT cars.* FROM favorites JOIN cars ON favorites.car_id = cars.id WHERE favorites.user_id = %s', (user_id,))
    favorite_cars = cursor.fetchall()
    cursor.close()
    conn.close()
    return render_template('favorites.html', cars=favorite_cars)

@app.route('/add_to_favorites/<int:car_id>')
@login_required
def add_to_favorites(car_id):
    user_id = current_user.id
    conn = get_db_connection()
    cursor = conn.cursor()
    # Verifica se l'auto è già presente nei preferiti
    cursor.execute('SELECT * FROM favorites WHERE user_id = %s AND car_id = %s', (user_id, car_id))
    if cursor.fetchone():
        flash('Auto già presente tra i preferiti!', 'info')
    else:
        cursor.execute('INSERT INTO favorites (user_id, car_id) VALUES (%s, %s)', (user_id, car_id))
        conn.commit()
        flash('Auto aggiunta ai preferiti!', 'success')
    cursor.close()
    conn.close()
    return redirect(url_for('car_detail', car_id=car_id))


@app.route('/remove_from_favorites/<int:car_id>')
@login_required
def remove_from_favorites(car_id):
    user_id = current_user.id
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM favorites WHERE user_id = %s AND car_id = %s', (user_id, car_id))
    conn.commit()
    cursor.close()
    conn.close()
    flash('Auto rimossa dai preferiti!', 'success')
    return redirect(url_for('car_detail', car_id=car_id))

@app.route('/logout')
def logout():
    logout_user()
    flash('You have been logged out.', 'success')
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True,port=8080, host='0.0.0.0')
