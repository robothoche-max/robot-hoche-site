/* ============================================================================
   PAGE PROJETS — script spécifique
   ----------------------------------------------------------------------------
   Récupère la liste des projets (table `projects`) et construit une carte
   par projet. L'ordre d'affichage suit la colonne `ordre` (croissant), puis
   la date de création (le plus récent en premier) en cas d'égalité.
   ========================================================================= */

if (!sb) afficherErreurConfig("liste-projets");

chargerTextesSite(function (textes) {
  definirTexte("txt-intro", textes.projets_intro);
  definirTexte("footer-texte", textes.footer_texte);
});

/**
 * Si `url` est un lien Youtube reconnu, renvoie une URL "embed" utilisable
 * dans un <iframe>. Sinon renvoie null (on affichera un simple lien).
 */
function obtenirEmbedYoutube(url) {
  if (!url) return null;
  const motifs = [
    /youtu\.be\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/,
  ];
  for (const motif of motifs) {
    const trouve = url.match(motif);
    if (trouve) return "https://www.youtube.com/embed/" + trouve[1];
  }
  return null;
}

function construireCarteProjet(projet) {
  const embed = obtenirEmbedYoutube(projet.video_url);
  let media = "";

  if (embed) {
    media =
      '<div class="project-card-media"><iframe src="' + embed +
      '" title="Vidéo du projet ' + echapper(projet.titre) +
      '" allowfullscreen loading="lazy"></iframe></div>';
  } else if (projet.image_url) {
    media =
      '<div class="project-card-media"><img src="' + projet.image_url +
      '" alt="Photo du projet ' + echapper(projet.titre) + '" loading="lazy"></div>';
  }

  const lienVideo =
    !embed && projet.video_url
      ? '<a href="' + projet.video_url + '" target="_blank" rel="noopener" class="badge badge-copper">Voir la vidéo</a>'
      : "";

  return (
    '<article class="project-card">' +
    media +
    '<div class="project-card-body">' +
    '<span class="badge">' + echapper(projet.statut || "En cours") + "</span>" +
    "<h3>" + echapper(projet.titre) + "</h3>" +
    "<p class=\"text-muted mb-0\">" + echapper(projet.resume) + "</p>" +
    (projet.description ? "<p class=\"text-muted mb-0\">" + echapper(projet.description) + "</p>" : "") +
    lienVideo +
    "</div>" +
    "</article>"
  );
}

(function chargerProjets() {
  const conteneur = document.getElementById("liste-projets");
  if (!conteneur || !sb) return;

  sb.from("projects")
    .select("titre, resume, description, statut, image_url, video_url, ordre, created_at")
    .order("ordre", { ascending: true })
    .order("created_at", { ascending: false })
    .then(function (reponse) {
      if (reponse.error) {
        console.error("Erreur de chargement des projets :", reponse.error);
        conteneur.innerHTML = '<div class="empty-state">Impossible de charger les projets pour le moment.</div>';
        return;
      }
      if (!reponse.data || reponse.data.length === 0) {
        conteneur.innerHTML = '<div class="empty-state">Aucun projet publié pour l\'instant — le premier arrive bientôt !</div>';
        return;
      }
      conteneur.innerHTML = reponse.data.map(construireCarteProjet).join("");
    });
})();
