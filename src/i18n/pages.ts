export const getField = (item: any, field: string, lang: string) =>
  item[`${field}_${lang}`] ||
  item[`${field}_en`] ||
  item[`${field}_ar`] ||
  item[field] ||
  "";

export const commonText = {
  returnToHome: {
    ar: "العودة للرئيسية",
    en: "Return to Home",
    tr: "Ana Sayfaya Dön",
  },
  returnToArticles: {
    ar: "العودة للمقالات",
    en: "Return to Articles",
    tr: "Makalelere Dön",
  },
  articleNotFound: {
    ar: "لم يتم العثور على المقال",
    en: "Article not found",
    tr: "Makale bulunamadı",
  },
  universityNotFound: { ar: "لم يتم العثور على الجامعة", en: "University not found", tr: "Üniversite bulunamadı" },
  returnToUniversities: { ar: "العودة للجامعات", en: "Return to Universities", tr: "Üniversitelere Dön" },
  universitiesList: { ar: "قائمة الجامعات", en: "Universities List", tr: "Üniversiteler Listesi" },
  aboutUniversity: { ar: "نبذة عن الجامعة", en: "About the University", tr: "Üniversite Hakkında" },
  availableSpecialties: { ar: "التخصصات المتاحة", en: "Available Specialties", tr: "Mevcut Uzmanlıklar" },
  visitWebsite: { ar: "زيارة الموقع الرسمي", en: "Visit Official Website", tr: "Resmi Web Sitesini Ziyaret Et" },
  studentWord: { ar: "طالب", en: "Student", tr: "Öğrenci" },
  studentNotFound: { ar: "لم يتم العثور على الطالب", en: "Student not found", tr: "Öğrenci bulunamadı" },
  returnToStudents: { ar: "العودة للطلاب", en: "Return to Students", tr: "Öğrencilere Dön" },
  studentsList: { ar: "قائمة الطلاب", en: "Students List", tr: "Öğrenciler Listesi" },
  academicYear: { ar: "السنة:", en: "Year:", tr: "Yıl:" },
  gpa: { ar: "المعدل:", en: "GPA:", tr: "Not Ortalaması:" },
  cv: { ar: "السيرة الذاتية", en: "Biography", tr: "Biyografi" },
  notableAchievement: { ar: "الإنجاز البارز", en: "Notable Achievement", tr: "Önemli Başarı" },
  iconNotFound: { ar: "لم يتم العثور على الرمز", en: "Icon not found", tr: "İkon bulunamadı" },
  returnToIcons: { ar: "العودة للرموز", en: "Return to Icons", tr: "İkonlara Dön" },
  iconsList: { ar: "قائمة الرموز", en: "Icons List", tr: "İkonlar Listesi" },
  fieldText: { ar: "المجال:", en: "Field:", tr: "Alan:" },
  experienceYears: { ar: "سنوات الخبرة:", en: "Years of Experience:", tr: "Deneyim Yılları:" },
  notableWork: { ar: "الأعمال والإنجازات البارزة", en: "Notable Works and Achievements", tr: "Önemli Eserler ve Başarılar" },
  bornIn: { ar: "مواليد", en: "Born in", tr: "Doğum yılı" },
  noArticles: {
    ar: "لا توجد مقالات متاحة حالياً",
    en: "No articles available currently",
    tr: "Şu anda makale bulunmamaktadır",
  },
  noUniversities: {
    ar: "لا توجد جامعات متاحة حالياً",
    en: "No universities available currently",
    tr: "Şu anda üniversite bulunmamaktadır",
  },
  noStudents: {
    ar: "لا يوجد طلاب متاحين حالياً",
    en: "No students available currently",
    tr: "Şu anda öğrenci bulunmamaktadır",
  },
  noIcons: {
    ar: "لا توجد رموز متاحة حالياً",
    en: "No icons available currently",
    tr: "Şu anda ikon bulunmamaktadır",
  },
  noAchievements: {
    ar: "لا توجد إنجازات متاحة حالياً",
    en: "No achievements available currently",
    tr: "Şu anda başarı bulunmamaktadır",
  },
};

export const navbarText = {
  unionName: {
    ar: "اتحاد الطلاب اليمنيين",
    en: "Yemeni Students Union",
    tr: "Yemenli Öğrenciler Birliği",
  },
  branchName: {
    ar: "فرع إسطنبول · تركيا",
    en: "Istanbul Branch · Turkey",
    tr: "İstanbul Şubesi · Türkiye",
  },
  links: {
    aboutIstanbul: { ar: "عن إسطنبول", en: "About Istanbul", tr: "İstanbul Hakkında" },
    aboutYemen: { ar: "عن اليمن", en: "About Yemen", tr: "Yemen Hakkında" },
    universities: { ar: "جامعات إسطنبول", en: "Istanbul Universities", tr: "İstanbul Üniversiteleri" },
    ourStudents: { ar: "كادر الاتحاد", en: "Our Team", tr: "Ekibimiz" },
    store: { ar: "المتجر", en: "Store", tr: "Mağaza" },
    achievements: { ar: "إنجازات الاتحاد", en: "Union Achievements", tr: "Birlik Başarıları" },
    studentProjects: { ar: "مشاريع الطلاب", en: "Student Projects", tr: "Öğrenci Projeleri" },
  },
  buttons: {
    register: { ar: "سجل الآن", en: "Register Now", tr: "Kayıt Ol" },
    joinNow: { ar: "سجل واحصل على العضوية", en: "Join Now - Free", tr: "Hemen Katıl - Ücretsiz" },
  }
};

