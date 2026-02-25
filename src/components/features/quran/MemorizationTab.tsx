import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  Flame, 
  BookOpen, 
  CheckCircle2, 
  Plus,
  Calendar,
  Trophy
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

const MemorizationTab = () => {
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [level, setLevel] = useState<string>("beginner");
  const [goalType, setGoalType] = useState<string>("surah");

  // Mock data - would come from Supabase
  const progress = {
    currentSurah: "البقرة",
    currentAyah: 45,
    totalMemorized: 320,
    totalAyahs: 6236,
    streakDays: 7,
    progressPercentage: 5.1,
  };

  const surahs = [
    { name: "الفاتحة", ayahs: 7, memorized: true },
    { name: "البقرة", ayahs: 286, progress: 45 },
    { name: "آل عمران", ayahs: 200, progress: 0 },
    { name: "النساء", ayahs: 176, progress: 0 },
  ];

  const levels = [
    { id: "beginner", label: "مبتدئ", description: "أبدأ من الصفر" },
    { id: "partial", label: "حافظ جزئي", description: "أحفظ بعض السور" },
    { id: "review", label: "مراجعة", description: "أراجع ما حفظته" },
  ];

  const goals = [
    { id: "surah", label: "سورة", description: "حفظ سورة محددة" },
    { id: "juz", label: "جزء", description: "حفظ جزء كامل" },
    { id: "khatma", label: "ختمة", description: "حفظ القرآن كاملاً" },
  ];

  return (
    <div className="space-y-4">
      {/* Progress Overview */}
      <Card className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">تقدمك في الحفظ</h3>
            <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
              <Flame className="h-4 w-4 text-orange-300" />
              <span className="text-sm font-bold">{progress.streakDays} أيام متتالية</span>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span>{progress.totalMemorized} آية محفوظة</span>
              <span>{progress.progressPercentage}%</span>
            </div>
            <Progress value={progress.progressPercentage} className="h-3 bg-white/20" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <BookOpen className="h-6 w-6 mx-auto mb-1 text-purple-200" />
              <p className="text-sm text-purple-200">الموقع الحالي</p>
              <p className="font-bold">{progress.currentSurah} - {progress.currentAyah}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3 text-center">
              <Trophy className="h-6 w-6 mx-auto mb-1 text-yellow-300" />
              <p className="text-sm text-purple-200">الآيات المحفوظة</p>
              <p className="font-bold">{progress.totalMemorized}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Set Goal Button */}
      <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
        <DialogTrigger asChild>
          <Card className="cursor-pointer hover:shadow-md transition-shadow border-dashed border-2 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                  <Target className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">حدد هدفك</h4>
                  <p className="text-sm text-gray-500">اختر مستواك وهدفك للحفظ</p>
                </div>
                <Plus className="h-5 w-5 text-purple-400 mr-auto" />
              </div>
            </CardContent>
          </Card>
        </DialogTrigger>

        <DialogContent className="max-w-sm" dir="rtl">
          <DialogHeader>
            <DialogTitle>تحديد الهدف</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Level Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">مستواك الحالي</label>
              <RadioGroup value={level} onValueChange={setLevel} className="space-y-2">
                {levels.map((l) => (
                  <div
                    key={l.id}
                    className={`flex items-center space-x-3 space-x-reverse p-3 rounded-lg border-2 transition-all cursor-pointer ${
                      level === l.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                    }`}
                    onClick={() => setLevel(l.id)}
                  >
                    <RadioGroupItem value={l.id} id={l.id} />
                    <Label htmlFor={l.id} className="flex-1 cursor-pointer">
                      <p className="font-medium">{l.label}</p>
                      <p className="text-sm text-gray-500">{l.description}</p>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Goal Selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-3 block">هدفك</label>
              <RadioGroup value={goalType} onValueChange={setGoalType} className="space-y-2">
                {goals.map((g) => (
                  <div
                    key={g.id}
                    className={`flex items-center space-x-3 space-x-reverse p-3 rounded-lg border-2 transition-all cursor-pointer ${
                      goalType === g.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                    }`}
                    onClick={() => setGoalType(g.id)}
                  >
                    <RadioGroupItem value={g.id} id={g.id} />
                    <Label htmlFor={g.id} className="flex-1 cursor-pointer">
                      <p className="font-medium">{g.label}</p>
                      <p className="text-sm text-gray-500">{g.description}</p>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <Button className="w-full bg-purple-600 hover:bg-purple-700" onClick={() => setShowGoalDialog(false)}>
              حفظ الهدف
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Today's Task */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <Calendar className="h-5 w-5 text-green-600" />
            <h4 className="font-bold text-green-800">ورد اليوم</h4>
          </div>
          <div className="bg-white rounded-lg p-3 mb-3">
            <p className="text-gray-700 font-medium">سورة البقرة - الآيات 45-50</p>
            <p className="text-sm text-gray-500">6 آيات للحفظ</p>
          </div>
          <div className="flex gap-2">
            <Button className="flex-1 bg-green-600 hover:bg-green-700">
              <CheckCircle2 className="h-4 w-4 ml-2" />
              أنجزت الورد
            </Button>
            <Button variant="outline" className="border-green-300 text-green-700">
              لاحقاً
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Surahs Progress */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-bold text-gray-800 mb-4">تقدم السور</h4>
          <div className="space-y-3">
            {surahs.map((surah, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  surah.memorized 
                    ? 'bg-green-100 text-green-600'
                    : surah.progress && surah.progress > 0
                    ? 'bg-purple-100 text-purple-600'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {surah.memorized ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-bold">{index + 1}</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium text-gray-800">{surah.name}</span>
                    <span className="text-sm text-gray-500">
                      {surah.memorized 
                        ? `${surah.ayahs}/${surah.ayahs}`
                        : `${surah.progress || 0}/${surah.ayahs}`
                      }
                    </span>
                  </div>
                  <Progress 
                    value={surah.memorized ? 100 : ((surah.progress || 0) / surah.ayahs) * 100} 
                    className="h-2"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MemorizationTab;
