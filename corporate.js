/* Bilingual, accessible public corporate landing page. The fitness-app dashboard is untouched. */
(() => {
  'use strict';
  const copy = {
    en: {
      document_title: 'Royal Gravitas Arena | Sports Technology & Partnerships',
      meta_description: 'Royal Gravitas Arena is a sports technology venture exploring the future of competitive fitness, connected experiences, and strategic partnerships.',
      skip_link: 'Skip to content', logo_home: 'Royal Gravitas Arena home',
      nav_aria: 'Main navigation', nav_open: 'Open navigation', nav_close: 'Close navigation',
      nav_company: 'Company', nav_focus: 'Our focus', nav_partnerships: 'Partnerships', header_contact: 'Get in touch',
      hero_eyebrow: 'SPORTS TECHNOLOGY · LONG-TERM VISION',
      hero_line1: 'The future of fitness', hero_line2: 'is more connected.',
      hero_desc: 'Royal Gravitas Arena is a sports technology venture exploring new ways to connect athletic performance, digital competition, and the wider fitness community.',
      hero_cta: 'Explore partnerships', hero_secondary: 'Discover RGA',
      hero_bottom: 'A considered approach to sport and technology.',
      about_kicker: 'WHO WE ARE', about_title: 'A long-term view of sport and technology.',
      about_p1: 'Royal Gravitas Arena (RGA) was created around the belief that sport can offer more than isolated workouts. We see potential in experiences that make progress meaningful and competition more accessible.',
      about_p2: 'Our direction is to explore thoughtful digital products and collaborations that could connect athletes, fitness businesses, and communities in new ways.',
      about_note_title: 'Our current priority', about_note_desc: 'Strategic development and conversations with potential partners.',
      focus_kicker: 'THE DIRECTION', focus_title: "Where we're looking ahead.", focus_intro: 'Three areas guide our thinking as we consider the possibilities ahead.',
      focus_1_title: 'Performance technology', focus_1_desc: 'Exploring tools that help athletes understand their progress and approach training with greater purpose.',
      focus_2_title: 'Digital competition', focus_2_desc: 'Considering how well-designed challenges could make fitness more engaging, measurable, and connected.',
      focus_3_title: 'Connected communities', focus_3_desc: 'Imagining better ways for people, gyms, and organizations to take part in a shared sporting culture.',
      partner_kicker: 'STRATEGIC PARTNERSHIPS', partner_overline: 'OPEN TO CONVERSATIONS',
      partner_title: 'Good partnerships start with a conversation.',
      partner_desc: "We welcome discussions with fitness businesses, sports brands, and technology organizations interested in exploring what could come next.",
      partner_action_label: 'BUSINESS & PARTNERSHIP INQUIRIES', partner_button: 'Start a conversation',
      footer_tagline: 'Sports technology. A long-term vision.', footer_contact: 'Contact', footer_rights: 'All rights reserved.',
      footer_closing: 'Built with purpose. Looking ahead.', language_label: 'Language',
      modal_close: 'Close', modal_kicker: 'STRATEGIC PARTNERSHIPS', modal_title: "Let's start a conversation.",
      modal_desc: "If you have a collaboration idea, we'd be glad to hear from you. Share a little about your organization and what you'd like to explore.",
      modal_email_label: 'OUR BUSINESS CONTACT', modal_send: 'Email the RGA team',
      modal_note: 'Please include your name, organization, and a brief outline of your proposal.'
    },
    ar: {
      document_title: 'رويال غرافيتاس أرينا | التقنية الرياضية والشراكات',
      meta_description: 'رويال غرافيتاس أرينا مشروع في مجال التقنية الرياضية يستكشف مستقبل اللياقة التنافسية والتجارب الرقمية وفرص الشراكات الاستراتيجية.',
      skip_link: 'انتقل إلى المحتوى', logo_home: 'الصفحة الرئيسية لرويال غرافيتاس أرينا',
      nav_aria: 'التنقل الرئيسي', nav_open: 'فتح القائمة', nav_close: 'إغلاق القائمة',
      nav_company: 'عن الشركة', nav_focus: 'مجالات اهتمامنا', nav_partnerships: 'الشراكات', header_contact: 'تواصل معنا',
      hero_eyebrow: 'التقنية الرياضية · رؤية طويلة المدى',
      hero_line1: 'مستقبل اللياقة البدنية', hero_line2: 'أكثر ترابطاً.',
      hero_desc: 'رويال غرافيتاس أرينا مشروع في مجال التقنية الرياضية يستكشف طرقاً جديدة للربط بين الأداء الرياضي والمنافسات الرقمية ومجتمع اللياقة البدنية.',
      hero_cta: 'استكشف فرص الشراكة', hero_secondary: 'تعرّف على RGA',
      hero_bottom: 'رؤية مدروسة تجمع الرياضة والتقنية.',
      about_kicker: 'من نحن', about_title: 'نظرة بعيدة المدى إلى الرياضة والتقنية.',
      about_p1: 'انطلقت فكرة رويال غرافيتاس أرينا (RGA) من قناعة بأن الرياضة يمكن أن تتجاوز حدود التمرين الفردي. نرى فرصاً لتجارب تمنح التقدم معنى أكبر وتجعل المنافسة أقرب للجميع.',
      about_p2: 'نتطلع إلى استكشاف منتجات رقمية وشراكات مدروسة يمكنها أن تجمع الرياضيين والمنشآت الرياضية والمجتمعات بطرق جديدة.',
      about_note_title: 'أولويتنا الحالية', about_note_desc: 'التطوير الاستراتيجي وفتح حوارات مع شركاء محتملين.',
      focus_kicker: 'توجهاتنا', focus_title: 'المجالات التي نتطلع إليها.', focus_intro: 'ثلاثة مجالات توجه رؤيتنا للفرص المستقبلية.',
      focus_1_title: 'تقنيات الأداء الرياضي', focus_1_desc: 'استكشاف أدوات تساعد الرياضيين على فهم تقدمهم والتدرب بوعي وهدف أوضح.',
      focus_2_title: 'المنافسات الرقمية', focus_2_desc: 'دراسة أفكار لتحديات مدروسة تجعل اللياقة أكثر تفاعلاً وقابلية للقياس والترابط.',
      focus_3_title: 'المجتمعات الرياضية المترابطة', focus_3_desc: 'تصوّر طرق أفضل تجمع الأفراد والأندية والمؤسسات ضمن ثقافة رياضية مشتركة.',
      partner_kicker: 'الشراكات الاستراتيجية', partner_overline: 'نرحّب بالحوار',
      partner_title: 'الشراكات الجيدة تبدأ بحوار.',
      partner_desc: 'نرحّب بالنقاش مع المنشآت الرياضية والعلامات التجارية والجهات التقنية المهتمة باستكشاف فرص تعاون مستقبلية.',
      partner_action_label: 'استفسارات الأعمال والشراكات', partner_button: 'ابدأ التواصل',
      footer_tagline: 'تقنية رياضية. رؤية طويلة المدى.', footer_contact: 'التواصل', footer_rights: 'جميع الحقوق محفوظة.',
      footer_closing: 'نعمل بهدف واضح ونتطلع إلى المستقبل.', language_label: 'اللغة',
      modal_close: 'إغلاق', modal_kicker: 'الشراكات الاستراتيجية', modal_title: 'لنبدأ الحوار.',
      modal_desc: 'إذا كانت لديك فكرة للتعاون، يسعدنا الاطلاع عليها. شاركنا نبذة عن مؤسستك والفرصة التي ترغب في مناقشتها.',
      modal_email_label: 'البريد الرسمي للأعمال', modal_send: 'راسل فريق RGA',
      modal_note: 'يرجى ذكر اسمك واسم المؤسسة ونبذة مختصرة عن مقترحك.'
    }
  };
  const getStoredLang = () => { try { return localStorage.getItem('lang') === 'ar' ? 'ar' : 'en'; } catch (_) { return 'en'; } };
  const storeLang = (lang) => { try { localStorage.setItem('lang', lang); } catch (_) {} };
  const nav = document.getElementById('site-nav');
  const toggle = document.getElementById('nav-toggle');
  const dialog = document.getElementById('partner-modal');
  const dialogClose = dialog.querySelector('.modal-close');
  let previousFocus = null;
  let languageSwitchPending = false;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function closeMenu() {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', copy[document.documentElement.lang]?.nav_open || copy.en.nav_open);
  }
  function applyLanguage(lang) {
    const valid = lang === 'ar' ? 'ar' : 'en';
    const t = copy[valid];
    document.documentElement.lang = valid;
    document.documentElement.dir = valid === 'ar' ? 'rtl' : 'ltr';
    document.title = t.document_title;
    document.querySelector('meta[name="description"]').setAttribute('content', t.meta_description);
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (Object.prototype.hasOwnProperty.call(t, key)) el.textContent = t[key];
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      const key = el.dataset.i18nAria;
      if (Object.prototype.hasOwnProperty.call(t, key)) el.setAttribute('aria-label', t[key]);
    });
    document.querySelectorAll('[data-language]').forEach(btn => {
      btn.setAttribute('aria-pressed', String(btn.dataset.language === valid));
    });
    storeLang(valid);
    closeMenu();
  }
  function switchLanguage(nextLang) {
    const valid = nextLang === 'ar' ? 'ar' : 'en';
    const root = document.documentElement;
    if (root.lang === valid || languageSwitchPending) return;
    if (prefersReducedMotion.matches) { applyLanguage(valid); return; }
    languageSwitchPending = true;
    root.classList.add(valid === 'ar' ? 'switching-to-ar' : 'switching-to-en');
    if (typeof document.startViewTransition === 'function') {
      try {
        const transition = document.startViewTransition(() => applyLanguage(valid));
        const finishSwitch = () => {
          root.classList.remove('switching-to-ar', 'switching-to-en');
          languageSwitchPending = false;
        };
        transition.finished.then(finishSwitch, finishSwitch);
      } catch (_) {
        applyLanguage(valid);
        root.classList.remove('switching-to-ar', 'switching-to-en');
        languageSwitchPending = false;
      }
      return;
    }
    root.classList.add('language-fade');
    window.setTimeout(() => {
      applyLanguage(valid);
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          root.classList.remove('language-fade', 'switching-to-ar', 'switching-to-en');
          window.setTimeout(() => { languageSwitchPending = false; }, 190);
        });
      });
    }, 180);
  }
  function openModal() {
    previousFocus = document.activeElement;
    closeMenu();
    dialog.hidden = false;
    document.body.classList.add('modal-open');
    dialogClose.focus();
  }
  function closeModal() {
    if (dialog.hidden) return;
    dialog.hidden = true;
    document.body.classList.remove('modal-open');
    if (previousFocus && typeof previousFocus.focus === 'function') previousFocus.focus();
  }
  document.querySelectorAll('[data-open-partner]').forEach(el => el.addEventListener('click', openModal));
  document.querySelectorAll('[data-close-partner]').forEach(el => el.addEventListener('click', closeModal));
  document.querySelectorAll('[data-language]').forEach(el => el.addEventListener('click', () => switchLanguage(el.dataset.language)));
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', copy[document.documentElement.lang]?.[open ? 'nav_close' : 'nav_open'] || 'Navigation');
  });
  nav.querySelectorAll('a').forEach(el => el.addEventListener('click', closeMenu));
  document.addEventListener('pointerdown', (event) => {
    if (nav.classList.contains('is-open') && !nav.contains(event.target) && !toggle.contains(event.target)) closeMenu();
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth > 690 && nav.classList.contains('is-open')) closeMenu();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { if (!dialog.hidden) closeModal(); else closeMenu(); }
    if (event.key === 'Tab' && !dialog.hidden) {
      const focusable = [...dialog.querySelectorAll('a[href],button:not([disabled])')];
      if (!focusable.length) return;
      const first = focusable[0], last = focusable[focusable.length-1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  document.getElementById('year').textContent = String(new Date().getFullYear());
  applyLanguage(getStoredLang());
  // Safe enhancement: content stays visible if the observer is unavailable.
  if ('IntersectionObserver' in window && !prefersReducedMotion.matches) {
    const targets = document.querySelectorAll('.section-heading, .section-lead, .about-layout, .focus-card, .partner-panel');
    const onEnter = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.07, rootMargin: '0px 0px -20px 0px' });
    targets.forEach(el => { el.classList.add('scroll-reveal'); onEnter.observe(el); });
    document.documentElement.classList.add('motion-ready');
  }
})();
