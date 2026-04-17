'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';

// --- TYPES ---
interface Lesson {
  id: number;
  title: string;
  grade: number;
  video_url: string | null;
  description: string | null;
  notes: string | null;
  material_id: number | null;
  created_at: string;
}

interface Payment {
  id: number;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  lesson_id: number | null;
  billing_month: string;
}

type SortOption = 'newest' | 'oldest' | 'az' | 'favorites';

export default function LessonsPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null); 
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  
  const [paymentMap, setPaymentMap] = useState<Record<number, string>>({});
  const [generalStatus, setGeneralStatus] = useState<string>('no_history');
  const [showPendingModal, setShowPendingModal] = useState<boolean>(false);

  // Brand Palette
  const brandGradient = 'linear-gradient(135deg, #2B6390 0%, #1A5783 100%)';

  const initData = useCallback(async () => {
    try {
      const [lessonsRes, payRes] = await Promise.all([
        fetch('/api/student/lessons'),
        fetch('/api/student/payments')
      ]);

      const lessonsData = await lessonsRes.json();
      const payData = await payRes.json();

      if (lessonsData.success) setLessons(lessonsData.lessons as Lesson[]);
      
      if (payData.success && payData.payments) {
        const mapping: Record<number, string> = {};
        let latestGeneral = 'no_history';

        payData.payments.forEach((p: Payment) => {
          if (p.lesson_id) {
            if (!mapping[p.lesson_id]) mapping[p.lesson_id] = p.status;
          } else {
            if (latestGeneral === 'no_history') latestGeneral = p.status;
          }
        });
        setPaymentMap(mapping);
        setGeneralStatus(latestGeneral);
      }
    } catch (err) {
      console.error("Data fetch failed:", err);
    } finally {
      setLoading(false);
    }

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ict_bookmarks');
      if (saved) setBookmarks(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    initData();
  }, [initData]);

  const checkAccess = (lessonId: number) => {
    if (generalStatus === 'approved') return 'approved';
    return paymentMap[lessonId] || 'no_history';
  };

  const handleLessonClick = (status: string, e: React.MouseEvent) => {
    if (status === 'pending') {
      e.preventDefault();
      setShowPendingModal(true);
    }
  };

  const toggleBookmark = (id: number) => {
    setBookmarks((prev) => {
      const updated = prev.includes(id) ? prev.filter((bId) => bId !== id) : [...prev, id];
      localStorage.setItem('ict_bookmarks', JSON.stringify(updated));
      return updated;
    });
  };

  const unlockedLessons = useMemo(() => {
    return lessons.filter(l => checkAccess(l.id) === 'approved');
  }, [lessons, paymentMap, generalStatus]);

  const filteredAndSorted = useMemo(() => {
    const filtered = lessons.filter((l) => {
      const matchesSearch = l.title.toLowerCase().includes(searchQuery.toLowerCase());
      if (sortBy === 'favorites') {
        return bookmarks.includes(l.id) && matchesSearch;
      }
      const matchesGrade = selectedGrade === null ? true : l.grade === selectedGrade;
      return matchesGrade && matchesSearch;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortBy === 'az') return a.title.localeCompare(b.title);
      return 0;
    });
  }, [lessons, selectedGrade, searchQuery, sortBy, bookmarks]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white font-black text-[#1A5783] italic text-2xl uppercase tracking-widest">
      ICTFIRST.lk
    </div>
  );

  const LessonCard = ({ lesson }: { lesson: Lesson }) => {
    const status = checkAccess(lesson.id);
    const lessonHasAccess = status === 'approved';
    const lessonIsPending = status === 'pending';
    const isBookmarked = bookmarks.includes(lesson.id);

    return (
      <div className="bg-white rounded-[2rem] p-7 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-blue-900/5 transition-all group flex flex-col relative overflow-hidden">
        
        {/* Bookmark Button */}
        <button 
          onClick={() => toggleBookmark(lesson.id)}
          className={`absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 z-20 outline-none
            ${isBookmarked ? 'bg-red-50 text-red-500 scale-110' : 'bg-slate-50 text-slate-300 hover:text-red-400 hover:bg-red-50'}
          `}
        >
          <span className="text-xl leading-none select-none">
            {isBookmarked ? '❤️' : '🤍'}
          </span>
        </button>

        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-2xl ${lessonHasAccess ? 'bg-[#F0F5FA] text-[#1A5783]' : 'bg-orange-50 text-orange-500'}`}>
          {lessonHasAccess ? '🎬' : '🔒'}
        </div>
        
        <h3 className="font-bold text-slate-800 mb-3 leading-snug flex-grow text-[16px]">
          {lesson.title}
        </h3>
        
        <p className={`text-[11px] font-bold uppercase tracking-wider mb-8 ${!lessonHasAccess ? 'text-orange-500' : 'text-slate-400'}`}>
          Grade {lesson.grade} • {lessonHasAccess ? 'Ready to Watch' : (lessonIsPending ? 'Audit in Progress' : 'Locked')}
        </p>

        <div className="flex flex-col gap-3">
          {lessonHasAccess ? (
            <Link 
              href={`/student/lessons/${lesson.id}`}
              style={{ background: brandGradient }}
              className="w-full py-3.5 text-white rounded-xl text-[14px] font-bold text-center shadow-lg shadow-blue-900/10 hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              Start Learning
            </Link>
          ) : (
            <Link 
              href={`/student/payments?lessonId=${lesson.id}`}
              onClick={(e) => handleLessonClick(status, e)}
              className="w-full py-3.5 bg-slate-50 text-slate-400 border border-slate-100 rounded-xl text-[14px] font-bold text-center hover:bg-orange-50 hover:text-orange-600 hover:border-orange-100 transition-all flex items-center justify-center gap-2"
            >
              {lessonIsPending ? 'Reviewing Slip...' : 'Get Access 🔒'}
            </Link>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 select-none relative">
      
      {showPendingModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-6">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl border border-blue-50 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-3xl flex items-center justify-center mb-8 rotate-3">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-4">Verification Underway</h3>
            <p className="text-sm font-semibold text-[#1A5683] mb-8 bg-[#F0F5FA] p-5 rounded-2xl leading-relaxed">We are currently auditing your payment slip. The lesson content will be available as soon as our team confirms the transaction.</p>
            <button onClick={() => setShowPendingModal(false)} className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl text-[13px] uppercase tracking-widest hover:bg-[#1A5783] transition-all shadow-xl">Back to Lessons</button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="pt-10 mb-16">
          <div 
            className="rounded-[3rem] p-10 md:p-16 text-white shadow-2xl relative overflow-hidden"
            style={{ background: brandGradient }}
          >
            {/* Decorative BG element */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>

            <div className="relative z-10 max-w-xl">
              <h1 className="text-4xl md:text-5xl font-black mb-6 tracking-tight uppercase leading-tight">
                {selectedGrade ? `Grade ${selectedGrade}` : 'All'} <br/> Curriculum Modules
              </h1>
              <div className="flex flex-wrap gap-4 mt-8">
                <button
                  onClick={() => { setSelectedGrade(null); setSearchQuery(''); }}
                  className={`px-8 py-3.5 rounded-2xl font-bold text-[13px] uppercase tracking-wider transition-all border-2 ${
                    selectedGrade === null ? 'bg-white text-[#1A5783] border-white shadow-xl scale-105' : 'bg-transparent text-white border-white/20 hover:border-white'
                  }`}
                >
                  All Grades
                </button>
                {[10, 11].map((g) => (
                  <button
                    key={g}
                    onClick={() => { setSelectedGrade(g); setSearchQuery(''); }}
                    className={`px-8 py-3.5 rounded-2xl font-bold text-[13px] uppercase tracking-wider transition-all border-2 ${
                      selectedGrade === g ? 'bg-white text-[#1A5783] border-white shadow-xl scale-105' : 'bg-transparent text-white border-white/20 hover:border-white'
                    }`}
                  >
                    Grade {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {unlockedLessons.length > 0 && sortBy !== 'favorites' && (
          <div className="mb-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-6 w-1 rounded-full bg-green-500"></div>
              <h2 className="text-[14px] font-bold uppercase tracking-widest text-slate-800">My Unlocked Lessons</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {unlockedLessons.map(lesson => (
                <LessonCard key={`unlocked-${lesson.id}`} lesson={lesson} />
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                {sortBy === 'favorites' ? '❤️ My Bookmarks' : (selectedGrade ? `Grade ${selectedGrade} Content` : 'All Available Modules')}
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-4">
            <input 
              type="text" 
              placeholder="Search by topic..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-72 px-6 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none focus:ring-4 focus:ring-[#1A5783]/5 font-semibold text-sm"
            />
            <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-white border border-slate-100 px-6 py-4 rounded-2xl shadow-sm outline-none font-bold text-[12px] uppercase tracking-wider text-[#1A5783] cursor-pointer"
            >
                <option value="newest">Latest Uploads</option>
                <option value="oldest">Oldest First</option>
                <option value="az">Alphabetical</option>
                <option value="favorites">Favorites ❤️</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredAndSorted.length > 0 ? (
            filteredAndSorted.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} />
            ))
          ) : (
            <div className="col-span-full py-32 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm">
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[13px]">
                {sortBy === 'favorites' ? 'You haven\'t bookmarked any lessons yet' : 'No lessons matching your criteria'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}