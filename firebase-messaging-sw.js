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
        icon: data.icon || 'https://i.ibb.co/ch2FcQwj/IMG-4621.jpg',
        badge: 'https://i.ibb.co/b3bJc03/4041155-2.png',
        vibrate: [200, 100, 200]
    };

    self.registration.showNotification(finalTitle, notificationOptions);
});