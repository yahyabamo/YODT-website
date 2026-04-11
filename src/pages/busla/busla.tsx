'use client';

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Calendar, Library, ArrowLeft, Compass } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { SmartTopBar } from '@/components/layout/SmartTopBar';

const sections = [
    {
        title: 'المدارات',
        description: 'انضم إلى مجموعات القراءة الجماعية وتابع تقدمك',
        icon: BookOpen,
        href: '/busla/tracks',
        // Modern gradient accents instead of flat, heavy backgrounds
        gradient: 'from-red-500 to-red-700',
        shadow: 'shadow-red-500/30',
    },
    {
        title: 'الأنشطة',
        description: 'سجّل حضورك في الفعاليات والأنشطة الطلابية',
        icon: Calendar,
        href: '/busla/activities',
        gradient: 'from-slate-700 to-slate-900',
        shadow: 'shadow-slate-900/30',
    },
    {
        title: 'المكتبة',
        description: 'تصفح الكتب والمحاضرات والموارد التعليمية',
        icon: Library,
        href: '/busla/library',
        gradient: 'from-rose-700 to-rose-900',
        shadow: 'shadow-rose-900/30',
    },
];

export default function BuslaPage() {
    const [showSearch, setShowSearch] = useState(false);

    return (
        <div className="min-h-screen bg-background pb-24 font-sans relative overflow-hidden" dir="rtl">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-red-500/5 blur-[100px] rounded-full pointer-events-none" />

            <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/50">
                <div className="p-4 max-w-screen-xl mx-auto">
                    <SmartTopBar onOpenSearch={() => setShowSearch(true)} />
                </div>
            </header>

            <main className="px-4 py-8 max-w-lg mx-auto relative z-10">
                {/* Hero Section */}
                <div className="text-center mb-10 flex flex-col items-center">
                    <div className="relative group mb-5">
                        <div className="absolute inset-0 bg-red-600 blur-xl opacity-20 rounded-full transition-opacity group-hover:opacity-40" />
                        <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 shadow-xl shadow-red-900/20 transform transition-transform duration-300 hover:scale-105 hover:-translate-y-1 border border-white/10">
                            <Compass className="w-10 h-10 text-white" strokeWidth={1.5} />
                        </div>
                    </div>
                    <h1 className="text-3xl font-extrabold text-foreground mb-3 tracking-tight">
                        بوصلة
                    </h1>
                    <p className="text-muted-foreground text-base leading-relaxed max-w-[280px]">
                        منصتك للنمو الفكري والمشاركة في الحياة الطلابية
                    </p>
                </div>

                {/* Navigation Sections */}
                <div className="space-y-4">
                    {sections.map((section) => (
                        <Link key={section.href} to={section.href} className="block group outline-none">
                            <Card className="relative overflow-hidden border-border/40 shadow-sm transition-all duration-300 hover:shadow-md hover:border-border/80 hover:-translate-y-0.5 bg-card/50 backdrop-blur-sm">
                                {/* Subtle hover gradient overlay */}
                                <div className={`absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 bg-gradient-to-r ${section.gradient}`} />

                                <CardContent className="p-5 flex items-center gap-5">
                                    {/* Icon Container */}
                                    <div className={`flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${section.gradient} ${section.shadow} shadow-lg shrink-0 transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                                        <section.icon className="h-6 w-6 text-white" strokeWidth={2} />
                                    </div>

                                    {/* Text Content */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-foreground font-bold text-lg leading-tight mb-1 transition-colors group-hover:text-red-700 dark:group-hover:text-red-400">
                                            {section.title}
                                        </h3>
                                        <p className="text-muted-foreground text-sm leading-relaxed truncate whitespace-normal line-clamp-2">
                                            {section.description}
                                        </p>
                                    </div>

                                    {/* Action Arrow */}
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-secondary/50 shrink-0 transition-all duration-300 group-hover:-translate-x-1 group-hover:bg-secondary group-focus-visible:-translate-x-1 group-focus-visible:ring-2 ring-red-500 outline-none">
                                        <ArrowLeft className="h-5 w-5 text-foreground/70 group-hover:text-foreground transition-colors" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </main>

            <BottomNav />
        </div>
    );
}