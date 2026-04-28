import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { SmartTopBar } from '@/components/layout/SmartTopBar';
import { BottomNav } from '@/components/layout/BottomNav';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { ArrowRight } from 'lucide-react';


interface TrackPageState {
  track: any;
  userId: string | null;
  loading: boolean;
  currentPage: number;
  totalPages: number;
  bookmarkedPages: Set<number>;
  noteInput: string;
  savingNote: boolean;
  showAllNotes: boolean;
  showSearch: boolean;
  searchQuery: string;

  chatInput: string;
  sendingMsg: boolean;
}



// ─── Cloudinary upload ────────────────────────────────────────────────────────
async function uploadFile(file: File, folder: string): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", "activity_unsigned");
  fd.append("folder", folder);
  const res = await fetch("https://api.cloudinary.com/v1_1/dknz5c7d0/image/upload", { method: "POST", body: fd });
  const d = await res.json();
  if (!res.ok) throw new Error(d.error?.message || "فشل رفع الملف");
  return d.secure_url;
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface Job {
  id: string;
  title: string;
  description: string;
  company: string;
  location: string;
  type: "job" | "volunteer" | "internship" | "parttime";
  salary: string;
  apply_mode: "form" | "link";
  apply_link: string | null;
  deadline: string | null;
  is_active: boolean;
  created_at: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  job: { label: "وظيفة", icon: "💼", color: "#0ea5e9", bg: "#e0f2fe" },
  volunteer: { label: "تطوع", icon: "🤝", color: "#10b981", bg: "#d1fae5" },
  internship: { label: "تدريب", icon: "🎓", color: "#8b5cf6", bg: "#ede9fe" },
  parttime: { label: "دوام جزئي", icon: "⏰", color: "#f59e0b", bg: "#fef3c7" },
};

const COLLEGES = ["كلية الشريعة", "كلية الطب", "كلية الهندسة", "كلية العلوم", "كلية الآداب", "كلية التربية", "كلية الاقتصاد", "كلية الحاسوب", "أخرى"];
const YEARS = ["السنة الأولى", "السنة الثانية", "السنة الثالثة", "السنة الرابعة", "السنة الخامسة", "السنة السادسة", "دراسات عليا"];

function daysLeft(deadline: string | null) {
  if (!deadline) return null;
  const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
  return diff;
}

function fmtDeadline(deadline: string | null) {
  if (!deadline) return null;
  return new Date(deadline).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });
}

