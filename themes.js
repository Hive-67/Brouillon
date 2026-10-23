/* Page de test du build rapide : le choix du thème et le bouton plein écran. Rien de tout ça n'est dans rapide.css. */
(function () {
  "use strict";
  var THEMES = [["cryo", "Cryo-élec."], ["solaire", "Solaire"], ["abyssal", "Abyssal"], ["stase", "Stase"], ["filobscur", "Filobscur"], ["prismatique", "Prismatique"], ["actuel", "Ancien look"]];
  var CLE = "bac-rapide-theme";
  var racine = document.documentElement;
  var connu = function (n) { return THEMES.some(function (t) { return t[0] === n; }); };
  var nomHash = function () { return (location.hash || "").slice(1).split("+")[0]; };
  function lire() {
    var h = nomHash();   // une adresse finissant par #solaire ouvre ce thème ; #solaire+rempli montre aussi la démo
    if (connu(h)) return h;
    try { var v = localStorage.getItem(CLE); if (connu(v)) return v; } catch (e) { /* rien */ }
    return "cryo";
  }
  function poser(n) {
    racine.setAttribute("data-theme", n);
    try { localStorage.setItem(CLE, n); } catch (e) { /* rien */ }
    try { history.replaceState(null, "", location.pathname + location.search + "#" + n + (rempli ? "+rempli" : "")); } catch (e) { /* rien */ }
  }
  var rempli = /\+rempli/.test(location.hash || "");
  poser(lire());

  var boite = document.createElement("div");
  boite.className = "bac-themes";
  boite.innerHTML = '<select aria-label="Thème de couleurs" title="Thème de couleurs">' + THEMES.map(function (t) { return '<option value="' + t[0] + '">' + t[1] + "</option>"; }).join("") + "</select>";
  var tete = document.querySelector("#rapide .rp-tete"), pe = document.querySelector("#rapide .rp-plein-ecran");
  if (tete) tete.insertBefore(boite, pe); else document.body.appendChild(boite);
  var sel = boite.querySelector("select");
  sel.value = racine.getAttribute("data-theme");
  sel.addEventListener("change", function () { poser(sel.value); });
  window.addEventListener("hashchange", function () { var h = nomHash(); if (connu(h)) { racine.setAttribute("data-theme", h); sel.value = h; } });

  /* Le plein écran, comme dans l'Arsenal : le bouton n'existe que si le navigateur le permet. */
  var plein = function () { return document.fullscreenElement || document.webkitFullscreenElement; };
  var permis = !!(document.fullscreenEnabled || document.webkitFullscreenEnabled);
  var bouton = document.querySelector("#rapide .rp-plein-ecran");
  if (!permis) {
    if (bouton) bouton.hidden = true;
    var note = document.createElement("div");
    note.className = "bac-note";
    note.textContent = "Plein écran : ce navigateur ne le permet pas (c'est le cas de l'iPhone). Sur iPad et ordinateur, il marche.";
    document.body.appendChild(note);
    setTimeout(function () { note.remove(); }, 9000);
  }
  function etat() {
    var b = document.querySelector("#rapide .rp-plein-ecran"); if (!b) return;
    var t = plein() ? "Quitter le plein écran" : "Plein écran";
    b.setAttribute("aria-pressed", String(!!plein())); b.setAttribute("aria-label", t); b.title = t;
  }
  document.addEventListener("click", function (ev) {
    if (!ev.target.closest || !ev.target.closest("#rapide .rp-plein-ecran")) return;
    var el = racine;
    if (plein()) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); return; }
    var r = (el.requestFullscreen || el.webkitRequestFullscreen).call(el);
    if (r && r.catch) r.catch(function () { /* refusé par le navigateur */ });
  });
  document.addEventListener("fullscreenchange", etat);
  document.addEventListener("webkitfullscreenchange", etat);

  /* Démo « rempli » (adresse finissant par +rempli) : pose des pastilles de couleur dans quelques emplacements pour voir les états pleins, ouverts, visés.
     Purement visuel, rien n'est enregistré, et ça n'existe pas dans l'Arsenal. */
  if (rempli) {
    var pastille = function (el, deg) { var i = document.createElement("i"); i.style.cssText = "display:block;width:100%;height:100%;border-radius:inherit;background:linear-gradient(" + deg + "deg,#ffffff55,transparent 45%),linear-gradient(" + deg + "deg,var(--f-a),var(--f-b))"; el.appendChild(i); };
    var R = document.querySelector("#rapide");
    R.querySelectorAll(".rp-arme > .rp-carre").forEach(function (b, k) { b.classList.add("plein"); pastille(b, 135 + 40 * k); });
    var rondes = R.querySelectorAll(".rp-arme .rp-rond"); for (var a = 0; a < rondes.length; a++) { if (a % 3 !== 2) { rondes[a].classList.add("plein"); pastille(rondes[a], 160); } }
    var exo = R.querySelector(".rp-carre.exo-libre"); exo.classList.add("plein", "exo"); pastille(exo, 140);
    R.querySelectorAll(".ct-s-ligne").forEach(function (l, i) { l.querySelectorAll(".ct-case").forEach(function (c, k) { if (k >= 2 && (i + k) % 2 === 0) { c.classList.remove("vide"); c.classList.add("mod"); pastille(c, 120 + 30 * k); } }); });
    R.querySelectorAll(".rp-stat-cell").forEach(function (s, i) { if (i < 4) { s.classList.add("pris"); s.querySelector(".rp-niveau").textContent = String(6 - i); } });
    var d = R.querySelector('[data-rp="doc"]'); d.classList.add("plein"); pastille(d, 150);
    var o = R.querySelector('[data-rp="perk-ouvrir"][data-rp-i="2"][data-rp-k="1"]'); if (o) o.classList.add("ouvert");
    var ar = R.querySelectorAll(".rp-ligne .rp-rond"); ar.forEach(function (r, i) { if (i < 5) { r.classList.add("plein"); pastille(r, 100 + 20 * i); } });
    var art = R.querySelector(".rp-carre.art"); if (art) { art.classList.add("plein"); pastille(art, 120); }
    var t = R.querySelector(".rp-temoin"); if (t) { t.textContent = "Pas enregistré"; t.dataset.etat = "non"; }
    var enr = R.querySelector(".rp-enregistrer"); if (enr) enr.disabled = false;
  }
})();
