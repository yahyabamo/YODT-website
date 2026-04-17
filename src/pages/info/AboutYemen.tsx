import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { InfoHero } from '@/components/features/info/InfoHero';
import { ArticleCard } from '@/components/features/info/ArticleCard';
import { fetchArticles, InfoArticle } from '@/service/infoCMS';

const STATIC_SECTIONS = [
  {
    icon: '🇾🇪',
    title: 'اليمن السعيد — أرض الحضارة والتاريخ',
    body: `اليمن، ذلك البلد العريق الذي شهد ميلاد حضارات إنسانية راسخة، من مملكة سبأ الأسطورية إلى حضرموت ذات الطراز المعماري الفريد. أرضٌ تفخر بلغة القرآن الكريم، وبتاريخ لم يكتبه الزمن إلا بمداد الذهب.

اليمنيون المقيمون في إسطنبول يحملون معهم هذا الإرث الحضاري العميق، ويسعون يومياً إلى نقله للأجيال القادمة وإثراء التجربة الإنسانية المشتركة في ربوع هذه المدينة الكبيرة.`,
  },
  {
    icon: '🏛️',
    title: 'الحضارة اليمنية عبر التاريخ',
    body: `شهد اليمن قيام حضارات عريقة أسهمت في تشكيل الثقافة الإنسانية؛ فمملكة سبأ التي ثبّتت اسمها في الكتب السماوية، ودولة المعين التجارية التي حكمت طرق التوابل، والممالك الحميرية والقتبانية والحضرمية، كلها شواهد على عراقة وعمق الحضارة اليمنية.

الآثار اليمنية، كالمدرج ومدينة شبام "ناطحات سحاب الطين"، مدرجةٌ على قائمة اليونسكو للتراث الإنساني المشترك، وهي شاهدٌ دائم على عبقرية الإنسان اليمني.`,
  },
  {
    icon: '🤝',
    title: 'الجالية اليمنية في إسطنبول',
    body: `تُعدّ الجالية اليمنية في إسطنبول من بين أكثر الجاليات العربية تماسكاً وتنظيماً في المدينة. يتوزع أبناؤها في مختلف أحياء إسطنبول، ويحافظون على هويتهم الثقافية من خلال فعاليات وتجمعات منتظمة تجمع بين الترابط الاجتماعي والنمو المهني.

اتحاد الطلاب اليمنيين في إسطنبول يمثّل الرابط الأقوى بين أبناء الجالية الطلابية، ويوفر لهم بيئةً داعمة تساعدهم على الاندماج الإيجابي في الحياة التركية مع الحفاظ على انتمائهم وهويتهم.`,
  },
];

function SectionBlock({ icon, title, body }: { icon: string; title: string; body: string }) {
  return (
    <div style={{
      background: 'var(--bg-1, #0d0f14)',
      border: '1px solid var(--border, rgba(255,255,255,0.07))',
      borderRadius: '16px', padding: '28px 24px',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
        <div style={{
          width: '48px', height: '48px', borderRadius: '12px', flexShrink: 0,
          background: 'rgba(22,100,58,0.15)', border: '1px solid rgba(22,100,58,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
        }}>
          {icon}
        </div>
        <div>
          <h3 style={{ color: 'var(--text, #f0ece4)', fontSize: '1.05rem', fontWeight: 700, marginBottom: '12px' }}>
            {title}
          </h3>
          <p style={{
            color: 'var(--text-2, #b8b4ac)', fontSize: '0.88rem',
            lineHeight: 1.85, margin: 0, whiteSpace: 'pre-line',
          }}>
            {body}
          </p>
        </div>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div style={{
      background: 'var(--bg-1)', border: '1px solid var(--border)',
      borderRadius: '16px', overflow: 'hidden',
    }}>
      <div style={{ aspectRatio: '16/9', background: 'var(--bg-2)', animation: 'pulse 1.5s infinite' }} />
      <div style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ height: '16px', borderRadius: '8px', background: 'var(--bg-2)', width: '80%' }} />
        <div style={{ height: '12px', borderRadius: '8px', background: 'var(--bg-2)', width: '60%' }} />
      </div>
    </div>
  );
}

export default function AboutYemen() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<InfoArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles('yemen')
      .then(setArticles)
      .catch(console.error)
      .finally(() => setLoading(false));
    window.scrollTo(0, 0);
  }, []);

  return (
    <div style={{ background: 'var(--bg, #07080b)', minHeight: '100vh', paddingTop: '72px' }}>
      {/* Return button */}
      <div style={{ maxWidth: '1260px', margin: '0 auto', padding: '24px clamp(16px, 4vw, 40px) 0' }}>
        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 16px', borderRadius: '12px',
            background: 'var(--bg-1, #0d0f14)', border: '1px solid var(--border)',
            color: 'var(--text-2)', fontSize: '0.85rem', fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'var(--bg-2)';
            (e.currentTarget as HTMLElement).style.color = '#c8a84b';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'var(--bg-1)';
            (e.currentTarget as HTMLElement).style.color = 'var(--text-2)';
          }}
        >
          <ArrowRight size={16} />
          <span>العودة للرئيسية</span>
        </button>
      </div>

      <InfoHero
        eyebrow="عن اليمن"
        title="اليمن السعيد — موطن الحضارة"
        description="رحلة في عمق التاريخ والثقافة اليمنية، واكتشاف دور الجالية اليمنية في إسطنبول"
        gradient="linear-gradient(135deg, #07080b 0%, #051a0c 40%, #07080b 100%)"
      />

      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '64px clamp(16px, 4vw, 40px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
          <div style={{ height: '1px', flex: 1, background: 'var(--border)' }} />
          <span style={{ color: '#c8a84b', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            اليمن وتاريخها
          </span>
          <div style={{ height: '1px', flex: 1, background: 'var(--border)' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {STATIC_SECTIONS.map(section => (
            <SectionBlock key={section.title} {...section} />
          ))}
        </div>
      </section>

      <section style={{ maxWidth: '1260px', margin: '0 auto', padding: '0 clamp(16px, 4vw, 40px) 80px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
          <div style={{ height: '1px', flex: 1, background: 'var(--border)' }} />
          <span style={{ color: '#c8a84b', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            مقالات عن اليمن
          </span>
          <div style={{ height: '1px', flex: 1, background: 'var(--border)' }} />
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} />)}
          </div>
        ) : articles.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {articles.map(a => <ArticleCard key={a.id} article={a} />)}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-3)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📰</div>
            <p style={{ fontSize: '0.9rem' }}>لا توجد مقالات متاحة حالياً</p>
          </div>
        )}
      </section>
    </div>
  );
}
