
import React from 'react';
import { useNavigate } from 'react-router-dom';


interface FinalCTAProps {
    onOpenModal: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onOpenModal }) => {
    const navigate = useNavigate();

    return (
        <section id="cta-final">
            <div className="cta-bg"></div>
            <div className="cta-content reveal">
                <div className="cta-icon">🎓</div>
                <h2 className="cta-title">
                    <span className="ar-only">انضم اليوم وكن جزءًا من<br />مجتمع طلابي يصنع الفرق</span>
                    <span className="en-only">Join Today and Be Part of a<br />Student Community That Makes a Difference</span>
                </h2>
                <p className="cta-desc">
                    <span className="ar-only">   انضم إلينا مجانًا واستفد من دعم لا محدود، خصومات حصرية، وشبكة علاقات قوية تبدأ اليوم.</span>
                    <span className="en-only">Join us for free and benefit from unlimited support, exclusive discounts, and a powerful network starting today.</span>
                </p>
                <div className="cta-actions">
                    <button className="btn btn-primary" onClick={() => navigate('/login')}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                        <span className="ar-only">سجل واحصل على عضويتك مجانًا</span>
                        <span className="en-only">Register Your Free Membership</span>
                    </button>

                </div>
                <div className="cta-note">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                    <span className="en-only">Completely free — no credit card, no hidden fees</span>
                </div>
            </div>
        </section>
    );
};
