'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  subscription_tier: string;
  is_active: boolean;
  country: string | null;
  created_at: string;
  last_seen_at: string | null;
  subscription: { tier: string; status: string; expires_at: string | null };
}

const TIERS = ['free', 'starter', 'professional', 'business', 'enterprise'];
const ROLES = ['user', 'admin', 'org_admin', 'farm_manager', 'analyst'];

const tierColors: Record<string, string> = {
  free: '#64748b', starter: '#0ea5e9', professional: '#8b5cf6', business: '#f59e0b', enterprise: '#10b981',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState<string | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      const r = await fetch(`/api/admin/users?${params}`);
      const data = await r.json();
      if (data.error) setError(data.error);
      else { setUsers(data.users || []); setTotal(data.total || 0); }
    } catch {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleUpdate = async (userId: string, updates: Record<string, unknown>) => {
    setSaving(userId);
    try {
      const r = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...updates }),
      });
      const data = await r.json();
      if (data.error) setError(data.error);
      else { fetchUsers(); setEditUser(null); }
    } catch {
      setError('Failed to update user');
    } finally {
      setSaving(null);
    }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: '#0f172a', fontSize: 22, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4 }}>User Management</h1>
        <p style={{ color: '#64748b', fontSize: 13.5 }}>Manage all platform users, roles, and subscriptions.</p>
      </div>

      {/* Search */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            style={{
              width: '100%', height: 38, padding: '0 12px 0 34px',
              border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff',
              color: '#1e293b', fontSize: 13.5, fontFamily: 'inherit', outline: 'none',
            }}
          />
        </div>
        <div style={{ color: '#64748b', fontSize: 13 }}>{total} users</div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', color: '#dc2626', fontSize: 13, marginBottom: 16 }}>
          {error}
        </div>
      )}

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['User', 'Role', 'Subscription', 'Status', 'Joined', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', color: '#64748b', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    {[...Array(6)].map((__, j) => (
                      <td key={j} style={{ padding: '12px 16px' }}>
                        <div style={{ height: 14, background: '#f1f5f9', borderRadius: 4, animation: 'pulse 1.5s ease-in-out infinite' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '32px 16px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>No users found</td>
                </tr>
              ) : users.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.1s' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                        background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#fff', fontWeight: 700, fontSize: 12,
                      }}>
                        {(u.full_name || u.email)[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ color: '#0f172a', fontWeight: 600, fontSize: 13 }}>{u.full_name || '—'}</div>
                        <div style={{ color: '#94a3b8', fontSize: 11.5 }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      display: 'inline-block', padding: '2px 8px', borderRadius: 5,
                      background: u.role === 'admin' ? '#eef2ff' : '#f1f5f9',
                      color: u.role === 'admin' ? '#6366f1' : '#64748b',
                      fontSize: 11.5, fontWeight: 600, textTransform: 'capitalize',
                    }}>{u.role}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      display: 'inline-block', padding: '2px 8px', borderRadius: 5,
                      background: '#f8fafc', border: '1px solid #e2e8f0',
                      color: tierColors[u.subscription?.tier || 'free'] || '#64748b',
                      fontSize: 11.5, fontWeight: 600, textTransform: 'capitalize',
                    }}>{u.subscription?.tier || 'free'}</span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      display: 'inline-block', padding: '2px 8px', borderRadius: 5,
                      background: u.is_active ? '#f0fdf4' : '#fef2f2',
                      color: u.is_active ? '#16a34a' : '#dc2626',
                      fontSize: 11.5, fontWeight: 600,
                    }}>{u.is_active ? 'Active' : 'Inactive'}</span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#64748b', fontSize: 12 }}>
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <button
                      onClick={() => setEditUser(u)}
                      style={{
                        padding: '5px 12px', borderRadius: 6, border: '1px solid #e2e8f0',
                        background: '#f8fafc', color: '#374151', fontSize: 12, fontWeight: 600,
                        cursor: 'pointer', fontFamily: 'inherit',
                      }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ color: '#64748b', fontSize: 12 }}>Page {page} of {totalPages}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', color: '#374151', fontSize: 12, cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1, fontFamily: 'inherit' }}>
                Previous
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #e2e8f0', background: '#fff', color: '#374151', fontSize: 12, cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1, fontFamily: 'inherit' }}>
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editUser && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }} onClick={() => setEditUser(null)}>
          <div style={{
            background: '#fff', borderRadius: 14, padding: 28, width: '100%', maxWidth: 440,
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }} onClick={(e) => e.stopPropagation()}>
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ color: '#0f172a', fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Edit User</h3>
              <p style={{ color: '#64748b', fontSize: 13 }}>{editUser.email}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', color: '#374151', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Role</label>
                <select
                  value={editUser.role}
                  onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                  style={{ width: '100%', height: 38, padding: '0 10px', border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff', color: '#1e293b', fontSize: 13, fontFamily: 'inherit', outline: 'none' }}
                >
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', color: '#374151', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Subscription Tier</label>
                <select
                  value={editUser.subscription?.tier || 'free'}
                  onChange={(e) => setEditUser({ ...editUser, subscription: { ...editUser.subscription, tier: e.target.value } })}
                  style={{ width: '100%', height: 38, padding: '0 10px', border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff', color: '#1e293b', fontSize: 13, fontFamily: 'inherit', outline: 'none' }}
                >
                  {TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', color: '#374151', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Account Status</label>
                <select
                  value={editUser.is_active ? 'active' : 'inactive'}
                  onChange={(e) => setEditUser({ ...editUser, is_active: e.target.value === 'active' })}
                  style={{ width: '100%', height: 38, padding: '0 10px', border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff', color: '#1e293b', fontSize: 13, fontFamily: 'inherit', outline: 'none' }}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <button
                onClick={() => setEditUser(null)}
                style={{ flex: 1, height: 38, borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdate(editUser.id, {
                  role: editUser.role,
                  is_active: editUser.is_active,
                  subscription_tier: editUser.subscription?.tier,
                })}
                disabled={saving === editUser.id}
                style={{ flex: 1, height: 38, borderRadius: 8, border: 'none', background: '#6366f1', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', opacity: saving === editUser.id ? 0.7 : 1 }}
              >
                {saving === editUser.id ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );
}
