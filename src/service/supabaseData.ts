// src/lib/supabase.js
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";



// ── Auth Helpers ──────────────────────────────────────────────

export async function getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
}

export async function getProfile(userId) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
    if (error) throw error
    return data
}


// -- دوال الكادر (Cadre) --
export async function fetchCadres() {
    const { data, error } = await supabase
        .from('cadre')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
}

export async function upsertCadre(payload: any) {
    const { data, error } = await supabase
        .from('cadre')
        .upsert(payload)
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function deleteCadre(id: string) {
    const { error } = await supabase
        .from('cadre')
        .delete()
        .eq('id', id);
    if (error) throw error;
    return true;
}
export async function isAdmin(userId) {
    const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()
    return data?.role === 'admin'
}

export async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
}

// ── Users ─────────────────────────────────────────────────────

export async function fetchUsers({ page = 0, pageSize = 20, search = '' } = {}) {
    let query = supabase
        .from('profiles')
        .select('id, full_name, email, role, permissions, status, total_points, university, faculty, avatar_url, created_at, job_title, gender', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1)

    if (search) {
        query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    const { data, error, count } = await query
    if (error) throw error
    return { data, count }
}

export async function updateUserStatus(userId, status) {
    const { error } = await supabase
        .from('profiles')
        .update({ status })
        .eq('id', userId)
    if (error) throw error
}

export async function updateUserRole(userId, role) {
    const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId)
    if (error) throw error
}

export async function deleteUser(id: string) {
    console.log("Deleting ID:", id);
    const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);
    if (error) throw error;
}

// ── Points ─────────────────────────────────────────────────────

export async function updateUserPoints({ userId, changeAmount, reason, reasonType, changedBy, activityId = null }) {
    const { error } = await supabase.rpc('update_user_points', {
        p_user_id: userId,
        p_change_amount: changeAmount,
        p_reason: reason,
        p_reason_type: reasonType,
        p_changed_by: changedBy,
        p_activity_id: activityId
    })
    if (error) throw error
}

export async function fetchPointsHistory({ userId = null, page = 0, pageSize = 20 } = {}) {
    let query = supabase
        .from('points_history')
        .select('*, profiles!user_id(full_name, email)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1)

    if (userId) query = query.eq('user_id', userId)

    const { data, error, count } = await query
    if (error) throw error
    return { data, count }
}

// ── Activities ────────────────────────────────────────────────

export async function fetchActivities({ page = 0, pageSize = 20 } = {}) {
    const { data, error, count } = await supabase
        .from('activities')
        .select('*, activity_registrations(count)', { count: 'exact' })
        .order('status', { ascending: true })
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1)
    if (error) throw error
    return { data, count }
}

export async function upsertActivity(activity) {
    const { data, error } = await supabase
        .from('activities')
        .upsert(activity)
        .select()
        .single()
    if (error) throw error
    return data
}

export async function deleteActivity(id: string) {
    console.log("Deleting ID:", id);
    // Delete registrations first
    await supabase.from('activity_registrations').delete().eq('activity_id', id)

    const { error } = await supabase.from('activities').delete().eq('id', id)
    if (error) throw error
}

export async function checkRegistration(activityId: string, userId: string) {
    const { data, error } = await supabase
        .from('activity_registrations')
        .select('id')
        .eq('activity_id', activityId)
        .eq('user_id', userId)
        .maybeSingle();
    if (error) throw error;
    return !!data;
}

export async function fetchUserRegistrations(userId: string) {
    const { data, error } = await supabase
        .from('activity_registrations')
        .select('activity_id')
        .eq('user_id', userId);
    if (error) throw error;
    return data.map(r => r.activity_id);
}

export async function registerForActivity(activityId: string, userId: string) {
    const { data, error } = await supabase
        .from('activity_registrations')
        .insert({ activity_id: activityId, user_id: userId })
        .select()
        .single();
    if (error) throw error;
    return data;
}

// In your supabaseData.ts or wherever you keep Supabase queries
export const fetchActivityAttendees = async (activityId: string) => {
    const { data, error } = await supabase
        .from('activity_registrations')
        .select(`
      created_at,
      profiles (
        full_name,
        university,
        avatar_url,
        gender
      )
    `)
        .eq('activity_id', activityId)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
};

