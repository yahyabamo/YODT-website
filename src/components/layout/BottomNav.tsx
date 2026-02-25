import { Home, Sparkles, Gift, Play, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

/**
 * Bottom Navigation
 * Premium iOS-style navigation with smooth animations
 */

const navItems = [
  {
    icon: Home,
    label: 'الرئيسية',
    path: '/home',
    activePaths: ['/home'],
    exact: true
  },
  {
    icon: Sparkles,
    label: 'الأنشطة',
    path: '/home/activities',
    activePaths: ['/home/activities']
  },
  {
    icon: Gift,
    label: 'العروض',
    path: '/home/offers',
    activePaths: ['/home/offers']
  },
  {
    icon: Play,
    label: 'الريلز',
    path: '/home/reels',
    activePaths: ['/home/reels']
  },
  // { 
  //   icon: GraduationCap, 
  //   label: 'الجامعة', 
  //   path: '/university',
  //   activePaths: ['/university', '/academy', '/certificates', '/academy-old']
  // },
  // { 
  //   icon: Stethoscope, 
  //   label: 'المستشفى', 
  //   path: '/medical-hub',
  //   activePaths: ['/medical-hub', '/doctors-directory', '/doctor', '/consultation', '/medical-community', '/medical-congress', '/doctors']
  // },
  // {
  //   icon: Radio,
  //   label: 'الإعلام',
  //   path: '/orbit',
  //   activePaths: ['/orbit', '/orbit/brief', '/orbit/podium', '/news', '/yemen-reels', '/visual-content', '/videos']
  // },
  {
    icon: User,
    label: 'حسابي',
    path: '/profile',
    activePaths: ['/profile', '/activities', '/points', '/certificates', '/notes']
  },
];

export const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) {
      return location.pathname === item.path;
    }
    return item.activePaths.some(path => location.pathname.startsWith(path));
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/98 backdrop-blur-xl border-t border-border/40 z-50 bottom-safe shadow-[0_-4px_20px_hsl(var(--foreground)/0.05)]">
      <div className="flex items-center justify-around py-2 px-3 max-w-lg mx-auto">
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center gap-1 py-2 px-4 rounded-2xl transition-all duration-300 min-w-[60px]",
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground active:scale-95"
              )}
            >
              <div className={cn(
                "relative p-2 rounded-xl transition-all duration-300",
                active && "bg-primary/12"
              )}>
                <item.icon
                  className={cn(
                    "h-5 w-5 transition-all duration-300",
                    active && "scale-110"
                  )}
                  strokeWidth={active ? 2.5 : 2}
                />
                {active && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </div>
              <span className={cn(
                "text-[11px] font-medium transition-all",
                active && "font-bold text-primary"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
