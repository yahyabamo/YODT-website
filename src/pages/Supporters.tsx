import { Heart, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { supporters } from '@/data/mockData';
import { cn } from '@/lib/utils';

const Supporters = () => {
  const platinumSupporters = supporters.filter(s => s.type === 'platinum');
  const goldSupporters = supporters.filter(s => s.type === 'gold');
  const silverSupporters = supporters.filter(s => s.type === 'silver');

  const SupporterCard = ({ supporter, size = 'default' }: { supporter: typeof supporters[0]; size?: 'large' | 'default' }) => (
    <Card 
      className={cn(
        "shadow-soft hover:shadow-card transition-all duration-300 cursor-pointer group",
        size === 'large' && "col-span-2"
      )}
    >
      <CardContent className={cn(
        "flex flex-col items-center justify-center text-center",
        size === 'large' ? "p-8" : "p-6"
      )}>
        <div className={cn(
          "rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform",
          size === 'large' ? "w-20 h-20 text-5xl" : "w-14 h-14 text-3xl",
          supporter.type === 'platinum' ? "bg-gradient-to-br from-purple-100 to-purple-200" :
          supporter.type === 'gold' ? "bg-gradient-to-br from-yellow-100 to-yellow-200" :
          "bg-gradient-to-br from-gray-100 to-gray-200"
        )}>
          {supporter.logo}
        </div>
        <h3 className={cn(
          "font-bold",
          size === 'large' ? "text-base" : "text-sm"
        )}>
          {supporter.name}
        </h3>
        {supporter.website && (
          <div className="flex items-center gap-1 text-xs text-primary mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <ExternalLink className="h-3 w-3" />
            زيارة الموقع
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader title="الداعمون والشركاء" />

      <div className="px-4 py-4 max-w-lg mx-auto space-y-8">
        {/* Header Message */}
        <div className="text-center py-6 animate-slide-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Heart className="h-8 w-8 text-primary fill-primary/20" />
          </div>
          <h2 className="text-lg font-bold mb-2">شكر وتقدير</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            نتقدم بجزيل الشكر لجميع الجهات الداعمة التي تساهم في نجاح أنشطة وفعاليات الاتحاد
          </p>
        </div>

        {/* Platinum Supporters */}
        {platinumSupporters.length > 0 && (
          <div className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-400 to-purple-600" />
              <h3 className="font-bold text-sm text-muted-foreground">الرعاة البلاتينيون</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {platinumSupporters.map((supporter) => (
                <SupporterCard key={supporter.id} supporter={supporter} size="large" />
              ))}
            </div>
          </div>
        )}

        {/* Gold Supporters */}
        {goldSupporters.length > 0 && (
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full gradient-gold" />
              <h3 className="font-bold text-sm text-muted-foreground">الرعاة الذهبيون</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {goldSupporters.map((supporter) => (
                <SupporterCard key={supporter.id} supporter={supporter} />
              ))}
            </div>
          </div>
        )}

        {/* Silver Supporters */}
        {silverSupporters.length > 0 && (
          <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-gray-300 to-gray-400" />
              <h3 className="font-bold text-sm text-muted-foreground">الرعاة الفضيون</h3>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {silverSupporters.map((supporter) => (
                <SupporterCard key={supporter.id} supporter={supporter} />
              ))}
            </div>
          </div>
        )}

        {/* Become a Supporter */}
        <Card className="gradient-dark text-primary-foreground shadow-card animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <CardContent className="p-6 text-center">
            <h3 className="font-bold mb-2">كن داعماً للاتحاد</h3>
            <p className="text-sm text-primary-foreground/70 mb-4">
              هل ترغب في دعم أنشطة الطلاب اليمنيين في تركيا؟
            </p>
            <button className="px-6 py-2 rounded-full bg-primary-foreground text-foreground font-medium text-sm hover:bg-primary-foreground/90 transition-colors">
              تواصل معنا
            </button>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default Supporters;
