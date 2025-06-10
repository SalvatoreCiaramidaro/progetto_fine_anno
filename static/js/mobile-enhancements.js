// === SISTEMA MOBILE UNIFICATO PER WIKISPORTCARS ===
// Design moderno e semplificato per l'interfaccia mobile

document.addEventListener('DOMContentLoaded', function() {
    // Attendi che la configurazione sia caricata
    if (typeof window.MobileConfig !== 'undefined') {
        initWithConfig();
    } else {
        // Fallback se la configurazione non è disponibile
        setTimeout(initWithConfig, 100);
    }
});

function initWithConfig() {
    const config = window.MobileConfig || {};
    
    if (isMobileDevice()) {
        config.log?.('info', 'Dispositivo mobile rilevato - inizializzazione interfaccia mobile...');
        initMobileInterface();
    }
}

// Rileva se il dispositivo è mobile (usa config se disponibile)
function isMobileDevice() {
    const config = window.MobileConfig;
    if (config && config.isMobile) {
        return config.isMobile();
    }
    // Fallback
    return window.innerWidth <= 768 || 
           /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Inizializza l'interfaccia mobile
function initMobileInterface() {
    // Aggiungi classe mobile al body
    document.body.classList.add('mobile-device');
    
    // Inizializza i dropdown mobile
    initMobileDropdowns();
    
    // Ottimizza la search bar
    optimizeMobileSearch();
    
    // Gestisci l'orientamento del dispositivo
    handleOrientationChange();
    
    console.log('✅ Interfaccia mobile inizializzata');
}

// Gestisce i dropdown su mobile
function initMobileDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown-content');
    
    dropdowns.forEach(dropdown => {
        // Aggiungi classe identificativa
        dropdown.classList.add('mobile-dropdown');
        
        // Observer per applicare stili mobile quando il dropdown viene mostrato
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === 'class') {
                    const target = mutation.target;
                    if (target.classList.contains('show')) {
                        applyMobileDropdownStyles(target);
                    }
                }
            });
        });
        
        observer.observe(dropdown, {
            attributes: true,
            attributeFilter: ['class']
        });
    });
    
    // Gestisci click outside per chiudere dropdown
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown, .profile-image-container, .dropdown-content')) {
            closeAllDropdowns();
        }
    });
    
    // Chiudi dropdown con tasto ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAllDropdowns();
        }
    });
}

// Gestisce l'overlay del dropdown mobile
function createMobileOverlay() {
    let overlay = document.querySelector('.mobile-dropdown-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'mobile-dropdown-overlay';
        overlay.addEventListener('click', closeAllDropdowns);
        document.body.appendChild(overlay);
    }
    return overlay;
}

// Mostra l'overlay quando un dropdown è aperto
function showMobileOverlay() {
    const overlay = createMobileOverlay();
    overlay.classList.add('show');
}

// Nasconde l'overlay
function hideMobileOverlay() {
    const overlay = document.querySelector('.mobile-dropdown-overlay');
    if (overlay) {
        overlay.classList.remove('show');
    }
}

// Applica stili mobile ai dropdown
function applyMobileDropdownStyles(dropdown) {
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
    
    // Mostra overlay
    showMobileOverlay();
    
    // Previeni scroll del body
    document.body.style.overflow = 'hidden';
    
    console.log('📱 Stili mobile applicati al dropdown:', dropdown.id);
}

// Chiude tutti i dropdown aperti
function closeAllDropdowns() {
    document.querySelectorAll('.dropdown-content.show').forEach(dropdown => {
        dropdown.classList.remove('show');
    });
    
    // Nascondi overlay e ripristina scroll
    hideMobileOverlay();
    document.body.style.overflow = '';
}

