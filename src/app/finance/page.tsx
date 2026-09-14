'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface TimeOfDay {
  label: string;
  image: string;
  imageAlt: string;
  overlayGradient: string;
  textColor: string;
  linkColor: string;
  buttonBg: string;
  buttonText: string;
  badgeBg: string;
  badgeText: string;
  logoColor: string;
}

const timeConfigs: TimeOfDay[] = [
  {
    label: 'Night',
    image: 'https://images.unsplash.com/photo-1720948744617-5b2fe92d78e2',
    imageAlt: 'Stunning night sky filled with stars and the Milky Way over a dark landscape',
    overlayGradient: 'linear-gradient(180deg, rgba(5,8,20,0.55) 0%, rgba(5,8,20,0.30) 50%, rgba(5,8,20,0.65) 100%)',
    textColor: '#F2F6FF', linkColor: 'rgba(220,230,255,0.75)', buttonBg: '#F2F6FF', buttonText: '#0B0E14',
    badgeBg: 'rgba(255,255,255,0.10)', badgeText: 'rgba(220,230,255,0.9)', logoColor: '#F2F6FF'
  },
  {
    label: 'Before Dawn',
    image: 'https://images.unsplash.com/photo-1698684001896-cc7998ca1cf2',
    imageAlt: 'Pre-dawn sky with deep blue and purple hues just before sunrise over the horizon',
    overlayGradient: 'linear-gradient(180deg, rgba(10,12,35,0.50) 0%, rgba(10,12,35,0.25) 50%, rgba(10,12,35,0.55) 100%)',
    textColor: '#EAF0FF', linkColor: 'rgba(200,215,255,0.75)', buttonBg: '#EAF0FF', buttonText: '#0B0E14',
    badgeBg: 'rgba(255,255,255,0.10)', badgeText: 'rgba(200,215,255,0.9)', logoColor: '#EAF0FF'
  },
  {
    label: 'Sunrise',
    image: 'https://images.unsplash.com/photo-1720934176426-95b299a3e8cd',
    imageAlt: 'Breathtaking sunrise with golden and orange light bursting over the horizon with clouds',
    overlayGradient: 'linear-gradient(180deg, rgba(20,15,5,0.45) 0%, rgba(20,15,5,0.20) 50%, rgba(20,15,5,0.55) 100%)',
    textColor: '#1A1008', linkColor: 'rgba(30,20,10,0.65)', buttonBg: '#1A1008', buttonText: '#FFFFFF',
    badgeBg: 'rgba(255,255,255,0.25)', badgeText: 'rgba(30,20,10,0.85)', logoColor: '#1A1008'
  },
  {
    label: 'Morning',
    image: 'https://images.unsplash.com/photo-1539643973272-3c845cfb223a',
    imageAlt: 'Bright clear blue morning sky with soft white clouds and sunlight',
    overlayGradient: 'linear-gradient(180deg, rgba(10,40,90,0.40) 0%, rgba(10,40,90,0.15) 50%, rgba(10,40,90,0.45) 100%)',
    textColor: '#0B0E14', linkColor: 'rgba(15,25,60,0.60)', buttonBg: '#101320', buttonText: '#FFFFFF',
    badgeBg: 'rgba(255,255,255,0.28)', badgeText: 'rgba(11,14,20,0.80)', logoColor: '#0B0E14'
  },
  {
    label: 'Midday',
    image: 'https://images.unsplash.com/photo-1666068510008-f44c3637d3c5',
    imageAlt: 'Brilliant midday blue sky with dramatic white cumulus clouds and bright sunlight',
    overlayGradient: 'linear-gradient(180deg, rgba(5,30,80,0.42) 0%, rgba(5,30,80,0.18) 50%, rgba(5,30,80,0.48) 100%)',
    textColor: '#0B0E14', linkColor: 'rgba(15,25,60,0.60)', buttonBg: '#101320', buttonText: '#FFFFFF',
    badgeBg: 'rgba(255,255,255,0.28)', badgeText: 'rgba(11,14,20,0.80)', logoColor: '#0B0E14'
  },
  {
    label: 'Afternoon',
    image: 'https://images.unsplash.com/photo-1682852928580-658315746b4f',
    imageAlt: 'Warm afternoon sky with golden sunlight filtering through clouds over a landscape',
    overlayGradient: 'linear-gradient(180deg, rgba(15,20,50,0.42) 0%, rgba(15,20,50,0.18) 50%, rgba(15,20,50,0.48) 100%)',
    textColor: '#0B0E14', linkColor: 'rgba(15,25,60,0.60)', buttonBg: '#101320', buttonText: '#FFFFFF',
    badgeBg: 'rgba(255,255,255,0.28)', badgeText: 'rgba(11,14,20,0.80)', logoColor: '#0B0E14'
  },
  {
    label: 'Sunset',
    image: 'https://images.unsplash.com/photo-1580662603788-b0548c665e78',
    imageAlt: 'Spectacular sunset with vivid orange, red and purple colors blazing across the sky',
    overlayGradient: 'linear-gradient(180deg, rgba(20,10,5,0.45) 0%, rgba(20,10,5,0.20) 50%, rgba(20,10,5,0.55) 100%)',
    textColor: '#1A0A05', linkColor: 'rgba(30,15,5,0.65)', buttonBg: '#1A0A05', buttonText: '#FFFFFF',
    badgeBg: 'rgba(255,255,255,0.22)', badgeText: 'rgba(30,15,5,0.85)', logoColor: '#1A0A05'
  },
  {
    label: 'Evening',
    image: 'https://images.unsplash.com/photo-1506630536165-474191c19cb4',
    imageAlt: 'Beautiful evening sky with deep purple and pink hues as the sun sets below the horizon',
    overlayGradient: 'linear-gradient(180deg, rgba(15,8,30,0.50) 0%, rgba(15,8,30,0.25) 50%, rgba(15,8,30,0.60) 100%)',
    textColor: '#F0EAFF', linkColor: 'rgba(220,210,255,0.75)', buttonBg: '#F0EAFF', buttonText: '#0B0E14',
    badgeBg: 'rgba(255,255,255,0.10)', badgeText: 'rgba(220,210,255,0.9)', logoColor: '#F0EAFF'
  },
  {
    label: 'Dusk',
    image: 'https://images.unsplash.com/photo-1561104740-2c5b39dfd2b6',
    imageAlt: 'Deep blue dusk sky with the last traces of light fading on the horizon',
    overlayGradient: 'linear-gradient(180deg, rgba(8,10,28,0.52) 0%, rgba(8,10,28,0.28) 50%, rgba(8,10,28,0.60) 100%)',
    textColor: '#E8EEFF', linkColor: 'rgba(210,220,255,0.75)', buttonBg: '#E8EEFF', buttonText: '#0B0E14',
    badgeBg: 'rgba(255,255,255,0.10)', badgeText: 'rgba(210,220,255,0.9)', logoColor: '#E8EEFF'
  },
  {
    label: 'Late Night',
    image: 'https://images.unsplash.com/photo-1518066000714-58c45f1a2c0a',
    imageAlt: 'Deep night sky with countless stars and the Milky Way galaxy visible in full splendor',
    overlayGradient: 'linear-gradient(180deg, rgba(5,8,20,0.55) 0%, rgba(5,8,20,0.30) 50%, rgba(5,8,20,0.65) 100%)',
    textColor: '#F2F6FF', linkColor: 'rgba(220,230,255,0.75)', buttonBg: '#F2F6FF', buttonText: '#0B0E14',
    badgeBg: 'rgba(255,255,255,0.10)', badgeText: 'rgba(220,230,255,0.9)', logoColor: '#F2F6FF'
  }
];

