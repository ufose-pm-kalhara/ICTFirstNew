'use client';

import { useEffect, useState } from 'react';
import { Plus,Calendar, Users, CreditCard, History  } from 'lucide-react';

interface Student {
  id: number;
  student_id: string;
  full_name: string;
  email: string;
  grade: number;
  phone: string;
  created_at: string;
}

interface Payment {
  id: number;
  status: string;
}

export default function AdminDashboard() {
  const [formattedDate, setFormattedDate] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);

  const now = new Date();
  const currentMonth = now.getMonth(); 
  const currentYear = now.getFullYear();

  const thisMonthNewStudents = students.filter(s => {
  const date = new Date(s.created_at);
  return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }).length;     
  
  const totalStudentsUntilLastMonth = students.length - thisMonthNewStudents;

  let percentageChange = 0;
  if (totalStudentsUntilLastMonth > 0) {
    percentageChange = (thisMonthNewStudents / totalStudentsUntilLastMonth) * 100;
  }

  const formattedPercentage = (percentageChange >= 0 ? "+" : "") + percentageChange.toFixed(0) + "%";

  useEffect(() => {
    // Setting the current date for the dashboard header
    setFormattedDate(new Date().toLocaleDateString('en-US', { 
      month: 'long', day: 'numeric', year: 'numeric' 
    }));

    fetch('/api/admin/students')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStudents(data.students);
        setLoading(false);
      });

    fetch('/api/admin/payments')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setPayments(data.payments);
      });

  }, []);

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 p-6">
        
        {/* PAGE TITLE & DATE */}
        <div className="flex justify-between items-end mb-8">
          <div>

            {/* Dashboard */}
            <h1 className="text-[30px] font-bold leading-[36px] tracking-[-0.75px] text-[#003D63]">Dashboard Overview</h1>

            {/* Welcome msg */}
            <p className="text-[18px] font-medium leading-[24px] tracking-[0px] text-gray-500 mt-1">Welcome back, Mrs. Kalugampitiya. Here's what's happening today.</p>

          </div>

          {/* Calander */}
          <div className="flex flex-row  gap-x-3 items-center font-semi-bold text-[#2B6390] bg-[#E3EEF9] rounded-[0.8rem] pt-2 pb-2 pl-6 pr-6">
            <Calendar size={16} strokeWidth={3} className="text-[#2B6390]" />
            {formattedDate}
          </div>
        </div>

        {/* --- MAIN GRID: Left side with 2 rows, Right side full height --- */}
<div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 mb-10">
  
  {/* FIRST COLUMN: Split into 2 Rows */}
  <div className="flex flex-col gap-6">
    
    {/* Card 1: Pending Payments */}
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50 flex flex-col justify-between h-52 relative overflow-hidden hover:shadow-2xl hover:-translate-y-1">
      <div className="flex justify-between items-start">
        <div className="w-12 h-12 bg-[#FFFBEB] rounded-2xl flex items-center justify-center text-orange-500 text-xl font-bold">
          <CreditCard size={32} strokeWidth={3} className="text-[#D97706]" />
          
        </div>
        <span className="text-[10px] font-black px-2 py-1 rounded bg-[#FFFBEB] text-[#D97706] ">Active</span>
      </div>
      <div>
        <p className="text-[#526070] text-sm font-bold">Pending Payments</p>
        <h2 className="text-4xl text-[#2D3335] text-slate-800 font-bold">
          
          {/* Pending paments count */}
          {payments.filter(p => p.status === 'pending').length}

        </h2>
      </div>
    </div>

    {/* Card 2: Total Students */}
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-50 flex flex-col justify-between h-52 relative overflow-hidden hover:shadow-2xl hover:-translate-y-1">
      <div className="flex justify-between items-start">
        <div className="w-12 h-12 bg-[#F0FDF4] rounded-2xl flex items-center justify-center text-blue-500 text-xl">
          <Users size={30} strokeWidth={3} className="text-[#2B6390]" />
        </div>
        <span className="text-[10px] font-black px-2 py-1 rounded bg-[#F0FDF4] text-[#16A34A] ">
          
          {/* Rate-want to implement??????????? */}
          {formattedPercentage}
          
        </span>
      </div>
      <div>
        <p className="text-[#526070] text-sm font-bold">Total Students</p>
        <h2 className="text-4xl text-[#2D3335] text-slate-800 font-bold">{students.length}</h2>
      </div>
    </div>

  </div>

  {/* SECOND COLUMN: Quick Actions (Full Height) */}
  <div className="bg-[#2B6390] p-8 rounded-[2.5rem] text-white flex flex-col justify-start items-start shadow-xl text-center relative overflow-hidden h-full min-h-[440px]  hover:shadow-2xl hover:-translate-y-1">
    
    {/* Background Decorative Circle */}
    <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full"></div>

    <h2 className="text-xl font-semi-bold self-start mb-6 text-[#F6F9FF]">Quick Actions</h2>
    
    {/* NEW STUDENT BUTTON */}
    <div className="relative z-10">
      
      {/* NEW STUDENT BUTTON: Based on Figma image_ac2d2a.png */}
      <button className="flex flex-col items-center justify-center w-[90px] h-[90px] bg-white/10 rounded-[8px] p-[12px] gap-[4px] border border-white/20 transition-all cursor-pointer hover:bg-white/20 group">
        {/* Plus Icon */}
        <Plus size={25} className="text-[#F6F9FF]" />
        
        {/* Button Text */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-white opacity-80 leading-tight">New</span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-white leading-tight">Student</span>
        </div>
      </button>
    </div>
  </div>

</div>

        {/* --- GRID for Critical Pending Payments/ Recent Activity (ROW 2) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Critical Pending Payments */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm hover:shadow-2xl hover:-translate-y-1">
            <div className="flex justify-between items-center mb-8">

              <h3 className="text-[16px] font-bold leading-[24px] text-[#2D3335]">Critical Pending Payments</h3>

              <span className="text-blue-500 text-[12px] font-bold text-[#2B6390] uppercase tracking-widest cursor-pointer">View All</span>
            </div>
            
            <div className="space-y-6">
              {/* Replace Critical Pending Payments  Hear */}





            </div>
          </div>

          {/*Recent Activity */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-50 shadow-sm hover:shadow-2xl hover:-translate-y-1">
            <div className="flex justify-between items-center mb-8">

               <h3 className="text-[16px] font-bold leading-[24px] text-[#2D3335]">Recent Activity</h3>

              {/*  */}
               <div className="w-3 h-4 font-bold text-[#CBD5E1]">
                <History />
               </div>
            </div>
            <div className="space-y-8 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-50">
              
              {/* Replace Activity Items Hear */}
             
            
             

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
