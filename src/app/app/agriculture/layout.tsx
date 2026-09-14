'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  label: string;
  href: string;
  exact?: boolean;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/app/agriculture',
    exact: true,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    label: 'Intelligence',
    href: '/app/agriculture/intelligence',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
      </svg>
    ),
  },
  {
    label: 'Farm Data',
    href: '/app/agriculture/data',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3"/>
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
      </svg>
    ),
  },
  {
    label: 'Research',
    href: '/app/agriculture/research',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
  },
  {
    label: 'Reports',
    href: '/app/agriculture/reports',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
];

const bottomNavItems: NavItem[] = [
  {
    label: 'Profile',
    href: '/app/agriculture/profile',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    label: 'Settings',
    href: '/app/agriculture/settings',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
  },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      router.replace('/');
    } catch {
      setSigningOut(false);
    }
  };

  if (loading || !user) {
    return (
      <div style={{ minHeight: '100vh', background: '#0A0C10', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 28, height: 28, border: '2px solid rgba(255,255,255,0.08)', borderTopColor: '#22c55e', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: 500 }}>Loading Intelligence E</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const userInitial = user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U';
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';

  const isActive = (item: NavItem) => {
    if (item.exact) return pathname === item.href;
    return pathname?.startsWith(item.href);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { height: 100%; font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .ie-sidebar {
          position: fixed; top: 0; left: 0; bottom: 0; width: 232px;
          background: #0D1017; border-right: 1px solid rgba(255,255,255,0.06);
          display: flex; flex-direction: column; z-index: 50;
          transition: transform 0.25s cubic-bezier(0.23,1,0.32,1);
        }
        .ie-main {
          margin-left: 232px; min-height: 100vh; background: #0A0C10;
        }
        .ie-topbar {
          height: 52px; border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex; align-items: center; padding: 0 24px; gap: 12px;
          background: #0A0C10; position: sticky; top: 0; z-index: 40;
        }
        .ie-nav-item {
          display: flex; align-items: center; gap: 9px; padding: 8px 10px;
          border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 500;
          transition: all 0.12s; color: rgba(255,255,255,0.45); letter-spacing: -0.01em;
          white-space: nowrap;
        }
        .ie-nav-item:hover { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.8); }
        .ie-nav-item.active { background: rgba(34,197,94,0.10); color: #4ade80; }
        .ie-nav-item.active svg { stroke: #4ade80; }
        .ie-mobile-overlay {
          display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.6);
          z-index: 49; backdrop-filter: blur(2px);
        }
        .ie-menu-btn { display: none; }

        @media (max-width: 768px) {
          .ie-sidebar { transform: translateX(-100%); }
          .ie-sidebar.open { transform: translateX(0); box-shadow: 24px 0 60px rgba(0,0,0,0.5); }
          .ie-main { margin-left: 0; }
          .ie-mobile-overlay.open { display: block; }
          .ie-menu-btn { display: flex; }
        }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh' }}>
        {/* Mobile overlay */}
        <div
          className={`ie-mobile-overlay${sidebarOpen ? ' open' : ''}`}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />

        {/* Sidebar */}
        <aside className={`ie-sidebar${sidebarOpen ? ' open' : ''}`} role="navigation" aria-label="Main navigation">
          {/* Brand */}
          <div style={{ padding: '16px 14px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <Link href="/app/agriculture" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              <div style={{
                width: 30, height: 30, borderRadius: 7, flexShrink: 0,
                background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/>
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </div>
              <div>
                <div style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700, fontSize: 13, letterSpacing: '-0.02em', lineHeight: 1.2 }}>Intelligence E</div>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', marginTop: 1 }}>Agriculture · Earth AI</div>
              </div>
            </Link>
          </div>

          {/* Primary Navigation */}
          <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto' }}>
            <div style={{ marginBottom: 2 }}>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`ie-nav-item${isActive(item) ? ' active' : ''}`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Secondary nav */}
            <div style={{ marginTop: 20, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', padding: '0 10px', marginBottom: 4 }}>
                Account
              </div>
              {bottomNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`ie-nav-item${isActive(item) ? ' active' : ''}`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </div>

            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', padding: '0 10px', marginBottom: 4 }}>
                Earth AI
              </div>
              <Link href="/help" className={`ie-nav-item${pathname?.startsWith('/help') ? ' active' : ''}`} style={{ fontSize: 12.5 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                Help and Docs
              </Link>
              <Link href="/" className="ie-nav-item" style={{ fontSize: 12.5 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                Public Website
              </Link>
            </div>
          </nav>

          {/* User area */}
          <div style={{ padding: '10px 8px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.03)' }}>
              <div style={{
                width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                background: 'linear-gradient(135deg, #22c55e, #15803d)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: 12,
              }}>
                {userInitial}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {userName}
                </div>
                <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  Free Plan
                </div>
              </div>
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                title="Sign out"
                style={{ background: 'none', border: 'none', cursor: signingOut ? 'not-allowed' : 'pointer', color: 'rgba(255,255,255,0.25)', padding: 4, borderRadius: 5, transition: 'color 0.12s', flexShrink: 0 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </button>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="ie-main">
          {/* Top bar */}
          <div className="ie-topbar">
            <button
              className="ie-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', padding: 4, borderRadius: 6, alignItems: 'center', justifyContent: 'center' }}
              aria-label="Toggle navigation"
              aria-expanded={sidebarOpen}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <div style={{ flex: 1 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '3px 10px', borderRadius: 999,
                background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)',
                color: '#4ade80', fontSize: 11, fontWeight: 600, letterSpacing: '0.01em',
              }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ade80' }} />
                Intelligence E Agriculture
              </div>
            </div>
          </div>

          {/* Page content */}
          <div style={{ padding: '24px 28px 56px' }}>
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
