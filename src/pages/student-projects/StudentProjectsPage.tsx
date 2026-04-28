import React, { useState, useMemo, useEffect } from 'react';
import { Search, SlidersHorizontal, Briefcase } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { studentProjectsText, getField } from '@/i18n/pages';
import { useStudentProjects } from '@/hooks/studentProjects/useStudentProjects';
import { useProjectCategories } from '@/hooks/studentProjects/useStudentProjectCategories';
import { ProjectCard } from '@/components/student-projects/ProjectCard';
import { ProjectCategoryFilter } from '@/components/student-projects/ProjectCategoryFilter';
import { ProjectSubmissionForm } from '@/components/student-projects/ProjectSubmissionForm';
import { ProjectsLayout } from '@/components/student-projects/ProjectsLayout';
import { AdSlot } from '@/components/ads/AdSlot';

type SortMode = 'newest' | 'featured' | 'az';

export default function StudentProjectsPage() {
  const { language } = useLanguage();
  const t = studentProjectsText;

  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);

  const { data: categories } = useProjectCategories();
  const { data: projects, isLoading } = useStudentProjects({
    categoryId: activeCategoryId ?? undefined,
    sort: sortMode,
  });

  // Client-side search filter
  const filtered = useMemo(() => {
    if (!projects) return [];
    if (!searchQuery.trim()) return projects;
    const q = searchQuery.toLowerCase();
    return projects.filter((p) =>
      p.name_ar.toLowerCase().includes(q) ||
      p.name_en.toLowerCase().includes(q) ||
      p.name_tr.toLowerCase().includes(q) ||
      (p.description_ar || '').toLowerCase().includes(q)
    );
  }, [projects, searchQuery]);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const isRtl = language === 'ar';

  return (
    <ProjectsLayout>
      <div style={{ background: 'var(--bg, #07080b)', minHeight: '100vh' }}>

        {/* ── Hero ── */}
        <section
          style={{
            position: 'relative',
            marginTop: '-72px',
            minHeight: 'clamp(380px, 55vh, 520px)',
            display: 'flex',
            alignItems: 'flex-end',
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #07080b 0%, #0b0a14 40%, #0d0507 100%)',
            isolation: 'isolate',
          }}
        >
          {/* Yemeni-inspired subtle geometric pattern */}
          <div aria-hidden="true" style={{
            position: 'absolute', inset: 0, zIndex: 0,
            backgroundImage: `
              linear-gradient(rgba(200,168,75,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(200,168,75,0.04) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }} />

          {/* Radial glows */}
          <div aria-hidden="true" style={{
            position: 'absolute', top: '-60px',
            ...(isRtl ? { right: '10%' } : { left: '10%' }),
            zIndex: 0,
            width: '400px', height: '400px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(139,26,42,0.4) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }} />
          <div aria-hidden="true" style={{
            position: 'absolute', bottom: '-40px',
            ...(isRtl ? { left: '15%' } : { right: '15%' }),
            zIndex: 0,
            width: '300px', height: '300px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(200,168,75,0.15) 0%, transparent 70%)',
            filter: 'blur(50px)',
          }} />

          {/* Decorative Islamic-inspired arch shape */}
          <div aria-hidden="true" style={{
            position: 'absolute', top: 0,
            ...(isRtl ? { left: 0 } : { right: 0 }),
            width: '350px', height: '350px', zIndex: 0,
            backgroundImage: `
              repeating-conic-gradient(
                rgba(200,168,75,0.06) 0deg 10deg,
                transparent 10deg 20deg
              )
            `,
            borderRadius: '0 0 0 100%',
          }} />

          {/* Content */}
          <div
            dir={isRtl ? 'rtl' : 'ltr'}
            style={{
              position: 'relative', zIndex: 1,
              width: '100%', maxWidth: '1260px', margin: '0 auto',
              padding: 'clamp(120px, 18vw, 180px) clamp(24px, 5vw, 48px) clamp(52px, 6vw, 72px)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
            }}
          >
            {/* Eyebrow */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div style={{ height: '1px', width: '40px', background: '#c8a84b' }} />
              <span style={{ color: '#c8a84b', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.25em' }}>
                {t.hero.eyebrow[language]}
              </span>
              <div style={{ height: '1px', width: '40px', background: '#c8a84b' }} />
            </div>

            {/* Title */}
            <h1 style={{
              color: '#ffffff',
              fontSize: 'clamp(2.4rem, 6vw, 4.2rem)',
              fontWeight: 900,
              lineHeight: 1.05,
              marginBottom: '20px',
              maxWidth: '800px',
              textShadow: '0 4px 24px rgba(0,0,0,0.7)',
              letterSpacing: '-0.02em',
            }}>
              {t.hero.title[language]}
            </h1>

            {/* Description */}
            <p style={{
              color: 'rgba(255,255,255,0.75)',
              fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
              maxWidth: '580px',
              lineHeight: 1.65,
              marginBottom: '36px',
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
            }}>
              {t.hero.desc[language]}
            </p>

            {/* CTA */}
            <button
              onClick={() => setShowForm(true)}
              style={{
                padding: '14px 36px', borderRadius: '100px',
                background: 'linear-gradient(135deg, #8b1a2a, #c8a84b)',
                color: '#fff', fontSize: '1rem', fontWeight: 700,
                border: 'none', cursor: 'pointer',
                boxShadow: '0 8px 28px rgba(139,26,42,0.45)',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 36px rgba(139,26,42,0.55)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 28px rgba(139,26,42,0.45)'; }}
            >
              {t.hero.cta[language]}
            </button>
          </div>
        </section>

        {/* ── Filters Section ── */}
        <section
          dir={isRtl ? 'rtl' : 'ltr'}
          style={{
            maxWidth: '1260px', margin: '0 auto',
            padding: '40px clamp(16px, 4vw, 40px) 0',
          }}
        >
          <AdSlot page="student_projects" position="top" className="mb-6" />
          {/* Search + Sort row */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
            {/* Search */}
            <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
              <Search size={16} style={{
                position: 'absolute', top: '50%', transform: 'translateY(-50%)',
                ...(isRtl ? { right: '12px' } : { left: '12px' }),
                color: 'rgba(255,255,255,0.35)', pointerEvents: 'none',
              }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder[language]}
                style={{
                  width: '100%', padding: isRtl ? '10px 40px 10px 14px' : '10px 14px 10px 40px',
                  border: '1px solid var(--border, rgba(255,255,255,0.08))',
                  borderRadius: '12px', fontSize: '0.88rem',
                  background: 'var(--bg-1, rgba(255,255,255,0.04))',
                  color: 'var(--text-1, #fff)', outline: 'none',
                  fontFamily: 'inherit', boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(200,168,75,0.4)'; }}
                onBlur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border, rgba(255,255,255,0.08))'; }}
              />
            </div>

            {/* Sort Buttons */}
            {/* <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
              {(['newest', 'featured', 'az'] as SortMode[]).map((mode) => {
                const labels: Record<SortMode, string> = {
                  newest: t.sortNewest[language],
                  featured: t.sortFeatured[language],
                  az: t.sortAZ[language],
                };
                const isActive = sortMode === mode;
                return (
                  <button
                    key={mode}
                    onClick={() => setSortMode(mode)}
                    style={{
                      padding: '8px 14px', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 600,
                      border: '1px solid transparent', cursor: 'pointer', transition: 'all 0.2s ease',
                      background: isActive ? 'rgba(200,168,75,0.15)' : 'var(--bg-1, rgba(255,255,255,0.04))',
                      color: isActive ? '#c8a84b' : 'var(--text-2, rgba(255,255,255,0.55))',
                      borderColor: isActive ? 'rgba(200,168,75,0.3)' : 'var(--border, rgba(255,255,255,0.08))',
                    }}
                  >
                    {labels[mode]}
                  </button>
                );
              })}
            </div> */}
          </div>

          {/* Category Pills */}
          <ProjectCategoryFilter
            categories={categories ?? []}
            activeCategoryId={activeCategoryId}
            onSelectCategory={setActiveCategoryId}
          />
        </section>

        {/* ── Projects Grid ── */}
        <section
          dir={isRtl ? 'rtl' : 'ltr'}
          style={{
            maxWidth: '1260px', margin: '0 auto',
            padding: '32px clamp(16px, 4vw, 40px) 80px',
          }}
        >
          {/* Count label */}
          {!isLoading && filtered.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
              <div style={{ height: '1px', flex: 1, background: 'var(--border, rgba(255,255,255,0.06))' }} />
              <span style={{ color: '#c8a84b', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                {filtered.length} {language === 'ar' ? 'مشروع' : language === 'tr' ? 'Proje' : 'Projects'}
              </span>
              <div style={{ height: '1px', flex: 1, background: 'var(--border, rgba(255,255,255,0.06))' }} />
            </div>
          )}

          {isLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{
                  background: 'var(--bg-1, #0d0f14)',
                  border: '1px solid var(--border)',
                  borderRadius: '20px', overflow: 'hidden',
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}>
                  <div style={{ aspectRatio: '16/10', background: 'var(--bg-2, #1a1c22)' }} />
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ height: '16px', borderRadius: '6px', background: 'var(--bg-2)', width: '70%' }} />
                    <div style={{ height: '12px', borderRadius: '6px', background: 'var(--bg-2)', width: '90%' }} />
                    <div style={{ height: '12px', borderRadius: '6px', background: 'var(--bg-2)', width: '60%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {filtered.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center', padding: '80px 20px',
              background: 'var(--bg-1, rgba(255,255,255,0.02))',
              border: '1px solid var(--border)', borderRadius: '24px',
            }}>
              <div style={{ fontSize: '4rem', marginBottom: '16px' }}>💼</div>
              <h3 style={{ color: 'var(--text-1, #fff)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '8px' }}>
                {activeCategoryId || searchQuery ? t.noProjects[language] : t.noProjectsYet[language]}
              </h3>
              <p style={{ color: 'var(--text-3, rgba(255,255,255,0.4))', fontSize: '0.88rem' }}>
                {language === 'ar' ? 'كن أول من يسجل مشروعه!' : language === 'tr' ? 'İlk projenizi kaydedin!' : 'Be the first to register a project!'}
              </p>
            </div>
          )}
        </section>

        {/* ── Submit CTA Section ── */}
        <section
          dir={isRtl ? 'rtl' : 'ltr'}
          style={{
            maxWidth: '1260px', margin: '0 auto',
            padding: '0 clamp(16px, 4vw, 40px) 80px',
          }}
        >
          <AdSlot page="student_projects" position="bottom" className="mb-8" />
          <div style={{
            position: 'relative', overflow: 'hidden',
            background: 'linear-gradient(135deg, rgba(139,26,42,0.2) 0%, rgba(200,168,75,0.08) 100%)',
            border: '1px solid rgba(200,168,75,0.15)',
            borderRadius: '28px', padding: 'clamp(36px, 6vw, 56px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            textAlign: 'center', gap: '20px',
          }}>
            {/* Background pattern */}
            <div aria-hidden="true" style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(200,168,75,0.06) 1px, transparent 0)',
              backgroundSize: '28px 28px',
              pointerEvents: 'none',
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '20px',
                background: 'rgba(200,168,75,0.15)', border: '1px solid rgba(200,168,75,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px', color: '#c8a84b',
              }}>
                <Briefcase size={28} />
              </div>
              <h2 style={{ color: '#ae8d5cff', fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, marginBottom: '12px' }}>
                {t.submitSection.title[language]}
              </h2>
              <p style={{ color: '#5b646bff', fontSize: '1rem', maxWidth: '480px', lineHeight: 1.65, marginBottom: '28px' }}>
                {t.submitSection.desc[language]}
              </p>
              <button
                onClick={() => setShowForm(true)}
                style={{
                  padding: '14px 40px', borderRadius: '100px',
                  background: '#7a1c1c', color: '#fff',
                  fontWeight: 700, fontSize: '1rem', border: 'none',
                  cursor: 'pointer', boxShadow: '0 8px 24px rgba(122,28,28,0.45)',
                  transition: 'all 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = '#8f2020';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = '#7a1c1c';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                }}
              >
                {t.submitSection.button[language]}
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ── Submission Modal ── */}
      {showForm && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setShowForm(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 100,
              background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)',
            }}
          />
          {/* Drawer / Modal */}
          <div
            dir={isRtl ? 'rtl' : 'ltr'}
            style={{
              position: 'fixed', zIndex: 101,
              bottom: 0, left: 0, right: 0,
              background: 'var(--bg-1, #0d0f14)',
              borderTop: '1px solid var(--border, rgba(255,255,255,0.08))',
              borderTopLeftRadius: '28px', borderTopRightRadius: '28px',
              maxHeight: '90vh', overflowY: 'auto',
              boxShadow: '0 -20px 60px rgba(0,0,0,0.7)',
            }}
          >
            {/* Drag handle */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
              <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.15)' }} />
            </div>
            <ProjectSubmissionForm onClose={() => setShowForm(false)} />
          </div>
        </>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </ProjectsLayout>
  );
}
