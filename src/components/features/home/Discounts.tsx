
import React from 'react';

export const Discounts = () => {
    return (
        <section id="discounts" className="section-pad">
            <div className="container">
                <div className="guide-intro reveal" style={{ textAlign: 'center' }}>
                    <div className="tag" style={{ display: 'inline-flex', margin: '0 auto 20px' }}><span className="dot"></span>
                        <span className="ar-only">تخفيضات الأعضاء</span>
                        <span className="en-only">Member Discounts</span>
                    </div>

                    <div className="divider-line" style={{ margin: '20px auto' }}></div>
                    <p style={{ color: 'var(--text-2)', fontSize: '1.05rem', lineHeight: 1.8, maxWidth: '600px', margin: '0 auto', fontWeight: 600 }}>
                        <span className="ar-only">وفر أكثر مع<br />بطاقة العضوية</span>
                        <span className="en-only">Save More With<br />Membership Card</span>
                    </p>
                </div>

                <div className="discounts-grid">
                    {/* Discount Item */}
                    <div className="discount-card reveal delay-1">
                        <div className="discount-percent">تخفيضات مستمرة لمطاعم متنوعة</div>
                        <div className="discount-info">
                            <div className="discount-cat ar-only">مطاعم</div>
                            <div className="discount-cat en-only">Restaurants</div>
                        </div>
                    </div>

                    <div className="discount-card reveal delay-2">
                        <div className="discount-percent">دورات تعليمية </div>
                        <div className="discount-info">
                            <div className="discount-cat ar-only">تعليم</div>
                            <div className="discount-cat en-only">Education</div>
                        </div>
                    </div>

                    <div className="discount-card reveal delay-3">
                        <div className="discount-percent">خدمات طلابية</div>
                        <div className="discount-info">
                            <div className="discount-cat ar-only">خدمات</div>
                            <div className="discount-cat en-only">Services</div>
                        </div>
                    </div>

                    <div className="discount-card join-card reveal delay-4">
                        <div className="join-content">
                            <p className="ar-only">انضم لشبكة شركائنا وقدم خصومات للطلاب.</p>
                            <p className="en-only">Join our partner network and offer discounts to students.</p>
                            <a href="#" className="btn btn-outline btn-sm">
                                <span className="ar-only">تواصل معنا</span>
                                <span className="en-only">Contact Us</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
