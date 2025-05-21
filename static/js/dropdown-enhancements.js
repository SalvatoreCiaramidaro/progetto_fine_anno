/**
 * Script per migliorare le funzionalità dei menu dropdown
 */

document.addEventListener('DOMContentLoaded', function() {
    // Funzione per chiudere i dropdown quando si scorre la pagina
    const closeDropdownsOnScroll = () => {
        const dropdowns = document.querySelectorAll('.dropdown-content.show, .profile-dropdown.show');
        if (dropdowns.length > 0) {
            dropdowns.forEach(dropdown => {
                dropdown.classList.remove('show');
            });
            
            // Aggiorna anche gli attributi ARIA
            const dropdownButtons = document.querySelectorAll('.dropbtn[aria-expanded="true"], .profile-image-container[aria-expanded="true"]');
            dropdownButtons.forEach(btn => {
                btn.setAttribute('aria-expanded', 'false');
            });
        }
    };

    // Aggiungi event listener per lo scroll
    window.addEventListener('scroll', closeDropdownsOnScroll);
    
    // Funzione per caricare il conteggio dei preferiti
    const loadFavoritesCount = () => {
        const favoritesCountBadge = document.getElementById('favoritesCount');
        if (!favoritesCountBadge) return;

        // Effettua la chiamata AJAX per ottenere il conteggio
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
                favoritesCountBadge.style.display = 'none';
            });
    };

    // Animazione speciale per gli elementi del dropdown
    const enhanceDropdownItems = () => {
        const dropdownItems = document.querySelectorAll('.dropdown-content a, .profile-dropdown a');
        
        dropdownItems.forEach((item, index) => {
            // Aggiungi ritardo di animazione basato sull'indice
            item.style.animationDelay = `${index * 0.05}s`;
            
            // Aggiungi classe per l'animazione
            item.classList.add('dropdown-item-animated');
            
            // Aggiungi stile per l'effetto hover avanzato
            item.addEventListener('mouseenter', function() {
                const icon = this.querySelector('i');
                if (icon) {
                    icon.classList.add('fa-bounce');
                }
            });
            
            item.addEventListener('mouseleave', function() {
                const icon = this.querySelector('i');
                if (icon) {
                    icon.classList.remove('fa-bounce');
                }
            });
        });
    };

    // Migliora l'accessibilità dei dropdown
    const enhanceDropdownAccessibility = () => {
        const dropdowns = document.querySelectorAll('.dropdown, .profile-image-container');
        
        dropdowns.forEach(dropdown => {
            const items = dropdown.querySelectorAll('a');
            
            // Gestisci navigazione con tastiera all'interno del dropdown
            items.forEach((item, index) => {
                item.addEventListener('keydown', function(e) {
                    // Naviga con i tasti freccia
                    if (e.key === 'ArrowDown' && index < items.length - 1) {
                        e.preventDefault();
                        items[index + 1].focus();
                    } else if (e.key === 'ArrowUp' && index > 0) {
                        e.preventDefault();
                        items[index - 1].focus();
                    } else if (e.key === 'Escape') {
                        e.preventDefault();
                        dropdown.querySelector('.dropbtn, .profile-image')?.focus();
                        
                        // Chiudi dropdown
                        const dropdownMenu = dropdown.querySelector('.dropdown-content, .profile-dropdown');
                        if (dropdownMenu) dropdownMenu.classList.remove('show');
                    }
                });
            });
        });
    };

    // Inizializza le funzionalità
    if (document.getElementById('favoritesCount')) {
        loadFavoritesCount();
    }
    
    enhanceDropdownItems();
    enhanceDropdownAccessibility();
});
