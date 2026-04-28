import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Instagram, MessageCircle, Globe, MapPin, Star, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { studentProjectsText, getField } from '@/i18n/pages';
import { useStudentProjectBySlug, useProjectImages } from '@/hooks/studentProjects/useStudentProjects';
import { ProjectSubmissionForm } from '@/components/student-projects/ProjectSubmissionForm';
import { ProjectsLayout } from '@/components/student-projects/ProjectsLayout';
import { useProjectsNavigation } from '@/hooks/studentProjects/useProjectsNavigation';

export default function StudentProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const { goBack } = useProjectsNavigation();
  const t = studentProjectsText;
  const isRtl = language === 'ar';
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  const { data: project, isLoading } = useStudentProjectBySlug(slug ?? '');
  const { data: images } = useProjectImages(project?.id ?? '');

  const [galleryIdx, setGalleryIdx] = useState(0);
  const [showForm, setShowForm] = useState(false);

  // Build full gallery: cover + extra images
  const gallery = [
    ...(project?.cover_image_url ? [project.cover_image_url] : []),
    ...(images?.map((img) => img.image_url) ?? []),
  ].filter(Boolean);

  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  const name = project ? getField(project, 'name', language) : '';
  const description = project ? getField(project, 'description', language) : '';
  const categoryName = project?.project_categories
    ? getField(project.project_categories, 'name', language)
    : null;

  const prevImg = () => setGalleryIdx((i) => (i === 0 ? gallery.length - 1 : i - 1));
  const nextImg = () => setGalleryIdx((i) => (i === gallery.length - 1 ? 0 : i + 1));

  if (isLoading) {
    return (
      <ProjectsLayout>
        <div style={{ background: 'var(--bg, #07080b)', minHeight: '100vh', paddingTop: '120px' }}>
          <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 clamp(16px,4vw,40px)' }}>
            <div style={{ animation: 'pulse 1.5s infinite' }}>
              <div style={{ height: '400px', borderRadius: '24px', background: 'var(--bg-1)', marginBottom: '32px' }} />
              <div style={{ height: '28px', borderRadius: '8px', background: 'var(--bg-1)', width: '60%', marginBottom: '16px' }} />
              <div style={{ height: '16px', borderRadius: '8px', background: 'var(--bg-1)', width: '90%', marginBottom: '12px' }} />
              <div style={{ height: '16px', borderRadius: '8px', background: 'var(--bg-1)', width: '75%' }} />
            </div>
          </div>
        </div>
        <style>{`@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }`}</style>
      </ProjectsLayout>
    );
  }

  if (!project) {
    return (
      <ProjectsLayout>
        <div style={{ background: 'var(--bg, #07080b)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🔍</div>
            <h2 style={{ color: 'var(--text-1, #fff)', marginBottom: '16px' }}>
              {language === 'ar' ? 'لم يتم العثور على المشروع' : language === 'tr' ? 'Proje bulunamadı' : 'Project not found'}
            </h2>
            <button onClick={goBack} style={{ padding: '10px 24px', borderRadius: '12px', background: '#7a1c1c', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
              {t.backToProjects[language]}
            </button>
          </div>
        </div>
      </ProjectsLayout>
    );
  }

  return (
    <ProjectsLayout>
      <div style={{ background: 'var(--bg, #07080b)', minHeight: '100vh', paddingTop: '80px' }}>
        <div
          dir={isRtl ? 'rtl' : 'ltr'}
          style={{ maxWidth: '960px', margin: '0 auto', padding: '40px clamp(16px, 4vw, 40px) 80px' }}
        >
          {/* Back Button */}
          <button
            onClick={() => window.history.back()}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 16px', borderRadius: '12px', marginBottom: '32px',
              background: 'var(--bg-1, rgba(255,255,255,0.04))',
              border: '1px solid var(--border, rgba(255,255,255,0.08))',
              color: 'var(--text-2, rgba(255,255,255,0.65))',
              fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#c8a84b'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(200,168,75,0.3)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--text-2, rgba(255,255,255,0.65))'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border, rgba(255,255,255,0.08))'; }}
          >
            <BackIcon size={16} />
            {t.backToProjects[language]}
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,380px)', gap: '36px', alignItems: 'start' }}>

            {/* ── Left / Main Column ── */}
            <div style={{ minWidth: 0 }}>

              {/* Gallery */}
              {gallery.length > 0 && (
                <div style={{ position: 'relative', marginBottom: '28px' }}>
                  <div style={{
                    borderRadius: '20px', overflow: 'hidden',
                    aspectRatio: '16/10', background: 'var(--bg-1)',
                    position: 'relative',
                  }}>
                    <img
                      src={gallery[galleryIdx]}
                      alt={name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'opacity 0.3s ease' }}
                    />

                    {/* Featured badge */}
                    {project.featured && (
                      <div style={{
                        position: 'absolute', top: '14px',
                        ...(isRtl ? { right: '14px' } : { left: '14px' }),
                        display: 'flex', alignItems: 'center', gap: '5px',
                        padding: '5px 12px', borderRadius: '20px',
                        background: 'rgba(200,168,75,0.95)',
                        color: '#1a1208', fontSize: '0.72rem', fontWeight: 800,
                      }}>
                        <Star size={11} fill="currentColor" /> {t.featured[language]}
                      </div>
                    )}

                    {/* Gallery arrows */}
                    {gallery.length > 1 && (
                      <>
                        <button
                          onClick={prevImg}
                          style={{
                            position: 'absolute', top: '50%', transform: 'translateY(-50%)',
                            ...(isRtl ? { right: '12px' } : { left: '12px' }),
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                            border: '1px solid rgba(255,255,255,0.15)', color: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                        >
                          {isRtl ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                        </button>
                        <button
                          onClick={nextImg}
                          style={{
                            position: 'absolute', top: '50%', transform: 'translateY(-50%)',
                            ...(isRtl ? { left: '12px' } : { right: '12px' }),
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                            border: '1px solid rgba(255,255,255,0.15)', color: '#fff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                        >
                          {isRtl ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                        </button>
                      </>
                    )}
                  </div>

                  {/* Thumbnails */}
                  {gallery.length > 1 && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px', overflowX: 'auto' }}>
                      {gallery.map((url, i) => (
                        <button
                          key={i}
                          onClick={() => setGalleryIdx(i)}
                          style={{
                            flexShrink: 0, width: '72px', height: '52px',
                            borderRadius: '10px', overflow: 'hidden', padding: 0, border: 'none',
                            cursor: 'pointer', outline: 'none',
                            boxShadow: i === galleryIdx ? '0 0 0 2px #c8a84b' : 'none',
                            transition: 'all 0.2s ease', opacity: i === galleryIdx ? 1 : 0.55,
                          }}
                        >
                          <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Title + Category */}
              <div style={{ marginBottom: '16px' }}>
                {categoryName && (
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '4px 12px', borderRadius: '20px', marginBottom: '12px',
                    background: 'rgba(200,168,75,0.1)', border: '1px solid rgba(200,168,75,0.2)',
                    color: '#c8a84b', fontSize: '0.75rem', fontWeight: 700,
                  }}>
                    {project.project_categories?.icon && <span>{project.project_categories.icon}</span>}
                    {categoryName}
                  </div>
                )}
                <h1 style={{ color: 'var(--text-1, #9d4747ff)', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 900, lineHeight: 1.1, margin: 0 }}>
                  {name}
                </h1>
              </div>

              {/* Description */}
              {description && (
                <p style={{ color: 'var(--text-2, rgba(255,255,255,0.7))', lineHeight: 1.8, fontSize: '1rem', marginBottom: '28px' }}>
                  {description}
                </p>
              )}

              {/* Services */}
              {(project.services_ar || project.services_en || project.services_tr) && (() => {
                const servicesStr = getField(project, 'services', language);
                if (!servicesStr) return null;
                const items = servicesStr.split(',').map((s) => s.trim()).filter(Boolean);
                return (
                  <div style={{ marginBottom: '28px' }}>
                    <h3 style={{ color: '#c8a84b', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '14px' }}>
                      {t.services[language]}
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {items.map((item, i) => (
                        <span key={i} style={{
                          padding: '6px 14px', borderRadius: '100px', fontSize: '0.82rem', fontWeight: 600,
                          background: 'var(--bg-1, rgba(255,255,255,0.05))',
                          border: '1px solid var(--border, rgba(255,255,255,0.08))',
                          color: 'var(--text-2, rgba(255,255,255,0.7))',
                        }}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* ── Right / Info Column ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '100px' }}>

              {/* Info Card */}
              <div style={{
                background: 'var(--bg-1, #0d0f14)',
                border: '1px solid var(--border, rgba(255,255,255,0.08))',
                borderRadius: '20px', padding: '24px',
                display: 'flex', flexDirection: 'column', gap: '16px',
              }}>
                <h3 style={{ color: '#c8a84b', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0 }}>
                  {t.contactVia[language]}
                </h3>

                {project.instagram && (
                  <ContactLink
                    href={`https://instagram.com/${project.instagram.replace('@', '')}`}
                    icon={<Instagram size={18} />}
                    label={`@${project.instagram.replace('@', '')}`}
                    color="#e1306c"
                  />
                )}
                {project.whatsapp && (
                  <ContactLink
                    href={`https://wa.me/${project.whatsapp.replace(/[^0-9]/g, '')}`}
                    icon={<MessageCircle size={18} />}
                    label={project.whatsapp}
                    color="#25d366"
                  />
                )}
                {project.website && (
                  <ContactLink
                    href={project.website.startsWith('http') ? project.website : `https://${project.website}`}
                    icon={<Globe size={18} />}
                    label={t.visitWebsite[language]}
                    color="#c8a84b"
                  />
                )}

                {/* Divider */}
                {(project.owner_name || project.university || project.location) && (
                  <div style={{ height: '1px', background: 'var(--border, rgba(111, 102, 13, 0.06))' }} />
                )}


                {project.owner_name && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ color: '#c8a84b', fontSize: '0.85rem', fontWeight: 500 }}>
                      {t.owner[language]}
                    </span>
                    <span style={{ color: 'var(--text-2, rgba(255,255,255,0.65))', fontSize: '0.85rem' }}>
                      {project.owner_name}
                    </span>
                  </div>
                )}
                {/* {project.university && (
                  <InfoRow label={t.university[language]} value={project.university} />
                )} */}
                {project.location && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <MapPin size={14} style={{ color: '#c8a84b', marginTop: '3px', flexShrink: 0 }} />
                    <span style={{ color: 'var(--text-2, rgba(255,255,255,0.65))', fontSize: '0.85rem' }}>
                      {project.location}
                    </span>
                  </div>
                )}
              </div>

              {/* Register Your Project CTA */}
              {/* <button
                onClick={() => setShowForm(true)}
                style={{
                  padding: '14px', borderRadius: '14px', width: '100%',
                  background: 'rgba(139,26,42,0.15)', border: '1px solid rgba(139,26,42,0.3)',
                  color: '#fff', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(139,26,42,0.3)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(139,26,42,0.15)'; }}
              >
                {t.submitSection.button[language]}
              </button> */}
            </div>
          </div>
        </div>
      </div>

      {/* Submission Modal */}
      {showForm && (
        <>
          <div onClick={() => setShowForm(false)} style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }} />
          <div dir={isRtl ? 'rtl' : 'ltr'} style={{
            position: 'fixed', zIndex: 101,
            bottom: 0, left: 0, right: 0,
            background: 'var(--bg-1, #0d0f14)',
            borderTop: '1px solid var(--border)',
            borderTopLeftRadius: '28px', borderTopRightRadius: '28px',
            maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 -20px 60px rgba(0,0,0,0.7)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
              <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.15)' }} />
            </div>
            <ProjectSubmissionForm onClose={() => setShowForm(false)} />
          </div>
        </>
      )}

      <style>{`@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }`}</style>
    </ProjectsLayout>
  );
}

function ContactLink({ href, icon, label, color }: { href: string; icon: React.ReactNode; label: string; color: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: '10px 14px', borderRadius: '12px',
        background: `rgba(${hexToRgb(color)}, 0.1)`,
        border: `1px solid rgba(${hexToRgb(color)}, 0.2)`,
        color, textDecoration: 'none', fontWeight: 600, fontSize: '0.88rem',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = `rgba(${hexToRgb(color)}, 0.2)`; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = `rgba(${hexToRgb(color)}, 0.1)`; }}
    >
      {icon}
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
    </a>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '3px' }}>
        {label}
      </span>
      <span style={{ color: 'var(--text-1, #fff)', fontWeight: 600, fontSize: '0.9rem' }}>{value}</span>
    </div>
  );
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '200,168,75';
}
