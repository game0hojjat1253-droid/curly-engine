// سرویس‌ورکر: فایل‌های برنامه را کش می‌کند تا بدون اینترنت باز شود. درخواست‌های API هرگز کش نمی‌شوند.
const VER = 'lifesim-v1';
// برنامه یک فایل index.html است؛ فقط فایل‌هایی که واقعاً وجود دارند (وگرنه addAll خطا می‌دهد و نصب شکست می‌خورد)
const ASSETS = [
  './', './index.html', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png', './icons/icon-maskable-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VER).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VER).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return; // API و بقیه: مستقیم از شبکه
  e.respondWith(
    fetch(req).then((res) => {
      if (res.ok) caches.open(VER).then((c) => c.put(req, res.clone()));
      return res;
    }).catch(() => caches.match(req).then((r) => r || caches.match('./index.html'))),
  );
});
