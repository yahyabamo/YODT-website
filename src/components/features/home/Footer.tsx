import React, { useState, useEffect } from 'react';
import logo from '@/assets/logo.png';
import { Facebook, Instagram, Twitter, Send, Phone, Youtube } from 'lucide-react';
import { navbarText } from '@/i18n/pages';
import { fetchFooter, type HomepageFooter } from '@/service/homepageCMS';
import { useLanguage } from '@/context/LanguageContext';
import { footerText, getField } from '@/i18n/pages';
import { PatternDivider } from '@/components/PatternDivider'; // ← ADD THIS


// Social link wrapper — renders as <a> if URL is set, else plain div
function SocialBtn({ href, title, children }: { href?: string; title: string; children: React.ReactNode }) {
    if (href && href.trim() !== '') {
        return (
            <a href={href} target="_blank" rel="noopener noreferrer" title={title} className="social-btn" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}>
                {children}
            </a>
        );
    }
    return <div className="social-btn" title={title} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{children}</div>;
}

export const Footer = () => {
    const { language: lang } = useLanguage();
    const [footerData, setFooterData] = useState<HomepageFooter | null>(null);

    useEffect(() => {
        fetchFooter()
            .then(data => setFooterData(data))
            .catch(err => console.error('Footer fetch failed', err));
    }, []);

    // Resolve values with fallbacks
    const phone = footerData?.phone ?? '+90 5XX XXX XXXX';
    const email = footerData?.email ?? 'info@ysu-istanbul.org';

    return (
        <>
            <style>{`

                /* ==========================================================================
                   Footer Hero Branding (Gucci Style) - with Dark Red & Black Colors
                   ========================================================================== */
                .footer-hero-container {
                    padding: 120px 5vw;
                    margin-top: 40px;
                    border-top: 1px solid rgba(0, 0, 0, 0.08);
                    text-align: center;
                    background-color: transparent;
                    overflow: hidden;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                .footer-hero-text {
                    font-size: clamp(2.5rem, 7vw, 8rem);
                    font-weight: 900;
                    line-height: 1.1;
                    letter-spacing: -0.03em;
                    text-transform: uppercase;
                    margin: 0;
                    opacity: 0;
                    transform: translateY(40px);
                    animation: fadeUpHero 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                }

                /* Main title line: dark red */
                .footer-hero-text {
                    color: #8B0000; /* Dark red */
                }

                /* City text: black with subtle outline */
                .footer-hero-text .city-text {
                    display: inline;
                    font-size: clamp(3rem, 9vw, 10rem);
                    color: #000000; /* Black */
                    -webkit-text-stroke: 1px #8B0000; /* Subtle dark red outline */
                    margin-top: 0px;
                }

                /* Dark mode adjustments */
                @media (prefers-color-scheme: dark) {
                    .footer-hero-text { color: #B22222; } /* Slightly brighter dark red */
                    .footer-hero-text .city-text { color: #ffffff; -webkit-text-stroke: 1px #B22222; }
                    .footer-hero-container { border-top: 1px solid rgba(255, 255, 255, 0.1); }
                }

                .footer-hero-subtext {
                    margin-top: 40px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    letter-spacing: 0.4em;
                    text-transform: uppercase;
                    color: var(--text-muted, #666);
                    opacity: 0;
                    animation: fadeUpHero 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                    animation-delay: 0.3s;
                }

                @keyframes fadeUpHero {
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                /* ==========================================================================
                   Footer Bottom Bar (Copyright Section) - Moved above hero
                   ========================================================================== */
                .footer-bottom-bar {
                    border-top: 1px solid var(--border, #eaeaea);
                    border-bottom: 1px solid var(--border, #eaeaea);
                    max-width: var(--max, 1200px);
                    margin: 0 auto 30px auto; /* space below it before hero */
                    padding: 24px 5vw;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    flex-wrap: wrap;
                    gap: 16px;
                    font-size: 0.9rem;
                    color: var(--text-muted, #666);
                }

                .footer-bottom-links {
                    display: flex;
                    gap: 20px;
                }

                .footer-bottom-links a {
                    color: inherit;
                    text-decoration: none;
                    transition: opacity 0.2s;
                }

                .footer-bottom-links a:hover {
                    opacity: 0.7;
                }

                /* ==========================================================================
                   Responsive Adjustments
                   ========================================================================== */
                @media (max-width: 768px) {
                    .footer-hero-container {
                        padding: 80px 20px;
                    }
                    
                    .footer-hero-text .city-text {
                        -webkit-text-stroke: 1px #8B0000;
                    }

                    .footer-hero-subtext {
                        letter-spacing: 0.2em;
                        font-size: 0.75rem;
                    }

                    .footer-bottom-bar {
                        flex-direction: column;
                        text-align: center;
                        justify-content: center;
                    }
                }
            `}</style>
            <footer className="site-footer">
                {/* Signature Brand Divider */}

                <PatternDivider
                    height={40}
                    variant="diamonds"        // diamond/coin grid (yemen-pattern.svg)
                    opacity={1}
                    style={{ borderBottom: '2px solid rgba(122,28,28,0.6)' }}
                />
                {/* الجزء الأول: القوائم والمعلومات التقليدية */}
                <div className="footer-grid">
                    <div className="footer-brand">
                        <div className="footer-logo">
                            <div className="logo-mark">
                                <img src={logo} alt="الاتحاد" className="w-full h-full object-contain" />
                            </div>
                            <div className="logo-text">
                                <span className="logo-text-main">{footerText.heroTitle[lang]}</span>
                                <span className="logo-text-sub">{navbarText.branchName[lang]}</span>
                            </div>
                        </div>
                        <p className="footer-desc">
                            {footerText.description[lang]}
                        </p>
                        <div className="footer-socials">
                            <SocialBtn href={footerData?.facebook_url} title="Facebook"><Facebook size={18} /></SocialBtn>
                            <SocialBtn href={footerData?.instagram_url} title="Instagram"><Instagram size={18} /></SocialBtn>
                            <SocialBtn href={footerData?.twitter_url} title="Twitter/X"><Twitter size={18} /></SocialBtn>
                            <SocialBtn href={footerData?.telegram_url} title="Telegram"><Send size={18} /></SocialBtn>
                            <SocialBtn href={footerData?.whatsapp_url} title="WhatsApp"><Phone size={18} /></SocialBtn>
                            <SocialBtn href={footerData?.youtube_url} title="YouTube"><Youtube size={18} /></SocialBtn>
                        </div>
                    </div>

                    <div className="footer-col">
                        <div className="footer-col-title">{footerText.sections.quickLinks[lang]}</div>
                        <div className="footer-links">
                            <a href="#about">{footerText.links.aboutUs[lang]}</a>
                            <a href="#guide">{footerText.links.studentGuide[lang]}</a>
                            <a href="#activities">{footerText.links.activitiesEvents[lang]}</a>
                            <a href="#discounts">{footerText.links.exclusiveDiscounts[lang]}</a>
                            <a href="#partners">{footerText.links.ourPartners[lang]}</a>
                        </div>
                    </div>

                    <div className="footer-col">
                        <div className="footer-col-title">{footerText.sections.studentGuide[lang]}</div>
                        <div className="footer-links">
                            <a href="#guide">{footerText.links.qna[lang]}</a>
                            <a href="#guide">{footerText.links.universitiesGuide[lang]}</a>
                            <a href="#guide">{footerText.links.residenceProcedures[lang]}</a>
                            <a href="#guide">{footerText.links.dailyLifeTips[lang]}</a>
                        </div>
                    </div>

                    <div className="footer-col">
                        <div className="footer-col-title">{footerText.sections.contactUs[lang]}</div>
                        <div className="footer-contact-item">
                            <span className="contact-icon">📍</span>
                            <span>
                                {footerData ? getField(footerData, 'address', lang) : footerText.city[lang]}
                            </span>
                        </div>
                        <div className="footer-contact-item">
                            <span className="contact-icon">📧</span>
                            {email && email.trim() !== ''
                                ? <a href={`mailto:${email}`} style={{ color: 'inherit', textDecoration: 'none' }}>{email}</a>
                                : <span>{email}</span>
                            }
                        </div>
                        <div className="footer-contact-item">
                            <span className="contact-icon">📱</span>
                            {phone && phone.trim() !== ''
                                ? <a href={`tel:${phone.replace(/\s/g, '')}`} style={{ color: 'inherit', textDecoration: 'none' }}>{phone}</a>
                                : <span>{phone}</span>
                            }
                        </div>
                    </div>
                </div>

                {/* ===== Copyright (above the hero title) ===== */}
                <div className="footer-bottom-bar">
                    <div className="footer-copy">
                        {footerText.copyright[lang]}
                    </div>
                    <div className="footer-bottom-links">
                        <a href="#">{footerText.links.privacyPolicy[lang]}</a>
                        <a href="#">{footerText.links.termsOfUse[lang]}</a>
                    </div>
                </div>

                {/* Gucci-Style Hero Text (appears below copyright) */}
                <div className="footer-hero-container">
                    <div className="footer-hero-inner">
                        <h2 className="footer-hero-text font-display">
                            {footerText.heroTitle[lang]} <span className="city-text">{footerText.city[lang]}</span>
                        </h2>
                    </div>
                </div>
            </footer>
        </>
    );
};