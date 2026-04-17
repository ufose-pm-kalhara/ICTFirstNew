'use client';
export default function Terms() {
  return (
    <div className="py-24 px-6 max-w-4xl mx-auto min-h-screen">
      <h1 className="text-5xl font-black text-[#1A5683] mb-4 tracking-tighter italic">TERMS OF <span className="text-red-600">SERVICE</span></h1>
      <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-16">Effective Date: January 1, 2026</p>
      <div className="space-y-12 text-slate-700 leading-relaxed font-medium">
        <section className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100">
          <h2 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-tight">1. Intellectual Property</h2>
          <p>All course materials, including videos and PDFs, are the property of ICT FIRST.lk. Unauthorized reproduction or sharing is strictly prohibited.</p>
        </section>
        <section className="p-10">
          <h2 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-tight">2. Student Conduct</h2>
          <p>Students are expected to maintain professional conduct during live sessions. Any disruptive behavior may result in account suspension without refund.</p>
        </section>
      </div>
    </div>
  );
}
