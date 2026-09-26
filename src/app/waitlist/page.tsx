'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function WaitlistPage() {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [interest, setInterest] = useState('agriculture');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [feedback, setFeedback] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus('loading');
    setFeedback('');
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, fullName, interest, message }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not join waitlist.');
      setStatus('success');
      setFeedback('You are on the Earth AI waitlist. We will send product updates, launch news, and early access opportunities.');
      setEmail('');
      setFullName('');
      setMessage('');
    } catch (error) {
      setStatus('error');
      setFeedback(error instanceof Error ? error.message : 'Could not join waitlist.');
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        html, body { margin: 0; min-height: 100%; font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .wait-root { min-height: 100vh; color: #fff; background: #050816; position: relative; overflow-x: hidden; }
        .wait-bg { position: fixed; inset: 0; background-image: linear-gradient(180deg, rgba(3,7,18,0.42), rgba(3,7,18,0.72)), url(https://images.unsplash.com/photo-1675210266448-5d6f08ee26b9); background-size: cover; background-position: center; }
        .wait-nav, .wait-main { position: relative; z-index: 1; }
        .wait-nav { display: flex; align-items: center; justify-content: space-between; padding: 22px 5vw; }
        .wait-brand { display: inline-flex; align-items: center; gap: 10px; color: #fff; text-decoration: none; font-weight: 800; }
        .wait-brand img { border-radius: 9px; object-fit: cover; }
        .wait-main { width: min(1080px, calc(100% - 36px)); margin: 0 auto; padding: 54px 0 80px; display: grid; grid-template-columns: minmax(0, 1fr) minmax(340px, 430px); gap: 44px; align-items: center; }
        .wait-copy p:first-child { margin: 0 0 14px; color: #bfdbfe; font-size: 12px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; }
        .wait-copy h1 { margin: 0; font-size: clamp(36px, 5.5vw, 70px); line-height: 1.02; letter-spacing: -0.055em; max-width: 720px; }
        .wait-copy p { color: rgba(255,255,255,0.76); font-size: 16px; line-height: 1.7; max-width: 620px; }
        .wait-points { display: grid; gap: 10px; margin-top: 24px; color: rgba(255,255,255,0.78); font-size: 14px; }
        .wait-point { padding-left: 16px; border-left: 2px solid rgba(191,219,254,0.55); }
        .wait-card { border: 1px solid rgba(255,255,255,0.17); border-radius: 20px; background: rgba(10,14,24,0.84); backdrop-filter: blur(18px); padding: 26px; box-shadow: 0 24px 70px rgba(0,0,0,0.24); }
        .wait-card h2 { margin: 0 0 8px; font-size: 22px; letter-spacing: -0.03em; }
        .wait-card p { margin: 0 0 20px; color: rgba(255,255,255,0.65); font-size: 13px; line-height: 1.55; }
        .wait-form { display: grid; gap: 12px; }
        .wait-form label { display: grid; gap: 7px; color: rgba(255,255,255,0.84); font-size: 12px; font-weight: 700; }
        .wait-form input, .wait-form select, .wait-form textarea { width: 100%; border: 1px solid rgba(255,255,255,0.2); border-radius: 10px; background: rgba(2,6,23,0.62); color: #fff; padding: 12px 13px; font: inherit; outline: none; }
        .wait-form textarea { min-height: 96px; resize: vertical; }
        .wait-form button { min-height: 46px; border: 0; border-radius: 10px; background: #fff; color: #0f172a; font: inherit; font-weight: 800; cursor: pointer; }
        .wait-form button:disabled { opacity: 0.62; cursor: not-allowed; }
        .wait-feedback { border-radius: 10px; padding: 10px 12px; font-size: 13px; line-height: 1.45; }
        .wait-feedback.success { color: #bbf7d0; background: rgba(20,83,45,0.34); border: 1px solid rgba(134,239,172,0.34); }
        .wait-feedback.error { color: #fecaca; background: rgba(127,29,29,0.34); border: 1px solid rgba(248,113,113,0.34); }
        @media (max-width: 860px) { .wait-main { grid-template-columns: 1fr; padding-top: 26px; } }
      `}</style>
      <main className="wait-root">
        <div className="wait-bg" aria-hidden="true" />
        <nav className="wait-nav">
          <Link href="/" className="wait-brand"><Image src="/assets/images/h9O7B-1789370942958.jpg" alt="Earth AI" width={34} height={34} />Earth AI</Link>
          <Link href="/login" style={{ color: '#fff', textDecoration: 'none', fontWeight: 700 }}>Sign in</Link>
        </nav>
        <section className="wait-main">
          <div className="wait-copy">
            <p>Earth AI updates</p>
            <h1>Join the Earth AI waitlist.</h1>
            <p>Join the waitlist for Intelligence E updates, product releases, launch discounts, and future access opportunities across Agriculture, Finance, and Pelit.</p>
            <div className="wait-points">
              <div className="wait-point">Receive Intelligence E for Agriculture product updates.</div>
              <div className="wait-point">Get future Finance and enterprise release news.</div>
              <div className="wait-point">Full farm management and expanded agricultural data capabilities will be available in the Pelit app.</div>
            </div>
          </div>
          <div className="wait-card">
            <h2>Join waitlist</h2>
            <p>Tell us what you are interested in and we will keep you updated as Earth AI products expand.</p>
            <form className="wait-form" onSubmit={submit}>
              <label>Full name<input value={fullName} onChange={(event) => setFullName(event.target.value)} required placeholder="Your name" /></label>
              <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="you@example.com" /></label>
              <label>Interest<select value={interest} onChange={(event) => setInterest(event.target.value)}><option value="agriculture">Intelligence E for Agriculture</option><option value="finance">Intelligence E for Finance</option><option value="pelit">Pelit farm management</option><option value="enterprise">Enterprise partnership</option></select></label>
              <label>Tell us what you want to solve<textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Farm, business, research, or organization needs" /></label>
              {feedback && <div className={`wait-feedback ${status === 'success' ? 'success' : 'error'}`}>{feedback}</div>}
              <button disabled={status === 'loading'}>{status === 'loading' ? 'Joining...' : 'Join waitlist'}</button>
            </form>
          </div>
        </section>
      </main>
    </>
  );
}
