'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
    adminCreateActivity,
    adminDeleteActivity,
    adminUpdateActivityStatus,
} from '@/lib/queries';
import { supabase } from '@/integrations/supabase/client';
import type { Activity2 } from '@/integrations/supabase/types';

const STATUS_LABELS = {
    upcoming: 'قادم',
    ongoing: 'جاري الآن',
    completed: 'مكتمل',
};

const STATUS_COLORS = {
    upcoming: 'bg-red-100 text-red-700',
    ongoing: 'bg-green-100 text-green-700',
    completed: 'bg-gray-100 text-gray-600',
};

const EMPTY_FORM = {
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    max_attendees: 50,
    points: 0,
    status: 'upcoming' as const,
};

export default function AdminActivitiesPage() {
    const [activities, setActivities] = useState<Activity2[]>([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const fetchActivities = async () => {
        setLoading(true);
        const { data } = await supabase
            .from('activities2')
            .select('*')
            .order('created_at', { ascending: false });
        setActivities((data as Activity2[]) ?? []);
        setLoading(false);
    };

    useEffect(() => {
        fetchActivities();
    }, []);

    const handleCreate = async () => {
        if (!form.title.trim()) return toast.error('أدخل عنوان النشاط');
        setSaving(true);
        const { error } = await adminCreateActivity({
            title: form.title.trim(),
            description: form.description.trim() || null,
            date: form.date || null,
            time: form.time || null,
            location: form.location.trim() || null,
            max_attendees: Number(form.max_attendees),
            points: Number(form.points),
            status: form.status,
        });
        if (error) {
            toast.error('فشل إنشاء النشاط: ' + error);
        } else {
            toast.success('تم إنشاء النشاط');
            setForm(EMPTY_FORM);
            setShowForm(false);
            fetchActivities();
        }
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('هل أنت متأكد من حذف هذا النشاط؟')) return;
        const { error } = await adminDeleteActivity(id);
        if (error) toast.error('فشل الحذف');
        else {
            toast.success('تم الحذف');
            fetchActivities();
        }
    };

    const handleStatusChange = async (
        id: string,
        status: 'upcoming' | 'ongoing' | 'completed'
    ) => {
        const { error } = await adminUpdateActivityStatus(id, status);
        if (error) toast.error('فشل تحديث الحالة');
        else {
            fetchActivities();
        }
    };

    const setField = (field: string, value: string | number) =>
        setForm((prev) => ({ ...prev, [field]: value }));

    return (
        <div className="min-h-screen bg-background pb-10" dir="rtl">
            <PageHeader title="إدارة الأنشطة" />

            <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
                {/* Add button */}
                <Button
                    className="w-full"
                    onClick={() => setShowForm((v) => !v)}
                    variant={showForm ? 'outline' : 'default'}
                >
                    <Plus className="h-4 w-4 ml-1" />
                    {showForm ? 'إلغاء' : 'إضافة نشاط جديد'}
                </Button>

                {/* Create Form */}
                {showForm && (
                    <Card className="shadow-soft">
                        <CardContent className="p-4 space-y-3">
                            <h2 className="font-bold">نشاط جديد</h2>
                            <input
                                placeholder="العنوان *"
                                value={form.title}
                                onChange={(e) => setField('title', e.target.value)}
                                className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
                            />
                            <textarea
                                placeholder="الوصف (اختياري)"
                                value={form.description}
                                onChange={(e) => setField('description', e.target.value)}
                                rows={2}
                                className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-700"
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="date"
                                    value={form.date}
                                    onChange={(e) => setField('date', e.target.value)}
                                    className="bg-muted rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
                                />
                                <input
                                    type="time"
                                    value={form.time}
                                    onChange={(e) => setField('time', e.target.value)}
                                    className="bg-muted rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
                                />
                            </div>
                            <input
                                placeholder="الموقع"
                                value={form.location}
                                onChange={(e) => setField('location', e.target.value)}
                                className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-xs text-muted-foreground block mb-1">الحد الأقصى</label>
                                    <input
                                        type="number"
                                        min={1}
                                        value={form.max_attendees}
                                        onChange={(e) => setField('max_attendees', e.target.value)}
                                        className="w-full bg-muted rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground block mb-1">النقاط</label>
                                    <input
                                        type="number"
                                        min={0}
                                        value={form.points}
                                        onChange={(e) => setField('points', e.target.value)}
                                        className="w-full bg-muted rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
                                    />
                                </div>
                            </div>
                            <select
                                value={form.status}
                                onChange={(e) => setField('status', e.target.value)}
                                className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-700"
                            >
                                <option value="upcoming">قادم</option>
                                <option value="ongoing">جاري الآن</option>
                                <option value="completed">مكتمل</option>
                            </select>
                            <Button
                                className="w-full"
                                onClick={handleCreate}
                                disabled={saving || !form.title.trim()}
                            >
                                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'حفظ النشاط'}
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Activities list */}
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-28 bg-muted rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {activities.map((activity) => (
                            <Card key={activity.id} className="shadow-soft">
                                <CardContent className="p-4 space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="font-semibold text-sm">{activity.title}</h3>
                                                <span
                                                    className={cn(
                                                        'text-xs px-2 py-0.5 rounded-full font-medium',
                                                        STATUS_COLORS[activity.status]
                                                    )}
                                                >
                                                    {STATUS_LABELS[activity.status]}
                                                </span>
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-0.5 space-y-0.5">
                                                {activity.date && <p>📅 {activity.date} {activity.time && `• ${activity.time}`}</p>}
                                                {activity.location && <p>📍 {activity.location}</p>}
                                                <p>👥 حتى {activity.max_attendees} مشارك • ⭐ {activity.points} نقطة</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(activity.id)}
                                            className="text-muted-foreground hover:text-destructive shrink-0"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>

                                    {/* Status change */}
                                    <div className="flex gap-1">
                                        {(['upcoming', 'ongoing', 'completed'] as const).map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => handleStatusChange(activity.id, s)}
                                                className={cn(
                                                    'flex-1 text-xs py-1.5 rounded-lg transition-all',
                                                    activity.status === s
                                                        ? 'bg-gray-900 text-white'
                                                        : 'bg-muted text-muted-foreground hover:bg-muted/70'
                                                )}
                                            >
                                                {STATUS_LABELS[s]}
                                            </button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                        {activities.length === 0 && (
                            <p className="text-center text-muted-foreground py-8">لا توجد أنشطة بعد</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}