/* ============================================================================
   ONGLET "INFORMATIONS PRIVEES"
   ----------------------------------------------------------------------------
   Gère la table `private_info`, protégée par les règles de sécurité pour
   n'être lisible et modifiable QUE par les comptes présents dans la table
   `admins` (voir supabase/schema.sql, section 3). Ces informations
   n'apparaissent jamais sur les pages publiques du site.

   >>> Pour ajouter une nouvelle information privée <<<
   1. Ajoute une ligne dans supabase/schema.sql (bloc "insert into
      public.private_info").
   2. Ajoute un champ correspondant dans admin/dashboard.html (#panel-prive).
   3. Relie les deux ci-dessous, sur le modèle de "telephone_president".
   ========================================================================= */

function chargerInfosPrivees() {
  sb.from("private_info").select("cle, valeur").then(function (reponse) {
    if (reponse.error) { console.error(reponse.error); return; }
    const dictionnaire = {};
    reponse.data.forEach(function (ligne) { dictionnaire[ligne.cle] = ligne.valeur; });
    document.getElementById("prive-telephone").value = dictionnaire.telephone_president || "";
    document.getElementById("prive-notes").value = dictionnaire.notes_internes || "";
  });
}

window.addEventListener("robothoche:auth-ok", function () {
  chargerInfosPrivees();

  document.getElementById("form-prive").addEventListener("submit", function (evenement) {
    evenement.preventDefault();
    const message = document.getElementById("message-prive");

    const lignes = [
      { cle: "telephone_president", valeur: document.getElementById("prive-telephone").value.trim() },
      { cle: "notes_internes", valeur: document.getElementById("prive-notes").value },
    ];

    sb.from("private_info").upsert(lignes, { onConflict: "cle" }).then(function (reponse) {
      if (reponse.error) {
        message.textContent = "Erreur : " + reponse.error.message;
        message.className = "form-message is-visible is-error";
        return;
      }
      message.textContent = "Informations enregistrées.";
      message.className = "form-message is-visible is-success";
    });
  });
});
