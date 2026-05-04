import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Functional area a staff member can be assigned to manage.
 *
 * MODULE PERMISSIONS (whole group in one key):
 *   - 'store'            → store overview, products, categories, orders
 *   - 'student-projects' → submissions, projects, categories, overview
 *
 * INDIVIDUAL PERMISSIONS (fine-grained):
 *   External Page Management:
 *     - 'homepage' | 'info-cms' | 'published'
 *   Union Projects (each separate):
 *     - 'activity' | '3wn' | 'busla' | 'reels' | 'academy'
 *   Engagement:
 *     - 'chat' | 'weekly-engagement' | 'requests'
 *   Relations Management:
 *     - 'partners' | 'relations' | 'offers'
 *   Reception System:
 *     - 'arrivals' | 'volunteers'
 *
 * ADMIN-ONLY (never assignable):
 *   - سجل النقاط, كادر الاتحاد والنظام (handled by adminOnly flag in sidebar)
 */
export type Permission =
    // ── Module permissions (grouped) ──
    | 'store'
    | 'student-projects'
    // ── External Page Management ──
    | 'homepage'
    | 'info-cms'
    | 'published'
    // ── Union Projects ──
    | 'activity'
    | '3wn'
    | 'busla'
    | 'reels'
    | 'academy'
    // ── Engagement ──
    | 'chat'
    | 'weekly-engagement'
    | 'requests'
    // ── Relations Management ──
    | 'partners'
    | 'relations'
    | 'offers'
    // ── Reception System ──
    | 'arrivals'
    | 'volunteers';

/** Hierarchy role stored in the `role` column. */
export type UserRole = 'user' | 'staff' | 'admin';

// Keep AdminRole as an alias for backward compatibility with any imports
export type AdminRole = UserRole;

// ─── Constants ────────────────────────────────────────────────────────────────

/** All permissions that can be assigned to a staff member. */
export const ALL_PERMISSIONS: Permission[] = [
    // Modules
    'store',
    'student-projects',
    // External Page Management
    'homepage',
    'info-cms',
    'published',
    // Union Projects
    'activity',
    '3wn',
    'busla',
    'reels',
    'academy',
    // Engagement
    'chat',
    'weekly-engagement',
    'requests',
    // Relations Management
    'partners',
    'relations',
    'offers',
    // Reception System
    'arrivals',
    'volunteers',
];

/**
 * Permission groups used for the UI in UserAdmin.tsx.
 * Each group has a label, icon, and list of permissions.
 */
export interface PermissionGroup {
    id: string;
    label: string;
    icon: string;
    description?: string;
    permissions: Permission[];
    isModule?: boolean; // true = one key grants the whole group
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
    {
        id: 'modules',
        label: 'الوحدات الكاملة',
        icon: '📦',
        description: 'صلاحية واحدة تمنح وصولاً لجميع أقسام الوحدة',
        isModule: true,
        permissions: ['store', 'student-projects'],
    },
    {
        id: 'external-pages',
        label: 'إدارة الصفحة الخارجية',
        icon: '🌐',
        permissions: ['homepage', 'info-cms', 'published'],
    },
    {
        id: 'union-projects',
        label: 'مشاريع الاتحاد',
        icon: '🏗️',
        permissions: ['activity', '3wn', 'busla', 'reels', 'academy'],
    },
    {
        id: 'engagement',
        label: 'التفاعل',
        icon: '💬',
        permissions: ['chat', 'weekly-engagement', 'requests'],
    },
    {
        id: 'relations',
        label: 'إدارة العلاقات',
        icon: '🤝',
        permissions: ['partners', 'relations', 'offers'],
    },
    {
        id: 'reception',
        label: 'نظام الاستقبال',
        icon: '✈️',
        permissions: ['arrivals', 'volunteers'],
    },
];

export const PERMISSION_LABELS: Record<Permission, string> = {
    // Modules
    store: 'المتجر (كامل)',
    'student-projects': 'مشاريع الطلاب (كامل)',
    // External Page Management
    homepage: 'مدير الصفحة الرئيسية',
    'info-cms': 'إدارة المحتوى',
    published: 'المنشورات',
    // Union Projects
    activity: 'الفعاليات',
    '3wn': 'عون',
    busla: 'بوصلة',
    reels: 'الريلز',
    academy: 'الأكاديمية',
    // Engagement
    chat: 'إدارة الدردشة',
    'weekly-engagement': 'التفاعل الأسبوعي',
    requests: 'الاقتراحات',
    // Relations Management
    partners: 'الشركاء',
    relations: 'العلاقات',
    offers: 'العروض',
    // Reception System
    arrivals: 'طلبات الوصول',
    volunteers: 'متطوعو الاستقبال',
};

