'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface Stats {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  totalFarms: number;
  reportsThisMonth: number;
  totalCreditsThisMonth: number;
  subscriptionBreakdown: Record<string, number>;
}

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 12, padding: '20px 22px',
      border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      <div style={{ color: '#64748b', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{label}</div>
      <div style={{ color: color || '#0f172a', fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 6 }}>{sub}</div>}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setStats(data);
      })
      .catch(() => setError('Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

  const tierColors: Record<string, string> = {
    free: '#64748b', starter: '#0ea5e9', professional: '#8b5cf6', business: '#f59e0b', enterprise: '#10b981',
  };

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ color: '#0f172a', fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>Platform Overview</h1>
        <p style={{ color: '#64748b', fontSize: 13.5 }}>Real-time statistics for the Earth AI platform.</p>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', color: '#dc2626', fontSize: 13, marginBottom: 20 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 12, padding: '20px 22px', border: '1px solid #e2e8f0', height: 90, animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
          <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
        </div>
      ) : stats ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
            <StatCard label="Total Users" value={stats.totalUsers} sub="All registered accounts" />
            <StatCard label="Active Users" value={stats.activeUsers} sub="Last 30 days" color="#16a34a" />
            <StatCard label="New This Month" value={stats.newUsersThisMonth} sub="New registrations" color="#6366f1" />
            <StatCard label="Total Farms" value={stats.totalFarms} sub="Active farms" />
            <StatCard label="Reports This Month" value={stats.reportsThisMonth} sub="Generated reports" />
            <StatCard label="AI Credits Used" value={stats.totalCreditsThisMonth.toLocaleString()} sub="This billing period" color="#f59e0b" />
          </div>

          {/* Subscription Breakdown */}
          <div style={{ background: '#fff', borderRadius: 12, padding: '22px 24px', border: '1px solid #e2e8f0', marginBottom: 24 }}>
            <h2 style={{ color: '#0f172a', fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Subscription Breakdown</h2>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {Object.entries(stats.subscriptionBreakdown).map(([tier, count]) => (
                <div key={tier} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
                  background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0',
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: tierColors[tier] || '#94a3b8' }} />
                  <span style={{ color: '#374151', fontSize: 13, fontWeight: 600, textTransform: 'capitalize' }}>{tier}</span>
                  <span style={{ color: '#64748b', fontSize: 13 }}>{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ background: '#fff', borderRadius: 12, padding: '22px 24px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ color: '#0f172a', fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Quick Actions</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
              {[
                { label: 'Manage Users', href: '/admin/users', desc: 'View, edit, and manage all user accounts' },
                { label: 'Feature Flags', href: '/admin/features', desc: 'Toggle platform features on or off' },
                { label: 'AI Usage', href: '/admin/ai-usage', desc: 'Monitor AI usage across all users' },
                { label: 'AI Providers', href: '/admin/ai-providers', desc: 'Configure AI provider settings' },
                { label: 'Subscriptions', href: '/admin/subscriptions', desc: 'View and manage user subscriptions' },
              ].map((action) => (
                <Link key={action.href} href={action.href} style={{
                  display: 'block', padding: '14px 16px', background: '#f8fafc',
                  borderRadius: 10, border: '1px solid #e2e8f0', textDecoration: 'none',
                  transition: 'all 0.12s',
                }}>
                  <div style={{ color: '#0f172a', fontSize: 13.5, fontWeight: 700, marginBottom: 4 }}>{action.label}</div>
                  <div style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.4 }}>{action.desc}</div>
                </Link>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
