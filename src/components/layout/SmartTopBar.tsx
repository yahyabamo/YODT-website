import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu, Search, Bell,
  Home, GraduationCap, Stethoscope, Radio, User,
  BookOpen, Briefcase, Map, Users, Building2, Settings, HelpCircle,
  Heart, Calendar, Globe, ChevronLeft, Play, Gift, Sparkles
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';
import { cn } from '@/lib/utils';
import { NotificationBell } from '@/components/notifications/NotificationBell';


/**
 * Smart Top Bar - Premium Navigation
 * Clean, organized sections with collapsible menu
 */

interface MainSection {
  icon: React.ElementType;
  label: string;
  path: string;
  description: string;
  color: string;
}

interface QuickLink {
  icon: React.ElementType | string;
  label: string;
  path: string;
}

// 5 Core Pillars
const mainSections: MainSection[] = [
  { icon: Home, label: 'الرئيسية', path: '/home', description: 'لوحتك اليومية', color: 'bg-primary/15 text-primary' },
  { icon: Sparkles, label: 'الانشطة', path: '/ِactivities', description: 'الأنشطة', color: 'bg-primary/15 text-primary' },
  // { icon: Stethoscope, label: 'المستشفى', path: '/medical-hub', description: 'أطباء واستشارات', color: 'bg-accent/15 text-accent' },
  // { icon: BookOpen, label: 'القرآن', path: '/quran-life', description: 'تحفيظ وأذكار', color: 'bg-emerald-500/15 text-emerald-600' },
  { icon: Play, label: 'فيديو', path: '/reels', description: 'فيديو ', color: 'bg-warning/15 text-warning' },
];

// Academy & Library 
/*
const academyLinks: QuickLink[] = [
  { icon: GraduationCap, label: 'الأكاديمية', path: '/academy' },
  { icon: BookOpen, label: 'المكتبة', path: '/academy' },
  { icon: '📜', label: 'الشهادات', path: '/certificates' },
];
*/

// Quick services - ALL sections
const quickLinks: QuickLink[] = [
  { icon: Briefcase, label: 'الوظائف', path: '/jobs' },
  { icon: Heart, label: 'الداعمون', path: '/partners' },
  { icon: '🎁', label: 'الخصومات', path: '/discounts' },
  { icon: Calendar, label: 'الفعاليات', path: '/events' },
  { icon: Map, label: 'الخريطة', path: '/map' },
  { icon: Globe, label: 'الترجمة', path: '/translate' },
  { icon: Users, label: 'الكوادر', path: '/corps' },
  { icon: Building2, label: 'المجتمع', path: '/community' },
  // { icon: '📺', label: 'المحتوى البصري', path: '/visual-content' },
  // { icon: '🎬', label: 'الريلز', path: '/yemen-reels' },
  // { icon: '📰', label: 'الأخبار', path: '/news' },
  { icon: '📱', label: 'تطبيقات تركيا', path: '/turkey-apps' },
  { icon: '🤝', label: 'التطوع', path: '/volunteers' },
  { icon: '📋', label: 'دليل الطالب', path: '/guide' },
  { icon: '📊', label: 'الشفافية', path: '/transparency' },
  { icon: '💡', label: 'الاقتراحات', path: '/suggestions' },
  { icon: HelpCircle, label: 'الأسئلة', path: '/faq' },
  { icon: Settings, label: 'حسابي', path: '/profile' },
];

interface SmartTopBarProps {
  onOpenAI?: () => void;
  onOpenSearch?: () => void;
}

