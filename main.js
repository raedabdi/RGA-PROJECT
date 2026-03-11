


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
window.triggerProofUpload = async function(notifId) {
    const fileInput = document.getElementById('hidden-proof-upload');
    fileInput.onchange = async (e) => {
        const file = e.target.files[0];
        if(!file) return;
        
        showToast(currentLang === 'en' ? "Uploading proof... Please wait " : "جاري رفع الإثبات للقيادة... انتظر ");
        
        const user = auth.currentUser;
        
        try {
            // سحب بيانات الإشعار لاستخراج تفاصيل التمرين الكاملة
            const notifRef = db.collection('users').doc(user.uid).collection('notifications').doc(notifId);
            const notifDoc = await notifRef.get();
            const notifData = notifDoc.data();
            
            // التأكد من وجود التمرين الكامل، أو استخدام التمرين الفردي كبديل
            let workoutDetails = notifData.fullWorkoutData || [notifData.exerciseData];
            let muscleType = notifData.exerciseData.type || "تمرين لايف";

            const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
            const videoRef = storage.ref(`proofs/${user.uid}_${Date.now()}_${cleanFileName}`);
            
            await videoRef.put(file);
            const videoURL = await videoRef.getDownloadURL();
            let dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            
            // إرسال التمرين الكامل للآدمن
            await db.collection('pending_workouts').add({
                userId: user.uid,
                userName: JSON.parse(localStorage.getItem('currentUser')).firstName,
                date: dateStr,
                type: muscleType,
                details: workoutDetails,
                videoUrl: videoURL,
                status: 'pending',
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });

            await notifRef.delete(); // حذف الإشعار بعد الرفع
            showToast(currentLang === 'en' ? "Uploaded! Admin will review it." : "تم الرفع! الإدارة رح تراجع وحشنتك 👑");
        } catch(error) {
            console.error(error);
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
    <button class="perf-tab-btn active-tab" onclick="switchAdminTab('requests', this)">${currentLang === 'en' ? 'Beast Requests (Videos)' : 'طلبات الوحوش (فيديو)'}</button>
    <button class="perf-tab-btn" onclick="switchAdminTab('messages', this)">${currentLang === 'en' ? 'Inbox (Support)' : 'صندوق الوارد (دعم فني)'}</button>
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




let isApprovingWorkout = false;

async function approveWorkout(docId) {
    const t = translations[currentLang || 'ar'];
    if(!confirm(t.confirm_approve)) return;
    
    if (isApprovingWorkout) return; 
    isApprovingWorkout = true;

    try {
        showToast(t.processing_wait);
        const docRef = db.collection('pending_workouts').doc(docId);
        const docSnap = await docRef.get();
        
        if (!docSnap.exists) {
            isApprovingWorkout = false;
            return;
        }
        
        const data = docSnap.data();

        const userRef = db.collection('users').doc(data.userId);
        const userSnap = await userRef.get();
        let userData = userSnap.data();

        let workouts = userData.workouts || [];
        workouts.unshift({ date: data.date, type: data.type, details: data.details });

        let oldMaxW = userData.stats?.maxWeight || 0;
        let maxW = oldMaxW;
        data.details.forEach(ex => { if(parseFloat(ex.weight) > maxW) maxW = parseFloat(ex.weight); });

        let updatedStats = userData.stats || {};
        updatedStats.maxWeight = maxW;

        // 🪦 السحر هنا: فحص الترتيب (أول 3 مراكز) "قبل" تحديث وزن اللاعب الجديد
        let dethronedVictim = null;
        let rankLostName = "Fallen Hero";

        if (maxW > oldMaxW && userData.city) {
            const top3Snap = await db.collection('users')
                .where('city', '==', userData.city)
                .orderBy('stats.maxWeight', 'desc')
                .limit(3)
                .get();

            let top3 = [];
            top3Snap.forEach(doc => top3.push({ id: doc.id, ...doc.data() }));

            // نبحث إذا كان وزن اللاعب الجديد سيكسر رقم أي أحد من التوب 3
            for (let i = 0; i < top3.length; i++) {
                let rival = top3[i];
                let rivalWeight = rival.stats?.maxWeight || 0;

                // إذا كان وزني الجديد أعلى من وزنه، وهو ليس أنا، وكنت سابقاً أقل منه (يعني تغلبت عليه الآن)
                if (maxW > rivalWeight && rival.id !== data.userId && oldMaxW <= rivalWeight) {
                    dethronedVictim = rival;
                    // تحديد اللقب الذي خسره الضحية
                    if (i === 0) rankLostName = currentLang === 'en' ? "City Monster" : "وحش المدينة";
                    else if (i === 1) rankLostName = currentLang === 'en' ? "Silver Guard" : "حارس فضي";
                    else if (i === 2) rankLostName = currentLang === 'en' ? "Bronze Guard" : "حارس برونزي";
                    
                    break; // نتوقف عند أعلى شخص تم كسره
                }
            }
        }

        // ... داخل دالة approveWorkout قبل سطر userRef.update(...) ...
        
        // 🚨 حساب المهام (الحجم والعدات) للتمرين الذي تم الموافقة عليه
        let totalVol = 0; let totalReps = 0;
        data.details.forEach(ex => { 
            totalVol += (parseFloat(ex.weight) * parseInt(ex.reps)) || 0; 
            totalReps += parseInt(ex.reps) || 0;
        });


        // ⚔️ إضافة الوزن الأسطوري لفريق اللاعب بعد اعتماد الإدارة (مع فحص حد التمرينين)
        // 🟢 1. إصلاح حرف الـ if الصغير
        if (userData.clanId) {
            try {
                const clanDoc = await db.collection('clans').doc(userData.clanId).get();
                if (clanDoc.exists && clanDoc.data().warStatus === 'in_war') {
                    const currentWarId = clanDoc.data().currentWarId;
                    if (currentWarId) {
                        
                        // تأكد من تعريف warContributions هنا لاستخدامها لاحقاً
                        var warContributions = userData.warContributions || { warId: null, count: 0 };
                        if (warContributions.warId !== currentWarId) {
                            warContributions = { warId: currentWarId, count: 0 };
                        }
                        
                        // يضيف النقاط فقط إذا اللاعب ما استهلك التمرينين تبعه
                        if (warContributions.count < 2) {
                            const warRef = db.collection('wars').doc(currentWarId);
                            const warDoc = await warRef.get();
                            if (warDoc.exists && warDoc.data().status === 'active') {
                                let isClan1 = warDoc.data().clan1.id === userData.clanId;
                                let updateField = isClan1 ? 'clan1.score' : 'clan2.score';
                                let memberField = isClan1 ? `clan1.members.${data.userId}` : `clan2.members.${data.userId}`;
                                await warRef.update({
                                    [updateField]: firebase.firestore.FieldValue.increment(totalVol),
                                    [`${memberField}.name`]: userData.firstName || 'Hero',
                                    [`${memberField}.photo`]: userData.photoURL || 'https://i.ibb.co/9mPmHXkh/cropped-circle-image-2.png',
                                    [`${memberField}.volume`]: firebase.firestore.FieldValue.increment(totalVol)
                                });
                                
                                warContributions.count += 1;
                            }
                        }
                    }
                }
            } catch (err) {
                console.error("Clan War Error: ", err);
            }
        } // 🟢 2. تم إغلاق جميع شروط الـ if والـ try هنا بنجاح!

        // 🟢 3. تعريف updatePayload قبل استخدامه لتجنب خطأ الـ Reference
        let updatePayload = {
            workouts: workouts, // تأكد أن workouts معرفة في أعلى الدالة
            isWorkoutPending: false,
            stats: updatedStats, // تأكد أن updatedStats معرفة في أعلى الدالة
            xp: firebase.firestore.FieldValue.increment(50)
        };

        // إذا تم تحديث مساهمات الحرب، نضيفها للحفظ
        if (typeof warContributions !== 'undefined') {
            updatePayload.warContributions = warContributions;
        }

        // قراءة مهام اللاعب الحالية من السيرفر
        let userQuests = userData.quests || { active: [], progress: {} };
        let progressChanged = false;

        if (userQuests.active) {
            userQuests.active.forEach(quest => {
                if (quest.type === 'volume') {
                    userQuests.progress[quest.id] = (userQuests.progress[quest.id] || 0) + totalVol;
                    progressChanged = true;
                }
                if (quest.type === 'reps') {
                    userQuests.progress[quest.id] = (userQuests.progress[quest.id] || 0) + totalReps;
                    progressChanged = true;
                }
                if (quest.type === 'workout_days') {
                    userQuests.progress[quest.id] = (userQuests.progress[quest.id] || 0) + 1;
                    progressChanged = true;
                }
            });
        }

        // إذا تم تحديث المهام، نضيفها للحفظ في الداتابيس
        if (progressChanged) {
            updatePayload.quests = userQuests;
        }

        // 🟢 4. التحديث الآلي في قاعدة البيانات للاعب (مرة واحدة فقط بكل البيانات المجمعة)
        await userRef.update(updatePayload);

        // 2. إذا وجدنا ضحية، نرسله فوراً إلى المقبرة!
        if (dethronedVictim) {
            try {
                await db.collection('fallen_kings').add({
                    city: userData.city,
                    kingName: dethronedVictim.firstName + " " + (dethronedVictim.lastName || ''),
                    kingPhoto: dethronedVictim.photoURL || 'https://i.ibb.co/9mPmHXkh/cropped-circle-image-2.png',
                    weight: dethronedVictim.stats?.maxWeight || 0,
                    slayerName: userData.firstName + " " + (userData.lastName || ''),
                    slayerWeight: maxW,
                    rankLost: rankLostName, // حفظ اللقب اللي خسره
                    fallDate: firebase.firestore.FieldValue.serverTimestamp()
                });
            } catch (err) {
                console.error("Valhalla Error:", err);
            }

            // رسالة تهنئة للاعب لأنه كسر أحد أبطال الخريطة
            const uniqueNotifIdSelf = `throne_win_${docId}_self`;
            const selfMsg = currentLang === 'en' 
                ? `👑 You crushed a record in ${userData.city}! You took down a map legend with ${maxW}kg!`
                : `👑 لقد حطمت عرشاً في ${userData.city}! أنت الآن من أساطير الخريطة بوزن ${maxW}kg!`;
            
            await userRef.collection('notifications').doc(uniqueNotifIdSelf).set({
                type: 'admin_alert', 
                senderName: t.admin_name || 'الإدارة 👑',
                senderPhoto: 'https://i.ibb.co/9mPmHXkh/cropped-circle-image-2.png',
                text: selfMsg,
                status: 'pending',
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });

        } else {
            // إذا لم يكسر أي من التوب 3، نرسل له رسالة الاعتماد العادية
            await userRef.collection('notifications').doc(`approve_${docId}`).set({
                type: 'admin_alert',
                senderId: 'admin', 
                senderName: t.admin_name, 
                senderPhoto: 'https://i.ibb.co/9mPmHXkh/cropped-circle-image-2.png',
                text: t.admin_notif_approve, 
                status: 'pending', 
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
        }

        // تحديث بيانات التخزين المحلي للآدمن (لو كان يختبر بحسابه)
        if (auth.currentUser && auth.currentUser.uid === data.userId) {
            let localData = JSON.parse(localStorage.getItem('currentUser') || '{}');
            localData.stats = updatedStats;
            localData.isWorkoutPending = false;
            localData.xp = (localData.xp || 0) + 50;
            localStorage.setItem('currentUser', JSON.stringify(localData));
        }

        try { await storage.refFromURL(data.videoUrl).delete(); } catch(err) {}
        await docRef.delete();

        showToast(t.approve_success);
        loadPendingWorkouts();
    } catch (e) { 
        console.error(e); 
        showToast(t.approve_fail); 
    } finally {
        isApprovingWorkout = false;
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
    storageBucket: "rgalab.firebasestorage.app",
    messagingSenderId: "882288745140",
    appId: "1:882288745140:web:3c77b0f83ac4e11d30d5e1"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

// 🔥 السحر هنا: إجبار الفايربيس على استخدام Long Polling بدل WebChannel لحل خطأ الـ Listen 404
db.settings({
    experimentalForceLongPolling: true,
    useFetchStreams: false
});

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




firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
  .then(() => {
    firebase.auth().onAuthStateChanged((user) => {
        const currentPath = window.location.pathname;
        const isIndexPage = currentPath.endsWith('index.html') || currentPath === '/';

        if (user) {
            // 🟢 التعديل هنا: ننقله للداشبورد فقط إذا كان الإيميل مفعل
            if (isIndexPage && user.emailVerified) {
                window.location.replace('dashboard.html');
            }
        } else {
            if (!isIndexPage) {
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

        transfer_leader: "نقل القيادة 👑",
        state_ready: " جاهز للحرب",
        state_standby: " استراحة",
mark_read: "تحديد كـ مقروء ومسح",


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

        city_grave_title: "مدافن أساطير {city} 🪦",

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

        grave_time_death: "وقت الوفاة:",
        grave_old_record: "الرقم القديم:",
        grave_assassin: "القاتل:",
        grave_condition: "حالة القبر",
        grave_respected: "مُحترم",
        grave_defaced: "مُدنس",
        grave_leave_comment: "اترك تعليقاً في سجل الزوار",
        grave_place_flowers: "وضع زهور",
        grave_deface: "تدنيس القبر",
        grave_btn_comment: "إرسال التعليق",
        grave_comments_title: "التعليقات",
        grave_here_lies: "هنا يرقد",

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
        // --- نظام عصابات الحديد (Clans) ---
        guilds_btn: "عصابات الحديد",
        guild_hub: "مقر العصابة 🛡️",
        create_guild: "تأسيس عصابة (1000 XP)",
        guild_name: "اسم العصابة",
        guild_tag: "الرمز (Tag - 4 أحرف)",
        no_guild: "أنت ذئب وحيد! أسس عصابتك أو انضم لواحدة.",
        join_guild: "البحث عن عصابة",
        guild_members: "الأعضاء",
        war_room: "غرفة الحرب ⚔️",
        war_ready: "جاهز للحرب",
        search_war: "البحث عن فريسة (حرب)",
        war_active: "حرب طاحنة جارية!",
        kick_member: "طرد",
        promote_member: "ترقية",
        leave_guild: "مغادرة العصابة",
        not_enough_xp_guild: "تحتاج 1000 XP لتأسيس عصابة!",
        guild_created: "تم تأسيس العصابة بنجاح! أنت الزعيم.",
        war_win_prize: "جائزة الانتصار: 500 XP لكل عضو",
        vs_text: "ضد",

        err_invalid_email: " صيغة البريد الإلكتروني غير صحيحة!",
        err_default: " حدث خطأ، يرجى المحاولة لاحقاً.",



superset_btn: "سوبرسيت",
live_select_muscle: "اختر العضلة",
muscle_arms: "أذرع",




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


        game_cooldown: "اللعبة في فترة استراحة! متاحة بعد",
        wait_setup: "لحظة نجهزلك اللعبة يا وحش ",

        grave_desc_1: "تتعاون مدينة الأساطير لتوفير مكان للعزاء لمن فقدوا عروشهم. هنا في المقبرة ستجد مكاناً لإلقاء التحية على الملوك الذين سقطوا. أدناه ستجد الوفيات التي حدثت في الأيام السبعة الماضية، ويمكنك استخدام ميزة البحث للبحث عن أي شخص سقط مسبقاً.",
        grave_desc_2: "يوجد سجل زوار لكل قبر حتى تتمكن من ترك ذكرى أو رأي حول المتوفى. إذا كنت تشعر بالجرأة، يمكنك أيضاً تدنيس القبر ليعرف الجميع من هو المسؤول.",
        recent_deaths: "الوفيات الأخيرة",
        all_time: "الكل",

new_max_alert: " دمار شامل! كسرت رقمك بنفس التمرين. الإثبات رح ينطلب للوزن الأعلى ({weight}kg)!",


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
                meal_cooldown: "وجبتك لسه بتنهضم! انتظر",

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

        grave_time_death: "وقت الوفاة:",
        grave_old_record: "الرقم القديم:",
        grave_assassin: "القاتل:",
        grave_condition: "حالة القبر",
        grave_condition_label: "الحالة:",
        grave_respected: "مُحترم",
        grave_defaced: "مُدنس",
        grave_leave_comment: "سجل زوار المقبرة",
        grave_place_flowers: "إلقاء التحية", // غيرناها لتكون أفخم
        grave_deface: "إهانة الملك", // غيرناها لتكون أفخم
        grave_btn_comment: "إرسال التعليق",
        grave_comments_title: "التعليقات",
        grave_here_lies: "هنا يرقد الملك الحاكم",
        grave_fell_on: "تاريخ السقوط:",
        grave_crushed_by: "سُحق على يد:",
        grave_admin_name: "الإدارة ",
        grave_admin_msg: "ارقد بسلام، كنت بطلاً حقيقياً.",
        grave_time_yesterday: "البارحة",
        grave_time_now: "الآن",

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

        no_notifications: "لا توجد إشعارات جديدة",
        friend_request_from: "أرسل لك طلب صداقة!",
        accept: "قبول",
        reject: "رفض",
        message_from: "رسالة من",

        challenges_title: "التحديات",
        challenges_desc: "العب، اجمع نقاط، ونافس الوحوش",

        valhalla_title: "مقبرة الأساطير 🪦",
        valhalla_subtitle: "ملوك سقطت عروشهم، لكن أسماءهم خُلدت في التاريخ...",
        dethroned_by: "سقط على يد:",
        old_record: "الرقم السابق:",
        new_record: "الرقم القاتل:",
        empty_graveyard: "لم يسقط أي ملك في هذه المدينة بعد! الدماء لم تُسفك.",
        valhalla_btn: "زيارة المقبرة",


        click_to_reply: "انقر للرد"
    },
    en: {
        // --- Basics ---
        dashboard: "Dashboard",
        welcome: "Great to see you, Captain",
        valhalla_title: "Valhalla 🪦",
        valhalla_subtitle: "Kings who lost their thrones, but not their legacy...",
        dethroned_by: "Dethroned by:",
        old_record: "Old Record:",
        new_record: "Killer Record:",
        empty_graveyard: "No kings have fallen in this city yet! No blood spilled.",
        valhalla_btn: "Visit Valhalla",

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

superset_btn: "Superset",
live_select_muscle: "Select Muscle",
muscle_arms: "Arms",

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
        game_cooldown: "Game is resting! Available in",
        wait_setup: "Wait a moment, setting things up Champ ",

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
        meal_cooldown: "Still digesting! Wait",


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

        transfer_leader: "Make Leader 👑",
        state_ready: " WAR READY",
        state_standby: " STANDBY",

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
mark_read: "Mark as read & clear",


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
        grave_desc_1: "The city works with other states to provide those suffering from a loss with a place to grieve. Here at the graveyard you will find a place to pay your respects to anyone who has died across the country. Below you will find those who died in the last seven days, though you can use the search feature to look for anyone who has ever died.",
        grave_desc_2: "There is a guestbook for each grave so that you may leave behind a memory or thought about the deceased. Those feeling generous can also leave a verified witness statement behind so that everyone can see who was responsible.",
        recent_deaths: "Recent deaths",
        all_time: "All",

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

        // --- Iron Guilds (Clans) ---
        guilds_btn: "Iron Guilds",
        guild_hub: "Guild Hub 🛡️",
        create_guild: "Forge Guild (1000 XP)",
        guild_name: "Guild Name",
        guild_tag: "Tag (Max 4 chars)",
        no_guild: "You are a lone wolf! Forge or join a guild.",
        join_guild: "Find a Guild",
        guild_members: "Roster",
        war_room: "War Room ⚔️",
        war_ready: "War Ready",
        search_war: "Hunt for Prey (Search Match)",
        war_active: "Bloodbath in Progress!",
        kick_member: "Kick",
        promote_member: "Promote",
        leave_guild: "Leave Guild",
        not_enough_xp_guild: "You need 1000 XP to forge a guild!",
        guild_created: "Guild forged successfully! You are the Leader.",
        war_win_prize: "Victory Spoils: +500 XP per member",
        vs_text: "VS",

        stat_active: "Active Members", stat_weight: "Kg Lifted", stat_challenges: "Challenges Done",
        feat_main_1: "Unleash", feat_main_2: "Your Potential",
        feat_subtitle: "Everything you need to reach the top in one integrated platform.",
        feat1_title: "City Monster System", feat1_desc: "Rule your city map! Lift the heaviest, provide video proof to admin, and take the throne.",
        feat2_title: "Muscle Radar & TSB", feat2_desc: "Monitor your muscle balance and CNS readiness via precise Olympic charts to prevent injury.",
        feat3_title: "Live Interactive Workout", feat3_desc: "Log sets in real-time, with smart rest timers and alerts when breaking PRs.",

        grave_time_death: "Time of Death:",
        grave_old_record: "Old Record:",
        grave_assassin: "Assassinated By:",
        grave_condition: "Grave Condition",
        grave_respected: "Respected",
        grave_defaced: "Defaced",
        grave_leave_comment: "Comment in the guestbook",
        grave_place_flowers: "Place flowers",
        grave_deface: "Deface",
        grave_btn_comment: "Leave comment!",
        grave_comments_title: "Comments",
        grave_here_lies: "Here lies",

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

        grave_time_death: "Time of Death:",
        grave_old_record: "Old Record:",

new_max_alert: " INSANE! You broke your record again. Proof will be required for the absolute max ({weight}kg)!",

        grave_assassin: "Assassin:",
        grave_condition: "Grave Condition",
        grave_condition_label: "Status:",
        grave_respected: "Respected",
        grave_defaced: "Defaced",
        grave_leave_comment: "Graveyard Guestbook",
        grave_place_flowers: "Pay Respects",
        grave_deface: "Mock the King",
        grave_btn_comment: "Leave Comment",
        grave_comments_title: "Comments",
        grave_here_lies: "Here lies the fallen King",
        grave_fell_on: "Fell on:",
        grave_crushed_by: "Crushed by:",
        grave_admin_name: "Admin ",
        grave_admin_msg: "Rest in peace, you were a true champion.",
        grave_time_yesterday: "Yesterday",
        grave_time_now: "Just now",
        city_grave_title: "The Fallen Kings of {city} 🪦",

        loading_messages: "Loading encrypted messages... ⏳",
        messages_disappear: "Messages disappear after 24 hours ⏳<br>Start the challenge now!",
        notifications: "Notifications ",

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
            const t = translations[currentLang || 'ar'];
            
            try {
                const userCredential = await auth.signInWithEmailAndPassword(email, password);
                
                // التحقق من تفعيل الإيميل قبل الدخول
                if (!userCredential.user.emailVerified) {
                    await auth.signOut();
                    showToast(currentLang === 'en' ? " Please verify your email first!" : " الرجاء تفعيل بريدك الإلكتروني أولاً!");
                    return;
                }

                showToast(t.login_success || " تم الدخول، جاري تحويلك...");
                setTimeout(() => window.location.href = 'dashboard.html', 1500);
            } catch (error) {
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
            const t = translations[currentLang || 'ar'];

            try {
                // 1. إنشاء الحساب
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                
                // 2. إرسال إيميل التحقق فوراً
                await userCredential.user.sendEmailVerification();

                
                          // 3. حفظ بيانات المستخدم في قاعدة البيانات
                const newShortID = generateShortID(); 
                await db.collection('users').doc(userCredential.user.uid).set({
                    firstName,
                    lastName,
                    fullName: `${firstName} ${lastName}`,
                    email,
                    photoURL: defaultAvatar,
                    shortID: newShortID, 
                    xp: 0,
                    maxXp: 1000,
                    rank: 1,
                    streak: 1,
                    myFriendsList: [], // 🔥 الحل هنا: إنشاء المصفوفة فارغة لمنع التعليق
                    lastLoginDate: new Date().toISOString().split('T')[0],
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                
                // 4. رسالة تطلب منه يروح يأكد الإيميل
                showToast(currentLang === 'en' ? " Account created! Check your email to verify." : "تم الإنشاء! تفقد بريدك لتفعيل الحساب.");
                
                // 5. تسجيل الخروج فوراً (عشان ما يدخل إلا لما يفعل الإيميل)
                await auth.signOut();
                
                // تنظيف الفورم ونقله لتبويب تسجيل الدخول
                signupForm.reset();
                document.querySelector('[data-form="login"]').click();
                
            } catch (error) {
                let message = t.err_default;
                if (error.code === 'auth/email-already-in-use') message = t.err_email_in_use;
                else if (error.code === 'auth/weak-password') message = t.err_weak_pass;
                else if (error.code === 'auth/invalid-email') message = t.err_invalid_email;
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

        const savedData = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (savedData.currentTheme) {
            document.body.setAttribute('data-theme', savedData.currentTheme);
        }

        if (user) {
            // 🚨 حماية إضافية: طرد المستخدم إذا وصل للداشبورد وإيميله غير مفعل
            if (!user.emailVerified) {
                auth.signOut();
                window.location.href = 'index.html';
                return; // إيقاف تنفيذ باقي الكود حتى لا تظهر أخطاء
            }

            // إظهار الزر إذا كان المستخدم هو الآدمن (أنت)
            const adminEmail = "raedabdi9@gmail.com"; // 👈 اكتب إيميلك هون بالضبط
            const adminBtn = document.getElementById('admin-panel-btn');
            if (adminBtn && user.email === adminEmail) {
                adminBtn.style.display = 'block';
            }

            checkAndShowOnboarding();
            preloadHeavyCovers(); 

            // تحديث الواجهة
            const localData = localStorage.getItem('currentUser');
            if (localData) renderUI(JSON.parse(localData));

            syncUserData(user);
            listenForNotifications(); 
            startBackgroundWarMonitor(user); // 👈 ضيف هذا السطر السحري هنا


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
            localStorage.removeItem('hasSeenTour');  
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


// الكود الجديد والمطور لحفظ صورة البروفايل (نظام Storage لتوفير الداتا)
// الكود الجديد والمطور لحفظ صورة البروفايل (نظام Storage لتوفير الداتا)
const cropSaveBtn = document.getElementById('crop-save-btn');
if (cropSaveBtn) {
    cropSaveBtn.onclick = () => {
        if (!cropper) return;
        
        const originalText = cropSaveBtn.innerText;
        cropSaveBtn.innerText = currentLang === 'en' ? 'Saving...' : 'جاري الحفظ...';
        cropSaveBtn.disabled = true;

        // 1. تحويل الصورة إلى ملف (Blob)
        cropper.getCroppedCanvas({ width: 200, height: 200 }).toBlob(async (blob) => {
            try {
                if (!blob) throw new Error("فشل قص الصورة");
                
                const user = auth.currentUser;
                
                // 2. رفع الصورة إلى Firebase Storage
                const imageRef = storage.ref(`profile_images/${user.uid}_${Date.now()}.jpg`);
                await imageRef.put(blob);
                
                // 3. الحصول على الرابط المباشر
                const downloadURL = await imageRef.getDownloadURL();
                
                // 4. حفظ الرابط في قاعدة البيانات
                await db.collection('users').doc(user.uid).update({ photoURL: downloadURL });
                
                // 5. تحديث الواجهة والـ LocalStorage
                const saved = JSON.parse(localStorage.getItem('currentUser') || '{}');
                saved.photoURL = downloadURL;
                localStorage.setItem('currentUser', JSON.stringify(saved));
                
                if (typeof renderUI === 'function') renderUI(saved);
                
                document.getElementById('cropper-modal').style.display = 'none';
                showToast(currentLang === 'en' ? " Photo updated!" : " تم تحديث الصورة بنجاح");
                
            } catch (err) {
                console.error("خطأ في حفظ الصورة:", err);
                showToast(currentLang === 'en' ? " Failed to save photo" : " فشل حفظ الصورة");
            } finally {
                // إرجاع الزر لشكله الطبيعي في حالة النجاح أو الفشل
                cropSaveBtn.innerText = originalText;
                cropSaveBtn.disabled = false;
                if (cropper) cropper.destroy();
            }
        }, 'image/jpeg', 0.6);
    };
}
} // 👈👈 هذا هو القوس السحري الذي أنقذ الموقع (يغلق دالة initDashboardPage)

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
        
        if (!doc.exists) {
            console.warn("بيانات المستخدم غير موجودة! جاري بنائها...");
            await userRef.set({
                firstName: "بطل",
                lastName: "جديد",
                email: user.email,
                xp: 0,
                rank: 1,
                streak: 1,
                lastLoginDate: new Date().toISOString().split('T')[0]
            });
            window.location.reload(); // إعادة تحميل لبدء العمل النظيف
            return;
        }


        let data = doc.data();
        let needsUpdate = false;
        
        // إنشاء كود معرف إذا ما كان عنده
        if (!data.shortID) {
            data.shortID = generateShortID();
            needsUpdate = true;
        }

        // سحب سجل التمارين من السحابة وتخزينه وعرضه
        if (data.workouts) {
            localStorage.setItem('userWorkouts', JSON.stringify(data.workouts));
        } else {
            const localWorkouts = JSON.parse(localStorage.getItem('userWorkouts')) || [];
            if (localWorkouts.length > 0) {
                data.workouts = localWorkouts;
                needsUpdate = true;
            }
        }

        // 🛡️ السحر هنا: تحديث الستريك من السيرفر (مستحيل يتأثر بتاريخ الموبايل)
        try {
            const syncStreakCall = firebase.functions().httpsCallable('secureSyncStreak');
            const streakResult = await syncStreakCall();
            
            // إذا السيرفر رد علينا، بناخذ بيانات الستريك الصح منه
            if (streakResult.data && streakResult.data.success) {
                data.streak = streakResult.data.newStreak;
                
                // إذا اللاعب دخل بيوم جديد والستريك زاد، بنطلعله إشعار فخم
                if (streakResult.data.updated && data.streak > 1) {
                    const t = translations[currentLang || 'ar'];
                    showToast(`${t.streak_fire} ${data.streak} ${t.days_streak}`);
                    
                    // نستخدم setTimeout عشان نعطي السيرفر مجال يخلص تحديثاته قبل ما نبعث إحصائية الستريك
                    setTimeout(() => updateStat('streak', data.streak, true), 1000);
                }
            }
        } catch (e) {
            console.error("خطأ في مزامنة الستريك مع السيرفر:", e);
        }

        // حساب المستوى بناءً على الـ XP 
        let calculatedLevel = Math.floor((data.xp || 0) / 500) + 1;
        let calculatedMaxXp = calculatedLevel * 500;

            if (data.rank !== calculatedLevel || data.maxXp !== calculatedMaxXp) {
            data.rank = calculatedLevel;
            data.maxXp = calculatedMaxXp;
            // لا نرسل تحديث للسيرفر هنا لأن السيرفر هو المسؤول عن الرتبة
        }

        // إرسال التحديثات المسموحة فقط لتجنب رفض الفايربيس (Security Rules)
        if (needsUpdate) {
            let safeUpdates = {};
            if (!doc.data().shortID) safeUpdates.shortID = data.shortID;
            if (data.workouts && data.workouts.length > 0) safeUpdates.workouts = data.workouts;
            
            if (Object.keys(safeUpdates).length > 0) {
                await userRef.update(safeUpdates);
            }
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

    // 🔥 الحل الجذري لمنع رمشة الصورة في الشاشة الرئيسية 🔥
    // تحديث الصورة والإطار بدون أي هدم أو بناء لمنع الرمشة عند الريفرش
    let dynamicWrapper = document.getElementById('dynamic-pro-avatar');
    let avatarImgDiv = document.getElementById('dynamic-pro-img');

    if (dynamicWrapper && avatarImgDiv) {
        const targetBorder = `avatar-pro-wrapper ${data.currentBorder || ''}`;
        if (dynamicWrapper.className !== targetBorder) {
            dynamicWrapper.className = targetBorder;
        }

        const rawPhotoUrl = data.photoURL || defaultAvatar;

        if (avatarImgDiv.dataset.currentPhoto !== rawPhotoUrl) {
            avatarImgDiv.style.backgroundImage = `url('${rawPhotoUrl}')`;
            avatarImgDiv.dataset.currentPhoto = rawPhotoUrl;
        }
    }


    const elements = {
        id: document.getElementById('user-id-display'),
        welcome: document.getElementById('welcome-user'),
        rank: document.getElementById('user-rank'),
        xp: document.getElementById('user-xp'),
        maxXp: document.getElementById('max-xp'),
        streak: document.getElementById('user-streak'),
        xpFill: document.getElementById('xp-fill')
    };
    

    
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
let sessionBestCombo = 0; 
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
    if (!checkGameCooldown('deadlift')) return; // 🛑 فحص الكوول داون

    comboCount = 0;
    sessionBestCombo = 0; 
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


function finishGame(isTimeUp) {
    clearInterval(gameInterval);
    isGameActive = false;
    document.getElementById('game-modal').style.display = 'none';

    const savedData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const previousBestCombo = savedData.bestCombo || 0;
    const user = auth.currentUser;

    if (user) {

        if (sessionXP > 0) {
            updateQuestProgress('dl_score', sessionXP);
        }
        if (sessionBestCombo > 0) {
            updateQuestProgress('dl_combo', sessionBestCombo);
        }

        // 2. إعطاء نقاط الخبرة (XP)
        if (sessionXP > 0) {
            showToast(`${translations[currentLang].great_job} +${sessionXP} XP`);
addXP(sessionXP, 'game', 'RGA_SECURE_998877', 'deadlift');
        }

        // 3. تحديث الرقم القياسي التاريخي (إذا كسره)
        if (globalBestCombo > previousBestCombo) {
            db.collection('users').doc(user.uid).update({ bestCombo: globalBestCombo });
            savedData.bestCombo = globalBestCombo;
            localStorage.setItem('currentUser', JSON.stringify(savedData));
            
            setTimeout(() => { 
                showToast(`🔥 رقم قياسي جديد للكومبو: ${globalBestCombo}!`); 
            }, 2000); 
            
            updateStat('dl_combo', globalBestCombo, true);
        }
    }
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
    
    if (comboCount > sessionBestCombo) {
        sessionBestCombo = comboCount;
    }

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
    if (!checkGameCooldown('squat')) return; // 🛑 فحص الكوول داون

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
addXP(squatScore, 'game', 'RGA_SECURE_998877', 'squat');
        updateStat('sq_score', squatScore, true);
updateQuestProgress('sq_score', squatScore); // ربط مهام السكوات


    } else {
        showToast(translations[currentLang].good_luck);
    }
}


window.logHealthyMeal = async function() {
    const user = auth.currentUser;
    if (!user) {
        showToast(currentLang === 'en' ? "Please login first!" : "يجب تسجيل الدخول أولاً!");
        return;
    }

    const t = translations[currentLang || 'ar'];
    
    // 🛑 فحص الكوول داون محلياً قبل إرسال الطلب للسيرفر لتوفير الموارد
    let savedData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const now = Date.now();
    const lastMealTime = savedData.lastMealTime || 0;
    const fourHoursMs = 4 * 60 * 60 * 1000;

    if (now - lastMealTime < fourHoursMs) {
        const timeLeftMs = fourHoursMs - (now - lastMealTime);
        const hours = Math.floor(timeLeftMs / (1000 * 60 * 60));
        const minutes = Math.ceil((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));
        
        let timeMsg = '';
        if (hours > 0) {
            timeMsg = currentLang === 'en' ? `${hours}h ${minutes}m` : `${hours}س و ${minutes}د`;
        } else {
            timeMsg = currentLang === 'en' ? `${minutes}m` : `${minutes} دقيقة`;
        }
        
        showToast(`${t.meal_cooldown} ${timeMsg} ⏳`);
        return; // إيقاف العملية فوراً
    }

    // إظهار اللودينج على الزر لمنع الكبس المتكرر
    const btn = window.event ? window.event.target.closest('button') : null;
    let originalHtml = '';
    if (btn) {
        originalHtml = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        btn.disabled = true;
    }

    try {
        // نطلب الـ XP من السيرفر وننتظر قراره
        // ملاحظة: الـ actionType هنا 'meal' كما هو في Cloud Functions
        const secureXPCall = firebase.functions().httpsCallable('secureAddXP');
        const result = await secureXPCall({ actionType: 'meal', amount: 50 });

        if (result.data.xpAdded > 0) {
            // السيرفر وافق وتمت إضافة النقاط فعلياً
            showToast(`${t.meal_success} +50 XP 🥗`);
            updateQuestProgress('meal', 1);
            
            // تحديث الوقت المحلي والـ XP فوراً
            savedData.lastMealTime = Date.now(); 
            savedData.xp = (savedData.xp || 0) + 50;
            savedData.rank = Math.floor(savedData.xp / 500) + 1;
            savedData.maxXp = savedData.rank * 500;
            localStorage.setItem('currentUser', JSON.stringify(savedData));
            
            if (typeof renderUI === "function") renderUI(savedData);
            if (typeof updateStat === "function") {
                updateStat('meals', 1);
                updateStat('xpTotal', 50, true);
            }
        }
    } catch (e) {
        console.error("خطأ:", e.message);
        if (e.message.includes('cooldown')) {
            showToast(currentLang === 'en' ? "Please wait before logging again." : "انتظر قليلاً قبل التسجيل مجدداً.");
        } else {
            showToast(currentLang === 'en' ? "Error connecting to server" : "حدث خطأ في الاتصال");
        }
    } finally {
        if (btn) {
            btn.innerHTML = originalHtml;
            btn.disabled = false;
        }
    }
};




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
    
    // 🛡️ السحر هنا: قفل العدات لـ 25
    row.innerHTML = `
        <input type="text" name="exercise_name" list="smart-exercises" placeholder="${t.ex_name || 'التمرين'}" class="ex-name" spellcheck="false">
        <input type="number" name="exercise_reps" placeholder="${t.ex_reps || 'العدات'}" class="ex-reps" inputmode="numeric" oninput="if(this.value > 25) { this.value = 25; if(typeof showToast === 'function') showToast(currentLang === 'en' ? 'Max 25 reps allowed!' : 'الحد الأقصى للعدات هو 25!'); }">
        <input type="number" name="exercise_weight" placeholder="${t.ex_weight || 'الوزن'}" class="ex-weight" inputmode="decimal">
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
    let type = typeElement ? typeElement.innerText : '';
    
    // البحث في القاموسين لتفادي انهيار اللغة
    let template = workoutTemplates['ar'][type] || workoutTemplates['en'][type]; 

    if (!template) {
        // محاولة إيجاد الترجمة العكسية
        const t = translations[currentLang === 'en' ? 'ar' : 'en'];
        let reverseType = Object.keys(t).find(key => t[key] === type);
        if(reverseType) {
            let mappedKey = translations[currentLang][reverseType];
            template = workoutTemplates[currentLang][mappedKey];
        }
    }

    if (!template) return;

    const container = document.getElementById('exercises-container');
    container.innerHTML = ''; 

    template.forEach(exName => {
        addExerciseRow(); 
        const rows = container.querySelectorAll('.exercise-row');
        const lastRow = rows[rows.length - 1];
        if(lastRow) lastRow.querySelector('.ex-name').value = exName;
    });

    showToast(translations[currentLang].template_loaded);
};



let isSavingNormalWorkout = false; // 🔒 قفل لمنع الكبسة المزدوجة

async function saveWorkout() {
    if (isSavingNormalWorkout) return; // إذا الدالة شغالة، لا تقبل كبسة ثانية
    isSavingNormalWorkout = true;

    try {
        const rows = document.querySelectorAll('.exercise-row');
        let hasValidExercise = false;
        let exercises = [];
        const typeElement = document.getElementById('selected-workout-type');
        const typeText = typeElement ? typeElement.innerText : 'تمرين'; 
        
        let needsProof = false;
        let heavyWeight = 0;
        let heavyExerciseName = "";

        // تجميع التمارين وفحص الأوزان
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

                let threshold = 999;
                if (typeText.includes("صدر") || typeText.includes("Chest")) threshold = 60;
                if (typeText.includes("ظهر") || typeText.includes("Back")) threshold = 80;
                if (typeText.includes("أكتاف") || typeText.includes("Shoulders")) threshold = 50;
                if (typeText.includes("بايسبس") || typeText.includes("ترايسبس") || typeText.includes("Biceps") || typeText.includes("Triceps")) threshold = 50;
                if (typeText.includes("بطن") || typeText.includes("Core")) threshold = 80;
                if (typeText.includes("دفع") || typeText.includes("Push")) threshold = 70;
                if (typeText.includes("سحب") || typeText.includes("Pull")) threshold = 70;
                if (typeText.includes("أرجل") || typeText.includes("Legs")) threshold = 120;
                if (typeText.includes("شامل") || typeText.includes("Full Body")) threshold = 60;

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

        if (needsProof) {
            const t = translations[currentLang || 'ar']; 
            const confirmMsg = currentLang === 'en' 
                ? `💪 You are a beast!!\nYou lifted ${heavyWeight}kg in ${heavyExerciseName}!\nSince you broke the record, you must upload a video to prove your strength.\nReady to upload?`
                : `💪 إنت وحش!!\nشلت ${heavyWeight}kg بتمرين ${heavyExerciseName}!\nلأنك قطعت الدنيا، لازم ترفع فيديو يثبت قوتك عشان نعتمدلك الرقم ونحطه بالليدربورد.\nجاهز ترفع الفيديو؟`;

            const confirmProof = confirm(confirmMsg);
            if (!confirmProof) {
                showToast(t.cancel_upload); 
                return;
            }

            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = 'video/*';
            
            let isUploadingProof = false; // 🔒 قفل ثاني لمنع الرفع مرتين
            fileInput.onchange = async (e) => {
                if (isUploadingProof) return;
                const file = e.target.files[0];
                if(file) {
                    isUploadingProof = true;
                    if(file.size > 30 * 1024 * 1024) { 
                        showToast(t.video_size_error); 
                        isUploadingProof = false;
                        return;
                    }

                    closeWorkoutModal();
                    document.getElementById('workout-step-3').innerHTML = `
                        <div style="text-align:center; padding: 40px;">
                            <i class="fa-solid fa-spinner fa-spin fa-3x" style="color:var(--primary-color);"></i>
                            <p style="margin-top:20px; font-weight:bold; color:white;">${t.uploading_proof}</p>
                            <h1 id="upload-progress" style="color:var(--primary-color); font-size: 2.5rem; margin-top: 15px;">0%</h1>
                        </div>`;
                    document.getElementById('workout-modal').classList.add('active');

                    const user = auth.currentUser;
                    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
                    const videoRef = storage.ref(`proofs/${user.uid}_${Date.now()}_${cleanFileName}`);
                    
                    const uploadTask = videoRef.put(file);

                    uploadTask.on('state_changed', 
                        (snapshot) => {
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            const progressText = document.getElementById('upload-progress');
                            if (progressText) progressText.innerText = Math.round(progress) + '%';
                        }, 
                        (error) => {
                            closeWorkoutModal();
                            showToast(t.upload_fail_storage); 
                        }, 
                        async () => {
                            try {
                                const videoURL = await uploadTask.snapshot.ref.getDownloadURL();
                                let dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
                                
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

                                await db.collection('users').doc(user.uid).update({ isWorkoutPending: true });
                                
                                let savedData = JSON.parse(localStorage.getItem('currentUser'));
                                savedData.isWorkoutPending = true;
                                localStorage.setItem('currentUser', JSON.stringify(savedData));

                                closeWorkoutModal();
                                showToast(t.upload_success_wait); 
                            } catch (dbError) {
                                closeWorkoutModal();
                                showToast(t.save_db_error); 
                            }
                        }
                    );
                }
            };
            fileInput.click();
            return;
        }

        // الحفظ العادي بدون فيديو
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

        await updateQuestProgressBatch({ volume: totalVol, reps: totalReps, workout_days: 1 });
        // ⚔️ إضافة الوزن لمنافسة الفرق (للتمرين العادي)
        addVolumeToClanWar(totalVol);

        if (typeof updateStat === "function") {
            updateStat('workouts', 1);
            let highestWeight = 0;
            rows.forEach(row => {
                let w = parseFloat(row.querySelector('.ex-weight').value) || 0;
                if (w > highestWeight) highestWeight = w;
            });
            if (highestWeight > 0) {
                updateStat('maxWeight', highestWeight, true);
            }
        }

        const user = auth.currentUser;
        if (user) { 
            let savedData = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const todayStr = new Date().toDateString(); 
            const lastXpDate = savedData.lastWorkoutXpDate || "";

            if (lastXpDate === todayStr) {
                const now = new Date();
                const tomorrow = new Date(now);
                tomorrow.setHours(24, 0, 0, 0); 
                const timeLeftMs = tomorrow - now;
                const hours = Math.floor(timeLeftMs / (1000 * 60 * 60));
                const minutes = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));
                
                let timeMsg = currentLang === 'en' ? `${hours}h ${minutes}m` : `${hours} س و ${minutes} د`;
                db.collection('users').doc(user.uid).update({ workouts: workoutHistory });
                showToast(currentLang === 'en' ? `Workout Saved! XP resets in ${timeMsg}` : `تم حفظ التمرين! المكافأة تتجدد بعد ${timeMsg}`);
                
            } else {
                savedData.lastWorkoutXpDate = todayStr;
                localStorage.setItem('currentUser', JSON.stringify(savedData));

                db.collection('users').doc(user.uid).update({ 
                    workouts: workoutHistory,
                    lastWorkoutXpDate: todayStr 
                });

                if (typeof addXP === "function") await addXP(50, 'workout');
                showToast(currentLang === 'en' ? `Saved! +50 XP` : `تم الحفظ! +50 XP`);
            }
        } 

        closeWorkoutModal();

        if(document.getElementById('log-container')) {
            renderWorkoutLog();
            if(typeof initWorkoutChart === "function") setTimeout(initWorkoutChart, 200);
        }

    } finally {
        // فك القفل بعد ثانيتين لضمان عدم التكرار
        setTimeout(() => { isSavingNormalWorkout = false; }, 2000);
    }
}



window.addXP = async function(amount, actionType = 'game', securityToken = null, gameType = null) {
    const user = auth.currentUser;
    if (!user) return;

    if (actionType === 'game' && securityToken !== 'RGA_SECURE_998877') {
        return; 
    }

    try {
        const secureXPCall = firebase.functions().httpsCallable('secureAddXP');
        const result = await secureXPCall({ actionType: actionType, amount: amount, securityToken: securityToken, gameType: gameType });
        
        const xpAddedByServer = result.data.xpAdded;

        if (xpAddedByServer > 0) {
            let savedData = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const oldLevel = savedData.rank || 1;
            
            savedData.xp = (savedData.xp || 0) + xpAddedByServer;
            savedData.rank = Math.floor(savedData.xp / 500) + 1;
            savedData.maxXp = savedData.rank * 500;
            
            // حفظ وقت اللعبة محلياً عشان نمنعه يفوتها قبل الساعة
            if (actionType === 'game' && gameType) {
                if (gameType === 'deadlift') savedData.lastDeadliftTime = Date.now();
                if (gameType === 'squat') savedData.lastSquatTime = Date.now();
                savedData.lastGameXPTime = Date.now();
            }
            
            localStorage.setItem('currentUser', JSON.stringify(savedData));
            if (typeof renderUI === "function") renderUI(savedData);

            if (typeof updateStat === "function") {
                updateStat('xpTotal', savedData.xp, true);
                if (savedData.rank > oldLevel) updateStat('levelReach', savedData.rank, true);
            }

            if (savedData.rank > oldLevel) {
                setTimeout(() => {
                    const t = translations[currentLang || 'ar'];
                    if(typeof showToast === "function") showToast(`${t.level_up} ${savedData.rank}!`);
                }, 1200); 
            }
        }
    } catch (error) {
        console.error("تم رفض العملية من السيرفر:", error.message);
    }
};

function checkGameCooldown(gameType) {
    const data = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const now = Date.now();
    const lastPlayed = gameType === 'deadlift' ? (data.lastDeadliftTime || 0) : (data.lastSquatTime || 0);
    const lastAnyGame = data.lastGameXPTime || 0;
    const t = translations[currentLang || 'ar'];

    // 1. منع الدخول السريع جداً بين أي لعبتين (10 ثواني راحة للسيرفر)
    if (now - lastAnyGame < 10000) {
        const secsLeft = Math.ceil((10000 - (now - lastAnyGame)) / 1000);
        showToast(`${t.wait_setup} (${secsLeft}s)`);
        return false;
    }

    // 2. منع دخول نفس اللعبة قبل مرور ساعة (60 دقيقة = 3600000 ملي ثانية)
    const cooldownMs = 60 * 60 * 1000;
    if (now - lastPlayed < cooldownMs) {
        const timeLeftMs = cooldownMs - (now - lastPlayed);
        const minsLeft = Math.ceil(timeLeftMs / 60000);
        
        showToast(`${t.game_cooldown} ${minsLeft} ${currentLang === 'en' ? 'm' : 'دقيقة'} `);
        return false;
    }

    return true;
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
                    <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 15px;">
                        <h3 style="color: var(--primary-color); font-weight: 900; margin: 0;">
                            ${currentLang === 'en' ? 'Max Weight Progress' : 'تطور أعلى وزن'}
                        </h3>
                        <button onclick="showLineChartInfo()" style="background: none; border: none; color: var(--slate); cursor: pointer; font-size: 1.2rem; padding: 0;">
                            <i class="fa-solid fa-circle-info"></i>
                        </button>
                    </div>
                    <p id="chart-empty-msg" style="color: var(--slate); display: none; margin: 20px 0;">${t.empty_chart || 'لا توجد بيانات'}</p>
                    <div id="chart-wrapper" style="position: relative; height: 260px; width: 100%;">
                        <canvas id="workoutChart"></canvas>
                    </div>
                </div>


                <div class="stat-card glass-card" style="padding: 20px; text-align: center; margin-top: 20px;">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 5px;">
                        <h3 style="color: var(--primary-color); font-weight: 900; margin: 0;">
                          ${currentLang === 'en' ? 'Muscle Imbalance Radar' : 'رادار التوازن العضلي'}
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
                           ${currentLang === 'en' ? 'CNS Readiness (TSB)' : 'مؤشر الجاهزية العصبية'}
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



// نافذة شرح الشارت الخطي (تطور الأوزان)
function showLineChartInfo() {
    const isEn = currentLang === 'en';
    
    const title = isEn ? 'Max Weight Progress 📈' : 'تطور أعلى وزن 📈';
    
    const steps = isEn ? [
        " <b>What is this?</b> A visual tracker of your highest lifts across all muscle groups or workout splits.",
        " <b>How it works:</b> It scans your workout history and plots the absolute heaviest weight you've logged for each category.",
        " <b>The Goal:</b> Watch this line go up over time! It is the ultimate proof of your progressive overload and increasing strength."
    ] : [
        " <b>ما هذا؟</b> متتبع بصري يوضح أقوى رفعاتك في جميع العضلات أو الأنظمة التدريبية.",
        " <b>كيف يعمل؟</b> يقرأ أرشيف تمارينك ويرسم نقطة تمثل أعلى وزن (Max Weight) سجلته لكل فئة.",
        " <b>الهدف:</b> المراقبة المستمرة لضمان الزيادة التدريجية للأحمال (Progressive Overload). ارتفاع هذا الخط نحو الأعلى يعني أنك تزداد قوة يوماً بعد يوم!"
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
        <div class="modal-content glass-card" style="max-width:400px; padding:25px; border: 1px solid var(--primary-color); position: relative;">
            <h2 style="color:var(--primary-color); margin-bottom:20px; text-align:center;">${title}</h2>
            <ul style="color:var(--white); list-style:none; padding:0; font-size:0.9rem; line-height: 1.6;">${rulesHtml}</ul>
            <button class="btn-primary" onclick="this.parentElement.parentElement.remove()" style="width: 100%; margin-top: 20px; padding: 10px;">
                ${isEn ? 'Understood! Let\'s grow.' : 'علم، جاري التطور! '}
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
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

    let oldValue = savedData.stats[statName];
    if (typeof oldValue !== 'number') {
        if (statName === 'workouts' && Array.isArray(savedData.workouts)) {
            oldValue = savedData.workouts.length;
        } else {
            oldValue = 0;
        }
    }

    if (isMax) {
        if (value > oldValue) savedData.stats[statName] = value;
    } else {
        savedData.stats[statName] = oldValue + value;
    }

    localStorage.setItem('currentUser', JSON.stringify(savedData));
    
    // 🔥 بدلاً من الكتابة المباشرة، نرسلها للبوابة الآمنة في السيرفر
    firebase.functions().httpsCallable('secureSyncProgress')({ stats: savedData.stats })
        .catch(e => console.error("Error syncing stats:", e));
    
    checkBadges(savedData, user);
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
firebase.functions().httpsCallable('secureSyncProgress')({ earnedBadges: earned }).catch(e=>console.error(e));

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
// 👤 نظام البروفايل الشخصي والبايو مع الغلاف والأوسمة والإطارات
// ==========================================
let globalCountriesData = [];

async function openProfile() {
    if(window.innerWidth < 768) document.getElementById('sidebar').classList.add('collapsed');
    const area = document.getElementById('main-content-area');
    if (!area.dataset.originalContent) area.dataset.originalContent = area.innerHTML;

    // مسح كارد التحديات يدوياً من الشاشة
    const challengesCard = document.getElementById('home-challenges-card') || document.querySelector('div[onclick="openGameSelection()"]');
    if(challengesCard) challengesCard.style.display = 'none';

    const user = auth.currentUser;
    let data = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const t = translations[currentLang || 'ar'];

    const earnedCount = (data.earnedBadges || []).length;
    const bio = data.bio || t.bio_placeholder;
    const userPhoto = data.photoURL || "https://i.ibb.co/9mPmHXkh/cropped-circle-image-2.png";

    // --- كود غلاف البروفايل ---
    const activeCover = data.currentCover || '';
    const coverHtml = activeCover ? `<div class="profile-cover-image" style="background-image: url('${activeCover}');"></div>` : '';

    // --- الإطارات والألقاب ---
    const activeBorder = data.currentBorder || '';
    const activeTitle = data.currentTitle || '';
    
    // --- 🛠️ الأوسمة المحققة ---
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

    // تجهيز كود اللقب الفخم للبروفايل
    let titleHTML = '';
    if(activeTitle && typeof storeItemsDB !== 'undefined') {
        const foundTitle = storeItemsDB.titles.find(t => t.val === activeTitle || t.val_en === activeTitle);
        if(foundTitle) {
            const isEn = currentLang === 'en';
            const displayTitle = isEn ? foundTitle.val_en : foundTitle.val;
            
            const badgeContent = isEn 
                ? `<i class="${foundTitle.icon}"></i> <span>${displayTitle}</span>`
                : `<span>${displayTitle}</span> <i class="${foundTitle.icon}"></i>`;
            
            titleHTML = `
                <div class="title-badge ${foundTitle.tier}" style="margin-top: 10px; margin-bottom: 5px; transform: scale(1.15);">
                    ${badgeContent}
                </div>`;
        }
    }

    // بناء الواجهة كاملة
    area.innerHTML = `
        <header class="top-bar" style="margin-bottom: 15px;">
            <div class="header-row">
                <button id="back-to-dash-btn" class="btn-primary" style="padding: 5px 15px;">${t.back}</button>
                <h1 style="margin: 0 15px;"> ${t.profile_btn.replace(' ', '')}</h1>
            </div>
        </header>

        <section class="profile-header has-cover" style="position: relative; overflow: hidden; padding-top: ${activeCover ? '0' : '30px'}; margin-bottom: 25px; border-radius: 30px; background: linear-gradient(180deg, rgba(0, 242, 167, 0.1) 0%, transparent 100%);">
            ${coverHtml}
            <div class="profile-header-content" style="position: relative; z-index: 2; width: 100%; display: flex; flex-direction: column; align-items: center; padding-top: ${activeCover ? '80px' : '0'};">
                
                <!-- الحل الجذري لمنع الرمشة في البروفايل الشخصي -->
                <!-- الحل الجذري لمنع الرمشة في البروفايل الشخصي -->
                <div class="avatar-pro-wrapper ${activeBorder}" style="margin-bottom: 15px;">
                    <div id="profile-page-avatar" class="profile-avatar-img" style="background-color: var(--secondary-color); background-image: url('${userPhoto}'); ${activeBorder ? '' : 'border: 4px solid var(--primary-color);'}"></div>
                </div>

                <h2 style="color: white; font-weight: 900; margin-top: 5px; margin-bottom: 2px;">${data.firstName || ''} ${data.lastName || ''}</h2>
                
                <!-- ⚔️ اللقب الفخم يظهر هنا ⚔️ -->
                ${titleHTML}

                <div class="bio-container" style="margin-top: 15px;">
                    <p id="display-bio" class="bio-text">"${bio}"</p>
              <p id="display-location" style="color: var(--primary-color); font-size: 0.85rem; font-weight: bold; margin-bottom: 5px;">
    📍 ${data.country || t.undefined_country} - ${data.city || t.undefined_city}
</p>
<p id="display-gym" style="color: var(--slate); font-size: 0.8rem; margin-bottom: 15px;">
    <i class="fa-solid fa-dumbbell"></i> ${data.gym || t.no_gym}
</p>

                    
                    <button id="edit-bio-btn" class="btn-primary" style="padding: 5px 15px; font-size: 0.8rem; background: transparent; border-color: var(--slate); color: var(--slate);">${t.edit_bio}</button>
                    
                    <div id="bio-edit-area" style="display: none; margin-top: 15px; width: 100%; max-width: 400px; margin-left: auto; margin-right: auto;">
                        <textarea id="bio-input" maxlength="100" style="width:100%; min-height:60px; margin-bottom: 10px; font-family: var(--font-main); padding: 10px; border-radius: 8px; background: rgba(0,0,0,0.3); color: white; border: 1px solid var(--slate);">${bio === t.bio_placeholder ? '' : bio}</textarea>
                        
                        <input type="text" id="gym-input" class="input-field" placeholder="اسم النادي الذي تتمرن فيه (اختياري)" value="${data.gym || ''}" style="margin-bottom: 10px; padding: 10px; text-align: center;">

                        <div class="location-inputs" style="display: flex; gap: 10px; margin-bottom: 10px;">
                            <select id="country-select" class="custom-select" style="flex: 1;">
                                <option value="">${t.country_select}</option>
                            </select>
                            <select id="city-select" class="custom-select" style="flex: 1;" disabled>
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

        <h3 style="margin-top: 20px; color: #8892b0; margin-bottom: 15px; font-size: 0.9rem;">${currentLang === 'en' ? 'Settings & Help' : 'الإعدادات والمساعدة'}</h3>

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
    


    // ... (باقي الكود يظل كما هو للأزرار والـ Event Listeners) ...
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
          displayLocation.innerText = `📍 ${newCountry || t.undefined_country} - ${newCity || t.undefined_city}`;
displayGym.innerHTML = `<i class="fa-solid fa-dumbbell"></i> ${newGym || t.no_gym}`;

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

let friendsListener = null;

// 1. دالة عرض الأصدقاء (لحظية - Real-time)
async function renderMyFriends() {
    const list = document.getElementById('my-friends-list');
    if (!list) return;
    const t = translations[currentLang || 'ar'];
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    list.innerHTML = `<div style="text-align:center; padding: 40px;"><i class="fa-solid fa-spinner fa-spin fa-2x" style="color:var(--primary-color);"></i></div>`;

    if (friendsListener) friendsListener(); // تنظيف المستمع القديم

    friendsListener = db.collection('users').doc(currentUser.uid).onSnapshot(async (doc) => {
        if (!doc.exists) return;
        let myFriends = doc.data().myFriendsList || []; // إذا لم تكن موجودة، اعتبرها فارغة

        if (myFriends.length === 0) {
            list.innerHTML = `
                <div class="empty-notif" style="margin-top: 30px;">
                    <i class="fa-solid fa-user-group" style="font-size: 3.5rem; opacity: 0.15; color: var(--slate);"></i>
                    <p style="margin-top: 15px; font-size: 1.1rem; color: white;">${t.no_friends_yet}</p>
                    <p style="font-size: 0.85rem; color: var(--slate); max-width: 250px; text-align: center;">${t.search_heroes_msg}</p>
                </div>`;
            return;
        }

        try {
            const friendsDataPromises = myFriends.map(async (friend) => {
                try {
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
                                        <h4>${freshName.replace(/</g, "&lt;")}</h4>
                                        <p>Level ${freshLevel} 🔥</p>
                                    </div>
                                </div>
                                <div class="friend-actions">
                                    <button class="chat-action-btn" onclick="openChat('${friend.id}', '${freshName.replace(/</g, "&lt;")}', '${freshImg}')">
                                        <i class="fa-solid fa-message"></i> ${t.chat_btn}
                                    </button>
                                    <button class="delete-friend-btn" onclick="deleteFriend('${friend.id}')">
                                        <i class="fa-solid fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        `;
                    }
                } catch(e) { return ''; }
                return '';
            });

            const friendsResults = await Promise.all(friendsDataPromises);
            list.innerHTML = friendsResults.join('');

        } catch (error) {
            list.innerHTML = `<p style="text-align:center; color:#ff4d4d;">حدث خطأ</p>`;
        }
    });
}

// 2. دالة قبول الصداقة (سريعة جداً)
window.acceptFriendRequest = async function(notifId, senderId, senderName, senderPhoto) {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
        const notifElement = document.getElementById(notifId);
        if (notifElement) notifElement.remove(); // إخفاء من الشاشة فوراً لسرعة الاستجابة

        const acceptCall = firebase.functions().httpsCallable('secureAcceptFriend');
        await acceptCall({ senderId, senderName, senderPhoto, notifId });

        showToast(currentLang === 'en' ? "Friend request accepted! 🤝" : "تم قبول الصداقة! 🤝");
    } catch (error) {
        console.error(error);
        showToast(currentLang === 'en' ? "Error accepting request" : "حدث خطأ أثناء قبول الطلب");
    }
};

// 3. دالة المتصدرين (منعنا التعليق بفصل المهمة عن العرض)
async function loadLeaderboardData() {
    const listDiv = document.getElementById('leaderboard-list');
    if (!listDiv) return;
    
    setTimeout(() => {
        if(typeof updateQuestProgress === 'function') updateQuestProgress('leaderboard', 1);
    }, 1000);

    try {
        const snapshot = await db.collection('users').orderBy('xp', 'desc').limit(50).get();
        listDiv.innerHTML = ''; 
        let rank = 0;
        
        snapshot.forEach((doc) => {
            rank++;
            const data = doc.data();
            const rankEmoji = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `<b>#${rank}</b>`;
            const userPhoto = data.photoURL || 'https://i.ibb.co/9mPmHXkh/cropped-circle-image-2.png';
            const safeName = (data.firstName || 'Player').replace(/</g, "&lt;");
            
            const row = document.createElement('div');
            const borderSide = currentLang === 'ar' ? 'border-right' : 'border-left';
            row.style.cssText = `display: flex; justify-content: space-between; align-items: center; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 12px; ${borderSide}: 4px solid ${rank <= 3 ? 'var(--primary-color)' : 'transparent'}; transition: 0.3s;`;

            const userLevel = data.rank || Math.floor((data.xp || 0) / 500) + 1;
            const lvlText = currentLang === 'en' ? 'Lvl' : 'مستوى';
            
            row.innerHTML = `
                <div style="display: flex; align-items: center; gap: 15px; cursor: pointer;" onclick="viewPlayerProfile('${doc.id}')">
                    <span style="font-size: 1.2rem; min-width: 30px; text-align: center;">${rankEmoji}</span>
                    <img src="${userPhoto}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
                    <span style="font-weight: 700; color: white;">${safeName}</span>
                </div>
                <div style="text-align: right; direction: ltr; display: flex; flex-direction: column; align-items: flex-end;">
                    <span style="color: var(--primary-color); font-weight: 900; font-size: 1.1rem; letter-spacing: 0.5px; direction: rtl;">${lvlText} ${userLevel}</span>
                    <span style="color: var(--slate); font-size: 0.8rem; font-weight: 600; margin-top: -2px;">${data.xp || 0} XP</span>
                </div>
            `;
            listDiv.appendChild(row);
        });
    } catch (err) {
        listDiv.innerHTML = `<p style="text-align:center; color:#ff4d4d; padding:20px;">حدث خطأ</p>`;
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
        // سحب بيانات اللاعب الهدف من قاعدة البيانات
        const doc = await db.collection('users').doc(targetUid).get();
        if (!doc.exists) { modal.style.display = 'none'; return; }
        
        const data = doc.data();
        const earnedCount = (data.earnedBadges || []).length;
        const bio = data.bio || "💪";
        const userPhoto = data.photoURL || "https://i.ibb.co/9mPmHXkh/cropped-circle-image-2.png";
        
        // --- 1. سحب الغلاف الخاص باللاعب ---
        const activeCover = data.currentCover || '';
        const coverHtml = activeCover ? `<div class="profile-cover-image" style="background-image: url('${activeCover}');"></div>` : '';

        // --- 2. سحب إطار (الهالة) الخاص باللاعب ---
        const activeBorder = data.currentBorder || '';

        // --- 3. سحب اللقب (Title) الخاص باللاعب وتجهيزه ---
        const activeTitle = data.currentTitle || '';
        let titleHTML = '';
        if(activeTitle && typeof storeItemsDB !== 'undefined') {
            const foundTitle = storeItemsDB.titles.find(t => t.val === activeTitle || t.val_en === activeTitle);
            if(foundTitle) {
                const isEn = currentLang === 'en';
                const displayTitle = isEn ? foundTitle.val_en : foundTitle.val;
                
                // تحديد الاتجاه حسب اللغة
                const badgeContent = isEn 
                    ? `<i class="${foundTitle.icon}"></i> <span>${displayTitle}</span>`
                    : `<span>${displayTitle}</span> <i class="${foundTitle.icon}"></i>`;
                
                titleHTML = `
                    <div class="title-badge ${foundTitle.tier}" style="margin-top: 10px; margin-bottom: 5px; transform: scale(1.15);">
                        ${badgeContent}
                    </div>`;
            }
        }

        // --- 4. الأوسمة المحققة ---
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

        // --- 5. بناء واجهة بروفايل اللاعب (مع الإطار واللقب والغلاف) ---
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
                        


                        <div class="avatar-pro-wrapper ${activeBorder}" style="margin-bottom: 15px;">
                            <div id="friend-page-avatar" class="profile-avatar-img" style="background-color: var(--secondary-color); background-image: url('${userPhoto}'); ${activeBorder ? '' : 'border: 4px solid var(--primary-color);'}"></div>
                        </div>


                        <h2 style="color: white; font-weight: 900; margin-top: 5px; margin-bottom: 2px;">${data.firstName || ''} ${data.lastName || ''}</h2>
                        
                        ${titleHTML}
                        
                        <div class="bio-container" style="margin-top: 10px;">
                            <p class="bio-text">"${bio}"</p>
                        <p style="color: var(--primary-color); font-size: 0.85rem; font-weight: bold; margin-bottom: 5px;">
    📍 ${data.country || t.undefined_country} - ${data.city || t.undefined_city}
</p>
<p style="color: var(--slate); font-size: 0.8rem; margin-bottom: 15px;">
    <i class="fa-solid fa-dumbbell"></i> ${data.gym || t.no_gym}
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






    } catch (error) { modal.style.display = 'none'; console.error(error); }
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
          // 2. تحديث الجرس
          badge.style.display = 'flex';
          badge.innerText = snapshot.size;

          // 🛡️ الحل السحري: فحص إذا كان التغيير هو "إضافة إشعار جديد" فقط!
          let hasNew = false;
          snapshot.docChanges().forEach(change => {
              if (change.type === 'added') hasNew = true;
          });

          if (!isInitialLoad && hasNew) {
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

              } else if (notif.type === 'clan_broadcast') {
                  // 🚨 إضافة تصميم الإشعار الخاص بنداء العصابة (اللاسلكي)
                  body.insertAdjacentHTML('beforeend', `
                      <div class="notif-item" id="${notifId}" style="background: rgba(255, 77, 77, 0.05); border-left: 3px solid #ff4d4d;">
                          <div class="notif-icon" style="background: transparent; font-size: 1.5rem; color: #ff4d4d;"><i class="fa-solid fa-satellite-dish"></i></div>
                          <div class="notif-content">
                              <p style="color: #ff4d4d; font-weight: bold; font-size: 0.85rem;"><strong>${notif.senderName}</strong></p>
                              <p style="font-size: 0.85rem; color: white; line-height: 1.5; margin-top: 5px; white-space: normal;">"${notif.text}"</p>
                              <div class="notif-actions" style="margin-top: 10px;">
                                  <button class="accept-btn" style="width: 100%; background: rgba(255,77,77,0.1); color: #ff4d4d; border: 1px solid #ff4d4d;" onclick="dismissNotif('${notifId}')">${currentLang === 'en' ? 'Understood' : 'علم'}</button>
                              </div>
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
<button class="accept-btn" style="background: #ff4d4d; color: white; width: 100%;" onclick="triggerProofUpload('${notifId}')">${translations[currentLang].upload_now}</button>

                              </div>
                          </div>
                      </div>`);

              } else if (notif.type === 'system_reward') {
                  // 🚨 هذا هو كود الإشعار الذي كان مفقوداً ويسبب ظهور شاشة بيضاء
                  body.insertAdjacentHTML('beforeend', `
                      <div class="notif-item" id="${notifId}" style="background: rgba(255, 215, 0, 0.1); border-left: 3px solid #FFD700;">
                          <div class="notif-icon" style="background: transparent; font-size: 1.8rem; color: #FFD700; display:flex; align-items:center; justify-content:center;">
                              <i class="fa-solid fa-gem"></i>
                          </div>
                          <div class="notif-content">
                              <p style="color: #FFD700; font-weight: 900; font-size: 0.9rem;">${notif.title}</p>
                              <p style="font-size: 0.85rem; color: white; margin-top: 4px; line-height: 1.4;">${notif.text}</p>
                              <div class="notif-actions" style="margin-top: 10px;">
                                  <button class="accept-btn" style="width: 100%; background: rgba(255,215,0,0.2); color: #FFD700; border: 1px solid #FFD700;" onclick="dismissNotif('${notifId}')">${currentLang === 'en' ? 'Awesome!' : 'عاش يا وحش!'}</button>
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

// ==========================================
// 🧹 مسح جميع الإشعارات بضربة واحدة
// ==========================================
window.clearAllNotifications = async function() {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    
    try {
        const notifRef = db.collection('users').doc(currentUser.uid).collection('notifications');
        const snapshot = await notifRef.get(); 
        
        if (snapshot.empty) {
            showToast(currentLang === 'en' ? "No notifications to clear!" : "لا توجد إشعارات لمسحها!");
            return;
        }

        // مسح الإشعارات دفعة واحدة لتوفير استهلاك الفايربيس
        const batch = db.batch();
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref); 
        });
        
        await batch.commit();
        showToast(currentLang === 'en' ? "All notifications cleared!" : "تم مسح جميع الإشعارات!");
        
        // إغلاق قائمة الإشعارات بعد المسح
        const dropdown = document.getElementById('notif-dropdown');
        if (dropdown) dropdown.classList.remove('show');
        
    } catch (error) {
        console.error("خطأ في مسح الإشعارات:", error);
    }
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
// 🔍 نظام البحث والانضمام للعصابات
// ==========================================

window.joinGuildByTag = async function() {
    const tagInput = document.getElementById('search-guild-tag').value.trim().toUpperCase();
    const t = translations[currentLang || 'ar'];
    
    if (tagInput.length < 2) {
        showToast(currentLang === 'en' ? "Enter a valid tag!" : "أدخل رمزاً صحيحاً!");
        return;
    }

    const btn = event.target.closest('button');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

    try {
        // البحث في قاعدة البيانات عن الرمز (Tag)
        const snapshot = await db.collection('clans').where('tag', '==', tagInput).get();
        
        if (snapshot.empty) {
            showToast(currentLang === 'en' ? "Clan not found!" : "لم يتم العثور على العصابة!");
            btn.disabled = false;
            btn.innerHTML = originalText;
            return;
        }

        // جلب بيانات العصابة
        const clanDoc = snapshot.docs[0];
        const clan = clanDoc.data();
        const clanId = clanDoc.id;
        
        // عرض شاشة (معاينة العصابة) قبل الانضمام
        renderClanPreview(clan, clanId, t);
        
    } catch (e) {
        console.error(e);
        showToast(currentLang === 'en' ? "Search failed!" : "فشل البحث!");
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
};

// 🌟 شاشة معاينة العصابة (تظهر بعد البحث الناجح)
function renderClanPreview(clan, clanId, t) {
    const area = document.getElementById('guild-content-area');
    const membersCount = clan.members ? clan.members.length : 0;
    const isFull = membersCount >= 50; // الحد الأقصى 50 عضو
    
    area.innerHTML = `
        <div class="guild-action-container" style="justify-content: center; animation: fadeIn 0.4s;">
            <div class="mythic-card-epic" style="max-width: 400px; width: 100%;">
                <i class="${clan.emblem || 'fa-solid fa-dragon'} main-icon" style="color: #FFD700; font-size: 4rem;"></i>
                <h2 style="color: white; font-weight: 900; margin: 15px 0;">${clan.name} <span class="guild-tag-badge">#${clan.tag}</span></h2>
                
                <div style="background: rgba(0,0,0,0.3); border-radius: 12px; padding: 20px; margin: 25px 0; display: flex; justify-content: space-around; border: 1px solid rgba(255,255,255,0.05);">
                    <div style="text-align: center;">
                        <i class="fa-solid fa-users" style="color: #00f2a7; font-size: 1.8rem; margin-bottom: 8px;"></i>
                        <div style="color: white; font-weight: 900; font-size: 1.2rem;">${membersCount} / 50</div>
                        <div style="color: var(--slate); font-size: 0.85rem;">${currentLang === 'en' ? 'Members' : 'الأعضاء'}</div>
                    </div>
                    <div style="text-align: center;">
                        <i class="fa-solid fa-trophy" style="color: #FFD700; font-size: 1.8rem; margin-bottom: 8px;"></i>
                        <div style="color: white; font-weight: 900; font-size: 1.2rem;">${clan.stats?.wins || 0}</div>
                        <div style="color: var(--slate); font-size: 0.85rem;">${currentLang === 'en' ? 'Wins' : 'الانتصارات'}</div>
                    </div>
                </div>

                ${isFull 
                    ? `<p style="color: #ff4d4d; font-weight: bold; margin-bottom: 15px;">${currentLang === 'en' ? 'Clan is full!' : 'العصابة ممتلئة!'}</p>
                       <button class="btn-epic-premium btn-epic-gold" style="background: rgba(255,255,255,0.1); border-color: gray; color: gray;" onclick="openGuildHub()">
                           <i class="fa-solid fa-arrow-right"></i> ${t.back || 'رجوع'}
                       </button>`
                    : `<div style="display: flex; gap: 10px;">
                           <button class="btn-epic-premium btn-epic-neon" style="flex: 2;" onclick="confirmJoinGuild('${clanId}')">
                               <i class="fa-solid fa-check"></i> ${currentLang === 'en' ? 'Confirm Join' : 'تأكيد الانضمام'}
                           </button>
                           <button class="btn-epic-premium" style="flex: 1; background: rgba(255,77,77,0.1); border: 2px solid #ff4d4d; color: #ff4d4d;" onclick="openGuildHub()">
                               <i class="fa-solid fa-xmark"></i>
                           </button>
                       </div>`
                }
            </div>
        </div>
    `;
}

// ⚔️ دالة تأكيد الانضمام النهائية
window.confirmJoinGuild = async function(clanId) {
    const btn = event.target.closest('button');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

    try {
        const user = auth.currentUser;
        let userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
        
        // التحقق من أن العصابة لم تمتلئ في هذه اللحظة
        const clanRef = db.collection('clans').doc(clanId);
        const docSnap = await clanRef.get();
        
        if (!docSnap.exists) throw new Error("Clan deleted");
        
        let clanData = docSnap.data();
        if (clanData.members.length >= 50) {
            showToast(currentLang === 'en' ? "Clan is full!" : "العصابة ممتلئة!");
            openGuildHub();
            return;
        }
        
        // التحقق إذا كان اللاعب في عصابة مسبقاً
        if (userData.clanId) {
            showToast(currentLang === 'en' ? "You are already in a clan!" : "أنت في عصابة بالفعل!");
            return;
        }

        // إضافة اللاعب للعصابة
        const newMember = {
            uid: user.uid,
            name: userData.firstName || 'Unknown',
            role: 'member',
            warReady: true,
            xp: userData.xp || 0
        };

        clanData.members.push(newMember);
        await clanRef.update({ members: clanData.members });
        
        // تحديث بيانات اللاعب في الداتا بيز والمحلي
        userData.clanId = clanId;
        await db.collection('users').doc(user.uid).update({ clanId: clanId });
        localStorage.setItem('currentUser', JSON.stringify(userData));

        showToast(currentLang === 'en' ? "Successfully joined!" : "تم الانضمام بنجاح!");
        openGuildHub(); // سيعيد تحميل الشاشة ليفتح لك غرفة العصابة من الداخل
        
    } catch (e) {
        console.error(e);
        showToast(currentLang === 'en' ? "Error joining clan!" : "خطأ في الانضمام!");
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
};


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

// ==========================================
// 🗺️ فتح خريطة وحش المدينة (النسخة المستقرة)
// ==========================================
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
            <div class="header-row" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                
                <!-- القسم الأول: زر الرجوع واسم الصفحة -->
                <div style="display: flex; align-items: center; gap: 10px;">
                    <button id="back-to-dash-btn" class="btn-primary" style="padding: 5px 15px; font-size: 0.9rem;">${t.back}</button>
                    <h1 style="margin: 0; font-weight: 900; color: #FFD700; display: flex; align-items: center; gap: 8px; font-size: 1.2rem;">
                        ${t.city_monster} <i class="fa-solid fa-crown"></i>
                    </h1>
                </div>
                
                <!-- القسم الثاني: زر المساعدة فقط (شلنا أيقونة المقبرة من هون) -->
                <div style="display: flex; gap: 12px; align-items: center;">
                    <button onclick="showMonsterRules()" style="background:none; border:none; color:var(--primary-color); cursor:pointer; font-size:1.2rem;">
                        <i class="fa-solid fa-circle-question"></i>
                    </button>
                </div>

            </div>
        </header>

        <section class="performance-container" style="animation: fadeIn 0.5s;">
            <div class="performance-tabs" style="display: flex; gap: 10px; margin-bottom: 15px; background: rgba(255,255,255,0.05); padding: 5px; border-radius: 12px;">
                <button class="perf-tab-btn active-tab" onclick="changeMapFilter('maxWeight', this)">${t.map_weights}</button>
                <button class="perf-tab-btn" onclick="changeMapFilter('streak', this)">${t.map_streak}</button>
                <button class="perf-tab-btn" onclick="changeMapFilter('level', this)">${t.map_level}</button>
            </div>

            <!-- 🚨 السحر هنا: دمجنا الكبسة الفخمة بجانب اختيار المدينة 🚨 -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; background: rgba(0,0,0,0.3); padding: 10px 15px; border-radius: 15px; border: 1px solid rgba(255,77,77,0.2);">
                <select id="map-city-select" class="custom-select" style="width: 55%; padding: 8px; font-weight: bold; font-size: 0.9rem; border-color: var(--primary-color);">
                    <option value="${userCity}">📍 ${userCity} ${t.my_city}</option>
                </select>
                
                <!-- كبسة المقبرة الجديدة -->
                <button class="grave-enter-btn" onclick="openValhalla()">
                    <i class="fa-solid fa-skull"></i> ${t.valhalla_btn || 'المقبرة'}
                </button>
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

    populateMapCitiesDropdown(userCountry, userCity);

    document.getElementById('map-city-select').addEventListener('change', (e) => {
        loadCityMapData(e.target.value, userCountry);
    });

    currentMapFilter = 'maxWeight'; 
    loadCityMapData(userCity, userCountry);
}




// دالة رسم الصفوف في المقبرة (مترجمة بالكامل)
function renderGraveyardRows(dataArray) {
    const listDiv = document.getElementById('valhalla-list');
    const t = translations[currentLang || 'ar'];
    const visitTxt = currentLang === 'en' ? 'VISIT' : 'زيارة';

    if(dataArray.length === 0) {
        listDiv.innerHTML = `<p style="text-align:center; color:var(--slate); padding:20px;">لا يوجد تطابق في السجلات.</p>`;
        return;
    }

    listDiv.innerHTML = dataArray.map(data => `
        <div class="grave-record-table grave-item-filter">
            <!-- خلية الصورة -->
            <div class="grave-avatar-cell">
                <img src="${data.kingPhoto}">
            </div>
            
            <!-- خلية التفاصيل -->
            <div class="grave-details-cell">
                <div class="grave-name-title">
                    <h3 class="search-target-name">${data.kingName}</h3>
                    <span>Fallen ${data.rankLost || 'Legend'}</span>
                </div>
                
                <div class="grave-data-grid">
                    <div class="grave-data-row">
                        <div class="grave-data-label">${t.grave_time_death}</div>
                        <div class="grave-data-val" style="direction: ltr;">${data.date}</div>
                    </div>
                    <div class="grave-data-row">
                        <div class="grave-data-label">${t.grave_old_record}</div>
                        <div class="grave-data-val" style="direction: ltr;">${data.weight} kg</div>
                    </div>
                    <div class="grave-data-row">
                        <div class="grave-data-label" style="color: #ff4d4d;">${t.grave_assassin}</div>
                        <div class="grave-data-val search-target-slayer" style="color: #00f2a7; font-weight: bold; direction: ltr;">${data.slayerName} (${data.slayerWeight}kg)</div>
                    </div>
                </div>
            </div>
            
            <!-- زر الزيارة الجديد الذي يفتح صفحة القبر -->
            <div class="grave-visit-cell" onclick="openGraveVisit('${data.id}')">
                ${visitTxt}
            </div>
        </div>
    `).join('');
}

// ==========================================
// 🪦 نظام زيارة القبر (Grave Visit System)
// ==========================================



// ==========================================
// 🪦 نظام زيارة القبر (النسخة الأسطورية الفخمة RPG)
// ==========================================

// ==========================================
// 🪦 نظام زيارة القبر (النسخة الحقيقية المربوطة بالداتابيس)
// ==========================================
let selectedGraveAction = 'respect'; 
let currentGraveListener = null; // لايقاف استماع التعليقات القديمة

window.openGraveVisit = function(graveId) {
    const graveData = window.valhallaData.find(g => g.id === graveId);
    if (!graveData) return;

    const mainContent = document.getElementById('main-content-area');
    const t = translations[currentLang || 'ar'];

    selectedGraveAction = 'respect';

    const bgImages = [
        'Photos/dead1.png',

    ];
    const randomBg = bgImages[Math.floor(Math.random() * bgImages.length)];

    mainContent.innerHTML = `
        <header class="top-bar" style="margin-bottom: 15px;">
            <div class="header-row" style="display: flex; align-items: center; gap: 10px;">
                <button onclick="openValhalla()" class="btn-primary" style="padding: 5px 15px; font-size: 0.9rem; background: rgba(255, 77, 77, 0.1); color: #ff4d4d; border-color: #ff4d4d;">${t.back}</button>
                <h1 style="margin: 0; font-weight: 900; color: #ff4d4d; font-size: 1.2rem; text-shadow: 0 0 10px rgba(255,77,77,0.5);">${graveData.kingName}</h1>
            </div>
        </header>

        <section class="performance-container" style="animation: fadeIn 0.5s; padding: 0;">
            
            <div style="position: relative; width: 100%; height: 250px; background: url('${randomBg}') center/cover; border: 2px solid #330000; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; overflow: hidden; margin-bottom: 20px; box-shadow: inset 0 0 60px #000, 0 10px 20px rgba(0,0,0,0.8);">
                <div style="position: absolute; top:0; left:0; width:100%; height:100%; background: linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.9));"></div>
                <p style="position: relative; color: #8892b0; font-size: 0.85rem; margin: 0; text-transform: uppercase; letter-spacing: 2px;">${t.grave_here_lies}</p>
                <h2 style="position: relative; color: white; font-weight: 900; font-size: 2.5rem; margin: 5px 0; text-shadow: 0 5px 15px rgba(0,0,0,0.9);">${graveData.kingName}</h2>
                <div style="position: relative; background: rgba(0,0,0,0.6); padding: 5px 15px; border-radius: 50px; border: 1px solid #440000; margin-top: 5px;">
                    <p style="color: #ccc; font-size: 0.75rem; margin: 0;">${t.grave_fell_on} <span style="color:white; font-weight:bold;">${graveData.date}</span></p>
                </div>
                <p style="position: relative; color: #ff4d4d; font-size: 0.95rem; margin-top: 15px; font-weight: bold; text-shadow: 0 0 10px #ff4d4d;">⚔️ ${t.grave_crushed_by} ${graveData.slayerName} ⚔️</p>
            </div>

            <!-- شريط طاقة القبر الديناميكي -->
            <div class="glass-card" style="padding: 0; border: 1px solid #330000; margin-bottom: 20px; overflow: hidden;">
                <div style="background: linear-gradient(to right, #2a0808, #0a0a0a); padding: 12px; text-align: center; color: white; font-weight: 900; border-bottom: 1px solid #333;">${t.grave_condition}</div>
                <div style="display: flex; padding: 15px; justify-content: space-between; align-items: center; background: #0a0a0a;">
                    <span style="color: #8892b0; font-size: 0.9rem; font-weight: bold;">${t.grave_condition_label}</span>
                    <span id="grave-dynamic-status" style="color: #8892b0; font-size: 0.9rem; font-weight: bold;">جاري تحليل السجلات...</span>
                </div>
                
                <div style="display: flex; height: 18px; background: #222; border-top: 1px solid #333;">
                    <div id="grave-bar-respect" style="width: 50%; background: linear-gradient(90deg, #008f63, #00f2a7); display: flex; align-items: center; justify-content: center; font-size: 0.7rem; color: #000; font-weight: 900; transition: width 0.5s ease;">50%</div>
                    <div id="grave-bar-deface" style="width: 50%; background: linear-gradient(90deg, #8b0000, #ff4d4d); display: flex; align-items: center; justify-content: center; font-size: 0.7rem; color: white; font-weight: 900; transition: width 0.5s ease;">50%</div>
                </div>
            </div>

            <div class="glass-card" style="padding: 0; border: 1px solid #222;">
                <div style="background: #111; padding: 12px; text-align: center; color: var(--primary-color); font-weight: 900; border-bottom: 1px solid #222;">
                    <i class="fa-solid fa-book-skull"></i> ${t.grave_leave_comment}
                </div>
                
                <div style="padding: 15px;">
                    <textarea id="grave-comment-input" placeholder="..." style="width: 100%; height: 80px; background: rgba(0,0,0,0.5); border: 1px solid #444; border-radius: 8px; padding: 12px; color: white; font-family: var(--font-main); resize: none; margin-bottom: 15px; outline: none;"></textarea>
                    
                    <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                        <button id="btn-respect" class="grave-action-btn active" onclick="selectGraveAction('respect')">
                            <i class="fa-solid fa-seedling"></i> ${t.grave_place_flowers}
                        </button>
                        <button id="btn-deface" class="grave-action-btn" onclick="selectGraveAction('deface')">
                            <i class="fa-solid fa-skull"></i> ${t.grave_deface}
                        </button>
                    </div>

                    <button id="submit-comment-btn" class="btn-primary" style="width: 100%; padding: 12px; font-size: 1rem; box-shadow: 0 0 15px rgba(0,242,167,0.2);" onclick="submitGraveComment('${graveId}')">${t.grave_btn_comment}</button>
                </div>
                
                <div style="background: #111; padding: 10px; text-align: center; color: white; font-weight: bold; border-top: 1px solid #333; border-bottom: 1px solid #333;">
                    ${t.grave_comments_title}
                </div>
                
                <div id="grave-comments-list" style="padding: 15px; display: flex; flex-direction: column; gap: 12px; background: #0a0a0a;">
                    <div style="text-align:center; padding: 20px;"><i class="fa-solid fa-spinner fa-spin" style="color:var(--primary-color);"></i></div>
                </div>
            </div>
        </section>
    `;


    // 🔥 جلب التعليقات الحقيقية وتحديث العدادات (Real-time) - النسخة المصححة
    if (currentGraveListener) currentGraveListener();

    currentGraveListener = db.collection('fallen_kings').doc(graveId).collection('comments')
        .onSnapshot(snapshot => {
            const listDiv = document.getElementById('grave-comments-list');
            if (!listDiv) return;

            let respectCount = 0;
            let defaceCount = 0;
            let commentsHtml = '';
            let commentsArray = [];

            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.action === 'respect') respectCount++;
                else defaceCount++;

                commentsArray.push({
                    ...data,
                    rawTime: data.timestamp ? data.timestamp.toMillis() : Date.now() // نحتفظ بالوقت للترتيب
                });
            });

            // 🛡️ الترتيب برمجياً لتخطي مشاكل فايربيس (Index Errors)
            commentsArray.sort((a, b) => b.rawTime - a.rawTime);

            commentsArray.forEach(data => {
                const isDeface = data.action === 'deface';
                const icon = isDeface ? '<i class="fa-solid fa-skull" style="color: #ff4d4d; text-shadow: 0 0 5px #ff4d4d;"></i>' : '<i class="fa-solid fa-seedling" style="color: #00f2a7; text-shadow: 0 0 5px #00f2a7;"></i>';
                const borderColor = isDeface ? 'rgba(255, 77, 77, 0.3)' : 'rgba(0, 242, 167, 0.3)';
                const bgColor = isDeface ? 'rgba(255, 77, 77, 0.05)' : 'rgba(0, 242, 167, 0.05)';
                const timeStr = data.timestamp ? new Date(data.rawTime).toLocaleDateString('en-GB') : t.grave_time_now;

                // التعديل هنا: إضافة dir="auto" واستخدام flex لضبط اتجاه الأيقونة والاسم
                commentsHtml += `
                    <div style="background: ${bgColor}; padding: 12px; border-radius: 8px; border: 1px solid ${borderColor}; animation: fadeIn 0.4s;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                            <span style="color: white; font-weight: bold; font-size: 0.85rem; display: flex; align-items: center; gap: 6px;" dir="auto">
                                <span>${data.userName}</span> ${icon}
                            </span>
                            <span style="color: #8892b0; font-size: 0.7rem;">${timeStr}</span>
                        </div>
                        <p style="color: #ddd; font-size: 0.85rem; margin: 0; line-height: 1.4;" dir="auto">${data.text.replace(/</g, "&lt;")}</p>
                    </div>
                `;
            });

            // تعليق الآدمن الدائم في الأسفل للقصة (Lore)
            commentsHtml += `
                <div style="background: rgba(255,255,255,0.02); padding: 12px; border-radius: 8px; border: 1px solid #222; margin-top: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                        <span style="color: #FFD700; font-weight: 900; font-size: 0.85rem; display: flex; align-items: center; gap: 6px;" dir="auto">
                            <span>${t.grave_admin_name}</span> <i class="fa-solid fa-seedling" style="color: #00f2a7;"></i>
                        </span>
                    </div>
                    <p style="color: #bbb; font-size: 0.85rem; margin: 0;" dir="auto">${t.grave_admin_msg}</p>
                </div>
            `;


            listDiv.innerHTML = commentsHtml;
            updateGraveDynamicBar(respectCount, defaceCount, t);
        }, error => {
            console.error("Grave Listen Error: ", error);
        });
};

// دالة تحديث شريط الطاقة (الحسبة الرياضية) - 🛠️ تم إصلاح الخطأ المطبعي هنا
function updateGraveDynamicBar(respect, deface, t) {
    const total = respect + deface;
    const barRespect = document.getElementById('grave-bar-respect');
    const barDeface = document.getElementById('grave-bar-deface');
    
    // 👈 هنا كان الخطأ! تم تعديل الـ ID ليتطابق مع الـ HTML
    const statusText = document.getElementById('grave-dynamic-status');

    if (!barRespect || !barDeface || !statusText) return;

    if (total === 0) {
        barRespect.style.width = '50%'; barRespect.innerText = '50%';
        barDeface.style.width = '50%'; barDeface.innerText = '50%';
        statusText.innerText = currentLang === 'en' ? 'Undiscovered' : 'لم يزره أحد';
        statusText.style.color = '#8892b0';
        statusText.style.textShadow = 'none';
        return;
    }

    const respectPct = Math.round((respect / total) * 100);
    const defacePct = 100 - respectPct;

    barRespect.style.width = `${respectPct}%`; barRespect.innerText = `${respectPct}%`;
    barDeface.style.width = `${defacePct}%`; barDeface.innerText = `${defacePct}%`;

    // إذا الإهانة أكثر أو تساوي الاحترام، يصير لونه أحمر ومُدنس
    if (defacePct > respectPct) {
        statusText.innerText = t.grave_defaced;
        statusText.style.color = '#ff4d4d';
        statusText.style.textShadow = '0 0 10px rgba(255,77,77,0.5)';
    } else {
        statusText.innerText = t.grave_respected;
        statusText.style.color = '#00f2a7';
        statusText.style.textShadow = '0 0 10px rgba(0,242,167,0.5)';
    }
}



// دالة اختيار نوع التعليق
window.selectGraveAction = function(action) {
    selectedGraveAction = action;
    const btnRespect = document.getElementById('btn-respect');
    const btnDeface = document.getElementById('btn-deface');
    
    btnRespect.classList.remove('active');
    btnDeface.classList.remove('active');
    
    if (action === 'respect') btnRespect.classList.add('active');
    else btnDeface.classList.add('active');
};

// إرسال التعليق (الحفظ في الداتابيس)
window.submitGraveComment = async function(graveId) {
    const input = document.getElementById('grave-comment-input');
    const btn = document.getElementById('submit-comment-btn');
    const text = input.value.trim();
    
    if(!text) return;
    
    const user = auth.currentUser;
    if (!user) return;

    btn.disabled = true;
    const originalText = btn.innerText;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

    try {
        // التعديل هنا: دمج الاسم الأول والأخير
        const currentUserData = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const myName = currentUserData.firstName ? `${currentUserData.firstName} ${currentUserData.lastName || ''}`.trim() : 'Player';
        
        await db.collection('fallen_kings').doc(graveId).collection('comments').add({
            userId: user.uid,
            userName: myName,
            action: selectedGraveAction, // 'respect' أو 'deface'
            text: text,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        input.value = '';
        showToast(currentLang === 'en' ? "Comment saved successfully!" : "تم حفظ التعليق وتحديث القبر!");
    } catch (error) {
        console.error("Error adding comment: ", error);
        showToast("❌ حدث خطأ أثناء إرسال التعليق.");
    } finally {
        btn.disabled = false;
        btn.innerText = originalText;
    }
};

// ==========================================
// 🪦 توليد أيام الأسبوع لشريط المقبرة
// ==========================================
function generateGraveTabs(t) {
    const isEn = currentLang === 'en';
    const daysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const daysAr = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const daysArr = isEn ? daysEn : daysAr;

    let html = `<button class="grave-date-btn active" onclick="filterGraveyardByDate('all', this)">${t.all_time}</button>`;

    const today = new Date();
    for(let i=0; i<7; i++) {
        let d = new Date(today);
        d.setDate(today.getDate() - i);
        let dayName = daysArr[d.getDay()];
        let dayNum = d.getDate();
        
        let suffix = "th";
        if(isEn) {
            if(dayNum % 10 === 1 && dayNum !== 11) suffix = "st";
            else if(dayNum % 10 === 2 && dayNum !== 12) suffix = "nd";
            else if(dayNum % 10 === 3 && dayNum !== 13) suffix = "rd";
        }
        
        let label = isEn ? `${dayName} ${dayNum}${suffix}` : `${dayName} ${dayNum}`;
        let dateKey = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;

        html += `<button class="grave-date-btn" data-date="${dateKey}" onclick="filterGraveyardByDate('${dateKey}', this)">${label}</button>`;
    }
    return html;
}

// متغير عالمي لحفظ التاريخ المفلتر
window.currentGraveDateFilter = 'all';

// ==========================================
// 🪦 نظام مقبرة الأساطير (الشكل الجديد)
// ==========================================
async function openValhalla() {
    const mainContent = document.getElementById('main-content-area');
    if (!mainContent) return;

    const t = translations[currentLang || 'ar'];
    const currentUserData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const userCity = currentUserData.city || 'Amman'; 

    const searchTxt = currentLang === 'en' ? 'Search records:' : 'البحث في السجلات:';
    const searchBtnTxt = currentLang === 'en' ? 'Search!' : 'بحث!';
    const tabsHtml = generateGraveTabs(t);
const epicTitle = t.city_grave_title ? t.city_grave_title.replace('{city}', userCity) : `مدافن أساطير ${userCity}`;


    // تصفير الفلتر عند الدخول
    window.currentGraveDateFilter = 'all';

    mainContent.innerHTML = `
              <header class="top-bar" style="margin-bottom: 15px;">
            <div class="header-row" style="display: flex; justify-content: flex-start; align-items: center; width: 100%; gap: 12px;">
                <button onclick="openCityMonster()" class="btn-primary" style="padding: 6px 12px; font-size: 0.85rem; background: rgba(255, 77, 77, 0.1); color: #ff4d4d; border-color: #ff4d4d; flex-shrink: 0;">${t.back}</button>
                
                <h1 class="epic-grave-title" style="flex: 1; text-align: ${currentLang === 'en' ? 'left' : 'right'};">${epicTitle}</h1>
            </div>
        </header>


        <section class="performance-container" style="animation: fadeIn 0.5s;">
            
            <!-- صندوق القصة (Lore) -->
            <div class="graveyard-lore-box" style="direction: ${currentLang === 'en' ? 'ltr' : 'rtl'}; text-align: justify;">
                <p>${t.grave_desc_1}</p>
                <p>${t.grave_desc_2}</p>
            </div>

            <!-- شريط البحث (مدمج ومرتب) -->
            <div style="display: flex; justify-content: center; align-items: center; gap: 10px; margin-bottom: 20px;">
                <span style="color:var(--slate); font-size:0.9rem; font-weight:bold;">${searchTxt}</span>
                <input type="text" id="valhalla-search" class="input-field" style="width: 200px; margin: 0; background: #111; border-color: #444;" onkeyup="filterGraveyardCombined()">
                <button class="btn-primary" style="padding: 10px 20px; border-radius: 4px;" onclick="filterGraveyardCombined()">${searchBtnTxt}</button>
            </div>

            <!-- شريط العنوان للوفيات -->
            <div style="background: linear-gradient(to right, #330000, #220000); color: white; text-align: center; padding: 10px; font-weight: bold; border: 1px solid #440000; border-bottom: none; border-radius: 4px 4px 0 0;">
                ${t.recent_deaths}
            </div>
            
            <!-- أشرطة الأيام -->
            <div class="grave-date-tabs" id="grave-tabs-container">
                ${tabsHtml}
            </div>
            
            <div id="valhalla-list" style="display: flex; flex-direction: column;">
                <div style="text-align:center; padding: 40px;">
                    <i class="fa-solid fa-spinner fa-spin fa-2x" style="color:#ff4d4d;"></i>
                </div>
            </div>
        </section>
    `;

    try {
        const snapshot = await db.collection('fallen_kings')
            .where('city', '==', userCity)
            .get();

        const listDiv = document.getElementById('valhalla-list');
        listDiv.innerHTML = '';

        if (snapshot.empty) {
            listDiv.innerHTML = `
                <div class="empty-notif" style="margin-top: 30px;">
                    <i class="fa-solid fa-ghost" style="font-size: 4rem; color: #333; margin-bottom: 15px;"></i>
                    <p style="color: var(--slate); font-size: 1.1rem; font-weight: bold;">${t.empty_graveyard}</p>
                </div>`;
            return;
        }

        window.valhallaData = [];

        snapshot.forEach(doc => {
            const data = doc.data();
            window.valhallaData.push({
                id: doc.id,
                kingName: data.kingName,
                kingPhoto: data.kingPhoto || 'https://i.ibb.co/9mPmHXkh/cropped-circle-image-2.png',
                weight: data.weight,
                slayerName: data.slayerName,
                slayerWeight: data.slayerWeight,
                rawDate: data.fallDate ? data.fallDate.toMillis() : 0,
                date: data.fallDate ? data.fallDate.toDate().toLocaleString('en-GB', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Unknown'
            });
        });

        window.valhallaData.sort((a, b) => b.rawDate - a.rawDate);
        renderGraveyardRows(window.valhallaData);

    } catch (error) {
        console.error("Valhalla Error:", error);
        document.getElementById('valhalla-list').innerHTML = `<p style="text-align:center; color:#ff4d4d;">حدث خطأ أثناء استدعاء الأرواح!</p>`;
    }
}

// ==========================================
// 🪦 فلترة المقبرة (بحث نصي + أيام)
// ==========================================
window.filterGraveyardByDate = function(dateKey, btnElement) {
    // تفعيل الكبسة المختارة
    document.querySelectorAll('.grave-date-btn').forEach(btn => btn.classList.remove('active'));
    btnElement.classList.add('active');

    window.currentGraveDateFilter = dateKey;
    filterGraveyardCombined();
};

window.filterGraveyardCombined = function() {
    const searchInput = document.getElementById('valhalla-search').value.toLowerCase();
    const dateFilter = window.currentGraveDateFilter;

    const filtered = window.valhallaData.filter(d => {
        // فحص مطابقة الاسم (للملك أو القاتل)
        const matchText = d.kingName.toLowerCase().includes(searchInput) || d.slayerName.toLowerCase().includes(searchInput);

        // فحص مطابقة اليوم
        let matchDate = true;
        if (dateFilter !== 'all') {
            const fallDate = new Date(d.rawDate);
            const recordDateKey = `${fallDate.getFullYear()}-${fallDate.getMonth()+1}-${fallDate.getDate()}`;
            matchDate = (recordDateKey === dateFilter);
        }

        return matchText && matchDate;
    });

    renderGraveyardRows(filtered);
};


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
    const t = translations[currentLang || 'ar'];
    const infoContainer = document.getElementById('monster-info');
    infoContainer.innerHTML = `<i class="fa-solid fa-spinner fa-spin fa-2x"></i> ${t.moving_to} ${city}...`;
    
    // 🔥 تدمير الخريطة القديمة فوراً قبل أي تأخير زمني لمنع تضارب الخرائط
    if (window.monsterMap) { 
        window.monsterMap.off();
        window.monsterMap.remove(); 
        window.monsterMap = null; 
    }
    
    setTimeout(async () => {

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

window.claimTribute = async function() {
    const btn = event.target;
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

    const success = await addXP(50, 'tribute');
    
    if (success) {
        showToast("💰 تم تحصيل +50 XP ضريبة الملك!");
        updateQuestProgress('tribute', 1);
        localStorage.setItem('lastTributeClaim', new Date().toDateString());
    } else {
        showToast("الضريبة محصلة اليوم 👑");
    }
    
    btn.innerHTML = originalText;
    btn.disabled = false;
};


// ==========================================
// 👑 لوحة الإدارة: مراجعة واعتماد الفيديوهات
// ==========================================



function showMonsterRules() {
    const t = currentLang === 'ar' ? {
        title: "كيف تسيطر على المدينة؟ 👑",
        steps: [
            "اكسر الرقم: لازم تسجل أعلى وزن (Max Weight) في مدينتك في أي تمرين.",
            "أثبت وحشنتك: الأوزان العالية بتحتاج فيديو إثبات عشان الإدارة تعتمدك.",
            "سقوط العرش: أول ما تكسر رقم الملك الحالي، رح نبعث إنذار لكل لاعبين المدينة إنك دعست عالعرش!",
            "مطلوب للعدالة: إذا حافظت على ستريك 3 أيام وأنت الملك، رح تصير 'مطلوب'، والكل رح يحاول يكسر رقمك!",
            "ضريبة الملك: كملك للمدينة، إلك مكافأة XP يومية بتقدر تحصلها من الخريطة."
        ]
    } : {
        title: "How to Rule the City? 👑",
        steps: [
            "Break the Record:** You must log the highest Max Weight in your city.",
            "Prove It: Heavy lifts require video proof for admin approval.",
            "Throne Fall: Once you beat the current King, we'll alert everyone in the city!",
            "Wanted Status: Stay King for 3 days to become 'Wanted'—everyone will target you!",
            "King's Tribute: Collect a daily XP bonus from the map as long as you hold the throne."
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

// دالة لضخ العضلات في القائمة بناءً على اللغة (بدل الباي والتراي حطينا أذرع)
function populateLiveMuscles() {
    const select = document.getElementById('live-muscle-select');
    const t = translations[currentLang || 'ar'];
    if(select) {
        select.innerHTML = `
            <option value="">-- ${t.live_select_muscle || 'اختر العضلة'} --</option>
            <option value="صدر">${t.muscle_chest || 'صدر'}</option>
            <option value="ظهر">${t.muscle_back || 'ظهر'}</option>
            <option value="أكتاف">${t.muscle_shoulders || 'أكتاف'}</option>
            <option value="أذرع">${t.muscle_arms || 'أذرع'}</option>
            <option value="أرجل">${t.muscle_legs || 'أرجل'}</option>
            <option value="بطن">${t.muscle_core || 'بطن'}</option>
            <option value="شامل">${t.sys_full || 'شامل'}</option>
        `;
    }
}

function startLiveWorkout() {
    liveWorkoutActive = true; liveExercises = []; pendingProofData = null;
    document.getElementById('live-sets-log').innerHTML = '';
    
    populateLiveMuscles(); // تعبئة العضلات
    
    const muscleSelect = document.getElementById('live-muscle-select');
    if(muscleSelect) { muscleSelect.disabled = false; muscleSelect.value = ""; }
    
    const overlay = document.getElementById('live-workout-overlay');
    overlay.style.display = 'flex';
    setTimeout(() => overlay.classList.add('active'), 10); 
    
    const canvas = document.getElementById('stardust-canvas');
    if (canvas) { canvas.style.zIndex = '30001'; canvas.style.pointerEvents = 'none'; }
    
    // 🆕 طلب إبقاء الشاشة مضاءة
    requestWakeLock();
    
    // 🆕 تخزين وقت البداية الحقيقي
    liveStartTimeStamp = Date.now();
    document.getElementById('live-timer').innerText = `00:00`;
    
    clearInterval(liveDurationTimer);
    liveDurationTimer = setInterval(() => {
        // 🆕 حساب الوقت بناءً على الساعة وليس العداد (لتخطي تعليق المتصفح)
        liveSeconds = Math.floor((Date.now() - liveStartTimeStamp) / 1000);
        const m = String(Math.floor(liveSeconds / 60)).padStart(2, '0');
        const s = String(liveSeconds % 60).padStart(2, '0');
        document.getElementById('live-timer').innerText = `${m}:${s}`;
    }, 1000);
}

function startRestTimer(seconds) {
    const restOverlay = document.getElementById('rest-timer-overlay');
    const restText = document.getElementById('rest-countdown');
    
    restOverlay.style.display = 'flex';
    
    // 🆕 حساب وقت الانتهاء الحقيقي في المستقبل
    restTargetTimeStamp = Date.now() + (seconds * 1000);
    restText.innerText = seconds;

    clearInterval(restInterval);
    restInterval = setInterval(() => {
        // 🆕 حساب الوقت المتبقي بناءً على الساعة
        let timeLeft = Math.ceil((restTargetTimeStamp - Date.now()) / 1000);
        
        if (timeLeft <= 0) {
            timeLeft = 0;
            skipRest();
            if('vibrate' in navigator) navigator.vibrate(500);
        }
        restText.innerText = timeLeft;
    }, 1000);
}


function logLiveSet(isSuperset = false) {
    const muscleSelect = document.getElementById('live-muscle-select');
    const selectedMuscleText = muscleSelect.options[muscleSelect.selectedIndex].text;
    const muscleVal = muscleSelect.value;
    const exName = document.getElementById('live-ex-name').value.trim();
    const weight = parseFloat(document.getElementById('live-ex-weight').value) || 0;
    let reps = parseInt(document.getElementById('live-ex-reps').value) || 0;

    if (!muscleVal || !exName || weight <= 0 || reps <= 0) {
        showToast(currentLang === 'en' ? "Please select a muscle and enter valid details" : "يرجى تحديد العضلة وإدخال بيانات صحيحة");
        return;
    }

    // 🛡️ التعديل الجديد: الحد الأقصى للعدات هو 25 في جولات اللايف
    if (reps > 25) {
        reps = 25;
        document.getElementById('live-ex-reps').value = 25;
        showToast(currentLang === 'en' ? "Max 25 reps allowed per set!" : "الحد الأقصى للعدات هو 25 فقط!");
    }

    liveExercises.push({ name: exName, weight: weight, reps: reps, type: selectedMuscleText });





    
    // 🔒 🆕 قفل اختيار العضلة بمجرد تسجيل أول جولة
    if (liveExercises.length === 1) {
        muscleSelect.disabled = true;
    }

    document.getElementById('live-sets-log').insertAdjacentHTML('afterbegin', `
        <div class="live-set-row">
            <span>${exName} <span style="font-size: 0.7rem; color: var(--slate);">(${selectedMuscleText})</span></span>
            <span style="color: var(--primary-color);">${weight}kg x ${reps}</span>
        </div>
    `);

    let threshold = 999;
    if (muscleVal === "صدر") threshold = 60;
    if (muscleVal === "ظهر") threshold = 80;
    if (muscleVal === "أكتاف") threshold = 50;
    if (muscleVal === "أذرع") threshold = 50;
    if (muscleVal === "بطن") threshold = 80;
    if (muscleVal === "أرجل") threshold = 120;
    if (muscleVal === "شامل") threshold = 60;

    if (exName.includes("ديدليفت") || exName.toLowerCase().includes("deadlift")) threshold = 120;
    if (exName.includes("سكوات") || exName.toLowerCase().includes("squat")) threshold = 140;

    // 🏆 🆕 المنطق الذكي لاختيار أعلى وزن فقط للإثبات
    if (weight >= threshold) {
        if (!pendingProofData) {
            // أول مرة يكسر الرقم في هذا التمرين اللايف
            pendingProofData = { name: exName, weight: weight, reps: reps, type: selectedMuscleText };
            showToast(translations[currentLang || 'ar'].beast_alert); 
        } else if (weight > pendingProofData.weight) {
            // جاب وزن أعلى من الوزن اللي كسره قبل شوي (مثلا جاب 90 وهسا 100)
            pendingProofData = { name: exName, weight: weight, reps: reps, type: selectedMuscleText };
            let msg = translations[currentLang || 'ar'].new_max_alert || `دمار! الإثبات سيكون للوزن الأعلى ({weight}kg)`;
            showToast(msg.replace('{weight}', weight));
        }
        // ملاحظة: لو جاب 100 بالبداية وبعدين جاب 90، النظام رح يتجاهل الـ 90 لأنه سجل الـ 100 كأعلى وزن مطلوب إثباته.
    }

    document.getElementById('live-ex-reps').value = '';

    if (!isSuperset) {
        const restOverlay = document.getElementById('rest-timer-overlay');
        restOverlay.style.display = 'flex';
        setTimeout(() => restOverlay.classList.add('active'), 10);
        startRestTimer(90);
    } else {
        showToast(currentLang === 'en' ? "Superset Logged! No rest." : "تم تسجيل السوبرسيت! استمر بالجلد.");
    }
}


function closeLiveWorkout() {
    liveWorkoutActive = false;
    clearInterval(liveDurationTimer); clearInterval(restInterval);
releaseWakeLock();
    const overlay = document.getElementById('live-workout-overlay');
    overlay.classList.remove('active');
    
    setTimeout(() => { 
        overlay.style.display = 'none'; 
        const canvas = document.getElementById('stardust-canvas');
        if (canvas) canvas.style.zIndex = '-1';
    }, 500); 
    
    document.getElementById('rest-timer-overlay').classList.remove('active');
}





function skipRest() {
    clearInterval(restInterval);
    const restOverlay = document.getElementById('rest-timer-overlay');
    restOverlay.classList.remove('active');
    setTimeout(() => restOverlay.style.display = 'none', 500); 
}

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

let isSavingLiveWorkout = false; 

async function finishLiveWorkout() {
    if (liveExercises.length === 0) { closeLiveWorkout(); return; }
    if (isSavingLiveWorkout) return;
    isSavingLiveWorkout = true;

releaseWakeLock(); // 🆕 السماح للشاشة بالانطفاء


    try {
        const user = auth.currentUser;
        const totalSets = liveExercises.length;
        const totalVolume = liveExercises.reduce((sum, ex) => sum + (ex.weight * ex.reps), 0);
        let liveReps = 0;
        liveExercises.forEach(ex => liveReps += parseInt(ex.reps) || 0);

        const m = String(Math.floor(liveSeconds / 60)).padStart(2, '0');
        const s = String(liveSeconds % 60).padStart(2, '0');
        const finalTime = `${m}:${s}`;

        let xpMessage = "";
        let xpGained = false;

        // 🚨 إذا كان التمرين يحتوي على وزن أسطوري يحتاج إثبات
        if (pendingProofData) {
            if (user) {
                // إرسال إشعار للإثبات (مع حفظ بيانات التمرين بالكامل بداخل الإشعار)
                await db.collection('users').doc(user.uid).collection('notifications').add({
                    type: 'pending_proof',
                    text: translations[currentLang].proof_required_notif,
                    exerciseData: pendingProofData, 
                    fullWorkoutData: liveExercises, // حفظ التمرين كامل ليتم إرساله للآدمن
                    status: 'pending',
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
            
            xpMessage = currentLang === 'en' ? "Pending Approval ⏳" : "بانتظار الإثبات ⏳";
            xpGained = false;
            
            // 🛑 ملاحظة هامة: لم نقم بتحديث المهام (Quests) ولا الأرشيف هنا!
            // سيتم حسابها عند موافقة الآدمن فقط لضمان النزاهة.

        } else {
            // ✅ تمرين عادي (لا يحتاج إثبات) -> نحسب المهام والأرشيف فوراً
            await updateQuestProgressBatch({ volume: totalVolume, reps: liveReps, workout_days: 1 });

            // ⚔️ إضافة الوزن لمنافسة الفرق (للتمرين اللايف)
            addVolumeToClanWar(totalVolume);

            if (typeof updateStat === "function") {
                updateStat('workouts', 1);
                liveExercises.forEach(ex => {
                    let w = parseFloat(ex.weight) || 0;
                    if (w > 0) updateStat('maxWeight', w, true);
                });
            }

            let workoutHistory = JSON.parse(localStorage.getItem('userWorkouts')) || [];
            let dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
            let typeStr = liveExercises[0]?.type || "تمرين لايف";
            workoutHistory.unshift({ date: dateStr, type: typeStr, details: liveExercises });
            localStorage.setItem('userWorkouts', JSON.stringify(workoutHistory));

            if (user) {
                let savedData = JSON.parse(localStorage.getItem('currentUser') || '{}');
                const todayStr = new Date().toDateString();
                const lastXpDate = savedData.lastWorkoutXpDate || "";

                if (lastXpDate === todayStr) {
                    const now = new Date();
                    const tomorrow = new Date(now);
                    tomorrow.setHours(24, 0, 0, 0); 
                    const timeLeftMs = tomorrow - now;
                    const hours = Math.floor(timeLeftMs / (1000 * 60 * 60));
                    const minutes = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));
                    xpMessage = currentLang === 'en' ? `XP resets in ${hours}h ${minutes}m` : `تتجدد المكافأة بعد ${hours}س و${minutes}د`;
                    await db.collection('users').doc(user.uid).update({ workouts: workoutHistory });
                } else {
                    savedData.lastWorkoutXpDate = todayStr;
                    localStorage.setItem('currentUser', JSON.stringify(savedData));
                    await db.collection('users').doc(user.uid).update({ 
                        workouts: workoutHistory,
                        lastWorkoutXpDate: todayStr 
                    });
                    if (typeof addXP === "function") await addXP(50, 'workout');
                    xpGained = true;
                    xpMessage = "+50 XP";
                }
            }
        }

        // إغلاق الشاشة وإظهار النتائج
        clearInterval(liveDurationTimer); 
        clearInterval(restInterval);
        const overlay = document.getElementById('live-workout-overlay');
        overlay.classList.remove('active');
        setTimeout(() => overlay.style.display = 'none', 500);
        document.getElementById('rest-timer-overlay').classList.remove('active');

        const summaryOverlay = document.getElementById('live-summary-overlay');
        if (summaryOverlay) {
            document.getElementById('sum-time').innerText = finalTime;
            document.getElementById('sum-sets').innerText = totalSets;
            document.getElementById('sum-volume').innerText = "0"; 
            
            const xpRewardBox = document.querySelector('.xp-reward-box');
            if (xpRewardBox) {
                xpRewardBox.innerText = xpMessage;
                xpRewardBox.style.fontSize = xpGained ? '2.5rem' : (pendingProofData ? '1.5rem' : '1.1rem');
                xpRewardBox.style.color = xpGained ? 'var(--primary-color)' : (pendingProofData ? '#FFD700' : 'var(--slate)');
                xpRewardBox.style.textShadow = xpGained ? '0 0 20px rgba(0, 242, 167, 0.6)' : (pendingProofData ? '0 0 15px rgba(255, 215, 0, 0.5)' : 'none');
                xpRewardBox.style.animation = xpGained ? 'pulseXP 1.5s infinite alternate' : 'none';
            }

            summaryOverlay.style.display = 'flex';
            setTimeout(() => {
                summaryOverlay.classList.add('active');
                animateValue(document.getElementById('sum-volume'), 0, totalVolume, 1500);
            }, 50);
        } else {
            showToast(currentLang === 'en' ? `Workout Saved! ${xpMessage}` : `تم الحفظ! ${xpMessage}`);
            closeLiveSummary();
        }

    } finally {
        setTimeout(() => { isSavingLiveWorkout = false; }, 2000);
    }
}


// دالة مساعدة لمعالجة الحفظ النهائي والمهام لللايف
async function processLiveQuestsAndHistory(updateMaxWeightLocally) {
    const totalSets = liveExercises.length;
    const totalVolume = liveExercises.reduce((sum, ex) => sum + (ex.weight * ex.reps), 0);
    let liveReps = 0;
    liveExercises.forEach(ex => liveReps += parseInt(ex.reps) || 0);

    // تحديث المهام
    await updateQuestProgressBatch({ volume: totalVolume, reps: liveReps, workout_days: 1 });

    if (typeof updateStat === "function") {
        updateStat('workouts', 1);
        if (updateMaxWeightLocally) {
            liveExercises.forEach(ex => {
                let w = parseFloat(ex.weight) || 0;
                if (w > 0) updateStat('maxWeight', w, true);
            });
        }
    }

    let workoutHistory = JSON.parse(localStorage.getItem('userWorkouts')) || [];
    let dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    let typeStr = pendingProofData ? pendingProofData.type : (liveExercises[0]?.type || "تمرين لايف");
    
    workoutHistory.unshift({ date: dateStr, type: typeStr, details: liveExercises });
    localStorage.setItem('userWorkouts', JSON.stringify(workoutHistory));
    
    const user = auth.currentUser;
    let xpMessage = "";
    let xpGained = false;

    if (user) {
        let savedData = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const todayStr = new Date().toDateString();
        const lastXpDate = savedData.lastWorkoutXpDate || "";

        if (lastXpDate === todayStr) {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setHours(24, 0, 0, 0); 
            const timeLeftMs = tomorrow - now;
            const hours = Math.floor(timeLeftMs / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));
            xpMessage = currentLang === 'en' ? `XP resets in ${hours}h ${minutes}m` : `تتجدد المكافأة بعد ${hours}س و${minutes}د`;
            await db.collection('users').doc(user.uid).update({ workouts: workoutHistory });
        } else {
            savedData.lastWorkoutXpDate = todayStr;
            localStorage.setItem('currentUser', JSON.stringify(savedData));
            await db.collection('users').doc(user.uid).update({ 
                workouts: workoutHistory,
                lastWorkoutXpDate: todayStr 
            });
            if (typeof addXP === "function") await addXP(50, 'workout');
            xpGained = true;
            xpMessage = "+50 XP";
        }
    }

    // تخزين البيانات للنافذة المنبثقة
    const m = String(Math.floor(liveSeconds / 60)).padStart(2, '0');
    const s = String(liveSeconds % 60).padStart(2, '0');
    window.liveFinalTime = `${m}:${s}`;
    window.liveFinalVolume = totalVolume;
    window.liveFinalSets = totalSets;
    window.liveXpMessage = xpMessage;
    window.liveXpGained = xpGained;
}

function closeLiveSummaryOrShow() {
    clearInterval(liveDurationTimer); 
    clearInterval(restInterval);
    const overlay = document.getElementById('live-workout-overlay');
    overlay.classList.remove('active');
    setTimeout(() => overlay.style.display = 'none', 500);
    document.getElementById('rest-timer-overlay').classList.remove('active');

releaseWakeLock(); // 🆕 السماح للشاشة بالانطفاء

    const summaryOverlay = document.getElementById('live-summary-overlay');
    if (summaryOverlay) {
        document.getElementById('sum-time').innerText = window.liveFinalTime;
        document.getElementById('sum-sets').innerText = window.liveFinalSets;
        document.getElementById('sum-volume').innerText = "0"; 
        
        const xpRewardBox = document.querySelector('.xp-reward-box');
        if (xpRewardBox) {
            xpRewardBox.innerText = window.liveXpMessage;
            xpRewardBox.style.fontSize = window.liveXpGained ? '2.5rem' : '1.1rem';
            xpRewardBox.style.color = window.liveXpGained ? 'var(--primary-color)' : 'var(--slate)';
            xpRewardBox.style.textShadow = window.liveXpGained ? '0 0 20px rgba(0, 242, 167, 0.6)' : 'none';
            xpRewardBox.style.animation = window.liveXpGained ? 'pulseXP 1.5s infinite alternate' : 'none';
        }

        summaryOverlay.style.display = 'flex';
        setTimeout(() => {
            summaryOverlay.classList.add('active');
            animateValue(document.getElementById('sum-volume'), 0, window.liveFinalVolume, 1500);
        }, 50);
    } else {
        showToast(currentLang === 'en' ? `Workout Saved! ${window.liveXpMessage}` : `تم حفظ التمرين! ${window.liveXpMessage}`);
        closeLiveSummary();
    }
}

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
    if (canvas) canvas.style.zIndex = '-1'; 
    if(document.getElementById('log-container')) renderWorkoutLog(); 
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

window.logoutFromProfile = async function() {
    const t = translations[currentLang || 'ar'];
    const confirmMsg = currentLang === 'en' ? "Are you sure you want to logout?" : "متأكد إنك بدك تسجل خروج يا وحش؟";
    
    if(confirm(confirmMsg)) {
        const user = auth.currentUser;
        if (user) {
            try {
                // مسح التوكن من الحساب القديم حتى لا تصله إشعارات وهو مسجل خروج
                await db.collection('users').doc(user.uid).update({
                    fcmToken: firebase.firestore.FieldValue.delete()
                });
            } catch(e) { console.error("Error removing token", e); }
        }

        await auth.signOut();
        localStorage.removeItem('currentUser');
        localStorage.removeItem('hasSeenTour'); // 👈 السطر السحري تم إضافته هنا كمان
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
    { id: 'cv2', price: 1000, url: 'Photos/g2.png', name_ar: 'المحرك الخامس', name_en: 'Gear Five' }, // صورة لوفي جير سكند
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

// ==========================================
// 🛍️ قاعدة بيانات المتجر الشامل (ألقاب، إطارات، ثيمات)
// ==========================================
// ==========================================
// 🛍️ قاعدة بيانات المتجر الشامل (ألقاب، إطارات، ثيمات)
// ==========================================

// ==========================================
// 🛍️ قاعدة بيانات المتجر الشامل (ألقاب، إطارات، ثيمات)
// ==========================================
// ==========================================
// 🛍️ قاعدة بيانات المتجر الشامل (ألقاب، إطارات، ثيمات)
// ==========================================
const storeItemsDB = {
    titles: [
        // --- الفئة العادية (Common) - 1000 XP ---
        { id: 't1', price: 1000, val: 'مبتدئ طموح', val_en: 'Ambitious Rookie', tier: 'tier-common', icon: 'fa-solid fa-seedling' },
        { id: 't2', price: 1000, val: 'رافع أثقال', val_en: 'Weight Lifter', tier: 'tier-common', icon: 'fa-solid fa-dumbbell' },
        { id: 't3', price: 1000, val: 'محب الحديد', val_en: 'Iron Lover', tier: 'tier-common', icon: 'fa-solid fa-heart' },
        { id: 't4', price: 1000, val: 'رياضي نشط', val_en: 'Active Athlete', tier: 'tier-common', icon: 'fa-solid fa-person-running' },
        { id: 't5', price: 1000, val: 'باحث عن القوة', val_en: 'Power Seeker', tier: 'tier-common', icon: 'fa-solid fa-magnifying-glass' },
        { id: 't6', price: 1000, val: 'متدرب صلب', val_en: 'Solid Trainee', tier: 'tier-common', icon: 'fa-solid fa-shield' },
        { id: 't7', price: 1000, val: 'قاهر الكسل', val_en: 'Laziness Slayer', tier: 'tier-common', icon: 'fa-solid fa-bed-pulse' },
        { id: 't8', price: 1000, val: 'روح التحدي', val_en: 'Challenger Spirit', tier: 'tier-common', icon: 'fa-solid fa-fire' },
        { id: 't9', price: 1000, val: 'مقاتل الجيم', val_en: 'Gym Fighter', tier: 'tier-common', icon: 'fa-solid fa-hand-fist' },
        { id: 't10', price: 1000, val: 'بطل صاعد', val_en: 'Rising Hero', tier: 'tier-common', icon: 'fa-solid fa-arrow-trend-up' },

        // --- الفئة النادرة (Rare) ---
        { id: 't11', price: 2500, val: 'كسار الأوزان', val_en: 'Weight Breaker', tier: 'tier-rare', icon: 'fa-solid fa-hammer' },
        { id: 't12', price: 4000, val: 'ماكينة عضلات', val_en: 'Muscle Machine', tier: 'tier-rare', icon: 'fa-solid fa-gear' },
        { id: 't13', price: 5000, val: 'دبابة بشرية', val_en: 'Human Tank', tier: 'tier-rare', icon: 'fa-solid fa-truck-monster' },

        // --- الفئة الملحمية (Epic) ---
        { id: 't14', price: 10000, val: 'قاهر الجاذبية', val_en: 'Gravity Defier', tier: 'tier-epic', icon: 'fa-brands fa-space-awesome' },
        { id: 't15', price: 15000, val: 'سيد الأوزان', val_en: 'Master of Weights', tier: 'tier-epic', icon: 'fa-solid fa-scale-balanced' },
        { id: 't16', price: 20000, val: 'جنرال النادي', val_en: 'Gym General', tier: 'tier-epic', icon: 'fa-solid fa-medal' },

        // --- الفئة الأسطورية (Legendary) ---
        { id: 't17', price: 30000, val: 'حاكم الظلال', val_en: 'Shadow Monarch', tier: 'tier-legendary', icon: 'fa-solid fa-user-ninja' },
        { id: 't18', price: 35000, val: 'أسطورة حية', val_en: 'Living Legend', tier: 'tier-legendary', icon: 'fa-solid fa-khanda' },
        { id: 't19', price: 40000, val: ' المتوحش', val_en: 'The Savage', tier: 'tier-legendary', icon: 'fa-solid fa-bolt' },

        // --- الفئة الخرافية (Mythic) - الأغلى والأقوى ---
        { id: 't20', price: 50000, val: 'عملاق الحديد', val_en: ' Iron Titan', tier: 'tier-mythic', icon: 'fa-solid fa-dragon' }
    ],

    borders: [
        { id: 'b1', price: 1000, val: 'frame-gear', name_ar: 'الترس الحديدي', name_en: 'Iron Gear' },
        { id: 'b2', price: 2000, val: 'frame-cyber', name_ar: 'حلقات الماتريكس', name_en: 'Cyber Rings' },
        { id: 'b3', price: 3500, val: 'frame-demon', name_ar: 'نجمة الدمار', name_en: 'Demon Star' },
        { id: 'b4', price: 5000, val: 'frame-mecha', name_ar: 'درع الميكا', name_en: 'Mecha Armor' },
        { id: 'b5', price: 6500, val: 'frame-snake', name_ar: 'أفعى الكوبرا', name_en: 'Venomous Serpent' },
        { id: 'b6', price: 8000, val: 'frame-lightning', name_ar: 'عاصفة البرق', name_en: 'Lightning Storm' },
        { id: 'b7', price: 10000, val: 'frame-samurai', name_ar: 'نصل الساموراي', name_en: 'Samurai Slash' },
        { id: 'b8', price: 12500, val: 'frame-blackhole', name_ar: 'الثقب الأسود', name_en: 'Void Singularity' },
        { id: 'b9', price: 15000, val: 'frame-bloodmoon', name_ar: 'القمر الدموي', name_en: 'Blood Moon' },
        { id: 'b10', price: 18000, val: 'frame-plasma', name_ar: 'مفاعل البلازما', name_en: 'Plasma Reactor' },
        { id: 'b11', price: 22000, val: 'frame-shadow', name_ar: 'ظل النينجا', name_en: 'Shadow Assassin' },
        { id: 'b12', price: 26000, val: 'frame-pharaoh', name_ar: 'لعنة الفرعون', name_en: 'Pharaoh Curse' },
        { id: 'b13', price: 30000, val: 'frame-phoenix', name_ar: 'طائر العنقاء', name_en: 'Phoenix Flare' },
        { id: 'b14', price: 35000, val: 'frame-wings', name_ar: 'أجنحة المجد', name_en: 'Wings of Glory' },
        { id: 'b15', price: 42000, val: 'frame-god', name_ar: 'هالة الأسطورة', name_en: 'Legend Aura' },
        { id: 'b16', price: 50000, val: 'frame-emperor', name_ar: 'وسام الإمبراطور', name_en: 'Emperor Relic' } /* أغلى وسام عليه التاج */
    ],

    themes: [
        // --- أول 5 ثيمات بسعر 1000 ---
        { id: 'th1', price: 1000, val: 'void', name_ar: 'سحر الفراغ', name_en: 'Cosmic Void', icon: 'fa-solid fa-meteor', color: '#9b59b6' },
        { id: 'th2', price: 1000, val: 'samurai', name_ar: 'نصل الساموراي', name_en: 'Samurai Blade', icon: 'fa-solid fa-khanda', color: '#e74c3c' },
        { id: 'th3', price: 1000, val: 'frost', name_ar: 'الصقيع المطلق', name_en: 'Absolute Frost', icon: 'fa-regular fa-snowflake', color: '#74b9ff' },
        { id: 'th4', price: 1000, val: 'toxic', name_ar: 'الطفرة السامة', name_en: 'Toxic Biohazard', icon: 'fa-solid fa-flask-vial', color: '#39ff14' },
        { id: 'th5', price: 1000, val: 'hellfire', name_ar: 'جحيم مستعر', name_en: 'Hellfire', icon: 'fa-solid fa-fire-flame-curved', color: '#ff4500' },
        
        // --- الباقي يتصاعد تدريجياً حتى 20,000 ---
        { id: 'th6', price: 2000, val: 'arcade', name_ar: 'بكسل أركيد', name_en: 'Retro Arcade', icon: 'fa-solid fa-gamepad', color: '#e056fd' },
        { id: 'th7', price: 3000, val: 'vampire', name_ar: 'قصر دراكولا', name_en: 'Dracula Castle', icon: 'fa-solid fa-droplet', color: '#8b0000' },
        { id: 'th8', price: 4500, val: 'cyberpunk', name_ar: 'سايبر بانك', name_en: 'Cyberpunk', icon: 'fa-solid fa-microchip', color: '#0ff' },
        { id: 'th9', price: 6000, val: 'jungle', name_ar: 'الغابة المتوحشة', name_en: 'Savage Jungle', icon: 'fa-solid fa-leaf', color: '#2ecc71' },
        { id: 'th10', price: 8000, val: 'crystal', name_ar: 'الكريستال المشع', name_en: 'Radiant Crystal', icon: 'fa-regular fa-gem', color: '#00cec9' },
        { id: 'th11', price: 10000, val: 'molten', name_ar: 'المعدن المصهور', name_en: 'Molten Metal', icon: 'fa-solid fa-volcano', color: '#e67e22' },
        { id: 'th12', price: 13000, val: 'wizard', name_ar: 'الساحر المظلم', name_en: 'Dark Wizard', icon: 'fa-solid fa-hat-wizard', color: '#8e44ad' },
        { id: 'th13', price: 16000, val: 'hacker', name_ar: 'نظام الماتريكس', name_en: 'Matrix Hacker', icon: 'fa-solid fa-terminal', color: '#00ff00' },
        { id: 'th14', price: 18000, val: 'atlantis', name_ar: 'أعماق الأطلنطي', name_en: 'Abyssal Atlantis', icon: 'fa-solid fa-water', color: '#0984e3' },
        { id: 'th15', price: 20000, val: 'emperor', name_ar: 'الإمبراطور الأعظم', name_en: 'Iron Emperor', icon: 'fa-solid fa-chess-king', color: '#FFD700' }
    ]



};

let currentStoreTab = 'covers';

// دالة تطبيق الثيم عند تحميل الصفحة
function applyAppTheme(themeVal) {
    if (themeVal && themeVal !== 'default') {
        document.body.setAttribute('data-theme', themeVal);
    } else {
        document.body.removeAttribute('data-theme');
    }
}


window.openStore = function() {
    if(window.innerWidth < 768) document.getElementById('sidebar').classList.add('collapsed');
    const mainContent = document.getElementById('main-content-area');
    if (!mainContent) return;

    if (!mainContent.dataset.originalContent) {
        mainContent.dataset.originalContent = mainContent.innerHTML;
    }

    const t = translations[currentLang || 'ar'];
    const data = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    // 🔥 السحر هنا: حساب الرصيد المتاح (النقاط الكلية - النقاط المصروفة)
    const balance = (data.xp || 0) - (data.spentXp || 0);
    
    const tabsHTML = `
        <div class="store-tabs-container">
            <button class="store-tab-btn ${currentStoreTab === 'covers' ? 'active' : ''}" onclick="switchStoreTab('covers')"><i class="fa-solid fa-image"></i> ${currentLang === 'en' ? 'Covers' : 'الأغلفة'}</button>
            <button class="store-tab-btn ${currentStoreTab === 'borders' ? 'active' : ''}" onclick="switchStoreTab('borders')"><i class="fa-solid fa-circle-notch"></i> ${currentLang === 'en' ? 'Auras' : 'الهالات'}</button>
            <button class="store-tab-btn ${currentStoreTab === 'titles' ? 'active' : ''}" onclick="switchStoreTab('titles')"><i class="fa-solid fa-tag"></i> ${currentLang === 'en' ? 'Titles' : 'الألقاب'}</button>
            <button class="store-tab-btn ${currentStoreTab === 'themes' ? 'active' : ''}" onclick="switchStoreTab('themes')"><i class="fa-solid fa-palette"></i> ${currentLang === 'en' ? 'Themes' : 'الثيمات'}</button>
        </div>
    `;

    mainContent.innerHTML = `
        <header class="top-bar" style="margin-bottom: 10px;">
            <div class="header-row">
                <button id="back-to-dash-btn" class="btn-primary" style="padding: 5px 15px; font-size: 0.9rem;">${t.back}</button>
                <h1 style="margin: 0 15px; font-weight: 900; color: var(--primary-color);">
                    <i class="fa-solid fa-store"></i> ${currentLang === 'en' ? 'Black Market' : 'السوق السوداء'}
                </h1>
            </div>
            <div style="background: rgba(255, 215, 0, 0.1); padding: 10px 20px; border-radius: 12px; border: 1px solid #FFD700; display: inline-block; margin-top: 15px;">
                <span style="color: #FFD700; font-weight: 900; font-size: 1.2rem;">${balance.toLocaleString()} XP</span> <i class="fa-solid fa-gem" style="color: #FFD700;"></i>
            </div>
        </header>
        ${tabsHTML}
        <section class="performance-container" style="animation: fadeIn 0.3s;" id="store-content-area">
        </section>
    `;
    
    document.getElementById('back-to-dash-btn').onclick = backToDashboard;
    renderStoreItems();
};



window.switchStoreTab = function(tab) {
    currentStoreTab = tab;
    openStore(); // إعادة رسم الشاشة
};

function renderStoreItems() {
    const container = document.getElementById('store-content-area');
    const data = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    // 🔥 نمرر الرصيد المتاح للبطاقات وليس إجمالي الخبرة
    const balance = (data.xp || 0) - (data.spentXp || 0);
    const owned = data.purchasedItems || []; 

    let html = '<div class="store-grid">';

    if (currentStoreTab === 'covers') {
        const ownedCovers = data.purchasedCovers || [];
        html += profileCovers.map(item => {
            const isOwned = ownedCovers.includes(item.id);
            const isEquipped = data.currentCover === item.url;
            return generateStoreCardHTML(item, isOwned, isEquipped, balance, 'cover', currentLang === 'en' ? item.name_en : item.name_ar, item.url);
        }).join('');
    } 
    else if (currentStoreTab === 'titles') {
        html += storeItemsDB.titles.map(item => {
            const isOwned = owned.includes(item.id);
            const isEquipped = data.currentTitle === item.val;
            const isEn = currentLang === 'en';
            const name = isEn ? item.val_en : item.val;
            
            const badgeContent = isEn 
                ? `<i class="${item.icon}"></i> <span>${name}</span>`
                : `<span>${name}</span> <i class="${item.icon}"></i>`;
            
            const preview = `
                <div style="height: 80px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px;">
                    <div class="title-badge ${item.tier}">
                        ${badgeContent}
                    </div>
                </div>
            `;
            return generateStoreCardHTML(item, isOwned, isEquipped, balance, 'title', preview, item.val);
        }).join('');
    }
    else if (currentStoreTab === 'borders') {
        html += storeItemsDB.borders.map(item => {
            const isOwned = owned.includes(item.id);
            const isEquipped = data.currentBorder === item.val;
            const name = currentLang === 'en' ? item.name_en : item.name_ar;
            const shopAvatarUrl = data.photoURL || 'https://i.ibb.co/9mPmHXkh/cropped-circle-image-2.png';
            const preview = `
            <div style="height: 100px; display: flex; align-items: center; justify-content: center; margin-bottom: 15px; overflow: visible;">
                <div class="avatar-pro-wrapper ${item.val}" style="transform: scale(0.65);">
                    <div class="profile-avatar-img" style="background-color: var(--secondary-color); background-image: url('${shopAvatarUrl}');"></div>
                </div>
            </div>
            <p style="color:white; font-weight:bold; margin: 0 0 15px 0;">${name}</p>`;

            return generateStoreCardHTML(item, isOwned, isEquipped, balance, 'border', preview, item.val);
        }).join('');
    }
    else if (currentStoreTab === 'themes') {
        const defaultThemeEquipped = (!data.currentTheme || data.currentTheme === 'default');
        html += `
            <div class="store-item-card ${defaultThemeEquipped ? 'equipped-glow' : ''}">
                <div style="font-size: 2.5rem; color: #00f2a7; margin-bottom: 10px; text-shadow: 0 0 15px #00f2a7;"><i class="fa-solid fa-bolt"></i></div>
                <h4 style="color: white; margin-bottom: 10px;">${currentLang === 'en' ? 'Neon Tech (Default)' : 'النيون (الافتراضي)'}</h4>
                <button class="btn-primary" style="width: 100%; padding: 8px; ${defaultThemeEquipped ? 'background:#4CAF50; border-color:#4CAF50; color:white;' : 'background:transparent; color:#00f2a7;'}" ${defaultThemeEquipped ? 'disabled' : `onclick="equipStoreItem('theme', 'default')"`}>
                    ${defaultThemeEquipped ? (currentLang==='en'?'Equipped':'مُستخدم') : (currentLang==='en'?'Equip':'استخدام')}
                </button>
            </div>
        `;

        html += storeItemsDB.themes.map(item => {
            const isOwned = owned.includes(item.id);
            const isEquipped = data.currentTheme === item.val;
            const name = currentLang === 'en' ? item.name_en : item.name_ar;
            const preview = `
            <div style="font-size: 2.5rem; color: ${item.color}; margin-bottom: 10px; text-shadow: 0 0 15px ${item.color};">
                <i class="${item.icon}"></i>
            </div>
            <h4 style="color: white; margin-bottom: 10px;">${name}</h4>`;
            return generateStoreCardHTML(item, isOwned, isEquipped, balance, 'theme', preview, item.val);
        }).join('');
    }

    html += '</div>';
    container.innerHTML = html;
}

function generateStoreCardHTML(item, isOwned, isEquipped, userXP, type, previewHTML, val) {
    let btnHTML = '';
    const canAfford = userXP >= item.price;
    
    if (isEquipped) {
        btnHTML = `<button class="btn-primary" style="width: 100%; padding: 8px; background: #4CAF50; color: white; border-color: #4CAF50;" disabled>${currentLang === 'en' ? 'Equipped' : 'مُستخدم'}</button>`;
    } else if (isOwned) {
        btnHTML = `<button class="btn-primary" style="width: 100%; padding: 8px; background: var(--primary-color); color: var(--secondary-color);" onclick="equipStoreItem('${type}', '${val}')">${currentLang === 'en' ? 'Equip' : 'استخدام'}</button>`;
    } else {
        const btnStyle = canAfford ? 'color: #FFD700; border-color: #FFD700; background: rgba(255, 215, 0, 0.1);' : 'color: var(--slate); border-color: var(--slate); background: rgba(255, 255, 255, 0.05); cursor: not-allowed;';
        // تمرير الـ id والقيمة
        btnHTML = `<button class="btn-primary" style="width: 100%; padding: 8px; ${btnStyle}" ${canAfford ? `onclick="buyStoreItem('${type}', '${item.id}', ${item.price}, '${val}')"` : ''}>
            ${item.price.toLocaleString()} XP <i class="fa-solid fa-gem" style="font-size: 0.8rem;"></i>
        </button>`;
    }


    let topContent = type === 'cover' 
        ? `<div class="cover-img-wrapper"><img src="${val}">${isOwned ? `<div class="owned-badge"><i class="fa-solid fa-check"></i></div>` : ''}</div><h4 style="color:white; margin:10px 0; font-size:0.9rem;">${previewHTML}</h4>`
        : previewHTML;

    return `<div class="store-item-card ${isEquipped ? 'equipped-glow' : ''}">${topContent}${btnHTML}</div>`;
}


// دالة الشراء الموحدة (مترجمة ومعدلة لمنع نزول المستوى)

window.buyStoreItem = async function(type, itemId, price, val) {
    const user = auth.currentUser; 
    if (!user) return;
    
    let data = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    let currentXp = data.xp || 0;
    let currentSpent = data.spentXp || 0;
    let balance = currentXp - currentSpent;

    if (balance < price) { 
        showToast(currentLang === 'en' ? "Not enough XP!" : "نقاطك ما بتكفي!"); 
        return; 
    }
    
    if(!confirm(currentLang === 'en' ? `Buy for ${price} XP?` : `تأكيد الشراء بـ ${price} XP؟`)) return;

    // 🔥 تغيير شكل الزر لإظهار التحميل (لمنع الكبس السريع مرتين)
    const btn = event.target.closest('button');
    let originalHtml = '';
    if (btn) {
        originalHtml = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        btn.disabled = true;
    }

    try {
        // 🛡️ توجيه طلب الشراء للسيرفر المحمي
        const secureBuyCall = firebase.functions().httpsCallable('secureBuyItem');
        const result = await secureBuyCall({ 
            itemType: type, 
            itemId: itemId, 
            price: price, 
            itemVal: val 
        });

        // إذا السيرفر راجع وقال "تم الشراء وخصم الرصيد" بنحدث الشاشة
        if (result.data.success) {
            
            data.spentXp = currentSpent + price;

            if (type === 'cover') {
                if (!data.purchasedCovers) data.purchasedCovers = [];
                data.purchasedCovers.push(itemId);
                data.currentCover = val;
            } else {
                if (!data.purchasedItems) data.purchasedItems = [];
                data.purchasedItems.push(itemId);
                
                if(type === 'title') data.currentTitle = val;
                if(type === 'border') data.currentBorder = val;
                if(type === 'theme') { 
                    data.currentTheme = val; 
                    applyAppTheme(val); 
                }
            }

            localStorage.setItem('currentUser', JSON.stringify(data));
            showToast(currentLang === 'en' ? " Congrats, Beast!" : " مبروك يا وحش!"); 
            openStore(); // تحديث شاشة المتجر لعرض الزر الأخضر (مُستخدم)
        }

    } catch(e) { 
        console.error(e);
        // إذا السيرفر رفض (بسبب قلة الرصيد أو محاولة غش)
        showToast(currentLang === 'en' ? "Purchase failed!" : "فشل الشراء! قد يكون رصيدك غير كافٍ.");
        
        // إرجاع الزر لشكله الطبيعي
        if (btn) {
            btn.innerHTML = originalHtml;
            btn.disabled = false;
        }
    }
};


// دالة الاستخدام الموحدة (مترجمة)
window.equipStoreItem = async function(type, val) {
    const user = auth.currentUser; if (!user) return;
    let data = JSON.parse(localStorage.getItem('currentUser') || '{}');
    let updates = {};

    if(type === 'cover') { data.currentCover = val; updates.currentCover = val; }
    if(type === 'title') { data.currentTitle = val; updates.currentTitle = val; }
    if(type === 'border') { data.currentBorder = val; updates.currentBorder = val; }
    if(type === 'theme') { data.currentTheme = val; updates.currentTheme = val; applyAppTheme(val); }

    localStorage.setItem('currentUser', JSON.stringify(data));
    try {
        await db.collection('users').doc(user.uid).update(updates);
        showToast(currentLang === 'en' ? " Equipped successfully!" : " تم التجهيز!"); 
        openStore();
    } catch(e) { console.error(e); }
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
        { id: 'w_v1', type: 'volume', target: 30000, xp: 350, ar: 'أسبوع الإحماء', en: 'Warmup Week', desc_ar: 'ارفع إجمالي 30000 كجم هذا الأسبوع', desc_en: 'Lift 30,000 total this week' },
        { id: 'w_v2', type: 'volume', target: 35000, xp: 600, ar: 'عمل شاق', en: 'Hard Work', desc_ar: 'ارفع إجمالي 35000 كجم هذا الأسبوع', desc_en: 'Lift 35,000 "kg total this week' },
        { id: 'w_v3', type: 'volume', target: 40000, xp: 750, ar: 'دبابة بشرية', en: 'Human Tank', desc_ar: 'ارفع إجمالي 40000 كجم هذا الأسبوع', desc_en: 'Lift 40,000 kg total this week' },
        { id: 'w_v4', type: 'volume', target: 45000, xp: 1000, ar: 'أسطورة النادي', en: 'Gym Legend', desc_ar: 'ارفع إجمالي 45000 كجم هذا الأسبوع', desc_en: 'Lift 45,000 kg total this week' },

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

    if (activeQuests.length === 0) {
        container.innerHTML = `<p style="text-align:center; color:var(--slate);">${isEn ? 'No quests right now.' : 'لا توجد مهام حالياً.'}</p>`;
        return;
    }

    // فرز: الأسبوعية أولاً ثم اليومية
    activeQuests.sort((a, b) => (b.id.startsWith('w_') ? 1 : 0) - (a.id.startsWith('w_') ? 1 : 0));

    // 1. رسم المهام أولاً
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

        // 🔥 التعديل هنا: شارة فخمة للعداد الأسبوعي (تصغير الخط، منع الكسر، ومربع أنيق)
        let weeklyBadge = isWeekly 
            ? `<span style="display:inline-block; font-size:0.65rem; background: rgba(255,215,0,0.15); color: #FFD700; padding: 2px 6px; border-radius: 6px; border: 1px solid rgba(255,215,0,0.3); margin: 0 4px; font-weight: bold; white-space: nowrap;"><i class="fa-regular fa-clock"></i> <span class="weekly-timer-text">...</span></span>` 
            : '';

        return `
            <div class="quest-item ${isWeekly ? 'weekly' : ''}">
                ${overlayHTML}
                <div class="quest-header">
                    <div style="flex: 1; display: flex; align-items: center; flex-wrap: wrap; gap: 4px;">
                        <h4 class="quest-title" style="margin:0;">${iconHtml} ${title}</h4>
                        ${weeklyBadge}
                        <p class="quest-desc" style="width: 100%; margin-top: 2px;">${desc}</p>
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

    // 2. تحديث العدادات (اليومية والأسبوعية معاً)
    const timerEl = document.getElementById('quest-timer');
    
    const updateTimers = () => {
        const now = new Date();
        
        // --- حساب الوقت للمهام اليومية (لمنتصف الليل) ---
        if (timerEl) {
            const tomorrow = new Date(now);
            tomorrow.setHours(24, 0, 0, 0); 
            const dailyTimeLeftMs = tomorrow - now;
            const hours = Math.floor(dailyTimeLeftMs / (1000 * 60 * 60));
            const minutes = Math.floor((dailyTimeLeftMs % (1000 * 60 * 60)) / (1000 * 60));
            
            timerEl.innerText = isEn 
                ? `Resets in ${hours}h ${minutes}m` 
                : `تتجدد خلال ${hours}س و${minutes}د`;
        }

        // --- حساب الوقت للمهام الأسبوعية (لمنتصف ليل يوم الإثنين القادم) ---
        let nextMonday = new Date(now);
        nextMonday.setHours(0, 0, 0, 0);
        let daysUntilMonday = (8 - nextMonday.getDay()) % 7;
        if (daysUntilMonday === 0) daysUntilMonday = 7; // إذا كان اليوم اثنين، الأسبوع القادم بعد 7 أيام
        nextMonday.setDate(nextMonday.getDate() + daysUntilMonday);

        const weeklyTimeLeftMs = nextMonday - now;
        const weeklyDays = Math.floor(weeklyTimeLeftMs / (1000 * 60 * 60 * 24));
        const weeklyHoursLeft = Math.floor((weeklyTimeLeftMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        // 🔥 التعديل هنا: نص مختصر وأنيق لمنع المشكلة بالصورة
        let weeklyText = isEn 
            ? `${weeklyDays}d ${weeklyHoursLeft}h` 
            : `${weeklyDays}يوم و${weeklyHoursLeft}س`;

        // حقن النص في المهمة الأسبوعية
        document.querySelectorAll('.weekly-timer-text').forEach(el => {
            el.innerText = weeklyText;
        });
    };
    
    updateTimers(); // تشغيل الحسبة فوراً
    
    // إيقاف أي عداد سابق لتجنب التكرار
    if (window.questTimerInterval) clearInterval(window.questTimerInterval);
    window.questTimerInterval = setInterval(updateTimers, 60000); // تحديث الأرقام كل دقيقة
};


window.updateQuestProgressBatch = async function(updatesObj) {
    const user = auth.currentUser;
    if (!user) return;

    try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (!userDoc.exists) return;

        let serverData = userDoc.data();
        let serverQuests = serverData.quests || { active: [], progress: {} };
        if (!serverQuests.active || serverQuests.active.length === 0) return;

        let progressChanged = false;
        let totalXpGained = 0;
        const isEn = currentLang === 'en';
        if (!serverQuests.progress) serverQuests.progress = {};

        serverQuests.active.forEach(quest => {
            // نتحقق إذا كان نوع المهمة موجود ضمن الكائن المرسل
            if (updatesObj[quest.type] !== undefined) {
                let currentProg = serverQuests.progress[quest.id] || 0;
                let amount = updatesObj[quest.type];

                if (currentProg < quest.target) {
                    if (quest.type === 'dl_combo') {
                        if (amount > currentProg) { serverQuests.progress[quest.id] = amount; progressChanged = true; }
                    } else {
                        serverQuests.progress[quest.id] = currentProg + amount;
                        progressChanged = true;
                    }
                    
                    if (progressChanged && serverQuests.progress[quest.id] >= quest.target && currentProg < quest.target) {
                        totalXpGained += quest.xp;
                        let qName = isEn ? quest.en : quest.ar;
                        setTimeout(() => showToast(`🎯 ${isEn ? 'Quest Completed' : 'تم إنجاز المهمة'}: ${qName}! (+${quest.xp} XP)`), 800);
                    }
                }
            }
        });

        if (progressChanged) {
            await db.collection('users').doc(user.uid).update({ quests: serverQuests });
            let savedData = JSON.parse(localStorage.getItem('currentUser') || '{}');
            savedData.quests = serverQuests;
            localStorage.setItem('currentUser', JSON.stringify(savedData));
            
            if (document.getElementById('active-quests-container')) renderQuests();
            if (totalXpGained > 0) await addXP(totalXpGained, 'quest');
        }
    } catch (error) { console.error("Error updating quests securely:", error); }
};

// دالة لدعم الاستدعاء الفردي القديم لكي لا تتعطل باقي الأزرار
window.updateQuestProgress = async function(actionType, amount = 1) {
    let obj = {};
    obj[actionType] = amount;
    await updateQuestProgressBatch(obj);
};




// تهيئة النظام عند فتح الداشبورد
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('main-content-area')) {
        setTimeout(initQuests, 500); 
    }
});


// 🆕 متغيرات التوقيت المطلق ومنع انطفاء الشاشة
let wakeLock = null;
let liveStartTimeStamp = 0;
let restTargetTimeStamp = 0;

// دالة إبقاء الشاشة مضاءة
async function requestWakeLock() {
    try {
        if ('wakeLock' in navigator) {
            wakeLock = await navigator.wakeLock.request('screen');
        }
    } catch (err) {
        console.error('Wake Lock error:', err);
    }
}

// دالة السماح للشاشة بالانطفاء (عند إنهاء التمرين)
function releaseWakeLock() {
    if (wakeLock !== null) {
        wakeLock.release().then(() => { wakeLock = null; });
    }
}

// 🆕 مستمع حالة المتصفح (مخفي / ظاهر)
document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState === 'visible' && liveWorkoutActive) {
        // 1. إعادة تفعيل إضاءة الشاشة فور العودة
        requestWakeLock();

        // 2. تحديث عداد التمرين الكلي فوراً
        liveSeconds = Math.floor((Date.now() - liveStartTimeStamp) / 1000);
        const m = String(Math.floor(liveSeconds / 60)).padStart(2, '0');
        const s = String(liveSeconds % 60).padStart(2, '0');
        const liveTimerEl = document.getElementById('live-timer');
        if(liveTimerEl) liveTimerEl.innerText = `${m}:${s}`;

        // 3. تحديث عداد الراحة فوراً إذا كان شغالاً
        const restOverlay = document.getElementById('rest-timer-overlay');
        if (restOverlay && restOverlay.style.display !== 'none') {
            let timeLeft = Math.ceil((restTargetTimeStamp - Date.now()) / 1000);
            if (timeLeft <= 0) {
                skipRest();
            } else {
                const restText = document.getElementById('rest-countdown');
                if (restText) restText.innerText = timeLeft;
            }
        }
    }
});

// ==========================================
// 🛡️ نظام عصابات الحديد (Guild Engine)
// ==========================================


// 1. شاشة "لا يوجد كلان" وتأسيس كلان جديد
// ==========================================
// 🛡️ نظام عصابات الحديد (Premium Guild Engine)
// ==========================================



// 1. شاشة (لا يوجد كلان) - فخمة جداً
function renderNoGuildScreen(t) {
    const area = document.getElementById('guild-content-area');
    const createTitle = currentLang === 'en' ? 'Forge a Clan' : 'تأسيس عصابة';
    const joinTitle = currentLang === 'en' ? 'Join a Clan' : 'الانضمام لعصابة';
    const tagPlaceholder = currentLang === 'en' ? 'Enter Tag (e.g., A1B2)' : 'أدخل الرمز (مثل: A1B2)';
    const joinBtnText = currentLang === 'en' ? 'Search & Join' : 'بحث وانضمام';

    area.innerHTML = `
        <div class="guild-action-container">
            <div class="mythic-card-epic">
                <i class="fa-solid fa-dragon main-icon" style="color: #FFD700;"></i>
                <h3 style="color: white; margin-bottom: 15px; font-size: 1.4rem; font-weight: 900;">${createTitle}</h3>
                <p style="color: var(--slate); font-size: 0.85rem; margin-bottom: 20px;">${currentLang === 'en' ? 'Cost: 1000 XP' : 'التكلفة: 1000 XP'}</p>
                
                <input type="text" id="new-guild-name" class="epic-input-premium" placeholder="${t.guild_name}" maxlength="15" autocomplete="off">
                <input type="text" id="new-guild-tag" class="epic-input-premium" placeholder="${t.guild_tag}" maxlength="4" style="text-transform: uppercase;" autocomplete="off">
                
    <button class="btn-epic-premium btn-epic-gold" onclick="createGuild()">
    <i class="fa-solid fa-hammer"></i> ${t.create_guild.replace('(1000 XP)', '')}
</button>

            </div>

            <div class="mythic-card-epic join-card">
                <i class="fa-solid fa-magnifying-glass main-icon" style="color: #00f2a7;"></i>
                <h3 style="color: white; margin-bottom: 15px; font-size: 1.4rem; font-weight: 900;">${joinTitle}</h3>
                <p style="color: var(--slate); font-size: 0.85rem; margin-bottom: 20px;">${currentLang === 'en' ? 'Enter a 4-letter tag' : 'أدخل رمز العصابة المكون من 4 أحرف'}</p>
                
                <input type="text" id="search-guild-tag" class="epic-input-premium" placeholder="${tagPlaceholder}" maxlength="4" style="text-transform: uppercase;" autocomplete="off">
                
<button class="btn-epic-premium btn-epic-neon" style="margin-top: 61px;" onclick="joinGuildByTag()">
    <i class="fa-solid fa-right-to-bracket"></i> ${joinBtnText}
</button>

            </div>
        </div>
    `;
}

window.openGuildHub = async function() {
    // 🟢 الحل هنا: إجبار الشاشة على الصعود للأعلى بنعومة بمجرد فتح التبويب
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if(window.innerWidth < 768) document.getElementById('sidebar').classList.add('collapsed');
    const mainContent = document.getElementById('main-content-area');
    if (!mainContent) return;

    if (!mainContent.dataset.originalContent) {
        mainContent.dataset.originalContent = mainContent.innerHTML;
    }

    const t = translations[currentLang || 'ar'] || {};
    const user = auth.currentUser;

    if (!user) {
        showToast(currentLang === 'en' ? "Please wait, loading account..." : "انتظر جاري تحميل الحساب...");
        return;
    }

    let userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    mainContent.innerHTML = `
        <header class="top-bar" style="margin-bottom: 20px;">
            <div class="header-row">
                <button id="back-to-dash-btn" class="btn-primary" style="padding: 5px 15px;">${t.back || 'رجوع'}</button>
                <h1 style="margin: 0 15px; font-weight: 900; color: #FFD700; text-shadow: 0 0 10px rgba(255,215,0,0.3);">
                    <i class="fa-solid fa-shield-cat"></i> ${t.guild_hub || 'العصابات'}
                </h1>
            </div>
        </header>
        <section id="guild-content-area" class="performance-container" style="animation: fadeIn 0.4s;">
            <div style="text-align:center; padding: 50px;"><i class="fa-solid fa-spinner fa-spin fa-3x" style="color:#FFD700;"></i></div>
        </section>
    `;
    document.getElementById('back-to-dash-btn').onclick = backToDashboard;

    try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        if (userDoc.exists) {
            userData = userDoc.data();
            localStorage.setItem('currentUser', JSON.stringify(userData));
        }

        if (userData.clanId) {
            loadActiveGuild(userData.clanId, user.uid);
        } else {
            renderNoGuildScreen(t);
        }
    } catch(e) {
        console.error("خطأ في فتح العصابة:", e);
        renderNoGuildScreen(t); 
    }
};

// ==========================================
// 1. الواجهة الهادئة (Idle Room) - قبل بدء الحرب
// ==========================================
window.buildWarIdleHTML = function(clan, t, isLeader) {
    let lang = localStorage.getItem('lang') || 'ar';
    const isSearching = clan.warStatus === 'searching';
    
    // 🟢 ميزة ذكية: زر دائم لعرض نتائج آخر حرب عشان ما تضيع الإحصائيات أبداً!
    let lastWarBtn = clan.lastWarId ? `
        <button class="btn-primary" style="width: 100%; padding: 10px; font-size: 1rem; margin-bottom: 20px; background: rgba(255, 215, 0, 0.1); color: #FFD700; border-color: #FFD700;" onclick="viewWarResults('${clan.lastWarId}', '${clan.id}')">
            <i class="fa-solid fa-chart-simple"></i> ${lang==='en'?'View Last War Results':'سجلات الحرب السابقة'}
        </button>
    ` : '';

    return `
        <div class="war-arena-container">
            <div class="war-arena-overlay"></div>
            <div class="war-content" style="text-align: center;">
                <i class="fa-solid fa-skull-crossbones" style="font-size: 4rem; color: ${isSearching ? '#00f2a7' : 'var(--slate)'}; margin-bottom: 20px; ${isSearching ? 'animation: pulseXP 1s infinite alternate;' : ''}"></i>
                
                <h3 style="color: white; font-weight: 900; margin-bottom: 15px; font-size: 1.5rem;">
                    ${isSearching ? (lang==='en'?'Searching for Prey...':'الرادار يبحث عن فريسة...') : (lang==='en'?'War Room is Idle':'غرفة الحرب هادئة')}
                </h3>
                
                ${lastWarBtn}

                <p style="color: #aaa; font-size: 0.9rem; margin-bottom: 25px; line-height: 1.6;">
                    ${lang==='en'?'Ready your members. Total lifted weights during the war decide the winner.':'جهزوا عتادكم. يمكن للزعيم بدء البحث عن كلان عدو. إجمالي الأوزان المرفوعة يحدد المنتصر.'}
                </p>
                
                ${isLeader ? 
                    `<button class="btn-primary" style="width: 100%; padding: 15px; font-size: 1.1rem; ${isSearching ? 'background: rgba(255,255,255,0.1); color:var(--slate); border-color:var(--slate);' : 'background: rgba(255,77,77,0.15); color: #ff4d4d; border-color: #ff4d4d; box-shadow: 0 0 20px rgba(255,77,77,0.3);'}" onclick="searchForWar('${clan.id}')" ${isSearching ? 'disabled' : ''}>
                        <i class="fa-solid ${isSearching ? 'fa-radar fa-spin' : 'fa-crosshairs'}"></i> ${isSearching ? (lang==='en'?'Scanning Radar...':'الرادار يعمل...') : (lang==='en'?'Find Prey (Start War)':'البحث عن فريسة (بدء حرب)')}
                    </button>` 
                    : `<p style="color: #FFD700; font-weight: bold; padding: 10px; border: 1px dashed #FFD700; border-radius: 8px; background: rgba(255,215,0,0.1);">${lang==='en'?'Only the Leader can start a war.':'الزعيم فقط من يمتلك صلاحية إعلان الحرب.'}</p>`
                }
            </div>
        </div>
    `;
};


// ==========================================
// 2. الواجهة المشتعلة (Active War) - الإحصائيات وشد الحبل
// ==========================================
window.buildWarScreenHTML = function(clan, t) {
    // تشغيل مستمع الحرب اللحظي بمجرد فتح الشاشة المشتعلة
    setTimeout(() => listenToActiveWar(clan.currentWarId, clan.id), 100);

    const lang = localStorage.getItem('lang') || 'ar';
    const kgLabel = lang === 'en' ? 'Lifted KG' : 'KG المرفوع';
    const warActiveTitle = lang === 'en' ? 'Bloodbath in Progress!' : 'حرب طاحنة جارية!';
    const descText = lang === 'en' 
        ? 'Lift heavy in your daily workouts! Total logged volume pushes the rope towards your enemy.' 
        : 'كل كيلو بترفعوه بالتمرين بنحسب هون! شدوا الحبل وادعسوا عليهم.';

    return `
        <div class="war-arena-container">
            <div class="war-arena-overlay"></div>
            <div class="war-content">
                
                <h3 style="text-align:center; color:#ff4d4d; font-weight: 900; margin-bottom: 10px; letter-spacing:1px; text-shadow: 0 0 10px #ff4d4d; animation: pulseXP 1s infinite alternate;">
                    <i class="fa-solid fa-fire-flame-curved"></i> ${warActiveTitle} <i class="fa-solid fa-fire-flame-curved"></i>
                </h3>

                <!-- ⏳ العداد التنازلي -->
                <div id="war-countdown-timer" style="font-size: 2.2rem; font-weight: 900; color: #FFD700; text-align: center; margin-bottom: 20px; text-shadow: 0 0 15px rgba(255,215,0,0.6); font-family: monospace;">
                    <i class="fa-solid fa-spinner fa-spin" style="font-size: 1.5rem;"></i>
                </div>
                
                <!-- ⚔️ لوحة المواجهة -->
                <div class="epic-vs-board">
                    <div class="clan-side-war mine">
                        <div class="clan-name-war" id="war-mine-name">Loading...</div>
                        <div class="clan-members-war"><i class="fa-solid fa-users"></i> <span id="war-mine-members">0</span>/50</div>
                        <div class="clan-tag-war" id="war-mine-tag" style="color:var(--slate); font-size:0.85rem; font-weight:bold; margin-bottom:10px;">[...]</div>
                        
                        <div class="clan-score-box">
                            <div id="war-score-mine" class="clan-score-war">0</div>
                            <span class="score-label">${kgLabel}</span>
                        </div>
                    </div>
                    
                    <div class="vs-badge-pro">VS</div>
                    
                    <div class="clan-side-war enemy">
                        <div class="clan-name-war" id="war-enemy-name">Loading...</div>
                        <div class="clan-members-war"><i class="fa-solid fa-users"></i> <span id="war-enemy-members">0</span>/50</div>
                        <div class="clan-tag-war" id="war-enemy-tag" style="color:var(--slate); font-size:0.85rem; font-weight:bold; margin-bottom:10px;">[...]</div>
                        
                        <div class="clan-score-box">
                            <div id="war-score-enemy" class="clan-score-war">0</div>
                            <span class="score-label">${kgLabel}</span>
                        </div>
                    </div>
                </div>

                <!-- 🪢 شد الحبل -->
                <div class="tug-of-war-premium">
                    <div id="tug-mine" class="tug-fill-mine" style="width: 50%;"></div>
                    <div id="tug-enemy" class="tug-fill-enemy" style="width: 50%;"></div>
                </div>
                
                <p style="text-align:center; color: #ccc; font-size: 0.85rem; margin-top: 15px; background: rgba(0,0,0,0.5); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1);">
                    ${descText}
                </p>

                <!-- 👑 قائمة أبطال الحرب اللحظية -->
                <div id="war-live-members-list" style="margin-top:20px;"></div>
            </div>
        </div>
    `;
};


// ==========================================
// 3. المراقب اللحظي (Live Listener) لنتائج الحرب الحية
// ==========================================
window.listenToActiveWar = function(warId, myClanId) {
    if (!warId) return;

    if (window.activeWarUnsubscribe) window.activeWarUnsubscribe();

    window.activeWarUnsubscribe = db.collection('wars').doc(warId).onSnapshot(doc => {
        if (!doc.exists) return;
        const war = doc.data();

        let myData = war.clan1.id === myClanId ? war.clan1 : war.clan2;
        let enemyData = war.clan1.id === myClanId ? war.clan2 : war.clan1;

        const updateEl = (id, val) => { const el = document.getElementById(id); if (el) el.innerText = val; };
        
        // تحديث نقاط المواجهة الأساسية
        updateEl('war-mine-name', myData.name || 'عصابتي');
        updateEl('war-mine-tag', '[' + (myData.tag || '...') + ']');
        updateEl('war-mine-members', myData.membersCount || 1);
        updateEl('war-score-mine', (myData.score || 0).toLocaleString());

        updateEl('war-enemy-name', enemyData.name || 'العدو');
        updateEl('war-enemy-tag', '[' + (enemyData.tag || '...') + ']');
        updateEl('war-enemy-members', enemyData.membersCount || 1);
        updateEl('war-score-enemy', (enemyData.score || 0).toLocaleString());

        // شد الحبل الديناميكي
        let totalScore = (myData.score || 0) + (enemyData.score || 0);
        let myPercentage = 50, enemyPercentage = 50;
        if (totalScore > 0) {
            myPercentage = (myData.score / totalScore) * 100;
            enemyPercentage = (enemyData.score / totalScore) * 100;
            if (myPercentage < 10) { myPercentage = 10; enemyPercentage = 90; }
            if (enemyPercentage < 10) { enemyPercentage = 10; myPercentage = 90; }
        }

        const tugMine = document.getElementById('tug-mine');
        const tugEnemy = document.getElementById('tug-enemy');
        if (tugMine) tugMine.style.width = myPercentage + '%';
        if (tugEnemy) tugEnemy.style.width = enemyPercentage + '%';

        // تشغيل العداد التنازلي للحرب
        if (war.startTime && war.status === 'active' && typeof startWarTimer === 'function') {
            startWarTimer(war.startTime, warId, myClanId, myData.score, enemyData.score);
        }

        // 👑 تحديث قائمة أبطال الحرب اللحظية (Leaderboards الداخلية)
        const listContainer = document.getElementById('war-live-members-list');
        if (listContainer) {
            const lang = localStorage.getItem('lang') || 'ar';
            const renderMembers = (clanData) => {
                let membersArr = [];
                if (clanData.members) {
                    for (let uid in clanData.members) { membersArr.push(clanData.members[uid]); }
                }
                // ترتيب الأعضاء حسب الوزن المرفوع من الأعلى للأقل
                membersArr.sort((a,b) => (b.volume || 0) - (a.volume || 0));
                
                if (membersArr.length === 0) return `<p style="color:var(--slate); font-size:0.8rem; text-align:center;">${lang==='en'?'No data':'لا توجد بيانات'}</p>`;
                
                return membersArr.map((m, i) => `
                    <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.05); padding:8px 12px; border-radius:8px; margin-bottom:5px;">
                        <div style="display:flex; align-items:center; gap:10px;">
                            <span style="color:var(--slate); font-weight:bold; font-size:0.8rem;">#${i+1}</span>
                            <img src="${m.photo || 'https://i.ibb.co/9mPmHXkh/cropped-circle-image-2.png'}" style="width:30px; height:30px; border-radius:50%; object-fit:cover;">
                            <span style="color:white; font-size:0.85rem; font-weight:bold;">${m.name}</span>
                        </div>
                        <span style="color:var(--primary-color); font-weight:900; font-size:0.9rem;">${(m.volume||0).toLocaleString()} kg</span>
                    </div>
                `).join('');
            };

            listContainer.innerHTML = `
                <div style="display:flex; flex-direction:column; gap:15px;">
                    <div style="background:rgba(0,0,0,0.3); border-radius:12px; padding:15px; border:1px solid rgba(0,242,167,0.2);">
                        <h4 style="color:#00f2a7; margin-bottom:15px; border-bottom:1px solid rgba(0,242,167,0.2); padding-bottom:5px;">${lang==='en'?'Our Heroes':'أبطالنا'}</h4>
                        ${renderMembers(myData)}
                    </div>
                    <div style="background:rgba(0,0,0,0.3); border-radius:12px; padding:15px; border:1px solid rgba(255,77,77,0.2);">
                        <h4 style="color:#ff4d4d; margin-bottom:15px; border-bottom:1px solid rgba(255,77,77,0.2); padding-bottom:5px;">${lang==='en'?'Enemy Forces':'قوات العدو'}</h4>
                        ${renderMembers(enemyData)}
                    </div>
                </div>
            `;
        }
    });
};



let chatUnsubscribe = null;

window.initClanChat = function(clanId, myUid) {
    const chatBox = document.getElementById('clan-chat-messages');
    if(!chatBox) return;
    
    // تنظيف المستمع القديم
    if(chatUnsubscribe) chatUnsubscribe();
    
    // جلب الرسائل التي لم يمر عليها 48 ساعة فقط
    let twoDaysAgo = new Date();
    twoDaysAgo.setHours(twoDaysAgo.getHours() - 48);

    chatUnsubscribe = db.collection('clans').doc(clanId).collection('chat')
        .where('timestamp', '>=', twoDaysAgo)
        .orderBy('timestamp', 'asc')
        .onSnapshot(snapshot => {
            let lang = localStorage.getItem('lang') || 'ar'; // سحب اللغة الحالية
            chatBox.innerHTML = '';
            if (snapshot.empty) {
                chatBox.innerHTML = `<div style="text-align:center; color:var(--slate); margin-top:50px;"><i class="fa-solid fa-comments fa-2x"></i><p>${lang === 'en' ? 'No recent messages.' : 'لا يوجد رسائل حديثة.'}</p></div>`;
                return;
            }

            snapshot.forEach(doc => {
                let msg = doc.data();
                let isMine = msg.senderId === myUid;
                chatBox.innerHTML += `
                    <div class="chat-bubble ${isMine ? 'mine' : 'others'}">
                        <div class="chat-sender-name">${msg.senderName}</div>
                        ${msg.text}
                    </div>
                `;
            });
            chatBox.scrollTop = chatBox.scrollHeight; 
        });
};

window.sendClanMessage = async function(clanId, myUid) {
    const input = document.getElementById('clan-chat-input');
    const text = input.value.trim();
    let lang = localStorage.getItem('lang') || 'ar';
    if(!text) return;

    let userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    let senderName = userData.firstName || (lang === 'en' ? 'Captain' : 'الكابتن');
    
    input.value = ''; 
    
    try {
        await db.collection('clans').doc(clanId).collection('chat').add({
            text: text,
            senderId: myUid,
            senderName: senderName,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch(e) { 
        console.error(e); 
        showToast(lang === 'en' ? "Failed to send message!" : "فشل إرسال الرسالة!"); 
    }
};


// =================== نظام الإعدادات والرادار ===================
const emblemIcons = ['fa-dragon', 'fa-shield-halved', 'fa-skull', 'fa-fire-flame-curved', 'fa-bolt', 'fa-ghost', 'fa-khanda', 'fa-crow', 'fa-paw', 'fa-moon', 'fa-meteor', 'fa-crown', 'fa-jedi', 'fa-spider', 'fa-biohazard', 'fa-radiation', 'fa-mask', 'fa-user-ninja', 'fa-hat-wizard', 'fa-gem'];
const emblemColors = ['#FFD700', '#00f2a7', '#ff4d4d', '#00d4ff', '#b5179e', '#ff9f43', '#ffffff', '#a8a8a8'];

window.initSettingsUI = function(currentEmblem, currentColor) {
    const grid = document.getElementById('emblem-selection-grid');
    const colorGrid = document.getElementById('color-selection-grid');
    if(!grid || !colorGrid) return;

    // بناء الشعارات
    grid.innerHTML = emblemIcons.map(icon => `
        <div class="emblem-option ${icon === currentEmblem ? 'selected' : ''}" onclick="selectEmblem(this, '${icon}')">
            <i class="fa-solid ${icon}"></i>
        </div>
    `).join('');

    // بناء الألوان
    colorGrid.innerHTML = emblemColors.map(color => `
        <div class="color-option ${color === currentColor ? 'selected' : ''}" style="background-color: ${color}; box-shadow: ${color === currentColor ? '0 0 10px '+color : 'none'};" onclick="selectColor(this, '${color}')"></div>
    `).join('');
};

window.selectEmblem = function(element, iconClass) {
    document.querySelectorAll('.emblem-option').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
    document.getElementById('selected-emblem-val').value = 'fa-solid ' + iconClass;
};

window.selectColor = function(element, colorVal) {
    document.querySelectorAll('.color-option').forEach(el => { el.classList.remove('selected'); el.style.boxShadow = 'none'; });
    element.classList.add('selected');
    element.style.boxShadow = '0 0 10px ' + colorVal;
    document.getElementById('selected-color-val').value = colorVal;
};

window.saveClanSettings = async function(clanId) {
    let lang = localStorage.getItem('lang') || 'ar';
    const newName = document.getElementById('edit-clan-name').value.trim();
    const newMotto = document.getElementById('edit-clan-motto').value.trim();
    const newEmblem = document.getElementById('selected-emblem-val').value;
    const newColor = document.getElementById('selected-color-val').value;
    
    if(!newName) { showToast(lang === 'en' ? "Name cannot be empty!" : "لا يمكن ترك الاسم فارغاً!"); return; }

    try {
        await db.collection('clans').doc(clanId).update({
            name: newName,
            motto: newMotto,
            emblem: newEmblem,
            emblemColor: newColor
        });
        showToast(lang === 'en' ? "Clan settings updated successfully! 👑" : "تم تحديث إعدادات العصابة بنجاح! 👑");
    } catch(e) { console.error(e); showToast(lang === 'en' ? "Save failed!" : "فشل الحفظ!"); }
};

// ==========================================
// 📢 دالة الإرسال اللاسلكي للكلان (مع حماية الوقت)
// ==========================================
// ==========================================
// 📢 دالة الإرسال اللاسلكي للكلان (معدلة للتجربة وبدون انتظار)
// ==========================================
window.sendClanBroadcast = async function(clanId) {
    const msg = document.getElementById('broadcast-msg-input').value.trim();
    let lang = localStorage.getItem('lang') || 'ar';
    if(!msg) { showToast(lang === 'en' ? "Type a message first!" : "اكتب رسالة أولاً!"); return; }

    const btn = event.target.closest('button');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

    try {
        const user = auth.currentUser;
        const clanRef = db.collection('clans').doc(clanId);
        const clanDoc = await clanRef.get();
        const clanData = clanDoc.data();

        // 🕒 1. تم إيقاف شرط الساعة مؤقتاً لتتمكن من التجربة براحتك!
        /*
        if (clanData.lastBroadcastAt) {
            const lastTime = clanData.lastBroadcastAt.toDate();
            const now = new Date();
            const diffMs = now - lastTime;
            const diffHours = diffMs / (1000 * 60 * 60);

            if (diffHours < 1) {
                let remainingMinutes = Math.ceil(60 - (diffMs / (1000 * 60)));
                showToast(lang === 'en' ? \`Cooldown! Wait \${remainingMinutes} mins.\` : \`الرادار يحتاج راحة! انتظر \${remainingMinutes} دقيقة.\`);
                btn.disabled = false;
                btn.innerHTML = originalText;
                return;
            }
        }
        */

        const members = clanData.members || [];
        let batch = db.batch();

        // 2. إرسال الإشعار لكل الأعضاء (بما فيهم الزعيم)
        members.forEach(m => {
            const notifRef = db.collection('users').doc(m.uid).collection('notifications').doc();
            
            batch.set(notifRef, {
                title: lang === 'en' ? `📢 Clan: ${clanData.name}` : `📢 طاقم: ${clanData.name}`,
                senderName: lang === 'en' ? `Leader of ${clanData.name}` : `زعيم ${clanData.name}`, 

                body: msg,      
                message: msg,   
                text: msg,      // 🚨 هام جداً: لعرض الرسالة في القائمة
                status: 'pending', // 🚨 الحل الجذري الأول: لكي تلتقطه دالة الإشعارات
                type: 'clan_broadcast',
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                createdAt: firebase.firestore.FieldValue.serverTimestamp(), 
                read: false,
                senderId: user.uid,
                pushSent: false 
            });
        });

        // 3. تحديث وقت الإرسال في الكلان
        batch.update(clanRef, {
            lastBroadcastAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        await batch.commit();

        document.getElementById('broadcast-msg-input').value = '';
        showToast(lang === 'en' ? "Broadcast sent successfully!" : "تم الإرسال لجميع الأعضاء بنجاح! ");

    } catch(e) {
        console.error("خطأ في إرسال الإشعار اللاسلكي:", e);
        showToast(lang === 'en' ? "Failed to send!" : "فشل الإرسال! تأكد من اتصالك.");
    }

    btn.disabled = false;
    btn.innerHTML = originalText;
};


window.forceLeaveGuild = async function(clanId, myUid) {
    try {
        let userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
        userData.clanId = null;
        localStorage.setItem('currentUser', JSON.stringify(userData));
        await db.collection('users').doc(myUid).update({ clanId: null });
        openGuildHub();
    } catch (e) {
        console.error(e);
        showToast("خطأ في الخروج الإجباري!");
    }
};


window.showWarResultUI = function(isWinner, isDraw, warId, myClanId) {
    if (document.getElementById('war-result-overlay')) return;

    const lang = localStorage.getItem('lang') || 'ar';
    let title = "", message = "", color = "", icon = "", glowColor = "", fxAnim = "";

    if (isDraw) {
        title = lang === 'en' ? "DRAW!" : "تعادل!";
        message = lang === 'en' ? "It was a tough battle. No XP awarded." : "معركة طاحنة انتهت بالتعادل. لا يوجد خاسر ولا فائز.";
        color = "#ffb84d"; glowColor = "rgba(255, 184, 77, 0.4)"; icon = "fa-handshake-angle"; fxAnim = "pulseNeutral";
    } else if (isWinner) {
        title = lang === 'en' ? "VICTORY!" : "انتصار أسطوري!";
        message = lang === 'en' ? "Your clan crushed the enemies! +1000 XP added." : "لقد سحق كلانك الخصوم بلا رحمة! تمت إضافة 1000 XP.";
        color = "#00f2a7"; glowColor = "rgba(0, 242, 167, 0.5)"; icon = "fa-crown"; fxAnim = "pulseVictory";
    } else {
        title = lang === 'en' ? "DEFEAT!" : "هزيمة مريرة!";
        message = lang === 'en' ? "Your clan lost this time. Train harder!" : "لقد خسر كلانك هذه المعركة. عودوا للانتقام!";
        color = "#ff4d4d"; glowColor = "rgba(255, 77, 77, 0.5)"; icon = "fa-skull-crossbones"; fxAnim = "pulseDefeat";
    }

    const overlay = document.createElement('div');
    overlay.id = "war-result-overlay";
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: radial-gradient(circle at center, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.98) 100%);
        display: flex; justify-content: center; align-items: center;
        z-index: 99999; backdrop-filter: blur(15px);
    `;

    const styleBlock = document.createElement('style');
    styleBlock.innerHTML = `
        @keyframes popEpic { 0% { transform: scale(0.5); opacity: 0; } 70% { transform: scale(1.05); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes ${fxAnim} { 0% { box-shadow: 0 0 20px ${glowColor}, inset 0 0 20px ${glowColor}; } 100% { box-shadow: 0 0 60px ${glowColor}, inset 0 0 40px ${glowColor}; transform: translateY(-5px); } }
        .epic-war-card { background: linear-gradient(135deg, #111 0%, #0a0a0a 100%); border: 2px solid ${color}; border-radius: 20px; padding: 40px 30px; text-align: center; width: 90%; max-width: 420px; animation: popEpic 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards, ${fxAnim} 2s infinite alternate ease-in-out; position: relative; overflow: hidden; }
        .epic-war-card::before { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, ${glowColor} 0%, transparent 60%); opacity: 0.3; pointer-events: none; z-index: 0; }
        .epic-war-icon { font-size: 6rem; color: ${color}; margin-bottom: 15px; filter: drop-shadow(0 0 20px ${color}); position: relative; z-index: 1; }
        .epic-war-title { color: ${color}; font-size: 2.5rem; margin-bottom: 10px; text-transform: uppercase; font-weight: 900; letter-spacing: 2px; text-shadow: 0 0 15px ${color}; position: relative; z-index: 1; }
        .epic-war-btn { background: rgba(0,0,0,0.5); color: white; font-weight: 900; border: 1px solid ${color}; padding: 15px 30px; border-radius: 12px; font-size: 1.1rem; cursor: pointer; transition: 0.3s; width: 100%; box-shadow: 0 0 15px ${glowColor}; position: relative; z-index: 1; text-transform: uppercase; letter-spacing: 1px; }
        .epic-war-btn:hover { background-color: ${color}; color: #000; box-shadow: 0 0 30px ${color}; }
    `;
    document.head.appendChild(styleBlock);

    let btnText = lang === 'en' ? "View War Stats" : "عرض الإحصائيات والأرقام";
    overlay.innerHTML = `
        <div class="epic-war-card">
            <i class="fa-solid ${icon} epic-war-icon"></i>
            <h1 class="epic-war-title">${title}</h1>
            <p style="color: #ddd; font-size: 1.05rem; line-height: 1.6; margin-bottom: 30px; position: relative; z-index: 1; font-weight: bold;">${message}</p>
            <button onclick="viewWarResults('${warId}', '${myClanId}')" class="epic-war-btn">
                <i class="fa-solid fa-chart-simple"></i> ${btnText}
            </button>
        </div>
    `;

    document.body.appendChild(overlay);
};

// 3. شاشة الإحصائيات النهائية (مع زر واحد: علم، العودة للغرفة)
window.viewWarResults = async function(warId, myClanId) {
    const resultOverlay = document.getElementById('war-result-overlay');
    if (resultOverlay) resultOverlay.remove();
    
    let modal = document.getElementById('war-stats-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'war-stats-modal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100vh;
            background: var(--secondary-color); z-index: 999999;
            display: flex; flex-direction: column; overflow-y: auto;
            animation: fadeIn 0.3s ease;
        `;
        document.body.appendChild(modal);
    }
    
    const lang = localStorage.getItem('lang') || 'ar';
    const t = translations[lang] || {};
    
    modal.innerHTML = `
        <header class="top-bar" style="position: sticky; top: 0; background: rgba(10, 20, 41, 0.95); backdrop-filter: blur(10px); z-index: 10; border-bottom: 1px solid rgba(255, 215, 0, 0.3); box-shadow: 0 4px 20px rgba(255, 215, 0, 0.15);">
            <div class="header-row" style="display: flex; justify-content: center; align-items: center; width: 100%; padding: 15px 0;">
                <h1 style="margin: 0; color:#FFD700; font-size: 2rem; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; text-shadow: 0 0 15px #FFD700, 0 0 30px rgba(255, 215, 0, 0.6);">${lang==='en'?'War Results':'نتائج الحرب'}</h1>
            </div>
        </header>
        <div style="text-align:center; padding: 50px;"><i class="fa-solid fa-spinner fa-spin fa-3x" style="color:#FFD700;"></i></div>
    `;

    try {
        const warDoc = await db.collection('wars').doc(warId).get();
        if (!warDoc.exists) {
            modal.innerHTML += `<p style="color:#ff4d4d; text-align:center;">Data lost.</p>`;
            return;
        }
        const warData = warDoc.data();
        
        let myData = warData.clan1.id === myClanId ? warData.clan1 : warData.clan2;
        let enemyData = warData.clan1.id === myClanId ? warData.clan2 : warData.clan1;
        
        let isWinner = myData.score > enemyData.score;
        let isDraw = myData.score === enemyData.score;
        
        let statusTitle = isDraw ? (lang==='en'?'Draw!':'تعادل!') : (isWinner ? (lang==='en'?'Victory!':'انتصار!') : (lang==='en'?'Defeat!':'هزيمة!'));
        let statusColor = isDraw ? '#ffb84d' : (isWinner ? '#00f2a7' : '#ff4d4d');
        
        const renderMembers = (clanData) => {
            let membersArr = [];
            if (clanData.members) {
                for (let uid in clanData.members) {
                    membersArr.push(clanData.members[uid]);
                }
            }
            membersArr.sort((a,b) => b.volume - a.volume);
            
            if (membersArr.length === 0) return `<p style="color:var(--slate); font-size:0.8rem; text-align:center;">${lang==='en'?'No data':'لا توجد بيانات'}</p>`;
            
            return membersArr.map((m, i) => `
                <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.05); padding:8px 12px; border-radius:8px; margin-bottom:5px;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="color:var(--slate); font-weight:bold; font-size:0.8rem;">#${i+1}</span>
                        <img src="${m.photo || 'https://i.ibb.co/9mPmHXkh/cropped-circle-image-2.png'}" style="width:30px; height:30px; border-radius:50%; object-fit:cover;">
                        <span style="color:white; font-size:0.85rem; font-weight:bold;">${m.name}</span>
                    </div>
                    <span style="color:var(--primary-color); font-weight:900; font-size:0.9rem;">${m.volume.toLocaleString()} kg</span>
                </div>
            `).join('');
        };

        // 🟢 الحل المطلوب تماماً: زر واحد للجميع، يعيدك للواجهة الهادئة اللي فيها خيار "البحث عن حرب"
        let actionBtns = `
            <div style="display:flex; gap:10px; margin-top: 20px;">
                <button class="btn-primary" style="width: 100%; padding:15px; background:rgba(0, 242, 167, 0.15); border-color:#00f2a7; color:#00f2a7; font-size: 1.1rem; font-weight: bold; box-shadow: 0 0 15px rgba(0, 242, 167, 0.2);" onclick="document.getElementById('war-stats-modal').remove()">
                    <i class="fa-solid fa-check-double"></i> ${lang==='en'?'Acknowledge & Return':'علم، العودة للغرفة'}
                </button>
            </div>
        `;
        
        modal.innerHTML = `
            <header class="top-bar" style="position: sticky; top: 0; background: rgba(10, 20, 41, 0.95); backdrop-filter: blur(10px); z-index: 10; border-bottom: 2px solid ${statusColor}; box-shadow: 0 5px 25px ${statusColor}44;">
                <div class="header-row" style="display: flex; justify-content: center; align-items: center; width: 100%; padding: 15px 0;">
                    <h1 style="margin: 0; color: ${statusColor}; font-size: 2.2rem; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; text-shadow: 0 0 15px ${statusColor}, 0 0 35px ${statusColor}99, 0 0 50px ${statusColor}44;">${lang==='en'?'War Results':'نتائج الحرب'}</h1>
                </div>
            </header>

            
            <div style="padding: 20px; max-width: 600px; margin: 0 auto; width: 100%; padding-bottom: 50px;">
            <div style="background-image: linear-gradient(180deg, rgba(10,15,25,0.85), rgba(0,0,0,0.95)), url('https://i.ibb.co/KczkyPZg/IMG-4723.png'); background-size: cover; background-position: center; background-repeat: no-repeat; border:2px solid ${statusColor}; border-radius:20px; padding:25px 20px; text-align:center; box-shadow:0 10px 30px rgba(0,0,0,0.5);">

                    <h2 style="color:${statusColor}; font-weight:900; font-size:2.2rem; margin-bottom:5px; text-transform:uppercase; text-shadow: 0 0 15px ${statusColor}88;">${statusTitle}</h2>
                    <p style="color:var(--slate); font-size:0.9rem; margin-bottom:25px;">${lang==='en'?'Final War Results':'النتائج النهائية للحرب'}</p>
                    
                    <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.5); border-radius:15px; padding:15px; margin-bottom:25px; border:1px solid rgba(255,255,255,0.05);">
                        <div style="flex:1; text-align:center;">
                            <h4 style="color:#00f2a7; margin-bottom:5px; font-weight:900;">${myData.name}</h4>
                            <div style="color:white; font-size:1.6rem; font-weight:bold; text-shadow: 0 0 10px #00f2a788;">${myData.score.toLocaleString()}</div>
                            <div style="color:var(--slate); font-size:0.75rem; margin-top:2px;">KG</div>
                        </div>
                        <div style="color:#FFD700; font-weight:900; font-size:1.5rem; font-style:italic; padding: 0 10px;">VS</div>
                        <div style="flex:1; text-align:center;">
                            <h4 style="color:#ff4d4d; margin-bottom:5px; font-weight:900;">${enemyData.name}</h4>
                            <div style="color:white; font-size:1.6rem; font-weight:bold; text-shadow: 0 0 10px #ff4d4d88;">${enemyData.score.toLocaleString()}</div>
                            <div style="color:var(--slate); font-size:0.75rem; margin-top:2px;">KG</div>
                        </div>
                    </div>
        


                    
                    <div style="display:flex; flex-direction:column; gap:20px;">
                        <div style="background:rgba(0,0,0,0.3); border-radius:12px; padding:15px; border:1px solid rgba(0,242,167,0.2);">
                            <h4 style="color:#00f2a7; margin-bottom:15px; border-bottom:1px solid rgba(0,242,167,0.2); padding-bottom:5px;">${lang==='en'?'Our Heroes':'أبطالنا'}</h4>
                            ${renderMembers(myData)}
                        </div>
                        <div style="background:rgba(0,0,0,0.3); border-radius:12px; padding:15px; border:1px solid rgba(255,77,77,0.2);">
                            <h4 style="color:#ff4d4d; margin-bottom:15px; border-bottom:1px solid rgba(255,77,77,0.2); padding-bottom:5px;">${lang==='en'?'Enemy Forces':'قوات العدو'}</h4>
                            ${renderMembers(enemyData)}
                        </div>
                    </div>
                    
                    ${actionBtns}
                </div>
            </div>
        `;
        
    } catch(e) {
        console.error(e);
        modal.innerHTML += `<p style="color:#ff4d4d; text-align:center;">Error loading stats</p>`;
    }
};

// ==========================================
// 🛡️ تأسيس العصابة (نسخة سريعة ومحمية من التعليق)
// ==========================================

window.createGuild = async function() {
    // جلب قيم الحقول
    const nameInput = document.getElementById('new-guild-name');
    const tagInput = document.getElementById('new-guild-tag');
    
    if (!nameInput || !tagInput) return;
    
    const name = nameInput.value.trim();
    const tag = tagInput.value.trim().toUpperCase();
    
    // جلب اللغة بشكل آمن
    const lang = typeof currentLang !== 'undefined' ? currentLang : (localStorage.getItem('lang') || 'ar');
    const t = (typeof translations !== 'undefined' && translations[lang]) ? translations[lang] : {};
    
    // 1. التحقق من صحة الاسم (موجود + لا يتجاوز 100 حرف)
    if (!name || name.length > 100) {
        showToast(lang === 'en' ? "Guild name must be 1-100 characters!" : "يجب أن يكون اسم العصابة من 1 إلى 100 حرف!");
        return;
    }

    // 2. التحقق من صحة الرمز Tag (يجب أن يكون 3 أو 4 أحرف فقط)
    if (tag.length < 3 || tag.length > 4) {
        showToast(lang === 'en' ? "Tag must be 3 or 4 characters only!" : "يجب أن يكون الرمز (Tag) من 3 إلى 4 أحرف فقط!");
        return;
    }

    const user = auth.currentUser;
    let userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    let balance = (userData.xp || 0) - (userData.spentXp || 0);

    if (balance < 1000) { 
        showToast(t.not_enough_xp_guild || "نقاطك لا تكفي!"); 
        return; 
    }

    // الإمساك بالزر وتغيير شكله
    const e = window.event;
    const btn = e ? e.target.closest('button') : document.querySelector('.btn-epic-gold');
    const originalText = btn ? btn.innerHTML : 'تأسيس';
    
    if (btn) {
        btn.disabled = true; 
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
    }

    try {
        // توليد آيدي فريد للكلان
        const clanId = 'CLAN_' + Math.random().toString(36).substr(2, 9).toUpperCase();
        
        const newClan = {
            id: clanId,
            name: name,
            tag: tag,
            emblem: 'fa-solid fa-dragon', // شعار التنين الافتراضي
            emblemColor: '#FFD700', // اللون الافتراضي
            leaderId: user.uid,
            members: [{ 
                uid: user.uid, 
                name: userData.firstName || 'الكابتن', 
                role: 'leader', 
                warReady: true,
                xp: userData.xp || 0
            }],
            stats: { wins: 0, totalWeight: 0 },
            warStatus: 'idle', 
            currentWarId: null, // تأكيد أنه ليس في حرب
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        // 1. إنشاء الكلان في الفايربيس (انتظار حتى يكتمل)
        await db.collection('clans').doc(clanId).set(newClan);
        
        // 2. تحديث ملف اللاعب في الفايربيس
        const newSpentXp = (userData.spentXp || 0) + 1000;
        await db.collection('users').doc(user.uid).update({ 
            clanId: clanId, 
            spentXp: newSpentXp 
        });
        
        // 3. تحديث الـ LocalStorage لتتطابق تماماً
        userData.spentXp = newSpentXp;
        userData.clanId = clanId;
        localStorage.setItem('currentUser', JSON.stringify(userData));

        showToast(t.guild_created || "تم تأسيس العصابة بنجاح!");
        
        setTimeout(() => {
            if (typeof loadActiveGuild === 'function') {
                const area = document.getElementById('guild-content-area');
                if (area) area.innerHTML = `<div style="text-align:center; padding: 50px;"><i class="fa-solid fa-spinner fa-spin fa-3x" style="color:#FFD700;"></i></div>`;
                
                loadActiveGuild(clanId, user.uid);
            } else {
                if(typeof openGuildHub === 'function') openGuildHub();
            }
        }, 500);
        
    } catch (error) {
        console.error("خطأ في التأسيس:", error);
        showToast(lang === 'en' ? "Error creating clan!" : "حدث خطأ أثناء التأسيس!");
        
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    }
};


// ==========================================
// 🔄 دالة التنقل بين تبويبات العصابة (النسخة الشاملة)
// ==========================================
window.switchGuildTab = function(tabName, btnElement) {
    // 1. إزالة اللون عن كل الأزرار وتلوين الزر المضغوط
    document.querySelectorAll('#guild-content-area .perf-tab-btn').forEach(b => b.classList.remove('active-tab'));
    if(btnElement) btnElement.classList.add('active-tab');

    // 2. إخفاء أو إظهار الشاشات الأربعة بكل سلاسة
    const tabs = ['roster', 'war', 'chat', 'settings'];
    tabs.forEach(t => {
        let el = document.getElementById('guild-tab-' + t);
        if(el) {
            el.style.display = (t === tabName) ? 'block' : 'none';
        }
    });
};


// 4. تغيير جاهزية اللاعب للحرب
window.toggleWarReady = async function(clanId, uid, isReady) {
    const clanRef = db.collection('clans').doc(clanId);
    try {
        const doc = await clanRef.get();
        let members = doc.data().members;
        let memberIndex = members.findIndex(m => m.uid === uid);
        if (memberIndex > -1) {
            members[memberIndex].warReady = isReady;
            await clanRef.update({ members: members });
        }
    } catch(e) { console.error(e); }
};

// ==========================================
// ⚔️ محرك الحرب (Matchmaking & Combat)
// ==========================================

window.searchForWar = async function(myClanId, memberCount) {
    const clanRef = db.collection('clans').doc(myClanId);
    await clanRef.update({ warStatus: 'searching' });

    // محاكاة محرك البحث: يبحث عن كلان آخر يبحث عن حرب وحجمه متقارب
    setTimeout(async () => {
        try {
            // في البيئة الحقيقية ستحتاج Cloud Function لتجنب تضارب التحديثات المزدوجة.
            // هنا نستخدم Query مبسط للبحث عن عدو
            const snapshot = await db.collection('clans')
                .where('warStatus', '==', 'searching')
                .where('id', '!=', myClanId)
                .limit(1)
                .get();

            if (!snapshot.empty) {
                // وجدنا عدو! بناء وثيقة الحرب
                const enemyClanDoc = snapshot.docs[0];
                const enemyClan = enemyClanDoc.data();
                const myClan = (await clanRef.get()).data();
                
                const warId = 'WAR_' + generateShortID();
                
                // إنشاء معركة تمتد لـ 24 ساعة
                const endTime = new Date();
                endTime.setHours(endTime.getHours() + 24);

                const newWar = {
                    id: warId,
                    status: 'active',
                    endTime: endTime,
                    clanA: { id: myClan.id, name: myClan.name, tag: myClan.tag, score: 0 },
                    clanB: { id: enemyClan.id, name: enemyClan.name, tag: enemyClan.tag, score: 0 }
                };

                await db.collection('wars').doc(warId).set(newWar);
                
                // تحديث حالة الكلانين
                await clanRef.update({ warStatus: 'in_war', currentWarId: warId });
                await enemyClanDoc.ref.update({ warStatus: 'in_war', currentWarId: warId });
                
                showToast("⚔️ تم العثور على عدو! الحرب بدأت!");
            } else {
                // لم نجد أحد، نعود للانتظار (في الحقيقة يجب أن يبقى searching حتى يجد)
                // للتجربة الممتعة رح نخليه يلاقي وهمي إذا ما في حدا
                showToast("جاري الاستمرار بالبحث في الرادار...");
            }
        } catch(e) { console.error("War Search Error:", e); }
    }, 3000); // 3 ثواني أنيميشن بحث
};




// دالة البحث عن كلان باستخدام الـ Tag والانضمام إليه
async function joinGuildByTag() {
    const tagInput = document.getElementById('search-guild-tag').value.trim().toUpperCase();
    const errorMsg = currentLang === 'en' ? 'Please enter a valid 4-character Tag.' : 'الرجاء إدخال كود كلان صحيح (4 حروف/أرقام).';
    const notFoundMsg = currentLang === 'en' ? 'Clan not found!' : 'لم يتم العثور على الكلان!';
    const joinedMsg = currentLang === 'en' ? 'Joined successfully!' : 'تم الانضمام بنجاح!';
    
    if (!tagInput || tagInput.length !== 4) {
        showCustomAlert(errorMsg);
        return;
    }

    try {
        // البحث في قاعدة البيانات عن الكلان اللي يحمل هذا الـ Tag
        const clansRef = db.collection('clans');
        const querySnapshot = await clansRef.where('tag', '==', tagInput).limit(1).get();

        if (querySnapshot.empty) {
            showCustomAlert(notFoundMsg);
            return;
        }

        const clanDoc = querySnapshot.docs[0];
        const clanId = clanDoc.id;
        const clanData = clanDoc.data();

        // التأكد من أن الكلان ليس ممتلئاً (الحد الأقصى مثلاً 50)
        if (clanData.members.length >= 50) {
            showCustomAlert(currentLang === 'en' ? 'Clan is full!' : 'الكلان ممتلئ!');
            return;
        }

        // جلب بيانات اللاعب الحالي
        const currentUserData = JSON.parse(localStorage.getItem('currentUser'));
        const newMember = {
            uid: currentUserData.uid,
            name: currentUserData.name,
            joinedAt: firebase.firestore.FieldValue.serverTimestamp(),
            warReady: false,
            xp: currentUserData.xp || 0
        };

        // إضافة اللاعب لمصفوفة أعضاء الكلان
        await db.collection('clans').doc(clanId).update({
            members: firebase.firestore.FieldValue.arrayUnion(newMember)
        });

        // تحديث بيانات اللاعب في قاعدة بيانات المستخدمين
        await db.collection('users').doc(currentUserData.uid).update({
            clanId: clanId
        });

        // تحديث الـ LocalStorage
        currentUserData.clanId = clanId;
        localStorage.setItem('currentUser', JSON.stringify(currentUserData));

        showCustomAlert(joinedMsg);
        // الشاشة ستتحدث تلقائياً بسبب onSnapshot في loadActiveGuild

    } catch (error) {
        console.error("Error joining clan: ", error);
        showCustomAlert(currentLang === 'en' ? 'Error joining clan!' : 'حدث خطأ أثناء الانضمام!');
    }
}

// 3. 🆕 نقل القيادة يدوياً (الزعيم يعطيها لشخص آخر)
window.transferLeadership = async function(clanId, newLeaderUid) {
    if(!confirm(currentLang === 'en' ? "Transfer leadership? You will become a regular member." : "متأكد بدك تسلم القيادة؟ رح ترجع جندي عادي.")) return;
    
    try {
        const clanRef = db.collection('clans').doc(clanId);
        await clanRef.update({ leaderId: newLeaderUid });
        showToast(currentLang === 'en' ? "Leadership transferred!" : "تم نقل القيادة بنجاح 👑");
    } catch(e) { console.error(e); }
};

// 4. 🆕 نظام المغادرة الذكي (إذا غادر الزعيم، تنتقل القيادة تلقائياً)
window.leaveGuild = async function(clanId, myUid, isLeader) {
    if(!confirm(currentLang === 'en' ? "Are you sure you want to leave the guild?" : "متأكد بدك تترك عصابتك وتصير ذئب وحيد؟")) return;

    try {
        const clanRef = db.collection('clans').doc(clanId);
        const doc = await clanRef.get();
        if(!doc.exists) return;
        
        let clanData = doc.data();
        let remainingMembers = clanData.members.filter(m => m.uid !== myUid);

        if (remainingMembers.length === 0) {
            // إذا كان هو الوحيد في الكلان، احذف الكلان بالكامل
            await clanRef.delete();
        } else {
            // إذا كان هناك أعضاء آخرين
            let updates = { members: remainingMembers };
            // إذا كان المغادر هو الزعيم، انقل القيادة لأول شخص في القائمة
            if (isLeader) {
                updates.leaderId = remainingMembers[0].uid;
                alert(currentLang === 'en' ? `Leadership passed to ${remainingMembers[0].name}` : `بما إنك الزعيم، تم تسليم القيادة تلقائياً لـ ${remainingMembers[0].name}`);
            }
            await clanRef.update(updates);
        }

        // تحديث بيانات اللاعب
        let userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
        userData.clanId = null;
        localStorage.setItem('currentUser', JSON.stringify(userData));
        await db.collection('users').doc(myUid).update({ clanId: null });

        showToast(currentLang === 'en' ? "You left the guild." : "غادرت العصابة.");
        const t = translations[currentLang || 'ar'];
        renderNoGuildScreen(t);

    } catch(e) { console.error(e); showToast("خطأ في المغادرة!"); }
};

window.kickClanMember = async function(clanId, memberUid) {
    let lang = localStorage.getItem('lang') || 'ar';
    if(!confirm(lang === 'en' ? "Kick this player from the clan?" : "طرد هذا اللاعب من الكلان؟")) return;
    try {
        const clanRef = db.collection('clans').doc(clanId);
        const doc = await clanRef.get();
        let members = doc.data().members.filter(m => m.uid !== memberUid);
        
        await clanRef.update({ members: members });
        await db.collection('users').doc(memberUid).update({ clanId: null }); 
        
        showToast(lang === 'en' ? "Player kicked!" : "تم طرد اللاعب!");
    } catch(e) { console.error(e); }
};

// ==========================================
// ⚙️ دوال التحكم بالأعضاء والجاهزية
// ==========================================

// دالة تغيير حالة الجاهزية (Ready / Idle)
window.toggleWarReady = async function(clanId, uid, currentState) {
    try {
        const clanRef = db.collection('clans').doc(clanId);
        const doc = await clanRef.get();
        if(!doc.exists) return;
        
        let members = doc.data().members;
        let memberIndex = members.findIndex(m => m.uid === uid);
        
        if (memberIndex !== -1) {
            members[memberIndex].warReady = !currentState; // عكس الحالة الحالية
            await clanRef.update({ members: members });
            // الواجهة ستتحدث تلقائياً بسبب onSnapshot
            showToast(currentLang === 'en' ? "Status updated!" : "تم تحديث الجاهزية!");
        }
    } catch(e) {
        console.error("Error toggling ready state:", e);
    }
};

// دالة فتح/إغلاق قائمة الثلاث نقاط
window.toggleMemberMenu = function(menuId) {
    // إغلاق أي قائمة أخرى مفتوحة أولاً
    document.querySelectorAll('.dropdown-content-pro').forEach(menu => {
        if (menu.id !== menuId) menu.classList.remove('show');
    });
    // تبديل حالة القائمة المطلوبة
    document.getElementById(menuId).classList.toggle('show');
};

// إغلاق القائمة المنسدلة عند الضغط في أي مكان فارغ بالشاشة
window.onclick = function(event) {
    if (!event.target.matches('.dots-btn') && !event.target.matches('.fa-ellipsis-vertical')) {
        let dropdowns = document.getElementsByClassName("dropdown-content-pro");
        for (let i = 0; i < dropdowns.length; i++) {
            let openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
                openDropdown.classList.remove('show');
            }
        }
    }
};

// ==========================================
// ⚔️ نظام البحث عن حرب (Matchmaking) ولعبة شد الحبل
// ==========================================

window.searchForWar = async function(clanId) {
    const btn = event.target.closest('button');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-radar fa-spin"></i> ' + (currentLang === 'en' ? 'Scanning...' : 'جاري مسح الرادار...');

    try {
        const clanRef = db.collection('clans').doc(clanId);
        const clanDoc = await clanRef.get();
        if (!clanDoc.exists) return;

        // 1. تحويل حالة الكلان إلى "يبحث" في قاعدة البيانات (حتى لو طلعت من التطبيق بتضل تبحث)
        await clanRef.update({
            warStatus: 'searching',
            searchStartedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        showToast(currentLang === 'en' ? "Radar active! Searching in background..." : "الرادار يعمل! البحث مستمر حتى في الخلفية...");

        // 2. البحث عن كلان آخر حالته "يبحث" في نفس اللحظة
        const snapshot = await db.collection('clans')
            .where('warStatus', '==', 'searching')
            .get();

        let enemyClan = null;
        snapshot.forEach(doc => {
            // نتأكد إنه ما يشبك الكلان مع نفسه!
            if (doc.id !== clanId && !enemyClan) {
                enemyClan = { id: doc.id, ...doc.data() };
            }
        });

        // 3. إذا لقينا كلان ثاني بيبحث، بنشبكهم في حرب فوراً!
        if (enemyClan) {
            await startWarBetweenClans(clanId, clanDoc.data(), enemyClan.id, enemyClan);
        } else {
            // إذا ما لقينا حدا، بنرجع شكل الزر لحالة الانتظار
            btn.innerHTML = '<i class="fa-solid fa-radar"></i> ' + (currentLang === 'en' ? 'Scanning Radar...' : 'الرادار يعمل...');
        }

    } catch(e) {
        console.error("Error searching for war:", e);
        showToast(currentLang === 'en' ? "Radar Error!" : "خطأ في الرادار!");
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
};


async function startWarBetweenClans(myClanId, myClanData, enemyClanId, enemyClanData) {
    const warId = 'WAR_' + Math.random().toString(36).substr(2, 9).toUpperCase();
    const batch = db.batch();
    const warRef = db.collection('wars').doc(warId);
    
    batch.set(warRef, {
        id: warId,
        clan1: { id: myClanId, tag: myClanData.tag, name: myClanData.name, membersCount: myClanData.members.length, score: 0 },
        clan2: { id: enemyClanId, tag: enemyClanData.tag, name: enemyClanData.name, membersCount: enemyClanData.members.length, score: 0 },
        startTime: firebase.firestore.FieldValue.serverTimestamp(),
        status: 'active'
    });

    batch.update(db.collection('clans').doc(myClanId), { warStatus: 'in_war', currentWarId: warId });
    batch.update(db.collection('clans').doc(enemyClanId), { warStatus: 'in_war', currentWarId: warId });

    await batch.commit();
    let lang = localStorage.getItem('lang') || 'ar';
    showToast(lang === 'en' ? "Enemy Found! WAR STARTED!" : "تم العثور على عدو! بدأت الحرب الطاحنة!");
}



// 🔥 دالة الاستماع لنتائج الحرب (لايف)
window.listenToActiveWar = function(warId, myClanId) {
    if (!warId) return;

    db.collection('wars').doc(warId).onSnapshot(doc => {
        if (!doc.exists) return;
        const war = doc.data();

        // تحديد بيانات كلاني وبيانات العدو
        let myData = war.clan1.id === myClanId ? war.clan1 : war.clan2;
        let enemyData = war.clan1.id === myClanId ? war.clan2 : war.clan1;

        // تحديث النصوص بالشاشة (الأسماء، التاج، الأعضاء، الأوزان)
        document.getElementById('war-mine-name').innerText = myData.name || 'عصابتي';
        document.getElementById('war-mine-tag').innerText = '[' + myData.tag + ']';
        document.getElementById('war-mine-members').innerText = myData.membersCount || 1;
        document.getElementById('war-score-mine').innerText = myData.score.toLocaleString();

        document.getElementById('war-enemy-name').innerText = enemyData.name || 'العدو';
        document.getElementById('war-enemy-tag').innerText = '[' + enemyData.tag + ']';
        document.getElementById('war-enemy-members').innerText = enemyData.membersCount || 1;
        document.getElementById('war-score-enemy').innerText = enemyData.score.toLocaleString();

        // حساب نسبة شد الحبل
        let totalScore = myData.score + enemyData.score;
        let myPercentage = 50; 
        let enemyPercentage = 50;

        if (totalScore > 0) {
            myPercentage = (myData.score / totalScore) * 100;
            enemyPercentage = (enemyData.score / totalScore) * 100;
            
            if (myPercentage < 10) { myPercentage = 10; enemyPercentage = 90; }
            if (enemyPercentage < 10) { enemyPercentage = 10; myPercentage = 90; }
        }

        const tugMine = document.getElementById('tug-mine');
        const tugEnemy = document.getElementById('tug-enemy');
        
        if (tugMine) tugMine.style.width = myPercentage + '%';
        if (tugEnemy) tugEnemy.style.width = enemyPercentage + '%';

        // 🟢 تشغيل العداد التنازلي وتفعيل نظام الفوز
        // الآن هذا الكود داخل الـ onSnapshot، وبالتالي يمكنه قراءة المتغيرات war و myData و enemyData
        if (war.startTime && war.status === 'active' && typeof startWarTimer === 'function') {
            // نمرر وقت البداية، الـ ID، ونقاط فريقي ونقاط الخصم لتحديد الفائز عند انتهاء الوقت
            startWarTimer(war.startTime, warId, myClanId, myData.score, enemyData.score);
        }

    }); // <-- تم نقل إغلاق قوس الـ onSnapshot إلى هنا
};


// ==========================================
// ⚔️ نظام حروب الكلانات (مؤقت + نتائج + جوائز)
// ==========================================

// ==========================================
// ⏳ محرك العداد التنازلي للتحدي (معدل ومحمي)
// ==========================================
window.currentWarTimerInterval = null;

window.startWarTimer = function(warStartTime, warId, myClanId, myScore, enemyScore) {
    // 1. تنظيف أي عداد سابق لمنع التداخل والتعليق
    if (window.currentWarTimerInterval) {
        clearInterval(window.currentWarTimerInterval);
    }
    
    // 2. تأمين: إذا لم يتم تحديد الوقت بعد من السيرفر، انتظر
    if (!warStartTime) return; 
    
    const lang = localStorage.getItem('lang') || 'ar';
// ⏱️ مدة الحرب: 15 دقيقة للتجربة
const warDurationMs = 15 * 1000;



    
    // 3. تأمين: تحويل الوقت سواء كان كائن Timestamp أو نص
    const startTimeMs = typeof warStartTime.toDate === 'function' ? warStartTime.toDate().getTime() : new Date(warStartTime).getTime();
    const endTime = startTimeMs + warDurationMs;

    window.currentWarTimerInterval = setInterval(async () => {
        const timerElement = document.getElementById('war-countdown-timer'); 
        if (!timerElement) return; // إذا اللاعب أغلق الشاشة، لا تفعل شيء

        const now = new Date().getTime();
        const distance = endTime - now;

        if (distance <= 0) {
            clearInterval(window.currentWarTimerInterval);
            timerElement.innerHTML = lang === 'en' ? "Challenge Ended!" : "انتهت المنافسة!";
            
            // إنهاء التحدي وتوزيع الجوائز
            await finishClanWar(warId, myClanId, myScore, enemyScore);
        } else {
            let h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            let m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            let s = Math.floor((distance % (1000 * 60)) / 1000);
            
            // إضافة صفر للأرقام الأقل من 10 لجمالية العداد (مثال: 09:05:01)
            h = h < 10 ? "0" + h : h;
            m = m < 10 ? "0" + m : m;
            s = s < 10 ? "0" + s : s;

            timerElement.innerText = `${h}h : ${m}m : ${s}s`;
        }
    }, 1000);
};


window.addVolumeToClanWar = async function(volume) {
    try {
        const user = auth.currentUser;
        if (!user || volume <= 0) return;
        
        const userRef = db.collection('users').doc(user.uid);
        const userDoc = await userRef.get();
        if (!userDoc.exists) return;
        let userData = userDoc.data();
        
        if (!userData.clanId) return; 
        
        const clanRef = db.collection('clans').doc(userData.clanId);
        const clanDoc = await clanRef.get();
        if (!clanDoc.exists) return;
        
        const clanData = clanDoc.data();
        
        if (clanData.warStatus === 'in_war' && clanData.currentWarId) {
            const currentWarId = clanData.currentWarId;
            
            let warContributions = userData.warContributions || { warId: null, count: 0 };
            
            if (warContributions.warId !== currentWarId) {
                warContributions = { warId: currentWarId, count: 0 };
            }
            
            if (warContributions.count >= 2) {
                setTimeout(() => showToast(currentLang === 'en' ? "War Limit: Only your first 2 workouts count!" : "تنبيه: تم احتساب أول تمرينين لك فقط في هذه الحرب!"), 1500);
                return;
            }

            const warRef = db.collection('wars').doc(currentWarId);
            const warDocLocal = await warRef.get();
            
            if (warDocLocal.exists && warDocLocal.data().status === 'active') {
                let isClan1 = warDocLocal.data().clan1.id === userData.clanId;
                let updateField = isClan1 ? 'clan1.score' : 'clan2.score';
                let memberField = isClan1 ? `clan1.members.${user.uid}` : `clan2.members.${user.uid}`;
                
                await warRef.update({
                    [updateField]: firebase.firestore.FieldValue.increment(volume),
                    [`${memberField}.name`]: userData.firstName || 'Hero',
                    [`${memberField}.photo`]: userData.photoURL || 'https://i.ibb.co/9mPmHXkh/cropped-circle-image-2.png',
                    [`${memberField}.volume`]: firebase.firestore.FieldValue.increment(volume)
                });

                warContributions.count += 1;
                await userRef.update({ warContributions: warContributions });
                
                let localData = JSON.parse(localStorage.getItem('currentUser') || '{}');
                localData.warContributions = warContributions;
                localStorage.setItem('currentUser', JSON.stringify(localData));
                
                if (warContributions.count === 2) {
                     setTimeout(() => showToast(currentLang === 'en' ? "2/2 War workouts used!" : "استنفذت تمرينين الحرب (2/2)! التمارين القادمة لن تحسب فيها."), 1500);
                } else {
                     setTimeout(() => showToast(currentLang === 'en' ? "1/2 War workouts logged!" : "تم إضافة وزنك للحرب (1/2)!"), 1500);
                }
            }
        }
    } catch(err) { console.error("خطأ في احتساب النقاط للفريق:", err); }
};


window.finishClanWar = async function(warId, myClanId, myScore, enemyScore) {
    const lang = localStorage.getItem('lang') || 'ar';

    try {
        const warRef = db.collection('wars').doc(warId);
        const warDoc = await warRef.get();
        
        // Prevent duplicate processing
        if (warDoc.exists && warDoc.data().status === 'completed') {
            return; 
        }

        let batch = db.batch();
        batch.update(warRef, { status: 'completed' });
        
        const warData = warDoc.data();
        const clan1Id = warData.clan1.id;
        const clan2Id = warData.clan2.id;
        
        const clan1Ref = db.collection('clans').doc(clan1Id);
        const clan2Ref = db.collection('clans').doc(clan2Id);

        // Make both clans idle and link them to this finished war ID
        batch.update(clan1Ref, { warStatus: 'idle', currentWarId: null, lastWarId: warId });
        batch.update(clan2Ref, { warStatus: 'idle', currentWarId: null, lastWarId: warId });

        const clan1Doc = await clan1Ref.get();
        const clan2Doc = await clan2Ref.get();

        const clan1Members = clan1Doc.exists ? clan1Doc.data().members || [] : [];
        const clan2Members = clan2Doc.exists ? clan2Doc.data().members || [] : [];

        // Final true scores from DB
        const clan1Score = warData.clan1.score || 0;
        const clan2Score = warData.clan2.score || 0;
        const clan1Wins = clan1Score > clan2Score;
        const clan2Wins = clan2Score > clan1Score;
        const isDraw = clan1Score === clan2Score;

        if (clan1Wins) batch.update(clan1Ref, { 'stats.wins': firebase.firestore.FieldValue.increment(1) });
        if (clan2Wins) batch.update(clan2Ref, { 'stats.wins': firebase.firestore.FieldValue.increment(1) });

        // Distribute correct notifications to both sides
        const sendWarNotifs = (members, won, draw) => {
            members.forEach(m => {
                // Using merge ensures we don't spam if multiple devices attempt to end the war
                const notifRef = db.collection('users').doc(m.uid).collection('notifications').doc('war_result_' + warId);
                if (won) {
                    batch.set(notifRef, {
                        title: lang === 'en' ? "🏆 Clan War Victory!" : "🏆 انتصار في حرب الكلانات!",
                        text: lang === 'en' ? "Your clan won the war! You received 1000 XP." : "لقد سحق كلانك الخصوم في الحرب! حصلت على 1000 نقطة خبرة (XP).",
                        type: 'system_reward', status: 'pending', timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });
                } else if (draw) {
                    batch.set(notifRef, {
                        title: lang === 'en' ? "⚖️ Clan War Draw" : "⚖️ تعادل في الحرب",
                        text: lang === 'en' ? "The war ended in a draw! No XP awarded." : "انتهت الحرب بالتعادل! لا يوجد فائز ولا خاسر.",
                        type: 'system_reward', status: 'pending', timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });
                } else {
                    batch.set(notifRef, {
                        title: lang === 'en' ? "💀 Clan War Defeat" : "💀 هزيمة في الحرب",
                        text: lang === 'en' ? "Your clan lost the war. Train harder and seek revenge!" : "لقد خسر كلانك الحرب. ارفعوا أوزان أثقل وانتقموا!",
                        type: 'system_reward', status: 'pending', timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });
                }
            });
        };

        sendWarNotifs(clan1Members, clan1Wins, isDraw);
        sendWarNotifs(clan2Members, clan2Wins, isDraw);

        await batch.commit();

        // Award XP exclusively to the person executing this if their clan won
        const myActualWin = (myClanId === clan1Id && clan1Wins) || (myClanId === clan2Id && clan2Wins);
        if (myActualWin && !isDraw) {
            setTimeout(() => { if (typeof addXP === "function") addXP(1000, 'game', 'RGA_SECURE_998877', 'war_win'); }, 1000);
        }

        // Trigger Result UI live if inside the clan view
        if (document.getElementById('guild-content-area')) {
            let userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
            userData.lastSeenWarId = warId;
            localStorage.setItem('currentUser', JSON.stringify(userData));
            if (auth.currentUser) {
                db.collection('users').doc(auth.currentUser.uid).update({ lastSeenWarId: warId });
            }
            showWarResultUI(myActualWin, isDraw, warId, myClanId);
        }

    } catch (error) {
        console.error("خطأ في إنهاء الحرب:", error);
    }
};




// 🌟 الدالة التي تنقلك للتبويب مباشرة بمجرد إغلاق نافذة النتيجة
window.closeWarResultAndGoToTab = function() {
    const resultOverlay = document.getElementById('war-result-overlay');
    if (resultOverlay) resultOverlay.remove();

    const guildContentArea = document.getElementById('guild-content-area');
    // إذا كنت داخل واجهة العصابة
    if (guildContentArea) {
        const warTabBtn = document.querySelector('.perf-tab-btn[onclick*="war"]');
        if (warTabBtn) {
            switchGuildTab('war', warTabBtn);
        }
    } else {
        // إذا ضغطت على الإشعار من صفحة ثانية، سيتم فتح الكلان ثم تحويلك لتبويب الحرب
        if(typeof openGuildHub === 'function') {
            openGuildHub();
            setTimeout(() => {
                const warTabBtn = document.querySelector('.perf-tab-btn[onclick*="war"]');
                if (warTabBtn) switchGuildTab('war', warTabBtn);
            }, 1000);
        }
    }
};

// ==========================================
// 🕵️‍♂️ المراقب الخلفي لانتهاء الحرب أوتوماتيكياً
// ==========================================
window.startBackgroundWarMonitor = async function(user) {
    if (!user) return;
    const userDoc = await db.collection('users').doc(user.uid).get();
    if (!userDoc.exists) return;
    const userData = userDoc.data();
    
    if (userData.clanId) {
        db.collection('clans').doc(userData.clanId).onSnapshot(clanDoc => {
            if (!clanDoc.exists) return;
            const clanData = clanDoc.data();
            
            // إذا العصابة في حرب، بنراقب وقتها بصمت
            if (clanData.warStatus === 'in_war' && clanData.currentWarId) {
                db.collection('wars').doc(clanData.currentWarId).onSnapshot(warDoc => {
                    if (!warDoc.exists) return;
                    const warData = warDoc.data();
                    
                    if (warData.status === 'active' && warData.startTime) {

// ⏱️ مدة الحرب: 15 دقيقة للتجربة
const warDurationMs = 15 * 1000;


                        const startTimeMs = typeof warData.startTime.toDate === 'function' ? warData.startTime.toDate().getTime() : new Date(warData.startTime).getTime();
                        const endTime = startTimeMs + warDurationMs;
                        
                        const distance = endTime - new Date().getTime();
                        
                        let myData = warData.clan1.id === userData.clanId ? warData.clan1 : warData.clan2;
                        let enemyData = warData.clan1.id === userData.clanId ? warData.clan2 : warData.clan1;
                        
                        if (distance <= 0) {
                            // الوقت انتهى! وزع الإشعارات والجوائز فوراً
                            finishClanWar(warData.id, userData.clanId, myData.score, enemyData.score);
                        } else {
                            // اضبط مؤقت مخفي يشتغل أول ما يصفر العداد وإنت برا
                            if (window.bgWarTimer) clearTimeout(window.bgWarTimer);
                            window.bgWarTimer = setTimeout(() => {
                                finishClanWar(warData.id, userData.clanId, myData.score, enemyData.score);
                            }, distance);
                        }
                    }
                });
            }
        });
    }
};

// دالة عرض الحرب المشتعلة (اللايف)
window.buildActiveWarHTML = function(warData, myClanId) {
    let lang = localStorage.getItem('lang') || 'ar';
    
    let myData = warData.clan1.id === myClanId ? warData.clan1 : warData.clan2;
    let enemyData = warData.clan1.id === myClanId ? warData.clan2 : warData.clan1;
    
    const renderMembers = (clanData) => {
        let membersArr = [];
        if (clanData.members) {
            for (let uid in clanData.members) {
                membersArr.push(clanData.members[uid]);
            }
        }
        membersArr.sort((a,b) => b.volume - a.volume);
        if (membersArr.length === 0) return `<p style="color:var(--slate); font-size:0.8rem; text-align:center;">${lang==='en'?'No data':'لا توجد بيانات'}</p>`;
        
        return membersArr.map((m, i) => `
            <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.05); padding:8px 12px; border-radius:8px; margin-bottom:5px;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <span style="color:var(--slate); font-weight:bold; font-size:0.8rem;">#${i+1}</span>
                    <img src="${m.photo || 'https://i.ibb.co/9mPmHXkh/cropped-circle-image-2.png'}" style="width:30px; height:30px; border-radius:50%; object-fit:cover;">
                    <span style="color:white; font-size:0.85rem; font-weight:bold;">${m.name}</span>
                </div>
                <span style="color:var(--primary-color); font-weight:900; font-size:0.9rem;">${m.volume ? m.volume.toLocaleString() : 0} kg</span>
            </div>
        `).join('');
    };

    return `
        <div class="war-arena-container" style="animation: fadeIn 0.4s; padding-bottom: 30px;">
            <div style="text-align:center; margin-bottom: 20px;">
                <h2 style="color: #ff4d4d; font-weight: 900; text-transform: uppercase; text-shadow: 0 0 15px rgba(255,77,77,0.6); margin-bottom: 5px;">
                    <i class="fa-solid fa-fire fa-beat" style="color:#ff4d4d;"></i> ${lang==='en'?'WAR IS ACTIVE!':'الحرب مشتعلة الآن!'}
                </h2>
                <p style="color: #00f2a7; font-weight: bold; font-size: 0.95rem;">${lang==='en'?'Lift weights to crush your enemies!':'ارفع الأوزان لسحق أعدائك!'}</p>
            </div>
            
            <div style="display:flex; justify-content:space-between; align-items:center; background:linear-gradient(180deg, rgba(20,20,30,0.9), rgba(10,10,15,0.95)); border-radius:15px; padding:20px 15px; margin-bottom:25px; border:2px solid rgba(255,77,77,0.4); box-shadow: 0 10px 20px rgba(0,0,0,0.5);">
                <div style="flex:1; text-align:center;">
                    <h4 style="color:#00f2a7; margin-bottom:5px; font-weight:900;">${myData.name}</h4>
                    <div style="color:white; font-size:1.8rem; font-weight:bold; text-shadow: 0 0 15px #00f2a7;">${myData.score ? myData.score.toLocaleString() : 0}</div>
                    <div style="color:var(--slate); font-size:0.75rem; margin-top:2px;">KG</div>
                </div>
                <div style="color:#FFD700; font-weight:900; font-size:1.5rem; font-style:italic; padding: 0 10px; animation: pulseXP 1s infinite alternate;">VS</div>
                <div style="flex:1; text-align:center;">
                    <h4 style="color:#ff4d4d; margin-bottom:5px; font-weight:900;">${enemyData.name}</h4>
                    <div style="color:white; font-size:1.8rem; font-weight:bold; text-shadow: 0 0 15px #ff4d4d;">${enemyData.score ? enemyData.score.toLocaleString() : 0}</div>
                    <div style="color:var(--slate); font-size:0.75rem; margin-top:2px;">KG</div>
                </div>
            </div>
            
            <div style="display:flex; flex-direction:column; gap:20px;">
                <div style="background:rgba(0,0,0,0.3); border-radius:12px; padding:15px; border:1px solid rgba(0,242,167,0.3); box-shadow: inset 0 0 10px rgba(0,242,167,0.1);">
                    <h4 style="color:#00f2a7; margin-bottom:15px; border-bottom:1px solid rgba(0,242,167,0.2); padding-bottom:5px;"><i class="fa-solid fa-shield-halved"></i> ${lang==='en'?'Our Heroes':'أبطالنا'}</h4>
                    ${renderMembers(myData)}
                </div>
                <div style="background:rgba(0,0,0,0.3); border-radius:12px; padding:15px; border:1px solid rgba(255,77,77,0.3); box-shadow: inset 0 0 10px rgba(255,77,77,0.1);">
                    <h4 style="color:#ff4d4d; margin-bottom:15px; border-bottom:1px solid rgba(255,77,77,0.2); padding-bottom:5px;"><i class="fa-solid fa-skull"></i> ${lang==='en'?'Enemy Forces':'قوات العدو'}</h4>
                    ${renderMembers(enemyData)}
                </div>
            </div>
        </div>
    `;
};


// ==========================================
// 🛡️ تحميل بيانات العصابة (مع الشات والإعدادات)
// ==========================================
window.loadActiveGuild = async function(clanId, myUid) {
    window.scrollTo(0, 0); 
    const area = document.getElementById('guild-content-area');
    if(!area) return;

    let lang = localStorage.getItem('lang') || 'ar';
    const t = (typeof translations !== 'undefined' && translations[lang]) ? translations[lang] : {};

    db.collection('clans').doc(clanId).onSnapshot(async doc => {
        try {
            if (!doc.exists) {
                let userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
                userData.clanId = null; 
                localStorage.setItem('currentUser', JSON.stringify(userData));
                if (myUid) await db.collection('users').doc(myUid).update({ clanId: null });
                if (typeof renderNoGuildScreen === 'function') renderNoGuildScreen(t);
                return;
            }

            const clan = doc.data() || {};
            const isLeader = clan.leaderId === myUid;
            
            // متغيرات الكلان الأساسية
            let clanName = clan.name || 'عصابة مجهولة';
            let clanTag = clan.tag || '000';
            let clanMotto = clan.motto || (lang === 'en' ? 'No motto set yet.' : 'لم يتم تعيين عبارة للكلان.');
            let clanEmblem = clan.emblem || 'fa-solid fa-dragon';
            let clanColor = clan.emblemColor || '#FFD700'; // اللون الافتراضي ذهبي
            let clanWins = clan.stats ? clan.stats.wins : 0;
            let clanMembers = Array.isArray(clan.members) ? clan.members : [];

            let membersPromises = clanMembers.map(async m => {
                if (!m || !m.uid) return ''; 
                let isMng = m.uid === clan.leaderId;
                let roleIcon = isMng ? `<i class="fa-solid fa-crown" style="color:${clanColor}; filter: drop-shadow(0 0 5px ${clanColor});"></i>` : '';
let userPhoto = "https://i.ibb.co/9mPmHXkh/cropped-circle-image-2.png";
let fullName = m.name || 'بطل'; // الاسم الافتراضي
try { 
    let uDoc = await db.collection('users').doc(m.uid).get(); 
    if(uDoc.exists) {
        let uData = uDoc.data();
        if(uData.photoURL) userPhoto = uData.photoURL; 
        // 🟢 السحر هنا: سحب الاسم الأول والأخير معاً
        if(uData.firstName) fullName = uData.firstName + " " + (uData.lastName || "");
    } 
} catch(e) { }


                let readyDot = m.uid === myUid 
                    ? `<button class="ready-toggle-btn" onclick="toggleWarReady('${clanId}', '${m.uid}', ${m.warReady})"><span style="color:${m.warReady?'#00f2a7':'#ff4d4d'}; font-size: 0.8rem; font-weight:bold; background: rgba(${m.warReady?'0,242,167':'255,77,77'},0.1); padding: 4px 10px; border-radius: 8px; border: 1px solid currentColor; display: inline-block;"><i class="fa-solid ${m.warReady?'fa-check':'fa-xmark'}"></i></span></button>` 
                    : `<span style="color:${m.warReady?'#00f2a7':'#ff4d4d'}; font-size: 0.8rem; font-weight:bold; background: rgba(${m.warReady?'0,242,167':'255,77,77'},0.1); padding: 2px 8px; border-radius: 6px; border: 1px solid currentColor;"><i class="fa-solid ${m.warReady?'fa-check':'fa-xmark'}"></i></span>`;

                let adminMenu = (isLeader && !isMng) ? `
                    <div class="member-actions-menu">
                        <button class="dots-btn" onclick="toggleMemberMenu('menu-${m.uid}')"><i class="fa-solid fa-ellipsis-vertical"></i></button>
                        <div id="menu-${m.uid}" class="dropdown-content-pro">
                            <div class="dropdown-item-pro" onclick="transferLeadership('${clanId}', '${m.uid}')"><i class="fa-solid fa-crown" style="color:#FFD700;"></i> ${lang==='en'?'Make Leader':'ترقية لزعيم'}</div>
                            <div class="dropdown-item-pro danger" onclick="kickClanMember('${clanId}', '${m.uid}')"><i class="fa-solid fa-user-slash"></i> ${lang==='en'?'Kick':'طرد'}</div>
                        </div>
                    </div>` : '';

                return `
                    <div class="member-card-premium ${isMng ? 'leader' : ''}" ${isMng ? `style="border-left-color:${clanColor}; background:linear-gradient(90deg, ${clanColor}11, transparent);"` : ''}>
                        <div style="display:flex; align-items:center; gap:12px;">
                            <img src="${userPhoto}" style="width: 45px; height: 45px; border-radius: 50%; object-fit: cover; border: 2px solid ${isMng ? clanColor : 'var(--slate)'};">
                            <div>
<h4 style="color:white; margin:0; font-size:0.95rem;">${fullName} ${roleIcon}</h4>

                                <p style="color:var(--slate); font-size:0.8rem; margin:2px 0 0 0;">XP: ${m.xp || 0}</p>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">${readyDot}${adminMenu}</div>
                    </div>`;
            });

            const membersHTMLArray = (await Promise.all(membersPromises)).filter(html => html !== '');
            
            // نستخدم حاوية ديناميكية يمكن استبدالها لاحقاً بشاشة النتائج أو شاشة الانتظار
            let warContent = `<div id="dynamic-war-content" style="text-align:center; padding: 40px;"><i class="fa-solid fa-spinner fa-spin fa-2x" style="color:#FFD700;"></i></div>`;
            
            // تجهيز واجهة الإعدادات (فقط للزعيم)

            let settingsHTML = '';
            if (isLeader) {
                settingsHTML = `
                    <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 15px; border: 1px solid rgba(255,255,255,0.05); margin-bottom: 20px;">
                        <div class="settings-section-title">${lang==='en'?'Clan Name & Motto':'اسم وشعار العصابة'}</div>
                        <input type="text" id="edit-clan-name" class="epic-input-premium" value="${clanName}" maxlength="15" style="margin-bottom: 10px;">
                        <input type="text" id="edit-clan-motto" class="epic-input-premium" placeholder="${lang==='en'?'Enter Clan Motto...':'أدخل عبارة العصابة...'}" value="${clan.motto || ''}" maxlength="40">
                        
                        <div class="settings-section-title" style="margin-top: 15px;">${lang==='en'?'Choose Emblem':'اختر الرمز'}</div>
                        <div class="emblem-grid" id="emblem-selection-grid"></div>
                        <input type="hidden" id="selected-emblem-val" value="${clanEmblem}">

                        <div class="settings-section-title">${lang==='en'?'Choose Color':'اختر اللون'}</div>
                        <div class="color-grid" id="color-selection-grid"></div>
                        <input type="hidden" id="selected-color-val" value="${clanColor}">

                        <button class="btn-primary" style="width:100%; padding:12px; background: rgba(0,242,167,0.1); border-color:#00f2a7; color:#00f2a7;" onclick="saveClanSettings('${clanId}')">
                            <i class="fa-solid fa-floppy-disk"></i> ${lang==='en'?'Save Changes':'حفظ التعديلات'}
                        </button>
                    </div>

                    <div style="background: rgba(255,77,77,0.1); padding: 15px; border-radius: 15px; border: 1px dashed #ff4d4d;">
                        <div class="settings-section-title" style="color: #ff4d4d;"><i class="fa-solid fa-satellite-dish"></i> ${lang==='en'?'Leader Broadcast':'إرسال لاسلكي للأعضاء'}</div>
                        <p style="color: #ccc; font-size: 0.8rem; margin-bottom: 10px;">${lang==='en'?'Send a push notification to all clan members.':'إرسال إشعار فوري لجميع أعضاء الكلان (بما فيهم أنت).'}</p>
                        <input type="text" id="broadcast-msg-input" class="epic-input-premium" placeholder="${lang==='en'?'Type broadcast message...':'اكتب رسالة الإشعار هنا...'}">
                        <button class="btn-primary" style="width:100%; padding:12px; background:#ff4d4d; border:none; color:white; font-weight:bold;" onclick="sendClanBroadcast('${clanId}')">
                            <i class="fa-solid fa-paper-plane"></i> ${lang==='en'?'Send Broadcast':'إرسال الإشعار'}
                        </button>
                    </div>
                `;
            } else {
                settingsHTML = `<div style="text-align:center; padding: 30px; color: var(--slate);"><i class="fa-solid fa-lock fa-3x" style="margin-bottom:15px; color:#555;"></i><p>${lang==='en'?'Only the Leader can access settings.':'الزعيم فقط من يمكنه تعديل إعدادات الكلان.'}</p></div>`;
            }

            area.innerHTML = `
                <div class="guild-banner-premium" style="border-color: ${clanColor}55; box-shadow: 0 0 30px ${clanColor}22;">
                    <i class="${clanEmblem}" style="font-size: 3rem; color: ${clanColor}; filter: drop-shadow(0 0 15px ${clanColor});"></i>
                    <div class="guild-banner-info">
                        <h2 style="color: white; font-weight: 900; margin: 0; font-size: 1.5rem;">${clanName} <span class="guild-tag-badge" style="color:${clanColor}; border-color:${clanColor}; background:${clanColor}22;">#${clanTag}</span></h2>
                        <p style="color: #ddd; font-size: 0.85rem; font-style: italic; margin: 4px 0;">"${clanMotto}"</p>
                        <p style="color: #bbb; font-size: 0.85rem; margin: 8px 0 0 0; font-weight: bold;">
                            <i class="fa-solid fa-trophy" style="color: #FFD700;"></i> ${clanWins} &nbsp;|&nbsp; 
                            <i class="fa-solid fa-users" style="color: #00f2a7;"></i> ${clanMembers.length}/50
                        </p>
                    </div>
                </div>

                <div class="performance-tabs" style="display: flex; gap: 5px; margin-bottom: 20px; background: rgba(255,255,255,0.05); padding: 5px; border-radius: 12px; overflow-x: auto;">
                    <button class="perf-tab-btn active-tab" style="white-space:nowrap; padding:8px 12px;" onclick="switchGuildTab('roster', this)"><i class="fa-solid fa-list"></i> ${lang==='en'?'Roster':'الأعضاء'}</button>
                    <button class="perf-tab-btn" style="white-space:nowrap; padding:8px 12px;" onclick="switchGuildTab('war', this)"><i class="fa-solid fa-khanda"></i> ${lang==='en'?'War':'الحرب'}</button>
                    <button class="perf-tab-btn" style="white-space:nowrap; padding:8px 12px;" onclick="switchGuildTab('chat', this); initClanChat('${clanId}', '${myUid}');"><i class="fa-solid fa-comments"></i> ${lang==='en'?'Chat':'الدردشة'}</button>
                    ${isLeader ? `<button class="perf-tab-btn" style="white-space:nowrap; padding:8px 12px;" onclick="switchGuildTab('settings', this); initSettingsUI('${clanEmblem}', '${clanColor}');"><i class="fa-solid fa-gear"></i> ${lang==='en'?'Settings':'الإعدادات'}</button>` : ''}
                </div>

                <div id="guild-tab-roster" style="display: block; animation: fadeIn 0.4s;">
                    <div style="background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05); border-radius: 15px; padding: 15px; margin-bottom: 20px; max-height: 400px; overflow-y: auto;">
                        ${membersHTMLArray.join('')}
                    </div>
                    <button class="btn-primary" style="width: 100%; padding: 12px; background: rgba(255,77,77,0.1); color: #ff4d4d; border-color: #ff4d4d;" onclick="leaveGuild('${clanId}', '${myUid}', ${isLeader})">
                        <i class="fa-solid fa-door-open"></i> ${lang==='en'?'Leave Clan':'مغادرة العصابة'}
                    </button>
                </div>

                <div id="guild-tab-war" style="display: none; animation: fadeIn 0.4s;">${warContent}</div>

                <div id="guild-tab-chat" style="display: none; animation: fadeIn 0.4s;">
                    <div class="clan-chat-container">
                        <div id="clan-chat-messages" class="chat-messages-area"></div>
                        <div class="chat-input-area">
                            <input type="text" id="clan-chat-input" class="chat-input-pro" placeholder="${lang==='en'?'Type a message...':'اكتب رسالة للكلان...'}" autocomplete="off" onkeypress="if(event.key === 'Enter') sendClanMessage('${clanId}', '${myUid}')">
                            <button class="chat-send-btn" onclick="sendClanMessage('${clanId}', '${myUid}')"><i class="fa-solid fa-paper-plane"></i></button>
                        </div>
                    </div>
                </div>

                <div id="guild-tab-settings" style="display: none; animation: fadeIn 0.4s;">${settingsHTML}</div>
            `;

        window.scrollTo(0, 0);
            
            // الديناميكية الجديدة: تبديل شاشة الحرب حسب الحالة لعرض النتائج مباشرة داخل التبويب
            const dynamicWarContent = document.getElementById('dynamic-war-content');
            if (dynamicWarContent) {
                if (clan.warStatus === 'in_war' && clan.currentWarId) {
                    dynamicWarContent.outerHTML = buildWarScreenHTML(clan, t);
                } else if (clan.lastWarId) {
                    db.collection('wars').doc(clan.lastWarId).get().then(warDoc => {
                        if (warDoc.exists) {
                            const warElement = document.getElementById('dynamic-war-content');
                            if(warElement) warElement.outerHTML = buildLastWarResultHTML(clan, warDoc.data(), t, isLeader);
                        } else {
                            const warElement = document.getElementById('dynamic-war-content');
                            if(warElement) warElement.outerHTML = buildWarIdleHTML(clan, t, isLeader);
                        }
                    }).catch(() => {
                        const warElement = document.getElementById('dynamic-war-content');
                        if(warElement) warElement.outerHTML = buildWarIdleHTML(clan, t, isLeader);
                    });
                } else {
                    dynamicWarContent.outerHTML = buildWarIdleHTML(clan, t, isLeader);
                }
            }

        } catch (err) { console.error(err); }

    // 🌟 Check for unseen completed war results directly from the Clan document

    if (clan.lastWarId) {
        let userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
        // If the user hasn't seen the result of the MOST RECENT war yet:
        if (userData.lastSeenWarId !== clan.lastWarId) {
            db.collection('wars').doc(clan.lastWarId).get().then(warDoc => {

if (warDoc.exists) {
                    const warData = warDoc.data();
                    let myData = warData.clan1.id === clanId ? warData.clan1 : warData.clan2;
                    let enemyData = warData.clan1.id === clanId ? warData.clan2 : warData.clan1;
                    
                    let isWinner = myData.score > enemyData.score;
                    let isDraw = myData.score === enemyData.score;
                    
                    if (typeof showWarResultUI === 'function') {
                        showWarResultUI(isWinner, isDraw, clan.lastWarId, clanId);
                    }
                    
                    // Mark as seen so it doesn't loop
                    userData.lastSeenWarId = clan.lastWarId;
                    localStorage.setItem('currentUser', JSON.stringify(userData));
                    if (myUid) {
                        db.collection('users').doc(myUid).update({ lastSeenWarId: clan.lastWarId });
                    }
                }
            });
        }
    }

    });
};
