import { useNavigate } from "react-router-dom";
import { Newspaper, MessageSquare, Moon, Wifi } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/layout/PageHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { useState } from "react";

const Orbit = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(true);
  const [dataSaver, setDataSaver] = useState(false);

  const modes = [
    {
      id: "brief",
      title: "الموجز",
      subtitle: "الأخبار السريعة",
      description: "حقائق مختصرة من مصادر موثوقة",
      icon: Newspaper,
      path: "/orbit/brief",
      gradient: "from-blue-600 to-cyan-500",
    },
    {
      id: "podium",
      title: "المنصة",
      subtitle: "التحليل والرأي",
      description: "آراء معمقة من خبراء ومحللين",
      icon: MessageSquare,
      path: "/orbit/podium",
      gradient: "from-amber-600 to-orange-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 pb-24">
      <PageHeader title="المدار - ما يدور حول اليمن" />

      <div className="p-4 space-y-6">
        {/* Philosophy Banner */}
        <div className="text-center py-6 border-b border-gray-800">
          <p className="text-lg text-gray-400 font-serif italic">
            "معلومات، لا ضوضاء"
          </p>
          <p className="text-sm text-gray-500 mt-2">
            نصفّي لك الفوضى الإعلامية إلى تدفق عالي القيمة
          </p>
        </div>

        {/* Mode Selection */}
        <div className="grid gap-4">
          {modes.map((mode) => (
            <Card
              key={mode.id}
              className="bg-gray-900 border-gray-800 cursor-pointer hover:border-gray-700 transition-all overflow-hidden"
              onClick={() => navigate(mode.path)}
            >
              <CardContent className="p-0">
                <div className="flex items-center">
                  <div className={`p-6 bg-gradient-to-br ${mode.gradient}`}>
                    <mode.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="p-4 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-white">
                        {mode.title}
                      </h3>
                      <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
                        {mode.subtitle}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      {mode.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Settings */}
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4 space-y-4">
            <h4 className="text-sm font-medium text-gray-400 mb-3">الإعدادات</h4>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon className="h-5 w-5 text-gray-500" />
                <Label htmlFor="dark-mode" className="text-gray-300">
                  الوضع الليلي
                </Label>
              </div>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wifi className="h-5 w-5 text-gray-500" />
                <div>
                  <Label htmlFor="data-saver" className="text-gray-300">
                    توفير البيانات
                  </Label>
                  <p className="text-xs text-gray-500">
                    تعطيل التشغيل التلقائي للفيديو
                  </p>
                </div>
              </div>
              <Switch
                id="data-saver"
                checked={dataSaver}
                onCheckedChange={setDataSaver}
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-gray-900 border-gray-800 text-center p-4">
            <div className="text-2xl font-bold text-white">12</div>
            <div className="text-xs text-gray-500">مصدر موثوق</div>
          </Card>
          <Card className="bg-gray-900 border-gray-800 text-center p-4">
            <div className="text-2xl font-bold text-white">48</div>
            <div className="text-xs text-gray-500">خبر اليوم</div>
          </Card>
          <Card className="bg-gray-900 border-gray-800 text-center p-4">
            <div className="text-2xl font-bold text-white">8</div>
            <div className="text-xs text-gray-500">محلل ورأي</div>
          </Card>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Orbit;
