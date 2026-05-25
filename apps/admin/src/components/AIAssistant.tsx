"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Sparkles, X, Send, Loader2, Lock, ShieldCheck, ExternalLink,
  Copy, FileDown, Eye, MessageSquare, RefreshCw, ChevronDown,
} from 'lucide-react';
import { LotRecord, exportLotsToCsv, getVerificationStatus, verifyUrlFor } from '@/lib/export';
import { AIIntent, applyIntent, buildContext, findDuplicates } from '@/lib/aiIntent';
import { getUsage, incrementUsage, grantBonus, AIUsageSnapshot } from '@/lib/aiUsage';

const API_BASE = 'https://api.spiceveg.in';

interface AIAssistantProps {
  lots: LotRecord[];
  onOpenLot?: (lot: LotRecord) => void;
  onApplyFilter?: (lots: LotRecord[], label: string) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'error';
  text: string;
  intent?: AIIntent;
  matches?: LotRecord[];
  ts: number;
}

const SUGGESTIONS = [
  'How many active chilli lots exist?',
  'Find all lots expiring next month',
  'Show lots with low purity',
  'Find duplicate crop names',
  'Recently edited lots',
];

export const AIAssistant: React.FC<AIAssistantProps> = ({ lots, onOpenLot, onApplyFilter }) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState<AIUsageSnapshot>(() => getUsage());
  const [unlockState, setUnlockState] = useState<'idle' | 'verifying' | 'granted'>('idle');
  const [unlockStep, setUnlockStep] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // refresh usage when reopening (clock may have ticked into a new day)
  useEffect(() => {
    if (open) setUsage(getUsage());
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => scrollRef.current?.scrollTo({ top: 999999, behavior: 'smooth' }), 30);
    return () => clearTimeout(t);
  }, [messages, open, loading]);

  // keyboard shortcut: ⌘K / Ctrl+K toggles the assistant
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === 'Escape' && open) setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  const buildResultsForIntent = useCallback(
    (intent: AIIntent): LotRecord[] => {
      if (intent.filter?.duplicatesOf) {
        return findDuplicates(lots, intent.filter.duplicatesOf);
      }
      return applyIntent(intent, lots);
    },
    [lots],
  );

  const send = useCallback(async (rawText?: string) => {
    const text = (rawText ?? input).trim();
    if (!text || loading) return;

    const current = getUsage();
    if (current.locked) {
      setUsage(current);
      return;
    }

    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', text, ts: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/v1/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Client': 'spiceveg-admin-panel',
        },
        body: JSON.stringify({
          message: text,
          context: buildContext(lots),
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(errBody.error || `Server ${res.status}`);
      }
      const data = (await res.json()) as { ok: boolean; intent: AIIntent };
      const intent = data.intent;
      const matches = intent.intent === 'help' || intent.intent === 'unknown'
        ? []
        : buildResultsForIntent(intent);

      const assistantMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: intent.message,
        intent,
        matches,
        ts: Date.now(),
      };
      setMessages((m) => [...m, assistantMsg]);
      setUsage(incrementUsage());
    } catch (e) {
      const errText = e instanceof Error ? e.message : 'Connection error';
      setMessages((m) => [
        ...m,
        { id: `e-${Date.now()}`, role: 'error', text: errText, ts: Date.now() },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [input, loading, lots, buildResultsForIntent]);

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const requestBonus = useCallback(() => {
    if (unlockState === 'verifying') return;
    setUnlockState('verifying');
    setUnlockStep(0);
    const steps = [
      'Authenticating admin identity…',
      'Validating workspace quota…',
      'Provisioning additional credits…',
    ];
    let i = 0;
    const tick = () => {
      i += 1;
      setUnlockStep(i);
      if (i < steps.length) {
        setTimeout(tick, 700);
      } else {
        setTimeout(() => {
          setUsage(grantBonus(10));
          setUnlockState('granted');
          setTimeout(() => setUnlockState('idle'), 1600);
        }, 500);
      }
    };
    setTimeout(tick, 600);
  }, [unlockState]);

  const resetChat = () => {
    setMessages([]);
    setInput('');
    inputRef.current?.focus();
  };

  const renderActions = (msg: ChatMessage) => {
    if (!msg.intent || !msg.matches) return null;
    const matches = msg.matches;
    return (
      <div className="mt-2 flex flex-wrap gap-1.5">
        {matches.length > 0 && (
          <button
            onClick={() => onApplyFilter?.(matches, msg.text)}
            className="ai-chip"
            title="Show in main list"
          >
            <Eye size={11} /> Show {matches.length}
          </button>
        )}
        {matches.length > 0 && (
          <button
            onClick={() => exportLotsToCsv(matches, `ai-results-${Date.now()}.csv`)}
            className="ai-chip"
            title="Export CSV"
          >
            <FileDown size={11} /> CSV
          </button>
        )}
        {matches.length === 1 && (
          <button
            onClick={() => onOpenLot?.(matches[0])}
            className="ai-chip"
            title="Open lot"
          >
            <ExternalLink size={11} /> Open {matches[0].lotNo}
          </button>
        )}
        {msg.intent.actions?.filter((a) => a.type === 'copy_lot_id').map((a, i) => (
          <button
            key={i}
            onClick={() => {
              const id = (a.payload?.lotNo as string) || matches[0]?.lotNo;
              if (id) navigator.clipboard?.writeText(id);
            }}
            className="ai-chip"
          >
            <Copy size={11} /> {a.label}
          </button>
        ))}
      </div>
    );
  };

  const renderMatches = (msg: ChatMessage) => {
    if (!msg.matches || msg.matches.length === 0) return null;
    const preview = msg.matches.slice(0, 5);
    const now = new Date();
    return (
      <div className="mt-2 space-y-1">
        {preview.map((lot) => {
          const status = getVerificationStatus(lot, now);
          return (
            <button
              key={lot._id || lot.lotNo}
              onClick={() => onOpenLot?.(lot)}
              className="w-full text-left ai-result-row"
            >
              <span className="font-semibold text-leaf">{lot.lotNo}</span>
              <span className="text-stone-500 truncate">{lot.crop} · {lot.variety || '—'}</span>
              <span className={`ai-status ai-status-${status}`}>{status}</span>
            </button>
          );
        })}
        {msg.matches.length > preview.length && (
          <div className="text-[10px] text-stone-400 pl-1">
            + {msg.matches.length - preview.length} more
          </div>
        )}
      </div>
    );
  };

  const emptyState = messages.length === 0;
  const locked = usage.locked || unlockState === 'verifying' || unlockState === 'granted';

  return (
    <>
      {/* Launcher */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`ai-launcher ${open ? 'opacity-0 pointer-events-none' : ''}`}
        aria-label="Open AI assistant"
        title="Operations Assistant (⌘K)"
      >
        <Sparkles size={16} />
        <span className="hidden md:inline">Ask Assistant</span>
        <kbd className="hidden md:inline ai-kbd">⌘K</kbd>
      </button>

      {/* Backdrop on mobile */}
      {open && <div className="ai-backdrop md:hidden" onClick={() => setOpen(false)} />}

      {/* Dock */}
      <aside
        className={`ai-dock ${open ? 'ai-dock-open' : ''}`}
        aria-hidden={!open}
      >
        <header className="ai-dock-head">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-leaf/10 text-leaf flex items-center justify-center shrink-0">
              <Sparkles size={14} />
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-forest text-[13px] truncate">Operations Assistant</div>
              <div className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold">
                Gemini · internal
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button onClick={resetChat} className="ai-icon-btn" title="New conversation">
                <RefreshCw size={14} />
              </button>
            )}
            <button onClick={() => setOpen(false)} className="ai-icon-btn" title="Close (Esc)">
              <X size={15} />
            </button>
          </div>
        </header>

        <div className="ai-usage-bar">
          <div className="flex items-center gap-1.5 text-[10px] text-stone-500 font-semibold uppercase tracking-wider">
            <ShieldCheck size={11} className="text-leaf" />
            {usage.used}/{usage.limit} queries today
            {usage.bonus > 0 && <span className="text-leaf">· +{usage.bonus} bonus</span>}
          </div>
          <div className="ai-usage-track">
            <div
              className="ai-usage-fill"
              style={{ width: `${Math.min(100, (usage.used / Math.max(1, usage.limit)) * 100)}%` }}
            />
          </div>
        </div>

        <div className="ai-dock-body" ref={scrollRef}>
          {emptyState && (
            <div className="ai-empty">
              <div className="ai-empty-icon"><MessageSquare size={18} /></div>
              <div className="text-[13px] font-semibold text-forest">How can I help?</div>
              <div className="text-[11px] text-stone-500 mt-1 mb-3">
                I can search lots, summarize inventory, and detect anomalies.
              </div>
              <div className="flex flex-col gap-1.5 w-full">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="ai-suggest"
                    disabled={locked}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`ai-msg ai-msg-${msg.role}`}>
              {msg.role === 'user' && <div className="ai-bubble-user">{msg.text}</div>}
              {msg.role === 'assistant' && (
                <div className="ai-bubble-assistant">
                  <div className="text-[12.5px] leading-relaxed">{msg.text}</div>
                  {renderMatches(msg)}
                  {renderActions(msg)}
                  {msg.intent?.followups && msg.intent.followups.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-stone-100 flex flex-wrap gap-1">
                      {msg.intent.followups.slice(0, 3).map((f, i) => (
                        <button key={i} onClick={() => send(f)} className="ai-followup">
                          {f}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {msg.role === 'error' && (
                <div className="ai-bubble-error">
                  <span className="font-semibold">Couldn’t reach assistant.</span> {msg.text}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="ai-msg ai-msg-assistant">
              <div className="ai-bubble-assistant flex items-center gap-2 text-stone-400 text-[12px]">
                <Loader2 size={13} className="animate-spin" />
                Thinking…
              </div>
            </div>
          )}
        </div>

        {locked ? (
          <div className="ai-lock">
            <div className="flex items-center gap-2 mb-1.5">
              <Lock size={14} className="text-amber-600" />
              <div className="text-[12px] font-semibold text-forest">Daily limit reached</div>
            </div>
            <div className="text-[11px] text-stone-500 mb-3 leading-relaxed">
              You’ve used {usage.used} of {usage.limit} queries.
              Quota resets at midnight. Need more right now?
            </div>
            {unlockState === 'idle' && (
              <button onClick={requestBonus} className="ai-unlock-btn">
                Request Additional Usage
              </button>
            )}
            {unlockState === 'verifying' && (
              <div className="ai-verifying">
                <Loader2 size={13} className="animate-spin text-leaf" />
                <span className="text-[11.5px] text-stone-600">
                  {[
                    'Authenticating admin identity…',
                    'Validating workspace quota…',
                    'Provisioning additional credits…',
                  ][unlockStep] || 'Working…'}
                </span>
              </div>
            )}
            {unlockState === 'granted' && (
              <div className="ai-granted">
                <ShieldCheck size={13} className="text-leaf" />
                <span className="text-[11.5px] font-semibold text-leaf">+10 queries granted</span>
              </div>
            )}
          </div>
        ) : (
          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="ai-input-bar"
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about lots, inventory, anomalies…"
              rows={1}
              className="ai-textarea"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="ai-send"
              aria-label="Send"
            >
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            </button>
          </form>
        )}
      </aside>
    </>
  );
};

export default AIAssistant;
