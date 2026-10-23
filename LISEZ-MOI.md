# Banc d'essai du build rapide

Page de test : https://hive-67.github.io/Brouillon/ . On y travaille le visuel, puis on envoie à l'Exécutant ce qui est validé.
Rien ne se clique ici (c'est du visuel). La pastille de couleur, en haut, choisit la doctrine simulée ou l'ancien look. Ajouter `+rempli` à la fin de l'adresse pose des pastilles de démo (exemple : `#solaire+rempli`).

## Les fichiers

- `nouveau.css` et `nouveau.js` : le nouveau design et sa mise en page (colonne). `nouveau.js` est un **modèle de HTML** pour l'Exécutant.
- `themes.css` : les couleurs de chaque doctrine, et le « sombre doux » sans doctrine.
- `ancien.css`, `rapide.css`, `rapide-page.js` : l'ancien look et ses variantes (Glace, Braise, Toxique, Vide, Arctique, Contraste), gardés tels quels pour comparer.
- `themes.js` : le banc d'essai (pastille, plein écran, démo). **N'existe pas dans l'Arsenal.**
- `socle.css`, `icones.js`, `logo.js` : les variables du site, les icônes des statistiques, le logo.

## Ce qu'il faudra demander à l'Exécutant (quand Hive valide)

1. **Le thème suit la doctrine.** À chaque changement de doctrine du build rapide : `document.documentElement.dataset.element = DOCTRINES[id].adj`.
   Les valeurs sont déjà dans le code : `solaire`, `cryo-électrique`, `abyssal`, `stasique`, `filobscur`, `prismatique`. Sans doctrine : `neutre`.
   Tout le reste se fait en CSS (`themes.css`). Les couleurs passent doucement de l'une à l'autre.
2. **La mise en page en colonne** à la place de la table de positions en pourcentages : mêmes boutons, mêmes `data-rp`, `data-c-case`, `data-c-niveau`, `data-c-nom`, `data-c="enregistrer"`, `data-c="envoyer"`. Seuls les conteneurs et les classes changent (`nv-*`).
3. **Les règles de lisibilité** (Apple, Human Interface Guidelines) : cibles de toucher de 44 pt au moins, marges de 16, espacements de 8, textes de 15 à 17 pt pour ce qui se lit, 13 pt pour l'aide, jamais sous 12 pt, interligne de 1,3 à 1,4, pas de texte en capitales, contraste du texte d'au moins 4,5 pour 1. Mesuré ici de 360 à 820 pt de large : aucune case sous 44 pt, aucun texte coupé.
4. **La carte à envoyer (canvas)** doit relire les couleurs (`--f-a`, `--f-b`, `--f-fond`, `--f-neb`, `--f-or`) pour rester assortie à l'écran.
5. **Les libellés ajoutés** : « Général », « Ajust. » et « Mods de la pièce » au-dessus des colonnes de l'armure ; « Classe, Saut, Mêlée, Grenade » sous les compétences ; « Aspect 1, 2 ».

Ce changement est visuel : pas de nouvelle fonction. Il touche pourtant le gel de la v1, donc il demande l'accord de Hive.
