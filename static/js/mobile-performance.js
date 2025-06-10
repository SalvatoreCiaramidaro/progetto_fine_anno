// === MONITORAGGIO PERFORMANCE MOBILE ===
// Sistema per tracciare e ottimizzare le performance dell'interfaccia mobile

window.MobilePerformance = {
    metrics: {
        pageLoadTime: 0,
        domContentLoadedTime: 0,
        firstPaintTime: 0,
        dropdownOpenTime: [],
        averageDropdownTime: 0,
        touchResponseTimes: [],
        averageTouchResponse: 0,
        memoryUsage: 0,
        frameRate: 60
    },
    
    // Inizializza il monitoraggio
    init: function() {
        this.measurePageLoad();
        this.measureTouchResponse();
        this.measureFrameRate();
        this.measureMemory();
        
        // Avvia report periodico se in debug mode
        if (window.MobileConfig?.debug?.enabled) {
            setInterval(() => this.generateReport(), 10000);
        }
    },
    
    // Misura i tempi di caricamento pagina
    measurePageLoad: function() {
        window.addEventListener('load', () => {
            if (performance.timing) {
                this.metrics.pageLoadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
                this.metrics.domContentLoadedTime = performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart;
            }
            
            // Misura First Paint se disponibile
            if (performance.getEntriesByType) {
                const paintEntries = performance.getEntriesByType('paint');
                const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
                if (firstPaint) {
                    this.metrics.firstPaintTime = firstPaint.startTime;
                }
            }
        });
    },
    
    // Misura i tempi di risposta touch
    measureTouchResponse: function() {
        let touchStartTime = 0;
        
        document.addEventListener('touchstart', () => {
            touchStartTime = performance.now();
        });
        
        document.addEventListener('touchend', () => {
            if (touchStartTime > 0) {
                const responseTime = performance.now() - touchStartTime;
                this.metrics.touchResponseTimes.push(responseTime);
                
                // Mantieni solo gli ultimi 50 valori
                if (this.metrics.touchResponseTimes.length > 50) {
                    this.metrics.touchResponseTimes.shift();
                }
                
                // Calcola media
                this.metrics.averageTouchResponse = this.metrics.touchResponseTimes.reduce((a, b) => a + b, 0) / this.metrics.touchResponseTimes.length;
                touchStartTime = 0;
            }
        });
    },
    
    // Misura il frame rate
    measureFrameRate: function() {
        let frames = 0;
        let lastTime = performance.now();
        
        const countFrames = () => {
            frames++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                this.metrics.frameRate = Math.round(frames * 1000 / (currentTime - lastTime));
                frames = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(countFrames);
        };
        
        requestAnimationFrame(countFrames);
    },
    
    // Misura l'uso della memoria
    measureMemory: function() {
        const updateMemory = () => {
            if (performance.memory) {
                this.metrics.memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024 * 100) / 100;
            }
        };
        
        updateMemory();
        setInterval(updateMemory, 5000);
    },
    
    // Misura tempo apertura dropdown
    measureDropdownOpen: function(startTime) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.metrics.dropdownOpenTime.push(duration);
        
        // Mantieni solo gli ultimi 20 valori
        if (this.metrics.dropdownOpenTime.length > 20) {
            this.metrics.dropdownOpenTime.shift();
        }
        
        // Calcola media
        this.metrics.averageDropdownTime = this.metrics.dropdownOpenTime.reduce((a, b) => a + b, 0) / this.metrics.dropdownOpenTime.length;
    },
    
    // Genera report delle performance
    generateReport: function() {
        const report = {
            timestamp: new Date().toISOString(),
            device: {
                userAgent: navigator.userAgent,
                viewport: `${window.innerWidth}x${window.innerHeight}`,
                pixelRatio: window.devicePixelRatio,
                connection: navigator.connection?.effectiveType || 'unknown'
            },
            metrics: { ...this.metrics },
            scores: this.calculateScores()
        };
        
        console.group('📊 Mobile Performance Report');
        console.log('🕐 Page Load Time:', this.metrics.pageLoadTime + 'ms');
        console.log('🎨 First Paint:', this.metrics.firstPaintTime + 'ms');
        console.log('👆 Avg Touch Response:', Math.round(this.metrics.averageTouchResponse) + 'ms');
        console.log('📱 Avg Dropdown Time:', Math.round(this.metrics.averageDropdownTime) + 'ms');
        console.log('🖼️ Frame Rate:', this.metrics.frameRate + 'fps');
        console.log('💾 Memory Usage:', this.metrics.memoryUsage + 'MB');
        console.log('📈 Performance Score:', report.scores.overall + '/100');
        console.groupEnd();
        
        return report;
    },
    
    // Calcola score di performance
    calculateScores: function() {
        const scores = {
            pageLoad: 0,
            touchResponse: 0,
            frameRate: 0,
            memory: 0,
            overall: 0
        };
        
        // Score caricamento pagina (0-100)
        if (this.metrics.pageLoadTime < 1000) scores.pageLoad = 100;
        else if (this.metrics.pageLoadTime < 2000) scores.pageLoad = 80;
        else if (this.metrics.pageLoadTime < 3000) scores.pageLoad = 60;
        else if (this.metrics.pageLoadTime < 5000) scores.pageLoad = 40;
        else scores.pageLoad = 20;
        
        // Score touch response (0-100)
        if (this.metrics.averageTouchResponse < 50) scores.touchResponse = 100;
        else if (this.metrics.averageTouchResponse < 100) scores.touchResponse = 80;
        else if (this.metrics.averageTouchResponse < 150) scores.touchResponse = 60;
        else if (this.metrics.averageTouchResponse < 200) scores.touchResponse = 40;
        else scores.touchResponse = 20;
        
        // Score frame rate (0-100)
        if (this.metrics.frameRate >= 55) scores.frameRate = 100;
        else if (this.metrics.frameRate >= 45) scores.frameRate = 80;
        else if (this.metrics.frameRate >= 35) scores.frameRate = 60;
        else if (this.metrics.frameRate >= 25) scores.frameRate = 40;
        else scores.frameRate = 20;
        
        // Score memoria (0-100)
        if (this.metrics.memoryUsage < 10) scores.memory = 100;
        else if (this.metrics.memoryUsage < 20) scores.memory = 80;
        else if (this.metrics.memoryUsage < 50) scores.memory = 60;
        else if (this.metrics.memoryUsage < 100) scores.memory = 40;
        else scores.memory = 20;
        
        // Score complessivo
        scores.overall = Math.round((scores.pageLoad + scores.touchResponse + scores.frameRate + scores.memory) / 4);
        
        return scores;
    },
    
    // Ottimizzazioni automatiche basate sulle performance
    autoOptimize: function() {
        const scores = this.calculateScores();
        
        // Se le performance sono basse, applica ottimizzazioni
        if (scores.overall < 70) {
            console.warn('⚠️ Performance basse rilevate, applicando ottimizzazioni...');
            
            // Riduci animazioni se frame rate basso
            if (scores.frameRate < 60) {
                document.documentElement.style.setProperty('--animation-duration', '0.1s');
                console.log('🎬 Animazioni ridotte per migliorare frame rate');
            }
            
            // Riduci qualità ombre se memoria alta
            if (scores.memory < 60) {
                document.documentElement.style.setProperty('--box-shadow', 'none');
                console.log('💾 Ombre disabilitate per ridurre uso memoria');
            }
            
            // Disabilita effects non essenziali
            if (scores.overall < 50) {
                document.body.classList.add('low-performance-mode');
                console.log('🔧 Modalità performance ridotta attivata');
            }
        }
    }
};

