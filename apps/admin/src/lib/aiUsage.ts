// Lightweight daily-quota tracker for the AI assistant.
// Stored in localStorage so it survives refreshes and resets every 24h.

const BASE_DAILY_LIMIT = 10;
const STORAGE_KEY = 'spiceveg-ai-usage';

interface UsageState {
  date: string;
  used: number;
  bonus: number;
}

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function read(): UsageState {
  if (typeof window === 'undefined') return { date: todayKey(), used: 0, bonus: 0 };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { date: todayKey(), used: 0, bonus: 0 };
    const parsed = JSON.parse(raw) as UsageState;
    if (parsed.date !== todayKey()) return { date: todayKey(), used: 0, bonus: 0 };
    return {
      date: parsed.date,
      used: Number.isFinite(parsed.used) ? parsed.used : 0,
      bonus: Number.isFinite(parsed.bonus) ? parsed.bonus : 0,
    };
  } catch {
    return { date: todayKey(), used: 0, bonus: 0 };
  }
}

function write(state: UsageState) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore quota errors
  }
}

export interface AIUsageSnapshot {
  used: number;
  limit: number;
  remaining: number;
  bonus: number;
  resetsAt: Date;
  locked: boolean;
}

export function getUsage(): AIUsageSnapshot {
  const s = read();
  const limit = BASE_DAILY_LIMIT + s.bonus;
  const remaining = Math.max(0, limit - s.used);
  const reset = new Date();
  reset.setDate(reset.getDate() + 1);
  reset.setHours(0, 0, 0, 0);
  return { used: s.used, limit, remaining, bonus: s.bonus, resetsAt: reset, locked: remaining <= 0 };
}

export function incrementUsage(): AIUsageSnapshot {
  const s = read();
  s.used += 1;
  write(s);
  return getUsage();
}

export function grantBonus(amount = 10): AIUsageSnapshot {
  const s = read();
  s.bonus += amount;
  write(s);
  return getUsage();
}
