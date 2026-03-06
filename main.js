


// تفعيل تأثير النيون للزر المضغوط في الشريط السفلي
window.activateBottomNav = function(clickedItem) {
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    navItems.forEach(item => item.classList.remove('active')); // إزالة النيون من الكل
    
    if(clickedItem) {
        clickedItem.classList.add('active'); // إضافة النيون للكبسة الحالية
    }
    
    // رفع الشاشة للأعلى بنعومة عند تغيير الصفحة
    window.scrollTo({ top: 0, behavior: 'smooth' });
};
window.triggerProofUpload = function(notifId, exName, weight, reps) {
    const fileInput = document.getElementById('hidden-proof-upload');
    fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if(!file) return;
        
        showToast(currentLang === 'en' ? "Uploading proof... Please wait " : "جاري رفع الإثبات للقيادة... انتظر ");
        
        const user = auth.currentUser;
        const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
        const videoRef = storage.ref(`proofs/${user.uid}_${Date.now()}_${cleanFileName}`);
        
        try {
            await videoRef.put(file);
            const videoURL = await videoRef.getDownloadURL();
            let dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            
            await db.collection('pending_workouts').add({
                userId: user.uid,
                userName: JSON.parse(localStorage.getItem('currentUser')).firstName,
                date: dateStr,
                type: "Live PR",
                details: [{name: exName, weight: weight, reps: reps}],
                videoUrl: videoURL,
                status: 'pending',
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });

            await db.collection('users').doc(user.uid).collection('notifications').doc(notifId).delete();
            showToast(currentLang === 'en' ? "Uploaded! Admin will review it." : "تم الرفع! الإدارة رح تراجع وحشنتك 👑");
        } catch(error) {
            showToast(currentLang === 'en' ? "Upload failed!" : "فشل الرفع!");
        }
    };
    fileInput.click();
};




window.calculate1RM = function() {
    const weight = parseFloat(document.getElementById('calc-weight').value);
    const reps = parseInt(document.getElementById('calc-reps').value);
    const resultDiv = document.getElementById('calc-result');
    const rmValue = document.getElementById('rm-value');
    
    // سحب الترجمة الحالية
    const t = translations[currentLang || 'ar'];

    // فحص المدخلات وإظهار رسالة الخطأ المترجمة
    if (!weight || !reps || reps <= 0 || weight <= 0) {
        showToast(t.calc_error || "يرجى إدخال وزن وعدات صحيحة! ");
        return;
    }

    // معادلة Epley
    let oneRM = weight;
    if (reps > 1) {
        oneRM = weight * (1 + (0.0333 * reps));
    }

    rmValue.innerText = Math.round(oneRM);
    resultDiv.style.display = 'block';
    
    // حركة بسيطة للفت الانتباه
    rmValue.style.animation = 'none';
    setTimeout(() => rmValue.style.animation = 'neonPulse 1s ease', 10);
};


let currentTourStep = 0;
let tourSteps = [];

function checkAndShowOnboarding() {
    if (!localStorage.getItem('hasSeenTour')) {
        setTimeout(startSpotlightTour, 1500);
    }
}

function startSpotlightTour() {
    const t = translations[currentLang || 'ar'];
    
    tourSteps = [
        {
            target: null,
            title: t.tour_1_title || "أهلاً بك في RGAFIT! 🔥",
            text: t.tour_1_text || "مكانك الجديد لبناء العضلات وتحطيم الأرقام. رح نعمل جولة سريعة لنعرفك على الأزرار المهمة.",
            needsSidebar: false
        },
        {
            target: document.querySelector('[onclick="openWorkoutModal()"]'),
            title: t.tour_2_title || "سجل تمارينك ",
            text: t.tour_2_text || "من هون بتسجل أوزانك. كل تمرين بيعطيك 50 XP لترفع مستواك.",
            needsSidebar: false
        },
        {
            target: document.querySelector('[onclick="openCityMonster()"]'),
            title: t.tour_3_title || "وحش المدينة ",
            text: t.tour_3_text || "اكتشف الخريطة! حطم الأرقام عشان تسيطر على مدينتك.",
            needsSidebar: false
        },
        {
            target: document.querySelector('[onclick="openAchievements()"]'),
            title: t.tour_4_title || "غرفة الجوائز ",
            text: t.tour_4_text || "كل إنجاز بتعمله بيفتحلك وسام جديد هون. استعد لتجميعهم كلهم!",
            needsSidebar: false
        },
        {
            target: document.querySelector('[onclick*="openPerformanceCenter"]'),
            title: t.tour_5_title || "مركز الأداء 📊",
            text: t.tour_5_text || "راقب تطورك، شوف إحصائياتك، وقارن مستواك عشان تضل على الطريق الصح.",
            needsSidebar: true // 🚨 إجبار السايد منيو يفتح
        },
        {
            target: document.querySelector('[onclick*="openFriendsCenter"]'),
            title: t.tour_6_title || "مجتمع الأبطال ",
            text: t.tour_6_text || "هون بتشوف ترتيبك بين الوحوش بالليدربورد. اثبت نفسك وخليهم يشوفوا اسمك بالصدارة!",
            needsSidebar: true // 🚨 إجبار السايد منيو يفتح
        },
        {
            target: document.querySelector('[onclick*="openProfile"]'),
            title: t.tour_7_title || "الملف الشخصي ",
            text: t.tour_7_text || "من هون بتقدر تعدل بياناتك، وتتحكم بحسابك وإعداداتك بالكامل.",
            needsSidebar: true // 🚨 إجبار السايد منيو يفتح
        }
    ];

    currentTourStep = 0;
    document.getElementById('spotlight-overlay').style.display = 'block';
    document.getElementById('spotlight-tooltip').style.display = 'block';
    showSpotlightStep();
}

function showSpotlightStep() {
    const t = translations[currentLang || 'ar']; // 🔥 سحب الترجمة
    const step = tourSteps[currentTourStep];
    const highlight = document.getElementById('spotlight-highlight');
    const tooltip = document.getElementById('spotlight-tooltip');
    
    // إخفاء المربع والشرح مؤقتاً لحد ما تخلص الحركات
    highlight.style.opacity = '0';
    tooltip.style.opacity = '0';
    
    document.getElementById('spotlight-title').innerText = step.title;
    document.getElementById('spotlight-text').innerText = step.text;
    
    // 🔥 التعديل السحري: لقط زر "تخطي" وترجمته فوراً
    const skipBtn = document.querySelector('#spotlight-tooltip button[onclick*="endSpotlightTour"]');
    if (skipBtn) skipBtn.innerText = t.btn_skip || (currentLang === 'en' ? 'Skip' : 'تخطي');

    const nextBtn = document.getElementById('spotlight-next');
    if (currentTourStep === tourSteps.length - 1) {
        nextBtn.innerText = currentLang === 'en' ? "Start " : "ابدأ التحدي ";
        nextBtn.onclick = (e) => { 
            e.stopPropagation(); // السطر السحري لمنع الكبسة من تسكير القائمة
            endSpotlightTour(); 
        };
    } else {
        nextBtn.innerText = currentLang === 'en' ? "Next ❯" : "التالي ❯";
        nextBtn.onclick = (e) => { 
            e.stopPropagation(); // السطر السحري لمنع الكبسة من تسكير القائمة
            currentTourStep++; 
            showSpotlightStep(); 
        };
    }

    if (step.target) {
        const sidebar = document.getElementById('sidebar');
        let delay = 0; 

        // فحص الموبايل وفتح السايد منيو غصب (بناءً على الأمر needsSidebar)
        if (window.innerWidth <= 768 && sidebar) {
            if (step.needsSidebar) {
                if (sidebar.classList.contains('collapsed')) {
                    sidebar.classList.remove('collapsed');
                    delay = 550; // انتظار 0.5 ثانية لحد ما تفتح القائمة بالكامل
                }
            } else {
                if (!sidebar.classList.contains('collapsed')) {
                    sidebar.classList.add('collapsed');
                    delay = 550;
                }
            }
        }

        // ⏱️ الانتظار لحد ما تخلص حركة القائمة الجانبية
        setTimeout(() => {
            // عمل سكرول للزر
            if (step.needsSidebar && sidebar) {
                step.target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            } else {
                step.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            
            // ⏱️ انتظار السكرول يخلص، بعدين نرسم المربع المنور
            setTimeout(() => {
                const rect = step.target.getBoundingClientRect();
                
                highlight.style.opacity = '1';
                highlight.style.top = (rect.top - 8) + 'px';
                highlight.style.left = (rect.left - 8) + 'px';
                highlight.style.width = (rect.width + 16) + 'px';
                highlight.style.height = (rect.height + 16) + 'px';

                tooltip.style.opacity = '1';
                tooltip.style.top = (rect.bottom + 20) + 'px';
                tooltip.style.left = '50%';
                tooltip.style.transform = 'translateX(-50%)';
                
                if (rect.bottom + 200 > window.innerHeight) {
                    tooltip.style.top = (rect.top - tooltip.offsetHeight - 20) + 'px';
                }
            }, 400); // 400 ملي ثانية لضمان استقرار الشاشة تماماً
        }, delay);

    } else {
        highlight.style.opacity = '0';
        highlight.style.top = '50%';
        highlight.style.left = '50%';
        highlight.style.width = '0px';
        highlight.style.height = '0px';

        tooltip.style.opacity = '1';
        tooltip.style.top = '50%';
        tooltip.style.left = '50%';
        tooltip.style.transform = 'translate(-50%, -50%)';
    }
}


function endSpotlightTour() {
    document.getElementById('spotlight-overlay').style.display = 'none';
    document.getElementById('spotlight-tooltip').style.display = 'none';
    localStorage.setItem('hasSeenTour', 'true');
    
    // تسكير السايد منيو بعد ما تخلص الجولة بالموبايل
    if (window.innerWidth < 768) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) sidebar.classList.add('collapsed');
    }
}



async function openAdminPanel() {
    if(window.innerWidth < 768) document.getElementById('sidebar').classList.add('collapsed');
    const mainContent = document.getElementById('main-content-area');
    if (!mainContent) return;

    if (!mainContent.dataset.originalContent) {
        mainContent.dataset.originalContent = mainContent.innerHTML;
    }

    const t = translations[currentLang || 'ar'];

    mainContent.innerHTML = `
        <header class="top-bar" style="margin-bottom: 20px;">
            <div class="header-row">
                <button onclick="backToDashboard()" class="btn-primary" style="padding: 5px 15px; font-size: 0.9rem;">${t.back}</button>
                <h1 style="margin: 0 15px; color: #ff9f43;"><i class="fa-solid fa-crown"></i> ${t.admin_panel}</h1>
            </div>
        </header>
        <section class="performance-container">
            <div class="performance-tabs" style="display: flex; gap: 5px; margin-bottom: 20px; background: rgba(255,255,255,0.05); padding: 5px; border-radius: 12px;">
                <button class="perf-tab-btn active-tab" onclick="switchAdminTab('requests', this)">طلبات الوحوش (فيديو)</button>
                <button class="perf-tab-btn" onclick="switchAdminTab('messages', this)">صندوق الوارد (دعم فني)</button>
            </div>

            <div id="admin-tab-requests" style="display: block;">
                <div id="admin-requests-container" style="text-align:center; padding:40px; color:var(--primary-color);">
                    <i class="fa-solid fa-spinner fa-spin fa-3x"></i>
                </div>
            </div>

            <div id="admin-tab-messages" style="display: none;">
                <div id="admin-messages-container" style="text-align:center; padding:40px; color:var(--primary-color);">
                    <i class="fa-solid fa-spinner fa-spin fa-3x"></i>
                </div>
            </div>
        </section>
    `;

    loadPendingWorkouts();
    loadAdminMessages(); // تحميل الرسائل
}

window.switchAdminTab = function(tab, btn) {
    document.querySelectorAll('.perf-tab-btn').forEach(b => b.classList.remove('active-tab'));
    btn.classList.add('active-tab');
    document.getElementById('admin-tab-requests').style.display = tab === 'requests' ? 'block' : 'none';
    document.getElementById('admin-tab-messages').style.display = tab === 'messages' ? 'block' : 'none';
};

// دالة سحب رسائل الدعم الفني للآدمن
async function loadAdminMessages() {
    const container = document.getElementById('admin-messages-container');
    try {
        const snapshot = await db.collection('contact_messages').orderBy('timestamp', 'desc').get();
        if (snapshot.empty) {
            container.innerHTML = `<div class="empty-notif" style="margin-top:50px;"><i class="fa-solid fa-inbox" style="font-size:4rem; color:var(--slate);"></i><p style="margin-top:15px; color:white;">لا توجد رسائل جديدة.</p></div>`;
            return;
        }

        let html = '<div style="display: flex; flex-direction: column; gap: 15px;">';
        snapshot.forEach(doc => {
            const data = doc.data();
            const date = data.timestamp ? data.timestamp.toDate().toLocaleString('en-GB') : 'غير معروف';
            html += `
                <div class="glass-card" style="border-right: 4px solid #3498db; text-align: right;">
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; margin-bottom: 10px;">
                        <span style="color: #3498db; font-weight: bold;"><i class="fa-solid fa-envelope"></i> ${data.email}</span>
                        <span style="color: var(--slate); font-size: 0.8rem;">${date}</span>
                    </div>
                    <p style="color: white; font-size: 0.95rem; white-space: pre-wrap; margin-bottom: 15px;">${data.message}</p>
                    <button class="btn-primary" onclick="deleteAdminMessage('${doc.id}')" style="padding: 5px 15px; background: rgba(255,77,77,0.1); color: #ff4d4d; border-color: #ff4d4d; font-size: 0.8rem;">حذف الرسالة <i class="fa-solid fa-trash"></i></button>
                </div>
            `;
        });
        container.innerHTML = html + '</div>';
    } catch (e) {
        container.innerHTML = `<p style="text-align:center; color:#ff4d4d;">حدث خطأ أثناء تحميل الرسائل</p>`;
    }
}


