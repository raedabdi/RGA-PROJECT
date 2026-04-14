window.activateBottomNav=function(clickedItem){const navItems=document.querySelectorAll('.bottom-nav .nav-item');navItems.forEach(item=>item.classList.remove('active'));if(clickedItem){clickedItem.classList.add('active')}
window.scrollTo({top:0,behavior:'smooth'})};window.triggerProofUpload=async function(notifId){const fileInput=document.getElementById('hidden-proof-upload');fileInput.onchange=async(e)=>{const file=e.target.files[0];if(!file)return;showToast(currentLang==='en'?"Uploading proof... Please wait ":"جاري رفع الإثبات للقيادة... انتظر ");const user=auth.currentUser;try{const notifRef=db.collection('users').doc(user.uid).collection('notifications').doc(notifId);const notifDoc=await notifRef.get();const notifData=notifDoc.data();let workoutDetails=notifData.fullWorkoutData||[notifData.exerciseData];let muscleType=notifData.exerciseData.type||"تمرين لايف";const cleanFileName=file.name.replace(/[^a-zA-Z0-9.]/g,"_");const videoRef=storage.ref(`proofs/${user.uid}_${Date.now()}_${cleanFileName}`);await videoRef.put(file);const videoURL=await videoRef.getDownloadURL();let dateStr=new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});await db.collection('pending_workouts').add({userId:user.uid,userName:JSON.parse(localStorage.getItem('currentUser')).firstName,date:dateStr,type:muscleType,details:workoutDetails,videoUrl:videoURL,status:'pending',timestamp:firebase.firestore.FieldValue.serverTimestamp()});await notifRef.delete();showToast(currentLang==='en'?"Uploaded! Admin will review it.":"تم الرفع! الإدارة رح تراجع وحشنتك 👑")}catch(error){console.error(error);showToast(currentLang==='en'?"Upload failed!":"فشل الرفع!")}};fileInput.click()};window.calculate1RM=function(){const weight=parseFloat(document.getElementById('calc-weight').value);const reps=parseInt(document.getElementById('calc-reps').value);const resultDiv=document.getElementById('calc-result');const rmValue=document.getElementById('rm-value');const t=translations[currentLang||'ar'];if(!weight||!reps||reps<=0||weight<=0){showToast(t.calc_error||"يرجى إدخال وزن وعدات صحيحة! ");return}
let oneRM=weight;if(reps>1){oneRM=weight*(1+(0.0333*reps))}
rmValue.innerText=Math.round(oneRM);resultDiv.style.display='block';rmValue.style.animation='none';setTimeout(()=>rmValue.style.animation='neonPulse 1s ease',10)};let currentTourStep=0;let tourSteps=[];function checkAndShowOnboarding(){if(!localStorage.getItem('hasSeenTour')){setTimeout(startSpotlightTour,1500)}}
function startSpotlightTour(){const t=translations[currentLang||'ar'];tourSteps=[{target:null,title:t.tour_1_title||"أهلاً بك في RGAFIT! 🔥",text:t.tour_1_text||"مكانك الجديد لبناء العضلات وتحطيم الأرقام. رح نعمل جولة سريعة لنعرفك على الأزرار المهمة.",needsSidebar:!1},{target:document.querySelector('[onclick="openWorkoutModal()"]'),title:t.tour_2_title||"سجل تمارينك ",text:t.tour_2_text||"من هون بتسجل أوزانك. كل تمرين بيعطيك 50 XP لترفع مستواك.",needsSidebar:!1},{target:document.querySelector('[onclick="openCityMonster()"]'),title:t.tour_3_title||"وحش المدينة ",text:t.tour_3_text||"اكتشف الخريطة! حطم الأرقام عشان تسيطر على مدينتك.",needsSidebar:!1},{target:document.querySelector('[onclick="openAchievements()"]'),title:t.tour_4_title||"غرفة الجوائز ",text:t.tour_4_text||"كل إنجاز بتعمله بيفتحلك وسام جديد هون. استعد لتجميعهم كلهم!",needsSidebar:!1},{target:document.querySelector('[onclick*="openPerformanceCenter"]'),title:t.tour_5_title||"مركز الأداء 📊",text:t.tour_5_text||"راقب تطورك، شوف إحصائياتك، وقارن مستواك عشان تضل على الطريق الصح.",needsSidebar:!0},{target:document.querySelector('[onclick*="openFriendsCenter"]'),title:t.tour_6_title||"مجتمع الأبطال ",text:t.tour_6_text||"هون بتشوف ترتيبك بين الوحوش بالليدربورد. اثبت نفسك وخليهم يشوفوا اسمك بالصدارة!",needsSidebar:!0},{target:document.querySelector('[onclick*="openProfile"]'),title:t.tour_7_title||"الملف الشخصي ",text:t.tour_7_text||"من هون بتقدر تعدل بياناتك، وتتحكم بحسابك وإعداداتك بالكامل.",needsSidebar:!0}];currentTourStep=0;document.getElementById('spotlight-overlay').style.display='block';document.getElementById('spotlight-tooltip').style.display='block';showSpotlightStep()}
function showSpotlightStep(){const t=translations[currentLang||'ar'];const step=tourSteps[currentTourStep];const highlight=document.getElementById('spotlight-highlight');const tooltip=document.getElementById('spotlight-tooltip');highlight.style.opacity='0';tooltip.style.opacity='0';document.getElementById('spotlight-title').innerText=step.title;document.getElementById('spotlight-text').innerText=step.text;const skipBtn=document.querySelector('#spotlight-tooltip button[onclick*="endSpotlightTour"]');if(skipBtn)skipBtn.innerText=t.btn_skip||(currentLang==='en'?'Skip':'تخطي');const nextBtn=document.getElementById('spotlight-next');if(currentTourStep===tourSteps.length-1){nextBtn.innerText=currentLang==='en'?"Start ":"ابدأ التحدي ";nextBtn.onclick=(e)=>{e.stopPropagation();endSpotlightTour()}}else{nextBtn.innerText=currentLang==='en'?"Next ❯":"التالي ❯";nextBtn.onclick=(e)=>{e.stopPropagation();currentTourStep++;showSpotlightStep()}}
if(step.target){const sidebar=document.getElementById('sidebar');let delay=0;if(window.innerWidth<=768&&sidebar){if(step.needsSidebar){if(sidebar.classList.contains('collapsed')){sidebar.classList.remove('collapsed');delay=550}}else{if(!sidebar.classList.contains('collapsed')){sidebar.classList.add('collapsed');delay=550}}}
setTimeout(()=>{if(step.needsSidebar&&sidebar){step.target.scrollIntoView({behavior:'smooth',block:'nearest'})}else{step.target.scrollIntoView({behavior:'smooth',block:'center'})}
setTimeout(()=>{const rect=step.target.getBoundingClientRect();highlight.style.opacity='1';highlight.style.top=(rect.top-8)+'px';highlight.style.left=(rect.left-8)+'px';highlight.style.width=(rect.width+16)+'px';highlight.style.height=(rect.height+16)+'px';tooltip.style.opacity='1';tooltip.style.top=(rect.bottom+20)+'px';tooltip.style.left='50%';tooltip.style.transform='translateX(-50%)';if(rect.bottom+200>window.innerHeight){tooltip.style.top=(rect.top-tooltip.offsetHeight-20)+'px'}},400)},delay)}else{highlight.style.opacity='0';highlight.style.top='50%';highlight.style.left='50%';highlight.style.width='0px';highlight.style.height='0px';tooltip.style.opacity='1';tooltip.style.top='50%';tooltip.style.left='50%';tooltip.style.transform='translate(-50%, -50%)'}}
function endSpotlightTour(){document.getElementById('spotlight-overlay').style.display='none';document.getElementById('spotlight-tooltip').style.display='none';localStorage.setItem('hasSeenTour','true');if(window.innerWidth<768){const sidebar=document.getElementById('sidebar');if(sidebar)sidebar.classList.add('collapsed');}}
async function openAdminPanel(){if(window.innerWidth<768)document.getElementById('sidebar').classList.add('collapsed');const mainContent=document.getElementById('main-content-area');if(!mainContent)return;if(!mainContent.dataset.originalContent){mainContent.dataset.originalContent=mainContent.innerHTML}
const t=translations[currentLang||'ar'];mainContent.innerHTML=`
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
    `;loadPendingWorkouts();loadAdminMessages()}
window.switchAdminTab=function(tab,btn){document.querySelectorAll('.perf-tab-btn').forEach(b=>b.classList.remove('active-tab'));btn.classList.add('active-tab');document.getElementById('admin-tab-requests').style.display=tab==='requests'?'block':'none';document.getElementById('admin-tab-messages').style.display=tab==='messages'?'block':'none'};async function loadAdminMessages(){const container=document.getElementById('admin-messages-container');try{const snapshot=await db.collection('contact_messages').orderBy('timestamp','desc').get();if(snapshot.empty){container.innerHTML=`<div class="empty-notif" style="margin-top:50px;"><i class="fa-solid fa-inbox" style="font-size:4rem; color:var(--slate);"></i><p style="margin-top:15px; color:white;">لا توجد رسائل جديدة.</p></div>`;return}
let html='<div style="display: flex; flex-direction: column; gap: 15px;">';snapshot.forEach(doc=>{const data=doc.data();const date=data.timestamp?data.timestamp.toDate().toLocaleString('en-GB'):'غير معروف';html+=`
                <div class="glass-card" style="border-right: 4px solid #3498db; text-align: right;">
                    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; margin-bottom: 10px;">
                        <span style="color: #3498db; font-weight: bold;"><i class="fa-solid fa-envelope"></i> ${data.email}</span>
                        <span style="color: var(--slate); font-size: 0.8rem;">${date}</span>
                    </div>
                    <p style="color: white; font-size: 0.95rem; white-space: pre-wrap; margin-bottom: 15px;">${data.message}</p>
                    <button class="btn-primary" onclick="deleteAdminMessage('${doc.id}')" style="padding: 5px 15px; background: rgba(255,77,77,0.1); color: #ff4d4d; border-color: #ff4d4d; font-size: 0.8rem;">حذف الرسالة <i class="fa-solid fa-trash"></i></button>
                </div>
            `});container.innerHTML=html+'</div>'}catch(e){container.innerHTML=`<p style="text-align:center; color:#ff4d4d;">حدث خطأ أثناء تحميل الرسائل</p>`}}
async function loadPendingWorkouts(){const container=document.getElementById('admin-requests-container');if(!container)return;const t=translations[currentLang||'ar'];try{const snapshot=await db.collection('pending_workouts').orderBy('timestamp','desc').get();if(snapshot.empty){container.innerHTML=`<div class="empty-notif" style="margin-top:50px;"><i class="fa-solid fa-check-circle" style="font-size:4rem; color:var(--primary-color);"></i><p style="margin-top:15px; color:white;">${t.admin_empty || 'لا يوجد طلبات معلقة!'}</p></div>`;return}
let html='<div style="display: flex; flex-direction: column; gap: 15px;">';snapshot.forEach(doc=>{const data=doc.data();let detailsHtml=data.details.map(ex=>`<span style="display:inline-block; background:rgba(0,0,0,0.3); padding:3px 8px; border-radius:5px; margin:2px; font-size:0.8rem;">${ex.name}: ${ex.weight}kg x ${ex.reps}</span>`).join('');html+=`
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
            `});container.innerHTML=html+'</div>'}catch(error){console.error(error);container.innerHTML=`<p style="text-align:center; color:#ff4d4d;">حدث خطأ أثناء تحميل الطلبات</p>`}}



window.deleteAdminMessage=async function(docId){if(!confirm("حذف الرسالة نهائياً؟"))return;try{await db.collection('contact_messages').doc(docId).delete();showToast("تم حذف الرسالة.");loadAdminMessages()}catch(e){showToast("فشل الحذف!")}};

let isApprovingWorkout = false;
async function approveWorkout(docId) {

    const t = translations[currentLang || 'ar'];
    if (!confirm(t.confirm_approve)) return;
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

        // 1. حساب الوزن الجديد والقديم
        let oldMaxW = userData.stats?.maxWeight || 0;
        let maxW = oldMaxW;
        data.details.forEach(ex => {
            if (parseFloat(ex.weight) > maxW) maxW = parseFloat(ex.weight);
        });

        let dethronedVictim = null;
        let rankLostName = "Fallen Hero";

        // 🔥 **التشخيص يبدأ هنا**
        if (maxW > oldMaxW && userData.city) {
            const top3Snap = await db.collection('users').where('city', '==', userData.city).orderBy('stats.maxWeight', 'desc').limit(3).get();
            let top3 = [];
            top3Snap.forEach(doc => top3.push({ id: doc.id, ...doc.data() }));

            for (let i = 0; i < top3.length; i++) {
                let rival = top3[i];
                let rivalWeight = rival.stats?.maxWeight || 0;

                // هذا هو الشرط الذي قد يفشل بصمت
                if (maxW > rivalWeight && rival.id !== data.userId && oldMaxW <= rivalWeight) {
                    dethronedVictim = rival;
                    if (i === 0) rankLostName = currentLang === 'en' ? "City Monster" : "وحش المدينة";
                    else if (i === 1) rankLostName = currentLang === 'en' ? "Silver Guard" : "حارس فضي";
                    else if (i === 2) rankLostName = currentLang === 'en' ? "Bronze Guard" : "حارس برونزي";
                    break;
                }
            }
        }
        
        let updatePayload = {
            workouts: firebase.firestore.FieldValue.arrayUnion({ date: data.date, type: data.type, details: data.details }),
            isWorkoutPending: false,
            'stats.maxWeight': maxW
        };
        
        let totalVol = 0;
        data.details.forEach(ex => { totalVol += (parseFloat(ex.weight) * parseInt(ex.reps)) || 0; });
        
        // ... (بقية الكود الخاص بالحروب والمهام يبقى كما هو)

        // 🔥 **الرسائل التشخيصية**
        if (dethronedVictim) {
            showToast(`✅ تم العثور على ضحية: ${dethronedVictim.firstName}. جاري إضافته للمقبرة...`);
            let xpReward = 1000;
            updatePayload.xp = firebase.firestore.FieldValue.increment(xpReward);

            try {
                await db.collection('fallen_kings').add({
                    city: userData.city,
                    kingName: dethronedVictim.firstName + " " + (dethronedVictim.lastName || ''),
                    kingPhoto: dethronedVictim.photoURL || '/Photos/adm.png',
                    weight: dethronedVictim.stats?.maxWeight || 0,
                    slayerName: userData.firstName + " " + (userData.lastName || ''),
                    slayerWeight: maxW,
                    rankLost: rankLostName,
                    fallDate: firebase.firestore.FieldValue.serverTimestamp()
                });
                showToast("🪦 تم تسجيل الملك الساقط في المقبرة بنجاح!");
            } catch (err) {
                console.error("Valhalla Error:", err);
                showToast("❌ فشل تسجيل الملك الساقط في المقبرة!");
            }

const selfMsg = currentLang === 'en' ? `👑 You crushed a record in ${userData.city}! You took down a map legend with ${maxW}kg and earned +1000 XP!` : `👑 لقد حطمت عرشاً في ${userData.city}! حصلت على +1000 XP وأنت الآن ملك الخريطة بوزن ${maxW}kg!`;
            await userRef.collection('notifications').add({ type: 'throne_win', text: selfMsg, status: 'pending', timestamp: firebase.firestore.FieldValue.serverTimestamp() });

        } else {

            showToast(" تم اعتماد التمرين، لكنه لم يكسر أي رقم قياسي على الخريطة.");
            updatePayload.xp = firebase.firestore.FieldValue.increment(50);
            await userRef.collection('notifications').add({ type: 'admin_alert', senderName: t.admin_name, text: t.admin_notif_approve, status: 'pending', timestamp: firebase.firestore.FieldValue.serverTimestamp() });
        }

        await userRef.update(updatePayload);



        try { await storage.refFromURL(data.videoUrl).delete(); } catch (err) {}
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



window.openGameSelection=function(){const modal=document.getElementById('game-selection-modal');applyLanguage();modal.style.display='flex';document.body.classList.add('no-scroll');document.documentElement.classList.add('no-scroll');setTimeout(()=>{modal.classList.add('active')},10);if(window.innerWidth<768){const sidebar=document.getElementById('sidebar');if(sidebar)sidebar.classList.add('collapsed');}};window.closeGameSelection=function(){const modal=document.getElementById('game-selection-modal');modal.classList.remove('active');document.body.classList.remove('no-scroll');document.documentElement.classList.remove('no-scroll');setTimeout(()=>{modal.style.display='none'},400)};window.showUltimateHelp=function(gameType){const t=translations[currentLang||'ar'];let title="",text="",color="",icon="";if(gameType==='deadlift'){title=t.help_deadlift_title;text=t.help_deadlift_text;color="#ff4d4d";icon="fa-arrow-up-right-dots"}else if(gameType==='squat'){title=t.help_squat_title;text=t.help_squat_text;color="#00f2a7";icon="fa-arrows-down-to-line"}else if(gameType==='reflex'){title=t.help_reflex_title;text=t.help_reflex_text;color="#ff9f43";icon="fa-bolt-lightning"}
const modalHtml=document.createElement('div');modalHtml.className='modal-overlay active';modalHtml.style.zIndex='65000';modalHtml.style.background='rgba(5, 10, 20, 0.5)';modalHtml.style.backdropFilter='blur(15px)';modalHtml.innerHTML=`
        <div class="modal-content" style="
            max-width: 320px; padding: 25px 20px; text-align: center; 
            background: rgba(15, 23, 42, 0.8); /* لون أغمق وأكثر احترافية */
            border: 1px solid ${color}; border-radius: 18px;
            box-shadow: 0 15px 40px rgba(0,0,0,0.9);
            transform: scale(0.95); opacity: 0;
            animation: popHologram 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            position: relative; overflow: hidden;">
            
            <div style="font-size: 2.8rem; color: ${color}; margin-bottom: 15px; filter: drop-shadow(0 0 15px ${color});">
                <i class="fa-solid ${icon}"></i>
            </div>
            <h2 style="color: white; font-weight: 900; margin-bottom: 12px; font-size: 1.3rem;">${title}</h2>
            <p style="color: #a0aec0; font-size: 0.9rem; line-height: 1.6; margin-bottom: 25px;">${text}</p>
            
            <button class="btn-primary" onclick="this.parentElement.parentElement.remove()" style="
                width: 100%; background: rgba(255,255,255,0.05); color: ${color}; border: 1px solid ${color}; 
                font-weight: bold; font-size: 0.95rem; padding: 12px; border-radius: 10px; transition: 0.2s;">
                ${currentLang === 'en' ? 'UNDERSTOOD' : 'علم'}
            </button>
        </div>
        <style>
            @keyframes popHologram { to { transform: scale(1); opacity: 1; } }
        </style>
    `;document.body.appendChild(modalHtml)};function activateButton(clickedButton){const allButtons=document.querySelectorAll('.sidebar-btn');allButtons.forEach(btn=>btn.classList.remove('active-btn'));clickedButton.classList.add('active-btn');window.scrollTo({top:0,behavior:'smooth'})}
const firebaseConfig={apiKey:"AIzaSyDV7SNwgv_K10tX0iJpNYqg8_iJnWprFB4",authDomain:"rgalab.firebaseapp.com",projectId:"rgalab",storageBucket:"rgalab.firebasestorage.app",messagingSenderId:"882288745140",appId:"1:882288745140:web:3c77b0f83ac4e11d30d5e1"};if(!firebase.apps.length){firebase.initializeApp(firebaseConfig)}
const auth=firebase.auth();const db=firebase.firestore();db.settings({experimentalForceLongPolling:!0,useFetchStreams:!1});const storage=firebase.storage();let messaging=null;try{if(firebase.messaging&&firebase.messaging.isSupported()){messaging=firebase.messaging();console.log("✅ نظام الإشعارات جاهز للعمل");messaging.onMessage((payload)=>{showToast(`🔔 ${payload.notification.title}: ${payload.notification.body}`)})}else{console.log("⚠️ هذا المتصفح لا يدعم إشعارات الويب")}}catch(error){console.error("❌ تم تجاوز خطأ الإشعارات للحفاظ على عمل الموقع:",error)}
firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL).then(()=>{firebase.auth().onAuthStateChanged((user)=>{const currentPath=window.location.pathname;const isIndexPage=currentPath.endsWith('index.html')||currentPath==='/';if(user){if(isIndexPage&&user.emailVerified){window.location.replace('dashboard.html')}}else{if(!isIndexPage){window.location.replace('index.html')}}})}).catch((error)=>{console.error("Error setting persistence:",error)});const translations={ar:{cancel_upload:" تم إلغاء التسجيل.. جرب مرة ثانية بس تكون جاهز تثبت قوتك!",video_size_error:" حجم الفيديو كبير جداً! حاول تقصه أو تضغط حجمه لتتجاوز 30 ميجا.",upload_fail_storage:" فشل الرفع! تأكد من اتصالك بالإنترنت.",upload_success_wait:" تم رفع الفيديو بنجاح! الإدارة بتراجع إثباتك، استنى شوي.",save_db_error:" تم رفع الفيديو لكن فشل الحفظ! حاول مرة أخرى.",calc_error:"يرجى إدخال وزن وعدات صحيحة!",play_now:"العب الآن",transfer_leader:"نقل القيادة 👑",
combo_record_toast: "🔥 رقم قياسي جديد للكومبو: {combo}!",


soon_btn:"تحت الصيانة",maintenance_title:"الموقع تحت الصيانة ",maintenance_desc:"نحن نعمل على ترقية الأنظمة لتقديم تجربة أفضل. نعتذر عن الإزعاج، يرجى المحاولة لاحقاً.",state_ready:" جاهز للحرب",state_standby:" استراحة",mark_read:"تحديد كـ مقروء ومسح",dashboard:"لوحة التحكم",welcome:"سعيد برؤيتك، كابتن",processing_wait:"جاري المعالجة... ⏳",approve_success:"✅ تم الاعتماد بنجاح!",approve_fail:"❌ فشل الاعتماد!",deleting_wait:"جاري الحذف... ⏳",reject_success:"🗑️ تم الرفض.",reject_fail:"❌ فشل الرفض!",feat1_title:"نظام وحش المدينة",feat1_desc:"انضم إلى ساحة القتال! تنافس مع أصدقائك في مدينتك، حطم الأرقام القياسية، واجلس على عرش الصدارة. عند كسر الرقم، نطلب إثبات فيديو، وعندما تُثبت قوتك، تصبح الملك المطلوب للعدالة! هل أنت مستعد للسيطرة؟",feat2_title:"رادار العضلات والجاهزية",rga_way_1_title:"مدرب ذكي (AI) يراقبك",rga_way_1_desc:"نظام ذكاء اصطناعي يحلل أداءك، يتوقع أقصى وزن لك (1RM)، ويحذرك من الإرهاق العصبي.",rga_way_2_title:"عصابات، حروب، وجوائز",rga_way_2_desc:"أسس عصابتك، أعلن الحرب على أندية أخرى، واغنموا نقاط الـ XP والجوائز الملحمية.",rga_way_3_title:"العب وسيطر على مدينتك",rga_way_3_desc:"العب تحديات موسيقية، حطم أرقام مدينتك لتصبح 'المطلوب الأول'، واجمع أوسمة نادرة.",feat1_title:"المدرب الذكي (AI Coach)",feat1_desc:"خوارزميات ذكاء اصطناعي متطورة تحلل كل تمرين، تقرأ مستوى الإرهاق العصبي (TSB)، وتخبرك باللحظة المثالية لكسر رقمك القياسي مع رادار يراقب توازن عضلاتك.",feat2_title:"حروب العصابات (Iron Guilds)",feat2_desc:"الذئاب المنفردة لا تنجو هنا. أسس عصابتك أو انضم لكلان، جهز مقاتليك، وأعلن الحرب الطاحنة ضد العصابات الأخرى لرفع الأوزان وسحق الخصوم لغنم الجوائز.",


feat3_title:"نظام وحش المدينة والجوائز",
        feat3_desc:"سجل أعلى وزن، ارفع فيديو الإثبات، واجلس على عرش مدينتك. احصل على 'ضريبة الملك' اليومية، واجمع أوسمة وإطارات نادرة من المتجر تثبت فخامتك.",
        
        // --- النصوص القانونية (Lemon Squeezy) ---
        ft_refund: "سياسة الاسترجاع",
        legal_refund_title: "سياسة الاسترجاع (Refund Policy)",
        legal_refund_body: `
            <p>بما أن منصة RGA Fitness تقدم "منتجات رقمية قابلة للاستهلاك"، فإننا نطبق السياسة التالية بما يتوافق مع بوابة الدفع <b>Lemon Squeezy</b> (تاجر السجل الخاص بنا):</p>
            <h3>1. المنتجات الرقمية المستهلكة</h3>
            <p>بمجرد إتمام عملية الشراء بنجاح وإضافة العملة الرقمية أو المظاهر إلى حسابك <b>واستخدامها</b>، تصبح العملية غير قابلة للاسترجاع (Non-Refundable).</p>
            <h3>2. الأخطاء التقنية والمشتريات الخاطئة</h3>
            <p>إذا حدث خطأ تقني أثناء الدفع (مثل خصم المبلغ وعدم وصول المشتريات)، أو إذا قمت بعملية شراء بالخطأ <b>ولم تقم باستهلاك</b> المنتج الرقمي، يحق لك طلب استرجاع كامل للمبلغ خلال <b>14 يوماً</b> من تاريخ الشراء.</p>


            <h3>3. كيفية طلب استرجاع</h3>
            <p>يجب التواصل مع الدعم الفني عبر صفحة "المساعدة" أو إرسال بريد إلكتروني مرفقاً برقم الطلب (Order ID) المرسل من قبل Lemon Squeezy.</p>
        `,

        feat4_title:"ألعاب القوة والتسجيل المباشر",
        feat4_desc:"سجل تمرينك بالوقت الفعلي مع مؤقت راحة ذكي. وفي وقت الفراغ؟ العب تحديات الديدليفت والسكوات وصائد الأوزان على إيقاع الموسيقى لتضاعف نقاطك.",

gender_select_ph: "-- اختر الجنس --",
gender_male: " ذكر",
gender_female: " أنثى",


btn_join_empire: "انضم إلينا ",
job_modal_title: "انضم لفريق Royal Gravitas Arena",
job_modal_subtitle: "نحن لا نبحث عن موظفين، بل عن شركاء نجاح لبناء إمبراطورية اللياقة.",
job_name: "الاسم الكامل",
job_email: "البريد الإلكتروني",
job_phone: "رقم الواتساب",
job_role_select: "-- اختر المنصب الذي تبدع فيه --",
role_support: " دعم فني وخدمة عملاء",
role_referee: " مُحكم أداء (تدقيق فيديوهات الأوزان)",
role_creator: " صانع محتوى (تصميم / مونتاج)",
role_coordinator: " منسق أندية (تسويق وعلاقات عامة)",
job_salary_select: "-- ما هي توقعاتك المالية؟ --",
salary_fixed: " راتب شهري ثابت",
salary_commission: " نسبة وعمولات على الأرباح/الاشتراكات",
salary_prove: " إثبات نفسي أولاً (فترة تجريبية) ثم نحدد",
salary_amount: "كم تتوقع الراتب؟ (بالدولار $)",
viral_box_title: "مبادرة شركاء التأسيس",
viral_box_desc: "نحن نراقب القيادات المؤثرة. وثّق أقدميتك بالتقاط شاشة لطلبك ومشاركتها عبر الستوري مع الإشارة لحسابنا @RGA.BEST. أول 500 شريك سيحصلون على امتيازات الإطلاق: لقب 'عضو مؤسس'، 1000 XP، والصندوق الفولاذي.",
job_submit_btn: "إرسال الطلب ",

error_loading:"حدث خطأ أثناء تحميل البيانات.",admin_name:"الإدارة 👑",leaderboard:" لوحة المتصدرين",city_grave_title:"مدافن أساطير {city} 🪦",logout:" تسجيل الخروج",level:"المستوى",xp:"نقاط الخبرة",streak:"سلسلة الدخول",days:"يوم",id_text:"معرف اللاعب:",back:"رجوع",lang_en:"English",lang_ar:"العربية",home_btn:"الرئيسية",language_btn:" اللغة الرئيسية",grave_time_death:"وقت الوفاة:",grave_old_record:"الرقم القديم:",grave_assassin:"القاتل:",grave_condition:"حالة القبر",grave_respected:"مُحترم",grave_defaced:"مُدنس",grave_leave_comment:"اترك تعليقاً في سجل الزوار",grave_place_flowers:"وضع زهور",grave_deface:"تدنيس القبر",grave_btn_comment:"إرسال التعليق",grave_comments_title:"التعليقات",save_name:"حفظ الاسم الجديد",name_cooldown:"تغيير الاسم متاح كل 30 يوم فقط!",comparison_title:"توقف عن التدريب، وابدأ السيطرة",comparison_desc:"هناك طريقتان للتمرين. الطريقة التقليدية، وطريقة الأبطال.",old_way_title:"الطريقة القديمة",old_way_1_title:"تدريب عشوائي",old_way_1_desc:"تمرين بدون خطة واضحة، أوزان منسية، وتقدم بطيء.",old_way_2_title:"ملل وفقدان شغف",old_way_2_desc:"تكرار نفس الروتين يؤدي حتماً إلى فقدان الحماس والتوقف.",old_way_3_title:"رحلة فردية",old_way_3_desc:"لا يوجد مجتمع يدعمك، لا منافسة تحفزك، ولا أحد يعترف بك.",rga_way_title:"طريقة RGA",rga_way_1_title:"أداء محسوب بالذكاء",rga_way_1_desc:"رادار العضلات يمنع الإصابات، والنظام يخبرك متى تكسر رقمك.",rga_way_2_title:"متعة وتحدي مستمر",rga_way_2_desc:"حوّل تمرينك إلى لعبة، واجمع النقاط لتتصدر الترتيب.",rga_way_3_title:"مجتمع من الوحوش",rga_way_3_desc:"سيطر على مدينتك، انضم لعصابات الحديد، وافرض اسمك عالمياً.",location_cooldown:"تغيير الموقع متاح كل 24 ساعة فقط!",edit_name:"تعديل الاسم",reflex_title:"صائد الأوزان",reflex_desc:"اختبر سرعة بديهتك وتركيزك",reflex_multiplier:"السرعة: ",reflex_start:"اضغط للبدء",play_now:"العب الآن",help_deadlift_title:"تحدي الديدليفت",help_deadlift_text:"الهدف هو تجميع أكبر عدد من النقاط خلال 60 ثانية. كل ضغطة تمثل رفعة. استمر بالضغط المتواصل والسريع لبناء 'كومبو' يزيد من حماسك. نصيحة احترافية: استخدم إصبعين بالتناوب لتحقيق أقصى سرعة!",help_squat_title:"تحدي السكوات",help_squat_text:"التحدي هنا هو الدقة والتركيز. هدفك هو إيقاف الخط المتحرك داخل 'المنطقة الخضراء' تماماً. كل ضغطة صحيحة هي عدة مثالية. احذر، لديك 5 محاولات خاطئة فقط قبل أن ينتهي التحدي. ركز على إيقاع حركة الخط لتتقنها.",help_reflex_title:"تحدي صائد الأوزان",help_reflex_text:"مصيرك يعتمد على سرعة بديهتك! المس 'الحديدة' النازلة قبل أن تصل إلى الأسفل. إذا لمست مساراً فارغاً أو تركت حديدة تسقط، ستخسر روحاً. انتبه للـ'القلب الذهبي' النادر، فهو يمنحك روحاً إضافية (بحد أقصى 3). نصيحة: ركز على أعلى الشاشة لتتوقع الوزن القادم.",grave_here_lies:"هنا يرقد",profile_btn:" الملف الشخصي",performance_center:"مركز الأداء",analytics:"التحليلات",workout_history:"سجل التمارين",games_btn:" الألعاب والتحديات",achievements:" غرفة الجوائز",friends_center:" مجتمع الأبطال",city_monster:"وحش المدينة",loading:"جاري التحميل...",tour_1_title:"أهلاً بك في RGA Pro! ",tour_1_text:"مكانك الجديد لبناء العضلات وتحطيم الأرقام. خلينا ناخذ لفة سريعة بالتطبيق عشان تعرف من وين تبدأ.",tour_2_title:"سجل تمارينك ",tour_2_text:"اضغط على زر (تمرين جديد) لتوثيق أوزانك، كل تمرين بتسجله بيعطيك 50 XP لترفع مستواك وتنافس الوحوش.",tour_3_title:"وحش المدينة ",tour_3_text:"اكتشف الخريطة! إذا كسرت رقم قياسي، رح نطلب منك إثبات فيديو، وممكن تصير أنت الملك المطلوب بمدينتك.",tour_4_title:"غرفة الجوائز ",privacy_title:"سياسة الخصوصية",privacy_desc:"نحن نأخذ خصوصيتك على محمل الجد. يتم تخزين جميع بياناتك بشكل آمن ولا تتم مشاركتها مع أي طرف ثالث.",auth_login_tab:"تسجيل الدخول",auth_signup_tab:"تسجيل جديد",login_success:" تم الدخول، جاري تحويلك...",auth_email_ph:"البريد الإلكتروني",auth_pass_ph:"كلمة المرور",auth_login_btn:"الدخول",auth_forgot_pass:"نسيت كلمة المرور؟",auth_fname_ph:"الاسم الأول",auth_lname_ph:"الاسم الأخير",auth_signup_btn:"إنشاء حساب",prompt_email:"الرجاء إدخال بريدك الإلكتروني المسجل لدينا:",reset_sent:" تم إرسال رابط استعادة كلمة المرور إلى بريدك.",terms_title:"شروط الخدمة",terms_desc:"باستخدامك للتطبيق، فإنك توافق على عدم استخدام أي وسائل غش. أي حساب يثبت عليه الغش سيتم حظره.",err_invalid_cred:" البريد الإلكتروني أو كلمة المرور غير صحيحة!",err_email_in_use:" هذا البريد الإلكتروني مسجل مسبقاً!",err_user_not_found:" هذا البريد مش مسجل عنا!",err_weak_pass:" كلمة المرور ضعيفة (يجب أن تكون 6 أحرف على الأقل).",guilds_btn:"عصابات الحديد",guild_hub:"مقر العصابة 🛡️",create_guild:"تأسيس عصابة (1000 XP)",guild_name:"اسم العصابة",guild_tag:"الرمز (Tag - 4 أحرف)",no_guild:"أنت ذئب وحيد! أسس عصابتك أو انضم لواحدة.",join_guild:"البحث عن عصابة",guild_members:"الأعضاء",war_room:"غرفة الحرب ⚔️",war_ready:"جاهز للحرب",search_war:"البحث عن فريسة (حرب)",war_active:"حرب طاحنة جارية!",kick_member:"طرد",promote_member:"ترقية",leave_guild:"مغادرة العصابة",not_enough_xp_guild:"تحتاج 1000 XP لتأسيس عصابة!",guild_created:"تم تأسيس العصابة بنجاح! أنت الزعيم.",war_win_prize:"جائزة الانتصار: 500 XP لكل عضو",vs_text:"ضد",err_invalid_email:" صيغة البريد الإلكتروني غير صحيحة!",err_default:" حدث خطأ، يرجى المحاولة لاحقاً.",superset_btn:"سوبرسيت",live_select_muscle:"اختر العضلة",muscle_arms:"أذرع",tour_4_text:"كل ما تتعب أكثر، بتفتح أوسمة نادرة بتثبت إنك وحش حقيقي. جاهز للتحدي؟",btn_next:"التالي ❯",btn_start:"ابدأ التحدي ",btn_skip:"تخطي",tour_5_title:"مركز الأداء ",tour_5_text:"راقب تطورك، شوف إحصائياتك، وقارن مستواك عشان تضل على الطريق الصح.",tour_6_title:"مجتمع الأبطال ",





tour_6_text:"هون بتشوف ترتيبك بين الوحوش بالليدربورد. اثبت نفسك وخليهم يشوفوا اسمك بالصدارة!",tour_7_title:"الملف الشخصي ",tour_7_text:"من هون بتقدر تعدل بياناتك، وتتحكم بحسابك وإعداداتك بالكامل.",calc_title:"حاسبة أقصى وزن (1RM) ",calc_desc:"احسب أقصى وزن نظري لعدة واحدة",calc_weight_ph:"الوزن (kg)",calc_reps_ph:"العدات",calc_btn:"احسب قوتي ",calc_result_label:"أقصى وزن لعدة واحدة:",template_btn:" تعبئة قالب جاهز",template_loaded:"تم تحميل القالب الجاهز! عبي أوزانك يا وحش ",game_cooldown:"اللعبة في فترة استراحة! متاحة بعد",wait_setup:"لحظة نجهزلك اللعبة يا وحش ",grave_desc_1:"تتعاون مدينة الأساطير لتوفير مكان للعزاء لمن فقدوا عروشهم. هنا في المقبرة ستجد مكاناً لإلقاء التحية على الملوك الذين سقطوا. أدناه ستجد الوفيات التي حدثت في الأيام السبعة الماضية، ويمكنك استخدام ميزة البحث للبحث عن أي شخص سقط مسبقاً.",grave_desc_2:"يوجد سجل زوار لكل قبر حتى تتمكن من ترك ذكرى أو رأي حول المتوفى. إذا كنت تشعر بالجرأة، يمكنك أيضاً تدنيس القبر ليعرف الجميع من هو المسؤول.",recent_deaths:"الوفيات الأخيرة",all_time:"الكل",new_max_alert:" دمار شامل! كسرت رقمك بنفس التمرين. الإثبات رح ينطلب للوزن الأعلى ({weight}kg)!",badge_completed:"مكتمل ",reward_text:"الجائزة: ",level_up:" مبروك! وصلت للمستوى",streak_fire:"🔥 وحش! الستريك تبعك صار",days_streak:"أيام!",empty_log:"لا يوجد تمارين مسجلة بعد. ابدأ الآن! ",add_weights_msg:"سجل أوزانك في التمارين لتظهر هنا 📈",empty_chart:"لا يوجد بيانات كافية للرسم البياني",level_promo:"استمر بالتمرين للترقية!",streak_promo:"سجل دخول يومياً لمضاعفة النقاط",

gym_placeholder:"اسم النادي الذي تتمرن فيه (اختياري)",
enter_id_msg:"أدخل ID اللاعب للبحث عنه",search_heroes_msg:"ابحث عن أصدقائك وضيفهم لتبدأ التحديات!",meal_cooldown:"وجبتك لسه بتنهضم! انتظر",admin_panel:"👑 لوحة الإدارة",admin_requests:"👑 طلبات الوحشنة",admin_loading:"جاري سحب الفيديوهات من السيرفر...",admin_empty:"لا يوجد طلبات معلقة!",approve_btn:"✅ اعتماد الوحش",reject_btn:"❌ رفض وغش",captain:"الكابتن",workout_date:"التاريخ",muscle_label:"العضلة",confirm_approve:"متأكد إنك بدك تعتمد هذا الوزن الأسطوري؟",confirm_reject:"هل أنت متأكد من رفض الطلب؟ سيتم حذف الفيديو.",admin_notif_approve:"تم مراجعة الفيديو واعتماد وحشنتك بنجاح! عاش يا بطل 🔥",admin_notif_reject:"للأسف تم رفض الإثبات الخاص بك! إما أن الوزن غير صحيح أو الفيديو غير واضح.",pending_review_msg:"⏳ وحش! عندك تمرين أسطوري قيد المراجعة.. استرخي شوي لبين ما نعتمدلك ياه!",heavy_lift_alert:" إنت وحش!!\nلأنك قطعت الدنيا، لازم ترفع فيديو يثبت قوتك عشان نعتمدلك الرقم ونحطه بالليدربورد.\nجاهز ترفع الفيديو؟",uploading_proof:"جاري رفع إثبات الوحشنة... لا تطلع من التطبيق! 🚀",upload_success:"✅ تم رفع الفيديو بنجاح! الإدارة بتراجع وحشنتك، استنى شوي يا بطل.",upload_fail:"❌ فشل رفع الفيديو.. تأكد من الإنترنت وجرب كمان مرة.",country_select:"اختر الدولة...",city_select:"اختر المدينة...",save_location:"حفظ الموقع",no_monster_yet:"لا يوجد وحش في هذه المدينة بعد! كن أنت الأول.",challenge_him:"تحدى الوحش ⚔️",help_btn:"جولة تعريفية",max_weight_record:"أعلى وزن: ",battleground:"ساحة المعركة ⚔️",weights_filter:"الأوزان",commitment_filter:"الالتزام",map_level_filter:"المستوى",wanted_dead:"مطلوب للعدالة ",silver_guard:" حارس فضي",bronze_guard:" حارس برونزي",tribute_btn:" تحصيل ضريبة الملك",nav_features:"الميزات",nav_stats:"الإحصائيات",nav_help:"المساعدة",hero_subtitle:"حوّل لياقتك إلى لعبة",hero_title:"ارتقِ بقوتك",hero_desc:"انضم إلى ثورة اللياقة البدنية. اكتسب نقاط خبرة، تنافس مع الأصدقاء، وحقق أهدافك بطريقة لم تتخيلها من قبل.",btn_start:"ابدأ التحدي الآن",stat_active:"عضو نشط",stat_weight:"كجم تم رفعه",stat_challenges:"تحدي مكتمل",feat_main_1:"أطلق",feat_main_2:"العنان لقدراتك",feat_subtitle:"كل ما تحتاجه للوصول إلى القمة في منصة واحدة متكاملة.",help_title:"مركز المساعدة ",faq_tab:"الأسئلة الشائعة",contact_tab:"تواصل معنا",contact_desc:"عندك مشكلة أو اقتراح؟ ابعث للإدارة مباشرة!",send_msg:"إرسال الرسالة",email_ph:"بريدك الإلكتروني",msg_ph:"اكتب رسالتك هنا...",tribute_success:"💰 تم تحصيل +50 XP ضريبة الملك!",tribute_claimed:"الضريبة محصلة اليوم ",map_weights:" الأوزان",map_streak:" الالتزام",map_level:" المستوى",my_city:" (مدينتي)",locating_city:"جاري تحديد موقع المدينة...",moving_to:"جاري الانتقال إلى",corp_about_title:"عن Royal Gravitas Arena",corp_about_desc:"نحن لسنا مجرد تطبيق للياقة البدنية؛ نحن مؤسسة رائدة في تكنولوجيا الأداء الرياضي. هدفنا هو دمج العلم مع الألعاب لخلق تجربة تدريبية فريدة تدفع بالبشر إلى أقصى قدراتهم البدنية والذهنية.",corp_values_title:"قيمنا الأساسية",val1_t:"النزاهة",val1_d:"نظام التحقق بالفيديو يضمن منافسة شريفة للجميع.",



delete_confirm_single: "هل أنت متأكد من حذف هذا التمرين؟ سيتم حذفه نهائياً.",
delete_confirm_all: "هل أنت متأكد من حذف كل سجلات تمارينك؟ سيؤدي هذا إلى إعادة ضبط الإحصائيات!",
delete_success_single: "تم حذف التمرين بنجاح!",
delete_success_all: "تم مسح سجل التمارين بالكامل.",
reset_log_btn: "إعادة ضبط السجلات",
log_delete_btn: "حذف",



val2_t:"الابتكار",val2_d:"استخدام خوارزميات الـ TSB والرادار العضلي المتقدمة.",val3_t:"الشمولية",val3_d:"مجتمع عالمي يضم أبطالاً من كافة أنحاء العالم.",corp_contact_title:"المراسلات الرسمية",corp_contact_desc:"للاستفسارات التجارية، الشراكات، أو الدعم الفني المتقدم، يرجى التواصل معنا عبر القنوات الرسمية:",corp_response_time:"وقت الاستجابة المتوقع: خلال 24 ساعة عمل.",general_muscle:"عام",max_weight_label:"أعلى وزن",continuous_streak:"الالتزام المستمر:",current_rank:"الرتبة الحالية:",city_monster_crown:" وحش المدينة",silver_guard_crown:" حارس فضي",bronze_guard_crown:" حارس برونزي",gym_label:"نادي:",challenge_sword:"تحدي ",monster_error:"حدث خطأ أثناء تحميل الحراس! (قد تحتاج لإنشاء Index في فايربيس)",champion_of:"بطل",got_it_btn:"فهمت، أنا جاهز! ⚔️",nav_home:"الرئيسية",nav_performance:"الأداء",nav_community:"مجتمع الأبطال",nav_profile:"بروفايل",edit_bio:"تعديل الوصف",save_bio:"حفظ الوصف",bio_placeholder:"اكتب شيئاً عن طموحك الرياضي...",my_badges:" أوسمتي المحققة",total_achievements:"إجمالي الإنجازات",stats_summary:" ملخص الأداء",undefined_country:"الدولة غير محددة",undefined_city:"المدينة غير محددة",no_gym:"غير منتمي لنادي",gym_placeholder:"اسم النادي (اختياري)",profile_save_success:"✅ تم حفظ البروفايل بنجاح!",daily_tasks:"مهام اليوم",log_workout:"سجل تمرينك",log_meal:"وجبة صحية",workout_title:"تسجيل التمرين",select_split:"اختر نظام تمرينك اليوم:",split_bro:"عضلة مفردة (Bro Split)",split_ppl:"دفع / سحب / أرجل (PPL)",split_full:"شامل (Full Body)",select_muscle:"حدد العضلة المستهدفة:",add_exercise:"إضافة تمرين آخر",

ft_privacy:"سياسة الخصوصية",ft_terms:"شروط الخدمة",ft_community:"سياسات مجتمع الأبطال",legal_privacy_title:"سياسة الخصوصية وحماية البيانات",legal_privacy_body:`
            <p>تاريخ آخر تحديث: 19 مارس 2026</p>
        <p>في <b>Royal Gravitas Arena</b>، نأخذ خصوصيتك على محمل الجد. توضح هذه السياسة كيف نقوم بجمع، استخدام، وحماية بياناتك الشخصية.</p>
            <h3>1. بوابات الدفع والمعاملات المالية</h3>
            <p>نحن <b>لا نقوم</b> بتخزين أو معالجة أي بيانات خاصة بالبطاقات الائتمانية على خوادمنا. جميع المدفوعات تتم معالجتها بشكل آمن وحصري عبر <b>Lemon Squeezy</b> باعتبارها "تاجر السجل" (Merchant of Record) الرسمي الخاص بمنصتنا.</p>
            <h3>2. استخدام فيديوهات الإثبات</h3>
            <p>الفيديوهات تُستخدم حصرياً للتحقق من صحة الإنجاز. لا يتم مشاركة هذه الفيديوهات مع أطراف خارجية، ويتم الاحتفاظ بها في خوادم مشفرة مؤقتاً.</p>
            <h3>3. أمان البيانات</h3>
            <p>نستخدم أحدث تقنيات التشفير لضمان عدم وصول أي طرف غير مصرح له إلى بياناتك.</p>
        `, // <-- The content for "أمان البيانات" was merged here.

legal_terms_title: "شروط الخدمة والاستخدام",
        legal_terms_body: `
            <p>مرحباً بك في عالم الوحوش. باستخدامك لتطبيق RGA Fitness، فإنك توافق التزاماً كاملاً بالشروط التالية:</p>
            <h3>1. المشتريات الرقمية (Lemon Squeezy)</h3>
            <p>تتم جميع عمليات الشراء للسلع الرقمية (العملات، الاشتراكات، الأغلفة) من خلال بوابة <b>Lemon Squeezy</b>. بموجب هذا، يُعد Lemon Squeezy هو البائع الرسمي للسلع، وتخضع عمليات الدفع لشروطهم وأحكامهم.</p>
            <h3>2. الروح الرياضية والنزاهة</h3>
            <p>أي محاولة لادخال أوزان وهمية، أو التلاعب بالأنظمة ستؤدي إلى الحظر النهائي.</p>
            <h3>3. العملات الافتراضية</h3>
            <p>العملات داخل التطبيق (XP والعملات الحديدية) هي عملات افتراضية لا تحمل أي قيمة مالية حقيقية خارج التطبيق ولا يمكن استبدالها بأموال نقدية.</p>
        `, // <-- The content for "المشتريات الرقمية" and "الروح الرياضية" was merged here.
legal_community_title:"سياسات مجتمع الأبطال",legal_community_body:`
            <p>مجتمعنا بُني لدعم وتحفيز الرياضيين. للحفاظ على بيئة احترافية، نطبق القواعد التالية بصرامة:</p>
            <ul>
                <li><b>الاحترام المتبادل:</b> يُمنع منعاً باتاً استخدام لغة مسيئة، تنمر، أو تقليل من إنجازات اللاعبين الآخرين في الرسائل الخاصة.</li>
                <li><b>التحديات النظيفة:</b> عند إرسال تنبيه "سقوط العرش"، اجعل المنافسة رياضية بحتة.</li>
                <li><b>الخصوصية:</b> الدردشات محمية وتختفي بعد 24 ساعة، ولكن يُمنع استغلال هذه الميزة لإرسال محتوى غير لائق أو إعلانات (Spam).</li>
                <li><b>التبليغ:</b> يحق لأي لاعب الإبلاغ عن حساب آخر في حال انتهاك هذه السياسات، وستقوم الإدارة بمراجعة السجل واتخاذ الإجراءات الصارمة.</li>
            </ul>
            <p>نحن هنا لنرفع الأوزان، ونرفع بعضنا البعض نحو القمة!</p>
        `,


save_workout:"حفظ وإنهاء (+50 XP)",ex_name:"التمرين",ex_reps:"العدات",ex_weight:"الوزن (kg)",ex_error:"يرجى إضافة تمرين واحد على الأقل للحفظ.",workout_success:"أداء ممتاز! تم تسجيل التمرين",meal_success:"بالصحة والعافية!",sidebar_competitions:"منافسات وتحديات",sidebar_settings:"الإعدادات والمساعدة",live_ex_name_ph:"اسم التمرين",live_ex_weight_ph:"الوزن (kg)",live_ex_reps_ph:"العدات",live_summary_title:"تمرين أسطوري! ",live_summary_subtitle:"عاش يا وحش، النتيجة بتحكي عنك",live_duration:"المدة",live_volume:"الحجم (kg)",live_sets:"الجولات",live_continue:"استمرار ❯",muscle_chest:"صدر",muscle_back:"ظهر",muscle_shoulders:"أكتاف",muscle_biceps:"بايسبس",muscle_triceps:"ترايسبس",muscle_legs:"أرجل",muscle_core:"بطن",sys_push:"دفع (Push)",sys_pull:"سحب (Pull)",sys_legs:"أرجل (Legs)",sys_full:"شامل (Full Body)",deadlift_btn:" تحدي الديدليفت",squat_btn:" تحدي السكوات",choose_challenge:"اختر التحدي 🏆",challenge_subtitle:"ارتقِ بأدائك وحطم أرقامك القياسية!",deadlift_title:"ديدليفت",deadlift_desc:"ارفع بسرعة واجمع النقاط",squat_title:"سكوات",squat_desc:"توازن بدقة بالمنطقة الخضراء",cancel_return:"إلغاء والعودة",time:"الوقت",earned_xp:"النقاط",best_combo:"أعلى كومبو",mistakes:"الأخطاء",exit_session:"إنهاء الجولة",exit_challenge:"إنهاء التحدي",exit_confirm:"هل أنت متأكد من الخروج وإلغاء الجولة؟",grave_time_death:"وقت الوفاة:",grave_old_record:"الرقم القديم:",grave_assassin:"القاتل:",grave_condition:"حالة القبر",grave_condition_label:"الحالة:",grave_respected:"مُحترم",grave_defaced:"مُدنس",grave_leave_comment:"سجل زوار المقبرة",grave_place_flowers:"إلقاء التحية",grave_deface:"إهانة الملك",grave_btn_comment:"إرسال التعليق",grave_comments_title:"التعليقات",grave_here_lies:"هنا يرقد الملك الحاكم",grave_fell_on:"تاريخ السقوط:",grave_crushed_by:"سُحق على يد:",grave_admin_name:"الإدارة ",grave_admin_msg:"ارقد بسلام، كنت بطلاً حقيقياً.",grave_time_yesterday:"البارحة",grave_time_now:"الآن",great_job:"عاش يا بطل!",game_over:"الجولة انتهت!",good_luck:"حظ أوفر!",search_id:"🔍 البحث بالـ ID",my_friends:" أصدقائي",search_placeholder:"أدخل الـ ID (مثال: A1B2C)",search_btn:"بحث",searching:"جاري البحث...",player_not_found:"لم يتم العثور على أي بطل بهذا الـ ID!",own_id_msg:"هذا المعرف الخاص بك يا بطل!",send_request:"إرسال طلب صداقة",hero_profile:" بروفايل البطل",earned_badges_title:"الأوسمة المحققة 🏅",no_badges_yet:"لم يحقق أوسمة بعد.",no_friends_yet:"لا يوجد أصدقاء بعد",chat_btn:"دردشة",type_message:"اكتب رسالة...",loading_messages:"جاري تحميل الرسائل المشفرة... ⏳",messages_disappear:"تبدأ الرسائل بالاختفاء بعد 24 ساعة ⏳<br>ابدأ التحدي الآن!",notifications:"الإشعارات ",no_notifications:"لا توجد إشعارات جديدة",friend_request_from:"أرسل لك طلب صداقة!",accept:"قبول",reject:"رفض",message_from:"رسالة من",challenges_title:"التحديات",challenges_desc:"العب، اجمع نقاط، ونافس الوحوش",valhalla_title:"مقبرة الأساطير 🪦",valhalla_subtitle:"ملوك سقطت عروشهم، لكن أسماءهم خُلدت في التاريخ...",dethroned_by:"سقط على يد:",old_record:"الرقم السابق:",new_record:"الرقم القاتل:",empty_graveyard:"لم يسقط أي ملك في هذه المدينة بعد! الدماء لم تُسفك.",valhalla_btn:"زيارة المقبرة",click_to_reply:"انقر للرد"},en:{dashboard:"Dashboard",welcome:"Great to see you, Captain",valhalla_title:"Valhalla 🪦",valhalla_subtitle:"Kings who lost their thrones, but not their legacy...",dethroned_by:"Dethroned by:",old_record:"Old Record:",new_record:"Killer Record:",empty_graveyard:"No kings have fallen in this city yet! No blood spilled.",valhalla_btn:"Visit Valhalla",processing_wait:"Processing... ⏳",approve_success:"✅ Approved successfully!",approve_fail:"❌ Approval failed!",deleting_wait:"Deleting... ⏳",challenges_title:"Challenges",challenges_desc:"Play, earn XP, and compete",reject_success:"🗑️ Rejected.",reject_fail:"❌ Rejection failed!",error_loading:"Error loading data.",cancel_upload:" Logging cancelled.. try again when you are ready to prove your strength!",video_size_error:" Video size is too large! Please trim or compress it under 30MB.",upload_fail_storage:" Upload failed! Please check your internet connection.",upload_success_wait:" Video uploaded successfully! Admin is reviewing your proof.",save_db_error:" Video uploaded but failed to save! Please try again.",admin_name:"Admin 👑",leaderboard:" Leaderboard",logout:" Logout",level:"Level",xp:"Experience Points",streak:"Current Streak",days:"Days",id_text:"Player ID:",back:"Back",lang_en:"English",lang_ar:"العربية",home_btn:"Home",language_btn:" Language",profile_btn:" Profile",performance_center:"Performance Center",analytics:"Analytics",workout_history:"Workout Log",games_btn:" Games & Challenges",superset_btn:"Superset",live_select_muscle:"Select Muscle",muscle_arms:"Arms",corp_about_title:"About Royal Gravitas Arena",corp_about_desc:"We are more than just a fitness app; we are a leading institution in sports performance technology. Our mission is to merge science with gamification to create a unique training experience that pushes humans to their physical and mental limits.",comparison_title:"Stop Training, Start Dominating",comparison_desc:"There are two ways to train. The conventional way, and the hero's way.",old_way_title:"The Old Way",old_way_1_title:"Random Training",old_way_1_desc:"Workouts with no clear plan, forgotten weights, and slow progress.",
ft_refund: "Refund Policy",
        legal_refund_title: "Refund & Return Policy",
        legal_refund_body: `
            <p>Because RGA Fitness offers consumable digital goods (such as XP points and Profile Covers), the following refund policy applies in compliance with <b>Lemon Squeezy</b>, our official Merchant of Record (MoR):</p>
            <h3>1. Consumed Digital Goods</h3>
            <p>Once a digital purchase is completed and the items (XP/Themes) are delivered to your account and <b>used/equipped</b>, the purchase becomes strictly <b>Non-Refundable</b>.</p>
            <h3>2. Technical Errors & Accidental Purchases</h3>
            <p>If a technical error occurs (e.g., you were charged but didn't receive the items), or if you made an accidental purchase and <b>have not consumed/used</b> the digital goods, you are entitled to request a full refund within <b>14 days</b> of the transaction date.</p>
            <h3>3. How to Request a Refund</h3>
            <p>Contact our support team via the 'Help Center' or email us directly with your Lemon Squeezy Order ID to process the refund.</p>
        `,

old_way_2_title:"Boredom & Burnout",old_way_2_desc:"Repeating the same routine inevitably leads to loss of motivation.",old_way_3_title:"A Solitary Journey",old_way_3_desc:"No community, no competition, and no recognition.",rga_way_title:"The RGA Way",rga_way_1_title:"AI-Calculated Performance",rga_way_1_desc:"Muscle radar prevents injuries, and the system tells you when to break PRs.",rga_way_2_title:"Endless Fun",rga_way_2_desc:"Turn your workout into a game and collect XP to top the charts.",

combo_record_toast: "🔥 New Combo Record: {combo}!",

rga_way_3_title:"A Community of Beasts",rga_way_3_desc:"Dominate your city, join Guilds, and establish your name globally.",corp_values_title:"Our Core Values",auth_login_tab:"Login",auth_signup_tab:"Sign Up",auth_email_ph:"Email Address",auth_pass_ph:"Password",auth_login_btn:"Log In",auth_forgot_pass:"Forgot Password?",soon_btn:"We’ll be right back",maintenance_title:"Under Maintenance ",maintenance_desc:"We are upgrading our systems to provide a better experience. We apologize for the inconvenience, please try again later.",login_success:" Login successful! Redirecting...",auth_fname_ph:"First Name",auth_lname_ph:"Last Name",auth_signup_btn:"Create Account",prompt_email:"Please enter your registered email address:",reset_sent:" Password reset link sent to your email.",game_cooldown:"Game is resting! Available in",wait_setup:"Wait a moment, setting things up Champ ",val1_t:"Integrity",val1_d:"Our video verification system ensures fair competition for everyone.",val2_t:"Innovation",val2_d:"Utilizing advanced TSB algorithms and muscle radar technology.",val3_t:"Global Community",val3_d:"A worldwide ecosystem connecting heroes from all walks of life.",

btn_join_empire: "Join Us ",
job_modal_title: "Join Royal Gravitas Arena Team",
job_modal_subtitle: "We aren't looking for employees, we are looking for partners to build a global fitness empire.",
job_name: "Full Name",
job_email: "Email Address",
job_phone: "WhatsApp Number",
job_role_select: "-- Select your expertise --",
role_support: " Tech Support & Customer Service",
role_referee: " Lift Referee (Video Verification)",
role_creator: " Content Creator (Design/Video)",
role_coordinator: " Gym Coordinator (PR & Marketing)",
job_salary_select: "-- What are your financial expectations? --",
salary_fixed: " Fixed Monthly Salary",
salary_commission: " Commission & Revenue Share",
salary_prove: " Prove myself first (Trial period)",
salary_amount: "Expected Salary (in USD $)",
viral_box_title: "Founders Vanguard Initiative",
viral_box_desc: "We monitor influential leaders. Timestamp your seniority by screenshotting this application and sharing it on your story tagging @RGA.BEST. The first 500 partners will secure Launch Privileges: 'Founding Member' title, 1000 XP, and the Steel Crate.",

job_submit_btn: "Submit Application ",

gender_select_ph: "-- Select Gender --",
gender_male: " Male",
gender_female: " Female",

corp_contact_title:"Official Correspondence",corp_contact_desc:"For business inquiries, partnerships, or advanced technical support, please contact us via our official channels:",corp_response_time:"Expected response time: Within 24 business hours.",achievements:" Trophy Room",friends_center:" Heroes Community",city_monster:"City Monster",loading:"Loading...",tour_5_title:"Performance Center ",tour_5_text:"Track your progress, view stats, and compare your previous levels to stay on track.",tour_6_title:"Champions Community ",tour_6_text:"Check your rank among the beasts. Prove yourself and reach the top of the leaderboard!",tour_7_title:"Profile & Settings ",tour_7_text:"Manage your account, edit your details, and track your overall progress here.",badge_completed:"Completed ",meal_cooldown:"Still digesting! Wait",play_now:"PLAY NOW",sidebar_competitions:"Competitions & Challenges",sidebar_settings:"Settings & Help",live_ex_name_ph:"Exercise Name",live_ex_weight_ph:"Weight (kg)",live_ex_reps_ph:"Reps",live_summary_title:"Legendary Workout! ",live_summary_subtitle:"Great job beast, the results speak for themselves",live_duration:"Duration",live_volume:"Volume (kg)",live_sets:"Sets",live_continue:"Continue ❯",reward_text:"Reward: ",level_up:" Congrats! You reached Level",streak_fire:"🔥 Beast! Your streak is now",transfer_leader:"Make Leader 👑",state_ready:" WAR READY",state_standby:" STANDBY",privacy_title:"Privacy Policy",privacy_desc:"We take your privacy seriously. All your data is stored securely and is not shared with any third party.",play_now:"PLAY NOW",help_deadlift_title:"Deadlift Challenge",help_deadlift_text:"The goal is to score as many points as possible within 60 seconds. Every tap is a rep. Tap continuously and rapidly to build your 'combo'. Pro tip: Use two fingers alternately for maximum speed!",help_squat_title:"Squat Challenge",help_squat_text:"This challenge is about precision and focus. Your goal is to stop the moving line exactly inside the 'Green Zone'. Every correct tap is a perfect rep. Be careful, you only have 5 mistakes before the challenge ends. Focus on the rhythm of the bar's movement to master it.",help_reflex_title:"Iron Reflex Challenge",help_reflex_text:"Your survival depends on your reflexes! Tap the falling 'weight plates' before they reach the bottom. Tapping an empty lane or missing a plate will cost you a life. Watch out for the rare 'Golden Heart' plate; it grants you an extra life (max 3). Tip: Keep your eyes on the top of the screen to anticipate the next plate.",terms_title:"Terms of Service",terms_desc:"By using the app, you agree not to use any cheats. Any account caught cheating will be banned permanently.",rga_way_1_title:"Smart AI Coach",rga_way_1_desc:"AI analyzes your performance, predicts your 1RM, and prevents CNS fatigue.",rga_way_2_title:"Guilds, Wars & Rewards",rga_way_2_desc:"Forge a guild, declare war on rival gyms, and loot massive XP and epic rewards.",rga_way_3_title:"Play & Rule Your City",rga_way_3_desc:"Play musical minigames, smash city records to become 'Most Wanted', and collect rare badges.",feat1_title:"Smart AI Coach",feat1_desc:"Advanced AI algorithms analyze every set, read your CNS fatigue (TSB), and tell you the perfect moment to hit a PR, with a radar tracking muscle balance.",feat2_title:"Iron Guild Wars",feat2_desc:"Lone wolves don't survive here. Forge or join an Iron Guild, rally your warriors, and declare all-out war against rival clans to lift heavier, crush enemies, and claim epic loot.",


feat3_title:"City Monster & Rewards",
        feat3_desc:"Log the heaviest weight, upload video proof, and claim your city's throne. Collect the daily 'King's Tribute', and unlock rare badges and borders to flex your status.",

        // --- Legal Texts (Lemon Squeezy) ---
        ft_refund: "Refund Policy",
        legal_refund_title: "Refund & Return Policy",
        legal_refund_body: `
            <p>Because RGA Fitness offers consumable digital goods (such as XP points and Profile Covers), the following refund policy applies in compliance with <b>Lemon Squeezy</b>, our official Merchant of Record (MoR):</p>
            <h3>1. Consumed Digital Goods</h3>
            <p>Once a digital purchase is completed and the items (XP/Themes) are delivered to your account and <b>used/equipped</b>, the purchase becomes strictly <b>Non-Refundable</b>.</p>
            <h3>2. Technical Errors & Accidental Purchases</h3>
            <p>If a technical error occurs (e.g., you were charged but didn't receive the items), or if you made an accidental purchase and <b>have not consumed/used</b> the digital goods, you are entitled to request a full refund within <b>14 days</b> of the transaction date.</p>
            <h3>3. How to Request a Refund</h3>
            <p>Contact our support team via the 'Help Center' or email us directly with your Lemon Squeezy Order ID to process the refund.</p>
        `,

        feat4_title:"Live Sets & Power Games",
        feat4_desc:"Log your workout in real-time with a smart rest timer. During rest? Play Deadlift, Squat, and Iron Reflex musical mini-games to multiply your XP.",


days_streak:"days!",empty_log:"No workouts logged yet. Start now! ",add_weights_msg:"Log your weights to see progress 📈",empty_chart:"Not enough data for the chart",level_promo:"Keep training to level up!",streak_promo:"Login daily to multiply XP",

gym_placeholder:"Gym name (optional)",



enter_id_msg:"Enter Player ID to search",search_heroes_msg:"Search for friends and start the challenge!",tour_1_title:"Welcome to RGA Pro! ",calc_title:"1RM Calculator ",calc_desc:"Calculate your theoretical 1 Rep Max",calc_weight_ph:"Weight (kg)",reflex_title:"Iron Reflex",reflex_desc:"Test your speed and focus",reflex_multiplier:"SPEED: ",reflex_start:"TAP TO START",calc_reps_ph:"Reps",calc_btn:"Calculate Power ",calc_result_label:"Your 1 Rep Max:",template_btn:" Load Template",template_loaded:"Template loaded! Add your weights ",save_name:"Save New Name",name_cooldown:"Name change available every 30 days!",location_cooldown:"Location change available every 24 hours!",edit_name:"Edit Name",tour_1_text:"Your new home to build muscle and break records. Let's take a quick tour.",
delete_confirm_single: "Are you sure you want to delete this workout? It cannot be recovered.",
delete_confirm_all: "Are you sure you want to delete all your workout logs? This will reset your stats!",
delete_success_single: "Workout deleted successfully!",
delete_success_all: "Workout history cleared completely.",
reset_log_btn: "Reset Log",
log_delete_btn: "Delete",
tour_2_title:"Log Your Workouts ",tour_2_text:"Click (New Workout) to log your weights. Every workout gives you 50 XP to level up.",tour_3_title:"City Monster ",tour_3_text:"Explore the map! Break a record, upload video proof, and become the targeted King of your city.",tour_4_title:"Trophy Room ",nav_home:"Home",nav_performance:"Stats",nav_community:"Community",nav_profile:"Profile",tour_4_text:"The harder you work, the more rare badges you unlock. Ready for the challenge?",btn_next:"Next ❯",btn_start:"Start ",btn_skip:"Skip",admin_panel:"👑 Admin Panel",calc_error:"Please enter valid weight and reps! ",admin_requests:"👑 Beast Requests",admin_loading:"Fetching videos from server...",admin_empty:"No pending requests!",approve_btn:"✅ Approve Beast",reject_btn:"❌ Reject & Cheat",help_btn:"App Tour",captain:"Captain",workout_date:"Date",muscle_label:"Muscle",confirm_approve:"Are you sure you want to approve this legendary weight?",confirm_reject:"Are you sure you want to reject? Video will be deleted.",admin_notif_approve:"Video reviewed and beast status approved! Well done, Champ! 🔥",admin_notif_reject:"Unfortunately, your proof was rejected! Weight incorrect or video unclear.",pending_review_msg:"⏳ Champ! You have a legendary workout under review.. relax while we verify it!",heavy_lift_alert:" You're a Beast!!\nYou broke the record! You must upload a video to prove your strength and claim the throne.\nReady to upload?",uploading_proof:"Uploading proof of strength... don't close the app! 🚀",upload_success:"✅ Video uploaded successfully! Admin is reviewing your lift, hold on Champ.",upload_fail:"❌ Upload failed.. check your connection and try again.",country_select:"Select Country...",city_select:"Select City...",save_location:"Save Location",no_monster_yet:"No monster in this city yet! Be the first.",challenge_him:"Challenge ⚔️",max_weight_record:"Max Weight: ",battleground:"Battleground ⚔️",err_invalid_cred:" Invalid email or password!",err_email_in_use:" This email is already registered!",err_user_not_found:" This email is not registered with us!",err_weak_pass:" Password is too weak (min 6 characters).",err_invalid_email:" Invalid email format!",err_default:" An error occurred, please try again.",weights_filter:"Weights",commitment_filter:"Commitment",map_level_filter:"Level",wanted_dead:"Wanted Dead or Alive ☠️",silver_guard:" Silver Guard",bronze_guard:" Bronze Guard",tribute_btn:" Claim King's Tribute",tribute_success:"💰 +50 XP King's tribute claimed!",tribute_claimed:"Tribute already claimed today ",mark_read:"Mark as read & clear",map_weights:" Weights",map_streak:" Commitment",map_level:" Level",my_city:" (My City)",locating_city:"Locating city...",moving_to:"Moving to",general_muscle:"General",max_weight_label:"Max Weight",continuous_streak:"Continuous Streak:",current_rank:"Current Rank:",city_monster_crown:" City Monster",silver_guard_crown:" Silver Guard",bronze_guard_crown:" Bronze Guard",grave_desc_1:"The city works with other states to provide those suffering from a loss with a place to grieve. Here at the graveyard you will find a place to pay your respects to anyone who has died across the country. Below you will find those who died in the last seven days, though you can use the search feature to look for anyone who has ever died.",

legal_privacy_title:"Privacy & Data Protection Policy",

legal_privacy_body:`
           <p>Last Updated: March 19, 2026</p>
            <p>At <b>Royal Gravitas Arena</b>, we take your privacy seriously. This policy explains our data practices.</p>
            <h3>1. Payment Processing (Merchant of Record)</h3>
            <p>We <b>do not</b> store or process credit card details on our servers. All financial transactions are securely handled by <b>Lemon Squeezy</b>, which acts as the official Merchant of Record (MoR) for our platform.</p>
            <h3>2. Video Proofs Usage</h3>
            <p>Videos uploaded to prove a "Max Weight" are used exclusively for verification and are stored securely.</p>
            <h3>3. Data Security</h3>
            <p>We use military-grade encryption to ensure no unauthorized party can access your data.</p>
        `,

legal_terms_title: "Terms of Service",
        legal_terms_body: `
            <p>Welcome to the beast realm. By using RGA Fitness, you agree to the following terms:</p>
            <h3>1. Digital Purchases & Payments</h3>
            <p>All purchases for digital goods are processed via <b>Lemon Squeezy</b>. Lemon Squeezy acts as the Merchant of Record, meaning your transaction is bound by their secure processing terms and conditions.</p>
            <h3>2. Sportsmanship & Integrity</h3>
            <p>Logging fake weights or exploiting systems results in a permanent ban.</p>
            <h3>3. Virtual Currency</h3>
            <p>In-app currencies (XP, Iron Coins) are virtual, hold no real-world monetary value, and cannot be cashed out.</p>
        `,
legal_community_title:"Heroes Community Guidelines",legal_community_body:`
            <p>Our community is built to support and motivate athletes. To maintain a professional environment, we strictly enforce these rules:</p>
            <ul>
                <li><b>Mutual Respect:</b> Abusive language, bullying, or belittling other players' achievements in private messages is strictly prohibited.</li>
                <li><b>Clean Challenges:</b> When a "Throne Fall" alert occurs, keep the rivalry purely athletic.</li>
                <li><b>Privacy:</b> Chats are secure and disappear after 24 hours, but using this feature to send inappropriate content or spam is forbidden.</li>
                <li><b>Reporting:</b> Any player can report an account for violating these policies. The admin will review and take strict action.</li>
            </ul>
            <p>We are here to lift weights, and lift each other up to the top!</p>
        `,

grave_desc_2:"There is a guestbook for each grave so that you may leave behind a memory or thought about the deceased. Those feeling generous can also leave a verified witness statement behind so that everyone can see who was responsible.",recent_deaths:"Recent deaths",all_time:"All",gym_label:"Gym:",challenge_sword:"Challenge ⚔️",monster_error:"Error loading guards! (You may need a Firebase Index)",champion_of:"Champion of",got_it_btn:"Got it, I'm ready! ⚔️",edit_bio:"Edit Bio",save_bio:"Save Bio",bio_placeholder:"Write something about your fitness goals...",my_badges:" Earned Badges",total_achievements:"Total Achievements",stats_summary:" Stats Summary",undefined_country:"Country undefined",undefined_city:"City undefined",no_gym:"No gym membership",gym_placeholder:"Gym name (Optional)",profile_save_success:"✅ Profile saved successfully!",daily_tasks:"Daily Tasks",log_workout:"Log Workout",log_meal:"Healthy Meal",workout_title:"Log Workout",select_split:"Select your workout split:",split_bro:"Muscle Group (Bro Split)",split_ppl:"Push / Pull / Legs (PPL)",split_full:"Full Body",select_muscle:"Select target muscle:",add_exercise:"Add another exercise",save_workout:"Save & Finish (+50 XP)",ex_name:"Exercise",ex_reps:"Reps/Sets",ex_weight:"Weight (kg)",ex_error:"Please add at least one exercise to save.",workout_success:"Great job! Workout logged",meal_success:"Bon appétit!",muscle_chest:"Chest",muscle_back:"Back",muscle_shoulders:"Shoulders",muscle_biceps:"Biceps",muscle_triceps:"Triceps",muscle_legs:"Legs",muscle_core:"Core",sys_push:"Push",sys_pull:"Pull",sys_legs:"Legs",sys_full:"Full Body",deadlift_btn:" Deadlift Challenge",squat_btn:" Squat Challenge",choose_challenge:"Choose Challenge 🏆",nav_features:"Features",nav_stats:"Stats",nav_help:"Help",hero_subtitle:"Gamify Your Fitness",hero_title:"Level Up Your Power",hero_desc:"Join the fitness revolution. Earn XP, compete with friends, and achieve your goals like never before.",btn_start:"Start Challenge Now",guilds_btn:"Iron Guilds",guild_hub:"Guild Hub 🛡️",create_guild:"Forge Guild (1000 XP)",guild_name:"Guild Name",guild_tag:"Tag (Max 4 chars)",no_guild:"You are a lone wolf! Forge or join a guild.",join_guild:"Find a Guild",guild_members:"Roster",war_room:"War Room ⚔️",war_ready:"War Ready",search_war:"Hunt for Prey (Search Match)",war_active:"Bloodbath in Progress!",kick_member:"Kick",promote_member:"Promote",leave_guild:"Leave Guild",not_enough_xp_guild:"You need 1000 XP to forge a guild!",guild_created:"Guild forged successfully! You are the Leader.",war_win_prize:"Victory Spoils: +500 XP per member",vs_text:"VS",stat_active:"Active Members",stat_weight:"Kg Lifted",stat_challenges:"Challenges Done",feat_main_1:"Unleash",feat_main_2:"Your Potential",feat_subtitle:"Everything you need to reach the top in one integrated platform.",grave_time_death:"Time of Death:",grave_old_record:"Old Record:",grave_assassin:"Assassinated By:",grave_condition:"Grave Condition",grave_respected:"Respected",grave_defaced:"Defaced",grave_leave_comment:"Comment in the guestbook",grave_place_flowers:"Place flowers",grave_deface:"Deface",grave_btn_comment:"Leave comment!",grave_comments_title:"Comments",grave_here_lies:"Here lies",help_title:"Help Center ",faq_tab:"FAQs",contact_tab:"Contact Us",contact_desc:"Have an issue or suggestion? Message the admin directly!",send_msg:"Send Message",email_ph:"Your Email",msg_ph:"Type your message here...",challenge_subtitle:"Elevate your performance and break records!",deadlift_title:"Deadlift",deadlift_desc:"Lift fast and collect points",squat_title:"Squat",squat_desc:"Balance precisely in the green zone",cancel_return:"Cancel & Return",time:"TIME",earned_xp:"EARNED XP",best_combo:"BEST COMBO",mistakes:"MISTAKES",exit_session:"EXIT SESSION",exit_challenge:"EXIT CHALLENGE",exit_confirm:"Are you sure you want to exit and cancel the session?",great_job:"Great job, Champ!",

ft_privacy:"Privacy Policy",ft_terms:"Terms of Service",ft_community:"Community Guidelines",






game_over:"Session Over!",good_luck:"Better luck next time!",search_id:"🔍 Search by ID",my_friends:" My Friends",search_placeholder:"Enter ID (e.g., A1B2C)",search_btn:"Search",searching:"Searching...",player_not_found:"No hero found with this ID!",own_id_msg:"This is your own ID, Champ!",send_request:"Send Friend Request",hero_profile:" Hero Profile",earned_badges_title:"Earned Badges 🏅",no_badges_yet:"No badges earned yet.",no_friends_yet:"No friends yet",chat_btn:"Chat",type_message:"Type a message...",grave_time_death:"Time of Death:",grave_old_record:"Old Record:",new_max_alert:" INSANE! You broke your record again. Proof will be required for the absolute max ({weight}kg)!",grave_assassin:"Assassin:",grave_condition:"Grave Condition",grave_condition_label:"Status:",grave_respected:"Respected",grave_defaced:"Defaced",grave_leave_comment:"Graveyard Guestbook",grave_place_flowers:"Pay Respects",grave_deface:"Mock the King",grave_btn_comment:"Leave Comment",grave_comments_title:"Comments",grave_here_lies:"Here lies the fallen King",grave_fell_on:"Fell on:",grave_crushed_by:"Crushed by:",grave_admin_name:"Admin ",grave_admin_msg:"Rest in peace, you were a true champion.",grave_time_yesterday:"Yesterday",grave_time_now:"Just now",city_grave_title:"The Fallen Kings of {city} 🪦",loading_messages:"Loading encrypted messages... ⏳",messages_disappear:"Messages disappear after 24 hours ⏳<br>Start the challenge now!",notifications:"Notifications ",no_notifications:"No new notifications",friend_request_from:"sent you a friend request!",accept:"Accept",reject:"Reject",message_from:"Message from",click_to_reply:"Click to reply"}};let currentLang=localStorage.getItem('lang')||'ar';let cropper;function showToast(message){let container=document.getElementById('toast-container');if(!container){container=document.createElement('div');container.id='toast-container';document.body.appendChild(container)}
const toast=document.createElement('div');toast.className='toast-message';toast.innerText=message;container.appendChild(toast);setTimeout(()=>{toast.style.opacity='0';setTimeout(()=>toast.remove(),500)},4000)}
function applyLanguage(){const t=translations[currentLang];document.documentElement.dir=currentLang==='ar'?'rtl':'ltr';document.documentElement.lang=currentLang;document.querySelectorAll('[data-translate]').forEach(el=>{const key=el.dataset.translate;if(t[key]){el.innerText=t[key]}});const dashboardTitle=document.querySelector('.top-bar h1');if(dashboardTitle)dashboardTitle.innerText=t.dashboard;const loginEmail=document.getElementById('login-email');const loginPass=document.getElementById('login-password');const signupFname=document.getElementById('signup-firstname');const signupLname=document.getElementById('signup-lastname');const signupEmail=document.getElementById('signup-email');const signupPass=document.getElementById('signup-password');if(loginEmail)loginEmail.placeholder=t.auth_email_ph||"البريد الإلكتروني";

// ترجمة حقول نافذة التوظيف
const jobName = document.getElementById('job-name');
const jobEmail = document.getElementById('job-email');
const jobPhone = document.getElementById('job-phone');
const jobSalaryAmt = document.getElementById('job-salary-amount');

if(jobName) jobName.placeholder = t.job_name || "الاسم الكامل";
if(jobEmail) jobEmail.placeholder = t.job_email || "البريد الإلكتروني";
if(jobPhone) jobPhone.placeholder = t.job_phone || "رقم الواتساب";
if(jobSalaryAmt) jobSalaryAmt.placeholder = t.salary_amount || "كم تتوقع الراتب؟ (بالدولار $)";

// ترجمة حقل الجنس
const genderSelect = document.getElementById('gender_select_ph');
const genderMale = document.getElementById('gender_male');
const genderFemale = document.getElementById('gender_female');

if(genderSelect) genderSelect.innerText = t.gender_select_ph || "-- اختر الجنس --";
if(genderMale) genderMale.innerText = t.gender_male || " ذكر";
if(genderFemale) genderFemale.innerText = t.gender_female || " أنثى";

if(loginPass)loginPass.placeholder=t.auth_pass_ph||"كلمة المرور";if(signupFname)signupFname.placeholder=t.auth_fname_ph||"الاسم الأول";if(signupLname)signupLname.placeholder=t.auth_lname_ph||"الاسم الأخير";if(signupEmail)signupEmail.placeholder=t.auth_email_ph||"البريد الإلكتروني";if(signupPass)signupPass.placeholder=t.auth_pass_ph||"كلمة المرور";const leaderboardBtn=document.querySelector('button[onclick*="showLeaderboard"]');if(leaderboardBtn)leaderboardBtn.innerText=t.leaderboard;const logoutBtn=document.getElementById('logout-btn');if(logoutBtn)logoutBtn.innerText=t.logout;const statCardTitles=document.querySelectorAll('.stat-card h3');if(statCardTitles.length>=3){statCardTitles[0].innerText=t.level;statCardTitles[1].innerText=t.xp;statCardTitles[2].innerText=t.streak}
const exercises=currentLang==='ar'?["ديدليفت","سكوات","بنش برس","بايسبس بار"]:["Deadlift","Squat","Bench Press","Barbell Curl"];const dataList=document.getElementById('smart-exercises');if(dataList){dataList.innerHTML=exercises.map(ex=>`<option value="${ex}"></option>`).join('')}
const calcWeightInput=document.getElementById('calc-weight');const calcRepsInput=document.getElementById('calc-reps');if(calcWeightInput)calcWeightInput.placeholder=t.calc_weight_ph||"الوزن (kg)";if(calcRepsInput)calcRepsInput.placeholder=t.calc_reps_ph||"العدات";const liveExName=document.getElementById('live-ex-name');const liveExWeight=document.getElementById('live-ex-weight');const liveExReps=document.getElementById('live-ex-reps');const contactEmail=document.getElementById('contact-email');const contactMsg=document.getElementById('contact-message');if(contactEmail)contactEmail.placeholder=t.email_ph||"البريد الإلكتروني";if(contactMsg)contactMsg.placeholder=t.msg_ph||"رسالتك...";if(document.getElementById('faq-container'))renderFAQs();if(liveExName)liveExName.placeholder=t.live_ex_name_ph||"اسم التمرين";if(liveExWeight)liveExWeight.placeholder=t.live_ex_weight_ph||"الوزن (kg)";if(liveExReps)liveExReps.placeholder=t.live_ex_reps_ph||"العدات";const savedData=localStorage.getItem('currentUser');if(document.getElementById('main-content-area')&&savedData){renderUI(JSON.parse(savedData))}}
function selectLanguage(lang){currentLang=lang;localStorage.setItem('lang',lang);applyLanguage();if(auth.currentUser)listenForNotifications();const dropdown=document.getElementById('lang-dropdown-sidebar');if(dropdown)dropdown.style.display='none'}
function initStardustCanvas(){const canvas=document.getElementById('stardust-canvas');if(!canvas)return;const ctx=canvas.getContext('2d');let dots=[];const setup=()=>{canvas.width=window.innerWidth;canvas.height=window.innerHeight;dots=[];const dotCount=window.innerWidth<768?25:50;for(let i=0;i<dotCount;i++){dots.push({x:Math.random()*canvas.width,y:Math.random()*canvas.height,vx:(Math.random()-0.5)*0.4,vy:(Math.random()-0.5)*0.4,size:Math.random()*1.5+0.5})}};const animate=()=>{ctx.clearRect(0,0,canvas.width,canvas.height);ctx.fillStyle="rgba(0, 242, 167, 0.6)";dots.forEach(d=>{d.x+=d.vx;d.y+=d.vy;if(d.x<0||d.x>canvas.width)d.vx*=-1;if(d.y<0||d.y>canvas.height)d.vy*=-1;ctx.beginPath();ctx.arc(d.x,d.y,d.size,0,Math.PI*2);ctx.fill()});requestAnimationFrame(animate)};window.addEventListener('resize',setup);setup();animate()}
function initScrollAnimations(){const reveals=document.querySelectorAll('.reveal');if(reveals.length===0)return;const observer=new IntersectionObserver((entries)=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');entry.target.querySelectorAll('.stat-number[data-target]').forEach(num=>{if(!num.classList.contains('counted')){animateNumbers(num);num.classList.add('counted')}});observer.unobserve(entry.target)}})},{threshold:0.1});reveals.forEach(reveal=>observer.observe(reveal))}
function initInteractiveFeatures(){const featureItems=document.querySelectorAll('.feature-item');const featureImage=document.getElementById('feature-image');if(!featureItems.length||!featureImage)return;const observer=new IntersectionObserver((entries)=>{entries.forEach(entry=>{if(entry.isIntersecting){featureItems.forEach(item=>item.classList.remove('is-visible'));entry.target.classList.add('is-visible');const newImgSrc=entry.target.dataset.img;featureImage.style.opacity=0;setTimeout(()=>{featureImage.src=newImgSrc;featureImage.style.opacity=1},300)}})},{threshold:0.6});featureItems.forEach(item=>observer.observe(item))}



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
            const t = translations[currentLang || 'ar'] || translations['ar'];
            
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerText;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

            try {
                const userCredential = await auth.signInWithEmailAndPassword(email, password);
                if (!userCredential.user.emailVerified) {
                    await auth.signOut();
                    showToast(currentLang === 'en' ? " Please verify your email first!" : " الرجاء تفعيل بريدك الإلكتروني أولاً!");
                    submitBtn.disabled = false;
                    submitBtn.innerText = originalBtnText;
                    return;
                }
                showToast(t.login_success || " تم الدخول، جاري تحويلك...");
                setTimeout(() => window.location.href = 'dashboard.html', 1500);
            } catch (error) {
                console.error("Login Error: ", error);
                let message = t.err_default || "حدث خطأ";
                
                if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                    message = t.err_invalid_cred || "البريد الإلكتروني أو كلمة المرور غير صحيحة!";
                } else if (error.code === 'auth/invalid-email') {
                    message = t.err_invalid_email || "صيغة البريد الإلكتروني غير صحيحة!";
                } else if (error.code === 'auth/too-many-requests') {
                    message = currentLang === 'en' ? "Too many attempts. Try again later." : "محاولات كثيرة خاطئة، جرب بعد قليل.";
                } else {
                    message = error.message; 
                }
                
                showToast(message);
                submitBtn.disabled = false;
                submitBtn.innerText = originalBtnText;
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
            const defaultAvatar = "/Photos/adm.png";
            const t = translations[currentLang || 'ar'] || translations['ar'];

            const submitBtn = signupForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerText;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

            try {
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                await userCredential.user.sendEmailVerification();
                
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
                    myFriendsList:[],
                    lastLoginDate: new Date().toISOString().split('T')[0],
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });

                showToast(currentLang === 'en' ? " Account created! Check your email to verify." : "تم الإنشاء! تفقد بريدك لتفعيل الحساب.");
                await auth.signOut();
                signupForm.reset();
                document.querySelector('[data-form="login"]').click();
            } catch (error) {
                console.error("Signup Error: ", error);
                let message = t.err_default || "حدث خطأ";
                
                if (error.code === 'auth/email-already-in-use') {
                    message = t.err_email_in_use || "هذا البريد الإلكتروني مسجل مسبقاً!";
                } else if (error.code === 'auth/weak-password') {
                    message = t.err_weak_pass || "كلمة المرور ضعيفة (يجب أن تكون 6 أحرف على الأقل).";
                } else if (error.code === 'auth/invalid-email') {
                    message = t.err_invalid_email || "صيغة البريد الإلكتروني غير صحيحة!";
                } else {
                    message = error.message;
                }
                
                showToast(message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerText = originalBtnText;
            }
        };
    }

    const forgotPasswordLink = document.getElementById('forgot-password-link');
    if (forgotPasswordLink) {
        forgotPasswordLink.onclick = async (e) => {
            e.preventDefault();
            const t = translations[currentLang || 'ar'] || translations['ar'];
            const email = prompt(t.prompt_email || "الرجاء إدخال بريدك الإلكتروني المسجل لدينا:");
            if (!email || email.trim() === "") return;
            try {
                await auth.sendPasswordResetEmail(email.trim());
                showToast(currentLang === 'en' ? " If registered, a reset link has been sent." : " إذا كان البريد مسجلاً، سيصلك رابط الاستعادة.");
            } catch (error) {
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

    if (typeof initInteractiveFeatures === 'function') {
        initInteractiveFeatures();
    }
}


function animateNumbers(targetElement){const target=parseInt(targetElement.getAttribute('data-target'),10);const duration=2000;let current=0;const increment=target>1000?Math.ceil(target/100):1;const stepTime=Math.max(10,Math.abs(Math.floor(duration/(target/increment))));const timer=setInterval(()=>{current+=increment;if(current>=target){targetElement.innerText=target.toLocaleString();clearInterval(timer)}else{targetElement.innerText=current.toLocaleString()}},stepTime)}
let globalTiredMuscles={};function getTranslatedMuscle(arabicKey,lang){const muscleTranslations={'صدر':'Chest','ظهر':'Back','أرجل':'Legs','أكتاف':'Shoulders','أذرع':'Arms','بطن':'Core'};if(lang==='en'){return muscleTranslations[arabicKey]||arabicKey}else{return arabicKey}}
window.runAICoach=function(){const t=translations[currentLang||'ar'];let workouts=[];try{workouts=JSON.parse(localStorage.getItem('userWorkouts')||'[]')}catch(e){console.error("AI Coach Workouts Parse Error",e)}
const coachSection=document.getElementById('ai-coach-section');const coachText=document.getElementById('ai-coach-text');const coachAction=document.getElementById('ai-coach-action');const coachTitle=document.getElementById('ai-coach-title');const isEn=currentLang==='en';if(!coachSection)return;if(workouts.length===0){coachTitle.style.color="var(--slate)";coachText.innerText=isEn?"AI System Standby. Waiting for your first workout.":"نظام الذكاء الاصطناعي في وضع الاستعداد. بانتظار أول تمرين لك!";coachAction.innerHTML=`<i class="fa-solid fa-dumbbell" style="opacity:0.5; margin-right:5px;"></i> ${isEn ? "Log a workout to activate analytics." : "سجل تمرينك الأول لتفعيل التحليلات."}`;coachSection.style.display='block';return}
let ctl=0,atl=0;const ctlAlpha=2/(42+1);const atlAlpha=2/(7+1);const dailyLoads={};workouts.forEach(w=>{if(!w.date)return;let d=new Date(w.date);if(isNaN(d.getTime()))return;let key=`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;let load=w.details?w.details.reduce((sum,ex)=>sum+(parseFloat(ex.weight)||0),0):0;dailyLoads[key]=(dailyLoads[key]||0)+load});let today=new Date();today.setHours(0,0,0,0);for(let d=new Date(today.getTime()-60*86400000);d<=today;d.setDate(d.getDate()+1)){let key=`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;let load=dailyLoads[key]||0;ctl=(load*ctlAlpha)+(ctl*(1-ctlAlpha));atl=(load*atlAlpha)+(atl*(1-atlAlpha))}
const currentTSB=ctl-atl;globalTiredMuscles={};const muscleGroups={'صدر':'chest','ظهر':'back','أرجل':'legs','أكتاف':'shoulders','أذرع':'arms','بطن':'core'};workouts.forEach(w=>{if(!w.date)return;let wDate=new Date(w.date);wDate.setHours(0,0,0,0);const diffDays=Math.ceil(Math.abs(today-wDate)/86400000);if(diffDays<=2){const type=(getTranslatedType(w.type)||w.type||"").toLowerCase();if(type.includes("صدر")||type.includes("chest")||type.includes("دفع")||type.includes("push")||type.includes("شامل"))globalTiredMuscles.صدر=!0;if(type.includes("ظهر")||type.includes("back")||type.includes("سحب")||type.includes("pull")||type.includes("شامل"))globalTiredMuscles.ظهر=!0;if(type.includes("أكتاف")||type.includes("shoulders")||type.includes("دفع")||type.includes("push")||type.includes("شامل"))globalTiredMuscles.أكتاف=!0;if(type.includes("أذرع")||type.includes("arms")||type.includes("بايسبس")||type.includes("ترايسبس")||type.includes("دفع")||type.includes("سحب")||type.includes("شامل"))globalTiredMuscles.أذرع=!0;if(type.includes("أرجل")||type.includes("legs")||type.includes("شامل"))globalTiredMuscles.أرجل=!0}});let message="";let action="";let titleColor="#00f2a7";const freshMusclesNames=Object.keys(muscleGroups).filter(m=>!globalTiredMuscles[m]);const deadMusclesNames=Object.keys(globalTiredMuscles).filter(m=>globalTiredMuscles[m]);const freshMuscleDisplay=freshMusclesNames[0]?getTranslatedMuscle(freshMusclesNames[0],currentLang):null;const deadMusclesDisplay=deadMusclesNames.map(key=>getTranslatedMuscle(key,currentLang)).join(', ');if(currentTSB<-20){message=isEn?"Critical CNS Fatigue detected. Your nervous system is redlining.":"تحذير: إرهاق عصبي حاد. جهازك العصبي مستنزف بالكامل حالياً.";action=isEn?"Advice: Complete REST day or very light mobility only. No lifting.":"النصيحة: راحة تامة اليوم أو جلسة إطالة خفيفة جداً. ممنوع رفع الأثقال.";titleColor="#ff4d4d"}else if(currentTSB>10){message=isEn?"System Prime! Your CNS is fully recovered and ready for war.":"كابتن، طاقتك في الذروة! جهازك العصبي مستعد لتحطيم الأرقام.";action=isEn?`Target: High Intensity on ${freshMuscleDisplay || 'your favorite split'}. Go for a PR!`:`الهدف: تمرين عالي الشدة (يُفضل ${freshMuscleDisplay || 'عضلتك المفضلة'}). وقت كسر الـ PR!`;titleColor="#FFD700"}else{if(deadMusclesNames.length>0){message=isEn?`Muscles (${deadMusclesDisplay}) are still in repair mode.`:`عضلات (${deadMusclesDisplay}) لا تزال في مرحلة الاستشفاء.`;action=isEn?`Recommendation: Avoid them today. Focus on ${freshMuscleDisplay || 'Cardio'}.`:`التوصية: تجنب إرهاقها اليوم. ركز في تمرينك على (${freshMuscleDisplay || 'الكارديو'}).`}else{message=isEn?"Steady state. Body is balanced.":"حالة مستقرة. توازن مثالي بين الإرهاق والاستشفاء.";action=isEn?"Advice: Follow your planned routine with 100% focus.":"النصيحة: التزم بجدولك اليومي بتركيز 100%."}}
coachText.innerText=message;coachAction.innerHTML=`<i class="fa-solid fa-quote-left" style="opacity:0.5; margin-right:5px;"></i> ${action}`;coachSection.style.display='block';coachTitle.style.color=titleColor};function initDashboardPage(){auth.onAuthStateChanged(user=>{const savedData=JSON.parse(localStorage.getItem('currentUser')||'{}');if(savedData.currentTheme){document.body.setAttribute('data-theme',savedData.currentTheme)}
if(user){if(!user.emailVerified){auth.signOut();window.location.href='index.html';return}
if(typeof runAICoach==='function')runAICoach();const adminEmail="raedabdi9@gmail.com";const adminBtn=document.getElementById('admin-panel-btn');if(adminBtn&&user.email===adminEmail){adminBtn.style.display='block'}
checkAndShowOnboarding();const localData=localStorage.getItem('currentUser');if(localData)renderUI(JSON.parse(localData));syncUserData(user);try{if(typeof listenForNotifications==='function')listenForNotifications();}catch(e){}
try{if(typeof startBackgroundWarMonitor==='function')startBackgroundWarMonitor(user);}catch(e){}
try{if(typeof preloadHeavyCovers==='function')preloadHeavyCovers();}catch(e){}
if(Notification.permission==='granted'&&typeof requestNotificationPermission==='function'){requestNotificationPermission()}}else{window.location.href='index.html'}});const menuBtn=document.getElementById('menu-toggle');const sidebar=document.getElementById('sidebar');if(menuBtn&&sidebar){menuBtn.onclick=(e)=>{e.stopPropagation();sidebar.classList.toggle('collapsed')};document.addEventListener('click',(e)=>{if(window.innerWidth<768&&!sidebar.contains(e.target)&&!menuBtn.contains(e.target)){sidebar.classList.add('collapsed')}})}
const langMenuBtn=document.getElementById('lang-menu-btn-sidebar');const langDropdown=document.getElementById('lang-dropdown-sidebar');if(langMenuBtn&&langDropdown){langMenuBtn.onclick=(event)=>{event.stopPropagation();langDropdown.style.display=langDropdown.style.display==='block'?'none':'block'};document.addEventListener('click',()=>{if(langDropdown.style.display==='block'){langDropdown.style.display='none'}})}
const logoutBtn=document.getElementById('logout-btn');if(logoutBtn){logoutBtn.onclick=async()=>{await auth.signOut();localStorage.removeItem('currentUser');localStorage.removeItem('hasSeenTour');window.location.href='index.html'}}
const photoInput=document.getElementById('upload-photo');const cropperModal=document.getElementById('cropper-modal');const imageToCrop=document.getElementById('image-to-crop');if(photoInput){photoInput.addEventListener('change',(e)=>{const file=e.target.files[0];if(!file)return;const reader=new FileReader();reader.onload=(event)=>{imageToCrop.src=event.target.result;cropperModal.style.display='flex';if(cropper)cropper.destroy();cropper=new Cropper(imageToCrop,{aspectRatio:1,viewMode:1,dragMode:'move',autoCropArea:0.8,restore:!1,guides:!1,center:!1,highlight:!1,cropBoxMovable:!1,cropBoxResizable:!1,toggleDragModeOnDblclick:!1,background:!1})};reader.readAsDataURL(file)})}
const cropSaveBtn=document.getElementById('crop-save-btn');if(cropSaveBtn){cropSaveBtn.onclick=()=>{if(!cropper)return;const originalText=cropSaveBtn.innerText;cropSaveBtn.innerText=currentLang==='en'?'Saving...':'جاري الحفظ...';cropSaveBtn.disabled=!0;cropper.getCroppedCanvas({width:200,height:200}).toBlob(async(blob)=>{try{if(!blob)throw new Error("فشل قص الصورة");const user=auth.currentUser;const imageRef=storage.ref(`profile_images/${user.uid}_${Date.now()}.jpg`);await imageRef.put(blob);const downloadURL=await imageRef.getDownloadURL();await db.collection('users').doc(user.uid).update({photoURL:downloadURL});const saved=JSON.parse(localStorage.getItem('currentUser')||'{}');saved.photoURL=downloadURL;localStorage.setItem('currentUser',JSON.stringify(saved));if(typeof renderUI==='function')renderUI(saved);document.getElementById('cropper-modal').style.display='none';showToast(currentLang==='en'?" Photo updated!":" تم تحديث الصورة بنجاح")}catch(err){console.error("خطأ في حفظ الصورة:",err);showToast(currentLang==='en'?" Failed to save photo":" فشل حفظ الصورة")}finally{cropSaveBtn.innerText=originalText;cropSaveBtn.disabled=!1;if(cropper)cropper.destroy();}},'image/jpeg',0.6)}}}
function generateShortID(){const chars='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';let result='';for(let i=0;i<5;i++){result+=chars.charAt(Math.floor(Math.random()*chars.length))}
return result}
async function syncUserData(user){const userRef=db.collection('users').doc(user.uid);try{const doc=await userRef.get();if(!doc.exists){console.warn("بيانات المستخدم غير موجودة! جاري بنائها...");await userRef.set({firstName:"بطل",lastName:"جديد",email:user.email,xp:0,rank:1,streak:1,lastLoginDate:new Date().toISOString().split('T')[0]});window.location.reload();return}
let data=doc.data();let needsUpdate=!1;if(!data.shortID){data.shortID=generateShortID();needsUpdate=!0}
if(data.workouts){localStorage.setItem('userWorkouts',JSON.stringify(data.workouts))}else{const localWorkouts=JSON.parse(localStorage.getItem('userWorkouts'))||[];if(localWorkouts.length>0){data.workouts=localWorkouts;needsUpdate=!0}}
try{const syncStreakCall=firebase.functions().httpsCallable('secureSyncStreak');const streakResult=await syncStreakCall();if(streakResult.data&&streakResult.data.success){data.streak=streakResult.data.newStreak;if(streakResult.data.updated&&data.streak>1){const t=translations[currentLang||'ar'];showToast(`${t.streak_fire} ${data.streak} ${t.days_streak}`);setTimeout(()=>updateStat('streak',data.streak,!0),1000)}}}catch(e){console.error("خطأ في مزامنة الستريك مع السيرفر:",e)}
let calculatedLevel=Math.floor((data.xp||0)/500)+1;let calculatedMaxXp=calculatedLevel*500;if(data.rank!==calculatedLevel||data.maxXp!==calculatedMaxXp){data.rank=calculatedLevel;data.maxXp=calculatedMaxXp}
if(needsUpdate){let safeUpdates={};if(!doc.data().shortID)safeUpdates.shortID=data.shortID;if(data.workouts&&data.workouts.length>0)safeUpdates.workouts=data.workouts;if(Object.keys(safeUpdates).length>0){await userRef.update(safeUpdates)}}
localStorage.setItem('currentUser',JSON.stringify(data));renderUI(data)}catch(err){console.error("Sync Error:",err)}}
function renderUI(data){if(!data)return;const t=translations[currentLang||'ar'];const defaultAvatar="/Photos/adm.png";let dynamicWrapper=document.getElementById('dynamic-pro-avatar');let avatarImgDiv=document.getElementById('dynamic-pro-img');if(dynamicWrapper&&avatarImgDiv){const targetBorder=`avatar-pro-wrapper ${data.currentBorder || ''}`;if(dynamicWrapper.className!==targetBorder){dynamicWrapper.className=targetBorder}
const rawPhotoUrl=data.photoURL||defaultAvatar;if(avatarImgDiv.dataset.currentPhoto!==rawPhotoUrl){avatarImgDiv.style.backgroundImage=`url('${rawPhotoUrl}')`;avatarImgDiv.dataset.currentPhoto=rawPhotoUrl}}
const elements={id:document.getElementById('user-id-display'),welcome:document.getElementById('welcome-user'),rank:document.getElementById('user-rank'),xp:document.getElementById('user-xp'),maxXp:document.getElementById('max-xp'),streak:document.getElementById('user-streak'),xpFill:document.getElementById('xp-fill')};if(elements.id)elements.id.innerText=`${t.id_text} ${data.shortID || '...'}`;if(elements.welcome)elements.welcome.innerText=`${t.welcome} ${data.firstName || "بطل"}`;if(elements.rank)elements.rank.innerText=data.rank||1;if(elements.xp)elements.xp.innerText=data.xp||0;if(elements.maxXp)elements.maxXp.innerText=data.maxXp||1000;if(elements.streak)elements.streak.innerText=`🔥 ${data.streak || 1} ${t.days}`;if(elements.xpFill){const currentLevelXp=(data.xp||0)%500;const percent=(currentLevelXp/500)*100;elements.xpFill.style.width=`${percent}%`}}
function backToDashboard(){const mainContent=document.getElementById('main-content-area');if(mainContent&&mainContent.dataset.originalContent){mainContent.innerHTML=mainContent.dataset.originalContent;mainContent.dataset.originalContent='';initDashboardPage();applyLanguage();const bottomNavItems=document.querySelectorAll('.bottom-nav .nav-item');if(bottomNavItems.length>0){bottomNavItems.forEach(item=>item.classList.remove('active'));bottomNavItems[0].classList.add('active')}
const sidebarBtns=document.querySelectorAll('.sidebar-btn');if(sidebarBtns.length>0){sidebarBtns.forEach(btn=>btn.classList.remove('active-btn'));sidebarBtns[0].classList.add('active-btn')}
window.scrollTo({top:0,behavior:'smooth'});if(typeof renderQuests==='function'){renderQuests()}}}
const LIFT_IMG_DOWN="https://i.ibb.co/zW74jkmK/IMG-4239.png";const LIFT_IMG_UP="https://i.ibb.co/zVkNkjfZ/IMG-4238.png";function toggleGameMenu(){const drop=document.getElementById('game-dropdown-sidebar');if(drop)drop.style.display=drop.style.display==='block'?'none':'block'}
let gameInterval;let timeLeft=60;let isGameActive=!1;let sessionXP=0;let comboCount=0;let comboTimer;let globalBestCombo=0;let sessionBestCombo=0;let lastInteractionTime=0;function handleInteraction(e,type){e.preventDefault();const now=Date.now();if(type==='start'){if(now-lastInteractionTime<50)return;lastInteractionTime=now;liftStart()}else{liftEnd()}}
function openGame(){if(!checkGameCooldown('deadlift'))return;comboCount=0;sessionBestCombo=0;const savedData=JSON.parse(localStorage.getItem('currentUser')||'{}');globalBestCombo=savedData.bestCombo||0;document.getElementById('best-combo-val').innerText=globalBestCombo;sessionXP=0;document.getElementById('session-xp-val').innerText="0";document.getElementById('deadlift-char').src=LIFT_IMG_DOWN;document.getElementById('game-modal').style.display='flex';if(window.innerWidth<768)document.getElementById('sidebar').classList.add('collapsed');startTimer()}
function startTimer(){timeLeft=60;isGameActive=!0;document.getElementById('game-timer-val').innerText=`${timeLeft}s`;gameInterval=setInterval(()=>{timeLeft--;document.getElementById('game-timer-val').innerText=`${timeLeft}s`;if(timeLeft<=0)finishGame(!0);},1000)}
function closeGame(){if(confirm(translations[currentLang].exit_confirm)){finishGame(!1)}}



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
        if (sessionXP > 0) {
            showToast(`${translations[currentLang].great_job} +${sessionXP} XP`);
            addXP(sessionXP, 'game', 'RGA_SECURE_998877', 'deadlift');
        }

        if (globalBestCombo > previousBestCombo) {
            db.collection('users').doc(user.uid).update({
                bestCombo: globalBestCombo
            });
            savedData.bestCombo = globalBestCombo;
            localStorage.setItem('currentUser', JSON.stringify(savedData));
            

            setTimeout(() => {
                const isEn = (typeof currentLang !== 'undefined' && currentLang === 'en');
                const msg = isEn ? `🔥 New Combo Record: ${globalBestCombo}!` : `🔥 رقم قياسي جديد للكومبو: ${globalBestCombo}!`;
                showToast(msg);
            }, 2000);

            updateStat('dl_combo', globalBestCombo, true);
        }
    }
}

function liftStart(){if(!isGameActive)return;const char=document.getElementById('deadlift-char');const container=document.getElementById('shake-target');char.src=LIFT_IMG_UP;char.style.transform="translateY(-20px) scale(1.05)";container.classList.add('shake');comboCount++;clearTimeout(comboTimer);if(comboCount>sessionBestCombo){sessionBestCombo=comboCount}
if(comboCount>globalBestCombo){globalBestCombo=comboCount;document.getElementById('best-combo-val').innerText=globalBestCombo}
if(comboCount>1){const comboEl=document.createElement('div');comboEl.className='combo-pop';comboEl.innerText=comboCount+"x";comboEl.style.left=(Math.random()*40+30)+'%';comboEl.style.top='10%';document.getElementById('shake-target').appendChild(comboEl);setTimeout(()=>comboEl.remove(),500)}
comboTimer=setTimeout(()=>{comboCount=0},800);sessionXP++;document.getElementById('session-xp-val').innerText=sessionXP;const pop=document.createElement('div');pop.className='xp-pop';pop.innerText='+1';pop.style.left=(Math.random()*60+20)+'%';document.getElementById('shake-target').appendChild(pop);setTimeout(()=>pop.remove(),800)}
function liftEnd(){if(!isGameActive)return;const char=document.getElementById('deadlift-char');const container=document.getElementById('shake-target');if(char){char.src=LIFT_IMG_DOWN;char.style.transform="translateY(0) scale(1)"}
if(container)container.classList.remove('shake');}
let squatScore=0;let squatMistakes=0;let isSquatGameActive=!1;let squatGameLoop;let squatLineSpeed=2;let linePosition=0;let lineDirection=1;function openSquatGame(){if(!checkGameCooldown('squat'))return;squatScore=0;squatMistakes=0;linePosition=0;lineDirection=1;squatLineSpeed=2;document.getElementById('squat-session-xp-val').innerText="0";document.getElementById('squat-mistakes-val').innerText="0 / 5";document.getElementById('squat-game-modal').style.display='flex';if(window.innerWidth<768)document.getElementById('sidebar').classList.add('collapsed');startSquatGame()}
function startSquatGame(){isSquatGameActive=!0;gameLoop()}
function gameLoop(){if(!isSquatGameActive)return;const line=document.getElementById('squat-line');const barContainer=document.getElementById('squat-bar-container');const barHeight=barContainer.clientHeight;const lineHeight=line.clientHeight;linePosition+=lineDirection*squatLineSpeed;if(linePosition>=barHeight-lineHeight||linePosition<=0){lineDirection*=-1;linePosition=Math.max(0,Math.min(linePosition,barHeight-lineHeight))}
line.style.transform=`translateY(${linePosition}px)`;squatGameLoop=requestAnimationFrame(gameLoop)}
function handleSquatClick(){if(!isSquatGameActive)return;const line=document.getElementById('squat-line');const greenZone=document.getElementById('squat-green-zone');const lineTop=line.getBoundingClientRect().top;const greenZoneTop=greenZone.getBoundingClientRect().top;const greenZoneBottom=greenZone.getBoundingClientRect().bottom;if(lineTop>=greenZoneTop&&lineTop<=greenZoneBottom){squatScore+=10;document.getElementById('squat-session-xp-val').innerText=squatScore;squatLineSpeed+=0.25;const charAfter=document.getElementById('squat-char-after');charAfter.style.opacity=1;charAfter.style.transform='translateY(10px)';setTimeout(()=>{charAfter.style.opacity=0;charAfter.style.transform='translateY(0)'},300);const pop=document.createElement('div');pop.className='xp-pop';pop.innerText='+10';pop.style.left='50%';pop.style.transform='translateX(-50%)';document.getElementById('squat-bar-container').appendChild(pop);setTimeout(()=>pop.remove(),800)}else{squatMistakes++;document.getElementById('squat-mistakes-val').innerText=`${squatMistakes} / 5`;const barContainer=document.getElementById('squat-bar-container');barContainer.classList.add('squat-bar-error');setTimeout(()=>barContainer.classList.remove('squat-bar-error'),300);if(squatMistakes>=5)finishSquatGame(!0);}}
function closeSquatGame(){if(confirm(translations[currentLang].exit_confirm))finishSquatGame(!1);}
function finishSquatGame(saveScore=!0){if(!isSquatGameActive)return;isSquatGameActive=!1;cancelAnimationFrame(squatGameLoop);document.getElementById('squat-game-modal').style.display='none';if(squatScore>0&&saveScore){showToast(`${translations[currentLang].game_over} +${squatScore} XP`);addXP(squatScore,'game','RGA_SECURE_998877','squat');updateStat('sq_score',squatScore,!0);updateQuestProgress('sq_score',squatScore)}else{showToast(translations[currentLang].good_luck)}}
window.logHealthyMeal=async function(){const user=auth.currentUser;if(!user){showToast(currentLang==='en'?"Please login first!":"يجب تسجيل الدخول أولاً!");return}
const t=translations[currentLang||'ar'];let savedData=JSON.parse(localStorage.getItem('currentUser')||'{}');const now=Date.now();const lastMealTime=savedData.lastMealTime||0;const fourHoursMs=4*60*60*1000;if(now-lastMealTime<fourHoursMs){const timeLeftMs=fourHoursMs-(now-lastMealTime);const hours=Math.floor(timeLeftMs/(1000*60*60));const minutes=Math.ceil((timeLeftMs%(1000*60*60))/(1000*60));let timeMsg='';if(hours>0){timeMsg=currentLang==='en'?`${hours}h ${minutes}m`:`${hours}س و ${minutes}د`}else{timeMsg=currentLang==='en'?`${minutes}m`:`${minutes} دقيقة`}
showToast(`${t.meal_cooldown} ${timeMsg} ⏳`);return}
const btn=window.event?window.event.target.closest('button'):null;let originalHtml='';if(btn){originalHtml=btn.innerHTML;btn.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i>';btn.disabled=!0}
try{const secureXPCall=firebase.functions().httpsCallable('secureAddXP');const result=await secureXPCall({actionType:'meal',amount:50});if(result.data.xpAdded>0){showToast(`${t.meal_success} +50 XP 🥗`);updateQuestProgress('meal',1);savedData.lastMealTime=Date.now();savedData.xp=(savedData.xp||0)+50;savedData.rank=Math.floor(savedData.xp/500)+1;savedData.maxXp=savedData.rank*500;localStorage.setItem('currentUser',JSON.stringify(savedData));if(typeof renderUI==="function")renderUI(savedData);if(typeof updateStat==="function"){updateStat('meals',1);updateStat('xpTotal',50,!0)}}}catch(e){console.error("خطأ:",e.message);if(e.message.includes('cooldown')){showToast(currentLang==='en'?"Please wait before logging again.":"انتظر قليلاً قبل التسجيل مجدداً.")}else{showToast(currentLang==='en'?"Error connecting to server":"حدث خطأ في الاتصال")}}finally{if(btn){btn.innerHTML=originalHtml;btn.disabled=!1}}};function openWorkoutModal(){const savedData=JSON.parse(localStorage.getItem('currentUser')||'{}');const modal=document.getElementById('workout-modal');document.getElementById('workout-step-1').style.display='none';document.getElementById('workout-step-2').style.display='none';document.getElementById('workout-step-3').style.display='none';let pendingMsg=document.getElementById('pending-workout-msg');if(!pendingMsg){pendingMsg=document.createElement('div');pendingMsg.id='pending-workout-msg';pendingMsg.innerHTML=`
            <div style="text-align:center; padding: 40px;">
                <i class="fa-solid fa-hourglass-half fa-spin fa-3x" style="color:var(--primary-color);"></i>
                <p style="margin-top:20px; font-weight:900; color:white; font-size: 1.1rem;">⏳ تمرين أسطوري قيد المراجعة!</p>
                <p style="color:var(--slate); font-size: 0.9rem; margin-top: 10px;">استرخي شوي يا بطل، الإدارة بتراجع إثباتك ورح يجيك إشعار أول ما يتم الاعتماد 👑</p>
            </div>`;document.querySelector('#workout-modal .modal-content').appendChild(pendingMsg)}
if(savedData.isWorkoutPending){pendingMsg.style.display='block'}else{pendingMsg.style.display='none';document.getElementById('workout-step-1').style.display='block';document.getElementById('exercises-container').innerHTML=''}
modal.classList.add('active')}
function closeWorkoutModal(){document.getElementById('workout-modal').classList.remove('active')}
function selectWorkoutSplit(split){currentWorkoutSplit=split;const t=translations[currentLang];if(split==='full'){selectWorkoutType(t.sys_full);return}
document.getElementById('workout-step-1').style.display='none';document.getElementById('workout-step-2').style.display='block';const grid=document.getElementById('dynamic-muscle-grid');grid.innerHTML='';if(split==='bro'){const muscles=[{key:'chest',text:t.muscle_chest},{key:'back',text:t.muscle_back},{key:'shoulders',text:t.muscle_shoulders},{key:'biceps',text:t.muscle_biceps},{key:'triceps',text:t.muscle_triceps},{key:'legs',text:t.muscle_legs},{key:'core',text:t.muscle_core}];muscles.forEach(m=>{grid.innerHTML+=`<button class="workout-type-btn" onclick="selectWorkoutType('${m.text}')">${m.text}</button>`})}else if(split==='ppl'){const ppl=[{key:'push',text:t.sys_push},{key:'pull',text:t.sys_pull},{key:'legs',text:t.sys_legs}];ppl.forEach(m=>{grid.innerHTML+=`<button class="workout-type-btn" onclick="selectWorkoutType('${m.text}')">${m.text}</button>`})}}
function backToStep1(){document.getElementById('workout-step-2').style.display='none';document.getElementById('workout-step-1').style.display='block'}
function backToStep2(){document.getElementById('workout-step-3').style.display='none';if(currentWorkoutSplit==='full'){document.getElementById('workout-step-1').style.display='block'}else{document.getElementById('workout-step-2').style.display='block'}}
const workoutTemplates={ar:{"صدر":["بنش برس","تجميع دمبلز علوي","تفتيح كيبل","متوازي"],"ظهر":["سحب ظهر أمامي","تجديف بار","سحب أرضي","ديدليفت"],"أكتاف":["ضغط أكتاف دمبلز","رفرفة جانبي","رفرفة أمامي","فيس بول"],"أرجل":["سكوات","ليج بريس","رفرفة أمامي","رفرفة خلفي","بطات"],"بايسبس":["بايسبس بار","بايسبس دمبلز تبادل","بايسبس هامر","بايسبس كيبل"],"ترايسبس":["ترايسبس حبل","ترايسبس بار مستقيم","ترايسبس دمبلز فرنسي","متوازي (Dips)"],"دفع (Push)":["بنش برس","ضغط أكتاف","تجميع صدر علوي","رفرفة جانبي","ترايسبس حبل"],"سحب (Pull)":["تجديف بار","سحب ظهر أمامي","فيس بول","بايسبس بار","ديدليفت"],"شامل (Full Body)":["سكوات","بنش برس","تجديف بار","ضغط أكتاف","ديدليفت"]},en:{"Chest":["Bench Press","Incline Dumbbell Press","Cable Flyes","Dips"],"Back":["Lat Pulldown","Barbell Row","Seated Row","Deadlift"],"Shoulders":["Shoulder Press","Lateral Raise","Front Raise","Face Pull"],"Legs":["Squat","Leg Press","Leg Extension","Leg Curl","Calf Raises"],"Biceps":["Barbell Curl","Dumbbell Curl","Hammer Curl","Cable Curl"],"Triceps":["Triceps Pushdown","Skull Crushers","Overhead Extension","Dips"],"Push":["Bench Press","Shoulder Press","Incline Press","Lateral Raise","Triceps Pushdown"],"Pull":["Barbell Row","Lat Pulldown","Face Pull","Barbell Curl","Deadlift"],"Full Body":["Squat","Bench Press","Barbell Row","Shoulder Press","Deadlift"]}};window.addExerciseRow=function(){const container=document.getElementById('exercises-container');if(!container)return;const row=document.createElement('div');row.className='exercise-row';const t=translations[currentLang||'ar'];row.innerHTML=`
        <input type="text" name="exercise_name" list="smart-exercises" placeholder="${t.ex_name || 'التمرين'}" class="ex-name" spellcheck="false">
        <input type="number" name="exercise_reps" placeholder="${t.ex_reps || 'العدات'}" class="ex-reps" inputmode="numeric" oninput="if(this.value > 25) { this.value = 25; if(typeof showToast === 'function') showToast(currentLang === 'en' ? 'Max 25 reps allowed!' : 'الحد الأقصى للعدات هو 25!'); }">
        <input type="number" name="exercise_weight" placeholder="${t.ex_weight || 'الوزن'}" class="ex-weight" inputmode="decimal">
        <button class="remove-exercise-btn" onclick="this.parentElement.remove()" title="حذف">×</button>
    `;container.appendChild(row)};window.selectWorkoutType=function(type){document.getElementById('selected-workout-type').innerText=type;document.getElementById('workout-step-1').style.display='none';document.getElementById('workout-step-2').style.display='none';document.getElementById('workout-step-3').style.display='block';document.getElementById('exercises-container').innerHTML='';const templateBtn=document.getElementById('template-btn');const t=translations[currentLang||'ar'];if(templateBtn){if(workoutTemplates[currentLang]&&workoutTemplates[currentLang][type]){templateBtn.style.display='block';templateBtn.innerText=`${t.template_btn} (${type})`}else{templateBtn.style.display='none'}}
addExerciseRow()};window.loadWorkoutTemplate=function(){const typeElement=document.getElementById('selected-workout-type');let type=typeElement?typeElement.innerText:'';let template=workoutTemplates.ar[type]||workoutTemplates.en[type];if(!template){const t=translations[currentLang==='en'?'ar':'en'];let reverseType=Object.keys(t).find(key=>t[key]===type);if(reverseType){let mappedKey=translations[currentLang][reverseType];template=workoutTemplates[currentLang][mappedKey]}}
if(!template)return;const container=document.getElementById('exercises-container');container.innerHTML='';template.forEach(exName=>{addExerciseRow();const rows=container.querySelectorAll('.exercise-row');const lastRow=rows[rows.length-1];if(lastRow)lastRow.querySelector('.ex-name').value=exName});showToast(translations[currentLang].template_loaded)};let isSavingNormalWorkout=!1;async function saveWorkout(){if(isSavingNormalWorkout)return;isSavingNormalWorkout=!0;try{const rows=document.querySelectorAll('.exercise-row');let hasValidExercise=!1;let exercises=[];const typeElement=document.getElementById('selected-workout-type');const typeText=typeElement?typeElement.innerText:'تمرين';let needsProof=!1;let heavyWeight=0;let heavyExerciseName="";rows.forEach(row=>{const nameInput=row.querySelector('.ex-name');const repsInput=row.querySelector('.ex-reps');const weightInput=row.querySelector('.ex-weight');if(nameInput&&nameInput.value.trim()!==""){hasValidExercise=!0;let currentWeight=parseFloat(weightInput.value)||0;let exName=nameInput.value.trim();exercises.push({name:exName,reps:(repsInput&&repsInput.value.trim()!=="")?repsInput.value.trim():'-',weight:currentWeight>0?currentWeight:'-'});let threshold=999;if(typeText.includes("صدر")||typeText.includes("Chest"))threshold=60;if(typeText.includes("ظهر")||typeText.includes("Back"))threshold=80;if(typeText.includes("أكتاف")||typeText.includes("Shoulders"))threshold=50;if(typeText.includes("بايسبس")||typeText.includes("ترايسبس")||typeText.includes("Biceps")||typeText.includes("Triceps"))threshold=50;if(typeText.includes("بطن")||typeText.includes("Core"))threshold=80;if(typeText.includes("دفع")||typeText.includes("Push"))threshold=70;if(typeText.includes("سحب")||typeText.includes("Pull"))threshold=70;if(typeText.includes("أرجل")||typeText.includes("Legs"))threshold=120;if(typeText.includes("شامل")||typeText.includes("Full Body"))threshold=60;if(exName.includes("ديدليفت")||exName.toLowerCase().includes("deadlift"))threshold=120;if(exName.includes("سكوات")||exName.toLowerCase().includes("squat"))threshold=140;if(currentWeight>=threshold){needsProof=!0;if(currentWeight>heavyWeight){heavyWeight=currentWeight;heavyExerciseName=exName}}}});if(!hasValidExercise){showToast(translations[currentLang].ex_error||"يرجى إضافة تمرين واحد على الأقل.");return}
if(needsProof){const t=translations[currentLang||'ar'];const confirmMsg=currentLang==='en'?`💪 You are a beast!!\nYou lifted ${heavyWeight}kg in ${heavyExerciseName}!\nSince you broke the record, you must upload a video to prove your strength.\nReady to upload?`:`💪 إنت وحش!!\nشلت ${heavyWeight}kg بتمرين ${heavyExerciseName}!\nلأنك قطعت الدنيا، لازم ترفع فيديو يثبت قوتك عشان نعتمدلك الرقم ونحطه بالليدربورد.\nجاهز ترفع الفيديو؟`;const confirmProof=confirm(confirmMsg);if(!confirmProof){showToast(t.cancel_upload);return}
const fileInput=document.createElement('input');fileInput.type='file';fileInput.accept='video/*';let isUploadingProof=!1;fileInput.onchange=async(e)=>{if(isUploadingProof)return;const file=e.target.files[0];if(file){isUploadingProof=!0;if(file.size>30*1024*1024){showToast(t.video_size_error);isUploadingProof=!1;return}
closeWorkoutModal();document.getElementById('workout-step-3').innerHTML=`
                        <div style="text-align:center; padding: 40px;">
                            <i class="fa-solid fa-spinner fa-spin fa-3x" style="color:var(--primary-color);"></i>
                            <p style="margin-top:20px; font-weight:bold; color:white;">${t.uploading_proof}</p>
                            <h1 id="upload-progress" style="color:var(--primary-color); font-size: 2.5rem; margin-top: 15px;">0%</h1>
                        </div>`;document.getElementById('workout-modal').classList.add('active');const user=auth.currentUser;const cleanFileName=file.name.replace(/[^a-zA-Z0-9.]/g,"_");const videoRef=storage.ref(`proofs/${user.uid}_${Date.now()}_${cleanFileName}`);const uploadTask=videoRef.put(file);uploadTask.on('state_changed',(snapshot)=>{const progress=(snapshot.bytesTransferred/snapshot.totalBytes)*100;const progressText=document.getElementById('upload-progress');if(progressText)progressText.innerText=Math.round(progress)+'%'},(error)=>{closeWorkoutModal();showToast(t.upload_fail_storage)},async()=>{try{const videoURL=await uploadTask.snapshot.ref.getDownloadURL();let dateStr=new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});await db.collection('pending_workouts').add({userId:user.uid,userName:JSON.parse(localStorage.getItem('currentUser')).firstName,date:dateStr,type:typeText,details:exercises,videoUrl:videoURL,status:'pending',timestamp:firebase.firestore.FieldValue.serverTimestamp()});await db.collection('users').doc(user.uid).update({isWorkoutPending:!0});let savedData=JSON.parse(localStorage.getItem('currentUser'));savedData.isWorkoutPending=!0;localStorage.setItem('currentUser',JSON.stringify(savedData));closeWorkoutModal();showToast(t.upload_success_wait)}catch(dbError){closeWorkoutModal();showToast(t.save_db_error)}})}};fileInput.click();return}
let workoutHistory=[];try{workoutHistory=JSON.parse(localStorage.getItem('userWorkouts'))||[]}catch(e){}
let dateStr=new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});workoutHistory.unshift({date:dateStr,type:typeText,details:exercises});localStorage.setItem('userWorkouts',JSON.stringify(workoutHistory));let totalVol=0;let totalReps=0;exercises.forEach(ex=>{totalVol+=(parseFloat(ex.weight)*parseInt(ex.reps))||0;totalReps+=parseInt(ex.reps)||0});await updateQuestProgressBatch({volume:totalVol,reps:totalReps,workout_days:1});addVolumeToClanWar(totalVol);if(typeof updateStat==="function"){updateStat('workouts',1);let highestWeight=0;rows.forEach(row=>{let w=parseFloat(row.querySelector('.ex-weight').value)||0;if(w>highestWeight)highestWeight=w});if(highestWeight>0){updateStat('maxWeight',highestWeight,!0)}}
const user=auth.currentUser;if(user){let savedData=JSON.parse(localStorage.getItem('currentUser')||'{}');const todayStr=new Date().toDateString();const lastXpDate=savedData.lastWorkoutXpDate||"";if(lastXpDate===todayStr){const now=new Date();const tomorrow=new Date(now);tomorrow.setHours(24,0,0,0);const timeLeftMs=tomorrow-now;const hours=Math.floor(timeLeftMs/(1000*60*60));const minutes=Math.floor((timeLeftMs%(1000*60*60))/(1000*60));let timeMsg=currentLang==='en'?`${hours}h ${minutes}m`:`${hours} س و ${minutes} د`;db.collection('users').doc(user.uid).update({workouts:workoutHistory});showToast(currentLang==='en'?`Workout Saved! XP resets in ${timeMsg}`:`تم حفظ التمرين! المكافأة تتجدد بعد ${timeMsg}`)}else{savedData.lastWorkoutXpDate=todayStr;localStorage.setItem('currentUser',JSON.stringify(savedData));db.collection('users').doc(user.uid).update({workouts:workoutHistory,lastWorkoutXpDate:todayStr});if(typeof addXP==="function")await addXP(50,'workout');showToast(currentLang==='en'?`Saved! +50 XP`:`تم الحفظ! +50 XP`)}}
closeWorkoutModal();if(document.getElementById('log-container')){renderWorkoutLog();if(typeof initWorkoutChart==="function")setTimeout(initWorkoutChart,200);}}finally{setTimeout(()=>{isSavingNormalWorkout=!1},2000)}}


window.addXP = async function(amount, actionType = 'game', securityToken = null, gameType = null) {
    const user = auth.currentUser;
    if (!user) return;
    
    if (actionType === 'game' && securityToken !== 'RGA_SECURE_998877') {
        console.warn("Unauthorized XP attempt blocked.");
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
            
            const now = Date.now();
            let updates = { xp: savedData.xp, rank: savedData.rank };
            
            if (actionType === 'game' && gameType) {
                if (gameType === 'deadlift') { savedData.lastDeadliftTime = now; updates.lastDeadliftTime = now; }
                if (gameType === 'squat') { savedData.lastSquatTime = now; updates.lastSquatTime = now; }
                if (gameType === 'reflex') { savedData.lastReflexTime = now; updates.lastReflexTime = now; }
                savedData.lastGameXPTime = now; updates.lastGameXPTime = now;
            } else if (actionType === 'meal') {
                savedData.lastMealTime = now; updates.lastMealTime = now;
            } else if (actionType === 'workout') {
                const todayStr = new Date().toDateString();
                savedData.lastWorkoutXpDate = todayStr; updates.lastWorkoutXpDate = todayStr;
            } else if (actionType === 'tribute') {
                const todayStr = new Date().toDateString();
                savedData.lastTributeClaim = todayStr; updates.lastTributeClaim = todayStr;
            }


// 🔥 التعديل الصح: حساب كم مستوى ارتفع اللاعب بالضبط 🔥
            let levelsGained = savedData.rank - oldLevel;
            
            if (levelsGained > 0) {
                if (!savedData.crates) savedData.crates = {};
                
                // إضافة عدد صناديق يساوي عدد المستويات اللي ارتفعها
                savedData.crates['steel'] = (savedData.crates['steel'] || 0) + levelsGained;
                updates['crates.steel'] = firebase.firestore.FieldValue.increment(levelsGained);
            }

            // حفظ بالذاكرة وتحديث الواجهة
            localStorage.setItem('currentUser', JSON.stringify(savedData));
            if (typeof renderUI === "function") renderUI(savedData);
            
            // إرسال التحديثات للسيرفر
            await db.collection('users').doc(user.uid).update(updates);
            
            if (typeof updateStat === "function") {
                updateStat('xpTotal', xpAddedByServer, !1);
                if (levelsGained > 0) updateStat('levelReach', savedData.rank, !0);
            }
            
            // إظهار الإشعار بدقة (لو ارتفع 3 مستويات بيكتبله +3 صناديق)
            if (levelsGained > 0) {
                const t = translations[currentLang || 'ar'];
                const msg = currentLang === 'en' ? `+${levelsGained} Steel Crate(s)!` : `+${levelsGained} صندوق فولاذي مجاني!`;
                showToast(`${t.level_up} ${savedData.rank}! 🎁 ${msg}`);
            }
        }
    } catch (error) {
        console.error("Critical XP Error:", error.message);
    }
};



function checkGameCooldown(gameType){const data=JSON.parse(localStorage.getItem('currentUser')||'{}');const now=Date.now();const t=translations[currentLang||'ar'];const lastAnyGame=data.lastGameXPTime||0;if(now-lastAnyGame<10000){showToast(`${t.wait_setup} (${Math.ceil((10000 - (now - lastAnyGame)) / 1000)}s)`);return!1}
let lastPlayed=0;if(gameType==='deadlift')lastPlayed=data.lastDeadliftTime||0;else if(gameType==='squat')lastPlayed=data.lastSquatTime||0;else if(gameType==='reflex')lastPlayed=data.lastReflexTime||0;

  const cooldownMs = 60 * 60 * 1000; 


if(now-lastPlayed<cooldownMs){const minsLeft=Math.ceil((cooldownMs-(now-lastPlayed))/60000);showToast(`${t.game_cooldown} ${minsLeft} ${currentLang === 'en' ? 'm' : 'دقيقة'} `);return!1}
return!0}
window.workoutChartInstance=null;function openPerformanceCenter(){if(window.innerWidth<768)document.getElementById('sidebar').classList.add('collapsed');const mainContent=document.getElementById('main-content-area');if(!mainContent)return;const t=translations[currentLang||'ar'];if(!mainContent.dataset.originalContent){mainContent.dataset.originalContent=mainContent.innerHTML}
mainContent.innerHTML=`
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
                <div style="text-align: right; margin-bottom: 15px;">
                    <button id="reset-log-btn" class="btn-primary" onclick="deleteAllWorkouts()" style="padding: 8px 15px; background: rgba(255, 77, 77, 0.1); border-color: #ff4d4d; color: #ff4d4d; font-size: 0.85rem;">
                        <i class="fa-solid fa-rotate-right"></i> <span data-translate="reset_log_btn"></span>
                    </button>
                </div>
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
    `;document.getElementById('back-to-dash-btn').onclick=backToDashboard;renderWorkoutLog();setTimeout(()=>{initWorkoutChart();initRadarChart();initTSBChart();initMuscleRecoveryMap()},200)}
window.tsbChartInstance=null;function initTSBChart(){if(typeof Chart==='undefined')return;let workouts=[];try{workouts=JSON.parse(localStorage.getItem('userWorkouts'))||[]}catch(e){console.error("خطأ في قراءة الأرشيف:",e)}
const ctx=document.getElementById('tsbChart');const statusBox=document.getElementById('tsb-status-box');if(!ctx)return;if(workouts.length===0){statusBox.innerHTML=currentLang==='en'?'No workout data yet.':'لا توجد بيانات تمارين بعد. سجل أول تمرين لترى السحر!';statusBox.style.background='rgba(255,255,255,0.05)';return}
try{const dailyLoads={};workouts.forEach(w=>{if(!w.date)return;let d=new Date(w.date);if(isNaN(d.getTime()))return;let dateKey=`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;let dailyLoad=0;if(w.details&&Array.isArray(w.details)){w.details.forEach(ex=>{let weight=parseFloat(ex.weight);if(isNaN(weight)||weight<=0)weight=15;dailyLoad+=weight})}else{dailyLoad=50}
if(!dailyLoads[dateKey])dailyLoads[dateKey]=0;dailyLoads[dateKey]+=dailyLoad});let today=new Date();today.setHours(0,0,0,0);let startDate=new Date(today);startDate.setDate(startDate.getDate()-60);const labels=[];const fitnessData=[];const fatigueData=[];const readinessData=[];let ctl=0;let atl=0;const ctlAlpha=2/(42+1);const atlAlpha=2/(7+1);for(let d=new Date(startDate);d<=today;d.setDate(d.getDate()+1)){let dateKey=`${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;let load=dailyLoads[dateKey]||0;ctl=(load*ctlAlpha)+(ctl*(1-ctlAlpha));atl=(load*atlAlpha)+(atl*(1-atlAlpha));let tsb=ctl-atl;const diffTime=today.getTime()-d.getTime();const diffDays=Math.round(diffTime/(1000*60*60*24));if(diffDays<=14){let label=`${d.getDate()}/${d.getMonth()+1}`;labels.push(label);fitnessData.push(parseFloat(ctl.toFixed(1)));fatigueData.push(parseFloat(atl.toFixed(1)));readinessData.push(parseFloat(tsb.toFixed(1)))}}
const currentTSB=readinessData[readinessData.length-1]||0;const maxCTL=Math.max(...fitnessData);let statusText='';let statusColor='';let statusBg='';if(maxCTL===0){statusText=currentLang==='en'?'Log more weights to activate the CNS Radar.':'سجل أوزانك في تمارينك القادمة لتفعيل العقل المدبر.';statusColor='var(--slate)';statusBg='rgba(255, 255, 255, 0.05)'}else if(currentTSB<-15){statusText=currentLang==='en'?' High Fatigue! Overtraining risk.':' إرهاق عالي! خطر الهدم العضلي. يُنصح بالراحة أو اللعب بوزن خفيف.';statusColor='#ff4d4d';statusBg='rgba(255, 77, 77, 0.1)'}else if(currentTSB>=-15&&currentTSB<=15){statusText=currentLang==='en'?' Optimal Zone. Keep grinding!':' منطقة البناء المثالية. استمر بالجلد!';statusColor='#00f2a7';statusBg='rgba(0, 242, 167, 0.1)'}else{statusText=currentLang==='en'?' PEAKING! CNS is fully fresh.':' حالة الذروة! جهازك العصبي مرتاح 100%. جاهز لكسر الأرقام (PR)!';statusColor='#FFD700';statusBg='rgba(255, 215, 0, 0.1)'}
statusBox.innerHTML=statusText;statusBox.style.color=statusColor;statusBox.style.backgroundColor=statusBg;statusBox.style.border=`1px solid ${statusColor}`;if(window.tsbChartInstance){window.tsbChartInstance.destroy()}
window.tsbChartInstance=new Chart(ctx.getContext('2d'),{type:'line',data:{labels:labels,datasets:[{type:'bar',label:currentLang==='en'?'Readiness (TSB)':'الجاهزية (TSB)',data:readinessData,backgroundColor:readinessData.map(val=>val<0?'rgba(255, 77, 77, 0.6)':(val>10?'rgba(255, 215, 0, 0.6)':'rgba(0, 242, 167, 0.6)')),borderRadius:5,borderWidth:0,yAxisID:'y'},{type:'line',label:currentLang==='en'?'Fitness (CTL)':'اللياقة (CTL)',data:fitnessData,borderColor:'#3498db',backgroundColor:'rgba(52, 152, 219, 0.1)',borderWidth:3,tension:0.4,pointRadius:0,yAxisID:'y'},{type:'line',label:currentLang==='en'?'Fatigue (ATL)':'الإرهاق (ATL)',data:fatigueData,borderColor:'#ff4d4d',borderWidth:2,borderDash:[5,5],tension:0.4,pointRadius:0,yAxisID:'y'}]},options:{responsive:!0,maintainAspectRatio:!1,interaction:{mode:'index',intersect:!1},scales:{x:{grid:{color:'rgba(255, 255, 255, 0.05)'},ticks:{color:'#8892b0'}},y:{grid:{color:'rgba(255, 255, 255, 0.05)'},ticks:{color:'#8892b0'}}},plugins:{legend:{labels:{color:'#e6f1ff',font:{family:'var(--font-main)'}}},tooltip:{backgroundColor:'rgba(10, 20, 41, 0.9)',titleColor:'#FFD700',bodyFont:{size:14}}}}})}catch(error){console.error("TSB Chart Error: ",error);statusBox.innerHTML='حدث خطأ أثناء معالجة البيانات. تأكد من تسجيل أوزان صالحة.';statusBox.style.color='#ff4d4d'}}
function showLineChartInfo(){const isEn=currentLang==='en';const title=isEn?'Max Weight Progress 📈':'تطور أعلى وزن 📈';const steps=isEn?[" <b>What is this?</b> A visual tracker of your highest lifts across all muscle groups or workout splits."," <b>How it works:</b> It scans your workout history and plots the absolute heaviest weight you've logged for each category."," <b>The Goal:</b> Watch this line go up over time! It is the ultimate proof of your progressive overload and increasing strength."]:[" <b>ما هذا؟</b> متتبع بصري يوضح أقوى رفعاتك في جميع العضلات أو الأنظمة التدريبية."," <b>كيف يعمل؟</b> يقرأ أرشيف تمارينك ويرسم نقطة تمثل أعلى وزن (Max Weight) سجلته لكل فئة."," <b>الهدف:</b> المراقبة المستمرة لضمان الزيادة التدريجية للأحمال (Progressive Overload). ارتفاع هذا الخط نحو الأعلى يعني أنك تزداد قوة يوماً بعد يوم!"];const rulesHtml=steps.map(step=>`<li style="margin-bottom:12px; text-align:${isEn ? 'left' : 'right'}; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
            ${step}
        </li>`).join('');const modal=document.createElement('div');modal.className='modal-overlay active';modal.style.zIndex='30000';modal.innerHTML=`
        <div class="modal-content glass-card" style="max-width:400px; padding:25px; border: 1px solid var(--primary-color); position: relative;">
            <h2 style="color:var(--primary-color); margin-bottom:20px; text-align:center;">${title}</h2>
            <ul style="color:var(--white); list-style:none; padding:0; font-size:0.9rem; line-height: 1.6;">${rulesHtml}</ul>
            <button class="btn-primary" onclick="this.parentElement.parentElement.remove()" style="width: 100%; margin-top: 20px; padding: 10px;">
                ${isEn ? 'Understood! Let\'s grow.' : 'علم، جاري التطور! '}
            </button>
        </div>
    `;document.body.appendChild(modal)}
function showTSBInfo(){const isEn=currentLang==='en';const title=isEn?'The Science of CNS Readiness ':'علم الجاهزية العصبية ';const steps=isEn?[" <b>What is this?</b> We use the Olympic 'Banister Impulse-Response Model' to track your true recovery."," <b>Fitness (CTL):</b> Your accumulated strength over the last 42 days. You want this to go UP."," <b>Fatigue (ATL):</b> The stress on your joints and CNS from the last 7 days."," <b>The Bars (TSB):</b> Fitness minus Fatigue. <br>- <b>Below 0 (Red):</b> You are exhausted. Recover! <br>- <b>0 to +10 (Green):</b> Perfect training zone. <br>- <b>Above +10 (Gold):</b> Peaking! You are primed to set a new Personal Record (PR)."]:[" <b>ما هذا؟</b> نستخدم نموذج (Banister) الأولمبي لتحليل لياقتك وإرهاقك العصبي بشكل علمي دقيق."," <b>اللياقة (الخط الأزرق):</b> قوتك وحجمك العضلي المتراكم آخر 42 يوم. (الهدف إنها ترتفع)."," <b>الإرهاق (الخط الأحمر):</b> الضغط الواقع على مفاصلك وجهازك العصبي آخر 7 أيام."," <b>الأعمدة (النتيجة):</b> هي اللياقة ناقص الإرهاق. <br>- <b>أحمر (تحت الصفر):</b> أنت مرهق ومُعرض للإصابة. <br>- <b>أخضر (0 إلى +10):</b> منطقة البناء العضلي المثالية. <br>- <b>ذهبي (فوق +10):</b> جاهزية نووية! طاقتك فل وجاهز تكسر أعلى وزن بحياتك (PR)."];const rulesHtml=steps.map(step=>`<li style="margin-bottom:12px; text-align:${isEn ? 'left' : 'right'}; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
            ${step}
        </li>`).join('');const modal=document.createElement('div');modal.className='modal-overlay active';modal.style.zIndex='30000';modal.innerHTML=`
        <div class="modal-content glass-card" style="max-width:450px; padding:25px; border: 1px solid #FFD700; position: relative;">
            <h2 style="color:#FFD700; margin-bottom:20px; text-align:center;">${title}</h2>
            <ul style="color:var(--white); list-style:none; padding:0; font-size:0.9rem; line-height: 1.6;">${rulesHtml}</ul>
            <button class="btn-primary" onclick="this.parentElement.parentElement.remove()" style="width: 100%; margin-top: 20px; padding: 10px; background: #FFD700; color: #0A1429;">
                ${isEn ? 'Mind blown. Let\'s train!' : 'فهمت اللعبة. يلا نجلد! '}
            </button>
        </div>
    `;document.body.appendChild(modal)}
function showRadarInfo(){const isEn=currentLang==='en';const title=isEn?'How to Read the Radar? ':'كيف تقرأ الرادار؟ ';const steps=isEn?[" <b>The Goal:</b> To create a balanced shape, meaning your body strength is proportional."," <b>Imbalance:</b> If the shape is pulled to one side (e.g., huge Bench, tiny Row), you have a muscle imbalance."," <b>Injury Prevention:</b> A strong chest with a weak back causes rounded shoulders and injuries. Focus on your weaknesses!"," <b>Calculation:</b> The radar pulls the 'Heaviest Weight' you've logged for the Big 5 lifts."]:[" <b>الهدف:</b> أن يكون الشكل متوازن من كل الجهات، مما يعني أن قوة عضلاتك متناسقة."," <b>عدم التوازن:</b> إذا كان الشكل مسحوباً لجهة معينة (مثلاً: بنش برس عالي وتجديف ضعيف)، فهذا يعني أن لديك خلل عضلي."," <b>الوقاية من الإصابات:</b> الصدر القوي مع الظهر الضعيف يسبب إصابات بالكتف (تدوير للأمام). ركز على نقاط ضعفك!"," <b>طريقة الحساب:</b> الرادار يقرأ 'أعلى وزن' سجلته في أرشيفك للتمارين الـ 5 الأساسية."];const rulesHtml=steps.map(step=>`<li style="margin-bottom:12px; text-align:${isEn ? 'left' : 'right'}; padding: 12px; background: rgba(255,255,255,0.05); border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);">
            ${step}
        </li>`).join('');const modal=document.createElement('div');modal.className='modal-overlay active';modal.style.zIndex='30000';modal.innerHTML=`
        <div class="modal-content glass-card" style="max-width:400px; padding:25px; border: 1px solid var(--primary-color); position: relative;">
            <h2 style="color:var(--primary-color); margin-bottom:20px; text-align:center;">${title}</h2>
            <ul style="color:var(--white); list-style:none; padding:0; font-size:0.9rem; line-height: 1.6;">${rulesHtml}</ul>
            <button class="btn-primary" onclick="this.parentElement.parentElement.remove()" style="width: 100%; margin-top: 20px; padding: 10px;">
                ${isEn ? 'Got it, let\'s lift!' : 'فهمت، يلا نبلش! '}
            </button>
        </div>
    `;document.body.appendChild(modal)}
window.radarChartInstance=null;function initRadarChart(){if(typeof Chart==='undefined')return;let workoutHistory=[];try{workoutHistory=JSON.parse(localStorage.getItem('userWorkouts'))||[]}catch(e){}
const ctx=document.getElementById('radarChart');const emptyMsg=document.getElementById('radar-empty-msg');const wrapper=document.getElementById('radar-wrapper');if(!ctx)return;const big5={'Deadlift':{keywords:['ديدليفت','deadlift','رفعة ميتة'],val:0},'Squat':{keywords:['سكوات','squat','قرفصاء'],val:0},'Bench Press':{keywords:['بنش','صدر','bench','chest press'],val:0},'Barbell Row':{keywords:['تجديف','سحب أرضي','row','lat'],val:0},'Overhead Press':{keywords:['أكتاف','shoulder','overhead','ohp'],val:0}};let hasData=!1;workoutHistory.forEach(w=>{w.details.forEach(ex=>{let wgt=parseFloat(ex.weight);let name=ex.name.toLowerCase();if(!isNaN(wgt)&&wgt>0){for(let key in big5){if(big5[key].keywords.some(k=>name.includes(k))){if(wgt>big5[key].val){big5[key].val=wgt;hasData=!0}}}}})});if(!hasData){wrapper.style.display='none';if(emptyMsg)emptyMsg.style.display='block';return}
wrapper.style.display='block';if(emptyMsg)emptyMsg.style.display='none';if(window.radarChartInstance){window.radarChartInstance.destroy()}
const labels=currentLang==='en'?['Deadlift','Squat','Bench Press','Row','Shoulders']:['ديدليفت','سكوات','بنش برس','تجديف ظهر','ضغط أكتاف'];const dataValues=[big5.Deadlift.val,big5.Squat.val,big5['Bench Press'].val,big5['Barbell Row'].val,big5['Overhead Press'].val];window.radarChartInstance=new Chart(ctx.getContext('2d'),{type:'radar',data:{labels:labels,datasets:[{label:currentLang==='en'?'Max Weight (kg)':'أعلى وزن (kg)',data:dataValues,backgroundColor:'rgba(0, 242, 167, 0.25)',borderColor:'#00f2a7',pointBackgroundColor:'#FFD700',pointBorderColor:'#0A1429',pointHoverBackgroundColor:'#fff',pointHoverBorderColor:'#00f2a7',borderWidth:2,pointRadius:4,pointHoverRadius:6}]},options:{responsive:!0,maintainAspectRatio:!1,scales:{r:{angleLines:{color:'rgba(255, 255, 255, 0.1)'},grid:{color:'rgba(255, 255, 255, 0.1)'},pointLabels:{color:'#e6f1ff',font:{family:'var(--font-main)',size:12,weight:'bold'}},ticks:{display:!1,beginAtZero:!0}}},plugins:{legend:{display:!1},tooltip:{titleFont:{family:'var(--font-main)',size:14},bodyFont:{family:'var(--font-main)',size:14,weight:'bold'}}}}})}
function switchPerfTab(tab){document.querySelectorAll('.perf-tab-btn').forEach(btn=>btn.classList.remove('active-tab'));document.querySelectorAll('.perf-tab-content').forEach(content=>content.style.display='none');document.getElementById(`tab-btn-${tab}`).classList.add('active-tab');document.getElementById(`perf-tab-${tab}`).style.display='block';if(tab==='muscles')initMuscleRecoveryMap();}
let muscleRecoveryData={};function initMuscleRecoveryMap(){let workouts=JSON.parse(localStorage.getItem('userWorkouts'))||[];const today=new Date();today.setHours(0,0,0,0);const lastTrained={'صدر':null,'أكتاف':null,'أذرع':null,'أرجل':null,'بطن':null,'ظهر':null};workouts.forEach(w=>{let wDate=new Date(Date.parse(w.date));if(isNaN(wDate))return;wDate.setHours(0,0,0,0);const type=w.type;const updateIfNewer=(muscle)=>{if(!lastTrained[muscle]||wDate>lastTrained[muscle]){lastTrained[muscle]=wDate}};if(type.includes("صدر")||type.includes("Chest"))updateIfNewer('صدر');if(type.includes("أكتاف")||type.includes("Shoulders"))updateIfNewer('أكتاف');if(type.includes("بايسبس")||type.includes("ترايسبس")||type.includes("Arms"))updateIfNewer('أذرع');if(type.includes("أرجل")||type.includes("Legs"))updateIfNewer('أرجل');if(type.includes("بطن")||type.includes("Core"))updateIfNewer('بطن');if(type.includes("ظهر")||type.includes("Back"))updateIfNewer('ظهر');if(type.includes("دفع")||type.includes("Push")){updateIfNewer('صدر');updateIfNewer('أكتاف');updateIfNewer('أذرع')}
if(type.includes("سحب")||type.includes("Pull")){updateIfNewer('ظهر');updateIfNewer('أذرع')}
if(type.includes("شامل")||type.includes("Full Body")){Object.keys(lastTrained).forEach(m=>updateIfNewer(m))}});muscleRecoveryData=lastTrained;const applyColor=(elementIds,muscleName)=>{const lastDate=lastTrained[muscleName];let color='#00f2a7';if(lastDate){const diffTime=Math.abs(today-lastDate);const diffDays=Math.ceil(diffTime/(1000*60*60*24));if(diffDays<=1)color='#ff4d4d';else if(diffDays<=3)color='#FFD700'}
elementIds.forEach(id=>{const el=document.getElementById(id);if(el){el.style.backgroundColor=color;el.style.boxShadow=`0 0 15px ${color}`}})};applyColor(['zone-chest'],'صدر');applyColor(['zone-abs'],'بطن');applyColor(['zone-shoulders-l','zone-shoulders-r'],'أكتاف');applyColor(['zone-arms-l','zone-arms-r'],'أذرع');applyColor(['zone-legs'],'أرجل')}
function showMuscleStatus(muscleName){const lastDate=muscleRecoveryData[muscleName];const muscleNamesEn={'صدر':'Chest','أكتاف':'Shoulders','أذرع':'Arms','أرجل':'Legs','بطن':'Core','ظهر':'Back'};const localizedMuscle=currentLang==='en'?(muscleNamesEn[muscleName]||muscleName):muscleName;if(!lastDate){const notTrainedMsg=currentLang==='en'?`The ${localizedMuscle} has not been trained yet.`:`لم يتم تدريب عضلة الـ ${localizedMuscle} بعد.`;showToast(notTrainedMsg);return}
const today=new Date();today.setHours(0,0,0,0);const diffTime=Math.abs(today-lastDate);const diffDays=Math.ceil(diffTime/(1000*60*60*24));let statusMsg="";if(currentLang==='en'){if(diffDays===0)statusMsg="Trained today. Muscle is highly exhausted.";else if(diffDays===1)statusMsg="Trained yesterday. Muscle is exhausted.";else if(diffDays<=3)statusMsg=`Trained ${diffDays} days ago. Muscle is recovering.`;else statusMsg=`Trained ${diffDays} days ago. Muscle is fully recovered.`}else{if(diffDays===0)statusMsg="تم تدريبه اليوم. العضلة مرهقة جداً.";else if(diffDays===1)statusMsg="تم تدريبه البارحة. العضلة مرهقة.";else if(diffDays<=3)statusMsg=`تم تدريبه منذ ${diffDays} أيام. العضلة قيد الاستشفاء.`;else statusMsg=`تم تدريبه منذ ${diffDays} أيام. العضلة متعافية تماماً.`}
showToast(`${localizedMuscle}: ${statusMsg}`)}
function getTranslatedType(savedType){const t_ar=translations.ar;const t_en=translations.en;let foundKey=null;for(const[key,value]of Object.entries(t_ar)){if(value===savedType){foundKey=key;break}}
if(!foundKey){for(const[key,value]of Object.entries(t_en)){if(value===savedType){foundKey=key;break}}}
if(foundKey&&translations[currentLang][foundKey]){return translations[currentLang][foundKey]}
return savedType}
function renderWorkoutLog(){let workoutHistory=[];try{workoutHistory=JSON.parse(localStorage.getItem('userWorkouts'))||[]}catch(e){}
const container=document.getElementById('log-container');const emptyMsg=translations[currentLang||'ar'].empty_log;if(!Array.isArray(workoutHistory)||workoutHistory.length===0){container.innerHTML=`<p style="text-align:center; color: var(--slate); margin-top: 20px;">${emptyMsg}</p>`;return}
container.innerHTML=workoutHistory.map((workout,index)=>{let translatedType=getTranslatedType(workout.type);return `






            <div class="log-card" style="position: relative;">
                <div class="log-header" onclick="toggleLogDetails(${index})" style="display:flex; justify-content: space-between; align-items: center;">
                    <div>
                        <span>${translatedType}</span>
                        <span class="log-date" style="margin-left: 10px;">${workout.date}</span>
                    </div>
                    <!-- زر الحذف -->
                    <button class="remove-log-btn" onclick="event.stopPropagation(); deleteSingleWorkout(${index})" style="background:none; border:none; color:#ff4d4d; cursor:pointer; font-size:1.2rem; margin-top: -5px;">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
                <div id="log-details-${index}" class="log-details" style="display: none;">
                    ${workout.details.map(ex => `<div class="ex-item"><span>${ex.name}</span><span>${ex.reps}Reps|${ex.weight}kg</span></div>`).join('')}
                </div>
            </div>


                <button class="remove-exercise-btn" onclick="deleteSingleWorkout(${index})" style="position: absolute; top: 12px; right: 15px; font-size: 1.2rem; background: none; border: none; color: #ff4d4d; cursor: pointer; transform: translateY(-50%);">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div id="log-details-${index}" class="log-details" style="display: none;">
                ${workout.details.map(ex => `<div class="ex-item"><span>${ex.name}</span><span>${ex.reps}Reps|${ex.weight}kg</span></div>`).join('')}
            </div>
        </div>
    `}).join('')}
function initWorkoutChart(){if(typeof Chart==='undefined')return;let workoutHistory=[];try{workoutHistory=JSON.parse(localStorage.getItem('userWorkouts'))||[]}catch(e){}
const ctx=document.getElementById('workoutChart');const emptyMsg=document.getElementById('chart-empty-msg');const wrapper=document.getElementById('chart-wrapper');if(!ctx)return;if(!Array.isArray(workoutHistory)||workoutHistory.length===0){wrapper.style.display='none';if(emptyMsg)emptyMsg.style.display='block';return}
const maxWeights={};let hasAnyWeight=!1;workoutHistory.forEach(w=>{let t=getTranslatedType(w.type||'تمرين');if(maxWeights[t]===undefined)maxWeights[t]=0;w.details.forEach(ex=>{let wgt=parseFloat(ex.weight);if(!isNaN(wgt)&&wgt>maxWeights[t]){maxWeights[t]=wgt;hasAnyWeight=!0}})});if(!hasAnyWeight){wrapper.style.display='none';if(emptyMsg){emptyMsg.innerText=translations[currentLang||'ar'].add_weights_msg;emptyMsg.style.display='block'}
return}
wrapper.style.display='block';if(emptyMsg)emptyMsg.style.display='none';if(window.workoutChartInstance){window.workoutChartInstance.destroy()}
const chartTitle=currentLang==='en'?'Max Weight Lifted (kg)':'أعلى وزن تم رفعه (kg)';const labelTitle=currentLang==='en'?'Max Weight (kg)':'أعلى وزن (kg)';window.workoutChartInstance=new Chart(ctx.getContext('2d'),{type:'line',data:{labels:Object.keys(maxWeights),datasets:[{label:labelTitle,data:Object.values(maxWeights),borderColor:'#00f2a7',backgroundColor:'rgba(0, 242, 167, 0.15)',pointBackgroundColor:'#0A1429',pointBorderColor:'#00f2a7',pointBorderWidth:3,pointRadius:6,pointHoverRadius:9,fill:!0,tension:0.4}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1},tooltip:{titleFont:{family:'var(--font-main)',size:14},bodyFont:{family:'var(--font-main)',size:14,weight:'bold'},callbacks:{label:function(context){return(currentLang==='en'?' Max: ':' أعلى وزن: ')+context.parsed.y+' kg'}}}},scales:{y:{beginAtZero:!0,title:{display:!0,text:chartTitle,color:'#8892b0',font:{family:'var(--font-main)'}},ticks:{color:'#8892b0',font:{family:'var(--font-main)',weight:'bold'}},grid:{color:'rgba(255, 255, 255, 0.05)'}},x:{ticks:{color:'white',font:{family:'var(--font-main)',weight:'bold'}},grid:{display:!1}}}}})}
function toggleLogDetails(index){const details=document.getElementById(`log-details-${index}`);if(details){if(details.style.display==='none'||details.style.display===''){details.style.display='flex'}else{details.style.display='none'}}}
document.addEventListener('DOMContentLoaded',()=>{initStardustCanvas();applyLanguage();initScrollAnimations();if(document.getElementById('hero')){initIndexPage()}else if(document.getElementById('main-content-area')){initDashboardPage()}});const allBadges=[{id:'m1',type:'meals',target:1,icon:'<i class="fas fa-apple-alt"></i>',title_ar:'أول قطف',title_en:'First Bite',desc_ar:'سجل أول وجبة صحية',desc_en:'Log your first healthy meal',xp:50},{id:'m50',type:'meals',target:50,icon:'<i class="fas fa-utensils"></i>',title_ar:'الشيف الماستر',title_en:'Master Chef',desc_ar:'سجل 50 وجبة صحية',desc_en:'Log 50 healthy meals',xp:500},{id:'w1',type:'workouts',target:1,icon:'<i class="fas fa-running"></i>',title_ar:'كسر الجليد',title_en:'Ice Breaker',desc_ar:'سجل أول تمرين لك',desc_en:'Log your first workout',xp:50},{id:'w50',type:'workouts',target:50,icon:'<i class="fas fa-dumbbell"></i>',title_ar:'مدمن حديد',title_en:'Iron Addict',desc_ar:'سجل 50 تمريناً',desc_en:'Log 50 workouts',xp:800},{id:'mw100',type:'maxWeight',target:100,icon:'<i class="fas fa-weight-hanging"></i>',title_ar:'نادي الـ 100',title_en:'100 Club',desc_ar:'ارفع 100 كغ',desc_en:'Lift 100 kg',xp:500},{id:'s7',type:'streak',target:7,icon:'<i class="fas fa-fire"></i>',title_ar:'الأسبوع الناري',title_en:'Fire Week',desc_ar:'ستريك 7 أيام',desc_en:'7-day streak',xp:300},{id:'dl50',type:'dl_combo',target:50,icon:'<i class="fas fa-hand-fist"></i>',title_ar:'قبضة الموت',title_en:'Death Grip',desc_ar:'كومبو 50 بالديدليفت',desc_en:'50 Combo in Deadlift',xp:200},{id:'dl100',type:'dl_combo',target:100,icon:'<i class="fas fa-bolt"></i>',title_ar:'البرق',title_en:'The Bolt',desc_ar:'كومبو 100 بالديدليفت',desc_en:'100 Combo in Deadlift',xp:400},{id:'dl200',type:'dl_combo',target:200,icon:'<i class="fas fa-meteor"></i>',title_ar:'النيزك',title_en:'The Meteor',desc_ar:'كومبو 200 بالديدليفت',desc_en:'200 Combo in Deadlift',xp:800},{id:'dl400',type:'dl_combo',target:400,icon:'<i class="fas fa-skull-crossbones"></i>',title_ar:'المنتقم',title_en:'The Avenger',desc_ar:'كومبو 400 بالديدليفت',desc_en:'400 Combo in Deadlift',xp:1500},{id:'dl600',type:'dl_combo',target:600,icon:'<i class="fas fa-dragon"></i>',title_ar:'ملك التنانين',title_en:'Dragon King',desc_ar:'كومبو 600 بالديدليفت (جنون!)',desc_en:'600 Combo in Deadlift (Insane!)',xp:3000},{id:'sq200',type:'sq_score',target:200,icon:'<i class="fas fa-yin-yang"></i>',title_ar:'توازن النينجا',title_en:'Ninja Balance',desc_ar:'200 نقطة بالسكوات',desc_en:'200 Points in Squat',xp:200},{id:'sq300',type:'sq_score',target:300,icon:'<i class="fas fa-gem"></i>',title_ar:'الجوهرة',title_en:'The Gem',desc_ar:'300 نقطة بالسكوات',desc_en:'300 Points in Squat',xp:350},{id:'sq400',type:'sq_score',target:400,icon:'<i class="fas fa-crown"></i>',title_ar:'توازن مطلق',title_en:'Pure Balance',desc_ar:'400 نقطة بالسكوات',desc_en:'400 Points in Squat',xp:500},{id:'xp5000',type:'xpTotal',target:5000,icon:'<i class="fas fa-vault"></i>',title_ar:'خزنة النقاط',title_en:'XP Vault',desc_ar:'اجمع 5000 نقطة إجمالاً',desc_en:'Collect 5000 total XP',xp:1000},{id:'lvl10',type:'levelReach',target:10,icon:'<i class="fas fa-rocket"></i>',title_ar:'انطلاق الصاروخ',title_en:'Rocket Launch',desc_ar:'وصلت للمستوى 10',desc_en:'Reach Level 10',xp:1000},{id:'morning_warrior',type:'morning',target:1,icon:'<i class="fas fa-sun"></i>',title_ar:'طير الصبح',title_en:'Early Bird',desc_ar:'سجل تمرينك قبل الساعة 8 صباحاً',desc_en:'Log workout before 8 AM',xp:300},{id:'weekend_hero',type:'weekend',target:1,icon:'<i class="fas fa-calendar-check"></i>',title_ar:'بطل العطلة',title_en:'Weekend Hero',desc_ar:'سجل تمرينك يوم الجمعة أو السبت',desc_en:'Log workout on Weekend',xp:300}];function renderBadges(){const container=document.getElementById('badges-container');if(!container)return;const t=translations[currentLang||'ar'];let data=JSON.parse(localStorage.getItem('currentUser')||'{}');let earned=data.earnedBadges||[];if(data.stats&&typeof data.stats.workouts!=='number'){data.stats.workouts=Array.isArray(data.workouts)?data.workouts.length:0}
container.innerHTML=allBadges.map(badge=>{const isUnlocked=earned.includes(badge.id);const title=currentLang==='en'?badge.title_en:badge.title_ar;const desc=currentLang==='en'?badge.desc_en:badge.desc_ar;let progress=data.stats?(data.stats[badge.type]||0):0;if(typeof progress!=='number'){progress=parseInt(progress)||0}
const statusText=isUnlocked?t.badge_completed:`${progress} / ${badge.target}`;return `
            <div class="badge-card ${isUnlocked ? 'unlocked' : 'locked'}">
                <div class="badge-info-btn" onclick="event.stopPropagation(); showBadgeReward('${badge.id}')">
                    <i class="fas fa-info-circle"></i>
                </div>
                <div class="badge-icon">${badge.icon}</div>
                <div class="badge-title">${title}</div>
                <div class="badge-desc">${desc}</div>
                <div class="badge-progress">${statusText}</div>
            </div>`}).join('')}
function showBadgeReward(id){const b=allBadges.find(x=>x.id===id);if(b){const t=translations[currentLang||'ar'];showToast(`${t.reward_text}+${b.xp} XP`)}}
async function updateStat(statName,value,isMax=!1){const user=auth.currentUser;if(!user)return;let savedData=JSON.parse(localStorage.getItem('currentUser')||'{}');if(!savedData.stats)savedData.stats={meals:0,workouts:0,maxWeight:0,streak:0,dl_combo:0,sq_score:0};if(!savedData.earnedBadges)savedData.earnedBadges=[];let oldValue=savedData.stats[statName];if(typeof oldValue!=='number'){if(statName==='workouts'&&Array.isArray(savedData.workouts)){oldValue=savedData.workouts.length}else{oldValue=0}}
if(isMax){if(value>oldValue)savedData.stats[statName]=value}else{savedData.stats[statName]=oldValue+value}
localStorage.setItem('currentUser',JSON.stringify(savedData));firebase.functions().httpsCallable('secureSyncProgress')({stats:savedData.stats}).catch(e=>console.error("Error syncing stats:",e));checkBadges(savedData,user)}
function checkBadges(data,user){let earned=data.earnedBadges||[];let stats=data.stats||{};let newlyEarned=[];allBadges.forEach(badge=>{if(!earned.includes(badge.id)){let userStat=stats[badge.type]||0;if(userStat>=badge.target){earned.push(badge.id);newlyEarned.push(badge)}}});if(newlyEarned.length>0){data.earnedBadges=earned;localStorage.setItem('currentUser',JSON.stringify(data));firebase.functions().httpsCallable('secureSyncProgress')({earnedBadges:earned}).catch(e=>console.error(e));

newlyEarned.forEach((b,index)=>{setTimeout(()=>{const title=currentLang==='en'?b.title_en:b.title_ar;showToast(`🏆 ${currentLang === 'en' ? 'New Achievement' : 'إنجاز جديد'}: ${title}! (+${b.xp} XP)`);addXP(b.xp,'achievement')},index*2000)});


if(document.getElementById('badges-container')){renderBadges()}}}
function openAchievements(){if(window.innerWidth<768)document.getElementById('sidebar').classList.add('collapsed');const mainContent=document.getElementById('main-content-area');if(!mainContent)return;if(!mainContent.dataset.originalContent){mainContent.dataset.originalContent=mainContent.innerHTML}
const title=currentLang==='en'?'Trophy Room':'غرفة الجوائز';const back=currentLang==='en'?'Back':'رجوع';mainContent.innerHTML=`
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
    `;document.getElementById('back-to-dash-btn').onclick=backToDashboard;renderBadges()}



let globalCountriesData=[];async function openProfile(){if(window.innerWidth<768)document.getElementById('sidebar').classList.add('collapsed');const area=document.getElementById('main-content-area');if(!area.dataset.originalContent)area.dataset.originalContent=area.innerHTML;const challengesCard=document.getElementById('home-challenges-card')||document.querySelector('div[onclick="openGameSelection()"]');if(challengesCard)challengesCard.style.display='none';const user=auth.currentUser;let data=JSON.parse(localStorage.getItem('currentUser')||'{}');const t=translations[currentLang||'ar'];const earnedCount=(data.earnedBadges||[]).length;const bio=data.bio||t.bio_placeholder;const userPhoto=data.photoURL||"/Photos/adm.png";const activeCover=data.currentCover||'';const coverHtml=activeCover?`<div class="profile-cover-image" style="background-image: url('${activeCover}');"></div>`:'';const activeBorder=data.currentBorder||'';const activeTitle=data.currentTitle||'';let earnedBadgesHTML=`<p style="text-align: center; color: var(--slate); font-size: 0.8rem; padding: 20px;">${t.no_badges_yet || 'لا توجد أوسمة بعد'}</p>`;if(data.earnedBadges&&data.earnedBadges.length>0&&typeof allBadges!=='undefined'){earnedBadgesHTML=allBadges.filter(b=>data.earnedBadges.includes(b.id)).map(b=>`
                <div class="earned-badge-mini">
                    <div class="badge-icon" style="font-size: 2rem; -webkit-text-stroke: 0px;">${b.icon}</div>
                    <p>${currentLang === 'en' ? b.title_en : b.title_ar}</p>
                </div>
            `).join('')}

let titleHTML='';

if(activeTitle&&typeof storeItemsDB!=='undefined'){const foundTitle=storeItemsDB.titles.find(t=>t.val===activeTitle||t.val_en===activeTitle);if(foundTitle){const isEn=currentLang==='en';const displayTitle=isEn?foundTitle.val_en:foundTitle.val;const badgeContent=isEn?`<i class="${foundTitle.icon}"></i> <span>${displayTitle}</span>`:`<span>${displayTitle}</span> <i class="${foundTitle.icon}"></i>`;titleHTML=`
                <div class="title-badge ${foundTitle.tier}" style="margin-top: 10px; margin-bottom: 5px; transform: scale(1.15);">
                    ${badgeContent}
                </div>`}}
area.innerHTML=`
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





                <div style="display: flex; align-items: center; gap: 10px; justify-content: center;">
                    <h2 id="display-full-name" style="color: white; font-weight: 900; margin: 0;">${data.firstName || ''} ${data.lastName || ''}</h2>
                    <button id="btn-toggle-edit-name" style="background:none; border:none; color:var(--slate); cursor:pointer;"><i class="fa-solid fa-pen-to-square"></i></button>
                </div>
                
                <div id="edit-name-box" style="display: none; margin-top: 10px; gap: 5px; justify-content: center; width: 100%;">
                    <input type="text" id="new-fname" class="input-field" value="${data.firstName || ''}" style="width:100px; margin:0; text-align:center; padding:5px;">
                    <input type="text" id="new-lname" class="input-field" value="${data.lastName || ''}" style="width:100px; margin:0; text-align:center; padding:5px;">
                    <button id="btn-save-name" class="btn-primary" style="padding: 5px 12px; font-size: 0.8rem;">${t.save_name}</button>
                </div>
                

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
                        
<input type="text" id="gym-input" class="input-field" placeholder="${t.gym_placeholder}" value="${data.gym || ''}" style="margin-bottom: 10px; padding: 10px; text-align: center;">

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
            

            <button class="btn-primary" onclick="openInventory()" style="width: 100%; padding: 15px; background: linear-gradient(145deg, rgba(155, 89, 182, 0.2), rgba(0, 0, 0, 0.4)); border-color: #9b59b6; color: #d8b4fe; display: flex; justify-content: space-between; align-items: center; font-weight: 900; box-shadow: 0 0 15px rgba(155, 89, 182, 0.2);">
                <span style="display: flex; align-items: center; gap: 8px;">${currentLang === 'en' ? 'My Inventory' : 'خزنة الغنائم (مخزوني)'} <i class="fa-solid fa-box-open"></i></span>
                <i class="fa-solid fa-chevron-left" style="font-size: 0.8rem;"></i>
            </button>



            
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

            <button class="btn-primary" onclick="openHelpSupport()" style="width: 100%; padding: 15px; background: rgba(255, 255, 255, 0.05); border-color: rgba(255, 255, 255, 0.2); color: white; display: flex; justify-content: space-between; align-items: center;">
                <span style="display: flex; align-items: center; gap: 8px;">${currentLang === 'en' ? 'Help & Support' : 'الدعم والمساعدة'} <i class="fa-solid fa-headset"></i></span>
            </button>

            <button class="btn-primary" onclick="confirmDeleteAccount()" style="width: 100%; padding: 15px; background: rgba(255, 77, 77, 0.05); border-color: rgba(255, 77, 77, 0.3); color: #ff4d4d; display: flex; justify-content: space-between; align-items: center;">
                <span style="display: flex; align-items: center; gap: 8px;">${currentLang === 'en' ? 'Delete Account Permanently' : 'حذف الحساب نهائياً'} <i class="fa-solid fa-user-xmark"></i></span>
            </button>

            <button id="profile-admin-btn" class="btn-primary" onclick="openAdminPanel()" style="display: none; width: 100%; padding: 15px; border-color: #ff9f43; color: #ff9f43; background: rgba(255, 159, 67, 0.05); justify-content: space-between; align-items: center;">
                <span style="display: flex; align-items: center; gap: 8px;">${t.admin_panel || 'لوحة الإدارة'} <i class="fa-solid fa-crown"></i></span>
                <i class="fa-solid fa-chevron-left" style="font-size: 0.8rem;"></i>
            </button>

            <button class="btn-primary" onclick="logoutFromProfile()" style="width: 100%; padding: 15px; border-color: rgba(255, 77, 77, 0.3); color: #ff4d4d; background: rgba(255, 77, 77, 0.05); display: flex; justify-content: center; align-items: center; margin-top: 10px;">
                <span style="display: flex; align-items: center; gap: 8px;">${t.logout || 'تسجيل الخروج'} <i class="fa-solid fa-arrow-right-from-bracket"></i></span>
            </button>
        </div>
    `;document.getElementById('back-to-dash-btn').onclick=backToDashboard;const adminBtn=document.getElementById('profile-admin-btn');if(adminBtn&&user&&user.email==="raedabdi9@gmail.com"){adminBtn.style.display='flex'}
const editBtn=document.getElementById('edit-bio-btn');const saveBtn=document.getElementById('save-bio-btn');const displayBio=document.getElementById('display-bio');const displayLocation=document.getElementById('display-location');const displayGym=document.getElementById('display-gym');const editArea=document.getElementById('bio-edit-area');const countrySelect=document.getElementById('country-select');const citySelect=document.getElementById('city-select');if(globalCountriesData.length===0){countrySelect.innerHTML=`<option>جاري التحميل...</option>`;try{const res=await fetch('https://countriesnow.space/api/v0.1/countries');const json=await res.json();globalCountriesData=json.data}catch(e){console.error(e);countrySelect.innerHTML=`<option value="">فشل التحميل، حاول لاحقاً</option>`}}
if(globalCountriesData.length>0){countrySelect.innerHTML=`<option value="">${t.country_select}</option>`;globalCountriesData.forEach(c=>{const option=document.createElement('option');option.value=c.country;option.innerText=c.country;if(data.country===c.country)option.selected=!0;countrySelect.appendChild(option)});if(data.country)populateCities(data.country,data.city,citySelect,t);}
countrySelect.addEventListener('change',(e)=>populateCities(e.target.value,null,citySelect,t));if(editBtn){editBtn.onclick=()=>{displayBio.style.display='none';displayLocation.style.display='none';displayGym.style.display='none';editBtn.style.display='none';editArea.style.display='block'}}
if(saveBtn){saveBtn.onclick=async()=>{const newBio=document.getElementById('bio-input').value.trim();const newGym=document.getElementById('gym-input').value.trim();const newCountry=countrySelect.value;const newCity=citySelect.value;await db.collection('users').doc(user.uid).update({bio:newBio,gym:newGym,country:newCountry,city:newCity});data.bio=newBio;data.gym=newGym;data.country=newCountry;data.city=newCity;localStorage.setItem('currentUser',JSON.stringify(data));displayBio.innerText=`"${newBio || t.bio_placeholder}"`;displayLocation.innerText=`📍 ${newCountry || t.undefined_country} - ${newCity || t.undefined_city}`;displayGym.innerHTML=`<i class="fa-solid fa-dumbbell"></i> ${newGym || t.no_gym}`;displayBio.style.display='block';displayLocation.style.display='block';displayGym.style.display='block';editBtn.style.display='inline-block';editArea.style.display='none';showToast("✅ تم حفظ البروفايل بنجاح!")};const btnToggleName=document.getElementById('btn-toggle-edit-name');const nameEditBox=document.getElementById('edit-name-box');const nameDisplay=document.getElementById('display-full-name');btnToggleName.onclick=()=>{nameEditBox.style.display='flex';nameDisplay.style.display='none'};document.getElementById('btn-save-name').onclick=async()=>{const now=Date.now();const lastUpdate=data.lastNameUpdate||0;const thirtyDays=30*24*60*60*1000;if(now-lastUpdate<thirtyDays){const daysLeft=Math.ceil((thirtyDays-(now-lastUpdate))/(1000*60*60*24));showToast(`${t.name_cooldown} (${daysLeft}d left)`);return}
const f=document.getElementById('new-fname').value.trim();const l=document.getElementById('new-lname').value.trim();if(!f||!l)return;await db.collection('users').doc(user.uid).update({firstName:f,lastName:l,lastNameUpdate:now});data.firstName=f;data.lastName=l;data.lastNameUpdate=now;localStorage.setItem('currentUser',JSON.stringify(data));openProfile();showToast(t.profile_save_success)};if(saveBtn){saveBtn.onclick=async()=>{const now=Date.now();const lastLocUpdate=data.lastLocationUpdate||0;const oneDay=24*60*60*1000;const cityChanged=(countrySelect.value!==data.country||citySelect.value!==data.city);if(cityChanged&&(now-lastLocUpdate<oneDay)){const hrsLeft=Math.ceil((oneDay-(now-lastLocUpdate))/(1000*60*60));showToast(`${t.location_cooldown} (${hrsLeft}h left)`);return}
const updates={bio:document.getElementById('bio-input').value.trim(),gym:document.getElementById('gym-input').value.trim(),country:countrySelect.value,city:citySelect.value};if(cityChanged)updates.lastLocationUpdate=now;await db.collection('users').doc(user.uid).update(updates);Object.assign(data,updates);localStorage.setItem('currentUser',JSON.stringify(data));openProfile();showToast(t.profile_save_success)}}}
function populateCities(selectedCountry,selectedCity,citySelectElement,t){citySelectElement.innerHTML=`<option value="">${t.city_select}</option>`;if(!selectedCountry){citySelectElement.disabled=!0;return}
const countryData=globalCountriesData.find(c=>c.country===selectedCountry);if(countryData&&countryData.cities){citySelectElement.disabled=!1;countryData.cities.forEach(city=>{const option=document.createElement('option');option.value=city;option.innerText=city;if(selectedCity===city)option.selected=!0;citySelectElement.appendChild(option)})}}}
window.openHelpSupport=function(){try{document.body.style.overflow='hidden';const safeLang=typeof currentLang!=='undefined'?currentLang:(localStorage.getItem('lang')||'ar');const isEn=safeLang==='en';let helpModal=document.getElementById('advanced-help-modal');if(!helpModal){const html=`
            <div id="advanced-help-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); z-index: 1000000; align-items: center; justify-content: center; padding: 15px; box-sizing: border-box;">
                
                <div style="background: linear-gradient(145deg, #112240, #0a192f); border: 1px solid #00f2a7; border-radius: 20px; width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; position: relative; padding: 30px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); animation: modalFadeIn 0.3s ease;">
                    
                    <button onclick="closeAdvancedHelp()" style="position: absolute; top: 15px; right: 20px; background: transparent; border: none; color: #8892b0; font-size: 2.2rem; cursor: pointer; z-index: 10;">&times;</button>
                    
                    <h2 style="color: #00f2a7; font-weight: 900; margin-bottom: 25px; text-align: center; font-family: 'Cairo', sans-serif;">
                        <i class="fa-solid fa-headset"></i> ${isEn ? 'Help Center' : 'مركز المساعدة'}
                    </h2>
                    
                    <div style="display: flex; gap: 10px; margin-bottom: 25px;">
                        <button id="adv-faq-tab" onclick="switchAdvHelpTab('faq')" style="flex: 1; padding: 12px; border-radius: 10px; font-weight: bold; border: 1px solid #00f2a7; background: rgba(0,242,167,0.1); color: #00f2a7; cursor: pointer;">${isEn ? 'FAQs' : 'الأسئلة الشائعة'}</button>
                        <button id="adv-contact-tab" onclick="switchAdvHelpTab('contact')" style="flex: 1; padding: 12px; border-radius: 10px; font-weight: bold; border: 1px solid transparent; background: rgba(255,255,255,0.05); color: #8892b0; cursor: pointer;">${isEn ? 'Contact Us' : 'تواصل معنا'}</button>
                    </div>

                    <div id="adv-faq-section" style="display: block;">
                        <div id="adv-faq-container" style="display: flex; flex-direction: column; gap: 12px;">
                            </div>
                    </div>

                    <div id="adv-contact-section" style="display: none;">
                        <form id="adv-contact-form" onsubmit="submitAdvancedContact(event)">
                            <input type="email" id="adv-contact-email" placeholder="${isEn ? 'Your Email' : 'بريدك الإلكتروني'}" required style="width: 100%; padding: 14px; margin-bottom: 15px; border-radius: 10px; background: rgba(0,0,0,0.2); border: 1px solid #8892b0; color: white;">
                            <textarea id="adv-contact-message" placeholder="${isEn ? 'Write your message...' : 'اكتب رسالتك هنا...'}" rows="5" required style="width: 100%; padding: 14px; margin-bottom: 15px; border-radius: 10px; background: rgba(0,0,0,0.2); border: 1px solid #8892b0; color: white; resize: none;"></textarea>
                            <button type="submit" id="adv-contact-submit-btn" style="width: 100%; padding: 15px; border-radius: 10px; background: #00f2a7; color: #0a192f; font-weight: 900; border: none; cursor: pointer;">
                                <i class="fa-solid fa-paper-plane"></i> ${isEn ? 'Send Message' : 'إرسال الرسالة'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            <style>
                @keyframes modalFadeIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
            </style>
            `;document.body.insertAdjacentHTML('beforeend',html);helpModal=document.getElementById('advanced-help-modal');populateAdvancedFAQs();if(typeof auth!=='undefined'&&auth.currentUser){document.getElementById('adv-contact-email').value=auth.currentUser.email}}
helpModal.style.setProperty('display','flex','important')}catch(err){console.error("Help System Error:",err)}};window.closeAdvancedHelp=function(){const modal=document.getElementById('advanced-help-modal');if(modal){modal.style.setProperty('display','none','important');document.body.style.overflow='auto'}};window.switchAdvHelpTab=function(tab){const faqBtn=document.getElementById('adv-faq-tab');const contactBtn=document.getElementById('adv-contact-tab');const faqSec=document.getElementById('adv-faq-section');const contactSec=document.getElementById('adv-contact-section');if(tab==='faq'){faqBtn.style.color='#00f2a7';faqBtn.style.background='rgba(0,242,167,0.1)';faqBtn.style.borderColor='#00f2a7';contactBtn.style.color='#8892b0';contactBtn.style.background='rgba(255,255,255,0.05)';contactBtn.style.borderColor='transparent';faqSec.style.display='block';contactSec.style.display='none'}else{contactBtn.style.color='#00f2a7';contactBtn.style.background='rgba(0,242,167,0.1)';contactBtn.style.borderColor='#00f2a7';faqBtn.style.color='#8892b0';faqBtn.style.background='rgba(255,255,255,0.05)';faqBtn.style.borderColor='transparent';contactSec.style.display='block';faqSec.style.display='none'}};window.submitAdvancedContact=async function(e){e.preventDefault();const btn=document.getElementById('adv-contact-submit-btn');const email=document.getElementById('adv-contact-email').value;const msg=document.getElementById('adv-contact-message').value;const isEn=(typeof currentLang!=='undefined'?currentLang:'ar')==='en';btn.disabled=!0;btn.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i>';try{await db.collection('contact_messages').add({uid:(auth.currentUser?auth.currentUser.uid:'Guest'),email:email,message:msg,timestamp:firebase.firestore.FieldValue.serverTimestamp(),status:'unread',source:'dashboard'});alert(isEn?"Message Sent!":"تم الإرسال بنجاح!");closeAdvancedHelp()}catch(err){alert(isEn?"Error!":"حدث خطأ!")}finally{btn.disabled=!1;btn.innerHTML=`<i class="fa-solid fa-paper-plane"></i> ${isEn ? 'Send Message' : 'إرسال الرسالة'}`}};window.populateAdvancedFAQs=function(){const container=document.getElementById('adv-faq-container');const isEn=(typeof currentLang!=='undefined'?currentLang:'ar')==='en';let faqsList=(typeof appFAQs!=='undefined')?appFAQs:[];container.innerHTML=faqsList.map(faq=>`
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden; margin-bottom: 8px;">
            <button onclick="const content = this.nextElementSibling; content.style.display = content.style.display === 'block' ? 'none' : 'block';" style="width: 100%; text-align: ${isEn ? 'left' : 'right'}; padding: 15px; background: transparent; border: none; color: white; font-weight: bold; cursor: pointer; display: flex; justify-content: space-between;">
                <span>${isEn ? faq.q_en : faq.q_ar}</span>
                <i class="fa-solid fa-chevron-down" style="color: #00f2a7;"></i>
            </button>
            <div style="display: none; padding: 0 15px 15px; color: #8892b0; font-size: 0.9rem; line-height: 1.6;">
                ${isEn ? faq.a_en : faq.a_ar}
            </div>
        </div>
    `).join('')};window.confirmDeleteAccount=async function(){const isEn=(typeof currentLang!=='undefined'?currentLang:(localStorage.getItem('lang')||'ar'))==='en';const user=auth.currentUser;if(!user){alert(isEn?"No active user found!":"لم يتم العثور على مستخدم نشط!");return}
const confirmWord=isEn?"CONFIRM":"تأكيد";const titleMsg=isEn?`🚨 WARNING: This will permanently delete your entire progress and data.\n\nTo proceed, please type "${confirmWord}" in the box below:`:`🚨 تحذير: سيتم مسح جميع بياناتك وتقدمك نهائياً من النظام.\n\nللمتابعة، يرجى كتابة كلمة "${confirmWord}" في المربع أدناه:`;const userInput=prompt(titleMsg);if(userInput===null)return;if(userInput.trim()!==confirmWord){alert(isEn?"Verification failed! Word doesn't match.":"فشل التحقق! الكلمة غير مطابقة.");return}
try{const uid=user.uid;showToast(isEn?"Processing permanent deletion...":"جاري تنفيذ الحذف النهائي...");const userDoc=await db.collection('users').doc(uid).get();if(userDoc.exists){const userData=userDoc.data();if(userData.myFriendsList){for(const friend of userData.myFriendsList){try{const friendRef=db.collection('users').doc(friend.id);const fDoc=await friendRef.get();if(fDoc.exists){const newList=fDoc.data().myFriendsList.filter(f=>f.id!==uid);await friendRef.update({myFriendsList:newList})}}catch(e){}}}
if(userData.clanId){try{const clanRef=db.collection('clans').doc(userData.clanId);const clanDoc=await clanRef.get();if(clanDoc.exists){let members=clanDoc.data().members||[];let updatedMembers=members.filter(m=>m.uid!==uid);if(clanDoc.data().leaderId===uid){if(updatedMembers.length>0){await clanRef.update({members:updatedMembers,leaderId:updatedMembers[0].uid})}else{await clanRef.delete()}}else{await clanRef.update({members:updatedMembers})}}}catch(e){}}}
const pendingSnap=await db.collection('pending_workouts').where('userId','==',uid).get();for(const doc of pendingSnap.docs){if(doc.data().videoUrl){try{await storage.refFromURL(doc.data().videoUrl).delete()}catch(e){}}
await doc.ref.delete()}
await db.collection('users').doc(uid).delete();await user.delete();localStorage.clear();alert(isEn?"Your account has been completely wiped. Farewell!":"تم مسح حسابك بالكامل. وداعاً أيها البطل!");window.location.href='index.html'}catch(error){console.error("Delete Error:",error);if(error.code==='auth/requires-recent-login'){alert(isEn?"Security Timeout: Please logout, login again, and retry deletion.":"فحص أمني: يرجى تسجيل الخروج والدخول مجدداً ثم المحاولة مرة أخرى.")}else{alert(isEn?"An error occurred during deletion.":"حدث خطأ أثناء محاولة الحذف.")}}};window.toggleNotifications=async function(event){event.stopPropagation();const dropdown=document.getElementById('notif-dropdown');dropdown.classList.toggle('show');if(Notification.permission!=='granted'&&Notification.permission!=='denied'){await requestNotificationPermission()}}
document.addEventListener('click',function(event){const dropdown=document.getElementById('notif-dropdown');const notifBtn=document.getElementById('notif-btn');if(dropdown&&dropdown.classList.contains('show')){if(!dropdown.contains(event.target)&&!notifBtn.contains(event.target)){dropdown.classList.remove('show')}}});function openFriendsCenter(){if(window.innerWidth<768)document.getElementById('sidebar').classList.add('collapsed');const mainContent=document.getElementById('main-content-area');if(!mainContent)return;if(!mainContent.dataset.originalContent){mainContent.dataset.originalContent=mainContent.innerHTML}
const t=translations[currentLang||'ar'];mainContent.innerHTML=`
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
<!-- 3. تبويب البحث -->
            <div id="friends-tab-search" class="perf-tab-content" style="display: none;">
                <div class="search-bar-container" style="display: flex; gap: 10px; margin-bottom: 20px;">
                    <input type="text" id="friend-search-input" class="search-input" placeholder="${t.search_placeholder}" autocomplete="off" style="flex: 1;">
                    <!-- 🔍 هذا هو الزر الذي كان ناقصاً -->
                    <button class="btn-primary" onclick="searchPlayerByID()" style="padding: 0 20px; border-radius: 12px;">
                        <i class="fa-solid fa-magnifying-glass"></i>
                    </button>
                </div>
                <div id="search-result-container">
                    <div class="empty-notif"><i class="fa-solid fa-id-card"></i><p>${t.enter_id_msg}</p></div>
                </div>
            </div>

        </section>
    `;document.getElementById('back-to-dash-btn').onclick=backToDashboard;renderMyFriends();loadLeaderboardData()}
document.addEventListener('keyup',function(e){if(e.target&&e.target.id==='friend-search-input'){if(e.key==='Enter'){searchPlayerByID()}}});async function searchPlayerByID(){const searchInput=document.getElementById('friend-search-input').value.trim().toUpperCase();const resultContainer=document.getElementById('search-result-container');const t=translations[currentLang||'ar'];if(!searchInput)return;resultContainer.innerHTML=`<div class="empty-notif"><i class="fa-solid fa-spinner fa-spin"></i><p>${t.searching}</p></div>`;try{const snapshot=await db.collection('users').where('shortID','==',searchInput).limit(1).get();if(snapshot.empty){resultContainer.innerHTML=`<div class="empty-notif" style="color:#ff4d4d;"><i class="fa-solid fa-triangle-exclamation"></i><p>${t.player_not_found}</p></div>`;return}
let targetUser=null;let targetUid=null;snapshot.forEach(doc=>{targetUser=doc.data();targetUid=doc.id});if(auth.currentUser&&targetUid===auth.currentUser.uid){resultContainer.innerHTML=`<div class="empty-notif"><i class="fa-solid fa-face-laugh-squint"></i><p>${t.own_id_msg}</p></div>`;return}
const userPhoto=targetUser.photoURL||"/Photos/adm.png";const earnedCount=(targetUser.earnedBadges||[]).length;resultContainer.innerHTML=`
            <section class="profile-header" style="animation: fadeIn 0.4s; padding: 20px; max-width: 400px; margin: auto;">
                <img src="${userPhoto}" style="width: 100px; height: 100px; border-radius: 50%; border: 3px solid var(--primary-color);">
                <h2 style="color: white; font-weight: 900; margin-top: 10px;">${targetUser.firstName} ${targetUser.lastName}</h2>
                <p style="color: var(--slate); font-size: 0.85rem; font-style: italic;">"${targetUser.bio || '💪'}"</p>
                <div class="profile-stats-row" style="margin-bottom: 20px; width: 100%; gap: 10px;">
                    <div class="mini-stat-card"><h4>LEVEL</h4><p>${targetUser.rank || 1}</p></div>
                    <div class="mini-stat-card"><h4>BADGES</h4><p>${earnedCount}</p></div>
                    <div class="mini-stat-card"><h4>STREAK</h4><p>${targetUser.streak || 1}d</p></div>
                </div>
                <button class="btn-primary" onclick="sendFriendRequest('${targetUid}')" style="width: 100%;">
                    <i class="fa-solid fa-user-plus"></i> ${t.send_request}
                </button>
            </section>
        `}catch(error){resultContainer.innerHTML=`<div class="empty-notif" style="color:#ff4d4d;"><p>⚠️ حدث خطأ</p></div>`}}
async function loadLeaderboardData(){const listDiv=document.getElementById('leaderboard-list');if(!listDiv)return;setTimeout(()=>{if(typeof updateQuestProgress==='function')updateQuestProgress('leaderboard',1);},1000);try{const snapshot=await db.collection('users').orderBy('xp','desc').limit(50).get();listDiv.innerHTML='';let rank=0;snapshot.forEach((doc)=>{rank++;const data=doc.data();const rankEmoji=rank===1?"🥇":rank===2?"🥈":rank===3?"🥉":`<b>#${rank}</b>`;const userPhoto=data.photoURL||'/Photos/adm.png';const safeName=(data.firstName||'Player').replace(/</g,"&lt;");const row=document.createElement('div');const borderSide=currentLang==='ar'?'border-right':'border-left';row.style.cssText=`display: flex; justify-content: space-between; align-items: center; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 12px; ${borderSide}: 4px solid ${rank <= 3 ? 'var(--primary-color)' : 'transparent'}; transition: 0.3s;`;const userLevel=data.rank||Math.floor((data.xp||0)/500)+1;const lvlText=currentLang==='en'?'Lvl':'مستوى';row.innerHTML=`
                <div style="display: flex; align-items: center; gap: 15px; cursor: pointer;" onclick="viewPlayerProfile('${doc.id}')">
                    <span style="font-size: 1.2rem; min-width: 30px; text-align: center;">${rankEmoji}</span>
                    <img src="${userPhoto}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
                    <span style="font-weight: 700; color: white;">${safeName}</span>
                </div>
                <div style="text-align: right; direction: ltr; display: flex; flex-direction: column; align-items: flex-end;">
                    <span style="color: var(--primary-color); font-weight: 900; font-size: 1.1rem; letter-spacing: 0.5px; direction: rtl;">${lvlText} ${userLevel}</span>
                    <span style="color: var(--slate); font-size: 0.8rem; font-weight: 600; margin-top: -2px;">${data.xp || 0} XP</span>
                </div>
            `;listDiv.appendChild(row)})}catch(err){listDiv.innerHTML=`<p style="text-align:center; color:#ff4d4d; padding:20px;">حدث خطأ</p>`}}
async function viewPlayerProfile(targetUid){const t=translations[currentLang||'ar'];const lang=currentLang||'ar';const myUserData=JSON.parse(localStorage.getItem('currentUser')||'{}');const myUid=auth.currentUser?auth.currentUser.uid:null;let modal=document.getElementById('player-profile-modal');if(!modal){modal=document.createElement('div');modal.id='player-profile-modal';modal.className='player-profile-modal';document.body.appendChild(modal)}
modal.style.cssText="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background-color: transparent !important; z-index: 999998; display: flex; flex-direction: column; overflow-y: auto; -webkit-tap-highlight-color: transparent; outline: none;";modal.style.display='flex';modal.innerHTML=`

    <div class="modal-stars-overlay"></div> 

    <header class="top-bar" style="position: sticky; top: 0; background: transparent; z-index: 10; border-bottom: 1px solid rgba(0, 242, 167, 0.2);">
        <div class="header-row">
            <button onclick="document.getElementById('player-profile-modal').style.display='none'" class="btn-primary" style="padding: 5px 15px; -webkit-tap-highlight-color: transparent;">${t.back}</button>
            <h1 style="margin: 0 15px; color: white;">${t.hero_profile}</h1>
        </div>
    </header>
    <div style="padding: 20px; max-width: 600px; margin: 0 auto; width: 100%; padding-bottom: 50px;">
        <!-- ... محتوى البروفايل ... -->
    </div>
`;try{const doc=await db.collection('users').doc(targetUid).get();if(!doc.exists){modal.style.display='none';return}
const data=doc.data();const earnedCount=(data.earnedBadges||[]).length;const bio=data.bio||"💪";const userPhoto=data.photoURL||"/Photos/adm.png";const activeCover=data.currentCover||'';const coverHtml=activeCover?`<div class="profile-cover-image" style="background-image: url('${activeCover}'); opacity: 0.6;"></div>`:'';const activeBorder=data.currentBorder||'';const activeTitle=data.currentTitle||'';let titleHTML='';if(activeTitle&&typeof storeItemsDB!=='undefined'){const foundTitle=storeItemsDB.titles.find(t=>t.val===activeTitle||t.val_en===activeTitle);if(foundTitle){const isEn=currentLang==='en';const displayTitle=isEn?foundTitle.val_en:foundTitle.val;const badgeContent=isEn?`<i class="${foundTitle.icon}"></i> <span>${displayTitle}</span>`:`<span>${displayTitle}</span> <i class="${foundTitle.icon}"></i>`;titleHTML=`
                    <div class="title-badge ${foundTitle.tier}" style="margin-top: 10px; margin-bottom: 5px; transform: scale(1.15);">
                        ${badgeContent}
                    </div>`}}
let earnedBadgesHTML=`<p style="text-align: center; color: var(--slate); font-size: 0.8rem; padding: 20px;">${t.no_badges_yet || 'لا توجد أوسمة'}</p>`;if(data.earnedBadges&&data.earnedBadges.length>0){earnedBadgesHTML=allBadges.filter(b=>data.earnedBadges.includes(b.id)).map(b=>`
                    <div class="earned-badge-mini">
                        <div class="badge-icon" style="font-size: 2rem; -webkit-text-stroke: 0px;">${b.icon}</div>
                        <p>${currentLang === 'en' ? b.title_en : b.title_ar}</p>
                    </div>
                `).join('')}
let friendActionHTML='';if(myUid&&myUid!==targetUid){const myFriends=myUserData.myFriendsList||[];const isFriend=myFriends.some(f=>f.id===targetUid);if(isFriend){const friendBtnText=lang==='en'?'<i class="fa-solid fa-user-check"></i> Friend ':'<i class="fa-solid fa-user-check"></i> صديق';const unfriendBtnText=lang==='en'?'<i class="fa-solid fa-user-minus"></i> Unfriend':'إزالة الصديق <i class="fa-solid fa-user-minus"></i>';friendActionHTML=`
                    <div style="display: flex; gap: 10px; margin-top: 15px; width: 100%; align-items: center;">
                        <button class="btn-primary" style="flex: 1; height: 50px; background: rgba(0, 242, 167, 0.1); border-color: #00f2a7; color: #00f2a7; cursor: default; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 0; -webkit-tap-highlight-color: transparent;">
                            ${friendBtnText}
                        </button>
                        <div style="position: relative; height: 50px; display: flex; align-items: center;">
                            <button class="member-menu-trigger member-menu-trigger-btn" style="height: 50px; width: 45px; display: flex; align-items: center; justify-content: center; margin: 0; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: white; -webkit-tap-highlight-color: transparent;" onclick="toggleMemberMenu('profile-friend-menu', this)">
                                <i class="fa-solid fa-ellipsis-vertical"></i>
                            </button>
                            <div id="profile-friend-menu" class="member-action-menu-content" style="position: absolute; top: 55px; left: 0; background: rgba(10, 20, 41, 0.98); border: 1px solid rgba(255, 77, 77, 0.3); border-radius: 12px; padding: 5px; box-shadow: 0px 10px 30px rgba(0,0,0,0.8); min-width: 150px; z-index: 1000;">
                                <div class="dropdown-item-pro danger" onclick="deleteFriendFromProfile('${targetUid}')" style="padding: 12px; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; gap: 10px; color: #ff4d4d; cursor: pointer; border-radius: 8px; white-space: nowrap; -webkit-tap-highlight-color: transparent;">
                                    ${unfriendBtnText}
                                </div>
                            </div>
                        </div>
                    </div>
                `}else{const reqDoc=await db.collection('users').doc(targetUid).collection('notifications').doc('freq_'+myUid).get();if(reqDoc.exists){const reqSentText=lang==='en'?'<i class="fa-solid fa-clock-rotate-left"></i> Request Sent ⏳':'تم الإرسال ⏳ <i class="fa-solid fa-clock-rotate-left"></i>';friendActionHTML=`
                        <button class="btn-primary" style="width: 100%; height: 50px; margin-top: 15px; background: rgba(255,255,255,0.05); border-color: var(--slate); color: var(--slate); cursor: not-allowed; display: flex; align-items: center; justify-content: center; gap: 8px; -webkit-tap-highlight-color: transparent;" disabled>
                            ${reqSentText}
                        </button>
                    `}else{const addFriendText=lang==='en'?`<i class="fa-solid fa-user-plus"></i> Send Friend Request`:`إرسال طلب صداقة <i class="fa-solid fa-user-plus"></i>`;friendActionHTML=`
                        <button class="btn-primary" id="profile-add-friend-btn" style="width: 100%; height: 50px; margin-top: 15px; box-shadow: 0 0 15px rgba(0,242,167,0.2); display: flex; align-items: center; justify-content: center; gap: 8px; -webkit-tap-highlight-color: transparent;" onclick="sendFriendRequest('${targetUid}')">
                            ${addFriendText}
                        </button>
                    `}}}
let clanInfoHTML='';if(data.clanId){const txtClanMember=lang==='en'?'CLAN MEMBER':'عضو في عصابة';clanInfoHTML=`
                <div class="premium-clan-badge" onclick="closeProfileAndOpenClan('${data.clanId}')" style="margin-top:15px; background: rgba(20, 20, 20, 0.3); backdrop-filter: blur(5px); -webkit-tap-highlight-color: transparent;">
                    <div class="clan-badge-content">
                        <div class="clan-badge-icon"><i class="fa-solid fa-crown" style="color: #FFD700;"></i></div>
                        <div class="clan-badge-info">
                            <span class="clan-badge-title">${txtClanMember}</span>
                            <strong id="dynamic-clan-name" class="clan-badge-name"><i class="fa-solid fa-spinner fa-spin" style="font-size: 0.9rem;"></i></strong>
                        </div>
                    </div>
                    <div class="clan-badge-arrow"><i class="fa-solid fa-chevron-left"></i></div>
                </div>
            `;db.collection('clans').doc(data.clanId).get().then(doc=>{const nameEl=document.getElementById('dynamic-clan-name');if(doc.exists&&nameEl)nameEl.innerText=doc.data().name})}else if(myUserData.clanId){const txtInvite=lang==='en'?'Invite to Clan':'دعوة للعصابة';const inviteId=`invite_${myUid}_${targetUid}`;clanInfoHTML=`<button id="clan-invite-btn" class="btn-primary" style="width:100%; height: 50px; margin-top:15px; background: rgba(0, 242, 167, 0.1); border: 1px solid var(--primary-color); color:var(--primary-color); display: flex; align-items: center; justify-content: center; gap: 8px; -webkit-tap-highlight-color: transparent;" onclick="sendClanInvite('${targetUid}')">
                <i class="fa-solid fa-envelope-open-text"></i> ${txtInvite}
            </button>`;db.collection('users').doc(targetUid).collection('notifications').doc(inviteId).get().then(invDoc=>{const btn=document.getElementById('clan-invite-btn');if(invDoc.exists&&btn){btn.disabled=!0;btn.style.opacity="0.5";btn.innerText=lang==='en'?"Invite Sent":"تم إرسال دعوة"}})}
modal.innerHTML=`
            <header class="top-bar" style="position: sticky; top: 0; background: transparent; z-index: 10; border-bottom: 1px solid rgba(0, 242, 167, 0.2);">
                <div class="header-row">
                    <button onclick="document.getElementById('player-profile-modal').style.display='none'" class="btn-primary" style="padding: 5px 15px; -webkit-tap-highlight-color: transparent;">${t.back}</button>
                    <h1 style="margin: 0 15px; color: white;">${t.hero_profile}</h1>
                </div>
            </header>
            <div style="padding: 20px; max-width: 600px; margin: 0 auto; width: 100%; padding-bottom: 50px;">
                <section class="profile-header has-cover" style="position: relative; overflow: hidden; padding-top: ${activeCover ? '0' : '30px'}; margin-bottom: 25px; border-radius: 30px; background: transparent; border: 1px solid rgba(255, 255, 255, 0.1); animation: fadeIn 0.4s;">
                    ${coverHtml}
                    <div class="profile-header-content" style="position: relative; z-index: 2; width: 100%; display: flex; flex-direction: column; align-items: center; padding-top: ${activeCover ? '80px' : '0'};">
                        <div class="avatar-pro-wrapper ${activeBorder}" style="margin-bottom: 15px;">
                            <div id="friend-page-avatar" class="profile-avatar-img" style="background-color: transparent; background-image: url('${userPhoto}'); ${activeBorder ? '' : 'border: 4px solid var(--primary-color);'}"></div>
                        </div>
                        <h2 style="color: white; font-weight: 900; margin-top: 5px; margin-bottom: 2px;">${data.firstName || ''} ${data.lastName || ''}</h2>
                        ${titleHTML}
                        <div class="bio-container" style="margin-top: 10px;">
                            <p class="bio-text">"${bio}"</p>
                            <p style="color: var(--primary-color); font-size: 0.85rem; font-weight: bold; margin-bottom: 5px;">📍 ${data.country || t.undefined_country} - ${data.city || t.undefined_city}</p>
                            <p style="color: var(--slate); font-size: 0.8rem; margin-bottom: 5px;"><i class="fa-solid fa-dumbbell"></i> ${data.gym || t.no_gym}</p>
                            ${friendActionHTML}
                            ${clanInfoHTML}
                        </div>
                    </div>
                </section>
                <h3 style="color: var(--slate); margin-bottom: 15px; font-size: 0.9rem;">${t.stats_summary}</h3>
                <div class="profile-stats-row">
                    <div class="mini-stat-card" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); backdrop-filter: blur(5px);"><h4>LEVEL</h4><p>${data.rank || 1}</p></div>
                    <div class="mini-stat-card" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); backdrop-filter: blur(5px);"><h4>BADGES</h4><p>${earnedCount}</p></div>
                    <div class="mini-stat-card" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); backdrop-filter: blur(5px);"><h4>STREAK</h4><p>${data.streak || 1}d</p></div>
                </div>
                <h3 style="color: var(--slate); margin-bottom: 15px; font-size: 0.9rem; margin-top: 25px;">${t.earned_badges_title}</h3>
                <div class="earned-badges-showcase" style="background: rgba(0,0,0,0.3); border: 1px inset rgba(255,255,255,0.05); backdrop-filter: blur(5px);">${earnedBadgesHTML}</div>
            </div>
        `}catch(error){modal.style.display='none';console.error(error)}}
async function rejectFriendRequest(notifId){const currentUser=auth.currentUser;if(!currentUser)return;try{await db.collection('users').doc(currentUser.uid).collection('notifications').doc(notifId).delete()}catch(error){console.error(error)}}
async function deleteFriend(friendId){const currentUser=auth.currentUser;if(!currentUser)return;const t=translations[currentLang||'ar'];if(confirm(currentLang==='en'?"Remove this hero from your friends?":"متأكد إنك بدك تحذف هالبطل من أصدقائك؟")){try{const doc=await db.collection('users').doc(currentUser.uid).get();let myFriends=doc.data()?.myFriendsList||[];myFriends=myFriends.filter(f=>f.id!==friendId);await db.collection('users').doc(currentUser.uid).update({myFriendsList:myFriends});renderMyFriends();showToast(currentLang==='en'?"Friend removed":"تم حذف الصديق")}catch(error){console.error(error)}}}
window.joinGuildByTag=async function(){const tagInput=document.getElementById('search-guild-tag').value.trim().toUpperCase();const t=translations[currentLang||'ar'];if(tagInput.length<2){showToast(currentLang==='en'?"Enter a valid tag!":"أدخل رمزاً صحيحاً!");return}
const btn=event.target.closest('button');const originalText=btn.innerHTML;btn.disabled=!0;btn.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i>';try{const snapshot=await db.collection('clans').where('tag','==',tagInput).get();if(snapshot.empty){showToast(currentLang==='en'?"Clan not found!":"لم يتم العثور على العصابة!");btn.disabled=!1;btn.innerHTML=originalText;return}
const clanDoc=snapshot.docs[0];const clan=clanDoc.data();const clanId=clanDoc.id;renderClanPreview(clan,clanId,t)}catch(e){console.error(e);showToast(currentLang==='en'?"Search failed!":"فشل البحث!");btn.disabled=!1;btn.innerHTML=originalText}};window.renderClanPreview=async function(clanData,clanId,t){const mainContent=document.getElementById('main-content-area');const area=document.getElementById('guild-content-area')||mainContent;const lang=currentLang||'ar';const currentUser=JSON.parse(localStorage.getItem('currentUser')||'{}');const myUid=auth.currentUser?auth.currentUser.uid:null;if(!area)return;area.innerHTML=`<div style="text-align:center; padding: 50px;"><i class="fa-solid fa-spinner fa-spin fa-3x" style="color:var(--primary-color);"></i></div>`;try{if(!clanData){const doc=await db.collection('clans').doc(clanId).get();if(!doc.exists){area.innerHTML=`<p style="text-align:center; color:red;">${lang === 'en' ? 'Clan not found!' : 'هذه العصابة لم تعد موجودة!'}</p>`;return}
clanData=doc.data()}
const memberCount=clanData.members?clanData.members.length:1;const emblem=clanData.emblem||'fa-solid fa-shield-cat';const score=clanData.score||0;const isFull=memberCount>=50;const isMyClan=currentUser.clanId===clanId;let actionBtnHtml='';if(isMyClan){actionBtnHtml=`<button class="btn-primary" style="width:100%; padding: 12px; font-size: 1.1rem; background: rgba(255, 77, 77, 0.1); color: #ff4d4d; border-color: #ff4d4d;" onclick="leaveGuild('${clanId}')"><i class="fa-solid fa-person-walking-arrow-right"></i> ${lang === 'en' ? 'Leave Clan' : 'مغادرة العصابة'}</button>`}else if(currentUser.clanId){actionBtnHtml=`<button class="btn-primary" style="width:100%; padding: 12px; font-size: 1.1rem; background: rgba(255, 255, 255, 0.1); color: gray; border-color: gray; cursor: not-allowed;" disabled><i class="fa-solid fa-shield-halved"></i> ${lang === 'en' ? 'You are already in a clan' : 'أنت في عصابة بالفعل'}</button>`}else if(isFull){actionBtnHtml=`<button class="btn-primary" style="width:100%; padding: 12px; font-size: 1.1rem; background: rgba(255, 255, 255, 0.1); color: gray; border-color: gray; cursor: not-allowed;" disabled><i class="fa-solid fa-ban"></i> ${lang === 'en' ? 'Clan is Full' : 'العصابة ممتلئة 50/50'}</button>`}else{actionBtnHtml=`<button class="btn-primary" style="width:100%; padding: 12px; font-size: 1.1rem; box-shadow: 0 0 15px rgba(0,242,167,0.3);" onclick="confirmJoinGuild('${clanId}')"><i class="fa-solid fa-handshake-angle"></i> ${lang === 'en' ? 'Join Clan' : 'الانضمام للعصابة'}</button>`}
let membersHtml='';if(clanData.members&&clanData.members.length>0){const sortedMembers=[...clanData.members].sort((a,b)=>{if(a.role==='leader')return-1;if(b.role==='leader')return 1;return(b.xp||0)-(a.xp||0)});sortedMembers.forEach(m=>{const isLeader=m.role==='leader';const roleIcon=isLeader?'<i class="fa-solid fa-crown" style="color: #FFD700; text-shadow: 0 0 5px rgba(255,215,0,0.5);"></i>':'<i class="fa-solid fa-user-ninja" style="color: var(--slate);"></i>';const roleText=isLeader?(lang==='en'?'Leader':'الزعيم'):(lang==='en'?'Member':'عضو');membersHtml+=`
                    <div class="glass-card" onclick="viewPlayerProfile('${m.uid}')" style="margin-bottom: 10px; padding: 12px 15px; display: flex; justify-content: space-between; align-items: center; border-left: 3px solid ${isLeader ? '#FFD700' : 'var(--primary-color)'}; cursor: pointer; transition: 0.2s;" onmouseover="this.style.transform='translateX(-5px)'" onmouseout="this.style.transform='none'">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <div style="font-size: 1.5rem; width: 30px; text-align: center;">${roleIcon}</div>
                            <div>
                                <strong style="color: white; font-size: 1.1rem; display: block;">${m.name}</strong>
                                <span style="font-size: 0.75rem; color: ${isLeader ? '#FFD700' : 'gray'};">${roleText}</span>
                            </div>
                        </div>
                        <div style="text-align: center; background: rgba(0,0,0,0.3); padding: 5px 10px; border-radius: 8px;">
                            <span style="color: var(--primary-color); font-weight: bold; font-size: 1rem; display:block;">${m.xp || 0}</span>
                            <span style="font-size: 0.65rem; color: gray;">XP</span>
                        </div>
                    </div>
                `})}
area.innerHTML=`
            <div style="text-align: center; margin-bottom: 25px; margin-top: 10px;">
                <div style="font-size: 4.5rem; color: ${clanData.emblemColor || 'var(--primary-color)'}; margin-bottom: 10px; text-shadow: 0 10px 20px rgba(0,0,0,0.5);">
                    <i class="${emblem}"></i>
                </div>
                <h2 style="color: white; margin: 0; font-weight: 900; font-size: 2rem; letter-spacing: 1px;">${clanData.name}</h2>
                <span style="background: rgba(255,255,255,0.1); padding: 3px 10px; border-radius: 20px; color: #ccc; font-size: 0.9rem; margin-top: 5px; display: inline-block; border: 1px solid rgba(255,255,255,0.2);">#${clanData.tag}</span>
            </div>

            <div class="glass-card" style="display: flex; justify-content: space-around; text-align: center; margin-bottom: 25px; padding: 15px 10px; background: rgba(20,20,20,0.8); border: 1px solid rgba(255,255,255,0.05);">
                <div>
                    <i class="fa-solid fa-trophy" style="color: #FFD700; font-size: 1.5rem; margin-bottom: 8px;"></i>
                    <div style="color: white; font-weight: 900; font-size: 1.3rem;">${score}</div>
                    <div style="color: gray; font-size: 0.75rem;">${lang === 'en' ? 'Trophies' : 'الكؤوس'}</div>
                </div>
                <div>
                    <i class="fa-solid fa-users" style="color: var(--primary-color); font-size: 1.5rem; margin-bottom: 8px;"></i>
                    <div style="color: white; font-weight: 900; font-size: 1.3rem;">${memberCount}<span style="font-size:0.8rem; color:gray;">/50</span></div>
                    <div style="color: gray; font-size: 0.75rem;">${lang === 'en' ? 'Members' : 'الأعضاء'}</div>
                </div>
                <div>
                    <i class="fa-solid fa-earth-americas" style="color: #4da6ff; font-size: 1.5rem; margin-bottom: 8px;"></i>
                    <div style="color: white; font-weight: 900; font-size: 1.1rem; margin-top: 2px;">${clanData.country || 'Global'}</div>
                    <div style="color: gray; font-size: 0.75rem;">${lang === 'en' ? 'Region' : 'المنطقة'}</div>
                </div>
            </div>

            <div style="margin-bottom: 25px;">
                ${actionBtnHtml}
            </div>

            <div style="display:flex; justify-content:space-between; align-items:flex-end; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; margin-bottom: 15px;">
                <h3 style="color: var(--primary-color); margin: 0; font-size: 1.1rem;">
                    <i class="fa-solid fa-clipboard-list"></i> ${lang === 'en' ? 'Clan Roster' : 'سجل المقاتلين'}
                </h3>
                <span style="color:gray; font-size:0.8rem;">${memberCount} ${lang === 'en' ? 'Warriors' : 'مقاتل'}</span>
            </div>
            
            <div style="max-height: 50vh; overflow-y: auto; padding-right: 5px; padding-bottom: 20px;">
                ${membersHtml}
            </div>
        `}catch(err){console.error("Error rendering clan preview:",err);area.innerHTML=`<p style="text-align:center; color:red;">${lang === 'en' ? 'Error loading clan details.' : 'حدث خطأ أثناء تحميل تفاصيل العصابة.'}</p>`}};window.confirmJoinGuild=async function(clanId){const btn=event.target.closest('button');const originalText=btn.innerHTML;btn.disabled=!0;btn.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i>';try{const user=auth.currentUser;let userData=JSON.parse(localStorage.getItem('currentUser')||'{}');const freshUserDoc=await db.collection('users').doc(user.uid).get();const freshUserData=freshUserDoc.data();if(freshUserData.lastKickedAt&&freshUserData.kickedFromClanId===clanId){const lastKicked=freshUserData.lastKickedAt.toDate();const hoursPassed=(new Date()-lastKicked)/(1000*60*60);if(hoursPassed<24){const waitTime=Math.ceil(24-hoursPassed);showToast(currentLang==='en'?`Banned from this clan! Wait ${waitTime} hours.`:`ممنوع الدخول! انتظر ${waitTime} ساعة لتعود لهذه العصابة.`);btn.disabled=!1;btn.innerHTML=originalText;return}}
const clanRef=db.collection('clans').doc(clanId);const docSnap=await clanRef.get();if(!docSnap.exists)throw new Error("Clan deleted");let clanData=docSnap.data();if(clanData.members.length>=50){showToast(currentLang==='en'?"Clan is full!":"العصابة ممتلئة!");openGuildHub();return}
if(clanData.members.some(m=>m.uid===user.uid)){showToast(currentLang==='en'?"You are already in this clan!":"أنت بالفعل عضو في هذه العصابة!");return}
if(userData.clanId){showToast(currentLang==='en'?"You are already in a clan!":"أنت في عصابة بالفعل!");return}
const newMember={uid:user.uid,name:userData.firstName||'Unknown',role:'member',warReady:!0,xp:userData.xp||0};clanData.members.push(newMember);await clanRef.update({members:clanData.members});userData.clanId=clanId;await db.collection('users').doc(user.uid).update({clanId:clanId});localStorage.setItem('currentUser',JSON.stringify(userData));showToast(currentLang==='en'?"Successfully joined!":"تم الانضمام بنجاح!");openGuildHub()}catch(e){console.error(e);showToast(currentLang==='en'?"Error joining clan!":"خطأ في الانضمام!");btn.disabled=!1;btn.innerHTML=originalText}};window.sendClanInvite=async function(targetUid){const myUid=auth.currentUser.uid;const lang=currentLang||'ar';const btn=event.target.closest('button');if(btn){btn.disabled=!0;btn.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i>'}
try{const userDoc=await db.collection('users').doc(myUid).get();const myData=userDoc.data();if(!myData.clanId)return;const inviteId=`invite_${myUid}_${targetUid}`;const inviteRef=db.collection('users').doc(targetUid).collection('notifications').doc(inviteId);const existingInvite=await inviteRef.get();if(existingInvite.exists){const lastSent=existingInvite.data().timestamp?.toDate();const now=new Date();if(lastSent&&(now-lastSent)<(24*60*60*1000)){showToast(lang==='en'?"Invite already sent today!":"لقد أرسلت دعوة بالفعل لهذا البطل اليوم!");if(btn){btn.innerText=lang==='en'?"Sent Today":"تم الإرسال اليوم";btn.style.opacity="0.5"}
return}}
await inviteRef.set({title:lang==='en'?"Clan Invitation 🛡️":"دعوة لعصابة حديد 🛡️",text:lang==='en'?`Captain ${myData.firstName} invited you!`:`لقد دعاك الكابتن ${myData.firstName} للانضمام!`,type:"clan_invite",clanId:myData.clanId,senderUid:myUid,senderPhoto:myData.photoURL||"/Photos/adm.png",status:'pending',timestamp:firebase.firestore.FieldValue.serverTimestamp()});showToast(lang==='en'?'Invitation sent!':'تم إرسال الدعوة بنجاح!');if(btn){btn.innerText=lang==='en'?"Request Sent":"تم إرسال الطلب";btn.style.borderColor="gray";btn.style.color="gray"}}catch(err){console.error(err);showToast(lang==='en'?'Error sending invite':'حدث خطأ في الإرسال');if(btn)btn.disabled=!1}};window.openClanFromInvite=async function(notifId,clanId){const dropdown=document.getElementById('notif-dropdown');if(dropdown)dropdown.classList.remove('show');const profileModal=document.getElementById('player-profile-modal');if(profileModal)profileModal.style.display='none';const currentUser=auth.currentUser;if(currentUser&&notifId){try{await db.collection('users').doc(currentUser.uid).collection('notifications').doc(notifId).update({status:'seen'})}catch(e){console.error(e)}}
closeProfileAndOpenClan(clanId)};let currentChatUnsubscribe=null;let currentChatId=null;let currentTargetId=null;function createChatModalIfNotExist(){let modal=document.getElementById('chat-modal');const t=translations[currentLang||'ar'];if(!modal){document.body.insertAdjacentHTML('beforeend',`
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
        </div>`)}else if(modal.parentNode!==document.body){document.body.appendChild(modal)}}
function openChat(friendId,friendName,friendImg){const currentUser=auth.currentUser;if(!currentUser)return;const t=translations[currentLang||'ar'];currentTargetId=friendId;createChatModalIfNotExist();document.getElementById('chat-user-name').innerText=friendName;document.getElementById('chat-user-img').src=friendImg;const chatBody=document.getElementById('chat-messages');chatBody.innerHTML=`<p style="text-align:center; color:var(--slate); font-size:0.8rem;">${t.loading_messages}</p>`;document.getElementById('chat-modal').style.display='flex';clearMessageNotifications(friendId);currentChatId=currentUser.uid<friendId?`${currentUser.uid}_${friendId}`:`${friendId}_${currentUser.uid}`;if(currentChatUnsubscribe)currentChatUnsubscribe();const oneDayAgo=new Date();oneDayAgo.setHours(oneDayAgo.getHours()-24);currentChatUnsubscribe=db.collection('chats').doc(currentChatId).collection('messages').where('timestamp','>=',oneDayAgo).orderBy('timestamp','asc').onSnapshot(snapshot=>{chatBody.innerHTML='';if(snapshot.empty){chatBody.innerHTML=`<p style="text-align:center; color:var(--slate); font-size:0.8rem; margin-top:20px;">${t.messages_disappear}</p>`;return}
snapshot.forEach(doc=>{const msg=doc.data();const msgClass=msg.senderId===currentUser.uid?'sent':'received';const msgDiv=document.createElement('div');msgDiv.className=`msg ${msgClass}`;msgDiv.textContent=msg.text;chatBody.appendChild(msgDiv)});chatBody.scrollTop=chatBody.scrollHeight})}
async function clearMessageNotifications(friendId){const currentUser=auth.currentUser;if(!currentUser)return;try{const snapshot=await db.collection('users').doc(currentUser.uid).collection('notifications').where('type','==','message').where('senderId','==',friendId).get();snapshot.forEach(doc=>doc.ref.delete())}catch(e){console.error(e)}}
function closeChat(){document.getElementById('chat-modal').style.display='none';if(currentChatUnsubscribe){currentChatUnsubscribe();currentChatUnsubscribe=null}}
async function sendMessage(){const currentUser=auth.currentUser;const input=document.getElementById('chat-input');const msgText=input.value.trim();if(!msgText||!currentUser||!currentChatId)return;input.value='';updateQuestProgress('chat',1);try{const userDoc=await db.collection('users').doc(currentUser.uid).get();const userData=userDoc.data();const myName=userData.firstName?`${userData.firstName} ${userData.lastName}`:"User";const myPhoto=userData.photoURL||"/Photos/adm.png";await db.collection('chats').doc(currentChatId).collection('messages').add({senderId:currentUser.uid,text:msgText,timestamp:firebase.firestore.FieldValue.serverTimestamp()});await db.collection('users').doc(currentTargetId).collection('notifications').add({type:'message',senderId:currentUser.uid,senderName:myName,senderPhoto:myPhoto,text:msgText,status:'pending',timestamp:firebase.firestore.FieldValue.serverTimestamp()})}catch(error){console.error(error)}}
function handleChatEnter(e){if(e.key==='Enter')sendMessage();}
let currentMapFilter='maxWeight';async function openCityMonster(){if(window.innerWidth<768)document.getElementById('sidebar').classList.add('collapsed');const mainContent=document.getElementById('main-content-area');if(!mainContent)return;if(!mainContent.dataset.originalContent){mainContent.dataset.originalContent=mainContent.innerHTML}
const t=translations[currentLang||'ar'];const currentUserData=JSON.parse(localStorage.getItem('currentUser')||'{}');const userCity=currentUserData.city||'Amman';const userCountry=currentUserData.country||'Jordan';mainContent.innerHTML=`
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
    `;document.getElementById('back-to-dash-btn').onclick=backToDashboard;populateMapCitiesDropdown(userCountry,userCity);document.getElementById('map-city-select').addEventListener('change',(e)=>{loadCityMapData(e.target.value,userCountry)});currentMapFilter='maxWeight';loadCityMapData(userCity,userCountry)}
window.closeProfileAndOpenClan=async function(clanId){const profileModal=document.getElementById('player-profile-modal');if(profileModal){profileModal.style.display='none'}
const mainContent=document.getElementById('main-content-area');const t=translations[currentLang||'ar'];if(!mainContent.dataset.originalContent){const currentHTML=mainContent.innerHTML;if(!currentHTML.includes('id="guild-content-area"')){mainContent.dataset.originalContent=currentHTML}}
mainContent.innerHTML=`
        <header class="top-bar" style="margin-bottom: 20px; position: relative; z-index: 10001;">
            <div class="header-row" style="display:flex; justify-content:space-between; width:100%; align-items: center;">
                <button id="force-back-btn" class="btn-primary" style="padding: 8px 20px; z-index: 10002; cursor: pointer;">
                    ${t.back || 'رجوع'}
                </button>
                <h1 style="margin: 0; font-weight: 900; color: #FFD700; font-size: 1.1rem;">
                    <i class="fa-solid fa-magnifying-glass"></i> ${currentLang === 'en' ? 'Clan Preview' : 'استطلاع العصابة'}
                </h1>
                <div style="width: 40px;"></div> 
            </div>
        </header>
        <section id="guild-content-area" class="performance-container" style="position: relative; z-index: 1;">
            <div style="text-align:center; padding: 50px;"><i class="fa-solid fa-spinner fa-spin fa-3x" style="color:#FFD700;"></i></div>
        </section>
    `;const backBtn=document.getElementById('force-back-btn');if(backBtn){backBtn.onclick=function(){if(typeof backToDashboard==='function'){backToDashboard()}else{window.location.reload()}}}
try{const clanDoc=await db.collection('clans').doc(clanId).get();if(clanDoc.exists){renderClanPreview(clanDoc.data(),clanId,t)}}catch(e){console.error(e)}};function renderGraveyardRows(dataArray){const listDiv=document.getElementById('valhalla-list');const t=translations[currentLang||'ar'];const visitTxt=currentLang==='en'?'VISIT':'زيارة';if(dataArray.length===0){listDiv.innerHTML=`<p style="text-align:center; color:var(--slate); padding:20px;">لا يوجد تطابق في السجلات.</p>`;return}
listDiv.innerHTML=dataArray.map(data=>`
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
    `).join('')}
let selectedGraveAction='respect';let currentGraveListener=null;window.openGraveVisit=function(graveId){const graveData=window.valhallaData.find(g=>g.id===graveId);if(!graveData)return;const mainContent=document.getElementById('main-content-area');const t=translations[currentLang||'ar'];selectedGraveAction='respect';const bgImages=['Photos/dead1.png',];const randomBg=bgImages[Math.floor(Math.random()*bgImages.length)];mainContent.innerHTML=`
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
    `;if(currentGraveListener)currentGraveListener();currentGraveListener=db.collection('fallen_kings').doc(graveId).collection('comments').onSnapshot(snapshot=>{const listDiv=document.getElementById('grave-comments-list');if(!listDiv)return;let respectCount=0;let defaceCount=0;let commentsHtml='';let commentsArray=[];snapshot.forEach(doc=>{const data=doc.data();if(data.action==='respect')respectCount++;else defaceCount++;commentsArray.push({...data,rawTime:data.timestamp?data.timestamp.toMillis():Date.now()})});commentsArray.sort((a,b)=>b.rawTime-a.rawTime);commentsArray.forEach(data=>{const isDeface=data.action==='deface';const icon=isDeface?'<i class="fa-solid fa-skull" style="color: #ff4d4d; text-shadow: 0 0 5px #ff4d4d;"></i>':'<i class="fa-solid fa-seedling" style="color: #00f2a7; text-shadow: 0 0 5px #00f2a7;"></i>';const borderColor=isDeface?'rgba(255, 77, 77, 0.3)':'rgba(0, 242, 167, 0.3)';const bgColor=isDeface?'rgba(255, 77, 77, 0.05)':'rgba(0, 242, 167, 0.05)';const timeStr=data.timestamp?new Date(data.rawTime).toLocaleDateString('en-GB'):t.grave_time_now;commentsHtml+=`
                    <div style="background: ${bgColor}; padding: 12px; border-radius: 8px; border: 1px solid ${borderColor}; animation: fadeIn 0.4s;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                            <span style="color: white; font-weight: bold; font-size: 0.85rem; display: flex; align-items: center; gap: 6px;" dir="auto">
                                <span>${data.userName}</span> ${icon}
                            </span>
                            <span style="color: #8892b0; font-size: 0.7rem;">${timeStr}</span>
                        </div>
                        <p style="color: #ddd; font-size: 0.85rem; margin: 0; line-height: 1.4;" dir="auto">${data.text.replace(/</g, "&lt;")}</p>
                    </div>
                `});commentsHtml+=`
                <div style="background: rgba(255,255,255,0.02); padding: 12px; border-radius: 8px; border: 1px solid #222; margin-top: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                        <span style="color: #FFD700; font-weight: 900; font-size: 0.85rem; display: flex; align-items: center; gap: 6px;" dir="auto">
                            <span>${t.grave_admin_name}</span> <i class="fa-solid fa-seedling" style="color: #00f2a7;"></i>
                        </span>
                    </div>
                    <p style="color: #bbb; font-size: 0.85rem; margin: 0;" dir="auto">${t.grave_admin_msg}</p>
                </div>
            `;listDiv.innerHTML=commentsHtml;updateGraveDynamicBar(respectCount,defaceCount,t)},error=>{console.error("Grave Listen Error: ",error)})};function updateGraveDynamicBar(respect,deface,t){const total=respect+deface;const barRespect=document.getElementById('grave-bar-respect');const barDeface=document.getElementById('grave-bar-deface');const statusText=document.getElementById('grave-dynamic-status');if(!barRespect||!barDeface||!statusText)return;if(total===0){barRespect.style.width='50%';barRespect.innerText='50%';barDeface.style.width='50%';barDeface.innerText='50%';statusText.innerText=currentLang==='en'?'Undiscovered':'لم يزره أحد';statusText.style.color='#8892b0';statusText.style.textShadow='none';return}
const respectPct=Math.round((respect/total)*100);const defacePct=100-respectPct;barRespect.style.width=`${respectPct}%`;barRespect.innerText=`${respectPct}%`;barDeface.style.width=`${defacePct}%`;barDeface.innerText=`${defacePct}%`;if(defacePct>respectPct){statusText.innerText=t.grave_defaced;statusText.style.color='#ff4d4d';statusText.style.textShadow='0 0 10px rgba(255,77,77,0.5)'}else{statusText.innerText=t.grave_respected;statusText.style.color='#00f2a7';statusText.style.textShadow='0 0 10px rgba(0,242,167,0.5)'}}
window.selectGraveAction=function(action){selectedGraveAction=action;const btnRespect=document.getElementById('btn-respect');const btnDeface=document.getElementById('btn-deface');btnRespect.classList.remove('active');btnDeface.classList.remove('active');if(action==='respect')btnRespect.classList.add('active');else btnDeface.classList.add('active')};window.submitGraveComment=async function(graveId){const input=document.getElementById('grave-comment-input');const btn=document.getElementById('submit-comment-btn');const text=input.value.trim();if(!text)return;const user=auth.currentUser;if(!user)return;btn.disabled=!0;const originalText=btn.innerText;btn.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i>';try{const currentUserData=JSON.parse(localStorage.getItem('currentUser')||'{}');const myName=currentUserData.firstName?`${currentUserData.firstName} ${currentUserData.lastName || ''}`.trim():'Player';await db.collection('fallen_kings').doc(graveId).collection('comments').add({userId:user.uid,userName:myName,action:selectedGraveAction,text:text,timestamp:firebase.firestore.FieldValue.serverTimestamp()});input.value='';showToast(currentLang==='en'?"Comment saved successfully!":"تم حفظ التعليق وتحديث القبر!")}catch(error){console.error("Error adding comment: ",error);showToast("❌ حدث خطأ أثناء إرسال التعليق.")}finally{btn.disabled=!1;btn.innerText=originalText}};function generateGraveTabs(t){const isEn=currentLang==='en';const daysEn=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];const daysAr=['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];const daysArr=isEn?daysEn:daysAr;let html=`<button class="grave-date-btn active" onclick="filterGraveyardByDate('all', this)">${t.all_time}</button>`;const today=new Date();for(let i=0;i<7;i++){let d=new Date(today);d.setDate(today.getDate()-i);let dayName=daysArr[d.getDay()];let dayNum=d.getDate();let suffix="th";if(isEn){if(dayNum%10===1&&dayNum!==11)suffix="st";else if(dayNum%10===2&&dayNum!==12)suffix="nd";else if(dayNum%10===3&&dayNum!==13)suffix="rd"}
let label=isEn?`${dayName} ${dayNum}${suffix}`:`${dayName} ${dayNum}`;let dateKey=`${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;html+=`<button class="grave-date-btn" data-date="${dateKey}" onclick="filterGraveyardByDate('${dateKey}', this)">${label}</button>`}
return html}
window.currentGraveDateFilter='all';async function openValhalla(){const mainContent=document.getElementById('main-content-area');if(!mainContent)return;const t=translations[currentLang||'ar'];const currentUserData=JSON.parse(localStorage.getItem('currentUser')||'{}');const userCity=currentUserData.city||'Amman';const searchTxt=currentLang==='en'?'Search records:':'البحث في السجلات:';const searchBtnTxt=currentLang==='en'?'Search!':'بحث!';const tabsHtml=generateGraveTabs(t);const epicTitle=t.city_grave_title?t.city_grave_title.replace('{city}',userCity):`مدافن أساطير ${userCity}`;window.currentGraveDateFilter='all';mainContent.innerHTML=`
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
    `;try{const snapshot=await db.collection('fallen_kings').where('city','==',userCity).get();const listDiv=document.getElementById('valhalla-list');listDiv.innerHTML='';if(snapshot.empty){listDiv.innerHTML=`
                <div class="empty-notif" style="margin-top: 30px;">
                    <i class="fa-solid fa-ghost" style="font-size: 4rem; color: #333; margin-bottom: 15px;"></i>
                    <p style="color: var(--slate); font-size: 1.1rem; font-weight: bold;">${t.empty_graveyard}</p>
                </div>`;return}
window.valhallaData=[];snapshot.forEach(doc=>{const data=doc.data();


window.valhallaData.push({id:doc.id,kingName:data.kingName,kingPhoto:data.kingPhoto||'/Photos/adm.png',weight:data.weight,slayerName:data.slayerName,slayerWeight:data.slayerWeight,rankLost:data.rankLost,rawDate:data.fallDate?data.fallDate.toMillis():0,date:data.fallDate?data.fallDate.toDate().toLocaleString('en-GB',{weekday:'short',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'}):'Unknown'})

});window.valhallaData.sort((a,b)=>b.rawDate-a.rawDate);renderGraveyardRows(window.valhallaData)}catch(error){console.error("Valhalla Error:",error);document.getElementById('valhalla-list').innerHTML=`<p style="text-align:center; color:#ff4d4d;">حدث خطأ أثناء استدعاء الأرواح!</p>`}}
window.filterGraveyardByDate=function(dateKey,btnElement){document.querySelectorAll('.grave-date-btn').forEach(btn=>btn.classList.remove('active'));btnElement.classList.add('active');window.currentGraveDateFilter=dateKey;filterGraveyardCombined()};window.filterGraveyardCombined=function(){const searchInput=document.getElementById('valhalla-search').value.toLowerCase();const dateFilter=window.currentGraveDateFilter;const filtered=window.valhallaData.filter(d=>{const matchText=d.kingName.toLowerCase().includes(searchInput)||d.slayerName.toLowerCase().includes(searchInput);let matchDate=!0;if(dateFilter!=='all'){const fallDate=new Date(d.rawDate);const recordDateKey=`${fallDate.getFullYear()}-${fallDate.getMonth()+1}-${fallDate.getDate()}`;matchDate=(recordDateKey===dateFilter)}
return matchText&&matchDate});renderGraveyardRows(filtered)};function changeMapFilter(filterType,btnElement){const buttons=btnElement.parentElement.querySelectorAll('.perf-tab-btn');buttons.forEach(btn=>btn.classList.remove('active-tab'));btnElement.classList.add('active-tab');currentMapFilter=filterType;const city=document.getElementById('map-city-select').value;const currentUserData=JSON.parse(localStorage.getItem('currentUser')||'{}');loadCityMapData(city,currentUserData.country||'Jordan')}
async function populateMapCitiesDropdown(country,defaultCity){const select=document.getElementById('map-city-select');if(globalCountriesData.length===0){try{const res=await fetch('https://countriesnow.space/api/v0.1/countries');const json=await res.json();globalCountriesData=json.data}catch(e){console.error(e);return}}
const countryData=globalCountriesData.find(c=>c.country===country);if(countryData&&countryData.cities){select.innerHTML='';countryData.cities.forEach(city=>{const option=document.createElement('option');option.value=city;option.innerText=`📍 ${city}`;if(city===defaultCity)option.selected=!0;select.appendChild(option)})}}
function loadCityMapData(city,country){const t=translations[currentLang||'ar'];const infoContainer=document.getElementById('monster-info');infoContainer.innerHTML=`<i class="fa-solid fa-spinner fa-spin fa-2x"></i> ${t.moving_to} ${city}...`;if(window.monsterMap){window.monsterMap.off();window.monsterMap.remove();window.monsterMap=null}
setTimeout(async()=>{let cityCoords=[31.9522,35.9334];try{const geoRes=await fetch(`https://nominatim.openstreetmap.org/search?city=${city}&country=${country}&format=json`);const geoData=await geoRes.json();if(geoData&&geoData.length>0){cityCoords=[parseFloat(geoData[0].lat),parseFloat(geoData[0].lon)]}}catch(e){console.error(e)}
window.monsterMap=L.map('monster-map',{attributionControl:!1}).setView(cityCoords,12);L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',{}).addTo(window.monsterMap);fetchCityMonster(city,cityCoords)},300)}
async function fetchCityMonster(city,coords){const t=translations[currentLang||'ar'];const infoContainer=document.getElementById('monster-info');try{let orderByField='stats.maxWeight';if(currentMapFilter==='streak')orderByField='streak';if(currentMapFilter==='level')orderByField='xp';const snapshot=await db.collection('users').where('city','==',city).orderBy(orderByField,'desc').limit(3).get();if(snapshot.empty){infoContainer.innerHTML=`<p style="color: var(--slate); font-weight: bold; font-size: 1.1rem;">${t.no_monster_yet}</p>`;return}
const topPlayers=[];snapshot.forEach(doc=>topPlayers.push({id:doc.id,...doc.data()}));const pinOffsets=[[0,0],[-0.015,-0.015],[-0.015,0.015]];const coordsList=[];topPlayers.forEach((player,index)=>{let displayValue='';let displayLabel='';let auraRadius=1500;if(currentMapFilter==='maxWeight'){let maxW=player.stats?.maxWeight||0;let bestMuscle=t.general_muscle;if(player.workouts&&Array.isArray(player.workouts)){player.workouts.forEach(w=>{w.details.forEach(ex=>{let wgt=parseFloat(ex.weight);if(!isNaN(wgt)&&wgt===maxW)bestMuscle=w.type})})}
bestMuscle=getTranslatedType(bestMuscle);displayValue=`${maxW} kg`;displayLabel=`${t.max_weight_label} (${bestMuscle}):`;auraRadius=maxW*12}else if(currentMapFilter==='streak'){let currentStreak=player.streak||0;displayValue=`${currentStreak} ${currentLang === 'en' ? 'Days' : 'أيام'} 🔥`;displayLabel=t.continuous_streak;auraRadius=currentStreak*50>1000?currentStreak*50:1000}else if(currentMapFilter==='level'){let currentLevel=player.rank||1;displayValue=`${t.map_level} ${currentLevel}`;displayLabel=t.current_rank;auraRadius=currentLevel>1?(currentLevel*50)+1000:1000}
const pinCoords=[coords[0]+pinOffsets[index][0],coords[1]+pinOffsets[index][1]];coordsList.push(pinCoords);if(index===0){L.circle(pinCoords,{color:'#00f2a7',fillColor:'#00f2a7',fillOpacity:0.15,radius:auraRadius}).addTo(window.monsterMap)}
let crownTitle=index===0?t.city_monster_crown:(index===1?t.silver_guard_crown:t.bronze_guard_crown);let extraClass=index===1?'crown-silver':(index===2?'crown-bronze':'');let isWantedHTML='';if(index===0&&player.streak>=3){isWantedHTML=`<div class="wanted-label">${t.wanted_dead}</div>`}
const icon=L.divIcon({className:`neon-crown-marker ${extraClass}`,html:`
                    <div class="emblem-wrapper">
                        <div class="emblem-shield">
                            <i class="fa-solid fa-crown" style="${index > 0 ? 'font-size:20px;' : 'font-size:30px inter;'}"></i>
                        </div>
                        <div class="emblem-banner" style="${index > 0 ? 'font-size:9px; padding:2px 8px;' : 'font-size:11px; padding:3px 12px;'}">
                            ${crownTitle}
                        </div>
                        ${isWantedHTML}
                    </div>
                `,iconSize:index===0?[70,85]:[55,65],iconAnchor:index===0?[35,75]:[27,60],popupAnchor:[0,-60]});let gymNameHTML=player.gym?`<p style="color:var(--slate); font-size:0.75rem; margin-top:2px;"><i class="fa-solid fa-dumbbell"></i> ${t.gym_label} ${player.gym}</p>`:'';let actionBtn=`<button class="monster-challenge-btn" onclick="openChat('${player.id}', '${player.firstName}', '${player.photoURL}')">${t.challenge_sword}</button>`;if(index===0&&auth.currentUser&&player.id===auth.currentUser.uid){actionBtn=`<button class="monster-challenge-btn" style="background:#FFD700; color:black; margin-top:5px;" onclick="claimTribute()">${t.tribute_btn}</button>`}
const popupHTML=`
                <div>
                    <img src="${player.photoURL || '/Photos/adm.png'}" class="monster-popup-img" style="${index===0 ? 'border-color:#FFD700;' : 'border-color:#C0C0C0;'}">
                    <p class="monster-popup-name">${player.firstName} ${player.lastName}</p>
                    ${gymNameHTML}
                    <p class="monster-popup-record" style="margin-top: 5px; margin-bottom: 10px;">
                        <span style="color: var(--slate); font-size: 0.8rem;">${displayLabel}</span><br>
                        <span style="color: ${index===0 ? '#FFD700' : '#C0C0C0'}; font-size: 1.1rem; font-weight: 900;">${displayValue}</span>
                    </p>
                    ${actionBtn}
                </div>
            `;L.marker(pinCoords,{icon:icon}).addTo(window.monsterMap).bindPopup(popupHTML)});if(topPlayers.length>=2){L.polyline([coordsList[0],coordsList[1]],{color:'#ff4d4d',weight:4,dashArray:'10, 15',className:'rivalry-line'}).addTo(window.monsterMap)}
let bottomTextLabel=currentMapFilter==='maxWeight'?t.map_weights:(currentMapFilter==='streak'?t.map_streak:t.map_level);let bottomValue=currentMapFilter==='maxWeight'?`${topPlayers[0].stats?.maxWeight || 0} kg`:(currentMapFilter==='streak'?`${topPlayers[0].streak || 0} ${currentLang === 'en' ? 'Days' : 'أيام'}`:`${t.map_level} ${topPlayers[0].rank || 1}`);infoContainer.innerHTML=`
        <div style="background: rgba(0,0,0,0.5); display: inline-block; padding: 10px 20px; border-radius: 12px; border: 1px solid rgba(255,215,0,0.5); box-shadow: 0 0 15px rgba(255,215,0,0.2);">
            <p style="color: #FFD700; font-weight: 900; font-size: 1.1rem; margin: 0; display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap; direction: ${currentLang === 'ar' ? 'rtl' : 'ltr'};">
                <span>👑 ${t.champion_of} ${bottomTextLabel}:</span> 
                <span style="color: white; direction: ltr; unicode-bidi: embed;">${topPlayers[0].firstName}</span> 
                <span style="color: var(--primary-color);"> ❖ ${bottomValue} </span>
            </p>
        </div>`}catch(error){console.error("Error fetching monsters:",error);infoContainer.innerHTML=`<p style="color: #ff4d4d; font-weight:bold;">${t.monster_error}</p>`}}
window.claimTribute=async function(){const btn=event.target;const originalText=btn.innerHTML;btn.disabled=!0;btn.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i>';const success=await addXP(100,'tribute');if(success){showToast(currentLang==='en'?"💰 +100 XP King's tribute claimed!":"💰 تم تحصيل +100 XP ضريبة الملك!");updateQuestProgress('tribute',1);localStorage.setItem('lastTributeClaim',new Date().toDateString())}else{showToast(currentLang==='en'?"Claimed today 👑":"الضريبة محصلة اليوم 👑")}
btn.innerHTML=originalText;btn.disabled=!1};function showMonsterRules(){const t=currentLang==='ar'?{title:"كيف تسيطر على المدينة؟ 👑",steps:["اكسر الرقم: لازم تسجل أعلى وزن (Max Weight) في مدينتك في أي تمرين.","أثبت وحشنتك: الأوزان العالية بتحتاج فيديو إثبات عشان الإدارة تعتمدك.","سقوط العرش: أول ما تكسر رقم الملك الحالي، رح نبعث إنذار لكل لاعبين المدينة إنك دعست عالعرش!","مطلوب للعدالة: إذا حافظت على ستريك 3 أيام وأنت الملك، رح تصير 'مطلوب'، والكل رح يحاول يكسر رقمك!","ضريبة الملك: كملك للمدينة، إلك مكافأة XP يومية بتقدر تحصلها من الخريطة."]}:{title:"How to Rule the City? 👑",steps:["Break the Record:** You must log the highest Max Weight in your city.","Prove It: Heavy lifts require video proof for admin approval.","Throne Fall: Once you beat the current King, we'll alert everyone in the city!","Wanted Status: Stay King for 3 days to become 'Wanted'—everyone will target you!","King's Tribute: Collect a daily XP bonus from the map as long as you hold the throne."]};const rulesHtml=t.steps.map(step=>`<li style="margin-bottom:10px; text-align:right;">${step}</li>`).join('');const modal=document.createElement('div');modal.className='modal-overlay active';modal.style.zIndex='30000';modal.innerHTML=`
        <div class="modal-content" style="max-width:400px; padding:25px;">
            <h2 style="color:#FFD700; margin-bottom:20px; text-align:center;">${t.title}</h2>
            <ul style="color:white; list-style:none; padding:0; font-size:0.9rem;">${rulesHtml}</ul>


<button class="btn-primary" onclick="this.parentElement.parentElement.remove()" style="width:100%; margin-top:20px;">${t.got_it_btn || (currentLang === 'en' ? "Got it, I'm ready! ⚔️" : "فهمت، أنا جاهز! ⚔️")}</button>

        </div>
    `;document.body.appendChild(modal)}
Object.assign(translations.ar,{live_workout_btn:"تمرين لايف",live_focus_title:"تمرين لايف ",log_set:"تسجيل الجولة",finish_live:"إنهاء التمرين",rest_time:"وقت الراحة",skip_rest:"تخطي الراحة ",beast_alert:" دمار! وزنك كسر الرقم القياسي. كمل تمرينك وركز، رح نطلب الإثبات بس تخلص!",proof_required_notif:" سجلت وزن أسطوري اليوم! ارفع فيديو الإثبات الآن لاستلام العرش.",upload_now:"رفع الفيديو "});Object.assign(translations.en,{live_workout_btn:"Live Workout",live_focus_title:"Live Workout ",log_set:"Log Set",finish_live:"Finish Workout",rest_time:"Rest Time",skip_rest:"Skip Rest ",beast_alert:" BEAST! You broke the record. Keep focusing, we'll ask for proof later!",proof_required_notif:" You logged a legendary weight today! Upload proof now to claim the throne.",upload_now:"Upload Video 🎥"});let liveWorkoutActive=!1;let liveDurationTimer;let liveSeconds=0;let restInterval;let liveExercises=[];let pendingProofData=null;function confirmExitLive(){if(confirm(currentLang==='en'?"Cancel live workout?":"إلغاء التمرين اللايف؟")){closeLiveWorkout()}}
function populateLiveMuscles(){const select=document.getElementById('live-muscle-select');const t=translations[currentLang||'ar'];if(select){select.innerHTML=`
            <option value="">-- ${t.live_select_muscle || 'اختر العضلة'} --</option>
            <option value="صدر">${t.muscle_chest || 'صدر'}</option>
            <option value="ظهر">${t.muscle_back || 'ظهر'}</option>
            <option value="أكتاف">${t.muscle_shoulders || 'أكتاف'}</option>
            <option value="أذرع">${t.muscle_arms || 'أذرع'}</option>
            <option value="أرجل">${t.muscle_legs || 'أرجل'}</option>
            <option value="بطن">${t.muscle_core || 'بطن'}</option>
            <option value="شامل">${t.sys_full || 'شامل'}</option>
        `}}
window.cityMonsterMaxWeight=0;function startLiveWorkout(){liveWorkoutActive=!0;liveExercises=[];pendingProofData=null;document.getElementById('live-sets-log').innerHTML='';const userData=JSON.parse(localStorage.getItem('currentUser')||'{}');if(userData.city){db.collection('users').where('city','==',userData.city).orderBy('stats.maxWeight','desc').limit(1).get().then(snap=>{if(!snap.empty)window.cityMonsterMaxWeight=snap.docs[0].data().stats?.maxWeight||0})}
populateLiveMuscles();const muscleSelect=document.getElementById('live-muscle-select');if(muscleSelect){muscleSelect.disabled=!1;muscleSelect.value=""}
const oldAiMsg=document.getElementById('ai-live-prediction');if(oldAiMsg)oldAiMsg.remove();const overlay=document.getElementById('live-workout-overlay');overlay.style.display='flex';setTimeout(()=>overlay.classList.add('active'),10);const canvas=document.getElementById('stardust-canvas');if(canvas){canvas.style.zIndex='30001';canvas.style.pointerEvents='none'}
requestWakeLock();liveStartTimeStamp=Date.now();document.getElementById('live-timer').innerText=`00:00`;clearInterval(liveDurationTimer);liveDurationTimer=setInterval(()=>{liveSeconds=Math.floor((Date.now()-liveStartTimeStamp)/1000);const m=String(Math.floor(liveSeconds/60)).padStart(2,'0');const s=String(liveSeconds%60).padStart(2,'0');document.getElementById('live-timer').innerText=`${m}:${s}`},1000)}
function startRestTimer(seconds){const restOverlay=document.getElementById('rest-timer-overlay');const restText=document.getElementById('rest-countdown');restOverlay.style.display='flex';restTargetTimeStamp=Date.now()+(seconds*1000);restText.innerText=seconds;clearInterval(restInterval);restInterval=setInterval(()=>{let timeLeft=Math.ceil((restTargetTimeStamp-Date.now())/1000);if(timeLeft<=0){timeLeft=0;skipRest();if('vibrate' in navigator)navigator.vibrate(500);}
restText.innerText=timeLeft},1000)}
window.logLiveSet=function(isSuperset=!1){const muscleSelect=document.getElementById('live-muscle-select');const selectedMuscleText=muscleSelect.options[muscleSelect.selectedIndex].text;const muscleVal=muscleSelect.value;const exName=document.getElementById('live-ex-name').value.trim();const weight=parseFloat(document.getElementById('live-ex-weight').value)||0;let reps=parseInt(document.getElementById('live-ex-reps').value)||0;if(!muscleVal||!exName||weight<=0||reps<=0){showToast(currentLang==='en'?"Please select a muscle and enter valid details":"يرجى تحديد العضلة وإدخال بيانات صحيحة");return}
if(reps>25){reps=25;document.getElementById('live-ex-reps').value=25;showToast(currentLang==='en'?"Max 25 reps allowed per set!":"الحد الأقصى للعدات هو 25 فقط!")}
liveExercises.push({name:exName,weight:weight,reps:reps,type:selectedMuscleText});if(liveExercises.length===1){muscleSelect.disabled=!0}
let restTime=90;const exLower=exName.toLowerCase();if(muscleVal==='أرجل'||muscleVal==='ظهر'||exLower.includes('squat')||exLower.includes('deadlift')){restTime=weight>=100?180:120}else if(muscleVal==='صدر'||exLower.includes('bench')){restTime=weight>=80?120:90}else{restTime=weight>=40?90:60}
const oldAiMsg=document.getElementById('ai-live-prediction');if(oldAiMsg)oldAiMsg.remove();document.getElementById('live-sets-log').insertAdjacentHTML('afterbegin',`
        <div class="live-set-row" style="margin-top: 10px;">
            <span>${exName} <span style="font-size: 0.7rem; color: var(--slate);">(${selectedMuscleText})</span></span>
            <span style="color: var(--primary-color);">${weight}kg x ${reps}</span>
        </div>
    `);let predicted1RM=weight*(1+(0.0333*reps));predicted1RM=Math.round(predicted1RM);if(reps>=2&&weight>=20){let aiMessage="";let isCloseToMonster=!1;let monsterWeight=window.cityMonsterMaxWeight||0;if(monsterWeight>0){if(predicted1RM>monsterWeight){isCloseToMonster=!0;aiMessage=currentLang==='en'?`⚡ AI Prediction: Your 1RM is ~${predicted1RM}kg! Try lifting ${monsterWeight + 2.5}kg next set to dethrone the City Monster!`:`⚡ توقع الـ AI: قوتك الحقيقية ${predicted1RM} كجم! جرب رفع ${monsterWeight + 2.5} كجم الجولة القادمة لاحتلال عرش المدينة 👑!`}else if(predicted1RM>=monsterWeight-20){aiMessage=currentLang==='en'?`⚡ AI Warning: Your 1RM is ~${predicted1RM}kg. You are very close to the City Record (${monsterWeight}kg)!`:`⚡ تحليل الـ AI: قوتك القصوى تقريباً ${predicted1RM} كجم. أنت قريب جداً من رقم وحش المدينة (${monsterWeight} كجم)!`}else{aiMessage=currentLang==='en'?`⚡ AI Analysis: Your 1 Rep Max is roughly ${predicted1RM}kg. Keep pushing!`:`⚡ تحليل الـ AI: حدك الأقصى لعدة واحدة هو تقريباً ${predicted1RM} كجم. استمر بالجلد!`}}else{aiMessage=currentLang==='en'?`⚡ AI Prediction: Your 1 Rep Max is approximately ${predicted1RM}kg. Push your limits!`:`⚡ توقع الـ AI: حدك الأقصى لعدة واحدة هو تقريباً ${predicted1RM} كجم. حطم أرقامك!`}
if(aiMessage){const aiBoxHtml=`
                <div id="ai-live-prediction" style="
                    background: ${isCloseToMonster ? 'rgba(255, 215, 0, 0.15)' : 'rgba(0, 242, 167, 0.15)'};
                    border: 2px solid ${isCloseToMonster ? '#FFD700' : 'var(--primary-color)'};
                    color: ${isCloseToMonster ? '#FFD700' : 'white'};
                    padding: 15px; border-radius: 12px; margin-bottom: 5px;
                    font-size: 0.9rem; font-weight: 900; line-height: 1.5; text-align: center;
                    box-shadow: 0 0 20px ${isCloseToMonster ? 'rgba(255, 215, 0, 0.4)' : 'rgba(0, 242, 167, 0.3)'};
                    animation: aiGlow 1.5s infinite alternate;">
                    ${aiMessage}
                </div>
            `;document.getElementById('live-sets-log').insertAdjacentHTML('afterbegin',aiBoxHtml)}}
let threshold=999;if(muscleVal==="صدر")threshold=60;if(muscleVal==="ظهر")threshold=80;if(muscleVal==="أكتاف"||muscleVal==="أذرع")threshold=50;if(muscleVal==="بطن")threshold=80;if(muscleVal==="أرجل")threshold=120;if(muscleVal==="شامل")threshold=60;if(exLower.includes("ديدليفت")||exLower.includes("deadlift"))threshold=120;if(exLower.includes("سكوات")||exLower.includes("squat"))threshold=140;if(weight>=threshold){if(!pendingProofData){pendingProofData={name:exName,weight:weight,reps:reps,type:selectedMuscleText};showToast(translations[currentLang||'ar'].beast_alert)}else if(weight>pendingProofData.weight){pendingProofData={name:exName,weight:weight,reps:reps,type:selectedMuscleText};let msg=translations[currentLang||'ar'].new_max_alert||`دمار! الإثبات سيكون للوزن الأعلى ({weight}kg)`;showToast(msg.replace('{weight}',weight))}}
document.getElementById('live-ex-reps').value='';if(!isSuperset){const restOverlay=document.getElementById('rest-timer-overlay');restOverlay.style.display='flex';setTimeout(()=>restOverlay.classList.add('active'),10);startRestTimer(restTime)}else{showToast(currentLang==='en'?"Superset Logged! No rest.":"تم تسجيل السوبرسيت! استمر بالجلد.")}};function closeLiveWorkout(){liveWorkoutActive=!1;clearInterval(liveDurationTimer);clearInterval(restInterval);releaseWakeLock();const overlay=document.getElementById('live-workout-overlay');overlay.classList.remove('active');setTimeout(()=>{overlay.style.display='none';const canvas=document.getElementById('stardust-canvas');if(canvas)canvas.style.zIndex='-1'},500);document.getElementById('rest-timer-overlay').classList.remove('active')}
function skipRest(){clearInterval(restInterval);const restOverlay=document.getElementById('rest-timer-overlay');restOverlay.classList.remove('active');setTimeout(()=>restOverlay.style.display='none',500)}
function animateValue(obj,start,end,duration){let startTimestamp=null;const step=(timestamp)=>{if(!startTimestamp)startTimestamp=timestamp;const progress=Math.min((timestamp-startTimestamp)/duration,1);obj.innerHTML=Math.floor(progress*(end-start)+start);if(progress<1)window.requestAnimationFrame(step);};window.requestAnimationFrame(step)}
let isSavingLiveWorkout=!1;async function finishLiveWorkout(){if(liveExercises.length===0){closeLiveWorkout();return}
if(isSavingLiveWorkout)return;isSavingLiveWorkout=!0;releaseWakeLock();try{const user=auth.currentUser;const totalSets=liveExercises.length;const totalVolume=liveExercises.reduce((sum,ex)=>sum+(ex.weight*ex.reps),0);let liveReps=0;liveExercises.forEach(ex=>liveReps+=parseInt(ex.reps)||0);const m=String(Math.floor(liveSeconds/60)).padStart(2,'0');const s=String(liveSeconds%60).padStart(2,'0');const finalTime=`${m}:${s}`;let xpMessage="";let xpGained=!1;if(pendingProofData){if(user){await db.collection('users').doc(user.uid).collection('notifications').add({type:'pending_proof',text:translations[currentLang].proof_required_notif,exerciseData:pendingProofData,fullWorkoutData:liveExercises,status:'pending',timestamp:firebase.firestore.FieldValue.serverTimestamp()})}
xpMessage=currentLang==='en'?"Pending Approval ⏳":"بانتظار الإثبات ⏳";xpGained=!1}else{await updateQuestProgressBatch({volume:totalVolume,reps:liveReps,workout_days:1});addVolumeToClanWar(totalVolume);if(typeof updateStat==="function"){updateStat('workouts',1);liveExercises.forEach(ex=>{let w=parseFloat(ex.weight)||0;if(w>0)updateStat('maxWeight',w,!0);})}
let workoutHistory=JSON.parse(localStorage.getItem('userWorkouts'))||[];let dateStr=new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});let typeStr=liveExercises[0]?.type||"تمرين لايف";workoutHistory.unshift({date:dateStr,type:typeStr,details:liveExercises});localStorage.setItem('userWorkouts',JSON.stringify(workoutHistory));if(user){let savedData=JSON.parse(localStorage.getItem('currentUser')||'{}');const todayStr=new Date().toDateString();const lastXpDate=savedData.lastWorkoutXpDate||"";if(lastXpDate===todayStr){const now=new Date();const tomorrow=new Date(now);tomorrow.setHours(24,0,0,0);const timeLeftMs=tomorrow-now;const hours=Math.floor(timeLeftMs/(1000*60*60));const minutes=Math.floor((timeLeftMs%(1000*60*60))/(1000*60));xpMessage=currentLang==='en'?`XP resets in ${hours}h ${minutes}m`:`تتجدد المكافأة بعد ${hours}س و${minutes}د`;await db.collection('users').doc(user.uid).update({workouts:workoutHistory})}else{savedData.lastWorkoutXpDate=todayStr;localStorage.setItem('currentUser',JSON.stringify(savedData));await db.collection('users').doc(user.uid).update({workouts:workoutHistory,lastWorkoutXpDate:todayStr});if(typeof addXP==="function")await addXP(50,'workout');xpGained=!0;xpMessage="+50 XP"}}}
clearInterval(liveDurationTimer);clearInterval(restInterval);const overlay=document.getElementById('live-workout-overlay');overlay.classList.remove('active');setTimeout(()=>overlay.style.display='none',500);document.getElementById('rest-timer-overlay').classList.remove('active');const summaryOverlay=document.getElementById('live-summary-overlay');if(summaryOverlay){document.getElementById('sum-time').innerText=finalTime;document.getElementById('sum-sets').innerText=totalSets;document.getElementById('sum-volume').innerText="0";const xpRewardBox=document.querySelector('.xp-reward-box');if(xpRewardBox){xpRewardBox.innerText=xpMessage;xpRewardBox.style.fontSize=xpGained?'2.5rem':(pendingProofData?'1.5rem':'1.1rem');xpRewardBox.style.color=xpGained?'var(--primary-color)':(pendingProofData?'#FFD700':'var(--slate)');xpRewardBox.style.textShadow=xpGained?'0 0 20px rgba(0, 242, 167, 0.6)':(pendingProofData?'0 0 15px rgba(255, 215, 0, 0.5)':'none');xpRewardBox.style.animation=xpGained?'pulseXP 1.5s infinite alternate':'none'}
summaryOverlay.style.display='flex';setTimeout(()=>{summaryOverlay.classList.add('active');animateValue(document.getElementById('sum-volume'),0,totalVolume,1500)},50)}else{showToast(currentLang==='en'?`Workout Saved! ${xpMessage}`:`تم الحفظ! ${xpMessage}`);closeLiveSummary()}}finally{setTimeout(()=>{isSavingLiveWorkout=!1},2000)}}
async function processLiveQuestsAndHistory(updateMaxWeightLocally){const totalSets=liveExercises.length;const totalVolume=liveExercises.reduce((sum,ex)=>sum+(ex.weight*ex.reps),0);let liveReps=0;liveExercises.forEach(ex=>liveReps+=parseInt(ex.reps)||0);await updateQuestProgressBatch({volume:totalVolume,reps:liveReps,workout_days:1});if(typeof updateStat==="function"){updateStat('workouts',1);if(updateMaxWeightLocally){liveExercises.forEach(ex=>{let w=parseFloat(ex.weight)||0;if(w>0)updateStat('maxWeight',w,!0);})}}
let workoutHistory=JSON.parse(localStorage.getItem('userWorkouts'))||[];let dateStr=new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'});let typeStr=pendingProofData?pendingProofData.type:(liveExercises[0]?.type||"تمرين لايف");workoutHistory.unshift({date:dateStr,type:typeStr,details:liveExercises});localStorage.setItem('userWorkouts',JSON.stringify(workoutHistory));const user=auth.currentUser;let xpMessage="";let xpGained=!1;if(user){let savedData=JSON.parse(localStorage.getItem('currentUser')||'{}');const todayStr=new Date().toDateString();const lastXpDate=savedData.lastWorkoutXpDate||"";if(lastXpDate===todayStr){const now=new Date();const tomorrow=new Date(now);tomorrow.setHours(24,0,0,0);const timeLeftMs=tomorrow-now;const hours=Math.floor(timeLeftMs/(1000*60*60));const minutes=Math.floor((timeLeftMs%(1000*60*60))/(1000*60));xpMessage=currentLang==='en'?`XP resets in ${hours}h ${minutes}m`:`تتجدد المكافأة بعد ${hours}س و${minutes}د`;await db.collection('users').doc(user.uid).update({workouts:workoutHistory})}else{savedData.lastWorkoutXpDate=todayStr;localStorage.setItem('currentUser',JSON.stringify(savedData));await db.collection('users').doc(user.uid).update({workouts:workoutHistory,lastWorkoutXpDate:todayStr});if(typeof addXP==="function")await addXP(50,'workout');xpGained=!0;xpMessage="+50 XP"}}
const m=String(Math.floor(liveSeconds/60)).padStart(2,'0');const s=String(liveSeconds%60).padStart(2,'0');window.liveFinalTime=`${m}:${s}`;window.liveFinalVolume=totalVolume;window.liveFinalSets=totalSets;window.liveXpMessage=xpMessage;window.liveXpGained=xpGained}
function closeLiveSummaryOrShow(){clearInterval(liveDurationTimer);clearInterval(restInterval);const overlay=document.getElementById('live-workout-overlay');overlay.classList.remove('active');setTimeout(()=>overlay.style.display='none',500);document.getElementById('rest-timer-overlay').classList.remove('active');releaseWakeLock();const summaryOverlay=document.getElementById('live-summary-overlay');if(summaryOverlay){document.getElementById('sum-time').innerText=window.liveFinalTime;document.getElementById('sum-sets').innerText=window.liveFinalSets;document.getElementById('sum-volume').innerText="0";const xpRewardBox=document.querySelector('.xp-reward-box');if(xpRewardBox){xpRewardBox.innerText=window.liveXpMessage;xpRewardBox.style.fontSize=window.liveXpGained?'2.5rem':'1.1rem';xpRewardBox.style.color=window.liveXpGained?'var(--primary-color)':'var(--slate)';xpRewardBox.style.textShadow=window.liveXpGained?'0 0 20px rgba(0, 242, 167, 0.6)':'none';xpRewardBox.style.animation=window.liveXpGained?'pulseXP 1.5s infinite alternate':'none'}
summaryOverlay.style.display='flex';setTimeout(()=>{summaryOverlay.classList.add('active');animateValue(document.getElementById('sum-volume'),0,window.liveFinalVolume,1500)},50)}else{showToast(currentLang==='en'?`Workout Saved! ${window.liveXpMessage}`:`تم حفظ التمرين! ${window.liveXpMessage}`);closeLiveSummary()}}
function closeLiveSummary(){liveWorkoutActive=!1;pendingProofData=null;const summaryOverlay=document.getElementById('live-summary-overlay');if(summaryOverlay){summaryOverlay.classList.remove('active');setTimeout(()=>{summaryOverlay.style.display='none';resetLiveUI()},500)}else{resetLiveUI()}}
function resetLiveUI(){const canvas=document.getElementById('stardust-canvas');if(canvas)canvas.style.zIndex='-1';if(document.getElementById('log-container'))renderWorkoutLog();}(function initVisibilityEngine(){const hideBottomNavTriggers=['openCityMonster','openAchievements','openAdminPanel','showLeaderboard','openWorkoutModal','openGameSelection','openGame','openSquatGame'];const hideFabTriggers=['openProfile','openPerformanceCenter','openFriendsCenter',...hideBottomNavTriggers];hideFabTriggers.forEach(funcName=>{if(typeof window[funcName]==='function'){const originalFunc=window[funcName];window[funcName]=function(...args){const fab=document.querySelector('.live-workout-fab');if(fab)fab.style.display='none';if(hideBottomNavTriggers.includes(funcName)){const bottomNav=document.querySelector('.bottom-nav');if(bottomNav)bottomNav.style.display='none'}
return originalFunc.apply(this,args)}}});const showTriggers=['backToDashboard','closeWorkoutModal','closeGameSelection','closeGame','closeSquatGame','finishGame','finishSquatGame'];showTriggers.forEach(funcName=>{if(typeof window[funcName]==='function'){const originalFunc=window[funcName];window[funcName]=function(...args){const result=originalFunc.apply(this,args);const mainContent=document.getElementById('main-content-area');const bottomNav=document.querySelector('.bottom-nav');const fab=document.querySelector('.live-workout-fab');if(mainContent&&!mainContent.dataset.originalContent){if(fab)fab.style.display='flex';if(bottomNav)bottomNav.style.display='flex'}else{if(bottomNav)bottomNav.style.display='flex'}
return result}}})})();document.addEventListener('click',function(e){const btn=e.target.closest('button');if(btn){const action=btn.getAttribute('onclick')||'';const btnClass=btn.className||'';if(action.includes('open')||action.includes('close')||action.includes('toggle')||action.includes('show')||action.includes('switch')||action.includes('back')||btnClass.includes('nav-item')||btnClass.includes('notif-btn')){return}
if(btn.hasAttribute('data-locked')){e.stopPropagation();e.preventDefault();return}
btn.setAttribute('data-locked','true');btn.style.pointerEvents='none';setTimeout(()=>{btn.removeAttribute('data-locked');btn.style.pointerEvents='auto'},1000)}},!0);window.toggleProfileLangMenu=function(event){event.stopPropagation();const dropdown=document.getElementById('profile-lang-dropdown');const icon=document.getElementById('profile-lang-icon');if(dropdown){const isShowing=dropdown.style.display==='block';dropdown.style.display=isShowing?'none':'block';if(icon)icon.style.transform=isShowing?'rotate(0deg)':'rotate(180deg)'}};window.changeLanguageFromProfile=function(lang){if(currentLang===lang)return;selectLanguage(lang);openProfile()};document.addEventListener('click',function(){const dropdown=document.getElementById('profile-lang-dropdown');const icon=document.getElementById('profile-lang-icon');if(dropdown&&dropdown.style.display==='block'){dropdown.style.display='none';if(icon)icon.style.transform='rotate(0deg)'}});window.logoutFromProfile=async function(){const t=translations[currentLang||'ar'];const confirmMsg=currentLang==='en'?"Are you sure you want to logout?":"متأكد إنك بدك تسجل خروج يا وحش؟";if(confirm(confirmMsg)){const user=auth.currentUser;if(user){try{await db.collection('users').doc(user.uid).update({fcmToken:firebase.firestore.FieldValue.delete()})}catch(e){console.error("Error removing token",e)}}
await auth.signOut();localStorage.removeItem('currentUser');localStorage.removeItem('hasSeenTour');window.location.href='index.html'}};window.switchFriendsTab=function(tab){document.querySelectorAll('.perf-tab-btn').forEach(btn=>btn.classList.remove('active-tab'));document.querySelectorAll('.perf-tab-content').forEach(content=>content.style.display='none');const activeBtn=document.getElementById(`tab-btn-${tab}`);const activeTab=document.getElementById(`friends-tab-${tab}`);if(activeBtn)activeBtn.classList.add('active-tab');if(activeTab)activeTab.style.display='block'};


const profileCovers =[
    {id:'cv1',price:1000, currency:'xp', url:'Photos/dms.png',name_ar:'تنفس النار',name_en:'Fire Breathing'},
    {id:'cv2',price:1000, currency:'xp', url:'Photos/g2.png',name_ar:'المحرك الخامس',name_en:'Gear Five'},
    {id:'cv3',price:1000, currency:'xp', url:'Photos/zoro.png',name_ar:'نصل زورو',name_en:'Zoro Blade'},
    {id:'cv4',price:1000, currency:'xp', url:'Photos/solo.png',name_ar:'حاكم الظلال',name_en:'Shadow Monarch'},
    {id:'cv5',price:1000, currency:'xp', url:'Photos/gymsm.png',name_ar:'وحش الجيم',name_en:'Gym Beast'},
    {id:'cv6',price:1200, currency:'xp', url:'Photos/ls.png',name_ar:'السيف السحري',name_en:'Magic Sword'},
    {id:'cv7',price:1500, currency:'xp', url:'Photos/lufs.png',name_ar:'سفينة القراصنة',name_en:'Pirate Ship'},
    {id:'cv8',price:2000, currency:'xp', url:'Photos/sd.png',name_ar:'عالم الظلال',name_en:'Shadow World'},
    {id:'cv9',price:3000, currency:'xp', url:'Photos/shoot.png',name_ar:'الطلقة السحرية',name_en:'Magic Shot'},
    // تحويل أغلى 4 أغلفة إلى عملات حديدية بأسعار متناسبة
    {id:'cv10',price:50, currency:'ironCoins', url:'Photos/fg.png',name_ar:'الدرع السحري',name_en:'Magic Shield'},
    {id:'cv11',price:80, currency:'ironCoins', url:'Photos/time.png',name_ar:'سيد الوقت',name_en:'Time Master'},
    {id:'cv12',price:150, currency:'ironCoins', url:'Photos/fghtm.png',name_ar:'صدام الأساطير',name_en:'Clash of Legends'},
    {id:'cv13',price:300, currency:'ironCoins', url:'Photos/k1.gif',name_ar:'عرش الإمبراطور',name_en:'Emperor Throne'},
    {id:'cv14',price:400, currency:'ironCoins', url:'Photos/dead1.png',name_ar:'أسطورة الفالهالا',name_en:'Valhalla Legend'} 
];

const storeItemsDB = {
    titles:[
        {id:'t1',price:1000, currency:'xp', val:'مبتدئ طموح',val_en:'Ambitious Rookie',tier:'tier-common',icon:'fa-solid fa-seedling'},
        {id:'t2',price:1000, currency:'xp', val:'رافع أثقال',val_en:'Weight Lifter',tier:'tier-common',icon:'fa-solid fa-dumbbell'},
        {id:'t3',price:1000, currency:'xp', val:'محب الحديد',val_en:'Iron Lover',tier:'tier-common',icon:'fa-solid fa-heart'},
        {id:'t4',price:1000, currency:'xp', val:'رياضي نشط',val_en:'Active Athlete',tier:'tier-common',icon:'fa-solid fa-person-running'},
        {id:'t5',price:1000, currency:'xp', val:'باحث عن القوة',val_en:'Power Seeker',tier:'tier-common',icon:'fa-solid fa-magnifying-glass'},
        {id:'t6',price:1000, currency:'xp', val:'متدرب صلب',val_en:'Solid Trainee',tier:'tier-common',icon:'fa-solid fa-shield'},
        {id:'t7',price:1000, currency:'xp', val:'قاهر الكسل',val_en:'Laziness Slayer',tier:'tier-common',icon:'fa-solid fa-bed-pulse'},
        {id:'t8',price:1000, currency:'xp', val:'روح التحدي',val_en:'Challenger Spirit',tier:'tier-common',icon:'fa-solid fa-fire'},
        {id:'t9',price:1000, currency:'xp', val:'مقاتل الجيم',val_en:'Gym Fighter',tier:'tier-common',icon:'fa-solid fa-hand-fist'},
        {id:'t10',price:1000, currency:'xp', val:'بطل صاعد',val_en:'Rising Hero',tier:'tier-common',icon:'fa-solid fa-arrow-trend-up'},
        {id:'t11',price:2500, currency:'xp', val:'كسار الأوزان',val_en:'Weight Breaker',tier:'tier-rare',icon:'fa-solid fa-hammer'},
        {id:'t12',price:4000, currency:'xp', val:'ماكينة عضلات',val_en:'Muscle Machine',tier:'tier-rare',icon:'fa-solid fa-gear'},
        {id:'t13',price:5000, currency:'xp', val:'دبابة بشرية',val_en:'Human Tank',tier:'tier-rare',icon:'fa-solid fa-truck-monster'},
        {id:'t14',price:10000, currency:'xp', val:'قاهر الجاذبية',val_en:'Gravity Defier',tier:'tier-epic',icon:'fa-brands fa-space-awesome'},
        {id:'t15',price:15000, currency:'xp', val:'سيد الأوزان',val_en:'Master of Weights',tier:'tier-epic',icon:'fa-solid fa-scale-balanced'},
        {id:'t16',price:20000, currency:'xp', val:'جنرال النادي',val_en:'Gym General',tier:'tier-epic',icon:'fa-solid fa-medal'},
        // تحويل أغلى 4 ألقاب لعملات حديدية
        {id:'t17',price:300, currency:'ironCoins', val:'حاكم الظلال',val_en:'Shadow Monarch',tier:'tier-legendary',icon:'fa-solid fa-user-ninja'},
        {id:'t18',price:350, currency:'ironCoins', val:'أسطورة حية',val_en:'Living Legend',tier:'tier-legendary',icon:'fa-solid fa-khanda'},
        {id:'t19',price:400, currency:'ironCoins', val:' المتوحش',val_en:'The Savage',tier:'tier-legendary',icon:'fa-solid fa-bolt'},
        {id:'t20',price:500, currency:'ironCoins', val:'عملاق الحديد',val_en:' Iron Titan',tier:'tier-mythic',icon:'fa-solid fa-gem'}
    ],
    borders:[
        {id:'b1',price:1000, currency:'xp', val:'frame-gear',name_ar:'الترس الحديدي',name_en:'Iron Gear'},
        {id:'b2',price:2000, currency:'xp', val:'frame-cyber',name_ar:'حلقات الماتريكس',name_en:'Cyber Rings'},
        {id:'b3',price:3500, currency:'xp', val:'frame-demon',name_ar:'نجمة الدمار',name_en:'Demon Star'},
        {id:'b4',price:5000, currency:'xp', val:'frame-mecha',name_ar:'درع الميكا',name_en:'Mecha Armor'},
        {id:'b5',price:6500, currency:'xp', val:'frame-snake',name_ar:'أفعى الكوبرا',name_en:'Venomous Serpent'},
        {id:'b6',price:8000, currency:'xp', val:'frame-lightning',name_ar:'عاصفة البرق',name_en:'Lightning Storm'},
        {id:'b7',price:10000, currency:'xp', val:'frame-samurai',name_ar:'نصل الساموراي',name_en:'Samurai Slash'},
        {id:'b8',price:12500, currency:'xp', val:'frame-blackhole',name_ar:'الثقب الأسود',name_en:'Void Singularity'},
        {id:'b9',price:15000, currency:'xp', val:'frame-bloodmoon',name_ar:'القمر الدموي',name_en:'Blood Moon'},
        {id:'b10',price:18000, currency:'xp', val:'frame-plasma',name_ar:'مفاعل البلازما',name_en:'Plasma Reactor'},
        {id:'b11',price:22000, currency:'xp', val:'frame-shadow',name_ar:'ظل النينجا',name_en:'Shadow Assassin'},
        {id:'b12',price:26000, currency:'xp', val:'frame-pharaoh',name_ar:'لعنة الفرعون',name_en:'Pharaoh Curse'},
        // تحويل أغلى 4 هالات لعملات حديدية
        {id:'b13',price:300, currency:'ironCoins', val:'frame-phoenix',name_ar:'طائر العنقاء',name_en:'Phoenix Flare'},
        {id:'b14',price:350, currency:'ironCoins', val:'frame-wings',name_ar:'أجنحة المجد',name_en:'Wings of Glory'},
        {id:'b15',price:420, currency:'ironCoins', val:'frame-god',name_ar:'هالة الأسطورة',name_en:'Legend Aura'},
        {id:'b16',price:500, currency:'ironCoins', val:'frame-emperor',name_ar:'وسام الإمبراطور',name_en:'Emperor Relic'}
    ],
    themes:[
        {id:'th1',price:1000, currency:'xp', val:'void',name_ar:'سحر الفراغ',name_en:'Cosmic Void',icon:'fa-solid fa-meteor',color:'#9b59b6'},
        {id:'th2',price:1000, currency:'xp', val:'samurai',name_ar:'نصل الساموراي',name_en:'Samurai Blade',icon:'fa-solid fa-khanda',color:'#e74c3c'},
        {id:'th3',price:1000, currency:'xp', val:'frost',name_ar:'الصقيع المطلق',name_en:'Absolute Frost',icon:'fa-regular fa-snowflake',color:'#74b9ff'},
        {id:'th4',price:1000, currency:'xp', val:'toxic',name_ar:'الطفرة السامة',name_en:'Toxic Biohazard',icon:'fa-solid fa-flask-vial',color:'#39ff14'},
        {id:'th5',price:1000, currency:'xp', val:'hellfire',name_ar:'جحيم مستعر',name_en:'Hellfire',icon:'fa-solid fa-fire-flame-curved',color:'#ff4500'},
        {id:'th6',price:2000, currency:'xp', val:'arcade',name_ar:'بكسل أركيد',name_en:'Retro Arcade',icon:'fa-solid fa-gamepad',color:'#e056fd'},
        {id:'th7',price:3000, currency:'xp', val:'vampire',name_ar:'قصر دراكولا',name_en:'Dracula Castle',icon:'fa-solid fa-droplet',color:'#8b0000'},
        {id:'th8',price:4500, currency:'xp', val:'cyberpunk',name_ar:'سايبر بانك',name_en:'Cyberpunk',icon:'fa-solid fa-microchip',color:'#0ff'},
        {id:'th9',price:6000, currency:'xp', val:'jungle',name_ar:'الغابة المتوحشة',name_en:'Savage Jungle',icon:'fa-solid fa-leaf',color:'#2ecc71'},
        {id:'th10',price:8000, currency:'xp', val:'crystal',name_ar:'الكريستال المشع',name_en:'Radiant Crystal',icon:'fa-regular fa-gem',color:'#00cec9'},
        {id:'th11',price:10000, currency:'xp', val:'molten',name_ar:'المعدن المصهور',name_en:'Molten Metal',icon:'fa-solid fa-volcano',color:'#e67e22'},
        // تحويل أغلى 4 ثيمات لعملات حديدية
        {id:'th12',price:130, currency:'ironCoins', val:'wizard',name_ar:'الساحر المظلم',name_en:'Dark Wizard',icon:'fa-solid fa-hat-wizard',color:'#8e44ad'},
        {id:'th13',price:160, currency:'ironCoins', val:'hacker',name_ar:'نظام الماتريكس',name_en:'Matrix Hacker',icon:'fa-solid fa-terminal',color:'#00ff00'},
        {id:'th14',price:180, currency:'ironCoins', val:'atlantis',name_ar:'أعماق الأطلنطي',name_en:'Abyssal Atlantis',icon:'fa-solid fa-water',color:'#0984e3'},
        {id:'th15',price:200, currency:'ironCoins', val:'emperor',name_ar:'الإمبراطور الأعظم',name_en:'Iron Emperor',icon:'fa-solid fa-chess-king',color:'#FFD700'}
    ],
    utilities:[
        { id: 'u_name', val: 'name_reset', price: 50, currency: 'ironCoins', name_ar: 'تجاوز انتظار الاسم', name_en: 'Name Change Bypass', icon: 'fa-solid fa-id-card', desc_ar: 'تغيير اسمك فوراً دون انتظار 30 يوم.', desc_en: 'Bypass the 30-day name change cooldown.' },
        { id: 'u_loc', val: 'loc_reset', price: 50, currency: 'ironCoins', name_ar: 'تجاوز انتظار الموقع', name_en: 'Location Change Bypass', icon: 'fa-solid fa-map-location-dot', desc_ar: 'تغيير مدينتك فوراً دون انتظار 24 ساعة.', desc_en: 'Bypass the 24-hour location change cooldown.' },
        { id: 'u_quest', val: 'quest_reset', price: 30, currency: 'ironCoins', name_ar: 'تحديث المهام اليومية', name_en: 'Refresh Daily Quests', icon: 'fa-solid fa-arrows-rotate', desc_ar: 'استبدل مهامك اليومية بمهام جديدة فوراً.', desc_en: 'Instantly replace your daily quests with new ones.' }
    ],
    clanPerks:[
        // 12 شعار كلان جديد حصري بدون تكرار للتنين المجاني
        { id: 'cp_crown', val: 'fa-solid fa-chess-king', price: 100, currency: 'ironCoins', name_ar: 'تاج الملك', name_en: 'King Crown', icon: 'fa-solid fa-chess-king' },
        { id: 'cp_skull', val: 'fa-solid fa-book-skull', price: 100, currency: 'ironCoins', name_ar: 'كتاب الموتى', name_en: 'Tome of the Dead', icon: 'fa-solid fa-book-skull' },
        { id: 'cp_eye', val: 'fa-solid fa-eye', price: 150, currency: 'ironCoins', name_ar: 'عين الدمار', name_en: 'Eye of Doom', icon: 'fa-solid fa-eye' },
        { id: 'cp_knight', val: 'fa-solid fa-chess-knight', price: 150, currency: 'ironCoins', name_ar: 'حصان الشطرنج', name_en: 'Dark Knight', icon: 'fa-solid fa-chess-knight' },
        { id: 'cp_shieldheart', val: 'fa-solid fa-shield-heart', price: 150, currency: 'ironCoins', name_ar: 'درع الولاء', name_en: 'Loyalty Shield', icon: 'fa-solid fa-shield-heart' },
        { id: 'cp_dungeon', val: 'fa-solid fa-dungeon', price: 200, currency: 'ironCoins', name_ar: 'القلعة المحصنة', name_en: 'Iron Dungeon', icon: 'fa-solid fa-dungeon' },
        { id: 'cp_anchor', val: 'fa-solid fa-anchor', price: 200, currency: 'ironCoins', name_ar: 'مرساة القوة', name_en: 'Heavy Anchor', icon: 'fa-solid fa-anchor' },
        { id: 'cp_monument', val: 'fa-solid fa-monument', price: 200, currency: 'ironCoins', name_ar: 'مسلة الأبطال', name_en: 'Heroes Monument', icon: 'fa-solid fa-monument' },
        { id: 'cp_hand', val: 'fa-solid fa-hand-sparkles', price: 250, currency: 'ironCoins', name_ar: 'اليد السحرية', name_en: 'Magic Hand', icon: 'fa-solid fa-hand-sparkles' },
        { id: 'cp_ring', val: 'fa-solid fa-ring', price: 250, currency: 'ironCoins', name_ar: 'خاتم القوة', name_en: 'Ring of Power', icon: 'fa-solid fa-ring' },
        { id: 'cp_gavel', val: 'fa-solid fa-gavel', price: 300, currency: 'ironCoins', name_ar: 'مطرقة الحكم', name_en: 'Judge Gavel', icon: 'fa-solid fa-gavel' },
        { id: 'cp_mountain', val: 'fa-solid fa-mountain-sun', price: 300, currency: 'ironCoins', name_ar: 'جبل الأوليمب', name_en: 'Mount Olympus', icon: 'fa-solid fa-mountain-sun' }
    ],
    packages:[
        // باقات متعددة وأسعار منطقية وحقيقية
        { id: '1422744', val: '50', price: 0.49, currency: 'usd', name_ar: '50 عملة', name_en: '50 Coins', icon: 'fa-solid fa-coins', desc_ar:'جرعة سريعة', desc_en:'Quick Drop' },
        { id: '1422744', val: '100', price: 0.99, currency: 'usd', name_ar: '100 عملة', name_en: '100 Coins', icon: 'fa-solid fa-coins', desc_ar:'للبدايات', desc_en:'Starter' },
        { id: 'pkg_2', val: '280', price: 2.49, currency: 'usd', name_ar: '280 عملة', name_en: '280 Coins', icon: 'fa-solid fa-money-bill', desc_ar:'توفير خفيف', desc_en:'Nice Boost' },
        { id: 'pkg_3', val: '500', price: 3.99, currency: 'usd', name_ar: '500 عملة', name_en: '500 Coins', icon: 'fa-solid fa-sack-dollar', desc_ar:'شعبية عالية', desc_en:'Popular' },
        { id: 'pkg_4', val: '1200', price: 7.99, currency: 'usd', name_ar: '1200 عملة', name_en: '1200 Coins', icon: 'fa-solid fa-gem', desc_ar:'الأكثر مبيعاً', desc_en:'Best Value' },
        { id: 'pkg_5', val: '2500', price: 14.99, currency: 'usd', name_ar: '2500 عملة', name_en: '2500 Coins', icon: 'fa-solid fa-shield-halved', desc_ar:'للمحترفين', desc_en:'Pro Choice' },
        { id: 'pkg_6', val: '5500', price: 29.99, currency: 'usd', name_ar: '5500 عملة', name_en: '5500 Coins', icon: 'fa-solid fa-crown', desc_ar:'صندوق الملوك', desc_en:'King Vault' },
        { id: 'pkg_7', val: '12000', price: 49.99, currency: 'usd', name_ar: '12000 عملة', name_en: '12000 Coins', icon: 'fa-solid fa-dragon', desc_ar:'ثروة التنين', desc_en:'Dragon Hoard' }
    ]
};

// ==========================================
// 🎲 بيانات نظام الصناديق (The Iron Crate System)
// ==========================================

const cratesDB = {
    iron: {
        id: 'iron', name_ar: 'صندوق حديدي', name_en: 'Iron Crate', icon: 'fa-solid fa-box', color: '#a8a8a8', price: 20, currency: 'ironCoins',
        rates: { common: 85, rare: 14, epic: 1, mythic: 0 }
    },
    steel: {
        id: 'steel', name_ar: 'صندوق فولاذي', name_en: 'Steel Crate', icon: 'fa-solid fa-box-open', color: '#00d4ff', price: 60, currency: 'ironCoins',
        rates: { common: 60, rare: 35, epic: 5, mythic: 0 }
    },
    titanium: {
        id: 'titanium', name_ar: 'صندوق تيتانيوم', name_en: 'Titanium Crate', icon: 'fa-solid fa-toolbox', color: '#b5179e', price: 150, currency: 'ironCoins',
        rates: { common: 0, rare: 70, epic: 25, mythic: 5 }
    },
    war: {
        id: 'war', name_ar: 'صندوق الحرب الأسطوري', name_en: 'Legendary War Chest', icon: 'fa-solid fa-khanda', color: '#FFD700', price: 0, currency: 'earned_only',
        rates: { common: 0, rare: 0, epic: 80, mythic: 20 }
    }
};


const crateExclusives = {
    covers:[
        // 20 غلاف حصري للصناديق فقط
        {id:'cr1', url:'Photos/cr1.png', name_ar:'بوابة الجحيم', name_en:'Hell Gate'},
        {id:'cr2', url:'Photos/cr2.png', name_ar:'الطاقة المظلمة', name_en:'Dark Energy'},
        {id:'cr3', url:'Photos/cr3.png', name_ar:'نواة الميكا', name_en:'Mecha Core'},
        {id:'cr4', url:'Photos/cr4.png', name_ar:'غضب الطبيعة', name_en:'Nature Wrath'},
        {id:'cr5', url:'Photos/cr5.png', name_ar:'سماء النيون', name_en:'Neon Sky'},
        {id:'cr6', url:'Photos/cr6.png', name_ar:'سيد العواصف', name_en:'Storm Lord'},
        {id:'cr7', url:'Photos/cr7.png', name_ar:'الفارس الميت', name_en:'Undead Knight'},
        {id:'cr8', url:'Photos/cr8.png', name_ar:'لعنة أطلانتس', name_en:'Atlantis Curse'},
        {id:'cr9', url:'Photos/cr9.png', name_ar:'الوحش الميكانيكي', name_en:'Cyber Beast'},
        {id:'cr10', url:'Photos/cr10.png', name_ar:'دمار شامل', name_en:'Total Annihilation'},
        {id:'cr11', url:'Photos/cr11.png', name_ar:'حارس المجرة', name_en:'Galaxy Guardian'},
        {id:'cr12', url:'Photos/cr12.png', name_ar:'لهيب أزرق', name_en:'Blue Flame'},
        {id:'cr13', url:'Photos/cr13.png', name_ar:'سم زعاف', name_en:'Lethal Venom'},
        {id:'cr14', url:'Photos/cr14.png', name_ar:'انعكاس مرعب', name_en:'Grim Reflection'},
        {id:'cr15', url:'Photos/cr15.png', name_ar:'إمبراطور الجليد', name_en:'Frost Emperor'},
        {id:'cr16', url:'Photos/cr16.png', name_ar:'مجرم حرب', name_en:'War Criminal'},
        {id:'cr17', url:'Photos/cr17.png', name_ar:'دمعة التنين', name_en:'Dragon Tear'},
        {id:'cr18', url:'Photos/cr18.png', name_ar:'ظلال مميتة', name_en:'Deadly Shadows'},
        {id:'cr19', url:'Photos/cr19.png', name_ar:'نهاية العالم', name_en:'Doomsday'},
        {id:'cr20', url:'Photos/cr20.png', name_ar:'المختار', name_en:'The Chosen'}
    ],
    titles:[
        // ألقاب حصرية للصناديق مقسمة بالندرة
        {id:'ct1', val:'الناجي الأخير', val_en:'The Last Survivor', tier:'tier-rare', icon:'fa-solid fa-biohazard'},
        {id:'ct2', val:'كسار العظام', val_en:'Bone Breaker', tier:'tier-rare', icon:'fa-solid fa-skull'},
        {id:'ct3', val:'مدمن الألم', val_en:'Pain Addict', tier:'tier-rare', icon:'fa-solid fa-face-grin-beam-sweat'},
        {id:'ct4', val:'ذئب منفرد', val_en:'Lone Wolf', tier:'tier-rare', icon:'fa-brands fa-wolf-pack-battalion'},
        {id:'ct5', val:'صائد الجوائز', val_en:'Bounty Hunter', tier:'tier-rare', icon:'fa-solid fa-sack-dollar'},
        
        {id:'ct6', val:'ظل الموت', val_en:'Death Shadow', tier:'tier-epic', icon:'fa-solid fa-ghost'},
        {id:'ct7', val:'مجنون الحديد', val_en:'Iron Psycho', tier:'tier-epic', icon:'fa-solid fa-link'},
        {id:'ct8', val:'نصل سام', val_en:'Toxic Blade', tier:'tier-epic', icon:'fa-solid fa-khanda'},
        {id:'ct9', val:'زعيم العصابة', val_en:'Mob Boss', tier:'tier-epic', icon:'fa-solid fa-user-tie'},
        {id:'ct10', val:'طاقة نووية', val_en:'Nuclear Energy', tier:'tier-epic', icon:'fa-solid fa-radiation'},

        {id:'ct11', val:'الكيان المطلق', val_en:'Absolute Entity', tier:'tier-legendary', icon:'fa-solid fa-infinity'},
        {id:'ct12', val:'أسطورة لا تموت', val_en:'Immortal Legend', tier:'tier-legendary', icon:'fa-solid fa-monument'},
        {id:'ct13', val:'حاكم الخريطة', val_en:'Map Ruler', tier:'tier-legendary', icon:'fa-solid fa-map-location-dot'},
        {id:'ct14', val:'جلاد الأبطال', val_en:'Heroes Executioner', tier:'tier-legendary', icon:'fa-solid fa-gavel'},
        {id:'ct15', val:'إله الحرب', val_en:'God of War', tier:'tier-legendary', icon:'fa-solid fa-meteor'},

        {id:'ct16', val:'الإمبراطور المظلم', val_en:'Dark Emperor', tier:'tier-mythic', icon:'fa-solid fa-chess-king'},
        {id:'ct17', val:'المُحطم', val_en:'The Crusher', tier:'tier-mythic', icon:'fa-solid fa-hammer'},
        {id:'ct18', val:'وحش الفالهالا', val_en:'Beast of Valhalla', tier:'tier-mythic', icon:'fa-solid fa-dragon'},
        {id:'ct19', val:'كابوس السيرفر', val_en:'Server Nightmare', tier:'tier-mythic', icon:'fa-solid fa-bug'},
        {id:'ct20', val:'الخطأ البرمجي', val_en:'The Glitch', tier:'tier-mythic', icon:'fa-solid fa-terminal'}
    ],
    borders:[
        // هالات حصرية خرافية جديدة
        {id:'cb_mythic1', val:'frame-mythic-beast', name_ar:'وحش الأساطير', name_en:'Mythic Beast'},
        {id:'cb_mythic2', val:'frame-cyber-god', name_ar:'إله السايبر', name_en:'Cyber God'},
        {id:'cb_mythic3', val:'frame-bloody-king', name_ar:'الملك الدموي', name_en:'Bloody King'},
        {id:'cb_mythic4', val:'frame-glitch', name_ar:'خطأ برمجي (جليتش)', name_en:'System Glitch'},
        {id:'cb_mythic5', val:'frame-blue-fire', name_ar:'نار أوزوريس', name_en:'Blue Hellfire'},
        {id:'cb_mythic6', val:'frame-venom', name_ar:'مستنقع السموم', name_en:'Venom Swamp'}
    ],
    themes:[
        // ثيمات حصرية للصناديق فقط
        {id:'cth1', val:'abyss', name_ar:'سيد الهاوية', name_en:'Abyss Lord', icon:'fa-solid fa-ghost', color:'#4a00e0'},
        {id:'cth2', val:'godmode', name_ar:'طور الوحش', name_en:'Beast Mode', icon:'fa-solid fa-bolt', color:'#ffffff'},
        {id:'cth3', val:'bloodlust', name_ar:'شهوة الدم', name_en:'Bloodlust', icon:'fa-solid fa-droplet', color:'#ff0000'},
{id:'cth4', val:'system_override', name_ar:'تعطيل النظام', name_en:'System Override', icon:'fa-solid fa-bug-slash', color:'#ff0000'}
    ]
};




let currentStoreTab = 'covers';



function applyAppTheme(themeVal){if(themeVal&&themeVal!=='default'){document.body.setAttribute('data-theme',themeVal)}else{document.body.removeAttribute('data-theme')}}








window.openStore = function() {
    if(window.innerWidth < 768) document.getElementById('sidebar').classList.add('collapsed');
    const mainContent = document.getElementById('main-content-area');
    if(!mainContent) return;
    if(!mainContent.dataset.originalContent) {
        mainContent.dataset.originalContent = mainContent.innerHTML;
    }
    
    const t = translations[currentLang || 'ar'];
    const data = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const xpBalance = (data.xp || 0) - (data.spentXp || 0);
    const ironCoinsBalance = data.ironCoins || 0;

    const swipeHint = `<div class="swipe-hint">${currentLang === 'en' ? '← Swipe tabs to explore →' : '← اسحب الشريط لاكتشاف الأقسام →'}</div>`;

    const tabsHTML = `
        <div class="store-tabs-container">


<button class="store-tab-btn ${currentStoreTab === 'crates' ? 'active' : ''}" onclick="switchStoreTab('crates')"><i class="fa-solid fa-box-open"></i> ${currentLang === 'en' ? 'Loot Crates' : 'الصناديق'}</button>

            <button class="store-tab-btn ${currentStoreTab === 'covers' ? 'active' : ''}" onclick="switchStoreTab('covers')"><i class="fa-solid fa-image"></i> ${currentLang === 'en' ? 'Covers' : 'الأغلفة'}</button>
            <button class="store-tab-btn ${currentStoreTab === 'borders' ? 'active' : ''}" onclick="switchStoreTab('borders')"><i class="fa-solid fa-circle-notch"></i> ${currentLang === 'en' ? 'Auras' : 'الهالات'}</button>
            <button class="store-tab-btn ${currentStoreTab === 'titles' ? 'active' : ''}" onclick="switchStoreTab('titles')"><i class="fa-solid fa-tag"></i> ${currentLang === 'en' ? 'Titles' : 'الألقاب'}</button>
            <button class="store-tab-btn ${currentStoreTab === 'themes' ? 'active' : ''}" onclick="switchStoreTab('themes')"><i class="fa-solid fa-palette"></i> ${currentLang === 'en' ? 'Themes' : 'الثيمات'}</button>
            <button class="store-tab-btn ${currentStoreTab === 'utilities' ? 'active' : ''}" onclick="switchStoreTab('utilities')"><i class="fa-solid fa-bolt"></i> ${currentLang === 'en' ? 'Utilities' : 'تسهيلات'}</button>
            <button class="store-tab-btn ${currentStoreTab === 'clanPerks' ? 'active' : ''}" onclick="switchStoreTab('clanPerks')"><i class="fa-solid fa-shield-cat"></i> ${currentLang === 'en' ? 'Clan Perks' : 'للعصابات'}</button>
            <button class="store-tab-btn ${currentStoreTab === 'packages' ? 'active' : ''}" onclick="switchStoreTab('packages')"><i class="fa-solid fa-cart-shopping"></i> ${currentLang === 'en' ? 'Buy Coins' : 'شراء عملات'}</button>
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
            <div style="display: flex; gap: 15px; margin-top: 15px; flex-wrap: wrap; justify-content: center;">
                <div class="currency-display xp-display">
                    <span>${xpBalance.toLocaleString()} XP</span> <i class="fa-solid fa-gem"></i>
                </div>
                <div class="currency-display coins-display">
                    <span>${ironCoinsBalance.toLocaleString()}</span> <i class="fa-solid fa-coins"></i>
                </div>
            </div>
        </header>
        ${swipeHint}
        ${tabsHTML}
        <section class="performance-container" style="animation: fadeIn 0.3s;" id="store-content-area">
        </section>
    `;
    document.getElementById('back-to-dash-btn').onclick = backToDashboard;
    renderStoreItems();
};

window.switchStoreTab = function(tab) {
    currentStoreTab = tab;


    document.querySelectorAll('.store-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });


    const activeBtn = document.querySelector(`.store-tab-btn[onclick="switchStoreTab('${tab}')"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }


    if (typeof renderStoreItems === 'function') {
        renderStoreItems();
    }
};




window.renderStoreItems = function() {
    const container = document.getElementById('store-content-area');
    const data = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const xpBalance = (data.xp || 0) - (data.spentXp || 0);
    const ironCoinsBalance = data.ironCoins || 0;
    
    const ownedItems = data.purchasedItems || [];
    const ownedCovers = data.purchasedCovers || []; 
    const inventory = data.inventory || [];
    const unlockedClanIcons = data.unlockedClanIcons || [];

    let html = '<div class="store-grid">';
    
    let itemsToRender = [];
    if (currentStoreTab === 'covers') {
        itemsToRender = profileCovers;
    } else if (currentStoreTab === 'crates') {
        itemsToRender = Object.values(cratesDB);
    } else {
        itemsToRender = storeItemsDB[currentStoreTab] || [];
    }

    if (currentStoreTab === 'themes') {
        const defaultThemeEquipped = (!data.currentTheme || data.currentTheme === 'default');
        html += `
            <div class="store-item-card ${defaultThemeEquipped ? 'equipped-glow' : ''}">
                <div class="store-item-content">
                    <div style="font-size: 2.5rem; color: #00f2a7; margin-bottom: 10px; text-shadow: 0 0 15px #00f2a7;"><i class="fa-solid fa-bolt"></i></div>
                    <h4 style="color: white; margin-bottom: 10px;">${currentLang === 'en' ? 'Neon Tech (Default)' : 'النيون (الافتراضي)'}</h4>
                    <button class="btn-primary" style="margin-top:auto; width: 100%; padding: 8px; ${defaultThemeEquipped ? 'background:#4CAF50; border-color:#4CAF50; color:white;' : 'background:transparent; color:#00f2a7;'}" ${defaultThemeEquipped ? 'disabled' : `onclick="equipStoreItem('theme', 'default')"`}>
                        ${defaultThemeEquipped ? (currentLang==='en'?'Equipped':'مُستخدم') : (currentLang==='en'?'Equip':'استخدام')}
                    </button>
                </div>
            </div>
        `;
    }
    
    itemsToRender.forEach(item => {
        let btnHTML = '';
        let isOwned = false;
        let isEquipped = false;
        let preview = '';
        let type = currentStoreTab;
        
        const isEn = currentLang === 'en';
        const name = isEn ? (item.name_en || item.val_en) : (item.name_ar || item.val);
        const shopAvatarUrl = data.photoURL || '/Photos/adm.png';

if (currentStoreTab === 'crates') {
            const userCratesCount = (data.crates && data.crates[item.id]) ? data.crates[item.id] : 0;
            const isWarCrate = item.id === 'war';
            
            // 🔥 إضافة زر المعلومات (i) هنا 🔥
            preview = `
                <div style="position: absolute; top: 10px; right: 10px;">
                    <button onclick="showCrateInfo('${item.id}')" style="background: rgba(255,255,255,0.1); border: 1px solid ${item.color}; color: ${item.color}; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; transition: 0.3s;">
                        <i class="fa-solid fa-info"></i>
                    </button>
                </div>
                <div style="font-size: 3.5rem; color: ${item.color}; margin-bottom: 10px; filter: drop-shadow(0 0 15px ${item.color});">
                    <i class="${item.icon}"></i>
                </div>
                <h4 style="color: white; margin-bottom: 5px;">${name}</h4>
                <span style="color: white; font-weight: bold; font-size:1rem; display:block; margin-bottom:10px; background:rgba(255,255,255,0.1); padding: 5px; border-radius: 8px;">
                    ${isEn ? 'Owned' : 'لديك'}: <span style="color:${item.color};">${userCratesCount}</span>
                </span>`;

            if (userCratesCount > 0) {
                btnHTML = `<button class="store-button-dashed use" onclick="initiateCrateOpen('${item.id}')" style="border-color:${item.color}; color:${item.color}; box-shadow: 0 0 10px ${item.color};">${isEn ? 'OPEN CRATE' : 'افتح الصندوق'}</button>`;
            } else if (isWarCrate) {
                btnHTML = `<button class="store-button-dashed cant-afford" disabled>${isEn ? 'Win Clan Wars to Earn' : 'يُكتسب بفوز الحروب فقط'}</button>`;
            } else {
                const canAfford = ironCoinsBalance >= item.price;
                const btnClass = canAfford ? '' : 'cant-afford';
                btnHTML = `<button class="store-button-dashed ${btnClass}" onclick="buyCrate('${item.id}', ${item.price})">${item.price.toLocaleString()} <i class="fa-solid fa-coins"></i></button>`;
            }
            html += `<div class="store-item-card"><div class="store-item-content">${preview}${btnHTML}</div></div>`;
            return;
        }



        else if (currentStoreTab === 'covers') {
            isOwned = ownedCovers.includes(item.id);
            isEquipped = data.currentCover === item.url;
            type = 'cover';
            preview = `<div class="cover-img-wrapper"><img src="${item.url}">${isOwned ? `<div class="owned-badge"><i class="fa-solid fa-check"></i></div>` : ''}</div><h4 style="color:white; margin:10px 0; font-size:0.9rem;">${name}</h4>`;
        } 
        else if (currentStoreTab === 'titles') {
            isOwned = ownedItems.includes(item.id);
            isEquipped = data.currentTitle === (item.val || item.val_en);
            type = 'title';
            const badgeContent = isEn ? `<i class="${item.icon}"></i> <span>${name}</span>` : `<span>${name}</span> <i class="${item.icon}"></i>`;
            preview = `<div style="height: 80px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px;"><div class="title-badge ${item.tier}">${badgeContent}</div></div>`;
        } 
        else if (currentStoreTab === 'borders') {
            isOwned = ownedItems.includes(item.id);
            isEquipped = data.currentBorder === item.val;
            type = 'border';
            preview = `<div style="height: 100px; display: flex; align-items: center; justify-content: center; margin-bottom: 15px; overflow: visible;"><div class="avatar-pro-wrapper ${item.val}" style="transform: scale(0.65);"><div class="profile-avatar-img" style="background-image: url('${shopAvatarUrl}');"></div></div></div><p style="color:white; font-weight:bold; margin: 0 0 15px 0;">${name}</p>`;
        } 
        else if (currentStoreTab === 'themes') {
            isOwned = ownedItems.includes(item.id);
            isEquipped = data.currentTheme === item.val;
            type = 'theme';
            preview = `<div style="font-size: 2.5rem; color: ${item.color}; margin-bottom: 10px; text-shadow: 0 0 15px ${item.color};"><i class="${item.icon}"></i></div><h4 style="color: white; margin-bottom: 10px;">${name}</h4>`;
        }
        else if (currentStoreTab === 'utilities') {
            let inventoryCount = inventory.filter(i => i === item.id).length;
            isOwned = inventoryCount > 0;
            type = 'utility';
            const desc = isEn ? item.desc_en : item.desc_ar;
            preview = `<div style="font-size: 2.5rem; color: #00f2a7; margin-bottom: 10px;"><i class="${item.icon}"></i></div><h4 style="color: white; margin-bottom: 5px;">${name}</h4><p style="color: var(--slate); font-size: 0.75rem; margin-bottom: 10px;">${desc}</p>${isOwned ? `<span style="color: gold; font-weight: bold; font-size:0.8rem; display:block; margin-bottom:10px;">${isEn ? 'Owned' : 'مملوك'}: ${inventoryCount}</span>` : ''}`;
        }
        else if (currentStoreTab === 'clanPerks') {
            isOwned = unlockedClanIcons.includes(item.id);
            type = 'clanPerk';
            preview = `<div style="font-size: 3rem; color: #FFD700; margin-bottom: 10px; filter: drop-shadow(0 0 10px #FFD700);"><i class="${item.icon}"></i></div><h4 style="color: white; margin-bottom: 10px;">${name}</h4>`;
        }
        else if (currentStoreTab === 'packages') {
            type = 'package';
            const desc = isEn ? item.desc_en : item.desc_ar;
            preview = `<div style="font-size: 3rem; color: #FFD700; margin-bottom: 10px;"><i class="${item.icon}"></i></div><h4 style="color: white; margin-bottom: 5px;">${name}</h4><p style="color: var(--slate); font-size: 0.75rem; margin-bottom: 10px;">${desc}</p>`;
        }

        html += generateStoreCardHTML(item, isOwned, isEquipped, xpBalance, ironCoinsBalance, type, preview, item.url || item.val);
    });

    html += '</div>';
    container.innerHTML = html;
};






window.generateStoreCardHTML = function(item, isOwned, isEquipped, xpBalance, ironCoinsBalance, type, previewHTML, val) {
    let btnHTML = '';
    
if (item.currency === 'usd') {
        btnHTML = `<button class="store-button-usd" onclick="buyWithLemonSqueezy('${item.id}', ${item.val})">
            $${item.price} <i class="fa-solid fa-cart-shopping"></i>
        </button>`;
    }

    else {
        const isXP = item.currency === 'xp';
        const userBalance = isXP ? xpBalance : ironCoinsBalance;
        const canAfford = userBalance >= item.price;
        const iconHTML = isXP ? '<i class="fa-solid fa-gem"></i>' : '<i class="fa-solid fa-coins"></i>';

        if (isEquipped) {
            btnHTML = `<button class="store-button-dashed equipped" disabled>${currentLang === 'en' ? 'Equipped' : 'مُستخدم'}</button>`;
        } 
        else if (isOwned && type === 'utility') {
            btnHTML = `<button class="store-button-dashed use" onclick="useUtilityItem('${item.id}', '${val}')">${currentLang === 'en' ? 'Use Item' : 'تفعيل الميزة'}</button>`;
        }
        else if (isOwned) {
            let buttonText = currentLang === 'en' ? 'Equip' : 'استخدام';
            let buttonAction = `equipStoreItem('${type}', '${val}')`;
            if(type === 'clanPerk') {
                buttonText = currentLang === 'en' ? 'Unlocked' : 'متاح للاستخدام';
                buttonAction = `alert('${currentLang === 'en' ? 'Go to Clan Settings to equip.' : 'اذهب لإعدادات العصابة للتفعيل.'}')`;
            }
            btnHTML = `<button class="store-button-dashed" onclick="${buttonAction}">${buttonText}</button>`;
        }
        else {
            const btnClass = canAfford ? '' : 'cant-afford';
            btnHTML = `<button class="store-button-dashed ${btnClass}" onclick="buyStoreItem('${type}', '${item.id}', ${item.price}, '${val}', '${item.currency}')">
                ${item.price.toLocaleString()} ${iconHTML}
            </button>`;
        }
    }

    let topContent = previewHTML;
    return `<div class="store-item-card ${isEquipped ? 'equipped-glow' : ''}"><div class="store-item-content">${topContent}${btnHTML}</div></div>`;
};

window.buyStoreItem = async function(type, itemId, price, val, currency) {
    const user = auth.currentUser;
    if(!user) return;
    
    let data = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const isXP = currency === 'xp';
    let currentBalance = isXP ? ((data.xp || 0) - (data.spentXp || 0)) : (data.ironCoins || 0);

    if (currentBalance < price) {
        showToast(currentLang === 'en' ? "Not enough funds!" : "رصيدك غير كافٍ!");
        return;
    }

    if (!confirm(currentLang === 'en' ? `Buy for ${price} ${currency}?` : `تأكيد الشراء بـ ${price} ${isXP ? 'XP' : 'عملة حديدية'}؟`)) return;

    const btn = event.target.closest('button');
    let originalHtml = '';
    if (btn) {
        originalHtml = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
        btn.disabled = true;
    }

    try {
        // 🔥 استدعاء السيرفر بدلاً من التعديل المباشر الممنوع في الـ Rules
        const secureBuyCall = firebase.functions().httpsCallable('secureBuyItem');
        const result = await secureBuyCall({
            itemType: type,
            itemId: itemId,
            price: price,
            itemVal: val,
            currency: currency
        });

        if (result.data && result.data.success) {
            // تحديث الواجهة والـ LocalStorage محلياً بعد نجاح العملية في السيرفر
            if (isXP) {
                data.spentXp = (data.spentXp || 0) + price;
            } else {
                data.ironCoins = (data.ironCoins || 0) - price;
            }

            if (type === 'cover') {
                if (!data.purchasedCovers) data.purchasedCovers =[];
                data.purchasedCovers.push(itemId);
                data.currentCover = val;
            } else if (type === 'utility') {
                if (!data.inventory) data.inventory =[];
                data.inventory.push(itemId);
            } else if (type === 'clanPerk') {
                if (!data.unlockedClanIcons) data.unlockedClanIcons =[];
                data.unlockedClanIcons.push(itemId);
            } else {
                if (!data.purchasedItems) data.purchasedItems =[];
                data.purchasedItems.push(itemId);
                if (type === 'title') data.currentTitle = val;
                if (type === 'border') data.currentBorder = val;
                if (type === 'theme') { 
                    data.currentTheme = val; 
                    if(typeof applyAppTheme === 'function') applyAppTheme(val); 
                }
            }

            localStorage.setItem('currentUser', JSON.stringify(data));
            showToast(currentLang === 'en' ? "Purchase Successful!" : "تم الشراء بنجاح يا وحش!");
            openStore();
        }
    } catch (e) {
        console.error(e);
        showToast(currentLang === 'en' ? "Purchase failed!" : "فشل الشراء! " + (e.message || ""));
        if(btn) { btn.innerHTML = originalHtml; btn.disabled = false; }
    }
};




window.equipStoreItem = async function(type, val, isFromInventory = false) {
    const user = auth.currentUser;
    if(!user) return;
    
    let data = JSON.parse(localStorage.getItem('currentUser') || '{}');
    let updates = {};

    if (type === 'cover') { data.currentCover = val; updates.currentCover = val; }
    if (type === 'title') { data.currentTitle = val; updates.currentTitle = val; }
    if (type === 'border') { data.currentBorder = val; updates.currentBorder = val; }
    if (type === 'theme') { data.currentTheme = val; updates.currentTheme = val; applyAppTheme(val); }
    
    localStorage.setItem('currentUser', JSON.stringify(data));
    
    try {
        await db.collection('users').doc(user.uid).update(updates);
        showToast(currentLang === 'en' ? "Equipped successfully!" : "تم التجهيز بنجاح!");
        

        if (isFromInventory) {
            renderInventoryItems(); 
        } else {
            openStore();
        }
    } catch(e) {
        console.error(e);
        showToast(currentLang === 'en' ? "Failed to equip!" : "فشل التجهيز!");
    }
};




window.useUtilityItem = async function(itemId, utilityType) {
    const user = auth.currentUser;
    if(!user) return;
    
    if (!confirm(currentLang === 'en' ? "Consume this item now?" : "هل أنت متأكد من تفعيل واستهلاك هذه الميزة الآن؟")) return;

    let data = JSON.parse(localStorage.getItem('currentUser') || '{}');
    let inventory = data.inventory || [];
    
    const index = inventory.indexOf(itemId);
    if (index > -1) {
        inventory.splice(index, 1);
    } else {
        showToast(currentLang === 'en' ? "Item not found in inventory." : "العنصر غير موجود في مخزونك.");
        return;
    }

    let updates = { inventory: inventory };

    try {
        if (utilityType === 'name_reset') {
            updates.lastNameUpdate = 0;
            data.lastNameUpdate = 0;
            showToast(currentLang === 'en' ? "Name cooldown reset! You can change it now." : "تم تصفير عداد الاسم! يمكنك تغييره الآن من البروفايل.");
        } 
        else if (utilityType === 'loc_reset') {
            updates.lastLocationUpdate = 0;
            data.lastLocationUpdate = 0;
            showToast(currentLang === 'en' ? "Location cooldown reset!" : "تم تصفير عداد الموقع! يمكنك تغييره الآن.");
        } 
        else if (utilityType === 'quest_reset') {
            updates['quests.lastDailyReset'] = "";
            data.quests.lastDailyReset = "";
            showToast(currentLang === 'en' ? "Quests refreshed!" : "تم تحديث المهام بنجاح! راجع صفحتك الرئيسية.");
        }

        await db.collection('users').doc(user.uid).update(updates);
        data.inventory = inventory;
        localStorage.setItem('currentUser', JSON.stringify(data));
        
        if (utilityType === 'quest_reset' && typeof initQuests === 'function') {
            initQuests(); 
        }

        openStore();

    } catch (e) {
        console.error("Utility error:", e);
        showToast(currentLang === 'en' ? "Failed to use item!" : "فشل تفعيل الميزة!");
    }
};





const appFAQs=[{q_ar:"كيف أجمع نقاط الخبرة (XP) وأرفع مستواي؟",a_ar:"تحصل على 50 XP يومياً عند إكمال تمرينك، وتجمع نقاطاً إضافية عبر تحصيل 'ضريبة الملك' أو لعب التحديات.",q_en:"How do I earn XP and level up?",a_en:"You earn 50 XP daily for completing a workout. You can also claim the 'King's Tribute' or play challenges."},{q_ar:"ما هي ضريبة الملك؟",a_ar:"إذا كنت مسيطراً على مدينتك كـ 'وحش المدينة'، يمكنك المطالبة بضريبة يومية (XP مجاني) من لوحة القيادة.",q_en:"What is the King's Tribute?",a_en:"If you rule your city as the 'City Monster', you can claim a daily tribute (free XP) from your dashboard."},{q_ar:"هل يمكنني خسارة نقاط XP؟",a_ar:"لا، نقاط الـ XP المتراكمة لا تنقص، ولكن تصنيفك قد يتراجع إذا تفوق عليك لاعبون آخرون.",q_en:"Can I lose XP points?",a_en:"No, accumulated XP doesn't decrease, but your rank might drop if others surpass you."},{q_ar:"كيف أحصل على الأوسمة (Badges)؟",a_ar:"الأوسمة تُفتح تلقائياً عند تحقيق أهداف معينة، مثل تسجيل 50 تمريناً، أو تحقيق رقم قياسي جديد.",q_en:"How do I unlock Badges?",a_en:"Badges unlock automatically upon reaching milestones, like logging 50 workouts or hitting a PR."},{q_ar:"كيف أسيطر على مدينتي (وحش المدينة)؟",a_ar:"يجب أن تسجل أعلى وزن (Max Weight) في أي تمرين ضمن مدينتك. النظام سيطلب منك إثبات فيديو لمراجعته.",q_en:"How do I become the City Monster?",a_en:"Log the heaviest Max Weight for any exercise in your city. The system will prompt you for video proof."},{q_ar:"ماذا يحدث إذا رفضت الإدارة الفيديو الخاص بي؟",a_ar:"سيصلك إشعار بالرفض ولن يتم احتساب وزنك القياسي في لوحة الصدارة. يجب أن يكون الفيديو واضحاً.",q_en:"What happens if Admin rejects my video?",a_en:"You'll receive a notification, and your record won't count on the leaderboard. Ensure clear video proof."},{q_ar:"كيف أغير مدينتي على الخريطة؟",a_ar:"تواصل مع الإدارة عبر نموذج 'تواصل معنا' لطلب تغيير مدينتك الحالية إذا انتقلت لسكن جديد.",q_en:"How do I change my city on the map?",a_en:"Contact support via the 'Contact Us' form to request a city change if you moved."},{q_ar:"هل يمكنني السيطرة على أكثر من مدينة؟",a_ar:"حالياً، يمكنك المنافسة والسيطرة فقط في المدينة المسجلة في حسابك.",q_en:"Can I rule more than one city?",a_en:"Currently, you can only compete and rule in the city registered to your account."},{q_ar:"كيف يعمل رادار التوازن العضلي؟",a_ar:"يقرأ الرادار أعلى أوزانك في التمارين الخمسة الكبرى. إذا كان الشكل مشوهاً، فهذا يعني أن لديك عضلة ضعيفة.",q_en:"How does the Muscle Radar work?",a_en:"It plots your PRs for the Big 5 lifts. If skewed, you have a weak point to focus on."},{q_ar:"ما هو مؤشر الجاهزية العصبية (TSB)؟",a_ar:"نظام أولمبي يحسب لياقتك وإرهاقك. إذا كان باللون الأحمر، يجب أن ترتاح لضمان عدم الهدم العضلي.",q_en:"What is the CNS Readiness Index (TSB)?",a_en:"An Olympic system calculating fitness vs fatigue. If red, rest to avoid overtraining."},{q_ar:"كيف أسجل تمرين جديد؟",a_ar:"من الشاشة الرئيسية للوحة التحكم، اضغط على 'تمرين جديد'، اختر العضلة، وابدأ بإضافة التمارين والجولات.",q_en:"How do I log a new workout?",a_en:"From the dashboard, click 'New Workout', select the muscle group, and add exercises and sets."},{q_ar:"ما هي ميزة التمرين اللايف؟",a_ar:"تسمح لك بتسجيل الجولات داخل النادي بالوقت الفعلي مع مؤقت راحة ذكي بين كل جولة.",q_en:"What is the Live Workout feature?",a_en:"Allows you to log sets in real-time at the gym with a smart rest timer between sets."},{q_ar:"كيف أحسب الحد الأقصى لتكرار واحد (1RM)؟",a_ar:"التطبيق يحسبه لك تلقائياً بناءً على أعلى وزن وأكبر عدد تكرارات أدخلتها في سجل تمرينك.",q_en:"How do I calculate my 1RM?",a_en:"The app calculates it automatically based on your heaviest weight and highest reps logged."},{q_ar:"كيف أضيف تمرين غير موجود في القائمة؟",a_ar:"حالياً القائمة تضم التمارين المعتمدة عالمياً. يمكنك اقتراح تمارين جديدة عبر رسائل الدعم الفني.",q_en:"How to add an exercise not on the list?",a_en:"The list has global standard exercises. Suggest new ones via the contact form."},{q_ar:"هل يجب أن أتمرن كل يوم للتقدم؟",a_ar:"لا! العضلات تنمو أثناء الراحة. مؤشر الـ TSB سيخبرك متى يجب أن تأخذ يوم راحة.",q_en:"Do I have to workout everyday to progress?",a_en:"No! Muscles grow during rest. The TSB indicator will tell you when to take a rest day."},{q_ar:"كيف ألعب تحدي الديدليفت؟",a_ar:"في قسم الألعاب، اضغط بشكل متكرر وسريع لرفع البار قبل انتهاء الوقت المخصص للفوز بالـ XP.",q_en:"How to play the Deadlift challenge?",a_en:"In the games section, tap repeatedly and fast to lift the bar before time runs out to win XP."},{q_ar:"لعبة السكوات تعتمد على ماذا؟",a_ar:"تعتمد على التوقيت! يجب إيقاف المؤشر في المنطقة الخضراء لضمان رفعة صحيحة وتجنب الإصابة الوهمية.",q_en:"What does the Squat game rely on?",a_en:"Timing! Stop the indicator in the green zone to ensure a perfect lift and avoid virtual injury."},{q_ar:"ما فائدة المتجر؟",a_ar:"يمكنك استخدام نقاط XP التي جمعتها لشراء أغلفة (Covers) فخمة لتزيين ملفك الشخصي وإبهار أصدقائك.",q_en:"What is the Store for?",a_en:"Use your hard-earned XP to buy premium Profile Covers to decorate your page and impress friends."},{q_ar:"هل الأغلفة تعطيني ميزات إضافية؟",a_ar:"الأغلفة هي مظهر جمالي فقط (Cosmetic) لتمييز اللاعبين المحترفين عن المبتدئين.",q_en:"Do covers give me extra stats?",a_en:"Covers are purely cosmetic to distinguish pro players from beginners."},{q_ar:"كيف أضيف أصدقاء؟",a_ar:"اذهب إلى 'مجتمع الأبطال'، وابحث عن صديقك باستخدام معرّف اللاعب (Player ID) الخاص به.",q_en:"How do I add friends?",a_en:"Go to the 'Heroes Community' and search for your friend using their Player ID."},{q_ar:"أين أجد الـ Player ID الخاص بي؟",a_ar:"موجود في صفحة البروفايل الخاص بك تحت اسمك مباشرة.",q_en:"Where is my Player ID?",a_en:"It is located on your Profile page right beneath your name."},{q_ar:"هل الرسائل في التطبيق آمنة؟",a_ar:"نعم، الدردشة الفورية مشفرة والرسائل تختفي تلقائياً بعد 24 ساعة لضمان الخصوصية.",q_en:"Are messages secure?",a_en:"Yes, direct chats are encrypted and auto-delete after 24 hours for privacy."},{q_ar:"كيف أحظر مستخدم مزعج؟",a_ar:"ادخل إلى محادثته، اضغط على أيقونة الإعدادات العلوية، واختر 'حظر المستخدم'.",q_en:"How to block an annoying user?",a_en:"Open their chat, click the top settings icon, and select 'Block User'."},{q_ar:"كيف أنشر إنجازي على المنصة؟",a_ar:"عند كسر رقم قياسي جديد (PR)، سيظهر لك زر 'مشاركة' لنشره مباشرة في لوحة المجتمع.",q_en:"How do I share my achievement?",a_en:"When you hit a new PR, a 'Share' button will appear to post it to the community board."},{q_ar:"نسيت كلمة المرور، ماذا أفعل؟",a_ar:"من شاشة تسجيل الدخول، اضغط على 'نسيت كلمة المرور'، وأدخل بريدك ليصلك رابط إعادة التعيين.",q_en:"I forgot my password, what do I do?",a_en:"From login, click 'Forgot Password' and enter your email for a reset link."},{q_ar:"كيف أغير صورة حسابي والغلاف الشخصي؟",a_ar:"اضغط على أيقونة الكاميرا في البروفايل لتغيير الصورة. أما الغلاف، فيمكنك تغييره بعد شرائه من المتجر.",q_en:"How to change avatar and cover?",a_en:"Click the camera icon on your profile for the avatar. Covers are changed after buying from the store."},{q_ar:"التطبيق يعلق أو بطيء، ما الحل؟",a_ar:"تأكد من جودة اتصالك بالإنترنت. إذا استمرت المشكلة، قم بمسح ذاكرة التخزين المؤقت للمتصفح (Clear Cache).",q_en:"App is lagging, what is the solution?",a_en:"Check your internet connection. If it persists, clear your browser's cache."},{q_ar:"كيف أحذف حسابي نهائياً؟",a_ar:"لحذف الحساب وكل بياناتك، تواصل مع الإدارة عبر نموذج 'تواصل معنا' وسيم مسح كل شيء خلال 48 ساعة.",q_en:"How to delete my account permanently?",a_en:"Contact admin via the 'Contact Us' form. All data will be wiped within 48 hours."},{q_ar:"هل يمكنني تغيير اسم العرض الخاص بي؟",a_ar:"نعم، اذهب إلى إعدادات الحساب وقم بتعديل الاسم (يُسمح بتغييره مرة واحدة كل 30 يوم).",q_en:"Can I change my display name?",a_en:"Yes, go to account settings to edit it (allowed once every 30 days)."},{q_ar:"لماذا لم تصلني رسالة تفعيل الإيميل؟",a_ar:"تأكد من مجلد الرسائل المزعجة (Spam/Junk). إذا لم تجدها، اطلب إعادة إرسالها من صفحة تسجيل الدخول.",q_en:"Why didn't I get the verification email?",a_en:"Check your Spam/Junk folder. If not there, request a resend from the login page."}];window.openHelpModal=function(){document.getElementById('help-modal').classList.add('active');renderFAQs()};window.closeHelpModal=function(){document.getElementById('help-modal').classList.remove('active')};window.switchHelpTab=function(tab){document.getElementById('faq-tab-btn').classList.remove('active');document.getElementById('contact-tab-btn').classList.remove('active');document.getElementById('faq-section').style.display='none';document.getElementById('contact-section').style.display='none';document.getElementById(`${tab}-tab-btn`).classList.add('active');document.getElementById(`${tab}-section`).style.display='block'};function renderFAQs(){const container=document.getElementById('faq-container');if(!container)return;const isEn=currentLang==='en';const alignObj=isEn?{text:'left',dir:'ltr',arrow:'margin-left'}:{text:'right',dir:'rtl',arrow:'margin-right'};container.innerHTML=appFAQs.map((faq)=>{const q=isEn?faq.q_en:faq.q_ar;const a=isEn?faq.a_en:faq.a_ar;return `
            <div class="accordion-item" style="border-bottom: 1px solid rgba(255,255,255,0.1); margin-bottom: 5px; background: rgba(0,0,0,0.2); direction: ${alignObj.dir}; text-align: ${alignObj.text};">
                <button class="accordion-header" onclick="this.parentElement.classList.toggle('active')" style="padding: 15px; font-size: 0.95rem; width: 100%; display: flex; justify-content: space-between; align-items: center; border: none; background: transparent; color: white; cursor: pointer;">
                    <span style="font-weight: bold; text-align: ${alignObj.text};">${q}</span>
                    <i class="fa-solid fa-chevron-down arrow" style="font-size: 0.8rem; ${alignObj.arrow}: 10px;"></i>
                </button>
                <div class="accordion-content" style="padding: 0 15px;">
                    <p style="padding-bottom: 15px; color: var(--slate); font-size: 0.85rem; line-height: 1.6; text-align: ${alignObj.text};">${a}</p>
                </div>
            </div>
        `}).join('')}
document.addEventListener('DOMContentLoaded',()=>{const contactForm=document.getElementById('contact-us-form');if(contactForm){contactForm.onsubmit=async(e)=>{e.preventDefault();const btn=document.getElementById('contact-submit-btn');const email=document.getElementById('contact-email').value;const msg=document.getElementById('contact-message').value;btn.disabled=!0;btn.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i>';try{await db.collection('contact_messages').add({email:email,message:msg,status:'unread',timestamp:firebase.firestore.FieldValue.serverTimestamp()});showToast(currentLang==='en'?" Message sent to Admin!":" تم إرسال رسالتك للإدارة بنجاح!");contactForm.reset();setTimeout(closeHelpModal,1500)}catch(error){console.error(error);showToast(currentLang==='en'?" Failed to send message.":" فشل إرسال الرسالة، تأكد من اتصالك.")}finally{btn.disabled=!1;btn.innerHTML=currentLang==='en'?"Send Message":"إرسال الرسالة"}}}});



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
    } else if (policyType === 'refund') {
        // تمت إضافة قسم الـ Refund هنا
        titleEl.innerText = t.legal_refund_title;
        bodyEl.innerHTML = t.legal_refund_body;
    }

    modal.classList.add('active');
};

window.closeLegalModal=function(){document.getElementById('legal-modal').classList.remove('active')};async function requestNotificationPermission(){if(!messaging)return;try{const permission=await Notification.requestPermission();if(permission==='granted'){const registration=await navigator.serviceWorker.register('/sw.js');await navigator.serviceWorker.ready;const currentToken=await messaging.getToken({vapidKey:'BDskkDNXkSMGBNlDiNpCNGdAMnoBbglgvzsuBGEe6t4syoS-k97sJOKbIrPYK_vUDkL6tv8d34Bj_nPm-G_cTJM',serviceWorkerRegistration:registration});if(currentToken){const user=auth.currentUser;if(user){const userRef=db.collection('users').doc(user.uid);const userDoc=await userRef.get();const savedToken=userDoc.data()?.fcmToken;if(!savedToken||savedToken!==currentToken){await userRef.update({fcmToken:firebase.firestore.FieldValue.delete()});await new Promise(resolve=>setTimeout(resolve,500));await userRef.set({fcmToken:currentToken.trim()},{merge:!0});console.log("تم مسح التوكن القديم وتوليد واحد جديد بنجاح!");showToast("🔔 تم تفعيل نظام الإشعارات!")}}}}}catch(error){console.error('خطأ في تفعيل الإشعارات: ',error)}}
const questBank={daily:[{id:'d_v1',type:'volume',target:1000,xp:30,ar:'تسخين العضلات',en:'Warmup Set',desc_ar:'ارفع إجمالي 1000 كجم اليوم',desc_en:'Lift a total of 1,000 kg today'},{id:'d_v2',type:'volume',target:1500,xp:40,ar:'بداية الضخ',en:'First Pump',desc_ar:'ارفع إجمالي 1500 كجم اليوم',desc_en:'Lift a total of 1,500 kg today'},{id:'d_v3',type:'volume',target:1750,xp:60,ar:'جهد ملحوظ',en:'Solid Effort',desc_ar:'ارفع إجمالي 1750 كجم اليوم',desc_en:'Lift a total of 1,750 kg today'},{id:'d_v4',type:'volume',target:2000,xp:90,ar:'وحش الأوزان',en:'Weight Beast',desc_ar:'ارفع إجمالي 2000 كجم اليوم',desc_en:'Lift a total of 2,000 kg today'},{id:'d_r1',type:'reps',target:40,xp:30,ar:'حركة مستمرة',en:'Keep Moving',desc_ar:'العب 40 عدة إجمالاً اليوم',desc_en:'Perform 40 total reps today'},{id:'d_r2',type:'reps',target:80,xp:50,ar:'قوة التحمل',en:'Endurance',desc_ar:'العب 80 عدة إجمالاً اليوم',desc_en:'Perform 80 total reps today'},{id:'d_r3',type:'reps',target:120,xp:70,ar:'ألياف نشطة',en:'Active Fibers',desc_ar:'العب 120 عدة إجمالاً اليوم',desc_en:'Perform 120 total reps today'},{id:'d_r4',type:'reps',target:150,xp:100,ar:'بطل الماراثون',en:'Marathon Champ',desc_ar:'العب 150 عدة إجمالاً اليوم',desc_en:'Perform 150 total reps today'},{id:'d_m1',type:'meal',target:1,xp:20,ar:'وقود الجسم',en:'Body Fuel',desc_ar:'سجل وجبة صحية واحدة',desc_en:'Log 1 healthy meal'},{id:'d_m2',type:'meal',target:2,xp:40,ar:'تغذية سليمة',en:'Clean Diet',desc_ar:'سجل وجبتين صحيتين',desc_en:'Log 2 healthy meals'},{id:'d_m3',type:'meal',target:3,xp:80,ar:'طباخ الجيم',en:'Gym Chef',desc_ar:'سجل 3 وجبات صحية اليوم',desc_en:'Log 3 healthy meals today'},{id:'d_soc1',type:'tribute',target:1,xp:30,ar:'تفقد الخريطة',en:'Map Recon',desc_ar:'افتح الخريطة وحصل ضريبة الملك',desc_en:'Open map & claim King Tribute'},{id:'d_soc2',type:'leaderboard',target:1,xp:20,ar:'مراقبة الخصوم',en:'Scout Rivals',desc_ar:'افتح لوحة المتصدرين اليوم',desc_en:'Check the leaderboard today'},{id:'d_soc3',type:'chat',target:1,xp:30,ar:'دعم الأبطال',en:'Support Heroes',desc_ar:'أرسل رسالة في الدردشة لأي صديق',desc_en:'Send a chat message to a friend'},{id:'d_dl1',type:'dl_score',target:50,xp:30,ar:'سحب سريع',en:'Quick Pull',desc_ar:'اجمع 50 نقطة بلعبة الديدليفت',desc_en:'Score 50 in DL Game'},{id:'d_dl2',type:'dl_score',target:150,xp:50,ar:'قبضة محكمة',en:'Firm Grip',desc_ar:'اجمع 150 نقطة بلعبة الديدليفت',desc_en:'Score 150 in DL Game'},{id:'d_dl3',type:'dl_score',target:250,xp:80,ar:'ملك الرفعة',en:'Lift King',desc_ar:'اجمع 250 نقطة بلعبة الديدليفت',desc_en:'Score 250 in DL Game'},{id:'d_dl4',type:'dl_score',target:400,xp:120,ar:'ظهر فولاذي',en:'Steel Back',desc_ar:'اجمع 400 نقطة بلعبة الديدليفت',desc_en:'Score 400 in DL Game'},{id:'d_dlc1',type:'dl_combo',target:50,xp:40,ar:'تزامن',en:'Sync',desc_ar:'حقق كومبو 50 بلعبة الديدليفت',desc_en:'Reach 50 Combo in DL'},{id:'d_dlc2',type:'dl_combo',target:65,xp:60,ar:'غضب متتالي',en:'Chain Rage',desc_ar:'حقق كومبو 65 بلعبة الديدليفت',desc_en:'Reach 65 Combo in DL'},{id:'d_dlc3',type:'dl_combo',target:80,xp:100,ar:'لا يمكن إيقافه',en:'Unstoppable',desc_ar:'حقق كومبو 80 بلعبة الديدليفت',desc_en:'Reach 80 Combo in DL'},{id:'d_sq1',type:'sq_score',target:50,xp:30,ar:'نزول آمن',en:'Safe Drop',desc_ar:'اجمع 50 نقطة بلعبة السكوات',desc_en:'Score 50 in Squat Game'},{id:'d_sq2',type:'sq_score',target:100,xp:50,ar:'توازن جيد',en:'Good Balance',desc_ar:'اجمع 100 نقطة بلعبة السكوات',desc_en:'Score 100 in Squat Game'},{id:'d_sq3',type:'sq_score',target:150,xp:80,ar:'أرجل صلبة',en:'Solid Legs',desc_ar:'اجمع 150 نقطة بلعبة السكوات',desc_en:'Score 150 in Squat Game'},{id:'d_sq4',type:'sq_score',target:250,xp:120,ar:'ثبات الجبل',en:'Mountain Stance',desc_ar:'اجمع 250 نقطة بلعبة السكوات',desc_en:'Score 250 in Squat Game'}],weekly:[{id:'w_v1',type:'volume',target:30000,xp:350,ar:'أسبوع الإحماء',en:'Warmup Week',desc_ar:'ارفع إجمالي 30000 كجم هذا الأسبوع',desc_en:'Lift 30,000 total this week'},{id:'w_v2',type:'volume',target:35000,xp:600,ar:'عمل شاق',en:'Hard Work',desc_ar:'ارفع إجمالي 35000 كجم هذا الأسبوع',desc_en:'Lift 35,000 "kg total this week'},{id:'w_v3',type:'volume',target:40000,xp:750,ar:'دبابة بشرية',en:'Human Tank',desc_ar:'ارفع إجمالي 40000 كجم هذا الأسبوع',desc_en:'Lift 40,000 kg total this week'},{id:'w_v4',type:'volume',target:45000,xp:1000,ar:'أسطورة النادي',en:'Gym Legend',desc_ar:'ارفع إجمالي 45000 كجم هذا الأسبوع',desc_en:'Lift 45,000 kg total this week'},{id:'w_r1',type:'reps',target:200,xp:250,ar:'ألياف مرنة',en:'Flexible Fibers',desc_ar:'العب 200 عدة إجمالاً هذا الأسبوع',desc_en:'Perform 200 reps this week'},{id:'w_r2',type:'reps',target:400,xp:450,ar:'مضخة الأسبوع',en:'Week Pump',desc_ar:'العب 400 عدة إجمالاً هذا الأسبوع',desc_en:'Perform 400 reps this week'},{id:'w_r3',type:'reps',target:600,xp:800,ar:'لا تشعر بالتعب',en:'Tireless',desc_ar:'العب 600 عدة إجمالاً هذا الأسبوع',desc_en:'Perform 600 reps this week'},{id:'w_r4',type:'reps',target:800,xp:1200,ar:'محرك ديزل',en:'Diesel Engine',desc_ar:'العب 800 عدة إجمالاً هذا الأسبوع',desc_en:'Perform 800 reps this week'},{id:'w_d1',type:'workout_days',target:3,xp:300,ar:'تمرين منتظم',en:'Regular Training',desc_ar:'سجل تمارين في 3 أيام مختلفة',desc_en:'Log workouts on 3 different days'},{id:'w_d2',type:'workout_days',target:4,xp:500,ar:'التزام مثالي',en:'Perfect Discipline',desc_ar:'سجل تمارين في 4 أيام مختلفة',desc_en:'Log workouts on 4 different days'},{id:'w_d3',type:'workout_days',target:5,xp:800,ar:'وحش الانضباط',en:'Discipline Beast',desc_ar:'سجل تمارين في 5 أيام مختلفة',desc_en:'Log workouts on 5 different days'},{id:'w_m1',type:'meal',target:10,xp:300,ar:'نظام صحي',en:'Healthy Pattern',desc_ar:'سجل 10 وجبات صحية هذا الأسبوع',desc_en:'Log 10 healthy meals this week'},{id:'w_m2',type:'meal',target:15,xp:500,ar:'مكينة هضم',en:'Digestion Machine',desc_ar:'سجل 15 وجبة صحية هذا الأسبوع',desc_en:'Log 15 healthy meals this week'},{id:'w_m3',type:'meal',target:20,xp:800,ar:'جسم نظيف 100%',en:'Clean Body',desc_ar:'سجل 20 وجبة صحية هذا الأسبوع',desc_en:'Log 20 healthy meals this week'},{id:'w_g1',type:'dl_score',target:2000,xp:400,ar:'بطل الديدليفت',en:'DL Master',desc_ar:'اجمع 2000 نقطة ديدليفت في الأسبوع',desc_en:'Score 2000 in DL over the week'},{id:'w_g2',type:'sq_score',target:1500,xp:400,ar:'سيد التوازن',en:'Balance Lord',desc_ar:'اجمع 1500 نقطة سكوات في الأسبوع',desc_en:'Score 1500 in Squat over the week'}]};function initQuests(){let savedData=JSON.parse(localStorage.getItem('currentUser')||'{}');if(!savedData.quests)savedData.quests={active:[],progress:{}};const todayStr=new Date().toDateString();const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+3-(d.getDay()+6)%7);const weekStr=`${d.getFullYear()}-W${Math.round(((d.getTime() - new Date(d.getFullYear(), 0, 4).getTime()) / 86400000) / 7) + 1}`;let needsUpdate=!1;if(savedData.quests.lastDailyReset!==todayStr){let dailyPool=[...questBank.daily].sort(()=>0.5-Math.random()).slice(0,3);savedData.quests.active=savedData.quests.active.filter(q=>q.id.startsWith('w_'));dailyPool.forEach(q=>savedData.quests.active.push(q));for(let key in savedData.quests.progress){if(key.startsWith('d_'))delete savedData.quests.progress[key]}
savedData.quests.lastDailyReset=todayStr;needsUpdate=!0}
if(savedData.quests.lastWeeklyReset!==weekStr){let weeklyPool=[...questBank.weekly].sort(()=>0.5-Math.random()).slice(0,1);savedData.quests.active=savedData.quests.active.filter(q=>q.id.startsWith('d_'));weeklyPool.forEach(q=>savedData.quests.active.push(q));for(let key in savedData.quests.progress){if(key.startsWith('w_'))delete savedData.quests.progress[key]}
savedData.quests.lastWeeklyReset=weekStr;needsUpdate=!0}
if(needsUpdate){localStorage.setItem('currentUser',JSON.stringify(savedData));if(auth.currentUser)db.collection('users').doc(auth.currentUser.uid).update({quests:savedData.quests})}
renderQuests()}
let questTimerInterval;window.renderQuests=function(){const container=document.getElementById('active-quests-container');if(!container)return;let savedData=JSON.parse(localStorage.getItem('currentUser')||'{}');let activeQuests=savedData.quests?.active||[];let progressData=savedData.quests?.progress||{};const isEn=currentLang==='en';if(activeQuests.length===0){container.innerHTML=`<p style="text-align:center; color:var(--slate);">${isEn ? 'No quests right now.' : 'لا توجد مهام حالياً.'}</p>`;return}
activeQuests.sort((a,b)=>(b.id.startsWith('w_')?1:0)-(a.id.startsWith('w_')?1:0));container.innerHTML=activeQuests.map(quest=>{let currentProg=progressData[quest.id]||0;let isCompleted=currentProg>=quest.target;if(currentProg>quest.target)currentProg=quest.target;let percent=(currentProg/quest.target)*100;let title=isEn?quest.en:quest.ar;let desc=isEn?quest.desc_en:quest.desc_ar;let isWeekly=quest.id.startsWith('w_');let iconHtml=isWeekly?'<i class="fa-solid fa-star" style="color: #FFD700;"></i>':'<i class="fa-solid fa-bolt" style="color: var(--primary-color);"></i>';let overlayHTML=isCompleted?`<div class="quest-completed-overlay"><i class="fa-solid fa-check-circle"></i> ${isEn ? 'Completed!' : 'مكتملة!'}</div>`:'';let weeklyBadge=isWeekly?`<span style="display:inline-block; font-size:0.65rem; background: rgba(255,215,0,0.15); color: #FFD700; padding: 2px 6px; border-radius: 6px; border: 1px solid rgba(255,215,0,0.3); margin: 0 4px; font-weight: bold; white-space: nowrap;"><i class="fa-regular fa-clock"></i> <span class="weekly-timer-text">...</span></span>`:'';return `
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
        `}).join('');const titleEl=document.querySelector('[data-translate="quests_title"]');if(titleEl)titleEl.innerText=isEn?'Bounty Board':'لوحة المهام';const timerEl=document.getElementById('quest-timer');const updateTimers=()=>{const now=new Date();if(timerEl){const tomorrow=new Date(now);tomorrow.setHours(24,0,0,0);const dailyTimeLeftMs=tomorrow-now;const hours=Math.floor(dailyTimeLeftMs/(1000*60*60));const minutes=Math.floor((dailyTimeLeftMs%(1000*60*60))/(1000*60));timerEl.innerText=isEn?`Resets in ${hours}h ${minutes}m`:`تتجدد خلال ${hours}س و${minutes}د`}
let nextMonday=new Date(now);nextMonday.setHours(0,0,0,0);let daysUntilMonday=(8-nextMonday.getDay())%7;if(daysUntilMonday===0)daysUntilMonday=7;nextMonday.setDate(nextMonday.getDate()+daysUntilMonday);const weeklyTimeLeftMs=nextMonday-now;const weeklyDays=Math.floor(weeklyTimeLeftMs/(1000*60*60*24));const weeklyHoursLeft=Math.floor((weeklyTimeLeftMs%(1000*60*60*24))/(1000*60*60));let weeklyText=isEn?`${weeklyDays}d ${weeklyHoursLeft}h`:`${weeklyDays}يوم و${weeklyHoursLeft}س`;document.querySelectorAll('.weekly-timer-text').forEach(el=>{el.innerText=weeklyText})};updateTimers();if(window.questTimerInterval)clearInterval(window.questTimerInterval);window.questTimerInterval=setInterval(updateTimers,60000)};window.updateQuestProgressBatch=async function(updatesObj){const user=auth.currentUser;if(!user)return;try{const userDoc=await db.collection('users').doc(user.uid).get();if(!userDoc.exists)return;let serverData=userDoc.data();let serverQuests=serverData.quests||{active:[],progress:{}};if(!serverQuests.active||serverQuests.active.length===0)return;let progressChanged=!1;let totalXpGained=0;const isEn=currentLang==='en';if(!serverQuests.progress)serverQuests.progress={};serverQuests.active.forEach(quest=>{if(updatesObj[quest.type]!==undefined){let currentProg=serverQuests.progress[quest.id]||0;let amount=updatesObj[quest.type];if(currentProg<quest.target){if(quest.type==='dl_combo'){if(amount>currentProg){serverQuests.progress[quest.id]=amount;progressChanged=!0}}else{serverQuests.progress[quest.id]=currentProg+amount;progressChanged=!0}
if(progressChanged&&serverQuests.progress[quest.id]>=quest.target&&currentProg<quest.target){totalXpGained+=quest.xp;let qName=isEn?quest.en:quest.ar;setTimeout(()=>showToast(`🎯 ${isEn ? 'Quest Completed' : 'تم إنجاز المهمة'}: ${qName}! (+${quest.xp} XP)`),800)}}}});if(progressChanged){await db.collection('users').doc(user.uid).update({quests:serverQuests});let savedData=JSON.parse(localStorage.getItem('currentUser')||'{}');savedData.quests=serverQuests;localStorage.setItem('currentUser',JSON.stringify(savedData));if(document.getElementById('active-quests-container'))renderQuests();if(totalXpGained>0)await addXP(totalXpGained,'quest');}}catch(error){console.error("Error updating quests securely:",error)}};window.updateQuestProgress=async function(actionType,amount=1){let obj={};obj[actionType]=amount;await updateQuestProgressBatch(obj)};document.addEventListener('DOMContentLoaded',()=>{if(document.getElementById('main-content-area')){setTimeout(initQuests,500)}});let wakeLock=null;let liveStartTimeStamp=0;let restTargetTimeStamp=0;async function requestWakeLock(){try{if('wakeLock' in navigator){wakeLock=await navigator.wakeLock.request('screen')}}catch(err){console.error('Wake Lock error:',err)}}
function releaseWakeLock(){if(wakeLock!==null){wakeLock.release().then(()=>{wakeLock=null})}}
document.addEventListener('visibilitychange',async()=>{if(document.visibilityState==='visible'&&liveWorkoutActive){requestWakeLock();liveSeconds=Math.floor((Date.now()-liveStartTimeStamp)/1000);const m=String(Math.floor(liveSeconds/60)).padStart(2,'0');const s=String(liveSeconds%60).padStart(2,'0');const liveTimerEl=document.getElementById('live-timer');if(liveTimerEl)liveTimerEl.innerText=`${m}:${s}`;const restOverlay=document.getElementById('rest-timer-overlay');if(restOverlay&&restOverlay.style.display!=='none'){let timeLeft=Math.ceil((restTargetTimeStamp-Date.now())/1000);if(timeLeft<=0){skipRest()}else{const restText=document.getElementById('rest-countdown');if(restText)restText.innerText=timeLeft}}}});window.renderNoGuildScreen=async function(t){const area=document.getElementById('guild-content-area');if(!area)return;const userData=JSON.parse(localStorage.getItem('currentUser')||'{}');const lang=currentLang||'ar';const txtSearchTitle=lang==='en'?'Explore Clans':'استكشاف العصابات';const txtCreateBtn=lang==='en'?'Create Clan':'تأسيس عصابة';const txtSearchPlaceholder=lang==='en'?'Enter Clan Tag...':'أدخل رمز العصابة (Tag)...';const txtTopSuggested=lang==='en'?'Top Suggested Clans':'أبرز العصابات المقترحة';const txtSearching=lang==='en'?'Searching for warriors...':'جاري البحث عن مقاتلين...';const txtNoClans=lang==='en'?'No suggested clans found.':'لا توجد عصابات مقترحة حالياً.';let topActionBtnHtml='';if(userData.clanId){topActionBtnHtml=`
            <button class="btn-create-clan-mini" onclick="openGuildHub()" style="background: rgba(0, 242, 167, 0.15); color: #00f2a7; border-color: #00f2a7;">
                <i class="fa-solid fa-house-user"></i> ${lang === 'en' ? 'My Clan' : 'عصابتي'}
            </button>
        `}else{topActionBtnHtml=`
            <button class="btn-create-clan-mini" onclick="showCreateClanModal(translations[currentLang])">
                <i class="fa-solid fa-plus"></i> ${txtCreateBtn}
            </button>
        `}
area.innerHTML=`
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <h2 style="margin: 0; color: white; font-weight: 900;"><i class="fa-solid fa-magnifying-glass"></i> ${txtSearchTitle}</h2>
            ${topActionBtnHtml}
        </div>
        <div class="search-box" style="display:flex; gap:10px; margin-bottom: 25px;">
            <input type="text" id="search-guild-tag" placeholder="${txtSearchPlaceholder}" style="flex:1; background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 12px; border-radius: 10px; outline: none; transition: 0.3s;" onfocus="this.style.borderColor='var(--primary-color)'" onblur="this.style.borderColor='rgba(255,255,255,0.2)'">
            <button class="btn-primary" style="border-radius: 10px; padding: 0 20px;" onclick="joinGuildByTag()"><i class="fa-solid fa-magnifying-glass"></i></button>
        </div>
        <h4 style="color: var(--primary-color); margin-bottom: 15px; font-weight: bold;">
            <i class="fa-solid fa-fire"></i> ${txtTopSuggested}
        </h4>
        <div id="suggested-clans-container">
            <p style="text-align:center; color:gray;"><i class="fa-solid fa-spinner fa-spin"></i> ${txtSearching}</p>
        </div>
    `;try{let query=db.collection('clans');if(userData.country){query=query.where('country','==',userData.country).limit(5)}else{query=query.limit(5)}
const snap=await query.get();const container=document.getElementById('suggested-clans-container');container.innerHTML='';if(snap.empty){container.innerHTML=`<p style="text-align:center; color:gray;">${txtNoClans}</p>`;return}
snap.forEach(doc=>{const clan=doc.data();const memberCount=clan.members?clan.members.length:1;const score=clan.score||0;const emblem=clan.emblem||'fa-solid fa-shield-cat';container.innerHTML+=`
                <div class="clan-suggest-card" onclick="renderClanPreview(null, '${doc.id}', translations[currentLang])">
                    <div class="clan-card-info">
                        <div class="clan-card-emblem">
                            <i class="${emblem}"></i>
                        </div>
                        <div class="clan-card-details">
                            <h3>${clan.name} <span style="font-size:0.8rem; color:gray;">[#${clan.tag}]</span></h3>
                            <div class="clan-card-stats">
                                <span><i class="fa-solid fa-trophy" style="color:gold;"></i> ${score}</span>
                                <span><i class="fa-solid fa-users" style="color:#00f2a7;"></i> ${memberCount}/50</span>
                            </div>
                        </div>
                    </div>
                    <i class="fa-solid fa-chevron-left" style="color:gray;"></i>
                </div>
            `})}catch(err){console.error("Error fetching suggestions: ",err);const txtError=lang==='en'?'Error loading suggestions.':'حدث خطأ في تحميل الاقتراحات.';if(document.getElementById('suggested-clans-container')){document.getElementById('suggested-clans-container').innerHTML=`<p style="color:red; text-align:center;">${txtError}</p>`}}};window.showCreateClanModal=function(t){const area=document.getElementById('guild-content-area');const lang=currentLang||'ar';const txtBack=t.back||(lang==='en'?'Back':'رجوع');const txtCreateTitle=t.create_guild||(lang==='en'?'Create Clan':'تأسيس عصابة');const txtNameLabel=t.guild_name||(lang==='en'?'Clan Name':'اسم العصابة');const txtTagLabel=t.guild_tag||(lang==='en'?'Clan Tag (3-4 Letters)':'رمز العصابة (3-4 أحرف)');const txtCreateBtn=t.create||(lang==='en'?'Create Now':'تأسيس الآن');area.innerHTML=`
        <button class="btn-create-clan-mini" style="margin-bottom:15px;" onclick="renderNoGuildScreen(translations[currentLang])">
            <i class="fa-solid fa-arrow-right"></i> ${txtBack}
        </button>
        <h2 style="color:white;"><i class="fa-solid fa-crown"></i> ${txtCreateTitle}</h2>
        <div class="glass-card" style="margin-top: 15px; background: rgba(20, 20, 20, 0.6); backdrop-filter: blur(10px); border: 1px solid var(--primary-color); padding: 20px; border-radius: 15px;">
            
            <label style="color:gray; margin-bottom: 5px; display:block;">${txtNameLabel}</label>
            <input type="text" id="create-guild-name" placeholder="${lang === 'en' ? 'Enter Name...' : 'أدخل الاسم هنا...'}" style="width: 100%; background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 12px; border-radius: 10px; margin-bottom:15px; outline: none; transition: 0.3s;" onfocus="this.style.borderColor='var(--primary-color)'" onblur="this.style.borderColor='rgba(255,255,255,0.2)'">
            
            <label style="color:gray; margin-bottom: 5px; display:block;">${txtTagLabel}</label>
            <input type="text" id="create-guild-tag" maxlength="4" placeholder="${lang === 'en' ? 'Enter Tag...' : 'أدخل الرمز هنا...'}" style="width: 100%; background: rgba(0, 0, 0, 0.5); border: 1px solid rgba(255,255,255,0.2); color: white; padding: 12px; border-radius: 10px; margin-bottom:20px; text-transform: uppercase; outline: none; transition: 0.3s;" onfocus="this.style.borderColor='var(--primary-color)'" onblur="this.style.borderColor='rgba(255,255,255,0.2)'">
            
            <button class="btn-primary" style="width: 100%; padding: 12px; font-size: 1.1rem; border-radius: 10px;" onclick="createGuild()">${txtCreateBtn}</button>
        </div>
    `};window.joinGuildByTagDirect=function(tag){document.getElementById('search-guild-tag').value=tag;joinGuildByTag()};window.openGuildHub=async function(){window.scrollTo(0,0);if(window.innerWidth<768){const sidebar=document.getElementById('sidebar');if(sidebar)sidebar.classList.add('collapsed');}
const mainContent=document.getElementById('main-content-area');if(!mainContent)return;mainContent.scrollTop=0;if(!mainContent.dataset.originalContent){mainContent.dataset.originalContent=mainContent.innerHTML}
const t=translations[currentLang||'ar']||{};const user=auth.currentUser;if(!user){showToast(currentLang==='en'?"Please wait, loading account...":"انتظر جاري تحميل الحساب...");return}
let userData=JSON.parse(localStorage.getItem('currentUser')||'{}');mainContent.innerHTML=`
        <header class="top-bar" style="margin-bottom: 20px;">
            <div class="header-row" style="display:flex; justify-content:space-between; width:100%; align-items: center;">
                <button id="back-to-dash-btn" class="btn-primary" style="padding: 5px 15px;">${t.back || 'رجوع'}</button>
                <h1 style="margin: 0; font-weight: 900; color: #FFD700; text-shadow: 0 0 10px rgba(255,215,0,0.3);">
                    <i class="fa-solid fa-shield-cat"></i> ${t.guild_hub || 'العصابات'}
                </h1>
                <div style="width: 40px;"></div>
            </div>
        </header>
        <section class="performance-container" style="animation: fadeIn 0.5s;">
            <div id="guild-content-area">
                <div style="text-align:center; padding: 50px;">
                    <i class="fa-solid fa-spinner fa-spin fa-3x" style="color:#FFD700;"></i>
                </div>
            </div>
        </section>
    `;document.getElementById('back-to-dash-btn').onclick=backToDashboard;try{const freshUserDoc=await db.collection('users').doc(user.uid).get();if(freshUserDoc.exists){const freshUserData=freshUserDoc.data();userData.clanId=freshUserData.clanId;localStorage.setItem('currentUser',JSON.stringify(userData))}
let backBtn=document.getElementById('back-to-dash-btn');if(userData.clanId){if(backBtn){backBtn.onclick=function(){renderNoGuildScreen(t);let innerBack=document.getElementById('back-to-dash-btn');if(innerBack)innerBack.onclick=window.backToDashboard}}
loadActiveGuild(userData.clanId,user.uid)}else{if(backBtn){backBtn.onclick=window.backToDashboard}
renderNoGuildScreen(t)}}catch(e){console.error("Error fetching guild data: ",e);showToast(currentLang==='en'?"Error loading guild":"خطأ في تحميل بيانات العصابة")}};window.buildWarIdleHTML=function(clan,t,isLeader){let lang=localStorage.getItem('lang')||'ar';const isSearching=clan.warStatus==='searching';let lastWarBtn=clan.lastWarId?`
        <button class="btn-primary" style="width: 100%; padding: 10px; font-size: 1rem; margin-bottom: 20px; background: rgba(255, 215, 0, 0.1); color: #FFD700; border-color: #FFD700;" onclick="viewWarResults('${clan.lastWarId}', '${clan.id}')">
            <i class="fa-solid fa-chart-simple"></i> ${lang==='en'?'View Last War Results':'سجلات الحرب السابقة'}
        </button>
    `:'';return `
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
                    `<button class="btn-primary" style="width: 100%; padding: 15px; font-size: 1.1rem; ${isSearching ? 'background: rgba(255,255,255,0.1); color:var(--slate); border-color:var(--slate);' : 'background: rgba(255,77,77,0.15); color: #ff4d4d; border-color: #ff4d4d; box-shadow: 0 0 20px rgba(255,77,77,0.3);'}" onclick="searchForWar('${clan.id}')" ${isSearching?'disabled':''}><i class="fa-solid ${isSearching ? 'fa-radar fa-spin' : 'fa-crosshairs'}"></i>${isSearching?(lang==='en'?'Scanning Radar...':'الرادار يعمل...'):(lang==='en'?'Find Prey (Start War)':'البحث عن فريسة (بدء حرب)')}</button>` 
                    : `<p style="color: #FFD700; font-weight: bold; padding: 10px; border: 1px dashed #FFD700; border-radius: 8px; background: rgba(255,215,0,0.1);">${lang==='en'?'Only the Leader can start a war.':'الزعيم فقط من يمتلك صلاحية إعلان الحرب.'}</p>`
                }
            </div>
        </div>
    `};window.buildWarScreenHTML=function(clan,t){setTimeout(()=>listenToActiveWar(clan.currentWarId,clan.id),100);const lang=localStorage.getItem('lang')||'ar';const kgLabel=lang==='en'?'Lifted KG':'KG المرفوع';const warActiveTitle=lang==='en'?'Bloodbath in Progress!':'حرب طاحنة جارية!';const descText=lang==='en'?'Lift heavy in your daily workouts! Total logged volume pushes the rope towards your enemy.':'كل كيلو بترفعوه بالتمرين بنحسب هون! شدوا الحبل وادعسوا عليهم.';return `
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
    `};let friendsListener=null;async function renderMyFriends(){const list=document.getElementById('my-friends-list');if(!list)return;const t=translations[currentLang||'ar'];const currentUser=auth.currentUser;if(!currentUser)return;list.innerHTML=`<div style="text-align:center; padding: 40px;"><i class="fa-solid fa-spinner fa-spin fa-2x" style="color:var(--primary-color);"></i></div>`;if(friendsListener)friendsListener();friendsListener=db.collection('users').doc(currentUser.uid).onSnapshot(async(doc)=>{if(!doc.exists)return;let myFriends=doc.data().myFriendsList||[];if(myFriends.length===0){list.innerHTML=`
                <div class="empty-notif" style="margin-top: 30px;">
                    <i class="fa-solid fa-user-group" style="font-size: 3.5rem; opacity: 0.15; color: var(--slate);"></i>
                    <p style="margin-top: 15px; font-size: 1.1rem; color: white;">${t.no_friends_yet}</p>
                    <p style="font-size: 0.85rem; color: var(--slate); max-width: 250px; text-align: center;">${t.search_heroes_msg}</p>
                </div>`;return}
try{const friendsDataPromises=myFriends.map(async(friend)=>{const friendDoc=await db.collection('users').doc(friend.id).get();if(friendDoc.exists){const freshData=friendDoc.data();const freshName=(freshData.firstName+" "+(freshData.lastName||"")).trim();const freshImg=freshData.photoURL||"/Photos/adm.png";const freshLevel=freshData.rank||1;return `
                        <div class="friend-card" style="animation: fadeIn 0.4s;">
                            <div class="friend-info" style="cursor: pointer;" onclick="viewPlayerProfile('${friend.id}')">
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
                        </div>`}
return''});const friendsResults=await Promise.all(friendsDataPromises);list.innerHTML=friendsResults.join('')}catch(error){list.innerHTML=`<p style="text-align:center; color:#ff4d4d;">حدث خطأ في تحميل القائمة</p>`}})}
window.deleteFriend=async function(friendId){const currentUser=auth.currentUser;if(!currentUser)return;const myUid=currentUser.uid;const lang=currentLang||'ar';if(confirm(lang==='en'?"Remove this hero from your friends?":"متأكد إنك بدك تحذف هالبطل من أصدقائك؟")){try{const batch=db.batch();const myRef=db.collection('users').doc(myUid);const friendRef=db.collection('users').doc(friendId);const[myDoc,friendDoc]=await Promise.all([myRef.get(),friendRef.get()]);if(myDoc.exists&&friendDoc.exists){batch.update(myRef,{myFriendsList:myDoc.data().myFriendsList.filter(f=>f.id!==friendId)});batch.update(friendRef,{myFriendsList:friendDoc.data().myFriendsList.filter(f=>f.id!==myUid)});await batch.commit();let localData=JSON.parse(localStorage.getItem('currentUser')||'{}');localData.myFriendsList=(localData.myFriendsList||[]).filter(f=>f.id!==friendId);localStorage.setItem('currentUser',JSON.stringify(localData));if(document.getElementById('player-profile-modal')?.style.display==='flex'){viewPlayerProfile(friendId)}
showToast(lang==='en'?"Friendship ended!":"تم إلغاء الصداقة من الطرفين!")}}catch(error){console.error(error);showToast("⚠️ Error deleting")}}};window.acceptFriendRequest=async function(notifId,senderId,senderName,senderPhoto){const currentUser=auth.currentUser;if(!currentUser)return;const myUid=currentUser.uid;const lang=currentLang||'ar';try{document.getElementById(notifId)?.remove();const myRef=db.collection('users').doc(myUid);const senderRef=db.collection('users').doc(senderId);const[myDoc,senderDoc]=await Promise.all([myRef.get(),senderRef.get()]);if(myDoc.exists&&senderDoc.exists){const myData=myDoc.data();const senderData=senderDoc.data();const myFullName=(myData.firstName+" "+(myData.lastName||"")).trim();const senderFullName=(senderData.firstName+" "+(senderData.lastName||"")).trim();const batch=db.batch();batch.update(myRef,{myFriendsList:firebase.firestore.FieldValue.arrayUnion({id:senderId,name:senderFullName,photoURL:senderPhoto})});batch.update(senderRef,{myFriendsList:firebase.firestore.FieldValue.arrayUnion({id:myUid,name:myFullName,photoURL:myData.photoURL||"/Photos/adm.png"})});batch.delete(myRef.collection('notifications').doc(notifId));await batch.commit();let localData=JSON.parse(localStorage.getItem('currentUser')||'{}');if(!localData.myFriendsList)localData.myFriendsList=[];if(!localData.myFriendsList.find(f=>f.id===senderId)){localData.myFriendsList.push({id:senderId,name:senderFullName,photoURL:senderPhoto});localStorage.setItem('currentUser',JSON.stringify(localData))}
if(typeof renderMyFriends==='function')renderMyFriends();const profileModal=document.getElementById('player-profile-modal');if(profileModal&&profileModal.style.display==='flex'){viewPlayerProfile(senderId)}
showToast(lang==='en'?"Friend Added!":"تمت إضافة الصديق بنجاح!")}}catch(error){console.error("Accept Friend Error:",error);showToast("⚠️ Error accepting")}};window.deleteFriendFromProfile=async(id)=>{await window.deleteFriend(id)};let currentNotifUnsubscribe=null;let isInitialLoad=!0;window.listenForNotifications=function(){const currentUser=auth.currentUser;if(!currentUser)return;isInitialLoad=!0;if(currentNotifUnsubscribe){currentNotifUnsubscribe()}
currentNotifUnsubscribe=db.collection('users').doc(currentUser.uid).collection('notifications').where('status','==','pending').onSnapshot(snapshot=>{const badge=document.getElementById('notif-badge');const body=document.getElementById('notif-body');if(!badge||!body)return;const t=translations[currentLang||'ar'];if(snapshot.empty){badge.style.display='none';badge.innerText='0';body.innerHTML=`
                <div class="empty-notif" id="empty-notif">
                    <i class="fa-regular fa-bell-slash"></i>
                    <p>${t.no_notifications}</p> 
                </div>`;isInitialLoad=!1;return}
badge.style.display='flex';badge.innerText=snapshot.size;let hasNew=!1;snapshot.docChanges().forEach(change=>{if(change.type==='added')hasNew=!0});if(!isInitialLoad&&hasNew){const btn=document.getElementById('notif-btn');if(btn){btn.classList.add('shake');setTimeout(()=>btn.classList.remove('shake'),500)}
showToast(currentLang==='en'?" New Notification!":" إشعار جديد!")}
isInitialLoad=!1;body.innerHTML='';snapshot.forEach(doc=>{const notif=doc.data();const notifId=doc.id;if(notif.type==='friend_request'){body.insertAdjacentHTML('beforeend',`
                      <div class="notif-item" id="${notifId}">
                          <div class="notif-icon"><img src="${notif.senderPhoto}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;"></div>
                          <div class="notif-content">
                              <p><strong>${notif.senderName}</strong> ${t.friend_request_from}</p>
                              <div class="notif-actions">
                                  <button class="accept-btn" onclick="acceptFriendRequest('${notifId}', '${notif.senderId}', '${notif.senderName}', '${notif.senderPhoto}')">${t.accept}</button>
                                  <button class="reject-btn" onclick="rejectFriendRequest('${notifId}')">${t.reject}</button>
                              </div>
                          </div>
                      </div>`)}else if(notif.type==='clan_invite'){const txtAccept=currentLang==='en'?'View Clan':'استطلاع العصابة';const txtReject=currentLang==='en'?'Reject':'رفض';body.insertAdjacentHTML('beforeend',`
                      <div class="notif-item" id="${notifId}" style="background: rgba(0, 242, 167, 0.05); border-left: 3px solid var(--primary-color);">
                          <div class="notif-icon"><img src="${notif.senderPhoto || '/Photos/adm.png'}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;"></div>
                          <div class="notif-content">
                              <p><strong>${notif.title}</strong></p>
                              <p style="font-size: 0.85rem; color: white; line-height: 1.5; margin-top: 5px; white-space: normal;">${notif.text}</p>
                              <div class="notif-actions" style="margin-top: 10px;">
                                  <button class="accept-btn" style="width: 100%;" onclick="openClanFromInvite('${notifId}', '${notif.clanId}')">${txtAccept}</button>
                                  <button class="reject-btn" style="width: 100%; margin-top: 5px;" onclick="dismissNotif('${notifId}')">${txtReject}</button>
                              </div>
                          </div>
                      </div>`)}else if(notif.type==='message'){body.insertAdjacentHTML('beforeend',`
                      <div class="notif-item" id="${notifId}" style="cursor: pointer;" onclick="openChat('${notif.senderId}', '${notif.senderName}', '${notif.senderPhoto}')">
                          <div class="notif-icon"><img src="${notif.senderPhoto}" style="width:100%; height:100%; border-radius:50%; object-fit:cover;"></div>
                          <div class="notif-content">
                              <p>${t.message_from} <strong>${notif.senderName}</strong> 💬</p>
                              <p style="font-size: 0.8rem; color: var(--primary-color); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px;">"${notif.text}"</p>
                              <span class="notif-time" style="font-weight: bold; margin-top: 5px; display: block;">${t.click_to_reply}</span>
                          </div>
                      </div>`)}else if(notif.type==='clan_broadcast'){body.insertAdjacentHTML('beforeend',`
                      <div class="notif-item" id="${notifId}" style="background: rgba(255, 77, 77, 0.05); border-left: 3px solid #ff4d4d;">
                          <div class="notif-icon" style="background: transparent; font-size: 1.5rem; color: #ff4d4d;"><i class="fa-solid fa-satellite-dish"></i></div>
                          <div class="notif-content">
                              <p style="color: #ff4d4d; font-weight: bold; font-size: 0.85rem;"><strong>${notif.senderName}</strong></p>
                              <p style="font-size: 0.85rem; color: white; line-height: 1.5; margin-top: 5px; white-space: normal;">"${notif.text}"</p>
                              <div class="notif-actions" style="margin-top: 10px;">
                                  <button class="accept-btn" style="width: 100%; background: rgba(255,77,77,0.1); color: #ff4d4d; border: 1px solid #ff4d4d;" onclick="dismissNotif('${notifId}')">${currentLang === 'en' ? 'Understood' : 'علم'}</button>
                              </div>
                          </div>
                      </div>`)



}else if(notif.type==='throne_win'){let btnText=currentLang==='en'?"Claim Throne & XP!":"استلم العرش والـ XP!";body.insertAdjacentHTML('beforeend',`
        <div class="notif-item" id="${notifId}" style="background: rgba(255, 215, 0, 0.1); border: 1px solid #FFD700;">
            <div class="notif-icon" style="background: transparent; font-size: 2rem; display:flex; align-items:center; justify-content:center;">👑</div>
            <div class="notif-content">
                <p style="color: #FFD700; font-weight: 900; font-size: 0.85rem; line-height: 1.4;">${notif.text}</p>
                <div class="notif-actions" style="margin-top: 8px;">
                    <button class="accept-btn" style="background: rgba(255, 215, 0, 0.2); color: #FFD700; border: 1px solid #FFD700; width: 100%;" onclick="claimThroneReward('${notifId}')">${btnText}</button>
                </div>
            </div>
        </div>`)



} else if (notif.type === 'admin_alert') {
    let savedData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (savedData.isWorkoutPending) {
        savedData.isWorkoutPending = !1;
        localStorage.setItem('currentUser', JSON.stringify(savedData));
    }
    body.insertAdjacentHTML('beforeend', `
        <div class="notif-item" id="${notifId}" style="background: rgba(0, 242, 167, 0.05); border-left: 3px solid var(--primary-color);">
            
            <!-- 🔥 تم تعديل مسار الصورة هنا لسحب صورتك المحلية 🔥 -->
            <div class="notif-icon">
                <img src="/Photos/adm.png" style="width:100%; height:100%; border-radius:50%; object-fit:cover;" onerror="this.src='/Photos/adm.png'">
            </div>
            
            <div class="notif-content">
                <p><strong>${notif.senderName}</strong> </p>
                <p style="font-size: 0.85rem; color: white; line-height: 1.5; margin-top: 5px; white-space: normal;">${notif.text}</p>
                <div class="notif-actions" style="margin-top: 10px;">
                    <button class="accept-btn" style="width: 100%;" onclick="dismissNotif('${notifId}')">${currentLang === 'en' ? 'Got it' : 'حسناً، فهمت'}</button>
                </div>
            </div>
        </div>
    `);


}else if(notif.type==='throne_fall'){let msgText=currentLang==='en'?`🚨 Breaking: ${notif.city}'s throne has fallen! Captain ${notif.newKingName} is the new King with ${notif.newWeight}kg!`:`🚨 عاجل: لقد سقط عرش ${notif.city}! الكابتن (${notif.newKingName}) هو الملك الجديد بوزن ${notif.newWeight}kg!`;let btnText=currentLang==='en'?"Got it":"حسناً، فهمت";body.insertAdjacentHTML('beforeend',`
        <div class="notif-item" id="${notifId}" style="background: rgba(255, 215, 0, 0.1); border: 1px solid #FFD700;">
            <div class="notif-icon" style="background: transparent; font-size: 2rem; display:flex; align-items:center; justify-content:center;">👑</div>
            <div class="notif-content">
                <p style="color: #FFD700; font-weight: 900; font-size: 0.85rem; line-height: 1.4;">${msgText}</p>
                <div class="notif-actions" style="margin-top: 8px;">
                    
                    <button class="accept-btn" style="background: rgba(255, 215, 0, 0.2); color: #FFD700; border: 1px solid #FFD700; width: 100%;" onclick="dismissNotif('${notifId}')">${btnText}</button>
                </div>
            </div>
        </div>`)}else if(notif.type==='system_reward'){body.insertAdjacentHTML('beforeend',`
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
                      </div>`)}else if(notif.type==='pending_proof'){body.insertAdjacentHTML('beforeend',`
                      <div class="notif-item" id="${notifId}" style="background: rgba(255, 77, 77, 0.1); border-left: 3px solid #ff4d4d;">
                          <div class="notif-icon" style="background: transparent; font-size: 1.8rem;">🎥</div>
                          <div class="notif-content">
                              <p style="color: white; font-weight: bold; font-size: 0.9rem;">${notif.text}</p>
                              <p style="color: #ff4d4d; font-size: 0.8rem;">${notif.exerciseData.name}: ${notif.exerciseData.weight}kg</p>
                              <div class="notif-actions" style="margin-top: 8px;">
                                  <button class="accept-btn" style="background: #ff4d4d; color: white; width: 100%;" onclick="triggerProofUpload('${notifId}', '${notif.exerciseData.name}', ${notif.exerciseData.weight}, ${notif.exerciseData.reps})">${translations[currentLang].upload_now}</button>
                              </div>
                          </div>
                      </div>`)}})})};window.clearAllNotifications=async function(){const currentUser=auth.currentUser;if(!currentUser)return;try{const notifRef=db.collection('users').doc(currentUser.uid).collection('notifications');const snapshot=await notifRef.get();if(snapshot.empty){showToast(currentLang==='en'?"No notifications to clear!":"لا توجد إشعارات لمسحها!");return}
const batch=db.batch();snapshot.docs.forEach(doc=>{batch.delete(doc.ref)});await batch.commit();showToast(currentLang==='en'?"All notifications cleared!":"تم مسح جميع الإشعارات!");const dropdown=document.getElementById('notif-dropdown');if(dropdown)dropdown.classList.remove('show');}catch(error){console.error("خطأ في مسح الإشعارات:",error)}};async function markThroneRead(notifId){const currentUser=auth.currentUser;if(!currentUser)return;try{await db.collection('users').doc(currentUser.uid).collection('notifications').doc(notifId).delete()}catch(e){}}
async function dismissNotif(notifId){const currentUser=auth.currentUser;if(!currentUser)return;try{await db.collection('users').doc(currentUser.uid).collection('notifications').doc(notifId).delete()}catch(e){}}
window.sendFriendRequest=async function(targetUid){const currentUser=auth.currentUser;if(!currentUser)return;const btn=event.target.closest('button');const originalText=btn.innerHTML;btn.disabled=!0;btn.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i>';try{const myDoc=await db.collection('users').doc(currentUser.uid).get();const myData=myDoc.data();await db.collection('users').doc(targetUid).collection('notifications').doc('freq_'+currentUser.uid).set({type:'friend_request',senderId:currentUser.uid,senderName:(myData.firstName+" "+(myData.lastName||"")).trim(),senderPhoto:myData.photoURL||"/Photos/adm.png",status:'pending',timestamp:firebase.firestore.FieldValue.serverTimestamp()});showToast(currentLang==='en'?"Request sent!":"تم إرسال طلب الصداقة!");btn.innerHTML='<i class="fa-solid fa-check"></i>';btn.style.backgroundColor="#555"}catch(error){btn.disabled=!1;btn.innerHTML=originalText;showToast("Error!")}};async function rejectFriendRequest(notifId){const currentUser=auth.currentUser;if(!currentUser)return;try{await db.collection('users').doc(currentUser.uid).collection('notifications').doc(notifId).delete()}catch(error){console.error(error)}}
window.listenToActiveWar=function(warId,myClanId){if(!warId)return;if(window.activeWarUnsubscribe)window.activeWarUnsubscribe();window.activeWarUnsubscribe=db.collection('wars').doc(warId).onSnapshot(doc=>{if(!doc.exists)return;const war=doc.data();let myData=war.clan1.id===myClanId?war.clan1:war.clan2;let enemyData=war.clan1.id===myClanId?war.clan2:war.clan1;const updateEl=(id,val)=>{const el=document.getElementById(id);if(el)el.innerText=val};updateEl('war-mine-name',myData.name||'عصابتي');updateEl('war-mine-tag','['+(myData.tag||'...')+']');updateEl('war-mine-members',myData.membersCount||1);updateEl('war-score-mine',(myData.score||0).toLocaleString());updateEl('war-enemy-name',enemyData.name||'العدو');updateEl('war-enemy-tag','['+(enemyData.tag||'...')+']');updateEl('war-enemy-members',enemyData.membersCount||1);updateEl('war-score-enemy',(enemyData.score||0).toLocaleString());let totalScore=(myData.score||0)+(enemyData.score||0);let myPercentage=50,enemyPercentage=50;if(totalScore>0){myPercentage=(myData.score/totalScore)*100;enemyPercentage=(enemyData.score/totalScore)*100;if(myPercentage<10){myPercentage=10;enemyPercentage=90}
if(enemyPercentage<10){enemyPercentage=10;myPercentage=90}}
const tugMine=document.getElementById('tug-mine');const tugEnemy=document.getElementById('tug-enemy');if(tugMine)tugMine.style.width=myPercentage+'%';if(tugEnemy)tugEnemy.style.width=enemyPercentage+'%';if(war.startTime&&war.status==='active'&&typeof startWarTimer==='function'){startWarTimer(war.startTime,warId,myClanId,myData.score,enemyData.score)}
const listContainer=document.getElementById('war-live-members-list');if(listContainer){const lang=localStorage.getItem('lang')||'ar';const renderMembers=(clanData)=>{let membersArr=[];if(clanData.members){for(let uid in clanData.members){membersArr.push(clanData.members[uid])}}
membersArr.sort((a,b)=>(b.volume||0)-(a.volume||0));if(membersArr.length===0)return `<p style="color:var(--slate); font-size:0.8rem; text-align:center;">${lang==='en'?'No data':'لا توجد بيانات'}</p>`;return membersArr.map((m,i)=>`
                    <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.05); padding:8px 12px; border-radius:8px; margin-bottom:5px;">
                        <div style="display:flex; align-items:center; gap:10px;">
                            <span style="color:var(--slate); font-weight:bold; font-size:0.8rem;">#${i+1}</span>
                            <img src="${m.photo || '/Photos/adm.png'}" style="width:30px; height:30px; border-radius:50%; object-fit:cover;">
                            <span style="color:white; font-size:0.85rem; font-weight:bold;">${m.name}</span>
                        </div>
                        <span style="color:var(--primary-color); font-weight:900; font-size:0.9rem;">${(m.volume||0).toLocaleString()} kg</span>
                    </div>
                `).join('')};listContainer.innerHTML=`
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
            `}})};let chatUnsubscribe=null;window.initClanChat=function(clanId,myUid){const chatBox=document.getElementById('clan-chat-messages');if(!chatBox)return;if(chatUnsubscribe)chatUnsubscribe();let twoDaysAgo=new Date();twoDaysAgo.setHours(twoDaysAgo.getHours()-48);chatUnsubscribe=db.collection('clans').doc(clanId).collection('chat').where('timestamp','>=',twoDaysAgo).orderBy('timestamp','asc').onSnapshot(snapshot=>{let lang=localStorage.getItem('lang')||'ar';chatBox.innerHTML='';if(snapshot.empty){chatBox.innerHTML=`<div style="text-align:center; color:var(--slate); margin-top:50px;"><i class="fa-solid fa-comments fa-2x"></i><p>${lang === 'en' ? 'No recent messages.' : 'لا يوجد رسائل حديثة.'}</p></div>`;return}
snapshot.forEach(doc=>{let msg=doc.data();let isMine=msg.senderId===myUid;chatBox.innerHTML+=`
                    <div class="chat-bubble ${isMine ? 'mine' : 'others'}">
                        <div class="chat-sender-name">${msg.senderName}</div>
                        ${msg.text}
                    </div>
                `});chatBox.scrollTop=chatBox.scrollHeight})};window.sendClanMessage=async function(clanId,myUid){const input=document.getElementById('clan-chat-input');const text=input.value.trim();let lang=localStorage.getItem('lang')||'ar';if(!text)return;let userData=JSON.parse(localStorage.getItem('currentUser')||'{}');let senderName=userData.firstName||(lang==='en'?'Captain':'الكابتن');input.value='';try{await db.collection('clans').doc(clanId).collection('chat').add({text:text,senderId:myUid,senderName:senderName,timestamp:firebase.firestore.FieldValue.serverTimestamp()})}catch(e){console.error(e);showToast(lang==='en'?"Failed to send message!":"فشل إرسال الرسالة!")}};const emblemIcons=['fa-dragon','fa-shield-halved','fa-skull','fa-fire-flame-curved','fa-bolt','fa-ghost','fa-khanda','fa-crow','fa-paw','fa-moon','fa-meteor','fa-crown','fa-jedi','fa-spider','fa-biohazard','fa-radiation','fa-mask','fa-user-ninja','fa-hat-wizard','fa-gem'];const emblemColors=['#FFD700','#00f2a7','#ff4d4d','#00d4ff','#b5179e','#ff9f43','#ffffff','#a8a8a8'];


window.initSettingsUI = function(currentEmblem, currentColor) {
    const grid = document.getElementById('emblem-selection-grid');
    const colorGrid = document.getElementById('color-selection-grid');
    if (!grid || !colorGrid) return;
    
    // قائمة الأيقونات المجانية الافتراضية
    const freeEmblemIcons =['fa-dragon','fa-shield-halved','fa-skull','fa-fire-flame-curved','fa-bolt','fa-ghost','fa-khanda','fa-crow','fa-paw','fa-moon','fa-meteor','fa-jedi','fa-spider','fa-biohazard','fa-radiation','fa-mask','fa-user-ninja','fa-hat-wizard','fa-gem'];
    
    // جلب الأيقونات المشتراة من بيانات المستخدم
    const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const unlockedIconsIds = userData.unlockedClanIcons || [];
    
    const premiumEmblems = [];
    unlockedIconsIds.forEach(id => {
        const item = storeItemsDB.clanPerks.find(p => p.id === id);
        if (item) {
            const iconClass = item.val.replace('fa-solid ', '').replace('fa-brands ', '');
            premiumEmblems.push(iconClass);
        }
    });

    const allEmblems = [...new Set([...freeEmblemIcons, ...premiumEmblems])];
    const emblemColors =['#FFD700','#00f2a7','#ff4d4d','#00d4ff','#b5179e','#ff9f43','#ffffff','#a8a8a8'];

    grid.innerHTML = allEmblems.map(icon => `
        <div class="emblem-option ${icon === currentEmblem.replace('fa-solid ','') ? 'selected' : ''}" onclick="selectEmblem(this, '${icon}')">
            <i class="fa-solid ${icon}"></i>
        </div>
    `).join('');

    colorGrid.innerHTML = emblemColors.map(color => `
        <div class="color-option ${color === currentColor ? 'selected' : ''}" style="background-color: ${color}; box-shadow: ${color === currentColor ? '0 0 10px '+color : 'none'};" onclick="selectColor(this, '${color}')"></div>
    `).join('');
};


window.selectEmblem=function(element,iconClass){document.querySelectorAll('.emblem-option').forEach(el=>el.classList.remove('selected'));element.classList.add('selected');document.getElementById('selected-emblem-val').value='fa-solid '+iconClass};window.selectColor=function(element,colorVal){document.querySelectorAll('.color-option').forEach(el=>{el.classList.remove('selected');el.style.boxShadow='none'});element.classList.add('selected');element.style.boxShadow='0 0 10px '+colorVal;document.getElementById('selected-color-val').value=colorVal};window.saveClanSettings=async function(clanId){let lang=localStorage.getItem('lang')||'ar';const newName=document.getElementById('edit-clan-name').value.trim();const newMotto=document.getElementById('edit-clan-motto').value.trim();const newEmblem=document.getElementById('selected-emblem-val').value;const newColor=document.getElementById('selected-color-val').value;if(!newName){showToast(lang==='en'?"Name cannot be empty!":"لا يمكن ترك الاسم فارغاً!");return}
try{await db.collection('clans').doc(clanId).update({name:newName,motto:newMotto,emblem:newEmblem,emblemColor:newColor});showToast(lang==='en'?"Clan settings updated successfully! 👑":"تم تحديث إعدادات العصابة بنجاح! 👑")}catch(e){console.error(e);showToast(lang==='en'?"Save failed!":"فشل الحفظ!")}};window.sendClanBroadcast=async function(clanId){const msg=document.getElementById('broadcast-msg-input').value.trim();let lang=localStorage.getItem('lang')||'ar';if(!msg){showToast(lang==='en'?"Type a message first!":"اكتب رسالة أولاً!");return}
const btn=event.target.closest('button');const originalText=btn.innerHTML;btn.disabled=!0;btn.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i>';try{const user=auth.currentUser;const clanRef=db.collection('clans').doc(clanId);const clanDoc=await clanRef.get();const clanData=clanDoc.data();const members=clanData.members||[];let batch=db.batch();members.forEach(m=>{const notifRef=db.collection('users').doc(m.uid).collection('notifications').doc();batch.set(notifRef,{title:lang==='en'?`📢 Clan: ${clanData.name}`:`📢 طاقم: ${clanData.name}`,senderName:lang==='en'?`Leader of ${clanData.name}`:`زعيم ${clanData.name}`,body:msg,message:msg,text:msg,status:'pending',type:'clan_broadcast',timestamp:firebase.firestore.FieldValue.serverTimestamp(),createdAt:firebase.firestore.FieldValue.serverTimestamp(),read:!1,senderId:user.uid,pushSent:!1})});batch.update(clanRef,{lastBroadcastAt:firebase.firestore.FieldValue.serverTimestamp()});await batch.commit();document.getElementById('broadcast-msg-input').value='';showToast(lang==='en'?"Broadcast sent successfully!":"تم الإرسال لجميع الأعضاء بنجاح! ")}catch(e){console.error("خطأ في إرسال الإشعار اللاسلكي:",e);showToast(lang==='en'?"Failed to send!":"فشل الإرسال! تأكد من اتصالك.")}
btn.disabled=!1;btn.innerHTML=originalText};window.forceLeaveGuild=async function(clanId,myUid){try{let userData=JSON.parse(localStorage.getItem('currentUser')||'{}');userData.clanId=null;localStorage.setItem('currentUser',JSON.stringify(userData));await db.collection('users').doc(myUid).update({clanId:null});openGuildHub()}catch(e){console.error(e);showToast("خطأ في الخروج الإجباري!")}};window.showWarResultUI=function(isWinner,isDraw,warId,myClanId){if(document.getElementById('war-result-overlay'))return;const lang=localStorage.getItem('lang')||'ar';let title="",message="",color="",icon="",glowColor="",fxAnim="";if(isDraw){title=lang==='en'?"DRAW!":"تعادل!";message=lang==='en'?"It was a tough battle. No XP awarded.":"معركة طاحنة انتهت بالتعادل. لا يوجد خاسر ولا فائز.";color="#ffb84d";glowColor="rgba(255, 184, 77, 0.4)";icon="fa-handshake-angle";fxAnim="pulseNeutral"}else if(isWinner){title=lang==='en'?"VICTORY!":"انتصار أسطوري!";message=lang==='en'?"Your clan crushed the enemies! +1000 XP added.":"لقد سحق كلانك الخصوم بلا رحمة! تمت إضافة 1000 XP.";color="#00f2a7";glowColor="rgba(0, 242, 167, 0.5)";icon="fa-crown";fxAnim="pulseVictory"}else{title=lang==='en'?"DEFEAT!":"هزيمة مريرة!";message=lang==='en'?"Your clan lost this time. Train harder!":"لقد خسر كلانك هذه المعركة. عودوا للانتقام!";color="#ff4d4d";glowColor="rgba(255, 77, 77, 0.5)";icon="fa-skull-crossbones";fxAnim="pulseDefeat"}
const overlay=document.createElement('div');overlay.id="war-result-overlay";overlay.style.cssText=`
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: radial-gradient(circle at center, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.98) 100%);
        display: flex; justify-content: center; align-items: center;
        z-index: 99999; backdrop-filter: blur(15px);
    `;const styleBlock=document.createElement('style');styleBlock.innerHTML=`
        @keyframes popEpic { 0% { transform: scale(0.5); opacity: 0; } 70% { transform: scale(1.05); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
        @keyframes ${fxAnim} { 0% { box-shadow: 0 0 20px ${glowColor}, inset 0 0 20px ${glowColor}; } 100% { box-shadow: 0 0 60px ${glowColor}, inset 0 0 40px ${glowColor}; transform: translateY(-5px); } }
        .epic-war-card { background: linear-gradient(135deg, #111 0%, #0a0a0a 100%); border: 2px solid ${color}; border-radius: 20px; padding: 40px 30px; text-align: center; width: 90%; max-width: 420px; animation: popEpic 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards, ${fxAnim} 2s infinite alternate ease-in-out; position: relative; overflow: hidden; }
        .epic-war-card::before { content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; background: radial-gradient(circle, ${glowColor} 0%, transparent 60%); opacity: 0.3; pointer-events: none; z-index: 0; }
        .epic-war-icon { font-size: 6rem; color: ${color}; margin-bottom: 15px; filter: drop-shadow(0 0 20px ${color}); position: relative; z-index: 1; }
        .epic-war-title { color: ${color}; font-size: 2.5rem; margin-bottom: 10px; text-transform: uppercase; font-weight: 900; letter-spacing: 2px; text-shadow: 0 0 15px ${color}; position: relative; z-index: 1; }
        .epic-war-btn { background: rgba(0,0,0,0.5); color: white; font-weight: 900; border: 1px solid ${color}; padding: 15px 30px; border-radius: 12px; font-size: 1.1rem; cursor: pointer; transition: 0.3s; width: 100%; box-shadow: 0 0 15px ${glowColor}; position: relative; z-index: 1; text-transform: uppercase; letter-spacing: 1px; }
        .epic-war-btn:hover { background-color: ${color}; color: #000; box-shadow: 0 0 30px ${color}; }
    `;document.head.appendChild(styleBlock);let btnText=lang==='en'?"View War Stats":"عرض الإحصائيات والأرقام";overlay.innerHTML=`
        <div class="epic-war-card">
            <i class="fa-solid ${icon} epic-war-icon"></i>
            <h1 class="epic-war-title">${title}</h1>
            <p style="color: #ddd; font-size: 1.05rem; line-height: 1.6; margin-bottom: 30px; position: relative; z-index: 1; font-weight: bold;">${message}</p>
            <button onclick="viewWarResults('${warId}', '${myClanId}')" class="epic-war-btn">
                <i class="fa-solid fa-chart-simple"></i> ${btnText}
            </button>
        </div>
    `;document.body.appendChild(overlay)};window.viewWarResults=async function(warId,myClanId){const resultOverlay=document.getElementById('war-result-overlay');if(resultOverlay)resultOverlay.remove();let modal=document.getElementById('war-stats-modal');if(!modal){modal=document.createElement('div');modal.id='war-stats-modal';modal.style.cssText=`
            position: fixed; top: 0; left: 0; width: 100%; height: 100vh;
            background: var(--secondary-color); z-index: 999999;
            display: flex; flex-direction: column; overflow-y: auto;
            animation: fadeIn 0.3s ease;
        `;document.body.appendChild(modal)}
const lang=localStorage.getItem('lang')||'ar';const t=translations[lang]||{};modal.innerHTML=`
        <header class="top-bar" style="position: sticky; top: 0; background: rgba(10, 20, 41, 0.95); backdrop-filter: blur(10px); z-index: 10; border-bottom: 1px solid rgba(255, 215, 0, 0.3); box-shadow: 0 4px 20px rgba(255, 215, 0, 0.15);">
            <div class="header-row" style="display: flex; justify-content: center; align-items: center; width: 100%; padding: 15px 0;">
                <h1 style="margin: 0; color:#FFD700; font-size: 2rem; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; text-shadow: 0 0 15px #FFD700, 0 0 30px rgba(255, 215, 0, 0.6);">${lang==='en'?'War Results':'نتائج الحرب'}</h1>
            </div>
        </header>
        <div style="text-align:center; padding: 50px;"><i class="fa-solid fa-spinner fa-spin fa-3x" style="color:#FFD700;"></i></div>
    `;try{const warDoc=await db.collection('wars').doc(warId).get();if(!warDoc.exists){modal.innerHTML+=`<p style="color:#ff4d4d; text-align:center;">Data lost.</p>`;return}
const warData=warDoc.data();let myData=warData.clan1.id===myClanId?warData.clan1:warData.clan2;let enemyData=warData.clan1.id===myClanId?warData.clan2:warData.clan1;let isWinner=myData.score>enemyData.score;let isDraw=myData.score===enemyData.score;let statusTitle=isDraw?(lang==='en'?'Draw!':'تعادل!'):(isWinner?(lang==='en'?'Victory!':'انتصار!'):(lang==='en'?'Defeat!':'هزيمة!'));let statusColor=isDraw?'#ffb84d':(isWinner?'#00f2a7':'#ff4d4d');const renderMembers=(clanData)=>{let membersArr=[];if(clanData.members){for(let uid in clanData.members){membersArr.push(clanData.members[uid])}}
membersArr.sort((a,b)=>b.volume-a.volume);if(membersArr.length===0)return `<p style="color:var(--slate); font-size:0.8rem; text-align:center;">${lang==='en'?'No data':'لا توجد بيانات'}</p>`;return membersArr.map((m,i)=>`
                <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.05); padding:8px 12px; border-radius:8px; margin-bottom:5px;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="color:var(--slate); font-weight:bold; font-size:0.8rem;">#${i+1}</span>
                        <img src="${m.photo || '/Photos/adm.png'}" style="width:30px; height:30px; border-radius:50%; object-fit:cover;">
                        <span style="color:white; font-size:0.85rem; font-weight:bold;">${m.name}</span>
                    </div>
                    <span style="color:var(--primary-color); font-weight:900; font-size:0.9rem;">${m.volume.toLocaleString()} kg</span>
                </div>
            `).join('')};let actionBtns=`
            <div style="display:flex; gap:10px; margin-top: 20px;">
                <button class="btn-primary" style="width: 100%; padding:15px; background:rgba(0, 242, 167, 0.15); border-color:#00f2a7; color:#00f2a7; font-size: 1.1rem; font-weight: bold; box-shadow: 0 0 15px rgba(0, 242, 167, 0.2);" onclick="document.getElementById('war-stats-modal').remove()">
                    <i class="fa-solid fa-check-double"></i> ${lang==='en'?'Acknowledge & Return':'علم، العودة للغرفة'}
                </button>
            </div>
        `;modal.innerHTML=`
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
        `}catch(e){console.error(e);modal.innerHTML+=`<p style="color:#ff4d4d; text-align:center;">Error loading stats</p>`}};window.createGuild=async function(){const nameInput=document.getElementById('create-guild-name');const tagInput=document.getElementById('create-guild-tag');if(!nameInput||!tagInput)return;const name=nameInput.value.trim();const tag=tagInput.value.trim().toUpperCase();const lang=currentLang||'ar';const t=translations[lang]||{};if(!name||name.length>100){showToast(lang==='en'?"Please enter a valid Clan Name!":"الرجاء إدخال اسم صحيح للعصابة!");return}
if(tag.length<3||tag.length>4){showToast(lang==='en'?"Tag must be 3 or 4 letters only!":"رمز العصابة يجب أن يتكون من 3 إلى 4 أحرف فقط!");return}
const user=auth.currentUser;if(!user)return;let userData=JSON.parse(localStorage.getItem('currentUser')||'{}');if(userData.clanId){showToast(lang==='en'?"You are already in a clan!":"أنت مسجل في عصابة بالفعل!");return}
const clanCost=1000;if((userData.xp||0)<clanCost){showToast(lang==='en'?`Not enough XP! You need ${clanCost} XP.`:`نقاطك لا تكفي! تحتاج ${clanCost} XP لتأسيس عصابة.`);return}
const btn=document.querySelector('button[onclick*="createGuild"]');const originalText=btn?btn.innerHTML:'تأسيس';if(btn){btn.disabled=!0;btn.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i>'}
try{const userRef=db.collection('users').doc(user.uid);const userDocSnap=await userRef.get();if(userDocSnap.exists){const currentXP=userDocSnap.data().xp||0;if(currentXP<clanCost){showToast(lang==='en'?`Not enough XP! You need ${clanCost} XP.`:`نقاطك لا تكفي! تحتاج ${clanCost} XP لتأسيس عصابة.`);if(btn){btn.disabled=!1;btn.innerHTML=originalText}
return}}
const clanId='CLAN_'+Math.random().toString(36).substr(2,9).toUpperCase();const newClan={id:clanId,name:name,tag:tag,country:userData.country||'Global',emblem:'fa-solid fa-dragon',emblemColor:'#FFD700',leaderId:user.uid,members:[{uid:user.uid,name:userData.firstName||'الكابتن',role:'leader',warReady:!0,xp:userData.xp||0}],stats:{wins:0,totalWeight:0},warStatus:'idle',currentWarId:null,createdAt:firebase.firestore.FieldValue.serverTimestamp()};await db.collection('clans').doc(clanId).set(newClan);await userRef.update({clanId:clanId});try{await userRef.update({xp:firebase.firestore.FieldValue.increment(-clanCost)})}catch(e1){console.warn("الحماية منعت الخصم المباشر، جاري التخطي عبر الدالة السحابية...");try{const secureXPCall=firebase.functions().httpsCallable('secureAddXP');await secureXPCall({actionType:'game',amount:-clanCost,securityToken:'RGA_SECURE_998877'})}catch(e2){console.warn("تم الخصم محلياً.")}}
userData.clanId=clanId;userData.xp=Math.max(0,(userData.xp||0)-clanCost);localStorage.setItem('currentUser',JSON.stringify(userData));if(typeof renderUI==='function')renderUI(userData);showToast(t.guild_created||"تم تأسيس العصابة بنجاح!");setTimeout(()=>{if(typeof loadActiveGuild==='function'){const area=document.getElementById('guild-content-area');if(area)area.innerHTML=`<div style="text-align:center; padding: 50px;"><i class="fa-solid fa-spinner fa-spin fa-3x" style="color:#FFD700;"></i></div>`;loadActiveGuild(clanId,user.uid)}},500)}catch(error){console.error("خطأ التأسيس:",error);showToast(lang==='en'?"Error creating clan!":"حدث خطأ أثناء التأسيس!")}finally{if(btn){btn.disabled=!1;btn.innerHTML=originalText}}};window.switchGuildTab=function(tabName,btnElement){document.querySelectorAll('#guild-content-area .perf-tab-btn').forEach(b=>b.classList.remove('active-tab'));if(btnElement)btnElement.classList.add('active-tab');const tabs=['roster','war','chat','settings'];tabs.forEach(t=>{let el=document.getElementById('guild-tab-'+t);if(el){el.style.display=(t===tabName)?'block':'none'}})};window.toggleWarReady=async function(clanId,uid,isReady){const clanRef=db.collection('clans').doc(clanId);try{const doc=await clanRef.get();let members=doc.data().members;let memberIndex=members.findIndex(m=>m.uid===uid);if(memberIndex>-1){members[memberIndex].warReady=isReady;await clanRef.update({members:members})}}catch(e){console.error(e)}};window.searchForWar=async function(myClanId,memberCount){const clanRef=db.collection('clans').doc(myClanId);await clanRef.update({warStatus:'searching'});setTimeout(async()=>{try{const snapshot=await db.collection('clans').where('warStatus','==','searching').where('id','!=',myClanId).limit(1).get();if(!snapshot.empty){const enemyClanDoc=snapshot.docs[0];const enemyClan=enemyClanDoc.data();const myClan=(await clanRef.get()).data();const warId='WAR_'+generateShortID();const endTime=new Date();endTime.setHours(endTime.getHours()+24);const newWar={id:warId,status:'active',endTime:endTime,clanA:{id:myClan.id,name:myClan.name,tag:myClan.tag,score:0},clanB:{id:enemyClan.id,name:enemyClan.name,tag:enemyClan.tag,score:0}};await db.collection('wars').doc(warId).set(newWar);await clanRef.update({warStatus:'in_war',currentWarId:warId});await enemyClanDoc.ref.update({warStatus:'in_war',currentWarId:warId});showToast("⚔️ تم العثور على عدو! الحرب بدأت!")}else{showToast("جاري الاستمرار بالبحث في الرادار...")}}catch(e){console.error("War Search Error:",e)}},3000)};async function joinGuildByTag(){const tagInput=document.getElementById('search-guild-tag').value.trim().toUpperCase();const errorMsg=currentLang==='en'?'Please enter a valid 4-character Tag.':'الرجاء إدخال كود كلان صحيح (4 حروف/أرقام).';const notFoundMsg=currentLang==='en'?'Clan not found!':'لم يتم العثور على الكلان!';const joinedMsg=currentLang==='en'?'Joined successfully!':'تم الانضمام بنجاح!';if(!tagInput||tagInput.length!==4){showCustomAlert(errorMsg);return}
try{const clansRef=db.collection('clans');const querySnapshot=await clansRef.where('tag','==',tagInput).limit(1).get();if(querySnapshot.empty){showCustomAlert(notFoundMsg);return}
const clanDoc=querySnapshot.docs[0];const clanId=clanDoc.id;const clanData=clanDoc.data();if(clanData.members.length>=50){showCustomAlert(currentLang==='en'?'Clan is full!':'الكلان ممتلئ!');return}
if(clanData.members.some(m=>m.uid===currentUserData.uid)){showCustomAlert(currentLang==='en'?'You are already in this clan!':'أنت بالفعل عضو في هذه العصابة!');return}
const currentUserData=JSON.parse(localStorage.getItem('currentUser'));const newMember={uid:currentUserData.uid,name:currentUserData.name,joinedAt:firebase.firestore.FieldValue.serverTimestamp(),warReady:!1,xp:currentUserData.xp||0};await db.collection('clans').doc(clanId).update({members:firebase.firestore.FieldValue.arrayUnion(newMember)});await db.collection('users').doc(currentUserData.uid).update({clanId:clanId});currentUserData.clanId=clanId;localStorage.setItem('currentUser',JSON.stringify(currentUserData));showCustomAlert(joinedMsg)}catch(error){console.error("Error joining clan: ",error);showCustomAlert(currentLang==='en'?'Error joining clan!':'حدث خطأ أثناء الانضمام!')}}
window.transferLeadership=async function(clanId,newLeaderUid){if(!confirm(currentLang==='en'?"Transfer leadership? You will become a regular member.":"متأكد بدك تسلم القيادة؟ رح ترجع بطل عادي."))return;try{const clanRef=db.collection('clans').doc(clanId);await clanRef.update({leaderId:newLeaderUid});showToast(currentLang==='en'?"Leadership transferred!":"تم نقل القيادة بنجاح 👑")}catch(e){console.error(e)}};window.leaveGuild=async function(clanId,myUid,isLeader){if(!confirm(currentLang==='en'?"Are you sure you want to leave the guild?":"متأكد بدك تترك عصابتك وتصير ذئب وحيد؟"))return;try{const clanRef=db.collection('clans').doc(clanId);const doc=await clanRef.get();if(!doc.exists)return;let clanData=doc.data();let remainingMembers=clanData.members.filter(m=>m.uid!==myUid);if(remainingMembers.length===0){await clanRef.delete()}else{let updates={members:remainingMembers};if(isLeader){updates.leaderId=remainingMembers[0].uid;alert(currentLang==='en'?`Leadership passed to ${remainingMembers[0].name}`:`بما إنك الزعيم، تم تسليم القيادة تلقائياً لـ ${remainingMembers[0].name}`)}
await clanRef.update(updates)}
let userData=JSON.parse(localStorage.getItem('currentUser')||'{}');userData.clanId=null;localStorage.setItem('currentUser',JSON.stringify(userData));await db.collection('users').doc(myUid).update({clanId:null});showToast(currentLang==='en'?"You left the guild.":"غادرت العصابة.");const t=translations[currentLang||'ar'];renderNoGuildScreen(t)}catch(e){console.error(e);showToast("خطأ في المغادرة!")}};window.kickClanMember=async function(clanId,memberUid){let lang=localStorage.getItem('lang')||'ar';if(!confirm(lang==='en'?"Kick this player from the clan?":"طرد هذا اللاعب من الكلان؟"))return;try{const clanRef=db.collection('clans').doc(clanId);const doc=await clanRef.get();let members=doc.data().members.filter(m=>m.uid!==memberUid);await clanRef.update({members:members});await db.collection('users').doc(memberUid).update({clanId:null,lastKickedAt:firebase.firestore.FieldValue.serverTimestamp(),kickedFromClanId:clanId});showToast(lang==='en'?"Player kicked!":"تم طرد اللاعب!")}catch(e){console.error(e)}};window.toggleWarReady=async function(clanId,uid,currentState){try{const clanRef=db.collection('clans').doc(clanId);const doc=await clanRef.get();if(!doc.exists)return;let members=doc.data().members;let memberIndex=members.findIndex(m=>m.uid===uid);if(memberIndex!==-1){members[memberIndex].warReady=!currentState;await clanRef.update({members:members});showToast(currentLang==='en'?"Status updated!":"تم تحديث الجاهزية!")}}catch(e){console.error("Error toggling ready state:",e)}};window.toggleMemberMenu=function(menuId,btnElement){if(window.event)window.event.stopPropagation();if(btnElement){btnElement.classList.add('is-pressed');setTimeout(()=>btnElement.classList.remove('is-pressed'),150)}
const menu=document.getElementById(menuId);if(!menu)return;const isAlreadyShowing=menu.classList.contains('is-visible');document.querySelectorAll('.member-action-menu-content.is-visible').forEach(openMenu=>{openMenu.classList.remove('is-visible')});if(!isAlreadyShowing){menu.classList.add('is-visible');if(btnElement){const rect=btnElement.getBoundingClientRect();menu.style.position='fixed';menu.style.top=(rect.bottom+5)+'px';if(currentLang==='ar'){menu.style.left=Math.max(10,rect.left-10)+'px'}else{menu.style.left=Math.max(10,rect.left-100)+'px'}
menu.style.zIndex='9999999'}}};window.onclick=function(event){if(!event.target.closest('.member-menu-trigger')&&!event.target.closest('.member-action-menu-content.is-visible')){document.querySelectorAll('.member-action-menu-content.is-visible').forEach(openDropdown=>{openDropdown.classList.remove('is-visible')})}};window.searchForWar=async function(clanId){const btn=event.target.closest('button');const originalText=btn.innerHTML;btn.disabled=!0;btn.innerHTML='<i class="fa-solid fa-radar fa-spin"></i> '+(currentLang==='en'?'Scanning...':'جاري مسح الرادار...');try{const clanRef=db.collection('clans').doc(clanId);const clanDoc=await clanRef.get();if(!clanDoc.exists)return;await clanRef.update({warStatus:'searching',searchStartedAt:firebase.firestore.FieldValue.serverTimestamp()});showToast(currentLang==='en'?"Radar active! Searching in background...":"الرادار يعمل! البحث مستمر حتى في الخلفية...");const snapshot=await db.collection('clans').where('warStatus','==','searching').get();let enemyClan=null;snapshot.forEach(doc=>{if(doc.id!==clanId&&!enemyClan){enemyClan={id:doc.id,...doc.data()}}});if(enemyClan){await startWarBetweenClans(clanId,clanDoc.data(),enemyClan.id,enemyClan)}else{btn.innerHTML='<i class="fa-solid fa-radar"></i> '+(currentLang==='en'?'Scanning Radar...':'الرادار يعمل...')}}catch(e){console.error("Error searching for war:",e);showToast(currentLang==='en'?"Radar Error!":"خطأ في الرادار!");btn.disabled=!1;btn.innerHTML=originalText}};async function startWarBetweenClans(myClanId,myClanData,enemyClanId,enemyClanData){const warId='WAR_'+Math.random().toString(36).substr(2,9).toUpperCase();const batch=db.batch();const warRef=db.collection('wars').doc(warId);batch.set(warRef,{id:warId,clan1:{id:myClanId,tag:myClanData.tag,name:myClanData.name,membersCount:myClanData.members.length,score:0},clan2:{id:enemyClanId,tag:enemyClanData.tag,name:enemyClanData.name,membersCount:enemyClanData.members.length,score:0},startTime:firebase.firestore.FieldValue.serverTimestamp(),status:'active'});batch.update(db.collection('clans').doc(myClanId),{warStatus:'in_war',currentWarId:warId});batch.update(db.collection('clans').doc(enemyClanId),{warStatus:'in_war',currentWarId:warId});await batch.commit();let lang=localStorage.getItem('lang')||'ar';showToast(lang==='en'?"Enemy Found! WAR STARTED!":"تم العثور على عدو! بدأت الحرب الطاحنة!")}
window.listenToActiveWar=function(warId,myClanId){if(!warId)return;db.collection('wars').doc(warId).onSnapshot(doc=>{if(!doc.exists)return;const war=doc.data();let myData=war.clan1.id===myClanId?war.clan1:war.clan2;let enemyData=war.clan1.id===myClanId?war.clan2:war.clan1;document.getElementById('war-mine-name').innerText=myData.name||'عصابتي';document.getElementById('war-mine-tag').innerText='['+myData.tag+']';document.getElementById('war-mine-members').innerText=myData.membersCount||1;document.getElementById('war-score-mine').innerText=myData.score.toLocaleString();document.getElementById('war-enemy-name').innerText=enemyData.name||'العدو';document.getElementById('war-enemy-tag').innerText='['+enemyData.tag+']';document.getElementById('war-enemy-members').innerText=enemyData.membersCount||1;document.getElementById('war-score-enemy').innerText=enemyData.score.toLocaleString();let totalScore=myData.score+enemyData.score;let myPercentage=50;let enemyPercentage=50;if(totalScore>0){myPercentage=(myData.score/totalScore)*100;enemyPercentage=(enemyData.score/totalScore)*100;if(myPercentage<10){myPercentage=10;enemyPercentage=90}
if(enemyPercentage<10){enemyPercentage=10;myPercentage=90}}
const tugMine=document.getElementById('tug-mine');const tugEnemy=document.getElementById('tug-enemy');if(tugMine)tugMine.style.width=myPercentage+'%';if(tugEnemy)tugEnemy.style.width=enemyPercentage+'%';if(war.startTime&&war.status==='active'&&typeof startWarTimer==='function'){startWarTimer(war.startTime,warId,myClanId,myData.score,enemyData.score)}})};window.currentWarTimerInterval=null;window.startWarTimer=function(warStartTime,warId,myClanId,myScore,enemyScore){if(window.currentWarTimerInterval){clearInterval(window.currentWarTimerInterval)}
if(!warStartTime)return;const lang=localStorage.getItem('lang')||'ar';const warDurationMs=24*60*60*1000;const startTimeMs=typeof warStartTime.toDate==='function'?warStartTime.toDate().getTime():new Date(warStartTime).getTime();const endTime=startTimeMs+warDurationMs;window.currentWarTimerInterval=setInterval(async()=>{const timerElement=document.getElementById('war-countdown-timer');if(!timerElement)return;const now=new Date().getTime();const distance=endTime-now;if(distance<=0){clearInterval(window.currentWarTimerInterval);timerElement.innerHTML=lang==='en'?"Challenge Ended!":"انتهت المنافسة!";await finishClanWar(warId,myClanId,myScore,enemyScore)}else{let h=Math.floor((distance%(1000*60*60*24))/(1000*60*60));let m=Math.floor((distance%(1000*60*60))/(1000*60));let s=Math.floor((distance%(1000*60))/1000);h=h<10?"0"+h:h;m=m<10?"0"+m:m;s=s<10?"0"+s:s;timerElement.innerText=`${h}h : ${m}m : ${s}s`}},1000)};window.addVolumeToClanWar=async function(volume){try{const user=auth.currentUser;if(!user||volume<=0)return;const userRef=db.collection('users').doc(user.uid);const userDoc=await userRef.get();if(!userDoc.exists)return;let userData=userDoc.data();if(!userData.clanId)return;const clanRef=db.collection('clans').doc(userData.clanId);const clanDoc=await clanRef.get();if(!clanDoc.exists)return;const clanData=clanDoc.data();if(clanData.warStatus==='in_war'&&clanData.currentWarId){const currentWarId=clanData.currentWarId;let warContributions=userData.warContributions||{warId:null,count:0};if(warContributions.warId!==currentWarId){warContributions={warId:currentWarId,count:0}}
if(warContributions.count>=2){setTimeout(()=>showToast(currentLang==='en'?"War Limit: Only your first 2 workouts count!":"تنبيه: تم احتساب أول تمرينين لك فقط في هذه الحرب!"),1500);return}
const warRef=db.collection('wars').doc(currentWarId);const warDocLocal=await warRef.get();if(warDocLocal.exists&&warDocLocal.data().status==='active'){let isClan1=warDocLocal.data().clan1.id===userData.clanId;let updateField=isClan1?'clan1.score':'clan2.score';let memberField=isClan1?`clan1.members.${user.uid}`:`clan2.members.${user.uid}`;await warRef.update({[updateField]:firebase.firestore.FieldValue.increment(volume),[`${memberField}.name`]:userData.firstName||'Hero',[`${memberField}.photo`]:userData.photoURL||'/Photos/adm.png',[`${memberField}.volume`]:firebase.firestore.FieldValue.increment(volume)});warContributions.count+=1;await userRef.update({warContributions:warContributions});let localData=JSON.parse(localStorage.getItem('currentUser')||'{}');localData.warContributions=warContributions;localStorage.setItem('currentUser',JSON.stringify(localData));if(warContributions.count===2){setTimeout(()=>showToast(currentLang==='en'?"2/2 War workouts used!":"استنفذت تمرينين الحرب (2/2)! التمارين القادمة لن تحسب فيها."),1500)}else{setTimeout(()=>showToast(currentLang==='en'?"1/2 War workouts logged!":"تم إضافة وزنك للحرب (1/2)!"),1500)}}}}catch(err){console.error("خطأ في احتساب النقاط للفريق:",err)}};




window.finishClanWar = async function(warId, myClanId, myScore, enemyScore) {
    const lang = localStorage.getItem('lang') || 'ar';
    try {
        const warRef = db.collection('wars').doc(warId);
        const warDoc = await warRef.get();
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
        
        batch.update(clan1Ref, { warStatus: 'idle', currentWarId: null, lastWarId: warId });
        batch.update(clan2Ref, { warStatus: 'idle', currentWarId: null, lastWarId: warId });
        
        const clan1Doc = await clan1Ref.get();
        const clan2Doc = await clan2Ref.get();
        const clan1Members = clan1Doc.exists ? clan1Doc.data().members || [] :[];
        const clan2Members = clan2Doc.exists ? clan2Doc.data().members || [] :[];
        const clan1Score = warData.clan1.score || 0;
        const clan2Score = warData.clan2.score || 0;
        const clan1Wins = clan1Score > clan2Score;
        const clan2Wins = clan2Score > clan1Score;
        const isDraw = clan1Score === clan2Score;
        
        if (clan1Wins) batch.update(clan1Ref, { 'stats.wins': firebase.firestore.FieldValue.increment(1) });
        if (clan2Wins) batch.update(clan2Ref, { 'stats.wins': firebase.firestore.FieldValue.increment(1) });
        
        const sendWarNotifs = (members, won, draw) => {
            members.forEach(m => {
                const userRef = db.collection('users').doc(m.uid);
                const notifRef = userRef.collection('notifications').doc('war_result_' + warId);
                
                if (won) {
                    // 🔥 إضافة صندوق الحرب الأسطوري لكل عضو في الكلان الفائز 🔥
                    batch.update(userRef, { 'crates.war': firebase.firestore.FieldValue.increment(1) });
                    batch.set(notifRef, {
                        title: lang === 'en' ? "🏆 Clan War Victory!" : "🏆 انتصار في حرب الكلانات!",
                        text: lang === 'en' ? "Your clan won the war! You received 1000 XP & 1x Legendary War Chest." : "سحق كلانك الخصوم! حصلت على 1000 XP وصندوق حرب أسطوري 🎁.",
                        type: 'system_reward',
                        status: 'pending',
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });
                } else if (draw) {
                    batch.set(notifRef, {
                        title: lang === 'en' ? "⚖️ Clan War Draw" : "⚖️ تعادل في الحرب",
                        text: lang === 'en' ? "The war ended in a draw! No XP awarded." : "انتهت الحرب بالتعادل! لا يوجد فائز ولا خاسر.",
                        type: 'system_reward',
                        status: 'pending',
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });
                } else {
                    batch.set(notifRef, {
                        title: lang === 'en' ? "💀 Clan War Defeat" : "💀 هزيمة في الحرب",
                        text: lang === 'en' ? "Your clan lost the war. Train harder and seek revenge!" : "لقد خسر كلانك الحرب. ارفعوا أوزان أثقل وانتقموا!",
                        type: 'system_reward',
                        status: 'pending',
                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });
                }
            });
        };
        
        sendWarNotifs(clan1Members, clan1Wins, isDraw);
        sendWarNotifs(clan2Members, clan2Wins, isDraw);
        
        await batch.commit();
        
        const myActualWin = (myClanId === clan1Id && clan1Wins) || (myClanId === clan2Id && clan2Wins);
        
        if (myActualWin && !isDraw) {
            setTimeout(() => {
                if (typeof addXP === "function") addXP(1000, 'game', 'RGA_SECURE_998877', 'war_win');
                
                // 🔥 تحديث المخزون المحلي للاعب عشان يشوف الصندوق فوراً بالمتجر 🔥
                let userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
                if (!userData.crates) userData.crates = {};
                userData.crates['war'] = (userData.crates['war'] || 0) + 1;
                localStorage.setItem('currentUser', JSON.stringify(userData));
                
            }, 1000);
        }
        
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


window.closeWarResultAndGoToTab=function(){const resultOverlay=document.getElementById('war-result-overlay');if(resultOverlay)resultOverlay.remove();const guildContentArea=document.getElementById('guild-content-area');if(guildContentArea){const warTabBtn=document.querySelector('.perf-tab-btn[onclick*="war"]');if(warTabBtn){switchGuildTab('war',warTabBtn)}}else{if(typeof openGuildHub==='function'){openGuildHub();setTimeout(()=>{const warTabBtn=document.querySelector('.perf-tab-btn[onclick*="war"]');if(warTabBtn)switchGuildTab('war',warTabBtn);},1000)}}};window.startBackgroundWarMonitor=async function(user){if(!user)return;const userDoc=await db.collection('users').doc(user.uid).get();if(!userDoc.exists)return;const userData=userDoc.data();if(userData.clanId){db.collection('clans').doc(userData.clanId).onSnapshot(clanDoc=>{if(!clanDoc.exists)return;const clanData=clanDoc.data();if(clanData.warStatus==='in_war'&&clanData.currentWarId){db.collection('wars').doc(clanData.currentWarId).onSnapshot(warDoc=>{if(!warDoc.exists)return;const warData=warDoc.data();if(warData.status==='active'&&warData.startTime){const warDurationMs = 24 * 60 * 60 * 1000;

const startTimeMs=typeof warData.startTime.toDate==='function'?warData.startTime.toDate().getTime():new Date(warData.startTime).getTime();const endTime=startTimeMs+warDurationMs;const distance=endTime-new Date().getTime();let myData=warData.clan1.id===userData.clanId?warData.clan1:warData.clan2;let enemyData=warData.clan1.id===userData.clanId?warData.clan2:warData.clan1;if(distance<=0){finishClanWar(warData.id,userData.clanId,myData.score,enemyData.score)}else{if(window.bgWarTimer)clearTimeout(window.bgWarTimer);window.bgWarTimer=setTimeout(()=>{finishClanWar(warData.id,userData.clanId,myData.score,enemyData.score)},distance)}}})}})}};window.buildActiveWarHTML=function(warData,myClanId){let lang=localStorage.getItem('lang')||'ar';let myData=warData.clan1.id===myClanId?warData.clan1:warData.clan2;let enemyData=warData.clan1.id===myClanId?warData.clan2:warData.clan1;const renderMembers=(clanData)=>{let membersArr=[];if(clanData.members){for(let uid in clanData.members){membersArr.push(clanData.members[uid])}}
membersArr.sort((a,b)=>b.volume-a.volume);if(membersArr.length===0)return `<p style="color:var(--slate); font-size:0.8rem; text-align:center;">${lang==='en'?'No data':'لا توجد بيانات'}</p>`;return membersArr.map((m,i)=>`
            <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.05); padding:8px 12px; border-radius:8px; margin-bottom:5px;">
                <div style="display:flex; align-items:center; gap:10px;">
                    <span style="color:var(--slate); font-weight:bold; font-size:0.8rem;">#${i+1}</span>
                    <img src="${m.photo || '/Photos/adm.png'}" style="width:30px; height:30px; border-radius:50%; object-fit:cover;">
                    <span style="color:white; font-size:0.85rem; font-weight:bold;">${m.name}</span>
                </div>
                <span style="color:var(--primary-color); font-weight:900; font-size:0.9rem;">${m.volume ? m.volume.toLocaleString() : 0} kg</span>
            </div>
        `).join('')};return `
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
    `};
window.loadActiveGuild=async function(clanId,myUid){window.scrollTo(0,0);const area=document.getElementById('guild-content-area');if(!area)return;let lang=localStorage.getItem('lang')||'ar';const t=(typeof translations!=='undefined'&&translations[lang])?translations[lang]:{};db.collection('clans').doc(clanId).onSnapshot(async doc=>{try{if(!doc.exists){let userData=JSON.parse(localStorage.getItem('currentUser')||'{}');userData.clanId=null;localStorage.setItem('currentUser',JSON.stringify(userData));if(myUid)await db.collection('users').doc(myUid).update({clanId:null});if(typeof renderNoGuildScreen==='function')renderNoGuildScreen(t);return}
const clan=doc.data()||{};


let clanMembersArray = Array.isArray(clan.members) ? clan.members : [];
if (!clanMembersArray.some(member => member.uid === myUid)) {

    if (typeof forceLeaveGuild === 'function') {
        forceLeaveGuild(clanId, myUid);
    }
    return; 
}


const isLeader=clan.leaderId===myUid;let clanName=clan.name||'عصابة مجهولة';



let clanTag=clan.tag||'000';let clanMotto=clan.motto||(lang==='en'?'No motto set yet.':'لم يتم تعيين عبارة للكلان.');let clanEmblem=clan.emblem||'fa-solid fa-dragon';let clanColor=clan.emblemColor||'#FFD700';let clanWins=clan.stats?clan.stats.wins:0;let clanMembers=Array.isArray(clan.members)?clan.members:[];let membersPromises=clanMembers.map(async m=>{if(!m||!m.uid)return'';let isMng=m.uid===clan.leaderId;let roleIcon=isMng?`<i class="fa-solid fa-crown" style="color:${clanColor}; filter: drop-shadow(0 0 5px ${clanColor});"></i>`:'';let userPhoto="/Photos/adm.png";let fullName=m.name||'بطل';try{let uDoc=await db.collection('users').doc(m.uid).get();if(uDoc.exists){let uData=uDoc.data();if(uData.photoURL)userPhoto=uData.photoURL;if(uData.firstName)fullName=uData.firstName+" "+(uData.lastName||"");}}catch(e){}
let readyDot=m.uid===myUid?`<button class="ready-toggle-btn" onclick="toggleWarReady('${clanId}', '${m.uid}', ${m.warReady})"><span style="color:${m.warReady?'#00f2a7':'#ff4d4d'}; font-size: 0.8rem; font-weight:bold; background: rgba(${m.warReady?'0,242,167':'255,77,77'},0.1); padding: 4px 10px; border-radius: 8px; border: 1px solid currentColor; display: inline-block;"><i class="fa-solid ${m.warReady?'fa-check':'fa-xmark'}"></i></span></button>`:`<span style="color:${m.warReady?'#00f2a7':'#ff4d4d'}; font-size: 0.8rem; font-weight:bold; background: rgba(${m.warReady?'0,242,167':'255,77,77'},0.1); padding: 2px 8px; border-radius: 6px; border: 1px solid currentColor;"><i class="fa-solid ${m.warReady?'fa-check':'fa-xmark'}"></i></span>`;let adminMenu=(isLeader&&!isMng)?`
    <div class="member-actions-menu">
        <button class="dots-btn member-menu-trigger" onclick="toggleMemberMenu('menu-${m.uid}', this)"><i class="fa-solid fa-ellipsis-vertical"></i></button>
        <div id="menu-${m.uid}" class="dropdown-content-pro member-action-menu-content" style="border-radius: 8px; box-shadow: 0px 5px 15px rgba(0,0,0,0.5);">
            <div class="dropdown-item-pro" onclick="transferLeadership('${clanId}', '${m.uid}')"><i class="fa-solid fa-crown" style="color:#FFD700;"></i> ${lang==='en'?'Make Leader':'ترقية لزعيم'}</div>
            <div class="dropdown-item-pro danger" onclick="kickClanMember('${clanId}', '${m.uid}')"><i class="fa-solid fa-user-slash"></i> ${lang==='en'?'Kick':'طرد'}</div>
        </div>
    </div>`:'';return `
                    <div class="member-card-premium ${isMng ? 'leader' : ''}" ${isMng ? `style="border-left-color:${clanColor}; background:linear-gradient(90deg, ${clanColor}11, transparent);"` : ''}>
                        <div style="display:flex; align-items:center; gap:12px;">
                            <img src="${userPhoto}" style="width: 45px; height: 45px; border-radius: 50%; object-fit: cover; border: 2px solid ${isMng ? clanColor : 'var(--slate)'};">
                            <div>
<h4 style="color:white; margin:0; font-size:0.95rem;">${fullName} ${roleIcon}</h4>

                                <p style="color:var(--slate); font-size:0.8rem; margin:2px 0 0 0;">XP: ${m.xp || 0}</p>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px;">${readyDot}${adminMenu}</div>
                    </div>`});const membersHTMLArray=(await Promise.all(membersPromises)).filter(html=>html!=='');let warContent=`<div id="dynamic-war-content" style="text-align:center; padding: 40px;"><i class="fa-solid fa-spinner fa-spin fa-2x" style="color:#FFD700;"></i></div>`;let settingsHTML='';if(isLeader){settingsHTML=`
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
                `}else{settingsHTML=`<div style="text-align:center; padding: 30px; color: var(--slate);"><i class="fa-solid fa-lock fa-3x" style="margin-bottom:15px; color:#555;"></i><p>${lang==='en'?'Only the Leader can access settings.':'الزعيم فقط من يمكنه تعديل إعدادات الكلان.'}</p></div>`}
area.innerHTML=`
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
                    ${isLeader ? `<button class="perf-tab-btn" style="white-space:nowrap; padding:8px 12px;" onclick="switchGuildTab('settings', this); initSettingsUI('${clanEmblem}', '${clanColor}');"><i class="fa-solid fa-gear"></i>${lang==='en'?'Settings':'الإعدادات'}</button>` : ''}
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
            `;window.scrollTo(0,0);const dynamicWarContent=document.getElementById('dynamic-war-content');if(dynamicWarContent){if(clan.warStatus==='in_war'&&clan.currentWarId){dynamicWarContent.outerHTML=buildWarScreenHTML(clan,t)}else if(clan.lastWarId){db.collection('wars').doc(clan.lastWarId).get().then(warDoc=>{if(warDoc.exists){const warElement=document.getElementById('dynamic-war-content');if(warElement)warElement.outerHTML=buildLastWarResultHTML(clan,warDoc.data(),t,isLeader);}else{const warElement=document.getElementById('dynamic-war-content');if(warElement)warElement.outerHTML=buildWarIdleHTML(clan,t,isLeader);}}).catch(()=>{const warElement=document.getElementById('dynamic-war-content');if(warElement)warElement.outerHTML=buildWarIdleHTML(clan,t,isLeader);})}else{dynamicWarContent.outerHTML=buildWarIdleHTML(clan,t,isLeader)}}}catch(err){console.error(err)}
if(clan.lastWarId){let userData=JSON.parse(localStorage.getItem('currentUser')||'{}');if(userData.lastSeenWarId!==clan.lastWarId){db.collection('wars').doc(clan.lastWarId).get().then(warDoc=>{if(warDoc.exists){const warData=warDoc.data();let myData=warData.clan1.id===clanId?warData.clan1:warData.clan2;let enemyData=warData.clan1.id===clanId?warData.clan2:warData.clan1;let isWinner=myData.score>enemyData.score;let isDraw=myData.score===enemyData.score;if(typeof showWarResultUI==='function'){showWarResultUI(isWinner,isDraw,clan.lastWarId,clanId)}
userData.lastSeenWarId=clan.lastWarId;localStorage.setItem('currentUser',JSON.stringify(userData));if(myUid){db.collection('users').doc(myUid).update({lastSeenWarId:clan.lastWarId})}}})}}})};setInterval(()=>{const portal=document.querySelector('.mythic-clan-portal');if(!portal)return;const isProfileOpen=!!document.getElementById('edit-bio-btn');const isModalOpen=document.getElementById('player-profile-modal')?.style.display==='flex';if(isProfileOpen||isModalOpen){portal.classList.add('stop-portal-animation')}else{portal.classList.remove('stop-portal-animation')}},300);window.rejectWorkout=async function(docId){const t=translations[currentLang||'ar'];if(!confirm(t.confirm_reject))return;try{const docRef=db.collection('pending_workouts').doc(docId);const docSnap=await docRef.get();if(!docSnap.exists)return;const data=docSnap.data();const userRef=db.collection('users').doc(data.userId);const userSnap=await userRef.get();if(userSnap.exists){await userRef.collection('notifications').add({type:'admin_alert',senderName:t.admin_name,text:t.admin_notif_reject,status:'pending',timestamp:firebase.firestore.FieldValue.serverTimestamp()});await userRef.update({isWorkoutPending:!1})}else{console.log("اللاعب صاحب هذا الطلب محذوف، جاري تنظيف الطلب فقط.")}
try{if(data.videoUrl)await storage.refFromURL(data.videoUrl).delete();}catch(e){console.warn("Video already deleted or path invalid")}
await docRef.delete();showToast(t.reject_success);loadPendingWorkouts()}catch(e){console.error("Rejection Error:",e);showToast(t.reject_fail)}};document.addEventListener('DOMContentLoaded',()=>{const cropCancelBtn=document.getElementById('crop-cancel-btn');if(cropCancelBtn){cropCancelBtn.onclick=()=>{document.getElementById('cropper-modal').style.display='none';if(cropper)cropper.destroy();}}
const friendSearchInput=document.getElementById('friend-search-input');if(friendSearchInput){friendSearchInput.addEventListener('keyup',(e)=>{if(e.key==='Enter'){searchPlayerByID()}})}});window.dismissNotif=async function(notifId){const currentUser=auth.currentUser;if(!currentUser)return;try{await db.collection('users').doc(currentUser.uid).collection('notifications').doc(notifId).delete()}catch(e){console.error(e)}};let audioCtx=null;const N={'C2':65.4,'C#2':69.3,'D2':73.4,'D#2':77.8,'E2':82.4,'F2':87.3,'F#2':92.5,'G2':98.0,'G#2':103.8,'A2':110.0,'A#2':116.5,'B2':123.5,'C3':130.8,'C#3':138.6,'D3':146.8,'D#3':155.6,'E3':164.8,'F3':174.6,'F#3':185.0,'G3':196.0,'G#3':207.7,'A3':220.0,'A#3':233.1,'B3':246.9,'C4':261.6,'C#4':277.2,'D4':293.7,'D#4':311.1,'E4':329.6,'F4':349.2,'F#4':370.0,'G4':392.0,'G#4':415.3,'A4':440.0,'A#4':466.2,'B4':493.9,'C5':523.3,'C#5':554.4,'D5':587.3,'D#5':622.3,'E5':659.3,'F5':698.5,'F#5':740.0,'G5':784.0,'G#5':830.6,'A5':880.0,'A#5':932.3,'B5':987.8,'C6':1046.5,'C#6':1108.7,'D6':1174.7,'D#6':1244.5,'E6':1318.5,'F6':1396.9,'F#6':1480.0,'G6':1568.0};const rawSymphonies=[{type:'sine',notes:"G#3 C#4 E4 G#3 C#4 E4 G#3 C#4 E4 G#3 C#4 E4 A3 C#4 E4 A3 C#4 E4 A3 D4 F#4 A3 D4 F#4 G#3 C#4 F#4 G#3 C#4 E4 G#3 C#4 D#4 F#3 C#4 D#4 E3 G#3 C#4 E3 G#3 C#4 E3 G#3 C#4 E3 G#3 C#4 G#3 C#4 E4 G#3 C#4 E4"},{type:'sine',notes:"E5 D#5 E5 D#5 E5 B4 D5 C5 A4 C4 E4 A4 B4 E4 G#4 B4 C5 E4 E5 D#5 E5 D#5 E5 B4 D5 C5 A4 C4 E4 A4 B4 E4 C5 B4 A4 E5 D#5 E5 D#5 E5 B4 D5 C5 A4 C4 E4 A4 B4 E4 G#4 B4 C5"},{type:'triangle',notes:"E4 A4 B4 C5 D5 E5 C5 A4 E4 F4 G4 A4 E4 C4 D4 E4 F4 E4 D4 C4 B3 A3 B3 C4 D4 E4 A4 B4 C5 D5 E5 C5 A4 E4 F4 G4 A4 E4 C4 D4 E4 F4 E4 D4 C4 B3 A3 B3 C4 D4"},{type:'sine',notes:"F#5 E5 F#5 E5 F#5 C#5 D5 E5 A4 C#5 D5 E5 F#5 E5 F#5 E5 F#5 C#5 D5 E5 A4 C#5 D5 E5 D5 C#5 B4 A4 B4 C#5 D5 E5 C#5 A4 F#4 G#4 A4 B4 A4 G#4 A4 C#5 D5 E5 F#5 E5 F#5 E5 F#5 C#5"},{type:'sine',notes:"A4 B4 C5 B4 A4 E5 A4 B4 C5 B4 A4 E5 A4 B4 C5 B4 A4 C6 B5 A5 E5 D5 E5 A4 E5 A4 B4 C5 B4 A4 E5 A4 B4 C5 B4 A4 E5 A4 B4 C5 B4 A4 C6 B5 A5 E5 D5 E5 A4 E5 A4 B4 C5 B4"},{type:'triangle',notes:"G4 C5 D#5 D5 C5 D#5 C5 D5 C5 G#4 A#4 G4 G4 C5 D#5 D5 C5 D#5 C5 D5 C5 G4 F#4 F4 F4 G#4 D5 C5 B4 C5 D5 D#5 C5 G#4 A#4 G4 G4 C5 D#5 D5 C5 D#5 C5 D5 C5 G#4 A#4 G4 G4 C5 D#5 D5 C5 D#5 C5"},{type:'triangle',notes:"G4 A#4 D5 G4 A#4 D5 G4 A#4 D5 G4 A#4 D5 A4 C5 E5 A4 C5 E5 A4 C5 E5 A4 C5 E5 A#4 D5 F5 A#4 D5 F5 A#4 D5 F5 A#4 D5 F5 C5 D#5 G5 C5 D#5 G5 C5 D#5 G5 C5 D#5 G5 G4 A#4 D5 G4 A#4 D5 G4 A#4"},{type:'sine',notes:"A4 E5 A4 E5 A4 E5 A4 E5 B4 E5 B4 E5 B4 E5 B4 E5 C5 E5 C5 E5 C5 E5 C5 E5 D5 E5 D5 E5 D5 E5 D5 E5 E5 B5 E5 B5 E5 B5 E5 B5 C6 E5 C6 E5 C6 E5 C6 E5 A4 E5 A4 E5 B4 E5 B4 E5 C5 E5"},{type:'sine',notes:"A3 C4 D4 D4 D4 E4 F4 F4 F4 G4 E4 E4 D4 C4 D4 A3 C4 D4 D4 D4 E4 F4 F4 F4 G4 E4 E4 D4 C4 D4 A3 C4 D4 D4 D4 F4 G4 G4 G4 A4 A#4 A#4 A4 G4 A4 D4 D4 F4 G4 A4 D4 D4 E4 F4 F4 F4 G4"},{type:'triangle',notes:"G4 G4 G4 D#4 A#4 G4 D#4 A#4 G4 D5 D5 D5 D#5 A#4 F#4 D#4 A#4 G4 G5 G4 G4 G5 F#5 F5 E5 D#5 E5 G#4 C#5 C5 B4 A#4 A4 A#4 D#4 F#4 D#4 F#4 A#4 G4 A#4 D5 G5 G4 G4 G5 F#5 F5 E5 D#5 E5"},{type:'sine',notes:"F4 G4 A4 G4 F4 G4 C5 A#4 A4 F4 D4 C4 F4 G4 A4 G4 F4 G4 C5 D5 C5 G4 F4 F4 F4 F4 E4 F4 F4 E4 F4 G4 A4 G4 F4 F4 F4 F4 E4 F4 F4 C4 F4 G4 C5 A#4 A4 G4 A4 A#4 A4 G4 F4 E4 F4 D4 C4"},{type:'triangle',notes:"D4 F4 D4 F4 D4 A#4 D4 A4 D4 F4 D4 F4 D4 A#4 D4 A4 D4 F4 D4 F4 D4 C5 D4 B4 D4 F4 D4 F4 D4 C5 D4 B4 D4 F4 D4 F4 D4 A#4 D4 A4 D4 F4 D4 F4 D4 A#4 D4 A4 D4 F4 D4 F4 D4 C5 D4 B4 D4 F4 D4 F4"},{type:'sine',notes:"C5 E5 A5 C5 E5 A5 C5 E5 A5 C5 E5 A5 C5 E5 A5 C5 E5 A5 C5 E5 A5 C5 E5 A5 B4 E5 A5 B4 E5 A5 B4 E5 A5 B4 E5 A5 B4 E5 A5 B4 E5 A5 B4 E5 A5 B4 E5 A5 C5 E5 A5 C5 E5 A5 C5 E5 A5 B4 E5"},{type:'sine',notes:"D4 F4 A4 D4 F4 A4 D4 F4 A4 D4 F4 A4 D4 G4 A#4 D4 G4 A#4 D4 G4 A#4 D4 G4 A#4 D4 F4 A4 D4 F4 A4 D4 F4 A4 D4 F4 A4 D4 G4 A#4 D4 G4 A#4 D4 G4 A#4 D4 G4 A#4 D4 F4 A4 D4 F4 A4 D4 F4"},{type:'triangle',notes:"C5 E5 A5 C5 E5 A5 C5 E5 A5 C5 E5 A5 C5 E5 A5 C5 E5 A5 C5 E5 A5 C5 E5 A5 B4 E5 G#5 B4 E5 G#5 B4 E5 G#5 B4 E5 G#5 B4 E5 G#5 B4 E5 G#5 B4 E5 G#5 B4 E5 G#5 C5 E5 A5 C5 E5 A5 C5 E5 A5 C5 E5 A5"},{type:'sine',notes:"E5 G5 C6 E5 G5 C6 E5 G5 C6 E5 G5 C6 E5 G5 C6 E5 G5 C6 E5 G5 C6 E5 G5 C6 D5 G5 B5 D5 G5 B5 D5 G5 B5 D5 G5 B5 D5 G5 B5 D5 G5 B5 D5 G5 B5 D5 G5 B5 E5 G5 C6 E5 G5 C6 E5 G5 C6 E5 G5 C6 E5 G5"},{type:'triangle',notes:"D#4 A#4 A#4 F#4 F#4 D#4 A#4 A#4 F#4 F#4 C#4 G#4 G#4 F4 F4 C#4 G#4 G#4 F4 F4 B3 F#4 F#4 D#4 D#4 B3 F#4 F#4 D#4 D#4 A#3 F4 F4 C#4 C#4 A#3 F4 F4 C#4 C#4 D#4 A#4 A#4 F#4 F#4 D#4 A#4 A#4 F#4 F#4"},{type:'sine',notes:"C#5 C#5 E5 E5 G#5 G#5 F#5 F#5 C#5 C#5 E5 E5 G#5 G#5 F#5 F#5 A4 A4 C#5 C#5 E5 E5 D#5 D#5 G#4 G#4 B4 B4 D#5 D#5 C#5 C#5 C#5 C#5 E5 E5 G#5 G#5 F#5 F#5 C#5 C#5 E5 E5 G#5 G#5 F#5 F#5 A4 A4 C#5 C#5"},{type:'sine',notes:"F4 A#4 F4 A#4 G#4 C#5 G#4 C#5 F4 A#4 F4 A#4 G#4 C#5 G#4 C#5 F4 A#4 F4 A#4 G#4 C#5 G#4 C#5 F4 A#4 F4 A#4 G#4 C#5 G#4 C#5 F4 A#4 F4 A#4 G#4 C#5 G#4 C#5 F4 A#4 F4 A#4 G#4 C#5 G#4 C#5 F4 A#4 F4"},{type:'triangle',notes:"E4 G4 A4 B4 A4 G4 E4 E4 G4 A4 B4 A4 G4 E4 D4 E4 G4 A4 B4 A4 G4 E4 E4 G4 A4 B4 A4 G4 E4 D4 E4 G4 A4 B4 A4 G4 E4 E4 G4 A4 B4 A4 G4 E4 D4 E4 G4 A4 B4 A4 G4 E4 E4 G4 A4 B4 A4 G4 E4 D4"},{type:'triangle',notes:"C4 D#4 G4 C5 A#4 G4 D#4 C4 C4 D#4 G4 C5 A#4 G4 D#4 C4 C4 D#4 G4 C5 A#4 G4 D#4 C4 C4 D#4 G4 C5 A#4 G4 D#4 C4 C4 D#4 G4 C5 A#4 G4 D#4 C4 C4 D#4 G4 C5 A#4 G4 D#4 C4 C4 D#4 G4 C5 A#4 G4 D#4 C4"},{type:'sine',notes:"C4 E4 A4 B4 C5 B4 A4 E4 C4 D4 E4 F4 E4 D4 C4 B3 C4 E4 A4 B4 C5 B4 A4 E4 A4 C5 D5 E5 D5 C5 B4 A4 C4 E4 A4 B4 C5 B4 A4 E4 C4 D4 E4 F4 E4 D4 C4 B3 C4 E4 A4 B4 C5 B4 A4 E4 C4 D4"},{type:'sine',notes:"B4 B4 B5 A5 B4 F#5 E5 D5 E5 B4 B4 B5 A5 B4 F#5 E5 D5 C#5 B4 B4 B5 A5 B4 F#5 E5 D5 E5 D5 E5 F#5 G5 F#5 E5 D5 C#5 B4 B4 B5 A5 B4 F#5 E5 D5 E5 B4 B4 B5 A5 B4 F#5 E5 D5 C#5 B4 B4"},{type:'sine',notes:"D5 C#5 B4 A4 B4 F#4 D5 C#5 B4 A4 B4 F#4 B4 C#5 D5 E5 F#5 D5 C#5 B4 C#5 A4 B4 B4 C#5 D5 E5 F#5 A5 G5 F#5 E5 D5 C#5 B4 A4 B4 F#4 D5 C#5 B4 A4 B4 F#4 B4 C#5 D5 E5 F#5 D5 C#5 B4 C#5"},{type:'triangle',notes:"E4 E4 E4 E4 F4 G4 G4 G4 F4 E4 D4 D4 D4 D4 E4 F4 F4 F4 E4 D4 C4 C4 C4 C4 D4 E4 E4 E4 D4 C4 B3 B3 B3 C4 D4 B3 G#3 A3 B3 C4 D4 E4 F4 G4 A4 G4 F4 E4 D4 C4 B3 A3 B3 C4 D4 E4"},{type:'triangle',notes:"A4 B4 C5 B4 A4 G4 A4 B4 A4 G4 D5 C5 B4 A4 G4 F#4 G4 A4 B4 C5 D5 E5 F#5 G5 A5 G5 F#5 E5 D5 C5 B4 A4 G4 F#4 E4 D4 C4 B3 A3 B3 C4 D4 E4 F#4 G4 A4 B4 C5 B4 A4 G4 F#4 E4 D4 C4 B3 A3"},{type:'sine',notes:"G4 C4 D#4 F4 G4 C4 D#4 F4 G4 C4 D#4 F4 G4 C4 D#4 F4 F4 A#3 D#4 D4 F4 A#3 D#4 D4 F4 A#3 D#4 D4 F4 A#3 D#4 D4 G4 C4 D#4 F4 G4 C4 D#4 F4 G4 C4 D#4 F4 G4 C4 D#4 F4 F4 A#3 D#4 D4"},{type:'sine',notes:"F4 A#4 F4 D4 F4 A#4 F4 D4 F4 A#4 F4 D4 F4 A#4 F4 D4 F4 C5 F4 D4 F4 C5 F4 D4 F4 C5 F4 D4 F4 C5 F4 D4 G4 A#4 G4 D#4 G4 A#4 G4 D#4 G4 A#4 G4 D#4 G4 A#4 G4 D#4 F4 A#4 F4 D4 F4 A#4 F4 D4"},{type:'sine',notes:"F4 A#4 F4 A#4 G#4 C#5 G#4 C#5 F4 A#4 F4 A#4 G#4 C#5 G#4 C#5 F4 A#4 F4 A#4 G#4 C#5 G#4 C#5 F4 A#4 F4 A#4 G#4 C#5 G#4 C#5 F4 A#4 F4 A#4 G#4 C#5 G#4 C#5 F4 A#4 F4 A#4 G#4 C#5 G#4 C#5 F4 A#4 F4"},{type:'sine',notes:"E5 B4 C5 D5 C5 B4 A4 A4 C5 E5 D5 C5 B4 B4 C5 D5 E5 C5 A4 A4 D5 F5 A5 G5 F5 E5 C5 E5 D5 C5 B4 B4 C5 D5 E5 C5 A4 A4 E5 B4 C5 D5 C5 B4 A4 A4 C5 E5 D5 C5 B4 B4 C5 D5 E5 C5"},{type:'triangle',notes:"E5 E5 E5 C5 E5 G5 G4 C5 G4 E4 A4 B4 A#4 A4 G4 E5 G5 A5 F5 G5 E5 C5 D5 B4 C5 G4 E4 A4 B4 A#4 A4 G4 E5 G5 A5 F5 G5 E5 C5 D5 B4 C5 G4 E4 A4 B4 A#4 A4 G4 E5 G5 A5 F5 G5 E5 C5 D5"},{type:'triangle',notes:"A4 A4 C5 A4 D5 A4 E5 D5 C5 C5 E5 C5 G5 C5 E5 C5 G4 G4 B4 G4 C5 G4 D5 C5 F4 F4 A4 F4 C5 F4 C5 B4 A4 A4 C5 A4 D5 A4 E5 D5 C5 C5 E5 C5 G5 C5 E5 C5 G4 G4 B4 G4 C5 G4 D5 C5 F4 F4"},{type:'sine',notes:"D4 D4 D5 A4 G#4 G4 F4 D4 F4 G4 C4 C4 D5 A4 G#4 G4 F4 D4 F4 G4 B3 B3 D5 A4 G#4 G4 F4 D4 F4 G4 A#3 A#3 D5 A4 G#4 G4 F4 D4 F4 G4 D4 D4 D5 A4 G#4 G4 F4 D4 F4 G4 C4 C4 D5 A4 G#4"},{type:'triangle',notes:"E2 E2 E3 E2 E2 D3 E2 E2 C3 E2 E2 A#2 E2 E2 B2 C3 E2 E2 E3 E2 E2 D3 E2 E2 C3 E2 E2 A#2 E2 E2 B2 C3 E2 E2 E3 E2 E2 D3 E2 E2 C3 E2 E2 A#2 E2 E2 B2 C3 E2 E2 E3 E2 E2 D3 E2 E2 C3 E2"},{type:'sine',notes:"A#3 F3 A#3 A#3 C4 D4 D#4 F4 F4 F4 F#4 G#4 A#4 A#4 A#4 G#4 F#4 G#4 F#4 F4 F4 D#4 D#4 F4 F#4 F4 D#4 C#4 C#4 D#4 F4 D#4 C#4 C4 C4 D4 E4 G4 F4 A#3 F3 A#3 A#3 C4 D4 D#4 F4 F4 F4 F#4 G#4 A#4"},{type:'triangle',notes:"F#5 C#5 F#5 C#5 F#5 D5 F#5 C#5 F#5 C#5 F#5 D5 F#5 C#5 F#5 C#5 F#5 D5 F#5 C#5 F#5 C#5 F#5 D5 F5 C5 F5 C5 F5 C#5 F5 C5 F5 C5 F5 C#5 F5 C5 F5 C5 F5 C#5 F5 C5 F5 C5 F5 C#5 F#5 C#5 F#5 C#5 F#5"},{type:'sine',notes:"E4 F#4 G4 A4 G4 F#4 E4 D4 E4 E4 F#4 G4 A4 B4 A4 G4 F#4 E4 D4 C4 B3 A3 G3 A3 B3 C4 D4 E4 F#4 G4 A4 G4 F#4 E4 D4 E4 E4 F#4 G4 A4 B4 A4 G4 F#4 E4 D4 C4 B3 A3 G3 A3 B3 C4 D4 E4 F#4"},{type:'triangle',notes:"E5 E5 E5 E5 E5 E5 E5 E5 E5 E5 E5 E5 E5 E5 E5 E5 F5 E5 D#5 E5 B4 C5 A4 E5 E5 E5 E5 E5 E5 E5 E5 E5 E5 E5 E5 E5 E5 E5 F5 E5 D#5 E5 B4 C5 A4 E5 E5 E5 E5 E5 E5 E5 E5 E5 E5 E5 E5 E5 E5 E5 E5"}];const parsedPlaylists=rawSymphonies.map(song=>{return{type:song.type,notes:song.notes.split(' ').map(n=>N[n]||440.0)}});function shuffleArray(array){let newArr=[...array];for(let i=newArr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[newArr[i],newArr[j]]=[newArr[j],newArr[i]]}
return newArr}
let activePlaylist=[];let currentSymphonyIndex=0;let currentNoteIndex=0;const playTrueSymphonyNote=(score)=>{if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();const now=audioCtx.currentTime;let newSymphonyIndex=Math.floor(score/50);if(newSymphonyIndex>=activePlaylist.length)newSymphonyIndex=activePlaylist.length-1;if(newSymphonyIndex!==currentSymphonyIndex){currentSymphonyIndex=newSymphonyIndex;currentNoteIndex=0;updateVisualStage(score)}
const osc=audioCtx.createOscillator();const gain=audioCtx.createGain();osc.type=activePlaylist[currentSymphonyIndex].type==='sine'?'sine':'triangle';const currentSong=activePlaylist[currentSymphonyIndex].notes;let freq=currentSong[currentNoteIndex];osc.frequency.setValueAtTime(freq,now);gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(0.2,now+0.05);gain.gain.exponentialRampToValueAtTime(0.0001,now+0.5);osc.connect(gain);gain.connect(audioCtx.destination);osc.start(now);osc.stop(now+0.5);currentNoteIndex=(currentNoteIndex+1)%currentSong.length};function updateVisualStage(score){const board=document.getElementById('reflex-board');if(!board)return;let stageClass='stage-0';if(score>=550)stageClass='stage-550';else if(score>=500)stageClass='stage-500';else if(score>=450)stageClass='stage-450';else if(score>=400)stageClass='stage-400';else if(score>=350)stageClass='stage-350';else if(score>=300)stageClass='stage-300';else if(score>=250)stageClass='stage-250';else if(score>=200)stageClass='stage-200';else if(score>=150)stageClass='stage-150';else if(score>=100)stageClass='stage-100';else if(score>=50)stageClass='stage-50';board.className='reflex-board-container '+stageClass}
let reflexScore=0;let reflexSpeed=4.5;let reflexLives=1;let isReflexActive=!1;let reflexGameLoopId=null;let reflexTilesData=[];let tileCounter=0;let distanceSinceLastSpawn=0;const TILE_HEIGHT=130;const BOARD_HEIGHT=480;window.openReflexGame=function(){if(!checkGameCooldown('reflex'))return;document.getElementById('reflex-game-modal').style.display='flex';document.getElementById('reflex-start-overlay').style.display='flex';document.querySelectorAll('.reflex-tile').forEach(el=>el.remove());reflexTilesData=[];reflexScore=0;activePlaylist=shuffleArray(parsedPlaylists);currentSymphonyIndex=0;currentNoteIndex=0;reflexSpeed=4.5;reflexLives=1;document.getElementById('reflex-score-val').innerText='0';document.getElementById('reflex-speed-val').innerText='x1.0';updateVisualStage(0);updateLivesUI();isReflexActive=!1};function updateLivesUI(){let hearts='';for(let i=0;i<reflexLives;i++)hearts+='❤️';document.getElementById('reflex-lives-val').innerText=hearts||'💀'}
window.startReflexGame=function(){if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();audioCtx.resume();document.getElementById('reflex-start-overlay').style.display='none';isReflexActive=!0;distanceSinceLastSpawn=TILE_HEIGHT+50;if(reflexGameLoopId)cancelAnimationFrame(reflexGameLoopId);reflexLoop()};function spawnReflexTile(){const laneIndex=Math.floor(Math.random()*4);const tileId='tile_'+tileCounter++;const isGold=Math.random()<0.02;const tileEl=document.createElement('div');tileEl.className=`reflex-tile ${isGold ? 'heart-tile' : ''}`;tileEl.id=tileId;tileEl.innerHTML=isGold?'<i class="fa-solid fa-heart"></i>':'<i class="fa-solid fa-dumbbell"></i>';const lanes=document.querySelectorAll('.reflex-lane');if(lanes[laneIndex])lanes[laneIndex].appendChild(tileEl);reflexTilesData.push({id:tileId,lane:laneIndex,isGold:isGold,y:-TILE_HEIGHT,element:tileEl,tapped:!1})}


function reflexLoop(){if(!isReflexActive)return;distanceSinceLastSpawn+=reflexSpeed;if(distanceSinceLastSpawn>=TILE_HEIGHT+(reflexSpeed*5)){spawnReflexTile();distanceSinceLastSpawn=0}
for(let i=0;i<reflexTilesData.length;i++){let tile=reflexTilesData[i];if(tile.tapped)continue;tile.y+=reflexSpeed;tile.element.style.transform=`translateY(${tile.y}px)`;if(tile.y>BOARD_HEIGHT){tile.tapped=!0;if(!tile.isGold){reflexLives--;updateLivesUI();currentNoteIndex=0;if(reflexLives<=0){endReflexGame(!1);return}else{document.getElementById('reflex-board').classList.add('reflex-board-shake');setTimeout(()=>document.getElementById('reflex-board').classList.remove('reflex-board-shake'),400)}}
setTimeout(()=>{if(tile.element)tile.element.remove();},300)}}
reflexTilesData=reflexTilesData.filter(t=>!t.tapped);reflexGameLoopId=requestAnimationFrame(reflexLoop)}



window.handleReflexTap=function(laneIndex,event){
    if(event)event.preventDefault();
    if(!isReflexActive)return;
    const board=document.getElementById('reflex-board');
    const boardRect=board.getBoundingClientRect();
    const tapY=(event.touches?event.touches[0].clientY:event.clientY)-boardRect.top;
    const targetTile=reflexTilesData.find(t=>t.lane===laneIndex&&!t.tapped);
    
    if(targetTile&&tapY>=targetTile.y-25&&tapY<=targetTile.y+TILE_HEIGHT+25){
        targetTile.tapped=!0;
        playTrueSymphonyNote(reflexScore);
        
        // 1. نقل الاهتزاز للخلفية عشان ما يعلّق أو يوقف استجابة اللمس
        if(navigator.vibrate) setTimeout(() => navigator.vibrate(15), 0);
        
        if(targetTile.isGold&&reflexLives<3){reflexLives++;updateLivesUI()}
        
        const laneEl=document.querySelectorAll('.reflex-lane')[laneIndex];
        const hitEffect=document.createElement('div');
        hitEffect.className='hit-effect';
        
        // 2. شلنا الحسابات المعقدة (getBoundingClientRect و getComputedStyle) 
        // لأنها بتعمل دروب فريم، واستبدلناها بـ 50% عشان CSS يتكفل بالموضوع
        hitEffect.style.left='50%'; 
        hitEffect.style.top=tapY+'px';
        
        laneEl.appendChild(hitEffect);
        setTimeout(()=>hitEffect.remove(),300);
        
        // 3. إخفاء النوتة فوراً، وتأخير الحذف من الـ DOM لمنع التقطيع
        targetTile.element.style.display='none';
        setTimeout(()=>targetTile.element.remove(), 100);
        
        reflexTilesData=reflexTilesData.filter(t=>t.id!==targetTile.id);
        reflexScore++;
        reflexSpeed+=0.012;
        document.getElementById('reflex-score-val').innerText=reflexScore;
        document.getElementById('reflex-speed-val').innerText='x'+(reflexSpeed/4.5).toFixed(1)
    }else{
        reflexLives--;
        updateLivesUI();
        currentNoteIndex=0;
        board.classList.add('reflex-board-shake');
        setTimeout(()=>board.classList.remove('reflex-board-shake'),400);
        if(navigator.vibrate) setTimeout(() => navigator.vibrate(50), 0);
        if(reflexLives<=0)endReflexGame(!1);
    }
};




function endReflexGame(userQuit){isReflexActive=!1;cancelAnimationFrame(reflexGameLoopId);setTimeout(()=>{document.getElementById('reflex-game-modal').style.display='none';let earnedXP=Math.floor(reflexScore/2);if(earnedXP>150)earnedXP=150;if(earnedXP>0){showToast(`${translations[currentLang].game_over} +${earnedXP} XP`);addXP(earnedXP,'game','RGA_SECURE_998877','reflex');updateStat('reflex_score',reflexScore,!0)}},userQuit?0:800)}


window.closeReflexGame=function(){if(isReflexActive){if(confirm(translations[currentLang].exit_confirm))endReflexGame(!0);}else document.getElementById('reflex-game-modal').style.display='none'}





// الكود الأصلي في دالة recalculateStatsAndRefreshUI
function recalculateStatsAndRefreshUI() {
    // 1. حساب الإحصائيات الجديدة بناءً على السجلات المتبقية
    const workouts = JSON.parse(localStorage.getItem('userWorkouts') || '[]');
    let maxWeight = 0;
    let totalWorkouts = workouts.length;

    workouts.forEach(w => {
        w.details.forEach(ex => {
            let wgt = parseFloat(ex.weight) || 0;
            if (wgt > maxWeight) maxWeight = wgt;
        });
    });

    // 2. تحديث بيانات المستخدم في الذاكرة المحلية أولاً
    let savedData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    savedData.stats = savedData.stats || {};
    savedData.stats.maxWeight = maxWeight;
    savedData.stats.workouts = totalWorkouts;
    localStorage.setItem('currentUser', JSON.stringify(savedData));

    // 3. تحديث واجهة المستخدم (Charts and Maps)
    if (typeof renderWorkoutLog === 'function') renderWorkoutLog();
    if (typeof initWorkoutChart === 'function') initWorkoutChart();
    if (typeof initRadarChart === 'function') initRadarChart();
    if (typeof initTSBChart === 'function') initTSBChart();
    if (typeof initMuscleRecoveryMap === 'function') initMuscleRecoveryMap();



    const user = auth.currentUser;
    if (user) {


        db.collection('users').doc(user.uid).update({
            workouts: workouts, 

            'stats.maxWeight': maxWeight,
            'stats.workouts': totalWorkouts,
        }).then(() => {

 if (typeof checkBadges === 'function') {
                checkBadges(savedData, user); 
            }
        }).catch(error => {
            console.error("Error updating stats after deletion:", error);
            showToast(translations[currentLang].error_loading || "Error occurred!");
        });
    }
}


window.deleteSingleWorkout = async function(index) {
    const t = translations[currentLang || 'ar'];
    if (!confirm(t.delete_confirm_single)) return;

    try {
        let workoutHistory = JSON.parse(localStorage.getItem('userWorkouts') || '[]');
        if (index >= 0 && index < workoutHistory.length) {
            workoutHistory.splice(index, 1);
            localStorage.setItem('userWorkouts', JSON.stringify(workoutHistory));
            recalculateStatsAndRefreshUI();
            showToast(t.delete_success_single);
        } else {
            showToast("Error finding workout.");
        }
    } catch (error) {
        console.error("Error deleting single workout:", error);
        showToast(translations[currentLang].error_loading || "Error occurred!");
    }
};

/**
 * Deletes all workout entries from local storage and database.
 */
window.deleteAllWorkouts = async function() {
    const t = translations[currentLang || 'ar'];
    if (!confirm(t.delete_confirm_all)) return;

    try {
        localStorage.setItem('userWorkouts', '[]');
        recalculateStatsAndRefreshUI();
        showToast(t.delete_success_all);

        // قم بتحديث Firebase أيضًا
        const user = auth.currentUser;
        if (user) {
            await db.collection('users').doc(user.uid).update({ workouts: [] });
        }
    } catch (error) {
        console.error("Error deleting all workouts:", error);
        showToast(translations[currentLang].error_loading || "Error occurred!");
    }
};

window.buyWithLemonSqueezy = async function(variantId, coinsAmount) {
    const btn = event.target.closest('button');
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

    try {
        const createCheckoutCall = firebase.functions().httpsCallable('createLemonCheckout');
        
        // 👈 نمرر المتغيرات على شكل نصوص زي ما بيطلب السيرفر
        const result = await createCheckoutCall({ 
            variantId: String(variantId), 
            coinsAmount: String(coinsAmount) 
        });

        if (result.data && result.data.checkoutUrl) {
            // نجاح! فتح صفحة الدفع الخاصة بليمون سكويزي
            window.location.href = result.data.checkoutUrl;
        } else {
            alert("❌ السيرفر رد بنجاح ولكن لم يتم العثور على رابط الدفع!");
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    } catch (error) {
        // 🚨 هاي الرسالة رح تظهر على شاشتك إذا ليمون سكويزي رفض الطلب، صوّرها لو طلعت!
        alert("❌ رسالة خطأ من السيرفر:\n\n" + error.message);
        
        console.error("Checkout Error:", error);
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
};

window.claimThroneReward = async function(notifId) {
    showToast(currentLang === 'en' ? "👑 +1000 XP! You are the King!" : "👑 +1000 XP! عاش يا ملك الخريطة!");
    dismissNotif(notifId);
    
    // جلب البيانات المحدثة فعلياً من السيرفر وعرضها فوراً أمام اللاعب
    if (auth.currentUser) {
        try {
            const doc = await db.collection('users').doc(auth.currentUser.uid).get();
            if (doc.exists) {
                let data = doc.data();
                localStorage.setItem('currentUser', JSON.stringify(data));
                if (typeof renderUI === "function") renderUI(data);
            }
        } catch(e) {
            console.error("Error refreshing XP: ", e);
        }
    }
};


window.buyCrate = async function(crateId, price) {
    const user = auth.currentUser;
    if(!user) return;
    let data = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    if ((data.ironCoins || 0) < price) {
        showToast(currentLang === 'en' ? "Not enough Iron Coins!" : "لا تملك عملات حديدية كافية!");
        return;
    }

    if (!confirm(currentLang === 'en' ? `Buy Crate for ${price} Coins?` : `شراء الصندوق بـ ${price} عملة؟`)) return;

    const btn = event.target.closest('button');
    const origHtml = btn ? btn.innerHTML : '';
    if(btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>'; }

    try {
        const secureBuyCall = firebase.functions().httpsCallable('secureBuyItem');
        const result = await secureBuyCall({
            itemType: 'crate',
            itemId: crateId,
            price: price,
            itemVal: '',
            currency: 'ironCoins'
        });

        if (result.data && result.data.success) {
            data.ironCoins -= price;
            if(!data.crates) data.crates = {};
            data.crates[crateId] = (data.crates[crateId] || 0) + 1;
            localStorage.setItem('currentUser', JSON.stringify(data));
            
            showToast(currentLang === 'en' ? "Crate Purchased!" : "تم شراء الصندوق!");
            openStore();
        }
    } catch(e) {
        console.error(e);
        showToast("Error purchasing crate");
        if(btn) { btn.disabled = false; btn.innerHTML = origHtml; }
    }
};

window.initiateCrateOpen = async function(crateId) {
    const user = auth.currentUser;
    if(!user) return;
    
    let data = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!data.crates || !data.crates[crateId] || data.crates[crateId] <= 0) return;

    // خصم الصندوق من الداتا بيس فوراً لمنع التكرار (Glitches)
    try {
        await db.collection('users').doc(user.uid).update({
            [`crates.${crateId}`]: firebase.firestore.FieldValue.increment(-1)
        });
        data.crates[crateId] -= 1;
        localStorage.setItem('currentUser', JSON.stringify(data));
        openStore(); // تحديث الأرقام بالمتجر
        
        // تشغيل نظام السحب والأنيميشن
        executeGachaRoll(crateId, data);
        
    } catch(e) {
        console.error(e);
        showToast("Error opening crate!");
    }
};


function executeGachaRoll(crateId, userData) {
    const crate = cratesDB[crateId];
    const isEn = currentLang === 'en';
    
    // 1. رمي عجلة الحظ لتحديد ندرة السحبة
    const rand = Math.random() * 100;
    let rarity = 'common';
    let rColor = '#ffffff';
    let rLabel = isEn ? 'COMMON' : 'شائع';
    
    if (rand < crate.rates.mythic) { rarity = 'mythic'; rColor = '#ff0000'; rLabel = isEn ? 'MYTHIC' : 'خرافي'; }
    else if (rand < crate.rates.mythic + crate.rates.epic) { rarity = 'epic'; rColor = '#9b59b6'; rLabel = isEn ? 'EPIC' : 'أسطوري'; }
    else if (rand < crate.rates.mythic + crate.rates.epic + crate.rates.rare) { rarity = 'rare'; rColor = '#3498db'; rLabel = isEn ? 'RARE' : 'نادر'; }

    // 2. اختيار نوع الجائزة (مثلاً غلاف، لقب، عملات...)
    const rewardTypes =['covers', 'titles', 'borders', 'themes', 'ironCoins', 'xp'];
    let chosenType = rewardTypes[Math.floor(Math.random() * rewardTypes.length)];
    
    let rewardObj = null;
    let isDuplicate = false;
    let duplicateCompensation = 0;
    let visualHTML = '';
    let rewardName = '';

    // تجميع كل العناصر المتاحة حسب النوع المختار
    let rawPool =[];
    if (chosenType === 'covers') rawPool = [...profileCovers, ...crateExclusives.covers];
    else if (chosenType === 'titles') rawPool = [...storeItemsDB.titles, ...crateExclusives.titles];
    else if (chosenType === 'borders') rawPool =[...storeItemsDB.borders, ...crateExclusives.borders];
    else if (chosenType === 'themes') rawPool =[...storeItemsDB.themes, ...(crateExclusives.themes || [])];

    let filteredPool =[];
    
    if (rawPool.length > 0) {
        // 🔥 السحر هنا: فلترة العناصر بناءً على سعرها وعملتها لتطابق الندرة اللي طلعت بالحظ 🔥
        filteredPool = rawPool.filter(item => {
            let itemRarity = 'common';
            
            if (item.tier) { // إذا كان اللقب/العنصر له تصنيف جاهز
                if (item.tier.includes('mythic')) itemRarity = 'mythic';
                else if (item.tier.includes('legendary')) itemRarity = 'epic'; // ليجندري بنعتبره ايبك بالصناديق حالياً
                else if (item.tier.includes('epic')) itemRarity = 'epic';
                else if (item.tier.includes('rare')) itemRarity = 'rare';
            } 
            else if (item.currency === 'ironCoins') { // تصنيف حسب العملات الحديدية
                if (item.price >= 300) itemRarity = 'mythic';
                else if (item.price >= 150) itemRarity = 'epic';
                else if (item.price >= 50) itemRarity = 'rare';
            } 
            else if (item.currency === 'xp') { // تصنيف حسب نقاط الـ XP
                if (item.price >= 20000) itemRarity = 'mythic';
                else if (item.price >= 10000) itemRarity = 'epic';
                else if (item.price >= 3000) itemRarity = 'rare';
            }
            // الأشياء الحصرية للصناديق اللي ما إلها سعر (نعطيها قيمة عالية تلقائياً)
            else if (!item.currency) {
                 if (item.val && item.val.includes('mythic')) itemRarity = 'mythic';
                 else itemRarity = 'epic';
            }

            return itemRarity === rarity;
        });

        // إذا ما لقينا ولا عنصر بالندرة المطلوبة (مثلاً ما في أغلفة رخيصة)، بنعطيه عملات بدل ما يخرب الكود
        if (filteredPool.length === 0) {
            chosenType = Math.random() > 0.5 ? 'xp' : 'ironCoins';
        }
    }
    
    // تكملة الكود اللي كان ناقص
    if (chosenType !== 'xp' && chosenType !== 'ironCoins') {
        const randomItem = filteredPool[Math.floor(Math.random() * filteredPool.length)];
        rewardName = isEn ? (randomItem.name_en || randomItem.val_en) : (randomItem.name_ar || randomItem.val);
        
        const ownedItems = userData.purchasedItems || [];
        const ownedCovers = userData.purchasedCovers || [];

        if ((chosenType === 'covers' && ownedCovers.includes(randomItem.id)) || 
            (chosenType !== 'covers' && ownedItems.includes(randomItem.id))) {
            isDuplicate = true;
            // حساب التعويض حسب الندرة
            if(rarity === 'common') duplicateCompensation = Math.floor(Math.random() * 2) + 1; // 1-2
            else if(rarity === 'rare') duplicateCompensation = Math.floor(Math.random() * 3) + 3; // 3-5
            else if(rarity === 'epic') duplicateCompensation = Math.floor(Math.random() * 3) + 6; // 6-8
            else duplicateCompensation = Math.floor(Math.random() * 2) + 9; // 9-10
        } else {
            // غرض جديد، بنجهزه للحفظ
            rewardObj = { type: chosenType, id: randomItem.id, val: (randomItem.val || randomItem.url) };
        }

        // تحضير الشكل البصري للجائزة
        if(chosenType === 'covers') visualHTML = `<img src="${randomItem.url}" style="width: 150px; border-radius: 10px; border: 2px solid ${rColor}; box-shadow: 0 0 20px ${rColor};">`;
        else if(chosenType === 'titles') visualHTML = `<div style="display: flex; justify-content: center; padding: 15px 0;"><div class="title-badge ${randomItem.tier || 'tier-common'}" style="width: auto; min-width: 60%; max-width: 90%; padding: 12px 20px; font-size: 0.95rem; transform: scale(1.1);"><i class="${randomItem.icon}"></i> <span>${rewardName}</span></div></div>`;
        else if(chosenType === 'borders') visualHTML = `<div style="margin: 20px 0 35px 0;"><div class="avatar-pro-wrapper ${randomItem.val}"><div class="profile-avatar-img" style="background-image: url('${userData.photoURL || '/Photos/adm.png'}');"></div></div></div>`;
        else if (chosenType === 'themes') visualHTML = `<div style="font-size: 3rem; color: ${randomItem.color}; margin-bottom: 10px; text-shadow: 0 0 15px ${randomItem.color};"><i class="${randomItem.icon}"></i></div>`;

    } else {
        // إذا كانت الجائزة عملات أو XP
        let amount = 0;
        if(chosenType === 'ironCoins') {
            amount = rarity === 'mythic' ? 50 : rarity === 'epic' ? 20 : rarity === 'rare' ? 10 : 5;
            rewardName = isEn ? `${amount} Iron Coins` : `${amount} عملة حديدية`;
            visualHTML = `<i class="fa-solid fa-coins" style="font-size: 5rem; color: #FFD700; filter: drop-shadow(0 0 20px #FFD700);"></i>`;
            rewardObj = { type: 'ironCoins', amount: amount };
        } else { // الافتراضي هو XP
            amount = rarity === 'mythic' ? 1000 : rarity === 'epic' ? 500 : rarity === 'rare' ? 250 : 100;
            rewardName = `${amount} XP`;
            visualHTML = `<i class="fa-solid fa-gem" style="font-size: 5rem; color: #00f2a7; filter: drop-shadow(0 0 20px #00f2a7);"></i>`;
            rewardObj = { type: 'xp', amount: amount };
        }
    }

    // استدعاء الأنيميشن وتمرير كل البيانات
    playCrateAnimation(crate, rarity, rColor, rLabel, rewardName, visualHTML, isDuplicate, duplicateCompensation, rewardObj);
}


function playCrateAnimation(crate, rarity, rColor, rLabel, rewardName, visualHTML, isDuplicate, dupComp, rewardObj) {
    const modal = document.getElementById('crate-unboxing-modal');
    const icon = document.getElementById('crate-icon');
    const glow = document.getElementById('crate-glow');
    const card = document.getElementById('crate-reward-card');
    
    // ريسيت للواجهة
    icon.style.display = 'block';
    icon.className = crate.icon;
    icon.style.color = crate.color;
    icon.style.animation = 'none';
    glow.style.animation = 'none';
    card.style.display = 'none';
    document.getElementById('crate-unboxing-title').innerText = currentLang === 'en' ? 'Unboxing...' : 'جاري الفتح...';
    
    modal.style.display = 'flex';
    
    if(navigator.vibrate) navigator.vibrate([100, 100, 100, 100, 400]);

    // 1. الاهتزاز
    setTimeout(() => {
        icon.style.animation = 'crateShake 2s ease-in-out forwards';
    }, 100);

    // 2. الانفجار والظهور
    setTimeout(() => {
        icon.style.display = 'none';
        
        glow.style.background = `radial-gradient(circle, ${rColor} 0%, transparent 70%)`;
        glow.style.boxShadow = `0 0 100px 50px ${rColor}`;
        glow.style.animation = 'rarityBurst 1s ease-out forwards';
        
        if(navigator.vibrate) navigator.vibrate(1000);

        // عرض البطاقة
        setTimeout(() => {
            document.getElementById('crate-unboxing-title').innerText = currentLang === 'en' ? 'REWARD UNLOCKED!' : 'تم كشف الجائزة!';

const continueBtn = document.querySelector('#crate-reward-card .btn-primary');
if(continueBtn) continueBtn.innerText = currentLang === 'en' ? 'Continue' : 'أكمل';

            document.getElementById('reward-rarity-label').innerText = rLabel;
            document.getElementById('reward-rarity-label').style.color = rColor;
            document.getElementById('reward-visual').innerHTML = visualHTML;
            document.getElementById('reward-name').innerText = rewardName;
            
            const dupMsg = document.getElementById('reward-duplicate-msg');
            if (isDuplicate) {
                dupMsg.style.display = 'block';
                dupMsg.innerText = currentLang === 'en' ? `Duplicate! Converted to +${dupComp} Iron Coins` : `مكرر! تم تحويله إلى +${dupComp} عملة حديدية`;
            } else {
                dupMsg.style.display = 'none';
            }
            
            card.style.display = 'block';
            card.style.borderColor = rColor;
            card.style.boxShadow = `0 20px 50px rgba(0,0,0,0.8), 0 0 30px ${rColor}44`;

            // حفظ الجائزة في الداتابيس
            saveCrateReward(rewardObj, isDuplicate, dupComp);

        }, 300);

    }, 2000);
}

function closeCrateUnboxing() {
    document.getElementById('crate-unboxing-modal').style.display = 'none';
    // تحديث الواجهة إذا كان فاتح المتجر
    if (document.getElementById('store-content-area')) {
        renderStoreItems();
    }
}

async function saveCrateReward(rewardObj, isDuplicate, dupComp) {
    const user = auth.currentUser;
    if(!user) return;
    
    let data = JSON.parse(localStorage.getItem('currentUser') || '{}');

    // 1. تحديث الواجهة والذاكرة المحلية فوراً لكي لا يشعر اللاعب بأي تأخير
    if (isDuplicate) {
        data.ironCoins = (data.ironCoins || 0) + dupComp;
    } 
    else if (rewardObj) {
        if (rewardObj.type === 'xp') {
            data.xp = (data.xp || 0) + rewardObj.amount;
            data.rank = Math.floor(data.xp / 500) + 1;
        } else if (rewardObj.type === 'ironCoins') {
            data.ironCoins = (data.ironCoins || 0) + rewardObj.amount;
        } else if (rewardObj.type === 'covers') {
            if(!data.purchasedCovers) data.purchasedCovers =[];
            data.purchasedCovers.push(rewardObj.id);
        } else {
            if(!data.purchasedItems) data.purchasedItems =[];
            data.purchasedItems.push(rewardObj.id);
        }
    }

    localStorage.setItem('currentUser', JSON.stringify(data));

    // تحديث عدادات الواجهة
    const xpDisplay = document.querySelector('.xp-display span');
    const coinsDisplay = document.querySelector('.coins-display span');
    if(xpDisplay) xpDisplay.innerHTML = `${((data.xp || 0) - (data.spentXp || 0)).toLocaleString()} XP`;
    if(coinsDisplay) coinsDisplay.innerHTML = `${(data.ironCoins || 0).toLocaleString()}`;
    if(typeof renderUI === "function") renderUI(data); 
    

    try {
        const secureGrant = firebase.functions().httpsCallable('secureGrantCrateReward');
        await secureGrant({ rewardObj, isDuplicate, dupComp });
    } catch (e) {
        console.error("Error saving crate reward to DB:", e);
        showToast(currentLang === 'en' ? "Error saving reward!" : "حدث خطأ في حفظ الجائزة في السيرفر!");
    }
}



window.showCrateInfo = function(crateId) {
    const crate = cratesDB[crateId];
    const isEn = currentLang === 'en';
    const cName = isEn ? crate.name_en : crate.name_ar;
    
    const infoModal = document.createElement('div');
    infoModal.className = 'modal-overlay active';
    infoModal.style.zIndex = '999999';
    infoModal.innerHTML = `
        <div class="modal-content glass-card" style="max-width: 400px; padding: 25px; border: 1px solid ${crate.color}; position: relative;">
            <button onclick="this.parentElement.parentElement.remove()" style="position: absolute; top: 15px; right: 15px; background: transparent; border: none; color: var(--slate); font-size: 1.5rem; cursor: pointer;">&times;</button>
            <h2 style="color: ${crate.color}; text-align: center; margin-bottom: 15px; font-weight: 900;">
                <i class="${crate.icon}"></i> ${cName}
            </h2>
            <p style="color: white; text-align: center; font-size: 0.9rem; margin-bottom: 20px;">
                ${isEn ? 'This crate may contain exclusive Covers, Titles, Auras, Themes, Iron Coins, or XP.' : 'هذا الصندوق قد يحتوي على أغلفة، ألقاب، هالات، أو ثيمات حصرية، بالإضافة للعملات و XP.'}
            </p>
            <div style="background: rgba(0,0,0,0.5); padding: 15px; border-radius: 12px; margin-bottom: 20px;">
                <h4 style="color: var(--slate); text-align: center; margin-bottom: 10px;">${isEn ? 'Drop Rates:' : 'نسب الحظ (Drop Rates):'}</h4>
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px; color: white;"><span>${isEn ? 'Common' : 'شائع'} (Common)</span> <span style="color: white;">${crate.rates.common}%</span></div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px; color: #3498db;"><span>${isEn ? 'Rare' : 'نادر'} (Rare)</span> <span>${crate.rates.rare}%</span></div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 5px; color: #9b59b6;"><span>${isEn ? 'Epic' : 'أسطوري'} (Epic)</span> <span>${crate.rates.epic}%</span></div>
                <div style="display: flex; justify-content: space-between; font-weight: 900; color: #ff0000;"><span>${isEn ? 'Mythic' : 'خرافي'} (Mythic)</span> <span>${crate.rates.mythic}%</span></div>
            </div>
            <button class="btn-primary" onclick="this.parentElement.parentElement.remove()" style="width: 100%; border-color: ${crate.color}; color: ${crate.color}; background: rgba(255,255,255,0.05);">
                ${isEn ? 'Got it!' : 'علم!'}
            </button>
        </div>
    `;
    document.body.appendChild(infoModal);
};



let currentInvTab = 'covers';

window.openInventory = function() {
    // 🔥 الحل النووي: تصفير السكرول لكل أبعاد الشاشة المتوقعة فوراً 🔥
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    
    const mainContent = document.getElementById('main-content-area');
    if(!mainContent) return;
    
    // تصفير سكرول الحاوية الداخلية (الكونتينر)
    mainContent.scrollTop = 0;
    const parentMain = document.querySelector('.main-content');
    if(parentMain) parentMain.scrollTop = 0;
    
    const isEn = currentLang === 'en';
    
    const tabsHTML = `
        <div class="store-tabs-container">
            <button class="store-tab-btn ${currentInvTab === 'covers' ? 'active' : ''}" onclick="switchInvTab('covers')"><i class="fa-solid fa-image"></i> ${isEn ? 'Covers' : 'الأغلفة'}</button>
            <button class="store-tab-btn ${currentInvTab === 'borders' ? 'active' : ''}" onclick="switchInvTab('borders')"><i class="fa-solid fa-circle-notch"></i> ${isEn ? 'Auras' : 'الهالات'}</button>
            <button class="store-tab-btn ${currentInvTab === 'titles' ? 'active' : ''}" onclick="switchInvTab('titles')"><i class="fa-solid fa-tag"></i> ${isEn ? 'Titles' : 'الألقاب'}</button>
            <button class="store-tab-btn ${currentInvTab === 'themes' ? 'active' : ''}" onclick="switchInvTab('themes')"><i class="fa-solid fa-palette"></i> ${isEn ? 'Themes' : 'الثيمات'}</button>
        </div>
    `;

    mainContent.innerHTML = `
        <header class="top-bar" style="margin-bottom: 20px;">
            <div class="header-row">
                <button onclick="openProfile()" class="btn-primary" style="padding: 5px 15px; font-size: 0.9rem;">${isEn ? 'Back' : 'رجوع'}</button>
                <h1 style="margin: 0 15px; font-weight: 900; color: #9b59b6; text-shadow: 0 0 15px rgba(155,89,182,0.4);">
                    <i class="fa-solid fa-box-open"></i> ${isEn ? 'My Inventory' : 'خزنة الغنائم'}
                </h1>
            </div>
        </header>
        ${tabsHTML}
        <section class="performance-container" style="animation: fadeIn 0.3s;" id="inventory-content-area">
        </section>
    `;
    
    renderInventoryItems();


    setTimeout(() => {
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
        if(mainContent) mainContent.scrollTop = 0;
        if(parentMain) parentMain.scrollTop = 0;
    }, 50);
};

window.switchInvTab = function(tab) {
    currentInvTab = tab;


    document.querySelectorAll('.store-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });


    const activeBtn = document.querySelector(`.store-tab-btn[onclick="switchInvTab('${tab}')"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }


    if (typeof renderInventoryItems === 'function') {
        renderInventoryItems();
    }
    

    setTimeout(() => {
        window.scrollTo(0, 0);
        const mainContent = document.getElementById('main-content-area');
        if(mainContent) mainContent.scrollTop = 0;
    }, 50);
};


window.renderInventoryItems = function() {
    const container = document.getElementById('inventory-content-area');
    const data = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const isEn = currentLang === 'en';
    
    const ownedItems = data.purchasedItems || [];
    const ownedCovers = data.purchasedCovers ||[];
    const shopAvatarUrl = data.photoURL || '/Photos/adm.png';

    let html = '<div class="store-grid">';
    let itemsFound = 0;

    // دمج قوائم المتجر العادية مع الحصرية للصناديق
    const allCovers = [...profileCovers, ...crateExclusives.covers];
    const allTitles =[...storeItemsDB.titles, ...crateExclusives.titles];
    const allBorders =[...storeItemsDB.borders, ...crateExclusives.borders];
    const allThemes =[...storeItemsDB.themes, ...(crateExclusives.themes || [])];

    if (currentInvTab === 'covers') {
        allCovers.forEach(item => {
            if(ownedCovers.includes(item.id)) {
                itemsFound++;
                const isEquipped = data.currentCover === item.url;
                const name = isEn ? (item.name_en || item.val_en) : (item.name_ar || item.val);
                const preview = `<div class="cover-img-wrapper"><img src="${item.url}"></div><h4 style="color:white; margin:10px 0; font-size:0.9rem;">${name}</h4>`;
                const btnHTML = isEquipped 
                    ? `<button class="store-button-dashed equipped" disabled>${isEn ? 'Equipped' : 'مُستخدم'}</button>`
                    : `<button class="store-button-dashed" onclick="equipInvItem('cover', '${item.url}')">${isEn ? 'Equip' : 'استخدام'}</button>`;
                html += `<div class="store-item-card ${isEquipped ? 'equipped-glow' : ''}"><div class="store-item-content">${preview}${btnHTML}</div></div>`;
            }
        });
    } 
    else if (currentInvTab === 'borders') {
        allBorders.forEach(item => {
            if(ownedItems.includes(item.id)) {
                itemsFound++;
                const isEquipped = data.currentBorder === item.val;
                const name = isEn ? (item.name_en || item.val_en) : (item.name_ar || item.val);
                const preview = `<div style="height: 100px; display: flex; align-items: center; justify-content: center; margin-bottom: 15px; overflow: visible;"><div class="avatar-pro-wrapper ${item.val}" style="transform: scale(0.65);"><div class="profile-avatar-img" style="background-image: url('${shopAvatarUrl}');"></div></div></div><p style="color:white; font-weight:bold; margin: 0 0 15px 0;">${name}</p>`;
                const btnHTML = isEquipped 
                    ? `<button class="store-button-dashed equipped" disabled>${isEn ? 'Equipped' : 'مُستخدم'}</button>`
                    : `<button class="store-button-dashed" onclick="equipInvItem('border', '${item.val}')">${isEn ? 'Equip' : 'استخدام'}</button>`;
                html += `<div class="store-item-card ${isEquipped ? 'equipped-glow' : ''}"><div class="store-item-content">${preview}${btnHTML}</div></div>`;
            }
        });
    }
    else if (currentInvTab === 'titles') {
        allTitles.forEach(item => {
            if(ownedItems.includes(item.id)) {
                itemsFound++;
                const isEquipped = data.currentTitle === (item.val || item.val_en);
                const name = isEn ? (item.name_en || item.val_en) : (item.name_ar || item.val);
                const badgeContent = isEn ? `<i class="${item.icon}"></i> <span>${name}</span>` : `<span>${name}</span> <i class="${item.icon}"></i>`;
                const preview = `<div style="height: 80px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px;"><div class="title-badge ${item.tier}">${badgeContent}</div></div>`;
                const btnHTML = isEquipped 
                    ? `<button class="store-button-dashed equipped" disabled>${isEn ? 'Equipped' : 'مُستخدم'}</button>`
                    : `<button class="store-button-dashed" onclick="equipInvItem('title', '${item.val || item.val_en}')">${isEn ? 'Equip' : 'استخدام'}</button>`;
                html += `<div class="store-item-card ${isEquipped ? 'equipped-glow' : ''}"><div class="store-item-content">${preview}${btnHTML}</div></div>`;
            }
        });
    }
    else if (currentInvTab === 'themes') {
        // الثيم الافتراضي دائماً موجود
        itemsFound++;
        const defaultEquipped = (!data.currentTheme || data.currentTheme === 'default');
        html += `
            <div class="store-item-card ${defaultEquipped ? 'equipped-glow' : ''}">
                <div class="store-item-content">
                    <div style="font-size: 2.5rem; color: #00f2a7; margin-bottom: 10px;"><i class="fa-solid fa-bolt"></i></div>
                    <h4 style="color: white; margin-bottom: 10px;">${isEn ? 'Neon Tech (Default)' : 'النيون (الافتراضي)'}</h4>
                    <button class="store-button-dashed ${defaultEquipped ? 'equipped' : ''}" ${defaultEquipped ? 'disabled' : `onclick="equipInvItem('theme', 'default')"`}>
                        ${defaultEquipped ? (isEn?'Equipped':'مُستخدم') : (isEn?'Equip':'استخدام')}
                    </button>
                </div>
            </div>
        `;
        allThemes.forEach(item => {
            if(ownedItems.includes(item.id)) {
                itemsFound++;
                const isEquipped = data.currentTheme === item.val;
                const name = isEn ? (item.name_en || item.val_en) : (item.name_ar || item.val);
                const preview = `<div style="font-size: 2.5rem; color: ${item.color}; margin-bottom: 10px; text-shadow: 0 0 15px ${item.color};"><i class="${item.icon}"></i></div><h4 style="color: white; margin-bottom: 10px;">${name}</h4>`;
                const btnHTML = isEquipped 
                    ? `<button class="store-button-dashed equipped" disabled>${isEn ? 'Equipped' : 'مُستخدم'}</button>`
                    : `<button class="store-button-dashed" onclick="equipInvItem('theme', '${item.val}')">${isEn ? 'Equip' : 'استخدام'}</button>`;
                html += `<div class="store-item-card ${isEquipped ? 'equipped-glow' : ''}"><div class="store-item-content">${preview}${btnHTML}</div></div>`;
            }
        });
    }

    if (itemsFound === 0) {
        html += `<div style="grid-column: 1 / -1; text-align: center; padding: 50px 20px; color: var(--slate); font-weight: bold;">
            <i class="fa-solid fa-ghost fa-3x" style="margin-bottom: 15px; opacity: 0.5;"></i>
            <p>${isEn ? 'You do not own any items in this category yet. Go open some crates!' : 'لا تملك أي غنائم في هذا القسم بعد. اذهب وافتح بعض الصناديق!'}</p>
        </div>`;
    }

    html += '</div>';
    container.innerHTML = html;
};


window.equipInvItem = async function(type, val) {

    await equipStoreItem(type, val, true);
};


// ==========================================
// 🚀 نظام التوظيف (Job Application System)
// ==========================================

// فتح وإغلاق النافذة
window.openJobModal = function() {
    const modal = document.getElementById('job-modal');
    if(modal) modal.classList.add('active');
};
window.closeJobModal = function() {
    const modal = document.getElementById('job-modal');
    if(modal) modal.classList.remove('active');
};

// إظهار حقل الراتب المخفي
window.handleSalaryChange = function() {
    const salaryType = document.getElementById('job-salary').value;
    const amountGroup = document.getElementById('salary-amount-group');
    if (salaryType === 'fixed') {
        amountGroup.classList.remove('hidden');
        document.getElementById('job-salary-amount').required = true;
    } else {
        amountGroup.classList.add('hidden');
        document.getElementById('job-salary-amount').required = false;
    }
};

// الأسئلة الديناميكية بناءً على الوظيفة
window.handleJobRoleChange = function() {
    const role = document.getElementById('job-role').value;
    const container = document.getElementById('dynamic-job-fields');
    const isEn = (typeof currentLang !== 'undefined' ? currentLang : 'ar') === 'en';
    
    container.style.display = 'flex';
    let html = '';

    if (role === 'support') {
        html = `
            <input type="text" id="dyn-q1" class="input-field" placeholder="${isEn ? 'What is your English level? (1-10)' : 'تقييمك للغتك الإنجليزية (من 10)؟'}" required>
            <input type="text" id="dyn-q2" class="input-field" placeholder="${isEn ? 'Do you own a personal laptop?' : 'هل تمتلك لابتوب شخصي للعمل؟'}" required>
            <textarea id="dyn-q3" class="input-field" rows="2" placeholder="${isEn ? 'How do you handle an angry player?' : 'كيف تتعامل مع لاعب غاضب تم رفض إنجازه؟'}" required style="resize:none;"></textarea>
        `;
    } else if (role === 'referee') {
        html = `
            <input type="text" id="dyn-q1" class="input-field" placeholder="${isEn ? 'Years of experience in Powerlifting/Gym?' : 'كم سنة خبرتك في الحديد / الباورليفتنج؟'}" required>
            <textarea id="dyn-q2" class="input-field" rows="2" placeholder="${isEn ? 'How do you spot a fake lift?' : 'كيف تكتشف أن اللاعب يستخدم أوزان وهمية بالفيديو؟'}" required style="resize:none;"></textarea>
        `;
    } else if (role === 'creator') {
        html = `
            <input type="url" id="dyn-q1" class="input-field" placeholder="${isEn ? 'Link to your portfolio / previous work' : 'رابط أعمالك السابقة / بورتفوليو'}" required>
            <input type="text" id="dyn-q2" class="input-field" placeholder="${isEn ? 'What software do you use?' : 'ما هي البرامج التي تحترفها؟ (مثل بريمير، فوتوشوب)'}" required>
        `;
    } else if (role === 'coordinator') {
        html = `
            <input type="text" id="dyn-q1" class="input-field" placeholder="${isEn ? 'Which city do you live in?' : 'في أي مدينة تقيم حالياً؟'}" required>
            <textarea id="dyn-q2" class="input-field" rows="2" placeholder="${isEn ? 'How to convince a gym owner to partner with us?' : 'كيف تقنع صاحب نادي بالتعاون مع منصة RGA؟'}" required style="resize:none;"></textarea>
        `;
    }

    container.innerHTML = html;
};

// حماية الإرسال ليتم تحميله فقط إذا كان الفورم موجوداً (لمنع الأخطاء في الداشبورد)
document.addEventListener('DOMContentLoaded', () => {
    const jobForm = document.getElementById('job-application-form');
    if (jobForm) {
        jobForm.onsubmit = async function(e) {
            e.preventDefault();
            const btn = document.getElementById('submit-job-btn');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
            btn.disabled = true;

            const isEn = (typeof currentLang !== 'undefined' ? currentLang : 'ar') === 'en';

// تجميع البيانات
    const applicationData = {
        name: document.getElementById('job-name').value.trim(),
        email: document.getElementById('job-email').value.trim(),
        phone: document.getElementById('job-phone').value.trim(),
        gender: document.getElementById('job-gender').value, // <--- السطر الجديد
        role: document.getElementById('job-role').value,
        salaryExpectation: document.getElementById('job-salary').value,
        salaryAmount: document.getElementById('job-salary-amount').value || 'N/A',
        dynamicAnswers: {
            q1: document.getElementById('dyn-q1') ? document.getElementById('dyn-q1').value.trim() : '',
            q2: document.getElementById('dyn-q2') ? document.getElementById('dyn-q2').value.trim() : '',
            q3: document.getElementById('dyn-q3') ? document.getElementById('dyn-q3').value.trim() : ''
        },
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        status: 'new' 
    };


            try {
                await db.collection('job_applications').add(applicationData);
                showToast(isEn ? "Application submitted successfully! 🚀" : "تم إرسال طلبك بنجاح");
                jobForm.reset();
                document.getElementById('dynamic-job-fields').style.display = 'none';
                document.getElementById('salary-amount-group').classList.add('hidden');
                closeJobModal();
            } catch (error) {
                console.error("Error submitting job application:", error);
                showToast(isEn ? "Error submitting! Check connection." : "حدث خطأ في الإرسال! تأكد من اتصالك بالإنترنت.");
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        };
    }
});
