/* Page de test du build rapide : le choix du thème et le bouton plein écran. Rien de tout ça n'est dans rapide.css. */
(function () {
  "use strict";
  var THEMES = [["glace", "Glace (actuel)"], ["braise", "Braise"], ["toxique", "Toxique"], ["vide", "Vide"], ["arctique", "Arctique (clair)"], ["contraste", "Contraste"]];
  var CLE = "bac-rapide-theme";
  var racine = document.documentElement;
  var connu = function (n) { return THEMES.some(function (t) { return t[0] === n; }); };
  function lire() {
    var h = (location.hash || "").slice(1);   // une adresse finissant par #braise ouvre ce thème
    if (connu(h)) return h;
    try { var v = localStorage.getItem(CLE); if (connu(v)) return v; } catch (e) { /* rien */ }
    return "glace";
  }
  function poser(n) {
    racine.setAttribute("data-theme", n);
    try { localStorage.setItem(CLE, n); } catch (e) { /* rien */ }
    try { history.replaceState(null, "", location.pathname + location.search + "#" + n); } catch (e) { /* rien */ }
  }
  poser(lire());

  var boite = document.createElement("div");
  boite.className = "bac-themes";
  boite.innerHTML = '<select aria-label="Thème de couleurs" title="Thème de couleurs">' + THEMES.map(function (t) { return '<option value="' + t[0] + '">' + t[1] + "</option>"; }).join("") + "</select>";
  var tete = document.querySelector("#rapide .rp-tete"), pe = document.querySelector("#rapide .rp-plein-ecran");
  if (tete) tete.insertBefore(boite, pe); else document.body.appendChild(boite);
  var sel = boite.querySelector("select");
  sel.value = racine.getAttribute("data-theme");
  sel.addEventListener("change", function () { poser(sel.value); });
  window.addEventListener("hashchange", function () { var h = (location.hash || "").slice(1); if (connu(h)) { racine.setAttribute("data-theme", h); sel.value = h; } });

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
})();
