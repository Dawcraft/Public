/* 기억력게임 서비스워커 — 오프라인 캐시 */
const CACHE = 'memory-game-v1';
const ASSETS = [
  './',
  './memory-game.html',
  './manifest.webmanifest',
  './icon.svg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  // 같은 도메인의 다른 앱(예: 라이어 게임) 캐시는 건드리지 않고,
  // 내 앱('memory-game-')의 옛 버전만 정리한다. (캐시는 origin 단위 공유)
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k.startsWith('memory-game-') && k !== CACHE)
            .map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// 캐시 우선(cache-first), 없으면 네트워크 후 캐시에 저장
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((cached) =>
      cached ||
      fetch(e.request).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        return res;
      }).catch(() => cached)
    )
  );
});
