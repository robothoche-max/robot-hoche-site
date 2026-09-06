/* ============================================================================
   MODE CLAIR / SOMBRE
   ----------------------------------------------------------------------------
   Fonctionnement :
   - Au chargement, on regarde si l'utilisateur a déjà choisi un thème
     (stocké dans le navigateur via localStorage). Sinon, on suit la
     préférence système (prefers-color-scheme).
   - Un clic sur le bouton rond (icône soleil/lune) inverse le thème et
     mémorise le choix pour les prochaines visites.
   - Le thème est appliqué en posant l'attribut data-theme="dark" ou
     data-theme="light" sur <html> : tout le reste est géré par les
     variables CSS dans assets/css/style.css (section 2).

   Ce script doit être placé dans le <head> AVANT le rendu du corps de la
   page (pour éviter un "flash" de mauvais thème au chargement) — il est
   donc volontairement très court et sans dépendance.
   ========================================================================= */

(function () {
  const CLE_STOCKAGE = "robothoche-theme";

  function themePrefere() {
    const enregistre = localStorage.getItem(CLE_STOCKAGE);
    if (enregistre === "dark" || enregistre === "light") return enregistre;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function appliquerTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
  }

  // Application immédiate (avant que le CSS ne peigne la page) :
  appliquerTheme(themePrefere());

  // Une fois la page chargée, on branche le bouton de bascule s'il existe.
  document.addEventListener("DOMContentLoaded", function () {
    const bouton = document.querySelector("[data-theme-toggle]");
    if (!bouton) return;

    bouton.addEventListener("click", function () {
      const actuel = document.documentElement.getAttribute("data-theme");
      const nouveau = actuel === "dark" ? "light" : "dark";
      appliquerTheme(nouveau);
      localStorage.setItem(CLE_STOCKAGE, nouveau);
    });
  });
})();
