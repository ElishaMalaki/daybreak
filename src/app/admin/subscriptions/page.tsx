'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface Subscription {
  id: string;
  user_id: string;
  tier: string;
  status: string;
  started_at: string;
  expires_at: string | null;
  billing_provider: string | null;
  created_at: string;
  user_profiles: {
    email: string;
    full_name: string;
  } | null;
}

const TIERS = ['free', 'starter', 'professional', 'business', 'enterprise'];
const tierColors: Record<string, string> = {
  free: '#64748b', starter: '#0ea5e9', professional: '#8b5cf6', business: '#f59e0b', enterprise: '#10b981',
};

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState<string | null>(null);
  const [filterTier, setFilterTier] = useState('');

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (filterTier) params.set('tier', filterTier);
      const r = await fetch(`/api/admin/subscriptions?${params}`);
      const data = await r.json();
      if (data.error) setError(data.error);
      else { setSubscriptions(data.subscriptions || []); setTotal(data.total || 0); }
    } catch {
      setError('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  }, [page, filterTier]);

  useEffect(() => { fetchSubscriptions(); }, [fetchSubscriptions]);

  const updateTier = async (userId: string, tier: string) => {
    setSaving(userId);
    try {
      const r = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, subscription_tier: tier }),
      });
      const data = await r.json();
      if (data.error) setError(data.error);
      else fetchSubscriptions();
    } catch {
      setError('Failed to update subscription');
    } finally {
      setSaving(null);
    }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: '#0f172a', fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>Subscription Management</h1>
        <p style={{ color: '#64748b', fontSize: 13.5 }}>View and manage all user subscriptions across the platform.</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <select
          value={filterTier}
          onChange={(e) => { setFilterTier(e.target.value); setPage(1); }}
          style={{ height: 36, padding: '0 10px', border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff', color: '#1e293b', fontSize: 13, fontFamily: 'inherit', outline: 'none' }}
        >
          <option value="">All tiers</option>
          {TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <div style={{ color: '#64748b', fontSize: 13 }}>{total} subscriptions</div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}

      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['User', 'Current Tier', 'Status', 'Started', 'Expires', 'Change Tier'].map((h) => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    {[...Array(6)].map((__, j) => (
                      <td key={j} style={{ padding: '12px 16px' }}>
                        <div style={{ height: 14, background: '#f1f5f9', borderRadius: 4, animation: 'pulse 1.5s ease-in-out infinite' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '32px 16px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>No subscriptions found</td>
                </tr>
              ) : subscriptions.map((sub) => (
                <tr key={sub.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ color: '#0f172a', fontWeight: 600, fontSize: 13 }}>{sub.user_profiles?.full_name || '—'}</div>
                    <div style={{ color: '#94a3b8', fontSize: 11.5 }}>{sub.user_profiles?.email || sub.user_id}</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      display: 'inline-block', padding: '2px 8px', borderRadius: 5,
                      background: (tierColors[sub.tier] || '#64748b') + '18',
                      color: tierColors[sub.tier] || '#64748b',
                      fontSize: 11.5, fontWeight: 700, textTransform: 'capitalize',
                    }}>{sub.tier}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      display: 'inline-block', padding: '2px 8px', borderRadius: 5,
                      background: sub.status === 'active' ? '#f0fdf4' : '#fef2f2',
                      color: sub.status === 'active' ? '#16a34a' : '#dc2626',
                      fontSize: 11.5, fontWeight: 600, textTransform: 'capitalize',
                    }}>{sub.status}</span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#64748b', fontSize: 12 }}>
                    {new Date(sub.started_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px 16px', color: '#64748b', fontSize: 12 }}>
                    {sub.expires_at ? new Date(sub.expires_at).toLocaleDateString() : 'No expiry'}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <select
                      value={sub.tier}
                      onChange={(e) => updateTier(sub.user_id, e.target.value)}
                      disabled={saving === sub.user_id}
                      style={{
                        height: 30, padding: '0 8px', border: '1px solid #e2e8f0', borderRadius: 6,
                        background: '#fff', color: '#1e293b', fontSize: 12, fontFamily: 'inherit', outline: 'none',
                        cursor: saving === sub.user_id ? 'not-allowed' : 'pointer',
                        opacity: saving === sub.user_id ? 0.6 : 1,
                      }}
                    >
                      {TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ color: '#64748b', fontSize: 12 }}>Page {page} of {totalPages}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', color: '#374151', fontSize: 12, cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1, fontFamily: 'inherit' }}>
                Previous
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', color: '#374151', fontSize: 12, cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1, fontFamily: 'inherit' }}>
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );
}
