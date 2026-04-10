'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowRight, Sparkles, BookOpen, UserCheck } from 'lucide-react';

export default function Hero() {
  return (
    <div className="min-h-screen bg-white font-sans text-[#1E293B]">
    

      {/* Hero Section */}
      <section className="px-6 lg:px-20 pt-16 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-8">
          <div className="inline-flex items-center gap-2 bg-[#F1F5F9] px-4 py-2 rounded-full">
            <span className="text-pink-500">❤</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Online Education Platform</span>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-5xl lg:text-7xl font-black italic tracking-tighter leading-[0.9]">
              <span className="text-[#1A5683]">ICT</span> <span className="text-[#E11D48]">FIRST</span>
            </h1>
            <h2 className="text-4xl lg:text-6xl font-black text-[#1A5683] tracking-tight">
              Dinushika Kalugampitiya
            </h2>
          </div>

          <p className="text-slate-500 text-lg max-w-md font-medium leading-relaxed italic">
            &quot;Join the leading ICT academy in Sri Lanka for O/L and A/L students. Master ICT with world-class teaching.&quot;
          </p>

          <button className="bg-[#1A5683] text-white px-10 py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-xl shadow-blue-900/20">
            Register Now
          </button>
        </div>

        <div className="relative flex justify-center lg:justify-end">
          <div className="relative w-full max-w-lg aspect-square">
            {/* The decorative light blue square behind the teacher */}
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-[#D1D5DB] rounded-3xl -z-10" />
            <div className="rounded-[3rem] overflow-hidden bg-white shadow-2xl border-[12px] border-white">
               <Image src="/missdinushika.png" alt="Dinushika Kalugampitiya" width={500} height={500} className="w-full h-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Our Process Section */}
      <section className="px-6 lg:px-20 py-24 bg-[#F8FAFC]">
        <div className="mb-16">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter text-[#1A5683]">Our Process</h2>
          <p className="text-slate-400 font-bold text-sm mt-2">Structured modules designed for comprehensive understanding.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Featured Course Card */}
          <div className="lg:col-span-8 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Featured Course</span>
              <h3 className="text-3xl font-black text-slate-800 mt-4">Advanced Academic Writing</h3>
              <p className="text-slate-500 mt-4 max-w-md font-medium">Master the art of clear, persuasive communication and academic integrity in our flagship program.</p>
            </div>
            <div className="mt-12 flex items-center justify-between">
              <div className="flex -space-x-3">
                {[1, 2, 3].map(i => <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-slate-200" />)}
                <div className="w-10 h-10 rounded-full border-4 border-white bg-[#1A5683] text-white flex items-center justify-center text-[10px] font-bold">+100</div>
              </div>
              <button className="flex items-center gap-2 text-[#1A5683] font-black uppercase text-[11px] tracking-widest group">
                Learn More <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* Live Workshops Card */}
          <div className="lg:col-span-4 bg-[#1A5683] p-10 rounded-[2.5rem] text-white flex flex-col justify-between relative overflow-hidden">
            <Sparkles className="absolute top-8 right-8 text-white/20" size={40} />
            <div className="mt-auto">
              <h3 className="text-2xl font-black leading-tight">Live Workshops</h3>
              <p className="text-white/60 text-sm mt-2 font-medium">Join real-time interactive sessions with Mrs. Dinushika every Tuesday.</p>
            </div>
          </div>

          {/* Resource Library Card */}
          <div className="lg:col-span-4 bg-[#DDD6FE] p-10 rounded-[2.5rem] flex flex-col justify-between hover:scale-[1.02] transition-all">
            <BookOpen className="text-[#5B21B6]" size={32} />
            <div className="mt-12">
              <h3 className="text-2xl font-black text-[#5B21B6]">Resource Library</h3>
              <p className="text-[#5B21B6]/60 text-sm mt-1 font-bold">Access 500+ templates and study guides.</p>
            </div>
          </div>

          {/* Mentorship Card */}
          <div className="lg:col-span-8 bg-[#E2E8F0] p-10 rounded-[2.5rem] flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-black text-slate-800">Personal Mentorship</h3>
              <p className="text-slate-500 text-sm mt-1 font-medium">One-on-one strategy sessions for ambitious students looking to excel.</p>
            </div>
            <button className="bg-[#1E293B] text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest whitespace-nowrap">
              Book Consultation
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}