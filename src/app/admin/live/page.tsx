'use client';

import { useState, useEffect, useCallback } from 'react';

// Define what a Lesson (Recorded Content) looks like
interface Lesson {
  id: number;
  title: string;
  month: string;
  grade: number;
}

// Define what a Live Session looks like
interface LiveSession {
  id: number;
  title: string;
  month: string;
  grade: number;
  url: string;
  announcement: string;
  lesson_id?: number; 
}

export default function LiveClassManager() {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [form, setForm] = useState({
    id: null as number | null, // Track for editing
    title: '',
    url: '',
    announcement: '',
    lesson_id: '', 
  });

  // --- FETCH BOTH SESSIONS AND LESSONS ---
  const fetchData = useCallback(async () => {
    try {
      const [liveRes, lessonRes] = await Promise.all([
        fetch('/api/admin/live?all=true'),
        fetch('/api/admin/lessons') 
      ]);
      
      // Prevent JSON errors by checking if response is OK (not HTML 404/500)
      if (!liveRes.ok || !lessonRes.ok) {
        throw new Error(`Server Error: Live(${liveRes.status}) Lessons(${lessonRes.status})`);
      }

      const liveData = await liveRes.json();
      const lessonData = await lessonRes.json();

      if (liveData.success) setSessions(liveData.sessions || []);
      if (lessonData.success) setLessons(lessonData.lessons || []);
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Failed to load data. Ensure API routes are returning valid JSON.");
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- HANDLERS ---
  const openCreateModal = () => {
    setForm({ id: null, title: '', url: '', announcement: '', lesson_id: '' });
    setError(null);
    setSuccess(null);
    setIsModalOpen(true);
  };

  const handleEdit = (session: LiveSession) => {
    setForm({
      id: session.id,
      title: session.title,
      url: session.url,
      announcement: session.announcement,
      lesson_id: session.lesson_id?.toString() || '',
    });
    setError(null);
    setSuccess(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this live link?")) return;
    try {
      const res = await fetch(`/api/admin/live?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      } else {
        alert("Delete failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.lesson_id) {
        setError("Please select a lesson to link this live session to.");
        return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      // Handle cases where server might return HTML instead of JSON
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response. Check API route.");
      }

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess("Saved successfully!");
        fetchData();
        setTimeout(() => setIsModalOpen(false), 1000);
      } else {
        setError(data.message || "Something went wrong.");
      }
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : "Network error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 min-h-screen bg-slate-50/30 font-sans">
      <header className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 gap-6">
        <div>
          <h1 className="text-6xl font-black italic uppercase text-slate-900 tracking-tighter">Live Studio</h1>
          <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] mt-2">Link Live Classes to Lessons for Single Payment Access</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#1A5683] transition-all shadow-xl active:scale-95"
        >
          + Create Linked Live Session
        </button>
      </header>

      {/* ERROR DISPLAY */}
      {error && !isModalOpen && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase border border-red-100">
          ⚠️ {error}
        </div>
      )}

      {/* LIST SECTION */}
      <div className="grid gap-4">
        {sessions.length > 0 ? sessions.map((s) => (
          <div key={s.id} className="p-6 bg-white rounded-[2.5rem] border border-slate-100 flex justify-between items-center shadow-sm group hover:shadow-lg transition-all">
            <div className="flex items-center gap-6">
              <div className="text-sm font-black text-[#1A5683] bg-blue-50 px-4 py-3 rounded-2xl uppercase">
                {s.month?.slice(0,3) || 'LIVE'}
              </div>
              <div>
                <h3 className="font-black text-slate-800 uppercase italic text-lg tracking-tight">{s.title}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Linked to: <span className="text-blue-600 underline">
                    {lessons.find(l => l.id === s.lesson_id)?.title || 'Unlinked Lesson'}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleEdit(s)} className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 transition-all">✏️</button>
              <button onClick={() => handleDelete(s.id)} className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all">🗑️</button>
            </div>
          </div>
        )) : (
            <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                <p className="text-slate-300 font-black uppercase text-xs tracking-widest">No Linked Sessions Found</p>
            </div>
        )}
      </div>

      {/* POPUP MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-3xl rounded-[3.5rem] p-12 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-black italic uppercase text-slate-900 leading-none">Session Details</h2>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">Linking live link to specific month&apos;s material</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center font-bold text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all">✕</button>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-[10px] font-black uppercase border border-red-100">
                ⚠️ {error}
              </div>
            )}
            
            {success && (
              <div className="mb-6 p-4 bg-green-50 text-green-600 rounded-2xl text-[10px] font-black uppercase border border-green-100">
                ✅ {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* LESSON SELECTOR */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-[#1A5683] ml-4 tracking-tighter">Attach to Recorded Lesson (Required for Payment Access)</label>
                <select 
                  className="w-full bg-blue-50/50 rounded-2xl p-5 font-bold outline-none border-2 border-blue-100 focus:border-[#1A5683] transition-colors"
                  value={form.lesson_id}
                  onChange={e => setForm({...form, lesson_id: e.target.value})}
                  required
                >
                  <option value="">-- Choose a recorded lesson --</option>
                  {lessons.map(l => (
                    <option key={l.id} value={l.id}>{l.title} (Grade {l.grade} - {l.month})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Display Name</label>
                    <input type="text" placeholder="e.g. Unit 05 Live Discussion" className="w-full bg-slate-50 rounded-2xl p-5 font-bold outline-none focus:ring-2 ring-blue-100" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Zoom Meeting Link</label>
                    <input type="text" placeholder="https://zoom.us/j/..." className="w-full bg-slate-50 rounded-2xl p-5 font-bold outline-none border-2 border-dashed border-slate-200" value={form.url} onChange={e => setForm({...form, url: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Announcement / Special Instructions</label>
                <textarea rows={3} placeholder="Tell students when to join or what to bring..." className="w-full bg-slate-50 rounded-[2rem] p-6 font-bold outline-none resize-none" value={form.announcement} onChange={e => setForm({...form, announcement: e.target.value})} />
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full bg-[#1A5683] text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] shadow-xl hover:bg-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : (form.id ? 'Update Linked Session' : 'Save & Link Live Class')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}