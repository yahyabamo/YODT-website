import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Navbar } from '../../components/features/home/Navbar';
import { Hero } from '../../components/features/home/Hero';
import { About } from '../../components/features/home/About';
import { Guide } from '../../components/features/home/Guide';
import { Activities } from '../../components/features/home/Activities';
import { Discounts } from '../../components/features/home/Discounts';
import { StorePromo } from '../../components/features/home/StorePromo';
import { Partners } from '../../components/features/home/Partners';
import { FinalCTA } from '../../components/features/home/FinalCTA';
import { Footer } from '../../components/features/home/Footer';
import { AdSlot } from '../../components/ads/AdSlot';

const Index = () => {
  const { language: lang } = useLanguage();
  const [isDark, setIsDark] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  useEffect(() => {
    const handleScroll = () => {
      const nav = document.getElementById('navbar');
      if (nav) {
        if (window.scrollY > 60) {
          nav.style.borderBottomColor = 'var(--border-strong)';
        } else {
          nav.style.borderBottomColor = 'var(--border)';
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [modalOpen]);

  useEffect(() => {
    const counters = document.querySelectorAll('.counter');
    const speed = 200;

    const animateCount = (counter: HTMLElement) => {
      const target = +((counter.dataset.target || counter.innerText) as string);
      if (!counter.dataset.target) counter.dataset.target = counter.innerText;

      const count = +counter.innerText;
      const inc = target / speed;

      if (count < target) {
        counter.innerText = Math.ceil(count + inc).toString();
        setTimeout(() => animateCount(counter), 20);
      } else {
        counter.innerText = target.toString();
      }
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target as HTMLElement;
          if (!el.dataset.animated) {
            el.dataset.animated = 'true';
            animateCount(el);
          }
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(c => observer.observe(c));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen font-display" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* <Navbar
        lang={lang}
        setLang={setLang}
        isDark={isDark}
        toggleTheme={toggleTheme}
        mobileMenuOpen={mobileMenuOpen}
        toggleMobileMenu={toggleMobileMenu}
        closeMobileMenu={closeMobileMenu}
        onOpenModal={openModal}
      /> */}

      <Hero onOpenModal={openModal} />
      <AdSlot page="home" position="top" className="container mx-auto px-6 py-2" heightClass="h-[70px] sm:h-[90px]" />
      <About />
      <Guide />
      <Activities />

      <Discounts />
      <AdSlot page="home" position="after_partners" className="container mx-auto px-6 py-2" heightClass="h-[70px] sm:h-[90px]" />
      <StorePromo />
      <Partners />
      {/* <MotivationalQuote /> */}
      <AdSlot page="home" position="bottom" className="container mx-auto px-6 py-2" heightClass="h-[70px] sm:h-[90px]" />
      <FinalCTA onOpenModal={openModal} />
      {/* <Footer /> */}
    </div>
  );
};

export default Index;