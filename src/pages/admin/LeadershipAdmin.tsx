import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ALL_PERMISSIONS, PERMISSION_LABELS, PERMISSION_ICONS, Permission } from "@/hooks/useRoleGuard";
import { Spinner } from "./components/AdminUI";

const ACCENT = "#8B1A2A";

export default function LeadershipAdmin() {
    const { profile, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [allowedDepartments, setAllowedDepartments] = useState<Permission[]>([]);

    useEffect(() => {
        if (authLoading) return;
        
        if (!profile) {
            navigate('/admin', { replace: true });
            return;
        }

        // Determine which departments this user can see
        if (profile.role === 'admin') {
            setAllowedDepartments(ALL_PERMISSIONS);
        } else if (profile.role === 'staff') {
            const perms = profile.permissions as Permission[] || [];
            if (perms.length === 0) {
                // Unrestricted staff can see all
                setAllowedDepartments(ALL_PERMISSIONS);
            } else {
                // Restricted staff see only their assigned areas
                setAllowedDepartments(perms);
                
                // UX Optimization: If they only have 1 department, auto-redirect them
                if (perms.length === 1) {
                    navigate(`/admin/leadership/${perms[0]}`, { replace: true });
                }
            }
        } else {
            navigate('/admin', { replace: true });
        }
    }, [profile, authLoading, navigate]);

    if (authLoading) {
        return <div className="flex justify-center py-12"><Spinner /></div>;
    }

    return (
        <div className="space-y-6" dir="rtl">
            <div>
                <h2 className="m-0 text-xl font-extrabold text-[#111]">الأداء والمتابعة التنفيذية</h2>
                <p className="m-0 mt-0.5 text-[#9ca3af] text-[13px]">
                    إدارة ومتابعة المهام الخاصة بكل قسم من أقسام الاتحاد
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {allowedDepartments.map(dept => (
                    <div 
                        key={dept} 
                        onClick={() => navigate(`/admin/leadership/${dept}`)}
                        className="bg-white rounded-2xl p-6 border border-[#e5e7eb] shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col items-center text-center group hover:border-[#8B1A2A]/40 hover:-translate-y-1"
                    >
                        <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                            {PERMISSION_ICONS[dept]}
                        </div>
                        <h3 className="font-bold text-lg text-[#111] mb-1">{PERMISSION_LABELS[dept]}</h3>
                        <p className="text-[12px] font-medium text-gray-500 mb-4">
                            متابعة وتقييم أداء القسم
                        </p>
                        
                        <div className="mt-auto pt-4 border-t border-[#f3f4f6] w-full flex justify-center">
                            <span className="text-[12px] font-bold text-[#6b7280] group-hover:text-[#8B1A2A] transition-colors flex items-center gap-1">
                                الدخول للقسم
                                <span className="rotate-180 inline-block group-hover:-translate-x-1 transition-transform">➔</span>
                            </span>
                        </div>
                    </div>
                ))}
                
                {allowedDepartments.length === 0 && (
                    <div className="col-span-full py-12 text-center text-[#9ca3af]">
                        <div className="text-[40px] mb-2">🔒</div>
                        <p>لا تملك صلاحيات للوصول إلى أي قسم. يرجى مراجعة إدارة النظام.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
