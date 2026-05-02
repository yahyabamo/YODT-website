import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, GraduationCap, Users, Medal, Trophy, ChevronLeft, Image } from 'lucide-react';
import { B } from './info/CMSShared';

const SECTIONS = [
  {
    id: 'articles',
    title: 'المقالات',
    description: 'إدارة مقالات إسطنبول، اليمن، والمحتوى العام',
    icon: FileText,
    path: '/admin/info/articles',
    color: '#3b82f6'
  },
  {
    id: 'universities',
    title: 'الجامعات',
    description: 'دليل الجامعات التركية وشروط القبول',
    icon: GraduationCap,
    path: '/admin/info/universities',
    color: '#10b981'
  },
  {
    id: 'students',
    title: 'كادر الاتحاد',
    description: 'إدارة أعضاء هيئة الاتحاد',
    icon: Users,
    path: '/admin/info/students',
    color: '#f59e0b'
  },
  {
    id: 'icons',
    title: 'رموزنا',
    description: 'توثيق الشخصيات والرموز الوطنية اليمنية',
    icon: Medal,
    path: '/admin/info/icons',
    color: '#8b5cf6'
  },
  {
    id: 'achievements',
    title: 'إنجازات',
    description: 'سجل الفخر والجوائز للجالية اليمنية',
    icon: Trophy,
    path: '/admin/info/achievements',
    color: '#ec4899'
  },
  {
    id: 'hero-images',
    title: 'خلفيات صفحات Hero',
    description: 'أضف صوراً متعددة لخلفية قسم البطل في كل صفحة — عرض شرائح تلقائي',
    icon: Image,
    path: '/admin/info/hero-images',
    color: '#f97316',
  },
];

export default function InfoCMSAdmin() {
  const navigate = useNavigate();

  return (
    <div style={{ direction: 'rtl' }}>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: '#111' }}>إدارة المحتوى المعلوماتي</h2>
        <p style={{ margin: 0, fontSize: 14, color: '#6b7280', marginTop: 4 }}>
          اختر القسم الذي ترغب في تعديل محتواه من القائمة أدناه
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        {SECTIONS.map(s => (
          <div
            key={s.id}
            onClick={() => navigate(s.path)}
            style={{
              background: '#fff', border: '1px solid #e5e7eb', borderRadius: 24,
              padding: '24px 28px', cursor: 'pointer', transition: 'all 0.2s ease',
              display: 'flex', flexDirection: 'column', gap: 16,
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.06)';
              e.currentTarget.style.borderColor = B;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
              e.currentTarget.style.borderColor = '#e5e7eb';
            }}
          >
            <div style={{
              width: 52, height: 52, borderRadius: 16,
              background: `${s.color}15`, color: s.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <s.icon size={26} />
            </div>

            <div>
              <div style={{ fontWeight: 900, fontSize: 18, color: '#111', marginBottom: 6 }}>{s.title}</div>
              <p style={{ margin: 0, fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>{s.description}</p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, color: B, fontSize: 13, fontWeight: 800 }}>
              دخول القسم <ChevronLeft size={16} />
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 40, background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 20, padding: 24 }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: 15, fontWeight: 800 }}>💡 نصيحة سريعة</h4>
        <p style={{ margin: 0, fontSize: 13, color: '#4b5563', lineHeight: 1.6 }}>
          المحتوى الذي تقوم بتعديله هنا يظهر فوراً في الصفحات العامة للموقع. تأكد من مراجعة الصور والنصوص وبأن حالة "النشر" مفعلة ليراها الجميع. يمكنك دائماً إخفاء أي عنصر مؤقتاً بالضغط على أيقونة العين في صفحة العرض.
        </p>
      </div>
    </div>
  );
}
