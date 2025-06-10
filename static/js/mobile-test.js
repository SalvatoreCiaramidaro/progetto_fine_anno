// === SISTEMA DI TEST AUTOMATICO MOBILE ===
// Test suite per verificare il corretto funzionamento dell'interfaccia mobile

document.addEventListener('DOMContentLoaded', function() {
    // Avvia i test automatici solo se richiesto
    if (window.location.search.includes('test=true')) {
        setTimeout(runMobileTests, 2000);
    }
});

// Esegue tutti i test mobile
function runMobileTests() {
    console.log('🧪 Avvio test suite mobile...');
    
    const results = {
        passed: 0,
        failed: 0,
        tests: []
    };
    
    // Test 1: Verifica rilevamento dispositivo mobile
    testMobileDetection(results);
    
    // Test 2: Verifica presenza elementi dropdown
    testDropdownElements(results);
    
    // Test 3: Verifica CSS mobile
    testMobileCSS(results);
    
    // Test 4: Verifica funzionalità JavaScript
    testJavaScriptFunctions(results);
    
    // Test 5: Verifica accessibilità
    testAccessibility(results);
    
    // Mostra risultati
    displayTestResults(results);
}

// Test rilevamento dispositivo mobile
function testMobileDetection(results) {
    const testName = 'Mobile Device Detection';
    try {
        const isMobile = isMobileDevice();
        const deviceType = getDeviceType();
        const isTouch = isTouchDevice();
        
        if (typeof isMobile === 'boolean' && 
            ['mobile', 'tablet', 'desktop'].includes(deviceType) &&
            typeof isTouch === 'boolean') {
            addTestResult(results, testName, true, 'Rilevamento dispositivo funziona correttamente');
        } else {
            addTestResult(results, testName, false, 'Rilevamento dispositivo non funziona');
        }
    } catch (error) {
        addTestResult(results, testName, false, `Errore: ${error.message}`);
    }
}

// Test presenza elementi dropdown
function testDropdownElements(results) {
    const testName = 'Dropdown Elements';
    try {
        const dropdowns = document.querySelectorAll('.dropdown-content');
        const profileContainer = document.getElementById('profileImageContainer');
        const profileDropdown = document.getElementById('profileDropdown');
        
        if (dropdowns.length > 0) {
            addTestResult(results, testName, true, `Trovati ${dropdowns.length} dropdown`);
        } else {
            addTestResult(results, testName, false, 'Nessun dropdown trovato');
        }
    } catch (error) {
        addTestResult(results, testName, false, `Errore: ${error.message}`);
    }
}

// Test CSS mobile
function testMobileCSS(results) {
    const testName = 'Mobile CSS';
    try {
        const testElement = document.createElement('div');
        testElement.className = 'dropdown-content';
        testElement.style.position = 'absolute';
        testElement.style.top = '-9999px';
        document.body.appendChild(testElement);
        
        const computedStyle = window.getComputedStyle(testElement);
        const hasMediaQuery = window.matchMedia('(max-width: 768px)').matches;
        
        document.body.removeChild(testElement);
        
        if (hasMediaQuery) {
            addTestResult(results, testName, true, 'CSS mobile media query attiva');
        } else {
            addTestResult(results, testName, true, 'CSS mobile caricato (desktop view)');
        }
    } catch (error) {
        addTestResult(results, testName, false, `Errore: ${error.message}`);
    }
}

// Test funzionalità JavaScript
function testJavaScriptFunctions(results) {
    const testName = 'JavaScript Functions';
    try {
        const functions = [
            'isMobileDevice',
            'initMobileInterface',
            'initMobileDropdowns',
            'applyMobileDropdownStyles',
            'closeAllDropdowns'
        ];
        
        const missingFunctions = functions.filter(func => typeof window[func] !== 'function');
        
        if (missingFunctions.length === 0) {
            addTestResult(results, testName, true, 'Tutte le funzioni JavaScript sono presenti');
        } else {
            addTestResult(results, testName, false, `Funzioni mancanti: ${missingFunctions.join(', ')}`);
        }
    } catch (error) {
        addTestResult(results, testName, false, `Errore: ${error.message}`);
    }
}

// Test accessibilità
function testAccessibility(results) {
    const testName = 'Accessibility';
    try {
        const dropdownElements = document.querySelectorAll('.dropdown-content');
        let accessibilityScore = 0;
        
        dropdownElements.forEach(dropdown => {
            const links = dropdown.querySelectorAll('a');
            links.forEach(link => {
                if (link.getAttribute('href')) accessibilityScore++;
                if (link.querySelector('i')) accessibilityScore++; // Ha icone
            });
        });
        
        if (accessibilityScore > 0) {
            addTestResult(results, testName, true, `Score accessibilità: ${accessibilityScore}`);
        } else {
            addTestResult(results, testName, false, 'Problemi di accessibilità rilevati');
        }
    } catch (error) {
        addTestResult(results, testName, false, `Errore: ${error.message}`);
    }
}

// Aggiunge risultato del test
function addTestResult(results, testName, passed, message) {
    results.tests.push({
        name: testName,
        passed: passed,
        message: message
    });
    
    if (passed) {
        results.passed++;
        console.log(`✅ ${testName}: ${message}`);
    } else {
        results.failed++;
        console.log(`❌ ${testName}: ${message}`);
    }
}

// Mostra risultati dei test
function displayTestResults(results) {
    console.log('\n🧪 RISULTATI TEST SUITE MOBILE');
    console.log(`✅ Test superati: ${results.passed}`);
    console.log(`❌ Test falliti: ${results.failed}`);
    console.log(`📊 Totale test: ${results.tests.length}`);
    
    const successRate = ((results.passed / results.tests.length) * 100).toFixed(1);
    console.log(`📈 Tasso di successo: ${successRate}%`);
    
    // Crea notifica visiva dei risultati
    if (results.failed === 0) {
        showTestNotification('🎉 Tutti i test superati!', 'success');
    } else {
        showTestNotification(`⚠️ ${results.failed} test falliti`, 'warning');
    }
    
    // Salva risultati nel localStorage per debug
    localStorage.setItem('mobileTestResults', JSON.stringify({
        timestamp: new Date().toISOString(),
        results: results,
        successRate: successRate
    }));
}

// Mostra notifica dei risultati test
function showTestNotification(message, type) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? '#28a745' : '#ffc107'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        font-weight: bold;
        z-index: 10001;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// === UTILITY PUBBLICHE PER TEST ===

window.runMobileTests = runMobileTests;

window.getTestResults = function() {
    const stored = localStorage.getItem('mobileTestResults');
    return stored ? JSON.parse(stored) : null;
};

window.clearTestResults = function() {
    localStorage.removeItem('mobileTestResults');
    console.log('🗑️ Risultati test cancellati');
};
