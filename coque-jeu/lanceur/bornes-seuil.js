/* ==========================================================================
   bornes-seuil.js — L'ENTRÉE D'UNE BORNE, LA MÊME POUR TOUTES.

   Hive l'a arrêté au lot 218 : toutes les bornes se lancent de la même façon,
   et aucune autre. On touche la carte, la page du jeu s'ouvre sur une invite,
   le geste fait appelle le logo du Bunker avec son bruitage, puis le jeu.

   CE FICHIER EXISTE PARCE QU'IL Y A DEUX USAGES, pas avant. Le seuil est né
   dans le Tetris au lot 213 ; le Défi en a eu besoin au 218. On ne généralise
   pas au premier usage, on le fait au second.

   --------------------------------------------------------------------------
   CE QU'UNE BORNE FUTURE DOIT POSER, ET RIEN DE PLUS
   --------------------------------------------------------------------------

   Dans sa page, les trois feuilles et les deux scripts du seuil :

     <link rel="stylesheet" href="../../assets/css/tokens.css">
     <link rel="stylesheet" href="../../assets/css/arcade.css">
     <link rel="stylesheet" href="../../assets/css/bornes-seuil.css">
     <link rel="preload" as="image" href="../../assets/img/logo-bunker.webp">
     <script src="../../assets/js/arcade-audio.js"></script>
     <script src="../../assets/js/arcade-lanceur.js"></script>
     <script src="../../assets/js/bornes-seuil.js"></script>

   Puis, au moment de démarrer son jeu :

     BornesSeuil.ouvrir({
       racine: "../../",              où trouver assets/ depuis cette page
       titre: "Tetris",               ce qui s'écrit sous le logo
       image: "affiche.jpg",          L'IMAGE DU SEUIL, facultative
       surEntree: function () { ... } ce qui prend la suite du logo
     });

   `image` est l'adresse telle que la page la demanderait : une borne peut
   donc montrer un fichier de son propre dossier comme un fichier du site.
   Sans elle, le seuil reste noir — c'est la valeur par défaut, pas un défaut.

   `surEntree` est appelée UNE FOIS, au moment où le logo CÈDE LA PLACE : le
   jeu monte dessous pendant que le logo s'efface. Tout ce qui suit — le
   lanceur propre au jeu, ou le jeu lui-même — part de là.

   `surSortie`, facultative, attend que le logo ait VRAIMENT DISPARU. Elle est
   là pour ce qui ne doit pas se poser par-dessus lui : une fenêtre modale, par
   exemple, qui se place au-dessus de tous les plans et passerait donc sur le
   logo en train de partir.

   --------------------------------------------------------------------------
   CE QUI NE CHANGE PAS, ET POURQUOI
   --------------------------------------------------------------------------

   UN LOGO PAR TEMPS, UN SON PAR TEMPS, jamais deux ensemble, jamais d'écran
   noir entre deux. C'est la règle qui a coûté les lots 181 à 195.

   LE GESTE DU SEUIL EST CE QUI AUTORISE LE SON. Aucun navigateur n'en accorde
   à une page qu'on n'a pas touchée, et cette autorisation ne survit pas à un
   rechargement : le seuil se remontre donc à chaque ouverture de page. Ce
   n'est pas un oubli, c'est la seule façon d'entendre le logo à coup sûr.

   LE BRUITAGE EST `terminal-ouverture`, tranché par Hive au lot 218. AUCUNE
   SYNTHÈSE NE LE REMPLACE : on passe par `fichierSeul`, qui rend le silence
   si le navigateur refuse le fichier. Règle du lot 203.
   ========================================================================== */

