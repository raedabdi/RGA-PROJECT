// --- الروابط الجديدة للعبة ---
const LIFT_IMG_DOWN = "https://i.ibb.co/zW74jkmK/IMG-4239.png";
const LIFT_IMG_UP = "https://i.ibb.co/zVkNkjfZ/IMG-4238.png";

// --- إعدادات Firebase ---
const fbPart1 = "AIzaSyDV7SNwgv_";
const fbPart2 = "K10tX0iJpNYqg8_iJnWprFB4";

const firebaseConfig = {
    apiKey: fbPart1 + fbPart2,
    authDomain: "rgalab.firebaseapp.com",
    projectId: "rgalab",
    storageBucket: "rgalab.firebasestorage.app",
    messagingSenderId: "882288745140",
    appId: "1:882288745140:web:3c77b0f83ac4e11d30d5e1"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// --- إعدادات Groq AI ---
const part1 = "gsk_eMTl37P6";
const part2 = "ggnYTFOIhBchWGdyb3FYjhW2aliBOIz9XHrUbJuJsxFL";
const GROQ_KEY = part1 + part2;

// --- المتغيرات العامة ---
let chatHistory = [];
let lang = 'ar';
let authMode = 'login';
const DEFAULT_AVATAR = "https://i.ibb.co/9mPmHXkh/cropped-circle-image-2.png";
let xp = 0;
let streak = 0;
let stamina = 100;
const MAX_STAMINA = 100;
let xpMultiplier = 1;
let ownedItems = JSON.parse(localStorage.getItem('rga_owned')) || [];
let userAvatarUrl = localStorage.getItem('rga_avatar') || DEFAULT_AVATAR;
let myShortId = "";
let currentFriendId = null;
let chatUnsubscribe = null;
let notifUnsubscribe = null;
let rankUnsubscribe = null;
let workoutDays = [];
let lastWorkoutDate = null;
let tempLoggedExercises = [];
let currentMuscleGroup = "";
let performanceChart = null;
let hubMuscleChart = null;

let staminaRegenRate = 5 * 60 * 1000; // الافتراضي: 5 دقائق
let staminaBoostEndTime = 0; // وقت انتهاء تسريع الطاقة
let xpBoostEndTime = 0; // وقت انتهاء دبل XP
let regenInterval; // مؤقت لتحديث العداد
let boosterInterval; // مؤقت لتحديث البوستر


// --- متغيرات التحدي PvP (الجديدة) ---
let activePvPMode = false;
let currentPvPId = null;
let pvpOpponentScore = 0;

// --- الأصوات ---
const sounds = {
    click: new Audio('https://cdn.pixabay.com/audio/2022/03/15/audio_c8c8a73467.mp3'),
    success: new Audio('https://cdn.pixabay.com/audio/2021/08/04/audio_12b0c7443c.mp3'),
    error: new Audio('https://cdn.pixabay.com/audio/2021/08/04/audio_c6ccf3232f.mp3'),
    levelUp: new Audio('https://cdn.pixabay.com/audio/2021/08/09/audio_8dd987c699.mp3'),
    coin: new Audio('https://cdn.pixabay.com/audio/2021/08/09/audio_9c03780a69.mp3')
};

// --- النصوص ---
const trans = {
    ar: {
        authLogin: "تسجيل الدخول", authSignup: "إنشاء حساب جديد", authBtnL: "دخول", authBtnS: "إنشاء الحساب",
        authLinkS: "ليس لديك حساب؟ سجل الآن", authLinkL: "لديك حساب؟ سجل دخول", forgot: "نسيت كلمة السر؟", emailPl: "البريد الإلكتروني", passPl: "كلمة المرور",
        fnamePl: "الاسم الأول", lnamePl: "اسم العائلة", verifyMsg: "تم إرسال رابط التحقق لبريدك!", weight: "الوزن (كغ)", height: "الطول (سم)", age: "العمر", male: "ذكر", female: "أنثى", calc: "تحليل وحفظ البيانات",
        bmi: "مؤشر كتلة الجسم", water: "احتياج الماء الكلي", waterTrack: "💧 سجل الماء اليومي:", l: "لتر", kg: "كغ", ideal: "الوزن المثالي",
        maintain: "ثبات الوزن", lose: "تنشيف (0.5كغ)", gain: "تضخيم (0.5كغ)",
        act1: "خامل (بدون تمرين)", act2: "خفيف (1-3 أيام تمرين)", act3: "متوسط (3-5 أيام تمرين)", act4: "عالي (6-7 أيام تمرين)",
        status: ["نحافة", "وزن مثالي", "وزن زائد", "سمنة"], calText: "سعرة", secCal: "السعرات الحرارية", share: "مشاركة النتائج 🚀",
        modalText: "مرحباً بك! لضمان خصوصيتك، نقوم بمعالجة بياناتك محلياً.", modalBtn: "أوافق، دعنا نبدأ", missions: "🎯 مهمات اليوم",
        m1: "🏋️‍♂️ يوم تمرين", m2: "🥗 وجبة صحية", m3: "🧘‍♂️ يوم راحة",
        ranks: ["مجند", "عريف", "مقاتل", "وحش", "أسطورة"], streakShare: "تحدي الأصدقاء 🔥", streakTxt: "أيام التزام",
        days: ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"],
        daysShort: ["ح", "ن", "ث", "ر", "خ", "ج", "س"],
        muscleGroups: { chest: "صدر", back: "ظهر", legs: "أرجل", arms: "أذرع", shoulders: "أكتاف", fullbody: "تمرين شامل" },
        forgotPrompt: "أدخل بريدك الإلكتروني لإرسال رابط تغيير كلمة السر:", forgotSuccess: "تم إرسال رابط إعادة التعيين.",
        userNotFound: "عذراً، هذا البريد غير مسجل لدينا.", xpNo: "ليس لديك XP كافي!", xpSent: "تم إرسال XP بنجاح!", xpErr: "حدث خطأ!",
        shopTitle: "🛒 متجر المختبر", shopClose: "إغلاق", shopI1: "مظهر النيون ✨", shopI2: "المظهر الذهبي 👑", shopI3: "جدول غذائي مناسب لك 🥗", shopI4: "دليل التدريب Pro 📚",
        unlock: "فتح", get: "احصل", on: "تفعيل", off: "إيقاف", bought: "تم الشراء بنجاح!", xpSend: "إرسال",
        editName: "✏️ تعديل الاسم", miSchedule: "🗓️ تعديل جدول التمرين", miHub: "📊 مركز الأداء", miLb: "Leaderboard 🏆", miShop: "Lab Store 🛒", miDark: "Dark Mode 🌙", miLang: "Language 🌐", logout: "Logout تسجيل خروج", lbTitle: "🏆 قائمة المتصدرين", lbClose: "إغلاق", nameWait: "يمكنك تغيير اسمك كل 3 أيام فقط",
        aiWelcome: "أهلاً بك! أنا مدربك المحترف. اسألني عن التمرين، التغذية أو المكملات!", aiInputPl: "اسألني أي شيء...", aiSend: "إرسال",
        miFriends: "الأصدقاء 👥", miFriendIdPl: "ID الصديق", miNoFriends: "لا يوجد أصدقاء بعد", fChatPl: "اكتب رسالة...", fChatWait: "ابدأ المحادثة مع صديقك", fRemove: "حذف الصديق", fRemoveConfirm: "هل أنت متأكد من حذف هذا الصديق؟",
        notifHeader: "الإشعارات Notifications 🔔", notifEmpty: "لا يوجد إشعارات حالياً", notifFriendReq: "طلب صداقة من", notifAccept: "قبول", notifReject: "رفض", notifGift: "استلمت هدية XP من", notifMsg: "رسالة من",
        wdTitle: "حدد جدولك التدريبي", wdSubtitle: "اختر الأيام التي تتمرن فيها عادةً.", wdSave: "حفظ",
        mgTitle: "ما عضلة اليوم؟", wlTitle: "تسجيل تمارين", wlSave: "حفظ وإنهاء التمرين", wlClose: "إغلاق",
        logEx: "التمرين", logKg: "الوزن", logReps: "التكرار",
        ptTitle: "تطور الأداء", ptPR: "أفضل أداء", ptHistory: "آخر الجلسات", ptClose: "إغلاق",
        copied: "تم النسخ!", workoutSaved: "عاش! تم حفظ التمرين.",
        workoutDoneToday: "لقد أكملت تمرينك لهذا اليوم. عد غداً!",
        phTitle: "مركز الأداء", phOverview: "نظرة عامة", phHistory: "سجل التمارين", phTotalWorkouts: "إجمالي التمارين", phTotalWeight: "إجمالي الأوزان (كغ)", phSearch: "ابحث عن تمرين...", phNoData: "لا توجد بيانات بعد. ابدأ بتسجيل تمارينك لرؤية تحليلاتك هنا!",
    },
    en: {
        authLogin: "Sign In", authSignup: "Sign Up", authBtnL: "Login", authBtnS: "Register",
        authLinkS: "Register Now", authLinkL: "Login", forgot: "Forgot?", emailPl: "Email", passPl: "Password",
        fnamePl: "First Name", lnamePl: "Last Name", verifyMsg: "Verify your email!", weight: "Weight (kg)", height: "Height (cm)", age: "Age", male: "Male", female: "Female", calc: "Process Data",
        bmi: "BMI Index", water: "Water Need", waterTrack: "💧 Water Tracker:", l: "L", kg: "kg", ideal: "Ideal Weight",
        maintain: "Maintain", lose: "Lose", gain: "Gain",
        act1: "Sedentary (No workout)", act2: "Light (1-3 days workout)", act3: "Moderate (3-5 days workout)", act4: "Active (6-7 days workout)",
        status: ["Thin", "Normal", "Overweight", "Obese"], calText: "kcal", secCal: "Calories", share: "Share 🚀",
        modalText: "Welcome! Data is processed locally.", modalBtn: "I Agree", missions: "🎯 Missions",
        m1: "🏋️‍♂️ Workout Day", m2: "🥗 Healthy Meal", m3: "🧘‍♂️ Recovery Day",
        ranks: ["RECRUIT", "CORPORAL", "WARRIOR", "BEAST", "LEGEND"], streakShare: "Challenge 🔥", streakTxt: "DAYS STREAK",
        days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        daysShort: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        muscleGroups: { chest: "Chest", back: "Back", legs: "Legs", arms: "Arms", shoulders: "Shoulders", fullbody: "Full Body" },
        forgotPrompt: "Enter your email for password reset link:", forgotSuccess: "Reset link sent.",
        userNotFound: "Sorry, this email is not registered.", xpNo: "Not enough XP!", xpSent: "XP Sent Successfully!", xpErr: "An error occurred!",
        shopTitle: "🛒 Lab Store", shopClose: "Close", shopI1: "Neon Skin ✨", shopI2: "Gold Skin 👑", shopI3: "Your Custom Diet Plan 🥗", shopI4: "Pro Training PDF 📚",
        unlock: "Unlock", get: "Get", on: "ON", off: "OFF", bought: "Unlocked Successfully!", xpSend: "Send",
        editName: "✏️ Edit Name", miSchedule: "🗓️ Edit Schedule", miHub: "📊 Performance Hub", miLb: "Leaderboard 🏆", miShop: "Lab Store 🛒", miDark: "Dark Mode 🌙", miLang: "Language 🌐", logout: "Logout", lbTitle: "🏆 Leaderboard", lbClose: "Close", nameWait: "You can change name every 3 days",
        aiWelcome: "Hello! I am your pro coach. Ask me about training, nutrition, or supplements!", aiInputPl: "Ask me anything...", aiSend: "Send",
        miFriends: "Friends 👥", miFriendIdPl: "Friend's ID", miNoFriends: "No friends yet", fChatPl: "Type a message...", fChatWait: "Start chatting with your friend", fRemove: "Remove Friend", fRemoveConfirm: "Are you sure you want to remove this friend?",
        notifHeader: "Notifications 🔔", notifEmpty: "No notifications yet", notifFriendReq: "Friend request from", notifAccept: "Accept", notifReject: "Reject", notifGift: "Received XP gift from", notifMsg: "Message from",
        wdTitle: "Set Your Workout Schedule", wdSubtitle: "Select the days you usually work out.", wdSave: "Save",
        mgTitle: "What are you training today?", wlTitle: "Log", wlSave: "Save & Finish Workout", wlClose: "Close",
        logEx: "Exercise", logKg: "Weight", logReps: "Reps",
        ptTitle: "Performance Tracker", ptPR: "Personal Record", ptHistory: "Recent Sessions", ptClose: "Close",
        copied: "Copied!", workoutSaved: "Nice! Workout saved.",
        workoutDoneToday: "You have already completed your workout for today. Come back tomorrow!",
        phTitle: "Performance Hub", phOverview: "Overview", phHistory: "Exercise History", phTotalWorkouts: "Total Workouts", phTotalWeight: "Total Weight Lifted (kg)", phSearch: "Search exercise...", phNoData: "No data yet. Start logging workouts to see your analytics here!",
    }
};

// --- PWA Setup ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js');
    });
}

