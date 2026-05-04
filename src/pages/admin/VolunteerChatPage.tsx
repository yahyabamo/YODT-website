// src/pages/admin/VolunteerChatPage.tsx
// Shown when a volunteer clicks "محادثة" — renders the arrival chat from the volunteer POV.
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, PlaneLanding, Clock, MapPin, Phone, ExternalLink } from 'lucide-react';
import { useRoleGuard } from '@/hooks/useRoleGuard';
import { useAuth } from '@/context/AuthContext';
import { getArrivalRequestById } from '@/service/arrivalsCMS';
import { ArrivalRequest } from '@/integrations/supabase/types';
import ChatBox from '@/components/features/chat/ChatBox';

export default function VolunteerChatPage() {
    useRoleGuard(['volunteers']);
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { profile } = useAuth();
    const [request, setRequest] = useState<ArrivalRequest | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            getArrivalRequestById(id)
                .then(data => setRequest(data))
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        }
    }, [id]);

    if (loading) return <div className="p-8 text-center animate-pulse">جاري التحميل...</div>;
    if (!request) return <div className="p-8 text-center text-destructive">الطلب غير موجود.</div>;

    const whatsappUrl = `https://wa.me/${request.phone_whatsapp.replace(/\s+/g, '')}`;

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto animate-in fade-in duration-500">
            {/* Back button */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 mb-6 text-muted-foreground hover:text-foreground transition-colors"
            >
                <ArrowRight size={20} />
                <span>العودة للطلبات</span>
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Student info */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-card rounded-2xl border border-border p-5 space-y-4 shadow-sm">
                        <h2 className="font-bold text-lg flex items-center gap-2">
                            <PlaneLanding size={18} className="text-primary" />
                            تفاصيل الطالب
                        </h2>

                        <div>
                            <label className="text-xs text-muted-foreground block mb-1">الاسم الكامل</label>
                            <p className="font-semibold">{request.student_name}</p>
                        </div>

                        <div>
                            <label className="text-xs text-muted-foreground block mb-1">واتساب</label>
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

                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
                            <div>
                                <label className="text-xs text-muted-foreground block mb-1">المطار</label>
                                <p className="font-medium text-sm flex items-center gap-1">
                                    <MapPin size={12} /> {request.airport}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs text-muted-foreground block mb-1">رقم الرحلة</label>
                                <p className="font-medium text-sm" dir="ltr">{request.flight_number}</p>
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-muted-foreground block mb-1">وقت الوصول</label>
                            <p className="font-medium text-sm flex items-center gap-1" dir="ltr">
                                <Clock size={12} />
                                {new Date(request.arrival_date).toLocaleString()}
                            </p>
                        </div>

                        {request.additional_notes && (
                            <div>
                                <label className="text-xs text-muted-foreground block mb-1">ملاحظات</label>
                                <p className="text-sm bg-secondary/50 p-3 rounded-lg">{request.additional_notes}</p>
                            </div>
                        )}
                    </div>

                    {/* Volunteer role badge */}
                    <div className="bg-emerald-500/10 rounded-xl border border-emerald-500/20 p-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold shrink-0">
                            {profile?.full_name?.charAt(0) ?? 'م'}
                        </div>
                        <div>
                            <p className="font-semibold text-sm text-emerald-700 dark:text-emerald-400">{profile?.full_name}</p>
                            <p className="text-xs text-muted-foreground">متطوع استقبال</p>
                        </div>
                    </div>
                </div>

                {/* Right: Chat */}
                <div className="lg:col-span-2 flex flex-col h-[680px] bg-card rounded-3xl shadow-lg border border-border overflow-hidden">
                    <div className="px-6 py-4 bg-gray-900 text-white flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30 font-bold">
                            {request.student_name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="font-bold text-sm">{request.student_name}</h3>
                            <p className="text-[10px] text-gray-400">محادثة الاستقبال — دور: متطوع</p>
                        </div>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <ChatBox
                            requestId={request.id}
                            currentUserRole="volunteer"
                            currentUserId={profile?.id || ''}
                            lang="ar"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
