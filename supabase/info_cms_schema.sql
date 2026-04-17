-- ═══════════════════════════════════════════════════════════════════════════
-- Informational CMS — Supabase SQL Schema
-- Run this entire file in your Supabase SQL editor (Database → SQL Editor)
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 1. Articles ─────────────────────────────────────────────────────────────
create table if not exists public.info_articles (
  id           uuid primary key default gen_random_uuid(),
  title        text not null default '',
  excerpt      text not null default '',
  content      text not null default '',
  image_url    text,
  category     text not null default 'istanbul' check (category in ('istanbul', 'yemen', 'general')),
  author       text not null default '',
  is_published boolean not null default true,
  order_index  int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ─── 2. Universities ─────────────────────────────────────────────────────────
create table if not exists public.info_universities (
  id           uuid primary key default gen_random_uuid(),
  name         text not null default '',
  description  text not null default '',
  image_url    text,
  website_url  text,
  location     text not null default 'إسطنبول، تركيا',
  specialties  text,           -- comma-separated list of fields
  established  text,           -- year or "founded in..."
  student_count text,
  is_published boolean not null default true,
  order_index  int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ─── 3. Outstanding Students ─────────────────────────────────────────────────
create table if not exists public.info_students (
  id           uuid primary key default gen_random_uuid(),
  name         text not null default '',
  bio          text not null default '',
  image_url    text,
  major        text not null default '',
  university   text not null default '',
  academic_year text not null default '',
  achievement  text not null default '',
  gpa          text,
  is_published boolean not null default true,
  order_index  int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ─── 4. Icons (Role Models / رموزنا) ──────────────────────────────────────────
create table if not exists public.info_icons (
  id           uuid primary key default gen_random_uuid(),
  name         text not null default '',
  bio          text not null default '',
  image_url    text,
  field        text not null default '',   -- e.g. Medicine, Law, Engineering
  notable_work text not null default '',
  birth_year   text,
  nationality  text not null default 'يمني',
  is_published boolean not null default true,
  order_index  int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ─── 5. Achievements ─────────────────────────────────────────────────────────
create table if not exists public.info_achievements (
  id               uuid primary key default gen_random_uuid(),
  title            text not null default '',
  description      text not null default '',
  image_url        text,
  achievement_date text not null default '',   -- human-readable date string
  category         text not null default 'general',
  icon             text not null default '🏆',
  is_published     boolean not null default true,
  order_index      int not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ─── Row Level Security ───────────────────────────────────────────────────────
alter table public.info_articles      enable row level security;
alter table public.info_universities  enable row level security;
alter table public.info_students      enable row level security;
alter table public.info_icons         enable row level security;
alter table public.info_achievements  enable row level security;

-- Public can read published rows
create policy "public read articles"      on public.info_articles      for select using (true);
create policy "public read universities"  on public.info_universities  for select using (true);
create policy "public read students"      on public.info_students      for select using (true);
create policy "public read icons"         on public.info_icons         for select using (true);
create policy "public read achievements"  on public.info_achievements  for select using (true);

-- Only admins can write
create policy "admin write articles" on public.info_articles
  for all using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

create policy "admin write universities" on public.info_universities
  for all using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

create policy "admin write students" on public.info_students
  for all using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

create policy "admin write icons" on public.info_icons
  for all using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

create policy "admin write achievements" on public.info_achievements
  for all using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );
