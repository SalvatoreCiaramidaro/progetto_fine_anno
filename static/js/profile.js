document.addEventListener('DOMContentLoaded', function() {
    // Form per l'aggiornamento del profilo
    const profileForm = document.getElementById('profileForm');
    const profileResult = document.getElementById('profileResult');

    // Form per il cambio password
    const passwordForm = document.getElementById('passwordForm');
    const passwordResult = document.getElementById('passwordResult');
    
    // Controllo requisiti password in real-time per la nuova password
    const newPasswordInput = document.getElementById('new_password');
    if (newPasswordInput) {
        // Mostra i requisiti quando il campo ottiene il focus
        newPasswordInput.addEventListener('focus', function() {
            const requirementsBox = document.querySelector('.password-requirements');
            if (requirementsBox) {
                requirementsBox.style.display = 'block';
            }
        });
        
        newPasswordInput.addEventListener('input', function() {
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
                        const listItem = reqIcon.closest('li');
                        if (listItem) {
                            listItem.classList.add('requirement-highlight');
                            setTimeout(() => {
                                listItem.classList.remove('requirement-highlight');
                            }, 800);
                        }
                    } else {
                        reqIcon.classList.add('fa-times', 'requirement-not-met');
                    }
                }
            }
        });
        
        // Trigger iniziale per assicurarci che lo stato venga aggiornato
        newPasswordInput.dispatchEvent(new Event('input'));
    }

    // Gestione aggiornamento profilo
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Raccogli i dati del form
            const formData = new FormData(profileForm);
            
            // Invia la richiesta AJAX
            fetch('/profile', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.json())
            .then(data => {
                // Mostra il risultato
                profileResult.style.display = 'block';
                
                if (data.success) {
                    profileResult.className = 'alert alert-success';
                    profileResult.textContent = data.message;
                } else {
                    profileResult.className = 'alert alert-danger';
                    profileResult.textContent = data.message;
                }
                
                // Nascondi il messaggio dopo 5 secondi
                setTimeout(function() {
                    profileResult.style.display = 'none';
                }, 5000);
            })
            .catch(error => {
                console.error('Errore:', error);
                profileResult.className = 'alert alert-danger';
                profileResult.textContent = 'Si è verificato un errore durante l\'aggiornamento del profilo.';
                profileResult.style.display = 'block';
            });
        });
    }

    // Gestione cambio password
    if (passwordForm) {
        passwordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Verifica che la nuova password e la conferma corrispondano
            const newPassword = document.getElementById('new_password').value;
            const confirmPassword = document.getElementById('confirm_password').value;
            
            if (newPassword !== confirmPassword) {
                passwordResult.className = 'alert alert-danger';
                passwordResult.textContent = 'La nuova password e la conferma non corrispondono';
                passwordResult.style.display = 'block';
                return;
            }
            
            // Raccogli i dati del form
            const formData = new FormData(passwordForm);
            
            // Invia la richiesta AJAX
            fetch('/change_password', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.json())
            .then(data => {
                // Mostra il risultato
                passwordResult.style.display = 'block';
                
                if (data.success) {
                    passwordResult.className = 'alert alert-success';
                    passwordResult.textContent = data.message;
                    // Reset del form se il cambio è avvenuto con successo
                    passwordForm.reset();
                } else {
                    passwordResult.className = 'alert alert-danger';
                    passwordResult.textContent = data.message;
                }
                
                // Nascondi il messaggio dopo 5 secondi
                setTimeout(function() {
                    passwordResult.style.display = 'none';
                }, 5000);
            })
            .catch(error => {
                console.error('Errore:', error);
                passwordResult.className = 'alert alert-danger';
                passwordResult.textContent = 'Si è verificato un errore durante il cambio password.';
                passwordResult.style.display = 'block';
            });
        });
    }
});