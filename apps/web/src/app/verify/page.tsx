"use client";
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { BadgeCheck, Info, MapPin, Calendar, Scale, IndianRupee, Loader2 } from 'lucide-react';
import { SeedLabel } from '@spiceveg/types';
import { Suspense } from 'react';

function VerifyContent() {
  const searchParams = useSearchParams();
  const lotId = searchParams.get('id');
  const [data, setData] = useState<SeedLabel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lotId) {
      fetchLotData(lotId);
    } else {
      setLoading(false);
      setError('No Lot Number provided.');
    }
  }, [lotId]);

  const fetchLotData = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/lots/${id}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        setError('Lot information not found.');
      }
    } catch (e) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="animate-spin text-leaf mb-4" size={40} />
        <p className="text-stone-500 animate-pulse">Verifying Quality Records...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
          <Info size={40} />
        </div>
        <h1 className="text-xl font-bold text-stone-900 mb-2">Verification Failed</h1>
        <p className="text-stone-500 mb-8">{error}</p>
        <a href="https://spiceveg.in" className="btn-primary py-2 px-8">Go to Home</a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      {/* Brand Header */}
      <div className="bg-white border-b border-stone-200 px-6 py-8 text-center">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-2xl font-display font-bold text-leaf">SpiceVeg™</h1>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-leaf rounded-full text-xs font-bold border border-green-100">
            <BadgeCheck size={14} />
            AUTHENTIC QUALITY VERIFIED
          </div>
        </div>
      </div>

      <main className="max-w-md mx-auto p-6 space-y-6 pb-20">
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100">
          <h2 className="text-xs uppercase tracking-widest text-stone-400 font-bold mb-6 text-center">Truthful Label Details</h2>
          
          <div className="grid grid-cols-2 gap-y-6 gap-x-4">
            <div>
              <p className="text-[10px] uppercase text-stone-400 font-bold mb-1">Crop</p>
              <p className="font-bold text-stone-900 leading-tight">{data.crop}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-stone-400 font-bold mb-1">Variety</p>
              <p className="font-bold text-stone-900 leading-tight">{data.variety}</p>
            </div>
            <div className="col-span-2 py-3 border-y border-stone-50">
              <p className="text-[10px] uppercase text-stone-400 font-bold mb-1">Lot Number</p>
              <p className="font-display font-bold text-xl text-leaf">{data.lotNo}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-stone-400 font-bold mb-1">Testing Date</p>
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-stone-300" />
                <p className="font-medium text-stone-700">{data.dot}</p>
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase text-stone-400 font-bold mb-1">Packaging Date</p>
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-stone-300" />
                <p className="font-medium text-stone-700">{data.dop}</p>
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase text-stone-400 font-bold mb-1">Valid Upto</p>
              <p className="font-bold text-red-600">{data.validUpto}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-stone-400 font-bold mb-1">Net Weight</p>
              <div className="flex items-center gap-1.5">
                <Scale size={14} className="text-stone-300" />
                <p className="font-medium text-stone-700">{data.netWeight}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-stone-50 text-center">
            <p className="text-[10px] uppercase text-stone-400 font-bold mb-1">MRP (Incl. of all taxes)</p>
            <div className="flex items-center justify-center gap-1 text-2xl font-bold text-stone-900">
              <IndianRupee size={20} className="text-stone-300" />
              <span>{data.mrp}/-</span>
            </div>
          </div>
        </section>

        <button 
          onClick={() => window.location.href = 'https://spiceveg.in/cultivation'}
          className="w-full btn-primary flex items-center justify-center gap-2 py-4"
        >
          View Cultivation Practices
        </button>

        <footer className="text-center">
          <p className="text-[10px] text-stone-400 uppercase tracking-widest">
            © 2026 Spice Veg Agri • Produced in India
          </p>
        </footer>
      </main>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="animate-spin text-leaf mb-4" size={40} />
        <p className="text-stone-500 animate-pulse">Verifying Quality Records...</p>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
