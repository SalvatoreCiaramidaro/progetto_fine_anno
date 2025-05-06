document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('form');
    const messageContainer = document.getElementById('message-container');

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(loginForm);
        
        fetch('/login', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                messageContainer.innerHTML = '<div class="success-message">Accesso effettuato! Reindirizzamento...</div>';
                window.location.href = data.next;
            } else {
                messageContainer.innerHTML = `<div class="error-message">${data.message}</div>`;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            messageContainer.innerHTML = '<div class="error-message">Si è verificato un errore. Riprova più tardi.</div>';
        });
    });
});