import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, HelpCircle, ArrowLeft } from 'lucide-react';
import { useSuggestionBoxSettings } from '@/hooks/useSuggestionBox';

interface SuggestionBoxesProps {
  /** page_key matching the value in suggestion_box_settings table */
  page: string;
  className?: string;
}

/**
 * Renders the admin-controlled Suggestion and/or Question boxes
 * at the bottom of any page. Add <SuggestionBoxes page="xyz" /> just
 * above <BottomNav />.
 */
export function SuggestionBoxes({ page, className = '' }: SuggestionBoxesProps) {
  const navigate = useNavigate();
  const { data: settings, isLoading } = useSuggestionBoxSettings(page);

  // Nothing visible while loading or if both boxes are disabled
  if (isLoading) return null;
  if (!settings?.suggestion && !settings?.question) return null;

  const handleNavigate = (type: 'suggestion' | 'question') => {
    navigate(`/suggestions?type=${type}&from=${page}`);
  };

  return (
    <div className={`px-4 space-y-3 ${className}`}>
      {/* Section label */}
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider text-center opacity-60">
        تواصل معنا
      </p>

      {/* Suggestion Box */}
      {settings?.suggestion && (
        <button
          onClick={() => handleNavigate('suggestion')}
          className="w-full group flex items-center gap-4 p-4 rounded-2xl border border-primary/20 bg-gradient-to-l from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/20 hover:border-primary/40 transition-all duration-300 text-right shadow-sm hover:shadow-md active:scale-[0.98]"
        >
          {/* Icon */}
          <div className="shrink-0 w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center group-hover:bg-primary/25 transition-colors">
            <MessageSquare className="w-5 h-5 text-primary" />
          </div>

          {/* Text */}
          <div className="flex-1 text-right">
            <p className="text-sm font-bold text-foreground">صندوق الاقتراحات</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              شاركنا اقتراحك أو أبلغنا عن مشكلة
            </p>
          </div>

          {/* Arrow */}
          <ArrowLeft className="w-4 h-4 text-primary opacity-50 group-hover:opacity-100 group-hover:-translate-x-1 transition-all shrink-0" />
        </button>
      )}

      {/* Question Box */}
      {settings?.question && (
        <button
          onClick={() => handleNavigate('question')}
          className="w-full group flex items-center gap-4 p-4 rounded-2xl border border-amber-500/20 bg-gradient-to-l from-amber-500/5 to-amber-500/10 hover:from-amber-500/10 hover:to-amber-500/20 hover:border-amber-500/40 transition-all duration-300 text-right shadow-sm hover:shadow-md active:scale-[0.98]"
        >
          {/* Icon */}
          <div className="shrink-0 w-11 h-11 rounded-xl bg-amber-500/15 flex items-center justify-center group-hover:bg-amber-500/25 transition-colors">
            <HelpCircle className="w-5 h-5 text-amber-600" />
          </div>

          {/* Text */}
          <div className="flex-1 text-right">
            <p className="text-sm font-bold text-foreground">لديك استفسار؟</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              أرسل سؤالك وسنرد عليك في أقرب وقت
            </p>
          </div>

          {/* Arrow */}
          <ArrowLeft className="w-4 h-4 text-amber-600 opacity-50 group-hover:opacity-100 group-hover:-translate-x-1 transition-all shrink-0" />
        </button>
      )}
    </div>
  );
}

export default SuggestionBoxes;
