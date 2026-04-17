import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon } from 'lucide-react';
import logo from '@/assets/logo.png';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';

export const Navbar: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    const { language: lang, setLanguage: setLang } = useLanguage();
    const isDark = theme === 'dark';

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    // Close mobile menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    // Scroll detection
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const infoLinks = [
        { path: '/about-istanbul', ar: 'عن إسطنبول', en: 'About Istanbul' },
        { path: '/about-yemen', ar: 'عن اليمن', en: 'About Yemen' },
        { path: '/universities', ar: 'جامعات إسطنبول', en: 'Universities' },
        { path: '/students', ar: 'طلابنا المتميزون', en: 'Our Students' },
        { path: '/icons', ar: 'رموزنا', en: 'Our Icons' },
        { path: '/achievements', ar: 'إنجازات الاتحاد', en: 'Achievements' },
    ];

    const isActive = (path: string) =>
        location.pathname === path || location.pathname.startsWith(path + '/');

    // Transparent only when dark + not scrolled
    const transparent = isDark && !scrolled;

    // ── Color tokens ─────────────────────────────────────────────────────────
    const navBg = transparent ? 'transparent' : isDark ? 'rgba(8,8,12,0.96)' : '#ffffff';
    const navBlur = transparent ? 'none' : 'blur(20px) saturate(180%)';
    const navBorder = transparent ? 'transparent' : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

    const primaryText = transparent ? '#ffffff' : isDark ? '#edeae4' : '#1a1208';
    const linkText = transparent ? 'rgba(255,255,255,0.80)' : isDark ? 'rgba(237,234,228,0.75)' : 'rgba(26,18,8,0.75)';
    const linkHoverText = isDark ? '#edeae4' : '#1a1208';
    const linkHoverBg = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.06)';

    const ctrlBg = transparent ? 'rgba(255,255,255,0.12)' : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
    const ctrlBorder = transparent ? 'rgba(255,255,255,0.18)' : isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.12)';

    const mobBg = isDark ? '#0a0a0f' : '#ffffff';
    const mobLinkText = isDark ? '#e5e0d8' : '#2a2118';

    return (
        <>
            <nav
                id="navbar"
                dir={lang === 'ar' ? 'rtl' : 'ltr'}
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 50,
                    background: navBg,
                    backdropFilter: navBlur,
                    WebkitBackdropFilter: navBlur,
                    borderBottom: `1px solid ${navBorder}`,
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
            >
                <div style={{
                    maxWidth: '1280px',
                    margin: '0 auto',
                    padding: '0 clamp(16px, 5vw, 40px)',
                    height: '70px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>

                    {/* Logo */}
                    <a
                        href="#"
                        onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            textDecoration: 'none',
                            flexShrink: 0,
                        }}
                    >
                        <div style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '12px',
                            background: transparent ? 'rgba(255,255,255,0.13)' : isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.06)',
                            border: `1px solid ${transparent ? 'rgba(255,255,255,0.25)' : isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '7px',
                            transition: 'all 0.35s ease',
                        }}>
                            <img src={logo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>

                        <div style={{ lineHeight: 1.25, minWidth: 0 }}>
                            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: primaryText, whiteSpace: 'nowrap' }}>
                                <span className="ar-only">اتحاد الطلاب اليمنيين</span>
                                <span className="en-only">Yemeni Students Union</span>
                            </div>
                            <div style={{
                                fontSize: '0.73rem',
                                color: transparent ? 'rgba(255,255,255,0.55)' : isDark ? 'rgba(237,234,228,0.45)' : 'rgba(26,18,8,0.55)',
                                whiteSpace: 'nowrap'
                            }}>
                                <span className="ar-only">فرع إسطنبول · تركيا</span>
                                <span className="en-only">Istanbul Branch · Turkey</span>
                            </div>
                        </div>
                    </a>

                    {/* Desktop Navigation */}
                    <ul className="hidden lg:flex items-center gap-1" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                        {infoLinks.map((link) => {
                            const active = isActive(link.path);
                            return (
                                <li key={link.path}>
                                    <button
                                        onClick={() => navigate(link.path)}
                                        style={{
                                            padding: '8px 14px',
                                            borderRadius: '10px',
                                            fontSize: '0.875rem',
                                            fontWeight: 500,
                                            color: active ? '#c8a84b' : linkText,
                                            background: active ? 'rgba(200,168,75,0.15)' : 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            whiteSpace: 'nowrap',
                                            transition: 'all 0.2s ease',
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!active) {
                                                e.currentTarget.style.color = linkHoverText;
                                                e.currentTarget.style.background = linkHoverBg;
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!active) {
                                                e.currentTarget.style.color = linkText;
                                                e.currentTarget.style.background = 'transparent';
                                            }
                                        }}
                                    >
                                        <span className="ar-only">{link.ar}</span>
                                        <span className="en-only">{link.en}</span>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>

                    {/* Right Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

                        {/* Language Switcher */}
                        <div style={{
                            display: 'flex',
                            background: ctrlBg,
                            border: `1px solid ${ctrlBorder}`,
                            borderRadius: '10px',
                            overflow: 'hidden',
                        }}>
                            {(['ar', 'en'] as const).map(l => (
                                <button
                                    key={l}
                                    onClick={() => setLang(l)}
                                    style={{
                                        padding: '6px 12px',
                                        fontSize: '0.72rem',
                                        fontWeight: 700,
                                        letterSpacing: '0.04em',
                                        background: lang === l ? '#7a1c1c' : 'transparent',
                                        color: lang === l ? '#fff' : (transparent ? '#fff' : linkText),
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {l.toUpperCase()}
                                </button>
                            ))}
                        </div>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: ctrlBg,
                                border: `1px solid ${ctrlBorder}`,
                                color: transparent ? '#fff' : (isDark ? '#edeae4' : '#1a1208'),
                                cursor: 'pointer',
                            }}
                        >
                            {isDark ? <Moon size={16} /> : <Sun size={16} />}
                        </button>

                        {/* Register Button - Desktop only */}
                        <button
                            onClick={() => navigate('/login')}
                            className="hidden sm:block"
                            style={{
                                padding: '9px 20px',
                                borderRadius: '10px',
                                background: '#7a1c1c',
                                color: '#ffffff',
                                fontSize: '0.85rem',
                                fontWeight: 600,
                                border: 'none',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                boxShadow: '0 4px 14px rgba(122,28,28,0.35)',
                            }}
                        >
                            <span className="ar-only">سجل الآن</span>
                            <span className="en-only">Register</span>
                        </button>

                        {/* Hamburger */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden"
                            style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: mobileMenuOpen ? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)') : ctrlBg,
                                border: `1px solid ${ctrlBorder}`,
                                color: transparent ? '#fff' : (isDark ? '#edeae4' : '#1a1208'),
                            }}
                        >
                            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Drawer */}
            <div
                dir={lang === 'ar' ? 'rtl' : 'ltr'}
                style={{
                    position: 'fixed',
                    top: '70px',
                    left: 0,
                    right: 0,
                    zIndex: 40,
                    background: mobBg,
                    borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                    boxShadow: isDark ? '0 20px 50px rgba(0,0,0,0.7)' : '0 15px 40px rgba(0,0,0,0.15)',
                    maxHeight: mobileMenuOpen ? 'calc(100vh - 70px)' : '0',
                    opacity: mobileMenuOpen ? 1 : 0,
                    overflow: 'hidden',
                    transition: 'all 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
                }}
            >
                <div style={{ padding: '20px 18px 28px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {infoLinks.map((link) => {
                        const active = isActive(link.path);
                        return (
                            <button
                                key={link.path}
                                onClick={() => {
                                    navigate(link.path);
                                    setMobileMenuOpen(false);
                                }}
                                style={{
                                    padding: '14px 16px',
                                    borderRadius: '12px',
                                    fontSize: '0.95rem',
                                    fontWeight: 500,
                                    color: active ? '#c8a84b' : mobLinkText,
                                    background: active ? 'rgba(200,168,75,0.12)' : 'transparent',
                                    textAlign: lang === 'ar' ? 'right' : 'left',
                                    border: active ? '1px solid rgba(200,168,75,0.25)' : 'none',
                                    width: '100%',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                <span className="ar-only">{link.ar}</span>
                                <span className="en-only">{link.en}</span>
                            </button>
                        );
                    })}

                    <div style={{ height: '1px', background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', margin: '16px 8px' }} />

                    {/* Mobile bottom controls */}
                    <div style={{ display: 'flex', gap: '10px', paddingTop: '8px' }}>
                        {/* <button
                            onClick={toggleTheme}
                            style={{
                                flex: 1,
                                padding: '14px',
                                borderRadius: '12px',
                                background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`,
                                color: isDark ? '#edeae4' : '#1a1208',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                            }}
                        >
                            {isDark ? <Moon size={18} /> : <Sun size={18} />}
                            <span>{isDark ? (lang === 'ar' ? 'الوضع المضيء' : 'Light') : (lang === 'ar' ? 'الوضع المظلم' : 'Dark')}</span>
                        </button> */}

                        <button
                            onClick={() => {
                                navigate('/login');
                                setMobileMenuOpen(false);
                            }}
                            style={{
                                flex: 1.6,
                                padding: '14px',
                                borderRadius: '12px',
                                background: '#7a1c1c',
                                color: '#ffffff',
                                fontWeight: 700,
                                fontSize: '0.96rem',
                                boxShadow: '0 6px 20px rgba(122,28,28,0.45)',
                            }}
                        >
                            <span className="ar-only">سجل واحصل على العضوية</span>
                            <span className="en-only">Join Now - Free</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};