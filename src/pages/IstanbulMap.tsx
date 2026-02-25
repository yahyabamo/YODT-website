import { useState } from 'react';
import { ChevronRight, MapPin, Building2, Coffee, Landmark, Waves, Building, Moon, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageHeader } from '@/components/layout/PageHeader';

type CategoryType = 'all' | 'universities' | 'cafes' | 'tourism' | 'beaches' | 'municipalities' | 'mosques' | 'yemeni';

const IstanbulMap = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');

  const categories = [
    { id: 'all' as CategoryType, label: 'الكل', icon: MapPin, color: 'text-primary' },
    { id: 'universities' as CategoryType, label: 'الجامعات', icon: Building2, color: 'text-blue-500' },
    { id: 'cafes' as CategoryType, label: 'كافيهات', icon: Coffee, color: 'text-amber-600' },
    { id: 'tourism' as CategoryType, label: 'سياحة', icon: Landmark, color: 'text-rose-500' },
    { id: 'beaches' as CategoryType, label: 'سواحل', icon: Waves, color: 'text-cyan-500' },
    { id: 'municipalities' as CategoryType, label: 'بلديات', icon: Building, color: 'text-slate-500' },
    { id: 'mosques' as CategoryType, label: 'مساجد', icon: Moon, color: 'text-emerald-500' },
    { id: 'yemeni' as CategoryType, label: 'الجالية', icon: Users, color: 'text-red-500' },
  ];

  const places = [
    // Universities
    { id: 1, name: 'جامعة إسطنبول', category: 'universities', area: 'الفاتح', rating: 4.8, description: 'أقدم وأعرق الجامعات التركية' },
    { id: 2, name: 'جامعة إسطنبول التقنية (ITU)', category: 'universities', area: 'مسلك', rating: 4.9, description: 'من أفضل الجامعات الهندسية' },
    { id: 3, name: 'جامعة مرمرة', category: 'universities', area: 'كاديكوي', rating: 4.7, description: 'جامعة حكومية مميزة' },
    { id: 4, name: 'جامعة يلدز التقنية', category: 'universities', area: 'بشيكتاش', rating: 4.6, description: 'تخصصات هندسية متنوعة' },
    { id: 5, name: 'جامعة بوغازيتشي', category: 'universities', area: 'بيبك', rating: 4.9, description: 'من أفضل الجامعات في تركيا' },
    
    // Cafes
    { id: 6, name: 'Pierre Loti Cafe', category: 'cafes', area: 'إيوب', rating: 4.7, description: 'إطلالة ساحرة على القرن الذهبي' },
    { id: 7, name: 'Mandabatmaz', category: 'cafes', area: 'تقسيم', rating: 4.5, description: 'أفضل قهوة تركية' },
    { id: 8, name: 'Kronotrop', category: 'cafes', area: 'كاديكوي', rating: 4.6, description: 'قهوة مختصة عالمية' },
    
    // Tourism
    { id: 9, name: 'آيا صوفيا', category: 'tourism', area: 'السلطان أحمد', rating: 4.9, description: 'تحفة معمارية تاريخية' },
    { id: 10, name: 'قصر توبكابي', category: 'tourism', area: 'السلطان أحمد', rating: 4.8, description: 'قصر السلاطين العثمانيين' },
    { id: 11, name: 'برج غلاطة', category: 'tourism', area: 'غلاطة', rating: 4.7, description: 'إطلالة بانورامية على المدينة' },
    { id: 12, name: 'البازار الكبير', category: 'tourism', area: 'الفاتح', rating: 4.5, description: 'أكبر سوق مغطى في العالم' },
    
    // Beaches
    { id: 13, name: 'شاطئ كيليوس', category: 'beaches', area: 'ساريير', rating: 4.4, description: 'شاطئ على البحر الأسود' },
    { id: 14, name: 'جزر الأميرات', category: 'beaches', area: 'الجزر', rating: 4.8, description: 'جزر ساحرة بدون سيارات' },
    { id: 15, name: 'شاطئ فلوريا', category: 'beaches', area: 'باكركوي', rating: 4.2, description: 'شاطئ عائلي قريب' },
    
    // Municipalities
    { id: 16, name: 'بلدية الفاتح', category: 'municipalities', area: 'الفاتح', rating: 4.0, description: 'خدمات للمقيمين والطلاب' },
    { id: 17, name: 'بلدية بشيكتاش', category: 'municipalities', area: 'بشيكتاش', rating: 4.2, description: 'منطقة راقية وحيوية' },
    { id: 18, name: 'بلدية كاديكوي', category: 'municipalities', area: 'كاديكوي', rating: 4.3, description: 'الجانب الآسيوي المميز' },
    
    // Mosques
    { id: 19, name: 'جامع السلطان أحمد (الأزرق)', category: 'mosques', area: 'السلطان أحمد', rating: 4.9, description: 'أشهر مساجد إسطنبول' },
    { id: 20, name: 'جامع السليمانية', category: 'mosques', area: 'السليمانية', rating: 4.8, description: 'تحفة المعماري سنان' },
    { id: 21, name: 'جامع الفاتح', category: 'mosques', area: 'الفاتح', rating: 4.7, description: 'أول جامع بني بعد الفتح' },
    { id: 22, name: 'جامع إيوب سلطان', category: 'mosques', area: 'إيوب', rating: 4.9, description: 'مقام الصحابي أبو أيوب الأنصاري' },
    
    // Yemeni Community
    { id: 23, name: 'المطعم اليمني - صنعاء', category: 'yemeni', area: 'الفاتح', rating: 4.6, description: 'أكلات يمنية أصيلة' },
    { id: 24, name: 'مقهى اليمن السعيد', category: 'yemeni', area: 'أكسراي', rating: 4.4, description: 'تجمع الجالية اليمنية' },
    { id: 25, name: 'مطعم بلقيس اليمني', category: 'yemeni', area: 'زيتين بورنو', rating: 4.5, description: 'مندي ومظبي يمني' },
    { id: 26, name: 'مقر اتحاد الطلاب اليمنيين', category: 'yemeni', area: 'الفاتح', rating: 5.0, description: 'مقر الاتحاد الرسمي' },
  ];

  const filteredPlaces = selectedCategory === 'all' 
    ? places 
    : places.filter(p => p.category === selectedCategory);

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.icon : MapPin;
  };

  const getCategoryColor = (category: string) => {
    const cat = categories.find(c => c.id === category);
    return cat ? cat.color : 'text-primary';
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader title="خريطة إسطنبول" showBack />

      <div className="p-4 max-w-lg mx-auto space-y-4">
        {/* Map Placeholder */}
        <Card className="border-0 shadow-soft overflow-hidden">
          <div className="relative h-48 bg-gradient-to-br from-primary/10 to-emerald-500/10">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-primary mx-auto mb-2" />
                <p className="text-foreground font-semibold">خريطة إسطنبول التفاعلية</p>
                <p className="text-sm text-muted-foreground">اختر فئة لاستكشاف الأماكن</p>
              </div>
            </div>
            {/* Decorative dots for map feel */}
            <div className="absolute top-4 left-4 w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
            <div className="absolute top-12 right-8 w-2 h-2 rounded-full bg-rose-500" />
            <div className="absolute bottom-8 left-12 w-2 h-2 rounded-full bg-emerald-500" />
            <div className="absolute bottom-4 right-4 w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
          </div>
        </Card>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-foreground hover:bg-secondary/80'
              }`}
            >
              <cat.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Places List */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {filteredPlaces.length} مكان
          </p>
          {filteredPlaces.map((place) => {
            const Icon = getCategoryIcon(place.category);
            const iconColor = getCategoryColor(place.category);
            
            return (
              <Card key={place.id} className="border-0 shadow-soft cursor-pointer hover:shadow-card transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-secondary flex items-center justify-center ${iconColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{place.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          ⭐ {place.rating}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{place.description}</p>
                      <div className="flex items-center gap-1 text-xs text-primary">
                        <MapPin className="w-3 h-3" />
                        {place.area}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Info Card */}
        <Card className="border-0 shadow-soft bg-primary/5">
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">
              💡 قريباً: خريطة تفاعلية مع الاتجاهات
            </p>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default IstanbulMap;
