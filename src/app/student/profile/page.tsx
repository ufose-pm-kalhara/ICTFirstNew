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

const ActionButtons = ({ isMobile = false, onUpdateProfile }: { isMobile?: boolean; onUpdateProfile: () => void }) => (
  <div className={`flex flex-col sm:flex-row justify-center items-center gap-5 ${isMobile ? 'mt-10 lg:hidden' : 'mt-16 hidden lg:flex'}`}>
    <button 
      onClick={() => window.location.reload()} 
      className="w-full sm:w-auto px-12 py-4.5 bg-white text-slate-400 border border-slate-200 rounded-2xl font-bold text-[13px] uppercase tracking-widest hover:bg-slate-50 transition-all"
    >
      Discard Changes
    </button>
    <button 
      onClick={onUpdateProfile} 
      className="w-full sm:w-auto px-16 py-4.5 bg-[#1A5783] text-white rounded-2xl font-bold text-[13px] uppercase tracking-widest shadow-2xl shadow-blue-900/20 hover:scale-105 transition-all active:scale-95"
    >
      Save Account Profile
    </button>
  </div>
);

export default function StudentProfile() {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);

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

  // Validation Helper
  const rules = {
    length: newPassword.length >= 8,
    upper: /[A-Z]/.test(newPassword),
    lower: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    match: newPassword !== '' && newPassword === confirmPassword
  };

  const handleUpdateProfile = async () => {
    if (!student) return;
    if (student.phone.length !== 10) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }
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
    if (!Object.values(rules).every(Boolean)) {
      alert("Please fulfill all password requirements.");
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center font-black text-[#1A5783] italic text-2xl uppercase tracking-widest">
      ICTFIRST.lk
    </div>
  );

  if (!student) return <div className="p-20 text-center font-bold text-slate-400">Session expired. Please login again.</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans select-none">
      <main className="max-w-6xl mx-auto px-6 pt-16">
        
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-16">
          <div className="relative group">
            <div className="w-36 h-36 rounded-full border-[6px] border-white shadow-2xl overflow-hidden bg-slate-100 ring-1 ring-slate-100 relative">
              <img 
                src={student.profile_image || `https://ui-avatars.com/api/?name=${student.full_name}&background=1A5783&color=fff`} 
                alt="Profile" 
                className="w-full h-full object-cover" 
              />
            </div>
          </div>
          <h1 className="text-4xl font-black text-slate-800 mt-8 tracking-tighter uppercase italic leading-none text-center">{student.full_name}</h1>
          <div className="mt-5 flex flex-col items-center gap-3">
            <span className="bg-[#1A5783] text-white text-[11px] font-black px-6 py-2 rounded-full uppercase tracking-widest shadow-xl shadow-blue-900/10">
              Student ID: {student.student_id}
            </span>
            <p className="text-slate-400 font-bold text-[11px] uppercase tracking-[0.2em]">Grade {student.grade} • Registered Student</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Left Column: Identity & Contact */}
          <div className="bg-white lg:bg-transparent rounded-[2.5rem] lg:rounded-none shadow-sm lg:shadow-none border border-slate-100 lg:border-none overflow-hidden">
            <div className="space-y-0 lg:space-y-10">
              <section className="bg-white lg:rounded-[2.5rem] p-10 lg:shadow-sm lg:border border-slate-100">
                <h3 className="font-black text-slate-800 mb-10 flex items-center gap-3 uppercase text-[13px] tracking-wider italic">
                  <span className="w-8 h-8 bg-[#F0F5FA] text-[#1A5783] rounded-xl flex items-center justify-center not-italic">🪪</span> Identity Details
                </h3>
                <div className="space-y-7">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 px-1">Full Legal Name</label>
                    <input 
                      type="text" 
                      value={student.full_name}
                      onChange={(e) => setStudent({...student, full_name: e.target.value})}
                      className="w-full p-4.5 bg-slate-50 rounded-2xl outline-none focus:ring-4 focus:ring-[#1A5783]/5 border border-transparent focus:border-[#1A5783]/10 font-bold text-slate-700 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 px-1">Academic Grade</label>
                    <div className="relative">
                      <select 
                        value={student.grade}
                        onChange={(e) => setStudent({...student, grade: parseInt(e.target.value)})}
                        className="w-full p-4.5 bg-slate-50 rounded-2xl outline-none appearance-none font-bold text-slate-700 border border-transparent focus:border-[#1A5783]/10 cursor-pointer"
                      >
                        <option value={10}>Grade 10</option>
                        <option value={11}>Grade 11</option>
                      </select>
                      <span className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</span>
                    </div>
                  </div>
                </div>
              </section>

              <div className="mx-10 border-t border-slate-100 lg:hidden"></div>

              <section className="bg-white lg:rounded-[2.5rem] p-10 lg:shadow-sm lg:border border-slate-100">
                <h3 className="font-black text-slate-800 mb-10 flex items-center gap-3 uppercase text-[13px] tracking-wider italic">
                  <span className="w-8 h-8 bg-[#F0F5FA] text-[#1A5783] rounded-xl flex items-center justify-center not-italic">@</span> Contact Information
                </h3>
                <div className="space-y-7">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 px-1">Login Email (Read-only)</label>
                    <div className="relative">
                      <input type="text" value={student.email} disabled className="w-full p-4.5 pl-12 bg-slate-50 rounded-2xl font-bold text-slate-400 border border-slate-100 opacity-60 cursor-not-allowed" />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2">✉️</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 px-1">WhatsApp Connectivity</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={student.phone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, ''); 
                          if (val.length <= 10) {
                            setStudent({...student, phone: val});
                          }
                        }}
                        placeholder="07XXXXXXXX"
                        className="w-full p-4.5 pl-12 bg-slate-50 rounded-2xl outline-none focus:ring-4 focus:ring-[#1A5783]/5 font-bold text-slate-700 transition-all"
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2">📞</span>
                    </div>
                  </div>
                </div>
                <ActionButtons isMobile={true} onUpdateProfile={handleUpdateProfile} />
              </section>
            </div>
          </div>

          {/* Right Column: Security */}
          <div>
            <section className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 h-full">
              <h3 className="font-black text-slate-800 mb-10 flex items-center gap-3 uppercase text-[13px] tracking-wider italic">
                <span className="w-8 h-8 bg-[#F0F5FA] text-[#1A5783] rounded-xl flex items-center justify-center not-italic">🛡️</span> Security & Credentials
              </h3>
              <div className="space-y-7">
                <div className="relative">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 px-1">Current Password</label>
                  <input 
                    type={showCurrent ? "text" : "password"} 
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full p-4.5 pr-14 bg-slate-50 rounded-2xl outline-none focus:ring-4 focus:ring-[#1A5783]/5 font-bold text-slate-700 transition-all border border-transparent focus:border-[#1A5783]/10"
                  />
                  <button onClick={() => setShowCurrent(!showCurrent)} className="absolute right-5 top-[46px] text-slate-300 hover:text-[#1A5783] transition-colors">
                    {showCurrent ? '🔒' : '👁️'}
                  </button>
                </div>
                
                <div className="relative">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 px-1">New Password</label>
                  <input 
                    type={showNew ? "text" : "password"} 
                    placeholder="Create a strong password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-4.5 pr-14 bg-slate-50 rounded-2xl outline-none focus:ring-4 focus:ring-[#1A5783]/5 font-bold text-slate-700 transition-all border border-transparent focus:border-[#1A5783]/10"
                  />
                  <button onClick={() => setShowNew(!showNew)} className="absolute right-5 top-[46px] text-slate-300 hover:text-[#1A5783] transition-colors">
                    {showNew ? '🔒' : '👁️'}
                  </button>
                </div>

                <div className="relative">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3 px-1">Verify New Password</label>
                  <input 
                    type={showConfirm ? "text" : "password"} 
                    placeholder="Repeat new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-4.5 pr-14 bg-slate-50 rounded-2xl outline-none focus:ring-4 focus:ring-[#1A5783]/5 font-bold text-slate-700 transition-all border border-transparent focus:border-[#1A5783]/10"
                  />
                  <button onClick={() => setShowConfirm(!showConfirm)} className="absolute right-5 top-[46px] text-slate-300 hover:text-[#1A5783] transition-colors">
                    {showConfirm ? '🔒' : '👁️'}
                  </button>
                </div>

                {/* Password Rules List */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Security Requirements:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      { label: "8+ Characters", met: rules.length },
                      { label: "Uppercase (A-Z)", met: rules.upper },
                      { label: "Lowercase (a-z)", met: rules.lower },
                      { label: "Number (0-9)", met: rules.number },
                      { label: "Passwords Match", met: rules.match },
                    ].map((rule, i) => (
                      <div key={i} className={`flex items-center gap-2 text-[11px] font-bold transition-all duration-300 ${rule.met ? 'text-emerald-500 translate-x-1' : 'text-slate-400'}`}>
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] border ${rule.met ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 text-transparent'}`}>
                          ✓
                        </span>
                        {rule.label}
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={handleUpdatePassword}
                  disabled={passLoading}
                  className="w-full py-4.5 bg-[#1A5783] text-white rounded-2xl font-bold text-[13px] uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-blue-900/10 active:scale-[0.98] mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {passLoading ? 'Syncing...' : 'Update Password'} <span>🔄</span>
                </button>
              </div>
            </section>
          </div>
        </div>
        <ActionButtons isMobile={false} onUpdateProfile={handleUpdateProfile} />
      </main>
    </div>
  );
}