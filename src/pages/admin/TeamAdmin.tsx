import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Spinner, Inp, Tex, Modal, Badge, B, Sel } from "./components/AdminUI";
import { useOutletContext } from "react-router-dom";
import { Card } from '@/components/ui/card';

const ACCENT = "#8B1A2A";

async function uploadImage(file: File, folder: string): Promise<string> {
    const cloudName = "dknz5c7d0";
    const uploadPreset = "activity_unsigned";
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    formData.append("folder", folder);
    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: formData }
    );
    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "Upload failed");
    return data.secure_url;
}

interface TeamMember {
    id: string;
    name: string;
    role: string;
    description: string;
    image_url: string;
    gender: 'male' | 'female';
    created_at?: string;
}

const EMPTY: Omit<TeamMember, 'id' | 'created_at'> = {
    name: '',
    role: '',
    description: '',
    image_url: '',
    gender: 'male',
};

const TeamAdmin = () => {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<TeamMember | null>(null);
    const [form, setForm] = useState({ ...EMPTY });

    // Delete confirm
    const [deleteTarget, setDeleteTarget] = useState<TeamMember | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const fetchMembers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('union_team_members')
            .select('*')
            .order('created_at', { ascending: true });
        if (error) {
            toast.error('فشل في تحميل الأعضاء');
        } else {
            setMembers(data || []);
        }
        setLoading(false);
    };

    useEffect(() => { fetchMembers(); }, []);

    const openAdd = () => {
        setEditTarget(null);
        setForm({ ...EMPTY });
        setSelectedImage(null);
        setModalOpen(true);
    };

    const openEdit = (m: TeamMember) => {
        setEditTarget(m);
        setForm({
            name: m.name,
            role: m.role,
            description: m.description,
            image_url: m.image_url,
            gender: m.gender,
        });
        setSelectedImage(null);
        setModalOpen(true);
    };

    const handleSave = async () => {
        if (!form.name.trim() || !form.role.trim()) {
            toast.error('الاسم والدور مطلوبان');
            return;
        }
        setSaving(true);
        try {
            let finalImageUrl = form.image_url;
            if (selectedImage) {
                finalImageUrl = await uploadImage(selectedImage, "team_members");
            }

            if (editTarget) {
                const { error } = await supabase
                    .from('union_team_members')
                    .update({
                        name: form.name.trim(),
                        role: form.role.trim(),
                        description: form.description.trim(),
                        image_url: finalImageUrl,
                        gender: form.gender,
                    })
                    .eq('id', editTarget.id);
                if (error) throw error;
                toast.success('تم تحديث العضو');
            } else {
                const { error } = await supabase
                    .from('union_team_members')
                    .insert({
                        name: form.name.trim(),
                        role: form.role.trim(),
                        description: form.description.trim(),
                        image_url: finalImageUrl,
                        gender: form.gender,
                    });
                if (error) throw error;
                toast.success('تم إضافة العضو');
            }
            setModalOpen(false);
            fetchMembers();
        } catch (err: any) {
            toast.error(err.message || 'حدث خطأ');
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = (m: TeamMember) => {
        setDeleteTarget(m);
        setDeleteModalOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(deleteTarget.id);
        const { error } = await supabase
            .from('union_team_members')
            .delete()
            .eq('id', deleteTarget.id);
        if (error) {
            toast.error('فشل في الحذف');
        } else {
            toast.success('تم حذف العضو');
            fetchMembers();
        }
        setDeleting(null);
        setDeleteModalOpen(false);
        setDeleteTarget(null);
    };

    return (
        <div className="space-y-6" dir="rtl">

            {/* Page header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h2 className="m-0 text-xl font-extrabold text-[#111]">إدارة فريق الاتحاد</h2>
                    <p className="m-0 mt-0.5 text-[#9ca3af] text-[13px]">
                        {members.length} أعضاء · يظهر الترتيب عشوائياً للزوار
                    </p>
                </div>
                <button
                    onClick={openAdd}
                    className="px-5 py-2.5 rounded-xl border-none font-bold cursor-pointer text-sm text-white shadow-sm hover:opacity-90"
                    style={{ background: ACCENT }}
                >
                    + إضافة عضو
                </button>
            </div>

            {/* Members list */}
            {loading ? (
                <div className="flex justify-center py-16"><Spinner /></div>
            ) : members.length === 0 ? (
                <div className="text-center py-12 text-[#9ca3af]">
                    <div className="text-[40px] mb-2">👥</div>
                    <p>لا يوجد أعضاء بعد — ابدأ بإضافة أول عضو</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-[#f0f0f0] overflow-hidden">
                    {members.map((m, i) => (
                        <div
                            key={m.id}
                            className={`flex items-center gap-4 px-4 py-3 ${i !== members.length - 1 ? 'border-b border-[#f3f4f6]' : ''}`}
                        >
                            {/* Avatar */}
                            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-[#f0f0f0] bg-[#f9f9f9]">
                                <img
                                    src={m.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=random&color=fff&size=100`}
                                    alt={m.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-[#111] truncate text-[14px]">{m.name}</p>
                                <p className="text-[12px] truncate mt-0.5" style={{ color: ACCENT }}>{m.role}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    {m.description && (
                                        <p className="text-[11px] text-[#9ca3af] truncate">{m.description}</p>
                                    )}
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${m.gender === 'female'
                                        ? 'bg-pink-100 text-pink-700'
                                        : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {m.gender === 'female' ? 'أنثى' : 'ذكر'}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-1.5 flex-shrink-0">
                                <button
                                    onClick={() => openEdit(m)}
                                    className="w-7 h-7 rounded-lg border-none bg-[#f3f4f6] cursor-pointer text-[13px] flex items-center justify-center hover:bg-gray-200"
                                >
                                    ✏️
                                </button>
                                <button
                                    onClick={() => confirmDelete(m)}
                                    disabled={deleting === m.id}
                                    className="w-7 h-7 rounded-lg border-none bg-[#fee2e2] text-[#dc2626] cursor-pointer text-[13px] flex items-center justify-center hover:bg-red-200 disabled:opacity-50"
                                >
                                    {deleting === m.id ? <Spinner /> : '🗑'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add / Edit Modal */}
            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editTarget ? 'تعديل العضو' : 'إضافة عضو جديد'}
            >
                <div className="space-y-4">


                    {/* Name */}
                    <Inp
                        label="الاسم *"
                        value={form.name}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="اسم العضو"
                    />

                    {/* Gender toggle */}
                    <div>
                        <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">الجنس *</label>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setForm(f => ({ ...f, gender: 'male' }))}
                                className="flex-1 py-2 rounded-lg border text-sm font-medium transition-colors"
                                style={form.gender === 'male'
                                    ? { background: '#3b82f6', color: '#fff', borderColor: '#3b82f6' }
                                    : { background: '#fff', color: '#374151', borderColor: '#e5e7eb' }}
                            >
                                ذكر
                            </button>
                            <button
                                type="button"
                                onClick={() => setForm(f => ({ ...f, gender: 'female' }))}
                                className="flex-1 py-2 rounded-lg border text-sm font-medium transition-colors"
                                style={form.gender === 'female'
                                    ? { background: '#ec4899', color: '#fff', borderColor: '#ec4899' }
                                    : { background: '#fff', color: '#374151', borderColor: '#e5e7eb' }}
                            >
                                أنثى
                            </button>
                        </div>
                    </div>


                    {/* Role */}
                    <Inp
                        label="الدور / المنصب *"
                        value={form.role}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, role: e.target.value }))}
                        placeholder="مثال: عضو مجلس إدارة"
                    />

                    {/* Description */}
                    <Tex
                        label="وصف مختصر"
                        value={form.description}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm(f => ({ ...f, description: e.target.value }))}
                        placeholder="نبذة مختصرة عن العضو (اختياري)"
                        rows={3}
                    />

                    {/* Image upload */}
                    <div>
                        <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">صورة العضو</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                            className="w-full p-2 border border-[#e5e7eb] rounded-xl text-[14px] bg-white"
                        />
                        {form.image_url && !selectedImage && (
                            <div className="mt-2 flex items-center gap-2">
                                <img
                                    src={form.image_url}
                                    alt="preview"
                                    className="w-10 h-10 rounded-full object-cover border border-[#e5e7eb]"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                                <span className="text-xs text-[#6b7280]">الصورة الحالية</span>
                            </div>
                        )}
                    </div>

                    {/* Save button */}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full py-3 rounded-xl border-none font-bold cursor-pointer text-sm mt-2 text-white hover:opacity-90 disabled:opacity-60 transition-opacity"
                        style={{ background: ACCENT }}
                    >
                        {saving ? 'جاري الحفظ...' : editTarget ? 'حفظ التعديلات' : 'إضافة العضو'}
                    </button>
                </div>
            </Modal>

            {/* Delete Confirm Modal */}
            <Modal
                open={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                title="تأكيد الحذف"
            >
                <div className="space-y-4">
                    <p className="text-sm text-[#6b7280]">
                        هل أنت متأكد من حذف العضو{' '}
                        <strong className="text-[#111]">{deleteTarget?.name}</strong>؟
                        لا يمكن التراجع عن هذا الإجراء.
                    </p>
                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={() => setDeleteModalOpen(false)}
                            className="px-4 py-2 text-sm rounded-lg border border-[#e5e7eb] hover:bg-[#f9f9f9] transition-colors"
                        >
                            إلغاء
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={!!deleting}
                            className="px-4 py-2 text-sm rounded-lg bg-[#dc2626] text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                            {deleting ? <Spinner /> : 'نعم، احذف'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default TeamAdmin;