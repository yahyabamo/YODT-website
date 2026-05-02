'use client';

import { Link } from 'react-router-dom';
import { BookOpen, Calendar, Library, Users, BarChart2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/PageHeader';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRoleGuard } from '@/hooks/useRoleGuard';

interface Stats {
    tracks: number;
    activities: number;
    library: number;
    members: number;
}

const adminLinks = [
    { title: 'إدارة المدارات', desc: 'إضافة وتعديل وحذف المدارات', icon: BookOpen, href: '/admin/busla/tracks', color: 'text-red-700' },
    { title: 'إدارة الأنشطة', desc: 'إدارة الفعاليات والأنشطة', icon: Calendar, href: '/admin/busla/activities', color: 'text-gray-700' },
    { title: 'إدارة المكتبة', desc: 'رفع الكتب والمحتوى', icon: Library, href: '/admin/busla/library', color: 'text-red-900' },
    { title: 'مجتمع بوصلة', desc: 'إدارة مجتمع بوصلة (حذف رسائل وأعضاء)', icon: Users, href: '/admin/busla/community', color: 'text-blue-700' },
];

export default function BuslaAdminPage() {
    useRoleGuard(['busla']);
    const [stats, setStats] = useState<Stats>({ tracks: 0, activities: 0, library: 0, members: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            const [tracksRes, activitiesRes, libraryRes, membersRes] = await Promise.all([
                supabase.from('tracks').select('id', { count: 'exact', head: true }),
                supabase.from('activities2').select('id', { count: 'exact', head: true }),
                supabase.from('library_items').select('id', { count: 'exact', head: true }),
                supabase.from('track_members').select('id', { count: 'exact', head: true }),
            ]);
            setStats({
                tracks: tracksRes.count ?? 0,
                activities: activitiesRes.count ?? 0,
                library: libraryRes.count ?? 0,
                members: membersRes.count ?? 0,
            });
        };
        fetchStats();
    }, []);

    return (
        <div className="min-h-screen bg-background pb-10" dir="rtl">
            <PageHeader title="إدارة بوصلة" />

            <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                        { label: 'المدارات', value: stats.tracks, icon: BookOpen },
                        { label: 'الأنشطة', value: stats.activities, icon: Calendar },
                        { label: 'المكتبة', value: stats.library, icon: Library },
                        { label: 'الأعضاء', value: stats.members, icon: Users },
                    ].map((s) => (
                        <Card key={s.label} className="shadow-soft">
                            <CardContent className="p-3 flex items-center gap-2">
                                <div className="bg-red-700/10 p-2 rounded-lg">
                                    <s.icon className="h-4 w-4 text-red-700" />
                                </div>
                                <div>
                                    <p className="text-xl font-bold">{s.value}</p>
                                    <p className="text-xs text-muted-foreground">{s.label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Quick links */}
                <div className="space-y-3">
                    {adminLinks.map((link) => (
                        <Link key={link.href} to={link.href}>
                            <Card className="shadow-soft hover:shadow-md transition-all active:scale-[0.98]">
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="bg-muted p-3 rounded-xl">
                                        <link.icon className={`h-5 w-5 ${link.color}`} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-base">{link.title}</h3>
                                        <p className="text-sm text-muted-foreground">{link.desc}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
