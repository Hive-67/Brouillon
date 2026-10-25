/* ==========================================================================
   coque.js : la coque du Store Jeu Bunker, qui tourne toute seule.

   ON N'Y TOUCHE PAS dans un jeu : tout ce qui change d'un jeu à l'autre est
   dans jeu.js (APP, CHANGELOG, JEU). Ce fichier fait marcher, pour tous les
   jeux pareil : le seuil et le lanceur du Bunker, l'accueil, le rond du
   joueur (connexion Discord par le Bunker), les records, la partie (barre,
   pause, recommencer, quitter), la fin de partie, le classement (membres du
   Bunker ou entre amis), les cinq sections de réglages, les trois thèmes,
   le plein écran, l'installation, À propos et le journal des mises à jour.

   Le jeu reçoit un objet `coque` (voir jeu.js et LISEZ-MOI.md) :
     coque.compteur(nom, valeur)  écrit un compteur de la barre
     coque.fin({ score, stats })  termine la partie
     coque.son(role)              joue un son de sons-bunker
     coque.vibrer(ms)             vibre, si le joueur l'a permis
     coque.reglage(id)            la valeur d'un réglage du jeu (vrai ou faux)
     coque.theme()                'bunker', 'neon' ou 'papier'
     coque.calme()                vrai si le joueur a réduit les animations
     coque.mode()                 'solo' ou 'duel-ordi'
   ========================================================================== */

