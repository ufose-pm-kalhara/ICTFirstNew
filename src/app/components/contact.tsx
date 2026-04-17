'use client';
import React from 'react';

interface ContactProps {
  onNavigate: (view: 'home' | 'faq' | 'privacy' | 'terms') => void;
}

export default function Contact({ onNavigate }: ContactProps) {
  return (
    <footer className="w-full py-16 bg-white border-t border-slate-100 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 mb-12">
          <div>
            <h3 className="text-2xl font-black text-slate-900 italic">Dinushika <span className="text-[#1A5683]">Kalugampitiya</span></h3>
            <p className="text-slate-400 text-xs mt-2 font-medium max-w-xs uppercase tracking-wider">Empowering students through expert-led ICT education.</p>
          </div>
          
          <div className="flex flex-wrap gap-8 text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">
            <button onClick={() => onNavigate('faq')} className="hover:text-red-600 transition-colors cursor-pointer outline-none">FAQ</button>
            <button onClick={() => onNavigate('privacy')} className="hover:text-red-600 transition-colors cursor-pointer outline-none">Privacy Policy</button>
            <button onClick={() => onNavigate('terms')} className="hover:text-red-600 transition-colors cursor-pointer outline-none">Terms of Service</button>
            <button onClick={() => window.scrollTo({top:0, behavior:'smooth'})} className="hover:text-red-600 transition-colors cursor-pointer outline-none">Back to Top</button>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] text-center md:text-left">
            © 2026 ICT FIRST.lk — ALL RIGHTS RESERVED BY MRS. DINUSHIKA KALUGAMPITIYA
          </p>
          <div className="flex gap-4">
            <span className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-lg hover:bg-[#1A5683] hover:text-white transition-all cursor-pointer shadow-sm">🌐</span>
            <span className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-lg hover:bg-red-600 hover:text-white transition-all cursor-pointer shadow-sm">📧</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
