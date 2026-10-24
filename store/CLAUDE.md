# NolanGame — le store de jeux

Store façon App Store / Google Play, pour mobile et tablette 10 pouces. PWA : s'installe sur l'écran d'accueil.
Adresse : https://hive-67.github.io/Brouillon/store/

## Fichiers
- `index.html` : tout le store (style, liste des jeux, jaquettes de secours).
- `manifest.webmanifest`, `sw.js`, `icon.svg` : l'installation et le mode hors ligne du store.

## Les images
Les vraies images des jeux ne sont pas copiées ici : le store les charge depuis l'aperçu de chaque jeu
(`https://jeux-<id>--hiveostools.netlify.app/jeux/<id>/<fichier>`).
Dans la liste `G` de `index.html` : `icon` = l'icône du jeu (de préférence son `icone-180.png`), `hero` = une image large pour « À la une ».
Si un jeu n'a pas d'image, ou si elle ne charge pas, le store montre une jaquette dessinée (`ART`).

## Ajouter ou changer un jeu
1. Dans `index.html`, ajouter une ligne dans la liste `G` (id, nom, sous-titre, catégorie, deux couleurs, `icon` si le jeu a une image).
2. Ajouter son dessin de secours dans `ART` (même id).
3. Dans `sw.js`, changer le numéro de `nolangame-vN` pour que les téléphones prennent la nouvelle version.

## Lien de lancement
Chaque jeu s'ouvre sur son aperçu de branche (jamais le lien de publication) :
`https://jeux-<id>--hiveostools.netlify.app/jeux/<id>/`
La liste des jeux et leurs liens vient de `ETAT.md` (branche `hub` du dépôt HiveTools).

## Règle
Ne jamais supprimer ni écraser ce dossier quand on travaille sur la racine du Brouillon.
