import mysql.connector
from contextlib import contextmanager

# Configurazione per la connessione al database con MariaDB
db_config = {
    "user": "root",
    "password": "x",
    "host": "localhost",
    "database": "wikisportcars",
}

def get_db_connection():
    """
    Crea e restituisce una nuova connessione al database
    """
    return mysql.connector.connect(**db_config)

@contextmanager
def db_cursor(dictionary=True):
    """
    Context manager per gestire connessioni al database in modo sicuro.
    Garantisce la chiusura della connessione anche in caso di eccezioni.
    
    Args:
        dictionary (bool): Se True, restituisce i risultati come dizionari
    """
    conn = get_db_connection()
    try:
        cursor = conn.cursor(dictionary=dictionary)
        yield cursor, conn
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()