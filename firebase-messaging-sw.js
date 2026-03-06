// استدعاء مكتبات فايربيس (إصدار 8 المتوافق مع كودك)
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');

// تهيئة المشروع (نفس البيانات الموجودة في main.js)
firebase.initializeApp({
    apiKey: "AIzaSyDV7SNwgv_K10tX0iJpNYqg8_iJnWprFB4",
    projectId: "rgalab",
    messagingSenderId: "882288745140",
    appId: "1:882288745140:web:3c77b0f83ac4e11d30d5e1"
});

const messaging = firebase.messaging();

// استقبال الإشعارات في الخلفية (والتطبيق مغلق)
messaging.onBackgroundMessage(function(payload) {
    console.log('[firebase-messaging-sw.js] تم استلام إشعار في الخلفية', payload);
    
    // استخراج البيانات من الإشعار المرسل
    const notificationTitle = payload.notification?.title || payload.data?.title || 'إشعار جديد';
    const notificationOptions = {
        body: payload.notification?.body || payload.data?.body || '',
        icon: 'https://i.ibb.co/ch2FcQwj/IMG-4621.jpg',
        badge: 'https://i.ibb.co/b3bJc03/4041155-2.png',
        vibrate: [200, 100, 200, 100, 200, 100, 200],
        requireInteraction: true,
        data: {
            url: payload.data?.url || '/'
        }
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

// التعامل مع النقر على الإشعار
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            for (let i = 0; i < clientList.length; i++) {
                let client = clientList[i];
                if (client.url === event.notification.data.url && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(event.notification.data.url);
            }
        })
    );
});
