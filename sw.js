// 快取外殼頁面：沒網路時仍能開啟 App 並撥打校安專線
// 修改 index.html 後，把 v1 改成 v2、v3…，手機才會抓到新版
const CACHE = 'xiaoan-v1';
const FILES = ['./', './index.html', './manifest.json',
               './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

// 只處理本站檔案：先抓網路新版，失敗才用快取；Apps Script 表單不經過這裡
self.addEventListener('fetch', e => {
  if (new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return res; })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
