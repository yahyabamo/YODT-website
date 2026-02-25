
import React from 'react';

export const Guide = () => {
    return (
        <section id="guide">
            <div className="container section-pad">
                <div className="guide-intro reveal">
                    <div className="tag" style={{ margin: '0 auto 20px' }}><span className="dot"></span>
                        <span className="ar-only">الدليل الطلابي</span>
                        <span className="en-only">Student Guide</span>
                    </div>
                    <h2 className="heading-lg" style={{ marginBottom: '18px' }}>
                        <span className="ar-only">دليلك الشامل للدراسة<br />والحياة في تركيا</span>
                        <span className="en-only">Your Complete Guide to<br />Studying & Living in Turkey</span>
                    </h2>
                    <div className="divider-line" style={{ margin: '20px auto' }}></div>
                    <p style={{ color: 'var(--text-2)', fontSize: '0.97rem', lineHeight: 1.8, maxWidth: '600px', margin: '0 auto' }}>
                        <span className="ar-only">يوفر اتحادنا دليلًا شاملًا يغطي كل ما يحتاجه الطالب اليمني في رحلته داخل تركيا، من أول يوم حتى التخرج.</span>
                        <span className="en-only">Our union provides a comprehensive guide covering everything a Yemeni student needs in Turkey, from day one through graduation.</span>
                    </p>
                </div>

                <div className="guide-grid">
                    {/* Wide card: FAQs */}
                    <div className="guide-card guide-card-wide reveal delay-1">
                        <div className="guide-card-content">
                            <div className="guide-card-icon" style={{ fontSize: '1.9rem' }}>❓</div>
                            <div>
                                <div className="guide-card-title ar-only">أسئلة وأجوبة شاملة</div>
                                <div className="guide-card-title en-only">Comprehensive Q&A</div>
                                <div className="guide-card-desc ar-only">
                                    إجابات مفصلة لكل الأسئلة الشائعة التي يطرحها الطلاب اليمنيون — من الوثائق المطلوبة، إجراءات الالتحاق بالجامعة، تكاليف الدراسة، وكل ما يخطر ببالك.
                                </div>
                                <div className="guide-card-desc en-only">
                                    Detailed answers to all common questions asked by Yemeni students — required documents, university enrollment procedures, tuition costs, and everything you can think of.
                                </div>
                            </div>
                        </div>
                        <div className="guide-card-arrow">→</div>
                    </div>

                    {/* Housing Guide */}
                    <div className="guide-card reveal delay-2">
                        <div className="guide-card-icon">🏠</div>
                        <div className="guide-card-title ar-only">دليل السكن</div>
                        <div className="guide-card-title en-only">Housing Guide</div>
                        <div className="guide-card-desc ar-only">كل ما تحتاج معرفته عن السكن في إسطنبول — الأحياء المناسبة، متوسط الأسعار، ونصائح التعاقد والإيجار.</div>
                        <div className="guide-card-desc en-only">Everything you need to know about housing in Istanbul — suitable neighborhoods, average prices, and contract & rental tips.</div>
                        <div className="guide-card-arrow">→</div>
                    </div>

                    {/* Universities Guide */}
                    <div className="guide-card reveal delay-3">
                        <div className="guide-card-icon">🏛️</div>
                        <div className="guide-card-title ar-only">دليل الجامعات</div>
                        <div className="guide-card-title en-only">Universities Guide</div>
                        <div className="guide-card-desc ar-only">مقارنة شاملة لأهم الجامعات التركية، التخصصات المتاحة، متطلبات القبول، ورسوم الدراسة.</div>
                        <div className="guide-card-desc en-only">Comprehensive comparison of major Turkish universities, available majors, admission requirements, and tuition fees.</div>
                        <div className="guide-card-arrow">→</div>
                    </div>

                    {/* Residence Procedures */}
                    <div className="guide-card reveal delay-2">
                        <div className="guide-card-icon">📋</div>
                        <div className="guide-card-title ar-only">إجراءات الإقامة</div>
                        <div className="guide-card-title en-only">Residence Procedures</div>
                        <div className="guide-card-desc ar-only">خطوات مفصلة للحصول على إقامة الطالب في تركيا، الوثائق المطلوبة، والمواعيد والرسوم.</div>
                        <div className="guide-card-desc en-only">Detailed steps to obtain student residence in Turkey, required documents, appointments, and fees.</div>
                        <div className="guide-card-arrow">→</div>
                    </div>

                    {/* Daily Life */}
                    <div className="guide-card reveal delay-3">
                        <div className="guide-card-icon">☀️</div>
                        <div className="guide-card-title ar-only">نصائح الحياة اليومية</div>
                        <div className="guide-card-title en-only">Daily Life Tips</div>
                        <div className="guide-card-desc ar-only">دليل عملي للحياة في إسطنبول — المواصلات، التسوق، الطعام، الخدمات الصحية، وأهم التطبيقات.</div>
                        <div className="guide-card-desc en-only">A practical guide to life in Istanbul — transportation, shopping, food, healthcare, and essential apps.</div>
                        <div className="guide-card-arrow">→</div>
                    </div>
                </div>
            </div>
        </section>
    );
};
