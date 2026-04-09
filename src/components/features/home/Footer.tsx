
import React from 'react';
import logo from '@/assets/logo.png';
import { Facebook, Instagram, Twitter, Send, Phone, Youtube } from 'lucide-react';


export const Footer = () => {
    return (
        <footer>
            <div className="footer-grid">
                <div className="footer-brand">
                    <div className="footer-logo">
                        <div className="logo-mark">
                            <img src={logo} alt="الاتحاد" className="w-full h-full object-contain" />
                        </div>
                        <div className="logo-text">
                            <span className="logo-text-main ar-only">اتحاد الطلاب اليمنيين</span>
                            <span className="logo-text-main en-only">Yemeni Students Union</span>
                            <span className="logo-text-sub ar-only">فرع إسطنبول · تركيا</span>
                            <span className="logo-text-sub en-only">Istanbul Branch · Turkey</span>
                        </div>
                    </div>
                    <p className="footer-desc">
                        <span className="ar-only">منظومة دعم شاملة للطلاب اليمنيين في تركيا. نبني مجتمعًا طلابيًا متماسكًا يدعم كل طالب في رحلته الأكاديمية.</span>
                        <span className="en-only">A comprehensive support system for Yemeni students in Turkey. We build a cohesive student community supporting every student in their academic journey.</span>
                    </p>
                    <div className="footer-socials">

                        <div className="social-btn" title="Facebook"><Facebook size={18} /></div>
                        <div className="social-btn" title="Instagram"><Instagram size={18} /></div>
                        <div className="social-btn" title="Twitter/X"><Twitter size={18} /></div>
                        <div className="social-btn" title="Telegram"><Send size={18} /></div>
                        <div className="social-btn" title="WhatsApp"><Phone size={18} /></div>
                        <div className="social-btn" title="YouTube"><Youtube size={18} /></div>
                    </div>
                </div>

                <div className="footer-col">
                    <div className="footer-col-title ar-only">روابط سريعة</div>
                    <div className="footer-col-title en-only">Quick Links</div>
                    <div className="footer-links">
                        <a href="#about"><span className="ar-only">من نحن</span><span className="en-only">About Us</span></a>
                        <a href="#guide"><span className="ar-only">الدليل الطلابي</span><span className="en-only">Student Guide</span></a>
                        <a href="#activities"><span className="ar-only">الأنشطة والفعاليات</span><span className="en-only">Activities & Events</span></a>
                        <a href="#discounts"><span className="ar-only">التخفيضات الحصرية</span><span className="en-only">Exclusive Discounts</span></a>
                        <a href="#partners"><span className="ar-only">شركاؤنا</span><span className="en-only">Our Partners</span></a>
                    </div>
                </div>

                <div className="footer-col">
                    <div className="footer-col-title ar-only">الدليل الطلابي</div>
                    <div className="footer-col-title en-only">Student Guide</div>
                    <div className="footer-links">
                        <a href="#guide"><span className="ar-only">أسئلة وأجوبة</span><span className="en-only">Q&A</span></a>
                        <a href="#guide"><span className="ar-only">دليل الجامعات</span><span className="en-only">Universities Guide</span></a>
                        <a href="#guide"><span className="ar-only">إجراءات الإقامة</span><span className="en-only">Residence Procedures</span></a>
                        <a href="#guide"><span className="ar-only">نصائح الحياة اليومية</span><span className="en-only">Daily Life Tips</span></a>
                    </div>
                </div>

                <div className="footer-col">
                    <div className="footer-col-title ar-only">تواصل معنا</div>
                    <div className="footer-col-title en-only">Contact Us</div>
                    <div className="footer-contact-item">
                        <span className="contact-icon">📍</span>
                        <span>
                            <span className="ar-only">إسطنبول، تركيا</span>
                            <span className="en-only">Istanbul, Turkey</span>
                        </span>
                    </div>
                    <div className="footer-contact-item">
                        <span className="contact-icon">📧</span>
                        <span>info@ysu-istanbul.org</span>
                    </div>
                    <div className="footer-contact-item">
                        <span className="contact-icon">📱</span>
                        <span>+90 5XX XXX XXXX</span>
                    </div>
                    {/* <div className="footer-contact-item">
                        <span className="contact-icon">⏰</span>
                        <span>
                            <span className="ar-only">السبت - الخميس: 9ص - 6م</span>
                            <span className="en-only">Sat–Thu: 9AM – 6PM</span>
                        </span>
                    </div> */}
                </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', maxWidth: 'var(--max)', margin: '0 auto', padding: '24px 5vw', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                <div className="footer-copy">
                    <span className="ar-only">© 2026 اتحاد الطلاب اليمنيين في تركيا – فرع إسطنبول. جميع الحقوق محفوظة.</span>
                    <span className="en-only">© 2026 Yemeni Students Union in Turkey – Istanbul Branch. All rights reserved.</span>
                </div>
                <div className="footer-bottom-links">
                    <a href="#"><span className="ar-only">سياسة الخصوصية</span><span className="en-only">Privacy Policy</span></a>
                    <a href="#"><span className="ar-only">شروط الاستخدام</span><span className="en-only">Terms of Use</span></a>
                </div>
            </div>
        </footer>
    );
};