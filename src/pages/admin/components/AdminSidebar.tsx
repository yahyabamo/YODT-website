import React from "react";
import { Link } from "react-router-dom";

const B = "#8B1A2A";

export const navItems = [
    { id: "dashboard", path: "/admin", label: "الرئيسية", icon: "⊞" },
    { id: "scanner", path: "/admin/scanner", label: "الماسح الضوئي", icon: "📹" },
    { id: "users", path: "/admin/users", label: "المستخدمون", icon: "👥" },
    { id: "activities", path: "/admin/activities", label: "الفعاليات", icon: "🎯" },
    { id: "partners", path: "/admin/partners", label: "الشركاء", icon: "🤝" },
    { id: "offers", path: "/admin/offers", label: "العروض", icon: "🏷️" },
    { id: "reels", path: "/admin/reels", label: "الريلز", icon: "🎥" },
    { id: "points", path: "/admin/points", label: "سجل النقاط", icon: "⭐" },
    { id: "3wn-admin", path: "/admin/3wnAdmin", label: "عون-إدارة", icon: "⊞" },
    { id: "jobadmin", path: "/admin/jobadmin", label: "الوظائف", icon: "💼" },
    { id: "guideadmin", path: "/admin/guideadmin", label: "الدليل", icon: "📚" },
];

interface AdminSidebarProps {
    currentPageId: string;
    sidebarOpen: boolean;
    setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isMobile: boolean;
}

export function AdminSidebar({ currentPageId, sidebarOpen, setSidebarOpen, isMobile }: AdminSidebarProps) {

    const handleLinkClick = () => {
        if (isMobile) {
            setSidebarOpen(false);
        }
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isMobile && sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed md:relative flex flex-col h-full bg-white border-l border-gray-100 z-50 transition-all duration-300 ease-in-out ${sidebarOpen ? "w-64 translate-x-0" : "w-64 md:w-[72px] translate-x-full md:translate-x-0"}`}
                style={{ boxShadow: "2px 0 8px rgba(0,0,0,.04)" }}
            >
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <div className={`flex items-center gap-3 ${sidebarOpen || isMobile ? "justify-start" : "justify-center w-full"}`}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: B, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 16, flexShrink: 0 }}>ا</div>
                        {(sidebarOpen || isMobile) && (
                            <div>
                                <div style={{ fontWeight: 800, fontSize: 13, color: "#111", lineHeight: 1.2 }}>اتحاد الطلاب اليمنيين</div>
                                <div style={{ fontSize: 11, color: "#9ca3af" }}>فرع إسطنبول</div>
                            </div>
                        )}
                    </div>
                    {isMobile && (
                        <button onClick={() => setSidebarOpen(false)} className="text-gray-500 hover:text-gray-700 md:hidden pb-1 ps-1">
                            ✕
                        </button>
                    )}
                </div>

                <nav className="flex-1 p-2 overflow-y-auto">
                    {navItems.map(item => {
                        const isActive = currentPageId === item.id || (item.id === "dashboard" && currentPageId === "");
                        return (
                            <Link
                                to={item.path}
                                key={item.id}
                                onClick={handleLinkClick}
                                className={`w-full flex items-center gap-3 p-2.5 rounded-xl border-none cursor-pointer text-sm mb-1 transition-all duration-150 ${sidebarOpen || isMobile ? "justify-start" : "justify-center"}`}
                                style={{
                                    fontWeight: isActive ? 700 : 500,
                                    background: isActive ? `${B}14` : "transparent",
                                    color: isActive ? B : "#6b7280"
                                }}
                            >
                                <span className="text-lg shrink-0">{item.icon}</span>
                                {(sidebarOpen || isMobile) && <span className="whitespace-nowrap">{item.label}</span>}
                            </Link>
                        )
                    })}
                </nav>
            </aside>
        </>
    );
}
