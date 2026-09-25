'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

type ThemeMode = 'light' | 'dark';

const THEME_STORAGE_KEY = 'earth-ai-theme';

const Icon = ({ children }: { children: React.ReactNode }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const adminNavItems = [
  { label: 'Overview', href: '/admin', exact: true, icon: <Icon><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></Icon> },
  { label: 'Users', href: '/admin/users', icon: <Icon><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></Icon> },
  { label: 'Feature Flags', href: '/admin/features', icon: <Icon><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></Icon> },
  { label: 'AI Usage', href: '/admin/ai-usage', icon: <Icon><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></Icon> },
  { label: 'AI Providers', href: '/admin/ai-providers', icon: <Icon><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></Icon> },
  { label: 'Subscriptions', href: '/admin/subscriptions', icon: <Icon><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></Icon> },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>('light');

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
    if (storedTheme === 'light' || storedTheme === 'dark') {
      setTheme(storedTheme);
      return;
    }
    setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    document.documentElement.dataset.earthAiTheme = theme;
  }, [theme]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?redirect=/admin');
      return;
    }
    if (user) {
      fetch('/api/admin/stats')
        .then((r) => {
          if (r.status === 403 || r.status === 401) {
            setIsAdmin(false);
            router.replace('/app/agriculture');
          } else {
            setIsAdmin(true);
          }
        })
        .catch(() => setIsAdmin(false));
    }
  }, [user, loading, router]);

  useEffect(() => setSidebarOpen(false), [pathname]);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      router.replace('/');
    } catch {
      setSigningOut(false);
    }
  };

  const isActive = (item: { href: string; exact?: boolean }) => item.exact ? pathname === item.href : pathname?.startsWith(item.href);

  if (loading || isAdmin === null) {
    return (
      <div style={{ minHeight: '100vh', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 28, height: 28, border: '2px solid #e5e7eb', borderTopColor: '#111827', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <div style={{ color: '#6b7280', fontSize: 12, fontWeight: 500 }}>Verifying admin access...</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (isAdmin === false) return null;

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin';
  const userInitial = userName[0]?.toUpperCase() || 'A';
  const currentItem = adminNavItems.find((item) => item.exact ? pathname === item.href : pathname?.startsWith(item.href));
  const nextTheme = theme === 'dark' ? 'light' : 'dark';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        html, body { min-height: 100%; font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #ffffff; color: #111827; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .adm-shell { --app-bg: #ffffff; --surface: #ffffff; --surface-soft: #f7f7f8; --surface-hover: #ececf1; --text: #111827; --muted: #6b7280; --muted-strong: #4b5563; --border: #e5e7eb; --danger: #b91c1c; --avatar-bg: #111827; --avatar-text: #ffffff; --shadow: 0 12px 30px rgba(17,24,39,0.10); display: flex; min-height: 100vh; background: var(--app-bg); color: var(--text); }
        .adm-shell.theme-dark { --app-bg: #050507; --surface: rgba(18, 19, 24, 0.94); --surface-soft: rgba(13, 14, 19, 0.96); --surface-hover: rgba(255,255,255,0.08); --text: #f4f4f5; --muted: #a1a1aa; --muted-strong: #d4d4d8; --border: rgba(255,255,255,0.10); --danger: #fca5a5; --avatar-bg: #f4f4f5; --avatar-text: #09090b; --shadow: 0 18px 46px rgba(0,0,0,0.42); }
        .adm-shell.theme-dark::before { content: ''; position: fixed; inset: 0; z-index: 0; pointer-events: none; background: radial-gradient(circle at 18% -4%, rgba(115, 115, 130, 0.20), transparent 30%), radial-gradient(circle at 84% 10%, rgba(86, 100, 120, 0.16), transparent 28%), linear-gradient(180deg, #050507 0%, #090a0f 48%, #050507 100%); }
        .adm-sidebar { position: fixed; inset: 0 auto 0 0; width: 260px; background: var(--surface-soft); border-right: 1px solid var(--border); display: flex; flex-direction: column; z-index: 50; transition: transform 0.2s ease; backdrop-filter: blur(18px); }
        .adm-main { margin-left: 260px; min-height: 100vh; background: transparent; min-width: 0; flex: 1; position: relative; z-index: 1; }
        .adm-topbar { height: 58px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 12px; padding: 0 24px; background: color-mix(in srgb, var(--surface) 90%, transparent); backdrop-filter: blur(16px); position: sticky; top: 0; z-index: 40; }
        .adm-nav-item { display: flex; align-items: center; gap: 10px; min-height: 36px; padding: 8px 10px; border-radius: 8px; color: var(--muted-strong); text-decoration: none; font-size: 14px; font-weight: 500; line-height: 1.2; }
        .adm-nav-item:hover { background: var(--surface-hover); color: var(--text); }
        .adm-nav-item.active { background: var(--surface-hover); color: var(--text); font-weight: 600; }
        .adm-section { padding: 14px 10px 0; }
        .adm-section-label { padding: 0 10px 8px; color: var(--muted); font-size: 11px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; }
        .adm-mobile-overlay { display: none; position: fixed; inset: 0; background: rgba(17,24,39,0.32); z-index: 49; }
        .adm-menu-btn { display: none; }
        .adm-top-btn, .adm-theme-toggle, .adm-mode { border-radius: 8px; border: 1px solid var(--border); background: var(--surface); color: var(--muted-strong); display: flex; align-items: center; justify-content: center; cursor: pointer; font-family: inherit; }
        .adm-top-btn { width: 36px; height: 36px; }
        .adm-top-btn:hover, .adm-theme-toggle:hover { background: var(--surface-hover); color: var(--text); }
        .adm-theme-toggle { height: 38px; gap: 8px; padding: 0 11px; font-size: 12px; font-weight: 700; }
        .adm-theme-toggle svg { width: 15px; height: 15px; }
        .adm-page-pad { padding: 24px 28px 56px; max-width: 100%; overflow-x: hidden; color: var(--text); }
        .adm-page-pad * { max-width: 100%; }
        .adm-page-pad table { min-width: 680px; }
        .adm-page-pad pre, .adm-page-pad code { white-space: pre-wrap; overflow-wrap: anywhere; }
        .adm-page-pad p, .adm-page-pad div, .adm-page-pad span, .adm-page-pad a, .adm-page-pad td, .adm-page-pad th { overflow-wrap: anywhere; }
        .adm-mode { display: inline-flex; gap: 7px; min-height: 32px; padding: 0 10px; font-size: 12px; font-weight: 600; cursor: default; }
        .adm-mode-dot { width: 7px; height: 7px; border-radius: 999px; background: var(--avatar-bg); }
        .theme-dark .adm-page-pad [style*="background: #fff"], .theme-dark .adm-page-pad [style*="background: #ffffff"], .theme-dark .adm-page-pad [style*="backgroundColor: #fff"], .theme-dark .adm-page-pad [style*="backgroundColor: #ffffff"] { background: var(--surface) !important; border-color: var(--border) !important; color: var(--text) !important; }
        .theme-dark .adm-page-pad [style*="background: #f8fafc"], .theme-dark .adm-page-pad [style*="background: #f9fafb"], .theme-dark .adm-page-pad [style*="background: #f7f7f8"] { background: rgba(255,255,255,0.05) !important; }
        .theme-dark .adm-page-pad [style*="border: 1px solid #e5e7eb"], .theme-dark .adm-page-pad [style*="border: 1px solid #e8edf2"] { border-color: var(--border) !important; }
        .theme-dark .adm-page-pad [style*="color: #111827"], .theme-dark .adm-page-pad [style*="color: #0f172a"], .theme-dark .adm-page-pad h1, .theme-dark .adm-page-pad h2, .theme-dark .adm-page-pad h3 { color: var(--text) !important; }
        .theme-dark .adm-page-pad [style*="color: #6b7280"], .theme-dark .adm-page-pad [style*="color: #64748b"], .theme-dark .adm-page-pad [style*="color: #475569"] { color: var(--muted) !important; }
        .theme-dark .adm-page-pad input, .theme-dark .adm-page-pad select, .theme-dark .adm-page-pad textarea { background: rgba(255,255,255,0.06) !important; color: var(--text) !important; border-color: var(--border) !important; }
        @media (max-width: 1180px) {
          .adm-page-pad [style*="grid-template-columns: repeat(5, 1fr)"], .adm-page-pad [style*="grid-template-columns: repeat(4, 1fr)"], .adm-page-pad [style*="grid-template-columns: repeat(3, 1fr)"] { grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)) !important; }
          .adm-page-pad [style*="grid-template-columns: 1fr 300px"], .adm-page-pad [style*="grid-template-columns: 1fr 320px"], .adm-page-pad [style*="grid-template-columns: 1fr 340px"] { grid-template-columns: minmax(0, 1fr) !important; }
        }
        @media (max-width: 860px) {
          .adm-sidebar { transform: translateX(-100%); }
          .adm-sidebar.open { transform: translateX(0); }
          .adm-main { margin-left: 0; }
          .adm-mobile-overlay.open { display: block; }
          .adm-menu-btn { display: flex; }
          .adm-topbar { padding: 0 16px; }
          .adm-page-pad { padding: 18px 16px 40px; }
          .adm-page-pad [style*="grid-template-columns"] { grid-template-columns: minmax(0, 1fr) !important; }
          .adm-page-pad [style*="display: flex"][style*="justify-content: space-between"] { flex-wrap: wrap; }
        }
        @media (max-width: 520px) {
          .adm-topbar { gap: 8px; }
          .adm-mode, .adm-theme-toggle span { display: none; }
          .adm-page-pad { padding: 14px 12px 34px; }
        }
      `}</style>

      <div className={`adm-shell theme-${theme}`}>
        <div className={`adm-mobile-overlay${sidebarOpen ? ' open' : ''}`} onClick={() => setSidebarOpen(false)} aria-hidden="true" />

        <aside className={`adm-sidebar${sidebarOpen ? ' open' : ''}`} role="navigation" aria-label="Admin navigation">
          <div style={{ padding: '14px 14px 12px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img src="/assets/images/h9O7B-1789370942958.jpg" alt="Earth AI" style={{ width: 34, height: 34, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--border)' }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ color: 'var(--text)', fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>Earth AI</div>
                <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 1 }}>Admin Portal</div>
              </div>
            </div>
          </div>

          <nav style={{ flex: 1, overflowY: 'auto', padding: '4px 0 12px' }}>
            <div className="adm-section">
              <div className="adm-section-label">Administration</div>
              {adminNavItems.map((item) => (
                <Link key={item.href} href={item.href} className={`adm-nav-item${isActive(item) ? ' active' : ''}`}>
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="adm-section" style={{ marginTop: 10, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
              <div className="adm-section-label">Application</div>
              <Link href="/app/agriculture" className="adm-nav-item">
                <Icon><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></Icon>
                Back to App
              </Link>
            </div>
          </nav>

          <div style={{ padding: 10, borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: 8, borderRadius: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--avatar-bg)', color: 'var(--avatar-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, flex: '0 0 auto' }}>{userInitial}</div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ color: 'var(--text)', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</div>
                <div style={{ color: 'var(--muted)', fontSize: 11, marginTop: 1 }}>Administrator</div>
              </div>
              <button onClick={handleSignOut} disabled={signingOut} title="Sign out" className="adm-top-btn" style={{ width: 32, height: 32, flex: '0 0 auto' }}>
                <Icon><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></Icon>
              </button>
            </div>
          </div>
        </aside>

        <main className="adm-main">
          <div className="adm-topbar">
            <button className="adm-menu-btn adm-top-btn" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle navigation" aria-expanded={sidebarOpen}>
              <Icon><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></Icon>
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: 'var(--text)', fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>{currentItem?.label || 'Admin Portal'}</div>
              <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 1 }}>Platform administration and control</div>
            </div>
            <button className="adm-theme-toggle" onClick={() => setTheme(nextTheme)} aria-label={`Switch to ${nextTheme} mode`} title={`Switch to ${nextTheme} mode`}>
              <Icon>{theme === 'dark' ? <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></> : <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>}</Icon>
              <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
            <div className="adm-mode"><span className="adm-mode-dot" /> Admin Mode</div>
          </div>
          <div className="adm-page-pad">{children}</div>
        </main>
      </div>
    </>
  );
}