(function () {
  "use strict";

  var JEU = window.JEU || {};
  var APP = window.APP || { nom: "Jeu", version: "1.0", lot: 1, description: "", auteur: "Hive" };
  var CHANGELOG = window.CHANGELOG || [];
  var ID = String(JEU.id || "jeu");
  var CLASSE = JEU.classement !== false && !!window.CLASSEMENT;
  var Son = window.Son;

  function $(id) { return document.getElementById(id); }
  function tous(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }
  function lire(cle) { try { return window.localStorage.getItem(ID + "." + cle); } catch (e) { return null; } }
  function garder(cle, v) { try { window.localStorage.setItem(ID + "." + cle, String(v)); } catch (e) { /* non retenu */ } }
  function oublier(cle) { try { window.localStorage.removeItem(ID + "." + cle); } catch (e) { /* rien */ } }
  function formater(n) {
    if (typeof JEU.formater === "function") { return JEU.formater(n); }
    return Math.round(n).toLocaleString("fr-FR");
  }
  function son(role) { if (Son) { Son.jouer(role); } }

  /* ===== La couleur du jeu, son nom, À propos, le journal ===== */
  if (JEU.couleur) { document.documentElement.style.setProperty("--jeu", JEU.couleur); }
  if (JEU.surCouleur) { document.documentElement.style.setProperty("--sur-jeu", JEU.surCouleur); }
  var remplir = {
    "nom": APP.nom,
    "version-lot": "v" + APP.version + " · lot " + APP.lot,
    "description": APP.description,
    "auteur": APP.auteur
  };
  tous("[data-app]").forEach(function (el) { el.textContent = remplir[el.dataset.app] || ""; });
  document.title = APP.nom;
  var journal = $("p-journal");
  CHANGELOG.forEach(function (e) {
    var li = document.createElement("li");
    var tete = document.createElement("div");
    tete.className = "tete";
    var v = document.createElement("strong");
    v.textContent = "v" + e.version;
    var info = document.createElement("span");
    info.textContent = "LOT " + e.lot + " · " + e.date;
    tete.append(v, info);
    var ul = document.createElement("ul");
    (e.changes || []).forEach(function (c) { var item = document.createElement("li"); item.textContent = c; ul.append(item); });
    li.append(tete, ul);
    journal.append(li);
  });

  /* ===== L'accueil : l'image, la pastille, Jouer, Duel, Classement, les règles ===== */
  var cadre = $("image-jeu");
  if (typeof JEU.accueil === "function") {
    var dessin = document.createElement("div");
    dessin.style.cssText = "position:absolute;inset:0";
    cadre.insertBefore(dessin, cadre.firstChild);
    JEU.accueil(dessin);
  } else if (JEU.image) {
    var img = document.createElement("img");
    img.src = JEU.image;
    img.alt = "";
    cadre.insertBefore(img, cadre.firstChild);
  }
  if (JEU.pastille) { $("pastille").textContent = JEU.pastille; $("pastille").hidden = false; }
  $("jouer-sous").textContent = JEU.sousJouer || "";
  var duelOk = !!(JEU.duel && JEU.duel.ordi && JEU.duel.enLigne);
  $("duel").hidden = !duelOk;
  if (!CLASSE) { tous("[data-si-classement]").forEach(function (b) { b.remove(); }); }
  (JEU.regles || []).forEach(function (r) { var li = document.createElement("li"); li.textContent = r; $("etapes").append(li); });

  function majRecords() {
    var r = lire("record");
    $("rec-record").textContent = r === null ? "0" : formater(+r);
    $("rec-parties").textContent = formater(+(lire("parties") || 0));
  }
  majRecords();

  /* ===== Les écrans ===== */
  var courant = "accueil";
  var pile = [];
  function montrer(nom) {
    tous("[data-ecran]").forEach(function (s) { s.hidden = s.dataset.ecran !== nom; });
    courant = nom;
    window.scrollTo(0, 0);
    if (nom === "classement") { chargerClassement(); }
  }
  function aller(nom) { fermerTout(); pile.push(courant); montrer(nom); }
  function retour() { montrer(pile.pop() || "accueil"); }
  function accueil() { fermerTout(); pile.length = 0; majRecords(); montrer("accueil"); }

  /* ===== Les tiroirs ===== */
  var ouvert = null;
  var origine = null;
  var enPause = false;
  function ouvrirTiroir(nom, bouton) {
    if (ouvert) { document.querySelector('[data-voile="' + ouvert + '"]').hidden = true; }
    else { origine = bouton; son("interface/ouvrir-tiroir"); }
    ouvert = nom;
    var v = document.querySelector('[data-voile="' + nom + '"]');
    v.hidden = false;
    v.querySelector(".tiroir").focus({ preventScroll: true });
  }
  function fermerTout() {
    if (ouvert) { son("interface/fermer-tiroir"); }
    tous("[data-voile]").forEach(function (v) { v.hidden = true; });
    if (ouvert && origine && document.contains(origine)) { origine.focus(); }
    ouvert = null;
    if (enPause) { enPause = false; if (courant === "jeu" && enCours && JEU.reprendre) { JEU.reprendre(); } }
  }
  function pause(bouton) {
    if (courant !== "jeu" || !enCours) { return; }
    if (!enPause) { enPause = true; if (JEU.pause) { JEU.pause(); } }
    ouvrirTiroir("pause", bouton);
  }
  function onglet(nom) {
    var j = nom === "journal";
    $("t-infos").setAttribute("aria-selected", j ? "false" : "true");
    $("t-journal").setAttribute("aria-selected", j ? "true" : "false");
    $("p-infos").hidden = j;
    $("p-journal").hidden = !j;
  }

  /* ===== La confirmation ===== */
  var CONFIRMER = {
    recommencer: { titre: "Recommencer ?", texte: "La partie en cours sera perdue.", oui: "Recommencer", puis: function () { arreter(); fermerTout(); commencer(mode); } },
    quitter: { titre: "Quitter la partie ?", texte: "La partie en cours sera perdue.", oui: "Quitter", puis: function () { arreter(); accueil(); } },
    effacer: { titre: "Effacer tes records ?", texte: "Ton record et ton nombre de parties sur ce téléphone seront remis à zéro. Le classement en ligne ne change pas.", oui: "Effacer", puis: function () { oublier("record"); oublier("parties"); majRecords(); son("interface/confirmation"); fermerTout(); } }
  };
  var action = null;
  function confirmer(nom, bouton) {
    var c = CONFIRMER[nom];
    $("c-titre").textContent = c.titre;
    $("c-texte").textContent = c.texte;
    $("c-oui").textContent = c.oui;
    action = c.puis;
    ouvrirTiroir("confirmer", bouton);
  }

  /* ===== La partie ===== */
  var COMPTEURS = (JEU.compteurs || ["Score"]).slice(0, 3);
  var hud = $("hud");
  var cases = {};
  hud.style.setProperty("--cpts", String(COMPTEURS.length));
  COMPTEURS.forEach(function (nom) {
    var d = document.createElement("div");
    d.className = "cpt";
    var a = document.createElement("span");
    a.textContent = nom.toUpperCase();
    var b = document.createElement("span");
    b.textContent = "0";
    d.append(a, b);
    hud.insertBefore(d, hud.lastElementChild);
    cases[nom] = b;
  });

  var enCours = false;
  var mode = "solo";
  var zone = $("zone");
  var coque = {
    compteur: function (nom, valeur) { if (cases[nom]) { cases[nom].textContent = typeof valeur === "number" ? formater(valeur) : String(valeur); } },
    fin: function (r) { finir(r || {}); },
    son: son,
    vibrer: function (ms) { if (Son) { Son.vibrer(ms || 15); } },
    reglage: function (id) { return reglageJeu(id); },
    theme: function () { return theme; },
    calme: function () { return document.documentElement.dataset.calme === "oui"; },
    mode: function () { return mode; }
  };
  function commencer(m) {
    mode = m || "solo";
    pile.length = 0;
    fermerTout();
    zone.textContent = "";
    COMPTEURS.forEach(function (nom) { cases[nom].textContent = "0"; });
    montrer("jeu");
    enCours = true;
    son("jingles/debut-partie");
    if (CLASSE && mode === "solo") { window.CLASSEMENT.partie(ID); }
    if (typeof JEU.commencer === "function") { JEU.commencer(zone, coque, mode); }
  }
  function arreter() {
    if (!enCours) { return; }
    enCours = false;
    enPause = false;
    if (JEU.arreter) { JEU.arreter(); }
  }
  /* La page passe en arrière-plan en pleine partie : pause. */
  document.addEventListener("visibilitychange", function () {
    if (document.hidden && courant === "jeu" && enCours && !ouvert) { pause(null); }
  });

  /* ===== La fin de partie ===== */
  var dernier = { score: 0 };
  function finir(r) {
    if (!enCours) { return; }
    enCours = false;
    enPause = false;
    if (JEU.arreter) { JEU.arreter(); }
    var score = Math.max(0, Math.floor(+r.score || 0));
    dernier = { score: score };
    var ancien = lire("record");
    var record = ancien === null || score > +ancien;
    if (record && score > 0) { garder("record", score); }
    garder("parties", +(lire("parties") || 0) + 1);
    $("fin-score").textContent = formater(score);
    $("fin-badge").hidden = !(record && score > 0 && ancien !== null);
    $("fin-mode").textContent = mode === "duel-ordi" ? "Duel contre l'ordi" : (JEU.nomMode || "");
    var stats = $("fin-stats");
    stats.textContent = "";
    var liste = Object.keys(r.stats || {}).slice(0, 2).map(function (k) { return [k, r.stats[k]]; });
    liste.push(["Ancien", ancien === null ? "0" : formater(+ancien)]);
    liste.forEach(function (s) {
      var d = document.createElement("div");
      d.className = "stat";
      var a = document.createElement("span");
      a.textContent = s[0];
      var b = document.createElement("span");
      b.textContent = typeof s[1] === "number" ? formater(s[1]) : String(s[1]);
      d.append(a, b);
      stats.append(d);
    });
    son(record && ancien !== null && score > 0 ? "jingles/record" : (r.gagne === false ? "jingles/defaite" : "jingles/victoire"));
    montrer("fin");
    envoyerScore(score, r.classement);
  }

  /* ===== Le classement : au Bunker, celui des membres ; ailleurs, entre amis ===== */
  function envoyerScore(score, statsClassement) {
    var info = $("fin-classement");
    info.textContent = "";
    if (!CLASSE || mode !== "solo" || score <= 0) { return; }
    var j = window.CLASSEMENT.joueur();
    if (j.etat === "invite") { info.textContent = "Score non classé : rejoins le Bunker pour entrer au classement des membres."; return; }
    if (j.etat === "dehors" && !window.CLASSEMENT.pseudo()) { info.textContent = "Choisis un pseudo dans les réglages pour entrer au classement."; return; }
    info.textContent = "Envoi au classement…";
    window.CLASSEMENT.envoyer(ID, score, statsClassement || null).then(function (res) {
      var bunker = j.etat === "membre";
      if (res === "record") { info.textContent = bunker ? "Nouveau record au classement du Bunker." : "Nouveau record au classement."; }
      else if (res === "garde") { info.textContent = "Ton meilleur score reste au classement."; }
      else { info.textContent = bunker ? "Le Bunker n'a pas pu enregistrer ce score." : "Hors ligne : score gardé sur ton téléphone."; }
    });
  }
  function chargerClassement() {
    if (!CLASSE) { return; }
    var etat = $("classement-etat"), ol = $("liste-classement");
    var j = window.CLASSEMENT.joueur();
    $("classement-source").textContent = j.etat === "dehors" ? "Entre amis" : "Membres du Bunker";
    etat.textContent = "Chargement…";
    ol.textContent = "";
    window.CLASSEMENT.lire(ID, 30).then(function (lignes) {
      if (courant !== "classement") { return; }
      if (!lignes) { etat.textContent = "Classement indisponible pour l'instant : pas de réseau, ou le serveur ne répond pas."; return; }
      if (!lignes.length) { etat.textContent = "Personne au classement pour l'instant. Joue une partie pour être le premier."; return; }
      etat.textContent = "";
      var moi = String(window.CLASSEMENT.pseudo() || "").toLowerCase();
      lignes.forEach(function (l, i) {
        var li = document.createElement("li");
        if (moi && String(l.pseudo).toLowerCase() === moi) { li.className = "moi"; }
        var rang = document.createElement("span");
        rang.className = "rang";
        rang.textContent = String(i + 1);
        var p = document.createElement("span");
        p.className = "pseudo";
        p.textContent = l.pseudo;
        var s = document.createElement("span");
        s.textContent = formater(l.score);
        li.append(rang, p, s);
        ol.append(li);
      });
    });
  }

  /* ===== Le rond du joueur, la connexion Discord (par la poignée de main du Bunker, classement.js) ===== */
  var INVITATION = "https://discord.gg/4tNUFBUH3G";
  $("lien-store").href = JEU.store || ("https://bunkerwebb.netlify.app/bornes/" + ID + "/");
  function joueur() { return window.CLASSEMENT ? window.CLASSEMENT.joueur() : { etat: "dehors", pseudo: "", avatar: "" }; }
  function majJoueur() {
    var j = joueur(), b = $("joueur"), photo = $("joueur-photo");
    b.dataset.etat = j.etat;
    $("joueur-initiale").textContent = j.etat === "membre" && !j.avatar ? j.pseudo.charAt(0) : "";
    if (j.etat === "membre" && j.avatar) {
      if (photo.getAttribute("src") !== j.avatar) { photo.src = j.avatar; }
      photo.hidden = false;
    } else { photo.hidden = true; }
    b.setAttribute("aria-label", j.etat === "membre" ? "Ton profil : " + j.pseudo
      : j.etat === "invite" ? "Tu joues en invité" : "Se connecter avec Discord");
    tous("[data-discord]").forEach(function (el) { el.hidden = el.dataset.discord !== (j.etat === "invite" ? "invite" : "dehors"); });
    var profil = $("profil-discord");
    if (j.etat === "membre") {
      profil.textContent = "";
      var c = document.createElement("span");
      c.className = "discord-connecte";
      c.textContent = "Connecté : " + j.pseudo;
      profil.append(c);
    }
    var champ = $("pseudo");
    champ.value = j.etat === "dehors" ? (window.CLASSEMENT ? window.CLASSEMENT.pseudo() : "") : j.pseudo;
    champ.disabled = j.etat !== "dehors";
    $("sortir").setAttribute("aria-label", j.etat === "dehors" ? "Retour à l'Atelier" : "Retour au Store du Bunker");
  }
  $("joueur-photo").addEventListener("error", function () { $("joueur-photo").hidden = true; $("joueur-initiale").textContent = joueur().pseudo.charAt(0); });
  function toucherJoueur(bouton) {
    var e = joueur().etat;
    if (e === "membre") { ouvrirTiroir("reglages", bouton); }
    else { ouvrirTiroir("discord", bouton); }
  }
  majJoueur();
  if (window.CLASSEMENT) {
    window.CLASSEMENT.demarrer();
    window.CLASSEMENT.pret.then(majJoueur);
  }
  $("pseudo").addEventListener("change", function () {
    if (!window.CLASSEMENT || joueur().etat !== "dehors") { return; }
    this.value = window.CLASSEMENT.changerPseudo(this.value) || window.CLASSEMENT.pseudo();
    son("interface/confirmation");
  });
  /* La flèche de l'accueil : au Bunker, c'est la page du Bunker qui ramène au Store. */
  $("sortir").addEventListener("click", function (ev) {
    if (window.CLASSEMENT && window.CLASSEMENT.sortir()) { ev.preventDefault(); }
  });

  /* ===== Les réglages ===== */
  function bascule(id, oui) {
    var e = $(id).querySelector(".etat");
    e.classList.toggle("oui", !!oui);
    e.textContent = oui ? e.dataset.oui : e.dataset.non;
  }

  // 1 · Son : les volumes, les vibrations, la musique (sons-bunker)
  if (Son) { Son.configurer({ prefixe: ID + ".", dossier: "assets/son/", canalJeu: !!JEU.volumeJeu }); }
  if (JEU.volumeJeu) { tous("[data-volume-jeu-nom]").forEach(function (l) { l.textContent = JEU.volumeJeu; }); }
  else { tous("[data-si-volume-jeu]").forEach(function (l) { l.remove(); }); }
  function majVolumes() {
    tous("[data-volume]").forEach(function (c) { c.value = Son ? Son.volume(c.dataset.volume) : 0; });
  }
  majVolumes();
  tous("[data-volume]").forEach(function (c) {
    c.addEventListener("input", function () {
      if (Son) { Son.volume(c.dataset.volume, +c.value); }
      tous('[data-volume="' + c.dataset.volume + '"]').forEach(function (autre) { if (autre !== c) { autre.value = c.value; } });
    });
    c.addEventListener("change", function () { son("interface/curseur"); });
  });
  bascule("r-vibrations", Son ? Son.vibrations() : true);

  var MUSIQUES = [{ nom: "Aucune", fichier: null }].concat(JEU.musiques || []);
  var piste = Math.max(0, MUSIQUES.findIndex(function (m) { return m.nom === lire("musique"); }));
  function majMusique(jouer) {
    tous("[data-musique-nom]").forEach(function (s) { s.textContent = MUSIQUES[piste].nom; });
    if (jouer && Son) { Son.musique(MUSIQUES[piste].fichier); }
  }
  majMusique(false);
  tous("[data-musique]").forEach(function (b) {
    if (MUSIQUES.length === 1) { b.disabled = true; var f = b.querySelector(".fleche"); if (f) { f.remove(); } }
  });

  // 2 · Affichage : plein écran, plein soleil, réduire les animations
  var ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var android = /Android/.test(navigator.userAgent);
  var installe = (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) || window.navigator.standalone === true;
  var pleinPossible = !!(document.fullscreenEnabled && document.documentElement.requestFullscreen) && !ios;
  if (installe) { tous("[data-plein]").forEach(function (b) { b.hidden = true; }); }
  function pleinEcran(bouton) {
    if (!pleinPossible) { ouvrirTiroir("installer", bouton); return; }
    if (document.fullscreenElement) { document.exitFullscreen().catch(function () {}); }
    else { document.documentElement.requestFullscreen().catch(function () { ouvrirTiroir("installer", bouton); }); }
  }
  document.addEventListener("fullscreenchange", function () { bascule("r-plein", !!document.fullscreenElement); });
  bascule("r-plein", false);

  function soleil(oui) { document.documentElement.dataset.soleil = oui ? "oui" : "non"; bascule("r-soleil", oui); }
  soleil(lire("soleil") === "oui");
  function calmeParDefaut() {
    var r = lire("animations");
    if (r === "reduites") { return true; }
    if (r === "normales") { return false; }
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }
  function calme(oui) { document.documentElement.dataset.calme = oui ? "oui" : "non"; bascule("r-calme", oui); }
  calme(calmeParDefaut());

  // 3 · Le jeu : le thème commun, puis les réglages propres au jeu
  var NOMS_THEMES = { bunker: "Bunker", neon: "Néon", papier: "Papier" };
  var theme = NOMS_THEMES[lire("theme")] ? lire("theme") : "bunker";
  function choisirTheme(t, dire) {
    theme = t;
    document.documentElement.dataset.theme = t;
    tous("[data-theme]").forEach(function (b) { if (b.tagName === "BUTTON") { b.setAttribute("aria-pressed", b.dataset.theme === t ? "true" : "false"); } });
    tous("[data-theme-nom]").forEach(function (s) { s.textContent = NOMS_THEMES[t]; });
    if (dire && typeof JEU.theme === "function") { JEU.theme(t); }
  }
  choisirTheme(theme, false);

  var REGLAGES = JEU.reglages || [];
  function reglageJeu(id) {
    var r = REGLAGES.find(function (x) { return x.id === id; });
    if (!r) { return undefined; }
    var v = lire("r." + id);
    return v === null ? !!r.defaut : v === "oui";
  }
  var avantRegles = $("reglages-jeu").firstElementChild;
  REGLAGES.forEach(function (r) {
    var b = document.createElement("button");
    b.className = "ligne";
    b.id = "rj-" + r.id;
    b.dataset.reglageJeu = r.id;
    var t = document.createElement("span");
    t.textContent = r.titre;
    var sm = document.createElement("small");
    sm.textContent = r.phrase || "";
    t.append(sm);
    var e = document.createElement("span");
    e.className = "etat";
    e.dataset.oui = r.oui || "Activé";
    e.dataset.non = r.non || "Coupé";
    b.append(t, e);
    $("reglages-jeu").insertBefore(b, avantRegles);
    bascule(b.id, reglageJeu(r.id));
  });

  // 5 · L'application : installer
  var invite = null;
  window.addEventListener("beforeinstallprompt", function (ev) { ev.preventDefault(); invite = ev; $("installer-direct").hidden = false; });
  $("installer-direct").addEventListener("click", function () {
    if (!invite) { return; }
    invite.prompt();
    invite = null;
    $("installer-direct").hidden = true;
  });
  tous("[data-appareil]").forEach(function (s) { s.hidden = !((s.dataset.appareil === "ios" && ios) || (s.dataset.appareil === "android" && android)); });

  /* ===== Le duel en ligne : la coque fait le tiroir, le jeu fait le réseau ===== */
  if (duelOk) {
    $("duel-creer").addEventListener("click", function () { JEU.duel.enLigne.creer(coque, function (texte) { $("duel-etat").textContent = texte; }); });
    $("duel-rejoindre").addEventListener("click", function () {
      var code = $("duel-code").value.trim().toUpperCase();
      if (!code) { son("interface/erreur"); $("duel-code").focus(); return; }
      JEU.duel.enLigne.rejoindre(code, coque, function (texte) { $("duel-etat").textContent = texte; });
    });
  }

  /* ===== Un seul écouteur pour tous les boutons ===== */
  document.addEventListener("click", function (ev) {
    var b = ev.target.closest("button");
    if (!b) {
      if (ev.target.matches("[data-voile]")) { fermerTout(); }
      return;
    }
    if (b.closest(".bornes-seuil")) { return; }
    if (b.id === "c-oui") { if (action) { action(); } return; }
    if (b.id === "joueur") { son("interface/appui"); toucherJoueur(b); return; }
    if (b.id === "r-vibrations") { var v = !Son.vibrations(); Son.vibrations(v); bascule(b.id, v); son(v ? "interface/bascule-oui" : "interface/bascule-non"); return; }
    if (b.id === "r-plein") { pleinEcran(b); return; }
    if (b.id === "r-soleil") { var s = document.documentElement.dataset.soleil !== "oui"; soleil(s); garder("soleil", s ? "oui" : "non"); son(s ? "interface/bascule-oui" : "interface/bascule-non"); return; }
    if (b.id === "r-calme") { var c = document.documentElement.dataset.calme !== "oui"; calme(c); garder("animations", c ? "reduites" : "normales"); son(c ? "interface/bascule-oui" : "interface/bascule-non"); return; }
    if (b.dataset.reglageJeu) {
      var id = b.dataset.reglageJeu, oui = !reglageJeu(id);
      garder("r." + id, oui ? "oui" : "non");
      bascule(b.id, oui);
      son(oui ? "interface/bascule-oui" : "interface/bascule-non");
      if (typeof JEU.reglage === "function") { JEU.reglage(id, oui); }
      return;
    }
    if (b.hasAttribute("data-musique")) { piste = (piste + 1) % MUSIQUES.length; garder("musique", MUSIQUES[piste].nom); majMusique(true); son("interface/choisir"); return; }
    if (b.dataset.theme) { choisirTheme(b.dataset.theme, true); garder("theme", b.dataset.theme); son("interface/choisir"); return; }
    if (b.hasAttribute("data-plein")) { pleinEcran(b); return; }
    if (b.hasAttribute("data-pause")) { son("interface/appui"); pause(b); return; }
    if (b.dataset.jouer) { son("interface/appui"); commencer(b.dataset.jouer); return; }
    if (b.hasAttribute("data-rejouer")) { son("interface/appui"); commencer(mode); return; }
    if (b.dataset.onglet) { onglet(b.dataset.onglet); }
    if (b.getAttribute("role") === "tab") {
      if (b.id === "t-infos") { onglet("infos"); }
      else if (b.id === "t-journal") { onglet("journal"); }
      son("interface/choisir");
      return;
    }
    if (b.dataset.aller) { son("interface/appui"); aller(b.dataset.aller); }
    else if (b.dataset.tiroir) { ouvrirTiroir(b.dataset.tiroir, b); }
    else if (b.hasAttribute("data-fermer")) { fermerTout(); }
    else if (b.hasAttribute("data-retour")) { son("interface/retour"); retour(); }
    else if (b.hasAttribute("data-accueil")) { son("interface/retour"); accueil(); }
    else if (b.dataset.confirmer) { son("interface/appui"); confirmer(b.dataset.confirmer, b); }
  });
  document.addEventListener("keydown", function (ev) {
    if (ev.key !== "Escape") { return; }
    if (ouvert) { fermerTout(); }
    else if (courant === "jeu" && enCours) { pause(null); }
  });

  /* ===== Le seuil du Bunker : noir, puis le logo avec son bruitage, puis l'accueil ===== */
  window.BornesSeuil.ouvrir({
    racine: "",
    titre: APP.nom,
    surSortie: function () { majVolumes(); if (MUSIQUES[piste].fichier) { majMusique(true); } }
  });
})();
