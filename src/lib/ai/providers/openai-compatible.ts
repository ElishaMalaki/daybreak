// ============================================================
// Intelligence E — OpenAI-Compatible Provider Adapter
// Used for providers that expose /chat/completions-compatible APIs.
// API keys stay server-side only.
// ============================================================

import type { AIProvider, AIRequest, AIResponse, ProviderHealth, AnalysisCapability } from '../types';

interface OpenAICompatibleOptions {
  name: string;
  displayName: string;
  apiKeyEnv: string;
  modelEnv: string;
  defaultModel: string;
  baseUrl: string;
  capabilities: AnalysisCapability[];
  maxTokensPerRequest?: number;
  timeoutMs?: number;
  extraHeaders?: Record<string, string | undefined>;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class OpenAICompatibleAdapter implements AIProvider {
  readonly name: string;
  readonly displayName: string;
  readonly capabilities: AnalysisCapability[];
  readonly maxTokensPerRequest: number;
  readonly timeoutMs: number;

  private readonly apiKey: string | undefined;
  private readonly model: string;
  private readonly baseUrl: string;
  private readonly extraHeaders: Record<string, string | undefined>;

  constructor(options: OpenAICompatibleOptions) {
    this.name = options.name;
    this.displayName = options.displayName;
    this.capabilities = options.capabilities;
    this.maxTokensPerRequest = options.maxTokensPerRequest || 8192;
    this.timeoutMs = options.timeoutMs || 30000;
    this.apiKey = process.env[options.apiKeyEnv];
    this.model = process.env[options.modelEnv] || options.defaultModel;
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.extraHeaders = options.extraHeaders || {};
  }

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async generateResponse(request: AIRequest): Promise<AIResponse & { isAuthError?: boolean }> {
    const startTime = Date.now();

    if (!this.isConfigured()) {
      return {
        content: '',
        provider: this.name,
        model: this.model,
        processingTimeMs: Date.now() - startTime,
        success: false,
        error: `${this.displayName} API key not configured`,
        isAuthError: false,
      };
    }

    if ((request.attachments || []).length > 0 && !this.capabilities.includes('image_analysis')) {
      return {
        content: '',
        provider: this.name,
        model: this.model,
        processingTimeMs: Date.now() - startTime,
        success: false,
        error: `${this.displayName} does not support image analysis in this adapter`,
        isAuthError: false,
      };
    }

    try {
      const messages: ChatMessage[] = [];

      if (request.systemPrompt) {
        messages.push({ role: 'system', content: request.systemPrompt });
      }

      messages.push(...request.messages.map((message) => ({ role: message.role, content: message.content })));

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          ...Object.fromEntries(Object.entries(this.extraHeaders).filter(([, value]) => Boolean(value))),
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          max_tokens: Math.min(request.maxTokens || 2048, this.maxTokensPerRequest),
          temperature: request.temperature ?? 0.7,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData?.error?.message || response.statusText;

        return {
          content: '',
          provider: this.name,
          model: this.model,
          processingTimeMs: Date.now() - startTime,
          success: false,
          error: `${this.displayName} API error ${response.status}: ${message}`,
          isAuthError: response.status === 401 || response.status === 403,
        };
      }

      const data = await response.json();
      const usage = data?.usage;

      return {
        content: data?.choices?.[0]?.message?.content || '',
        provider: this.name,
        model: this.model,
        inputTokens: usage?.prompt_tokens,
        outputTokens: usage?.completion_tokens,
        totalTokens: usage?.total_tokens,
        processingTimeMs: Date.now() - startTime,
        success: true,
      };
    } catch (error: unknown) {
      const isTimeout = error instanceof Error && error.name === 'AbortError';

      return {
        content: '',
        provider: this.name,
        model: this.model,
        processingTimeMs: Date.now() - startTime,
        success: false,
        error: isTimeout ? 'Request timed out' : `Network error connecting to ${this.displayName}`,
        isAuthError: false,
      };
    }
  }

  async checkHealth(): Promise<ProviderHealth> {
    if (!this.isConfigured()) {
      return {
        provider: this.name,
        isAvailable: false,
        lastChecked: new Date(),
        errorMessage: 'API key not configured',
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          ...Object.fromEntries(Object.entries(this.extraHeaders).filter(([, value]) => Boolean(value))),
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      return {
        provider: this.name,
        isAvailable: response.ok,
        lastChecked: new Date(),
        errorMessage: response.ok ? undefined : `HTTP ${response.status}`,
      };
    } catch (error: unknown) {
      const isTimeout = error instanceof Error && error.name === 'AbortError';
      return {
        provider: this.name,
        isAvailable: false,
        lastChecked: new Date(),
        errorMessage: isTimeout ? 'Health check timed out' : 'Health check failed',
      };
    }
  }
}
