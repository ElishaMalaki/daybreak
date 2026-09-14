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

const quickActions = [
  {
    label: 'Ask Intelligence E',
    description: 'Start an agricultural intelligence conversation',
    href: '/app/agriculture/intelligence',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
    color: '#22c55e',
  },
  {
    label: 'Add Farm Data',
    description: 'Register a farm or add agricultural data',
    href: '/app/agriculture/data',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3"/>
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
      </svg>
    ),
    color: '#3b82f6',
  },
  {
    label: 'Research Agriculture',
    description: 'Query the agricultural research assistant',
    href: '/app/agriculture/research',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
      </svg>
    ),
    color: '#a855f7',
  },
  {
    label: 'Generate Report',
    description: 'Create an agricultural intelligence report',
    href: '/app/agriculture/reports',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
    color: '#f59e0b',
  },
];

const capabilities = [
  { title: 'Market Analysis', desc: 'Commodity pricing, supply chain & trade intelligence', icon: '📈', href: '/app/agriculture/intelligence?type=market_analysis' },
  { title: 'Farm Data Intelligence', desc: 'Crop, livestock & production analysis', icon: '🌾', href: '/app/agriculture/data' },
  { title: 'Decision Support', desc: 'AI-driven planting, irrigation & input recommendations', icon: '🎯', href: '/app/agriculture/intelligence?type=decision_support' },
  { title: 'Risk Intelligence', desc: 'Weather, pest, disease & market risk assessment', icon: '⚠️', href: '/app/agriculture/intelligence?type=risk_assessment' },
  { title: 'Research Assistant', desc: 'Agricultural research, literature & analysis', icon: '🔬', href: '/app/agriculture/research' },
];

export default function AgricultureDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({ conversations: 0, farms: 0, reports: 0, analyses: 0 });
  const [recentConversations, setRecentConversations] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'there';

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
          supabase.from('conversations').select('id, title, analysis_type, last_message_at, message_count').eq('user_id', user.id).order('updated_at', { ascending: false }).limit(5),
        ]);

        setStats({
          conversations: convResult.count || 0,
          farms: farmResult.count || 0,
          reports: reportResult.count || 0,
          analyses: analysisResult.count || 0,
        });

        setRecentConversations(recentConvResult.data || []);
      } catch {
        // Non-critical — dashboard still renders with empty states
      } finally {
        setLoadingStats(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const statCards = [
    { label: 'Conversations', value: stats.conversations, icon: '💬', color: '#22c55e' },
    { label: 'Farms', value: stats.farms, icon: '🌱', color: '#3b82f6' },
    { label: 'Analyses', value: stats.analyses, icon: '📊', color: '#a855f7' },
    { label: 'Reports', value: stats.reports, icon: '📄', color: '#f59e0b' },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 6 }}>
          Good {getGreeting()}, {userName}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14 }}>
          Intelligence E Agriculture — your agricultural intelligence platform
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        {statCards.map((stat) => (
          <div key={stat.label} style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 14, padding: '18px 20px',
          }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{stat.icon}</div>
            <div style={{ color: '#fff', fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 2 }}>
              {loadingStats ? '—' : stat.value}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 600 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        {/* Left column */}
        <div>
          {/* Quick Actions */}
          <div style={{ marginBottom: 24 }}>
            <h2 style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
              Quick Actions
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {quickActions.map((action) => (
                <Link key={action.label} href={action.href} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12, textDecoration: 'none', transition: 'all 0.15s',
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                    background: `${action.color}18`, border: `1px solid ${action.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: action.color,
                  }}>
                    {action.icon}
                  </div>
                  <div>
                    <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, marginBottom: 3 }}>{action.label}</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11.5, lineHeight: 1.4 }}>{action.description}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Conversations */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h2 style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Recent Conversations
              </h2>
              <Link href="/app/agriculture/intelligence" style={{ color: '#4ade80', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>
                View all →
              </Link>
            </div>

            {loadingStats ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Loading...</div>
            ) : recentConversations.length === 0 ? (
              <div style={{
                background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.10)',
                borderRadius: 12, padding: '28px 20px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 28, marginBottom: 10 }}>💬</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>No conversations yet</div>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginBottom: 14 }}>
                  Start your first agricultural intelligence conversation
                </div>
                <Link href="/app/agriculture/intelligence" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 16px',
                  background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)',
                  borderRadius: 8, color: '#4ade80', fontSize: 12, fontWeight: 600, textDecoration: 'none',
                }}>
                  Ask Intelligence E
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {recentConversations.map((conv) => (
                  <Link key={conv.id} href={`/app/agriculture/intelligence?conv=${conv.id}`} style={{
                    display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 10, textDecoration: 'none', transition: 'all 0.15s',
                  }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(34,197,94,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {conv.title}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11.5 }}>
                        {conv.message_count || 0} messages · {conv.analysis_type?.replace('_', ' ') || 'general'}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column — Capabilities */}
        <div>
          <h2 style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
            Intelligence Capabilities
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {capabilities.map((cap) => (
              <Link key={cap.title} href={cap.href} style={{
                display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px',
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 12, textDecoration: 'none', transition: 'all 0.15s',
              }}>
                <div style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>{cap.icon}</div>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{cap.title}</div>
                  <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11.5, lineHeight: 1.4 }}>{cap.desc}</div>
                </div>
              </Link>
            ))}
          </div>

          {/* Finance Coming Soon */}
          <div style={{
            marginTop: 16, padding: '14px 16px',
            background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)',
            borderRadius: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{ fontSize: 16 }}>💹</span>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 600 }}>Intelligence E · Finance</span>
              <span style={{
                padding: '2px 8px', borderRadius: 999,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)',
                color: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
              }}>Coming Soon</span>
            </div>
            <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11.5 }}>
              Financial market intelligence — in development
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}
