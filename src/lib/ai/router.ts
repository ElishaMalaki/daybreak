// ============================================================
// Intelligence E — AI Router
// Routes requests to the best available provider.
// Handles fallback and never exposes provider details to users.
// ============================================================

import type { AIProvider, AIRequest, AIResponse, AIRequestType } from './types';
import { GeminiAdapter } from './providers/gemini';
import { GroqAdapter } from './providers/groq';
import { OpenAIAdapter } from './providers/openai';
import { AnthropicAdapter } from './providers/anthropic';
import { OpenAICompatibleAdapter } from './providers/openai-compatible';
import { buildAgriculturalSystemPrompt } from './agriculture-knowledge';

const MAX_INPUT_LENGTH = 8000;
const MAX_RETRY_ATTEMPTS = 2;
export const PUBLIC_AI_PROVIDER_NAME = 'earthai';
export const PUBLIC_AI_MODEL_NAME = 'EarthAI Meridian';

const PROVIDER_ROUTING: Record<AIRequestType, string[]> = {
  general: ['groq', 'gemini', 'openrouter', 'openai', 'anthropic'],
  basic_agriculture_guidance: ['groq', 'gemini', 'openrouter', 'openai'],
  market_analysis: ['gemini', 'groq', 'openrouter', 'openai', 'anthropic'],
  farm_data_analysis: ['gemini', 'deepseek', 'groq', 'openrouter', 'anthropic', 'openai'],
  farm_recommendation: ['gemini', 'deepseek', 'openrouter', 'groq', 'anthropic', 'openai'],
  complex_farm_analysis: ['deepseek', 'gemini', 'openrouter', 'anthropic', 'openai'],
  decision_support: ['gemini', 'deepseek', 'groq', 'openrouter', 'anthropic', 'openai'],
  risk_assessment: ['gemini', 'deepseek', 'openrouter', 'groq', 'anthropic', 'openai'],
  crop_intelligence: ['gemini', 'openrouter', 'groq', 'anthropic', 'openai'],
  pest_disease_analysis: ['gemini', 'openrouter', 'anthropic', 'openai'],
  plant_photo_analysis: ['gemini', 'openrouter'],
  image_analysis: ['gemini', 'openrouter'],
  document_analysis: ['gemini', 'openrouter', 'anthropic', 'openai'],
  research: ['gemini', 'openrouter', 'groq', 'anthropic', 'openai'],
  deep_research: ['gemini', 'openrouter', 'deepseek', 'anthropic', 'openai'],
};

const REALTIME_REQUEST_TYPES = new Set<AIRequestType>([
  'market_analysis',
  'risk_assessment',
  'research',
  'deep_research',
]);

const REALTIME_KEYWORDS = [
  'today',
  'now',
  'current',
  'currently',
  'latest',
  'recent',
  'real time',
  'realtime',
  'live',
  'this week',
  'this month',
  'price',
  'prices',
  'market',
  'weather',
  'forecast',
  'news',
  'outbreak',
  'alert',
  'warning',
];

function normalizeAIResponseContent(content: string): string {
  return content
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, '-')
    .replace(/[•◦▪▫●○◆◇★☆✓✔✗✘➡→←↑↓]/g, '-')
    .replace(/[─━═]{2,}/g, '')
    .replace(/([!?.,:;])\1{1,}/g, '$1')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function requestNeedsRealtimeData(request: AIRequest): boolean {
  if ((request.attachments || []).length > 0) return false;
  if (request.contextData?.requiresRealtime === true) return true;
  if (REALTIME_REQUEST_TYPES.has(request.requestType)) return true;

  const latestUserMessage = [...request.messages].reverse().find((message) => message.role === 'user');
  const content = latestUserMessage?.content?.toLowerCase() || '';
  return REALTIME_KEYWORDS.some((keyword) => content.includes(keyword));
}

export class AIRouter {
  private providers: Map<string, AIProvider>;

  constructor() {
    this.providers = new Map();

    this.providers.set('gemini', new GeminiAdapter());
    this.providers.set('groq', new GroqAdapter());
    this.providers.set('openai', new OpenAIAdapter());
    this.providers.set('anthropic', new AnthropicAdapter());
    this.providers.set('deepseek', new OpenAICompatibleAdapter({
      name: 'deepseek',
      displayName: 'DeepSeek',
      apiKeyEnv: 'DEEPSEEK_API_KEY',
      modelEnv: 'DEEPSEEK_MODEL',
      defaultModel: 'deepseek-chat',
      baseUrl: 'https://api.deepseek.com',
      capabilities: ['text_generation', 'structured_response', 'document_analysis', 'long_context', 'research'],
      maxTokensPerRequest: 8192,
      timeoutMs: 30000,
    }));
    this.providers.set('openrouter', new OpenAICompatibleAdapter({
      name: 'openrouter',
      displayName: 'OpenRouter',
      apiKeyEnv: 'OPENROUTER_API_KEY',
      modelEnv: 'OPENROUTER_MODEL',
      defaultModel: 'google/gemini-flash-1.5',
      baseUrl: 'https://openrouter.ai/api/v1',
      capabilities: ['text_generation', 'structured_response', 'document_analysis', 'long_context', 'research'],
      maxTokensPerRequest: 8192,
      timeoutMs: 30000,
      extraHeaders: {
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL,
        'X-Title': 'Earth AI',
      },
    }));
  }

