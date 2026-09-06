/* ============================================================================
   PAGE INSCRIPTION — script spécifique
   ----------------------------------------------------------------------------
   - Construit les liens "e-mail" et "Instagram" à partir des textes du site
     (table site_texts, clés inscription_email / inscription_instagram).
   - Envoie le formulaire vers la table `signup_requests`. N'importe qui peut
     créer une demande (voir supabase/schema.sql), mais seuls les
     administrateurs peuvent la consulter, depuis le tableau de bord.
   ========================================================================= */

if (!sb) afficherErreurConfig("txt-intro");

chargerTextesSite(function (textes) {
  definirTexte("txt-intro", textes.inscription_intro);
  definirTexte("footer-texte", textes.footer_texte);

  if (textes.inscription_email) {
    const lienEmail = document.getElementById("lien-email");
    lienEmail.href =
      "mailto:" + textes.inscription_email + "?subject=" +
      encodeURIComponent("Je veux rejoindre Robot'Hoche");
  }

  if (textes.inscription_instagram) {
    const identifiant = textes.inscription_instagram.replace("@", "").trim();
    const lienInsta = document.getElementById("lien-instagram");
    lienInsta.href = "https://instagram.com/" + identifiant;
    lienInsta.textContent = "Suivre " + textes.inscription_instagram + " sur Instagram";
  }
});

const formulaire = document.getElementById("form-inscription");
const messageForm = document.getElementById("form-message");

function afficherMessageForm(texte, type) {
  messageForm.textContent = texte;
  messageForm.className = "form-message is-visible " + (type === "erreur" ? "is-error" : "is-success");
}

if (formulaire) {
  formulaire.addEventListener("submit", function (evenement) {
    evenement.preventDefault();

    if (!sb) {
      afficherMessageForm("Le site n'est pas encore relié à sa base de données.", "erreur");
      return;
    }

    const bouton = document.getElementById("bouton-envoyer");
    bouton.disabled = true;
    bouton.textContent = "Envoi en cours…";

    const demande = {
      nom: document.getElementById("champ-nom").value.trim(),
      classe: document.getElementById("champ-classe").value.trim(),
      email: document.getElementById("champ-email").value.trim(),
      message: document.getElementById("champ-message").value.trim(),
    };

    sb.from("signup_requests")
      .insert(demande)
      .then(function (reponse) {
        bouton.disabled = false;
        bouton.textContent = "Envoyer ma demande";

        if (reponse.error) {
          console.error("Erreur d'envoi de la demande :", reponse.error);
          afficherMessageForm("Une erreur est survenue, réessaie dans un instant.", "erreur");
          return;
        }

        afficherMessageForm("Demande envoyée ! On revient vers toi rapidement.", "succes");
        formulaire.reset();
      });
  });
}
