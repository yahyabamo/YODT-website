// ============================================
// BUSLA - Supabase Query Functions
// Adjust the import path to match your project
// ============================================
import { supabase } from '@/integrations/supabase/client';
import type {
    Activity2,
    LibraryItem,
    Note,
    Bookmark,
    TrackMessage,
} from '@/integrations/supabase/types';

// ─────────────────────────────────────────────
// ACTIVITIES
// ─────────────────────────────────────────────

export async function getActivities(userId: string): Promise<Activity2[]> {
    const { data: activities, error } = await supabase
        .from('activities2')
        .select('*')
        .order('created_at', { ascending: false });

    if (error || !activities) return [];

    // Get registration counts and user registration status
    const { data: registrations } = await supabase
        .from('activity_registrations2')
        .select('activity_id, user_id');

    return activities.map((a) => {
        const regs = registrations?.filter((r) => r.activity_id === a.id) ?? [];
        return {
            ...a,
            attendees_count: regs.length,
            is_registered: regs.some((r) => r.user_id === userId),
        };
    });
}

export async function registerActivity(
    activityId: string,
    userId: string
): Promise<{ error: string | null }> {
    const { error } = await supabase
        .from('activity_registrations2')
        .insert({ activity_id: activityId, user_id: userId });

    return { error: error?.message ?? null };
}

export async function unregisterActivity(
    activityId: string,
    userId: string
): Promise<{ error: string | null }> {
    const { error } = await supabase
        .from('activity_registrations2')
        .delete()
        .eq('activity_id', activityId)
        .eq('user_id', userId);

    return { error: error?.message ?? null };
}

// ─────────────────────────────────────────────
// LIBRARY
// ─────────────────────────────────────────────

export async function getLibraryItems(type?: string): Promise<LibraryItem[]> {
    let query = supabase
        .from('library_items')
        .select('*')
        .order('created_at', { ascending: false });

    if (type && type !== 'all') {
        query = query.eq('type', type);
    }

    const { data, error } = await query;
    if (error) return [];
    return data ?? [];
}

export async function createLibraryItem(
    item: Omit<LibraryItem, 'id' | 'created_at'>
): Promise<{ data: LibraryItem | null; error: string | null }> {
    const { data, error } = await supabase
        .from('library_items')
        .insert(item)
        .select()
        .single();

    return { data: data ?? null, error: error?.message ?? null };
}

export async function deleteLibraryItem(
    id: string
): Promise<{ error: string | null }> {
    const { error } = await supabase.from('library_items').delete().eq('id', id);
    return { error: error?.message ?? null };
}

export async function uploadLibraryFile(
    file: File,
    path: string
): Promise<{ url: string | null; error: string | null }> {
    const { error } = await supabase.storage
        .from('library')
        .upload(path, file, { upsert: true });

    if (error) return { url: null, error: error.message };

    const { data } = supabase.storage.from('library').getPublicUrl(path);
    return { url: data.publicUrl, error: null };
}

// ─────────────────────────────────────────────
// TRACKS
// ─────────────────────────────────────────────

export async function getTracks(userId: string) {
    const { data: tracks, error } = await supabase
        .from('tracks')
        .select('*')
        .order('created_at', { ascending: false });

    if (error || !tracks) return [];

    const { data: members } = await supabase
        .from('track_members')
        .select('track_id, user_id, status')
        .eq('user_id', userId);

    const { data: books } = await supabase
        .from('track_books')
        .select('track_id, library_items(*), is_current')
        .eq('is_current', true);

    const { data: progress } = await supabase
        .from('track_progress')
        .select('track_id, last_page')
        .eq('user_id', userId);

    return tracks.map((t) => {
        const trackMembers = members?.filter((m) => m.track_id === t.id) ?? [];
        const book = books?.find((b) => b.track_id === t.id);
        const prog = progress?.find((p) => p.track_id === t.id);
        
        const myMembership = trackMembers.find((m) => m.user_id === userId);

        return {
            ...t,
            member_count: trackMembers.filter(m => m.status === 'approved').length,
            is_member: myMembership?.status === 'approved',
            is_pending: myMembership?.status === 'pending',
            current_book: book?.library_items ?? null,
            user_progress: prog?.last_page ?? 0,
        };
    });
}