function getTimeConfig(hour: number): TimeOfDay {
  if (hour >= 0 && hour < 5) return timeConfigs[0];
  if (hour >= 5 && hour < 6) return timeConfigs[1];
  if (hour >= 6 && hour < 8) return timeConfigs[2];
  if (hour >= 8 && hour < 11) return timeConfigs[3];
  if (hour >= 11 && hour < 14) return timeConfigs[4];
  if (hour >= 14 && hour < 17) return timeConfigs[5];
  if (hour >= 17 && hour < 19) return timeConfigs[6];
  if (hour >= 19 && hour < 21) return timeConfigs[7];
  if (hour >= 21 && hour < 23) return timeConfigs[8];
  return timeConfigs[9];
}

const features = [
  {
    title: 'Market Signal Intelligence',
    description: 'Continuous scanning of equities, commodities, forex, and macro indicators — surfacing non-obvious correlations and early-warning signals before consensus forms.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
      </svg>
    ),
    size: 'large',
    accent: 'rgba(80,140,220,0.15)'
  },
  {
    title: 'Portfolio Risk & Scenario Modeling',
    description: 'Monte Carlo simulations, stress tests, and tail-risk analysis across multi-asset portfolios — quantifying exposure before volatility strikes.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
    size: 'small',
    accent: 'rgba(220,100,80,0.15)'
  },
  {
    title: 'Regulatory & Compliance Intelligence',
    description: 'Automated monitoring of regulatory filings, policy changes, and compliance requirements across jurisdictions — reducing legal exposure and audit risk.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
      </svg>
    ),
    size: 'small',
    accent: 'rgba(200,160,60,0.15)'
  },
  {
    title: 'Alternative Data & Sentiment Analysis',
    description: 'Structured intelligence from satellite imagery, web traffic, social sentiment, and supply chain data — alpha sources that traditional models miss entirely.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
    size: 'large',
    accent: 'rgba(120,80,200,0.15)'
  },
  {
    title: 'Financial AI Research & Intelligence Assistant',
    description: 'A domain-trained research assistant that synthesizes earnings reports, economic data, and market commentary into concise, cited investment-grade analysis — on demand.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        <line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
      </svg>
    ),
    size: 'full',
    accent: 'rgba(60,160,140,0.15)'
  }
];

