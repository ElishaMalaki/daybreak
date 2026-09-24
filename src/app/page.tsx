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
  badgeBg: string;
  badgeText: string;
  logoColor: string;
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
  { url: 'https://images.unsplash.com/photo-1475274047050-1d0c0975c63e', alt: 'Clear night sky filled with stars above distant hills' },
  { url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a', alt: 'Brilliant star field and galaxy clouds in a dark sky' },
];

const dayLabels = new Set(['Sunrise', 'Morning', 'Midday', 'Afternoon', 'Sunset']);

const themes: Record<string, TimeTheme> = {
  Night: {
    label: 'Night',
    headline: 'AI that never sleeps.\nWorking while the world rests.',
    subline: "Earth AI's intelligence engines run around the clock — monitoring crops, tracking markets, and delivering insights before dawn.",
    overlay: 'linear-gradient(180deg, rgba(5,8,20,0.36) 0%, rgba(5,8,20,0.18) 50%, rgba(5,8,20,0.58) 100%)',
    textColor: '#F2F6FF',
    mutedColor: 'rgba(220,230,255,0.76)',
    buttonBg: '#F2F6FF',
    buttonText: '#0B0E14',
    badgeBg: 'rgba(255,255,255,0.12)',
    badgeText: 'rgba(220,230,255,0.9)',
    logoColor: '#F2F6FF',
  },
  BeforeDawn: {
    label: 'Before Dawn',
    headline: 'Before the market opens,\nour AI is already watching.',
    subline: 'Earth AI Finance Intelligence scans global signals in the quiet hours — so your decisions are backed by data, not guesswork.',
    overlay: 'linear-gradient(180deg, rgba(10,12,35,0.34) 0%, rgba(10,12,35,0.16) 50%, rgba(10,12,35,0.54) 100%)',
    textColor: '#EAF0FF',
    mutedColor: 'rgba(200,215,255,0.76)',
    buttonBg: '#EAF0FF',
    buttonText: '#0B0E14',
    badgeBg: 'rgba(255,255,255,0.12)',
    badgeText: 'rgba(200,215,255,0.9)',
    logoColor: '#EAF0FF',
  },
  Sunrise: {
    label: 'Sunrise',
    headline: 'A new growing season\nbegins with smarter AI.',
    subline: 'Earth AI Agriculture Intelligence helps farmers plan, predict, and optimize — from soil health to harvest yield.',
    overlay: 'linear-gradient(180deg, rgba(20,15,5,0.30) 0%, rgba(20,15,5,0.12) 50%, rgba(20,15,5,0.48) 100%)',
    textColor: '#FFFFFF',
    mutedColor: 'rgba(255,255,255,0.78)',
    buttonBg: '#FFFFFF',
    buttonText: '#1A1008',
    badgeBg: 'rgba(255,255,255,0.20)',
    badgeText: 'rgba(255,255,255,0.9)',
    logoColor: '#FFFFFF',
  },
  Morning: {
    label: 'Morning',
    headline: 'Specialized AI.\nBuilt for the real world.',
    subline: 'Earth AI delivers domain-specific intelligence for agriculture and finance — two industries where precision changes everything.',
    overlay: 'linear-gradient(180deg, rgba(10,40,90,0.28) 0%, rgba(10,40,90,0.10) 50%, rgba(10,40,90,0.44) 100%)',
    textColor: '#FFFFFF',
    mutedColor: 'rgba(255,255,255,0.78)',
    buttonBg: '#FFFFFF',
    buttonText: '#101320',
    badgeBg: 'rgba(255,255,255,0.20)',
    badgeText: 'rgba(255,255,255,0.9)',
    logoColor: '#FFFFFF',
  },
  Midday: {
    label: 'Midday',
    headline: 'Peak performance.\nPowered by Earth AI.',
    subline: 'At the height of the trading day or the growing season, our AI products deliver clarity, speed, and actionable intelligence.',
    overlay: 'linear-gradient(180deg, rgba(5,30,80,0.30) 0%, rgba(5,30,80,0.12) 50%, rgba(5,30,80,0.46) 100%)',
    textColor: '#FFFFFF',
    mutedColor: 'rgba(255,255,255,0.78)',
    buttonBg: '#FFFFFF',
    buttonText: '#101320',
    badgeBg: 'rgba(255,255,255,0.20)',
    badgeText: 'rgba(255,255,255,0.9)',
    logoColor: '#FFFFFF',
  },
  Afternoon: {
    label: 'Afternoon',
    headline: 'Finance intelligence\nthat sees further ahead.',
    subline: 'Earth AI Finance reads market patterns, risk signals, and economic trends — giving you the edge before others see it coming.',
    overlay: 'linear-gradient(180deg, rgba(15,20,50,0.30) 0%, rgba(15,20,50,0.12) 50%, rgba(15,20,50,0.48) 100%)',
    textColor: '#FFFFFF',
    mutedColor: 'rgba(255,255,255,0.78)',
    buttonBg: '#FFFFFF',
    buttonText: '#101320',
    badgeBg: 'rgba(255,255,255,0.20)',
    badgeText: 'rgba(255,255,255,0.9)',
    logoColor: '#FFFFFF',
  },
  Sunset: {
    label: 'Sunset',
    headline: 'From field to forecast,\nEarth AI has you covered.',
    subline: "Agriculture Intelligence monitors weather, soil, and crop data in real time — turning nature's complexity into clear, confident decisions.",
    overlay: 'linear-gradient(180deg, rgba(20,10,5,0.34) 0%, rgba(20,10,5,0.16) 50%, rgba(20,10,5,0.52) 100%)',
    textColor: '#FFFFFF',
    mutedColor: 'rgba(255,255,255,0.80)',
    buttonBg: '#FFFFFF',
    buttonText: '#1A0A05',
    badgeBg: 'rgba(255,255,255,0.18)',
    badgeText: 'rgba(255,255,255,0.9)',
    logoColor: '#FFFFFF',
  },
  Evening: {
    label: 'Evening',
    headline: 'Intelligence shaped\nby the Earth itself.',
    subline: 'Earth AI is built on the belief that the most powerful AI is the kind that understands the world it operates in.',
    overlay: 'linear-gradient(180deg, rgba(15,8,30,0.34) 0%, rgba(15,8,30,0.16) 50%, rgba(15,8,30,0.56) 100%)',
    textColor: '#F0EAFF',
    mutedColor: 'rgba(220,210,255,0.76)',
    buttonBg: '#F0EAFF',
    buttonText: '#0B0E14',
    badgeBg: 'rgba(255,255,255,0.12)',
    badgeText: 'rgba(220,210,255,0.9)',
    logoColor: '#F0EAFF',
  },
  Dusk: {
    label: 'Dusk',
    headline: 'Two products.\nOne powerful platform.',
    subline: 'Earth AI Agriculture and Earth AI Finance — specialized intelligence products designed for the industries that feed and fund the world.',
    overlay: 'linear-gradient(180deg, rgba(8,10,28,0.36) 0%, rgba(8,10,28,0.18) 50%, rgba(8,10,28,0.58) 100%)',
    textColor: '#E8EEFF',
    mutedColor: 'rgba(210,220,255,0.76)',
    buttonBg: '#E8EEFF',
    buttonText: '#0B0E14',
    badgeBg: 'rgba(255,255,255,0.12)',
    badgeText: 'rgba(210,220,255,0.9)',
    logoColor: '#E8EEFF',
  },
  LateNight: {
    label: 'Late Night',
    headline: 'The future of intelligence\nis grounded in Earth.',
    subline: 'While the world sleeps, Earth AI continues learning — processing data, refining models, and preparing insights for tomorrow.',
    overlay: 'linear-gradient(180deg, rgba(5,8,20,0.36) 0%, rgba(5,8,20,0.18) 50%, rgba(5,8,20,0.58) 100%)',
    textColor: '#F2F6FF',
    mutedColor: 'rgba(220,230,255,0.76)',
    buttonBg: '#F2F6FF',
    buttonText: '#0B0E14',
    badgeBg: 'rgba(255,255,255,0.12)',
    badgeText: 'rgba(220,230,255,0.9)',
    logoColor: '#F2F6FF',
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

export default function HomePage() {
  const [themeKey, setThemeKey] = useState('Morning');
  const [photoIndex, setPhotoIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const now = new Date();
    setThemeKey(getThemeKey(now.getHours()));
    setPhotoIndex(now.getSeconds());
    setCurrentTime(now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }));
    setMounted(true);

    const timeTimer = setInterval(() => {
      const current = new Date();
      setThemeKey(getThemeKey(current.getHours()));
      setCurrentTime(current.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }));
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
        .sky-root { min-height: 112vh; color: ${theme.textColor}; background: #020617; position: relative; overflow-x: hidden; }
        .sky-bg { position: fixed; inset: 0; z-index: 0; background-image: url(${currentPhoto.url}); background-size: cover; background-position: center; transition: background-image 1.8s ease; }
        .sky-overlay { position: fixed; inset: 0; z-index: 1; background: ${theme.overlay}; pointer-events: none; }
        .grain { position: fixed; inset: 0; z-index: 2; opacity: 0.08; mix-blend-mode: overlay; pointer-events: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E"); }
        .page-content { position: relative; z-index: 5; min-height: 112vh; }
        .nav-wrap { position: sticky; top: 0; z-index: 40; padding: 18px 4vw 8px; }
        .nav { display: flex; align-items: center; width: 100%; gap: 12px; }
        .nav-logo { display: flex; align-items: center; gap: 8px; color: ${theme.logoColor}; font-weight: 700; font-size: 17px; letter-spacing: -0.02em; text-decoration: none; flex-shrink: 0; }
        .nav-logo-img { width: 28px; height: 28px; flex-shrink: 0; border-radius: 6px; object-fit: cover; }
        .nav-spacer { flex: 1; }
        .nav-time { color: ${theme.logoColor}; opacity: 0.72; font-size: 13px; font-weight: 600; margin-right: 14px; }
        .nav-links { display: flex; align-items: center; gap: 4px; margin-right: 12px; }
        .nav-links a { color: ${theme.logoColor}; opacity: 0.78; font-size: 13px; font-weight: 600; text-decoration: none; padding: 6px 12px; border-radius: 999px; }
        .nav-links a:hover { opacity: 1; background: rgba(255,255,255,0.12); }
        .nav-btn { display: inline-flex; align-items: center; justify-content: center; min-height: 38px; padding: 0 22px; border-radius: 999px; background: rgba(34,197,94,0.88); color: #fff; text-decoration: none; font-size: 14px; font-weight: 650; }
        .hero-wrap { min-height: calc(100vh - 72px); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 56px 4vw 120px; text-align: center; }
        .hero-copy { max-width: min(760px, 92vw); animation: fadeInUp 0.9s cubic-bezier(0.23, 1, 0.32, 1) both; }
        .hero-headline { margin: 0; color: ${theme.textColor}; font-weight: 600; letter-spacing: -0.035em; line-height: 1.08; font-size: clamp(32px, 4.2vw, 62px); white-space: pre-line; }
        .hero-subline { margin: 18px auto 0; color: ${theme.mutedColor}; font-size: clamp(14px, 1.4vw, 17px); font-weight: 400; line-height: 1.6; max-width: 480px; }
        .hero-cta { margin-top: 36px; display: flex; justify-content: center; }
        .cta-btn { border: 0; border-radius: 999px; padding: 15px 40px; display: inline-flex; align-items: center; justify-content: center; font-size: 17px; font-weight: 600; letter-spacing: -0.01em; text-decoration: none; background: ${theme.buttonBg}; color: ${theme.buttonText}; box-shadow: 0 4px 24px rgba(0,0,0,0.18); }
        .cta-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.22); }
        .time-badge { position: fixed; left: 0; right: 0; bottom: 0; z-index: 40; padding: 0 4vw max(20px, env(safe-area-inset-bottom, 20px)); display: flex; align-items: flex-end; justify-content: space-between; pointer-events: none; }
        .footer-links { display: flex; align-items: center; gap: 4px; font-size: 13px; font-weight: 600; pointer-events: auto; }
        .footer-link { display: flex; align-items: center; justify-content: center; min-height: 44px; padding: 0 8px; color: ${theme.mutedColor}; text-decoration: none; }
        .footer-link:hover { opacity: 0.76; }
        .period-pill { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 999px; backdrop-filter: blur(14px) saturate(1.4); -webkit-backdrop-filter: blur(14px) saturate(1.4); border: 1px solid rgba(255,255,255,0.18); background: ${theme.badgeBg}; color: ${theme.badgeText}; font-size: 13px; font-weight: 600; letter-spacing: 0.01em; }
        .period-dot { width: 7px; height: 7px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 14px rgba(34,197,94,0.7); }
        .scroll-space { height: 12vh; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @media (max-width: 700px) { .nav-time, .nav-links { display: none; } .nav-btn { padding: 0 16px; } .footer-links a:nth-child(n+4) { display: none; } }
        @media (prefers-reduced-motion: reduce) { .sky-bg, .hero-copy, .cta-btn { transition: none !important; animation: none !important; } }
      `}</style>

      <main className="sky-root">
        <div className="sky-bg" role="img" aria-label={currentPhoto.alt} />
        <div className="sky-overlay" aria-hidden="true" />
        <div className="grain" aria-hidden="true" />
        <BackgroundAnimation period={theme.label} />

        <div className="page-content">
          <nav className="nav-wrap" aria-label="Earth AI">
            <div className="nav">
              <Link href="/" className="nav-logo" aria-label="Earth AI home">
                <Image src="/assets/images/h9O7B-1789370942958.jpg" alt="Earth AI logo" width={28} height={28} className="nav-logo-img" />
                <span>Earth AI</span>
              </Link>
              <div className="nav-spacer" />
              {mounted && <span className="nav-time">{currentTime}</span>}
              <div className="nav-links">
                <Link href="/about">About</Link>
                <Link href="/agriculture">Agriculture</Link>
                <Link href="/finance">Finance</Link>
                <Link href="/help">Help</Link>
              </div>
              <Link href="/login" className="nav-btn">Try Intelligence E Now</Link>
            </div>
          </nav>

          <section className="hero-wrap" aria-label="Earth AI introduction">
            <div className="hero-copy">
              <h1 className="hero-headline">{theme.headline}</h1>
              <p className="hero-subline">{theme.subline}</p>
              <div className="hero-cta">
                <Link href="/login" className="cta-btn">Try Intelligence E Now</Link>
              </div>
            </div>
          </section>

          <div className="scroll-space" aria-hidden="true" />
        </div>

        <div className="time-badge">
          <div className="footer-links">
            <Link href="/about" className="footer-link">About</Link>
            <Link href="/agriculture" className="footer-link">Agriculture</Link>
            <Link href="/finance" className="footer-link">Finance</Link>
            <Link href="/help" className="footer-link">Help</Link>
            <Link href="/privacy" className="footer-link">Privacy</Link>
            <Link href="/terms" className="footer-link">Terms</Link>
          </div>
          {mounted && (
            <div className="period-pill" aria-label={`Current period: ${theme.label}`}>
              <span className="period-dot" aria-hidden="true" />
              <span>{theme.label}</span>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