export const PERMISSION_ICONS: Record<Permission, string> = {
    // Modules
    store: '🛒',
    'student-projects': '🎓',
    // External Page Management
    homepage: '🏠',
    'info-cms': '📄',
    published: '📢',
    // Union Projects
    activity: '🎯',
    '3wn': '🛠',
    busla: '🧭',
    reels: '🎬',
    academy: '📚',
    // Engagement
    chat: '💬',
    'weekly-engagement': '📈',
    requests: '📬',
    // Relations Management
    partners: '🤝',
    relations: '🔗',
    offers: '🏷️',
    // Reception System
    arrivals: '🛬',
    volunteers: '🙋',
};

export const PERMISSION_PATHS: Record<Permission, string> = {
    store: '/admin/store',
    'student-projects': '/admin/student-projects',
    homepage: '/admin/homepage',
    'info-cms': '/admin/info-cms',
    published: '/admin/publish',
    activity: '/admin/activities',
    '3wn': '/admin/3wnAdmin',
    busla: '/admin/busla',
    reels: '/admin/reels',
    academy: '/admin/academy',
    chat: '/admin/engagement/chat',
    'weekly-engagement': '/admin/engagement/weekly',
    requests: '/admin/requests',
    partners: '/admin/partners',
    relations: '/admin/relations',
    offers: '/admin/offers',
    arrivals: '/admin/arrivals',
    volunteers: '/admin/arrivals/volunteers',
};

/** Role display labels */
export const ROLE_LABELS: Record<UserRole, string> = {
    user: 'عضو',
    staff: 'مسؤول',
    admin: 'مسؤول رئيسي',
};

/** All role options for dropdowns (kept for backward compat) */
export const ALL_ROLES: UserRole[] = ['user', 'staff', 'admin'];

// ─── Core access helper ───────────────────────────────────────────────────────

/**
 * Returns true if the given profile can access the specified functional permission.
 *
 * Rules:
 * - admin → always true
 * - staff with empty permissions → true for everything (full access, backward compat)
 * - staff with explicit permissions → only their assigned areas
 * - user → always false
 *
 * Module semantics: checking 'store' returns true if 'store' is in the perms array.
 * Sub-pages of a module (e.g. 'store/orders') use the module key itself.
 */
export function canAccess(
    profile: { role?: string; permissions?: string[] } | null | undefined,
    permission: Permission,
): boolean {
    if (!profile) return false;
    if (profile.role === 'admin') return true;
    if (profile.role !== 'staff') return false;

    const perms = profile.permissions ?? [];
    // Staff with zero assigned permissions → full access (backward-compatible)
    if (perms.length === 0) return true;

    return perms.includes(permission);
}

/**
 * Returns true if the profile can enter the admin panel at all.
 */
export function isAdminLevel(profile: { role?: string } | null | undefined): boolean {
    return profile?.role === 'admin' || profile?.role === 'staff';
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useRoleGuard — enforce permission-based access at the top of any admin page.
 *
 * Pass the permission(s) required for this page. If the user has none of them,
 * they're redirected to `/admin` (the dashboard).
 *
 * @example
 * useRoleGuard(['activity']);                     // only activity managers
 * useRoleGuard(['store']);                         // store module access
 * useRoleGuard(['partners', 'relations', 'offers']); // any relations perm
 */
export function useRoleGuard(requiredPermissions: Permission[]) {
    const { profile, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (loading) return;
        if (!profile) return;

        // Admin always passes
        if (profile.role === 'admin') return;

        // Non-staff are never allowed in admin
        if (profile.role !== 'staff') {
            navigate('/admin', { replace: true });
            return;
        }

        // Staff: check if they have at least one of the required permissions
        const hasAccess = requiredPermissions.some(p => canAccess(profile, p));
        if (!hasAccess) {
            navigate('/admin', { replace: true });
        }
    }, [profile, loading, navigate]);
}
