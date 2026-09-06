/* ============================================================================
   PAGE D'ACCUEIL — script spécifique
   ========================================================================= */

// 1. Textes modifiables (hero + pied de page)
chargerTextesSite(function (textes) {
  definirTexte("hero-eyebrow", textes.accueil_eyebrow);
  definirTexte("hero-titre", textes.accueil_titre);
  definirTexte("hero-soustitre", textes.accueil_soustitre);
  definirTexte("footer-texte", textes.footer_texte);
});

// 2. Le prochain événement à venir (le plus proche dans le futur)
(function chargerProchainEvenement() {
  const conteneur = document.getElementById("prochain-evenement");
  if (!conteneur) return;

  if (!sb) {
    afficherErreurConfig("prochain-evenement");
    return;
  }

  const section = document.getElementById("section-prochain-evenement");
  const aujourdhui = new Date().toISOString().slice(0, 10);

  sb.from("events")
    .select("titre, description, date_evenement, heure, lieu")
    .gte("date_evenement", aujourdhui)
    .order("date_evenement", { ascending: true })
    .limit(1)
    .then(function (reponse) {
      if (reponse.error) {
        console.error("Erreur de chargement de l'événement :", reponse.error);
        return;
      }
      if (!reponse.data || reponse.data.length === 0) {
        // Rien de prévu pour l'instant : on masque toute la section plutôt
        // que d'afficher un encart vide.
        if (section) section.classList.add("hidden");
        return;
      }
      const evt = reponse.data[0];
      const d = formaterDateCourte(evt.date_evenement);
      conteneur.innerHTML =
        '<div class="event-item">' +
        '<div class="event-date"><b>' + echapper(d.jour) + "</b><span>" + echapper(d.mois) + "</span></div>" +
        "<div>" +
        "<h3>" + echapper(evt.titre) + "</h3>" +
        "<p class=\"text-muted mb-0\">" + echapper(evt.description || "") + "</p>" +
        '<p class="text-muted mb-0">' +
        (evt.heure ? echapper(evt.heure) + " · " : "") +
        echapper(evt.lieu || "Lieu à préciser") +
        "</p>" +
        "</div></div>";
    });
})();
