const CACHE = 'bamti-v0420';
const CORE = ['./', './index.html', './manifest.webmanifest', './restage-full-180.png','./restage-full-192.png','./restage-full-512.png','./night-sky.webp',
  './details.html','./run-v0416.js','./iconscan.js?v=0413','./recognition.js?v=0413', './finder.js', './seeds.json',
  ...['Normal','Crater','Mountaintop','Rotted','Noklateo','Hollow'].map(m => './'+m+'.webp')];
self.addEventListener('install', event => event.waitUntil(
  caches.open(CACHE).then(cache => cache.addAll(CORE.map(path => new Request(path, {cache: 'reload'})))).then(() => self.skipWaiting())
));
self.addEventListener('activate', event => event.waitUntil(
  caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('bamti-v') && k !== CACHE)
    .map(k => caches.delete(k)))).then(() => self.clients.claim())
));
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.registration.scope)) return;
  const url = new URL(event.request.url);
  const scope = self.registration.scope;
  const page = url.pathname === new URL(scope).pathname ? './index.html' :
    ['./index.html', './details.html'].find(path => new URL(path, scope).pathname === url.pathname);
  if (page && event.request.mode === 'navigate') {
    event.respondWith(loadPage(event.request, page));
    return;
  }
  event.respondWith(caches.open(CACHE).then(async cache => (await cache.match(event.request)) || fetch(event.request)));
});

async function loadPage(request, page) {
  try {
    const response = await fetch(request, {cache: 'no-store'});
    if (response.ok || response.status < 500) return response;
    return (await caches.match(page, {cacheName: CACHE})) || response;
  } catch (error) {
    const saved = await caches.match(page, {cacheName: CACHE});
    if (saved) return saved;
    throw error;
  }
}
