import { 
  Star, CheckCircle, MapPin, Award, MessageCircle, 
  Phone, Video, UserPlus 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface DoctorCardProps {
  doctor: {
    id: string;
    full_name: string;
    specialty: string;
    sub_specialty?: string | null;
    profile_image_url?: string | null;
    is_verified?: boolean;
    is_available?: boolean;
    rating?: number;
    consultation_count?: number;
    experience_years?: number | null;
    consultation_types?: string[];
    city?: { name_ar: string } | null;
    country?: { name_ar: string } | null;
  };
  variant?: 'default' | 'compact' | 'featured';
}

const DoctorCard = ({ doctor, variant = 'default' }: DoctorCardProps) => {
  const navigate = useNavigate();

  if (variant === 'compact') {
    return (
      <div 
        className="flex items-center gap-3 p-3 bg-card rounded-xl cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => navigate(`/doctor/${doctor.id}`)}
      >
        <div className="relative">
          <Avatar className="h-12 w-12">
            <AvatarImage src={doctor.profile_image_url || ''} />
            <AvatarFallback className="bg-primary/10 text-primary font-bold">
              {doctor.full_name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          {doctor.is_available && (
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-card rounded-full" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm truncate">د. {doctor.full_name}</span>
            {doctor.is_verified && (
              <CheckCircle className="h-3.5 w-3.5 text-blue-500 fill-blue-500 shrink-0" />
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">{doctor.specialty}</p>
        </div>
        <Button size="sm" variant="outline" className="shrink-0">
          عرض
        </Button>
      </div>
    );
  }

  if (variant === 'featured') {
    return (
      <Card 
        className="overflow-hidden cursor-pointer group border-0 shadow-card hover:shadow-elevated transition-all duration-300"
        onClick={() => navigate(`/doctor/${doctor.id}`)}
      >
        <div className="relative">
          <div className="h-32 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent" />
          <div className="absolute -bottom-10 right-4">
            <div className="relative">
              <Avatar className="h-20 w-20 border-4 border-card shadow-lg">
                <AvatarImage src={doctor.profile_image_url || ''} />
                <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                  {doctor.full_name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {doctor.is_available && (
                <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-3 border-card rounded-full" />
              )}
            </div>
          </div>
        </div>
        <CardContent className="pt-12 pb-4 px-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <h3 className="font-bold text-lg">د. {doctor.full_name}</h3>
                {doctor.is_verified && (
                  <CheckCircle className="h-4 w-4 text-blue-500 fill-blue-500" />
                )}
              </div>
              <p className="text-primary font-medium text-sm">
                {doctor.specialty}
                {doctor.sub_specialty && ` • ${doctor.sub_specialty}`}
              </p>
              {doctor.city && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {doctor.city.name_ar}
                </p>
              )}
            </div>
            <Badge variant={doctor.is_available ? 'default' : 'secondary'} className="text-xs">
              {doctor.is_available ? 'متاح' : 'غير متاح'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
            {doctor.rating !== undefined && doctor.rating > 0 && (
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                {doctor.rating.toFixed(1)}
              </span>
            )}
            {doctor.consultation_count !== undefined && doctor.consultation_count > 0 && (
              <span className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                {doctor.consultation_count}
              </span>
            )}
            {doctor.experience_years && (
              <span className="flex items-center gap-1">
                <Award className="h-4 w-4" />
                {doctor.experience_years} سنة
              </span>
            )}
          </div>

          <div className="flex gap-2 mt-4">
            <Button className="flex-1 gap-2" size="sm">
              <MessageCircle className="h-4 w-4" />
              استشارة
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <UserPlus className="h-4 w-4" />
              متابعة
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card 
      className="shadow-soft border-0 overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 active:scale-[0.98]"
      onClick={() => navigate(`/doctor/${doctor.id}`)}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar className="h-16 w-16">
              <AvatarImage src={doctor.profile_image_url || ''} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                {doctor.full_name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {doctor.is_available && (
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-card rounded-full" />
            )}
          </div>

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
              {doctor.rating !== undefined && doctor.rating > 0 && (
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
        </div>
      </CardContent>
    </Card>
  );
};

export default DoctorCard;