export const footerText = {
  description: {
    ar: "منظومة دعم شاملة للطلاب اليمنيين في تركيا. نبني مجتمعًا طلابيًا متماسكًا يدعم كل طالب في رحلته الأكاديمية.",
    en: "A comprehensive support system for Yemeni students in Turkey. We build a cohesive student community supporting every student in their academic journey.",
    tr: "Türkiye'deki Yemenli öğrenciler için kapsamlı bir destek sistemi. Her öğrenciyi akademik yolculuğunda destekleyen uyumlu bir öğrenci topluluğu inşa ediyoruz.",
  },
  sections: {
    quickLinks: { ar: "روابط سريعة", en: "Quick Links", tr: "Hızlı Bağlantılar" },
    studentGuide: { ar: "الدليل الطلابي", en: "Student Guide", tr: "Öğrenci Rehberi" },
    contactUs: { ar: "تواصل معنا", en: "Contact Us", tr: "Bize Ulaşın" },
  },
  links: {
    aboutUs: { ar: "من نحن", en: "About Us", tr: "Hakkımızda" },
    studentGuide: { ar: "الدليل الطلابي", en: "Student Guide", tr: "Öğrenci Rehberi" },
    activitiesEvents: { ar: "الأنشطة والفعاليات", en: "Activities & Events", tr: "Etkinlikler" },
    exclusiveDiscounts: { ar: "التخفيضات الحصرية", en: "Exclusive Discounts", tr: "Özel İndirimler" },
    ourPartners: { ar: "شركاؤنا", en: "Our Partners", tr: "Ortaklarımız" },
    qna: { ar: "أسئلة وأجوبة", en: "Q&A", tr: "S&S" },
    universitiesGuide: { ar: "دليل الجامعات", en: "Universities Guide", tr: "Üniversiteler Rehberi" },
    residenceProcedures: { ar: "إجراءات الإقامة", en: "Residence Procedures", tr: "İkamet Prosedürleri" },
    dailyLifeTips: { ar: "نصائح الحياة اليومية", en: "Daily Life Tips", tr: "Günlük Yaşam İpuçları" },
    privacyPolicy: { ar: "سياسة الخصوصية", en: "Privacy Policy", tr: "Gizlilik Politikası" },
    termsOfUse: { ar: "شروط الاستخدام", en: "Terms of Use", tr: "Kullanım Koşulları" },
  },
  copyright: {
    ar: "© 2026 اتحاد الطلاب اليمنيين في تركيا – فرع إسطنبول. جميع الحقوق محفوظة.",
    en: "© 2026 Yemeni Students Union in Turkey – Istanbul Branch. All rights reserved.",
    tr: "© 2026 Türkiye'deki Yemenli Öğrenciler Birliği – İstanbul Şubesi. Tüm hakları saklıdır.",
  },
  heroTitle: {
    ar: "اتحاد الطلاب اليمنيين",
    en: "Yemeni Students Union",
    tr: "Yemenli Öğrenciler Birliği",
  },
  city: {
    ar: "إسطنبول",
    en: "Istanbul",
    tr: "İstanbul",
  }
};

