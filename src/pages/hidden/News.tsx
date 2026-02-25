import { useState, useEffect } from 'react';
import { ChevronRight, Calendar, Banknote, Clock, Sun, AlertCircle, TrendingUp, Moon, Sunrise, Sunset } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BottomNav } from '@/components/layout/BottomNav';
import { PageHeader } from '@/components/layout/PageHeader';

// Prayer times calculation (simplified - would need proper API in production)
const getPrayerTimes = () => {
  // These are approximate times for Istanbul - January
  return {
    fajr: '06:45',
    sunrise: '08:15',
    dhuhr: '13:10',
    asr: '15:45',
    maghrib: '17:30',
    isha: '19:05',
  };
};

// Hijri date calculation (simplified)
const getHijriDate = () => {
  const today = new Date();
  // Approximate conversion - would need proper library in production
  const hijriYear = 1446;
  const hijriMonths = ['محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'];
  const hijriMonth = hijriMonths[5]; // Jumada al-Akhirah
  const hijriDay = 4;
  return `${hijriDay} ${hijriMonth} ${hijriYear}`;
};

const spiritualQuotes = [
  { text: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا', source: 'سورة الشرح' },
  { text: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ', source: 'سورة الطلاق' },
  { text: 'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي', source: 'سورة طه' },
  { text: 'فَاذْكُرُونِي أَذْكُرْكُمْ', source: 'سورة البقرة' },
  { text: 'وَقُل رَّبِّ زِدْنِي عِلْمًا', source: 'سورة طه' },
];

const News = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const prayerTimes = getPrayerTimes();
  const hijriDate = getHijriDate();
  const todayQuote = spiritualQuotes[new Date().getDay() % spiritualQuotes.length];

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getNextPrayer = () => {
    const now = currentTime.getHours() * 60 + currentTime.getMinutes();
    const prayers = [
      { name: 'الفجر', time: prayerTimes.fajr },
      { name: 'الظهر', time: prayerTimes.dhuhr },
      { name: 'العصر', time: prayerTimes.asr },
      { name: 'المغرب', time: prayerTimes.maghrib },
      { name: 'العشاء', time: prayerTimes.isha },
    ];

    for (const prayer of prayers) {
      const [hours, minutes] = prayer.time.split(':').map(Number);
      const prayerMinutes = hours * 60 + minutes;
      if (prayerMinutes > now) {
        return prayer;
      }
    }
    return prayers[0]; // Next day's Fajr
  };

  const nextPrayer = getNextPrayer();

  const holidays = [
    { date: '1 يناير', name: 'رأس السنة الميلادية', isUpcoming: false },
    { date: '23 أبريل', name: 'عيد السيادة الوطنية وعيد الطفل', isUpcoming: true },
    { date: '1 مايو', name: 'عيد العمال', isUpcoming: true },
    { date: '19 مايو', name: 'عيد الشباب والرياضة', isUpcoming: true },
    { date: '30 مارس - 1 أبريل', name: 'عيد الفطر (تقريبي)', isUpcoming: true },
    { date: '6-9 يونيو', name: 'عيد الأضحى (تقريبي)', isUpcoming: true },
    { date: '15 يوليو', name: 'يوم الديمقراطية والحرية', isUpcoming: true },
    { date: '30 أغسطس', name: 'يوم النصر', isUpcoming: true },
    { date: '29 أكتوبر', name: 'يوم الجمهورية', isUpcoming: true },
  ];

  const currencyRates = [
    { currency: 'USD', rate: '34.50', change: '+0.15', isUp: true },
    { currency: 'EUR', rate: '37.20', change: '-0.08', isUp: false },
    { currency: 'YER', rate: '0.138', change: '+0.002', isUp: true },
    { currency: 'SAR', rate: '9.20', change: '+0.03', isUp: true },
  ];

  const news = [
    {
      id: 1,
      title: 'تحديث قوانين إقامة الطلاب 2025',
      summary: 'صدرت تعديلات جديدة على قوانين إقامة الطلاب الأجانب في تركيا',
      date: '2025-01-10',
      category: 'إقامة',
      isImportant: true,
    },
    {
      id: 2,
      title: 'موعد التسجيل الجامعي للفصل القادم',
      summary: 'تم الإعلان عن مواعيد التسجيل للفصل الدراسي الثاني',
      date: '2025-01-08',
      category: 'تعليم',
      isImportant: false,
    },
    {
      id: 3,
      title: 'زيادة أسعار المواصلات العامة',
      summary: 'اعتبارًا من فبراير ستزيد أسعار المواصلات بنسبة 10%',
      date: '2025-01-05',
      category: 'خدمات',
      isImportant: true,
    },
    {
      id: 4,
      title: 'منح دراسية جديدة للطلاب اليمنيين',
      summary: 'أعلنت مؤسسة التعليم الدولي عن منح جديدة',
      date: '2025-01-03',
      category: 'منح',
      isImportant: false,
    },
  ];

  const taxInfo = [
    { title: 'ضريبة الدخل', rate: '15% - 40%', description: 'حسب شريحة الدخل' },
    { title: 'ضريبة القيمة المضافة (KDV)', rate: '1% - 20%', description: 'حسب نوع المنتج' },
    { title: 'الضمان الاجتماعي (SGK)', rate: '14%', description: 'من راتب الموظف' },
  ];

  const alerts = [
    { type: 'دراسة', text: 'التسجيل للفصل الثاني ينتهي 15 يناير', urgent: true },
    { type: 'إقامة', text: 'تجديد الإقامات متاح عبر e-Devlet', urgent: false },
    { type: 'تكس', text: 'الموعد النهائي للإقرار الضريبي: 31 مارس', urgent: false },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <PageHeader title="الأخبار اليومية" showBack />

      <div className="p-4 max-w-lg mx-auto space-y-4">
        {/* Date & Time Card */}
        <Card className="border-0 shadow-soft bg-gradient-to-br from-primary/5 via-background to-primary/10 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">التاريخ الهجري</p>
                <p className="text-lg font-bold text-primary">{hijriDate}</p>
              </div>
              <div className="text-left">
                <p className="text-xs text-muted-foreground mb-1">التاريخ الميلادي</p>
                <p className="text-lg font-semibold text-foreground">
                  {currentTime.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
            
            {/* Spiritual Quote */}
            <div className="bg-background/60 rounded-xl p-3 text-center border border-primary/10">
              <p className="text-foreground font-arabic text-lg mb-1">"{todayQuote.text}"</p>
              <p className="text-xs text-muted-foreground">{todayQuote.source}</p>
            </div>
          </CardContent>
        </Card>

        {/* Prayer Times */}
        <Card className="border-0 shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Moon className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-foreground">مواقيت الصلاة</h2>
              <span className="text-xs text-muted-foreground mr-auto">إسطنبول</span>
            </div>

            {/* Next Prayer Highlight */}
            <div className="bg-primary/10 rounded-xl p-3 mb-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">الصلاة القادمة</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-bold text-primary">{nextPrayer.name}</span>
                <span className="text-lg text-foreground">{nextPrayer.time}</span>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2 text-center">
              <div className="space-y-1">
                <Sunrise className="w-4 h-4 mx-auto text-amber-500" />
                <p className="text-xs text-muted-foreground">الفجر</p>
                <p className="text-sm font-semibold">{prayerTimes.fajr}</p>
              </div>
              <div className="space-y-1">
                <Sun className="w-4 h-4 mx-auto text-amber-500" />
                <p className="text-xs text-muted-foreground">الظهر</p>
                <p className="text-sm font-semibold">{prayerTimes.dhuhr}</p>
              </div>
              <div className="space-y-1">
                <Sun className="w-4 h-4 mx-auto text-orange-500" />
                <p className="text-xs text-muted-foreground">العصر</p>
                <p className="text-sm font-semibold">{prayerTimes.asr}</p>
              </div>
              <div className="space-y-1">
                <Sunset className="w-4 h-4 mx-auto text-rose-500" />
                <p className="text-xs text-muted-foreground">المغرب</p>
                <p className="text-sm font-semibold">{prayerTimes.maghrib}</p>
              </div>
              <div className="space-y-1">
                <Moon className="w-4 h-4 mx-auto text-indigo-500" />
                <p className="text-xs text-muted-foreground">العشاء</p>
                <p className="text-sm font-semibold">{prayerTimes.isha}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="space-y-2">
            {alerts.map((alert, index) => (
              <Card key={index} className={`border-0 shadow-soft ${alert.urgent ? 'bg-rose-50 dark:bg-rose-950/20' : 'bg-amber-50 dark:bg-amber-950/20'}`}>
                <CardContent className="p-3 flex items-center gap-3">
                  <AlertCircle className={`w-4 h-4 flex-shrink-0 ${alert.urgent ? 'text-rose-500' : 'text-amber-500'}`} />
                  <div className="flex-1">
                    <Badge variant={alert.urgent ? 'destructive' : 'secondary'} className="text-xs mb-1">
                      {alert.type}
                    </Badge>
                    <p className="text-sm text-foreground">{alert.text}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Currency Rates */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="font-semibold text-foreground">أسعار الصرف</h2>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {currencyRates.map((rate) => (
              <Card key={rate.currency} className="border-0 shadow-soft">
                <CardContent className="p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">{rate.currency}/TRY</p>
                  <p className="font-bold text-foreground">{rate.rate}</p>
                  <p className={`text-xs ${rate.isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {rate.change}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Important News */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-rose-500" />
            <h2 className="font-semibold text-foreground">آخر الأخبار</h2>
          </div>
          <div className="space-y-3">
            {news.map((item) => (
              <Card key={item.id} className="border-0 shadow-soft">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={item.isImportant ? 'destructive' : 'secondary'} className="text-xs">
                          {item.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{item.date}</span>
                      </div>
                      <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.summary}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Holidays */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-5 h-5 text-amber-500" />
            <h2 className="font-semibold text-foreground">العطل الرسمية 2025</h2>
          </div>
          <Card className="border-0 shadow-soft">
            <CardContent className="p-4">
              <div className="space-y-3">
                {holidays.map((holiday, index) => (
                  <div 
                    key={index}
                    className={`flex items-center justify-between py-2 ${
                      index !== holidays.length - 1 ? 'border-b border-border' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${holiday.isUpcoming ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
                      <span className="text-sm font-medium text-foreground">{holiday.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{holiday.date}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tax Info */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Banknote className="w-5 h-5 text-emerald-500" />
            <h2 className="font-semibold text-foreground">معلومات الضرائب</h2>
          </div>
          <div className="space-y-2">
            {taxInfo.map((tax, index) => (
              <Card key={index} className="border-0 shadow-soft">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-foreground">{tax.title}</h3>
                    <p className="text-xs text-muted-foreground">{tax.description}</p>
                  </div>
                  <Badge variant="outline" className="text-primary font-bold">
                    {tax.rate}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-5 h-5 text-sky-500" />
            <h2 className="font-semibold text-foreground">روابط مفيدة</h2>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'e-Devlet', desc: 'الخدمات الحكومية' },
              { label: 'YÖK', desc: 'التعليم العالي' },
              { label: 'SGK', desc: 'الضمان الاجتماعي' },
              { label: 'İBB', desc: 'بلدية إسطنبول' },
            ].map((link) => (
              <Card key={link.label} className="border-0 shadow-soft cursor-pointer hover:shadow-card transition-shadow">
                <CardContent className="p-3 text-center">
                  <p className="font-semibold text-foreground">{link.label}</p>
                  <p className="text-xs text-muted-foreground">{link.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default News;
