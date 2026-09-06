-- ============================================================================
-- ROBOT'HOCHE — SCRIPT DE MISE EN PLACE DE LA BASE DE DONNEES SUPABASE
-- ============================================================================
-- A quoi sert ce fichier ?
-- Il contient TOUT ce qu'il faut pour créer, en une seule fois, la base de
-- données qui fait fonctionner le site : les tables (comme des feuilles de
-- calcul), les règles de sécurité (qui a le droit de lire/modifier quoi) et
-- quelques données de départ.
--
-- Comment l'utiliser (voir aussi GUIDE_DEPLOIEMENT.md, étape "Créer le
-- projet Supabase") :
--   1. Crée un compte gratuit sur https://supabase.com et un nouveau projet.
--   2. Dans le menu de gauche, ouvre "SQL Editor" > "New query".
--   3. Colle ENTIEREMENT le contenu de ce fichier.
--   4. Clique sur "Run". Tout se crée d'un coup.
--   5. Tu n'as normalement plus jamais besoin de revenir ici, sauf si tu
--      veux ajouter une nouvelle fonctionnalité (dans ce cas, demande de
--      l'aide, y compris à Claude, en donnant ce fichier comme contexte).
--
-- Ce script peut être exécuté plusieurs fois sans tout casser grâce aux
-- "if not exists" / "on conflict do nothing" : si jamais tu dois relancer
-- une partie, ça ne dupliquera pas les données.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 0. EXTENSION NECESSAIRE (génération d'identifiants uniques)
-- ----------------------------------------------------------------------------
create extension if not exists pgcrypto;


-- ----------------------------------------------------------------------------
-- 1. TABLES
-- ----------------------------------------------------------------------------

-- site_texts : tous les petits textes modifiables du site (titres,
-- paragraphes de présentation, contact...). Une ligne = un texte, repéré par
-- une "clé" (cle) utilisée par le code du site pour savoir où l'afficher.
-- Quand un texte doit contenir une LISTE (valeurs du club, objectifs...),
-- la convention est simple : "une ligne = un élément de la liste" à
-- l'intérieur du texte.
create table if not exists public.site_texts (
  cle         text primary key,
  valeur      text not null default '',
  updated_at  timestamptz not null default now()
);

-- projects : les projets présentés sur la page "Projets".
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  titre       text not null,
  resume      text not null default '',   -- court texte affiché sur la carte
  description text not null default '',   -- texte plus complet (démarche, étapes, retour d'expérience)
  statut      text not null default 'En cours', -- ex : "Idée", "En cours", "Terminé"
  image_url   text,                       -- lien vers une image (upload ou externe)
  video_url   text,                       -- lien Youtube ou Instagram
  ordre       integer not null default 0, -- ordre d'affichage (plus petit = affiché en premier)
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- events : le calendrier / les événements à venir.
create table if not exists public.events (
  id              uuid primary key default gen_random_uuid(),
  titre           text not null,
  description     text not null default '',
  date_evenement  date not null,
  heure           text,   -- texte libre, ex "17h30" (pas de type "time" pour rester simple)
  lieu            text,
  created_at      timestamptz not null default now()
);

-- signup_requests : les demandes d'inscription envoyées depuis la page
-- "Rejoindre le club". N'importe quel visiteur peut en créer une (c'est le
-- but !) mais seuls les administrateurs peuvent les consulter.
create table if not exists public.signup_requests (
  id          uuid primary key default gen_random_uuid(),
  nom         text not null,
  classe      text,          -- ex "MPSI", "MP2I", "Terminale"...
  email       text not null,
  message     text,
  traite      boolean not null default false,
  created_at  timestamptz not null default now()
);

-- admins : la liste des comptes autorisés à se connecter à l'espace privé.
-- "id" correspond à l'identifiant du compte créé dans Supabase Authentication.
-- role = 'president' (tous les droits, dont gérer les autres admins) ou
-- 'editor' (peut modifier le contenu mais pas gérer les accès).
create table if not exists public.admins (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  role        text not null default 'editor' check (role in ('president','editor')),
  created_at  timestamptz not null default now()
);

-- private_info : informations visibles UNIQUEMENT par les administrateurs
-- connectés (ex : numéro de téléphone du président, notes internes).
create table if not exists public.private_info (
  cle         text primary key,
  valeur      text not null default '',
  updated_at  timestamptz not null default now()
);

-- members : annuaire interne des membres du club (fonctionnalité privée,
-- non affichée publiquement).
create table if not exists public.members (
  id          uuid primary key default gen_random_uuid(),
  nom         text not null,
  role        text,       -- ex "Président", "Référent communication"...
  filiere     text,       -- ex "MPSI", "MP2I", "Professeur référent"...
  created_at  timestamptz not null default now()
);

-- resources : liens/ressources internes (fonctionnalité privée, non affichée
-- publiquement) — tutoriels, drive partagé, contacts alumni, etc.
create table if not exists public.resources (
  id          uuid primary key default gen_random_uuid(),
  titre       text not null,
  url         text,
  description text,
  created_at  timestamptz not null default now()
);


-- ----------------------------------------------------------------------------
-- 2. FONCTIONS DE SECURITE
-- ----------------------------------------------------------------------------
-- Ces deux fonctions répondent à une question simple : "la personne
-- actuellement connectée est-elle un administrateur (is_admin) / LE
-- président (is_president) ?". Elles sont utilisées par toutes les règles
-- de sécurité (RLS) ci-dessous. "security definer" leur permet de vérifier
-- la table admins même si l'utilisateur qui pose la question n'a pas le
-- droit de lire cette table lui-même (évite les soucis de récursion).

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admins where id = auth.uid()
  );
$$;

create or replace function public.is_president()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.admins where id = auth.uid() and role = 'president'
  );
