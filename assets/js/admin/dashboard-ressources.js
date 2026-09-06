/* ============================================================================
   ONGLET "RESSOURCES INTERNES" (liens utiles, non publics)
   ========================================================================= */

let ressourceEnEdition = null;

function reinitialiserFormulaireRessource() {
  ressourceEnEdition = null;
  document.getElementById("form-ressource").reset();
  document.getElementById("ressource-id").value = "";
  document.getElementById("ressource-bouton-submit").textContent = "Ajouter";
  document.getElementById("ressource-bouton-annuler").classList.add("hidden");
}

function chargerRessources() {
  sb.from("resources").select("id, titre, url, description").order("titre").then(function (reponse) {
    const corps = document.getElementById("tableau-ressources");
    if (reponse.error) { console.error(reponse.error); return; }
    if (!reponse.data.length) {
      corps.innerHTML = '<tr><td colspan="3" class="text-muted">Aucune ressource enregistrée.</td></tr>';
      return;
    }
    corps.innerHTML = reponse.data.map(function (r) {
      return (
        "<tr>" +
        "<td>" + echapper(r.titre) + "<br><span class=\"text-muted\">" + echapper(r.description || "") + "</span></td>" +
        "<td>" + (r.url ? '<a href="' + r.url + '" target="_blank" rel="noopener">' + echapper(r.url) + "</a>" : "") + "</td>" +
        '<td class="admin-row-actions">' +
        '<button class="btn btn-outline btn-sm" data-id="' + r.id + '" data-action="modifier">Modifier</button>' +
        '<button class="btn btn-danger btn-sm" data-id="' + r.id + '" data-action="supprimer">Supprimer</button>' +
        "</td></tr>"
      );
    }).join("");

    corps.querySelectorAll('[data-action="modifier"]').forEach(function (bouton) {
      bouton.addEventListener("click", function () {
        const r = reponse.data.find(function (x) { return x.id === bouton.getAttribute("data-id"); });
        ressourceEnEdition = r.id;
        document.getElementById("ressource-id").value = r.id;
        document.getElementById("ressource-titre").value = r.titre || "";
        document.getElementById("ressource-url").value = r.url || "";
        document.getElementById("ressource-description").value = r.description || "";
        document.getElementById("ressource-bouton-submit").textContent = "Mettre à jour";
        document.getElementById("ressource-bouton-annuler").classList.remove("hidden");
      });
    });
    corps.querySelectorAll('[data-action="supprimer"]').forEach(function (bouton) {
      bouton.addEventListener("click", function () {
        if (!confirm("Supprimer cette ressource ?")) return;
        sb.from("resources").delete().eq("id", bouton.getAttribute("data-id")).then(chargerRessources);
      });
    });
  });
}

window.addEventListener("robothoche:auth-ok", function () {
  chargerRessources();
  document.getElementById("ressource-bouton-annuler").addEventListener("click", reinitialiserFormulaireRessource);

  document.getElementById("form-ressource").addEventListener("submit", function (evenement) {
    evenement.preventDefault();
    const message = document.getElementById("message-ressources");
    const donnees = {
      titre: document.getElementById("ressource-titre").value.trim(),
      url: document.getElementById("ressource-url").value.trim() || null,
      description: document.getElementById("ressource-description").value.trim() || null,
    };
    const requete = ressourceEnEdition
      ? sb.from("resources").update(donnees).eq("id", ressourceEnEdition)
      : sb.from("resources").insert(donnees);

    requete.then(function (reponse) {
      if (reponse.error) {
        message.textContent = "Erreur : " + reponse.error.message;
        message.className = "form-message is-visible is-error";
        return;
      }
      message.textContent = "Enregistré.";
      message.className = "form-message is-visible is-success";
      reinitialiserFormulaireRessource();
      chargerRessources();
    });
  });
});
