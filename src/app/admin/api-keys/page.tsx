'use client';

import type { CSSProperties, FormEvent } from 'react';
import { useEffect, useState } from 'react';

type ApiKey = {
  id: string;
  name: string;
  key_prefix: string;
  scopes: string[];
  environment: string;
  status: string;
  rate_limit_per_minute: number;
  monthly_request_limit: number | null;
  allowed_origins: string[];
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
};

export default function AdminApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [secret, setSecret] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: 'Pelit production integration', environment: 'production', scopes: 'agriculture:ai,agriculture:image,agriculture:documents', allowedOrigins: '', rateLimitPerMinute: '60', monthlyRequestLimit: '' });

  async function loadKeys() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/api-keys');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load API keys');
      setKeys(data.keys || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load API keys');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadKeys();
  }, []);

  async function createKey(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setSecret('');
    setError('');
    try {
      const response = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          environment: form.environment,
          scopes: form.scopes.split(',').map((value) => value.trim()).filter(Boolean),
          allowedOrigins: form.allowedOrigins.split(',').map((value) => value.trim()).filter(Boolean),
          rateLimitPerMinute: Number(form.rateLimitPerMinute || 60),
          monthlyRequestLimit: form.monthlyRequestLimit ? Number(form.monthlyRequestLimit) : null,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to create API key');
      setSecret(data.secret);
      setKeys((current) => [data.key, ...current]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create API key');
    } finally {
      setSaving(false);
    }
  }

  async function revokeKey(id: string) {
    setError('');
    const response = await fetch(`/api/admin/api-keys/${id}`, { method: 'DELETE' });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setError(data.error || 'Unable to revoke API key');
      return;
    }
    setKeys((current) => current.map((key) => key.id === id ? { ...key, status: 'revoked' } : key));
  }

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ margin: 0, color: 'var(--text, #0f172a)', fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em' }}>API Keys</h1>
        <p style={{ color: 'var(--muted, #64748b)', marginTop: 8, maxWidth: 820, lineHeight: 1.7 }}>Create and manage server side integration keys for Pelit and approved Intelligence E clients. Never embed these keys in a Flutter mobile app or public client.</p>
      </div>

      {error && <div style={{ marginBottom: 16, padding: 12, borderRadius: 10, border: '1px solid #fecaca', background: '#fef2f2', color: '#b91c1c', fontSize: 13 }}>{error}</div>}
      {secret && <div style={{ marginBottom: 16, padding: 14, borderRadius: 12, border: '1px solid #bbf7d0', background: '#f0fdf4', color: '#14532d' }}><strong>Copy this key now. It will not be shown again.</strong><pre style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', margin: '8px 0 0' }}>{secret}</pre></div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 380px) minmax(0, 1fr)', gap: 18 }}>
        <form onSubmit={createKey} style={{ padding: 18, border: '1px solid var(--border, #e5e7eb)', borderRadius: 12, background: 'var(--surface, #fff)', alignSelf: 'start' }}>
          <h2 style={{ margin: '0 0 14px', color: 'var(--text, #0f172a)', fontSize: 15 }}>Create integration key</h2>
          <label style={labelStyle}>Name<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} /></label>
          <label style={labelStyle}>Environment<select value={form.environment} onChange={(e) => setForm({ ...form, environment: e.target.value })} style={inputStyle}><option value="production">production</option><option value="staging">staging</option><option value="development">development</option></select></label>
          <label style={labelStyle}>Scopes<input value={form.scopes} onChange={(e) => setForm({ ...form, scopes: e.target.value })} style={inputStyle} /></label>
          <label style={labelStyle}>Allowed origins<input placeholder="https://pelit.example.com" value={form.allowedOrigins} onChange={(e) => setForm({ ...form, allowedOrigins: e.target.value })} style={inputStyle} /></label>
          <label style={labelStyle}>Rate limit per minute<input type="number" min="1" value={form.rateLimitPerMinute} onChange={(e) => setForm({ ...form, rateLimitPerMinute: e.target.value })} style={inputStyle} /></label>
          <label style={labelStyle}>Monthly request limit<input type="number" min="1" value={form.monthlyRequestLimit} onChange={(e) => setForm({ ...form, monthlyRequestLimit: e.target.value })} style={inputStyle} /></label>
          <button disabled={saving} style={buttonStyle}>{saving ? 'Creating...' : 'Create API Key'}</button>
        </form>

        <div style={{ display: 'grid', gap: 10 }}>
          {loading ? <div style={emptyStyle}>Loading API keys...</div> : keys.length === 0 ? <div style={emptyStyle}>No API keys yet. Create a server side key for Pelit integration.</div> : keys.map((key) => (
            <article key={key.id} style={{ padding: 16, border: '1px solid var(--border, #e5e7eb)', borderRadius: 12, background: 'var(--surface, #fff)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                <div><h3 style={{ margin: 0, color: 'var(--text, #0f172a)', fontSize: 15 }}>{key.name}</h3><div style={{ color: 'var(--muted, #64748b)', fontSize: 12, marginTop: 4 }}>{key.key_prefix}...</div></div>
                <span style={{ color: key.status === 'active' ? '#16a34a' : '#991b1b', fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>{key.status}</span>
              </div>
              <div style={{ color: 'var(--muted, #64748b)', fontSize: 12.5, lineHeight: 1.7 }}>Environment: {key.environment}<br />Scopes: {key.scopes.join(', ')}<br />Rate limit: {key.rate_limit_per_minute}/minute<br />Monthly limit: {key.monthly_request_limit || 'Not set'}<br />Last used: {key.last_used_at ? new Date(key.last_used_at).toLocaleString() : 'Never'}</div>
              {key.status === 'active' && <button onClick={() => revokeKey(key.id)} style={{ ...buttonStyle, width: 'auto', marginTop: 12, background: '#991b1b' }}>Revoke</button>}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

const labelStyle: CSSProperties = { display: 'grid', gap: 7, marginBottom: 12, color: 'var(--muted, #64748b)', fontSize: 12, fontWeight: 800 };
const inputStyle: CSSProperties = { width: '100%', border: '1px solid var(--border, #e5e7eb)', borderRadius: 8, padding: '10px 11px', background: 'var(--surface, #fff)', color: 'var(--text, #0f172a)', font: 'inherit' };
const buttonStyle: CSSProperties = { width: '100%', border: 0, borderRadius: 9, padding: '11px 12px', background: '#111827', color: '#fff', fontWeight: 800, cursor: 'pointer' };
const emptyStyle: CSSProperties = { padding: 18, border: '1px dashed var(--border, #e5e7eb)', borderRadius: 12, color: 'var(--muted, #64748b)', background: 'var(--surface, #fff)', fontSize: 13 };
