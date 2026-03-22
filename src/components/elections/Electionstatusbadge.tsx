import type { ElectionStatus } from '../../lib/elections'

interface Props {
    status: ElectionStatus
    size?: 'sm' | 'md'
}

const config: Record<ElectionStatus, { label: string; bg: string; color: string; icon: string }> = {
    draft: { label: "مسودة", bg: "#f3f4f6", color: "#374151", icon: "📝" },
    nomination: { label: "الترشيحات مفتوحة", bg: "#dbeafe", color: "#2563eb", icon: "📅" },
    voting: { label: "التصويت مفتوح", bg: "#d1fae5", color: "#059669", icon: "✅" },
    closed: { label: "منتهية", bg: "#fee2e2", color: "#dc2626", icon: "🔒" },
}

export default function ElectionStatusBadge({ status, size = 'md' }: Props) {
    const cfg = config[status] || config.draft
    const padding = size === 'sm'
        ? 'px-2 py-0.5 text-[10px]'
        : 'px-2.5 py-1 text-[11px]'

    return (
        <span className={`inline-flex items-center gap-1 font-bold rounded-full whitespace-nowrap ${padding}`}
            style={{ background: cfg.bg, color: cfg.color }}
            dir="rtl"
        >
            <span className="text-[12px]">{cfg.icon}</span> {cfg.label}
        </span>
    )
}