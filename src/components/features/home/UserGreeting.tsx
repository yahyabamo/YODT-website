import { useState, useEffect } from 'react';
import { Settings, User, Sparkles, Edit3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { currentStudent } from '@/data/mockData';

const greetings = [
  { time: 'morning', text: 'صباح الخير' },
  { time: 'afternoon', text: 'مساء النور' },
  { time: 'evening', text: 'مساء الورد' },
];

const motivationalTitles = [
  'البطل',
  'المميز',
  'النجم',
  'المبدع',
  'القائد',
  'الطموح',
];

export const UserGreeting = () => {
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('مرحباً');
  const [title, setTitle] = useState('');
  const [customName, setCustomName] = useState<string | null>(null);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting('صباح الخير');
    } else if (hour >= 12 && hour < 17) {
      setGreeting('مساء النور');
    } else {
      setGreeting('مساء الورد');
    }

    // Get random motivational title
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    setTitle(motivationalTitles[dayOfYear % motivationalTitles.length]);

    // Check for custom name
    const savedName = localStorage.getItem('customDisplayName');
    if (savedName) {
      setCustomName(savedName);
    }
  }, []);

  const displayName = customName || currentStudent.name;

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-muted-foreground text-base">{greeting}</span>
          <span className="text-lg">👋</span>
        </div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-foreground">
            {displayName}
          </h1>
          <span className="text-xs bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            {title}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          نتمنى لك يوماً مليئاً بالإنجازات ✨
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/admin')}
          className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
        >
          <Settings className="h-5 w-5 text-muted-foreground" />
        </button>
        <button
          onClick={() => navigate('/profile')}
          className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center hover:from-primary/30 hover:to-primary/20 transition-colors border border-primary/20"
        >
          <User className="h-5 w-5 text-primary" />
        </button>
      </div>
    </div>
  );
};
