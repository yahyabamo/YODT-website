import React, { useState } from 'react';
import { StoreLayout } from '@/components/store/StoreLayout';
import { ProductCard } from '@/components/store/ProductCard';
import { CategoryFilter } from '@/components/store/CategoryFilter';
import { useStoreCategories } from '@/hooks/store/useStoreCategories';
import { useStoreProducts } from '@/hooks/store/useStoreProducts';
import { useLanguage } from '@/context/LanguageContext';
import { storeText } from '@/i18n/pages';
import { ShoppingBag } from 'lucide-react';
import { AdSlot } from '@/components/ads/AdSlot';

export default function StorePage() {
  const { language } = useLanguage();
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  const { data: categories, isLoading: isCategoriesLoading } = useStoreCategories();
  const { data: products, isLoading: isProductsLoading } = useStoreProducts(activeCategoryId || undefined);

  return (
    <StoreLayout>
      <div className="max-w-screen-xl mx-auto px-4 py-8 space-y-8">

        {/* Top Ad Slot */}
        <AdSlot page="store" position="top" className="mb-2" />
        
        {/* Hero Section */}
        <div className="bg-primary/10 rounded-3xl p-8 md:p-12 border border-primary/20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--primary) 1px, transparent 0)', backgroundSize: '32px 32px' }} />
          
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/15 text-primary text-sm font-bold mb-4">
              <ShoppingBag size={16} />
              <span>{storeText.hero.eyebrow[language]}</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-foreground mb-4">
              {storeText.hero.title[language]}
            </h1>
            <p className="text-lg text-muted-foreground">
              {storeText.hero.desc[language]}
            </p>
          </div>
        </div>

        {/* Categories */}
        {!isCategoriesLoading && categories && categories.length > 0 && (
          <section>
            <CategoryFilter 
              categories={categories} 
              activeCategoryId={activeCategoryId} 
              onSelectCategory={setActiveCategoryId} 
            />
          </section>
        )}

        {/* Products Grid */}
        <section>
          {isProductsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-card rounded-2xl border border-border/50 aspect-[3/4] animate-pulse" />
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center flex flex-col items-center justify-center bg-secondary/30 rounded-3xl border border-border/50">
              <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mb-4 text-muted-foreground shadow-sm">
                <ShoppingBag size={32} strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                {activeCategoryId ? storeText.noProducts[language] : storeText.noProductsYet[language]}
              </h3>
            </div>
          )}
        </section>

        {/* Bottom Ad Slot */}
        <AdSlot page="store" position="bottom" className="mt-2" />

      </div>
    </StoreLayout>
  );
}
