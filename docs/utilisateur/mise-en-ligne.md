# Le Garde-manger en ligne

**Adresse : https://garde-manger-chi.vercel.app** — la même pour tous les
appareils (PC, iPhone, iPad) et tous les membres du foyer. Les données sont
les mêmes qu'en local : c'est la même base Supabase.

## Installer sur iPhone / iPad (à faire une fois par appareil)

1. Ouvrir **Safari** et aller sur https://garde-manger-chi.vercel.app
2. Se connecter avec son compte (le même qu'aujourd'hui sur le PC).
3. Toucher le bouton **Partager** (le carré avec la flèche vers le haut).
4. Choisir **« Sur l'écran d'accueil »** puis **Ajouter**.
5. L'icône « Garde-manger » apparaît sur l'écran d'accueil : l'app s'ouvre
   en plein écran, comme une application native.

Important : installer sur l'écran d'accueil (et pas seulement mettre en
favori) — c'est ce qui protège les données hors ligne du grand ménage
périodique de Safari.

## Ce qui marche en mobilité

- **Stock, courses, recettes, semaine** : tout, en synchronisation
  immédiate avec les autres appareils.
- **Hors ligne** (cave, marché sans réseau) : consultation des dernières
  données connues, bandeau « consultation seule » ; la reprise est
  automatique au retour du réseau.
- **Saisie vocale** : sur iPhone/iPad, utiliser le **micro du clavier iOS**
  (dictée) dans les champs de saisie — la reconnaissance vocale du bouton
  micro dépend du navigateur et peut être indisponible sur Safari.
- **Photos de recettes** : le bouton « Photo » ouvre directement l'appareil
  photo.

## Publier une mise à jour (PC)

Double-cliquer sur **`app/mettre-en-ligne.cmd`** : construction puis
publication (compte Vercel d'Olivier, connecté une fois pour toutes avec
`npx vercel login`). L'adresse ne change jamais ; les appareils récupèrent
la nouvelle version à l'ouverture suivante.

## Réglages faits le 07/07/2026 (pour mémoire)

- Hébergement : Vercel, projet « garde-manger », offre gratuite, HTTPS.
- Publication SANS build distant : on publie le dossier `dist` construit
  sur le PC (ce qu'on a testé est exactement ce qui part en ligne).
- Supabase → Authentication → URL Configuration : Site URL =
  l'adresse de production ; `http://localhost:5173` autorisé en redirection
  (les emails de confirmation pointent vers la production).
- La clé embarquée dans les pages est la clé **publiable** Supabase : elle
  est faite pour être publique, l'accès aux données reste protégé par les
  règles par foyer (RLS).
