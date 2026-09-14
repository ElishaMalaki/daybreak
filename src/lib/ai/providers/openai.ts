// ============================================================
// Intelligence E — OpenAI Provider Adapter
// Prepared but requires OPENAI_API_KEY to activate.
// ============================================================

import type { AIProvider, AIRequest, AIResponse, ProviderHealth, AnalysisCapability } from '../types';

export class OpenAIAdapter implements AIProvider {
  readonly name = 'openai';
  readonly displayName = 'OpenAI GPT';
  readonly capabilities: AnalysisCapability[] = [
    'text_generation',
    'structured_response',
    'document_analysis',
  ];
  readonly maxTokensPerRequest = 4096;
  readonly timeoutMs = 30000;

  private readonly apiKey: string | undefined;
  private readonly model: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  }

  isConfigured(): boolean {
    return !!(this.apiKey && this.apiKey !== 'your-openai-api-key-here' && this.apiKey.startsWith('sk-'));
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
        error: 'OpenAI API key not configured',
      };
    }

    try {
      const messages = [];

      if (request.systemPrompt) {
        messages.push({ role: 'system', content: request.systemPrompt });
      }

      messages.push(...request.messages.map((m) => ({ role: m.role, content: m.content })));

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
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
        return {
          content: '',
          provider: this.name,
          model: this.model,
          processingTimeMs: Date.now() - startTime,
          success: false,
          error: `OpenAI API error ${response.status}: ${errorData?.error?.message || response.statusText}`,
        };
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content || '';
      const usage = data?.usage;

      return {
        content,
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
        error: isTimeout ? 'Request timed out' : `OpenAI error: ${error instanceof Error ? error.message : 'Unknown error'}`,
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

      const response = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${this.apiKey}` },
        signal: controller.signal,
      });

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
