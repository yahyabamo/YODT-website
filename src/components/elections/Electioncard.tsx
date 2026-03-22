import { Link } from 'react-router-dom'
import type { Election } from '../../lib/elections'
import { formatDeadline, canNominate, canVote, canViewResults } from '../../lib/elections'
import ElectionStatusBadge from './Electionstatusbadge'
import { Calendar, Users, ChevronLeft, Vote, BarChart2 } from 'lucide-react'
import { useState } from 'react'

interface Props {
    election: Election
    positionCount?: number
}

export default function ElectionCard({ election, positionCount }: Props) {
    const { id, title, description, status, nomination_end, voting_start, voting_end } = election
    const [hovered, setHovered] = useState(false)

    // Decide the primary CTA based on phase
    const cta = canVote(status)
        ? { label: 'صوّت الآن', href: `/elections/${id}/vote`, highlight: true }
        : canNominate(status)
            ? { label: 'رشّح نفسك', href: `/elections/${id}/nominate`, highlight: false }
            : canViewResults(status)
                ? { label: 'عرض النتائج', href: `/elections/${id}/results`, highlight: false }
                : { label: 'عرض التفاصيل', href: `/elections/${id}`, highlight: false }

    // Pick the relevant deadline to surface
    const deadline =
        status === 'nomination'
            ? { label: 'نهاية الترشيحات', value: formatDeadline(nomination_end) }
            : status === 'voting'
                ? { label: 'نهاية التصويت', value: formatDeadline(voting_end) }
                : status === 'draft'
                    ? { label: 'بداية التصويت', value: formatDeadline(voting_start) }
                    : null

    const getStatusColor = (s: string) => {
        if (s === 'voting') return "#059669" // emerald
        if (s === 'nomination') return "#2563eb" // blue
        if (s === 'draft') return "#d97706" // amber
        return "#9ca3af" // gray
    }

    const color = getStatusColor(status)

    return (
        <article
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            className="group relative flex flex-col bg-white rounded-3xl border-2 transition-all duration-300 overflow-hidden"
            style={{
                borderColor: hovered ? `${color}30` : '#e5e7eb',
                transform: hovered ? 'translateY(-8px)' : 'none',
                boxShadow: hovered ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
            }}
            dir="rtl"
        >
            <div className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                style={{ background: `radial-gradient(circle at 10% 15%, ${color}15 0%, transparent 55%)`, opacity: hovered ? 1 : 0.4 }} />

            <div className="absolute top-4 right-4 left-4 flex justify-end">
                <ElectionStatusBadge status={status} size="sm" />
            </div>

            <div className="p-7 pt-14 relative z-10 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-3 mb-2">
                    <Link
                        to={`/elections/${id}`}
                        className="block text-xl font-extrabold text-zinc-900 leading-snug hover:text-emerald-700 transition-colors line-clamp-2 m-0 cursor-pointer"
                    >
                        {title}
                    </Link>
                </div>

                {description && (
                    <p className="text-[13px] text-zinc-500 leading-relaxed line-clamp-2 min-h-[44px] m-0 mb-5">{description}</p>
                )}

                <div className="flex items-center gap-4 text-xs font-bold text-zinc-500 mb-6 bg-zinc-50/80 p-3 rounded-2xl border border-zinc-100">
                    {positionCount !== undefined && (
                        <span className="flex items-center gap-1.5">
                            <Users size={14} className="text-zinc-400" />
                            {positionCount} {positionCount === 1 ? 'منصب' : 'مناصب'}
                        </span>
                    )}
                    {deadline && (
                        <span className="flex items-center gap-1.5 border-r border-zinc-200 pr-4">
                            <Calendar size={14} className="text-zinc-400" />
                            {deadline.label}: <strong className="text-zinc-700 font-extrabold">{deadline.value}</strong>
                        </span>
                    )}
                </div>

                {/* Spacer */}
                <div className="flex-1" />

                {/* CTA */}
                <div className="flex items-center justify-between pt-1">
                    <Link
                        to={`/elections/${id}`}
                        className="text-xs font-bold text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
                    >
                        عرض الانتخاب
                    </Link>
                    <Link
                        to={cta.href}
                        className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-extrabold transition-all duration-300 cursor-pointer"
                        style={cta.highlight || status === 'voting' || status === 'nomination' || status === 'closed'
                            ? {
                                background: hovered ? color : `${color}15`,
                                color: hovered ? "#fff" : color,
                                transform: hovered ? "scale(1.02)" : "scale(1)"
                            }
                            : {
                                background: '#f4f4f5',
                                color: '#18181b',
                            }}
                    >
                        {cta.label}
                        <ChevronLeft size={16} />
                    </Link>
                </div>
            </div>
        </article>
    )
}