// 👑 دالة سحب طلبات الفيديوهات (التي انحذفت بالخطأ)
async function loadPendingWorkouts() {
    const container = document.getElementById('admin-requests-container');
    if (!container) return;

    const t = translations[currentLang || 'ar'];

    try {
        const snapshot = await db.collection('pending_workouts').orderBy('timestamp', 'desc').get();
        if (snapshot.empty) {
            container.innerHTML = `<div class="empty-notif" style="margin-top:50px;"><i class="fa-solid fa-check-circle" style="font-size:4rem; color:var(--primary-color);"></i><p style="margin-top:15px; color:white;">${t.admin_empty || 'لا يوجد طلبات معلقة!'}</p></div>`;
            return;
        }

        let html = '<div style="display: flex; flex-direction: column; gap: 15px;">';
        snapshot.forEach(doc => {
            const data = doc.data();
            let detailsHtml = data.details.map(ex => `<span style="display:inline-block; background:rgba(0,0,0,0.3); padding:3px 8px; border-radius:5px; margin:2px; font-size:0.8rem;">${ex.name}: ${ex.weight}kg x ${ex.reps}</span>`).join('');

            html += `
                <div class="glass-card" style="text-align: right; border-right: 4px solid var(--primary-color);">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 10px;">
                        <h3 style="color: white; margin: 0;"><i class="fa-solid fa-user-ninja" style="color: var(--primary-color);"></i> ${data.userName || 'بطل'}</h3>
                        <span style="color: var(--slate); font-size: 0.8rem;">${data.date}</span>
                    </div>
                    <p style="color: var(--primary-color); font-size: 0.9rem; margin-bottom: 10px;">${t.muscle_label || 'العضلة'}: ${data.type}</p>
                    <div style="margin-bottom: 15px;">${detailsHtml}</div>
                    <video src="${data.videoUrl}" controls style="width: 100%; max-height: 300px; border-radius: 10px; margin-bottom: 15px; background: #000;"></video>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn-primary" onclick="approveWorkout('${doc.id}')" style="flex: 1; padding: 10px;">✅ ${t.approve_btn || 'اعتماد'}</button>
                        <button class="btn-primary" onclick="rejectWorkout('${doc.id}')" style="flex: 1; padding: 10px; background: rgba(255,77,77,0.1); color: #ff4d4d; border-color: #ff4d4d;">❌ ${t.reject_btn || 'رفض'}</button>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html + '</div>';
    } catch (error) {
        console.error(error);
        container.innerHTML = `<p style="text-align:center; color:#ff4d4d;">حدث خطأ أثناء تحميل الطلبات</p>`;
    }
}


window.deleteAdminMessage = async function(docId) {
    if(!confirm("حذف الرسالة نهائياً؟")) return;
    try {
        await db.collection('contact_messages').doc(docId).delete();
        showToast("تم حذف الرسالة.");
        loadAdminMessages();
    } catch(e) { showToast("فشل الحذف!"); }
};



        
        async function approveWorkout(docId) {
    const t = translations[currentLang || 'ar'];
    if(!confirm(t.confirm_approve)) return;
    try {
        showToast(t.processing_wait);
        const docRef = db.collection('pending_workouts').doc(docId);
        const data = (await docRef.get()).data();

        // 1. جلب بيانات المستخدم الذي رفع الفيديو
        const userRef = db.collection('users').doc(data.userId);
        const userSnap = await userRef.get();
        let userData = userSnap.data();

        let workouts = userData.workouts || [];
        workouts.unshift({ date: data.date, type: data.type, details: data.details });

        // 2. فحص هل هناك وزن جديد أعلى من وزنه القديم؟
        let maxW = userData.stats?.maxWeight || 0;
        let isNewPR = false;
        
        data.details.forEach(ex => { 
            let exWeight = parseFloat(ex.weight);
            if(exWeight > maxW) {
                maxW = exWeight;
                isNewPR = true;
            }
        });

        // 3. تحديث بيانات المستخدم
        await userRef.update({
            workouts: workouts,
            isWorkoutPending: false,
            'stats.maxWeight': maxW,
            xp: firebase.firestore.FieldValue.increment(50)
        });

        // 4. إرسال إشعار موافقة للاعب نفسه
        await userRef.collection('notifications').add({
            type: 'admin_alert',
            senderId: 'admin', senderName: t.admin_name, senderPhoto: 'https://i.ibb.co/9mPmHXkh/cropped-circle-image-2.png',
            text: t.admin_notif_approve, status: 'pending', timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        // 🚨 الخطوة السحرية: إذا كسر رقمه الشخصي، نفحص هل كسر عرش مدينته؟
        if (isNewPR && userData.city) {
            await checkThroneUsurperFromAdmin(maxW, userData.city, userData.firstName, data.userId);
        }

        try { await storage.refFromURL(data.videoUrl).delete(); } catch(err) {}
        await docRef.delete();

        showToast(t.approve_success);
        loadPendingWorkouts();
    } catch (e) { 
        console.error(e); 
        showToast(t.approve_fail); 
    }
}

// دالة إطلاق إنذار سقوط العرش (تعمل بصمت في الخلفية بعد موافقة الآدمن)
async function checkThroneUsurperFromAdmin(newWeight, city, newKingName, newKingId) {
    try {
        // 1. جلب الملك السابق للمدينة (بناءً على الأوزان قبل هذا اللاعب)
        const snapshot = await db.collection('users')
            .where('city', '==', city)
            .orderBy('stats.maxWeight', 'desc')
            .limit(2) // نجيب أعلى 2 عشان نتاكد
            .get();

        let previousKingId = null;
        let previousKingWeight = 0;

        snapshot.forEach(doc => {
            // نبحث عن أعلى وزن للاعب "غير" اللاعب الحالي اللي اعتمدنا وزنه للتو
            if (doc.id !== newKingId && !previousKingId) {
                previousKingId = doc.id;
                previousKingWeight = doc.data().stats?.maxWeight || 0;
            }
        });

        // 2. إذا لم يكن هناك ملك سابق، أو وزنه أقل من الوزن الجديد.. إذن العرش سقط! 👑
        if (!previousKingId || newWeight > previousKingWeight) {
            
            // جلب كل أبطال المدينة لإبلاغهم
            const cityUsersSnap = await db.collection('users').where('city', '==', city).get();
            const batch = db.batch(); 
            let count = 0;
            
            cityUsersSnap.forEach(userDoc => {
                // نرسل الإنذار للجميع (باستثناء الملك الجديد نفسه)
                if (userDoc.id !== newKingId) { 
                    const notifRef = db.collection('users').doc(userDoc.id).collection('notifications').doc();
                    batch.set(notifRef, {
                        type: 'throne_fall',
                        newKingName: newKingName || 'بطل مجهول',
                        newWeight: newWeight,
                        city: city,
                        status: 'pending',
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    count++;
                }
            });

            // إطلاق الإنذار الشامل للمدينة
            if (count > 0) {
                await batch.commit(); 
                console.log(`تم إرسال إنذار سقوط العرش لـ ${count} لاعبين في مدينة ${city}`);
            }
        }
    } catch (error) {
        console.error("خطأ في فحص العرش:", error);
    }
}


async function rejectWorkout(docId) {
    const t = translations[currentLang || 'ar'];
    if(!confirm(t.confirm_reject)) return;
    try {
        showToast(t.deleting_wait);
        const docRef = db.collection('pending_workouts').doc(docId);
        const data = (await docRef.get()).data();

        await db.collection('users').doc(data.userId).update({ isWorkoutPending: false });
        
        // إرسال إشعار الرفض
                // إرسال إشعار الرفض
        await db.collection('users').doc(data.userId).collection('notifications').add({
            type: 'admin_alert', // <--- وغيرناها هون
            senderId: 'admin', senderName: t.admin_name, senderPhoto: 'https://i.ibb.co/9mPmHXkh/cropped-circle-image-2.png',
            text: t.admin_notif_reject, status: 'pending', timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });


        try { await storage.refFromURL(data.videoUrl).delete(); } catch(err) {}
        await docRef.delete();

        showToast(t.reject_success);
        loadPendingWorkouts();
    } catch (e) { 
        showToast(t.reject_fail); 
    }
}


function openGameSelection() {
    document.getElementById('game-selection-modal').style.display = 'flex';
    if(window.innerWidth < 768) {
        document.getElementById('sidebar').classList.add('collapsed');
    }
}

function closeGameSelection() {
    document.getElementById('game-selection-modal').style.display = 'none';
}

function activateButton(clickedButton) {
    const allButtons = document.querySelectorAll('.sidebar-btn');
    allButtons.forEach(btn => btn.classList.remove('active-btn'));
    clickedButton.classList.add('active-btn');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}



const firebaseConfig = {
    apiKey: "AIzaSyDV7SNwgv_K10tX0iJpNYqg8_iJnWprFB4",
    authDomain: "rgalab.firebaseapp.com",
    projectId: "rgalab",
    storageBucket: "rgalab.firebasestorage.app", // 🔥 هذا السطر اللي تصلح وانحل فيه اللغز!
    messagingSenderId: "882288745140",
    appId: "1:882288745140:web:3c77b0f83ac4e11d30d5e1"
};

// 1. تعريفات الفايربيس الأساسية (موجودة عندك مسبقاً)
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage(); 

// 2. الكود الآمن للإشعارات (أضفه هنا)
let messaging = null;
try {
    // التأكد من أن المتصفح (أو الآيفون) يدعم الإشعارات قبل تشغيلها
    if (firebase.messaging && firebase.messaging.isSupported()) {
        messaging = firebase.messaging();
        console.log("✅ نظام الإشعارات جاهز للعمل");
        
        // استقبال الإشعارات والتطبيق مفتوح
        messaging.onMessage((payload) => {
            showToast(`🔔 ${payload.notification.title}: ${payload.notification.body}`);
        });
    } else {
        console.log("⚠️ هذا المتصفح لا يدعم إشعارات الويب");
    }
} catch (error) {
    console.error("❌ تم تجاوز خطأ الإشعارات للحفاظ على عمل الموقع:", error);
}




// ==========================================
// 🛡️ نظام حفظ تسجيل الدخول والتوجيه التلقائي
// ==========================================
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
  .then(() => {
    // مراقبة حالة المستخدم بشكل دائم
    firebase.auth().onAuthStateChanged((user) => {
        // معرفة الصفحة الحالية اللي فاتحها المستخدم
        const currentPath = window.location.pathname;
        const isIndexPage = currentPath.endsWith('index.html') || currentPath === '/';

        if (user) {
            // 🟢 إذا المستخدم مسجل دخول
            if (isIndexPage) {
                // إذا كان بصفحة البداية (index)، انقله فوراً للوحة التحكم
                window.location.replace('dashboard.html');
            }
        } else {
            // 🔴 إذا المستخدم مش مسجل دخول (أو عمل تسجيل خروج)
            if (!isIndexPage) {
                // إذا كان بيحاول يدخل لوحة التحكم، رجعه لصفحة البداية
                window.location.replace('index.html');
            }
        }
    });
  })
  .catch((error) => {
    console.error("Error setting persistence:", error);
  });


const translations = {
    ar: {
        cancel_upload: " تم إلغاء التسجيل.. جرب مرة ثانية بس تكون جاهز تثبت قوتك!",
        video_size_error: " حجم الفيديو كبير جداً! حاول تقصه أو تضغط حجمه لتتجاوز 30 ميجا.",
        upload_fail_storage: " فشل الرفع! تأكد من اتصالك بالإنترنت.",
        upload_success_wait: " تم رفع الفيديو بنجاح! الإدارة بتراجع إثباتك، استنى شوي.",
        save_db_error: " تم رفع الفيديو لكن فشل الحفظ! حاول مرة أخرى.",
        calc_error: "يرجى إدخال وزن وعدات صحيحة!",


        dashboard: "لوحة التحكم",
        welcome: "سعيد برؤيتك، كابتن",
        processing_wait: "جاري المعالجة... ⏳",
        approve_success: "✅ تم الاعتماد بنجاح!",
        approve_fail: "❌ فشل الاعتماد!",
        deleting_wait: "جاري الحذف... ⏳",
        reject_success: "🗑️ تم الرفض.",
        reject_fail: "❌ فشل الرفض!",
        error_loading: "حدث خطأ أثناء تحميل البيانات.",
        admin_name: "الإدارة 👑",
        leaderboard: " لوحة المتصدرين",
        logout: " تسجيل الخروج",
        level: "المستوى",
        xp: "نقاط الخبرة",
        streak: "سلسلة الدخول",
        days: "يوم",
        id_text: "معرف اللاعب:",
        back: "رجوع",
        lang_en: "English",
        lang_ar: "العربية",
        home_btn: "الرئيسية",
        language_btn: " اللغة الرئيسية",
        profile_btn: " الملف الشخصي",
        performance_center: "مركز الأداء",
        analytics: "التحليلات",
        workout_history: "سجل التمارين",
        games_btn: " الألعاب والتحديات",
        achievements: " غرفة الجوائز",
        friends_center: " مجتمع الأبطال",
        city_monster: "وحش المدينة",
        loading: "جاري التحميل...",
        
        tour_1_title: "أهلاً بك في RGA Pro! ",
        tour_1_text: "مكانك الجديد لبناء العضلات وتحطيم الأرقام. خلينا ناخذ لفة سريعة بالتطبيق عشان تعرف من وين تبدأ.",
        tour_2_title: "سجل تمارينك ",
        tour_2_text: "اضغط على زر (تمرين جديد) لتوثيق أوزانك، كل تمرين بتسجله بيعطيك 50 XP لترفع مستواك وتنافس الوحوش.",
        tour_3_title: "وحش المدينة ",
        tour_3_text: "اكتشف الخريطة! إذا كسرت رقم قياسي، رح نطلب منك إثبات فيديو، وممكن تصير أنت الملك المطلوب بمدينتك.",
        tour_4_title: "غرفة الجوائز ",
        privacy_title: "سياسة الخصوصية",
        privacy_desc: "نحن نأخذ خصوصيتك على محمل الجد. يتم تخزين جميع بياناتك بشكل آمن ولا تتم مشاركتها مع أي طرف ثالث.",

        auth_login_tab: "تسجيل الدخول",
        auth_signup_tab: "تسجيل جديد",

        login_success: " تم الدخول، جاري تحويلك...",


        auth_email_ph: "البريد الإلكتروني",
        auth_pass_ph: "كلمة المرور",
        auth_login_btn: "الدخول",
        auth_forgot_pass: "نسيت كلمة المرور؟",
        auth_fname_ph: "الاسم الأول",
        auth_lname_ph: "الاسم الأخير",
        auth_signup_btn: "إنشاء حساب",
        prompt_email: "الرجاء إدخال بريدك الإلكتروني المسجل لدينا:",
        reset_sent: " تم إرسال رابط استعادة كلمة المرور إلى بريدك.",

        terms_title: "شروط الخدمة",
        terms_desc: "باستخدامك للتطبيق، فإنك توافق على عدم استخدام أي وسائل غش. أي حساب يثبت عليه الغش سيتم حظره.",
        err_invalid_cred: " البريد الإلكتروني أو كلمة المرور غير صحيحة!",
        err_email_in_use: " هذا البريد الإلكتروني مسجل مسبقاً!",
        err_user_not_found: " هذا البريد مش مسجل عنا!",
        err_weak_pass: " كلمة المرور ضعيفة (يجب أن تكون 6 أحرف على الأقل).",
        err_invalid_email: " صيغة البريد الإلكتروني غير صحيحة!",
        err_default: " حدث خطأ، يرجى المحاولة لاحقاً.",


        tour_4_text: "كل ما تتعب أكثر، بتفتح أوسمة نادرة بتثبت إنك وحش حقيقي. جاهز للتحدي؟",
        btn_next: "التالي ❯",
        btn_start: "ابدأ التحدي ",
        btn_skip: "تخطي",
        tour_5_title: "مركز الأداء ",
        tour_5_text: "راقب تطورك، شوف إحصائياتك، وقارن مستواك عشان تضل على الطريق الصح.",
        tour_6_title: "مجتمع الأبطال ",

        ft_privacy: "سياسة الخصوصية",
        ft_terms: "شروط الخدمة",
        ft_community: "سياسات مجتمع الأبطال",
        
        legal_privacy_title: "سياسة الخصوصية وحماية البيانات",
        legal_privacy_body: `
            <p>تاريخ آخر تحديث: 1 أكتوبر 2026</p>
            <p>في <b>RGA Fitness Pro</b>، نأخذ خصوصيتك على محمل الجد. توضح هذه السياسة كيف نقوم بجمع، استخدام، وحماية بياناتك الشخصية أثناء استخدامك لمنصتنا.</p>
            <h3>1. البيانات التي نجمعها</h3>
            <p>نحن نجمع المعلومات التي تقدمها مباشرة عند إنشاء الحساب (الاسم، البريد الإلكتروني)، بالإضافة إلى بيانات الأداء الرياضي (الأوزان المسجلة، الروتين التدريبي، الفيديوهات المرفوعة كإثبات قوة).</p>
            <h3>2. استخدام فيديوهات الإثبات</h3>
            <p>الفيديوهات التي يتم رفعها لإثبات "أعلى وزن" (Max Weight) تُستخدم حصرياً من قبل الإدارة للتحقق من صحة الإنجاز ومنع الغش في لوحة الصدارة. لا يتم مشاركة هذه الفيديوهات مع أطراف خارجية، ويتم الاحتفاظ بها في خوادم مشفرة مؤقتاً.</p>
            <h3>3. أمان البيانات</h3>
            <p>نستخدم أحدث تقنيات التشفير (Firebase Secure Servers) لضمان عدم وصول أي طرف غير مصرح له إلى بياناتك أو رسائلك الخاصة في "مجتمع الأبطال".</p>
            <h3>4. حقوقك</h3>
            <p>يحق لك في أي وقت طلب نسخة من بياناتك، أو طلب حذف حسابك بالكامل (بما في ذلك أرشيف التمارين والمراسلات) عبر التواصل مع الدعم الفني.</p>
        `,

        legal_terms_title: "شروط الخدمة والاستخدام",
        legal_terms_body: `
            <p>مرحباً بك في عالم الوحوش. باستخدامك لتطبيق RGA Fitness Pro، فإنك توافق التزاماً كاملاً بالشروط التالية:</p>
            <h3>1. الروح الرياضية والنزاهة</h3>
            <p>التطبيق مبني على التنافس الشريف. أي محاولة لادخال أوزان وهمية، أو التلاعب بالأنظمة، أو رفع فيديوهات مزيفة ستؤدي إلى <b>الحظر النهائي</b> الفوري وتصفير جميع نقاط الخبرة (XP).</p>
            <h3>2. الحساب والمسؤولية</h3>
            <p>أنت مسؤول مسؤولية كاملة عن الحفاظ على سرية كلمة المرور الخاصة بك. أي نشاط يحدث عبر حسابك يقع تحت مسؤوليتك.</p>
            <h3>3. العملات الافتراضية (XP) والأغلفة</h3>
            <p>نقاط الخبرة (XP) هي عملة افتراضية تُستخدم داخل التطبيق لشراء الأغلفة (Covers) والترقية. لا تحمل هذه النقاط أي قيمة مالية حقيقية ولا يمكن استبدالها بأموال نقدية.</p>
            <h3>4. إخلاء المسؤولية الطبية</h3>
            <p>المعلومات الرياضية ومؤشرات (TSB & رادار العضلات) مبنية على خوارزميات رياضية استرشادية. نحن لا نقدم استشارات طبية، وأنت تتحمل مسؤولية سلامتك الجسدية أثناء رفع الأوزان.</p>
        `,

        legal_community_title: "سياسات مجتمع الأبطال",
        legal_community_body: `
            <p>مجتمعنا بُني لدعم وتحفيز الرياضيين. للحفاظ على بيئة احترافية، نطبق القواعد التالية بصرامة:</p>
            <ul>
                <li><b>الاحترام المتبادل:</b> يُمنع منعاً باتاً استخدام لغة مسيئة، تنمر، أو تقليل من إنجازات اللاعبين الآخرين في الرسائل الخاصة.</li>
                <li><b>التحديات النظيفة:</b> عند إرسال تنبيه "سقوط العرش"، اجعل المنافسة رياضية بحتة.</li>
                <li><b>الخصوصية:</b> الدردشات محمية وتختفي بعد 24 ساعة، ولكن يُمنع استغلال هذه الميزة لإرسال محتوى غير لائق أو إعلانات (Spam).</li>
                <li><b>التبليغ:</b> يحق لأي لاعب الإبلاغ عن حساب آخر في حال انتهاك هذه السياسات، وستقوم الإدارة بمراجعة السجل واتخاذ الإجراءات الصارمة.</li>
            </ul>
            <p>نحن هنا لنرفع الأوزان، ونرفع بعضنا البعض نحو القمة!</p>
        `,


        tour_6_text: "هون بتشوف ترتيبك بين الوحوش بالليدربورد. اثبت نفسك وخليهم يشوفوا اسمك بالصدارة!",
        tour_7_title: "الملف الشخصي ",

        tour_7_text: "من هون بتقدر تعدل بياناتك، وتتحكم بحسابك وإعداداتك بالكامل.",

        // ترجمة الحاسبة والقوالب
        calc_title: "حاسبة أقصى وزن (1RM) ",
        calc_desc: "احسب أقصى وزن نظري لعدة واحدة",
        calc_weight_ph: "الوزن (kg)",
        calc_reps_ph: "العدات",
        calc_btn: "احسب قوتي ",
        calc_result_label: "أقصى وزن لعدة واحدة:",
        template_btn: " تعبئة قالب جاهز",
        template_loaded: "تم تحميل القالب الجاهز! عبي أوزانك يا وحش ",



        badge_completed: "مكتمل ",
        reward_text: "الجائزة: ",
        level_up: " مبروك! وصلت للمستوى",
        streak_fire: "🔥 وحش! الستريك تبعك صار",
        days_streak: "أيام!",
        empty_log: "لا يوجد تمارين مسجلة بعد. ابدأ الآن! ",
        add_weights_msg: "سجل أوزانك في التمارين لتظهر هنا 📈",
        empty_chart: "لا يوجد بيانات كافية للرسم البياني",
        level_promo: "استمر بالتمرين للترقية!",
        streak_promo: "سجل دخول يومياً لمضاعفة النقاط",
        enter_id_msg: "أدخل ID اللاعب للبحث عنه",
        search_heroes_msg: "ابحث عن أصدقائك وضيفهم لتبدأ التحديات!", // <-- هنا كان الخلل (الفاصلة ناقصة)
        
        // --- لوحة الإدارة (Admin Panel) ---
        admin_panel: "👑 لوحة الإدارة",
        admin_requests: "👑 طلبات الوحشنة",
        admin_loading: "جاري سحب الفيديوهات من السيرفر...",
        admin_empty: "لا يوجد طلبات معلقة!",
        approve_btn: "✅ اعتماد الوحش",
        reject_btn: "❌ رفض وغش",
        captain: "الكابتن",
        workout_date: "التاريخ",
        muscle_label: "العضلة",
        confirm_approve: "متأكد إنك بدك تعتمد هذا الوزن الأسطوري؟",
        confirm_reject: "هل أنت متأكد من رفض الطلب؟ سيتم حذف الفيديو.",
        admin_notif_approve: "تم مراجعة الفيديو واعتماد وحشنتك بنجاح! عاش يا بطل 🔥",
        admin_notif_reject: "للأسف تم رفض الإثبات الخاص بك! إما أن الوزن غير صحيح أو الفيديو غير واضح.",

        // --- نظام إثبات القوة ورفع الفيديو ---
        pending_review_msg: "⏳ وحش! عندك تمرين أسطوري قيد المراجعة.. استرخي شوي لبين ما نعتمدلك ياه!",
        heavy_lift_alert: " إنت وحش!!\nلأنك قطعت الدنيا، لازم ترفع فيديو يثبت قوتك عشان نعتمدلك الرقم ونحطه بالليدربورد.\nجاهز ترفع الفيديو؟",
        uploading_proof: "جاري رفع إثبات الوحشنة... لا تطلع من التطبيق! 🚀",
        upload_success: "✅ تم رفع الفيديو بنجاح! الإدارة بتراجع وحشنتك، استنى شوي يا بطل.",
        upload_fail: "❌ فشل رفع الفيديو.. تأكد من الإنترنت وجرب كمان مرة.",

        // --- الخريطة ووحش المدينة ---
        country_select: "اختر الدولة...",
        city_select: "اختر المدينة...",
        save_location: "حفظ الموقع",
        no_monster_yet: "لا يوجد وحش في هذه المدينة بعد! كن أنت الأول.",
        challenge_him: "تحدى الوحش ⚔️",

        help_btn: "جولة تعريفية",

        max_weight_record: "أعلى وزن: ",
        battleground: "ساحة المعركة ⚔️",
        weights_filter: "الأوزان",
        commitment_filter: "الالتزام",
        map_level_filter: "المستوى",
        wanted_dead: "مطلوب للعدالة ",
        silver_guard: " حارس فضي",
        bronze_guard: " حارس برونزي",
        tribute_btn: " تحصيل ضريبة الملك",


        // --- الرئيسية ---
        nav_features: "الميزات", nav_stats: "الإحصائيات", nav_help: "المساعدة",
        hero_subtitle: "حوّل لياقتك إلى لعبة", hero_title: "ارتقِ بقوتك",
        hero_desc: "انضم إلى ثورة اللياقة البدنية. اكتسب نقاط خبرة، تنافس مع الأصدقاء، وحقق أهدافك بطريقة لم تتخيلها من قبل.",
        btn_start: "ابدأ التحدي الآن",
        stat_active: "عضو نشط", stat_weight: "كجم تم رفعه", stat_challenges: "تحدي مكتمل",
        feat_main_1: "أطلق", feat_main_2: "العنان لقدراتك",
        feat_subtitle: "كل ما تحتاجه للوصول إلى القمة في منصة واحدة متكاملة.",
        feat1_title: "نظام وحش المدينة", feat1_desc: "سيطر على خريطة مدينتك! ارفع أعلى وزن، قدم فيديو إثبات للإدارة، واجلس على العرش.",
        feat2_title: "رادار العضلات & TSB", feat2_desc: "راقب توازنك العضلي وجاهزيتك العصبية عبر رسوم بيانية تمنعك من الإصابة.",
        feat3_title: "تمرين لايف التفاعلي", feat3_desc: "سجل جولاتك بالوقت الفعلي، مع نظام راحة ذكي وتنبيهات عند كسر الأرقام.",
        feat4_title: "ألعاب القوة والتحديات", feat4_desc: "العب الديدليفت والسكوات المصغرة لجمع نقاط الـ XP والمنافسة.",
        help_title: "مركز المساعدة ", faq_tab: "الأسئلة الشائعة", contact_tab: "تواصل معنا",
        contact_desc: "عندك مشكلة أو اقتراح؟ ابعث للإدارة مباشرة!", send_msg: "إرسال الرسالة",
        email_ph: "بريدك الإلكتروني", msg_ph: "اكتب رسالتك هنا...",

        tribute_success: "💰 تم تحصيل +50 XP ضريبة الملك!",
        tribute_claimed: "الضريبة محصلة اليوم ",

        // --- إضافات وحش المدينة والخريطة ---
        map_weights: " الأوزان",
        map_streak: " الالتزام",
        map_level: " المستوى",
        my_city: " (مدينتي)",
        locating_city: "جاري تحديد موقع المدينة...",
        moving_to: "جاري الانتقال إلى",

        corp_about_title: "عن RGA Fitness Pro",
        corp_about_desc: "نحن لسنا مجرد تطبيق للياقة البدنية؛ نحن مؤسسة رائدة في تكنولوجيا الأداء الرياضي. هدفنا هو دمج العلم مع الألعاب لخلق تجربة تدريبية فريدة تدفع بالبشر إلى أقصى قدراتهم البدنية والذهنية.",
        corp_values_title: "قيمنا الأساسية",
        val1_t: "النزاهة", val1_d: "نظام التحقق بالفيديو يضمن منافسة شريفة للجميع.",
        val2_t: "الابتكار", val2_d: "استخدام خوارزميات الـ TSB والرادار العضلي المتقدمة.",
        val3_t: "الشمولية", val3_d: "مجتمع عالمي يضم أبطالاً من كافة أنحاء العالم.",
        corp_contact_title: "المراسلات الرسمية",
        corp_contact_desc: "للاستفسارات التجارية، الشراكات، أو الدعم الفني المتقدم، يرجى التواصل معنا عبر القنوات الرسمية:",
        corp_response_time: "وقت الاستجابة المتوقع: خلال 24 ساعة عمل.",
        general_muscle: "عام",
        max_weight_label: "أعلى وزن",
        continuous_streak: "الالتزام المستمر:",
        current_rank: "الرتبة الحالية:",
        city_monster_crown: " وحش المدينة",
        silver_guard_crown: " حارس فضي",
        bronze_guard_crown: " حارس برونزي",
        gym_label: "نادي:",
        challenge_sword: "تحدي ",
        monster_error: "حدث خطأ أثناء تحميل الحراس! (قد تحتاج لإنشاء Index في فايربيس)",
        champion_of: "بطل",
        got_it_btn: "فهمت، أنا جاهز! ⚔️",

        nav_home: "الرئيسية",
        nav_performance: "الأداء",
        nav_community: "مجتمع الأبطال",
        nav_profile: "بروفايل",


        // --- البروفايل ---
        edit_bio: "تعديل الوصف",
        save_bio: "حفظ الوصف",
        bio_placeholder: "اكتب شيئاً عن طموحك الرياضي...",
        my_badges: " أوسمتي المحققة",
        total_achievements: "إجمالي الإنجازات",
        stats_summary: " ملخص الأداء",
        undefined_country: "الدولة غير محددة",
        undefined_city: "المدينة غير محددة",
        no_gym: "غير منتمي لنادي",
        gym_placeholder: "اسم النادي (اختياري)",
        profile_save_success: "✅ تم حفظ البروفايل بنجاح!",

        // --- تسجيل التمارين والمهام ---
        daily_tasks: "مهام اليوم",
        log_workout: "سجل تمرينك",
        log_meal: "وجبة صحية",
        workout_title: "تسجيل التمرين",
        select_split: "اختر نظام تمرينك اليوم:",
        split_bro: "عضلة مفردة (Bro Split)",
        split_ppl: "دفع / سحب / أرجل (PPL)",
        split_full: "شامل (Full Body)",
        select_muscle: "حدد العضلة المستهدفة:",
        add_exercise: "إضافة تمرين آخر",
        save_workout: "حفظ وإنهاء (+50 XP)",
        ex_name: "التمرين",
        ex_reps: "العدات",
        ex_weight: "الوزن (kg)",
        ex_error: "يرجى إضافة تمرين واحد على الأقل للحفظ.",
        workout_success: "أداء ممتاز! تم تسجيل التمرين",
        meal_success: "بالصحة والعافية!",
        sidebar_competitions: "منافسات وتحديات",
        sidebar_settings: "الإعدادات والمساعدة",
        live_ex_name_ph: "اسم التمرين",
        live_ex_weight_ph: "الوزن (kg)",
        live_ex_reps_ph: "العدات",
        live_summary_title: "تمرين أسطوري! ",
        live_summary_subtitle: "عاش يا وحش، النتيجة بتحكي عنك",
        live_duration: "المدة",
        live_volume: "الحجم (kg)",
        live_sets: "الجولات",
        live_continue: "استمرار ❯",



        muscle_chest: "صدر", muscle_back: "ظهر", muscle_shoulders: "أكتاف",
        muscle_biceps: "بايسبس", muscle_triceps: "ترايسبس", muscle_legs: "أرجل", muscle_core: "بطن",
        sys_push: "دفع (Push)", sys_pull: "سحب (Pull)", sys_legs: "أرجل (Legs)", sys_full: "شامل (Full Body)",

        // --- الألعاب والتحديات ---
        deadlift_btn: " تحدي الديدليفت",
        squat_btn: " تحدي السكوات",
        choose_challenge: "اختر التحدي 🏆",
        challenge_subtitle: "ارتقِ بأدائك وحطم أرقامك القياسية!",
        deadlift_title: "ديدليفت",
        deadlift_desc: "ارفع بسرعة واجمع النقاط",
        squat_title: "سكوات",
        squat_desc: "توازن بدقة بالمنطقة الخضراء",
        cancel_return: "إلغاء والعودة",
        time: "الوقت",
        earned_xp: "النقاط",
        best_combo: "أعلى كومبو",
        mistakes: "الأخطاء",
        exit_session: "إنهاء الجولة",
        exit_challenge: "إنهاء التحدي",
        exit_confirm: "هل أنت متأكد من الخروج وإلغاء الجولة؟",
        great_job: "عاش يا بطل!",
        game_over: "الجولة انتهت!",
        good_luck: "حظ أوفر!",

        // --- مجتمع الأبطال والإشعارات ---
        search_id: "🔍 البحث بالـ ID",
        my_friends: " أصدقائي",
        search_placeholder: "أدخل الـ ID (مثال: A1B2C)",
        search_btn: "بحث",
        searching: "جاري البحث...",
        player_not_found: "لم يتم العثور على أي بطل بهذا الـ ID!",
        own_id_msg: "هذا المعرف الخاص بك يا بطل!",
        send_request: "إرسال طلب صداقة",
        hero_profile: " بروفايل البطل",
        earned_badges_title: "الأوسمة المحققة 🏅",
        no_badges_yet: "لم يحقق أوسمة بعد.",
        no_friends_yet: "لا يوجد أصدقاء بعد",
        chat_btn: "دردشة",
        type_message: "اكتب رسالة...",
        loading_messages: "جاري تحميل الرسائل المشفرة... ⏳",
        messages_disappear: "تبدأ الرسائل بالاختفاء بعد 24 ساعة ⏳<br>ابدأ التحدي الآن!",
        notifications: "الإشعارات ",
        mark_read: "تحديد كـ مقروء",
        no_notifications: "لا توجد إشعارات جديدة",
        friend_request_from: "أرسل لك طلب صداقة!",
        accept: "قبول",
        reject: "رفض",
        message_from: "رسالة من",

        challenges_title: "التحديات",
        challenges_desc: "العب، اجمع نقاط، ونافس الوحوش",

        click_to_reply: "انقر للرد"
    },
    en: {
        // --- Basics ---
        dashboard: "Dashboard",
        welcome: "Great to see you, Captain",
        processing_wait: "Processing... ⏳",
        approve_success: "✅ Approved successfully!",
        approve_fail: "❌ Approval failed!",
        deleting_wait: "Deleting... ⏳",
        challenges_title: "Challenges",
        challenges_desc: "Play, earn XP, and compete",

        reject_success: "🗑️ Rejected.",
        reject_fail: "❌ Rejection failed!",
        error_loading: "Error loading data.",

        cancel_upload: " Logging cancelled.. try again when you are ready to prove your strength!",
        video_size_error: " Video size is too large! Please trim or compress it under 30MB.",
        upload_fail_storage: " Upload failed! Please check your internet connection.",
        upload_success_wait: " Video uploaded successfully! Admin is reviewing your proof.",
        save_db_error: " Video uploaded but failed to save! Please try again.",

        admin_name: "Admin 👑",
        leaderboard: " Leaderboard",
        logout: " Logout",
        level: "Level",
        xp: "Experience Points",
        streak: "Current Streak",
        days: "Days",
        id_text: "Player ID:",
        back: "Back",
        lang_en: "English",
        lang_ar: "العربية",
        home_btn: "Home",
        language_btn: " Language",
        profile_btn: " Profile",
        performance_center: "Performance Center",
        analytics: "Analytics",
        workout_history: "Workout Log",
        games_btn: " Games & Challenges",



        corp_about_title: "About RGA Fitness Pro",
        corp_about_desc: "We are more than just a fitness app; we are a leading institution in sports performance technology. Our mission is to merge science with gamification to create a unique training experience that pushes humans to their physical and mental limits.",
        corp_values_title: "Our Core Values",
        auth_login_tab: "Login",
        auth_signup_tab: "Sign Up",
        auth_email_ph: "Email Address",
        auth_pass_ph: "Password",
        auth_login_btn: "Log In",
        auth_forgot_pass: "Forgot Password?",
        login_success: " Login successful! Redirecting...",

        auth_fname_ph: "First Name",
        auth_lname_ph: "Last Name",
        auth_signup_btn: "Create Account",
        prompt_email: "Please enter your registered email address:",
        reset_sent: " Password reset link sent to your email.",

        val1_t: "Integrity", val1_d: "Our video verification system ensures fair competition for everyone.",
        val2_t: "Innovation", val2_d: "Utilizing advanced TSB algorithms and muscle radar technology.",
        val3_t: "Global Community", val3_d: "A worldwide ecosystem connecting heroes from all walks of life.",
        corp_contact_title: "Official Correspondence",
        corp_contact_desc: "For business inquiries, partnerships, or advanced technical support, please contact us via our official channels:",
        corp_response_time: "Expected response time: Within 24 business hours.",
        achievements: " Trophy Room",
        friends_center: " Heroes Community",
        city_monster: "City Monster",
        loading: "Loading...",

        tour_5_title: "Performance Center ",
        tour_5_text: "Track your progress, view stats, and compare your previous levels to stay on track.",
        tour_6_title: "Champions Community ",
        tour_6_text: "Check your rank among the beasts. Prove yourself and reach the top of the leaderboard!",
        tour_7_title: "Profile & Settings ",
        tour_7_text: "Manage your account, edit your details, and track your overall progress here.",

        badge_completed: "Completed ",


        sidebar_competitions: "Competitions & Challenges",
        sidebar_settings: "Settings & Help",
        live_ex_name_ph: "Exercise Name",
        live_ex_weight_ph: "Weight (kg)",
        live_ex_reps_ph: "Reps",
        live_summary_title: "Legendary Workout! ",
        live_summary_subtitle: "Great job beast, the results speak for themselves",
        live_duration: "Duration",
        live_volume: "Volume (kg)",
        live_sets: "Sets",
        live_continue: "Continue ❯",

        reward_text: "Reward: ",
        level_up: " Congrats! You reached Level",
        streak_fire: "🔥 Beast! Your streak is now",

        privacy_title: "Privacy Policy",
        privacy_desc: "We take your privacy seriously. All your data is stored securely and is not shared with any third party.",
        terms_title: "Terms of Service",
        terms_desc: "By using the app, you agree not to use any cheats. Any account caught cheating will be banned permanently.",

        days_streak: "days!",
        empty_log: "No workouts logged yet. Start now! ",
        add_weights_msg: "Log your weights to see progress 📈",
        empty_chart: "Not enough data for the chart",
        level_promo: "Keep training to level up!",
        streak_promo: "Login daily to multiply XP",
        enter_id_msg: "Enter Player ID to search",
        search_heroes_msg: "Search for friends and start the challenge!", // <-- هنا كان الخلل بالنسخة الانجليزية كمان

        tour_1_title: "Welcome to RGA Pro! ",
        // ترجمة الحاسبة والقوالب
        calc_title: "1RM Calculator ",
        calc_desc: "Calculate your theoretical 1 Rep Max",
        calc_weight_ph: "Weight (kg)",
        calc_reps_ph: "Reps",
        calc_btn: "Calculate Power ",
        calc_result_label: "Your 1 Rep Max:",
        template_btn: " Load Template",
        template_loaded: "Template loaded! Add your weights ",


        tour_1_text: "Your new home to build muscle and break records. Let's take a quick tour.",
        tour_2_title: "Log Your Workouts ",
        tour_2_text: "Click (New Workout) to log your weights. Every workout gives you 50 XP to level up.",
        tour_3_title: "City Monster ",
        tour_3_text: "Explore the map! Break a record, upload video proof, and become the targeted King of your city.",
        tour_4_title: "Trophy Room ",
        nav_home: "Home",
        nav_performance: "Stats",
        nav_community: "Community",
        nav_profile: "Profile",

        tour_4_text: "The harder you work, the more rare badges you unlock. Ready for the challenge?",
        btn_next: "Next ❯",
        btn_start: "Start ",
        btn_skip: "Skip",

        admin_panel: "👑 Admin Panel",
        calc_error: "Please enter valid weight and reps! ",


        admin_requests: "👑 Beast Requests",
        admin_loading: "Fetching videos from server...",
        admin_empty: "No pending requests!",
        approve_btn: "✅ Approve Beast",
        reject_btn: "❌ Reject & Cheat",
        help_btn: "App Tour",

        captain: "Captain",
        workout_date: "Date",
        muscle_label: "Muscle",
        confirm_approve: "Are you sure you want to approve this legendary weight?",
        confirm_reject: "Are you sure you want to reject? Video will be deleted.",
        admin_notif_approve: "Video reviewed and beast status approved! Well done, Champ! 🔥",
        admin_notif_reject: "Unfortunately, your proof was rejected! Weight incorrect or video unclear.",

        // --- Video Proof System ---
        pending_review_msg: "⏳ Champ! You have a legendary workout under review.. relax while we verify it!",
        heavy_lift_alert: " You're a Beast!!\nYou broke the record! You must upload a video to prove your strength and claim the throne.\nReady to upload?",
        uploading_proof: "Uploading proof of strength... don't close the app! 🚀",
        upload_success: "✅ Video uploaded successfully! Admin is reviewing your lift, hold on Champ.",
        upload_fail: "❌ Upload failed.. check your connection and try again.",

        // --- Map & City Monster ---
        country_select: "Select Country...",
        city_select: "Select City...",
        save_location: "Save Location",
        no_monster_yet: "No monster in this city yet! Be the first.",
        challenge_him: "Challenge ⚔️",
        max_weight_record: "Max Weight: ",
        battleground: "Battleground ⚔️",

        err_invalid_cred: " Invalid email or password!",
        err_email_in_use: " This email is already registered!",
        err_user_not_found: " This email is not registered with us!",
        err_weak_pass: " Password is too weak (min 6 characters).",
        err_invalid_email: " Invalid email format!",
        err_default: " An error occurred, please try again.",

        weights_filter: "Weights",
        commitment_filter: "Commitment",
        map_level_filter: "Level",
        wanted_dead: "Wanted Dead or Alive ☠️",
        silver_guard: " Silver Guard",
        bronze_guard: " Bronze Guard",
        tribute_btn: " Claim King's Tribute",
        tribute_success: "💰 +50 XP King's tribute claimed!",
        tribute_claimed: "Tribute already claimed today ",

        // --- City Monster Additions ---
        map_weights: " Weights",
        map_streak: " Commitment",
        map_level: " Level",
        my_city: " (My City)",
        locating_city: "Locating city...",
        moving_to: "Moving to",
        general_muscle: "General",
        max_weight_label: "Max Weight",
        continuous_streak: "Continuous Streak:",
        current_rank: "Current Rank:",
        city_monster_crown: " City Monster",
        silver_guard_crown: " Silver Guard",
        bronze_guard_crown: " Bronze Guard",
        gym_label: "Gym:",
        challenge_sword: "Challenge ⚔️",
        monster_error: "Error loading guards! (You may need a Firebase Index)",
        champion_of: "Champion of",
        got_it_btn: "Got it, I'm ready! ⚔️",

        // --- Profile & Stats ---
        edit_bio: "Edit Bio",
        save_bio: "Save Bio",
        bio_placeholder: "Write something about your fitness goals...",
        my_badges: " Earned Badges",
        total_achievements: "Total Achievements",
        stats_summary: " Stats Summary",
        undefined_country: "Country undefined",
        undefined_city: "City undefined",
        no_gym: "No gym membership",
        gym_placeholder: "Gym name (Optional)",
        profile_save_success: "✅ Profile saved successfully!",

        // --- Workout Logging ---
        daily_tasks: "Daily Tasks",
        log_workout: "Log Workout",
        log_meal: "Healthy Meal",
        workout_title: "Log Workout",
        select_split: "Select your workout split:",
        split_bro: "Muscle Group (Bro Split)",
        split_ppl: "Push / Pull / Legs (PPL)",
        split_full: "Full Body",
        select_muscle: "Select target muscle:",
        add_exercise: "Add another exercise",
        save_workout: "Save & Finish (+50 XP)",
        ex_name: "Exercise",
        ex_reps: "Reps/Sets",
        ex_weight: "Weight (kg)",
        ex_error: "Please add at least one exercise to save.",
        workout_success: "Great job! Workout logged",
        meal_success: "Bon appétit!",
        muscle_chest: "Chest", muscle_back: "Back", muscle_shoulders: "Shoulders",
        muscle_biceps: "Biceps", muscle_triceps: "Triceps", muscle_legs: "Legs", muscle_core: "Core",
        sys_push: "Push", sys_pull: "Pull", sys_legs: "Legs", sys_full: "Full Body",

        // --- Games & Challenges ---
        deadlift_btn: " Deadlift Challenge",
        squat_btn: " Squat Challenge",
        choose_challenge: "Choose Challenge 🏆",

        // --- Home ---
        nav_features: "Features", nav_stats: "Stats", nav_help: "Help",
        hero_subtitle: "Gamify Your Fitness", hero_title: "Level Up Your Power",
        hero_desc: "Join the fitness revolution. Earn XP, compete with friends, and achieve your goals like never before.",
        btn_start: "Start Challenge Now",
        stat_active: "Active Members", stat_weight: "Kg Lifted", stat_challenges: "Challenges Done",
        feat_main_1: "Unleash", feat_main_2: "Your Potential",
        feat_subtitle: "Everything you need to reach the top in one integrated platform.",
        feat1_title: "City Monster System", feat1_desc: "Rule your city map! Lift the heaviest, provide video proof to admin, and take the throne.",
        feat2_title: "Muscle Radar & TSB", feat2_desc: "Monitor your muscle balance and CNS readiness via precise Olympic charts to prevent injury.",
        feat3_title: "Live Interactive Workout", feat3_desc: "Log sets in real-time, with smart rest timers and alerts when breaking PRs.",
        feat4_title: "Power Games & Challenges", feat4_desc: "Play mini Deadlift & Squat games to collect tactical XP and compete.",
        help_title: "Help Center ", faq_tab: "FAQs", contact_tab: "Contact Us",
        contact_desc: "Have an issue or suggestion? Message the admin directly!", send_msg: "Send Message",
        email_ph: "Your Email", msg_ph: "Type your message here...",

        challenge_subtitle: "Elevate your performance and break records!",
        deadlift_title: "Deadlift",
        deadlift_desc: "Lift fast and collect points",
        squat_title: "Squat",
        squat_desc: "Balance precisely in the green zone",
        cancel_return: "Cancel & Return",
        time: "TIME",
        earned_xp: "EARNED XP",
        best_combo: "BEST COMBO",
        mistakes: "MISTAKES",
        exit_session: "EXIT SESSION",
        exit_challenge: "EXIT CHALLENGE",
        exit_confirm: "Are you sure you want to exit and cancel the session?",
        great_job: "Great job, Champ!",

        ft_privacy: "Privacy Policy",
        ft_terms: "Terms of Service",
        ft_community: "Community Guidelines",
        
        legal_privacy_title: "Privacy & Data Protection Policy",
        legal_privacy_body: `
            <p>Last Updated: October 1, 2026</p>
            <p>At <b>RGA Fitness Pro</b>, we take your privacy seriously. This policy explains how we collect, use, and protect your personal data.</p>
            <h3>1. Data We Collect</h3>
            <p>We collect information provided during signup (name, email) and your athletic performance data (logged weights, workout routines, and video proofs).</p>
            <h3>2. Video Proofs Usage</h3>
            <p>Videos uploaded to prove a "Max Weight" are used exclusively by the Admin to verify the achievement and prevent cheating on the leaderboard. Videos are stored securely and never shared with third parties.</p>
            <h3>3. Data Security</h3>
            <p>We use military-grade encryption (Firebase Secure Servers) to ensure no unauthorized party can access your data or your encrypted chats in the "Heroes Community".</p>
            <h3>4. Your Rights</h3>
            <p>You have the right to request a copy of your data or permanently delete your account (including workout history and messages) at any time via support.</p>
        `,

        legal_terms_title: "Terms of Service",
        legal_terms_body: `
            <p>Welcome to the beast realm. By using RGA Fitness Pro, you fully agree to the following terms:</p>
            <h3>1. Sportsmanship & Integrity</h3>
            <p>This app is built on fair competition. Any attempt to log fake weights, exploit systems, or upload forged videos will result in an immediate <b>Permanent Ban</b> and wiping of all XP.</p>
            <h3>2. Account Responsibility</h3>
            <p>You are solely responsible for maintaining the confidentiality of your password. Any activity occurring under your account is your responsibility.</p>
            <h3>3. Virtual Currency (XP) & Covers</h3>
            <p>Experience Points (XP) are a virtual currency used in-app to buy covers and level up. They hold no real-world monetary value and cannot be exchanged for cash.</p>
            <h3>4. Medical Disclaimer</h3>
            <p>Fitness info and indicators (TSB & Muscle Radar) are based on algorithms for guidance. We do not provide medical advice. You are responsible for your physical safety while lifting.</p>
        `,

        legal_community_title: "Heroes Community Guidelines",
        legal_community_body: `
            <p>Our community is built to support and motivate athletes. To maintain a professional environment, we strictly enforce these rules:</p>
            <ul>
                <li><b>Mutual Respect:</b> Abusive language, bullying, or belittling other players' achievements in private messages is strictly prohibited.</li>
                <li><b>Clean Challenges:</b> When a "Throne Fall" alert occurs, keep the rivalry purely athletic.</li>
                <li><b>Privacy:</b> Chats are secure and disappear after 24 hours, but using this feature to send inappropriate content or spam is forbidden.</li>
                <li><b>Reporting:</b> Any player can report an account for violating these policies. The admin will review and take strict action.</li>
            </ul>
            <p>We are here to lift weights, and lift each other up to the top!</p>
        `,

        game_over: "Session Over!",
        good_luck: "Better luck next time!",

        // --- Community & Notifications ---
        search_id: "🔍 Search by ID",
        my_friends: " My Friends",
        search_placeholder: "Enter ID (e.g., A1B2C)",
        search_btn: "Search",
        searching: "Searching...",
        player_not_found: "No hero found with this ID!",
        own_id_msg: "This is your own ID, Champ!",
        send_request: "Send Friend Request",
        hero_profile: " Hero Profile",
        earned_badges_title: "Earned Badges 🏅",
        no_badges_yet: "No badges earned yet.",
        no_friends_yet: "No friends yet",
        chat_btn: "Chat",
        type_message: "Type a message...",
        loading_messages: "Loading encrypted messages... ⏳",
        messages_disappear: "Messages disappear after 24 hours ⏳<br>Start the challenge now!",
        notifications: "Notifications ",
        mark_read: "Mark as read",
        no_notifications: "No new notifications",
        friend_request_from: "sent you a friend request!",
        accept: "Accept",
        reject: "Reject",
        message_from: "Message from",
        click_to_reply: "Click to reply"
    }
};

// Global state
let currentLang = localStorage.getItem('lang') || 'ar';
let cropper;

// --- GLOBAL HELPER FUNCTIONS ---
function showToast(message) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
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

function applyLanguage() {
    const t = translations[currentLang];
    document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang;

    document.querySelectorAll('[data-translate]').forEach(el => {
        const key = el.dataset.translate;
        if (t[key]) {
            el.innerText = t[key];
        }
    });
    
    const dashboardTitle = document.querySelector('.top-bar h1');
    if (dashboardTitle) dashboardTitle.innerText = t.dashboard;


    const loginEmail = document.getElementById('login-email');
    const loginPass = document.getElementById('login-password');
    const signupFname = document.getElementById('signup-firstname');
    const signupLname = document.getElementById('signup-lastname');
    const signupEmail = document.getElementById('signup-email');
    const signupPass = document.getElementById('signup-password');

    if (loginEmail) loginEmail.placeholder = t.auth_email_ph || "البريد الإلكتروني";
    if (loginPass) loginPass.placeholder = t.auth_pass_ph || "كلمة المرور";
    if (signupFname) signupFname.placeholder = t.auth_fname_ph || "الاسم الأول";
    if (signupLname) signupLname.placeholder = t.auth_lname_ph || "الاسم الأخير";
    if (signupEmail) signupEmail.placeholder = t.auth_email_ph || "البريد الإلكتروني";
    if (signupPass) signupPass.placeholder = t.auth_pass_ph || "كلمة المرور";


    const leaderboardBtn = document.querySelector('button[onclick*="showLeaderboard"]');
    if (leaderboardBtn) leaderboardBtn.innerText = t.leaderboard;

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.innerText = t.logout;

    const statCardTitles = document.querySelectorAll('.stat-card h3');
    if (statCardTitles.length >= 3) {
        statCardTitles[0].innerText = t.level;
        statCardTitles[1].innerText = t.xp;
        statCardTitles[2].innerText = t.streak;
    }

const exercises = currentLang === 'ar' 
    ? ["ديدليفت", "سكوات", "بنش برس", "بايسبس بار"] 
    : ["Deadlift", "Squat", "Bench Press", "Barbell Curl"];

const dataList = document.getElementById('smart-exercises');
if (dataList) {
    dataList.innerHTML = exercises.map(ex => `<option value="${ex}"></option>`).join('');
}


    // تحديث نصوص حاسبة الوزن
    const calcWeightInput = document.getElementById('calc-weight');
    const calcRepsInput = document.getElementById('calc-reps');
    if (calcWeightInput) calcWeightInput.placeholder = t.calc_weight_ph || "الوزن (kg)";
    if (calcRepsInput) calcRepsInput.placeholder = t.calc_reps_ph || "العدات";


    const liveExName = document.getElementById('live-ex-name');
    const liveExWeight = document.getElementById('live-ex-weight');
    const liveExReps = document.getElementById('live-ex-reps');


    const contactEmail = document.getElementById('contact-email');
    const contactMsg = document.getElementById('contact-message');
    if (contactEmail) contactEmail.placeholder = t.email_ph || "البريد الإلكتروني";
    if (contactMsg) contactMsg.placeholder = t.msg_ph || "رسالتك...";
    
    // إعادة بناء الأسئلة عند تغيير اللغة
    if(document.getElementById('faq-container')) renderFAQs();


    if (liveExName) liveExName.placeholder = t.live_ex_name_ph || "اسم التمرين";
    if (liveExWeight) liveExWeight.placeholder = t.live_ex_weight_ph || "الوزن (kg)";
    if (liveExReps) liveExReps.placeholder = t.live_ex_reps_ph || "العدات";


    const savedData = localStorage.getItem('currentUser');
    if (document.getElementById('main-content-area') && savedData) {
        renderUI(JSON.parse(savedData));


    }
}

function selectLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    applyLanguage();
    
    if (auth.currentUser) listenForNotifications(); 

    const dropdown = document.getElementById('lang-dropdown-sidebar');
    if (dropdown) dropdown.style.display = 'none';
}


function initStardustCanvas() {
    const canvas = document.getElementById('stardust-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let dots = [];
    const setup = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        dots = [];
        const dotCount = window.innerWidth < 768 ? 25 : 50;
        for (let i = 0; i < dotCount; i++) {
            dots.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                size: Math.random() * 1.5 + 0.5
            });
        }
    };
    const animate = () => {
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
        requestAnimationFrame(animate);
    };
    window.addEventListener('resize', setup);
    setup();
    animate();
}

function initScrollAnimations() {
    const reveals = document.querySelectorAll('.reveal');
    if (reveals.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                entry.target.querySelectorAll('.stat-number[data-target]').forEach(num => {
                    if (!num.classList.contains('counted')) {
                        animateNumbers(num);
                        num.classList.add('counted');
                    }
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    reveals.forEach(reveal => observer.observe(reveal));
}

// --- PAGE-SPECIFIC INITIALIZERS ---
function initIndexPage() {
    const modal = document.getElementById('auth-modal');
    const startBtn = document.getElementById('start-challenge-btn');
const closeModalBtn = document.querySelector('#auth-modal .close-modal-btn');
const tabBtns = document.querySelectorAll('#auth-modal .tab-btn');

    const loginFormContainer = document.getElementById('login-form');
    const signupFormContainer = document.getElementById('signup-form');

    if (startBtn) {
        startBtn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.add('active');
        });
    }
    if (closeModalBtn) closeModalBtn.onclick = () => modal.classList.remove('active');
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });

    if (tabBtns.length) {
        tabBtns.forEach(btn => {
            btn.onclick = () => {
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                if (btn.dataset.form === 'login') {
                    loginFormContainer.classList.remove('hidden');
                    signupFormContainer.classList.add('hidden');
                } else {
                    loginFormContainer.classList.add('hidden');
                    signupFormContainer.classList.remove('hidden');
                }
            };
        });
    }

    const loginForm = document.getElementById('real-login-form');
    if (loginForm) {
        loginForm.onsubmit = async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value;
            try {
                await auth.signInWithEmailAndPassword(email, password);
const t = translations[currentLang || 'ar'];
showToast(t.login_success || " تم الدخول، جاري تحويلك...");

                setTimeout(() => window.location.href = 'dashboard.html', 1500);
            } catch (error) {
                const t = translations[currentLang || 'ar'];
                let message = t.err_default;
                if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                    message = t.err_invalid_cred;
                } else if (error.code === 'auth/invalid-email') {
                    message = t.err_invalid_email;
                }
                showToast(message);
            }

        };
    }

    const signupForm = document.getElementById('real-signup-form');
    if (signupForm) {
        signupForm.onsubmit = async (e) => {
            e.preventDefault();
            const firstName = document.getElementById('signup-firstname').value.trim();
            const lastName = document.getElementById('signup-lastname').value.trim();
            const email = document.getElementById('signup-email').value.trim();
            const password = document.getElementById('signup-password').value;
            const defaultAvatar = "https://i.ibb.co/9mPmHXkh/cropped-circle-image-2.png";

            try {
                // 1. إنشاء الحساب في فايربيس
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                
                // 2. حفظ بيانات المستخدم
                await db.collection('users').doc(userCredential.user.uid).set({
                    firstName,
                    lastName,
                    fullName: `${firstName} ${lastName}`,
                    email,
                    photoURL: defaultAvatar,
                    xp: 0,
                    maxXp: 1000,
                    rank: 1,
                    streak: 1,
                    lastLoginDate: new Date().toISOString().split('T')[0],
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                showToast("🚀 تم إنشاء الحساب بنجاح!");
                
                // 3. إجبار ظهور الجولة التعليمية للحساب الجديد
                localStorage.removeItem('hasSeenTour'); 
                
                // 4. التحويل للداشبورد بعد النجاح
                setTimeout(() => window.location.href = 'dashboard.html', 1500);
                
            } catch (error) {
                // 5. التعامل مع الأخطاء (إذا الإيميل مستخدم أو الباسورد ضعيف)
                const t = translations[currentLang || 'ar'];
                let message = t.err_default;
                
                if (error.code === 'auth/email-already-in-use') {
                    message = t.err_email_in_use;
                } else if (error.code === 'auth/weak-password') {
                    message = t.err_weak_pass;
                } else if (error.code === 'auth/invalid-email') {
                    message = t.err_invalid_email;
                }
                
                showToast(message);
            }
        };
    }


    const forgotPasswordLink = document.getElementById('forgot-password-link');
    if (forgotPasswordLink) {
        forgotPasswordLink.onclick = async (e) => {
            e.preventDefault();
            const t = translations[currentLang || 'ar'];
            
            const email = prompt(t.prompt_email || "الرجاء إدخال بريدك الإلكتروني المسجل لدينا:");
            if (!email || email.trim() === "") return;
            
            try {
                await auth.sendPasswordResetEmail(email.trim());
                // رسالة ذكية ومحمية تناسب نظام فايربيس الجديد
                showToast(currentLang === 'en' ? " If registered, a reset link has been sent." : " إذا كان البريد مسجلاً، سيصلك رابط الاستعادة.");
            } catch (error) {
                // في حال كان نظام الحماية مطفي وطلع خطأ فعلي
                if (error.code === 'auth/user-not-found') {
                    showToast(t.err_user_not_found || " هذا البريد مش مسجل عنا!");
                } else if (error.code === 'auth/invalid-email') {
                    showToast(t.err_invalid_email || " صيغة البريد الإلكتروني غير صحيحة!");
                } else {
                    showToast(t.err_default || " حدث خطأ، يرجى المحاولة لاحقاً.");
                }
            }
        };
    }



    document.querySelectorAll('.accordion-header').forEach(header => {
        header.onclick = () => {
            const item = header.parentElement;
            const isActive = item.classList.contains('active');
            document.querySelectorAll('.accordion-item').forEach(el => el.classList.remove('active'));
            if (!isActive) item.classList.add('active');
        };
    });
}

function animateNumbers(targetElement) {
    const target = parseInt(targetElement.getAttribute('data-target'), 10);
    const duration = 2000;
    let current = 0;
    const increment = target > 1000 ? Math.ceil(target / 100) : 1;
    const stepTime = Math.max(10, Math.abs(Math.floor(duration / (target / increment))));

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            targetElement.innerText = target.toLocaleString();
            clearInterval(timer);
        } else {
            targetElement.innerText = current.toLocaleString();
        }
    }, stepTime);
}

function initDashboardPage() {
    auth.onAuthStateChanged(user => {
        if (user) {
            // إظهار الزر إذا كان المستخدم هو الآدمن (أنت)
            const adminEmail = "raedabdi9@gmail.com"; // 👈 اكتب إيميلك هون بالضبط
            const adminBtn = document.getElementById('admin-panel-btn');
            if (adminBtn && user.email === adminEmail) {
                adminBtn.style.display = 'block';
            }
checkAndShowOnboarding();


preloadHeavyCovers(); 
          
                        const savedData = localStorage.getItem('currentUser');
            if (savedData) renderUI(JSON.parse(savedData));
            syncUserData(user);
            listenForNotifications(); 
            


            if (Notification.permission === 'granted' && typeof requestNotificationPermission === 'function') {
                requestNotificationPermission();
            }

        } else {
            window.location.href = 'index.html';
        }
    });

    const menuBtn = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    if (menuBtn && sidebar) {
        menuBtn.onclick = (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('collapsed');
        };
        document.addEventListener('click', (e) => {
            if (window.innerWidth < 768 && !sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
                sidebar.classList.add('collapsed');
            }
        });
    }

    const langMenuBtn = document.getElementById('lang-menu-btn-sidebar');
    const langDropdown = document.getElementById('lang-dropdown-sidebar');
    if (langMenuBtn && langDropdown) {
        langMenuBtn.onclick = (event) => {
            event.stopPropagation(); 
            langDropdown.style.display = langDropdown.style.display === 'block' ? 'none' : 'block';
        };
        document.addEventListener('click', () => {
            if (langDropdown.style.display === 'block') {
                langDropdown.style.display = 'none';
            }
        });
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.onclick = async () => {
            await auth.signOut();
            localStorage.removeItem('currentUser');
            window.location.href = 'index.html';
        };
    }

    const photoInput = document.getElementById('upload-photo');
    const cropperModal = document.getElementById('cropper-modal');
    const imageToCrop = document.getElementById('image-to-crop');

    if (photoInput) {
        photoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                imageToCrop.src = event.target.result;
                cropperModal.style.display = 'flex';
                if (cropper) cropper.destroy();
                
                // 🌟 الإعدادات الجديدة (حركة انستغرام السلسة) 🌟
                cropper = new Cropper(imageToCrop, {
                    aspectRatio: 1,             // نسبة 1:1 لتناسب الدائرة
                    viewMode: 1,                // منع خروج الصورة عن الإطار
                    dragMode: 'move',           // تحريك الصورة نفسها بدل المربع
                    autoCropArea: 0.8,          // حجم الدائرة ياخذ 80% من الشاشة
                    restore: false,
                    guides: false,              // إخفاء الشبكة المزعجة
                    center: false,              // إخفاء علامة الزائد بالمنتصف
                    highlight: false,
                    cropBoxMovable: false,      // إقفال الدائرة في المنتصف (لا تتحرك)
                    cropBoxResizable: false,    // منع تغيير حجم الدائرة (الزوم يكون للصورة)
                    toggleDragModeOnDblclick: false,
                    background: false           // إخفاء خلفية المربعات
                });
            };
            reader.readAsDataURL(file);
        });
    }


// الكود الجديد والمطور لحفظ صورة البروفايل (رفعها لـ Firebase Storage)
const cropSaveBtn = document.getElementById('crop-save-btn');
if (cropSaveBtn) {
    cropSaveBtn.onclick = async () => {
        if (!cropper) return;
        
        // 1. إظهار حالة التحميل (لأن الرفع يحتاج ثانية أو اثنتين)
        const originalText = cropSaveBtn.innerText;
        cropSaveBtn.innerText = currentLang === 'en' ? 'Uploading...' : 'جاري الرفع...';
        cropSaveBtn.disabled = true;

        try {
            // الحصول على الصورة كـ Blob (ملف حقيقي) بدل Base64 النصي
            cropper.getCroppedCanvas({ width: 300, height: 300 }).toBlob(async (blob) => {
                if (!blob) throw new Error("فشل توليد الصورة");

                const user = auth.currentUser;
                // 2. إنشاء مسار للصورة في التخزين السحابي باسم اللاعب
                const storageRef = storage.ref(`profile_pictures/${user.uid}.jpg`);
                
                // 3. رفع الملف للسيرفر
                await storageRef.put(blob);
                
                // 4. الحصول على الرابط القصير (URL)
                const downloadURL = await storageRef.getDownloadURL();

                // 5. حفظ الرابط القصير في الداتا بيس
                await db.collection('users').doc(user.uid).update({ photoURL: downloadURL });
                
                // 6. تحديث واجهة المستخدم فوراً
                document.getElementById('user-photo').src = downloadURL;
                const saved = JSON.parse(localStorage.getItem('currentUser') || '{}');
                saved.photoURL = downloadURL;
                localStorage.setItem('currentUser', JSON.stringify(saved));
                
                cropperModal.style.display = 'none';
                showToast(currentLang === 'en' ? " Photo updated!" : " تم تحديث الصورة بنجاح");
                
                // إرجاع الزر لوضعه الطبيعي
                cropSaveBtn.innerText = originalText;
                cropSaveBtn.disabled = false;
                if (cropper) cropper.destroy();
            }, 'image/jpeg', 0.8);
            
        } catch (err) {
            console.error("خطأ في رفع الصورة:", err);
            showToast(currentLang === 'en' ? "⚠️ Failed to save photo" : "⚠️ فشل حفظ الصورة");
            cropSaveBtn.innerText = originalText;
            cropSaveBtn.disabled = false;
        }
    };
}

    
    const cropCancelBtn = document.getElementById('crop-cancel-btn');
    if (cropCancelBtn) {
        cropCancelBtn.onclick = () => {
            cropperModal.style.display = 'none';
            if (cropper) cropper.destroy();
        };
    }
}

function generateShortID() {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 5; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// ==========================================
// 🔄 مزامنة بيانات اللاعب مع السحابة (Firebase)
// ==========================================
async function syncUserData(user) {
    const userRef = db.collection('users').doc(user.uid);
    try {
        const doc = await userRef.get();
        if (!doc.exists) return;

        let data = doc.data();
        let needsUpdate = false;
        
        // إنشاء كود معرف إذا ما كان عنده
        if (!data.shortID) {
            data.shortID = generateShortID();
            needsUpdate = true;
        }

        // 🔥 السحر هنا: سحب سجل التمارين من السحابة وتخزينه وعرضه
        if (data.workouts) {
            localStorage.setItem('userWorkouts', JSON.stringify(data.workouts));
        } else {
            // إذا كان عنده تمارين بالجهاز بس مش مرفوعة (عملية ترحيل البيانات)
            const localWorkouts = JSON.parse(localStorage.getItem('userWorkouts')) || [];
            if (localWorkouts.length > 0) {
                data.workouts = localWorkouts;
                needsUpdate = true;
            }
        }

        // تحديث سلسلة الدخول (الستريك)
        const today = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Amman" })).toISOString().split('T')[0];
        if (data.lastLoginDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = new Date(yesterday.toLocaleString("en-US", { timeZone: "Asia/Amman" })).toISOString().split('T')[0];
            
            if (data.lastLoginDate === yesterdayStr) {
                data.streak = (data.streak || 0) + 1;

                const t = translations[currentLang || 'ar'];
showToast(`${t.streak_fire} ${data.streak} ${t.days_streak}`);
                updateStat('streak', data.streak, true);

            } else {
                data.streak = 1;
            }
            data.lastLoginDate = today;
            needsUpdate = true;
        }


        let calculatedLevel = Math.floor((data.xp || 0) / 500) + 1;
        let calculatedMaxXp = calculatedLevel * 500;

        if (data.rank !== calculatedLevel || data.maxXp !== calculatedMaxXp) {
            data.rank = calculatedLevel;
            data.maxXp = calculatedMaxXp;
            needsUpdate = true;
        }

        if (needsUpdate) {
            await userRef.update(data);
        }

        localStorage.setItem('currentUser', JSON.stringify(data));
        renderUI(data);
    } catch (err) {
        console.error("Sync Error:", err);
    }
}

function renderUI(data) {
    if (!data) return;
    const t = translations[currentLang || 'ar'];
    const defaultAvatar = "https://i.ibb.co/9mPmHXkh/cropped-circle-image-2.png";

    const elements = {
        photo: document.getElementById('user-photo'),
        id: document.getElementById('user-id-display'),
        welcome: document.getElementById('welcome-user'),
        rank: document.getElementById('user-rank'),
        xp: document.getElementById('user-xp'),
        maxXp: document.getElementById('max-xp'),
        streak: document.getElementById('user-streak'),
        xpFill: document.getElementById('xp-fill')
    };
    
    if (elements.photo) elements.photo.src = data.photoURL || defaultAvatar;
    if (elements.id) elements.id.innerText = `${t.id_text} ${data.shortID || '...'}`;
    if (elements.welcome) elements.welcome.innerText = `${t.welcome} ${data.firstName || "بطل"}`;
    if (elements.rank) elements.rank.innerText = data.rank || 1;
    if (elements.xp) elements.xp.innerText = data.xp || 0;
    if (elements.maxXp) elements.maxXp.innerText = data.maxXp || 1000;
    if (elements.streak) elements.streak.innerText = `🔥 ${data.streak || 1} ${t.days}`;
    
    if (elements.xpFill) {
        const currentLevelXp = (data.xp || 0) % 500; 
        const percent = (currentLevelXp / 500) * 100;
        elements.xpFill.style.width = `${percent}%`;
    }
} 

async function loadLeaderboardData() {
    const listDiv = document.getElementById('leaderboard-list');
    if (!listDiv) return;
    
    try {
        const snapshot = await db.collection('users').orderBy('xp', 'desc').limit(50).get();
        listDiv.innerHTML = '';
updateQuestProgress('leaderboard', 1); // ربط مهمة التجسس على المتصدرين

        let rank = 0;
        
        snapshot.forEach((doc) => {
            rank++;
            const data = doc.data();
            const rankEmoji = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `<b>#${rank}</b>`;
            const userPhoto = data.photoURL || 'https://i.ibb.co/9mPmHXkh/cropped-circle-image-2.png';
            
            const row = document.createElement('div');
            const borderSide = currentLang === 'ar' ? 'border-right' : 'border-left';
            row.style.cssText = `display: flex; justify-content: space-between; align-items: center; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 12px; ${borderSide}: 4px solid ${rank <= 3 ? 'var(--primary-color)' : 'transparent'}; transition: 0.3s;`;

            const userLevel = data.rank || Math.floor((data.xp || 0) / 500) + 1;
            const lvlText = currentLang === 'en' ? 'Lvl' : 'مستوى';
            
            row.innerHTML = `
                <div style="display: flex; align-items: center; gap: 15px; cursor: pointer;" onclick="viewPlayerProfile('${doc.id}')">
                    <span style="font-size: 1.2rem; min-width: 30px; text-align: center;">${rankEmoji}</span>
                    <img src="${userPhoto}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
                    <span style="font-weight: 700; color: white;">${data.firstName || 'Player'}</span>
                </div>
                
                <div style="text-align: right; direction: ltr; display: flex; flex-direction: column; align-items: flex-end;">
                    <span style="color: var(--primary-color); font-weight: 900; font-size: 1.1rem; letter-spacing: 0.5px; direction: rtl;">${lvlText} ${userLevel}</span>
                    <span style="color: var(--slate); font-size: 0.8rem; font-weight: 600; margin-top: -2px;">${data.xp || 0} XP</span>
                </div>
            `;
            
            // إضافة تأثير عند التمرير
            row.onmouseover = () => row.style.backgroundColor = 'rgba(0, 242, 167, 0.05)';
            row.onmouseout = () => row.style.backgroundColor = 'rgba(255,255,255,0.05)';

            listDiv.appendChild(row);
        });
    } catch (err) {
        listDiv.innerHTML = `<p style="text-align:center;">خطأ في تحميل بيانات المتصدرين</p>`;
    }
}

