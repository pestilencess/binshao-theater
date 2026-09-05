/* 彬少剧场 · Service Worker：缓存全部资源，离线可玩 */
'use strict';
var CACHE = 'binshao-theater-v1';
var ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './js/art.js',
  './js/audio.js',
  './js/effects.js',
  './js/characters.js',
  './js/engine.js',
  './js/story1.js',
  './js/story2.js',
  './js/main.js',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) { return c.addAll(ASSETS); }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

/* 缓存优先，未命中则拉取并回填 */
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(function (cached) {
      if (cached) return cached;
      return fetch(e.request).then(function (resp) {
        var url = e.request.url;
        if (resp.ok && (url.indexOf(self.location.origin) === 0)) {
          var clone = resp.clone();
          caches.open(CACHE).then(function (c) { c.put(e.request, clone); });
        }
        return resp;
      });
    }).catch(function () { return caches.match('./index.html'); })
  );
});
