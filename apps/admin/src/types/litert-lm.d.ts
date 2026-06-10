// Type declarations for CDN-imported LiteRT-LM module
declare module 'https://cdn.jsdelivr.net/npm/@litert-lm/core/+esm' {
  export interface EngineSettings {
    model: string | ReadableStream | Blob;
    mainExecutorSettings?: {
      maxNumTokens?: number;
    };
  }

  export interface ConversationConfig {
    preface?: {
      messages: Array<{ role: string; content: string }>;
    };
  }

  export interface ResponseChunk {
    content: Array<{ type?: string; text: string }>;
  }

  export interface Conversation {
    sendMessage(input: string | { role: string; content: string }): Promise<{ content: Array<{ text: string }> }>;
    sendMessageStreaming(input: string): AsyncIterable<ResponseChunk>;
    cancel(): void;
  }

  export class Engine {
    static create(settings: EngineSettings): Promise<Engine>;
    createConversation(config?: ConversationConfig): Promise<Conversation>;
    delete(): Promise<void>;
  }
}
