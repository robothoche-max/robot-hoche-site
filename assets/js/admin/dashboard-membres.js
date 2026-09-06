/* ============================================================================
   ONGLET "MEMBRES" (annuaire interne, non public)
   ========================================================================= */

let membreEnEdition = null;

function reinitialiserFormulaireMembre() {
  membreEnEdition = null;
  document.getElementById("form-membre").reset();
  document.getElementById("membre-id").value = "";
  document.getElementById("membre-bouton-submit").textContent = "Ajouter";
  document.getElementById("membre-bouton-annuler").classList.add("hidden");
}

function chargerMembres() {
  sb.from("members").select("id, nom, role, filiere").order("nom").then(function (reponse) {
    const corps = document.getElementById("tableau-membres");
    if (reponse.error) { console.error(reponse.error); return; }
    if (!reponse.data.length) {
      corps.innerHTML = '<tr><td colspan="4" class="text-muted">Aucun membre enregistré.</td></tr>';
      return;
    }
    corps.innerHTML = reponse.data.map(function (m) {
      return (
        "<tr>" +
        "<td>" + echapper(m.nom) + "</td>" +
        "<td>" + echapper(m.role || "") + "</td>" +
        "<td>" + echapper(m.filiere || "") + "</td>" +
        '<td class="admin-row-actions">' +
        '<button class="btn btn-outline btn-sm" data-id="' + m.id + '" data-action="modifier">Modifier</button>' +
        '<button class="btn btn-danger btn-sm" data-id="' + m.id + '" data-action="supprimer">Supprimer</button>' +
        "</td></tr>"
      );
    }).join("");

    corps.querySelectorAll('[data-action="modifier"]').forEach(function (bouton) {
      bouton.addEventListener("click", function () {
        const m = reponse.data.find(function (x) { return x.id === bouton.getAttribute("data-id"); });
        membreEnEdition = m.id;
        document.getElementById("membre-id").value = m.id;
        document.getElementById("membre-nom").value = m.nom || "";
        document.getElementById("membre-role").value = m.role || "";
        document.getElementById("membre-filiere").value = m.filiere || "";
        document.getElementById("membre-bouton-submit").textContent = "Mettre à jour";
        document.getElementById("membre-bouton-annuler").classList.remove("hidden");
      });
    });
    corps.querySelectorAll('[data-action="supprimer"]').forEach(function (bouton) {
      bouton.addEventListener("click", function () {
        if (!confirm("Supprimer ce membre de l'annuaire ?")) return;
        sb.from("members").delete().eq("id", bouton.getAttribute("data-id")).then(chargerMembres);
      });
    });
  });
}

window.addEventListener("robothoche:auth-ok", function () {
  chargerMembres();
  document.getElementById("membre-bouton-annuler").addEventListener("click", reinitialiserFormulaireMembre);

  document.getElementById("form-membre").addEventListener("submit", function (evenement) {
    evenement.preventDefault();
    const message = document.getElementById("message-membres");
    const donnees = {
      nom: document.getElementById("membre-nom").value.trim(),
      role: document.getElementById("membre-role").value.trim() || null,
      filiere: document.getElementById("membre-filiere").value.trim() || null,
    };
    const requete = membreEnEdition
      ? sb.from("members").update(donnees).eq("id", membreEnEdition)
      : sb.from("members").insert(donnees);

    requete.then(function (reponse) {
      if (reponse.error) {
        message.textContent = "Erreur : " + reponse.error.message;
        message.className = "form-message is-visible is-error";
        return;
      }
      message.textContent = "Enregistré.";
      message.className = "form-message is-visible is-success";
      reinitialiserFormulaireMembre();
      chargerMembres();
    });
  });
});
