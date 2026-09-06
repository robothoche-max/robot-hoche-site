# Guide de mise en ligne — 100 % gratuit, 100 % à toi

Ce guide t'emmène du dossier de fichiers que tu as téléchargé jusqu'à un
site en ligne, à ton nom, sur tes propres comptes. Une fois ces étapes
terminées, le site ne dépend plus de Claude ni d'Anthropic d'aucune façon :
tu peux fermer cette conversation, le site continuera de fonctionner.

Tu vas utiliser trois services, tous gratuits pour l'usage d'un club de
lycée et ne demandant pas de carte bancaire :

| Service | Rôle | Coût |
|---|---|---|
| **GitHub** | héberge le code du site (comme un Google Drive pour le code) | Gratuit |
| **Supabase** | base de données, connexion, stockage des photos | Gratuit |
| **Netlify** | héberge le site et le rend accessible sur Internet | Gratuit |

Compte une trentaine de minutes pour tout mettre en place la première fois.

---

## Étape 1 — Mettre le code sur GitHub

1. Crée un compte sur [github.com](https://github.com) (gratuit).
2. Clique sur le **+** en haut à droite puis **New repository**.
3. Nomme-le par exemple `robothoche-site`, laisse-le en **Public** ou
   **Private** (les deux fonctionnent avec la suite), ne coche aucune case
   d'initialisation, puis **Create repository**.
4. Sur la page qui s'affiche, clique sur **uploading an existing file**
   (lien dans le texte "...or push an existing repository from the command
   line", il y a aussi un lien direct "uploading an existing file" juste
   au-dessus).
5. Glisse-déposes **tout le contenu** du dossier `robothoche` (pas le
   dossier lui-même, mais tous les fichiers et sous-dossiers qu'il
   contient : `index.html`, `assets`, `images`, `supabase`, etc.).
6. En bas de page, clique sur **Commit changes**.

Ton code est maintenant sur GitHub. Tu pourras revenir modifier n'importe
quel fichier directement depuis le site GitHub (bouton crayon ✏️ sur
chaque fichier), sans rien installer sur ton ordinateur.

---

## Étape 2 — Créer la base de données Supabase

1. Crée un compte sur [supabase.com](https://supabase.com) (gratuit, tu
   peux t'inscrire avec ton compte GitHub pour aller plus vite).
2. Clique sur **New project**. Choisis un nom (ex : `robothoche`), un mot
   de passe pour la base de données (note-le de côté, tu n'en auras
   normalement plus besoin ensuite), une région proche de toi (ex :
   `eu-west` / Europe), puis crée le projet. Patiente une à deux minutes.
3. Une fois le projet prêt, ouvre **SQL Editor** dans le menu de gauche,
   puis **New query**.
4. Ouvre le fichier `supabase/schema.sql` (dans ton dossier téléchargé),
   copie tout son contenu, colle-le dans l'éditeur SQL de Supabase, puis
   clique sur **Run**. Tu dois voir un message de succès.
5. Crée ton propre compte de connexion : va dans **Authentication >
   Users**, clique sur **Add user > Create new user**, renseigne ton
   e-mail et choisis un mot de passe (c'est toi qui le choisis, et c'est
   ce mot de passe que tu utiliseras pour te connecter à l'espace bureau
   du site).
6. Toujours dans **Authentication**, ouvre les réglages du fournisseur
   "Email" et désactive l'inscription libre (souvent une case "Allow new
   users to sign up" à décocher) : ainsi, seuls les comptes que tu crées
   toi-même dans cet écran pourront exister.
7. Retourne dans **SQL Editor > New query**, et exécute cette ligne en
   remplaçant l'adresse par la tienne (celle utilisée à l'étape 5) :
   ```sql
   select public.admin_add_by_email('ton-adresse@email.com', 'president');
   ```
   Tu es maintenant déclaré "président" : accès complet à l'espace bureau,
   y compris la gestion des autres accès.
8. Récupère tes clés de connexion : va dans **Project Settings** (roue
   crantée, en bas du menu de gauche) **> API Keys**. Note precieusement :
   - la **Project URL**
   - la **Publishable key** (si tu ne la vois pas, la clé **anon public**
     fonctionne aussi)

---

## Étape 3 — Relier le site à Supabase

1. Sur GitHub, ouvre le fichier `assets/js/config.js` et clique sur le
   crayon ✏️ (Edit this file).
2. Remplace les deux lignes par tes propres valeurs, récupérées à l'étape
   précédente :
   ```js
   const SUPABASE_URL = "https://xxxxxxxx.supabase.co";
   const SUPABASE_KEY = "ta-cle-publishable-ou-anon";
   ```
3. En bas de page, **Commit changes**.

---

## Étape 4 — Mettre le site en ligne avec Netlify

1. Crée un compte sur [netlify.com](https://netlify.com) (gratuit),
   idéalement en te connectant avec ton compte GitHub pour simplifier la
   suite.
2. Depuis ton tableau de bord Netlify, clique sur **Add new project >
   Import an existing project**.
3. Choisis **GitHub**, autorise l'accès si demandé, puis sélectionne le
   dépôt `robothoche-site` créé à l'étape 1.
4. Netlify propose des réglages de build : tu peux tout laisser vide /
   par défaut (ce site n'a pas besoin d'étape de "build", ce sont des
   fichiers HTML directement utilisables). Clique sur **Deploy**.
5. Après une minute environ, ton site est en ligne, avec une adresse du
   type `https://un-nom-genere.netlify.app`. Tu peux la personnaliser dans
   **Project configuration > General > Change site name**.

---

## Étape 5 — Vérifier que tout fonctionne

- Ouvre le site : les pages Accueil, Présentation, Séances, Projets et
  Calendrier doivent afficher du texte (pas de message d'erreur de
  configuration).
- Va sur `/admin/login.html` (ex : `https://ton-site.netlify.app/admin/login.html`)
  et connecte-toi avec le compte créé à l'étape 2.5. Tu dois arriver sur
  le tableau de bord.
- Depuis le tableau de bord, modifie un texte (par exemple le titre de la
  page d'accueil), enregistre, puis va vérifier sur le site public que le
  changement est bien visible.

---

## Étape 6 — (Optionnel) Un nom de domaine personnalisé

L'adresse `....netlify.app` fonctionne très bien et suffit largement.
Si tu veux un jour une adresse du type `robothoche.fr`, il faudra acheter
un nom de domaine chez un registraire (quelques euros par an, ce n'est
plus gratuit à ce stade) puis le relier depuis **Project configuration >
Domain management** sur Netlify — Netlify fournit alors l'instruction
exacte à suivre.

---

## Étape 7 — Éviter que Supabase se mette en pause

Le compte gratuit Supabase met un projet "en pause" après **7 jours sans
aucune activité sur la base de données**. Concrètement : si personne ne
visite le site pendant plus d'une semaine, les parties dynamiques
(textes, projets, calendrier, connexion) s'arrêtent de fonctionner
jusqu'à ce que quelqu'un réactive le projet manuellement depuis le
tableau de bord Supabase (cela prend environ 30 secondes).

Pour un club actif, ce n'est généralement pas un problème (chaque visite
du site compte comme de l'activité). Par sécurité, tu peux quand même
créer un rappel gratuit et automatique :

1. Crée un compte gratuit sur [uptimerobot.com](https://uptimerobot.com).
2. Ajoute un "Monitor" de type HTTP(s) pointant vers l'adresse de ton
   site Netlify.
3. Choisis un intervalle de vérification de quelques jours au maximum.

Chaque vérification visite le site et maintient ainsi l'activité de la
base de données.

---

## Étape 8 — Ajouter d'autres membres du bureau

Pour donner accès à l'espace bureau à quelqu'un d'autre :

1. Dans Supabase, **Authentication > Users > Add user**, crée un compte
   avec son e-mail et un mot de passe que tu choisis et lui transmets
   toi-même (en main propre, pas par écrit si possible).
2. Connecte-toi à l'espace bureau du site, onglet **Gérer les accès**,
   renseigne son e-mail et choisis son rôle (Éditeur ou Président), puis
   **Autoriser cet accès**.

Pour retirer un accès : même onglet, bouton **Retirer** en face de la
personne concernée.

---

## Et si j'ai besoin d'aide plus tard ?

Ce site n'utilise que des technologies très répandues et documentées
(HTML, CSS, JavaScript, Supabase). Tu peux donc te faire aider par :

- un professeur d'informatique ou de SI du lycée,
- un élève de NSI ou MP2I du club,
- la documentation de [Supabase](https://supabase.com/docs) et de
  [Netlify](https://docs.netlify.com),
- ou en revenant vers Claude (ou une autre IA) avec les fichiers du
  projet : tout le code est commenté pour rendre cela facile.
