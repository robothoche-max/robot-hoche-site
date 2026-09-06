/* ============================================================================
   NAVIGATION : menu mobile + lien actif
   ----------------------------------------------------------------------------
   - Le bouton "burger" (visible seulement en mobile, voir media query dans
     style.css section 15) ouvre/ferme le menu de liens.
   - Le lien correspondant à la page actuellement affichée reçoit l'attribut
     aria-current="page", ce qui le met en évidence visuellement (voir
     style.css .nav-links a[aria-current="page"]) et aide les lecteurs
     d'écran.
   ========================================================================= */

document.addEventListener("DOMContentLoaded", function () {
  const header = document.querySelector(".site-header");
  const burger = document.querySelector("[data-nav-burger]");

  if (burger && header) {
    burger.addEventListener("click", function () {
      header.classList.toggle("is-open");
    });
  }

  // Repère la page actuelle via son nom de fichier et marque le bon lien.
  const pageActuelle = (
    window.location.pathname.split("/").pop() || "index.html"
  ).toLowerCase();

  document.querySelectorAll(".nav-links a[data-page]").forEach(function (lien) {
    if (lien.getAttribute("data-page") === pageActuelle) {
      lien.setAttribute("aria-current", "page");
    }
  });
});
