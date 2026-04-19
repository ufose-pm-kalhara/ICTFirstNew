'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

// ==========================================
// UI HELPER COMPONENTS
// ==========================================

/**
 * Animated counter for statistics
 * Increases number from 0 to the target value over a set duration
 */
const CountUp = ({ end, duration = 3000 }: { end: number; duration?: number }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime: number | null = null;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const currentCount = Math.min(Math.floor((progress / duration) * end), end);
      setCount(currentCount);
      if (progress < duration) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [end, duration]);
  return <span>{count.toLocaleString()}</span>;
};

/**
 * Individual card layout for the yearly exam results
 * Displays total students and a breakdown of grade percentages
 */
const YearlyResultCard = ({ year, total, grades }: { year: string, total: number, grades: {l: string, p: number, c: string}[] }) => (
  <div className="bg-white/95 backdrop-blur-md p-8 rounded-[3.5rem] shadow-xl border border-slate-100 hover:shadow-2xl transition-all duration-500">
    <div className="flex justify-between items-end mb-8">
      <div>
        <p className="text-[#1A5683] text-sm font-black uppercase tracking-widest leading-none mb-2">{year} Analysis</p>
        <h4 className="text-4xl font-black text-slate-900 tracking-tighter">Results.</h4>
      </div>
      <div className="text-right">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Students</p>
        <p className="text-2xl font-black text-red-600"><CountUp end={total} />+</p>
      </div>
    </div>
    <div className="space-y-5">
      {grades.map((g, i) => (
        <div key={i} className="relative">
          <div className="flex justify-between mb-1.5 text-[11px] font-black uppercase tracking-tight text-slate-800">
            <span>{g.l} Passes</span>
            <span className="text-[#1A5683]">{g.p}%</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
            <div 
              className={`h-full ${g.c} transition-all duration-[2500ms] ease-out shadow-sm`} 
              style={{ width: `${g.p}%` }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ==========================================
// MAIN HERO & LANDING PAGE CONTENT
// ==========================================

export default function Hero() {
  return (
    <div className="w-full relative bg-white font-['Poppins',sans-serif] text-[#1e293b] selection:bg-[#1A5683] selection:text-white overflow-x-hidden">
      
      {/* Global CSS for custom animations (Scroll, Gloss, and Text Reveal) */}
      <style>{`
        @keyframes galleryScroll { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes shinyGloss { 0%, 100% { opacity: 0.8; filter: brightness(1); } 50% { opacity: 1; filter: brightness(1.3); } }
        @keyframes rotateYAxis { 0% { transform: rotateY(0deg); } 100% { transform: rotateY(360deg); } }
        @keyframes textReveal { 
            0% { filter: blur(10px); opacity: 0; transform: translateY(20px); }
            100% { filter: blur(0); opacity: 1; transform: translateY(0); }
        }
        .animate-text-reveal { animation: textReveal 1.2s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
        .animate-gallery-infinite { animation: galleryScroll 45s linear infinite; }
        .animate-shiny-award { animation: shinyGloss 4s ease-in-out infinite, rotateYAxis 15s linear infinite; }
      `}</style>

      {/* BACKGROUND SETUP: Fixed image with a white gradient overlay */}
      <div className="fixed inset-0 z-0 h-screen w-screen pointer-events-none">
        <Image src="/image.jpeg" alt="BG" fill className="object-cover opacity-[0.18] grayscale contrast-125" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/70 to-white"></div>
      </div>

      {/* SECTION 1: HERO (Main introduction and branding) */}
      <section id="home" className="relative min-h-screen flex items-center px-6 md:px-20 z-10 overflow-visible pt-10 md:pt-0">
        <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-0">
          
          {/* Main heading and call to action */}
          <div className="w-full md:w-[55%] text-center md:text-left z-20">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-blue-50 rounded-full px-4 py-1.5 mb-8 shadow-sm">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-[10px] font-bold text-[#1A5683] uppercase tracking-[0.25em]">Sri Lanka&apos;s No.1 ICT Hub</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black text-[#1A5683] leading-[0.85] mb-4 animate-text-reveal">
              ICT <span className="text-red-600">FIRST</span>
            </h1>
            <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-8 tracking-tighter leading-none opacity-0 animate-text-reveal [animation-delay:0.3s]">
              Dinushika <br/> Kalugampitiya
            </h2>
            <p className="text-slate-700 text-base md:text-lg leading-relaxed max-w-sm mb-10 mx-auto md:mx-0 font-medium opacity-0 animate-text-reveal [animation-delay:0.6s]">
              Join the evolution of ICT education. We turn complex concepts into distinctions through structured theory and practicals.
            </p>
            
            <button className="bg-[#1A5683] text-white px-12 py-5 rounded-2xl font-bold text-lg hover:bg-red-600 transition-all shadow-2xl active:scale-95 opacity-0 animate-text-reveal [animation-delay:0.9s]">
              Register Now 🚀
            </button>
          </div>

          {/* Hero Visuals: Teacher's portrait and floating award badge */}
          <div className="w-full md:w-[45%] relative flex justify-center md:justify-end items-end h-[450px] md:h-[700px] mt-10 md:mt-0">
            <div className="relative w-full h-full md:-ml-32 lg:-ml-48">
              <Image src="/miss_dinushika_01.png" alt="Teacher" fill className="object-contain object-bottom scale-125 md:scale-150 drop-shadow-[0_30px_60px_rgba(0,0,0,0.25)]" priority />
              <div className="absolute top-10 right-4 md:right-10 bg-red-600 text-white w-24 h-24 md:w-36 md:h-36 rounded-full flex flex-col items-center justify-center text-3xl md:text-5xl shadow-2xl z-20 animate-bounce font-black border-8 border-white">
                A+
                <span className="text-[10px] uppercase tracking-widest mt-1 font-bold">Target</span>
              </div>
            </div>

            <div className="absolute top-[20%] left-1 md:-left-20 z-30 pointer-events-none">
              <div className="relative w-32 h-48 md:w-52 md:h-64 lg:w-60 lg:h-80 animate-shiny-award">
                <Image src="/Gallery08.png" alt="Award" fill className="object-contain" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <div className="relative z-20">
        
        {/* SECTION 2: EXPERIENCE (Teacher's credentials and history) */}
        <section className="py-24 bg-white/95 backdrop-blur-md border-t border-slate-100">
           <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="grid grid-cols-2 gap-6">
                 <div className="p-10 bg-slate-50 rounded-[3.5rem] border border-slate-200 hover:bg-[#1A5683] hover:text-white transition-all group shadow-sm">
                    <p className="text-5xl font-black text-[#1A5683] group-hover:text-white mb-2">18+</p>
                    <p className="text-[11px] font-bold text-slate-600 group-hover:text-white/70 uppercase tracking-widest">Mastery Years</p>
                 </div>
                 <div className="p-10 bg-red-600 rounded-[3.5rem] text-white mt-12 shadow-2xl border-4 border-white/20">
                    <p className="text-4xl font-black mb-2 italic">Legend</p>
                    <p className="text-[11px] font-bold text-red-100 uppercase tracking-widest">National Expert</p>
                 </div>
              </div>
              <div>
                 <h2 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight mb-8 italic tracking-tight uppercase">Experienced <span className="text-[#1A5683]">Leadership.</span></h2>
                 <p className="text-slate-800 text-lg leading-relaxed font-semibold italic">&quot;වේයන්ගොඩ, නිට්ටඹුව ඇතුළු සියනෑ කෝරළයේ ICT ප්‍රතිඵලයේ සාඩම්බර හිමිකාරිත්වය දරන ඇය, සැබෑ ප්‍රායෝගික පුහුණුවක් සමගින් ඔබේ දරුවාගේ අනාගතය හැඩගන්වයි.&quot;</p>
              </div>
           </div>
        </section>

        {/* SECTION 3: RESULTS (Data visualization for past year performances) */}
        <section id="results" className="py-24 bg-[#1A5683] relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <Image src="/image.png" alt="bg" fill className="object-cover grayscale brightness-200" />
          </div>
          <div className="max-w-7xl mx-auto px-6 relative z-10">
            <div className="text-center mb-20">
              <h2 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter mb-4 uppercase">Distinction Board</h2>
              <div className="w-24 h-2 bg-red-600 mx-auto rounded-full"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <YearlyResultCard year="2023" total={120} grades={[{l:'A', p:94, c:'bg-green-500'}, {l:'B', p:4, c:'bg-blue-500'}, {l:'C', p:1, c:'bg-yellow-500'}, {l:'S', p:1, c:'bg-red-500'}]} />
              <YearlyResultCard year="2024" total={145} grades={[{l:'A', p:92, c:'bg-green-500'}, {l:'B', p:5, c:'bg-blue-500'}, {l:'C', p:2, c:'bg-yellow-500'}, {l:'S', p:1, c:'bg-red-500'}]} />
              <YearlyResultCard year="2025" total={180} grades={[{l:'A', p:96, c:'bg-green-500'}, {l:'B', p:3, c:'bg-blue-500'}, {l:'C', p:1, c:'bg-yellow-500'}, {l:'S', p:0, c:'bg-red-500'}]} />
            </div>
          </div>
        </section>

        {/* SECTION 4: STUDENT VOICE (Testimonials from high-achieving students) */}
        <section id="achievers" className="py-32 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter italic uppercase">Student <span className="text-red-600">Voice</span></h2>
              <p className="text-slate-600 font-black text-xs tracking-[0.4em] mt-4 uppercase">Inspiration from our high achievers</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { n: "Kaveesha Anujith", s: "Ananda College", r: "A+", t: "Online theory class nisa mage ICT 'A' eka sure una. Points okkoma clear kiyala dunna." },
                { n: "Daham Thennakoon", s: "Visakha Vidyalaya", r: "A+", t: "Miss ge paper class eken exam ekata ena pattern eka hariyatama igena gaththa. Godak thanks miss!" },
                { n: "Imasha Sewwandi", s: "Gampaha Rathnavali", r: "A+", t: "Physical class awa paper set eka complete karannai theory update karannai eka loku pituhalak una." }
              ].map((st, i) => (
                <div key={i} className="group relative bg-slate-50 p-10 rounded-[4rem] border border-slate-100 hover:bg-[#1A5683] transition-all duration-500 hover:-translate-y-4 shadow-sm hover:shadow-2xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-slate-200 rounded-full border-4 border-white shadow-md flex items-center justify-center text-slate-600 group-hover:text-white font-bold italic text-xs">Photo</div>
                    <div>
                      <h4 className="font-black text-slate-900 group-hover:text-white transition-colors">{st.n}</h4>
                      <p className="text-[10px] font-bold text-[#1A5683] group-hover:text-white/60 uppercase tracking-widest">{st.s}</p>
                    </div>
                  </div>
                  <div className="inline-block px-4 py-1.5 bg-red-100 text-red-600 rounded-full text-[10px] font-black mb-6 group-hover:bg-white transition-all">RESULT: {st.r}</div>
                  <p className="text-slate-700 group-hover:text-white/90 leading-relaxed font-semibold italic text-sm">&quot;{st.t}&quot;</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 5: GALLERY (Auto-scrolling classroom and award images) */}
        <section className="py-24 bg-slate-50/50">
          <div className="text-center mb-16 px-6">
            <h2 className="text-5xl font-black text-slate-900 tracking-tighter italic uppercase">Academic <span className="text-[#1A5683]">Gallery</span></h2>
          </div>
          <div className="relative overflow-hidden group">
            <div className="animate-gallery-infinite flex gap-6 px-4 hover:[animation-play-state:paused]">
              {[1,2,3,4,5,6,1,2,3,4,5,6].map((n, i) => (
                <div key={i} className="min-w-[320px] md:min-w-[450px] h-[300px] md:h-[400px] bg-white rounded-[3.5rem] relative overflow-hidden shadow-lg border-8 border-white transition-all hover:scale-95 duration-500">
                    <Image src={`/Gallery0${n > 6 ? n-6 : n}.jpeg`} alt="Gallery" fill className="object-cover" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 6: FOOTER (Branding, Navigation, and Contact Details) */}
        <footer className="relative bg-slate-900 text-white overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-20 grayscale brightness-50">
             <Image src="/image.png" alt="Footer BG" fill className="object-cover" />
          </div>

          <div className="max-w-7xl mx-auto px-6 py-24 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-[1.2fr,1fr,1fr] gap-16 items-start pb-20 border-b border-white/10">
              
              {/* Branding Section */}
              <div>
                <div className="inline-flex items-center gap-2 bg-red-600 px-4 py-1.5 rounded-full mb-8 shadow-lg">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white">National Legend</span>
                </div>
                <h3 className="text-5xl font-black mb-6 tracking-tighter leading-none italic">
                  DINUSHIKA <br/> <span className="text-red-600 uppercase">Kalugampitiya.</span>
                </h3>
                <p className="text-slate-400 text-lg leading-relaxed font-medium mb-8">
                  Leading the digital transformation of ICT education in Sri Lanka. Mrs. Kalugampitiya has redefined how ICT is taught through deep theoretical insights and real-world application.
                </p>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-red-600 transition-all cursor-pointer font-black text-xs">FB</div>
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#1A5683] transition-all cursor-pointer font-black text-xs">WA</div>
                </div>
              </div>

              {/* Sitemap / Links */}
              <div className="md:pt-10">
                <h4 className="font-black uppercase tracking-widest mb-10 text-xs text-red-600">Navigation</h4>
                <div className="flex flex-col gap-6 text-[#1A5683] font-black text-xs tracking-widest">
                  <a href="#home" className="hover:text-white transition-colors">HOME</a>
                  <a href="#results" className="hover:text-white transition-colors">DISTINCTION BOARD</a>
                  <a href="#achievers" className="hover:text-white transition-colors">STUDENT VOICE</a>
                  <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
                </div>
              </div>

              {/* Contact and Location details */}
              <div className="md:pt-10 flex flex-col items-center md:items-end">
                <div className="text-center md:text-right mb-10">
                  <h4 className="font-black uppercase tracking-widest mb-6 text-xs text-red-600">Connect with us</h4>
                  <p className="text-[#1A5683] text-2xl font-black mb-2 tracking-tight">info@ictfirst.lk</p>
                  <p className="text-slate-400 font-bold text-sm">Veyangoda • Nittambuwa • Online</p>
                </div>
                <div className="relative w-40 h-56 rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl bg-black/40 p-4">
                  <Image src="/Gallery08.png" alt="Legend Award" fill className="object-contain p-2" />
                </div>
              </div>
            </div>

            {/* Copyright & Academy Tagline */}
            <div className="pt-12 text-center">
              <p className="text-[11px] font-black text-slate-500 uppercase tracking-[0.5em]">
                &copy; 2026 ICT FIRST ACADEMY • CRAFTED FOR EXCELLENCE • ALL RIGHTS RESERVED
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}