// Función para abrir las pestañas
function openTab(event, tabName) {
    var i, tabContent, tabLinks;
    tabContent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabContent.length; i++) {
        tabContent[i].style.display = "none";
    }
    tabLinks = document.getElementsByClassName("tab-link");
    for (i = 0; i < tabLinks.length; i++) {
        tabLinks[i].className = tabLinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    event.currentTarget.className += " active";
}

// Muestra la primera pestaña al cargar la página
document.addEventListener("DOMContentLoaded", function() {
    document.getElementsByClassName("tab-link")[0].click();
});

let currentImageIndex = 0;
const images = document.querySelectorAll('.car-images img');

function openLightbox(src, index) {
    const lightbox = document.getElementById('lightbox');
    currentImageIndex = index; // Guarda el índice de la imagen actual
    lightbox.style.display = 'flex';
    document.getElementById('lightbox-image').src = src;
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.style.display = 'none';
}

function changeImage(direction) {
    currentImageIndex += direction;

    // Verifica límites y ajusta si es necesario
    if (currentImageIndex < 0) {
        currentImageIndex = images.length - 1;
    } else if (currentImageIndex >= images.length) {
        currentImageIndex = 0;
    }

    // Cambia la imagen mostrada en el lightbox
    document.getElementById('lightbox-image').src = images[currentImageIndex].src;
}

// Añade el evento de clic a cada imagen de la galería
images.forEach((img, index) => {
    img.addEventListener('click', () => openLightbox(img.src, index));
});

// Función para alternar el tema
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    document.querySelector('header').classList.toggle('dark-mode');
    document.querySelector('footer').classList.toggle('dark-mode');
    const themeToggleButton = document.getElementById('theme-toggle');
    themeToggleButton.classList.toggle('dark');

    const icon = themeToggleButton.querySelector('.icon');
    const tabLinks = document.getElementsByClassName('tab-link');
    const tabContents = document.getElementsByClassName('tab-content');

    for (let i = 0; i < tabLinks.length; i++) {
        tabLinks[i].classList.toggle('dark-mode');
    }

    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.toggle('dark-mode');
    }

    if (document.body.classList.contains('dark-mode')) {
        icon.classList.remove('sun');
        icon.classList.add('moon');
    } else {
        icon.classList.remove('moon');
        icon.classList.add('sun');
    }
}