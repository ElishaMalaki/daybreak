'use client';

import React, { useState, useEffect, useRef } from 'react';
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
{ label: 'Late Night', image: 'https://images.unsplash.com/photo-1518066000714-58c45f1a2c0a', imageAlt: 'Deep night sky with countless stars and the Milky Way galaxy visible in full splendor', overlayGradient: 'linear-gradient(180deg, rgba(5,8,20,0.65) 0%, rgba(5,8,20,0.50) 50%, rgba(5,8,20,0.70) 100%)', textColor: '#F2F6FF', linkColor: 'rgba(220,230,255,0.75)', buttonBg: '#F2F6FF', buttonText: '#0B0E14', badgeBg: 'rgba(255,255,255,0.08)', badgeText: 'rgba(220,230,255,0.9)', logoColor: '#F2F6FF' }];


const daytimePhotoPool: {url: string;alt: string;}[] = [
{ url: "https://images.unsplash.com/photo-1675210266448-5d6f08ee26b9", alt: 'Dramatic golden sunset with towering cumulus clouds lit from below in vivid orange and pink hues' },
{ url: "https://images.unsplash.com/photo-1593358934220-ff87120a32c6", alt: 'Breathtaking sunset over rolling hills with fiery red and amber clouds stretching across the sky' },
{ url: "https://images.unsplash.com/photo-1656245606916-e9316100126c", alt: 'Majestic sunset reflecting on a calm lake with brilliant orange and purple clouds mirrored in the water' },
{ url: "https://images.unsplash.com/photo-1694369878451-743f58c824da", alt: 'Stunning golden hour sky with layered clouds glowing in shades of orange, gold and deep crimson' },
{ url: "https://images.unsplash.com/photo-1632913762226-81f4ec3cca83", alt: 'Epic mountain sunset with dramatic storm clouds illuminated in brilliant orange and violet tones' },
{ url: "https://images.unsplash.com/photo-1530178408322-35e0956c6944", alt: 'Beautiful soft pastel sunrise with wispy cirrus clouds painted in pink and lavender over the horizon' },
{ url: "https://images.unsplash.com/photo-1555225432-a8313e60bae2", alt: 'Spectacular sunset with massive cumulonimbus clouds glowing deep orange and red against a blue sky' },
{ url: "https://images.unsplash.com/photo-1732604792721-fe8accd402dc", alt: 'Golden sunrise with rays of light breaking through dramatic clouds over a misty landscape' },
{ url: "https://images.unsplash.com/photo-1463697515689-6e2f2322dcd3", alt: 'Vivid sunset sky with streaks of crimson, amber and gold clouds fanning out from the horizon' },
{ url: "https://images.unsplash.com/photo-1696788729583-69a21eb20e1d", alt: 'Peaceful sunset over open fields with soft pink and orange clouds drifting across a wide sky' },
{ url: "https://images.unsplash.com/photo-1693181663619-bf707de7bafc", alt: 'Dramatic sunset with large billowing clouds in deep orange and purple tones over a silhouetted landscape' },
{ url: "https://images.unsplash.com/photo-1622083257240-8ee01fc91d7d", alt: 'Magnificent alpine sunset with glowing clouds in shades of rose, gold and violet above mountain peaks' },
{ url: "https://images.unsplash.com/photo-1643615498592-e569505b3129", alt: 'Warm golden afternoon sky with fluffy cumulus clouds casting long shadows over a sunlit landscape' },
{ url: "https://images.unsplash.com/photo-1626888965246-8268b2fce221", alt: 'Brilliant sunset with layers of cloud in deep red, orange and yellow stretching to the horizon' },
{ url: "https://images.unsplash.com/photo-1638150927499-23c630720c5f", alt: 'Stunning cloudscape at golden hour with towering clouds lit in warm amber and peach tones' },
{ url: "https://images.unsplash.com/photo-1609504042921-8f1d598da22a", alt: 'Serene sunrise with soft pink and gold clouds reflected in still water below a glowing horizon' },
{ url: "https://images.unsplash.com/photo-1725482429069-8b01c950d79e", alt: 'Fiery sunset with dramatic cloud formations in deep orange, red and purple hues filling the sky' },
{ url: "https://images.unsplash.com/photo-1669988022776-d3349a323b4a", alt: 'Beautiful midday sky with large white cumulus clouds against a vivid blue backdrop over open land' },
{ url: "https://images.unsplash.com/photo-1636630511807-1dc962efed8a", alt: 'Glorious sunset with streaks of gold and crimson light breaking through layered clouds on the horizon' },
{ url: "https://images.unsplash.com/photo-1661771268191-9e8aa921ab47", alt: 'Warm sunset sky with scattered clouds glowing in rich amber and rose tones above a calm landscape' },
{ url: "https://images.unsplash.com/photo-1690994641245-a896a5219917", alt: 'Spectacular ocean sunset with blazing orange and red clouds reflected on the shimmering water surface' },
{ url: "https://images.unsplash.com/photo-1670460388929-58bffa6d090a", alt: 'Dramatic cloudscape with towering storm clouds lit in gold and orange at the edge of sunset' },
{ url: "https://images.unsplash.com/photo-1660153842172-61cb1a32fbed", alt: 'Breathtaking sunrise with rays of light piercing through dramatic clouds over a misty mountain valley' },
{ url: "https://images.unsplash.com/photo-1455162897425-52c78ac32377", alt: 'Peaceful countryside sunset with soft orange and pink clouds drifting over rolling green hills' },
{ url: "https://images.unsplash.com/photo-1586822685447-0061795e6ff5", alt: 'Stunning sunset with large cumulus clouds glowing in brilliant orange and gold against a deep blue sky' },
{ url: "https://images.unsplash.com/photo-1628334704271-2d51238d9387", alt: 'Beautiful sunset with streaks of crimson and amber light breaking through layered clouds on the horizon' },
{ url: "https://images.unsplash.com/photo-1536199027427-bcefd3969db3", alt: 'Bright midday sky with large fluffy white clouds casting dramatic shadows over a sunlit landscape' },
{ url: "https://images.unsplash.com/photo-1568919428400-32bcc0d0db1d", alt: 'Warm afternoon light with golden clouds and long shadows stretching across an open field at sunset' },
{ url: "https://img.rocket.new/generatedImages/rocket_gen_img_19b4cc046-1778740601730.png", alt: 'Vivid sunrise over mountain peaks with brilliant orange and gold clouds filling the sky' },
{ url: "https://images.unsplash.com/photo-1715229890122-ecd143b963fa", alt: 'Golden hour clouds with warm amber and peach tones glowing over a tranquil landscape' }];