  private validateInput(request: AIRequest): string | null {
    if (!request.messages || request.messages.length === 0) {
      return 'No messages provided';
    }

    const lastMessage = request.messages[request.messages.length - 1];
    if (!lastMessage?.content?.trim()) {
      return 'Empty message content';
    }

    const totalLength = request.messages.reduce((sum, m) => sum + m.content.length, 0);
    if (totalLength > MAX_INPUT_LENGTH) {
      return `Input too long. Maximum ${MAX_INPUT_LENGTH} characters allowed.`;
    }

    if ((request.attachments || []).length > 0) {
      const hasImageProvider = this.getOrderedProviders(request.requestType, true, false).length > 0;
      if (!hasImageProvider) {
        return 'Image analysis is not currently available. Please contact your administrator to configure a vision-capable Earth AI provider.';
      }
    }

    return null;
  }

  private getOrderedProviders(requestType: AIRequestType, requiresImageAnalysis = false, requiresRealtimeData = false): AIProvider[] {
    const priority = PROVIDER_ROUTING[requestType] || PROVIDER_ROUTING.general;
    const ordered: AIProvider[] = [];

    for (const name of priority) {
      const provider = this.providers.get(name);
      if (!provider || !provider.isConfigured()) continue;
      if (requiresImageAnalysis && !provider.capabilities.includes('image_analysis')) continue;
      if (requiresRealtimeData && !provider.capabilities.includes('web_search')) continue;
      ordered.push(provider);
    }

    return ordered;
  }

  async route(request: AIRequest): Promise<AIResponse & { rateLimitRemaining?: number }> {
    const validationError = this.validateInput(request);
    if (validationError) {
      return {
        content: validationError,
        provider: 'system',
        model: 'none',
        processingTimeMs: 0,
        success: false,
        error: validationError,
      };
    }

    const requiresImageAnalysis = (request.attachments || []).length > 0;
    const requiresRealtimeData = requestNeedsRealtimeData(request);
    const enrichedRequest: AIRequest = {
      ...request,
      contextData: {
        ...(request.contextData || {}),
        requiresRealtime: requiresRealtimeData,
      },
      systemPrompt: request.systemPrompt || buildAgriculturalSystemPrompt({
        ...request,
        contextData: {
          ...(request.contextData || {}),
          requiresRealtime: requiresRealtimeData,
        },
      }),
    };

    const orderedProviders = this.getOrderedProviders(request.requestType, requiresImageAnalysis, requiresRealtimeData);

    if (orderedProviders.length === 0) {
      return {
        content: requiresImageAnalysis
          ? 'Image analysis is not currently available. Please contact your administrator to configure a vision-capable Earth AI provider.'
          : requiresRealtimeData
            ? 'Real-time intelligence is not currently available. Please contact your administrator to configure a search-capable Earth AI provider.'
            : 'Intelligence E AI services are not currently configured. Please contact your administrator to set up AI provider API keys.',
        provider: 'system',
        model: 'none',
        processingTimeMs: 0,
        success: false,
        error: requiresImageAnalysis ? 'NO_VISION_PROVIDERS_AVAILABLE' : requiresRealtimeData ? 'NO_REALTIME_PROVIDERS_AVAILABLE' : 'NO_PROVIDERS_AVAILABLE',
      };
    }

    let lastError = '';
    let attempts = 0;

    for (const provider of orderedProviders) {
      if (attempts >= MAX_RETRY_ATTEMPTS + 1) break;
      attempts++;

      const response = await provider.generateResponse(enrichedRequest);

      if (response.success && response.content) {
        return {
          ...response,
          content: normalizeAIResponseContent(response.content),
        };
      }

      lastError = response.error || 'Unknown error';

      const isAuthError = (response as AIResponse & { isAuthError?: boolean }).isAuthError === true;
      if (isAuthError) break;
      if (lastError.includes('not configured')) continue;
    }

    return {
      content: 'Intelligence E is temporarily unavailable. Please try again in a moment.',
      provider: 'system',
      model: 'none',
      processingTimeMs: 0,
      success: false,
      error: lastError || 'All providers failed',
    };
  }

  toPublicResponse(response: AIResponse & { rateLimitRemaining?: number }): AIResponse & { rateLimitRemaining?: number } {
    if (!response.success) return response;

    return {
      ...response,
      provider: PUBLIC_AI_PROVIDER_NAME,
      model: PUBLIC_AI_MODEL_NAME,
    };
  }

  getConfiguredProviders(): string[] {
    const configured: string[] = [];
    for (const [name, provider] of this.providers) {
      if (provider.isConfigured()) configured.push(name);
    }
    return configured;
  }

  getProviderStatus(): Record<string, { configured: boolean; displayName: string }> {
    const status: Record<string, { configured: boolean; displayName: string }> = {};
    for (const [name, provider] of this.providers) {
      status[name] = {
        configured: provider.isConfigured(),
        displayName: provider.displayName,
      };
    }
    return status;
  }
}

let routerInstance: AIRouter | null = null;

export function getAIRouter(): AIRouter {
  if (!routerInstance) {
    routerInstance = new AIRouter();
  }
  return routerInstance;
}
