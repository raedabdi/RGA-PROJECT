const CACHE_NAME = 'rga-fit-v3';
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

// استيراد مكتبات الفايربيس لتعمل في الخلفية
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// نفس بيانات مشروعك للفايربيس
firebase.initializeApp({
    apiKey: "AIzaSyDV7SNwgv_K10tX0iJpNYqg8_iJnWprFB4",
    authDomain: "rgalab.firebaseapp.com",
    projectId: "rgalab",
    storageBucket: "rgalab.firebasestorage.app",
    messagingSenderId: "882288745140",
    appId: "1:882288745140:web:3c77b0f83ac4e11d30d5e1"
});

const messaging = firebase.messaging();

// استقبال الإشعارات والتطبيق مغلق أو يعمل في الخلفية
messaging.onBackgroundMessage(function(payload) {
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || 'https://i.ibb.co/ch2FcQwj/IMG-4621.jpg',
    badge: 'https://i.ibb.co/ch2FcQwj/IMG-4621.jpg',
    vibrate: [200, 100, 200]
  };

  // إظهار الإشعار في شريط الهاتف كالتطبيقات الرسمية
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// ⚠️ ابقِ على كود التخزين القديم في ملفك (الـ CACHE_NAME و install و fetch) كما هي في الأسفل.
