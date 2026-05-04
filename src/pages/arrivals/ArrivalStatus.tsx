// src/pages/arrivals/ArrivalStatus.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Clock, MessageSquare, CheckCircle, AlertCircle, Phone, User, ExternalLink } from 'lucide-react';
import { getArrivalText } from '@/i18n/pages';
import { ArrivalRequest, ArrivalStatus, Volunteer } from '@/integrations/supabase/types';
import { getArrivalRequestById, getVolunteerById } from '@/service/arrivalsCMS';
import { useAuth } from '@/context/AuthContext';
import ChatBox from '@/components/features/chat/ChatBox';
import { SmartTopBar } from '@/components/layout/SmartTopBar';
import { BottomNav } from '@/components/layout/BottomNav';

export default function ArrivalStatusPage({ lang = 'ar' }: { lang?: 'ar' | 'en' | 'tr' }) {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [request, setRequest] = useState<ArrivalRequest | null>(null);
    const [volunteer, setVolunteer] = useState<Volunteer | null>(null);
    const [loading, setLoading] = useState(true);
    const [showSearch, setShowSearch] = useState(false);
    const isRTL = lang === 'ar';

    useEffect(() => {
        if (id) {
            getArrivalRequestById(id)
                .then(data => {
                    setRequest(data);
                    if (data.volunteer_id) {
                        getVolunteerById(data.volunteer_id).then(v => setVolunteer(v));
                    }
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [id]);

    if (loading) return <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--bg,#07080b)', color: '#fff' }}>جاري التحميل...</div>;
    if (!request) return <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--bg,#07080b)', color: '#fff' }}>الطلب غير موجود.</div>;

    const getStatusDisplay = (status: ArrivalStatus) => {
        switch (status) {
            case ArrivalStatus.PENDING_ASSIGNMENT: return { color: '#eab308', icon: <Clock size={20} />, text: getArrivalText('status', lang)?.pending_assignment };
            case ArrivalStatus.ASSIGNED:
            case ArrivalStatus.CONTACTED: return { color: '#3b82f6', icon: <MessageSquare size={20} />, text: getArrivalText('status', lang)?.[status] };
            case ArrivalStatus.RECEIVED: return { color: '#10b981', icon: <CheckCircle size={20} />, text: getArrivalText('status', lang)?.received };
            case ArrivalStatus.ISSUE_DELAY: return { color: '#ef4444', icon: <AlertCircle size={20} />, text: getArrivalText('status', lang)?.issue_delay };
            default: return { color: '#a1a1aa', icon: <Clock size={20} />, text: 'غير معروف' };
        }
    };

    const statusDisplay = getStatusDisplay(request.status);
    const studentWhatsappUrl = `https://wa.me/${request.phone_whatsapp.replace(/\D/g, '')}`;

    return (
        <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-background text-foreground">
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
                <div className="p-4 max-w-screen-xl mx-auto"><SmartTopBar onOpenSearch={() => setShowSearch(true)} /></div>
            </header>

            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px 120px' }}>
                <button onClick={() => navigate('/arrivals')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '12px', background: 'var(--bg-1,#0d0f14)', border: '1px solid var(--border,#2a2e3d)', color: 'var(--text-2,#a1a1aa)', cursor: 'pointer', marginBottom: '24px' }}>
                    {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />}
                    <span>العودة لصفحة الاستقبال</span>
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>

                    {/* Column 1: Request Summary */}
                    <div style={{ background: 'var(--bg-1,#0d0f14)', border: '1px solid var(--border,#2a2e3d)', borderRadius: '16px', padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid var(--border,#2a2e3d)' }}>
                            <div style={{ background: `${statusDisplay.color}20`, color: statusDisplay.color, padding: '10px', borderRadius: '50%', display: 'flex' }}>{statusDisplay.icon}</div>
                            <div>
                                <h2 style={{ fontSize: '1.2rem', margin: 0 }}>ملخص طلبك</h2>
                                <p style={{ color: statusDisplay.color, fontSize: '0.9rem', margin: '4px 0 0', fontWeight: 600 }}>{statusDisplay.text}</p>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '0.95rem', color: 'var(--text-2,#a1a1aa)' }}>
                            <div>
                                <strong style={{ color: '#fff', display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>الاسم:</strong>
                                <span>{request.student_name}</span>
                            </div>
                            <div>
                                <strong style={{ color: '#fff', display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>رقم الواتساب:</strong>
                                <a href={studentWhatsappUrl} target="_blank" rel="noreferrer" style={{ color: '#25d366', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Phone size={14} />
                                    <span dir="ltr">{request.phone_whatsapp}</span>
                                    <ExternalLink size={12} />
                                </a>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <strong style={{ color: '#fff', display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>المطار:</strong>
                                    <span>{request.airport}</span>
                                </div>
                                <div>
                                    <strong style={{ color: '#fff', display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>الرحلة:</strong>
                                    <span dir="ltr">{request.flight_number}</span>
                                </div>
                            </div>
                            <div>
                                <strong style={{ color: '#fff', display: 'block', fontSize: '0.8rem', marginBottom: '4px' }}>وقت الوصول:</strong>
                                <span dir="ltr">{new Date(request.arrival_date).toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Volunteer Info Box */}
                        {volunteer && (
                            <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(200,168,75,0.08)', borderRadius: '16px', border: '1px solid rgba(200,168,75,0.15)' }}>
                                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.85rem', color: '#c8a84b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <User size={14} /> المتطوع المسؤول
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: '#fff' }}>{volunteer.full_name}</p>
                                    <a href={`tel:${volunteer.phone}`} style={{ color: '#fff', textDecoration: 'none', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.8 }}>
                                        <Phone size={14} color="#c8a84b" />
                                        <span dir="ltr">{volunteer.phone}</span>
                                    </a>
                                </div>
                            </div>
                        )}

                        {!volunteer && (
                            <div style={{ marginTop: '24px', padding: '16px', background: 'rgba(29,78,216,0.1)', borderRadius: '12px', border: '1px solid rgba(29,78,216,0.2)' }}>
                                <p style={{ fontSize: '0.85rem', color: '#60a5fa', margin: 0, lineHeight: '1.5' }}>يرجى الاحتفاظ برابط هذه الصفحة للعودة إليها ومتابعة حالة طلبك.</p>
                            </div>
                        )}
                    </div>

                    {/* Column 2: Live Chat */}
                    <div style={{ background: 'var(--bg-1,#0d0f14)', border: '1px solid var(--border,#2a2e3d)', borderRadius: '16px', display: 'flex', flexDirection: 'column', height: '600px', overflow: 'hidden' }}>
                        <div style={{ padding: '16px 24px', background: 'var(--bg-2,#14171f)', borderBottom: '1px solid var(--border,#2a2e3d)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <MessageSquare size={20} color="#c8a84b" />
                            <h3 style={{ margin: 0, fontSize: '1rem' }}>التواصل مع فريق الاستقبال</h3>
                        </div>
                        {request.status === ArrivalStatus.PENDING_ASSIGNMENT ? (
                            <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', color: 'var(--text-2,#a1a1aa)' }}>
                                <Clock size={40} style={{ opacity: 0.5, marginBottom: '16px' }} />
                                <p>جاري تعيين متطوع لخدمتك...<br />ستفتح المحادثة تلقائياً بمجرد التعيين.</p>
                            </div>
                        ) : (
                            <ChatBox
                                requestId={request.id}
                                currentUserRole="student"
                                currentUserId={id ?? ''}
                                lang={lang}
                            />
                        )}
                    </div>

                </div>
            </div>
            <BottomNav />
        </div>
    );
}