// === INTEGRAZIONI CON SISTEMA MOBILE ===

// Hook per misurare performance dropdown
document.addEventListener('DOMContentLoaded', function() {
    // Inizializza monitoraggio
    MobilePerformance.init();
    
    // Hook nei dropdown per misurare tempi apertura
    const originalApplyStyles = window.applyMobileDropdownStyles;
    if (originalApplyStyles) {
        window.applyMobileDropdownStyles = function(dropdown) {
            const startTime = performance.now();
            originalApplyStyles(dropdown);
            MobilePerformance.measureDropdownOpen(startTime);
        };
    }
    
    // Auto-ottimizzazione dopo 5 secondi
    setTimeout(() => {
        MobilePerformance.autoOptimize();
    }, 5000);
});

// === UTILITY PUBBLICHE ===

window.getPerformanceReport = function() {
    return MobilePerformance.generateReport();
};

window.optimizeMobilePerformance = function() {
    MobilePerformance.autoOptimize();
};

window.resetPerformanceMetrics = function() {
    MobilePerformance.metrics = {
        pageLoadTime: 0,
        domContentLoadedTime: 0,
        firstPaintTime: 0,
        dropdownOpenTime: [],
        averageDropdownTime: 0,
        touchResponseTimes: [],
        averageTouchResponse: 0,
        memoryUsage: 0,
        frameRate: 60
    };
    console.log('📊 Metriche performance reset');
};
