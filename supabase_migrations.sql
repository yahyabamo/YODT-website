-- Migrations for Centralized User Requests Tracking System

-- 1. Create Suggestions Table
CREATE TABLE IF NOT EXISTS public.suggestions (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    contact_email TEXT,
    contact_phone TEXT,
    tracking_code TEXT UNIQUE,
    type TEXT NOT NULL, -- 'suggestion', 'problem', 'idea'
    message TEXT NOT NULL,
    status TEXT DEFAULT 'NEW', -- 'NEW', 'UNDER_REVIEW', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'
    admin_response TEXT,
    responded_at TIMESTAMP WITH TIME ZONE,
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for suggestions
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts
CREATE POLICY "Allow anonymous inserts" ON public.suggestions FOR INSERT TO public WITH CHECK (true);

-- Allow users to view their own suggestions or guests via tracking code
CREATE POLICY "Allow users to view own suggestions" ON public.suggestions FOR SELECT TO public 
USING (auth.uid() = user_id OR tracking_code IS NOT NULL);

-- Allow admins (authenticated users with role='admin' in profiles) to read ALL suggestions
CREATE POLICY "Allow admins to read all suggestions" ON public.suggestions FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Allow admins to UPDATE suggestions (for admin_response, status)
CREATE POLICY "Allow admins to update suggestions" ON public.suggestions FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);


-- 2. Extend existing tables with necessary columns
-- Note: PostgreSQL supports 'ADD COLUMN IF NOT EXISTS' from version 9.6

-- Service Requests
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS tracking_code TEXT UNIQUE;
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS admin_response TEXT;
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS responded_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.service_requests ADD COLUMN IF NOT EXISTS last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Project Submissions
-- (project_submissions already has user_id, feedback, updated_at)
ALTER TABLE public.project_submissions ADD COLUMN IF NOT EXISTS tracking_code TEXT UNIQUE;
ALTER TABLE public.project_submissions ADD COLUMN IF NOT EXISTS admin_response TEXT;
ALTER TABLE public.project_submissions ADD COLUMN IF NOT EXISTS responded_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.project_submissions ADD COLUMN IF NOT EXISTS last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Job Applications
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS tracking_code TEXT UNIQUE;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS admin_response TEXT;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS responded_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.job_applications ADD COLUMN IF NOT EXISTS last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();


-- 3. Trigger to auto-update last_updated_at and updated_at
CREATE OR REPLACE FUNCTION update_last_updated_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated_at = NOW();
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Attach trigger to tables
DROP TRIGGER IF EXISTS update_suggestions_modtime ON public.suggestions;
CREATE TRIGGER update_suggestions_modtime
    BEFORE UPDATE ON public.suggestions
    FOR EACH ROW
    EXECUTE FUNCTION update_last_updated_column();

DROP TRIGGER IF EXISTS update_service_requests_modtime ON public.service_requests;
CREATE TRIGGER update_service_requests_modtime
    BEFORE UPDATE ON public.service_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_last_updated_column();

DROP TRIGGER IF EXISTS update_project_submissions_modtime ON public.project_submissions;
CREATE TRIGGER update_project_submissions_modtime
    BEFORE UPDATE ON public.project_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_last_updated_column();

DROP TRIGGER IF EXISTS update_job_applications_modtime ON public.job_applications;
CREATE TRIGGER update_job_applications_modtime
    BEFORE UPDATE ON public.job_applications
    FOR EACH ROW
    EXECUTE FUNCTION update_last_updated_column();

