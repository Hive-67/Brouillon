# Ordre : le site de présentation de Hive (direction « Atelier de nuit »)

Statut : ⏳ en attente du GO de Hive
Date : 2026-10-25
De : Cerveau central (CC)
Pour : Exécutant Brouillon

Ce fichier est dans un dépôt PUBLIC. Quand le site est livré, supprime-le dans un dernier commit (« Ordre terminé, fichier retiré »).

## Avant tout

1. Lis le CLAUDE.md du dépôt Brouillon (branche `main`) et suis ses règles. En résumé : la racine est le bac d'essai, `store/` est intouchable, GitHub Pages ne sert que `main`.
2. Le Brouillon est PUBLIC. Rien de privé n'y entre : pas de mail ni de lien Discord sauf ceux que Hive a donnés pour la page, rien sur sa vie perso, pas de lien vers un dépôt privé, pas de capture avec des données perso.
3. Travaille dans `presentation-hive/`. Adresse : https://hive-67.github.io/Brouillon/presentation-hive/

## Objectif

Construire LE site de présentation de Hive, complet, nickel, en une seule passe (« one shot »). Pas une maquette : la vraie page, avec beaucoup de motion design, qui présente Hive au mieux et donne envie de le contacter.

Base de départ : `presentation-hive/atelier.html` (la direction que Hive a choisie, il l'aime). On garde son identité : fond noir froid `#06080b`, un seul accent vert acide `#b8ff3d`, hexagones sur canvas qui s'allument sous le doigt, lettres de « Hive. » qui montent, trait lumineux, deux portes.
Les deux autres maquettes (`ruche.html`, `plan.html`) et le sélecteur (`index.html` actuel) sont jetés : quand le nouveau site est en place, `index.html` devient le site lui-même, et tu supprimes les deux maquettes écartées (dis-le dans le message de commit). Si tu trouves à la racine du Brouillon un ancien premier essai de « page de contact Hive » (trois réalisations + bouton de contact), il est remplacé par ce site : ne le réutilise pas, jette-le s'il est clairement identifié, sinon signale-le dans ton compte rendu.

## Qui est Hive, comment on le présente

- Pseudo : Hive. Pas de visage, pas de photo, pas de vrai nom.
- Autodidacte, sans diplôme. On n'en fait ni un secret ni un complexe : on le retourne en force par les preuves. Phrase pivot : « Je ne montre pas un diplôme, je montre ce qui tourne. »
- Offre en une phrase (le haut de la page, pour tout le monde) : « Je fabrique des outils numériques sur mesure. »
- Ce qu'il sait faire (liste de Hive, ne rien ajouter) : sites internet, logiciels, micrologiciels, mini-jeux, motion design, création et gestion de serveurs Discord et de bots Discord.
- Pas de « je sais tout faire » en gros titre, pas de « expert », pas de « X ans d'expérience ».

## Deux publics, deux portes (décidé)

Même haut de page pour tout le monde, puis deux portes qui mènent chacune à sa section (`#commerce` et `#communaute`), avec ses propres réalisations, sa propre phrase, son propre contact principal.

- Porte 1 : « Je tiens un commerce ou une asso ». Petits pros locaux. Un site, un outil sur mesure, un petit logiciel. Contact principal : le mail. Ton : vouvoiement, rassurant, concret.
- Porte 2 : « J'ai une communauté ou je crée du contenu ». Serveur Discord, bots, jeux, vidéo motion design. Contact principal : le lien Discord. Ton : tutoiement, direct, complice.
- En bas de page, les deux contacts (mail et Discord) sont visibles pour tout le monde.

## Prix (décidé par Hive)

Aucun prix affiché, nulle part. On écrit « devis gratuit ». Ne promets aucun délai de réponse (« sous 24 h » est interdit : Hive ne l'a pas dit).

## Contact

Deux constantes en tête du script : `CONTACT_MAIL` et `CONTACT_DISCORD`. Hive les donne dans le message qui accompagne le GO. S'il ne les a pas données, laisse un emplacement clairement marqué (le bouton affiche « bientôt » et ne mène nulle part), ne les invente jamais, et demande-les-lui dans ton compte rendu.
Le mail s'assemble en JavaScript au clic (pas d'adresse en clair dans le HTML), pour limiter le spam sur un dépôt public.

## Les réalisations : tu choisis, sur preuves

Hive te laisse regarder tout ce qu'il a et piocher au mieux. Lecture seule sur ses autres dépôts du compte Hive-67. Le Drive : on n'y lit rien.
Maximum 3 réalisations par porte. Pistes (à vérifier, tu peux en préférer d'autres) :

- Porte 1 : les maquettes par métier et les outils de HiveTools (hivetools.netlify.app : Cabas, Budget, maquettes client par métier), un exemple de site vitrine.
- Porte 2 : Le Bunker (le Discord, ses bots dont le bot Steam), les jeux du Bunker (Rancune, PokeBunker, PONT, Tetris, le store de jeux), la vidéo motion design du Bunker.

Règles de preuve :
- Un lien n'est mis que s'il est en ligne : vérifie qu'il répond avant de le poser. Pas de lien mort.
- Le site du Bunker et l'Arsenal ne sont pas publiés : montre-les par une courte animation ou une capture propre faite en local, jamais par un lien.
- Chaque réalisation a une mini-animation en boucle (CSS, SVG ou canvas, légère) qui montre la chose en action, pas une simple image.
- Seul chiffre autorisé : « plus de 600 membres » pour le Bunker. N'écris aucun autre chiffre ni date.
- Rien d'inventé : pas de client fictif, pas de témoignage, pas de faux logo, pas de statistique.

## Les textes : accrocheurs, qui donnent envie d'écrire

Écris tous les textes en français, courts, percutants, sans jargon, aucun tiret long. Voici le ton et des pistes de départ, à améliorer si tu fais mieux, sans promettre ce qui n'est pas vrai :

- Haut de page : « Je fabrique des outils numériques sur mesure. » puis « Ce que tu imagines, je le construis. Pour de vrai. »
- Preuves : « Je ne montre pas un diplôme. Je montre ce qui tourne. »
- Porte 1 : « Votre activité mérite mieux qu'un site de modèle. » puis « Un site qui vous ressemble, un outil qui vous fait gagner du temps. Devis gratuit. » Bouton : « Parlons de votre projet ».
- Porte 2 : « Ta communauté mérite mieux que les réglages par défaut. » puis « Serveur, bots, jeux, vidéo : je construis ce qui fait revenir les gens. » Bouton : « Raconte-moi ton projet ».
- Bas de page : « Une idée ? Écris-moi. Le devis est gratuit. »

## Motion design : beaucoup, mais propre

Hive veut beaucoup de motion design. Un mouvement net et fluide vaut mieux que dix effets moyens. Au minimum :
- Le haut de page de `atelier.html`, conservé et peaufiné.
- Apparitions au défilement (IntersectionObserver), enchaînées, jamais toutes en même temps.
- Transition des portes : choisir une porte déclenche un balayage d'hexagones vers sa section.
- Mini-animations en boucle dans les cartes de réalisations.
- Boutons qui réagissent au doigt et au curseur (effet magnétique léger), lueur verte qui suit le doigt.
- Un fil conducteur : les hexagones (Hive, la ruche) se retrouvent d'une section à l'autre.

Contraintes techniques :
- HTML, CSS et JavaScript purs, sans build, sans bibliothèque ni CDN, sans police externe (police système).
- Mobile d'abord, iPad inclus. 60 images par seconde visées sur iPhone et iPad : canvas limité à 2x de résolution, animations coupées hors écran et quand la page est cachée.
- `prefers-reduced-motion` respecté : tout reste lisible et complet sans mouvement.
- Accessibilité : contrastes suffisants, focus visible, textes alternatifs, `lang="fr"`.
- `<title>`, meta description, balises Open Graph, favicon hexagone en SVG intégré.
- Une seule page, pas de défilement horizontal à aucune largeur.
- Images légères (webp), poids total raisonnable.

## Déroulé

1. Lis le CLAUDE.md du Brouillon. 2. Parcours les dépôts de Hive en lecture seule, choisis les réalisations. 3. Construis le site. 4. Teste à 390, 820 et 1440 px de large (captures avec un navigateur sans écran si disponible), vérifie l'absence de défilement horizontal et d'erreur dans la console. 5. Commits par étape en français, sans tiret long, `git push origin main`. 6. Vérifie que l'adresse Pages répond après publication. 7. Retire ce fichier d'ordre.

## Compte rendu

Court, en français simple : l'adresse, ce qui est fait, ce qui bloque, ce que Hive doit fournir ou trancher (mail, lien Discord s'ils manquent, réalisations que tu n'as pas pu montrer et pourquoi).