export const aboutIstanbulText = {
  heroEyebrow: { ar: "عن إسطنبول", en: "About Istanbul", tr: "İstanbul Hakkında" },
  heroTitle: { ar: "إسطنبول — بوابة الشرق", en: "Istanbul — Gateway to the East", tr: "İstanbul — Doğu'nun Kapısı" },
  heroDesc: {
    ar: "اكتشف سحر إسطنبول وتاريخها العريق، ودليلك الشامل للحياة الطلابية في أجمل مدن العالم",
    en: "Discover the magic of Istanbul, its ancient history, and your comprehensive guide to student life in the world's most beautiful city.",
    tr: "İstanbul'un büyüsünü, kadim tarihini keşfedin ve dünyanın en güzel şehrindeki öğrenci yaşamına dair kapsamlı rehberinizi inceleyin.",
  },
  guideTitle: { ar: "دليلك إلى إسطنبول", en: "Your Guide to Istanbul", tr: "İstanbul Rehberiniz" },
  articlesTitle: { ar: "مقالات عن إسطنبول", en: "Articles about Istanbul", tr: "İstanbul Hakkında Makaleler" },
  staticSections: [
    {
      icon: '🕌',
      title: { ar: "مدينة العالم والتاريخ", en: "The City of the World and History", tr: "Dünya ve Tarih Şehri" },
      body: {
        ar: "إسطنبول — المدينة التي تجمع بين قارتين، وتحمل في أحجارها آلاف السنين من الحضارة الإنسانية. من القسطنطينية العظيمة إلى عاصمة الخلافة العثمانية إلى باب الشرق الحديث، تبقى إسطنبول مدينة الأحلام والتاريخ في آنٍ واحد.\n\nتستقطب إسطنبول ملايين الزوار سنوياً، وتحتضن مئات الآلاف من الطلاب الدوليين الذين يجدون فيها بيئةً علمية حافلة بالفرص، ومجتمعاً إنسانياً دافئاً يرحّب بالجميع.",
        en: "Istanbul — The city that brings together two continents, bearing thousands of years of human civilization in its stones. From the great Constantinople to the capital of the Ottoman Caliphate to the modern gateway to the East, Istanbul remains the city of dreams and history at once.\n\nIstanbul attracts millions of visitors annually, and embraces hundreds of thousands of international students who find in it an educational environment full of opportunities, and a warm human community that welcomes everyone.",
        tr: "İstanbul — İki kıtayı birleştiren ve taşlarında binlerce yıllık insanlık medeniyetini taşıyan şehir. Büyük Konstantinopolis'ten Osmanlı Hilafetinin başkentine, Doğu'nun modern kapısına kadar İstanbul, aynı zamanda hayallerin ve tarihin şehri olmaya devam ediyor.\n\nİstanbul her yıl milyonlarca ziyaretçiyi çeker ve fırsatlarla dolu bir eğitim ortamı ve herkesi kucaklayan sıcak bir insan topluluğu bulan yüz binlerce uluslararası öğrenciye ev sahipliği yapar.",
      }
    },
    {
      icon: '🎨',
      title: { ar: "الثقافة والحياة اليومية", en: "Culture and Daily Life", tr: "Kültür ve Günlük Yaşam" },
      body: {
        ar: "تتميز إسطنبول بمزيجها الفريد من الثقافة الشرقية والغربية، حيث تجد في شوارعها تناغماً بين الأصالة والمعاصرة. أسواقها التاريخية كالبازار الكبير وبازار التوابل تجاور المراكز التجارية الحديثة والمطاعم العالمية.\n\nالحياة الاجتماعية في إسطنبول غنية ومتنوعة — من المقاهي الصاخبة على ضفاف البوسفور، إلى الحفلات الموسيقية والمعارض الفنية، وصولاً إلى المهرجانات الثقافية الدولية على مدار العام.",
        en: "Istanbul is characterized by its unique blend of Eastern and Western culture, where you find a harmony between tradition and modernity in its streets. Its historical markets like the Grand Bazaar and the Spice Bazaar are adjacent to modern shopping centers and international restaurants.\n\nSocial life in Istanbul is rich and diverse — from the bustling cafes on the banks of the Bosphorus, to musical concerts and art exhibitions, all the way to international cultural festivals throughout the year.",
        tr: "İstanbul, sokaklarında gelenek ile modernliğin uyumunu bulduğunuz eşsiz Doğu ve Batı kültürü karışımı ile karakterizedir. Kapalıçarşı ve Mısır Çarşısı gibi tarihi pazarları, modern alışveriş merkezleri ve uluslararası restoranlara komşudur.\n\nİstanbul'da sosyal yaşam zengin ve çeşitlidir — Boğaz'ın kıyısındaki hareketli kafelerden konserlere ve sanat sergilerine, yıl boyunca düzenlenen uluslararası kültürel festivallere kadar.",
      }
    },
    {
      icon: '🚇',
      title: { ar: "السكن والمواصلات وأسلوب الحياة", en: "Housing, Transportation, and Lifestyle", tr: "Barınma, Ulaşım ve Yaşam Tarzı" },
      body: {
        ar: "تمتلك إسطنبول شبكة مواصلات عامة من بين أفضل المدن العالمية، تشمل المترو، والترام، والحافلات، والعبّارات التي تربط ضفتي المدينة الأوروبية والآسيوية. بطاقة إسطنبول (İstanbulkart) تتيح لك التنقل بتكلفة منخفضة جداً.\n\nالسكن الطلابي متاح بأسعار مختلفة تبدأ من السكن الجامعي المدعوم وحتى الشقق الخاصة. أحياء مثل باشاك شهير، وكايت هانه، وفاتح، وبيلك دوزو تُعدّ من أكثر الأحياء شعبيةً بين الطلاب العرب.",
        en: "Istanbul has a public transportation network among the best global cities, including the metro, tram, buses, and ferries that connect the European and Asian sides of the city. The Istanbul Card (İstanbulkart) allows you to move around at a very low cost.\n\nStudent housing is available at various prices, starting from subsidized university housing to private apartments. Neighborhoods like Başakşehir, Kağıthane, Fatih, and Beylikdüzü are among the most popular neighborhoods for Arab students.",
        tr: "İstanbul, şehrin Avrupa ve Asya yakalarını birbirine bağlayan metro, tramvay, otobüs ve feribotları ile en iyi küresel şehirler arasında yer alan bir toplu taşıma ağına sahiptir. İstanbul Kart (İstanbulkart) çok düşük bir maliyetle dolaşmanızı sağlar.\n\nÖğrenci barınması, destekli üniversite yurtlarından özel apartmanlara kadar çeşitli fiyatlarla mevcuttur. Başakşehir, Kağıthane, Fatih ve Beylikdüzü gibi semtler Arap öğrenciler arasında en popüler semtler arasındadır.",
      }
    },
  ]
};

