'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface TimeOfDay {
  label: string;
  period: string;
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
  label: 'Night', period: '12:00 AM – 4:59 AM',
  image: 'https://images.unsplash.com/photo-1720948744617-5b2fe92d78e2',
  imageAlt: 'Stunning night sky filled with stars and the Milky Way over a dark landscape',
  overlayGradient: 'linear-gradient(180deg, rgba(5,8,20,0.55) 0%, rgba(5,8,20,0.30) 50%, rgba(5,8,20,0.65) 100%)',
  textColor: '#F2F6FF', linkColor: 'rgba(220,230,255,0.75)', buttonBg: '#F2F6FF', buttonText: '#0B0E14',
  badgeBg: 'rgba(255,255,255,0.10)', badgeText: 'rgba(220,230,255,0.9)', logoColor: '#F2F6FF'
},
{
  label: 'Before Dawn', period: '5:00 AM – 5:59 AM',
  image: 'https://images.unsplash.com/photo-1698684001896-cc7998ca1cf2',
  imageAlt: 'Pre-dawn sky with deep blue and purple hues just before sunrise over the horizon',
  overlayGradient: 'linear-gradient(180deg, rgba(10,12,35,0.50) 0%, rgba(10,12,35,0.25) 50%, rgba(10,12,35,0.55) 100%)',
  textColor: '#EAF0FF', linkColor: 'rgba(200,215,255,0.75)', buttonBg: '#EAF0FF', buttonText: '#0B0E14',
  badgeBg: 'rgba(255,255,255,0.10)', badgeText: 'rgba(200,215,255,0.9)', logoColor: '#EAF0FF'
},
{
  label: 'Sunrise', period: '6:00 AM – 7:59 AM',
  image: 'https://images.unsplash.com/photo-1720934176426-95b299a3e8cd',
  imageAlt: 'Breathtaking sunrise with golden and orange light bursting over the horizon with clouds',
  overlayGradient: 'linear-gradient(180deg, rgba(20,15,5,0.45) 0%, rgba(20,15,5,0.20) 50%, rgba(20,15,5,0.55) 100%)',
  textColor: '#1A1008', linkColor: 'rgba(30,20,10,0.65)', buttonBg: '#1A1008', buttonText: '#FFFFFF',
  badgeBg: 'rgba(255,255,255,0.25)', badgeText: 'rgba(30,20,10,0.85)', logoColor: '#1A1008'
},
{
  label: 'Morning', period: '8:00 AM – 10:59 AM',
  image: 'https://images.unsplash.com/photo-1539643973272-3c845cfb223a',
  imageAlt: 'Bright clear blue morning sky with soft white clouds and sunlight',
  overlayGradient: 'linear-gradient(180deg, rgba(10,40,90,0.40) 0%, rgba(10,40,90,0.15) 50%, rgba(10,40,90,0.45) 100%)',
  textColor: '#0B0E14', linkColor: 'rgba(15,25,60,0.60)', buttonBg: '#101320', buttonText: '#FFFFFF',
  badgeBg: 'rgba(255,255,255,0.28)', badgeText: 'rgba(11,14,20,0.80)', logoColor: '#0B0E14'
},
{
  label: 'Midday', period: '11:00 AM – 1:59 PM',
  image: 'https://images.unsplash.com/photo-1666068510008-f44c3637d3c5',
  imageAlt: 'Brilliant midday blue sky with dramatic white cumulus clouds and bright sunlight',
  overlayGradient: 'linear-gradient(180deg, rgba(5,30,80,0.42) 0%, rgba(5,30,80,0.18) 50%, rgba(5,30,80,0.48) 100%)',
  textColor: '#0B0E14', linkColor: 'rgba(15,25,60,0.60)', buttonBg: '#101320', buttonText: '#FFFFFF',
  badgeBg: 'rgba(255,255,255,0.28)', badgeText: 'rgba(11,14,20,0.80)', logoColor: '#0B0E14'
},
{
  label: 'Afternoon', period: '2:00 PM – 4:59 PM',
  image: 'https://images.unsplash.com/photo-1682852928580-658315746b4f',
  imageAlt: 'Warm afternoon sky with golden sunlight filtering through clouds over a landscape',
  overlayGradient: 'linear-gradient(180deg, rgba(15,20,50,0.42) 0%, rgba(15,20,50,0.18) 50%, rgba(15,20,50,0.48) 100%)',
  textColor: '#0B0E14', linkColor: 'rgba(15,25,60,0.60)', buttonBg: '#101320', buttonText: '#FFFFFF',
  badgeBg: 'rgba(255,255,255,0.28)', badgeText: 'rgba(11,14,20,0.80)', logoColor: '#0B0E14'
},
{
  label: 'Sunset', period: '5:00 PM – 6:59 PM',
  image: 'https://images.unsplash.com/photo-1580662603788-b0548c665e78',
  imageAlt: 'Spectacular sunset with vivid orange, red and purple colors blazing across the sky',
  overlayGradient: 'linear-gradient(180deg, rgba(20,10,5,0.45) 0%, rgba(20,10,5,0.20) 50%, rgba(20,10,5,0.55) 100%)',
  textColor: '#1A0A05', linkColor: 'rgba(30,15,5,0.65)', buttonBg: '#1A0A05', buttonText: '#FFFFFF',
  badgeBg: 'rgba(255,255,255,0.22)', badgeText: 'rgba(30,15,5,0.85)', logoColor: '#1A0A05'
},
{
  label: 'Evening', period: '7:00 PM – 8:59 PM',
  image: 'https://images.unsplash.com/photo-1506630536165-474191c19cb4',
  imageAlt: 'Beautiful evening sky with deep purple and pink hues as the sun sets below the horizon',
  overlayGradient: 'linear-gradient(180deg, rgba(15,8,30,0.50) 0%, rgba(15,8,30,0.25) 50%, rgba(15,8,30,0.60) 100%)',
  textColor: '#F0EAFF', linkColor: 'rgba(220,210,255,0.75)', buttonBg: '#F0EAFF', buttonText: '#0B0E14',
  badgeBg: 'rgba(255,255,255,0.10)', badgeText: 'rgba(220,210,255,0.9)', logoColor: '#F0EAFF'
},
{
  label: 'Dusk', period: '9:00 PM – 10:59 PM',
  image: 'https://images.unsplash.com/photo-1561104740-2c5b39dfd2b6',
  imageAlt: 'Deep blue dusk sky with the last traces of light fading on the horizon',
  overlayGradient: 'linear-gradient(180deg, rgba(8,10,28,0.52) 0%, rgba(8,10,28,0.28) 50%, rgba(8,10,28,0.60) 100%)',
  textColor: '#E8EEFF', linkColor: 'rgba(210,220,255,0.75)', buttonBg: '#E8EEFF', buttonText: '#0B0E14',
  badgeBg: 'rgba(255,255,255,0.10)', badgeText: 'rgba(210,220,255,0.9)', logoColor: '#E8EEFF'
},
{
  label: 'Late Night', period: '11:00 PM – 11:59 PM',
  image: 'https://images.unsplash.com/photo-1518066000714-58c45f1a2c0a',
  imageAlt: 'Deep night sky with countless stars and the Milky Way galaxy visible in full splendor',
  overlayGradient: 'linear-gradient(180deg, rgba(5,8,20,0.55) 0%, rgba(5,8,20,0.30) 50%, rgba(5,8,20,0.65) 100%)',
  textColor: '#F2F6FF', linkColor: 'rgba(220,230,255,0.75)', buttonBg: '#F2F6FF', buttonText: '#0B0E14',
  badgeBg: 'rgba(255,255,255,0.10)', badgeText: 'rgba(220,230,255,0.9)', logoColor: '#F2F6FF'
}];


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

