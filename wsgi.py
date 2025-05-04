import sys
import os

# Aggiungi la directory del progetto al sys.path
project_dir = '/home/Ciaramid06/wikisportcars'
if project_dir not in sys.path:
    sys.path.insert(0, project_dir)

# Importa l'app Flask dal modulo server.py
from server import app as application