function backToDashboard() {
    const mainContent = document.getElementById('main-content-area');
    if (mainContent && mainContent.dataset.originalContent) {
        mainContent.innerHTML = mainContent.dataset.originalContent;
        mainContent.dataset.originalContent = '';
        initDashboardPage();
        applyLanguage();
        
        // 1. إعادة إضاءة زر الرئيسية في الشريط السفلي للموبايل
        const bottomNavItems = document.querySelectorAll('.bottom-nav .nav-item');
        if (bottomNavItems.length > 0) {
            bottomNavItems.forEach(item => item.classList.remove('active')); 
            bottomNavItems[0].classList.add('active'); 
        }
        
        // 2. إعادة إضاءة زر الرئيسية في القائمة الجانبية 
        const sidebarBtns = document.querySelectorAll('.sidebar-btn');
        if (sidebarBtns.length > 0) {
            sidebarBtns.forEach(btn => btn.classList.remove('active-btn')); 
            sidebarBtns[0].classList.add('active-btn'); 
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // 🔥 السحر هنا: إعادة رسم لوحة المهام عشان تعكس أي تقدم عملته في صفحة ثانية
        if (typeof renderQuests === 'function') {
            renderQuests();
        }
    }
}


// ==========================================
// 🎮 منطق الألعاب
// ==========================================
const LIFT_IMG_DOWN = "https://i.ibb.co/zW74jkmK/IMG-4239.png";
const LIFT_IMG_UP = "https://i.ibb.co/zVkNkjfZ/IMG-4238.png";

function toggleGameMenu() {
    const drop = document.getElementById('game-dropdown-sidebar');
    if(drop) drop.style.display = drop.style.display === 'block' ? 'none' : 'block';
}

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

function openGame() {
    comboCount = 0;
    const savedData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    globalBestCombo = savedData.bestCombo || 0; 
    document.getElementById('best-combo-val').innerText = globalBestCombo;
    sessionXP = 0;
    document.getElementById('session-xp-val').innerText = "0";
    document.getElementById('deadlift-char').src = LIFT_IMG_DOWN;
    document.getElementById('game-modal').style.display = 'flex';
    if(window.innerWidth < 768) document.getElementById('sidebar').classList.add('collapsed');
    startTimer();
}

function startTimer() {
    timeLeft = 60;
    isGameActive = true;
    document.getElementById('game-timer-val').innerText = `${timeLeft}s`;
    gameInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('game-timer-val').innerText = `${timeLeft}s`;
        if (timeLeft <= 0) finishGame(true);
    }, 1000);
}

function closeGame() {
    if (confirm(translations[currentLang].exit_confirm)) { finishGame(false); }
}

// نهاية لعبة الديدليفت
// نهاية لعبة الديدليفت
function finishGame(isTimeUp) {
    clearInterval(gameInterval);
    isGameActive = false;
    document.getElementById('game-modal').style.display = 'none';

    const savedData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const previousBestCombo = savedData.bestCombo || 0;
    const user = auth.currentUser;

    if (user && (sessionXP > 0 || globalBestCombo > previousBestCombo)) {
        // إضافة نقاط الخبرة
        if (sessionXP > 0) {
            showToast(`${translations[currentLang].great_job} +${sessionXP} XP`);
            addXP(sessionXP); 

// --- ربط المهام ---
updateQuestProgress('dl_score', sessionXP);

        }
        // تحديث الكومبو
        if (globalBestCombo > previousBestCombo) {
            db.collection('users').doc(user.uid).update({ bestCombo: globalBestCombo });
            savedData.bestCombo = globalBestCombo;
            localStorage.setItem('currentUser', JSON.stringify(savedData));
            setTimeout(() => { showToast(`🔥 رقم قياسي جديد للكومبو: ${globalBestCombo}!`); }, 2000); 
            
            updateStat('dl_combo', globalBestCombo, true);

updateQuestProgress('dl_combo', globalBestCombo); // ربط مهام كومبو الديدليفت

        }
    } // <--- هدول الأقواس اللي كانوا ناقصين!
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
    }

    if (comboCount > 1) {
        const comboEl = document.createElement('div');
        comboEl.className = 'combo-pop';
        comboEl.innerText = comboCount + "x";
        comboEl.style.left = (Math.random() * 40 + 30) + '%';
        comboEl.style.top = '10%';
        document.getElementById('shake-target').appendChild(comboEl);
        setTimeout(() => comboEl.remove(), 500);
    }
    comboTimer = setTimeout(() => { comboCount = 0; }, 800);

    sessionXP++;
    document.getElementById('session-xp-val').innerText = sessionXP;
    
    const pop = document.createElement('div');
    pop.className = 'xp-pop'; pop.innerText = '+1';
    pop.style.left = (Math.random() * 60 + 20) + '%';
    document.getElementById('shake-target').appendChild(pop);
    setTimeout(() => pop.remove(), 800);
}

function liftEnd() {
    if (!isGameActive) return;
    const char = document.getElementById('deadlift-char');
    const container = document.getElementById('shake-target');
    if (char) { char.src = LIFT_IMG_DOWN; char.style.transform = "translateY(0) scale(1)"; }
    if (container) container.classList.remove('shake');
}

let squatScore = 0;
let squatMistakes = 0;
let isSquatGameActive = false;
let squatGameLoop;
let squatLineSpeed = 2;
let linePosition = 0;
let lineDirection = 1;

function openSquatGame() {
    squatScore = 0;
    squatMistakes = 0;
    linePosition = 0;
    lineDirection = 1;
    squatLineSpeed = 2;
    document.getElementById('squat-session-xp-val').innerText = "0";
    document.getElementById('squat-mistakes-val').innerText = "0 / 5";
    document.getElementById('squat-game-modal').style.display = 'flex';
    if(window.innerWidth < 768) document.getElementById('sidebar').classList.add('collapsed');
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

        if (squatMistakes >= 5) finishSquatGame(true);
    }
}

function closeSquatGame() {
    if (confirm(translations[currentLang].exit_confirm)) finishSquatGame(false);
}

function finishSquatGame(saveScore = true) {
    if (!isSquatGameActive) return;
    isSquatGameActive = false;
    cancelAnimationFrame(squatGameLoop);
    document.getElementById('squat-game-modal').style.display = 'none';

    if (squatScore > 0 && saveScore) {
        showToast(`${translations[currentLang].game_over} +${squatScore} XP`);
        addXP(squatScore); 
        updateStat('sq_score', squatScore, true);
updateQuestProgress('sq_score', squatScore); // ربط مهام السكوات


    } else {
        showToast(translations[currentLang].good_luck);
    }
}


async function logHealthyMeal() {
    const user = auth.currentUser;
    if (!user) {
        showToast("يجب تسجيل الدخول أولاً!");
        return;
    }

    const t = translations[currentLang || 'ar'];
    let savedData = JSON.parse(localStorage.getItem('currentUser') || '{}');

    const now = Date.now();
    // 🔥 تم تقليل الوقت إلى 4 ساعات بدلاً من 12 ساعة
    const cooldownMs = 4 * 60 * 60 * 1000; 
    const lastMealTime = savedData.lastMealTime || 0;

    const timePassed = now - lastMealTime;

    // 1. فحص إذا كانت الوجبة قيد التجهيز (ضمن الـ 4 ساعات)
    if (timePassed < cooldownMs) {
        const timeLeftMs = cooldownMs - timePassed;
        const hoursLeft = Math.floor(timeLeftMs / (1000 * 60 * 60));
        const minutesLeft = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));

        const hrText = currentLang === 'en' ? 'h' : 'س';
        const minText = currentLang === 'en' ? 'm' : 'د';
        const cooldownPrefix = currentLang === 'en' ? 'Next meal available in' : 'الوجبة القادمة تتوفر بعد';

        showToast(` ${cooldownPrefix} ${hoursLeft}${hrText} و ${minutesLeft}${minText}`);
        return;
    }

    // 2. إذا انتهى الوقت أو أول مرة بياكل اليوم (بنعطيه الـ 50 XP)
    savedData.lastMealTime = now;
    localStorage.setItem('currentUser', JSON.stringify(savedData));

    // تحديث وقت الوجبة في الفايربيس للحماية من التلاعب
    try {
        await db.collection('users').doc(user.uid).update({
            lastMealTime: now
        });
    } catch (e) {
        console.error("خطأ في حفظ وقت الوجبة:", e);
    }

    // إعطاء النقاط وتحديث الإحصائيات
    showToast(`${t.meal_success} +50 XP 🥗`);

    updateQuestProgress('meal', 1);

    if (typeof addXP === "function") addXP(50);
    updateStat('meals', 1);
}





function openWorkoutModal() {
    const savedData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const modal = document.getElementById('workout-modal');

    // إخفاء كل الخطوات كبداية
    document.getElementById('workout-step-1').style.display = 'none';
    document.getElementById('workout-step-2').style.display = 'none';
    document.getElementById('workout-step-3').style.display = 'none';

    // إنشاء رسالة الانتظار بشكل ديناميكي ومخفي
    let pendingMsg = document.getElementById('pending-workout-msg');
    if (!pendingMsg) {
        pendingMsg = document.createElement('div');
        pendingMsg.id = 'pending-workout-msg';
        pendingMsg.innerHTML = `
            <div style="text-align:center; padding: 40px;">
                <i class="fa-solid fa-hourglass-half fa-spin fa-3x" style="color:var(--primary-color);"></i>
                <p style="margin-top:20px; font-weight:900; color:white; font-size: 1.1rem;">⏳ تمرين أسطوري قيد المراجعة!</p>
                <p style="color:var(--slate); font-size: 0.9rem; margin-top: 10px;">استرخي شوي يا بطل، الإدارة بتراجع إثباتك ورح يجيك إشعار أول ما يتم الاعتماد 👑</p>
            </div>`;
        document.querySelector('#workout-modal .modal-content').appendChild(pendingMsg);
    }

    if (savedData.isWorkoutPending) {
        // اللاعب عنده تمرين قيد المراجعة: بنعرضله رسالة الانتظار فقط
        pendingMsg.style.display = 'block';
    } else {
        // اللاعب وضعه طبيعي (ما عنده طلب معلق): بنخفي رسالة الانتظار وبنفتح الخطوة 1
        pendingMsg.style.display = 'none';
        document.getElementById('workout-step-1').style.display = 'block';
        document.getElementById('exercises-container').innerHTML = '';
    }

    // فتح النافذة في جميع الأحوال
    modal.classList.add('active');
}



function closeWorkoutModal() {
    document.getElementById('workout-modal').classList.remove('active');
}

function selectWorkoutSplit(split) {
    currentWorkoutSplit = split;
    const t = translations[currentLang]; 
    if (split === 'full') {
        selectWorkoutType(t.sys_full);
        return;
    }
    document.getElementById('workout-step-1').style.display = 'none';
    document.getElementById('workout-step-2').style.display = 'block';
    
    const grid = document.getElementById('dynamic-muscle-grid');
    grid.innerHTML = '';
    
    if (split === 'bro') {
        const muscles = [
            { key: 'chest', text: t.muscle_chest }, { key: 'back', text: t.muscle_back },
            { key: 'shoulders', text: t.muscle_shoulders }, { key: 'biceps', text: t.muscle_biceps },
            { key: 'triceps', text: t.muscle_triceps }, { key: 'legs', text: t.muscle_legs }, { key: 'core', text: t.muscle_core }
        ];
        muscles.forEach(m => {
            grid.innerHTML += `<button class="workout-type-btn" onclick="selectWorkoutType('${m.text}')">${m.text}</button>`;
        });
    } else if (split === 'ppl') {
        const ppl = [
            { key: 'push', text: t.sys_push }, { key: 'pull', text: t.sys_pull }, { key: 'legs', text: t.sys_legs }
        ];
        ppl.forEach(m => {
            grid.innerHTML += `<button class="workout-type-btn" onclick="selectWorkoutType('${m.text}')">${m.text}</button>`;
        });
    }
}

function backToStep1() {
    document.getElementById('workout-step-2').style.display = 'none';
    document.getElementById('workout-step-1').style.display = 'block';
}

function backToStep2() {
    document.getElementById('workout-step-3').style.display = 'none';
    if (currentWorkoutSplit === 'full') {
        document.getElementById('workout-step-1').style.display = 'block';
    } else {
        document.getElementById('workout-step-2').style.display = 'block';
    }
}


// === نظام قوالب التمارين الجاهزة وإصلاح مربعات الإدخال ===

// === نظام قوالب التمارين الجاهزة (يدعم اللغتين) ===

const workoutTemplates = {
    ar: {
        "صدر": ["بنش برس", "تجميع دمبلز علوي", "تفتيح كيبل", "متوازي"],
        "ظهر": ["سحب ظهر أمامي", "تجديف بار", "سحب أرضي", "ديدليفت"],
        "أكتاف": ["ضغط أكتاف دمبلز", "رفرفة جانبي", "رفرفة أمامي", "فيس بول"],
        "أرجل": ["سكوات", "ليج بريس", "رفرفة أمامي", "رفرفة خلفي", "بطات"],
        "بايسبس": ["بايسبس بار", "بايسبس دمبلز تبادل", "بايسبس هامر", "بايسبس كيبل"],
        "ترايسبس": ["ترايسبس حبل", "ترايسبس بار مستقيم", "ترايسبس دمبلز فرنسي", "متوازي (Dips)"],
        "دفع (Push)": ["بنش برس", "ضغط أكتاف", "تجميع صدر علوي", "رفرفة جانبي", "ترايسبس حبل"],
        "سحب (Pull)": ["تجديف بار", "سحب ظهر أمامي", "فيس بول", "بايسبس بار", "ديدليفت"],
        "شامل (Full Body)": ["سكوات", "بنش برس", "تجديف بار", "ضغط أكتاف", "ديدليفت"]
    },
    en: {
        "Chest": ["Bench Press", "Incline Dumbbell Press", "Cable Flyes", "Dips"],
        "Back": ["Lat Pulldown", "Barbell Row", "Seated Row", "Deadlift"],
        "Shoulders": ["Shoulder Press", "Lateral Raise", "Front Raise", "Face Pull"],
        "Legs": ["Squat", "Leg Press", "Leg Extension", "Leg Curl", "Calf Raises"],
        "Biceps": ["Barbell Curl", "Dumbbell Curl", "Hammer Curl", "Cable Curl"],
        "Triceps": ["Triceps Pushdown", "Skull Crushers", "Overhead Extension", "Dips"],
        "Push": ["Bench Press", "Shoulder Press", "Incline Press", "Lateral Raise", "Triceps Pushdown"],
        "Pull": ["Barbell Row", "Lat Pulldown", "Face Pull", "Barbell Curl", "Deadlift"],
        "Full Body": ["Squat", "Bench Press", "Barbell Row", "Shoulder Press", "Deadlift"]
    }
};

window.addExerciseRow = function() {
    const container = document.getElementById('exercises-container');
    if (!container) return; 
    
    const row = document.createElement('div');
    row.className = 'exercise-row';
    const t = translations[currentLang || 'ar'];
    
    row.innerHTML = `
        <input type="text" list="smart-exercises" placeholder="${t.ex_name || 'التمرين'}" class="ex-name" spellcheck="false">
        <input type="number" placeholder="${t.ex_reps || 'العدات'}" class="ex-reps" inputmode="numeric">
        <input type="number" placeholder="${t.ex_weight || 'الوزن'}" class="ex-weight" inputmode="decimal">
        <button class="remove-exercise-btn" onclick="this.parentElement.remove()" title="حذف">×</button>
    `;
    container.appendChild(row);
};

window.selectWorkoutType = function(type) {
    document.getElementById('selected-workout-type').innerText = type;
    document.getElementById('workout-step-1').style.display = 'none';
    document.getElementById('workout-step-2').style.display = 'none';
    document.getElementById('workout-step-3').style.display = 'block';
    
    document.getElementById('exercises-container').innerHTML = ''; 
    
    const templateBtn = document.getElementById('template-btn');
    const t = translations[currentLang || 'ar'];
    
    if (templateBtn) {
        // فحص هل العضلة موجودة في قاموس اللغة الحالية
        if (workoutTemplates[currentLang] && workoutTemplates[currentLang][type]) {
            templateBtn.style.display = 'block';
            templateBtn.innerText = `${t.template_btn} (${type})`;
        } else {
            templateBtn.style.display = 'none';
        }
    }
    addExerciseRow(); 
};

window.loadWorkoutTemplate = function() {
    const typeElement = document.getElementById('selected-workout-type');
    const type = typeElement ? typeElement.innerText : '';
    const template = workoutTemplates[currentLang][type]; // جلب التمارين بلغة التطبيق الحالية

    if (!template) return;

    const container = document.getElementById('exercises-container');
    container.innerHTML = ''; 

    template.forEach(exName => {
        addExerciseRow(); 
        const rows = container.querySelectorAll('.exercise-row');
        const lastRow = rows[rows.length - 1];
        if(lastRow) lastRow.querySelector('.ex-name').value = exName;
    });

    const t = translations[currentLang || 'ar'];
    showToast(t.template_loaded);
};




async function saveWorkout() {
    const rows = document.querySelectorAll('.exercise-row');
    let hasValidExercise = false;
    let exercises = [];
    const typeElement = document.getElementById('selected-workout-type');
    const typeText = typeElement ? typeElement.innerText : 'تمرين'; // (صدر، ظهر، أرجل...)
    
    let needsProof = false;
    let heavyWeight = 0;
    let heavyExerciseName = "";

    // 1. تجميع التمارين وفحص الأوزان
    rows.forEach(row => {
        const nameInput = row.querySelector('.ex-name');
        const repsInput = row.querySelector('.ex-reps');
        const weightInput = row.querySelector('.ex-weight');
        
        if(nameInput && nameInput.value.trim() !== "") {
            hasValidExercise = true;
            let currentWeight = parseFloat(weightInput.value) || 0; 
            let exName = nameInput.value.trim();
            
            exercises.push({ 
                name: exName, 
                reps: (repsInput && repsInput.value.trim() !== "") ? repsInput.value.trim() : '-', 
                weight: currentWeight > 0 ? currentWeight : '-' 
            });

            // 🔥 تحديد الحد الأقصى حسب العضلة واسم التمرين 🔥
            // 🔥 تحديد الحد الأقصى حسب العضلة والنظام واسم التمرين 🔥
            let threshold = 999;
            
            // 1. فحص العضلات المفردة (Bro Split)
            if (typeText.includes("صدر") || typeText.includes("Chest")) threshold = 60;
            if (typeText.includes("ظهر") || typeText.includes("Back")) threshold = 80;
            if (typeText.includes("أكتاف") || typeText.includes("Shoulders")) threshold = 50;
            if (typeText.includes("بايسبس") || typeText.includes("ترايسبس") || typeText.includes("Biceps") || typeText.includes("Triceps")) threshold = 50;
            if (typeText.includes("بطن") || typeText.includes("Core")) threshold = 80;

            // 2. فحص الأنظمة الشاملة والدفع والسحب (PPL & Full Body)
            if (typeText.includes("دفع") || typeText.includes("Push")) threshold = 70;
            if (typeText.includes("سحب") || typeText.includes("Pull")) threshold = 70;
            if (typeText.includes("أرجل") || typeText.includes("Legs")) threshold = 120;
            if (typeText.includes("شامل") || typeText.includes("Full Body")) threshold = 60;

            // 3. استثناءات بالاسم المتعارف عليه (هذه الأرقام تطغى على النظام العام)
            if (exName.includes("ديدليفت") || exName.toLowerCase().includes("deadlift")) threshold = 120;
            if (exName.includes("سكوات") || exName.toLowerCase().includes("squat")) threshold = 140;


            if (currentWeight >= threshold) {
                needsProof = true;
                if (currentWeight > heavyWeight) {
                    heavyWeight = currentWeight;
                    heavyExerciseName = exName;
                }
            }
        }
    });

    if(!hasValidExercise) {
        showToast(translations[currentLang].ex_error || "يرجى إضافة تمرين واحد على الأقل.");
        return; 
    }

    // 2. إذا كسر الرقم، بنطلب فيديو
    // 2. إذا كسر الرقم، بنطلب فيديو
    if (needsProof) {
        const t = translations[currentLang || 'ar']; // سحب الترجمة
        
        // رسالة التنبيه الديناميكية مترجمة
        const confirmMsg = currentLang === 'en' 
            ? `💪 You are a beast!!\nYou lifted ${heavyWeight}kg in ${heavyExerciseName}!\nSince you broke the record, you must upload a video to prove your strength.\nReady to upload?`
            : `💪 إنت وحش!!\nشلت ${heavyWeight}kg بتمرين ${heavyExerciseName}!\nلأنك قطعت الدنيا، لازم ترفع فيديو يثبت قوتك عشان نعتمدلك الرقم ونحطه بالليدربورد.\nجاهز ترفع الفيديو؟`;

        const confirmProof = confirm(confirmMsg);
        
        if (!confirmProof) {
            showToast(t.cancel_upload); // 🔥 رسالة الإلغاء المترجمة
            return;
        }

        // إنشاء زر رفع فيديو مخفي
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'video/*';
        
        fileInput.onchange = async (e) => {
            const file = e.target.files[0];
            if(file) {
                if(file.size > 30 * 1024 * 1024) { // منع فيديوهات أكبر من 30 ميجا
                    showToast(t.video_size_error); // 🔥 رسالة الحجم المترجمة
                    return;
                }

                // تجهيز الشاشة وعرض عداد التحميل %
                closeWorkoutModal();
                document.getElementById('workout-step-3').innerHTML = `
                    <div style="text-align:center; padding: 40px;">
                        <i class="fa-solid fa-spinner fa-spin fa-3x" style="color:var(--primary-color);"></i>
                        <p style="margin-top:20px; font-weight:bold; color:white;">${t.uploading_proof}</p>
                        <h1 id="upload-progress" style="color:var(--primary-color); font-size: 2.5rem; margin-top: 15px;">0%</h1>
                    </div>`;
                document.getElementById('workout-modal').classList.add('active');

                const user = auth.currentUser;
                // تنظيف اسم الملف عشان الفايربيس ما يعلق إذا الاسم فيه عربي أو مسافات
                const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
                const videoRef = storage.ref(`proofs/${user.uid}_${Date.now()}_${cleanFileName}`);
                
                // بدء الرفع مع المراقبة
                const uploadTask = videoRef.put(file);

                uploadTask.on('state_changed', 
                    (snapshot) => {
                        // حساب النسبة المئوية وتحديث الرقم عالشاشة
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        const progressText = document.getElementById('upload-progress');
                        if (progressText) progressText.innerText = Math.round(progress) + '%';
                    }, 
                    (error) => {
                        console.error("خطأ في الرفع:", error);
                        closeWorkoutModal();
                        showToast(t.upload_fail_storage); // 🔥 رسالة فشل الرفع المترجمة
                    }, 
                    async () => {
                        // لما يوصل 100% ويخلص رفع
                        try {
                            const videoURL = await uploadTask.snapshot.ref.getDownloadURL();
                            let dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                            
                            // حفظ التمرين في قائمة المراجعة (Pending)
                            await db.collection('pending_workouts').add({
                                userId: user.uid,
                                userName: JSON.parse(localStorage.getItem('currentUser')).firstName,
                                date: dateStr,
                                type: typeText,
                                details: exercises,
                                videoUrl: videoURL,
                                status: 'pending',
                                timestamp: firebase.firestore.FieldValue.serverTimestamp()
                            });

                            // تجميد حساب اللاعب
                            await db.collection('users').doc(user.uid).update({ isWorkoutPending: true });
                            
                            let savedData = JSON.parse(localStorage.getItem('currentUser'));
                            savedData.isWorkoutPending = true;
                            localStorage.setItem('currentUser', JSON.stringify(savedData));

                            closeWorkoutModal();
                            showToast(t.upload_success_wait); // 🔥 رسالة النجاح والانتظار المترجمة
                        } catch (dbError) {
                            console.error("خطأ في قاعدة البيانات:", dbError);
                            closeWorkoutModal();
                            showToast(t.save_db_error); // 🔥 رسالة فشل حفظ البيانات المترجمة
                        }
                    }
                );
            }
        };
        fileInput.click();
        return;

    }

    // 3. إذا الأوزان طبيعية، بيحفظ التمرين مباشرة (الكود القديم تبعك)
    // 3. إذا الأوزان طبيعية، بيحفظ التمرين مباشرة (مع نظام المكافآت المحصن سحابياً)
    let workoutHistory = [];
    try { workoutHistory = JSON.parse(localStorage.getItem('userWorkouts')) || []; } catch(e) {}
    let dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    workoutHistory.unshift({ date: dateStr, type: typeText, details: exercises }); 
    localStorage.setItem('userWorkouts', JSON.stringify(workoutHistory));


let totalVol = 0; let totalReps = 0;
exercises.forEach(ex => { 
    totalVol += (parseFloat(ex.weight) * parseInt(ex.reps)) || 0; 
    totalReps += parseInt(ex.reps) || 0;
});
updateQuestProgress('volume', totalVol);
updateQuestProgress('reps', totalReps);
updateQuestProgress('workout_days', 1);


    if (typeof updateStat === "function") {
        updateStat('workouts', 1);
        rows.forEach(row => {
            let w = parseFloat(row.querySelector('.ex-weight').value) || 0;
            if (w > 0) updateStat('maxWeight', w, true);
        });
    }

    const user = auth.currentUser;
    if (user) { 
        let savedData = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const todayStr = new Date().toDateString(); // تاريخ اليوم
        
        // قراءة التاريخ من بيانات اللاعب المحفوظة بالسحابة لمنع الغش من جهاز آخر
        const lastXpDate = savedData.lastWorkoutXpDate || "";

        if (lastXpDate === todayStr) {
            // اللاعب أخذ مكافأته اليوم، نحسب الوقت المتبقي لمنتصف الليل
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setHours(24, 0, 0, 0); 
            
            const timeLeftMs = tomorrow - now;
            const hours = Math.floor(timeLeftMs / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));
            
            let timeMsg = currentLang === 'en' ? `${hours}h ${minutes}m` : `${hours} س و ${minutes} د`;

            // تحديث التمارين فقط في الفايربيس بدون تجديد التاريخ
            db.collection('users').doc(user.uid).update({ workouts: workoutHistory });
            showToast(currentLang === 'en' ? `Workout Saved! XP resets in ${timeMsg}` : `تم حفظ التمرين! المكافأة تتجدد بعد ${timeMsg}`);
            
        } else {
            // أول تمرين اليوم، يتم إعطاء النقاط وحفظ تاريخ اليوم بالسحابة
            savedData.lastWorkoutXpDate = todayStr;
            localStorage.setItem('currentUser', JSON.stringify(savedData));

            // تحديث الفايربيس بالتمرين وختم التاريخ السحابي
            db.collection('users').doc(user.uid).update({ 
                workouts: workoutHistory,
                lastWorkoutXpDate: todayStr 
            });

            if (typeof addXP === "function") addXP(50);
            showToast(currentLang === 'en' ? `Saved! +50 XP` : `تم الحفظ! +50 XP`);
        }
    }

    closeWorkoutModal();

    // تحديث الشاشة والرسوم البيانية فوراً
    if(document.getElementById('log-container')) {
        renderWorkoutLog();
        if(typeof initWorkoutChart === "function") setTimeout(initWorkoutChart, 200);
    }
}



