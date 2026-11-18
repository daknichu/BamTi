const CACHE='bamti-v02';
const CORE=['./','./index.html','./manifest.webmanifest','./icon.svg'];
self.addEventListener('install',ev=>ev.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',ev=>ev.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',ev=>{const url=new URL(ev.request.url);if(url.origin!==location.origin||ev.request.method!=='GET')return;ev.respondWith(caches.match(ev.request).then(m=>m||fetch(ev.request)));});
