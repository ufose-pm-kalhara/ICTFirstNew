'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';

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
  const [remarks, setRemarks] = useState(''); // For the decision feedback box

  useEffect(() => {
    fetch('/api/admin/payments')
      .then(res => res.json())
      .then(data => setPayments(data.payments));
  }, []);

  // Pending Slip Count
  const pendingCount = payments.filter(p => p.status === 'pending').length;

  //Sort Logic: Pending at top, Approved/Rejected at bottom
  const sortedPayments = useMemo(() => {
    return [...payments].sort((a, b) => {
      // Pending status always comes first
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;

      //Sort by date (Newest first) within those groups
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [payments]);

  //  Pagination Logic using the sorted array
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Show 10 per page
  
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  
  
  const currentItems = sortedPayments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(payments.length / itemsPerPage);


  const updateStatus = async (id: number, status: 'approved' | 'rejected') => {
    const res = await fetch('/api/admin/payments', {
      method: 'PATCH',
      body: JSON.stringify({ id, status, remarks: 'Processed by Admin' }),
    });
    if (res.ok) {
      setPayments(payments.map(p => p.id === id ? { ...p, status } : p));
    }
  };


  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        {/* Title and Subtitle */}
        <div>
          <h1 className="text-3xl font-bold  text-[#2D3335] mb-2 ">Payment Verification</h1>
          <p className='text-[#526070] text-sm tracking-tight'>Review and approve pending bank transfer slips for student enrollments.</p>
        </div>

        {/* The Badge */}
        <div className="flex items-center gap-3 bg-slate-100/80 px-4 py-1.5 rounded-full border border-slate-200">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider bg-[#F1F4F5]">
            Pending Slips
          </span>
          <span className="bg-[#2B6390] text-white text-[11px] font-bold h-6 w-8 flex items-center justify-center rounded-full">
            {pendingCount}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="p-6 text-[10px] font-black uppercase text-slate-400 ">Student Name</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-400 text-center">Amount</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-400 text-center">Submission Date</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-400 text-center">Status</th>
              <th className="p-6 text-[10px] font-black uppercase text-slate-400 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {currentItems.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 transition">

                {/*Student Name and ID cloumn logic */}
                <td className="p-6 ">
                  <p className="font-bold text-slate-900">{p.full_name}</p>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">{p.student_id}</p>
                </td>

                {/*Amount cloumn logic */}
                <td className="p-6 font-mono font-bold text-[#2B6390] text-center">LKR {Number(p.amount).toLocaleString()}</td>

                {/*Submission Date cloumn logic */}
                <td className="p-6 text-center">
                  <p className=" text-[13px] font-medium text-[#5A6062]">
                    {new Date(p.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </td>

                {/*Status cloumn logic */}
                <td className="p-6 text-center">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${
                    p.status === 'approved' ? 'bg-green-200 text-green-700' :
                    p.status === 'pending' ? 'bg-amber-200 text-amber-700' 
                    : 'bg-red-200 text-red-700'    // Red for Rejected
                  }`}>
                    {p.status}
                  </span>
                </td>

                {/*Action cloumn logic */}
                <td className="p-6 text-center">
                  <button 
                    onClick={() => {setSelectedPayment(p); setRemarks(''); }}
                    className="bg-[#D5E4F7] hover:bg-blue-200 text-slate-600 px-5 py-2 rounded-xl text-[11px] font-bold transition-all border border-slate-200 uppercase tracking-tight">
                    View Slip
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>

        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex justify-between items-center">
          {/* Left Side: Dynamic Text */}
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Showing {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, payments.length)} of {payments.length} Total payments
          </p>

          {/* Right Side: Functioning Arrows */}
          <div className="flex items-center gap-6">
            {/* Previous Arrow */}
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`transition-colors ${currentPage === 1 ? 'text-slate-200 cursor-not-allowed' : 'text-slate-500 hover:text-blue-600'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
                <path d="M164.24,203.76a6,6,0,1,1-8.48,8.48l-80-80a6,6,0,0,1,0-8.48l80-80a6,6,0,0,1,8.48,8.48L88.49,128Z"></path>
              </svg>
            </button>

            {/* Next Arrow */}
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`transition-colors ${currentPage === totalPages ? 'text-slate-200 cursor-not-allowed' : 'text-slate-500 hover:text-blue-600'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 256 256">
                <path d="M181.66,133.66l-80,80a6,6,0,1,1-8.48-8.48L167.51,128,93.17,53.66a6,6,0,0,1,8.48-8.48l80,80A6,6,0,0,1,181.66,133.66Z"></path>
              </svg>
            </button>
          </div>
       </div>

      </div>

  
      {/* Slide-over  Panel */}
      {selectedPayment && (
      <div className="fixed inset-0 z-[100] flex justify-end bg-slate-900/40 backdrop-blur-sm transition-opacity">
          {/* Click outside to close */}
          <div className="absolute inset-0" onClick={() => setSelectedPayment(null)} />

          {/* The Panel */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
          {/* Header */}
          <div className="p-6 flex justify-between items-center border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-800">Verification Detail</h2>
            <button onClick={() => setSelectedPayment(null)} className="text-slate-400 hover:text-slate-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Student Info Card */}
          <div className="bg-[#F1F4F5] p-4 rounded-2xl flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-blue-200 text-[#003D63] flex items-center justify-center font-bold text-lg">
              {selectedPayment.full_name.charAt(0)}
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student Request</p>
              <p className="font-bold text-slate-900">{selectedPayment.full_name}</p>
              <p className="text-xs text-[#2B6390] font-medium">Student ID: {selectedPayment.student_id}</p>
            </div>
          </div>

          {/* Image Section */}
          <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-bold text-[#2D3335]  tracking-tight mb-2">Uploaded Slip Image</h3>
            <a 
              href={selectedPayment.proof_url} 
              target="_blank" 
              rel="noreferrer"
              className="text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 256 256"><path d="M200,64V168a8,8,0,0,1-16,0V83.31L69.66,197.66a8,8,0,0,1-11.32-11.32L172.69,72H88a8,8,0,0,1,0-16H192A8,8,0,0,1,200,64Z"></path></svg>
              Open Full Size
            </a>
          </div>
    
          {/* Container for the image */}
          <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-inner flex items-center justify-center min-h-[300px] max-h-[70vh] overflow-auto">
            {selectedPayment?.proof_url ? (
              <Image
                src={
                  selectedPayment.proof_url.startsWith('data:image')
                    ? selectedPayment.proof_url
                    : `data:image/jpeg;base64,${selectedPayment.proof_url}`
                }
                alt="Uploaded Slip"
                width={500}
                height={500}
                className="w-full h-auto object-contain"
              />
            ) : (
              <p className="text-slate-400">No Image Uploaded</p>
            )}
        </div>
      </div>

          {/* Feedback Box */}
          <div>
            <h3 className="text-sm font-bold text-[#2D3335] mb-2">Decision Feedback</h3>
            <textarea 
              className="w-full p-4 bg-[#DEE3E6] border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 placeholder:text-[#767C7E99]"
              placeholder="Enter rejection reason or internal notes (e.g., 'Amount incorrect')"
              rows={4}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 grid grid-cols-2 gap-4 bg-slate-50/50">
          <button 
            onClick={() => { updateStatus(selectedPayment.id, 'rejected'); setSelectedPayment(null); }}
            className="flex items-center justify-center gap-2 bg-[#b24343] text-white py-3 rounded-xl text-[11px] font-black uppercase tracking-wider hover:bg-red-700 transition-colors">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm36.24-116.24L136.49,128l27.75,27.76a6,6,0,1,1-8.48,8.48L128,136.49,100.24,164.24a6,6,0,0,1-8.48-8.48L107.51,128,79.76,100.24a6,6,0,0,1,8.48-8.48L116,119.51l27.76-27.75a6,6,0,0,1,8.48,8.48Z"></path></svg>
            Reject Slip
          </button>
          <button 
            onClick={() => { updateStatus(selectedPayment.id, 'approved'); setSelectedPayment(null); }}
            className="flex items-center justify-center gap-2 bg-[#2d5a82] text-white py-3 rounded-xl text-[11px] font-black uppercase tracking-wider hover:bg-blue-800 transition-colors">
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 256 256"><path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm45.66,85.66-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32Z"></path></svg>
            Approve & Enroll
          </button>
        </div>
      </div>
    </div>
  )}
    </div>
  );
}