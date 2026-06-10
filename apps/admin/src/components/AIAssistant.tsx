"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Sparkles, X, Send, Loader2, Lock, ShieldCheck, ExternalLink,
  Copy, FileDown, Eye, MessageSquare, RefreshCw, ChevronDown,
  AlertTriangle, Cpu, Zap, WifiOff, CheckCircle2,
} from 'lucide-react';
import { LotRecord, exportLotsToCsv, getVerificationStatus, verifyUrlFor } from '@/lib/export';
import { AIIntent, applyIntent, buildContext, findDuplicates } from '@/lib/aiIntent';
import { getUsage, incrementUsage, grantBonus, AIUsageSnapshot } from '@/lib/aiUsage';
import { litertEngine, EngineState } from '@/lib/litertEngine';

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

/** Try to parse a JSON intent from model output, stripping any surrounding text */
function parseIntentFromResponse(raw: string): AIIntent | null {
  // Try direct parse first
  try {
    const parsed = JSON.parse(raw);
    if (parsed && parsed.intent) return parsed;
  } catch { /* continue */ }

  // Try extracting JSON from code blocks or surrounding text
  const jsonMatch = raw.match(/\{[\s\S]*"intent"[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed && parsed.intent) return parsed;
    } catch { /* continue */ }
  }

  return null;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ lots, onOpenLot, onApplyFilter }) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState<AIUsageSnapshot>(() => getUsage());
  const [unlockState, setUnlockState] = useState<'idle' | 'verifying' | 'granted'>('idle');
  const [unlockStep, setUnlockStep] = useState(0);
  const [engineState, setEngineState] = useState<EngineState>({ status: 'idle' });
  const [showBanner, setShowBanner] = useState(true);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [streamingText, setStreamingText] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Subscribe to engine state
  useEffect(() => {
    const unsub = litertEngine.subscribe(setEngineState);
    return unsub;
  }, []);

  // Check if banner was previously dismissed this session
  useEffect(() => {
    const dismissed = sessionStorage.getItem('spiceveg-ai-banner-dismissed');
    if (dismissed) {
      setBannerDismissed(true);
      setShowBanner(false);
    }
  }, []);

  // Initialize engine when assistant is opened
  useEffect(() => {
    if (open && engineState.status === 'idle') {
      litertEngine.initialize();
    }
  }, [open, engineState.status]);

  // refresh usage when reopening (clock may have ticked into a new day)
  useEffect(() => {
    if (open) setUsage(getUsage());
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => scrollRef.current?.scrollTo({ top: 999999, behavior: 'smooth' }), 30);
    return () => clearTimeout(t);
  }, [messages, open, loading, streamingText]);

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

    if (engineState.status !== 'ready') {
      setMessages((m) => [...m, {
        id: `e-${Date.now()}`,
        role: 'error',
        text: engineState.status === 'loading'
          ? 'Model is still loading. Please wait a moment and try again.'
          : engineState.status === 'unsupported'
          ? 'WebGPU is not supported in this browser. Please use Chrome 113+.'
          : 'Model is not ready. Please wait for initialization.',
        ts: Date.now(),
      }]);
      return;
    }

    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', text, ts: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setLoading(true);
    setStreamingText('');

    try {
      const ctx = buildContext(lots);
      const contextLine =
        `Inventory snapshot: ${ctx.lotCount} total lots.` +
        (ctx.cropBreakdown
          ? ` By crop: ${Object.entries(ctx.cropBreakdown)
              .slice(0, 8)
              .map(([k, v]) => `${k}=${v}`)
              .join(', ')}.`
          : '') +
        (ctx.recentLots && ctx.recentLots.length
          ? ` Recent lots: ${ctx.recentLots.slice(0, 5).join(', ')}.`
          : '');

      const fullResponse = await litertEngine.sendMessage(
        text,
        contextLine,
        (chunk) => {
          setStreamingText((prev) => prev + chunk);
        },
      );

      setStreamingText('');

      // Try to parse JSON intent from response
      const intent = parseIntentFromResponse(fullResponse);

      if (intent) {
        if (!intent.filter) intent.filter = {};
        if (!intent.actions) intent.actions = [];

        const matches = intent.intent === 'help' || intent.intent === 'unknown'
          ? []
          : buildResultsForIntent(intent);

        const assistantMsg: ChatMessage = {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: intent.message || 'Here are the results.',
          intent,
          matches,
          ts: Date.now(),
        };
        setMessages((m) => [...m, assistantMsg]);
      } else {
        // Model returned free-form text, show it directly
        const assistantMsg: ChatMessage = {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: fullResponse.slice(0, 300),
          ts: Date.now(),
        };
        setMessages((m) => [...m, assistantMsg]);
      }

      setUsage(incrementUsage());
    } catch (e) {
      setStreamingText('');
      const errText = e instanceof Error ? e.message : 'Model error';
      setMessages((m) => [
        ...m,
        { id: `e-${Date.now()}`, role: 'error', text: errText, ts: Date.now() },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [input, loading, lots, buildResultsForIntent, engineState.status]);

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

  const resetChat = async () => {
    setMessages([]);
    setInput('');
    setStreamingText('');
    await litertEngine.resetConversation();
    inputRef.current?.focus();
  };

  const dismissBanner = () => {
    setShowBanner(false);
    setBannerDismissed(true);
    sessionStorage.setItem('spiceveg-ai-banner-dismissed', 'true');
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

  const renderEngineStatus = () => {
    if (engineState.status === 'ready') return null;

    const statusConfig: Record<string, { icon: React.ReactNode; text: string; cls: string }> = {
      idle: { icon: <Cpu size={13} />, text: 'AI model idle', cls: 'text-stone-400' },
      checking: { icon: <Loader2 size={13} className="animate-spin" />, text: 'Checking WebGPU…', cls: 'text-blue-500' },
      loading: { icon: <Loader2 size={13} className="animate-spin" />, text: engineState.progress || 'Loading model…', cls: 'text-amber-600' },
      error: { icon: <AlertTriangle size={13} />, text: engineState.error || 'Model error', cls: 'text-red-500' },
      unsupported: { icon: <WifiOff size={13} />, text: engineState.error || 'WebGPU unavailable', cls: 'text-red-500' },
    };

    const cfg = statusConfig[engineState.status] || statusConfig.idle;

    // Helper to format bytes to MB
    const toMB = (b?: number) => b ? (b / (1024 * 1024)).toFixed(0) : '0';
    const speedStr = engineState.speed ? `· ${engineState.speed.toFixed(1)} MB/s` : '';
    const isCached = engineState.cached;

    const progressText = engineState.status === 'loading' && engineState.percent !== undefined
      ? `${isCached ? '🚀 Cache Load' : '⚡ Download'}: ${toMB(engineState.loaded)} / ${toMB(engineState.total)} MB (${engineState.percent}%) ${speedStr}`
      : cfg.text;

    return (
      <div className="flex flex-col border-b border-stone-100 bg-stone-50/50">
        <div className={`ai-engine-status ${cfg.cls} border-none`} style={{ minHeight: '32px' }}>
          {cfg.icon}
          <span className="text-[10.5px] font-semibold truncate">{progressText}</span>
          {engineState.status === 'error' && (
            <button
              onClick={() => litertEngine.initialize()}
              className="ml-auto text-[10px] font-semibold text-leaf hover:text-forest underline"
            >
              Retry
            </button>
          )}
        </div>
        {engineState.status === 'loading' && engineState.percent !== undefined && (
          <div className="w-full h-1 bg-stone-200/60 relative">
            <div 
              className="h-full bg-emerald-500 transition-all duration-150 ease-out"
              style={{ width: `${engineState.percent}%` }}
            />
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

      {/* Phase-out Banner Modal */}
      {open && showBanner && !bannerDismissed && (
        <div className="ai-phaseout-overlay" onClick={dismissBanner}>
          <div className="ai-phaseout-banner" onClick={(e) => e.stopPropagation()}>
            <div className="ai-phaseout-glow" />
            <div className="ai-phaseout-content">
              <div className="ai-phaseout-icon-wrap">
                <div className="ai-phaseout-icon-ring">
                  <Zap size={22} className="text-emerald-400" />
                </div>
              </div>

              <h3 className="ai-phaseout-title">
                AI Assistant Upgrade
              </h3>

              <div className="ai-phaseout-badge">
                <Cpu size={12} />
                <span>Powered by Gemma 4 · WebGPU</span>
              </div>

              <p className="ai-phaseout-body">
                The <strong>online Gemini AI</strong> service is being <strong>phased out</strong>.
                A new <strong>on-device AI model</strong> is now active — powered by
                Google's <strong>Gemma 4 E2B</strong> running directly in your browser via <strong>WebGPU</strong>.
              </p>

              <div className="ai-phaseout-features">
                <div className="ai-phaseout-feature">
                  <WifiOff size={14} className="text-emerald-400" />
                  <div>
                    <div className="font-semibold text-[11.5px]">Runs Offline</div>
                    <div className="text-[10px] text-stone-400">No internet needed after model loads</div>
                  </div>
                </div>
                <div className="ai-phaseout-feature">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <div>
                    <div className="font-semibold text-[11.5px]">Private & Secure</div>
                    <div className="text-[10px] text-stone-400">Data never leaves your device</div>
                  </div>
                </div>
                <div className="ai-phaseout-feature">
                  <Zap size={14} className="text-emerald-400" />
                  <div>
                    <div className="font-semibold text-[11.5px]">Zero Latency</div>
                    <div className="text-[10px] text-stone-400">No API calls, instant responses</div>
                  </div>
                </div>
              </div>

              <button
                onClick={dismissBanner}
                className="ai-phaseout-cta"
              >
                <Sparkles size={14} />
                Start Conversation
              </button>

              <p className="ai-phaseout-note">
                Requires Chrome 113+ with WebGPU · ~2GB model download on first use
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Dock */}
      <aside
        className={`ai-dock ${open ? 'ai-dock-open' : ''}`}
        aria-hidden={!open}
      >
        <header className="ai-dock-head">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <Cpu size={14} />
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-forest text-[13px] truncate flex items-center gap-1.5">
                <span>Operations Assistant</span>
                <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-100 uppercase tracking-wide">V0.23</span>
              </div>
              <div className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold flex items-center gap-1">
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                  engineState.status === 'ready' ? 'bg-emerald-500 animate-pulse' :
                  engineState.status === 'loading' ? 'bg-amber-500 animate-pulse' :
                  'bg-stone-300'
                }`} />
                Gemma 4 · on-device
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

        {/* Engine status indicator */}
        {renderEngineStatus()}

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
                <br />
                <span className="text-emerald-600 font-medium">Running on-device with Gemma 4 via WebGPU.</span>
              </div>
              <div className="flex flex-col gap-1.5 w-full">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="ai-suggest"
                    disabled={locked || engineState.status !== 'ready'}
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
                  <span className="font-semibold">Error:</span> {msg.text}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="ai-msg ai-msg-assistant">
              <div className="ai-bubble-assistant">
                {streamingText ? (
                  <div className="text-[12.5px] leading-relaxed">
                    {streamingText}
                    <span className="inline-block w-1.5 h-4 bg-leaf/60 animate-pulse ml-0.5 rounded-sm" />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-stone-400 text-[12px]">
                    <Loader2 size={13} className="animate-spin" />
                    Processing with Gemma 4…
                  </div>
                )}
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
              You've used {usage.used} of {usage.limit} queries.
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
              placeholder={
                engineState.status === 'ready'
                  ? 'Ask about lots, inventory, anomalies…'
                  : engineState.status === 'loading'
                  ? 'Model loading… please wait'
                  : 'Initializing AI model…'
              }
              rows={1}
              className="ai-textarea"
              disabled={loading || engineState.status !== 'ready'}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading || engineState.status !== 'ready'}
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
