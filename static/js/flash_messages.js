/**
 * Sistema di gestione messaggi flash
 */

document.addEventListener('DOMContentLoaded', function() {
    // Aggiungi event listener ai pulsanti di chiusura dei messaggi flash esistenti
    setupExistingFlashMessages();
    
    // Nascondi il vecchio container dei messaggi flash se presente
    hideOldFlashContainers();
});

// Configurazione dei messaggi flash esistenti (generati da Flask)
function setupExistingFlashMessages() {
    const flashMessages = document.querySelectorAll('[data-flash-message]');
    
    flashMessages.forEach(message => {
        // Aggiungi event listener per il pulsante di chiusura
        const closeButton = message.querySelector('.close-button');
        if (closeButton) {
            closeButton.addEventListener('click', function() {
                removeFlashMessage(message);
            });
        }
        
        // Imposta un timer per rimuovere il messaggio
        setTimeout(() => {
            removeFlashMessage(message);
        }, 5000);
    });
}

// Funzione per nascondere i vecchi contenitori di messaggi flash
function hideOldFlashContainers() {
    const oldContainers = document.querySelectorAll('.flash-messages, .flashes, #alerts');
    oldContainers.forEach(container => {
        if (container && container.id !== 'flashMessages') {
            container.style.display = 'none';
        }
    });
}

// Funzione per mostrare un messaggio flash dinamico
function showFlashMessage(type, message) {
    const flashContainer = document.getElementById('flashMessages');
    
    if (!flashContainer) {
        console.error('Container dei messaggi flash non trovato!');
        return;
    }
    
    // Determina icona e tipo di messaggio
    let icon = '';
    switch(type) {
        case 'success':
            icon = '<i class="fas fa-check-circle message-icon"></i>';
            break;
        case 'error':
        case 'danger':
            type = 'error'; // Normalizza il tipo
            icon = '<i class="fas fa-exclamation-circle message-icon"></i>';
            break;
        case 'info':
            icon = '<i class="fas fa-info-circle message-icon"></i>';
            break;
        case 'warning':
            icon = '<i class="fas fa-exclamation-triangle message-icon"></i>';
            break;
        default:
            icon = '<i class="fas fa-bell message-icon"></i>';
    }
    
    // Crea l'elemento flash
    const flashMessage = document.createElement('div');
    flashMessage.className = `flash-message ${type}`;
    flashMessage.setAttribute('data-flash-message', '');
    flashMessage.innerHTML = `
        ${icon}
        <div class="message-content">${message}</div>
        <button class="close-button" aria-label="Chiudi">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Aggiungi il messaggio al container
    flashContainer.appendChild(flashMessage);
    
    // Aggiungi event listener per il pulsante di chiusura
    const closeButton = flashMessage.querySelector('.close-button');
    closeButton.addEventListener('click', function() {
        removeFlashMessage(flashMessage);
    });
    
    // Rimuovi automaticamente il messaggio dopo 5 secondi
    setTimeout(() => {
        removeFlashMessage(flashMessage);
    }, 5000);
}

// Funzione per rimuovere un messaggio flash con animazione
function removeFlashMessage(messageElement) {
    messageElement.style.animation = 'fadeOut 0.3s forwards';
    setTimeout(() => {
        if (messageElement.parentNode) {
            messageElement.parentNode.removeChild(messageElement);
        }
    }, 300);
}