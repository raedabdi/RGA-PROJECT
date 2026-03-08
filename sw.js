const CACHE_NAME = 'rga-fit-v12'; // رفعنا النسخة عشان نكسر الكاش القديم

// 1. الملفات التي نريد حفظها للموبايل (Offline PWA)
const ASSETS = [
  '/',
  '/index.html',
  '/dashboard.html',
  '/style.css',
  '/main.js',
  '/manifest.json'
];

self.addEventListener('install', (e) => {
  self.skipWaiting(); // إجبار التحديث
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
  e.waitUntil(clients.claim());
});

// 2. كود التحميل السريع جداً 🚀
self.addEventListener('fetch', (e) => {
  // تجاهل طلبات فايربيس وقواعد البيانات عشان ما يعلق (مهم جداً)
  if (e.request.url.includes('firestore.googleapis.com') || 
      e.request.url.includes('firebasestorage.googleapis.com') ||
      e.request.url.includes('identitytoolkit.googleapis.com') ||
      e.request.url.includes('google.com')) {
      return;
  }
  
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});

// ----------------------------------------------------
// 3. استيراد الفايربيس والإشعارات (كودك الأصلي الممتاز)
// ----------------------------------------------------
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyDV7SNwgv_K10tX0iJpNYqg8_iJnWprFB4",
    authDomain: "rgalab.firebaseapp.com",
    projectId: "rgalab",
    storageBucket: "rgalab.firebasestorage.app",
    messagingSenderId: "882288745140",
    appId: "1:882288745140:web:3c77b0f83ac4e11d30d5e1"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
    if (!payload.data) return;
    const data = payload.data;
    
    // 🌍 محاولة استخراج اللغة بطريقة أذكى
    const sysLang = navigator.language || navigator.userLanguage || 'en';
    const isAr = sysLang.toLowerCase().includes('ar'); 

    let finalTitle = '';
    let finalBody = '';

    if (data.type === 'message') {
        finalTitle = isAr ? `رسالة من ${data.senderName}` : `Message from ${data.senderName}`;
        finalBody = data.text;
    } else if (data.type === 'throne_fall') {
        finalTitle = isAr ? '👑 سقوط العرش!' : '👑 Throne Fallen!';
        finalBody = isAr ? `الوحش ${data.newKingName} كسر رقمك بوزن ${data.newWeight}kg` : `Beast ${data.newKingName} broke your record: ${data.newWeight}kg`;
    } else if (data.type === 'friend_request') {
        finalTitle = isAr ? 'طلب صداقة' : 'Friend Request';
        finalBody = isAr ? `${data.senderName} أرسل لك طلب صداقة` : `${data.senderName} sent you a request`;
    } else {
        finalTitle = isAr ? 'إشعار جديد' : 'New Notification';
        finalBody = data.text || '';
    }

    const notificationOptions = {
        body: finalBody,
        icon: data.icon || 'https://i.ibb.co/ch2FcQwj/IMG-4621.jpg',
        badge: 'https://i.ibb.co/b3bJc03/4041155-2.png',
        vibrate: [200, 100, 200]
    };

    self.registration.showNotification(finalTitle, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
            if (windowClients.length > 0) {
                windowClients[0].focus();
            } else {
                clients.openWindow('/');
            }
        })
    );
});
