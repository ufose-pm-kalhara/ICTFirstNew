'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [name, setName] = useState('Student');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch('/api/student/profile')
      .then(res => res.json())
      .then(data => {
        if (data.success) setName(data.student.full_name.split(' ')[0]);
      });
  }, []);

  const handleLogout = async () => {
    const res = await fetch('/api/auth/logout', { method: 'POST' });
    if (res.ok) {
      window.location.href = '/login';
    }
  };

  const menu = [
    { name: 'Dashboard', path: '/student/dashboard', icon: '📊' },
    { name: 'Lessons', path: '/student/lessons', icon: '📖' },
    { name: 'Profile', path: '/student/profile', icon: '👤' },
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans">
      {/* --- NAVBAR --- */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 lg:px-12 py-4 flex justify-between items-center sticky top-0 z-[100] shadow-sm">
        
        {/* Logo */}
        <Link href="/student/dashboard" className="text-[#1A5683] font-black text-xl italic tracking-tighter uppercase select-none">
          ICTFIRST.lk
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <div className="flex gap-8">
            {menu.map(item => (
              <Link 
                key={item.path} 
                href={item.path} 
                className={`text-[10px] font-black uppercase tracking-[0.15em] transition-all relative py-1 ${
                  pathname === item.path ? 'text-[#1A5683]' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {item.name}
                {pathname === item.path && (
                  <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-[#1A5683] rounded-full" />
                )}
              </Link>
            ))}
          </div>

          <div className="h-4 w-[1px] bg-gray-200 mx-2"></div>

          <div className="flex items-center gap-4">
             <button 
                onClick={handleLogout}
                className="text-[10px] font-black text-red-400 uppercase tracking-widest hover:text-red-500 transition"
              >
                Logout 🚪
              </button>
              
              <Link href="/student/profile">
                <div className="bg-[#1A5683] px-5 py-2 rounded-xl text-white font-black text-[10px] uppercase cursor-pointer hover:bg-slate-900 transition-all shadow-lg shadow-blue-900/10">
                   {name}
                </div>
              </Link>
          </div>
        </div>

        {/* Mobile Toggle Button */}
        <button 
          className="md:hidden p-2 text-[#1A5683]"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16m-7 6h7" /></svg>
          )}
        </button>
      </nav>

      {/* --- MOBILE DRAWER --- */}
      <div className={`fixed inset-0 z-[90] transition-all duration-300 md:hidden ${isMobileMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
        {/* Backdrop */}
        <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
        
        {/* Sidebar Content */}
        <aside className={`absolute top-0 right-0 w-72 h-full bg-white shadow-2xl transition-transform duration-300 p-8 flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex flex-col items-center mb-10 mt-8">
             <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl mb-4">👤</div>
             <p className="font-black text-slate-800 text-lg tracking-tight uppercase italic">{name}</p>
             <p className="text-[9px] text-slate-400 font-bold tracking-[0.2em] uppercase">Student Panel</p>
          </div>

          <div className="space-y-2">
            {menu.map(item => (
              <Link 
                key={item.path} 
                href={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-4 p-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                  pathname === item.path ? 'bg-blue-50 text-[#1A5683]' : 'text-slate-400 hover:bg-slate-50'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </div>

          <div className="mt-auto">
             <button 
                onClick={handleLogout}
                className="w-full p-4 flex items-center gap-4 text-red-400 font-black text-xs uppercase tracking-widest border border-red-50 rounded-2xl hover:bg-red-50 transition"
              >
                🚪 Logout Account
              </button>
          </div>
        </aside>
      </div>

      {/* --- PAGE CONTENT --- */}
      <main className="animate-in fade-in duration-500">
        {children}
      </main>
    </div>
  );
}