import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { supabase } from "@/integrations/supabase/client";
import { getProfile } from "@/service/supabaseData";

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [session, setSession] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    // Prevent double-loading profile when both initAuth +
    // onAuthStateChange fire for the same userId on startup
    const loadingRef = useRef(false)

    async function loadProfile(userId) {
        if (loadingRef.current) return   // already in flight
        loadingRef.current = true
        try {
            const data = await getProfile(userId)
            setProfile(data ?? null)
        } catch (err) {
            console.error('loadProfile error:', err)
            setProfile(null)
        } finally {
            loadingRef.current = false
            setLoading(false)            // always unblocks
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

    const signUp = async (email, password, fullName, gender) => {
        const { data, error } = await supabase.auth.signUp({
            email, password,
            options: {
                emailRedirectTo: `${window.location.origin}/`,
                data: { full_name: fullName, gender },
            },
        })
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
        const { error } = await supabase.auth.signOut()
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

export function AdminGuard({ children }) {
    const { profile, loading, user } = useAuth()

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
        )
    }

    if (!user) {
        window.location.href = '/login'
        return null // let router handle
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
        )
    }

    if (profile.role !== 'admin') {
        return null
    }

    return children
}

