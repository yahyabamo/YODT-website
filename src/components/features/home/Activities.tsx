
import React from 'react';

export const Activities = () => {
    return (
        <section id="activities" className="section-pad" style={{ background: 'var(--bg-2)' }}>
            <div className="container">
                <div className="section-header center-line reveal" style={{ marginBottom: '60px', textAlign: 'center' }}>
                    <div className="hero-eyebrow">
                        <div className="eyebrow-line"></div>
                        <span className="eyebrow-text ar-only">الأنشطة والفعاليات</span>
                        <span className="eyebrow-text en-only">Activities & Events</span>
                    </div>
                </div>

                <div className="activities-grid">
                    {/* Main Activity - Cultural Events */}
                    <div className="activity-card main reveal delay-1">
                        <div className="activity-img">
                            <div className="img-placeholder">
                                <div className="placeholder-content">
                                    <div className="placeholder-icon">📖</div>
                                    <div className="placeholder-text ar-only">الفعاليات الثقافية</div>
                                    <div className="placeholder-text en-only">Cultural Events</div>
                                </div>
                            </div>
                        </div>
                        <div className="activity-content">
                            <div className="activity-tags"></div>
                            <h3 className="activity-title ar-only">الفعاليات الثقافية والأدبية</h3>
                            <h3 className="activity-title en-only">Cultural & Literary Events</h3>
                            <p className="activity-desc ar-only">
                                نهتم بتعزيز الهوية من خلال الأمسيات الشعرية، معارض الفنون، والندوات الفكرية التي تجمع المبدعين وتنمي المواهب الأدبية لدى الطلاب.
                            </p>
                            <p className="activity-desc en-only">
                                We promote identity through poetry evenings, art exhibitions, and intellectual seminars that bring together creators and nurture student talents.
                            </p>
                            <div className="activity-meta">
                                <div className="meta-item">
                                    <span className="meta-icon">📍</span>
                                    <span className="ar-only">قاعات المؤتمرات</span>
                                    <span className="en-only">Conference Halls</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sub Activity 1 - National Events */}
                    <div className="activity-card sub reveal delay-2">
                        <div className="activity-img">
                            <div className="img-placeholder">
                                <div className="placeholder-content">
                                    <div className="placeholder-icon">🇾🇪</div>
                                </div>
                            </div>
                        </div>
                        <div className="activity-content">
                            <div className="activity-date-sm">
                                <span className="ar-only">فعاليات وطنية</span>
                                <span className="en-only">National Events</span>
                            </div>
                            <h3 className="activity-title ar-only">المناسبات الوطنية</h3>
                            <h3 className="activity-title en-only">National Occasions</h3>
                            <p className="activity-desc ar-only">إحياء الذكريات الوطنية وتعزيز روح الانتماء والترابط بين أبناء الجالية.</p>
                            <p className="activity-desc en-only">Commemorating national days and strengthening the sense of belonging and unity.</p>
                        </div>
                    </div>

                    {/* Sub Activity 2 - Sports Events */}
                    <div className="activity-card sub reveal delay-3">
                        <div className="activity-img">
                            <div className="img-placeholder">
                                <div className="placeholder-content">
                                    <div className="placeholder-icon">🏅</div>
                                </div>
                            </div>
                        </div>
                        <div className="activity-content">
                            <div className="activity-date-sm">
                                <span className="ar-only">نشاط رياضي</span>
                                <span className="en-only">Sports Activity</span>
                            </div>
                            <h3 className="activity-title ar-only">الأنشطة الرياضية</h3>
                            <h3 className="activity-title en-only">Sports Activities</h3>
                            <p className="activity-desc ar-only">بطولات كروية ومنافسات حركية تهدف لتعزيز اللياقة البدنية والروح الجماعية.</p>
                            <p className="activity-desc en-only">Football tournaments and physical competitions aimed at boosting fitness and teamwork.</p>
                        </div>
                    </div>

                    {/* Sub Activity 3 - Religious Events */}
                    <div className="activity-card sub reveal delay-4">
                        <div className="activity-img">
                            <div className="img-placeholder">
                                <div className="placeholder-content">
                                    <div className="placeholder-icon">🌙</div>
                                </div>
                            </div>
                        </div>
                        <div className="activity-content">
                            <div className="activity-date-sm">
                                <span className="ar-only">فعاليات دينية</span>
                                <span className="en-only">Religious Events</span>
                            </div>
                            <h3 className="activity-title ar-only">البرامج الدينية والاجتماعية</h3>
                            <h3 className="activity-title en-only">Religious & Social Programs</h3>
                            <p className="activity-desc ar-only">لقاءات إيمانية وإفطارات جماعية تقوي الروابط الأخوية في المناسبات المباركة.</p>
                            <p className="activity-desc en-only">Faith gatherings and group Iftars that strengthen brotherly bonds during blessed occasions.</p>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
};
