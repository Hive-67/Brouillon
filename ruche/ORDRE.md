⏳ À faire

# Ordre : la version et le numéro de lot, toujours visibles en haut à gauche

Demande de Hive, 09/11/2026, posée par l'Exécutant de la Ruche (LaRuche, règles version 54, `regles-communes.md` section 7). Zone : `ruche/` du Brouillon (hors système : seul `CLAUDE.md` du Brouillon fait foi). Cet ordre remplace le précédent `ruche/ORDRE.md`, fait (✅), qui reste dans l'historique Git (commit `27cd5c4`).

OBJECTIF : la page de la Ruche affiche son numéro de lot en petit, en haut à gauche, contre le logo, et un toucher ouvre son journal des mises à jour.

## ON FAIT

1. **L'étiquette** sur `ruche/index.html` : un élément qui porte l'attribut `data-ruche-version`, en petit, en haut à gauche, contre le logo. La page n'a ni version ni lot : on commence à `lot 1` avec ce travail, et chaque changement de la page monte de 1. Elle reste visible quand l'en-tête se cache.
2. **Le journal des mises à jour** : un toucher sur l'étiquette l'ouvre : les dix derniers changements de la page (`git log -- ruche/`), une ligne chacun, en mots simples, écrite pour Hive.
3. **Le contrôle** : `modeles/outils/verifier.js` de `Hive-67/LaRuche` (branche `v5`), lancé depuis `ruche/` sans être copié dans le Brouillon : aucune anomalie « version visible absente » ni « version mal écrite ».

## ON NE TOUCHE PAS

Le reste de la page (design, textes), les autres zones (`store/`, `presentation-hive/`, la racine).

## FICHIERS TOUCHÉS

`ruche/index.html`, cet ordre.

## PREUVE ATTENDUE

- `lot 1` en haut à gauche de https://hive-67.github.io/Brouillon/ruche/ ; un toucher ouvre le journal.
- Le contrôle sans anomalie de version.
