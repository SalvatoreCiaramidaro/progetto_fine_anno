function validatePassword(input) {
    const password = document.getElementById('password').value;
    if (input.value !== password) {
        input.setCustomValidity('Le password non corrispondono.');
    } else {
        input.setCustomValidity('');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM completamente caricato nella pagina di registrazione');
    
    // Piccolo ritardo per assicurarsi che tutti gli elementi siano renderizzati correttamente
    setTimeout(() => {
        // Password toggle
        document.querySelectorAll('.toggle-password').forEach(toggle => {
            toggle.addEventListener('click', function() {
                const targetId = this.getAttribute('data-target');
                const input = document.getElementById(targetId);
                if (input.type === 'password') {
                    input.type = 'text';
                    this.innerHTML = '<i class="fas fa-eye-slash"></i>';
                } else {
                    input.type = 'password';
                    this.innerHTML = '<i class="fas fa-eye"></i>';
                }
            });
        });
        
        console.log('Event listeners configurati');
    }, 100);
    const form = document.querySelector('#register-form');
    const messageContainer = document.querySelector('#message-container');
    
    // Controllo requisiti password in real-time
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        console.log('Password input trovato:', passwordInput);
        
        // Mostra subito i requisiti della password quando il campo ottiene il focus
        passwordInput.addEventListener('focus', function() {
            const requirementsBox = document.querySelector('.password-requirements');
            if (requirementsBox) {
                requirementsBox.style.display = 'block';
            }
        });
        
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            
            const requirements = {
                length: password.length >= 8,
                lowercase: /[a-z]/.test(password),
                uppercase: /[A-Z]/.test(password),
                number: /\d/.test(password),
                special: /[@$!%*?&.#_\-+=(){}[\]|:;,<>\/~]/.test(password)
            };
            
            // Conta quanti requisiti sono soddisfatti
            let metCount = Object.values(requirements).filter(Boolean).length;
            
            // Aggiorna l'indicatore di forza
            const strengthIndicator = document.getElementById('password-strength-indicator');
            const strengthText = document.getElementById('strength-text');
            
            if (strengthIndicator && strengthText) {
                strengthIndicator.className = 'strength';
                
                if (password.length === 0) {
                    strengthIndicator.style.width = '0%';
                    strengthText.textContent = '';
                } else if (metCount < 3) {
                    strengthIndicator.classList.add('strength-weak');
                    strengthText.textContent = 'Debole';
                    strengthText.style.color = '#dc3545';
                } else if (metCount < 5) {
                    strengthIndicator.classList.add('strength-medium');
                    strengthText.textContent = 'Media';
                    strengthText.style.color = '#ffc107';
                } else {
                    strengthIndicator.classList.add('strength-strong');
                    strengthText.textContent = 'Forte';
                    strengthText.style.color = '#28a745';
                }
            }
            
            // Aggiorna le icone dei requisiti
            for (const [req, isMet] of Object.entries(requirements)) {
                const reqIcon = document.querySelector(`.requirement-check[data-req="${req}"]`);
                if (reqIcon) {
                    // Se il requisito era già soddisfatto, non riapplicare la classe (evita l'animazione)
                    if (reqIcon.classList.contains('requirement-met') && isMet) {
                        continue;
                    }
                    
                    // Rimuovi le classi precedenti
                    reqIcon.classList.remove('fa-check', 'fa-times', 'requirement-met', 'requirement-not-met');
                    
                    // Aggiungi le nuove classi
                    if (isMet) {
                        reqIcon.classList.add('fa-check', 'requirement-met');
                        // Aggiungi effetto di animazione all'elemento parent (li)
                        reqIcon.closest('li').classList.add('requirement-highlight');
                        
                        // Rimuovi la classe di highlight dopo l'animazione
                        setTimeout(() => {
                            reqIcon.closest('li').classList.remove('requirement-highlight');
                        }, 800);
                    } else {
                        reqIcon.classList.add('fa-times', 'requirement-not-met');
                    }
                }
            }
        });
        
        // Trigger iniziale per assicurarci che lo stato venga aggiornato
        passwordInput.dispatchEvent(new Event('input'));
    } else {
        console.error('Password input non trovato!');
    }

    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Previene il ricaricamento della pagina
        
        // Verifica requisiti password
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm_password').value;
        
        // Verifica che le password corrispondano
        if (password !== confirmPassword) {
            showMessage('Le password non corrispondono.', 'danger');
            messageContainer.scrollIntoView({ behavior: 'smooth' });
            return;
        }
        
        // Verifica che la password soddisfi tutti i requisiti
        const isLongEnough = password.length >= 8;
        const hasLowercase = /[a-z]/.test(password);
        const hasUppercase = /[A-Z]/.test(password);
        const hasNumber = /\d/.test(password);
        const hasSpecial = /[@$!%*?&.#_\-+=(){}[\]|:;,<>\/~]/.test(password);
        
        if (!isLongEnough || !hasLowercase || !hasUppercase || !hasNumber || !hasSpecial) {
            let errorMessages = [];
            if (!isLongEnough) errorMessages.push('almeno 8 caratteri');
            if (!hasLowercase) errorMessages.push('almeno una lettera minuscola');
            if (!hasUppercase) errorMessages.push('almeno una lettera maiuscola');
            if (!hasNumber) errorMessages.push('almeno un numero');
            if (!hasSpecial) errorMessages.push('almeno un carattere speciale');
            
            showMessage('La password deve contenere: ' + errorMessages.join(', '), 'danger');
            messageContainer.scrollIntoView({ behavior: 'smooth' });
            return;
        }

        const formData = new FormData(form);
        const response = await fetch(form.action, {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            showMessage(result.message, 'success');
            
            // Svuota i campi del form
            form.reset();

            // Scorri fino al messaggio
            messageContainer.scrollIntoView({ behavior: 'smooth' });

            // Reindirizza alla pagina di login dopo 3 secondi
            setTimeout(() => {
                const loginUrl = document.body.getAttribute('data-login-url');
                window.location.href = loginUrl;
            }, 3000);            
        } else {
            showMessage(result.message, 'danger');
            
            // Scorri fino al messaggio
            messageContainer.scrollIntoView({ behavior: 'smooth' });
        }
    });

    function showMessage(message, category) {
        messageContainer.innerHTML = ''; // Pulisce i messaggi precedenti
        const messageElement = document.createElement('div');
        messageElement.textContent = message;
        messageElement.classList.add('message', category);
        messageContainer.appendChild(messageElement);
    }
});
