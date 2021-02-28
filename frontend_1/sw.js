const staticCacheName = 'site-static-v4';
const dynamicCacheName = 'site-dynamic-v4';
const assets = [
  '/',
  'index.html',
  'app.js',
  'plugins/core.js',
  'plugins/siriwave.js',
  'plugins/player1.js',
  'plugins/player2.js',
  'plugins/player3.js',
  'plugins/player4.js',
  'css/index.css',
  'css/styles.css',
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
  'favicon.png',
  // 'meta/favicon-16x16.png',
  // 'meta/favicon-32x32.png',
  // 'meta/favicon-96x96.png',
  // 'medisiaudio_12.mp3',
  // 'medisiaudio_12.webm',
  // 'medisiaudio_13.webm',
  // 'medisiaudio_13.webm'
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
  if(evt.request.url.indexOf('mongodb.net') === -1){
    evt.respondWith(
      caches.match(evt.request).then(cacheRes => {
        return cacheRes || fetch(evt.request).then(fetchRes => {
          return caches.open(dynamicCacheName).then(cache => {
            cache.put(evt.request.url, fetchRes.clone());
            // check cached items size
            limitCacheSize(dynamicCacheName, 32);
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
