// Mobile enhancements for WikiSportCars - VERSIONE DROPDOWN STANDARD
// Converte il profile dropdown per usare la stessa logica del dropdown standard

// Flag di inizializzazione
let mobileEnhanced = false;

document.addEventListener('DOMContentLoaded', function() {
    if (mobileEnhanced) return;
    
    console.log('🚀 Mobile enhancements - CONVERSIONE A DROPDOWN STANDARD');
    
    try {
        // Forza inizializzazione per test anche su desktop se nella pagina di test
        const isTestPage = window.location.pathname.includes('test_dropdown') || 
                          window.location.pathname.includes('test_final_profile_dropdown') ||
                          window.location.pathname.includes('test_profile_dropdown') ||
                          window.location.pathname.includes('test_mobile');
        
        if (isMobileDevice() || isTestPage) {
            console.log('📱 Dispositivo mobile/pagina test - conversione a logica standard');
            convertProfileToStandardDropdown();
            setupMobileDropdowns();
        } else {
            console.log('🖥️ Desktop - mobile enhancements non necessari');
        }
        mobileEnhanced = true;
    } catch (error) {
        console.error('❌ Errore mobile enhancements:', error);
    }
});

function isMobileDevice() {
    const userAgent = navigator.userAgent.toLowerCase();
    const mobileKeywords = ['android', 'webos', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone'];
    return mobileKeywords.some(keyword => userAgent.includes(keyword)) || window.innerWidth <= 768;
}

function convertProfileToStandardDropdown() {
    console.log('🔄 Conversione del profile dropdown a logica standard...');
    
    const profileDropdown = document.getElementById('profileDropdown');
    const profileContainer = document.getElementById('profileImageContainer');
    
    if (profileDropdown && profileContainer) {
        // RIMUOVI la classe profile-dropdown che ha stili CSS conflittuali 
        profileDropdown.classList.remove('profile-dropdown');
        
        // AGGIUNGI le classi per usare la stessa logica del dropdown standard
        profileDropdown.classList.add('dropdown-content');
        profileContainer.classList.add('dropbtn');
        
        console.log('✅ Profile dropdown convertito:');
        console.log('   - Rimossa classe profile-dropdown (stili CSS conflittuali)');
        console.log('   - Aggiunta classe dropdown-content (stili CSS compatibili)');
        console.log('   - Aggiunta classe dropbtn al container');
        
        // Configura SUBITO l'event listener usando la logica standard
        setupProfileClickHandler(profileContainer, profileDropdown);
    }
}

function setupProfileClickHandler(container, dropdown) {
    console.log('🖱️ Configurazione event listener standard per profile dropdown...');
    console.log('Container:', container);
    console.log('Dropdown:', dropdown);
    
    // Rimuovi vecchi event listeners clonando l'elemento
    const newContainer = container.cloneNode(true);
    const parent = container.parentNode;
    parent.replaceChild(newContainer, container);
    
    console.log('✅ Elemento container clonato e sostituito');
    
    // IMPORTANTE: Aggiorna il riferimento al dropdown dopo la sostituzione del container
    const updatedDropdown = document.getElementById('profileDropdown');
    
    // Aggiungi event listener STANDARD come per dropdown non-loggato
    newContainer.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        console.log('🔄 CLICK RILEVATO su profilo - usando logica dropdown standard');
        console.log('Dropdown before toggle:', {
            classes: Array.from(updatedDropdown.classList),
            hasShow: updatedDropdown.classList.contains('show'),
            computedDisplay: getComputedStyle(updatedDropdown).display,
            computedOpacity: getComputedStyle(updatedDropdown).opacity,
            computedVisibility: getComputedStyle(updatedDropdown).visibility
        });
        
        // Chiudi tutti gli altri dropdown come fa il dropdown standard
        document.querySelectorAll('.dropdown-content.show').forEach(dd => {
            if (dd !== updatedDropdown) {
                dd.classList.remove('show');
                console.log('🔄 Chiuso altro dropdown:', dd.id);
            }
        });
        
        // Toggle dropdown usando classe standard
        updatedDropdown.classList.toggle('show');
        
        console.log('✅ Dropdown toggled - classe show:', updatedDropdown.classList.contains('show'));
        console.log('Dropdown after toggle:', {
            classes: Array.from(updatedDropdown.classList),
            hasShow: updatedDropdown.classList.contains('show'),
            computedDisplay: getComputedStyle(updatedDropdown).display,
            computedOpacity: getComputedStyle(updatedDropdown).opacity,
            computedVisibility: getComputedStyle(updatedDropdown).visibility,
            computedPointerEvents: getComputedStyle(updatedDropdown).pointerEvents
        });
    });
    
    console.log('🔧 Event listener configurato per profile dropdown');
}

