// === SISTEMA FEEDBACK MOBILE ===
// Raccoglie feedback sull'esperienza utente mobile

window.MobileFeedback = {
    sessionData: {
        startTime: Date.now(),
        interactions: [],
        errors: [],
        performance: {},
        deviceInfo: {}
    },
    
    // Inizializza il sistema di feedback
    init: function() {
        this.collectDeviceInfo();
        this.trackInteractions();
        this.trackErrors();
        this.setupFeedbackWidget();
        
        // Salva dati sessione prima di chiudere
        window.addEventListener('beforeunload', () => {
            this.saveSessionData();
        });
    },
    
    // Raccoglie informazioni dispositivo
    collectDeviceInfo: function() {
        this.sessionData.deviceInfo = {
            userAgent: navigator.userAgent,
            viewport: `${window.innerWidth}x${window.innerHeight}`,
            pixelRatio: window.devicePixelRatio,
            touchPoints: navigator.maxTouchPoints,
            connection: navigator.connection?.effectiveType || 'unknown',
            platform: navigator.platform,
            language: navigator.language,
            cookieEnabled: navigator.cookieEnabled,
            onlineStatus: navigator.onLine
        };
    },
    
    // Traccia interazioni utente
    trackInteractions: function() {
        const trackEvent = (type, target, details = {}) => {
            this.sessionData.interactions.push({
                timestamp: Date.now(),
                type: type,
                target: target.tagName + (target.id ? `#${target.id}` : '') + (target.className ? `.${target.className.split(' ')[0]}` : ''),
                details: details
            });
        };
        
        // Touch events
        document.addEventListener('touchstart', (e) => {
            trackEvent('touch_start', e.target, {
                touches: e.touches.length,
                x: e.touches[0].clientX,
                y: e.touches[0].clientY
            });
        });
        
        // Click events
        document.addEventListener('click', (e) => {
            trackEvent('click', e.target, {
                x: e.clientX,
                y: e.clientY
            });
        });
        
        // Dropdown events
        document.addEventListener('click', (e) => {
            if (e.target.closest('.dropdown-content, .profile-image-container')) {
                trackEvent('dropdown_interaction', e.target, {
                    action: 'open_attempt'
                });
            }
        });
        
        // Form submissions
        document.addEventListener('submit', (e) => {
            trackEvent('form_submit', e.target, {
                formId: e.target.id,
                elements: e.target.elements.length
            });
        });
    },
    
    // Traccia errori JavaScript
    trackErrors: function() {
        window.addEventListener('error', (e) => {
            this.sessionData.errors.push({
                timestamp: Date.now(),
                message: e.message,
                filename: e.filename,
                lineno: e.lineno,
                colno: e.colno,
                stack: e.error?.stack
            });
        });
        
        // Promise rejections
        window.addEventListener('unhandledrejection', (e) => {
            this.sessionData.errors.push({
                timestamp: Date.now(),
                type: 'unhandled_promise_rejection',
                reason: e.reason
            });
        });
    },
    
    // Crea widget feedback
    setupFeedbackWidget: function() {
        // Solo se debug è attivo
        if (!window.MobileConfig?.debug?.enabled) return;
        
        const widget = document.createElement('div');
        widget.id = 'mobile-feedback-widget';
        widget.style.cssText = `
            position: fixed;
            bottom: 80px;
            right: 20px;
            width: 60px;
            height: 60px;
            background: #e74c3c;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
            cursor: pointer;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
            transition: transform 0.2s ease;
        `;
        
        widget.innerHTML = '💬';
        widget.title = 'Invia Feedback Mobile';
        
        widget.addEventListener('click', () => {
            this.showFeedbackForm();
        });
        
        widget.addEventListener('touchstart', () => {
            widget.style.transform = 'scale(0.95)';
        });
        
        widget.addEventListener('touchend', () => {
            widget.style.transform = 'scale(1)';
        });
        
        document.body.appendChild(widget);
    },
    
    // Mostra form feedback
    showFeedbackForm: function() {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0,0,0,0.5);
            z-index: 10001;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        `;
        
        const form = document.createElement('div');
        form.style.cssText = `
            background: white;
            border-radius: 12px;
            padding: 20px;
            max-width: 400px;
            width: 100%;
            max-height: 80vh;
            overflow-y: auto;
        `;
        
        form.innerHTML = `
            <h3 style="margin: 0 0 15px 0; color: #e74c3c;">Feedback Mobile</h3>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Valutazione Generale:</label>
                <div id="rating-stars" style="font-size: 24px; margin-bottom: 10px;">
                    ${'★'.repeat(5).split('').map((star, i) => 
                        `<span style="cursor: pointer; color: #ddd;" data-rating="${i+1}">${star}</span>`
                    ).join('')}
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Cosa non ha funzionato?</label>
                <div>
                    <label><input type="checkbox" value="dropdown"> Dropdown non si aprivano</label><br>
                    <label><input type="checkbox" value="slow"> Interfaccia lenta</label><br>
                    <label><input type="checkbox" value="touch"> Problemi touch</label><br>
                    <label><input type="checkbox" value="layout"> Layout rotto</label><br>
                    <label><input type="checkbox" value="search"> Ricerca non funziona</label><br>
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <label style="display: block; margin-bottom: 5px; font-weight: bold;">Commenti:</label>
                <textarea id="feedback-comments" style="width: 100%; height: 80px; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" placeholder="Descrivi la tua esperienza..."></textarea>
            </div>
            
            <div style="text-align: right;">
                <button id="cancel-feedback" style="margin-right: 10px; padding: 8px 16px; background: #ccc; border: none; border-radius: 4px; cursor: pointer;">Annulla</button>
                <button id="send-feedback" style="padding: 8px 16px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer;">Invia</button>
            </div>
        `;
        
        overlay.appendChild(form);
        document.body.appendChild(overlay);
        
        // Gestione rating stelle
        let selectedRating = 0;
        const stars = form.querySelectorAll('#rating-stars span');
        stars.forEach((star, index) => {
            star.addEventListener('click', () => {
                selectedRating = index + 1;
                stars.forEach((s, i) => {
                    s.style.color = i < selectedRating ? '#e74c3c' : '#ddd';
                });
            });
        });
        
        // Gestione bottoni
        form.querySelector('#cancel-feedback').addEventListener('click', () => {
            overlay.remove();
        });
        
        form.querySelector('#send-feedback').addEventListener('click', () => {
            this.submitFeedback({
                rating: selectedRating,
                issues: Array.from(form.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value),
                comments: form.querySelector('#feedback-comments').value,
                sessionData: this.getSessionSummary()
            });
            overlay.remove();
        });
        
        // Chiudi cliccando fuori
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
    },
    
    // Invia feedback
    submitFeedback: function(feedbackData) {
        console.log('📝 Feedback Mobile Ricevuto:', feedbackData);
        
        // Simula invio al server (in produzione, fare una POST request)
        const feedbackWithMeta = {
            ...feedbackData,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };
        
        // Salva nel localStorage per demo
        const existingFeedback = JSON.parse(localStorage.getItem('mobileFeedback') || '[]');
        existingFeedback.push(feedbackWithMeta);
        localStorage.setItem('mobileFeedback', JSON.stringify(existingFeedback));
        
        // Mostra conferma
        this.showFeedbackConfirmation();
        
        return feedbackWithMeta;
    },
    
    // Mostra conferma feedback inviato
    showFeedbackConfirmation: function() {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #28a745;
            color: white;
            padding: 20px 30px;
            border-radius: 8px;
            font-weight: bold;
            z-index: 10002;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        notification.textContent = '✅ Grazie per il feedback!';
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    },
    
    // Ottieni riassunto sessione
    getSessionSummary: function() {
        return {
            duration: Date.now() - this.sessionData.startTime,
            interactionsCount: this.sessionData.interactions.length,
            errorsCount: this.sessionData.errors.length,
            deviceInfo: this.sessionData.deviceInfo,
            performance: window.MobilePerformance ? window.MobilePerformance.calculateScores() : null
        };
    },
    
    // Salva dati sessione
    saveSessionData: function() {
        const sessionSummary = {
            ...this.getSessionSummary(),
            endTime: Date.now(),
            interactions: this.sessionData.interactions.slice(-50), // Ultimi 50
            errors: this.sessionData.errors
        };
        
        localStorage.setItem('lastMobileSession', JSON.stringify(sessionSummary));
    }
};

// === INIZIALIZZAZIONE ===
document.addEventListener('DOMContentLoaded', function() {
    // Inizializza solo su mobile e se debug attivo
    if (window.MobileConfig?.isMobile?.() && window.MobileConfig?.debug?.enabled) {
        MobileFeedback.init();
    }
});

// === UTILITY PUBBLICHE ===
window.showMobileFeedback = function() {
    MobileFeedback.showFeedbackForm();
};

window.getMobileFeedbackData = function() {
    return JSON.parse(localStorage.getItem('mobileFeedback') || '[]');
};

window.clearMobileFeedback = function() {
    localStorage.removeItem('mobileFeedback');
    localStorage.removeItem('lastMobileSession');
    console.log('🗑️ Dati feedback mobile cancellati');
};
