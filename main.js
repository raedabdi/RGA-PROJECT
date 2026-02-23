// --- الروابط الجديدة للعبة ---
// ضيفه قبل ما تنادي الفانكشن


/* 
-----------------------------------------------------------
   RGA Fitness Pro - المحرك البرمجي الشامل (النسخة الكاملة)
   إصلاح: الظهور التدريجي, عداد الأرقام, ونظام التسجيل
   --- تمت إضافة ميزة "نسيت كلمة المرور" ---
   ----------------------------------------------------------- */

// 1. إعدادات Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDV7SNwgv_K10tX0iJpNYqg8_iJnWprFB4",
    authDomain: "rgalab.firebaseapp.com",
    projectId: "rgalab",
    storageBucket: "rgalab.firebasestorage.app",
    messagingSenderId: "882288745140",
    appId: "1:882288745140:web:3c77b0f83ac4e11d30d5e1"
};

// تهيئة Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

// 2. نظام التنبيهات (Toast Messages)
function showToast(message) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = 'position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); z-index: 9999; display: flex; flex-direction: column; align-items: center; gap: 10px;';
        document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.innerText = message;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 500);
    }, 4000);
}

// 3. وظيفة عداد الأرقام (Stats Counter)
function animateNumbers(targetElement) {
    const target = parseInt(targetElement.getAttribute('data-target'));
    const duration = 2000; // مدة الأنميشن بالملي ثانية
    const stepTime = Math.abs(Math.floor(duration / target));
    let current = 0;
    
    // تحديد سرعة الزيادة بناءً على حجم الرقم
    const increment = target > 1000 ? Math.ceil(target / 100) : 1;

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            targetElement.innerText = target.toLocaleString() + (targetElement.innerText.includes('+') ? '+' : '');
            clearInterval(timer);
        } else {
            targetElement.innerText = current.toLocaleString();
        }
    }, stepTime > 10 ? stepTime : 10);
}

// 4. مراقب التمرير والظهور (Intersection Observer)
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // إذا كان القسم يحتوي على أرقام إحصائية, ابدأ العداد
                const statNumbers = entry.target.querySelectorAll('.stat-number');
                statNumbers.forEach(num => {
                    if (!num.classList.contains('counted')) {
                        animateNumbers(num);
                        num.classList.add('counted');
                    }
                });
                
                // التوقف عن مراقبة العنصر بعد ظهوره
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    reveals.forEach(reveal => observer.observe(reveal));
}

