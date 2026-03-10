import { useState, useEffect } from 'react';
import { ChevronRight, MapPin } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageHeader } from '@/components/layout/PageHeader';
import { supabase } from '@/integrations/supabase/client';

interface Place {
  id: string; name: string; category: string; area: string;
  rating: number; description: string; maps_url: string | null;
}

const IstanbulMap = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('istanbul_places').select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      setPlaces(data || []);
      setLoading(false);
    })();
  }, []);

  // Derived — no extra table needed
  const categories = [...new Set(places.map(p => p.category).filter(Boolean))];
  const filteredPlaces = selectedCategory === 'all' ? places : places.filter(p => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader title="خريطة إسطنبول" showBack />

      <div className="p-4 max-w-lg mx-auto space-y-4">
        {/* Map banner */}
        <Card className="border-0 shadow-soft overflow-hidden">
          <div className="relative h-48 bg-gradient-to-br from-primary/10 to-emerald-500/10">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-primary mx-auto mb-2" />
                <p className="text-foreground font-semibold">خريطة إسطنبول التفاعلية</p>
                <p className="text-sm text-muted-foreground">اختر فئة لاستكشاف الأماكن</p>
              </div>
            </div>
            <div className="absolute top-4 left-4 w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
            <div className="absolute top-12 right-8 w-2 h-2 rounded-full bg-rose-500" />
            <div className="absolute bottom-8 left-12 w-2 h-2 rounded-full bg-emerald-500" />
            <div className="absolute bottom-4 right-4 w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
          </div>
        </Card>

        {/* Category tabs — derived from data */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button onClick={() => setSelectedCategory('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors text-sm font-medium ${selectedCategory === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground hover:bg-secondary/80'
              }`}>
            <MapPin className="w-4 h-4" /> الكل
          </button>
          {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors text-sm font-medium ${selectedCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}>{cat}</button>
          ))}
        </div>

        {/* Places */}
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="border-0 shadow-soft">
                <CardContent className="p-4">
                  <div className="flex gap-3 animate-pulse">
                    <div className="w-10 h-10 rounded-xl bg-secondary shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-secondary rounded w-1/2" />
                      <div className="h-3 bg-secondary rounded w-3/4" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">{filteredPlaces.length} مكان</p>
            <div className="space-y-2">
              {filteredPlaces.map(place => (
                <Card key={place.id}
                  className="border-0 shadow-soft cursor-pointer hover:shadow-card transition-shadow"
                  onClick={() => place.maps_url && window.open(place.maps_url, '_blank')}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">{place.name}</h3>
                          <Badge variant="outline" className="text-xs">⭐ {place.rating}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{place.description}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs text-primary">
                            <MapPin className="w-3 h-3" />{place.area}
                          </div>
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                            {place.category}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default IstanbulMap;