'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Bell, X, Menu, LogOut, ChevronRight } from 'lucide-react';


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
    (async () => {
      await fetchNotifications();
    })();
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
    { name: 'Dashboard', path: '/student/dashboard', icon: '📊' },
    { name: 'Lessons', path: '/student/lessons', icon: '📖' },
    { name: 'Profile', path: '/student/profile', icon: '👤' },
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-slate-900">
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-100 px-6 lg:px-12 py-4 flex justify-between items-center sticky top-0 z-[100]">
        
        <Link href="/student/dashboard" className="text-[#1A5683] font-black text-xl italic tracking-tighter uppercase">
          ICTFIRST.lk
        </Link>

        <div className="flex items-center gap-2 md:gap-6">
          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-8 mr-4">
            {menu.map(item => (
              <Link key={item.path} href={item.path} className={`text-[10px] font-black uppercase tracking-widest relative py-1 transition-colors ${pathname === item.path ? 'text-[#1A5683]' : 'text-slate-400 hover:text-slate-600'}`}>
                {item.name}
                {pathname === item.path && <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-[#1A5683] rounded-full" />}
              </Link>
            ))}
          </div>

          {/* NOTIFICATION BELL */}
          <div className="relative">
            <button onClick={handleOpenNotifications} className={`p-2 rounded-xl transition-all relative ${showNotifications ? 'bg-slate-100 text-[#1A5683]' : 'text-slate-400 hover:bg-slate-50'}`}>
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-bold flex items-center justify-center rounded-full border-2 border-white animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)}></div>
                <div className="absolute right-0 mt-4 w-[320px] bg-white border border-slate-100 shadow-2xl rounded-3xl overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500">Notifications</h3>
                    <button onClick={() => setShowNotifications(false)} className="text-slate-300 hover:text-slate-600"><X size={16} /></button>
                  </div>
                  <div className="max-h-[380px] overflow-y-auto p-2">
                    {notifications.length > 0 ? (
                      notifications.map(n => (
                        <div key={n.id} className={`p-4 rounded-2xl mb-1 transition-all ${!n.is_read ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}>
                          <div className="flex justify-between items-start gap-2">
                             <p className="text-[12px] font-bold text-slate-800 leading-tight">{n.title}</p>
                             {!n.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 shrink-0" />}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">{n.message}</p>
                          <p className="text-[9px] text-slate-400 mt-3 font-bold uppercase tracking-tighter">
                            {new Date(n.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center text-slate-300 text-[11px] font-bold uppercase tracking-widest">No alerts yet</div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="h-6 w-[1px] bg-slate-100 mx-1 hidden md:block"></div>

          {/* DESKTOP LOGOUT & PROFILE */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-400 hover:text-red-600 transition-colors p-2">
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </div>

          {/* MOBILE TOGGLE */}
          <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 text-[#1A5683] bg-slate-50 rounded-xl">
            <Menu size={20} />
          </button>
        </div>
      </nav>

      {/* MOBILE DRAWER */}
      <div className={`fixed inset-0 z-[110] transition-all duration-300 md:hidden ${isMobileMenuOpen ? 'visible' : 'invisible'}`}>
        <div className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setIsMobileMenuOpen(false)}></div>
        <aside className={`absolute top-0 right-0 w-80 h-full bg-white transition-transform duration-300 p-8 flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex justify-between items-center mb-10">
            <p className="text-[#1A5683] font-black italic tracking-tighter uppercase text-lg">Menu</p>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-slate-50 rounded-xl text-slate-400"><X size={20} /></button>
          </div>
          
          <div className="space-y-2 flex-grow">
            {menu.map(item => (
              <Link key={item.path} href={item.path} onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center justify-between p-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all ${pathname === item.path ? 'bg-blue-50 text-[#1A5683]' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                <span className="flex items-center gap-4">
                  <span className="text-lg">{item.icon}</span>
                  {item.name}
                </span>
                <ChevronRight size={14} className={pathname === item.path ? 'opacity-100' : 'opacity-0'} />
              </Link>
            ))}
          </div>

          <div className="pt-6 border-t border-slate-100">
             <button onClick={handleLogout} className="w-full p-4 flex items-center gap-4 text-red-400 font-black text-[11px] uppercase tracking-widest border border-red-50 rounded-2xl hover:bg-red-50 transition">
                <LogOut size={18} /> Logout Account
             </button>
          </div>
        </aside>
      </div>

      <main className="p-6 md:p-12 animate-in fade-in duration-500">
        {children}
      </main>
    </div>
  );
}