export const aboutYemenText = {
  heroEyebrow: { ar: "عن اليمن", en: "About Yemen", tr: "Yemen Hakkında" },
  heroTitle: { ar: "اليمن السعيد — موطن الحضارة", en: "Happy Yemen — Home of Civilization", tr: "Mutlu Yemen — Medeniyetin Yurdu" },
  heroDesc: {
    ar: "رحلة في عمق التاريخ والثقافة اليمنية، واكتشاف دور الجالية اليمنية في إسطنبول",
    en: "A journey into the depths of Yemeni history and culture, and exploring the role of the Yemeni community in Istanbul.",
    tr: "Yemen tarihi ve kültürünün derinliklerine bir yolculuk ve İstanbul'daki Yemen toplumunun rolünü keşfetmek.",
  },
  guideTitle: { ar: "اليمن وتاريخها", en: "Yemen and its History", tr: "Yemen ve Tarihi" },
  articlesTitle: { ar: "مقالات عن اليمن", en: "Articles about Yemen", tr: "Yemen Hakkında Makaleler" },
  staticSections: [
    {
      icon: '🇾🇪',
      title: { ar: "اليمن السعيد — أرض الحضارة والتاريخ", en: "Happy Yemen — Land of Civilization and History", tr: "Mutlu Yemen — Medeniyet ve Tarih Diyarı" },
      body: {
        ar: "اليمن، ذلك البلد العريق الذي شهد ميلاد حضارات إنسانية راسخة، من مملكة سبأ الأسطورية إلى حضرموت ذات الطراز المعماري الفريد. أرضٌ تفخر بلغة القرآن الكريم، وبتاريخ لم يكتبه الزمن إلا بمداد الذهب.\n\nاليمنيون المقيمون في إسطنبول يحملون معهم هذا الإرث الحضاري العميق، ويسعون يومياً إلى نقله للأجيال القادمة وإثراء التجربة الإنسانية المشتركة في ربوع هذه المدينة الكبيرة.",
        en: "Yemen, that ancient country that witnessed the birth of deeply rooted human civilizations, from the legendary Kingdom of Sheba to Hadhramaut with its unique architectural style. A land proud of the language of the Holy Quran, and a history written by time only in gold.\n\nYemenis residing in Istanbul carry with them this profound cultural heritage, striving daily to pass it on to future generations and enrich the shared human experience across this great city.",
        tr: "Efsanevi Saba Krallığı'ndan eşsiz mimari tarzıyla Hadhramaut'a kadar köklü insan medeniyetlerinin doğuşuna tanık olan o kadim ülke Yemen. Kuran diliyle ve zamanın sadece altınla yazdığı bir tarihle gurur duyan bir diyar.\n\nİstanbul'da yaşayan Yemenliler, bu derin kültürel mirası yanlarında taşıyor, onu gelecek nesillere aktarmak ve bu büyük şehirde paylaşılan insan deneyimini zenginleştirmek için her gün çabalıyorlar.",
      }
    },
    {
      icon: '🏛️',
      title: { ar: "الحضارة اليمنية عبر التاريخ", en: "Yemeni Civilization Through History", tr: "Tarih Boyunca Yemen Medeniyeti" },
      body: {
        ar: "شهد اليمن قيام حضارات عريقة أسهمت في تشكيل الثقافة الإنسانية؛ فمملكة سبأ التي ثبّتت اسمها في الكتب السماوية، ودولة المعين التجارية التي حكمت طرق التوابل، والممالك الحميرية والقتبانية والحضرمية، كلها شواهد على عراقة وعمق الحضارة اليمنية.\n\nالآثار اليمنية، كالمدرج ومدينة شبام \"ناطحات سحاب الطين\"، مدرجةٌ على قائمة اليونسكو للتراث الإنساني المشترك، وهي شاهدٌ دائم على عبقرية الإنسان اليمني.",
        en: "Yemen witnessed the rise of ancient civilizations that contributed to shaping human culture; the Kingdom of Sheba, whose name is cemented in celestial books, the Minaean commercial state that ruled the spice routes, and the Himyarite, Qatabanian, and Hadhrami kingdoms are all testament to the antiquity and depth of the Yemeni civilization.\n\nYemeni antiquities, such as the amphitheater and the city of Shibam, the \"mud skyscrapers\", are listed on the UNESCO World Heritage Sites, standing as a lasting witness to the genius of the Yemeni people.",
        tr: "Yemen, insan kültürünü şekillendirmeye katkıda bulunan eski medeniyetlerin yükselişine tanık oldu; adı göksel kitaplarda pekişen Saba Krallığı, baharat yollarına hükmeden Minaean ticaret devleti ve Himyarite, Qatabanian ve Hadhrami krallıklarının tümü Yemen medeniyetinin eskilik ve derinliğinin kanıtıdır.\n\nAmfitiyatro ve \"çamur gökdelenleri\" Şibam şehri gibi Yemen eserleri, UNESCO Dünya Mirası Listesi'nde yer alarak Yemen halkının dehasının kalıcı bir tanığı olarak duruyor.",
      }
    },
    {
      icon: '🤝',
      title: { ar: "الجالية اليمنية في إسطنبول", en: "The Yemeni Community in Istanbul", tr: "İstanbul'daki Yemen Toplumu" },
      body: {
        ar: "تُعدّ الجالية اليمنية في إسطنبول من بين أكثر الجاليات العربية تماسكاً وتنظيماً في المدينة. يتوزع أبناؤها في مختلف أحياء إسطنبول، ويحافظون على هويتهم الثقافية من خلال فعاليات وتجمعات منتظمة تجمع بين الترابط الاجتماعي والنمو المهني.\n\nاتحاد الطلاب اليمنيين في إسطنبول يمثّل الرابط الأقوى بين أبناء الجالية الطلابية، ويوفر لهم بيئةً داعمة تساعدهم على الاندماج الإيجابي في الحياة التركية مع الحفاظ على انتمائهم وهويتهم.",
        en: "The Yemeni community in Istanbul is considered one of the most cohesive and organized Arab communities in the city. Its members are distributed across various neighborhoods in Istanbul, maintaining their cultural identity through regular events and gatherings that combine social bonding and professional growth.\n\nThe Yemeni Students Union in Istanbul represents the strongest link among the student community, providing them with a supportive environment that helps them integrate positively into Turkish life while preserving their belonging and identity.",
        tr: "İstanbul'daki Yemen toplumu, şehirdeki en uyumlu ve örgütlü Arap topluluklarından biri olarak kabul edilir. Üyeleri, sosyal bağ ve mesleki gelişimi birleştiren düzenli etkinlikler ve toplantılar yoluyla kültürel kimliklerini koruyarak İstanbul'un çeşitli semtlerine dağılmıştır.\n\nİstanbul'daki Yemenli Öğrenciler Birliği, aidiyetlerini ve kimliklerini korurken Türk yaşamına olumlu bir şekilde uyum sağlamalarına yardımcı olan destekleyici bir ortam sağlayarak öğrenci topluluğu arasındaki en güçlü bağı temsil eder.",
      }
    },
  ]
};

