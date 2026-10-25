# Coque des jeux du Bunker (brouillon)

Copie de travail du skill `store-jeu-bunker` (HiveSkills), pour la peaufiner ici avant de la remettre dans le skill.

Page à ouvrir : https://hive-67.github.io/Brouillon/coque-jeu/

- `index.html` : la coque vide, un seul fichier. Seuil, accueil, partie, fin, Comment jouer, Classement, tiroirs Pause, Réglages (5 sections), Installer, Discord, À propos, Duel, Confirmation.
- `lanceur/` : le seuil et le lanceur du Bunker, repris de Rancune (HiveTools, branche `jeux/uno-maison`) sans rien changer : `lanceur.css`, `bornes-seuil.js`, `arcade-lanceur.js`.
- On ne remplit que le bloc `APP` et `CHANGELOG` en bas de `index.html`, plus `--jeu` et `--sur-jeu` en haut.

## Les fichiers de `assets/` (copiés tels quels le 25/10/2026)

- `assets/img/logo-bunker.webp`, `duel-ordi.webp`, `duel-pote.webp` : depuis HiveSkills, `skills/store-jeu-bunker/`.
- `assets/son/terminal-ouverture.m4a` : depuis Rancune (HiveTools, branche `jeux/uno-maison`).
- `assets/js/son.js` : depuis HiveSkills, `skills/sons-bunker/`. Chargé avant le lanceur : c'est lui qui joue le bruit d'ouverture.

## Le rond du joueur (25/10/2026)

- La poignée de main du Bunker est reprise de Rancune (lot 18) : dans le Store du Bunker, le rond prend la photo Discord du joueur (ou son initiale), et le pseudo remplit le Profil des réglages. Ouverte ici, sur github.io, la page reste en « pas connecté ».
- Dans le coin du rond, la pastille du Bunker comme sur BunkerWeb (lots 394, 395) : en couleur et cerclée d'orange pour un membre, grise sinon, absente quand il n'est pas connecté. Elle remplace la petite marque Discord prévue par le skill : décision de Hive du 25/10/2026, à recopier dans `SKILL.md` avec la coque.

## Règle

Ce dossier est un brouillon : les règles de la coque restent dans `SKILL.md` de HiveSkills. Ce qui est validé ici se recopie dans le skill (`modele.html`), pas l'inverse.
