import React, { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { fetchUsers, updateUserStatus, updateUserPoints } from "@/service/supabaseData";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Avatar, Badge, Spinner, Inp, Sel, Modal, B } from "./components/AdminUI";
import { ROLE_LABELS, ALL_PERMISSIONS, PERMISSION_LABELS, PERMISSION_ICONS, Permission, UserRole } from "@/hooks/useRoleGuard";
import { useOutletContext } from "react-router-dom";
import { useNavigate } from "react-router-dom";


interface User {
    id: string;
    full_name: string;
    email: string;
    role: UserRole;
    permissions: string[] | null;
    status: "active" | "inactive" | "banned";
    total_points: number;
    university: string;
    faculty: string;
    avatar_url: string;
    created_at: string;
}

const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", border: "1px solid #e5e7eb",
    borderRadius: 12, fontSize: 14, background: "#fff",
    boxSizing: "border-box", fontFamily: "inherit"
};

export default function UsersAdmin() {
    const { setConfirm } = useOutletContext<{ setConfirm: (v: any) => void }>();
    const { user: adminUser, profile } = useAuth(); // Assuming profile is available in your AuthContext
    // ... rest of your states    const { user: adminUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [count, setCount] = useState(0);
    const [page, setPage] = useState(0);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [pointsModal, setPointsModal] = useState<User | null>(null);
    const [roleModal, setRoleModal] = useState<User | null>(null);
    const [selectedRole, setSelectedRole] = useState<UserRole>('user');
    const [selectedPerms, setSelectedPerms] = useState<Permission[]>([]);
    const [pf, setPf] = useState({ amount: "", reason: "", type: "manual" });
    const debRef = useRef<any>();

    const navigate = useNavigate();

    useEffect(() => {
        if (profile?.role !== 'admin') {
            toast.error("عذراً، ليس لديك صلاحية الوصول لهذه الصفحة");
            navigate('/admin/dashboard');
        }
    }, [profile]);

    const load = useCallback(async (showLoader: boolean = true) => {
        if (showLoader) setLoading(true);
        try {
            const { data, count } = await fetchUsers({ page, pageSize: 20, search });
            setUsers(data || []);
            setCount(count || 0);
        } catch (err: any) { toast.error("فشل تحميل المستخدمين: " + (err?.message || "")); console.error(err); }
        finally { if (showLoader) setLoading(false); }
    }, [page, search]);

    useEffect(() => { load(); }, [load]);

    const handleSearch = (v: string) => {
        clearTimeout(debRef.current);
        debRef.current = setTimeout(() => { setSearch(v); setPage(0); }, 350);
    };

    const filtered = (() => {
        if (filter === 'all') return users;
        if (filter === 'admin') return users.filter(u => u.role === 'admin');
        if (filter === 'staff') return users.filter(u => u.role === 'staff' && (u.permissions ?? []).length === 0);
        if (filter === 'user') return users.filter(u => u.role === 'user');
        // Permission filters: staff who have this permission in their array
        return users.filter(u => u.role === 'staff' && (u.permissions ?? []).includes(filter));
    })();

    // const handleStatus = (u: User, ns: "active" | "inactive" | "banned") => setConfirm({
    //     title: ns === "banned" ? "حظر المستخدم" : "تغيير الحالة",
    //     message: `هل تريد تغيير حالة ${u.full_name}؟`,
    //     danger: ns === "banned",
    //     onConfirm: async () => {
    //         try { await updateUserStatus(u.id, ns); setConfirm(null); toast.success("تم تحديث الحالة"); load(false); }
    //         catch (err: any) { toast.error("فشل تحديث الحالة: " + (err?.message || "")); console.error(err); }
    //     }
    // });

    const openRoleModal = (u: User) => {
        setSelectedRole(u.role as UserRole);
        setSelectedPerms((u.permissions ?? []) as Permission[]);
        setRoleModal(u);
    };

    const togglePerm = (p: Permission) => {
        setSelectedPerms(prev =>
            prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
        );
    };

    const handleRole = async () => {
        if (!roleModal) return;
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: selectedRole, permissions: selectedPerms })
                .eq('id', roleModal.id);
            if (error) throw error;
            setRoleModal(null);
            toast.success(`تم تحديث الصلاحيات بنجاح`);
            load(false);
        } catch (err: any) {
            toast.error("فشل تحديث الصلاحية");
            console.error(err);
        }
    };

    const handleDelete = (u: User) => setConfirm({
        title: "حذف المستخدم",
        message: `هل أنت متأكد من حذف ${u.full_name} بشكل نهائي؟ لا يمكن التراجع عن هذا الإجراء.`,
        danger: true,
        onConfirm: async () => {
            try {
                console.log("User Deleted:", u.id);
                const { error } = await supabase.from('profiles').delete().eq('id', u.id);
                if (error) throw error;
                setConfirm(null);
                toast.success("تم حذف المستخدم بنجاح");
                load(false);
            }
            catch (err: any) { toast.error("فشل حذف المستخدم: " + (err?.message || "")); console.error(err); }
        }
    });

    const handlePoints = async () => {
        const amt = parseInt(pf.amount);
        if (!amt || !pf.reason) { toast.error("يرجى ملء جميع الحقول"); return; }
        if (!pointsModal || !adminUser) return;
        try {
            await updateUserPoints({
                userId: pointsModal.id,
                changeAmount: amt,
                reason: pf.reason,
                reasonType: pf.type as any,
                changedBy: adminUser.id,
            });
            toast.success(`تم ${amt > 0 ? "إضافة" : "خصم"} ${Math.abs(amt)} نقطة`);
            setPointsModal(null);
            setPf({ amount: "", reason: "", type: "manual" });
            load(false);
        } catch (err: any) { toast.error("فشل تحديث النقاط: " + (err?.message || "")); console.error(err); }
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-5 gap-4">
                <div>
                    <h2 className="m-0 text-xl font-extrabold text-[#111]">إدارة المستخدمين</h2>
                    <p className="m-0 mt-0.5 text-[#9ca3af] text-[13px]">{count} عضو</p>
                </div>
            </div>

            {/* ─── Search + Role/Responsibility Filters ─── */}
            <div className="mb-4">
                <input
                    onChange={e => handleSearch(e.target.value)}
                    placeholder="🔍  بحث بالاسم أو البريد..."
                    style={{ ...inputStyle, width: '100%', marginBottom: 10 }}
                />
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {([
                        { key: 'all',      label: 'الكل',          icon: '👁️' },
                        { key: 'user',     label: 'أعضاء',         icon: '👤' },
                        { key: 'staff',    label: 'موظف (كامل)',   icon: '🔧' },
                        { key: 'activity', label: 'الفعاليات',     icon: '🎯' },
                        { key: 'partners', label: 'الشركاء',       icon: '🤝' },
                        { key: 'reels',    label: 'الريلز',        icon: '🎬' },
                        { key: '3wn',      label: 'عون',           icon: '🛠' },
                        { key: 'academy',  label: 'الأكاديمية',    icon: '🎓' },
                        { key: 'busla',    label: 'بوصلة',         icon: '🧭' },
                        { key: 'admin',    label: 'مسؤولون',       icon: '👑' },
                    ] as const).map(f => {
                        const count =
                            f.key === 'all'      ? users.length
                          : f.key === 'user'     ? users.filter(u => u.role === 'user').length
                          : f.key === 'admin'    ? users.filter(u => u.role === 'admin').length
                          : f.key === 'staff'    ? users.filter(u => u.role === 'staff' && (u.permissions ?? []).length === 0).length
                          : users.filter(u => u.role === 'staff' && (u.permissions ?? []).includes(f.key)).length;
                        const active = filter === f.key;
                        return (
                            <button
                                key={f.key}
                                onClick={() => setFilter(f.key)}
                                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border-none cursor-pointer font-semibold text-[12px] whitespace-nowrap shrink-0 transition-all"
                                style={{
                                    background: active ? B : '#f3f4f6',
                                    color:      active ? '#fff' : '#6b7280',
                                    boxShadow:  active ? `0 2px 8px ${B}40` : 'none',
                                }}
                            >
                                <span>{f.icon}</span>
                                <span>{f.label}</span>
                                <span
                                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                                    style={{
                                        background: active ? 'rgba(255,255,255,.25)' : '#e5e7eb',
                                        color:      active ? '#fff' : '#9ca3af',
                                    }}
                                >
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-[#f0f0f0] overflow-hidden">
                {loading ? <Spinner /> : (
                    <div className="overflow-x-auto w-full">
                        <table className="w-full border-collapse text-[13px] text-right">
                            <thead>
                                <tr className="border-b border-[#f3f4f6] bg-[#fafafa]">
                                    {["العضو", "الجامعة", "الكلية", "النقاط", "الحالة", "الدور", "الإجراءات"].map(h => (
                                        <th key={h} className="p-3 md:px-4 md:py-3 font-bold text-[#6b7280] whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map(u => (
                                    <tr key={u.id} className="border-b border-[#fafafa]">
                                        <td className="p-3 md:px-4 md:py-3 min-w-[200px]">
                                            <div className="flex items-center gap-2.5">
                                                <Avatar name={u.full_name || u.email} src={u.avatar_url} size={36} />
                                                <div>
                                                    <div className="font-bold text-[#111]">{u.full_name || "—"}</div>
                                                    <div className="text-[11px] text-[#9ca3af]">{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-3 md:px-4 md:py-3 text-[#6b7280] whitespace-nowrap">{u.university || "—"}</td>
                                        <td className="p-3 md:px-4 md:py-3 text-[#6b7280] whitespace-nowrap">{u.faculty || "—"}</td>
                                        <td className="p-3 md:px-4 md:py-3"><span className="font-extrabold text-[15px]" style={{ color: B }}>{(u.total_points || 0).toLocaleString()}</span></td>
                                        <td className="p-3 md:px-4 md:py-3 whitespace-nowrap">
                                            <div className="flex flex-col gap-1">
                                                <Badge type={u.role}>
                                                    {ROLE_LABELS[u.role as UserRole] || u.role}
                                                </Badge>
                                                {u.role === 'staff' && (u.permissions ?? []).length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {(u.permissions as Permission[]).map(p => (
                                                            <span key={p} className="text-[10px] px-1.5 py-0.5 rounded-md" style={{ background: '#f0f0f0', color: '#555' }}>
                                                                {PERMISSION_ICONS[p]} {PERMISSION_LABELS[p]}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-3 md:px-4 md:py-3">
                                            <div className="flex gap-1.5 flex-wrap">
                                                {[
                                                    { icon: "⭐", bg: "#fef3c7", c: "#d97706", title: "إدارة النقاط", fn: () => setPointsModal(u), disabled: false },
                                                    { icon: "🔑", bg: "#dbeafe", c: "#2563eb", title: "تغيير الدور", fn: () => openRoleModal(u), disabled: adminUser?.id === u.id },
                                                    // { icon: "🚫", bg: "#fee2e2", c: "#dc2626", title: "حظر", fn: () => handleStatus(u, "banned"), disabled: adminUser?.id === u.id },
                                                    { icon: "🗑️", bg: "#fee2e2", c: "#dc2626", title: "حذف", fn: () => handleDelete(u), disabled: adminUser?.id === u.id },
                                                ].map((btn, i) => (
                                                    <button key={i} type="button" title={btn.title} onClick={(e) => { e.stopPropagation(); btn.fn(); }} disabled={btn.disabled} className={`w-[30px] h-[30px] rounded-lg border-none flex items-center justify-center shrink-0 text-sm transition-opacity ${btn.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:opacity-80 active:scale-95'}`} style={{ background: btn.bg, color: btn.c }}>{btn.icon}</button>
                                                ))}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {!filtered.length && <div className="text-center py-12 text-[#9ca3af]"><div className="text-[40px] mb-2">🔍</div><p>لا توجد نتائج</p></div>}
                    </div>
                )}
            </div>

            {/* Pagination */}
            {count > 20 && (
                <div className="flex justify-center items-center gap-2 mt-4">
                    <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="px-4 py-2 rounded-lg border-none font-semibold cursor-pointer" style={{ background: page === 0 ? "#f3f4f6" : B, color: page === 0 ? "#9ca3af" : "#fff" }}>السابق</button>
                    <span className="px-4 py-2 text-[13px] text-[#6b7280]">صفحة {page + 1}</span>
                    <button onClick={() => setPage(p => p + 1)} disabled={(page + 1) * 20 >= count} className="px-4 py-2 rounded-lg border-none font-semibold cursor-pointer" style={{ background: (page + 1) * 20 >= count ? "#f3f4f6" : B, color: (page + 1) * 20 >= count ? "#9ca3af" : "#fff" }}>التالي</button>
                </div>
            )}

            {/* Points Modal */}
            <Modal open={!!pointsModal} title={`إدارة نقاط: ${pointsModal?.full_name || ""}`} onClose={() => { setPointsModal(null); setPf({ amount: "", reason: "", type: "manual" }); }}>
                {pointsModal && (
                    <div>
                        <div className="flex items-center gap-3 bg-[#f8fafc] rounded-xl px-4 py-3.5 mb-5">
                            <Avatar name={pointsModal.full_name} size={44} />
                            <div>
                                <div className="font-bold text-[#111]">{pointsModal.full_name}</div>
                                <div className="text-[13px] text-[#6b7280]">النقاط الحالية: <span className="font-extrabold" style={{ color: B }}>{pointsModal.total_points}</span></div>
                            </div>
                        </div>
                        <Inp label="المبلغ (موجب = إضافة، سالب = خصم)" type="number" placeholder="مثال: 100 أو -50" value={pf.amount} onChange={e => setPf(p => ({ ...p, amount: e.target.value }))} />
                        <Sel label="نوع التغيير" value={pf.type} onChange={e => setPf(p => ({ ...p, type: e.target.value }))}>
                            <option value="manual">يدوي</option><option value="activity">فعالية</option>
                            <option value="volunteer">تطوع</option><option value="achievement">إنجاز</option>
                            <option value="deduction">خصم</option>
                        </Sel>
                        <Inp label="السبب *" placeholder="سبب تغيير النقاط..." value={pf.reason} onChange={e => setPf(p => ({ ...p, reason: e.target.value }))} />
                        <button onClick={handlePoints} className="w-full py-3 rounded-xl border-none font-bold cursor-pointer text-sm mt-1 text-white" style={{ background: B }}>
                            {Number(pf.amount) > 0 ? "➕ إضافة نقاط" : "➖ خصم نقاط"}
                        </button>
                    </div>
                )}
            </Modal>

            {/* Role Modal */}
            <Modal open={!!roleModal} title={`تعديل صلاحيات: ${roleModal?.full_name || ""}`} onClose={() => setRoleModal(null)}>
                {roleModal && (
                    <div>
                        {/* User info */}
                        <div className="flex items-center gap-3 bg-[#f8fafc] rounded-xl px-4 py-3.5 mb-5">
                            <Avatar name={roleModal.full_name} size={44} />
                            <div>
                                <div className="font-bold text-[#111]">{roleModal.full_name}</div>
                                <div className="text-[13px] text-[#6b7280]">{roleModal.email}</div>
                            </div>
                        </div>

                        {/* ── Layer 1: Hierarchy role ── */}
                        <div className="mb-5">
                            <p className="text-[12px] font-bold text-[#6b7280] uppercase tracking-wider mb-2.5">الدور الوظيفي</p>
                            <div className="flex gap-2">
                                {(['user', 'staff', 'admin'] as UserRole[]).map(r => (
                                    <button
                                        key={r}
                                        onClick={() => {
                                            setSelectedRole(r);
                                            if (r !== 'staff') setSelectedPerms([]);
                                        }}
                                        className="flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all"
                                        style={{
                                            borderColor: selectedRole === r ? B : '#e5e7eb',
                                            background: selectedRole === r ? B : '#fff',
                                            color: selectedRole === r ? '#fff' : '#6b7280',
                                        }}
                                    >
                                        {r === 'user' ? '👤 عضو' : r === 'staff' ? '🔧 موظف' : '👑 مسؤول'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* ── Layer 2: Permissions (staff only) ── */}
                        {selectedRole === 'staff' && (
                            <div className="mb-5">
                                <div className="flex items-center justify-between mb-2.5">
                                    <p className="text-[12px] font-bold text-[#6b7280] uppercase tracking-wider">مناطق المسؤولية</p>
                                    <button
                                        onClick={() => setSelectedPerms(selectedPerms.length === ALL_PERMISSIONS.length ? [] : [...ALL_PERMISSIONS])}
                                        className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-[#e5e7eb] hover:border-[#8B1A2A] transition-colors"
                                        style={{ color: B }}
                                    >
                                        {selectedPerms.length === ALL_PERMISSIONS.length ? 'إلغاء الكل' : 'تحديد الكل'}
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {ALL_PERMISSIONS.map(p => {
                                        const checked = selectedPerms.includes(p);
                                        return (
                                            <button
                                                key={p}
                                                onClick={() => togglePerm(p)}
                                                className="flex items-center gap-2.5 p-3 rounded-xl border-2 text-right transition-all"
                                                style={{
                                                    borderColor: checked ? B : '#e5e7eb',
                                                    background: checked ? `${B}0d` : '#fafafa',
                                                }}
                                            >
                                                <div
                                                    className="w-4 h-4 rounded flex items-center justify-center shrink-0 text-[10px] font-black text-white"
                                                    style={{ background: checked ? B : '#d1d5db' }}
                                                >
                                                    {checked ? '✓' : ''}
                                                </div>
                                                <span className="text-sm">{PERMISSION_ICONS[p]}</span>
                                                <span className="text-[13px] font-semibold" style={{ color: checked ? B : '#374151' }}>
                                                    {PERMISSION_LABELS[p]}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                                <p className="text-[11px] text-[#9ca3af] mt-2.5">
                                    {selectedPerms.length === 0
                                        ? '⚠️ بدون تحديد = وصول كامل لجميع الأقسام'
                                        : `✓ وصول إلى ${selectedPerms.length} قسم`}
                                </p>
                            </div>
                        )}

                        {selectedRole === 'admin' && (
                            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#c2410c' }}>
                                ⚠️ تحذير: هذا الدور يمنح صلاحيات إدارية كاملة غير محدودة.
                            </div>
                        )}

                        <button
                            onClick={handleRole}
                            className="w-full py-3 rounded-xl border-none font-bold cursor-pointer text-sm text-white"
                            style={{ background: B }}
                        >
                            🔑 حفظ الصلاحيات
                        </button>
                    </div>
                )}
            </Modal>
        </div>
    );
}
