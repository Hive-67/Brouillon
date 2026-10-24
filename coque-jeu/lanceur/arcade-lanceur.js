/* ==========================================================================
   arcade-lanceur.js — la séquence d'ouverture, commune aux jeux.

   Quand le joueur appuie sur LANCER, il n'atterrit pas directement dans le
   jeu : écran noir, le logo apparaît, deux barres en braise balaient jusqu'à
   lui, le titre se compose lettre par lettre, « // SYSTÈME PRÊT », fondu.
   Seize cents millisecondes au plus, et toutes les durées sont dans
   arcade.css : ce script pose une classe, le navigateur synchronise.

   Sautable d'un tap ou d'une touche. Ne se rejoue pas entre deux parties :
   c'est le noyau qui ne l'appelle qu'à l'entrée dans un jeu. Sous
   `prefers-reduced-motion`, un affichage statique de 400 ms la remplace.

   VENANT DU TERMINAL, LE LOGO NE SURGIT PLUS : il a déjà surgi sur le seuil,
   avec le bruitage, dans le geste du clic. Il est ici d'emblée à sa place et
   la séquence reprend à sa suite — les barres, le titre, « système prêt ».

   UN SEUL SON : le bruitage de démarrage d'interface Braytech, à l'entrée en
   scène. Les deux se superposaient jusqu'au lot 193, qui avait gardé le
   balayage ; Hive a tranché dans l'autre sens le 14 septembre. C'est le même
   son partout où un logiciel démarre — le terminal, le module d'encodage, les
   quatre jeux de la chambre.

   Ce fichier ne connaît aucun jeu : il reçoit un titre et un logo.
   ========================================================================== */

