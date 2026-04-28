import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Instagram, MessageCircle, Globe, Star, ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { getField, studentProjectsText } from '@/i18n/pages';
import type { StudentProject } from '@/services/studentProjectsService';

interface ProjectCardProps {
  project: StudentProject;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const t = studentProjectsText;

  const name = getField(project, 'name', language);
  const description = getField(project, 'description', language);
  const categoryName = project.project_categories
    ? getField(project.project_categories, 'name', language)
    : null;

  const isRtl = language === 'ar';
  const ArrowIcon = isRtl ? ArrowLeft : ArrowRight;

  return (
    <article
      onClick={() => navigate(`/student-projects/${project.slug}`)}
      style={{
        background: 'var(--bg-1, #0d0f14)',
        border: '1px solid var(--border, rgba(255,255,255,0.08))',
        borderRadius: '20px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-6px)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 20px 60px rgba(0,0,0,0.35), 0 0 0 1px rgba(200,168,75,0.15)';
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(200,168,75,0.25)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border, rgba(255,255,255,0.08))';
      }}
    >
      {/* Cover Image */}
      <div style={{ position: 'relative', aspectRatio: '16/10', overflow: 'hidden', background: 'var(--bg-2, #1a1c22)' }}>
        {project.cover_image_url ? (
          <img
            src={project.cover_image_url}
            alt={name}
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, rgba(139,26,42,0.3) 0%, rgba(200,168,75,0.1) 100%)',
            fontSize: '3rem',
          }}>
            {project.project_categories?.icon ?? '✨'}
          </div>
        )}

        {/* Featured Badge */}
        {project.featured && (
          <div style={{
            position: 'absolute', top: '10px',
            ...(isRtl ? { right: '10px' } : { left: '10px' }),
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '4px 10px', borderRadius: '20px',
            background: 'rgba(200,168,75,0.95)',
            backdropFilter: 'blur(8px)',
            color: '#1a1208', fontSize: '0.7rem', fontWeight: 800,
          }}>
            <Star size={10} fill="currentColor" />
            {t.featured[language]}
          </div>
        )}

        {/* Category Badge */}
        {categoryName && (
          <div style={{
            position: 'absolute', bottom: '10px',
            ...(isRtl ? { left: '10px' } : { right: '10px' }),
            padding: '3px 10px', borderRadius: '20px',
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(8px)',
            color: 'rgba(255,255,255,0.9)',
            fontSize: '0.7rem', fontWeight: 600,
          }}>
            {project.project_categories?.icon && <span style={{ marginInlineEnd: '4px' }}>{project.project_categories.icon}</span>}
            {categoryName}
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', direction: isRtl ? 'rtl' : 'ltr' }}>
        <h3 style={{
          fontSize: '1rem', fontWeight: 700,
          color: 'var(--text-1, #c13f3fff)',
          lineHeight: 1.3,
          margin: 0,
          overflow: 'hidden', display: '-webkit-box',
          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        }}>
          {name}
        </h3>

        {description && (
          <p style={{
            fontSize: '0.82rem', color: 'var(--text-3, rgba(255,255,255,0.5))',
            lineHeight: 1.55, margin: 0, flex: 1,
            overflow: 'hidden', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>
            {description}
          </p>
        )}

        {/* Social Icons Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 'auto' }}>
          {project.instagram && (
            <a
              href={`https://instagram.com/${project.instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '30px', height: '30px', borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(225,48,108,0.12)', color: '#e1306c',
                transition: 'all 0.2s ease', textDecoration: 'none',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(225,48,108,0.22)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(225,48,108,0.12)'; }}
            >
              <Instagram size={14} />
            </a>
          )}
          {project.whatsapp && (
            <a
              href={`https://wa.me/${project.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '30px', height: '30px', borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(37,211,102,0.12)', color: '#25d366',
                transition: 'all 0.2s ease', textDecoration: 'none',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(37,211,102,0.22)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(37,211,102,0.12)'; }}
            >
              <MessageCircle size={14} />
            </a>
          )}
          {project.website && (
            <a
              href={project.website.startsWith('http') ? project.website : `https://${project.website}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '30px', height: '30px', borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(200,168,75,0.12)', color: '#c8a84b',
                transition: 'all 0.2s ease', textDecoration: 'none',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(200,168,75,0.22)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(200,168,75,0.12)'; }}
            >
              <Globe size={14} />
            </a>
          )}

          {/* View Details → pushed to end */}
          <button
            onClick={(e) => { e.stopPropagation(); navigate(`/student-projects/${project.slug}`); }}
            style={{
              marginInlineStart: 'auto',
              display: 'flex', alignItems: 'center', gap: '4px',
              padding: '6px 12px', borderRadius: '10px',
              background: 'rgba(200,168,75,0.12)', border: '1px solid rgba(200,168,75,0.2)',
              color: '#c8a84b', fontSize: '0.75rem', fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.2s ease', whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(200,168,75,0.22)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(200,168,75,0.4)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(200,168,75,0.12)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(200,168,75,0.2)';
            }}
          >
            {t.viewDetails[language]}
            <ArrowIcon size={12} />
          </button>
        </div>
      </div>
    </article>
  );
}
