import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { getField, storeText } from '@/i18n/pages';
import type { StoreProduct } from '@/services/storeService';
import { ShoppingBag } from 'lucide-react';

interface ProductCardProps {
  product: StoreProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const { language } = useLanguage();
  const name = getField(product, 'name', language);
  const categoryName = product.store_categories ? getField(product.store_categories, 'name', language) : '';
  const stockNote = getField(product, 'stock_note', language);
  
  // Format price
  const formattedPrice = new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(product.price);

  const currencyText = storeText.currency[product.currency]?.[language] || product.currency;

  return (
    <Link 
      to={`/store/${product.id}`}
      className="group block bg-card rounded-2xl border border-border/50 overflow-hidden hover:border-primary/50 hover:shadow-lg transition-all duration-300"
    >
      {/* Image Container */}
      <div className="aspect-square bg-secondary/30 relative overflow-hidden">
        {product.thumbnail ? (
          <img 
            src={product.thumbnail} 
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
            <ShoppingBag size={48} strokeWidth={1} />
          </div>
        )}
        
        {/* Badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {product.is_featured && (
            <span className="bg-warning text-warning-foreground text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
              {storeText.featuredProducts[language]}
            </span>
          )}
          {stockNote && (
            <span className="bg-background/90 backdrop-blur text-foreground text-[10px] font-medium px-2 py-1 rounded-full border border-border/50 shadow-sm">
              {stockNote}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="text-xs text-muted-foreground mb-1.5 font-medium">
          {categoryName}
        </div>
        <h3 className="font-bold text-foreground text-sm sm:text-base line-clamp-2 leading-tight group-hover:text-primary transition-colors">
          {name}
        </h3>
        
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-baseline gap-1 text-primary">
            <span className="text-lg font-bold">{formattedPrice}</span>
            <span className="text-xs font-medium">{currencyText}</span>
          </div>
          
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <ShoppingBag size={16} />
          </div>
        </div>
      </div>
    </Link>
  );
}
