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
        .home-section h2 { margin: 0; font-size: clamp(26px, 3vw, 42px); line-height: 1.1; letter-spacing: -0.04em; }
        .home-section p { color: rgba(255,255,255,0.74); line-height: 1.75; font-size: 15.5px; }
        .about-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; margin-top: 24px; }
        .about-item { padding: 18px; border-radius: 16px; background: rgba(255,255,255,0.08); }
        .about-item h3 { margin: 0 0 8px; font-size: 16px; }
        .about-item p { margin: 0; font-size: 14px; }
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
          <h2>About Earth AI</h2>
          <p>Earth AI is being built as a practical intelligence company, not a generic chatbot company. Our products combine structured data, AI analysis, document and photo intelligence, usage controls, and secure workflows so users can make better decisions with confidence.</p>
          <p>Intelligence E for Agriculture helps farmers, agribusinesses, cooperatives, researchers, and agricultural professionals understand risks, crops, markets, reports, photos, documents, and recommendations. Full farm management and the deeper agriculture data model will be available through the Pelit app, where complete farm operations are being built.</p>
          <p>Intelligence E for Finance is planned as a separate financial intelligence platform. It will focus on analysis, forecasting, explanations, reports, and decision support while keeping business logic and calculations outside the AI model.</p>
          <div className="about-grid">
            <div className="about-item"><h3>Problem solving</h3><p>Earth AI is designed to turn complex information into clear decisions for people working in demanding industries.</p></div>
            <div className="about-item"><h3>Private beta</h3><p>The beta is managed through approved access so quality, safety, and reliability can be tested carefully before wider release.</p></div>
            <div className="about-item"><h3>Built to scale</h3><p>The platform is being prepared for subscriptions, usage limits, provider routing, feedback, and enterprise controls.</p></div>
          </div>
        </section>

        <footer className="home-footer">
          <span>Earth AI. Intelligence for agriculture, finance, and future verticals.</span>
          <span><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href="/waitlist">Waitlist</Link></span>
        </footer>
      </main>
    </>
  );
}
