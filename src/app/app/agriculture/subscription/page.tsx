'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  SUBSCRIPTION_PLANS,
  formatPrice,
  type SubscriptionTier,
  type Plan,
} from '@/lib/subscription/config';
import { useAuth } from '@/contexts/AuthContext';

interface InvoiceRow {
  id: string;
  invoice_number: string | null;
  status: string;
  currency: string;
  amount_due_cents: number;
  amount_paid_cents: number;
  hosted_invoice_url: string | null;
  invoice_pdf_url: string | null;
  period_start: string | null;
  period_end: string | null;
  due_at: string | null;
  paid_at: string | null;
  created_at: string;
}

interface HistoryRow {
  id: string;
  previous_tier: SubscriptionTier | null;
  new_tier: SubscriptionTier;
  previous_status: string | null;
  new_status: string;
  change_reason: string | null;
  created_at: string;
}

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
    imageAnalysis: boolean;
  };
  invoices: InvoiceRow[];
  history: HistoryRow[];
}

function UsageBar({ used, limit, label }: { used: number; limit: number; label: string }) {
  const isUnlimited = limit === -1;
  const pct = isUnlimited ? 0 : Math.min(100, Math.round((used / Math.max(limit, 1)) * 100));
  const barColor = pct >= 95 ? '#dc2626' : pct >= 80 ? '#d97706' : '#16a34a';

  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5, gap: 12 }}>
        <span style={{ fontSize: 12.5, fontWeight: 500, color: '#374151' }}>{label}</span>
        <span style={{ fontSize: 12, color: '#6b7280', fontWeight: 500 }}>
          {isUnlimited ? `${used} used (custom)` : `${used.toLocaleString()} / ${limit.toLocaleString()}`}
        </span>
      </div>
      {!isUnlimited && (
        <>
          <div style={{ height: 6, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: 999 }} />
          </div>
          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>
            {limit - used > 0 ? `${(limit - used).toLocaleString()} remaining` : 'Limit reached'}
          </div>
        </>
      )}
    </div>
  );
}

