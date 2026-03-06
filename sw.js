const CACHE_NAME = 'rga-fit-v4'; // تغيير رقم النسخة لتحديث الكاش
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
  self.skipWaiting(); // إجبار المتصفح على استخدام النسخة الجديدة فوراً
});

// التعامل مع الطلبات في حالة عدم وجود إنترنت
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});

// تفعيل السيرفيس وركر الجديد وحذف الكاش القديم
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
  self.clients.claim(); // السيطرة على كل الصفحات المفتوحة فوراً
});

// ------------------------------------------------------------------
// إعدادات إشعارات الفايربيس (Firebase Cloud Messaging) في الخلفية
// ------------------------------------------------------------------

// استيراد مكتبات الفايربيس (تأكد من نفس الإصدار 10.8.0)
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// نفس بيانات مشروعك بالضبط
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
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title || 'إشعار جديد';
  const notificationOptions = {
    body: payload.notification.body || 'لديك رسالة جديدة في التطبيق',
    icon: payload.notification.icon || 'https://i.ibb.co/ch2FcQwj/IMG-4621.jpg',
    badge: 'https://i.ibb.co/b3bJc03/4041155-2.png', // أيقونة صغيرة بيضاء (يُفضل أن تكون شفافة)
    vibrate: [200, 100, 200]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
