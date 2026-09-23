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
  overlayGradient: 'linear-gradient(180deg, rgba(5,8,20,0.72) 0%, rgba(5,8,20,0.55) 50%, rgba(5,8,20,0.75) 100%)',
  textColor: '#F2F6FF', linkColor: 'rgba(220,230,255,0.75)', buttonBg: '#F2F6FF', buttonText: '#0B0E14',
  badgeBg: 'rgba(255,255,255,0.08)', badgeText: 'rgba(220,230,255,0.9)', logoColor: '#F2F6FF'
},
{
  label: 'Before Dawn', period: '5:00 AM – 5:59 AM',
  image: 'https://images.unsplash.com/photo-1698684001896-cc7998ca1cf2',
  imageAlt: 'Pre-dawn sky with deep blue and purple hues just before sunrise over the horizon',
  overlayGradient: 'linear-gradient(180deg, rgba(10,12,35,0.70) 0%, rgba(10,12,35,0.52) 50%, rgba(10,12,35,0.75) 100%)',
  textColor: '#EAF0FF', linkColor: 'rgba(200,215,255,0.75)', buttonBg: '#EAF0FF', buttonText: '#0B0E14',
  badgeBg: 'rgba(255,255,255,0.08)', badgeText: 'rgba(200,215,255,0.9)', logoColor: '#EAF0FF'
},
{
  label: 'Sunrise', period: '6:00 AM – 7:59 AM',
  image: 'https://images.unsplash.com/photo-1720934176426-95b299a3e8cd',
  imageAlt: 'Breathtaking sunrise with golden and orange light bursting over the horizon with clouds',
  overlayGradient: 'linear-gradient(180deg, rgba(20,15,5,0.65) 0%, rgba(20,15,5,0.45) 50%, rgba(20,15,5,0.72) 100%)',
  textColor: '#1A1008', linkColor: 'rgba(30,20,10,0.65)', buttonBg: '#1A1008', buttonText: '#FFFFFF',
  badgeBg: 'rgba(255,255,255,0.22)', badgeText: 'rgba(30,20,10,0.85)', logoColor: '#1A1008'
},
{
  label: 'Morning', period: '8:00 AM – 10:59 AM',
  image: 'https://images.unsplash.com/photo-1539643973272-3c845cfb223a',
  imageAlt: 'Bright clear blue morning sky with soft white clouds and sunlight',
  overlayGradient: 'linear-gradient(180deg, rgba(10,40,90,0.62) 0%, rgba(10,40,90,0.45) 50%, rgba(10,40,90,0.68) 100%)',
  textColor: '#0B0E14', linkColor: 'rgba(15,25,60,0.60)', buttonBg: '#101320', buttonText: '#FFFFFF',
  badgeBg: 'rgba(255,255,255,0.22)', badgeText: 'rgba(11,14,20,0.80)', logoColor: '#0B0E14'
},
{
  label: 'Midday', period: '11:00 AM – 1:59 PM',
  image: 'https://images.unsplash.com/photo-1666068510008-f44c3637d3c5',
  imageAlt: 'Brilliant midday blue sky with dramatic white cumulus clouds and bright sunlight',
  overlayGradient: 'linear-gradient(180deg, rgba(5,30,80,0.62) 0%, rgba(5,30,80,0.45) 50%, rgba(5,30,80,0.68) 100%)',
  textColor: '#0B0E14', linkColor: 'rgba(15,25,60,0.60)', buttonBg: '#101320', buttonText: '#FFFFFF',
  badgeBg: 'rgba(255,255,255,0.22)', badgeText: 'rgba(11,14,20,0.80)', logoColor: '#0B0E14'
},
{
  label: 'Afternoon', period: '2:00 PM – 4:59 PM',
  image: 'https://images.unsplash.com/photo-1682852928580-658315746b4f',
  imageAlt: 'Warm afternoon sky with golden sunlight filtering through clouds over a landscape',
  overlayGradient: 'linear-gradient(180deg, rgba(15,20,50,0.62) 0%, rgba(15,20,50,0.45) 50%, rgba(15,20,50,0.68) 100%)',
  textColor: '#0B0E14', linkColor: 'rgba(15,25,60,0.60)', buttonBg: '#101320', buttonText: '#FFFFFF',
  badgeBg: 'rgba(255,255,255,0.22)', badgeText: 'rgba(11,14,20,0.80)', logoColor: '#0B0E14'
},
{
  label: 'Sunset', period: '5:00 PM – 6:59 PM',
  image: 'https://images.unsplash.com/photo-1580662603788-b0548c665e78',
  imageAlt: 'Spectacular sunset with vivid orange, red and purple colors blazing across the sky',
  overlayGradient: 'linear-gradient(180deg, rgba(20,10,5,0.65) 0%, rgba(20,10,5,0.45) 50%, rgba(20,10,5,0.72) 100%)',
  textColor: '#1A0A05', linkColor: 'rgba(30,15,5,0.65)', buttonBg: '#1A0A05', buttonText: '#FFFFFF',
  badgeBg: 'rgba(255,255,255,0.18)', badgeText: 'rgba(30,15,5,0.85)', logoColor: '#1A0A05'
},
{
  label: 'Evening', period: '7:00 PM – 8:59 PM',
  image: 'https://images.unsplash.com/photo-1506630536165-474191c19cb4',
  imageAlt: 'Beautiful evening sky with deep purple and pink hues as the sun sets below the horizon',
  overlayGradient: 'linear-gradient(180deg, rgba(15,8,30,0.70) 0%, rgba(15,8,30,0.52) 50%, rgba(15,8,30,0.78) 100%)',
  textColor: '#F0EAFF', linkColor: 'rgba(220,210,255,0.75)', buttonBg: '#F0EAFF', buttonText: '#0B0E14',
  badgeBg: 'rgba(255,255,255,0.08)', badgeText: 'rgba(220,210,255,0.9)', logoColor: '#F0EAFF'
},
{
  label: 'Dusk', period: '9:00 PM – 10:59 PM',
  image: 'https://images.unsplash.com/photo-1561104740-2c5b39dfd2b6',
  imageAlt: 'Deep blue dusk sky with the last traces of light fading on the horizon',
  overlayGradient: 'linear-gradient(180deg, rgba(8,10,28,0.72) 0%, rgba(8,10,28,0.55) 50%, rgba(8,10,28,0.78) 100%)',
  textColor: '#E8EEFF', linkColor: 'rgba(210,220,255,0.75)', buttonBg: '#E8EEFF', buttonText: '#0B0E14',
  badgeBg: 'rgba(255,255,255,0.08)', badgeText: 'rgba(210,220,255,0.9)', logoColor: '#E8EEFF'
},
{
  label: 'Late Night', period: '11:00 PM – 11:59 PM',
  image: 'https://images.unsplash.com/photo-1518066000714-58c45f1a2c0a',
  imageAlt: 'Deep night sky with countless stars and the Milky Way galaxy visible in full splendor',
  overlayGradient: 'linear-gradient(180deg, rgba(5,8,20,0.72) 0%, rgba(5,8,20,0.55) 50%, rgba(5,8,20,0.75) 100%)',
  textColor: '#F2F6FF', linkColor: 'rgba(220,230,255,0.75)', buttonBg: '#F2F6FF', buttonText: '#0B0E14',
  badgeBg: 'rgba(255,255,255,0.08)', badgeText: 'rgba(220,230,255,0.9)', logoColor: '#F2F6FF'
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

export default function AboutPage() {
  const [cfg, setCfg] = useState<TimeOfDay>(timeConfigs[3]);
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [photoIndex, setPhotoIndex] = useState(0);
  const photoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();
    const config = getTimeConfig(hour);
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    setCfg(config);
    setCurrentTime(timeStr);
    setPhotoIndex(now.getSeconds() % daytimePhotoPool.length);
    setMounted(true);

    const interval = setInterval(() => {
      const n = new Date();
      setCurrentTime(n.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }));
      setCfg(getTimeConfig(n.getHours()));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (photoTimerRef.current) clearInterval(photoTimerRef.current);
    photoTimerRef.current = setInterval(() => {
      setPhotoIndex((prev) => (prev + 1) % daytimePhotoPool.length);
    }, 8000);
    return () => {
      if (photoTimerRef.current) clearInterval(photoTimerRef.current);
    };
  }, [mounted]);

  const activeCfg = mounted ? cfg : timeConfigs[3];
  const currentPhoto = DAYTIME_LABELS.has(activeCfg.label) ?
  pickDaytimePhoto(photoIndex) :
  { url: activeCfg.image, alt: activeCfg.imageAlt };

  const cardBg = activeCfg.badgeBg;
  const cardBorder = 'rgba(255,255,255,0.15)';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
        .ab-root { min-height: 100vh; position: relative; overflow-x: hidden; }
        .ab-bg {
          position: fixed; inset: 0; z-index: 0;
          background-size: cover; background-position: center; background-repeat: no-repeat;
        }
        .ab-overlay { position: fixed; inset: 0; z-index: 1; pointer-events: none; }
        .ab-grain {
          position: fixed; inset: 0; z-index: 2; pointer-events: none; opacity: 0.07; mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 300px 300px;
        }
        .ab-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 40;
          padding: 18px 4vw 8px;
          display: flex; align-items: center; gap: 0;
        }
        .ab-logo {
          display: flex; align-items: center; gap: 8px;
          font-weight: 700; font-size: 17px; letter-spacing: -0.02em;
          text-decoration: none; transition: opacity 0.2s; flex-shrink: 0;
        }
        .ab-logo:hover { opacity: 0.75; }
        .ab-logo-img { width: 28px; height: 28px; border-radius: 6px; object-fit: cover; flex-shrink: 0; }
        .ab-nav-spacer { flex: 1; }
        .ab-nav-time { font-size: 13px; font-weight: 600; letter-spacing: 0.01em; margin-right: 20px; opacity: 0.7; }
        .ab-nav-links { display: flex; align-items: center; gap: 4px; margin-right: 16px; }
        .ab-nav-link {
          font-size: 13px; font-weight: 600; text-decoration: none; padding: 6px 12px;
          border-radius: 999px; transition: opacity 0.2s, background 0.2s; opacity: 0.75;
        }
        .ab-nav-link:hover { opacity: 1; background: rgba(255,255,255,0.12); }
        .ab-nav-link.active { opacity: 1; background: rgba(255,255,255,0.18); }
        .ab-nav-btn {
          border: 0; border-radius: 999px; padding: 10px 22px; height: 38px;
          display: inline-flex; align-items: center; justify-content: center;
          font-size: 14px; font-weight: 600; letter-spacing: -0.01em;
          cursor: pointer; font-family: inherit;
          transition: transform 0.2s cubic-bezier(0.23,1,0.32,1), box-shadow 0.2s;
          text-decoration: none;
        }
        .ab-nav-btn:hover { transform: translateY(-1px); }
        .ab-content {
          position: relative; z-index: 10;
          padding: 110px 4vw 80px;
          max-width: 860px; margin: 0 auto;
        }
        .ab-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 12px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
          padding: 6px 14px; border-radius: 999px;
          backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.20);
          margin-bottom: 28px;
        }
        .ab-page-title {
          font-size: clamp(36px, 5vw, 64px); font-weight: 700;
          letter-spacing: -0.04em; line-height: 1.04;
          margin-bottom: 22px;
        }
        .ab-page-lead {
          font-size: clamp(16px, 1.6vw, 19px); font-weight: 400; line-height: 1.65;
          max-width: 620px; opacity: 0.78; margin-bottom: 64px;
        }
        .ab-section { margin-bottom: 56px; }
        .ab-section-label {
          font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;
          opacity: 0.5; margin-bottom: 14px;
        }
        .ab-section-title {
          font-size: clamp(22px, 2.4vw, 30px); font-weight: 700;
          letter-spacing: -0.03em; line-height: 1.15; margin-bottom: 14px;
        }
        .ab-section-body {
          font-size: clamp(14px, 1.3vw, 16px); font-weight: 400; line-height: 1.75;
          opacity: 0.78; max-width: 680px;
        }
        .ab-divider {
          height: 1px; background: rgba(255,255,255,0.12);
          margin: 56px 0;
        }
        .ab-products-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 16px;
          margin-top: 28px;
        }
        .ab-product-card {
          border-radius: 18px;
          backdrop-filter: blur(20px) saturate(1.4);
          -webkit-backdrop-filter: blur(20px) saturate(1.4);
          border: 1px solid rgba(255,255,255,0.15);
          padding: 28px 28px 24px;
        }
        .ab-product-name {
          font-size: 16px; font-weight: 700; letter-spacing: -0.02em;
          margin-bottom: 8px;
        }
        .ab-product-desc {
          font-size: 14px; font-weight: 400; line-height: 1.65; opacity: 0.72;
        }
        .ab-product-badge {
          display: inline-block; margin-top: 14px;
          font-size: 11px; font-weight: 700; letter-spacing: 0.10em; text-transform: uppercase;
          padding: 4px 10px; border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.20);
          opacity: 0.65;
        }
        .ab-philosophy-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
          margin-top: 28px;
        }
        .ab-philosophy-item {
          border-radius: 14px;
          backdrop-filter: blur(16px) saturate(1.3);
          -webkit-backdrop-filter: blur(16px) saturate(1.3);
          border: 1px solid rgba(255,255,255,0.13);
          padding: 20px 20px 18px;
        }
        .ab-philosophy-title {
          font-size: 14px; font-weight: 700; letter-spacing: -0.01em;
          margin-bottom: 6px;
        }
        .ab-philosophy-desc {
          font-size: 13px; font-weight: 400; line-height: 1.6; opacity: 0.68;
        }
        .ab-cta-row {
          margin-top: 64px; display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
        }
        .ab-cta-btn {
          border: 0; border-radius: 999px; padding: 14px 36px;
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          font-size: 16px; font-weight: 600; letter-spacing: -0.01em;
          cursor: pointer; font-family: inherit;
          transition: transform 0.2s cubic-bezier(0.23,1,0.32,1), box-shadow 0.25s;
          box-shadow: 0 4px 20px rgba(0,0,0,0.16);
          text-decoration: none;
        }
        .ab-cta-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(0,0,0,0.20); }
        .ab-cta-link {
          font-size: 14px; font-weight: 600; text-decoration: none; opacity: 0.65;
          transition: opacity 0.2s;
        }
        .ab-cta-link:hover { opacity: 1; }
        .ab-footer {
          position: relative; z-index: 10;
          padding: 0 4vw 32px;
          display: flex; align-items: center; justify-content: space-between;
          max-width: 860px; margin: 0 auto;
        }
        .ab-footer-links { display: flex; align-items: center; gap: 4px; font-size: 13px; font-weight: 600; }
        .ab-footer-link {
          display: flex; align-items: center; min-height: 44px; padding: 0 8px;
          text-decoration: none; transition: opacity 0.2s; opacity: 0.7;
        }
        .ab-footer-link:hover { opacity: 1; }
        .ab-period-pill {
          display: flex; align-items: center; gap: 8px; padding: 8px 16px;
          border-radius: 999px; backdrop-filter: blur(14px) saturate(1.4);
          -webkit-backdrop-filter: blur(14px) saturate(1.4);
          border: 1px solid rgba(255,255,255,0.18);
          font-size: 13px; font-weight: 600; letter-spacing: 0.01em;
        }
        .ab-period-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        @keyframes abFadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .ab-content { animation: abFadeUp 0.8s cubic-bezier(0.23,1,0.32,1) both; }
        @media (max-width: 768px) {
          .ab-products-grid { grid-template-columns: 1fr; }
          .ab-philosophy-grid { grid-template-columns: 1fr 1fr; }
          .ab-nav-links { display: none; }
          .ab-nav-time { display: none; }
        }
        @media (max-width: 480px) {
          .ab-philosophy-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="ab-root">
        <div className="ab-bg" style={{ backgroundImage: `url(${currentPhoto.url})` }} role="img" aria-label={currentPhoto.alt} />
        <div className="ab-overlay" style={{ background: activeCfg.overlayGradient }} aria-hidden="true" />
        <div className="ab-grain" aria-hidden="true" />

        {/* Nav */}
        <nav className="ab-nav" aria-label="Earth AI">
          <Link href="/" className="ab-logo" style={{ color: activeCfg.logoColor }} aria-label="Earth AI — Home">
            <Image src="/assets/images/h9O7B-1789370942958.jpg" alt="Earth AI logo" width={28} height={28} className="ab-logo-img" />
            <span>Earth AI</span>
          </Link>
          <div className="ab-nav-spacer" />
          {mounted && <span className="ab-nav-time" style={{ color: activeCfg.logoColor }}>{currentTime}</span>}
          <div className="ab-nav-links">
            <Link href="/about" className="ab-nav-link active" style={{ color: activeCfg.logoColor }}>About</Link>
            <Link href="/agriculture" className="ab-nav-link" style={{ color: activeCfg.logoColor }}>Agriculture</Link>
            <Link href="/finance" className="ab-nav-link" style={{ color: activeCfg.logoColor }}>Finance</Link>
          </div>
          <Link href="/login" className="ab-nav-btn" style={{ background: activeCfg.buttonBg, color: activeCfg.buttonText }}>Try Intelligence E Now</Link>
        </nav>

        {/* Content */}
        <div className="ab-content">

          <div className="ab-eyebrow" style={{ background: cardBg, color: activeCfg.badgeText }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
            </svg>
            About Earth AI
          </div>

          <h1 className="ab-page-title" style={{ color: activeCfg.textColor }}>
            Specialized intelligence<br />for the real world.
          </h1>
          <p className="ab-page-lead" style={{ color: activeCfg.textColor }}>
            Earth AI is an artificial intelligence company developing specialized AI products designed to provide practical intelligence for specific industries and domains.
          </p>

          {/* Earth AI */}
          <div className="ab-section">
            <div className="ab-section-label" style={{ color: activeCfg.textColor }}>The Company</div>
            <div className="ab-section-title" style={{ color: activeCfg.textColor }}>Earth AI</div>
            <p className="ab-section-body" style={{ color: activeCfg.textColor }}>
              Earth AI focuses on building specialized intelligence rather than being a general-purpose chatbot. The company believes that the most useful AI is the kind that deeply understands the domain it operates in — trained on the right data, designed for the right decisions, and built for the people who depend on accurate, actionable information.
            </p>
            <p className="ab-section-body" style={{ color: activeCfg.textColor, marginTop: '14px' }}>
              Where general AI tools offer broad capability, Earth AI products offer depth. Each product is built around a specific industry, with the goal of making advanced artificial intelligence genuinely useful in real-world environments — not just impressive in a demonstration.
            </p>
          </div>

          <div className="ab-divider" />

          {/* Intelligence E */}
          <div className="ab-section">
            <div className="ab-section-label" style={{ color: activeCfg.textColor }}>The Platform</div>
            <div className="ab-section-title" style={{ color: activeCfg.textColor }}>Intelligence E</div>
            <p className="ab-section-body" style={{ color: activeCfg.textColor }}>
              Intelligence E is Earth AI's vertical intelligence platform. It is designed to deliver domain-specific AI capabilities across industries where precision, context, and reliability matter most. Each Intelligence E vertical is a focused product — not a feature — built to serve a specific professional environment.
            </p>
            <p className="ab-section-body" style={{ color: activeCfg.textColor, marginTop: '14px' }}>
              The current Intelligence E focus is Agriculture. Other verticals, including Finance, are part of the future roadmap.
            </p>
          </div>

          <div className="ab-divider" />

          {/* Products */}
          <div className="ab-section">
            <div className="ab-section-label" style={{ color: activeCfg.textColor }}>Products</div>
            <div className="ab-section-title" style={{ color: activeCfg.textColor }}>The Earth AI Ecosystem</div>
            <p className="ab-section-body" style={{ color: activeCfg.textColor }}>
              Earth AI is building a focused ecosystem of specialized products. Each product addresses a distinct need within its domain.
            </p>

            <div className="ab-products-grid">
              {/* Intelligence E Agriculture */}
              <div className="ab-product-card" style={{ background: cardBg, borderColor: cardBorder }}>
                <div className="ab-product-name" style={{ color: activeCfg.textColor }}>Intelligence E Agriculture</div>
                <p className="ab-product-desc" style={{ color: activeCfg.textColor }}>
                  An agricultural intelligence platform designed to help users understand agricultural data, research, risks, markets, production and decision-making. Intelligence E Agriculture provides specialized AI capabilities for farmers, agribusinesses, and agricultural professionals.
                </p>
                <Link href="/login" className="ab-cta-btn" style={{ background: 'rgba(34,197,94,0.80)', color: '#fff', marginTop: '20px', padding: '10px 22px', fontSize: '13px', boxShadow: 'none' }}>
                  Try Intelligence E Now
                </Link>
              </div>

              {/* Intelligence E Finance */}
              <div className="ab-product-card" style={{ background: cardBg, borderColor: cardBorder }}>
                <div className="ab-product-name" style={{ color: activeCfg.textColor }}>Intelligence E Finance</div>
                <p className="ab-product-desc" style={{ color: activeCfg.textColor }}>
                  A financial intelligence vertical within the Intelligence E platform. Designed to provide specialized AI capabilities for financial analysis, market intelligence, and economic decision-making.
                </p>
                <span className="ab-product-badge" style={{ color: activeCfg.textColor, borderColor: 'rgba(255,255,255,0.20)' }}>Coming Soon</span>
              </div>

              {/* Pelit Farm */}
              <div className="ab-product-card" style={{ background: cardBg, borderColor: cardBorder, gridColumn: 'span 2' }}>
                <div className="ab-product-name" style={{ color: activeCfg.textColor }}>Pelit Farm</div>
                <p className="ab-product-desc" style={{ color: activeCfg.textColor }}>
                  A farm management platform designed to help farmers and agricultural businesses manage operations, production and financial information. Pelit Farm provides the operational layer that complements Intelligence E Agriculture's analytical capabilities — giving agricultural businesses a complete view of their operations.
                </p>
              </div>
            </div>
          </div>

          <div className="ab-divider" />

          {/* Vision */}
          <div className="ab-section">
            <div className="ab-section-label" style={{ color: activeCfg.textColor }}>Vision</div>
            <div className="ab-section-title" style={{ color: activeCfg.textColor }}>Why Earth AI Exists</div>
            <p className="ab-section-body" style={{ color: activeCfg.textColor }}>
              Earth AI aims to make advanced artificial intelligence more useful by applying it to real-world industries, organizations and decision-making environments. The goal is not to build AI that is impressive in isolation — but AI that is genuinely valuable in the hands of professionals who need reliable, domain-specific intelligence to make better decisions.
            </p>
            <p className="ab-section-body" style={{ color: activeCfg.textColor, marginTop: '14px' }}>
              Industries like agriculture and finance operate in complex, high-stakes environments where the cost of poor decisions is real. Earth AI is built on the belief that specialized intelligence — grounded in domain knowledge, trained on relevant data, and designed for specific workflows — is far more valuable than general-purpose AI applied broadly.
            </p>
          </div>

          <div className="ab-divider" />

          {/* Philosophy */}
          <div className="ab-section">
            <div className="ab-section-label" style={{ color: activeCfg.textColor }}>Principles</div>
            <div className="ab-section-title" style={{ color: activeCfg.textColor }}>Product Philosophy</div>
            <p className="ab-section-body" style={{ color: activeCfg.textColor }}>
              Every Earth AI product is built around a consistent set of principles that guide how we design, build, and deploy intelligence.
            </p>

            <div className="ab-philosophy-grid">
              {[
              { title: 'Specialized Intelligence', desc: 'Deep domain focus over broad generality. Each product is built for a specific industry and use case.' },
              { title: 'Practical Decision Support', desc: 'Intelligence that leads to better decisions — not just information for its own sake.' },
              { title: 'Data-Driven Analysis', desc: 'Conclusions grounded in data, not assumptions. Rigorous analysis at every layer.' },
              { title: 'Responsible AI', desc: 'Thoughtful deployment. We consider the implications of AI in high-stakes environments.' },
              { title: 'Security and Privacy', desc: 'User data is protected. Security is a design requirement, not an afterthought.' },
              { title: 'Scalable Technology', desc: 'Built to grow with the organizations and industries we serve.' }].
              map((item) =>
              <div key={item.title} className="ab-philosophy-item" style={{ background: cardBg, borderColor: cardBorder }}>
                  <div className="ab-philosophy-title" style={{ color: activeCfg.textColor }}>{item.title}</div>
                  <div className="ab-philosophy-desc" style={{ color: activeCfg.textColor }}>{item.desc}</div>
                </div>
              )}
            </div>
          </div>

          {/* CTA */}
          <div className="ab-cta-row">
            <Link href="/login" className="ab-cta-btn" style={{ background: activeCfg.buttonBg, color: activeCfg.buttonText }}>
              Try Intelligence E Now
            </Link>
            <Link href="/agriculture" className="ab-cta-link" style={{ color: activeCfg.linkColor }}>
              Learn about Intelligence E Agriculture
            </Link>
          </div>
        </div>

        {/* Footer */}
        <footer className="ab-footer">
          <div className="ab-footer-links" style={{ color: activeCfg.linkColor }}>
            <Link href="/" className="ab-footer-link" style={{ color: 'inherit' }}>Home</Link>
            <Link href="/about" className="ab-footer-link" style={{ color: 'inherit' }}>About</Link>
            <Link href="/agriculture" className="ab-footer-link" style={{ color: 'inherit' }}>Agriculture</Link>
            <Link href="/finance" className="ab-footer-link" style={{ color: 'inherit' }}>Finance</Link>
            <Link href="/privacy" className="ab-footer-link" style={{ color: 'inherit' }}>Privacy</Link>
            <Link href="/terms" className="ab-footer-link" style={{ color: 'inherit' }}>Terms</Link>
          </div>
          {mounted &&
          <div className="ab-period-pill" style={{ background: activeCfg.badgeBg, color: activeCfg.badgeText }}>
              <span className="ab-period-dot" style={{ background: activeCfg.buttonBg === '#F2F6FF' || activeCfg.buttonBg === '#EAF0FF' || activeCfg.buttonBg === '#E8EEFF' || activeCfg.buttonBg === '#F0EAFF' ? 'rgba(150,170,255,0.8)' : activeCfg.buttonBg }} aria-hidden="true" />
              <span>{activeCfg.label}</span>
            </div>
          }
        </footer>
      </div>
    </>);

}