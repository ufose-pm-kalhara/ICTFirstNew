'use client';

import { useState, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { 
  Search, 
  Download, 
  RefreshCw, 
  Eye, 
  Edit3, 
  MessageCircle, 
  UserPlus, 
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'suspended'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('All');
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

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

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterGrade, activeTab]);

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
    const worksheetName = "Students";
    XLSX.utils.book_append_sheet(workbook, worksheet, worksheetName);
    XLSX.writeFile(workbook, `Student_List_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const finalStatus = selectedStudent.status;
    
    try {
      const res = await fetch('/api/admin/students/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedStudent.id,
          student_id: selectedStudent.student_id,
          status: finalStatus
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsEditOpen(false);
        fetchStudents();
      }
    } catch (err) {
      alert("Failed to update student.");
    }
  };

  const sendWhatsAppNotification = async (student: Student) => {
    if (!student.student_id) return;
    const cleanPhone = student.phone.replace(/\D/g, '');
    const message = `Hello *${student.full_name}*,%0A%0AWelcome to *ICTFIRST.lk*! Your account is now active.%0A%0A*Student ID:* ${student.student_id}%0A*Login:* ${window.location.origin}/login`;
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const pendingCount = students.filter(s => s.status === 'Pending' || !s.student_id).length;
  const suspendedCount = students.filter(s => s.status === 'Suspended').length;

  const filteredStudents = students.filter(s => {
    const isPending = s.status === 'Pending' || !s.student_id;
    const isSuspended = s.status === 'Suspended';
    
    const matchesTab = 
      activeTab === 'all' ? true : 
      activeTab === 'pending' ? isPending : 
      isSuspended;

    const matchesSearch = s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.student_id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = filterGrade === 'All' ? true : s.grade === parseInt(filterGrade);
    return matchesTab && matchesSearch && matchesGrade;
  });

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);

  return (
    <div className="font-sans text-slate-900">
      {/* Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
            <span>Admin</span>
            <ChevronRight size={12} />
            <span className="text-[#2563EB]">Students</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Student Directory</h1>
          <p className="text-slate-500 text-sm mt-1">Manage enrollments and account approvals.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-white border border-slate-100 p-1 rounded-xl flex shadow-sm">
            <button 
              onClick={() => setActiveTab('all')}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'all' ? 'bg-[#F0F7FF] text-[#2563EB]' : 'text-slate-500 hover:text-slate-700'}`}
            >
              All
            </button>
            <button 
              onClick={() => setActiveTab('pending')}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'pending' ? 'bg-[#F0F7FF] text-[#2563EB]' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Pending ({pendingCount})
            </button>
            <button 
              onClick={() => setActiveTab('suspended')}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'suspended' ? 'bg-red-50 text-red-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Suspended ({suspendedCount})
            </button>
          </div>
          <button 
            onClick={exportToExcel}
            className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1E40AF] text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md shadow-blue-100"
          >
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center">
            <UserPlus size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Total Result</p>
            <h3 className="text-2xl font-bold text-slate-900">{filteredStudents.length}</h3>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex-grow relative max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search students..." 
            className="w-full bg-white border border-slate-100 rounded-2xl py-3 pl-12 pr-4 shadow-sm outline-none focus:ring-2 focus:ring-blue-100 text-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="bg-white border border-slate-100 rounded-2xl px-6 py-3 text-sm font-bold text-slate-600 shadow-sm outline-none focus:ring-2 focus:ring-blue-50"
          value={filterGrade}
          onChange={(e) => setFilterGrade(e.target.value)}
        >
          <option value="All">All Grades</option>
          <option value="10">Grade 10</option>
          <option value="11">Grade 11</option>
        </select>
        <button onClick={() => fetchStudents()} className="p-3 bg-white rounded-xl border border-slate-100 text-slate-400 hover:text-blue-500 transition-all shadow-sm">
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Student ID</th>
              <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Student Info</th>
              <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Grade</th>
              <th className="px-8 py-5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-8 py-5 text-right text-[11px] font-bold text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              <tr><td colSpan={5} className="py-20 text-center text-slate-400 font-medium text-sm">Loading records...</td></tr>
            ) : currentStudents.length > 0 ? (
              currentStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-8 py-5">
                    <span className={`font-bold text-sm ${student.student_id ? 'text-slate-900' : 'text-amber-500'}`}>
                      {student.student_id || 'Pending ID'}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold text-xs">
                        {student.full_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-[14px] leading-tight">{student.full_name}</p>
                        <p className="text-[12px] text-slate-400 font-medium">{student.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-[11px] font-bold uppercase">
                      Grade {student.grade}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        student.status === 'Active' ? 'bg-green-500' : 
                        student.status === 'Pending' ? 'bg-amber-500' : 
                        student.status === 'Suspended' ? 'bg-red-500' : 'bg-slate-300'
                      }`} />
                      <span className="text-[12px] font-bold text-slate-600">{student.status}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right space-x-1">
                    <button 
                      onClick={() => sendWhatsAppNotification(student)}
                      className={`p-2 rounded-lg transition-all ${student.student_id ? 'text-green-500 hover:bg-green-50' : 'text-slate-200'}`}
                    >
                      <MessageCircle size={18} />
                    </button>
                    <button onClick={() => { setSelectedStudent(student); setIsViewOpen(true); }} className="p-2 text-slate-400 hover:text-blue-600 transition-all">
                      <Eye size={18} />
                    </button>
                    <button onClick={() => { setSelectedStudent(student); setIsEditOpen(true); }} className="p-2 text-slate-400 hover:text-slate-900 transition-all">
                      <Edit3 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} className="py-20 text-center text-slate-400 font-medium text-sm">No students found.</td></tr>
            )}
          </tbody>
        </table>

        {/* Pagination UI */}
        {totalPages > 1 && (
          <div className="px-8 py-5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-[#2563EB] disabled:opacity-50 disabled:hover:text-slate-400 transition-all"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-[#2563EB] disabled:opacity-50 disabled:hover:text-slate-400 transition-all"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      {isViewOpen && selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl border border-slate-100">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Student Details</h2>
            <div className="space-y-4">
              <DetailRow label="Full Name" value={selectedStudent.full_name} />
              <DetailRow label="Student ID" value={selectedStudent.student_id || 'Not Assigned'} />
              <DetailRow label="Email" value={selectedStudent.email} />
              <DetailRow label="Grade" value={`Grade ${selectedStudent.grade}`} />
              <DetailRow label="WhatsApp" value={selectedStudent.phone} />
            </div>
            <button onClick={() => setIsViewOpen(false)} className="mt-8 w-full bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-xl font-bold text-sm transition-all">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleUpdate} className="bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Update Account</h2>
            <div className="space-y-5">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assign Student ID</label>
                <input 
                  type="text" 
                  className="w-full mt-2 p-3 bg-slate-50 border border-slate-100 rounded-xl font-semibold outline-none focus:ring-2 focus:ring-blue-100" 
                  value={selectedStudent.student_id || ''} 
                  onChange={(e) => setSelectedStudent({...selectedStudent, student_id: e.target.value})} 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account Status</label>
                <select 
                  className="w-full mt-2 p-3 bg-slate-50 border border-slate-100 rounded-xl font-semibold outline-none" 
                  value={selectedStudent.status} 
                  onChange={(e) => {
                    const newStatus = e.target.value as Student['status'];
                    setSelectedStudent({...selectedStudent, status: newStatus});
                  }}
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button type="button" onClick={() => setIsEditOpen(false)} className="flex-1 py-3 font-bold text-slate-400 text-sm">Cancel</button>
              <button type="submit" className="flex-1 py-3 bg-[#2563EB] text-white rounded-xl font-bold text-sm shadow-md shadow-blue-100">Save Changes</button>
            </div>
          </form>
        </div>
      )}
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