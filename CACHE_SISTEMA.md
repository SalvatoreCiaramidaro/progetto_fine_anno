# Sistema di Cache delle Immagini - WikiSportCars

## 📖 Panoramica

Il sistema di cache delle immagini è stato implementato per migliorare le performance e l'affidabilità del sito WikiSportCars. Le immagini vengono scaricate automaticamente dai link esterni e salvate localmente per un accesso più veloce.

## 🚀 Come Funziona

### 1. **Cache Automatica**
- **Prima volta**: L'immagine viene scaricata dall'URL originale e salvata in `/static/car_images/`
- **Volte successive**: L'immagine viene servita direttamente dalla cache locale
- **Fallback**: Se il download fallisce, viene utilizzato l'URL originale

### 2. **Generazione Nomi File**
- I file vengono salvati con nomi basati su hash MD5 dell'URL originale
- Esempio: `52dd39403d5af345b90264b41c463e1a.jpeg`
- Questo garantisce nomi unici e evita conflitti

### 3. **Gestione Intelligente**
- **Controllo dimensione**: Cache massima di 500MB
- **Pulizia automatica**: Rimuove i file più vecchi quando la cache è piena
- **Verifica contenuto**: Controlla che i file scaricati siano effettivamente immagini

## 🛠️ Funzionalità Admin

### Pannello di Controllo
Accesso tramite: `/admin` (richiede account amministratore)

### Pulsanti Disponibili:

1. **📊 Stato Cache**
   - Visualizza numero di file in cache
   - Mostra dimensione totale
   - Lista dei file con età e dimensioni

2. **⬇️ Pre-carica Immagini**
   - Scarica tutte le immagini dal database
   - Utile per popolare la cache in batch

3. **🗑️ Pulisci Cache**
   - Rimuove tutti i file dalla cache
   - Resetta completamente il sistema

4. **🧹 Pulisci File Vecchi**
   - Rimuove solo i file più vecchi di X giorni (default: 30)
   - Mantiene i file più recenti

## 📁 Struttura File

```
static/
└── car_images/           # Cache locale delle immagini
    ├── 52dd394...jpeg    # Immagine di copertina Ferrari
    ├── 4977ecd...jpg     # Immagine di copertina Porsche
    └── ...               # Altre immagini cached
```

## 🔧 Configurazione

### Variabili di Configurazione (server.py)
```python
app.config['CAR_IMAGES_CACHE_DIR'] = 'static/car_images'
app.config['MAX_CACHE_SIZE_MB'] = 500  # Massimo 500MB
```

### Template Aggiornati
Tutti i template sono stati aggiornati per gestire le immagini cached:
- `index.html` - Homepage con griglia auto
- `favorites.html` - Pagina preferiti
- `search.html` - Risultati ricerca
- `car_detail.html` - Dettagli auto (già compatibile)

## 🔒 Sicurezza

- **Validazione tipo file**: Verifica che i download siano effettivamente immagini
- **Timeout richieste**: 10 secondi massimo per download
- **Gestione errori**: Fallback graceful all'URL originale
- **Nomi file sicuri**: Hash per evitare path traversal

## ⚡ Performance

### Benefici:
- **Caricamento più veloce**: Immagini servite localmente
- **Riduzione dipendenze esterne**: Meno reliance su servizi terzi
- **Gestione bandwidth**: Scarico una sola volta per immagine

### Metriche:
- **Prima visita**: Download + cache (può essere più lento)
- **Visite successive**: Accesso diretto (molto più veloce)
- **Spazio utilizzato**: ~20MB per 50+ immagini

## 🐛 Troubleshooting

### Immagini non caricate?
1. Controllare log del server per errori di download
2. Verificare che l'URL sia accessibile
3. Controllare spazio disco disponibile

### Cache troppo grande?
1. La pulizia automatica si attiva a 500MB
2. Usare "Pulisci File Vecchi" dall'admin
3. Ridurre `MAX_CACHE_SIZE_MB` se necessario

### Errori 404 per immagini?
1. Verificare che i template siano aggiornati
2. Controllare che le immagini siano in `/static/car_images/`
3. Riavviare il server se necessario

## 📝 Log Esempio

```
INFO:root:Immagine scaricata e salvata: /path/to/static/car_images/52dd39403d5af345b90264b41c463e1a.jpeg
INFO:werkzeug:192.168.96.1 - - "GET /static/car_images/52dd39403d5af345b90264b41c463e1a.jpeg HTTP/1.1" 200 -
INFO:root:Pulizia automatica cache completata: 5 file rimossi
```

## ✅ Stato Implementazione

- [x] Sistema di cache automatico
- [x] Gestione fallback per errori
- [x] Controllo dimensione cache
- [x] Pulizia automatica file vecchi
- [x] Pannello admin per gestione
- [x] Template aggiornati
- [x] Logging completo
- [x] Validazione sicurezza

## 🔮 Possibili Miglioramenti Futuri

- Compressione immagini automatica
- Resize automatico per thumbnails
- Lazy loading più avanzato
- CDN integration
- Background job per pre-caricamento