import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle, ShieldCheck, GraduationCap, Building2 } from "lucide-react";
import logo from "@/assets/logo.png";

export default function Verify() {
    const { id } = useParams();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!id) return;
            // Publicly fetch only essential verification data
            const { data } = await supabase
                .from("profiles")
                .select("full_name, university, faculty, status, role")
                .eq("id", id)
                .single();
            setProfile(data);
            setLoading(false);
        };
        fetchProfile();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
        </div>
    );

    const isValid = profile && profile.status === "active";

    return (
        <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center" dir="rtl">
            <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden text-center">
                {/* Status Header */}
                <div className={`py-10 px-6 ${isValid ? "bg-emerald-50" : "bg-rose-50"}`}>
                    <div className="mb-4 flex justify-center">
                        {isValid ? (
                            <div className="bg-emerald-500 p-4 rounded-full shadow-lg shadow-emerald-200 animate-bounce-short">
                                <ShieldCheck className="text-white w-12 h-12" />
                            </div>
                        ) : (
                            <div className="bg-rose-500 p-4 rounded-full shadow-lg shadow-rose-200">
                                <XCircle className="text-white w-12 h-12" />
                            </div>
                        )}
                    </div>
                    <h1 className={`text-2xl font-black ${isValid ? "text-emerald-700" : "text-rose-700"}`}>
                        {isValid ? "عضوية موثقة" : "عضوية غير صالحة"}
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">اتحاد الطلاب اليمني في تركيا</p>
                </div>

                {/* Profile Details */}
                <div className="p-8 space-y-6">
                    {profile ? (
                        <>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">اسم الطالب</p>
                                <h2 className="text-xl font-extrabold text-slate-800">{profile.full_name}</h2>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                                <div className="flex flex-col items-center">
                                    <Building2 className="w-5 h-5 text-slate-300 mb-2" />
                                    <p className="text-[10px] font-bold text-slate-400">الجامعة</p>
                                    <p className="text-sm font-bold text-slate-700">{profile.university || "—"}</p>
                                </div>
                                <div className="flex flex-col items-center">
                                    <GraduationCap className="w-5 h-5 text-slate-300 mb-2" />
                                    <p className="text-[10px] font-bold text-slate-400">الكلية</p>
                                    <p className="text-sm font-bold text-slate-700">{profile.faculty || "—"}</p>
                                </div>
                            </div>

                            <div className="pt-6">
                                <img src={logo} alt="YODT Logo" className="h-12 w-auto mx-auto opacity-40 grayscale" />
                            </div>
                        </>
                    ) : (
                        <div className="py-10">
                            <p className="text-slate-400 font-bold">لم يتم العثور على بيانات لهذا الرمز</p>
                        </div>
                    )}
                </div>
            </div>


            <style>{`
                @keyframes bounce-short {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                .animate-bounce-short { animation: bounce-short 2s infinite; }
            `}</style>
        </div>
    );
}