'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteAccountPage() {
  const router = useRouter();
  const [reason, setReason] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (confirmText !== 'DELETE') {
      setStatus('error');
      setMessage('Type DELETE to confirm your request.');
      return;
    }
    setStatus('loading');
    setMessage('');
    try {
      const response = await fetch('/api/account/delete-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not request account deletion.');
      router.replace('/');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Could not request account deletion.');
    }
  };

  return (
    <>
      <style>{`
        .delete-page { max-width: 720px; margin: 0 auto; }
        .delete-card { border: 1px solid #fecaca; border-radius: 14px; background: #fff; padding: 24px; }
        .delete-card h1 { margin: 0; color: #111827; font-size: 28px; letter-spacing: -0.04em; }
        .delete-card p { color: #6b7280; line-height: 1.65; }
        .delete-form { display: grid; gap: 14px; margin-top: 20px; }
        .delete-form label { display: grid; gap: 7px; color: #374151; font-size: 12px; font-weight: 700; }
        .delete-form textarea, .delete-form input { width: 100%; border: 1px solid #d1d5db; border-radius: 10px; padding: 11px 12px; font: inherit; }
        .delete-form textarea { min-height: 120px; resize: vertical; }
        .delete-actions { display: flex; flex-wrap: wrap; gap: 10px; }
        .delete-actions button { min-height: 42px; border-radius: 10px; border: 0; padding: 0 16px; font: inherit; font-weight: 800; cursor: pointer; }
        .delete-primary { background: #991b1b; color: #fff; }
        .delete-secondary { background: #f3f4f6; color: #111827; }
        .delete-message { border: 1px solid #fecaca; border-radius: 10px; background: #fef2f2; color: #991b1b; padding: 10px 12px; font-size: 13px; }
      `}</style>
      <div className="delete-page">
        <div className="delete-card">
          <h1>Delete account</h1>
          <p>Deleting an account is handled as an auditable request so Earth AI can remove user data appropriately and avoid accidental loss. After submitting, you will be signed out and the request will be reviewed for processing.</p>
          <form className="delete-form" onSubmit={submit}>
            <label>Reason, optional<textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Tell us why you are leaving" /></label>
            <label>Type DELETE to confirm<input value={confirmText} onChange={(event) => setConfirmText(event.target.value)} placeholder="DELETE" /></label>
            {message && <div className="delete-message">{message}</div>}
            <div className="delete-actions">
              <button className="delete-primary" disabled={status === 'loading'}>{status === 'loading' ? 'Submitting...' : 'Request account deletion'}</button>
              <button className="delete-secondary" type="button" onClick={() => router.back()}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
