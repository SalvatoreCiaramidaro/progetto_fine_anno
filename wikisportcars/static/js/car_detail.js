let currentIndex = 0;
let imageElement = document.getElementById('carImage');

function changeImage(step) {
    if (images.length === 0) return;
    
    currentIndex = (currentIndex + step + images.length) % images.length;
    imageElement.src = images[currentIndex];
}
