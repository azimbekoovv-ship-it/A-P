/* A&P — облако: вход через Google и синхронизация (Firebase Auth + Firestore).
   Включается, только если заполнен firebase-config.js. SDK загружается с серверов Google по требованию. */
(function () {
  'use strict';
  const cfg = window.AP_FIREBASE_CONFIG;
  const VER = '10.12.2';
  const SDK = ['app', 'auth', 'firestore'].map(n => `https://www.gstatic.com/firebasejs/${VER}/firebase-${n}-compat.js`);
  const api = { configured: !!(cfg && cfg.apiKey && cfg.projectId), user: null };
  let ready = null, handlers = {}, unsub = null, auth = null, db = null;

  const loadScript = (src) => new Promise((res, rej) => {
    const s = document.createElement('script'); s.src = src; s.async = false;
    s.onload = res; s.onerror = () => rej(new Error('load ' + src)); document.head.appendChild(s);
  });
  async function load() {
    if (window.firebase && window.firebase.firestore && window.firebase.auth) return;
    for (const src of SDK) await loadScript(src);
  }
  const safeParse = (s) => { try { return JSON.parse(s); } catch (e) { return null; } };

  function onAuth(u) {
    if (unsub) { unsub(); unsub = null; }
    api.user = u ? { uid: u.uid, email: u.email, name: u.displayName } : null;
    if (handlers.onUser) handlers.onUser(api.user);
    if (!u) return;
    unsub = db.collection('users').doc(u.uid).onSnapshot((snap) => {
      if (snap.metadata && snap.metadata.hasPendingWrites) return;
      const d = snap.exists ? snap.data() : null;
      if (handlers.onRemote) handlers.onRemote(d ? { content: safeParse(d.data), updatedAt: d.updatedAt } : null);
    }, (err) => { if (handlers.onError) handlers.onError(err); });
  }

  api.init = function (h) {
    Object.assign(handlers, h || {});
    if (!api.configured) return Promise.reject(new Error('not configured'));
    if (!ready) {
      ready = (async () => {
        await load();
        const fb = window.firebase;
        if (!fb.apps.length) fb.initializeApp(cfg);
        auth = fb.auth(); db = fb.firestore();
        auth.onAuthStateChanged(onAuth);
      })();
      ready.catch(() => { ready = null; });
    }
    return ready;
  };
  api.signIn = async function () {
    const provider = new window.firebase.auth.GoogleAuthProvider();
    try { await auth.signInWithPopup(provider); }
    catch (e) {
      if (e && (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment')) await auth.signInWithRedirect(provider);
      else throw e;
    }
  };
  api.signOut = async function () { if (unsub) { unsub(); unsub = null; } if (auth) await auth.signOut(); };
  api.push = async function (content) {
    if (!api.user) throw new Error('not signed in');
    await db.collection('users').doc(api.user.uid).set({ data: JSON.stringify(content), updatedAt: Date.now(), app: 'A&P' });
  };
  window.APCloud = api;
})();
