
import React from 'react';

export const Partners = () => {
    return (
        <section id="partners">
            <div className="container">
                <div className="section-header center-line reveal" style={{ marginBottom: '60px' }}>
                    <div className="tag" style={{ display: 'inline-flex', margin: '0 auto 20px' }}>
                        <span className="dot"></span>
                        <span className="ar-only">شركاء النجاح</span>
                        <span className="en-only">Partners of Success</span>
                    </div>

                    {/* <h2 className="heading-lg">
                        <span className="ar-only">نعتز بشراكاتنا<br />الاستراتيجية</span>
                        <span className="en-only">We Cherish Our<br />Strategic Partnerships</span>
                    </h2> */}

                    <div className="divider-line"></div>

                    <p>
                        <span className="ar-only">نفخر بشراكاتنا مع مؤسسات بارزة في إسطنبول تدعم الطلاب اليمنيين.</span>
                        <span className="en-only">We are proud of our partnerships with prominent institutions in Istanbul that support Yemeni students.</span>
                    </p>
                </div>

                <div className="partners-grid reveal">
                    {/* Partner 1 */}
                    <div className="partner-item delay-1">
                        <div className="partner-placeholder">
                            <div className="partner-logo-box"><span style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontWeight: 600 }}>UNI</span></div>
                            <div className="partner-name ar-only">جامعة إسطنبول</div>
                            <div className="partner-name en-only">Istanbul University</div>
                        </div>
                    </div>

                    {/* Partner 2 */}
                    <div className="partner-item delay-2">
                        <div className="partner-placeholder">
                            <div className="partner-logo-box"><span style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontWeight: 600 }}>EDU</span></div>
                            <div className="partner-name ar-only">مركز التعليم التقني</div>
                            <div className="partner-name en-only">Tech Education Center</div>
                        </div>
                    </div>

                    {/* Partner 3 */}
                    <div className="partner-item delay-3">
                        <div className="partner-placeholder">
                            <div className="partner-logo-box"><span style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontWeight: 600 }}>MED</span></div>
                            <div className="partner-name ar-only">المركز الطبي</div>
                            <div className="partner-name en-only">Medical Center</div>
                        </div>
                    </div>

                    {/* Partner 4 */}
                    <div className="partner-item delay-1">
                        <div className="partner-placeholder">
                            <div className="partner-logo-box"><span style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontWeight: 600 }}>LAW</span></div>
                            <div className="partner-name ar-only">مكتب استشارات قانونية</div>
                            <div className="partner-name en-only">Legal Consulting</div>
                        </div>
                    </div>

                    {/* Partner 5 */}
                    <div className="partner-item delay-2">
                        <div className="partner-placeholder">
                            <div className="partner-logo-box"><span style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontWeight: 600 }}>TECH</span></div>
                            <div className="partner-name ar-only">شركة تقنية</div>
                            <div className="partner-name en-only">Tech Company</div>
                        </div>
                    </div>

                    {/* Partner 6 */}
                    <div className="partner-item delay-3">
                        <div className="partner-placeholder">
                            <div className="partner-logo-box"><span style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontWeight: 600 }}>REST</span></div>
                            <div className="partner-name ar-only">سلسلة مطاعم</div>
                            <div className="partner-name en-only">Restaurant Chain</div>
                        </div>
                    </div>

                    {/* Partner 7 */}
                    <div className="partner-item delay-1">
                        <div className="partner-placeholder">
                            <div className="partner-logo-box"><span style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontWeight: 600 }}>BANK</span></div>
                            <div className="partner-name ar-only">خدمات مالية</div>
                            <div className="partner-name en-only">Financial Services</div>
                        </div>
                    </div>

                    {/* Partner 8 */}
                    <div className="partner-item delay-2">
                        <div className="partner-placeholder">
                            <div className="partner-logo-box"><span style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontWeight: 600 }}>LANG</span></div>
                            <div className="partner-name ar-only">مركز اللغات</div>
                            <div className="partner-name en-only">Language Center</div>
                        </div>
                    </div>

                    {/* Partner 9 */}
                    <div className="partner-item delay-3">
                        <div className="partner-placeholder">
                            <div className="partner-logo-box"><span style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontWeight: 600 }}>PRINT</span></div>
                            <div className="partner-name ar-only">خدمات الطباعة</div>
                            <div className="partner-name en-only">Printing Services</div>
                        </div>
                    </div>

                    {/* Partner 10 */}
                    <div className="partner-item delay-1">
                        <div className="partner-placeholder">
                            <div className="partner-logo-box"><span style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontWeight: 600 }}>BOOK</span></div>
                            <div className="partner-name ar-only">دار نشر</div>
                            <div className="partner-name en-only">Publishing House</div>
                        </div>
                    </div>

                    {/* Partner 11 */}
                    <div className="partner-item delay-2">
                        <div className="partner-placeholder">
                            <div className="partner-logo-box"><span style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontWeight: 600 }}>HLTH</span></div>
                            <div className="partner-name ar-only">صيدلية</div>
                            <div className="partner-name en-only">Pharmacy</div>
                        </div>
                    </div>

                    {/* Partner 12 */}
                    <div className="partner-item delay-3">
                        <div className="partner-placeholder">
                            <div className="partner-logo-box"><span style={{ fontSize: '0.7rem', color: 'var(--text-3)', fontWeight: 600 }}>VISA</span></div>
                            <div className="partner-name ar-only">خدمات التأشيرة</div>
                            <div className="partner-name en-only">Visa Services</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
