import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applySql() {
  const sql = `
-- Quiz Table
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE UNIQUE NOT NULL,
    passing_score_percentage INTEGER NOT NULL DEFAULT 70,
    daily_attempts_limit INTEGER NOT NULL DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Quiz Questions Table
CREATE TABLE IF NOT EXISTS public.quiz_questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer TEXT NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Quiz Attempts Table
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    score_percentage INTEGER,
    passed BOOLEAN,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Quiz Answers Table
CREATE TABLE IF NOT EXISTS public.quiz_answers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    attempt_id UUID REFERENCES public.quiz_attempts(id) ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES public.quiz_questions(id) ON DELETE CASCADE NOT NULL,
    selected_answer TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_answers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid errors on re-run)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Quizzes are viewable by everyone" ON public.quizzes;
    DROP POLICY IF EXISTS "Quiz questions are viewable by everyone" ON public.quiz_questions;
    DROP POLICY IF EXISTS "Users can view their own attempts" ON public.quiz_attempts;
    DROP POLICY IF EXISTS "Users can view their own answers" ON public.quiz_answers;
    DROP POLICY IF EXISTS "Users can insert their own attempts" ON public.quiz_attempts;
    DROP POLICY IF EXISTS "Users can update their own attempts" ON public.quiz_attempts;
    DROP POLICY IF EXISTS "Users can insert their own answers" ON public.quiz_answers;
    DROP POLICY IF EXISTS "Admins can do everything on quizzes" ON public.quizzes;
    DROP POLICY IF EXISTS "Admins can do everything on quiz questions" ON public.quiz_questions;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Read access
CREATE POLICY "Quizzes are viewable by everyone" ON public.quizzes FOR SELECT USING (true);
CREATE POLICY "Quiz questions are viewable by everyone" ON public.quiz_questions FOR SELECT USING (true);

-- Attempts
CREATE POLICY "Users can view their own attempts" ON public.quiz_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own answers" ON public.quiz_answers FOR SELECT USING (
    attempt_id IN (SELECT id FROM public.quiz_attempts WHERE user_id = auth.uid())
);
CREATE POLICY "Users can insert their own attempts" ON public.quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own attempts" ON public.quiz_attempts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own answers" ON public.quiz_answers FOR INSERT WITH CHECK (
    attempt_id IN (SELECT id FROM public.quiz_attempts WHERE user_id = auth.uid())
);

-- Admins
CREATE POLICY "Admins can do everything on quizzes" ON public.quizzes USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
);
CREATE POLICY "Admins can do everything on quiz questions" ON public.quiz_questions USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'super_admin'))
);
  `;

  try {
     const { error } = await supabase.rpc('exec_sql', { sql_string: sql });
     if (error) {
       console.error("Failed using rpc exec_sql. Make sure you have a function to execute raw SQL, or apply it manually via Supabase dashboard.", error);
     } else {
       console.log("Schema applied successfully.");
     }
  } catch(e) {
    console.error(e);
  }
}

applySql();
