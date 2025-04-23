document.addEventListener('DOMContentLoaded', function() {
    // Form per l'aggiornamento del profilo
    const profileForm = document.getElementById('profileForm');
    const profileResult = document.getElementById('profileResult');

    // Form per il cambio password
    const passwordForm = document.getElementById('passwordForm');
    const passwordResult = document.getElementById('passwordResult');

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