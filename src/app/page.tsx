'use client';

import React, { useState } from 'react';
// Import all major section components
import Navbar from './components/navbar';
import Hero from './components/hero';
import Contact from './components/contact';
import FAQ from './components/faq';
import Privacy from './components/privacy';
import Terms from './components/terms';

// ==========================================
// MAIN APP CONTAINER (PAGE ROUTING)
// ==========================================

export default function Home() {
  /**
   * PAGE STATE: Controls which main component is visible.
   * Default view is 'home'.
   */
  const [currentView, setCurrentView] = useState<'home' | 'faq' | 'privacy' | 'terms'>('home');

  /**
   * NAVIGATION HANDLER: Switches between different full-page views
   * and automatically resets the scroll position to the top.
   */
  const handleNavigate = (view: 'home' | 'faq' | 'privacy' | 'terms') => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * ANCHOR SCROLL LOGIC: Handles internal scrolling to sections (like #results).
   * If the user is on a different page (like FAQ), it switches back to Home 
   * first before performing the scroll.
   */
  const handleScrollToSection = (id: string) => {
    if (currentView !== 'home') {
      setCurrentView('home');
      // Delay ensures the Home component is rendered before searching for the element ID
      setTimeout(() => {
        const element = document.getElementById(id);
        element?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.getElementById(id);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main className="min-h-screen bg-white">
      {/* HEADER: Contains navigation links and scroll triggers */}
      <Navbar 
        onScroll={handleScrollToSection} 
        onHome={() => handleNavigate('home')} 
      />

      {/* CONDITIONAL RENDERING: Swaps content based on currentView state */}
      {currentView === 'home' && <Hero />}
      {currentView === 'faq' && <FAQ />}
      {currentView === 'privacy' && <Privacy />}
      {currentView === 'terms' && <Terms />}

      {/* FOOTER: Provides contact info and legal page links */}
      <Contact onNavigate={handleNavigate} />
    </main>
  );
}