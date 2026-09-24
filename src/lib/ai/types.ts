// ============================================================
// Intelligence E — AI Provider Interface
// All providers implement this contract.
// The application communicates ONLY with this interface.
// ============================================================

export type AnalysisCapability =
  | 'text_generation'
  | 'structured_response'
  | 'document_analysis'
  | 'image_analysis'
  | 'long_context'
  | 'research'
  | 'web_search';

export type AIRequestType =
  | 'market_analysis'
  | 'farm_data_analysis'
  | 'decision_support'
  | 'risk_assessment'
  | 'research'
  | 'general';

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIImageAttachment {
  type: 'image';
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
  data: string;
  name?: string;
}

export interface AIRequest {
  messages: AIMessage[];
  requestType: AIRequestType;
  userId: string;
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
  contextData?: Record<string, unknown>;
  attachments?: AIImageAttachment[];
}

export interface AIResponse {
  content: string;
  provider: string;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  processingTimeMs: number;
  success: boolean;
  error?: string;
}

export interface ProviderHealth {
  provider: string;
  isAvailable: boolean;
  lastChecked: Date;
  errorMessage?: string;
}

export interface AIProvider {
  readonly name: string;
  readonly displayName: string;
  readonly capabilities: AnalysisCapability[];
  readonly maxTokensPerRequest: number;
  readonly timeoutMs: number;

  isConfigured(): boolean;
  generateResponse(request: AIRequest): Promise<AIResponse>;
  checkHealth(): Promise<ProviderHealth>;
}
