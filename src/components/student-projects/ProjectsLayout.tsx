import React, { useState } from 'react';
import { Navbar } from '@/components/features/home/Navbar';
import { Footer } from '@/components/features/home/Footer';
import { SmartTopBar } from '@/components/layout/SmartTopBar';
import { useProjectsNavigation } from '@/hooks/studentProjects/useProjectsNavigation';

/** Dual-shell layout: SmartTopBar for home users, full Navbar+Footer for public */
export function ProjectsLayout({ children }: { children: React.ReactNode }) {
  const { isFromHome } = useProjectsNavigation();

  if (isFromHome()) {
    return (
      <div className="min-h-screen bg-background font-display" dir={document.documentElement.dir}>
        <div className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border/40 px-4 py-3">
          <SmartTopBar />
        </div>
        <main>{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-display" dir={document.documentElement.dir}>
      <Navbar />
      <main className="pt-0">{children}</main>
      <Footer />
    </div>
  );
}
