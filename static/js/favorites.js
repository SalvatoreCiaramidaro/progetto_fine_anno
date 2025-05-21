// Script per la gestione dei preferiti
document.addEventListener('DOMContentLoaded', function() {
    // Ottieni il pulsante dei preferiti
    const favoriteBtn = document.getElementById('toggleFavoriteBtn');
    if (!favoriteBtn) return; // Esci se non è presente il pulsante
    
    const carId = favoriteBtn.closest('.favorite-container')?.dataset.carId;
    if (!carId) return; // Esci se non è stato trovato l'ID dell'auto
    
    // Aggiungi l'event listener per il click sul pulsante
    favoriteBtn.addEventListener('click', function() {
        // Determina l'azione in base alla classe del pulsante
        const action = this.classList.contains('add-favorite') ? 'add' : 'remove';
        const endpoint = action === 'add' ? `/add_to_favorites/${carId}` : `/remove_from_favorites/${carId}`;
        
        // Mostra un piccolo effetto di loading sul pulsante
        const originalText = this.innerHTML;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Elaborazione...';
        this.disabled = true;
        
        // Effettua la richiesta al server
        fetch(endpoint, {
            method: 'POST',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => {
            // Se l'utente non è autenticato, potrebbe essere reindirizzato alla pagina di login
            if (response.redirected) {
                window.location.href = response.url;
                return null;
            }
            return response.json();
        })
        .then(data => {
            if (!data) return; // Se l'utente è stato reindirizzato
            if (data.success) {
                // Aggiorna l'aspetto e la funzione del pulsante
                if (action === 'add') {
                    this.classList.remove('add-favorite');
                    this.classList.add('remove-favorite');
                    this.innerHTML = '<i class="fas fa-heart"></i> Rimuovi dai Preferiti';
                } else {
                    this.classList.remove('remove-favorite');
                    this.classList.add('add-favorite');
                    this.innerHTML = '<i class="fas fa-heart"></i> Aggiungi ai Preferiti';
                }
                
                // Aggiorna il conteggio dei preferiti nel badge del dropdown (se presente)
                updateFavoritesCount();
                
                // Mostra un messaggio di successo
                const flashMessage = document.createElement('div');
                flashMessage.className = 'flash-message success';
                flashMessage.innerHTML = `
                    <i class="fas fa-check-circle message-icon"></i>
                    <div class="message-content">${data.message}</div>
                    <button class="close-button" aria-label="Chiudi">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                
                // Aggiungi il messaggio flash al container (se esiste)
                const flashContainer = document.querySelector('.flash-messages-container');
                if (flashContainer) {
                    flashContainer.appendChild(flashMessage);
                    
                    // Rimuovi il messaggio dopo 5 secondi
                    setTimeout(() => {
                        flashMessage.style.opacity = '0';
                        setTimeout(() => {
                            flashMessage.remove();
                        }, 300);
                    }, 5000);
                }
            } else {
                // Ripristina il pulsante originale in caso di errore
                this.innerHTML = originalText;
                console.error('Errore:', data.message);
            }
            
            // Riabilita il pulsante
            this.disabled = false;
        })
        .catch(error => {
            console.error('Errore nella richiesta:', error);
            this.innerHTML = originalText;
            this.disabled = false;
        });
    });
    
    // Funzione per aggiornare il conteggio dei preferiti nel dropdown
    function updateFavoritesCount() {
        const favoritesCountBadge = document.getElementById('favoritesCount');
        if (!favoritesCountBadge) return;
        
        fetch('/api/favorites/count')
            .then(response => {
                // Se l'utente viene reindirizzato (probabilmente al login)
                if (response.redirected) {
                    favoritesCountBadge.style.display = 'none';
                    return null;
                }
                
                if (!response.ok) {
                    throw new Error('Errore nel recupero dei dati');
                }
                return response.json();
            })
            .then(data => {
                if (!data) return; // Utente reindirizzato
                
                if (data.count > 0) {
                    favoritesCountBadge.textContent = data.count;
                    favoritesCountBadge.style.display = 'inline-block';
                } else {
                    favoritesCountBadge.style.display = 'none';
                }
            })
            .catch(error => {
                console.error('Errore:', error);
            });
    }
});
