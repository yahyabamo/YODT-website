import { useState, useEffect, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
    id: string;
    full_name: string | null;
    email: string | null;
    role: 'admin' | 'user';
    status: 'active' | 'inactive' | 'banned';
    total_points: number;
    avatar_url: string | null;
    university?: string | null;
    faculty?: string | null;
}

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    // Prevent double-fetching profile when both getSession +
    // onAuthStateChange fire for the same user
    const loadingProfileFor = useRef<string | null>(null);

    const loadProfile = async (userId: string) => {
        // Already loading or loaded for this user — skip
        if (loadingProfileFor.current === userId) return;
        loadingProfileFor.current = userId;

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, email, role, status, total_points, avatar_url, university, faculty')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Profile fetch error:', error.message);
                // Don't block the app — just leave profile null
            } else {
                let fetchedProfile = data as Profile;

                // Sync registration data if it exists
                const regDataStr = localStorage.getItem('registrationData');
                if (regDataStr) {
                    try {
                        const regData = JSON.parse(regDataStr);
                        const updatePayload: any = {};
                        let needsUpdate = false;

                        if (regData.university && !fetchedProfile.university) { updatePayload.university = regData.university; needsUpdate = true; }
                        if (regData.faculty && !fetchedProfile.faculty) { updatePayload.faculty = regData.faculty; needsUpdate = true; }
                        if (regData.avatar_url && !fetchedProfile.avatar_url) { updatePayload.avatar_url = regData.avatar_url; needsUpdate = true; }
                        if (regData.phone && !(fetchedProfile as any).phone) { updatePayload.phone = regData.phone; needsUpdate = true; }

                        if (needsUpdate) {
                            const { error: updateErr } = await supabase.from('profiles').update(updatePayload).eq('id', userId);
                            if (!updateErr) {
                                fetchedProfile = { ...fetchedProfile, ...updatePayload };
                            }
                        }

                        // We do not remove it immediately in case CompleteProfileSection or others need it.
                        // Or we can remove the specific keys and keep the rest. Actually, let's keep it in localstorage.
                    } catch (e) {
                        console.error("Error syncing registration data:", e);
                    }
                }

                setProfile(fetchedProfile);
            }
        } finally {
            setLoading(false);
        }
    };

    const clearProfile = () => {
        loadingProfileFor.current = null;
        setProfile(null);
        setUser(null);
        setSession(null);
        setLoading(false);
    };

    useEffect(() => {
        // onAuthStateChange is the single source of truth
        // getSession() just seeds the initial state fast
        let initialized = false;

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);

                if (session?.user) {
                    // Use setTimeout to avoid Supabase internal deadlock
                    setTimeout(() => loadProfile(session.user.id), 0);
                } else {
                    clearProfile();
                }
                initialized = true;
            }
        );

        // Fallback: if onAuthStateChange doesn't fire quickly (rare),
        // seed from getSession so the spinner doesn't show forever
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (initialized) return; // onAuthStateChange already handled it
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                loadProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signUp = async (
        email: string,
        password: string,
        fullName: string,
        gender: 'male' | 'female',
        university?: string,
        faculty?: string,
        avatar_url?: string | null
    ) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: `${window.location.origin}/`,
                data: { full_name: fullName, gender, university, faculty, avatar_url },
            },
        });
        return { data, error };
    };

    const signIn = async (email: string, password: string) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { data, error };
    };

    const signOut = async () => {
        clearProfile();
        const { error } = await supabase.auth.signOut();
        return { error };
    };

    return { user, session, profile, loading, signUp, signIn, signOut };
};