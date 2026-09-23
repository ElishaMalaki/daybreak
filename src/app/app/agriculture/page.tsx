'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { SUBSCRIPTION_PLANS, type SubscriptionTier } from '@/lib/subscription/config';

interface DashboardStats {
  conversations: number;
  farms: number;
  reports: number;
  analyses: number;
}

interface RecentConversation {
  id: string;
  title: string;
  analysis_type: string;
  message_count: number;
  updated_at: string;
}

interface UsageSummary {
  tier: SubscriptionTier;
  aiCreditsUsed: number;
  aiCreditsLimit: number;
  aiRequestsUsed: number;
  aiRequestsLimit: number;
  reportsUsed: number;
  reportsLimit: number;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

const quickActions = [
  {
    label: 'Ask Intelligence E',
    description: 'Get AI-powered insights and analysis',
    href: '/app/agriculture/intelligence',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
      </svg>
    ),
    color: '#16a34a',
    bg: '#f0fdf4',
    border: '#bbf7d0',
  },
  {
    label: 'Analyze Farm Data',
    description: 'Turn your farm data into valuable insights',
    href: '/app/agriculture/data',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3"/>
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
      </svg>
    ),
    color: '#2563eb',
    bg: '#eff6ff',
    border: '#bfdbfe',
  },
  {
    label: 'Research Agriculture',
    description: 'Explore research and best practices',
    href: '/app/agriculture/research',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
    color: '#7c3aed',
    bg: '#f5f3ff',
    border: '#ddd6fe',
  },
  {
    label: 'Generate Report',
    description: 'Create professional agricultural reports',
    href: '/app/agriculture/reports',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
    color: '#d97706',
    bg: '#fffbeb',
    border: '#fde68a',
  },
  {
    label: 'Import Data',
    description: 'Upload and integrate your data',
    href: '/app/agriculture/data',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 16 12 12 8 16"/>
        <line x1="12" y1="12" x2="12" y2="21"/>
        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
      </svg>
    ),
    color: '#0891b2',
    bg: '#ecfeff',
    border: '#a5f3fc',
  },
];

const capabilities = [
  {
    title: 'Market Analysis',
    desc: 'Understand market trends, prices and opportunities',
    href: '/app/agriculture/intelligence?type=market_analysis',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
      </svg>
    ),
    color: '#16a34a',
    bg: '#f0fdf4',
  },
  {
    title: 'Farm Intelligence',
    desc: 'Analyze your farm data and performance',
    href: '/app/agriculture/data',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3"/>
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
      </svg>
    ),
    color: '#2563eb',
    bg: '#eff6ff',
  },
  {
    title: 'Decision Support',
    desc: 'Get recommendations for better outcomes',
    href: '/app/agriculture/intelligence?type=decision_support',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
    color: '#16a34a',
    bg: '#f0fdf4',
  },
  {
    title: 'Risk Intelligence',
    desc: 'Identify and manage agricultural risks',
    href: '/app/agriculture/intelligence?type=risk_assessment',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
    color: '#7c3aed',
    bg: '#f5f3ff',
  },
  {
    title: 'Research Assistant',
    desc: 'Access the latest research and insights',
    href: '/app/agriculture/research',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
    color: '#0891b2',
    bg: '#ecfeff',
  },
];