// Ottimizza la search bar per mobile
function optimizeMobileSearch() {
    const searchInputs = document.querySelectorAll('#search-input-mobile, #search-input');
    
    searchInputs.forEach(input => {
        // Previene zoom su iOS
        input.style.fontSize = '16px';
        
        // Migliora l'esperienza touch
        input.addEventListener('focus', function() {
            // Scorri in vista l'input quando viene focussato
            setTimeout(() => {
                this.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        });
    });
}

// Gestisce i cambi di orientamento
function handleOrientationChange() {
    window.addEventListener('orientationchange', function() {
        setTimeout(() => {
            // Chiudi tutti i dropdown aperti dopo rotazione
            closeAllDropdowns();
            
            // Riapplica stili se necessario
            if (isMobileDevice()) {
                document.body.classList.add('mobile-device');
            } else {
                document.body.classList.remove('mobile-device');
            }
        }, 100);
    });
    
    window.addEventListener('resize', function() {
        if (isMobileDevice()) {
            document.body.classList.add('mobile-device');
        } else {
            document.body.classList.remove('mobile-device');
        }
    });
}

// Utility per debug mobile
window.debugMobile = function() {
    console.log('🔍 Debug Mobile Interface:');
    console.log('- Mobile device:', isMobileDevice());
    console.log('- Body classes:', Array.from(document.body.classList));
    console.log('- Dropdown count:', document.querySelectorAll('.dropdown-content').length);
    console.log('- Active dropdowns:', document.querySelectorAll('.dropdown-content.show').length);
};

// Utility per forzare applicazione stili mobile
window.forceMobileStyles = function() {
    console.log('🔧 Forzando applicazione stili mobile...');
    document.querySelectorAll('.dropdown-content.show').forEach(dropdown => {
        applyMobileDropdownStyles(dropdown);
    });
};

// === FUNZIONALITÀ AVANZATE MOBILE ===

// Gestisce l'inserimento di icone e miglioramenti UI
function enhanceMobileUI() {
    // Aggiungi icone ai bottoni se mancanti
    const buttons = document.querySelectorAll('.btn, button');
    buttons.forEach(btn => {
        if (btn.classList.contains('btn-primary') && !btn.querySelector('i')) {
            const icon = document.createElement('i');
            icon.className = 'fas fa-check';
            btn.prepend(icon);
        }
    });
    
    // Migliora i link del dropdown
    const dropdownLinks = document.querySelectorAll('.dropdown-content a');
    dropdownLinks.forEach(link => {
        link.addEventListener('touchstart', function() {
            this.style.backgroundColor = '#f8f9fa';
        });
        
        link.addEventListener('touchend', function() {
            setTimeout(() => {
                this.style.backgroundColor = '';
            }, 150);
        });
    });
}

// Gestisce swipe gestures sui dropdown
function addSwipeGestures() {
    let startY = 0;
    let currentY = 0;
    let isSwipping = false;
    
    document.addEventListener('touchstart', function(e) {
        if (e.target.closest('.dropdown-content')) {
            startY = e.touches[0].clientY;
            isSwipping = true;
        }
    });
    
    document.addEventListener('touchmove', function(e) {
        if (!isSwipping) return;
        
        currentY = e.touches[0].clientY;
        const diffY = currentY - startY;
        
        // Se l'utente swipe verso il basso di almeno 50px, chiudi il dropdown
        if (diffY > 50) {
            closeAllDropdowns();
            isSwipping = false;
        }
    });
    
    document.addEventListener('touchend', function() {
        isSwipping = false;
    });
}

// Inizializzazione avanzata
function initAdvancedMobileFeatures() {
    enhanceMobileUI();
    addSwipeGestures();
    
    // Aggiungi listener per i link che dovrebbero chiudere i dropdown
    document.querySelectorAll('.dropdown-content a').forEach(link => {
        link.addEventListener('click', function() {
            // Chiudi dropdown dopo un breve delay per permettere la navigazione
            setTimeout(closeAllDropdowns, 100);
        });
    });
}

// Aggiorna la funzione di inizializzazione principale
const originalInitMobileInterface = initMobileInterface;
initMobileInterface = function() {
    originalInitMobileInterface();
    initAdvancedMobileFeatures();
    console.log('✅ Funzionalità avanzate mobile inizializzate');
};

// === SISTEMA DI DEBUG AVANZATO ===

// Crea un pannello di debug mobile
function createMobileDebugPanel() {
    if (document.querySelector('#mobile-debug-panel')) return;
    
    const panel = document.createElement('div');
    panel.id = 'mobile-debug-panel';
    panel.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 10px;
        border-radius: 8px;
        font-size: 12px;
        z-index: 10000;
        max-width: 200px;
        display: none;
    `;
    
    panel.innerHTML = `
        <div><strong>Mobile Debug</strong></div>
        <div>Viewport: <span id="debug-viewport"></span></div>
        <div>Device: <span id="debug-device"></span></div>
        <div>Dropdowns: <span id="debug-dropdowns"></span></div>
        <div>Active: <span id="debug-active"></span></div>
        <button onclick="this.parentElement.style.display='none'" style="background:red;color:white;border:none;border-radius:4px;padding:2px 6px;margin-top:5px;">Close</button>
    `;
    
    document.body.appendChild(panel);
    
    // Aggiorna info debug ogni secondo
    setInterval(updateDebugInfo, 1000);
}

// Aggiorna le informazioni del debug panel
function updateDebugInfo() {
    const panel = document.querySelector('#mobile-debug-panel');
    if (!panel || panel.style.display === 'none') return;
    
    const viewportEl = document.querySelector('#debug-viewport');
    const deviceEl = document.querySelector('#debug-device');
    const dropdownsEl = document.querySelector('#debug-dropdowns');
    const activeEl = document.querySelector('#debug-active');
    
    if (viewportEl) viewportEl.textContent = `${window.innerWidth}x${window.innerHeight}`;
    if (deviceEl) deviceEl.textContent = isMobileDevice() ? 'Mobile' : 'Desktop';
    if (dropdownsEl) dropdownsEl.textContent = document.querySelectorAll('.dropdown-content').length;
    if (activeEl) activeEl.textContent = document.querySelectorAll('.dropdown-content.show').length;
}

// === GESTIONE AVANZATA DELLE ANIMAZIONI ===

// Chiude i dropdown con animazione
function closeDropdownsWithAnimation() {
    const activeDropdowns = document.querySelectorAll('.dropdown-content.show');
    const overlay = document.querySelector('.mobile-dropdown-overlay.show');
    
    activeDropdowns.forEach(dropdown => {
        dropdown.classList.add('hiding');
        dropdown.classList.remove('show');
        
        setTimeout(() => {
            dropdown.classList.remove('hiding');
        }, 300);
    });
    
    if (overlay) {
        overlay.classList.add('hiding');
        overlay.classList.remove('show');
        
        setTimeout(() => {
            overlay.classList.remove('hiding');
            overlay.style.display = 'none';
        }, 300);
    }
    
    // Ripristina scroll del body
    setTimeout(() => {
        document.body.style.overflow = '';
    }, 100);
}

// === GESTIONE MIGLIORATA DELLE PERFORMANCE ===

// Throttle function per limitare le chiamate
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Debounce function per ritardare le chiamate
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// === UTILITY AVANZATE ===

// Rileva il tipo di dispositivo con maggiore precisione
function getDeviceType() {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return 'tablet';
    }
    if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
        return 'mobile';
    }
    return 'desktop';
}

// Rileva se il dispositivo supporta il touch
function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// === MIGLIORAMENTI ACCESSIBILITÀ ===

// Gestisce la navigazione da tastiera nei dropdown
function handleKeyboardNavigation() {
    document.addEventListener('keydown', function(e) {
        const activeDropdown = document.querySelector('.dropdown-content.show');
        if (!activeDropdown) return;
        
        const links = activeDropdown.querySelectorAll('a');
        const currentFocus = document.activeElement;
        let currentIndex = Array.from(links).indexOf(currentFocus);
        
        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                currentIndex = (currentIndex + 1) % links.length;
                links[currentIndex].focus();
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                currentIndex = currentIndex <= 0 ? links.length - 1 : currentIndex - 1;
                links[currentIndex].focus();
                break;
                
            case 'Enter':
                if (currentFocus.tagName === 'A') {
                    currentFocus.click();
                }
                break;
        }
    });
}

// === AGGIORNAMENTO FUNZIONI ESISTENTI ===

// Sostituisce la funzione closeAllDropdowns con versione animata
closeAllDropdowns = closeDropdownsWithAnimation;

// === INIZIALIZZAZIONE AVANZATA ===

// Estende l'inizializzazione mobile
const originalInitAdvanced = initAdvancedMobileFeatures;
initAdvancedMobileFeatures = function() {
    originalInitAdvanced();
    
    // Aggiungi nuove funzionalità
    handleKeyboardNavigation();
    
    // Crea debug panel se in modalità debug
    if (window.location.search.includes('debug=true')) {
        createMobileDebugPanel();
        document.querySelector('#mobile-debug-panel').style.display = 'block';
    }
    
    console.log('🚀 Sistema mobile avanzato completamente inizializzato');
    console.log('📱 Dispositivo:', getDeviceType());
    console.log('👆 Touch support:', isTouchDevice());
};

// === UTILITY PUBBLICHE PER DEBUG ===

window.showMobileDebug = function() {
    createMobileDebugPanel();
    document.querySelector('#mobile-debug-panel').style.display = 'block';
};

window.hideMobileDebug = function() {
    const panel = document.querySelector('#mobile-debug-panel');
    if (panel) panel.style.display = 'none';
};

window.getMobileStats = function() {
    return {
        deviceType: getDeviceType(),
        isMobile: isMobileDevice(),
        isTouch: isTouchDevice(),
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        dropdowns: document.querySelectorAll('.dropdown-content').length,
        activeDropdowns: document.querySelectorAll('.dropdown-content.show').length,
        bodyClasses: Array.from(document.body.classList)
    };
};
