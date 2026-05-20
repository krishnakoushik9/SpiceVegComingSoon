import React from 'react';
import { SeedLabel } from '@spiceveg/types';
import {
  Edit2, ExternalLink, QrCode, Search, Link2,
  FileDown, Printer, FileText, Grid3x3,
  Filter, X, ShieldCheck, Clock, AlertTriangle,
} from 'lucide-react';
import { exportLotsToCsv, getVerificationStatus, LotRecord, VerificationStatus } from '@/lib/export';

interface LabelListProps {
  labels: LotRecord[];
  onEdit: (label: SeedLabel) => void;
  onViewQR: (label: SeedLabel) => void;
  onPrintSheet: (lots: LotRecord[]) => void;
  onPrintLabels: (lots: LotRecord[]) => void;
}

type StatusFilter = 'all' | VerificationStatus;

const STATUS_OPTIONS: { value: StatusFilter; label: string; tone: string }[] = [
  { value: 'all',      label: 'All',      tone: 'text-stone-600' },
  { value: 'active',   label: 'Active',   tone: 'text-emerald-700' },
  { value: 'expiring', label: 'Expiring', tone: 'text-amber-700' },
  { value: 'expired',  label: 'Expired',  tone: 'text-rose-700' },
  { value: 'unknown',  label: 'Unknown',  tone: 'text-stone-500' },
];

