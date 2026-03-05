const CACHE_NAME = 'rga-fit-v2';
const ASSETS = [
  '/',
  '/index.html',
  '/dashboard.html',
  '/style.css',
  '/main.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// تثبيت التطبيق وتخزين الملفات الأساسية
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// التعامل مع الطلبات في حالة عدم وجود إنترنت
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});

// استقبال الإشعارات
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'RGA Fit', body: 'لديك تحدٍ جديد!' };
  const options = {
    body: data.body,
    icon: 'https://i.ibb.co/b3bJc03/4041155-2.png',
    badge: 'https://i.ibb.co/b3bJc03/4041155-2.png',
    vibrate: [100, 50, 100]
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});
