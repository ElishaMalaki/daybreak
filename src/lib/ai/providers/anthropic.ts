// ============================================================
// Intelligence E — Anthropic Provider Adapter
// Prepared but requires ANTHROPIC_API_KEY to activate.
// ============================================================

import type { AIProvider, AIRequest, AIResponse, ProviderHealth, AnalysisCapability } from '../types';

export class AnthropicAdapter implements AIProvider {
  readonly name = 'anthropic';
  readonly displayName = 'Anthropic Claude';
  readonly capabilities: AnalysisCapability[] = [
    'text_generation',
    'structured_response',
    'long_context',
    'document_analysis',
  ];
  readonly maxTokensPerRequest = 8192;
  readonly timeoutMs = 30000;

  private readonly apiKey: string | undefined;
  private readonly model: string;

  constructor() {
    this.apiKey = process.env.ANTHROPIC_API_KEY;
    this.model = process.env.ANTHROPIC_MODEL || 'claude-3-haiku-20240307';
  }

  isConfigured(): boolean {
    return !!(this.apiKey && this.apiKey !== 'your-anthropic-api-key-here' && this.apiKey.startsWith('sk-ant-'));
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
        error: 'Anthropic API key not configured',
      };
    }

    try {
      const messages = request.messages
        .filter((m) => m.role !== 'system')
        .map((m) => ({ role: m.role, content: m.content }));

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      const body: Record<string, unknown> = {
        model: this.model,
        max_tokens: Math.min(request.maxTokens || 2048, this.maxTokensPerRequest),
        messages,
      };

      if (request.systemPrompt) {
        body.system = request.systemPrompt;
      }

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey!,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(body),
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
          error: `Anthropic API error ${response.status}: ${errorData?.error?.message || response.statusText}`,
        };
      }

      const data = await response.json();
      const content = data?.content?.[0]?.text || '';
      const usage = data?.usage;

      return {
        content,
        provider: this.name,
        model: this.model,
        inputTokens: usage?.input_tokens,
        outputTokens: usage?.output_tokens,
        totalTokens: (usage?.input_tokens || 0) + (usage?.output_tokens || 0),
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
        error: isTimeout ? 'Request timed out' : `Anthropic error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  async checkHealth(): Promise<ProviderHealth> {
    return {
      provider: this.name,
      isAvailable: this.isConfigured(),
      lastChecked: new Date(),
      errorMessage: this.isConfigured() ? undefined : 'API key not configured',
    };
  }
}
