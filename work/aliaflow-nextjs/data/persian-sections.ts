export const persianSections: Record<string, Record<string, unknown>> = {
  header: {
    wordmark: "ALIAFLOW", logo: "/assets/aliaflow-logo.svg", logo_alt: "الیافلو", home_href: "#home", menu_label: "منو",
    links: [
      { label: "خانه", href: "#home" }, { label: "خدمات", href: "#service-catalogue" },
      { label: "راهکارها", href: "#thrivable-business" }, { label: "پروژه‌ها", href: "#portfolio" },
      { label: "دربارهٔ ما", href: "#why-us" }, { label: "تماس با ما", href: "#contact-us" },
    ],
  },
  hero: {
    eyebrow: "الیافلو", heading: "شریک قابل اعتماد شما\nدر رهبری کسب‌وکار", image: "/assets/boardroom.png",
    image_alt: "تیم رهبری در حال گفت‌وگوی راهبردی دور میز",
  },
  outcomes: {
    intro_heading: "کسب‌وکار شما\nباید...", title_eyebrow: "کسب‌وکار شما", title_prefix: "باید", title_suffix: "باشد؛ ما آن را می‌سازیم",
    detail_prefix: "نه‌فقط", detail_connector: "بلکه",
    items: [
      { label: "خواستنی", emphasis: "متمایز", copy: "برای شما کسب‌وکاری واقعاً متمایز می‌سازیم؛ کسب‌وکاری که بر نیازها و خواسته‌های تازه و در حال شکل‌گیری بازار هدف بنا شده است. نتیجه فقط برای مشتریان خواستنی نیست؛ اثر اجتماعی ماندگار ایجاد می‌کند و تغییری واقعی در کار یا زندگی آن‌ها به وجود می‌آورد.", image: "/assets/blank-panel.png", image_alt: "نمای بصری نتیجهٔ خواستنی و متمایز", stats: [{ value: "۴ حس" }, { value: "۳ چرخه" }] },
      { label: "شدنی", emphasis: "رقابت‌پذیر", copy: "مزیت رقابتی شما از پیوند توانمندی‌های سازمان با آیندهٔ فناوری‌های نوظهور شکل می‌گیرد؛ مزیتی منحصربه‌فرد که کپی‌کردن آن دشوار است. این مزیت در چند لایه و بخش سازمان جریان پیدا می‌کند و ترکیب گونه‌های مختلف نوآوری، تقلید از ساختار کسب‌وکار شما را برای رقبا دشوار می‌سازد.", image: "/assets/blank-panel-1.png", image_alt: "نمای بصری نتیجهٔ شدنی و رقابت‌پذیر", stats: [{ value: "۷ ریسک" }, { value: "۶ نقش" }, { value: "۵ بازی" }] },
      { label: "ماندنی", emphasis: "مقیاس‌پذیر", copy: "در این مرحله، مدل درآمدی پایداری طراحی می‌کنیم که رشد بلندمدت را ممکن سازد و سازمان را پیوسته به‌سوی اهدافش حرکت دهد. رشد در هر مرحله کنترل‌شده و راهبردی برنامه‌ریزی می‌شود تا هر گام، کسب‌وکار را قوی‌تر و برای نسخهٔ بعدی مدل آن آماده‌تر کند.", image: "/assets/blank-panel-2.png", image_alt: "نمای بصری نتیجهٔ ماندنی و مقیاس‌پذیر", stats: [{ value: "۸ تغییر" }, { value: "۹ آزمون" }] },
    ],
    manifesto_heading: "کسب‌وکار شکوفای\nشما", manifesto_words: "متمایز\nرقابت‌پذیر\nمقیاس‌پذیر", manifesto_shape: "/assets/subtract.svg",
  },
  "service-catalogue-nav": {
    heading: "فهرست خدمات ما", tabs: [
      { number: "۱", label: "کسب‌وکار شکوفا" }, { number: "۲", label: "رهبری کسب‌وکار" },
      { number: "۳", label: "طراحی تکنوکراتیک" }, { number: "۴", label: "مدیریت اجرا" },
    ],
  },
  "business-system-services": {
    eyebrow: "خدمات سیستم کسب‌وکار", heading: "سیستمی را طراحی کنید\nکه کسب‌وکار را پیش می‌برد",
    intro: "سه مداخلهٔ به‌هم‌پیوسته برای تبدیل راهبرد به سیستمی روشن، کاربردی و آمادهٔ رشد.",
    services: [
      { number: "۰۱", title: "مشاورهٔ سیستم کسب‌وکار", body: "سیستم پشت کسب‌وکار شما را بررسی می‌کنیم: انتخاب‌ها، منطق عملیاتی، توانمندی‌ها و محدودیت‌ها. خروجی، بنیانی روشن‌تر برای تصمیم‌هایی است که باید در طول زمان منسجم بمانند.", detail: "راهبرد · مدل عملیاتی · توانمندی" },
      { number: "۰۲", title: "طراحی سرویس کسب‌وکار", body: "مدل کسب‌وکار را به سرویس‌هایی تبدیل می‌کنیم که مردم آن‌ها را درک کنند و تیم‌ها بتوانند ارائه‌شان دهند. هر سرویس بر ارزش واقعی، نقش‌های روشن و مسیری عملی از وعده تا عملکرد بنا می‌شود.", detail: "ارزش پیشنهادی · مدل سرویس · ارائه" },
      { number: "۰۳", title: "هم‌راستاسازی نقاط تماس کسب‌وکار", body: "لحظه‌هایی را که کسب‌وکار با مشتریان، شرکا و تیم‌ها روبه‌رو می‌شود هم‌راستا می‌کنیم. همهٔ نقاط تماس به یک نیت مشترک متصل می‌شوند تا تجربه از نخستین نشانه تا رابطه‌ای ماندگار، یکپارچه باشد.", detail: "تجربه · سفر · هم‌راستایی" },
    ],
  },
  "thrivable-business": {
    heading: "کسب‌وکار شکوفا", question_image: "/assets/metro-paths.png", question_image_alt: "رهبر کسب‌وکار در تقاطع مسیرهای آینده", question_section_label: "کجا بازی کنیم و چگونه برنده شویم", question: "کجا بازی کنیم؟\nچگونه برنده شویم؟",
    service_blocks: [
      { number: "۱", title: "کتاب آیندهٔ X", body: "بسیاری از شرکت‌ها زمان، منابع یا تخصص لازم برای پایش مداوم آیندهٔ صنعت، فناوری‌های نوظهور و مدل‌های تازهٔ رشد را ندارند. در الیافلو با تحلیل سیگنال‌های ضعیف و روندهای نوظهور، گزارش‌های دوره‌ای و کاملاً اختصاصی از آیندهٔ صنایع در جهان تکنوکراتیک تولید می‌کنیم.", image: "/assets/future-of-x-book.svg", image_alt: "نماد کتاب آیندهٔ X" },
      { number: "۲", title: "چرخهٔ حیاتی کسب‌وکار", body: "با تکیه بر آیندهٔ مطلوب، ارزش‌آفرین‌ترین چرخه‌ها را با توانمندی‌ها و سبد کنونی شما هم‌راستا می‌کنیم و آن‌ها را به یک مدل کسب‌وکار عملی با سرویس‌های حیاتی تبدیل می‌کنیم. این مدل، چارچوبی مشترک برای راهبردهای کوتاه‌مدت و بلندمدت فراهم می‌کند.", image: "", image_alt: "نماد چرخهٔ حیاتی کسب‌وکار" },
      { number: "۳", title: "فرهنگ برند و تجربهٔ کارکنان", body: "برای جان‌بخشیدن به مدل طراحی‌شده، شهر برند را می‌سازیم؛ فضای درونی و مشارکتی‌ای که آیندهٔ برند را در همهٔ ابعاد، از هویت و فرهنگ تا رفتارهای روزمره و سیستم‌های ارتباطی، به واقعیت تبدیل می‌کند.", image: "", image_alt: "نماد فرهنگ برند و تجربهٔ کارکنان" },
    ],
    futures: [
      { image: "/assets/future-of-banking-card.png", image_alt: "آیندهٔ بانکداری در جهان تکنوکراتیک", label: "نام صنعت", title: "آیندهٔ بانکداری", body: "تصویری روشن از نیروهای تغییر، فرصت‌های نوظهور و مدل‌های آیندهٔ صنعت بانکداری." },
      { image: "/assets/future-of-banking-card.png", image_alt: "آیندهٔ حکمرانی در جهان تکنوکراتیک", label: "نام صنعت", title: "آیندهٔ حکمرانی", body: "تحلیل روندها و انتخاب‌هایی که آیندهٔ حکمرانی و خدمات عمومی را شکل می‌دهند." },
      { image: "/assets/future-of-banking-card.png", image_alt: "آیندهٔ آموزش در جهان تکنوکراتیک", label: "نام صنعت", title: "آیندهٔ آموزش", body: "شناخت فناوری‌ها، نیازها و تجربه‌هایی که آموزش فردا را بازطراحی می‌کنند." },
    ],
    loops: [
      { image: "/assets/aliasys-loop.png", image_alt: "چرخهٔ کسب‌وکار الیاسیس", label: "زیرساخت فناوری اطلاعات", title: "چرخهٔ کسب‌وکار الیاسیس", body: "مدلی یکپارچه برای تبدیل توانمندی‌های زیرساختی به ارزش پایدار برای مشتری." },
      { image: "/assets/aliapay-loop.png", image_alt: "چرخهٔ کسب‌وکار الیاپی", label: "بانکداری و فین‌تک", title: "چرخهٔ کسب‌وکار الیاپی", body: "پیوند سرویس‌های مالی، تجربهٔ مشتری و عملیات در یک چرخهٔ ارزش‌آفرین." },
      { image: "/assets/alialab-loop.png", image_alt: "چرخهٔ کسب‌وکار الیالب", label: "آموزش", title: "چرخهٔ کسب‌وکار الیالب", body: "ساختاری برای تبدیل یادگیری، تجربه و همکاری به رشد مداوم." },
    ],
    cultures: [
      { image: "/assets/workshop.png", image_alt: "کارگاه فرهنگ تکنوکراتیک", label: "زیرساخت فناوری اطلاعات", title: "فرهنگ تکنوکراتیک", body: "فرهنگی که تصمیم‌گیری، فناوری و مسئولیت‌پذیری را به هم متصل می‌کند." },
      { image: "/assets/design-event.png", image_alt: "کارگاه فرهنگ تفکر طراحی", label: "نوآوری و طراحی", title: "فرهنگ تفکر طراحی", body: "روشی مشارکتی برای دیدن مسئله، ساختن راه‌حل و یادگیری از اجرا." },
      { image: "/assets/meeting-halftone.png", image_alt: "نشست فرهنگ چابک مشارکتی", label: "رهبری و مدیریت", title: "فرهنگ چابک مشارکتی", body: "هم‌راستایی تیم‌ها برای حرکت سریع، شفاف و یادگیرنده." },
    ],
    magazine_heading: "مجلهٔ آیندهٔ بانکداری\nدر جهان تکنوکراتیک", magazine_price: "۹۰۰ دلار", magazine_image: "/assets/magazine.png", magazine_image_alt: "صفحات مجلهٔ آیندهٔ بانکداری", magazine_cta_label: "خرید مجله", magazine_cta_href: "#contact-us",
    jam_heading: "جم شکوفایی\nبانکداری", jam_date: "۲۱ تا ۲۵ مهر ۱۴۰۴", jam_body: "یک تجربهٔ فشرده و مشارکتی برای کشف فرصت‌های آینده، طراحی مدل‌های تازه و هم‌راستاکردن رهبران صنعت بانکداری.", jam_image: "/assets/banking-event.png", jam_image_alt: "محل برگزاری جم شکوفایی بانکداری", jam_cta_label: "رزرو کنید", jam_cta_href: "#contact-us",
  },
  "business-leadership": {
    department_heading: "رهبری کسب‌وکار", question_image: "/assets/metro-boardroom.png", question_image_alt: "رهبران کسب‌وکار در اتاق هیئت‌مدیره", question: "چه بازی‌ای بسازیم؟\nچگونه رهبری کنیم؟",
    statements: [
      { number: "۴", title: "بازی کسب‌وکار", body: "با روش اختصاصی بازی چرخهٔ کسب‌وکار، سازمان شما را از حالت واکنشی به محرک تغییر تبدیل می‌کنیم؛ جایی که هر تصمیم به ساختن یک بازی تازه کمک می‌کند، نه ادامه‌دادن بازی موجود.", cards: [{ title: "کارت بازی کسب‌وکار ۱", image: "/assets/business-game-card.png" }, { title: "کارت بازی کسب‌وکار ۲", image: "/assets/business-game-card.png" }, { title: "کارت بازی کسب‌وکار ۳", image: "/assets/business-game-card.png" }] },
      { number: "۵", title: "نقش‌های راهبردی", body: "پیاده‌سازی شهر برند فقط یک پروژهٔ خلاقانه نیست؛ تحولی سازمانی است که به رهبری، تعریف نقش‌ها و راهبردهای روشن برای هدایت آینده نیاز دارد.", cards: [{ title: "کارت نقش راهبردی ۱", image: "/assets/strategic-role-card.png" }, { title: "کارت نقش راهبردی ۲", image: "/assets/strategic-role-card.png" }, { title: "کارت نقش راهبردی ۳", image: "/assets/strategic-role-card.png" }] },
      { number: "۶", title: "مدل رهبری", body: "نقش‌های راهبردی طراحی‌شده برای شهر برند شما منحصربه‌فردند؛ بازتابی مستقیم از DNA برند و معماری آیندهٔ کسب‌وکارتان.", cards: [{ title: "کارت مدل رهبری ۱", image: "/assets/leadership-model-card.png" }, { title: "کارت مدل رهبری ۲", image: "/assets/leadership-model-card.png" }, { title: "کارت مدل رهبری ۳", image: "/assets/leadership-model-card.png" }] },
    ],
    holocratic_heading: "مدیریت\nهولاکراتیک", holocratic_line: "منتورینگ، رهبری، آموزش، کوچینگ و مدیریت", event_title: "جم رهبری آینده", event_image: "/assets/future-leadership-jam.svg", event_image_alt: "گردهمایی تیم رهبری", event_kicker: "۲۱ تا ۲۵ مهر ۱۴۰۴", event_body: "تجربه‌ای مشارکتی برای بازاندیشی نقش رهبران، ساختن زبان مشترک و آماده‌کردن سازمان برای آینده.", event_cta_label: "رزرو رویداد", event_cta_href: "#contact-us",
  },
  "technocratic-design": {
    department_heading: "طراحی تکنوکراتیک", question_image: "/assets/metro-boardroom.png", question_image_alt: "کارگاه طراحی تکنوکراتیک", question: "چه زمانی طراحی کنیم؟\nچگونه تغییر بسازیم؟",
    pillars: [{ label: "روایت کسب‌وکار" }, { label: "زندگی کسب‌وکار" }, { label: "بازی کسب‌وکار" }],
    statements: [
      { number: "۷", title: "تنظیم ریسک", body: "بسیاری از کسب‌وکارها روی مسئلهٔ اشتباه کار می‌کنند و زمان و منابع را هدر می‌دهند. کمک می‌کنیم مسئلهٔ درست را شناسایی کنید و آن را به شیوهٔ درست حل کنید.", cards: [{ title: "کارت تنظیم ریسک ۱", image: "/assets/risk-setting-card.png" }, { title: "کارت تنظیم ریسک ۲", image: "/assets/risk-setting-card.png" }, { title: "کارت تنظیم ریسک ۳", image: "/assets/risk-setting-card.png" }] },
      { number: "۸", title: "حل تغییر", body: "بر پایهٔ نیازها و چالش‌های واقعی شناسایی‌شده، تیم ما راه‌حل‌هایی را پژوهش، تحلیل و طراحی می‌کند که با DNA سازمان شما کاملاً هم‌راستا باشند.", cards: [{ title: "کارت حل تغییر ۱", image: "/assets/change-solving-card.png" }, { title: "کارت حل تغییر ۲", image: "/assets/change-solving-card.png" }, { title: "کارت حل تغییر ۳", image: "/assets/change-solving-card.png" }] },
      { number: "۹", title: "آزمون عملکرد", body: "راه‌حل‌ها با مشارکت نزدیک واحدها و متخصصان سازمان اجرا می‌شوند. مناسب‌ترین گزینه با همراهی فعال تیم‌ها انتخاب، پیاده‌سازی و در طول اجرا برای یادگیری و بهبود باز نگه داشته می‌شود.", cards: [{ title: "کارت آزمون عملکرد ۱", image: "/assets/performance-testing-card.png" }, { title: "کارت آزمون عملکرد ۲", image: "/assets/performance-testing-card.png" }, { title: "کارت آزمون عملکرد ۳", image: "/assets/performance-testing-card.png" }] },
    ],
    event_title: "جم طراحی تکنوکراتیک برای رهبری", event_image: "/assets/technocratic-leadership-jam.png", event_image_alt: "رویداد طراحی تکنوکراتیک", event_kicker: "۲۱ تا ۲۵ مهر ۱۴۰۴", event_body: "فضایی برای پیوند رهبری، طراحی و فناوری؛ از تعریف مسئله تا آزمودن تغییری که بتواند در سازمان ادامه پیدا کند.", event_cta_label: "رزرو رویداد", event_cta_href: "#contact-us",
  },
  "execution-management": {
    heading: "مدیریت اجرا", orbit_labels: [{ label: "بازطراحی برند\nادور" }, { label: "تجربهٔ\nدوغزال" }, { label: "برندسازی\nفومنتو" }, { label: "کمپین\nآروا" }], emphasized_label: "نمایشگاه\nالیاسیس", body: "با بهره‌گیری از فناوری‌های پیشرفتهٔ اطلاعات و ارتباطات، به کسب‌وکارها کمک می‌کنیم نسخه‌ای بهینه‌تر، کارآمدتر و موفق‌تر از خود بسازند.",
  },
  "why-choose-us": { eyebrow: "چرا ما را انتخاب کنید؟", heading: "توانمندسازی شکوفایی\nکسب‌وکار با\nنوآوری تکنوکراتیک" },
  "portfolio-people": {
    portfolio_heading: "پروژه‌ها", people_heading: "آدم‌ها", toolkits_heading: "جعبه‌ابزارهای طراحی",
    timeline: [
      { year: "۱۳۸۹", label: "ماشین خط زمان", body: "نقطه‌ای مهم در شکل‌گیری رویکرد الیافلو به تحول کسب‌وکار و ارزش‌آفرینی بلندمدت." },
      { year: "۱۳۹۰", label: "ماشین زمان", body: "فصلی تازه برای پیوند آینده‌نگری، طراحی راهبردی و اجرای عملی در کسب‌وکار." },
      { year: "۱۳۹۵", label: "ماشین خط زمان", body: "تکامل سیستم با پروژه‌ها، همکاری‌ها و شواهدی که از سازمان‌های واقعی به دست آمد." },
    ],
    people: [
      { name: "وحید دائم", role: "مدیر کسب‌وکار", image: "/assets/daem.png", image_alt: "وحید دائم" },
      { name: "نسیم توکلی", role: "متخصص اتوماسیون و هوش مصنوعی", image: "/assets/tavakoli.png", image_alt: "نسیم توکلی" },
      { name: "سامان احتشام‌زاده", role: "مدیر بازاریابی", image: "/assets/ehteshamzadeh.png", image_alt: "سامان احتشام‌زاده" },
      { name: "نرگس محیط", role: "طراح فضا", image: "/assets/mohit.png", image_alt: "نرگس محیط" },
    ],
    toolkits: [1, 2, 3, 4].map((number) => ({ title: `جعبه‌ابزار ${number}`, body: "ابزارهای عملی برای طراحی و اجرای تغییر", image: `/assets/toolkit-${number}.png`, image_alt: `جعبه‌ابزار طراحی ${number}` })),
  },
  "testimonials-footer": {
    trust_heading: "چرا به ما اعتماد کنید", trust_subheading: "دلیلی برای باور",
    partners_heading: "همکاران", testimonials_heading: "دیدگاه مشتریان",
    partners: [{ name: "مشاور امین" }, { name: "آتولیه" }, { name: "دانشگاه تهران", logo: "/assets/partner-tehran-university.png", logo_alt: "دانشگاه تهران" }, { name: "معماری راد", logo: "/assets/partner-raad-architect.png", logo_alt: "معماری راد" }, { name: "همکار تجاری" }, { name: "همکار تجاری" }, { name: "همکار تجاری" }, { name: "همکار تجاری" }],
    testimonials: [
      { name: "آقای انصاری", role: "مدیر سیسکو", title: "پشتیبانی پس از فروش", body: "همراهی تیم در تمام مسیر، از تعریف مسئله تا اجرای راه‌حل، شفاف و مسئولانه بود.", image: "/assets/testimonial-ansari.png", image_alt: "آقای انصاری، مدیر سیسکو" },
      { name: "آقای بهادری", role: "مدیر سیسکو", title: "همکاری قابل اعتماد", body: "رویکرد سیستماتیک و کیفیت تعامل تیم، تصمیم‌گیری و اجرای پروژه را برای ما ساده‌تر کرد.", image: "/assets/testimonial-ansari.png", image_alt: "آقای بهادری، مدیر سیسکو" },
      { name: "آقای انصاری", role: "مدیر سیسکو", title: "پشتیبانی پس از فروش", body: "همراهی تیم در تمام مسیر، از تعریف مسئله تا اجرای راه‌حل، شفاف و مسئولانه بود.", image: "/assets/testimonial-ansari.png", image_alt: "آقای انصاری، مدیر سیسکو" },
      { name: "آقای بهادری", role: "مدیر سیسکو", title: "همکاری قابل اعتماد", body: "رویکرد سیستماتیک و کیفیت تعامل تیم، تصمیم‌گیری و اجرای پروژه را برای ما ساده‌تر کرد.", image: "/assets/testimonial-ansari.png", image_alt: "آقای بهادری، مدیر سیسکو" },
    ],
    closing_heading: "چه می‌شد\nاگر...", closing_body: "می‌توانستید کسب‌وکار موفق خود را\nبه کسب‌وکاری شکوفا تبدیل کنید؟",
  },
  footer: {
    logo: "/assets/aliaflow-logo.svg", logo_alt: "الیافلو", home_href: "#home", eyebrow: "گفت‌وگو را شروع کنیم", heading_line1: "کسب‌وکارتان را", heading_emphasis: "شکوفا کنید.", email: "hello@aliaflow.com", description: "شریک رهبری برای ساختن کسب‌وکارهای خواستنی، رقابت‌پذیر و مقیاس‌پذیر.", social_links: [{ label: "لینکدین", href: "#home" }, { label: "اینستاگرام", href: "#home" }], copyright: "© ۱۴۰۴ الیافلو. همهٔ حقوق محفوظ است.",
  },
};
