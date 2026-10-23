# Banc d'essai du build rapide

Page de test : https://hive-67.github.io/Brouillon/ . On y travaille le visuel, puis on envoie à l'Exécutant ce qui est validé.
Rien ne se clique ici (c'est du visuel).

- **En haut, 3 variantes** du nouveau design à comparer (touches 1, 2, 3) : **Bunker**, **Verre calme**, **HUD**. Le choix se garde dans l'adresse (`?v=2`).
- **La pastille de couleur** choisit la doctrine simulée (ou « Sans doctrine »), ou l'**ancien look** (Glace, Braise, Toxique, Vide, Arctique, Contraste, gardés tels quels).
- `+rempli` à la fin de l'adresse pose des pastilles de démo (`/Brouillon/?v=1#solaire+rempli`) ; `+long` teste des noms très longs.

## Les fichiers

- `base.css` : la **mise en page** commune (colonne, tailles, grilles). C'est elle qui rend les cases faciles à toucher.
- `v-bunker.css`, `v-verre.css`, `v-hud.css` : les **trois directions** (matière, polices, couleurs d'accent). Une seule sera gardée.
- `nouveau.js` : le **modèle de HTML** du nouveau build rapide, pour l'Exécutant.
- `themes.css` : les couleurs par doctrine, **copiées de l'Arsenal**, plus un « sombre doux » sans doctrine.
- `ancien.css`, `rapide.css`, `rapide-page.js` : l'ancien look, gardé pour comparer.
- `picker.css`, `themes.js` : le banc d'essai (variantes, doctrine simulée, plein écran, démo). **N'existent pas dans l'Arsenal.**
- `socle.css`, `icones.js`, `logo.js` : les variables du site, les icônes des statistiques, le logo.

## Ce qu'il faudra demander à l'Exécutant (quand Hive a choisi une variante)

1. **Le thème par doctrine existe déjà.** L'Arsenal pose `document.body.dataset.element = DOCTRINES[id].adj` et change `--solaire`, `--solaire-clair`, `--solaire-sombre`, `--fond-page` (`site/index.html`, blocs `body[data-element=…]`). Le nouveau design lit ces mêmes variables : **il n'y a rien à brancher en JavaScript.**
   Le seul ajout : le bloc « sans doctrine » de `themes.css` (`html:not([data-look="ancien"]) body:not([data-element])`), à limiter au build rapide (par exemple avec la classe `rapide-ouvert` du `body`), pour ne pas changer le reste de l'Arsenal.
2. **La mise en page en colonne** à la place de la table de positions en pourcentages : mêmes boutons, mêmes `data-rp`, `data-c-case`, `data-c-niveau`, `data-c-nom`, `data-c="enregistrer"`, `data-c="envoyer"`. Seuls les conteneurs et les classes changent (`nv-*`, voir `nouveau.js`).
3. **Les règles de lisibilité** (Apple, Human Interface Guidelines, et les skills `apple-design` et `mobile-native` de HiveSkills) : cibles de toucher de 44 pt au moins, marges de 16, espacements de 8, texte de 15 pt, aide de 13 pt, jamais sous 12 pt, pas de survol collant (`@media (hover: hover)`), retour visuel à l'appui (`scale(.97)`), `prefers-reduced-motion`, `prefers-reduced-transparency`, `prefers-contrast`. Mesuré ici de 360 à 820 pt de large, avec des noms très longs : aucune case sous 44 pt, aucun texte coupé, aucun débordement.
4. **La carte à envoyer (canvas)** doit relire les couleurs de la variante choisie pour rester assortie à l'écran.
5. **Les libellés ajoutés** : « Général », « Ajust. » et « Mods de la pièce » au-dessus des colonnes de l'armure ; le nom de chaque arme sous son emplacement ; « Classe, Saut, Mêlée, Grenade » sous les compétences ; « Retour » ne garde que sa flèche sous 400 pt de large.

Ce changement est visuel : pas de nouvelle fonction. Il touche pourtant le gel de la v1, donc il demande l'accord de Hive.
