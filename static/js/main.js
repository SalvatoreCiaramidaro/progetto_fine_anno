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
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"], [title]:not(.no-tooltip)');
        const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => {
            return new bootstrap.Tooltip(tooltipTriggerEl, {
                delay: { show: 300, hide: 100 }
            });
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
    
    // Migliora l'accessibilità e l'esperienza utente
    const enhanceUserExperience = () => {
        // Aggiungi attributi ARIA per accessibility
        const dropdownButtons = document.querySelectorAll('.dropbtn, .profile-image-container');
        dropdownButtons.forEach(btn => {
            if (!btn.getAttribute('aria-haspopup')) {
                btn.setAttribute('aria-haspopup', 'true');
            }
            if (!btn.getAttribute('aria-expanded')) {
                btn.setAttribute('aria-expanded', 'false');
            }
            
            btn.addEventListener('click', function() {
                const expanded = this.getAttribute('aria-expanded') === 'true' || false;
                this.setAttribute('aria-expanded', !expanded);
            });
        });

        // Migliora focus per navigazione da tastiera
        const focusableElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
        focusableElements.forEach(el => {
            el.addEventListener('focus', function() {
                this.classList.add('keyboard-focus');
            });
            el.addEventListener('blur', function() {
                this.classList.remove('keyboard-focus');
            });
        });
    };
    
    // Inizializzazione delle funzioni
    autoHideAlerts();
    initTooltips();
    initFadeInElements();
    enhanceUserExperience();
});