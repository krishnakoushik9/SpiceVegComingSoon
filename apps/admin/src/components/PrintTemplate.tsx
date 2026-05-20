import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { SeedLabel } from '@spiceveg/types';

interface PrintTemplateProps {
  data: SeedLabel & {
    physicalPurity?: string;
    geneticPurity?: string;
    germination?: string;
    moisture?: string;
    producedBy?: string;
    packedBy?: string;
    marketedBy?: string;
  };
  shortUrl: string;
}

export const PrintTemplate: React.FC<PrintTemplateProps> = ({ data, shortUrl }) => {
  const hasQuality = data.physicalPurity || data.geneticPurity || data.germination || data.moisture;
  const hasProducer = data.producedBy || data.packedBy || data.marketedBy;

  const Row = ({ label, value, bold }: { label: string; value?: string; bold?: boolean }) => (
    <div className="flex justify-between text-[9px] leading-tight">
      <span className="opacity-70">{label}</span>
      <span className={bold ? 'font-bold' : ''}>{value || '—'}</span>
    </div>
  );

  return (
    <div id="print-label" className="w-[60mm] bg-white p-[4mm] text-black font-sans">
      <div className="flex items-center justify-between mb-1">
        <span className="font-bold text-[13px]">SpiceVeg™</span>
        <span className="text-[7px] uppercase tracking-tight opacity-70">Vegetable Seeds</span>
      </div>

      <div className="h-[0.2mm] bg-stone-300 my-1" />
      <div className="text-center font-bold text-[10px] mb-1.5 uppercase tracking-wide">Truthful Label</div>

      <div className="space-y-[0.4mm]">
        <Row label="Crop:" value={data.crop?.toUpperCase()} bold />
        <Row label="Variety:" value={data.variety?.toUpperCase()} bold />
        <Row label="Lot No:" value={data.lotNo?.toUpperCase()} bold />
        <Row label="Tested:" value={data.dot} />
        <Row label="Packed:" value={data.dop} />
        <Row label="Valid:" value={data.validUpto} bold />
        <Row label="Net Wt:" value={data.netWeight} />
        <Row label="MRP (Incl. taxes):" value={data.mrp ? `₹${data.mrp}/-` : '—'} bold />
      </div>

      {hasQuality && (
        <>
          <div className="h-[0.2mm] bg-stone-200 my-1" />
          <div className="text-center text-[7px] uppercase tracking-wide opacity-70 mb-0.5">Quality</div>
          <div className="space-y-[0.4mm]">
            {data.physicalPurity && <Row label="Physical Purity:" value={data.physicalPurity} />}
            {data.geneticPurity && <Row label="Genetic Purity:" value={data.geneticPurity} />}
            {data.germination && <Row label="Germination:" value={data.germination} />}
            {data.moisture && <Row label="Moisture:" value={data.moisture} />}
          </div>
        </>
      )}

      <div className="flex flex-col items-center mt-2">
        <div className="bg-white p-0.5 border border-stone-100">
          <QRCodeSVG value={shortUrl} size={95} level="H" includeMargin={false} />
        </div>
      </div>

      {hasProducer && (
        <>
          <div className="h-[0.2mm] bg-stone-200 my-1" />
          <div className="space-y-[0.3mm] text-[7px] leading-tight">
            {data.producedBy && <div><span className="font-bold">Produced by:</span> {data.producedBy}</div>}
            {data.packedBy && <div><span className="font-bold">Packed by:</span> {data.packedBy}</div>}
            {data.marketedBy && <div><span className="font-bold">Marketed by:</span> {data.marketedBy}</div>}
          </div>
        </>
      )}

      <div className="text-[6px] text-stone-400 mt-1 text-center leading-tight">
        Scan to verify quality &amp; cultivation techniques
      </div>
    </div>
  );
};
