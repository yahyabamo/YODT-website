import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useOutletContext } from "react-router-dom";
import { Spinner, B } from "./components/AdminUI";

// ─── Types ────────────────────────────────────────────────────────────────────
interface TurkeyApp {
    id: string; name: string; name_tr: string; category: string;
    description: string; icon: string; android_url: string | null;
    ios_url: string | null; is_essential: boolean; is_active: boolean; sort_order: number;
}
interface Place {
    id: string; name: string; category: string; area: string;
    rating: number; description: string; maps_url: string | null;
    is_active: boolean; sort_order: number;
}

const ACCENT = B || "#059669";

const EMOJI_LIST = [
    "📱", "🏛️", "🏥", "📮", "🚌", "💳", "✈️", "🚕", "🏦", "💰", "💜", "🍔", "🛒", "📖", "🎓",
    "💡", "🔑", "📡", "🌐", "⚡", "🕌", "🏖️", "🗺️", "☕", "🏢", "🇾🇪", "🚑", "💊", "🔬", "🌿",
    "🏟️", "🏪", "🎭", "🏨", "🌊", "🏔️", "🌳", "🚒", "🎨", "⚽", "🏋️", "🛍️", "🎪", "🛕", "🧪",
];

const inp: React.CSSProperties = {
    width: "100%", padding: "10px 13px", border: "1.5px solid #e5e7eb",
    borderRadius: 12, fontSize: 14, background: "#fff",
    boxSizing: "border-box", fontFamily: "inherit", outline: "none",
};

// ─── Atoms ────────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <button onClick={() => onChange(!checked)} style={{
            width: 40, height: 22, borderRadius: 99, border: "none", cursor: "pointer",
            background: checked ? ACCENT : "#d1d5db", position: "relative", transition: "background .2s", flexShrink: 0,
        }}>
            <div style={{ position: "absolute", top: 2, width: 18, height: 18, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,.2)", transition: "left .2s", left: checked ? 20 : 2 }} />
        </button>
    );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button onClick={onClick} style={{
            padding: "9px 18px", borderRadius: 11, cursor: "pointer", fontFamily: "inherit",
            border: active ? `2px solid ${ACCENT}` : "2px solid transparent",
            background: active ? `${ACCENT}12` : "transparent",
            color: active ? ACCENT : "#6b7280", fontWeight: 700, fontSize: 13, transition: "all .2s",
        }}>{children}</button>
    );
}

function FilterBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button onClick={onClick} style={{
            padding: "7px 14px", borderRadius: 99, cursor: "pointer", fontFamily: "inherit",
            border: active ? `2px solid ${ACCENT}` : "2px solid transparent",
            background: active ? `${ACCENT}12` : "#f3f4f6",
            color: active ? ACCENT : "#374151", fontWeight: 700, fontSize: 12, transition: "all .15s",
        }}>{children}</button>
    );
}

function LInp({ label, value, onChange, placeholder, type = "text", list }: any) {
    return (
        <div>
            <label style={{ fontSize: 12.5, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>{label}</label>
            <input type={type} value={value} onChange={e => onChange(e.target.value)}
                placeholder={placeholder} list={list} style={inp}
                onFocus={e => (e.target.style.borderColor = ACCENT)}
                onBlur={e => (e.target.style.borderColor = "#e5e7eb")} />
        </div>
    );
}

function LTextarea({ label, value, onChange, placeholder }: any) {
    return (
        <div>
            <label style={{ fontSize: 12.5, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>{label}</label>
            <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3}
                style={{ ...inp, resize: "none", lineHeight: 1.7 }}
                onFocus={e => (e.target.style.borderColor = ACCENT)}
                onBlur={e => (e.target.style.borderColor = "#e5e7eb")} />
        </div>
    );
}

function ToggleRow({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: "#f9fafb", border: "1px solid #f0f0f0" }}>
            <div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#111" }}>{label}</p>
                <p style={{ margin: 0, fontSize: 11.5, color: "#9ca3af" }}>{desc}</p>
            </div>
            <Toggle checked={checked} onChange={onChange} />
        </div>
    );
}

function EmojiPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    return (
        <div>
            <label style={{ fontSize: 12.5, fontWeight: 700, color: "#374151", display: "block", marginBottom: 8 }}>الأيقونة</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: 10, background: "#fafafa", borderRadius: 14, border: "1px solid #f0f0f0", maxHeight: 148, overflowY: "auto", marginBottom: 10 }}>
                {EMOJI_LIST.map(em => (
                    <button key={em} type="button" onClick={() => onChange(em)} style={{
                        width: 36, height: 36, borderRadius: 9,
                        border: `2px solid ${value === em ? ACCENT : "#e5e7eb"}`,
                        background: value === em ? `${ACCENT}12` : "#fff",
                        fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                        transform: value === em ? "scale(1.15)" : "scale(1)", transition: "all .12s",
                    }}>{em}</button>
                ))}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12, color: "#9ca3af" }}>مخصص:</span>
                <input value={value} onChange={e => onChange(e.target.value)} maxLength={2}
                    style={{ width: 46, height: 38, borderRadius: 9, border: `2px solid ${ACCENT}`, textAlign: "center", fontSize: 20, fontFamily: "inherit", outline: "none" }} />
                <span style={{ fontSize: 28, lineHeight: 1 }}>{value}</span>
            </div>
        </div>
    );
}

