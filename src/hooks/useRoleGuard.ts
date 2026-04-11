import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Functional area a staff member can be assigned to manage. */
export type Permission =
    | 'activity'
    | 'partners'
    | 'reels'
    | '3wn'
    | 'academy'
    | 'busla';

/** Hierarchy role stored in the `role` column. */
export type UserRole = 'user' | 'staff' | 'admin';

// Keep AdminRole as an alias for backward compatibility with any imports
export type AdminRole = UserRole;

// ─── Constants ────────────────────────────────────────────────────────────────

export const ALL_PERMISSIONS: Permission[] = [
    'activity', 'partners', 'reels', '3wn', 'academy', 'busla',
];

export const PERMISSION_LABELS: Record<Permission, string> = {
    activity: 'الفعاليات',
    partners: 'الشركاء والعروض',
    reels: 'الريلز',
    '3wn': 'عون',
    academy: 'الأكاديمية',
    busla: 'بوصلة',
};

export const PERMISSION_ICONS: Record<Permission, string> = {
    activity: '🎯',
    partners: '🤝',
    reels: '🎬',
    '3wn': '🛠',
    academy: '🎓',
    busla: '🧭',
};

export const PERMISSION_PATHS: Record<Permission, string> = {
    activity: '/admin/activities',
    partners: '/admin/partners',
    reels: '/admin/reels',
    '3wn': '/admin/3wnAdmin',
    academy: '/admin/academy',
    busla: '/admin/busla',
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
 * - staff with empty permissions → true for everything (full access)
 * - staff with explicit permissions → only their assigned areas
 * - user → always false
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
 * useRoleGuard(['activity']);          // only activity managers
 * useRoleGuard(['partners', 'activity']); // either one is fine
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
