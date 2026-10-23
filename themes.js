/* Banc d'essai du build rapide : doctrine simulée, ancien look, plein écran, démo, et le sélecteur de variantes (spec du skill prototype).
   RIEN de tout cela n'existe dans l'Arsenal. Dans l'Arsenal, l'élément est déjà posé : document.body.dataset.element = DOCTRINES[id].adj.
   Adresse : /Brouillon/?v=2#cryo+rempli  (v = la variante 1 à 3 ; après # la doctrine ; +rempli pose la démo ; +long teste les noms très longs). */
(function () {
  "use strict";
  var CHOIX = [
    { v: "neutre", nom: "Sans doctrine", g: "Nouveau design", el: null },
    { v: "solaire", nom: "Doctrine solaire", g: "Nouveau design", el: "solaire" },
    { v: "cryo", nom: "Doctrine cryo-électrique", g: "Nouveau design", el: "cryo-électrique" },
    { v: "abyssal", nom: "Doctrine abyssale", g: "Nouveau design", el: "abyssal" },
    { v: "stase", nom: "Doctrine de stase", g: "Nouveau design", el: "stasique" },
    { v: "filobscur", nom: "Doctrine filobscure", g: "Nouveau design", el: "filobscur" },
    { v: "prismatique", nom: "Doctrine prismatique", g: "Nouveau design", el: "prismatique" },
    { v: "ancien", nom: "Glace (l'actuel)", g: "Ancien look", ancien: "glace" },
    { v: "ancien-braise", nom: "Braise", g: "Ancien look", ancien: "braise" },
    { v: "ancien-toxique", nom: "Toxique", g: "Ancien look", ancien: "toxique" },
    { v: "ancien-vide", nom: "Vide", g: "Ancien look", ancien: "vide" },
    { v: "ancien-arctique", nom: "Arctique (clair)", g: "Ancien look", ancien: "arctique" },
    { v: "ancien-contraste", nom: "Contraste", g: "Ancien look", ancien: "contraste" }
  ];
  var VARIANTES = ["Bunker", "Verre calme", "HUD"];
  var CLE = "bac-rapide-choix", par = {};
  CHOIX.forEach(function (c) { par[c.v] = c; });
  var racine = document.documentElement;
  var drapeaux = (location.hash || "").slice(1).split("+");
  var rempli = drapeaux.indexOf("rempli") >= 0 || drapeaux.indexOf("long") >= 0, long = drapeaux.indexOf("long") >= 0;
  var nomHash = function () { return (location.hash || "").slice(1).split("+")[0]; };
  var selects = [], courant = "neutre", ancienRempli = false, varCourante = 0;

  function lire() {
    var h = nomHash(); if (par[h]) return h;
    try { var v = localStorage.getItem(CLE); if (par[v]) return v; } catch (e) { /* rien */ }
    return "neutre";
  }
  function suffixe() { return (rempli ? (long ? "+long" : "+rempli") : ""); }
  function poser(v) {
    var c = par[v]; if (!c) return; courant = v;
    racine.setAttribute("data-look", c.ancien ? "ancien" : "nouveau");
    if (c.ancien) { racine.setAttribute("data-ancien", c.ancien); delete document.body.dataset.element; }
    else { racine.removeAttribute("data-ancien"); if (c.el) document.body.dataset.element = c.el; else delete document.body.dataset.element; }
    if (window.NV) { window.NV.doctrine(c.el); if (rempli && !c.ancien) window.NV.remplir(long); }
    if (rempli && c.ancien) remplirAncien();
    selects.forEach(function (s) { s.value = v; });
    if (picker) picker.hidden = !!c.ancien;
    try { localStorage.setItem(CLE, v); } catch (e) { /* rien */ }
    try { history.replaceState(null, "", location.pathname + location.search + "#" + v + suffixe()); } catch (e) { /* rien */ }
  }
  function pastille() {
    var p = document.createElement("div"); p.className = "bac-pastille";
    var groupes = {}, ordre = [];
    CHOIX.forEach(function (c) { if (!groupes[c.g]) { groupes[c.g] = []; ordre.push(c.g); } groupes[c.g].push('<option value="' + c.v + '">' + c.nom + "</option>"); });
    p.innerHTML = '<select aria-label="Doctrine simulée ou ancien look" title="Doctrine simulée ou ancien look">' + ordre.map(function (g) { return '<optgroup label="' + g + '">' + groupes[g].join("") + "</optgroup>"; }).join("") + "</select>";
    var s = p.querySelector("select"); selects.push(s); s.addEventListener("change", function () { poser(s.value); });
    return p;
  }
  var navNouveau = document.querySelector("#build .nv-nav"), pleinNouveau = document.querySelector("#build .nv-pleinecran");
  if (navNouveau) navNouveau.insertBefore(pastille(), pleinNouveau);
  var teteAncien = document.querySelector("#rapide .rp-tete"), pleinAncien = document.querySelector("#rapide .rp-plein-ecran");
  if (teteAncien) { var pa = pastille(); pa.style.margin = "0 2px"; teteAncien.insertBefore(pa, pleinAncien); }

  /* Le sélecteur de variantes : la spec du skill prototype (PICKER.md), en haut pour ne pas cacher la barre du bas. */
  var picker = document.createElement("nav");
  picker.className = "proto-picker"; picker.setAttribute("aria-label", "Variantes du design"); picker.setAttribute("data-position", "top");
  picker.innerHTML = '<span class="proto-picker-highlight" aria-hidden="true"></span>' + VARIANTES.map(function (n, i) { return '<button class="proto-picker-item"' + (i === 0 ? ' data-active aria-current="true"' : "") + ">" + n + "</button>"; }).join("");
  document.body.appendChild(picker);
  var highlight = picker.querySelector(".proto-picker-highlight"), items = [].slice.call(picker.querySelectorAll(".proto-picker-item"));
  function bougerSurlignage() { var el = items[varCourante]; highlight.style.width = el.offsetWidth + "px"; highlight.style.transform = "translateX(" + el.offsetLeft + "px)"; }
  function variante(i) {
    if (i < 0 || i >= VARIANTES.length) return; varCourante = i;
    racine.setAttribute("data-variante", ["bunker", "verre", "hud"][i]);
    items.forEach(function (el, j) { el.toggleAttribute("data-active", j === i); if (j === i) el.setAttribute("aria-current", "true"); else el.removeAttribute("aria-current"); });
    bougerSurlignage();
    var u = new URL(location.href); u.searchParams.set("v", i + 1); history.replaceState(null, "", u);
  }
  items.forEach(function (el, i) { el.addEventListener("click", function () { variante(i); }); });
  window.addEventListener("resize", bougerSurlignage);
  document.addEventListener("keydown", function (e) {
    if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable || e.metaKey || e.ctrlKey || e.altKey) return;
    var n = parseInt(e.key, 10);
    if (n >= 1 && n <= VARIANTES.length) variante(n - 1);
    else if (e.key === "ArrowRight") variante((varCourante + 1) % VARIANTES.length);
    else if (e.key === "ArrowLeft") variante((varCourante - 1 + VARIANTES.length) % VARIANTES.length);
  });
  variante((parseInt(new URLSearchParams(location.search).get("v"), 10) || 1) - 1);
  poser(lire());
  requestAnimationFrame(function () { requestAnimationFrame(function () { picker.setAttribute("data-ready", ""); }); });
  window.addEventListener("hashchange", function () { var h = nomHash(); if (par[h] && h !== courant) poser(h); });

  /* Le plein écran, comme dans l'Arsenal : le bouton n'existe que si le navigateur le permet. */
  var plein = function () { return document.fullscreenElement || document.webkitFullscreenElement; };
  var permis = !!(document.fullscreenEnabled || document.webkitFullscreenEnabled);
  function note(texte, ms) { var n = document.createElement("div"); n.className = "bac-note"; n.textContent = texte; document.body.appendChild(n); setTimeout(function () { n.remove(); }, ms); }
  if (!permis) {
    document.querySelectorAll(".nv-pleinecran, #rapide .rp-plein-ecran").forEach(function (b) { b.hidden = true; });
    note("Plein écran : ce navigateur ne le permet pas (c'est le cas de l'iPhone). Sur iPad et ordinateur, il marche.", 9000);
  } else { note("En haut : les 3 variantes (touches 1, 2, 3). La pastille de couleur choisit la doctrine ou l'ancien look.", 8000); }
  function etat() {
    var t = plein() ? "Quitter le plein écran" : "Plein écran";
    document.querySelectorAll(".nv-pleinecran, #rapide .rp-plein-ecran").forEach(function (b) { b.setAttribute("aria-pressed", String(!!plein())); b.setAttribute("aria-label", t); b.title = t; });
  }
  document.addEventListener("click", function (ev) {
    if (!ev.target.closest || !ev.target.closest(".nv-pleinecran, #rapide .rp-plein-ecran")) return;
    if (plein()) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); return; }
    var r = (racine.requestFullscreen || racine.webkitRequestFullscreen).call(racine);
    if (r && r.catch) r.catch(function () { /* refusé par le navigateur */ });
  });
  document.addEventListener("fullscreenchange", etat);
  document.addEventListener("webkitfullscreenchange", etat);

  /* Démo « rempli » de l'ancien look : des pastilles de couleur dans quelques emplacements. Purement visuel. */
  function remplirAncien() {
    if (ancienRempli) return; ancienRempli = true;
    var pas = function (el, deg) { var i = document.createElement("i"); i.style.cssText = "display:block;width:100%;height:100%;border-radius:inherit;background:linear-gradient(" + deg + "deg,#ffffff55,transparent 45%),linear-gradient(" + deg + "deg,#7fb3e8,#f3b04a)"; el.appendChild(i); };
    var R = document.querySelector("#rapide");
    R.querySelectorAll(".rp-arme > .rp-carre").forEach(function (b, k) { b.classList.add("plein"); pas(b, 135 + 40 * k); });
    var rondes = R.querySelectorAll(".rp-arme .rp-rond"); for (var a = 0; a < rondes.length; a++) { if (a % 3 !== 2) { rondes[a].classList.add("plein"); pas(rondes[a], 160); } }
    var exo = R.querySelector(".rp-carre.exo-libre"); exo.classList.add("plein", "exo"); pas(exo, 140);
    R.querySelectorAll(".ct-s-ligne").forEach(function (l, i) { l.querySelectorAll(".ct-case").forEach(function (c, k) { if (k >= 2 && (i + k) % 2 === 0) { c.classList.remove("vide"); c.classList.add("mod"); pas(c, 120 + 30 * k); } }); });
    R.querySelectorAll(".rp-stat-cell").forEach(function (s, i) { if (i < 4) { s.classList.add("pris"); s.querySelector(".rp-niveau").textContent = String(6 - i); } });
    var d = R.querySelector('[data-rp="doc"]'); d.classList.add("plein"); pas(d, 150);
    var t = R.querySelector(".rp-temoin"); if (t) { t.textContent = "Pas enregistré"; t.dataset.etat = "non"; }
    var enr = R.querySelector(".rp-enregistrer"); if (enr) enr.disabled = false;
  }
})();