export async function adminGetTrackRequests() {
    console.log("Fetching admin track requests...");
    const { data, error } = await supabase
        .from('track_members')
        .select(`
            id,
            user_id,
            status,
            joined_at,
            profiles(full_name),
            tracks(title)
        `)
        .eq('status', 'pending')
        .order('joined_at', { ascending: false });

    if (error || !data) {
        console.error("adminGetTrackRequests error:", error);
        return { data: [], error: error?.message };
    }

    console.log(`Found ${data.length} pending requests.`);

    // Fetch academic profiles separately since relationship isn't detected
    const userIds = [...new Set(data.map(req => req.user_id))];
    
    const { data: academicProfiles } = await supabase
        .from('academic_profiles')
        .select('*')
        .in('id', userIds);

    // Fetch approved tracks for each user
    const { data: approvedMembers } = await supabase
        .from('track_members')
        .select('user_id, tracks(title)')
        .eq('status', 'approved')
        .in('user_id', userIds);

    const formattedData = data.map(req => {
        const acadProfile = academicProfiles?.find(ap => ap.id === req.user_id) || null;
        const userApprovedTracks = approvedMembers
            ?.filter(am => am.user_id === req.user_id)
            ?.map(am => (am.tracks as any)?.title)
            .filter(Boolean) || [];

        return {
            ...req,
            academic_profile: acadProfile,
            approved_tracks: userApprovedTracks,
        };
    });

    console.log("Formatted requests count:", formattedData.length);
    return { data: formattedData, error: null };
}

export async function adminHandleTrackRequest(requestId: string, status: 'approved' | 'rejected') {
    const { data, error } = await supabase
        .from('track_members')
        .update({ status })
        .eq('id', requestId)
        .select();
    
    return { data, error };
}


export async function getTrackById(trackId: string, userId: string) {
    const { data: track, error } = await supabase
        .from('tracks')
        .select('*')
        .eq('id', trackId)
        .single();

    if (error || !track) return null;

    const { data: book } = await supabase
        .from('track_books')
        .select('*, library_items(*)')
        .eq('track_id', trackId)
        .eq('is_current', true)
        .single();

    const { data: progress } = await supabase
        .from('track_progress')
        .select('last_page')
        .eq('track_id', trackId)
        .eq('user_id', userId)
        .single();

    const { data: members } = await supabase
        .from('track_members')
        .select('user_id, status')
        .eq('track_id', trackId);

    const myMembership = members?.find((m) => m.user_id === userId);

    return {
        ...track,
        current_book: (book?.library_items as LibraryItem) ?? null,
        last_page: progress?.last_page ?? 1,
        member_count: members?.filter(m => m.status === 'approved').length ?? 0,
        is_member: myMembership?.status === 'approved',
        is_pending: myMembership?.status === 'pending',
    };
}

export async function joinTrack(
    trackId: string,
    userId: string
): Promise<{ error: string | null }> {
    console.log(`User ${userId} attempting to join track ${trackId}...`);
    
    // Use upsert to handle cases where a row exists but RLS prevents selecting it.
    // If the row exists (e.g., rejected previously), it updates the status to pending.
    const { data, error } = await supabase
        .from('track_members')
        .upsert(
            { track_id: trackId, user_id: userId, status: 'pending' },
            { onConflict: 'track_id,user_id' }
        )
        .select()
        .single();

    if (error) {
        console.error("joinTrack error:", error);
        return { error: error.message };
    }

    console.log("joinTrack result status:", data?.status);
    return { error: null };
}

export async function leaveTrack(
    trackId: string,
    userId: string
): Promise<{ error: string | null }> {
    const { error } = await supabase
        .from('track_members')
        .delete()
        .eq('track_id', trackId)
        .eq('user_id', userId);
    return { error: error?.message ?? null };
}

// ─────────────────────────────────────────────
// PROGRESS
// ─────────────────────────────────────────────