function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)" }}
            onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="w-full max-w-md max-h-[90vh] overflow-y-auto"
                style={{ background: "#fff", borderRadius: 24, boxShadow: "0 24px 64px rgba(0,0,0,0.2)", animation: "mIn .3s ease" }}
                dir="rtl">
                <div className="sticky top-0 flex items-center justify-between px-6 py-5 z-10"
                    style={{ background: `${ACCENT}0e`, borderBottom: `1px solid ${ACCENT}22`, borderRadius: "24px 24px 0 0" }}>
                    <h3 style={{ margin: 0, fontWeight: 800, fontSize: 17, color: "#111" }}>{title}</h3>
                    <button onClick={onClose} style={{ background: "#f3f4f6", border: "none", borderRadius: 10, width: 32, height: 32, cursor: "pointer", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280" }}>×</button>
                </div>
                <div className="p-6 flex flex-col gap-4">{children}</div>
                <style>{`@keyframes mIn{from{opacity:0;transform:scale(.9) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>
            </div>
        </div>
    );
}

function SaveBtn({ saving, editing, onClick }: { saving: boolean; editing: boolean; onClick: () => void }) {
    return (
        <button onClick={onClick} disabled={saving} style={{
            width: "100%", padding: "13px", borderRadius: 14, border: "none", fontFamily: "inherit",
            background: saving ? "#9ca3af" : `linear-gradient(135deg,${ACCENT},${ACCENT}cc)`,
            color: "#fff", fontWeight: 800, fontSize: 15, cursor: saving ? "not-allowed" : "pointer",
        }}>{saving ? "جاري الحفظ..." : editing ? "حفظ التعديلات" : "إضافة"}</button>
    );
}

function DataTable({ headers, children, empty, emptyIcon, emptyText = "لا توجد نتائج" }: any) {
    if (empty) return (
        <div className="text-center py-16 rounded-2xl" style={{ background: "#fafafa", border: "1.5px dashed #e5e7eb" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>{emptyIcon}</div>
            <p style={{ color: "#6b7280", fontWeight: 700 }}>{emptyText}</p>
        </div>
    );
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-[#f0f0f0] overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[13px] text-right">
                    <thead><tr style={{ background: "#fafafa", borderBottom: "1px solid #f3f4f6" }}>
                        {headers.map((h: string) => <th key={h} className="px-4 py-3 font-bold text-[#6b7280] whitespace-nowrap">{h}</th>)}
                    </tr></thead>
                    <tbody>{children}</tbody>
                </table>
            </div>
        </div>
    );
}

// ─── Category text input with datalist suggestions ────────────────────────────
function CategoryInput({ label, value, onChange, suggestions, listId }: {
    label: string; value: string; onChange: (v: string) => void;
    suggestions: string[]; listId: string;
}) {
    return (
        <div>
            {/* <label style={{ fontSize: 12.5, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>
                {label}
                <span style={{ fontSize: 11, fontWeight: 500, color: "#9ca3af", marginRight: 6 }}>
                    (اكتب بحرية أو اختر من القائمة)
                </span>
            </label> */}
            <input
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder="مثال: مستشفيات"
                list={listId}
                style={inp}
                onFocus={e => (e.target.style.borderColor = ACCENT)}
                onBlur={e => (e.target.style.borderColor = "#e5e7eb")}
            />
            <datalist id={listId}>
                {suggestions.map(s => <option key={s} value={s} />)}
            </datalist>
            {/* Existing chips */}
            {suggestions.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                    {suggestions.map(s => (
                        <button key={s} type="button" onClick={() => onChange(s)}
                            style={{
                                padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 700,
                                border: `1.5px solid ${value === s ? ACCENT : "#e5e7eb"}`,
                                background: value === s ? `${ACCENT}12` : "#f9fafb",
                                color: value === s ? ACCENT : "#6b7280",
                                cursor: "pointer", fontFamily: "inherit", transition: "all .12s",
                            }}>{s}</button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── App Form Modal ───────────────────────────────────────────────────────────
function AppModal({ open, editing, appCategories, onClose, onSaved }: {
    open: boolean; editing: TurkeyApp | null; appCategories: string[];
    onClose: () => void; onSaved: () => void;
}) {
    const EMPTY = { name: "", name_tr: "", category: "", description: "", icon: "📱", android_url: "", ios_url: "", is_essential: false, is_active: true };
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);
    const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

    useEffect(() => {
        if (editing) setForm({ name: editing.name, name_tr: editing.name_tr, category: editing.category, description: editing.description || "", icon: editing.icon || "📱", android_url: editing.android_url || "", ios_url: editing.ios_url || "", is_essential: editing.is_essential, is_active: editing.is_active });
        else setForm(EMPTY);
    }, [editing, open]);

    const save = async () => {
        if (!form.name.trim() || !form.name_tr.trim()) return toast.error("يرجى إدخال اسم التطبيق");
        if (!form.category.trim()) return toast.error("يرجى إدخال تصنيف التطبيق");
        setSaving(true);
        try {
            const payload = { name: form.name.trim(), name_tr: form.name_tr.trim(), category: form.category.trim(), description: form.description.trim() || null, icon: form.icon, android_url: form.android_url.trim() || null, ios_url: form.ios_url.trim() || null, is_essential: form.is_essential, is_active: form.is_active };
            const { error } = editing
                ? await supabase.from("turkey_apps").update(payload).eq("id", editing.id)
                : await supabase.from("turkey_apps").insert(payload);
            if (error) throw error;
            toast.success(editing ? "تم التحديث ✅" : "تم الإضافة ✅");
            onSaved(); onClose();
        } catch (err: any) { toast.error(err.message); }
        finally { setSaving(false); }
    };

    if (!open) return null;
    return (
        <ModalShell title={editing ? "✏️ تعديل التطبيق" : "📱 إضافة تطبيق"} onClose={onClose}>
            <EmojiPicker value={form.icon} onChange={v => set("icon", v)} />
            <div className="grid grid-cols-2 gap-3">
                <LInp label="الاسم بالعربي *" value={form.name} onChange={(v: string) => set("name", v)} placeholder="الحكومة الإلكترونية" />
                <LInp label="الاسم بالتركي *" value={form.name_tr} onChange={(v: string) => set("name_tr", v)} placeholder="e-Devlet" />
            </div>
            <CategoryInput
                label="التصنيف *"
                value={form.category}
                onChange={v => set("category", v)}
                suggestions={appCategories}
                listId="app-cats-list"
            />
            <LTextarea label="الوصف" value={form.description} onChange={(v: string) => set("description", v)} placeholder="وصف مختصر..." />
            <LInp label="رابط Android" value={form.android_url} onChange={(v: string) => set("android_url", v)} placeholder="https://play.google.com/..." type="url" />
            <LInp label="رابط iOS" value={form.ios_url} onChange={(v: string) => set("ios_url", v)} placeholder="https://apps.apple.com/..." type="url" />
            <ToggleRow label="⭐ تطبيق أساسي" desc="يظهر في قسم التطبيقات الأساسية" checked={form.is_essential} onChange={v => set("is_essential", v)} />
            <ToggleRow label="✅ نشط ومرئي" desc="يظهر للطلاب" checked={form.is_active} onChange={v => set("is_active", v)} />
            <SaveBtn saving={saving} editing={!!editing} onClick={save} />
        </ModalShell>
    );
}

// ─── Place Form Modal ─────────────────────────────────────────────────────────
function PlaceModal({ open, editing, placeCategories, onClose, onSaved }: {
    open: boolean; editing: Place | null; placeCategories: string[];
    onClose: () => void; onSaved: () => void;
}) {
    const EMPTY = { name: "", category: "", area: "", rating: "4.5", description: "", maps_url: "", is_active: true };
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);
    const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

    useEffect(() => {
        if (editing) setForm({ name: editing.name, category: editing.category, area: editing.area || "", rating: String(editing.rating), description: editing.description || "", maps_url: editing.maps_url || "", is_active: editing.is_active });
        else setForm(EMPTY);
    }, [editing, open]);

    const save = async () => {
        if (!form.name.trim()) return toast.error("يرجى إدخال اسم المكان");
        if (!form.category.trim()) return toast.error("يرجى إدخال تصنيف المكان");
        setSaving(true);
        try {
            const payload = { name: form.name.trim(), category: form.category.trim(), area: form.area.trim() || null, rating: parseFloat(form.rating) || 4.0, description: form.description.trim() || null, maps_url: form.maps_url.trim() || null, is_active: form.is_active };
            const { error } = editing
                ? await supabase.from("istanbul_places").update(payload).eq("id", editing.id)
                : await supabase.from("istanbul_places").insert(payload);
            if (error) throw error;
            toast.success(editing ? "تم التحديث ✅" : "تم الإضافة ✅");
            onSaved(); onClose();
        } catch (err: any) { toast.error(err.message); }
        finally { setSaving(false); }
    };

    if (!open) return null;
    return (
        <ModalShell title={editing ? "✏️ تعديل المكان" : "📍 إضافة مكان"} onClose={onClose}>
            <LInp label="اسم المكان *" value={form.name} onChange={(v: string) => set("name", v)} placeholder="مستشفى الرحمة" />
            <CategoryInput
                label="التصنيف *"
                value={form.category}
                onChange={v => set("category", v)}
                suggestions={placeCategories}
                listId="place-cats-list"
            />
            <LInp label="المنطقة" value={form.area} onChange={(v: string) => set("area", v)} placeholder="بشيكتاش" />
            <div>
                <label style={{ fontSize: 12.5, fontWeight: 700, color: "#374151", display: "block", marginBottom: 6 }}>
                    التقييم ⭐ ({parseFloat(form.rating).toFixed(1)})
                </label>
                <input type="range" min="1" max="5" step="0.1" value={form.rating}
                    onChange={e => set("rating", e.target.value)} style={{ width: "100%", accentColor: ACCENT }} />
                <div className="flex justify-between text-[11px] text-gray-400 mt-1"><span>1.0</span><span>3.0</span><span>5.0</span></div>
            </div>
            <LTextarea label="الوصف" value={form.description} onChange={(v: string) => set("description", v)} placeholder="وصف مختصر..." />
            <LInp label="رابط خرائط Google" value={form.maps_url} onChange={(v: string) => set("maps_url", v)} placeholder="https://maps.google.com/..." type="url" />
            <ToggleRow label="✅ نشط ومرئي" desc="يظهر للطلاب" checked={form.is_active} onChange={v => set("is_active", v)} />
            <SaveBtn saving={saving} editing={!!editing} onClick={save} />
        </ModalShell>
    );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────
export default function TurkeyAdmin() {
    const { setConfirm } = useOutletContext<{ setConfirm: (v: any) => void }>();
    const [tab, setTab] = useState<"apps" | "places">("apps");
    const [apps, setApps] = useState<TurkeyApp[]>([]);
    const [places, setPlaces] = useState<Place[]>([]);
    const [loading, setLoading] = useState(true);
    const [appModal, setAppModal] = useState(false);
    const [placeModal, setPlaceModal] = useState(false);
    const [editingApp, setEditingApp] = useState<TurkeyApp | null>(null);
    const [editingPlace, setEditingPlace] = useState<Place | null>(null);
    const [catFilter, setCatFilter] = useState("all");
    const [search, setSearch] = useState("");

    const load = useCallback(async (showLoading = true) => {
        if (showLoading) setLoading(true);
        try {
            const [{ data: aData }, { data: pData }] = await Promise.all([
                supabase.from("turkey_apps").select("*").order("sort_order"),
                supabase.from("istanbul_places").select("*").order("sort_order"),
            ]);
            setApps(aData || []);
            setPlaces(pData || []);
        } catch { toast.error("فشل تحميل البيانات"); }
        finally { if (showLoading) setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    // Derive unique categories directly from the data — no extra table
    const appCategories = [...new Set(apps.map(a => a.category).filter(Boolean))].sort();
    const placeCategories = [...new Set(places.map(p => p.category).filter(Boolean))].sort();
    const currentCats = tab === "apps" ? appCategories : placeCategories;

    // Delete
    const confirmDelete = (label: string, fn: () => Promise<void>) =>
        setConfirm({
            title: "تأكيد الحذف", message: `حذف "${label}"؟`, danger: true,
            onConfirm: async () => { await fn(); setConfirm(null); load(false); }
        });

    const deleteApp = (a: TurkeyApp) => confirmDelete(a.name, async () => { const { error } = await supabase.from("turkey_apps").delete().eq("id", a.id); if (error) throw error; toast.success("تم الحذف"); });
    const deletePlace = (p: Place) => confirmDelete(p.name, async () => { const { error } = await supabase.from("istanbul_places").delete().eq("id", p.id); if (error) throw error; toast.success("تم الحذف"); });

    // Toggle
    const toggleApp = async (a: TurkeyApp) => { await supabase.from("turkey_apps").update({ is_active: !a.is_active }).eq("id", a.id); load(false); };
    const togglePlace = async (p: Place) => { await supabase.from("istanbul_places").update({ is_active: !p.is_active }).eq("id", p.id); load(false); };

    // Filter
    const filteredApps = apps.filter(a => {
        const matchCat = catFilter === "all" || a.category === catFilter;
        const q = search.toLowerCase();
        return matchCat && (!q || a.name.toLowerCase().includes(q) || a.name_tr.toLowerCase().includes(q));
    });
    const filteredPlaces = places.filter(p => {
        const matchCat = catFilter === "all" || p.category === catFilter;
        const q = search.toLowerCase();
        return matchCat && (!q || p.name.toLowerCase().includes(q) || (p.area || "").toLowerCase().includes(q));
    });

    return (
        <div dir="rtl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="m-0 text-xl font-extrabold text-[#111]">🇹🇷 إدارة دليل تركيا</h2>
                    <p className="m-0 mt-0.5 text-[#9ca3af] text-[13px]">{apps.length} تطبيق · {places.length} مكان</p>
                </div>
                <button
                    onClick={() => tab === "apps" ? (setEditingApp(null), setAppModal(true)) : (setEditingPlace(null), setPlaceModal(true))}
                    className="px-5 py-2.5 rounded-xl border-none font-bold cursor-pointer text-sm text-white"
                    style={{ background: ACCENT }}>
                    + {tab === "apps" ? "إضافة تطبيق" : "إضافة مكان"}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <TabBtn active={tab === "apps"} onClick={() => { setTab("apps"); setCatFilter("all"); setSearch(""); }}>📱 التطبيقات ({apps.length})</TabBtn>
                <TabBtn active={tab === "places"} onClick={() => { setTab("places"); setCatFilter("all"); setSearch(""); }}>📍 الأماكن ({places.length})</TabBtn>
            </div>

            {loading ? <Spinner /> : (
                <>
                    {/* Search + filters — derived from real data */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-5">
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 بحث..."
                            style={{ ...inp, maxWidth: 220 }} />
                        <div className="flex gap-2 flex-wrap">
                            <FilterBtn active={catFilter === "all"} onClick={() => setCatFilter("all")}>الكل</FilterBtn>
                            {currentCats.map(cat => (
                                <FilterBtn key={cat} active={catFilter === cat} onClick={() => setCatFilter(cat)}>{cat}</FilterBtn>
                            ))}
                        </div>
                    </div>

                    {/* ═══ APPS ═══ */}
                    {tab === "apps" && (
                        <DataTable empty={filteredApps.length === 0} emptyIcon="📱" emptyText="لا توجد تطبيقات"
                            headers={["التطبيق", "التصنيف", "المنصات", "أساسي", "الحالة", "إجراءات"]}>
                            {filteredApps.map(a => (
                                <tr key={a.id} className="border-b border-[#fafafa] hover:bg-gray-50" style={{ opacity: a.is_active ? 1 : 0.55 }}>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2.5">
                                            <span style={{ fontSize: 22, width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", background: "#f3f4f6", borderRadius: 10, flexShrink: 0 }}>{a.icon}</span>
                                            <div>
                                                <p style={{ margin: 0, fontWeight: 700, color: "#111" }}>{a.name}</p>
                                                <p style={{ margin: 0, fontSize: 11.5, color: "#9ca3af" }}>{a.name_tr}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: `${ACCENT}12`, color: ACCENT }}>{a.category}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1">
                                            {a.android_url && <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "#d1fae5", color: "#059669" }}>Android</span>}
                                            {a.ios_url && <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "#dbeafe", color: "#2563eb" }}>iOS</span>}
                                            {!a.android_url && !a.ios_url && <span style={{ fontSize: 11, color: "#9ca3af" }}>ويب فقط</span>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">{a.is_essential ? "⭐" : <span style={{ color: "#d1d5db" }}>—</span>}</td>
                                    <td className="px-4 py-3"><Toggle checked={a.is_active} onChange={() => toggleApp(a)} /></td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1.5">
                                            <button onClick={() => { setEditingApp(a); setAppModal(true); }} style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: "#f3f4f6", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>✏️</button>
                                            <button onClick={() => deleteApp(a)} style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: "#fee2e2", color: "#dc2626", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>🗑</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </DataTable>
                    )}

                    {/* ═══ PLACES ═══ */}
                    {tab === "places" && (
                        <DataTable empty={filteredPlaces.length === 0} emptyIcon="📍" emptyText="لا توجد أماكن"
                            headers={["المكان", "التصنيف", "المنطقة", "التقييم", "خرائط", "الحالة", "إجراءات"]}>
                            {filteredPlaces.map(p => (
                                <tr key={p.id} className="border-b border-[#fafafa] hover:bg-gray-50" style={{ opacity: p.is_active ? 1 : 0.55 }}>
                                    <td className="px-4 py-3">
                                        <p style={{ margin: 0, fontWeight: 700, color: "#111" }}>{p.name}</p>
                                        {p.description && <p style={{ margin: 0, fontSize: 11.5, color: "#9ca3af", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.description}</p>}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: `${ACCENT}12`, color: ACCENT }}>{p.category}</span>
                                    </td>
                                    <td className="px-4 py-3 text-[#6b7280] whitespace-nowrap">{p.area || "—"}</td>
                                    <td className="px-4 py-3"><span style={{ fontWeight: 800, color: "#f59e0b" }}>⭐ {p.rating}</span></td>
                                    <td className="px-4 py-3">
                                        {p.maps_url ? <a href={p.maps_url} target="_blank" rel="noreferrer" style={{ color: ACCENT, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>↗ فتح</a>
                                            : <span style={{ color: "#d1d5db", fontSize: 12 }}>—</span>}
                                    </td>
                                    <td className="px-4 py-3"><Toggle checked={p.is_active} onChange={() => togglePlace(p)} /></td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1.5">
                                            <button onClick={() => { setEditingPlace(p); setPlaceModal(true); }} style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: "#f3f4f6", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>✏️</button>
                                            <button onClick={() => deletePlace(p)} style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: "#fee2e2", color: "#dc2626", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>🗑</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </DataTable>
                    )}
                </>
            )}

            {/* Modals */}
            <AppModal open={appModal} editing={editingApp} appCategories={appCategories} onClose={() => { setAppModal(false); setEditingApp(null); }} onSaved={() => load(false)} />
            <PlaceModal open={placeModal} editing={editingPlace} placeCategories={placeCategories} onClose={() => { setPlaceModal(false); setEditingPlace(null); }} onSaved={() => load(false)} />
        </div>
    );
}