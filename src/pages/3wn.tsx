import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SmartTopBar } from '@/components/layout/SmartTopBar';
import { BottomNav } from '@/components/layout/BottomNav';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Camera, User, Send, Check, Calendar, Store, Gift } from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Cloudinary Upload ────────────────────────────────────────────────────────
async function uploadFile(file: File): Promise<string> {
    const cloudName = "dknz5c7d0";
    const uploadPreset = "activity_unsigned";
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", "student_cards");
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || "فشل رفع الملف");
    return data.secure_url;
}

interface Service {
    id: string; title: string; description: string;
    icon: string; color: string; category: string; is_available: boolean;
}

const COLLEGES = ["كلية الشريعة", "كلية الطب", "كلية الهندسة", "كلية العلوم", "كلية الآداب", "كلية التربية", "كلية الاقتصاد", "كلية الحاسوب", "أخرى"];
const YEARS = ["السنة الأولى", "السنة الثانية", "السنة الثالثة", "السنة الرابعة", "دراسات عليا"];

// ─── Request Modal ────────────────────────────────────────────────────────────
function RequestModal({ service, onClose }: { service: Service; onClose: () => void }) {
    const [form, setForm] = useState({ student_name: "", student_id_number: "", phone: "", email: "", university: "", academic_year: "", notes: "" });
    const [cardFile, setCardFile] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);
    const f = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

    const submit = async () => {
        if (!form.student_name || !form.phone || !form.university) {
            toast.error("يرجى تعبئة جميع الحقول الإلزامية"); return;
        }
        if (!cardFile) { toast.error("يرجى رفع صورة الهوية الجامعية"); return; }
        setSubmitting(true);
        try {
            const student_card_url = await uploadFile(cardFile);
            const { error } = await supabase.from("service_requests").insert({ service_id: service.id, ...form, student_card_url });
            if (error) throw error;
            setDone(true);
        } catch (err: any) { toast.error(err.message || "فشل إرسال الطلب"); }
        finally { setSubmitting(false); }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6 bg-black/80 backdrop-blur-sm"
            onClick={e => { if (e.target === e.currentTarget && !submitting) onClose(); }}>
            <div className="w-full md:max-w-lg rounded-t-[32px] md:rounded-[28px] overflow-hidden shadow-2xl bg-background border border-border"
                style={{ maxHeight: "92vh", overflowY: "auto", animation: "slideUp .35s cubic-bezier(.34,1.56,.64,1)" }}>

                {/* Modal Header */}
                <div className="sticky top-0 z-10 px-6 pt-5 pb-4 border-b border-border bg-card"
                    style={{ background: `linear-gradient(135deg, ${service.color}22, ${service.color}08)` }}>
                    <div className="flex items-center gap-3">
                        <div className="text-3xl w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm shrink-0"
                            style={{ background: `${service.color}18` }}>{service.icon}</div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-extrabold uppercase tracking-[.12em] m-0" style={{ color: service.color }}>طلب خدمة</p>
                            <h3 className="text-lg font-extrabold m-0 truncate text-foreground">{service.title}</h3>
                        </div>
                        <button onClick={onClose}
                            className="w-8 h-8 rounded-full border-none cursor-pointer flex items-center justify-center text-base bg-muted hover:bg-accent text-muted-foreground transition-colors">✕</button>
                    </div>
                </div>

                {done ? (
                    <div className="flex flex-col items-center py-16 px-8 text-center bg-card">
                        <div className="text-7xl mb-5" style={{ animation: "bounceIn .6s ease" }}>🎉</div>
                        <h3 className="text-2xl font-extrabold mb-2 text-foreground">تم إرسال طلبك بنجاح!</h3>
                        <p className="leading-relaxed mb-8 text-muted-foreground">سيتم مراجعة طلبك من قِبل الإدارة والتواصل معك قريباً.</p>
                        <Button onClick={onClose} className="px-8 py-3 rounded-2xl font-bold shadow-lg h-12" style={{ background: service.color }}>رائع، شكراً! 🙏</Button>
                    </div>
                ) : (
                    <div className="p-5 space-y-4 bg-card" dir="rtl">
                        <p className="text-[11px] font-extrabold uppercase tracking-widest mb-2 pb-1.5 border-b border-border text-muted-foreground">البيانات الشخصية</p>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-muted-foreground">الاسم الكامل *</label>
                                <input value={form.student_name} onChange={e => f("student_name", e.target.value)} placeholder="الاسم" className="w-full h-11 bg-secondary border-none rounded-xl px-4 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-muted-foreground">رقم الطالب *</label>
                                <input value={form.student_id_number} onChange={e => f("student_id_number", e.target.value)} className="w-full h-11 bg-secondary border-none rounded-xl px-4 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-muted-foreground">رقم الجوال *</label>
                                <input value={form.phone} onChange={e => f("phone", e.target.value)} placeholder="05xxxxxxxx" type="tel" className="w-full h-11 bg-secondary border-none rounded-xl px-4 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-muted-foreground">البريد الإلكتروني</label>
                                <input value={form.email} onChange={e => f("email", e.target.value)} type="email" className="w-full h-11 bg-secondary border-none rounded-xl px-4 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-muted-foreground">الجامعة *</label>
                                <input value={form.university} onChange={e => f("university", e.target.value)} className="w-full h-11 bg-secondary border-none rounded-xl px-4 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none" />
                                {/* <option value="">اختر</option>
                                    {COLLEGES.map(c => <option key={c}>{c}</option>)} */}
                                {/* </select> */}
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-muted-foreground">السنة الدراسية</label>
                                <select value={form.academic_year} onChange={e => f("academic_year", e.target.value)} className="w-full h-11 bg-secondary border-none rounded-xl px-4 text-sm text-foreground outline-none">
                                    <option value="">اختر</option>
                                    {YEARS.map(y => <option key={y}>{y}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-muted-foreground">ملاحظات</label>
                            <textarea value={form.notes} onChange={e => f("notes", e.target.value)} placeholder="أي تفاصيل إضافية..." rows={3} className="w-full bg-secondary border-none rounded-xl px-4 py-3 text-sm text-foreground outline-none resize-none" />
                        </div>

                        <p className="text-[11px] font-extrabold uppercase tracking-widest pt-1 pb-1.5 border-b border-border text-muted-foreground">الهوية الجامعية *</p>
                        <label className="flex flex-col items-center justify-center w-full rounded-2xl cursor-pointer transition-all border-2 border-dashed border-muted bg-muted/30 hover:bg-muted/50 p-5 min-h-[96px]">
                            <input type="file" accept="image/*,.pdf" className="hidden" onChange={e => setCardFile(e.target.files?.[0] || null)} />
                            {cardFile ? (
                                <div className="text-center">
                                    <div className="text-2xl mb-1 text-primary">✅</div>
                                    <p className="font-bold text-sm m-0 text-foreground truncate max-w-[200px]">{cardFile.name}</p>
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground">
                                    <Camera className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p className="font-bold text-sm m-0"> öğrenci belgesi </p>
                                </div>
                            )}
                        </label>

                        <Button onClick={submit} disabled={submitting} className="w-full h-12 rounded-2xl font-extrabold text-white shadow-md" style={{ background: service.color }}>
                            {submitting ? 'جاري الإرسال...' : 'إرسال الطلب 🚀'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Service Card ─────────────────────────────────────────────────────────────
function ServiceCard({ service, onApply }: { service: Service; onApply: () => void }) {
    const [hovered, setHovered] = useState(false);
    return (
        <Card onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
            className={cn("relative overflow-hidden rounded-3xl bg-card border-2 transition-all duration-300", hovered ? "translate-y-[-8px] border-primary/20 shadow-xl" : "border-border shadow-soft")}>

            <div className="absolute inset-0 pointer-events-none"
                style={{ background: `radial-gradient(circle at 80% 15%, ${service.color}18 0%, transparent 55%)`, opacity: hovered ? 1 : 0.5 }} />

            <div className="absolute top-4 right-4 left-4 flex justify-between">
                <span className="text-[11px] font-bold px-3 py-1 rounded-full" style={{ background: `${service.color}15`, color: service.color }}>{service.category}</span>
                {!service.is_available && <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-muted text-muted-foreground">غير متاح</span>}
            </div>

            <div className="p-7 pt-12 relative z-10">
                <div className="w-[72px] h-[72px] rounded-[22px] flex items-center justify-center text-4xl mb-5 shadow-sm bg-secondary border border-border"
                    style={{ transition: "transform .3s", transform: hovered ? "rotate(-8deg) scale(1.1)" : "rotate(0)" }}>
                    {service.icon}
                </div>

                <h3 className="text-xl font-extrabold mb-2 m-0 text-foreground">{service.title}</h3>
                <p className="text-[13px] leading-relaxed mb-5 m-0 text-muted-foreground min-h-[44px]">{service.description || "اضغط لمعرفة التفاصيل وتقديم طلبك."}</p>

                <Button onClick={service.is_available ? onApply : undefined} disabled={!service.is_available}
                    className="w-full rounded-2xl font-extrabold text-sm h-11"
                    variant={service.is_available ? "default" : "secondary"}
                    style={service.is_available ? { background: hovered ? service.color : `${service.color}18`, color: hovered ? "#fff" : service.color } : {}}>
                    {service.is_available ? "تقدم بطلب ←" : "غير متاح حالياً"}
                </Button>
            </div>
        </Card>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Awn() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Service | null>(null);
    const [filter, setFilter] = useState("الكل");
    const [showSearch, setShowSearch] = useState(false);

    useEffect(() => {
        supabase.from("services").select("*").order("sort_order")
            .then(({ data }) => { setServices(data || []); setLoading(false); });
    }, []);

    const categories = ["الكل", ...Array.from(new Set(services.map(s => s.category)))];
    const filtered = filter === "الكل" ? services : services.filter(s => s.category === filter);

    return (
        <div dir="rtl" className="min-h-screen bg-background transition-colors duration-300">
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
                <div className="p-4 max-w-screen-xl mx-auto">
                    <SmartTopBar onOpenSearch={() => setShowSearch(true)} />
                </div>
            </header>

            {/* ── Hero ── */}
            <div className="relative overflow-hidden px-6 py-16 md:py-24 text-center"
                style={{ background: "linear-gradient(135deg,#064e3b 0%,#065f46 45%,#0d9488 100%)" }}>
                <div className="absolute inset-0 pointer-events-none"
                    style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/svg%3E\")" }} />
                <div className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none" style={{ background: "rgba(255,255,255,0.05)", transform: "translate(30%,-30%)" }} />
                <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full pointer-events-none" style={{ background: "rgba(255,255,255,0.04)", transform: "translate(-40%,55%)" }} />

                <div className="relative z-10 max-w-2xl mx-auto">
                    <div className="relative mb-8 text-center">
                        {/* Decorative lines */}
                        <div className="flex items-center justify-center gap-4 mb-3">
                            <div className="h-px w-16 bg-gradient-to-l from-emerald-400 to-transparent" />
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            <div className="h-px w-16 bg-gradient-to-r from-emerald-400 to-transparent" />
                        </div>

                        {/* Main title with Arabic styling */}
                        <h2 className="text-3xl md:text-4xl font-black text-white relative inline-block">
                            <span className="relative z-10 drop-shadow-2xl"
                                style={{ textShadow: "0 0 30px rgba(110, 231, 183, 0.5), 0 0 60px rgba(110, 231, 183, 0.3)" }}>
                                عـون
                            </span>
                            {/* Subtle underline */}
                            <svg className="absolute -bottom-2 left-0 w-full" height="6" viewBox="0 0 200 6">
                                <path d="M0 3 Q50 0, 100 3 T200 3" stroke="#6ee7b7" strokeWidth="2" fill="none" opacity="0.6" />
                            </svg>
                        </h2>

                        {/* <p className="mt-3 text-emerald-200/80 text-sm font-medium tracking-widest uppercase">
                            Yemeni Students Union
                        </p> */}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight" style={{ fontFamily: "'Cairo', sans-serif", textShadow: "0 2px 20px rgba(0,0,0,0.2)" }}>
                        نحن هنا <span style={{ color: "#6ee7b7" }}>لمساعدتك</span>
                    </h1>
                    <p className="text-green-100 text-base md:text-lg leading-relaxed max-w-xl mx-auto" style={{ opacity: 0.9 }}>
                        تصفح الخدمات المتاحة وتقدم بطلبك بكل يسر وسهولة. نسعى دائماً لدعم مسيرتك الأكاديمية.
                    </p>
                </div>
            </div>


            {/* ── Stats ── */}
            <div className="max-w-3xl mx-auto px-6 -mt-5 relative z-10 mb-10">
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { label: "خدمة متاحة", v: services.filter(s => s.is_available).length, c: "#10b981" },
                        { label: "تصنيف", v: categories.length - 1 || 0, c: "#8b5cf6" },
                        { label: "دعم متواصل", v: "⭐", c: "#f59e0b" },
                    ].map(s => (
                        <Card key={s.label} className="p-4 text-center bg-card border-border shadow-soft rounded-2xl">
                            <div className="text-2xl font-extrabold" style={{ color: s.c }}>{s.v}</div>
                            <div className="text-[11px] mt-0.5 text-muted-foreground">{s.label}</div>
                        </Card>
                    ))}
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 pb-32">
                {/* ── Category Tabs ── */}
                <div className="flex flex-wrap gap-2 mb-8 justify-center">
                    {categories.map(cat => (
                        <Button key={cat} onClick={() => setFilter(cat)}
                            variant={filter === cat ? "default" : "outline"}
                            className={cn("rounded-full px-5 font-bold h-9", filter === cat ? "bg-emerald-800 text-white" : "bg-card text-muted-foreground border-border")}>
                            {cat}
                        </Button>
                    ))}
                </div>

                {/* ── Grid ── */}
                {loading ? (
                    <div className="flex justify-center py-24"><div className="w-12 h-12 rounded-full border-4 border-emerald-100 border-t-emerald-700 animate-spin" /></div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                        <Gift className="h-12 w-12 mx-auto mb-3 opacity-20" />
                        <p className="text-lg font-bold">لا توجد خدمات متاحة</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map((service) => (
                            <ServiceCard key={service.id} service={service} onApply={() => setSelected(service)} />
                        ))}
                    </div>
                )}
            </div>

            <BottomNav />

            {selected && <RequestModal service={selected} onClose={() => setSelected(null)} />}

            <style>{`
                @keyframes slideUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                @keyframes bounceIn { 0%{transform:scale(.3);opacity:0} 60%{transform:scale(1.1)} 80%{transform:scale(.95)} 100%{transform:scale(1);opacity:1} }
            `}</style>
        </div>
    );
}