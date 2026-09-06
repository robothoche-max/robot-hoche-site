/* ============================================================================
   ONGLET "PROJETS"
   ----------------------------------------------------------------------------
   Gère la table `projects` : ajout, modification, suppression, et upload
   optionnel d'une photo vers le stockage Supabase (bucket "medias").

   Le formulaire sert à la fois à AJOUTER un nouveau projet et à MODIFIER un
   projet existant : cliquer sur "Modifier" dans le tableau remplit le
   formulaire et bascule le bouton sur "Mettre à jour".
   ========================================================================= */

let projetEnEdition = null; // null = mode ajout, sinon id du projet modifié

function reinitialiserFormulaireProjet() {
  projetEnEdition = null;
  document.getElementById("form-projet").reset();
  document.getElementById("projet-id").value = "";
  document.getElementById("projet-bouton-submit").textContent = "Ajouter le projet";
  document.getElementById("projet-bouton-annuler").classList.add("hidden");
}

function remplirFormulaireProjet(projet) {
  projetEnEdition = projet.id;
  document.getElementById("projet-id").value = projet.id;
  document.getElementById("projet-titre").value = projet.titre || "";
  document.getElementById("projet-resume").value = projet.resume || "";
  document.getElementById("projet-description").value = projet.description || "";
  document.getElementById("projet-statut").value = projet.statut || "En cours";
  document.getElementById("projet-image-url").value = projet.image_url || "";
  document.getElementById("projet-video").value = projet.video_url || "";
  document.getElementById("projet-ordre").value = projet.ordre || 0;
  document.getElementById("projet-bouton-submit").textContent = "Mettre à jour le projet";
  document.getElementById("projet-bouton-annuler").classList.remove("hidden");
  document.getElementById("panel-projets").scrollIntoView({ behavior: "smooth" });
}

function construireLigneProjet(projet) {
  return (
    "<tr>" +
    "<td>" + echapper(projet.titre) + "</td>" +
    "<td>" + echapper(projet.statut) + "</td>" +
    "<td>" + projet.ordre + "</td>" +
    '<td class="admin-row-actions">' +
    '<button class="btn btn-outline btn-sm" data-action="modifier">Modifier</button>' +
    '<button class="btn btn-danger btn-sm" data-action="supprimer">Supprimer</button>' +
    "</td></tr>"
  );
}

function chargerProjetsAdmin() {
  sb.from("projects")
    .select("id, titre, resume, description, statut, image_url, video_url, ordre")
    .order("ordre", { ascending: true })
    .then(function (reponse) {
      const corpsTableau = document.getElementById("tableau-projets");
      if (reponse.error) {
        console.error(reponse.error);
        return;
      }
      if (!reponse.data.length) {
        corpsTableau.innerHTML = '<tr><td colspan="4" class="text-muted">Aucun projet pour l\'instant.</td></tr>';
        return;
      }
      corpsTableau.innerHTML = reponse.data.map(construireLigneProjet).join("");

      corpsTableau.querySelectorAll("tr").forEach(function (ligne, index) {
        const projet = reponse.data[index];
        const boutonModifier = ligne.querySelector('[data-action="modifier"]');
        const boutonSupprimer = ligne.querySelector('[data-action="supprimer"]');
        if (boutonModifier) boutonModifier.addEventListener("click", function () { remplirFormulaireProjet(projet); });
        if (boutonSupprimer) boutonSupprimer.addEventListener("click", function () { supprimerProjet(projet.id); });
      });
    });
}

function supprimerProjet(id) {
  if (!confirm("Supprimer définitivement ce projet ?")) return;
  sb.from("projects").delete().eq("id", id).then(function (reponse) {
    if (reponse.error) { alert("Erreur : " + reponse.error.message); return; }
    chargerProjetsAdmin();
  });
}

/** Envoie le fichier choisi vers le bucket "medias" et renvoie son URL
 *  publique, ou null si aucun fichier n'a été sélectionné. */
async function televerserImageProjet() {
  const champFichier = document.getElementById("projet-image");
  const fichier = champFichier.files[0];
  if (!fichier) return null;

  const cheminFichier = "projets/" + Date.now() + "-" + fichier.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");

  const { error } = await sb.storage.from("medias").upload(cheminFichier, fichier);
  if (error) {
    throw new Error(
      "Échec de l'envoi de l'image (" + error.message + "). " +
      "Vérifie que le bucket \"medias\" existe bien (voir supabase/schema.sql, section 4)."
    );
  }

  const { data } = sb.storage.from("medias").getPublicUrl(cheminFichier);
  return data.publicUrl;
}

window.addEventListener("robothoche:auth-ok", function () {
  chargerProjetsAdmin();

  document.getElementById("projet-bouton-annuler").addEventListener("click", reinitialiserFormulaireProjet);

  document.getElementById("form-projet").addEventListener("submit", async function (evenement) {
    evenement.preventDefault();
    const message = document.getElementById("message-projets");
    const boutonSubmit = document.getElementById("projet-bouton-submit");
    boutonSubmit.disabled = true;

    try {
      let urlImage = document.getElementById("projet-image-url").value.trim() || null;
      const urlTeleversee = await televerserImageProjet();
      if (urlTeleversee) urlImage = urlTeleversee;

      const donnees = {
        titre: document.getElementById("projet-titre").value.trim(),
        resume: document.getElementById("projet-resume").value.trim(),
        description: document.getElementById("projet-description").value.trim(),
        statut: document.getElementById("projet-statut").value,
        image_url: urlImage,
        video_url: document.getElementById("projet-video").value.trim() || null,
        ordre: parseInt(document.getElementById("projet-ordre").value, 10) || 0,
      };

      const requete = projetEnEdition
        ? sb.from("projects").update(donnees).eq("id", projetEnEdition)
        : sb.from("projects").insert(donnees);

      const reponse = await requete;
      boutonSubmit.disabled = false;

      if (reponse.error) {
        message.textContent = "Erreur : " + reponse.error.message;
        message.className = "form-message is-visible is-error";
        return;
      }

      message.textContent = projetEnEdition ? "Projet mis à jour." : "Projet ajouté.";
      message.className = "form-message is-visible is-success";
      reinitialiserFormulaireProjet();
      chargerProjetsAdmin();
    } catch (erreur) {
      boutonSubmit.disabled = false;
      message.textContent = erreur.message;
      message.className = "form-message is-visible is-error";
    }
  });
});
