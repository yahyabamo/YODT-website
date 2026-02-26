import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin, Phone, Globe, Instagram, ArrowRight,
  Clock, Tag, ExternalLink, Navigation
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageHeader } from '@/components/layout/PageHeader';
import { sponsors } from '@/data/sponsorsData';

const SponsorProfile = () => {
  const { sponsorId } = useParams();
  const navigate = useNavigate();

  const sponsor = sponsors.find(s => s.id === sponsorId);

  if (!sponsor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="border-0 shadow-card max-w-sm w-full">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground mb-4">الداعم غير موجود</p>
            <Button onClick={() => navigate('/discounts')}>
              <ArrowRight className="w-4 h-4 ml-2" />
              العودة للخصومات
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const typeLabels = {
    restaurant: 'مطعم',
    cafe: 'مقهى',
    store: 'متجر',
    company: 'شركة',
    service: 'خدمات',
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader title={sponsor.name} showBack />

      <div className="px-4 py-4 max-w-lg mx-auto">
        {/* Hero Card */}
        <Card className="border-0 shadow-card overflow-hidden mb-6">
          <div className="bg-gradient-to-br from-primary to-primary/80 p-6 text-center text-primary-foreground">
            <div className="w-24 h-24 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4 text-5xl">
              {sponsor.logo}
            </div>
            <h1 className="text-2xl font-bold mb-2">{sponsor.name}</h1>
            <span className="px-3 py-1 rounded-full bg-white/20 text-sm">
              {typeLabels[sponsor.type]}
            </span>
          </div>
          <CardContent className="p-4">
            <p className="text-muted-foreground text-center">{sponsor.description}</p>
          </CardContent>
        </Card>

        {/* Active Offers */}
        <div className="mb-6">
          <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <Tag className="w-5 h-5 text-primary" />
            العروض المتاحة
          </h2>
          <div className="space-y-3">
            {sponsor.offers.filter(o => o.isActive).map((offer) => (
              <Card key={offer.id} className="border-0 shadow-soft overflow-hidden">
                <div className="bg-gradient-to-r from-primary/5 to-transparent p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-foreground mb-1">{offer.title}</h3>
                      <p className="text-sm text-muted-foreground">{offer.description}</p>
                      {offer.conditions && (
                        <p className="text-xs text-muted-foreground mt-2 bg-secondary p-2 rounded-lg">
                          📋 {offer.conditions}
                        </p>
                      )}
                    </div>
                    <div className="text-left mr-4">
                      <span className="text-3xl font-bold text-primary">{offer.discount}</span>
                      {offer.validUntil && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="w-3 h-3" />
                          حتى {new Date(offer.validUntil).toLocaleDateString('ar-SA')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Branches */}
        {sponsor.branches && sponsor.branches.length > 0 && (
          <div className="mb-6">
            <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              الفروع
            </h2>
            <div className="flex flex-wrap gap-2">
              {sponsor.branches.map((branch, i) => (
                <span
                  key={i}
                  className="px-4 py-2 bg-secondary rounded-full text-sm font-medium text-foreground"
                >
                  {branch}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Location & Contact */}
        <Card className="border-0 shadow-card mb-6">
          <CardContent className="p-4 space-y-4">
            <h2 className="font-bold text-foreground">الموقع والتواصل</h2>

            {/* Address */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-foreground">{sponsor.location.address}</p>
                <a
                  href={sponsor.location.mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary flex items-center gap-1 mt-1"
                >
                  <Navigation className="w-3 h-3" />
                  فتح في الخريطة
                </a>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <Phone className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <a
                  href={`tel:${sponsor.contact.phone}`}
                  className="text-sm text-foreground font-medium"
                  dir="ltr"
                >
                  {sponsor.contact.phone}
                </a>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3 pt-2">
              {sponsor.contact.instagram && (
                <a
                  href={`https://instagram.com/${sponsor.contact.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {sponsor.contact.website && (
                <a
                  href={sponsor.contact.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-foreground"
                >
                  <Globe className="w-5 h-5" />
                </a>
              )}
            </div>
          </CardContent>
        </Card>

        {/* How to Get Discount */}
        <Card className="border-0 shadow-soft bg-primary/5">
          <CardContent className="p-4">
            <h3 className="font-bold text-foreground mb-3">كيف تحصل على الخصم؟</h3>
            <ol className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs shrink-0">1</span>
                <span>افتح بطاقة العضوية من التطبيق</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs shrink-0">2</span>
                <span>اعرض رمز QR للكاشير</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs shrink-0">3</span>
                <span>احصل على خصمك فوراً!</span>
              </li>
            </ol>
            <Button
              className="w-full mt-4"
              onClick={() => navigate('/membership-card')}
            >
              فتح بطاقة العضوية
            </Button>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default SponsorProfile;
