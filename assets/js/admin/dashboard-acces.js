/* ============================================================================
   ONGLET "GERER LES ACCES" (réservé au président)
   ----------------------------------------------------------------------------
   Utilise les fonctions SQL définies dans supabase/schema.sql :
     - admin_add_by_email(email, role) : autorise un compte déjà créé dans
       Supabase Authentication à se connecter au tableau de bord.
     - admin_remove(id) : retire un accès (impossible de se retirer
       soi-même, et il doit toujours rester au moins un président).
   Ces fonctions vérifient elles-mêmes, côté serveur, que seul le président
   peut les utiliser : même si ce script était modifié ou contourné, un
   compte "éditeur" ne pourrait pas obtenir plus de droits.
   ========================================================================= */

function construireLigneAcces(admin, monId) {
  const estMoi = admin.id === monId;
  return (
    "<tr>" +
    "<td>" + echapper(admin.email) + (estMoi ? " (toi)" : "") + "</td>" +
    "<td>" + (admin.role === "president" ? "Président" : "Éditeur") + "</td>" +
    "<td>" +
    (estMoi
      ? ""
      : '<button class="btn btn-danger btn-sm" data-id="' + admin.id + '">Retirer</button>') +
    "</td></tr>"
  );
}

function chargerAcces() {
  sb.from("admins").select("id, email, role").order("role").then(function (reponse) {
    const corps = document.getElementById("tableau-acces");
    if (reponse.error) { console.error(reponse.error); return; }

    corps.innerHTML = reponse.data
      .map(function (a) { return construireLigneAcces(a, window.ADMIN_COURANT.id); })
      .join("");

    corps.querySelectorAll("button[data-id]").forEach(function (bouton) {
      bouton.addEventListener("click", function () {
        if (!confirm("Retirer cet accès à l'espace bureau ?")) return;
        sb.rpc("admin_remove", { cible_id: bouton.getAttribute("data-id") }).then(function (reponse) {
          if (reponse.error) { alert("Erreur : " + reponse.error.message); return; }
          chargerAcces();
        });
      });
    });
  });
}

window.addEventListener("robothoche:auth-ok", function (evenement) {
  if (evenement.detail.admin.role !== "president") return; // panneau inutile pour un éditeur

  chargerAcces();

  document.getElementById("form-acces").addEventListener("submit", function (evt) {
    evt.preventDefault();
    const message = document.getElementById("message-acces");
    const email = document.getElementById("acces-email").value.trim();
    const role = document.getElementById("acces-role").value;

    sb.rpc("admin_add_by_email", { cible_email: email, cible_role: role }).then(function (reponse) {
      if (reponse.error) {
        message.textContent = "Erreur : " + reponse.error.message;
        message.className = "form-message is-visible is-error";
        return;
      }
      message.textContent = "Accès autorisé pour " + email + ".";
      message.className = "form-message is-visible is-success";
      document.getElementById("form-acces").reset();
      chargerAcces();
    });
  });
});
