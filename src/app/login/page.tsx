'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getPublicSkyPhoto, isPublicSkyDaytime } from '@/lib/public-sky-background';

const DEFAULT_REDIRECT = '/app/agriculture';

type AuthMode = 'signin' | 'signup';
type OAuthProvider = 'google' | 'apple';

function getSafeRedirect(searchParams: ReturnType<typeof useSearchParams>) {
  const redirect = searchParams?.get('redirect') || searchParams?.get('next');
  if (!redirect || !redirect.startsWith('/app/')) return DEFAULT_REDIRECT;
  return redirect;
}

function getSafeAuthError(mode: AuthMode) {
  if (mode === 'signin') {
    return 'Unable to sign in. Please check your email and password, then try again.';
  }

  return 'Unable to create your account right now. Please check your details and try again.';
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signUp, signInWithOAuth, user, loading } = useAuth();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hour, setHour] = useState(12);
  const [photoIndex, setPhotoIndex] = useState(0);
  const skyPhoto = useMemo(() => getPublicSkyPhoto(hour, photoIndex), [hour, photoIndex]);
  const daytime = isPublicSkyDaytime(hour);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const updateTime = () => setHour(new Date().getHours());
    updateTime();
    const timeTimer = window.setInterval(updateTime, 60000);
    const photoTimer = window.setInterval(() => setPhotoIndex((value) => value + 1), 22000);
    return () => {
      window.clearInterval(timeTimer);
      window.clearInterval(photoTimer);
    };
  }, []);

  useEffect(() => {
    if (mounted && !loading && user) router.replace(getSafeRedirect(searchParams));
  }, [mounted, loading, user, router, searchParams]);

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError('');
    setNotice('');
  };

  const submitEmailAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setSubmitting(true);

    try {
      const redirectTo = getSafeRedirect(searchParams);
      const cleanEmail = email.trim().toLowerCase();
      const cleanFullName = fullName.trim();

      if (mode === 'signin') {
        await signIn(cleanEmail, password);
        router.replace(redirectTo);
      } else {
        const result = await signUp(cleanEmail, password, { fullName: cleanFullName });
        if (!result?.session) {
          setNotice('Please check your email to verify your account before signing in.');
        } else {
          router.replace(redirectTo);
        }
      }
    } catch {
      setError(getSafeAuthError(mode));
    } finally {
      setSubmitting(false);
    }
  };

  const submitOAuth = async (provider: OAuthProvider) => {
    setError('');
    setNotice('');
    setSubmitting(true);
    try {
      await signInWithOAuth(provider, getSafeRedirect(searchParams));
    } catch {
      setError('Unable to continue with this sign-in option right now. Please try email sign-in.');
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
      <main
        className="auth-root"
        style={{
          '--auth-photo': `'${skyPhoto.url}'`,
          '--auth-overlay': daytime
            ? 'linear-gradient(180deg, rgba(3,7,18,0.34), rgba(3,7,18,0.74))'
            : 'linear-gradient(180deg, rgba(3,7,18,0.58), rgba(3,7,18,0.86))',
        } as React.CSSProperties}
      >
        <div className="auth-bg" role="img" aria-label={skyPhoto.alt} />
        <section className="auth-panel" aria-label="Earth AI sign in">
          <Link href="/" className="auth-brand" aria-label="Earth AI home">
            <Image src="/assets/images/h9O7B-1789370942958.jpg" alt="Earth AI logo" width={40} height={40} priority />
            <span>Earth AI</span>
          </Link>

          <header className="auth-heading">
            <h1>{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h1>
            <p>{mode === 'signin' ? 'Sign in to continue to Intelligence E.' : 'Start using Intelligence E for Agriculture.'}</p>
          </header>

          <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
            <button type="button" className={mode === 'signin' ? 'active' : ''} onClick={() => switchMode('signin')}>Sign in</button>
            <button type="button" className={mode === 'signup' ? 'active' : ''} onClick={() => switchMode('signup')}>Create account</button>
          </div>

          <div className="oauth-grid">
            <button type="button" onClick={() => submitOAuth('google')} disabled={submitting}>Continue with Google</button>
            <button type="button" onClick={() => submitOAuth('apple')} disabled={submitting}>Continue with Apple</button>
          </div>

          <div className="auth-divider"><span />or<span /></div>

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
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} minLength={8} required placeholder="Enter your password" />
            </label>

            {error && <div className="auth-error" role="alert">{error}</div>}
            {notice && <div className="auth-notice" role="status">{notice}</div>}

            <button className="auth-submit" type="submit" disabled={submitting}>
              {submitting ? 'Please wait' : mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <p className="auth-note">
            {mode === 'signin' ? 'New to Earth AI?' : 'Already have an account?'}{' '}
            <button type="button" onClick={() => switchMode(mode === 'signin' ? 'signup' : 'signin')}>
              {mode === 'signin' ? 'Create an account' : 'Sign in'}
            </button>
          </p>

          <p className="auth-footer">
            By continuing, you agree to Earth AI terms and privacy practices.
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
  .auth-bg { position: fixed; inset: 0; background-image: var(--auth-overlay), url(var(--auth-photo)); background-size: cover; background-position: center; transition: background-image 1.2s ease; }
  .auth-panel { width: min(100%, 420px); position: relative; z-index: 1; padding: 26px; border: 1px solid rgba(255,255,255,0.14); border-radius: 16px; background: rgba(9,13,23,0.86); color: #f8fafc; backdrop-filter: blur(18px); box-shadow: 0 24px 70px rgba(0,0,0,0.26); }
  .auth-brand { display: inline-flex; align-items: center; gap: 10px; color: #fff; text-decoration: none; font-size: 15px; font-weight: 700; }
  .auth-brand img { border-radius: 10px; object-fit: cover; }
  .auth-heading { margin: 26px 0 20px; }
  .auth-heading h1 { margin: 0; color: #fff; font-size: 30px; line-height: 1.12; letter-spacing: -0.02em; }
  .auth-heading p { margin: 10px 0 0; color: rgba(248,250,252,0.68); font-size: 14px; line-height: 1.55; }
  .auth-tabs { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; padding: 4px; border-radius: 11px; background: rgba(255,255,255,0.07); }
  .auth-tabs button { min-height: 38px; border: 0; border-radius: 8px; background: transparent; color: rgba(248,250,252,0.62); font: inherit; font-size: 13px; font-weight: 700; cursor: pointer; }
  .auth-tabs button.active { background: #fff; color: #0f172a; }
  .oauth-grid { display: grid; gap: 9px; margin-top: 16px; }
  .oauth-grid button, .auth-submit { min-height: 44px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.18); font: inherit; font-size: 14px; font-weight: 700; cursor: pointer; }
  .oauth-grid button { background: rgba(255,255,255,0.08); color: #fff; }
  .oauth-grid button:hover { background: rgba(255,255,255,0.13); }
  .auth-divider { display: flex; align-items: center; gap: 12px; margin: 16px 0; color: rgba(248,250,252,0.44); font-size: 12px; font-weight: 700; }
  .auth-divider span { flex: 1; height: 1px; background: rgba(255,255,255,0.12); }
  .auth-form { display: grid; gap: 12px; }
  .auth-form label { display: grid; gap: 7px; color: rgba(248,250,252,0.82); font-size: 12px; font-weight: 700; }
  .auth-form input { width: 100%; height: 44px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.22); background: rgba(2,6,23,0.62); color: #fff; padding: 0 13px; font: inherit; outline: none; }
  .auth-form input::placeholder { color: rgba(248,250,252,0.34); }
  .auth-form input:focus { border-color: rgba(147,197,253,0.8); box-shadow: 0 0 0 3px rgba(59,130,246,0.18); }
  .auth-submit { margin-top: 4px; background: #fff; color: #0f172a; border-color: #fff; }
  .auth-submit:disabled, .oauth-grid button:disabled { opacity: 0.6; cursor: not-allowed; }
  .auth-error, .auth-notice { border-radius: 10px; padding: 10px 12px; font-size: 13px; line-height: 1.45; }
  .auth-error { border: 1px solid rgba(248,113,113,0.36); background: rgba(127,29,29,0.28); color: #fecaca; }
  .auth-notice { border: 1px solid rgba(134,239,172,0.36); background: rgba(20,83,45,0.28); color: #bbf7d0; }
  .auth-note, .auth-footer { margin: 16px 0 0; color: rgba(248,250,252,0.62); font-size: 13px; line-height: 1.55; text-align: center; }
  .auth-note button { border: 0; background: transparent; padding: 0; color: #bfdbfe; font: inherit; font-weight: 700; cursor: pointer; }
  .auth-footer { font-size: 11.5px; color: rgba(248,250,252,0.44); }
  @media (max-width: 460px) { .auth-panel { padding: 20px; border-radius: 14px; } .auth-heading h1 { font-size: 26px; } }
`;

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="auth-loading"><div className="auth-spinner" /><style>{styles}</style></div>}>
      <LoginContent />
    </Suspense>
  );
}
