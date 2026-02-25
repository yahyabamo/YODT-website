import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  RotateCcw,
  Heart,
  Check,
  Sparkles,
  Volume2,
  VolumeX
} from "lucide-react";

interface Dhikr {
  id: string;
  arabic: string;
  meaning: string;
  count: number;
  target: number;
  color: string;
}

const dhikrList: Dhikr[] = [
  {
    id: "tasbih",
    arabic: "سُبْحَانَ اللّٰهِ",
    meaning: "تسبيح",
    count: 0,
    target: 33,
    color: "from-emerald-500 to-teal-600"
  },
  {
    id: "tahmid",
    arabic: "الْحَمْدُ لِلّٰهِ",
    meaning: "تحميد",
    count: 0,
    target: 33,
    color: "from-amber-500 to-orange-600"
  },
  {
    id: "takbir",
    arabic: "اللّٰهُ أَكْبَرُ",
    meaning: "تكبير",
    count: 0,
    target: 33,
    color: "from-purple-500 to-indigo-600"
  },
  {
    id: "istighfar",
    arabic: "أَسْتَغْفِرُ اللّٰهَ",
    meaning: "استغفار",
    count: 0,
    target: 100,
    color: "from-sky-500 to-blue-600"
  },
  {
    id: "hawqala",
    arabic: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللّٰهِ",
    meaning: "الحوقلة",
    count: 0,
    target: 100,
    color: "from-rose-500 to-pink-600"
  },
  {
    id: "shahada",
    arabic: "لَا إِلٰهَ إِلَّا اللّٰهُ",
    meaning: "التوحيد",
    count: 0,
    target: 100,
    color: "from-green-600 to-emerald-700"
  }
];

const STORAGE_KEY = "dhikr_counts";
const DAILY_STORAGE_KEY = "dhikr_daily";

