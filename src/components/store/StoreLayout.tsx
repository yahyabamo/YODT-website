import React from 'react';
import { Navbar } from '@/components/features/home/Navbar';
import { Footer } from '@/components/features/home/Footer';
import { SmartTopBar } from '@/components/layout/SmartTopBar';
import { useStoreNavigation } from '@/hooks/store/useStoreNavigation';

export function StoreLayout({ children }: { children: React.ReactNode }) {
  const { isFromHome } = useStoreNavigation();

  if (isFromHome()) {
    // Authenticated flow — mirror the /home page shell
    return (
      <div className="min-h-screen bg-background font-display" dir={document.documentElement.dir}>
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border/40 px-4 py-3">
          <SmartTopBar />
        </div>
        <main>{children}</main>
      </div>
    );
  }

  // Guest flow — full public layout
  return (
    <div className="min-h-screen font-display" dir={document.documentElement.dir}>
      <Navbar />
      <main className="pt-20"> {/* Add padding for fixed navbar */}
        {children}
      </main>
      <Footer />
    </div>
  );
}
