import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Spinner, Inp, Tex, Modal, Badge, B, Sel } from "./components/AdminUI";
import { useOutletContext } from "react-router-dom";
import { Card } from '@/components/ui/card';

export default function GuideAdmin() {
    const { setConfirm } = useOutletContext<any>();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'guide' | 'faq'>('guide');
    const [modal, setModal] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState({ type: 'guide', title: '', content: '', icon: '📚', sort_order: 0 });

    const load = async () => {
        setLoading(true);
        const { data } = await supabase.from('knowledge_base').select('*').order('sort_order');
        setItems(data || []);
        setLoading(false);
    };

    useEffect(() => { load(); }, []);

    const save = async () => {
        try {
            const { error } = await supabase.from('knowledge_base').upsert({
                ...(editing ? { id: editing.id } : {}),
                ...form,
                type: activeTab
            });
            if (error) throw error;
            toast.success("تم الحفظ بنجاح");
            setModal(false); load();
        } catch (err: any) { toast.error(err.message); }
    };

    return (
        <div className="p-2">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black">إدارة الدليل والأسئلة</h2>
                <button onClick={() => { setEditing(null); setForm({ type: activeTab, title: '', content: '', icon: '📚', sort_order: 0 }); setModal(true); }}
                    className="px-5 py-2.5 rounded-xl text-white font-bold border-none" style={{ background: B }}>
                    + إضافة جديد
                </button>
            </div>

            {/* Tab Switcher */}
            <div className="flex gap-2 mb-6 bg-white p-1.5 rounded-2xl shadow-sm w-fit">
                <button onClick={() => setActiveTab('guide')} className={`px-6 py-2 rounded-xl border-none font-bold transition-all ${activeTab === 'guide' ? 'bg-slate-900 text-white' : 'text-slate-400 bg-transparent'}`}>الدليل</button>
                <button onClick={() => setActiveTab('faq')} className={`px-6 py-2 rounded-xl border-none font-bold transition-all ${activeTab === 'faq' ? 'bg-slate-900 text-white' : 'text-slate-400 bg-transparent'}`}>الأسئلة الشائعة</button>
            </div>

            {loading ? <Spinner /> : (
                <div className="grid gap-4">
                    {items.filter(i => i.type === activeTab).map(item => (
                        <Card key={item.id} className="p-4 flex justify-between items-center bg-white border-border rounded-2xl">
                            <div className="flex items-center gap-4">
                                {activeTab === 'guide' && <span className="text-2xl">{item.icon}</span>}
                                <div className="font-bold">{item.title}</div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => { setEditing(item); setForm(item); setModal(true); }} className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 border-none cursor-pointer">✏️</button>
                                <button onClick={() => setConfirm({
                                    title: "حذف العنصر",
                                    message: "هل أنت متأكد من الحذف؟",
                                    danger: true,
                                    onConfirm: async () => {
                                        await supabase.from('knowledge_base').delete().eq('id', item.id);
                                        setConfirm(null); load(); toast.success("تم الحذف");
                                    }
                                })} className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 text-red-500 border-none cursor-pointer">🗑️</button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <Modal open={modal} title={activeTab === 'guide' ? "قسم في الدليل" : "سؤال وجواب"} onClose={() => setModal(false)}>
                <Inp label={activeTab === 'guide' ? "عنوان القسم" : "السؤال"} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                {activeTab === 'guide' && <Inp label="الأيقونة (إيموجي)" value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} />}
                <Tex label={activeTab === 'guide' ? "المحتوى (افصل بين النقاط بـ |)" : "الإجابة"} value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} />
                <Inp label="الترتيب" type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) })} />
                <button onClick={save} className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold border-none mt-4">حفظ</button>
            </Modal>
        </div>
    );
}