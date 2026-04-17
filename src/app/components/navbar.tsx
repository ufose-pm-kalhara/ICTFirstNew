'use client';
import React, { useState } from 'react';
import Link from 'next/link';

// Updated interface to match page.tsx
interface NavbarProps {
  onScroll: (id: string) => void;
  onNavigate: (view: 'home' | 'faq' | 'privacy' | 'terms') => void;
}

export default function Navbar({ onScroll, onNavigate }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavClick = (id: string) => {
    onScroll(id);
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 z-[100] w-full bg-white/95 backdrop-blur-md border-b border-slate-100 h-20 flex items-center">
      <div className="max-w-7xl mx-auto px-6 w-full flex justify-between items-center">
        {/* Changed onHome to onNavigate('home') */}
        <button 
          onClick={() => onNavigate('home')} 
          className="flex items-center gap-2 cursor-pointer outline-none group"
        >
          <div className="w-10 h-10 bg-[#1A5683] group-hover:bg-red-600 transition-colors rounded-lg flex items-center justify-center font-bold text-white text-xs">ICT</div>
          <span className="font-black text-xl text-slate-900 tracking-tight">FIRST<span className="text-[#1A5683]">.lk</span></span>
        </button>

        <div className="hidden md:flex items-center gap-10 text-sm font-bold text-slate-500 uppercase tracking-widest">
          <button onClick={() => handleNavClick('results')} className="hover:text-[#1A5683] transition-colors cursor-pointer outline-none">Results</button>
          <button onClick={() => handleNavClick('achievers')} className="hover:text-[#1A5683] transition-colors cursor-pointer outline-none">Achievers</button>
          {/* Note: Ensure Section 5 in Hero has id="gallery" for this to work */}
          <button onClick={() => handleNavClick('gallery')} className="hover:text-[#1A5683] transition-colors cursor-pointer outline-none">Gallery</button>
          <Link href="/login" className="px-8 py-2.5 bg-[#1A5683] text-white rounded-xl shadow-lg hover:bg-red-600 transition-all">Login</Link>
        </div>

        <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
          <div className={`w-6 h-0.5 bg-slate-900 mb-1.5 transition-all ${isOpen ? 'rotate-45 translate-y-2' : ''}`}></div>
          <div className={`w-6 h-0.5 bg-slate-900 mb-1.5 ${isOpen ? 'opacity-0' : ''}`}></div>
          <div className={`w-6 h-0.5 bg-slate-900 ml-auto transition-all ${isOpen ? '-rotate-45 -translate-y-2 w-6' : ''}`}></div>
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="absolute top-20 left-0 w-full bg-white border-b border-slate-100 p-6 flex flex-col gap-6 font-bold text-slate-600 md:hidden shadow-xl">
          <button onClick={() => handleNavClick('results')} className="text-left outline-none">Results</button>
          <button onClick={() => handleNavClick('achievers')} className="text-left outline-none">Achievers</button>
          <button onClick={() => handleNavClick('gallery')} className="text-left outline-none">Gallery</button>
          <Link href="/login" className="bg-[#1A5683] text-white p-4 rounded-xl text-center">Login</Link>
        </div>
      )}
    </nav>
  );
}