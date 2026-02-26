import React from "react";

const B = "#8B1A2A";

interface AdminCardProps {
    icon: string | React.ReactNode;
    label: string;
    value: string | number;
    sub?: string;
    color?: string;
    trend?: number;
}

export function AdminCard({ icon, label, value, sub, color = B, trend }: AdminCardProps) {
    return (
        <div style={{ background: "#fff", borderRadius: 16, padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,.06)", border: "1px solid #f0f0f0" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, background: `${color}18` }}>{icon}</div>
                {trend != null && (
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 8, background: trend > 0 ? "#d1fae5" : "#fee2e2", color: trend > 0 ? "#059669" : "#dc2626" }}>
                        {trend > 0 ? "+" : ""}{trend}%
                    </span>
                )}
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "#111", marginBottom: 2 }}>{value}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#6b7280" }}>{label}</div>
            {sub && <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>{sub}</div>}
        </div>
    );
}
