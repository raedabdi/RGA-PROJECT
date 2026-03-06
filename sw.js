const CACHE_NAME = 'rga-fit-v7'; 
const ASSETS = [
  '/',
  '/index.html',
  '/dashboard.html',
  '/style.css',
  '/main.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting(); // مهم جداً للآيفون لتحديث الكود فوراً
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim(); // السيطرة على المتصفح فوراً
});

// استيراد مكتبات الفايربيس 
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// بيانات مشروعك للفايربيس
firebase.initializeApp({
    apiKey: "AIzaSyDV7SNwgv_K10tX0iJpNYqg8_iJnWprFB4",
    authDomain: "rgalab.firebaseapp.com",
    projectId: "rgalab",
    storageBucket: "rgalab.firebasestorage.app",
    messagingSenderId: "882288745140",
    appId: "1:882288745140:web:3c77b0f83ac4e11d30d5e1"
});

const messaging = firebase.messaging();

// استقبال الإشعارات والتطبيق مغلق
messaging.onBackgroundMessage(function(payload) {
  const notificationTitle = payload.notification.title || 'إشعار جديد';
  const notificationOptions = {
    body: payload.notification.body || 'لديك تنبيه في التطبيق',
    icon: payload.notification.icon || 'https://i.ibb.co/ch2FcQwj/IMG-4621.jpg',
    badge: 'https://i.ibb.co/b3bJc03/4041155-2.png',
    vibrate: [200, 100, 200]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
