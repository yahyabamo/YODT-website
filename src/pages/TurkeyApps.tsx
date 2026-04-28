import { useState, useEffect } from 'react';
import { Download, Star, Smartphone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { supabase } from '@/integrations/supabase/client';
import { AdSlot } from '@/components/ads/AdSlot';

interface TurkeyApp {
  id: string; name: string; name_tr: string; category: string;
  description: string; icon: string; android_url: string | null;
  ios_url: string | null; is_essential: boolean;
}

const AppCard = ({ app }: { app: TurkeyApp }) => (
  <Card className="border-0 shadow-soft">
    <CardContent className="p-4">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center text-2xl shrink-0">
          {app.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-foreground flex items-center gap-2">
            {app.name}
            {app.is_essential && <Star className="w-3 h-3 text-warning fill-warning" />}
          </h3>
          <p className="text-xs text-muted-foreground mb-1">{app.name_tr}</p>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{app.description}</p>
          <div className="flex gap-2 mt-3">
            {app.android_url && (
              <a href={app.android_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  <Download className="w-3 h-3 ml-1" /> Android
                </Button>
              </a>
            )}
            {app.ios_url && (
              <a href={app.ios_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  <Download className="w-3 h-3 ml-1" /> iOS
                </Button>
              </a>
            )}
            {!app.android_url && !app.ios_url && (
              <span className="text-xs text-muted-foreground">متوفر عبر موقع الجامعة</span>
            )}
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const TurkeyApps = () => {
  const [apps, setApps] = useState<TurkeyApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('turkey_apps').select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      setApps(data || []);
      setLoading(false);
    })();
  }, []);

  // Derived — no extra table needed
  const categories = [...new Set(apps.map(a => a.category).filter(Boolean))];
  const essentialApps = apps.filter(a => a.is_essential);
  const filteredApps = selectedCategory === 'all' ? apps : apps.filter(a => a.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader title="تطبيقات مهمة في تركيا" showBack />

      <div className="px-4 py-4 max-w-lg mx-auto">
        <AdSlot page="turkey_apps" position="top" className="mb-6" />
        {/* Intro */}
        <Card className="border-0 shadow-soft bg-gradient-to-br from-primary/10 to-primary/5 mb-6">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                <Smartphone className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-foreground mb-1">دليلك للتطبيقات الأساسية</h2>
                <p className="text-sm text-muted-foreground">تطبيقات لازم تكون عندك كطالب في تركيا 🇹🇷</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Essential apps */}
        {!loading && essentialApps.length > 0 && (
          <div className="mb-6">
            <h2 className="font-bold text-foreground mb-3 flex items-center gap-2">
              <Star className="w-5 h-5 text-warning fill-warning" />
              التطبيقات الأساسية
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {essentialApps.map(app => (
                <Card key={app.id} className="border-0 shadow-soft shrink-0 w-28">
                  <CardContent className="p-3 text-center">
                    <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-2 text-2xl">{app.icon}</div>
                    <p className="text-xs font-medium text-foreground line-clamp-1">{app.name}</p>
                    <p className="text-[10px] text-muted-foreground">{app.name_tr}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Category filter — derived from data */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
          <button onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === 'all' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              }`}>الكل</button>
          {categories.map(cat => (
            <button key={cat} onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                }`}>{cat}</button>
          ))}
        </div>

        {/* Apps */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="border-0 shadow-soft">
                <CardContent className="p-4">
                  <div className="flex gap-4 animate-pulse">
                    <div className="w-14 h-14 rounded-xl bg-secondary shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-secondary rounded w-1/2" />
                      <div className="h-3 bg-secondary rounded w-1/3" />
                      <div className="h-3 bg-secondary rounded w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📱</p>
            <p className="text-muted-foreground font-medium">لا توجد تطبيقات في هذا التصنيف</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredApps.map(app => <AppCard key={app.id} app={app} />)}
          </div>
        )}

        <Card className="border-0 shadow-soft bg-amber-50 dark:bg-amber-900/20 mt-6">
          <CardContent className="p-4">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              💡 <strong>نصيحة:</strong> حمّل التطبيقات الأساسية قبل وصولك لتركيا، خاصة e-Devlet.
            </p>
          </CardContent>
        </Card>
        <AdSlot page="turkey_apps" position="bottom" className="mt-8" />
      </div>

      <BottomNav />
    </div>
  );
};

export default TurkeyApps;