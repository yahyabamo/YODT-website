-- ═══════════════════════════════════════════════════════════════════════════
-- Homepage CMS — Supabase SQL Schema
-- Run this entire file in your Supabase SQL editor (Database → SQL Editor)
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 1. Discount Cards Section ──────────────────────────────────────────────
create table if not exists public.homepage_discount (
  id           uuid primary key default gen_random_uuid(),
  title_ar     text not null default '',
  title_en     text not null default '',
  title_tr     text not null default '',
  subtitle_ar  text not null default '',
  subtitle_en  text not null default '',
  subtitle_tr  text not null default '',
  desc_ar      text not null default '',
  desc_en      text not null default '',
  desc_tr      text not null default '',
  label_ar     text not null default '',
  label_en     text not null default '',
  label_tr     text not null default '',
  icon         text not null default '🏷️',
  is_published boolean not null default true,
  order_index  int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ─── 2. Activities Programs ──────────────────────────────────────────────────
create table if not exists public.homepage_activities (
  id           uuid primary key default gen_random_uuid(),
  icon         text not null default '🎯',
  name_ar      text not null default '',
  name_en      text not null default '',
  name_tr      text not null default '',
  tag_ar       text not null default '',
  tag_en       text not null default '',
  tag_tr       text not null default '',
  desc_ar      text not null default '',
  desc_en      text not null default '',
  desc_tr      text not null default '',
  is_published boolean not null default true,
  order_index  int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ─── 3. Activity Sub-Items (children of programs) ───────────────────────────
create table if not exists public.homepage_activity_items (
  id          uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.homepage_activities(id) on delete cascade,
  icon        text not null default '📌',
  title_ar    text not null default '',
  title_en    text not null default '',
  title_tr    text not null default '',
  desc_ar     text not null default '',
  desc_en     text not null default '',
  desc_tr     text not null default '',
  freq_ar     text not null default '',
  freq_en     text not null default '',
  freq_tr     text not null default '',
  image_url   text,
  order_index int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ─── 4. Partners / Marquee ──────────────────────────────────────────────────
create table if not exists public.homepage_partners (
  id           uuid primary key default gen_random_uuid(),
  abbr         text not null default '',
  name_ar      text not null default '',
  name_en      text not null default '',
  name_tr      text not null default '',
  logo_url     text,
  link         text,
  is_published boolean not null default true,
  order_index  int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ─── 5. Footer / Contact Info (singleton) ───────────────────────────────────
create table if not exists public.homepage_footer (
  id            uuid primary key default gen_random_uuid(),
  instagram_url text,
  facebook_url  text,
  twitter_url   text,
  telegram_url  text,
  youtube_url   text,
  whatsapp_url  text,
  phone         text,
  email         text,
  address_ar    text,
  address_en    text,
  address_tr    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Enforce a single footer row
create unique index if not exists homepage_footer_singleton
  on public.homepage_footer ((true));

-- ─── Row Level Security ──────────────────────────────────────────────────────
alter table public.homepage_discount        enable row level security;
alter table public.homepage_activities      enable row level security;
alter table public.homepage_activity_items  enable row level security;
alter table public.homepage_partners        enable row level security;
alter table public.homepage_footer          enable row level security;

-- Public can read everything (homepage is public)
create policy "public read discount"   on public.homepage_discount       for select using (true);
create policy "public read activities" on public.homepage_activities      for select using (true);
create policy "public read act items"  on public.homepage_activity_items  for select using (true);
create policy "public read partners"   on public.homepage_partners        for select using (true);
create policy "public read footer"     on public.homepage_footer          for select using (true);

-- Only admins can write (checks profiles.role = 'admin')
create policy "admin write discount" on public.homepage_discount
  for all using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

create policy "admin write activities" on public.homepage_activities
  for all using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

create policy "admin write act items" on public.homepage_activity_items
  for all using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

create policy "admin write partners" on public.homepage_partners
  for all using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

create policy "admin write footer" on public.homepage_footer
  for all using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'admin'
    )
  );

-- ─── Seed Data (mirrors current hardcoded homepage content) ───────────────────

-- Discount cards
insert into public.homepage_discount
  (title_ar, title_en, title_tr, desc_ar, desc_en, desc_tr, label_ar, label_en, label_tr, icon, is_published, order_index)
values
  ('مطاعم ومقاهي','Restaurants & Cafés','Restoranlar & Kafeler',
   'تخفيضات مستمرة في مطاعم ومقاهي متنوعة بإسطنبول لأعضاء الاتحاد.',
   'Ongoing discounts at various restaurants and cafés in Istanbul for union members.',
   'İstanbul''daki çeşitli restoran ve kafelerde birlik üyelerine sürekli indirimler.',
   'خصومات مستمرة','Ongoing Discounts','Sürekli İndirimler','🍽️',true,0),
  ('دورات تعليمية','Educational Courses','Eğitim Kursları',
   'حصص لغة تركية، دورات مهنية وتقنية بأسعار مخفضة لأعضائنا المميزين.',
   'Turkish language lessons, professional and technical courses at reduced prices for our members.',
   'Türkçe dil dersleri, üyelerimiz için indirimli mesleki ve teknik kurslar.',
   'عروض تعليمية','Educational Offers','Eğitim Teklifleri','🎓',true,1),
  ('خدمات طلابية','Student Services','Öğrenci Hizmetleri',
   'طباعة، مستلزمات دراسية، خدمات ترجمة، وخدمات يومية بأسعار مخصصة.',
   'Printing, study supplies, translation services, and daily services at member prices.',
   'Üye fiyatlarıyla baskı, ders malzemeleri, çeviri hizmetleri ve günlük hizmetler.',
   'خدمات متنوعة','Various Services','Çeşitli Hizmetler','🛍️',true,2)
on conflict do nothing;

-- Activities programs
insert into public.homepage_activities
  (icon, name_ar, name_en, name_tr, tag_ar, tag_en, tag_tr, desc_ar, desc_en, desc_tr, is_published, order_index)
values
  ('🧭','بوصلة','Bousala','Pusola','توجيهي · Guidance','Guidance','Rehberlik',
   'برنامج التوجيه المهني والأكاديمي للطلاب اليمنيين، يرسم مساراتهم نحو المستقبل.',
   'Academic and professional guidance program for Yemeni students.',
   'Yemenli öğrenciler için akademik ve mesleki rehberlik programı.',
   true,0),
  ('🏛️','بيت الاتحاد','Union House','Birlik Evi','مجتمعي · Community','Community','Topluluk',
   'بيت الجالية اليمنية في إسطنبول، مساحة الوحدة والتلاقي والعمل المشترك.',
   'The home of the Yemeni community in Istanbul, a space for unity and collaboration.',
   'İstanbul''daki Yemenli topluluğunun evi, birlik ve işbirliği alanı.',
   true,1),
  ('⚽','الرياضة الشبابية','Youth Sports','Gençlik Sporu','رياضي · Sports','Sports','Spor',
   'منصة رياضية شاملة تبني اللياقة البدنية والروح الجماعية والمنافسة الشريفة.',
   'A comprehensive sports platform building fitness, team spirit and fair competition.',
   'Fitness, takım ruhu ve adil rekabet inşa eden kapsamlı spor platformu.',
   true,2),
  ('🤲','عون','Awn','Yardım','إنساني · Humanitarian','Humanitarian','İnsancıl',
   'مبادرة التكافل الاجتماعي، تمد يد المساعدة للطلاب في أوقات الحاجة.',
   'Social solidarity initiative, extending a helping hand to students in need.',
   'İhtiyaç duyan öğrencilere yardım eli uzatan sosyal dayanışma girişimi.',
   true,3),
  ('💡','مفهوم','Mafhoum','Kavram','فكري · Intellectual','Intellectual','Entelektüel',
   'منصة الفكر والإبداع والنقاش العلمي، تشحذ العقول وتصقل المواهب الأكاديمية.',
   'A platform for thought, creativity and academic debate.',
   'Düşünce, yaratıcılık ve akademik tartışma platformu.',
   true,4),
  ('🎭','الفعاليات الثقافية','Cultural Events','Kültürel Etkinlikler','ثقافي · Cultural','Cultural','Kültürel',
   'أمسيات شعرية ومعارض فنون وندوات فكرية تعزز الهوية الثقافية اليمنية.',
   'Poetry evenings, art exhibitions and intellectual seminars to strengthen Yemeni cultural identity.',
   'Yemenli kültürel kimliği güçlendirmek için şiir geceleri, sanat sergileri ve entelektüel seminerler.',
   true,5),
  ('🇾🇪','المناسبات الوطنية','National Events','Ulusal Etkinlikler','وطني · National','National','Ulusal',
   'إحياء الذكريات الوطنية وتعزيز روح الانتماء بين أبناء الجالية اليمنية.',
   'Commemorating national occasions and promoting a sense of belonging among the Yemeni community.',
   'Ulusal olayları anmak ve Yemenli topluluk arasında aidiyet duygusunu artırmak.',
   true,6),
  ('🌙','البرامج الدينية','Religious Programs','Dini Programlar','ديني · Religious','Religious','Dini',
   'لقاءات إيمانية وإفطارات جماعية تقوي الروابط الأخوية في المناسبات المباركة.',
   'Faith gatherings and communal iftars strengthening brotherly bonds on blessed occasions.',
   'İnanç toplantıları ve mübarek vesilelerle kardeşlik bağlarını güçlendiren toplu iftarlar.',
   true,7)
on conflict do nothing;

-- Partners
insert into public.homepage_partners
  (abbr, name_ar, name_en, name_tr, is_published, order_index)
values
  ('UNI',  'جامعة إسطنبول',      'Istanbul University',   'İstanbul Üniversitesi', true, 0),
  ('EDU',  'مركز التعليم التقني','Tech Education Center',  'Teknik Eğitim Merkezi', true, 1),
  ('MED',  'المركز الطبي',       'Medical Center',         'Tıp Merkezi',           true, 2),
  ('LAW',  'استشارات قانونية',   'Legal Consulting',       'Hukuk Danışmanlığı',    true, 3),
  ('TECH', 'شركة تقنية',         'Tech Company',           'Teknoloji Şirketi',     true, 4),
  ('REST', 'سلسلة مطاعم',        'Restaurant Chain',       'Restoran Zinciri',      true, 5),
  ('BANK', 'خدمات مالية',        'Financial Services',     'Finansal Hizmetler',    true, 6),
  ('LANG', 'مركز اللغات',        'Language Center',        'Dil Merkezi',           true, 7),
  ('PRINT','خدمات طباعة',        'Printing Services',      'Baskı Hizmetleri',      true, 8),
  ('BOOK', 'دار نشر',            'Publishing House',       'Yayınevi',              true, 9),
  ('HLTH', 'صيدلية',             'Pharmacy',               'Eczane',                true,10),
  ('VISA', 'خدمات التأشيرة',     'Visa Services',          'Vize Hizmetleri',       true,11)
on conflict do nothing;

-- Footer (singleton)
insert into public.homepage_footer
  (instagram_url, facebook_url, twitter_url, telegram_url, youtube_url, whatsapp_url,
   phone, email, address_ar, address_en, address_tr)
values
  ('https://instagram.com/ysu_istanbul',
   'https://facebook.com/ysu.istanbul',
   'https://twitter.com/ysu_istanbul',
   'https://t.me/ysu_istanbul',
   'https://youtube.com/@ysu_istanbul',
   'https://wa.me/905000000000',
   '+90 5XX XXX XXXX',
   'info@ysu-istanbul.org',
   'إسطنبول، تركيا',
   'Istanbul, Turkey',
   'İstanbul, Türkiye')
on conflict do nothing;