export const pagesText = {
  universities: {
    heroEyebrow: { ar: "الجامعات", en: "Universities", tr: "Üniversiteler" },
    heroTitle: { ar: "الجامعات التركية", en: "Turkish Universities", tr: "Türk Üniversiteleri" },
    heroDesc: {
      ar: "دليلك الشامل للتعرف على الجامعات التركية وتخصصاتها المختلفة",
      en: "Your comprehensive guide to exploring Turkish universities and their various specialties.",
      tr: "Türk üniversitelerini ve çeşitli uzmanlık alanlarını keşfetmek için kapsamlı rehberiniz.",
    },
    listTitle: { ar: "الجامعات", en: "Universities", tr: "Üniversiteler" },
    established: { ar: "تأسست", en: "Established", tr: "Kuruluş" },
  },
  students: {
    heroEyebrow: { ar: "طلابنا", en: "Our Students", tr: "Öğrencilerimiz" },
    heroTitle: { ar: "طلاب يمنيون متميزون", en: "Outstanding Yemeni Students", tr: "Başarılı Yemenli Öğrenciler" },
    heroDesc: {
      ar: "قصص نجاح وتفوق يسطرها الطلاب اليمنيون في مختلف الجامعات التركية",
      en: "Stories of success and excellence written by Yemeni students in various Turkish universities.",
      tr: "Çeşitli Türk üniversitelerinde Yemenli öğrenciler tarafından yazılan başarı ve mükemmellik hikayeleri.",
    },
    listTitle: { ar: "الطلاب", en: "Students", tr: "Öğrenciler" },
  },
  icons: {
    heroEyebrow: { ar: "رموزنا", en: "Our Icons", tr: "İkonlarımız" },
    heroTitle: { ar: "رموز يمنية في تركيا", en: "Yemeni Icons in Turkey", tr: "Türkiye'deki Yemenli İkonlar" },
    heroDesc: {
      ar: "شخصيات يمنية بارزة تركت بصمتها في مختلف المجالات",
      en: "Prominent Yemeni figures who have left their mark in various fields.",
      tr: "Çeşitli alanlarda iz bırakan önde gelen Yemenli isimler.",
    },
    listTitle: { ar: "الرموز", en: "Icons", tr: "İkonlar" },
  },
  achievements: {
    heroEyebrow: { ar: "إنجازاتنا", en: "Our Achievements", tr: "Başarılarımız" },
    heroTitle: { ar: "إنجازات الاتحاد", en: "Union Achievements", tr: "Birlik Başarıları" },
    heroDesc: {
      ar: "مسيرة حافلة بالعطاء والنجاح في خدمة الطالب اليمني",
      en: "A journey full of giving and success in serving the Yemeni student.",
      tr: "Yemenli öğrenciye hizmet etmede verme ve başarı ile dolu bir yolculuk.",
    },
    listTitle: { ar: "الإنجازات", en: "Achievements", tr: "Başarılar" },
  }
};

