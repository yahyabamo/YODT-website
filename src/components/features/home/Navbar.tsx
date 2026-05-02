import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Sun, Moon, ChevronRight } from 'lucide-react';
import logo from '@/assets/logo.png';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { navbarText } from '@/i18n/pages';
import { PatternDivider } from '@/components/PatternDivider';

export const Navbar: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    const { language: lang, setLanguage: setLang } = useLanguage();
    const isDark = theme === 'dark';

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => { setMobileMenuOpen(false); }, [location.pathname]);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    // Lock body scroll when drawer is open
    useEffect(() => {
        document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [mobileMenuOpen]);

    const infoLinks = [
        { path: '/about-istanbul', key: 'aboutIstanbul' as const },
        { path: '/about-yemen', key: 'aboutYemen' as const },
        { path: '/universities', key: 'universities' as const },
        { path: '/students', key: 'ourStudents' as const },
        { path: '/store', key: 'store' as const },
        { path: '/achievements', key: 'achievements' as const },
        { path: '/student-projects', key: 'studentProjects' as const },
    ];

    const isActive = (path: string) =>
        location.pathname === path || location.pathname.startsWith(path + '/');

    const transparent = isDark && !scrolled;

    // ── Color tokens ──────────────────────────────────────────────────────────
    const navBg = transparent ? 'transparent' : isDark ? 'rgba(8,8,12,0.96)' : '#ffffff';
    const navBlur = transparent ? 'none' : 'blur(20px) saturate(180%)';
    const navBorder = transparent ? 'transparent' : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

    const linkText = transparent ? 'rgba(255,255,255,0.80)' : isDark ? 'rgba(237,234,228,0.75)' : 'rgba(26,18,8,0.75)';
    const linkHoverText = isDark ? '#edeae4' : '#1a1208';
    const linkHoverBg = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.06)';

    const ctrlBg = transparent ? 'rgba(255,255,255,0.12)' : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
    const ctrlBorder = transparent ? 'rgba(255,255,255,0.18)' : isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.12)';
    const iconColor = transparent ? '#fff' : isDark ? '#edeae4' : '#1a1208';

    const mobBg = isDark ? '#0a0a0f' : '#ffffff';
    const mobText = isDark ? '#e5e0d8' : '#2a2118';
    const mobSubText = isDark ? 'rgba(229,224,216,0.45)' : 'rgba(42,33,24,0.5)';
    const mobDivider = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

    return (
        <>
            <nav
                id="navbar"
                dir={lang === 'ar' ? 'rtl' : 'ltr'}
                style={{
                    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
                    background: navBg,
                    backdropFilter: navBlur, WebkitBackdropFilter: navBlur,
                    borderBottom: `1px solid ${navBorder}`,
                    transition: 'all 0.4s cubic-bezier(0.4,0,0.2,1)',
                }}
            >
                <div style={{
                    maxWidth: '1980px', margin: '0 auto',
                    padding: '0 clamp(16px, 5vw, 40px)',
                    height: '64px',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>

                    {/* ── Logo ── */}
                    <a
                        href="#"
                        onClick={(e) => { navigate('/'); e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}
                    >
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '11px', flexShrink: 0,
                            background: transparent ? 'rgba(255,255,255,0.13)' : isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.06)',
                            border: `1px solid ${transparent ? 'rgba(255,255,255,0.25)' : isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '7px',
                            transition: 'all 0.35s ease',
                        }}>
                            <img src={logo} alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>

                        {/* Title: hidden on small mobile, shown from sm up */}
                        <div className="hidden sm:block" style={{ lineHeight: 1.25, minWidth: 0 }}>
                            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: transparent ? '#fff' : isDark ? '#edeae4' : '#1a1208' }}>
                                {navbarText.unionName[lang]}
                            </div>
                            <div style={{
                                fontSize: '0.70rem',
                                color: transparent ? 'rgba(255,255,255,0.55)' : isDark ? 'rgba(237,234,228,0.45)' : 'rgba(26,18,8,0.55)',
                                whiteSpace: 'nowrap',
                            }}>
                                {navbarText.branchName[lang]}
                            </div>
                        </div>
                    </a>

                    {/* ── Desktop nav links ── */}
                    <ul className="hidden lg:flex items-center gap-1" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                        {infoLinks.map((link) => {
                            const active = isActive(link.path);
                            return (
                                <li key={link.path}>
                                    <button
                                        onClick={() => navigate(link.path)}
                                        style={{
                                            padding: '8px 14px', borderRadius: '10px',
                                            fontSize: '0.875rem', fontWeight: 500,
                                            color: active ? '#c8a84b' : linkText,
                                            background: active ? 'rgba(200,168,75,0.15)' : 'transparent',
                                            border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                                            transition: 'all 0.2s ease',
                                        }}
                                        onMouseEnter={(e) => { if (!active) { e.currentTarget.style.color = linkHoverText; e.currentTarget.style.background = linkHoverBg; } }}
                                        onMouseLeave={(e) => { if (!active) { e.currentTarget.style.color = linkText; e.currentTarget.style.background = 'transparent'; } }}
                                    >
                                        {navbarText.links[link.key][lang]}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>

                    {/* ── Right controls ── */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

                        {/* Language switcher — desktop full, mobile compact */}
                        <div style={{
                            display: 'flex', background: ctrlBg,
                            border: `1px solid ${ctrlBorder}`, borderRadius: '10px', overflow: 'hidden',
                        }}>
                            {(['ar', 'en', 'tr'] as const).map(l => (
                                <button
                                    key={l}
                                    onClick={() => setLang(l)}
                                    style={{
                                        padding: '6px 10px', fontSize: '0.70rem', fontWeight: 700,
                                        letterSpacing: '0.04em',
                                        background: lang === l ? '#7a1c1c' : 'transparent',
                                        color: lang === l ? '#fff' : (transparent ? '#fff' : linkText),
                                        border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                                    }}
                                >
                                    {l.toUpperCase()}
                                </button>
                            ))}
                        </div>

                        {/* Theme toggle */}
                        <button
                            onClick={toggleTheme}
                            style={{
                                width: '38px', height: '38px', borderRadius: '10px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: ctrlBg, border: `1px solid ${ctrlBorder}`,
                                color: iconColor, cursor: 'pointer',
                            }}
                        >
                            {isDark ? <Moon size={16} /> : <Sun size={16} />}
                        </button>

                        {/* Register — desktop only */}
                        <button
                            onClick={() => navigate('/login')}
                            className="hidden lg:block"
                            style={{
                                padding: '9px 16px', borderRadius: '10px', background: '#7a1c1c',
                                color: '#ffffff', fontSize: '0.85rem', fontWeight: 600,
                                border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                                boxShadow: '0 4px 14px rgba(122,28,28,0.35)',
                            }}
                        >
                            {navbarText.buttons.register[lang]}
                        </button>

                        {/* Hamburger — mobile only */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="lg:hidden"
                            aria-label="Toggle menu"
                            style={{
                                width: '40px', height: '40px', borderRadius: '10px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: mobileMenuOpen ? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)') : ctrlBg,
                                border: `1px solid ${ctrlBorder}`,
                                color: iconColor, cursor: 'pointer',
                            }}
                        >
                            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                        </button>
                    </div>
                </div>
                {/* Signature Brand Divider */}

                {/* <PatternDivider
                    height={28}
                    variant="chevrons"        // zigzag pattern (yemen-pattern3.svg)
                    opacity={isDark ? 0.55 : 0.30}  // subtle — doesn't fight the nav content
                /> */}

            </nav>

            {/* ── Mobile: backdrop ── */}
            <div
                onClick={() => setMobileMenuOpen(false)}
                className="lg:hidden"
                style={{
                    position: 'fixed', inset: 0, zIndex: 38,
                    background: 'rgba(0,0,0,0.45)',
                    backdropFilter: 'blur(2px)',
                    opacity: mobileMenuOpen ? 1 : 0,
                    pointerEvents: mobileMenuOpen ? 'auto' : 'none',
                    transition: 'opacity 0.3s ease',
                }}
            />

            {/* ── Mobile: bottom sheet drawer ── */}
            <div
                dir={lang === 'ar' ? 'rtl' : 'ltr'}
                className="lg:hidden"
                style={{
                    position: 'fixed',
                    bottom: 0, left: 0, right: 0,
                    zIndex: 39,
                    background: mobBg,
                    borderTopLeftRadius: '24px',
                    borderTopRightRadius: '24px',
                    boxShadow: isDark
                        ? '0 -8px 40px rgba(0,0,0,0.7), 0 -1px 0 rgba(255,255,255,0.06)'
                        : '0 -8px 40px rgba(0,0,0,0.18), 0 -1px 0 rgba(0,0,0,0.06)',
                    transform: mobileMenuOpen ? 'translateY(0)' : 'translateY(110%)',
                    transition: 'transform 0.38s cubic-bezier(0.32, 0.72, 0, 1)',
                    maxHeight: '88vh',
                    overflowY: 'auto',
                    // Safe area for notched phones
                    paddingBottom: 'env(safe-area-inset-bottom, 16px)',
                }}
            >
                {/* Drag handle */}
                <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
                    <div style={{
                        width: '36px', height: '4px', borderRadius: '2px',
                        background: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.14)',
                    }} />
                </div>

                {/* Sheet header */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 20px 16px',
                }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: mobSubText, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        {lang === 'ar' ? 'التنقل' : lang === 'tr' ? 'Menü' : 'Navigation'}
                    </span>
                    <button
                        onClick={() => setMobileMenuOpen(false)}
                        style={{
                            width: '30px', height: '30px', borderRadius: '8px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                            border: 'none', color: mobText, cursor: 'pointer',
                        }}
                    >
                        <X size={14} />
                    </button>
                </div>

                {/* Nav links */}
                <div style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {infoLinks.map((link) => {
                        const active = isActive(link.path);
                        return (
                            <button
                                key={link.path}
                                onClick={() => { navigate(link.path); setMobileMenuOpen(false); }}
                                style={{
                                    padding: '13px 14px',
                                    borderRadius: '14px',
                                    fontSize: '0.95rem',
                                    fontWeight: active ? 700 : 500,
                                    color: active ? '#c8a84b' : mobText,
                                    background: active ? 'rgba(200,168,75,0.12)' : 'transparent',
                                    border: active ? '1px solid rgba(200,168,75,0.22)' : '1px solid transparent',
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    cursor: 'pointer',
                                    transition: 'all 0.15s ease',
                                    textAlign: lang === 'ar' ? 'right' : 'left',
                                }}
                            >
                                <span>{navbarText.links[link.key][lang]}</span>
                                <ChevronRight
                                    size={15}
                                    style={{
                                        color: active ? '#c8a84b' : mobSubText,
                                        transform: lang === 'ar' ? 'rotate(180deg)' : 'none',
                                        flexShrink: 0,
                                    }}
                                />
                            </button>
                        );
                    })}
                </div>

                {/* Divider */}
                <div style={{ height: '1px', background: mobDivider, margin: '16px 20px' }} />

                {/* Bottom action row */}
                <div style={{ padding: '0 12px 8px', display: 'flex', gap: '10px' }}>

                    {/* Theme toggle pill */}
                    <button
                        onClick={toggleTheme}
                        style={{
                            width: '52px', flexShrink: 0,
                            padding: '13px',
                            borderRadius: '14px',
                            background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                            color: mobText,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer',
                        }}
                    >
                        {isDark ? <Moon size={18} /> : <Sun size={18} />}
                    </button>

                    {/* Register CTA */}
                    <button
                        onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                        style={{
                            flex: 1,
                            padding: '13px',
                            borderRadius: '14px',
                            background: 'linear-gradient(135deg, #7a1c1c, #a02828)',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '0.95rem',
                            border: 'none',
                            cursor: 'pointer',
                            boxShadow: '0 6px 20px rgba(122,28,28,0.4)',
                            letterSpacing: '0.01em',
                        }}
                    >
                        {navbarText.buttons.joinNow[lang]}
                    </button>
                </div>
            </div>
        </>
    );
};