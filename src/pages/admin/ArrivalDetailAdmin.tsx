// src/pages/admin/ArrivalDetailAdmin.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Clock, MessageSquare, CheckCircle, AlertCircle, Phone, User, Users, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { getArrivalRequestById, getVolunteerById, updateRequestStatus } from '@/service/arrivalsCMS';
import { ArrivalRequest, ArrivalStatus, Volunteer } from '@/integrations/supabase/types';
import { useAuth } from '@/context/AuthContext';
import ChatBox from '@/components/features/chat/ChatBox';
import { toast } from 'sonner';

export default function ArrivalDetailAdmin() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { profile } = useAuth();
    const [request, setRequest] = useState<ArrivalRequest | null>(null);
    const [volunteer, setVolunteer] = useState<Volunteer | null>(null);
    const [loading, setLoading] = useState(true);
    const [detailsOpen, setDetailsOpen] = useState(false); // mobile collapsible

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

    const handleStatusUpdate = async (newStatus: ArrivalStatus) => {
        if (!request) return;
        try {
            await updateRequestStatus(request.id, newStatus);
            setRequest(prev => prev ? { ...prev, status: newStatus } : null);
            toast.success('تم تحديث الحالة بنجاح');
        } catch (err) {
            toast.error('فشل تحديث الحالة');
        }
    };

    if (loading) return <div className="p-8 text-center animate-pulse">جاري التحميل...</div>;
    if (!request) return <div className="p-8 text-center">الطلب غير موجود.</div>;

    const whatsappUrl = `https://wa.me/${request.phone_whatsapp.replace(/\s+/g, '')}`;

    const statusBadgeClass = request.status === ArrivalStatus.RECEIVED
        ? 'bg-green-100 text-green-700'
        : request.status === ArrivalStatus.PENDING_ASSIGNMENT
            ? 'bg-yellow-100 text-yellow-700'
            : 'bg-blue-100 text-blue-700';

    const statusLabel = {
        [ArrivalStatus.PENDING_ASSIGNMENT]: 'قيد الانتظار',
        [ArrivalStatus.ASSIGNED]: 'تم التعيين',
        [ArrivalStatus.CONTACTED]: 'تم التواصل',
        [ArrivalStatus.RECEIVED]: 'تم الاستلام',
        [ArrivalStatus.ISSUE_DELAY]: 'تأخير / مشكلة',
    };

    return (
        <div className="p-3 md:p-6 lg:p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
            {/* Back button */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 mb-4 md:mb-6 text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
                <ArrowRight size={18} />
                <span>العودة للوحة التحكم</span>
            </button>

            {/* ── Mobile: collapsible details strip ── */}
            <div className="lg:hidden mb-4 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Header — always visible */}
                <button
                    onClick={() => setDetailsOpen(o => !o)}
                    className="w-full flex items-center justify-between p-4"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                            {request.student_name.charAt(0)}
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-sm text-gray-900">{request.student_name}</p>
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${statusBadgeClass}`}>
                                {statusLabel[request.status]}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <a href={whatsappUrl} target="_blank" rel="noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600"
                        >
                            <Phone size={14} />
                        </a>
                        {detailsOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                    </div>
                </button>

                {/* Collapsible body */}
                {detailsOpen && (
                    <div className="border-t border-gray-100 p-4 space-y-4">
                        {/* Status update buttons */}
                        <div>
                            <p className="text-xs text-gray-400 font-semibold mb-2 flex items-center gap-1">
                                <Clock size={12} /> تحديث الحالة
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.values(ArrivalStatus).map(status => (
                                    <button
                                        key={status}
                                        onClick={() => handleStatusUpdate(status)}
                                        className={`text-center px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                                            request.status === status
                                                ? 'bg-primary text-white border-primary shadow-md'
                                                : 'bg-white text-gray-600 border-gray-100 hover:bg-gray-50'
                                        }`}
                                    >
                                        {statusLabel[status]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Info grid */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <label className="text-xs text-gray-400 block mb-0.5">المطار</label>
                                <p className="font-medium">{request.airport}</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 block mb-0.5">رقم الرحلة</label>
                                <p className="font-medium" dir="ltr">{request.flight_number}</p>
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs text-gray-400 block mb-0.5">وقت الوصول</label>
                                <p className="font-medium" dir="ltr">{new Date(request.arrival_date).toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Volunteer */}
                        <div className={`rounded-xl p-3 flex items-center gap-3 ${volunteer ? 'bg-blue-50' : 'bg-gray-50'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${volunteer ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-400'}`}>
                                <Users size={15} />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 mb-0.5">المتطوع المعين</p>
                                {volunteer ? (
                                    <>
                                        <p className="font-bold text-blue-800 text-sm leading-tight">{volunteer.full_name}</p>
                                        <a href={`tel:${volunteer.phone}`} className="text-blue-600 text-xs flex items-center gap-1 mt-0.5">
                                            <Phone size={10} />
                                            <span dir="ltr">{volunteer.phone}</span>
                                        </a>
                                    </>
                                ) : (
                                    <p className="text-gray-400 text-xs">لم يُعيَّن متطوع بعد</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Desktop: 3-col grid ── */}
            <div className="hidden lg:grid grid-cols-3 gap-8">
                {/* Column 1: Details & Control */}
                <div className="col-span-1 space-y-6">
                    {/* Student card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="font-bold text-gray-800 flex items-center gap-2">
                                <User size={18} className="text-primary" />
                                تفاصيل الطالب
                            </h2>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusBadgeClass}`}>
                                {statusLabel[request.status]}
                            </span>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">الاسم الكامل</label>
                                <p className="font-semibold text-gray-900">{request.student_name}</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">رقم الواتساب</label>
                                <a href={whatsappUrl} target="_blank" rel="noreferrer"
                                    className="font-semibold text-primary flex items-center gap-1 hover:underline"
                                >
                                    <Phone size={14} />
                                    <span dir="ltr">{request.phone_whatsapp}</span>
                                    <ExternalLink size={12} />
                                </a>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">البريد الإلكتروني</label>
                                <p className="text-gray-700">{request.email}</p>
                            </div>
                            <div className="pt-4 border-t border-gray-50 grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">المطار</label>
                                    <p className="font-medium text-gray-800">{request.airport}</p>
                                </div>
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">رقم الرحلة</label>
                                    <p className="font-medium text-gray-800" dir="ltr">{request.flight_number}</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">تاريخ الوصول</label>
                                <p className="font-medium text-gray-800" dir="ltr">{new Date(request.arrival_date).toLocaleString()}</p>
                            </div>
                            {request.additional_notes && (
                                <div>
                                    <label className="text-xs text-gray-400 block mb-1">ملاحظات إضافية</label>
                                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{request.additional_notes}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Status control */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Clock size={18} className="text-primary" />
                            تحديث الحالة
                        </h3>
                        <div className="grid grid-cols-1 gap-2">
                            {Object.values(ArrivalStatus).map(status => (
                                <button
                                    key={status}
                                    onClick={() => handleStatusUpdate(status)}
                                    className={`text-right px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                                        request.status === status
                                            ? 'bg-primary text-white border-primary shadow-md'
                                            : 'bg-white text-gray-600 border-gray-100 hover:bg-gray-50'
                                    }`}
                                >
                                    {statusLabel[status]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Volunteer card — always shown */}
                    <div className={`rounded-2xl border p-5 ${volunteer ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100'}`}>
                        <h4 className="font-bold mb-3 flex items-center gap-2 text-sm text-gray-700">
                            <Users size={16} className={volunteer ? 'text-blue-600' : 'text-gray-400'} />
                            المتطوع المعين
                        </h4>
                        {volunteer ? (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
                                        {volunteer.full_name.charAt(0)}
                                    </div>
                                    <p className="text-blue-800 font-bold text-sm">{volunteer.full_name}</p>
                                </div>
                                <a
                                    href={`tel:${volunteer.phone}`}
                                    className="flex items-center gap-2 text-blue-600 text-sm hover:underline"
                                >
                                    <Phone size={14} />
                                    <span dir="ltr">{volunteer.phone}</span>
                                </a>
                                <a
                                    href={`https://wa.me/${volunteer.phone?.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center gap-2 text-emerald-600 text-sm hover:underline"
                                >
                                    <ExternalLink size={13} />
                                    <span>واتساب المتطوع</span>
                                </a>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                                <Users size={16} />
                                <span>لم يُعيَّن متطوع بعد</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Column 2: Chat (desktop only) */}
                <div className="col-span-2 flex flex-col h-[700px] bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 bg-gray-900 text-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30 font-bold">
                                {request.student_name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">{request.student_name}</h3>
                                <p className="text-[10px] text-gray-400">محادثة مباشرة</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <ChatBox
                            requestId={request.id}
                            currentUserRole={profile?.role === 'admin' ? 'admin' : 'volunteer'}
                            currentUserId={profile?.id || ''}
                            lang="ar"
                        />
                    </div>
                </div>
            </div>

            {/* ── Mobile: chat takes full height below the details strip ── */}
            <div className="lg:hidden flex flex-col rounded-2xl border border-gray-100 shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 220px)', minHeight: '420px' }}>
                <div className="px-4 py-3 bg-gray-900 text-white flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30 font-bold text-sm">
                        {request.student_name.charAt(0)}
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">{request.student_name}</h3>
                        <p className="text-[10px] text-gray-400">محادثة مباشرة</p>
                    </div>
                </div>
                <div className="flex-1 overflow-hidden">
                    <ChatBox
                        requestId={request.id}
                        currentUserRole={profile?.role === 'admin' ? 'admin' : 'volunteer'}
                        currentUserId={profile?.id || ''}
                        lang="ar"
                    />
                </div>
            </div>
        </div>
    );
}
