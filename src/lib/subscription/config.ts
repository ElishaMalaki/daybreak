// ============================================================
// Intelligence E Agriculture — Subscription & AI Credit Config
// Central configuration for all plan limits and credit costs.
// Change limits here — no other files need to be modified.
// ============================================================

export type SubscriptionTier = 'free' | 'starter' | 'professional' | 'business' | 'enterprise';

export interface PlanLimits {
  farms: number;           // -1 = unlimited
  users: number;           // -1 = unlimited
  aiCredits: number;       // per billing period
  aiRequests: number;      // per billing period
  reports: number;         // per billing period
  researchRequests: number; // per billing period
  documentAnalysis: boolean;
  advancedDocumentAnalysis: boolean;
  apiAccess: boolean;
  priorityRouting: boolean;
}

export interface PlanPricing {
  tzs: number | null;  // null = custom/contact
  usd: number | null;  // null = custom/contact
}

export interface Plan {
  id: SubscriptionTier;
  name: string;
  tagline: string;
  pricing: PlanPricing;
  limits: PlanLimits;
  features: string[];
  highlighted?: boolean;
  contactSales?: boolean;
}

// ============================================================
// PLAN DEFINITIONS
// ============================================================

export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    tagline: 'Try Intelligence E Agriculture',
    pricing: { tzs: 0, usd: 0 },
    limits: {
      farms: 1,
      users: 1,
      aiCredits: 10,
      aiRequests: 10,
      reports: 2,
      researchRequests: 2,
      documentAnalysis: false,
      advancedDocumentAnalysis: false,
      apiAccess: false,
      priorityRouting: false,
    },
    features: [
      '1 farm',
      '1 user',
      '10 AI credits per month',
      '10 AI requests per month',
      '2 reports per month',
      '2 research requests per month',
      'Basic agricultural intelligence',
      'Basic farm data',
    ],
  },

  starter: {
    id: 'starter',
    name: 'Starter',
    tagline: 'For small farms and individual farmers',
    pricing: { tzs: 29900, usd: 9.99 },
    limits: {
      farms: 3,
      users: 3,
      aiCredits: 100,
      aiRequests: 100,
      reports: 10,
      researchRequests: 20,
      documentAnalysis: true,
      advancedDocumentAnalysis: false,
      apiAccess: false,
      priorityRouting: false,
    },
    features: [
      'Up to 3 farms',
      'Up to 3 users',
      '100 AI credits per month',
      '100 AI requests per month',
      '10 reports per month',
      '20 research requests per month',
      'Basic and intermediate agricultural intelligence',
      'Farm data intelligence',
      'Agricultural decision support',
      'Basic document analysis',
    ],
  },

  professional: {
    id: 'professional',
    name: 'Professional',
    tagline: 'For growing agricultural operations',
    pricing: { tzs: 79900, usd: 24.99 },
    limits: {
      farms: 10,
      users: 10,
      aiCredits: 500,
      aiRequests: 500,
      reports: 50,
      researchRequests: 100,
      documentAnalysis: true,
      advancedDocumentAnalysis: true,
      apiAccess: false,
      priorityRouting: true,
    },
    features: [
      'Up to 10 farms',
      'Up to 10 users',
      '500 AI credits per month',
      '500 AI requests per month',
      '50 reports per month',
      '100 research requests per month',
      'Advanced agricultural intelligence',
      'Advanced decision support',
      'Risk intelligence',
      'Advanced research',
      'Document analysis',
      'Priority AI routing',
    ],
    highlighted: true,
  },

  business: {
    id: 'business',
    name: 'Business',
    tagline: 'For large agricultural businesses',
    pricing: { tzs: 199900, usd: 59.99 },
    limits: {
      farms: 50,
      users: 50,
      aiCredits: 2000,
      aiRequests: 2000,
      reports: 250,
      researchRequests: 500,
      documentAnalysis: true,
      advancedDocumentAnalysis: true,
      apiAccess: true,
      priorityRouting: true,
    },
    features: [
      'Up to 50 farms',
      'Up to 50 users',
      '2,000 AI credits per month',
      '2,000 AI requests per month',
      '250 reports per month',
      '500 research requests per month',
      'Advanced agricultural intelligence',
      'Advanced risk intelligence',
      'Advanced document analysis',
      'Advanced reporting',
      'Organization-level features',
      'API access',
      'Priority processing',
    ],
  },

  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'Custom solutions for large organizations',
    pricing: { tzs: null, usd: null },
    limits: {
      farms: -1,
      users: -1,
      aiCredits: -1,
      aiRequests: -1,
      reports: -1,
      researchRequests: -1,
      documentAnalysis: true,
      advancedDocumentAnalysis: true,
      apiAccess: true,
      priorityRouting: true,
    },
    features: [
      'Custom number of farms',
      'Custom number of users',
      'Custom AI limits',
      'API integrations',
      'Higher usage limits',
      'Dedicated configuration',
      'Enterprise support',
    ],
    contactSales: true,
  },
};

// ============================================================
// AI CREDIT COSTS
// Configurable credit costs per request type.
// Change here — no other files need to be modified.
// ============================================================

export type AIRequestCreditType =
  | 'simple_question' |'detailed_analysis' |'research' |'report_generation' |'document_analysis_small' |'document_analysis_large';

export const AI_CREDIT_COSTS: Record<AIRequestCreditType, number> = {
  simple_question: 1,
  detailed_analysis: 3,
  research: 5,
  report_generation: 10,
  document_analysis_small: 10,
  document_analysis_large: 25,
};

// Map from AIRequestType to credit type
export const REQUEST_TYPE_TO_CREDIT_TYPE: Record<string, AIRequestCreditType> = {
  general: 'simple_question',
  market_analysis: 'detailed_analysis',
  farm_data_analysis: 'detailed_analysis',
  decision_support: 'detailed_analysis',
  risk_assessment: 'detailed_analysis',
  research: 'research',
  report: 'report_generation',
  document_analysis: 'document_analysis_small',
};

// ============================================================
// SERVER-SIDE LIMITS (cannot be bypassed by client)
// ============================================================

export const SERVER_LIMITS = {
  maxInputCharacters: 8000,
  maxOutputTokens: 4096,
  maxDocumentSizeBytes: 10 * 1024 * 1024, // 10 MB
  maxConcurrentRequests: 3,
  requestsPerMinute: 10,
  requestsPerMinuteEnterprise: 30,
};

// ============================================================
// PRICING HELPERS
// ============================================================

export function getPlanForCountry(country: string | null | undefined): 'tzs' | 'usd' {
  if (!country) return 'usd';
  const normalized = country.toLowerCase().trim();
  if (
    normalized === 'tanzania' ||
    normalized === 'tz' ||
    normalized === 'united republic of tanzania'
  ) {
    return 'tzs';
  }
  return 'usd';
}

export function formatPrice(plan: Plan, currency: 'tzs' | 'usd'): string {
  if (plan.contactSales) return 'Custom';
  const price = plan.pricing[currency];
  if (price === null) return 'Custom';
  if (price === 0) return 'Free';
  if (currency === 'tzs') {
    return `TZS ${price.toLocaleString()}/mo`;
  }
  return `$${price.toFixed(2)}/mo`;
}

export function getCreditCost(requestType: string): number {
  const creditType = REQUEST_TYPE_TO_CREDIT_TYPE[requestType] || 'simple_question';
  return AI_CREDIT_COSTS[creditType];
}

export function getPlanLimits(tier: SubscriptionTier): PlanLimits {
  return SUBSCRIPTION_PLANS[tier]?.limits ?? SUBSCRIPTION_PLANS.free.limits;
}
