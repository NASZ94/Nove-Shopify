const menu = document.getElementById('mobile-menu');
const openButton = document.getElementById('menu-toggle');
const closeButton = document.getElementById('close-menu');

if (openButton && menu) {

    openButton.addEventListener('click', () => {
        menu.classList.add('open');
    });

}

if (closeButton && menu) {

    closeButton.addEventListener('click', () => {
        menu.classList.remove('open');
    });

}