export default function FinancePage() {
  const [currentConfig, setCurrentConfig] = useState<TimeOfDay>(timeConfigs[3]);
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    const config = getTimeConfig(hour);
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    setCurrentConfig(config);
    setCurrentTime(timeStr);
    setMounted(true);

    const interval = setInterval(() => {
      const n = new Date();
      setCurrentTime(n.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
      setCurrentConfig(getTimeConfig(n.getHours()));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const cfg = mounted ? currentConfig : timeConfigs[3];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { height: 100%; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .fi-root { min-height: 100vh; position: relative; overflow-x: hidden; }
        .fi-bg { position: fixed; inset: 0; z-index: 0; background-size: cover; background-position: center; background-repeat: no-repeat; }
        .fi-overlay { position: fixed; inset: 0; z-index: 1; pointer-events: none; }
        .fi-grain {
          position: fixed; inset: 0; z-index: 2; pointer-events: none; opacity: 0.07; mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 300px 300px;
        }
        .fi-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 40; padding: 18px 4vw 8px; display: flex; align-items: center; gap: 0; }
        .fi-logo { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 17px; letter-spacing: -0.02em; text-decoration: none; transition: opacity 0.2s; flex-shrink: 0; }
        .fi-logo:hover { opacity: 0.75; }
        .fi-logo-img { width: 28px; height: 28px; border-radius: 6px; object-fit: cover; flex-shrink: 0; }
        .fi-nav-spacer { flex: 1; }
        .fi-nav-time { font-size: 13px; font-weight: 600; letter-spacing: 0.01em; margin-right: 20px; opacity: 0.7; }
        .fi-nav-links { display: flex; align-items: center; gap: 4px; margin-right: 16px; }
        .fi-nav-link { font-size: 13px; font-weight: 600; text-decoration: none; padding: 6px 12px; border-radius: 999px; transition: opacity 0.2s, background 0.2s; opacity: 0.75; }
        .fi-nav-link:hover { opacity: 1; background: rgba(255,255,255,0.12); }
        .fi-nav-link.active { opacity: 1; background: rgba(255,255,255,0.18); }
        .fi-nav-btn { border: 0; border-radius: 999px; padding: 10px 22px; height: 38px; display: inline-flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600; letter-spacing: -0.01em; cursor: pointer; font-family: inherit; transition: transform 0.2s cubic-bezier(0.23,1,0.32,1); text-decoration: none; }
        .fi-nav-btn:hover { transform: translateY(-1px); }
        .fi-content { position: relative; z-index: 10; padding: 120px 4vw 80px; max-width: 1100px; margin: 0 auto; }
        .fi-eyebrow { display: inline-flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; padding: 6px 14px; border-radius: 999px; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.20); margin-bottom: 24px; }
        .fi-title { font-size: clamp(32px, 4.5vw, 60px); font-weight: 700; letter-spacing: -0.035em; line-height: 1.06; margin-bottom: 20px; max-width: 700px; }
        .fi-subtitle { font-size: clamp(15px, 1.5vw, 18px); font-weight: 400; line-height: 1.65; max-width: 560px; opacity: 0.72; margin-bottom: 56px; }
        .fi-bento { display: grid; grid-template-columns: repeat(12, 1fr); gap: 14px; }
        .fi-card { border-radius: 20px; backdrop-filter: blur(20px) saturate(1.4); -webkit-backdrop-filter: blur(20px) saturate(1.4); border: 1px solid rgba(255,255,255,0.18); padding: 28px; transition: transform 0.3s cubic-bezier(0.23,1,0.32,1), box-shadow 0.3s; }
        .fi-card:hover { transform: translateY(-3px); box-shadow: 0 16px 48px rgba(0,0,0,0.18); }
        .fi-card-large { grid-column: span 7; }
        .fi-card-small { grid-column: span 5; }
        .fi-card-full { grid-column: span 12; display: flex; gap: 24px; align-items: flex-start; }
        .fi-card-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 18px; border: 1px solid rgba(255,255,255,0.20); flex-shrink: 0; }
        .fi-card-title { font-size: 17px; font-weight: 700; letter-spacing: -0.02em; line-height: 1.25; margin-bottom: 10px; }
        .fi-card-desc { font-size: 14px; font-weight: 400; line-height: 1.65; opacity: 0.72; }
        .fi-footer { position: relative; z-index: 10; padding: 0 4vw 32px; display: flex; align-items: center; justify-content: space-between; max-width: 1100px; margin: 0 auto; }
        .fi-footer-links { display: flex; align-items: center; gap: 4px; font-size: 13px; font-weight: 600; }
        .fi-footer-link { display: flex; align-items: center; min-height: 44px; padding: 0 8px; text-decoration: none; transition: opacity 0.2s; opacity: 0.7; }
        .fi-footer-link:hover { opacity: 1; }
        .fi-period-pill { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 999px; backdrop-filter: blur(14px) saturate(1.4); -webkit-backdrop-filter: blur(14px) saturate(1.4); border: 1px solid rgba(255,255,255,0.18); font-size: 13px; font-weight: 600; }
        .fi-period-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        @keyframes fiFadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .fi-content { animation: fiFadeUp 0.8s cubic-bezier(0.23,1,0.32,1) both; }
        @media (max-width: 768px) {
          .fi-card-large, .fi-card-small, .fi-card-full { grid-column: span 12; }
          .fi-nav-links { display: none; }
          .fi-nav-time { display: none; }
          .fi-card-full { flex-direction: column; }
        }
      `}</style>

      <div className="fi-root">
        <div className="fi-bg" style={{ backgroundImage: `url(${cfg.image})` }} role="img" aria-label={cfg.imageAlt} />
        <div className="fi-overlay" style={{ background: cfg.overlayGradient }} aria-hidden="true" />
        <div className="fi-grain" aria-hidden="true" />

        <nav className="fi-nav" aria-label="Earth AI">
          <Link href="/" className="fi-logo" style={{ color: cfg.logoColor }}>
            <Image src="/assets/images/h9O7B-1789370942958.jpg" alt="Earth AI logo" width={28} height={28} className="fi-logo-img" />
            <span>Earth AI</span>
          </Link>
          <div className="fi-nav-spacer" />
          {mounted && <span className="fi-nav-time" style={{ color: cfg.logoColor }}>{currentTime}</span>}
          <div className="fi-nav-links">
            <Link href="/agriculture" className="fi-nav-link" style={{ color: cfg.logoColor }}>Agriculture</Link>
            <Link href="/finance" className="fi-nav-link active" style={{ color: cfg.logoColor }}>Finance</Link>
          </div>
          <Link href="/" className="fi-nav-btn" style={{ background: cfg.buttonBg, color: cfg.buttonText }}>Home</Link>
        </nav>

        <div className="fi-content">
          <div className="fi-eyebrow" style={{ background: cfg.badgeBg, color: cfg.badgeText }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
            </svg>
            Intelligence E for Finance
          </div>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px',
            borderRadius: 999, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.20)',
            marginBottom: 20,
          }}>
            <span style={{ color: cfg.badgeText, fontSize: 12, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase' }}>Coming Soon</span>
          </div>

          <h1 className="fi-title" style={{ color: cfg.textColor }}>
            Finance Intelligence<br />that sees further ahead.
          </h1>
          <p className="fi-subtitle" style={{ color: cfg.textColor }}>
            Intelligence E for Finance is currently in development. Five AI capabilities purpose-built for financial markets — from signal detection to regulatory compliance.
          </p>

          <div className="fi-bento">
            {features.map((feature, i) => (
              <div key={i} className={`fi-card ${i === 0 || i === 3 ? 'fi-card-large' : i === 4 ? 'fi-card-full' : 'fi-card-small'}`} style={{ background: cfg.badgeBg, color: cfg.badgeText, opacity: 0.65 }}>
                <div className="fi-card-icon" style={{ background: feature.accent, color: cfg.textColor }}>{feature.icon}</div>
                {i === 4 ? (
                  <div>
                    <div className="fi-card-title" style={{ color: cfg.textColor }}>{feature.title}</div>
                    <div className="fi-card-desc" style={{ color: cfg.textColor }}>{feature.description}</div>
                  </div>
                ) : (
                  <>
                    <div className="fi-card-title" style={{ color: cfg.textColor }}>{feature.title}</div>
                    <div className="fi-card-desc" style={{ color: cfg.textColor }}>{feature.description}</div>
                  </>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 40, padding: '20px 24px', borderRadius: 16, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', maxWidth: 480 }}>
            <div style={{ color: cfg.textColor, fontSize: 15, fontWeight: 700, marginBottom: 8 }}>Intelligence E · Agriculture is live</div>
            <div style={{ color: cfg.textColor, opacity: 0.65, fontSize: 13.5, lineHeight: 1.6, marginBottom: 16 }}>
              While Finance is in development, explore our agricultural intelligence platform — available now.
            </div>
            <Link href="/app/agriculture" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px',
              borderRadius: 999, background: cfg.buttonBg, color: cfg.buttonText,
              fontSize: 13.5, fontWeight: 700, textDecoration: 'none',
            }}>
              Launch Agriculture App →
            </Link>
          </div>
        </div>

        <footer className="fi-footer">
          <div className="fi-footer-links" style={{ color: cfg.linkColor }}>
            <Link href="/" className="fi-footer-link" style={{ color: 'inherit' }}>Home</Link>
            <Link href="/agriculture" className="fi-footer-link" style={{ color: 'inherit' }}>Agriculture</Link>
            <Link href="/finance" className="fi-footer-link" style={{ color: 'inherit' }}>Finance</Link>
            <Link href="/privacy" className="fi-footer-link" style={{ color: 'inherit' }}>Privacy</Link>
            <Link href="/terms" className="fi-footer-link" style={{ color: 'inherit' }}>Terms</Link>
          </div>
          {mounted && (
            <div className="fi-period-pill" style={{ background: cfg.badgeBg, color: cfg.badgeText }}>
              <span className="fi-period-dot" style={{ background: cfg.buttonBg === '#F2F6FF' || cfg.buttonBg === '#EAF0FF' || cfg.buttonBg === '#E8EEFF' || cfg.buttonBg === '#F0EAFF' ? 'rgba(150,170,255,0.8)' : cfg.buttonBg }} aria-hidden="true" />
              <span>{cfg.label}</span>
            </div>
          )}
        </footer>
      </div>
    </>
  );
}
