'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface ApiKey {
  id: string;
  name: string;
  key_prefix: string;
  key_hint: string;
  scopes: string[];
  is_active: boolean;
  last_used_at: string | null;
  expires_at: string | null;
  request_count: number;
  created_at: string;
  raw_key?: string;
}

interface NewKeyResult {
  key: ApiKey & { raw_key: string };
  warning: string;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [planError, setPlanError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<string | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/agriculture/api-keys');
      const data = await res.json();
      if (res.status === 403) {
        setPlanError(data.error || 'API access requires a Business or Enterprise subscription.');
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error(data.error || 'Failed to load API keys');
      setKeys(data.keys || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load API keys');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  async function createKey() {
    if (!newKeyName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch('/api/agriculture/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newKeyName.trim() }),
      });
      const data: NewKeyResult = await res.json();
      if (!res.ok) throw new Error((data as unknown as { error: string }).error || 'Failed to create key');
      setNewlyCreatedKey(data.key.raw_key);
      setKeys(prev => [data.key, ...prev]);
      setNewKeyName('');
      setShowCreateForm(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create key');
    } finally {
      setCreating(false);
    }
  }

  async function revokeKey(id: string) {
    if (!confirm('Revoke this API key? Any applications using it will immediately lose access.')) return;
    setRevokingId(id);
    try {
      const res = await fetch(`/api/agriculture/api-keys?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to revoke key');
      setKeys(prev => prev.map(k => k.id === id ? { ...k, is_active: false } : k));
    } catch {
      setError('Failed to revoke API key');
    } finally {
      setRevokingId(null);
    }
  }

  async function copyToClipboard(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKeyId(id);
      setTimeout(() => setCopiedKeyId(null), 2000);
    } catch {
      // fallback
    }
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  if (planError) {
    return (
      <div style={{ padding: '32px', maxWidth: 720, margin: '0 auto' }}>
        <div style={{
          background: 'rgba(234,179,8,0.08)',
          border: '1px solid rgba(234,179,8,0.25)',
          borderRadius: 12,
          padding: '24px 28px',
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#92400e', marginBottom: 8 }}>
            API Access Not Available
          </h2>
          <p style={{ color: '#78350f', fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
            {planError}
          </p>
          <a
            href="/app/agriculture/subscription"
            style={{
              display: 'inline-block',
              background: '#16a34a',
              color: '#fff',
              padding: '10px 20px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Upgrade to Business
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '32px', maxWidth: 860, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
          API Keys
        </h1>
        <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, maxWidth: 560 }}>
          Use API keys to integrate Intelligence E Agriculture with your own applications.
          Keep your keys secure — they provide full access to your AI credits.
        </p>
      </div>

      {/* Integration info box */}
      <div style={{
        background: '#f0fdf4',
        border: '1px solid #bbf7d0',
        borderRadius: 10,
        padding: '16px 20px',
        marginBottom: 28,
        fontSize: 13,
        color: '#166534',
        lineHeight: 1.7,
      }}>
        <strong>Integration endpoint:</strong>{' '}
        <code style={{ background: '#dcfce7', padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace' }}>
          POST https://daybreak1966.builtwithrocket.new/api/v1/agriculture/intelligence
        </code>
        <br />
        <strong>Authentication:</strong>{' '}
        <code style={{ background: '#dcfce7', padding: '2px 6px', borderRadius: 4, fontFamily: 'monospace' }}>
          Authorization: Bearer &lt;your-api-key&gt;
        </code>
        <br />
        <a href="/app/agriculture/api-keys/docs" style={{ color: '#15803d', fontWeight: 600 }}>
          View integration guide →
        </a>
      </div>

      {/* Newly created key banner */}
      {newlyCreatedKey && (
        <div style={{
          background: '#fefce8',
          border: '1px solid #fde047',
          borderRadius: 10,
          padding: '16px 20px',
          marginBottom: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <strong style={{ fontSize: 14, color: '#713f12' }}>
              Your new API key — copy it now. It will not be shown again.
            </strong>
            <button
              onClick={() => setNewlyCreatedKey(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#92400e', fontSize: 18, lineHeight: 1 }}
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <code style={{
              flex: 1,
              background: '#fff',
              border: '1px solid #fde047',
              borderRadius: 6,
              padding: '8px 12px',
              fontFamily: 'monospace',
              fontSize: 13,
              wordBreak: 'break-all',
              color: '#1c1917',
            }}>
              {newlyCreatedKey}
            </code>
            <button
              onClick={() => copyToClipboard(newlyCreatedKey, 'new')}
              style={{
                background: copiedKeyId === 'new' ? '#16a34a' : '#0f172a',
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '8px 14px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {copiedKeyId === 'new' ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: 8,
          padding: '12px 16px',
          marginBottom: 20,
          fontSize: 13,
          color: '#991b1b',
        }}>
          {error}
        </div>
      )}

      {/* Create key form */}
      {showCreateForm ? (
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 10,
          padding: '20px 24px',
          marginBottom: 24,
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', marginBottom: 14 }}>
            Create New API Key
          </h3>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              type="text"
              value={newKeyName}
              onChange={e => setNewKeyName(e.target.value)}
              placeholder="Key name (e.g. Pelit Farm App)"
              maxLength={80}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid #cbd5e1',
                fontSize: 14,
                color: '#0f172a',
                outline: 'none',
              }}
              onKeyDown={e => e.key === 'Enter' && createKey()}
              autoFocus
            />
            <button
              onClick={createKey}
              disabled={creating || !newKeyName.trim()}
              style={{
                background: creating || !newKeyName.trim() ? '#94a3b8' : '#16a34a',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '10px 20px',
                fontSize: 14,
                fontWeight: 600,
                cursor: creating || !newKeyName.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              {creating ? 'Creating...' : 'Create Key'}
            </button>
            <button
              onClick={() => { setShowCreateForm(false); setNewKeyName(''); }}
              style={{
                background: 'none',
                border: '1px solid #cbd5e1',
                borderRadius: 8,
                padding: '10px 16px',
                fontSize: 14,
                color: '#64748b',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: 24 }}>
          <button
            onClick={() => setShowCreateForm(true)}
            style={{
              background: '#16a34a',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '10px 20px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            + Create API Key
          </button>
        </div>
      )}

      {/* Keys list */}
      {loading ? (
        <div style={{ color: '#64748b', fontSize: 14, padding: '20px 0' }}>Loading API keys...</div>
      ) : keys.length === 0 ? (
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 10,
          padding: '40px 24px',
          textAlign: 'center',
          color: '#64748b',
          fontSize: 14,
        }}>
          No API keys yet. Create one to start integrating with Intelligence E.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {keys.map(key => (
            <div
              key={key.id}
              style={{
                background: key.is_active ? '#fff' : '#f8fafc',
                border: `1px solid ${key.is_active ? '#e2e8f0' : '#e2e8f0'}`,
                borderRadius: 10,
                padding: '16px 20px',
                opacity: key.is_active ? 1 : 0.6,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: '#0f172a' }}>{key.name}</span>
                    {key.is_active ? (
                      <span style={{
                        background: '#dcfce7',
                        color: '#166534',
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 999,
                      }}>Active</span>
                    ) : (
                      <span style={{
                        background: '#f1f5f9',
                        color: '#64748b',
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 999,
                      }}>Revoked</span>
                    )}
                  </div>
                  <code style={{
                    fontSize: 13,
                    fontFamily: 'monospace',
                    color: '#475569',
                    background: '#f1f5f9',
                    padding: '3px 8px',
                    borderRadius: 4,
                  }}>
                    {key.key_prefix}...{key.key_hint}
                  </code>
                  <div style={{ display: 'flex', gap: 20, marginTop: 8, fontSize: 12, color: '#94a3b8' }}>
                    <span>Created {formatDate(key.created_at)}</span>
                    <span>Last used {formatDate(key.last_used_at)}</span>
                    <span>{key.request_count.toLocaleString()} requests</span>
                    {key.expires_at && <span>Expires {formatDate(key.expires_at)}</span>}
                  </div>
                </div>
                {key.is_active && (
                  <button
                    onClick={() => revokeKey(key.id)}
                    disabled={revokingId === key.id}
                    style={{
                      background: 'none',
                      border: '1px solid #fca5a5',
                      borderRadius: 6,
                      padding: '6px 14px',
                      fontSize: 13,
                      color: '#dc2626',
                      cursor: revokingId === key.id ? 'not-allowed' : 'pointer',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                  >
                    {revokingId === key.id ? 'Revoking...' : 'Revoke'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
