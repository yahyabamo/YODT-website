import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";

interface PrayerAlertBannerProps {
  prayerName: string;
  onDismiss: () => void;
}

const PrayerAlertBanner = ({ prayerName, onDismiss }: PrayerAlertBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto dismiss after 30 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      onDismiss();
    }, 30000);

    // Vibrate if supported
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200]);
    }

    return () => clearTimeout(timer);
  }, [onDismiss]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 animate-slide-down">
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-lg">حان الآن وقت صلاة {prayerName}</p>
              <p className="text-sm text-emerald-100">حيّ على الصلاة 🕌</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              onDismiss();
            }}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrayerAlertBanner;
