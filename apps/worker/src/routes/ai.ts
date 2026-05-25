import { Hono } from 'hono';
import { callGemini } from '../lib/gemini';

type Bindings = {
  GEMINI_API_KEY: string;
  SHORT_LINKS: KVNamespace;
};

const ai = new Hono<{ Bindings: Bindings }>();

const ALLOWED_ORIGINS = [
  'https://admin.spiceveg.in',
  'https://spiceveg-admin.pages.dev',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
];

function isAllowedOrigin(origin: string | null | undefined): boolean {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  // allow any *.pages.dev preview for spiceveg-admin
  if (/^https:\/\/[a-z0-9-]+\.spiceveg-admin\.pages\.dev$/.test(origin)) return true;
  return false;
}

ai.post('/chat', async (c) => {
  const origin = c.req.header('origin') || c.req.header('referer') || '';
  const originHost = (() => {
    try { return new URL(origin).origin; } catch { return ''; }
  })();

  if (!isAllowedOrigin(originHost)) {
    return c.json({ error: 'Forbidden: untrusted origin' }, 403);
  }

  // Lightweight admin assertion — admin sets this header from the panel.
  // This is defence-in-depth only; the API key never leaves the worker.
  const adminHeader = c.req.header('x-admin-client');
  if (adminHeader !== 'spiceveg-admin-panel') {
    return c.json({ error: 'Forbidden: admin client header missing' }, 403);
  }

  let payload: {
    message?: string;
    context?: {
      lotCount?: number;
      cropBreakdown?: Record<string, number>;
      recentLots?: string[];
    };
  };
  try {
    payload = await c.req.json();
  } catch {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const message = (payload.message || '').toString().trim();
  if (!message) return c.json({ error: 'Empty message' }, 400);
  if (message.length > 600) return c.json({ error: 'Message too long' }, 400);

  const apiKey = c.env.GEMINI_API_KEY;
  if (!apiKey) {
    return c.json({ error: 'AI service not configured' }, 503);
  }

  try {
    const intent = await callGemini(apiKey, message, {
      lotCount: payload.context?.lotCount ?? 0,
      cropBreakdown: payload.context?.cropBreakdown,
      recentLots: payload.context?.recentLots,
    });
    return c.json({ ok: true, intent });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error';
    // Don't leak internal details
    console.error('AI error:', msg);
    return c.json({ error: 'AI temporarily unavailable' }, 502);
  }
});

ai.get('/health', (c) => {
  return c.json({
    ok: true,
    configured: !!c.env.GEMINI_API_KEY,
  });
});

export default ai;
