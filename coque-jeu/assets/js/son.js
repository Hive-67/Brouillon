/* ==========================================================================
   son.js — le moteur de son des jeux du Store Jeu Bunker (skill sons-bunker).

   Un seul fichier, script classique, aucune dépendance. Il se recopie tel
   quel dans `assets/js/son.js` du jeu, à la place de celui de Rancune : il
   garde `window.ArcadeAudio` (seuil et lanceur du Bunker) et ajoute
   `window.Son`, la bibliothèque de sons.

   CE QU'IL FAIT
   — Rien ne sonne avant un geste du joueur : le son se débloque DANS le
     premier appui (iOS ne l'accorde que là), puis se relance à chaque geste
     si le téléphone l'a suspendu.
   — `Son.jouer('interface/appui')` : une variante au hasard (jamais deux
     fois la même d'affilée), une hauteur qui varie un peu, un écart minimum
     entre deux mêmes sons (anti-mitraille), une vibration courte si le son
     en a une et si le réglage Vibrations est allumé.
   — Trois canaux : musique, bruitages, et le canal propre au jeu (`jeu`,
     par exemple le tir de PONT), chacun avec son volume, plus « tout
     couper ». Les réglages sont retenus sur l'appareil, sous le préfixe du
     jeu.
   — Une musique en boucle, avec fondu à l'entrée et à la sortie, qui se
     tait quand la page passe en arrière-plan.
   — Chargement à la demande : un son n'est téléchargé que la première fois
     qu'on le joue ou qu'on le précharge.

   EN LIGNE ET EN DOUBLE-CLIC
   En ligne, chaque fichier est téléchargé et décodé une fois (Web Audio :
   latence nulle, hauteur et volume exacts). Ouvert d'un double-clic
   (`file://`), le navigateur refuse ce téléchargement : on passe par
   l'élément audio, qui lit le fichier sans requête (sur iPhone, son volume
   ne se règle pas : il joue à plein, les réglages coupent seulement). Un
   jeu qui veut le son parfait au double-clic ajoute `sons-embarques.js`
   (les fichiers en base64, voir SKILL.md) : le moteur le lit en priorité.
   ========================================================================== */

