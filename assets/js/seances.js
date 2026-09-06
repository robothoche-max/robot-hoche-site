/* ============================================================================
   PAGE DEROULEMENT D'UNE SEANCE — script spécifique
   ========================================================================= */

if (!sb) afficherErreurConfig("txt-rythme");

chargerTextesSite(function (textes) {
  definirTexte("txt-rythme", textes.seances_intro);
  definirTexte("txt-evaluation", textes.seances_evaluation);
  definirTexte("footer-texte", textes.footer_texte);
});