(function () {
  "use strict";

  var mouvementReduit = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Le plafond d'attente du logo. Ce n'est PAS un réglage d'animation : c'est
     la garantie qu'un réseau muet ne retient pas le jeu. Préchargée par la
     page, l'image est prête en une image ou deux et ce plafond ne sert jamais. */
  var PLAFOND_LOGO = 1200;

  /* VENANT DU TERMINAL, LE LOGO A DÉJÀ SURGI — sur le seuil, avec son
     bruitage, dans le geste du clic (lot 181). Le rejouer ici le ferait
     repartir de rien une seconde fois, et le bruitage avec : un hoquet. Il
     est donc posé d'emblée à sa place, et le son n'est pas redemandé.

     LA LECTURE EST TARDIVE, ET POUR DEUX RAISONS. Ce fichier est chargé AVANT
     arcade-commun.js, qui porte la clé : au chargement, il n'y a rien à lire.
     Et la clé s'efface à la lecture — la prendre ici priverait le terminal,
     qui charge aussi ce fichier, du seuil qui s'ouvre à son retour. On ne la
     prend donc qu'au moment de jouer, ce qui n'arrive jamais sur le terminal. */
  var venu = null;

  function venuDuTerminal() {
    if (venu === null) {
      venu = !!(window.ArcadeCommun && window.ArcadeCommun.prendreLeSens &&
        window.ArcadeCommun.prendreLeSens() === "aller");
    }
    return venu;
  }

  function echapper(texte) {
    return String(texte).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /* Une lettre par span, chacune avec son délai : 580 ms puis 28 ms par lettre */
  function lettres(titre) {
    return Array.prototype.map.call(titre, function (lettre, index) {
      var delai = 580 + index * 28;
      return '<span class="arcade-lanceur__lettre" style="animation-delay: ' + delai + 'ms">' +
        (lettre === " " ? "&nbsp;" : echapper(lettre)) + "</span>";
    }).join("");
  }

  function jouer(options) {
    var repris = venuDuTerminal();
    var termine = false;
    var secours = 0;
    var plafond = 0;
    var element = document.createElement("div");
    element.className = "arcade-lanceur";
    element.setAttribute("aria-hidden", "true");
    element.innerHTML =
      '<div class="arcade-lanceur__barres">' +
        '<span class="arcade-lanceur__barre arcade-lanceur__barre--gauche"></span>' +
        '<span class="arcade-lanceur__barre arcade-lanceur__barre--droite"></span>' +
      "</div>" +
      '<img class="arcade-lanceur__logo" src="' + echapper(options.logo) + '" alt="" width="512" height="493">' +
      '<p class="arcade-lanceur__titre">' + lettres(options.titre || "") + "</p>" +
      '<p class="arcade-lanceur__pret">Système prêt</p>';

    /* --- LE SON DU LANCEUR, ET POURQUOI IL MANQUAIT UNE FOIS SUR DEUX ------
       UN SEUL SON, celui du lanceur : le bruitage de démarrage d'interface
       Braytech. Rien sur le seuil, rien d'autre ici. C'est la règle du lot 180
       et elle ne bouge pas.

       CE QUI NE MARCHAIT PAS, MESURÉ : ce lanceur part AU CHARGEMENT DE LA
       PAGE, pas sur un appui. Or l'horloge audio d'une page fraîche est
       endormie tant que personne ne l'a touchée, et `ArcadeAudio.jouer` — qui
       a raison de ne rien émettre sur une horloge arrêtée — n'émettait donc
       rien. Que le son sorte ou non dépendait alors de l'humeur du navigateur,
       qui autorise parfois la reprise sans geste. D'où le « des fois ça marche,
       des fois ça marche pas » de Hive.

       CE QU'ON FAIT, ET C'EST TOUT CE QU'ON PEUT FAIRE SANS METTRE DE SON SUR
       LE SEUIL : on le demande à l'entrée en scène, comme avant — là où le
       navigateur l'autorise, il sort à sa place —, et si l'horloge dort, le
       PREMIER CONTACT sur la page le rend, tant que le logo est encore là.
       C'est la mécanique du module d'encodage, éprouvée depuis le lot 197.

       Passé le lanceur, plus rien ne part : ce son appartient au démarrage,
       pas à un appui quelconque. */
    var sonRendu = false;

    /* --- QUAND LE LANCEUR NE DOIT PAS SONNER --------------------------------
       LES BORNES JOUENT LE SON ELLES-MÊMES, sur le seuil, DANS le geste qui
       ouvre — là où tout navigateur l'accorde, et sans synthèse de secours :
       Hive a choisi un bruitage précis, lui en substituer un autre serait lui
       en jouer un qu'il n'a pas choisi (règle du lot 203).

       Sans cette option, le lanceur redemandait le sien par-dessus : mesuré au
       lot 218, DEUX sons pour une seule entrée, dont dix oscillateurs de
       synthèse sur un navigateur qui ne lit pas l'AAC.

       L'ARCADE N'EST PAS TOUCHÉE : sans l'option, tout se passe comme avant. */
    if (options.sansSon) { sonRendu = true; }

    function demanderLeSon() {
      if (sonRendu || !window.ArcadeAudio) { return; }
      window.ArcadeAudio.activer();
      var etat = window.ArcadeAudio.diagnostic && window.ArcadeAudio.diagnostic();
      if (etat && etat.contexte !== "running") {
        /* L'horloge dort : on n'émet pas dans le vide et on garde sa chance
           au premier contact. En capture, sur la fenêtre : où qu'on touche. */
        window.addEventListener("pointerdown", auPremierContact, true);
        window.addEventListener("keydown", auPremierContact, true);
        return;
      }
      sonRendu = true;
      window.ArcadeAudio.jouer("terminal");
    }

    /* LE CONTACT QUI ALLUME LE SON NE SAUTE PAS LE LOGO QU'IL VIENT D'ÉCLAIRER.
       Il est pris en capture, donc avant `sauter` ; on lui dit de laisser
       passer celui-là, et le suivant saute comme d'habitude. Même principe que
       l'amorçage du module. */
    var laisserPasserUnSaut = false;

    function auPremierContact() {
      window.removeEventListener("pointerdown", auPremierContact, true);
      window.removeEventListener("keydown", auPremierContact, true);
      if (sonRendu || termine || !window.ArcadeAudio) { return; }
      sonRendu = true;
      laisserPasserUnSaut = true;
      window.ArcadeAudio.activer();
      window.ArcadeAudio.jouer("terminal");
    }

    function finir() {
      if (termine) { return; }
      termine = true;
      window.clearTimeout(secours);
      window.clearTimeout(plafond);
      document.removeEventListener("keydown", sauter);
      window.removeEventListener("pointerdown", auPremierContact, true);
      window.removeEventListener("keydown", auPremierContact, true);
      if (element.parentNode) { element.parentNode.removeChild(element); }
      if (options.surFin) { options.surFin(); }
    }

    /* Un tap ou une touche n'importe où, et on passe au décompte */
    function sauter(evenement) {
      if (evenement.type === "keydown" && evenement.key === "Tab") { return; }
      if (laisserPasserUnSaut) {
        laisserPasserUnSaut = false;
        evenement.preventDefault();
        return;
      }
      evenement.preventDefault();
      finir();
    }

    document.body.appendChild(element);

    if (mouvementReduit) {
      element.classList.add("arcade-lanceur--statique");
      element.addEventListener("pointerdown", sauter);
      document.addEventListener("keydown", sauter);
      secours = window.setTimeout(finir, 400);
      return;
    }

    element.addEventListener("animationend", function (evenement) {
      if (evenement.animationName === "lanceur-sortie") { finir(); }
    });

    /* --- ON ATTEND LE LOGO, VRAIMENT --------------------------------------
       LE DÉFAUT QUE HIVE DÉCRIT, ET SA CAUSE. « Le logo n'arrive pas et ça
       passe directement au jeu, des fois ça marche des fois ça marche pas. »

       La séquence partait à l'instant où l'élément était posé, sans se
       demander si l'image était là. Son animation dure 320 ms ; une image de
       93 Ko qui met plus longtemps à arriver rate son entrée et ne se montre
       jamais — l'écran reste noir, puis le jeu s'ouvre. Rien dans le code ne
       le disait, et c'est pour ça que le résultat changeait d'une fois sur
       l'autre : selon que l'image était en cache ou non.

       ET ELLE NE L'ÉTAIT PAS SI SOUVENT : l'icône de la page porte `?v=`,
       l'image du lanceur non. Deux adresses, deux entrées de cache, aucune ne
       servait à l'autre. Les pages de jeu la préchargent maintenant sous
       l'adresse EXACTE que ce fichier demande.

       ON N'AJOUTE PAS DE DÉLAI : on attend l'image elle-même. `decode()` rend
       la main quand elle est prête à être peinte — pas seulement téléchargée.
       Un refus rend la main aussi : une image cassée ne doit pas retenir le
       jeu. Reste le cas du réseau qui ne répond plus, où rien ne se résout
       jamais : un plafond garde la porte ouverte, et il ne règle aucune
       animation — il empêche seulement de rester coincé. */
    var logo = element.querySelector(".arcade-lanceur__logo");

    function demarrerLaSequence() {
      if (termine || element.classList.contains("arcade-lanceur--actif")) { return; }
      /* Le navigateur doit avoir peint l'état de départ avant la classe, sinon
         la première image saute. */
      void element.offsetWidth;
      if (repris) { element.classList.add("arcade-lanceur--repris"); }
      element.classList.add("arcade-lanceur--actif");
      /* Le saut ne s'arme qu'une fois la séquence partie : sans ça, le contact
         qui réveille le son sauterait le logo qu'il vient d'éclairer. */
      element.addEventListener("pointerdown", sauter);
      document.addEventListener("keydown", sauter);
      demanderLeSon();
      /* Si aucune animation ne se déclenche — un navigateur qui ne les sait
         pas —, le secours tient la promesse des 1 600 ms. */
      secours = window.setTimeout(finir, 2200);
    }

    plafond = window.setTimeout(demarrerLaSequence, PLAFOND_LOGO);
    function logoPret() {
      window.clearTimeout(plafond);
      demarrerLaSequence();
    }
    if (logo && logo.decode) {
      logo.decode().then(logoPret, logoPret);
    } else if (logo && !logo.complete) {
      logo.addEventListener("load", logoPret);
      logo.addEventListener("error", logoPret);
    } else {
      logoPret();
    }
  }

  window.ArcadeLanceur = { jouer: jouer };
})();
