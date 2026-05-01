import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { fetchPointsHistory } from "@/service/supabaseData";
import { Avatar, Badge, Spinner, B, fmtDate } from "./components/AdminUI";

interface PointHistory {
    id: string; user_name: string; change_amount: number;
    reason: string;
    reason_type: "activity" | "volunteer" | "achievement" | "deduction" | "manual";
    created_at: string;
}

export default function PointsHistoryAdmin() {
    const [history, setHistory] = useState<PointHistory[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [activityFilter, setActivityFilter] = useState("all");
    const typeLabels: any = { activity: "فعالية", volunteer: "تطوع", achievement: "إنجاز", deduction: "خصم", manual: "يدوي" };

    useEffect(() => {
        fetchPointsHistory({ pageSize: 100 })
            .then(({ data }) => {
                setHistory((data || []).map((h: any) => ({
                    ...h,
                    user_name: h.profiles?.full_name || h.user_id,
                })));
            })
            .catch(() => toast.error("فشل تحميل سجل النقاط"))
            .finally(() => setLoading(false));
    }, []);

    const activityNames = Array.from(new Set(history.filter(h => h.reason_type === 'activity').map(h => h.reason)));

    const filtered = history.filter(h => {
        if (filter !== "all" && h.reason_type !== filter) return false;
        if (filter === "activity" && activityFilter !== "all" && h.reason !== activityFilter) return false;
        return true;
    });

    return (
        <div>
            <div className="mb-5">
                <h2 className="m-0 text-xl font-extrabold text-[#111]">سجل النقاط</h2>
                <p className="m-0 mt-0.5 text-[#9ca3af] text-[13px]">جميع تغييرات النقاط في النظام</p>
            </div>

            <div className="flex gap-2 mb-3.5 flex-wrap">
                {["all", "activity", "volunteer", "achievement", "deduction", "manual"].map(f => (
                    <button
                        key={f}
                        onClick={() => { setFilter(f); setActivityFilter("all"); }}
                        className="px-3.5 py-2 rounded-xl border-none cursor-pointer font-semibold text-xs shadow-sm"
                        style={{
                            background: filter === f ? B : "#fff",
                            color: filter === f ? "#fff" : "#6b7280"
                        }}
                    >
                        {f === "all" ? "الكل" : typeLabels[f]}
                    </button>
                ))}
            </div>

            {filter === "activity" && activityNames.length > 0 && (
                <div className="mb-4">
                    <select 
                        value={activityFilter} 
                        onChange={(e) => setActivityFilter(e.target.value)}
                        className="w-full md:w-auto px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold focus:outline-none focus:border-[#059669] focus:ring-1 focus:ring-[#059669] bg-white text-gray-700 shadow-sm"
                    >
                        <option value="all">جميع الفعاليات</option>
                        {activityNames.map(name => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                    </select>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-[#f0f0f0] overflow-hidden">
                {loading ? <Spinner /> : (
                    <div className="overflow-x-auto w-full">
                        <table className="w-full border-collapse text-[13px] text-right">
                            <thead>
                                <tr className="border-b border-[#f3f4f6] bg-[#fafafa]">
                                    {["العضو", "التغيير", "السبب", "النوع", "التاريخ"].map(h => (
                                        <th key={h} className="p-3 md:px-4 md:py-3 font-bold text-[#6b7280] whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(h => (
                                    <tr key={h.id} className="border-b border-[#fafafa] hover:bg-gray-50">
                                        <td className="p-3 md:px-4 md:py-3 min-w-[200px]">
                                            <div className="flex items-center gap-2.5">
                                                <Avatar name={h.user_name} size={32} />
                                                <span className="font-semibold text-[#111]">{h.user_name}</span>
                                            </div>
                                        </td>
                                        <td className="p-3 md:px-4 md:py-3"><span className="font-black text-base" style={{ color: h.change_amount > 0 ? "#059669" : "#dc2626" }}>{h.change_amount > 0 ? "+" : ""}{h.change_amount}</span></td>
                                        <td className="p-3 md:px-4 md:py-3 text-[#6b7280] min-w-[150px]">{h.reason}</td>
                                        <td className="p-3 md:px-4 md:py-3 whitespace-nowrap"><Badge type={h.reason_type}>{typeLabels[h.reason_type]}</Badge></td>
                                        <td className="p-3 md:px-4 md:py-3 text-[#9ca3af] text-xs whitespace-nowrap">{fmtDate(h.created_at)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {!filtered.length && <div className="text-center py-10 text-[#9ca3af]"><div className="text-4xl mb-2">📭</div><p>لا توجد سجلات</p></div>}
                    </div>
                )}
            </div>
        </div>
    );
}
