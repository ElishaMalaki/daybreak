'use client';

import React, { useState, useEffect } from 'react';

interface FeatureFlag {
  id: string;
  key: string;
  label: string;
  description: string | null;
  is_enabled: boolean;
  applies_to_tiers: string[];
  updated_at: string;
}

const ALL_TIERS = ['free', 'starter', 'professional', 'business', 'enterprise'];

const tierColors: Record<string, string> = {
  free: '#64748b', starter: '#0ea5e9', professional: '#8b5cf6', business: '#f59e0b', enterprise: '#10b981',
};

export default function AdminFeaturesPage() {
  const [features, setFeatures] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState<string | null>(null);

  const fetchFeatures = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/features');
      const data = await r.json();
      if (data.error) setError(data.error);
      else setFeatures(data.features || []);
    } catch {
      setError('Failed to load feature flags');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFeatures(); }, []);

  const toggleFeature = async (feature: FeatureFlag) => {
    setSaving(feature.id);
    try {
      const r = await fetch('/api/admin/features', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: feature.id, is_enabled: !feature.is_enabled }),
      });
      const data = await r.json();
      if (data.error) setError(data.error);
      else {
        setFeatures((prev) => prev.map((f) => f.id === feature.id ? { ...f, is_enabled: !f.is_enabled } : f));
      }
    } catch {
      setError('Failed to update feature');
    } finally {
      setSaving(null);
    }
  };

  const toggleTier = async (feature: FeatureFlag, tier: string) => {
    const newTiers = feature.applies_to_tiers.includes(tier)
      ? feature.applies_to_tiers.filter((t) => t !== tier)
      : [...feature.applies_to_tiers, tier];

    setSaving(feature.id + tier);
    try {
      const r = await fetch('/api/admin/features', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: feature.id, applies_to_tiers: newTiers }),
      });
      const data = await r.json();
      if (data.error) setError(data.error);
      else {
        setFeatures((prev) => prev.map((f) => f.id === feature.id ? { ...f, applies_to_tiers: newTiers } : f));
      }
    } catch {
      setError('Failed to update tiers');
    } finally {
      setSaving(null);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: '#0f172a', fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>Feature Flags</h1>
        <p style={{ color: '#64748b', fontSize: 13.5 }}>Control which features are available on the platform and per subscription tier.</p>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading ? (
          [...Array(5)].map((_, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 12, padding: '20px 22px', border: '1px solid #e2e8f0', height: 90, animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))
        ) : features.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: 12, padding: '40px', textAlign: 'center', border: '1px solid #e2e8f0', color: '#94a3b8', fontSize: 13 }}>
            No feature flags found
          </div>
        ) : features.map((feature) => (
          <div key={feature.id} style={{
            background: '#fff', borderRadius: 12, padding: '18px 22px',
            border: `1px solid ${feature.is_enabled ? '#e2e8f0' : '#fecaca'}`,
            opacity: feature.is_enabled ? 1 : 0.8,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span style={{ color: '#0f172a', fontSize: 14, fontWeight: 700 }}>{feature.label}</span>
                  <code style={{ color: '#6366f1', fontSize: 11, background: '#eef2ff', padding: '1px 6px', borderRadius: 4, fontFamily: 'monospace' }}>{feature.key}</code>
                </div>
                {feature.description && (
                  <p style={{ color: '#64748b', fontSize: 12.5, lineHeight: 1.5 }}>{feature.description}</p>
                )}
              </div>

              {/* Toggle switch */}
              <button
                onClick={() => toggleFeature(feature)}
                disabled={saving === feature.id}
                style={{
                  position: 'relative', width: 44, height: 24, borderRadius: 12,
                  background: feature.is_enabled ? '#16a34a' : '#cbd5e1',
                  border: 'none', cursor: saving === feature.id ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s', flexShrink: 0,
                }}
                title={feature.is_enabled ? 'Disable feature' : 'Enable feature'}
              >
                <div style={{
                  position: 'absolute', top: 3, left: feature.is_enabled ? 23 : 3,
                  width: 18, height: 18, borderRadius: '50%', background: '#fff',
                  transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }} />
              </button>
            </div>

            {/* Tier access */}
            <div>
              <div style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                Available to tiers
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {ALL_TIERS.map((tier) => {
                  const active = feature.applies_to_tiers.includes(tier);
                  const isSaving = saving === feature.id + tier;
                  return (
                    <button
                      key={tier}
                      onClick={() => toggleTier(feature, tier)}
                      disabled={isSaving}
                      style={{
                        padding: '3px 10px', borderRadius: 6, fontSize: 11.5, fontWeight: 600,
                        cursor: isSaving ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                        border: `1px solid ${active ? tierColors[tier] : '#e2e8f0'}`,
                        background: active ? tierColors[tier] + '18' : '#f8fafc',
                        color: active ? tierColors[tier] : '#94a3b8',
                        transition: 'all 0.12s', textTransform: 'capitalize',
                      }}
                    >
                      {tier}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginTop: 10, color: '#cbd5e1', fontSize: 11 }}>
              Last updated: {new Date(feature.updated_at).toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );
}
