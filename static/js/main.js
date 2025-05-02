// Script principale per WikiSportCars
document.addEventListener('DOMContentLoaded', function() {
    
    // Funzione per nascondere automaticamente gli alert dopo un certo tempo
    const autoHideAlerts = () => {
        const alerts = document.querySelectorAll('.alert:not(.persistent)');
        alerts.forEach(alert => {
            setTimeout(() => {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }, 5000);
        });
    };
    
    // Inizializza i tooltip di Bootstrap
    const initTooltips = () => {
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    };
    
    // Funzione per animazioni di fade-in degli elementi
    const initFadeInElements = () => {
        const fadeElements = document.querySelectorAll('.fade-in');
        fadeElements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add('visible');
            }, 100 * index);
        });
    };
    
    // Inizializzazione delle funzioni
    autoHideAlerts();
    initTooltips();
    initFadeInElements();
});