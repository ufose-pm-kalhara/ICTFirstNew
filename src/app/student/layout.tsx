'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Bell, X, Menu, LogOut, ChevronRight, LayoutGrid, BookOpen, User } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [name, setName] = useState('Student');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const brandGradient = 'linear-gradient(135deg, #2B6390 0%, #1A5783 100%)';

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/student/notifications');
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetch('/api/student/profile')
      .then(res => res.json())
      .then(data => { if (data.success) setName(data.student.full_name.split(' ')[0]); });
  }, []);

  useEffect(() => {
    const initNotifications = async () => {
      await fetchNotifications();
    };
    initNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenNotifications = async () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications && unreadCount > 0) {
      setUnreadCount(0);
      await fetch('/api/student/notifications/read', { method: 'POST' });
    }
  };

  const handleLogout = async () => {
    const res = await fetch('/api/auth/logout', { method: 'POST' });
    if (res.ok) window.location.href = '/login';
  };

  const menu = [
    { name: 'Dashboard', path: '/student/dashboard', icon: <LayoutGrid size={18} /> },
    { name: 'Lessons', path: '/student/lessons', icon: <BookOpen size={18} /> },
    { name: 'Profile', path: '/student/profile', icon: <User size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      <nav className="h-20 bg-white/90 backdrop-blur-md border-b border-slate-100 px-6 md:px-12 flex justify-between items-center sticky top-0 z-[100]">
        
        <Link href="/student/dashboard" className="text-xl md:text-2xl font-black tracking-tight shrink-0" style={{ color: '#1A5783' }}>
          ICTFIRST.lk
        </Link>

        <div className="flex items-center gap-2 md:gap-4">
          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-2 mr-6">
            {menu.map(item => {
              const isActive = pathname === item.path;
              return (
                <Link 
                  key={item.path} 
                  href={item.path} 
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl transition-all duration-300 text-[15px] font-bold ${
                    isActive 
                      ? 'bg-[#F0F5FA] shadow-sm shadow-blue-900/5' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-[#1A5783]'
                  }`}
                  style={isActive ? { color: '#1A5783' } : {}}
                >
                  <span className={isActive ? 'opacity-100' : 'opacity-70'}>{item.icon}</span>
                  {item.name}
                </Link>
              );
            })}
          </div>

          <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden md:block"></div>

          {/* NOTIFICATION BELL */}
          <div className="relative">
            <button 
              onClick={handleOpenNotifications} 
              className={`p-2.5 rounded-2xl transition-all relative ${showNotifications ? 'bg-[#F0F5FA]' : 'text-slate-400 hover:bg-slate-50'}`}
              style={showNotifications ? { color: '#1A5783' } : {}}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-2.5 right-2.5 w-3 h-3 bg-[#E11D48] rounded-full border-2 border-white" />
              )}
            </button>

            {showNotifications && (
              <>
                <div className="fixed inset-0 z-10 bg-black/5 md:bg-transparent" onClick={() => setShowNotifications(false)}></div>
                {/* Responsive Notification Panel */}
                <div className="fixed md:absolute top-24 md:top-auto right-4 md:right-0 w-[calc(100vw-32px)] md:w-[380px] bg-white border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200 max-h-[80vh] flex flex-col">
                  <div className="p-5 md:p-7 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-[16px] font-black text-slate-800 tracking-tight">Recent Activity</h3>
                    <button onClick={() => setShowNotifications(false)} className="p-2 bg-slate-100 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"><X size={16} /></button>
                  </div>
                  <div className="overflow-y-auto p-3 md:p-4">
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <div key={n.id} className={`p-4 md:p-5 rounded-[1.5rem] mb-2 transition-all ${!n.is_read ? 'bg-[#F0F5FA]' : 'hover:bg-slate-50'}`}>
                          <div className="flex justify-between items-start gap-3">
                             <p className="text-[14px] font-bold text-slate-800 leading-tight">{n.title}</p>
                             {!n.is_read && <div className="w-2.5 h-2.5 rounded-full mt-1 shrink-0" style={{ background: brandGradient }} />}
                          </div>
                          <p className="text-[13px] text-slate-500 mt-2 leading-relaxed font-medium">{n.message}</p>
                          <p className="text-[11px] text-slate-400 mt-4 font-bold uppercase tracking-widest">
                            {new Date(n.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="py-16 md:py-20 text-center">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Bell size={20} className="text-slate-200" />
                        </div>
                        <p className="text-slate-300 text-[14px] font-bold uppercase tracking-widest">Quiet for now</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            onClick={handleLogout}
            className="hidden md:flex items-center gap-2 text-slate-400 font-bold text-[14px] hover:text-[#EF4444] px-4 py-2 rounded-xl transition-all"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>

          <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2.5 rounded-xl text-white" style={{ background: brandGradient }}>
            <Menu size={20} />
          </button>
        </div>
      </nav>

      <div className={`fixed inset-0 z-[110] transition-all duration-500 md:hidden ${isMobileMenuOpen ? 'visible' : 'invisible'}`}>
        <div className={`absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-500 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsMobileMenuOpen(false)}></div>
        <aside className={`absolute top-0 right-0 w-80 h-full bg-white transition-transform duration-500 p-8 flex flex-col shadow-2xl ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-2xl font-black tracking-tight" style={{ color: '#1A5783' }}>ICTFIRST.lk</h2>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-slate-50 rounded-2xl text-slate-400"><X size={20} /></button>
          </div>
          
          <div className="space-y-3 flex-grow">
            {menu.map(item => {
              const isActive = pathname === item.path;
              return (
                <Link key={item.path} href={item.path} onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between p-5 rounded-[1.5rem] transition-all duration-300 ${
                    isActive ? 'shadow-lg shadow-blue-900/10 text-white' : 'text-slate-500 hover:bg-slate-50'
                  }`}
                  style={isActive ? { background: brandGradient } : {}}
                >
                  <span className="flex items-center gap-4 text-[16px] font-bold">
                    {item.icon}
                    {item.name}
                  </span>
                  <ChevronRight size={18} className={isActive ? 'opacity-100' : 'opacity-0'} />
                </Link>
              );
            })}
          </div>

          <div className="pt-8 border-t border-slate-100">
             <button onClick={handleLogout} className="w-full p-5 flex items-center gap-4 text-[#EF4444] font-black text-[14px] uppercase tracking-widest rounded-[1.5rem] hover:bg-red-50 transition-all">
                <LogOut size={20} /> Logout Account
             </button>
          </div>
        </aside>
      </div>

      <main className="p-6 md:p-12 max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        {children}
      </main>
    </div>
  );
}