// 5. إدارة واجهة المستخدم عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    // تفعيل نظام الظهور عند التمرير
    initScrollReveal();

    // تعريف المتغيرات للعناصر
    const modal = document.getElementById('auth-modal');
    const startBtn = document.getElementById('start-challenge-btn');
    const closeModalBtn = document.querySelector('.close-modal-btn');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const loginFormContainer = document.getElementById('login-form');
    const signupFormContainer = document.getElementById('signup-form');

    // فتح الـ Modal
    if (startBtn) {
        startBtn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.add('active');
        });
    }

    // إغلاق الـ Modal
    if (closeModalBtn) {
        closeModalBtn.onclick = () => modal.classList.remove('active');
    }

    // إغلاق الـ Modal عند الضغط خارجه
    window.onclick = (e) => {
        if (e.target === modal) modal.classList.remove('active');
    };

    // تبديل التبويبات (تسجيل الدخول / حساب جديد)
    if (tabBtns && loginFormContainer && signupFormContainer) {
        tabBtns.forEach(btn => {
            btn.onclick = () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const isLogin = btn.dataset.form === 'login';
                if (isLogin) {
                    loginFormContainer.classList.remove('hidden');
                    signupFormContainer.classList.add('hidden');
                } else {
                    loginFormContainer.classList.add('hidden');
                    signupFormContainer.classList.remove('hidden');
                }
            };
        });
    }

    // --- معالجة تسجيل الدخول (Login) ---
    const loginForm = document.getElementById('real-login-form');
    if (loginForm) {
        loginForm.onsubmit = async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;

            try {
                await auth.signInWithEmailAndPassword(email, password);
                showToast("✅ تم الدخول بنجاح! جاري تحويلك...");
                setTimeout(() => window.location.href = 'dashboard.html', 1500);
            } catch (error) {
                console.error(error);
                if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                    showToast("⚠️ الإيميل أو كلمة المرور غير صحيحة");
                } else {
                    showToast("⚠️ حدث خطأ: " + error.message);
                }
            }
        };
    }

    // --- معالجة إنشاء حساب جديد (Signup) المطور ---
        // --- معالجة إنشاء حساب جديد (Signup) المطور ---
    const signupForm = document.getElementById('real-signup-form');
    if (signupForm) {
        signupForm.onsubmit = async (e) => {
            e.preventDefault();
            const firstName = document.getElementById('signup-firstname').value.trim();
            const lastName = document.getElementById('signup-lastname').value.trim();
            const email = document.getElementById('signup-email').value.trim();
            const password = document.getElementById('signup-password').value;

            try {
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                
                // *** تعديل هنا ***
                await db.collection('users').doc(userCredential.user.uid).set({
                    firstName: firstName,
                    lastName: lastName,
                    fullName: firstName + " " + lastName,
                    email: email,
                    xp: 0,
                    rank: 1,
                    streak: 1,
                    // تم تغيير الاسم إلى lastActivityDate
                    lastLoginDate: new Date().toISOString().split('T')[0], 
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                showToast("🚀 تم إنشاء الحساب بنجاح!");
                setTimeout(() => window.location.href = 'dashboard.html', 1500);
            } catch (error) {
                console.error(error);
                showToast("⚠️ فشل التسجيل: " + error.message);
            }
        };
    }

    // --- *** الكود الجديد: معالجة نسيت كلمة المرور *** ---
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    if (forgotPasswordLink) {
        forgotPasswordLink.onclick = async (e) => {
            e.preventDefault();
            const email = prompt("الرجاء إدخال بريدك الإلكتروني المسجل لدينا:");

            if (email && email.trim() !== "") {
                try {
                    await auth.sendPasswordResetEmail(email.trim());
                    showToast("✅ تم إرسال رابط استعادة كلمة المرور إلى بريدك.");
                } catch (error) {
                    console.error("Password Reset Error:", error);
                    if (error.code === 'auth/user-not-found') {
                        showToast("⚠️ هذا البريد الإلكتروني غير مسجل.");
                    } else if (error.code === 'auth/invalid-email') {
                        showToast("⚠️ صيغة البريد الإلكتروني غير صحيحة.");
                    } else {
                        showToast("⚠️ حدث خطأ أثناء إرسال البريد.");
                    }
                }
            } else if (email !== null) { 
                 showToast("الرجاء إدخال بريد إلكتروني.");
            }
        };
    }

});

// 6. نظام الأكورديون (الأسئلة الشائعة)
document.querySelectorAll('.accordion-header').forEach(header => {
    header.onclick = () => {
        const item = header.parentElement;
        const isActive = item.classList.contains('active');
        
        document.querySelectorAll('.accordion-item').forEach(el => el.classList.remove('active'));
        
        if (!isActive) item.classList.add('active');
    };
});

// 7. تحريك خلفية النجوم (Stardust Canvas)
const canvas = document.getElementById('stardust-canvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let dots = [];

    function initCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        dots = [];
        for (let i = 0; i < 50; i++) {
            dots.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                size: Math.random() * 1.5 + 0.5
            });
        }
    }

    function animateCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "rgba(0, 242, 167, 0.6)";
        dots.forEach(d => {
            d.x += d.vx;
            d.y += d.vy;
            if (d.x < 0 || d.x > canvas.width) d.vx *= -1;
            if (d.y < 0 || d.y > canvas.height) d.vy *= -1;
            ctx.beginPath();
            ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
            ctx.fill();
        });
        requestAnimationFrame(animateCanvas);
    }

    window.addEventListener('resize', initCanvas);
    initCanvas();
    animateCanvas();
}

// 8. مغير اللغة (Language Switcher UI)
const langButton = document.querySelector('.lang-button');
const langOptions = document.querySelector('.lang-options');
if (langButton) {
    langButton.onclick = (e) => {
        e.stopPropagation();
        langOptions.classList.toggle('active');
    };
    document.onclick = () => langOptions.classList.remove('active');
}

