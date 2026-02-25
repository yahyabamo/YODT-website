import { useState } from 'react';
import { ExternalLink, Download, Star, Smartphone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { turkeyApps, appCategories, TurkeyApp } from '@/data/turkeyAppsData';

const TurkeyApps = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredApps = selectedCategory === 'all'
    ? turkeyApps
    : turkeyApps.filter(app => app.category === selectedCategory);

  const essentialApps = turkeyApps.filter(app => app.isEssential);

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader title="تطبيقات مهمة في تركيا" showBack />
      
      <div className="px-4 py-4 max-w-lg mx-auto">
        {/* Intro */}
        <Card className="border-0 shadow-soft bg-gradient-to-br from-primary/10 to-primary/5 mb-6">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                <Smartphone className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-foreground mb-1">دليلك للتطبيقات الأساسية</h2>
                <p className="text-sm text-muted-foreground">
                  تطبيقات لازم تكون عندك كطالب في تركيا 🇹🇷
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Essential Apps */}
        <div className="mb-6">
          <h2 className="font-bold text-foreground mb-3 flex items-center gap-2">
            <Star className="w-5 h-5 text-warning fill-warning" />
            التطبيقات الأساسية
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {essentialApps.map((app) => (
              <Card 
                key={app.id} 
                className="border-0 shadow-soft shrink-0 w-28"
              >
                <CardContent className="p-3 text-center">
                  <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center mx-auto mb-2 text-2xl">
                    {app.icon}
                  </div>
                  <p className="text-xs font-medium text-foreground line-clamp-1">{app.name}</p>
                  <p className="text-[10px] text-muted-foreground">{app.nameTr}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
            }`}
          >
            الكل
          </button>
          {appCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                selectedCategory === cat.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              }`}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Apps Grid */}
        <div className="space-y-3">
          {filteredApps.map((app) => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>

        {/* Tip */}
        <Card className="border-0 shadow-soft bg-amber-50 dark:bg-amber-900/20 mt-6">
          <CardContent className="p-4">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              💡 <strong>نصيحة:</strong> حمّل التطبيقات الأساسية قبل وصولك لتركيا، 
              خاصة e-Devlet و Moovit و تطبيق البنك.
            </p>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

const AppCard = ({ app }: { app: TurkeyApp }) => {
  const hasAndroid = !!app.downloadUrl.android;
  const hasIos = !!app.downloadUrl.ios;

  return (
    <Card className="border-0 shadow-soft">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center text-2xl shrink-0">
            {app.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  {app.name}
                  {app.isEssential && (
                    <Star className="w-3 h-3 text-warning fill-warning" />
                  )}
                </h3>
                <p className="text-xs text-muted-foreground">{app.nameTr}</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
              {app.description}
            </p>
            
            {/* Download Buttons */}
            <div className="flex gap-2 mt-3">
              {hasAndroid && (
                <a
                  href={app.downloadUrl.android}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    <Download className="w-3 h-3 ml-1" />
                    Android
                  </Button>
                </a>
              )}
              {hasIos && (
                <a
                  href={app.downloadUrl.ios}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    <Download className="w-3 h-3 ml-1" />
                    iOS
                  </Button>
                </a>
              )}
              {!hasAndroid && !hasIos && (
                <span className="text-xs text-muted-foreground">
                  متوفر عبر موقع الجامعة
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TurkeyApps;
