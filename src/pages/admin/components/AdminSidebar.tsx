import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { canAccess, isAdminLevel } from "@/hooks/useRoleGuard";
import {
    LayoutDashboard, Target, ScanLine, Award,
    Users, ShieldCheck, Vote,
    HeartHandshake, Compass, Clapperboard,
    Briefcase, Map, GraduationCap, BookOpen,
    MessageSquare, TrendingUp, Handshake, Tag, BarChart, Layout, FileText, ShoppingBag, ListOrdered, Inbox, Megaphone
} from "lucide-react";

const B = "#8B1A2A"; // Primary Brand Color

/**
 * Grouped Navigation Structure mirroring the Smart Top Bar
 */
export const navGroups = [
    {
        title: "الأقسام الرئيسية", // Matches Top Bar Main Sections
        items: [
            { id: "dashboard", path: "/admin", label: "الرئيسية", icon: LayoutDashboard, permission: null, adminOnly: false },
            { id: "activities", path: "/admin/activities", label: "الفعاليات", icon: Target, permission: "activity", adminOnly: false },
            { id: "scanner", path: "/admin/scanner", label: "الماسح الضوئي", icon: ScanLine, permission: "activity", adminOnly: false },
            { id: "points", path: "/admin/points", label: "سجل النقاط", icon: Award, permission: null, adminOnly: true },
        ]
    },
    {
        title: "كادر الاتحاد والنظام", // Matches "كادر الاتحاد" grid
        items: [
            { id: "users", path: "/admin/users", label: "المستخدمون", icon: Users, permission: null, adminOnly: true },
            { id: "teamadmin", path: "/admin/teamadmin", label: "فريق الاتحاد", icon: ShieldCheck, permission: null, adminOnly: true },
            { id: "leadership", path: "/admin/leadership", label: "الأداء ", icon: BarChart, permission: null, adminOnly: false },
            { id: "elections", path: "/admin/elections", label: "الانتخابات", icon: Vote, permission: null, adminOnly: false },
        ]
    },
    {
        title: "ادارة الصفحة الخارجية", // Matches "خدمات وأدوات" grid
        items: [
            { id: "homepage", path: "/admin/homepage", label: "مدير الصفحة الرئيسية", icon: Layout, permission: null, adminOnly: true },
            { id: "info-cms", path: "/admin/info-cms", label: "إدارة المحتوى", icon: FileText, permission: null, adminOnly: true },
            { id: "published", path: "/admin/publish", label: "المنشورات", icon: FileText, permission: null, adminOnly: true },
        ]
    },
    {
        title: "مشاريع الاتحاد", // Matches "مشاريع الاتحاد" list
        items: [
            { id: "3wn-admin", path: "/admin/3wnAdmin", label: "إدارة عون", icon: HeartHandshake, permission: "3wn", adminOnly: false },
            { id: "busla", path: "/admin/busla", label: "إدارة بوصلة", icon: Compass, permission: "busla", adminOnly: false },
            { id: "reels", path: "/admin/reels", label: "مفهوم (الريلز)", icon: Clapperboard, permission: "reels", adminOnly: false },
            { id: "academy", path: "/admin/academy", label: "الأكاديمية", icon: GraduationCap, permission: "academy", adminOnly: false },

        ]
    },
    {
        title: "خدمات وأدوات", // Matches "خدمات وأدوات" grid
        items: [
            { id: "jobadmin", path: "/admin/jobadmin", label: "إدارة الوظائف", icon: Briefcase, permission: null, adminOnly: false },
            { id: "appsmapadmin", path: "/admin/appsmapadmin", label: "تطبيقات وخرائط", icon: Map, permission: null, adminOnly: false },
            { id: "guideadmin", path: "/admin/guideadmin", label: "الدليل والأسئلة", icon: BookOpen, permission: null, adminOnly: false },
        ]
    },
    {
        title: "إدارة المتجر", // Store Management
        items: [
            { id: "store", path: "/admin/store", label: "نظرة عامة المتجر", icon: ShoppingBag, permission: null, adminOnly: true },
            { id: "store/categories", path: "/admin/store/categories", label: "فئات المتجر", icon: Tag, permission: null, adminOnly: true },
            { id: "store/products", path: "/admin/store/products", label: "المنتجات", icon: ShoppingBag, permission: null, adminOnly: true },
            { id: "store/orders", path: "/admin/store/orders", label: "الطلبات", icon: ListOrdered, permission: null, adminOnly: true },
        ]
    },
    {
        title: "مشاريع الطلاب", // Student Projects Management
        items: [
            { id: "student-projects", path: "/admin/student-projects", label: "نظرة عامة", icon: Briefcase, permission: null, adminOnly: true },
            { id: "student-projects/submissions", path: "/admin/student-projects/submissions", label: "الطلبات الواردة", icon: Inbox, permission: null, adminOnly: true },
            { id: "student-projects/projects", path: "/admin/student-projects/projects", label: "المشاريع المنشورة", icon: Briefcase, permission: null, adminOnly: true },
            { id: "student-projects/categories", path: "/admin/student-projects/categories", label: "فئات المشاريع", icon: Tag, permission: null, adminOnly: true },
        ]
    },
    {
        title: "الإعلانات", // Ads Management
        items: [
            { id: "ads", path: "/admin/ads", label: "إدارة الإعلانات", icon: Megaphone, permission: null, adminOnly: true },
        ]
    },
    {
        title: "التفاعل والشركاء", // Remaining admin-specific management
        items: [
            { id: "engagement-chat", path: "/admin/engagement/chat", label: "إدارة الدردشة", icon: MessageSquare, permission: null, adminOnly: false },
            { id: "engagement-weekly", path: "/admin/engagement/weekly", label: "التفاعل الأسبوعي", icon: TrendingUp, permission: null, adminOnly: false },
            { id: "partners", path: "/admin/partners", label: "إدارة الشركاء", icon: Handshake, permission: "partners", adminOnly: false },
            { id: "offers", path: "/admin/offers", label: "إدارة العروض", icon: Tag, permission: "partners", adminOnly: false },
        ]
    }
];

