'use client';

import { useEffect, useState, useCallback } from 'react';

// 1. Define the Payment Interface
interface Payment {
  id: number;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [amount, setAmount] = useState<string>('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // 2. Wrap fetchPayments in useCallback to prevent re-renders
  const fetchPayments = useCallback(async () => {
    try {
      const res = await fetch('/api/student/payments');
      const data = await res.json();
      if (data.success) {
        setPayments(data.payments);
      }
    } catch (err) {
      console.error("Failed to fetch payments:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !image) {
      alert("Please enter amount and upload a slip.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/student/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(amount), proof_url: image }),
      });

      const data = await res.json();
      if (data.success) {
        alert("Slip uploaded successfully!");
        setAmount('');
        setImage(null);
        fetchPayments(); // Refresh the list
      } else {
        alert("Upload failed. Please try again.");
      }
    } catch (err) {
      console.error("Submission error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-20 text-center font-black text-[#1A5683] animate-pulse uppercase tracking-widest">
        Verifying Ledger...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
      
      {/* 1. Page heading Section */}
      <div className="lg:col-span-12 mb-6">
        <h1 className="text-5xl font-bold text-[#2B6390] tracking-tight ">
          Payment Submission
        </h1>
        <p className="text-[#526070] text-base mt-3 leading-relaxed">
          Securely upload your tuition fee receipts. Our academic team will verify the <br></br> transaction within 24-48 business hours.
        </p>
      </div>

      {/* 2. Upload Section */}
      <div className=" lg:col-span-7 space-y-8 ">

        {/* Billing Details */}
        <div className="bg-white p-10 rounded-xl shadow-sm border">

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#8FC3F6] text-[#003D63] font-semibold text-sm">1</div>  
            <h2 className="font-semibold  text-gray-700 mb-1">
              Billing Details
            </h2>
        </div>

          <label className="text-sm text-gray-500">
            Select Billing Month
          </label>

          <select defaultValue="" className="w-full h-10 mt-2 p-3  text-sm text-gray-800 bg-[#DEE3E6] rounded-xl outline-none focus:ring-1 focus:ring-blue-200">
            <option value="" disabled >Select the month you are paying for...</option>
            <option >January</option>
            <option>February</option>
            <option>March</option>
            <option>April</option>
            <option>May</option>
            <option>June</option>
            <option>July</option>
            <option>August</option>
            <option>September</option>
            <option>October</option>
            <option>November</option>
            <option>December</option>
          </select>

          <div className="mt-4">
            <label className="text-sm text-gray-500">
              Amount
            </label>
            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full h-10 mt-2 p-3 text-sm text-gray-800 bg-[#DEE3E6] rounded-xl outline-none focus:ring-1 focus:ring-blue-200"
            />
          </div>
        </div>

        {/* Evidence Upload */}
        <div className="bg-white p-10 rounded-xl shadow-sm border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#8FC3F6] text-[#003D63] font-semibold text-sm">2</div>
            <h2 className="font-semibold text-gray-700 mb-1">
              Evidence of Payment
            </h2>
          </div>

          <div className="border-2 border-dashed border-[#ADB3B54D] rounded-xl p-10 text-center cursor-pointer bg-[#F1F4F5] ">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="fileUpload"/>

            <label htmlFor="fileUpload" className="cursor-pointer flex flex-col items-center">
               {image ? (
                <div className="flex flex-col items-center">
                  <img
                    src={image}
                    alt="Preview"
                    className="w-48 rounded-lg shadow"
                  />
                  <p className="text-sm text-green-600 mt-2">
                    Click to change image
                  </p>
                </div>
              ) : (
                <>
                {/* Upload Icon */}
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                  <svg 
                    className="w-8 h-8 text-[#2B6390]" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <path d="M14 2v6h6M12 18v-6m-3 3 3-3 3 3" />
                  </svg>
                </div>
                <p className="text-gray-800 font-bold">
                  Click to upload bank slip </p>
                <p className="text-sm text-gray-500 mt-1">
                  JPEG, PNG, or PDF (Max 5MB) </p>
               </>
              )}
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl text-white font-semibold text-lg transition-all active:scale-[0.98]
          disabled:opacity-70 disabled:cursor-not-allowed bg-gradient-to-r from-[#2B6390] to-[#1A5783] shadow-[0_8px_24px_0_rgba(43,99,144,0.2)]"> 

         {/*Icon */}
          <svg 
            className="w-6 h-6" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="m9 12 2 2 4-4" />
          </svg> 
        Submit Payment</button>
      
      </div>

      {/* 3. Notice Section */}
      <div className="lg:col-span-4 space-y-6">

        {/* Important Note */}
        <div className="relative bg-[#C6C1F2] p-8  overflow-hidden shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] rounded-tl-xl rounded-tr-[40px] rounded-bl-xl rounded-br-xl">
          <div className="absolute bottom-0 right-0 opacity-10 rotate-180 rotate-[165deg] translate-x-7 translate-y-8 pointer-events-none">
            <svg 
              width="120" 
              height="120" 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              className="text-[#4A4371]">

              {/* Receipt Body with jagged bottom */}
              <path d="M4 2h16l-1 20-3-2-3 2-3-2-3 2-3-2L4 2z" />
              {/* Receipt Lines */}
              <rect x="7" y="6" width="10" height="2" rx="0.5" fill="white" fillOpacity="0.5" />
              <rect x="7" y="10" width="10" height="2" rx="0.5" fill="white" fillOpacity="0.5" />
              <rect x="7" y="14" width="6" height="2" rx="0.5" fill="white" fillOpacity="0.5" />
            </svg>
          </div>
          
          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-5 h-5 rounded-full border border-[#3E3C63] flex items-center justify-center text-xs text-[#3E3C63]">i</div>
              <h4 className="font-semibold text-[#3E3C63]">
                Important Note
              </h4>
            </div>

            <p className="text-base mt-3 leading-relaxed text-[#3E3C63CC]">
              Please ensure the reference number  and date of transaction are clearly 
              visible on the slip. Incomplete or  blurred images may lead to a delay in  access to course materials.
            </p>
          </div>
        </div>

        
        {/* Verification Process  */}
        <div className="bg-[#F1F4F5] p-8 rounded-[20px] shadow-sm border border-gray-100/50">
          <h3 className="text-l font-semibold text-gray-800 mb-8">
            Verification Process
          </h3>
          
          <div className="space-y-8"> {/* list items */}
            
            {/* Item 1: Immediate Acknowledgment */}
            <div className="flex items-start gap-5">
              {/* Icon */}
              <div className="flex-shrink-0 mt-1">
                <svg className="w-6 h-6 text-[#2B6390]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="18 10 11 15 8 12"></polyline>
                </svg>
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-800 leading-tight">Immediate Acknowledgment</p>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                  You'll receive an email confirmation immediately after submission.
                </p>
              </div>
            </div>

            {/* Item 2: Manual Audit */}
            <div className="flex items-start gap-5">
              {/* Icon */}
              <div className="flex-shrink-0 mt-1">
                <svg className="w-6 h-6 text-[#2B6390]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-800 leading-tight">
                  Manual Audit
                </p>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                  Our finance team audits payments every morning at 9:00 AM.
                </p>
              </div>
            </div>

            {/* Item 3: Access Granted */}
            <div className="flex items-start gap-5">
              {/* Icon */}
              <div className="flex-shrink-0 mt-1">
                <svg className="w-6 h-6 text-[#2B6390]" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path>
                  <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path>
                  <path d="M9 12H4s.55-3.03 2-5c1.62-2.2 5-3 5-3"></path>
                  <path d="M12 15v5s3.03-.55 5-2c2.2-1.62 3-5 3-5"></path>
                </svg>
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-800 leading-tight">
                  Access Granted
                </p>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                  Once verified, your dashboard materials will unlock automatically.
                </p>
              </div>
            </div>
          
          </div>
        </div>

      {/* Having trouble? Section */}
        <button className="group w-full flex items-center justify-between p-5 bg-[#F8F9FA] border border-gray-200 rounded-[22px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:bg-gray-50 transition-all duration-300">
          
          <div className="flex items-center gap-4">
            {/* Light Blue Icon  */}
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#DCEAF8] flex-shrink-0">
              <svg 
                className="w-6 h-6 text-[#2B6390]" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>

            {/* Text Labels */}
            <div className="text-left">
              <h4 className="text-sm font-bold text-gray-800 leading-tight">
                Having trouble?
              </h4>
              <p className="text-sm text-gray-500 mt-0.5 font-medium">
                Chat with our support team
              </p>
            </div>
          </div>

          {/* Right Arrow - changes color on group hover */}
          <svg 
            className="w-6 h-6 text-gray-300 group-hover:text-[#2B6390] transform group-hover:translate-x-1 transition-all duration-300" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>


      </div>
  </div>
  
  );
}
