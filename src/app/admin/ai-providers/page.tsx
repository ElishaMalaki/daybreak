'use client';

import React, { useState, useEffect } from 'react';

interface AIProvider {
  id: string;
  provider: string;
  display_name: string;
  is_enabled: boolean;
  priority: number;
  daily_request_limit: number | null;
  monthly_request_limit: number | null;
  max_tokens_per_request: number;
  timeout_seconds: number;
  retry_limit: number;
  notes: string | null;
  updated_at: string;
}

type EditableProviderNumberKey = 'priority' | 'daily_request_limit' | 'monthly_request_limit' | 'max_tokens_per_request';

const providerColors: Record<string, string> = {
  gemini: '#4285f4', openai: '#10b981', anthropic: '#f59e0b', perplexity: '#8b5cf6', other: '#64748b',
};

const editableProviderNumberFields: Array<{ label: string; key: EditableProviderNumberKey; type: 'number' }> = [
  { label: 'Priority (lower = higher priority)', key: 'priority', type: 'number' },
  { label: 'Daily Request Limit (blank = unlimited)', key: 'daily_request_limit', type: 'number' },
  { label: 'Monthly Request Limit (blank = unlimited)', key: 'monthly_request_limit', type: 'number' },
  { label: 'Max Tokens Per Request', key: 'max_tokens_per_request', type: 'number' },
];

export default function AdminAIProvidersPage() {
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState<string | null>(null);
  const [editProvider, setEditProvider] = useState<AIProvider | null>(null);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const r = await fetch('/api/admin/ai-providers');
      const data = await r.json();
      if (data.error) setError(data.error);
      else setProviders(data.providers || []);
    } catch {
      setError('Failed to load providers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProviders(); }, []);

  const toggleProvider = async (provider: AIProvider) => {
    setSaving(provider.id);
    try {
      const r = await fetch('/api/admin/ai-providers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: provider.id, is_enabled: !provider.is_enabled }),
      });
      const data = await r.json();
      if (data.error) setError(data.error);
      else setProviders((prev) => prev.map((p) => p.id === provider.id ? { ...p, is_enabled: !p.is_enabled } : p));
    } catch {
      setError('Failed to update provider');
    } finally {
      setSaving(null);
    }
  };

  const saveProvider = async () => {
    if (!editProvider) return;
    setSaving(editProvider.id);
    try {
      const r = await fetch('/api/admin/ai-providers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editProvider.id,
          priority: editProvider.priority,
          daily_request_limit: editProvider.daily_request_limit,
          monthly_request_limit: editProvider.monthly_request_limit,
          max_tokens_per_request: editProvider.max_tokens_per_request,
          notes: editProvider.notes,
        }),
      });
      const data = await r.json();
      if (data.error) setError(data.error);
      else { fetchProviders(); setEditProvider(null); }
    } catch {
      setError('Failed to save provider');
    } finally {
      setSaving(null);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: '#0f172a', fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>AI Provider Configuration</h1>
        <p style={{ color: '#64748b', fontSize: 13.5 }}>Enable, disable, and configure AI provider settings and rate limits.</p>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} style={{ background: '#fff', borderRadius: 12, padding: '20px', border: '1px solid #e2e8f0', height: 100, animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))
        ) : providers.map((provider) => (
          <div key={provider.id} style={{
            background: '#fff', borderRadius: 12, padding: '18px 22px',
            border: `1px solid ${provider.is_enabled ? '#e2e8f0' : '#fecaca'}`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: (providerColors[provider.provider] || '#64748b') + '18',
                  border: `1px solid ${(providerColors[provider.provider] || '#64748b')}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: providerColors[provider.provider] || '#64748b',
                  fontWeight: 800, fontSize: 13, textTransform: 'uppercase',
                }}>
                  {provider.provider.slice(0, 2)}
                </div>
                <div>
                  <div style={{ color: '#0f172a', fontSize: 14, fontWeight: 700 }}>{provider.display_name}</div>
                  <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}>
                    Priority: {provider.priority} · Max tokens: {provider.max_tokens_per_request?.toLocaleString()}
                    {provider.daily_request_limit && ` · Daily limit: ${provider.daily_request_limit}`}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  onClick={() => setEditProvider({ ...provider })}
                  style={{
                    padding: '5px 12px', borderRadius: 6, border: '1px solid #e2e8f0',
                    background: '#f8fafc', color: '#374151', fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  Configure
                </button>

                <button
                  onClick={() => toggleProvider(provider)}
                  disabled={saving === provider.id}
                  style={{
                    position: 'relative', width: 44, height: 24, borderRadius: 12,
                    background: provider.is_enabled ? '#16a34a' : '#cbd5e1',
                    border: 'none', cursor: saving === provider.id ? 'not-allowed' : 'pointer',
                    transition: 'background 0.2s', flexShrink: 0,
                  }}
                >
                  <div style={{
                    position: 'absolute', top: 3, left: provider.is_enabled ? 23 : 3,
                    width: 18, height: 18, borderRadius: '50%', background: '#fff',
                    transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }} />
                </button>
              </div>
            </div>

            {provider.notes && (
              <div style={{ marginTop: 10, padding: '8px 12px', background: '#f8fafc', borderRadius: 6, color: '#64748b', fontSize: 12 }}>
                {provider.notes}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editProvider && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }} onClick={() => setEditProvider(null)}>
          <div style={{
            background: '#fff', borderRadius: 14, padding: 28, width: '100%', maxWidth: 460,
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ color: '#0f172a', fontSize: 16, fontWeight: 700, marginBottom: 20 }}>
              Configure {editProvider.display_name}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {editableProviderNumberFields.map((field) => (
                <div key={field.key}>
                  <label style={{ display: 'block', color: '#374151', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>{field.label}</label>
                  <input
                    type={field.type}
                    value={editProvider[field.key] ?? ''}
                    onChange={(e) => setEditProvider({ ...editProvider, [field.key]: e.target.value ? Number(e.target.value) : null })}
                    style={{ width: '100%', height: 38, padding: '0 10px', border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff', color: '#1e293b', fontSize: 13, fontFamily: 'inherit', outline: 'none' }}
                  />
                </div>
              ))}

              <div>
                <label style={{ display: 'block', color: '#374151', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Notes</label>
                <textarea
                  value={editProvider.notes || ''}
                  onChange={(e) => setEditProvider({ ...editProvider, notes: e.target.value })}
                  rows={3}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff', color: '#1e293b', fontSize: 13, fontFamily: 'inherit', outline: 'none', resize: 'vertical' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <button onClick={() => setEditProvider(null)}
                style={{ flex: 1, height: 38, borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                Cancel
              </button>
              <button onClick={saveProvider} disabled={saving === editProvider.id}
                style={{ flex: 1, height: 38, borderRadius: 8, border: 'none', background: '#6366f1', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: saving === editProvider.id ? 0.7 : 1 }}>
                {saving === editProvider.id ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );
}