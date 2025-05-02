function validatePassword(input) {
    const password = document.getElementById('password').value;
    if (input.value !== password) {
        input.setCustomValidity('Le password non corrispondono.');
    } else {
        input.setCustomValidity('');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#register-form');
    const messageContainer = document.querySelector('#message-container');

    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Previene il ricaricamento della pagina

        const formData = new FormData(form);
        const response = await fetch(form.action, {
            method: 'POST',
            body: formData,
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