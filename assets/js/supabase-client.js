/* ============================================================================
   CLIENT SUPABASE PARTAGE
   ----------------------------------------------------------------------------
   Ce fichier crée UNE seule connexion Supabase (variable `sb`) que toutes
   les autres pages/scripts utilisent pour lire ou écrire des données.

   Il doit être chargé APRES :
     1. le script CDN de la librairie Supabase
        (<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2">)
     2. assets/js/config.js (qui définit SUPABASE_URL et SUPABASE_KEY)

   Tu n'as normalement jamais besoin de modifier ce fichier : c'est
   assets/js/config.js qu'il faut éditer pour changer les clés.
   ========================================================================= */

let sb = null;

if (
  typeof SUPABASE_URL !== "undefined" &&
  SUPABASE_URL &&
  !SUPABASE_URL.startsWith("COLLE_ICI")
) {
  // `supabase` est la variable globale fournie par le script CDN.
  const { createClient } = supabase;
  sb = createClient(SUPABASE_URL, SUPABASE_KEY);
} else {
  // Configuration pas encore faite : on prévient gentiment dans la console
  // plutôt que de planter silencieusement.
  console.warn(
    "[Robot'Hoche] Supabase n'est pas encore configuré. " +
    "Ouvre assets/js/config.js et renseigne SUPABASE_URL et SUPABASE_KEY."
  );
}

/**
 * Petit utilitaire : affiche un message d'erreur lisible dans un conteneur
 * HTML donné, utilisé par les pages qui chargent des données dynamiques
 * (projets, calendrier...) si Supabase n'est pas configuré ou si une requête
 * échoue.
 */
function afficherErreurConfig(conteneurId) {
  const el = document.getElementById(conteneurId);
  if (!el) return;
  el.innerHTML =
    '<div class="empty-state">' +
    "Le site n'est pas encore relié à sa base de données. " +
    "(Configuration à faire dans <code>assets/js/config.js</code>, " +
    "voir GUIDE_DEPLOIEMENT.md)" +
    "</div>";
}
