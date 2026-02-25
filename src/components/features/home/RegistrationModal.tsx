
import React, { useState, useRef } from 'react';

interface RegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
    lang: string;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({ isOpen, onClose, lang }) => {
    const [success, setSuccess] = useState(false);

    // Refs for inputs
    const fnameRef = useRef<HTMLInputElement>(null);
    const lnameRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);
    const phoneRef = useRef<HTMLInputElement>(null);
    const uniRef = useRef<HTMLSelectElement>(null);
    const majorRef = useRef<HTMLInputElement>(null);

    const handleSubmit = () => {
        // Basic validation
        if (!fnameRef.current?.value || !emailRef.current?.value) {
            alert(lang === 'ar' ? 'يرجى ملء الحقول المطلوبة' : 'Please fill in required fields');
            return;
        }

        // Simulate API call
        setTimeout(() => {
            setSuccess(true);
        }, 500);
    };

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // Need to reset state when modal closes/opens?
    // Doing it simple: if not open, return null is handled by parent or CSS?
    // The CSS uses .modal-overlay #modal-overlay, and might toggle display:none?
    // The original CSS: .modal-overlay { display: none; ... } .modal-overlay.open { display: flex; }
    // So we should adhere to that class based switching if we want to preserve animations.

    if (!isOpen && !document.querySelector('.modal-overlay.open')) {
        // This logic is tricky. If we use React conditional rendering `{isOpen && ...}`
        // we might lose the close animation if it exists.
        // But here we are just replacing class based display toggling.
    }

    return (
        <div
            className={`modal-overlay ${isOpen ? 'open' : ''}`}
            id="modal-overlay"
            onClick={handleOverlayClick}
        >
            <div className="modal">
                {!success ? (
                    <>
                        <div className="modal-header">
                            <button className="modal-close" onClick={onClose}>✕</button>
                            <div className="modal-title ar-only">سجل عضويتك المجانية</div>
                            <div className="modal-title en-only">Register Your Free Membership</div>
                            <div className="modal-sub ar-only">انضم لأكثر من 3000 طالب يمني في إسطنبول</div>
                            <div className="modal-sub en-only">Join more than 3,000 Yemeni students in Istanbul</div>
                        </div>
                        <div className="modal-body">
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label ar-only">الاسم الأول *</label>
                                    <label className="form-label en-only">First Name *</label>
                                    <input type="text" className="form-input" placeholder="" id="fname" ref={fnameRef} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label ar-only">اسم العائلة *</label>
                                    <label className="form-label en-only">Last Name *</label>
                                    <input type="text" className="form-input" placeholder="" id="lname" ref={lnameRef} />
                                </div>
                                <div className="form-group full">
                                    <label className="form-label ar-only">البريد الإلكتروني *</label>
                                    <label className="form-label en-only">Email Address *</label>
                                    <input type="email" className="form-input" placeholder="example@email.com" id="email" ref={emailRef} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label ar-only">رقم الهاتف</label>
                                    <label className="form-label en-only">Phone Number</label>
                                    <input type="tel" className="form-input" placeholder="+90 5XX XXX XXXX" id="phone" ref={phoneRef} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label ar-only">الجامعة</label>
                                    <label className="form-label en-only">University</label>
                                    <select className="form-select" id="university" ref={uniRef}>
                                        <option value="" className="ar-only">اختر جامعتك</option>
                                        <option value="" className="en-only">Select your university</option>
                                        <option className="ar-only" value="itu">جامعة إسطنبول التقنية</option>
                                        <option className="en-only" value="itu">Istanbul Technical University</option>
                                        <option className="ar-only" value="iu">جامعة إسطنبول</option>
                                        <option className="en-only" value="iu">Istanbul University</option>
                                        <option className="ar-only" value="mu">جامعة مرمرة</option>
                                        <option className="en-only" value="mu">Marmara University</option>
                                        <option className="ar-only" value="ytu">جامعة يلدز التقنية</option>
                                        <option className="en-only" value="ytu">Yildiz Technical University</option>
                                        <option className="ar-only" value="other">جامعة أخرى</option>
                                        <option className="en-only" value="other">Other</option>
                                    </select>
                                </div>
                                <div className="form-group full">
                                    <label className="form-label ar-only">التخصص</label>
                                    <label className="form-label en-only">Field of Study</label>
                                    <input type="text" className="form-input" id="major" ref={majorRef} />
                                </div>
                            </div>
                            <button className="btn btn-primary modal-submit" onClick={handleSubmit}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                                <span className="ar-only">إنشاء عضويتي المجانية</span>
                                <span className="en-only">Create My Free Membership</span>
                            </button>
                            <p className="modal-note">
                                <span className="ar-only">✔ مجاني 100% — لا رسوم ولا اشتراكات</span>
                                <span className="en-only">✔ 100% Free — no fees, no subscriptions</span>
                            </p>
                        </div>
                    </>
                ) : (
                    <div className="modal-body" style={{ textAlign: 'center', padding: '40px 20px' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🎉</div>
                        <h3 className="heading-md" style={{ marginBottom: '10px' }}>
                            <span className="ar-only">تم التسجيل بنجاح!</span>
                            <span className="en-only">Registered Successfully!</span>
                        </h3>
                        <p style={{ color: 'var(--text-2)', marginBottom: '30px' }}>
                            <span className="ar-only">شكراً لانضمامك إلينا. سنتواصل معك قريباً.</span>
                            <span className="en-only">Thank you for joining us. We will contact you soon.</span>
                        </p>
                        <button className="btn btn-outline" onClick={onClose}>
                            <span className="ar-only">إغلاق</span>
                            <span className="en-only">Close</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