// ─── Store Module Translations ────────────────────────────────────────────────
export const storeText = {
  hero: {
    eyebrow: { ar: "المتجر", en: "Store", tr: "Mağaza" },
    title: { ar: "متجر الاتحاد", en: "Union Store", tr: "Birlik Mağazası" },
    desc: {
      ar: "منتجات حصرية للطلاب اليمنيين في إسطنبول",
      en: "Exclusive products for Yemeni students in Istanbul",
      tr: "İstanbul'daki Yemenli öğrenciler için özel ürünler",
    },
  },
  allCategories: { ar: "كل الفئات", en: "All Categories", tr: "Tüm Kategoriler" },
  featuredProducts: { ar: "منتجات مميزة", en: "Featured Products", tr: "Öne Çıkan Ürünler" },
  allProducts: { ar: "جميع المنتجات", en: "All Products", tr: "Tüm Ürünler" },
  orderNow: { ar: "اطلب الآن", en: "Order Now", tr: "Şimdi Sipariş Ver" },
  backToStore: { ar: "العودة للمتجر", en: "Back to Store", tr: "Mağazaya Dön" },
  backToHome: { ar: "العودة للرئيسية", en: "Back to Home", tr: "Ana Sayfaya Dön" },
  noProducts: { ar: "لا توجد منتجات في هذه الفئة", en: "No products in this category", tr: "Bu kategoride ürün yok" },
  noProductsYet: { ar: "لا توجد منتجات متاحة حالياً", en: "No products available yet", tr: "Henüz ürün yok" },
  loading: { ar: "جارٍ التحميل…", en: "Loading…", tr: "Yükleniyor…" },
  currency: {
    TRY: { ar: "ليرة", en: "TRY", tr: "TL" },
    USD: { ar: "دولار", en: "USD", tr: "USD" },
    YER: { ar: "ريال", en: "YER", tr: "YER" },
  },
  orderForm: {
    title: { ar: "تفاصيل الطلب", en: "Order Details", tr: "Sipariş Detayları" },
    name: { ar: "الاسم الكامل", en: "Full Name", tr: "Ad Soyad" },
    phone: { ar: "رقم الهاتف", en: "Phone Number", tr: "Telefon Numarası" },
    email: { ar: "البريد (اختياري)", en: "Email (optional)", tr: "E-posta (isteğe bağlı)" },
    note: { ar: "ملاحظات إضافية", en: "Additional Notes", tr: "Ek Notlar" },
    quantity: { ar: "الكمية", en: "Quantity", tr: "Miktar" },
    submit: { ar: "إرسال الطلب", en: "Submit Order", tr: "Siparişi Gönder" },
    submitting: { ar: "جارٍ الإرسال…", en: "Submitting…", tr: "Gönderiliyor…" },
    success: {
      ar: "تم إرسال طلبك بنجاح! سنتواصل معك قريباً.",
      en: "Your order was sent! We'll contact you soon.",
      tr: "Siparişiniz gönderildi! Yakında sizinle iletişime geçeceğiz.",
    },
    error: {
      ar: "حدث خطأ أثناء إرسال الطلب. حاول مرة أخرى.",
      en: "Something went wrong. Please try again.",
      tr: "Bir hata oluştu. Lütfen tekrar deneyin.",
    },
    namePlaceholder: { ar: "أدخل اسمك الكامل", en: "Enter your full name", tr: "Adınızı girin" },
    phonePlaceholder: { ar: "05xxxxxxxxx", en: "05xxxxxxxxx", tr: "05xxxxxxxxx" },
    emailPlaceholder: { ar: "example@email.com", en: "example@email.com", tr: "example@email.com" },
    notePlaceholder: { ar: "المقاس، اللون، ملاحظات…", en: "Size, color, special notes…", tr: "Beden, renk, notlar…" },
  },
  orderStatus: {
    pending: { ar: "قيد الانتظار", en: "Pending", tr: "Beklemede" },
    reviewing: { ar: "قيد المراجعة", en: "Reviewing", tr: "İnceleniyor" },
    confirmed: { ar: "تم التأكيد", en: "Confirmed", tr: "Onaylandı" },
    cancelled: { ar: "ملغى", en: "Cancelled", tr: "İptal Edildi" },
    completed: { ar: "مكتمل", en: "Completed", tr: "Tamamlandı" },
  },
  admin: {
    storeHub: { ar: "إدارة المتجر", en: "Store Management", tr: "Mağaza Yönetimi" },
    categories: { ar: "الفئات", en: "Categories", tr: "Kategoriler" },
    products: { ar: "المنتجات", en: "Products", tr: "Ürünler" },
    orders: { ar: "الطلبات", en: "Orders", tr: "Siparişler" },
    newCategory: { ar: "فئة جديدة", en: "New Category", tr: "Yeni Kategori" },
    newProduct: { ar: "منتج جديد", en: "New Product", tr: "Yeni Ürün" },
    editCategory: { ar: "تعديل الفئة", en: "Edit Category", tr: "Kategoriyi Düzenle" },
    editProduct: { ar: "تعديل المنتج", en: "Edit Product", tr: "Ürünü Düzenle" },
    deleteConfirm: { ar: "هل أنت متأكد من الحذف؟", en: "Are you sure you want to delete?", tr: "Silmek istediğinize emin misiniz?" },
    saveSuccess: { ar: "تم الحفظ بنجاح", en: "Saved successfully", tr: "Başarıyla kaydedildi" },
    deleteSuccess: { ar: "تم الحذف", en: "Deleted", tr: "Silindi" },
    customerName: { ar: "اسم العميل", en: "Customer Name", tr: "Müşteri Adı" },
    orderNumber: { ar: "رقم الطلب", en: "Order #", tr: "Sipariş No" },
    product: { ar: "المنتج", en: "Product", tr: "Ürün" },
    status: { ar: "الحالة", en: "Status", tr: "Durum" },
    date: { ar: "التاريخ", en: "Date", tr: "Tarih" },
    updateStatus: { ar: "تحديث الحالة", en: "Update Status", tr: "Durumu Güncelle" },
    adminNote: { ar: "ملاحظة داخلية", en: "Internal Note", tr: "Dahili Not" },
    noOrders: { ar: "لا توجد طلبات بعد", en: "No orders yet", tr: "Henüz sipariş yok" },
    totalOrders: { ar: "إجمالي الطلبات", en: "Total Orders", tr: "Toplam Siparişler" },
    totalProducts: { ar: "إجمالي المنتجات", en: "Total Products", tr: "Toplam Ürünler" },
  },
};

