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
  mode?: 'basic' | 'speed'; // active download mode
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
  private state: EngineState = { status: 'idle', mode: 'basic' };
  private listeners: Set<StateListener> = new Set();
  private initPromise: Promise<void> | null = null;
  private downloadMode: 'basic' | 'speed' = 'basic';

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('spiceveg_ai_download_mode');
      if (saved === 'basic' || saved === 'speed') {
        this.downloadMode = saved;
        this.state.mode = saved;
      }
    }
  }

  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private setState(newState: Partial<EngineState>) {
    this.state = { ...this.state, ...newState };
    this.listeners.forEach((fn) => fn(this.state));
  }

  getState(): EngineState {
    return this.state;
  }

  getDownloadMode(): 'basic' | 'speed' {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('spiceveg_ai_download_mode');
      if (saved === 'basic' || saved === 'speed') {
        this.downloadMode = saved;
      }
    }
    return this.downloadMode;
  }

  setDownloadMode(mode: 'basic' | 'speed') {
    this.downloadMode = mode;
    if (typeof window !== 'undefined') {
      localStorage.setItem('spiceveg_ai_download_mode', mode);
    }
    this.setState({ ...this.state, mode });
  }

  async toggleMode(): Promise<void> {
    const currentMode = this.getDownloadMode();
    const nextMode = currentMode === 'basic' ? 'speed' : 'basic';
    this.setDownloadMode(nextMode);

    // Cancel initialization and destroy engine to trigger a clean restart
    await this.destroy();
    this.initPromise = null;
    await this.initialize();
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
    const activeMode = this.getDownloadMode();
    this.setState({ status: 'checking', progress: 'Checking WebGPU support…', percent: 0, mode: activeMode });

    const supported = await this.checkSupport();
    if (!supported) {
      this.setState({
        status: 'unsupported',
        error: 'WebGPU is not available in this browser. Please use Chrome 113+ or Edge 113+.',
        mode: activeMode,
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
      mode: activeMode,
    });

    try {
      const mod = await loadModule();
      const Engine = mod.Engine;

      const CACHE_NAME = 'litert-model-cache-v1';
      let cache: Cache | null = null;
      let cachedResponse: Response | undefined;

      // Try checking Cache Storage
      try {
        if (typeof window !== 'undefined' && 'caches' in window) {
          cache = await caches.open(CACHE_NAME);
          cachedResponse = await cache.match(MODEL_URL);
        }
      } catch (cacheAccessErr) {
        console.warn('Cache Storage access blocked or unavailable:', cacheAccessErr);
      }

      let modelBlob: Blob;

      if (cachedResponse) {
        // Read from cache with progress
        console.log('Model found in Cache Storage!');
        const totalBytes = +(cachedResponse.headers.get('content-length') || 1914992384);
        const reader = cachedResponse.body?.getReader();
        if (!reader) {
          throw new Error('Cache response body is not readable');
        }

        const startTime = Date.now();
        let loadedBytes = 0;
        const chunks: Uint8Array[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            chunks.push(value);
            loadedBytes += value.byteLength;
            const elapsedSeconds = (Date.now() - startTime) / 1000 || 0.001;
            const speedMBs = (loadedBytes / (1024 * 1024)) / elapsedSeconds;
            const percent = Math.min(100, Math.round((loadedBytes / totalBytes) * 100));

            this.setState({
              status: 'loading',
              progress: `Reading from local cache (${percent}%)`,
              percent,
              speed: speedMBs,
              loaded: loadedBytes,
              total: totalBytes,
              cached: true,
              mode: activeMode,
            });
          }
        }
        modelBlob = new Blob(chunks as any, { type: 'application/octet-stream' });
        chunks.length = 0; // Clear immediately
      } else {
        // Fetch from network using basic or speed mode
        console.log(`Fetching model from CDN using ${activeMode} mode...`);
        let totalBytes = 1914992384; // Fallback size

        // Get file size from headers first
        try {
          const headResponse = await fetch(MODEL_URL, { method: 'HEAD' });
          const cl = headResponse.headers.get('content-length');
          if (cl) totalBytes = parseInt(cl, 10);
        } catch (e) {
          console.warn('Failed to fetch head content-length, using fallback size:', e);
        }

        if (activeMode === 'speed') {
          // Speed Mode: Parallel multi-part downloads using HTTP Range
          const numChunks = 4;
          const chunkSize = Math.ceil(totalBytes / numChunks);
          const chunkPromises: Promise<Uint8Array>[] = [];
          const chunkLoaded = new Array(numChunks).fill(0);
          const startTime = Date.now();

          for (let i = 0; i < numChunks; i++) {
            const start = i * chunkSize;
            const end = Math.min((i + 1) * chunkSize - 1, totalBytes - 1);

            const chunkPromise = (async () => {
              const response = await fetch(MODEL_URL, {
                headers: { Range: `bytes=${start}-${end}` }
              });
              if (!response.ok) {
                throw new Error(`HTTP ${response.status} fetching range ${start}-${end}`);
              }
              const reader = response.body?.getReader();
              if (!reader) throw new Error('ReadableStream not supported on chunk body');

              const chunksList: Uint8Array[] = [];
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                if (value) {
                  chunksList.push(value);
                  chunkLoaded[i] += value.byteLength;

                  // Update progress based on aggregate parallel load
                  const totalLoaded = chunkLoaded.reduce((a, b) => a + b, 0);
                  const elapsedSeconds = (Date.now() - startTime) / 1000 || 0.001;
                  const speedMBs = (totalLoaded / (1024 * 1024)) / elapsedSeconds;
                  const percent = Math.min(100, Math.round((totalLoaded / totalBytes) * 100));

                  litertEngine.setState({
                    status: 'loading',
                    progress: `Downloading weights (Speed Mode) (${percent}%)`,
                    percent,
                    speed: speedMBs,
                    loaded: totalLoaded,
                    total: totalBytes,
                    cached: false,
                    mode: 'speed'
                  });
                }
              }

              const chunkBuffer = new Uint8Array(chunkLoaded[i]);
              let offset = 0;
              for (const u8 of chunksList) {
                chunkBuffer.set(u8, offset);
                offset += u8.length;
              }
              return chunkBuffer;
            })();

            chunkPromises.push(chunkPromise);
          }

          const chunkBuffers = await Promise.all(chunkPromises);
          modelBlob = new Blob(chunkBuffers as any, { type: 'application/octet-stream' });
        } else {
          // Basic Mode: Standard single connection fetch
          const response = await fetch(MODEL_URL);
          if (!response.ok) {
            throw new Error(`Failed to fetch model: HTTP ${response.status}`);
          }
          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error('Response body is not readable');
          }

          const startTime = Date.now();
          let loadedBytes = 0;
          const chunks: Uint8Array[] = [];

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) {
              chunks.push(value);
              loadedBytes += value.byteLength;
              const elapsedSeconds = (Date.now() - startTime) / 1000 || 0.001;
              const speedMBs = (loadedBytes / (1024 * 1024)) / elapsedSeconds;
              const percent = Math.min(100, Math.round((loadedBytes / totalBytes) * 100));

              this.setState({
                status: 'loading',
                progress: `Downloading weights (Basic Mode) (${percent}%)`,
                percent,
                speed: speedMBs,
                loaded: loadedBytes,
                total: totalBytes,
                cached: false,
                mode: 'basic',
              });
            }
          }
          modelBlob = new Blob(chunks as any, { type: 'application/octet-stream' });
          chunks.length = 0;
        }

        // Cache downloaded model for next reload
        if (cache) {
          try {
            await cache.put(MODEL_URL, new Response(modelBlob, {
              headers: {
                'content-type': 'application/octet-stream',
                'content-length': modelBlob.size.toString()
              }
            }));
            console.log('Model successfully saved to Cache Storage.');
          } catch (saveCacheErr) {
            console.warn('Failed to store downloaded model in Cache Storage:', saveCacheErr);
          }
        }
      }

      // Initialize the Engine
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
        loaded: modelBlob.size,
        total: modelBlob.size,
        mode: activeMode,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load model';
      console.error('LiteRT-LM initialization error:', e);
      this.setState({ status: 'error', error: msg, mode: activeMode });
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
      this.setState({ status: 'idle', mode: this.getDownloadMode() });
    }
  }
}

// Singleton instance
export const litertEngine = new LiteRTEngineManager();
