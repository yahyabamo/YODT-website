// src/pages/admin/ArrivalsDashboard.tsx
import React, { useEffect, useState } from 'react';
import { Users, Clock, CheckCircle, MessageSquare } from 'lucide-react';
import { getArrivalText } from '@/i18n/pages';
import { ArrivalRequest, ArrivalStatus, Volunteer } from '@/integrations/supabase/types';
import { getAllArrivalRequests, getAvailableVolunteers, assignVolunteerToRequest } from '@/service/arrivalsCMS';
import { toast } from 'sonner';

export default function ArrivalsDashboard({ lang = 'ar' }: { lang?: 'ar' | 'en' | 'tr' }) {
    const [requests, setRequests] = useState<ArrivalRequest[]>([]);
    const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
    const [loading, setLoading] = useState(true);
    const isRTL = lang === 'ar';

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [reqs, vols] = await Promise.all([getAllArrivalRequests(), getAvailableVolunteers()]);
                setRequests(reqs);
                setVolunteers(vols);
            } catch (err) {
                console.error(err);
                toast.error('فشل في تحميل البيانات.');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleAssignVolunteer = async (requestId: string, volunteerId: string) => {
        if (!volunteerId) return;
        try {
            await assignVolunteerToRequest(requestId, volunteerId);
            setRequests(prev => prev.map(r => r.id === requestId ? { ...r, volunteer_id: volunteerId, status: ArrivalStatus.ASSIGNED } : r));
            toast.success('تم تعيين المتطوع بنجاح!');
        } catch (err) {
            console.error(err);
            toast.error('فشل في تعيين المتطوع.');
        }
    };

    const stats = {
        total: requests.length,
        pending: requests.filter(r => r.status === ArrivalStatus.PENDING_ASSIGNMENT).length,
        assigned: requests.filter(r => r.status === ArrivalStatus.ASSIGNED || r.status === ArrivalStatus.CONTACTED).length,
        received: requests.filter(r => r.status === ArrivalStatus.RECEIVED).length,
    };

    const statCardStyle: React.CSSProperties = { background: 'var(--bg-1, #0d0f14)', border: '1px solid var(--border, #2a2e3d)', padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px' };

    if (loading) return <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', background: 'var(--bg,#07080b)' }}>جاري التحميل...</div>;

    return (
        <div style={{ background: 'var(--bg, #07080b)', minHeight: '100vh', direction: isRTL ? 'rtl' : 'ltr', color: 'var(--text-1, #fff)', padding: '40px 20px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '1.8rem', marginBottom: '32px' }}>لوحة تحكم الاستقبال</h1>

                {/* Stats Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                    <div style={statCardStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ color: 'var(--text-2)' }}>إجمالي الطلبات</span><Users size={20} color="#a1a1aa" /></div>
                        <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.total}</span>
                    </div>
                    <div style={{ ...statCardStyle, borderBottom: '4px solid #eab308' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ color: 'var(--text-2)' }}>بانتظار التعيين</span><Clock size={20} color="#eab308" /></div>
                        <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.pending}</span>
                    </div>
                    <div style={{ ...statCardStyle, borderBottom: '4px solid #3b82f6' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ color: 'var(--text-2)' }}>تم التعيين / التواصل</span><MessageSquare size={20} color="#3b82f6" /></div>
                        <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.assigned}</span>
                    </div>
                    <div style={{ ...statCardStyle, borderBottom: '4px solid #10b981' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span style={{ color: 'var(--text-2)' }}>تم الاستقبال</span><CheckCircle size={20} color="#10b981" /></div>
                        <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.received}</span>
                    </div>
                </div>

                {/* Requests Table */}
                <div style={{ background: 'var(--bg-1, #0d0f14)', border: '1px solid var(--border, #2a2e3d)', borderRadius: '16px', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: isRTL ? 'right' : 'left' }}>
                            <thead>
                                <tr style={{ background: 'var(--bg-2, #14171f)', borderBottom: '1px solid var(--border, #2a2e3d)', color: 'var(--text-2)', fontSize: '0.9rem' }}>
                                    {['الطالب', 'المطار / الرحلة', 'وقت الوصول', 'الحالة', 'المتطوع', 'إجراءات'].map(h => <th key={h} style={{ padding: '16px' }}>{h}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {requests.length === 0 ? (
                                    <tr><td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-2)' }}>لا توجد طلبات بعد.</td></tr>
                                ) : requests.map(req => (
                                    <tr key={req.id} style={{ borderBottom: '1px solid var(--border, #2a2e3d)' }}>
                                        <td style={{ padding: '16px', fontWeight: 600 }}>{req.student_name}</td>
                                        <td style={{ padding: '16px', color: 'var(--text-2)' }} dir="ltr">{req.airport} - {req.flight_number}</td>
                                        <td style={{ padding: '16px', color: 'var(--text-2)' }} dir="ltr">{req.arrival_date?.split('T')[0]}<br />{req.arrival_date?.split('T')[1]}</td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600, background: req.status === ArrivalStatus.PENDING_ASSIGNMENT ? 'rgba(234,179,8,0.1)' : 'rgba(59,130,246,0.1)', color: req.status === ArrivalStatus.PENDING_ASSIGNMENT ? '#eab308' : '#3b82f6' }}>
                                                {getArrivalText('status', lang)?.[req.status]}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <select value={req.volunteer_id || ''} onChange={e => handleAssignVolunteer(req.id, e.target.value)} style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', color: '#fff', padding: '8px 12px', borderRadius: '8px', width: '100%', outline: 'none' }}>
                                                <option value="" disabled>اختر متطوع...</option>
                                                {volunteers.map(v => <option key={v.id} value={v.id}>{v.full_name}</option>)}
                                            </select>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <a href={`/arrivals/status/${req.id}`} target="_blank" rel="noreferrer" style={{ background: '#1d4ed8', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', textDecoration: 'none' }}>                                                متابعة
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}