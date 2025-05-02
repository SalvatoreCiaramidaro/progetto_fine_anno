document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
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
            showMessage('Login successful!', 'success');
            
            // Svuota i campi del form
            form.reset();

            // Prendi il valore del campo nascosto "next"
            const nextUrl = result.next || '/';

            setTimeout(() => {
                window.location.href = nextUrl;
            }, 3000);
        } else {
            showMessage(result.message || 'Errore durante il login', 'danger');
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