// Inside your service file
export const recordAttendance = async (qrToken: string, activityId: string) => {
    const { data, error } = await supabase.rpc('record_attendance', {
        target_qr_token: qrToken,
        target_activity_id: activityId
    });

    // If there's a network error, return a custom object
    if (error) return { error: true, message: error.message };

    return data;
};

// ── Partners ──────────────────────────────────────────────────

export async function fetchPartners() {
    const { data, error } = await supabase
        .from('partners')
        .select('*, offers(count)')
        .order('status', { ascending: true })
        .order('created_at', { ascending: false })
    if (error) throw error
    return data
}

export async function upsertPartner(partner) {
    const { data, error } = await supabase
        .from('partners')
        .upsert(partner)
        .select()
        .single()
    if (error) throw error
    return data
}

export async function deletePartner(id: string) {
    console.log("Deleting ID:", id);
    // Delete associated offers first to prevent foreign key errors
    await supabase.from('offers').delete().eq('partner_id', id)

    const { error } = await supabase.from('partners').delete().eq('id', id)
    if (error) throw error
}

// ── Partner Inquiries ──────────────────────────────────────────

export async function submitPartnerInquiry(payload: any) {
    console.log("Submitting Partner Inquiry:", payload);
    const { error } = await supabase
        .from('partner_inquiries')
        .insert([{
            institution_name: payload.institutionName,
            contact_person: payload.contactPerson,
            email: payload.email,
            phone: payload.phone,
            inquiry_type: payload.inquiryType,
            message: payload.message,
            status: 'pending'
        }]);
    
    if (error) {
        console.error("Submit Error:", error);
        throw error;
    }
    console.log("Submit Success");
    return true;
}

export async function fetchPartnerInquiries() {
    const { data, error } = await supabase
        .from('partner_inquiries')
        .select('*')
        .order('created_at', { ascending: false });
    if (error) {
        console.error("Fetch Inquiries Error:", error);
        throw error;
    }
    console.log("Fetched Inquiries:", data);
    return data;
}

