import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ShieldCheck, XCircle, GraduationCap, Building2, Star, Calendar, Clock } from "lucide-react";
import { verifySecureToken } from "@/lib/qrToken"; // adjust path if needed
import logo from "@/assets/logo.png";

export default function Verify() {
    const { id } = useParams(); // 'id' is the QR token, not the raw UUID
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [tokenError, setTokenError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!id) {
                setTokenError("لا يوجد رمز للتحقق");
                setLoading(false);
                return;
            }

            // Step 1: Decode and verify the QR token → extract the real memberId
            const { isValid, memberId, error } = verifySecureToken(id);

            if (!isValid || !memberId) {
                setTokenError(error || "رمز QR غير صالح");
                setLoading(false);
                return;
            }

            // Step 2: Query Supabase using the real UUID from the token
            const { data, error: dbError } = await supabase
                .from("profiles")
                .select("full_name, university, faculty, status, role, avatar_url,created_at")
                .eq("id", memberId)
                .single();

            if (dbError) {
                console.error("Supabase Error:", dbError);
                setTokenError("لم يتم العثور على بيانات العضو");
            } else {
                setProfile(data);
            }

            setLoading(false);
        };

        fetchProfile();
    }, [id]);

    // ── Loading ──────────────────────────────────────────────────────────────
    if (loading) return (
        <div className="min-h-screen flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #0a0f1e 0%, #0d1a2e 50%, #091525 100%)" }}>
            <div style={{ textAlign: "center" }}>
                <div style={{
                    width: 56, height: 56, borderRadius: "50%",
                    border: "3px solid transparent",
                    borderTopColor: "#10b981", borderRightColor: "#10b981",
                    animation: "spin 0.8s linear infinite", margin: "0 auto 16px"
                }} />
                <p style={{ color: "#6b7280", fontSize: 14 }}>جارٍ التحقق...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        </div>
    );

    // ── Token expired or invalid ─────────────────────────────────────────────
    if (tokenError) return (
        <div dir="rtl" style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #0a0f1e 0%, #0d1a2e 50%, #091525 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "24px 16px",
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        }}>
            <div style={{
                width: "100%", maxWidth: 420, textAlign: "center",
                background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)",
                borderRadius: 28, border: "1px solid rgba(239,68,68,0.25)", overflow: "hidden",
                boxShadow: "0 0 60px rgba(239,68,68,0.12), 0 25px 50px rgba(0,0,0,0.4)"
            }}>
                <div style={{
                    padding: "40px 28px 32px",
                    background: "linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(220,38,38,0.08) 100%)"
                }}>
                    <div style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        width: 80, height: 80, borderRadius: "50%",
                        background: "linear-gradient(135deg, #ef4444, #dc2626)",
                        boxShadow: "0 0 30px rgba(239,68,68,0.4), 0 8px 20px rgba(0,0,0,0.3)",
                        marginBottom: 20
                    }}>
                        <Clock size={36} color="white" strokeWidth={2.5} />
                    </div>
                    <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f87171", margin: "0 0 10px" }}>
                        {tokenError.includes("منتهي") ? "رمز QR منتهي الصلاحية" : "رمز QR غير صالح"}
                    </h1>
                    <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: 0, lineHeight: 1.7 }}>
                        {tokenError.includes("منتهي")
                            ? "يتجدد الرمز تلقائياً كل دقيقة\nافتح البطاقة وامسح الرمز مجدداً"
                            : tokenError}
                    </p>
                </div>
                <div style={{ padding: "20px 28px 28px" }}>
                    <img src={logo} alt="YODT Logo"
                        style={{ height: 32, width: "auto", opacity: 0.25, filter: "grayscale(1) brightness(2)", margin: "0 auto" }} />
                </div>
            </div>
        </div>
    );

    // ── Main verify page ─────────────────────────────────────────────────────
    const isValid = profile && profile.status === "active";
    const memberSince = profile?.created_at ? new Date(profile.created_at).getFullYear() : null;

    return (
        <div dir="rtl" style={{
            minHeight: "100vh",
            background: "linear-gradient(135deg, #0a0f1e 0%, #0d1a2e 50%, #091525 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "24px 16px",
            fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
            position: "relative", overflow: "hidden"
        }}>
            {/* Background glows */}
            <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
                <div style={{
                    position: "absolute", top: "10%", right: "5%", width: 300, height: 300, borderRadius: "50%",
                    background: isValid
                        ? "radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)"
                        : "radial-gradient(circle, rgba(239,68,68,0.08) 0%, transparent 70%)"
                }} />
                <div style={{
                    position: "absolute", bottom: "10%", left: "5%", width: 250, height: 250, borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)"
                }} />
                <div style={{
                    position: "absolute", inset: 0,
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                                      linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
                    backgroundSize: "40px 40px"
                }} />
            </div>

            <div style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>
                <div style={{
                    background: "rgba(255,255,255,0.04)", backdropFilter: "blur(20px)",
                    borderRadius: 28,
                    border: `1px solid ${isValid ? "rgba(16,185,129,0.25)" : "rgba(239,68,68,0.25)"}`,
                    overflow: "hidden",
                    boxShadow: isValid
                        ? "0 0 60px rgba(16,185,129,0.12), 0 25px 50px rgba(0,0,0,0.4)"
                        : "0 0 60px rgba(239,68,68,0.12), 0 25px 50px rgba(0,0,0,0.4)"
                }}>

                    {/* Status header */}
                    <div style={{
                        padding: "36px 28px 32px", textAlign: "center",
                        background: isValid
                            ? "linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(5,150,105,0.08) 100%)"
                            : "linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(220,38,38,0.08) 100%)"
                    }}>
                        <div style={{
                            display: "inline-flex", alignItems: "center", justifyContent: "center",
                            width: 80, height: 80, borderRadius: "50%",
                            background: isValid
                                ? "linear-gradient(135deg, #10b981, #059669)"
                                : "linear-gradient(135deg, #ef4444, #dc2626)",
                            boxShadow: isValid
                                ? "0 0 30px rgba(16,185,129,0.4), 0 8px 20px rgba(0,0,0,0.3)"
                                : "0 0 30px rgba(239,68,68,0.4), 0 8px 20px rgba(0,0,0,0.3)",
                            marginBottom: 20,
                            animation: isValid ? "pulse-glow 2s ease-in-out infinite" : "none"
                        }}>
                            {isValid
                                ? <ShieldCheck size={36} color="white" strokeWidth={2.5} />
                                : <XCircle size={36} color="white" strokeWidth={2.5} />
                            }
                        </div>
                        <h1 style={{
                            fontSize: 26, fontWeight: 800, margin: "0 0 6px", letterSpacing: 1,
                            color: isValid ? "#34d399" : "#f87171"
                        }}>
                            {isValid ? "عضوية موثّقة" : "عضوية غير صالحة"}
                        </h1>
                        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, margin: 0 }}>
                            اتحاد الطلاب اليمنيين في اسطنبول
                        </p>
                    </div>

                    {/* Ticket-style divider */}
                    <div style={{ display: "flex", alignItems: "center", padding: "0 24px", position: "relative" }}>
                        <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#0a0f1e", position: "absolute", right: -10, border: "1px solid rgba(255,255,255,0.05)" }} />
                        <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)" }} />
                        <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#0a0f1e", position: "absolute", left: -10, border: "1px solid rgba(255,255,255,0.05)" }} />
                    </div>

                    {/* Profile body */}
                    <div style={{ padding: "28px 28px 32px" }}>
                        <div style={{ textAlign: "center", marginBottom: 28 }}>
                            <p style={{
                                fontSize: 11, fontWeight: 700, letterSpacing: 3,
                                color: "rgba(255,255,255,0.3)", textTransform: "uppercase", marginBottom: 8
                            }}>اسم العضو</p>
                            <h2 style={{ fontSize: 22, fontWeight: 800, color: "rgba(255,255,255,0.92)", margin: 0 }}>
                                {profile.full_name}
                            </h2>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                            <InfoCard icon={<Building2 size={16} color="#60a5fa" />} label="الجامعة" value={profile.university || "—"} />
                            <InfoCard icon={<GraduationCap size={16} color="#a78bfa" />} label="الكلية" value={profile.faculty || "—"} />
                        </div>

                        <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
                            <div style={{
                                flex: 1, borderRadius: 12, padding: "10px 14px",
                                background: isValid ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                                border: `1px solid ${isValid ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}`,
                                display: "flex", alignItems: "center", gap: 8
                            }}>
                                <Star size={14} color={isValid ? "#10b981" : "#ef4444"} />
                                <div>
                                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", margin: "0 0 2px", fontWeight: 600 }}>الحالة</p>
                                    <p style={{ fontSize: 13, fontWeight: 700, margin: 0, color: isValid ? "#34d399" : "#f87171" }}>
                                        {profile.status === "active" ? "نشط" : "غير نشط"}
                                    </p>
                                </div>
                            </div>
                            {memberSince && (
                                <div style={{
                                    flex: 1, borderRadius: 12, padding: "10px 14px",
                                    background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                                    display: "flex", alignItems: "center", gap: 8
                                }}>
                                    <Calendar size={14} color="#94a3b8" />
                                    <div>
                                        <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", margin: "0 0 2px", fontWeight: 600 }}>عضو منذ</p>
                                        <p style={{ fontSize: 13, fontWeight: 700, margin: 0, color: "rgba(255,255,255,0.7)" }}>{memberSince}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* <div style={{ textAlign: "center", paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                            <img src={logo} alt="YODT Logo"
                                style={{ height: 36, width: "auto", opacity: 0.35, filter: "grayscale(1) brightness(2)" }} />
                            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", marginTop: 8 }}>
                                تم التحقق بواسطة المنظومة الرقمية
                            </p>
                        </div> */}
                    </div>
                </div>

                <p style={{ textAlign: "center", color: "rgba(255,255,255,0.2)", fontSize: 11, marginTop: 16 }}>
                    وقت التحقق: {new Date().toLocaleString("ar-SA")}
                </p>
            </div>

            <style>{`
                @keyframes pulse-glow {
                    0%, 100% { box-shadow: 0 0 30px rgba(16,185,129,0.4), 0 8px 20px rgba(0,0,0,0.3); }
                    50% { box-shadow: 0 0 50px rgba(16,185,129,0.65), 0 8px 20px rgba(0,0,0,0.3); }
                }
            `}</style>
        </div>
    );
}

function InfoCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div style={{
            background: "rgba(255,255,255,0.04)", borderRadius: 14, padding: 14,
            border: "1px solid rgba(255,255,255,0.07)", textAlign: "center"
        }}>
            <div style={{ marginBottom: 6, display: "flex", justifyContent: "center" }}>{icon}</div>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", margin: "0 0 4px", fontWeight: 600, letterSpacing: 1 }}>{label}</p>
            <p style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.75)", margin: 0, lineHeight: 1.3 }}>{value}</p>
        </div>
    );
}