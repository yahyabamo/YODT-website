-- Busla Community Chat Table
CREATE TABLE public.busla_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.busla_chat_messages ENABLE ROW LEVEL SECURITY;

-- Allow reading for anyone
CREATE POLICY "Enable read access for all users" ON public.busla_chat_messages FOR SELECT USING (true);

-- Allow inserting for authenticated users
CREATE POLICY "Enable insert for authenticated users only" ON public.busla_chat_messages FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow admins to delete messages
CREATE POLICY "Admins can delete messages" ON public.busla_chat_messages FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('admin', 'staff')
  )
);
