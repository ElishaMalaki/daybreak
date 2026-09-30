'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

type ThemeMode = 'light' | 'dark';
const THEME_STORAGE_KEY = 'earth-ai-theme';

const adminNavItems = [
  ['Overview', '/admin'],
  ['AI Chat Testing', '/admin/intelligence'],
  ['Crop Doctor Testing', '/admin/crop-doctor'],
  ['Image Analysis', '/admin/image-analysis'],
  ['Agricultural Research', '/admin/research'],
  ['AI Prompts', '/admin/prompts'],
  ['Model Selection', '/admin/models'],
  ['Agricultural Knowledge', '/admin/knowledge'],
  ['Documents', '/admin/documents'],
  ['Testing Conversations', '/admin/conversations'],
  ['AI Usage', '/admin/ai-usage'],
  ['AI Costs', '/admin/costs'],
  ['Model Performance', '/admin/performance'],
  ['Error Logs', '/admin/errors'],
  ['Recommendations', '/admin/recommendations'],
  ['Evaluation', '/admin/evaluation'],
  ['Content Management', '/admin/content'],
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>('light');

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
    setTheme(storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  }, []);

  useEffect(() => {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    document.documentElement.dataset.earthAiTheme = theme;
  }, [theme]);

  useEffect(() => {
    if (!loading && !user) router.replace('/login?redirect=/admin');
  }, [user, loading, router]);

  useEffect(() => setSidebarOpen(false), [pathname]);

  if (loading || !user) {
    return <div className="adm-loading"><div /></div>;
  }

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Admin';
  const currentItem = adminNavItems.find(([, href]) => href === '/admin' ? pathname === '/admin' : pathname?.startsWith(href));
  const nextTheme = theme === 'dark' ? 'light' : 'dark';

  return (
    <>
      <style>{styles}</style>
      <div className={`adm-shell theme-${theme}`}>
        <div className={`adm-mobile-overlay${sidebarOpen ? ' open' : ''}`} onClick={() => setSidebarOpen(false)} aria-hidden="true" />
        <aside className={`adm-sidebar${sidebarOpen ? ' open' : ''}`}>
          <div className="adm-brand">
            <img src="/assets/images/h9O7B-1789370942958.jpg" alt="Earth AI" />
            <div><strong>Earth AI</strong><span>Admin Portal</span></div>
          </div>
          <nav className="adm-nav">
            <div className="adm-label">Internal Operations</div>
            {adminNavItems.map(([label, href]) => {
              const active = href === '/admin' ? pathname === '/admin' : pathname?.startsWith(href);
              return <Link key={href} href={href} className={active ? 'active' : ''}>{label}</Link>;
            })}
          </nav>
          <div className="adm-user">
            <div><strong>{userName}</strong><span>Administrator</span></div>
            <button onClick={() => signOut().then(() => router.replace('/login'))}>Sign out</button>
          </div>
        </aside>
        <main className="adm-main">
          <header className="adm-topbar">
            <button className="adm-menu" onClick={() => setSidebarOpen(!sidebarOpen)}>Menu</button>
            <div><strong>{currentItem?.[0] || 'Admin Portal'}</strong><span>Intelligence E Agriculture internal console</span></div>
            <button className="adm-theme" onClick={() => setTheme(nextTheme)}>{theme === 'dark' ? 'Light' : 'Dark'}</button>
          </header>
          <section className="adm-page">{children}</section>
        </main>
      </div>
    </>
  );
}

const styles = `
  *, *::before, *::after { box-sizing: border-box; }
  body { margin: 0; background: #fff; }
  .adm-loading { min-height: 100vh; display: grid; place-items: center; background: #0b0f14; }
  .adm-loading div { width: 30px; height: 30px; border: 2px solid rgba(255,255,255,.12); border-top-color: #22c55e; border-radius: 999px; animation: spin .8s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .adm-shell { --bg:#fff; --surface:#fff; --soft:#f7f7f8; --hover:#ececf1; --text:#111827; --muted:#6b7280; --border:#e5e7eb; display:flex; min-height:100vh; background:var(--bg); color:var(--text); font-family:Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  .adm-shell.theme-dark { --bg:#050507; --surface:rgba(18,19,24,.94); --soft:rgba(13,14,19,.96); --hover:rgba(255,255,255,.08); --text:#f4f4f5; --muted:#a1a1aa; --border:rgba(255,255,255,.1); }
  .adm-shell.theme-dark::before { content:''; position:fixed; inset:0; pointer-events:none; background:radial-gradient(circle at 18% -4%, rgba(115,115,130,.2), transparent 30%), linear-gradient(180deg,#050507,#090a0f 48%,#050507); }
  .adm-sidebar { position:fixed; inset:0 auto 0 0; width:270px; background:var(--soft); border-right:1px solid var(--border); display:flex; flex-direction:column; z-index:50; backdrop-filter:blur(18px); }
  .adm-main { margin-left:270px; min-height:100vh; flex:1; position:relative; z-index:1; }
  .adm-brand { display:flex; align-items:center; gap:10px; padding:15px; border-bottom:1px solid var(--border); }
  .adm-brand img { width:34px; height:34px; border-radius:8px; object-fit:cover; border:1px solid var(--border); }
  .adm-brand strong, .adm-topbar strong { display:block; color:var(--text); font-size:14px; }
  .adm-brand span, .adm-topbar span { display:block; color:var(--muted); font-size:12px; margin-top:1px; }
  .adm-nav { flex:1; overflow-y:auto; padding:12px 10px; }
  .adm-label { padding:0 10px 8px; color:var(--muted); font-size:11px; font-weight:800; letter-spacing:.04em; text-transform:uppercase; }
  .adm-nav a { display:flex; padding:9px 10px; border-radius:8px; color:var(--muted); text-decoration:none; font-size:14px; font-weight:600; }
  .adm-nav a:hover, .adm-nav a.active { background:var(--hover); color:var(--text); }
  .adm-user { padding:12px; border-top:1px solid var(--border); }
  .adm-user div { margin-bottom:10px; }
  .adm-user strong { display:block; color:var(--text); font-size:13px; }
  .adm-user span { color:var(--muted); font-size:11px; }
  .adm-user button, .adm-menu, .adm-theme { border:1px solid var(--border); background:var(--surface); color:var(--text); border-radius:8px; padding:9px 10px; cursor:pointer; font-weight:700; }
  .adm-user button { width:100%; }
  .adm-topbar { height:58px; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; gap:12px; padding:0 24px; background:color-mix(in srgb, var(--surface) 90%, transparent); position:sticky; top:0; z-index:40; backdrop-filter:blur(16px); }
  .adm-menu { display:none; }
  .adm-page { padding:24px 28px 56px; max-width:100%; overflow-x:hidden; }
  .adm-mobile-overlay { display:none; position:fixed; inset:0; background:rgba(17,24,39,.32); z-index:49; }
  @media (max-width:860px) { .adm-sidebar { transform:translateX(-100%); transition:transform .2s ease; } .adm-sidebar.open { transform:translateX(0); } .adm-mobile-overlay.open { display:block; } .adm-main { margin-left:0; } .adm-menu { display:inline-flex; } .adm-topbar { padding:0 16px; } .adm-page { padding:18px 16px 40px; } }
`;
