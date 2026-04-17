'use client';
export default function Privacy() {
  return (
    <div className="py-24 px-6 max-w-4xl mx-auto min-h-screen">
      <h1 className="text-5xl font-black text-[#1A5683] mb-4 tracking-tighter italic">PRIVACY <span className="text-red-600">POLICY</span></h1>
      <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-16">Effective Date: January 1, 2026</p>
      <div className="space-y-12 text-slate-700 leading-relaxed font-medium">
        <section className="bg-slate-50 p-10 rounded-[3rem] border border-slate-100">
          <h2 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-tight">1. Data Collection</h2>
          <p>We collect student names, contact details, and grade information solely for the purpose of managing educational enrolments and providing access to our learning platform.</p>
        </section>
        <section className="p-10">
          <h2 className="text-xl font-black text-slate-900 mb-4 uppercase tracking-tight">2. Data Security</h2>
          <p>Your privacy is our priority. We use industry-standard encryption to protect your data and never share your personal information with third-party advertisers.</p>
        </section>
      </div>
    </div>
  );
}