const features = [
{
  id: 'market',
  title: 'Agricultural Intelligence\n& Market Analysis',
  description: 'Real-time commodity pricing, supply chain signals, and global trade pattern analysis — giving agribusinesses a decisive edge before markets move.',
  icon:
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
        <polyline points="16 7 22 7 22 13" />
      </svg>,

  size: 'large',
  accent: 'rgba(120,200,100,0.15)'
},
{
  id: 'farm-data',
  title: 'Farm Data Intelligence',
  description: 'Unified sensor, satellite, and IoT data streams transformed into actionable farm-level insights — soil moisture, yield forecasts, and equipment health in one view.',
  icon:
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>,

  size: 'small',
  accent: 'rgba(80,160,220,0.15)'
},
{
  id: 'decision',
  title: 'Agricultural Decision Support',
  description: 'AI-driven recommendations for planting windows, irrigation scheduling, and input optimization — decisions backed by multi-variable models, not guesswork.',
  icon:
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v4l3 3" />
      </svg>,

  size: 'small',
  accent: 'rgba(200,150,80,0.15)'
},
{
  id: 'risk',
  title: 'Crop, Livestock & Farm Risk Intelligence',
  description: 'Predictive risk scoring across weather events, pest pressure, disease vectors, and market volatility — so you protect what you\'ve grown before threats materialize.',
  icon:
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>,

  size: 'large',
  accent: 'rgba(220,100,80,0.15)'
},
{
  id: 'research',
  title: 'Agricultural AI Research\n& Intelligence Assistant',
  description: 'An always-on research companion trained on agronomic literature, climate science, and market data — answering complex questions with cited, domain-specific precision.',
  icon:
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
        <line x1="11" y1="8" x2="11" y2="14" />
        <line x1="8" y1="11" x2="14" y2="11" />
      </svg>,

  size: 'full',
  accent: 'rgba(140,100,220,0.15)'
}];


