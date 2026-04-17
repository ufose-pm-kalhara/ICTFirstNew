'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [formData, setFormData] = useState({ studentId: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        const userRole = data.role || data.user?.role;
        if (userRole === 'admin') {
          window.location.href = '/admin/dashboard';
        } else {
          window.location.href = '/student/dashboard';
        }
      } else {
        setError(data.message || 'Invalid Student ID or Password');
      }
    } catch (err) {
      setError('Connection failed. Please ensure your database is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900 antialiased">
      {/* Main Container */}
      <main className="flex-grow flex items-center justify-center p-6 md:p-12">
        <div className="max-w-5xl w-full bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[650px] border border-slate-100">
          
          {/* Left Side: Branding Area */}
          <div 
            className="md:w-1/2 p-12 text-white flex flex-col justify-between relative overflow-hidden"
            style={{ background: 'linear-gradient(180deg, #2B6390 0%, #1A5783 100%)' }}
          >
            {/* Visual element matching sidebar style subtle overlay */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            
            <div className="relative z-10">
              <h2 className="text-2xl font-black tracking-tight mb-16 text-white/90">ICTFIRST.lk</h2>
              
              <h1 className="text-5xl font-black leading-[1.1] mb-6 italic tracking-tighter uppercase">
                Welcome Back to Your Academic Atelier.
              </h1>
              <p className="text-blue-50/80 text-[15px] font-semibold leading-relaxed max-w-md">
                Continue your journey of intellectual clarity and professional mastery with our curated educational resources.
              </p>
            </div>

            <div className="relative z-10 flex items-center gap-4 mt-8">
              <div className="flex -space-x-2">
                {[11, 12, 13].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-xl border-2 border-white/20 bg-slate-400/30 overflow-hidden backdrop-blur-sm">
                    <img src={`https://i.pravatar.cc/100?img=${i}`} alt="user" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
              <p className="text-[11px] font-bold text-blue-100/70 uppercase tracking-widest">2,000+ active learners</p>
            </div>
          </div>

          {/* Right Side: Login Form */}
          <div className="md:w-1/2 p-12 flex flex-col justify-center bg-white">
            <div className="max-w-md mx-auto w-full">
              <h2 className="text-[28px] font-black text-slate-900 mb-1 tracking-tight">Portal Login</h2>
              <p className="text-slate-400 text-[13px] font-semibold mb-10">Please enter your credentials to access the portal.</p>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-[13px] font-bold">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Student ID Input */}
                <div>
                  <label className="block text-[14px] font-bold text-slate-700 mb-2">Student ID</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your ID"
                    className="w-full bg-[#F1F5F9] border-none rounded-2xl py-3.5 px-5 text-[15px] focus:ring-2 focus:ring-[#2B6390]/20 transition-all outline-none font-medium text-slate-900"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, studentId: e.target.value.toUpperCase() })}
                  />
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[14px] font-bold text-slate-700">Password</label>
                    <Link href="/forgot-password" style={{ color: '#2B6390' }} className="text-[13px] font-bold hover:underline">
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      className="w-full bg-[#F1F5F9] border-none rounded-2xl py-3.5 px-5 text-[15px] focus:ring-2 focus:ring-[#2B6390]/20 transition-all outline-none font-medium text-slate-900"
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? "🔒" : "👁️"}
                    </button>
                  </div>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{ background: 'linear-gradient(90deg, #2B6390 0%, #1A5783 100%)' }}
                  className="w-full py-4 text-white rounded-2xl font-bold text-[15px] flex items-center justify-center gap-2 hover:opacity-95 transition-all shadow-lg shadow-[#2B6390]/20 active:scale-[0.98] disabled:opacity-50 mt-4"
                >
                  {loading ? "Authenticating..." : "Login to Dashboard"}
                </button>
              </form>

              <div className="relative my-10 flex items-center justify-center">
                <div className="absolute w-full h-[1px] bg-slate-100"></div>
                <span className="relative bg-white px-4 text-[13px] font-bold text-slate-300 uppercase tracking-widest">OR</span>
              </div>

              <div className="text-center">
                <p className="text-[14px] text-slate-400 mb-1 font-medium">New to ICTFIRST?</p>
                <Link href="/register" style={{ color: '#2B6390' }} className="text-[15px] font-bold hover:underline">
                  Create a student account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer synchronized with Admin Header/Footer style */}
      <footer className="max-w-7xl mx-auto w-full px-10 py-10 flex flex-col md:row justify-between items-center text-[13px] text-slate-400 font-semibold border-t border-slate-100 md:flex-row">
        <div className="text-center md:text-left mb-6 md:mb-0">
          <div className="text-[#2B6390] font-black text-lg mb-1">ICTFIRST.lk</div>
          <p>© 2024 Admin Portal • Mrs. Kalugampitiya</p>
        </div>
        
      </footer>
    </div>
  );
}