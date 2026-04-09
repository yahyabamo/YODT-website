-- ============================================================
-- Fix: Allow admins to see ALL union_team_members (male & female)
-- Run this in the Supabase SQL editor (Dashboard > SQL Editor)
-- ============================================================

-- Step 1: Drop the existing restrictive SELECT policy on union_team_members
-- (replace 'your_policy_name' with the actual policy name from your dashboard)
-- You can find the policy name in: Dashboard > Table Editor > union_team_members > Policies

-- Find existing policies first:
-- SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'union_team_members';

-- Step 2: Drop & recreate with admin bypass
-- The new policy allows:
--   - Admins (role = 'admin' in profiles) → see ALL members
--   - Female users → see ALL members  
--   - Male non-admin users → see only male members

DROP POLICY IF EXISTS "Users can view team members" ON union_team_members;
DROP POLICY IF EXISTS "Allow users to view team members based on gender" ON union_team_members;
DROP POLICY IF EXISTS "team_members_select_policy" ON union_team_members;

-- Create new policy
CREATE POLICY "team_members_select_policy"
ON union_team_members
FOR SELECT
USING (
  -- Admins can see everyone
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
  OR
  -- Female users can see everyone
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.gender = 'female'
  )
  OR
  -- Male users can only see male members
  (
    gender = 'male'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.gender = 'male'
    )
  )
  OR
  -- Unauthenticated / public — show only male members
  (gender = 'male' AND auth.uid() IS NULL)
);
