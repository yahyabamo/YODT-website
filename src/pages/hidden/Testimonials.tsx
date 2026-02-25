
import React from 'react';

export const Testimonials = () => {
    return (
        <section id="testimonials" className="section-pad">
            <div className="container">
                <div className="section-header center-line reveal" style={{ marginBottom: '60px' }}>
                    <div className="tag" style={{ display: 'inline-flex', margin: '0 auto 20px' }}><span className="dot"></span>
                        <span className="ar-only">آراء الأعضاء</span>
                        <span className="en-only">Member Testimonials</span>
                    </div>
                    <h2 className="heading-lg">
                        <span className="ar-only">ماذا يقول<br />أعضاؤنا؟</span>
                        <span className="en-only">What Do Our<br />Members Say?</span>
                    </h2>
                    <div className="divider-line"></div>
                </div>

                <div className="testimonials-grid">
                    {/* Testimonial 1 */}
                    <div className="testimonial-card reveal delay-1">
                        <div className="testimonial-stars">⭐⭐⭐⭐⭐</div>
                        <p className="testimonial-text">
                            <span className="ar-only">الاتحاد كان السند الأول لي عندما وصلت إلى إسطنبول. ساعدني في إيجاد سكن مناسب والتسجيل في الجامعة خلال أسبوع واحد فقط. لا أستطيع تخيل رحلتي هنا بدونهم.</span>
                            <span className="en-only">The union was my first support when I arrived in Istanbul. They helped me find suitable housing and register at the university within just one week. I can't imagine my journey here without them.</span>
                        </p>
                        <div className="testimonial-author">
                            <div className="author-avatar">أ.م</div>
                            <div className="author-info">
                                <div className="author-name ar-only">أحمد المحمدي</div>
                                <div className="author-name en-only">Ahmed Al-Mohammadi</div>
                                <div className="author-meta ar-only">طالب هندسة · جامعة إسطنبول التقنية</div>
                                <div className="author-meta en-only">Engineering Student · Istanbul Technical University</div>
                            </div>
                        </div>
                    </div>

                    {/* Testimonial 2 */}
                    <div className="testimonial-card reveal delay-2">
                        <div className="testimonial-stars">⭐⭐⭐⭐⭐</div>
                        <p className="testimonial-text">
                            <span className="ar-only">ما يميز الاتحاد هو الدعم الحقيقي والاهتمام الصادق. ساعدوني في حل مشكلة إقامتي بسرعة ولم يتركوني أواجه البيروقراطية وحدي. شكرًا لكل هذا الجهد.</span>
                            <span className="en-only">What distinguishes the union is genuine support and sincere care. They helped me resolve my residence issue quickly and didn't leave me to face bureaucracy alone. Thank you for all this effort.</span>
                        </p>
                        <div className="testimonial-author">
                            <div className="author-avatar">ر.ع</div>
                            <div className="author-info">
                                <div className="author-name ar-only">ريم العمري</div>
                                <div className="author-name en-only">Reem Al-Omari</div>
                                <div className="author-meta ar-only">طالبة طب · جامعة مرمرة</div>
                                <div className="author-meta en-only">Medical Student · Marmara University</div>
                            </div>
                        </div>
                    </div>

                    {/* Testimonial 3 */}
                    <div className="testimonial-card reveal delay-3">
                        <div className="testimonial-stars">⭐⭐⭐⭐⭐</div>
                        <p className="testimonial-text">
                            <span className="ar-only">انضممت للاتحاد منذ سنتين وما زلت أستفيد من كل خدماته. الفعاليات الاجتماعية جعلتني أشعر أنني في وطن ثانٍ، والخصومات ساعدتني في توفير مصاريف كثيرة.</span>
                            <span className="en-only">I joined the union two years ago and I'm still benefiting from all its services. The social events made me feel like I'm in a second home, and the discounts helped me save a lot of expenses.</span>
                        </p>
                        <div className="testimonial-author">
                            <div className="author-avatar">خ.ه</div>
                            <div className="author-info">
                                <div className="author-name ar-only">خالد الهمداني</div>
                                <div className="author-name en-only">Khaled Al-Hamdani</div>
                                <div className="author-meta ar-only">طالب اقتصاد · جامعة إسطنبول</div>
                                <div className="author-meta en-only">Economics Student · Istanbul University</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
