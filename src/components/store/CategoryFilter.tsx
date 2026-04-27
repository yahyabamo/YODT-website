import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { getField, storeText } from '@/i18n/pages';
import type { StoreCategory } from '@/services/storeService';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  categories: StoreCategory[];
  activeCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
}

export function CategoryFilter({ categories, activeCategoryId, onSelectCategory }: CategoryFilterProps) {
  const { language } = useLanguage();

  if (!categories || categories.length === 0) return null;

  return (
    <div className="w-full overflow-x-auto pb-4 scrollbar-hide">
      <div className="flex items-center gap-2 min-w-max px-4 sm:px-0">
        <button
          onClick={() => onSelectCategory(null)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border whitespace-nowrap",
            activeCategoryId === null
              ? "bg-primary border-primary text-primary-foreground shadow-sm"
              : "bg-background border-border text-foreground hover:bg-secondary hover:border-primary/30"
          )}
        >
          {storeText.allCategories[language]}
        </button>

        {categories.map((category) => {
          const isActive = activeCategoryId === category.id;
          const name = getField(category, 'name', language);
          
          return (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border whitespace-nowrap flex items-center gap-2",
                isActive
                  ? "bg-primary border-primary text-primary-foreground shadow-sm"
                  : "bg-background border-border text-foreground hover:bg-secondary hover:border-primary/30"
              )}
            >
              {category.icon && <span className="text-base">{category.icon}</span>}
              <span>{name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
