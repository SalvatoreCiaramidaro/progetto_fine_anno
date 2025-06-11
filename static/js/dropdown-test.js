// === TEST DROPDOWN AUTOMATICO ===
// Script per testare il funzionamento dei dropdown

function testDropdowns() {
    console.log('🧪 Avvio test dropdown...');
    
    const results = {
        tests: [],
        passed: 0,
        failed: 0
    };
    
    // Test 1: Verifica presenza elementi
    function testElementsPresence() {
        const profileContainer = document.getElementById('profileImageContainer');
        const profileDropdown = document.getElementById('profileDropdown');
        const menuBtn = document.querySelector('.dropbtn');
        const menuDropdown = document.getElementById('menuDropdown');
        
        if (profileContainer || menuBtn) {
            addResult('Presenza elementi', true, 'Elementi dropdown trovati');
        } else {
            addResult('Presenza elementi', false, 'Nessun elemento dropdown trovato');
        }
    }
    
    // Test 2: Verifica sistema dropdown
    function testDropdownSystem() {
        if (window.dropdownSystem && window.dropdownSystem.isReady) {
            addResult('Sistema dropdown', true, 'Sistema inizializzato e pronto');
        } else {
            addResult('Sistema dropdown', false, 'Sistema non inizializzato');
        }
    }
    
    // Test 3: Test apertura dropdown (se presente)
    function testDropdownOpening() {
        const menuBtn = document.querySelector('.dropbtn');
        const menuDropdown = document.getElementById('menuDropdown');
        
        if (menuBtn && menuDropdown) {
            // Simula click
            menuBtn.click();
            
            setTimeout(() => {
                if (menuDropdown.classList.contains('show')) {
                    addResult('Apertura dropdown', true, 'Dropdown si apre correttamente');
                    
                    // Chiudi il dropdown dopo il test
                    menuBtn.click();
                } else {
                    addResult('Apertura dropdown', false, 'Dropdown non si apre');
                }
                
                // Mostra risultati finali
                showResults();
            }, 100);
        } else {
            addResult('Apertura dropdown', false, 'Elementi non presenti per il test');
            showResults();
        }
    }
    
    function addResult(testName, passed, message) {
        results.tests.push({ name: testName, passed, message });
        if (passed) {
            results.passed++;
            console.log(`✅ ${testName}: ${message}`);
        } else {
            results.failed++;
            console.log(`❌ ${testName}: ${message}`);
        }
    }
    
    function showResults() {
        console.log('\n📊 RISULTATI TEST DROPDOWN:');
        console.log(`Totale test: ${results.tests.length}`);
        console.log(`Passati: ${results.passed}`);
        console.log(`Falliti: ${results.failed}`);
        
        if (results.failed === 0) {
            console.log('🎉 Tutti i test sono passati!');
            showNotification('✅ Test completati: Dropdown funzionano correttamente!', 'success');
        } else {
            console.log('⚠️ Alcuni test sono falliti');
            showNotification('⚠️ Test completati: Alcuni problemi rilevati', 'warning');
        }
    }
    
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : '#ffc107'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            font-weight: bold;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease;
        `;
        notification.textContent = message;
        
        // Aggiungi animazione CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
            style.remove();
        }, 5000);
    }
    
    // Esegui test in sequenza
    testElementsPresence();
    testDropdownSystem();
    testDropdownOpening();
}

// Esponi funzione globalmente
window.testDropdowns = testDropdowns;

// Auto-test se richiesto via URL
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.search.includes('test=dropdown')) {
        setTimeout(testDropdowns, 2000);
    }
});