const DAYTIME_LABELS = new Set(['Sunrise', 'Morning', 'Midday', 'Afternoon', 'Sunset']);

function pickDaytimePhoto(seed: number): {url: string;alt: string;} {
  return daytimePhotoPool[seed % daytimePhotoPool.length];
}

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

export default function TermsPage() {
  const [currentConfig, setCurrentConfig] = useState<TimeOfDay>(timeConfigs[3]);
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [photoIndex, setPhotoIndex] = useState(0);
  const photoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const now = new Date();
    const config = getTimeConfig(now.getHours());
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    setCurrentConfig(config);
    setCurrentTime(timeStr);
    setPhotoIndex(now.getSeconds() % daytimePhotoPool.length);
    setMounted(true);
    const interval = setInterval(() => {
      const n = new Date();
      setCurrentTime(n.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
      setCurrentConfig(getTimeConfig(n.getHours()));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (photoTimerRef.current) clearInterval(photoTimerRef.current);
    photoTimerRef.current = setInterval(() => {
      setPhotoIndex((prev) => (prev + 1) % daytimePhotoPool.length);
    }, 25000);
    return () => {
      if (photoTimerRef.current) clearInterval(photoTimerRef.current);
    };
  }, [mounted]);

  const cfg = mounted ? currentConfig : timeConfigs[3];
  const currentPhoto = DAYTIME_LABELS.has(cfg.label) ?
  pickDaytimePhoto(photoIndex) :
  { url: cfg.image, alt: cfg.imageAlt };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .tc-root { min-height: 100vh; position: relative; overflow-x: hidden; }
        .tc-bg { position: fixed; inset: 0; z-index: 0; background-size: cover; background-position: center; background-repeat: no-repeat; transition: background-image 3s ease-in-out; }
        .tc-overlay { position: fixed; inset: 0; z-index: 1; pointer-events: none; }
        .tc-grain { position: fixed; inset: 0; z-index: 2; pointer-events: none; opacity: 0.07; mix-blend-mode: overlay; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E"); background-size: 300px 300px; }
        .tc-nav { position: fixed; top: 0; left: 0; right: 0; z-index: 40; padding: 18px 4vw 8px; display: flex; align-items: center; }
        .tc-logo { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 17px; letter-spacing: -0.02em; text-decoration: none; transition: opacity 0.2s; }
        .tc-logo:hover { opacity: 0.75; }
        .tc-logo-img { width: 28px; height: 28px; border-radius: 6px; object-fit: cover; }
        .tc-nav-spacer { flex: 1; }
        .tc-nav-time { font-size: 13px; font-weight: 600; margin-right: 20px; opacity: 0.7; }
        .tc-nav-links { display: flex; align-items: center; gap: 4px; margin-right: 16px; }
        .tc-nav-link { font-size: 13px; font-weight: 600; text-decoration: none; padding: 6px 12px; border-radius: 999px; transition: opacity 0.2s, background 0.2s; opacity: 0.75; }
        .tc-nav-link:hover { opacity: 1; background: rgba(255,255,255,0.12); }
        .tc-nav-btn { border: 0; border-radius: 999px; padding: 10px 22px; height: 38px; display: inline-flex; align-items: center; font-size: 14px; font-weight: 600; cursor: pointer; font-family: inherit; transition: transform 0.2s; text-decoration: none; }
        .tc-nav-btn:hover { transform: translateY(-1px); }
        .tc-content { position: relative; z-index: 10; padding: 110px 4vw 80px; max-width: 760px; margin: 0 auto; }
        .tc-card { border-radius: 24px; backdrop-filter: blur(24px) saturate(1.5); -webkit-backdrop-filter: blur(24px) saturate(1.5); border: 1px solid rgba(255,255,255,0.18); padding: 48px; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
        .tc-eyebrow { font-size: 12px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; opacity: 0.55; margin-bottom: 12px; }
        .tc-title { font-size: clamp(28px, 3.5vw, 44px); font-weight: 700; letter-spacing: -0.03em; line-height: 1.1; margin-bottom: 8px; }
        .tc-updated { font-size: 13px; font-weight: 500; opacity: 0.5; margin-bottom: 36px; }
        .tc-divider { height: 1px; background: rgba(255,255,255,0.15); margin: 32px 0; }
        .tc-section-title { font-size: 16px; font-weight: 700; letter-spacing: -0.01em; margin-bottom: 10px; }
        .tc-body { font-size: 14px; font-weight: 400; line-height: 1.75; opacity: 0.75; }
        .tc-list { font-size: 14px; font-weight: 400; line-height: 1.75; opacity: 0.75; padding-left: 20px; margin-top: 8px; }
        .tc-list li { margin-bottom: 4px; }
        .tc-contact-link { font-weight: 600; text-decoration: underline; text-underline-offset: 3px; opacity: 0.9; }
        .tc-footer { position: relative; z-index: 10; padding: 0 4vw 32px; display: flex; align-items: center; justify-content: space-between; max-width: 760px; margin: 0 auto; }
        .tc-footer-links { display: flex; align-items: center; gap: 4px; font-size: 13px; font-weight: 600; }
        .tc-footer-link { display: flex; align-items: center; min-height: 44px; padding: 0 8px; text-decoration: none; transition: opacity 0.2s; opacity: 0.7; }
        .tc-footer-link:hover { opacity: 1; }
        .tc-period-pill { display: flex; align-items: center; gap: 8px; padding: 8px 16px; border-radius: 999px; backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border: 1px solid rgba(255,255,255,0.18); font-size: 13px; font-weight: 600; }
        .tc-period-dot { width: 7px; height: 7px; border-radius: 50%; }
        @keyframes tcFadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .tc-content { animation: tcFadeUp 0.8s cubic-bezier(0.23,1,0.32,1) both; }
        @media (max-width: 600px) { .tc-nav-links { display: none; } .tc-nav-time { display: none; } .tc-card { padding: 28px 20px; } }
      `}</style>

      <div className="tc-root">
        <div className="tc-bg" style={{ backgroundImage: `url(${currentPhoto.url})` }} role="img" aria-label={currentPhoto.alt} />
        <div className="tc-overlay" style={{ background: cfg.overlayGradient }} aria-hidden="true" />
        <div className="tc-grain" aria-hidden="true" />

        <nav className="tc-nav" aria-label="Earth AI">
          <Link href="/" className="tc-logo" style={{ color: cfg.logoColor }}>
            <Image src="/assets/images/h9O7B-1789370942958.jpg" alt="Earth AI logo" width={28} height={28} className="tc-logo-img" />
            <span>Earth AI</span>
          </Link>
          <div className="tc-nav-spacer" />
          {mounted && <span className="tc-nav-time" style={{ color: cfg.logoColor }}>{currentTime}</span>}
          <div className="tc-nav-links">
            <Link href="/agriculture" className="tc-nav-link" style={{ color: cfg.logoColor }}>Agriculture</Link>
            <Link href="/finance" className="tc-nav-link" style={{ color: cfg.logoColor }}>Finance</Link>
          </div>
          <Link href="/" className="tc-nav-btn" style={{ background: cfg.buttonBg, color: cfg.buttonText }}>Home</Link>
        </nav>

        <div className="tc-content">
          <div className="tc-card" style={{ background: cfg.badgeBg, color: cfg.textColor }}>
            <div className="tc-eyebrow" style={{ color: cfg.textColor }}>Legal</div>
            <h1 className="tc-title" style={{ color: cfg.textColor }}>Terms of Service</h1>
            <div className="tc-updated" style={{ color: cfg.textColor }}>Last updated: September 2026</div>

            <div className="tc-section-title" style={{ color: cfg.textColor }}>1. Acceptance of Terms</div>
            <p className="tc-body" style={{ color: cfg.textColor }}>By accessing or using Earth AI&apos;s website and AI intelligence products (&quot;Services&quot;), you agree to be bound by these Terms of Service. If you do not agree, please do not use our Services.</p>

            <div className="tc-divider" />

            <div className="tc-section-title" style={{ color: cfg.textColor }}>2. Description of Services</div>
            <p className="tc-body" style={{ color: cfg.textColor }}>Earth AI provides specialized artificial intelligence products for the agriculture and finance industries, including but not limited to market analysis, farm data intelligence, decision support, risk modeling, and AI research assistants. Features may change over time as we improve our platform.</p>

            <div className="tc-divider" />

            <div className="tc-section-title" style={{ color: cfg.textColor }}>3. Eligibility</div>
            <p className="tc-body" style={{ color: cfg.textColor }}>You must be at least 18 years of age and have the legal capacity to enter into a binding agreement to use our Services. By using Earth AI, you represent that you meet these requirements.</p>

            <div className="tc-divider" />

            <div className="tc-section-title" style={{ color: cfg.textColor }}>4. Permitted Use</div>
            <p className="tc-body" style={{ color: cfg.textColor }}>You agree to use our Services only for lawful purposes. You must not:</p>
            <ul className="tc-list" style={{ color: cfg.textColor }}>
              <li>Use the Services to engage in fraudulent, deceptive, or harmful activities.</li>
              <li>Attempt to reverse-engineer, copy, or redistribute our AI models or proprietary data.</li>
              <li>Interfere with or disrupt the integrity or performance of the Services.</li>
              <li>Use automated tools to scrape, crawl, or extract data without written permission.</li>
              <li>Violate any applicable laws or regulations in your jurisdiction.</li>
            </ul>

            <div className="tc-divider" />

            <div className="tc-section-title" style={{ color: cfg.textColor }}>5. Intellectual Property</div>
            <p className="tc-body" style={{ color: cfg.textColor }}>All content, AI models, algorithms, designs, and software comprising the Earth AI platform are the exclusive property of Earth AI and its licensors. Nothing in these Terms grants you ownership of any intellectual property rights in our Services.</p>

            <div className="tc-divider" />

            <div className="tc-section-title" style={{ color: cfg.textColor }}>6. AI Output Disclaimer</div>
            <p className="tc-body" style={{ color: cfg.textColor }}>Earth AI&apos;s intelligence products provide data-driven insights and analysis. These outputs are for informational purposes only and do not constitute financial advice, agronomic recommendations, or professional consultation. You are solely responsible for decisions made based on AI-generated content.</p>

            <div className="tc-divider" />

            <div className="tc-section-title" style={{ color: cfg.textColor }}>7. Limitation of Liability</div>
            <p className="tc-body" style={{ color: cfg.textColor }}>To the maximum extent permitted by law, Earth AI shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Services, including but not limited to financial losses, crop failures, or data inaccuracies.</p>

            <div className="tc-divider" />

            <div className="tc-section-title" style={{ color: cfg.textColor }}>8. Termination</div>
            <p className="tc-body" style={{ color: cfg.textColor }}>We reserve the right to suspend or terminate your access to the Services at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users, Earth AI, or third parties.</p>

            <div className="tc-divider" />

            <div className="tc-section-title" style={{ color: cfg.textColor }}>9. Governing Law</div>
            <p className="tc-body" style={{ color: cfg.textColor }}>These Terms shall be governed by and construed in accordance with applicable law. Any disputes arising under these Terms shall be resolved through binding arbitration or in the courts of competent jurisdiction.</p>

            <div className="tc-divider" />

            <div className="tc-section-title" style={{ color: cfg.textColor }}>10. Contact</div>
            <p className="tc-body" style={{ color: cfg.textColor }}>
              For questions about these Terms, contact us at{' '}
              <a href="mailto:legal@earthai.com" className="tc-contact-link" style={{ color: cfg.textColor }}>legal@earthai.com</a>.
            </p>
          </div>
        </div>

        <footer className="tc-footer">
          <div className="tc-footer-links" style={{ color: cfg.linkColor }}>
            <Link href="/" className="tc-footer-link" style={{ color: 'inherit' }}>Home</Link>
            <Link href="/agriculture" className="tc-footer-link" style={{ color: 'inherit' }}>Agriculture</Link>
            <Link href="/finance" className="tc-footer-link" style={{ color: 'inherit' }}>Finance</Link>
            <Link href="/privacy" className="tc-footer-link" style={{ color: 'inherit' }}>Privacy</Link>
            <Link href="/terms" className="tc-footer-link" style={{ color: 'inherit' }}>Terms</Link>
          </div>
          {mounted &&
          <div className="tc-period-pill" style={{ background: cfg.badgeBg, color: cfg.badgeText }}>
              <span className="tc-period-dot" style={{ background: cfg.buttonBg === '#F2F6FF' || cfg.buttonBg === '#EAF0FF' || cfg.buttonBg === '#E8EEFF' || cfg.buttonBg === '#F0EAFF' ? 'rgba(150,170,255,0.8)' : cfg.buttonBg }} aria-hidden="true" />
              <span>{cfg.label}</span>
            </div>
          }
        </footer>
      </div>
    </>);

}