$(document).ready(function() {
    // Funzione per aggiornare solo l'immagine
    $('#update_image_btn').click(function() {
        const imageUrl = $('#main_image_url').val();
        if (!imageUrl) {
            toastr.error('Inserisci un URL valido per l\'immagine');
            return;
        }
        
        // Disabilita il pulsante per evitare clic multipli
        $(this).prop('disabled', true);
        $(this).html('<i class="fas fa-spinner fa-spin"></i> Aggiornamento...');
        
        // Effettua la richiesta AJAX
        $.ajax({
            url: "{{ url_for('admin_update_car_image', car_id=car.id) }}",
            type: 'POST',
            data: { image_url: imageUrl },
            success: function(response) {
                if (response.success) {
                    toastr.success(response.message);
                    // Aggiorna l'immagine visualizzata senza ricaricare la pagina
                    $('#main_image_preview img').attr('src', imageUrl);
                } else {
                    toastr.error(response.message);
                }
            },
            error: function() {
                toastr.error('Si è verificato un errore durante l\'aggiornamento dell\'immagine');
            },
            complete: function() {
                // Riattiva il pulsante
                $('#update_image_btn').prop('disabled', false);
                $('#update_image_btn').html('<i class="fas fa-sync"></i> Aggiorna');
            }
        });
    });
});