(function () {
  "use strict";

  var CLASSE = "bornes-seuil";
  var SON = "terminal-ouverture";

  function ouvrir(options) {
    var reglages = options || {};
    var racine = reglages.racine || "";
    var logo = racine + "assets/img/logo-bunker.webp";
    var suite = reglages.surEntree;

    /* LE SEUIL EST DANS LE HTML DE LA PAGE quand elle en a un, et c'est
       préférable : monté au script, le jeu aurait le temps de paraître
       dessous le temps d'une image. Sinon on le pose ici, ce qui reste juste
       pour une page qui n'affiche rien avant d'être montée. */
    var seuil = document.querySelector("." + CLASSE);
    if (!seuil) {
      seuil = document.createElement("div");
      seuil.className = CLASSE;
      document.body.appendChild(seuil);
    }
    /* --- L'IMAGE DU SEUIL, POSÉE AU LOT 241 --------------------------------
       Hive : « cet écran-là, tu le remplaces par l'écran avec la Game Boy »,
       et « tous mes logiciels doivent se lancer de la même manière ». Le
       lanceur qui suit ne change pas d'un pixel : c'est le fond noir, et lui
       seul, qui devient une image.

       ELLE EST DÉCORATIVE, ET DONC MUETTE. Un lecteur d'écran n'a rien à en
       dire : ce qui compte ici est le bouton, et il s'annonce déjà tout seul.

       ON NE LA POSE PAS DEUX FOIS : une page peut très bien l'avoir écrite
       dans son HTML, ce qui vaut mieux — une image écrite dans la page part
       avec elle, une image montée au script attend que le script tourne. */
    if (reglages.image && !seuil.querySelector("." + CLASSE + "__fond")) {
      var fond = document.createElement("img");
      fond.className = CLASSE + "__fond";
      fond.src = reglages.image;
      fond.alt = "";
      fond.setAttribute("aria-hidden", "true");
      fond.setAttribute("decoding", "async");
      /* Elle EST le premier écran : rien n'a de raison de passer devant elle
         dans la file du réseau. */
      fond.setAttribute("fetchpriority", "high");
      fond.draggable = false;
      /* Le calque du dessous : la même image, floutée, pour habiller les bords
         que le cadrage `contain` laisse nus. Un seul fichier, un seul
         téléchargement — le navigateur ne redemande pas la même adresse. */
      var flou = fond.cloneNode(false);
      flou.className = CLASSE + "__fond " + CLASSE + "__fond--flou";
      flou.removeAttribute("fetchpriority");
      var voile = document.createElement("div");
      voile.className = CLASSE + "__voile";
      voile.setAttribute("aria-hidden", "true");
      /* Avant l'invite : c'est l'ordre du DOM qui décide du dessous, et le
         plan de l'invite qui garantit le dessus. */
      seuil.insertBefore(voile, seuil.firstChild);
      seuil.insertBefore(fond, seuil.firstChild);
      seuil.insertBefore(flou, seuil.firstChild);
      /* La plaque de la phrase ne se pose que là où une image la rend
         nécessaire : c'est la feuille qui décide, à partir de cette classe. */
      seuil.classList.add(CLASSE + "--image");
    }

    var invite = seuil.querySelector("." + CLASSE + "__invite");
    if (!invite) {
      invite = document.createElement("button");
      invite.className = CLASSE + "__invite";
      invite.type = "button";
      invite.innerHTML = '<span class="' + CLASSE + '__mot">Appuyer pour entrer</span>';
      seuil.appendChild(invite);
    }

    /* Le bruitage est demandé dès maintenant : au moment du geste, il ne
       restera plus qu'à le décoder. Préchargé sous l'adresse EXACTE que
       l'engin demandera — la leçon du lot 205. */
    if (window.ArcadeAudio && window.ArcadeAudio.precharger) {
      window.ArcadeAudio.precharger(SON);
    }

    var passe = false;
    var sorti = false;

    function passerLaMain() {
      if (passe) { return; }
      passe = true;
      if (typeof suite === "function") { suite(); }
      if (seuil.parentNode) { seuil.parentNode.removeChild(seuil); }
    }

    /* LE LOGO A VRAIMENT DISPARU. Sans mouvement, aucune animation de sortie
       ne part et les deux moments se confondent : la garde le permet. */
    function sortir() {
      passerLaMain();
      if (sorti) { return; }
      sorti = true;
      if (typeof reglages.surSortie === "function") { reglages.surSortie(); }
    }

    function entrer() {
      invite.removeEventListener("click", entrer);
      invite.disabled = true;
      seuil.classList.add(CLASSE + "--muet");

      /* LE SON PART DANS LE GESTE, là où tout navigateur l'accorde. Le
         silencieux du site s'applique : `activer` le lit et l'applique. */
      if (window.ArcadeAudio) {
        window.ArcadeAudio.activer();
        window.ArcadeAudio.fichierSeul(SON);
      }

      window.ArcadeLanceur.jouer({
        logo: logo,
        titre: reglages.titre || "",
        /* Le son vient d'être joué, dans le geste. Sans ce drapeau, le lanceur
           redemanderait le sien par-dessus, avec sa synthèse de secours. */
        sansSon: true,
        surFin: sortir
      });

      /* LE RELAIS SE PASSE AU DÉBUT DE L'EFFACEMENT DU LOGO, pas à sa fin.
         Attendre la fin donnait trois cents millisecondes de noir entre le
         logo et le jeu — le trou des lots 181 à 195. Le jeu monte dessous
         pendant que le logo s'en va : un fondu, pas une coupure. */
      var lanceur = document.querySelector(".arcade-lanceur");
      if (lanceur) {
        lanceur.addEventListener("animationstart", function (evenement) {
          if (evenement.animationName === "lanceur-sortie") { passerLaMain(); }
        });
      }
    }

    invite.addEventListener("click", entrer);
  }

  window.BornesSeuil = { ouvrir: ouvrir };
})();
