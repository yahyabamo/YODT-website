import React, { createContext, useContext, useEffect, useState } from 'react';

type Language = 'ar' | 'en' | 'tr';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    toggleLanguage: () => void;
    t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
    ar: {
        'home.greeting.morning': 'اهلا وسهلا ',
        'home.greeting.afternoon': 'اهلا وسهلا ',
        'home.greeting.evening': 'اهلا وسهلا ',
        'home.points': 'نقطة',
        'home.sections.title': 'الأقسام الرئيسية',
        'home.wisdom': 'حكمة اليوم',
        'home.wisdom.text': 'العلم نور والجهل ظلام، فاسعَ للنور دائماً',
        'home.services.title': 'خدمات أخرى',
        'home.points.card.title': 'نقاطك',
        'nav.home': 'الرئيسية',
        'nav.activities': 'الانشطة',
        'nav.reels': 'فيديو',
        'nav.settings': 'حسابي',
        'nav.desc.home': 'لوحتك اليومية',
        'nav.desc.activities': 'الأنشطة',
        'nav.desc.reels': 'فيديو',
        'nav.desc.settings': 'الملف والإعدادات',
    },
    en: {
        'home.greeting.morning': 'Good Morning',
        'home.greeting.afternoon': 'Good Afternoon',
        'home.greeting.evening': 'Good Evening',
        'home.points': 'Points',
        'home.sections.title': 'Main Sections',
        'home.wisdom': 'Wisdom of the Day',
        'home.wisdom.text': 'Knowledge is light and ignorance is darkness, so always strive for light',
        'home.services.title': 'Quick Services',
        'home.points.card.title': 'Your Points',
        'nav.home': 'Home',
        'nav.activities': 'Activities',
        'nav.reels': 'Reels',
        'nav.settings': 'Profile',
        'nav.desc.home': 'Daily Dashboard',
        'nav.desc.activities': 'Activities',
        'nav.desc.reels': 'Visual Content',
        'nav.desc.settings': 'Profile & Settings',
    },
    tr: {
        'home.greeting.morning': 'Günaydın',
        'home.greeting.afternoon': 'Tünaydın',
        'home.greeting.evening': 'İyi Akşamlar',
        'home.points': 'Puan',
        'home.sections.title': 'Ana Bölümler',
        'home.wisdom': 'Günün Sözü',
        'home.wisdom.text': 'Bilgi ışıktır ve cehalet karanlıktır, her zaman aydınlık için çabalayın',
        'home.services.title': 'Hızlı Servisler',
        'home.points.card.title': 'Puanlarınız',
        'nav.home': 'Ana Sayfa',
        'nav.activities': 'Etkinlikler',
        'nav.reels': 'Videolar',
        'nav.settings': 'Profil',
        'nav.desc.home': 'Günlük Pano',
        'nav.desc.activities': 'Etkinlikler',
        'nav.desc.reels': 'Görsel İçerik',
        'nav.desc.settings': 'Profil ve Ayarlar',
    }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const [language, setLanguageState] = useState<Language>(() => {
        const savedLang = localStorage.getItem('lang-preference') as Language;
        if (savedLang) {
            return savedLang;
        }
        return 'ar';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        root.setAttribute('lang', language);
        root.setAttribute('data-lang', language);
        root.setAttribute('dir', language === 'ar' ? 'rtl' : 'ltr');
    }, [language]);

    const setLanguage = (newLanguage: Language) => {
        setLanguageState(newLanguage);
        localStorage.setItem('lang-preference', newLanguage);
    };

    const toggleLanguage = () => {
        if (language === 'ar') setLanguage('en');
        else if (language === 'en') setLanguage('tr');
        else setLanguage('ar');
    };

    const t = (key: string): string => {
        return translations[language][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