export const SmartTopBar = ({ onOpenAI, onOpenSearch }: SmartTopBarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigate = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <header className="flex items-center justify-between gap-3">
      {/* Menu Button */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl h-9 w-9 hover:bg-secondary"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px] p-0 overflow-hidden border-l-0">
          <SheetHeader className="sr-only">
            <SheetTitle>القائمة الرئيسية</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col h-full bg-background">
            {/* Header */}
            <div className="p-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center p-2">
                  <img src={logo} alt="الاتحاد" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h2 className="text-h3 text-foreground">اتحاد الطلاب</h2>
                  <p className="text-xs text-muted-foreground">إسطنبول - تركيا</p>
                </div>
              </div>
            </div>

            {/* Main Sections */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-3">
                <p className="text-xs text-muted-foreground mb-2 px-2 font-medium">الأقسام الرئيسية</p>
                <div className="space-y-0.5">
                  {mainSections.map((section) => {
                    const Icon = section.icon;
                    const active = isActivePath(section.path);
                    return (
                      <button
                        key={section.path}
                        onClick={() => handleNavigate(section.path)}
                        className={cn(
                          "w-full flex items-center gap-3 p-2.5 rounded-xl transition-all",
                          active
                            ? "bg-primary/10"
                            : "hover:bg-secondary/80"
                        )}
                      >
                        <div className={cn(
                          "w-9 h-9 rounded-lg flex items-center justify-center",
                          active ? "bg-primary text-primary-foreground" : section.color
                        )}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="text-right flex-1">
                          <span className={cn(
                            "block text-sm",
                            active ? "font-semibold text-primary" : "font-medium text-foreground"
                          )}>{section.label}</span>
                          <span className="text-[11px] text-muted-foreground">{section.description}</span>
                        </div>
                        <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-border/50 mx-4 my-1" />

              {/* Academy & Library Links
              <div className="p-3">
                <p className="text-xs text-muted-foreground mb-2 px-2 font-medium">الأكاديمية والمكتبة</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {academyLinks.map((item) => {
                    const Icon = typeof item.icon === 'string' ? null : item.icon;
                    const active = isActivePath(item.path);
                    return (
                      <button
                        key={item.label}
                        onClick={() => handleNavigate(item.path)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-colors",
                          active ? "bg-primary/10" : "hover:bg-secondary/80"
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center",
                          active ? "bg-primary/15" : "bg-secondary"
                        )}>
                          {Icon ? (
                            <Icon className={cn("w-4 h-4", active ? "text-primary" : "text-muted-foreground")} />
                          ) : (
                            <span className="text-sm">{String(item.icon)}</span>
                          )}
                        </div>
                        <span className={cn(
                          "text-[10px]",
                          active ? "font-medium text-primary" : "text-foreground"
                        )}>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div> */}

              {/* Divider */}
              <div className="h-px bg-border/50 mx-4 my-1" />

              {/* Quick Links Grid */}
              <div className="p-3">
                <p className="text-xs text-muted-foreground mb-2 px-2 font-medium">خدمات وأدوات</p>
                <div className="grid grid-cols-3 gap-1.5 max-h-[200px] overflow-y-auto">
                  {quickLinks.map((item, index) => {
                    const Icon = typeof item.icon === 'string' ? null : item.icon;
                    const active = isActivePath(item.path);
                    return (
                      <button
                        key={`${item.path}-${index}`}
                        onClick={() => handleNavigate(item.path)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-colors",
                          active ? "bg-primary/10" : "hover:bg-secondary/80"
                        )}
                      >
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center",
                          active ? "bg-primary/15" : "bg-secondary"
                        )}>
                          {Icon ? (
                            <Icon className={cn("w-4 h-4", active ? "text-primary" : "text-muted-foreground")} />
                          ) : (
                            <span className="text-sm">{String(item.icon)}</span>
                          )}
                        </div>
                        <span className={cn(
                          "text-[10px]",
                          active ? "font-medium text-primary" : "text-foreground"
                        )}>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Profile Quick Access */}
              <div className="p-3 pt-0">
                <button
                  onClick={() => handleNavigate('/profile')}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-right flex-1">
                    <span className="block text-sm font-medium text-foreground">حسابي</span>
                    <span className="text-[11px] text-muted-foreground">الملف والإعدادات</span>
                  </div>
                  <ChevronLeft className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-border/50 bg-secondary/30">
              <p className="text-[10px] text-center text-muted-foreground">
                اتحاد الطلاب اليمنيين في تركيا © 2025
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Logo & Title */}
      <button
        className="flex items-center gap-2 flex-1"
        onClick={() => navigate('/home')}
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center p-1">
          <img src={logo} alt="الاتحاد" className="w-full h-full object-contain" />
        </div>
        <span className="text-h3 text-foreground">الاتحاد</span>
      </button>

      {/* Right Actions */}
      <div className="flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl h-9 w-9 hover:bg-secondary"
          onClick={onOpenSearch}
        >
          <Search className="w-4 h-4 text-muted-foreground" />
        </Button>
        <NotificationBell />
      </div>
    </header>
  );
};
