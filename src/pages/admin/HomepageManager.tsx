import React, { useState } from 'react';
import { Layout } from 'lucide-react';
import { B } from './homepage/HomepageShared';
import DiscountsTab from './homepage/DiscountsTab';
import ActivitiesTab from './homepage/ActivitiesTab';
import PartnersTab from './homepage/PartnersTab';
import FooterTab from './homepage/FooterTab';

const TABS = [
  { id: 'discounts', label: 'الخصومات', icon: '🏷️' },
  { id: 'activities', label: 'الأنشطة', icon: '🎯' },
  { id: 'partners', label: 'الشركاء', icon: '🤝' },
  { id: 'footer', label: 'الجزء السفلي', icon: '📋' },
] as const;

type TabId = typeof TABS[number]['id'];

export default function HomepageManager() {
  const [activeTab, setActiveTab] = useState<TabId>('discounts');

  return (
    <div style={{ direction: 'rtl' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg,${B},#600f1c)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <Layout size={20} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: '#111' }}>مدير الصفحة الرئيسية</h2>
            <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>تحكم في محتوى الصفحة الرئيسية </p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '12px 16px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 18 }}>💡</span>
        <p style={{ margin: 0, fontSize: 13, color: '#1e40af' }}>
          التغييرات تظهر فوراً على الصفحة الرئيسية &nbsp;·&nbsp; كل التعديلات مدعومة بـ AR / EN / TR
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: '#f3f4f6', borderRadius: 12, padding: 4 }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '9px 12px', borderRadius: 9, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: activeTab === tab.id ? 800 : 600,
              background: activeTab === tab.id ? '#fff' : 'transparent',
              color: activeTab === tab.id ? B : '#6b7280',
              boxShadow: activeTab === tab.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div key={activeTab} style={{ animation: 'fadeUp 0.2s ease' }}>
        {activeTab === 'discounts' && <DiscountsTab />}
        {activeTab === 'activities' && <ActivitiesTab />}
        {activeTab === 'partners' && <PartnersTab />}
        {activeTab === 'footer' && <FooterTab />}
      </div>
    </div>
  );
}
