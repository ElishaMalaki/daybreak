'use client';

import React, { useState, useEffect } from 'react';

interface UsageSummary {
  totalRequests: number;
  totalTokens: number;
  totalCreditsThisMonth: number;
  activeUsers: number;
}

interface ProviderBreakdown {
  [provider: string]: { requests: number; tokens: number; errors: number };
}

interface TopUser {
  id: string;
  email: string;
  full_name: string;
  credits: number;
}

interface DailyUsage {
  date: string;
  requests: number;
}

interface AIUsageData {
  summary: UsageSummary;
  providerBreakdown: ProviderBreakdown;
  topUsers: TopUser[];
  dailyUsage: DailyUsage[];
}

const providerColors: Record<string, string> = {
  gemini: '#4285f4', openai: '#10b981', anthropic: '#f59e0b', perplexity: '#8b5cf6', other: '#64748b',
};

export default function AdminAIUsagePage() {
  const [data, setData] = useState<AIUsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [days, setDays] = useState(30);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/admin/ai-usage?days=${days}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch(() => setError('Failed to load AI usage data'))
      .finally(() => setLoading(false));
  }, [days]);

  const maxRequests = data ? Math.max(...data.dailyUsage.map((d) => d.requests), 1) : 1;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ color: '#0f172a', fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>AI Usage Analytics</h1>
          <p style={{ color: '#64748b', fontSize: 13.5 }}>Platform-wide AI usage across all users and providers.</p>
        </div>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          style={{ height: 36, padding: '0 10px', border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff', color: '#1e293b', fontSize: 13, fontFamily: 'inherit', outline: 'none' }}
        >
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
        </select>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 12, padding: '20px', border: '1px solid #e2e8f0', height: 90, animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
          <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
        </div>
      ) : data ? (
        <>
          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Total Requests', value: data.summary.totalRequests.toLocaleString(), color: '#6366f1' },
              { label: 'Total Tokens', value: data.summary.totalTokens.toLocaleString(), color: '#0ea5e9' },
              { label: 'Credits This Month', value: data.summary.totalCreditsThisMonth.toLocaleString(), color: '#f59e0b' },
              { label: 'Active Users', value: data.summary.activeUsers.toLocaleString(), color: '#10b981' },
            ].map((card) => (
              <div key={card.label} style={{ background: '#fff', borderRadius: 12, padding: '20px 22px', border: '1px solid #e2e8f0' }}>
                <div style={{ color: '#64748b', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{card.label}</div>
                <div style={{ color: card.color, fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em' }}>{card.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
            {/* Provider breakdown */}
            <div style={{ background: '#fff', borderRadius: 12, padding: '22px 24px', border: '1px solid #e2e8f0' }}>
              <h2 style={{ color: '#0f172a', fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Provider Breakdown</h2>
              {Object.keys(data.providerBreakdown).length === 0 ? (
                <div style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No provider data yet</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {Object.entries(data.providerBreakdown).map(([provider, stats]) => (
                    <div key={provider}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ color: '#374151', fontSize: 13, fontWeight: 600, textTransform: 'capitalize' }}>{provider}</span>
                        <span style={{ color: '#64748b', fontSize: 12 }}>{stats.requests} req</span>
                      </div>
                      <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: 3,
                          background: providerColors[provider] || '#64748b',
                          width: `${Math.min(100, (stats.requests / Math.max(...Object.values(data.providerBreakdown).map(s => s.requests), 1)) * 100)}%`,
                          transition: 'width 0.5s ease',
                        }} />
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: 11, marginTop: 2 }}>
                        {stats.tokens.toLocaleString()} tokens · {stats.errors} errors
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top users */}
            <div style={{ background: '#fff', borderRadius: 12, padding: '22px 24px', border: '1px solid #e2e8f0' }}>
              <h2 style={{ color: '#0f172a', fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Top Users by Credits</h2>
              {data.topUsers.length === 0 ? (
                <div style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No usage data yet</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {data.topUsers.map((u, i) => (
                    <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 20, color: '#94a3b8', fontSize: 12, fontWeight: 700, textAlign: 'right', flexShrink: 0 }}>{i + 1}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: '#0f172a', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {u.full_name || u.email}
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                      </div>
                      <div style={{ color: '#f59e0b', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{u.credits} cr</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Daily usage chart */}
          <div style={{ background: '#fff', borderRadius: 12, padding: '22px 24px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ color: '#0f172a', fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Daily Request Volume</h2>
            {data.dailyUsage.length === 0 ? (
              <div style={{ color: '#94a3b8', fontSize: 13, textAlign: 'center', padding: '30px 0' }}>No daily usage data yet</div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 120, overflowX: 'auto', paddingBottom: 24, position: 'relative' }}>
                {data.dailyUsage.slice(-30).map((d) => (
                  <div key={d.date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: '0 0 auto', minWidth: 20 }}>
                    <div
                      title={`${d.date}: ${d.requests} requests`}
                      style={{
                        width: 16, borderRadius: '3px 3px 0 0',
                        background: '#6366f1',
                        height: `${Math.max(4, (d.requests / maxRequests) * 100)}px`,
                        transition: 'height 0.3s ease',
                      }}
                    />
                    <div style={{ color: '#cbd5e1', fontSize: 9, transform: 'rotate(-45deg)', transformOrigin: 'top left', whiteSpace: 'nowrap', marginTop: 4 }}>
                      {d.date.slice(5)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
