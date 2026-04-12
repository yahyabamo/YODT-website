import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Avatar, Spinner, Modal, Inp, Sel } from "./components/AdminUI";
import { CheckCircle2, Circle, Plus, Trash2, Edit2, ArrowRight, Award, MessageSquare, Users as UsersIcon } from "lucide-react";
import { PERMISSION_LABELS, PERMISSION_ICONS, Permission } from "@/hooks/useRoleGuard";

const B = "#8B1A2A";

interface Profile {
    id: string;
    full_name: string;
    avatar_url: string;
    job_title: string;
}

interface Mission {
    id: string;
    department: string;
    title: string;
    description: string;
    quarter: number;
    assigned_members: string[]; // array of profile ids. If empty, it's for everyone.
    is_completed: boolean;
    completed_by: string | null;
    completed_by_profile?: Profile; // hydrated joined data
    created_at: string;
}

interface Evaluation {
    id?: string;
    department: string;
    quarter: number;
    score: number;
}

interface Comment {
    id: string;
    content: string;
    created_at: string;
    profile: Profile;
}

export default function LeadershipDetail() {
    // We kept the route as /admin/leadership/:leaderId in App.tsx but it actually represents the department key
    const { leaderId: deptId } = useParams();
    const { profile, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [missions, setMissions] = useState<Mission[]>([]);
    const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
    const [deptMembers, setDeptMembers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeQuarter, setActiveQuarter] = useState<number>(1);

    // Modals
    const [missionModal, setMissionModal] = useState(false);
    const [evalModal, setEvalModal] = useState(false);
    const [commentModal, setCommentModal] = useState<Mission | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [membersModal, setMembersModal] = useState(false);

    // Forms
    const [missionForm, setMissionForm] = useState<Partial<Mission>>({ title: '', description: '', quarter: 1, assigned_members: [] });
    const [evalForm, setEvalForm] = useState<Partial<Evaluation>>({ score: 0 });
    const [commentText, setCommentText] = useState("");
    const [missionComments, setMissionComments] = useState<Comment[]>([]);
    const [loadingComments, setLoadingComments] = useState(false);

    const isAdmin = profile?.role === 'admin';
    const departmentName = PERMISSION_LABELS[deptId as Permission] || deptId;
    const departmentIcon = PERMISSION_ICONS[deptId as Permission] || "📁";

    useEffect(() => {
        if (authLoading) return;
        if (!deptId || !profile) return;

        // Security check: restrict staff access to only their departments (unless unrestricted)
        if (profile.role === 'staff') {
            const perms = profile.permissions as string[] || [];
            if (perms.length > 0 && !perms.includes(deptId)) {
                toast.error("لا تملك الصلاحية لدخول هذا القسم.");
                navigate('/admin/leadership', { replace: true });
                return;
            }
        }

        fetchData();
    }, [deptId, profile, authLoading]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Department Members (Staff who have this perm OR empty perms)
            const { data: membersData, error: memErr } = await supabase
                .from('profiles')
                .select('id, full_name, avatar_url, job_title, permissions')
                .eq('role', 'staff');

            if (memErr) throw memErr;

            // Filter locally because Supabase JSON array filtering can be tricky
            const filteredMembers = (membersData || []).filter(mem => {
                const p = mem.permissions as string[] || [];
                return p.length === 0 || p.includes(deptId as string);
            });
            setDeptMembers(filteredMembers);

            // 2. Fetch Missions
            const { data: missionsData, error: missErr } = await supabase
                .from('department_missions')
                .select(`
                    *,
                    completed_by_profile:profiles!completed_by (id, full_name, avatar_url, job_title)
                `)
                .eq('department', deptId)
                .order('created_at', { ascending: true });

            if (missErr) throw missErr;

            // Transform & enforce visibility
            let processedMissions = (missionsData as any[]).map(m => ({
                ...m,
                completed_by_profile: m.completed_by_profile ? m.completed_by_profile : undefined
            }));

            // If staff, only show missions assigned to whole dept OR assigned to them specifically
            if (profile?.role === 'staff') {
                processedMissions = processedMissions.filter(m =>
                    !m.assigned_members || m.assigned_members.length === 0 || m.assigned_members.includes(profile.id)
                );
            }
            setMissions(processedMissions);

            // 3. Fetch Evaluations
            const { data: evalsData, error: evalsErr } = await supabase
                .from('department_evaluations')
                .select('*')
                .eq('department', deptId);
            if (evalsErr) throw evalsErr;
            setEvaluations(evalsData || []);

        } catch (err: any) {
            console.error(err);
            toast.error("فشل تحميل البيانات. هل نسيت تنفيذ أوامر SQL؟");
        } finally {
            setLoading(false);
        }
    };

    // --- MISSION ACTIONS ---
    const toggleMissionStatus = async (mission: Mission) => {
        try {
            const newStatus = !mission.is_completed;
            const completedBy = newStatus ? profile?.id : null;

            const { error } = await supabase
                .from('department_missions')
                .update({
                    is_completed: newStatus,
                    completed_by: completedBy
                })
                .eq('id', mission.id);
            if (error) throw error;

            // Optimistic update
            setMissions(prev => prev.map(m => {
                if (m.id === mission.id) {
                    return {
                        ...m,
                        is_completed: newStatus,
                        completed_by: completedBy,
                        completed_by_profile: newStatus ? {
                            id: profile!.id,
                            full_name: profile!.full_name,
                            avatar_url: profile!.avatar_url || '',
                            job_title: profile!.job_title || ''
                        } : undefined
                    };
                }
                return m;
            }));

            if (newStatus) toast.success("تم إنجاز المهمة بطل!");
        } catch (err) {
            toast.error("فشل تحديث حالة المهمة");
        }
    };

    const saveMission = async () => {
        if (!missionForm.title?.trim()) return toast.error("يرجى إدخال عنوان المهمة");

        setIsSaving(true);
        try {
            const payload = {
                department: deptId,
                title: missionForm.title.trim(),
                description: missionForm.description?.trim() || null,
                quarter: missionForm.quarter || activeQuarter,
                assigned_members: missionForm.assigned_members || []
            };

            if (missionForm.id) {
                const { error } = await supabase
                    .from('department_missions')
                    .update(payload)
                    .eq('id', missionForm.id);
                if (error) throw error;
                toast.success("تم تحديث المهمة");
            } else {
                const { error } = await supabase
                    .from('department_missions')
                    .insert([payload]);
                if (error) throw error;
                toast.success("تم إضافة المهمة بنجاح");
            }
            setMissionModal(false);
            fetchData();
        } catch (err: any) {
            toast.error("حدث خطأ أثناء الحفظ");
        } finally {
            setIsSaving(false);
        }
    };

    const deleteMission = async (taskId: string) => {
        if (!window.confirm("حذف هذه المهمة نهائي؟")) return;
        try {
            const { error } = await supabase.from('department_missions').delete().eq('id', taskId);
            if (error) throw error;
            setMissions(prev => prev.filter(t => t.id !== taskId));
            toast.success("تم الحذف");
        } catch (error) {
            toast.error("فشل الحذف");
        }
    };

    const toggleMemberAssignment = (memberId: string) => {
        const current = missionForm.assigned_members || [];
        if (current.includes(memberId)) {
            setMissionForm({ ...missionForm, assigned_members: current.filter(id => id !== memberId) });
        } else {
            setMissionForm({ ...missionForm, assigned_members: [...current, memberId] });
        }
    };

    // --- COMMENTS ACTIONS ---
    const openComments = async (mission: Mission) => {
        setCommentModal(mission);
        setLoadingComments(true);
        try {
            const { data, error } = await supabase
                .from('mission_comments')
                .select(`
                    id, content, created_at,
                    profile:profiles!user_id(id, full_name, avatar_url)
                `)
                .eq('mission_id', mission.id)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setMissionComments(data as any[]);
        } catch (e) {
            toast.error("فشل تحميل التعليقات");
        } finally {
            setLoadingComments(false);
        }
    };

    const sendComment = async () => {
        if (!commentText.trim() || !commentModal || !profile) return;
        setIsSaving(true);
        try {
            const { data, error } = await supabase
                .from('mission_comments')
                .insert([{
                    mission_id: commentModal.id,
                    user_id: profile.id,
                    content: commentText.trim()
                }])
                .select(`id, content, created_at, profile:profiles!user_id(id, full_name, avatar_url)`)
                .single();

            if (error) throw error;
            setMissionComments(prev => [...prev, data as any]);
            setCommentText("");
        } catch (e) {
            toast.error("فشل إرسال التعليق");
        } finally {
            setIsSaving(false);
        }
    };

    // --- EVALUATION ACTIONS ---
    const saveEvaluation = async () => {
        if (evalForm.score === undefined || evalForm.score < 0 || evalForm.score > 100) {
            return toast.error("أدخل درجة صحيحة (0 - 100)");
        }
        setIsSaving(true);
        try {
            const currentEval = evaluations.find(e => e.quarter === activeQuarter);
            if (currentEval) {
                const { error } = await supabase.from('department_evaluations').update({ score: evalForm.score, evaluator_id: profile?.id }).eq('id', currentEval.id);
                if (error) throw error;
            } else {
                const { error } = await supabase.from('department_evaluations').insert([{ department: deptId, quarter: activeQuarter, score: evalForm.score, evaluator_id: profile?.id }]);
                if (error) throw error;
            }
            toast.success("تم حفظ تقييم القسم");
            setEvalModal(false);
            fetchData();
        } catch (err) {
            toast.error("فشل حفظ التقييم");
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center py-12"><Spinner /></div>;

    // Derived States
    const activeMissions = missions.filter(m => m.quarter === activeQuarter);
    const completedCount = activeMissions.filter(m => m.is_completed).length;
    const totalCount = activeMissions.length;
    const completionRate = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
    const activeEvaluation = evaluations.find(e => e.quarter === activeQuarter)?.score;

    return (
        <div className="space-y-6 animate-in fade-in duration-300" dir="rtl">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
                <div className="flex items-center gap-4">
                    {isAdmin && (
                        <button onClick={() => navigate('/admin/leadership')} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center bg-white hover:bg-gray-50 text-gray-600 transition-colors">
                            <ArrowRight size={20} />
                        </button>
                    )}
                    <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center text-3xl">
                            {departmentIcon}
                        </div>
                        <div>
                            <h2 className="m-0 text-2xl font-extrabold text-[#111]">{departmentName}</h2>
                            <p className="m-0 text-sm font-medium text-gray-500">
                                {deptMembers.length} أعضاء في القسم
                            </p>
                        </div>
                    </div>
                </div>

                {/* Micro Roster / Members Button */}
                <button
                    onClick={() => setMembersModal(true)}
                    className="flex items-center gap-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-full py-1.5 px-2 pr-4 transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8B1A2A]/20"
                >
                    <div className="flex -space-x-2 space-x-reverse">
                        {deptMembers.slice(0, 4).map(m => (
                            <div key={m.id} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 shadow-sm" title={m.full_name}>
                                <img src={m.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.full_name)}&background=random&color=fff`} alt={m.full_name} className="w-full h-full rounded-full object-cover" />
                            </div>
                        ))}
                        {deptMembers.length > 4 && (
                            <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600 shadow-sm">
                                +{deptMembers.length - 4}
                            </div>
                        )}
                    </div>
                    <span className="text-xs font-bold text-gray-700">عرض الأعضاء</span>
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                    <p className="text-[12px] text-gray-500 font-bold mb-1">مهام منجزة</p>
                    <p className="text-2xl font-black text-green-600">{completedCount}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                    <p className="text-[12px] text-gray-500 font-bold mb-1">قيد التنفيذ</p>
                    <p className="text-2xl font-black text-red-500">{totalCount - completedCount}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute left-0 bottom-0 top-0 opacity-10 bg-blue-500 transition-all duration-1000" style={{ width: `${completionRate}%` }}></div>
                    <p className="text-[12px] text-gray-500 font-bold mb-1 relative z-10">إنجاز القسم</p>
                    <p className="text-2xl font-black text-blue-600 relative z-10">{completionRate}%</p>
                </div>
                <div className="bg-[#fffdf7] p-4 rounded-2xl border border-yellow-200 shadow-sm flex flex-col justify-center transition-all hover:bg-yellow-50">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[12px] text-yellow-600 font-bold mb-1">تقييم الربع ({activeQuarter})</p>
                            <p className="text-2xl font-black text-yellow-500">
                                {activeEvaluation !== undefined ? `${activeEvaluation}%` : '---'}
                            </p>
                        </div>
                        {isAdmin && (
                            <button onClick={() => { setEvalForm({ score: activeEvaluation || 0 }); setEvalModal(true); }} className="w-8 h-8 rounded-lg bg-yellow-100 text-yellow-700 flex items-center justify-center hover:bg-yellow-200 transition-colors">
                                <Award size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Quarters Navigator */}
            <div className="flex gap-2 bg-gray-100 p-1 rounded-xl overflow-x-auto scrollbar-hide">
                {[1, 2, 3, 4].map(q => (
                    <button key={q} onClick={() => setActiveQuarter(q)}
                        className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${activeQuarter === q ? 'bg-white text-[#8B1A2A] shadow-sm' : 'text-gray-500 hover:text-gray-900'
                            }`}
                    >
                        الربع {q}
                    </button>
                ))}
            </div>

            {/* Missions List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h3 className="font-bold text-gray-800">سجل المهام</h3>
                    {isAdmin && (
                        <button onClick={() => { setMissionForm({ title: '', description: '', quarter: activeQuarter, assigned_members: [] }); setMissionModal(true); }}
                            className="text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 hover:opacity-90 transition-opacity" style={{ background: B }}>
                            <Plus size={16} /> إسناد مهمة
                        </button>
                    )}
                </div>

                <div className="p-2">
                    {activeMissions.length === 0 ? (
                        <div className="text-center py-16 text-gray-400 flex flex-col items-center">
                            <CheckCircle2 size={48} className="mb-3 opacity-20" />
                            <p className="font-bold">القسم لا يمتلك مهام حالياً</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {activeMissions.map(m => (
                                <div key={m.id} className={`group flex flex-col sm:flex-row sm:items-center gap-3 p-3 lg:p-4 rounded-xl transition-all border border-transparent ${m.is_completed ? 'bg-green-50/30' : 'hover:bg-gray-50 border-b-gray-50'}`}>

                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <button onClick={() => toggleMissionStatus(m)} className={`mt-0.5 flex-shrink-0 flex items-center justify-center transition-colors cursor-pointer rounded-full focus:outline-none ${m.is_completed ? 'text-green-500 hover:text-green-600' : 'text-gray-300 hover:text-gray-500'}`}>
                                            {m.is_completed ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                                        </button>

                                        <div className="flex-1 min-w-0">
                                            <p className={`font-bold text-sm ${m.is_completed ? 'text-gray-500 line-through' : 'text-gray-900'} truncate`}>
                                                {m.title}
                                            </p>
                                            {m.description && <p className="text-[12px] text-gray-500 mt-0.5 max-w-2xl truncate">{m.description}</p>}

                                            {/* Mission Meta Tags */}
                                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                {/* Assignment Tag */}
                                                {m.assigned_members && m.assigned_members.length > 0 ? (
                                                    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md text-[10px] font-bold">
                                                        <UsersIcon size={10} /> مخصصة ({m.assigned_members.length})
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md text-[10px] font-bold">
                                                        <UsersIcon size={10} /> عامة للقسم
                                                    </span>
                                                )}

                                                {/* Completed Tag - Only visible to Admins to avoid clutter according to requested rules */}
                                                {(isAdmin && m.is_completed && m.completed_by_profile) && (
                                                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-md text-[10px] font-bold">
                                                        ✔ {m.completed_by_profile.full_name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0 mt-3 sm:mt-0">
                                        <button onClick={() => openComments(m)} className="h-8 px-3 rounded-lg bg-gray-100 text-gray-600 flex items-center gap-1.5 hover:bg-gray-200 transition-colors text-xs font-bold">
                                            <MessageSquare size={14} /> تواصل
                                        </button>

                                        {/* Admin specific tools */}
                                        {isAdmin && (
                                            <>
                                                <button onClick={() => { setMissionForm(m); setMissionModal(true); }} className="w-8 h-8 rounded-lg text-gray-400 flex items-center justify-center hover:bg-gray-100 hover:text-gray-900 transition-colors">
                                                    <Edit2 size={14} />
                                                </button>
                                                <button onClick={() => deleteMission(m.id)} className="w-8 h-8 rounded-lg text-red-300 flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-colors">
                                                    <Trash2 size={14} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Mission Assignment Modal */}
            <Modal open={missionModal} onClose={() => setMissionModal(false)} title={missionForm.id ? "تعديل المهمة" : "إسناد مهمة للقسم"}>
                <div className="space-y-4">
                    <Inp label="عنوان المهمة *" placeholder="ما هو المطلوب؟" value={missionForm.title || ''} onChange={(e: any) => setMissionForm(f => ({ ...f, title: e.target.value }))} />
                    <div>
                        <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">وصف تفصيلي (اختياري)</label>
                        <textarea
                            className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-[#8B1A2A]"
                            rows={3}
                            placeholder="تفاصيل إضافية..."
                            value={missionForm.description || ''}
                            onChange={(e) => setMissionForm(f => ({ ...f, description: e.target.value }))}
                        />
                    </div>

                    {/* Member Selection */}
                    <div>
                        <p className="text-[13px] font-semibold text-gray-700 mb-2">تخصيص لأعضاء محددين؟ (اختياري)</p>
                        <p className="text-[11px] text-gray-500 mb-3">إذا تركتها فارغة، ستكون المهمة مرئية لجميع أعضاء القسم ويمكن لأي شخص إنجازها.</p>
                        <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-xl p-2 space-y-1 bg-gray-50">
                            {deptMembers.map(m => {
                                const isAssigned = (missionForm.assigned_members || []).includes(m.id);
                                return (
                                    <div key={m.id} onClick={() => toggleMemberAssignment(m.id)} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors border ${isAssigned ? 'bg-blue-50 border-blue-200' : 'bg-white border-transparent hover:border-gray-200'}`}>
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center text-white ${isAssigned ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
                                            {isAssigned && <CheckCircle2 size={12} />}
                                        </div>
                                        <Avatar name={m.full_name} src={m.avatar_url} size={24} />
                                        <span className="text-xs font-bold text-gray-700">{m.full_name}</span>
                                    </div>
                                )
                            })}
                            {deptMembers.length === 0 && <p className="text-xs text-center text-gray-500 py-4">القسم فارغ من الأعضاء حالياً</p>}
                        </div>
                    </div>

                    <button onClick={saveMission} disabled={isSaving} className="w-full py-3 rounded-xl border-none font-bold text-sm text-white hover:opacity-90 transition-opacity mt-2" style={{ background: B }}>
                        {isSaving ? <Spinner /> : "تأكيد وإسناد"}
                    </button>
                </div>
            </Modal>

            {/* Comments Modal */}
            <Modal open={!!commentModal} onClose={() => setCommentModal(null)} title="تواصل المهمة والملاحظات">
                <div className="flex flex-col h-[60vh] max-h-[500px]">
                    <div className="flex-1 overflow-y-auto space-y-3 p-2 bg-gray-50/50 rounded-xl border border-gray-100 mb-3">
                        {loadingComments ? (
                            <div className="flex justify-center py-10"><Spinner /></div>
                        ) : missionComments.length === 0 ? (
                            <div className="text-center py-10 text-gray-400 text-xs">لا توجد تعليقات بعد. اكتب للترحيب!</div>
                        ) : (
                            missionComments.map(c => {
                                const isMe = c.profile.id === profile?.id;
                                return (
                                    <div key={c.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
                                        <Avatar name={c.profile.full_name} src={c.profile.avatar_url} size={28} />
                                        <div className={`max-w-[80%] rounded-xl p-3 text-sm ${isMe ? 'bg-[#8B1A2A] text-white rounded-tr-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
                                            <p className={`text-[10px] mb-1 font-bold ${isMe ? 'text-white/70' : 'text-gray-500'}`}>{c.profile.full_name}</p>
                                            <p style={{ whiteSpace: 'pre-wrap' }}>{c.content}</p>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="أضف تعليق أو ملاحظة للإدارة..."
                            className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#8B1A2A]"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && sendComment()}
                        />
                        <button onClick={sendComment} disabled={!commentText.trim() || isSaving} className="w-10 h-10 flex items-center justify-center bg-[#8B1A2A] text-white rounded-xl hover:opacity-90 disabled:opacity-50">
                            {isSaving ? <Spinner /> : '➤'}
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Evaluation Modal */}
            <Modal open={evalModal} onClose={() => setEvalModal(false)} title={`تقييم الربع (${activeQuarter})`}>
                <div className="space-y-4">
                    <div className="bg-yellow-50 text-yellow-800 p-3 rounded-xl text-xs font-bold border border-yellow-100">
                        قيّم الأداء الجماعي للقسم في هذا الربع بناءً على إنجاز المهام.
                    </div>
                    <input
                        type="number" min="0" max="100"
                        className="w-full p-3 border border-gray-200 rounded-xl text-center text-2xl font-black text-gray-900"
                        value={evalForm.score} onChange={(e) => setEvalForm({ score: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                    />
                    <button onClick={saveEvaluation} disabled={isSaving} className="w-full py-3 rounded-xl border-none font-bold text-sm bg-yellow-500 text-white hover:bg-yellow-600 transition-colors">
                        {isSaving ? <Spinner /> : "اعتماد التقييم"}
                    </button>
                </div>
            </Modal>
            {/* Members Directory Modal */}
            <Modal open={membersModal} onClose={() => setMembersModal(false)} title="أعضاء القسم">
                <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                    {deptMembers.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-sm">لا يوجد أعضاء مسجلين في هذا القسم</div>
                    ) : (
                        deptMembers.map(m => (
                            <div key={m.id} className="group flex items-center gap-4 p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-[#8B1A2A]/30 hover:shadow-sm transition-all duration-200">
                                <div className="w-12 h-12 rounded-full border border-gray-200 overflow-hidden shrink-0 bg-white group-hover:border-[#8B1A2A]/20 transition-colors">
                                    <img src={m.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.full_name)}&background=random&color=fff`} alt={m.full_name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-900 text-sm truncate">{m.full_name}</h4>
                                    <p className="text-xs text-gray-500 truncate mt-0.5">{m.job_title || 'عضو قسم'}</p>
                                </div>
                                <div className="shrink-0">
                                    <span className="inline-flex items-center bg-white border border-gray-100 text-gray-600 text-[10px] px-2.5 py-1 rounded-lg font-bold shadow-sm group-hover:text-[#8B1A2A] transition-colors">
                                        {m.job_title || 'موظف'}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Modal>
        </div>
    );
}
