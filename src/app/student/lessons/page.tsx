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
    <div className="min-h-screen flex items-center justify-center bg-white font-black text-[#1A5683] italic text-2xl uppercase tracking-tighter">
      ICTFIRST.lk
    </div>
  );

  const LessonCard = ({ lesson }: { lesson: Lesson }) => {
    const status = checkAccess(lesson.id);
    const lessonHasAccess = status === 'approved';
    const lessonIsPending = status === 'pending';
    const isBookmarked = bookmarks.includes(lesson.id);

    return (
      <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 hover:shadow-2xl transition-all group flex flex-col relative overflow-hidden">
        
        {/* ✅ FIXED BOOKMARK BUTTON */}
        <button 
          onClick={() => toggleBookmark(lesson.id)}
          className={`absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 z-20 outline-none
            ${isBookmarked ? 'bg-red-50 text-red-500 scale-110' : 'bg-slate-50 text-slate-300 hover:text-red-200 hover:bg-red-50/30'}
          `}
        >
          <span className="text-xl leading-none select-none">
            {isBookmarked ? '❤️' : '🤍'}
          </span>
        </button>

        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-[#1A5683] group-hover:text-white transition-colors text-2xl ${lessonHasAccess ? 'bg-[#F8FAFC] text-[#1A5683]' : 'bg-orange-50 text-orange-500'}`}>
          {lessonHasAccess ? '🎬' : '🔒'}
        </div>
        
        <h3 className="font-black text-slate-800 mb-2 leading-tight flex-grow uppercase text-[15px] tracking-tight italic">
          {lesson.title}
        </h3>
        
        <p className={`text-[10px] font-bold uppercase tracking-[0.1em] mb-10 ${!lessonHasAccess ? 'text-orange-500' : 'text-slate-400'}`}>
          Grade {lesson.grade} • {lessonHasAccess ? 'Session Available' : (lessonIsPending ? 'Verification Pending' : 'Access Restricted')}
        </p>

        <div className="flex flex-col gap-3">
          {lessonHasAccess ? (
            <Link 
              href={`/student/lessons/${lesson.id}`}
              className="w-full py-4 bg-[#1A5683] text-white rounded-2xl text-[9px] font-black uppercase tracking-widest text-center shadow-lg hover:bg-slate-900 transition-all flex items-center justify-center gap-2"
            >
              View Lesson <span>⦿</span>
            </Link>
          ) : (
            <Link 
              href={`/student/payments?lessonId=${lesson.id}`}
              onClick={(e) => handleLessonClick(status, e)}
              className="w-full py-4 bg-orange-100 text-orange-600 rounded-2xl text-[9px] font-black uppercase tracking-widest text-center hover:bg-orange-500 hover:text-white transition-all flex items-center justify-center gap-2"
            >
              {lessonIsPending ? 'Verifying Slip...' : 'Unlock Lesson 🔒'}
            </Link>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-20 font-sans select-none relative">
      
      {showPendingModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-6">
          <div className="bg-white rounded-[3rem] p-10 max-w-lg w-full shadow-2xl border border-blue-50 animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-3xl flex items-center justify-center mb-8 rotate-3">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter mb-4">Under Review</h3>
            <p className="text-sm font-bold text-[#1A5683] mb-8 bg-blue-50 p-4 rounded-2xl">Our team is auditing your bank slip. This lesson will unlock as soon as payment is confirmed.</p>
            <button onClick={() => setShowPendingModal(false)} className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl text-xs uppercase tracking-[0.2em] hover:bg-[#1A5683] transition-all">Continue Browsing</button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="pt-10 mb-16">
          <div className="bg-gradient-to-br from-[#1A5683] to-[#2C7CB3] rounded-[3rem] p-10 md:p-16 text-white shadow-2xl relative overflow-hidden">
            <div className="relative z-10 max-w-xl">
              <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tighter uppercase italic leading-none">
                {selectedGrade ? `Grade ${selectedGrade}` : 'All'} <br/> Online Classes
              </h1>
              <div className="flex flex-wrap gap-3 mt-8">
                <button
                  onClick={() => { setSelectedGrade(null); setSearchQuery(''); }}
                  className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${
                    selectedGrade === null ? 'bg-white text-[#1A5683] border-white shadow-xl scale-105' : 'bg-transparent text-white border-white/20 hover:border-white'
                  }`}
                >
                  All Grades
                </button>
                {[10, 11].map((g) => (
                  <button
                    key={g}
                    onClick={() => { setSelectedGrade(g); setSearchQuery(''); }}
                    className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all border-2 ${
                      selectedGrade === g ? 'bg-white text-[#1A5683] border-white shadow-xl scale-105' : 'bg-transparent text-white border-white/20 hover:border-white'
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
            <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-green-500 italic mb-6">✓ My Unlocked Lessons</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {unlockedLessons.map(lesson => (
                <LessonCard key={`unlocked-${lesson.id}`} lesson={lesson} />
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6 px-2">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight italic uppercase">
                {sortBy === 'favorites' ? '❤️ My Bookmarks' : (selectedGrade ? `Grade ${selectedGrade} Modules` : 'All Modules')}
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-4">
            <input 
              type="text" 
              placeholder="Search module..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-72 px-6 py-4 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm outline-none focus:ring-4 focus:ring-[#1A5683]/5 font-bold text-sm"
            />
            <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-white border border-slate-100 px-6 py-4 rounded-[1.5rem] shadow-sm outline-none font-black text-[10px] uppercase tracking-widest text-[#1A5683] cursor-pointer"
            >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="az">A - Z</option>
                <option value="favorites">❤️ Bookmarks</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredAndSorted.length > 0 ? (
            filteredAndSorted.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} />
            ))
          ) : (
            <div className="col-span-full py-32 text-center bg-white rounded-[4rem] border-2 border-dashed border-slate-100">
              <p className="text-slate-300 font-black uppercase tracking-[0.4em] text-xs">
                {sortBy === 'favorites' ? 'No bookmarks found' : 'No lessons found'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}