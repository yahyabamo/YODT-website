import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu, Search, Bell,
  Home, GraduationCap, Stethoscope, Radio, User,
  BookOpen, Briefcase, Map, Users, Building2, Settings, HelpCircle,
  Heart, Calendar, Globe, ChevronLeft, Play, Gift, Sparkles,
  FolderOpen, ChevronDown
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import logo from '@/assets/logo.png';
import { cn } from '@/lib/utils';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { Sun, Moon } from 'lucide-react';

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

interface Project {
  icon: string;
  label: string;
  description: string;
  path: string;
  color: string;
}

// ─── مشاريع الاتحاد — add/edit your real projects here ───bg-emerald-500/15 text-emerald-600
const unionProjects: Project[] = [
  { icon: '✦', label: 'عون', description: 'عون للشباب ', path: '/3wn', color: 'bg-emerald-500/15 text-emerald-600' },
  { icon: '◈', label: 'مفهوم', description: 'المحتوى المرئي ', path: '/home/reels', color: 'bg-amber-500/15 text-amber-600' },
]

const mainSections: MainSection[] = [
  { icon: Home, label: 'الرئيسية', path: '/home', description: 'لوحتك اليومية', color: 'bg-primary/15 text-primary' },
  { icon: Sparkles, label: 'الانشطة', path: '/home/activities', description: 'الأنشطة', color: 'bg-primary/15 text-primary' },
  { icon: Play, label: 'فيديو', path: '/home/reels', description: 'فيديو', color: 'bg-warning/15 text-warning' },
  // { icon: Heart, label: 'الداعمون', path: '/partners', description: 'الداعمون', color: 'bg-primary/15 text-warning' },
];

const quickLinks: QuickLink[] = [
  { icon: Briefcase, label: 'الوظائف', path: '/jobs' },
  { icon: '🎁', label: 'الخصومات', path: '/home/offers' },
  { icon: Map, label: 'الخريطة', path: '/map' },
  { icon: Users, label: 'الكوادر', path: '/corps' },
  { icon: '📱', label: 'تطبيقات تركيا', path: '/turkey-apps' },
  { icon: BookOpen, label: 'القرآن الكريم', path: '/quran-life' },
  { icon: '📋', label: 'دليل الطالب', path: '/guide' },
  { icon: HelpCircle, label: 'الأسئلة الشائعة', path: '/faq' },
];

interface SmartTopBarProps {
  onOpenAI?: () => void;
  onOpenSearch?: () => void;
}

export const SmartTopBar = ({ onOpenAI, onOpenSearch }: SmartTopBarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [projectsExpanded, setProjectsExpanded] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleNavigate = (path: string) => {
    setIsOpen(false);
    setProjectsExpanded(false);
    navigate(path);
  };

  const isActivePath = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const anyProjectActive = unionProjects.some(p => isActivePath(p.path));

  return (
    <header className="flex items-center justify-between gap-3">
      {/* ── Menu Sheet ── */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-xl h-9 w-9 hover:bg-secondary">
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

            <div className="flex-1 overflow-y-auto">
              {/* ── Main Sections ── */}
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
                          active ? "bg-primary/10" : "hover:bg-secondary/80"
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

                  {/* ── مشاريع الاتحاد — accordion item ── */}
                  <div className="rounded-xl overflow-hidden">
                    {/* Trigger row */}
                    <button
                      onClick={() => setProjectsExpanded(!projectsExpanded)}
                      className={cn(
                        "w-full flex items-center gap-3 p-2.5 rounded-xl transition-all",
                        anyProjectActive || projectsExpanded ? "bg-primary/10" : "hover:bg-secondary/80"
                      )}
                    >
                      <div className={cn(
                        "w-9 h-9 rounded-lg flex items-center justify-center",
                        anyProjectActive
                          ? "bg-primary text-primary-foreground"
                          : "bg-primary/15 text-primary"
                      )}>
                        <FolderOpen className="w-4 h-4" />
                      </div>
                      <div className="text-right flex-1">
                        <span className={cn(
                          "block text-sm",
                          anyProjectActive ? "font-semibold text-primary" : "font-medium text-foreground"
                        )}>مشاريع الاتحاد</span>
                        <span className="text-[11px] text-muted-foreground">
                          {unionProjects.length} مشاريع
                        </span>
                      </div>
                      <ChevronDown className={cn(
                        "w-4 h-4 text-muted-foreground transition-transform duration-300",
                        projectsExpanded && "rotate-180"
                      )} />
                    </button>

                    {/* Expandable projects grid */}
                    <div className={cn(
                      "grid transition-all duration-300 ease-in-out",
                      projectsExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    )}>
                      <div className="overflow-hidden">
                        <div className="grid grid-cols-2 gap-2 pt-2 pb-1 px-1">
                          {unionProjects.map((project) => {
                            const active = isActivePath(project.path);
                            return (
                              <button
                                key={project.path}
                                onClick={() => handleNavigate(project.path)}
                                className={cn(
                                  "flex flex-col items-center gap-2 p-3 rounded-xl border transition-all text-center",
                                  active
                                    ? "bg-primary/10 border-primary/30"
                                    : "bg-secondary/40 border-border/40 hover:bg-secondary hover:border-border"
                                )}
                              >
                                <div className={cn(
                                  "w-9 h-9 rounded-lg flex items-center justify-center text-lg",
                                  active ? "bg-primary/15 text-primary" : project.color
                                )}>
                                  {project.icon}
                                </div>
                                <div>
                                  <span className={cn(
                                    "block text-xs font-semibold leading-tight",
                                    active ? "text-primary" : "text-foreground"
                                  )}>{project.label}</span>
                                  <span className="block text-[10px] text-muted-foreground mt-0.5">
                                    {project.description}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* ── end مشاريع الاتحاد ── */}

                </div>
              </div>

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
          </div>
        </SheetContent>
      </Sheet>

      {/* Logo & Title */}
      <button className="flex items-center gap-2 flex-1" onClick={() => navigate('/home')}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center p-1">
          <img src={logo} alt="الاتحاد" className="w-full h-full object-contain" />
        </div>
        <span className="text-h3 text-foreground">الاتحاد</span>
      </button>

      {/* Right Actions */}
      <div className="flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl h-9 w-9 hover:bg-secondary"
          onClick={toggleTheme}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-warning" />
          ) : (
            <Moon className="w-4 h-4 text-primary" />
          )}
        </Button>
        <NotificationBell />
      </div>
    </header>
  );
};