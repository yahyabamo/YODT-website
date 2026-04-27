import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { StoreLayout } from '@/components/store/StoreLayout';
import { OrderForm } from '@/components/store/OrderForm';
import { OrderSuccessModal } from '@/components/store/OrderSuccessModal';
import { useStoreProduct } from '@/hooks/store/useStoreProduct';
import { useStoreNavigation } from '@/hooks/store/useStoreNavigation';
import { useLanguage } from '@/context/LanguageContext';
import { getField, storeText } from '@/i18n/pages';
import { ArrowLeft, ArrowRight, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StoreProductPage() {
  const { productId } = useParams();
  const { language } = useLanguage();
  const { goBackToStore } = useStoreNavigation();
  
  const { data: product, isLoading } = useStoreProduct(productId);
  
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  if (isLoading) {
    return (
      <StoreLayout>
        <div className="max-w-screen-xl mx-auto px-4 py-8">
          <div className="animate-pulse flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/2 aspect-square bg-secondary rounded-3xl" />
            <div className="w-full md:w-1/2 space-y-4 pt-4">
              <div className="h-8 bg-secondary rounded w-3/4" />
              <div className="h-4 bg-secondary rounded w-1/4" />
              <div className="h-24 bg-secondary rounded w-full mt-8" />
              <div className="h-12 bg-secondary rounded w-full mt-8" />
            </div>
          </div>
        </div>
      </StoreLayout>
    );
  }

  if (!product) {
    return (
      <StoreLayout>
        <div className="py-20 text-center">
          <p className="text-muted-foreground mb-4">المنتج غير موجود</p>
          <button onClick={goBackToStore} className="text-primary hover:underline">
            {storeText.backToStore[language]}
          </button>
        </div>
      </StoreLayout>
    );
  }

  const name = getField(product, 'name', language);
  const description = getField(product, 'description', language);
  const categoryName = product.store_categories ? getField(product.store_categories, 'name', language) : '';
  const stockNote = getField(product, 'stock_note', language);
  
  const formattedPrice = new Intl.NumberFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(product.price);
  
  const currencyText = storeText.currency[product.currency]?.[language] || product.currency;

  const allImages = [product.thumbnail, ...(product.images || [])].filter(Boolean) as string[];

  return (
    <StoreLayout>
      <div className="max-w-screen-xl mx-auto px-4 py-6 md:py-10">
        
        {/* Back Button */}
        <button 
          onClick={goBackToStore}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 md:mb-10 transition-colors"
        >
          {language === 'ar' ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
          <span className="font-medium">{storeText.backToStore[language]}</span>
        </button>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* Images Section */}
          <div className="w-full lg:w-1/2 space-y-4">
            <div className="aspect-square bg-secondary/30 rounded-3xl overflow-hidden border border-border/50 relative">
              {allImages.length > 0 ? (
                <img 
                  src={allImages[activeImageIndex]} 
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                  <ShoppingBag size={64} strokeWidth={1} />
                </div>
              )}
              
              {product.is_featured && (
                <div className="absolute top-4 right-4 bg-warning text-warning-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                  {storeText.featuredProducts[language]}
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {allImages.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={cn(
                      "w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all",
                      activeImageIndex === idx 
                        ? "border-primary shadow-md" 
                        : "border-transparent opacity-70 hover:opacity-100"
                    )}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info & Order Form */}
          <div className="w-full lg:w-1/2">
            <div className="mb-8">
              <div className="text-sm text-primary font-medium mb-2">
                {categoryName}
              </div>
              <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-4 leading-tight">
                {name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-baseline gap-1 text-primary bg-primary/5 px-4 py-2 rounded-2xl border border-primary/10">
                  <span className="text-2xl font-black">{formattedPrice}</span>
                  <span className="text-sm font-bold">{currencyText}</span>
                </div>
                
                {stockNote && (
                  <div className="bg-secondary text-foreground text-sm font-medium px-4 py-2 rounded-2xl border border-border">
                    {stockNote}
                  </div>
                )}
              </div>

              {description && (
                <div className="prose prose-sm md:prose-base dark:prose-invert text-muted-foreground max-w-none">
                  {description.split('\n').map((line, i) => (
                    <p key={i} className="mb-2">{line}</p>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-sm">
              <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                <ShoppingBag size={20} className="text-primary" />
                {storeText.orderForm.title[language]}
              </h3>
              
              <OrderForm 
                product={product} 
                onSuccess={() => setShowSuccessModal(true)} 
              />
            </div>
          </div>
        </div>
      </div>

      <OrderSuccessModal 
        isOpen={showSuccessModal} 
        onClose={() => setShowSuccessModal(false)}
        onBackToStore={() => {
          setShowSuccessModal(false);
          goBackToStore();
        }}
      />
    </StoreLayout>
  );
}
