import mysql.connector
import os
import logging
import configparser
from contextlib import contextmanager
from dotenv import load_dotenv

# Carica le variabili d'ambiente dal file .env
load_dotenv()

# Ottieni il percorso assoluto della directory in cui si trova questo script
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_FILE_PATH = os.path.join(BASE_DIR, 'config.ini')

# Carica le configurazioni dal file config.ini
config = configparser.ConfigParser()
config.read(CONFIG_FILE_PATH)

# Rileva se siamo su PythonAnywhere
is_pythonanywhere = 'PYTHONANYWHERE_SITE' in os.environ

logging.basicConfig(level=logging.INFO)

# Configurazione condizionale del database
if is_pythonanywhere:
    # Configurazione per PythonAnywhere
    db_config = {
        'user': config.get('DATABASE_PYTHONANYWHERE', 'user'),
        'password': os.getenv('DB_PASSWORD_PYTHONANYWHERE'),
        'host': config.get('DATABASE_PYTHONANYWHERE', 'host'),
        'database': config.get('DATABASE_PYTHONANYWHERE', 'database'),
        'raise_on_warnings': config.getboolean('DATABASE_PYTHONANYWHERE', 'raise_on_warnings')
    }
    logging.info(f"Usando configurazione database per PythonAnywhere: {db_config['host']} - {db_config['database']}")
else:
    # Configurazione per ambiente locale
    db_config = {
        'user': config.get('DATABASE_LOCAL', 'user'),
        'password': os.getenv('DB_PASSWORD_LOCAL'),
        'host': config.get('DATABASE_LOCAL', 'host'),
        'database': config.get('DATABASE_LOCAL', 'database'),
        'raise_on_warnings': config.getboolean('DATABASE_LOCAL', 'raise_on_warnings')
    }
    logging.info("Usando configurazione database per ambiente locale")

def get_db_connection():
    """Crea una connessione al database MySQL."""
    try:
        logging.info(f"Tentativo di connessione al database: {db_config['host']} - {db_config['database']}")
        return mysql.connector.connect(**db_config)
    except mysql.connector.Error as err:
        logging.error(f"Errore di connessione al database: {err}")
        raise

@contextmanager
def db_cursor(dictionary=True):
    """
    Context manager per gestire connessioni al database in modo sicuro.
    Garantisce la chiusura della connessione anche in caso di eccezioni.

    Args:
        dictionary (bool): Se True, restituisce i risultati come dizionari
    """
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=dictionary)
        yield cursor, conn
        conn.commit()
    except Exception as e:
        logging.error(f"Errore nell'operazione sul database: {e}")
        if conn:
            conn.rollback()
        raise e
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()