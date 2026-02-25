
import React, { useEffect, useState } from 'react';
import { Navbar } from '../../components/features/home/Navbar';
import { Hero } from '../../components/features/home/Hero';
import { About } from '../../components/features/home/About';
import { Guide } from '../../components/features/home/Guide';
import { Activities } from '../../components/features/home/Activities';
import { Discounts } from '../../components/features/home/Discounts';
import { Partners } from '../../components/features/home/Partners';
// import { Testimonials } from '../../components/features/home/Testimonials';
import { FinalCTA } from '../../components/features/home/FinalCTA';
import { Footer } from '../../components/features/home/Footer';

const Index = () => {
  const [lang, setLang] = useState('ar');
  const [isDark, setIsDark] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Initialize lang and theme on mount
  useEffect(() => {
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('data-lang', lang);
    const btnAr = document.getElementById('btn-ar');
    const btnEn = document.getElementById('btn-en');
    if (btnAr) btnAr.classList.toggle('active', lang === 'ar');
    if (btnEn) btnEn.classList.toggle('active', lang === 'en');
  }, [lang]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
  const closeMobileMenu = () => setMobileMenuOpen(false);
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  // Scroll Listener
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

  // Reveal Animation Observer
  useEffect(() => {
    const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

    // Initial check
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach(el => observer.observe(el));

    // Cleanup
    return () => observer.disconnect();
  }, [modalOpen]); // Re-run if DOM changes significantly, though sections are static.

  // Counter Animation Observer
  useEffect(() => {
    const counters = document.querySelectorAll('.counter');
    const speed = 200;

    const animateCount = (counter: HTMLElement) => {
      const target = +((counter.dataset.target || counter.innerText) as string);
      // If dataset.target is not set, use innerText and store it
      if (!counter.dataset.target) counter.dataset.target = counter.innerText;

      const count = +counter.innerText;
      const inc = target / speed;

      if (count < target) {
        counter.innerText = Math.ceil(count + inc).toString();
        setTimeout(() => animateCount(counter), 20);
      } else {
        counter.innerText = target.toString();
      }
    }

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
      <Navbar
        lang={lang}
        setLang={setLang}
        isDark={isDark}
        toggleTheme={toggleTheme}
        mobileMenuOpen={mobileMenuOpen}
        toggleMobileMenu={toggleMobileMenu}
        closeMobileMenu={closeMobileMenu}
        onOpenModal={openModal}
      />

      <Hero onOpenModal={openModal} />
      <About />
      <Guide />
      <Activities />
      <Discounts />
      <Partners />
      {/* <Testimonials /> */}
      <FinalCTA onOpenModal={openModal} />
      <Footer />

    </div>
  );
};

export default Index;