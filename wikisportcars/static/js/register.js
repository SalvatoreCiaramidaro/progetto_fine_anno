// Commenta o rimuovi il seguente codice per utilizzare il submit tradizionale
/*
document.querySelector('form').addEventListener('submit', function(e) {
    e.preventDefault();
    fetch('/register', {
        method: 'POST',
        body: new URLSearchParams(new FormData(this)),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
    .then(response => {
        if (response.redirected) {
            window.location.href = response.url;
        }
    });
});
*/