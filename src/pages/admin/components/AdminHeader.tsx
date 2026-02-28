import React from "react";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const B = "#8B1A2A";

interface AdminHeaderProps {
    pageTitle: string;
    setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function AdminHeader({ pageTitle, setSidebarOpen }: AdminHeaderProps) {
    const { profile, signOut } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            localStorage.removeItem('registrationData');
            localStorage.removeItem('userGender');
            await signOut();
            // Also clear sessionStorage in case Supabase uses it
            sessionStorage.clear();
            // Use href to force a full page reload, clearing any in-memory state
            window.location.href = '/';
        } catch (error) {
            console.error("Logout failed:", error);
            sessionStorage.clear();
            window.location.href = '/';
        }
    };


    return (
        <header className="bg-white border-b border-gray-100 p-3 md:px-6 md:py-3 flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-3">
                {/* Hamburger Menu on Mobile */}
                <button
                    onClick={() => setSidebarOpen(prev => !prev)}
                    className="md:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 flex items-center justify-center shrink-0"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                </button>

                <h1 className="m-0 text-base font-extrabold text-[#111]">{pageTitle}</h1>
                <span className="hidden sm:inline-block text-[11px] text-[#9ca3af] bg-[#f3f4f6] px-2.5 py-1 rounded-lg">لوحة الإدارة</span>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
                <NotificationBell />

                <div className="text-right mr-1 md:mr-2 hidden sm:block">
                    <div className="text-[13px] font-bold text-[#111]">{profile?.full_name || "المدير"}</div>
                    <div className="text-[11px] text-[#9ca3af]">مدير النظام</div>
                </div>

                <div style={{ width: 36, height: 36, borderRadius: 10, background: B, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 15 }}>
                    {profile?.full_name?.[0] || "م"}
                </div>

                <button
                    onClick={handleLogout}
                    className="px-2 py-1.5 md:px-3 md:py-1.5 rounded-lg border border-red-200 bg-white text-red-600 text-xs font-semibold cursor-pointer shrink-0 ms-1 md:ms-0"
                >
                    خروج
                </button>
            </div>
        </header>
    );
}
