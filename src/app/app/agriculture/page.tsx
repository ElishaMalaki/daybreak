'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

interface DashboardStats {
  conversations: number;
  reports: number;
  analyses: number;
  apiKeys: number;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function AgricultureDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({ conversations: 0, reports: 0, analyses: 0, apiKeys: 0 });
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('Good morning');

  const userName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Admin';

  useEffect(() => setGreeting(getGreeting()), []);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const supabase = createClient();
      try {
        const [convResult, reportResult, analysisResult, apiKeyResult] = await Promise.all([
          supabase.from('conversations').select('id', { count: 'exact', head: true }),
          supabase.from('reports').select('id', { count: 'exact', head: true }),
          supabase.from('analyses').select('id', { count: 'exact', head: true }),
          supabase.from('api_keys').select('id', { count: 'exact', head: true }),
        ]);
        setStats({
          conversations: convResult.count || 0,
          reports: reportResult.count || 0,
          analyses: analysisResult.count || 0,
          apiKeys: apiKeyResult.count || 0,
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const statItems = [
    { label: 'Test Conversations', value: stats.conversations },
    { label: 'Reports', value: stats.reports },
    { label: 'Analyses', value: stats.analyses },
    { label: 'API Keys', value: stats.apiKeys },
  ];

  const adminTools = [
    { title: 'AI Chat Testing', description: 'Test Intelligence E prompts, model routing, real-time answers, crop guidance, and conversation quality.', href: '/app/agriculture/intelligence' },
    { title: 'Agricultural Research', description: 'Run research checks, compare outputs, and validate agricultural reasoning before Pelit release.', href: '/app/agriculture/research' },
    { title: 'Reports and Recommendations', description: 'Review generated reports, recommendation behavior, and decision-support quality.', href: '/app/agriculture/reports' },
    { title: 'API Keys', description: 'Manage server-side integration keys used by Pelit and approved external systems.', href: '/app/agriculture/api-keys' },
    { title: 'AI Usage and Costs', description: 'Review usage volume, credits, provider activity, and cost signals.', href: '/admin/ai-usage' },
    { title: 'Model Providers', description: 'Check configured providers, provider health, model routing, and failover readiness.', href: '/admin/ai-providers' },
    { title: 'Users and Access', description: 'Manage administrators and inspect platform access. Customers use Intelligence E through Pelit.', href: '/admin/users' },
    { title: 'Feature Controls', description: 'Control rollout flags for API integrations, AI tools, testing features, and platform behavior.', href: '/admin/features' },
  ];

  return (
    <>
      <style>{`
        .dash { max-width: 1120px; margin: 0 auto; display: grid; gap: 18px; }
        .dash-hero { display: grid; grid-template-columns: 1fr auto; gap: 20px; align-items: center; padding: 24px; border: 1px solid #e5e7eb; border-radius: 14px; background: #fff; }
        .dash-kicker { margin: 0 0 8px; color: #4b5563; font-size: 12px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; }
        .dash-hero h1 { margin: 0; color: #111827; font-size: 28px; line-height: 1.15; letter-spacing: -0.04em; }
        .dash-hero p { margin: 8px 0 0; color: #6b7280; line-height: 1.55; max-width: 760px; }
        .dash-logo { width: 76px; height: 76px; border-radius: 18px; object-fit: cover; border: 1px solid #e5e7eb; }
        .dash-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 18px; }
        .dash-btn { min-height: 40px; display: inline-flex; align-items: center; justify-content: center; padding: 0 16px; border-radius: 9px; text-decoration: none; font-size: 13px; font-weight: 700; }
        .dash-btn.primary { background: #111827; color: #fff; }
        .dash-btn.secondary { background: #f9fafb; color: #111827; border: 1px solid #e5e7eb; }
        .dash-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
        .dash-card { padding: 18px; border: 1px solid #e5e7eb; border-radius: 14px; background: #fff; }
        .dash-card span { color: #6b7280; font-size: 12px; font-weight: 700; }
        .dash-card strong { display: block; margin-top: 8px; color: #111827; font-size: 28px; letter-spacing: -0.04em; }
        .dash-tools { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
        .dash-tool { display: block; padding: 18px; border: 1px solid #e5e7eb; border-radius: 14px; background: #fff; color: inherit; text-decoration: none; }
        .dash-tool:hover { background: #f9fafb; }
        .dash-tool h2 { margin: 0; color: #111827; font-size: 16px; letter-spacing: -0.02em; }
        .dash-tool p { margin: 8px 0 0; color: #6b7280; line-height: 1.6; font-size: 14px; }
        .dash-note { border: 1px solid #e5e7eb; border-radius: 14px; background: #f9fafb; padding: 18px; color: #4b5563; font-size: 14px; line-height: 1.65; }
        @media (max-width: 880px) { .dash-grid, .dash-tools { grid-template-columns: 1fr 1fr; } .dash-hero { grid-template-columns: 1fr; } }
        @media (max-width: 620px) { .dash-grid, .dash-tools { grid-template-columns: 1fr; } .dash-logo { width: 58px; height: 58px; } }
      `}</style>
      <div className="dash">
        <section className="dash-hero">
          <div>
            <p className="dash-kicker">Internal admin console</p>
            <h1>{greeting}, {userName}</h1>
            <p>Intelligence E for Agriculture is now an AI platform layer for Pelit. Customers use the intelligence through Pelit and approved API integrations. This web console is for Earth AI administrators to test, monitor, evaluate, and manage the agricultural intelligence system.</p>
            <div className="dash-actions">
              <Link href="/app/agriculture/intelligence" className="dash-btn primary">Open AI testing</Link>
              <Link href="/admin/ai-usage" className="dash-btn secondary">View AI usage</Link>
              <Link href="/app/agriculture/api-keys" className="dash-btn secondary">Manage API keys</Link>
            </div>
          </div>
          <Image className="dash-logo" src="/assets/images/h9O7B-1789370942958.jpg" alt="Earth AI" width={76} height={76} priority />
        </section>

        <section className="dash-grid" aria-label="Admin summary">
          {statItems.map((item) => (
            <div className="dash-card" key={item.label}>
              <span>{item.label}</span>
              <strong>{loading ? '-' : item.value}</strong>
            </div>
          ))}
        </section>

        <section className="dash-tools" aria-label="Admin tools">
          {adminTools.map((tool) => (
            <Link href={tool.href} className="dash-tool" key={tool.title}>
              <h2>{tool.title}</h2>
              <p>{tool.description}</p>
            </Link>
          ))}
        </section>

        <section className="dash-note">
          Pelit should call Intelligence E through server-side API keys. Do not expose integration keys inside the Flutter client. Customer account management, farm operations, and normal user workflows belong in Pelit, while this web app remains the protected internal console for Earth AI administration, testing, monitoring, and evaluation.
        </section>
      </div>
    </>
  );
}
