'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const adminNavItems = [
  {
    label: 'Overview',
    href: '/admin',
    exact: true,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
        <rect x="14" y="14" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/>
      </svg>
    ),
  },
  {
    label: 'Users',
    href: '/admin/users',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    label: 'Feature Flags',
    href: '/admin/features',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
        <line x1="4" y1="22" x2="4" y2="15"/>
      </svg>
    ),
  },
  {
    label: 'AI Usage',
    href: '/admin/ai-usage',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"/>
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"/>
      </svg>
    ),
  },
  {
    label: 'AI Providers',
    href: '/admin/ai-providers',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <path d="M8 21h8M12 17v4"/>
      </svg>
    ),
  },
  {
    label: 'Subscriptions',
    href: '/admin/subscriptions',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?redirect=/admin');
      return;
    }
    if (user) {
      // Check admin role via API
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

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      router.replace('/');
    } catch {
      setSigningOut(false);
    }
  };

  const isActive = (item: { href: string; exact?: boolean }) => {
    if (item.exact) return pathname === item.href;
    return pathname?.startsWith(item.href);
  };

  if (loading || isAdmin === null) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 28, height: 28, border: '2px solid #1e293b', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
          <div style={{ color: '#64748b', fontSize: 12, fontWeight: 500 }}>Verifying admin access...</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (isAdmin === false) return null;

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin';
  const userInitial = userName[0]?.toUpperCase() || 'A';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { height: 100%; font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }

        .adm-sidebar {
          position: fixed; top: 0; left: 0; bottom: 0; width: 240px;
          background: #0f172a;
          border-right: 1px solid #1e293b;
          display: flex; flex-direction: column; z-index: 50;
          transition: transform 0.25s cubic-bezier(0.23,1,0.32,1);
        }
        .adm-main { margin-left: 240px; min-height: 100vh; background: #f1f5f9; }
        .adm-topbar {
          height: 60px; border-bottom: 1px solid #e2e8f0;
          display: flex; align-items: center; padding: 0 24px; gap: 12px;
          background: #ffffff; position: sticky; top: 0; z-index: 40;
          box-shadow: 0 1px 3px rgba(0,0,0,0.04);
        }
        .adm-nav-item {
          display: flex; align-items: center; gap: 9px; padding: 8px 12px;
          border-radius: 8px; text-decoration: none; font-size: 13.5px; font-weight: 500;
          transition: all 0.12s; color: #94a3b8; letter-spacing: -0.01em;
          white-space: nowrap; margin-bottom: 1px;
        }
        .adm-nav-item:hover { background: #1e293b; color: #e2e8f0; }
        .adm-nav-item.active { background: #1e3a5f; color: #818cf8; font-weight: 600; }
        .adm-nav-item.active svg { stroke: #818cf8; }
        .adm-mobile-overlay {
          display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5);
          z-index: 49; backdrop-filter: blur(2px);
        }
        .adm-menu-btn { display: none; }
        @media (max-width: 768px) {
          .adm-sidebar { transform: translateX(-100%); }
          .adm-sidebar.open { transform: translateX(0); box-shadow: 4px 0 24px rgba(0,0,0,0.3); }
          .adm-main { margin-left: 0; }
          .adm-mobile-overlay.open { display: block; }
          .adm-menu-btn { display: flex; }
        }
      `}</style>

      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <div className={`adm-mobile-overlay${sidebarOpen ? ' open' : ''}`} onClick={() => setSidebarOpen(false)} />

        <aside className={`adm-sidebar${sidebarOpen ? ' open' : ''}`}>
          {/* Brand */}
          <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid #1e293b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 9, flexShrink: 0, overflow: 'hidden',
                background: '#1e293b', border: '1px solid #334155',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <img src="/assets/images/h9O7B-1789370942958.jpg" alt="Earth AI" style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 8 }} />
              </div>
              <div>
                <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: 14, letterSpacing: '-0.02em', lineHeight: 1.2 }}>Earth AI</div>
                <div style={{ color: '#6366f1', fontSize: 11, fontWeight: 600, marginTop: 1, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Admin Panel</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
            <div style={{ padding: '4px 12px 8px', color: '#475569', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Administration
            </div>
            {adminNavItems.map((item) => (
              <Link key={item.href} href={item.href} className={`adm-nav-item${isActive(item) ? ' active' : ''}`}>
                {item.icon}
                {item.label}
              </Link>
            ))}

            <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #1e293b' }}>
              <div style={{ padding: '4px 12px 8px', color: '#475569', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Application
              </div>
              <Link href="/app/agriculture" className="adm-nav-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                  <polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                Back to App
              </Link>
            </div>
          </nav>

          {/* User footer */}
          <div style={{ padding: '10px 10px 14px', borderTop: '1px solid #1e293b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 8, background: '#1e293b' }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 700, fontSize: 12,
              }}>
                {userInitial}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ color: '#f1f5f9', fontSize: 12.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</div>
                <div style={{ color: '#6366f1', fontSize: 11, fontWeight: 600 }}>Administrator</div>
              </div>
              <button
                onClick={handleSignOut}
                disabled={signingOut}
                title="Sign out"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 4, borderRadius: 5 }}
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

        <main className="adm-main">
          <div className="adm-topbar">
            <button
              className="adm-menu-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: 4, borderRadius: 6, alignItems: 'center', justifyContent: 'center' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#0f172a', fontSize: 14, fontWeight: 700 }}>Earth AI Admin Panel</div>
              <div style={{ color: '#94a3b8', fontSize: 11 }}>Platform administration and control</div>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px',
              background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 6,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b' }} />
              <span style={{ color: '#92400e', fontSize: 11, fontWeight: 600 }}>Admin Mode</span>
            </div>
          </div>
          <div style={{ padding: '28px 28px 56px' }}>
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
