'use client';
import React, { useState } from 'react';

const faqs = [
  { q: "How do I register for the ICT classes?", a: "You can click the 'Register Now' button on the homepage or contact us via WhatsApp to secure your spot." },
  { q: "Are the classes conducted live?", a: "Yes, all our classes are conducted live on our secure streaming platform, allowing for real-time interaction." },
  { q: "What happens if I miss a class?", a: "Don't worry! All live sessions are recorded and uploaded to your student dashboard within 24 hours." }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-24 px-6 bg-slate-50 min-h-[70vh]">
      <div className="max-w-3xl mx-auto">
        <p className="text-[#1A5683] font-black text-xs uppercase tracking-[0.4em] mb-4 text-center">Support Center</p>
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-12 text-center italic tracking-tighter">FREQUENTLY ASKED <span className="text-red-600">QUESTIONS</span></h2>
        
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm transition-all hover:shadow-md">
              <button 
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex justify-between items-center p-8 text-left outline-none"
              >
                <span className="font-black text-slate-800 tracking-tight">{faq.q}</span>
                <span className={`text-[#1A5683] font-bold transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`}>▼</span>
              </button>
              <div className={`transition-all duration-300 ease-in-out ${openIndex === i ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-8 pb-8 text-slate-600 text-sm leading-relaxed font-medium border-t border-slate-50 pt-4">
                  {faq.a}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