function PlanCard({ plan, isCurrentPlan, onUpgrade }: { plan: Plan; isCurrentPlan: boolean; onUpgrade: (tier: SubscriptionTier) => void }) {
  return (
    <div
      style={{
        background: '#ffffff',
        border: plan.highlighted ? '2px solid #111827' : isCurrentPlan ? '2px solid #2563eb' : '1px solid #e2e8f0',
        borderRadius: 10,
        padding: '22px 18px',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 520,
      }}
    >
      {plan.highlighted && (
        <div style={{ position: 'absolute', top: -12, left: 18, background: '#111827', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, letterSpacing: '0.04em' }}>
          MOST POPULAR
        </div>
      )}
      {isCurrentPlan && (
        <div style={{ position: 'absolute', top: -12, right: 14, background: '#2563eb', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, letterSpacing: '0.04em' }}>
          CURRENT
        </div>
      )}

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 5 }}>{plan.name}</div>
        <div style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.45 }}>{plan.audience}</div>
      </div>

      <div style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 18, lineHeight: 1 }}>
        {formatPrice(plan)}
      </div>

      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 18px', flex: 1 }}>
        {plan.features.map((feature) => (
          <li key={feature} style={{ display: 'flex', gap: 8, marginBottom: 7, fontSize: 12.5, color: '#374151', lineHeight: 1.35 }}>
            <span aria-hidden="true" style={{ width: 5, height: 5, borderRadius: 999, background: '#94a3b8', flexShrink: 0, marginTop: 7 }} />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {plan.contactSales ? (
        <a href="mailto:enterprise@earthai.com" style={{ textAlign: 'center', padding: '9px 14px', borderRadius: 8, border: '1px solid #d1d5db', color: '#111827', fontSize: 13, fontWeight: 600, textDecoration: 'none' }}>
          Contact Earth AI
        </a>
      ) : isCurrentPlan ? (
        <div style={{ textAlign: 'center', padding: '9px 14px', borderRadius: 8, background: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', fontSize: 13, fontWeight: 600 }}>
          Current Plan
        </div>
      ) : (
        <button onClick={() => onUpgrade(plan.id)} style={{ width: '100%', padding: '9px 14px', borderRadius: 8, background: '#111827', border: '1px solid #111827', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          {plan.pricing.usd === 0 ? 'Move to Free' : 'Upgrade'}
        </button>
      )}
    </div>
  );
}

function formatDate(iso: string | null) {
  if (!iso) return 'Not available';
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(cents / 100);
}

export default function SubscriptionPage() {
  const { user } = useAuth();
  const [usageData, setUsageData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;

    const loadUsageData = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('/api/subscription/usage');
        if (!res.ok) throw new Error('Failed to load usage data');
        setUsageData(await res.json());
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load subscription data');
      } finally {
        setLoading(false);
      }
    };

    void loadUsageData();
  }, [user]);

  const handleUpgrade = (tier: SubscriptionTier) => {
    alert(`To upgrade to ${SUBSCRIPTION_PLANS[tier].name}, contact Earth AI support while payment processing is being connected.`);
  };

  const currentTier = usageData?.subscription.tier || 'free';
  const planOrder: SubscriptionTier[] = ['free', 'starter', 'professional', 'business', 'enterprise'];

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <Link href="/app/agriculture" style={{ color: '#94a3b8', fontSize: 12.5, textDecoration: 'none', fontWeight: 500 }}>Dashboard</Link>
          <span style={{ color: '#cbd5e1', fontSize: 12 }}>/</span>
          <span style={{ color: '#374151', fontSize: 12.5, fontWeight: 500 }}>Subscription</span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em', margin: 0 }}>Usage &amp; Billing</h1>
        <p style={{ color: '#64748b', fontSize: 13.5, marginTop: 4 }}>Manage Intelligence E Agriculture access, AI usage, invoices, and subscription history.</p>
      </div>

      {loading ? (
        <div style={{ padding: '52px 0', color: '#64748b', fontSize: 13 }}>Loading billing information...</div>
      ) : error ? (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '16px 20px', color: '#dc2626', fontSize: 13 }}>{error}</div>
      ) : usageData ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 0.85fr) minmax(0, 1.15fr)', gap: 16, marginBottom: 28 }}>
            <section style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '20px 22px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>Current Plan</div>
              <div style={{ fontSize: 20, fontWeight: 750, color: '#0f172a', marginBottom: 4 }}>{SUBSCRIPTION_PLANS[currentTier]?.name || 'Free'}</div>
              <div style={{ fontSize: 13, color: '#64748b', marginBottom: 16 }}>{SUBSCRIPTION_PLANS[currentTier]?.audience}</div>
              <div style={{ fontSize: 12.5, color: '#64748b', lineHeight: 1.7 }}>
                <div>Status: <span style={{ color: '#111827', fontWeight: 600 }}>{usageData.subscription.status}</span></div>
                <div>Billing period: {formatDate(usageData.subscription.billingPeriodStart)} to {formatDate(usageData.subscription.billingPeriodEnd)}</div>
                <div>Usage resets: {formatDate(usageData.subscription.billingPeriodEnd)}</div>
                {usageData.subscription.expiresAt && <div>Expires: {formatDate(usageData.subscription.expiresAt)}</div>}
              </div>
            </section>

            <section style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: '20px 22px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>AI Usage This Month</div>
              <UsageBar used={usageData.usage.aiCreditsUsed} limit={usageData.limits.aiCredits} label="AI Credits" />
              <UsageBar used={usageData.usage.aiRequestsUsed} limit={usageData.limits.aiRequests} label="AI Requests" />
              <UsageBar used={usageData.usage.reportsUsed} limit={usageData.limits.reports} label="Reports" />
              <UsageBar used={usageData.usage.researchRequestsUsed} limit={usageData.limits.researchRequests} label="Research Requests" />
              <UsageBar used={usageData.usage.farmsCount} limit={usageData.limits.farms} label="Farms" />
            </section>
          </div>

          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: '0 0 14px' }}>Subscription Tiers</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 14, marginBottom: 28 }}>
            {planOrder.map((tier) => (
              <PlanCard key={tier} plan={SUBSCRIPTION_PLANS[tier]} isCurrentPlan={currentTier === tier} onUpgrade={handleUpgrade} />
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: 16, marginBottom: 28 }}>
            <section style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ padding: '16px 18px', borderBottom: '1px solid #e2e8f0' }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>Invoices</h2>
              </div>
              {usageData.invoices.length === 0 ? (
                <div style={{ padding: 18, color: '#64748b', fontSize: 13 }}>No invoices are available yet.</div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
                    <tbody>
                      {usageData.invoices.map((invoice) => (
                        <tr key={invoice.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 18px', color: '#111827', fontWeight: 600 }}>{invoice.invoice_number || 'Invoice'}</td>
                          <td style={{ padding: '12px 18px', color: '#64748b' }}>{invoice.status}</td>
                          <td style={{ padding: '12px 18px', color: '#111827' }}>{formatMoney(invoice.amount_due_cents, invoice.currency)}</td>
                          <td style={{ padding: '12px 18px', textAlign: 'right' }}>
                            {(invoice.hosted_invoice_url || invoice.invoice_pdf_url) && (
                              <a href={invoice.hosted_invoice_url || invoice.invoice_pdf_url || '#'} target="_blank" rel="noreferrer" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>View</a>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ padding: '16px 18px', borderBottom: '1px solid #e2e8f0' }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>Subscription History</h2>
              </div>
              {usageData.history.length === 0 ? (
                <div style={{ padding: 18, color: '#64748b', fontSize: 13 }}>No subscription changes have been recorded yet.</div>
              ) : (
                <div>
                  {usageData.history.map((item) => (
                    <div key={item.id} style={{ padding: '13px 18px', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ color: '#111827', fontSize: 13, fontWeight: 650 }}>{item.previous_tier || 'none'} to {item.new_tier}</div>
                      <div style={{ color: '#64748b', fontSize: 12, marginTop: 3 }}>{formatDate(item.created_at)} · {item.new_status}</div>
                      {item.change_reason && <div style={{ color: '#64748b', fontSize: 12, marginTop: 3 }}>{item.change_reason}</div>}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </>
      ) : null}
    </div>
  );
}
