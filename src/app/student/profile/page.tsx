'use client';

import { useState, useEffect } from 'react';

interface Student {
  id: number;
  student_id: string;
  full_name: string;
  email: string;
  grade: number;
  phone: string;
  profile_image: string | null;
}

export default function StudentProfile() {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Password States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  // Toggle Visibility States
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetch('/api/student/profile')
      .then(res => res.json())
      .then(data => {
        if (data.success) setStudent(data.student);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleUpdateProfile = async () => {
    if (!student) return;
    const res = await fetch('/api/student/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: student.full_name,
        grade: student.grade,
        phone: student.phone
      })
    });
    if (res.ok) alert("Profile Updated Successfully!");
  };

  const handleUpdatePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    setPassLoading(true);
    const res = await fetch('/api/student/profile/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    setPassLoading(false);
    if (res.ok) {
      alert("Password Updated!");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      alert("Failed to update password. Check current password.");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-[#1A5683] italic text-2xl uppercase">ICTFIRST.lk</div>;
  if (!student) return <div className="p-20 text-center font-bold">Session expired. Please login again.</div>;

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-20 font-sans select-none">
      <main className="max-w-6xl mx-auto px-6 pt-16">
        
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-16">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-[6px] border-white shadow-2xl overflow-hidden bg-slate-100 ring-1 ring-slate-100 relative">
              <img 
                src={student.profile_image || `https://ui-avatars.com/api/?name=${student.full_name}&background=1A5683&color=fff`} 
                alt="Profile" 
                className="w-full h-full object-cover" 
              />
              <button className="absolute bottom-0 right-0 bg-[#1A5683] p-2 rounded-full border-2 border-white text-white scale-90 hover:scale-105 transition-transform">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </button>
            </div>
          </div>
          <h1 className="text-4xl font-black text-slate-800 mt-6 tracking-tighter uppercase italic leading-none">{student.full_name}</h1>
          
          {/* ✅ STUDENT ID ADDED HERE */}
          <div className="mt-4 flex flex-col items-center gap-2">
            <span className="bg-[#1A5683] text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-blue-900/20">
              ID: {student.student_id}
            </span>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">Grade {student.grade} • ICT Student</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* LEFT COLUMN: Identity & Connectivity */}
          <div className="space-y-10">
            <section className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-50">
              <h3 className="font-black text-slate-800 mb-8 flex items-center gap-3 uppercase text-sm tracking-tight italic">
                <span className="w-6 h-6 bg-blue-50 text-[#1A5683] rounded-lg flex items-center justify-center not-italic">🪪</span> Personal Identity
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Full Name</label>
                  <input 
                    type="text" 
                    value={student.full_name}
                    onChange={(e) => setStudent({...student, full_name: e.target.value})}
                    className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#1A5683]/10 border border-transparent focus:border-[#1A5683]/20 font-bold text-slate-700 transition-all"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Grade Level</label>
                  <select 
                    value={student.grade}
                    onChange={(e) => setStudent({...student, grade: parseInt(e.target.value)})}
                    className="w-full p-4 bg-slate-50 rounded-2xl outline-none appearance-none font-bold text-slate-700 border border-transparent focus:border-[#1A5683]/20 cursor-pointer"
                  >
                    <option value={10}>Grade 10</option>
                    <option value={11}>Grade 11</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-50">
              <h3 className="font-black text-slate-800 mb-8 flex items-center gap-3 uppercase text-sm tracking-tight italic">
                <span className="w-6 h-6 bg-blue-50 text-[#1A5683] rounded-lg flex items-center justify-center not-italic">@</span> Connectivity
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Email Address</label>
                  <div className="relative">
                    <input type="text" value={student.email} disabled className="w-full p-4 pl-12 bg-slate-50 rounded-2xl font-bold text-slate-400 border border-slate-100" />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">✉️</span>
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">WhatsApp Number</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={student.phone}
                      onChange={(e) => setStudent({...student, phone: e.target.value})}
                      className="w-full p-4 pl-12 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#1A5683]/10 font-bold text-slate-700 transition-all"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">📞</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: Security & Access */}
          <div>
            <section className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-50 h-full">
              <h3 className="font-black text-slate-800 mb-8 flex items-center gap-3 uppercase text-sm tracking-tight italic">
                <span className="w-6 h-6 bg-blue-50 text-[#1A5683] rounded-lg flex items-center justify-center not-italic">🛡️</span> Security & Access
              </h3>
              <div className="space-y-6">
                
                {/* Current Password with Visibility Toggle */}
                <div className="relative">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Current Password</label>
                  <input 
                    type={showCurrent ? "text" : "password"} 
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full p-4 pr-12 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#1A5683]/10 font-bold text-slate-700 transition-all"
                  />
                  <button 
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-4 top-[38px] text-slate-300 hover:text-[#1A5683] transition-colors"
                  >
                    {showCurrent ? '🔒' : '👁️'}
                  </button>
                </div>

                {/* New Password with Visibility Toggle */}
                <div className="relative">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">New Password</label>
                  <input 
                    type={showNew ? "text" : "password"} 
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-4 pr-12 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#1A5683]/10 font-bold text-slate-700 transition-all"
                  />
                  <button 
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-4 top-[38px] text-slate-300 hover:text-[#1A5683] transition-colors"
                  >
                    {showNew ? '🔒' : '👁️'}
                  </button>
                </div>

                {/* Confirm Password with Visibility Toggle */}
                <div className="relative">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2 px-1">Confirm New Password</label>
                  <input 
                    type={showConfirm ? "text" : "password"} 
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-4 pr-12 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#1A5683]/10 font-bold text-slate-700 transition-all"
                  />
                  <button 
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-4 top-[38px] text-slate-300 hover:text-[#1A5683] transition-colors"
                  >
                    {showConfirm ? '🔒' : '👁️'}
                  </button>
                </div>

                <button 
                  onClick={handleUpdatePassword}
                  disabled={passLoading}
                  className="w-full py-4 bg-[#1A5683] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-900 transition-all shadow-lg shadow-blue-900/10 active:scale-[0.98]"
                >
                  {passLoading ? 'Updating...' : 'Update Password'} <span>🔄</span>
                </button>

                <div className="mt-8 p-6 bg-blue-50/50 rounded-3xl border border-blue-100 flex gap-4">
                  <span className="text-xl">ℹ️</span>
                  <p className="text-[11px] font-bold text-[#1A5683] leading-relaxed">
                    Ensure your password is at least 12 characters long with a mix of letters and symbols.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="mt-16 flex justify-center items-center gap-4">
          <button 
            onClick={() => window.location.reload()} 
            className="px-10 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
          >
            Discard Changes
          </button>
          <button 
            onClick={handleUpdateProfile} 
            className="px-12 py-4 bg-[#1A5683] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-blue-900/20 hover:scale-105 transition-all active:scale-95"
          >
            Save Profile
          </button>
        </div>
      </main>
    </div>
  );
}