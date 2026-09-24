'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import BackgroundAnimation from '@/components/ui/BackgroundAnimation';

interface SkyPhoto {
  url: string;
  alt: string;
}

interface TimeTheme {
  label: string;
  headline: string;
  subline: string;
  overlay: string;
  textColor: string;
  mutedColor: string;
  buttonBg: string;
  buttonText: string;
  panelBg: string;
  border: string;
}

const daySkyPhotos: SkyPhoto[] = [
  { url: 'https://images.unsplash.com/photo-1675210266448-5d6f08ee26b9', alt: 'Golden sunset with towering clouds glowing orange and pink' },
  { url: 'https://images.unsplash.com/photo-1593358934220-ff87120a32c6', alt: 'Sunset over rolling hills with amber clouds across the sky' },
  { url: 'https://images.unsplash.com/photo-1656245606916-e9316100126c', alt: 'Sunset reflected on a calm lake with orange and purple clouds' },
  { url: 'https://images.unsplash.com/photo-1530178408322-35e0956c6944', alt: 'Pastel sunrise with pink and lavender clouds over the horizon' },
  { url: 'https://images.unsplash.com/photo-1669988022776-d3349a323b4a', alt: 'Bright blue daytime sky with large white cumulus clouds' },
  { url: 'https://images.unsplash.com/photo-1638150927499-23c630720c5f', alt: 'Towering golden hour clouds lit in amber and peach tones' },
  { url: 'https://images.unsplash.com/photo-1609504042921-8f1d598da22a', alt: 'Sunrise clouds reflected in still water below a glowing horizon' },
  { url: 'https://images.unsplash.com/photo-1568919428400-32bcc0d0db1d', alt: 'Warm afternoon sky with golden clouds over an open field' },
];

