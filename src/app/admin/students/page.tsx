'use client';

import { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx'; // For Excel Export

// 1. Define the Student structure based on your DB columns
interface Student {
  id: number;
  student_id: string | null;
  full_name: string;
  email: string;
  grade: number;
  phone: string;
  status: 'Active' | 'Inactive' | 'Suspended' | 'Pending';
  whatsapp_sent: boolean;
}

export default function StudentDirectory() {
  const [students, setStudents] = useState<Student[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'pending'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('All');
  const [loading, setLoading] = useState(true);

  // --- Modal & Action States ---
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // --- Data Fetching ---
  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/students');
      const data = await res.json();
      if (data.success) {
        setStudents(data.students);
      }
    } catch (err) {
      console.error("Database connection failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // --- Export Logic ---
  const exportToExcel = () => {
    const dataToExport = filteredStudents.map(s => ({
      ID: s.student_id || 'N/A',
      Name: s.full_name,
      Email: s.email,
      Grade: s.grade,
      Phone: s.phone,
      Status: s.status
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Students");
    XLSX.writeFile(workbook, `Student_List_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // --- Update Logic ---
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    // Logic: If Admin assigns an ID, we automatically set status to Active
    const updatedStatus = (selectedStudent.student_id && selectedStudent.student_id.trim() !== '') 
      ? 'Active' 
      : selectedStudent.status;

    try {
      const res = await fetch('/api/admin/students/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedStudent.id,
          student_id: selectedStudent.student_id,
          status: updatedStatus
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsEditOpen(false);
        fetchStudents();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Failed to update student.");
    }
  };

  // --- WhatsApp Logic ---
  const sendWhatsAppNotification = async (student: Student) => {
    if (!student.student_id) {
      alert("Assign a Student ID before notifying!");
      return;
    }

    const cleanPhone = student.phone.replace(/\D/g, '');
    const message = `Hello *${student.full_name}*,%0A%0AWelcome to *ICTFIRST.lk*! Your account is now active.%0A%0A*Student ID:* ${student.student_id}%0A*Login:* ${window.location.origin}/login%0A%0APlease keep this ID safe for your classes.`;
    
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');

    try {
      await fetch('/api/admin/students/whatsapp-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: student.id, status: true }),
      });
      fetchStudents(); 
    } catch (e) {
      console.error("Failed to update status");
    }
  };

  // --- Filtering Logic ---
  // A student is considered pending if they are explicitly "Pending" OR have no ID assigned yet
  const pendingCount = students.filter(s => s.status === 'Pending' || !s.student_id).length;

  const filteredStudents = students.filter(s => {
    const isPending = s.status === 'Pending' || !s.student_id;
    const matchesTab = activeTab === 'all' ? true : isPending;
    const matchesSearch = s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = filterGrade === 'All' ? true : s.grade === parseInt(filterGrade);
    
    return matchesTab && matchesSearch && matchesGrade;
  });

  return (
    <div className="max-w-7xl mx-auto">
      {/* Title & Top Actions */}
      <div className="flex justify-between items-end mb-10">
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Admin Portal › Student Management</p>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter italic uppercase">Student Directory</h1>
          <p className="text-slate-400 font-medium mt-2">Manage, filter and review student enrollments for the current academic cycle.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-slate-100">
            <button 
              onClick={() => setActiveTab('all')}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'all' ? 'bg-[#1A5683] text-white shadow-lg' : 'text-slate-400'}`}
            >
              All Students
            </button>
            <button 
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'pending' ? 'bg-[#1A5683] text-white shadow-lg' : 'text-slate-400'}`}
            >
              Pending Approval ({pendingCount})
            </button>
          </div>
          <button 
            onClick={exportToExcel}
            className="bg-[#1A5683] text-white px-6 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-2"
          >
            📥 Export List
          </button>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex-grow relative">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 grayscale">🔍</span>
          <input 
            type="text" 
            placeholder="Search by name, ID or email..." 
            className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-14 pr-4 shadow-sm outline-none focus:ring-2 focus:ring-blue-100 font-medium text-sm text-slate-600"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="bg-white border border-slate-100 rounded-2xl px-6 py-4 font-bold text-xs text-slate-500 shadow-sm outline-none"
          value={filterGrade}
          onChange={(e) => setFilterGrade(e.target.value)}
        >
          <option value="All">All Grades</option>
          <option value="10">Grade 10</option>
          <option value="11">Grade 11</option>
          <option value="12">Grade 12</option>
        </select>
        <button onClick={() => fetchStudents()} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm text-slate-400 hover:text-[#1A5683] transition-colors">🔄</button>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[3rem] shadow-xl shadow-slate-200/40 border border-slate-50 overflow-hidden mb-10">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-50 text-[10px] font-black text-slate-300 uppercase tracking-widest">
              <th className="px-10 py-8 text-center">Student ID</th>
              <th className="px-10 py-8">Full Name</th>
              <th className="px-10 py-8">Class/Grade</th>
              <th className="px-10 py-8">Account Status</th>
              <th className="px-10 py-8 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={5} className="py-20 text-center font-black uppercase text-slate-300 text-[10px] tracking-[0.3em]">Syncing Database...</td></tr>
            ) : filteredStudents.map((student) => (
              <tr key={student.id} className="group hover:bg-slate-50/50 transition-all">
                <td className="px-10 py-6 font-black text-[#1A5683] text-sm tracking-tight text-center">
                  {student.student_id || <span className="text-amber-500 italic text-[10px] animate-pulse">Awaiting ID</span>}
                </td>
                <td className="px-10 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#1A5683]/10 rounded-full flex items-center justify-center font-black text-[#1A5683] text-xs">
                      {student.full_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-slate-800 text-sm leading-tight">{student.full_name}</p>
                      <p className="text-[11px] text-slate-400 font-bold">{student.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-6">
                  <span className="bg-slate-100 text-slate-500 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter">Grade {student.grade}</span>
                </td>
                <td className="px-10 py-6">
                  <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      student.status === 'Active' ? 'bg-green-500' : 
                      student.status === 'Suspended' ? 'bg-red-500' : 
                      student.status === 'Pending' ? 'bg-amber-500' : 'bg-slate-300'
                    }`} />
                    <span className="text-[11px] font-black text-slate-600 uppercase tracking-tighter">{student.status}</span>
                  </div>
                </td>
                <td className="px-10 py-6 text-right space-x-1">
                  <button 
                    onClick={() => sendWhatsAppNotification(student)}
                    disabled={!student.student_id}
                    title="Notify via WhatsApp"
                    className={`p-2 rounded-xl transition-all ${student.student_id ? 'text-green-500 hover:bg-green-50' : 'text-slate-100 cursor-not-allowed'}`}
                  >
                    📱
                  </button>
                  <button 
                    onClick={() => { setSelectedStudent(student); setIsViewOpen(true); }}
                    className="p-2 text-slate-300 hover:text-[#1A5683] transition-colors"
                  >
                    👁️
                  </button>
                  <button 
                    onClick={() => { setSelectedStudent(student); setIsEditOpen(true); }}
                    className="p-2 text-slate-300 hover:text-slate-600 transition-colors"
                  >
                    ✏️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Registration Card (Bottom) */}
      <div className="w-80 bg-white rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[5rem] -mr-8 -mt-8 transition-all group-hover:scale-110" />
        <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-xl mb-6 relative">👤</div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 relative">New Registrations</p>
        <h3 className="text-4xl font-black text-slate-900 mb-4 relative">{pendingCount}</h3>
        <p className="text-[10px] font-bold text-slate-400 leading-relaxed relative uppercase tracking-wider">Awaiting admin review & class assignment</p>
      </div>

      {/* View Modal */}
      {isViewOpen && selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl">
            <h2 className="text-2xl font-black uppercase italic mb-6">Student Details</h2>
            <div className="grid grid-cols-2 gap-6">
              <div><p className="text-[10px] font-black text-slate-400 uppercase">Name</p><p className="font-bold">{selectedStudent.full_name}</p></div>
              <div><p className="text-[10px] font-black text-slate-400 uppercase">Student ID</p><p className="font-bold text-[#1A5683]">{selectedStudent.student_id || 'N/A'}</p></div>
              <div><p className="text-[10px] font-black text-slate-400 uppercase">Email</p><p className="font-bold">{selectedStudent.email}</p></div>
              <div><p className="text-[10px] font-black text-slate-400 uppercase">Phone</p><p className="font-bold">{selectedStudent.phone}</p></div>
              <div><p className="text-[10px] font-black text-slate-400 uppercase">Grade</p><p className="font-bold">{selectedStudent.grade}</p></div>
              <div><p className="text-[10px] font-black text-slate-400 uppercase">Status</p><p className="font-bold">{selectedStudent.status}</p></div>
            </div>
            <button onClick={() => setIsViewOpen(false)} className="mt-8 w-full bg-slate-100 py-4 rounded-2xl font-black text-[10px] uppercase">Close</button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleUpdate} className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl">
            <h2 className="text-2xl font-black uppercase italic mb-6">Modify Account</h2>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase">Assign Student ID</label>
                <input 
                  type="text" 
                  placeholder="e.g. ICT-2024-001"
                  className="w-full mt-2 p-4 bg-slate-50 rounded-xl font-bold outline-none ring-[#1A5683]/10 focus:ring-2" 
                  value={selectedStudent.student_id || ''} 
                  onChange={(e) => setSelectedStudent({...selectedStudent, student_id: e.target.value})} 
                />
                <p className="text-[9px] text-amber-500 font-bold uppercase mt-1">Assigning an ID will automatically set status to Active</p>
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase">Change Status</label>
                <select 
                  className="w-full mt-2 p-4 bg-slate-50 rounded-xl font-bold outline-none" 
                  value={selectedStudent.status} 
                  onChange={(e) => setSelectedStudent({...selectedStudent, status: e.target.value as Student['status']})}
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex gap-4 mt-8">
              <button type="button" onClick={() => setIsEditOpen(false)} className="flex-1 py-4 font-black text-slate-400 uppercase text-[10px]">Cancel</button>
              <button type="submit" className="flex-1 py-4 bg-[#1A5683] text-white rounded-2xl font-black uppercase text-[10px]">Save Changes</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}