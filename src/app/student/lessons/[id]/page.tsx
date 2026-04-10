'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Play, FileText, Download, ChevronLeft, Lock, Info, Video } from 'lucide-react';

interface VideoItem {
  url: string;
  desc: string;
}

interface Lesson {
  id: number;
  title: string;
  grade: number;
  video_url: string | null;
  description: string | null;
  notes: string | null;
  material_id: string | null;
  reset_token: number;
}

interface User {
  full_name: string;
  student_id: string;
}

const getEmbedUrl = (url: string | null) => {
  if (!url) return "";
  const trimUrl = url.trim();
  if (trimUrl.includes("drive.google.com")) return trimUrl.replace(/\/view.*|\/edit.*/, "/preview");
  let videoId = "";
  if (trimUrl.includes("v=")) videoId = trimUrl.split("v=")[1].split("&")[0];
  else if (trimUrl.includes("youtu.be/")) videoId = trimUrl.split("youtu.be/")[1].split("?")[0];
  else if (trimUrl.includes("youtube.com/live/")) videoId = trimUrl.split("live/")[1].split("?")[0];
  else if (trimUrl.includes("embed/")) return `${trimUrl}?rel=0&modestbranding=1&autoplay=1`;
  return videoId ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=1` : trimUrl;
};

export default function LessonDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [viewCount, setViewCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [isBlocked, setIsBlocked] = useState<boolean>(false);
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'video' | 'notes'>('video');
  
  // Track selected index instead of just the URL to manage separate views
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const videoList = useMemo((): VideoItem[] => {
    if (!lesson?.video_url) return [];
    try {
      if (lesson.video_url.trim().startsWith('[')) return JSON.parse(lesson.video_url);
      return lesson.video_url.split(',').map(v => ({ url: v.trim(), desc: "Video Module" })).filter(v => v.url !== "");
    } catch (e) { return []; }
  }, [lesson?.video_url]);

  const materialList = useMemo(() => {
    if (!lesson?.material_id) return [];
    return lesson.material_id.split(',').map(m => m.trim()).filter(m => m !== "");
  }, [lesson?.material_id]);

  // NEW: Logic to refresh view counts whenever the lesson OR the selected part changes
  useEffect(() => {
    if (lesson) {
      const viewKey = `view_count_${lesson.id}_part_${selectedIndex}_v${lesson.reset_token || 0}`;
      const current = parseInt(localStorage.getItem(viewKey) || '0', 10);
      setViewCount(current);
      setIsBlocked(current >= 3);
      // Reset video "start" state when switching parts
      setHasStarted(false); 
    }
  }, [lesson, selectedIndex]);

  const corners = [{ top: '5%', left: '5%' }, { top: '5%', left: '75%' }, { top: '80%', left: '75%' }, { top: '80%', left: '5%' }];
  const [cornerIndex, setCornerIndex] = useState(0);

  useEffect(() => {
    if (hasStarted) {
      const moveInterval = setInterval(() => {
        setCornerIndex((prev) => (prev + 1) % corners.length);
      }, 300000); 
      return () => clearInterval(moveInterval);
    }
  }, [hasStarted]);

  const fetchData = useCallback(async () => {
    try {
      const [lessonRes, userRes] = await Promise.all([
        fetch(`/api/student/lessons?t=${Date.now()}`),
        fetch(`/api/student/profile`)
      ]);
      const lessonData = await lessonRes.json();
      const userData = await userRes.json();
      
      if (lessonData.success) {
        const found = lessonData.lessons.find((l: Lesson) => l.id === Number(id));
        if (found) { 
          setLesson(found);
          // Auto-switch to notes if no videos exist
          if (!found.video_url || found.video_url === "[]") setActiveTab('notes');
        }
      }
      if (userData.success) setUser(userData.student);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleStartVideo = () => {
    if (isBlocked || !lesson) return;
    const viewKey = `view_count_${lesson.id}_part_${selectedIndex}_v${lesson.reset_token || 0}`;
    const newCount = viewCount + 1;
    localStorage.setItem(viewKey, newCount.toString());
    setViewCount(newCount);
    if (newCount > 3) setIsBlocked(true); else setHasStarted(true);
  };

  if (loading || !lesson) return (
    <div className="min-h-screen flex items-center justify-center font-black text-[#1A5683] animate-pulse italic uppercase tracking-[0.3em]">ICTFIRST.lk</div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans select-none">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-[60] px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-500 font-bold text-[11px] uppercase tracking-widest hover:text-[#1A5683]">
            <ChevronLeft size={18} /> Back
          </button>
          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${viewCount >= 3 ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
              Part {selectedIndex + 1} Views: {viewCount}/3
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-10 py-6 md:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            {videoList.length > 0 ? (
              <div className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl mb-8 border-4 border-white isolate">
                {!isBlocked ? (
                  hasStarted ? (
                    <div className="relative w-full h-full">
                      <iframe 
                        key={videoList[selectedIndex].url}
                        src={getEmbedUrl(videoList[selectedIndex].url)} 
                        className="w-full h-full border-none" 
                        allowFullScreen 
                        allow="autoplay" 
                      />
                      <div className="absolute inset-0 pointer-events-none z-10" />
                      <div className="absolute z-[100] pointer-events-none text-white/10" style={{ top: corners[cornerIndex].top, left: corners[cornerIndex].left }}>
                        <p className="font-black text-[10px] uppercase leading-none">{user?.full_name}</p>
                        <p className="font-bold text-[8px] tracking-widest mt-1">{user?.student_id}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900">
                      <button onClick={handleStartVideo} className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all">
                        <Play fill="#1A5683" className="text-[#1A5683] ml-1" size={32} />
                      </button>
                      <p className="text-white font-black uppercase italic tracking-[0.2em] text-[10px] mt-6">Watch {videoList[selectedIndex].desc}</p>
                    </div>
                  )
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-white p-6 text-center">
                    <Lock size={48} className="text-red-500 mb-4" />
                    <h2 className="text-2xl font-black uppercase italic tracking-tighter">Part Limit Reached</h2>
                    <p className="opacity-60 text-[10px] font-bold uppercase mt-2">Contact Mrs. Dinushika for a view reset.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-blue-50 border-2 border-dashed border-blue-200 rounded-3xl p-12 text-center mb-8">
                <Video size={40} className="mx-auto text-blue-300 mb-4" />
                <p className="text-blue-500 font-black uppercase text-[11px] tracking-widest">No Video Tutorial</p>
              </div>
            )}

            <div className="flex gap-2 p-1 bg-slate-200/50 rounded-2xl mb-6 w-fit">
              <button onClick={() => setActiveTab('video')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'video' ? 'bg-white text-[#1A5683] shadow-sm' : 'text-slate-500'}`}>Content</button>
              <button onClick={() => setActiveTab('notes')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'notes' ? 'bg-white text-[#1A5683] shadow-sm' : 'text-slate-500'}`}>Notes</button>
            </div>

            {activeTab === 'video' ? (
              <div className="space-y-6">
                <h1 className="text-3xl md:text-5xl font-black text-slate-900 uppercase italic tracking-tighter leading-none mb-4">{lesson.title}</h1>
                <p className="text-slate-500 text-sm md:text-base font-medium">{lesson.description || "Learn the fundamentals of this lesson."}</p>
                
                {videoList.length > 1 && (
                  <div className="mt-8">
                    <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mb-4">Select Video Part</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {videoList.map((item, idx) => (
                        <button key={idx} onClick={() => setSelectedIndex(idx)} className={`p-4 rounded-2xl border-2 text-left transition-all ${selectedIndex === idx ? 'border-[#1A5683] bg-blue-50 text-[#1A5683]' : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'}`}>
                          <p className="font-black text-[10px] uppercase">Part {idx + 1}</p>
                          <p className="text-[11px] font-bold text-slate-600 uppercase mt-1 truncate">{item.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h3 className="font-black uppercase text-[11px] tracking-[0.2em] mb-6 text-[#1A5683]">Instructor Notes</h3>
                <div className="prose prose-slate max-w-none text-slate-700 font-medium whitespace-pre-wrap">{lesson.notes || "No notes provided."}</div>
              </div>
            )}
          </div>

          <div className="lg:col-span-4">
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm sticky top-28">
              <h3 className="font-black text-slate-900 uppercase text-[11px] tracking-[0.2em] mb-8">Study Material</h3>
              {materialList.length > 0 ? (
                <div className="space-y-3">
                  {materialList.map((mid, idx) => (
                    <a key={idx} href={`/api/admin/content?fileId=${mid}`} download className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-[#1A5683] transition-all group">
                      <div>
                        <p className="font-black text-slate-800 text-[10px] uppercase italic">Download Note {idx + 1}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">PDF File</p>
                      </div>
                      <div className="w-10 h-10 bg-white group-hover:bg-[#1A5683] group-hover:text-white rounded-xl flex items-center justify-center transition-all"><Download size={16} /></div>
                    </a>
                  ))}
                </div>
              ) : <p className="text-center text-slate-300 font-black text-[10px] uppercase py-10">No PDFs Available</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}