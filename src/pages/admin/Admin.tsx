import React, { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchUsers, fetchActivities, fetchPartners, fetchOffers, fetchReels,
  fetchPointsHistory, fetchDashboardStats,
  upsertActivity, deleteActivity, recordAttendance,
  upsertPartner,
  upsertOffer,
  upsertReel, deleteReel,
  updateUserStatus, updateUserRole, updateUserPoints,
  fetchComments, deleteComment
} from "@/service/supabaseData";
import { useAuth } from "@/context/AuthContext";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { Html5QrcodeScanner, Html5QrcodeScanType, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { fetchActivityAttendees } from '@/service/supabaseData';

// ── Types ──────────────────────────────────────────────────────
interface User {
  id: string; full_name: string; email: string;
  role: "admin" | "user"; status: "active" | "inactive" | "banned";
  total_points: number; university: string; created_at: string;
}
interface Activity {
  id: string; title: string; description: string; event_date: string;
  status: "active" | "inactive" | "draft"; points_reward: number;
  location: string; max_attendees: number; image_url?: string;
  activity_registrations?: { count: number }[];
}
interface Partner {
  id: string; name: string; status: "active" | "inactive";
  website: string; offers_count: number;
}
interface Offer {
  id: string; title: string; partner_id?: string; partner_name: string;
  discount_percentage: number; status: "active" | "inactive"; expires_at: string;
  image_url?: string; description?: string;
}
interface Reel {
  id: string; title: string; description: string; video_url: string;
  status: "active" | "inactive"; allow_comments: boolean; views: number;
  thumbnail_url?: string;
  reel_likes?: { count: number }[];
  reel_comments?: { count: number }[];
}
interface PointHistory {
  id: string; user_name: string; change_amount: number;
  reason: string;
  reason_type: "activity" | "volunteer" | "achievement" | "deduction" | "manual";
  created_at: string;
}
interface DashStats {
  totalUsers: number; activeMembers: number; totalActivities: number;
  activeOffers: number; totalPoints: number;
  recentUsers: any[]; recentPoints: any[];
}

const B = "#8B1A2A";

// ── UI Primitives ──────────────────────────────────────────────
function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const cs = ["#8B1A2A", "#1a5276", "#145a32", "#6e2fa0", "#b7770d"];
  const c = cs[(name?.charCodeAt(0) || 0) % cs.length];
  const initials = name ? name.split(" ").slice(0, 2).map(w => w[0]).join("") : "؟";
  return <div style={{ width: size, height: size, borderRadius: "50%", background: c, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "bold", fontSize: size * 0.38, flexShrink: 0 }}>{initials}</div>;
}

function Badge({ children, type }: { children: React.ReactNode; type: string }) {
  const map: any = {
    active: { bg: "#d1fae5", c: "#059669" }, inactive: { bg: "#f3f4f6", c: "#6b7280" },
    banned: { bg: "#fee2e2", c: "#dc2626" }, draft: { bg: "#fef3c7", c: "#d97706" },
    admin: { bg: B, c: "#fff" }, user: { bg: "#dbeafe", c: "#2563eb" },
    activity: { bg: "#ede9fe", c: "#7c3aed" }, volunteer: { bg: "#cffafe", c: "#0891b2" },
    achievement: { bg: "#fef3c7", c: "#d97706" }, deduction: { bg: "#fee2e2", c: "#dc2626" },
    manual: { bg: "#f3f4f6", c: "#6b7280" },
  };
  const s = map[type] || map.manual;
  return <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, background: s.bg, color: s.c }}>{children}</span>;
}

function ConfirmModal({ open, title, message, onConfirm, onCancel, danger = false }:
  { open: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void; danger?: boolean }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 5000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.55)" }} onClick={onCancel} />
      <div style={{ position: "relative", background: "#fff", borderRadius: 20, boxShadow: "0 20px 60px rgba(0,0,0,.2)", width: "100%", maxWidth: 400, padding: 32, textAlign: "center" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: danger ? "#fee2e2" : "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 16px" }}>{danger ? "🗑️" : "⚠️"}</div>
        <h3 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700, color: "#111" }}>{title}</h3>
        <p style={{ margin: "0 0 24px", color: "#6b7280", fontSize: 14 }}>{message}</p>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={onCancel} style={{ flex: 1, padding: "10px 0", borderRadius: 12, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontWeight: 600, color: "#374151" }}>إلغاء</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: "10px 0", borderRadius: 12, border: "none", background: danger ? "#dc2626" : B, cursor: "pointer", fontWeight: 600, color: "#fff" }}>تأكيد</button>
        </div>
      </div>
    </div>
  );
}