export async function updateProgress(
    trackId: string,
    userId: string,
    lastPage: number
): Promise<void> {
    await supabase.from('track_progress').upsert(
        { track_id: trackId, user_id: userId, last_page: lastPage, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,track_id' }
    );
}

// ─────────────────────────────────────────────
// NOTES
// ─────────────────────────────────────────────

export async function getNotes(
    trackId: string,
    userId: string,
    pageNumber?: number
): Promise<Note[]> {
    let query = supabase
        .from('notes')
        .select('*')
        .eq('track_id', trackId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (pageNumber !== undefined) {
        query = query.eq('page_number', pageNumber);
    }

    const { data } = await query;
    return data ?? [];
}

export async function createNote(
    trackId: string,
    userId: string,
    pageNumber: number,
    content: string
): Promise<{ data: Note | null; error: string | null }> {
    const { data, error } = await supabase
        .from('notes')
        .insert({ track_id: trackId, user_id: userId, page_number: pageNumber, content })
        .select()
        .single();
    return { data: data ?? null, error: error?.message ?? null };
}

export async function deleteNote(id: string): Promise<{ error: string | null }> {
    const { error } = await supabase.from('notes').delete().eq('id', id);
    return { error: error?.message ?? null };
}

// ─────────────────────────────────────────────
// BOOKMARKS
// ─────────────────────────────────────────────

export async function getBookmarks(
    trackId: string,
    userId: string
): Promise<Bookmark[]> {
    const { data } = await supabase
        .from('bookmarks')
        .select('*')
        .eq('track_id', trackId)
        .eq('user_id', userId)
        .order('page_number', { ascending: true });
    return data ?? [];
}

export async function toggleBookmark(
    trackId: string,
    userId: string,
    pageNumber: number
): Promise<{ added: boolean; error: string | null }> {
    // Check if exists
    const { data: existing } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('track_id', trackId)
        .eq('user_id', userId)
        .eq('page_number', pageNumber)
        .single();

    if (existing) {
        const { error } = await supabase.from('bookmarks').delete().eq('id', existing.id);
        return { added: false, error: error?.message ?? null };
    } else {
        const { error } = await supabase
            .from('bookmarks')
            .insert({ track_id: trackId, user_id: userId, page_number: pageNumber });
        return { added: true, error: error?.message ?? null };
    }
}

// ─────────────────────────────────────────────
// CHAT
// ─────────────────────────────────────────────

export async function getMessages(trackId: string): Promise<TrackMessage[]> {
    const { data } = await supabase
        .from('track_messages')
        .select('*, profiles(full_name, avatar_url)')
        .eq('track_id', trackId)
        .order('created_at', { ascending: true })
        .limit(100);
    return (data as TrackMessage[]) ?? [];
}

export async function sendMessage(
    trackId: string,
    userId: string,
    message: string
): Promise<{ error: string | null }> {
    const { error } = await supabase
        .from('track_messages')
        .insert({ track_id: trackId, user_id: userId, message });
    return { error: error?.message ?? null };
}

// ─────────────────────────────────────────────
// ADMIN
// ─────────────────────────────────────────────

export async function adminCreateTrack(
    title: string,
    description: string
): Promise<{ error: string | null }> {
    const { error } = await supabase.from('tracks').insert({ title, description });
    return { error: error?.message ?? null };
}

export async function adminDeleteTrack(id: string): Promise<{ error: string | null }> {
    const { error } = await supabase.from('tracks').delete().eq('id', id);
    return { error: error?.message ?? null };
}

export async function adminRemoveMemberFromTrack(memberRecordId: string) {
    const { error } = await supabase
        .from('track_members')
        .delete()
        .eq('id', memberRecordId);
    return { error };
}

export async function adminAssignBook(
    trackId: string,
    libraryItemId: string
): Promise<{ error: string | null }> {
    // Set all current books for this track to false
    await supabase
        .from('track_books')
        .update({ is_current: false })
        .eq('track_id', trackId);

    // Insert new current book
    const { error } = await supabase
        .from('track_books')
        .insert({ track_id: trackId, library_item_id: libraryItemId, is_current: true });

    return { error: error?.message ?? null };
}

export async function adminCreateActivity(
    activity: Omit<Activity2, 'id' | 'created_at' | 'attendees_count' | 'is_registered'>
): Promise<{ error: string | null }> {
    const { error } = await supabase.from('activities2').insert(activity);
    return { error: error?.message ?? null };
}

export async function adminDeleteActivity(id: string): Promise<{ error: string | null }> {
    const { error } = await supabase.from('activities2').delete().eq('id', id);
    return { error: error?.message ?? null };
}

export async function adminUpdateActivityStatus(
    id: string,
    status: 'upcoming' | 'ongoing' | 'completed'
): Promise<{ error: string | null }> {
    const { error } = await supabase.from('activities2').update({ status }).eq('id', id);
    return { error: error?.message ?? null };
}