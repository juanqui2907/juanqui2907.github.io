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

// Funciones para el Lightbox
function openLightbox(src) {
    const lightbox = document.getElementById('lightbox');
    lightbox.style.display = 'flex';
    lightbox.querySelector('img').src = src;
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.style.display = 'none';
}

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
