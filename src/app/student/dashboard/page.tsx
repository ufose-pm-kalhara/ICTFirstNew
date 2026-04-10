'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';

interface DashboardData {
  full_name: string;
  student_id: string;
  grade: number;
}

interface Lesson {
  id: number;
  title: string;
  video_url: string | null;
  material_id: number | null;
  notes: string | null;
}

interface PaymentRecord {
  status: string;
  lesson_id: number | null;
}

export default function StudentDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [paymentMap, setPaymentMap] = useState<Record<number, string>>({});
  const [generalStatus, setGeneralStatus] = useState<string>('no_history');
  const [showPendingModal, setShowPendingModal] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const [profileRes, payRes, lessonsRes] = await Promise.all([
          fetch('/api/student/profile'),
          fetch('/api/student/payments'),
          fetch(`/api/student/lessons?t=${Date.now()}`)
        ]);

        const profile = await profileRes.json();
        const paymentsData = await payRes.json();
        const lessonsData = await lessonsRes.json();

        if (profile.success) {
          setData({
            full_name: profile.student.full_name,
            student_id: profile.student.student_id,
            grade: profile.student.grade,
          });
        }

        if (paymentsData.success && paymentsData.payments) {
          const mapping: Record<number, string> = {};
          let latestGeneral = 'no_history';

          paymentsData.payments.forEach((p: PaymentRecord) => {
            if (p.lesson_id) {
              if (!mapping[p.lesson_id]) mapping[p.lesson_id] = p.status;
            } else {
              if (latestGeneral === 'no_history') latestGeneral = p.status;
            }
          });
          setPaymentMap(mapping);
          setGeneralStatus(latestGeneral);
        }

        if (lessonsData.success) {
          setLessons(lessonsData.lessons.slice(0, 12)); 
        }
      } catch (err) {
        console.error("Dashboard sync error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const getLessonStatus = (lessonId: number) => {
    if (generalStatus === 'approved') return 'approved';
    return paymentMap[lessonId] || 'no_history';
  };

  const handleLockedClick = (status: string, e: React.MouseEvent) => {
    if (status === 'pending') {
      e.preventDefault();
      setShowPendingModal(true);
    }
  };

  const { unlockedLessons, lockedLessons } = useMemo(() => {
    return lessons.reduce(
      (acc, lesson) => {
        const status = getLessonStatus(lesson.id);
        if (status === 'approved') {
          acc.unlockedLessons.push(lesson);
        } else {
          acc.lockedLessons.push(lesson);
        }
        return acc;
      },
      { unlockedLessons: [] as Lesson[], lockedLessons: [] as Lesson[] }
    );
  }, [lessons, paymentMap, generalStatus]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center font-black text-[#1A5683] animate-pulse italic uppercase tracking-[0.3em]">
      SYNCHRONIZING ATELIER...
    </div>
  );

  // Reusable Card Component
  const LessonCard = ({ lesson }: { lesson: Lesson }) => {
    const status = getLessonStatus(lesson.id);
    const lessonHasAccess = status === 'approved';
    const lessonIsPending = status === 'pending';

    return (
      <div className="bg-white border border-slate-50 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
        <div>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-6 ${lesson.video_url ? 'bg-orange-50' : 'bg-blue-50'}`}>
            {lesson.video_url ? '📼' : '📚'}
          </div>
          <h3 className="font-black uppercase text-slate-800 text-[13px] leading-tight mb-2 tracking-tight line-clamp-2 italic">
            {lesson.title}
          </h3>
          <div className="flex items-center gap-2 mb-8">
            <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest italic">
              {lesson.video_url ? 'Video Session' : 'Lecture Note'}
            </p>
            {!lessonHasAccess && (
              <span className="text-[8px] bg-red-50 text-red-500 px-2 py-0.5 rounded font-black uppercase tracking-tighter italic">Locked</span>
            )}
          </div>
        </div>

        {lessonHasAccess ? (
          // ✅ Unified "View Lesson" button for all content types
          <Link href={`/student/lessons/${lesson.id}`} className="w-full py-3 bg-[#1A5683] text-white rounded-xl text-[9px] font-black uppercase tracking-widest text-center transition-all hover:bg-slate-900">
            View Lesson →
          </Link>
        ) : (
          <Link 
            href={`/student/payments?lessonId=${lesson.id}`} 
            onClick={(e) => handleLockedClick(status, e)}
            className="w-full py-3 bg-slate-100 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest text-center hover:bg-orange-100 hover:text-orange-600 transition-colors"
          >
            {lessonIsPending ? 'Verification Pending...' : 'Unlock Lesson 🔒'}
          </Link>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-12 select-none relative">
      {showPendingModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6">
          <div className="bg-white rounded-[3rem] p-10 max-w-lg w-full shadow-2xl border border-blue-50 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-3xl flex items-center justify-center mb-8 rotate-3">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter mb-4">Verification In Progress</h3>
            <div className="space-y-4 mb-8">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Course Content</p>
                <p className="text-sm font-bold text-slate-700">ICT Grade {data?.grade} - Lesson Module</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Status Update</p>
                <p className="text-sm font-bold text-[#1A5683]">Our finance team is auditing your bank slip. This usually takes 24 business hours.</p>
              </div>
            </div>
            <button onClick={() => setShowPendingModal(false)} className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl text-xs uppercase tracking-[0.2em] hover:bg-[#1A5683] transition-all">Back to Dashboard</button>
          </div>
        </div>
      )}

      {/* Hero Welcome */}
      <div className="p-4 mb-8 relative overflow-hidden">
        <div className="relative z-10">
          <h4 className="font-bold uppercase tracking-[0.4em] text-[10px] text-slate-400 mb-1">WELCOME BACK</h4>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight mb-2 italic uppercase">Hello, {data?.full_name}</h1>
          <p className="inline-flex items-center px-3 py-1 bg-slate-100 rounded-md text-slate-500 font-bold text-xs tracking-widest uppercase">ID: {data?.student_id}</p>
        </div>
      </div>

      {/* Live Class Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <div className="lg:col-span-2 bg-[#1A5683] rounded-[2.5rem] p-10 text-white flex flex-col justify-between shadow-xl shadow-blue-100/50 min-h-[320px]">
          <div>
            <span className="bg-white/10 border border-white/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest italic">🔴 Live Session Starting Soon</span>
            <h2 className="text-4xl font-black mt-6 italic uppercase tracking-tighter leading-none">Introduction To <br/>Computer</h2>
            <p className="text-blue-100 font-bold uppercase text-[10px] mt-4 tracking-widest italic opacity-80">with Mrs. Dinushika Kalugampitiya</p>
          </div>
          {generalStatus === 'approved' ? (
             <button className="bg-white text-[#1A5683] w-fit px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform active:scale-95 shadow-lg shadow-black/10">Join Live Class</button>
          ) : (
            <Link href="/student/payments" onClick={(e) => handleLockedClick(generalStatus, e)} className="bg-orange-500 text-white w-fit px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform active:scale-95 shadow-lg">
                {generalStatus === 'pending' ? 'Verification Pending...' : 'Unlock Live Access →'}
            </Link>
          )}
        </div>
        <div className="bg-[#EEF2FF] rounded-[2.5rem] p-10 border border-blue-100 flex flex-col justify-between">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-[#4F46E5] mb-4 italic">Instructor&apos;s Note</h3>
          <p className="text-slate-600 italic font-bold text-sm leading-relaxed opacity-90">&quot;Remember to review the Hardware Structure PDF before our next session. We will be deconstructing input processing cycles in the live workshop.&quot;</p>
          <div className="mt-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-200"></div>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">G{data?.grade} Theory</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: UNLOCKED LESSONS */}
      {unlockedLessons.length > 0 && (
        <div className="mb-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-green-500 italic">✓ My Active Courses</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {unlockedLessons.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} />
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: LOCKED LESSONS */}
      <div className="mb-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic">Locked Sessions & Materials</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {lockedLessons.length > 0 ? (
            lockedLessons.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} />
            ))
          ) : unlockedLessons.length === 0 ? (
            <div className="col-span-4 text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-100">
              <p className="text-slate-300 font-black uppercase italic tracking-widest text-xs">No lessons available for your grade yet</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}