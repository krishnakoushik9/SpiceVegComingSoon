import React from 'react';
import { PrintTemplate } from './PrintTemplate';
import { LotRecord, verifyUrlFor } from '@/lib/export';

export const PrintMany: React.FC<{ lots: LotRecord[] }> = ({ lots }) => {
  if (!lots.length) return null;
  return (
    <div className="print-many">
      {lots.map((lot) => (
        <div key={lot._id || lot.lotNo} className="print-many-page">
          <PrintTemplate data={lot} shortUrl={verifyUrlFor(lot)} />
        </div>
      ))}
    </div>
  );
};
