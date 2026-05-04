import { supabase } from '@/integrations/supabase/client'

// ─── Types ────────────────────────────────────────────────────────────────────

export type ElectionStatus = 'draft' | 'nomination' | 'voting' | 'closed'

export interface Election {
    id: string
    title: string
    description: string | null
    status: ElectionStatus
    nomination_start: string | null
    nomination_end: string | null
    voting_start: string | null
    voting_end: string | null
    created_by: string
    created_at: string
    updated_at: string
    positions?: Position[]
}

export interface Position {
    id: string
    election_id: string
    title: string
    description: string | null
    max_winners: number
    sort_order: number
    created_at: string
    candidates?: Candidate[]
}

export type CandidateStatus = 'pending' | 'approved' | 'rejected'

export interface Candidate {
    id: string
    election_id: string
    position_id: string
    member_id: string
    bio: string | null
    program: string | null
    photo_url: string | null
    status: CandidateStatus
    rejection_reason: string | null
    reviewed_by: string | null
    reviewed_at: string | null
    submitted_at: string
    updated_at: string
    // joined from profiles
    profile?: {
        full_name: string | null
        avatar_url: string | null
        faculty: string | null
        student_id?: string | null
    }
    position?: Pick<Position, 'id' | 'title'>
}

export interface Vote {
    id: string
    election_id: string
    position_id: string
    candidate_id: string
    voter_id: string
    cast_at: string
}

export interface ElectionResult {
    election_id: string
    position_id: string
    position_title: string
    candidate_id: string
    member_id: string
    candidate_name: string
    photo_url: string | null
    vote_count: number
    rank_in_position: number
}

// ─── Elections ────────────────────────────────────────────────────────────────

/** Fetch all visible elections (non-draft for members, all for admins) */
export async function getElections(): Promise<Election[]> {
    const { data, error } = await supabase
        .from('elections')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) throw error
    return data ?? []
}

/** Fetch a single election with its positions */
export async function getElectionWithPositions(electionId: string): Promise<Election | null> {
    const { data, error } = await supabase
        .from('elections')
        .select(`
      *,
      positions (
        *,
        candidates (
          id,
          election_id,
          member_id,
          status,
          photo_url,
          bio,
          profile:member_id (full_name, avatar_url, faculty)
        )
      )
    `)
        .eq('id', electionId)
        .order('sort_order', { referencedTable: 'positions' })
        .single()

    if (error) throw error
    return data
}

/** Admin: create a new election */
export async function createElection(payload: {
    title: string
    description?: string
    nomination_start?: string
    nomination_end?: string
    voting_start?: string
    voting_end?: string
}): Promise<Election> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
        .from('elections')
        .insert({ ...payload, created_by: user.id, status: 'draft' })
        .select()
        .single()

    if (error) throw error
    return data
}

/** Admin: advance election status */
export async function updateElectionStatus(
    electionId: string,
    status: ElectionStatus
): Promise<void> {
    const { error } = await supabase
        .from('elections')
        .update({ status })
        .eq('id', electionId)

    if (error) throw error
}

// ─── Positions ────────────────────────────────────────────────────────────────

export async function getPositions(electionId: string): Promise<Position[]> {
    const { data, error } = await supabase
        .from('positions')
        .select('*')
        .eq('election_id', electionId)
        .order('sort_order')

    if (error) throw error
    return data ?? []
}

export async function createPosition(payload: {
    election_id: string
    title: string
    description?: string
    max_winners?: number
    sort_order?: number
}): Promise<Position> {
    const { data, error } = await supabase
        .from('positions')
        .insert(payload)
        .select()
        .single()

    if (error) throw error
    return data
}

// ─── Candidates ───────────────────────────────────────────────────────────────

/** Fetch approved candidates for an election, joined with profile data */
export async function getApprovedCandidates(electionId: string): Promise<Candidate[]> {
    const { data, error } = await supabase
        .from('candidates')
        .select(`
      *,
      profile:member_id (full_name, avatar_url, faculty, student_id),
      position:position_id (id, title)
    `)
        .eq('election_id', electionId)
        .eq('status', 'approved')
        .order('submitted_at')

    if (error) throw error
    return (data ?? []) as Candidate[]
}

/** Admin: fetch ALL candidates (all statuses) for moderation */
export async function getAllCandidatesForAdmin(electionId: string): Promise<Candidate[]> {
    const { data, error } = await supabase
        .from('candidates')
        .select(`
      *,
      profile:member_id (full_name, avatar_url, faculty, student_id),
      position:position_id (id, title)
    `)
        .eq('election_id', electionId)
        .order('submitted_at')

    if (error) throw error
    return (data ?? []) as Candidate[]
}

/** Check if current user has already nominated themselves for a position */
export async function getMyNomination(
    electionId: string,
    positionId: string
): Promise<Candidate | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
        .from('candidates')
        .select('*')
        .eq('election_id', electionId)
        .eq('position_id', positionId)
        .eq('member_id', user.id)
        .maybeSingle()

    if (error) throw error
    return data
}

/** Member: submit a nomination */
export async function submitNomination(payload: {
    election_id: string
    position_id: string
    bio: string
    program: string
    photo_url?: string
}): Promise<Candidate> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
        .from('candidates')
        .insert({ ...payload, member_id: user.id })
        .select()
        .single()

    if (error) throw error
    return data
}

/** Admin: approve or reject a candidate */
export async function reviewCandidate(
    candidateId: string,
    status: 'approved' | 'rejected',
    rejection_reason?: string
): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
        .from('candidates')
        .update({
            status,
            rejection_reason: rejection_reason ?? null,
            reviewed_by: user.id,
            reviewed_at: new Date().toISOString(),
        })
        .eq('id', candidateId)

    if (error) throw error
}

// ─── Votes ────────────────────────────────────────────────────────────────────

/** Check which positions the current user has already voted in */
export async function getMyVotes(electionId: string): Promise<Vote[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase
        .from('votes')
        .select('*')
        .eq('election_id', electionId)
        .eq('voter_id', user.id)

    if (error) throw error
    return data ?? []
}

/** Cast a vote — DB UNIQUE constraint prevents double voting */
export async function castVote(payload: {
    election_id: string
    position_id: string
    candidate_id: string
}): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
        .from('votes')
        .insert({ ...payload, voter_id: user.id })

    if (error) {
        if (error.code === '23505') throw new Error('You have already voted for this position.')
        throw error
    }
}

// ─── Results ──────────────────────────────────────────────────────────────────

export async function getElectionResults(electionId: string): Promise<ElectionResult[]> {
    const { data, error } = await supabase
        .from('election_results') // the view we created in SQL
        .select('*')
        .eq('election_id', electionId)
        .order('position_id')
        .order('rank_in_position')

    if (error) throw error
    return data ?? []
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function isAdmin(role: string): boolean {
    return role === 'admin'
}

export function canNominate(status: ElectionStatus): boolean {
    return status === 'nomination'
}

export function canVote(status: ElectionStatus): boolean {
    return status === 'voting'
}

export function canViewResults(status: ElectionStatus): boolean {
    return status === 'voting' || status === 'closed'
}

export function formatDeadline(dateStr: string | null): string {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}