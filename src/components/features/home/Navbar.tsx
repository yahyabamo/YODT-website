
import React from 'react';
import { useNavigate } from 'react-router-dom';

// ... inside the component function

interface NavbarProps {
    lang: string;
    setLang: (lang: string) => void;
    isDark: boolean;
    toggleTheme: () => void;
    mobileMenuOpen: boolean;
    toggleMobileMenu: () => void;
    closeMobileMenu: () => void;
    onOpenModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
    lang,
    setLang,
    isDark,
    toggleTheme,
    mobileMenuOpen,
    toggleMobileMenu,
    closeMobileMenu,
    onOpenModal,
}) => {
    const navigate = useNavigate();
    return (
        <>
            {/* ═══════════════════════════════════════
           NAVBAR
      ═══════════════════════════════════════ */}
            <nav id="navbar">
                <div className="nav-inner">
                    {/* Logo */}
                    <a href="#" className="nav-logo">
                        <div className="logo-mark">
                            <img
                                src="src/assets/logo.png"
                                alt="Yemeni Students Union"
                                className="h-8 w-auto mr-2 rtl:ml-2 rtl:mr-0"
                            />
                        </div>
                        <div className="logo-text">
                            <span className="logo-text-main ar-only">اتحاد الطلاب اليمنيين</span>
                            <span className="logo-text-main en-only">Yemeni Students Union</span>
                            <span className="logo-text-sub ar-only">فرع إسطنبول · تركيا</span>
                            <span className="logo-text-sub en-only">Istanbul Branch · Turkey</span>
                        </div>
                    </a>

                    {/* Desktop Nav Links */}
                    <ul className="nav-links">
                        <li><a href="#about" className="ar-only">من نحن</a><a href="#about" className="en-only">About</a></li>
                        <li><a href="#guide" className="ar-only">الدليل الطلابي</a><a href="#guide" className="en-only">Student Guide</a></li>
                        <li><a href="#activities" className="ar-only">الأنشطة</a><a href="#activities" className="en-only">Activities</a></li>
                        <li><a href="#discounts" className="ar-only">العروض الخاصة</a><a href="#discounts" className="en-only">Discounts</a></li>
                        <li><a href="#stats" className="ar-only">الإحصائيات</a><a href="#stats" className="en-only">Stats</a></li>
                    </ul>

                    {/* Controls */}
                    <div className="nav-controls">
                        <div className="lang-switch">
                            <button
                                className={`lang-btn ${lang === 'ar' ? 'active' : ''}`}
                                onClick={() => setLang('ar')}
                                id="btn-ar"
                            >
                                AR
                            </button>
                            <button
                                className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
                                onClick={() => setLang('en')}
                                id="btn-en"
                            >
                                EN
                            </button>
                        </div>
                        <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
                            {isDark ? '🌙' : '☀️'}
                        </button>
                        <div className="nav-cta">
                            <button
                                className="btn btn-primary"
                                onClick={() => {
                                    navigate('/login');
                                    closeMobileMenu();
                                }}
                            >
                                <span className="ar-only">سجل واحصل على عضويتك الآن</span>
                                <span className="en-only">Register Free Membership</span>
                            </button>
                        </div>
                        <div className="hamburger" onClick={toggleMobileMenu}>
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            <div className={`mobile-nav ${mobileMenuOpen ? 'open' : ''}`} id="mobile-nav">
                <a href="#about" onClick={closeMobileMenu}><span className="ar-only">من نحن</span><span className="en-only">About</span></a>
                <a href="#guide" onClick={closeMobileMenu}><span className="ar-only">الدليل الطلابي</span><span className="en-only">Student Guide</span></a>
                <a href="#activities" onClick={closeMobileMenu}><span className="ar-only">الأنشطة</span><span className="en-only">Activities</span></a>
                <a href="#discounts" onClick={closeMobileMenu}><span className="ar-only">العروض الخاصة</span><span className="en-only">Discounts</span></a>
                <a href="#stats" onClick={closeMobileMenu}><span className="ar-only">الإحصائيات</span><span className="en-only">Stats</span></a>
                <button className="btn btn-primary" onClick={() => { onOpenModal(); closeMobileMenu(); }}>
                    <span className="ar-only">سجل واحصل على عضويتك الآن</span>
                    <span className="en-only">Register Free Membership</span>
                </button>
            </div>
        </>
    );
};
