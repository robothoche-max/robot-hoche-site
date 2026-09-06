/* ============================================================================
   ONGLET "DEMANDES D'INSCRIPTION"
   ----------------------------------------------------------------------------
   Affiche les demandes envoyées depuis le formulaire public de la page
   "Rejoindre" (table signup_requests). Une case à cocher permet de marquer
   une demande comme traitée ; un bouton permet de la supprimer.
   ========================================================================= */

function construireLigneInscription(demande) {
  const date = new Date(demande.created_at).toLocaleDateString("fr-FR");
  return (
    '<tr data-id="' + demande.id + '">' +
    "<td>" + date + "</td>" +
    "<td>" + echapper(demande.nom) + "</td>" +
    "<td>" + echapper(demande.classe || "") + "</td>" +
    '<td><a href="mailto:' + echapper(demande.email) + '">' + echapper(demande.email) + "</a></td>" +
    "<td>" + echapper(demande.message || "") + "</td>" +
    '<td><input type="checkbox" data-action="traite" ' + (demande.traite ? "checked" : "") + "></td>" +
    '<td><button class="btn btn-danger btn-sm" data-action="supprimer">Supprimer</button></td>' +
    "</tr>"
  );
}

function chargerInscriptions() {
  sb.from("signup_requests")
    .select("id, nom, classe, email, message, traite, created_at")
    .order("created_at", { ascending: false })
    .then(function (reponse) {
      const corpsTableau = document.getElementById("tableau-inscriptions");
      if (reponse.error) { console.error(reponse.error); return; }
      if (!reponse.data.length) {
        corpsTableau.innerHTML = '<tr><td colspan="7" class="text-muted">Aucune demande reçue pour l\'instant.</td></tr>';
        return;
      }
      corpsTableau.innerHTML = reponse.data.map(construireLigneInscription).join("");

      corpsTableau.querySelectorAll("tr").forEach(function (ligne) {
        const id = ligne.getAttribute("data-id");
        const caseTraite = ligne.querySelector('[data-action="traite"]');
        const boutonSupprimer = ligne.querySelector('[data-action="supprimer"]');

        caseTraite.addEventListener("change", function () {
          sb.from("signup_requests").update({ traite: caseTraite.checked }).eq("id", id).then(function (reponse) {
            if (reponse.error) alert("Erreur : " + reponse.error.message);
          });
        });

        boutonSupprimer.addEventListener("click", function () {
          if (!confirm("Supprimer définitivement cette demande ?")) return;
          sb.from("signup_requests").delete().eq("id", id).then(function () { chargerInscriptions(); });
        });
      });
    });
}

window.addEventListener("robothoche:auth-ok", chargerInscriptions);
