// ============================================================
// Intelligence E - Groq Provider Adapter
// Implements AIProvider interface for Groq's OpenAI-compatible API.
// API key stays server-side only.
// ============================================================

import type { AIProvider, AIRequest, AIResponse, ProviderHealth, AnalysisCapability } from '../types';

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class GroqAdapter implements AIProvider {
  readonly name = 'groq';
  readonly displayName = 'Groq';
  readonly capabilities: AnalysisCapability[] = [
    'text_generation',
    'structured_response',
    'research',
  ];
  readonly maxTokensPerRequest = 8192;
  readonly timeoutMs = 30000;

  private readonly apiKey: string | undefined;
  private readonly model: string;
  private readonly baseUrl: string;

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY;
    this.model = process.env.GROQ_MODEL || 'llama-3.1-70b-versatile';
    this.baseUrl = 'https://api.groq.com/openai/v1';
  }

  isConfigured(): boolean {
    return !!(this.apiKey && this.apiKey.trim().length > 0);
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
        error: 'Groq API key not configured',
        isAuthError: false,
      };
    }

    try {
      const messages: GroqMessage[] = [];

      if (request.systemPrompt) {
        messages.push({ role: 'system', content: request.systemPrompt });
      }

      messages.push(
        ...request.messages.map((message) => ({
          role: message.role,
          content: message.content,
        }))
      );

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
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
          error: `Groq API error ${response.status}: ${message}`,
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
        error: isTimeout ? 'Request timed out' : 'Network error connecting to Groq',
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
        errorMessage: 'GROQ_API_KEY environment variable is not set',
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
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
        errorMessage: isTimeout ? 'Health check timed out' : 'Network error reaching Groq API',
      };
    }
  }
}
