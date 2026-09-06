/* ============================================================================
   CONFIGURATION SUPABASE
   ----------------------------------------------------------------------------
   >>> C'EST LE FICHIER LE PLUS IMPORTANT A MODIFIER LORS DE LA MISE EN LIGNE <<<

   Le site a besoin de deux informations pour se connecter à ta base de
   données Supabase (voir le guide GUIDE_DEPLOIEMENT.md, étape "Créer le
   projet Supabase") :

     1. SUPABASE_URL   -> l'URL de ton projet, du type
                           "https://xxxxxxxxxxxx.supabase.co"
     2. SUPABASE_KEY    -> la clé publique "publishable" (ou "anon") de ton
                           projet. Cette clé est publique et peut sans
                           problème apparaître dans le code du site : la
                           sécurité réelle est assurée par les règles RLS
                           définies dans supabase/schema.sql (personne ne peut
                           lire ou écrire ce qui n'est pas autorisé, même en
                           lisant cette clé).

   Où trouver ces informations dans Supabase :
     Dashboard du projet > Project Settings (roue crantée) > API Keys
     - "Project URL"            -> SUPABASE_URL
     - "Publishable key" (ou à défaut "anon public") -> SUPABASE_KEY

   Tant que tu n'as pas renseigné ces valeurs, le site s'affiche mais les
   parties dynamiques (projets, calendrier, connexion...) ne fonctionnent
   pas encore.
   ========================================================================= */

const SUPABASE_URL = "https://dzevklrfkfhhyrojfhda.supabase.co";
const SUPABASE_KEY = "sb_publishable_hWTxCNCS9INhjYXCan1xiw_d5XnhRnN";
