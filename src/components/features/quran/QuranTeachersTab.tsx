import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Star, 
  MapPin, 
  MessageCircle, 
  Calendar,
  CheckCircle,
  Users,
  BookOpen
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Teacher {
  id: string;
  full_name: string;
  bio: string | null;
  profile_image_url: string | null;
  is_available: boolean;
  is_verified: boolean;
  rating: number;
  students_count: number;
  experience_years: number;
  languages: string[];
  teaching_types: string[];
  target_audience: string;
  country?: { name_ar: string };
  city?: { name_ar: string };
}

const QuranTeachersTab = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedAudience, setSelectedAudience] = useState<string>("all");

  // Mock data for demonstration
  const mockTeachers: Teacher[] = [
    {
      id: "1",
      full_name: "الشيخ محمد أحمد",
      bio: "معلم قرآن كريم بخبرة 15 عاماً، متخصص في تحفيظ الأطفال والكبار",
      profile_image_url: null,
      is_available: true,
      is_verified: true,
      rating: 4.9,
      students_count: 120,
      experience_years: 15,
      languages: ["العربية", "التركية"],
      teaching_types: ["memorization", "correction"],
      target_audience: "all",
      country: { name_ar: "تركيا" },
      city: { name_ar: "إسطنبول" },
    },
    {
      id: "2",
      full_name: "الأستاذة فاطمة علي",
      bio: "معلمة قرآن للنساء والأطفال، حافظة للقرآن الكريم",
      profile_image_url: null,
      is_available: true,
      is_verified: true,
      rating: 4.8,
      students_count: 85,
      experience_years: 10,
      languages: ["العربية"],
      teaching_types: ["memorization", "review", "children"],
      target_audience: "children",
      country: { name_ar: "اليمن" },
      city: { name_ar: "صنعاء" },
    },
    {
      id: "3",
      full_name: "الشيخ عبدالله سالم",
      bio: "إجازة في القراءات العشر، متخصص في تصحيح التلاوة",
      profile_image_url: null,
      is_available: false,
      is_verified: true,
      rating: 5.0,
      students_count: 200,
      experience_years: 20,
      languages: ["العربية", "الإنجليزية"],
      teaching_types: ["correction", "review"],
      target_audience: "individuals",
      country: { name_ar: "مصر" },
      city: { name_ar: "القاهرة" },
    },
  ];

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setTeachers(mockTeachers);
      setLoading(false);
    }, 500);
  }, []);

  const teachingTypeLabels: Record<string, string> = {
    memorization: "تحفيظ",
    correction: "تصحيح",
    review: "مراجعة",
    children: "أطفال",
  };

  const audienceLabels: Record<string, string> = {
    individuals: "أفراد",
    families: "عائلات",
    children: "أطفال",
    all: "الجميع",
  };

  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch = teacher.full_name.includes(searchQuery) || 
                         teacher.bio?.includes(searchQuery);
    const matchesType = selectedType === "all" || 
                       teacher.teaching_types.includes(selectedType);
    const matchesAudience = selectedAudience === "all" || 
                           teacher.target_audience === selectedAudience ||
                           teacher.target_audience === "all";
    return matchesSearch && matchesType && matchesAudience;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="h-16 w-16 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="ابحث عن معلم..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="نوع التعليم" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="memorization">تحفيظ</SelectItem>
                <SelectItem value="correction">تصحيح</SelectItem>
                <SelectItem value="review">مراجعة</SelectItem>
                <SelectItem value="children">أطفال</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedAudience} onValueChange={setSelectedAudience}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="الفئة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الجميع</SelectItem>
                <SelectItem value="individuals">أفراد</SelectItem>
                <SelectItem value="families">عائلات</SelectItem>
                <SelectItem value="children">أطفال</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Teachers List */}
      <div className="space-y-3">
        {filteredTeachers.map((teacher) => (
          <Card key={teacher.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex gap-4">
                {/* Avatar */}
                <div className="relative">
                  <Avatar className="h-16 w-16 border-2 border-emerald-100">
                    <AvatarImage src={teacher.profile_image_url || undefined} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 text-lg">
                      {teacher.full_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {teacher.is_available && (
                    <span className="absolute bottom-0 right-0 h-4 w-4 bg-green-500 border-2 border-white rounded-full" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-gray-800 truncate">{teacher.full_name}</h4>
                    {teacher.is_verified && (
                      <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <MapPin className="h-3 w-3" />
                    <span>{teacher.city?.name_ar}، {teacher.country?.name_ar}</span>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">{teacher.bio}</p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {teacher.teaching_types.map((type) => (
                      <Badge key={type} variant="secondary" className="text-xs">
                        {teachingTypeLabels[type] || type}
                      </Badge>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-amber-600">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="font-medium">{teacher.rating}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <Users className="h-4 w-4" />
                      <span>{teacher.students_count} طالب</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                      <BookOpen className="h-4 w-4" />
                      <span>{teacher.experience_years} سنة</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 mt-4 pt-4 border-t">
                <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                  <Calendar className="h-4 w-4 ml-2" />
                  حجز جلسة
                </Button>
                <Button variant="outline" className="flex-1">
                  <MessageCircle className="h-4 w-4 ml-2" />
                  تواصل
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTeachers.length === 0 && (
        <Card className="text-center py-8">
          <CardContent>
            <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">لم يتم العثور على معلمين</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuranTeachersTab;
