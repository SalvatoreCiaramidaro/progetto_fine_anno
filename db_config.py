import mysql.connector
import os
import logging
from contextlib import contextmanager

# Rileva se siamo su PythonAnywhere
is_pythonanywhere = 'PYTHONANYWHERE_SITE' in os.environ

logging.basicConfig(level=logging.INFO)

# Configurazione condizionale del database
if is_pythonanywhere:
    # Configurazione per PythonAnywhere
    db_config = {
        'user': 'Ciaramid06',
        'password': 'dioladro10',  # ⚠️ Sostituisci con la password reale
        'host': 'Ciaramid06.mysql.pythonanywhere-services.com',
        'database': 'Ciaramid06$wikisportcars',  # Formato corretto su PythonAnywhere
        'raise_on_warnings': True
    }
    logging.info(f"Usando configurazione database per PythonAnywhere: {db_config['host']} - {db_config['database']}")
else:
    # Configurazione per ambiente locale
    db_config = {
        'user': 'root',
        'password': 'x',
        'host': 'localhost',
        'database': 'wikisportcars',
        'raise_on_warnings': True
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