'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const DEFAULT_REDIRECT = '/app/agriculture';

function getSafeRedirect(searchParams: ReturnType<typeof useSearchParams>) {
  const redirect = searchParams?.get('redirect') || searchParams?.get('next');
  if (!redirect || !redirect.startsWith('/app/')) return DEFAULT_REDIRECT;
  return redirect;
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signUp, signInWithOAuth, user, loading } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (mounted && !loading && user) router.replace(getSafeRedirect(searchParams));
  }, [mounted, loading, user, router, searchParams]);

  const submitEmailAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setSubmitting(true);

    try {
      const redirectTo = getSafeRedirect(searchParams);
      if (mode === 'signin') {
        await signIn(email, password);
        router.replace(redirectTo);
      } else {
        const result = await signUp(email, password, { fullName });
        if (!result?.session) {
          setNotice('Check your email to verify your account before signing in.');
        } else {
          router.replace(redirectTo);
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const submitOAuth = async (provider: 'google' | 'apple') => {
    setError('');
    setSubmitting(true);
    try {
      await signInWithOAuth(provider, getSafeRedirect(searchParams));
    } catch (err: any) {
      setError(err?.message || `${provider} sign-in is not available yet.`);
      setSubmitting(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div className="auth-loading">
        <div className="auth-spinner" />
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <main className="auth-root">
        <div className="auth-bg" />
        <section className="auth-card" aria-label="Earth AI authentication">
          <Link href="/" className="auth-brand" aria-label="Earth AI home">
            <Image src="/assets/images/h9O7B-1789370942958.jpg" alt="Earth AI logo" width={44} height={44} priority />
            <span>Earth AI</span>
          </Link>

          <div className="auth-heading">
            <p>Intelligence E</p>
            <h1>{mode === 'signin' ? 'Sign in to Intelligence E' : 'Create your account'}</h1>
            <span>Access Intelligence E for Agriculture with your Earth AI account.</span>
          </div>

          <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
            <button type="button" className={mode === 'signin' ? 'active' : ''} onClick={() => { setMode('signin'); setError(''); setNotice(''); }}>Sign in</button>
            <button type="button" className={mode === 'signup' ? 'active' : ''} onClick={() => { setMode('signup'); setError(''); setNotice(''); }}>Create account</button>
          </div>

          <div className="oauth-row">
            <button type="button" onClick={() => submitOAuth('google')} disabled={submitting}>Continue with Google</button>
            <button type="button" onClick={() => submitOAuth('apple')} disabled={submitting}>Continue with Apple</button>
          </div>

          <div className="auth-divider"><span />or use email<span /></div>

          <form onSubmit={submitEmailAuth} className="auth-form">
            {mode === 'signup' && (
              <label>
                Full name
                <input value={fullName} onChange={(event) => setFullName(event.target.value)} autoComplete="name" required placeholder="Your name" />
              </label>
            )}
            <label>
              Email
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required placeholder="you@example.com" />
            </label>
            <label>
              Password
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} minLength={8} required placeholder="Password" />
            </label>

            {error && <div className="auth-error">{error}</div>}
            {notice && <div className="auth-notice">{notice}</div>}

            <button className="auth-submit" type="submit" disabled={submitting}>{submitting ? 'Please wait...' : mode === 'signin' ? 'Sign in' : 'Create account'}</button>
          </form>

          <p className="auth-note">
            Want product updates? <Link href="/waitlist">Join the waitlist</Link> for launch news, discounts, and future Intelligence E releases.
          </p>
          <p className="auth-legal">
            Email sign-up requires verification. OAuth providers must be enabled in Supabase before Google or Apple sign-in can complete.
          </p>
        </section>
      </main>
    </>
  );
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; min-height: 100%; font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .auth-loading { min-height: 100vh; display: grid; place-items: center; background: #050816; }
  .auth-spinner { width: 28px; height: 28px; border-radius: 999px; border: 2px solid rgba(255,255,255,0.16); border-top-color: #fff; animation: spin 0.8s linear infinite; }
  .auth-root { min-height: 100vh; padding: max(28px, env(safe-area-inset-top)) 18px max(28px, env(safe-area-inset-bottom)); display: grid; place-items: center; position: relative; overflow-x: hidden; background: #050816; }
  .auth-bg { position: fixed; inset: 0; background-image: linear-gradient(180deg, rgba(3,7,18,0.46), rgba(3,7,18,0.74)), url(https://images.unsplash.com/photo-1518066000714-58c45f1a2c0a); background-size: cover; background-position: center; }
  .auth-card { width: min(100%, 430px); position: relative; z-index: 1; padding: 26px; border: 1px solid rgba(255,255,255,0.16); border-radius: 18px; background: rgba(10,14,24,0.84); color: #f8fafc; backdrop-filter: blur(20px); box-shadow: 0 24px 70px rgba(0,0,0,0.26); }
  .auth-brand { display: inline-flex; align-items: center; gap: 10px; color: #fff; text-decoration: none; font-size: 15px; font-weight: 700; }
  .auth-brand img { border-radius: 10px; object-fit: cover; }
  .auth-heading { margin: 24px 0; }
  .auth-heading p { margin: 0 0 8px; color: #93c5fd; font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; font-weight: 800; }
  .auth-heading h1 { margin: 0; color: #fff; font-size: 27px; line-height: 1.15; letter-spacing: -0.03em; }
  .auth-heading span { display: block; margin-top: 10px; color: rgba(248,250,252,0.68); font-size: 14px; line-height: 1.55; }
  .auth-tabs { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; padding: 4px; border-radius: 11px; background: rgba(255,255,255,0.07); }
  .auth-tabs button { min-height: 38px; border: 0; border-radius: 8px; background: transparent; color: rgba(248,250,252,0.6); font: inherit; font-size: 13px; font-weight: 700; cursor: pointer; }
  .auth-tabs button.active { background: #fff; color: #0f172a; }
  .oauth-row { display: grid; gap: 9px; margin-top: 16px; }
  .oauth-row button, .auth-submit { min-height: 44px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.18); font: inherit; font-size: 14px; font-weight: 700; cursor: pointer; }
  .oauth-row button { background: rgba(255,255,255,0.08); color: #fff; }
  .oauth-row button:hover { background: rgba(255,255,255,0.13); }
  .auth-divider { display: flex; align-items: center; gap: 12px; margin: 16px 0; color: rgba(248,250,252,0.44); font-size: 12px; font-weight: 700; }
  .auth-divider span { flex: 1; height: 1px; background: rgba(255,255,255,0.12); }
  .auth-form { display: grid; gap: 12px; }
  .auth-form label { display: grid; gap: 7px; color: rgba(248,250,252,0.82); font-size: 12px; font-weight: 700; }
  .auth-form input { width: 100%; height: 44px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.22); background: rgba(2,6,23,0.6); color: #fff; padding: 0 13px; font: inherit; outline: none; }
  .auth-form input:focus { border-color: rgba(147,197,253,0.8); box-shadow: 0 0 0 3px rgba(59,130,246,0.18); }
  .auth-submit { margin-top: 4px; background: #fff; color: #0f172a; border-color: #fff; }
  .auth-submit:disabled, .oauth-row button:disabled { opacity: 0.6; cursor: not-allowed; }
  .auth-error, .auth-notice { border-radius: 10px; padding: 10px 12px; font-size: 13px; line-height: 1.45; }
  .auth-error { border: 1px solid rgba(248,113,113,0.36); background: rgba(127,29,29,0.28); color: #fecaca; }
  .auth-notice { border: 1px solid rgba(134,239,172,0.36); background: rgba(20,83,45,0.28); color: #bbf7d0; }
  .auth-note, .auth-legal { margin: 16px 0 0; color: rgba(248,250,252,0.62); font-size: 13px; line-height: 1.55; text-align: center; }
  .auth-note a, .auth-legal a { color: #bfdbfe; }
  .auth-legal { font-size: 11.5px; color: rgba(248,250,252,0.46); }
  @media (max-width: 460px) { .auth-card { padding: 20px; border-radius: 14px; } .auth-heading h1 { font-size: 24px; } }
`;

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="auth-loading"><div className="auth-spinner" /><style>{styles}</style></div>}>
      <LoginContent />
    </Suspense>
  );
}
