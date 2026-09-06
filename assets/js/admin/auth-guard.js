/* ============================================================================
   GARDE D'ACCES DU TABLEAU DE BORD
   ----------------------------------------------------------------------------
   Ce script s'exécute en tout premier sur dashboard.html. Il :
     1. Vérifie qu'une session Supabase valide existe (sinon -> login.html)
     2. Vérifie que ce compte figure dans la table `admins` (sinon -> déconnexion
        et retour à login.html)
     3. Affiche le tableau de bord et prévient tous les autres scripts que
        tout est bon en déclenchant l'événement "robothoche:auth-ok"

   Les autres fichiers assets/js/admin/dashboard-xxx.js attendent tous cet
   événement avant de charger leurs données : c'est la garantie qu'aucune
   requête n'est faite tant qu'on n'est pas sûr que la personne est autorisée.
   ========================================================================= */

(async function () {
  const ecranChargement = document.getElementById("verification-en-cours");
  const tableauDeBord = document.getElementById("tableau-de-bord");

  if (!sb) {
    ecranChargement.innerHTML =
      '<div class="card login-card"><p>Le site n\'est pas encore relié à Supabase.</p>' +
      '<p><a href="../index.html">Retour au site</a></p></div>';
    return;
  }

  const { data: { session } } = await sb.auth.getSession();
  if (!session) {
    window.location.href = "login.html";
    return;
  }

  const { data: admin, error } = await sb
    .from("admins")
    .select("id, email, role")
    .eq("id", session.user.id)
    .maybeSingle();

  if (error || !admin) {
    await sb.auth.signOut();
    window.location.href = "login.html";
    return;
  }

  // Rendu disponible à tous les autres scripts du tableau de bord.
  window.ADMIN_COURANT = admin;

  document.getElementById("info-connecte").textContent =
    admin.email + " · " + (admin.role === "president" ? "Président" : "Éditeur");

  if (admin.role === "president") {
    document.getElementById("onglet-acces").classList.remove("hidden");
  }

  ecranChargement.classList.add("hidden");
  tableauDeBord.classList.remove("hidden");

  document.getElementById("bouton-deconnexion").addEventListener("click", async function () {
    await sb.auth.signOut();
    window.location.href = "login.html";
  });

  window.dispatchEvent(new CustomEvent("robothoche:auth-ok", { detail: { admin: admin } }));
})();
