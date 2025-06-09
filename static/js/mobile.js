// Funzioni JS specifiche per mobile
if (window.matchMedia("(max-width: 768px)").matches) {
  // Esempio: chiudi automaticamente i dropdown dopo il click su mobile
  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.dropdown-content a').forEach(function(link) {
      link.addEventListener('click', function() {
        const dropdown = this.closest('.dropdown-content');
        if (dropdown) dropdown.classList.remove('show');
      });
    });
    // Altre ottimizzazioni mobile qui...
  });
}