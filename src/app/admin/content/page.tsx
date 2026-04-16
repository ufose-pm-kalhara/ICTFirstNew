'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  Video, 
  FileText, 
  Edit3, 
  Trash2, 
  X, 
  ChevronRight, 
  Check, 
  UploadCloud,
  Layers
} from 'lucide-react';

interface CombinedLesson {
  id: number;
  title: string;
  grade: number;
  month: string;
  type: string;
  video_url: string | null; 
  description: string | null; 
  notes: string | null;
  material_ids: string | null; 
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
    existingFiles: [] as { id: number; label: string }[],
  });

  // --- NEW: Reset Form Helper ---
  const resetForm = () => {
    setEditingId(null);
    setForm({
      title: '',
      grade: '12',
      month: months[new Date().getMonth()],
      type: 'Theory',
      videos: [{ url: '', desc: '' }], 
      mainDescription: '',
      files: [], 
      existingFiles: [],
    });
  };

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
        parsedFiles = JSON.parse(lesson.material_ids || '[]'); 
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
      existingFiles: parsedFiles,
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
    <div className="font-sans text-slate-900">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Vault Management</h1>
          <p className="text-slate-500 font-medium mt-1">Manage and publish learning materials for students.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsFormOpen(true); }} // Updated to call resetForm
          className="bg-[#2563EB] text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-blue-700 transition-all shadow-md shadow-blue-100"
        >
          <Plus size={18} />
          New Lesson
        </button>
      </header>

      <div className="space-y-4">
        {loading ? (
          <div className="bg-white p-12 rounded-[2rem] border border-slate-100 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-slate-400 font-semibold uppercase text-xs tracking-widest">Loading Vault...</p>
          </div>
        ) : (
          lessons.map((lesson) => (
            <div key={lesson.id} className="p-5 bg-white rounded-3xl border border-slate-100 flex justify-between items-center group hover:border-blue-200 hover:shadow-sm transition-all">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex flex-col items-center justify-center text-[#2563EB] group-hover:bg-blue-50 transition-colors">
                  <span className="text-[10px] font-bold uppercase tracking-tighter leading-none">{lesson.month ? lesson.month.slice(0, 3) : '---'}</span>
                  <span className="text-lg font-bold">W{lesson.id % 4 || 4}</span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg tracking-tight leading-none mb-2">{lesson.title}</h3>
                  <div className="flex gap-2">
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-lg uppercase tracking-wider">{lesson.type}</span>
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg uppercase tracking-wider">Grade {lesson.grade}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => openEditModal(lesson)} 
                  className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm"
                >
                  <Edit3 size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(lesson.id)} 
                  className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-red-600 hover:border-red-100 transition-all shadow-sm"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">{editingId ? 'Edit Lesson' : 'Publish Content'}</h2>
                <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mt-1">Week Content Editor</p>
              </div>
              <button onClick={() => setIsFormOpen(false)} className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-900 transition-all"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Lesson Title</label>
                  <input type="text" placeholder="e.g. Logic Gates Theory Part 1" className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-semibold outline-none focus:ring-2 focus:ring-blue-100 transition-all" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Grade</p>
                    <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-semibold outline-none" value={form.grade} onChange={e => setForm({...form, grade: e.target.value})}>
                      {grades.map(g => <option key={g} value={g}>G-{g}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Month</p>
                    <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-semibold outline-none" value={form.month} onChange={e => setForm({...form, month: e.target.value})}>
                      {months.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Type</p>
                    <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-semibold outline-none" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                      {lessonTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold uppercase text-blue-600 tracking-wider flex items-center gap-2">
                    <Video size={14} /> Video Resources
                  </label>
                  <button type="button" onClick={addVideoField} className="text-[11px] font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest">+ Add Field</button>
                </div>
                <div className="space-y-3">
                  {form.videos.map((vid, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 group">
                      <input type="text" placeholder="YouTube URL" className="bg-white border border-slate-100 rounded-xl p-3 text-xs font-semibold outline-none" value={vid.url} onChange={e => updateVideo(index, 'url', e.target.value)} />
                      <input type="text" placeholder="Video Description (Optional)" className="bg-white border border-slate-100 rounded-xl p-3 text-xs font-semibold outline-none" value={vid.desc} onChange={e => updateVideo(index, 'desc', e.target.value)} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-bold uppercase text-blue-600 tracking-wider flex items-center gap-2">
                    <FileText size={14} /> Learning Materials
                  </label>
                  <label className="text-[11px] font-bold text-slate-400 cursor-pointer hover:text-blue-600 transition-colors uppercase tracking-widest flex items-center gap-1">
                    <UploadCloud size={14} /> Upload PDF
                    <input type="file" accept=".pdf" multiple className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {form.existingFiles.map((f, index) => (
                    <div key={`ex-${index}`} className="bg-blue-50/50 p-4 rounded-xl flex items-center gap-3 border border-blue-100">
                      <Check size={16} className="text-blue-600" />
                      <input type="text" className="flex-1 text-xs font-bold outline-none bg-white p-2 rounded-lg border border-blue-100" value={f.label} onChange={e => {
                         const updated = [...form.existingFiles];
                         updated[index].label = e.target.value;
                         setForm({...form, existingFiles: updated});
                      }} />
                      <button type="button" onClick={() => setForm({...form, existingFiles: form.existingFiles.filter((_, i) => i !== index)})} className="text-red-400 p-1 hover:bg-red-50 rounded"><X size={14}/></button>
                    </div>
                  ))}

                  {form.files.map((f, index) => (
                    <div key={`new-${index}`} className="bg-white p-4 rounded-xl flex items-center gap-3 border border-slate-100 shadow-sm border-dashed">
                      <FileText size={16} className="text-slate-400" />
                      <input type="text" className="flex-1 text-xs font-bold outline-none bg-slate-50 p-2 rounded-lg" value={f.label} onChange={e => updateFileLabel(index, e.target.value)} placeholder="File label..." />
                      <button type="button" onClick={() => setForm({...form, files: form.files.filter((_, i) => i !== index)})} className="text-red-400 p-1 hover:bg-red-50 rounded"><X size={14}/></button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Lesson Summary</label>
                <textarea rows={3} placeholder="Brief description for students..." className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm font-semibold resize-none outline-none focus:ring-2 focus:ring-blue-100" value={form.mainDescription} onChange={e => setForm({...form, mainDescription: e.target.value})} />
              </div>
            </form>

            <div className="p-8 border-t border-slate-50">
              <button 
                onClick={handleSubmit}
                className="w-full bg-[#2563EB] text-white py-4 rounded-2xl font-bold uppercase text-xs tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all transform active:scale-95"
              >
                {editingId ? 'Save Changes' : 'Publish Week Content'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}