export async function updatePartnerInquiryStatus(id: string, status: string) {
    const { data, error } = await supabase
        .from('partner_inquiries')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

// ── Offers ────────────────────────────────────────────────────

export async function fetchOffers() {
    const { data, error } = await (supabase as any)
        .from('offers')
        .select('*, partners(id, name, name_ar, logo_url, website, category, city)')
        .order('status', { ascending: true })
        .order('created_at', { ascending: false })
    if (error) throw error
    return data
}

export async function upsertOffer(offer) {
    const { data, error } = await supabase
        .from('offers')
        .upsert(offer)
        .select()
        .single()
    if (error) throw error
    return data
}

// export async function deleteOffer(id) {
//     const { error } = await supabase.from('offers').delete().eq('id', id)
//     if (error) throw error
// }

export async function deleteOffer(id: string) {
    console.log("Deleting ID:", id);
    // Ensure 'id' is a string and matches the UUID format in Supabase
    const { error } = await supabase
        .from('offers')
        .delete()
        .eq('id', id);

    if (error) {
        console.error("Delete Error:", error);
        throw error;
    }
}
// ── Reels ─────────────────────────────────────────────────────

export async function toggleLike(reelId: string, userId: string) {
    // Check if already liked
    const { data: existingLike } = await supabase
        .from('reel_likes')
        .select('id')
        .eq('reel_id', reelId)
        .eq('user_id', userId)
        .single();

    if (existingLike) {
        const { error } = await supabase
            .from('reel_likes')
            .delete()
            .eq('id', existingLike.id);
        if (error) throw error;
        return { liked: false };
    } else {
        const { error } = await supabase
            .from('reel_likes')
            .insert({ reel_id: reelId, user_id: userId });
        if (error) throw error;
        return { liked: true };
    }
}

export async function addComment(reelId: string, userId: string, content: string) {
    const { data, error } = await supabase
        .from('reel_comments')
        .insert({ reel_id: reelId, user_id: userId, content })
        .select(`
            *,
            profiles:user_id (full_name, avatar_url)
        `)
        .single();
    if (error) throw error;
    return data;
}

export async function fetchComments(reelId: string) {
    const { data, error } = await supabase
        .from('reel_comments')
        .select(`
            *,
            profiles:user_id (full_name, avatar_url)
        `)
        .eq('reel_id', reelId)
        .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
}

export async function deleteComment(commentId: string) {
    const { error } = await supabase
        .from('reel_comments')
        .delete()
        .eq('id', commentId);
    if (error) throw error;
}

export async function incrementViewCount(reelId: string) {
    // We'll use a simple update here, ideally this would be an RPC for concurrency
    const { data: reel } = await supabase
        .from('reels')
        .select('views')
        .eq('id', reelId)
        .single();

    if (reel) {
        const { error } = await supabase
            .from('reels')
            .update({ views: (reel.views || 0) + 1 })
            .eq('id', reelId);
        if (error) throw error;
    }
}

export async function fetchReelStats(reelId: string, userId?: string) {
    const [likes, comments, userLike] = await Promise.all([
        supabase.from('reel_likes').select('id', { count: 'exact', head: true }).eq('reel_id', reelId),
        supabase.from('reel_comments').select('id', { count: 'exact', head: true }).eq('reel_id', reelId),
        userId ? supabase.from('reel_likes').select('id').eq('reel_id', reelId).eq('user_id', userId).single() : Promise.resolve({ data: null })
    ]);

    return {
        likes: likes.count || 0,
        comments: comments.count || 0,
        isLiked: !!userLike.data
    };
}

export async function fetchReels({ page = 0, pageSize = 20 } = {}) {
    const { data, error, count } = await supabase
        .from('reels')
        .select('*, reel_likes(count), reel_comments(count)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1)
    if (error) throw error
    return { data, count }
}

export async function upsertReel(reel) {
    const { data, error } = await supabase
        .from('reels')
        .upsert(reel)
        .select()
        .single()
    if (error) throw error
    return data
}

export async function deleteReel(id) {
    const { error } = await supabase.from('reels').delete().eq('id', id)
    if (error) throw error
}


// --- Social Features ---
export const toggleLikeReel = async (reelId: string, userId: string) => {
    // We use a 'upsert' or a logic to delete if exists, insert if not
    const { data: existing } = await supabase
        .from('reel_likes')
        .select('*')
        .eq('reel_id', reelId)
        .eq('user_id', userId)
        .maybeSingle();

    if (existing) {
        return await supabase.from('reel_likes').delete().eq('id', existing.id);
    } else {
        return await supabase.from('reel_likes').insert({ reel_id: reelId, user_id: userId });
    }
};

export const fetchReelComments = async (reelId: string) => {
    return await supabase
        .from('reel_comments')
        .select('*, profiles(full_name, avatar_url)')
        .eq('reel_id', reelId)
        .order('created_at', { ascending: false });
};

export const postComment = async (reelId: string, userId: string, content: string) => {
    return await supabase.from('reel_comments').insert({
        reel_id: reelId,
        user_id: userId,
        content: content
    });
};
// ── Dashboard Stats ───────────────────────────────────────────

export async function fetchDashboardStats() {
    const [users, activities, offers, recentUsers, recentPoints] = await Promise.all([
        supabase.from('profiles').select('id, status, total_points, created_at'),
        supabase.from('activities').select('id, status'),
        supabase.from('offers').select('id, status'),
        supabase.from('profiles').select('id, full_name, email, total_points, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('points_history').select('*, profiles!user_id(full_name)').order('created_at', { ascending: false }).limit(5)
    ])

    const totalUsers = users.data?.length || 0
    const activeMembers = users.data?.filter(u => u.status === 'active').length || 0
    const totalActivities = activities.data?.length || 0
    const activeOffers = offers.data?.filter(o => o.status === 'active').length || 0
    const totalPoints = users.data?.reduce((sum, u) => sum + (u.total_points || 0), 0) || 0

    return {
        totalUsers,
        activeMembers,
        totalActivities,
        activeOffers,
        totalPoints,
        recentUsers: recentUsers.data || [],
        recentPoints: recentPoints.data || []
    }
}

export async function fetchLatestUpdates() {
    const [activities, offers, reels] = await Promise.all([
        supabase.from('activities').select('id, title, created_at').order('created_at', { ascending: false }).limit(3),
        supabase.from('offers').select('id, title, created_at').order('created_at', { ascending: false }).limit(3),
        supabase.from('reels').select('id, title, created_at').order('created_at', { ascending: false }).limit(3),
    ]);

    const combined = [
        ...(activities.data || []).map(item => ({ ...item, type: 'activity' as const })),
        ...(offers.data || []).map(item => ({ ...item, type: 'offer' as const })),
        ...(reels.data || []).map(item => ({ ...item, type: 'reel' as const }))
    ];

    combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return combined.slice(0, 3);
}

// ==========================================
// 3WN SERVICES (عون) - ADMIN FUNCTIONS
// ==========================================

/** Fetch all services ordered by sort_order */
export async function fetchServices() {
    const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("sort_order", { ascending: true });
    if (error) throw error;
    return data;
}

/** Fetch only active/available services (for student page) */
export async function fetchActiveServices() {
    const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("is_available", true)
        .order("sort_order", { ascending: true });
    if (error) throw error;
    return data;
}

/**
 * Insert or update a service.
 * Pass `id` to update, omit to insert.
 */
export async function upsertService(payload: {
    id?: string;
    title: string;
    description?: string;
    icon?: string;
    color?: string;
    category?: string;
    is_available?: boolean;
    sort_order?: number;
}) {
    const { id, ...fields } = payload;
    if (id) {
        const { data, error } = await supabase
            .from("services")
            .update(fields)
            .eq("id", id)
            .select()
            .single();
        if (error) throw error;
        return data;
    } else {
        const { data, error } = await supabase
            .from("services")
            .insert(fields)
            .select()
            .single();
        if (error) throw error;
        return data;
    }
}

/** Delete a service (cascades to its requests) */
export async function deleteService(id: string) {
    const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", id);
    if (error) throw error;
}

// ══════════════════════════════════════════════════════
// SERVICE REQUESTS  (for admin: 3wnAdmin.tsx)
// ══════════════════════════════════════════════════════

/**
 * Fetch all service requests, joined with the parent service's title, icon, color.
 * Ordered newest first.
 */
export async function fetchServiceRequests() {
    const { data, error } = await supabase
        .from("service_requests")
        .select("*, services(title, icon, color)")
        .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
}

/**
 * Update status (and optional admin_notes) on a request.
 * Used by the admin when reviewing a student's application.
 */
export async function updateServiceRequestStatus(
    id: string,
    status: "pending" | "approved" | "rejected" | "completed",
    admin_notes?: string
) {
    const { data, error } = await supabase
        .from("service_requests")
        .update({ status, admin_notes: admin_notes ?? null })
        .eq("id", id)
        .select()
        .single();
    if (error) throw error;
    return data;
}

/**
 * Submit a new service request.
 * Called from the student-facing page (3wn.tsx) after Cloudinary upload.
 */
export async function submitServiceRequest(payload: {
    service_id: string;
    student_name: string;
    student_id_number: string;
    phone: string;
    email?: string;
    college?: string;
    academic_year?: string;
    notes?: string;
    student_card_url?: string;
}) {
    const { data, error } = await supabase
        .from("service_requests")
        .insert({ ...payload, status: "pending" })
        .select()
        .single();
    if (error) throw error;
    return data;
}

// ==========================================
// CENTRALIZED REQUESTS SYSTEM
// ==========================================

export interface UnifiedRequest {
    id: string;
    source_table: "suggestions" | "service_requests" | "project_submissions" | "job_applications" | "store_orders";
    type: string;
    title: string | null;
    message: string | null;
    status: string;
    admin_response: string | null;
    responded_at: string | null;
    last_updated_at: string;
    created_at: string;
    tracking_code: string | null;
    user_id: string | null;
    contact_email?: string | null;
    contact_phone?: string | null;
    contact_name?: string | null;
    source_page?: string | null;
    user_name?: string | null;
    user_phone?: string | null;
    order_number?: string | null;
}

export async function submitSuggestion(payload: {
    type: string;
    message: string;
    status?: string;
    user_id?: string;
    contact_email?: string;
    contact_phone?: string;
    contact_name?: string;
    source_page?: string;
    tracking_code?: string;
}) {
    const { data, error } = await supabase
        .from("suggestions")
        .insert(payload)
        .select()
        .single();
    if (error) throw error;
    return data;
}

/**
 * Fetch ALL suggestions for the admin panel — bypasses per-user RLS filter.
 * Requires the admin Supabase policy "Allow admins to read all suggestions" to be present.
 */
export async function fetchSuggestions(): Promise<UnifiedRequest[]> {
    const TYPE_LABELS: Record<string, string> = {
        suggestion: 'اقتراح',
        problem: 'مشكلة',
        question: 'استفسار',
        // Legacy fallback for old 'idea' rows
        idea: 'استفسار',
    };

    const { data, error } = await supabase
        .from('suggestions')
        .select('*, profiles(full_name, phone)')
        .order('created_at', { ascending: false })
        .limit(500);

    if (error) {
        console.error('[fetchSuggestions] error:', error);
        throw error;
    }

    return (data || []).map((s: any) => ({
        id: s.id,
        source_table: 'suggestions' as const,
        type: s.type,
        // Human-readable label: 'suggestion'|'problem'|'question' (plus legacy 'idea')
        title: TYPE_LABELS[s.type] || s.type || null,
        message: s.message,
        status: s.status || 'NEW',
        admin_response: s.admin_response || null,
        responded_at: s.responded_at || null,
        last_updated_at: s.last_updated_at || s.updated_at || s.created_at,
        created_at: s.created_at,
        tracking_code: s.tracking_code || null,
        user_id: s.user_id || null,
        contact_email: s.contact_email || null,
        contact_phone: s.contact_phone || null,
        contact_name: s.contact_name || null,
        source_page: s.source_page || null,
        user_name: s.profiles?.full_name || null,
        user_phone: s.profiles?.phone || null,
    }));
}

export async function linkGuestRequests(userId: string, email?: string, phone?: string) {
    if (!email && !phone) return;

    const updates = [];
    if (email) {
        updates.push(supabase.from("suggestions").update({ user_id: userId }).eq("contact_email", email).is("user_id", null));
        updates.push(supabase.from("service_requests").update({ user_id: userId }).eq("email", email).is("user_id", null));
        updates.push(supabase.from("job_applications").update({ user_id: userId }).eq("email", email).is("user_id", null));
    }
    if (phone) {
        updates.push(supabase.from("suggestions").update({ user_id: userId }).eq("contact_phone", phone).is("user_id", null));
        updates.push(supabase.from("service_requests").update({ user_id: userId }).eq("phone", phone).is("user_id", null));
        updates.push(supabase.from("job_applications").update({ user_id: userId }).eq("phone", phone).is("user_id", null));
    }

    await Promise.all(updates);
}

export async function fetchUserRequests(params: { userId?: string, email?: string, phone?: string, trackingCode?: string }) {
    const allRequests: UnifiedRequest[] = [];

    const buildOr = () => {
        const conditions = [];
        if (params.userId) conditions.push(`user_id.eq.${params.userId}`);
        if (params.trackingCode) conditions.push(`tracking_code.eq.${params.trackingCode}`);
        return conditions.join(",");
    };

    const buildEmailPhoneOr = (emailField: string, phoneField: string) => {
        const conditions = [];
        if (params.userId) conditions.push(`user_id.eq.${params.userId}`);
        if (params.trackingCode) conditions.push(`tracking_code.eq.${params.trackingCode}`);
        if (params.email) conditions.push(`${emailField}.eq.${params.email}`);
        if (params.phone) conditions.push(`${phoneField}.eq.${params.phone}`);
        return conditions.join(",");
    };

    try {
        const suggOr = buildEmailPhoneOr("contact_email", "contact_phone");
        if (suggOr) {
            const { data: suggestions } = await supabase.from("suggestions").select("*").or(suggOr);
            if (suggestions) {
                allRequests.push(...suggestions.map(s => ({
                    id: s.id,
                    source_table: "suggestions" as const,
                    type: s.type,
                    title: s.type || null,
                    message: s.message,
                    status: s.status,
                    admin_response: s.admin_response,
                    responded_at: s.responded_at,
                    last_updated_at: s.last_updated_at || s.updated_at || s.created_at,
                    created_at: s.created_at,
                    tracking_code: s.tracking_code,
                    user_id: s.user_id,
                    contact_email: s.contact_email,
                    contact_phone: s.contact_phone
                })));
            }
        }

        const srvOr = buildEmailPhoneOr("email", "phone");
        if (srvOr) {
            const { data: serviceReqs } = await supabase.from("service_requests").select("*, services(title)").or(srvOr);
            if (serviceReqs) {
                allRequests.push(...serviceReqs.map(s => ({
                    id: s.id,
                    source_table: "service_requests" as const,
                    type: "service",
                    title: s.services?.title || null,
                    message: s.notes || null,
                    status: s.status,
                    admin_response: s.admin_notes || s.admin_response,
                    responded_at: s.responded_at || s.created_at,
                    last_updated_at: s.last_updated_at || s.created_at,
                    created_at: s.created_at,
                    tracking_code: s.tracking_code,
                    user_id: s.user_id,
                    contact_email: s.email,
                    contact_phone: s.phone
                })));
            }
        }

        const projOr = buildOr();
        if (projOr) {
            const { data: projects } = await supabase.from("project_submissions").select("*").or(projOr);
            if (projects) {
                allRequests.push(...projects.map(p => ({
                    id: p.id,
                    source_table: "project_submissions" as const,
                    type: "project",
                    title: p.title || null,
                    message: p.description || null,
                    status: p.status,
                    admin_response: p.feedback || p.admin_response,
                    responded_at: p.reviewed_at || p.responded_at,
                    last_updated_at: p.last_updated_at || p.updated_at || p.submitted_at,
                    created_at: p.submitted_at || p.created_at,
                    tracking_code: p.tracking_code,
                    user_id: p.user_id
                })));
            }
        }

        const jobOr = buildEmailPhoneOr("email", "phone");
        if (jobOr) {
            const { data: jobs } = await supabase.from("job_applications").select("*").or(jobOr);
            if (jobs) {
                allRequests.push(...jobs.map(j => ({
                    id: j.id,
                    source_table: "job_applications" as const,
                    type: "job",
                    title: j.job_title || null,
                    message: j.cover_letter || null,
                    status: j.status,
                    admin_response: j.admin_response,
                    responded_at: j.responded_at,
                    last_updated_at: j.last_updated_at || j.created_at,
                    created_at: j.created_at,
                    tracking_code: j.tracking_code,
                    user_id: j.user_id,
                    contact_email: j.email,
                    contact_phone: j.phone
                })));
            }
        }

        // ── Store Orders ──────────────────────────────────────────────────────────
        const ordersConditions: string[] = [];
        if (params.userId) ordersConditions.push(`user_id.eq.${params.userId}`);
        if (params.email) ordersConditions.push(`customer_email.eq.${params.email}`);
        if (params.phone) ordersConditions.push(`customer_phone.eq.${params.phone}`);

        if (ordersConditions.length > 0) {
            const ordersOr = ordersConditions.join(",");
            const { data: orders } = await supabase
                .from("store_orders")
                .select("id, order_number, user_id, product_name_ar, customer_phone, customer_email, customer_note, quantity, product_price, product_currency, status, admin_note, created_at, updated_at")
                .or(ordersOr)
                .order("created_at", { ascending: false });
            if (orders) {
                allRequests.push(...orders.map((o: any) => ({
                    id: o.id,
                    source_table: "store_orders" as const,
                    type: "store",
                    title: o.product_name_ar || null,
                    message: o.customer_note || null,
                    status: o.status || "pending",
                    admin_response: o.admin_note || null,
                    responded_at: null,
                    last_updated_at: o.updated_at || o.created_at,
                    created_at: o.created_at,
                    tracking_code: o.order_number || null,
                    user_id: o.user_id,
                    contact_email: o.customer_email,
                    contact_phone: o.customer_phone,
                    order_number: o.order_number,
                })));
            }
        }

    } catch (err) {
        console.error("Error fetching unified requests", err);
    }

    return allRequests.sort((a, b) => new Date(b.last_updated_at || b.created_at).getTime() - new Date(a.last_updated_at || a.created_at).getTime());
}

export async function fetchAllRequests() {
    const allRequests: UnifiedRequest[] = [];

    try {
        const [suggRes, srvRes, projRes, jobRes] = await Promise.all([
            supabase.from("suggestions").select("*").order("created_at", { ascending: false }).limit(200),
            supabase.from("service_requests").select("*, services(title)").order("created_at", { ascending: false }).limit(200),
            supabase.from("project_submissions").select("*").order("created_at", { ascending: false }).limit(200),
            supabase.from("job_applications").select("*").order("created_at", { ascending: false }).limit(200)
        ]);

        if (suggRes.data) {
            allRequests.push(...suggRes.data.map(s => ({
                id: s.id,
                source_table: "suggestions" as const,
                type: s.type,
                title: s.type || null,
                message: s.message,
                status: s.status,
                admin_response: s.admin_response,
                responded_at: s.responded_at,
                last_updated_at: s.last_updated_at || s.updated_at || s.created_at,
                created_at: s.created_at,
                tracking_code: s.tracking_code,
                user_id: s.user_id,
                contact_email: s.contact_email,
                contact_phone: s.contact_phone
            })));
        }

        if (srvRes.data) {
            allRequests.push(...srvRes.data.map(s => ({
                id: s.id,
                source_table: "service_requests" as const,
                type: "service",
                title: s.services?.title || null,
                message: s.notes || null,
                status: s.status,
                admin_response: s.admin_notes || s.admin_response,
                responded_at: s.responded_at || s.created_at,
                last_updated_at: s.last_updated_at || s.created_at,
                created_at: s.created_at,
                tracking_code: s.tracking_code,
                user_id: s.user_id,
                contact_email: s.email,
                contact_phone: s.phone
            })));
        }

        if (projRes.data) {
            allRequests.push(...projRes.data.map(p => ({
                id: p.id,
                source_table: "project_submissions" as const,
                type: "project",
                title: p.title || null,
                message: p.description || null,
                status: p.status,
                admin_response: p.feedback || p.admin_response,
                responded_at: p.reviewed_at || p.responded_at,
                last_updated_at: p.last_updated_at || p.updated_at || p.submitted_at,
                created_at: p.submitted_at || p.created_at,
                tracking_code: p.tracking_code,
                user_id: p.user_id
            })));
        }

        if (jobRes.data) {
            allRequests.push(...jobRes.data.map(j => ({
                id: j.id,
                source_table: "job_applications" as const,
                type: "job",
                title: j.job_title || null,
                message: j.cover_letter || null,
                status: j.status,
                admin_response: j.admin_response,
                responded_at: j.responded_at,
                last_updated_at: j.last_updated_at || j.created_at,
                created_at: j.created_at,
                tracking_code: j.tracking_code,
                user_id: j.user_id,
                contact_email: j.email,
                contact_phone: j.phone
            })));
        }

    } catch (err) {
        console.error("Error fetching all requests", err);
    }

    return allRequests.sort((a, b) => new Date(b.last_updated_at || b.created_at).getTime() - new Date(a.last_updated_at || a.created_at).getTime());
}

export async function updateRequestStatus(
    source_table: string,
    id: string,
    status: string,
    admin_response: string
) {
    let updatePayload: any = {
        status,
        admin_response,
        responded_at: new Date().toISOString(),
        last_updated_at: new Date().toISOString()
    };

    if (source_table === "service_requests") {
        updatePayload = { status, admin_notes: admin_response, admin_response, responded_at: updatePayload.responded_at, last_updated_at: updatePayload.last_updated_at };
    } else if (source_table === "project_submissions") {
        updatePayload = { status, feedback: admin_response, admin_response, reviewed_at: updatePayload.responded_at, responded_at: updatePayload.responded_at, last_updated_at: updatePayload.last_updated_at };
    }

    const { data, error } = await supabase
        .from(source_table)
        .update(updatePayload)
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data;
}

