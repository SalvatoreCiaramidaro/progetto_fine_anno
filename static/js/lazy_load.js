function cacheImage(imgElement, url) {
    // Aggiungi una classe per indicare che sta caricando (opzionale, per CSS)
    imgElement.classList.add('caching-in-progress');

    fetch('/api/cache_image', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.url) {
            // Aggiorna l'immagine con quella locale
            imgElement.src = data.url;
            imgElement.classList.remove('lazy-cache');
            imgElement.classList.add('cached-success');
        } else {
            console.warn('Caching fallito per:', url);
        }
    })
    .catch(err => console.error('Errore caching immagine:', err))
    .finally(() => {
        imgElement.classList.remove('caching-in-progress');
    });
}

window.initLazyCache = function() {
    const lazyImages = document.querySelectorAll('img.lazy-cache:not(.observed)');

    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const remoteUrl = img.dataset.remoteUrl;
                    
                    if (remoteUrl) {
                        // Avvia il processo di caching
                        cacheImage(img, remoteUrl);
                        // Smetti di osservare questa immagine
                        observer.unobserve(img);
                    }
                }
            });
        });

        lazyImages.forEach(img => {
            imageObserver.observe(img);
            img.classList.add('observed');
        });
    } else {
        // Fallback per browser vecchi: carica tutto subito
        lazyImages.forEach(img => {
            const remoteUrl = img.dataset.remoteUrl;
            if (remoteUrl) {
                cacheImage(img, remoteUrl);
            }
        });
    }
};

document.addEventListener("DOMContentLoaded", function() {
    window.initLazyCache();
});