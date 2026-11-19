const CACHE = 'bamti-v047';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon.svg',
  './details.html','./run.js','./iconscan.js','./recognition.js', './finder.js', './seeds.json',
  ...['Normal','Crater','Mountaintop','Rotted','Noklateo','Hollow'].map(m => './'+m+'.webp')];
self.addEventListener('install', event => event.waitUntil(
  caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting())
));
self.addEventListener('activate', event => event.waitUntil(
  caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('bamti-v') && k !== CACHE)
    .map(k => caches.delete(k)))).then(() => self.clients.claim())
));
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.registration.scope)) return;
  event.respondWith(caches.open(CACHE).then(async cache => (await cache.match(event.request)) || fetch(event.request)));
});
