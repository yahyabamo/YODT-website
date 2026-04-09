import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { supabase } from "@/integrations/supabase/client";
import { getProfile } from "@/service/supabaseData";
import { Navigate } from 'react-router-dom';

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [session, setSession] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    // Prevent double-loading profile when both initAuth +
    // onAuthStateChange fire for the same userId on startup

    async function loadProfile(userId) {
        try {
            const data = await getProfile(userId)
            setProfile(data ?? null)
        } catch (err) {
            console.error('loadProfile error:', err)
            setProfile(null)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        // ── 1. Listen for auth changes ────────────────────────
        // IMPORTANT: no async/await directly in this callback —
        // use setTimeout to avoid Supabase internal deadlock
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                setSession(session)
                setUser(session?.user ?? null)

                if (session?.user) {
                    setTimeout(() => loadProfile(session.user.id), 0)
                } else {
                    setProfile(null)
                    setLoading(false)
                }
            }
        )

        // ── 2. Seed initial state from existing session ───────
        supabase.auth.getSession().then(({ data: { session } }) => {
            // onAuthStateChange will also fire for this session,
            // loadingRef prevents the double fetch
            if (!session) {
                setLoading(false)
            }
        })

        return () => subscription.unsubscribe()
    }, [])   // ← EMPTY array — never re-register listeners

    const signUp = async (email, password, fullName, gender, university, faculty, avatar_url, phone) => {
        const { data, error } = await supabase.auth.signUp({
            email, password,
            options: {
                emailRedirectTo: `${window.location.origin}/`,
                data: { full_name: fullName, gender, university, faculty, avatar_url, phone },
            },
        })

        if (data?.user && !error) {
            const { data: updateData, error: updateError } = await supabase
                .from('profiles')
                .update({
                    full_name: fullName,
                    gender: gender,
                    university: university || null,
                    faculty: faculty || null,
                    avatar_url: avatar_url || null,
                    phone: phone || null,
                })
                .eq('id', data.user.id)
            console.log('update result:', updateData, updateError)  // ← add this

        }

        return { data, error }
    }

    const signIn = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        return { data, error }
    }

    const signOut = async () => {
        setProfile(null)
        setUser(null)
        setSession(null)
        localStorage.removeItem('registrationData')
        localStorage.removeItem('userGender')
        const { error } = await supabase.auth.signOut({ scope: 'local' })
        // Clear all Supabase persisted session keys from browser storage
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('sb-')) localStorage.removeItem(key)
        })
        return { error }
    }

    const isAdmin = profile?.role === 'admin'

    return (
        <AuthContext.Provider value={{ user, session, profile, isAdmin, loading, signUp, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
    return ctx
}
export function AdminGuard({ children }: { children: React.ReactNode }) {
    const { profile, loading, user } = useAuth();

    // 1. Wait for the data to load first
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
        );
    }

    // 2. If no user is logged in, send to login
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // 3. If profile doesn't exist yet, show loading
    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
        );
    }

    // 4. Allow any non-user role into the admin panel.
    //    Fine-grained page access is enforced by useRoleGuard() inside each page.
    const hasAccess = profile.role && profile.role !== 'user';

    if (!hasAccess) {
        // If they are just a 'user', send them to the home page
        return <Navigate to="/home" replace />;
    }

    // 5. If everything passes, show the admin page
    return <>{children}</>;
}