import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Eye, EyeOff, Save } from 'lucide-react';
import { fetchPartners, upsertPartner, fetchOffers, upsertOffer } from '@/service/supabaseData';
import { B, Spinner } from './HomepageShared';

// ─── Types ─────────────────────────────────────────────────────
interface PartnerRow {
    id: string;
    name: string;
    name_ar?: string | null;
    logo_url?: string | null;
    website?: string | null;
    status: string;
    show_on_homepage?: boolean;
    order_index?: number;
    category?: string | null;
    city?: string | null;
}

interface OfferRow {
    id: string;
    title: string;
    title_ar?: string | null;
    image_url?: string | null;
    status: string;
    show_on_homepage?: boolean;
    order_index?: number;
    partners?: { name: string; name_ar?: string | null; logo_url?: string | null };
    // preserve existing fields for upsert
    partner_id?: string;
    description?: string | null;
    discount_percentage?: number;
    expires_at?: string | null;
}

// ─── Inline save for a single partner field ─────────────────────
async function savePartnerField(partner: PartnerRow, field: 'show_on_homepage' | 'order_index', value: boolean | number) {
    await (upsertPartner as any)({ id: partner.id, name: partner.name, website: partner.website, status: partner.status, logo_url: partner.logo_url, [field]: value });
}

async function saveOfferField(offer: OfferRow, field: 'show_on_homepage' | 'order_index', value: boolean | number) {
    await (upsertOffer as any)({ id: offer.id, title: offer.title, partner_id: offer.partner_id, description: offer.description, discount_percentage: offer.discount_percentage, expires_at: offer.expires_at || null, status: offer.status, image_url: offer.image_url, [field]: value });
}