function setupMobileDropdowns() {
    console.log('📋 Setup dropdown mobile con logica standard...');
    
    // Applica stili mobile solo ai dropdown con classe dropdown-content
    const dropdowns = document.querySelectorAll('.dropdown-content');
    
    dropdowns.forEach(dropdown => {
        enhanceDropdownForMobile(dropdown);
    });
    
    // Setup click handlers che usano la stessa logica di base.html
    setupStandardClickHandlers();
}

function enhanceDropdownForMobile(dropdown) {
    if (!dropdown) return;
    
    console.log(`🎨 Migliorando dropdown per mobile: ${dropdown.id || dropdown.className}`);
    
    // Aggiungi classe per identificazione
    dropdown.classList.add('mobile-enhanced');
    
    // Observer per rilevare quando il dropdown diventa visibile
    const observer = new MutationObserver(() => {
        if (dropdown.classList.contains('show') && !dropdown.classList.contains('mobile-positioned')) {
            console.log('🔄 Observer rilevato: dropdown mostrato, applicando stili mobile...');
            applyMobileStyles(dropdown);
        }
    });
    
    observer.observe(dropdown, {
        attributes: true,
        attributeFilter: ['class']
    });
    
    // CHECK IMMEDIATO: se il dropdown è già visibile, applica subito gli stili mobile
    if (dropdown.classList.contains('show')) {
        console.log('🔄 Dropdown già visibile al momento dell\'enhancement, applicando stili mobile...');
        applyMobileStyles(dropdown);
    }
    
    console.log(`✅ Dropdown ${dropdown.id} configurato per mobile`);
}

function applyMobileStyles(dropdown) {
    if (!dropdown) return;
    
    console.log('📱 Applicando stili mobile per posizionamento in basso allo schermo');
    console.log('Target dropdown:', dropdown.id, dropdown.classList);
    
    // Assicurati che abbia la classe dropdown-content per ereditare tutti gli stili CSS corretti
    dropdown.classList.add('dropdown-content');
    
    // FORZA gli stili mobile per posizionare il dropdown in basso allo schermo
    const mobileStyles = {
        'position': 'fixed',
        'left': '50%',
        'transform': 'translateX(-50%)',
        'bottom': '20px',
        'top': 'auto',
        'right': 'auto',
        'width': '90vw',
        'max-width': '320px',
        'z-index': '9999'
    };
    
    // Applica TUTTI gli stili mobile con !important per sovrascrivere il CSS esistente
    Object.entries(mobileStyles).forEach(([prop, value]) => {
        dropdown.style.setProperty(prop, value, 'important');
    });
    
    // EXTRA: rimuovi eventuali stili di posizionamento ereditati dal profile-dropdown
    dropdown.style.removeProperty('top');
    dropdown.style.setProperty('bottom', '20px', 'important');
    
    // Marca come mobile-ready
    dropdown.classList.add('mobile-positioned');
    
    console.log('✅ Stili mobile applicati - dropdown posizionato in basso');
    console.log('Dropdown position after mobile styles:', {
        position: getComputedStyle(dropdown).position,
        bottom: getComputedStyle(dropdown).bottom,
        top: getComputedStyle(dropdown).top,
        left: getComputedStyle(dropdown).left,
        transform: getComputedStyle(dropdown).transform
    });
}

function setupStandardClickHandlers() {
    console.log('🖱️ Setup handler click globali...');
    
    // Click outside per chiudere - IDENTICO al comportamento standard
    document.addEventListener('click', (e) => {
        const openDropdowns = document.querySelectorAll('.dropdown-content.show');
        openDropdowns.forEach(dropdown => {
            // Trova il parent container
            const container = dropdown.parentElement?.querySelector('.dropbtn, .profile-image-container');
            
            if (!dropdown.contains(e.target) && !container?.contains(e.target)) {
                dropdown.classList.remove('show');
                console.log('🔄 Dropdown chiuso per click outside');
            }
        });
    });
    
    console.log('✅ Click handlers globali configurati');
}

