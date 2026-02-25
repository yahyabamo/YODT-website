import { useState, useEffect } from 'react';
import { 
  Stethoscope, Search, Filter, MapPin, Star, CheckCircle,
  ChevronLeft, Languages, Award, MessageCircle, Phone, Video,
  Clock, FileText, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { PageHeader } from '@/components/layout/PageHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Doctor {
  id: string;
  full_name: string;
  specialty: string;
  sub_specialty: string | null;
  bio: string | null;
  phone: string | null;
  email: string | null;
  languages: string[] | null;
  experience_years: number | null;
  working_hours: string | null;
  is_verified: boolean;
  is_available: boolean;
  profile_image_url: string | null;
  rating: number;
  consultation_count: number;
  consultation_types: string[];
  badges: string[];
  city: { name_ar: string } | null;
  country: { name_ar: string } | null;
}

interface City {
  id: string;
  name_ar: string;
}

interface Country {
  id: string;
  name_ar: string;
}

const specialties = [
  { value: 'all', label: 'جميع التخصصات' },
  { value: 'عام', label: 'طب عام' },
  { value: 'باطنة', label: 'باطنة' },
  { value: 'جراحة', label: 'جراحة' },
  { value: 'عظام', label: 'عظام' },
  { value: 'أطفال', label: 'أطفال' },
  { value: 'نساء', label: 'نساء وتوليد' },
  { value: 'أسنان', label: 'أسنان' },
  { value: 'جلدية', label: 'جلدية' },
  { value: 'عيون', label: 'عيون' },
  { value: 'نفسي', label: 'طب نفسي' },
  { value: 'قلب', label: 'قلب وأوعية' },
  { value: 'أعصاب', label: 'أعصاب' }
];

