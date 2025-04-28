import mysql.connector
from contextlib import contextmanager

@contextmanager
def db_cursor():
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="password",
        database="mydatabase"
    )
    cursor = conn.cursor()
    try:
        yield cursor, conn
    finally:
        cursor.close()
        conn.close()

def init_db():
    with db_cursor() as (cursor, conn):
        # Tabella utenti
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(100) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            confirmed BOOLEAN DEFAULT 0,
            profile_image VARCHAR(255) DEFAULT NULL
        )
        ''')

        # Tabella auto
        cursor.execute('''
        CREATE TABLE IF NOT EXISTS cars (
            id INT AUTO_INCREMENT PRIMARY KEY,
            brand VARCHAR(100) NOT NULL,
            model VARCHAR(100) NOT NULL,
            year INT NOT NULL,
            user_id INT,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
        ''')