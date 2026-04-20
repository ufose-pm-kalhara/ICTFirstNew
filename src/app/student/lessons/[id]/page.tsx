'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Play, FileText, Download, ChevronLeft, Lock, Info, Video, UserCheck } from 'lucide-react';

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
  email: string; // Added email for verification
}

const getEmbedUrl = (url: string | null) => {
  if (!url) return "";
  const trimUrl = url.trim();
  if (trimUrl.includes("drive.google.com")) return trimUrl.replace(/\/view.*|\/edit.*/, "/preview");
  
  let videoId = "";
  if (trimUrl.includes("v=")) videoId = trimUrl.split("v=")[1].split("&")[0];
  else if (trimUrl.includes("youtu.be/")) videoId = trimUrl.split("youtu.be/")[1].split("?")[0];
  else if (trimUrl.includes("youtube.com/live/")) videoId = trimUrl.split("live/")[1].split("?")[0];
  else if (trimUrl.includes("embed/")) {
    // Ensure parameters for private videos are maintained
    return `${trimUrl}${trimUrl.includes('?') ? '&' : '?'}rel=0&modestbranding=1&autoplay=1`;
  }
  
  // For private videos, YouTube requires the embed to be from the /embed/ path
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
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const brandGradient = 'linear-gradient(135deg, #2B6390 0%, #1A5783 100%)';

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

  useEffect(() => {
    if (lesson) {
      const viewKey = `view_count_${lesson.id}_part_${selectedIndex}_v${lesson.reset_token || 0}`;
      const current = parseInt(localStorage.getItem(viewKey) || '0', 10);
      setViewCount(current);
      setIsBlocked(current >= 3);
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
    <div className="min-h-screen flex items-center justify-center font-black text-[#1A5783] animate-pulse italic uppercase tracking-widest">ICTFIRST.lk</div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 select-none">
      <div className="bg-white border-b border-slate-100 sticky top-0 z-[60] px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-slate-400 font-bold text-[13px] uppercase tracking-wider hover:text-[#1A5783] transition-colors">
            <ChevronLeft size={20} /> Back to Hub
          </button>
          <div className="flex items-center gap-4">
            <div className={`px-4 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-tight ${viewCount >= 3 ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-[#1A5783]'}`}>
              Part {selectedIndex + 1} • {3 - viewCount} Views Left
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <div className="lg:col-span-8">
            {videoList.length > 0 ? (
              <div className="relative w-full aspect-video bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl mb-10 border-[6px] border-white ring-1 ring-slate-200">
                {!isBlocked ? (
                  hasStarted ? (
                    <div className="relative w-full h-full">
                      <iframe 
                        key={videoList[selectedIndex].url}
                        src={getEmbedUrl(videoList[selectedIndex].url)} 
                        className="w-full h-full border-none" 
                        allowFullScreen 
                        allow="autoplay; encrypted-media" 
                      />
                      <div className="absolute z-[100] pointer-events-none text-white/10 mix-blend-overlay" style={{ top: corners[cornerIndex].top, left: corners[cornerIndex].left }}>
                        <p className="font-black text-[14px] uppercase leading-none tracking-tighter">{user?.full_name}</p>
                        <p className="font-bold text-[10px] tracking-widest mt-1 opacity-50">{user?.student_id}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950">
                      <div className="mb-6 flex flex-col items-center">
                      
                        <button 
                            onClick={handleStartVideo} 
                            style={{ background: brandGradient }}
                            className="w-24 h-24 rounded-full flex items-center justify-center shadow-3xl hover:scale-110 transition-all group"
                        >
                            <Play fill="white" className="text-white ml-1 group-hover:scale-110 transition-transform" size={40} />
                        </button>
                      </div>
                      <p className="text-white/40 font-bold uppercase tracking-[0.3em] text-[11px] mt-2">Initialize {videoList[selectedIndex].desc}</p>
                      <p className="text-white/20 text-[9px] mt-4 max-w-xs text-center px-6 italic">Ensure you are logged into YouTube with your registered email to bypass privacy restrictions.</p>
                    </div>
                  )
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-white p-10 text-center">
                    <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mb-6">
                        <Lock size={40} className="text-red-500" />
                    </div>
                    <h2 className="text-3xl font-black uppercase tracking-tight">Access Exhausted</h2>
                    <p className="text-slate-400 text-sm font-medium mt-3 max-w-xs">You have utilized all 3 permitted views for this part. Please contact the administrator for a reset.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-blue-50/50 border-2 border-dashed border-blue-100 rounded-[2.5rem] p-16 text-center mb-10">
                <Video size={48} className="mx-auto text-blue-200 mb-4" />
                <p className="text-blue-400 font-bold uppercase text-[12px] tracking-widest">No Video Content Uploaded</p>
              </div>
            )}

            <div className="flex gap-2 p-1.5 bg-slate-200/50 rounded-2xl mb-8 w-fit backdrop-blur-sm">
              <button 
                onClick={() => setActiveTab('video')} 
                className={`px-8 py-2.5 rounded-xl text-[12px] font-bold uppercase tracking-wider transition-all ${activeTab === 'video' ? 'bg-white text-[#1A5783] shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Curriculum
              </button>
              <button 
                onClick={() => setActiveTab('notes')} 
                className={`px-8 py-2.5 rounded-xl text-[12px] font-bold uppercase tracking-wider transition-all ${activeTab === 'notes' ? 'bg-white text-[#1A5783] shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Study Notes
              </button>
            </div>

            {activeTab === 'video' ? (
              <div className="space-y-8">
                <div>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-none mb-6">{lesson.title}</h1>
                    <div className="bg-[#F0F5FA] inline-block px-4 py-2 rounded-xl text-[#1A5783] font-bold text-sm mb-6">Grade {lesson.grade} Module</div>
                    <p className="text-slate-500 text-[16px] leading-relaxed font-medium max-w-3xl">{lesson.description || "In-depth module covering core ICT principles and practical applications for this session."}</p>
                </div>
                
                {videoList.length > 1 && (
                  <div className="mt-12">
                    <h3 className="text-[12px] font-bold uppercase text-slate-400 tracking-widest mb-6">Module Breakdown</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {videoList.map((item, idx) => (
                        <button 
                          key={idx} 
                          onClick={() => setSelectedIndex(idx)} 
                          className={`p-5 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${selectedIndex === idx ? 'border-[#1A5683] bg-white shadow-xl' : 'border-slate-100 bg-white hover:border-slate-200 opacity-60'}`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${selectedIndex === idx ? 'bg-[#1A5683] text-white' : 'bg-slate-100 text-slate-400'}`}>
                            {idx + 1}
                          </div>
                          <div>
                            <p className={`font-bold text-[14px] ${selectedIndex === idx ? 'text-slate-900' : 'text-slate-500'}`}>{item.desc}</p>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">Part {idx + 1}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white p-10 md:p-14 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 opacity-50"></div>
                <h3 className="font-black uppercase text-[12px] tracking-widest mb-8 text-[#1A5683] flex items-center gap-2">
                    <FileText size={16} /> Lecture Summary
                </h3>
                <div className="prose prose-slate max-w-none text-slate-600 font-medium text-[16px] leading-loose whitespace-pre-wrap">
                    {lesson.notes || "Comprehensive study notes are being finalized for this lesson."}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-4">
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm sticky top-32">
              <h3 className="font-black text-slate-900 uppercase text-[13px] tracking-wider mb-8 flex items-center gap-2">
                <Download size={18} className="text-[#1A5683]" /> Downloadables
              </h3>
              {materialList.length > 0 ? (
                <div className="space-y-4">
                  {materialList.map((mid, idx) => (
                    <a 
                      key={idx} 
                      href={`/api/admin/content?fileId=${mid}`} 
                      download 
                      className="flex items-center justify-between p-5 bg-[#F8FAFC] rounded-2xl border border-transparent hover:border-[#1A5683] hover:bg-white hover:shadow-lg transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-red-400 group-hover:scale-110 transition-transform">
                            <FileText size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-[14px]">Lesson PDF {idx + 1}</p>
                          <p className="text-[11px] text-slate-400 font-bold uppercase">Study Material</p>
                        </div>
                      </div>
                      <div className="w-10 h-10 bg-white border border-slate-100 group-hover:bg-[#1A5683] group-hover:text-white group-hover:border-transparent rounded-xl flex items-center justify-center transition-all">
                        <Download size={18} />
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-slate-50 rounded-3xl">
                    <p className="text-slate-300 font-bold text-[13px] uppercase tracking-widest">No Documents</p>
                </div>
              )}
              
              <div className="mt-10 p-5 bg-orange-50 rounded-2xl border border-orange-100">
                <div className="flex items-center gap-2 text-orange-600 mb-2">
                    <Info size={16} />
                    <p className="font-bold text-[12px] uppercase">Playback Security</p>
                </div>
                <p className="text-orange-700/70 text-[12px] font-medium leading-snug">
                Each video part is limited to 3 views. Closing the tab or refreshing will count as a view.<br></br> <span className="text-orange-700/70 text-[12px] font-medium leading-snug">
                    This video is set to private. If you see an access error, ensure you are logged into your Google account in this browser.</span>
                    <br></br> <span className="text-orange-700/70 text-[12px] font-medium leading-snug">
                  සෑම වීඩියෝ කොටසකටම නැරඹීම් වාර 3කට පමණක් සීමා වේ. tab වසා දැමීම හෝ පිටුව නැවත refresh කිරීමද එක් නැරඹීමක් ලෙස ගණනය කරනු ලබනව.</span>
                  <br></br> <span className="text-orange-700/70 text-[12px] font-medium leading-snug">
                  මෙම වීඩියෝව පෞද්ගලික ලෙස සකසා ඇත. ඔබට ප්‍රවේශ දෝෂයක් පෙනෙන්නේ නම්, ඔබ මෙම බ්‍රව්සරයේ ඔබගේ Google ගිණුමට පුරනය වී ඇති බවට වග බලා ගන්න.</span>
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center border-b border-slate-50 pb-2">
      <span className="text-xs font-bold text-slate-400 uppercase">{label}</span>
      <span className="text-sm font-semibold text-slate-700">{value}</span>
    </div>
  );
}