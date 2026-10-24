# Coque des jeux du Bunker (brouillon)

Copie de travail du skill `store-jeu-bunker` (HiveSkills), pour la peaufiner ici avant de la remettre dans le skill.

Page à ouvrir : https://hive-67.github.io/Brouillon/coque-jeu/

- `index.html` : la coque vide, un seul fichier. Seuil, accueil, partie, fin, Comment jouer, Classement, tiroirs Pause, Réglages (5 sections), Installer, Discord, À propos, Duel, Confirmation. Copie exacte de `modele.html` du skill au 24/10/2026 (version 2.3 du skill).
- On ne remplit que le bloc `APP` et `CHANGELOG` en bas du fichier, plus `--jeu` et `--sur-jeu` en haut.

## Ce qui manque ici (fichiers binaires, que cet outil ne sait pas envoyer)

- `logo-bunker.webp` : le blason du seuil et la coupure du bouton Duel.
- `duel-ordi.webp` et `duel-pote.webp` : les deux têtes du bouton Duel.

Sans eux, le blason est vide et le bouton Duel garde ses deux couleurs (rouge et bleu) sans les têtes. À déposer à côté de `index.html` depuis `skills/store-jeu-bunker/` de HiveSkills.

## Pas encore ici

Le son : `sons-bunker` (moteur `son.js`, 91 sons) n'est pas branché sur cette coque.

## Règle

Ce dossier est un brouillon : les règles de la coque restent dans `SKILL.md` de HiveSkills. Ce qui est validé ici se recopie dans le skill (`modele.html`), pas l'inverse.
