import React from 'react';
import { SeedLabel } from '@spiceveg/types';
import { Edit2, ExternalLink, QrCode, Search, Link2 } from 'lucide-react';

type LotWithShort = SeedLabel & { _id?: string; shortUrl?: string };

interface LabelListProps {
  labels: LotWithShort[];
  onEdit: (label: SeedLabel) => void;
  onViewQR: (label: SeedLabel) => void;
}

export const LabelList: React.FC<LabelListProps> = ({ labels, onEdit, onViewQR }) => {
  const [search, setSearch] = React.useState('');

  const filtered = labels.filter(l => {
    const q = search.toLowerCase();
    return l.lotNo.toLowerCase().includes(q)
        || l.crop.toLowerCase().includes(q)
        || l.variety.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <h3 className="text-base font-semibold text-forest flex-1">Recent Labels</h3>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" size={16} />
          <input
            type="text"
            placeholder="Search lot, crop, variety…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9 py-2 text-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {filtered.map((item, idx) => {
          const purity = (item as any).physicalPurity;
          const created = (item as any).createdAt;
          const createdShort = created ? new Date(created).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null;
          return (
            <div key={item._id || idx} className="lot-card">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="font-display font-bold text-leaf text-[15px] truncate">{item.lotNo}</span>
                    <span className="crop-tag">{item.crop || '—'}</span>
                  </div>
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
