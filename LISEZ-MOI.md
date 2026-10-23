# Banc d'essai du build rapide

Page de test : https://hive-67.github.io/Brouillon/ . On y travaille le visuel, puis on envoie à l'Exécutant ce qui est validé.
Rien ne se clique ici (c'est du visuel).

- **En haut, 3 variantes** du nouveau design à comparer (touches 1, 2, 3) : **Arsenal** (le langage du site lui-même), **Verre calme** (la retenue d'Apple), **HUD** (traits nets, coins coupés). Le choix se garde dans l'adresse (`?v=2`).
- **La pastille de couleur** choisit la doctrine simulée (ou « Sans doctrine »), ou l'**ancien look** (Glace, Braise, Toxique, Vide, Arctique, Contraste, gardés tels quels).
- `+rempli` à la fin de l'adresse pose des pastilles de démo (`/Brouillon/?v=1#solaire+rempli`) ; `+long` teste des noms très longs.

## Les fichiers

- `base.css` : la **mise en page** commune, **compacte** (colonne, tailles, grilles). Ce qu'on voit est petit ; chaque case garde une zone de toucher de 44 pt, invisible.
- `v-arsenal.css`, `v-verre.css`, `v-hud.css` : les **trois directions** (matière, polices, couleurs d'accent). Une seule sera gardée.
- `themes.css` : **un seul thème par doctrine**, travaillé en profondeur (voir plus bas), plus un « sombre doux » sans doctrine.
- `nouveau.js` : le **modèle de HTML** du nouveau build rapide, pour l'Exécutant.
- `ancien.css`, `rapide.css`, `rapide-page.js` : l'ancien look, gardé pour comparer.
- `picker.css`, `themes.js` : le banc d'essai (variantes, doctrine simulée, plein écran, démo). **N'existent pas dans l'Arsenal.**
- `socle.css`, `icones.js`, `logo.js` : les variables du site, les icônes des statistiques, le logo.

## Les thèmes par doctrine (themes.css)

Un seul thème par doctrine : solaire (braise), cryo-électrique (bleu-vert profond), abyssal (violet), stase (indigo), filobscur (vert forêt), prismatique (violet et cyan). Plus « Obsidienne » (graphite chaud) quand aucune doctrine n'est choisie.
Ce qui donne la profondeur, et qui est nouveau :
- un **fond de couleur riche** (un ton bijou très sombre, pas un gris) ;
- `--p-haut` : la lumière du haut de l'écran ; `--p-bas` : l'ombre du bas ; `--p-lueur` : une deuxième lueur, d'une autre teinte, en bas à droite ;
- des **accents un peu moins vifs** : la couleur vit dans l'ambiance, pas dans de grands aplats criards ;
- un voile sombre sur les bords, des cartes teintées avec un trait de lumière en haut.

## Ce qu'il faudra demander à l'Exécutant (quand Hive a choisi une variante)

1. **Le thème par doctrine existe déjà.** L'Arsenal pose `document.body.dataset.element = DOCTRINES[id].adj` : **il n'y a rien à brancher en JavaScript.**
   Il faut **remplacer** les blocs `body[data-element=…]` de `site/index.html` par ceux de `themes.css` (du CSS seulement ; mêmes noms de variables, plus `--p-haut`, `--p-bas`, `--p-lueur`). Attention : ces variables servent aussi au reste de l'Arsenal et à l'ancien build rapide. Les nouvelles couleurs les changent donc partout : **accord de Hive nécessaire**, ou alors les limiter au build rapide avec la classe `rapide-ouvert` du `body`.
   Le bloc « sans doctrine » (`html:not([data-look="ancien"]) body:not([data-element])`) est à limiter au build rapide de la même façon.
2. **La mise en page en colonne** à la place de la table de positions en pourcentages : mêmes boutons, mêmes `data-rp`, `data-c-case`, `data-c-niveau`, `data-c-nom`, `data-c="enregistrer"`, `data-c="envoyer"`. Seuls les conteneurs et les classes changent (`nv-*`, voir `nouveau.js`).
3. **La taille** : Hive la veut petite. Les boutons font 38 à 40 pt, les cases 34 à 54 pt, le texte 14 pt (aide 12 pt, jamais sous 11 pt). La **zone de toucher de 44 pt** (règle d'Apple) est gardée par un `::after` invisible autour de chaque case et de chaque bouton : il ne faut pas la supprimer en simplifiant le CSS, ni mettre `overflow: hidden` sur ces éléments (ça couperait la zone).
4. **Les bonnes pratiques mobiles** (skills `apple-design` et `mobile-native` de HiveSkills) : pas de survol collant (`@media (hover: hover)`), retour visuel à l'appui (`scale(.97)`), `prefers-reduced-motion`, `prefers-reduced-transparency`, `prefers-contrast`, champs de saisie à 16 px (sinon l'iPhone zoome). Mesuré ici de 360 à 820 pt de large, avec des noms très longs : aucune zone de toucher sous 44 pt, aucun texte coupé, aucun débordement.
5. **La carte à envoyer (canvas)** doit relire les couleurs de la variante et de la doctrine choisies pour rester assortie à l'écran.
6. **Les libellés ajoutés** : « Général », « Ajust. » et « Mods de la pièce » au-dessus des colonnes de l'armure ; le nom de chaque arme sous son emplacement ; « Classe, Saut, Mêlée, Grenade » sous les compétences ; « Retour » ne garde que sa flèche sous 400 pt de large.

Ce changement est visuel : pas de nouvelle fonction. Il touche pourtant le gel de la v1, donc il demande l'accord de Hive.
