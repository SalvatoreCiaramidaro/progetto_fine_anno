# wikisportcars/wikisportcars/README.md

# WikiSportCars

WikiSportCars è un'applicazione web che consente agli utenti di visualizzare una varietà di automobili senza la necessità di effettuare il login. Tuttavia, per salvare le automobili nei preferiti, gli utenti devono registrarsi e accedere al proprio account.

## Caratteristiche

- Visualizzazione di un elenco di automobili disponibili.
- Registrazione di nuovi utenti.
- Login per utenti esistenti.
- Salvataggio delle automobili nei preferiti.
- Visualizzazione dei dettagli delle automobili.

## Struttura del Progetto

- **templates/**: Contiene i file HTML per le varie pagine dell'applicazione.
  - `index.html`: Homepage con l'elenco delle automobili.
  - `login.html`: Modulo di accesso per gli utenti.
  - `register.html`: Modulo di registrazione per nuovi utenti.
  - `car_detail.html`: Dettagli di un'automobile specifica.
  - `favorites.html`: Elenco delle automobili salvate nei preferiti.

- **static/**: Contiene file statici come CSS e JavaScript.
  - **css/**: Stili per l'applicazione.
    - `styles.css`: Foglio di stile principale.
  - **js/**: Script per l'interattività client-side.
    - `scripts.js`: Codice JavaScript per la validazione dei moduli e aggiornamenti dinamici.

- **app.py**: File principale dell'applicazione che gestisce le rotte e l'autenticazione degli utenti.

- **config.py**: Configurazioni per la connessione al database e altre impostazioni.

- **requirements.txt**: Elenco delle dipendenze Python necessarie per il progetto.

## Istruzioni per l'Installazione

1. Clona il repository:
   ```
   git clone <repository-url>
   ```

2. Naviga nella cartella del progetto:
   ```
   cd wikisportcars
   ```

3. Installa le dipendenze:
   ```
   pip install -r requirements.txt
   ```

4. Esegui l'applicazione:
   ```
   python app.py
   ```

5. Apri il browser e vai su `http://localhost:5000` per visualizzare l'applicazione.

## Contribuzione

Le contribuzioni sono benvenute! Sentiti libero di aprire issue o pull request per migliorare l'applicazione.