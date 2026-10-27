# Brouillon — règles

Ce dépôt a trois zones. Elles ne se mélangent jamais.

## La racine : le brouillon
C'est le bac d'essai. Chaque nouvel essai écrase le précédent, on s'en fiche.
Adresse : https://hive-67.github.io/Brouillon/

## `store/` : NolanGame
Le store de jeux (PWA installable sur mobile et tablette 10 pouces).
Adresse : https://hive-67.github.io/Brouillon/store/

- **Intouchable pendant les essais.** Quand on nettoie ou qu'on écrase la racine, on ne supprime, ne vide et ne déplace jamais `store/`.
- On n'y touche que si Hive parle du store ou de NolanGame.
- Le détail est dans `store/CLAUDE.md`.
- GitHub Pages ne sert que `main` : le store vit donc dans `main`, dossier `store/`. La branche `store` est vide de contenu utile, on ne s'en sert pas.

## `presentation-hive/` : le site de présentation de Hive
La page qui présente Hive à ses futurs clients (commerces, assos, communautés).
Adresse : https://hive-67.github.io/Brouillon/presentation-hive/

- **Intouchable pendant les essais**, comme `store/`. Quand on nettoie ou qu'on écrase la racine, on ne supprime, ne vide et ne déplace jamais `presentation-hive/`.
- On n'y touche que si Hive parle de sa page de présentation.
- Il vit dans `main`, comme le store (GitHub Pages ne sert que `main`).
