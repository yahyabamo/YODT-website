import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Spinner, Inp, Tex, Modal } from "./components/AdminUI";
import { useOutletContext } from "react-router-dom";

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
    team_type: 'current' | 'founding' | 'external';
    created_at?: string;
}

interface Project {
    id: string;
    name: string;
    description: string;
}

// ─── Shared Tab Button ────────────────────────────────────────────────────────
const TabBtn = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button onClick={onClick}
        className="px-4 py-2 rounded-xl text-sm font-bold transition-colors border"
        style={active
            ? { background: ACCENT, color: '#fff', borderColor: ACCENT }
            : { background: '#f9f9f9', color: '#374151', borderColor: '#e5e7eb' }}>
        {children}
    </button>
);

// ─── Members Tab (reused for both current & founding) ─────────────────────────
const MembersTab = ({ teamType }: { teamType: 'current' | 'founding' | 'external' }) => {
    // Explicitly define the type so gender isn't locked to 'male'
    const EMPTY: Omit<TeamMember, 'id' | 'created_at'> = {
        name: '',
        role: '',
        description: '',
        image_url: '',
        gender: 'male',
        team_type: teamType
    };
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<TeamMember | null>(null);
    const [form, setForm] = useState({ ...EMPTY });
    const [deleteTarget, setDeleteTarget] = useState<TeamMember | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const fetchMembers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('union_team_members')
            .select('*')
            .eq('team_type', teamType)
            .order('created_at', { ascending: true });
        if (error) toast.error('فشل في تحميل الأعضاء');
        else setMembers(data || []);
        setLoading(false);
    };

    useEffect(() => { fetchMembers(); }, [teamType]);

    const openAdd = () => {
        setEditTarget(null);
        setForm({ ...EMPTY, team_type: teamType });
        setSelectedImage(null);
        setModalOpen(true);
    };

    const openEdit = (m: TeamMember) => {
        setEditTarget(m);
        setForm({ name: m.name, role: m.role, description: m.description, image_url: m.image_url, gender: m.gender, team_type: m.team_type });
        setSelectedImage(null);
        setModalOpen(true);
    };

    const handleSave = async () => {
        if (!form.name.trim() || !form.role.trim()) { toast.error('الاسم والدور مطلوبان'); return; }
        setSaving(true);
        try {
            let finalImageUrl = form.image_url;
            if (selectedImage) finalImageUrl = await uploadImage(selectedImage, "team_members");
            const payload = { name: form.name.trim(), role: form.role.trim(), description: form.description.trim(), image_url: finalImageUrl, gender: form.gender, team_type: teamType };
            if (editTarget) {
                const { error } = await supabase.from('union_team_members').update(payload).eq('id', editTarget.id);
                if (error) throw error;
                toast.success('تم تحديث العضو');
            } else {
                const { error } = await supabase.from('union_team_members').insert(payload);
                if (error) throw error;
                toast.success('تم إضافة العضو');
            }
            setModalOpen(false);
            fetchMembers();
        } catch (err: any) { toast.error(err.message || 'حدث خطأ'); }
        finally { setSaving(false); }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(deleteTarget.id);
        const { error } = await supabase.from('union_team_members').delete().eq('id', deleteTarget.id);
        if (error) toast.error('فشل في الحذف');
        else { toast.success('تم حذف العضو'); fetchMembers(); }
        setDeleting(null); setDeleteModalOpen(false); setDeleteTarget(null);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <p className="text-[13px] text-[#9ca3af]">{members.length} أعضاء</p>
                <button onClick={openAdd} className="px-5 py-2.5 rounded-xl border-none font-bold cursor-pointer text-sm text-white shadow-sm hover:opacity-90" style={{ background: ACCENT }}>
                    + إضافة عضو
                </button>
            </div>

            {loading ? <div className="flex justify-center py-12"><Spinner /></div>
                : members.length === 0 ? (
                    <div className="text-center py-12 text-[#9ca3af]"><div className="text-[40px] mb-2">👥</div><p>لا يوجد أعضاء بعد</p></div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-[#f0f0f0] overflow-hidden">
                        {members.map((m, i) => (
                            <div key={m.id} className={`flex items-center gap-4 px-4 py-3 ${i !== members.length - 1 ? 'border-b border-[#f3f4f6]' : ''}`}>
                                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-[#f0f0f0] bg-[#f9f9f9]">
                                    <img src={m.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.name)}&background=random&color=fff&size=100`} alt={m.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-[#111] truncate text-[14px]">{m.name}</p>
                                    <p className="text-[12px] truncate mt-0.5" style={{ color: ACCENT }}>{m.role}</p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        {m.description && <p className="text-[11px] text-[#9ca3af] truncate">{m.description}</p>}
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${m.gender === 'female' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}`}>
                                            {m.gender === 'female' ? '♀ أنثى' : '♂ ذكر'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-1.5 flex-shrink-0">
                                    <button onClick={() => openEdit(m)} className="w-7 h-7 rounded-lg border-none bg-[#f3f4f6] cursor-pointer text-[13px] flex items-center justify-center hover:bg-gray-200">✏️</button>
                                    <button onClick={() => { setDeleteTarget(m); setDeleteModalOpen(true); }} disabled={deleting === m.id} className="w-7 h-7 rounded-lg border-none bg-[#fee2e2] text-[#dc2626] cursor-pointer text-[13px] flex items-center justify-center hover:bg-red-200 disabled:opacity-50">
                                        {deleting === m.id ? <Spinner /> : '🗑'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            {/* Add/Edit Modal */}
            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'تعديل العضو' : 'إضافة عضو جديد'}>
                <div className="space-y-4">
                    <Inp label="الاسم *" value={form.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="اسم العضو" />
                    <div>
                        <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">الجنس *</label>
                        <div className="flex gap-3">
                            <button type="button" onClick={() => setForm(f => ({ ...f, gender: 'male' }))} className="flex-1 py-2 rounded-lg border text-sm font-medium transition-colors"
                                style={form.gender === 'male' ? { background: '#3b82f6', color: '#fff', borderColor: '#3b82f6' } : { background: '#fff', color: '#374151', borderColor: '#e5e7eb' }}>ذكر</button>
                            <button type="button" onClick={() => setForm(f => ({ ...f, gender: 'female' }))} className="flex-1 py-2 rounded-lg border text-sm font-medium transition-colors"
                                style={form.gender === 'female' ? { background: '#ec4899', color: '#fff', borderColor: '#ec4899' } : { background: '#fff', color: '#374151', borderColor: '#e5e7eb' }}>أنثى</button>
                        </div>
                    </div>
                    <Inp label="الدور / المنصب *" value={form.role} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, role: e.target.value }))} placeholder="مثال: عضو مجلس إدارة" />
                    <Tex label="وصف مختصر" value={form.description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="نبذة مختصرة (اختياري)" rows={3} />
                    <div>
                        <label className="block text-[13px] font-semibold text-[#374151] mb-1.5">صورة العضو</label>
                        <input type="file" accept="image/*" onChange={(e) => setSelectedImage(e.target.files?.[0] || null)} className="w-full p-2 border border-[#e5e7eb] rounded-xl text-[14px] bg-white" />
                        {form.image_url && !selectedImage && (
                            <div className="mt-2 flex items-center gap-2">
                                <img src={form.image_url} alt="preview" className="w-10 h-10 rounded-full object-cover border border-[#e5e7eb]" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                <span className="text-xs text-[#6b7280]">الصورة الحالية</span>
                            </div>
                        )}
                    </div>
                    <button onClick={handleSave} disabled={saving} className="w-full py-3 rounded-xl border-none font-bold cursor-pointer text-sm text-white hover:opacity-90 disabled:opacity-60 transition-opacity" style={{ background: ACCENT }}>
                        {saving ? 'جاري الحفظ...' : editTarget ? 'حفظ التعديلات' : 'إضافة العضو'}
                    </button>
                </div>
            </Modal>

            {/* Delete Modal */}
            <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="تأكيد الحذف">
                <div className="space-y-4">
                    <p className="text-sm text-[#6b7280]">هل أنت متأكد من حذف العضو <strong className="text-[#111]">{deleteTarget?.name}</strong>؟</p>
                    <div className="flex gap-2 justify-end">
                        <button onClick={() => setDeleteModalOpen(false)} className="px-4 py-2 text-sm rounded-lg border border-[#e5e7eb] hover:bg-[#f9f9f9]">إلغاء</button>
                        <button onClick={handleDelete} disabled={!!deleting} className="px-4 py-2 text-sm rounded-lg bg-[#dc2626] text-white hover:bg-red-700 disabled:opacity-50">
                            {deleting ? <Spinner /> : 'نعم، احذف'}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

// ─── Projects Tab ─────────────────────────────────────────────────────────────
const ProjectsTab = () => {
    const EMPTY_PROJECT = { name: '', description: '' };

    const [projects, setProjects] = useState<Project[]>([]);
    const [allMembers, setAllMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Project | null>(null);
    const [form, setForm] = useState({ ...EMPTY_PROJECT });
    const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [assignModal, setAssignModal] = useState(false);
    const [assignProject, setAssignProject] = useState<Project | null>(null);
    const [assignedIds, setAssignedIds] = useState<string[]>([]);
    const [assignSaving, setAssignSaving] = useState(false);
    const [extFile, setExtFile] = useState<File | null>(null);
    const [extForm, setExtForm] = useState({ name: '', role: '', description: '' });
    const [isQuickAdding, setIsQuickAdding] = useState(false);

    const fetchAll = async () => {
        setLoading(true);
        const [{ data: proj }, { data: mem }] = await Promise.all([
            supabase.from('union_projects').select('*').order('created_at', { ascending: false }),
            supabase.from('union_team_members').select('id, name, role, description, image_url, gender, team_type').order('name'),
        ]);
        setProjects(proj || []);
        setAllMembers(mem || []);
        setLoading(false);
    };

    useEffect(() => { fetchAll(); }, []);

    const openAdd = () => { setEditTarget(null); setForm({ ...EMPTY_PROJECT }); setModalOpen(true); };
    const openEdit = (p: Project) => { setEditTarget(p); setForm({ name: p.name, description: p.description }); setModalOpen(true); };

    const handleSave = async () => {
        if (!form.name.trim()) { toast.error('اسم المشروع مطلوب'); return; }
        setSaving(true);
        try {
            const payload = { name: form.name.trim(), description: form.description.trim() };
            if (editTarget) {
                const { error } = await supabase.from('union_projects').update(payload).eq('id', editTarget.id);
                if (error) throw error;
                toast.success('تم تحديث المشروع');
            } else {
                const { error } = await supabase.from('union_projects').insert(payload);
                if (error) throw error;
                toast.success('تم إضافة المشروع');
            }
            setModalOpen(false); fetchAll();
        } catch (err: any) { toast.error(err.message || 'حدث خطأ'); }
        finally { setSaving(false); }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(deleteTarget.id);
        await supabase.from('union_project_members').delete().eq('project_id', deleteTarget.id);
        const { error } = await supabase.from('union_projects').delete().eq('id', deleteTarget.id);
        if (error) toast.error('فشل في الحذف');
        else { toast.success('تم حذف المشروع'); fetchAll(); }
        setDeleting(null); setDeleteModalOpen(false); setDeleteTarget(null);
    };

    const openAssign = async (p: Project) => {
        setAssignProject(p);
        const { data } = await supabase.from('union_project_members').select('member_id').eq('project_id', p.id);
        setAssignedIds(data?.map((r: any) => r.member_id) || []);
        setAssignModal(true);
    };

    const toggleMember = (id: string) => setAssignedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

    const saveAssignment = async () => {
        if (!assignProject) return;
        setAssignSaving(true);
        try {
            await supabase.from('union_project_members').delete().eq('project_id', assignProject.id);
            if (assignedIds.length > 0) {
                const { error } = await supabase.from('union_project_members').insert(assignedIds.map(member_id => ({ project_id: assignProject.id, member_id })));
                if (error) throw error;
            }
            toast.success('تم حفظ أعضاء المشروع');
            setAssignModal(false);
        } catch (err: any) { toast.error(err.message || 'حدث خطأ'); }
        finally { setAssignSaving(false); }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <p className="text-[13px] text-[#9ca3af]">{projects.length} مشاريع</p>
                <button onClick={openAdd} className="px-5 py-2.5 rounded-xl border-none font-bold cursor-pointer text-sm text-white shadow-sm hover:opacity-90" style={{ background: ACCENT }}>+ إضافة مشروع</button>
            </div>

            {loading ? <div className="flex justify-center py-12"><Spinner /></div>
                : projects.length === 0 ? (
                    <div className="text-center py-12 text-[#9ca3af]"><div className="text-[40px] mb-2">📁</div><p>لا توجد مشاريع بعد</p></div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-[#f0f0f0] overflow-hidden">
                        {projects.map((p, i) => (
                            <div key={p.id} className={`flex items-center gap-4 px-4 py-3 ${i !== projects.length - 1 ? 'border-b border-[#f3f4f6]' : ''}`}>
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl" style={{ background: '#fdf2f4' }}>📁</div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-[#111] truncate text-[14px]">{p.name}</p>
                                    {p.description && <p className="text-[12px] text-[#9ca3af] truncate">{p.description}</p>}
                                </div>
                                <div className="flex gap-1.5 flex-shrink-0">
                                    <button onClick={() => openAssign(p)} title="تعيين أعضاء" className="w-7 h-7 rounded-lg border-none cursor-pointer text-[13px] flex items-center justify-center hover:opacity-80" style={{ background: '#fdf2f4', color: ACCENT }}>👥</button>
                                    <button onClick={() => openEdit(p)} className="w-7 h-7 rounded-lg border-none bg-[#f3f4f6] cursor-pointer text-[13px] flex items-center justify-center hover:bg-gray-200">✏️</button>
                                    <button onClick={() => { setDeleteTarget(p); setDeleteModalOpen(true); }} disabled={deleting === p.id} className="w-7 h-7 rounded-lg border-none bg-[#fee2e2] text-[#dc2626] cursor-pointer text-[13px] flex items-center justify-center hover:bg-red-200 disabled:opacity-50">
                                        {deleting === p.id ? <Spinner /> : '🗑'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            {/* Add/Edit Project Modal */}
            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'تعديل المشروع' : 'إضافة مشروع جديد'}>
                <div className="space-y-4">
                    <Inp label="اسم المشروع *" value={form.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="اسم المشروع" />
                    <Tex label="وصف المشروع" value={form.description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm(f => ({ ...f, description: e.target.value }))} placeholder="وصف مختصر (اختياري)" rows={3} />
                    <button onClick={handleSave} disabled={saving} className="w-full py-3 rounded-xl border-none font-bold cursor-pointer text-sm text-white hover:opacity-90 disabled:opacity-60" style={{ background: ACCENT }}>
                        {saving ? 'جاري الحفظ...' : editTarget ? 'حفظ التعديلات' : 'إضافة المشروع'}
                    </button>
                </div>
            </Modal>

            {/* Delete Modal */}
            <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="تأكيد الحذف">
                <div className="space-y-4">
                    <p className="text-sm text-[#6b7280]">هل أنت متأكد من حذف مشروع <strong className="text-[#111]">{deleteTarget?.name}</strong>؟ سيتم حذف جميع أعضاء المشروع أيضاً.</p>
                    <div className="flex gap-2 justify-end">
                        <button onClick={() => setDeleteModalOpen(false)} className="px-4 py-2 text-sm rounded-lg border border-[#e5e7eb] hover:bg-[#f9f9f9]">إلغاء</button>
                        <button onClick={handleDelete} disabled={!!deleting} className="px-4 py-2 text-sm rounded-lg bg-[#dc2626] text-white hover:bg-red-700 disabled:opacity-50">
                            {deleting ? <Spinner /> : 'نعم، احذف'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Assign Members Modal */}
            {/* Updated Assign Members Modal */}
            <Modal open={assignModal} onClose={() => setAssignModal(false)} title={`أعضاء: ${assignProject?.name}`}>
                <div className="space-y-4">

                    {/* --- NEW: Quick Add External Member --- */}
                    {/* --- NEW: Quick Add External Member with Image & Description --- */}
                    <div className="p-4 bg-secondary/20 rounded-xl border border-dashed border-primary/30 space-y-3">
                        <p className="text-[11px] font-bold text-primary">إضافة عضو خارجي (متعاون) للمشروع:</p>

                        <div className="grid grid-cols-2 gap-2">
                            <input
                                placeholder="الاسم *"
                                value={extForm.name}
                                onChange={(e) => setExtForm({ ...extForm, name: e.target.value })}
                                className="p-2 text-xs border rounded-lg bg-background"
                            />
                            <input
                                placeholder="الدور *"
                                value={extForm.role}
                                onChange={(e) => setExtForm({ ...extForm, role: e.target.value })}
                                className="p-2 text-xs border rounded-lg bg-background"
                            />
                        </div>

                        <textarea
                            placeholder="وصف مختصر (اختياري)"
                            value={extForm.description}
                            onChange={(e) => setExtForm({ ...extForm, description: e.target.value })}
                            className="w-full p-2 text-xs border rounded-lg bg-background h-16 resize-none"
                        />

                        <div className="space-y-1">
                            <label className="text-[10px] text-muted-foreground block">صورة العضو (اختياري):</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setExtFile(e.target.files?.[0] || null)}
                                className="w-full text-[10px] file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-[10px] file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                            />
                        </div>

                        <button
                            type="button"
                            disabled={isQuickAdding}
                            onClick={async () => {
                                if (!extForm.name || !extForm.role) return toast.error("الاسم والدور مطلوبان");
                                setIsQuickAdding(true);
                                try {
                                    let imageUrl = "";
                                    // 1. Upload to Cloudinary if a file is selected
                                    if (extFile) {
                                        imageUrl = await uploadImage(extFile, "external_members");
                                    }

                                    // 2. Insert into union_team_members
                                    const { data, error } = await supabase
                                        .from('union_team_members')
                                        .insert([{
                                            name: extForm.name.trim(),
                                            role: extForm.role.trim(),
                                            description: extForm.description.trim(),
                                            image_url: imageUrl,
                                            team_type: 'external',
                                            gender: 'male'
                                        }])
                                        .select()
                                        .single();

                                    if (error) throw error;

                                    // 3. Update UI
                                    setAllMembers(prev => [...prev, data]);
                                    setAssignedIds(prev => [...prev, data.id]);
                                    setExtForm({ name: '', role: '', description: '' });
                                    setExtFile(null);
                                    toast.success("تمت إضافة العضو بنجاح");
                                } catch (err: any) {
                                    toast.error("حدث خطأ أثناء الإضافة");
                                } finally {
                                    setIsQuickAdding(false);
                                }
                            }}
                            className="w-full py-2 bg-primary text-white text-xs rounded-lg font-bold disabled:opacity-50"
                        >
                            {isQuickAdding ? <Spinner /> : '+ إضافة العضو للقائمة'}
                        </button>
                    </div>
                    {/* --- Existing: List of Members --- */}
                    <div className="max-h-60 overflow-y-auto space-y-2 border border-[#e5e7eb] rounded-xl p-2">
                        {allMembers.map(m => {
                            const checked = assignedIds.includes(m.id);
                            return (
                                <button key={m.id} onClick={() => toggleMember(m.id)}
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-right"
                                    style={{ background: checked ? '#fdf2f4' : '#f9f9f9' }}>
                                    <div className="w-4 h-4 rounded border-2 flex items-center justify-center"
                                        style={checked ? { background: ACCENT, borderColor: ACCENT } : { borderColor: '#d1d5db' }}>
                                        {checked && <span className="text-white text-[10px]">✓</span>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-[13px] text-[#111] truncate">{m.name}</p>
                                        <p className="text-[10px] text-[#9ca3af]">{m.role} {m.team_type === 'external' && '(خارجي)'}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <button onClick={saveAssignment} disabled={assignSaving} className="w-full py-3 rounded-xl bg-primary text-white font-bold">
                        {assignSaving ? 'جاري الحفظ...' : 'حفظ أعضاء المشروع'}
                    </button>
                </div>
            </Modal>
        </div>
    );
};

// ─── Main TeamAdmin ───────────────────────────────────────────────────────────
type AdminTab = 'current' | 'founding' | 'projects';

const TeamAdmin = () => {
    const [activeTab, setActiveTab] = useState<AdminTab>('current');

    return (
        <div className="space-y-5" dir="rtl">
            <div>
                <h2 className="m-0 text-xl font-extrabold text-[#111]">إدارة فريق الاتحاد</h2>
                <p className="m-0 mt-0.5 text-[#9ca3af] text-[13px]">إدارة الأعضاء والمشاريع</p>
            </div>

            {/* Tab switcher */}
            <div className="flex gap-2 flex-wrap">
                <TabBtn active={activeTab === 'current'} onClick={() => setActiveTab('current')}>✅ الفريق الحالي</TabBtn>
                <TabBtn active={activeTab === 'founding'} onClick={() => setActiveTab('founding')}>🏛 الفريق المؤسس</TabBtn>
                <TabBtn active={activeTab === 'projects'} onClick={() => setActiveTab('projects')}>📁 المشاريع</TabBtn>
            </div>

            {activeTab === 'current' && <MembersTab teamType="current" />}
            {activeTab === 'founding' && <MembersTab teamType="founding" />}
            {activeTab === 'projects' && <ProjectsTab />}
        </div>
    );
};

export default TeamAdmin;