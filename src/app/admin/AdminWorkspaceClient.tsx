'use client';

import type { CSSProperties, FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';

type WorkspaceItem = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  content: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export default function AdminWorkspaceClient({ section, title, description }: { section: string; title: string; description: string }) {
  const [items, setItems] = useState<WorkspaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', description: '', status: 'active', notes: '' });

  const statusOptions = useMemo(() => ['active', 'testing', 'review', 'disabled', 'archived'], []);

  async function loadItems() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/workspace?section=${encodeURIComponent(section)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load records');
      setItems(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load records');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadItems();
  }, [section]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const response = await fetch('/api/admin/workspace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ section, title: form.title, description: form.description, status: form.status, content: { notes: form.notes } }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to save record');
      setItems((current) => [data.item, ...current]);
      setForm({ title: '', description: '', status: 'active', notes: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save record');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ margin: 0, color: 'var(--text, #0f172a)', fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em' }}>{title}</h1>
        <p style={{ color: 'var(--muted, #64748b)', marginTop: 8, maxWidth: 780, lineHeight: 1.7 }}>{description}</p>
      </div>

      {error && <div style={{ marginBottom: 16, padding: 12, borderRadius: 10, border: '1px solid #fecaca', background: '#fef2f2', color: '#b91c1c', fontSize: 13 }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 380px) minmax(0, 1fr)', gap: 18 }}>
        <form onSubmit={submit} style={{ padding: 18, border: '1px solid var(--border, #e5e7eb)', borderRadius: 12, background: 'var(--surface, #fff)', alignSelf: 'start' }}>
          <h2 style={{ margin: '0 0 14px', color: 'var(--text, #0f172a)', fontSize: 15 }}>Add admin record</h2>
          <label style={labelStyle}>Title<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={inputStyle} /></label>
          <label style={labelStyle}>Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={inputStyle}>{statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
          <label style={labelStyle}>Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} style={inputStyle} /></label>
          <label style={labelStyle}>Notes or configuration<textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={6} style={inputStyle} /></label>
          <button disabled={saving} style={buttonStyle}>{saving ? 'Saving...' : 'Save Record'}</button>
        </form>

        <div style={{ display: 'grid', gap: 10 }}>
          {loading ? <div style={emptyStyle}>Loading records...</div> : items.length === 0 ? <div style={emptyStyle}>No records yet. Add the first internal item for this section.</div> : items.map((item) => (
            <article key={item.id} style={{ padding: 16, border: '1px solid var(--border, #e5e7eb)', borderRadius: 12, background: 'var(--surface, #fff)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
                <h3 style={{ margin: 0, color: 'var(--text, #0f172a)', fontSize: 15 }}>{item.title}</h3>
                <span style={{ color: 'var(--muted, #64748b)', fontSize: 12, fontWeight: 800, textTransform: 'uppercase' }}>{item.status}</span>
              </div>
              {item.description && <p style={{ margin: '0 0 10px', color: 'var(--muted, #64748b)', fontSize: 13, lineHeight: 1.6 }}>{item.description}</p>}
              {typeof item.content?.notes === 'string' && item.content.notes && <pre style={{ margin: 0, whiteSpace: 'pre-wrap', color: 'var(--muted, #64748b)', fontSize: 12.5, lineHeight: 1.6 }}>{String(item.content.notes)}</pre>}
              <div style={{ marginTop: 12, color: 'var(--muted, #64748b)', fontSize: 11 }}>Updated {new Date(item.updated_at).toLocaleString()}</div>
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
