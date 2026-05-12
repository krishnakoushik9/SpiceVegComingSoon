import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { SeedLabel } from '@spiceveg/types';

interface PrintTemplateProps {
  data: SeedLabel;
  shortUrl: string;
}

export const PrintTemplate: React.FC<PrintTemplateProps> = ({ data, shortUrl }) => {
  return (
    <div id="print-label" className="w-[60mm] bg-white p-[4mm] text-black font-sans leading-tight">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-[14px]">SpiceVeg™</span>
        <span className="text-[8px] uppercase tracking-tighter opacity-70">Vegetable Seeds</span>
      </div>
      
      <div className="h-[0.2mm] bg-stone-200 my-1" />
      
      <div className="text-center font-bold text-[10px] mb-2 uppercase tracking-wide">
        Truthful Label
      </div>

      <div className="space-y-[0.5mm] text-[9px]">
        <div className="flex justify-between">
          <span className="opacity-70">Crop:</span>
          <span className="font-bold uppercase">{data.crop}</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-70">Variety:</span>
          <span className="font-bold uppercase">{data.variety}</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-70">Lot No:</span>
          <span className="font-bold uppercase">{data.lotNo}</span>
        </div>
        <div className="flex justify-between mt-1">
          <span className="opacity-70">Tested:</span>
          <span>{data.dot}</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-70">Packed:</span>
          <span>{data.dop}</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-70 font-bold">Valid Upto:</span>
          <span className="font-bold">{data.validUpto}</span>
        </div>
        <div className="flex justify-between">
          <span className="opacity-70">Net Wt:</span>
          <span>{data.netWeight}</span>
        </div>
        <div className="flex justify-between mt-1 items-center">
          <span className="opacity-70">MRP (Incl. taxes):</span>
          <span className="font-bold text-[11px]">₹{data.mrp}/-</span>
        </div>
      </div>

      <div className="flex flex-col items-center mt-3">
        <div className="bg-white p-1 border border-stone-100">
          <QRCodeSVG 
            value={shortUrl} 
            size={100} 
            level="H" 
            includeMargin={false}
          />
        </div>
        <div className="text-[7px] text-stone-400 mt-2 text-center leading-[1.2]">
          Scan to verify quality & <br /> cultivation techniques
        </div>
      </div>
    </div>
  );
};
