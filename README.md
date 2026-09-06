# Robot'Hoche — site du club

Site du club de robotique **Robot'Hoche** (Lycée Hoche). Site statique
(HTML / CSS / JavaScript, sans "build") relié à une base de données
[Supabase](https://supabase.com) gratuite pour tout ce qui doit être
modifiable facilement : textes, projets, calendrier, demandes d'inscription,
et un espace privé réservé au bureau du club.

Deux autres documents t'intéressent probablement :

- **GUIDE_DEPLOIEMENT.md** — toutes les étapes, gratuites, pour mettre le
  site en ligne et le posséder entièrement (aucun compte Anthropic/Claude
  requis pour le faire fonctionner une fois en ligne).
- **GUIDE_MODIFICATION.md** — "je veux changer X, où est-ce que je vais ?"
  Un sommaire pratique pour retrouver rapidement où modifier chaque partie
  du site (texte, couleur, police, ajout d'une page...).

## Ce qui est déjà fait

- Pages publiques : Accueil, Présentation, Déroulement d'une séance,
  Projets, Calendrier, Rejoindre le club.
- Mode clair / sombre (mémorisé automatiquement).
- Mise en page responsive (mobile, tablette, ordinateur).
- Espace privé `/admin/` protégé par connexion, avec :
  - un tableau de bord pour éditer tous les textes du site,
  - la gestion des projets (avec envoi de photo) et du calendrier,
  - la liste des demandes d'inscription reçues,
  - un espace pour les informations privées (numéro de téléphone, notes),
  - un annuaire de membres et des ressources internes,
  - la gestion des personnes autorisées à se connecter (réservé au
    "président").
- Un exemple de projet et d'événement pré-remplis, à modifier ou supprimer.

## Structure du projet

```
robothoche/
├── index.html              Page d'accueil
├── presentation.html        Page "Présentation"
├── seances.html              Page "Déroulement d'une séance"
├── projets.html              Page "Projets" (contenu dynamique)
├── calendrier.html           Page "Calendrier" (contenu dynamique)
├── inscription.html          Page "Rejoindre le club" + formulaire
├── admin/
│   ├── login.html             Connexion à l'espace bureau
│   └── dashboard.html         Tableau de bord (contenu, calendrier, accès...)
├── assets/
│   ├── css/style.css          TOUTE la mise en forme du site (un seul fichier)
│   └── js/
│       ├── config.js           <-- clés Supabase à renseigner (voir guide de déploiement)
│       ├── supabase-client.js  connexion à la base de données
│       ├── theme.js            mode clair/sombre
│       ├── nav.js               menu mobile
│       ├── site-commun.js       fonctions partagées par les pages publiques
│       ├── home.js, presentation.js, seances.js, projets.js,
│       │   calendrier.js, inscription.js   scripts propres à chaque page
│       └── admin/               scripts de l'espace bureau (un fichier par onglet)
├── images/
│   ├── logo.jpg                logo du club
│   └── favicon-*.png           icônes du site
├── supabase/
│   └── schema.sql              scripts à exécuter une fois dans Supabase
├── README.md                  ce fichier
├── GUIDE_DEPLOIEMENT.md        comment mettre le site en ligne (gratuitement)
└── GUIDE_MODIFICATION.md       comment modifier le site facilement
```

## Avant la mise en ligne : voir le site en local

Le site est fait de fichiers HTML classiques : tu peux double-cliquer sur
`index.html` pour l'ouvrir dans ton navigateur et voir la mise en page. En
revanche, tant que `assets/js/config.js` n'est pas rempli (voir
GUIDE_DEPLOIEMENT.md), les parties qui viennent de la base de données
(textes personnalisables, projets, calendrier, connexion...) ne
s'afficheront pas encore — c'est normal.

## Technique utilisée (et pourquoi)

- **Aucun "framework"** (pas de React, pas de build) : uniquement du HTML,
  CSS et JavaScript que n'importe quel navigateur comprend directement.
  C'est plus simple à héberger gratuitement, à comprendre et à modifier
  toi-même, y compris avec de l'aide extérieure (un professeur d'info, un
  élève de NSI, ou une IA).
- **[Supabase](https://supabase.com)** pour la base de données, la
  connexion et le stockage des photos : gratuit pour un usage comme celui
  d'un club (voir les limites détaillées dans le guide de déploiement), et
  fournit une interface graphique complète pour éditer les données à la
  main si jamais le tableau de bord du site ne suffit pas.
- La sécurité (qui a le droit de voir/modifier quoi) est appliquée
  **directement dans la base de données** (règles "Row Level Security",
  voir `supabase/schema.sql`) : même si quelqu'un lisait tout le code du
  site, il ne pourrait ni lire les informations privées, ni modifier le
  contenu sans être autorisé.
