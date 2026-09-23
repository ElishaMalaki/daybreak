// ============================================================
// Intelligence E — Gemini Provider Adapter
// Implements AIProvider interface for Google Gemini.
// API key and model read exclusively from server-side env vars.
// Key is NEVER logged, exposed to client, or included in responses.
// ============================================================

import type { AIProvider, AIRequest, AIResponse, ProviderHealth, AnalysisCapability } from '../types';

// Internal error categories — never sent to client
type GeminiErrorCategory =
  | 'invalid_api_key' |'unauthorized' |'model_not_found' |'rate_limit' |'server_error' |'timeout' |'network_error' |'unknown';

interface GeminiErrorResult {
  category: GeminiErrorCategory;
  message: string;
  isAuthError: boolean;
  retryable: boolean;
}

function classifyGeminiError(status: number, errorMessage: string): GeminiErrorResult {
  const msg = (errorMessage || '').toLowerCase();

  if (status === 400 && (msg.includes('api key') || msg.includes('api_key'))) {
    return { category: 'invalid_api_key', message: 'Invalid API key format', isAuthError: true, retryable: false };
  }
  if (status === 401) {
    return { category: 'invalid_api_key', message: 'API key is invalid or has been revoked', isAuthError: true, retryable: false };
  }
  if (status === 403) {
    return { category: 'unauthorized', message: 'API key does not have permission to access this resource', isAuthError: true, retryable: false };
  }
  if (status === 404) {
    return { category: 'model_not_found', message: `Model not found or access restricted. Google is limiting gemini-2.5 access for new API keys — set GEMINI_MODEL=gemini-3.5-flash in your environment variables.`, isAuthError: false, retryable: false };
  }
  if (status === 429) {
    return { category: 'rate_limit', message: 'Rate limit or quota exceeded', isAuthError: false, retryable: true };
  }
  if (status >= 500 && status < 600) {
    return { category: 'server_error', message: `Gemini server error (${status})`, isAuthError: false, retryable: true };
  }
  return { category: 'unknown', message: `Unexpected error (HTTP ${status})`, isAuthError: false, retryable: true };
}

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
    // Read exclusively from server-side environment variables
    this.apiKey = process.env.GEMINI_API_KEY;
    this.model = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';
  }

  isConfigured(): boolean {
    // Only check that the key exists and is non-empty — no hard-coded comparisons
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
        error: 'Gemini API key not configured',
        isAuthError: false,
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

      // API key is passed as a query param per Google's Gemini REST API authentication spec.
      // This runs server-side only — the key is never sent to the browser or included in
      // client-visible responses, logs, or API output.
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
        let errorBody: { error?: { message?: string } } = {};
        try { errorBody = await response.json(); } catch { /* ignore parse error */ }

        const rawMessage = errorBody?.error?.message || response.statusText || '';
        const classified = classifyGeminiError(response.status, rawMessage);

        // Log category only — never log the raw error message which may contain key hints
        console.error(`[GeminiAdapter] Request failed: ${classified.category} (HTTP ${response.status})`);

        return {
          content: '',
          provider: this.name,
          model: this.model,
          processingTimeMs: Date.now() - startTime,
          success: false,
          error: classified.message,
          isAuthError: classified.isAuthError,
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

      if (isTimeout) {
        console.error('[GeminiAdapter] Request timed out');
      } else {
        console.error('[GeminiAdapter] Network or unexpected error');
      }

      return {
        content: '',
        provider: this.name,
        model: this.model,
        processingTimeMs: Date.now() - startTime,
        success: false,
        error: isTimeout ? 'Request timed out' : 'Network error connecting to Gemini',
        isAuthError: false,
      };
    }
  }

  async checkHealth(): Promise<ProviderHealth> {
    const apiKeyPresent = this.isConfigured();
    const modelPresent = !!(this.model && this.model.trim().length > 0);

    if (!apiKeyPresent) {
      return {
        provider: this.name,
        isAvailable: false,
        lastChecked: new Date(),
        errorMessage: 'GEMINI_API_KEY environment variable is not set',
      };
    }

    if (!modelPresent) {
      return {
        provider: this.name,
        isAvailable: false,
        lastChecked: new Date(),
        errorMessage: 'GEMINI_MODEL environment variable is not set',
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      // Verify the model is accessible and authentication succeeds
      const response = await fetch(
        `${this.baseUrl}/models/${this.model}?key=${this.apiKey}`,
        { signal: controller.signal }
      );

      clearTimeout(timeoutId);

      if (response.ok) {
        return {
          provider: this.name,
          isAvailable: true,
          lastChecked: new Date(),
        };
      }

      let errorBody: { error?: { message?: string } } = {};
      try { errorBody = await response.json(); } catch { /* ignore */ }

      const rawMessage = errorBody?.error?.message || response.statusText || '';
      const classified = classifyGeminiError(response.status, rawMessage);

      // Map category to a user-safe message — never expose the key
      const healthMessages: Record<GeminiErrorCategory, string> = {
        invalid_api_key: 'Authentication failed: API key is invalid or revoked',
        unauthorized: 'Authentication failed: API key lacks required permissions',
        model_not_found: `Model "${this.model}" not found or not accessible with this API key`,
        rate_limit: 'Rate limit or quota exceeded',
        server_error: 'Gemini service is temporarily unavailable',
        timeout: 'Health check timed out',
        network_error: 'Network error reaching Gemini API',
        unknown: `Health check failed (HTTP ${response.status})`,
      };

      return {
        provider: this.name,
        isAvailable: false,
        lastChecked: new Date(),
        errorMessage: healthMessages[classified.category],
      };
    } catch (error: unknown) {
      const isTimeout = error instanceof Error && error.name === 'AbortError';
      return {
        provider: this.name,
        isAvailable: false,
        lastChecked: new Date(),
        errorMessage: isTimeout ? 'Health check timed out' : 'Network error reaching Gemini API',
      };
    }
  }
}