// ─── Apply Form Modal ─────────────────────────────────────────────────────────
function ApplyModal({ job, onClose }: { job: Job; onClose: () => void }) {
  const cfg = TYPE_CONFIG[job.type] || TYPE_CONFIG.job;
  const [form, setForm] = useState({ student_name: "", student_id_number: "", phone: "", email: "", college: "", academic_year: "", notes: "" });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cardFile, setCardFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [dragCv, setDragCv] = useState(false);
  const [dragCard, setDragCard] = useState(false);
  const cvRef = useRef<HTMLInputElement>(null);
  const cardRef = useRef<HTMLInputElement>(null);
  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const navigate = useNavigate();

  const [state, setState] = useState<TrackPageState>({
    track: null,
    userId: null,
    loading: true,
    currentPage: 1,
    totalPages: 0,
    bookmarkedPages: new Set(),
    noteInput: '',
    savingNote: false,
    showAllNotes: false,
    showSearch: false,
    searchQuery: '',
    chatInput: '',
    sendingMsg: false,
  });
  const updateState = useCallback((updates: Partial<TrackPageState>) => {
    setState((prev) => ({ ...prev, ...updates }));

  }, []);

  const [showSearch, setShowSearch] = useState(false);

  const submit = async () => {
    if (!form.student_name || !form.student_id_number || !form.phone) {
      toast.error("يرجى تعبئة الاسم ورقم الطالب والجوال"); return;
    }
    if (!cvFile) { toast.error("يرجى إرفاق السيرة الذاتية"); return; }
    if (!cardFile) { toast.error("يرجى إرفاق البطاقة الجامعية"); return; }
    setSubmitting(true);
    try {
      const [cv_url, student_card_url] = await Promise.all([
        uploadFile(cvFile, "cvs"),
        uploadFile(cardFile, "student_cards"),
      ]);
      const { error } = await supabase.from("job_applications").insert({
        job_id: job.id, ...form, cv_url, student_card_url, status: "pending",
      });
      if (error) throw error;
      setDone(true);
    } catch (err: any) { toast.error(err.message || "فشل إرسال الطلب"); }
    finally { setSubmitting(false); }
  };

  const inp: React.CSSProperties = {
    width: "100%", padding: "11px 14px", border: `1.5px solid #e5e7eb`,
    borderRadius: 12, fontSize: 14, background: "#fff",
    boxSizing: "border-box", fontFamily: "inherit", outline: "none",
    transition: "border-color .2s, box-shadow .2s",
  };

  const DropZone = ({
    file, setFile, dragOver, setDragOver, inputRef, accept, icon, label, sub,
  }: any) => (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) setFile(f); }}
      style={{
        border: `2px dashed ${dragOver ? cfg.color : file ? cfg.color : "#d1d5db"}`,
        borderRadius: 14, padding: "18px 12px", textAlign: "center", cursor: "pointer",
        background: dragOver ? `${cfg.color}0a` : file ? `${cfg.color}06` : "#fafafa",
        transition: "all .2s",
      }}
    >
      <input ref={inputRef} type="file" accept={accept} className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) setFile(f); }} />
      {file ? (
        <div>
          <div style={{ fontSize: 26, marginBottom: 4 }}>✅</div>
          <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: cfg.color }}>{file.name}</p>
          <p style={{ margin: "2px 0 0", fontSize: 11, color: "#9ca3af" }}>انقر للتغيير</p>
        </div>
      ) : (
        <div>
          <div style={{ fontSize: 28, marginBottom: 6 }}>{icon}</div>
          <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: "#374151" }}>{label}</p>
          <p style={{ margin: 0, fontSize: 11.5, color: "#9ca3af" }}>{sub}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-5"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)" }}
      onClick={e => { if (e.target === e.currentTarget && !submitting) onClose(); }}>
      <div className="w-full md:max-w-lg rounded-t-[32px] md:rounded-[28px] overflow-hidden shadow-2xl"
        style={{ background: "#fff", maxHeight: "94vh", overflowY: "auto", animation: "slideUp .35s cubic-bezier(.34,1.56,.64,1)" }}
        dir="rtl">

        {/* Header */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
          <div className="p-4 max-w-screen-xl mx-auto">
            <SmartTopBar onOpenSearch={() => updateState({ showSearch: true })} />

            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigate('/home')}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowRight className="h-5 w-5 text-slate-700" />
              </button>
              <h1 className="text-lg font-bold text-slate-900 flex-1 text-center px-4 line-clamp-1">
                {'الأنشطة'}
              </h1>

            </div>
          </div>
        </header>

        {done ? (
          // ── Success State ──
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center gap-4">
            <div style={{ fontSize: 64, animation: "pop .5s cubic-bezier(.34,1.56,.64,1)" }}>🎉</div>
            <h3 className="font-extrabold text-gray-900 text-xl m-0">تم إرسال طلبك بنجاح!</h3>
            <p className="text-gray-500 text-sm leading-relaxed m-0">
              سيتم مراجعة طلبك من قِبل الفريق المختص والتواصل معك قريباً. حظاً موفقاً! 🌟
            </p>
            <button onClick={onClose}
              className="mt-4 px-8 py-3 rounded-2xl border-none font-bold text-white cursor-pointer text-sm"
              style={{ background: `linear-gradient(135deg,${cfg.color},${cfg.color}bb)` }}>
              إغلاق
            </button>
          </div>
        ) : (
          <div className="p-6 flex flex-col gap-4">

            {/* Info banner */}
            <div className="flex items-start gap-2.5 p-3 rounded-2xl"
              style={{ background: `${cfg.color}0d`, border: `1px solid ${cfg.color}25` }}>
              <span style={{ color: cfg.color, fontSize: 16, marginTop: 1 }}>💡</span>
              <p className="text-[12.5px] text-gray-600 m-0 leading-relaxed">
                يرجى رفع <strong>سيرتك الذاتية</strong> و<strong>بطاقتك الجامعية</strong>. سيتم مراجعة طلبك خلال 5–7 أيام عمل.
              </p>
            </div>

            {/* Personal */}
            <Divider icon="👤" label="المعلومات الشخصية" />
            <div className="grid grid-cols-1 gap-3">
              <FInp label="الاسم الكامل *" value={form.student_name} onChange={v => set("student_name", v)} placeholder="أدخل اسمك الكامل" color={cfg.color} inp={inp} />
              <div className="grid grid-cols-2 gap-3">
                <FInp label="رقم الطالب *" value={form.student_id_number} onChange={v => set("student_id_number", v)} placeholder="2023001" color={cfg.color} inp={inp} />
                <FInp label="رقم الجوال *" value={form.phone} onChange={v => set("phone", v)} placeholder="05xxxxxxxx" color={cfg.color} inp={inp} type="tel" />
              </div>
              <FInp label="البريد الإلكتروني" value={form.email} onChange={v => set("email", v)} placeholder="example@uni.edu.sa" color={cfg.color} inp={inp} type="email" />
            </div>

            {/* Academic */}
            <Divider icon="🎓" label="المعلومات الأكاديمية" />
            <div className="grid grid-cols-2 gap-3">
              <FSelect label="الكلية" value={form.college} onChange={v => set("college", v)} color={cfg.color} inp={inp}>
                <option value="">اختر الكلية</option>
                {COLLEGES.map(c => <option key={c} value={c}>{c}</option>)}
              </FSelect>
              <FSelect label="السنة الدراسية" value={form.academic_year} onChange={v => set("academic_year", v)} color={cfg.color} inp={inp}>
                <option value="">اختر السنة</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </FSelect>
            </div>

            {/* Files */}
            <Divider icon="📎" label="الملفات المطلوبة" />
            <div className="grid grid-cols-2 gap-3">
              <DropZone file={cvFile} setFile={setCvFile} dragOver={dragCv} setDragOver={setDragCv}
                inputRef={cvRef} accept=".pdf,.doc,.docx"
                icon="📄" label="السيرة الذاتية" sub="PDF أو Word" />
              <DropZone file={cardFile} setFile={setCardFile} dragOver={dragCard} setDragOver={setDragCard}
                inputRef={cardRef} accept="image/*,.pdf"
                icon="🪪" label="البطاقة الجامعية" sub="صورة أو PDF" />
            </div>

            {/* Notes */}
            <Divider icon="📝" label="ملاحظات إضافية" />
            <textarea value={form.notes} onChange={e => set("notes", e.target.value)}
              placeholder="أي معلومات إضافية تود إضافتها..."
              rows={3} style={{ ...inp, resize: "none", lineHeight: 1.7 }}
              onFocus={e => { e.target.style.borderColor = cfg.color; e.target.style.boxShadow = `0 0 0 3px ${cfg.color}15`; }}
              onBlur={e => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }} />

            {/* Submit */}
            <button onClick={submit} disabled={submitting}
              className="w-full py-4 rounded-2xl border-none font-extrabold text-white cursor-pointer text-[15px] transition-all disabled:opacity-60"
              style={{ background: `linear-gradient(135deg,${cfg.color},${cfg.color}bb)`, boxShadow: `0 6px 24px ${cfg.color}44`, letterSpacing: .5 }}>
              {submitting
                ? <span className="flex items-center justify-center gap-2">
                  <Spin /> جاري الإرسال...
                </span>
                : "إرسال الطلب ✓"}
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUp { from{opacity:0;transform:translateY(60px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pop     { from{transform:scale(0)} to{transform:scale(1)} }
      `}</style>
    </div>
  );
}

// ─── Job Detail Modal ─────────────────────────────────────────────────────────
function JobDetailModal({ job, onClose, onApply }: { job: Job; onClose: () => void; onApply: () => void }) {
  const cfg = TYPE_CONFIG[job.type] || TYPE_CONFIG.job;
  const days = daysLeft(job.deadline);

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-5"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(10px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="w-full md:max-w-lg rounded-t-[32px] md:rounded-[28px] overflow-hidden shadow-2xl"
        style={{ background: "#fff", maxHeight: "90vh", overflowY: "auto", animation: "slideUp .35s cubic-bezier(.34,1.56,.64,1)" }}
        dir="rtl">

        {/* Hero */}
        <div className="relative px-6 pt-6 pb-5 overflow-hidden"
          style={{ background: `linear-gradient(145deg,${cfg.color}18 0%,${cfg.color}06 100%)` }}>
          {/* Decorative circle */}
          <div style={{ position: "absolute", top: -40, left: -40, width: 160, height: 160, borderRadius: "50%", background: `${cfg.color}10`, pointerEvents: "none" }} />
          <div className="flex items-start justify-between gap-3 relative">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl shrink-0 shadow-sm"
                style={{ background: `${cfg.color}20`, border: `2px solid ${cfg.color}30` }}>
                {cfg.icon}
              </div>
              <div>
                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-3 py-1 rounded-full mb-2"
                  style={{ background: cfg.bg, color: cfg.color }}>{cfg.icon} {cfg.label}</span>
                <h2 className="font-extrabold text-gray-900 m-0 text-[18px] leading-snug">{job.title}</h2>
                <p className="text-gray-500 text-sm m-0 mt-0.5 font-semibold">{job.company}</p>
              </div>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-full border-none cursor-pointer flex items-center justify-center text-gray-400 shrink-0 hover:bg-gray-200 transition-colors"
              style={{ background: "#f3f4f6", fontSize: 18 }}>✕</button>
          </div>

          {/* Meta chips */}
          <div className="flex flex-wrap gap-2 mt-4">
            {job.location && <Chip icon="📍" text={job.location} />}
            {job.salary && <Chip icon="💵" text={job.salary} />}
            {job.deadline && (
              <Chip icon="⏳" text={`ينتهي ${fmtDeadline(job.deadline)}`}
                danger={days !== null && days <= 5} />
            )}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {job.description && (
            <div className="mb-5">
              <h4 className="text-[13px] font-extrabold text-gray-400 uppercase tracking-widest mb-2">تفاصيل الفرصة</h4>
              <p className="text-gray-700 text-[14.5px] leading-[1.9] m-0 whitespace-pre-wrap">{job.description}</p>
            </div>
          )}

          {/* Deadline warning */}
          {days !== null && days <= 7 && days > 0 && (
            <div className="flex items-center gap-2 p-3 rounded-2xl mb-4"
              style={{ background: days <= 3 ? "#fee2e2" : "#fef3c7", border: `1px solid ${days <= 3 ? "#fca5a5" : "#fde68a"}` }}>
              <span style={{ fontSize: 18 }}>{days <= 3 ? "🔴" : "🟡"}</span>
              <p className="text-sm font-bold m-0" style={{ color: days <= 3 ? "#dc2626" : "#d97706" }}>
                {days === 0 ? "ينتهي اليوم!" : `ينتهي التقديم خلال ${days} ${days === 1 ? "يوم" : "أيام"}`}
              </p>
            </div>
          )}
          {days !== null && days <= 0 && (
            <div className="flex items-center gap-2 p-3 rounded-2xl mb-4"
              style={{ background: "#fee2e2", border: "1px solid #fca5a5" }}>
              <span style={{ fontSize: 18 }}>🔴</span>
              <p className="text-sm font-bold m-0 text-red-600">انتهت مدة التقديم</p>
            </div>
          )}

          {/* CTA */}
          {(days === null || days > 0) && (
            job.apply_mode === "link" && job.apply_link ? (
              <a href={job.apply_link} target="_blank" rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-extrabold text-white text-[15px] no-underline transition-all hover:opacity-90"
                style={{ background: `linear-gradient(135deg,${cfg.color},${cfg.color}bb)`, boxShadow: `0 6px 24px ${cfg.color}44` }}>
                التقديم على الموقع الرسمي ↗
              </a>
            ) : (
              <button onClick={onApply}
                className="w-full py-4 rounded-2xl border-none font-extrabold text-white cursor-pointer text-[15px] transition-all hover:opacity-90"
                style={{ background: `linear-gradient(135deg,${cfg.color},${cfg.color}bb)`, boxShadow: `0 6px 24px ${cfg.color}44` }}>
                تقديم طلب التوظيف ←
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Job Card ─────────────────────────────────────────────────────────────────
function JobCard({ job, index, onClick }: { job: Job; index: number; onClick: () => void }) {
  const cfg = TYPE_CONFIG[job.type] || TYPE_CONFIG.job;
  const days = daysLeft(job.deadline);
  const urgent = days !== null && days <= 5 && days > 0;
  const expired = days !== null && days <= 0;

  return (
    <div onClick={onClick} className="relative rounded-3xl overflow-hidden cursor-pointer group"
      style={{
        background: "#fff",
        border: `1.5px solid ${urgent ? "#fde68a" : "#f0f0f0"}`,
        boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
        animation: `fadeUp .5s ease forwards`,
        animationDelay: `${index * 0.08}s`,
        opacity: 0, transform: "translateY(20px)",
        transition: "box-shadow .25s, transform .25s, border-color .25s",
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.boxShadow = `0 12px 40px rgba(0,0,0,0.12), 0 0 0 2px ${cfg.color}33`;
        el.style.transform = "translateY(-4px)";
        el.style.borderColor = `${cfg.color}44`;
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.boxShadow = "0 4px 20px rgba(0,0,0,0.05)";
        el.style.transform = "translateY(0)";
        el.style.borderColor = urgent ? "#fde68a" : "#f0f0f0";
      }}>

      {/* Top accent bar */}
      <div style={{ height: 4, background: `linear-gradient(90deg,${cfg.color},${cfg.color}66)` }} />

      {/* Expired overlay */}
      {expired && (
        <div className="absolute inset-0 flex items-center justify-center z-10 rounded-3xl"
          style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(2px)" }}>
          <span className="font-extrabold text-gray-400 text-lg">انتهت مدة التقديم</span>
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0"
            style={{ background: `${cfg.color}15`, border: `1.5px solid ${cfg.color}25` }}>
            {cfg.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-extrabold text-gray-900 m-0 text-[14.5px] leading-snug line-clamp-2 flex-1">
                {job.title}
              </h3>
              {urgent && !expired && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0"
                  style={{ background: "#fef3c7", color: "#d97706" }}>⚡ قارب الانتهاء</span>
              )}
            </div>
            <p className="text-gray-500 text-[12.5px] m-0 mt-0.5 font-semibold">{job.company}</p>
          </div>
        </div>

        {/* Type badge */}
        <div className="mb-3">
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-1 rounded-full"
            style={{ background: cfg.bg, color: cfg.color }}>
            {cfg.icon} {cfg.label}
          </span>
        </div>

        {/* Description preview */}
        {job.description && (
          <p className="text-gray-500 text-[13px] leading-[1.7] mb-3 line-clamp-2">{job.description}</p>
        )}

        {/* Meta row */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-gray-400 font-semibold mb-4">
          {job.location && <span>📍 {job.location}</span>}
          {job.salary && <span style={{ color: cfg.color }}>💵 {job.salary}</span>}
          {job.deadline && (
            <span style={{ color: urgent && !expired ? "#d97706" : undefined }}>
              ⏳ {urgent && !expired ? `${days} أيام متبقية` : fmtDeadline(job.deadline)}
            </span>
          )}
        </div>

        {/* CTA */}
        <button
          className="w-full py-2.5 rounded-2xl border-none font-extrabold text-white cursor-pointer text-[13px] transition-all group-hover:opacity-90"
          style={{ background: `linear-gradient(135deg,${cfg.color},${cfg.color}bb)` }}>
          {job.apply_mode === "link" ? "عرض والتقديم ↗" : "عرض التفاصيل والتقديم ←"}
        </button>
      </div>

      <style>{`
        @keyframes fadeUp { to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  );
}

// ─── Small helpers ────────────────────────────────────────────────────────────
const Chip = ({ icon, text, danger }: { icon: string; text: string; danger?: boolean }) => (
  <span className="inline-flex items-center gap-1 text-[12px] font-bold px-3 py-1 rounded-full"
    style={{ background: danger ? "#fee2e2" : "#f3f4f6", color: danger ? "#dc2626" : "#374151" }}>
    {icon} {text}
  </span>
);

const Divider = ({ icon, label }: { icon: string; label: string }) => (
  <div className="flex items-center gap-2">
    <span style={{ fontSize: 15 }}>{icon}</span>
    <span className="text-[12.5px] font-extrabold text-gray-600">{label}</span>
    <div style={{ flex: 1, height: 1, background: "#f0f0f0" }} />
  </div>
);

const FInp = ({ label, value, onChange, placeholder, color, inp, type = "text" }: any) => (
  <div>
    <label className="block text-[12px] font-bold text-gray-600 mb-1.5">{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={inp}
      onFocus={e => { e.target.style.borderColor = color; e.target.style.boxShadow = `0 0 0 3px ${color}15`; }}
      onBlur={e => { e.target.style.borderColor = "#e5e7eb"; e.target.style.boxShadow = "none"; }} />
  </div>
);

const FSelect = ({ label, value, onChange, color, inp, children }: any) => (
  <div>
    <label className="block text-[12px] font-bold text-gray-600 mb-1.5">{label}</label>
    <select value={value} onChange={e => onChange(e.target.value)} style={{ ...inp, cursor: "pointer" }}
      onFocus={e => (e.target.style.borderColor = color)}
      onBlur={e => (e.target.style.borderColor = "#e5e7eb")}>
      {children}
    </select>
  </div>
);

const Spin = () => (
  <span style={{ width: 16, height: 16, border: "2px solid #fff5", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin .7s linear infinite" }} />
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState<string>("all");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applyJob, setApplyJob] = useState<Job | null>(null);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const navigate = useNavigate();

  const [state, setState] = useState<TrackPageState>({
    track: null,
    userId: null,
    loading: true,
    currentPage: 1,
    totalPages: 0,
    bookmarkedPages: new Set(),
    noteInput: '',
    savingNote: false,
    showAllNotes: false,
    showSearch: false,
    searchQuery: '',
    chatInput: '',
    sendingMsg: false,
  });
  const updateState = useCallback((updates: Partial<TrackPageState>) => {
    setState((prev) => ({ ...prev, ...updates }));

  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from("jobs").select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false });
        if (error) throw error;
        setJobs(data || []);
      } catch { toast.error("فشل تحميل الفرص"); }
      finally { setLoading(false); }
    })();
  }, []);

  const filtered = jobs.filter(j => {
    const matchType = activeType === "all" || j.type === activeType;
    const q = search.toLowerCase();
    const matchSearch = !q || j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q) || (j.location || "").toLowerCase().includes(q);
    return matchType && matchSearch;
  });

  const counts = {
    all: jobs.length,
    job: jobs.filter(j => j.type === "job").length,
    volunteer: jobs.filter(j => j.type === "volunteer").length,
    internship: jobs.filter(j => j.type === "internship").length,
    parttime: jobs.filter(j => j.type === "parttime").length,
  };

  return (
    <div dir="rtl" className="min-h-screen bg-background transition-colors duration-300">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="p-4 max-w-screen-xl mx-auto">
          <SmartTopBar onOpenSearch={() => updateState({ showSearch: true })} />

          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/home')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowRight className="h-5 w-5 text-slate-700" />
            </button>
            <h1 className="text-lg font-bold text-slate-900 flex-1 text-center px-4 line-clamp-1">
              {'الوظائف'}
            </h1>

          </div>
        </div>
      </header>

      <AdSlot page="jobs" position="top" />

      {/* ── Hero ── */}
      <div className="relative overflow-hidden px-6 py-16 md:py-24 text-center
  bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-800
  dark:from-emerald-950 dark:via-[#052e1c] dark:to-[#0a3828]">

        {/* Grid texture */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M0 0h1v40H0zm39 0h1v40h-1zM0 0v1h40V0zm0 39v1h40v-1z'/%3E%3C/g%3E%3C/svg%3E")`,
          }} />

        {/* Glow blobs */}
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)" }} />
        <div className="absolute -bottom-24 -left-16 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(20,184,166,0.14) 0%, transparent 70%)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(16,185,129,0.08) 0%, transparent 65%)" }} />

        <div className="relative z-10 max-w-2xl mx-auto">

          {/* Decorative badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6
      bg-white/10 border border-white/20 backdrop-blur-sm
      text-emerald-300 text-[12px] font-bold tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            وظائف            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-black text-white mb-5 leading-tight"
            style={{ fontFamily: "'Cairo', sans-serif", textShadow: "0 2px 24px rgba(0,0,0,0.3)" }}>
            نحن هنا{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-emerald-300">لمساعدتك</span>
              {/* Underline squiggle */}
              <svg className="absolute -bottom-1.5 right-0 w-full" height="5" viewBox="0 0 160 5" preserveAspectRatio="none">
                <path d="M0 2.5 Q20 0,40 2.5 T80 2.5 T120 2.5 T160 2.5"
                  stroke="#6ee7b7" strokeWidth="2" fill="none" strokeOpacity="0.7" />
              </svg>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-emerald-100/80 text-[15px] md:text-base leading-relaxed max-w-lg mx-auto">
            تصفح الخدمات المتاحة وتقدم بطلبك بكل يسر وسهولة.
            نسعى دائماً لدعم مسيرتك الأكاديمية.
          </p>

          {/* Divider dots */}
          <div className="flex items-center justify-center gap-3 mt-7 opacity-40">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-emerald-400" />
            <div className="w-1 h-1 rounded-full bg-emerald-400" />
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-300" />
            <div className="w-1 h-1 rounded-full bg-emerald-400" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-emerald-400" />
          </div>

        </div>
      </div>

      {/* ── Filter Tabs ── */}
      <div className="flex justify-center gap-2 flex-wrap px-4 mb-8 relative" style={{ zIndex: 1 }}>
        {[
          { key: "all", label: "الكل", icon: "✨", count: counts.all },
          { key: "job", label: "وظائف", icon: "💼", count: counts.job },
          { key: "volunteer", label: "تطوع", icon: "🤝", count: counts.volunteer },
          { key: "internship", label: "تدريب", icon: "🎓", count: counts.internship },
          { key: "parttime", label: "دوام جزئي", icon: "⏰", count: counts.parttime },
        ].map(t => {
          const cfg = t.key !== "all" ? TYPE_CONFIG[t.key as keyof typeof TYPE_CONFIG] : null;
          const isActive = activeType === t.key;
          return (
            <button key={t.key} onClick={() => setActiveType(t.key)}
              style={{
                padding: "9px 20px", borderRadius: 99, fontFamily: "inherit",
                border: `2px solid ${isActive ? (cfg?.color || "#0ea5e9") : "#e5e7eb"}`,
                background: isActive ? (cfg?.color || "#0ea5e9") : "#fff",
                color: isActive ? "#fff" : "#374151",
                fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all .2s",
                display: "flex", alignItems: "center", gap: 6,
              }}>
              {t.icon} {t.label}
              <span style={{
                fontSize: 11, fontWeight: 800, padding: "1px 7px", borderRadius: 99,
                background: isActive ? "rgba(255,255,255,0.25)" : "#f3f4f6",
                color: isActive ? "#fff" : "#6b7280",
              }}>{t.count}</span>
            </button>
          );
        })}
      </div>

      {/* ── Cards Grid ── */}
      <div className="max-w-5xl mx-auto px-5 pb-20 relative" style={{ zIndex: 1 }}>
        {loading ? (
          <div className="flex flex-col items-center gap-4 py-24">
            <Spin />
            <p style={{ color: "#9ca3af", fontSize: 14 }}>جاري تحميل الفرص...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div style={{ fontSize: 56, marginBottom: 12 }}>🔍</div>
            <p style={{ color: "#6b7280", fontSize: 16, fontWeight: 700 }}>لا توجد نتائج</p>
            <p style={{ color: "#9ca3af", fontSize: 13 }}>جرب كلمة بحث مختلفة أو تصنيفاً آخر</p>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,300px),1fr))" }}>
            {filtered.map((job, i) => (
              <JobCard key={job.id} job={job} index={i} onClick={() => setSelectedJob(job)} />
            ))}
          </div>
        )}
      </div>

      <AdSlot page="jobs" position="bottom" className="mb-4" />
      <BottomNav />

      {/* Modals */}
      {selectedJob && (
        <JobDetailModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onApply={() => { setApplyJob(selectedJob); setSelectedJob(null); }}
        />
      )}
      {applyJob && (
        <ApplyModal job={applyJob} onClose={() => setApplyJob(null)} />
      )}

      <style>{`
        @keyframes fadeIn  { from{opacity:0}       to{opacity:1} }
        @keyframes fadeUp  { to{opacity:1;transform:translateY(0)} }
        @keyframes floatOrb{ from{transform:translateY(0) scale(1)} to{transform:translateY(-28px) scale(1.07)} }
        @keyframes spin    { to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}