const StatusBadge: React.FC<{ status: VerificationStatus }> = ({ status }) => {
  const cfg = {
    active:   { cls: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: <ShieldCheck size={11} />, label: 'Active' },
    expiring: { cls: 'bg-amber-50 text-amber-700 border-amber-100',       icon: <Clock size={11} />,       label: 'Expiring' },
    expired:  { cls: 'bg-rose-50 text-rose-700 border-rose-100',          icon: <AlertTriangle size={11} />, label: 'Expired' },
    unknown:  { cls: 'bg-stone-50 text-stone-500 border-stone-200',       icon: <Clock size={11} />,       label: 'Unknown' },
  }[status];
  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full border text-[10px] font-semibold ${cfg.cls}`}>
      {cfg.icon}{cfg.label}
    </span>
  );
};

export const LabelList: React.FC<LabelListProps> = ({ labels, onEdit, onViewQR, onPrintSheet, onPrintLabels }) => {
  const [search, setSearch] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('all');
  const [dateFrom, setDateFrom] = React.useState('');
  const [dateTo, setDateTo] = React.useState('');
  const [expiryBefore, setExpiryBefore] = React.useState('');
  const [showFilters, setShowFilters] = React.useState(false);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  const now = React.useMemo(() => new Date(), []);
  const enriched = React.useMemo(
    () => labels.map((l) => ({ lot: l, status: getVerificationStatus(l, now) })),
    [labels, now],
  );

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    const fromTs = dateFrom ? new Date(dateFrom).getTime() : null;
    const toTs   = dateTo   ? new Date(dateTo).getTime() + 86_400_000 : null;
    const expTs  = expiryBefore ? new Date(expiryBefore).getTime() : null;

    return enriched.filter(({ lot, status }) => {
      if (q) {
        const hay = `${lot.lotNo} ${lot.crop} ${lot.variety}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (statusFilter !== 'all' && status !== statusFilter) return false;

      const created = lot.createdAt ? new Date(lot.createdAt).getTime() : NaN;
      if (fromTs !== null && (!Number.isFinite(created) || created < fromTs)) return false;
      if (toTs   !== null && (!Number.isFinite(created) || created >= toTs)) return false;

      if (expTs !== null) {
        const exp = lot.validUpto ? new Date(lot.validUpto).getTime() : NaN;
        if (!Number.isFinite(exp) || exp > expTs) return false;
      }
      return true;
    }).map(({ lot }) => lot);
  }, [enriched, search, statusFilter, dateFrom, dateTo, expiryBefore]);

  const filtersActive =
    statusFilter !== 'all' || !!dateFrom || !!dateTo || !!expiryBefore;

  const clearFilters = () => {
    setStatusFilter('all'); setDateFrom(''); setDateTo(''); setExpiryBefore('');
  };

  const keyOf = (l: LotRecord) => l._id || l.lotNo;

  const toggleSelect = (l: LotRecord) => {
    const k = keyOf(l);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k); else next.add(k);
      return next;
    });
  };

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((l) => selected.has(keyOf(l)));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(keyOf)));
    }
  };

  const targetLots = (): LotRecord[] => {
    if (selected.size === 0) return filtered;
    const set = selected;
    return filtered.filter((l) => set.has(keyOf(l)));
  };

  const downloadCsv = () => {
    const lots = targetLots();
    if (!lots.length) return;
    exportLotsToCsv(lots, `spiceveg-lots-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  return (
    <div className="space-y-4">
      {/* Top bar: search + filter toggle + exports */}
      <div className="card !p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" size={16} />
            <input
              type="text"
              placeholder="Search lot number, crop, variety…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9 py-2 text-sm"
            />
          </div>

          <button
            onClick={() => setShowFilters((s) => !s)}
            className={`btn-outline py-2 text-xs ${filtersActive ? 'border-leaf/50 text-leaf' : ''}`}
            title="Toggle filters"
          >
            <Filter size={14} />
            Filters
            {filtersActive && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-leaf/10 text-leaf text-[10px]">on</span>}
          </button>

          <div className="hidden md:block w-px h-6 bg-stone-200" />

          <button onClick={downloadCsv} className="btn-outline py-2 text-xs" title="Export CSV">
            <FileDown size={14} /> CSV
          </button>
          <button onClick={() => onPrintLabels(targetLots())} className="btn-outline py-2 text-xs" title="Print labels (also save as PDF)">
            <Printer size={14} /> Print
          </button>
          <button onClick={() => onPrintLabels(targetLots())} className="btn-outline py-2 text-xs" title="Save as PDF via Print dialog">
            <FileText size={14} /> PDF
          </button>
          <button onClick={() => onPrintSheet(targetLots())} className="btn-outline py-2 text-xs" title="Generate QR sheet">
            <Grid3x3 size={14} /> QR Sheet
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-3 border-t border-stone-100 animate-in fade-in slide-in-from-top-1 duration-200">
            <div>
              <label className="field-label">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="input-field py-2 text-sm"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="field-label">Created from</label>
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="input-field py-2 text-sm" />
            </div>
            <div>
              <label className="field-label">Created to</label>
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="input-field py-2 text-sm" />
            </div>
            <div>
              <label className="field-label">Expires on/before</label>
              <input type="date" value={expiryBefore} onChange={(e) => setExpiryBefore(e.target.value)} className="input-field py-2 text-sm" />
            </div>
            {filtersActive && (
              <div className="md:col-span-4 -mt-1">
                <button onClick={clearFilters} className="btn-ghost text-xs">
                  <X size={13} /> Clear filters
                </button>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
          <div className="flex items-center gap-2">
            <input
              id="select-all"
              type="checkbox"
              checked={allFilteredSelected}
              onChange={toggleSelectAll}
              className="accent-leaf"
            />
            <label htmlFor="select-all" className="select-none cursor-pointer">
              {selected.size > 0
                ? `${selected.size} selected · exports apply to selection`
                : `Select all (${filtered.length}) · exports apply to filtered set`}
            </label>
          </div>
          <span>{filtered.length} of {labels.length} lots</span>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map((item, idx) => {
          const status = getVerificationStatus(item, now);
          const purity = (item as any).physicalPurity;
          const created = (item as any).createdAt;
          const createdShort = created ? new Date(created).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null;
          const k = keyOf(item);
          const isSelected = selected.has(k);
          return (
            <div key={k || idx} className={`lot-card ${isSelected ? 'ring-2 ring-leaf/40 border-leaf/40' : ''}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(item)}
                      className="accent-leaf shrink-0"
                      aria-label="Select lot"
                    />
                    <span className="font-display font-bold text-leaf text-[15px] truncate">{item.lotNo}</span>
                    <span className="crop-tag !ml-0">{item.crop || '—'}</span>
                  </div>
                  <div className="mb-1.5"><StatusBadge status={status} /></div>
                  <p className="text-[13px] text-stone-600 mt-0.5 truncate">{item.variety || ''}</p>
                  <p className="text-[12px] text-stone-400 mt-1">
                    Valid {item.validUpto || '—'} · {item.netWeight || '—'}
                    {purity ? <> · Purity {purity}</> : null}
                  </p>
                  {createdShort && (
                    <p className="text-[11px] text-stone-300 mt-0.5">Created {createdShort}</p>
                  )}
                  {item.shortUrl && (
                    <a href={item.shortUrl} target="_blank" rel="noreferrer" className="short-badge">
                      <Link2 size={11} /> Short link
                    </a>
                  )}
                </div>
                <button
                  onClick={() => onViewQR(item)}
                  className="btn-ghost p-2"
                  title="View QR"
                >
                  <QrCode size={18} />
                </button>
              </div>

              <div className="flex gap-2 mt-3 pt-3 border-t border-stone-100">
                <button onClick={() => onEdit(item)} className="btn-outline flex-1 py-1.5 text-xs">
                  <Edit2 size={13} /> Edit
                </button>
                <button
                  onClick={() => window.open(`https://verify.spiceveg.in/?id=${item.lotNo}`, '_blank')}
                  className="btn-outline flex-1 py-1.5 text-xs"
                >
                  <ExternalLink size={13} /> Open
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-center py-12 text-stone-400 italic text-sm">No matching records.</p>
      )}
    </div>
  );
};