export default function AgriculturePage() {
  const [currentConfig, setCurrentConfig] = useState<TimeOfDay>(timeConfigs[3]);
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [photoIndex, setPhotoIndex] = useState(0);
  const photoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    const config = getTimeConfig(hour);
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
        html, body { height: 100%; font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .ag-root { min-height: 100vh; position: relative; overflow-x: hidden; }
        .ag-bg {
          position: fixed; inset: 0; z-index: 0;
          background-size: cover; background-position: center; background-repeat: no-repeat;
          transition: background-image 3s cubic-bezier(0.4,0,0.2,1);
        }
        .ag-overlay { position: fixed; inset: 0; z-index: 1; pointer-events: none; }
        .ag-grain {
          position: fixed; inset: 0; z-index: 2; pointer-events: none; opacity: 0.07; mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 300px 300px;
        }
        .ag-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 40;
          padding: 18px 4vw 8px;
          display: flex; align-items: center; gap: 0;
        }
        .ag-logo {
          display: flex; align-items: center; gap: 8px;
          font-weight: 700; font-size: 17px; letter-spacing: -0.02em;
          text-decoration: none; transition: opacity 0.2s; flex-shrink: 0;
        }
        .ag-logo:hover { opacity: 0.75; }
        .ag-logo-img { width: 28px; height: 28px; border-radius: 6px; object-fit: cover; flex-shrink: 0; }
        .ag-nav-spacer { flex: 1; }
        .ag-nav-time { font-size: 13px; font-weight: 600; letter-spacing: 0.01em; margin-right: 20px; opacity: 0.7; }
        .ag-nav-links { display: flex; align-items: center; gap: 4px; margin-right: 16px; }
        .ag-nav-link {
          font-size: 13px; font-weight: 600; text-decoration: none; padding: 6px 12px;
          border-radius: 999px; transition: opacity 0.2s, background 0.2s; opacity: 0.75;
        }
        .ag-nav-link:hover { opacity: 1; background: rgba(255,255,255,0.12); }
        .ag-nav-link.active { opacity: 1; background: rgba(255,255,255,0.18); }
        .ag-nav-btn {
          border: 0; border-radius: 999px; padding: 10px 22px; height: 38px;
          display: inline-flex; align-items: center; justify-content: center;
          font-size: 14px; font-weight: 600; letter-spacing: -0.01em;
          cursor: pointer; font-family: inherit;
          transition: transform 0.2s cubic-bezier(0.23,1,0.32,1), box-shadow 0.2s;
          text-decoration: none;
        }
        .ag-nav-btn:hover { transform: translateY(-1px); }
        .ag-content {
          position: relative; z-index: 10;
          padding: 120px 4vw 80px;
          max-width: 1100px; margin: 0 auto;
        }
        .ag-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 12px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
          padding: 6px 14px; border-radius: 999px;
          backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.20);
          margin-bottom: 24px;
        }
        .ag-title {
          font-size: clamp(32px, 4.5vw, 60px); font-weight: 700;
          letter-spacing: -0.035em; line-height: 1.06;
          margin-bottom: 20px; max-width: 700px;
        }
        .ag-subtitle {
          font-size: clamp(15px, 1.5vw, 18px); font-weight: 400; line-height: 1.65;
          max-width: 560px; opacity: 0.72; margin-bottom: 56px;
        }
        .ag-bento {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          grid-template-rows: auto;
          gap: 14px;
        }
        .ag-card {
          border-radius: 20px;
          backdrop-filter: blur(20px) saturate(1.4);
          -webkit-backdrop-filter: blur(20px) saturate(1.4);
          border: 1px solid rgba(255,255,255,0.18);
          padding: 28px;
          transition: transform 0.3s cubic-bezier(0.23,1,0.32,1), box-shadow 0.3s;
          cursor: default;
        }
        .ag-card:hover { transform: translateY(-3px); box-shadow: 0 16px 48px rgba(0,0,0,0.18); }
        .ag-card-large { grid-column: span 7; }
        .ag-card-small { grid-column: span 5; }
        .ag-card-full { grid-column: span 12; }
        .ag-card-icon {
          width: 44px; height: 44px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 18px;
          border: 1px solid rgba(255,255,255,0.20);
        }
        .ag-card-title {
          font-size: 17px; font-weight: 700; letter-spacing: -0.02em;
          line-height: 1.25; margin-bottom: 10px; white-space: pre-line;
        }
        .ag-card-desc {
          font-size: 14px; font-weight: 400; line-height: 1.65; opacity: 0.72;
        }
        .ag-footer {
          position: relative; z-index: 10;
          padding: 0 4vw 32px;
          display: flex; align-items: center; justify-content: space-between;
          max-width: 1100px; margin: 0 auto;
        }
        .ag-footer-links { display: flex; align-items: center; gap: 4px; font-size: 13px; font-weight: 600; }
        .ag-footer-link {
          display: flex; align-items: center; min-height: 44px; padding: 0 8px;
          text-decoration: none; transition: opacity 0.2s; opacity: 0.7;
        }
        .ag-footer-link:hover { opacity: 1; }
        .ag-period-pill {
          display: flex; align-items: center; gap: 8px; padding: 8px 16px;
          border-radius: 999px; backdrop-filter: blur(14px) saturate(1.4);
          -webkit-backdrop-filter: blur(14px) saturate(1.4);
          border: 1px solid rgba(255,255,255,0.18);
          font-size: 13px; font-weight: 600; letter-spacing: 0.01em;
        }
        .ag-period-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        @keyframes agFadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .ag-content { animation: agFadeUp 0.8s cubic-bezier(0.23,1,0.32,1) both; }
        @media (max-width: 768px) {
          .ag-card-large, .ag-card-small, .ag-card-full { grid-column: span 12; }
          .ag-nav-links { display: none; }
          .ag-nav-time { display: none; }
        }
      `}</style>

      <div className="ag-root">
        <div className="ag-bg" style={{ backgroundImage: `url(${currentPhoto.url})` }} role="img" aria-label={currentPhoto.alt} />
        <div className="ag-overlay" style={{ background: cfg.overlayGradient }} aria-hidden="true" />
        <div className="ag-grain" aria-hidden="true" />

        {/* Nav */}
        <nav className="ag-nav" aria-label="Earth AI">
          <Link href="/" className="ag-logo" style={{ color: cfg.logoColor }} aria-label="Earth AI — Home">
            <Image src="/assets/images/h9O7B-1789370942958.jpg" alt="Earth AI logo" width={28} height={28} className="ag-logo-img" />
            <span>Earth AI</span>
          </Link>
          <div className="ag-nav-spacer" />
          {mounted && <span className="ag-nav-time" style={{ color: cfg.logoColor }}>{currentTime}</span>}
          <div className="ag-nav-links">
            <Link href="/about" className="ag-nav-link" style={{ color: cfg.logoColor }}>About</Link>
            <Link href="/agriculture" className="ag-nav-link active" style={{ color: cfg.logoColor }}>Agriculture</Link>
            <Link href="/finance" className="ag-nav-link" style={{ color: cfg.logoColor }}>Finance</Link>
          </div>
          <Link href="/login" className="ag-nav-btn" style={{ background: cfg.buttonBg, color: cfg.buttonText }}>Try Intelligence E Now</Link>
        </nav>

        {/* Content */}
        <div className="ag-content">
          <div className="ag-eyebrow" style={{ background: cfg.badgeBg, color: cfg.badgeText }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" /><path d="M12 8v4l3 3" />
            </svg>
            Intelligence E for Agriculture
          </div>

          <h1 className="ag-title" style={{ color: cfg.textColor }}>
            Agricultural Intelligence,<br />built for the real world.
          </h1>
          <p className="ag-subtitle" style={{ color: cfg.textColor }}>
            Five specialized AI capabilities that turn raw farm data, market signals, and climate science into confident, profitable decisions.
          </p>

          {/* Bento grid */}
          <div className="ag-bento">
            {/* Market Analysis — large */}
            <div className="ag-card ag-card-large" style={{ background: `${cfg.badgeBg}`, color: cfg.badgeText, borderColor: 'rgba(255,255,255,0.18)' }}>
              <div className="ag-card-icon" style={{ background: features[0].accent, color: cfg.textColor }}>
                {features[0].icon}
              </div>
              <div className="ag-card-title" style={{ color: cfg.textColor }}>{features[0].title}</div>
              <div className="ag-card-desc" style={{ color: cfg.textColor }}>{features[0].description}</div>
            </div>

            {/* Farm Data — small */}
            <div className="ag-card ag-card-small" style={{ background: cfg.badgeBg, color: cfg.badgeText }}>
              <div className="ag-card-icon" style={{ background: features[1].accent, color: cfg.textColor }}>
                {features[1].icon}
              </div>
              <div className="ag-card-title" style={{ color: cfg.textColor }}>{features[1].title}</div>
              <div className="ag-card-desc" style={{ color: cfg.textColor }}>{features[1].description}</div>
            </div>

            {/* Decision Support — small */}
            <div className="ag-card ag-card-small" style={{ background: cfg.badgeBg, color: cfg.badgeText }}>
              <div className="ag-card-icon" style={{ background: features[2].accent, color: cfg.textColor }}>
                {features[2].icon}
              </div>
              <div className="ag-card-title" style={{ color: cfg.textColor }}>{features[2].title}</div>
              <div className="ag-card-desc" style={{ color: cfg.textColor }}>{features[2].description}</div>
            </div>

            {/* Risk Intelligence — large */}
            <div className="ag-card ag-card-large" style={{ background: cfg.badgeBg, color: cfg.badgeText }}>
              <div className="ag-card-icon" style={{ background: features[3].accent, color: cfg.textColor }}>
                {features[3].icon}
              </div>
              <div className="ag-card-title" style={{ color: cfg.textColor }}>{features[3].title}</div>
              <div className="ag-card-desc" style={{ color: cfg.textColor }}>{features[3].description}</div>
            </div>

            {/* Research Assistant — full width */}
            <div className="ag-card ag-card-full" style={{ background: cfg.badgeBg, color: cfg.badgeText, display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
              <div className="ag-card-icon" style={{ background: features[4].accent, color: cfg.textColor, flexShrink: 0 }}>
                {features[4].icon}
              </div>
              <div>
                <div className="ag-card-title" style={{ color: cfg.textColor }}>{features[4].title}</div>
                <div className="ag-card-desc" style={{ color: cfg.textColor }}>{features[4].description}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="ag-footer">
          <div className="ag-footer-links" style={{ color: cfg.linkColor }}>
            <Link href="/" className="ag-footer-link" style={{ color: 'inherit' }}>Home</Link>
            <Link href="/about" className="ag-footer-link" style={{ color: 'inherit' }}>About</Link>
            <Link href="/agriculture" className="ag-footer-link" style={{ color: 'inherit' }}>Agriculture</Link>
            <Link href="/finance" className="ag-footer-link" style={{ color: 'inherit' }}>Finance</Link>
            <Link href="/privacy" className="ag-footer-link" style={{ color: 'inherit' }}>Privacy</Link>
            <Link href="/terms" className="ag-footer-link" style={{ color: 'inherit' }}>Terms</Link>
          </div>
          {mounted &&
          <div className="ag-period-pill" style={{ background: cfg.badgeBg, color: cfg.badgeText }}>
              <span className="ag-period-dot" style={{ background: cfg.buttonBg === '#F2F6FF' || cfg.buttonBg === '#EAF0FF' || cfg.buttonBg === '#E8EEFF' || cfg.buttonBg === '#F0EAFF' ? 'rgba(150,170,255,0.8)' : cfg.buttonBg }} aria-hidden="true" />
              <span>{cfg.label}</span>
            </div>
          }
        </footer>
      </div>
    </>);

}