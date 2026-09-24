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

const Icon = ({ children }: { children: React.ReactNode }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/app/agriculture', exact: true, icon: <Icon><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></Icon> },
  { label: 'Intelligence', href: '/app/agriculture/intelligence', icon: <Icon><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/></Icon> },
  { label: 'Farm Data', href: '/app/agriculture/data', icon: <Icon><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></Icon> },
  { label: 'Research', href: '/app/agriculture/research', icon: <Icon><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></Icon> },
  { label: 'Reports', href: '/app/agriculture/reports', icon: <Icon><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></Icon> },
];

const bottomNavItems: NavItem[] = [
  { label: 'API Keys', href: '/app/agriculture/api-keys', icon: <Icon><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></Icon> },
  { label: 'Subscription', href: '/app/agriculture/subscription', icon: <Icon><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></Icon> },
  { label: 'Profile', href: '/app/agriculture/profile', icon: <Icon><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></Icon> },
  { label: 'Settings', href: '/app/agriculture/settings', icon: <Icon><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></Icon> },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  useEffect(() => setSidebarOpen(false), [pathname]);

  useEffect(() => {
    if (user) {
      fetch('/api/admin/stats')
        .then((r) => { if (r.ok) setIsAdmin(true); })
        .catch(() => {});
    }
  }, [user]);

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
      <div style={{ minHeight: '100vh', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 28, height: 28, border: '2px solid #e5e7eb', borderTopColor: '#111827', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <div style={{ color: '#6b7280', fontSize: 12, fontWeight: 500 }}>Loading Intelligence E</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const userInitial = user?.user_metadata?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'U';
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User';
  const userFirstName = userName.split(' ')[0];
  const allNavItems = [...navItems, ...bottomNavItems];
  const currentItem = allNavItems.find((item) => item.exact ? pathname === item.href : pathname?.startsWith(item.href));
  const isActive = (item: NavItem) => item.exact ? pathname === item.href : pathname?.startsWith(item.href);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        html, body { min-height: 100%; font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #ffffff; color: #111827; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .ie-sidebar { position: fixed; inset: 0 auto 0 0; width: 260px; background: #f7f7f8; border-right: 1px solid #e5e7eb; display: flex; flex-direction: column; z-index: 50; transition: transform 0.2s ease; }
        .ie-main { margin-left: 260px; min-height: 100vh; background: #ffffff; min-width: 0; }
        .ie-topbar { height: 58px; border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; gap: 12px; padding: 0 24px; background: rgba(255,255,255,0.96); position: sticky; top: 0; z-index: 40; }
        .ie-nav-item { display: flex; align-items: center; gap: 10px; min-height: 36px; padding: 8px 10px; border-radius: 8px; color: #4b5563; text-decoration: none; font-size: 14px; font-weight: 500; line-height: 1.2; }
        .ie-nav-item:hover { background: #ececf1; color: #111827; }
        .ie-nav-item.active { background: #ececf1; color: #111827; font-weight: 600; }
        .ie-nav-section { padding: 14px 10px 0; }
        .ie-section-label { padding: 0 10px 8px; color: #8b8f98; font-size: 11px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; }
        .ie-mobile-overlay { display: none; position: fixed; inset: 0; background: rgba(17,24,39,0.32); z-index: 49; }
        .ie-menu-btn { display: none; }
        .ie-top-btn { width: 36px; height: 36px; border-radius: 8px; border: 1px solid #e5e7eb; background: #fff; color: #4b5563; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .ie-top-btn:hover { background: #f7f7f8; color: #111827; }
        .ie-dropdown { position: absolute; top: calc(100% + 8px); right: 0; min-width: 220px; background: #fff; border: 1px solid #e5e7eb; border-radius: 10px; box-shadow: 0 12px 30px rgba(17,24,39,0.10); overflow: hidden; z-index: 100; }
        .ie-dropdown-item { width: 100%; display: flex; align-items: center; gap: 9px; padding: 10px 14px; color: #374151; font-family: inherit; font-size: 13px; font-weight: 500; text-decoration: none; border: 0; background: transparent; cursor: pointer; text-align: left; }
        .ie-dropdown-item:hover { background: #f7f7f8; }
        .ie-dropdown-item.danger { color: #b91c1c; }
        .ie-page-pad { padding: 24px 28px 56px; max-width: 100%; overflow-x: hidden; }
        .ie-page-pad * { max-width: 100%; }
        .ie-page-pad table { min-width: 680px; }
        .ie-page-pad pre, .ie-page-pad code { white-space: pre-wrap; overflow-wrap: anywhere; }
        .ie-page-pad p, .ie-page-pad div, .ie-page-pad span, .ie-page-pad a, .ie-page-pad td, .ie-page-pad th { overflow-wrap: anywhere; }
        @media (max-width: 1180px) {
          .ie-page-pad [style*="grid-template-columns: repeat(5, 1fr)"] { grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)) !important; }
          .ie-page-pad [style*="grid-template-columns: 1fr 300px"] { grid-template-columns: minmax(0, 1fr) !important; }
        }
        @media (max-width: 860px) {
          .ie-sidebar { transform: translateX(-100%); }
          .ie-sidebar.open { transform: translateX(0); }
          .ie-main { margin-left: 0; }
          .ie-mobile-overlay.open { display: block; }
          .ie-menu-btn { display: flex; }
          .ie-topbar { padding: 0 16px; }
          .ie-page-pad { padding: 18px 16px 40px; }
          .ie-page-pad [style*="grid-template-columns"] { grid-template-columns: minmax(0, 1fr) !important; }
          .ie-page-pad [style*="position: absolute"][style*="right: 24px"] { display: none !important; }
          .ie-page-pad [style*="min-height: 520px"] { min-height: 0 !important; }
          .ie-page-pad [style*="font-size: 28px"] { font-size: 23px !important; }
        }
        @media (max-width: 520px) {
          .ie-topbar { gap: 8px; }
          .ie-topbar button span { display: none; }
          .ie-page-pad { padding: 14px 12px 34px; }
          .ie-page-pad [style*="padding: 28px 28px 24px"] { padding: 22px 18px !important; }
          .ie-page-pad [style*="padding: 20px 22px"] { padding: 16px !important; }
        }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <div className={`ie-mobile-overlay${sidebarOpen ? ' open' : ''}`} onClick={() => setSidebarOpen(false)} aria-hidden="true" />

        <aside className={`ie-sidebar${sidebarOpen ? ' open' : ''}`} role="navigation" aria-label="Main navigation">
          <div style={{ padding: '14px 14px 12px', borderBottom: '1px solid #e5e7eb' }}>
            <Link href="/app/agriculture" style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'inherit', textDecoration: 'none' }}>
              <img src="/assets/images/h9O7B-1789370942958.jpg" alt="Earth AI" style={{ width: 34, height: 34, borderRadius: 8, objectFit: 'cover', border: '1px solid #e5e7eb' }} />
              <div style={{ minWidth: 0 }}>
                <div style={{ color: '#111827', fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>Earth AI</div>
                <div style={{ color: '#6b7280', fontSize: 12, marginTop: 1 }}>Intelligence E</div>
              </div>
            </Link>
          </div>

          <nav style={{ flex: 1, overflowY: 'auto', padding: '4px 0 12px' }}>
            <div className="ie-nav-section">
              <div className="ie-section-label">Agriculture</div>
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className={`ie-nav-item${isActive(item) ? ' active' : ''}`}>
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </div>

            <div className="ie-nav-section" style={{ marginTop: 10, borderTop: '1px solid #e5e7eb', paddingTop: 14 }}>
              <div className="ie-section-label">Workspace</div>
              {bottomNavItems.map((item) => (
                <Link key={item.href} href={item.href} className={`ie-nav-item${isActive(item) ? ' active' : ''}`}>
                  {item.icon}
                  {item.label}
                </Link>
              ))}
              {isAdmin && (
                <Link href="/admin" className="ie-nav-item" style={{ marginTop: 2 }}>
                  <Icon><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></Icon>
                  Admin Panel
                </Link>
              )}
            </div>

            <div className="ie-nav-section" style={{ marginTop: 10, borderTop: '1px solid #e5e7eb', paddingTop: 14 }}>
              <Link href="/help" className={`ie-nav-item${pathname?.startsWith('/help') ? ' active' : ''}`}>
                <Icon><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></Icon>
                Help Center
              </Link>
            </div>
          </nav>

          <div style={{ padding: 10, borderTop: '1px solid #e5e7eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: 8, borderRadius: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: '#111827', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, flex: '0 0 auto' }}>{userInitial}</div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ color: '#111827', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</div>
                <div style={{ color: '#6b7280', fontSize: 11, marginTop: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</div>
              </div>
              <button onClick={handleSignOut} disabled={signingOut} title="Sign out" className="ie-top-btn" style={{ width: 32, height: 32, flex: '0 0 auto' }}>
                <Icon><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></Icon>
              </button>
            </div>
          </div>
        </aside>

        <main className="ie-main">
          <div className="ie-topbar">
            <button className="ie-menu-btn ie-top-btn" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle navigation" aria-expanded={sidebarOpen}>
              <Icon><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></Icon>
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: '#111827', fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>{currentItem?.label || 'Agriculture'}</div>
              <div style={{ color: '#6b7280', fontSize: 12, marginTop: 1 }}>Intelligence E for Agriculture</div>
            </div>
            <div style={{ position: 'relative' }}>
              <button onClick={() => setUserMenuOpen(!userMenuOpen)} style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #e5e7eb', background: '#fff', borderRadius: 8, height: 38, padding: '0 10px 0 5px', cursor: 'pointer', fontFamily: 'inherit' }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: '#111827', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12 }}>{userInitial}</div>
                <span style={{ color: '#111827', fontSize: 13, fontWeight: 600 }}>{userFirstName}</span>
                <Icon><polyline points="6 9 12 15 18 9"/></Icon>
              </button>
              {userMenuOpen && (
                <div className="ie-dropdown">
                  <div style={{ padding: '12px 14px', borderBottom: '1px solid #e5e7eb' }}>
                    <div style={{ color: '#111827', fontSize: 13, fontWeight: 600 }}>{userName}</div>
                    <div style={{ color: '#6b7280', fontSize: 12, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
                  </div>
                  <Link href="/app/agriculture/profile" className="ie-dropdown-item" onClick={() => setUserMenuOpen(false)}>{bottomNavItems[2].icon} Profile</Link>
                  <Link href="/app/agriculture/settings" className="ie-dropdown-item" onClick={() => setUserMenuOpen(false)}>{bottomNavItems[3].icon} Settings</Link>
                  <div style={{ borderTop: '1px solid #e5e7eb', marginTop: 4 }} />
                  <button onClick={handleSignOut} disabled={signingOut} className="ie-dropdown-item danger">
                    <Icon><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></Icon>
                    {signingOut ? 'Signing out...' : 'Sign Out'}
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="ie-page-pad">{children}</div>
        </main>
      </div>
    </>
  );
}
