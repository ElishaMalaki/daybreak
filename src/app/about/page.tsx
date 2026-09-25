'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface ThemeConfig {
  label: string;
  image: string;
  imageAlt: string;
  overlay: string;
  text: string;
  muted: string;
  buttonBg: string;
  buttonText: string;
  panelBg: string;
}

const dayTheme: ThemeConfig = {
  label: 'Day',
  image: 'https://images.unsplash.com/photo-1539643973272-3c845cfb223a',
  imageAlt: 'Clear daytime sky with soft white clouds',
  overlay: 'linear-gradient(180deg, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.58) 42%, rgba(255,255,255,0.82) 100%)',
  text: '#101418',
  muted: 'rgba(16,20,24,0.72)',
  buttonBg: '#101418',
  buttonText: '#ffffff',
  panelBg: 'rgba(255,255,255,0.62)',
};

const nightTheme: ThemeConfig = {
  label: 'Night',
  image: 'https://images.unsplash.com/photo-1518066000714-58c45f1a2c0a',
  imageAlt: 'Clear night sky filled with stars',
  overlay: 'linear-gradient(180deg, rgba(4,7,18,0.78) 0%, rgba(4,7,18,0.66) 42%, rgba(4,7,18,0.84) 100%)',
  text: '#f5f7fb',
  muted: 'rgba(245,247,251,0.76)',
  buttonBg: '#f5f7fb',
  buttonText: '#101418',
  panelBg: 'rgba(255,255,255,0.09)',
};

function getThemeForHour(hour: number): ThemeConfig {
  return hour >= 19 || hour < 6 ? nightTheme : dayTheme;
}

