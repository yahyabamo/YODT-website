import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { getField, studentProjectsText } from '@/i18n/pages';
import type { ProjectCategory } from '@/services/studentProjectsService';

interface ProjectCategoryFilterProps {
  categories: ProjectCategory[];
  activeCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
}

export function ProjectCategoryFilter({
  categories,
  activeCategoryId,
  onSelectCategory,
}: ProjectCategoryFilterProps) {
  const { language } = useLanguage();
  const t = studentProjectsText;

  if (!categories || categories.length === 0) return null;

  const btnBase: React.CSSProperties = {
    padding: '8px 18px',
    borderRadius: '100px',
    fontSize: '0.82rem',
    fontWeight: 600,
    cursor: 'pointer',
    border: '1px solid transparent',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  };

  const activeStyle: React.CSSProperties = {
    ...btnBase,
    background: '#c8a84b',
    color: '#1a1208',
    borderColor: '#c8a84b',
    boxShadow: '0 4px 14px rgba(200,168,75,0.35)',
  };

  const inactiveStyle: React.CSSProperties = {
    ...btnBase,
    background: 'var(--bg-1, rgba(255,255,255,0.04))',
    color: 'var(--text-2, rgba(255,255,255,0.65))',
    borderColor: 'var(--border, rgba(255,255,255,0.08))',
  };

  return (
    <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '8px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          minWidth: 'max-content',
          direction: language === 'ar' ? 'rtl' : 'ltr',
        }}
      >
        {/* All button */}
        <button
          onClick={() => onSelectCategory(null)}
          style={activeCategoryId === null ? activeStyle : inactiveStyle}
          onMouseEnter={(e) => {
            if (activeCategoryId !== null) {
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(200,168,75,0.3)';
              (e.currentTarget as HTMLElement).style.color = '#c8a84b';
            }
          }}
          onMouseLeave={(e) => {
            if (activeCategoryId !== null) {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--border, rgba(255,255,255,0.08))';
              (e.currentTarget as HTMLElement).style.color = 'var(--text-2, rgba(255,255,255,0.65))';
            }
          }}
        >
          ✦ {t.allCategories[language]}
        </button>

        {categories.map((cat) => {
          const isActive = activeCategoryId === cat.id;
          const catName = getField(cat, 'name', language);
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              style={isActive ? activeStyle : inactiveStyle}
              onMouseEnter={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(200,168,75,0.3)';
                  (e.currentTarget as HTMLElement).style.color = '#c8a84b';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--border, rgba(255,255,255,0.08))';
                  (e.currentTarget as HTMLElement).style.color = 'var(--text-2, rgba(255,255,255,0.65))';
                }
              }}
            >
              {cat.icon && <span style={{ fontSize: '1em' }}>{cat.icon}</span>}
              {catName}
            </button>
          );
        })}
      </div>
    </div>
  );
}