$$;

-- Fonction pratique utilisée par l'onglet "Gérer les accès" du tableau de
-- bord : elle permet au président d'autoriser un nouvel administrateur en
-- tapant simplement son email (le compte doit déjà avoir été créé dans
-- Supabase > Authentication > Users, voir GUIDE_DEPLOIEMENT.md).
create or replace function public.admin_add_by_email(cible_email text, cible_role text default 'editor')
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  cible_id uuid;
begin
  if not public.is_president() then
    raise exception 'Seul le président du club peut ajouter un administrateur.';
  end if;

  if cible_role not in ('president', 'editor') then
    raise exception 'Rôle invalide : utilise "president" ou "editor".';
  end if;

  select id into cible_id from auth.users where email = cible_email;

  if cible_id is null then
    raise exception
      'Aucun compte utilisateur trouvé pour "%". Crée d''abord ce compte dans Supabase > Authentication > Users.',
      cible_email;
  end if;

  insert into public.admins (id, email, role)
  values (cible_id, cible_email, cible_role)
  on conflict (id) do update set role = excluded.role, email = excluded.email;
end;
$$;

-- Fonction pour retirer un administrateur, avec deux garde-fous : on ne
-- peut pas se retirer soi-même, et on ne peut pas retirer le dernier
-- président restant (pour ne jamais se retrouver sans accès à l'espace
-- privé).
create or replace function public.admin_remove(cible_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  nb_presidents integer;
  cible_role text;
begin
  if not public.is_president() then
    raise exception 'Seul le président du club peut retirer un administrateur.';
  end if;

  if cible_id = auth.uid() then
    raise exception 'Tu ne peux pas retirer ton propre accès depuis cette fonction.';
  end if;

  select role into cible_role from public.admins where id = cible_id;
  select count(*) into nb_presidents from public.admins where role = 'president';

  if cible_role = 'president' and nb_presidents <= 1 then
    raise exception 'Impossible : il doit toujours rester au moins un président.';
  end if;

  delete from public.admins where id = cible_id;
end;
$$;

-- Par défaut, Postgres autorise tout le monde à exécuter une fonction :
-- on restreint explicitement l'exécution des fonctions d'administration
-- aux personnes connectées (la vérification is_president() se charge
-- ensuite du reste).
revoke all on function public.admin_add_by_email(text, text) from public;
grant execute on function public.admin_add_by_email(text, text) to authenticated;
revoke all on function public.admin_remove(uuid) from public;
grant execute on function public.admin_remove(uuid) to authenticated;


-- ----------------------------------------------------------------------------
-- 3. SECURITE DES TABLES (Row Level Security)
-- ----------------------------------------------------------------------------
-- Principe général appliqué partout :
--   - Contenu PUBLIC (site_texts, projects, events) : tout le monde peut
--     lire, seuls les administrateurs peuvent écrire.
--   - signup_requests : tout le monde peut créer une demande, seuls les
--     administrateurs peuvent la consulter/traiter.
--   - Contenu PRIVE (admins, private_info, members, resources) : seuls les
--     administrateurs peuvent lire et écrire.

alter table public.site_texts      enable row level security;
alter table public.projects        enable row level security;
alter table public.events          enable row level security;
alter table public.signup_requests enable row level security;
alter table public.admins          enable row level security;
alter table public.private_info    enable row level security;
alter table public.members         enable row level security;
alter table public.resources       enable row level security;

-- site_texts
drop policy if exists "site_texts_lecture_publique" on public.site_texts;
create policy "site_texts_lecture_publique" on public.site_texts
  for select using (true);
drop policy if exists "site_texts_ecriture_admin" on public.site_texts;
create policy "site_texts_ecriture_admin" on public.site_texts
  for all using (public.is_admin()) with check (public.is_admin());

-- projects
drop policy if exists "projects_lecture_publique" on public.projects;
create policy "projects_lecture_publique" on public.projects
  for select using (true);
drop policy if exists "projects_ecriture_admin" on public.projects;
create policy "projects_ecriture_admin" on public.projects
  for insert with check (public.is_admin());
drop policy if exists "projects_modification_admin" on public.projects;
create policy "projects_modification_admin" on public.projects
  for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists "projects_suppression_admin" on public.projects;
create policy "projects_suppression_admin" on public.projects
  for delete using (public.is_admin());

-- events
drop policy if exists "events_lecture_publique" on public.events;
create policy "events_lecture_publique" on public.events
  for select using (true);
drop policy if exists "events_ecriture_admin" on public.events;
create policy "events_ecriture_admin" on public.events
  for insert with check (public.is_admin());
drop policy if exists "events_modification_admin" on public.events;
create policy "events_modification_admin" on public.events
  for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists "events_suppression_admin" on public.events;
create policy "events_suppression_admin" on public.events
  for delete using (public.is_admin());

-- signup_requests
drop policy if exists "signup_creation_publique" on public.signup_requests;
create policy "signup_creation_publique" on public.signup_requests
  for insert with check (true);
drop policy if exists "signup_lecture_admin" on public.signup_requests;
create policy "signup_lecture_admin" on public.signup_requests
  for select using (public.is_admin());
drop policy if exists "signup_modification_admin" on public.signup_requests;
create policy "signup_modification_admin" on public.signup_requests
  for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists "signup_suppression_admin" on public.signup_requests;
create policy "signup_suppression_admin" on public.signup_requests
  for delete using (public.is_admin());

-- admins (la lecture est ouverte à tout administrateur, l'écriture est
-- réservée au président)
drop policy if exists "admins_lecture_admin" on public.admins;
create policy "admins_lecture_admin" on public.admins
  for select using (public.is_admin());
drop policy if exists "admins_ecriture_president" on public.admins;
create policy "admins_ecriture_president" on public.admins
  for insert with check (public.is_president());
drop policy if exists "admins_modification_president" on public.admins;
create policy "admins_modification_president" on public.admins
  for update using (public.is_president()) with check (public.is_president());
drop policy if exists "admins_suppression_president" on public.admins;
create policy "admins_suppression_president" on public.admins
  for delete using (public.is_president());

-- private_info / members / resources : réservés aux administrateurs
drop policy if exists "private_info_admin" on public.private_info;
create policy "private_info_admin" on public.private_info
  for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "members_admin" on public.members;
create policy "members_admin" on public.members
  for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists "resources_admin" on public.resources;
create policy "resources_admin" on public.resources
  for all using (public.is_admin()) with check (public.is_admin());


-- ----------------------------------------------------------------------------
-- 4. STOCKAGE DES IMAGES (Supabase Storage)
-- ----------------------------------------------------------------------------
-- Un "bucket" appelé "medias" pour héberger les photos des projets envoyées
-- depuis le tableau de bord. Lecture publique (pour que les visiteurs
-- voient les images), écriture réservée aux administrateurs.

insert into storage.buckets (id, name, public)
values ('medias', 'medias', true)
on conflict (id) do nothing;

drop policy if exists "medias_lecture_publique" on storage.objects;
create policy "medias_lecture_publique" on storage.objects
  for select using (bucket_id = 'medias');
drop policy if exists "medias_ajout_admin" on storage.objects;
create policy "medias_ajout_admin" on storage.objects
  for insert with check (bucket_id = 'medias' and public.is_admin());
drop policy if exists "medias_modification_admin" on storage.objects;
create policy "medias_modification_admin" on storage.objects
  for update using (bucket_id = 'medias' and public.is_admin());
drop policy if exists "medias_suppression_admin" on storage.objects;
create policy "medias_suppression_admin" on storage.objects
  for delete using (bucket_id = 'medias' and public.is_admin());


-- ----------------------------------------------------------------------------
-- 5. DONNEES DE DEPART (à modifier ensuite depuis le tableau de bord)
-- ----------------------------------------------------------------------------
-- Tous les textes ci-dessous sont modifiables ensuite depuis l'onglet
-- "Textes du site" du tableau de bord — ce sont juste des valeurs de départ
-- reprises de la fiche projet du club.

insert into public.site_texts (cle, valeur) values
  ('accueil_eyebrow', 'Club de robotique — Lycée Hoche'),
  ('accueil_titre', 'On construit, on code, on innove. Ensemble.'),
  ('accueil_soustitre', 'Robot''Hoche réunit les élèves de prépa scientifique (et tous les curieux) autour d''un projet par mois : circuits, capteurs, robots, du brainstorming jusqu''au prototype qui fonctionne.'),
  ('presentation_intro', 'Robot''Hoche est un club de robotique qui se réunit une fois par semaine (parfois deux, selon l''affluence). Chaque séance avance sur un projet annuel — dans l''idéal une participation à la Coupe de France de robotique — ou, à défaut, sur des projets mensuels utiles au lycée : des poubelles équipées de capteurs, des petits objets pratiques pour les élèves, ou encore des créations qui suscitent l''émerveillement lors des journées portes ouvertes.

Le club est présidé et adopte, dès à présent, une véritable démarche d''ingénieur : on applique et on prolonge ce qui est vu en cours, en construisant des circuits électriques et des robots utiles qui répondent à de vraies problématiques du lycée.'),
  ('presentation_pour_qui', 'Le club s''adresse en priorité aux élèves de CPGE scientifique (MPSI, PSI, PC, MP/MPI, MP2I), mais tout le monde est le bienvenu, y compris les débutants complets — y compris des élèves de NSI motivés qui veulent apporter leur pierre à l''édifice. La seule chose qui compte : venir régulièrement et participer à la dynamique du groupe.'),
  ('presentation_valeurs', 'Innover et créer des objets utiles, pas seulement des démonstrations
Apprendre en faisant : la démarche d''ingénieur appliquée dès la prépa
Progresser chaque semaine, à son rythme, débutant ou non
Se tester en compétition, sans que ce soit une obligation
Faire émerger les talents du lycée (notamment en MP2I) de façon simple et ludique'),
  ('presentation_objectifs', 'Réaliser 8 projets sur l''année, soit environ un projet par mois, de difficulté croissante
Participer à un concours de robotique
Faire venir au moins un intervenant extérieur par semestre
Participer aux Journées Portes Ouvertes du lycée
Avoir au moins un projet fonctionnel et utile au lycée d''ici la fin du premier semestre'),
  ('presentation_organisation', 'Le président du club anime les séances, fait le lien avec l''administration du lycée et s''occupe des inscriptions aux concours. D''autres membres prennent en charge la communication : site, réseaux sociaux, affiches. Les besoins exprimés par l''administration ou les autres clubs du lycée remontent ensuite jusqu''au club, pour que les projets répondent aussi à l''intérêt du lycée.'),
  ('presentation_partenaires', 'En interne, un professeur de Sciences de l''Ingénieur ou d''informatique peut jouer un rôle de référent : conseils ponctuels, retours sur la faisabilité d''un projet, sans que cela devienne une charge régulière.

En externe, le club cherche à faire intervenir d''anciens élèves du lycée (via l''association des Alumni), des étudiants ou docteurs impliqués dans la Coupe de France de robotique (par exemple à l''UVSQ), des responsables de fablab ou des ingénieurs spécialisés en systèmes embarqués.'),
  ('seances_intro', 'Le club se réunit une à deux fois par semaine selon l''affluence, pour une séance d''environ une heure. Le jour et l''horaire précis seront annoncés directement aux inscrits et sur Instagram dès qu''ils seront fixés.'),
  ('seances_evaluation', 'Chaque séance et chaque projet sont évalués simplement : retours oraux des élèves, questionnaires de satisfaction ponctuels, et un tableau de bord qui suit deux grandes familles d''indicateurs — l''avancée des projets (réalisation, concours, médiatisation, respect des délais) et la vie du club (présence, régularité, ambiance, satisfaction des inscrits).'),
  ('projets_intro', 'Ici, chaque projet a droit à un vrai suivi : le besoin de départ, les choix techniques, les étapes de conception, et le résultat final — de quoi comprendre comment on est passé de l''idée au prototype qui fonctionne. Le compte Instagram du club (@robot.hoche) reste le meilleur endroit pour suivre l''avancement au jour le jour.'),
  ('calendrier_intro', 'Concours, journées portes ouvertes, interventions extérieures, temps forts du club : retrouvez ici tout ce qui est déjà prévu.'),
  ('inscription_intro', 'Aucune expérience n''est requise, seulement l''envie de venir régulièrement. Écris-nous par e-mail ou passe par Instagram, on te répondra avec les prochaines infos pratiques (jour, horaire, salle).'),
  ('inscription_email', 'robot.hoche@gmail.com'),
  ('inscription_instagram', '@robot.hoche'),
  ('footer_texte', 'Robot''Hoche — club de robotique du Lycée Hoche.')
on conflict (cle) do nothing;

insert into public.private_info (cle, valeur) values
  ('telephone_president', ''),
  ('notes_internes', 'Espace libre pour toutes les notes internes du bureau (mots de passe de matériel, idées en cours, contacts en attente de réponse...).')
on conflict (cle) do nothing;

-- Un projet et un événement "exemple", pour voir immédiatement le rendu du
-- site. A modifier ou supprimer librement depuis le tableau de bord.
-- (le "where not exists" évite de recréer l'exemple à chaque exécution du
-- script, et n'ajoute rien si des projets/événements existent déjà)
insert into public.projects (titre, resume, description, statut, ordre)
select
  'Exemple à modifier ou supprimer',
  'Ceci est un projet de démonstration : modifie-le ou supprime-le depuis l''onglet "Projets" du tableau de bord.',
  'Décris ici le besoin de départ, les choix techniques, les étapes de conception et le résultat final de ton premier vrai projet.',
  'Idée',
  0
where not exists (select 1 from public.projects);

insert into public.events (titre, description, date_evenement, heure, lieu)
select
  'Exemple à modifier ou supprimer',
  'Ceci est un événement de démonstration, modifiable depuis l''onglet "Calendrier" du tableau de bord.',
  current_date + interval '14 days',
  '17h30',
  'À préciser'
where not exists (select 1 from public.events);

-- ============================================================================
-- FIN DU SCRIPT
-- ----------------------------------------------------------------------------
-- Prochaine étape : crée ton propre compte administrateur !
-- 1. Supabase > Authentication > Users > "Add user" : crée un compte avec
--    ton email et un mot de passe (c'est cet email/mot de passe qui te
--    servira à te connecter sur /admin/login.html).
-- 2. Reviens dans SQL Editor et exécute la ligne suivante en remplaçant
--    l'adresse par la tienne, pour te déclarer "président" (accès total) :
--
--    select public.admin_add_by_email('ton-adresse@email.com', 'president');
--
-- Tu peux ensuite gérer tous les autres accès directement depuis l'onglet
-- "Gérer les accès" du tableau de bord — plus besoin de revenir ici.
-- ============================================================================
