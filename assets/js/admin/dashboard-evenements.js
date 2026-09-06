/* ============================================================================
   ONGLET "CALENDRIER"
   ----------------------------------------------------------------------------
   Gère la table `events`, sur le même principe que l'onglet Projets
   (voir dashboard-projets.js) : un seul formulaire pour ajouter ou modifier.
   ========================================================================= */

let evenementEnEdition = null;

function reinitialiserFormulaireEvenement() {
  evenementEnEdition = null;
  document.getElementById("form-evenement").reset();
  document.getElementById("evenement-id").value = "";
  document.getElementById("evenement-bouton-submit").textContent = "Ajouter l'événement";
  document.getElementById("evenement-bouton-annuler").classList.add("hidden");
}

function remplirFormulaireEvenement(evt) {
  evenementEnEdition = evt.id;
  document.getElementById("evenement-id").value = evt.id;
  document.getElementById("evenement-titre").value = evt.titre || "";
  document.getElementById("evenement-description").value = evt.description || "";
  document.getElementById("evenement-date").value = evt.date_evenement || "";
  document.getElementById("evenement-heure").value = evt.heure || "";
  document.getElementById("evenement-lieu").value = evt.lieu || "";
  document.getElementById("evenement-bouton-submit").textContent = "Mettre à jour l'événement";
  document.getElementById("evenement-bouton-annuler").classList.remove("hidden");
  document.getElementById("panel-evenements").scrollIntoView({ behavior: "smooth" });
}

function construireLigneEvenementAdmin(evt) {
  return (
    "<tr>" +
    "<td>" + formaterDateFr(evt.date_evenement) + "</td>" +
    "<td>" + echapper(evt.titre) + "</td>" +
    "<td>" + echapper(evt.lieu || "") + "</td>" +
    '<td class="admin-row-actions">' +
    '<button class="btn btn-outline btn-sm" data-action="modifier">Modifier</button>' +
    '<button class="btn btn-danger btn-sm" data-action="supprimer">Supprimer</button>' +
    "</td></tr>"
  );
}

function chargerEvenementsAdmin() {
  sb.from("events")
    .select("id, titre, description, date_evenement, heure, lieu")
    .order("date_evenement", { ascending: true })
    .then(function (reponse) {
      const corpsTableau = document.getElementById("tableau-evenements");
      if (reponse.error) { console.error(reponse.error); return; }
      if (!reponse.data.length) {
        corpsTableau.innerHTML = '<tr><td colspan="4" class="text-muted">Aucun événement pour l\'instant.</td></tr>';
        return;
      }
      corpsTableau.innerHTML = reponse.data.map(construireLigneEvenementAdmin).join("");

      corpsTableau.querySelectorAll("tr").forEach(function (ligne, index) {
        const evt = reponse.data[index];
        const boutonModifier = ligne.querySelector('[data-action="modifier"]');
        const boutonSupprimer = ligne.querySelector('[data-action="supprimer"]');
        if (boutonModifier) boutonModifier.addEventListener("click", function () { remplirFormulaireEvenement(evt); });
        if (boutonSupprimer) boutonSupprimer.addEventListener("click", function () { supprimerEvenement(evt.id); });
      });
    });
}

function supprimerEvenement(id) {
  if (!confirm("Supprimer définitivement cet événement ?")) return;
  sb.from("events").delete().eq("id", id).then(function (reponse) {
    if (reponse.error) { alert("Erreur : " + reponse.error.message); return; }
    chargerEvenementsAdmin();
  });
}

window.addEventListener("robothoche:auth-ok", function () {
  chargerEvenementsAdmin();

  document.getElementById("evenement-bouton-annuler").addEventListener("click", reinitialiserFormulaireEvenement);

  document.getElementById("form-evenement").addEventListener("submit", function (evenement) {
    evenement.preventDefault();
    const message = document.getElementById("message-evenements");

    const donnees = {
      titre: document.getElementById("evenement-titre").value.trim(),
      description: document.getElementById("evenement-description").value.trim(),
      date_evenement: document.getElementById("evenement-date").value,
      heure: document.getElementById("evenement-heure").value.trim() || null,
      lieu: document.getElementById("evenement-lieu").value.trim() || null,
    };

    const requete = evenementEnEdition
      ? sb.from("events").update(donnees).eq("id", evenementEnEdition)
      : sb.from("events").insert(donnees);

    requete.then(function (reponse) {
      if (reponse.error) {
        message.textContent = "Erreur : " + reponse.error.message;
        message.className = "form-message is-visible is-error";
        return;
      }
      message.textContent = evenementEnEdition ? "Événement mis à jour." : "Événement ajouté.";
      message.className = "form-message is-visible is-success";
      reinitialiserFormulaireEvenement();
      chargerEvenementsAdmin();
    });
  });
});
