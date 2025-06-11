// === MIGLIORAMENTI MOBILE PER DROPDOWN ===
// Aggiunge funzionalità mobile senza interferire con il desktop

document.addEventListener('DOMContentLoaded', function() {
    // Applica miglioramenti SOLO su dispositivi realmente mobili (touch)
    if (window.innerWidth <= 768 && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
        console.log('📱 Dispositivo mobile con touch rilevato - applicando miglioramenti...');
        initMobileDropdownEnhancements();
    } else {
        console.log('💻 Dispositivo desktop - nessun miglioramento mobile applicato');
    }
});

function initMobileDropdownEnhancements() {
    // Aggiungi classe mobile al body
    document.body.classList.add('mobile-device');
    
    // Observer per applicare stili mobile quando i dropdown si aprono
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                const dropdown = mutation.target;
                
                // Se un dropdown si apre su mobile, applica stili mobili
                if (dropdown.classList.contains('show') && 
                    dropdown.classList.contains('dropdown-content') &&
                    window.innerWidth <= 768) {
                    
                    setTimeout(() => {
                        applyMobileDropdownStyles(dropdown);
                    }, 10);
                }
            }
        });
    });
    
    // Osserva tutti i dropdown esistenti
    document.querySelectorAll('.dropdown-content').forEach(dropdown => {
        observer.observe(dropdown, {
            attributes: true,
            attributeFilter: ['class']
        });
    });
    
    console.log('✅ Miglioramenti mobile applicati');
}

function applyMobileDropdownStyles(dropdown) {
    console.log('📱 Applicando stili mobile al dropdown');
    
    // Forza posizionamento mobile
    dropdown.style.position = 'fixed';
    dropdown.style.left = '50%';
    dropdown.style.bottom = '2rem';
    dropdown.style.top = 'unset';
    dropdown.style.right = 'unset';
    dropdown.style.transform = 'translateX(-50%)';
    dropdown.style.width = '90vw';
    dropdown.style.maxWidth = '350px';
    dropdown.style.minWidth = '280px';
    dropdown.style.zIndex = '9999';
    
    // Crea overlay per mobile
    showMobileOverlay();
    
    // Blocca scroll del body su mobile
    document.body.style.overflow = 'hidden';
}

function showMobileOverlay() {
    let overlay = document.querySelector('.mobile-dropdown-overlay');
    
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'mobile-dropdown-overlay';
        overlay.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            background: rgba(0, 0, 0, 0.3) !important;
            z-index: 9998 !important;
            display: block !important;
        `;
        
        // Click sull'overlay chiude i dropdown
        overlay.addEventListener('click', function() {
            document.querySelectorAll('.dropdown-content.show, .profile-dropdown.show').forEach(d => {
                d.classList.remove('show');
            });
            document.querySelectorAll('[aria-expanded="true"]').forEach(el => {
                el.setAttribute('aria-expanded', 'false');
            });
            overlay.remove();
            document.body.style.overflow = '';
        });
        
        document.body.appendChild(overlay);
    }
}

// Pulizia overlay quando i dropdown si chiudono
document.addEventListener('click', function(e) {
    // Se non c'è nessun dropdown aperto, rimuovi overlay e reset scroll
    setTimeout(() => {
        const openDropdowns = document.querySelectorAll('.dropdown-content.show, .profile-dropdown.show');
        if (openDropdowns.length === 0) {
            const overlay = document.querySelector('.mobile-dropdown-overlay');
            if (overlay) {
                overlay.remove();
            }
            document.body.style.overflow = '';
        }
    }, 10);
});

// Gestisci resize per applicare/rimuovere miglioramenti mobile
window.addEventListener('resize', function() {
    if (window.innerWidth <= 768) {
        document.body.classList.add('mobile-device');
    } else {
        document.body.classList.remove('mobile-device');
        // Rimuovi overlay se passiamo a desktop
        const overlay = document.querySelector('.mobile-dropdown-overlay');
        if (overlay) {
            overlay.remove();
        }
        document.body.style.overflow = '';
    }
});

console.log('📱 Sistema mobile caricato');