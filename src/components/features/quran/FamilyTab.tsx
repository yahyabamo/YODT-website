import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  Users, 
  BookOpen, 
  Trophy,
  Shield,
  Calendar,
  CheckCircle2,
  User
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Child {
  id: string;
  name: string;
  age: number;
  gender: "male" | "female";
  level: string;
  progress: number;
  teacherName?: string;
  lastActivity?: string;
}

const FamilyTab = () => {
  const { user } = useAuth();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newChildName, setNewChildName] = useState("");
  const [newChildAge, setNewChildAge] = useState("");
  const [newChildGender, setNewChildGender] = useState<string>("");

  // Mock data
  const children: Child[] = [
    {
      id: "1",
      name: "أحمد",
      age: 8,
      gender: "male",
      level: "مبتدئ",
      progress: 15,
      teacherName: "الشيخ محمد",
      lastActivity: "اليوم",
    },
    {
      id: "2",
      name: "مريم",
      age: 10,
      gender: "female",
      level: "حافظ جزء",
      progress: 45,
      teacherName: "الأستاذة فاطمة",
      lastActivity: "أمس",
    },
  ];

  const levelColors: Record<string, string> = {
    "مبتدئ": "bg-blue-100 text-blue-700",
    "حافظ جزء": "bg-purple-100 text-purple-700",
    "حافظ جزئي": "bg-emerald-100 text-emerald-700",
  };

  const handleAddChild = () => {
    // Would save to Supabase
    console.log("Adding child:", { name: newChildName, age: newChildAge, gender: newChildGender });
    setShowAddDialog(false);
    setNewChildName("");
    setNewChildAge("");
    setNewChildGender("");
  };

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <Card className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">حساب العائلة</h3>
              <p className="text-indigo-200 text-sm">متابعة تقدم أطفالك في الحفظ</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{children.length}</p>
              <p className="text-xs text-indigo-200">أطفال</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">2</p>
              <p className="text-xs text-indigo-200">معلمين</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">30%</p>
              <p className="text-xs text-indigo-200">المعدل</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Safety Notice */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-green-600" />
            <div>
              <h4 className="font-bold text-green-800">بيئة آمنة</h4>
              <p className="text-sm text-green-600">بدون إعلانات • بدون تشتيت • خصوصية تامة</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Child Button */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogTrigger asChild>
          <Card className="cursor-pointer hover:shadow-md transition-shadow border-dashed border-2 border-indigo-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                  <Plus className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">إضافة طفل</h4>
                  <p className="text-sm text-gray-500">أضف طفلاً جديداً للمتابعة</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </DialogTrigger>

        <DialogContent className="max-w-sm" dir="rtl">
          <DialogHeader>
            <DialogTitle>إضافة طفل جديد</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="childName">اسم الطفل</Label>
              <Input
                id="childName"
                value={newChildName}
                onChange={(e) => setNewChildName(e.target.value)}
                placeholder="أدخل اسم الطفل"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="childAge">العمر</Label>
              <Input
                id="childAge"
                type="number"
                value={newChildAge}
                onChange={(e) => setNewChildAge(e.target.value)}
                placeholder="أدخل عمر الطفل"
              />
            </div>

            <div className="space-y-2">
              <Label>الجنس</Label>
              <Select value={newChildGender} onValueChange={setNewChildGender}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر الجنس" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">ذكر</SelectItem>
                  <SelectItem value="female">أنثى</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              onClick={handleAddChild}
              disabled={!newChildName || !newChildAge || !newChildGender}
            >
              إضافة الطفل
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Children List */}
      <div className="space-y-3">
        <h4 className="font-bold text-gray-800">أطفالي</h4>
        {children.map((child) => (
          <Card key={child.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex gap-4">
                <Avatar className="h-14 w-14 border-2 border-indigo-100">
                  <AvatarFallback className={`text-lg ${
                    child.gender === "male" 
                      ? "bg-blue-100 text-blue-700" 
                      : "bg-pink-100 text-pink-700"
                  }`}>
                    {child.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-gray-800">{child.name}</h4>
                    <Badge className={levelColors[child.level] || "bg-gray-100"}>
                      {child.level}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                    <span>{child.age} سنوات</span>
                    {child.teacherName && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {child.teacherName}
                      </span>
                    )}
                  </div>

                  <div className="mb-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-500">التقدم</span>
                      <span className="font-medium text-indigo-600">{child.progress}%</span>
                    </div>
                    <Progress value={child.progress} className="h-2" />
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Calendar className="h-3 w-3" />
                    <span>آخر نشاط: {child.lastActivity}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t">
                <Button variant="outline" size="sm" className="flex-1">
                  <BookOpen className="h-4 w-4 ml-2" />
                  عرض التقدم
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Calendar className="h-4 w-4 ml-2" />
                  الجلسات
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tips Section */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-4">
          <h4 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            نصيحة للوالدين
          </h4>
          <p className="text-sm text-amber-700">
            شجع طفلك على الحفظ بالتحفيز الإيجابي والمكافآت الصغيرة. 
            الاستمرارية أهم من الكمية!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FamilyTab;