// REQUIRED FOR ADMIN.TSX ROUTING: This flattens the groups back into the list your router expects.
export const navItems = navGroups.flatMap(group => group.items);

interface AdminSidebarProps {
    currentPageId: string;
    sidebarOpen: boolean;
    setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
    isMobile: boolean;
}

export function AdminSidebar({ currentPageId, sidebarOpen, setSidebarOpen, isMobile }: AdminSidebarProps) {
    const { profile } = useAuth();

    const handleLinkClick = () => {
        if (isMobile) setSidebarOpen(false);
    };

    const role = profile?.role ?? '';
    const isAdmin = role === 'admin';
    const perms = (profile?.permissions ?? []) as string[];
    const isRestrictedStaff = role === 'staff' && perms.length > 0;

    const visibleGroups = navGroups.map(group => {
        const filteredItems = group.items.filter(item => {
            if (!isAdminLevel(profile)) return false;
            if (item.adminOnly) return isAdmin;
            if (item.id === 'dashboard' || item.id === 'leadership') return true;
            if (isRestrictedStaff) {
                return item.permission ? canAccess(profile, item.permission as any) : false;
            }
            return true;
        });
        return { ...group, items: filteredItems };
    }).filter(group => group.items.length > 0);

    return (
        <>
            {isMobile && (
                <div
                    className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
                        }`}
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside
                className={`fixed md:relative flex flex-col h-full bg-white border-l border-gray-100 z-50 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-[4px_0_24px_rgba(0,0,0,0.04)] ${sidebarOpen ? "w-72 translate-x-0" : "w-72 md:w-[80px] translate-x-full md:translate-x-0"
                    }`}
                dir="rtl"
            >
                {/* Header */}
                <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div className={`flex items-center gap-3 transition-all ${sidebarOpen || isMobile ? "justify-start" : "justify-center w-full"}`}>
                        <div
                            className="flex items-center justify-center shrink-0 text-white font-bold text-lg shadow-sm"
                            style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${B}, #600f1c)` }}
                        >
                            ا
                        </div>
                        {(sidebarOpen || isMobile) && (
                            <div className="flex flex-col overflow-hidden animate-fade-in">
                                <span className="font-bold text-sm text-gray-900 truncate">اتحاد الطلاب اليمنيين</span>
                                <span className="text-xs text-gray-500 truncate">لوحة التحكم والإدارة</span>
                            </div>
                        )}
                    </div>
                    {isMobile && (
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 px-3 py-4 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    <style>{`nav::-webkit-scrollbar { display: none; }`}</style>

                    {visibleGroups.map((group, groupIndex) => (
                        <div key={groupIndex} className="mb-6 last:mb-0">
                            {(sidebarOpen || isMobile) ? (
                                <h3 className="px-3 mb-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                    {group.title}
                                </h3>
                            ) : (
                                <div className="w-full border-t border-gray-100 my-3 opacity-50"></div>
                            )}

                            <ul className="space-y-1 list-none p-0 m-0">
                                {group.items.map(item => {
                                    const isActive = currentPageId === item.id || (item.id === "dashboard" && currentPageId === "");
                                    const Icon = item.icon; // Use Lucide Icon

                                    return (
                                        <li key={item.id}>
                                            <Link
                                                to={item.path}
                                                onClick={handleLinkClick}
                                                className={`group flex items-center gap-3 py-2.5 px-3 rounded-xl transition-all duration-200 relative overflow-hidden ${sidebarOpen || isMobile ? "justify-start" : "justify-center"
                                                    } ${isActive
                                                        ? "text-[#8B1A2A] font-bold"
                                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium"
                                                    }`}
                                            >
                                                {isActive && (
                                                    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundColor: B }} />
                                                )}

                                                {isActive && (sidebarOpen || isMobile) && (
                                                    <div className="absolute right-0 top-1/4 bottom-1/4 w-1 rounded-l-full" style={{ backgroundColor: B }} />
                                                )}

                                                <span className={`flex items-center justify-center shrink-0 transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                                                    {/* Rendering the Lucide component */}
                                                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                                </span>

                                                {(sidebarOpen || isMobile) && (
                                                    <span className="whitespace-nowrap tracking-wide text-[13px]">
                                                        {item.label}
                                                    </span>
                                                )}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>
            </aside>
        </>
    );
}