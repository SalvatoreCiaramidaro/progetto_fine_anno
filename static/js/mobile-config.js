// === CONFIGURAZIONE SISTEMA MOBILE ===
// Configurazioni centralizzate per l'interfaccia mobile di WikiSportCars

window.MobileConfig = {
    // === BREAKPOINTS ===
    breakpoints: {
        mobile: 768,
        tablet: 1024,
        desktop: 1200
    },
    
    // === ANIMAZIONI ===
    animations: {
        duration: {
            fast: 200,
            normal: 300,
            slow: 500
        },
        easing: {
            smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
            bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            ease: 'ease-in-out'
        }
    },
    
    // === DROPDOWN ===
    dropdown: {
        position: {
            mobile: {
                position: 'fixed',
                left: '50%',
                bottom: '2rem',
                transform: 'translateX(-50%)',
                width: '90vw',
                maxWidth: '350px',
                minWidth: '280px'
            },
            desktop: {
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: '0',
                width: '220px'
            }
        },
        zIndex: 9999,
        overlayOpacity: 0.3
    },
    
    // === TOUCH ===
    touch: {
        tapHighlight: 'rgba(231, 76, 60, 0.1)',
        minTargetSize: 44, // px - Apple HIG recommendation
        swipeThreshold: 50, // px
        swipeVelocity: 0.3
    },
    
    // === PERFORMANCE ===
    performance: {
        throttleDelay: 16, // ~60fps
        debounceDelay: 250,
        maxAnimationsQueue: 5
    },
    
    // === DEBUG ===
    debug: {
        enabled: false,
        logLevel: 'info', // 'error', 'warn', 'info', 'debug'
        showPanel: false,
        autoTest: false
    },
    
    // === ACCESSIBILITY ===
    a11y: {
        respectReducedMotion: true,
        focusOutlineWidth: 2,
        focusOutlineColor: '#e74c3c',
        minContrast: 4.5
    }
};

// === UTILITY PER CONFIGURAZIONE ===
window.MobileConfig.isMobile = function() {
    return window.innerWidth <= this.breakpoints.mobile;
};

window.MobileConfig.isTablet = function() {
    return window.innerWidth > this.breakpoints.mobile && 
           window.innerWidth <= this.breakpoints.tablet;
};

window.MobileConfig.isDesktop = function() {
    return window.innerWidth > this.breakpoints.tablet;
};

window.MobileConfig.updateFromUrl = function() {
    const url = new URL(window.location);
    if (url.searchParams.get('debug') === 'true') {
        this.debug.enabled = true;
        this.debug.showPanel = true;
    }
    if (url.searchParams.get('test') === 'true') {
        this.debug.autoTest = true;
    }
};

// === LOGGER CONFIGURABILE ===
window.MobileConfig.log = function(level, message, ...args) {
    if (!this.debug.enabled) return;
    
    const levels = ['error', 'warn', 'info', 'debug'];
    const currentLevelIndex = levels.indexOf(this.debug.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    
    if (messageLevelIndex <= currentLevelIndex) {
        const prefix = {
            error: '❌',
            warn: '⚠️',
            info: 'ℹ️',
            debug: '🔍'
        }[level];
        
        console[level](`${prefix} [Mobile]`, message, ...args);
    }
};

// Inizializza configurazione da URL
document.addEventListener('DOMContentLoaded', function() {
    window.MobileConfig.updateFromUrl();
    window.MobileConfig.log('info', 'Configurazione mobile inizializzata', window.MobileConfig);
});
