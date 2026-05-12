import React from 'react';
import { SeedLabel } from '@spiceveg/types';
import { Edit2, ExternalLink, QrCode, Search } from 'lucide-react';

interface LabelListProps {
  labels: (SeedLabel & { _id?: string })[];
  onEdit: (label: SeedLabel) => void;
  onViewQR: (label: SeedLabel) => void;
}

export const LabelList: React.FC<LabelListProps> = ({ labels, onEdit, onViewQR }) => {
  const [search, setSearch] = React.useState('');

  const filteredLabels = labels.filter(l => 
    l.lotNo.toLowerCase().includes(search.toLowerCase()) ||
    l.crop.toLowerCase().includes(search.toLowerCase()) ||
    l.variety.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
        <input 
          type="text" 
          placeholder="Search Lot No, Crop or Variety..." 
          className="input-field pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {filteredLabels.map((item, idx) => (
          <div key={item._id || idx} className="card p-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-leaf truncate">Lot: {item.lotNo}</span>
                <span className="text-xs px-2 py-0.5 bg-stone-100 rounded-full text-stone-500">{item.crop}</span>
              </div>
              <p className="text-xs text-stone-500 truncate">{item.variety} | {item.netWeight} | ₹{item.mrp}</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onViewQR(item)}
                className="p-2 text-stone-400 hover:text-leaf hover:bg-leaf/10 rounded-lg transition-colors"
                title="View QR"
              >
                <QrCode size={20} />
              </button>
              <button 
                onClick={() => onEdit(item)}
                className="p-2 text-stone-400 hover:text-leaf hover:bg-leaf/10 rounded-lg transition-colors"
                title="Edit"
              >
                <Edit2 size={20} />
              </button>
              <button 
                onClick={() => window.open(`https://verify.spiceveg.in/?id=${item.lotNo}`, '_blank')}
                className="p-2 text-stone-400 hover:text-leaf hover:bg-leaf/10 rounded-lg transition-colors"
                title="Preview"
              >
                <ExternalLink size={20} />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {filteredLabels.length === 0 && (
        <p className="text-center py-10 text-stone-400 italic">No matching records found.</p>
      )}
    </div>
  );
};