// ==========================================
// 🚀 نظام الترقية والمستويات الذكي (Leveling Engine)
// ==========================================
function addXP(amount) {
    // 🛡️ الحاجز الأمني الذكي (مضاد للكونسول - Anti-Cheat) 🛡️
    // هذا الكود بيفحص "من وين إجا الأمر؟" وبيمنع أي حقن وهمي للنقاط من خارج الموقع!
    try {
        const stack = new Error().stack || "";
        if (stack.includes('<anonymous>:') || stack.includes('eval(')) {
            console.error("🛑 تم حظر محاولة تلاعب بالنقاط! العب بنظافة يا وحش.");
            return; // إيقاف العملية فوراً وطرد الهاكر
        }
    } catch(e) {}

    // --- باقي الكود الأصلي تبعك مع التحديث الآمن للفايربيس ---
    const user = auth.currentUser;
    if (!user) return;

    const savedData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const oldXp = savedData.xp || 0;
    const newXp = oldXp + amount;
    
    // حساب المستوى والهدف الجديد (كل 500 نقطة = 1 لفل)
    const newLevel = Math.floor(newXp / 500) + 1;
    const newMaxXp = newLevel * 500;
    const oldLevel = savedData.rank || 1;

    if (typeof updateStat === "function") {
        updateStat('xpTotal', newXp, true);
    }

    // إرسال أمر الزيادة للسيرفر بأمان تام
    let updates = { xp: firebase.firestore.FieldValue.increment(amount) };
    
    if (newLevel > oldLevel) {
        updates.rank = newLevel;
        updates.maxXp = newMaxXp;
        if (typeof updateStat === "function") {
            updateStat('levelReach', newLevel, true);
        }
    }

    db.collection('users').doc(user.uid).update(updates).catch(err => {
        console.error("خطأ في تحديث النقاط:", err);
    });

    savedData.xp = newXp;
    savedData.rank = newLevel;
    savedData.maxXp = newMaxXp;
    localStorage.setItem('currentUser', JSON.stringify(savedData));
    
    if (typeof renderUI === "function") renderUI(savedData);

    if (newLevel > oldLevel) {
        setTimeout(() => {
            const t = translations[currentLang || 'ar'];
            if(typeof showToast === "function") showToast(`${t.level_up} ${newLevel}!`);
        }, 1200); 
    }
}


// ==========================================
// 📊 مركز الأداء والشارت
// ==========================================
window.workoutChartInstance = null;


function openPerformanceCenter() {
    if(window.innerWidth < 768) document.getElementById('sidebar').classList.add('collapsed');
    const mainContent = document.getElementById('main-content-area');
    if (!mainContent) return;

    const t = translations[currentLang || 'ar'];
    if (!mainContent.dataset.originalContent) {
        mainContent.dataset.originalContent = mainContent.innerHTML;
    }

    mainContent.innerHTML = `
        <header class="top-bar" style="margin-bottom: 20px;">
            <div class="header-row">
                <button id="back-to-dash-btn" class="btn-primary" style="padding: 5px 15px; font-size: 0.9rem;">${t.back || 'رجوع'}</button>
                <h1 style="margin: 0 15px;">${t.performance_center || 'مركز الأداء'}</h1>
            </div>
        </header>
        
        <section class="performance-container" style="animation: fadeIn 0.5s;">
            <div class="performance-tabs" style="display: flex; gap: 5px; margin-bottom: 20px; background: rgba(255,255,255,0.05); padding: 5px; border-radius: 12px; overflow-x: auto;">
                <button id="tab-btn-analytics" class="perf-tab-btn active-tab" onclick="switchPerfTab('analytics')">${t.analytics || 'التحليلات'}</button>
                <button id="tab-btn-log" class="perf-tab-btn" onclick="switchPerfTab('log')">${t.workout_history || 'سجل التمارين'}</button>
                <button id="tab-btn-muscles" class="perf-tab-btn" onclick="switchPerfTab('muscles')">${currentLang === 'en' ? 'Muscle Map' : 'حالة العضلات'}</button>
            </div>

            <div id="perf-tab-analytics" class="perf-tab-content" style="display: block;">
                
                <div class="stat-card glass-card" style="padding: 20px; text-align: center;">
                    <p id="chart-empty-msg" style="color: var(--slate); display: none; margin: 20px 0;">${t.empty_chart || 'لا توجد بيانات'}</p>
                    <div id="chart-wrapper" style="position: relative; height: 260px; width: 100%;">
                        <canvas id="workoutChart"></canvas>
                    </div>
                </div>

                <div class="stat-card glass-card" style="padding: 20px; text-align: center; margin-top: 20px;">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 5px;">
                        <h3 style="color: var(--primary-color); font-weight: 900; margin: 0;">
                            <i class="fa-solid fa-spider"></i> ${currentLang === 'en' ? 'Muscle Imbalance Radar' : 'رادار التوازن العضلي'}
                        </h3>
                        <button onclick="showRadarInfo()" style="background: none; border: none; color: var(--slate); cursor: pointer; font-size: 1.2rem; padding: 0;">
                            <i class="fa-solid fa-circle-info"></i>
                        </button>
                    </div>
                    <p id="radar-empty-msg" style="color: var(--slate); display: none; margin: 20px 0;">
                        ${currentLang === 'en' ? 'Log Bench, Squat, Deadlift, Row, and OHP to unlock.' : 'سجل (بنش، سكوات، ديدليفت، تجديف، أكتاف) لفتح الرادار.'}
                    </p>
                    <div id="radar-wrapper" style="position: relative; height: 280px; width: 100%; margin: 0 auto;">
                        <canvas id="radarChart"></canvas>
                    </div>
                </div>

                <div class="stat-card glass-card" style="padding: 20px; text-align: center; margin-top: 20px; border: 1px solid rgba(255, 215, 0, 0.3);">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 15px;">
                        <h3 style="color: #FFD700; font-weight: 900; margin: 0; text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);">
                            <i class="fa-solid fa-bolt"></i> ${currentLang === 'en' ? 'CNS Readiness (TSB)' : 'مؤشر الجاهزية العصبية'}
                        </h3>
                        <button onclick="showTSBInfo()" style="background: none; border: none; color: var(--slate); cursor: pointer; font-size: 1.2rem; padding: 0;">
                            <i class="fa-solid fa-circle-info"></i>
                        </button>
                    </div>
                    
                    <div id="tsb-status-box" style="padding: 15px; border-radius: 10px; margin-bottom: 15px; font-weight: bold; font-size: 1.1rem; transition: 0.3s;">
                    </div>

                    <div id="tsb-chart-wrapper" style="position: relative; height: 280px; width: 100%;">
                        <canvas id="tsbChart"></canvas>
                    </div>
                </div>

                <div class="stat-card glass-card" style="padding: 20px; text-align: center; margin-top: 20px; border: 1px dashed var(--primary-color);">
                    <h3 style="color: var(--primary-color); font-weight: 900; margin-bottom: 10px;">
                        <i class="fa-solid fa-calculator"></i> ${t.calc_title || 'حاسبة أقصى وزن (1RM)'}
                    </h3>
                    <p style="font-size: 0.8rem; color: var(--slate); margin-bottom: 15px;">${t.calc_desc || 'احسب أقصى وزن نظري لعدة واحدة'}</p>
                    <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                        <input type="number" id="calc-weight" class="input-field" placeholder="${t.calc_weight_ph || 'الوزن (kg)'}" style="margin: 0; padding: 12px; text-align: center;">
                        <input type="number" id="calc-reps" class="input-field" placeholder="${t.calc_reps_ph || 'العدات'}" style="margin: 0; padding: 12px; text-align: center;">
                    </div>
                    <button class="btn-primary" onclick="calculate1RM()" style="width: 100%; padding: 10px;">${t.calc_btn || 'احسب قوتي '}</button>
                    <div id="calc-result" style="display: none; margin-top: 15px; font-size: 1.8rem; font-weight: 900; color: white;">
                        <span style="font-size: 0.9rem; color: var(--slate); display: block;">${t.calc_result_label || 'أقصى وزن لعدة واحدة:'}</span>
                        <span id="rm-value" style="color: #FFD700;">0</span> kg
                    </div>
                </div>

            </div>




            <div id="perf-tab-log" class="perf-tab-content" style="display: none;">
                <div id="log-container" class="log-grid"></div>
            </div>

            <div id="perf-tab-muscles" class="perf-tab-content" style="display: none; text-align: center;">
                <div class="map-legend">
                    <div class="legend-item"><div class="legend-color" style="background: #ff4d4d;"></div> ${currentLang === 'en' ? 'Exhausted' : 'مرهقة'}</div>
                    <div class="legend-item"><div class="legend-color" style="background: #FFD700;"></div> ${currentLang === 'en' ? 'Recovering' : 'قيد الاستشفاء'}</div>
                    <div class="legend-item"><div class="legend-color" style="background: #00f2a7;"></div> ${currentLang === 'en' ? 'Recovered' : 'متعافية'}</div>
                </div>
                
                <div class="anatomy-wrapper">
                    <img src="body.png" alt="Anatomy Map">
                    <div id="zone-chest" class="muscle-zone" onclick="showMuscleStatus('صدر')"></div>
                    <div id="zone-abs" class="muscle-zone" onclick="showMuscleStatus('بطن')"></div>
                    <div id="zone-shoulders-l" class="muscle-zone" onclick="showMuscleStatus('أكتاف')"></div>
                    <div id="zone-shoulders-r" class="muscle-zone" onclick="showMuscleStatus('أكتاف')"></div>
                    <div id="zone-arms-l" class="muscle-zone" onclick="showMuscleStatus('أذرع')"></div>
                    <div id="zone-arms-r" class="muscle-zone" onclick="showMuscleStatus('أذرع')"></div>
                    <div id="zone-legs" class="muscle-zone" onclick="showMuscleStatus('أرجل')"></div>
                </div>
            </div>
        </section>
    `;
    
    document.getElementById('back-to-dash-btn').onclick = backToDashboard;
    
    renderWorkoutLog();
    setTimeout(() => { 
        initWorkoutChart(); 
        initRadarChart();
        initTSBChart();
        initMuscleRecoveryMap(); 
    }, 200);
}


// ==========================================
// ⚡ خوارزمية الجاهزية العصبية (TSB - Banister Model)
// ==========================================
// ==========================================
// ⚡ خوارزمية الجاهزية العصبية (المحدثة والآمنة 100%)
// ==========================================
window.tsbChartInstance = null;

function initTSBChart() {
    if (typeof Chart === 'undefined') return;

    let workouts = [];
    try { 
        workouts = JSON.parse(localStorage.getItem('userWorkouts')) || []; 
    } catch(e) {
        console.error("خطأ في قراءة الأرشيف:", e);
    }
    
    const ctx = document.getElementById('tsbChart');
    const statusBox = document.getElementById('tsb-status-box');
    if (!ctx) return;

    if (workouts.length === 0) {
        statusBox.innerHTML = currentLang === 'en' ? 'No workout data yet.' : 'لا توجد بيانات تمارين بعد. سجل أول تمرين لترى السحر!';
        statusBox.style.background = 'rgba(255,255,255,0.05)';
        return;
    }

    try {
        // 1. تجميع الحجم التدريبي مع فلاتر حماية
        const dailyLoads = {};
        workouts.forEach(w => {
            if (!w.date) return;
            
            // قراءة التاريخ بطريقة آمنة جداً
            let d = new Date(w.date);
            if (isNaN(d.getTime())) return; 
            
            let dateKey = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
            
            let dailyLoad = 0;
            // حماية من التمارين اللي مافيها تفاصيل أوزان
            if (w.details && Array.isArray(w.details)) {
                w.details.forEach(ex => {
                    let weight = parseFloat(ex.weight);
                    if (isNaN(weight) || weight <= 0) weight = 15; // وزن افتراضي لتمارين وزن الجسم عشان ما ينكسر الشارت
                    dailyLoad += weight; 
                });
            } else {
                dailyLoad = 50; // حمل افتراضي
            }

            if (!dailyLoads[dateKey]) dailyLoads[dateKey] = 0;
            dailyLoads[dateKey] += dailyLoad;
        });

        // 2. تجهيز حسابات الـ 60 يوم
        let today = new Date();
        today.setHours(0,0,0,0);
        let startDate = new Date(today);
        startDate.setDate(startDate.getDate() - 60);

        const labels = [];
        const fitnessData = []; 
        const fatigueData = []; 
        const readinessData = []; 

        let ctl = 0; // اللياقة التراكمية
        let atl = 0; // الإرهاق الحاد
        const ctlAlpha = 2 / (42 + 1);
        const atlAlpha = 2 / (7 + 1);

        for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
            let dateKey = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
            let load = dailyLoads[dateKey] || 0; 

            // المعادلات الأولمبية
            ctl = (load * ctlAlpha) + (ctl * (1 - ctlAlpha));
            atl = (load * atlAlpha) + (atl * (1 - atlAlpha));
            let tsb = ctl - atl;

            // استخراج آخر 14 يوم للرسم فقط (عشان الشكل يطلع أنيق)
            const diffTime = today.getTime() - d.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays <= 14) {
                let label = `${d.getDate()}/${d.getMonth()+1}`;
                labels.push(label);
                fitnessData.push(parseFloat(ctl.toFixed(1)));
                fatigueData.push(parseFloat(atl.toFixed(1)));
                readinessData.push(parseFloat(tsb.toFixed(1)));
            }
        }

        // 3. تحليل النتيجة النهائية
        const currentTSB = readinessData[readinessData.length - 1] || 0;
        const maxCTL = Math.max(...fitnessData);

        let statusText = '';
        let statusColor = '';
        let statusBg = '';

        if (maxCTL === 0) {
            statusText = currentLang === 'en' ? 'Log more weights to activate the CNS Radar.' : 'سجل أوزانك في تمارينك القادمة لتفعيل العقل المدبر.';
            statusColor = 'var(--slate)';
            statusBg = 'rgba(255, 255, 255, 0.05)';
        } else if (currentTSB < -15) {
            statusText = currentLang === 'en' ? ' High Fatigue! Overtraining risk.' : ' إرهاق عالي! خطر الهدم العضلي. يُنصح بالراحة أو اللعب بوزن خفيف.';
            statusColor = '#ff4d4d';
            statusBg = 'rgba(255, 77, 77, 0.1)';
        } else if (currentTSB >= -15 && currentTSB <= 15) {
            statusText = currentLang === 'en' ? ' Optimal Zone. Keep grinding!' : ' منطقة البناء المثالية. استمر بالجلد!';
            statusColor = '#00f2a7';
            statusBg = 'rgba(0, 242, 167, 0.1)';
        } else {
            statusText = currentLang === 'en' ? ' PEAKING! CNS is fully fresh.' : ' حالة الذروة! جهازك العصبي مرتاح 100%. جاهز لكسر الأرقام (PR)!';
            statusColor = '#FFD700';
            statusBg = 'rgba(255, 215, 0, 0.1)';
        }

        statusBox.innerHTML = statusText;
        statusBox.style.color = statusColor;
        statusBox.style.backgroundColor = statusBg;
        statusBox.style.border = `1px solid ${statusColor}`;

        // 4. رسم الشارت
        if (window.tsbChartInstance) {
            window.tsbChartInstance.destroy();
        }

        window.tsbChartInstance = new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        type: 'bar',
                        label: currentLang === 'en' ? 'Readiness (TSB)' : 'الجاهزية (TSB)',
                        data: readinessData,
                        backgroundColor: readinessData.map(val => val < 0 ? 'rgba(255, 77, 77, 0.6)' : (val > 10 ? 'rgba(255, 215, 0, 0.6)' : 'rgba(0, 242, 167, 0.6)')),
                        borderRadius: 5,
                        borderWidth: 0,
                        yAxisID: 'y'
                    },
                    {
                        type: 'line',
                        label: currentLang === 'en' ? 'Fitness (CTL)' : 'اللياقة (CTL)',
                        data: fitnessData,
                        borderColor: '#3498db',
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        borderWidth: 3,
                        tension: 0.4,
                        pointRadius: 0,
                        yAxisID: 'y'
                    },
                    {
                        type: 'line',
                        label: currentLang === 'en' ? 'Fatigue (ATL)' : 'الإرهاق (ATL)',
                        data: fatigueData,
                        borderColor: '#ff4d4d',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        tension: 0.4,
                        pointRadius: 0,
                        yAxisID: 'y'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                scales: {
                    x: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#8892b0' } },
                    y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#8892b0' } }
                },
                plugins: {
                    legend: { labels: { color: '#e6f1ff', font: { family: 'var(--font-main)' } } },
                    tooltip: { backgroundColor: 'rgba(10, 20, 41, 0.9)', titleColor: '#FFD700', bodyFont: { size: 14 } }
                }
            }
        });

    } catch (error) {
        console.error("TSB Chart Error: ", error);
        statusBox.innerHTML = 'حدث خطأ أثناء معالجة البيانات. تأكد من تسجيل أوزان صالحة.';
        statusBox.style.color = '#ff4d4d';
    }
}





