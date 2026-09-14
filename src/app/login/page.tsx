'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, signUp, user, loading } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading && user) {
      const redirect = searchParams?.get('redirect') || '/app/agriculture';
      router.replace(redirect);
    }
  }, [user, loading, mounted, router, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (mode === 'signin') {
        await signIn(email, password);
        router.replace('/app/agriculture');
      } else {
        await signUp(email, password, { fullName });
        router.replace('/app/agriculture');
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Enter your email address above, then click Forgot password.');
      return;
    }
    setResetLoading(true);
    setError('');
    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      });
      if (resetError) throw resetError;
      setResetSent(true);
    } catch (err: any) {
      setError(err?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  if (!mounted || loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #151926 0%, #1c2538 56%, #25344d 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: 28,
          height: 28,
          border: '2px solid rgba(255,255,255,0.08)',
          borderTopColor: 'rgba(255,255,255,0.6)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const inputShellStyle = (fieldName: string): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    height: 46,
    borderRadius: 10,
    border: focusedField === fieldName
      ? '1px solid rgba(255,255,255,0.5)'
      : '1px solid rgba(255,255,255,0.36)',
    background: '#0c0f17',
    padding: '0 14px',
    transition: 'border-color 0.15s',
    gap: 0,
  });

  const inputStyle: React.CSSProperties = {
    flex: 1,
    height: '100%',
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#f6f7fb',
    fontSize: 14.5,
    fontFamily: 'inherit',
    letterSpacing: '-0.005em',
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { height: 100%; font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes earthAuthFadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .earth-auth-input::placeholder { color: rgba(246,247,251,0.38); }
        .earth-auth-input:-webkit-autofill,
        .earth-auth-input:-webkit-autofill:hover,
        .earth-auth-input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px #0c0f17 inset !important;
          -webkit-text-fill-color: #f6f7fb !important;
          caret-color: #f6f7fb;
        }
        .earth-auth-tab {
          flex: 1;
          padding: 7px 0;
          border-radius: 7px;
          border: none;
          cursor: pointer;
          font-family: inherit;
          font-size: 13.5px;
          font-weight: 500;
          letter-spacing: -0.005em;
          transition: all 0.18s;
          background: transparent;
          color: rgba(246,247,251,0.42);
        }
        .earth-auth-tab.active {
          background: rgba(255,255,255,0.08);
          color: #f6f7fb;
        }
        .earth-auth-tab:hover:not(.active) {
          color: rgba(246,247,251,0.7);
        }
        .earth-auth-primary-btn {
          width: 100%;
          height: 46px;
          border-radius: 10px;
          border: none;
          background: #f4f6fa;
          color: #0b0e14;
          font-family: inherit;
          font-size: 14.5px;
          font-weight: 600;
          letter-spacing: -0.005em;
          cursor: pointer;
          transition: background 0.15s, box-shadow 0.15s;
          box-shadow: 0 12px 30px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.65);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .earth-auth-primary-btn:hover:not(:disabled) {
          background: #ffffff;
        }
        .earth-auth-primary-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }
        .earth-auth-back-link {
          color: rgba(246,247,251,0.42);
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: -0.005em;
          transition: color 0.15s;
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }
        .earth-auth-back-link:hover {
          color: rgba(246,247,251,0.72);
        }
        .earth-auth-terms-link {
          color: rgba(246,247,251,0.82);
          text-decoration: underline;
          text-decoration-color: rgba(246,247,251,0.32);
          text-underline-offset: 2px;
          text-decoration-thickness: 1px;
          font-weight: 500;
        }
        .earth-auth-terms-link:hover {
          color: #f6f7fb;
          text-decoration-color: rgba(246,247,251,0.6);
        }
        .earth-auth-switch-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-family: inherit;
          font-size: 13px;
          font-weight: 600;
          color: rgba(246,247,251,0.82);
          text-decoration: underline;
          text-underline-offset: 2px;
          text-decoration-color: rgba(246,247,251,0.32);
          padding: 0;
          transition: color 0.15s;
        }
        .earth-auth-switch-btn:hover {
          color: #f6f7fb;
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #151926 0%, #1c2538 56%, #25344d 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'max(28px, env(safe-area-inset-top)) 24px max(28px, env(safe-area-inset-bottom))',
        fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle radial vignette overlay */}
        <div style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          background: 'radial-gradient(circle at 50% 52%, rgba(8,10,17,0) 0%, rgba(8,10,17,0.12) 38%, rgba(8,10,17,0.62) 100%), linear-gradient(180deg, rgba(7,9,18,0.05) 0%, rgba(7,9,18,0.56) 100%)',
          zIndex: 0,
        }} />

        {/* Auth card */}
        <div style={{
          position: 'relative',
          zIndex: 1,
          width: 'min(100%, 420px)',
          animation: 'earthAuthFadeUp 0.5s cubic-bezier(0.23,1,0.32,1) both',
        }}>
          {/* Logo orb */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: 16,
          }}>
            <Link href="/" style={{ display: 'inline-flex', borderRadius: 8, textDecoration: 'none' }} aria-label="Back to Earth AI home">
              <Image
                src="/assets/images/h9O7B-1789370942958.jpg"
                alt="Earth AI logo"
                width={64}
                height={64}
                priority
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  display: 'block',
                  filter: 'drop-shadow(0 18px 38px rgba(0,0,0,0.24))',
                }}
              />
            </Link>
          </div>

          {/* Heading */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <h1 style={{
              margin: 0,
              color: '#f6f7fb',
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: 0,
              lineHeight: 1.15,
            }}>
              {mode === 'signin' ? 'Sign in to Earth AI' : 'Create your account'}
            </h1>
            <p style={{
              margin: '10px 0 0',
              color: 'rgba(246,247,251,0.58)',
              fontSize: 15,
              lineHeight: 1.45,
              letterSpacing: 0,
              fontWeight: 400,
            }}>
              {mode === 'signin' ?'Intelligence E Agriculture platform' :'Start using Intelligence E Agriculture'}
            </p>
          </div>

          {/* Card */}
          <div style={{
            position: 'relative',
            width: '100%',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20,
            background: '#10141d',
            color: '#f6f7fb',
            boxShadow: '0 24px 70px rgba(0,0,0,0.26)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '32px 28px 28px',
          }}>
            {/* Tab switcher */}
            <div style={{
              display: 'flex',
              width: '100%',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: 10,
              padding: 3,
              marginBottom: 24,
              gap: 2,
            }}>
              <button
                type="button"
                className={`earth-auth-tab${mode === 'signin' ? ' active' : ''}`}
                onClick={() => { setMode('signin'); setError(''); }}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`earth-auth-tab${mode === 'signup' ? ' active' : ''}`}
                onClick={() => { setMode('signup'); setError(''); }}
              >
                Create Account
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {mode === 'signup' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{
                    color: '#f6f7fb',
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: '-0.005em',
                  }}>
                    Full Name
                  </label>
                  <div style={inputShellStyle('fullName')}>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      onFocus={() => setFocusedField('fullName')}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Your full name"
                      required
                      autoComplete="name"
                      className="earth-auth-input"
                      style={inputStyle}
                    />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{
                  color: '#f6f7fb',
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: '-0.005em',
                }}>
                  Email
                </label>
                <div style={inputShellStyle('email')}>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="you@example.com"
                    required
                    autoComplete="email"
                    inputMode="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    className="earth-auth-input"
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{
                    color: '#f6f7fb',
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: '-0.005em',
                  }}>
                    Password
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      disabled={resetLoading}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: resetLoading ? 'not-allowed' : 'pointer',
                        color: resetSent ? '#4ade80' : 'rgba(246,247,251,0.42)',
                        fontSize: 12,
                        fontWeight: 500,
                        letterSpacing: '-0.005em',
                        padding: 0,
                        fontFamily: 'inherit',
                        transition: 'color 0.15s',
                      }}
                    >
                      {resetLoading ? 'Sending...' : resetSent ? 'Reset email sent' : 'Forgot password?'}
                    </button>
                  )}
                </div>
                <div style={inputShellStyle('password')}>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="Password"
                    required
                    minLength={8}
                    autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                    className="earth-auth-input"
                    style={inputStyle}
                  />
                </div>
              </div>

              {error && (
                <div style={{
                  borderRadius: 8,
                  border: '1px solid rgba(202,57,42,0.28)',
                  background: 'rgba(202,57,42,0.10)',
                  padding: '10px 14px',
                  color: '#f87171',
                  fontSize: 13,
                  lineHeight: 1.5,
                  letterSpacing: '-0.005em',
                }}>
                  {error}
                </div>
              )}

              <div style={{ marginTop: 4 }}>
                <button
                  type="submit"
                  disabled={submitting}
                  className="earth-auth-primary-btn"
                >
                  {submitting && (
                    <div style={{
                      width: 15,
                      height: 15,
                      border: '2px solid rgba(11,14,20,0.25)',
                      borderTopColor: '#0b0e14',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                      flexShrink: 0,
                    }} />
                  )}
                  {submitting
                    ? 'Please wait...'
                    : mode === 'signin' ?'Sign In' :'Create Account'}
                </button>
              </div>

              {/* Divider */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '4px 0',
              }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
                <span style={{
                  color: 'rgba(246,247,251,0.38)',
                  fontSize: 12.5,
                  fontWeight: 500,
                  letterSpacing: '0.02em',
                }}>
                  or
                </span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
              </div>

              {/* Switch mode */}
              <div style={{ textAlign: 'center' }}>
                <span style={{
                  color: 'rgba(246,247,251,0.42)',
                  fontSize: 13,
                  fontWeight: 400,
                  letterSpacing: '-0.005em',
                }}>
                  {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
                </span>
                <button
                  type="button"
                  className="earth-auth-switch-btn"
                  onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); }}
                >
                  {mode === 'signin' ? 'Create one' : 'Sign in'}
                </button>
              </div>
            </form>

            {/* Terms */}
            <p style={{
              marginTop: 20,
              color: 'rgba(246,247,251,0.38)',
              fontSize: 11.5,
              fontWeight: 400,
              lineHeight: 1.55,
              textAlign: 'center',
              letterSpacing: '-0.005em',
              maxWidth: 320,
            }}>
              By continuing, you agree to Earth AI's{' '}
              <Link href="/terms" className="earth-auth-terms-link">Terms of Service</Link>
              {' '}and acknowledge the{' '}
              <Link href="/privacy" className="earth-auth-terms-link">Privacy Policy</Link>.
            </p>
          </div>

          {/* Back link */}
          <div style={{ textAlign: 'center', marginTop: 22 }}>
            <Link href="/" className="earth-auth-back-link">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Earth AI
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #151926 0%, #1c2538 56%, #25344d 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: 28,
          height: 28,
          border: '2px solid rgba(255,255,255,0.08)',
          borderTopColor: 'rgba(255,255,255,0.6)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
