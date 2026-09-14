'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

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

function StatCard({ label, value, loading, icon }: { label: string; value: number; loading: boolean; icon: React.ReactNode }) {
  return (
    <div style={{
      background: '#0D1017', border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 12, padding: '18px 20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, fontWeight: 600, letterSpacing: '-0.01em' }}>{label}</div>
        <div style={{ color: 'rgba(255,255,255,0.2)', width: 16, height: 16 }}>{icon}</div>
      </div>
      <div style={{ color: loading ? 'rgba(255,255,255,0.2)' : '#fff', fontSize: 28, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1 }}>
        {loading ? '—' : value.toLocaleString()}
      </div>
    </div>
  );
}

const quickActions = [
  {
    label: 'Ask Intelligence E',
    description: 'Start an agricultural intelligence session',
    href: '/app/agriculture/intelligence',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
      </svg>
    ),
    accent: '#22c55e',
  },
  {
    label: 'Add Farm Data',
    description: 'Register a farm or add agricultural records',
    href: '/app/agriculture/data',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3"/>
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
      </svg>
    ),
    accent: '#3b82f6',
  },
  {
    label: 'Research Agriculture',
    description: 'Query the agricultural research assistant',
    href: '/app/agriculture/research',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
    accent: '#a855f7',
  },
  {
    label: 'Generate Report',
    description: 'Create an agricultural intelligence report',
    href: '/app/agriculture/reports',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
    accent: '#f59e0b',
  },
];

const capabilities = [
  {
    title: 'Market Analysis',
    desc: 'Commodity pricing, supply chain & trade intelligence',
    href: '/app/agriculture/intelligence?type=market_analysis',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
      </svg>
    ),
  },
  {
    title: 'Farm Intelligence',
    desc: 'Crop, livestock & production analysis',
    href: '/app/agriculture/data',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3"/>
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
      </svg>
    ),
  },
  {
    title: 'Decision Support',
    desc: 'AI-driven planting, irrigation & input recommendations',
    href: '/app/agriculture/intelligence?type=decision_support',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    ),
  },
  {
    title: 'Risk Intelligence',
    desc: 'Weather, pest, disease & market risk assessment',
    href: '/app/agriculture/intelligence?type=risk_assessment',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  },
  {
    title: 'Research Assistant',
    desc: 'Agricultural research, literature & analysis',
    href: '/app/agriculture/research',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
  },
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function AgricultureDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({ conversations: 0, farms: 0, reports: 0, analyses: 0 });
  const [recentConversations, setRecentConversations] = useState<RecentConversation[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [greeting, setGreeting] = useState('Good morning');

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
  }, [user]);

  return (
    <div style={{ maxWidth: 1120, margin: '0 auto' }}>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
          <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em' }}>
            {greeting}, {userName}
          </h1>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, letterSpacing: '-0.01em' }}>
          Agricultural intelligence platform — powered by Earth AI
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        <StatCard label="Conversations" value={stats.conversations} loading={loadingStats} icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        } />
        <StatCard label="Farms" value={stats.farms} loading={loadingStats} icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3"/>
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
          </svg>
        } />
        <StatCard label="Analyses" value={stats.analyses} loading={loadingStats} icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
          </svg>
        } />
        <StatCard label="Reports" value={stats.reports} loading={loadingStats} icon={
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
        } />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Quick Actions */}
          <div style={{ background: '#0D1017', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '18px 20px' }}>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 14 }}>
              Quick Actions
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {quickActions.map((action) => (
                <Link key={action.label} href={action.href} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 11, padding: '13px 14px',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 10, textDecoration: 'none', transition: 'border-color 0.12s, background 0.12s',
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    background: `${action.accent}12`, border: `1px solid ${action.accent}22`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: action.accent,
                  }}>
                    {action.icon}
                  </div>
                  <div>
                    <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12.5, fontWeight: 600, marginBottom: 2, letterSpacing: '-0.01em' }}>{action.label}</div>
                    <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, lineHeight: 1.45 }}>{action.description}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Conversations */}
          <div style={{ background: '#0D1017', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase' }}>
                Recent Intelligence Sessions
              </div>
              <Link href="/app/agriculture/intelligence" style={{ color: '#4ade80', fontSize: 11.5, fontWeight: 600, textDecoration: 'none', letterSpacing: '-0.01em' }}>
                View all
              </Link>
            </div>

            {loadingStats ? (
              <div style={{ padding: '20px 0', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>Loading...</div>
            ) : recentConversations.length === 0 ? (
              <div style={{
                border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 10,
                padding: '28px 20px', textAlign: 'center',
              }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 600, marginBottom: 5 }}>No intelligence sessions yet</div>
                <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, marginBottom: 16, lineHeight: 1.5 }}>
                  Start your first agricultural intelligence conversation
                </div>
                <Link href="/app/agriculture/intelligence" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px',
                  background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.20)',
                  borderRadius: 7, color: '#4ade80', fontSize: 12, fontWeight: 600, textDecoration: 'none',
                }}>
                  Begin Intelligence Session
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {recentConversations.map((conv) => (
                  <Link key={conv.id} href={`/app/agriculture/intelligence?conv=${conv.id}`} style={{
                    display: 'flex', alignItems: 'center', gap: 11, padding: '10px 12px',
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 9, textDecoration: 'none',
                  }}>
                    <div style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(34,197,94,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', letterSpacing: '-0.01em' }}>
                        {conv.title}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>
                        {conv.message_count || 0} messages · {conv.analysis_type?.replace(/_/g, ' ') || 'general'}
                      </div>
                    </div>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column — Capabilities */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: '#0D1017', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '18px 20px' }}>
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 14 }}>
              Intelligence Capabilities
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {capabilities.map((cap) => (
                <Link key={cap.title} href={cap.href} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: 9, textDecoration: 'none',
                }}>
                  <div style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>{cap.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12.5, fontWeight: 600, letterSpacing: '-0.01em' }}>{cap.title}</div>
                    <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, lineHeight: 1.4, marginTop: 1 }}>{cap.desc}</div>
                  </div>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </Link>
              ))}
            </div>
          </div>

          {/* Finance Coming Soon */}
          <div style={{
            background: '#0D1017', border: '1px dashed rgba(255,255,255,0.07)',
            borderRadius: 12, padding: '14px 16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
              </svg>
              <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12.5, fontWeight: 600 }}>Intelligence E · Finance</span>
              <span style={{
                padding: '2px 7px', borderRadius: 999,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.3)', fontSize: 9.5, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase',
              }}>Coming Soon</span>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11.5, lineHeight: 1.5 }}>
              Financial market intelligence — in development
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
