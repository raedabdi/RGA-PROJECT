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

// استقبال الإشعارات وعرضها
self.addEventListener('push', function(event) {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: 'https://i.ibb.co/ch2FcQwj/IMG-4621.jpg', // أيقونة الإشعار
            badge: 'https://i.ibb.co/b3bJc03/4041155-2.png', // الأيقونة الصغيرة في شريط الإشعارات
            vibrate: [200, 100, 200, 100, 200, 100, 200], // اهتزاز قوي ومميز (يعمل بقوة على الأندرويد)
            data: {
                url: data.url || '/' // الرابط الذي سيفتحه الإشعار
            },
            requireInteraction: true // الإشعار لن يختفي حتى يضغط عليه المستخدم (حركة مستفزة ومفيدة)
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// ماذا يحدث عندما يضغط المستخدم على الإشعار؟
self.addEventListener('notificationclick', function(event) {
    event.notification.close(); // إغلاق الإشعار
    
    // فتح التطبيق على الرابط المحدد
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            // إذا كان التطبيق مفتوحاً بالفعل، قم بالتركيز عليه
            for (let i = 0; i < clientList.length; i++) {
                let client = clientList[i];
                if (client.url === event.notification.data.url && 'focus' in client) {
                    return client.focus();
                }
            }
            // إذا كان مغلقاً، افتح نافذة جديدة
            if (clients.openWindow) {
                return clients.openWindow(event.notification.data.url);
            }
        })
    );
});
