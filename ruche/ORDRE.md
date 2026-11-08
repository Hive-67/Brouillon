⏳ À faire

# Ordre : la page Ruche, « Le système Hive » en tête

Demande de Hive, 08/11/2026, avec le CC (LaRuche). La page `ruche/` est à la fois sa page perso et la page de vente de sa formation. Hive l'aime, son style ne change pas. Trois choses changent : le haut de page (la marque d'abord, le produit en étiquette), la fin du format « session de 2 h » avec son prix et ses 6 places (plus d'actualité), et quelques promesses trop fortes à remettre au vrai.

OBJECTIF : en haut de la page, « Le système Hive » en gros plan ; dessous, une étiquette « La Ruche » (le produit, qui est le système) ; puis une phrase qui explique. Plus aucune trace de session de 2 h, de prix ni de places. On ne promet que du réel.

## ON FAIT

### 1. Le haut de page (`ruche/index.html`, section `.heros`)

- **Titre (le `h1`, en gros plan, même taille qu'aujourd'hui) :** « Le système <em>Hive</em> » (« Hive » en vert, comme les mots forts actuels).
- **Étiquette, juste sous le titre :** une pastille « La Ruche » (bord vert fin, coins arrondis, majuscules espacées comme le `kicker` actuel). C'est le nom du produit. Elle remplace la ligne « La Ruche · session de 2 heures » (retirer l'ancien `kicker`).
- **Phrase d'explication, sous la pastille :** « Ton deuxième cerveau, qui construit avec toi. » Puis, plus petit, la ligne qui reprend l'ancien titre : « Tu as une idée de site ou d'appli ? Tu la mets en ligne, sans coder. »
- Les deux boutons du haut : le principal devient « Écris-moi » (au lieu de « Réserver ma place · 199 € ») ; le lien secondaire « Voir comment ça marche » reste.
- Retirer la ligne `.faits-ligne` (« En ligne · 6 places par session. 199 € pour le premier groupe, 299 € ensuite. »).
- Mettre à jour `<title>` : « Le système Hive · La Ruche, ton deuxième cerveau qui construit avec toi » ; `description`, `og:title` et `og:description` dans le même sens (aucune mention de 2 heures, de places ni de prix).

### 2. Retirer le format de 2 h, le prix et les places

- Supprimer la section `#session` (la démo de 20 minutes, l'installation de 1 h 10, le lancement de 30 minutes) et la phrase « Tu reçois un message de préparation avant la session… ».
- Supprimer la section `#prix` en entier (les offres 199 € et 299 €, la phrase sur l'abonnement Claude à la fin de cette section).
- Section finale `#reserver` : le titre « Ta place t'attend. 6 seulement. » devient « Une idée ? <em>Écris-moi.</em> » ; la phrase d'intro devient « Écris-moi par mail, je te réponds. » ; le bouton « Réserver ma place · 199 € » devient « Écris-moi ». Garder l'id `reserver` pour que les liens du haut marchent.
- Le sujet du mail (`mailto`) devient « Le système Hive : la Ruche » (au lieu de « La Ruche : réserver ma place »).
- Barre fixe du bas (`.barre-cta`) : le texte « La Ruche · 2 heures / 199 € le premier groupe » devient « Le système Hive / La Ruche » ; le bouton « Réserver » devient « Écris-moi ».
- FAQ : supprimer la question « Quand a lieu la prochaine session ? ». Dans « Qu'est-ce qu'il me faut ? », remplacer « et 2 heures » par « et une idée de site ou d'appli, même floue » ; dire « un abonnement Claude payant (à ta charge) ».
- Section « Pour qui », la note « Ce qu'il te faut » : retirer « et 2 heures devant toi ».
- Dans les scripts, rien à changer : l'observateur de la barre ignore déjà un id absent. Vérifier qu'aucune erreur n'apparaît dans la console.

### 3. Remettre les promesses au vrai

- « Pas de bugs à chercher » : retirer de la liste des pastilles. Remplacer par « Des essais avant chaque mise en ligne ».
- « Résultat : ce que tu construis fonctionne tout de suite. » : remplacer par « Résultat : tu avances sur du concret, dès le premier jour. » La FAQ « Je peux en faire un business ? » : remplacer « fonctionne tout de suite » par « Ce que tu construis est à toi : tu peux t'en servir, et le vendre si tu veux. »
- Le schéma animé et les phrases qui le décrivent (l'`aria-label`, `.sc-legende`) citent « Sécurité, Design, Ergonomie, Référencement, Mise en ligne », et « tout est pris en charge à ta place ». Avant de garder une étape, la vérifier dans le dépôt LaRuche (branche `v5`, `regles-annexes.md`, la section de l'équipe : testeur, relecteur, designer, sécurité, directeur marketing). Ne garder que ce que la Ruche fait vraiment. S'il n'y a aucun contrôle de référencement ou d'ergonomie, les remplacer par des étapes vraies (par exemple Test, Relecture, Design, Sécurité, Mise en ligne), et écrire « la Ruche s'en occupe avec toi » plutôt que « à ta place ». Dire dans le retour ce qui a été changé et pourquoi.
- Section « Les problèmes » (« Un vrai site, c'est beaucoup de choses : sécurité, design, facilité d'usage, référencement… ») : même vérification, même règle.

### 4. Le dépôt

- Dans `CLAUDE.md` du Brouillon, ajouter une quatrième zone, comme `store/` et `presentation-hive/` : `ruche/`, « la page perso de Hive et la page de vente de la Ruche », adresse https://hive-67.github.io/Brouillon/ruche/, intouchable pendant les essais, on n'y touche que si Hive parle de la Ruche ou de sa page de vente, elle vit dans `main`. Remplacer « Ce dépôt a trois zones » par « quatre zones ».
- Cet ordre (`ruche/ORDRE.md`) passe en `✅ Fait` avec son retour une fois terminé.

## ON NE TOUCHE PAS

Le style (couleurs, polices, fond animé en 3D, apparitions), les preuves, le bloc « Souverain », la structure du schéma animé (seuls ses mots changent si besoin), `store/`, `presentation-hive/`, la racine du Brouillon, l'adresse du mail.

## FICHIERS TOUCHÉS

`ruche/index.html`, `CLAUDE.md`, cet ordre. Rien d'autre dans le Brouillon.

## PREUVE ATTENDUE

- https://hive-67.github.io/Brouillon/ruche/ : en haut, « Le système Hive » en gros, la pastille « La Ruche » dessous, puis « Ton deuxième cerveau, qui construit avec toi. »
- Dans toute la page : aucun « € », aucun « 2 heures » ni « 2 h », aucun « 6 places », « 199 », « 299 », « session », « Réserver ». Le bouton dit « Écris-moi » partout.
- Aucune étape ni promesse que la Ruche ne tient pas ; le retour dit lesquelles ont changé.
- Lisible au téléphone à 390 de large, sans débordement ; `prefers-reduced-motion` toujours respecté ; aucune erreur dans la console ; aucun tiret long dans les textes ajoutés.
- Jugement de Hive : le haut de page, au téléphone. Lui donner le lien de la page.
