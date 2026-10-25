/* ══════════════════════════════════════════════════════════════════
   LE CLASSEMENT PARTAGÉ DES JEUX HIVETOOLS — lot 59 de panique-depot.

   COPIE DE PONT (lot 117) — le fichier de panique-depot, recopié, avec
   UNE extension compatible : les STATS de la partie. Rien d'autre ne
   change : même projet, même collection, mêmes documents `<jeu>__<uid>`,
   même lecture triée. Un jeu qui n'envoie pas de stats (Panique) écrit
   exactement ce qu'il écrivait.
     CLASSEMENT.envoyer(jeu, score, stats)   `stats` facultatif :
         { temps, boss, mobs, bonus } — des nombres entiers, rangés à
         côté des quatre champs. Si Firebase les refuse (règles du lot 63
         de Panique, qui n'admettent que jeu, pseudo, score, date), le
         score repart SANS elles : le classement marche quand même, les
         lignes n'ont simplement pas leurs détails. Le refus est retenu
         pour la session (pas deux essais par partie).
     CLASSEMENT.lire(jeu, n)  → [{ pseudo, score, temps?, boss?, mobs?, bonus? }]

   Un seul classement pour tous les jeux (projet Firebase
   `hivetools-classement`, décidé par Hive sur `hub` le 27/09/2026) :
   une collection Firestore `scores` — depuis le lot 63, UN document par
   joueur et par jeu, `<jeu>__<uid>`, { jeu, pseudo, score, date }, qui
   ne change que pour un meilleur score. Chaque jeu ne lit que les siens,
   grâce à `jeu`. Lecture libre ; écriture seulement bien formée, jamais
   à la baisse, jamais effacée — ce sont les règles côté Firebase qui
   protègent, pas le secret de la config ci-dessous, publique par
   construction.

   COPIE DU KIT (HiveSkills, store-jeu-bunker/kit, 25/10/2026) : le fichier
   de PONT, plus `pret` et `joueur()` tout en bas, pour le rond du joueur.

   ÉCRIT POUR ÊTRE REPRIS TEL QUEL par un autre jeu (PONT d'abord) : ce
   fichier ne connaît aucun jeu. Il s'utilise par `window.CLASSEMENT` :
     CLASSEMENT.demarrer()            connexion anonyme, en arrière-plan
     CLASSEMENT.pseudo()              le pseudo gardé sur l'appareil, ou ''
     CLASSEMENT.changerPseudo(texte)  le nettoie, le garde, le rend ('' si vide)
     CLASSEMENT.envoyer(jeu, score)   → promesse : 'record', 'garde' (pas mieux) ou false
     CLASSEMENT.lire(jeu, n)          → promesse : [{ pseudo, score }] ou null
   Rien ne lève d'erreur vers le jeu : hors ligne, en double-clic sans
   réseau, si Firebase ne répond pas, on obtient false ou null, et le jeu
   continue sans classement.

   SANS BUILD NI NPM (§3 du contrat) : Firebase arrive par ses scripts
   officiels « compat », posés dans la page seulement au premier besoin,
   depuis le CDN de Google. Ils définissent `firebase`, rien d'autre.
   ══════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  const VERSION = '10.14.1';
  const CDN = 'https://www.gstatic.com/firebasejs/' + VERSION + '/';
  const CONFIG = {
    apiKey: "AIzaSyA_P0SEOKNKuTfqD65z7Z7Nfhw8NuQW9fc",
    authDomain: "hivetools-classement.firebaseapp.com",
    projectId: "hivetools-classement",
    storageBucket: "hivetools-classement.firebasestorage.app",
    messagingSenderId: "32018657674",
    appId: "1:32018657674:web:d0531f3e6f16704e3cd873"
  };
  /* Le même pseudo pour tous les jeux du site : `localStorage` est
     propre à l'adresse, et tous les jeux publiés partagent la même. */
  const CLE_PSEUDO = 'hivetools-pseudo';
  const PSEUDO_MAX = 16;
  const ATTENTE = 8000;           // ms : au-delà, on renonce sans rien dire
  /* Une lecture du classement coûte jusqu'à quelques centaines de
     lectures Firestore (le plan gratuit en donne 50 000 par jour) : on
     la garde une minute, et on l'oublie dès qu'un score est posé. */
  const GARDE = 60000;
  const memoire = {};

  const charger = (src) => new Promise((ok, non) => {
    const s = document.createElement('script');
    s.src = src; s.async = false;
    s.onload = ok; s.onerror = non;
    document.head.appendChild(s);
  });
  const avant = (promesse, ms) => Promise.race([
    promesse, new Promise((_, non) => setTimeout(() => non(new Error('délai')), ms))
  ]);

  /* La base, une fois connectée : une seule tentative à la fois. Un échec
     (pas de réseau) n'est pas définitif — l'appel suivant réessaie. */
  let enCours = null;
  function demarrer(){
    if (enCours) return enCours;
    enCours = (async () => {
      if (!window.firebase || !firebase.firestore){
        await charger(CDN + 'firebase-app-compat.js');
        await charger(CDN + 'firebase-auth-compat.js');
        await charger(CDN + 'firebase-firestore-compat.js');
      }
      if (!firebase.apps.length) firebase.initializeApp(CONFIG);
      if (!firebase.auth().currentUser) await avant(firebase.auth().signInAnonymously(), ATTENTE);
      return firebase.firestore();
    })().catch(() => { enCours = null; return null; });
    return enCours;
  }

  function pseudo(){
    try { return localStorage.getItem(CLE_PSEUDO) || ''; } catch (e) { return ''; }
  }
  // court, sur une ligne, sans caractères de contrôle ; la page l'écrit
  // toujours en texte (`textContent`), jamais en HTML
  function nettoyer(texte){
    return String(texte || '').replace(/[\u0000-\u001f\u007f]/g, '')
      .replace(/\s+/g, ' ').trim().slice(0, PSEUDO_MAX).trim();
  }
  function changerPseudo(texte){
    const p = nettoyer(texte);
    if (p){ try { localStorage.setItem(CLE_PSEUDO, p); } catch (e) {} }
    return p;
  }

  /* LOT 63 (consigne) : UN SEUL DOCUMENT PAR JOUEUR ET PAR JEU, son
     meilleur score, identifiant `<jeu>__<uid>` (`uid` = la connexion
     anonyme, gardée par Firebase sur l'appareil). Première partie : il
     est créé. Ensuite, il n'est remplacé QUE par un score strictement
     meilleur — sinon rien n'est écrit. Exactement les quatre champs des
     règles, `date` posée par le serveur (une date d'ici serait refusée).
     LES RÈGLES FIRESTORE REFUSENT TOUTE MISE À JOUR SANS MEILLEUR SCORE,
     y compris pour le seul pseudo : un pseudo changé n'apparaît donc au
     classement qu'au prochain record.
     Réponse : 'record' (posé), 'garde' (pas mieux, rien à écrire), ou
     false (hors ligne, refusé par les règles…). */
  const STATS = ['temps', 'boss', 'mobs', 'bonus'];
  let statsRefusees = false;
  async function envoyer(jeu, score, stats){
    const p = pseudo();
    if (!p || !(score >= 0)) return false;
    const db = await demarrer();
    if (!db) return false;
    try {
      const uid = firebase.auth().currentUser && firebase.auth().currentUser.uid;
      if (!uid) return false;
      const ref = db.collection('scores').doc(String(jeu) + '__' + uid);
      const actuel = await avant(ref.get(), ATTENTE);
      const s = Math.floor(score);
      if (actuel.exists && typeof actuel.data().score === 'number' && s <= actuel.data().score) return 'garde';
      const base = {
        jeu: String(jeu),
        pseudo: p,
        score: s,
        date: firebase.firestore.FieldValue.serverTimestamp()
      };
      const complet = Object.assign({}, base);
      if (stats && !statsRefusees)
        for (const k of STATS) if (stats[k] >= 0) complet[k] = Math.floor(stats[k]);
      try {
        await avant(ref.set(complet), ATTENTE);
      } catch (e) {
        // les stats refusées par les règles : le score seul, comme Panique
        if (!(e && e.code === 'permission-denied') || Object.keys(complet).length === 4) throw e;
        statsRefusees = true;
        await avant(ref.set(base), ATTENTE);
      }
      delete memoire[String(jeu)];
      return 'record';
    } catch (e) { return false; }
  }

  /* LOT 67 (consigne) : UNE VRAIE REQUÊTE TRIÉE. Hive a créé dans
     Firebase l'index composé (`jeu` croissant, `score` décroissant) :
     le classement se lit filtré sur le jeu, trié par score, limité aux
     `n` premiers — plus de lecture massive ni de tri côté jeu. Un seul
     garde-fou reste, sur ces `n` lignes seulement : une ligne par pseudo
     (les documents d'avant le lot 63, un par partie, sont encore dans le
     général, et un joueur sur deux appareils a deux connexions).
     SECOURS : tant que l'index n'est pas prêt (Firebase le construit en
     quelques minutes) ou s'il disparaît, la requête triée est refusée —
     on retombe alors sur l'ancienne méthode (tous les documents du jeu,
     triés ici), sans rien montrer au joueur. */
  const unParPseudo = (docs) => {
    const vus = new Set(), liste = [];
    for (const d of docs){
      const s = d.data();
      if (typeof s.pseudo !== 'string' || typeof s.score !== 'number') continue;
      const cle = s.pseudo.toLowerCase();
      if (vus.has(cle)) continue;
      vus.add(cle);
      const ligne = { pseudo: s.pseudo, score: s.score };
      for (const k of STATS) if (typeof s[k] === 'number') ligne[k] = s[k];   // copie PONT
      liste.push(ligne);
    }
    return liste;
  };
  async function lire(jeu, n){
    n = n || 30;
    const m = memoire[String(jeu)];
    if (m && Date.now() - m.t < GARDE && m.n >= n) return m.liste.slice(0, n);
    const db = await demarrer();
    if (!db) return null;
    const scores = db.collection('scores').where('jeu', '==', String(jeu));
    let liste;
    try {
      liste = unParPseudo((await avant(scores.orderBy('score', 'desc').limit(n).get(), ATTENTE)).docs);
    } catch (e) {
      try {
        const docs = (await avant(scores.limit(1000).get(), ATTENTE)).docs.slice()
          .sort((x, y) => (y.data().score || 0) - (x.data().score || 0));
        liste = unParPseudo(docs).slice(0, n);
      } catch (e2) { return null; }
    }
    memoire[String(jeu)] = { t: Date.now(), n, liste };
    return liste.slice(0, n);
  }

  /* ════════════════════════════════════════════════════════════════
     LOT 148 : DANS UNE FENÊTRE DU BUNKER, LE CLASSEMENT DES MEMBRES.
     Hive, 20/10/2026 : « Oui je veux la connexion discord ». Le site du
     Bunker montre PONT dans une fenêtre intégrée (son `netlify.toml`
     l'autorise, lot 61 du hub) et range les scores sous le compte
     Discord du joueur. Ce fichier le sait par une poignée de main : il
     dit bonjour à la page qui le contient, SEULEMENT si elle est à l'une
     des deux adresses du Bunker (un `postMessage` adressé à une autre
     origine n'est jamais remis), et n'écoute que leurs réponses. Pas de
     réponse en 1,5 s, ou pas de fenêtre du tout : on reste chez nous,
     Firebase, entre amis, exactement comme avant.
     Côté Bunker, plus de pseudo à taper : c'est celui de Discord. Un
     joueur qui n'est pas membre joue quand même, sous « Invité », et
     son score n'est pas classé (la page du Bunker l'invite à entrer).
     Trois fonctions de plus, sans effet chez nous : `partie(jeu)`, que
     le jeu appelle au départ d'une partie classée (le Bunker y demande
     son jeton, qui date le début de la partie) ; `auBunker()`, vrai dans
     une fenêtre du Bunker (le jeu n'y demande pas de pseudo) ;
     `sortir()`, la porte de l'accueil : c'est la page du Bunker qui
     ramène au Store.
     ════════════════════════════════════════════════════════════════ */
  const BUNKER = ['https://bunkerwebb.netlify.app', 'https://chantier--bunkerwebb.netlify.app'];
  const CANAL = 'bunker-classement';
  let bunker = null;               // { origine, pseudo, membre } une fois l'accueil reçu
  let numero = 0;
  const attentes = {};

  const ecouter = (ev) => {
    if (BUNKER.indexOf(ev.origin) === -1 || ev.source !== window.parent) return;
    const m = ev.data;
    if (!m || m.canal !== CANAL) return;
    if (m.type === 'accueil'){
      bunker = { origine: ev.origin, pseudo: nettoyer(m.pseudo) || 'Membre', membre: m.membre === true,
                 // PONT lot 154 : la photo Discord, si la page du Bunker l'envoie (une adresse https seulement)
                 avatar: typeof m.avatar === 'string' && /^https:\/\//.test(m.avatar) ? m.avatar : '' };
      if (finAccueil) finAccueil();
    } else if (m.type === 'reponse' && attentes[m.id]){
      attentes[m.id](m);
      delete attentes[m.id];
    }
  };
  let finAccueil = null;
  const accueil = (window.parent && window.parent !== window)
    ? new Promise((ok) => {
        window.addEventListener('message', ecouter);
        finAccueil = () => { finAccueil = null; ok(true); };
        BUNKER.forEach((o) => { try { window.parent.postMessage({ canal: CANAL, type: 'bonjour' }, o); } catch (e) {} });
        setTimeout(() => { if (finAccueil){ finAccueil = null; ok(false); } }, 1500);
      })
    : Promise.resolve(false);

  const auBunker = (message) => new Promise((ok) => {
    const id = ++numero;
    attentes[id] = ok;
    window.parent.postMessage(Object.assign({ canal: CANAL, id }, message), bunker.origine);
    setTimeout(() => { if (attentes[id]){ delete attentes[id]; ok({}); } }, ATTENTE + 2000);
  });

  window.CLASSEMENT = {
    demarrer: () => accueil.then((chezBunker) => chezBunker ? true : demarrer()),
    pseudo: () => bunker ? (bunker.membre ? bunker.pseudo : 'Invité') : pseudo(),
    changerPseudo: (texte) => bunker ? window.CLASSEMENT.pseudo() : changerPseudo(texte),
    envoyer: (jeu, score, stats) => accueil.then((chezBunker) => !chezBunker ? envoyer(jeu, score, stats)
      : auBunker({ type: 'envoyer', jeu: String(jeu), score, stats: stats || null })
          .then((r) => r.resultat === 'record' || r.resultat === 'garde' ? r.resultat : false)),
    lire: (jeu, n) => accueil.then((chezBunker) => !chezBunker ? lire(jeu, n)
      : auBunker({ type: 'lire', jeu: String(jeu), n: n || 30 })
          .then((r) => Array.isArray(r.lignes) ? r.lignes : null)),
    partie: (jeu) => { accueil.then((chezBunker) => { if (chezBunker) auBunker({ type: 'partie', jeu: String(jeu) }); }); },
    auBunker: () => !!bunker,
    avatar: () => bunker && bunker.membre ? bunker.avatar : '',
    sortir: () => { if (!bunker) return false; window.parent.postMessage({ canal: CANAL, type: 'sortir' }, bunker.origine); return true; },
    /* KIT DU STORE JEU BUNKER (HiveSkills, 25/10/2026) : deux ajouts pour le rond
       du joueur, sans rien changer au reste. `pret` : la promesse de la poignée
       de main (vrai dans une fenêtre du Bunker). `joueur()` : { etat, pseudo,
       avatar }, etat valant 'dehors' (pas de Bunker), 'invite' (au Bunker, pas
       membre ou pas connecté) ou 'membre'. */
    pret: accueil,
    joueur: () => !bunker ? { etat: 'dehors', pseudo: pseudo(), avatar: '' }
      : { etat: bunker.membre ? 'membre' : 'invite', pseudo: bunker.membre ? bunker.pseudo : 'Invité', avatar: bunker.membre ? bunker.avatar : '' },
    PSEUDO_MAX
  };
})();