// ─── Student Projects Module Translations ─────────────────────────────────────
export const studentProjectsText = {
  hero: {
    eyebrow: { ar: "مشاريع الطلاب اليمنيين", en: "Yemeni Student Projects", tr: "Yemenli Öğrenci Projeleri" },
    title: { ar: "ادعم الطالب اليمني", en: "Support Yemeni Students", tr: "Yemenli Öğrenciyi Destekle" },
    desc: {
      ar: "اكتشف مشاريع وأعمال الطلاب اليمنيين في إسطنبول — من العطور والأغذية المنزلية إلى التصميم والخدمات التقنية",
      en: "Discover the businesses and projects of Yemeni students in Istanbul — from perfumes and homemade food to design and tech services.",
      tr: "İstanbul'daki Yemenli öğrencilerin işletmelerini ve projelerini keşfedin — parfümlerden ev yapımı yiyeceklere, tasarımdan teknoloji hizmetlerine kadar.",
    },
    cta: { ar: "اعرض مشروعك", en: "Showcase Your Project", tr: "Projenizi Sergileyin" },
  },
  allCategories: { ar: "جميع الفئات", en: "All Categories", tr: "Tüm Kategoriler" },
  sortNewest: { ar: "الأحدث", en: "Newest", tr: "En Yeni" },
  sortFeatured: { ar: "المميزة", en: "Featured", tr: "Öne Çıkan" },
  sortAZ: { ar: "أ — ي", en: "A — Z", tr: "A — Z" },
  searchPlaceholder: { ar: "ابحث عن مشروع…", en: "Search projects…", tr: "Proje ara…" },
  noProjects: { ar: "لا توجد مشاريع في هذه الفئة", en: "No projects in this category", tr: "Bu kategoride proje yok" },
  noProjectsYet: { ar: "لا توجد مشاريع متاحة حالياً", en: "No projects available yet", tr: "Henüz proje yok" },
  loading: { ar: "جارٍ التحميل…", en: "Loading…", tr: "Yükleniyor…" },
  viewDetails: { ar: "عرض التفاصيل", en: "View Details", tr: "Detayları Gör" },
  backToProjects: { ar: "العودة للمشاريع", en: "Back to Projects", tr: "Projelere Dön" },
  backToHome: { ar: "العودة للرئيسية", en: "Back to Home", tr: "Ana Sayfaya Dön" },
  featured: { ar: "مميز", en: "Featured", tr: "Öne Çıkan" },
  owner: { ar: "صاحب المشروع", en: "Project Owner", tr: "Proje Sahibi" },
  university: { ar: "الجامعة", en: "University", tr: "Üniversite" },
  location: { ar: "الموقع", en: "Location", tr: "Konum" },
  services: { ar: "المنتجات والخدمات", en: "Products & Services", tr: "Ürünler ve Hizmetler" },
  contactVia: { ar: "تواصل عبر", en: "Contact via", tr: "İletişim" },
  visitWebsite: { ar: "زيارة الموقع", en: "Visit Website", tr: "Web Sitesini Ziyaret Et" },
  gallery: { ar: "معرض الصور", en: "Gallery", tr: "Galeri" },
  submitSection: {
    title: { ar: "هل لديك مشروع؟", en: "Got a Project?", tr: "Projeniz mi Var?" },
    desc: {
      ar: "سجّل مشروعك الآن واظهر بشكل احترافي أمام مئات الطلاب والزوار",
      en: "Register your project now and appear professionally to hundreds of students and visitors.",
      tr: "Projenizi şimdi kaydedin ve yüzlerce öğrenci ve ziyaretçi karşısında profesyonel görünün.",
    },
    button: { ar: "سجّل مشروعك", en: "Register Your Project", tr: "Projenizi Kaydedin" },
  },
  form: {
    title: { ar: "تسجيل مشروع جديد", en: "Register a New Project", tr: "Yeni Proje Kaydet" },
    subtitle: {
      ar: "سيتم مراجعة طلبك من قِبل الفريق ثم التواصل معك عبر الهاتف",
      en: "Your request will be reviewed by the team and we will contact you by phone.",
      tr: "Başvurunuz ekip tarafından incelenecek ve telefonla sizinle iletişime geçilecektir.",
    },
    fullName: { ar: "الاسم الكامل", en: "Full Name", tr: "Ad Soyad" },
    university: { ar: "الجامعة / المؤسسة", en: "University / Institution", tr: "Üniversite / Kurum" },
    phone: { ar: "رقم الهاتف (مطلوب للتواصل)", en: "Phone Number (required for contact)", tr: "Telefon Numarası (iletişim için gerekli)" },
    email: { ar: "البريد الإلكتروني (اختياري)", en: "Email (optional)", tr: "E-posta (isteğe bağlı)" },
    category: { ar: "الفئة", en: "Category", tr: "Kategori" },
    nameAr: { ar: "اسم المشروع (عربي)", en: "Project Name (Arabic)", tr: "Proje Adı (Arapça)" },
    nameEn: { ar: "اسم المشروع (إنجليزي)", en: "Project Name (English)", tr: "Proje Adı (İngilizce)" },
    nameTr: { ar: "اسم المشروع (تركي)", en: "Project Name (Turkish)", tr: "Proje Adı (Türkçe)" },
    descAr: { ar: "وصف المشروع (عربي)", en: "Project Description (Arabic)", tr: "Proje Açıklaması (Arapça)" },
    descEn: { ar: "وصف المشروع (إنجليزي)", en: "Project Description (English)", tr: "Proje Açıklaması (İngilizce)" },
    descTr: { ar: "وصف المشروع (تركي)", en: "Project Description (Turkish)", tr: "Proje Açıklaması (Türkçe)" },
    instagram: { ar: "حساب إنستغرام", en: "Instagram Handle", tr: "Instagram Hesabı" },
    whatsapp: { ar: "رقم واتساب", en: "WhatsApp Number", tr: "WhatsApp Numarası" },
    website: { ar: "الموقع الإلكتروني", en: "Website URL", tr: "Web Sitesi" },
    location: { ar: "الموقع / المنطقة", en: "Location / Area", tr: "Konum / Bölge" },
    images: { ar: "صور المشروع (حتى 5 صور)", en: "Project Images (up to 5)", tr: "Proje Görselleri (en fazla 5)" },
    agreeTerms: {
      ar: "أوافق على مراجعة الطلب من قِبل الفريق قبل النشر",
      en: "I agree to have my request reviewed by the team before publishing.",
      tr: "Yayınlanmadan önce başvurumun ekip tarafından incelenmesini kabul ediyorum.",
    },
    submit: { ar: "إرسال الطلب", en: "Submit Request", tr: "Başvuruyu Gönder" },
    submitting: { ar: "جارٍ الإرسال…", en: "Submitting…", tr: "Gönderiliyor…" },
    success: {
      ar: "تم إرسال طلبك بنجاح! سيتواصل معك الفريق قريباً عبر رقم هاتفك.",
      en: "Your request was submitted! The team will contact you soon via your phone number.",
      tr: "Başvurunuz gönderildi! Ekip yakında telefon numaranız aracılığıyla sizinle iletişime geçecek.",
    },
    error: {
      ar: "حدث خطأ أثناء الإرسال. حاول مرة أخرى.",
      en: "An error occurred. Please try again.",
      tr: "Bir hata oluştu. Lütfen tekrar deneyin.",
    },
    requiredField: { ar: "هذا الحقل مطلوب", en: "This field is required", tr: "Bu alan zorunludur" },
    mustAgree: { ar: "يجب الموافقة على الشروط", en: "You must agree to the terms", tr: "Şartları kabul etmeniz gerekiyor" },
  },
  admin: {
    hub: { ar: "إدارة مشاريع الطلاب", en: "Student Projects Management", tr: "Öğrenci Projeleri Yönetimi" },
    submissions: { ar: "الطلبات الواردة", en: "Submissions", tr: "Başvurular" },
    projects: { ar: "المشاريع المنشورة", en: "Published Projects", tr: "Yayınlanan Projeler" },
    categories: { ar: "الفئات", en: "Categories", tr: "Kategoriler" },
    pendingSubmissions: { ar: "طلبات قيد المراجعة", en: "Pending Submissions", tr: "Bekleyen Başvurular" },
    totalProjects: { ar: "إجمالي المشاريع", en: "Total Projects", tr: "Toplam Projeler" },
    featuredProjects: { ar: "المشاريع المميزة", en: "Featured Projects", tr: "Öne Çıkan Projeler" },
    approve: { ar: "قبول ونشر", en: "Approve & Publish", tr: "Onayla ve Yayınla" },
    reject: { ar: "رفض", en: "Reject", tr: "Reddet" },
    contactStudent: { ar: "تواصل مع الطالب", en: "Contact Student", tr: "Öğrenciyle İletişim" },
    contactViaWhatsApp: { ar: "واتساب", en: "WhatsApp", tr: "WhatsApp" },
    contactViaPhone: { ar: "اتصال", en: "Call", tr: "Ara" },
    addManually: { ar: "إضافة مشروع يدوياً", en: "Add Project Manually", tr: "Manuel Proje Ekle" },
    editProject: { ar: "تعديل المشروع", en: "Edit Project", tr: "Projeyi Düzenle" },
    deleteProject: { ar: "حذف المشروع", en: "Delete Project", tr: "Projeyi Sil" },
    hideProject: { ar: "إخفاء", en: "Hide", tr: "Gizle" },
    showProject: { ar: "إظهار", en: "Show", tr: "Göster" },
    markFeatured: { ar: "تمييز", en: "Feature", tr: "Öne Çıkar" },
    unmarkFeatured: { ar: "إلغاء التمييز", en: "Unfeature", tr: "Öne Çıkarmayı Kaldır" },
    status: {
      pending: { ar: "قيد الانتظار", en: "Pending", tr: "Beklemede" },
      approved: { ar: "منشور", en: "Published", tr: "Yayınlandı" },
      rejected: { ar: "مرفوض", en: "Rejected", tr: "Reddedildi" },
      hidden: { ar: "مخفي", en: "Hidden", tr: "Gizli" },
    },
    adminNote: { ar: "ملاحظة داخلية", en: "Internal Note", tr: "Dahili Not" },
    noSubmissions: { ar: "لا توجد طلبات بعد", en: "No submissions yet", tr: "Henüz başvuru yok" },
    noProjects: { ar: "لا توجد مشاريع بعد", en: "No projects yet", tr: "Henüz proje yok" },
    saveSuccess: { ar: "تم الحفظ بنجاح", en: "Saved successfully", tr: "Başarıyla kaydedildi" },
    deleteConfirm: { ar: "هل أنت متأكد من الحذف؟", en: "Are you sure you want to delete?", tr: "Silmek istediğinize emin misiniz?" },
  },
};