const DhikrTab = () => {
  const [dhikrs, setDhikrs] = useState<Dhikr[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const savedDhikrs = JSON.parse(saved);
      return dhikrList.map(d => ({
        ...d,
        count: savedDhikrs[d.id] || 0
      }));
    }
    return dhikrList;
  });

  const [selectedDhikr, setSelectedDhikr] = useState<Dhikr | null>(null);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [todayTotal, setTodayTotal] = useState(0);

  // Load daily total
  useEffect(() => {
    const today = new Date().toDateString();
    const dailyData = localStorage.getItem(DAILY_STORAGE_KEY);
    if (dailyData) {
      const parsed = JSON.parse(dailyData);
      if (parsed.date === today) {
        setTodayTotal(parsed.total);
      } else {
        // Reset for new day
        localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify({ date: today, total: 0 }));
        setTodayTotal(0);
      }
    } else {
      localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify({ date: today, total: 0 }));
    }
  }, []);

  // Save counts to localStorage
  useEffect(() => {
    const counts: Record<string, number> = {};
    dhikrs.forEach(d => { counts[d.id] = d.count; });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(counts));
  }, [dhikrs]);

  const vibrate = useCallback(() => {
    if (vibrationEnabled && navigator.vibrate) {
      navigator.vibrate(30);
    }
  }, [vibrationEnabled]);

  const strongVibrate = useCallback(() => {
    if (vibrationEnabled && navigator.vibrate) {
      navigator.vibrate([50, 50, 50]);
    }
  }, [vibrationEnabled]);

  const incrementCount = useCallback(() => {
    if (!selectedDhikr) return;

    const newCount = selectedDhikr.count + 1;

    // Vibrate on 33 or 100
    if (newCount === 33 || newCount === 100 || newCount % 100 === 0) {
      strongVibrate();
    } else {
      vibrate();
    }

    setDhikrs(prev => prev.map(d =>
      d.id === selectedDhikr.id ? { ...d, count: newCount } : d
    ));
    setSelectedDhikr(prev => prev ? { ...prev, count: newCount } : null);

    // Update daily total
    const today = new Date().toDateString();
    const newTotal = todayTotal + 1;
    setTodayTotal(newTotal);
    localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify({ date: today, total: newTotal }));
  }, [selectedDhikr, todayTotal, vibrate, strongVibrate]);

  const resetCount = useCallback(() => {
    if (!selectedDhikr) return;
    setDhikrs(prev => prev.map(d =>
      d.id === selectedDhikr.id ? { ...d, count: 0 } : d
    ));
    setSelectedDhikr(prev => prev ? { ...prev, count: 0 } : null);
  }, [selectedDhikr]);

  const totalDhikr = dhikrs.reduce((sum, d) => sum + d.count, 0);

  // Counter View
  if (selectedDhikr) {
    const progress = Math.min((selectedDhikr.count / selectedDhikr.target) * 100, 100);
    const isComplete = selectedDhikr.count >= selectedDhikr.target;

    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => setSelectedDhikr(null)}
            className="text-muted-foreground"
          >
            ← العودة
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setVibrationEnabled(!vibrationEnabled)}
          >
            {vibrationEnabled ? (
              <Volume2 className="h-5 w-5 text-emerald-600" />
            ) : (
              <VolumeX className="h-5 w-5 text-muted-foreground" />
            )}
          </Button>
        </div>

        {/* Main Counter */}
        <Card className={`bg-gradient-to-br ${selectedDhikr.color} text-white border-0 shadow-elevated`}>
          <CardContent className="p-8 text-center">
            <p className="text-white/80 text-sm mb-2">{selectedDhikr.meaning}</p>
            <h2 className="text-4xl font-bold mb-8 font-arabic leading-relaxed">
              {selectedDhikr.arabic}
            </h2>

            {/* Counter Display */}
            <div className="text-7xl font-bold mb-4 font-mono">
              {selectedDhikr.count}
            </div>

            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between text-sm text-white/80 mb-2">
                <span>الهدف: {selectedDhikr.target}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-3 bg-white/20" />
            </div>

            {isComplete && (
              <div className="flex items-center justify-center gap-2 bg-white/20 rounded-full py-2 px-4 mb-4 mx-auto w-fit">
                <Sparkles className="h-5 w-5" />
                <span className="font-medium">أكملت الهدف! ما شاء الله</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Counter Button - Big Tap Area */}
        <button
          onClick={incrementCount}
          className={`w-full aspect-square max-w-[280px] mx-auto rounded-full bg-gradient-to-br ${selectedDhikr.color} 
            shadow-elevated flex items-center justify-center text-white active:scale-95 transition-transform
            focus:outline-none focus:ring-4 focus:ring-white/30`}
          style={{ touchAction: 'manipulation' }}
        >
          <div className="text-center">
            <Heart className="h-16 w-16 mx-auto mb-2 fill-white/30" />
            <span className="text-lg font-medium">اضغط للتسبيح</span>
          </div>
        </button>

        {/* Reset Button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={resetCount}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            إعادة العداد
          </Button>
        </div>
      </div>
    );
  }

  // Dhikr Selection View
  return (
    <div className="space-y-4">
      {/* Daily Summary */}
      <Card className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg">إنجازك اليوم</h3>
            <Sparkles className="h-5 w-5 text-yellow-300" />
          </div>

          <div className="text-center">
            <div className="text-5xl font-bold mb-2">{todayTotal}</div>
            <p className="text-emerald-100 text-sm">ذكر</p>
          </div>

          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="flex justify-between text-sm">
              <span className="text-emerald-100">إجمالي الأذكار</span>
              <span className="font-bold">{totalDhikr}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dhikr List */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-bold text-foreground mb-4">اختر ذكراً</h4>

          <div className="space-y-3">
            {dhikrs.map((dhikr) => {
              const progress = Math.min((dhikr.count / dhikr.target) * 100, 100);
              const isComplete = dhikr.count >= dhikr.target;

              return (
                <button
                  key={dhikr.id}
                  onClick={() => setSelectedDhikr(dhikr)}
                  className={`w-full p-4 rounded-xl bg-gradient-to-r ${dhikr.color} 
                    text-white text-right transition-all hover:shadow-lg active:scale-[0.98]`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {isComplete && (
                        <Badge className="bg-white/20 text-white border-0">
                          <Check className="h-3 w-3 ml-1" />
                          تم
                        </Badge>
                      )}
                      <span className="text-2xl font-bold">{dhikr.count}</span>
                    </div>
                    <div>
                      <p className="font-bold text-lg">{dhikr.arabic}</p>
                      <p className="text-sm text-white/80">{dhikr.meaning}</p>
                    </div>
                  </div>
                  <Progress value={progress} className="h-2 bg-white/20" />
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      {/* <Card className="bg-muted/50 border-muted">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground text-center">
            💡 الذكر يُحفظ تلقائياً • اضغط مطولاً لاهتزاز خفيف
          </p>
        </CardContent>
      </Card> */}
    </div>
  );
};

export default DhikrTab;
