import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon } from 'lucide-react';
import logo from '@/assets/logo.png';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { navbarText } from '@/i18n/pages';

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
        { path: '/about-istanbul', key: 'aboutIstanbul' as const },
        { path: '/about-yemen', key: 'aboutYemen' as const },
        { path: '/universities', key: 'universities' as const },
        { path: '/students', key: 'ourStudents' as const },
        { path: '/icons', key: 'ourIcons' as const },
        { path: '/achievements', key: 'achievements' as const },
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
                    maxWidth: '1980px',
                    margin: '0 auto',
                    padding: '0 clamp(12px, 4vw, 40px)',
                    height: '70px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                }}>

                    {/* Logo - Responsive */}
                    <a
                        href="#"
                        onClick={(e) => { navigate('/'); e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            textDecoration: 'none',
                            flexShrink: 1,
                            minWidth: 0,
                        }}
                    >
                        <div style={{
                            width: 'clamp(32px, 8vw, 42px)',
                            height: 'clamp(32px, 8vw, 42px)',
                            borderRadius: '10px',
                            background: transparent ? 'rgba(255,255,255,0.13)' : isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.06)',
                            border: `1px solid ${transparent ? 'rgba(255,255,255,0.25)' : isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '5px',
                            transition: 'all 0.35s ease',
                        }}>
                            <img src={logo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>

                        {/* Hide text on very small screens, show on tablets and up */}
                        <div style={{
                            lineHeight: 1.2,
                            minWidth: 0,
                            display: 'flex',
                            flexDirection: 'column',
                        }}>
                            <div style={{
                                fontSize: 'clamp(0.85rem, 4vw, 1.25rem)',
                                fontWeight: 600,
                                display: 'flex',
                                flexDirection: 'column',
                                whiteSpace: 'nowrap'
                            }}>
                                {navbarText.unionName[lang]}
                            </div>
                            <div style={{
                                fontSize: 'clamp(0.65rem, 3vw, 0.73rem)',
                                color: transparent ? 'rgba(255,255,255,0.55)' : isDark ? 'rgba(237,234,228,0.45)' : 'rgba(26,18,8,0.55)',
                                whiteSpace: 'nowrap'
                            }}>
                                {navbarText.branchName[lang]}
                            </div>
                        </div>
                    </a>

                    {/* Desktop Navigation - Hidden on mobile */}
                    <ul className="hidden md:flex items-center gap-1" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                        {infoLinks.map((link) => {
                            const active = isActive(link.path);
                            return (
                                <li key={link.path}>
                                    <button
                                        onClick={() => navigate(link.path)}
                                        style={{
                                            padding: '6px 10px',
                                            borderRadius: '8px',
                                            fontSize: '0.8rem',
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
                                        {navbarText.links[link.key][lang]}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>

                    {/* Right Controls - Responsive */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>

                        {/* Language Switcher - Compact on mobile */}
                        <div style={{
                            display: 'flex',
                            background: ctrlBg,
                            border: `1px solid ${ctrlBorder}`,
                            borderRadius: '8px',
                            overflow: 'hidden',
                        }}>
                            {(['ar', 'en', 'tr'] as const).map(l => (
                                <button
                                    key={l}
                                    onClick={() => setLang(l)}
                                    style={{
                                        padding: 'clamp(4px, 2vw, 6px) clamp(8px, 3vw, 12px)',
                                        fontSize: 'clamp(0.65rem, 2.5vw, 0.72rem)',
                                        fontWeight: 700,
                                        letterSpacing: '0.04em',
                                        background: lang === l ? '#7a1c1c' : 'transparent',
                                        color: lang === l ? '#fff' : (transparent ? '#fff' : linkText),
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {l.toUpperCase()}
                                </button>
                            ))}
                        </div>

                        {/* Theme Toggle - Smaller on mobile */}
                        <button
                            onClick={toggleTheme}
                            style={{
                                width: 'clamp(34px, 8vw, 38px)',
                                height: 'clamp(34px, 8vw, 38px)',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: ctrlBg,
                                border: `1px solid ${ctrlBorder}`,
                                color: transparent ? '#fff' : (isDark ? '#edeae4' : '#1a1208'),
                                cursor: 'pointer',
                                flexShrink: 0,
                            }}
                        >
                            {isDark ? <Moon size={16} /> : <Sun size={16} />}
                        </button>

                        {/* Register Button - Hide on small mobile, show on tablet */}
                        <button
                            onClick={() => navigate('/login')}
                            className="hidden sm:block"
                            style={{
                                padding: '8px 14px',
                                borderRadius: '8px',
                                background: '#7a1c1c',
                                color: '#ffffff',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                border: 'none',
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                                boxShadow: '0 4px 14px rgba(122,28,28,0.35)',
                            }}
                        >
                            {navbarText.buttons.register[lang]}
                        </button>

                        {/* Hamburger - Slightly smaller on mobile */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden"
                            style={{
                                width: 'clamp(38px, 9vw, 42px)',
                                height: 'clamp(38px, 9vw, 42px)',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: mobileMenuOpen ? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)') : ctrlBg,
                                border: `1px solid ${ctrlBorder}`,
                                color: transparent ? '#fff' : (isDark ? '#edeae4' : '#1a1208'),
                                cursor: 'pointer',
                                flexShrink: 0,
                            }}
                        >
                            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Drawer - Improved for better UX */}
            <div
                dir={lang === 'ar' ? 'rtl' : 'ltr'}
                style={{
                    position: 'fixed',
                    top: '70px',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 40,
                    background: mobBg,
                    borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                    boxShadow: isDark ? '0 20px 50px rgba(0,0,0,0.7)' : '0 15px 40px rgba(0,0,0,0.15)',
                    transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(100%)',
                    transition: 'transform 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
                    overflowY: 'auto',
                    visibility: mobileMenuOpen ? 'visible' : 'hidden',
                }}
            >
                <div style={{
                    padding: '20px clamp(16px, 5vw, 24px) 30px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    minHeight: 'calc(100vh - 70px)',
                }}>
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
                                    padding: '14px 18px',
                                    borderRadius: '12px',
                                    fontSize: '1rem',
                                    fontWeight: 500,
                                    color: active ? '#c8a84b' : mobLinkText,
                                    background: active ? 'rgba(200,168,75,0.12)' : 'transparent',
                                    textAlign: lang === 'ar' ? 'right' : 'left',
                                    border: active ? '1px solid rgba(200,168,75,0.25)' : 'none',
                                    width: '100%',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                {navbarText.links[link.key][lang]}
                            </button>
                        );
                    })}

                    <div style={{ height: '1px', background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)', margin: '20px 8px 16px' }} />

                    {/* Mobile Action Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '8px' }}>
                        {/* Register Button - Visible on mobile */}
                        <button
                            onClick={() => {
                                navigate('/login');
                                setMobileMenuOpen(false);
                            }}
                            style={{
                                width: '100%',
                                padding: '15px',
                                borderRadius: '12px',
                                background: '#7a1c1c',
                                color: '#ffffff',
                                fontWeight: 700,
                                fontSize: '1rem',
                                border: 'none',
                                cursor: 'pointer',
                                boxShadow: '0 6px 20px rgba(122,28,28,0.45)',
                            }}
                        >
                            {navbarText.buttons.joinNow[lang]}
                        </button>

                        {/* Theme Toggle for Mobile */}
                        <button
                            onClick={toggleTheme}
                            style={{
                                width: '100%',
                                padding: '14px',
                                borderRadius: '12px',
                                background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)'}`,
                                color: isDark ? '#edeae4' : '#1a1208',
                                fontWeight: 600,
                                fontSize: '0.95rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                cursor: 'pointer',
                            }}
                        >
                            {isDark ? <Moon size={18} /> : <Sun size={18} />}
                            <span>{isDark ? (lang === 'ar' ? 'الوضع المضيء' : 'Light Mode') : (lang === 'ar' ? 'الوضع المظلم' : 'Dark Mode')}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Overlay when mobile menu is open */}
            {mobileMenuOpen && (
                <div
                    onClick={() => setMobileMenuOpen(false)}
                    style={{
                        position: 'fixed',
                        top: '70px',
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.5)',
                        zIndex: 39,
                        backdropFilter: 'blur(4px)',
                    }}
                />
            )}
        </>
    );
};