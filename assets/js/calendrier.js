/* ============================================================================
   PAGE CALENDRIER — script spécifique
   ========================================================================= */

if (!sb) afficherErreurConfig("evenements-a-venir");

chargerTextesSite(function (textes) {
  definirTexte("txt-intro", textes.calendrier_intro);
  definirTexte("footer-texte", textes.footer_texte);
});

function construireLigneEvenement(evt, estPasse) {
  const d = formaterDateCourte(evt.date_evenement);
  return (
    '<li class="event-item' + (estPasse ? " is-past" : "") + '">' +
    '<div class="event-date"><b>' + echapper(d.jour) + "</b><span>" + echapper(d.mois) + "</span></div>" +
    "<div>" +
    "<h3>" + echapper(evt.titre) + "</h3>" +
    (evt.description ? '<p class="text-muted mb-0">' + echapper(evt.description) + "</p>" : "") +
    '<p class="text-muted mb-0">' +
    formaterDateFr(evt.date_evenement) +
    (evt.heure ? " · " + echapper(evt.heure) : "") +
    (evt.lieu ? " · " + echapper(evt.lieu) : "") +
    "</p>" +
    "</div></li>"
  );
}

(function chargerEvenements() {
  const conteneurAVenir = document.getElementById("evenements-a-venir");
  const conteneurPasses = document.getElementById("evenements-passes");
  if (!conteneurAVenir || !sb) return;

  const aujourdhui = new Date().toISOString().slice(0, 10);

  sb.from("events")
    .select("titre, description, date_evenement, heure, lieu")
    .order("date_evenement", { ascending: true })
    .then(function (reponse) {
      if (reponse.error) {
        console.error("Erreur de chargement du calendrier :", reponse.error);
        conteneurAVenir.innerHTML = '<div class="empty-state">Impossible de charger le calendrier pour le moment.</div>';
        return;
      }

      const tousLesEvenements = reponse.data || [];
      const aVenir = tousLesEvenements.filter(function (e) { return e.date_evenement >= aujourdhui; });
      const passes = tousLesEvenements
        .filter(function (e) { return e.date_evenement < aujourdhui; })
        .reverse(); // les plus récents d'abord

      conteneurAVenir.innerHTML = aVenir.length
        ? '<ul class="event-list">' + aVenir.map(function (e) { return construireLigneEvenement(e, false); }).join("") + "</ul>"
        : '<div class="empty-state">Rien de prévu pour l\'instant — revenez bientôt !</div>';

      conteneurPasses.innerHTML = passes.length
        ? '<ul class="event-list">' + passes.map(function (e) { return construireLigneEvenement(e, true); }).join("") + "</ul>"
        : '<p class="text-muted">Aucun événement passé pour l\'instant.</p>';
    });
})();
