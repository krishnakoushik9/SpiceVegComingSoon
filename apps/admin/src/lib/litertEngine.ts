/**
 * LiteRT-LM Web Engine Manager
 * Manages the lifecycle of the Gemma 4 E2B model running locally via WebGPU.
 * This replaces the server-side Gemini API calls with a fully client-side model.
 */

// We use dynamic import from CDN since @litert-lm/core is not in package.json
let _engineModule: any = null;

async function loadModule() {
  if (_engineModule) return _engineModule;
  _engineModule = await import(
    /* webpackIgnore: true */
    'https://cdn.jsdelivr.net/npm/@litert-lm/core/+esm'
  );
  return _engineModule;
}

export type EngineStatus =
  | 'idle'
  | 'checking'
  | 'loading'
  | 'ready'
  | 'error'
  | 'unsupported';

export interface EngineState {
  status: EngineStatus;
  progress?: string;
  error?: string;
  percent?: number;    // download/load percentage (0-100)
  speed?: number;      // load speed in MB/s
  loaded?: number;     // loaded bytes
  total?: number;      // total bytes
  cached?: boolean;    // whether model was retrieved from cache
}

type StateListener = (state: EngineState) => void;

// Model served from HuggingFace CDN (Cloudflare Pages has a 25MB file limit)
const MODEL_URL = 'https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm/resolve/main/gemma-4-E2B-it-web.litertlm';

// System prompt adapted from the Gemini worker prompt for local use
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
- Convert the user's natural-language query into a structured JSON intent.
- NEVER invent lot data. The admin client owns the data and applies your filter locally.
- Provide a single short summary sentence describing what you're doing.
- Suggest 1-3 quick-action buttons when useful.

