import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { fetchDashboardStats } from "@/service/supabaseData";
import { AdminCard } from "./components/AdminCard";
import { useAuth } from "@/context/AuthContext";
import {
    PERMISSION_LABELS,
    PERMISSION_ICONS,
    PERMISSION_PATHS,
    type Permission,
} from "@/hooks/useRoleGuard";

interface DashStats {
    totalUsers: number;
    activeMembers: number;
    totalActivities: number;
    activeOffers: number;
    totalPoints: number;
    recentUsers: any[];
    recentPoints: any[];
}

const B = "#8B1A2A";

function Avatar({ name, size = 32 }: { name: string; size?: number }) {
    const cs = ["#8B1A2A", "#1a5276", "#145a32", "#6e2fa0", "#b7770d"];
    const c = cs[(name?.charCodeAt(0) || 0) % cs.length];
    const initials = name ? name.split(" ").slice(0, 2).map((w: string) => w[0]).join("") : "؟";
    return (
        <div style={{ width: size, height: size, borderRadius: "50%", background: c, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "bold", fontSize: size * 0.38, flexShrink: 0 }}>
            {initials}
        </div>
    );
}

function fmtDate(d: string) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("ar", { year: "numeric", month: "short", day: "numeric" });
}

function Spinner() {
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 48 }}>
            <div style={{ width: 32, height: 32, border: `3px solid ${B}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        </div>
    );
}

export default function Dashboard() {
    const navigate = useNavigate();
    const { profile: authProfile } = useAuth();

    // Permissions this user has been explicitly assigned
    const explicitPerms = (authProfile?.permissions ?? []) as Permission[];
    // Only show shortcuts for staff with explicit permissions
    const showShortcuts = authProfile?.role === 'staff' && explicitPerms.length > 0;
    const shortcutPerms: Permission[] = showShortcuts ? explicitPerms : [];

    // Auto-redirect: staff with exactly 1 permission go straight to their page
    useEffect(() => {
        if (shortcutPerms.length === 1) {
            navigate(PERMISSION_PATHS[shortcutPerms[0]], { replace: true });
        }
    }, [shortcutPerms.length]);
    const [stats, setStats] = useState<DashStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardStats()
            .then((data: any) => setStats(data as DashStats))
            .catch(() => toast.error("فشل تحميل الإحصاءات"))
            .finally(() => setLoading(false));
    }, []);

    const monthlyUsers = [12, 18, 15, 22, 28, 19, 24, 30, 26, 21, 35, 28];
    const months = ["ي", "ف", "م", "أ", "م", "ج", "ج", "أ", "س", "أ", "ن", "د"];
    const max = Math.max(...monthlyUsers);

    if (loading) return <Spinner />;

    return (
        <div>
            <div className="mb-6">
                <h2 className="m-0 text-[22px] font-extrabold text-[#111]">مرحباً بك في لوحة الإدارة 👋</h2>
                <p className="m-0 mt-1 text-[#6b7280] text-sm">اتحاد الطلاب اليمنيين في تركيا – فرع إسطنبول</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                <AdminCard icon="👥" label="إجمالي الأعضاء" value={stats?.totalUsers || 0} color={B} />
                <AdminCard
                    icon="✅"
                    label="أعضاء نشطون"
                    value={stats?.activeMembers || 0}
                    sub={stats?.totalUsers ? `${Math.round((stats.activeMembers / stats.totalUsers) * 100)}% من الإجمالي` : ""}
                    color="#059669"
                />
                <AdminCard icon="🎯" label="الفعاليات" value={stats?.totalActivities || 0} color="#7c3aed" />
                <AdminCard icon="🏷️" label="عروض نشطة" value={stats?.activeOffers || 0} color="#d97706" />
                <AdminCard icon="⭐" label="إجمالي النقاط" value={(stats?.totalPoints || 0).toLocaleString()} color="#2563eb" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

                {/* Responsibility shortcuts OR recent-users list */}
                {shortcutPerms.length === 1 ? (
                    /* ── Single permission: one big banner ── */
                    <button onClick={() => navigate(PERMISSION_PATHS[shortcutPerms[0]])} className="group w-full text-right">
                        <div style={{
                            background: 'linear-gradient(135deg,#8B1A2A 0%,#B91C1C 100%)',
                            borderRadius: 18,
                            padding: '24px 28px',
                            boxShadow: '0 8px 32px rgba(139,26,42,.25)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 20,
                        }}>
                            <div style={{ fontSize: 48, flexShrink: 0 }}>{PERMISSION_ICONS[shortcutPerms[0]]}</div>
                            <div style={{ flex: 1, color: '#fff' }}>
                                <p style={{ margin: 0, fontSize: 11, fontWeight: 600, opacity: .7, letterSpacing: 1, textTransform: 'uppercase' }}>منطقة مسؤوليتك</p>
                                <h3 style={{ margin: '4px 0 6px', fontSize: 22, fontWeight: 900 }}>{PERMISSION_LABELS[shortcutPerms[0]]}</h3>
                            </div>
                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>←</div>
                        </div>
                    </button>
                ) : shortcutPerms.length > 1 ? (
                    /* ── Multiple permissions: grid of cards ── */
                    <div className="lg:col-span-1">
                        <h3 className="m-0 mb-3 text-[15px] font-bold">مناطق مسؤوليتك</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 10 }}>
                            {shortcutPerms.map(p => (
                                <button
                                    key={p}
                                    onClick={() => navigate(PERMISSION_PATHS[p])}
                                    style={{
                                        background: 'linear-gradient(135deg,#8B1A2A,#B91C1C)',
                                        borderRadius: 14,
                                        padding: '16px 14px',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#fff',
                                        textAlign: 'right',
                                        boxShadow: '0 4px 14px rgba(139,26,42,.2)',
                                        transition: 'transform .15s',
                                    }}
                                    onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
                                    onMouseLeave={e => (e.currentTarget.style.transform = '')}
                                >
                                    <div style={{ fontSize: 26, marginBottom: 8 }}>{PERMISSION_ICONS[p]}</div>
                                    <div style={{ fontSize: 13, fontWeight: 800 }}>{PERMISSION_LABELS[p]}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* ── Admin / full-access staff: recent users list ── */
                    <div className="bg-white rounded-2xl p-5 shadow-[0_1px_4px_rgba(0,0,0,.06)] border border-[#f0f0f0]">
                        <h3 className="m-0 mb-4 text-[15px] font-bold">آخر المسجلين</h3>
                        <div className="max-h-[200px] overflow-y-auto pr-1">
                            {(stats?.recentUsers || []).map((u: any) => (
                                <div key={u.id} className="flex items-center gap-2.5 py-1.5 border-b border-[#f9fafb] last:border-0">
                                    <Avatar name={u.full_name || u.email} size={32} />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-semibold text-[#111] truncate">{u.full_name || "—"}</div>
                                        <div className="text-[10px] text-[#9ca3af]">{fmtDate(u.created_at)}</div>
                                    </div>
                                    <span className="text-[11px] font-bold text-[#8B1A2A]">{u.total_points} ⭐</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-[0_1px_4px_rgba(0,0,0,.06)] border border-[#f0f0f0]">
                <h3 className="m-0 mb-4 text-[15px] font-bold">آخر تغييرات النقاط</h3>
                {(stats?.recentPoints || []).length === 0
                    ? <p className="text-[#9ca3af] text-[13px] text-center">لا توجد سجلات بعد</p>
                    : (
                        <div className="max-h-[300px] overflow-y-auto pr-1">
                            {(stats?.recentPoints || []).map((p: any) => (
                                <div key={p.id} className="flex items-center gap-3 py-2 border-b border-[#f9fafb] last:border-0">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 ${p.change_amount > 0 ? "bg-[#d1fae5] text-[#059669]" : "bg-[#fee2e2] text-[#dc2626]"}`}>
                                        {p.change_amount > 0 ? "+" : ""}{p.change_amount}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[13px] font-semibold text-[#111] truncate">{p.profiles?.full_name || "—"}</div>
                                        <div className="text-[11px] text-[#9ca3af]">{p.reason}</div>
                                    </div>
                                    <span className="text-[11px] text-[#9ca3af] whitespace-nowrap">{fmtDate(p.created_at)}</span>
                                </div>
                            ))}
                        </div>
                    )
                }
            </div>
        </div>
    );
}