// === FUNZIONI UTILITY GLOBALI ===

// Debug function per testing
window.debugMobileDropdowns = function() {
    console.log('🔧 Debug Mobile Dropdowns:');
    const dropdowns = document.querySelectorAll('.dropdown-content, .profile-dropdown');
    dropdowns.forEach(dd => {
        const styles = window.getComputedStyle(dd);
        console.log(`Dropdown ${dd.id}:`, {
            show: dd.classList.contains('show'),
            position: styles.position,
            pointerEvents: styles.pointerEvents,
            opacity: styles.opacity,
            visibility: styles.visibility,
            classes: Array.from(dd.classList)
        });
    });
};

// Test profile dropdown click function
window.testProfileClick = function() {
    console.log('🧪 Testing profile dropdown click...');
    const container = document.getElementById('profileImageContainer');
    const dropdown = document.getElementById('profileDropdown');
    
    if (container && dropdown) {
        console.log('Before click - dropdown classes:', Array.from(dropdown.classList));
        console.log('Before click - container classes:', Array.from(container.classList));
        
        // Simula click
        container.click();
        
        setTimeout(() => {
            console.log('After click - dropdown classes:', Array.from(dropdown.classList));
            console.log('After click - dropdown visible:', dropdown.classList.contains('show'));
            
            const styles = getComputedStyle(dropdown);
            console.log('After click - computed styles:', {
                opacity: styles.opacity,
                visibility: styles.visibility,
                pointerEvents: styles.pointerEvents,
                position: styles.position
            });
        }, 100);
    } else {
        console.error('❌ Profile elements not found!');
    }
};

// Force conversion function for testing
window.forceConvertProfile = function() {
    console.log('🔧 Force converting profile dropdown...');
    convertProfileToStandardDropdown();
    setupMobileDropdowns();
};

// Force mobile styles function for testing  
window.forceMobileStyles = function() {
    console.log('🔧 Force applying mobile styles to profile dropdown...');
    const profileDropdown = document.getElementById('profileDropdown');
    if (profileDropdown) {
        profileDropdown.classList.add('dropdown-content');
        profileDropdown.classList.add('show');
        applyMobileStyles(profileDropdown);
        console.log('✅ Mobile styles applied to profile dropdown');
    } else {
        console.error('❌ Profile dropdown not found');
    }
};

// Force apply styles function per testing
window.forceApplyMobileStyles = function() {
    console.log('🔧 Force applying mobile styles...');
    const dropdowns = document.querySelectorAll('.dropdown-content.show');
    dropdowns.forEach(applyMobileStyles);
};

// Utility functions
function addMobileClasses() {
    document.body.classList.add('mobile-device');
}

function optimizeSearchInput() {
    const searchInput = document.querySelector('input[type="search"], .search-input');
    if (searchInput) {
        searchInput.style.fontSize = '16px'; // Previene zoom su iOS
    }
}

// Inizializzazione utilities
if (isMobileDevice()) {
    addMobileClasses();
    optimizeSearchInput();
}

// FALLBACK: Listener per resize window che riattiva mobile enhancements se necessario
window.addEventListener('resize', function() {
    if (isMobileDevice() && !mobileEnhanced) {
        console.log('📱 Resize rilevato - dispositivo ora mobile, attivando enhancements...');
        try {
            convertProfileToStandardDropdown();
            setupMobileDropdowns();
            mobileEnhanced = true;
        } catch (error) {
            console.error('❌ Errore durante resize enhancement:', error);
        }
    }
});

// FALLBACK 2: Forza controllo mobile dopo un breve delay per casi edge
setTimeout(() => {
    if (isMobileDevice() && !mobileEnhanced) {
        console.log('📱 Controllo delay - dispositivo mobile, attivando enhancements...');
        try {
            convertProfileToStandardDropdown();
            setupMobileDropdowns();
            mobileEnhanced = true;
        } catch (error) {
            console.error('❌ Errore durante delay enhancement:', error);
        }
    }
}, 1000);
