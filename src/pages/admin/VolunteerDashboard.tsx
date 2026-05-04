// src/pages/admin/VolunteerDashboard.tsx
import React, { useState, useEffect } from 'react';
import { PlaneLanding, Clock, MessageSquare, CheckCircle, MapPin } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ArrivalRequest, ArrivalStatus } from '@/integrations/supabase/types';
import { getArrivalText } from '@/i18n/pages';
import { getRequestsByVolunteer, updateRequestStatus } from '@/service/arrivalsCMS';
import { SmartTopBar } from '@/components/layout/SmartTopBar';
import { BottomNav } from '@/components/layout/BottomNav';
import { toast } from 'sonner';

export default function VolunteerDashboard({ lang = 'ar' }: { lang?: 'ar' | 'en' | 'tr' }) {
    const { user, profile } = useAuth();
    const [assignedRequests, setAssignedRequests] = useState<ArrivalRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [showSearch, setShowSearch] = useState(false);
    const isRTL = lang === 'ar';

    useEffect(() => {
        if (!user) return;
        const load = async () => {
            setLoading(true);
            try {
                const data = await getRequestsByVolunteer(user.id);
                setAssignedRequests(data);
            } catch (err) {
                console.error(err);
                toast.error('فشل في تحميل الطلبات.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [user]);

    const handleMarkReceived = async (requestId: string) => {
        try {
            await updateRequestStatus(requestId, ArrivalStatus.RECEIVED);
            setAssignedRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: ArrivalStatus.RECEIVED } : r));
            toast.success('تم تحديد الطالب كـ "تم الاستقبال".');
        } catch (err) {
            console.error(err);
            toast.error('فشل في تحديث الحالة.');
        }
    };

    const cardStyle: React.CSSProperties = {
        background: 'var(--bg-1, #0d0f14)', border: '1px solid var(--border, #2a2e3d)',
        borderRadius: '16px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px',
    };

    const volunteerName = profile?.full_name ?? 'المتطوع';

    return (
        <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-background text-foreground">
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
                <div className="p-4 max-w-screen-xl mx-auto"><SmartTopBar onOpenSearch={() => setShowSearch(true)} /></div>
            </header>

            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px 120px' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <div>
                        <h1 style={{ fontSize: '1.8rem', margin: '0 0 8px 0' }}>مرحباً، {volunteerName}</h1>
                        <p style={{ color: 'var(--text-2, #a1a1aa)', margin: 0 }}>هذه هي الطلبات المسندة إليك لاستقبالها.</p>
                    </div>
                    <div style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '8px 16px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', display: 'inline-block' }} />
                        متاح للاستقبال
                    </div>
                </header>

                {loading ? <p>جاري التحميل...</p> : assignedRequests.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-2)', padding: '60px 20px' }}>
                        <PlaneLanding size={48} style={{ opacity: 0.3, margin: '0 auto 16px' }} />
                        <p>لا توجد طلبات مسندة إليك حالياً.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '20px' }}>
                        {assignedRequests.map(req => (
                            <div key={req.id} style={cardStyle}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h3 style={{ fontSize: '1.2rem', margin: '0 0 4px 0' }}>{req.student_name}</h3>
                                        <span style={{ color: req.status === ArrivalStatus.RECEIVED ? '#10b981' : '#3b82f6', fontSize: '0.85rem', fontWeight: 600, background: req.status === ArrivalStatus.RECEIVED ? 'rgba(16,185,129,0.1)' : 'rgba(59,130,246,0.1)', padding: '4px 8px', borderRadius: '6px' }}>
                                            {getArrivalText('status', lang)?.[req.status]}
                                        </span>
                                    </div>
                                    <PlaneLanding size={24} color="var(--text-2, #a1a1aa)" />
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.9rem', color: 'var(--text-2, #a1a1aa)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MapPin size={16} /><span>{req.airport} - رحلة <span dir="ltr">{req.flight_number}</span></span></div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={16} /><span dir="ltr">{req.arrival_date?.replace('T', ' ')}</span></div>
                                    {req.phone_whatsapp && <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MessageSquare size={16} /><a href={`https://wa.me/${req.phone_whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" style={{ color: '#25d366', textDecoration: 'none' }}>{req.phone_whatsapp}</a></div>}
                                </div>

                                <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border, #2a2e3d)', display: 'flex', gap: '12px' }}>
                                    <a href={`/arrivals/status/${req.id}`} target="_blank" rel="noreferrer" style={{ flex: 1, background: '#1d4ed8', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 600, textDecoration: 'none' }}>                                        <MessageSquare size={18} />المحادثة
                                    </a>
                                    {req.status !== ArrivalStatus.RECEIVED && (
                                        <button onClick={() => handleMarkReceived(req.id)} title="تحديد كـ 'تم الاستقبال'" style={{ background: 'var(--bg-2, #14171f)', color: '#fff', border: '1px solid var(--border)', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}>
                                            <CheckCircle size={18} color="#10b981" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <BottomNav />
        </div>
    );
}