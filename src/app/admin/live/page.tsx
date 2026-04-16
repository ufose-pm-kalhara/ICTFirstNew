'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Video, 
  Link as LinkIcon, 
  Plus, 
  Edit3, 
  Trash2, 
  X, 
  AlertCircle, 
  CheckCircle2,
  Calendar,
  Clock
} from 'lucide-react';

interface Lesson {
  id: number;
  title: string;
  month: string;
  grade: number;
}

interface LiveSession {
  id: number;
  title: string;
  month: string;
  grade: number;
  url: string;
  announcement: string;
  class_date: string; // New field
  class_time: string; // New field
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
    id: null as number | null,
    title: '',
    url: '',
    announcement: '',
    class_date: '',
    class_time: '',
    lesson_id: '', 
  });

  const fetchData = useCallback(async () => {
    try {
      const [liveRes, lessonRes] = await Promise.all([
        fetch('/api/admin/live?all=true'),
        fetch('/api/admin/lessons') 
      ]);
      
      if (!liveRes.ok || !lessonRes.ok) {
        throw new Error(`Server Error: Live(${liveRes.status}) Lessons(${lessonRes.status})`);
      }

      const liveData = await liveRes.json();
      const lessonData = await lessonRes.json();

      if (liveData.success) setSessions(liveData.sessions || []);
      if (lessonData.success) setLessons(lessonData.lessons || []);
    } catch (err) {
      console.error("Fetch Error:", err);
      setError("Failed to load data.");
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const openCreateModal = () => {
    setForm({ id: null, title: '', url: '', announcement: '', class_date: '', class_time: '', lesson_id: '' });
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
      class_date: session.class_date || '',
      class_time: session.class_time || '',
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
      if (res.ok) fetchData();
    } catch (err) { console.error(err); }
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
    <div className="font-sans text-slate-900">
      <header className="flex flex-col md:flex-row justify-between items-center md:items-end mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Live Studio</h1>
          <p className="text-slate-500 font-medium mt-1">Manage single-access live sessions linked to recorded content.</p>
        </div>
        <button 
          onClick={openCreateModal}
          className="bg-[#2563EB] text-white px-6 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-blue-700 transition-all shadow-md shadow-blue-100 active:scale-95"
        >
          <Plus size={18} />
          Create Live Session
        </button>
      </header>

      {/* LIST SECTION */}
      <div className="grid gap-4">
        {sessions.length > 0 ? sessions.map((s) => (
          <div key={s.id} className="p-5 bg-white rounded-3xl border border-slate-100 flex justify-between items-center group hover:border-blue-200 hover:shadow-sm transition-all">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex flex-col items-center justify-center text-[#2563EB] group-hover:bg-blue-50 transition-colors">
                <Calendar size={18} strokeWidth={2.5} />
                <span className="text-[10px] font-bold uppercase tracking-tighter mt-0.5">{s.month?.slice(0,3) || 'LIVE'}</span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg tracking-tight leading-none mb-2">{s.title}</h3>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg uppercase tracking-wider flex items-center gap-1">
                    <LinkIcon size={10} />
                    {lessons.find(l => l.id === s.lesson_id)?.title || 'Unlinked'}
                  </span>
                  {s.class_date && (
                    <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1 uppercase tracking-wider">
                      <Clock size={12} />
                      {s.class_date} @ {s.class_time}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleEdit(s)} className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm">
                <Edit3 size={18} />
              </button>
              <button onClick={() => handleDelete(s.id)} className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-red-500 hover:border-red-100 transition-all shadow-sm">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        )) : (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
            <Video size={40} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No Linked Sessions Found</p>
          </div>
        )}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-3xl rounded-[2.5rem] shadow-2xl relative animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{form.id ? 'Edit Session' : 'Setup Live Class'}</h2>
                <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mt-1">Cross-link live links to course modules</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-900 transition-all">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto text-slate-600">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase text-blue-600 tracking-wider">Parent Recorded Lesson</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                  value={form.lesson_id}
                  onChange={e => setForm({...form, lesson_id: e.target.value})}
                  required
                >
                  <option value="">-- Link to a payment module --</option>
                  {lessons.map(l => (
                    <option key={l.id} value={l.id}>{l.title} (G-{l.grade} • {l.month})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Display Name</label>
                  <input type="text" placeholder="Live Q&A Session" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-semibold outline-none" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Meeting URL</label>
                  <input type="text" placeholder="https://zoom.us/j/..." className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-semibold outline-none border-dashed" value={form.url} onChange={e => setForm({...form, url: e.target.value})} />
                </div>
              </div>

              {/* DATE AND TIME PICKERS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Class Date</label>
                  <input type="date" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-semibold outline-none" value={form.class_date} onChange={e => setForm({...form, class_date: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Class Time</label>
                  <input type="time" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-semibold outline-none" value={form.class_time} onChange={e => setForm({...form, class_time: e.target.value})} required />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Announcement</label>
                <textarea rows={3} placeholder="Important notes for students..." className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-semibold outline-none resize-none" value={form.announcement} onChange={e => setForm({...form, announcement: e.target.value})} />
              </div>

              {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs font-bold flex items-center gap-2">
                  <AlertCircle size={14} /> {error}
                </div>
              )}
              {success && (
                <div className="p-4 bg-green-50 text-green-600 rounded-xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 size={14} /> {success}
                </div>
              )}
            </form>

            <div className="p-8 border-t border-slate-50">
              <button 
                onClick={handleSubmit}
                disabled={loading} 
                className="w-full bg-[#2563EB] text-white py-4 rounded-2xl font-bold uppercase text-xs tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                {loading ? 'Processing...' : (form.id ? 'Update Connection' : 'Save & Link Live Class')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}