// ============================================================
// Intelligence E — Gemini Provider Adapter
// Implements AIProvider interface for Google Gemini.
// API key stays server-side only.
// ============================================================

import type { AIProvider, AIRequest, AIResponse, ProviderHealth, AnalysisCapability } from './types';

export class GeminiAdapter implements AIProvider {
  readonly name = 'gemini';
  readonly displayName = 'Google Gemini';
  readonly capabilities: AnalysisCapability[] = [
    'text_generation',
    'structured_response',
    'document_analysis',
    'long_context',
  ];
  readonly maxTokensPerRequest = 8192;
  readonly timeoutMs = 30000;

  private readonly apiKey: string | undefined;
  private readonly model: string;
  private readonly baseUrl: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.model = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
  }

  isConfigured(): boolean {
    return !!(this.apiKey && this.apiKey !== 'your-gemini-api-key-here' && this.apiKey.length > 10);
  }

  async generateResponse(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();

    if (!this.isConfigured()) {
      return {
        content: '',
        provider: this.name,
        model: this.model,
        processingTimeMs: Date.now() - startTime,
        success: false,
        error: 'Gemini API key not configured',
      };
    }

    try {
      // Build contents array from messages
      const contents = request.messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }));

      // Prepend system instruction if present
      const systemInstruction = request.systemPrompt
        ? { parts: [{ text: request.systemPrompt }] }
        : undefined;

      const body: Record<string, unknown> = {
        contents,
        generationConfig: {
          maxOutputTokens: Math.min(request.maxTokens || 2048, this.maxTokensPerRequest),
          temperature: request.temperature ?? 0.7,
        },
      };

      if (systemInstruction) {
        body.systemInstruction = systemInstruction;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      const response = await fetch(
        `${this.baseUrl}/models/${this.model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          content: '',
          provider: this.name,
          model: this.model,
          processingTimeMs: Date.now() - startTime,
          success: false,
          error: `Gemini API error ${response.status}: ${errorData?.error?.message || response.statusText}`,
        };
      }

      const data = await response.json();
      const candidate = data?.candidates?.[0];
      const content = candidate?.content?.parts?.[0]?.text || '';
      const usageMetadata = data?.usageMetadata;

      return {
        content,
        provider: this.name,
        model: this.model,
        inputTokens: usageMetadata?.promptTokenCount,
        outputTokens: usageMetadata?.candidatesTokenCount,
        totalTokens: usageMetadata?.totalTokenCount,
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
        error: isTimeout ? 'Request timed out' : `Gemini error: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(
        `${this.baseUrl}/models/${this.model}?key=${this.apiKey}`,
        { signal: controller.signal }
      );

      clearTimeout(timeoutId);

      return {
        provider: this.name,
        isAvailable: response.ok,
        lastChecked: new Date(),
        errorMessage: response.ok ? undefined : `HTTP ${response.status}`,
      };
    } catch {
      return {
        provider: this.name,
        isAvailable: false,
        lastChecked: new Date(),
        errorMessage: 'Health check failed',
      };
    }
  }
}
