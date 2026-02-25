
import React from 'react';
import { useNavigate } from 'react-router-dom';

// ... inside the component function

interface HeroProps {
    onOpenModal: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenModal }) => {
    const navigate = useNavigate();
    return (
        <section id="hero">
            <div className="hero-bg">
                <div className="hero-grid"></div>
                <div className="hero-orb orb-1"></div>
                <div className="hero-orb orb-2"></div>
                <div className="hero-orb orb-3"></div>
            </div>

            <div className="hero-content">
                <div className="hero-left">
                    <div className="hero-eyebrow">
                        <div className="eyebrow-line"></div>
                        <span className="eyebrow-text ar-only">اتحاد الطلاب اليمنيين · إسطنبول</span>
                        <span className="eyebrow-text en-only">Yemeni Students Union · Istanbul</span>
                    </div>

                    <h1 className="hero-title">
                        <span className="ar-only">
                            معًا نبني<br />
                            <span className="hero-title-highlight">مجتمعًا طلابيًا أقوى</span><br />
                        </span>
                        <span className="en-only">
                            Together We Build<br />
                            <span className="hero-title-highlight">A Stronger Community</span><br />
                            In Turkey
                        </span>
                    </h1>



                    <p className="hero-desc">
                        <span className="ar-only">
                            نحن اتحاد طلابي يمني في إسطنبول يهدف إلى دعم الطلاب اليمنيين في جميع مراحل حياتهم الأكاديمية والمعيشية في تركيا — من قبول الجامعة حتى التخرج وما بعده.
                        </span>
                        <span className="en-only">
                            We are a Yemeni student union in Istanbul dedicated to supporting Yemeni students at every stage of their academic and daily life in Turkey — from university admission through graduation and beyond.
                        </span>
                    </p>

                    <div className="hero-actions">
                        <button className="btn btn-primary" onClick={() => navigate('/login')}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                            <span className="ar-only">سجل واحصل على عضويتك الآن</span>
                            <span className="en-only">Register Your Free Membership</span>
                        </button>
                    </div>

                    <div className="hero-stats">
                        <div className="hero-stat-item">
                            <div className="hero-stat-num">+100</div>
                            <div className="hero-stat-label ar-only">عضو مسجل</div>
                            <div className="hero-stat-label en-only">Members</div>
                        </div>
                        <div className="hero-stat-item">
                            <div className="hero-stat-num">+10</div>
                            <div className="hero-stat-label ar-only">شريك استراتيجي</div>
                            <div className="hero-stat-label en-only">Partners</div>
                        </div>

                    </div>
                </div>

                <div className="hero-visual">
                    <div className="hero-card">
                        <div className="hero-card-header">
                            <div className="logo-mark">
                                <img
                                    src="src/assets/logo.png"
                                    alt="Yemeni Students Union"
                                    className="h-8 w-auto mr-2 rtl:ml-2 rtl:mr-0"
                                />
                            </div>
                            <div className="hero-card-title ar-only">مزايا العضوية المجانية</div>
                            <div className="hero-card-title en-only">Free Membership Benefits</div>
                            <div className="hero-card-sub ar-only">انضم اليوم واحصل على جميع المزايا فورًا</div>
                            <div className="hero-card-sub en-only">Join today and get all benefits instantly</div>
                        </div>
                        <div className="hero-card-body">
                            <div className="member-benefit">
                                <div className="benefit-icon">🎓</div>
                                <div className="benefit-text ar-only">دليل شامل للجامعات التركية</div>
                                <div className="benefit-text en-only">Full Turkish Universities Guide</div>
                            </div>
                            <div className="member-benefit">
                                <div className="benefit-icon">💳</div>
                                <div className="benefit-text ar-only">تخفيضات حصرية للأعضاء</div>
                                <div className="benefit-text en-only">Exclusive Member Discounts</div>
                            </div>
                            <div className="member-benefit">
                                <div className="benefit-icon">🤝</div>
                                <div className="benefit-text ar-only">شبكة علاقات طلابية واسعة</div>
                                <div className="benefit-text en-only">Wide Student Network Access</div>
                            </div>
                            <div className="member-benefit">
                                <div className="benefit-icon">📋</div>
                                <div className="benefit-text ar-only">إرشادات الإقامة والوثائق</div>
                                <div className="benefit-text en-only">Residence & Document Guidance</div>
                            </div>
                        </div>
                        <div className="hero-card-footer">
                            <button className="btn btn-primary" onClick={() => navigate('/login')}>
                                <span className="ar-only">سجل عضويتك مجانًا — الآن</span>
                                <span className="en-only">Get Free Membership — Now</span>
                            </button>
                        </div>
                    </div>
                    {/* Floating badge */}
                    {/* <div className="hero-badge-float">
                        <div className="badge-icon">🏆</div>
                        <div className="badge-info">
                            <div className="badge-num">+100</div>
                            <div className="badge-label ar-only">فعالية منظمة</div>
                            <div className="badge-label en-only">Events Organized</div>
                        </div>
                    </div> */}

                </div>
            </div>


        </section>
    );
};
