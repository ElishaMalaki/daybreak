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
  overlay: 'linear-gradient(180deg, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.58) 42%, rgba(255,255,255,0.80) 100%)',
  text: '#101418',
  muted: 'rgba(16,20,24,0.72)',
  buttonBg: '#101418',
  buttonText: '#ffffff',
  panelBg: 'rgba(255,255,255,0.58)',
};

const nightTheme: ThemeConfig = {
  label: 'Night',
  image: 'https://images.unsplash.com/photo-1518066000714-58c45f1a2c0a',
  imageAlt: 'Clear night sky filled with stars',
  overlay: 'linear-gradient(180deg, rgba(4,7,18,0.76) 0%, rgba(4,7,18,0.66) 42%, rgba(4,7,18,0.82) 100%)',
  text: '#f5f7fb',
  muted: 'rgba(245,247,251,0.74)',
  buttonBg: '#f5f7fb',
  buttonText: '#101418',
  panelBg: 'rgba(255,255,255,0.08)',
};

function getThemeForHour(hour: number): ThemeConfig {
  return hour >= 19 || hour < 6 ? nightTheme : dayTheme;
}

export default function AboutPage() {
  const [theme, setTheme] = useState<ThemeConfig>(dayTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const updateTheme = () => {
      setTheme(getThemeForHour(new Date().getHours()));
      setMounted(true);
    };

    updateTheme();
    const interval = window.setInterval(updateTheme, 60000);
    return () => window.clearInterval(interval);
  }, []);

  const values = useMemo(() => [
    {
      title: 'Domain Expertise',
      body: 'We design intelligence around the realities of specific industries, their workflows, risks, terminology, and decision requirements.',
    },
    {
      title: 'Responsible AI',
      body: 'We treat AI as a decision-support layer. Critical business logic, calculations, and accountability remain outside the model.',
    },
    {
      title: 'Security and Trust',
      body: 'We build with privacy, access control, data isolation, and operational reliability as core requirements from the beginning.',
    },
    {
      title: 'Practical Outcomes',
      body: 'Our products are measured by their ability to help people understand information, reduce uncertainty, and make better decisions.',
    },
  ], []);

  const products = useMemo(() => [
    {
      name: 'Intelligence E for Agriculture',
      status: 'Private beta',
      body: 'A specialized agricultural intelligence platform for farmers, agribusinesses, cooperatives, researchers, and agricultural professionals. It supports agricultural guidance, crop intelligence, pest and disease analysis, research assistance, reporting, and document or photo intelligence.',
    },
    {
      name: 'Pelit Farm',
      status: 'Farm management system',
      body: 'A farm management platform that provides the operational agriculture data model and management workflows that complement Intelligence E. Full farm-management capability is planned to live in Pelit Farm.',
    },
    {
      name: 'Intelligence E for Finance',
      status: 'Planned vertical',
      body: 'A future financial intelligence platform focused on analysis, explanation, forecasting, reporting, and decision support. It is intended to remain separate from accounting engines and financial calculation systems.',
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
        .about-main { max-width: 1080px; margin: 0 auto; padding: clamp(70px, 10vw, 130px) 0 56px; }
        .about-eyebrow { display: inline-flex; align-items: center; gap: 8px; margin-bottom: 24px; padding: 7px 13px; border: 1px solid rgba(255,255,255,0.24); border-radius: 999px; background: var(--panel); backdrop-filter: blur(18px); font-size: 12px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; }
        .about-title { max-width: 860px; margin: 0; font-size: clamp(42px, 7vw, 86px); line-height: 0.98; letter-spacing: -0.065em; font-weight: 800; }
        .about-lead { max-width: 760px; margin: 28px 0 0; color: var(--muted); font-size: clamp(17px, 2vw, 22px); line-height: 1.65; font-weight: 500; }
        .about-section { margin-top: 72px; }
        .about-section h2 { margin: 0 0 16px; font-size: clamp(26px, 3vw, 38px); line-height: 1.12; letter-spacing: -0.04em; }
        .about-section p { max-width: 780px; margin: 0; color: var(--muted); font-size: 16px; line-height: 1.8; }
        .about-section p + p { margin-top: 16px; }
        .about-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; margin-top: 24px; }
        .about-card { min-height: 170px; padding: 24px; border: 1px solid rgba(255,255,255,0.22); border-radius: 18px; background: var(--panel); backdrop-filter: blur(22px) saturate(1.2); }
        .about-card h3 { margin: 0 0 9px; font-size: 17px; letter-spacing: -0.02em; }
        .about-card p { font-size: 14px; line-height: 1.7; }
        .about-products { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; margin-top: 24px; }
        .about-product { padding: 24px; border: 1px solid rgba(255,255,255,0.22); border-radius: 18px; background: var(--panel); backdrop-filter: blur(22px) saturate(1.2); }
        .about-product span { display: inline-flex; margin-bottom: 14px; font-size: 11px; font-weight: 800; letter-spacing: 0.10em; text-transform: uppercase; opacity: 0.72; }
        .about-product h3 { margin: 0 0 10px; font-size: 18px; letter-spacing: -0.025em; }
        .about-product p { font-size: 14px; line-height: 1.7; }
        .about-cta { margin-top: 72px; display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
        .about-secondary { color: inherit; text-decoration: none; font-size: 14px; font-weight: 800; opacity: 0.72; }
        .about-footer { max-width: 1080px; margin: 0 auto; display: flex; justify-content: space-between; gap: 16px; color: var(--muted); font-size: 13px; font-weight: 700; }
        .about-footer a { color: inherit; text-decoration: none; margin-left: 14px; }
        @media (max-width: 900px) { .about-products { grid-template-columns: 1fr; } }
        @media (max-width: 720px) {
          .about-nav-links { display: none; }
          .about-grid { grid-template-columns: 1fr; }
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
            <div className="about-eyebrow">About Us</div>
            <h1 className="about-title">Building specialized intelligence for essential industries.</h1>
            <p className="about-lead">
              Earth AI is a technology company developing domain-specific artificial intelligence products for real-world industries. Our work focuses on practical intelligence systems that help professionals analyze information, understand risk, and make better decisions.
            </p>

            <section className="about-section">
              <h2>Who We Are</h2>
              <p>
                Earth AI was founded to make artificial intelligence more useful, reliable, and relevant for industries where decisions have operational, financial, and human impact. We believe the strongest AI products are not generic tools, but focused systems designed around the data, workflows, constraints, and responsibilities of a specific domain.
              </p>
              <p>
                Our first product vertical is Intelligence E for Agriculture, a specialized agricultural intelligence platform for farmers, agribusinesses, cooperatives, researchers, and agricultural professionals. Earth AI is also preparing additional Intelligence E verticals, including Finance, as part of a broader long-term platform strategy.
              </p>
            </section>

            <section className="about-section">
              <h2>Our Mission</h2>
              <p>
                Our mission is to provide specialized intelligence that helps people solve practical problems, reduce uncertainty, and act with greater confidence. We build AI systems that support professional judgment rather than replace it.
              </p>
            </section>

            <section className="about-section">
              <h2>Our Products</h2>
              <p>
                Earth AI develops focused products under a shared intelligence platform. Each product is designed with clear boundaries, secure infrastructure, and a specific professional purpose.
              </p>
              <div className="about-products">
                {products.map((product) => (
                  <article key={product.name} className="about-product">
                    <span>{product.status}</span>
                    <h3>{product.name}</h3>
                    <p>{product.body}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="about-section">
              <h2>How We Work</h2>
              <p>
                Earth AI is built around responsible product architecture, secure data handling, and long-term maintainability. Our systems are designed so that AI assists analysis, explanation, forecasting, research, and decision support while critical calculations and business logic remain deterministic and auditable.
              </p>
              <div className="about-grid">
                {values.map((value) => (
                  <article key={value.title} className="about-card">
                    <h3>{value.title}</h3>
                    <p>{value.body}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="about-section">
              <h2>Our Commitment</h2>
              <p>
                We are committed to building Earth AI as a professional, secure, and scalable SaaS platform. As our products grow, our priority remains the same: deliver useful intelligence that respects the complexity of the industries we serve and the trust of the people who use our systems.
              </p>
            </section>

            <div className="about-cta">
              <Link href="/waitlist" className="about-button" style={{ background: theme.buttonBg, color: theme.buttonText }}>Join Waitlist</Link>
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
