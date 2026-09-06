/* ============================================================================
   CONNEXION ESPACE BUREAU
   ----------------------------------------------------------------------------
   Étapes :
   1. L'utilisateur saisit son e-mail + mot de passe (créés au préalable par
      le président dans Supabase > Authentication > Users, voir
      GUIDE_DEPLOIEMENT.md).
   2. On demande à Supabase de vérifier ces identifiants.
   3. Si c'est bon, on vérifie que ce compte fait bien partie de la table
      `admins` (c'est CETTE table qui décide qui a réellement accès au
      tableau de bord — voir supabase/schema.sql). Si le compte n'y figure
      pas, on refuse l'accès même si le mot de passe était correct.
   4. Si tout est bon, direction le tableau de bord.
   ========================================================================= */

const formulaireConnexion = document.getElementById("form-connexion");
const messageConnexion = document.getElementById("form-message");

function afficherMessageConnexion(texte) {
  messageConnexion.textContent = texte;
  messageConnexion.className = "form-message is-visible is-error";
}

/** Redirige vers le tableau de bord si une session valide et autorisée existe déjà. */
async function verifierSessionExistante() {
  if (!sb) return;
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return;

  const { data: admin } = await sb.from("admins").select("id").eq("id", session.user.id).maybeSingle();
  if (admin) {
    window.location.href = "dashboard.html";
  }
}
verifierSessionExistante();

if (formulaireConnexion) {
  formulaireConnexion.addEventListener("submit", async function (evenement) {
    evenement.preventDefault();

    if (!sb) {
      afficherMessageConnexion("Le site n'est pas encore relié à Supabase (voir assets/js/config.js).");
      return;
    }

    const bouton = document.getElementById("bouton-connexion");
    bouton.disabled = true;
    bouton.textContent = "Connexion…";

    const email = document.getElementById("champ-email").value.trim();
    const motDePasse = document.getElementById("champ-motdepasse").value;

    const { data, error } = await sb.auth.signInWithPassword({
      email: email,
      password: motDePasse,
    });

    if (error) {
      bouton.disabled = false;
      bouton.textContent = "Se connecter";
      afficherMessageConnexion("E-mail ou mot de passe incorrect.");
      return;
    }

    // Le mot de passe est correct : on vérifie maintenant que ce compte est
    // bien autorisé (présent dans la table admins).
    const { data: admin, error: erreurAdmin } = await sb
      .from("admins")
      .select("id")
      .eq("id", data.user.id)
      .maybeSingle();

    bouton.disabled = false;
    bouton.textContent = "Se connecter";

    if (erreurAdmin || !admin) {
      afficherMessageConnexion(
        "Ce compte n'est pas autorisé à accéder à l'espace bureau. Demande au président de t'ajouter depuis l'onglet \"Gérer les accès\"."
      );
      await sb.auth.signOut();
      return;
    }

    window.location.href = "dashboard.html";
  });
}
