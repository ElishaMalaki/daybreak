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
  { label: 'Night', image: 'https://images.unsplash.com/photo-1720948744617-5b2fe92d78e2', imageAlt: 'Stunning night sky filled with stars and the Milky Way over a dark landscape', overlayGradient: 'linear-gradient(180deg, rgba(5,8,20,0.65) 0%, rgba(5,8,20,0.50) 50%, rgba(5,8,20,0.70) 100%)', textColor: '#F2F6FF', linkColor: 'rgba(220,230,255,0.75)', buttonBg: '#F2F6FF', buttonText: '#0B0E14', badgeBg: 'rgba(255,255,255,0.08)', badgeText: 'rgba(220,230,255,0.9)', logoColor: '#F2F6FF' },
  { label: 'Before Dawn', image: 'https://images.unsplash.com/photo-1698684001896-cc7998ca1cf2', imageAlt: 'Pre-dawn sky with deep blue and purple hues just before sunrise over the horizon', overlayGradient: 'linear-gradient(180deg, rgba(10,12,35,0.60) 0%, rgba(10,12,35,0.45) 50%, rgba(10,12,35,0.65) 100%)', textColor: '#EAF0FF', linkColor: 'rgba(200,215,255,0.75)', buttonBg: '#EAF0FF', buttonText: '#0B0E14', badgeBg: 'rgba(255,255,255,0.08)', badgeText: 'rgba(200,215,255,0.9)', logoColor: '#EAF0FF' },
  { label: 'Sunrise', image: 'https://images.unsplash.com/photo-1720934176426-95b299a3e8cd', imageAlt: 'Breathtaking sunrise with golden and orange light bursting over the horizon with clouds', overlayGradient: 'linear-gradient(180deg, rgba(20,15,5,0.55) 0%, rgba(20,15,5,0.40) 50%, rgba(20,15,5,0.65) 100%)', textColor: '#1A1008', linkColor: 'rgba(30,20,10,0.65)', buttonBg: '#1A1008', buttonText: '#FFFFFF', badgeBg: 'rgba(255,255,255,0.30)', badgeText: 'rgba(30,20,10,0.85)', logoColor: '#1A1008' },
  { label: 'Morning', image: 'https://images.unsplash.com/photo-1539643973272-3c845cfb223a', imageAlt: 'Bright clear blue morning sky with soft white clouds and sunlight', overlayGradient: 'linear-gradient(180deg, rgba(10,40,90,0.50) 0%, rgba(10,40,90,0.35) 50%, rgba(10,40,90,0.55) 100%)', textColor: '#0B0E14', linkColor: 'rgba(15,25,60,0.60)', buttonBg: '#101320', buttonText: '#FFFFFF', badgeBg: 'rgba(255,255,255,0.32)', badgeText: 'rgba(11,14,20,0.80)', logoColor: '#0B0E14' },
  { label: 'Midday', image: 'https://images.unsplash.com/photo-1666068510008-f44c3637d3c5', imageAlt: 'Brilliant midday blue sky with dramatic white cumulus clouds and bright sunlight', overlayGradient: 'linear-gradient(180deg, rgba(5,30,80,0.52) 0%, rgba(5,30,80,0.38) 50%, rgba(5,30,80,0.58) 100%)', textColor: '#0B0E14', linkColor: 'rgba(15,25,60,0.60)', buttonBg: '#101320', buttonText: '#FFFFFF', badgeBg: 'rgba(255,255,255,0.32)', badgeText: 'rgba(11,14,20,0.80)', logoColor: '#0B0E14' },
  { label: 'Afternoon', image: 'https://images.unsplash.com/photo-1682852928580-658315746b4f', imageAlt: 'Warm afternoon sky with golden sunlight filtering through clouds over a landscape', overlayGradient: 'linear-gradient(180deg, rgba(15,20,50,0.52) 0%, rgba(15,20,50,0.38) 50%, rgba(15,20,50,0.58) 100%)', textColor: '#0B0E14', linkColor: 'rgba(15,25,60,0.60)', buttonBg: '#101320', buttonText: '#FFFFFF', badgeBg: 'rgba(255,255,255,0.32)', badgeText: 'rgba(11,14,20,0.80)', logoColor: '#0B0E14' },
  { label: 'Sunset', image: 'https://images.unsplash.com/photo-1580662603788-b0548c665e78', imageAlt: 'Spectacular sunset with vivid orange, red and purple colors blazing across the sky', overlayGradient: 'linear-gradient(180deg, rgba(20,10,5,0.55) 0%, rgba(20,10,5,0.40) 50%, rgba(20,10,5,0.65) 100%)', textColor: '#1A0A05', linkColor: 'rgba(30,15,5,0.65)', buttonBg: '#1A0A05', buttonText: '#FFFFFF', badgeBg: 'rgba(255,255,255,0.28)', badgeText: 'rgba(30,15,5,0.85)', logoColor: '#1A0A05' },
  { label: 'Evening', image: 'https://images.unsplash.com/photo-1506630536165-474191c19cb4', imageAlt: 'Beautiful evening sky with deep purple and pink hues as the sun sets below the horizon', overlayGradient: 'linear-gradient(180deg, rgba(15,8,30,0.60) 0%, rgba(15,8,30,0.45) 50%, rgba(15,8,30,0.70) 100%)', textColor: '#F0EAFF', linkColor: 'rgba(220,210,255,0.75)', buttonBg: '#F0EAFF', buttonText: '#0B0E14', badgeBg: 'rgba(255,255,255,0.08)', badgeText: 'rgba(220,210,255,0.9)', logoColor: '#F0EAFF' },
  { label: 'Dusk', image: 'https://images.unsplash.com/photo-1561104740-2c5b39dfd2b6', imageAlt: 'Deep blue dusk sky with the last traces of light fading on the horizon', overlayGradient: 'linear-gradient(180deg, rgba(8,10,28,0.62) 0%, rgba(8,10,28,0.48) 50%, rgba(8,10,28,0.70) 100%)', textColor: '#E8EEFF', linkColor: 'rgba(210,220,255,0.75)', buttonBg: '#E8EEFF', buttonText: '#0B0E14', badgeBg: 'rgba(255,255,255,0.08)', badgeText: 'rgba(210,220,255,0.9)', logoColor: '#E8EEFF' },
  { label: 'Late Night', image: 'https://images.unsplash.com/photo-1518066000714-58c45f1a2c0a', imageAlt: 'Deep night sky with countless stars and the Milky Way galaxy visible in full splendor', overlayGradient: 'linear-gradient(180deg, rgba(5,8,20,0.65) 0%, rgba(5,8,20,0.50) 50%, rgba(5,8,20,0.70) 100%)', textColor: '#F2F6FF', linkColor: 'rgba(220,230,255,0.75)', buttonBg: '#F2F6FF', buttonText: '#0B0E14', badgeBg: 'rgba(255,255,255,0.08)', badgeText: 'rgba(220,230,255,0.9)', logoColor: '#F2F6FF' }
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

