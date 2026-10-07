/* Asana Logistics service worker — offline app shell; API and portal traffic always go to the network */
const V='asana-shell-v15.13.0';
const SHELL=['./','./manifest.webmanifest','./fonts/fonts.css','./icons/icon-192.png','./icons/icon-512.png','./icons/icon.svg','./favicon.ico'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
 if(u.origin!==location.origin||u.pathname.startsWith('/api/')||u.pathname.startsWith('/p/'))return;
 if(r.mode==='navigate'||u.pathname==='/'||u.pathname.endsWith('/index.html')){
  /* network-first for the app itself so updates arrive immediately; cached copy when offline */
  e.respondWith(fetch(r).then(res=>{if(res.ok){const c=res.clone();caches.open(V).then(x=>x.put('./',c))}return res}).catch(()=>caches.match('./')));return}
 /* cache-first for fonts/icons */
 e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{if(res.ok&&/\/(fonts|icons)\//.test(u.pathname)){const c=res.clone();caches.open(V).then(x=>x.put(r,c))}return res})))});
