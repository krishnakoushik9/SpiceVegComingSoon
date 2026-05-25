import { LotRecord, getVerificationStatus, VerificationStatus } from './export';

export interface AIIntent {
  intent: 'search' | 'count' | 'open' | 'summarize' | 'list' | 'help' | 'unknown';
  filter: {
    crop?: string;
    variety?: string;
    lotNo?: string;
    status?: VerificationStatus | 'any';
    searchText?: string;
    createdWithinDays?: number;
    expiresWithinDays?: number;
    expiresInMonth?: string;
    missingFields?: string[];
    lowPurity?: boolean;
    duplicatesOf?: 'crop' | 'variety' | 'lotNo';
  };
  message: string;
  actions: Array<{
    type: 'open_lot' | 'apply_filter' | 'export_csv' | 'copy_lot_id' | 'navigate';
    label: string;
    payload?: Record<string, unknown>;
  }>;
  followups?: string[];
}

const PURITY_THRESHOLD = 95;

function parsePercent(value: unknown): number | null {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const m = String(value).match(/-?\d+(\.\d+)?/);
  if (!m) return null;
  const n = parseFloat(m[0]);
  return Number.isFinite(n) ? n : null;
}

function matchMonth(dateStr: string | undefined, monthSpec: string): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;

  const m = monthSpec.toLowerCase().trim();
  const months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];

  // "next month"
  if (m.includes('next')) {
    const target = new Date();
    target.setMonth(target.getMonth() + 1);
    return d.getMonth() === target.getMonth() && d.getFullYear() === target.getFullYear();
  }
  // "this month"
  if (m.includes('this') || m === 'current') {
    const target = new Date();
    return d.getMonth() === target.getMonth() && d.getFullYear() === target.getFullYear();
  }
  // explicit month name (optionally with year)
  const idx = months.findIndex((mn) => m.startsWith(mn));
  if (idx >= 0) {
    if (d.getMonth() !== idx) return false;
    const yearMatch = m.match(/20\d{2}/);
    if (yearMatch) return d.getFullYear() === parseInt(yearMatch[0], 10);
    return true;
  }
  // YYYY-MM
  const ym = m.match(/^(20\d{2})-(\d{1,2})$/);
  if (ym) {
    return d.getFullYear() === parseInt(ym[1], 10) && d.getMonth() === parseInt(ym[2], 10) - 1;
  }
  return false;
}

export function applyIntent(intent: AIIntent, lots: LotRecord[]): LotRecord[] {
  const f = intent.filter || {};
  const now = new Date();

  return lots.filter((lot) => {
    if (f.lotNo && !lot.lotNo?.toLowerCase().includes(f.lotNo.toLowerCase())) return false;
    if (f.crop && !lot.crop?.toLowerCase().includes(f.crop.toLowerCase())) return false;
    if (f.variety && !lot.variety?.toLowerCase().includes(f.variety.toLowerCase())) return false;

    if (f.searchText) {
      const hay = `${lot.lotNo} ${lot.crop} ${lot.variety} ${lot.producedBy ?? ''} ${lot.packedBy ?? ''} ${lot.marketedBy ?? ''}`.toLowerCase();
      if (!hay.includes(f.searchText.toLowerCase())) return false;
    }

    if (f.status && f.status !== 'any') {
      if (getVerificationStatus(lot, now) !== f.status) return false;
    }

    if (typeof f.createdWithinDays === 'number' && f.createdWithinDays > 0) {
      const c = lot.createdAt ? new Date(lot.createdAt).getTime() : NaN;
      if (!Number.isFinite(c)) return false;
      const cutoff = now.getTime() - f.createdWithinDays * 86400000;
      if (c < cutoff) return false;
    }

    if (typeof f.expiresWithinDays === 'number' && f.expiresWithinDays > 0) {
      const e = lot.validUpto ? new Date(lot.validUpto).getTime() : NaN;
      if (!Number.isFinite(e)) return false;
      const ahead = now.getTime() + f.expiresWithinDays * 86400000;
      if (e < now.getTime() || e > ahead) return false;
    }

    if (f.expiresInMonth) {
      if (!matchMonth(lot.validUpto, f.expiresInMonth)) return false;
    }

    if (Array.isArray(f.missingFields) && f.missingFields.length > 0) {
      const missing = f.missingFields.some((field) => {
        const v = (lot as unknown as Record<string, unknown>)[field];
        return !v || String(v).trim() === '';
      });
      if (!missing) return false;
    }

    if (f.lowPurity) {
      const p = parsePercent(lot.physicalPurity);
      if (p === null || p >= PURITY_THRESHOLD) return false;
    }

    return true;
  });
}

export function findDuplicates(lots: LotRecord[], field: 'crop' | 'variety' | 'lotNo'): LotRecord[] {
  const counts = new Map<string, number>();
  for (const l of lots) {
    const v = ((l as unknown as Record<string, unknown>)[field] || '').toString().trim().toLowerCase();
    if (!v) continue;
    counts.set(v, (counts.get(v) || 0) + 1);
  }
  const dupKeys = new Set(Array.from(counts.entries()).filter(([, n]) => n > 1).map(([k]) => k));
  return lots.filter((l) => {
    const v = ((l as unknown as Record<string, unknown>)[field] || '').toString().trim().toLowerCase();
    return dupKeys.has(v);
  });
}

export function buildContext(lots: LotRecord[]) {
  const cropBreakdown: Record<string, number> = {};
  for (const l of lots) {
    const k = (l.crop || 'unknown').toLowerCase();
    cropBreakdown[k] = (cropBreakdown[k] || 0) + 1;
  }
  const recentLots = lots
    .slice()
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
    .slice(0, 5)
    .map((l) => `${l.lotNo} (${l.crop})`);
  return { lotCount: lots.length, cropBreakdown, recentLots };
}