const nightSkyPhotos: SkyPhoto[] = [
  { url: 'https://images.unsplash.com/photo-1518066000714-58c45f1a2c0a', alt: 'Deep night sky with countless stars and the Milky Way' },
  { url: 'https://images.unsplash.com/photo-1720948744617-5b2fe92d78e2', alt: 'Starry night sky over a dark natural landscape' },
  { url: 'https://images.unsplash.com/photo-1695432946512-ecb7d5077dfe', alt: 'Milky Way galaxy glowing above a silhouetted landscape' },
  { url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee', alt: 'Blue night sky above a quiet mountain landscape' },
  { url: 'https://images.unsplash.com/photo-1475274047050-1d0c0975c63e', alt: 'Clear night sky filled with stars above distant hills' },
  { url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a', alt: 'Brilliant star field and galaxy clouds in a dark sky' },
];

const dayLabels = new Set(['Sunrise', 'Morning', 'Midday', 'Afternoon', 'Sunset']);

const themes: Record<string, TimeTheme> = {
  Night: {
    label: 'Night',
    headline: 'Earth AI turns real-world signals into clear decisions.',
    subline: 'Agriculture, finance, climate, documents, images, and operational data are brought together inside one intelligence platform built for serious work.',
    overlay: 'linear-gradient(180deg, rgba(4,7,18,0.82) 0%, rgba(4,7,18,0.66) 45%, rgba(4,7,18,0.88) 100%)',
    textColor: '#f8fafc',
    mutedColor: 'rgba(241,245,249,0.76)',
    buttonBg: '#f8fafc',
    buttonText: '#0f172a',
    panelBg: 'rgba(15,23,42,0.46)',
    border: 'rgba(255,255,255,0.16)',
  },
  BeforeDawn: {
    label: 'Before Dawn',
    headline: 'Before the day starts, Earth AI is already reading the world.',
    subline: 'The platform is designed to watch changing conditions, organize complex information, and help professionals move from uncertainty to action.',
    overlay: 'linear-gradient(180deg, rgba(8,13,35,0.78) 0%, rgba(8,13,35,0.60) 45%, rgba(8,13,35,0.84) 100%)',
    textColor: '#eef4ff',
    mutedColor: 'rgba(238,244,255,0.76)',
    buttonBg: '#eef4ff',
    buttonText: '#0f172a',
    panelBg: 'rgba(15,23,42,0.44)',
    border: 'rgba(255,255,255,0.16)',
  },
  Sunrise: {
    label: 'Sunrise',
    headline: 'A new generation of intelligence for Earth-scale decisions.',
    subline: 'Earth AI combines domain AI, structured data, documents, photos, and workflows so teams can understand what is happening and decide what to do next.',
    overlay: 'linear-gradient(180deg, rgba(15,23,42,0.58) 0%, rgba(15,23,42,0.42) 45%, rgba(15,23,42,0.72) 100%)',
    textColor: '#ffffff',
    mutedColor: 'rgba(255,255,255,0.80)',
    buttonBg: '#ffffff',
    buttonText: '#111827',
    panelBg: 'rgba(255,255,255,0.16)',
    border: 'rgba(255,255,255,0.24)',
  },
  Morning: {
    label: 'Morning',
    headline: 'Specialized AI for industries where precision matters.',
    subline: 'The Intelligence E platform is being shaped for agriculture first, with finance and future verticals built on the same secure foundation.',
    overlay: 'linear-gradient(180deg, rgba(15,23,42,0.56) 0%, rgba(15,23,42,0.40) 45%, rgba(15,23,42,0.70) 100%)',
    textColor: '#ffffff',
    mutedColor: 'rgba(255,255,255,0.80)',
    buttonBg: '#ffffff',
    buttonText: '#111827',
    panelBg: 'rgba(255,255,255,0.16)',
    border: 'rgba(255,255,255,0.24)',
  },
  Midday: {
    label: 'Midday',
    headline: 'Operational intelligence, not a generic chatbot.',
    subline: 'Earth AI is designed to support decisions with context, memory, usage controls, provider routing, and secure data foundations.',
    overlay: 'linear-gradient(180deg, rgba(15,23,42,0.58) 0%, rgba(15,23,42,0.42) 45%, rgba(15,23,42,0.72) 100%)',
    textColor: '#ffffff',
    mutedColor: 'rgba(255,255,255,0.80)',
    buttonBg: '#ffffff',
    buttonText: '#111827',
    panelBg: 'rgba(255,255,255,0.16)',
    border: 'rgba(255,255,255,0.24)',
  },
  Afternoon: {
    label: 'Afternoon',
    headline: 'Built for farmers, analysts, operators, and organizations.',
    subline: 'The goal is practical intelligence: clearer recommendations, better risk awareness, stronger research, and better use of the data teams already have.',
    overlay: 'linear-gradient(180deg, rgba(15,23,42,0.60) 0%, rgba(15,23,42,0.44) 45%, rgba(15,23,42,0.74) 100%)',
    textColor: '#ffffff',
    mutedColor: 'rgba(255,255,255,0.80)',
    buttonBg: '#ffffff',
    buttonText: '#111827',
    panelBg: 'rgba(255,255,255,0.16)',
    border: 'rgba(255,255,255,0.24)',
  },
  Sunset: {
    label: 'Sunset',
    headline: 'From field conditions to market signals, Earth AI connects the picture.',
    subline: 'The platform helps translate changing weather, crop conditions, research, business data, and financial signals into usable intelligence.',
    overlay: 'linear-gradient(180deg, rgba(15,23,42,0.62) 0%, rgba(15,23,42,0.46) 45%, rgba(15,23,42,0.76) 100%)',
    textColor: '#ffffff',
    mutedColor: 'rgba(255,255,255,0.82)',
    buttonBg: '#ffffff',
    buttonText: '#111827',
    panelBg: 'rgba(255,255,255,0.16)',
    border: 'rgba(255,255,255,0.24)',
  },
  Evening: {
    label: 'Evening',
    headline: 'Intelligence shaped by the planet it serves.',
    subline: 'Earth AI is built around real domains, real constraints, and real users who need systems that are useful, secure, and dependable.',
    overlay: 'linear-gradient(180deg, rgba(7,10,28,0.76) 0%, rgba(7,10,28,0.58) 45%, rgba(7,10,28,0.86) 100%)',
    textColor: '#f8fafc',
    mutedColor: 'rgba(241,245,249,0.76)',
    buttonBg: '#f8fafc',
    buttonText: '#0f172a',
    panelBg: 'rgba(15,23,42,0.46)',
    border: 'rgba(255,255,255,0.16)',
  },
  Dusk: {
    label: 'Dusk',
    headline: 'One Earth AI foundation. Multiple intelligence products.',
    subline: 'Agriculture is live. Finance is the next vertical. The long-term platform is designed to support more industries without rebuilding the core.',
    overlay: 'linear-gradient(180deg, rgba(5,8,20,0.80) 0%, rgba(5,8,20,0.62) 45%, rgba(5,8,20,0.88) 100%)',
    textColor: '#f8fafc',
    mutedColor: 'rgba(241,245,249,0.76)',
    buttonBg: '#f8fafc',
    buttonText: '#0f172a',
    panelBg: 'rgba(15,23,42,0.46)',
    border: 'rgba(255,255,255,0.16)',
  },
  LateNight: {
    label: 'Late Night',
    headline: 'The future of intelligence is grounded in Earth.',
    subline: 'Earth AI keeps the interface simple while the platform beneath it handles secure routing, usage controls, AI providers, and domain-specific workflows.',
    overlay: 'linear-gradient(180deg, rgba(4,7,18,0.82) 0%, rgba(4,7,18,0.66) 45%, rgba(4,7,18,0.88) 100%)',
    textColor: '#f8fafc',
    mutedColor: 'rgba(241,245,249,0.76)',
    buttonBg: '#f8fafc',
    buttonText: '#0f172a',
    panelBg: 'rgba(15,23,42,0.46)',
    border: 'rgba(255,255,255,0.16)',
  },
};

function getThemeKey(hour: number) {
  if (hour >= 0 && hour < 5) return 'Night';
  if (hour >= 5 && hour < 6) return 'BeforeDawn';
  if (hour >= 6 && hour < 8) return 'Sunrise';
  if (hour >= 8 && hour < 11) return 'Morning';
  if (hour >= 11 && hour < 14) return 'Midday';
  if (hour >= 14 && hour < 17) return 'Afternoon';
  if (hour >= 17 && hour < 19) return 'Sunset';
  if (hour >= 19 && hour < 21) return 'Evening';
  if (hour >= 21 && hour < 23) return 'Dusk';
  return 'LateNight';
}

const productCards = [
  {
    title: 'Intelligence E for Agriculture',
    href: '/agriculture',
    body: 'Live agricultural intelligence for crop guidance, pest and disease support, farm recommendations, reports, research, photo analysis, and document intelligence.',
  },
  {
    title: 'Intelligence E for Finance',
    href: '/finance',
    body: 'A financial intelligence vertical being designed for analysis, forecasting, risk interpretation, audit support, document understanding, and executive decision support.',
  },
  {
    title: 'Earth AI Platform Foundation',
    href: '/about',
    body: 'A secure SaaS foundation with authentication, Supabase, Vercel deployment, server-side AI routing, usage controls, and a clean path for future vertical products.',
  },
];

export default function HomePage() {
  const [themeKey, setThemeKey] = useState('Morning');
  const [photoIndex, setPhotoIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const now = new Date();
    setThemeKey(getThemeKey(now.getHours()));
    setPhotoIndex(now.getSeconds());
    setMounted(true);

    const timeTimer = setInterval(() => {
      const current = new Date();
      setThemeKey(getThemeKey(current.getHours()));
    }, 60000);

    const photoTimer = setInterval(() => {
      setPhotoIndex((value) => value + 1);
    }, 22000);

    return () => {
      clearInterval(timeTimer);
      clearInterval(photoTimer);
    };
  }, []);

  const theme = themes[themeKey] || themes.Morning;
  const photoPool = dayLabels.has(theme.label) ? daySkyPhotos : nightSkyPhotos;
  const currentPhoto = useMemo(() => photoPool[photoIndex % photoPool.length], [photoIndex, photoPool]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        html, body { margin: 0; min-height: 100%; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        body { overflow-x: hidden; }
        .earth-root { min-height: 100vh; color: ${theme.textColor}; background: #020617; }
        .earth-bg { position: fixed; inset: 0; z-index: 0; background-image: url(${currentPhoto.url}); background-size: cover; background-position: center; transition: background-image 1.8s ease, opacity 1.8s ease; }
        .earth-overlay { position: fixed; inset: 0; z-index: 1; background: ${theme.overlay}; pointer-events: none; }
        .earth-grain { position: fixed; inset: 0; z-index: 2; opacity: 0.07; mix-blend-mode: overlay; pointer-events: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='260' height='260'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='260' height='260' filter='url(%23n)'/%3E%3C/svg%3E"); }
        .earth-content { position: relative; z-index: 5; min-height: 100vh; }
        .earth-nav { position: sticky; top: 0; z-index: 30; display: flex; align-items: center; gap: 18px; padding: 18px 4vw; backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); background: rgba(2,6,23,0.18); border-bottom: 1px solid rgba(255,255,255,0.08); }
        .earth-logo { display: inline-flex; align-items: center; gap: 9px; color: inherit; text-decoration: none; font-weight: 750; letter-spacing: -0.02em; }
        .earth-logo img { border-radius: 6px; }
        .earth-links { display: flex; align-items: center; gap: 4px; margin-left: auto; }
        .earth-links a { color: ${theme.mutedColor}; text-decoration: none; font-size: 13px; font-weight: 650; padding: 8px 11px; border-radius: 999px; }
        .earth-links a:hover { color: ${theme.textColor}; background: rgba(255,255,255,0.10); }
        .earth-login { color: ${theme.buttonText} !important; background: ${theme.buttonBg}; }
        .earth-hero { width: min(1120px, 92vw); margin: 0 auto; padding: 86px 0 52px; display: grid; grid-template-columns: minmax(0, 1.08fr) minmax(280px, 0.72fr); gap: 48px; align-items: center; min-height: calc(100vh - 76px); }
        .earth-kicker { display: inline-flex; width: fit-content; align-items: center; gap: 8px; padding: 7px 13px; border: 1px solid ${theme.border}; border-radius: 999px; background: ${theme.panelBg}; color: ${theme.mutedColor}; font-size: 12px; font-weight: 750; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 20px; }
        .earth-kicker span:first-child { width: 7px; height: 7px; border-radius: 999px; background: #22c55e; box-shadow: 0 0 16px rgba(34,197,94,0.8); }
        .earth-title { margin: 0; max-width: 760px; font-size: clamp(42px, 6.6vw, 86px); line-height: 0.96; letter-spacing: -0.055em; font-weight: 800; }
        .earth-subline { max-width: 640px; margin: 24px 0 0; color: ${theme.mutedColor}; font-size: clamp(15px, 1.35vw, 18px); line-height: 1.7; }
        .earth-actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 34px; }
        .earth-action-primary, .earth-action-secondary { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; padding: 0 20px; border-radius: 999px; text-decoration: none; font-size: 14px; font-weight: 750; }
        .earth-action-primary { background: ${theme.buttonBg}; color: ${theme.buttonText}; }
        .earth-action-secondary { color: ${theme.textColor}; border: 1px solid ${theme.border}; background: ${theme.panelBg}; }
        .earth-panel { border: 1px solid ${theme.border}; border-radius: 18px; background: ${theme.panelBg}; backdrop-filter: blur(22px); -webkit-backdrop-filter: blur(22px); padding: 22px; box-shadow: 0 24px 80px rgba(0,0,0,0.22); }
        .earth-panel h2 { margin: 0 0 12px; font-size: 16px; letter-spacing: -0.02em; }
        .earth-panel p { margin: 0; color: ${theme.mutedColor}; font-size: 13.5px; line-height: 1.65; }
        .earth-panel-list { display: grid; gap: 14px; margin-top: 20px; }
        .earth-mini { padding-top: 14px; border-top: 1px solid ${theme.border}; }
        .earth-mini strong { display: block; font-size: 13px; margin-bottom: 5px; }
        .earth-section { width: min(1120px, 92vw); margin: 0 auto; padding: 52px 0; }
        .earth-section-header { max-width: 780px; margin-bottom: 22px; }
        .earth-section h2 { margin: 0; font-size: clamp(26px, 3.2vw, 42px); letter-spacing: -0.04em; line-height: 1.08; }
        .earth-section p { color: ${theme.mutedColor}; line-height: 1.75; font-size: 15px; }
        .earth-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
        .earth-card { border: 1px solid ${theme.border}; border-radius: 16px; background: ${theme.panelBg}; backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); padding: 20px; min-height: 210px; display: flex; flex-direction: column; }
        .earth-card h3 { margin: 0 0 10px; font-size: 16px; letter-spacing: -0.02em; }
        .earth-card p { margin: 0; font-size: 13.5px; line-height: 1.65; }
        .earth-card a { margin-top: auto; color: ${theme.textColor}; text-decoration: none; font-size: 13px; font-weight: 750; padding-top: 18px; }
        .earth-copy { display: grid; grid-template-columns: 0.9fr 1.1fr; gap: 28px; align-items: start; }
        .earth-copy article { border: 1px solid ${theme.border}; border-radius: 18px; background: ${theme.panelBg}; backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); padding: 24px; }
        .earth-copy h3 { margin: 0 0 10px; font-size: 17px; letter-spacing: -0.02em; }
        .earth-copy p { margin: 0 0 14px; font-size: 14px; }
        .earth-footer { width: min(1120px, 92vw); margin: 0 auto; padding: 38px 0 28px; display: flex; align-items: center; justify-content: space-between; gap: 20px; color: ${theme.mutedColor}; font-size: 13px; }
        .earth-footer a { color: inherit; text-decoration: none; margin-left: 14px; }
        @media (max-width: 860px) { .earth-hero, .earth-copy { grid-template-columns: 1fr; } .earth-grid { grid-template-columns: 1fr; } .earth-links a:not(.earth-login) { display: none; } .earth-hero { padding-top: 64px; } }
      `}</style>

      <main className="earth-root">
        <div className="earth-bg" role="img" aria-label={currentPhoto.alt} />
        <div className="earth-overlay" aria-hidden="true" />
        <div className="earth-grain" aria-hidden="true" />
        <BackgroundAnimation period={theme.label} />

        <div className="earth-content">
          <nav className="earth-nav" aria-label="Earth AI">
            <Link href="/" className="earth-logo" aria-label="Earth AI home">
              <Image src="/assets/images/h9O7B-1789370942958.jpg" alt="Earth AI logo" width={28} height={28} />
              <span>Earth AI</span>
            </Link>
            <div className="earth-links">
              <Link href="/about">About</Link>
              <Link href="/agriculture">Agriculture</Link>
              <Link href="/finance">Finance</Link>
              <Link href="/help">Help</Link>
              <Link href="/login" className="earth-login">Try Intelligence E</Link>
            </div>
          </nav>

          <section className="earth-hero">
            <div>
              <div className="earth-kicker"><span />{mounted ? theme.label : 'Earth AI'} intelligence</div>
              <h1 className="earth-title">{theme.headline}</h1>
              <p className="earth-subline">{theme.subline}</p>
              <div className="earth-actions">
                <Link href="/login" className="earth-action-primary">Start with Intelligence E</Link>
                <Link href="/about" className="earth-action-secondary">Learn about Earth AI</Link>
              </div>
            </div>

            <aside className="earth-panel" aria-label="Earth AI summary">
              <h2>What Earth AI is building</h2>
              <p>Earth AI is a vertical intelligence company building practical AI systems for industries that depend on changing real-world conditions.</p>
              <div className="earth-panel-list">
                <div className="earth-mini">
                  <strong>Agriculture intelligence</strong>
                  <p>Crop guidance, pest and disease support, farm recommendations, reports, research, photo analysis, and document intelligence.</p>
                </div>
                <div className="earth-mini">
                  <strong>Finance intelligence</strong>
                  <p>Analysis, forecasting, document review, audit assistance, risk interpretation, and decision support for financial teams.</p>
                </div>
                <div className="earth-mini">
                  <strong>Platform foundation</strong>
                  <p>Secure authentication, Supabase data foundations, server-side AI routing, usage controls, and subscription-ready infrastructure.</p>
                </div>
              </div>
            </aside>
          </section>

          <section className="earth-section">
            <div className="earth-section-header">
              <h2>Domain AI that works with real context.</h2>
              <p>Earth AI is not designed as a generic chat interface. It is being built as a family of professional intelligence products where AI assists analysis, explanation, summarization, forecasting, research, document understanding, and photo interpretation while the application keeps control of business rules, permissions, and data integrity.</p>
            </div>
            <div className="earth-grid">
              {productCards.map((card) => (
                <article className="earth-card" key={card.title}>
                  <h3>{card.title}</h3>
                  <p>{card.body}</p>
                  <Link href={card.href}>Explore</Link>
                </article>
              ))}
            </div>
          </section>

          <section className="earth-section earth-copy">
            <article>
              <h3>Why the sky changes</h3>
              <p>The public website now follows the time of day with real sky, cloud, sunset, and night-sky photography. Daytime uses bright cloud and sunset scenes. Night uses star fields and deep sky imagery.</p>
              <p>The imagery rotates automatically so the site feels alive without hiding the words. Strong overlays, restrained typography, and simple layout keep the message readable on desktop and mobile.</p>
            </article>
            <article>
              <h3>Where Earth AI is going</h3>
              <p>The first working product is Intelligence E for Agriculture, focused on helping farmers and agricultural professionals reason through crops, pests, disease risk, reports, research, documents, and farm decisions.</p>
              <p>The second vertical is Intelligence E for Finance. It will use the same Earth AI foundation while keeping finance-specific intelligence separate from agriculture. This gives Earth AI a path to grow into multiple professional SaaS products without rebuilding the platform from zero each time.</p>
            </article>
          </section>

          <footer className="earth-footer">
            <span>Earth AI. Intelligence for the real world.</span>
            <span>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
              <Link href="/login">Login</Link>
            </span>
          </footer>
        </div>
      </main>
    </>
  );
}
