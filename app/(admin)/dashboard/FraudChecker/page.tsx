'use client'

import { useState } from 'react';
import { checkFraudResult } from '@/app/api/check-fraud/route'; // Make sure path matches

export default function FraudChecker({ defaultPhone = "" }: { defaultPhone?: string }) {
  const [phone, setPhone] = useState(defaultPhone);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleCheck = async () => {
    if (phone.length < 11) {
      setError("Please enter a valid 11-digit BD number");
      return;
    }
    
    setLoading(true);
    setError("");
    setResult(null);

    const res = await checkFraudResult(phone);

    if (res.success) {
      setResult(res.data);
    } else {
      setError(res.message || "Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50 shadow-sm max-w-md">
      <h3 className="text-lg font-bold mb-3 text-gray-800">Fraud Checker</h3>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="017XXXXXXXX"
          className="border p-2 rounded w-full text-black"
        />
        <button
          onClick={handleCheck}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Checking...' : 'Check'}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {result && (
        <div className="bg-white p-3 rounded border text-sm text-gray-800">
          <div className="grid grid-cols-2 gap-2 mb-2">
             <div className="bg-blue-100 p-2 rounded text-center">
                <span className="block text-xs text-gray-500">Total</span>
                <span className="font-bold text-lg">{result.total_parcels}</span>
             </div>
             <div className="bg-red-100 p-2 rounded text-center">
                <span className="block text-xs text-gray-500">Cancelled</span>
                <span className="font-bold text-lg text-red-600">{result.total_cancel}</span>
             </div>
             <div className="bg-green-100 p-2 rounded text-center">
                <span className="block text-xs text-gray-500">Delivered</span>
                <span className="font-bold text-lg text-green-600">{result.total_delivered}</span>
             </div>
             <div className="bg-gray-100 p-2 rounded text-center">
                <span className="block text-xs text-gray-500">Success Rate</span>
                <span className="font-bold text-lg">
                  {result.total_parcels > 0 
                    ? Math.round((result.total_delivered / result.total_parcels) * 100) 
                    : 0}%
                </span>
             </div>
          </div>
          
          {/* Logic to advise the admin */}
          <div className="mt-3 font-bold text-center">
             {result.total_cancel > result.total_delivered ? (
               <span className="text-red-600 border border-red-600 px-2 py-1 rounded">⚠️ HIGH RISK CUSTOMER</span>
             ) : (
               <span className="text-green-600 border border-green-600 px-2 py-1 rounded">✅ SAFE TO SHIP</span>
             )}
          </div>
        </div>
      )}
    </div>
  );
}