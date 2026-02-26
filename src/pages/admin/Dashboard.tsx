import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { fetchDashboardStats } from "@/service/supabaseData";
import { AdminCard } from "./components/AdminCard";

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
                <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-[0_1px_4px_rgba(0,0,0,.06)] border border-[#f0f0f0]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="m-0 text-[15px] font-bold">الأعضاء الجدد شهرياً</h3>
                        <span className="text-[11px] text-[#9ca3af] bg-[#f3f4f6] px-2.5 py-1 rounded-lg">آخر 12 شهر</span>
                    </div>
                    <div className="flex items-end gap-1.5 h-20">
                        {monthlyUsers.map((v, i) => (
                            <div key={i} className="flex-1 rounded-t-lg bg-[#8B1A2A]" style={{ opacity: .45 + (i / 12) * .55, height: `${(v / max) * 72}px` }} />
                        ))}
                    </div>
                    <div className="flex justify-between mt-1.5">
                        {months.map((m, i) => <span key={i} className="flex-1 text-center text-[11px] text-[#9ca3af]">{m}</span>)}
                    </div>
                </div>

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
