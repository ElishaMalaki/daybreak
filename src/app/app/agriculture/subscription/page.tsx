'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  SUBSCRIPTION_PLANS,
  formatPrice,
  getPlanForCountry,
  type SubscriptionTier,
  type Plan,
} from '@/lib/subscription/config';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

interface UsageData {
  subscription: {
    tier: SubscriptionTier;
    status: string;
    billingPeriodStart: string;
    billingPeriodEnd: string;
    expiresAt: string | null;
  };
  usage: {
    aiCreditsUsed: number;
    aiRequestsUsed: number;
    reportsUsed: number;
    researchRequestsUsed: number;
    farmsCount: number;
  };
  limits: {
    aiCredits: number;
    aiRequests: number;
    reports: number;
    researchRequests: number;
    farms: number;
    users: number;
    apiAccess: boolean;
    documentAnalysis: boolean;
  };
}

function UsageBar({ used, limit, label }: { used: number; limit: number; label: string }) {
  const isUnlimited = limit === -1;
  const pct = isUnlimited ? 0 : Math.min(100, Math.round((used / limit) * 100));
  const isWarning = pct >= 80;
  const isCritical = pct >= 95;

  const barColor = isCritical ? '#dc2626' : isWarning ? '#d97706' : '#16a34a';

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
        <span style={{ fontSize: 12.5, fontWeight: 500, color: '#374151' }}>{label}</span>
        <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>
          {isUnlimited ? `${used} used (unlimited)` : `${used} / ${limit.toLocaleString()}`}
        </span>
      </div>
      {!isUnlimited && (
        <div style={{ height: 6, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${pct}%`,
              background: barColor,
              borderRadius: 999,
              transition: 'width 0.4s ease',
            }}
          />
        </div>
      )}
      {!isUnlimited && (
        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>
          {limit - used > 0 ? `${(limit - used).toLocaleString()} remaining` : 'Limit reached'}
        </div>
      )}
    </div>
  );
}

function PlanCard({
  plan,
  currency,
  isCurrentPlan,
  onUpgrade,
}: {
  plan: Plan;
  currency: 'tzs' | 'usd';
  isCurrentPlan: boolean;
  onUpgrade: (tier: SubscriptionTier) => void;
}) {
  const price = formatPrice(plan, currency);

  return (
    <div
      style={{
        background: '#ffffff',
        border: plan.highlighted
          ? '2px solid #16a34a'
          : isCurrentPlan
          ? '2px solid #2563eb' :'1px solid #e2e8f0',
        borderRadius: 12,
        padding: '24px 20px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {plan.highlighted && (
        <div
          style={{
            position: 'absolute',
            top: -12,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#16a34a',
            color: '#fff',
            fontSize: 11,
            fontWeight: 700,
            padding: '3px 12px',
            borderRadius: 999,
            letterSpacing: '0.04em',
            whiteSpace: 'nowrap',
          }}
        >
          MOST POPULAR
        </div>
      )}

      {isCurrentPlan && (
        <div
          style={{
            position: 'absolute',
            top: -12,
            right: 16,
            background: '#2563eb',
            color: '#fff',
            fontSize: 11,
            fontWeight: 700,
            padding: '3px 12px',
            borderRadius: 999,
            letterSpacing: '0.04em',
          }}
        >
          CURRENT PLAN
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 3 }}>
          {plan.name}
        </div>
        <div style={{ fontSize: 12, color: '#64748b' }}>{plan.tagline}</div>
      </div>

      <div style={{ marginBottom: 20 }}>
        {plan.contactSales ? (
          <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>Custom</div>
        ) : (
          <>
            <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
              {price}
            </div>
            {plan.pricing.usd !== 0 && (
              <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 3 }}>
                Billed monthly
              </div>
            )}
          </>
        )}
      </div>

      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', flex: 1 }}>
        {plan.features.map((feature, i) => (
          <li
            key={i}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 8,
              marginBottom: 7,
              fontSize: 12.5,
              color: '#374151',
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#16a34a"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ flexShrink: 0, marginTop: 1 }}
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            {feature}
          </li>
        ))}
      </ul>

      {plan.contactSales ? (
        <a
          href="mailto:enterprise@earthai.com"
          style={{
            display: 'block',
            textAlign: 'center',
            padding: '9px 16px',
            borderRadius: 8,
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            color: '#374151',
            fontSize: 13,
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'background 0.12s',
          }}
        >
          Contact Earth AI
        </a>
      ) : isCurrentPlan ? (
        <div
          style={{
            textAlign: 'center',
            padding: '9px 16px',
            borderRadius: 8,
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            color: '#2563eb',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          Current Plan
        </div>
      ) : (
        <button
          onClick={() => onUpgrade(plan.id)}
          style={{
            display: 'block',
            width: '100%',
            padding: '9px 16px',
            borderRadius: 8,
            background: plan.highlighted ? '#16a34a' : '#f8fafc',
            border: plan.highlighted ? 'none' : '1px solid #e2e8f0',
            color: plan.highlighted ? '#fff' : '#374151',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.12s',
          }}
        >
          {plan.pricing.usd === 0 ? 'Downgrade to Free' : 'Upgrade'}
        </button>
      )}
    </div>
  );
}

export default function SubscriptionPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currency, setCurrency] = useState<'tzs' | 'usd'>('usd');

  useEffect(() => {
    if (!user) return;
    loadUsageData();
    loadUserCountry();
  }, [user]);

  const loadUsageData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/subscription/usage');
      if (!res.ok) throw new Error('Failed to load usage data');
      const data = await res.json();
      setUsageData(data);
    } catch (e: any) {
      setError(e.message || 'Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const loadUserCountry = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('user_profiles')
      .select('country')
      .eq('id', user.id)
      .single();
    if (data?.country) {
      setCurrency(getPlanForCountry(data.country));
    }
  };

  const handleUpgrade = (tier: SubscriptionTier) => {
    // Payment provider integration point — not yet connected
    alert(
      `To upgrade to the ${SUBSCRIPTION_PLANS[tier].name} plan, please contact Earth AI support or wait for payment integration to be enabled.`
    );
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const currentTier = (usageData?.subscription.tier as SubscriptionTier) || 'free';
  const planOrder: SubscriptionTier[] = ['free', 'starter', 'professional', 'business', 'enterprise'];

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Page header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Link
              href="/app/agriculture"
              style={{ color: '#94a3b8', fontSize: 12.5, textDecoration: 'none', fontWeight: 500 }}
            >
              Dashboard
            </Link>
            <span style={{ color: '#cbd5e1', fontSize: 12 }}>/</span>
            <span style={{ color: '#374151', fontSize: 12.5, fontWeight: 500 }}>Subscription</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>
            Subscription &amp; Usage
          </h1>
          <p style={{ color: '#64748b', fontSize: 13.5, marginTop: 4 }}>
            Manage your Intelligence E Agriculture plan and monitor AI usage.
          </p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0' }}>
            <div style={{ width: 24, height: 24, border: '2px solid #e2e8f0', borderTopColor: '#16a34a', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          </div>
        ) : error ? (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '16px 20px', color: '#dc2626', fontSize: 13 }}>
            {error}
          </div>
        ) : usageData ? (
          <>
            {/* Current plan + usage summary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
              {/* Current plan card */}
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '20px 22px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
                  Current Plan
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10,
                    background: currentTier === 'free' ? '#f0fdf4' : currentTier === 'enterprise' ? '#1e293b' : '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                      <path d="M2 17l10 5 10-5"/>
                      <path d="M2 12l10 5 10-5"/>
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
                      {SUBSCRIPTION_PLANS[currentTier]?.name || 'Free'}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>
                      {usageData.subscription.status === 'active' ? 'Active' : usageData.subscription.status}
                    </div>
                  </div>
                </div>
                <div style={{ fontSize: 12.5, color: '#64748b', lineHeight: 1.6 }}>
                  <div>Billing period: {formatDate(usageData.subscription.billingPeriodStart)} — {formatDate(usageData.subscription.billingPeriodEnd)}</div>
                  {usageData.subscription.expiresAt && (
                    <div>Expires: {formatDate(usageData.subscription.expiresAt)}</div>
                  )}
                  <div style={{ marginTop: 6 }}>
                    <span style={{ color: '#94a3b8' }}>Usage resets: </span>
                    {formatDate(usageData.subscription.billingPeriodEnd)}
                  </div>
                </div>
              </div>

              {/* AI Credits usage */}
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '20px 22px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>
                  AI Usage This Month
                </div>
                <UsageBar
                  used={usageData.usage.aiCreditsUsed}
                  limit={usageData.limits.aiCredits}
                  label="AI Credits"
                />
                <UsageBar
                  used={usageData.usage.aiRequestsUsed}
                  limit={usageData.limits.aiRequests}
                  label="AI Requests"
                />
                <UsageBar
                  used={usageData.usage.reportsUsed}
                  limit={usageData.limits.reports}
                  label="Reports"
                />
                <UsageBar
                  used={usageData.usage.researchRequestsUsed}
                  limit={usageData.limits.researchRequests}
                  label="Research Requests"
                />
                <UsageBar
                  used={usageData.usage.farmsCount}
                  limit={usageData.limits.farms}
                  label="Farms"
                />
              </div>
            </div>

            {/* Currency toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Available Plans
              </h2>
              <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', borderRadius: 8, padding: 3 }}>
                {(['usd', 'tzs'] as const).map((c) => (
                  <button
                    key={c}
                    onClick={() => setCurrency(c)}
                    style={{
                      padding: '5px 14px',
                      borderRadius: 6,
                      border: 'none',
                      background: currency === c ? '#fff' : 'transparent',
                      color: currency === c ? '#0f172a' : '#64748b',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      boxShadow: currency === c ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                      transition: 'all 0.12s',
                    }}
                  >
                    {c.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Plan cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 32 }}>
              {planOrder.map((tier) => (
                <PlanCard
                  key={tier}
                  plan={SUBSCRIPTION_PLANS[tier]}
                  currency={currency}
                  isCurrentPlan={currentTier === tier}
                  onUpgrade={handleUpgrade}
                />
              ))}
            </div>

            {/* Payment notice */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 10,
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <div style={{ fontSize: 12.5, color: '#64748b', lineHeight: 1.55 }}>
                <strong style={{ color: '#374151' }}>Payment integration coming soon.</strong>{' '}
                Plan upgrades will be available once the payment provider is connected. Your current plan limits are enforced server-side. Contact Earth AI for early access to paid plans.
              </div>
            </div>
          </>
        ) : null}
      </div>
    </>
  );
}