function Modal({ open, title, onClose, children, wide = false }:
  { open: boolean; title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  if (!open) return null;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 4000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.5)" }} onClick={onClose} />
      <div style={{ position: "relative", background: "#fff", borderRadius: 20, boxShadow: "0 20px 60px rgba(0,0,0,.15)", width: "100%", maxWidth: wide ? 720 : 460, maxHeight: "88vh", overflowY: "auto", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px", borderBottom: "1px solid #f3f4f6", position: "sticky", top: 0, background: "#fff", borderRadius: "20px 20px 0 0", zIndex: 1 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#111" }}>{title}</h3>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "#f3f4f6", cursor: "pointer", fontSize: 16, color: "#6b7280" }}>✕</button>
        </div>
        <div style={{ padding: 24, flex: 1 }}>{children}</div>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 14px", border: "1px solid #e5e7eb", borderRadius: 12, fontSize: 14, background: "#fff", boxSizing: "border-box", fontFamily: "inherit" };
function Field({ label, children }: { label?: string; children: React.ReactNode }) {
  return <div style={{ marginBottom: 16 }}>{label && <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>{label}</label>}{children}</div>;
}
function Inp({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return <Field label={label}><input {...props} style={inputStyle} /></Field>;
}
function Sel({ label, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return <Field label={label}><select {...props} style={inputStyle}>{children}</select></Field>;
}
function Tex({ label, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return <Field label={label}><textarea {...props} rows={3} style={{ ...inputStyle, resize: "none" }} /></Field>;
}

function StatCard({ icon, label, value, sub, color = B, trend }:
  { icon: string; label: string; value: string | number; sub?: string; color?: string; trend?: number }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,.06)", border: "1px solid #f0f0f0" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, background: `${color}18` }}>{icon}</div>
        {trend != null && <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 8, background: trend > 0 ? "#d1fae5" : "#fee2e2", color: trend > 0 ? "#059669" : "#dc2626" }}>{trend > 0 ? "+" : ""}{trend}%</span>}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: "#111", marginBottom: 2 }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#6b7280" }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 48 }}>
      <div style={{ width: 32, height: 32, border: `3px solid ${B}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    </div>
  );
}

function fmtDate(d: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("ar", { year: "numeric", month: "short", day: "numeric" });
}

async function uploadImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('media')
    .upload(filePath, file);

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage
    .from('media')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

// ══════════════════════════════════════════════════════════════
// DASHBOARD PAGE
// ══════════════════════════════════════════════════════════════
function DashboardPage() {
  const [stats, setStats] = useState<DashStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats()
      .then(setStats)
      .catch(() => toast.error("فشل تحميل الإحصاءات"))
      .finally(() => setLoading(false));
  }, []);

  const monthlyUsers = [12, 18, 15, 22, 28, 19, 24, 30, 26, 21, 35, 28];
  const months = ["ي", "ف", "م", "أ", "م", "ج", "ج", "أ", "س", "أ", "ن", "د"];
  const max = Math.max(...monthlyUsers);

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#111" }}>مرحباً بك في لوحة الإدارة 👋</h2>
        <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: 14 }}>اتحاد الطلاب اليمنيين في تركيا – فرع إسطنبول</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 16, marginBottom: 24 }}>
        <StatCard icon="👥" label="إجمالي الأعضاء" value={stats?.totalUsers || 0} color={B} />
        <StatCard icon="✅" label="أعضاء نشطون" value={stats?.activeMembers || 0} sub={stats?.totalUsers ? `${Math.round((stats.activeMembers / stats.totalUsers) * 100)}% من الإجمالي` : ""} color="#059669" />
        <StatCard icon="🎯" label="الفعاليات" value={stats?.totalActivities || 0} color="#7c3aed" />
        <StatCard icon="🏷️" label="عروض نشطة" value={stats?.activeOffers || 0} color="#d97706" />
        <StatCard icon="⭐" label="إجمالي النقاط" value={(stats?.totalPoints || 0).toLocaleString()} color="#2563eb" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 16 }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,.06)", border: "1px solid #f0f0f0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>الأعضاء الجدد شهرياً</h3>
            <span style={{ fontSize: 11, color: "#9ca3af", background: "#f3f4f6", padding: "4px 10px", borderRadius: 8 }}>آخر 12 شهر</span>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
            {monthlyUsers.map((v, i) => (
              <div key={i} style={{ flex: 1, borderRadius: "4px 4px 0 0", background: B, opacity: .45 + (i / 12) * .55, height: `${(v / max) * 72}px` }} />
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            {months.map((m, i) => <span key={i} style={{ flex: 1, textAlign: "center", fontSize: 11, color: "#9ca3af" }}>{m}</span>)}
          </div>
        </div>
        <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,.06)", border: "1px solid #f0f0f0" }}>
          <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>آخر المسجلين</h3>
          {(stats?.recentUsers || []).map((u: any) => (
            <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0", borderBottom: "1px solid #f9fafb" }}>
              <Avatar name={u.full_name || u.email} size={32} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.full_name || "—"}</div>
                <div style={{ fontSize: 10, color: "#9ca3af" }}>{fmtDate(u.created_at)}</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: B }}>{u.total_points} ⭐</span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,.06)", border: "1px solid #f0f0f0" }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>آخر تغييرات النقاط</h3>
        {(stats?.recentPoints || []).length === 0
          ? <p style={{ color: "#9ca3af", fontSize: 13, textAlign: "center" }}>لا توجد سجلات بعد</p>
          : (stats?.recentPoints || []).map((p: any) => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid #f9fafb" }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 12, background: p.change_amount > 0 ? "#d1fae5" : "#fee2e2", color: p.change_amount > 0 ? "#059669" : "#dc2626", flexShrink: 0 }}>
                {p.change_amount > 0 ? "+" : ""}{p.change_amount}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>{p.profiles?.full_name || "—"}</div>
                <div style={{ fontSize: 11, color: "#9ca3af" }}>{p.reason}</div>
              </div>
              <span style={{ fontSize: 11, color: "#9ca3af" }}>{fmtDate(p.created_at)}</span>
            </div>
          ))
        }
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// USERS PAGE
// ══════════════════════════════════════════════════════════════
function UsersPage({ setConfirm }: { setConfirm: (v: any) => void }) {
  const { user: adminUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [pointsModal, setPointsModal] = useState<User | null>(null);
  const [pf, setPf] = useState({ amount: "", reason: "", type: "manual" });
  const debRef = useRef<any>();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, count } = await fetchUsers({ page, pageSize: 20, search });
      setUsers(data || []);
      setCount(count || 0);
    } catch { toast.error("فشل تحميل المستخدمين"); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (v: string) => {
    clearTimeout(debRef.current);
    debRef.current = setTimeout(() => { setSearch(v); setPage(0); }, 350);
  };

  const filtered = filter === "all" ? users : users.filter(u => u.status === filter);

  const handleStatus = (u: User, ns: "active" | "inactive" | "banned") => setConfirm({
    title: ns === "banned" ? "حظر المستخدم" : "تغيير الحالة",
    message: `هل تريد تغيير حالة ${u.full_name}؟`,
    danger: ns === "banned",
    onConfirm: async () => {
      try { await updateUserStatus(u.id, ns); toast.success("تم تحديث الحالة"); load(); }
      catch { toast.error("فشل تحديث الحالة"); }
    }
  });

  const handleRole = (u: User, nr: "admin" | "user") => setConfirm({
    title: "تغيير الصلاحية",
    message: `تغيير صلاحية ${u.full_name} إلى ${nr === "admin" ? "مدير" : "عضو"}؟`,
    danger: false,
    onConfirm: async () => {
      try { await updateUserRole(u.id, nr); toast.success("تم تحديث الصلاحية"); load(); }
      catch { toast.error("فشل تحديث الصلاحية"); }
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
        reasonType: pf.type,
        changedBy: adminUser.id,
      });
      toast.success(`تم ${amt > 0 ? "إضافة" : "خصم"} ${Math.abs(amt)} نقطة`);
      setPointsModal(null);
      setPf({ amount: "", reason: "", type: "manual" });
      load();
    } catch { toast.error("فشل تحديث النقاط"); }
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#111" }}>إدارة المستخدمين</h2>
          <p style={{ margin: "2px 0 0", color: "#9ca3af", fontSize: 13 }}>{count} عضو</p>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input onChange={e => handleSearch(e.target.value)} placeholder="🔍  بحث بالاسم أو البريد..." style={{ ...inputStyle, flex: 1, minWidth: 220 }} />
        {["all", "active", "inactive", "banned"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "8px 16px", borderRadius: 12, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13, background: filter === f ? B : "#fff", color: filter === f ? "#fff" : "#6b7280", boxShadow: "0 1px 3px rgba(0,0,0,.08)" }}>
            {f === "all" ? "الكل" : f === "active" ? "نشط" : f === "inactive" ? "غير نشط" : "محظور"}
          </button>
        ))}
      </div>
      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 1px 4px rgba(0,0,0,.06)", border: "1px solid #f0f0f0", overflow: "hidden" }}>
        {loading ? <Spinner /> : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead><tr style={{ borderBottom: "1px solid #f3f4f6", background: "#fafafa" }}>
                {["العضو", "الجامعة", "النقاط", "الحالة", "الدور", "الإجراءات"].map(h => (
                  <th key={h} style={{ textAlign: "right", padding: "12px 16px", fontWeight: 700, color: "#6b7280", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id} style={{ borderBottom: "1px solid #fafafa" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar name={u.full_name || u.email} size={36} />
                        <div>
                          <div style={{ fontWeight: 700, color: "#111" }}>{u.full_name || "—"}</div>
                          <div style={{ fontSize: 11, color: "#9ca3af" }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", color: "#6b7280" }}>{u.university || "—"}</td>
                    <td style={{ padding: "12px 16px" }}><span style={{ fontWeight: 800, color: B, fontSize: 15 }}>{(u.total_points || 0).toLocaleString()}</span></td>
                    <td style={{ padding: "12px 16px" }}><Badge type={u.status}>{u.status === "active" ? "نشط" : u.status === "inactive" ? "غير نشط" : "محظور"}</Badge></td>
                    <td style={{ padding: "12px 16px" }}><Badge type={u.role}>{u.role === "admin" ? "مدير" : "عضو"}</Badge></td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        {[
                          { icon: "⭐", bg: "#fef3c7", c: "#d97706", title: "إدارة النقاط", fn: () => setPointsModal(u) },
                          { icon: "🔑", bg: "#dbeafe", c: "#2563eb", title: "تغيير الدور", fn: () => handleRole(u, u.role === "admin" ? "user" : "admin") },
                          { icon: u.status === "active" ? "⏸" : "▶", bg: "#f3f4f6", c: "#6b7280", title: "تفعيل/تعطيل", fn: () => handleStatus(u, u.status === "active" ? "inactive" : "active") },
                          { icon: "🚫", bg: "#fee2e2", c: "#dc2626", title: "حظر", fn: () => handleStatus(u, "banned") },
                        ].map((btn, i) => (
                          <button key={i} title={btn.title} onClick={btn.fn} style={{ width: 30, height: 30, borderRadius: 8, border: "none", background: btn.bg, color: btn.c, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>{btn.icon}</button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!filtered.length && <div style={{ textAlign: "center", padding: "48px 0", color: "#9ca3af" }}><div style={{ fontSize: 40, marginBottom: 8 }}>🔍</div><p>لا توجد نتائج</p></div>}
          </div>
        )}
      </div>
      {/* Pagination */}
      {count > 20 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16 }}>
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{ padding: "8px 16px", borderRadius: 10, border: "none", background: page === 0 ? "#f3f4f6" : B, color: page === 0 ? "#9ca3af" : "#fff", cursor: page === 0 ? "default" : "pointer", fontWeight: 600 }}>السابق</button>
          <span style={{ padding: "8px 16px", fontSize: 13, color: "#6b7280" }}>صفحة {page + 1}</span>
          <button onClick={() => setPage(p => p + 1)} disabled={(page + 1) * 20 >= count} style={{ padding: "8px 16px", borderRadius: 10, border: "none", background: (page + 1) * 20 >= count ? "#f3f4f6" : B, color: (page + 1) * 20 >= count ? "#9ca3af" : "#fff", cursor: (page + 1) * 20 >= count ? "default" : "pointer", fontWeight: 600 }}>التالي</button>
        </div>
      )}
      {/* Points Modal */}
      <Modal open={!!pointsModal} title={`إدارة نقاط: ${pointsModal?.full_name || ""}`} onClose={() => { setPointsModal(null); setPf({ amount: "", reason: "", type: "manual" }); }}>
        {pointsModal && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, background: "#f8fafc", borderRadius: 14, padding: "14px 16px", marginBottom: 20 }}>
              <Avatar name={pointsModal.full_name} size={44} />
              <div>
                <div style={{ fontWeight: 700, color: "#111" }}>{pointsModal.full_name}</div>
                <div style={{ fontSize: 13, color: "#6b7280" }}>النقاط الحالية: <span style={{ fontWeight: 800, color: B }}>{pointsModal.total_points}</span></div>
              </div>
            </div>
            <Inp label="المبلغ (موجب = إضافة، سالب = خصم)" type="number" placeholder="مثال: 100 أو -50" value={pf.amount} onChange={e => setPf(p => ({ ...p, amount: e.target.value }))} />
            <Sel label="نوع التغيير" value={pf.type} onChange={e => setPf(p => ({ ...p, type: e.target.value }))}>
              <option value="manual">يدوي</option><option value="activity">فعالية</option>
              <option value="volunteer">تطوع</option><option value="achievement">إنجاز</option>
              <option value="deduction">خصم</option>
            </Sel>
            <Inp label="السبب *" placeholder="سبب تغيير النقاط..." value={pf.reason} onChange={e => setPf(p => ({ ...p, reason: e.target.value }))} />
            <button onClick={handlePoints} style={{ width: "100%", padding: "12px 0", borderRadius: 12, border: "none", background: B, color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
              {Number(pf.amount) > 0 ? "➕ إضافة نقاط" : "➖ خصم نقاط"}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ACTIVITIES PAGE
// ══════════════════════════════════════════════════════════════
function ActivitiesPage({ setConfirm }: { setConfirm: (v: any) => void }) {
  const [acts, setActs] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Activity | null>(null);
  const [form, setForm] = useState<Partial<Activity>>({ title: "", description: "", event_date: "", location: "", max_attendees: 0, points_reward: 0, status: "active", image_url: "" });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [attendanceModal, setAttendanceModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [loadingAttendees, setLoadingAttendees] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const { data } = await fetchActivities({ pageSize: 100 }); setActs(data || []); }
    catch { toast.error("فشل تحميل الفعاليات"); }
    finally { setLoading(false); }
  };

  const loadAttendees = async (activityId: string) => {
    setLoadingAttendees(true);
    try {
      const data = await fetchActivityAttendees(activityId);
      setAttendees(data);
    } catch (error) {
      toast.error('فشل تحميل قائمة الحضور');
    } finally {
      setLoadingAttendees(false);
    }
  };

  useEffect(() => { load(); }, []);


  const openNew = () => { setEditing(null); setForm({ title: "", description: "", event_date: "", location: "", max_attendees: 0, points_reward: 0, status: "active", image_url: "" }); setSelectedImage(null); setModal(true); };
  const openEdit = (a: Activity) => { setEditing(a); setForm({ ...a, event_date: a.event_date?.slice(0, 10) || "" }); setSelectedImage(null); setModal(true); };

  const save = async () => {
    if (!form.title) { toast.error("يرجى إدخال العنوان"); return; }
    setSaving(true);
    try {
      let finalImageUrl = form.image_url;
      if (selectedImage) {
        finalImageUrl = await uploadImage(selectedImage);
      }
      await upsertActivity(editing ? { ...form, id: editing.id, image_url: finalImageUrl } : { ...form, image_url: finalImageUrl });
      toast.success(editing ? "تم التحديث" : "تم الإنشاء");
      setModal(false);
      load();
    } catch { toast.error("فشل الحفظ"); }
    finally { setSaving(false); }
  };

  const del = (a: Activity) => setConfirm({
    title: "حذف الفعالية", message: `حذف "${a.title}"؟`, danger: true,
    onConfirm: async () => {
      try { await deleteActivity(a.id); toast.success("تم الحذف"); load(); }
      catch { toast.error("فشل الحذف"); }
    }
  });

  const toggle = async (a: Activity) => {
    const ns = a.status === "active" ? "inactive" : "active";
    try { await upsertActivity({ ...a, status: ns }); toast.success("تم التحديث"); load(); }
    catch { toast.error("فشل التحديث"); }
  };



  const sColor: any = { active: "#059669", inactive: "#9ca3af", draft: "#d97706" };
  const sLabel: any = { active: "نشط", inactive: "معطل", draft: "مسودة" };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div><h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#111" }}>إدارة الفعاليات</h2><p style={{ margin: "2px 0 0", color: "#9ca3af", fontSize: 13 }}>{acts.length} فعاليات</p></div>
        <button onClick={openNew} style={{ padding: "10px 20px", borderRadius: 12, border: "none", background: B, color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>+ إضافة فعالية</button>
      </div>
      {loading ? <Spinner /> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
          {acts.map(a => (
            <div key={a.id} style={{ background: "#fff", borderRadius: 16, boxShadow: "0 1px 4px rgba(0,0,0,.06)", border: "1px solid #f0f0f0", overflow: "hidden" }}>
              <div style={{ height: 4, background: sColor[a.status] }} />
              <div style={{ padding: 18 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#111", marginBottom: 4 }}>{a.title}</div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>{a.description}</div>
                  </div>
                  <div style={{ marginRight: 8 }}><Badge type={a.status}>{sLabel[a.status]}</Badge></div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 14 }}>
                  {[["📅", fmtDate(a.event_date)], ["📍", a.location || "—"], ["👥", `${a.max_attendees} مقعد`], ["⭐", `${a.points_reward} نقطة`], ["🎟️", `حجوزات: ${a.activity_registrations?.[0]?.count || 0}`]].map(([ic, v], i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#6b7280" }}><span>{ic}</span><span>{v}</span></div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => openEdit(a)} style={{ flex: 1, padding: "8px 0", borderRadius: 10, border: "none", background: "#f3f4f6", cursor: "pointer", fontWeight: 600, fontSize: 12, color: "#374151" }}>تعديل</button>
                  <button onClick={() => toggle(a)} style={{ flex: 1, padding: "8px 0", borderRadius: 10, border: "none", background: a.status === "active" ? "#fef3c7" : "#d1fae5", cursor: "pointer", fontWeight: 600, fontSize: 12, color: a.status === "active" ? "#d97706" : "#059669" }}>{a.status === "active" ? "تعطيل" : "تفعيل"}</button>
                  <button onClick={() => del(a)} style={{ width: 34, height: 34, borderRadius: 10, border: "none", background: "#fee2e2", cursor: "pointer", color: "#dc2626", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>🗑</button>
                  <button
                    onClick={() => {
                      setSelectedActivity(a);
                      loadAttendees(a.id);
                      setAttendanceModal(true);
                    }}
                    className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-100 transition ml-2"
                  >
                    🎟️ الحضور
                  </button>
                </div>
                {/* Attendance Modal */}
                {attendanceModal && (
                  <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    onClick={() => setAttendanceModal(false)}
                  >
                    <div
                      className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-auto"
                      onClick={e => e.stopPropagation()}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">
                          حضور الفعالية: {selectedActivity?.title}
                        </h2>
                        <button onClick={() => setAttendanceModal(false)} className="text-gray-500 hover:text-gray-700">✕</button>
                      </div>

                      {loadingAttendees ? (
                        <div className="text-center py-8">جاري التحميل...</div>
                      ) : attendees.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">لا يوجد طلاب مسجلين بعد</div>
                      ) : (
                        <table className="w-full text-right">
                          <thead className="bg-gray-50 border-b">
                            <tr>
                              <th className="py-2 px-4">الاسم</th>
                              <th className="py-2 px-4">الجامعة</th>
                              <th className="py-2 px-4">وقت التسجيل</th>
                            </tr>
                          </thead>
                          <tbody>
                            {attendees.map((att, idx) => (
                              <tr key={idx} className="border-b hover:bg-gray-50">
                                <td className="py-2 px-4">{att.profiles?.full_name || '—'}</td>
                                <td className="py-2 px-4">{att.profiles?.university || '—'}</td>
                                <td className="py-2 px-4">
                                  {new Date(att.created_at).toLocaleString()}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {!acts.length && <div style={{ textAlign: "center", padding: "48px 0", color: "#9ca3af", gridColumn: "1/-1" }}><div style={{ fontSize: 40, marginBottom: 8 }}>🎯</div><p>لا توجد فعاليات بعد</p></div>}
        </div>
      )}
      <Modal open={modal} title={editing ? "تعديل الفعالية" : "فعالية جديدة"} onClose={() => setModal(false)} wide>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
          <div style={{ gridColumn: "1/-1" }}><Inp label="العنوان *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="اسم الفعالية" /></div>
          <div style={{ gridColumn: "1/-1" }}><Tex label="الوصف" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="وصف الفعالية..." /></div>
          <div style={{ gridColumn: "1/-1", marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>صورة الفعالية (اختياري)</label>
            <input type="file" accept="image/*" onChange={(e) => setSelectedImage(e.target.files?.[0] || null)} style={{ ...inputStyle, padding: "8px" }} />
            {form.image_url && !selectedImage && <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>يوجد صورة محفوظة حالياً <a href={form.image_url} target="_blank" rel="noreferrer" style={{ color: B }}>عرض</a></div>}
          </div>
          <Inp label="التاريخ" type="date" value={form.event_date} onChange={e => setForm(f => ({ ...f, event_date: e.target.value }))} />
          <Inp label="المكان" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Istanbul..." />
          <Inp label="أقصى عدد حضور" type="number" value={form.max_attendees} onChange={e => setForm(f => ({ ...f, max_attendees: Number(e.target.value) }))} placeholder="200" />
          <Inp label="نقاط المكافأة" type="number" value={form.points_reward} onChange={e => setForm(f => ({ ...f, points_reward: Number(e.target.value) }))} placeholder="100" />
          <div style={{ gridColumn: "1/-1" }}><Sel label="الحالة" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))}><option value="active">نشط</option><option value="inactive">معطل</option><option value="draft">مسودة</option></Sel></div>
        </div>
        <button onClick={save} disabled={saving} style={{ width: "100%", padding: "12px 0", borderRadius: 12, border: "none", background: B, color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14, marginTop: 4, opacity: saving ? 0.7 : 1 }}>
          {saving ? "جاري الحفظ..." : editing ? "حفظ التعديلات" : "إنشاء الفعالية"}
        </button>
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// PARTNERS PAGE
// ══════════════════════════════════════════════════════════════
function PartnersPage({ setConfirm }: { setConfirm: (v: any) => void }) {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Partner | null>(null);
  const [form, setForm] = useState<Partial<Partner>>({ name: "", website: "", status: "active" });

  const load = async () => {
    setLoading(true);
    try { const data = await fetchPartners(); setPartners(data || []); }
    catch { toast.error("فشل تحميل الشركاء"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.name) { toast.error("يرجى إدخال الاسم"); return; }
    setSaving(true);
    try {
      await upsertPartner(editing ? { ...form, id: editing.id } : form);
      toast.success(editing ? "تم التحديث" : "تم الإضافة");
      setModal(false); load();
    } catch { toast.error("فشل الحفظ"); }
    finally { setSaving(false); }
  };

  const toggleStatus = async (p: Partner) => {
    try {
      await upsertPartner({ ...p, status: p.status === "active" ? "inactive" : "active" });
      toast.success("تم التحديث"); load();
    } catch { toast.error("فشل التحديث"); }
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div><h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#111" }}>إدارة الشركاء</h2><p style={{ margin: "2px 0 0", color: "#9ca3af", fontSize: 13 }}>{partners.length} شركاء</p></div>
        <button onClick={() => { setEditing(null); setForm({ name: "", website: "", status: "active" }); setModal(true) }} style={{ padding: "10px 20px", borderRadius: 12, border: "none", background: B, color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>+ إضافة شريك</button>
      </div>
      {loading ? <Spinner /> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
          {partners.map(p => (
            <div key={p.id} style={{ background: "#fff", borderRadius: 16, padding: 18, boxShadow: "0 1px 4px rgba(0,0,0,.06)", border: "1px solid #f0f0f0" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: B, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 22, flexShrink: 0 }}>{p.name[0]}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: "#111", marginBottom: 2 }}>{p.name}</div>
                  {p.website && <a href={p.website} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: "#3b82f6" }}>{p.website}</a>}
                </div>
                <Badge type={p.status}>{p.status === "active" ? "نشط" : "معطل"}</Badge>
              </div>
              <div style={{ background: "#f8fafc", borderRadius: 10, padding: "8px 12px", marginBottom: 14, display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                <span style={{ color: "#6b7280" }}>🏷️ عدد العروض</span>
                <span style={{ fontWeight: 800, color: "#111" }}>{(p as any).offers?.[0]?.count ?? p.offers_count ?? 0}</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { setEditing(p); setForm({ ...p }); setModal(true) }} style={{ flex: 1, padding: "8px 0", borderRadius: 10, border: "none", background: "#f3f4f6", cursor: "pointer", fontWeight: 600, fontSize: 12, color: "#374151" }}>تعديل</button>
                <button onClick={() => toggleStatus(p)} style={{ flex: 1, padding: "8px 0", borderRadius: 10, border: "none", background: p.status === "active" ? "#fef3c7" : "#d1fae5", cursor: "pointer", fontWeight: 600, fontSize: 12, color: p.status === "active" ? "#d97706" : "#059669" }}>{p.status === "active" ? "تعطيل" : "تفعيل"}</button>
              </div>
            </div>
          ))}
          {!partners.length && <div style={{ textAlign: "center", padding: "48px 0", color: "#9ca3af", gridColumn: "1/-1" }}><div style={{ fontSize: 40, marginBottom: 8 }}>🤝</div><p>لا يوجد شركاء بعد</p></div>}
        </div>
      )}
      <Modal open={modal} title={editing ? "تعديل الشريك" : "شريك جديد"} onClose={() => setModal(false)}>
        <Inp label="اسم الشريك *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="اسم الشركة" />
        <Inp label="الموقع الإلكتروني" value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://example.com" />
        <Sel label="الحالة" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))}><option value="active">نشط</option><option value="inactive">معطل</option></Sel>
        <button onClick={save} disabled={saving} style={{ width: "100%", padding: "12px 0", borderRadius: 12, border: "none", background: B, color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14, opacity: saving ? 0.7 : 1 }}>
          {saving ? "جاري الحفظ..." : editing ? "حفظ" : "إضافة"}
        </button>
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// OFFERS PAGE
// ══════════════════════════════════════════════════════════════
function OffersPage({ setConfirm }: { setConfirm: (v: any) => void }) {
  const [offers, setOffers] = useState<any[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<any>({ title: "", partner_id: "", description: "", discount_percentage: 0, expires_at: "", status: "active", image_url: "" });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [offersData, partnersData] = await Promise.all([fetchOffers(), fetchPartners()]);
      setOffers(offersData || []);
      setPartners(partnersData || []);
    } catch { toast.error("فشل تحميل العروض"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.title) { toast.error("يرجى إدخال العنوان"); return; }
    if (!form.partner_id) { toast.error("يرجى اختيار الشريك"); return; }
    setSaving(true);
    try {
      let finalImageUrl = form.image_url;
      if (selectedImage) {
        finalImageUrl = await uploadImage(selectedImage);
      }
      const payload = { title: form.title, partner_id: form.partner_id, description: form.description, discount_percentage: Number(form.discount_percentage), expires_at: form.expires_at || null, status: form.status, image_url: finalImageUrl };
      await upsertOffer(editing ? { ...payload, id: editing.id } : payload);
      toast.success(editing ? "تم التحديث" : "تم الإضافة");
      setModal(false); load();
    } catch { toast.error("فشل الحفظ"); }
    finally { setSaving(false); }
  };

  const toggleOffer = async (o: any) => {
    try { await upsertOffer({ ...o, partner_id: o.partner_id || o.partners?.id, status: o.status === "active" ? "inactive" : "active" }); toast.success("تم التحديث"); load(); }
    catch { toast.error("فشل التحديث"); }
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div><h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#111" }}>إدارة العروض</h2><p style={{ margin: "2px 0 0", color: "#9ca3af", fontSize: 13 }}>{offers.length} عروض</p></div>
        <button onClick={() => { setEditing(null); setForm({ title: "", partner_id: "", description: "", discount_percentage: 0, expires_at: "", status: "active", image_url: "" }); setSelectedImage(null); setModal(true) }} style={{ padding: "10px 20px", borderRadius: 12, border: "none", background: B, color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>+ إضافة عرض</button>
      </div>
      {loading ? <Spinner /> : (
        <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 1px 4px rgba(0,0,0,.06)", border: "1px solid #f0f0f0", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead><tr style={{ borderBottom: "1px solid #f3f4f6", background: "#fafafa" }}>
                {["العرض", "الشريك", "الخصم", "الانتهاء", "الحالة", "إجراءات"].map(h => (
                  <th key={h} style={{ textAlign: "right", padding: "12px 16px", fontWeight: 700, color: "#6b7280" }}>{h}</th>
                ))}
              </tr></thead>
              <tbody>{offers.map(o => (
                <tr key={o.id} style={{ borderBottom: "1px solid #fafafa" }}>
                  <td style={{ padding: "12px 16px", fontWeight: 700, color: "#111" }}>{o.title}</td>
                  <td style={{ padding: "12px 16px", color: "#6b7280" }}>{o.partners?.name || "—"}</td>
                  <td style={{ padding: "12px 16px" }}><span style={{ fontWeight: 900, fontSize: 18, color: B }}>{o.discount_percentage}%</span></td>
                  <td style={{ padding: "12px 16px", color: "#9ca3af", fontSize: 12 }}>{o.expires_at ? fmtDate(o.expires_at) : "—"}</td>
                  <td style={{ padding: "12px 16px" }}><Badge type={o.status}>{o.status === "active" ? "نشط" : "معطل"}</Badge></td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => { setEditing(o); setForm({ title: o.title, description: o.description || "", image_url: o.image_url || "", partner_id: o.partner_id || o.partners?.id || "", discount_percentage: o.discount_percentage, expires_at: o.expires_at?.slice(0, 10) || "", status: o.status }); setSelectedImage(null); setModal(true) }} style={{ width: 28, height: 28, borderRadius: 8, border: "none", background: "#f3f4f6", cursor: "pointer", fontSize: 13 }}>✏️</button>
                      <button onClick={() => toggleOffer(o)} style={{ width: 28, height: 28, borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, background: o.status === "active" ? "#fef3c7" : "#d1fae5", color: o.status === "active" ? "#d97706" : "#059669" }}>{o.status === "active" ? "⏸" : "▶"}</button>
                      <button onClick={() => setConfirm({ title: "حذف العرض", message: `حذف "${o.title}"؟`, danger: true, onConfirm: async () => { try { await upsertOffer({ ...o, status: "inactive" }); toast.success("تم"); load(); } catch { toast.error("فشل"); } } })} style={{ width: 28, height: 28, borderRadius: 8, border: "none", background: "#fee2e2", cursor: "pointer", color: "#dc2626", fontSize: 13 }}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}</tbody>
            </table>
            {!offers.length && <div style={{ textAlign: "center", padding: "48px 0", color: "#9ca3af" }}><div style={{ fontSize: 40, marginBottom: 8 }}>🏷️</div><p>لا توجد عروض بعد</p></div>}
          </div>
        </div>
      )}
      <Modal open={modal} title={editing ? "تعديل العرض" : "عرض جديد"} onClose={() => setModal(false)}>
        <Inp label="عنوان العرض *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="عنوان العرض" />
        <Tex label="وصف العرض" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="وصف العرض..." />
        <Field label="الشريك *">
          <select value={form.partner_id} onChange={e => setForm(f => ({ ...f, partner_id: e.target.value }))} style={inputStyle}>
            <option value="">اختر الشريك</option>
            {partners.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>
        <Inp label="نسبة الخصم %" type="number" min="0" max="100" value={form.discount_percentage} onChange={e => setForm(f => ({ ...f, discount_percentage: e.target.value }))} placeholder="20" />
        <Inp label="تاريخ الانتهاء" type="date" value={form.expires_at} onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} />
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>صورة العرض (اختياري)</label>
          <input type="file" accept="image/*" onChange={(e) => setSelectedImage(e.target.files?.[0] || null)} style={{ ...inputStyle, padding: "8px" }} />
          {form.image_url && !selectedImage && <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>يوجد صورة محفوظة حالياً <a href={form.image_url} target="_blank" rel="noreferrer" style={{ color: B }}>عرض</a></div>}
        </div>
        <Sel label="الحالة" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}><option value="active">نشط</option><option value="inactive">معطل</option></Sel>
        <button onClick={save} disabled={saving} style={{ width: "100%", padding: "12px 0", borderRadius: 12, border: "none", background: B, color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14, opacity: saving ? 0.7 : 1 }}>
          {saving ? "جاري الحفظ..." : editing ? "حفظ" : "إضافة"}
        </button>
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// REELS PAGE
// ══════════════════════════════════════════════════════════════
function ReelsPage({ setConfirm }: { setConfirm: (v: any) => void }) {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Reel | null>(null);
  const [form, setForm] = useState<Partial<Reel>>({ title: "", description: "", video_url: "", status: "active", allow_comments: true, thumbnail_url: "" });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  // Comment Moderation
  const [modModal, setModModal] = useState<Reel | null>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  const load = async () => {
    setLoading(true);
    try { const { data } = await fetchReels({ pageSize: 100 }); setReels(data || []); }
    catch { toast.error("فشل تحميل الريلز"); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const loadReelComments = async (r: Reel) => {
    setModModal(r);
    setLoadingComments(true);
    try {
      const data = await fetchComments(r.id);
      setComments(data || []);
    } catch { toast.error("فشل تحميل التعليقات"); }
    finally { setLoadingComments(false); }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
      toast.success("تم حذف التعليق");
      load(); // Refresh counts in table
    } catch { toast.error("فشل حذف التعليق"); }
  };

  const save = async () => {
    if (!form.video_url) { toast.error("يرجى إدخال رابط الفيديو"); return; }
    setSaving(true);
    try {
      let finalThumbnailUrl = form.thumbnail_url;
      if (selectedImage) {
        finalThumbnailUrl = await uploadImage(selectedImage);
      }
      await upsertReel(editing ? { ...form, id: editing.id, thumbnail_url: finalThumbnailUrl } : { ...form, thumbnail_url: finalThumbnailUrl });
      toast.success(editing ? "تم التحديث" : "تم الإضافة");
      setModal(false); load();
    } catch { toast.error("فشل الحفظ"); }
    finally { setSaving(false); }
  };

  const del = (r: Reel) => setConfirm({
    title: "حذف الريل", message: `حذف "${r.title || "الريل"}"؟`, danger: true,
    onConfirm: async () => {
      try { await deleteReel(r.id); toast.success("تم الحذف"); load(); }
      catch { toast.error("فشل الحذف"); }
    }
  });

  const toggleComments = async (r: Reel) => {
    try { await upsertReel({ ...r, allow_comments: !r.allow_comments }); toast.success("تم التحديث"); load(); }
    catch { toast.error("فشل التحديث"); }
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div><h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#111" }}>إدارة الريلز</h2><p style={{ margin: "2px 0 0", color: "#9ca3af", fontSize: 13 }}>{reels.length} فيديو</p></div>
        <button onClick={() => { setEditing(null); setForm({ title: "", description: "", video_url: "", status: "active", allow_comments: true, thumbnail_url: "" }); setSelectedImage(null); setModal(true) }} style={{ padding: "10px 20px", borderRadius: 12, border: "none", background: B, color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>+ إضافة ريل</button>
      </div>
      {loading ? <Spinner /> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 16 }}>
          {reels.map(r => (
            <div key={r.id} style={{ background: "#fff", borderRadius: 16, boxShadow: "0 1px 4px rgba(0,0,0,.06)", border: "1px solid #f0f0f0", overflow: "hidden" }}>
              <div style={{ height: 120, background: `linear-gradient(135deg,${B}33,${B}66)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, position: "relative" }}>
                {r.thumbnail_url ? <img src={r.thumbnail_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "🎬"}
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.2)" }} />
              </div>
              <div style={{ padding: 14 }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#111", flex: 1 }}>{r.title || "ريل بدون عنوان"}</div>
                  <div style={{ marginRight: 8 }}><Badge type={r.status}>{r.status === "active" ? "نشط" : "معطل"}</Badge></div>
                </div>
                <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 10 }}>{r.description}</div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, background: "#f8fafc", padding: "10px 8px", borderRadius: 10, marginBottom: 14 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: "#9ca3af", marginBottom: 2 }}>👁 مشاهدة</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#111" }}>{(r.views || 0).toLocaleString()}</div>
                  </div>
                  <div style={{ textAlign: "center", borderLeft: "1px solid #eef2f6", borderRight: "1px solid #eef2f6" }}>
                    <div style={{ fontSize: 10, color: "#9ca3af", marginBottom: 2 }}>❤️ إعجاب</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#111" }}>{r.reel_likes?.[0]?.count || 0}</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: "#9ca3af", marginBottom: 2 }}>💬 تعليق</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#111" }}>{r.reel_comments?.[0]?.count || 0}</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <button onClick={() => { setEditing(r); setForm({ ...r }); setSelectedImage(null); setModal(true) }} style={{ flex: 1, padding: "7px 0", borderRadius: 9, border: "none", background: "#f3f4f6", cursor: "pointer", fontWeight: 600, fontSize: 11, color: "#374151" }}>🛠 تعديل</button>
                  <button onClick={() => loadReelComments(r)} style={{ flex: 1, padding: "7px 0", borderRadius: 9, border: "none", background: "#f3f4f6", cursor: "pointer", fontWeight: 600, fontSize: 11, color: "#374151" }}>💬 التعليقات</button>
                  <button onClick={() => toggleComments(r)} style={{ flex: 1.2, padding: "7px 0", borderRadius: 9, border: "none", background: "#e0f2fe", cursor: "pointer", fontWeight: 600, fontSize: 10, color: "#0284c7" }}>{r.allow_comments ? "إغلاق التعليقات" : "فتح التعليقات"}</button>
                  <button onClick={() => del(r)} style={{ width: 32, height: 32, borderRadius: 9, border: "none", background: "#fee2e2", cursor: "pointer", color: "#dc2626", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}>🗑</button>
                </div>
              </div>
            </div>
          ))}
          {!reels.length && <div style={{ textAlign: "center", padding: "48px 0", color: "#9ca3af", gridColumn: "1/-1" }}><div style={{ fontSize: 40, marginBottom: 8 }}>🎬</div><p>لا توجد ريلز بعد</p></div>}
        </div>
      )}

      {/* Basic Edit Modal */}
      <Modal open={modal} title={editing ? "تعديل الريل" : "ريل جديد"} onClose={() => setModal(false)}>
        <Inp label="رابط الفيديو *" value={form.video_url} onChange={e => setForm(f => ({ ...f, video_url: e.target.value }))} placeholder="https://youtube.com/..." />
        <Inp label="العنوان" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="عنوان الريل" />
        <Tex label="الوصف" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="وصف الفيديو..." />
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>الصورة المصغرة (اختياري)</label>
          <input type="file" accept="image/*" onChange={(e) => setSelectedImage(e.target.files?.[0] || null)} style={{ ...inputStyle, padding: "8px" }} />
          {form.thumbnail_url && !selectedImage && <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>يوجد صورة محفوظة حالياً <a href={form.thumbnail_url} target="_blank" rel="noreferrer" style={{ color: B }}>عرض</a></div>}
        </div>
        <Sel label="الحالة" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as any }))}><option value="active">نشط</option><option value="inactive">معطل</option></Sel>
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#f8fafc", borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>
          <input type="checkbox" id="cmts" checked={form.allow_comments} onChange={e => setForm(f => ({ ...f, allow_comments: e.target.checked }))} style={{ width: 16, height: 16 }} />
          <label htmlFor="cmts" style={{ fontSize: 13, fontWeight: 600, color: "#374151", cursor: "pointer" }}>السماح بالتعليقات</label>
        </div>
        <button onClick={save} disabled={saving} style={{ width: "100%", padding: "12px 0", borderRadius: 12, border: "none", background: B, color: "#fff", fontWeight: 700, cursor: "pointer", fontSize: 14, opacity: saving ? 0.7 : 1 }}>
          {saving ? "جاري الحفظ..." : editing ? "حفظ" : "إضافة"}
        </button>
      </Modal>

      {/* Comment Moderation Modal */}
      <Modal open={!!modModal} title={`تعليقات: ${modModal?.title || "ريل"}`} onClose={() => setModModal(null)} wide>
        {loadingComments ? <Spinner /> : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {comments.length === 0 ? (
              <div style={{ textAlign: "center", padding: "32px 0", color: "#9ca3af" }}>لا توجد تعليقات على هذا الفيديو</div>
            ) : (
              comments.map(c => (
                <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px", background: "#f8fafc", borderRadius: 12 }}>
                  <Avatar name={c.profiles?.full_name || "؟"} size={36} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: "#111" }}>{c.profiles?.full_name || "مستخدم"}</span>
                      <span style={{ fontSize: 10, color: "#9ca3af" }}>{fmtDate(c.created_at)}</span>
                    </div>
                    <div style={{ fontSize: 13, color: "#374151" }}>{c.content}</div>
                  </div>
                  <button
                    onClick={() => setConfirm({
                      title: "حذف التعليق",
                      message: "هل أنت متأكد من حذف هذا التعليق؟ لا يمكن التراجع.",
                      danger: true,
                      onConfirm: () => handleDeleteComment(c.id)
                    })}
                    style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: "#fee2e2", color: "#dc2626", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    🗑
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// POINTS PAGE
// ══════════════════════════════════════════════════════════════
function PointsPage() {
  const [history, setHistory] = useState<PointHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
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

  const filtered = filter === "all" ? history : history.filter(h => h.reason_type === filter);

  return (
    <div>
      <div style={{ marginBottom: 20 }}><h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#111" }}>سجل النقاط</h2><p style={{ margin: "2px 0 0", color: "#9ca3af", fontSize: 13 }}>جميع تغييرات النقاط في النظام</p></div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {["all", "activity", "volunteer", "achievement", "deduction", "manual"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "8px 14px", borderRadius: 12, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 12, background: filter === f ? B : "#fff", color: filter === f ? "#fff" : "#6b7280", boxShadow: "0 1px 3px rgba(0,0,0,.08)" }}>{f === "all" ? "الكل" : typeLabels[f]}</button>
        ))}
      </div>
      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 1px 4px rgba(0,0,0,.06)", border: "1px solid #f0f0f0", overflow: "hidden" }}>
        {loading ? <Spinner /> : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead><tr style={{ borderBottom: "1px solid #f3f4f6", background: "#fafafa" }}>
              {["العضو", "التغيير", "السبب", "النوع", "التاريخ"].map(h => (
                <th key={h} style={{ textAlign: "right", padding: "12px 16px", fontWeight: 700, color: "#6b7280" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>{filtered.map(h => (
              <tr key={h.id} style={{ borderBottom: "1px solid #fafafa" }}>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar name={h.user_name} size={32} />
                    <span style={{ fontWeight: 600, color: "#111" }}>{h.user_name}</span>
                  </div>
                </td>
                <td style={{ padding: "12px 16px" }}><span style={{ fontWeight: 900, fontSize: 16, color: h.change_amount > 0 ? "#059669" : "#dc2626" }}>{h.change_amount > 0 ? "+" : ""}{h.change_amount}</span></td>
                <td style={{ padding: "12px 16px", color: "#6b7280" }}>{h.reason}</td>
                <td style={{ padding: "12px 16px" }}><Badge type={h.reason_type}>{typeLabels[h.reason_type]}</Badge></td>
                <td style={{ padding: "12px 16px", color: "#9ca3af", fontSize: 12 }}>{fmtDate(h.created_at)}</td>
              </tr>
            ))}</tbody>
          </table>
        )}
        {!loading && !filtered.length && <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af" }}><div style={{ fontSize: 36, marginBottom: 8 }}>📭</div><p>لا توجد سجلات</p></div>}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// SCANNER PAGE
// ══════════════════════════════════════════════════════════════
function ScannerPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [scanResult, setScanResult] = useState<{ type: 'success' | 'error' | 'warning', message: string } | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const isScanningRef = useRef(false);

  useEffect(() => {
    fetchActivities({ pageSize: 100 })
      .then(({ data }) => setActivities((data || []).filter(a => a.status === 'active')))
      .catch(() => toast.error("فشل تحميل الفعاليات"))
      .finally(() => setLoading(false));
  }, []);

  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.value = 800;
      gainNode.gain.value = 0.5;

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start();
      setTimeout(() => oscillator.stop(), 150);
    } catch (e) {
      console.log('Audio not supported', e);
    }
  };

  useEffect(() => {
    if (selectedActivity && !scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner(
        "qr-reader",
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
        },
        false
      );

      // Notice the second argument added at the end of the render call
      scannerRef.current.render(
        async (decodedText) => {
          if (isScanningRef.current) return;
          isScanningRef.current = true;

          try {
            scannerRef.current?.pause();
            const result = await recordAttendance(decodedText, selectedActivity);

            if (result.error) {
              // TRANSLATION LOGIC
              let friendlyMessage = '❌ الكود غير صحيح';

              if (result.message.includes('Already scanned') || result.message.includes('مسبقاً')) {
                friendlyMessage = '⚠️ تم المسح مسبقاً لهذا الطالب'; // <--- Your custom text
              } else if (result.message.includes('not found')) {
                friendlyMessage = '👤 هذا الطالب غير مسجل';
              }

              setScanResult({
                type: 'warning',
                message: friendlyMessage
              });
            } else {
              playBeep();
              setScanResult({
                type: 'success',
                message: `✅ تم تسجيل الحضور: ${result.student_name}`
              });
            }
          } catch (err) {
            setScanResult({ type: 'error', message: 'حدث خطأ في الاتصال' });
          } finally {
            setTimeout(() => {
              isScanningRef.current = false;
              scannerRef.current?.resume();
              setScanResult(null);
            }, 3000);
          }
        },
        (errorMessage) => {
          // 👈 THIS IS THE SECOND ARGUMENT
          // We leave this empty because we don't want a popup every time
          // the camera fails to see a QR code in a single frame.
        }
      );
    }
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(e => console.error(e));
        scannerRef.current = null;
      }
    };
  }, [selectedActivity]);


  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#111" }}>الماسح الضوئي</h2>
        <p style={{ margin: "2px 0 0", color: "#6b7280", fontSize: 13 }}>لوحة تسجيل الحضور السريعة عبر رمز الاستجابة السريعة (QR)</p>
      </div>

      <div style={{ background: "#fff", borderRadius: 16, padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,.06)", border: "1px solid #f0f0f0", maxWidth: 600, margin: "0 auto" }}>

        <Sel label="اختر الفعالية لبدء المسح *" value={selectedActivity} onChange={e => setSelectedActivity(e.target.value)}>
          <option value="">-- اختر الفعالية --</option>
          {activities.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
        </Sel>

        {selectedActivity ? (
          <div style={{ marginTop: 20, position: 'relative' }}>
            <div id="qr-reader" style={{ width: "100%", borderRadius: 16, overflow: "hidden", border: `2px solid ${B}` }}></div>
            <style>{`
                  #qr-reader__scan_region { background: #f8fafc; }
                  #qr-reader__dashboard { padding: 10px; }
                  #qr-reader button { padding: 8px 16px; border-radius: 8px; border: none; background: ${B}; color: white; cursor: pointer; }
               `}</style>

            {scanResult && (
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(255,255,255,0.95)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                borderRadius: 16,
                padding: 24,
                textAlign: 'center',
                border: `2px solid ${scanResult.type === 'success' ? '#10b981' : scanResult.type === 'warning' ? '#f59e0b' : '#ef4444'}`
              }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>
                  {scanResult.type === 'success' ? '✅' : scanResult.type === 'warning' ? '⚠️' : '❌'}
                </div>
                <h3 style={{
                  margin: 0, fontSize: 18, fontWeight: 800,
                  color: scanResult.type === 'success' ? '#047857' : scanResult.type === 'warning' ? '#b45309' : '#b91c1c'
                }}>
                  {scanResult.message}
                </h3>
              </div>
            )}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#9ca3af" }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📹</div>
            <p>يرجى اختيار الفعالية لفتح الكاميرا</p>
          </div>
        )}

      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// ANALYTICS PAGE
// ══════════════════════════════════════════════════════════════
// function AnalyticsPage() {
//   const monthlyUsers = [12, 18, 15, 22, 28, 19, 24, 30, 26, 21, 35, 28];
//   const months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
//   const max = Math.max(...monthlyUsers);
//   const unis = [{ name: "Istanbul University", count: 3, pct: 37 }, { name: "Istanbul Technical", count: 2, pct: 25 }, { name: "Marmara University", count: 1, pct: 12 }, { name: "Bogazici University", count: 1, pct: 12 }, { name: "أخرى", count: 1, pct: 12 }];
//   return (
//     <div>
//       <div style={{ marginBottom: 20 }}><h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#111" }}>التحليلات والإحصاءات</h2></div>
//       <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 16 }}>
//         <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,.06)", border: "1px solid #f0f0f0" }}>
//           <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>الأعضاء الجدد شهرياً (تقريبي)</h3>
//           <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 96, marginBottom: 8 }}>
//             {monthlyUsers.map((v, i) => (
//               <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
//                 <span style={{ fontSize: 10, color: "#9ca3af" }}>{v}</span>
//                 <div style={{ width: "100%", borderRadius: "4px 4px 0 0", background: B, opacity: .4 + (i / 12) * .6, height: `${(v / max) * 72}px` }} />
//               </div>
//             ))}
//           </div>
//           <div style={{ display: "flex", justifyContent: "space-between" }}>
//             {months.map((m, i) => <span key={i} style={{ flex: 1, textAlign: "center", fontSize: 10, color: "#9ca3af" }}>{m.slice(0, 3)}</span>)}
//           </div>
//         </div>
//         <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,.06)", border: "1px solid #f0f0f0" }}>
//           <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700 }}>توزيع الجامعات</h3>
//           {unis.map(u => (
//             <div key={u.name} style={{ marginBottom: 12 }}>
//               <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
//                 <span style={{ color: "#6b7280" }}>{u.name}</span><span style={{ fontWeight: 700 }}>{u.pct}%</span>
//               </div>
//               <div style={{ height: 8, background: "#f3f4f6", borderRadius: 4, overflow: "hidden" }}>
//                 <div style={{ height: "100%", background: B, opacity: .7, borderRadius: 4, width: `${u.pct}%` }} />
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//       <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
//         {[{ l: "معدل الحضور", v: "73%", d: "من المسجلين", icon: "🎯" }, { l: "متوسط النقاط", v: "677", d: "لكل عضو", icon: "⭐" }, { l: "هذا الشهر", v: "35", d: "عضو جديد", icon: "📈" }, { l: "معدل الاحتفاظ", v: "87%", d: "أعضاء نشطون", icon: "✅" }].map(k => (
//           <div key={k.l} style={{ background: "#fff", borderRadius: 14, padding: "18px 14px", boxShadow: "0 1px 4px rgba(0,0,0,.06)", border: "1px solid #f0f0f0", textAlign: "center" }}>
//             <div style={{ fontSize: 32, marginBottom: 8 }}>{k.icon}</div>
//             <div style={{ fontSize: 24, fontWeight: 900, color: B, marginBottom: 4 }}>{k.v}</div>
//             <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 2 }}>{k.l}</div>
//             <div style={{ fontSize: 11, color: "#9ca3af" }}>{k.d}</div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// ══════════════════════════════════════════════════════════════
// ROOT — Admin shell
// ══════════════════════════════════════════════════════════════
const navItems = [
  { id: "dashboard", label: "الرئيسية", icon: "⊞" },
  { id: "scanner", label: "الماسح الضوئي", icon: "📹" },
  { id: "users", label: "المستخدمون", icon: "👥" },
  { id: "activities", label: "الفعاليات", icon: "🎯" },
  { id: "partners", label: "الشركاء", icon: "🤝" },
  { id: "offers", label: "العروض", icon: "🏷️" },
  { id: "reels", label: "الريلز", icon: "🎥" },
  { id: "points", label: "سجل النقاط", icon: "⭐" },
  // { id: "analytics", label: "التحليلات", icon: "📊" },
];

export default function Admin() {
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebar] = useState(true);
  const [confirm, setConfirm] = useState<any>(null);
  const { profile, signOut } = useAuth();

  const pageMap: Record<string, React.ReactNode> = {
    dashboard: <DashboardPage />,
    scanner: <ScannerPage />,
    users: <UsersPage setConfirm={setConfirm} />,
    activities: <ActivitiesPage setConfirm={setConfirm} />,
    partners: <PartnersPage setConfirm={setConfirm} />,
    offers: <OffersPage setConfirm={setConfirm} />,
    reels: <ReelsPage setConfirm={setConfirm} />,
    points: <PointsPage />,
    // analytics: <AnalyticsPage />,
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f8fafc", fontFamily: "'Segoe UI',Tahoma,Geneva,Verdana,sans-serif", direction: "rtl" }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:3px}
      `}</style>

      {/* Sidebar */}
      <aside style={{ width: sidebarOpen ? 240 : 60, background: "#fff", borderLeft: "1px solid #f0f0f0", display: "flex", flexDirection: "column", boxShadow: "2px 0 8px rgba(0,0,0,.04)", transition: "width .25s", flexShrink: 0, zIndex: 10 }}>
        <div style={{ padding: sidebarOpen ? "16px" : "12px", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: 10, justifyContent: sidebarOpen ? "flex-start" : "center" }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: B, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 16, flexShrink: 0 }}>ا</div>
          {sidebarOpen && <div><div style={{ fontWeight: 800, fontSize: 13, color: "#111", lineHeight: 1.2 }}>اتحاد الطلاب اليمنيين</div><div style={{ fontSize: 11, color: "#9ca3af" }}>فرع إسطنبول</div></div>}
        </div>
        <nav style={{ flex: 1, padding: "8px", overflowY: "auto" }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setPage(item.id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: sidebarOpen ? "10px 12px" : "10px", borderRadius: 12, border: "none", cursor: "pointer", fontWeight: page === item.id ? 700 : 500, fontSize: 13, marginBottom: 2, background: page === item.id ? `${B}14` : "transparent", color: page === item.id ? B : "#6b7280", justifyContent: sidebarOpen ? "flex-start" : "center", transition: "all .15s" }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>}
            </button>
          ))}
        </nav>
        {/* <div style={{ padding: "8px", borderTop: "1px solid #f0f0f0" }}>
          <button onClick={() => setSidebar(s => !s)} style={{ width: "100%", padding: "8px", borderRadius: 10, border: "none", background: "#f8fafc", cursor: "pointer", color: "#6b7280", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <span style={{ transform: sidebarOpen ? "scaleX(-1)" : "none", display: "inline-block", transition: "transform .2s" }}>◂</span>
            {sidebarOpen && <span>طي</span>}
          </button>
        </div> */}
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        {/* Topbar */}
        <header style={{ background: "#fff", borderBottom: "1px solid #f0f0f0", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, boxShadow: "0 1px 4px rgba(0,0,0,.04)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h1 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#111" }}>{navItems.find(n => n.id === page)?.label}</h1>
            <span style={{ fontSize: 11, color: "#9ca3af", background: "#f3f4f6", padding: "3px 10px", borderRadius: 8 }}>لوحة الإدارة</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <NotificationBell />
            <div style={{ textAlign: "right", marginRight: "8px" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>{profile?.full_name || "المدير"}</div>
              <div style={{ fontSize: 11, color: "#9ca3af" }}>مدير النظام</div>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: B, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 15 }}>
              {profile?.full_name?.[0] || "م"}
            </div>
            <button onClick={() => signOut()} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #fee2e2", background: "#fff", color: "#dc2626", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>خروج</button>
          </div>
        </header>

        {/* Page content */}
        <main style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto", animation: "fadeUp .25s ease" }} key={page}>
            {pageMap[page]}
          </div>
        </main>
      </div>

      {confirm && (
        <ConfirmModal open title={confirm.title} message={confirm.message} danger={confirm.danger}
          onConfirm={() => { confirm.onConfirm(); setConfirm(null) }}
          onCancel={() => setConfirm(null)} />
      )}
    </div>
  );
}