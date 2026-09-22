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
        <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
        <rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>
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
    label: 'Subscription',
    href: '/app/agriculture/subscription',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
  },
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
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

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
      <div style={{ minHeight: '100vh', background: '#f0f4f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 28, height: 28, border: '2px solid #e2e8f0', borderTopColor: '#16a34a', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <div style={{ color: '#94a3b8', fontSize: 12, fontWeight: 500 }}>Loading Intelligence E</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const userInitial = user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U';
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const userFirstName = userName.split(' ')[0];

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
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }

        .ie-sidebar {
          position: fixed; top: 0; left: 0; bottom: 0; width: 240px;
          background: #ffffff;
          border-right: 1px solid #e8edf2;
          display: flex; flex-direction: column; z-index: 50;
          transition: transform 0.25s cubic-bezier(0.23,1,0.32,1);
          box-shadow: 1px 0 0 0 #f1f5f9;
        }
        .ie-main {
          margin-left: 240px; min-height: 100vh;
          background: #f4f7fb;
        }
        .ie-topbar {
          height: 60px;
          border-bottom: 1px solid #e8edf2;
          display: flex; align-items: center; padding: 0 24px; gap: 12px;
          background: #ffffff;
          position: sticky; top: 0; z-index: 40;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .ie-nav-item {
          display: flex; align-items: center; gap: 9px; padding: 8px 12px;
          border-radius: 8px; text-decoration: none; font-size: 13.5px; font-weight: 500;
          transition: all 0.12s; color: #64748b; letter-spacing: -0.01em;
          white-space: nowrap; margin-bottom: 1px;
        }
        .ie-nav-item:hover { background: #f1f5f9; color: #1e293b; }
        .ie-nav-item.active { background: #f0fdf4; color: #16a34a; font-weight: 600; }
        .ie-nav-item.active svg { stroke: #16a34a; }
        .ie-search-input {
          flex: 1; height: 36px; padding: 0 12px 0 36px;
          border: 1px solid #e2e8f0; border-radius: 8px;
          background: #f8fafc; color: #1e293b; font-size: 13.5px;
          font-family: inherit; outline: none; transition: border-color 0.15s, box-shadow 0.15s;
          max-width: 480px;
        }
        .ie-search-input:focus { border-color: #16a34a; box-shadow: 0 0 0 3px rgba(22,163,74,0.08); background: #fff; }
        .ie-search-input::placeholder { color: #94a3b8; }
        .ie-icon-btn {
          width: 36px; height: 36px; border-radius: 8px; border: 1px solid #e2e8f0;
          background: #f8fafc; display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.12s; color: #64748b; position: relative;
        }
        .ie-icon-btn:hover { background: #f1f5f9; border-color: #cbd5e1; color: #1e293b; }
        .ie-dropdown {
          position: absolute; top: calc(100% + 8px); right: 0;
          background: #fff; border: 1px solid #e2e8f0; border-radius: 10px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.10); min-width: 200px; z-index: 100;
          animation: fadeIn 0.15s ease;
          overflow: hidden;
        }
        .ie-dropdown-item {
          display: flex; align-items: center; gap: 9px; padding: 9px 14px;
          color: #374151; font-size: 13px; font-weight: 500; cursor: pointer;
          text-decoration: none; transition: background 0.1s;
        }
        .ie-dropdown-item:hover { background: #f8fafc; }
        .ie-dropdown-item.danger { color: #dc2626; }
        .ie-dropdown-item.danger:hover { background: #fef2f2; }
        .ie-mobile-overlay {
          display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.3);
          z-index: 49; backdrop-filter: blur(2px);
        }
        .ie-menu-btn { display: none; }
        .ie-notif-dot {
          position: absolute; top: 6px; right: 6px; width: 7px; height: 7px;
          border-radius: 50%; background: #ef4444; border: 1.5px solid #fff;
        }

        @media (max-width: 768px) {
          .ie-sidebar { transform: translateX(-100%); }
          .ie-sidebar.open { transform: translateX(0); box-shadow: 4px 0 24px rgba(0,0,0,0.12); }
          .ie-main { margin-left: 0; }
          .ie-mobile-overlay.open { display: block; }
          .ie-menu-btn { display: flex; }
          .ie-search-wrap { display: none !important; }
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
          <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid #f1f5f9' }}>
            <Link href="/app/agriculture" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
              <div style={{
                width: 36, height: 36, borderRadius: 9, flexShrink: 0, overflow: 'hidden',
                background: '#f0fdf4', border: '1px solid #bbf7d0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {/* Earth AI logo image */}
                <img
                  src="/assets/images/h9O7B-1789370942958.jpg"
                  alt="Earth AI"
                  style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 8 }}
                />
              </div>
              <div>
                <div style={{ color: '#0f172a', fontWeight: 700, fontSize: 14, letterSpacing: '-0.02em', lineHeight: 1.2 }}>Earth AI</div>
                <div style={{ color: '#64748b', fontSize: 11, fontWeight: 500, marginTop: 1 }}>Intelligence E</div>
              </div>
            </Link>
          </div>

          {/* Primary Navigation */}
          <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
            {/* Agriculture section */}
            <div style={{ marginBottom: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px 8px', color: '#94a3b8', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/>
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
                Agriculture
              </div>
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

            {/* Account section */}
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
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

            {/* Help */}
            <div style={{ marginTop: 8 }}>
              <Link href="/help" className={`ie-nav-item${pathname?.startsWith('/help') ? ' active' : ''}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                Help Center
              </Link>
            </div>
          </nav>

          {/* Sidebar footer — promo card + user */}
          <div style={{ padding: '10px 10px 0', borderTop: '1px solid #f1f5f9' }}>
            {/* Promo card */}
            <div style={{
              borderRadius: 10, overflow: 'hidden', marginBottom: 10, position: 'relative',
              background: 'linear-gradient(135deg, #166534 0%, #15803d 60%, #16a34a 100%)',
              padding: '14px 14px 12px',
            }}>
              <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: 700, marginBottom: 3, letterSpacing: '-0.01em' }}>Smarter Agriculture</div>
              <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, lineHeight: 1.45, marginBottom: 8 }}>AI-powered intelligence for better farming decisions.</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#86efac' }} />
                <span style={{ color: '#86efac', fontSize: 10.5, fontWeight: 600 }}>Earth AI</span>
              </div>
            </div>

            {/* User row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '10px 10px 12px', borderRadius: 8 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                background: 'linear-gradient(135deg, #16a34a, #166534)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: 12,
              }}>
                {userInitial}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: '#1e293b', fontSize: 12.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {userName}
                </div>
                <div style={{ color: '#94a3b8', fontSize: 11, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  Free Plan
                </div>
              </div>
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                title="Sign out"
                style={{ background: 'none', border: 'none', cursor: signingOut ? 'not-allowed' : 'pointer', color: '#94a3b8', padding: 4, borderRadius: 5, transition: 'color 0.12s', flexShrink: 0 }}
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
            {/* Mobile menu button */}
            <button
              className="ie-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 4, borderRadius: 6, alignItems: 'center', justifyContent: 'center' }}
              aria-label="Toggle navigation"
              aria-expanded={sidebarOpen}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>

            {/* Search */}
            <div className="ie-search-wrap" style={{ flex: 1, position: 'relative', maxWidth: 480 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                type="text"
                className="ie-search-input"
                placeholder="Search or ask Intelligence E..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </div>

            <div style={{ flex: 1 }} />

            {/* Notifications */}
            <div style={{ position: 'relative' }}>
              <button
                className="ie-icon-btn"
                onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); }}
                aria-label="Notifications"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <span className="ie-notif-dot" />
              </button>
              {notifOpen && (
                <div className="ie-dropdown" style={{ minWidth: 280 }}>
                  <div style={{ padding: '12px 14px 8px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ color: '#0f172a', fontSize: 13, fontWeight: 700 }}>Notifications</div>
                  </div>
                  <div style={{ padding: '20px 14px', textAlign: 'center', color: '#94a3b8', fontSize: 12.5 }}>
                    No new notifications
                  </div>
                </div>
              )}
            </div>

            {/* User menu */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px 5px 6px',
                  borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc',
                  cursor: 'pointer', transition: 'all 0.12s',
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: 7, flexShrink: 0,
                  background: 'linear-gradient(135deg, #16a34a, #166534)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: 12,
                }}>
                  {userInitial}
                </div>
                <span style={{ color: '#1e293b', fontSize: 13, fontWeight: 600 }}>{userFirstName}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              {userMenuOpen && (
                <div className="ie-dropdown">
                  <div style={{ padding: '12px 14px 10px', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ color: '#0f172a', fontSize: 13, fontWeight: 600 }}>{userName}</div>
                    <div style={{ color: '#94a3b8', fontSize: 11.5, marginTop: 2 }}>{user?.email}</div>
                  </div>
                  <Link href="/app/agriculture/profile" className="ie-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                    Profile
                  </Link>
                  <Link href="/app/agriculture/settings" className="ie-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                    </svg>
                    Settings
                  </Link>
                  <div style={{ borderTop: '1px solid #f1f5f9', margin: '4px 0' }} />
                  <button
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className="ie-dropdown-item danger"
                    style={{ width: '100%', background: 'none', border: 'none', fontFamily: 'inherit', textAlign: 'left' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    {signingOut ? 'Signing out...' : 'Sign Out'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Page content */}
          <div style={{ padding: '28px 28px 56px' }}>
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