const DoctorsDirectory = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [doctorsRes, citiesRes, countriesRes] = await Promise.all([
        supabase
          .from('doctors')
          .select(`
            *,
            city:cities(name_ar),
            country:countries(name_ar)
          `)
          .order('is_verified', { ascending: false })
          .order('rating', { ascending: false }),
        supabase.from('cities').select('id, name_ar'),
        supabase.from('countries').select('id, name_ar')
      ]);

      if (doctorsRes.error) throw doctorsRes.error;
      
      // Map the data to ensure consultation_types is always an array
      const mappedDoctors = (doctorsRes.data || []).map(d => ({
        ...d,
        is_available: d.is_available ?? true,
        rating: d.rating ?? 0,
        consultation_count: d.consultation_count ?? 0,
        consultation_types: d.consultation_types || ['text'],
        badges: d.badges || []
      }));
      
      setDoctors(mappedDoctors.length > 0 ? mappedDoctors : getDemoDoctors());
      setCities(citiesRes.data || []);
      setCountries(countriesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setDoctors(getDemoDoctors());
    } finally {
      setLoading(false);
    }
  };

  const getDemoDoctors = (): Doctor[] => [
    {
      id: '1',
      full_name: 'أحمد الشرعبي',
      specialty: 'طب عام',
      sub_specialty: null,
      bio: 'طبيب عام بخبرة 15 عاماً في مجال الرعاية الصحية الأولية',
      phone: '+90 555 111 2233',
      email: 'dr.ahmed@example.com',
      languages: ['العربية', 'التركية', 'الإنجليزية'],
      experience_years: 15,
      working_hours: '09:00 - 17:00',
      is_verified: true,
      is_available: true,
      profile_image_url: null,
      rating: 4.8,
      consultation_count: 234,
      consultation_types: ['text', 'voice', 'video'],
      badges: ['موثق', 'نشط'],
      city: { name_ar: 'إسطنبول' },
      country: { name_ar: 'تركيا' }
    },
    {
      id: '2',
      full_name: 'سارة المقطري',
      specialty: 'أطفال',
      sub_specialty: 'حديثي الولادة',
      bio: 'أخصائية طب الأطفال وحديثي الولادة',
      phone: '+90 555 222 3344',
      email: 'dr.sara@example.com',
      languages: ['العربية', 'التركية'],
      experience_years: 10,
      working_hours: '10:00 - 18:00',
      is_verified: true,
      is_available: true,
      profile_image_url: null,
      rating: 4.9,
      consultation_count: 189,
      consultation_types: ['text', 'video'],
      badges: ['موثق'],
      city: { name_ar: 'إسطنبول' },
      country: { name_ar: 'تركيا' }
    },
    {
      id: '3',
      full_name: 'محمد الحيمي',
      specialty: 'قلب',
      sub_specialty: 'قسطرة القلب',
      bio: 'استشاري أمراض القلب والأوعية الدموية',
      phone: '+90 555 333 4455',
      email: 'dr.mohammed@example.com',
      languages: ['العربية', 'التركية', 'الإنجليزية'],
      experience_years: 20,
      working_hours: '08:00 - 16:00',
      is_verified: true,
      is_available: false,
      profile_image_url: null,
      rating: 4.7,
      consultation_count: 312,
      consultation_types: ['text'],
      badges: ['موثق', 'خبير'],
      city: { name_ar: 'أنقرة' },
      country: { name_ar: 'تركيا' }
    }
  ];

  const filteredDoctors = doctors.filter(d => {
    const matchesSearch = d.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.sub_specialty?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSpecialty = selectedSpecialty === 'all' || d.specialty.includes(selectedSpecialty);
    const matchesCity = selectedCity === 'all' || d.city?.name_ar === selectedCity;
    const matchesCountry = selectedCountry === 'all' || d.country?.name_ar === selectedCountry;
    const matchesAvailable = !availableOnly || d.is_available;
    return matchesSearch && matchesSpecialty && matchesCity && matchesCountry && matchesAvailable;
  });

  const activeFiltersCount = [
    selectedSpecialty !== 'all',
    selectedCity !== 'all',
    selectedCountry !== 'all',
    availableOnly
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSelectedSpecialty('all');
    setSelectedCity('all');
    setSelectedCountry('all');
    setAvailableOnly(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader title="دليل الأطباء" showBack />

      <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="ابحث عن طبيب أو تخصص..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 h-12 bg-card"
            />
          </div>
          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="h-12 w-12 relative">
                <Filter className="h-5 w-5" />
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh]">
              <SheetHeader>
                <SheetTitle className="flex items-center justify-between">
                  <span>فلترة النتائج</span>
                  {activeFiltersCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      مسح الكل
                    </Button>
                  )}
                </SheetTitle>
              </SheetHeader>
              <div className="space-y-6 mt-6">
                {/* Specialty Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">التخصص</label>
                  <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر التخصص" />
                    </SelectTrigger>
                    <SelectContent>
                      {specialties.map(s => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Country Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">الدولة</label>
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الدولة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الدول</SelectItem>
                      {countries.map(c => (
                        <SelectItem key={c.id} value={c.name_ar}>{c.name_ar}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* City Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">المدينة</label>
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر المدينة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع المدن</SelectItem>
                      {cities.map(c => (
                        <SelectItem key={c.id} value={c.name_ar}>{c.name_ar}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Availability Filter */}
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">المتاحون فقط</label>
                  <Button
                    variant={availableOnly ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAvailableOnly(!availableOnly)}
                  >
                    {availableOnly ? 'مفعّل' : 'غير مفعّل'}
                  </Button>
                </div>

                <Button className="w-full" onClick={() => setShowFilters(false)}>
                  عرض {filteredDoctors.length} نتيجة
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Quick Specialty Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {specialties.slice(0, 6).map(spec => (
            <Button
              key={spec.value}
              variant={selectedSpecialty === spec.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedSpecialty(spec.value)}
              className="shrink-0"
            >
              {spec.label}
            </Button>
          ))}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{filteredDoctors.length} طبيب</span>
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-primary">
              مسح الفلاتر
            </Button>
          )}
        </div>

        {/* Doctors List */}
        <div className="space-y-4">
          {filteredDoctors.length === 0 ? (
            <Card className="shadow-soft">
              <CardContent className="p-8 text-center">
                <Stethoscope className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">لا يوجد أطباء</p>
                <Button variant="link" onClick={clearFilters}>مسح الفلاتر</Button>
              </CardContent>
            </Card>
          ) : (
            filteredDoctors.map((doctor) => (
              <Card 
                key={doctor.id} 
                className="shadow-soft border-0 overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/doctor/${doctor.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="relative">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={doctor.profile_image_url || ''} />
                        <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                          {doctor.full_name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {doctor.is_available && (
                        <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold">د. {doctor.full_name}</h3>
                        {doctor.is_verified && (
                          <CheckCircle className="h-4 w-4 text-blue-500 fill-blue-500 shrink-0" />
                        )}
                        {!doctor.is_available && (
                          <Badge variant="secondary" className="text-xs">غير متاح</Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-primary font-medium">
                        {doctor.specialty}
                        {doctor.sub_specialty && ` • ${doctor.sub_specialty}`}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted-foreground">
                        {doctor.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {doctor.city.name_ar}
                          </span>
                        )}
                        {doctor.rating > 0 && (
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                            {doctor.rating.toFixed(1)}
                          </span>
                        )}
                        {doctor.experience_years && (
                          <span className="flex items-center gap-1">
                            <Award className="h-3 w-3" />
                            {doctor.experience_years} سنة
                          </span>
                        )}
                      </div>

                      {/* Consultation Types */}
                      <div className="flex gap-2 mt-3">
                        {doctor.consultation_types?.includes('text') && (
                          <Badge variant="outline" className="text-xs gap-1">
                            <MessageCircle className="h-3 w-3" />
                            نصية
                          </Badge>
                        )}
                        {doctor.consultation_types?.includes('voice') && (
                          <Badge variant="outline" className="text-xs gap-1">
                            <Phone className="h-3 w-3" />
                            صوتية
                          </Badge>
                        )}
                        {doctor.consultation_types?.includes('video') && (
                          <Badge variant="outline" className="text-xs gap-1">
                            <Video className="h-3 w-3" />
                            فيديو
                          </Badge>
                        )}
                      </div>
                    </div>

                    <ChevronLeft className="h-5 w-5 text-muted-foreground shrink-0 self-center" />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-4">
                    <Button 
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/doctor/${doctor.id}`);
                      }}
                    >
                      عرض الملف
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex-1"
                      disabled={!doctor.is_available}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/consultation/${doctor.id}`);
                      }}
                    >
                      استشارة الآن
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default DoctorsDirectory;
