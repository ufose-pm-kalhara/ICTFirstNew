'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface DashboardData {
  full_name: string;
  student_id: string;
  grade: number;
  recentLesson?: string;
  paymentStatus?: string;
}

interface Lesson {
  id: number;
  title: string;
  type: 'pdf' | 'video';
  category: string;
  size_or_duration: string;
}

export default function StudentDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  useEffect(() => {
    const fetchSummary = async () => {
      try {

        // Profile Data Fetch
        const res = await fetch('/api/student/profile');
        const profile = await res.json();
        
        // Fetch last payment to show status on dashboard
        const payRes = await fetch('/api/student/payments');
        const payments = await payRes.json();

        //Lessons Data Fetch
        const lessonsRes = await fetch('/api/student/lessons');
        const lessonsData = await lessonsRes.json();
        setLessons(lessonsData.lessons);
        
        if (profile.success) {
          setData({
            full_name: profile.student.full_name,
            student_id: profile.student.student_id,
            grade: profile.student.grade,
            paymentStatus: payments.payments?.[0]?.status || 'no_history'
          });
        }
      } catch (err) {
        console.error("Dashboard sync error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) return <div className="p-20 text-[#1A5683] font-black animate-pulse">SYNCHRONIZING ATELIER...</div>;

  return (
    <div className="max-w-7xl mx-auto px-8 py-12">

      {/* Hero Welcome */}
      <div className="p-4 text-black mb-8 elative overflow-hidden">
        <div className="relative z-10">

          {/* Welcome Back Label */}
          <h4 className="font-medium uppercase tracking-[0.4em] text-[10px] text-slate-500 mb-1">WELCOME BACK</h4>

          {/* Name Heading */}
          <h1 className="text-4xl font-semibold font-black  font-medium text-slate-700 tracking-tight mb-2">
            Hello, {data?.full_name}
          </h1>

          {/* Student ID*/}
          <p className="inline-flex items-center px-3 py-1 bg-[#E2E8F0] rounded-md text-black-100 opacity-70 max-w-md text-sm leading-relaxed">
            ID: {data?.student_id}
          </p>
        </div>
        <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      </div>


      {/* Live Class Banner and  Instructor Note */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">

        {/* Live Class Banner */}
        <div className="lg:col-span-2 bg-[#1A5683] rounded-[2rem] p-10 text-white min-h-[350px] flex flex-col justify-between">
          <div>
                  <span className="bg-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"> 🔴 Live Session Starting Soon</span>
                  <h2 className="text-4xl font-bold mt-6">Introduction Of Computer</h2>
                  <p className="text-blue-50 mt-1">Theory Class - Grade {data?.grade}</p>
                  <p className="text-blue-100 opacity-80 mt-1 mb-3">with Mrs. Dinushika Kalugampitiya</p>
              </div>
              <div className="flex items-center gap-4">
                  <button className="bg-white text-[#1A5683] px-6 py-2.5 rounded-xl font-bold text-sm">Join Live Class</button>

                  {/* Avatars Decoration */}
                <div className="hidden lg:flex bottom-12 right-12 items-center -space-x-4">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-12 h-12 rounded-full border-[3px] border-[#1A5683] bg-slate-200 flex items-center justify-center text-xs text-slate-500 font-black italic">ICT</div>
                  ))}
                  <div className="w-12 h-12 rounded-full border-[3px] border-[#1A5683] bg-blue-400 flex items-center justify-center text-[10px] font-black text-white">+24</div>
            </div>
              </div>
              
        </div>

        {/* Instructor's Note */}
        <div className="bg-[#D1D5F9] rounded-[2rem] p-10">
          <h3 className="text-xl font-bold text-indigo-900 mb-4">Instructor&apos;s Note</h3>
          <p className="text-black italic text-sm text-slate-600 leading-relaxed">
                &quot;Remember to review the &apos;Metaphoric
                  Structures&apos; PDF before today&apos;s session. We
                  will be deconstructing the early 19th-
                  century prose in our live workshop.
                  Looking forward to your creative
                  insights!&quot;
              </p>
        </div>

      </div>


      {/* This is container for Previous Lessons.Include 4 cards  */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

        {/* Card 1: Comparative Literature */}
        <div className="bg-white border border-gray-100 p-10 rounded-[2.5rem] shadow-sm hover:shadow-md transition">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-xl mb-6">📚 </div>
          <h3 className="font-black uppercase text-gray-900 mb-2">Comparative Literature</h3>
          <p className="text-gray-400 text-xs mb-8">Lecture Notes</p>
          <Link href="/student/lessons" className="text-[10px] font-black uppercase text-[#1A5683] tracking-widest border-b-2 border-blue-100 pb-1 hover:border-[#1A5683] transition">
            Download PDF →
          </Link>
        </div>

        {/* Card 2: Modern Prose Analysis */}
        <div className="bg-white border border-gray-100 p-10 rounded-[2.5rem] shadow-sm">
          <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-xl mb-6">📼</div>
          <h3 className="font-black uppercase text-gray-900 mb-2">Modern Prose Analysis</h3>
          <div className="mb-8">
            <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
              data?.paymentStatus === 'approved' ? 'bg-green-50 text-green-600' : 
              data?.paymentStatus === 'pending' ? 'bg-orange-50 text-orange-600' : 'bg-gray-50 text-gray-400'
            }`}>
              {data?.paymentStatus?.replace('_', ' ')}
            </span>
          </div>
          <Link href="/student/payments" className="text-[10px] font-black uppercase text-[#1A5683] tracking-widest border-b-2 border-blue-100 pb-1 hover:border-[#1A5683] transition">
            Stream  MP4 →
          </Link>
        </div>

        {/* Card 3: Essay Writing Frameworks */}
        <div className="bg-white border border-gray-100 p-10 rounded-[2.5rem] shadow-sm">
          <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-xl mb-6">📝</div>
          <h3 className="font-black uppercase text-gray-900 mb-2">Essay Writing Frameworks</h3>
          <p className="text-gray-400 text-xs mb-8">Study Guide</p>
          <a href="https://wa.me/your-number" target="_blank" className="text-[10px] font-black uppercase text-[#1A5683] tracking-widest border-b-2 border-blue-100 pb-1 hover:border-[#1A5683] transition">
            Download PDF →
          </a>
        </div>

        {/* Card 4: Creative writing Workshop */}
        <div className="bg-white border border-gray-100 p-10 rounded-[2.5rem] shadow-sm">
          <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-xl mb-6">✍️</div>
          <h3 className="font-black uppercase text-gray-900 mb-2">Creative writing Workshop</h3>
          <p className="text-gray-400 text-xs mb-8">Session Highlights</p>
          <a href="https://wa.me/your-number" target="_blank" className="text-[10px] font-black uppercase text-[#1A5683] tracking-widest border-b-2 border-blue-100 pb-1 hover:border-[#1A5683] transition">
            Stream  MP4  →
          </a>
        </div>

      </div>
    </div>
  );
}