export default function AboutPage() {
  const [theme, setTheme] = useState<ThemeConfig>(dayTheme);

  useEffect(() => {
    const updateTheme = () => setTheme(getThemeForHour(new Date().getHours()));
    updateTheme();
    const interval = window.setInterval(updateTheme, 60000);
    return () => window.clearInterval(interval);
  }, []);

  const products = useMemo(() => [
    {
      name: 'Intelligence E Agriculture',
      status: 'Try Intelligence E Now',
      href: '/login',
      body: 'An agricultural intelligence platform designed to help users understand agricultural data, research, risks, markets, production and decision-making. Intelligence E Agriculture provides specialized AI capabilities for farmers, agribusinesses, and agricultural professionals.',
    },
    {
      name: 'Intelligence E Finance',
      status: 'Coming Soon',
      href: '/finance',
      body: 'A financial intelligence vertical within the Intelligence E platform. Designed to provide specialized AI capabilities for financial analysis, market intelligence, and economic decision-making.',
    },
    {
      name: 'Pelit Farm',
      status: 'Farm Management',
      href: '/waitlist',
      body: 'A farm management platform designed to help farmers and agricultural businesses manage operations, production and financial information. Pelit Farm provides the operational layer that complements Intelligence E Agriculture\'s analytical capabilities — giving agricultural businesses a complete view of their operations.',
    },
  ], []);

  const principles = useMemo(() => [
    {
      title: 'Specialized Intelligence',
      body: 'Deep domain focus over broad generality. Each product is built for a specific industry and use case.',
    },
    {
      title: 'Practical Decision Support',
      body: 'Intelligence that leads to better decisions — not just information for its own sake.',
    },
    {
      title: 'Data-Driven Analysis',
      body: 'Conclusions grounded in data, not assumptions. Rigorous analysis at every layer.',
    },
    {
      title: 'Responsible AI',
      body: 'Thoughtful deployment. We consider the implications of AI in high-stakes environments.',
    },
    {
      title: 'Security and Privacy',
      body: 'User data is protected. Security is a design requirement, not an afterthought.',
    },
    {
      title: 'Scalable Technology',
      body: 'Built to grow with the organizations and industries we serve.',
    },
  ], []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        html, body { margin: 0; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .about-root { min-height: 100vh; position: relative; overflow-x: hidden; color: var(--text); }
        .about-bg { position: fixed; inset: 0; z-index: 0; background-size: cover; background-position: center; transition: background-image 1.2s ease; }
        .about-overlay { position: fixed; inset: 0; z-index: 1; pointer-events: none; }
        .about-shell { position: relative; z-index: 2; min-height: 100vh; padding: 24px clamp(18px, 4vw, 56px) 48px; }
        .about-nav { display: flex; align-items: center; gap: 18px; min-height: 44px; }
        .about-logo { display: inline-flex; align-items: center; gap: 10px; color: inherit; text-decoration: none; font-weight: 800; letter-spacing: -0.03em; }
        .about-logo img { border-radius: 8px; }
        .about-nav-links { margin-left: auto; display: flex; align-items: center; gap: 8px; }
        .about-link { color: inherit; text-decoration: none; font-size: 14px; font-weight: 700; opacity: 0.72; padding: 9px 12px; border-radius: 999px; }
        .about-link:hover, .about-link.active { opacity: 1; background: rgba(255,255,255,0.16); }
        .about-button { display: inline-flex; align-items: center; justify-content: center; min-height: 40px; padding: 0 18px; border-radius: 999px; text-decoration: none; font-size: 14px; font-weight: 800; }
        .about-main { max-width: 1080px; margin: 0 auto; padding: clamp(56px, 8vw, 104px) 0 56px; }
        .about-section { margin-top: 72px; }
        .about-section:first-child { margin-top: 0; }
        .about-kicker { margin: 0 0 8px; color: var(--muted); font-size: 12px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; }
        .about-section h1, .about-section h2 { margin: 0 0 16px; font-size: clamp(28px, 4vw, 48px); line-height: 1.08; letter-spacing: -0.045em; }
        .about-section p { max-width: 820px; margin: 0; color: var(--muted); font-size: 16px; line-height: 1.82; }
        .about-section p + p { margin-top: 16px; }
        .about-products, .about-grid { display: grid; gap: 14px; margin-top: 24px; }
        .about-products { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .about-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .about-card { min-height: 172px; padding: 24px; border: 1px solid rgba(255,255,255,0.22); border-radius: 18px; background: var(--panel); backdrop-filter: blur(22px) saturate(1.2); }
        .about-card h3 { margin: 0 0 10px; font-size: 17px; letter-spacing: -0.02em; }
        .about-card p { font-size: 14px; line-height: 1.7; }
        .about-card a { display: inline-flex; margin-top: 16px; color: inherit; font-size: 13px; font-weight: 800; text-decoration: none; opacity: 0.78; }
        .about-cta { margin-top: 72px; display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
        .about-secondary { color: inherit; text-decoration: none; font-size: 14px; font-weight: 800; opacity: 0.72; }
        .about-footer { max-width: 1080px; margin: 0 auto; display: flex; justify-content: space-between; gap: 16px; color: var(--muted); font-size: 13px; font-weight: 700; }
        .about-footer a { color: inherit; text-decoration: none; margin-left: 14px; }
        @media (max-width: 980px) { .about-products, .about-grid { grid-template-columns: 1fr; } }
        @media (max-width: 720px) {
          .about-nav-links { display: none; }
          .about-footer { flex-direction: column; }
          .about-footer a { margin: 0 14px 0 0; }
        }
      `}</style>

      <div
        className="about-root"
        style={{
          '--text': theme.text,
          '--muted': theme.muted,
          '--panel': theme.panelBg,
        } as React.CSSProperties}
      >
        <div className="about-bg" style={{ backgroundImage: `url(${theme.image})` }} role="img" aria-label={theme.imageAlt} />
        <div className="about-overlay" style={{ background: theme.overlay }} aria-hidden="true" />

        <div className="about-shell">
          <nav className="about-nav" aria-label="Earth AI navigation">
            <Link href="/" className="about-logo" aria-label="Earth AI home">
              <Image src="/assets/images/h9O7B-1789370942958.jpg" alt="Earth AI logo" width={30} height={30} />
              <span>Earth AI</span>
            </Link>
            <div className="about-nav-links">
              <Link href="/about" className="about-link active">About</Link>
              <Link href="/agriculture" className="about-link">Agriculture</Link>
              <Link href="/finance" className="about-link">Finance</Link>
            </div>
            <Link href="/waitlist" className="about-button" style={{ background: theme.buttonBg, color: theme.buttonText }}>Join Waitlist</Link>
          </nav>

          <main className="about-main">
            <section className="about-section">
              <p className="about-kicker">The Company</p>
              <h1>Earth AI</h1>
              <p>
                Earth AI focuses on building specialized intelligence rather than being a general-purpose chatbot. The company believes that the most useful AI is the kind that deeply understands the domain it operates in — trained on the right data, designed for the right decisions, and built for the people who depend on accurate, actionable information.
              </p>
              <p>
                Where general AI tools offer broad capability, Earth AI products offer depth. Each product is built around a specific industry, with the goal of making advanced artificial intelligence genuinely useful in real-world environments — not just impressive in a demonstration.
              </p>
            </section>

            <section className="about-section">
              <p className="about-kicker">The Platform</p>
              <h2>Intelligence E</h2>
              <p>
                Intelligence E is Earth AI&apos;s vertical intelligence platform. It is designed to deliver domain-specific AI capabilities across industries where precision, context, and reliability matter most. Each Intelligence E vertical is a focused product — not a feature — built to serve a specific professional environment.
              </p>
              <p>
                The current Intelligence E focus is Agriculture. Other verticals, including Finance, are part of the future roadmap.
              </p>
            </section>

            <section className="about-section">
              <p className="about-kicker">Products</p>
              <h2>The Earth AI Ecosystem</h2>
              <p>
                Earth AI is building a focused ecosystem of specialized products. Each product addresses a distinct need within its domain.
              </p>
              <div className="about-products">
                {products.map((product) => (
                  <article key={product.name} className="about-card">
                    <h3>{product.name}</h3>
                    <p>{product.body}</p>
                    <Link href={product.href}>{product.status}</Link>
                  </article>
                ))}
              </div>
            </section>

            <section className="about-section">
              <p className="about-kicker">Vision</p>
              <h2>Why Earth AI Exists</h2>
              <p>
                Earth AI aims to make advanced artificial intelligence more useful by applying it to real-world industries, organizations and decision-making environments. The goal is not to build AI that is impressive in isolation — but AI that is genuinely valuable in the hands of professionals who need reliable, domain-specific intelligence to make better decisions.
              </p>
              <p>
                Industries like agriculture and finance operate in complex, high-stakes environments where the cost of poor decisions is real. Earth AI is built on the belief that specialized intelligence — grounded in domain knowledge, trained on relevant data, and designed for specific workflows — is far more valuable than general-purpose AI applied broadly.
              </p>
            </section>

            <section className="about-section">
              <p className="about-kicker">Principles</p>
              <h2>Product Philosophy</h2>
              <p>
                Every Earth AI product is built around a consistent set of principles that guide how we design, build, and deploy intelligence.
              </p>
              <div className="about-grid">
                {principles.map((principle) => (
                  <article key={principle.title} className="about-card">
                    <h3>{principle.title}</h3>
                    <p>{principle.body}</p>
                  </article>
                ))}
              </div>
            </section>

            <div className="about-cta">
              <Link href="/login" className="about-button" style={{ background: theme.buttonBg, color: theme.buttonText }}>Try Intelligence E Now</Link>
              <Link href="/agriculture" className="about-secondary">Learn about Intelligence E Agriculture</Link>
            </div>
          </main>

          <footer className="about-footer">
            <span>Earth AI. Specialized intelligence for real-world industries.</span>
            <span>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
            </span>
          </footer>
        </div>
      </div>
    </>
  );
}