export default function PrivacyPage() {
  const [currentConfig, setCurrentConfig] = useState<TimeOfDay>(timeConfigs[3]);
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const now = new Date();
    const config = getTimeConfig(now.getHours());
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
        html, body { font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .pp-root { min-height: 100vh; position: relative; overflow-x: hidden; }
        .pp-bg { position: fixed; inset: 0; z-index: 0; background-size: cover; background-position: center; background-repeat: no-repeat; }
        .pp-overlay { position: fixed; inset: 0; z-index: 1; pointer-events: none; }
        .pp-grain { position: fixed; inset: 0; z-index: 2; pointer-events: none; opacity: 0.07; mix-blend-mode: overlay; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E"); background-size: 300px 300px; }
        .pp-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 40; padding: 18px 4vw 8px; display: flex; align-items: center; }
        .pp-logo { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 17px; letter-spacing: -0.02em; text-decoration: none; transition: opacity 0.2s; }
        .pp-logo:hover { opacity: 0.75; }
        .pp-logo-img { width: 28px; height: 28px; border-radius: 6px; object-fit: cover; }
        .pp-nav-spacer { flex: 1; }
        .pp-nav-time { font-size: 13px; font-weight: 600; margin-right: 20px; opacity: 0.7; }
        .pp-nav-links { display: flex; align-items: center; gap: 4px; margin-right: 16px; }
        .pp-nav-link { font-size: 13px; font-weight: 600; text-decoration: none; padding: 6px 12px; border-radius: 999px; transition: opacity 0.2s, background 0.2s; opacity: 0.75; }
        .pp-nav-link:hover { opacity: 1; background: rgba(255,255,255,0.12); }
        .pp-nav-btn { border: 0; border-radius: 999px; padding: 10px 22px; height: 38px; display: inline-flex; align-items: center; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; transition: transform 0.2s; text-decoration: none; }
        .pp-nav-btn:hover { transform: translateY(-1px); }
        .pp-content { position: relative; z-index: 10; padding: 110px 4vw 80px; max-width: 760px; margin: 0 auto; }
        .pp-card { border-radius: 24px; backdrop-filter: blur(24px) saturate(1.5); -webkit-backdrop-filter: blur(24px) saturate(1.5); border: 1px solid rgba(255,255,255,0.18); padding: 48px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
        .pp-eyebrow { font-size: 12px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; opacity: 0.55; margin-bottom: 12px; }
        .pp-title { font-size: clamp(28px, 3.5vw, 44px); font-weight: 700; letter-spacing: -0.03em; line-height: 1.1; margin-bottom: 8px; }
        .pp-updated { font-size: 13px; font-weight: 500; opacity: 0.5; margin-bottom: 36px; }
        .pp-divider { height: 1px; background: rgba(255,255,255,0.15); margin: 32px 0; }
        .pp-section-title { font-size: 16px; font-weight: 700; letter-spacing: -0.01em; margin-bottom: 10px; }
        .pp-body { font-size: 14px; font-weight: 400; line-height: 1.75; opacity: 0.75; margin-bottom: 0; }
        .pp-body + .pp-body { margin-top: 10px; }
        .pp-list { font-size: 14px; font-weight: 400; line-height: 1.75; opacity: 0.75; padding-left: 20px; margin-top: 8px; }
        .pp-list li { margin-bottom: 4px; }
        .pp-contact-link { font-weight: 600; text-decoration: underline; text-underline-offset: 3px; opacity: 0.9; }
        .pp-footer { position: relative; z-index: 10; padding: 0 4vw 32px; display: flex; align-items: center; justify-content: space-between; max-width: 760px; margin: 0 auto; }
        .pp-footer-links { display: flex; align-items: center; gap: 4px; font-size: 13px; font-weight: 600; }
        .pp-footer-link { display: flex; align-items: center; min-height: 44px; padding: 0 8px; text-decoration: none; transition: opacity 0.2s; opacity: 0.7; }
        .pp-footer-link:hover { opacity: 1; }
        .pp-period-pill { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 999px; backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border: 1px solid rgba(255,255,255,0.18); font-size: 13px; font-weight: 600; }
        .pp-period-dot { width: 7px; height: 7px; border-radius: 50%; }
        @keyframes ppFadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .pp-content { animation: ppFadeUp 0.8s cubic-bezier(0.23,1,0.32,1) both; }
        @media (max-width: 600px) { .pp-nav-links { display: none; } .pp-nav-time { display: none; } .pp-card { padding: 28px 20px; } }
      `}</style>

      <div className="pp-root">
        <div className="pp-bg" style={{ backgroundImage: `url(${cfg.image})` }} role="img" aria-label={cfg.imageAlt} />
        <div className="pp-overlay" style={{ background: cfg.overlayGradient }} aria-hidden="true" />
        <div className="pp-grain" aria-hidden="true" />

        <nav className="pp-nav" aria-label="Earth AI">
          <Link href="/" className="pp-logo" style={{ color: cfg.logoColor }}>
            <Image src="/assets/images/h9O7B-1789370942958.jpg" alt="Earth AI logo" width={28} height={28} className="pp-logo-img" />
            <span>Earth AI</span>
          </Link>
          <div className="pp-nav-spacer" />
          {mounted && <span className="pp-nav-time" style={{ color: cfg.logoColor }}>{currentTime}</span>}
          <div className="pp-nav-links">
            <Link href="/agriculture" className="pp-nav-link" style={{ color: cfg.logoColor }}>Agriculture</Link>
            <Link href="/finance" className="pp-nav-link" style={{ color: cfg.logoColor }}>Finance</Link>
          </div>
          <Link href="/" className="pp-nav-btn" style={{ background: cfg.buttonBg, color: cfg.buttonText }}>Home</Link>
        </nav>

        <div className="pp-content">
          <div className="pp-card" style={{ background: cfg.badgeBg, color: cfg.textColor }}>
            <div className="pp-eyebrow" style={{ color: cfg.textColor }}>Legal</div>
            <h1 className="pp-title" style={{ color: cfg.textColor }}>Privacy Policy</h1>
            <div className="pp-updated" style={{ color: cfg.textColor }}>Last updated: September 2026</div>

            <div className="pp-section-title" style={{ color: cfg.textColor }}>1. Who We Are</div>
            <p className="pp-body" style={{ color: cfg.textColor }}>Earth AI operates specialized artificial intelligence products for the agriculture and finance industries. This Privacy Policy explains how we collect, use, and protect information when you use our website and services at earthai.com.</p>

            <div className="pp-divider" />

            <div className="pp-section-title" style={{ color: cfg.textColor }}>2. Information We Collect</div>
            <p className="pp-body" style={{ color: cfg.textColor }}>We may collect the following categories of information:</p>
            <ul className="pp-list" style={{ color: cfg.textColor }}>
              <li><strong>Usage data</strong> — pages visited, time spent, features accessed, and interaction patterns.</li>
              <li><strong>Device & technical data</strong> — browser type, operating system, IP address, and referring URLs.</li>
              <li><strong>Account data</strong> — name, email address, and organization details when you register or contact us.</li>
              <li><strong>Agricultural or financial data</strong> — only data you explicitly upload or connect to our AI products.</li>
            </ul>

            <div className="pp-divider" />

            <div className="pp-section-title" style={{ color: cfg.textColor }}>3. How We Use Your Information</div>
            <p className="pp-body" style={{ color: cfg.textColor }}>We use collected information to:</p>
            <ul className="pp-list" style={{ color: cfg.textColor }}>
              <li>Provide, operate, and improve our AI intelligence products.</li>
              <li>Personalize your experience and deliver relevant insights.</li>
              <li>Communicate product updates, security notices, and support responses.</li>
              <li>Analyze aggregate usage patterns to enhance performance and reliability.</li>
              <li>Comply with legal obligations and enforce our Terms of Service.</li>
            </ul>

            <div className="pp-divider" />

            <div className="pp-section-title" style={{ color: cfg.textColor }}>4. Data Sharing</div>
            <p className="pp-body" style={{ color: cfg.textColor }}>Earth AI does not sell your personal data. We may share information with:</p>
            <ul className="pp-list" style={{ color: cfg.textColor }}>
              <li><strong>Service providers</strong> — trusted vendors who assist in hosting, analytics, and infrastructure under strict confidentiality agreements.</li>
              <li><strong>Legal authorities</strong> — when required by law, court order, or to protect the rights and safety of our users.</li>
              <li><strong>Business transfers</strong> — in the event of a merger, acquisition, or asset sale, subject to equivalent privacy protections.</li>
            </ul>

            <div className="pp-divider" />

            <div className="pp-section-title" style={{ color: cfg.textColor }}>5. Data Security</div>
            <p className="pp-body" style={{ color: cfg.textColor }}>We implement industry-standard security measures including encryption in transit (TLS), access controls, and regular security audits. No method of transmission over the internet is 100% secure; we continuously work to protect your data but cannot guarantee absolute security.</p>

            <div className="pp-divider" />

            <div className="pp-section-title" style={{ color: cfg.textColor }}>6. Your Rights</div>
            <p className="pp-body" style={{ color: cfg.textColor }}>Depending on your jurisdiction, you may have the right to:</p>
            <ul className="pp-list" style={{ color: cfg.textColor }}>
              <li>Access, correct, or delete your personal data.</li>
              <li>Object to or restrict certain processing activities.</li>
              <li>Request data portability in a machine-readable format.</li>
              <li>Withdraw consent where processing is based on consent.</li>
            </ul>

            <div className="pp-divider" />

            <div className="pp-section-title" style={{ color: cfg.textColor }}>7. Cookies</div>
            <p className="pp-body" style={{ color: cfg.textColor }}>We use essential cookies to operate our services and analytics cookies to understand usage patterns. You can control cookie preferences through your browser settings. Disabling certain cookies may affect functionality.</p>

            <div className="pp-divider" />

            <div className="pp-section-title" style={{ color: cfg.textColor }}>8. Changes to This Policy</div>
            <p className="pp-body" style={{ color: cfg.textColor }}>We may update this Privacy Policy periodically. Material changes will be communicated via email or a prominent notice on our website. Continued use of our services after changes constitutes acceptance of the updated policy.</p>

            <div className="pp-divider" />

            <div className="pp-section-title" style={{ color: cfg.textColor }}>9. Contact Us</div>
            <p className="pp-body" style={{ color: cfg.textColor }}>
              For privacy-related questions or to exercise your rights, contact us at{' '}
              <a href="mailto:privacy@earthai.com" className="pp-contact-link" style={{ color: cfg.textColor }}>privacy@earthai.com</a>.
            </p>
          </div>
        </div>

        <footer className="pp-footer">
          <div className="pp-footer-links" style={{ color: cfg.linkColor }}>
            <Link href="/" className="pp-footer-link" style={{ color: 'inherit' }}>Home</Link>
            <Link href="/agriculture" className="pp-footer-link" style={{ color: 'inherit' }}>Agriculture</Link>
            <Link href="/finance" className="pp-footer-link" style={{ color: 'inherit' }}>Finance</Link>
            <Link href="/privacy" className="pp-footer-link" style={{ color: 'inherit' }}>Privacy</Link>
            <Link href="/terms" className="pp-footer-link" style={{ color: 'inherit' }}>Terms</Link>
          </div>
          {mounted && (
            <div className="pp-period-pill" style={{ background: cfg.badgeBg, color: cfg.badgeText }}>
              <span className="pp-period-dot" style={{ background: cfg.buttonBg === '#F2F6FF' || cfg.buttonBg === '#EAF0FF' || cfg.buttonBg === '#E8EEFF' || cfg.buttonBg === '#F0EAFF' ? 'rgba(150,170,255,0.8)' : cfg.buttonBg }} aria-hidden="true" />
              <span>{cfg.label}</span>
            </div>
          )}
        </footer>
      </div>
    </>
  );
}
