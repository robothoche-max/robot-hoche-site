/* ============================================================================
   FONCTIONS PARTAGEES — PAGES PUBLIQUES
   ----------------------------------------------------------------------------
   Petites fonctions réutilisées par plusieurs pages (home.js, presentation.js,
   seances.js, projets.js, calendrier.js, inscription.js) :
     - chargerTextesSite()  : récupère tous les textes modifiables du site
     - decouperEnListe()    : transforme un texte "une ligne = un élément" en
                              tableau JavaScript
     - remplirListe()       : affiche ce tableau dans un <ul>/<ol>
     - formaterDateFr()     : affiche une date au format français
     - echapper()           : sécurité de base contre l'injection de HTML
   ========================================================================= */

/**
 * Va chercher tous les textes du site (table site_texts) et appelle
 * `callback` avec un objet { cle: valeur, ... } une fois les données prêtes.
 * Ne fait rien si Supabase n'est pas configuré (voir assets/js/config.js).
 */
function chargerTextesSite(callback) {
  if (!sb) return;
  sb.from("site_texts")
    .select("cle, valeur")
    .then(function (reponse) {
      if (reponse.error) {
        console.error("Erreur de chargement des textes :", reponse.error);
        return;
      }
      const dictionnaire = {};
      reponse.data.forEach(function (ligne) {
        dictionnaire[ligne.cle] = ligne.valeur;
      });
      callback(dictionnaire);
    });
}

/** Écrit `texte` dans l'élément #id, seulement si l'élément existe et que le
 *  texte n'est pas vide (pour ne pas écraser le texte de repli par du vide). */
function definirTexte(id, texte) {
  const el = document.getElementById(id);
  if (el && texte) el.textContent = texte;
}

/** Transforme "ligne 1\nligne 2\nligne 3" en ["ligne 1", "ligne 2", "ligne 3"]. */
function decouperEnListe(texte) {
  if (!texte) return [];
  return texte
    .split("\n")
    .map(function (ligne) { return ligne.trim(); })
    .filter(function (ligne) { return ligne.length > 0; });
}

/** Remplit un <ul>/<ol> #id avec un élément <li> par entrée du tableau. */
function remplirListe(id, elements, classeLi) {
  const conteneur = document.getElementById(id);
  if (!conteneur || !elements || elements.length === 0) return;
  conteneur.innerHTML = "";
  elements.forEach(function (texte, index) {
    const li = document.createElement("li");
    if (classeLi) li.className = classeLi;
    li.textContent = texte;
    conteneur.appendChild(li);
  });
}

/** Formate une date ISO ("2026-10-04") en français ("4 octobre 2026"). */
function formaterDateFr(dateIso) {
  const date = new Date(dateIso + "T00:00:00");
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Jour + mois courts pour les pastilles de date ("14" / "OCT."). */
function formaterDateCourte(dateIso) {
  const date = new Date(dateIso + "T00:00:00");
  return {
    jour: date.toLocaleDateString("fr-FR", { day: "numeric" }),
    mois: date.toLocaleDateString("fr-FR", { month: "short" }).replace(".", ""),
  };
}

/** Échappe les caractères HTML dangereux avant d'insérer un texte libre
 *  (venant de la base de données) dans du innerHTML. Toujours utiliser cette
 *  fonction plutôt que d'insérer directement une variable dans innerHTML. */
function echapper(texte) {
  if (texte === null || texte === undefined) return "";
  const div = document.createElement("div");
  div.textContent = texte;
  return div.innerHTML;
}
