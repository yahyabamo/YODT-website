import React, { useState, useEffect } from 'react';
import logo from '@/assets/logo.png';
import { Facebook, Instagram, Twitter, Send, Phone, Youtube } from 'lucide-react';
import { fetchFooter, type HomepageFooter } from '@/service/homepageCMS';

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
                   إعدادات دعم اللغات المتعددة (Dynamic Text)
                   ========================================================================== */
                .tr-only, .en-only { display: none; }

                [lang="tr"] .tr-only { display: block; }
                [lang="tr"] .ar-only, [lang="tr"] .en-only { display: none; }

                [lang="en"] .en-only { display: block; }
                [lang="en"] .ar-only, [lang="en"] .tr-only { display: none; }

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
                    font-family: var(--font-heading, inherit);
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
                {/* الجزء الأول: القوائم والمعلومات التقليدية */}
                <div className="footer-grid">
                    <div className="footer-brand">
                        <div className="footer-logo">
                            <div className="logo-mark">
                                <img src={logo} alt="الاتحاد" className="w-full h-full object-contain" />
                            </div>
                            <div className="logo-text">
                                <span className="logo-text-main ar-only">اتحاد الطلاب اليمنيين</span>
                                <span className="logo-text-main en-only">Yemeni Students Union</span>
                                <span className="logo-text-main tr-only">Yemenli Öğrenciler Birliği</span>
                                <span className="logo-text-sub ar-only">فرع إسطنبول · تركيا</span>
                                <span className="logo-text-sub en-only">Istanbul Branch · Turkey</span>
                                <span className="logo-text-sub tr-only">İstanbul Şubesi · Türkiye</span>
                            </div>
                        </div>
                        <p className="footer-desc">
                            <span className="ar-only">منظومة دعم شاملة للطلاب اليمنيين في تركيا. نبني مجتمعًا طلابيًا متماسكًا يدعم كل طالب في رحلته الأكاديمية.</span>
                            <span className="en-only">A comprehensive support system for Yemeni students in Turkey. We build a cohesive student community supporting every student in their academic journey.</span>
                            <span className="tr-only">Türkiye'deki Yemenli öğrenciler için kapsamlı bir destek sistemi. Her öğrenciyi akademik yolculuğunda destekleyen uyumlu bir öğrenci topluluğu inşa ediyoruz.</span>
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
                        <div className="footer-col-title ar-only">روابط سريعة</div>
                        <div className="footer-col-title en-only">Quick Links</div>
                        <div className="footer-col-title tr-only">Hızlı Bağlantılar</div>
                        <div className="footer-links">
                            <a href="#about"><span className="ar-only">من نحن</span><span className="en-only">About Us</span><span className="tr-only">Hakkımızda</span></a>
                            <a href="#guide"><span className="ar-only">الدليل الطلابي</span><span className="en-only">Student Guide</span><span className="tr-only">Öğrenci Rehberi</span></a>
                            <a href="#activities"><span className="ar-only">الأنشطة والفعاليات</span><span className="en-only">Activities & Events</span><span className="tr-only">Etkinlikler</span></a>
                            <a href="#discounts"><span className="ar-only">التخفيضات الحصرية</span><span className="en-only">Exclusive Discounts</span><span className="tr-only">Özel İndirimler</span></a>
                            <a href="#partners"><span className="ar-only">شركاؤنا</span><span className="en-only">Our Partners</span><span className="tr-only">Ortaklarımız</span></a>
                        </div>
                    </div>

                    <div className="footer-col">
                        <div className="footer-col-title ar-only">الدليل الطلابي</div>
                        <div className="footer-col-title en-only">Student Guide</div>
                        <div className="footer-col-title tr-only">Öğrenci Rehberi</div>
                        <div className="footer-links">
                            <a href="#guide"><span className="ar-only">أسئلة وأجوبة</span><span className="en-only">Q&A</span><span className="tr-only">S&S</span></a>
                            <a href="#guide"><span className="ar-only">دليل الجامعات</span><span className="en-only">Universities Guide</span><span className="tr-only">Üniversiteler Rehberi</span></a>
                            <a href="#guide"><span className="ar-only">إجراءات الإقامة</span><span className="en-only">Residence Procedures</span><span className="tr-only">İkamet Prosedürleri</span></a>
                            <a href="#guide"><span className="ar-only">نصائح الحياة اليومية</span><span className="en-only">Daily Life Tips</span><span className="tr-only">Günlük Yaşam İpuçları</span></a>
                        </div>
                    </div>

                    <div className="footer-col">
                        <div className="footer-col-title ar-only">تواصل معنا</div>
                        <div className="footer-col-title en-only">Contact Us</div>
                        <div className="footer-col-title tr-only">Bize Ulaşın</div>
                        <div className="footer-contact-item">
                            <span className="contact-icon">📍</span>
                            <span>
                                <span className="ar-only">{footerData?.address_ar ?? 'إسطنبول، تركيا'}</span>
                                <span className="en-only">{footerData?.address_en ?? 'Istanbul, Turkey'}</span>
                                <span className="tr-only">{footerData?.address_tr ?? 'İstanbul, Türkiye'}</span>
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
                        <span className="ar-only">© 2026 اتحاد الطلاب اليمنيين في تركيا – فرع إسطنبول. جميع الحقوق محفوظة.</span>
                        <span className="en-only">© 2026 Yemeni Students Union in Turkey – Istanbul Branch. All rights reserved.</span>
                        <span className="tr-only">© 2026 Türkiye'deki Yemenli Öğrenciler Birliği – İstanbul Şubesi. Tüm hakları saklıdır.</span>
                    </div>
                    <div className="footer-bottom-links">
                        <a href="#"><span className="ar-only">سياسة الخصوصية</span><span className="en-only">Privacy Policy</span><span className="tr-only">Gizlilik Politikası</span></a>
                        <a href="#"><span className="ar-only">شروط الاستخدام</span><span className="en-only">Terms of Use</span><span className="tr-only">Kullanım Koşulları</span></a>
                    </div>
                </div>

                {/* Gucci-Style Hero Text (appears below copyright) */}
                <div className="footer-hero-container">
                    <div className="footer-hero-inner">
                        <h2 className="footer-hero-text ar-only">
                            اتحاد الطلاب اليمنيين <span className="city-text">إسطنبول</span>
                        </h2>
                        <h2 className="footer-hero-text tr-only">
                            Yemenli Öğrenciler Birliği <span className="city-text">İstanbul</span>
                        </h2>
                        <h2 className="footer-hero-text en-only">
                            Yemeni Students Union <span className="city-text">Istanbul</span>
                        </h2>
                    </div>
                </div>
            </footer>
        </>
    );
};