/* ============================================================================
   PAGE PRESENTATION — script spécifique
   ----------------------------------------------------------------------------
   Charge les textes de présentation depuis Supabase (table site_texts) et
   affiche les listes "valeurs" et "objectifs" (une ligne de texte = un
   élément de liste, voir supabase/schema.sql et le tableau de bord).
   ========================================================================= */

if (!sb) {
  afficherErreurConfig("txt-intro");
}

chargerTextesSite(function (textes) {
  definirTexte("txt-intro", textes.presentation_intro);
  definirTexte("txt-pour-qui", textes.presentation_pour_qui);
  definirTexte("txt-organisation", textes.presentation_organisation);
  definirTexte("txt-partenaires", textes.presentation_partenaires);
  definirTexte("footer-texte", textes.footer_texte);

  // Valeurs : une puce par ligne
  const valeurs = decouperEnListe(textes.presentation_valeurs);
  const listeValeurs = document.getElementById("liste-valeurs");
  if (listeValeurs && valeurs.length) {
    listeValeurs.innerHTML = valeurs
      .map(function (v) {
        return "<li><b>✓</b><span>" + echapper(v) + "</span></li>";
      })
      .join("");
  }

  // Objectifs : numérotés, dans l'ordre où ils sont écrits
  const objectifs = decouperEnListe(textes.presentation_objectifs);
  const listeObjectifs = document.getElementById("liste-objectifs");
  if (listeObjectifs && objectifs.length) {
    listeObjectifs.innerHTML = objectifs
      .map(function (o, i) {
        return "<li><b>" + (i + 1) + "</b><span>" + echapper(o) + "</span></li>";
      })
      .join("");
  }
});