// --- دوال المساعدة ---
function playSfx(type) {
    if (sounds[type]) {
        sounds[type].currentTime = 0;
        sounds[type].volume = 0.5;
        sounds[type].play().catch(e => { });
    }
    if (navigator.vibrate) navigator.vibrate(type === 'error' ? 200 : 50);
}

function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast-notification');
    toast.innerText = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// --- نظام الطاقة ---
function updateStaminaUI() {
    // تحديث النص والشريط الملون
    document.getElementById('stamina-text').innerText = `${Math.floor(stamina)}/${MAX_STAMINA}`;
    const percentage = (stamina / MAX_STAMINA) * 100;
    document.getElementById('stamina-fill').style.width = `${percentage}%`;
    
    // تغيير لون الشريط إذا الطاقة منخفضة
    const fillEl = document.getElementById('stamina-fill');
    if(percentage < 20) fillEl.style.background = "#ff5252"; // أحمر
    else fillEl.style.background = "linear-gradient(90deg, #FFD700, #FF5722)"; // أصفر/برتقالي
}


function useStamina(amount) {
    if (stamina >= amount) {
        stamina -= amount;
        updateStaminaUI();
        // إرسال البيانات فوراً لـ Firebase لضمان المزامنة بين الأجهزة
        syncWithDB({ 
            stamina: stamina, 
            lastStaminaRegen: Date.now() 
        });
        return true;
    } else {
        // ... (كود التنبيه الحالي)
        return false;
    }
}

function startStaminaSystem() {
    // تنظيف أي عداد سابق لمنع التداخل
    if(regenInterval) clearInterval(regenInterval);
    
    regenInterval = setInterval(() => {
        const now = Date.now();
        
        // 1. تحديد السرعة (هل في بوستر؟)
        // إذا الوقت الحالي أقل من وقت انتهاء البوستر، السرعة دقيقة، غير هيك 5 دقايق
        // في دالة startStaminaSystem ...
        
        // 1. تحديد السرعة بناءً على وجود بوستر الطاقة النشط
        let rate = (now < staminaBoostEndTime) ? (1 * 60 * 1000) : (5 * 60 * 1000); 
        
        // ... باقي الكود زي ما هو (ما تغير عليه شي، هو أصلاً بحسب الفرق بين "آخر مرة" والآن)


        // 2. هل الطاقة ممتلئة؟
        if (stamina >= MAX_STAMINA) {
            document.getElementById('stamina-timer').innerText = "Full Energy ⚡";
            document.getElementById('stamina-fill').style.width = "100%";
            document.getElementById('stamina-text').innerText = `${MAX_STAMINA}/${MAX_STAMINA}`;
            
            // تحديث وقت آخر تعبئة للحظة الحالية عشان لما تنقص الطاقة يبدأ العد من الصفر
            localStorage.setItem('rga_last_regen', now); 
            return; 
        }

        // 3. حساب الوقت
        // نجلب وقت آخر تعبئة من ذاكرة الجهاز
        let lastRegen = parseInt(localStorage.getItem('rga_last_regen'));
        
        // إذا ما في وقت محفوظ (أول مرة)، نعتبر الوقت هو الآن
        if (!lastRegen || isNaN(lastRegen)) {
            lastRegen = now;
            localStorage.setItem('rga_last_regen', now);
        }

        // الفرق بين الوقت الحالي ووقت آخر تعبئة
        const diff = now - lastRegen;

        // 4. هل مر الوقت المطلوب (5 دقايق أو دقيقة)؟
        if (diff >= rate) {
            // نعم مر الوقت -> زيد الطاقة
            stamina = Math.min(MAX_STAMINA, stamina + 20);
            
            // حفظ الوقت الجديد (تصفير العداد)
            localStorage.setItem('rga_last_regen', now);
            
            // حفظ في الداتابيس وتحديث الشاشة
            syncWithDB({ stamina: stamina });
            updateStaminaUI();
            
            // صوت خفيف (اختياري)
            if(stamina < MAX_STAMINA) showToast("+20 Energy ⚡");
        } 
        
        // 5. تحديث العداد التنازلي على الشاشة
        const timeLeft = rate - diff;
        if (timeLeft > 0) {
            const m = Math.floor(timeLeft / 60000);
            const s = Math.floor((timeLeft % 60000) / 1000);
            // تنسيق الوقت ليظهر 04:05 مثلاً
            document.getElementById('stamina-timer').innerText = `Next +20 in: ${m}:${s < 10 ? '0'+s : s}`;
        } else {
            document.getElementById('stamina-timer').innerText = "Regenerating...";
        }

    }, 1000); // يتكرر كل ثانية
}
// --- منطق الألعاب ---
let gameInterval;
let timeLeft = 60;
let isGameActive = false;
let sessionXP = 0;
let comboCount = 0;
let comboTimer;
let globalBestCombo = 0;
let lastInteractionTime = 0;

function handleInteraction(e, type) {
    e.preventDefault();
    const now = Date.now();
    if (type === 'start') {
        if (now - lastInteractionTime < 50) return;
        lastInteractionTime = now;
        liftStart();
    } else {
        liftEnd();
    }
}
function openGame(isPvP = false) {
    playSfx('click');
    
    // شرط الطاقة (20 طاقة)
    if (!useStamina(20)) return; 

    // ✅ تم إلغاء شرط الساعة (الكوول داون)
    // الآن اللعب معتمد فقط على الطاقة
    
    comboCount = 0;
    document.getElementById('best-combo-val').innerText = globalBestCombo;
    sessionXP = 0;
    document.getElementById('session-xp-val').innerText = "0";
    document.getElementById('deadlift-char').src = LIFT_IMG_DOWN;
    document.getElementById('game-modal').style.display = 'flex';
    startTimer();
}


function startTimer() {
    timeLeft = 60;
    isGameActive = true;
    document.getElementById('game-timer-val').innerText = `${timeLeft}s`;
    gameInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('game-timer-val').innerText = `${timeLeft}s`;
        if (timeLeft <= 0) {
            finishGame(true);
        }
    }, 1000);
}

function closeGame() {
    const confirmMsg = lang === 'ar' ? "إذا خرجت الآن، ستنتهي الجلسة. هل أنت متأكد؟" : "Exit session? Confirm?";
    if (confirm(confirmMsg)) { finishGame(false); }
}

function finishGame(isTimeUp) {
    clearInterval(gameInterval);
    isGameActive = false;
    document.getElementById('game-modal').style.display = 'none';

    // 🔥 إذا كان الوضع PvP
    if (activePvPMode) {
        handlePvPEnd(sessionXP, 'deadlift'); 
        activePvPMode = false;
        return;
    }

    localStorage.setItem('rga_game_last_time', Date.now());
    const finalXP = sessionXP * xpMultiplier;
    const msg = lang === 'ar' ? `عاش يا بطل! +${finalXP} XP` : `Great job! +${finalXP} XP`;
    showToast(msg);
    syncWithDB({ xp: firebase.firestore.FieldValue.increment(finalXP) });
}

function liftStart() {
    if (!isGameActive) return;
    const char = document.getElementById('deadlift-char');
    const container = document.getElementById('shake-target');
    char.src = LIFT_IMG_UP;
    char.style.transform = "translateY(-20px) scale(1.05)";
    container.classList.add('shake');
    comboCount++;
    clearTimeout(comboTimer);
    if (comboCount > globalBestCombo) {
        globalBestCombo = comboCount;
        document.getElementById('best-combo-val').innerText = globalBestCombo;
        syncWithDB({ bestCombo: globalBestCombo });
    }
    if (comboCount > 1) {
        const comboEl = document.createElement('div');
        comboEl.className = 'combo-pop';
        comboEl.innerText = comboCount + "x";
        comboEl.style.left = (Math.random() * 40 + 30) + '%';
        comboEl.style.top = '10%';
        document.querySelector('.game-container').appendChild(comboEl);
        setTimeout(() => comboEl.remove(), 500);
    }
    comboTimer = setTimeout(() => { comboCount = 0; }, 800);
    sessionXP++;
    document.getElementById('session-xp-val').innerText = sessionXP;
    const pop = document.createElement('div');
    pop.className = 'xp-pop'; pop.innerText = '+1';
    pop.style.left = (Math.random() * 60 + 20) + '%';
    document.querySelector('.game-container').appendChild(pop);
    setTimeout(() => pop.remove(), 800);
}

function liftEnd() {
    if (!isGameActive) return;
    const char = document.getElementById('deadlift-char');
    const container = document.getElementById('shake-target');
    if (char) { char.src = LIFT_IMG_DOWN; char.style.transform = "translateY(0) scale(1)"; }
    if (container) container.classList.remove('shake');
}

