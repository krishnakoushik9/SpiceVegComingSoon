// Gemini REST client (server-side only — API key never leaves the worker)
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const MODEL_CHAIN = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'] as const;

export interface AIIntent {
  intent: 'search' | 'count' | 'open' | 'summarize' | 'list' | 'help' | 'unknown';
  filter: {
    crop?: string;
    variety?: string;
    lotNo?: string;
    status?: 'active' | 'expiring' | 'expired' | 'unknown' | 'any';
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

const SYSTEM_PROMPT = `You are SpiceVeg Operations Assistant — an internal logistics copilot for the SpiceVeg seed-label admin panel.

Persona:
- Concise. Operational. Inventory-aware.
- Direct. No fluff, no motivational language, no greetings.
- You speak in short sentences. Never more than 2-3 lines per response.

Domain knowledge:
- The system tracks "lots" of agricultural seed (chilli, tomato, cotton, brinjal, etc.).
- Each lot has: lotNo, crop, variety, dot (date of testing), dop (date of packaging), validUpto, netWeight, mrp, physicalPurity, geneticPurity, germination, moisture, producedBy, packedBy, marketedBy, shortUrl, createdAt.
- "Active" = valid (not expired). "Expiring" = within 30 days. "Expired" = past validUpto. "Unknown" = missing validUpto.
- "Purity" typically refers to physicalPurity. "Low purity" = below 95%.
- Lot numbers look like SV22190, KYR-2024-001, etc.

Your job:
- Convert the user's natural-language query into a STRUCTURED INTENT (JSON).
- NEVER invent lot data. The admin client owns the data and applies your filter locally.
- Provide a single short summary sentence describing what you're doing.
- Suggest 1-3 quick-action buttons when useful.

Output rules:
- Reply ONLY with valid JSON matching the response schema.
- "message" must be ≤ 120 chars, plain text, no markdown, no emoji.
- For unrecognized requests, set intent="help" and propose 2-3 followup queries.
- Keep filter fields minimal — only include what the user asked for.`;

const responseSchema = {
  type: 'object',
  properties: {
    intent: {
      type: 'string',
      enum: ['search', 'count', 'open', 'summarize', 'list', 'help', 'unknown'],
    },
    filter: {
      type: 'object',
      properties: {
        crop: { type: 'string' },
        variety: { type: 'string' },
        lotNo: { type: 'string' },
        status: {
          type: 'string',
          enum: ['active', 'expiring', 'expired', 'unknown', 'any'],
        },
        searchText: { type: 'string' },
        createdWithinDays: { type: 'integer' },
        expiresWithinDays: { type: 'integer' },
        expiresInMonth: { type: 'string' },
        missingFields: { type: 'array', items: { type: 'string' } },
        lowPurity: { type: 'boolean' },
        duplicatesOf: { type: 'string', enum: ['crop', 'variety', 'lotNo'] },
      },
    },
    message: { type: 'string' },
    actions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['open_lot', 'apply_filter', 'export_csv', 'copy_lot_id', 'navigate'],
          },
          label: { type: 'string' },
          payload: { type: 'object' },
        },
        required: ['type', 'label'],
      },
    },
    followups: { type: 'array', items: { type: 'string' } },
  },
  required: ['intent', 'filter', 'message', 'actions'],
};

export async function callGemini(
  apiKey: string,
  userMessage: string,
  context: { lotCount: number; cropBreakdown?: Record<string, number>; recentLots?: string[] },
): Promise<AIIntent> {
  if (!apiKey) throw new Error('Gemini API key not configured');

  const contextLine =
    `Inventory snapshot: ${context.lotCount} total lots.` +
    (context.cropBreakdown
      ? ` By crop: ${Object.entries(context.cropBreakdown)
          .slice(0, 8)
          .map(([k, v]) => `${k}=${v}`)
          .join(', ')}.`
      : '') +
    (context.recentLots && context.recentLots.length
      ? ` Recent lots: ${context.recentLots.slice(0, 5).join(', ')}.`
      : '');

  const body = {
    systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: [
      {
        role: 'user',
        parts: [{ text: `${contextLine}\n\nUser query: ${userMessage}` }],
      },
    ],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 512,
      responseMimeType: 'application/json',
      responseSchema,
    },
  };

  let lastErr: unknown = null;
  for (const model of MODEL_CHAIN) {
    try {
      const url = `${GEMINI_BASE}/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        lastErr = new Error(`Gemini ${model} ${res.status}: ${await res.text()}`);
        continue;
      }
      const data = (await res.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        lastErr = new Error(`Gemini ${model}: empty response`);
        continue;
      }
      const parsed = JSON.parse(text) as AIIntent;
      if (!parsed.intent) parsed.intent = 'unknown';
      if (!parsed.filter) parsed.filter = {};
      if (!parsed.actions) parsed.actions = [];
      return parsed;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('Gemini call failed');
}
