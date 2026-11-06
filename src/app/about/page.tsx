'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getPublicSkyPhoto, isPublicSkyDaytime } from '@/lib/public-sky-background';

export default function AboutPage() {
  const [hour, setHour] = useState(12);
  const [photoIndex, setPhotoIndex] = useState(0);
  const photo = useMemo(() => getPublicSkyPhoto(hour, photoIndex), [hour, photoIndex]);
  const daytime = isPublicSkyDaytime(hour);

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

  const products = useMemo(() => [
    {
      name: 'Intelligence E Agriculture',
      status: 'Learn about Agriculture',
      href: '/agriculture',
      body: 'A specialized agricultural intelligence platform for analysis, research, crop intelligence, risk interpretation, image intelligence, document intelligence, and decision support. Customer access is intended to happen through approved integrations such as Pelit, while the Earth AI web portal is used for internal administration and quality control.',
    },
    {
      name: 'Pelit Farm',
      status: 'Operational Layer',
      href: '/waitlist',
      body: 'A farm management system designed to help farmers and agricultural businesses manage operations, production, records, and financial information. Pelit provides the customer facing operational experience that connects with Intelligence E Agriculture capabilities through secure API integration.',
    },
    {
      name: 'Intelligence E Finance',
      status: 'Coming Soon',
      href: '/finance',
      body: 'A future financial intelligence vertical within the Intelligence E platform. It is planned to provide specialized AI capabilities for financial analysis, market intelligence, economic interpretation, and decision support.',
    },
  ], []);

  const principles = useMemo(() => [
    ['Specialized Intelligence', 'Deep domain focus over broad generality. Each product is built for a specific industry, workflow, and decision environment.'],
    ['Practical Decision Support', 'Intelligence should help people make better decisions, not only produce impressive answers.'],
    ['Data Driven Analysis', 'Insights should be grounded in relevant data, context, and transparent reasoning wherever possible.'],
    ['Responsible AI', 'AI should assist professionals while respecting uncertainty, safety, and the real world impact of decisions.'],
    ['Security and Privacy', 'User data, business data, and integration data must be protected by design.'],
    ['Scalable Technology', 'Earth AI products are built to support future verticals, integrations, and enterprise grade growth.'],
  ], []);

  return (
    <>
      <style>{styles}</style>
      <main
        className="about-root"
        style={{
          '--about-photo': `url(${photo.url})`,
          '--about-overlay': daytime
            ? 'linear-gradient(180deg, rgba(255,255,255,0.68), rgba(255,255,255,0.84))'
            : 'linear-gradient(180deg, rgba(4,7,18,0.68), rgba(4,7,18,0.88))',
          '--text': daytime ? '#101418' : '#f5f7fb',
          '--muted': daytime ? 'rgba(16,20,24,0.72)' : 'rgba(245,247,251,0.76)',
          '--panel': daytime ? 'rgba(255,255,255,0.62)' : 'rgba(255,255,255,0.09)',
          '--button-bg': daytime ? '#101418' : '#f5f7fb',
          '--button-text': daytime ? '#ffffff' : '#101418',
        } as React.CSSProperties}
      >
        <div className="about-bg" role="img" aria-label={photo.alt} />
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
            <Link href="/waitlist" className="about-button">Join Waitlist</Link>
          </nav>

          <section className="hero">
            <p className="kicker">The Company</p>
            <h1>Specialized intelligence for the real world.</h1>
            <p>Earth AI is an artificial intelligence company developing specialized AI products designed to provide practical intelligence for specific industries and domains.</p>
          </section>

          <section className="about-section">
            <p className="kicker">Earth AI</p>
            <h2>The Company</h2>
            <p>Earth AI focuses on building specialized intelligence rather than being a general purpose chatbot. The company believes that the most useful AI deeply understands the domain it operates in, uses the right context, and supports the people who depend on accurate and actionable information.</p>
            <p>Where general AI tools offer broad capability, Earth AI products offer depth. Each product is built around a specific industry, with the goal of making advanced artificial intelligence genuinely useful in real world environments.</p>
          </section>

          <section className="about-section">
            <p className="kicker">Intelligence E</p>
            <h2>The Platform</h2>
            <p>Intelligence E is Earth AI&apos;s vertical intelligence platform. It is designed to deliver domain specific AI capabilities across industries where precision, context, reliability, and security matter most.</p>
            <p>The current Intelligence E focus is Agriculture. Intelligence E Agriculture is now positioned as a platform capability used through approved applications and integrations, with Pelit serving as the customer facing farm management experience. The Earth AI web portal is reserved for internal administration, testing, monitoring, and content control.</p>
          </section>

          <section className="about-section">
            <p className="kicker">Products</p>
            <h2>The Earth AI Ecosystem</h2>
            <p>Earth AI is building a focused ecosystem of specialized products. Each product addresses a distinct need while sharing a common intelligence foundation.</p>
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
            <p className="kicker">Vision</p>
            <h2>Why Earth AI Exists</h2>
            <p>Earth AI aims to make advanced artificial intelligence more useful by applying it to real world industries, organizations, and decision environments. The goal is not to build AI that is impressive in isolation, but AI that is genuinely valuable in the hands of professionals who need reliable domain specific intelligence.</p>
            <p>Agriculture and finance operate in complex, high stakes environments where poor decisions have real consequences. Earth AI is built on the belief that specialized intelligence grounded in domain knowledge, relevant data, and practical workflows is far more valuable than general purpose AI applied broadly.</p>
          </section>

          <section className="about-section">
            <p className="kicker">Principles</p>
            <h2>Product Philosophy</h2>
            <div className="about-grid">
              {principles.map(([title, body]) => (
                <article key={title} className="about-card compact">
                  <h3>{title}</h3>
                  <p>{body}</p>
                </article>
              ))}
            </div>
          </section>

          <div className="about-cta">
            <Link href="/waitlist" className="about-button">Join Waitlist</Link>
            <Link href="/agriculture" className="about-secondary">Learn about Intelligence E Agriculture</Link>
          </div>

          <footer className="about-footer">
            <span>Earth AI. Specialized intelligence for real world industries.</span>
            <span><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></span>
          </footer>
        </div>
      </main>
    </>
  );
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  .about-root { min-height: 100vh; position: relative; overflow-x: hidden; color: var(--text); background: #050816; }
  .about-bg { position: fixed; inset: 0; z-index: 0; background-image: var(--about-overlay), var(--about-photo); background-size: cover; background-position: center; transition: background-image 1.2s ease; }
  .about-shell { position: relative; z-index: 1; min-height: 100vh; padding: 24px clamp(18px, 4vw, 56px) 48px; }
  .about-nav { max-width: 1080px; margin: 0 auto; display: flex; align-items: center; gap: 18px; min-height: 44px; }
  .about-logo { display: inline-flex; align-items: center; gap: 10px; color: inherit; text-decoration: none; font-weight: 800; letter-spacing: -0.03em; }
  .about-logo img { border-radius: 8px; object-fit: cover; }
  .about-nav-links { margin-left: auto; display: flex; align-items: center; gap: 8px; }
  .about-link { color: inherit; text-decoration: none; font-size: 14px; font-weight: 700; opacity: 0.72; padding: 9px 12px; border-radius: 999px; }
  .about-link:hover, .about-link.active { opacity: 1; background: rgba(255,255,255,0.16); }
  .about-button { display: inline-flex; align-items: center; justify-content: center; min-height: 40px; padding: 0 18px; border-radius: 999px; background: var(--button-bg); color: var(--button-text); text-decoration: none; font-size: 14px; font-weight: 800; }
  .hero, .about-section, .about-cta, .about-footer { max-width: 1080px; margin-left: auto; margin-right: auto; }
  .hero { padding: clamp(72px, 12vw, 132px) 0 54px; }
  .about-section { margin-top: 72px; }
  .kicker { margin: 0 0 8px; color: var(--muted); font-size: 12px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; }
  h1, h2 { margin: 0 0 16px; line-height: 1.06; letter-spacing: -0.055em; }
  h1 { max-width: 780px; font-size: clamp(42px, 7vw, 82px); }
  h2 { font-size: clamp(28px, 4vw, 48px); }
  p { max-width: 850px; margin: 0; color: var(--muted); font-size: 16px; line-height: 1.82; }
  p + p { margin-top: 16px; }
  .about-products, .about-grid { display: grid; gap: 14px; margin-top: 24px; }
  .about-products, .about-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .about-card { min-height: 190px; padding: 24px; border: 1px solid rgba(255,255,255,0.22); border-radius: 18px; background: var(--panel); backdrop-filter: blur(22px) saturate(1.2); }
  .about-card.compact { min-height: 150px; }
  .about-card h3 { margin: 0 0 10px; font-size: 17px; letter-spacing: -0.02em; }
  .about-card p { font-size: 14px; line-height: 1.7; }
  .about-card a { display: inline-flex; margin-top: 16px; color: inherit; font-size: 13px; font-weight: 800; text-decoration: none; opacity: 0.78; }
  .about-cta { margin-top: 72px; display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
  .about-secondary { color: inherit; text-decoration: none; font-size: 14px; font-weight: 800; opacity: 0.72; }
  .about-footer { margin-top: 64px; display: flex; justify-content: space-between; gap: 16px; color: var(--muted); font-size: 13px; font-weight: 700; }
  .about-footer a { color: inherit; text-decoration: none; margin-left: 14px; }
  @media (max-width: 980px) { .about-products, .about-grid { grid-template-columns: 1fr; } }
  @media (max-width: 720px) { .about-nav-links { display: none; } .about-footer { flex-direction: column; } .about-footer a { margin: 0 14px 0 0; } }
`;
