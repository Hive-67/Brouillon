/* ==========================================================================
   jeu.js : LE SEUL FICHIER À ÉCRIRE pour un nouveau jeu.

   Trois blocs : APP (l'identité), CHANGELOG (le journal des mises à jour),
   JEU (le jeu lui-même). Tout le reste (seuil, lanceur, accueil, Discord,
   classement, réglages, thèmes, pause, fin de partie) est fait par la coque
   (coque.js), sans y toucher. Mode d'emploi complet : LISEZ-MOI.md.

   Le jeu d'exemple ci-dessous, « Cible », sert à voir la coque tourner pour
   de vrai : on le remplace entièrement par le vrai jeu.
   ========================================================================== */

/* ===== L'identité du jeu ===== */
window.APP = {
  nom: "Cible",
  version: "1.0",
  lot: 1,
  description: "Touche les cibles avant qu'elles disparaissent. Jeu d'exemple du kit Store Jeu Bunker.",
  auteur: "Hive",
  url: ""
};

/* Du plus récent au plus ancien, écrit pour Hive, sans nom de fichier ni de fonction. */
window.CHANGELOG = [
  { version: "1.0", lot: 1, date: "25/10/2026", changes: ["Le jeu naît avec la coque du Bunker : seuil, accueil, connexion Discord, classement, réglages et fin de partie."] }
];

/* ===== Le jeu ===== */
window.JEU = (function () {
  "use strict";

  var DUREE = 30;                 // secondes par partie
  var zone, coque, minuterie, apparition, reste, score, serie, cibles, enPause;

  function maintenant() { return performance.now(); }

  function poserCible() {
    if (enPause) { return; }
    var r = zone.getBoundingClientRect();
    var taille = coque.reglage("grosses") ? 72 : 54;
    var c = document.createElement("button");
    c.type = "button";
    c.setAttribute("aria-label", "Cible");
    c.style.cssText = "position:absolute;width:" + taille + "px;height:" + taille + "px;border-radius:50%;border:3px solid var(--t-trait);" +
      "background:radial-gradient(circle,var(--t-1) 0 22%,var(--t-fond) 22% 40%,var(--t-2) 40% 58%,var(--t-fond) 58% 76%,var(--t-3) 76%);" +
      "left:" + Math.round(Math.random() * (r.width - taille)) + "px;top:" + Math.round(Math.random() * (r.height - taille)) + "px;" +
      "padding:0;cursor:pointer;transition:transform 120ms ease-out;";
    var vie = Math.max(700, 1500 - (DUREE - reste) * 25);
    var fiche = { el: c, fin: maintenant() + vie };
    c.addEventListener("pointerdown", function (ev) {
      ev.preventDefault();
      if (enPause) { return; }
      serie += 1;
      score += 10 * Math.min(serie, 5);
      coque.compteur("Score", score);
      coque.compteur("Série", serie);
      coque.son(serie >= 5 ? "jeu/combo" : "jeu/point");
      coque.vibrer(8);
      retirer(fiche);
    });
    cibles.push(fiche);
    zone.append(c);
  }
  function retirer(f) {
    var i = cibles.indexOf(f);
    if (i >= 0) { cibles.splice(i, 1); }
    f.el.remove();
  }
  function tic() {
    if (enPause) { return; }
    var t = maintenant();
    cibles.slice().forEach(function (f) {
      if (t > f.fin) { retirer(f); serie = 0; coque.compteur("Série", 0); coque.son("interface/erreur"); }
    });
  }
  function seconde() {
    if (enPause) { return; }
    reste -= 1;
    coque.compteur("Temps", reste);
    if (reste <= 5 && reste > 0) { coque.son("jeu/compte-a-rebours"); }
    if (reste <= 0) { coque.fin({ score: score, stats: { "Cibles": Math.round(score / 10) } }); }
  }

  return {
    id: "cible",                    // nom court : préfixe du stockage, nom au classement, page /bornes/cible/ du Store
    couleur: "#ff6a1a",             // la couleur du jeu (--jeu)
    surCouleur: "#14130f",          // le texte posé dessus
    pastille: "Vise !",             // le mot penché sur l'image de l'accueil
    sousJouer: "30 secondes",       // la petite ligne sous « Jouer » (vide : rien)
    compteurs: ["Score", "Temps", "Série"],  // la barre en partie, trois au plus
    classement: true,               // false : pas de classement, les boutons disparaissent
    regles: [
      "Des cibles apparaissent partout dans la zone de jeu.",
      "Touche-les avant qu'elles disparaissent.",
      "Chaque cible touchée d'affilée rapporte plus, jusqu'à cinq fois plus.",
      "La partie dure 30 secondes."
    ],
    reglages: [
      { id: "grosses", titre: "Grosses cibles", phrase: "Plus faciles à toucher", defaut: false }
    ],
    // musiques: [{ nom: "Le thème", fichier: "musique/theme.mp3" }],   // dans assets/son/
    // volumeJeu: "Volume du tir",   // seulement si le jeu a déjà ce réglage
    // duel: { ordi: true, enLigne: { creer: function (coque, dire) {}, rejoindre: function (code, coque, dire) {} } },

    /* L'image de l'accueil : dessinée ici, ou `image: "assets/img/jeu.webp"` à la place. */
    accueil: function (el) {
      el.style.cssText += "display:grid;place-items:center;background:var(--t-fond)";
      el.innerHTML = '<span style="width:96px;height:96px;border-radius:50%;border:3px solid var(--bunker-or);' +
        'background:radial-gradient(circle,#c8101b 0 22%,#14130f 22% 40%,#2a62bd 40% 58%,#14130f 58% 76%,#d9a441 76%)"></span>';
    },

    /* Une partie commence : `zone` est vide, `mode` vaut 'solo' (ou 'duel-ordi'). */
    commencer: function (z, c, mode) {
      zone = z; coque = c;
      reste = DUREE; score = 0; serie = 0; cibles = []; enPause = false;
      coque.compteur("Temps", reste);
      minuterie = setInterval(seconde, 1000);
      apparition = setInterval(function () { poserCible(); tic(); }, 520);
    },
    pause: function () { enPause = true; },
    reprendre: function () {
      var decale = maintenant();
      cibles.forEach(function (f) { f.fin = decale + 900; });
      enPause = false;
    },
    arreter: function () {
      clearInterval(minuterie);
      clearInterval(apparition);
      (cibles || []).slice().forEach(retirer);
    },
    theme: function (nom) { /* les cibles suivent les jetons --t-* tout seuls */ },
    reglage: function (id, oui) { /* pris en compte à la cible suivante */ }
  };
})();
