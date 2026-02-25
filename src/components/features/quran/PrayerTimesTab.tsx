import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, BellOff, MapPin, Sun, Sunrise, CloudSun, Sunset, Moon, BookOpen, RefreshCw, Settings, Search, Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import PrayerAlertBanner from "./PrayerAlertBanner";

interface PrayerTime {
  name: string;
  nameAr: string;
  time: string;
  icon: React.ElementType;
}

interface AladhanResponse {
  data: {
    timings: {
      Fajr: string;
      Sunrise: string;
      Dhuhr: string;
      Asr: string;
      Maghrib: string;
      Isha: string;
    };
    date: {
      hijri: {
        day: string;
        month: { ar: string };
        year: string;
      };
      gregorian: {
        day: string;
        month: { en: string };
        year: string;
      };
    };
    meta: {
      timezone: string;
    };
  };
}

interface City {
  city: string;
  country: string;
  nameAr: string;
  countryAr: string;
  region?: string;
}

// Extended global cities list
const allCities: City[] = [
  // تركيا
  { city: "Istanbul", country: "Turkey", nameAr: "إسطنبول", countryAr: "تركيا", region: "تركيا" },
  { city: "Ankara", country: "Turkey", nameAr: "أنقرة", countryAr: "تركيا", region: "تركيا" },
  { city: "Izmir", country: "Turkey", nameAr: "إزمير", countryAr: "تركيا", region: "تركيا" },
  { city: "Bursa", country: "Turkey", nameAr: "بورصة", countryAr: "تركيا", region: "تركيا" },
  { city: "Antalya", country: "Turkey", nameAr: "أنطاليا", countryAr: "تركيا", region: "تركيا" },
  { city: "Konya", country: "Turkey", nameAr: "قونية", countryAr: "تركيا", region: "تركيا" },
  { city: "Trabzon", country: "Turkey", nameAr: "طرابزون", countryAr: "تركيا", region: "تركيا" },
  { city: "Gaziantep", country: "Turkey", nameAr: "غازي عنتاب", countryAr: "تركيا", region: "تركيا" },

  // اليمن
];

const STORAGE_KEY = "selected_city";

