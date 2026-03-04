import { useState, useEffect } from 'react';
import {
  Building2,
  ChevronLeft, Search, Globe, Percent
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SmartTopBar } from '@/components/layout/SmartTopBar';


interface Partner {
  id: string;
  name: string;
  name_ar: string | null;
  logo_url: string | null;
  website: string | null;
  description: string | null;
  status: string;
  created_at: string;
}

interface PartnerOffer {
  id: string;
  partner_id: string;
  title: string;
  title_ar: string | null;
  description: string | null;
  discount_percentage: number | null;
  promo_code: string | null;
  expires_at: string | null;
  status: string;
}


const Partners = () => {
  const navigate = useNavigate();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [offers, setOffers] = useState<PartnerOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);


  useEffect(() => {
    fetchPartners();
    fetchOffers();
  }, []);

  const fetchPartners = async () => {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('name');

      if (error) throw error;
      setPartners(data as unknown as Partner[] || []);
    } catch (error) {
      console.error('Error fetching partners:', error);
      toast.error('حدث خطأ في تحميل الداعمين');
    } finally {
      setLoading(false);
    }
  };

  const fetchOffers = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('offers')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;
      setOffers(data as unknown as PartnerOffer[] || []);
    } catch (error) {
      console.error('Error fetching offers:', error);
    }
  };

  const getPartnerOffers = (partnerId: string) => {
    return offers.filter(o => o.partner_id === partnerId);
  };

  const filteredPartners = partners.filter(p => {
    const matchesSearch =
      (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.name_ar || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });



  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="sticky-header">
        <div className="p-4 max-w-screen-xl mx-auto">
          <SmartTopBar onOpenSearch={() => setShowSearch(true)} />
        </div>
      </header>
      <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
        {/* Hero Section */}
        <Card className="shadow-card overflow-hidden">
          <div className="gradient-primary p-6 text-white">
            <h2 className="text-xl font-bold mb-2">شركاؤنا في النجاح</h2>
            <p className="text-sm opacity-90">
              جهات وأفراد يدعمون مسيرة الطلاب اليمنيين
            </p>
          </div>
        </Card>

        {/* Search */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="ابحث عن داعم..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 h-12 bg-card"
          />
        </div>

        {/* Partners List */}
        <div className="space-y-3">
          {filteredPartners.length === 0 ? (
            <Card className="shadow-soft">
              <CardContent className="p-8 text-center">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">لا يوجد داعمون حالياً</p>
              </CardContent>
            </Card>
          ) : (
            filteredPartners.map((partner) => {
              const partnerOffers = getPartnerOffers(partner.id);

              return (
                <Card key={partner.id} className="shadow-soft overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-primary/10">
                        {partner.logo_url ? (
                          <img
                            src={partner.logo_url}
                            alt={partner.name_ar || partner.name}
                            className="w-10 h-10 object-contain"
                          />
                        ) : (
                          <Building2 className="h-7 w-7 text-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold">{partner.name_ar || partner.name}</h3>
                        {partner.description && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {partner.description}
                          </p>
                        )}

                        {/* Offers */}
                        {partnerOffers.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {partnerOffers.slice(0, 2).map(offer => (
                              <Badge
                                key={offer.id}
                                className="bg-green-500/10 text-green-600 gap-1"
                              >
                                <Percent className="h-3 w-3" />
                                {offer.discount_percentage}% {offer.title}
                              </Badge>
                            ))}
                            {partnerOffers.length > 2 && (
                              <Badge variant="outline">
                                +{partnerOffers.length - 2} عروض
                              </Badge>
                            )}
                          </div>
                        )}

                        <div className="flex gap-2 mt-3">
                          <Button
                            size="sm"
                            onClick={() => navigate(`/home/offers`)}
                          >
                            الذهاب الى صفحة العروض                            <ChevronLeft className="h-4 w-4 mr-1" />
                          </Button>
                          {partner.website && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(partner.website!, '_blank')}
                            >
                              <Globe className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* CTA for becoming a partner */}
        {/* <Card className="shadow-soft bg-primary/5 border-primary/20">
          <CardContent className="p-4 text-center">
            <h4 className="font-semibold mb-2">هل تريد أن تصبح داعماً؟</h4>
            <p className="text-sm text-muted-foreground mb-3">
              انضم إلى شركائنا ودعم الطلاب اليمنيين
            </p>
            <Button onClick={() => navigate('/sponsor-portal')} disabled>
              تقدم كداعم
            </Button>
          </CardContent>
        </Card> */}
      </div>

      <BottomNav />
    </div>
  );
};

export default Partners;
