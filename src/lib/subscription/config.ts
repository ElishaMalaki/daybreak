// ============================================================
// Intelligence E Agriculture — Subscription & AI Credit Config
// Central configuration for all plan limits and credit costs.
// Change limits here — no other files need to be modified.
// ============================================================

export type SubscriptionTier = 'free' | 'starter' | 'professional' | 'business' | 'enterprise';

export const PELIT_CAPABILITY_NOTICE = 'Full farm management and the expanded agriculture data model will be available in the Pelit app.';

export interface PlanLimits {
  farms: number;
  users: number;
  aiCredits: number;
  aiRequests: number;
  reports: number;
  researchRequests: number;
  imageAnalysis: boolean;
  limitedImageAnalysis: boolean;
  documentAnalysis: boolean;
  limitedDocumentAnalysis: boolean;
  advancedDocumentAnalysis: boolean;
  apiAccess: boolean;
  dataExport: boolean;
  teamCollaboration: boolean;
  priorityRouting: boolean;
}

export interface PlanPricing { usd: number | null; }

export interface Plan {
  id: SubscriptionTier;
  name: string;
  audience: string;
  tagline: string;
  pricing: PlanPricing;
  limits: PlanLimits;
  features: string[];
  highlighted?: boolean;
  contactSales?: boolean;
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, Plan> = {
  free: {
    id: 'free',
    name: 'Free',
    audience: 'For farmers exploring Intelligence E',
    tagline: 'Basic agricultural intelligence for evaluation',
    pricing: { usd: 0 },
    limits: { farms: 1, users: 1, aiCredits: 25, aiRequests: 25, reports: 2, researchRequests: 1, imageAnalysis: true, limitedImageAnalysis: true, documentAnalysis: true, limitedDocumentAnalysis: true, advancedDocumentAnalysis: false, apiAccess: false, dataExport: false, teamCollaboration: false, priorityRouting: false },
    features: ['1 farm', '1 user', 'Limited AI assistance', 'Basic agricultural intelligence', 'Basic crop guidance', 'Basic farm data', 'Limited pest & disease guidance', 'Limited image analysis', 'Limited document analysis', '2 reports/month', '1 research request/month', 'Saved AI conversations', 'Farm history', PELIT_CAPABILITY_NOTICE],
  },
  starter: {
    id: 'starter',
    name: 'Starter',
    audience: 'For individual farmers and small farms',
    tagline: 'Everyday intelligence for small farm operations',
    pricing: { usd: 9.99 },
    limits: { farms: 3, users: 3, aiCredits: 150, aiRequests: 150, reports: 10, researchRequests: 5, imageAnalysis: true, limitedImageAnalysis: false, documentAnalysis: true, limitedDocumentAnalysis: true, advancedDocumentAnalysis: false, apiAccess: false, dataExport: false, teamCollaboration: false, priorityRouting: false },
    features: ['Up to 3 farms', 'Up to 3 users', 'AI assistance for everyday farming', 'Personalized farm recommendations', 'Crop intelligence', 'Pest & disease intelligence', 'Image analysis', 'Basic document analysis', 'Farm history', 'Saved recommendations', 'AI conversation history', '10 reports/month', '5 research requests/month', 'Basic decision support', PELIT_CAPABILITY_NOTICE],
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    audience: 'For growing agricultural operations',
    tagline: 'Advanced intelligence for growing operations',
    pricing: { usd: 24.99 },
    limits: { farms: 10, users: 10, aiCredits: 600, aiRequests: 600, reports: 30, researchRequests: 10, imageAnalysis: true, limitedImageAnalysis: false, documentAnalysis: true, limitedDocumentAnalysis: false, advancedDocumentAnalysis: true, apiAccess: false, dataExport: false, teamCollaboration: true, priorityRouting: true },
    features: ['Up to 10 farms', 'Up to 10 users', 'Advanced AI assistance', 'Advanced agricultural intelligence', 'Advanced crop intelligence', 'Advanced pest & disease intelligence', 'Image analysis', 'Advanced document analysis', 'Personalized decision support', 'Farm performance intelligence', 'Risk intelligence', 'Advanced agricultural research', 'Farm history & analytics', 'Team collaboration', '30 reports/month', '10 research requests/month', 'Priority AI processing', 'Saved reports & recommendations', PELIT_CAPABILITY_NOTICE],
    highlighted: true,
  },
  business: {
    id: 'business',
    name: 'Business',
    audience: 'For agricultural businesses, cooperatives and organizations',
    tagline: 'High-volume intelligence for agricultural teams',
    pricing: { usd: 59.99 },
    limits: { farms: 50, users: 50, aiCredits: 2500, aiRequests: 2500, reports: 100, researchRequests: 30, imageAnalysis: true, limitedImageAnalysis: false, documentAnalysis: true, limitedDocumentAnalysis: false, advancedDocumentAnalysis: true, apiAccess: true, dataExport: true, teamCollaboration: true, priorityRouting: true },
    features: ['Up to 50 farms', 'Up to 50 users', 'High-volume AI assistance', 'Advanced agricultural intelligence', 'Advanced crop intelligence', 'Advanced pest & disease intelligence', 'Advanced image analysis', 'Advanced document intelligence', 'Advanced decision support', 'Advanced risk intelligence', 'Multi-farm analytics', 'Organization-level intelligence', 'Advanced reporting', 'Team management', '100 reports/month', '30 research requests/month', 'Priority AI processing', 'API access', 'Data export', 'Organization-wide farm insights', PELIT_CAPABILITY_NOTICE],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    audience: 'For large agricultural organizations',
    tagline: 'Custom intelligence, security and scale',
    pricing: { usd: null },
    limits: { farms: -1, users: -1, aiCredits: -1, aiRequests: -1, reports: -1, researchRequests: -1, imageAnalysis: true, limitedImageAnalysis: false, documentAnalysis: true, limitedDocumentAnalysis: false, advancedDocumentAnalysis: true, apiAccess: true, dataExport: true, teamCollaboration: true, priorityRouting: true },
    features: ['Custom farms', 'Custom users', 'Custom AI usage', 'Enterprise agricultural intelligence', 'Enterprise crop intelligence', 'Enterprise pest & disease intelligence', 'Advanced image & document intelligence', 'Enterprise decision support', 'Enterprise risk intelligence', 'Organization-wide analytics', 'Advanced reporting', 'API integrations', 'Custom AI integrations', 'Custom permissions', 'Custom security configuration', 'Dedicated configuration', 'Priority processing', 'Enterprise support', PELIT_CAPABILITY_NOTICE],
    contactSales: true,
  },
};

export type AIRequestCreditType = 'simple_question' | 'basic_guidance' | 'detailed_analysis' | 'research' | 'deep_research' | 'report_generation' | 'image_analysis' | 'document_analysis_small' | 'document_analysis_large';

export const AI_CREDIT_COSTS: Record<AIRequestCreditType, number> = {
  simple_question: 1,
  basic_guidance: 2,
  detailed_analysis: 3,
  research: 5,
  deep_research: 10,
  report_generation: 10,
  image_analysis: 4,
  document_analysis_small: 6,
  document_analysis_large: 15,
};

export const REQUEST_TYPE_TO_CREDIT_TYPE: Record<string, AIRequestCreditType> = {
  general: 'simple_question',
  basic_agriculture_guidance: 'basic_guidance',
  crop_intelligence: 'detailed_analysis',
  pest_disease_analysis: 'detailed_analysis',
  market_analysis: 'detailed_analysis',
  farm_data_analysis: 'detailed_analysis',
  decision_support: 'detailed_analysis',
  risk_assessment: 'detailed_analysis',
  research: 'research',
  deep_research: 'deep_research',
  report: 'report_generation',
  report_generation: 'report_generation',
  image_analysis: 'image_analysis',
  plant_photo_analysis: 'image_analysis',
  document_analysis: 'document_analysis_small',
};

export const SERVER_LIMITS = {
  maxInputCharacters: 8000,
  maxOutputTokens: 4096,
  maxImageAttachments: 2,
  maxImageSizeBytes: 4 * 1024 * 1024,
  maxDocumentSizeBytes: 10 * 1024 * 1024,
  maxConcurrentRequests: 3,
  requestsPerMinute: 10,
  requestsPerMinuteEnterprise: 30,
};

export function getPlanForCountry(_country: string | null | undefined): 'usd' { return 'usd'; }

export function formatPrice(plan: Plan, _currency: 'usd' = 'usd'): string {
  const price = plan.pricing.usd;
  if (plan.contactSales || price === null) return 'Custom pricing';
  if (price === 0) return '$0/month';
  return `$${price.toFixed(2)}/month`;
}

export function getCreditCost(requestType: string): number {
  const creditType = REQUEST_TYPE_TO_CREDIT_TYPE[requestType] || 'simple_question';
  return AI_CREDIT_COSTS[creditType];
}

export function getPlanLimits(tier: SubscriptionTier): PlanLimits { return SUBSCRIPTION_PLANS[tier]?.limits ?? SUBSCRIPTION_PLANS.free.limits; }
export function isKnownSubscriptionTier(value: string): value is SubscriptionTier { return value in SUBSCRIPTION_PLANS; }
