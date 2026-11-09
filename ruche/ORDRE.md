⏳ À faire

# Ordre : la version et le numéro de lot, toujours visibles en haut à gauche

Demande de Hive, 09/11/2026, posée par l'Exécutant de la Ruche (règles version 55, `regles-communes.md` section 7). Zone : `ruche/` du Brouillon (hors système : seul `CLAUDE.md` du Brouillon fait foi). Ce texte remplace celui posé le matin du 09/11 : si c'est déjà là, on ne change rien. L'ordre précédent de la page (fait, ✅) reste dans l'historique Git (commit `27cd5c4`) : tout ce qu'il a fait sur la page reste tel quel.

OBJECTIF : la page de la Ruche affiche son numéro de lot en petit, en haut à gauche, sans rien changer d'autre.

## ON FAIT

1. **Regarde si `ruche/index.html` affiche déjà une version ou un lot** en haut à gauche. Vu par l'Exécutant de la Ruche le 09/11 : rien.
2. **Si oui : ne change rien.** Conclus par une ligne : « déjà en règle ».
3. **Si non** : un élément `data-ruche-version`, en petit, en haut à gauche contre le logo. La page n'a ni version ni lot : on commence à `lot 1`, et chaque changement de la page monte de 1. Un toucher ouvre les dix derniers changements de la page (`git log -- ruche/`), une ligne chacun, en mots simples. Contrôle : `modeles/outils/verifier.js` de `Hive-67/LaRuche` (branche `v5`), lancé depuis `ruche/` sans être copié : aucune anomalie de version.

## ON NE TOUCHE PAS

Le reste de la page (design, textes), les autres zones (`store/`, `presentation-hive/`, la racine).

## FICHIERS TOUCHÉS

`ruche/index.html`, seulement dans le cas « si non », et cet ordre.

## PREUVE ATTENDUE

- « déjà en règle », ou `lot 1` en haut à gauche de https://hive-67.github.io/Brouillon/ruche/, un toucher ouvre le journal.
