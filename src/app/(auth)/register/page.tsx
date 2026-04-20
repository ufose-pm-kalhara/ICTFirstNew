'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    grade: null as number | null, 
    whatsapp: '' 
  });
  
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false); 
  const router = useRouter();

  const passChecks = {
    length: formData.password.length >= 8,
    hasUpper: /[A-Z]/.test(formData.password),
    hasSymbol: /[!@#$%^&*(),.?":{}|<> ]/.test(formData.password)
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
    setFormData({ ...formData, fullName: value });
  };

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setFormData({ ...formData, whatsapp: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.whatsapp.length !== 10) {
      setError('WhatsApp number must be exactly 10 digits.');
      setLoading(false);
      return;
    }

    if (!passChecks.length || !passChecks.hasUpper || !passChecks.hasSymbol) {
      setError('Password does not meet the security requirements.');
      setLoading(false);
      return;
    }

    if (formData.password !== confirmPassword) {
      setError('Passwords do not match.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          phone: formData.whatsapp 
        }),
      });

      const data = await res.json();

      if (data.success) {
        setIsSuccess(true);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Connection to server failed. Is XAMPP running?');
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F1F3F5] px-4 font-sans text-gray-800">
        <div className="max-w-md w-full p-10 border rounded-3xl shadow-xl bg-white text-center">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-[#1A5683] mb-4">Registration Received!</h2>
          <div className="space-y-4 text-gray-600 leading-relaxed">
            <p className="font-medium">Thank you for joining ICT FIRST.lk.</p>
            <p className="text-sm bg-blue-50 p-4 rounded-xl border border-blue-100">
              Your account is currently <span className="text-blue-700 font-bold">pending approval</span>. 
              Once the administrator verifies your details, you will receive your unique **Student ID** via WhatsApp.
            </p>
            <p className="text-xs text-gray-400 italic">
              Please ensure your WhatsApp number is active to receive your credentials.
            </p>
          </div>
          <button 
            onClick={() => router.push('/')} 
            className="w-full mt-10 py-4 bg-[#1A5683] text-white rounded-xl font-bold hover:bg-[#15466A] transition active:scale-[0.98] shadow-lg"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F1F3F5] font-sans text-gray-800 antialiased">
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="text-xl font-extrabold text-[#1A5683]">ICT FIRST.lk</div>
        <button onClick={() => router.push('/login')} className="px-6 py-2.5 bg-[#1A5683] text-white rounded-lg font-semibold hover:bg-[#15466A] text-sm transition">
          Login
        </button>
      </nav>

      <main className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center px-6 py-16 md:py-24">
        {/* Left Side: Branding Area */}
        <div className="md:pr-12">
          <span className="text-[#1A5683] uppercase font-bold text-xs tracking-[0.15em] bg-[#1A5683]/5 px-3 py-1 rounded-full border border-[#1A5683]/10">
            ICTFIRST 
          </span>
          <div className="mt-6 space-y-2">
            <h1 className="text-5xl md:text-6xl font-black text-[#1A5683] leading-[1.1]">
              Begin Your<br /> Intellectual<br /> Journey.
            </h1>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-500 mt-2">
              ඔබේ දැනුමේ ගවේෂණය මෙතැනින් අරඹන්න.
            </h2>
          </div>
          <div className="mt-10 space-y-4 border-l-4 border-[#1A5683]/20 pl-6 py-2">
            <p className="text-gray-600 text-[17px] font-medium leading-relaxed max-w-xl">
              Join a community dedicated to rigorous academic excellence and personalized mentorship.
            </p>
            <p className="text-slate-500 text-[15px] font-medium leading-relaxed italic opacity-80">
              විශිෂ්ට ප්‍රතිඵල සහ නිවැරදි මගපෙන්වීමක් සඳහා කැපවූ අපගේ අධ්‍යාපනික ප්‍රජාව හා අදම එක්වන්න.
            </p>
          </div>
        </div>

        {/* Right Side: Register Form */}
        <div className="flex justify-center md:justify-end">
          <div className="w-full max-w-xl p-10 bg-white border border-gray-100 rounded-[2.5rem] shadow-2xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
            <p className="text-sm text-gray-500 mb-10">Welcome to the LMS Learning Portal.</p>
            
            {error && (
              <div className="p-4 mb-8 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm text-center font-medium">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                  <input
                    type="text" required value={formData.fullName} placeholder="Alexander Pierce"
                    className="w-full p-4 border border-gray-200 bg-[#E8EBF0] rounded-xl focus:ring-2 focus:ring-[#1A5683] focus:bg-white outline-none text-gray-900 transition-all"
                    onChange={handleNameChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                  <input
                    type="email" required placeholder="alex@academy.com"
                    className="w-full p-4 border border-gray-200 bg-[#E8EBF0] rounded-xl focus:ring-2 focus:ring-[#1A5683] focus:bg-white outline-none text-gray-900 transition-all"
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Class Grade</label>
                  <select required className="w-full p-4 border border-gray-200 bg-[#E8EBF0] rounded-xl focus:ring-2 focus:ring-[#1A5683] focus:bg-white outline-none text-gray-900 transition-all cursor-pointer appearance-none" defaultValue="" onChange={(e) => setFormData({ ...formData, grade: parseInt(e.target.value) })}>
                    <option value="" disabled>--- Select ---</option>
                    <option value="10">Class 10 (GD10)</option>
                    <option value="11">Class 11 (GD11)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Whatsapp Number</label>
                  <input
                    type="text" required value={formData.whatsapp} placeholder="07XXXXXXXX"
                    className="w-full p-4 border border-gray-200 bg-[#E8EBF0] rounded-xl focus:ring-2 focus:ring-[#1A5683] focus:bg-white outline-none text-gray-900 transition-all"
                    onChange={handleWhatsappChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                  <input
                    type={showPass ? "text" : "password"} required placeholder="••••••••"
                    className="w-full p-4 pr-12 border border-gray-200 bg-[#E8EBF0] rounded-xl focus:ring-2 focus:ring-[#1A5683] focus:bg-white outline-none text-gray-900 transition-all"
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-11 text-gray-400 hover:text-[#1A5683]">
                    {showPass ? "🙈" : "👁️"}
                  </button>
                  <div className="mt-2 space-y-1">
                    <p className={`text-[10px] ${passChecks.length ? 'text-green-600 font-bold' : 'text-gray-400'}`}>✓ Min. 8 characters</p>
                    <p className={`text-[10px] ${passChecks.hasUpper ? 'text-green-600 font-bold' : 'text-gray-400'}`}>✓ One uppercase letter</p>
                    <p className={`text-[10px] ${passChecks.hasSymbol ? 'text-green-600 font-bold' : 'text-gray-400'}`}>✓ One special symbol (@#$)</p>
                  </div>
                </div>
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm Password</label>
                  <input
                    type={showConfirm ? "text" : "password"} required placeholder="••••••••"
                    className={`w-full p-4 pr-12 border rounded-xl focus:ring-2 outline-none transition-all ${confirmPassword && formData.password !== confirmPassword ? 'border-red-400 bg-red-50 focus:ring-red-400' : 'border-gray-200 bg-[#E8EBF0] focus:ring-[#1A5683]'}`}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-11 text-gray-400 hover:text-[#1A5683]">
                    {showConfirm ? "🙈" : "👁️"}
                  </button>
                  {confirmPassword && formData.password !== confirmPassword && (
                    <p className="text-[10px] text-red-500 mt-1 font-medium">Passwords do not match.</p>
                  )}
                </div>
              </div>

              <div className="flex items-start">
                <input id="terms" type="checkbox" required checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-1 h-4 w-4 rounded border-gray-300 text-[#1A5683] focus:ring-[#1A5683] cursor-pointer" />
                <label htmlFor="terms" className="ml-3 text-sm text-gray-600 cursor-pointer leading-relaxed">
                    I agree to the <Link href="/" className="text-[#1A5683] font-bold hover:underline">Terms of Service</Link> and <Link href="/" className="text-[#1A5683] font-bold hover:underline">Privacy Policy</Link>.
                </label>
              </div>

              <button type="submit" disabled={loading || !agreed} className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition ${ (loading || !agreed) ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#1A5683] hover:bg-[#15466A] active:scale-[0.98]' }`}>
                {loading ? 'Validating...' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}