const CACHE_NAME = 'rga-fit-v16-corporate'; 
 
const ASSETS =[
  '/',
  '/index.html',
  '/corporate.css',
  '/corporate.js',
  '/Photos/Logo2.png',
  '/dashboard.html',
  '/style.css',
  '/main.js',
  '/manifest.json',
  '/body.png',
  '/Photos/icon1.JPEG',
  '/Photos/icon2.png',
  '/Photos/icon11.png'
];


self.addEventListener('install', (e) => {
  self.skipWaiting(); 
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

self.addEventListener('fetch', (e) => {

  if (e.request.url.includes('firestore.googleapis.com') || 
      e.request.url.includes('firebasestorage.googleapis.com') ||
      e.request.url.includes('identitytoolkit.googleapis.com') ||
      e.request.url.includes('google.com')) {
      return;
  }
  
  // Always try the latest HTML first; serve cached pages only while offline.
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, copy));
      }
      return response;
    }).catch(() => caches.match(e.request).then(response => response || caches.match('/index.html'))));
    return;
  }
  e.respondWith(caches.match(e.request).then(response => response || fetch(e.request)));
});


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
    
    let finalTitle = data.senderName ? `إشعار من ${data.senderName}` : 'إشعار جديد RGA Fit';
    let finalBody = data.text || '';
    
    if (data.type === 'throne_fall') {
        finalTitle = '👑 سقوط العرش!';
        finalBody = `الوحش ${data.newKingName} كسر رقمك بوزن ${data.newWeight}kg`;
    } else if (data.type === 'friend_request') {
        finalTitle = 'طلب صداقة';
        finalBody = `${data.senderName} أرسل لك طلب صداقة`;
    }

    const notificationOptions = {
        body: finalBody,
        icon: data.icon || '/Photos/icon1.JPEG',
        badge: '/Photos/icon2.png',
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