const PrayerTimesTab = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [nextPrayer, setNextPrayer] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTime[]>([]);
  const [hijriDate, setHijriDate] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<City>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    return allCities[0];
  });
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showPrayerAlert, setShowPrayerAlert] = useState(false);
  const [alertPrayerName, setAlertPrayerName] = useState("");
  const [lastAlertedPrayer, setLastAlertedPrayer] = useState<string | null>(null);

  const filteredCities = allCities.filter(city =>
    city.nameAr.includes(searchQuery) ||
    city.countryAr.includes(searchQuery) ||
    city.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedCities = filteredCities.reduce((acc, city) => {
    const region = city.region || "أخرى";
    if (!acc[region]) acc[region] = [];
    acc[region].push(city);
    return acc;
  }, {} as Record<string, City[]>);

  const fetchPrayerTimes = async (city: string, country: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=2`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch prayer times");
      }

      const data: AladhanResponse = await response.json();
      const timings = data.data.timings;

      const times: PrayerTime[] = [
        { name: "fajr", nameAr: "الفجر", time: timings.Fajr.substring(0, 5), icon: Sunrise },
        { name: "sunrise", nameAr: "الشروق", time: timings.Sunrise.substring(0, 5), icon: Sun },
        { name: "dhuhr", nameAr: "الظهر", time: timings.Dhuhr.substring(0, 5), icon: CloudSun },
        { name: "asr", nameAr: "العصر", time: timings.Asr.substring(0, 5), icon: CloudSun },
        { name: "maghrib", nameAr: "المغرب", time: timings.Maghrib.substring(0, 5), icon: Sunset },
        { name: "isha", nameAr: "العشاء", time: timings.Isha.substring(0, 5), icon: Moon },
      ];

      setPrayerTimes(times);

      const hijri = data.data.date.hijri;
      setHijriDate(`${hijri.day} ${hijri.month.ar} ${hijri.year}`);

    } catch (err) {
      console.error("Error fetching prayer times:", err);
      setError("حدث خطأ في جلب مواقيت الصلاة");
      setPrayerTimes([
        { name: "fajr", nameAr: "الفجر", time: "05:45", icon: Sunrise },
        { name: "sunrise", nameAr: "الشروق", time: "07:15", icon: Sun },
        { name: "dhuhr", nameAr: "الظهر", time: "12:30", icon: CloudSun },
        { name: "asr", nameAr: "العصر", time: "15:30", icon: CloudSun },
        { name: "maghrib", nameAr: "المغرب", time: "18:00", icon: Sunset },
        { name: "isha", nameAr: "العشاء", time: "19:30", icon: Moon },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrayerTimes(selectedCity.city, selectedCity.country);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedCity));
  }, [selectedCity]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Check for prayer time alerts
  const checkPrayerAlert = useCallback(() => {
    if (!notificationsEnabled || prayerTimes.length === 0) return;

    const now = currentTime;
    const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    for (const prayer of prayerTimes) {
      if (prayer.name === 'sunrise') continue; // Skip sunrise

      if (prayer.time === currentTimeStr && lastAlertedPrayer !== prayer.name) {
        setAlertPrayerName(prayer.nameAr);
        setShowPrayerAlert(true);
        setLastAlertedPrayer(prayer.name);
        break;
      }
    }
  }, [currentTime, prayerTimes, notificationsEnabled, lastAlertedPrayer]);

  useEffect(() => {
    checkPrayerAlert();
  }, [checkPrayerAlert]);

  useEffect(() => {
    if (prayerTimes.length === 0) return;

    const now = currentTime;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    let foundNext = false;
    for (const prayer of prayerTimes) {
      const [hours, minutes] = prayer.time.split(':').map(Number);
      const prayerMinutes = hours * 60 + minutes;
      if (prayerMinutes > currentMinutes) {
        setNextPrayer(prayer.name);
        foundNext = true;
        break;
      }
    }

    if (!foundNext) {
      setNextPrayer("fajr");
    }
  }, [currentTime, prayerTimes]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ar-SA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTimeUntilNextPrayer = () => {
    if (!nextPrayer || prayerTimes.length === 0) return null;
    const prayer = prayerTimes.find(p => p.name === nextPrayer);
    if (!prayer) return null;

    const [hours, minutes] = prayer.time.split(':').map(Number);
    const prayerDate = new Date(currentTime);
    prayerDate.setHours(hours, minutes, 0);

    let diff = prayerDate.getTime() - currentTime.getTime();

    if (diff < 0) {
      prayerDate.setDate(prayerDate.getDate() + 1);
      diff = prayerDate.getTime() - currentTime.getTime();
    }

    const diffMinutes = Math.floor(diff / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const remainingMinutes = diffMinutes % 60;

    if (diffHours > 0) {
      return `${diffHours} ساعة و ${remainingMinutes} دقيقة`;
    }
    return `${remainingMinutes} دقيقة`;
  };

  const handleCitySelect = (city: City) => {
    setSelectedCity(city);
    setShowSettings(false);
    setSearchQuery("");
  };

  return (
    <div className="space-y-4">
      {/* Prayer Alert Banner */}
      {showPrayerAlert && (
        <PrayerAlertBanner
          prayerName={alertPrayerName}
          onDismiss={() => setShowPrayerAlert(false)}
        />
      )}

      {/* Current Time Card */}
      <Card className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-0 shadow-elevated">
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Globe className="h-4 w-4 text-emerald-200" />
            <span className="text-sm text-emerald-100">{selectedCity.nameAr}، {selectedCity.countryAr}</span>
            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-emerald-200 hover:text-white hover:bg-white/10">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm max-h-[80vh]" dir="rtl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    اختر مدينتك
                  </DialogTitle>
                </DialogHeader>

                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="ابحث عن مدينتك..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                </div>

                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {Object.entries(groupedCities).map(([region, cities]) => (
                      <div key={region}>
                        <h4 className="text-sm font-bold text-muted-foreground mb-2 sticky top-0 bg-background py-1">
                          {region}
                        </h4>
                        <div className="space-y-1">
                          {cities.map((city) => (
                            <button
                              key={`${city.city}-${city.country}`}
                              onClick={() => handleCitySelect(city)}
                              className={`w-full text-right p-3 rounded-lg transition-all ${selectedCity.city === city.city && selectedCity.country === city.country
                                ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-500'
                                : 'bg-muted/50 hover:bg-muted'
                                }`}
                            >
                              <p className="font-medium">{city.nameAr}</p>
                              <p className="text-sm text-muted-foreground">{city.countryAr}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>
          <div className="text-4xl font-bold mb-2 font-mono">
            {formatTime(currentTime)}
          </div>
          <div className="text-emerald-100 text-sm mb-1">{formatDate(currentTime)}</div>
          {hijriDate && <div className="text-emerald-200 text-xs">{hijriDate} هـ</div>}
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card className="bg-muted/50">
          <CardContent className="p-4 text-center">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto text-emerald-600 mb-2" />
            <p className="text-sm text-muted-foreground">جاري تحميل مواقيت الصلاة...</p>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="bg-destructive/10 border-destructive/30">
          <CardContent className="p-4">
            <p className="text-sm text-destructive text-center">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full"
              onClick={() => fetchPrayerTimes(selectedCity.city, selectedCity.country)}
            >
              <RefreshCw className="h-4 w-4 ml-2" />
              إعادة المحاولة
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Next Prayer Alert */}
      {!loading && nextPrayer && (
        <Card className="bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-800 dark:text-amber-200 font-medium">
                  الصلاة القادمة: {prayerTimes.find(p => p.name === nextPrayer)?.nameAr}
                </p>
                <p className="text-amber-600 dark:text-amber-300 text-sm">
                  بعد {getTimeUntilNextPrayer()}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className="text-amber-600"
              >
                {notificationsEnabled ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Prayer Times Grid */}
      {!loading && prayerTimes.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground">مواقيت الصلاة</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => fetchPrayerTimes(selectedCity.city, selectedCity.country)}
              >
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {prayerTimes.map((prayer) => (
                <div
                  key={prayer.name}
                  className={`flex items-center justify-between p-3 rounded-xl transition-all ${nextPrayer === prayer.name
                    ? 'bg-emerald-100 dark:bg-emerald-900/50 border-2 border-emerald-500'
                    : 'bg-muted/50'
                    }`}
                >
                  <div className="flex items-center gap-2">
                    <prayer.icon className={`h-5 w-5 ${nextPrayer === prayer.name ? 'text-emerald-600' : 'text-muted-foreground'
                      }`} />
                    <span className={`font-medium ${nextPrayer === prayer.name ? 'text-emerald-700 dark:text-emerald-300' : 'text-foreground'
                      }`}>
                      {prayer.nameAr}
                    </span>
                  </div>
                  <span className={`font-bold ${nextPrayer === prayer.name ? 'text-emerald-600' : 'text-muted-foreground'
                    }`}>
                    {prayer.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daily Verse */}
      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200 dark:border-emerald-800">
        <CardContent className="p-4">
          <h3 className="font-bold text-emerald-800 dark:text-emerald-200 mb-3 flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
          </h3>
          <blockquote className="text-foreground text-lg leading-relaxed mb-2 font-arabic">
            ﴾ إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا ﴿
          </blockquote>
          <p className="text-sm text-muted-foreground">سورة النساء - الآية 103</p>
        </CardContent>
      </Card>

    </div>
  );
};

export default PrayerTimesTab;
