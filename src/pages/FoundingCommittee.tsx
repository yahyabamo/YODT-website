import { useState, useEffect } from 'react';
import { Users, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { founders } from '@/data/foundersData';

const FoundingCommittee = () => {
  const [rotation, setRotation] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setRotation(prev => (prev + 0.3) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, [isPaused]);

  const radius = 120; // radius of the orbit
  const centerX = 150;
  const centerY = 150;

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader title="الهيئة المؤسسة" showBack />
      
      <div className="px-4 py-6 max-w-lg mx-auto">
        {/* Intro */}
        <Card className="border-0 shadow-soft mb-8">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">مؤسسو الاتحاد</h2>
            <p className="text-muted-foreground text-sm">
              الأعضاء المؤسسون الذين بنوا أساس اتحاد الطلاب اليمنيين في تركيا
            </p>
          </CardContent>
        </Card>

        {/* Rotating Orbit */}
        <div 
          className="relative w-[300px] h-[300px] mx-auto mb-8"
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => setIsPaused(false)}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Center Logo */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-elevated z-10">
            <Heart className="w-8 h-8 text-primary-foreground" />
          </div>

          {/* Orbit Path */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] border-2 border-dashed border-primary/20 rounded-full"
          />

          {/* Founders on Orbit */}
          {founders.map((founder, index) => {
            const angle = ((360 / founders.length) * index + rotation) * (Math.PI / 180);
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);

            return (
              <div
                key={founder.id}
                className="absolute transition-all duration-100"
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-secondary to-muted flex items-center justify-center shadow-card border-2 border-background">
                    {founder.image ? (
                      <img 
                        src={founder.image} 
                        alt={founder.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-xl font-bold text-primary">
                        {founder.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-medium text-foreground mt-1 bg-background/80 px-2 py-0.5 rounded-full whitespace-nowrap">
                    {founder.name.split(' ').slice(0, 2).join(' ')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Instruction */}
        <p className="text-center text-xs text-muted-foreground mb-6">
          المس الدائرة لإيقاف الحركة
        </p>

        {/* List View */}
        <div className="space-y-3">
          {founders.map((founder) => (
            <Card key={founder.id} className="border-0 shadow-soft">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    {founder.image ? (
                      <img 
                        src={founder.image} 
                        alt={founder.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-bold text-primary">
                        {founder.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{founder.name}</h3>
                    {founder.role && (
                      <p className="text-sm text-muted-foreground">{founder.role}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Thank You Note */}
        <Card className="border-0 shadow-soft bg-primary/5 mt-6">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">
              شكراً لكل من ساهم في بناء هذا الاتحاد وخدمة الطلاب اليمنيين 💚
            </p>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default FoundingCommittee;
