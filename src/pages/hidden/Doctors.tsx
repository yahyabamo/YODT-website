import { useState } from 'react';
import { Phone, MapPin, Clock, Star, Search, Filter, Stethoscope, Heart, Brain, Eye, Bone, Baby, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageHeader } from '@/components/layout/PageHeader';
import { useGenderContent } from '@/hooks/useGenderContent';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  city: string;
  phone: string;
  languages: string[];
  rating: number;
  available: boolean;
  experience: string;
  clinicName?: string;
  workingHours?: string;
}

const specialties = [
  { id: 'all', label: 'الكل', icon: Stethoscope },
  { id: 'عام', label: 'طب عام', icon: User },
  { id: 'قلب', label: 'قلب', icon: Heart },
  { id: 'أعصاب', label: 'أعصاب', icon: Brain },
  { id: 'عيون', label: 'عيون', icon: Eye },
  { id: 'عظام', label: 'عظام', icon: Bone },
  { id: 'أطفال', label: 'أطفال', icon: Baby },
];

const cities = ['الكل', 'إسطنبول', 'أنقرة', 'إزمير', 'بورصة', 'أنطاليا'];

const doctors: Doctor[] = [
  {
    id: '1',
    name: 'د. أحمد الشرعبي',
    specialty: 'عام',
    city: 'إسطنبول',
    phone: '+90 555 111 2233',
    languages: ['عربي', 'تركي', 'إنجليزي'],
    rating: 4.8,
    available: true,
    experience: '15 سنة',
    clinicName: 'مستشفى ميديكال بارك',
    workingHours: '09:00 - 17:00',
  },
  {
    id: '2',
    name: 'د. سارة المقطري',
    specialty: 'أطفال',
    city: 'إسطنبول',
    phone: '+90 555 222 3344',
    languages: ['عربي', 'تركي'],
    rating: 4.9,
    available: true,
    experience: '10 سنوات',
    clinicName: 'مركز الأطفال التخصصي',
    workingHours: '10:00 - 18:00',
  },
  {
    id: '3',
    name: 'د. محمد الحيمي',
    specialty: 'قلب',
    city: 'أنقرة',
    phone: '+90 555 333 4455',
    languages: ['عربي', 'تركي', 'إنجليزي'],
    rating: 4.7,
    available: false,
    experience: '20 سنة',
    clinicName: 'مستشفى القلب التخصصي',
    workingHours: '08:00 - 16:00',
  },
  {
    id: '4',
    name: 'د. فاطمة الوصابي',
    specialty: 'عيون',
    city: 'إسطنبول',
    phone: '+90 555 444 5566',
    languages: ['عربي', 'تركي'],
    rating: 4.6,
    available: true,
    experience: '8 سنوات',
    clinicName: 'مركز النور للعيون',
    workingHours: '09:00 - 17:00',
  },
  {
    id: '5',
    name: 'د. عبدالله السقاف',
    specialty: 'عظام',
    city: 'بورصة',
    phone: '+90 555 555 6677',
    languages: ['عربي', 'تركي', 'إنجليزي'],
    rating: 4.5,
    available: true,
    experience: '12 سنة',
    clinicName: 'مستشفى بورصة الجامعي',
    workingHours: '08:00 - 15:00',
  },
  {
    id: '6',
    name: 'د. نورا الكبسي',
    specialty: 'أعصاب',
    city: 'إسطنبول',
    phone: '+90 555 666 7788',
    languages: ['عربي', 'تركي'],
    rating: 4.8,
    available: true,
    experience: '14 سنة',
    clinicName: 'مركز الدماغ والأعصاب',
    workingHours: '10:00 - 18:00',
  },
];

const Doctors = () => {
  const { greeting } = useGenderContent();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedCity, setSelectedCity] = useState('الكل');
  const [showFilters, setShowFilters] = useState(false);

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch = doctor.name.includes(searchQuery) || 
                          doctor.specialty.includes(searchQuery) ||
                          doctor.clinicName?.includes(searchQuery);
    const matchesSpecialty = selectedSpecialty === 'all' || doctor.specialty === selectedSpecialty;
    const matchesCity = selectedCity === 'الكل' || doctor.city === selectedCity;
    return matchesSearch && matchesSpecialty && matchesCity;
  });

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader title="المستشفى الطلابي" showBack />

      <div className="p-4 max-w-lg mx-auto space-y-4">
        {/* Info Banner */}
        <Card className="border-0 shadow-soft bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Stethoscope className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">دليل الأطباء اليمنيين</h3>
                <p className="text-sm text-muted-foreground">
                  تواصل مع أطباء يمنيين في تركيا يتحدثون لغتك ويفهمون احتياجاتك
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="ابحث عن طبيب..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
          <Button
            variant={showFilters ? 'default' : 'outline'}
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4" />
          </Button>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card className="border-0 shadow-soft animate-in slide-in-from-top-2">
            <CardContent className="p-4 space-y-4">
              {/* City Filter */}
              <div>
                <p className="text-sm font-medium text-foreground mb-2">المدينة</p>
                <div className="flex flex-wrap gap-2">
                  {cities.map((city) => (
                    <Button
                      key={city}
                      variant={selectedCity === city ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedCity(city)}
                    >
                      {city}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Specialties */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {specialties.map((spec) => {
            const Icon = spec.icon;
            return (
              <Button
                key={spec.id}
                variant={selectedSpecialty === spec.id ? 'default' : 'outline'}
                size="sm"
                className="flex-shrink-0 gap-1"
                onClick={() => setSelectedSpecialty(spec.id)}
              >
                <Icon className="w-4 h-4" />
                {spec.label}
              </Button>
            );
          })}
        </div>

        {/* Doctors List */}
        <div className="space-y-3">
          {filteredDoctors.length === 0 ? (
            <div className="text-center py-8">
              <Stethoscope className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
              <p className="text-muted-foreground">لم يتم العثور على أطباء</p>
            </div>
          ) : (
            filteredDoctors.map((doctor) => (
              <Card key={doctor.id} className="border-0 shadow-soft">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Stethoscope className="w-7 h-7 text-primary" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{doctor.name}</h3>
                        <Badge variant={doctor.available ? 'default' : 'secondary'} className="flex-shrink-0">
                          {doctor.available ? 'متاح' : 'مشغول'}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {doctor.specialty}
                        </Badge>
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="w-3 h-3 fill-current" />
                          <span className="text-xs">{doctor.rating}</span>
                        </div>
                      </div>

                      {doctor.clinicName && (
                        <p className="text-sm text-muted-foreground mb-1">{doctor.clinicName}</p>
                      )}

                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {doctor.city}
                        </span>
                        {doctor.workingHours && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {doctor.workingHours}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-1 mt-2">
                        {doctor.languages.map((lang) => (
                          <span key={lang} className="text-xs bg-secondary px-2 py-0.5 rounded">
                            {lang}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Action */}
                  <Button
                    className="w-full mt-4 gap-2"
                    variant={doctor.available ? 'default' : 'secondary'}
                    onClick={() => handleCall(doctor.phone)}
                    disabled={!doctor.available}
                  >
                    <Phone className="w-4 h-4" />
                    {doctor.available ? 'اتصل الآن' : 'غير متاح حالياً'}
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Disclaimer */}
        <Card className="border-0 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="p-4">
            <p className="text-xs text-amber-700 dark:text-amber-400 text-center">
              ⚠️ هذا الدليل للإرشاد فقط ولا يغني عن الاستشارة الطبية المباشرة
            </p>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default Doctors;
