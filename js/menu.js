document.addEventListener('DOMContentLoaded', function () {
    const menuToggle = document.querySelector('.menu-toggle');
    const menuItems = document.querySelector('.menu-items');
    const navLinks = document.querySelectorAll('.menu-items a');

    menuToggle.addEventListener('click', function () {
        menuItems.classList.toggle('active');
        menuToggle.classList.toggle('open');
    });

    navLinks.forEach(function (link) {
        link.addEventListener('click', function () {
            menuItems.classList.remove('active');
            menuToggle.classList.remove('open');
        });
    });
});