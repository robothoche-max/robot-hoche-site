/* ============================================================================
   ONGLET "TEXTES DU SITE"
   ----------------------------------------------------------------------------
   >>> POUR AJOUTER UN NOUVEAU TEXTE MODIFIABLE SUR LE SITE <<<
   1. Ajoute une ligne dans le tableau CHAMPS_TEXTES ci-dessous (choisis une
      "cle" unique, en minuscules et sans espaces).
   2. Ajoute la même clé dans supabase/schema.sql (bloc "insert into
      public.site_texts"), pour qu'elle existe par défaut.
   3. Dans la page HTML publique concernée, ajoute un élément avec l'id de
      ton choix, puis va chercher `textes.ta_cle` dans le script JS de la
      page (voir par exemple assets/js/presentation.js).
   C'est tout : ce fichier se charge de générer automatiquement le champ de
   formulaire correspondant, il n'y a rien d'autre à coder ici.
   ========================================================================= */

const CHAMPS_TEXTES = [
  { groupe: "Accueil", cle: "accueil_eyebrow", label: "Petite accroche au-dessus du titre", type: "text" },
  { groupe: "Accueil", cle: "accueil_titre", label: "Titre principal", type: "text" },
  { groupe: "Accueil", cle: "accueil_soustitre", label: "Texte sous le titre", type: "textarea" },

  { groupe: "Présentation", cle: "presentation_intro", label: "Texte de présentation (qu'est-ce que c'est)", type: "textarea-longue" },
  { groupe: "Présentation", cle: "presentation_pour_qui", label: "À qui s'adresse le club", type: "textarea" },
  { groupe: "Présentation", cle: "presentation_organisation", label: "Qui anime le club", type: "textarea" },
  { groupe: "Présentation", cle: "presentation_valeurs", label: "Valeurs du club", type: "textarea", hint: "Une valeur par ligne." },
  { groupe: "Présentation", cle: "presentation_objectifs", label: "Objectifs de l'année", type: "textarea", hint: "Un objectif par ligne, dans l'ordre d'affichage souhaité." },
  { groupe: "Présentation", cle: "presentation_partenaires", label: "Texte sur les partenaires", type: "textarea" },

  { groupe: "Déroulement d'une séance", cle: "seances_intro", label: "Texte sur le rythme des séances", type: "textarea" },
  { groupe: "Déroulement d'une séance", cle: "seances_evaluation", label: "Texte sur l'évaluation", type: "textarea" },

  { groupe: "Projets", cle: "projets_intro", label: "Texte d'introduction de la page Projets", type: "textarea" },

  { groupe: "Calendrier", cle: "calendrier_intro", label: "Texte d'introduction de la page Calendrier", type: "textarea" },

  { groupe: "Rejoindre le club", cle: "inscription_intro", label: "Texte d'introduction de la page Rejoindre", type: "textarea" },
  { groupe: "Rejoindre le club", cle: "inscription_email", label: "E-mail de contact", type: "text" },
  { groupe: "Rejoindre le club", cle: "inscription_instagram", label: "Identifiant Instagram (ex : @robot.hoche)", type: "text" },

  { groupe: "Pied de page", cle: "footer_texte", label: "Phrase du pied de page", type: "text" },
];

function construireChampTexte(champ) {
  const idChamp = "texte-" + champ.cle;
  const hint = champ.hint ? '<span class="hint">' + champ.hint + "</span>" : "";
  let controle;
  if (champ.type === "text") {
    controle = '<input class="input" id="' + idChamp + '" data-cle="' + champ.cle + '">';
  } else if (champ.type === "textarea-longue") {
    controle = '<textarea class="input" id="' + idChamp + '" data-cle="' + champ.cle + '" rows="8"></textarea>';
  } else {
    controle = '<textarea class="input" id="' + idChamp + '" data-cle="' + champ.cle + '" rows="4"></textarea>';
  }
  return (
    '<div class="field"><label for="' + idChamp + '">' + champ.label + "</label>" + hint + controle + "</div>"
  );
}

function construireFormulaireTextes() {
  const formulaire = document.getElementById("form-textes");
  const groupes = {};
  CHAMPS_TEXTES.forEach(function (champ) {
    if (!groupes[champ.groupe]) groupes[champ.groupe] = [];
    groupes[champ.groupe].push(champ);
  });

  let html = "";
  Object.keys(groupes).forEach(function (nomGroupe) {
    html += '<div class="editor-form"><h3>' + nomGroupe + "</h3>";
    html += groupes[nomGroupe].map(construireChampTexte).join("");
    html += "</div>";
  });
  html += '<button type="submit" class="btn btn-primary">Enregistrer les modifications</button>';
  formulaire.innerHTML = html;
}

function chargerValeursTextes() {
  sb.from("site_texts").select("cle, valeur").then(function (reponse) {
    if (reponse.error) {
      console.error("Erreur de chargement des textes :", reponse.error);
      return;
    }
    reponse.data.forEach(function (ligne) {
      const champ = document.getElementById("texte-" + ligne.cle);
      if (champ) champ.value = ligne.valeur;
    });
  });
}

window.addEventListener("robothoche:auth-ok", function () {
  construireFormulaireTextes();
  chargerValeursTextes();

  document.getElementById("form-textes").addEventListener("submit", function (evenement) {
    evenement.preventDefault();

    const lignes = CHAMPS_TEXTES.map(function (champ) {
      const el = document.getElementById("texte-" + champ.cle);
      return { cle: champ.cle, valeur: el ? el.value : "" };
    });

    const message = document.getElementById("message-textes");
    sb.from("site_texts")
      .upsert(lignes, { onConflict: "cle" })
      .then(function (reponse) {
        if (reponse.error) {
          message.textContent = "Erreur lors de l'enregistrement : " + reponse.error.message;
          message.className = "form-message is-visible is-error";
          return;
        }
        message.textContent = "Textes enregistrés avec succès.";
        message.className = "form-message is-visible is-success";
      });
  });
});
