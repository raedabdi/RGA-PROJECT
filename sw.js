const CACHE_NAME = 'rga-fit-v9'; 
const ASSETS = ['/'];

self.addEventListener('install', (e) => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(clients.claim()));

// استيراد الفايربيس
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
    
    // فحص لغة هاتف المستخدم (إذا كانت تبدأ بـ en تعتبر إنجليزي، غير ذلك عربي)
    const isEn = navigator.language.toLowerCase().startsWith('en'); 

    let title = '';
    let body = '';

    // بناء النصوص حسب اللغة وبدون إيموجيات (باستثناء العرش)
    if (data.type === 'message') {
        title = isEn ? `Message from ${data.senderName}` : `رسالة من ${data.senderName}`;
        body = data.text;
    } else if (data.type === 'throne_fall') {
        title = isEn ? '👑 Throne Fallen' : '👑 سقوط العرش';
        body = isEn ? `Beast ${data.newKingName} broke your record with ${data.newWeight}kg` : `الوحش ${data.newKingName} كسر رقمك بوزن ${data.newWeight}kg`;
    } else if (data.type === 'friend_request') {
        title = isEn ? 'Friend Request' : 'طلب صداقة';
        body = isEn ? `${data.senderName} sent you a request` : `${data.senderName} أرسل لك طلب صداقة`;
    } else if (data.type === 'admin_alert' || data.type === 'pending_proof') {
        title = isEn ? 'Admin Message' : 'رسالة من الإدارة';
        body = data.text;
    }

    const notificationOptions = {
        body: body,
        icon: data.icon || 'https://i.ibb.co/ch2FcQwj/IMG-4621.jpg',
        badge: 'https://i.ibb.co/b3bJc03/4041155-2.png',
        vibrate: [200, 100, 200]
    };

    self.registration.showNotification(title, notificationOptions);
});

// فتح التطبيق عند النقر على الإشعار
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
