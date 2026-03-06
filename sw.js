const CACHE_NAME = 'rga-fit-v5'; // غيرنا النسخة
const ASSETS = ['/'];

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// ======================================================================
// 🚀 السحر هنا: استخدام الـ Push API الأصلي للمتصفح (لإجبار الآيفون)
// ======================================================================
self.addEventListener('push', function(event) {
    console.log('[Service Worker] Push Received.');
    
    let title = 'RGA Fit';
    let body = 'لديك إشعار جديد!';
    let icon = 'https://i.ibb.co/ch2FcQwj/IMG-4621.jpg';

    // محاولة فك تشفير رسالة الفايربيس
    if (event.data) {
        try {
            const payload = event.data.json();
            // الفايربيس يرسل البيانات إما في notification أو data
            if (payload.notification) {
                title = payload.notification.title || title;
                body = payload.notification.body || body;
            } else if (payload.data) {
                title = payload.data.title || title;
                body = payload.data.body || body;
            }
        } catch (e) {
            body = event.data.text(); // إذا كانت نصاً عادياً
        }
    }

    const options = {
        body: body,
        icon: icon,
        badge: 'https://i.ibb.co/b3bJc03/4041155-2.png',
        vibrate: [200, 100, 200, 100, 200], // رنة قوية
        requireInteraction: true // إجبار الإشعار على البقاء حتى يلمسه المستخدم
    };

    // إجبار نظام التشغيل (خصوصاً iOS) على إظهار الإشعار فوراً
    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// عند الضغط على الإشعار من الآيفون، يفتح التطبيق
self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(windowClients => {
            if (windowClients.length > 0) {
                let client = windowClients[0];
                client.focus();
                client.postMessage({ action: 'notification_clicked' });
            } else {
                clients.openWindow('/');
            }
        })
    );
});
