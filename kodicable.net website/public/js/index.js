const sidebar = document.getElementById('sidebar');
const hamburgerSidebar = document.getElementById('hamburger-sidebar');
const hamburgerNavbar = document.getElementById('hamburger-navbar');

hamburgerSidebar.addEventListener('click', () => {
  sidebar.style.width = '0px'
})

hamburgerNavbar.addEventListener('click', () => {
  sidebar.style.width = '225px'
})
