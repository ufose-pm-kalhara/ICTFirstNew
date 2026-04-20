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
  created_at: string;
  month: string; 
  class_date?: string; 
  class_time?: string; 
  type?: string; 
}

interface LiveSession {
  id: number;
  title: string;
  url: string | null;
  announcement: string;
  lesson_id: number;
  class_date?: string;
  class_time?: string;
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

  const brandGradient = 'linear-gradient(135deg, #2B6390 0%, #1A5783 100%)';

  const formatDisplayDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const cleanDate = dateStr.split('T')[0];
      const parts = cleanDate.split('-'); 
      if (parts.length < 3) return dateStr;
      const year = parts[0];
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${day} ${months[monthIndex]} ${year}`;
    } catch (e) {
      return dateStr; 
    }
  };

  const formatDisplayTime = (timeStr?: string) => {
    if (!timeStr) return '';
    return timeStr.split(':').slice(0, 2).join(':');
  };

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
          setLessons(lessonsData.lessons); 
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

  // Memoized sorting by latest date first
  const { unlockedLessons, lockedLessons } = useMemo(() => {
    const sortedLessons = [...lessons].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return sortedLessons.reduce(
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
    <div className="min-h-screen flex items-center justify-center font-black text-[#1A5783] animate-pulse tracking-widest px-4 text-center">
      SYNCHRONIZING ATELIER...
    </div>
  );

  const LessonCard = ({ lesson }: { lesson: Lesson }) => {
    const status = getLessonStatus(lesson.id);
    const lessonHasAccess = status === 'approved';
    const lessonIsPending = status === 'pending';
    const lessonMonth = lesson.month || 'Session';

    return (
      <div className="bg-white border border-slate-100 p-5 md:p-7 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 flex flex-col justify-between group">
        <div>
          <div className="flex justify-between items-start mb-6">
            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center text-xl md:text-2xl ${lesson.video_url ? 'bg-orange-50' : 'bg-blue-50'}`}>
              {lesson.video_url ? '📼' : '📚'}
            </div>
            <span className="text-[10px] md:text-[12px] font-bold text-slate-400 uppercase tracking-wider">{lessonMonth}</span>
          </div>
          
          <h3 className="font-bold text-slate-800 text-[15px] md:text-[16px] leading-snug mb-3 line-clamp-2">
            {lesson.title}
          </h3>
          
          {lesson.class_date && (
            <div className="mb-4 flex items-center gap-2 text-slate-500">
               <span className="text-[10px] md:text-[11px] font-bold bg-slate-50 px-2 py-1 rounded border border-slate-100 uppercase tracking-tighter inline-block">
                 🗓️ {formatDisplayDate(lesson.class_date)} {lesson.class_time && `@ ${formatDisplayTime(lesson.class_time)}`}
               </span>
            </div>
          )}
          
          <div className="flex items-center gap-2 mb-6 md:mb-8">
            <p className="text-[#1A5783] text-[10px] md:text-[11px] font-bold uppercase tracking-widest bg-[#F0F5FA] px-3 py-1 rounded-lg">
              {lesson.type || (lesson.video_url ? 'Theory' : 'Material')}
            </p>
            {!lessonHasAccess && (
              <span className="text-[10px] md:text-[11px] bg-red-50 text-red-500 px-3 py-1 rounded-lg font-bold uppercase tracking-tighter">Locked</span>
            )}
          </div>
        </div>

        {lessonHasAccess ? (
          <Link href={`/student/lessons/${lesson.id}`} 
            style={{ background: brandGradient }}
            className="w-full py-3 md:py-3.5 text-white rounded-xl text-[13px] md:text-[14px] font-bold text-center transition-all hover:opacity-90 shadow-lg shadow-blue-900/10">
            View Lesson
          </Link>
        ) : (
          <Link 
            href={`/student/payments?lessonId=${lesson.id}`} 
            onClick={(e) => handleLockedClick(status, e)}
            className="w-full py-3 md:py-3.5 bg-slate-50 text-slate-400 border border-slate-100 rounded-xl text-[13px] md:text-[14px] font-bold text-center hover:bg-orange-50 hover:text-orange-600 hover:border-orange-100 transition-all"
          >
            {lessonIsPending ? 'Verification Pending...' : 'Unlock Lesson 🔒'}
          </Link>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8 select-none relative">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
        <div 
          className="lg:col-span-2 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 text-white flex flex-col justify-between shadow-2xl shadow-blue-900/20 min-h-[300px] md:min-h-[340px] relative overflow-hidden"
          style={{ background: brandGradient }}
        >
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <span className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full text-[10px] md:text-[12px] font-bold uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
                  Live Session
                </span>
                
                {liveSession?.class_date && (
                    <div className="text-left sm:text-right w-full sm:w-auto">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-100/60 mb-1">Scheduled For</p>
                        <p className="text-[14px] md:text-[16px] font-black tracking-tight">
                            {formatDisplayDate(liveSession.class_date)} <span className="text-blue-200">@</span> {formatDisplayTime(liveSession.class_time)}
                        </p>
                    </div>
                )}
            </div>

            <h2 className="text-2xl md:text-4xl font-black mt-6 md:mt-8 tracking-tight leading-tight max-w-2xl">
                {liveSession?.title || 'Next Session Upcoming'}
            </h2>
            <p className="text-blue-50/70 font-medium text-[14px] md:text-[15px] mt-3 md:mt-4 max-w-md">
                {liveSession?.announcement || 'The next live session topic will be updated soon.'}
            </p>
          </div>
          
          <div className="flex items-center gap-4 relative z-10 mt-8">
            {liveSession ? (
              hasLiveAccess ? (
                liveSession.url ? (
                  <a href={liveSession.url} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto bg-white text-[#1A5783] px-6 md:px-10 py-3.5 md:py-4 rounded-2xl font-bold text-[14px] md:text-[15px] hover:scale-[1.02] active:scale-95 transition-all shadow-xl text-center">
                    Join Live Class Now
                  </a>
                ) : (
                  <button disabled className="w-full sm:w-auto bg-white/10 text-white/60 px-6 md:px-10 py-3.5 md:py-4 rounded-2xl font-bold text-[14px] md:text-[15px] cursor-not-allowed border border-white/10">
                    Link Available Soon
                  </button>
                )
              ) : (
                <Link href={`/student/payments?lessonId=${liveSession.lesson_id}`} onClick={(e) => handleLockedClick(liveAccessStatus, e)} className="w-full sm:w-auto bg-orange-500 text-white px-6 md:px-10 py-3.5 md:py-4 rounded-2xl font-bold text-[14px] md:text-[15px] hover:bg-orange-600 transition-all shadow-xl shadow-orange-900/20 text-center">
                  {liveAccessStatus === 'pending' ? 'Verification Pending...' : 'Unlock Live Access 🔒'}
                </Link>
              )
            ) : (
              <button disabled className="w-full sm:w-auto bg-white/5 text-white/30 border border-white/10 px-6 md:px-10 py-3.5 md:py-4 rounded-2xl font-bold text-[14px] md:text-[15px] cursor-not-allowed">
                No Active Session
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 border border-slate-100 flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-[11px] md:text-[12px] font-bold uppercase tracking-widest text-[#1A5783] mb-4 md:mb-5">Instructor&apos;s Note</h3>
            <p className="text-slate-600 font-semibold text-[14px] md:text-[15px] leading-relaxed italic">&quot;Please ensure you have a stable internet connection before joining. Recorded sessions will be available in the Lessons tab later.&quot;</p>
          </div>
          <div className="mt-6 md:mt-8 pt-6 border-t border-slate-50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#1A5783] font-bold">G{data?.grade}</div>
              <span className="text-[12px] md:text-[13px] font-bold text-slate-400 uppercase tracking-wider">ICT Theory</span>
          </div>
        </div>
      </div>

      {/* RECENTLY UNLOCKED SECTION */}
      {unlockedLessons.length > 0 && (
        <div className="mb-12 md:mb-16">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div className="flex items-center gap-3">
              <div className="h-5 md:h-6 w-1 rounded-full bg-green-500"></div>
              <h2 className="text-[12px] md:text-[14px] font-bold uppercase tracking-[0.2em] text-slate-800">Recently Unlocked</h2>
            </div>
            <Link 
              href="/student/lessons" 
              className="text-[11px] md:text-[12px] font-black text-[#1A5783] uppercase tracking-widest hover:translate-x-1 transition-transform flex items-center gap-2"
            >
              View All Lessons <span>→</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {unlockedLessons.slice(0, 4).map((lesson) => <LessonCard key={lesson.id} lesson={lesson} />)}
          </div>
        </div>
      )}

      {/* LOCKED MATERIALS SECTION - Now sliced to 4 with View All link */}
      <div className="mb-10 md:mb-12">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div className="flex items-center gap-3">
            <div className="h-5 md:h-6 w-1 rounded-full bg-slate-300"></div>
            <h2 className="text-[12px] md:text-[14px] font-bold uppercase tracking-[0.2em] text-slate-500">Locked Materials</h2>
          </div>
          {lockedLessons.length > 4 && (
            <Link 
              href="/student/lessons" 
              className="text-[11px] md:text-[12px] font-black text-[#1A5783] uppercase tracking-widest hover:translate-x-1 transition-transform flex items-center gap-2"
            >
              View All <span>→</span>
            </Link>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {lockedLessons.length > 0 ? (
            lockedLessons.slice(0, 4).map((lesson) => <LessonCard key={lesson.id} lesson={lesson} />)
          ) : unlockedLessons.length === 0 ? (
            <div className="col-span-full text-center py-16 md:py-24 bg-slate-50 rounded-[2.5rem] md:rounded-[3rem] border border-slate-100 px-4">
              <p className="text-slate-400 font-bold text-[14px] md:text-[15px]">No lessons available yet</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}