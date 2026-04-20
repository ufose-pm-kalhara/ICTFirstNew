'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  Maximize2, 
  X, 
  FileText, 
  ChevronLeft, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface AdminPayment {
  id: number;
  full_name: string;
  student_id: string;
  amount: number;
  status: string;
  proof_url: string;
  created_at: string;
}

export default function AdminPayments() {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<AdminPayment | null>(null);
  const [remarks, setRemarks] = useState(''); 
  
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    fetch('/api/admin/payments')
      .then(res => res.json())
      .then(data => setPayments(data.payments));
  }, []);

  const pendingCount = payments.filter(p => p.status === 'pending').length;

  const sortedPayments = useMemo(() => {
    return [...payments].sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [payments]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; 
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedPayments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(payments.length / itemsPerPage);

  const updateStatus = async (id: number, status: 'approved' | 'rejected') => {
    const res = await fetch('/api/admin/payments', {
      method: 'PATCH',
      body: JSON.stringify({ 
        id, 
        status, 
        remarks: remarks || `Processed as ${status}` 
      }),
    });
    if (res.ok) {
      setPayments(payments.map(p => p.id === id ? { ...p, status } : p));
      setRemarks(''); 
    }
  };

  const proofSrc = selectedPayment?.proof_url 
    ? (selectedPayment.proof_url.startsWith('data:image') 
        ? selectedPayment.proof_url 
        : `data:image/jpeg;base64,${selectedPayment.proof_url}`)
    : null;

  return (
    <div className="font-sans text-slate-900">
      {/* Image Zoom Modal */}
      {showZoomModal && proofSrc && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4">
          <button 
            onClick={() => { setShowZoomModal(false); setIsZoomed(false); }}
            className="absolute top-6 right-6 z-[210] bg-white text-slate-900 p-3 rounded-full hover:bg-red-500 hover:text-white transition-all shadow-xl"
          >
            <X size={24} strokeWidth={2.5} />
          </button>

          <div 
            className={`relative max-w-5xl max-h-full overflow-auto bg-white rounded-[2rem] shadow-2xl transition-all duration-300 ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
            onClick={() => setIsZoomed(!isZoomed)}
          >
            <img
              src={proofSrc}
              alt="Zoomed Slip"
              className={`block transition-transform duration-300 ease-in-out ${isZoomed ? 'scale-[2.0] m-20' : 'max-h-[85vh] w-auto h-auto p-4'}`}
            />
            {!isZoomed && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/80 text-white px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
                Click to Zoom
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Payment Verification</h1>
          <p className='text-slate-500 text-sm font-medium mt-1'>Review and approve bank transfer slips for student enrollments.</p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-slate-100 px-4 py-2 rounded-2xl shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">Pending Slips</span>
          <span className="bg-[#2563EB] text-white text-xs font-bold h-6 min-w-[2rem] flex items-center justify-center rounded-lg px-2">
            {pendingCount}
          </span>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[11px] font-bold uppercase text-slate-400 tracking-wider">Student Details</th>
                <th className="px-8 py-5 text-[11px] font-bold uppercase text-slate-400 tracking-wider text-center">Amount</th>
                <th className="px-8 py-5 text-[11px] font-bold uppercase text-slate-400 tracking-wider text-center">Submitted</th>
                <th className="px-8 py-5 text-[11px] font-bold uppercase text-slate-400 tracking-wider text-center">Status</th>
                <th className="px-8 py-5 text-[11px] font-bold uppercase text-slate-400 tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {currentItems.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold text-xs uppercase">
                        {p.full_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{p.full_name}</p>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tight">{p.student_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className="font-bold text-slate-700 text-sm">LKR {Number(p.amount).toLocaleString()}</span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <p className="text-xs font-semibold text-slate-500">
                      {new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                      p.status === 'approved' ? 'bg-green-50 text-green-600' :
                      p.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                    }`}>
                      <div className={`w-1 h-1 rounded-full ${
                        p.status === 'approved' ? 'bg-green-600' :
                        p.status === 'pending' ? 'bg-amber-600' : 'bg-red-600'
                      }`} />
                      {p.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => {setSelectedPayment(p); setRemarks(''); }}
                      className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold transition-all border border-slate-200 shadow-sm"
                    >
                      <FileText size={14} />
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-8 py-5 bg-slate-50/30 border-t border-slate-100 flex justify-between items-center">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, payments.length)} of {payments.length}
          </p>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
              disabled={currentPage === 1} 
              className={`p-2 rounded-lg transition-colors ${currentPage === 1 ? 'text-slate-200' : 'text-slate-500 hover:bg-white hover:shadow-sm'}`}
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
              disabled={currentPage === totalPages} 
              className={`p-2 rounded-lg transition-colors ${currentPage === totalPages ? 'text-slate-200' : 'text-slate-500 hover:bg-white hover:shadow-sm'}`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
       </div>
      </div>

      {/* Verification Detail Sidebar */}
      {selectedPayment && (
      <div className="fixed inset-0 z-[100] flex justify-end bg-slate-900/30 backdrop-blur-sm transition-opacity">
          <div className="absolute inset-0" onClick={() => setSelectedPayment(null)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 flex justify-between items-center border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Slip Verification</h2>
              <button onClick={() => setSelectedPayment(null)} className="text-slate-400 hover:text-slate-900 p-2 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* User Header */}
              <div className="bg-slate-50 p-5 rounded-2xl flex items-center gap-4 border border-slate-100">
                <div className="h-12 w-12 rounded-xl bg-[#2563EB] text-white flex items-center justify-center font-bold text-lg">
                  {selectedPayment.full_name.charAt(0)}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enrollment Request</p>
                  <p className="font-bold text-slate-900">{selectedPayment.full_name}</p>
                  <p className="text-xs text-[#2563EB] font-bold">LKR {Number(selectedPayment.amount).toLocaleString()}</p>
                </div>
              </div>

              {/* Image Preview */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Submitted Proof</h3>
                  <a 
                    href={selectedPayment.proof_url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-[11px] font-bold text-blue-600 flex items-center gap-1 hover:underline"
                  >
                    <ExternalLink size={12} />
                    Open Full Size
                  </a>
                </div>
          
                <div className="relative group rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 shadow-inner min-h-[320px] flex items-center justify-center">
                  {proofSrc ? (
                    <>
                      <Image
                        src={proofSrc}
                        alt="Uploaded Slip"
                        width={500}
                        height={500}
                        className="w-full h-auto object-contain cursor-pointer transition-transform group-hover:scale-[1.02]"
                        onClick={() => setShowZoomModal(true)}
                      />
                      <button 
                        onClick={() => setShowZoomModal(true)}
                        className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-lg border border-slate-100 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-[10px] font-bold uppercase text-slate-700"
                      >
                        <Maximize2 size={14} />
                        Zoom Slip
                      </button>
                    </>
                  ) : (
                    <div className="text-center">
                      <Clock size={32} className="mx-auto text-slate-200 mb-2" />
                      <p className="text-slate-400 text-xs font-medium">Image unavailable</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Remarks */}
              
            </div>

            <div className="p-6 border-t border-slate-100 grid grid-cols-2 gap-3 bg-slate-50/50">
              <button 
                onClick={() => { updateStatus(selectedPayment.id, 'rejected'); setSelectedPayment(null); }}
                className="flex items-center justify-center gap-2 bg-white text-red-600 border border-red-100 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wide hover:bg-red-50 transition-colors"
              >
                <XCircle size={16} />
                Reject
              </button>
              <button 
                onClick={() => { updateStatus(selectedPayment.id, 'approved'); setSelectedPayment(null); }}
                className="flex items-center justify-center gap-2 bg-[#2563EB] text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-wide hover:bg-blue-700 transition-shadow shadow-md shadow-blue-100"
              >
                <CheckCircle size={16} />
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}