# Guide de modification — « je veux changer X, où est-ce que je vais ? »

## D'abord : trois façons de modifier le contenu, du plus simple au plus technique

1. **Le tableau de bord du site** (`/admin/dashboard.html`) — la façon
   normale de modifier le contenu au quotidien : textes, projets,
   calendrier, membres, ressources, accès. Aucune connaissance en code
   n'est nécessaire.
2. **L'éditeur de tables de Supabase** — un filet de sécurité si jamais le
   tableau de bord ne suffit pas ou rencontre un bug : dans ton projet
   Supabase, menu **Table Editor**, tu vois et modifies directement toutes
   les données du site, comme dans un tableur (Excel/Google Sheets).
   Tout ce que le tableau de bord peut faire, cet écran peut aussi le
   faire, "à la main".
3. **Le code du site** — pour tout ce qui touche à la mise en page, aux
   couleurs, à la structure des pages, ou pour ajouter une fonctionnalité
   qui n'existe pas encore. C'est ce que couvre le reste de ce guide.

## « Je veux changer... »

| Je veux modifier... | Où aller |
|---|---|
| Un texte de présentation, un objectif, une valeur | Tableau de bord > **Textes du site** |
| L'e-mail ou l'Instagram affiché sur la page Rejoindre | Tableau de bord > **Textes du site** (section "Rejoindre le club") |
| Ajouter / modifier / supprimer un projet | Tableau de bord > **Projets** |
| Ajouter / modifier / supprimer un événement | Tableau de bord > **Calendrier** |
| Voir qui a demandé à rejoindre le club | Tableau de bord > **Demandes d'inscription** |
| Le numéro de téléphone du président, des notes internes | Tableau de bord > **Informations privées** |
| L'annuaire des membres, les ressources internes | Tableau de bord > **Membres** / **Ressources internes** |
| Qui a le droit de se connecter à l'espace bureau | Tableau de bord > **Gérer les accès** (réservé au président) |
| Les couleurs du site | `assets/css/style.css`, section **2. VARIABLES DE THEME** |
| Les polices d'écriture | `assets/css/style.css` section 1, + le `<link>` Google Fonts dans le `<head>` de chaque page HTML |
| Le logo | Remplace `images/logo.jpg` par un nouveau fichier du même nom |
| Le texte des menus de navigation | Le bloc `<nav class="nav">` en haut de chaque page HTML (à répéter sur toutes les pages) |
| Le pied de page | Le bloc `<footer class="site-footer">` en bas de chaque page HTML (à répéter sur toutes les pages) |
| Ajouter un nouveau texte modifiable depuis le tableau de bord | Voir "Ajouter un champ de texte" ci-dessous |
| Ajouter une toute nouvelle page | Voir "Ajouter une page" ci-dessous |

## Comment le site est organisé (rappel rapide)

- Chaque page publique est un fichier `.html` séparé (`index.html`,
  `presentation.html`, etc.). Comme il n'y a pas de système de "modèle"
  commun, le menu de navigation et le pied de page sont dupliqués sur
  chaque page : si tu modifies l'un, pense à reporter le changement sur
  les autres pages.
- `assets/css/style.css` contient TOUTE la mise en forme visuelle (un
  seul fichier, organisé en sections numérotées et commentées).
- `assets/js/` contient tout le comportement : un fichier par page
  publique, et un dossier `admin/` avec un fichier par onglet du tableau
  de bord.
- `supabase/schema.sql` décrit la base de données. Tu ne le ré-exécutes
  normalement qu'une fois (voir GUIDE_DEPLOIEMENT.md) ; reviens-y
  seulement si tu ajoutes une vraie nouvelle fonctionnalité.

## Ajouter un champ de texte modifiable depuis le tableau de bord

Exemple : tu veux pouvoir modifier depuis le tableau de bord une phrase
qui, pour l'instant, est écrite en dur dans le HTML.

1. Choisis une **clé** unique pour ce texte (minuscules, sans espaces),
   par exemple `accueil_slogan`.
2. Dans `supabase/schema.sql`, ajoute une ligne dans le bloc
   `insert into public.site_texts (cle, valeur) values (...)` avec ta clé
   et un texte de départ, puis exécute uniquement cette nouvelle ligne
   dans l'éditeur SQL de Supabase (`insert into public.site_texts (cle,
   valeur) values ('accueil_slogan', 'Mon texte de départ') on conflict
   (cle) do nothing;`).
3. Dans `assets/js/admin/dashboard-textes.js`, ajoute une ligne dans le
   tableau `CHAMPS_TEXTES` (copie une ligne existante et adapte-la) : le
   champ apparaîtra automatiquement dans le tableau de bord.
4. Dans la page HTML publique concernée, donne un `id` à l'élément
   concerné (ex : `id="txt-slogan"`), et dans le script JS de cette page,
   ajoute `definirTexte("txt-slogan", textes.accueil_slogan);` dans la
   fonction `chargerTextesSite(...)`.

## Ajouter une page

1. Duplique une page existante proche de ce que tu veux faire (copie par
   exemple `presentation.html` et renomme la copie).
2. Ajoute un lien vers cette page dans le menu de navigation (`<ul
   class="nav-links">`) de **toutes** les pages du site (y compris la
   nouvelle).
3. Adapte le contenu de la nouvelle page, et crée si besoin un fichier JS
   dédié dans `assets/js/` pour son contenu dynamique.

## Design du site : les choix faits (pour rester cohérent si tu changes quelque chose)

- **Couleurs** : bleu "circuit imprimé" (`--accent`) comme couleur
  principale, cuivre/orangé (`--copper`) comme accent rare pour les
  actions importantes (bouton d'inscription, etc.) — en écho au fer à
  souder du logo. Évite d'ajouter une troisième couleur d'accent : le
  site reste lisible en en gardant peu.
- **Polices** : "Space Grotesk" pour tous les titres (identité technique),
  "IBM Plex Sans" pour le texte courant.
- **Mode clair/sombre** : toujours passer par les variables CSS de la
  section 2 de `style.css` plutôt que d'écrire une couleur "en dur"
  quelque part, sinon elle ne changera pas avec le thème.
