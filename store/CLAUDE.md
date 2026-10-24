# NolanGame — le store de jeux

Store façon Google Play / App Store, pour mobile et tablette 10 pouces. PWA : s'installe sur l'écran d'accueil.
Adresse : https://hive-67.github.io/Brouillon/store/

## Fichiers
- `index.html` : tout le store (style, liste des jeux, dessins des jaquettes).
- `manifest.webmanifest`, `sw.js`, `icon.svg` : l'installation et le mode hors ligne du store.

## Ajouter ou changer un jeu
1. Dans `index.html`, ajouter une ligne dans la liste `G` (id, nom, sous-titre, catégorie, deux couleurs).
2. Ajouter son dessin dans `ART` (même id).
3. Dans `sw.js`, changer le numéro de `nolangame-vN` pour que les téléphones prennent la nouvelle version.

## Lien de lancement
Chaque jeu s'ouvre sur son aperçu de branche (jamais le lien de publication) :
`https://jeux-<id>--hiveostools.netlify.app/jeux/<id>/`
La liste des jeux et leurs liens vient de `ETAT.md` (branche `hub` du dépôt HiveTools).

## Règle
Ne jamais supprimer ni écraser ce dossier quand on travaille sur la racine du Brouillon.
