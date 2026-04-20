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
    ourStudents: { ar: "طلابنا المتميزون", en: "Our Outstanding Students", tr: "Başarılı Öğrencilerimiz" },
    ourIcons: { ar: "رموزنا", en: "Our Icons", tr: "İkonlarımız" },
    achievements: { ar: "إنجازات الاتحاد", en: "Union Achievements", tr: "Birlik Başarıları" },
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
