'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutGrid, 
  Users, 
  CreditCard, 
  FileText, 
  Video, 
  HelpCircle, 
  LogOut,
  Search,
  Bell,
  Settings,
  GraduationCap
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutGrid size={20} />, path: '/admin/dashboard' },
    { name: 'Students', icon: <Users size={20} />, path: '/admin/students' },
    { name: 'Payments', icon: <CreditCard size={20} />, path: '/admin/payments' },
    { name: 'Content', icon: <FileText size={20} />, path: '/admin/content' },
    { name: 'Live Classes', icon: <Video size={20} />, path: '/admin/live' },
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (error) {
      router.push('/login');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-100 flex flex-col fixed h-full z-50">
        
        {/* Brand Logo */}
        <div className="pt-8 pb-10 px-8">
          <h2 className="text-2xl font-black text-[#2B6390] tracking-tight">ICTFIRST.lk</h2>
        </div>

        {/* Profile Card */}
        <div className="px-6 mb-8">
          <div className="bg-[#F0F7FF] rounded-[2rem] p-4 flex items-center gap-4 border border-[#E1EFFE]">
            <div className="w-12 h-12 bg-[#93C5FD] rounded-2xl flex items-center justify-center text-white shadow-sm">
              <GraduationCap size={24} />
            </div>
            <div>
              <p className="text-[15px] font-bold text-[#1E40AF] leading-tight">Admin Portal</p>
              <p className="text-[11px] text-[#60A5FA] font-semibold mt-0.5">Mrs. Kalugampitiya</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-grow px-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-200 relative group ${
                  isActive 
                  ? 'bg-[#F0F7FF] text-[#2563EB]' 
                  : 'text-[#64748B] hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <span className={`${isActive ? 'text-[#2563EB]' : 'text-[#94A3B8] group-hover:text-slate-600'}`}>
                  {item.icon}
                </span>
                <span className="text-[15px] font-semibold">{item.name}</span>
                
                {/* Active Indicator Line (From Image) */}
                {isActive && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#2563EB] rounded-l-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="mt-auto p-6 space-y-2">
          <button className="w-full flex items-center gap-4 px-6 py-3 text-[#64748B] text-[15px] font-semibold hover:text-slate-900 transition-colors">
            <HelpCircle size={20} />
            Support
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-6 py-3 text-[#EF4444] text-[15px] font-semibold hover:bg-red-50 rounded-2xl transition-all"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow ml-72">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-10 sticky top-0 z-40">
          <div className="relative w-96 group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search anything..." 
              className="w-full bg-[#F1F5F9] border-none rounded-2xl py-2.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-100 transition-all outline-none font-medium"
            />
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2.5 text-slate-400 hover:bg-slate-50 rounded-xl relative transition-colors">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <button className="p-2.5 text-slate-400 hover:bg-slate-50 rounded-xl transition-colors">
              <Settings size={20} />
            </button>
            <div className="h-8 w-[1px] bg-slate-200 mx-2" />
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-blue-400 rounded-xl shadow-sm border border-white" />
            </div>
          </div>
        </header>

        {/* Content Container */}
        <div className="p-10 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}