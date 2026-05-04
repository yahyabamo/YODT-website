// src/pages/admin/ArrivalDetailAdmin.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Clock, MessageSquare, CheckCircle, AlertCircle, Phone, User, ExternalLink } from 'lucide-react';
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

    if (loading) return <div className="p-8 text-center">جاري التحميل...</div>;
    if (!request) return <div className="p-8 text-center">الطلب غير موجود.</div>;

    const whatsappUrl = `https://wa.me/${request.phone_whatsapp.replace(/\s+/g, '')}`;

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto animate-in fade-in duration-500">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 mb-6 text-gray-500 hover:text-gray-800 transition-colors"
            >
                <ArrowRight size={20} />
                <span>العودة للوحة التحكم</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Column 1: Details & Control */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="font-bold text-gray-800 flex items-center gap-2">
                                <User size={18} className="text-primary" />
                                تفاصيل الطالب
                            </h2>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${request.status === ArrivalStatus.RECEIVED ? 'bg-green-100 text-green-700' :
                                    request.status === ArrivalStatus.PENDING_ASSIGNMENT ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-blue-100 text-blue-700'
                                }`}>
                                {request.status}
                            </span>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">الاسم الكامل</label>
                                <p className="font-semibold text-gray-900">{request.student_name}</p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-400 block mb-1">رقم الواتساب</label>
                                <a
                                    href={whatsappUrl}
                                    target="_blank"
                                    rel="noreferrer"
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

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <Clock size={18} className="text-primary" />
                            تحديث الحالة
                        </h3>
                        <div className="grid grid-cols-1 gap-2">
                            {Object.values(ArrivalStatus).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => handleStatusUpdate(status)}
                                    className={`text-right px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${request.status === status
                                            ? 'bg-primary text-white border-primary shadow-md'
                                            : 'bg-white text-gray-600 border-gray-100 hover:bg-gray-50'
                                        }`}
                                >
                                    {status === ArrivalStatus.PENDING_ASSIGNMENT && 'قيد الانتظار'}
                                    {status === ArrivalStatus.ASSIGNED && 'تم التعيين'}
                                    {status === ArrivalStatus.CONTACTED && 'تم التواصل'}
                                    {status === ArrivalStatus.RECEIVED && 'تم الاستلام'}
                                    {status === ArrivalStatus.ISSUE_DELAY && 'تأخير / مشكلة'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {volunteer && (
                        <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5">
                            <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2 text-sm">
                                <Users size={16} />
                                المتطوع المعين
                            </h4>
                            <p className="text-blue-800 font-bold mb-1">{volunteer.full_name}</p>
                            <a href={`tel:${volunteer.phone}`} className="text-blue-600 text-sm flex items-center gap-1">
                                <Phone size={12} />
                                <span dir="ltr">{volunteer.phone}</span>
                            </a>
                        </div>
                    )}
                </div>

                {/* Column 2: Chat */}
                <div className="lg:col-span-2 flex flex-col h-[700px] bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
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
        </div>
    );
}
