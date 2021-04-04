const staticCacheName = 'site-static-v5';
const dynamicCacheName = 'site-dynamic-v5';
const assets = [
  '/',
  'index.html',
  'audioknigi.html',
  'istorii-medisi.html',
  'izobolie-medisi.html',
  'krasivoetelosluboviyu.html',
  'muzikadlyameditaciy.html',
  'zdorovie-medisi.html',
  'app.js',
  'plugins/core.js',
  'plugins/siriwave.js',
  'plugins/player1.js',
  'plugins/player2.js',
  'plugins/player3.js',
  'plugins/player4.js',
  'linkCopy.js',
  'css/index.css',
  'css/styles1.css',
  'css/styles2.css',
  'css/styles3.css',
  'css/styles4.css',
  'css/istorii.jpg',
  'css/izobilie-medisi.jpg',
  'css/lubov-medisi.jpg',
  'css/zdorovie-medisi.jpg',
  'player1.html',
  'player2.html',
  'player3.html',
  'player4.html',
  'fallback.html',
  'logo50.png',
  'images/abundance.jpg',
  'images/health.jpg',
  'images/relationships.jpg',
  'images/sleep.jpg',
  'images/medisilogo.png',
  'images/audio-knigi-medisi.jpg',
  'images/istorii.jpg',
  'images/izobilie-medisi.jpg',
  'images/krasivor-telo-s-luboviyu-medisi.jpg',
  'images/krasivor-telo-s-luboviyu.jpg',
  'images/lubov-medisi.jpg',
  'images/muzika-dlya-meditacii-medisi.jpg',
  'images/zdorovie-medisi.jpg',
  'favicon.png',
  'meta/favicon-16x16.png',
  'meta/favicon-32x32.png',
  'meta/favicon-96x96.png'
];

// cache size limit function
const limitCacheSize = (name, size) => {
  caches.open(name).then(cache => {
    cache.keys().then(keys => {
      if(keys.length > size){
        cache.delete(keys[0]).then(limitCacheSize(name, size));
      }
    });
  });
};

// install event
self.addEventListener('install', evt => {
  console.log('service worker installed');
  evt.waitUntil(
    caches.open(staticCacheName).then((cache) => {
      console.log('caching shell assets');
      cache.addAll(assets);
    })
  );
});

// activate event
self.addEventListener('activate', evt => {
  console.log('service worker activated');
  evt.waitUntil(
    caches.keys().then(keys => {
      console.log(keys);
      return Promise.all(keys
        .filter(key => key !== staticCacheName && key !== dynamicCacheName)
        .map(key => caches.delete(key))
      );
    })
  );
});

// fetch events
self.addEventListener('fetch', evt => {
  if(evt.request.url.indexOf('admin@cluster0.milmt.mongodb.net') === -1){
    evt.respondWith(
      caches.match(evt.request).then(cacheRes => {
        return cacheRes || fetch(evt.request).then(fetchRes => {
          return caches.open(dynamicCacheName).then(cache => {
            cache.put(evt.request.url, fetchRes.clone());
            // check cached items size
            limitCacheSize(dynamicCacheName, 2);
            return fetchRes;
          })
        });
      }).catch(() => {
        if(evt.request.url.indexOf('.html') > -1){
          return caches.match('fallback.html');
        } 
      })
    );
  }
});
