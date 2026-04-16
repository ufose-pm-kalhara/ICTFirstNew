'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Calendar, Users, CreditCard, History, AlertCircle, ChevronRight, ArrowUpRight } from 'lucide-react';

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
  const router = useRouter();
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
    <div className="font-sans text-slate-900">
      
      {/* PAGE TITLE & DATE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-500 font-medium mt-1">
            Welcome back, Mrs. Kalugampitiya. Here&apos;s your current status.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white border border-slate-100 py-2.5 px-5 rounded-2xl shadow-sm text-sm font-semibold text-slate-600">
          <Calendar size={18} className="text-[#2563EB]" />
          {formattedDate}
        </div>
      </div>

      {/* --- TOP STATS GRID --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        
        {/* Card 1: Pending Payments */}
        <div 
          className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group" 
          onClick={() => router.push('/admin/payments')}
        >
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
              <CreditCard size={24} />
            </div>
            <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-700 uppercase tracking-wider">Verification Needed</span>
          </div>
          <p className="text-slate-500 text-sm font-semibold">Pending Payments</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl font-bold text-slate-900">{payments.filter(p => p.status === 'pending').length}</h2>
            <ArrowUpRight size={16} className="text-slate-300 group-hover:text-amber-500 transition-colors" />
          </div>
        </div>

        {/* Card 2: Total Students */}
        <div 
          className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group" 
          onClick={() => router.push('/admin/students')}
        >
          <div className="flex justify-between items-start mb-6">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-[#2563EB]">
              <Users size={24} />
            </div>
            <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-blue-100 text-[#1E40AF] uppercase tracking-wider">{formattedPercentage} Growth</span>
          </div>
          <p className="text-slate-500 text-sm font-semibold">Total Students</p>
          <div className="flex items-baseline gap-2">
            <h2 className="text-3xl font-bold text-slate-900">{students.length}</h2>
            <ArrowUpRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="bg-[#2563EB] p-7 rounded-[2rem] text-white shadow-lg shadow-blue-100/50 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Quick Actions</h2>
            <Plus size={20} className="opacity-60" />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => router.push('/admin/content')}
              className="bg-white/10 hover:bg-white/20 border border-white/10 p-3 rounded-xl transition-all text-center"
            >
              <p className="text-[10px] font-bold uppercase tracking-widest">New Lesson</p>
            </button>
            <button 
              onClick={() => router.push('/admin/students?tab=pending')}
              className="bg-white text-[#2563EB] p-3 rounded-xl transition-all text-center shadow-sm hover:bg-blue-50"
            >
              <p className="text-[10px] font-bold uppercase tracking-widest">Review ({pendingApprovalCount})</p>
            </button>
          </div>
        </div>
      </div>

      {/* --- ROW 2: ACTIVITY & CRITICAL DATA --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Critical Pending Payments */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-[16px] font-bold text-slate-900">Critical Pending Payments</h3>
            <button onClick={() => router.push('/admin/payments')} className="text-[#2563EB] text-xs font-bold hover:underline">View All</button>
          </div>
          
          <div className="space-y-3">
            {criticalPayments.length > 0 ? criticalPayments.map(p => (
              <div key={p.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent hover:border-slate-200 transition-all cursor-pointer" onClick={() => router.push(`/admin/payments/${p.id}`)}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600"><AlertCircle size={18} /></div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{p.student_name || 'New Student'}</p>
                    <p className="text-[11px] font-semibold text-slate-400">Needs verification</p>
                  </div>
                </div>
                <p className="font-bold text-slate-900 text-sm">Rs. {p.amount.toLocaleString()}</p>
              </div>
            )) : (
              <div className="text-center py-10">
                <p className="text-slate-300 font-semibold text-sm">All payments processed</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-[16px] font-bold text-slate-900">Recent Activity</h3>
            <History size={18} className="text-slate-300" />
          </div>
          <div className="space-y-6 relative before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-100">
            {students.slice(0, 4).map(s => (
              <div key={s.id} className="relative pl-8 group cursor-pointer" onClick={() => router.push(`/admin/students/${s.id}`)}>
                <div className="absolute left-0 top-1 w-5 h-5 rounded-full bg-white border-4 border-blue-500 shadow-sm group-hover:scale-110 transition-transform" />
                <p className="text-sm font-bold text-slate-800 group-hover:text-[#2563EB] transition-colors">New student registered</p>
                <p className="text-[12px] text-slate-500 font-medium">
                  {s.full_name} joined Grade {s.grade}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}