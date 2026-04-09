import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Sun, Moon } from 'lucide-react';
import logo from '@/assets/logo.png';

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
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 60);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { href: '#about', ar: 'من نحن', en: 'About' },
        { href: '#guide', ar: 'الدليل الطلابي', en: 'Student Guide' },
        { href: '#activities', ar: 'الأنشطة', en: 'Activities' },
        { href: '#discounts', ar: 'العروض', en: 'Discounts' },
    ];

    // ── Theme-aware style tokens ──────────────────────────────────────────────
    // Hero section is always dark, so at top (not scrolled) we always use
    // white text regardless of theme. Once scrolled, adapt to current theme.
    const scrolledBg = isDark
        ? 'rgba(0,0,0,0.88)'
        : 'rgba(245,240,235,0.94)';

    const logoBoxBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
    const logoBoxBorder = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.10)';

    // Text colors: at top = always white (over dark hero); scrolled = theme-aware
    const primaryText = scrolled
        ? isDark ? 'rgba(255,255,255,0.92)' : 'rgba(26,22,18,0.9)'
        : 'rgba(255,255,255,0.95)';

    const subtitleText = scrolled
        ? isDark ? 'rgba(255,255,255,0.40)' : 'rgba(26,22,18,0.45)'
        : 'rgba(255,255,255,0.45)';

    const linkText = scrolled
        ? isDark ? 'rgba(255,255,255,0.65)' : 'rgba(26,22,18,0.65)'
        : 'rgba(255,255,255,0.70)';

    const linkHoverBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

    const controlBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)';
    const controlBorder = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.10)';

    const iconColor = scrolled
        ? isDark ? 'rgba(255,255,255,0.65)' : 'rgba(26,22,18,0.65)'
        : 'rgba(255,255,255,0.70)';

    const borderColor = scrolled
        ? isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'
        : 'transparent';

    // Mobile menu
    const mobileBg = isDark ? 'rgba(7,8,11,0.97)' : 'rgba(245,240,235,0.97)';
    const mobileLinkText = isDark ? 'rgba(255,255,255,0.70)' : 'rgba(26,22,18,0.70)';
    const mobileLinkHoverBg = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';

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
                    transition: 'background 0.4s ease, box-shadow 0.4s ease, border-color 0.4s ease',
                    background: scrolled ? scrolledBg : 'transparent',
                    backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
                    WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
                    borderBottom: `1px solid ${borderColor}`,
                    boxShadow: scrolled
                        ? isDark
                            ? '0 4px 24px rgba(0,0,0,0.4)'
                            : '0 4px 20px rgba(0,0,0,0.08)'
                        : 'none',
                }}
            >
                <div style={{ maxWidth: '1260px', margin: '0 auto', padding: '0 clamp(20px, 4vw, 32px)', height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>

                    {/* Logo */}
                    <a
                        href="#"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0, textDecoration: 'none' }}
                    >
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '12px',
                            background: logoBoxBg, border: `1px solid ${logoBoxBorder}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: '6px', flexShrink: 0,
                            transition: 'background 0.3s ease, border-color 0.3s ease',
                        }}>
                            <img src={logo} alt="الاتحاد" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.25 }}>
                            <span style={{ fontWeight: 700, fontSize: '0.875rem', color: primaryText, transition: 'color 0.3s ease' }} className="ar-only">اتحاد الطلاب اليمنيين</span>
                            <span style={{ fontWeight: 700, fontSize: '0.875rem', color: primaryText, transition: 'color 0.3s ease' }} className="en-only">Yemeni Students Union</span>
                            <span style={{ fontSize: '11px', color: subtitleText, transition: 'color 0.3s ease' }} className="ar-only">فرع إسطنبول · تركيا</span>
                            <span style={{ fontSize: '11px', color: subtitleText, transition: 'color 0.3s ease' }} className="en-only">Istanbul Branch · Turkey</span>
                        </div>
                    </a>

                    {/* Desktop Nav Links */}
                    <ul style={{ display: 'flex', alignItems: 'center', gap: '4px', listStyle: 'none', margin: 0, padding: 0 }} className="hidden lg:flex">
                        {navLinks.map((link) => (
                            <li key={link.href}>
                                <a
                                    href={link.href}
                                    style={{ color: linkText, transition: 'color 0.2s ease, background 0.2s ease' }}
                                    className="navbar-link px-4 py-2 rounded-lg text-sm font-medium"
                                    onMouseEnter={e => {
                                        (e.currentTarget as HTMLElement).style.color = isDark ? 'rgba(255,255,255,0.95)' : 'rgba(26,22,18,0.95)';
                                        (e.currentTarget as HTMLElement).style.background = linkHoverBg;
                                    }}
                                    onMouseLeave={e => {
                                        (e.currentTarget as HTMLElement).style.color = linkText;
                                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                                    }}
                                >
                                    <span className="ar-only">{link.ar}</span>
                                    <span className="en-only">{link.en}</span>
                                </a>
                            </li>
                        ))}
                    </ul>

                    {/* Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {/* Language Switch */}
                        <div style={{
                            display: 'flex', alignItems: 'center',
                            background: controlBg, border: `1px solid ${controlBorder}`,
                            borderRadius: '10px', overflow: 'hidden',
                            transition: 'background 0.3s ease, border-color 0.3s ease',
                        }}>
                            <button
                                style={{
                                    padding: '6px 12px', fontSize: '0.72rem', fontWeight: 600,
                                    background: lang === 'ar' ? '#7a1c1c' : 'transparent',
                                    color: lang === 'ar' ? '#fff' : iconColor,
                                    transition: 'all 0.2s ease',
                                    border: 'none', cursor: 'pointer',
                                }}
                                onClick={() => setLang('ar')}
                                id="btn-ar"
                            >AR</button>
                            <button
                                style={{
                                    padding: '6px 12px', fontSize: '0.72rem', fontWeight: 600,
                                    background: lang === 'en' ? '#7a1c1c' : 'transparent',
                                    color: lang === 'en' ? '#fff' : iconColor,
                                    transition: 'all 0.2s ease',
                                    border: 'none', cursor: 'pointer',
                                }}
                                onClick={() => setLang('en')}
                                id="btn-en"
                            >EN</button>
                        </div>

                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            title="Toggle theme"
                            style={{
                                width: '36px', height: '36px', borderRadius: '10px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: controlBg, border: `1px solid ${controlBorder}`,
                                color: iconColor, cursor: 'pointer',
                                transition: 'all 0.3s ease',
                            }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.12)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = controlBg; }}
                        >
                            {isDark ? <Moon size={15} /> : <Sun size={15} />}
                        </button>

                        {/* CTA */}
                        <button
                            className="hidden sm:flex items-center gap-2"
                            style={{
                                padding: '8px 16px', borderRadius: '10px',
                                background: '#7a1c1c', color: '#fff',
                                fontSize: '0.875rem', fontWeight: 600,
                                boxShadow: '0 4px 14px rgba(122,28,28,0.35)',
                                transition: 'all 0.2s ease', border: 'none', cursor: 'pointer',
                            }}
                            onClick={() => { navigate('/login'); closeMobileMenu(); }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#8f2020'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#7a1c1c'; }}
                        >
                            <span className="ar-only">سجل الآن</span>
                            <span className="en-only">Register</span>
                        </button>

                        {/* Hamburger */}
                        <button
                            onClick={toggleMobileMenu}
                            className="lg:hidden"
                            style={{
                                width: '36px', height: '36px', borderRadius: '10px',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: controlBg, border: `1px solid ${controlBorder}`,
                                color: iconColor, cursor: 'pointer', transition: 'all 0.3s ease',
                            }}
                        >
                            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            <div
                dir={lang === 'ar' ? 'rtl' : 'ltr'}
                style={{
                    position: 'fixed', top: '72px', left: 0, right: 0, zIndex: 40,
                    background: mobileBg,
                    backdropFilter: 'blur(20px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                    borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.08)'}`,
                    transition: 'max-height 0.3s ease, opacity 0.3s ease',
                    maxHeight: mobileMenuOpen ? '400px' : '0',
                    opacity: mobileMenuOpen ? 1 : 0,
                    overflow: 'hidden',
                }}
            >
                <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {navLinks.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            onClick={closeMobileMenu}
                            style={{
                                padding: '12px 16px', borderRadius: '10px',
                                fontSize: '0.875rem', fontWeight: 500,
                                color: mobileLinkText, textDecoration: 'none',
                                transition: 'color 0.2s ease, background 0.2s ease',
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLElement).style.background = mobileLinkHoverBg;
                                (e.currentTarget as HTMLElement).style.color = isDark ? 'rgba(255,255,255,0.95)' : 'rgba(26,22,18,0.95)';
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLElement).style.background = 'transparent';
                                (e.currentTarget as HTMLElement).style.color = mobileLinkText;
                            }}
                        >
                            <span className="ar-only">{link.ar}</span>
                            <span className="en-only">{link.en}</span>
                        </a>
                    ))}
                    <button
                        style={{
                            marginTop: '8px', padding: '12px 16px', borderRadius: '10px',
                            background: '#7a1c1c', color: '#fff',
                            fontSize: '0.875rem', fontWeight: 600, textAlign: 'center',
                            border: 'none', cursor: 'pointer',
                        }}
                        onClick={() => { navigate('/login'); closeMobileMenu(); }}
                    >
                        <span className="ar-only">سجل واحصل على عضويتك الآن</span>
                        <span className="en-only">Register Free Membership</span>
                    </button>
                </div>
            </div>
        </>
    );
};
