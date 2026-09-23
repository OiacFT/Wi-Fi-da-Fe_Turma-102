// Wi-Fi da Fé — comportamento inicial (Sprint 1)
// Menu mobile: alterna a visibilidade do <ul class="navbar__menu"> em telas estreitas.
const menuBtn = document.getElementById("menu-toggle");
const menu = document.getElementById("navbar-menu");

if (menuBtn && menu) {
  menuBtn.addEventListener("click", () => {
    const aberto = menu.classList.toggle("navbar__menu--aberto");
    menuBtn.setAttribute("aria-expanded", String(aberto));
  });
}
