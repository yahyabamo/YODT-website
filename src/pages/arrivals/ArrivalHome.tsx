// src/pages/arrivals/ArrivalHome.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Check, PlaneLanding, MapPin, Users, Shield, X, Search, AlertCircle } from 'lucide-react';
import { getArrivalText } from '@/i18n/pages';
import { ArrivalRequest } from '@/integrations/supabase/types';
import { createArrivalRequest, getArrivalRequestByPhone } from '@/service/arrivalsCMS';

export default function ArrivalHome({ lang = 'ar' }: { lang?: 'ar' | 'en' | 'tr' }) {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [showTracking, setShowTracking] = useState(false);
    const [trackingPhone, setTrackingPhone] = useState('');
    const [trackingError, setTrackingError] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const isRTL = lang === 'ar';

    const [formData, setFormData] = useState<Partial<ArrivalRequest>>({
        student_name: '', phone_whatsapp: '', email: '', university_name: '',
        airport: 'IST', flight_number: '', arrival_date: '', needs_pickup: true, bags_count: 1, additional_notes: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const newRequest = await createArrivalRequest(formData);
            setShowForm(false);
            navigate(`/arrivals/status/${newRequest.id}`);
        } catch (err) {
            console.error(err);
            alert('حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مجدداً.');
        } finally {
            setLoading(false);
        }
    };

    const handleTrack = async () => {
        if (!trackingPhone.trim()) return;
        setIsSearching(true);
        setTrackingError('');
        try {
            const request = await getArrivalRequestByPhone(trackingPhone.trim());
            if (request) {
                navigate(`/arrivals/status/${request.id}`);
            } else {
                setTrackingError(getArrivalText('noRequestFound', lang));
            }
        } catch (err) {
            console.error(err);
            setTrackingError('An error occurred. Please try again.');
        } finally {
            setIsSearching(false);
        }
    };

    const closeForm = () => { setShowForm(false); setStep(1); };

    const inp: React.CSSProperties = {
        width: '100%', padding: '12px 16px', borderRadius: '12px',
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
        color: '#fff', fontSize: '0.95rem', marginTop: '6px', outline: 'none',
        transition: 'border 0.2s ease', boxSizing: 'border-box',
    };

    const features = [
        { icon: <Users size={22} />, title: 'فريق متطوع متخصص', desc: 'يضم فريقنا متطوعين خبراء في استقبال الطلاب القادمين إلى إسطنبول.' },
        { icon: <MapPin size={22} />, title: 'تغطية كلا المطارين', desc: 'نستقبل في مطار إسطنبول الجديد (IST) ومطار صبيحة كوكجن (SAW).' },
        { icon: <Shield size={22} />, title: 'تواصل مباشر وفوري', desc: 'محادثة مباشرة مع المتطوع المعين لك فور قبول طلبك.' },
    ];

    return (
        <div dir={isRTL ? 'rtl' : 'ltr'} style={{ background: '#07080b', minHeight: '100vh', color: '#fff' }}>



            {/* ── Hero ── */}
            <section style={{
                position: 'relative', minHeight: 'clamp(420px,60vh,580px)',
                display: 'flex', alignItems: 'flex-end', overflow: 'hidden',
                background: 'linear-gradient(135deg, #07080b 0%, #0b0a14 40%, #070b0d 100%)',
            }}>
                <div aria-hidden="true" style={{
                    position: 'absolute', inset: 0, zIndex: 0,
                    backgroundImage: 'linear-gradient(rgba(200,168,75,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(200,168,75,0.04) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                }} />
                <div aria-hidden="true" style={{ position: 'absolute', top: '-60px', ...(isRTL ? { right: '10%' } : { left: '10%' }), width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(6,95,120,0.35) 0%, transparent 70%)', filter: 'blur(60px)', zIndex: 0 }} />
                <div aria-hidden="true" style={{ position: 'absolute', bottom: '-40px', ...(isRTL ? { left: '15%' } : { right: '15%' }), width: '320px', height: '320px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(200,168,75,0.12) 0%, transparent 70%)', filter: 'blur(50px)', zIndex: 0 }} />
                <div aria-hidden="true" style={{ position: 'absolute', top: 0, ...(isRTL ? { left: 0 } : { right: 0 }), width: '350px', height: '350px', zIndex: 0, backgroundImage: 'repeating-conic-gradient(rgba(200,168,75,0.06) 0deg 10deg, transparent 10deg 20deg)', borderRadius: '0 0 0 100%' }} />

                <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '1260px', margin: '0 auto', padding: 'clamp(120px,18vw,200px) clamp(24px,5vw,48px) clamp(52px,6vw,80px)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                        <div style={{ height: '1px', width: '40px', background: '#c8a84b' }} />
                        <span style={{ color: '#c8a84b', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.25em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <PlaneLanding size={14} />
                            {getArrivalText('welcomeEyebrow', lang)}
                        </span>
                        <div style={{ height: '1px', width: '40px', background: '#c8a84b' }} />
                    </div>

                    <h1 style={{ color: '#fff', fontSize: 'clamp(2.4rem,6vw,4.2rem)', fontWeight: 900, lineHeight: 1.05, marginBottom: '20px', maxWidth: '800px', textShadow: '0 4px 24px rgba(0,0,0,0.7)', letterSpacing: '-0.02em' }}>
                        {getArrivalText('welcomeTitle', lang)}
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 'clamp(0.95rem,2vw,1.1rem)', maxWidth: '560px', lineHeight: 1.7, marginBottom: '40px', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                        {getArrivalText('welcomeDesc', lang)}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                        <button
                            onClick={() => { setShowForm(true); setShowTracking(false); }}
                            style={{ padding: '15px 40px', borderRadius: '100px', background: 'linear-gradient(135deg, #065f78, #c8a84b)', color: '#fff', fontSize: '1rem', fontWeight: 700, border: 'none', cursor: 'pointer', boxShadow: '0 8px 28px rgba(6,95,120,0.5)', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', gap: '10px' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 14px 40px rgba(6,95,120,0.6)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(6,95,120,0.5)'; }}
                        >
                            <PlaneLanding size={18} />
                            سجّل وصولك الآن
                        </button>

                        <button
                            onClick={() => setShowTracking(!showTracking)}
                            style={{ background: 'none', border: 'none', color: '#c8a84b', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', opacity: 0.8 }}
                        >
                            {getArrivalText('trackRequestBtn', lang)}
                        </button>
                    </div>

                    {/* ── Track Request Section ── */}
                    {showTracking && (
                        <div style={{ marginTop: '30px', width: '100%', maxWidth: '400px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '24px', animation: 'fadeInUp 0.4s ease' }}>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>{getArrivalText('trackRequestTitle', lang)}</h3>
                            <div style={{ position: 'relative' }}>
                                <input
                                    style={{ ...inp, paddingRight: isRTL ? '44px' : '16px', paddingLeft: isRTL ? '16px' : '44px' }}
                                    placeholder={getArrivalText('phonePlaceholder', lang)}
                                    value={trackingPhone}
                                    onChange={e => setTrackingPhone(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleTrack()}
                                />
                                <Search size={18} style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', [isRTL ? 'right' : 'left']: '14px', color: 'rgba(255,255,255,0.4)' }} />
                            </div>
                            {trackingError && (
                                <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', fontSize: '0.85rem', textAlign: 'start' }}>
                                    <AlertCircle size={14} />
                                    <span>{trackingError}</span>
                                </div>
                            )}
                            <button
                                onClick={handleTrack}
                                disabled={isSearching || !trackingPhone.trim()}
                                style={{ width: '100%', marginTop: '16px', padding: '12px', borderRadius: '12px', background: '#c8a84b', color: '#000', fontWeight: 700, border: 'none', cursor: 'pointer', opacity: isSearching ? 0.7 : 1 }}
                            >
                                {isSearching ? '...' : getArrivalText('searchBtn', lang)}
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* ── Feature Cards ── */}
            <section style={{ maxWidth: '1260px', margin: '0 auto', padding: 'clamp(40px,6vw,80px) clamp(16px,4vw,40px)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
                    {features.map((f, i) => (
                        <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'border-color 0.2s', cursor: 'default' }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(200,168,75,0.3)'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'}
                        >
                            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(200,168,75,0.12)', border: '1px solid rgba(200,168,75,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c8a84b' }}>{f.icon}</div>
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#fff' }}>{f.title}</h3>
                            <p style={{ margin: 0, fontSize: '0.88rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65 }}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── Bottom CTA Banner ── */}
            <section style={{ maxWidth: '1260px', margin: '0 auto', padding: '0 clamp(16px,4vw,40px) 100px' }}>
                <div style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, rgba(6,95,120,0.2) 0%, rgba(200,168,75,0.08) 100%)', border: '1px solid rgba(200,168,75,0.15)', borderRadius: '28px', padding: 'clamp(36px,6vw,56px)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '20px' }}>
                    <div aria-hidden="true" style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(200,168,75,0.06) 1px, transparent 0)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'rgba(6,95,120,0.2)', border: '1px solid rgba(6,95,120,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#38bdf8' }}>
                            <PlaneLanding size={28} />
                        </div>
                        <h2 style={{ color: '#fff', fontSize: 'clamp(1.4rem,3vw,2rem)', fontWeight: 800, marginBottom: '12px' }}>هل أنت قادم قريباً؟</h2>
                        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1rem', maxWidth: '480px', lineHeight: 1.65, marginBottom: '28px' }}>سجّل بيانات وصولك الآن وسيتواصل معك متطوع مخصص لمساعدتك فور هبوطك.</p>
                        <button
                            onClick={() => { setShowForm(true); setShowTracking(false); }}
                            style={{ padding: '14px 40px', borderRadius: '100px', background: '#065f78', color: '#fff', fontWeight: 700, fontSize: '1rem', border: 'none', cursor: 'pointer', boxShadow: '0 8px 24px rgba(6,95,120,0.45)', transition: 'all 0.3s ease' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#0a7a9a'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#065f78'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
                        >
                            ابدأ التسجيل
                        </button>
                    </div>
                </div>
            </section>

            {/* ── Slide-up Modal Form ── */}
            {showForm && (
                <>
                    <div onClick={closeForm} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }} />
                    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ position: 'fixed', zIndex: 101, bottom: 0, left: 0, right: 0, background: '#0d0f14', borderTop: '1px solid rgba(255,255,255,0.08)', borderTopLeftRadius: '28px', borderTopRightRadius: '28px', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 -20px 60px rgba(0,0,0,0.7)' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
                            <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.15)' }} />
                        </div>

                        <div style={{ padding: '24px clamp(20px,5vw,48px) 40px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: '20px' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                        <PlaneLanding size={18} color="#c8a84b" />
                                        <span style={{ color: '#c8a84b', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em' }}>تسجيل الوصول</span>
                                    </div>
                                    <h2 style={{ margin: 0, fontSize: 'clamp(1.2rem,3vw,1.6rem)', fontWeight: 800, color: '#fff' }}>
                                        {step === 1 && getArrivalText('step1Title', lang)}
                                        {step === 2 && getArrivalText('step2Title', lang)}
                                        {step === 3 && getArrivalText('step3Title', lang)}
                                    </h2>
                                </div>
                                <button onClick={closeForm} style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <X size={18} />
                                </button>
                            </div>

                            <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
                                {[1, 2, 3].map(n => (
                                    <div key={n} style={{ flex: 1, height: '4px', borderRadius: '4px', background: step >= n ? '#065f78' : 'rgba(255,255,255,0.1)', transition: 'background 0.3s ease' }} />
                                ))}
                            </div>

                            {step === 1 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '640px', margin: '0 auto' }}>
                                    {[
                                        { label: getArrivalText('fullName', lang), name: 'student_name', placeholder: 'أحمد محمد...', value: formData.student_name },
                                        { label: getArrivalText('whatsapp', lang), name: 'phone_whatsapp', placeholder: '+90 5XX XXX XX XX', value: formData.phone_whatsapp, dir: 'ltr' },
                                        { label: getArrivalText('email', lang), name: 'email', placeholder: 'student@example.com', value: formData.email, type: 'email', dir: 'ltr' },
                                        { label: getArrivalText('university', lang), name: 'university_name', placeholder: 'Istanbul University...', value: formData.university_name },
                                    ].map(field => (
                                        <div key={field.name}>
                                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '6px' }}>{field.label}</label>
                                            <input style={inp} name={field.name} type={field.type ?? 'text'} value={field.value ?? ''} onChange={handleChange} placeholder={field.placeholder} dir={(field as any).dir} />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {step === 2 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '640px', margin: '0 auto' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '6px' }}>{getArrivalText('arrivalDate', lang)}</label>
                                        <input style={inp} type="datetime-local" name="arrival_date" value={formData.arrival_date} onChange={handleChange} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '6px' }}>{getArrivalText('airport', lang)}</label>
                                        <select style={inp} name="airport" value={formData.airport} onChange={handleChange}>
                                            <option value="IST">✈ مطار إسطنبول الجديد (IST)</option>
                                            <option value="SAW">✈ مطار صبيحة كوكجن (SAW)</option>
                                        </select>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '6px' }}>{getArrivalText('flightNumber', lang)}</label>
                                            <input style={inp} name="flight_number" value={formData.flight_number} onChange={handleChange} placeholder="TK1234" dir="ltr" />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '6px' }}>{getArrivalText('bagsCount', lang)}</label>
                                            <input style={inp} type="number" min="0" name="bags_count" value={formData.bags_count} onChange={handleChange} />
                                        </div>
                                    </div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '14px 16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                        <input type="checkbox" name="needs_pickup" checked={formData.needs_pickup} onChange={handleChange} style={{ width: '18px', height: '18px', accentColor: '#065f78' }} />
                                        <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>{getArrivalText('needsPickup', lang)}</span>
                                    </label>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: '6px' }}>{getArrivalText('notes', lang)}</label>
                                        <textarea style={{ ...inp, minHeight: '80px', resize: 'vertical' }} name="additional_notes" value={formData.additional_notes} onChange={handleChange} />
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div style={{ maxWidth: '640px', margin: '0 auto' }}>
                                    <div style={{ background: 'rgba(6,95,120,0.1)', border: '1px solid rgba(6,95,120,0.25)', borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.93rem' }}>
                                        {[
                                            { label: getArrivalText('fullName', lang), value: formData.student_name },
                                            { label: getArrivalText('whatsapp', lang), value: formData.phone_whatsapp, ltr: true },
                                            { label: getArrivalText('email', lang), value: formData.email, ltr: true },
                                            { label: getArrivalText('airport', lang), value: formData.airport },
                                            { label: getArrivalText('arrivalDate', lang), value: formData.arrival_date?.replace('T', ' '), ltr: true },
                                            { label: getArrivalText('flightNumber', lang), value: formData.flight_number, ltr: true },
                                        ].map(row => (
                                            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>{row.label}</span>
                                                <span style={{ color: '#fff', fontWeight: 600 }} dir={row.ltr ? 'ltr' : undefined}>{row.value || '—'}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <p style={{ marginTop: '16px', color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem', textAlign: 'center', lineHeight: 1.6 }}>
                                        يرجى التأكد من صحة البيانات قبل الإرسال. بمجرد الإرسال سيتم تعيين متطوع لخدمتك.
                                    </p>
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', maxWidth: '640px', margin: '32px auto 0' }}>
                                {step > 1 ? (
                                    <button onClick={() => setStep(step - 1)} style={{ padding: '12px 24px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '0.9rem' }}>
                                        {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}{getArrivalText('prevBtn', lang)}
                                    </button>
                                ) : <div />}
                                {step < 3 ? (
                                    <button onClick={() => setStep(step + 1)} style={{ padding: '12px 28px', borderRadius: '12px', background: 'linear-gradient(135deg, #065f78, #0a8ca8)', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '0.95rem', boxShadow: '0 4px 16px rgba(6,95,120,0.35)' }}>
                                        {getArrivalText('nextBtn', lang)}{isRTL ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
                                    </button>
                                ) : (
                                    <button onClick={handleSubmit} disabled={loading} style={{ padding: '12px 28px', borderRadius: '12px', background: loading ? 'rgba(16,185,129,0.5)' : 'linear-gradient(135deg, #059669, #10b981)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 16px rgba(16,185,129,0.3)' }}>
                                        {loading ? 'جاري الإرسال...' : <><Check size={16} />{getArrivalText('submitBtn', lang)}</>}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}