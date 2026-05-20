import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { LotRecord, verifyUrlFor } from '@/lib/export';

interface QRSheetProps {
  lots: LotRecord[];
}

export const QRSheet: React.FC<QRSheetProps> = ({ lots }) => {
  return (
    <div id="qr-sheet" className="qr-sheet-page bg-white text-black">
      <div className="qr-sheet-head">
        <span className="qr-sheet-brand">SpiceVeg™ · QR Sheet</span>
        <span className="qr-sheet-meta">{lots.length} lot{lots.length === 1 ? '' : 's'} · {new Date().toLocaleDateString('en-IN')}</span>
      </div>
      <div className="qr-sheet-grid">
        {lots.map((lot) => (
          <div key={lot._id || lot.lotNo} className="qr-sheet-cell">
            <div className="qr-sheet-cell-qr">
              <QRCodeSVG value={verifyUrlFor(lot)} size={110} level="H" includeMargin={false} />
            </div>
            <div className="qr-sheet-cell-body">
              <div className="qr-sheet-cell-lot">{lot.lotNo}</div>
              <div className="qr-sheet-cell-crop">{lot.crop || '—'}{lot.variety ? ` · ${lot.variety}` : ''}</div>
              <div className="qr-sheet-cell-meta">Valid {lot.validUpto || '—'}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
