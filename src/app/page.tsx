'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface SkyPhoto { url: string; alt: string; }

const daySkyPhotos: SkyPhoto[] = [
  { url: 'https://images.unsplash.com/photo-1675210266448-5d6f08ee26b9', alt: 'Golden sunset with bright clouds' },
  { url: 'https://images.unsplash.com/photo-1669988022776-d3349a323b4a', alt: 'Blue daytime sky with white clouds' },
  { url: 'https://images.unsplash.com/photo-1530178408322-35e0956c6944', alt: 'Pastel sunrise clouds' },
  { url: 'https://images.unsplash.com/photo-1638150927499-23c630720c5f', alt: 'Golden hour cloudscape' },
];

const nightSkyPhotos: SkyPhoto[] = [
  { url: 'https://images.unsplash.com/photo-1518066000714-58c45f1a2c0a', alt: 'Milky Way night sky' },
  { url: 'https://images.unsplash.com/photo-1475274047050-1d0c0975c63e', alt: 'Clear starry night sky' },
  { url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a', alt: 'Deep night star field' },
];

function isDaytime(hour: number) {
  return hour >= 6 && hour < 19;
}

export default function HomePage() {
  const [hour, setHour] = useState(12);
  const [photoIndex, setPhotoIndex] = useState(0);
  const daytime = isDaytime(hour);
  const photos = daytime ? daySkyPhotos : nightSkyPhotos;
  const photo = useMemo(() => photos[photoIndex % photos.length], [photos, photoIndex]);

  useEffect(() => {
    const updateTime = () => setHour(new Date().getHours());
    updateTime();
    const timeTimer = setInterval(updateTime, 60000);
    const photoTimer = setInterval(() => setPhotoIndex((value) => value + 1), 22000);
    return () => {
      clearInterval(timeTimer);
      clearInterval(photoTimer);
    };
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        html, body { margin: 0; min-height: 100%; font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        body { overflow-x: hidden; }
        .home-root { min-height: 100vh; color: #fff; background: #050816; position: relative; overflow-x: hidden; }
        .home-bg { position: fixed; inset: 0; z-index: 0; background-image: linear-gradient(180deg, rgba(3,7,18,0.34), rgba(3,7,18,0.62)), url(${photo.url}); background-size: cover; background-position: center; transition: background-image 1.4s ease; }
        .home-nav, .home-hero, .home-section, .home-footer { position: relative; z-index: 1; }
        .home-nav { display: flex; align-items: center; gap: 18px; padding: 22px 5vw; }
        .brand { display: inline-flex; align-items: center; gap: 10px; color: #fff; text-decoration: none; font-size: 16px; font-weight: 800; }
        .brand img { border-radius: 9px; object-fit: cover; }
        .nav-links { margin-left: auto; display: flex; gap: 6px; align-items: center; }
        .nav-links a { color: rgba(255,255,255,0.82); text-decoration: none; font-size: 13px; font-weight: 700; padding: 8px 11px; border-radius: 999px; }
        .nav-links a:hover { background: rgba(255,255,255,0.11); color: #fff; }
        .nav-cta { background: rgba(255,255,255,0.96); color: #0f172a !important; }
        .home-hero { min-height: calc(100vh - 82px); display: grid; place-items: center; text-align: center; padding: 64px 5vw 110px; }
        .hero-inner { width: min(860px, 100%); }
        .beta-pill { display: inline-flex; align-items: center; min-height: 34px; padding: 0 14px; border: 1px solid rgba(255,255,255,0.2); border-radius: 999px; background: rgba(255,255,255,0.12); color: rgba(255,255,255,0.92); font-size: 12px; font-weight: 800; letter-spacing: 0.06em; text-transform: uppercase; backdrop-filter: blur(12px); }
        .hero-inner h1 { margin: 22px 0 0; font-size: clamp(42px, 7vw, 86px); line-height: 0.98; letter-spacing: -0.06em; }
        .hero-inner p { margin: 24px auto 0; max-width: 650px; color: rgba(255,255,255,0.82); font-size: clamp(16px, 1.7vw, 20px); line-height: 1.65; }
        .hero-actions { margin-top: 34px; display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; }
        .primary, .secondary { min-height: 48px; padding: 0 24px; display: inline-flex; align-items: center; justify-content: center; border-radius: 999px; text-decoration: none; font-size: 15px; font-weight: 800; }
        .primary { background: #fff; color: #0f172a; }
        .secondary { border: 1px solid rgba(255,255,255,0.24); color: #fff; background: rgba(255,255,255,0.08); }
        .home-section { width: min(1080px, calc(100% - 36px)); margin: 0 auto 28px; padding: 34px; border-radius: 22px; background: rgba(6,10,22,0.72); border: 1px solid rgba(255,255,255,0.14); backdrop-filter: blur(18px); }
        .home-section-block { margin-top: 48px; }
        .home-section-block:first-child { margin-top: 0; }
        .home-kicker { margin: 0 0 8px; color: rgba(255,255,255,0.58); font-size: 12px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; }
        .home-section h2, .home-section h3 { margin: 0 0 16px; font-size: clamp(26px, 3vw, 42px); line-height: 1.1; letter-spacing: -0.04em; }
        .home-section h3 { font-size: clamp(24px, 2.6vw, 36px); }
        .home-section p { color: rgba(255,255,255,0.74); line-height: 1.75; font-size: 15.5px; max-width: 850px; }
        .home-section p + p { margin-top: 14px; }
        .about-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; margin-top: 24px; }
        .about-item { padding: 18px; border-radius: 16px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1); }
        .about-item h4 { margin: 0 0 8px; font-size: 16px; }
        .about-item p { margin: 0; font-size: 14px; }
        .about-item a { display: inline-flex; margin-top: 14px; color: #fff; font-size: 13px; font-weight: 800; text-decoration: none; opacity: 0.82; }
        .home-footer { width: min(1080px, calc(100% - 36px)); margin: 0 auto; padding: 36px 0 44px; display: flex; flex-wrap: wrap; gap: 12px; justify-content: space-between; color: rgba(255,255,255,0.62); font-size: 13px; }
        .home-footer a { color: rgba(255,255,255,0.78); text-decoration: none; margin-left: 14px; }
        @media (max-width: 760px) { .nav-links a:not(.nav-cta) { display: none; } .about-grid { grid-template-columns: 1fr; } .home-section { padding: 24px; } }
      `}</style>
      <main className="home-root">
        <div className="home-bg" role="img" aria-label={photo.alt} />
        <nav className="home-nav" aria-label="Earth AI">
          <Link href="/" className="brand"><Image src="/assets/images/h9O7B-1789370942958.jpg" alt="Earth AI logo" width={34} height={34} priority />Earth AI</Link>
          <div className="nav-links">
            <Link href="#about">About</Link>
            <Link href="/agriculture">Agriculture</Link>
            <Link href="/finance">Finance</Link>
            <Link href="/waitlist" className="nav-cta">Join waitlist</Link>
          </div>
        </nav>

        <section className="home-hero">
          <div className="hero-inner">
            <span className="beta-pill">Specialized intelligence for the real world</span>
            <h1>Earth AI builds intelligence for real world industries.</h1>
            <p>Earth AI creates specialized AI products that help people solve complex problems in agriculture, finance, and operations. Intelligence E is our decision intelligence platform, starting with Agriculture and expanding carefully into Finance.</p>
            <div className="hero-actions">
              <Link href="/waitlist" className="primary">Join waitlist</Link>
              <Link href="/login" className="secondary">Try Intelligence E Now</Link>
            </div>
          </div>
        </section>

        <section id="about" className="home-section">
          <div className="home-section-block">
            <p className="home-kicker">The Company</p>
            <h2>Earth AI</h2>
            <p>Earth AI focuses on building specialized intelligence rather than being a general-purpose chatbot. The company believes that the most useful AI is the kind that deeply understands the domain it operates in — trained on the right data, designed for the right decisions, and built for the people who depend on accurate, actionable information.</p>
            <p>Where general AI tools offer broad capability, Earth AI products offer depth. Each product is built around a specific industry, with the goal of making advanced artificial intelligence genuinely useful in real-world environments — not just impressive in a demonstration.</p>
          </div>

          <div className="home-section-block">
            <p className="home-kicker">The Platform</p>
            <h3>Intelligence E</h3>
            <p>Intelligence E is Earth AI&apos;s vertical intelligence platform. It is designed to deliver domain-specific AI capabilities across industries where precision, context, and reliability matter most. Each Intelligence E vertical is a focused product — not a feature — built to serve a specific professional environment.</p>
            <p>The current Intelligence E focus is Agriculture. Other verticals, including Finance, are part of the future roadmap.</p>
          </div>

          <div className="home-section-block">
            <p className="home-kicker">Products</p>
            <h3>The Earth AI Ecosystem</h3>
            <p>Earth AI is building a focused ecosystem of specialized products. Each product addresses a distinct need within its domain.</p>
            <div className="about-grid">
              <article className="about-item"><h4>Intelligence E Agriculture</h4><p>An agricultural intelligence platform designed to help users understand agricultural data, research, risks, markets, production and decision-making. Intelligence E Agriculture provides specialized AI capabilities for farmers, agribusinesses, and agricultural professionals.</p><Link href="/login">Try Intelligence E Now</Link></article>
              <article className="about-item"><h4>Intelligence E Finance</h4><p>A financial intelligence vertical within the Intelligence E platform. Designed to provide specialized AI capabilities for financial analysis, market intelligence, and economic decision-making.</p><Link href="/finance">Coming Soon</Link></article>
              <article className="about-item"><h4>Pelit Farm</h4><p>A farm management platform designed to help farmers and agricultural businesses manage operations, production and financial information. Pelit Farm provides the operational layer that complements Intelligence E Agriculture&apos;s analytical capabilities — giving agricultural businesses a complete view of their operations.</p><Link href="/waitlist">Farm Management</Link></article>
            </div>
          </div>

          <div className="home-section-block">
            <p className="home-kicker">Vision</p>
            <h3>Why Earth AI Exists</h3>
            <p>Earth AI aims to make advanced artificial intelligence more useful by applying it to real-world industries, organizations and decision-making environments. The goal is not to build AI that is impressive in isolation — but AI that is genuinely valuable in the hands of professionals who need reliable, domain-specific intelligence to make better decisions.</p>
            <p>Industries like agriculture and finance operate in complex, high-stakes environments where the cost of poor decisions is real. Earth AI is built on the belief that specialized intelligence — grounded in domain knowledge, trained on relevant data, and designed for specific workflows — is far more valuable than general-purpose AI applied broadly.</p>
          </div>

          <div className="home-section-block">
            <p className="home-kicker">Principles</p>
            <h3>Product Philosophy</h3>
            <p>Every Earth AI product is built around a consistent set of principles that guide how we design, build, and deploy intelligence.</p>
            <div className="about-grid">
              <article className="about-item"><h4>Specialized Intelligence</h4><p>Deep domain focus over broad generality. Each product is built for a specific industry and use case.</p></article>
              <article className="about-item"><h4>Practical Decision Support</h4><p>Intelligence that leads to better decisions — not just information for its own sake.</p></article>
              <article className="about-item"><h4>Data-Driven Analysis</h4><p>Conclusions grounded in data, not assumptions. Rigorous analysis at every layer.</p></article>
              <article className="about-item"><h4>Responsible AI</h4><p>Thoughtful deployment. We consider the implications of AI in high-stakes environments.</p></article>
              <article className="about-item"><h4>Security and Privacy</h4><p>User data is protected. Security is a design requirement, not an afterthought.</p></article>
              <article className="about-item"><h4>Scalable Technology</h4><p>Built to grow with the organizations and industries we serve.</p></article>
            </div>
          </div>
        </section>

        <footer className="home-footer">
          <span>Earth AI. Specialized intelligence for real-world industries.</span>
          <span><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/waitlist">Waitlist</Link></span>
        </footer>
      </main>
    </>
  );
}
