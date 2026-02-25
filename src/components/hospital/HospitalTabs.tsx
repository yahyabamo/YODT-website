import { Users, Stethoscope, Calendar, Play } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface HospitalTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const HospitalTabs = ({ activeTab, onTabChange }: HospitalTabsProps) => {
  const tabs = [
    { id: 'community', label: 'مجتمع الأطباء', icon: Users },
    { id: 'doctors', label: 'الأطباء', icon: Stethoscope },
    { id: 'reels', label: 'المحتوى', icon: Play },
    { id: 'congress', label: 'المؤتمر', icon: Calendar }
  ];

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} dir="rtl" className="w-full">
      <TabsList className="w-full grid grid-cols-4 h-14 p-1 bg-muted/50 rounded-xl">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <TabsTrigger 
              key={tab.id}
              value={tab.id}
              className="flex flex-col items-center gap-0.5 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg"
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{tab.label}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
};

export default HospitalTabs;