export default function AgricultureDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({ conversations: 0, farms: 0, reports: 0, analyses: 0 });
  const [recentConversations, setRecentConversations] = useState<RecentConversation[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [greeting, setGreeting] = useState('Good morning');
  const [usageSummary, setUsageSummary] = useState<UsageSummary | null>(null);

  const userName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there';

  useEffect(() => {
    setGreeting(getGreeting());
  }, []);

  useEffect(() => {
    if (!user) return;
    const fetchDashboardData = async () => {
      const supabase = createClient();
      try {
        const [convResult, farmResult, reportResult, analysisResult, recentConvResult] = await Promise.all([
          supabase.from('conversations').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('farms').select('id', { count: 'exact', head: true }).eq('owner_id', user.id),
          supabase.from('reports').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('analyses').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('conversations').select('id, title, analysis_type, message_count, updated_at').eq('user_id', user.id).order('updated_at', { ascending: false }).limit(5),
        ]);
        setStats({
          conversations: convResult.count || 0,
          farms: farmResult.count || 0,
          reports: reportResult.count || 0,
          analyses: analysisResult.count || 0,
        });
        setRecentConversations(recentConvResult.data || []);
      } catch {
        // Non-critical
      } finally {
        setLoadingStats(false);
      }
    };
    fetchDashboardData();

    // Load real usage data from server
    fetch('/api/subscription/usage')
      .then((r) => r.json())
      .then((data) => {
        if (data.subscription && data.usage && data.limits) {
          setUsageSummary({
            tier: data.subscription.tier as SubscriptionTier,
            aiCreditsUsed: data.usage.aiCreditsUsed,
            aiCreditsLimit: data.limits.aiCredits,
            aiRequestsUsed: data.usage.aiRequestsUsed,
            aiRequestsLimit: data.limits.aiRequests,
            reportsUsed: data.usage.reportsUsed,
            reportsLimit: data.limits.reports,
          });
        }
      })
      .catch(() => {});
  }, [user]);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>
        {/* Left / main column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Welcome hero card */}
          <div style={{
            borderRadius: 14, overflow: 'hidden', position: 'relative',
            background: 'linear-gradient(135deg, #dbeafe 0%, #e0f2fe 40%, #dcfce7 100%)',
            border: '1px solid #bfdbfe', padding: '28px 28px 24px',
            minHeight: 160,
          }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ color: '#16a34a', fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 8 }}>
                Intelligence E for Agriculture
              </div>
              <h1 style={{ color: '#0f172a', fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 8, lineHeight: 1.15 }}>
                {greeting}, {userName}
              </h1>
              <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.55, maxWidth: 480 }}>
                Your <span style={{ color: '#16a34a', fontWeight: 600 }}>agricultural intelligence platform</span> is ready.{' '}
                What would you like to explore today?
              </p>
            </div>
            {/* Decorative circle */}
            <div style={{
              position: 'absolute', right: 24, top: '50%', transform: 'translateY(-50%)',
              width: 90, height: 90, borderRadius: '50%',
              background: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/>
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{
            background: '#ffffff', border: '1px solid #e8edf2', borderRadius: 14,
            padding: '20px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ color: '#0f172a', fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em' }}>Quick Actions</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
              {quickActions.map((action) => (
                <Link key={action.label} href={action.href} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
                  padding: '16px 10px 14px',
                  background: action.bg, border: `1px solid ${action.border}`,
                  borderRadius: 12, textDecoration: 'none', transition: 'transform 0.12s, box-shadow 0.12s',
                  textAlign: 'center',
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    background: '#fff', border: `1px solid ${action.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: action.color,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                  }}>
                    {action.icon}
                  </div>
                  <div>
                    <div style={{ color: '#0f172a', fontSize: 12, fontWeight: 700, marginBottom: 3, letterSpacing: '-0.01em', lineHeight: 1.3 }}>{action.label}</div>
                    <div style={{ color: '#64748b', fontSize: 10.5, lineHeight: 1.4 }}>{action.description}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Intelligence E Capabilities */}
          <div style={{
            background: '#ffffff', border: '1px solid #e8edf2', borderRadius: 14,
            padding: '20px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ color: '#0f172a', fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 3 }}>
                Intelligence <span style={{ color: '#16a34a' }}>E</span> Capabilities
              </h2>
              <p style={{ color: '#64748b', fontSize: 12.5 }}>Powerful AI tools for smarter agricultural decisions</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
              {capabilities.map((cap) => (
                <Link key={cap.title} href={cap.href} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9,
                  padding: '16px 10px 14px',
                  background: cap.bg, border: '1px solid #e8edf2',
                  borderRadius: 12, textDecoration: 'none', transition: 'transform 0.12s',
                  textAlign: 'center',
                }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: '#fff', border: '1px solid #e2e8f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: cap.color,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  }}>
                    {cap.icon}
                  </div>
                  <div>
                    <div style={{ color: '#0f172a', fontSize: 12, fontWeight: 700, marginBottom: 3, lineHeight: 1.3 }}>{cap.title}</div>
                    <div style={{ color: '#64748b', fontSize: 10.5, lineHeight: 1.4 }}>{cap.desc}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Conversations */}
          <div style={{
            background: '#ffffff', border: '1px solid #e8edf2', borderRadius: 14,
            padding: '20px 22px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ color: '#0f172a', fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em' }}>Recent Conversations</h2>
              <Link href="/app/agriculture/intelligence" style={{ color: '#16a34a', fontSize: 12.5, fontWeight: 600, textDecoration: 'none' }}>
                View all
              </Link>
            </div>

            {loadingStats ? (
              <div style={{ padding: '20px 0', textAlign: 'center', color: '#94a3b8', fontSize: 12.5 }}>Loading...</div>
            ) : recentConversations.length === 0 ? (
              <div style={{
                border: '1.5px dashed #e2e8f0', borderRadius: 12,
                padding: '36px 20px', textAlign: 'center',
              }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <div style={{ color: '#374151', fontSize: 14, fontWeight: 600, marginBottom: 5 }}>No conversations yet</div>
                <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 18, lineHeight: 1.5 }}>
                  Start a conversation with Intelligence E to get agricultural insights and analysis.
                </div>
                <Link href="/app/agriculture/intelligence" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 20px',
                  background: '#16a34a', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(22,163,74,0.25)',
                }}>
                  Start a Conversation
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {recentConversations.map((conv) => (
                  <Link key={conv.id} href={`/app/agriculture/intelligence?conv=${conv.id}`} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
                    background: '#f8fafc', border: '1px solid #e8edf2',
                    borderRadius: 10, textDecoration: 'none', transition: 'background 0.12s',
                  }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: '#1e293b', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>
                        {conv.title}
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: 11.5, marginTop: 1 }}>
                        {conv.message_count || 0} messages · {conv.analysis_type?.replace(/_/g, ' ') || 'general'}
                      </div>
                    </div>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Quick Stats */}
          <div style={{
            background: '#ffffff', border: '1px solid #e8edf2', borderRadius: 14,
            padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <h3 style={{ color: '#0f172a', fontSize: 14, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 14 }}>Quick Stats</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { label: 'Farms', value: stats.farms, icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>, color: '#16a34a' },
                { label: 'Conversations', value: stats.conversations, icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, color: '#16a34a' },
                { label: 'Reports', value: stats.reports, icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>, color: '#7c3aed' },
                { label: 'Analyses', value: stats.analyses, icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>, color: '#2563eb' },
              ].map((stat, i, arr) => (
                <div key={stat.label} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 0',
                  borderBottom: i < arr.length - 1 ? '1px solid #f1f5f9' : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <div style={{ color: stat.color }}>{stat.icon}</div>
                    <span style={{ color: '#374151', fontSize: 13, fontWeight: 500 }}>{stat.label}</span>
                  </div>
                  <span style={{ color: loadingStats ? '#cbd5e1' : '#0f172a', fontSize: 14, fontWeight: 700 }}>
                    {loadingStats ? '—' : stat.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Usage — real data from server */}
          <div style={{
            background: '#ffffff', border: '1px solid #e8edf2', borderRadius: 14,
            padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ color: '#0f172a', fontSize: 14, fontWeight: 700, letterSpacing: '-0.02em' }}>AI Usage</h3>
              <Link href="/app/agriculture/subscription" style={{ color: '#16a34a', fontSize: 11.5, fontWeight: 600, textDecoration: 'none' }}>
                View plan
              </Link>
            </div>

            {usageSummary ? (
              <>
                {/* Plan badge */}
                <div style={{ marginBottom: 12 }}>
                  <span style={{
                    display: 'inline-block', padding: '2px 10px', borderRadius: 999,
                    background: '#f0fdf4', border: '1px solid #bbf7d0',
                    color: '#16a34a', fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}>
                    {SUBSCRIPTION_PLANS[usageSummary.tier]?.name || 'Free'} Plan
                  </span>
                </div>

                {/* AI Credits */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ color: '#374151', fontSize: 12.5, fontWeight: 500 }}>AI Credits</span>
                    <span style={{ color: '#6b7280', fontSize: 12, fontWeight: 500 }}>
                      {usageSummary.aiCreditsUsed} / {usageSummary.aiCreditsLimit === -1 ? 'Unlimited' : usageSummary.aiCreditsLimit}
                    </span>
                  </div>
                  {usageSummary.aiCreditsLimit !== -1 && (
                    <div style={{ height: 5, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 999,
                        background: usageSummary.aiCreditsUsed / usageSummary.aiCreditsLimit >= 0.9 ? '#dc2626' :
                                    usageSummary.aiCreditsUsed / usageSummary.aiCreditsLimit >= 0.75 ? '#d97706' : '#16a34a',
                        width: `${Math.min(100, Math.round((usageSummary.aiCreditsUsed / usageSummary.aiCreditsLimit) * 100))}%`,
                        transition: 'width 0.4s ease',
                      }} />
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3 }}>
                    {usageSummary.aiCreditsLimit === -1
                      ? 'Unlimited credits'
                      : `${Math.max(0, usageSummary.aiCreditsLimit - usageSummary.aiCreditsUsed)} remaining`}
                  </div>
                </div>

                {/* Reports */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ color: '#374151', fontSize: 12.5, fontWeight: 500 }}>Reports</span>
                    <span style={{ color: '#6b7280', fontSize: 12, fontWeight: 500 }}>
                      {usageSummary.reportsUsed} / {usageSummary.reportsLimit === -1 ? 'Unlimited' : usageSummary.reportsLimit}
                    </span>
                  </div>
                  {usageSummary.reportsLimit !== -1 && (
                    <div style={{ height: 5, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: 999, background: '#7c3aed',
                        width: `${Math.min(100, Math.round((usageSummary.reportsUsed / usageSummary.reportsLimit) * 100))}%`,
                        transition: 'width 0.4s ease',
                      }} />
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#94a3b8', fontSize: 11 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  Resets at start of next billing period
                </div>
              </>
            ) : (
              <div style={{ color: '#94a3b8', fontSize: 12.5 }}>Loading usage data...</div>
            )}
          </div>

          {/* Need Help */}
          <div style={{
            background: '#ffffff', border: '1px solid #e8edf2', borderRadius: 14,
            padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#0f172a', fontSize: 13.5, fontWeight: 700, marginBottom: 4 }}>Need Help?</div>
                <div style={{ color: '#64748b', fontSize: 12.5, lineHeight: 1.5, marginBottom: 12 }}>
                  Get help, view guides, or contact our support team.
                </div>
                <Link href="/help" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  color: '#2563eb', fontSize: 12.5, fontWeight: 600, textDecoration: 'none',
                }}>
                  Visit Help Center
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
