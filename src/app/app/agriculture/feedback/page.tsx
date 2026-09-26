'use client';

import React, { useState } from 'react';

export default function FeedbackPage() {
  const [type, setType] = useState('feedback');
  const [severity, setSeverity] = useState('normal');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus('loading');
    setMessage('');
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, severity, title, description, pagePath: window.location.pathname }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not submit report.');
      setStatus('success');
      setMessage('Thank you. Your report has been submitted to Earth AI.');
      setTitle('');
      setDescription('');
    } catch (error) {
      setStatus('error');
      setMessage(error instanceof Error ? error.message : 'Could not submit report.');
    }
  };

  return (
    <>
      <style>{`
        .feedback-page { max-width: 760px; margin: 0 auto; }
        .feedback-header { margin-bottom: 22px; }
        .feedback-header h1 { margin: 0; color: #111827; font-size: 28px; letter-spacing: -0.04em; }
        .feedback-header p { color: #6b7280; line-height: 1.65; max-width: 620px; }
        .feedback-card { border: 1px solid #e5e7eb; border-radius: 14px; background: #fff; padding: 22px; box-shadow: 0 1px 3px rgba(17,24,39,0.04); }
        .feedback-form { display: grid; gap: 14px; }
        .feedback-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .feedback-form label { display: grid; gap: 7px; color: #374151; font-size: 12px; font-weight: 700; }
        .feedback-form input, .feedback-form select, .feedback-form textarea { width: 100%; border: 1px solid #d1d5db; border-radius: 10px; background: #fff; color: #111827; padding: 11px 12px; font: inherit; outline: none; }
        .feedback-form textarea { min-height: 150px; resize: vertical; }
        .feedback-form input:focus, .feedback-form select:focus, .feedback-form textarea:focus { border-color: #111827; box-shadow: 0 0 0 3px rgba(17,24,39,0.08); }
        .feedback-form button { min-height: 44px; border: 0; border-radius: 10px; background: #111827; color: #fff; font: inherit; font-weight: 800; cursor: pointer; }
        .feedback-form button:disabled { opacity: 0.62; cursor: not-allowed; }
        .feedback-message { border-radius: 10px; padding: 10px 12px; font-size: 13px; }
        .feedback-message.success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; }
        .feedback-message.error { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; }
        @media (max-width: 640px) { .feedback-row { grid-template-columns: 1fr; } .feedback-card { padding: 18px; } }
      `}</style>
      <div className="feedback-page">
        <div className="feedback-header">
          <h1>Feedback and bug reports</h1>
          <p>Report bugs, errors, issues, or suggestions. This helps improve Intelligence E and gives admins a clean record to review.</p>
        </div>
        <div className="feedback-card">
          <form className="feedback-form" onSubmit={submit}>
            <div className="feedback-row">
              <label>Type<select value={type} onChange={(event) => setType(event.target.value)}><option value="feedback">Feedback</option><option value="bug">Bug</option><option value="error">Error</option><option value="suggestion">Suggestion</option></select></label>
              <label>Severity<select value={severity} onChange={(event) => setSeverity(event.target.value)}><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="critical">Critical</option></select></label>
            </div>
            <label>Title<input value={title} onChange={(event) => setTitle(event.target.value)} required placeholder="Short summary" /></label>
            <label>Description<textarea value={description} onChange={(event) => setDescription(event.target.value)} required placeholder="What happened? What did you expect?" /></label>
            {message && <div className={`feedback-message ${status === 'success' ? 'success' : 'error'}`}>{message}</div>}
            <button disabled={status === 'loading'}>{status === 'loading' ? 'Submitting...' : 'Submit report'}</button>
          </form>
        </div>
      </div>
    </>
  );
}