// --- لعبة السكوات ---
let squatScore = 0;
let squatMistakes = 0;
let isSquatGameActive = false;
let squatGameLoop;
let squatLineSpeed = 2;
let linePosition = 0;
let lineDirection = 1;

function openSquatGame(isPvP = false) {
    playSfx('click');
    if (!isPvP && !useStamina(20)) return;

    const user = auth.currentUser;
    if (!user) {
        showToast("الرجاء تسجيل الدخول أولاً");
        return;
    }
    
    // في PvP لا نفحص وقت الانتظار
    if (!isPvP) {
       // ... كود التحقق من الوقت القديم ...
       // للاختصار سنفترض أنه مسموح
    }

    squatScore = 0;
    squatMistakes = 0;
    linePosition = 0;
    lineDirection = 1;
    squatLineSpeed = 2;
    document.getElementById('squat-session-xp-val').innerText = "0";
    document.getElementById('squat-mistakes-val').innerText = "0 / 5";
    document.getElementById('squat-game-modal').style.display = 'flex';
    startSquatGame();
}

function startSquatGame() {
    isSquatGameActive = true;
    gameLoop();
}

function gameLoop() {
    if (!isSquatGameActive) return;
    const line = document.getElementById('squat-line');
    const barContainer = document.getElementById('squat-bar-container');
    const barHeight = barContainer.clientHeight;
    const lineHeight = line.clientHeight;
    linePosition += lineDirection * squatLineSpeed;
    if (linePosition >= barHeight - lineHeight || linePosition <= 0) {
        lineDirection *= -1;
        linePosition = Math.max(0, Math.min(linePosition, barHeight - lineHeight));
    }
    line.style.transform = `translateY(${linePosition}px)`;
    squatGameLoop = requestAnimationFrame(gameLoop);
}

function handleSquatClick() {
    if (!isSquatGameActive) return;
    const line = document.getElementById('squat-line');
    const greenZone = document.getElementById('squat-green-zone');
    const lineTop = line.getBoundingClientRect().top;
    const greenZoneTop = greenZone.getBoundingClientRect().top;
    const greenZoneBottom = greenZone.getBoundingClientRect().bottom;

    if (lineTop >= greenZoneTop && lineTop <= greenZoneBottom) {
        squatScore += 10;
        document.getElementById('squat-session-xp-val').innerText = squatScore;
        squatLineSpeed += 0.25;
        const charAfter = document.getElementById('squat-char-after');
        charAfter.style.opacity = 1;
        charAfter.style.transform = 'translateY(10px)';
        setTimeout(() => {
            charAfter.style.opacity = 0;
            charAfter.style.transform = 'translateY(0)';
        }, 300);
        const pop = document.createElement('div');
        pop.className = 'xp-pop';
        pop.innerText = '+10';
        pop.style.left = '50%';
        pop.style.transform = 'translateX(-50%)';
        document.getElementById('squat-bar-container').appendChild(pop);
        setTimeout(() => pop.remove(), 800);
    } else {
        squatMistakes++;
        document.getElementById('squat-mistakes-val').innerText = `${squatMistakes} / 5`;
        const barContainer = document.getElementById('squat-bar-container');
        barContainer.classList.add('squat-bar-error');
        setTimeout(() => barContainer.classList.remove('squat-bar-error'), 300);
        if (squatMistakes >= 5) {
            finishSquatGame(true);
        }
    }
}

function closeSquatGame() {
    if (confirm("هل أنت متأكد؟")) finishSquatGame(true);
}

function finishSquatGame(saveScore = true) {
    if (!isSquatGameActive) return;
    isSquatGameActive = false;
    cancelAnimationFrame(squatGameLoop);
    document.getElementById('squat-game-modal').style.display = 'none';

    // 🔥 إذا كان الوضع PvP
    if (activePvPMode) {
        handlePvPEnd(squatScore, 'squat');
        activePvPMode = false;
        return;
    }

    const dataToUpdate = { lastPlayedSquat: firebase.firestore.FieldValue.serverTimestamp() };
    if (squatScore > 0) {
        const finalXP = squatScore * xpMultiplier;
        dataToUpdate.xp = firebase.firestore.FieldValue.increment(finalXP);
        showToast(`الجولة انتهت! +${finalXP} XP`);
    } else {
        showToast('حظ أوفر!');
    }
    if (auth.currentUser) syncWithDB(dataToUpdate);
}

// ==========================================
// 🥊 منطق التحديات (PvP Logic)
// ==========================================

async function sendPvPChallenge() {
    if(!currentFriendId || xp < 500) { showToast("تحتاج 500 XP!"); return; }
    if(stamina < 20) { showToast("ما عندك طاقة!"); return; }
    
    if(confirm("تحدي فوري بـ 500 XP + 20 طاقة؟")) {
        playSfx('click');
        xp -= 500; stamina -= 20;
        updateStaminaUI(); document.getElementById('shop-xp-val').innerText = xp;
        syncWithDB({ xp: firebase.firestore.FieldValue.increment(-500), stamina: stamina });

        const challengeRef = await db.collection("challenges").add({
            p1: auth.currentUser.uid,
            p2: currentFriendId,
            bet: 500,
            status: 'pending',
            gameType: Math.random() < 0.5 ? 'deadlift' : 'squat',
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        db.collection("users").doc(currentFriendId).collection("notifications").add({
            type: 'pvp_request',
            challengeId: challengeRef.id,
            fromName: auth.currentUser.displayName,
            time: firebase.firestore.FieldValue.serverTimestamp(),
            read: false
        });
        showToast("تم الإرسال! انتظر القبول...");
        document.getElementById('friend-modal').style.display = 'none';
    }
}

async function acceptPvP(challengeId, notifId) {
    if(xp < 500) { showToast("ما معك 500 XP!"); return; }
    if(stamina < 20) { showToast("ما معك طاقة!"); return; }

    db.collection("users").doc(auth.currentUser.uid).collection("notifications").doc(notifId).delete();
    const doc = await db.collection("challenges").doc(challengeId).get();
    if(!doc.exists) return;
    const data = doc.data();

    xp -= 500; stamina -= 20; updateStaminaUI();
    syncWithDB({ xp: firebase.firestore.FieldValue.increment(-500), stamina: stamina });

    activePvPMode = true;
    currentPvPId = challengeId;
    document.getElementById('notif-dropdown').style.display = 'none';
    
    showToast(`🎲 اللعبة: ${data.gameType.toUpperCase()}! استعد...`);
    setTimeout(() => {
        if(data.gameType === 'deadlift') openGame(true);
        else openSquatGame(true);
    }, 1000);
}

function playPvPTurn(challengeId, gameType, opponentScore, notifId) {
    if(stamina < 20) { showToast("بحاجة لـ 20 طاقة!"); return; }
    
    db.collection("users").doc(auth.currentUser.uid).collection("notifications").doc(notifId).delete();
    activePvPMode = true;
    currentPvPId = challengeId;
    pvpOpponentScore = opponentScore;
    stamina -= 20; updateStaminaUI();
    syncWithDB({ stamina: stamina });

    if(gameType === 'deadlift') openGame(true);
    else openSquatGame(true);
}

async function handlePvPEnd(myScore, gameType) {
    const challengeRef = db.collection("challenges").doc(currentPvPId);
    const doc = await challengeRef.get();
    const data = doc.data();

    if (data.status === 'pending') {
        await challengeRef.update({ status: 'p2_done', p2_score: myScore });
        db.collection("users").doc(data.p1).collection("notifications").add({
            type: 'pvp_response',
            challengeId: currentPvPId,
            game: gameType,
            score: myScore,
            fromName: auth.currentUser.displayName,
            time: firebase.firestore.FieldValue.serverTimestamp(),
            read: false
        });
        showToast(`جبت ${myScore} نقطة! تم إرسال النتيجة.`);
    } else if (data.status === 'p2_done') {
        const opponentScore = data.p2_score;
        let msg = "";
        if (myScore > opponentScore) {
            msg = `🏆 فزت! (${myScore} vs ${opponentScore})`;
            syncWithDB({ xp: firebase.firestore.FieldValue.increment(1000) });
        } else if (myScore < opponentScore) {
            msg = `💀 خسرت! (${myScore} vs ${opponentScore})`;
            db.collection("ranks").doc(data.p2).update({ xp: firebase.firestore.FieldValue.increment(1000) });
            db.collection("users").doc(data.p2).collection("notifications").add({
                type: 'msg', text: `🏆 مبروك! فزت بـ 1000 XP!`, fromName: "System", read: false, time: firebase.firestore.FieldValue.serverTimestamp()
            });
        } else {
            msg = `🤝 تعادل!`;
            syncWithDB({ xp: firebase.firestore.FieldValue.increment(500) });
            db.collection("ranks").doc(data.p2).update({ xp: firebase.firestore.FieldValue.increment(500) });
        }
        await challengeRef.update({ status: 'finished', p1_score: myScore });
        alert(msg);
    }
}

// --- واجهة المستخدم (UI) ---
function toggleMenu() {
    document.getElementById('notif-dropdown').style.display = 'none';
    document.getElementById('sideMenu').classList.toggle('active');
    document.getElementById('menuOverlay').classList.toggle('active');
}

function closeMenuAndOpen(func) {
    toggleMenu();
    setTimeout(func, 300);
}

function toggleAuthMode() {
    authMode = (authMode === 'login' ? 'signup' : 'login');
    document.getElementById('signup-fields').classList.toggle('hidden', authMode === 'login');
    updateTexts();
}

function syncLanguage(el) {
    document.getElementById('langToggle').checked = el.checked;
    toggleLanguage();
}

function toggleLanguage() {
    lang = document.getElementById('langToggle').checked ? 'ar' : 'en';
    document.body.className = (lang === 'ar' ? 'ar-mode' : 'en-mode') + (document.body.classList.contains('dark-theme') ? ' dark-theme' : '');
    document.getElementById('authLangToggle').checked = (lang === 'ar');
    chatHistory = [];
    const msgArea = document.getElementById('ai-messages');
    if (msgArea) msgArea.innerHTML = `<div class="ai-msg bot">${trans[lang].aiWelcome}</div>`;
    updateTexts();
    renderTodaysMissions();
    if (!document.getElementById('resultsArea').classList.contains('hidden')) processAll();
    if (auth.currentUser) listenToNotifications();
}

function updateTexts() {
    const t = trans[lang];
    if (!t) return;
    document.getElementById('auth-title').innerText = (authMode === 'login' ? t.authLogin : t.authSignup);
    document.getElementById('auth-btn').innerText = (authMode === 'login' ? t.authBtnL : t.authBtnS);
    document.getElementById('auth-toggle-text').innerText = (authMode === 'login' ? t.authLinkS : t.authLinkL);
    document.getElementById('auth-forgot').innerText = t.forgot;
    document.getElementById('auth-email').placeholder = t.emailPl;
    document.getElementById('auth-pass').placeholder = t.passPl;
    document.getElementById('auth-fname').placeholder = t.fnamePl;
    document.getElementById('auth-lname').placeholder = t.lnamePl;
    document.getElementById('weight').placeholder = t.weight;
    document.getElementById('height').placeholder = t.height;
    document.getElementById('age').placeholder = t.age;
    document.getElementById('opt-male').innerText = t.male;
    document.getElementById('opt-female').innerText = t.female;
    document.getElementById('act1').innerText = t.act1;
    document.getElementById('act2').innerText = t.act2;
    document.getElementById('act3').innerText = t.act3;
    document.getElementById('act4').innerText = t.act4;
    document.getElementById('calcBtn').innerText = t.calc;
    document.getElementById('lbl-bmi').innerText = t.bmi;
    document.getElementById('lbl-ideal').innerText = t.ideal;
    document.getElementById('lbl-water').innerText = t.water;
    document.getElementById('lbl-water-track').innerText = t.waterTrack;
    document.getElementById('unit-l').innerText = t.l;
    document.querySelectorAll('.unit-kg').forEach(el => el.innerText = t.kg);
    document.getElementById('lbl-maintain').innerText = t.maintain;
    document.getElementById('lbl-lose').innerText = t.lose;
    document.getElementById('lbl-gain').innerText = t.gain;
    document.getElementById('lbl-sec-cal').innerText = t.secCal;
    document.getElementById('btn-share').innerText = t.share;
    document.getElementById('lbl-missions').innerText = t.missions;
    document.getElementById('m2').innerText = t.m2;
    document.getElementById('btn-streak-share').innerText = t.streakShare;
    document.getElementById('modal-text').innerText = t.modalText;
    document.getElementById('modal-btn').innerText = t.modalBtn;
    document.getElementById('lbl-streak-txt').innerText = t.streakTxt;
    document.getElementById('btn-edit-name').innerText = t.editName;
    document.getElementById('mi-schedule').innerText = t.miSchedule;
    document.getElementById('mi-hub').innerText = t.miHub;
    document.getElementById('mi-lb').innerText = t.miLb;
    document.getElementById('mi-shop').innerText = t.shopTitle;
    document.getElementById('mi-dark').innerText = t.miDark;
    document.getElementById('mi-lang').innerText = t.miLang;
    document.getElementById('lb-title-text').innerText = t.lbTitle;
    document.getElementById('lb-close-btn').innerText = t.lbClose;
    document.getElementById('shop-title').innerText = t.shopTitle;
    document.getElementById('shop-close').innerText = t.shopClose;
    document.getElementById('shop-i1').innerHTML = t.shopI1;
    document.getElementById('shop-i2').innerHTML = t.shopI2;
    document.getElementById('ai-title').innerText = (lang === 'ar' ? 'مدرب RGALAB الذكي' : 'RGALAB AI Coach');
    document.getElementById('ai-userInput').placeholder = t.aiInputPl;
    document.getElementById('ai-send-btn').innerText = t.aiSend;
    document.getElementById('xp-send-btn-text').innerText = t.xpSend;
    document.getElementById('btn-remove-f').title = t.fRemove;
    document.getElementById('mi-friends').innerText = t.miFriends;
    document.getElementById('friend-id-input').placeholder = t.miFriendIdPl;
    document.getElementById('notif-header-text').innerText = t.notifHeader;
    document.getElementById('chat-input').placeholder = t.fChatPl;
    document.getElementById('wd-title').innerText = t.wdTitle;
    document.getElementById('wd-subtitle').innerText = t.wdSubtitle;
    document.getElementById('wd-save').innerText = t.wdSave;
    document.getElementById('mg-title').innerText = t.mgTitle;
    document.getElementById('wl-save').innerText = t.wlSave;
    document.getElementById('wl-close').innerText = t.wlClose;
    document.getElementById('log-exercise').placeholder = t.logEx;
    document.getElementById('log-weight').placeholder = t.logKg;
    document.getElementById('log-reps').placeholder = t.logReps;
    document.getElementById('pt-title').innerText = t.ptTitle;
    document.getElementById('pt-history-title').innerText = t.ptHistory;
    document.querySelector('#performance-tracker-modal .agree-btn').innerText = t.ptClose;
    document.getElementById('ph-title').innerText = t.phTitle;
    document.getElementById('hub-tab-overview').innerText = t.phOverview;
    document.getElementById('hub-tab-history').innerText = t.phHistory;
    document.getElementById('ph-total-workouts-label').innerText = t.phTotalWorkouts;
    document.getElementById('ph-total-weight-label').innerText = t.phTotalWeight;
    document.getElementById('hub-search-exercise').placeholder = t.phSearch;
    document.getElementById('hub-no-data').innerText = t.phNoData;
    updateRankDisplay();
    updateShopButtons();
}

function toggleAIChat() {
    const win = document.getElementById('ai-window');
    win.style.display = (win.style.display === 'flex' ? 'none' : 'flex');
    if (document.getElementById('ai-messages').innerHTML === "") { document.getElementById('ai-messages').innerHTML = `<div class="ai-msg bot">${trans[lang].aiWelcome}</div>`; }
}

async function askGroq() {
    const input = document.getElementById('ai-userInput');
    const msgArea = document.getElementById('ai-messages');
    const text = input.value.trim();
    if (!text) return;
    msgArea.innerHTML += `<div class="ai-msg user">${text}</div>`;
    const systemPrompt = lang === 'ar' ? "أنت مدرب رياضي خبير في مختبر RGALAB. أجب بالعربية." : "You are an expert fitness coach at RGALAB.";
    if (chatHistory.length === 0) chatHistory.push({ role: "system", content: systemPrompt });
    chatHistory.push({ role: "user", content: text });
    input.value = ""; msgArea.scrollTop = msgArea.scrollHeight;
    const loadingId = "load-" + Date.now();
    msgArea.innerHTML += `<div class="ai-msg bot" id="${loadingId}">...</div>`;
    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${GROQ_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: chatHistory, temperature: 0.7 })
        });
        const data = await response.json();
        const reply = data.choices[0].message.content;
        document.getElementById(loadingId).innerText = reply;
        chatHistory.push({ role: "assistant", content: reply });
        if (chatHistory.length > 15) chatHistory = [chatHistory[0], ...chatHistory.slice(-10)];
    } catch (e) { document.getElementById(loadingId).innerText = "Error."; }
    msgArea.scrollTop = msgArea.scrollHeight;
}

