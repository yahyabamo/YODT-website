
import React from 'react';

export const About = () => {
    return (
        <section id="about" className="section-pad">
            <div className="container">
                <div className="about-grid">
                    <div className="about-left reveal-left">
                        <div className="tag"><span className="dot"></span>
                            <span className="ar-only">من نحن</span>
                            <span className="en-only">About Us</span>
                        </div>
                        <h2 className="heading-lg" style={{ marginBottom: '20px' }}>
                            <span className="ar-only">اتحاد يبني جسورًا<br />بين الطلاب</span>
                            <span className="en-only">Building Bridges<br />Between Students</span>
                        </h2>
                        <div className="divider-line"></div>
                        <p style={{ fontSize: '0.97rem', color: 'var(--text-2)', lineHeight: '1.85', marginBottom: '20px' }}>
                            <span className="ar-only">
                                تأسس اتحاد الطلاب اليمنيين في تركيا – فرع إسطنبول كمنظومة دعم شاملة للطلاب اليمنيين الدارسين في تركيا، حيث نؤمن أن كل طالب يستحق بيئة داععة وشبكة علاقات قوية تُعينه على النجاح الأكاديمي والاندماج الاجتماعي.
                            </span>
                            <span className="en-only">
                                The Yemeni Students Union in Turkey – Istanbul Branch was founded as a comprehensive support system for Yemeni students studying in Turkey. We believe every student deserves a supportive environment and a strong network to help them succeed academically and socially.
                            </span>
                        </p>
                        <p style={{ fontSize: '0.97rem', color: 'var(--text-2)', lineHeight: '1.85' }}>
                            <span className="ar-only">
                                نعمل على ربط الطلاب بالموارد اللازمة، من المعلومات الجامعية إلى الإجراءات القانونية والسكنية، مع بناء مجتمع يمني متماسك ومترابط في قلب إسطنبول.
                            </span>
                            <span className="en-only">
                                We connect students to essential resources — from university information to legal procedures and housing — while fostering a cohesive, close-knit Yemeni community in the heart of Istanbul.
                            </span>
                        </p>

                        <div className="about-pillars">
                            <div className="pillar-card">
                                <div className="pillar-icon">🎓</div>
                                <div className="pillar-content">
                                    <div className="pillar-title ar-only">الدعم الأكاديمي</div>
                                    <div className="pillar-title en-only">Academic Support</div>
                                    <div className="pillar-desc ar-only">توجيه الطلاب في اختيار الجامعات والتخصصات وإجراءات القبول والتسجيل.</div>
                                    <div className="pillar-desc en-only">Guiding students in choosing universities, majors, and navigating admission procedures.</div>
                                </div>
                            </div>
                            <div className="pillar-card">
                                <div className="pillar-icon">🌐</div>
                                <div className="pillar-content">
                                    <div className="pillar-title ar-only">بناء المجتمع</div>
                                    <div className="pillar-title en-only">Community Building</div>
                                    <div className="pillar-desc ar-only">خلق بيئة اجتماعية داعمة تجمع الطلاب اليمنيين وتعزز روابطهم ببعضهم.</div>
                                    <div className="pillar-desc en-only">Creating a supportive social environment that connects Yemeni students and strengthens their bonds.</div>
                                </div>
                            </div>
                            <div className="pillar-card">
                                <div className="pillar-icon">🧭</div>
                                <div className="pillar-content">
                                    <div className="pillar-title ar-only">التوجيه والمساعدة</div>
                                    <div className="pillar-title en-only">Guidance & Assistance</div>
                                    <div className="pillar-desc ar-only">المساعدة في إجراءات الإقامة، الخدمات الحكومية، والحياة اليومية في تركيا.</div>
                                    <div className="pillar-desc en-only">Assistance with residence procedures, government services, and daily life in Turkey.</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="about-right reveal-right">
                        <div className="about-card-big">
                            <div className="about-card-top">
                                <div className="about-big-num">YÖDT</div>
                                <div className="about-card-top-content">
                                    {/* <div className="about-card-label ar-only">سنوات من الخدمة المتميزة</div> */}
                                    {/* <div className="about-card-label en-only">Years of Distinguished Service</div> */}
                                    <div className="pillar-desc ar-only">متواجدون دوما لخدمتكم .</div>
                                </div>
                            </div>
                            <div className="about-card-body">
                                <div className="about-fact-row">
                                    <span className="about-fact-label ar-only">📍 المقر الرئيسي</span>
                                    <span className="about-fact-label en-only">📍 Headquarters</span>
                                    <span className="about-fact-value ar-only">إسطنبول، تركيا</span>
                                    <span className="about-fact-value en-only">Istanbul, Turkey</span>
                                </div>
                                <div className="about-fact-row">
                                    <span className="about-fact-label ar-only">👥 عدد الأعضاء</span>
                                    <span className="about-fact-label en-only">👥 Members</span>
                                    <span className="about-fact-value">+100</span>
                                </div>
                                <div className="about-fact-row">
                                    <span className="about-fact-label ar-only">🤝 الشركاء</span>
                                    <span className="about-fact-label en-only">🤝 Partners</span>
                                    <span className="about-fact-value">+10</span>
                                </div>
                                <div className="about-fact-row">
                                    <span className="about-fact-label ar-only">📅 الفعاليات السنوية</span>
                                    <span className="about-fact-label en-only">📅 Annual Events</span>
                                    <span className="about-fact-value">+20</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
