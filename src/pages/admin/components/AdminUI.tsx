import React from "react";

export const B = "#8B1A2A";

// Global admin styles injected once — fixes iOS Safari / Vercel text colour overrides
export function AdminStyles() {
    return (
        <style>{`
            .admin-input, .admin-select, .admin-textarea {
                color: #111827 !important;
                -webkit-text-fill-color: #111827 !important;
                opacity: 1 !important;
                background: #fff !important;
                -webkit-appearance: none;
                appearance: none;
            }
            .admin-input::placeholder,
            .admin-textarea::placeholder {
                color: #6b7280 !important;
                -webkit-text-fill-color: #6b7280 !important;
                opacity: 1 !important;
            }
        `}</style>
    );
}

// Reusable Basic Input Components for Admin forms
const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    fontSize: 14,
    background: "#fff",
    color: "#111827",
    WebkitTextFillColor: "currentColor",
    WebkitAppearance: "none",
    opacity: 1,
    boxSizing: "border-box",
    fontFamily: "inherit"
};

export function Field({ label, children }: { label?: string; children: React.ReactNode }) {
    return <div style={{ marginBottom: 16 }}>{label && <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>{label}</label>}{children}</div>;
}

export function Inp({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
    return <Field label={label}><input {...props} className={`admin-input ${props.className ?? ""}`} style={inputStyle} /></Field>;
}

export function Sel({ label, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
    return <Field label={label}><select {...props} className={`admin-select ${props.className ?? ""}`} style={inputStyle}>{children}</select></Field>;
}

export function Tex({ label, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
    return <Field label={label}><textarea {...props} rows={3} className={`admin-textarea ${props.className ?? ""}`} style={{ ...inputStyle, resize: "none" }} /></Field>;
}

export function Badge({ children, type }: { children: React.ReactNode; type: string }) {
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

export function Spinner() {
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 48 }}>
            <div style={{ width: 32, height: 32, border: `3px solid ${B}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        </div>
    );
}

export function Avatar({ name, size = 32, src }: { name: string; size?: number; src?: string | null }) {
    if (src) {
        return (
            <img
                src={src}
                alt={name}
                style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
            />
        );
    }

    const cs = ["#8B1A2A", "#1a5276", "#145a32", "#6e2fa0", "#b7770d"];
    const c = cs[(name?.charCodeAt(0) || 0) % cs.length];
    const initials = name ? name.split(" ").slice(0, 2).map((w: string) => w[0]).join("") : "؟";
    return (
        <div style={{ width: size, height: size, borderRadius: "50%", background: c, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "bold", fontSize: size * 0.38, flexShrink: 0 }}>
            {initials}
        </div>
    );
}

export function fmtDate(d: string | null | undefined) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("ar", { year: "numeric", month: "short", day: "numeric" });
}

export function Modal({ open, title, onClose, children, wide = false }:
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

export function ConfirmModal({ open, title, message, onConfirm, onCancel, danger = false }:
    { open: boolean; title: string; message: string; onConfirm: () => void; onCancel: () => void; danger?: boolean }) {
    if (!open) return null;
    return (
        <div className="relative z-[9999]" style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.55)" }} onClick={onCancel} />
            <div className="relative z-[999]" style={{ background: "#fff", borderRadius: 20, boxShadow: "0 20px 60px rgba(0,0,0,.2)", width: "100%", maxWidth: 400, padding: 32, textAlign: "center" }}>
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
