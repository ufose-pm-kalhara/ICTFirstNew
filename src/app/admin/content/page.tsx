'use client';

import { useState, useEffect, useCallback } from 'react';

interface CombinedLesson {
  id: number;
  title: string;
  grade: number;
  month: string;
  type: string;
  video_url: string | null; 
  description: string | null; 
  notes: string | null;
  material_ids: string | null; // This contains the JSON string of existing files
}

export default function ContentManagement() {
  const [lessons, setLessons] = useState<CombinedLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const lessonTypes = ["Theory", "Revision", "Paper"];
  const grades = ["10", "11", "12", "13"];

  const [form, setForm] = useState({
    title: '',
    grade: '12',
    month: months[new Date().getMonth()],
    type: 'Theory',
    videos: [{ url: '', desc: '' }], 
    mainDescription: '',
    files: [] as { file: File; label: string }[], 
    existingFiles: [] as { id: number; label: string }[], // Track files already in DB
  });

  const fetchLessons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/content');
      const data = await res.json();
      if (data.success) setLessons(data.videos || []);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchLessons(); }, [fetchLessons]);

  const addVideoField = () => setForm({ ...form, videos: [...form.videos, { url: '', desc: '' }] });
  const updateVideo = (index: number, field: 'url' | 'desc', value: string) => {
    const newVideos = [...form.videos];
    newVideos[index][field] = value;
    setForm({ ...form, videos: newVideos });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(f => ({ file: f, label: f.name }));
      setForm({ ...form, files: [...form.files, ...newFiles] });
    }
  };
  
  const updateFileLabel = (index: number, label: string) => {
    const newFiles = [...form.files];
    newFiles[index].label = label;
    setForm({ ...form, files: newFiles });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this entire lesson and all materials?")) return;
    const res = await fetch(`/api/admin/content?id=${id}`, { method: 'DELETE' });
    if (res.ok) fetchLessons();
  };

  const openEditModal = (lesson: CombinedLesson) => {
    let parsedVideos = [{ url: '', desc: '' }];
    let parsedFiles = [];
    try { 
        parsedVideos = JSON.parse(lesson.video_url || '[]'); 
        parsedFiles = JSON.parse(lesson.material_ids || '[]'); // Parse existing PDFs
    } catch(e){}
    
    setEditingId(lesson.id);
    setForm({
      title: lesson.title,
      grade: lesson.grade.toString(),
      month: lesson.month || months[0],
      type: lesson.type || 'Theory',
      videos: parsedVideos.length ? parsedVideos : [{ url: '', desc: '' }],
      mainDescription: lesson.description || '',
      files: [], 
      existingFiles: parsedFiles, // Set existing files here
    });
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    if (editingId) formData.append('id', editingId.toString());
    
    formData.append('title', form.title);
    formData.append('grade', form.grade);
    formData.append('month', form.month);
    formData.append('type', form.type);
    formData.append('description', form.mainDescription);
    formData.append('videoUrls', JSON.stringify(form.videos));
    
    // Send existing files back to API to know which to keep/update labels
    formData.append('existingFiles', JSON.stringify(form.existingFiles));
    
    form.files.forEach((f, i) => {
      formData.append(`files`, f.file);
      formData.append(`label_${i}`, f.label);
    });

    const method = editingId ? 'PUT' : 'POST';
    const res = await fetch('/api/admin/content', { method, body: formData });
    if (res.ok) {
      setIsFormOpen(false);
      fetchLessons();
      alert(editingId ? "Lesson Updated!" : "Lesson Published!");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8 min-h-screen bg-slate-50/30 font-sans">
      <header className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-6xl font-black italic uppercase text-slate-900 tracking-tighter">Vault</h1>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2">Content Management System</p>
        </div>
        <button onClick={() => { setEditingId(null); setIsFormOpen(true); }} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[#1A5683] transition-all shadow-xl">
          + New Lesson
        </button>
      </header>

      <div className="space-y-4">
        {loading ? (
          <div className="animate-pulse text-slate-300 font-black text-3xl italic">LOADING...</div>
        ) : (
          lessons.map((lesson) => (
            <div key={lesson.id} className="p-6 bg-white rounded-[2.5rem] border border-slate-100 flex justify-between items-center group hover:shadow-lg transition-all">
              <div className="flex items-center gap-6">
                <div className="text-sm font-black text-[#1A5683] bg-blue-50 px-4 py-3 rounded-2xl uppercase">
                  {lesson.month ? lesson.month.slice(0, 3) : 'N/A'}
                </div>
                <div>
                  <h3 className="font-black text-slate-800 uppercase italic text-lg tracking-tight">{lesson.title}</h3>
                  <div className="flex gap-2 mt-1">
                    <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase">{lesson.type}</span>
                    <span className="text-[9px] font-black bg-blue-100 text-[#1A5683] px-2 py-0.5 rounded uppercase">Grade {lesson.grade}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEditModal(lesson)} className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 transition-all">✏️</button>
                <button onClick={() => handleDelete(lesson.id)} className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center hover:bg-red-50 hover:text-red-600 transition-all">🗑️</button>
              </div>
            </div>
          ))
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-[3.5rem] p-12 my-auto shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between mb-8">
              <h2 className="text-3xl font-black italic uppercase text-slate-900">{editingId ? 'Edit Lesson' : 'Create Lesson'}</h2>
              <button onClick={() => setIsFormOpen(false)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-red-50 transition-all">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Lesson Header</label>
                  <input type="text" placeholder="Title" className="w-full bg-slate-50 rounded-2xl p-5 font-bold outline-none ring-offset-2 focus:ring-2 ring-blue-100" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
                </div>
                
                <div className="grid grid-cols-3 gap-4 pt-6">
                   <div className="space-y-1">
                    <p className="text-[8px] font-black uppercase text-slate-400 px-2">Grade</p>
                    <select className="w-full bg-slate-50 rounded-2xl p-5 font-bold outline-none appearance-none" value={form.grade} onChange={e => setForm({...form, grade: e.target.value})}>
                      {grades.map(g => <option key={g} value={g}>G-{g}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] font-black uppercase text-slate-400 px-2">Month</p>
                    <select className="w-full bg-slate-50 rounded-2xl p-5 font-bold outline-none appearance-none" value={form.month} onChange={e => setForm({...form, month: e.target.value})}>
                      {months.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] font-black uppercase text-slate-400 px-2">Type</p>
                    <select className="w-full bg-slate-50 rounded-2xl p-5 font-bold outline-none appearance-none" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                      {lessonTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
                <label className="text-[10px] font-black uppercase text-[#1A5683] tracking-widest flex justify-between">
                  Video Resources
                  <button type="button" onClick={addVideoField} className="text-blue-600 hover:underline">+ Add Link</button>
                </label>
                {form.videos.map((vid, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-50">
                    <input type="text" placeholder="YouTube URL" className="bg-slate-50 rounded-xl p-3 text-sm font-bold outline-none" value={vid.url} onChange={e => updateVideo(index, 'url', e.target.value)} />
                    <input type="text" placeholder="Video Description (Optional)" className="bg-slate-50 rounded-xl p-3 text-sm font-bold outline-none" value={vid.desc} onChange={e => updateVideo(index, 'desc', e.target.value)} />
                  </div>
                ))}
              </div>

              <div className="space-y-4 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
                <label className="text-[10px] font-black uppercase text-[#1A5683] tracking-widest flex justify-between">
                  PDF Materials
                  <label className="text-blue-600 cursor-pointer hover:underline">
                    + Upload New Files
                    <input type="file" accept=".pdf" multiple className="hidden" onChange={handleFileChange} />
                  </label>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* EXISTING FILES IN DATABASE */}
                  {form.existingFiles.map((f, index) => (
                    <div key={`ex-${index}`} className="bg-blue-50/50 p-4 rounded-2xl flex items-center gap-3 border border-blue-100 shadow-sm">
                      <div className="text-xl">✅</div>
                      <input type="text" className="flex-1 text-xs font-bold outline-none bg-white p-2 rounded-lg" value={f.label} onChange={e => {
                         const updated = [...form.existingFiles];
                         updated[index].label = e.target.value;
                         setForm({...form, existingFiles: updated});
                      }} />
                      <button type="button" onClick={() => setForm({...form, existingFiles: form.existingFiles.filter((_, i) => i !== index)})} className="text-red-400 text-xs font-bold">✕</button>
                    </div>
                  ))}

                  {/* NEW FILES SELECTED FOR UPLOAD */}
                  {form.files.map((f, index) => (
                    <div key={`new-${index}`} className="bg-white p-4 rounded-2xl flex items-center gap-3 border border-slate-100 shadow-sm">
                      <div className="text-xl">📄</div>
                      <input type="text" className="flex-1 text-xs font-bold outline-none bg-blue-50/50 p-2 rounded-lg" value={f.label} onChange={e => updateFileLabel(index, e.target.value)} placeholder="File label..." />
                      <button type="button" onClick={() => setForm({...form, files: form.files.filter((_, i) => i !== index)})} className="text-red-400 text-xs font-bold">✕</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4">Main Lesson Description</label>
                <textarea rows={3} placeholder="Provide an overall summary of the lesson content..." className="w-full bg-slate-50 rounded-[2rem] p-6 text-sm font-bold resize-none outline-none focus:ring-2 ring-blue-100" value={form.mainDescription} onChange={e => setForm({...form, mainDescription: e.target.value})} />
              </div>

              <button className="w-full bg-[#1A5683] text-white py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-slate-900 transition-all transform hover:scale-[1.01] active:scale-95">
                {editingId ? 'Update Lesson' : 'Publish Week Content'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}