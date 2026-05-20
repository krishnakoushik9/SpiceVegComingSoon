"use client";
import React, { useState, useEffect } from 'react';
import { LabelForm } from '@/components/LabelForm';
import { LabelList } from '@/components/LabelList';
import { PrintTemplate } from '@/components/PrintTemplate';
import { SeedLabel } from '@spiceveg/types';
import { LogOut, Package, Printer, Download, QrCode } from 'lucide-react';
import { clsx } from 'clsx';
import { QRCodeSVG } from 'qrcode.react';
import LoginPage from '@/components/Login';

const FB_API_KEY = "AIzaSyCXh_4FVtBnM83-QRP4MhwPB3juiDSr4";
const FB_PROJECT = "spice-veg-agri";
const FS_BASE = `https://firestore.googleapis.com/v1/projects/${FB_PROJECT}/databases/(default)/documents`;
const COLLECTION = "seed_labels";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'new' | 'list'>('new');
  const [labels, setLabels] = useState<SeedLabel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [printData, setPrintData] = useState<{ data: SeedLabel; shortUrl: string } | null>(null);
  const [editingLabel, setEditingLabel] = useState<SeedLabel | undefined>();

  useEffect(() => {
    if (localStorage.getItem("admin-token")) {
      setIsAuthenticated(true);
      fetchLabels();
    }
  }, []);

  async function fetchLabels() {
    try {
      const res = await fetch(`${FS_BASE}/${COLLECTION}?key=${FB_API_KEY}`);
      const json = await res.json();
      if (!json.documents) return;
      const docs = json.documents.map((doc: any) => {
        const out: any = { _id: doc.name.split('/').pop() };
        for (const [k, v] of Object.entries(doc.fields || {})) {
          out[k] = (v as any).stringValue ?? (v as any).integerValue ?? '';
        }
        return out;
      }).sort((a: any, b: any) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      setLabels(docs);
    } catch (e) {
      console.error('Failed to fetch labels', e);
    }
  }

  const handleSave = async (data: SeedLabel) => {
    setIsLoading(true);
    try {
      const fields: any = {};
      for (const [k, v] of Object.entries(data)) fields[k] = { stringValue: String(v) };

      const docId = `lot_${data.lotNo}`;
      const res = await fetch(`${FS_BASE}/${COLLECTION}/${docId}?key=${FB_API_KEY}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields }),
      });

      if (!res.ok) {
        alert('Failed to save label');
        return;
      }

      const shortRes = await fetch('/api/v1/lots/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await shortRes.json();
      setPrintData({ data, shortUrl: result.shortUrl || `https://verify.spiceveg.in/?id=${data.lotNo}` });
      fetchLabels();
    } catch (e) {
      alert('Error connecting to API');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => window.print();

  const handleLogout = () => {
    localStorage.removeItem("admin-token");
    window.location.href = "/";
  };

  if (!isAuthenticated) return <LoginPage />;

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-stone-100 no-print">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-leaf rounded-xl flex items-center justify-center text-white">
              <Package size={18} />
            </div>
            <div className="leading-tight">
              <div className="font-display font-bold text-base text-forest">SpiceVeg</div>
              <div className="text-[10px] text-stone-400 uppercase tracking-[0.15em] font-bold">Label Studio</div>
            </div>
          </div>

          <nav className="ml-auto inline-flex bg-stone-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('new')}
              className={clsx(
                "text-xs md:text-sm font-medium px-3 md:px-4 py-1.5 rounded-lg transition-all",
                activeTab === 'new' ? "bg-white text-leaf shadow-sm font-semibold" : "text-stone-500 hover:text-stone-700"
              )}
            >New Label</button>
            <button
              onClick={() => setActiveTab('list')}
              className={clsx(
                "text-xs md:text-sm font-medium px-3 md:px-4 py-1.5 rounded-lg transition-all",
                activeTab === 'list' ? "bg-white text-leaf shadow-sm font-semibold" : "text-stone-500 hover:text-stone-700"
              )}
            >All Lots</button>
          </nav>

          <button
            onClick={handleLogout}
            className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 no-print">
        {activeTab === 'new' ? (
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Form */}
            <div className="card">
              <LabelForm
                onSubmit={handleSave}
                isLoading={isLoading}
                initialData={editingLabel}
              />
            </div>

            {/* QR Side Panel */}
            <aside className="side-card lg:sticky lg:top-20 lg:self-start">
              {!printData ? (
                <div className="text-center py-12 px-4 text-stone-400">
                  <QrCode size={44} strokeWidth={1.5} className="mx-auto mb-3 text-stone-300" />
                  <div className="text-sm font-medium text-stone-600">QR Preview</div>
                  <div className="text-xs mt-1 text-stone-500">Save a label to generate the verification QR code.</div>
                </div>
              ) : (
                <div className="animate-in zoom-in-95 duration-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold text-leaf uppercase tracking-wider">QR Ready</h4>
                    <span className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold">Live</span>
                  </div>
                  <div className="bg-white border border-stone-100 rounded-xl p-3 w-max mx-auto mb-3">
                    <QRCodeSVG value={printData.shortUrl} size={160} level="H" includeMargin={false} />
                  </div>
                  <div className="bg-white border border-stone-100 rounded-lg px-3 py-2 text-[11px] text-stone-600 break-all mb-3">
                    <a href={printData.shortUrl} target="_blank" rel="noreferrer" className="text-leaf font-semibold">{printData.shortUrl}</a>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handlePrint} className="btn-outline flex-1 py-2 text-xs">
                      <Printer size={13} /> Print
                    </button>
                    <button className="btn-outline flex-1 py-2 text-xs" disabled>
                      <Download size={13} /> PNG
                    </button>
                  </div>
                </div>
              )}
            </aside>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <LabelList
              labels={labels as any}
              onEdit={(l) => { setEditingLabel(l); setActiveTab('new'); }}
              onViewQR={(l) => {
                setPrintData({ data: l, shortUrl: (l as any).shortUrl || `https://verify.spiceveg.in/?id=${l.lotNo}` });
                setActiveTab('new');
              }}
            />
          </div>
        )}
      </main>

      {printData && (
        <div className="hidden print:block">
          <PrintTemplate data={printData.data} shortUrl={printData.shortUrl} />
        </div>
      )}

      <footer className="max-w-7xl mx-auto px-6 py-8 text-center text-[10px] text-stone-400 uppercase tracking-[0.2em] font-medium no-print">
        © 2026 Spice Veg Agri · v2.0.0
      </footer>
    </div>
  );
}