function triggerPhotoUpload() { document.getElementById('photoInput').click(); }
function uploadPhoto(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            userAvatarUrl = e.target.result;
            document.getElementById('menu-user-avatar').src = userAvatarUrl;
            localStorage.setItem('rga_avatar', userAvatarUrl);
            syncWithDB({ avatar: userAvatarUrl });
        }; reader.readAsDataURL(input.files[0]);
    }
}

function changeName() {
    const lastChange = localStorage.getItem('rga_name_date') || 0;
    if (Date.now() - lastChange < 259200000) { showToast(trans[lang].nameWait); return; }
    const newName = prompt("Enter new name:");
    if (newName) {
        auth.currentUser.updateProfile({ displayName: newName }).then(() => {
            document.getElementById('menu-user-name').innerText = newName;
            localStorage.setItem('rga_name_date', Date.now());
            syncWithDB({ name: newName });
        });
    }
}

function handleAuth() {
    const email = document.getElementById('auth-email').value;
    const pass = document.getElementById('auth-pass').value;
    playSfx('click');
    if (authMode === 'login') {
        auth.signInWithEmailAndPassword(email, pass).catch(e => { playSfx('error'); showToast(e.message); });
    } else {
        auth.createUserWithEmailAndPassword(email, pass).then(u => {
            db.collection("ranks").doc(u.user.uid).set({
                xp: 0, streak: 0, name: "User", stamina: 100, lastStaminaRegen: Date.now(),
                inventory: {}, createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            playSfx('success');
        }).catch(e => { playSfx('error'); showToast(e.message); });
    }
}

function forgotPassword() {
    const emailInput = document.getElementById('auth-email').value;
    const email = prompt(trans[lang].forgotPrompt, emailInput);
    if (email) auth.sendPasswordResetEmail(email).then(() => showToast(trans[lang].forgotSuccess)).catch(e => showToast(e.message));
}

function logout() {
    if (rankUnsubscribe) rankUnsubscribe();
    if (notifUnsubscribe) notifUnsubscribe();
    if (chatUnsubscribe) chatUnsubscribe();
    auth.signOut().then(() => {
        localStorage.clear();
        location.reload();
    });
}

function doMission(el, points) {
    if (el.classList.contains('done')) return;
    el.classList.add('done');
    syncWithDB({ xp: firebase.firestore.FieldValue.increment(points) });
    showToast(`+${points} XP ✨`);
    const completed = JSON.parse(localStorage.getItem('rga_completed_missions') || '{}');
    completed[el.id] = true;
    localStorage.setItem('rga_completed_missions', JSON.stringify(completed));
}

function syncWithDB(dataToUpdate) {
    const user = auth.currentUser;
    if (user && dataToUpdate) {
        db.collection("ranks").doc(user.uid).update(dataToUpdate).catch((e) => console.error("Sync error:", e));
    }
}

function updateRankDisplay() {
    const level = Math.floor(xp / 100) + 1;
    const rankIdx = Math.min(Math.floor((level - 1) / 2), 4);
    const rLabel = (lang === 'ar' ? "الرتبة: " : "RANK: ");
    document.getElementById('rank-display').innerText = rLabel + trans[lang].ranks[rankIdx] + " (LVL " + level + ")";
    document.getElementById('xp-fill').style.width = (xp % 100) + "%";
    document.getElementById('shop-xp-val').innerText = xp;
    updateStaminaUI();
}

function openLeaderboard() {
    document.getElementById('lb-modal').style.display = 'flex';
    const listDiv = document.getElementById('lb-list');
    listDiv.innerHTML = "Loading...";
    db.collection("ranks").orderBy("streak", "desc").limit(100).get().then(snap => {
        listDiv.innerHTML = "";
        let i = 1;
        snap.forEach(doc => {
            const data = doc.data();
            listDiv.innerHTML += `<div class="lb-row"><div class="lb-user"><span style="width:20px;">#${i}</span><img src="${data.avatar || DEFAULT_AVATAR}" class="lb-pic"><span>${data.name}</span></div><span style="color:#ff5722;">🔥 ${data.streak || 0}</span></div>`;
            i++;
        });
    });
}

function closeLeaderboard() { document.getElementById('lb-modal').style.display = 'none'; }

function processAll() {
    const w = parseFloat(document.getElementById('weight').value);
    const h = parseFloat(document.getElementById('height').value);
    const a = parseFloat(document.getElementById('age').value);
    const g = document.getElementById('gender').value;
    const act = parseFloat(document.getElementById('activity').value);
    if (!w || !h || !a) return;

    const bmi = (w / ((h / 100) ** 2)).toFixed(1);
    document.getElementById('val-bmi').innerText = bmi;
    document.getElementById('status-bmi').innerText = trans[lang].status[bmi < 18.5 ? 0 : bmi < 25 ? 1 : bmi < 30 ? 2 : 3];
    let ideal = g === 'male' ? 50 + 2.3 * ((h / 2.54) - 60) : 45.5 + 2.3 * ((h / 2.54) - 60);
    document.getElementById('val-ideal').innerText = Math.round(ideal);
    document.getElementById('val-water').innerText = (w * 0.033).toFixed(1);
    let bmr = (10 * w) + (6.25 * h) - (5 * a) + (g === 'male' ? 5 : -161);
    let maint = Math.round(bmr * act);
    document.getElementById('res-maintain').innerText = maint + " " + trans[lang].calText;
    document.getElementById('res-lose').innerText = (maint - 500) + " " + trans[lang].calText;
    document.getElementById('res-gain').innerText = (maint + 500) + " " + trans[lang].calText;
    document.getElementById('resultsArea').classList.remove('hidden');
}

function renderWater() {
    let waterCups = localStorage.getItem('rga_water_count') || 0;
    let html = ""; for (let i = 1; i <= 8; i++) html += (i <= waterCups ? "🟦" : "⬜");
    document.getElementById('water-tracker').innerHTML = html;
}
document.getElementById('water-tracker').onclick = function () {
    let waterCups = parseInt(localStorage.getItem('rga_water_count') || 0);
    waterCups = waterCups >= 8 ? 0 : waterCups + 1;
    localStorage.setItem('rga_water_count', waterCups); renderWater();
};

function shareStreak() { navigator.clipboard.writeText(`Day ${streak} on RGALAB! 🔥`).then(() => showToast(trans[lang].copied)); }
function shareResults() { navigator.clipboard.writeText(`Calories: ${document.getElementById('res-maintain').innerText}`).then(() => showToast(trans[lang].copied)); }

function openShop() {
    document.getElementById('shop-modal').style.display = 'flex';
    updateShopButtons();
}
function closeShop() { document.getElementById('shop-modal').style.display = 'none'; }

// 🛒 منطق المتجر الكامل
function updateShopButtons() {
    const t = trans[lang];
    const inventory = JSON.parse(localStorage.getItem('rga_inventory')) || {};

    ['neon', 'gold'].forEach(id => {
        const btn = document.getElementById('btn-' + id);
        if (btn) {
            if (ownedItems.includes(id)) {
                const isActive = document.body.classList.contains('skin-' + id);
                btn.innerText = isActive ? t.off : t.on;
                btn.className = isActive ? "active" : "";
                btn.onclick = () => buyItem(id, 0);
            } else {
                btn.innerText = t.unlock;
                btn.className = "";
                btn.disabled = xp < (id === 'neon' ? 1000 : 2000);
                btn.onclick = () => buyItem(id, (id === 'neon' ? 1000 : 2000));
            }
        }
    });

    const potionCount = inventory.potion || 0;
    const btnPotion = document.getElementById('btn-potion');
    const lblPotion = document.getElementById('shop-potion');

    if (btnPotion && lblPotion) {
        lblPotion.innerHTML = `🧪 XP Potion (x${potionCount})<br><small>Double XP for 1hr</small>`;
        if (potionCount > 0) {
            btnPotion.innerText = "USE";
            btnPotion.style.background = "#4CAF50";
            btnPotion.onclick = () => useConsumable('potion');
        } else {
            btnPotion.innerText = "500 XP";
            btnPotion.style.background = "#2196F3";
            btnPotion.onclick = () => buyConsumable('potion', 500);
        }
    }



// ضيف هذا الجزء لتحديث زر مشروب الطاقة
const energyCount = inventory.energy_drink || 0;
document.getElementById('shop-energy').innerHTML = `⚡ Energy Drink (x${energyCount})<br><small>Regen every 1min for 1hr</small>`;
const btnEnergy = document.getElementById('btn-energy');
if(energyCount > 0) {
    btnEnergy.innerText = "USE";
    btnEnergy.onclick = () => useConsumable('energy_drink');
} else {
    btnEnergy.innerText = "800 XP";
    btnEnergy.onclick = () => buyConsumable('energy_drink', 800);
}



    const freezeCount = inventory.freeze || 0;
    const btnFreeze = document.getElementById('btn-freeze');
    const lblFreeze = document.getElementById('shop-freeze');

    if (btnFreeze && lblFreeze) {
        lblFreeze.innerHTML = `❄️ Streak Freeze (x${freezeCount})<br><small>Protect streak 1 day</small>`;
        if (freezeCount > 0) {
            btnFreeze.innerText = "ACTIVE";
            btnFreeze.disabled = true;
            btnFreeze.style.background = "#555";
        } else {
            btnFreeze.innerText = "1000 XP";
            btnFreeze.disabled = false;
            btnFreeze.style.background = "#2196F3";
            btnFreeze.onclick = () => buyConsumable('freeze', 1000);
        }
    }
}



function buyItem(item, cost) {
    if (ownedItems.includes(item)) {
        if (item === 'neon' || item === 'gold') {
            document.body.classList.toggle('skin-' + item);
            updateShopButtons();
        }
        return;
    }
    if (xp >= cost) {
        if (item === 'neon' || item === 'gold') {
            ownedItems.push(item);
            localStorage.setItem('rga_owned', JSON.stringify(ownedItems));
            document.body.classList.add('skin-' + item);
        }
        syncWithDB({ xp: firebase.firestore.FieldValue.increment(-cost) });
        xp -= cost;
        document.getElementById('shop-xp-val').innerText = xp;
        playSfx('coin');
        showToast(trans[lang].bought);
        updateShopButtons();
    } else {
        playSfx('error');
        showToast(trans[lang].xpNo);
    }
}

function buyConsumable(type, cost) {
    if (xp >= cost) {
        let inventory = JSON.parse(localStorage.getItem('rga_inventory')) || {};
        inventory[type] = (inventory[type] || 0) + 1;
        localStorage.setItem('rga_inventory', JSON.stringify(inventory));
        syncWithDB({
            xp: firebase.firestore.FieldValue.increment(-cost),
            [`inventory.${type}`]: firebase.firestore.FieldValue.increment(1)
        });
        xp -= cost;
        document.getElementById('shop-xp-val').innerText = xp;
        playSfx('coin');
        showToast(lang === 'ar' ? "تم الشراء!" : "Item Bought!");
        updateShopButtons();
    } else {
        playSfx('error');
        showToast(trans[lang].xpNo);
    }
}

function useConsumable(type) {
    let inventory = JSON.parse(localStorage.getItem('rga_inventory')) || {};
    if (inventory[type] > 0) {
        const now = Date.now();
        
        if (type === 'potion') { // XP Booster
            xpBoostEndTime = now + 3600000; // ساعة كاملة
            syncWithDB({ xpBoostEndTime: xpBoostEndTime }); // حفظ في الداتابيس
            checkBoosters(); // تشغيل العداد فوراً
            showToast("🚀 Double XP Activated!");
        } 
        else if (type === 'energy_drink') { // Energy Booster (الجديد)
            staminaBoostEndTime = now + 3600000; // ساعة كاملة
            syncWithDB({ staminaBoostEndTime: staminaBoostEndTime });
            startStaminaSystem(); // تحديث سرعة العداد
            showToast("⚡ Fast Energy Regen Activated!");
        }

        // خصم من المخزون
        inventory[type]--;
        localStorage.setItem('rga_inventory', JSON.stringify(inventory));
        syncWithDB({ [`inventory.${type}`]: firebase.firestore.FieldValue.increment(-1) });
        
        playSfx('success');
        updateShopButtons();
    }
}


function checkBoosters() {
    if(boosterInterval) clearInterval(boosterInterval);
    
    boosterInterval = setInterval(() => {
        const now = Date.now();
        
        // 1. فحص XP Booster
        const xpUi = document.getElementById('xp-booster-ui');
        if (now < xpBoostEndTime) {
            xpMultiplier = 2;
            xpUi.classList.remove('hidden');
            const diff = xpBoostEndTime - now;
            document.getElementById('xp-timer-val').innerText = formatTime(diff);
        } else {
            xpMultiplier = 1;
            xpUi.classList.add('hidden');
        }

        // 2. فحص Energy Booster
        const energyUi = document.getElementById('energy-booster-ui');
        if (now < staminaBoostEndTime) {
            // تفعيل السرعة العالية (دقيقة واحدة)
            // (ملاحظة: هذا التغيير يتم استخدامه داخل startStaminaSystem)
            energyUi.classList.remove('hidden');
            const diff = staminaBoostEndTime - now;
            document.getElementById('energy-timer-val').innerText = formatTime(diff);
        } else {
            energyUi.classList.add('hidden');
        }

    }, 1000);
}

// دالة مساعدة لتنسيق الوقت (05:00)
function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s < 10 ? '0'+s : s}`;
}


function renderTodaysMissions() {
    const missionArea = document.getElementById('dynamic-mission-area');
    missionArea.innerHTML = '';
    const today = new Date().getDay();
    const isWorkoutDay = workoutDays.includes(today);
    const t = trans[lang];
    let missionHTML = '';
    if (isWorkoutDay) {
        missionHTML = `<div class="mission-item" id="mission-workout" onclick="openMuscleGroupModal()"><span>${t.m1}</span><b>+50 XP</b></div>`;
    } else {
        missionHTML = `<div class="mission-item" id="mission-rest" onclick="doMission(this, 10)"><span>${t.m3}</span><b>+10 XP</b></div>`;
    }
    missionArea.innerHTML = missionHTML;
    const completed = JSON.parse(localStorage.getItem('rga_completed_missions') || '{}');
    Object.keys(completed).forEach(missionId => {
        const el = document.getElementById(missionId);
        if (el) el.classList.add('done');
    });
}

function openWorkoutDaysModal() {
    const selector = document.getElementById('day-selector-cal');
    selector.innerHTML = '';
    const dayNames = trans[lang].daysShort;
    dayNames.forEach((name, index) => {
        const isSelected = workoutDays.includes(index) ? 'selected' : '';
        selector.innerHTML += `<div class="day-btn ${isSelected}" data-day="${index}" onclick="this.classList.toggle('selected')">${name}</div>`;
    });
    document.getElementById('days-modal').style.display = 'flex';
}

function saveWorkoutDays() {
    const selectedDays = [];
    document.querySelectorAll('#day-selector-cal .day-btn.selected').forEach(btn => {
        selectedDays.push(parseInt(btn.dataset.day));
    });
    if (selectedDays.length > 0) {
        workoutDays = selectedDays;
        syncWithDB({ workoutDays: selectedDays });
        document.getElementById('days-modal').style.display = 'none';
        renderTodaysMissions();
    } else {
        showToast(lang === 'ar' ? 'اختر يوم تمرين واحد على الأقل.' : 'Select at least one workout day.');
    }
}

function openMuscleGroupModal() {
    const missionEl = document.getElementById('mission-workout');
    if (missionEl && missionEl.classList.contains('done')) {
        showToast(trans[lang].workoutDoneToday);
        return;
    }
    const selector = document.getElementById('muscle-group-selector');
    selector.innerHTML = '';
    const muscleGroups = trans[lang].muscleGroups;
    for (const key in muscleGroups) {
        selector.innerHTML += `<div class="muscle-btn" onclick="selectMuscleGroup('${key}')">${muscleGroups[key]}</div>`;
    }
    document.getElementById('muscle-group-modal').style.display = 'flex';
}

function selectMuscleGroup(groupKey) {
    currentMuscleGroup = groupKey;
    document.getElementById('muscle-group-modal').style.display = 'none';
    openWorkoutLogger();
}

function openWorkoutLogger() {
    tempLoggedExercises = [];
    document.getElementById('logged-exercises-list').innerHTML = '';
    const titleEl = document.getElementById('wl-title');
    const t = trans[lang];
    titleEl.innerText = `${t.wlTitle} ${t.muscleGroups[currentMuscleGroup]}`;
    document.getElementById('logger-modal').style.display = 'flex';
    document.getElementById('log-exercise').value = '';
    document.getElementById('performance-history-icon').style.display = 'none';
}

function closeWorkoutLogger() {
    document.getElementById('logger-modal').style.display = 'none';
}

async function addExerciseToLog() {
    playSfx('click');
    const exInput = document.getElementById('log-exercise');
    const wtInput = document.getElementById('log-weight');
    const rpInput = document.getElementById('log-reps');
    const exercise = { name: exInput.value.trim(), weight: parseFloat(wtInput.value) || 0, reps: parseFloat(rpInput.value) || 0 };
    if (!exercise.name) return;
    
    // Smart Coach
    const user = auth.currentUser;
    if (user) {
        const workoutsRef = db.collection("users").doc(user.uid).collection("workouts").orderBy("date", "desc").limit(5);
        const snapshot = await workoutsRef.get();
        let lastWeight = 0;
        snapshot.forEach(doc => {
            const data = doc.data();
            data.exercises.forEach(ex => {
                if (ex.name.toLowerCase() === exercise.name.toLowerCase()) lastWeight = parseFloat(ex.weight);
            });
        });
        if (lastWeight > 0) {
            if (exercise.weight > lastWeight) {
                playSfx('levelUp');
                showToast(`🔥 وحش!! كسرت وزنك السابق (${lastWeight}kg) -> +50 XP Bonus`);
                syncWithDB({ xp: firebase.firestore.FieldValue.increment(50) });
            } else if (exercise.weight < lastWeight) {
                playSfx('error');
                showToast(`⚠️ تنبيه المدرب: وزنك نزل عن آخر مرة (${lastWeight}kg). ركز!`);
            }
        }
    }
    tempLoggedExercises.push(exercise);
    const list = document.getElementById('logged-exercises-list');
    list.innerHTML += `<div class="exercise-item"><span>${exercise.name}</span> <span>${exercise.weight} ${trans[lang].kg} x ${exercise.reps}</span></div>`;
    list.scrollTop = list.scrollHeight;
    exInput.value = ''; wtInput.value = ''; rpInput.value = '';
    exInput.focus();
}

async function saveLoggedWorkout() {
    if (tempLoggedExercises.length === 0) {
        showToast(lang === 'ar' ? 'أضف تمرين واحد على الأقل.' : 'Add at least one exercise.');
        return;
    }
    const user = auth.currentUser;
    if (!user) return;
    const workoutData = {
        muscleGroup: currentMuscleGroup,
        date: new Date().toISOString(),
        exercises: tempLoggedExercises
    };
    await db.collection("users").doc(user.uid).collection("workouts").add(workoutData);
    await db.collection("ranks").doc(user.uid).update({
        lastWorkoutDate: firebase.firestore.FieldValue.serverTimestamp()
    });
    doMission(document.getElementById('mission-workout'), 50);
    closeWorkoutLogger();
    showToast(trans[lang].workoutSaved + ' (+50 XP ✨)');
}

async function checkExerciseHistory(exerciseName) {
    const icon = document.getElementById('performance-history-icon');
    const user = auth.currentUser;
    if (!user || exerciseName.length < 3) {
        icon.style.display = 'none';
        return;
    }
    const lowerCaseName = exerciseName.trim().toLowerCase();
    const workoutsRef = db.collection("users").doc(user.uid).collection("workouts");
    const querySnapshot = await workoutsRef.get();
    let historyExists = false;
    querySnapshot.forEach(doc => {
        doc.data().exercises.forEach(ex => {
            if (ex.name.toLowerCase() === lowerCaseName) {
                historyExists = true;
            }
        });
    });
    icon.style.display = historyExists ? 'block' : 'none';
}

async function showPerformanceTracker(exerciseNameOverride) {
    const user = auth.currentUser;
    const exerciseName = exerciseNameOverride || document.getElementById('log-exercise').value.trim();
    if (!user || !exerciseName) return;
    document.getElementById('performance-hub-modal').style.display = 'none';
    const modal = document.getElementById('performance-tracker-modal');
    modal.style.display = 'flex';
    document.getElementById('pt-title').innerText = `${trans[lang].ptTitle}: ${exerciseName}`;
    const historyList = document.getElementById('pt-history-list');
    const prDisplay = document.getElementById('pt-pr-display');
    historyList.innerHTML = 'Loading...';
    prDisplay.innerHTML = '';
    const workoutsRef = db.collection("users").doc(user.uid).collection("workouts").orderBy("date", "desc");
    const querySnapshot = await workoutsRef.get();
    const historyData = [];
    let personalRecord = { weight: 0, reps: 0, date: '' };
    querySnapshot.forEach(doc => {
        const workout = doc.data();
        workout.exercises.forEach(ex => {
            if (ex.name.toLowerCase() === exerciseName.toLowerCase()) {
                const weight = parseFloat(ex.weight) || 0;
                const reps = parseFloat(ex.reps) || 0;
                const recordDate = new Date(workout.date);
                historyData.push({ date: recordDate, weight: weight, reps: reps });
                if (weight > personalRecord.weight) {
                    personalRecord = { weight: weight, reps: reps, date: recordDate.toLocaleDateString() };
                }
            }
        });
    });
    if (historyData.length === 0) {
        historyList.innerHTML = 'No history found.';
        prDisplay.innerHTML = '';
        return;
    }
    if (personalRecord.weight > 0) {
        prDisplay.innerHTML = `
            <div class="pr-card">
                <div class="pr-trophy">🏆 ${trans[lang].ptPR}</div>
                <div class="pr-main-value">
                    <span>${personalRecord.weight}</span>
                    <span class="pr-unit">${trans[lang].kg}</span>
                </div>
                <div class="pr-details">
                    <span>🏋️‍♂️ ${personalRecord.reps} Reps</span>
                    <span>📅 ${personalRecord.date}</span>
                </div>
            </div>
        `;
    } else {
        prDisplay.innerHTML = '';
    }
    historyList.innerHTML = '';
    historyData.slice(0, 5).forEach(item => {
        historyList.innerHTML += `
            <div class="history-item modern">
                <span>${item.date.toLocaleDateString()}</span>
                <span>${item.weight} ${trans[lang].kg} x ${item.reps}</span>
            </div>
        `;
    });
    const chartData = historyData.slice().reverse();
    const labels = chartData.map(d => d.date.toLocaleDateString());
    const weights = chartData.map(d => d.weight);
    const ctx = document.getElementById('performance-chart').getContext('2d');
    if (performanceChart) performanceChart.destroy();
    performanceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `Weight (${trans[lang].kg})`,
                data: weights,
                borderColor: 'rgba(76, 175, 80, 1)',
                backgroundColor: 'rgba(76, 175, 80, 0.2)',
                fill: true,
                tension: 0.3
            }]
        },
        options: { responsive: true, scales: { y: { beginAtZero: true } }, plugins: { legend: { display: false } } }
    });
}

function toggleNotifs() {
    const drop = document.getElementById('notif-dropdown');
    const badge = document.getElementById('notif-badge');
    if (drop.style.display === 'flex') {
        drop.style.display = 'none';
    } else {
        drop.style.display = 'flex';
        badge.style.display = 'none';
        badge.innerText = '0';
        markNotificationsRead();
    }
}

function markNotificationsRead() {
    const uid = auth.currentUser.uid;
    db.collection("users").doc(uid).collection("notifications").where("read", "==", false).get().then(snap => {
        const batch = db.batch();
        if (snap.empty) return;
        snap.forEach(doc => {
            batch.update(doc.ref, { read: true });
        });
        batch.commit().catch(e => console.error("Error marking notifications read: ", e));
    });
}

function copyMyId() { if (myShortId) { navigator.clipboard.writeText(myShortId).then(() => showToast(trans[lang].copied)); } }

function sendFriendRequest(button) {
    const targetId = document.getElementById('friend-id-input').value.trim();
    if (!targetId) return;
    if (targetId === myShortId) { showToast(lang === 'ar' ? "لا يمكنك إضافة نفسك!" : "You can't add yourself!"); return; }
    button.disabled = true;
    db.collection("ranks").where("shortId", "==", targetId).limit(1).get().then(snap => {
        if (snap.empty) {
            showToast("المعرف غير صحيح User not found");
            button.disabled = false;
        } else {
            const targetDoc = snap.docs[0]; const targetUid = targetDoc.id;
            db.collection("users").doc(targetUid).collection("notifications").add({ type: 'friend_request', fromUid: auth.currentUser.uid, fromName: auth.currentUser.displayName, time: firebase.firestore.FieldValue.serverTimestamp(), read: false }).then(() => {
                showToast(lang === 'ar' ? "تم إرسال الطلب!" : "Request Sent!");
                document.getElementById('friend-id-input').value = '';
                setTimeout(() => { button.disabled = false; }, 2000);
            });
        }
    }).catch(() => {
        button.disabled = false;
    });
}

function listenToNotifications() {
    const uid = auth.currentUser.uid;
    if (notifUnsubscribe) notifUnsubscribe();
    notifUnsubscribe = db.collection("users").doc(uid).collection("notifications").orderBy("time", "desc").limit(20)
        .onSnapshot(snap => {
            const list = document.getElementById('notif-list'); list.innerHTML = "";
            let unread = 0;
            const t = trans[lang];
            if (snap.empty) {
                list.innerHTML = `<div style='padding:10px; opacity:0.6;'>${t.notifEmpty}</div>`;
            }
            snap.forEach(doc => {
                const n = doc.data();
                if (!n.read) unread++;
                const div = document.createElement('div'); div.className = 'notif-item';
                if (n.type === 'friend_request') {
                    div.innerHTML = `<div>👤 ${t.notifFriendReq} <b>${n.fromName}</b></div>
                      <div class="notif-actions">
                          <button class="btn-accept" onclick="acceptFriend('${doc.id}', '${n.fromUid}', '${n.fromName}')">${t.notifAccept}</button>
                          <button class="btn-reject" onclick="deleteNotif('${doc.id}')">${t.notifReject}</button>
                      </div>`;
                } else if (n.type === 'xp_gift') {
                    div.innerHTML = `<div style="color:#4CAF50;">🎁 ${t.notifGift} <b>${n.amount} XP</b> (${n.fromName})</div>`;
                } else if (n.type === 'msg') {
                    div.innerHTML = `<div>💬 ${t.notifMsg} <b>${n.fromName}</b>: ${n.text}</div>`;
                } else if (n.type === 'pvp_request') {
                    div.innerHTML = `
                        <div style="color:#ff5252; font-weight:bold;">🥊 تحدي من ${n.fromName}</div>
                        <div style="font-size:11px;">الرهان: 500 XP | الطاقة: 20</div>
                        <button onclick="acceptPvP('${n.challengeId}', '${doc.id}')" 
                        style="background:linear-gradient(45deg, #FF9800, #FF5722); width:100%; margin-top:5px; border-radius:5px; border:none; color:white; font-weight:bold; padding:5px;">
                        🔥 قبول ولعب فوراً
                        </button>
                    `;
                } else if (n.type === 'pvp_response') {
                    div.innerHTML = `
                        <div style="color:#4CAF50; font-weight:bold;">✅ ${n.fromName} لعب وجاب ${n.score} نقطة!</div>
                        <div style="font-size:11px;">اللعبة: ${n.game}</div>
                        <button onclick="playPvPTurn('${n.challengeId}', '${n.game}', ${n.score}, '${doc.id}')" 
                        style="background:var(--primary); width:100%; margin-top:5px; border-radius:5px; border:none; color:white; font-weight:bold; padding:5px;">
                        ⚔️ العب واهزمه هسا!
                        </button>
                    `;
                }
                list.appendChild(div);
            });
            const badge = document.getElementById('notif-badge');
            const drop = document.getElementById('notif-dropdown');
            if (unread > 0 && drop.style.display !== 'flex') {
                badge.style.display = 'block';
                badge.innerText = unread;
            } else if (unread === 0) {
                badge.style.display = 'none';
            }
        });
}

function acceptFriend(notifId, fromUid, fromName) {
    const myUid = auth.currentUser.uid; const myName = auth.currentUser.displayName;
    const batch = db.batch();
    const myFriendRef = db.collection("users").doc(myUid).collection("friends").doc(fromUid);
    batch.set(myFriendRef, { uid: fromUid, name: fromName });
    const otherFriendRef = db.collection("users").doc(fromUid).collection("friends").doc(myUid);
    batch.set(otherFriendRef, { uid: myUid, name: myName });
    const notifRef = db.collection("users").doc(myUid).collection("notifications").doc(notifId);
    batch.delete(notifRef);
    batch.commit().then(() => showToast(lang === 'ar' ? "تمت إضافة الصديق!" : "Friend Added!"));
}

function deleteNotif(id) { db.collection("users").doc(auth.currentUser.uid).collection("notifications").doc(id).delete(); }

function listenToFriends() {
    db.collection("users").doc(auth.currentUser.uid).collection("friends").onSnapshot(snap => {
        const div = document.getElementById('friend-list-container'); div.innerHTML = "";
        if (snap.empty) { div.innerHTML = `<small style='opacity:0.5'>${trans[lang].miNoFriends}</small>`; return; }
        snap.forEach(doc => {
            const f = doc.data();
            db.collection("ranks").doc(f.uid).get().then(uSnap => {
                if (uSnap.exists) {
                    const uData = uSnap.data(); const el = document.createElement('div'); el.className = 'friend-list-item';
                    el.innerHTML = `<img src="${uData.avatar || DEFAULT_AVATAR}" class="f-avatar">
                                       <div><b>${uData.name}</b><br><span style="font-size:10px; color:#FFD700;">🔥 ${uData.streak || 0}</span></div>`;
                    el.onclick = () => openFriendModal(f.uid, uData); div.appendChild(el);
                }
            });
        });
    });
}

function openFriendModal(fUid, uData) {
    currentFriendId = fUid;
    document.getElementById('friend-modal').style.display = 'flex';
    document.getElementById('f-modal-name').innerText = uData.name;
    document.getElementById('f-modal-img').src = uData.avatar || DEFAULT_AVATAR;
    document.getElementById('f-modal-streak').innerText = uData.streak || 0;
    document.getElementById('f-chat-box').innerHTML = `<div style="text-align:center; opacity:0.5; margin: auto;">${trans[lang].fChatWait}</div>`;
    listenChat(fUid);
}

function removeFriend() {
    if (!currentFriendId) return;
    if (confirm(trans[lang].fRemoveConfirm)) {
        const myUid = auth.currentUser.uid;
        const batch = db.batch();
        batch.delete(db.collection("users").doc(myUid).collection("friends").doc(currentFriendId));
        batch.delete(db.collection("users").doc(currentFriendId).collection("friends").doc(myUid));
        batch.commit().then(() => {
            showToast(lang === 'ar' ? "تم حذف الصديق" : "Friend Removed");
            document.getElementById('friend-modal').style.display = 'none';
        });
    }
}

async function sendXPToFriend(button) {
    if (!currentFriendId) return;
    const input = document.getElementById('xp-amount-input');
    const amount = parseInt(input.value);
    const t = trans[lang];
    if (!amount || amount <= 0) {
        showToast("الرجاء إدخال رقم صحيح!");
        return;
    }
    if (xp < amount) {
        showToast(t.xpNo);
        return;
    }
    button.disabled = true;
    const myUid = auth.currentUser.uid;
    const myRankRef = db.collection("ranks").doc(myUid);
    const friendRankRef = db.collection("ranks").doc(currentFriendId);
    try {
        await db.runTransaction(async (transaction) => {
            const myRankDoc = await transaction.get(myRankRef);
            if (!myRankDoc.exists || myRankDoc.data().xp < amount) {
                throw new Error("Not enough XP");
            }
            transaction.update(myRankRef, { xp: firebase.firestore.FieldValue.increment(-amount) });
            transaction.update(friendRankRef, { xp: firebase.firestore.FieldValue.increment(amount) });
        });
        showToast(t.xpSent);
        input.value = "";
        db.collection("users").doc(currentFriendId).collection("notifications").add({
            type: 'xp_gift', amount: amount, fromName: auth.currentUser.displayName,
            time: firebase.firestore.FieldValue.serverTimestamp(), read: false
        });
    } catch (error) {
        console.error("XP Transaction failed: ", error);
        showToast(t.xpErr);
    } finally {
        button.disabled = false;
    }
}

function sendChatMessage() {
    const txt = document.getElementById('chat-input').value.trim();
    if (!txt || !currentFriendId) return;
    const myUid = auth.currentUser.uid;
    const chatId = myUid < currentFriendId ? myUid + "_" + currentFriendId : currentFriendId + "_" + myUid;
    db.collection("chats").doc(chatId).collection("messages").add({
        senderId: myUid,
        text: txt,
        time: firebase.firestore.FieldValue.serverTimestamp()
    });
    db.collection("users").doc(currentFriendId).collection("notifications").add({
        type: 'msg',
        text: txt,
        fromName: auth.currentUser.displayName,
        time: firebase.firestore.FieldValue.serverTimestamp(),
        read: false
    });
    document.getElementById('chat-input').value = "";
}

function listenChat(fUid) {
    if (chatUnsubscribe) chatUnsubscribe();
    const myUid = auth.currentUser.uid;
    const chatId = myUid < fUid ? myUid + "_" + fUid : fUid + "_" + myUid;
    const box = document.getElementById('f-chat-box');
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    db.collection("chats").doc(chatId).collection("messages")
        .where("time", "<", oneDayAgo).get().then(snap => {
            const batch = db.batch();
            snap.forEach(doc => batch.delete(doc.ref));
            batch.commit();
        });
    chatUnsubscribe = db.collection("chats").doc(chatId).collection("messages")
        .orderBy("time", "asc")
        .onSnapshot(snap => {
            box.innerHTML = "";
            if (snap.empty) { box.innerHTML = `<div style="text-align:center; opacity:0.5; margin: auto;">${trans[lang].fChatWait}</div>`; }
            snap.forEach(doc => {
                const m = doc.data();
                const cls = m.senderId === myUid ? "me" : "them";
                box.innerHTML += `<div class="chat-msg ${cls}">${m.text}</div>`;
            });
            box.scrollTop = box.scrollHeight;
        });
}

// --- عند تحميل الصفحة ---
// --- عند تحميل الصفحة (النسخة النهائية الصحيحة) ---
window.onload = function () {
    // 1. تشغيل النصوص والمتجر
    updateTexts(); 
    updateShopButtons();

    // 2. التحقق من الخصوصية
    if (localStorage.getItem('rga_privacy_accepted') !== 'true') {
        document.getElementById("privacyModal").style.display = "flex";
    }

    // 3. مراقب تسجيل الدخول
    auth.onAuthStateChanged(user => {
        if (user) {
db.collection("users").doc(user.uid).get().then(doc => {
    if (doc.exists()) {
        const data = doc.data();
        stamina = data.stamina || 100;
        const lastRegen = data.lastStaminaRegen || Date.now();
        
        // تشغيل الحساب التلقائي بناءً على الفرق الزمني
        regenStamina(lastRegen);
        
        // استدعاء دالة الستريك بمجرد الدخول
        checkLoginStreak(user.uid);
        
        // جلب بيانات المستخدم الأخرى
        fetchUserData(user.uid);
    } else {
        // توجيه لصفحة تسجيل الدخول
    }
});


            // إخفاء شاشة الدخول وإظهار القوائم
            document.getElementById('auth-overlay').classList.add('hidden');
            document.getElementById('menuBtn').style.display = "flex";
            document.getElementById('ai-chat-btn').style.display = "flex";
            document.getElementById('notif-icon').style.display = "flex";

            // الاستماع لتحديثات البيانات (Realtime)
            if (rankUnsubscribe) rankUnsubscribe();
            rankUnsubscribe = db.collection("ranks").doc(user.uid).onSnapshot(doc => {
                if (doc.exists) {
                    const data = doc.data();
                    
                    // --- تحميل المتغيرات الأساسية ---
                    xp = data.xp || 0;
                    streak = data.streak || 0;
                    if(data.stamina !== undefined) stamina = data.stamina;
                    
                    // --- تحميل البوسترات والمخزون ---
                    xpBoostEndTime = data.xpBoostEndTime || 0;
                    staminaBoostEndTime = data.staminaBoostEndTime || 0;
                    
                    ownedItems = data.ownedItems || JSON.parse(localStorage.getItem('rga_owned')) || [];
                    if(data.inventory) localStorage.setItem('rga_inventory', JSON.stringify(data.inventory));

                    myShortId = data.shortId;
                    workoutDays = data.workoutDays || [];

                    // --- تشغيل الأنظمة الذكية ---
                    
checkBoosters();      // فحص 


// استبدل الدالة القديمة بهذا المنطق
function regenStamina(lastTime) {
    const now = Date.now();
    const diffInMs = now - lastTime;
    
    // التحقق من وجود "بوست" (XP Multiplier)
    const isBoosted = xpMultiplier > 1; 
    
    let pointsToAdd = 0;
    
    if (isBoosted) {
        // إذا كان البوست فعال: 20 طاقة كل دقيقة
        pointsToAdd = Math.floor(diffInMs / (1 * 60 * 1000)) * 20;
    } else {
        // الوضع الطبيعي: 20 طاقة كل 5 دقائق
        pointsToAdd = Math.floor(diffInMs / (5 * 60 * 1000)) * 20;
    }

    if (pointsToAdd > 0) {
        stamina = Math.min(MAX_STAMINA, stamina + pointsToAdd);
        updateStaminaUI();
        // حفظ الوقت الحالي كآخر وقت تحديث لضمان عدم التكرار
        syncWithDB({ stamina: stamina, lastStaminaRegen: now });
    }
}

                    startStaminaSystem(); // تشغيل نظام الطاقة (هذا بديل عن regenStamina القديم)

                    // --- منطق الستريك ---
                    const todayJordan = getJordanDateString(new Date());
                    const lastActiveTimestamp = data.lastActiveDate;
                    let lastActiveJordan = null;
                    if (lastActiveTimestamp) {
                        lastActiveJordan = getJordanDateString(lastActiveTimestamp.toDate());
                    }
                    if (lastActiveJordan !== todayJordan) {
                        const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
                        const yesterdayJordan = getJordanDateString(yesterday);
                        if (lastActiveJordan === yesterdayJordan) {
                            showToast(`🔥 حافظ على الستريك!`);
                        }
                    }

                    // --- توليد ID إذا مش موجود ---
                    if (!myShortId) {
                        myShortId = Math.random().toString(36).substr(2, 6).toUpperCase();
                        db.collection("ranks").doc(user.uid).update({ shortId: myShortId });
                    }
                    
                    // --- تحديث واجهة المستخدم ---
                    document.getElementById('menu-user-id').innerText = "ID: " + myShortId;
                    userAvatarUrl = data.avatar || DEFAULT_AVATAR;
                    document.getElementById('menu-user-avatar').src = userAvatarUrl;
                    document.getElementById('menu-user-name').innerText = data.name || user.displayName || "User";
                    document.getElementById('streak-num').innerText = streak;
                    document.getElementById('best-combo-val').innerText = data.bestCombo || 0;
                    globalBestCombo = data.bestCombo || 0;
                    document.getElementById('myIdDisplay').innerText = myShortId;

                    // تحديث العناصر المرئية
                    updateRankDisplay();
                    updateShopButtons();
                    renderTodaysMissions();
                }
            });

            // الاستماع للإشعارات والأصدقاء
            listenToNotifications();
            listenToFriends();

        } else {
            // حالة الخروج
            document.getElementById('auth-overlay').classList.remove('hidden');
            document.getElementById('menuBtn').style.display = "none";
            document.getElementById('ai-chat-btn').style.display = "none";
            document.getElementById('notif-icon').style.display = "none";
        }
    });
};


function acceptPrivacy() {
    localStorage.setItem('rga_privacy_accepted', 'true');
    document.getElementById("privacyModal").style.display = "none";
    if(typeof playSfx === "function") playSfx('click');
}

function showPrivacy() {
    document.getElementById("privacyModal").style.display = "flex";
}

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
}

function getJordanDateString(date) {
    const dateToFormat = date || new Date();
    return new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Amman',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(dateToFormat);
}

// ==========================================
// 📊 منطق مركز الأداء
// ==========================================
async function openPerformanceHub() {
    playSfx('click');
    const modal = document.getElementById('performance-hub-modal');
    modal.style.display = 'flex';
    switchHubTab('overview');
    const user = auth.currentUser;
    if (!user) return;
    const noDataEl = document.getElementById('hub-no-data');
    const overviewContent = document.getElementById('hub-overview-content');
    const historyContent = document.getElementById('hub-history-content');
    overviewContent.classList.add('hidden');
    historyContent.classList.add('hidden');
    noDataEl.classList.remove('hidden');
    noDataEl.innerText = 'Loading analytics...';
    const workoutsRef = db.collection("users").doc(user.uid).collection("workouts");
    const querySnapshot = await workoutsRef.get();
    if (querySnapshot.empty) {
        noDataEl.innerText = trans[lang].phNoData;
        return;
    }
    noDataEl.classList.add('hidden');
    overviewContent.classList.remove('hidden');
    const exercisesByGroup = {};
    let totalWorkouts = 0;
    let totalWeight = 0;
    const muscleCounts = {};
    querySnapshot.forEach(doc => {
        totalWorkouts++;
        const workout = doc.data();
        const groupKey = workout.muscleGroup || 'fullbody';
        muscleCounts[groupKey] = (muscleCounts[groupKey] || 0) + 1;
        if (!exercisesByGroup[groupKey]) {
            exercisesByGroup[groupKey] = new Set();
        }
        workout.exercises.forEach(ex => {
            totalWeight += (parseFloat(ex.weight) || 0) * (parseFloat(ex.reps) || 0);
            exercisesByGroup[groupKey].add(ex.name);
        });
    });
    document.getElementById('hub-total-workouts').innerText = totalWorkouts;
    document.getElementById('hub-total-weight').innerText = Math.round(totalWeight);
    const muscleLabels = Object.keys(muscleCounts).map(key => trans[lang].muscleGroups[key] || key);
    const muscleData = Object.values(muscleCounts);
    const ctx = document.getElementById('hub-muscle-chart').getContext('2d');
    if (hubMuscleChart) hubMuscleChart.destroy();
    const gradient = ctx.createLinearGradient(0, 0, 0, 250);
    gradient.addColorStop(0, 'rgba(76, 175, 80, 0.6)');
    gradient.addColorStop(1, 'rgba(76, 175, 80, 0)');
    hubMuscleChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: muscleLabels,
            datasets: [{
                label: 'Workouts',
                data: muscleData,
                fill: true,
                backgroundColor: gradient,
                borderColor: '#4CAF50',
                borderWidth: 3,
                tension: 0.4,
                pointBackgroundColor: 'white',
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.1)' }, ticks: { color: '#ccc' } },
                x: { grid: { display: false }, ticks: { color: '#ccc' } }
            },
            plugins: { legend: { display: false } }
        }
    });
    const exerciseListContainer = document.getElementById('hub-exercise-list');
    exerciseListContainer.innerHTML = '';
    for (const groupKey in exercisesByGroup) {
        const groupName = trans[lang].muscleGroups[groupKey] || groupKey;
        const groupWrapper = document.createElement('div');
        const header = document.createElement('div');
        header.className = 'muscle-group-header';
        header.innerText = groupName;
        header.onclick = function() { toggleExerciseList(this); };
        const content = document.createElement('div');
        content.className = 'exercise-list-collapsible';
        const exercises = Array.from(exercisesByGroup[groupKey]).sort();
        exercises.forEach(exName => {
            const item = document.createElement('div');
            item.className = 'exercise-item-hub';
            item.innerText = exName;
            item.onclick = () => showPerformanceTracker(exName);
            content.appendChild(item);
        });
        groupWrapper.appendChild(header);
        groupWrapper.appendChild(content);
        exerciseListContainer.appendChild(groupWrapper);
    }
}

function switchHubTab(tabName) {
    document.getElementById('hub-overview-content').classList.toggle('hidden', tabName !== 'overview');
    document.getElementById('hub-history-content').classList.toggle('hidden', tabName !== 'history');
    document.getElementById('hub-tab-overview').classList.toggle('active', tabName === 'overview');
    document.getElementById('hub-tab-history').classList.toggle('active', tabName === 'history');
}

function filterHubExercises(searchTerm) {
    const lowerTerm = searchTerm.toLowerCase();
    document.querySelectorAll('#hub-exercise-list .exercise-item-hub').forEach(item => {
        const matches = item.innerText.toLowerCase().includes(lowerTerm);
        item.style.display = matches ? 'block' : 'none';
        if(matches && searchTerm.length > 0) {
            item.parentElement.style.maxHeight = "1000px"; 
        }
    });
}

function toggleExerciseList(headerElement) {
    headerElement.classList.toggle('active');
    const content = headerElement.nextElementSibling;
    if (content.style.maxHeight) {
        content.style.maxHeight = null;
    } else {
        content.style.maxHeight = content.scrollHeight + "px";
    }
}

// دالة فتح الاستوديو عند الضغط على الصورة
function triggerPhotoUpload() { 
    const input = document.getElementById('photoInput');
    if (input) {
        input.click(); // هاي الحركة اللي بتفتح الاستوديو غصب
    } else {
        alert("خطأ: عنصر اختيار الصور غير موجود في الصفحة!");
    }
}

async function checkLoginStreak(userId) {
    const userRef = db.collection("users").doc(userId);
    const doc = await userRef.get();

    if (!doc.exists) return;

    const data = doc.data();
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0]; // تاريخ اليوم بصيغة YYYY-MM-DD
    
    // جلب آخر تاريخ "دخول" تم فيه تحديث الستريك
    const lastLoginDate = data.lastLoginStreakDate || "";
    const currentStreak = data.streak || 0;

    // 1. إذا كان المستخدم قد دخل اليوم بالفعل، لا تفعل شيئاً
    if (lastLoginDate === todayStr) {
        console.log("الستريك محدث لليوم بالفعل.");
        return;
    }

    const lastDate = new Date(lastLoginDate);
    const diffTime = now - lastDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    let newStreak = currentStreak;

    if (lastLoginDate === "") {
        // أول دخول للمستخدم
        newStreak = 1;
    } else if (diffDays <= 1.9) {
        // إذا كان الدخول الأخير أمس (أو أقل من يومين)، زِد الستريك
        newStreak = currentStreak + 1;
        showToast("🔥 ستريك جديد! أنت مستمر لليوم " + newStreak);
    } else {
        // إذا غاب أكثر من يومين، يتم تصفير الستريك
        newStreak = 1;
        showToast("💔 انقطع الستريك، بدأنا من جديد!");
    }

    // تحديث البيانات في فايربيس
    await userRef.update({
        streak: newStreak,
        lastLoginStreakDate: todayStr
    });

    // تحديث الواجهة إذا كان العداد معروضاً
    if(document.getElementById('res-streak')) {
        document.getElementById('res-streak').innerText = newStreak;
    }
}


