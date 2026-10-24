# Coque des jeux du Bunker (brouillon)

Copie de travail du skill `store-jeu-bunker` (HiveSkills), pour la peaufiner ici avant de la remettre dans le skill.

Page à ouvrir : https://hive-67.github.io/Brouillon/coque-jeu/

- `index.html` : la coque vide, un seul fichier. Seuil, accueil, partie, fin, Comment jouer, Classement, tiroirs Pause, Réglages (5 sections), Installer, Discord, À propos, Duel, Confirmation.
- `lanceur/` : le seuil et le lanceur du Bunker, repris de Rancune (HiveTools, branche `jeux/uno-maison`) sans rien changer : `lanceur.css`, `bornes-seuil.js`, `arcade-lanceur.js`.
- On ne remplit que le bloc `APP` et `CHANGELOG` en bas de `index.html`, plus `--jeu` et `--sur-jeu` en haut.

## Ce qui manque ici (fichiers que cet outil ne sait pas envoyer)

Dans `assets/img/` (à créer à côté de `index.html`) :
- `logo-bunker.webp` : le logo du lanceur.
- `duel-ordi.webp` et `duel-pote.webp` : les deux têtes du bouton Duel.

Pour le bruit d'ouverture : `terminal-ouverture.m4a`, plus le moteur de son `son.js` de `sons-bunker`. Sans eux, le lanceur marche en silence.

Sans le logo, la séquence attend au plus 1,2 seconde, puis continue sans lui.

## Règle

Ce dossier est un brouillon : les règles de la coque restent dans `SKILL.md` de HiveSkills. Ce qui est validé ici se recopie dans le skill (`modele.html`), pas l'inverse.
