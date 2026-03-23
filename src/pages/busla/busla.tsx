'use client';

import { Link } from 'react-router-dom';
import { BookOpen, Calendar, Library, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { SmartTopBar } from '@/components/layout/SmartTopBar';
import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
const sections = [
    {
        title: 'المدارات',
        description: 'انضم إلى مجموعات القراءة الجماعية وتابع تقدمك',
        icon: BookOpen,
        href: '/busla/tracks',
        bg: 'bg-red-700',
        iconBg: 'bg-red-800',
    },
    {
        title: 'الأنشطة',
        description: 'سجّل حضورك في الفعاليات والأنشطة الطلابية',
        icon: Calendar,
        href: '/busla/activities',
        bg: 'bg-gray-900',
        iconBg: 'bg-black',
    },
    {
        title: 'المكتبة',
        description: 'تصفح الكتب والمحاضرات والموارد التعليمية',
        icon: Library,
        href: '/busla/library',
        bg: 'bg-red-900',
        iconBg: 'bg-red-950',
    },
];

export default function BuslaPage() {
    const [showSearch, setShowSearch] = useState(false);
    return (
        <div className="min-h-screen bg-background pb-24" dir="rtl">
            <header className="sticky-header">
                <div className="p-4 max-w-screen-xl mx-auto">
                    <SmartTopBar onOpenSearch={() => setShowSearch(true)} />
                </div>
            </header>

            <div className="px-4 py-6 max-w-lg mx-auto">
                {/* Hero */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-700 mb-4 shadow-lg">
                        <span className="text-3xl">🧭</span>
                    </div>
                    <h1 className="text-2xl font-bold text-foreground mb-2">بوصلة</h1>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        منصتك للنمو الفكري والمشاركة في الحياة الطلابية
                    </p>
                </div>

                {/* Sections */}
                <div className="space-y-4">
                    {sections.map((section) => (
                        <Link key={section.href} to={section.href}>
                            <Card className="shadow-soft overflow-hidden hover:shadow-md transition-all duration-200 active:scale-[0.98]">
                                <CardContent className="p-0">
                                    <div className={`${section.bg} p-5 flex items-center gap-4`}>
                                        <div className={`${section.iconBg} p-3 rounded-xl shrink-0`}>
                                            <section.icon className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-white font-bold text-lg leading-tight">
                                                {section.title}
                                            </h3>
                                            <p className="text-white/70 text-sm mt-0.5 leading-relaxed">
                                                {section.description}
                                            </p>
                                        </div>
                                        <ArrowRight className="h-5 w-5 text-white/50 shrink-0 rotate-180" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>

            <BottomNav />
        </div>
    );
}