// ─── Partner Homepage Card ─────────────────────────────────────
function PartnerCard({ partner, onChange }: { partner: PartnerRow; onChange: (id: string, field: string, val: any) => void }) {
    const [saving, setSaving] = useState(false);
    const [order, setOrder]   = useState(partner.order_index ?? 0);

    const toggle = async () => {
        setSaving(true);
        try {
            const next = !partner.show_on_homepage;
            await savePartnerField(partner, 'show_on_homepage', next);
            onChange(partner.id, 'show_on_homepage', next);
            toast.success(next ? 'تم إظهار الشريك على الصفحة الرئيسية' : 'تم إخفاء الشريك');
        } catch { toast.error('فشل التحديث'); }
        finally { setSaving(false); }
    };

    const saveOrder = async () => {
        setSaving(true);
        try {
            await savePartnerField(partner, 'order_index', order);
            onChange(partner.id, 'order_index', order);
            toast.success('تم حفظ الترتيب');
        } catch { toast.error('فشل الحفظ'); }
        finally { setSaving(false); }
    };

    const shown = !!partner.show_on_homepage;

    return (
        <div style={{ background: '#fff', border: `1px solid ${shown ? 'rgba(16,185,129,0.3)' : '#e5e7eb'}`, borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, transition: 'border-color 0.2s', boxShadow: shown ? '0 0 0 2px rgba(16,185,129,0.08)' : 'none' }}>
            {/* Logo */}
            {partner.logo_url ? (
                <img src={partner.logo_url} alt={partner.name_ar || partner.name} style={{ width: 44, height: 44, objectFit: 'contain', borderRadius: 10, border: '1px solid #eef2f7', background: '#fff', flexShrink: 0 }} />
            ) : (
                <div style={{ width: 44, height: 44, background: '#f3f4f6', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#374151', flexShrink: 0 }}>
                    {(partner.name_ar || partner.name || '?')[0]}
                </div>
            )}

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: '#111827', marginBottom: 2 }}>{partner.name_ar || partner.name}</div>
                <div style={{ fontSize: 12, color: '#6b7280', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {partner.category && <span>{partner.category}</span>}
                    {partner.city && <span>· {partner.city}</span>}
                    <span style={{ color: partner.status === 'active' ? '#059669' : '#9ca3af' }}>· {partner.status === 'active' ? 'نشط' : 'غير نشط'}</span>
                </div>
            </div>

            {/* Order input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(+e.target.value)}
                    onBlur={saveOrder}
                    style={{ width: 54, padding: '5px 8px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, textAlign: 'center', outline: 'none' }}
                    title="ترتيب الظهور"
                />
                <button onClick={saveOrder} disabled={saving} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '5px 7px', cursor: 'pointer', color: '#374151', display: 'flex', alignItems: 'center' }} title="حفظ الترتيب">
                    <Save size={14} />
                </button>
            </div>

            {/* Toggle */}
            <button
                onClick={toggle}
                disabled={saving}
                title={shown ? 'إخفاء من الصفحة الرئيسية' : 'إظهار على الصفحة الرئيسية'}
                style={{ background: shown ? '#d1fae5' : '#f3f4f6', border: 'none', borderRadius: 10, padding: '8px 12px', cursor: 'pointer', color: shown ? '#059669' : '#6b7280', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 12, flexShrink: 0, transition: 'all 0.2s' }}
            >
                {shown ? <><Eye size={14} /> ظاهر</> : <><EyeOff size={14} /> مخفي</>}
            </button>
        </div>
    );
}

// ─── Offer Homepage Card ───────────────────────────────────────
function OfferCard({ offer, onChange }: { offer: OfferRow; onChange: (id: string, field: string, val: any) => void }) {
    const [saving, setSaving] = useState(false);
    const [order, setOrder]   = useState(offer.order_index ?? 0);

    const toggle = async () => {
        setSaving(true);
        try {
            const next = !offer.show_on_homepage;
            await saveOfferField(offer, 'show_on_homepage', next);
            onChange(offer.id, 'show_on_homepage', next);
            toast.success(next ? 'تم إظهار العرض على الصفحة الرئيسية' : 'تم إخفاء العرض');
        } catch { toast.error('فشل التحديث'); }
        finally { setSaving(false); }
    };

    const saveOrder = async () => {
        setSaving(true);
        try {
            await saveOfferField(offer, 'order_index', order);
            onChange(offer.id, 'order_index', order);
            toast.success('تم حفظ الترتيب');
        } catch { toast.error('فشل الحفظ'); }
        finally { setSaving(false); }
    };

    const shown = !!offer.show_on_homepage;
    const partnerName = offer.partners?.name_ar || offer.partners?.name || '—';

    return (
        <div style={{ background: '#fff', border: `1px solid ${shown ? 'rgba(59,130,246,0.3)' : '#e5e7eb'}`, borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14, transition: 'border-color 0.2s', boxShadow: shown ? '0 0 0 2px rgba(59,130,246,0.06)' : 'none' }}>
            {/* Image */}
            {offer.image_url ? (
                <img src={offer.image_url} alt={offer.title_ar || offer.title} style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }} />
            ) : (
                <div style={{ width: 44, height: 44, background: '#f3f4f6', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🏷️</div>
            )}

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: '#111827', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{offer.title_ar || offer.title}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{partnerName} · <span style={{ color: offer.status === 'active' ? '#059669' : '#9ca3af' }}>{offer.status === 'active' ? 'نشط' : 'غير نشط'}</span></div>
            </div>

            {/* Order */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(+e.target.value)}
                    onBlur={saveOrder}
                    style={{ width: 54, padding: '5px 8px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, textAlign: 'center', outline: 'none' }}
                    title="ترتيب الظهور"
                />
                <button onClick={saveOrder} disabled={saving} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '5px 7px', cursor: 'pointer', color: '#374151', display: 'flex', alignItems: 'center' }}>
                    <Save size={14} />
                </button>
            </div>

            {/* Toggle */}
            <button
                onClick={toggle}
                disabled={saving}
                title={shown ? 'إخفاء من الصفحة الرئيسية' : 'إظهار على الصفحة الرئيسية'}
                style={{ background: shown ? '#dbeafe' : '#f3f4f6', border: 'none', borderRadius: 10, padding: '8px 12px', cursor: 'pointer', color: shown ? '#1d4ed8' : '#6b7280', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 12, flexShrink: 0, transition: 'all 0.2s' }}
            >
                {shown ? <><Eye size={14} /> ظاهر</> : <><EyeOff size={14} /> مخفي</>}
            </button>
        </div>
    );
}

// ─── Main Tab ─────────────────────────────────────────────────
export default function PartnersTab() {
    const [partners, setPartners] = useState<PartnerRow[]>([]);
    const [offers,   setOffers]   = useState<OfferRow[]>([]);
    const [loading,  setLoading]  = useState(true);
    const [section,  setSection]  = useState<'partners' | 'offers'>('partners');

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [p, o] = await Promise.all([fetchPartners(), fetchOffers()]);
            setPartners((p || []) as PartnerRow[]);
            setOffers((o || []) as OfferRow[]);
        } catch { toast.error('فشل التحميل'); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handlePartnerChange = (id: string, field: string, val: any) =>
        setPartners((prev) => prev.map((p) => p.id === id ? { ...p, [field]: val } : p));

    const handleOfferChange = (id: string, field: string, val: any) =>
        setOffers((prev) => prev.map((o) => o.id === id ? { ...o, [field]: val } : o));

    const shownPartners  = partners.filter((p) => !!p.show_on_homepage).length;
    const shownOffers    = offers.filter((o)   => !!o.show_on_homepage).length;

    if (loading) return <Spinner />;

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>إدارة الصفحة الرئيسية — الشركاء والعروض</h3>
                <div style={{ marginTop: 4, fontSize: 12, color: '#6b7280' }}>
                    فعّل/أوقف ظهور الشركاء والعروض على الصفحة الرئيسية وحدد ترتيبهم. التعديل الكامل متاح في إدارة الشركاء والعروض.
                </div>
            </div>

            {/* Info banner */}
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '10px 14px', marginBottom: 20, fontSize: 13, color: '#1e40af' }}>
                💡 فقط السجلات ذات الحالة <b>نشط</b> ستظهر على الصفحة الرئيسية حتى لو كانت مُفعّلة.
            </div>

            {/* Sub-tabs */}
            <div style={{ display: 'flex', gap: 4, background: '#f3f4f6', borderRadius: 12, padding: 4, marginBottom: 20 }}>
                {([['partners', `الشركاء (${shownPartners}/${partners.length} ظاهر)`], ['offers', `العروض (${shownOffers}/${offers.length} ظاهر)`]] as const).map(([id, label]) => (
                    <button key={id} onClick={() => setSection(id)} style={{ flex: 1, padding: '8px 12px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: section === id ? 800 : 600, background: section === id ? '#fff' : 'transparent', color: section === id ? B : '#6b7280', boxShadow: section === id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.15s' }}>
                        {label}
                    </button>
                ))}
            </div>

            {/* Partners list */}
            {section === 'partners' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {partners.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#9ca3af', padding: 32 }}>لا يوجد شركاء. أضفهم من صفحة إدارة الشركاء.</p>
                    ) : (
                        partners
                            .sort((a, b) => (a.order_index ?? 999) - (b.order_index ?? 999))
                            .map((p) => <PartnerCard key={p.id} partner={p} onChange={handlePartnerChange} />)
                    )}
                </div>
            )}

            {/* Offers list */}
            {section === 'offers' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {offers.length === 0 ? (
                        <p style={{ textAlign: 'center', color: '#9ca3af', padding: 32 }}>لا توجد عروض. أضفها من صفحة إدارة العروض.</p>
                    ) : (
                        offers
                            .sort((a, b) => (a.order_index ?? 999) - (b.order_index ?? 999))
                            .map((o) => <OfferCard key={o.id} offer={o} onChange={handleOfferChange} />)
                    )}
                </div>
            )}
        </div>
    );
}