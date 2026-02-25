import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/layout/PageHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import PrayerTimesTab from "@/components/features/quran/PrayerTimesTab";
import MemorizationTab from "@/components/features/quran/MemorizationTab";
import DhikrTab from "@/components/features/quran/DhikrTab";
import QuranTeachersTab from "@/components/features/quran/QuranTeachersTab";
import FamilyTab from "@/components/features/quran/FamilyTab";
import PrayerAlertBanner from "@/components/features/quran/PrayerAlertBanner";
import { Clock, BookOpen, Heart, Users, Home, Moon, Sun, Sunrise, Sunset, Star, Target, Award, TrendingUp } from "lucide-react";

const QuranLife = () => {
  const [activeTab, setActiveTab] = useState("prayer");
  const [showPrayerAlert, setShowPrayerAlert] = useState(false);
  const [currentPrayer, setCurrentPrayer] = useState("");
  const [tasbeehCount, setTasbeehCount] = useState(0);
  const [tasbeehGoal] = useState(100);
  const [dailyProgress, setDailyProgress] = useState({
    prayers: 3,
    dhikr: 45,
    quran: 2
  });

  // Hijri date calculation (simplified)
  const getHijriDate = () => {
    const today = new Date();
    // Simplified approximation - in production use a proper library
    return {
      day: 15,
      month: "رجب",
      year: 1447
    };
  };

  const hijriDate = getHijriDate();

  const tabs = [
    { id: "prayer", label: "الصلاة", icon: Clock, color: "from-amber-500 to-orange-500" },
    { id: "dhikr", label: "الذكر", icon: Heart, color: "from-pink-500 to-rose-500" },
    { id: "memorization", label: "الحفظ", icon: BookOpen, color: "from-emerald-500 to-teal-500" },
    // { id: "teachers", label: "المعلمون", icon: Users, color: "from-blue-500 to-indigo-500" },
    // { id: "family", label: "العائلة", icon: Home, color: "from-purple-500 to-violet-500" },
  ];

  const handleTasbeeh = () => {
    if (tasbeehCount < tasbeehGoal) {
      setTasbeehCount(prev => prev + 1);
      // Haptic feedback
      if (navigator.vibrate) {
        navigator.vibrate(10);
      }
    }
  };

  const resetTasbeeh = () => {
    setTasbeehCount(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-950/20 dark:to-background" dir="rtl">
      {/* Prayer Alert Banner */}
      {showPrayerAlert && (
        <PrayerAlertBanner
          prayerName={currentPrayer}
          onDismiss={() => setShowPrayerAlert(false)}
        />
      )}

      <PageHeader title="القرآن والذكر" showBack />

      <div className="px-4 pb-24 max-w-lg mx-auto space-y-5">
        {/* Hero Section - Premium Design */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white p-6 shadow-elevated">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-4 left-4 w-40 h-40 rounded-full bg-white blur-3xl" />
            <div className="absolute bottom-4 right-4 w-32 h-32 rounded-full bg-teal-300 blur-2xl" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="text-4xl">🕌</div>
                  <Badge className="bg-white/20 text-white border-0">اليوم</Badge>
                </div>
                <h2 className="text-2xl font-bold mb-1">منظومة إيمانية متكاملة</h2>
                <p className="text-emerald-100 text-sm">رفيقك اليومي في رحلة الإيمان</p>
              </div>
            </div>

            {/* Hijri Date */}
            <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/10 backdrop-blur-sm">
              <div className="flex-1 text-center">
                <p className="text-3xl font-bold">{hijriDate.day}</p>
                <p className="text-xs text-emerald-100">{hijriDate.month}</p>
              </div>
              <div className="w-px h-12 bg-white/20" />
              <div className="flex-1 text-center">
                <p className="text-lg font-bold">{hijriDate.year} هـ</p>
                <p className="text-xs text-emerald-100">{new Date().toLocaleDateString('ar-SA', { weekday: 'long' })}</p>
              </div>
              <div className="w-px h-12 bg-white/20" />
              <div className="flex-1 text-center">
                <p className="text-lg font-bold">{new Date().toLocaleDateString('ar-SA', { day: 'numeric', month: 'short' })}</p>
                <p className="text-xs text-emerald-100">ميلادي</p>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Progress Card */}


        {/* Digital Tasbeeh */}
        <Card className="border-0 shadow-soft overflow-hidden">
          <CardContent className="p-0">
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-6">
              <div className="text-center mb-4">
                <h3 className="font-bold mb-1 flex items-center justify-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  المسبحة الرقمية
                </h3>
                <p className="text-xs text-muted-foreground">سبحان الله وبحمده</p>
              </div>

              {/* Counter Display */}
              <button
                onClick={handleTasbeeh}
                className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-primary to-primary/80 text-white flex flex-col items-center justify-center shadow-xl active:scale-95 transition-transform"
              >
                <span className="text-4xl font-bold">{tasbeehCount}</span>
                <span className="text-xs text-white/70">/{tasbeehGoal}</span>
              </button>

              {/* Progress */}
              <div className="mt-4 space-y-2">
                <Progress value={(tasbeehCount / tasbeehGoal) * 100} className="h-2" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{Math.round((tasbeehCount / tasbeehGoal) * 100)}% من الهدف</span>
                  <Button variant="ghost" size="sm" onClick={resetTasbeeh} className="text-xs h-6">
                    إعادة
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 h-auto bg-card shadow-soft rounded-xl p-1.5">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex flex-col items-center gap-1 py-3 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all"
              >
                <tab.icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="mt-4">
            <TabsContent value="prayer" className="mt-0">
              <PrayerTimesTab />
            </TabsContent>

            <TabsContent value="dhikr" className="mt-0">
              <DhikrTab />
            </TabsContent>

            <TabsContent value="memorization" className="mt-0">
              <MemorizationTab />
            </TabsContent>

            <TabsContent value="teachers" className="mt-0">
              <QuranTeachersTab />
            </TabsContent>

            <TabsContent value="family" className="mt-0">
              <FamilyTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
};

export default QuranLife;
