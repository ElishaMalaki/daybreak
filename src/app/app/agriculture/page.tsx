'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
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

interface UsageSummary {
  tier: SubscriptionTier;
  aiCreditsUsed: number;
  aiCreditsLimit: number;
  reportsUsed: number;
  reportsLimit: number;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function AgricultureDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({ conversations: 0, farms: 0, reports: 0, analyses: 0 });
  const [usageSummary, setUsageSummary] = useState<UsageSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('Good morning');

  const userName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'there';

  useEffect(() => setGreeting(getGreeting()), []);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const supabase = createClient();
      try {
        const [convResult, farmResult, reportResult, analysisResult] = await Promise.all([
          supabase.from('conversations').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('farms').select('id', { count: 'exact', head: true }).eq('owner_id', user.id),
          supabase.from('reports').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('analyses').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
        ]);
        setStats({
          conversations: convResult.count || 0,
          farms: farmResult.count || 0,
          reports: reportResult.count || 0,
          analyses: analysisResult.count || 0,
        });
      } finally {
        setLoading(false);
      }
    };
    load();

    fetch('/api/subscription/usage')
      .then((response) => response.json())
      .then((data) => {
        if (data.subscription && data.usage && data.limits) {
          setUsageSummary({
            tier: data.subscription.tier as SubscriptionTier,
            aiCreditsUsed: data.usage.aiCreditsUsed,
            aiCreditsLimit: data.limits.aiCredits,
            reportsUsed: data.usage.reportsUsed,
            reportsLimit: data.limits.reports,
          });
        }
      })
      .catch(() => {});
  }, [user]);

  const statItems = [
    { label: 'Farms', value: stats.farms },
    { label: 'Conversations', value: stats.conversations },
    { label: 'Reports', value: stats.reports },
    { label: 'Analyses', value: stats.analyses },
  ];

  return (
    <>
      <style>{`
        .dash { max-width: 1080px; margin: 0 auto; display: grid; gap: 18px; }
        .dash-hero { display: grid; grid-template-columns: 1fr auto; gap: 20px; align-items: center; padding: 24px; border: 1px solid #e5e7eb; border-radius: 14px; background: #fff; }
        .dash-hero h1 { margin: 0; color: #111827; font-size: 28px; line-height: 1.15; letter-spacing: -0.04em; }
        .dash-hero p { margin: 8px 0 0; color: #6b7280; line-height: 1.55; max-width: 660px; }
        .dash-logo { width: 76px; height: 76px; border-radius: 18px; object-fit: cover; border: 1px solid #e5e7eb; }
        .dash-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 18px; }
        .dash-btn { min-height: 40px; display: inline-flex; align-items: center; justify-content: center; padding: 0 16px; border-radius: 9px; text-decoration: none; font-size: 13px; font-weight: 700; }
        .dash-btn.primary { background: #111827; color: #fff; }
        .dash-btn.secondary { background: #f9fafb; color: #111827; border: 1px solid #e5e7eb; }
        .dash-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
        .dash-card { padding: 18px; border: 1px solid #e5e7eb; border-radius: 14px; background: #fff; }
        .dash-card span { color: #6b7280; font-size: 12px; font-weight: 700; }
        .dash-card strong { display: block; margin-top: 8px; color: #111827; font-size: 28px; letter-spacing: -0.04em; }
        .dash-two { display: grid; grid-template-columns: minmax(0, 1fr) minmax(280px, 360px); gap: 18px; }
        .dash-panel { border: 1px solid #e5e7eb; border-radius: 14px; background: #fff; padding: 20px; }
        .dash-panel h2 { margin: 0 0 10px; color: #111827; font-size: 16px; letter-spacing: -0.02em; }
        .dash-panel p { color: #6b7280; line-height: 1.65; font-size: 14px; }
        .usage-row { display: grid; gap: 6px; margin-top: 14px; }
        .usage-head { display: flex; justify-content: space-between; color: #374151; font-size: 12px; font-weight: 700; }
        .usage-bar { height: 7px; border-radius: 999px; background: #f3f4f6; overflow: hidden; }
        .usage-fill { height: 100%; border-radius: 999px; background: #111827; }
        @media (max-width: 880px) { .dash-grid, .dash-two { grid-template-columns: 1fr 1fr; } .dash-hero { grid-template-columns: 1fr; } }
        @media (max-width: 620px) { .dash-grid, .dash-two { grid-template-columns: 1fr; } .dash-logo { width: 58px; height: 58px; } }
      `}</style>
      <div className="dash">
        <section className="dash-hero">
          <div>
            <h1>{greeting}, {userName}</h1>
            <p>Welcome to Intelligence E for Agriculture. Use the platform for focused agricultural intelligence, photo analysis, research, reports, and decision support. Full farm management and deeper agriculture data capabilities will be available in the Pelit app.</p>
            <div className="dash-actions">
              <Link href="/app/agriculture/intelligence" className="dash-btn primary">Open Intelligence E</Link>
              <Link href="/app/agriculture/subscription" className="dash-btn secondary">View plan</Link>
              <Link href="/app/agriculture/feedback" className="dash-btn secondary">Send feedback</Link>
            </div>
          </div>
          <Image className="dash-logo" src="/assets/images/h9O7B-1789370942958.jpg" alt="Earth AI" width={76} height={76} priority />
        </section>

        <section className="dash-grid" aria-label="Dashboard summary">
          {statItems.map((item) => (
            <div className="dash-card" key={item.label}>
              <span>{item.label}</span>
              <strong>{loading ? '-' : item.value}</strong>
            </div>
          ))}
        </section>

        <section className="dash-two">
          <div className="dash-panel">
            <h2>What to do next</h2>
            <p>Ask Intelligence E a practical agriculture question, upload a crop or plant photo for analysis, create a report, or send feedback if something does not work as expected.</p>
          </div>
          <div className="dash-panel">
            <h2>Usage</h2>
            {usageSummary ? (
              <>
                <p>{SUBSCRIPTION_PLANS[usageSummary.tier]?.name || 'Free'} plan. Limits are enforced server-side.</p>
                <UsageBar label="AI credits" used={usageSummary.aiCreditsUsed} limit={usageSummary.aiCreditsLimit} />
                <UsageBar label="Reports" used={usageSummary.reportsUsed} limit={usageSummary.reportsLimit} />
              </>
            ) : <p>Loading usage data...</p>}
          </div>
        </section>
      </div>
    </>
  );
}

function UsageBar({ label, used, limit }: { label: string; used: number; limit: number }) {
  const unlimited = limit === -1;
  const percent = unlimited ? 0 : Math.min(100, Math.round((used / Math.max(1, limit)) * 100));
  return (
    <div className="usage-row">
      <div className="usage-head"><span>{label}</span><span>{used} / {unlimited ? 'Unlimited' : limit}</span></div>
      {!unlimited && <div className="usage-bar"><div className="usage-fill" style={{ width: `${percent}%` }} /></div>}
    </div>
  );
}
