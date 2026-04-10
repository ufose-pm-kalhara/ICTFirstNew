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
  created_at: string; // Added for month extraction
  type?: string;      // Added for lesson category (Theory/Revision/etc)
}

interface LiveSession {
  id: number;
  title: string;
  url: string | null; // Changed to nullable to handle "no link yet"
  announcement: string;
  lesson_id: number;
}

interface PaymentRecord {
  status: string;
  lesson_id: number | null;
}

export default function StudentDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [liveSession, setLiveSession] = useState<LiveSession | null>(null);
  const [paymentMap, setPaymentMap] = useState<Record<number, string>>({});
  const [generalStatus, setGeneralStatus] = useState<string>('no_history');
  const [showPendingModal, setShowPendingModal] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const [profileRes, payRes, lessonsRes, liveRes] = await Promise.all([
          fetch('/api/student/profile'),
          fetch('/api/student/payments'),
          fetch(`/api/student/lessons?t=${Date.now()}`),
          fetch('/api/student/live-session')
        ]);

        const profile = await profileRes.json();
        const paymentsData = await payRes.json();
        const lessonsData = await lessonsRes.json();
        const liveData = await liveRes.json();

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

        if (liveData.success) {
          setLiveSession(liveData.session);
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

  const liveAccessStatus = liveSession ? getLessonStatus(liveSession.lesson_id) : 'no_history';
  const hasLiveAccess = liveAccessStatus === 'approved';

  const { unlockedLessons, lockedLessons } = useMemo(() => {
    return lessons.reduce(
      (acc, lesson) => {
        const status = getLessonStatus(lesson.id);
        if (status === 'approved') acc.unlockedLessons.push(lesson);
        else acc.lockedLessons.push(lesson);
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

  const LessonCard = ({ lesson }: { lesson: Lesson }) => {
    const status = getLessonStatus(lesson.id);
    const lessonHasAccess = status === 'approved';
    const lessonIsPending = status === 'pending';

    // Extract Month
    const lessonMonth = lesson.created_at 
      ? new Date(lesson.created_at).toLocaleString('default', { month: 'long' }) 
      : 'Session';

    return (
      <div className="bg-white border border-slate-50 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
        <div>
          <div className="flex justify-between items-start mb-6">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${lesson.video_url ? 'bg-orange-50' : 'bg-blue-50'}`}>
              {lesson.video_url ? '📼' : '📚'}
            </div>
            <span className="text-[9px] font-black uppercase text-slate-300 tracking-widest">{lessonMonth}</span>
          </div>
          
          <h3 className="font-black uppercase text-slate-800 text-[13px] leading-tight mb-2 tracking-tight line-clamp-2 italic">
            {lesson.title}
          </h3>
          
          <div className="flex items-center gap-2 mb-8">
            <p className="text-[#1A5683] text-[9px] font-black uppercase tracking-widest italic bg-blue-50/50 px-2 py-0.5 rounded">
              {lesson.type || (lesson.video_url ? 'Theory' : 'Material')}
            </p>
            {!lessonHasAccess && (
              <span className="text-[8px] bg-red-50 text-red-500 px-2 py-0.5 rounded font-black uppercase tracking-tighter italic">Locked</span>
            )}
          </div>
        </div>

        {lessonHasAccess ? (
          <Link href={`/student/lessons/${lesson.id}`} className="w-full py-3 bg-[#1A5683] text-white rounded-xl text-[9px] font-black uppercase tracking-widest text-center transition-all hover:bg-slate-900 shadow-md">
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
      {/* ... (Keep Modal and Welcome Hero same as before) */}
      
      {/* Live Class Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <div className="lg:col-span-2 bg-[#1A5683] rounded-[2.5rem] p-10 text-white flex flex-col justify-between shadow-xl shadow-blue-100/50 min-h-[320px]">
          <div>
            <span className="bg-white/10 border border-white/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest italic">🔴 Live Session</span>
            <h2 className="text-4xl font-black mt-6 italic uppercase tracking-tighter leading-none">
                {liveSession?.title || 'Next Session Upcoming'}
            </h2>
            <p className="text-blue-100 font-bold uppercase text-[10px] mt-4 tracking-widest italic opacity-80 max-w-md">
                {liveSession?.announcement || 'The next live session topic will be updated soon.'}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            {liveSession ? (
              hasLiveAccess ? (
                liveSession.url ? (
                  <a href={liveSession.url} target="_blank" rel="noopener noreferrer" className="bg-white text-[#1A5683] w-fit px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform shadow-lg">
                    Join Live Class Now →
                  </a>
                ) : (
                  <button disabled className="bg-white/20 text-white w-fit px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest cursor-not-allowed border border-white/10">
                    Link Available Soon
                  </button>
                )
              ) : (
                <Link href={`/student/payments?lessonId=${liveSession.lesson_id}`} onClick={(e) => handleLockedClick(liveAccessStatus, e)} className="bg-orange-500 text-white w-fit px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-transform shadow-lg">
                  {liveAccessStatus === 'pending' ? 'Verification Pending...' : 'Unlock Live Access 🔒'}
                </Link>
              )
            ) : (
              <button disabled className="bg-white/10 text-white/40 border border-white/10 w-fit px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest cursor-not-allowed">
                No Active Session
              </button>
            )}
          </div>
        </div>

        <div className="bg-[#EEF2FF] rounded-[2.5rem] p-10 border border-blue-100 flex flex-col justify-between">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-[#4F46E5] mb-4 italic">Instructor&apos;s Note</h3>
          <p className="text-slate-600 italic font-bold text-sm leading-relaxed opacity-90">&quot;Please ensure you have a stable internet connection before joining. Recorded sessions will be available later.&quot;</p>
          <div className="mt-6 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-200"></div>
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">G{data?.grade} Theory</span>
          </div>
        </div>
      </div>

      {/* Unlocked Lessons */}
      {unlockedLessons.length > 0 && (
        <div className="mb-12">
          <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-green-500 italic mb-6">✓ My Active Courses</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {unlockedLessons.map((lesson) => <LessonCard key={lesson.id} lesson={lesson} />)}
          </div>
        </div>
      )}

      {/* Locked Lessons */}
      <div className="mb-8">
        <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400 italic mb-6">Locked Sessions & Materials</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {lockedLessons.length > 0 ? (
            lockedLessons.map((lesson) => <LessonCard key={lesson.id} lesson={lesson} />)
          ) : unlockedLessons.length === 0 ? (
            <div className="col-span-4 text-center py-20 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-100">
              <p className="text-slate-300 font-black uppercase italic tracking-widest text-xs">No lessons available yet</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}