Output rules:
- Reply ONLY with valid JSON matching this schema:
{
  "intent": "search" | "count" | "open" | "summarize" | "list" | "help" | "unknown",
  "filter": {
    "crop": string?,
    "variety": string?,
    "lotNo": string?,
    "status": "active" | "expiring" | "expired" | "unknown" | "any",
    "searchText": string?,
    "createdWithinDays": number?,
    "expiresWithinDays": number?,
    "expiresInMonth": string?,
    "missingFields": string[]?,
    "lowPurity": boolean?,
    "duplicatesOf": "crop" | "variety" | "lotNo"
  },
  "message": string (≤120 chars, plain text, no markdown, no emoji),
  "actions": [{ "type": "open_lot" | "apply_filter" | "export_csv" | "copy_lot_id" | "navigate", "label": string, "payload": {} }],
  "followups": string[]
}
- "message" must be ≤ 120 chars, plain text, no markdown, no emoji.
- For unrecognized requests, set intent="help" and propose 2-3 followup queries.
- Keep filter fields minimal — only include what the user asked for.
- Output ONLY the JSON. No extra text before or after.`;

class LiteRTEngineManager {
  private engine: any = null;
  private conversation: any = null;
  private state: EngineState = { status: 'idle' };
  private listeners: Set<StateListener> = new Set();
  private initPromise: Promise<void> | null = null;

  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private setState(newState: EngineState) {
    this.state = newState;
    this.listeners.forEach((fn) => fn(newState));
  }

  getState(): EngineState {
    return this.state;
  }

  /** Check if WebGPU is available */
  async checkSupport(): Promise<boolean> {
    if (typeof navigator === 'undefined') return false;
    if (!('gpu' in navigator)) return false;
    try {
      const adapter = await (navigator as any).gpu.requestAdapter();
      return !!adapter;
    } catch {
      return false;
    }
  }

  /** Initialize the engine — idempotent, safe to call multiple times */
  async initialize(): Promise<void> {
    if (this.state.status === 'ready' || this.state.status === 'loading') {
      return this.initPromise || Promise.resolve();
    }

    this.initPromise = this._doInit();
    return this.initPromise;
  }

  private async _doInit(): Promise<void> {
    this.setState({ status: 'checking', progress: 'Checking WebGPU support…', percent: 0 });

    const supported = await this.checkSupport();
    if (!supported) {
      this.setState({
        status: 'unsupported',
        error: 'WebGPU is not available in this browser. Please use Chrome 113+ or Edge 113+.',
      });
      return;
    }

    this.setState({
      status: 'loading',
      progress: 'Connecting to model source…',
      percent: 0,
      speed: 0,
      loaded: 0,
      total: 0,
    });

    try {
      const mod = await loadModule();
      const Engine = mod.Engine;

      const CACHE_NAME = 'litert-model-cache-v1';
      let cache: Cache | null = null;
      let cachedResponse: Response | undefined;

      // Try checking if model is already stored in the browser's persistent Cache Storage
      try {
        if (typeof window !== 'undefined' && 'caches' in window) {
          cache = await caches.open(CACHE_NAME);
          cachedResponse = await cache.match(MODEL_URL);
        }
      } catch (cacheAccessErr) {
        console.warn('Cache Storage access blocked or unavailable:', cacheAccessErr);
      }

      let response: Response;
      let isFromCache = false;

      if (cachedResponse) {
        response = cachedResponse;
        isFromCache = true;
      } else {
        response = await fetch(MODEL_URL);
        if (!response.ok) {
          throw new Error(`Failed to fetch model: HTTP ${response.status}`);
        }
        isFromCache = false;
      }

      const totalBytes = +(response.headers.get('content-length') || 1999900000);
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      const startTime = Date.now();
      let loadedBytes = 0;
      const chunks: Uint8Array[] = [];

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            chunks.push(value);
            loadedBytes += value.byteLength;
            const elapsedSeconds = (Date.now() - startTime) / 1000 || 0.001;
            const speedMBs = (loadedBytes / (1024 * 1024)) / elapsedSeconds;
            const percent = Math.min(100, Math.round((loadedBytes / totalBytes) * 100));

            litertEngine.setState({
              status: 'loading',
              progress: isFromCache 
                ? `Reading from local cache (${percent}%)` 
                : `Downloading model weights (${percent}%)`,
              percent,
              speed: speedMBs,
              loaded: loadedBytes,
              total: totalBytes,
              cached: isFromCache
            });
          }
        }
      } catch (err) {
        throw new Error(`Model load failed: ${err instanceof Error ? err.message : err}`);
      }

      // Combine chunks into a single Blob
      const modelBlob = new Blob(chunks as any, { type: 'application/octet-stream' });
      
      // Clear chunks array immediately to free heavy RAM before engine allocation
      chunks.length = 0;

      // If downloaded from network, asynchronously persist it to Cache Storage
      if (!isFromCache && cache) {
        try {
          await cache.put(MODEL_URL, new Response(modelBlob, {
            headers: {
              'content-type': 'application/octet-stream',
              'content-length': modelBlob.size.toString()
            }
          }));
        } catch (saveCacheErr) {
          console.warn('Failed to store downloaded model in Cache Storage:', saveCacheErr);
        }
      }

      // 2. Initialize the Engine with the fully loaded Blob
      this.engine = await Engine.create({
        model: modelBlob,
        mainExecutorSettings: {
          maxNumTokens: 4096,
        },
      });

      this.conversation = await this.engine.createConversation({
        preface: {
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
          ],
        },
      });

      this.setState({
        status: 'ready',
        progress: 'Model loaded and ready.',
        percent: 100,
        loaded: totalBytes,
        total: totalBytes,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load model';
      console.error('LiteRT-LM initialization error:', e);
      this.setState({ status: 'error', error: msg });
    }
  }

  /** Send a message and get a streamed response */
  async sendMessage(
    userMessage: string,
    contextLine: string,
    onChunk?: (text: string) => void,
  ): Promise<string> {
    if (!this.conversation) {
      throw new Error('Model not initialized. Please wait for initialization to complete.');
    }

    const fullMessage = `${contextLine}\n\nUser query: ${userMessage}`;
    let fullResponse = '';

    try {
      const stream = this.conversation.sendMessageStreaming(fullMessage);
      for await (const chunk of stream) {
        const text = chunk.content?.[0]?.text || '';
        fullResponse += text;
        onChunk?.(text);
      }
    } catch (e) {
      console.error('LiteRT-LM send error:', e);
      throw e;
    }

    return fullResponse;
  }

  /** Reset the conversation (clear history, keep model loaded) */
  async resetConversation(): Promise<void> {
    if (!this.engine) return;
    try {
      this.conversation = await this.engine.createConversation({
        preface: {
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
          ],
        },
      });
    } catch (e) {
      console.error('Failed to reset conversation:', e);
    }
  }

  /** Clean up resources */
  async destroy(): Promise<void> {
    if (this.engine) {
      try {
        await this.engine.delete();
      } catch {
        // ignore
      }
      this.engine = null;
      this.conversation = null;
      this.setState({ status: 'idle' });
    }
  }
}

// Singleton instance
export const litertEngine = new LiteRTEngineManager();
