'use client';

import React, { useState } from 'react';
import Navbar from './components/navbar';
import Hero from './components/hero';
import Contact from './components/contact';
import FAQ from './components/faq';
import Privacy from './components/privacy';
import Terms from './components/terms';


export default function Home() {
  const [currentView, setCurrentView] = useState<'home' | 'faq' | 'privacy' | 'terms'>('home');

  const handleNavigate = (view: 'home' | 'faq' | 'privacy' | 'terms') => {
    setCurrentView(view);
    // Use a small timeout to ensure the DOM has switched before scrolling to top
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 10);
  };

  const handleScrollToSection = (id: string) => {
    if (currentView !== 'home') {
      setCurrentView('home');
      // Delay to allow 'home' (Hero) to mount before searching for ID
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150); 
    } else {
      const element = document.getElementById(id);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <Navbar 
        onScroll={handleScrollToSection} 
        onNavigate={handleNavigate} 
      />

      {currentView === 'home' && (
        <Hero 
          onScroll={handleScrollToSection} 
          onNavigate={handleNavigate} 
        />
      )}
      
      {currentView === 'faq' && <FAQ />}
      {currentView === 'privacy' && <Privacy />}
      {currentView === 'terms' && <Terms />}

      {/* Ensuring Contact/Footer can also trigger page changes */}
      <Contact onNavigate={handleNavigate} />
    </main>
  );
}