// نافذة شرح خوارزمية TSB
function showTSBInfo() {
    const isEn = currentLang === 'en';
    
    const title = isEn ? 'The Science of CNS Readiness ' : 'علم الجاهزية العصبية ';
    
    const steps = isEn ? [
        " <b>What is this?</b> We use the Olympic 'Banister Impulse-Response Model' to track your true recovery.",
        " <b>Fitness (CTL):</b> Your accumulated strength over the last 42 days. You want this to go UP.",
        " <b>Fatigue (ATL):</b> The stress on your joints and CNS from the last 7 days.",
        " <b>The Bars (TSB):</b> Fitness minus Fatigue. <br>- <b>Below 0 (Red):</b> You are exhausted. Recover! <br>- <b>0 to +10 (Green):</b> Perfect training zone. <br>- <b>Above +10 (Gold):</b> Peaking! You are primed to set a new Personal Record (PR)."
    ] : [
        " <b>ما هذا؟</b> نستخدم نموذج (Banister) الأولمبي لتحليل لياقتك وإرهاقك العصبي بشكل علمي دقيق.",
        " <b>اللياقة (الخط الأزرق):</b> قوتك وحجمك العضلي المتراكم آخر 42 يوم. (الهدف إنها ترتفع).",
        " <b>الإرهاق (الخط الأحمر):</b> الضغط الواقع على مفاصلك وجهازك العصبي آخر 7 أيام.",
        " <b>الأعمدة (النتيجة):</b> هي اللياقة ناقص الإرهاق. <br>- <b>أحمر (تحت الصفر):</b> أنت مرهق ومُعرض للإصابة. <br>- <b>أخضر (0 إلى +10):</b> منطقة البناء العضلي المثالية. <br>- <b>ذهبي (فوق +10):</b> جاهزية نووية! طاقتك فل وجاهز تكسر أعلى وزن بحياتك (PR)."
    ];

    const rulesHtml = steps.map(step => 
        `<li style="margin-bottom:12px; text-align:${isEn ? 'left' : 'right'}; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
            ${step}
        </li>`
    ).join('');

    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.style.zIndex = '30000';
    modal.innerHTML = `
        <div class="modal-content glass-card" style="max-width:450px; padding:25px; border: 1px solid #FFD700; position: relative;">
            <h2 style="color:#FFD700; margin-bottom:20px; text-align:center;">${title}</h2>
            <ul style="color:var(--white); list-style:none; padding:0; font-size:0.9rem; line-height: 1.6;">${rulesHtml}</ul>
            <button class="btn-primary" onclick="this.parentElement.parentElement.remove()" style="width: 100%; margin-top: 20px; padding: 10px; background: #FFD700; color: #0A1429;">
                ${isEn ? 'Mind blown. Let\'s train!' : 'فهمت اللعبة. يلا نجلد! '}
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// نافذة شرح رادار التوازن العضلي
function showRadarInfo() {
    const isEn = currentLang === 'en';
    
    const title = isEn ? 'How to Read the Radar? ' : 'كيف تقرأ الرادار؟ ';
    
    // خطوات الشرح مجهزة باللغتين
    const steps = isEn ? [
        " <b>The Goal:</b> To create a balanced shape, meaning your body strength is proportional.",
        " <b>Imbalance:</b> If the shape is pulled to one side (e.g., huge Bench, tiny Row), you have a muscle imbalance.",
        " <b>Injury Prevention:</b> A strong chest with a weak back causes rounded shoulders and injuries. Focus on your weaknesses!",
        " <b>Calculation:</b> The radar pulls the 'Heaviest Weight' you've logged for the Big 5 lifts."
    ] : [
        " <b>الهدف:</b> أن يكون الشكل متوازن من كل الجهات، مما يعني أن قوة عضلاتك متناسقة.",
        " <b>عدم التوازن:</b> إذا كان الشكل مسحوباً لجهة معينة (مثلاً: بنش برس عالي وتجديف ضعيف)، فهذا يعني أن لديك خلل عضلي.",
        " <b>الوقاية من الإصابات:</b> الصدر القوي مع الظهر الضعيف يسبب إصابات بالكتف (تدوير للأمام). ركز على نقاط ضعفك!",
        " <b>طريقة الحساب:</b> الرادار يقرأ 'أعلى وزن' سجلته في أرشيفك للتمارين الـ 5 الأساسية."
    ];

    const rulesHtml = steps.map(step => 
        `<li style="margin-bottom:12px; text-align:${isEn ? 'left' : 'right'}; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
            ${step}
        </li>`
    ).join('');

    // إنشاء النافذة المنبثقة (Modal)
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.style.zIndex = '30000'; // لضمان ظهورها فوق كل شيء
    modal.innerHTML = `
        <div class="modal-content glass-card" style="max-width:400px; padding:25px; border: 1px solid var(--primary-color); position: relative;">
            <h2 style="color:var(--primary-color); margin-bottom:20px; text-align:center;">${title}</h2>
            <ul style="color:var(--white); list-style:none; padding:0; font-size:0.9rem; line-height: 1.6;">${rulesHtml}</ul>
            <button class="btn-primary" onclick="this.parentElement.parentElement.remove()" style="width: 100%; margin-top: 20px; padding: 10px;">
                ${isEn ? 'Got it, let\'s lift!' : 'فهمت، يلا نبلش! '}
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// ==========================================
// 🕸️ رادار التوازن العضلي (Muscle Imbalance Radar)
// ==========================================
window.radarChartInstance = null;

function initRadarChart() {
    if (typeof Chart === 'undefined') return;

    let workoutHistory = [];
    try { workoutHistory = JSON.parse(localStorage.getItem('userWorkouts')) || []; } catch(e) {}
    
    const ctx = document.getElementById('radarChart');
    const emptyMsg = document.getElementById('radar-empty-msg');
    const wrapper = document.getElementById('radar-wrapper');
    
    if (!ctx) return;

    // قاموس التمارين الـ 5 الأساسية بكل اللغات والمسميات المحتملة
    const big5 = {
        'Deadlift': { keywords: ['ديدليفت', 'deadlift', 'رفعة ميتة'], val: 0 },
        'Squat': { keywords: ['سكوات', 'squat', 'قرفصاء'], val: 0 },
        'Bench Press': { keywords: ['بنش', 'صدر', 'bench', 'chest press'], val: 0 },
        'Barbell Row': { keywords: ['تجديف', 'سحب أرضي', 'row', 'lat'], val: 0 },
        'Overhead Press': { keywords: ['أكتاف', 'shoulder', 'overhead', 'ohp'], val: 0 }
    };

    let hasData = false;

    // فلترة التمارين للبحث عن أعلى وزن مسجل في الحركات الأساسية
    workoutHistory.forEach(w => {
        w.details.forEach(ex => {
            let wgt = parseFloat(ex.weight);
            let name = ex.name.toLowerCase();
            
            if (!isNaN(wgt) && wgt > 0) {
                for (let key in big5) {
                    // إذا اسم التمرين بيحتوي على واحدة من الكلمات الدلالية
                    if (big5[key].keywords.some(k => name.includes(k))) {
                        if (wgt > big5[key].val) {
                            big5[key].val = wgt;
                            hasData = true;
                        }
                    }
                }
            }
        });
    });

    if (!hasData) {
        wrapper.style.display = 'none';
        if(emptyMsg) emptyMsg.style.display = 'block';
        return;
    }

    wrapper.style.display = 'block';
    if(emptyMsg) emptyMsg.style.display = 'none';

    if (window.radarChartInstance) {
        window.radarChartInstance.destroy(); 
    }

    // تجهيز التسميات والأرقام حسب لغة التطبيق
    const labels = currentLang === 'en' 
        ? ['Deadlift', 'Squat', 'Bench Press', 'Row', 'Shoulders']
        : ['ديدليفت', 'سكوات', 'بنش برس', 'تجديف ظهر', 'ضغط أكتاف'];

    const dataValues = [
        big5['Deadlift'].val,
        big5['Squat'].val,
        big5['Bench Press'].val,
        big5['Barbell Row'].val,
        big5['Overhead Press'].val
    ];

    // رسم الرادار العنكبوتي الفخم 🕸️
    window.radarChartInstance = new Chart(ctx.getContext('2d'), {
        type: 'radar',
        data: {
            labels: labels,
            datasets: [{
                label: currentLang === 'en' ? 'Max Weight (kg)' : 'أعلى وزن (kg)',
                data: dataValues,
                backgroundColor: 'rgba(0, 242, 167, 0.25)', // لون تعبئة شفاف نيون
                borderColor: '#00f2a7', // حدود نيون خضراء
                pointBackgroundColor: '#FFD700', // نقاط ذهبية
                pointBorderColor: '#0A1429',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#00f2a7',
                borderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                    grid: { color: 'rgba(255, 255, 255, 0.1)' },
                    pointLabels: {
                        color: '#e6f1ff',
                        font: { family: 'var(--font-main)', size: 12, weight: 'bold' }
                    },
                    ticks: {
                        display: false, // إخفاء الأرقام من الشبكة عشان الشكل يطلع أنظف
                        beginAtZero: true
                    }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: {
                    titleFont: { family: 'var(--font-main)', size: 14 },
                    bodyFont: { family: 'var(--font-main)', size: 14, weight: 'bold' }
                }
            }
        }
    });
}

function switchPerfTab(tab) {
    document.querySelectorAll('.perf-tab-btn').forEach(btn => btn.classList.remove('active-tab'));
    document.querySelectorAll('.perf-tab-content').forEach(content => content.style.display = 'none');
    document.getElementById(`tab-btn-${tab}`).classList.add('active-tab');
    document.getElementById(`perf-tab-${tab}`).style.display = 'block';
    
    // إعادة رسم الخريطة عند فتح التبويب
    if(tab === 'muscles') initMuscleRecoveryMap();
}


// محرك الخريطة الحرارية
let muscleRecoveryData = {};

function initMuscleRecoveryMap() {
    let workouts = JSON.parse(localStorage.getItem('userWorkouts')) || [];
    
    // تاريخ اليوم (منتصف الليل للمقارنة الدقيقة)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // تتبع آخر مرة تم تدريب كل مجموعة عضلية فيها
    const lastTrained = {
        'صدر': null, 'أكتاف': null, 'أذرع': null, 'أرجل': null, 'بطن': null, 'ظهر': null
    };

    workouts.forEach(w => {
        // تحويل نص التاريخ (مثال: 10 Oct 2023) إلى كائن Date
        let wDate = new Date(Date.parse(w.date));
        if(isNaN(wDate)) return; // تجاوز الأخطاء

        wDate.setHours(0, 0, 0, 0);

        // ربط الأنظمة بالعضلات
        const type = w.type;
        const updateIfNewer = (muscle) => {
            if (!lastTrained[muscle] || wDate > lastTrained[muscle]) {
                lastTrained[muscle] = wDate;
            }
        };

        // تحليل ذكي للعضلات حسب النظام
        if (type.includes("صدر") || type.includes("Chest")) updateIfNewer('صدر');
        if (type.includes("أكتاف") || type.includes("Shoulders")) updateIfNewer('أكتاف');
        if (type.includes("بايسبس") || type.includes("ترايسبس") || type.includes("Arms")) updateIfNewer('أذرع');
        if (type.includes("أرجل") || type.includes("Legs")) updateIfNewer('أرجل');
        if (type.includes("بطن") || type.includes("Core")) updateIfNewer('بطن');
        if (type.includes("ظهر") || type.includes("Back")) updateIfNewer('ظهر');
        
        // ربط الأنظمة الشاملة
        if (type.includes("دفع") || type.includes("Push")) { updateIfNewer('صدر'); updateIfNewer('أكتاف'); updateIfNewer('أذرع'); }
        if (type.includes("سحب") || type.includes("Pull")) { updateIfNewer('ظهر'); updateIfNewer('أذرع'); }
        if (type.includes("شامل") || type.includes("Full Body")) {
            Object.keys(lastTrained).forEach(m => updateIfNewer(m));
        }
    });

    muscleRecoveryData = lastTrained; // تخزينها للعرض عند الكبس

    // تلوين العضلات على الخريطة
    const applyColor = (elementIds, muscleName) => {
        const lastDate = lastTrained[muscleName];
        let color = '#00f2a7'; // أخضر: متعافية أو لم تتمرن أبداً
        
        if (lastDate) {
            const diffTime = Math.abs(today - lastDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

            if (diffDays <= 1) color = '#ff4d4d'; // أحمر: مرهقة (اليوم أو أمس)
            else if (diffDays <= 3) color = '#FFD700'; // أصفر: قيد الاستشفاء (من يومين لـ 3)
        }

        elementIds.forEach(id => {
            const el = document.getElementById(id);
            if(el) {
                el.style.backgroundColor = color;
                // إضافة توهج لنفس اللون
                el.style.boxShadow = `0 0 15px ${color}`; 
            }
        });
    };

    applyColor(['zone-chest'], 'صدر');
    applyColor(['zone-abs'], 'بطن');
    applyColor(['zone-shoulders-l', 'zone-shoulders-r'], 'أكتاف');
    applyColor(['zone-arms-l', 'zone-arms-r'], 'أذرع');
    applyColor(['zone-legs'], 'أرجل');
}


// التفاعل عند الكبس على العضلة (نسخة تدعم اللغتين رسمياً)
function showMuscleStatus(muscleName) {
    const lastDate = muscleRecoveryData[muscleName];
    
    // 1. ترجمة اسم العضلة بناءً على لغة التطبيق الحالية
    const muscleNamesEn = {
        'صدر': 'Chest', 
        'أكتاف': 'Shoulders', 
        'أذرع': 'Arms', 
        'أرجل': 'Legs', 
        'بطن': 'Core', 
        'ظهر': 'Back'
    };
    
    // تحديد الاسم الذي سيظهر للمستخدم (عربي أو إنجليزي)
    const localizedMuscle = currentLang === 'en' ? (muscleNamesEn[muscleName] || muscleName) : muscleName;

    // 2. حالة إذا لم يتم تدريب العضلة من قبل (أرشيف فارغ لها)
    if (!lastDate) {
        const notTrainedMsg = currentLang === 'en' ? 
            `The ${localizedMuscle} has not been trained yet.` : 
            `لم يتم تدريب عضلة الـ ${localizedMuscle} بعد.`;
        showToast(notTrainedMsg);
        return;
    }

    // 3. حساب الأيام الماضية منذ آخر تمرين
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = Math.abs(today - lastDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // 4. تحديد رسالة الاستشفاء حسب اللغة والأيام
    let statusMsg = "";

    if (currentLang === 'en') {
        if (diffDays === 0) statusMsg = "Trained today. Muscle is highly exhausted.";
        else if (diffDays === 1) statusMsg = "Trained yesterday. Muscle is exhausted.";
        else if (diffDays <= 3) statusMsg = `Trained ${diffDays} days ago. Muscle is recovering.`;
        else statusMsg = `Trained ${diffDays} days ago. Muscle is fully recovered.`;
    } else {
        if (diffDays === 0) statusMsg = "تم تدريبه اليوم. العضلة مرهقة جداً.";
        else if (diffDays === 1) statusMsg = "تم تدريبه البارحة. العضلة مرهقة.";
        else if (diffDays <= 3) statusMsg = `تم تدريبه منذ ${diffDays} أيام. العضلة قيد الاستشفاء.`;
        else statusMsg = `تم تدريبه منذ ${diffDays} أيام. العضلة متعافية تماماً.`;
    }

    // 5. عرض الإشعار النهائي
    showToast(`${localizedMuscle}: ${statusMsg}`);
}


function getTranslatedType(savedType) {
    const t_ar = translations['ar'];
    const t_en = translations['en'];
    let foundKey = null;

    // البحث عن الكلمة في القاموس العربي
    for (const [key, value] of Object.entries(t_ar)) {
        if (value === savedType) { foundKey = key; break; }
    }
    // إذا لم يجدها، يبحث في الإنجليزي
    if (!foundKey) {
        for (const [key, value] of Object.entries(t_en)) {
            if (value === savedType) { foundKey = key; break; }
        }
    }

    // إرجاع الكلمة باللغة المختارة حالياً
    if (foundKey && translations[currentLang][foundKey]) {
        return translations[currentLang][foundKey];
    }
    return savedType; // إذا لم يجدها، يتركها كما هي
}

// ==========================================
// 📁 عرض أرشيف التمارين (مترجم ديناميكياً)
// ==========================================
function renderWorkoutLog() {
    let workoutHistory = [];
    try { workoutHistory = JSON.parse(localStorage.getItem('userWorkouts')) || []; } catch(e) {}
    
    const container = document.getElementById('log-container');
const emptyMsg = translations[currentLang || 'ar'].empty_log;

    
    if(!Array.isArray(workoutHistory) || workoutHistory.length === 0) {
        container.innerHTML = `<p style="text-align:center; color: var(--slate); margin-top: 20px;">${emptyMsg}</p>`;
        return;
    }

    container.innerHTML = workoutHistory.map((workout, index) => {
        let translatedType = getTranslatedType(workout.type); // 🔥 استخدام المترجم هنا
        
        return `
        <div class="log-card" onclick="toggleLogDetails(${index})">
            <div class="log-header">
                <span>${translatedType}</span>
                <span class="log-date">${workout.date}</span>
            </div>
            <div id="log-details-${index}" class="log-details" style="display: none;">
                ${workout.details.map(ex => `
                    <div class="ex-item">
                        <span>${ex.name}</span>
                        <span>${ex.reps} Reps | ${ex.weight} kg</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `}).join('');
}

// ==========================================
// 📈 رسم بياني (خطي) لتطور أعلى وزن (مترجم)
// ==========================================
function initWorkoutChart() {
    if (typeof Chart === 'undefined') return;

    let workoutHistory = [];
    try { workoutHistory = JSON.parse(localStorage.getItem('userWorkouts')) || []; } catch(e) {}
    
    const ctx = document.getElementById('workoutChart');
    const emptyMsg = document.getElementById('chart-empty-msg');
    const wrapper = document.getElementById('chart-wrapper');
    
    if (!ctx) return;

    if (!Array.isArray(workoutHistory) || workoutHistory.length === 0) {
        wrapper.style.display = 'none';
        if(emptyMsg) emptyMsg.style.display = 'block';
        return;
    }

    const maxWeights = {};
    let hasAnyWeight = false;

    // حساب أعلى وزن لكل عضلة بعد ترجمتها
    workoutHistory.forEach(w => {
        let t = getTranslatedType(w.type || 'تمرين'); // 🔥 استخدام المترجم هنا
        if (maxWeights[t] === undefined) maxWeights[t] = 0;

        w.details.forEach(ex => {
            let wgt = parseFloat(ex.weight);
            if (!isNaN(wgt) && wgt > maxWeights[t]) {
                maxWeights[t] = wgt;
                hasAnyWeight = true;
            }
        });
    });

    if (!hasAnyWeight) {
        wrapper.style.display = 'none';
        if(emptyMsg) {
emptyMsg.innerText = translations[currentLang || 'ar'].add_weights_msg;

            emptyMsg.style.display = 'block';
        }
        return;
    }

    wrapper.style.display = 'block';
    if(emptyMsg) emptyMsg.style.display = 'none';

    if (window.workoutChartInstance) {
        window.workoutChartInstance.destroy(); 
    }

    const chartTitle = currentLang === 'en' ? 'Max Weight Lifted (kg)' : 'أعلى وزن تم رفعه (kg)';
    const labelTitle = currentLang === 'en' ? 'Max Weight (kg)' : 'أعلى وزن (kg)';

    window.workoutChartInstance = new Chart(ctx.getContext('2d'), {
        type: 'line', // 🔥 رسم بياني خطي للأوزان
        data: {
            labels: Object.keys(maxWeights), // العضلات המترجمة
            datasets: [{
                label: labelTitle,
                data: Object.values(maxWeights),
                borderColor: '#00f2a7',
                backgroundColor: 'rgba(0, 242, 167, 0.15)',
                pointBackgroundColor: '#0A1429',
                pointBorderColor: '#00f2a7',
                pointBorderWidth: 3,
                pointRadius: 6,
                pointHoverRadius: 9,
                fill: true,
                tension: 0.4 // انحناء ناعم للخط
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    titleFont: { family: 'var(--font-main)', size: 14 },
                    bodyFont: { family: 'var(--font-main)', size: 14, weight: 'bold' },
                    callbacks: {
                        label: function(context) {
                            return (currentLang === 'en' ? ' Max: ' : ' أعلى وزن: ') + context.parsed.y + ' kg';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: chartTitle, color: '#8892b0', font: {family: 'var(--font-main)'} },
                    ticks: { color: '#8892b0', font: { family: 'var(--font-main)', weight: 'bold' } },
                    grid: { color: 'rgba(255, 255, 255, 0.05)' } 
                },
                x: {
                    ticks: { color: 'white', font: { family: 'var(--font-main)', weight: 'bold' } },
                    grid: { display: false } 
                }
            }
        }
    });
}



// ==========================================

// ==========================================
function toggleLogDetails(index) {
    const details = document.getElementById(`log-details-${index}`);
    if (details) {

        if (details.style.display === 'none' || details.style.display === '') {
            details.style.display = 'flex';
        } else {
            details.style.display = 'none';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // تشغيل الخلفية وتطبيق اللغة
    initStardustCanvas();
    applyLanguage();
    initScrollAnimations();


    if (document.getElementById('hero')) {
        initIndexPage();
    } else if (document.getElementById('main-content-area')) {
        initDashboardPage();
    }
});



// ==========================================
// 🏆 نظام الإنجازات والأوسمة (Achievement Engine)
// ==========================================

// قائمة الأوسمة الفخمة (بالأيقونات النيون)
// قائمة الأوسمة الكاملة والمصلحة
// ==========================================
// 🏆 قائمة الأوسمة المحدثة (الديدليفت، السكوات، وإنجازات خاصة)
// ==========================================
const allBadges = [
    // --- فئة الوجبات والتمارين الأساسية ---
    { id: 'm1', type: 'meals', target: 1, icon: '<i class="fas fa-apple-alt"></i>', title_ar: 'أول قطف', title_en: 'First Bite', desc_ar: 'سجل أول وجبة صحية', desc_en: 'Log your first healthy meal', xp: 50 },
    { id: 'm50', type: 'meals', target: 50, icon: '<i class="fas fa-utensils"></i>', title_ar: 'الشيف الماستر', title_en: 'Master Chef', desc_ar: 'سجل 50 وجبة صحية', desc_en: 'Log 50 healthy meals', xp: 500 },
    { id: 'w1', type: 'workouts', target: 1, icon: '<i class="fas fa-running"></i>', title_ar: 'كسر الجليد', title_en: 'Ice Breaker', desc_ar: 'سجل أول تمرين لك', desc_en: 'Log your first workout', xp: 50 },
    { id: 'w50', type: 'workouts', target: 50, icon: '<i class="fas fa-dumbbell"></i>', title_ar: 'مدمن حديد', title_en: 'Iron Addict', desc_ar: 'سجل 50 تمريناً', desc_en: 'Log 50 workouts', xp: 800 },
    { id: 'mw100', type: 'maxWeight', target: 100, icon: '<i class="fas fa-weight-hanging"></i>', title_ar: 'نادي الـ 100', title_en: '100 Club', desc_ar: 'ارفع 100 كغ', desc_en: 'Lift 100 kg', xp: 500 },
    { id: 's7', type: 'streak', target: 7, icon: '<i class="fas fa-fire"></i>', title_ar: 'الأسبوع الناري', title_en: 'Fire Week', desc_ar: 'ستريك 7 أيام', desc_en: '7-day streak', xp: 300 },

    // --- 🔥 تحديث الديدليفت (DL Combo) ---
    { id: 'dl50', type: 'dl_combo', target: 50, icon: '<i class="fas fa-hand-fist"></i>', title_ar: 'قبضة الموت', title_en: 'Death Grip', desc_ar: 'كومبو 50 بالديدليفت', desc_en: '50 Combo in Deadlift', xp: 200 },
    { id: 'dl100', type: 'dl_combo', target: 100, icon: '<i class="fas fa-bolt"></i>', title_ar: 'البرق', title_en: 'The Bolt', desc_ar: 'كومبو 100 بالديدليفت', desc_en: '100 Combo in Deadlift', xp: 400 },
    { id: 'dl200', type: 'dl_combo', target: 200, icon: '<i class="fas fa-meteor"></i>', title_ar: 'النيزك', title_en: 'The Meteor', desc_ar: 'كومبو 200 بالديدليفت', desc_en: '200 Combo in Deadlift', xp: 800 },
    { id: 'dl400', type: 'dl_combo', target: 400, icon: '<i class="fas fa-skull-crossbones"></i>', title_ar: 'المنتقم', title_en: 'The Avenger', desc_ar: 'كومبو 400 بالديدليفت', desc_en: '400 Combo in Deadlift', xp: 1500 },
    { id: 'dl600', type: 'dl_combo', target: 600, icon: '<i class="fas fa-dragon"></i>', title_ar: 'ملك التنانين', title_en: 'Dragon King', desc_ar: 'كومبو 600 بالديدليفت (جنون!)', desc_en: '600 Combo in Deadlift (Insane!)', xp: 3000 },

    // --- 🦵 تحديث السكوات (Squat Score) ---
    { id: 'sq200', type: 'sq_score', target: 200, icon: '<i class="fas fa-yin-yang"></i>', title_ar: 'توازن النينجا', title_en: 'Ninja Balance', desc_ar: '200 نقطة بالسكوات', desc_en: '200 Points in Squat', xp: 200 },
    { id: 'sq300', type: 'sq_score', target: 300, icon: '<i class="fas fa-gem"></i>', title_ar: 'الجوهرة', title_en: 'The Gem', desc_ar: '300 نقطة بالسكوات', desc_en: '300 Points in Squat', xp: 350 },
    { id: 'sq400', type: 'sq_score', target: 400, icon: '<i class="fas fa-crown"></i>', title_ar: 'توازن مطلق', title_en: 'Pure Balance', desc_ar: '400 نقطة بالسكوات', desc_en: '400 Points in Squat', xp: 500 },

    // --- ✨ إنجازات إضافية من ذوقي (نيون وفخمة) ---
    { id: 'xp5000', type: 'xpTotal', target: 5000, icon: '<i class="fas fa-vault"></i>', title_ar: 'خزنة النقاط', title_en: 'XP Vault', desc_ar: 'اجمع 5000 نقطة إجمالاً', desc_en: 'Collect 5000 total XP', xp: 1000 },
    { id: 'lvl10', type: 'levelReach', target: 10, icon: '<i class="fas fa-rocket"></i>', title_ar: 'انطلاق الصاروخ', title_en: 'Rocket Launch', desc_ar: 'وصلت للمستوى 10', desc_en: 'Reach Level 10', xp: 1000 },
    { id: 'morning_warrior', type: 'morning', target: 1, icon: '<i class="fas fa-sun"></i>', title_ar: 'طير الصبح', title_en: 'Early Bird', desc_ar: 'سجل تمرينك قبل الساعة 8 صباحاً', desc_en: 'Log workout before 8 AM', xp: 300 },
    { id: 'weekend_hero', type: 'weekend', target: 1, icon: '<i class="fas fa-calendar-check"></i>', title_ar: 'بطل العطلة', title_en: 'Weekend Hero', desc_ar: 'سجل تمرينك يوم الجمعة أو السبت', desc_en: 'Log workout on Weekend', xp: 300 }
];


function renderBadges() {
    const container = document.getElementById('badges-container');
    if (!container) return;
    
    const t = translations[currentLang || 'ar']; 
    let data = JSON.parse(localStorage.getItem('currentUser') || '{}');
    let earned = data.earnedBadges || [];


    if (data.stats && typeof data.stats.workouts !== 'number') {
        data.stats.workouts = Array.isArray(data.workouts) ? data.workouts.length : 0;
    }

    container.innerHTML = allBadges.map(badge => {
        const isUnlocked = earned.includes(badge.id);
        const title = currentLang === 'en' ? badge.title_en : badge.title_ar;
        const desc = currentLang === 'en' ? badge.desc_en : badge.desc_ar;
        
        let progress = data.stats ? (data.stats[badge.type] || 0) : 0;
        
        // تأكيد إضافي عشان ما يطلع أي نص غريب أو object
        if (typeof progress !== 'number') {
            progress = parseInt(progress) || 0;
        }
        
        const statusText = isUnlocked ? t.badge_completed : `${progress} / ${badge.target}`;

        return `
            <div class="badge-card ${isUnlocked ? 'unlocked' : 'locked'}">
                <div class="badge-info-btn" onclick="event.stopPropagation(); showBadgeReward('${badge.id}')">
                    <i class="fas fa-info-circle"></i>
                </div>
                <div class="badge-icon">${badge.icon}</div>
                <div class="badge-title">${title}</div>
                <div class="badge-desc">${desc}</div>
                <div class="badge-progress">${statusText}</div>
            </div>`;
    }).join('');
}

function showBadgeReward(id) {
    const b = allBadges.find(x => x.id === id);
    if (b) {
        const t = translations[currentLang || 'ar'];
        showToast(`${t.reward_text}+${b.xp} XP`);
    }
}


async function updateStat(statName, value, isMax = false) {
    const user = auth.currentUser;
    if (!user) return;
    
    let savedData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!savedData.stats) savedData.stats = { meals: 0, workouts: 0, maxWeight: 0, streak: 0, dl_combo: 0, sq_score: 0 };
    if (!savedData.earnedBadges) savedData.earnedBadges = [];

    // 🔥 تنظيف العدادات قبل التحديث لتجنب خطأ الـ object
    let oldValue = savedData.stats[statName];
    if (typeof oldValue !== 'number') {
        if (statName === 'workouts' && Array.isArray(savedData.workouts)) {
            oldValue = savedData.workouts.length; // استرجاع العدد الصحيح للتمارين
        } else {
            oldValue = 0;
        }
    }

    // التحديث حسب نوع الإحصائية
    if (isMax) {
        if (value > oldValue) {
            savedData.stats[statName] = value;
            
            if (statName === 'maxWeight' && savedData.city) {
                checkThroneUsurper(value, savedData.city, savedData.firstName || 'بطل');
            }
        }
    } else {
        savedData.stats[statName] = oldValue + value;
    }

    localStorage.setItem('currentUser', JSON.stringify(savedData));
    db.collection('users').doc(user.uid).set({ stats: savedData.stats }, { merge: true });
    
    checkBadges(savedData, user);
}




async function checkThroneUsurper(newWeight, city, myName) {
    const currentUser = auth.currentUser;
    if (!currentUser || !city) return;

    try {
        // جلب الملك الحالي للمدينة
        const snapshot = await db.collection('users')
            .where('city', '==', city)
            .orderBy('stats.maxWeight', 'desc')
            .limit(1)
            .get();

        let currentKingId = null;
        let currentKingWeight = 0;

        if (!snapshot.empty) {
            snapshot.forEach(doc => {
                currentKingId = doc.id;
                currentKingWeight = doc.data().stats?.maxWeight || 0;
            });
        }

        // 1. إذا أنا أصلاً الملك وقاعد بزيد رقمي القياسي لسه أعلى، ما بنزعج الناس بإشعار
        if (currentKingId === currentUser.uid) {
            return;
        }

        // 2. إذا رقمي الجديد كسر رقم الملك الحالي! ⚔️
        if (newWeight > currentKingWeight) {
            
            // إشعار فوري إلك أنت عشان تعرف إنك عملت إنجاز عظيم
            showToast("⚔️ لقد أسقطت العرش! جاري إبلاغ المدينة...");
            
            // جلب كل لاعبين مدينتي لإرسال الإشعار لهم
            const cityUsersSnap = await db.collection('users').where('city', '==', city).get();
            const batch = db.batch(); 
            let count = 0;
            
            cityUsersSnap.forEach(userDoc => {
                // بنبعث الإشعار للكل (ومنهم صاحبك) باستثنائك أنت
                if (userDoc.id !== currentUser.uid) { 
                    const notifRef = db.collection('users').doc(userDoc.id).collection('notifications').doc();
                    batch.set(notifRef, {
                        type: 'throne_fall',
                        newKingName: myName,
                        newWeight: newWeight,
                        city: city,
                        status: 'pending',
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    count++;
                }
            });

            // تنفيذ الإرسال الجماعي
            if (count > 0) {
                await batch.commit(); 
                setTimeout(() => showToast("📢 تم إرسال إنذار سقوط العرش لجميع أبطال المدينة!"), 1500);
            }
        }
    } catch (error) {
        console.error("Error checking throne:", error);
    }
}



// 2. المفتش الذكي: يفحص إذا اللاعب جاب وسام جديد
function checkBadges(data, user) {
    let earned = data.earnedBadges || [];
    let stats = data.stats || {};
    let newlyEarned = [];

    allBadges.forEach(badge => {
        if (!earned.includes(badge.id)) {
            let userStat = stats[badge.type] || 0;
            if (userStat >= badge.target) {
                earned.push(badge.id);
                newlyEarned.push(badge);
            }
        }
    });

    if (newlyEarned.length > 0) {
        data.earnedBadges = earned;
        localStorage.setItem('currentUser', JSON.stringify(data));
        db.collection('users').doc(user.uid).update({ earnedBadges: earned });

        newlyEarned.forEach((b, index) => {
            setTimeout(() => {
                const title = currentLang === 'en' ? b.title_en : b.title_ar;
                showToast(`🏆 إنجاز جديد: ${title}! (+${b.xp} XP)`);
                addXP(b.xp); // يعطيه الإكس بي تبع الوسام
            }, index * 2000); // تأخير عشان ما يطلعوا فوق بعض
        });

        // إذا كان فاتح الغرفة، حدثها
        if (document.getElementById('badges-container')) {
            renderBadges();
        }
    }
}

// 3. فتح وبناء غرفة الجوائز (UI)
function openAchievements() {
    if(window.innerWidth < 768) document.getElementById('sidebar').classList.add('collapsed');
    const mainContent = document.getElementById('main-content-area');
    if (!mainContent) return;

    if (!mainContent.dataset.originalContent) {
        mainContent.dataset.originalContent = mainContent.innerHTML;
    }

    const title = currentLang === 'en' ? 'Trophy Room' : 'غرفة الجوائز';
    const back = currentLang === 'en' ? 'Back' : 'رجوع';

    mainContent.innerHTML = `
        <header class="top-bar" style="margin-bottom: 20px;">
            <div class="header-row">
                <button id="back-to-dash-btn" class="btn-primary" style="padding: 5px 15px; font-size: 0.9rem;">${back}</button>
                <h1 style="margin: 0 15px;"> ${title}</h1>
            </div>
        </header>
        <section class="performance-container" style="animation: fadeIn 0.5s;">
            <div id="badges-container" class="badges-grid">
                </div>
        </section>
    `;
    document.getElementById('back-to-dash-btn').onclick = backToDashboard;
    renderBadges();
}


// ==========================================
// 👤 نظام البروفايل الشخصي والبايو
// ==========================================

// --- متغيرات لتخزين بيانات الدول والمدن ---
// --- متغيرات لتخزين بيانات الدول والمدن ---
// --- متغيرات لتخزين بيانات الدول والمدن ---

// ==========================================
// 👤 نظام البروفايل الشخصي والبايو مع الغلاف
// ==========================================

// ==========================================
// 👤 نظام البروفايل الشخصي والبايو مع الغلاف
// ==========================================
// ==========================================
// 👤 نظام البروفايل الشخصي والبايو مع الغلاف والأوسمة
// ==========================================
let globalCountriesData = [];

async function openProfile() {
    if(window.innerWidth < 768) document.getElementById('sidebar').classList.add('collapsed');
    const area = document.getElementById('main-content-area');
    if (!area.dataset.originalContent) area.dataset.originalContent = area.innerHTML;

    const user = auth.currentUser;
    let data = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const t = translations[currentLang || 'ar'];

    const earnedCount = (data.earnedBadges || []).length;
    const bio = data.bio || t.bio_placeholder;
    const userPhoto = data.photoURL || "https://i.ibb.co/9mPmHXkh/cropped-circle-image-2.png";

    // --- كود غلاف البروفايل ---
    const activeCover = data.currentCover || '';
    const coverHtml = activeCover ? `<div class="profile-cover-image" style="background-image: url('${activeCover}');"></div>` : '';

    // --- 🛠️ الإصلاح السحري: جلب الأوسمة المحققة ورسمها مباشرة ---
    let earnedBadgesHTML = `<p style="text-align: center; color: var(--slate); font-size: 0.8rem; padding: 20px;">${t.no_badges_yet || 'لا توجد أوسمة بعد'}</p>`;
    if (data.earnedBadges && data.earnedBadges.length > 0 && typeof allBadges !== 'undefined') {
        earnedBadgesHTML = allBadges
            .filter(b => data.earnedBadges.includes(b.id))
            .map(b => `
                <div class="earned-badge-mini">
                    <div class="badge-icon" style="font-size: 2rem; -webkit-text-stroke: 0px;">${b.icon}</div>
                    <p>${currentLang === 'en' ? b.title_en : b.title_ar}</p>
                </div>
            `).join('');
    }

    area.innerHTML = `
        <header class="top-bar">
            <div class="header-row">
                <button id="back-to-dash-btn" class="btn-primary" style="padding: 5px 15px;">${t.back}</button>
                <h1 style="margin: 0 15px;"> ${t.profile_btn.replace(' ', '')}</h1>
            </div>
        </header>

        <section class="profile-header has-cover" style="position: relative; overflow: hidden; padding-top: ${activeCover ? '0' : '30px'}; margin-bottom: 25px; border-radius: 30px; background: linear-gradient(180deg, rgba(0, 242, 167, 0.1) 0%, transparent 100%);">
            ${coverHtml}
            <div class="profile-header-content" style="position: relative; z-index: 2; width: 100%; display: flex; flex-direction: column; align-items: center; padding-top: ${activeCover ? '80px' : '0'};">
                <img src="${userPhoto}" style="width: 120px; height: 120px; border-radius: 50%; border: 4px solid var(--primary-color); object-fit: cover; box-shadow: 0 0 20px rgba(0,242,167,0.3);">
                <h2 style="color: white; font-weight: 900; margin-top: 10px;">${data.firstName || ''} ${data.lastName || ''}</h2>
                
                <div class="bio-container">
                    <p id="display-bio" class="bio-text">"${bio}"</p>
                    <p id="display-location" style="color: var(--primary-color); font-size: 0.85rem; font-weight: bold; margin-bottom: 5px;">
                        📍 ${data.country || 'الدولة غير محددة'} - ${data.city || 'المدينة غير محددة'}
                    </p>
                    <p id="display-gym" style="color: var(--slate); font-size: 0.8rem; margin-bottom: 15px;">
                        <i class="fa-solid fa-dumbbell"></i> ${data.gym || 'غير منتمي لنادي'}
                    </p>
                    
                    <button id="edit-bio-btn" class="btn-primary" style="padding: 5px 15px; font-size: 0.8rem; background: transparent; border-color: var(--slate); color: var(--slate);">${t.edit_bio}</button>
                    
                    <div id="bio-edit-area" style="display: none; margin-top: 15px; width: 100%; max-width: 400px; margin-left: auto; margin-right: auto;">
                        <textarea id="bio-input" maxlength="100" style="width:100%; min-height:60px; margin-bottom: 10px;">${bio === t.bio_placeholder ? '' : bio}</textarea>
                        
                        <input type="text" id="gym-input" class="input-field" placeholder="اسم النادي الذي تتمرن فيه (اختياري)" value="${data.gym || ''}" style="margin-bottom: 10px;">

                        <div class="location-inputs">
                            <select id="country-select" class="custom-select">
                                <option value="">${t.country_select}</option>
                            </select>
                            <select id="city-select" class="custom-select" disabled>
                                <option value="">${t.city_select}</option>
                            </select>
                        </div>

                        <button id="save-bio-btn" class="btn-primary" style="padding: 8px 20px; font-size: 0.85rem; width: 100%;">${t.save_bio}</button>
                    </div>
                </div>
            </div>
        </section>
        
        <h3 style="color: var(--slate); margin-bottom: 15px; font-size: 0.9rem;">${t.stats_summary}</h3>
        <div class="profile-stats-row">
            <div class="mini-stat-card"><h4>LEVEL</h4><p>${data.rank || 1}</p></div>
            <div class="mini-stat-card"><h4>BADGES</h4><p>${earnedCount}</p></div>
            <div class="mini-stat-card"><h4>STREAK</h4><p>${data.streak || 1}d</p></div>
        </div>

        <h3 style="color: var(--slate); margin-bottom: 15px; font-size: 0.9rem;">${t.my_badges}</h3>
        <div id="profile-earned-badges" class="earned-badges-showcase">
            ${earnedBadgesHTML}
        </div>

<h3 style="margin-top: 20px; color: #8892b0;">${currentLang === 'en' ? 'Settings & Help' : 'الإعدادات والمساعدة'}</h3>

        <div style="display: flex; flex-direction: column; gap: 12px; padding-bottom: 30px;">
            
            <div style="position: relative; width: 100%;">
                <button class="btn-primary" onclick="toggleProfileLangMenu(event)" style="width: 100%; padding: 15px; background: rgba(255, 255, 255, 0.05); border-color: rgba(255, 255, 255, 0.2); color: white; display: flex; justify-content: space-between; align-items: center;">
                    <span style="display: flex; align-items: center; gap: 8px;">${t.language_btn || 'اللغة الأساسية'} <i class="fa-solid fa-globe"></i></span>
                    <i class="fa-solid fa-chevron-down" style="font-size: 0.8rem; transition: 0.3s;" id="profile-lang-icon"></i>
                </button>
                
                <div id="profile-lang-dropdown" style="display: none; position: absolute; top: calc(100% + 5px); left: 0; width: 100%; background: rgba(17, 34, 64, 0.95); backdrop-filter: blur(10px); border: 1px solid var(--primary-color); border-radius: 12px; z-index: 100; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
                    <button onclick="changeLanguageFromProfile('ar')" style="width: 100%; padding: 15px; background: ${currentLang === 'ar' ? 'rgba(0, 242, 167, 0.1)' : 'transparent'}; border: none; border-bottom: 1px solid rgba(255,255,255,0.05); color: ${currentLang === 'ar' ? 'var(--primary-color)' : 'white'}; font-family: var(--font-main); font-weight: bold; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: 0.3s;">
                        <span>العربية</span>
                        ${currentLang === 'ar' ? '<i class="fa-solid fa-check"></i>' : ''}
                    </button>
                    <button onclick="changeLanguageFromProfile('en')" style="width: 100%; padding: 15px; background: ${currentLang === 'en' ? 'rgba(0, 242, 167, 0.1)' : 'transparent'}; border: none; color: ${currentLang === 'en' ? 'var(--primary-color)' : 'white'}; font-family: var(--font-main); font-weight: bold; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: 0.3s;">
                        <span>English</span>
                        ${currentLang === 'en' ? '<i class="fa-solid fa-check"></i>' : ''}
                    </button>
                </div>
            </div>

            <button id="profile-admin-btn" class="btn-primary" onclick="openAdminPanel()" style="display: none; width: 100%; padding: 15px; border-color: #ff9f43; color: #ff9f43; background: rgba(255, 159, 67, 0.05); justify-content: space-between; align-items: center;">
                <span style="display: flex; align-items: center; gap: 8px;">${t.admin_panel || 'لوحة الإدارة'} <i class="fa-solid fa-crown"></i></span>
                <i class="fa-solid fa-chevron-left" style="font-size: 0.8rem;"></i>
            </button>

            <button class="btn-primary" onclick="logoutFromProfile()" style="width: 100%; padding: 15px; border-color: rgba(255, 77, 77, 0.3); color: #ff4d4d; background: rgba(255, 77, 77, 0.05); display: flex; justify-content: center; align-items: center; margin-top: 10px;">
                <span style="display: flex; align-items: center; gap: 8px;">${t.logout || 'تسجيل الخروج'} <i class="fa-solid fa-arrow-right-from-bracket"></i></span>
            </button>

        </div>
    `;

    document.getElementById('back-to-dash-btn').onclick = backToDashboard;
    
    const adminBtn = document.getElementById('profile-admin-btn');
    if (adminBtn && user && user.email === "raedabdi9@gmail.com") { 
        adminBtn.style.display = 'flex';
    }

    const editBtn = document.getElementById('edit-bio-btn');
    const saveBtn = document.getElementById('save-bio-btn');
    const displayBio = document.getElementById('display-bio');
    const displayLocation = document.getElementById('display-location');
    const displayGym = document.getElementById('display-gym');
    const editArea = document.getElementById('bio-edit-area');
    const countrySelect = document.getElementById('country-select');
    const citySelect = document.getElementById('city-select');

    if (globalCountriesData.length === 0) {
        countrySelect.innerHTML = `<option>جاري التحميل...</option>`;
        try {
            const res = await fetch('https://countriesnow.space/api/v0.1/countries');
            const json = await res.json();
            globalCountriesData = json.data; 
        } catch (e) {
            console.error(e);
            countrySelect.innerHTML = `<option value="">فشل التحميل، حاول لاحقاً</option>`;
        }
    }

    if (globalCountriesData.length > 0) {
        countrySelect.innerHTML = `<option value="">${t.country_select}</option>`;
        globalCountriesData.forEach(c => {
            const option = document.createElement('option');
            option.value = c.country;
            option.innerText = c.country;
            if (data.country === c.country) option.selected = true;
            countrySelect.appendChild(option);
        });
        if (data.country) populateCities(data.country, data.city, citySelect, t);
    }

    countrySelect.addEventListener('change', (e) => populateCities(e.target.value, null, citySelect, t));

    if(editBtn) {
        editBtn.onclick = () => {
            displayBio.style.display = 'none';
            displayLocation.style.display = 'none';
            displayGym.style.display = 'none';
            editBtn.style.display = 'none';
            editArea.style.display = 'block';
        };
    }

    if(saveBtn) {
        saveBtn.onclick = async () => {
            const newBio = document.getElementById('bio-input').value.trim();
            const newGym = document.getElementById('gym-input').value.trim();
            const newCountry = countrySelect.value;
            const newCity = citySelect.value;

            await db.collection('users').doc(user.uid).update({ 
                bio: newBio, gym: newGym, country: newCountry, city: newCity
            });
            
            data.bio = newBio; data.gym = newGym; data.country = newCountry; data.city = newCity;
            localStorage.setItem('currentUser', JSON.stringify(data));
            
            displayBio.innerText = `"${newBio || t.bio_placeholder}"`;
            displayLocation.innerText = `📍 ${newCountry || 'غير محدد'} - ${newCity || 'غير محدد'}`;
            displayGym.innerHTML = `<i class="fa-solid fa-dumbbell"></i> ${newGym || 'غير منتمي لنادي'}`;
            displayBio.style.display = 'block'; displayLocation.style.display = 'block'; displayGym.style.display = 'block';
            editBtn.style.display = 'inline-block'; editArea.style.display = 'none';
            showToast("✅ تم حفظ البروفايل بنجاح!");
        };
    }

    function populateCities(selectedCountry, selectedCity, citySelectElement, t) {
        citySelectElement.innerHTML = `<option value="">${t.city_select}</option>`;
        if (!selectedCountry) { citySelectElement.disabled = true; return; }
        const countryData = globalCountriesData.find(c => c.country === selectedCountry);
        if (countryData && countryData.cities) {
            citySelectElement.disabled = false;
            countryData.cities.forEach(city => {
                const option = document.createElement('option');
                option.value = city; option.innerText = city;
                if (selectedCity === city) option.selected = true;
                citySelectElement.appendChild(option);
            });
        }
    }
}



window.toggleNotifications = async function(event) {
    event.stopPropagation(); // منع إغلاق القائمة فوراً
    const dropdown = document.getElementById('notif-dropdown');
    dropdown.classList.toggle('show');
    
    // ⚠️ الكود الجديد: طلب الإذن عند الضغط على جرس الإشعارات لأول مرة
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        await requestNotificationPermission();
    }
}

// إغلاق القائمة المنسدلة عند الضغط في أي مكان خارجها
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('notif-dropdown');
    const notifBtn = document.getElementById('notif-btn');
    
    // إذا كانت القائمة مفتوحة والضغطة ما كانت عليها ولا على الجرس
    if (dropdown && dropdown.classList.contains('show')) {
        if (!dropdown.contains(event.target) && !notifBtn.contains(event.target)) {
            dropdown.classList.remove('show');
        }
    }
});


// ==========================================
// 👥 نظام مجتمع الأبطال (البحث، الإضافة، المتصدرين)
// ==========================================
function openFriendsCenter() {
    if(window.innerWidth < 768) document.getElementById('sidebar').classList.add('collapsed');
    const mainContent = document.getElementById('main-content-area');
    if (!mainContent) return;

    if (!mainContent.dataset.originalContent) {
        mainContent.dataset.originalContent = mainContent.innerHTML;
    }

    const t = translations[currentLang || 'ar'];

    mainContent.innerHTML = `
        <header class="top-bar" style="margin-bottom: 20px;">
            <div class="header-row">
                <button id="back-to-dash-btn" class="btn-primary" style="padding: 5px 15px; font-size: 0.9rem;">${t.back}</button>
                <h1 style="margin: 0 15px;">${t.friends_center}</h1>
            </div>
        </header>
        
        <section class="performance-container" style="animation: fadeIn 0.5s;">
            <!-- الأزرار العلوية -->
            <div class="performance-tabs" style="display: flex; gap: 5px; margin-bottom: 20px; background: rgba(255,255,255,0.05); padding: 5px; border-radius: 12px; overflow-x: auto;">
                
                <!-- زر الأصدقاء هو الأساسي والمفعل (active-tab) -->
                <button id="tab-btn-myfriends" class="perf-tab-btn active-tab" onclick="switchFriendsTab('myfriends')">${t.my_friends}</button>
                
                <!-- زر لوحة المتصدرين -->
                <button id="tab-btn-leaderboard" class="perf-tab-btn" onclick="switchFriendsTab('leaderboard')">${t.leaderboard ? t.leaderboard.replace(' ', '') : 'المتصدرين'}</button>
                
                <!-- زر البحث -->
                <button id="tab-btn-search" class="perf-tab-btn" onclick="switchFriendsTab('search')">${t.search_id}</button>
            </div>

            <!-- 1. تبويب الأصدقاء (يظهر أولاً display: block) -->
            <div id="friends-tab-myfriends" class="perf-tab-content" style="display: block;">
                <div id="my-friends-list"></div>
            </div>

            <!-- 2. تبويب لوحة المتصدرين (مخفي بالبداية display: none) -->
            <div id="friends-tab-leaderboard" class="perf-tab-content" style="display: none;">
                <div id="leaderboard-list" style="display: flex; flex-direction: column; gap: 15px;">
                    <div style="text-align:center; padding: 40px;">
                        <i class="fa-solid fa-spinner fa-spin fa-2x" style="color:var(--primary-color);"></i>
                    </div>
                </div>
            </div>

            <!-- 3. تبويب البحث (مخفي بالبداية) -->
            <div id="friends-tab-search" class="perf-tab-content" style="display: none;">
                <div class="search-bar-container">
                    <input type="text" id="friend-search-input" class="search-input" placeholder="${t.search_placeholder}" autocomplete="off">
                    <button class="btn-primary" onclick="searchPlayerByID()" style="padding: 12px 25px;"><i class="fa-solid fa-magnifying-glass"></i> ${t.search_btn}</button>
                </div>
                <div id="search-result-container">
                    <div class="empty-notif"><i class="fa-solid fa-id-card"></i><p>${t.enter_id_msg}</p></div>
                </div>
            </div>

        </section>
    `;
    
    document.getElementById('back-to-dash-btn').onclick = backToDashboard;
    
    // استدعاء دالة رسم الأصدقاء مباشرة لأنها الشاشة الافتراضية
    renderMyFriends();
    
    // استدعاء دالة المتصدرين في الخلفية لتكون جاهزة عند الكبس عليها بدون تأخير
    loadLeaderboardData(); 
}



async function searchPlayerByID() {
    const searchInput = document.getElementById('friend-search-input').value.trim().toUpperCase();
    const resultContainer = document.getElementById('search-result-container');
    const t = translations[currentLang || 'ar'];
    
    if (!searchInput) return;
    resultContainer.innerHTML = `<div class="empty-notif"><i class="fa-solid fa-spinner fa-spin"></i><p>${t.searching}</p></div>`;
    
    try {
        const snapshot = await db.collection('users').where('shortID', '==', searchInput).limit(1).get();
        if (snapshot.empty) {
            resultContainer.innerHTML = `<div class="empty-notif" style="color:#ff4d4d;"><i class="fa-solid fa-triangle-exclamation"></i><p>${t.player_not_found}</p></div>`;
            return;
        }
        
        let targetUser = null; let targetUid = null;
        snapshot.forEach(doc => { targetUser = doc.data(); targetUid = doc.id; });

        if (auth.currentUser && targetUid === auth.currentUser.uid) {
             resultContainer.innerHTML = `<div class="empty-notif"><i class="fa-solid fa-face-laugh-squint"></i><p>${t.own_id_msg}</p></div>`;
             return;
        }

        const userPhoto = targetUser.photoURL || "https://i.ibb.co/9mPmHXkh/cropped-circle-image-2.png";
        const earnedCount = (targetUser.earnedBadges || []).length;

        resultContainer.innerHTML = `
            <section class="profile-header" style="animation: fadeIn 0.4s; padding: 20px; max-width: 400px; margin: auto;">
                <img src="${userPhoto}" style="width: 100px; height: 100px; border-radius: 50%; border: 3px solid var(--primary-color);">
                <h2 style="color: white; font-weight: 900; margin-top: 10px;">${targetUser.firstName} ${targetUser.lastName}</h2>
                <p style="color: var(--slate); font-size: 0.85rem; font-style: italic;">"${targetUser.bio || '💪'}"</p>
                <div class="profile-stats-row" style="margin-bottom: 20px; width: 100%; gap: 10px;">
                    <div class="mini-stat-card"><h4>LEVEL</h4><p>${targetUser.rank || 1}</p></div>
                    <div class="mini-stat-card"><h4>BADGES</h4><p>${earnedCount}</p></div>
                    <div class="mini-stat-card"><h4>STREAK</h4><p>${targetUser.streak || 1}d</p></div>
                </div>
                <button class="btn-primary" onclick="sendFriendRequest('${targetUid}', '${targetUser.firstName}', '${userPhoto}')" style="width: 100%;">
                    <i class="fa-solid fa-user-plus"></i> ${t.send_request}
                </button>
            </section>
        `;
    } catch (error) {
        resultContainer.innerHTML = `<div class="empty-notif" style="color:#ff4d4d;"><p>⚠️ حدث خطأ</p></div>`;
    }
}

// دالة عرض الأصدقاء (النسخة الحية Real-time المحدثة)
async function renderMyFriends() {
    const list = document.getElementById('my-friends-list');
    if (!list) return;
    const t = translations[currentLang || 'ar'];
    
    // إظهار اللودينج لحد ما يجيب الأصدقاء من السيرفر
    list.innerHTML = `<div style="text-align:center; padding: 40px;"><i class="fa-solid fa-spinner fa-spin fa-2x" style="color:var(--primary-color);"></i></div>`;
    
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
        const doc = await db.collection('users').doc(currentUser.uid).get();
        let myFriends = doc.data()?.myFriendsList || [];

        if (myFriends.length === 0) {
            list.innerHTML = `
                <div class="empty-notif" style="margin-top: 30px;">
                    <i class="fa-solid fa-user-group" style="font-size: 3.5rem; opacity: 0.15; color: var(--slate);"></i>
                    <p style="margin-top: 15px; font-size: 1.1rem; color: white;">${t.no_friends_yet}</p>
                    <p style="font-size: 0.85rem; color: var(--slate); max-width: 250px; text-align: center;">${t.search_heroes_msg}</p>
                </div>`;
            return;
        }

        // 🔥 السحر هنا: جلب أحدث صورة واسم ومستوى لكل صديق من الداتا بيس مباشرة!
        let friendsHTML = '';
        
        // نستخدم Promise.all عشان نجيب بيانات كل الأصدقاء بنفس الوقت (أسرع بكثير)
        const friendsDataPromises = myFriends.map(async (friend) => {
            try {
                // نجيب الداتا الطازجة تبعت هاد الصديق
                const friendDoc = await db.collection('users').doc(friend.id).get();
                if (friendDoc.exists) {
                    const freshData = friendDoc.data();
                    const freshName = freshData.firstName ? `${freshData.firstName} ${freshData.lastName}` : friend.name;
                    const freshImg = freshData.photoURL || "https://i.ibb.co/9mPmHXkh/cropped-circle-image-2.png";
                    const freshLevel = freshData.rank || 1;
                    
                    return `
                        <div class="friend-card" style="animation: fadeIn 0.4s;">
                            <div class="friend-info" style="cursor: pointer; transition: 0.3s;" onclick="viewPlayerProfile('${friend.id}')">
                                <img src="${freshImg}">
                                <div>
                                    <h4>${freshName}</h4>
                                    <p>Level ${freshLevel} 🔥</p>
                                </div>
                            </div>
                            <div class="friend-actions">
                                <button class="chat-action-btn" onclick="openChat('${friend.id}', '${freshName}', '${freshImg}')">
                                    <i class="fa-solid fa-message"></i> ${t.chat_btn}
                                </button>
                                <button class="delete-friend-btn" onclick="deleteFriend('${friend.id}')">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `;
                }
            } catch (e) { console.error("Error fetching friend data", e); }
            return '';
        });

        // استنّي كل الداتا تيجي، وبعدين اعرضها
        const friendsResults = await Promise.all(friendsDataPromises);
        friendsHTML = friendsResults.join('');
        
        list.innerHTML = friendsHTML;

    } catch (error) {
        console.error("خطأ في جلب الأصدقاء:", error);
        list.innerHTML = `<p style="text-align:center; color:#ff4d4d;">حدث خطأ في تحميل الأصدقاء</p>`;
    }
}

async function viewPlayerProfile(targetUid) {
    const t = translations[currentLang || 'ar'];
    let modal = document.getElementById('player-profile-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'player-profile-modal';
        modal.className = 'player-profile-modal';
        document.body.appendChild(modal);
    }

    modal.style.background = 'rgba(10, 20, 41, 0.85)';
    modal.style.backdropFilter = 'blur(10px)';
    modal.style.display = 'flex';
    
    modal.innerHTML = `
        <header class="top-bar" style="position: sticky; top: 0; background: transparent; z-index: 10;">
            <div class="header-row">
                <button onclick="document.getElementById('player-profile-modal').style.display='none'" class="btn-primary" style="padding: 5px 15px;">${t.back}</button>
                <h1 style="margin: 0 15px;">${t.searching}</h1>
            </div>
        </header>
        <div style="text-align:center; margin-top:50px; color:var(--primary-color);">
            <i class="fa-solid fa-spinner fa-spin fa-3x"></i>
        </div>
    `;

    try {
        const doc = await db.collection('users').doc(targetUid).get();
        if (!doc.exists) { modal.style.display = 'none'; return; }
        
        const data = doc.data();
        const earnedCount = (data.earnedBadges || []).length;
        const bio = data.bio || "💪";
        const userPhoto = data.photoURL || "https://i.ibb.co/9mPmHXkh/cropped-circle-image-2.png";
        
        // 🔥 التعديل السحري: سحب الغلاف الخاص باللاعب وعرضه
        const activeCover = data.currentCover || '';
        const coverHtml = activeCover ? `<div class="profile-cover-image" style="background-image: url('${activeCover}');"></div>` : '';

        let earnedBadgesHTML = `<p style="text-align: center; color: var(--slate); font-size: 0.8rem; padding: 20px;">${t.no_badges_yet}</p>`;
        if (data.earnedBadges && data.earnedBadges.length > 0) {
            earnedBadgesHTML = allBadges
                .filter(b => data.earnedBadges.includes(b.id))
                .map(b => `
                    <div class="earned-badge-mini">
                        <div class="badge-icon" style="font-size: 2rem; -webkit-text-stroke: 0px;">${b.icon}</div>
                        <p>${currentLang === 'en' ? b.title_en : b.title_ar}</p>
                    </div>
                `).join('');
        }

        modal.innerHTML = `
            <header class="top-bar" style="position: sticky; top: 0; background: rgba(10, 20, 41, 0.95); backdrop-filter: blur(10px); z-index: 10; border-bottom: 1px solid rgba(0, 242, 167, 0.2);">
                <div class="header-row">
                    <button onclick="document.getElementById('player-profile-modal').style.display='none'" class="btn-primary" style="padding: 5px 15px;">${t.back}</button>
                    <h1 style="margin: 0 15px;">${t.hero_profile}</h1>
                </div>
            </header>
            <div style="padding: 20px; max-width: 600px; margin: 0 auto; width: 100%; padding-bottom: 50px;">
                
                <section class="profile-header has-cover" style="position: relative; overflow: hidden; padding-top: ${activeCover ? '0' : '30px'}; margin-bottom: 25px; border-radius: 30px; background: linear-gradient(180deg, rgba(0, 242, 167, 0.1) 0%, transparent 100%); animation: fadeIn 0.4s;">
                    ${coverHtml}
                    <div class="profile-header-content" style="position: relative; z-index: 2; width: 100%; display: flex; flex-direction: column; align-items: center; padding-top: ${activeCover ? '80px' : '0'};">
                        <img src="${userPhoto}" style="width: 120px; height: 120px; border-radius: 50%; border: 4px solid var(--primary-color); object-fit: cover; box-shadow: 0 0 20px rgba(0,242,167,0.3);">
                        <h2 style="color: white; font-weight: 900; margin-top: 10px;">${data.firstName || ''} ${data.lastName || ''}</h2>
                        
                        <div class="bio-container">
                            <p class="bio-text">"${bio}"</p>
                            <p style="color: var(--primary-color); font-size: 0.85rem; font-weight: bold; margin-bottom: 5px;">
                                📍 ${data.country || 'الدولة غير محددة'} - ${data.city || 'المدينة غير محددة'}
                            </p>
                            <p style="color: var(--slate); font-size: 0.8rem; margin-bottom: 15px;">
                                <i class="fa-solid fa-dumbbell"></i> ${data.gym || 'غير منتمي لنادي'}
                            </p>
                        </div>
                    </div>
                </section>
                
                <h3 style="color: var(--slate); margin-bottom: 15px; font-size: 0.9rem;">${t.stats_summary}</h3>
                <div class="profile-stats-row">
                    <div class="mini-stat-card"><h4>LEVEL</h4><p>${data.rank || 1}</p></div>
                    <div class="mini-stat-card"><h4>BADGES</h4><p>${earnedCount}</p></div>
                    <div class="mini-stat-card"><h4>STREAK</h4><p>${data.streak || 1}d</p></div>
                </div>
                
                <h3 style="color: var(--slate); margin-bottom: 15px; font-size: 0.9rem; margin-top: 25px;">${t.earned_badges_title}</h3>
                <div class="earned-badges-showcase">
                    ${earnedBadgesHTML}
                </div>
            </div>
        `;
    } catch (error) { modal.style.display = 'none'; }
}



          
              
            let currentNotifUnsubscribe = null; // متغير لحفظ المستمع
let isInitialLoad = true; 

window.listenForNotifications = function() {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    // 🔴 إيقاف المستمع القديم إذا كان شغال عشان ما يكرر الإشعارات
    if (currentNotifUnsubscribe) {
        currentNotifUnsubscribe();
    }

    currentNotifUnsubscribe = db.collection('users').doc(currentUser.uid).collection('notifications')
      .where('status', '==', 'pending')
      .onSnapshot(snapshot => {
          const badge = document.getElementById('notif-badge');
          const body = document.getElementById('notif-body');
          if (!badge || !body) return;

          const t = translations[currentLang || 'ar'];

          // 1. حالة الفراغ (Empty State)
          if (snapshot.empty) {
              badge.style.display = 'none';
              badge.innerText = '0';
              body.innerHTML = `
                <div class="empty-notif" id="empty-notif">
                    <i class="fa-regular fa-bell-slash"></i>
                    <p>${t.no_notifications}</p> 
                </div>`;
              isInitialLoad = false;
              return;
          }

          // 2. تحديث الجرس
          badge.style.display = 'flex';
          badge.innerText = snapshot.size;

          if (!isInitialLoad) {
              const btn = document.getElementById('notif-btn');
              if(btn) {
                  btn.classList.add('shake');
                  setTimeout(() => btn.classList.remove('shake'), 500);
              }
              showToast(currentLang === 'en' ? " New Notification!" : " إشعار جديد!");
          }
          isInitialLoad = false;

          // 3. رسم الإشعارات
          body.innerHTML = ''; 
          snapshot.forEach(doc => {
              const notif = doc.data();
              const notifId = doc.id;
              
              if (notif.type === 'friend_request') {
                  body.insertAdjacentHTML('beforeend', `
                      <div class="notif-item" id="${notifId}">
                          <div class="notif-icon"><img src="${notif.senderPhoto}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;"></div>
                          <div class="notif-content">
                              <p><strong>${notif.senderName}</strong> ${t.friend_request_from}</p>
                              <div class="notif-actions">
                                  <button class="accept-btn" onclick="acceptFriendRequest('${notifId}', '${notif.senderId}', '${notif.senderName}', '${notif.senderPhoto}')">${t.accept}</button>
                                  <button class="reject-btn" onclick="rejectFriendRequest('${notifId}')">${t.reject}</button>
                              </div>
                          </div>
                      </div>`);
                      
              } else if (notif.type === 'message') {
                  body.insertAdjacentHTML('beforeend', `
                      <div class="notif-item" id="${notifId}" style="cursor: pointer;" onclick="openChat('${notif.senderId}', '${notif.senderName}', '${notif.senderPhoto}')">
                          <div class="notif-icon"><img src="${notif.senderPhoto}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;"></div>
                          <div class="notif-content">
                              <p>${t.message_from} <strong>${notif.senderName}</strong> 💬</p>
                              <p style="font-size: 0.8rem; color: var(--primary-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px;">"${notif.text}"</p>
                              <span class="notif-time" style="font-weight: bold; margin-top: 5px; display: block;">${t.click_to_reply}</span>
                          </div>
                      </div>`);

              } else if (notif.type === 'admin_alert') {
                  let savedData = JSON.parse(localStorage.getItem('currentUser') || '{}');
                  if (savedData.isWorkoutPending) {
                      savedData.isWorkoutPending = false;
                      localStorage.setItem('currentUser', JSON.stringify(savedData));
                  }
                  body.insertAdjacentHTML('beforeend', `
                      <div class="notif-item" id="${notifId}" style="background: rgba(0, 242, 167, 0.05); border-left: 3px solid var(--primary-color);">
                          <div class="notif-icon"><img src="${notif.senderPhoto}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;"></div>
                          <div class="notif-content">
                              <p><strong>${notif.senderName}</strong> </p>
                              <p style="font-size: 0.85rem; color: white; line-height: 1.5; margin-top: 5px; white-space: normal;">${notif.text}</p>
                              <div class="notif-actions" style="margin-top: 10px;">
                                  <button class="accept-btn" style="width: 100%;" onclick="dismissNotif('${notifId}')">${currentLang === 'en' ? 'Got it' : 'حسناً، فهمت'}</button>
                              </div>
                          </div>
                      </div>`);
              } else if (notif.type === 'throne_fall') {
                  let msgText = currentLang === 'en' 
                      ? `🚨 Breaking: ${notif.city}'s throne has fallen! Captain ${notif.newKingName} is the new King with ${notif.newWeight}kg!`
                      : `🚨 عاجل: لقد سقط عرش ${notif.city}! الكابتن (${notif.newKingName}) هو الملك الجديد بوزن ${notif.newWeight}kg!`;
                  
                  body.insertAdjacentHTML('beforeend', `
                      <div class="notif-item" id="${notifId}" style="background: rgba(255, 215, 0, 0.1); border: 1px solid #FFD700;">
                          <div class="notif-icon" style="background: transparent; font-size: 2rem; display:flex; align-items:center; justify-content:center;">👑</div>
                          <div class="notif-content">
                              <p style="color: #FFD700; font-weight: 900; font-size: 0.85rem; line-height: 1.4;">${msgText}</p>
                              <div class="notif-actions" style="margin-top: 8px;">
                                  <button class="accept-btn" style="background: #FFD700; color: black; width: 100%; font-weight: bold;" onclick="markThroneRead('${notifId}')">استلام التحدي ⚔️</button>
                              </div>
                          </div>
                      </div>`);
              } else if (notif.type === 'pending_proof') {
                  body.insertAdjacentHTML('beforeend', `
                      <div class="notif-item" id="${notifId}" style="background: rgba(255, 77, 77, 0.1); border-left: 3px solid #ff4d4d;">
                          <div class="notif-icon" style="background: transparent; font-size: 1.8rem;">🎥</div>
                          <div class="notif-content">
                              <p style="color: white; font-weight: bold; font-size: 0.9rem;">${notif.text}</p>
                              <p style="color: #ff4d4d; font-size: 0.8rem;">${notif.exerciseData.name}: ${notif.exerciseData.weight}kg</p>
                              <div class="notif-actions" style="margin-top: 8px;">
                                  <button class="accept-btn" style="background: #ff4d4d; color: white; width: 100%;" onclick="triggerProofUpload('${notifId}', '${notif.exerciseData.name}', ${notif.exerciseData.weight}, ${notif.exerciseData.reps})">${translations[currentLang].upload_now}</button>
                              </div>
                          </div>
                      </div>`);
              }
          });
      });
};




async function markThroneRead(notifId) {
    const currentUser = auth.currentUser; if (!currentUser) return;
    try { await db.collection('users').doc(currentUser.uid).collection('notifications').doc(notifId).delete(); } catch (e) {}
}

async function dismissNotif(notifId) {
    const currentUser = auth.currentUser; if (!currentUser) return;
    try { await db.collection('users').doc(currentUser.uid).collection('notifications').doc(notifId).delete(); } catch (e) {}
}




window.sendFriendRequest = async function(targetUid, targetName, targetPhoto) {
    const currentUser = auth.currentUser; 
    if (!currentUser) return;
    
    const myData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    let myFriends = myData.myFriendsList || [];
    
    // 1. التحقق إذا كانوا أصدقاء بالفعل (من بياناتك المحلية)
    if (myFriends.find(f => f.id === targetUid)) {
        showToast(currentLang === 'en' ? "Already friends!" : "أنتم أصدقاء بالفعل!");
        return;
    }

    try {
        const myName = myData.firstName ? `${myData.firstName} ${myData.lastName}` : "User";
        const myPhoto = myData.photoURL || "https://i.ibb.co/9mPmHXkh/cropped-circle-image-2.png";
        
        // 2. الحل السحري لمنع التكرار (Spam) وتخطي حماية القراءة:
        // نستخدم ID ثابت للطلب، هيك لو انكبس الزر 100 مرة رح يتحدث نفس الإشعار!
        const requestDocId = 'freq_' + currentUser.uid;
        
        // نستخدم set بدلاً من add عشان نجبره يستخدم الـ ID اللي اخترناه
        await db.collection('users').doc(targetUid).collection('notifications').doc(requestDocId).set({
            type: 'friend_request', 
            senderId: currentUser.uid, 
            senderName: myName, 
            senderPhoto: myPhoto, 
            status: 'pending', 
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        showToast(currentLang === 'ar' ? " تم إرسال الطلب!" : " Request sent!");
        document.getElementById('search-result-container').innerHTML = `<div class="empty-notif" style="color:var(--primary-color);"><i class="fa-solid fa-paper-plane" style="font-size:3rem;"></i><p>${currentLang === 'ar' ? 'تم الإرسال بنجاح!' : 'Sent successfully!'}</p></div>`;
        
    } catch (error) { 
        console.error("Firebase Error: ", error);
        showToast("⚠️ حدث خطأ أثناء إرسال الطلب."); 
    }
};



// دالة قبول طلب الصداقة (تم الإصلاح ✅)
window.acceptFriendRequest = async function(notifId, senderId, senderName, senderPhoto) {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
        // 1. جلب بياناتي عشان أضيف نفسي عند الطرف الثاني
        const myData = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const myName = myData.firstName ? `${myData.firstName} ${myData.lastName}` : "بطل";
        const myPhoto = myData.photoURL || "https://i.ibb.co/9mPmHXkh/cropped-circle-image-2.png";
        const myLevel = myData.rank || 1;

        // 2. تجهيز كائنات الأصدقاء بنفس الشكل اللي بيقرأه التطبيق
        const friendForMe = { id: senderId, name: senderName, img: senderPhoto, level: 1 };
        const friendForThem = { id: currentUser.uid, name: myName, img: myPhoto, level: myLevel };

        const batch = db.batch();

        const currentUserRef = db.collection('users').doc(currentUser.uid);
        const senderUserRef = db.collection('users').doc(senderId);
        // تم الإصلاح: مسار الإشعار الصحيح
        const notifRef = db.collection('users').doc(currentUser.uid).collection('notifications').doc(notifId);

        // إضافة الصديق لي
        batch.update(currentUserRef, {
            myFriendsList: firebase.firestore.FieldValue.arrayUnion(friendForMe)
        });

        // إضافة الصديق للطرف الآخر
        batch.update(senderUserRef, {
            myFriendsList: firebase.firestore.FieldValue.arrayUnion(friendForThem)
        });

        // حذف الإشعار لأن الطلب تم قبوله
        batch.delete(notifRef);

        await batch.commit();

        // تحديث اللوكال ستورج
        let localFriends = JSON.parse(localStorage.getItem('myFriends') || '[]');
        if (!localFriends.find(f => f.id === senderId)) {
            localFriends.push(friendForMe);
            localStorage.setItem('myFriends', JSON.stringify(localFriends));
        }

        showToast(currentLang === 'en' ? "Friend request accepted!" : "تم قبول الصداقة! 🤝");

        // إخفاء الإشعار من الشاشة
        const notifElement = document.getElementById(notifId);
        if (notifElement) notifElement.remove();

        // تحديث واجهة الأصدقاء
        if (typeof renderMyFriends === "function") renderMyFriends();

    } catch (error) {
        console.error("Error accepting friend:", error);
        showToast(currentLang === 'en' ? "Error accepting request" : "حدث خطأ أثناء قبول الطلب");
    }
};


async function rejectFriendRequest(notifId) {
    const currentUser = auth.currentUser; if (!currentUser) return;
    try { await db.collection('users').doc(currentUser.uid).collection('notifications').doc(notifId).delete(); } catch (error) { console.error(error); }
}
async function deleteFriend(friendId) {
    const currentUser = auth.currentUser; if (!currentUser) return;
    const t = translations[currentLang || 'ar'];
    
    if(confirm(currentLang === 'en' ? "Remove this hero from your friends?" : "متأكد إنك بدك تحذف هالبطل من أصدقائك؟")) {
        try {
            // سحب قائمة الأصدقاء من الداتا بيس
            const doc = await db.collection('users').doc(currentUser.uid).get();
            let myFriends = doc.data()?.myFriendsList || [];
            
            // تصفية القائمة (حذف اللي الآي دي تبعه بيطابق)
            myFriends = myFriends.filter(f => f.id !== friendId);
            
            // تحديث الداتا بيس
            await db.collection('users').doc(currentUser.uid).update({ 
                myFriendsList: myFriends 
            });
            
            // إعادة رسم الشاشة
            renderMyFriends();
            showToast(currentLang === 'en' ? "Friend removed" : "تم حذف الصديق");
        } catch (error) { console.error(error); }
    }
}



// ==========================================
// 💬 نظام الدردشة الفوري (مترجم)
// ==========================================
let currentChatUnsubscribe = null; 
let currentChatId = null; 
let currentTargetId = null;

function createChatModalIfNotExist() {
    let modal = document.getElementById('chat-modal');
    const t = translations[currentLang || 'ar'];
    if (!modal) {
        document.body.insertAdjacentHTML('beforeend', `
        <div id="chat-modal" class="chat-modal" style="display: none;">
            <div class="chat-header">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <img id="chat-user-img" src="" alt="User">
                    <h3 id="chat-user-name">User</h3>
                </div>
                <button onclick="closeChat()" class="close-chat-btn">&times;</button>
            </div>
            <div class="chat-body" id="chat-messages"></div>
            <div class="chat-footer">
                <input type="text" id="chat-input" placeholder="${t.type_message}" onkeypress="handleChatEnter(event)">
                <button onclick="sendMessage()"><i class="fa-solid fa-paper-plane"></i></button>
            </div>
        </div>`);
    } else if (modal.parentNode !== document.body) {
        document.body.appendChild(modal);
    }
}


function openChat(friendId, friendName, friendImg) {
    const currentUser = auth.currentUser; 
    if (!currentUser) return;
    
    const t = translations[currentLang || 'ar'];
    currentTargetId = friendId;
    createChatModalIfNotExist();
    
    document.getElementById('chat-user-name').innerText = friendName;
    document.getElementById('chat-user-img').src = friendImg;
    const chatBody = document.getElementById('chat-messages');
    chatBody.innerHTML = `<p style="text-align:center; color:var(--slate); font-size:0.8rem;">${t.loading_messages}</p>`;
    document.getElementById('chat-modal').style.display = 'flex';

    clearMessageNotifications(friendId);
    currentChatId = currentUser.uid < friendId ? `${currentUser.uid}_${friendId}` : `${friendId}_${currentUser.uid}`;
    
    if (currentChatUnsubscribe) currentChatUnsubscribe();

    const oneDayAgo = new Date(); 
    oneDayAgo.setHours(oneDayAgo.getHours() - 24);

    currentChatUnsubscribe = db.collection('chats').doc(currentChatId).collection('messages')
        .where('timestamp', '>=', oneDayAgo).orderBy('timestamp', 'asc')
        .onSnapshot(snapshot => {
            chatBody.innerHTML = ''; 
            if (snapshot.empty) {
                chatBody.innerHTML = `<p style="text-align:center; color:var(--slate); font-size:0.8rem; margin-top:20px;">${t.messages_disappear}</p>`;
                return;
            }
            
            // بداية الكود المحمي من الاختراق
            snapshot.forEach(doc => {
                const msg = doc.data();
                const msgClass = msg.senderId === currentUser.uid ? 'sent' : 'received';
                
                // إنشاء عنصر جديد بطريقة آمنة جداً
                const msgDiv = document.createElement('div');
                msgDiv.className = `msg ${msgClass}`;
                
                // استخدام textContent يمنع تنفيذ أي كود خبيث (يحوله لنص عادي)
                msgDiv.textContent = msg.text; 
                
                chatBody.appendChild(msgDiv);
            });
            // نهاية الكود المحمي

            chatBody.scrollTop = chatBody.scrollHeight;
        });
} // <-- تم إغلاق القوس هنا بنجاح

async function clearMessageNotifications(friendId) {
    const currentUser = auth.currentUser; 
    if(!currentUser) return;
    try {
        const snapshot = await db.collection('users').doc(currentUser.uid).collection('notifications').where('type', '==', 'message').where('senderId', '==', friendId).get();
        snapshot.forEach(doc => doc.ref.delete());
    } catch(e) { 
        console.error(e); 
    }
}


function closeChat() {
    document.getElementById('chat-modal').style.display = 'none';
    if (currentChatUnsubscribe) { currentChatUnsubscribe(); currentChatUnsubscribe = null; }
}

async function sendMessage() {
    const currentUser = auth.currentUser; 
    const input = document.getElementById('chat-input'); 
    const msgText = input.value.trim();
    
    if (!msgText || !currentUser || !currentChatId) return;
    input.value = ''; 
    
updateQuestProgress('chat', 1); // ربط مهمة الشات

    try {
        // 1. جلب الصورة والاسم المحدثين مباشرة من السيرفر (لضمان أحدث صورة)
        const userDoc = await db.collection('users').doc(currentUser.uid).get();
        const userData = userDoc.data();
        const myName = userData.firstName ? `${userData.firstName} ${userData.lastName}` : "User";
        const myPhoto = userData.photoURL || "https://i.ibb.co/9mPmHXkh/cropped-circle-image-2.png";

        // 2. إرسال الرسالة للدردشة
        await db.collection('chats').doc(currentChatId).collection('messages').add({
            senderId: currentUser.uid, 
            text: msgText, 
            timestamp: firebase.firestore.FieldValue.serverTimestamp() 
        });
        
        // 3. إطلاق الإشعار للطرف الآخر (مع الصورة القصيرة الحقيقية)
        await db.collection('users').doc(currentTargetId).collection('notifications').add({
            type: 'message', 
            senderId: currentUser.uid, 
            senderName: myName, 
            senderPhoto: myPhoto, // هنا السر!
            text: msgText, 
            status: 'pending', 
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) { 
        console.error(error); 
    }
}


function handleChatEnter(e) { if (e.key === 'Enter') sendMessage(); }







// متغير عالمي لحفظ الفلتر الحالي للخريطة
let currentMapFilter = 'maxWeight'; 

async function openCityMonster() {
    if(window.innerWidth < 768) document.getElementById('sidebar').classList.add('collapsed');
    const mainContent = document.getElementById('main-content-area');
    if (!mainContent) return;

    if (!mainContent.dataset.originalContent) {
        mainContent.dataset.originalContent = mainContent.innerHTML;
    }

    const t = translations[currentLang || 'ar'];
    const currentUserData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const userCity = currentUserData.city || 'Amman'; 
    const userCountry = currentUserData.country || 'Jordan';


     mainContent.innerHTML = `
<header class="top-bar" style="margin-bottom: 20px;">
    <div class="header-row">
        <button id="back-to-dash-btn" class="btn-primary" style="padding: 5px 15px; font-size: 0.9rem;">${t.back}</button>
<h1 style="margin: 0 15px; font-weight: 900; color: #FFD700; display: flex; align-items: center; gap: 8px;">${t.city_monster} <i class="fa-solid fa-crown"></i></h1>

        
        <button onclick="showMonsterRules()" style="background:none; border:none; color:var(--primary-color); cursor:pointer; font-size:1.2rem;">
            <i class="fa-solid fa-circle-question"></i>
        </button>
    </div>
</header>

        <section class="performance-container" style="animation: fadeIn 0.5s;">
            <div class="performance-tabs" style="display: flex; gap: 10px; margin-bottom: 15px; background: rgba(255,255,255,0.05); padding: 5px; border-radius: 12px;">
                <button class="perf-tab-btn active-tab" onclick="changeMapFilter('maxWeight', this)">${t.map_weights}</button>
                <button class="perf-tab-btn" onclick="changeMapFilter('streak', this)">${t.map_streak}</button>
                <button class="perf-tab-btn" onclick="changeMapFilter('level', this)">${t.map_level}</button>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; background: rgba(0,0,0,0.3); padding: 10px 15px; border-radius: 15px;">
                <select id="map-city-select" class="custom-select" style="width: 65%; padding: 8px; font-weight: bold; font-size: 0.9rem; border-color: var(--primary-color);">
                    <option value="${userCity}">📍 ${userCity} ${t.my_city}</option>
                </select>
                <p style="color: var(--slate); font-size: 0.8rem; margin: 0; text-align: left;">${t.battleground}</p>
            </div>
            
            <div id="monster-map-container">
                <div id="monster-map" style="width: 100%; height: 100%;"></div>
            </div>
            
            <div id="monster-info" style="margin-top: 20px; text-align: center; color: var(--primary-color);">
                <i class="fa-solid fa-spinner fa-spin fa-2x"></i> ${t.locating_city}
            </div>
        </section>
    `;
   
    document.getElementById('back-to-dash-btn').onclick = backToDashboard;

    // تعبئة القائمة بالمدن الخاصة بدولة اللاعب
    populateMapCitiesDropdown(userCountry, userCity);

    // حدث تغيير المدينة
    document.getElementById('map-city-select').addEventListener('change', (e) => {
        loadCityMapData(e.target.value, userCountry);
    });

    // تحميل الخريطة لأول مرة على مدينة اللاعب
    currentMapFilter = 'maxWeight'; // إعادة الضبط الافتراضي
    loadCityMapData(userCity, userCountry);
}

// دالة جديدة لتغيير فلتر الخريطة
function changeMapFilter(filterType, btnElement) {
    // تفعيل ستايل الزر المضغوط
    const buttons = btnElement.parentElement.querySelectorAll('.perf-tab-btn');
    buttons.forEach(btn => btn.classList.remove('active-tab'));
    btnElement.classList.add('active-tab');

    // تغيير الفلتر وتحميل البيانات من جديد
    currentMapFilter = filterType;
    const city = document.getElementById('map-city-select').value;
    const currentUserData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    loadCityMapData(city, currentUserData.country || 'Jordan');
}


// دالة تعبئة المدن في قائمة الخريطة
async function populateMapCitiesDropdown(country, defaultCity) {
    const select = document.getElementById('map-city-select');
    
    // إذا بيانات الدول مش محملة، بنحملها
    if (globalCountriesData.length === 0) {
        try {
            const res = await fetch('https://countriesnow.space/api/v0.1/countries');
            const json = await res.json();
            globalCountriesData = json.data; 
        } catch (e) { console.error(e); return; }
    }

    const countryData = globalCountriesData.find(c => c.country === country);
    if (countryData && countryData.cities) {
        select.innerHTML = ''; // تفريغ
        countryData.cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city; 
            option.innerText = `📍 ${city}`;
            if (city === defaultCity) option.selected = true; // تحديد مدينة اللاعب كافتراضي
            select.appendChild(option);
        });
    }
}

// دالة تحميل الخريطة حسب المدينة المختارة
function loadCityMapData(city, country) {
    const t = translations[currentLang || 'ar']; // سحب الترجمة
    const infoContainer = document.getElementById('monster-info');
    infoContainer.innerHTML = `<i class="fa-solid fa-spinner fa-spin fa-2x"></i> ${t.moving_to} ${city}...`;
    
    setTimeout(async () => {
        if (window.monsterMap) { window.monsterMap.remove(); window.monsterMap = null; }
        
        let cityCoords = [31.9522, 35.9334]; 
        try {
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?city=${city}&country=${country}&format=json`);
            const geoData = await geoRes.json();
            if (geoData && geoData.length > 0) {
                cityCoords = [parseFloat(geoData[0].lat), parseFloat(geoData[0].lon)];
            }
        } catch(e) { console.error(e); }
        
        window.monsterMap = L.map('monster-map', { attributionControl: false }).setView(cityCoords, 12);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {}).addTo(window.monsterMap);

        fetchCityMonster(city, cityCoords);
    }, 300);
}



async function fetchCityMonster(city, coords) {
    const t = translations[currentLang || 'ar']; // سحب الترجمة
    const infoContainer = document.getElementById('monster-info');
    
    try {
        let orderByField = 'stats.maxWeight';
        if (currentMapFilter === 'streak') orderByField = 'streak';
        if (currentMapFilter === 'level') orderByField = 'xp';

        const snapshot = await db.collection('users')
            .where('city', '==', city)
            .orderBy(orderByField, 'desc')
            .limit(3)
            .get();

        if (snapshot.empty) {
            infoContainer.innerHTML = `<p style="color: var(--slate); font-weight: bold; font-size: 1.1rem;">${t.no_monster_yet}</p>`;
            return;
        }

        const topPlayers = [];
        snapshot.forEach(doc => topPlayers.push({ id: doc.id, ...doc.data() }));

        const pinOffsets = [[0, 0], [-0.015, -0.015], [-0.015, 0.015]];
        const coordsList = [];

        topPlayers.forEach((player, index) => {
            let displayValue = '';
            let displayLabel = '';
            let auraRadius = 1500;

            if (currentMapFilter === 'maxWeight') {
                let maxW = player.stats?.maxWeight || 0;
                let bestMuscle = t.general_muscle;
                if (player.workouts && Array.isArray(player.workouts)) {
                    player.workouts.forEach(w => {
                        w.details.forEach(ex => {
                            let wgt = parseFloat(ex.weight);
                            if (!isNaN(wgt) && wgt === maxW) bestMuscle = w.type;
                        });
                    });
                }
                bestMuscle = getTranslatedType(bestMuscle);
                displayValue = `${maxW} kg`;
                displayLabel = `${t.max_weight_label} (${bestMuscle}):`;
                auraRadius = maxW * 12;

            } else if (currentMapFilter === 'streak') {
                let currentStreak = player.streak || 0;
                displayValue = `${currentStreak} ${currentLang === 'en' ? 'Days' : 'أيام'} 🔥`;
                displayLabel = t.continuous_streak;
                auraRadius = currentStreak * 50 > 1000 ? currentStreak * 50 : 1000;

            } else if (currentMapFilter === 'level') { 
                let currentLevel = player.rank || 1;
                displayValue = `${t.map_level} ${currentLevel}`;
                displayLabel = t.current_rank;
                auraRadius = currentLevel > 1 ? (currentLevel * 50) + 1000 : 1000;
            }

            const pinCoords = [coords[0] + pinOffsets[index][0], coords[1] + pinOffsets[index][1]];
            coordsList.push(pinCoords);

            if (index === 0) {
                L.circle(pinCoords, {
                    color: '#00f2a7', fillColor: '#00f2a7', fillOpacity: 0.15, radius: auraRadius
                }).addTo(window.monsterMap);
            }

            let crownTitle = index === 0 ? t.city_monster_crown : (index === 1 ? t.silver_guard_crown : t.bronze_guard_crown);
            let extraClass = index === 1 ? 'crown-silver' : (index === 2 ? 'crown-bronze' : '');
            
            let isWantedHTML = '';
            if (index === 0 && player.streak >= 3) {
                isWantedHTML = `<div class="wanted-label">${t.wanted_dead}</div>`;
            }

            const icon = L.divIcon({
                className: `neon-crown-marker ${extraClass}`,
                html: `
                    <div class="emblem-wrapper">
                        <div class="emblem-shield">
                            <i class="fa-solid fa-crown" style="${index > 0 ? 'font-size:20px;' : 'font-size:30px inter;'}"></i>
                        </div>
                        <div class="emblem-banner" style="${index > 0 ? 'font-size:9px; padding:2px 8px;' : 'font-size:11px; padding:3px 12px;'}">
                            ${crownTitle}
                        </div>
                        ${isWantedHTML}
                    </div>
                `,
                iconSize: index === 0 ? [70, 85] : [55, 65], 
                iconAnchor: index === 0 ? [35, 75] : [27, 60], 
                popupAnchor: [0, -60]
            });

            let gymNameHTML = player.gym ? `<p style="color:var(--slate); font-size:0.75rem; margin-top:2px;"><i class="fa-solid fa-dumbbell"></i> ${t.gym_label} ${player.gym}</p>` : '';
            
            let actionBtn = `<button class="monster-challenge-btn" onclick="openChat('${player.id}', '${player.firstName}', '${player.photoURL}')">${t.challenge_sword}</button>`;
            if (index === 0 && auth.currentUser && player.id === auth.currentUser.uid) {
                actionBtn = `<button class="monster-challenge-btn" style="background:#FFD700; color:black; margin-top:5px;" onclick="claimTribute()">${t.tribute_btn}</button>`;
            }

            const popupHTML = `
                <div>
                    <img src="${player.photoURL || 'https://i.ibb.co/9mPmHXkh/cropped-circle-image-2.png'}" class="monster-popup-img" style="${index===0 ? 'border-color:#FFD700;' : 'border-color:#C0C0C0;'}">
                    <p class="monster-popup-name">${player.firstName} ${player.lastName}</p>
                    ${gymNameHTML}
                    <p class="monster-popup-record" style="margin-top: 5px; margin-bottom: 10px;">
                        <span style="color: var(--slate); font-size: 0.8rem;">${displayLabel}</span><br>
                        <span style="color: ${index===0 ? '#FFD700' : '#C0C0C0'}; font-size: 1.1rem; font-weight: 900;">${displayValue}</span>
                    </p>
                    ${actionBtn}
                </div>
            `;

            L.marker(pinCoords, {icon: icon}).addTo(window.monsterMap).bindPopup(popupHTML);
        });

        if (topPlayers.length >= 2) {
            L.polyline([coordsList[0], coordsList[1]], {
                color: '#ff4d4d', weight: 4, dashArray: '10, 15', className: 'rivalry-line'
            }).addTo(window.monsterMap);
        }

        let bottomTextLabel = currentMapFilter === 'maxWeight' ? t.map_weights : (currentMapFilter === 'streak' ? t.map_streak : t.map_level);
        let bottomValue = currentMapFilter === 'maxWeight' ? `${topPlayers[0].stats?.maxWeight || 0} kg` : (currentMapFilter === 'streak' ? `${topPlayers[0].streak || 0} ${currentLang === 'en' ? 'Days' : 'أيام'}` : `${t.map_level} ${topPlayers[0].rank || 1}`);

        infoContainer.innerHTML = `
        <div style="background: rgba(0,0,0,0.5); display: inline-block; padding: 10px 20px; border-radius: 12px; border: 1px solid rgba(255,215,0,0.5); box-shadow: 0 0 15px rgba(255,215,0,0.2);">
            <p style="color: #FFD700; font-weight: 900; font-size: 1.1rem; margin: 0; display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap; direction: ${currentLang === 'ar' ? 'rtl' : 'ltr'};">
                <span>👑 ${t.champion_of} ${bottomTextLabel}:</span> 
                <span style="color: white; direction: ltr; unicode-bidi: embed;">${topPlayers[0].firstName}</span> 
                <span style="color: var(--primary-color);"> ❖ ${bottomValue} </span>
            </p>
        </div>`;

    } catch (error) {
        console.error("Error fetching monsters:", error);
        infoContainer.innerHTML = `<p style="color: #ff4d4d; font-weight:bold;">${t.monster_error}</p>`;
    }
}


function claimTribute() {
    const lastClaim = localStorage.getItem('lastTributeClaim');
    const today = new Date().toDateString();
    
    if (lastClaim === today) {
        showToast("الضريبة محصلة اليوم 👑"); // رسالة قصيرة جداً
        return;
    }
    
    localStorage.setItem('lastTributeClaim', today);
    addXP(50); 
    showToast("💰 تم تحصيل +50 XP ضريبة الملك!"); // رسالة قصيرة جداً


updateQuestProgress('tribute', 1); // ربط مهمة الضريبة


}



// ==========================================
// 👑 لوحة الإدارة: مراجعة واعتماد الفيديوهات
// ==========================================



function showMonsterRules() {
    const t = currentLang === 'ar' ? {
        title: "كيف تسيطر على المدينة؟ 👑",
        steps: [
            "💪 **اكسر الرقم:** لازم تسجل أعلى وزن (Max Weight) في مدينتك في أي تمرين.",
            "🎥 **أثبت وحشنتك:** الأوزان العالية بتحتاج فيديو إثبات عشان الإدارة تعتمدك.",
            "📢 **سقوط العرش:** أول ما تكسر رقم الملك الحالي، رح نبعث إنذار لكل لاعبين المدينة إنك دعست عالعرش!",
            "☠️ **مطلوب للعدالة:** إذا حافظت على ستريك 3 أيام وأنت الملك، رح تصير 'مطلوب'، والكل رح يحاول يكسر رقمك!",
            "💰 **ضريبة الملك:** كملك للمدينة، إلك مكافأة XP يومية بتقدر تحصلها من الخريطة."
        ]
    } : {
        title: "How to Rule the City? 👑",
        steps: [
            "💪 **Break the Record:** You must log the highest Max Weight in your city.",
            "🎥 **Prove It:** Heavy lifts require video proof for admin approval.",
            "📢 **Throne Fall:** Once you beat the current King, we'll alert everyone in the city!",
            "☠️ **Wanted Status:** Stay King for 3 days to become 'Wanted'—everyone will target you!",
            "💰 **King's Tribute:** Collect a daily XP bonus from the map as long as you hold the throne."
        ]
    };

    const rulesHtml = t.steps.map(step => `<li style="margin-bottom:10px; text-align:right;">${step}</li>`).join('');

    // عرض الشرح في نافذة Toast فخمة أو Alert
    const modal = document.createElement('div');
    modal.className = 'modal-overlay active';
    modal.style.zIndex = '30000';
    modal.innerHTML = `
        <div class="modal-content" style="max-width:400px; padding:25px;">
            <h2 style="color:#FFD700; margin-bottom:20px; text-align:center;">${t.title}</h2>
            <ul style="color:white; list-style:none; padding:0; font-size:0.9rem;">${rulesHtml}</ul>


<button class="btn-primary" onclick="this.parentElement.parentElement.remove()" style="width:100%; margin-top:20px;">${t.got_it_btn || (currentLang === 'en' ? "Got it, I'm ready! ⚔️" : "فهمت، أنا جاهز! ⚔️")}</button>

        </div>
    `;
    document.body.appendChild(modal);
}



Object.assign(translations.ar, {
    live_workout_btn: "تمرين لايف", live_focus_title: "تمرين لايف ",
    log_set: "تسجيل الجولة", finish_live: "إنهاء التمرين",
    rest_time: "وقت الراحة", skip_rest: "تخطي الراحة ",
    beast_alert: " دمار! وزنك كسر الرقم القياسي. كمل تمرينك وركز، رح نطلب الإثبات بس تخلص!",
    proof_required_notif: " سجلت وزن أسطوري اليوم! ارفع فيديو الإثبات الآن لاستلام العرش.",
    upload_now: "رفع الفيديو "
});
Object.assign(translations.en, {
    live_workout_btn: "Live Workout", live_focus_title: "Live Workout ",
    log_set: "Log Set", finish_live: "Finish Workout",
    rest_time: "Rest Time", skip_rest: "Skip Rest ",
    beast_alert: " BEAST! You broke the record. Keep focusing, we'll ask for proof later!",
    proof_required_notif: " You logged a legendary weight today! Upload proof now to claim the throne.",
    upload_now: "Upload Video 🎥"
});

let liveWorkoutActive = false;
let liveDurationTimer;
let liveSeconds = 0;
let restInterval;
let liveExercises = [];
let pendingProofData = null; 


function confirmExitLive() {
    if(confirm(currentLang === 'en' ? "Cancel live workout?" : "إلغاء التمرين اللايف؟")) {
        closeLiveWorkout();
    }
}

function startLiveWorkout() {
    liveWorkoutActive = true; liveSeconds = 0; liveExercises = []; pendingProofData = null;
    document.getElementById('live-sets-log').innerHTML = '';
    
    // 1. تفعيل واجهة وضع الوحش بالتدريج
    const overlay = document.getElementById('live-workout-overlay');
    overlay.style.display = 'flex';
    setTimeout(() => overlay.classList.add('active'), 10); 
    
    // ✨ السحر هون: جلب النقط المتحركة (الكانفاس) ووضعها فوق شاشة التمرين
    const canvas = document.getElementById('stardust-canvas');
    if (canvas) {
        canvas.style.zIndex = '30001'; // رفعها فوق الشاشة
        canvas.style.pointerEvents = 'none'; // عشان ما تمنعك من الكبس على الأزرار
    }
    
    // 2. تصفير العداد وتشغيله
    document.getElementById('live-timer').innerText = `00:00`;
    clearInterval(liveDurationTimer);
    liveDurationTimer = setInterval(() => {
        liveSeconds++;
        const m = String(Math.floor(liveSeconds / 60)).padStart(2, '0');
        const s = String(liveSeconds % 60).padStart(2, '0');
        document.getElementById('live-timer').innerText = `${m}:${s}`;
    }, 1000);
}

function closeLiveWorkout() {
    liveWorkoutActive = false;
    clearInterval(liveDurationTimer); clearInterval(restInterval);
    const overlay = document.getElementById('live-workout-overlay');
    overlay.classList.remove('active');
    
    setTimeout(() => { 
        overlay.style.display = 'none'; 
        
        // ✨ إرجاع النقط المتحركة للخلفية الرئيسية
        const canvas = document.getElementById('stardust-canvas');
        if (canvas) canvas.style.zIndex = '-1';
        
    }, 500); 
    
    document.getElementById('rest-timer-overlay').classList.remove('active');
}



function logLiveSet() {
    // ... (نفس الكود القديم لجلب القيم وفحص الأخطاء)
    const exName = document.getElementById('live-ex-name').value.trim();
    const weight = parseFloat(document.getElementById('live-ex-weight').value) || 0;
    const reps = parseInt(document.getElementById('live-ex-reps').value) || 0;
    if (!exName || weight <= 0 || reps <= 0) {
        showToast(currentLang === 'en' ? "Please enter valid details" : "يرجى إدخال بيانات صحيحة");
        return;
    }

    // حفظ الجولة وعرضها (الكود القديم)
    liveExercises.push({ name: exName, weight: weight, reps: reps });
    document.getElementById('live-sets-log').insertAdjacentHTML('afterbegin', `
        <div class="live-set-row">
            <span>${exName}</span>
            <span style="color: var(--primary-color);">${weight}kg x ${reps}</span>
        </div>
    `);

    // ... (نفس الكود القديم لفحص الأوزان والـ Toast)
    let threshold = 100; 
    if (exName.includes("ديدليفت") || exName.toLowerCase().includes("deadlift")) threshold = 120;
    if (exName.includes("سكوات") || exName.toLowerCase().includes("squat")) threshold = 140;
    if (exName.includes("صدر") || exName.includes("بنش") || exName.toLowerCase().includes("bench")) threshold = 100;
    if (weight >= threshold && !pendingProofData) {
        pendingProofData = { name: exName, weight: weight, reps: reps };
        showToast(translations[currentLang].beast_alert); 
    }

    // 3. تفعيل عداد الراحة الدرامي (Fade In)
    document.getElementById('live-ex-reps').value = '';
    const restOverlay = document.getElementById('rest-timer-overlay');
    restOverlay.style.display = 'flex';
    setTimeout(() => restOverlay.classList.add('active'), 10);
    startRestTimer(90);
}

// تعديل بسيط لدالة closeLiveWorkout لتتلاءم مع الـ Fade Out



function startRestTimer(seconds) {
    let timeLeft = seconds;
    const restOverlay = document.getElementById('rest-timer-overlay');
    const restText = document.getElementById('rest-countdown');
    
    restOverlay.style.display = 'flex';
    restText.innerText = timeLeft;

    clearInterval(restInterval);
    restInterval = setInterval(() => {
        timeLeft--;
        restText.innerText = timeLeft;
        if (timeLeft <= 0) {
            skipRest();
            if('vibrate' in navigator) navigator.vibrate(500);
        }
    }, 1000);
}


// تعديل بسيط لدالة skipRest لتتلاءم مع الـ Fade Out
function skipRest() {
    clearInterval(restInterval);
    const restOverlay = document.getElementById('rest-timer-overlay');
    restOverlay.classList.remove('active');
    setTimeout(() => restOverlay.style.display = 'none', 500); // إخفاء بعد انتهاء الـ Fade Out
}



// دالة أنيميشن الأرقام لعداد حجم التمرين
function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        obj.innerHTML = Math.floor(progress * (end - start) + start);
        if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
}

// دالة إنهاء التمرين اللايف (تشمل الملخص ونظام المكافآت الذكي)
async function finishLiveWorkout() {
    if (liveExercises.length === 0) { closeLiveWorkout(); return; }
    
    // 1. حساب إحصائيات التمرين للملخص
    const totalSets = liveExercises.length;
    const totalVolume = liveExercises.reduce((sum, ex) => sum + (ex.weight * ex.reps), 0);

let liveReps = 0;
liveExercises.forEach(ex => liveReps += parseInt(ex.reps) || 0);
updateQuestProgress('volume', totalVolume);
updateQuestProgress('reps', liveReps);
updateQuestProgress('workout_days', 1);

    const m = String(Math.floor(liveSeconds / 60)).padStart(2, '0');
    const s = String(liveSeconds % 60).padStart(2, '0');
    const finalTime = `${m}:${s}`;

    // 2. تحديث السجل المحلي
    let workoutHistory = JSON.parse(localStorage.getItem('userWorkouts')) || [];
    let dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    workoutHistory.unshift({ date: dateStr, type: "تمرين لايف", details: liveExercises });
    localStorage.setItem('userWorkouts', JSON.stringify(workoutHistory));
    
    const user = auth.currentUser;
    let xpMessage = "";
    let xpGained = false;

    if (user) {
        let savedData = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const todayStr = new Date().toDateString();
        const lastXpDate = savedData.lastWorkoutXpDate || "";

        // 🛡️ فحص هل أخذ المكافأة اليوم أو لأ
        if (lastXpDate === todayStr) {
            // أخذها اليوم.. نحسب الوقت المتبقي لمنتصف الليل
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setHours(24, 0, 0, 0); 
            const timeLeftMs = tomorrow - now;
            const hours = Math.floor(timeLeftMs / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));
            
            xpMessage = currentLang === 'en' ? `XP resets in ${hours}h ${minutes}m` : `تتجدد المكافأة بعد ${hours}س و${minutes}د`;
            await db.collection('users').doc(user.uid).update({ workouts: workoutHistory });
        } else {
            // أول تمرين اليوم، مبروك الـ 50 XP
            savedData.lastWorkoutXpDate = todayStr;
            localStorage.setItem('currentUser', JSON.stringify(savedData));
            
            await db.collection('users').doc(user.uid).update({ 
                workouts: workoutHistory,
                lastWorkoutXpDate: todayStr 
            });
            
            if (typeof addXP === "function") addXP(50);
            xpGained = true;
            xpMessage = "+50 XP";
        }

        // إرسال إشعار المطالبة بالعرش إذا كسر الرقم
        if (pendingProofData) {
            await db.collection('users').doc(user.uid).collection('notifications').add({
                type: 'pending_proof',
                text: translations[currentLang].proof_required_notif,
                exerciseData: pendingProofData, 
                status: 'pending',
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        }
    }

    // 3. إيقاف العدادات وإخفاء شاشة التمرين الحالية
    clearInterval(liveDurationTimer); 
    clearInterval(restInterval);
    const overlay = document.getElementById('live-workout-overlay');
    overlay.classList.remove('active');
    setTimeout(() => overlay.style.display = 'none', 500);
    document.getElementById('rest-timer-overlay').classList.remove('active');

    // 4. عرض شاشة الملخص الفخمة
    const summaryOverlay = document.getElementById('live-summary-overlay');
    if (summaryOverlay) {
        document.getElementById('sum-time').innerText = finalTime;
        document.getElementById('sum-sets').innerText = totalSets;
        document.getElementById('sum-volume').innerText = "0"; 
        
        // تعديل ستايل الـ XP بالملخص (إذا أخذ نقاط بتضوي، إذا لأ بتكون رمادية)
        const xpRewardBox = document.querySelector('.xp-reward-box');
        if (xpRewardBox) {
            xpRewardBox.innerText = xpMessage;
            xpRewardBox.style.fontSize = xpGained ? '2.5rem' : '1.1rem';
            xpRewardBox.style.color = xpGained ? 'var(--primary-color)' : 'var(--slate)';
            xpRewardBox.style.textShadow = xpGained ? '0 0 20px rgba(0, 242, 167, 0.6)' : 'none';
            xpRewardBox.style.animation = xpGained ? 'pulseXP 1.5s infinite alternate' : 'none';
        }

        summaryOverlay.style.display = 'flex';
        setTimeout(() => {
            summaryOverlay.classList.add('active');
            animateValue(document.getElementById('sum-volume'), 0, totalVolume, 1500);
        }, 50);
    } else {
        // احتياط في حال نسيت تضيف كود الـ HTML تبع الملخص
        showToast(currentLang === 'en' ? `Workout Saved! ${xpMessage}` : `تم حفظ التمرين! ${xpMessage}`);
        closeLiveSummary();
    }
}

// دالة إغلاق الملخص والعودة للداشبورد بشكل أنيق
function closeLiveSummary() {
    liveWorkoutActive = false;
    pendingProofData = null;
    
    const summaryOverlay = document.getElementById('live-summary-overlay');
    if (summaryOverlay) {
        summaryOverlay.classList.remove('active');
        setTimeout(() => { 
            summaryOverlay.style.display = 'none'; 
            resetLiveUI();
        }, 500); 
    } else {
        resetLiveUI();
    }
}

function resetLiveUI() {
    const canvas = document.getElementById('stardust-canvas');
    if (canvas) canvas.style.zIndex = '-1'; // إرجاع النجوم للخلف
    if(document.getElementById('log-container')) renderWorkoutLog(); // تحديث الأرشيف
}


// ==========================================
// 👁️ السحر: نظام إخفاء وإظهار زر اللايف تلقائياً
// ==========================================
// ==========================================
// 👁️ السحر: نظام الإخفاء والإظهار الذكي (للشريط السفلي والزر العائم)
// ==========================================
(function initVisibilityEngine() {
    // 1. الصفحات الفرعية اللي لازم يختفي فيها الشريط السفلي بالكامل (عشان الشاشة توسع)
    const hideBottomNavTriggers = [
        'openCityMonster', 'openAchievements', 'openAdminPanel', 
        'showLeaderboard', 'openWorkoutModal', 'openGameSelection', 
        'openGame', 'openSquatGame'
    ];

    // 2. الصفحات اللي بتخفي زر اللايف القديم (كل الصفحات ما عدا الرئيسية)
    const hideFabTriggers = [
        'openProfile', 'openPerformanceCenter', 'openFriendsCenter', 
        ...hideBottomNavTriggers
    ];

    // تطبيق الإخفاء عند فتح الصفحات
    hideFabTriggers.forEach(funcName => {
        if(typeof window[funcName] === 'function') {
            const originalFunc = window[funcName];
            window[funcName] = function(...args) {
                // إخفاء الزر العائم القديم
                const fab = document.querySelector('.live-workout-fab');
                if(fab) fab.style.display = 'none'; 
                
                // إخفاء الشريط السفلي فقط لو كانت صفحة فرعية
                if (hideBottomNavTriggers.includes(funcName)) {
                    const bottomNav = document.querySelector('.bottom-nav');
                    if(bottomNav) bottomNav.style.display = 'none';
                }

                return originalFunc.apply(this, args);
            };
        }
    });



    const showTriggers = [
        'backToDashboard', 'closeWorkoutModal', 'closeGameSelection', 
        'closeGame', 'closeSquatGame', 'finishGame', 'finishSquatGame'
    ];


    showTriggers.forEach(funcName => {
        if(typeof window[funcName] === 'function') {
            const originalFunc = window[funcName];
            window[funcName] = function(...args) {
                const result = originalFunc.apply(this, args);
                
                const mainContent = document.getElementById('main-content-area');
                const bottomNav = document.querySelector('.bottom-nav');
                const fab = document.querySelector('.live-workout-fab');

                // لو رجعنا للرئيسية (الداشبورد الأصلي)
                if(mainContent && !mainContent.dataset.originalContent) {
                    if(fab) fab.style.display = 'flex';
                    if(bottomNav) bottomNav.style.display = 'flex';
                } else {
                    // لو كنا لسه بصفحة رئيسية زي (البروفايل) وسكرنا مجرد نافذة منبثقة
                    if(bottomNav) bottomNav.style.display = 'flex';
                }
                
                return result;
            };
        }
    });
})();



// 🛡️ كود الحماية الذكي لمنع الكبس المزدوج (النسخة المعدلة) 🛡️
document.addEventListener('click', function(e) {
    const btn = e.target.closest('button'); 
    
    if (btn) {
        // 1. استثناء أزرار التنقل والقوائم (الوحش، الجوائز، الإشعارات وغيرها) عشان تفتح فوراً بدون تعليق
        const action = btn.getAttribute('onclick') || '';
        const btnClass = btn.className || '';
        
        if (action.includes('open') || action.includes('close') || 
            action.includes('toggle') || action.includes('show') || 
            action.includes('switch') || action.includes('back') ||
            btnClass.includes('nav-item') || btnClass.includes('notif-btn')) {
            return; // تجاهل القفل وخليها تشتغل بحريتها
        }

        // 2. إذا الزر مقفول حالياً (انكبس قبل أجزاء من الثانية)، امنع الكبسة الإضافية
        if (btn.hasAttribute('data-locked')) {
            e.stopPropagation(); 
            e.preventDefault();
            return;
        }
        
        // 3. قفل أزرار الحفظ والإرسال فقط (لمدة ثانية وحدة)
        btn.setAttribute('data-locked', 'true');
        btn.style.pointerEvents = 'none'; // تعطيل الكبس برمجياً
        
        // فتح الزر بعد ثانية
        setTimeout(() => {
            btn.removeAttribute('data-locked');
            btn.style.pointerEvents = 'auto'; // إرجاع الزر لطبيعته
        }, 1000);
    }
}, true);



// دالة تغيير اللغة من داخل البروفايل
// ==========================================
// 🌍 دوال قائمة اللغة في البروفايل
// ==========================================
window.toggleProfileLangMenu = function(event) {
    event.stopPropagation();
    const dropdown = document.getElementById('profile-lang-dropdown');
    const icon = document.getElementById('profile-lang-icon');
    if (dropdown) {
        const isShowing = dropdown.style.display === 'block';
        dropdown.style.display = isShowing ? 'none' : 'block';
        if(icon) icon.style.transform = isShowing ? 'rotate(0deg)' : 'rotate(180deg)';
    }
};

window.changeLanguageFromProfile = function(lang) {
    if(currentLang === lang) return; // منع التحديث إذا اختار نفس اللغة
    selectLanguage(lang);
    openProfile(); // تحديث الصفحة فوراً
};

// إغلاق قائمة اللغة عند النقر في أي مكان خارجها
document.addEventListener('click', function() {
    const dropdown = document.getElementById('profile-lang-dropdown');
    const icon = document.getElementById('profile-lang-icon');
    if (dropdown && dropdown.style.display === 'block') {
        dropdown.style.display = 'none';
        if(icon) icon.style.transform = 'rotate(0deg)';
    }
});


// دالة تسجيل الخروج من البروفايل
// دالة تسجيل الخروج من البروفايل (الآمنة)
window.logoutFromProfile = async function() {
    const t = translations[currentLang || 'ar'];
    const confirmMsg = currentLang === 'en' ? "Are you sure you want to logout?" : "متأكد إنك بدك تسجل خروج يا وحش؟";
    
    if(confirm(confirmMsg)) {
        const user = auth.currentUser;
        if (user) {
            try {
                // 🔥 الخطوة السحرية: مسح التوكن من الحساب القديم حتى لا تصله إشعارات وهو مسجل خروج
                await db.collection('users').doc(user.uid).update({
                    fcmToken: firebase.firestore.FieldValue.delete()
                });
            } catch(e) { console.error("Error removing token", e); }
        }

        await auth.signOut();
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
};

// ==========================================
// 🔄 دالة التنقل في مجتمع الأبطال
// ==========================================
window.switchFriendsTab = function(tab) {
    // 1. إخفاء كل التبويبات وإزالة اللون من كل الأزرار
    document.querySelectorAll('.perf-tab-btn').forEach(btn => btn.classList.remove('active-tab'));
    document.querySelectorAll('.perf-tab-content').forEach(content => content.style.display = 'none');
    
    // 2. تفعيل التبويب المطلوب والمحتوى تبعه
    const activeBtn = document.getElementById(`tab-btn-${tab}`);
    const activeTab = document.getElementById(`friends-tab-${tab}`);
    
    if (activeBtn) activeBtn.classList.add('active-tab');
    if (activeTab) activeTab.style.display = 'block';
};




const profileCovers = [
    // أول 5 صور بسعر 1000
    { id: 'cv1', price: 1000, url: 'Photos/dms.png', name_ar: 'تنفس النار', name_en: 'Fire Breathing' }, // صورة ديمون سلاير
    { id: 'cv2', price: 1000, url: 'Photos/g2.png', name_ar: 'المحرك الثاني', name_en: 'Gear Second' }, // صورة لوفي جير سكند
    { id: 'cv3', price: 1000, url: 'Photos/zoro.png', name_ar: 'نصل زورو', name_en: 'Zoro Blade' }, // صورة زورو
    { id: 'cv4', price: 1000, url: 'Photos/solo.png', name_ar: 'حاكم الظلال', name_en: 'Shadow Monarch' }, // صورة سولو ليفلنج
    { id: 'cv5', price: 1000, url: 'Photos/gymsm.png', name_ar: 'وحش الجيم', name_en: 'Gym Beast' }, // صورة الجيم
    
    // الباقي بتزيد أسعارهم تدريجياً
    { id: 'cv6', price: 1200, url: 'Photos/ls.png', name_ar: 'السيف السحري', name_en: 'Magic Sword' }, // صورة السيف المشع
    { id: 'cv7', price: 1500, url: 'Photos/lufs.png', name_ar: 'سفينة القراصنة', name_en: 'Pirate Ship' }, // صورة السفينة
    { id: 'cv8', price: 2000, url: 'Photos/sd.png', name_ar: 'عالم الظلال', name_en: 'Shadow World' }, // صورة الظلام والممر
    { id: 'cv9', price: 3000, url: 'Photos/shoot.png', name_ar: 'الطلقة السحرية', name_en: 'Magic Shot' }, // صورة القناص
    { id: 'cv10', price: 5000, url: 'Photos/fg.png', name_ar: 'الدرع السحري', name_en: 'Magic Shield' }, // صورة الساحر مع الدرع الدائري
    { id: 'cv11', price: 8000, url: 'Photos/time.png', name_ar: 'سيد الوقت', name_en: 'Time Master' }, // صورة الساعة المتوهجة
    { id: 'cv12', price: 15000, url: 'Photos/fghtm.png', name_ar: 'صدام الأساطير', name_en: 'Clash of Legends' }, // صورة القتال والتصادم
    
    // الأغلى والمتحركة
    { id: 'cv13', price: 30000, url: 'Photos/k1.gif', name_ar: 'عرش الإمبراطور', name_en: 'Emperor Throne' } // الملك على العرش
];



window.openStore = function() {
    if(window.innerWidth < 768) document.getElementById('sidebar').classList.add('collapsed');
    const mainContent = document.getElementById('main-content-area');
    if (!mainContent) return;

    if (!mainContent.dataset.originalContent) {
        mainContent.dataset.originalContent = mainContent.innerHTML;
    }

    const t = translations[currentLang || 'ar'];
    const currentUserData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const userXP = currentUserData.xp || 0;
    const ownedCovers = currentUserData.purchasedCovers || [];
    const activeCover = currentUserData.currentCover || '';

    let coversHTML = profileCovers.map(cover => {
        const isOwned = ownedCovers.includes(cover.id);
        const isEquipped = activeCover === cover.url;
        const name = currentLang === 'en' ? cover.name_en : cover.name_ar;

        let btnHTML = '';
        if (isEquipped) {
            btnHTML = `<button class="btn-primary" style="width: 100%; padding: 8px; background: #4CAF50; color: white; border-color: #4CAF50;" disabled>${currentLang === 'en' ? 'Equipped' : 'مُستخدم'}</button>`;
        } else if (isOwned) {
            btnHTML = `<button class="btn-primary" style="width: 100%; padding: 8px; background: var(--primary-color); color: var(--secondary-color);" onclick="equipCover('${cover.url}')">${currentLang === 'en' ? 'Equip' : 'استخدام'}</button>`;
        } else {
            const canAfford = userXP >= cover.price;
            const btnStyle = canAfford ? 'color: #FFD700; border-color: #FFD700; background: rgba(255, 215, 0, 0.1);' : 'color: var(--slate); border-color: var(--slate); background: rgba(255, 255, 255, 0.05); cursor: not-allowed;';
            btnHTML = `<button class="btn-primary" style="width: 100%; padding: 8px; ${btnStyle}" ${canAfford ? `onclick="buyCover('${cover.id}', ${cover.price}, '${cover.url}')"` : ''}>
                ${cover.price.toLocaleString()} XP <i class="fa-solid fa-gem" style="font-size: 0.8rem;"></i>
            </button>`;
        }

        return `
            <div class="store-card">
                <div class="cover-img-wrapper">
                    <img src="${cover.url}">
                    ${isOwned ? `<div class="owned-badge"><i class="fa-solid fa-check"></i></div>` : ''}
                </div>
                <div class="store-card-info">
                    <h4 style="color: white; font-weight: bold; font-size: 0.95rem; margin-bottom: 10px;">${name}</h4>
                    ${btnHTML}
                </div>
            </div>
        `;
    }).join('');

    mainContent.innerHTML = `
        <header class="top-bar" style="margin-bottom: 20px;">
            <div class="header-row">
                <button id="back-to-dash-btn" class="btn-primary" style="padding: 5px 15px; font-size: 0.9rem;">${t.back}</button>
<h1 style="margin: 0 15px; font-weight: 900; color: #FFD700; display: flex; align-items: center; gap: 8px;">${currentLang === 'en' ? 'Cover Store' : 'متجر الأغلفة'} <i class="fa-solid fa-store"></i></h1>

            </div>
            <div style="background: rgba(255, 215, 0, 0.1); padding: 10px 20px; border-radius: 12px; border: 1px solid #FFD700; display: inline-block; margin-top: 15px;">
                <span style="color: #FFD700; font-weight: 900; font-size: 1.2rem;">${userXP.toLocaleString()} XP</span> <i class="fa-solid fa-gem" style="color: #FFD700; margin-right: 5px;"></i>
                <p style="color: var(--slate); font-size: 0.75rem; margin: 5px 0 0 0;">${currentLang === 'en' ? 'Warning: Buying covers deducts your XP!' : 'ملاحظة: شراء الأغلفة يخصم من نقاطك الحالية!'}</p>
            </div>
        </header>
        <section class="performance-container" style="animation: fadeIn 0.5s;">
            <div class="store-grid">
                ${coversHTML}
            </div>
        </section>
    `;
    document.getElementById('back-to-dash-btn').onclick = backToDashboard;
};

window.buyCover = async function(coverId, price, url) {
    const user = auth.currentUser;
    if (!user) return;
    
    let data = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (data.xp < price) {
        showToast(currentLang === 'en' ? "Not enough XP!" : "نقاطك ما بتكفي يا وحش!");
        return;
    }



    const confirmMsg = currentLang === 'en' ? `Buy this cover for ${price} XP?` : `متأكد بدك تشتري الغلاف بقيمة ${price} XP؟ رح يقل مستواك!`;
    if(!confirm(confirmMsg)) return;

    data.xp -= price;
    data.rank = Math.floor(data.xp / 500) + 1; // إعادة حساب المستوى بناءً على النقاط المتبقية
    if (!data.purchasedCovers) data.purchasedCovers = [];
    data.purchasedCovers.push(coverId);
    data.currentCover = url; 

    localStorage.setItem('currentUser', JSON.stringify(data));
    
    try {
        await db.collection('users').doc(user.uid).update({
            xp: firebase.firestore.FieldValue.increment(-price),
            purchasedCovers: firebase.firestore.FieldValue.arrayUnion(coverId),
            currentCover: url,
            rank: data.rank // رفع الرتبة الجديدة
        });
        showToast(currentLang === 'en' ? "Cover purchased and equipped! " : "تم الشراء والاستخدام بنجاح! فخامة ");
        openStore(); 
    } catch(e) {
        showToast("خطأ في الاتصال بالخادم!");
    }
};

window.equipCover = async function(url) {
    const user = auth.currentUser;
    if (!user) return;
    let data = JSON.parse(localStorage.getItem('currentUser') || '{}');
    data.currentCover = url;
    localStorage.setItem('currentUser', JSON.stringify(data));
    
    try {
        await db.collection('users').doc(user.uid).update({ currentCover: url });
        showToast(currentLang === 'en' ? "Cover equipped!" : "تم تعيين الغلاف ");
        openStore();
    } catch(e) { console.error(e); }
};

// دالة التحميل المسبق للصور الثقيلة
function preloadHeavyCovers() {
    const heavyImages = ['Photos/k1.gif']; // بنقدر نضيف أي صورة ثقيلة هون
    heavyImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// ==========================================
// 🛠️ نظام المساعدة والتواصل (FAQ & Contact)
// ==========================================

// ==========================================
// 🛠️ بنك الأسئلة الشائعة (FAQ) - 40 سؤال
// ==========================================
const appFAQs = [
    // --- قسم النظام والـ XP ---
    { q_ar: "كيف أجمع نقاط الخبرة (XP) وأرفع مستواي؟", a_ar: "تحصل على 50 XP يومياً عند إكمال تمرينك، وتجمع نقاطاً إضافية عبر تحصيل 'ضريبة الملك' أو لعب التحديات.", q_en: "How do I earn XP and level up?", a_en: "You earn 50 XP daily for completing a workout. You can also claim the 'King's Tribute' or play challenges." },
    { q_ar: "ما هي ضريبة الملك؟", a_ar: "إذا كنت مسيطراً على مدينتك كـ 'وحش المدينة'، يمكنك المطالبة بضريبة يومية (XP مجاني) من لوحة القيادة.", q_en: "What is the King's Tribute?", a_en: "If you rule your city as the 'City Monster', you can claim a daily tribute (free XP) from your dashboard." },
    { q_ar: "هل يمكنني خسارة نقاط XP؟", a_ar: "لا، نقاط الـ XP المتراكمة لا تنقص، ولكن تصنيفك قد يتراجع إذا تفوق عليك لاعبون آخرون.", q_en: "Can I lose XP points?", a_en: "No, accumulated XP doesn't decrease, but your rank might drop if others surpass you." },
    { q_ar: "كيف أحصل على الأوسمة (Badges)؟", a_ar: "الأوسمة تُفتح تلقائياً عند تحقيق أهداف معينة، مثل تسجيل 50 تمريناً، أو تحقيق رقم قياسي جديد.", q_en: "How do I unlock Badges?", a_en: "Badges unlock automatically upon reaching milestones, like logging 50 workouts or hitting a PR." },
    
    // --- قسم وحش المدينة والخريطة ---
    { q_ar: "كيف أسيطر على مدينتي (وحش المدينة)؟", a_ar: "يجب أن تسجل أعلى وزن (Max Weight) في أي تمرين ضمن مدينتك. النظام سيطلب منك إثبات فيديو لمراجعته.", q_en: "How do I become the City Monster?", a_en: "Log the heaviest Max Weight for any exercise in your city. The system will prompt you for video proof." },
    { q_ar: "ماذا يحدث إذا رفضت الإدارة الفيديو الخاص بي؟", a_ar: "سيصلك إشعار بالرفض ولن يتم احتساب وزنك القياسي في لوحة الصدارة. يجب أن يكون الفيديو واضحاً.", q_en: "What happens if Admin rejects my video?", a_en: "You'll receive a notification, and your record won't count on the leaderboard. Ensure clear video proof." },
    { q_ar: "كيف أغير مدينتي على الخريطة؟", a_ar: "تواصل مع الإدارة عبر نموذج 'تواصل معنا' لطلب تغيير مدينتك الحالية إذا انتقلت لسكن جديد.", q_en: "How do I change my city on the map?", a_en: "Contact support via the 'Contact Us' form to request a city change if you moved." },
    { q_ar: "هل يمكنني السيطرة على أكثر من مدينة؟", a_ar: "حالياً، يمكنك المنافسة والسيطرة فقط في المدينة المسجلة في حسابك.", q_en: "Can I rule more than one city?", a_en: "Currently, you can only compete and rule in the city registered to your account." },

    // --- قسم التمرين ورادار العضلات ---
    { q_ar: "كيف يعمل رادار التوازن العضلي؟", a_ar: "يقرأ الرادار أعلى أوزانك في التمارين الخمسة الكبرى. إذا كان الشكل مشوهاً، فهذا يعني أن لديك عضلة ضعيفة.", q_en: "How does the Muscle Radar work?", a_en: "It plots your PRs for the Big 5 lifts. If skewed, you have a weak point to focus on." },
    { q_ar: "ما هو مؤشر الجاهزية العصبية (TSB)؟", a_ar: "نظام أولمبي يحسب لياقتك وإرهاقك. إذا كان باللون الأحمر، يجب أن ترتاح لضمان عدم الهدم العضلي.", q_en: "What is the CNS Readiness Index (TSB)?", a_en: "An Olympic system calculating fitness vs fatigue. If red, rest to avoid overtraining." },
    { q_ar: "كيف أسجل تمرين جديد؟", a_ar: "من الشاشة الرئيسية للوحة التحكم، اضغط على 'تمرين جديد'، اختر العضلة، وابدأ بإضافة التمارين والجولات.", q_en: "How do I log a new workout?", a_en: "From the dashboard, click 'New Workout', select the muscle group, and add exercises and sets." },
    { q_ar: "ما هي ميزة التمرين اللايف؟", a_ar: "تسمح لك بتسجيل الجولات داخل النادي بالوقت الفعلي مع مؤقت راحة ذكي بين كل جولة.", q_en: "What is the Live Workout feature?", a_en: "Allows you to log sets in real-time at the gym with a smart rest timer between sets." },
    { q_ar: "كيف أحسب الحد الأقصى لتكرار واحد (1RM)؟", a_ar: "التطبيق يحسبه لك تلقائياً بناءً على أعلى وزن وأكبر عدد تكرارات أدخلتها في سجل تمرينك.", q_en: "How do I calculate my 1RM?", a_en: "The app calculates it automatically based on your heaviest weight and highest reps logged." },
    { q_ar: "كيف أضيف تمرين غير موجود في القائمة؟", a_ar: "حالياً القائمة تضم التمارين المعتمدة عالمياً. يمكنك اقتراح تمارين جديدة عبر رسائل الدعم الفني.", q_en: "How to add an exercise not on the list?", a_en: "The list has global standard exercises. Suggest new ones via the contact form." },
    { q_ar: "هل يجب أن أتمرن كل يوم للتقدم؟", a_ar: "لا! العضلات تنمو أثناء الراحة. مؤشر الـ TSB سيخبرك متى يجب أن تأخذ يوم راحة.", q_en: "Do I have to workout everyday to progress?", a_en: "No! Muscles grow during rest. The TSB indicator will tell you when to take a rest day." },

    // --- قسم الألعاب المصغرة والمتجر ---
    { q_ar: "كيف ألعب تحدي الديدليفت؟", a_ar: "في قسم الألعاب، اضغط بشكل متكرر وسريع لرفع البار قبل انتهاء الوقت المخصص للفوز بالـ XP.", q_en: "How to play the Deadlift challenge?", a_en: "In the games section, tap repeatedly and fast to lift the bar before time runs out to win XP." },
    { q_ar: "لعبة السكوات تعتمد على ماذا؟", a_ar: "تعتمد على التوقيت! يجب إيقاف المؤشر في المنطقة الخضراء لضمان رفعة صحيحة وتجنب الإصابة الوهمية.", q_en: "What does the Squat game rely on?", a_en: "Timing! Stop the indicator in the green zone to ensure a perfect lift and avoid virtual injury." },
    { q_ar: "ما فائدة المتجر؟", a_ar: "يمكنك استخدام نقاط XP التي جمعتها لشراء أغلفة (Covers) فخمة لتزيين ملفك الشخصي وإبهار أصدقائك.", q_en: "What is the Store for?", a_en: "Use your hard-earned XP to buy premium Profile Covers to decorate your page and impress friends." },
    { q_ar: "هل الأغلفة تعطيني ميزات إضافية؟", a_ar: "الأغلفة هي مظهر جمالي فقط (Cosmetic) لتمييز اللاعبين المحترفين عن المبتدئين.", q_en: "Do covers give me extra stats?", a_en: "Covers are purely cosmetic to distinguish pro players from beginners." },

    // --- قسم المجتمع والأصدقاء ---
    { q_ar: "كيف أضيف أصدقاء؟", a_ar: "اذهب إلى 'مجتمع الأبطال'، وابحث عن صديقك باستخدام معرّف اللاعب (Player ID) الخاص به.", q_en: "How do I add friends?", a_en: "Go to the 'Heroes Community' and search for your friend using their Player ID." },
    { q_ar: "أين أجد الـ Player ID الخاص بي؟", a_ar: "موجود في صفحة البروفايل الخاص بك تحت اسمك مباشرة.", q_en: "Where is my Player ID?", a_en: "It is located on your Profile page right beneath your name." },
    { q_ar: "هل الرسائل في التطبيق آمنة؟", a_ar: "نعم، الدردشة الفورية مشفرة والرسائل تختفي تلقائياً بعد 24 ساعة لضمان الخصوصية.", q_en: "Are messages secure?", a_en: "Yes, direct chats are encrypted and auto-delete after 24 hours for privacy." },
    { q_ar: "كيف أحظر مستخدم مزعج؟", a_ar: "ادخل إلى محادثته، اضغط على أيقونة الإعدادات العلوية، واختر 'حظر المستخدم'.", q_en: "How to block an annoying user?", a_en: "Open their chat, click the top settings icon, and select 'Block User'." },
    { q_ar: "كيف أنشر إنجازي على المنصة؟", a_ar: "عند كسر رقم قياسي جديد (PR)، سيظهر لك زر 'مشاركة' لنشره مباشرة في لوحة المجتمع.", q_en: "How do I share my achievement?", a_en: "When you hit a new PR, a 'Share' button will appear to post it to the community board." },

    // --- الحساب والمشاكل التقنية ---
    { q_ar: "نسيت كلمة المرور، ماذا أفعل؟", a_ar: "من شاشة تسجيل الدخول، اضغط على 'نسيت كلمة المرور'، وأدخل بريدك ليصلك رابط إعادة التعيين.", q_en: "I forgot my password, what do I do?", a_en: "From login, click 'Forgot Password' and enter your email for a reset link." },
    { q_ar: "كيف أغير صورة حسابي والغلاف الشخصي؟", a_ar: "اضغط على أيقونة الكاميرا في البروفايل لتغيير الصورة. أما الغلاف، فيمكنك تغييره بعد شرائه من المتجر.", q_en: "How to change avatar and cover?", a_en: "Click the camera icon on your profile for the avatar. Covers are changed after buying from the store." },
    { q_ar: "التطبيق يعلق أو بطيء، ما الحل؟", a_ar: "تأكد من جودة اتصالك بالإنترنت. إذا استمرت المشكلة، قم بمسح ذاكرة التخزين المؤقت للمتصفح (Clear Cache).", q_en: "App is lagging, what is the solution?", a_en: "Check your internet connection. If it persists, clear your browser's cache." },
    { q_ar: "كيف أحذف حسابي نهائياً؟", a_ar: "لحذف الحساب وكل بياناتك، تواصل مع الإدارة عبر نموذج 'تواصل معنا' وسيم مسح كل شيء خلال 48 ساعة.", q_en: "How to delete my account permanently?", a_en: "Contact admin via the 'Contact Us' form. All data will be wiped within 48 hours." },
    { q_ar: "هل يمكنني تغيير اسم العرض الخاص بي؟", a_ar: "نعم، اذهب إلى إعدادات الحساب وقم بتعديل الاسم (يُسمح بتغييره مرة واحدة كل 30 يوم).", q_en: "Can I change my display name?", a_en: "Yes, go to account settings to edit it (allowed once every 30 days)." },
    { q_ar: "لماذا لم تصلني رسالة تفعيل الإيميل؟", a_ar: "تأكد من مجلد الرسائل المزعجة (Spam/Junk). إذا لم تجدها، اطلب إعادة إرسالها من صفحة تسجيل الدخول.", q_en: "Why didn't I get the verification email?", a_en: "Check your Spam/Junk folder. If not there, request a resend from the login page." }
];



window.openHelpModal = function() {
    document.getElementById('help-modal').classList.add('active');
    renderFAQs();
};

window.closeHelpModal = function() {
    document.getElementById('help-modal').classList.remove('active');
};

window.switchHelpTab = function(tab) {
    document.getElementById('faq-tab-btn').classList.remove('active');
    document.getElementById('contact-tab-btn').classList.remove('active');
    document.getElementById('faq-section').style.display = 'none';
    document.getElementById('contact-section').style.display = 'none';

    document.getElementById(`${tab}-tab-btn`).classList.add('active');
    document.getElementById(`${tab}-section`).style.display = 'block';
};

function renderFAQs() {
    const container = document.getElementById('faq-container');
    if(!container) return;
    
    // فحص اللغة لتحديد الاتجاه
    const isEn = currentLang === 'en';
    const alignObj = isEn ? { text: 'left', dir: 'ltr', arrow: 'margin-left' } : { text: 'right', dir: 'rtl', arrow: 'margin-right' };

    container.innerHTML = appFAQs.map((faq) => {
        const q = isEn ? faq.q_en : faq.q_ar;
        const a = isEn ? faq.a_en : faq.a_ar;
        
        return `
            <div class="accordion-item" style="border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 5px; background: rgba(0,0,0,0.2); direction: ${alignObj.dir}; text-align: ${alignObj.text};">
                <button class="accordion-header" onclick="this.parentElement.classList.toggle('active')" style="padding: 15px; font-size: 0.95rem; width: 100%; display: flex; justify-content: space-between; align-items: center; border: none; background: transparent; color: white; cursor: pointer;">
                    <span style="font-weight: bold; text-align: ${alignObj.text};">${q}</span>
                    <i class="fa-solid fa-chevron-down arrow" style="font-size: 0.8rem; ${alignObj.arrow}: 10px;"></i>
                </button>
                <div class="accordion-content" style="padding: 0 15px;">
                    <p style="padding-bottom: 15px; color: var(--slate); font-size: 0.85rem; line-height: 1.6; text-align: ${alignObj.text};">${a}</p>
                </div>
            </div>
        `;
    }).join('');
}
// 📩 إرسال نموذج التواصل إلى Firebase
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-us-form');
    if (contactForm) {
        contactForm.onsubmit = async (e) => {
            e.preventDefault();
            const btn = document.getElementById('contact-submit-btn');
            const email = document.getElementById('contact-email').value;
            const msg = document.getElementById('contact-message').value;
            
            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

            try {
                await db.collection('contact_messages').add({
                    email: email,
                    message: msg,
                    status: 'unread',
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
                
                showToast(currentLang === 'en' ? " Message sent to Admin!" : " تم إرسال رسالتك للإدارة بنجاح!");
                contactForm.reset();
                setTimeout(closeHelpModal, 1500);
            } catch (error) {
                console.error(error);
                showToast(currentLang === 'en' ? " Failed to send message." : " فشل إرسال الرسالة، تأكد من اتصالك.");
            } finally {
                btn.disabled = false;
                btn.innerHTML = currentLang === 'en' ? "Send Message" : "إرسال الرسالة";
            }
        };
    }
});


// ==========================================
// 📜 نظام الصفحات القانونية للشركات
// ==========================================
window.openLegalModal = function(policyType) {
    const t = translations[currentLang || 'ar'];
    const titleEl = document.getElementById('legal-modal-title');
    const bodyEl = document.getElementById('legal-modal-body');
    const modal = document.getElementById('legal-modal');

    // تحديد الاتجاه بناءً على اللغة لتنسيق النص بشكل احترافي
    bodyEl.style.direction = currentLang === 'ar' ? 'rtl' : 'ltr';
    bodyEl.style.textAlign = currentLang === 'ar' ? 'right' : 'left';

    if (policyType === 'privacy') {
        titleEl.innerText = t.legal_privacy_title;
        bodyEl.innerHTML = t.legal_privacy_body;
    } else if (policyType === 'terms') {
        titleEl.innerText = t.legal_terms_title;
        bodyEl.innerHTML = t.legal_terms_body;
    } else if (policyType === 'community') {
        titleEl.innerText = t.legal_community_title;
        bodyEl.innerHTML = t.legal_community_body;
    }

    modal.classList.add('active');
};

window.closeLegalModal = function() {
    document.getElementById('legal-modal').classList.remove('active');
};




// كود طلب الإشعارات وتحديث التوكن (النسخة المدمرة للأعطال)
async function requestNotificationPermission() {
    if (!messaging) return;
    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const registration = await navigator.serviceWorker.register('/sw.js');
            await navigator.serviceWorker.ready;
            
            // 1. جلب التوكن الجديد النظيف
            const currentToken = await messaging.getToken({ 
                vapidKey: 'BDskkDNXkSMGBNlDiNpCNGdAMnoBbglgvzsuBGEe6t4syoS-k97sJOKbIrPYK_vUDkL6tv8d34Bj_nPm-G_cTJM', 
                serviceWorkerRegistration: registration 
            });
            
            if (currentToken) {
                const user = auth.currentUser;
                if (user) {
                    const userRef = db.collection('users').doc(user.uid);
                    const userDoc = await userRef.get();
                    const savedToken = userDoc.data()?.fcmToken;
                    
                    // 2. إذا التوكن القديم مختلف عن الجديد، بنعمل "فورمات" للحقل!
                    if (!savedToken || savedToken !== currentToken) {
                        
                        // 🔥 الخطوة السحرية: مسح الحقل القديم بالكامل (كأنك مسحته بيدك)
                        await userRef.update({
                            fcmToken: firebase.firestore.FieldValue.delete()
                        });

                        // الانتظار نصف ثانية لضمان إتمام المسح من سيرفرات جوجل
                        await new Promise(resolve => setTimeout(resolve, 500));

                        // 🔥 الخطوة السحرية 2: إنشاء الحقل من جديد بالتوكن الصالح 100%
                        await userRef.set({
                            fcmToken: currentToken.trim() // trim لمنع أي مسافات مخفية
                        }, { merge: true });

                        console.log("تم مسح التوكن القديم وتوليد واحد جديد بنجاح!");
                        showToast("🔔 تم تفعيل نظام الإشعارات!");
                    }
                }
            }
        }
    } catch (error) {
        console.error('خطأ في تفعيل الإشعارات: ', error);
    }
}





const questBank = {
    daily: [
        { id: 'd_v1', type: 'volume', target: 1000, xp: 30, ar: 'تسخين العضلات', en: 'Warmup Set', desc_ar: 'ارفع إجمالي 1000 كجم اليوم', desc_en: 'Lift a total of 1,000 kg today' },
        { id: 'd_v2', type: 'volume', target: 1500, xp: 40, ar: 'بداية الضخ', en: 'First Pump', desc_ar: 'ارفع إجمالي 1500 كجم اليوم', desc_en: 'Lift a total of 1,500 kg today' },
        { id: 'd_v3', type: 'volume', target: 1750, xp: 60, ar: 'جهد ملحوظ', en: 'Solid Effort', desc_ar: 'ارفع إجمالي 1750 كجم اليوم', desc_en: 'Lift a total of 1,750 kg today' },
        { id: 'd_v4', type: 'volume', target: 2000, xp: 90, ar: 'وحش الأوزان', en: 'Weight Beast', desc_ar: 'ارفع إجمالي 2000 كجم اليوم', desc_en: 'Lift a total of 2,000 kg today' },
        
        { id: 'd_r1', type: 'reps', target: 40, xp: 30, ar: 'حركة مستمرة', en: 'Keep Moving', desc_ar: 'العب 40 عدة إجمالاً اليوم', desc_en: 'Perform 40 total reps today' },
        { id: 'd_r2', type: 'reps', target: 80, xp: 50, ar: 'قوة التحمل', en: 'Endurance', desc_ar: 'العب 80 عدة إجمالاً اليوم', desc_en: 'Perform 80 total reps today' },
        { id: 'd_r3', type: 'reps', target: 120, xp: 70, ar: 'ألياف نشطة', en: 'Active Fibers', desc_ar: 'العب 120 عدة إجمالاً اليوم', desc_en: 'Perform 120 total reps today' },
        { id: 'd_r4', type: 'reps', target: 150, xp: 100, ar: 'بطل الماراثون', en: 'Marathon Champ', desc_ar: 'العب 150 عدة إجمالاً اليوم', desc_en: 'Perform 150 total reps today' },

        { id: 'd_m1', type: 'meal', target: 1, xp: 20, ar: 'وقود الجسم', en: 'Body Fuel', desc_ar: 'سجل وجبة صحية واحدة', desc_en: 'Log 1 healthy meal' },
        { id: 'd_m2', type: 'meal', target: 2, xp: 40, ar: 'تغذية سليمة', en: 'Clean Diet', desc_ar: 'سجل وجبتين صحيتين', desc_en: 'Log 2 healthy meals' },
        { id: 'd_m3', type: 'meal', target: 3, xp: 80, ar: 'طباخ الجيم', en: 'Gym Chef', desc_ar: 'سجل 3 وجبات صحية اليوم', desc_en: 'Log 3 healthy meals today' },

        { id: 'd_soc1', type: 'tribute', target: 1, xp: 30, ar: 'تفقد الخريطة', en: 'Map Recon', desc_ar: 'افتح الخريطة وحصل ضريبة الملك', desc_en: 'Open map & claim King Tribute' },
        { id: 'd_soc2', type: 'leaderboard', target: 1, xp: 20, ar: 'مراقبة الخصوم', en: 'Scout Rivals', desc_ar: 'افتح لوحة المتصدرين اليوم', desc_en: 'Check the leaderboard today' },
        { id: 'd_soc3', type: 'chat', target: 1, xp: 30, ar: 'دعم الأبطال', en: 'Support Heroes', desc_ar: 'أرسل رسالة في الدردشة لأي صديق', desc_en: 'Send a chat message to a friend' },

        { id: 'd_dl1', type: 'dl_score', target: 50, xp: 30, ar: 'سحب سريع', en: 'Quick Pull', desc_ar: 'اجمع 50 نقطة بلعبة الديدليفت', desc_en: 'Score 50 in DL Game' },
        { id: 'd_dl2', type: 'dl_score', target: 150, xp: 50, ar: 'قبضة محكمة', en: 'Firm Grip', desc_ar: 'اجمع 150 نقطة بلعبة الديدليفت', desc_en: 'Score 150 in DL Game' },
        { id: 'd_dl3', type: 'dl_score', target: 250, xp: 80, ar: 'ملك الرفعة', en: 'Lift King', desc_ar: 'اجمع 250 نقطة بلعبة الديدليفت', desc_en: 'Score 250 in DL Game' },
        { id: 'd_dl4', type: 'dl_score', target: 400, xp: 120, ar: 'ظهر فولاذي', en: 'Steel Back', desc_ar: 'اجمع 400 نقطة بلعبة الديدليفت', desc_en: 'Score 400 in DL Game' },
        
        { id: 'd_dlc1', type: 'dl_combo', target: 50, xp: 40, ar: 'تزامن', en: 'Sync', desc_ar: 'حقق كومبو 50 بلعبة الديدليفت', desc_en: 'Reach 50 Combo in DL' },
        { id: 'd_dlc2', type: 'dl_combo', target: 65, xp: 60, ar: 'غضب متتالي', en: 'Chain Rage', desc_ar: 'حقق كومبو 65 بلعبة الديدليفت', desc_en: 'Reach 65 Combo in DL' },
        { id: 'd_dlc3', type: 'dl_combo', target: 80, xp: 100, ar: 'لا يمكن إيقافه', en: 'Unstoppable', desc_ar: 'حقق كومبو 80 بلعبة الديدليفت', desc_en: 'Reach 80 Combo in DL' },

        { id: 'd_sq1', type: 'sq_score', target: 50, xp: 30, ar: 'نزول آمن', en: 'Safe Drop', desc_ar: 'اجمع 50 نقطة بلعبة السكوات', desc_en: 'Score 50 in Squat Game' },
        { id: 'd_sq2', type: 'sq_score', target: 100, xp: 50, ar: 'توازن جيد', en: 'Good Balance', desc_ar: 'اجمع 100 نقطة بلعبة السكوات', desc_en: 'Score 100 in Squat Game' },
        { id: 'd_sq3', type: 'sq_score', target: 150, xp: 80, ar: 'أرجل صلبة', en: 'Solid Legs', desc_ar: 'اجمع 150 نقطة بلعبة السكوات', desc_en: 'Score 150 in Squat Game' },
        { id: 'd_sq4', type: 'sq_score', target: 250, xp: 120, ar: 'ثبات الجبل', en: 'Mountain Stance', desc_ar: 'اجمع 250 نقطة بلعبة السكوات', desc_en: 'Score 250 in Squat Game' }
    ],
    weekly: [
        { id: 'w_v1', type: 'volume', target: 10000, xp: 200, ar: 'أسبوع الإحماء', en: 'Warmup Week', desc_ar: 'ارفع إجمالي 10000 كجم هذا الأسبوع', desc_en: 'Lift 10,000 kg total this week' },
        { id: 'w_v2', type: 'volume', target: 15000, xp: 350, ar: 'عمل شاق', en: 'Hard Work', desc_ar: 'ارفع إجمالي 15000 كجم هذا الأسبوع', desc_en: 'Lift 15,000 kg total this week' },
        { id: 'w_v3', type: 'volume', target: 20000, xp: 500, ar: 'دبابة بشرية', en: 'Human Tank', desc_ar: 'ارفع إجمالي 20000 كجم هذا الأسبوع', desc_en: 'Lift 20,000 kg total this week' },
        { id: 'w_v4', type: 'volume', target: 30000, xp: 1000, ar: 'أسطورة النادي', en: 'Gym Legend', desc_ar: 'ارفع إجمالي 30000 كجم هذا الأسبوع', desc_en: 'Lift 30,000 kg total this week' },

        { id: 'w_r1', type: 'reps', target: 200, xp: 250, ar: 'ألياف مرنة', en: 'Flexible Fibers', desc_ar: 'العب 200 عدة إجمالاً هذا الأسبوع', desc_en: 'Perform 200 reps this week' },
        { id: 'w_r2', type: 'reps', target: 400, xp: 450, ar: 'مضخة الأسبوع', en: 'Week Pump', desc_ar: 'العب 400 عدة إجمالاً هذا الأسبوع', desc_en: 'Perform 400 reps this week' },
        { id: 'w_r3', type: 'reps', target: 600, xp: 800, ar: 'لا تشعر بالتعب', en: 'Tireless', desc_ar: 'العب 600 عدة إجمالاً هذا الأسبوع', desc_en: 'Perform 600 reps this week' },
        { id: 'w_r4', type: 'reps', target: 800, xp: 1200, ar: 'محرك ديزل', en: 'Diesel Engine', desc_ar: 'العب 800 عدة إجمالاً هذا الأسبوع', desc_en: 'Perform 800 reps this week' },

        { id: 'w_d1', type: 'workout_days', target: 3, xp: 300, ar: 'تمرين منتظم', en: 'Regular Training', desc_ar: 'سجل تمارين في 3 أيام مختلفة', desc_en: 'Log workouts on 3 different days' },
        { id: 'w_d2', type: 'workout_days', target: 4, xp: 500, ar: 'التزام مثالي', en: 'Perfect Discipline', desc_ar: 'سجل تمارين في 4 أيام مختلفة', desc_en: 'Log workouts on 4 different days' },
        { id: 'w_d3', type: 'workout_days', target: 5, xp: 800, ar: 'وحش الانضباط', en: 'Discipline Beast', desc_ar: 'سجل تمارين في 5 أيام مختلفة', desc_en: 'Log workouts on 5 different days' },

        { id: 'w_m1', type: 'meal', target: 10, xp: 300, ar: 'نظام صحي', en: 'Healthy Pattern', desc_ar: 'سجل 10 وجبات صحية هذا الأسبوع', desc_en: 'Log 10 healthy meals this week' },
        { id: 'w_m2', type: 'meal', target: 15, xp: 500, ar: 'مكينة هضم', en: 'Digestion Machine', desc_ar: 'سجل 15 وجبة صحية هذا الأسبوع', desc_en: 'Log 15 healthy meals this week' },
        { id: 'w_m3', type: 'meal', target: 20, xp: 800, ar: 'جسم نظيف 100%', en: 'Clean Body', desc_ar: 'سجل 20 وجبة صحية هذا الأسبوع', desc_en: 'Log 20 healthy meals this week' },

        { id: 'w_g1', type: 'dl_score', target: 2000, xp: 400, ar: 'بطل الديدليفت', en: 'DL Master', desc_ar: 'اجمع 2000 نقطة ديدليفت في الأسبوع', desc_en: 'Score 2000 in DL over the week' },
        { id: 'w_g2', type: 'sq_score', target: 1500, xp: 400, ar: 'سيد التوازن', en: 'Balance Lord', desc_ar: 'اجمع 1500 نقطة سكوات في الأسبوع', desc_en: 'Score 1500 in Squat over the week' }
    ]
};


// --- نظام التهيئة وتوليد المهام ---
function initQuests() {
    let savedData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!savedData.quests) savedData.quests = { active: [], progress: {} };

    const todayStr = new Date().toDateString();
    const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
    const weekStr = `${d.getFullYear()}-W${Math.round(((d.getTime() - new Date(d.getFullYear(), 0, 4).getTime()) / 86400000) / 7) + 1}`;

    let needsUpdate = false;

    // توليد مهام يومية جديدة (3 مهام)
    if (savedData.quests.lastDailyReset !== todayStr) {
        let dailyPool = [...questBank.daily].sort(() => 0.5 - Math.random()).slice(0, 3);
        savedData.quests.active = savedData.quests.active.filter(q => q.id.startsWith('w_'));
        dailyPool.forEach(q => savedData.quests.active.push(q));
        
        for (let key in savedData.quests.progress) {
            if (key.startsWith('d_')) delete savedData.quests.progress[key];
        }
        savedData.quests.lastDailyReset = todayStr;
        needsUpdate = true;
    }

    // توليد مهمة أسبوعية جديدة (1 مهمة ضخمة)
    if (savedData.quests.lastWeeklyReset !== weekStr) {
        let weeklyPool = [...questBank.weekly].sort(() => 0.5 - Math.random()).slice(0, 1);
        savedData.quests.active = savedData.quests.active.filter(q => q.id.startsWith('d_'));
        weeklyPool.forEach(q => savedData.quests.active.push(q));
        
        for (let key in savedData.quests.progress) {
            if (key.startsWith('w_')) delete savedData.quests.progress[key];
        }
        savedData.quests.lastWeeklyReset = weekStr;
        needsUpdate = true;
    }

    if (needsUpdate) {
        localStorage.setItem('currentUser', JSON.stringify(savedData));
        if (auth.currentUser) db.collection('users').doc(auth.currentUser.uid).update({ quests: savedData.quests });
    }

    renderQuests();
}

// --- رسم المهام على الشاشة ---
// --- رسم المهام على الشاشة ---
let questTimerInterval; // متغير عالمي لتخزين العداد وتحديثه

window.renderQuests = function() {
    const container = document.getElementById('active-quests-container');
    if (!container) return;

    let savedData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    let activeQuests = savedData.quests?.active || [];
    let progressData = savedData.quests?.progress || {};
    const isEn = currentLang === 'en';

    // 🔥 تعديل عبارة التجديد لتصبح عداد تنازلي للساعات والدقائق
    const timerEl = document.getElementById('quest-timer');
    if (timerEl) {
        const updateTimer = () => {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setHours(24, 0, 0, 0); // تحديد الوقت لمنتصف الليل
            const timeLeftMs = tomorrow - now;
            
            const hours = Math.floor(timeLeftMs / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));
            
            // ترجمة العداد للغتين
            timerEl.innerText = isEn 
                ? `Resets in ${hours}h ${minutes}m` 
                : `تتجدد خلال ${hours}س و${minutes}د`;
        };
        
        updateTimer(); // تشغيل العداد فوراً عند فتح الشاشة
        clearInterval(questTimerInterval); // إيقاف أي عداد سابق لتجنب التكرار
        questTimerInterval = setInterval(updateTimer, 60000); // تحديث العداد كل دقيقة تلقائياً
    }

    if (activeQuests.length === 0) {
        container.innerHTML = `<p style="text-align:center; color:var(--slate);">${isEn ? 'No quests right now.' : 'لا توجد مهام حالياً.'}</p>`;
        return;
    }


    // فرز: الأسبوعية أولاً ثم اليومية
    activeQuests.sort((a, b) => (b.id.startsWith('w_') ? 1 : 0) - (a.id.startsWith('w_') ? 1 : 0));

    container.innerHTML = activeQuests.map(quest => {
        let currentProg = progressData[quest.id] || 0;
        let isCompleted = currentProg >= quest.target;
        if (currentProg > quest.target) currentProg = quest.target;
        
        let percent = (currentProg / quest.target) * 100;
        let title = isEn ? quest.en : quest.ar;
        let desc = isEn ? quest.desc_en : quest.desc_ar;
        let isWeekly = quest.id.startsWith('w_');
        let iconHtml = isWeekly ? '<i class="fa-solid fa-star" style="color: #FFD700;"></i>' : '<i class="fa-solid fa-bolt" style="color: var(--primary-color);"></i>';
        
        let overlayHTML = isCompleted 
            ? `<div class="quest-completed-overlay"><i class="fa-solid fa-check-circle"></i> ${isEn ? 'Completed!' : 'مكتملة!'}</div>` 
            : '';

        // 🔥 التعديل هنا: ترجمة كلمة "أسبوعية" حسب اللغة
        let weeklyBadge = isWeekly ? (isEn ? '<span style="font-size:0.6rem; opacity:0.7;">(Weekly)</span>' : '<span style="font-size:0.6rem; opacity:0.7;">(أسبوعية)</span>') : '';

        return `
            <div class="quest-item ${isWeekly ? 'weekly' : ''}">
                ${overlayHTML}
                <div class="quest-header">
                    <div style="flex: 1;">
                        <h4 class="quest-title">${iconHtml} ${title} ${weeklyBadge}</h4>
                        <p class="quest-desc">${desc}</p>
                    </div>
                    <div class="quest-xp-badge">+${quest.xp} XP</div>
                </div>
                <div class="quest-progress-wrap">
                    <div class="quest-progress-bg">
                        <div class="quest-progress-fill" style="width: ${percent}%;"></div>
                    </div>
                    <div class="quest-status">${currentProg} / ${quest.target}</div>
                </div>
            </div>
        `;
    }).join('');
    
    // ترجمة النصوص الأساسية للوحة
    const titleEl = document.querySelector('[data-translate="quests_title"]');
    if(titleEl) titleEl.innerText = isEn ? 'Bounty Board' : 'لوحة المهام';
};



window.updateQuestProgress = function(actionType, amount = 1) {
    let savedData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!savedData.quests || !savedData.quests.active) return;

    let progressChanged = false;
    let totalXpGained = 0;
    const isEn = currentLang === 'en';

    savedData.quests.active.forEach(quest => {
        // فحص نوع المهمة
        if (quest.type === actionType) {
            let currentProg = savedData.quests.progress[quest.id] || 0;
            
            if (currentProg < quest.target) {
                // إذا كانت مهمة الكومبو، نأخذ الرقم الأعلى دائماً، لا نجمعه
                if (actionType === 'dl_combo') {
                    if (amount > currentProg) {
                        savedData.quests.progress[quest.id] = amount;
                        progressChanged = true;
                    }
                } else {
                    savedData.quests.progress[quest.id] = currentProg + amount;
                    progressChanged = true;
                }
                
                if (progressChanged) {
                    let newProg = savedData.quests.progress[quest.id];

                    // إذا اكتملت المهمة للتو!
                    if (newProg >= quest.target && currentProg < quest.target) {
                        totalXpGained += quest.xp;
                        let qName = isEn ? quest.en : quest.ar;
                        setTimeout(() => {
                            showToast(`🎯 ${isEn ? 'Quest Completed' : 'تم إنجاز المهمة'}: ${qName}! (+${quest.xp} XP)`);
                        }, 800);
                    }
                }
            }
        }
    });

    if (progressChanged) {
        localStorage.setItem('currentUser', JSON.stringify(savedData));
        
        // تحديث واجهة المهام إذا كان المستخدم في الداشبورد
        if (document.getElementById('active-quests-container')) {
            if (typeof renderQuests === 'function') renderQuests();
        }
        
        // 🔥 تم الإصلاح هنا: تحديث الفايربيس فوراً بأي تقدم صغير لمنع التصفير!
        if (auth.currentUser) {
            db.collection('users').doc(auth.currentUser.uid).update({ quests: savedData.quests }).catch(err => console.log(err));
        }

        if (totalXpGained > 0) {
            addXP(totalXpGained);
        }
    }
};

// تهيئة النظام عند فتح الداشبورد
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('main-content-area')) {
        setTimeout(initQuests, 500); 
    }
});

