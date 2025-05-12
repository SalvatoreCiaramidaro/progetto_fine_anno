// Funzione per cambiare l'immagine
let currentImageIndex = 0;

function changeImage(direction) {
    if (!images || images.length <= 1) return;
    
    // Calcola il nuovo indice con wrap-around
    currentImageIndex = (currentImageIndex + direction + images.length) % images.length;
    
    // Aggiorna l'immagine visualizzata
    const imageElement = document.getElementById('carImage');
    if (imageElement) {
        imageElement.src = images[currentImageIndex];
    }
}

// Gestione degli eventi con delega per i pulsanti di chiusura messaggi flash
document.addEventListener('click', function(e) {
    // Gestione pulsanti di chiusura per i messaggi flash
    if (e.target && (e.target.classList.contains('close-button') || e.target.closest('.close-button'))) {
        const flashMessage = e.target.closest('.flash-message');
        if (flashMessage) {
            flashMessage.style.opacity = '0';
            setTimeout(function() {
                flashMessage.style.display = 'none';
            }, 600);
        }
    }
});
