import { SeedLabel } from '@spiceveg/types';

export type LotRecord = SeedLabel & { _id?: string; shortUrl?: string };

const CSV_COLUMNS: { key: keyof LotRecord; label: string }[] = [
  { key: 'lotNo', label: 'Lot No' },
  { key: 'crop', label: 'Crop' },
  { key: 'variety', label: 'Variety' },
  { key: 'dot', label: 'Date of Testing' },
  { key: 'dop', label: 'Date of Packaging' },
  { key: 'validUpto', label: 'Valid Upto' },
  { key: 'netWeight', label: 'Net Weight' },
  { key: 'mrp', label: 'MRP' },
  { key: 'physicalPurity', label: 'Physical Purity' },
  { key: 'geneticPurity', label: 'Genetic Purity' },
  { key: 'germination', label: 'Germination' },
  { key: 'moisture', label: 'Moisture' },
  { key: 'producedBy', label: 'Produced By' },
  { key: 'packedBy', label: 'Packed By' },
  { key: 'marketedBy', label: 'Marketed By' },
  { key: 'shortUrl', label: 'Verify URL' },
  { key: 'createdAt', label: 'Created At' },
];

function escapeCsv(v: unknown): string {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function exportLotsToCsv(lots: LotRecord[], filename = 'spiceveg-lots.csv'): void {
  const header = CSV_COLUMNS.map((c) => escapeCsv(c.label)).join(',');
  const rows = lots.map((lot) =>
    CSV_COLUMNS.map((c) => escapeCsv((lot as Record<string, unknown>)[c.key as string])).join(','),
  );
  const csv = '﻿' + [header, ...rows].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  triggerDownload(url, filename);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function triggerDownload(href: string, filename: string) {
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export type VerificationStatus = 'active' | 'expiring' | 'expired' | 'unknown';

export function getVerificationStatus(lot: LotRecord, now: Date = new Date()): VerificationStatus {
  if (!lot.validUpto) return 'unknown';
  const exp = new Date(lot.validUpto);
  if (Number.isNaN(exp.getTime())) return 'unknown';
  const diffDays = Math.floor((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'expired';
  if (diffDays <= 30) return 'expiring';
  return 'active';
}

export function verifyUrlFor(lot: LotRecord): string {
  return lot.shortUrl || `https://verify.spiceveg.in/?id=${lot.lotNo}`;
}
