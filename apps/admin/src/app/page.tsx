"use client";
import React, { useState, useEffect } from 'react';
import { LabelForm } from '@/components/LabelForm';
import { LabelList } from '@/components/LabelList';
import { PrintTemplate } from '@/components/PrintTemplate';
import { SeedLabel } from '@spiceveg/types';
import { LogOut, Package, History, LayoutDashboard, Printer, Download, X, Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import LoginPage from '@/components/Login';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'new' | 'list'>('new');
  const [labels, setLabels] = useState<SeedLabel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [printData, setPrintData] = useState<{ data: SeedLabel; shortUrl: string } | null>(null);
  const [editingLabel, setEditingLabel] = useState<SeedLabel | undefined>();

  useEffect(() => {
    fetchLabels();
  }, []);

  const fetchLabels = async () => {
    try {
      const res = await fetch('/api/v1/lots');
      if (res.ok) {
        const data = await res.json();
        setLabels(data);
      }
    } catch (e) {
      console.error('Failed to fetch labels');
    }
  };

  const handleSave = async (data: SeedLabel) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/lots/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const result = await res.json();
        setPrintData({ data, shortUrl: result.shortUrl });
        fetchLabels();
        // Keep crop/variety for muscle memory
        setEditingLabel({ ...data, lotNo: '', dot: '', dop: '', validUpto: '' });
      } else {
        alert('Failed to save label');
      }
    } catch (e) {
      alert('Error connecting to API');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleLogout = async () => {
    await fetch('/api/v1/auth/logout', { method: 'POST' });
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto bg-stone-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between no-print">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-leaf rounded-xl flex items-center justify-center text-white">
            <Package size={24} />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg leading-none">SpiceVeg</h1>
            <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">Admin Panel</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="p-2 text-stone-400 hover:text-red-500 transition-colors"
        >
          <LogOut size={20} />
        </button>
      </header>

      {/* Tabs */}
      <nav className="flex px-6 pt-4 gap-2 no-print">
        <button 
          onClick={() => setActiveTab('new')}
          className={clsx(
            "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all",
            activeTab === 'new' ? "bg-leaf text-white shadow-md shadow-leaf/20" : "bg-white text-stone-400 border border-stone-100"
          )}
        >
          <LayoutDashboard size={18} />
          <span>New Label</span>
        </button>
        <button 
          onClick={() => setActiveTab('list')}
          className={clsx(
            "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all",
            activeTab === 'list' ? "bg-leaf text-white shadow-md shadow-leaf/20" : "bg-white text-stone-400 border border-stone-100"
          )}
        >
          <History size={18} />
          <span>All Labels</span>
        </button>
      </nav>

      {/* Content */}
      <main className="flex-1 px-6 py-6 no-print">
        {activeTab === 'new' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="card mb-6">
              <LabelForm 
                onSubmit={handleSave} 
                isLoading={isLoading} 
                initialData={editingLabel}
              />
            </div>
            
            {printData && (
              <div className="card border-leaf bg-leaf/5 animate-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-leaf flex items-center gap-2">
                    <Printer size={18} /> Label Ready
                  </h3>
                  <button onClick={() => setPrintData(null)} className="text-stone-400">
                    <X size={20} />
                  </button>
                </div>
                <p className="text-xs text-stone-600 mb-4 break-all">
                  Short URL: <span className="font-mono font-bold text-leaf">{printData.shortUrl}</span>
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={handlePrint} className="btn-primary py-2 text-sm flex items-center justify-center gap-2">
                    <Printer size={16} /> Print
                  </button>
                  <button className="bg-white border border-stone-200 text-stone-600 rounded-xl py-2 text-sm font-medium flex items-center justify-center gap-2">
                    <Download size={16} /> PNG
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <LabelList 
              labels={labels} 
              onEdit={(l) => { setEditingLabel(l); setActiveTab('new'); }}
              onViewQR={(l) => { setPrintData({ data: l, shortUrl: `https://s.spiceveg.in/qr/${l.lotNo}` }); setActiveTab('new'); }}
            />
          </div>
        )}
      </main>

      {/* Hidden Print Area */}
      {printData && (
        <div className="hidden print:block">
          <PrintTemplate data={printData.data} shortUrl={printData.shortUrl} />
        </div>
      )}

      {/* Footer */}
      <footer className="px-6 py-8 text-center text-[10px] text-stone-400 uppercase tracking-widest no-print">
        © 2026 Spice Veg Agri • v2.0.0
      </footer>
    </div>
  );
}