(function () {
  "use strict";

  /* --- Le catalogue ------------------------------------------------------
     rôle : n = nombre de variantes (fichiers `<nom>-1.mp3`, `<nom>-2.mp3`…),
     canal, vib = vibration (ms ou motif, 0 = aucune), ecart = ms minimum
     entre deux mêmes sons, haut = variation de hauteur (0,03 = ±3 %),
     gain = volume propre du son (1 = niveau du fichier). Un jeu peut
     changer ou ajouter des rôles avec `Son.configurer({ sons: {…} })`. */
  var CATALOGUE = {
    "interface/appui":         { n: 3, vib: 8 },
    "interface/retour":        { n: 2, vib: 8 },
    "interface/choisir":       { n: 2 },
    "interface/ouvrir-tiroir": { n: 2 },
    "interface/fermer-tiroir": { n: 2 },
    "interface/bascule-oui":   { n: 2, vib: 10 },
    "interface/bascule-non":   { n: 2, vib: 10 },
    "interface/curseur":       { n: 2, ecart: 60 },
    "interface/erreur":        { n: 2, vib: [25, 40, 25] },
    "interface/confirmation":  { n: 2, vib: 15 },
    "interface/notification":  { n: 2 },
    "cartes/distribuer":       { n: 3, ecart: 35 },
    "cartes/poser":            { n: 3, vib: 6 },
    "cartes/retourner":        { n: 2 },
    "cartes/piocher":          { n: 2 },
    "cartes/jeter":            { n: 2 },
    "cartes/melanger":         { n: 1, haut: 0.01 },
    "cartes/ouvrir-paquet":    { n: 1, haut: 0.01 },
    "jetons/mise":             { n: 3, vib: 6 },
    "jetons/empiler":          { n: 3 },
    "jetons/pot":              { n: 2, vib: 12 },
    "jetons/gain":             { n: 2 },
    "jetons/des":              { n: 2, vib: 10 },
    "jeu/point":               { n: 2 },
    "jeu/ligne":               { n: 2, vib: 20 },
    "jeu/combo":               { n: 2, vib: [15, 30, 15] },
    "jeu/alerte-tour":         { n: 2, vib: 20, haut: 0 },
    "jeu/compte-a-rebours":    { n: 1, haut: 0, ecart: 300 },
    "jeu/depart":              { n: 1, haut: 0 },
    "jeu/tir":                 { n: 3, canal: "jeu", ecart: 70, gain: 0.7 },
    "jeu/tir-lourd":           { n: 2, canal: "jeu", ecart: 120, gain: 0.8, vib: 12 },
    "jeu/impact":              { n: 3, ecart: 50 },
    "jeu/impact-lourd":        { n: 2, ecart: 90, vib: 25 },
    "jeu/casse":               { n: 2, ecart: 90, vib: 20 },
    "jeu/explosion":           { n: 3, ecart: 120, vib: 40 },
    "jeu/bonus":               { n: 2 },
    "jeu/perdu":               { n: 2, vib: [40, 50, 60] },
    "jingles/victoire":        { n: 3, haut: 0, ecart: 1500, vib: [20, 60, 20, 60, 40] },
    "jingles/defaite":         { n: 3, haut: 0, ecart: 1500, vib: [60, 80, 120] },
    "jingles/record":          { n: 3, haut: 0, ecart: 1500, vib: [15, 40, 15, 40, 15] },
    "jingles/debut-partie":    { n: 2, haut: 0, ecart: 1000 },
    "jingles/niveau-suivant":  { n: 2, haut: 0, ecart: 1000, vib: 20 }
  };

  /* --- Les réglages ------------------------------------------------------ */
  var R = {
    prefixe: "jeu.",          /* préfixe du stockage du jeu, `tetris.` par exemple */
    dossier: "assets/son/",   /* où sont les sons, rangés par famille */
    ext: ".mp3",
    canalJeu: false,          /* true : le canal `jeu` a son propre volume ; sinon il suit les bruitages */
    ecart: 40,                /* anti-mitraille par défaut, en ms */
    haut: 0.03,               /* variation de hauteur par défaut */
    cles: {}                  /* noms de stockage imposés (jeu déjà en ligne) */
  };
  var DEFAUTS = { musique: 60, bruitages: 80, jeu: 80 };
  var vol = { musique: 60, bruitages: 80, jeu: 80 };
  var toutCoupe = false, vibrationsOn = true;

  /* Le script peut porter ses réglages : <script src="…/son.js" data-prefixe="tetris." data-dossier="assets/son/"> */
  try {
    var balise = document.currentScript;
    if (balise && balise.dataset) {
      if (balise.dataset.prefixe) { R.prefixe = balise.dataset.prefixe; }
      if (balise.dataset.dossier) { R.dossier = balise.dataset.dossier; }
    }
  } catch (e) { /* rien */ }

  function cle(nom) { return R.cles[nom] || (R.prefixe + nom); }
  function lireStock(nom) { try { return window.localStorage.getItem(cle(nom)); } catch (e) { return null; } }
  function ecrireStock(nom, v) { try { window.localStorage.setItem(cle(nom), String(v)); } catch (e) { /* non retenu */ } }

  function chargerReglages() {
    ["musique", "bruitages", "jeu"].forEach(function (c) {
      var v = lireStock("vol-" + c);
      vol[c] = (v !== null && v !== "" && isFinite(+v)) ? Math.max(0, Math.min(100, Math.round(+v))) : DEFAUTS[c];
    });
    toutCoupe = lireStock("tout-son") === "non";
    vibrationsOn = lireStock("vibrations") !== "non";
  }
  chargerReglages();

  /* --- Le contexte audio et ses voies -------------------------------------
     source → gain du son → canal (musique, bruitages, jeu) → maître →
     compresseur doux (écrase les pics quand tout part en même temps). */
  var ctx = null, maitre = null, bus = {};
  var actif = false;            /* un geste a eu lieu */
  var enLigne = location.protocol !== "file:";
  var auditeurs = [];

  /* Un volume de 0 à 100 donne un gain au carré : l'oreille entend ainsi
     une montée régulière d'un bout à l'autre du curseur. */
  function courbe(v) { var x = v / 100; return x * x; }
  function gainCanal(c) {
    if (c === "jeu" && !R.canalJeu) { c = "bruitages"; }
    return courbe(vol[c]);
  }
  function appliquerVolumes() {
    if (ctx) {
      var t = ctx.currentTime;
      maitre.gain.setTargetAtTime(toutCoupe ? 0 : 0.9, t, 0.02);
      bus.musique.gain.setTargetAtTime(gainCanal("musique"), t, 0.05);
      bus.bruitages.gain.setTargetAtTime(gainCanal("bruitages"), t, 0.02);
      bus.jeu.gain.setTargetAtTime(gainCanal("jeu"), t, 0.02);
    }
    majElementMusique();
    auditeurs.forEach(function (f) { try { f(etat()); } catch (e) { /* rien */ } });
  }

  function creerContexte() {
    var Contexte = window.AudioContext || window.webkitAudioContext;
    if (!Contexte) { return false; }
    try {
      ctx = new Contexte();
      var comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -16; comp.knee.value = 10; comp.ratio.value = 4;
      comp.attack.value = 0.003; comp.release.value = 0.2;
      comp.connect(ctx.destination);
      maitre = ctx.createGain();
      maitre.gain.value = toutCoupe ? 0 : 0.9;
      maitre.connect(comp);
      ["musique", "bruitages", "jeu"].forEach(function (c) {
        bus[c] = ctx.createGain();
        bus[c].gain.value = gainCanal(c);
        bus[c].connect(maitre);
      });
      /* iOS ne déverrouille l'audio que si un son part dans le geste même
         qui a créé le contexte : une impulsion d'un échantillon suffit. */
      var vide = ctx.createBufferSource();
      vide.buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
      vide.connect(maitre);
      vide.start(0);
      return true;
    } catch (e) { ctx = null; return false; }
  }

  /* À appeler dans un geste. Le moteur l'appelle seul au premier appui. */
  function activer() {
    actif = true;
    if (!ctx) { creerContexte(); }
    if (ctx && ctx.state !== "running" && ctx.resume && !document.hidden) {
      try { ctx.resume().catch(function () {}); } catch (e) { /* rien */ }
    }
    if (musique.voulue && !musique.joue) { lancerMusique(); }
    return !!ctx;
  }
  /* Chaque geste relance le son si le téléphone l'a suspendu (appel,
     retour d'arrière-plan). Les écouteurs restent, ils ne coûtent rien. */
  ["pointerdown", "touchend", "click", "keydown"].forEach(function (type) {
    window.addEventListener(type, function () {
      if (!actif || !ctx || ctx.state !== "running") { activer(); }
    }, true);
  });

  /* --- Le chargement ------------------------------------------------------
     Chaque fichier a une fiche : son tampon décodé (Web Audio) ou, à
     défaut, l'élément audio. Rien n'est demandé avant le premier usage. */
  var fiches = {};
  function chemin(fichier) { return R.dossier + fichier; }
  function base64EnOctets(b64) {
    var bin = atob(b64), o = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) { o[i] = bin.charCodeAt(i); }
    return o.buffer;
  }
  function decoder(fiche, octets) {
    if (!ctx || !ctx.decodeAudioData) { fiche.mode = "element"; return; }
    fiche.mode = "decodage";
    try {
      /* La forme à rappels : celle que les vieux Safari comprennent. */
      var p = ctx.decodeAudioData(octets, function (t) { fiche.tampon = t; fiche.mode = "tampon"; servir(fiche); },
                                  function () { fiche.mode = "element"; servir(fiche); });
      if (p && p.catch) { p.catch(function () {}); }
    } catch (e) { fiche.mode = "element"; servir(fiche); }
  }
  function charger(fichier) {
    var fiche = fiches[fichier];
    if (fiche) { return fiche; }
    fiche = fiches[fichier] = { fichier: fichier, mode: "attente", attente: [] };
    var emb = window.SONS_EMBARQUES && window.SONS_EMBARQUES[fichier];
    if (emb) { fiche.octets = base64EnOctets(emb); }
    else if (enLigne && typeof fetch === "function") {
      fiche.mode = "telechargement";
      fetch(chemin(fichier)).then(function (r) { if (!r.ok) { throw new Error(r.status); } return r.arrayBuffer(); })
        .then(function (o) { fiche.octets = o; fiche.mode = "attente"; if (ctx) { decoder(fiche, o); } },
              function () { fiche.mode = "absent"; fiche.attente = []; });
      return fiche;
    } else { fiche.mode = "element"; return fiche; }
    if (ctx) { decoder(fiche, fiche.octets); }
    return fiche;
  }
  /* Un son demandé pendant son chargement part s'il arrive vite (150 ms) ;
     plus tard, il tomberait à contretemps : on le laisse tomber. */
  function servir(fiche) {
    var maintenant = Date.now(), file = fiche.attente;
    fiche.attente = [];
    file.forEach(function (d) { if (maintenant - d.quand < 150) { lire(fiche, d.o); } });
  }

  /* --- La lecture --------------------------------------------------------- */
  function lire(fiche, o) {
    if (fiche.mode === "attente" && fiche.octets) { if (ctx) { decoder(fiche, fiche.octets); } else { fiche.mode = "element"; } }
    if (fiche.mode === "tampon") { return parTampon(fiche, o); }
    if (fiche.mode === "element") { return parElement(fiche, o); }
    if (fiche.mode !== "absent") { fiche.attente.push({ quand: Date.now(), o: o }); }
    return null;
  }
  function parTampon(fiche, o) {
    if (!ctx || ctx.state !== "running") { return null; }
    var src = ctx.createBufferSource(), g = ctx.createGain();
    src.buffer = fiche.tampon;
    src.playbackRate.value = o.vitesse;
    g.gain.value = o.gain;
    src.connect(g); g.connect(bus[o.canal] || bus.bruitages);
    src.start(0);
    return src;
  }
  function parElement(fiche, o) {
    try {
      var el = new Audio(chemin(fiche.fichier));
      el.setAttribute("playsinline", "");
      el.preservesPitch = el.mozPreservesPitch = el.webkitPreservesPitch = false;
      el.playbackRate = o.vitesse;
      el.volume = Math.max(0, Math.min(1, o.gain * gainCanal(o.canal) * (toutCoupe ? 0 : 0.9)));
      var p = el.play();
      if (p && p.catch) { p.catch(function () { /* refusé : silence */ }); }
      return el;
    } catch (e) { return null; }
  }

  /* --- Jouer un son par son rôle ------------------------------------------ */
  var derniers = {};            /* rôle → { quand, variante } */
  function infos(role) { return CATALOGUE[role] || null; }
  function fichiersDe(role) {
    var f = infos(role), nom = role, liste = [];
    if (!f) { return liste; }
    for (var i = 1; i <= (f.n || 1); i++) { liste.push(nom + "-" + i + R.ext); }
    return liste;
  }
  function vibrer(motif) {
    if (!actif || !vibrationsOn || !motif || !navigator.vibrate) { return false; }
    try { return navigator.vibrate(motif); } catch (e) { return false; }   /* l'iPhone ne vibre pas depuis une page */
  }

  /* o : { volume (0 à 1, multiplie le gain), hauteur (variation), variante (1, 2…),
          vitesse (fixe la hauteur), vibration (false, ou un motif) } */
  function jouer(role, o) {
    o = o || {};
    var f = infos(role);
    if (!f || !actif) { return null; }
    var maintenant = Date.now(), d = derniers[role] || { quand: 0, variante: 0 };
    if (maintenant - d.quand < (f.ecart != null ? f.ecart : R.ecart)) { return null; }
    var n = f.n || 1, v = o.variante;
    if (!v) { v = 1 + Math.floor(Math.random() * n); if (n > 1 && v === d.variante) { v = v % n + 1; } }
    derniers[role] = { quand: maintenant, variante: v };
    if (o.vibration !== false) { vibrer(o.vibration || f.vib); }
    if (toutCoupe) { return null; }
    var canal = f.canal || "bruitages";
    if (gainCanal(canal) === 0) { return null; }
    var h = o.hauteur != null ? o.hauteur : (f.haut != null ? f.haut : R.haut);
    var vitesse = o.vitesse || (1 + (Math.random() * 2 - 1) * h);
    return lire(charger(role + "-" + v + R.ext),
                { canal: canal, vitesse: vitesse, gain: (f.gain || 1) * (o.volume != null ? o.volume : 1) });
  }

  /* Précharge des rôles, ou une famille entière : precharger('cartes'),
     precharger(['jeu/tir', 'jeu/impact']). Sans geste, il télécharge ; le
     décodage se fait au premier geste. */
  function precharger(quoi) {
    var roles = [];
    (Array.isArray(quoi) ? quoi : [quoi]).forEach(function (q) {
      if (CATALOGUE[q]) { roles.push(q); }
      else { Object.keys(CATALOGUE).forEach(function (r) { if (r.indexOf(q + "/") === 0) { roles.push(r); } }); }
    });
    roles.forEach(function (r) { fichiersDe(r).forEach(charger); });
    return roles.length;
  }

  /* --- La musique ---------------------------------------------------------
     Une piste à la fois, en boucle. En ligne : décodée et bouclée par Web
     Audio (boucle sans trou). En double-clic : l'élément audio en boucle. */
  var musique = { voulue: null, joue: false, source: null, gain: null, el: null, fondu: 1.2, debut: 0, fin: 0 };
  function lancerMusique() {
    var m = musique, fichier = m.voulue;
    if (!fichier || !actif || toutCoupe || document.hidden) { return; }
    var f = charger(fichier);
    if (f.mode === "attente" && f.octets && ctx) { decoder(f, f.octets); }
    if (f.mode === "tampon" && ctx && ctx.state === "running") {
      m.joue = true;
      var src = ctx.createBufferSource(), g = ctx.createGain(), t = ctx.currentTime;
      src.buffer = f.tampon; src.loop = true;
      if (m.fin > 0) { src.loopStart = m.debut; src.loopEnd = m.fin; }
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(1, t + m.fondu);
      src.connect(g); g.connect(bus.musique);
      src.start(0);
      m.source = src; m.gain = g;
    } else if (f.mode === "element") {
      m.joue = true;
      var el = m.el = new Audio(chemin(fichier));
      el.loop = true; el.setAttribute("playsinline", "");
      el.volume = 0;
      var p = el.play();
      if (p && p.catch) { p.catch(function () { m.joue = false; }); }
      fonduElement(el, cibleElement(), m.fondu);
    } else if (f.mode !== "absent") {
      /* pas encore prêt : on réessaie dès qu'il l'est */
      var essai = setInterval(function () {
        if (f.mode === "tampon" || f.mode === "element" || f.mode === "absent" || m.voulue !== fichier) {
          clearInterval(essai);
          if (m.voulue === fichier && !m.joue) { lancerMusique(); }
        }
      }, 120);
    }
  }
  function cibleElement() { return toutCoupe ? 0 : Math.min(1, gainCanal("musique") * 0.9); }
  function fonduElement(el, cible, duree, apres) {
    var depart = el.volume, t0 = Date.now();
    clearInterval(el._fondu);
    el._fondu = setInterval(function () {
      var k = Math.min(1, (Date.now() - t0) / (duree * 1000));
      try { el.volume = depart + (cible - depart) * k; } catch (e) { /* rien */ }
      if (k >= 1) { clearInterval(el._fondu); if (apres) { apres(); } }
    }, 40);
  }
  function majElementMusique() { if (musique.el && musique.joue) { fonduElement(musique.el, cibleElement(), 0.15); } }
  function couperMusique(fondu) {
    var m = musique, d = fondu != null ? fondu : m.fondu;
    if (m.source && ctx) {
      var src = m.source, g = m.gain, t = ctx.currentTime;
      g.gain.cancelScheduledValues(t);
      g.gain.setValueAtTime(g.gain.value, t);
      g.gain.linearRampToValueAtTime(0.0001, t + Math.max(0.02, d));
      try { src.stop(t + Math.max(0.02, d) + 0.05); } catch (e) { /* déjà arrêtée */ }
    }
    if (m.el) { var el = m.el; fonduElement(el, 0, Math.max(0.02, d), function () { el.pause(); }); }
    m.source = m.gain = m.el = null; m.joue = false;
  }
  /* Son.musique('musique/menu.mp3', { fondu: 1.5, debutBoucle: 0, finBoucle: 92.4 })
     Son.musique(null) : coupe en fondu. Le chemin part du dossier des sons. */
  function choisirMusique(fichier, o) {
    o = o || {};
    if (fichier === musique.voulue && musique.joue) { return; }
    couperMusique(o.fondu);
    musique.voulue = fichier || null;
    musique.fondu = o.fondu != null ? o.fondu : 1.2;
    musique.debut = o.debutBoucle || 0; musique.fin = o.finBoucle || 0;
    if (fichier) { lancerMusique(); }
  }

  /* La page passe en arrière-plan : tout se tait ; elle revient : tout repart. */
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      if (ctx && ctx.suspend) { try { ctx.suspend(); } catch (e) { /* rien */ } }
      if (musique.el) { try { musique.el.pause(); } catch (e) { /* rien */ } }
    } else {
      if (ctx && ctx.resume && actif) { try { ctx.resume().catch(function () {}); } catch (e) { /* rien */ } }
      if (musique.el && musique.joue && !toutCoupe) { var p = musique.el.play(); if (p && p.catch) { p.catch(function () {}); } }
      if (musique.voulue && !musique.joue) { lancerMusique(); }
    }
  });

  /* --- Les réglages, vus du jeu ------------------------------------------- */
  function volume(canal, v) {
    if (!(canal in vol)) { return null; }
    if (v === undefined) { return vol[canal]; }
    vol[canal] = Math.max(0, Math.min(100, Math.round(+v || 0)));
    ecrireStock("vol-" + canal, vol[canal]);
    appliquerVolumes();
    return vol[canal];
  }
  function couperTout(oui) {
    toutCoupe = !!oui;
    ecrireStock("tout-son", toutCoupe ? "non" : "oui");
    if (toutCoupe) { if (musique.joue) { couperMusique(0.2); } }
    else if (musique.voulue && !musique.joue) { lancerMusique(); }
    appliquerVolumes();
  }
  function vibrations(oui) {
    if (oui === undefined) { return vibrationsOn; }
    vibrationsOn = !!oui;
    ecrireStock("vibrations", vibrationsOn ? "oui" : "non");
    appliquerVolumes();
    return vibrationsOn;
  }
  function etat() {
    var modes = {};
    Object.keys(fiches).forEach(function (k) { var m = fiches[k].mode; modes[m] = (modes[m] || 0) + 1; });
    return {
      actif: actif, contexte: ctx ? ctx.state : "pas encore créé", lecture: enLigne ? "web-audio" : "element",
      musique: vol.musique, bruitages: vol.bruitages, jeu: R.canalJeu ? vol.jeu : null,
      toutCoupe: toutCoupe, vibrations: vibrationsOn, piste: musique.voulue, fichiers: modes
    };
  }
  /* Son.configurer({ prefixe: 'tetris.', dossier: 'assets/son/', canalJeu: true,
                      cles: { jeu: 'pont-vol-tir' }, sons: { 'jeu/tir': { n: 1 } } }) */
  function configurer(o) {
    o = o || {};
    ["prefixe", "dossier", "ext", "canalJeu", "ecart", "haut"].forEach(function (k) { if (o[k] !== undefined) { R[k] = o[k]; } });
    if (o.cles) {
      /* `cles` accepte les noms courts : musique, bruitages, jeu, tout-son, vibrations */
      Object.keys(o.cles).forEach(function (k) { R.cles[/^(musique|bruitages|jeu)$/.test(k) ? "vol-" + k : k] = o.cles[k]; });
    }
    if (o.defauts) { Object.keys(o.defauts).forEach(function (k) { DEFAUTS[k] = o.defauts[k]; }); }
    if (o.sons) {
      Object.keys(o.sons).forEach(function (r) {
        var base = CATALOGUE[r] || {}, neuf = {};
        Object.keys(base).forEach(function (k) { neuf[k] = base[k]; });
        Object.keys(o.sons[r]).forEach(function (k) { neuf[k] = o.sons[r][k]; });
        CATALOGUE[r] = neuf;
      });
    }
    chargerReglages();
    appliquerVolumes();
    return etat();
  }

  window.Son = {
    configurer: configurer, activer: activer, jouer: jouer, precharger: precharger,
    musique: choisirMusique, volume: volume, couperTout: couperTout,
    estCoupe: function () { return toutCoupe; }, vibrations: vibrations, vibrer: vibrer,
    etat: etat, roles: function () { return Object.keys(CATALOGUE); },
    fichiers: fichiersDe, surChangement: function (f) { auditeurs.push(f); }
  };

  /* --- Compatibilité : le seuil et le lanceur du Bunker -------------------
     `bornes-seuil.js` et `arcade-lanceur.js` (recopiés tels quels de
     Rancune) appellent `window.ArcadeAudio`. On leur rend les mêmes
     fonctions, branchées sur ce moteur. `fichierSeul` joue
     `terminal-ouverture.m4a` (le fichier de Rancune, à la racine du dossier
     des sons) ou rien. */
  var ANCIENS = {
    tap: "interface/appui", ouvre: "interface/ouvrir-tiroir", ferme: "interface/fermer-tiroir",
    jouer: "jingles/debut-partie", carte: "cartes/distribuer", jetons: "jetons/empiler",
    miser: "jetons/mise", tapis: "jetons/pot", parole: "interface/appui", couche: "cartes/jeter",
    tour: "jeu/alerte-tour", alerte: "jeu/compte-a-rebours", gain: "jetons/gain", perdu: "jeu/perdu",
    victoire: "jingles/victoire", defaite: "jingles/defaite", record: "jingles/record"
  };
  if (!window.ArcadeAudio) {
    window.ArcadeAudio = {
      activer: activer,
      precharger: function (nom) { if (nom === "terminal-ouverture") { charger("terminal-ouverture.m4a"); } },
      /* Le son du lanceur part dans le geste du seuil, le tout premier de
         la page : le contexte vient de naître et le fichier n'est pas
         encore décodé. Il ne passe donc pas par la règle des 150 ms des
         autres sons (sur iPhone, le décodage du m4a la dépasse, et le
         lanceur restait muet) : comme le moteur de Rancune, on décode,
         puis on joue, même un peu plus tard ; sans décodage possible,
         l'élément audio. */
      fichierSeul: function (nom) {
        if (nom !== "terminal-ouverture" || toutCoupe || !actif) { return; }
        var fiche = charger("terminal-ouverture.m4a"), o = { canal: "bruitages", vitesse: 1, gain: 0.9 };
        function jouerTampon() {
          if (!ctx || toutCoupe) { return; }
          var src = ctx.createBufferSource(), g = ctx.createGain();
          src.buffer = fiche.tampon;
          g.gain.value = o.gain;
          src.connect(g); g.connect(bus.bruitages);
          src.start(0);
        }
        if (fiche.mode === "tampon") { jouerTampon(); return; }
        if (ctx && ctx.decodeAudioData && fiche.octets && fiche.mode !== "decodage") {
          fiche.mode = "decodage";
          try {
            var p = ctx.decodeAudioData(fiche.octets,
              function (t) { fiche.tampon = t; fiche.mode = "tampon"; jouerTampon(); },
              function () { fiche.mode = "element"; parElement(fiche, o); });
            if (p && p.catch) { p.catch(function () {}); }
            return;
          } catch (e) { /* on passe à l'élément */ }
        }
        /* Pas encore téléchargé : l'élément audio, que le geste autorise. */
        parElement(fiche, o);
      },
      diagnostic: function () { var e = etat(); return { contexte: e.contexte, coupe: toutCoupe ? "oui" : "non" }; },
      couper: couperTout, estCoupe: function () { return toutCoupe; },
      bruitage: function (nom) { if (ANCIENS[nom]) { jouer(ANCIENS[nom]); } }
    };
  }
})();
