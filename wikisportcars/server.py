from flask import Flask, render_template, request, redirect, url_for, flash, session
from flask_login import LoginManager, UserMixin, login_user, logout_user, current_user, login_required
import mysql.connector
import logging
from urllib.parse import urlparse, urljoin



logging.basicConfig(level=logging.INFO)

app = Flask(__name__)
app.secret_key = 'your_secret_key'

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'
login_manager.login_message_category = "info"  # Per mostrare un messaggio di avviso

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
    def __init__(self, id, username):
        self.id = id
        self.username = username

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


@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('INSERT INTO users (username, password) VALUES (%s, %s)', (username, password))
        conn.commit()
        cursor.close()
        conn.close()
        flash('Registration successful!', 'success')
        return redirect(url_for('login'))
    return render_template('register.html')

@app.route('/car/<int:car_id>')
def car_detail(car_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute('SELECT * FROM cars WHERE id = %s', (car_id,))
    car = cursor.fetchone()
    cursor.close()
    conn.close()
    return render_template('car_detail.html', car=car)

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
    cursor.execute('INSERT INTO favorites (user_id, car_id) VALUES (%s, %s)', (user_id, car_id))
    conn.commit()
    cursor.close()
    conn.close()
    flash('Car added to favorites!', 'success')
    return redirect(url_for('favorites'))

@app.route('/logout')
def logout():
    logout_user()
    flash('You have been logged out.', 'success')
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True)
