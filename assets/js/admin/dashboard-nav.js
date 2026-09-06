/* ============================================================================
   NAVIGATION ENTRE LES ONGLETS DU TABLEAU DE BORD
   ----------------------------------------------------------------------------
   Chaque bouton de la barre latérale porte un attribut data-panel qui
   correspond à l'id de la <section> à afficher. Un clic masque tous les
   panneaux et n'affiche que celui demandé.
   ========================================================================= */

document.addEventListener("DOMContentLoaded", function () {
  const boutons = document.querySelectorAll(".admin-nav button[data-panel]");

  boutons.forEach(function (bouton) {
    bouton.addEventListener("click", function () {
      boutons.forEach(function (b) { b.classList.remove("is-active"); });
      bouton.classList.add("is-active");

      document.querySelectorAll(".admin-panel").forEach(function (panneau) {
        panneau.classList.remove("is-active");
      });
      document.getElementById(bouton.getAttribute("data-panel")).classList.add("is-active");
    });
  });
});
