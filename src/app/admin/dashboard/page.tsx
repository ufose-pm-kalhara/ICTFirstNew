'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Added for navigation
import { Plus, Calendar, Users, CreditCard, History, AlertCircle, Clock } from 'lucide-react';

interface Student {
  id: number;
  student_id: string | null;
  full_name: string;
  email: string;
  grade: number;
  phone: string;
  status: 'Active' | 'Inactive' | 'Suspended' | 'Pending';
  created_at: string;
}

interface Payment {
  id: number;
  student_name: string;
  amount: number;
  status: 'pending' | 'completed' | 'rejected';
  created_at: string;
}

export default function AdminDashboard() {
  const router = useRouter(); // Initialize router
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const formattedDate = now.toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric'
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [studentRes, paymentRes] = await Promise.all([
          fetch('/api/admin/students'),
          fetch('/api/admin/payments')
        ]);
        const studentData = await studentRes.json();
        const paymentData = await paymentRes.json();

        if (studentData.success) setStudents(studentData.students);
        if (paymentData.success) setPayments(paymentData.payments);
      } catch (err) {
        console.error("Dashboard Load Error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // --- Logic Calculations ---
  const pendingApprovalCount = students.filter(s => s.status === 'Pending' || !s.student_id).length;
  const criticalPayments = payments.filter(p => p.status === 'pending').slice(0, 3);
  
  const thisMonthNewStudents = students.filter(s => {
    const date = new Date(s.created_at);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }).length;

  const totalStudentsUntilLastMonth = students.length - thisMonthNewStudents;
  const percentageChange = totalStudentsUntilLastMonth > 0 ? (thisMonthNewStudents / totalStudentsUntilLastMonth) * 100 : 0;
  const formattedPercentage = (percentageChange >= 0 ? "+" : "") + percentageChange.toFixed(0) + "%";

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <main className="flex-1 p-6">
        
        {/* PAGE TITLE & DATE */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-[30px] font-bold leading-[36px] tracking-[-0.75px] text-[#003D63]">Dashboard Overview</h1>
            <p className="text-[18px] font-medium leading-[24px] tracking-[0px] text-gray-500 mt-1">
              Welcome back, Mrs. Kalugampitiya. Here&apos;s what&apos;s happening today.
            </p>
          </div>
          <div className="flex flex-row gap-x-3 items-center font-semibold text-[#2B6390] bg-[#E3EEF9] rounded-[0.8rem] py-2 px-6">
            <Calendar size={16} strokeWidth={3} className="text-[#2B6390]" />
            {formattedDate}
          </div>
        </div>

        {/* --- MAIN GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 mb-10">
          
          <div className="flex flex-col gap-6">
            {/* Card 1: Pending Payments */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50 flex flex-col justify-between h-52 relative overflow-hidden hover:shadow-xl transition-all cursor-pointer" onClick={() => router.push('/admin/payments')}>
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-[#FFFBEB] rounded-2xl flex items-center justify-center">
                  <CreditCard size={32} strokeWidth={3} className="text-[#D97706]" />
                </div>
                <span className="text-[10px] font-black px-2 py-1 rounded bg-[#FFFBEB] text-[#D97706]">ACTION REQUIRED</span>
              </div>
              <div>
                <p className="text-[#526070] text-sm font-bold">Pending Payments</p>
                <h2 className="text-4xl text-slate-800 font-bold">{payments.filter(p => p.status === 'pending').length}</h2>
              </div>
            </div>

            {/* Card 2: Total Students */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50 flex flex-col justify-between h-52 relative overflow-hidden hover:shadow-xl transition-all cursor-pointer" onClick={() => router.push('/admin/students')}>
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-[#F0FDF4] rounded-2xl flex items-center justify-center">
                  <Users size={30} strokeWidth={3} className="text-[#2B6390]" />
                </div>
                <span className="text-[10px] font-black px-2 py-1 rounded bg-[#F0FDF4] text-[#16A34A]">{formattedPercentage} Growth</span>
              </div>
              <div>
                <p className="text-[#526070] text-sm font-bold">Total Students</p>
                <h2 className="text-4xl text-slate-800 font-bold">{students.length}</h2>
              </div>
            </div>
          </div>

          {/* Quick Actions & Pending Students Section */}
          <div className="bg-[#2B6390] p-8 rounded-[2.5rem] text-white flex flex-col shadow-xl relative overflow-hidden h-full min-h-[440px]">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full" />
            
            <h2 className="text-xl font-semibold mb-6 text-[#F6F9FF]">Quick Actions</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              {/* NEW LESSON NAVIGATION */}
              <button 
                onClick={() => router.push('/admin/content')}
                className="flex flex-col items-center justify-center aspect-square bg-white/10 rounded-2xl border border-white/20 hover:bg-white/20 transition-all active:scale-95"
              >
                <Plus size={24} />
                <span className="text-[10px] font-bold uppercase mt-2">New Lesson</span>
              </button>
              
              {/* PENDING APPROVAL NAVIGATION */}
              <button 
                onClick={() => router.push('/admin/students?tab=pending')}
                className="flex flex-col items-center justify-center aspect-square bg-amber-500/20 rounded-2xl border border-amber-400/30 hover:bg-amber-500/30 transition-all active:scale-95"
              >
                <span className="text-2xl font-black">{pendingApprovalCount}</span>
                <span className="text-[9px] font-bold uppercase text-center mt-1">Pending Approval</span>
              </button>
            </div>

            <div className="mt-auto bg-white/10 p-5 rounded-3xl border border-white/10">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-3">Latest Pending</p>
              {students.filter(s => !s.student_id).slice(0, 2).map(s => (
                <div key={s.id} className="flex items-center gap-3 mb-3 last:mb-0">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold">
                    {s.full_name.charAt(0)}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold truncate">{s.full_name}</p>
                    <p className="text-[10px] opacity-60">Grade {s.grade}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- ROW 2: TABLES --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Critical Pending Payments */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm hover:shadow-xl transition-all">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-[16px] font-bold text-[#2D3335]">Critical Pending Payments</h3>
              <button onClick={() => router.push('/admin/payments')} className="text-[#2B6390] text-[12px] font-bold uppercase tracking-widest hover:underline">View All</button>
            </div>
            
            <div className="space-y-4">
              {criticalPayments.length > 0 ? criticalPayments.map(p => (
                <div key={p.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer" onClick={() => router.push(`/admin/payments/${p.id}`)}>
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-amber-100 rounded-xl text-amber-600"><AlertCircle size={18} /></div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{p.student_name || 'Student'}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Verification Required</p>
                    </div>
                  </div>
                  <p className="font-black text-slate-700 text-sm">Rs. {p.amount || '0.00'}</p>
                </div>
              )) : (
                <p className="text-center py-10 text-slate-300 font-bold text-xs uppercase">No critical payments</p>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm hover:shadow-xl transition-all">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-[16px] font-bold text-[#2D3335]">Recent Activity</h3>
              <History size={18} className="text-slate-300" />
            </div>
            <div className="space-y-6 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-50">
              {students.slice(0, 4).map(s => (
                <div key={s.id} className="relative pl-10 cursor-pointer group" onClick={() => router.push(`/admin/students/${s.id}`)}>
                  <div className="absolute left-3.5 top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-sm group-hover:scale-125 transition-transform" />
                  <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">New student registered</p>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {s.full_name} joined Grade {s.grade}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}