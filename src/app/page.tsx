'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import BackgroundAnimation from '@/components/ui/BackgroundAnimation';

interface TimeOfDay {
  label: string;
  period: string;
  headline: string;
  subline: string;
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

// Pool of beautiful cloud & sunset photos — one is picked randomly on mount
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
{ url: "https://images.unsplash.com/photo-1694369878451-743f58c824da", alt: 'Vivid golden hour sky with layered clouds in shades of amber, peach and deep rose at dusk' },
{ url: "https://images.unsplash.com/photo-1455162897425-52c78ac32377", alt: 'Peaceful countryside sunset with soft orange and pink clouds drifting over rolling green hills' },
{ url: "https://images.unsplash.com/photo-1586822685447-0061795e6ff5", alt: 'Stunning sunset with large cumulus clouds glowing in brilliant orange and gold against a deep blue sky' },
{ url: "https://images.unsplash.com/photo-1632913762226-81f4ec3cca83", alt: 'Epic mountain cloudscape with dramatic clouds lit in vivid orange and purple tones at golden hour' },
{ url: "https://images.unsplash.com/photo-1628334704271-2d51238d9387", alt: 'Beautiful sunset with streaks of crimson and amber light breaking through layered clouds on the horizon' },
{ url: "https://images.unsplash.com/photo-1536199027427-bcefd3969db3", alt: 'Bright midday sky with large fluffy white clouds casting dramatic shadows over a sunlit landscape' },
{ url: "https://images.unsplash.com/photo-1568919428400-32bcc0d0db1d", alt: 'Warm afternoon light with golden clouds and long shadows stretching across an open field at sunset' }];


function pickDaytimePhoto(seed: number): {url: string;alt: string;} {
  return daytimePhotoPool[seed % daytimePhotoPool.length];
}

const timeConfigs: TimeOfDay[] = [
{
  label: 'Night',
  period: '12:00 AM – 4:59 AM',
  headline: 'AI that never sleeps.\nWorking while the world rests.',
  subline: 'Earth AI\'s intelligence engines run around the clock — monitoring crops, tracking markets, and delivering insights before dawn.',
  image: "https://images.unsplash.com/photo-1724252015627-6c5f2f5f7c42",
  imageAlt: 'Breathtaking Milky Way galaxy arching over a dark landscape with thousands of stars filling the night sky',
  overlayGradient: 'linear-gradient(180deg, rgba(5,8,20,0.25) 0%, rgba(5,8,20,0.10) 50%, rgba(5,8,20,0.45) 100%)',
  textColor: '#F2F6FF',
  linkColor: 'rgba(220,230,255,0.75)',
  buttonBg: '#F2F6FF',
  buttonText: '#0B0E14',
  badgeBg: 'rgba(255,255,255,0.12)',
  badgeText: 'rgba(220,230,255,0.9)',
  logoColor: '#F2F6FF'
},
{
  label: 'Before Dawn',
  period: '5:00 AM – 5:59 AM',
  headline: 'Before the market opens,\nour AI is already watching.',
  subline: 'Earth AI Finance Intelligence scans global signals in the quiet hours — so your decisions are backed by data, not guesswork.',
  image: "https://images.unsplash.com/photo-1642510029345-c1b476318461",
  imageAlt: 'Deep blue pre-dawn sky filled with stars and a faint glow on the horizon before sunrise',
  overlayGradient: 'linear-gradient(180deg, rgba(10,12,35,0.20) 0%, rgba(10,12,35,0.05) 50%, rgba(10,12,35,0.35) 100%)',
  textColor: '#EAF0FF',
  linkColor: 'rgba(200,215,255,0.75)',
  buttonBg: '#EAF0FF',
  buttonText: '#0B0E14',
  badgeBg: 'rgba(255,255,255,0.12)',
  badgeText: 'rgba(200,215,255,0.9)',
  logoColor: '#EAF0FF'
},
{
  label: 'Sunrise',
  period: '6:00 AM – 7:59 AM',
  headline: 'A new growing season\nbegins with smarter AI.',
  subline: 'Earth AI Agriculture Intelligence helps farmers plan, predict, and optimize — from soil health to harvest yield.',
  image: '',
  imageAlt: '',
  overlayGradient: 'linear-gradient(180deg, rgba(20,15,5,0.15) 0%, rgba(20,15,5,0.05) 50%, rgba(20,15,5,0.30) 100%)',
  textColor: '#1A1008',
  linkColor: 'rgba(30,20,10,0.65)',
  buttonBg: '#1A1008',
  buttonText: '#FFFFFF',
  badgeBg: 'rgba(255,255,255,0.30)',
  badgeText: 'rgba(30,20,10,0.85)',
  logoColor: '#1A1008'
},
{
  label: 'Morning',
  period: '8:00 AM – 10:59 AM',
  headline: 'Specialized AI.\nBuilt for the real world.',
  subline: 'Earth AI delivers domain-specific intelligence for agriculture and finance — two industries where precision changes everything.',
  image: '',
  imageAlt: '',
  overlayGradient: 'linear-gradient(180deg, rgba(10,40,90,0.10) 0%, rgba(10,40,90,0.02) 50%, rgba(10,40,90,0.20) 100%)',
  textColor: '#0B0E14',
  linkColor: 'rgba(15,25,60,0.60)',
  buttonBg: '#101320',
  buttonText: '#FFFFFF',
  badgeBg: 'rgba(255,255,255,0.35)',
  badgeText: 'rgba(11,14,20,0.80)',
  logoColor: '#0B0E14'
},
{
  label: 'Midday',
  period: '11:00 AM – 1:59 PM',
  headline: 'Peak performance.\nPowered by Earth AI.',
  subline: 'At the height of the trading day or the growing season, our AI products deliver clarity, speed, and actionable intelligence.',
  image: '',
  imageAlt: '',
  overlayGradient: 'linear-gradient(180deg, rgba(5,30,80,0.12) 0%, rgba(5,30,80,0.03) 50%, rgba(5,30,80,0.22) 100%)',
  textColor: '#0B0E14',
  linkColor: 'rgba(15,25,60,0.60)',
  buttonBg: '#101320',
  buttonText: '#FFFFFF',
  badgeBg: 'rgba(255,255,255,0.35)',
  badgeText: 'rgba(11,14,20,0.80)',
  logoColor: '#0B0E14'
},
{
  label: 'Afternoon',
  period: '2:00 PM – 4:59 PM',
  headline: 'Finance intelligence\nthat sees further ahead.',
  subline: 'Earth AI Finance reads market patterns, risk signals, and economic trends — giving you the edge before others see it coming.',
  image: '',
  imageAlt: '',
  overlayGradient: 'linear-gradient(180deg, rgba(15,20,50,0.12) 0%, rgba(15,20,50,0.03) 50%, rgba(15,20,50,0.25) 100%)',
  textColor: '#0B0E14',
  linkColor: 'rgba(15,25,60,0.60)',
  buttonBg: '#101320',
  buttonText: '#FFFFFF',
  badgeBg: 'rgba(255,255,255,0.35)',
  badgeText: 'rgba(11,14,20,0.80)',
  logoColor: '#0B0E14'
},
{
  label: 'Sunset',
  period: '5:00 PM – 6:59 PM',
  headline: 'From field to forecast,\nEarth AI has you covered.',
  subline: 'Agriculture Intelligence monitors weather, soil, and crop data in real time — turning nature\'s complexity into clear, confident decisions.',
  image: '',
  imageAlt: '',
  overlayGradient: 'linear-gradient(180deg, rgba(20,10,5,0.15) 0%, rgba(20,10,5,0.05) 50%, rgba(20,10,5,0.35) 100%)',
  textColor: '#1A0A05',
  linkColor: 'rgba(30,15,5,0.65)',
  buttonBg: '#1A0A05',
  buttonText: '#FFFFFF',
  badgeBg: 'rgba(255,255,255,0.25)',
  badgeText: 'rgba(30,15,5,0.85)',
  logoColor: '#1A0A05'
},
{
  label: 'Evening',
  period: '7:00 PM – 8:59 PM',
  headline: 'Intelligence shaped\nby the Earth itself.',
  subline: 'Earth AI is built on the belief that the most powerful AI is the kind that understands the world it operates in.',
  image: "https://images.unsplash.com/photo-1575568337541-e2114e005867",
  imageAlt: 'Stunning evening twilight with deep purple and rose hues glowing across the sky after sunset',
  overlayGradient: 'linear-gradient(180deg, rgba(15,8,30,0.20) 0%, rgba(15,8,30,0.08) 50%, rgba(15,8,30,0.40) 100%)',
  textColor: '#F0EAFF',
  linkColor: 'rgba(220,210,255,0.75)',
  buttonBg: '#F0EAFF',
  buttonText: '#0B0E14',
  badgeBg: 'rgba(255,255,255,0.12)',
  badgeText: 'rgba(220,210,255,0.9)',
  logoColor: '#F0EAFF'
},
{
  label: 'Dusk',
  period: '9:00 PM – 10:59 PM',
  headline: 'Two products.\nOne powerful platform.',
  subline: 'Earth AI Agriculture and Earth AI Finance — specialized intelligence products designed for the industries that feed and fund the world.',
  image: "https://images.unsplash.com/photo-1695432946512-ecb7d5077dfe",
  imageAlt: 'Majestic night sky with the Milky Way galaxy and countless stars visible over a dark silhouetted landscape',
  overlayGradient: 'linear-gradient(180deg, rgba(8,10,28,0.22) 0%, rgba(8,10,28,0.08) 50%, rgba(8,10,28,0.40) 100%)',
  textColor: '#E8EEFF',
  linkColor: 'rgba(210,220,255,0.75)',
  buttonBg: '#E8EEFF',
  buttonText: '#0B0E14',
  badgeBg: 'rgba(255,255,255,0.12)',
  badgeText: 'rgba(210,220,255,0.9)',
  logoColor: '#E8EEFF'
},
{
  label: 'Late Night',
  period: '11:00 PM – 11:59 PM',
  headline: 'The future of intelligence\nis grounded in Earth.',
  subline: 'While the world sleeps, Earth AI continues learning — processing data, refining models, and preparing insights for tomorrow.',
  image: "https://images.unsplash.com/photo-1695432946512-ecb7d5077dfe",
  imageAlt: 'Awe-inspiring night sky with dense star clusters and the Milky Way glowing brilliantly over a dark landscape',
  overlayGradient: 'linear-gradient(180deg, rgba(5,8,20,0.25) 0%, rgba(5,8,20,0.10) 50%, rgba(5,8,20,0.45) 100%)',
  textColor: '#F2F6FF',
  linkColor: 'rgba(220,230,255,0.75)',
  buttonBg: '#F2F6FF',
  buttonText: '#0B0E14',
  badgeBg: 'rgba(255,255,255,0.12)',
  badgeText: 'rgba(220,230,255,0.9)',
  logoColor: '#F2F6FF'
}];

// Daytime period labels that should use the dynamic photo pool
const DAYTIME_LABELS = new Set(['Sunrise', 'Morning', 'Midday', 'Afternoon', 'Sunset']);

function getTimeConfig(hour: number): TimeOfDay {
  if (hour >= 0 && hour < 5) return timeConfigs[0]; // Night
  if (hour >= 5 && hour < 6) return timeConfigs[1]; // Before Dawn
  if (hour >= 6 && hour < 8) return timeConfigs[2]; // Sunrise
  if (hour >= 8 && hour < 11) return timeConfigs[3]; // Morning
  if (hour >= 11 && hour < 14) return timeConfigs[4]; // Midday
  if (hour >= 14 && hour < 17) return timeConfigs[5]; // Afternoon
  if (hour >= 17 && hour < 19) return timeConfigs[6]; // Sunset
  if (hour >= 19 && hour < 21) return timeConfigs[7]; // Evening
  if (hour >= 21 && hour < 23) return timeConfigs[8]; // Dusk
  return timeConfigs[9]; // Late Night
}

export default function HomePage() {
  const [currentConfig, setCurrentConfig] = useState<TimeOfDay>(timeConfigs[3]); // Default morning
  const [nextConfig, setNextConfig] = useState<TimeOfDay>(timeConfigs[3]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [mounted, setMounted] = useState(false);
  // Dynamic photo index — changes every 8 seconds for daytime periods
  const [photoIndex, setPhotoIndex] = useState(0);
  const photoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Resolve the actual image URL for a config — uses pool for daytime, static for night
  function resolveImage(config: TimeOfDay, idx: number): {url: string;alt: string;} {
    if (DAYTIME_LABELS.has(config.label)) {
      return pickDaytimePhoto(idx);
    }
    return { url: config.image, alt: config.imageAlt };
  }

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hour = now.getHours();
      const config = getTimeConfig(hour);
      const timeStr = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
      setCurrentTime(timeStr);

      if (config.label !== currentConfig.label) {
        setNextConfig(config);
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentConfig(config);
          setIsTransitioning(false);
        }, 1200);
      }
    };

    const now = new Date();
    const hour = now.getHours();
    const config = getTimeConfig(hour);
    const timeStr = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
    setCurrentConfig(config);
    setNextConfig(config);
    setCurrentTime(timeStr);
    // Seed initial photo index with current seconds so each visitor gets a different starting photo
    setPhotoIndex(now.getSeconds() % daytimePhotoPool.length);
    setMounted(true);

    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // Rotate through daytime photos every 8 seconds
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

  const activeConfig = mounted ? currentConfig : timeConfigs[3];
  const currentPhoto = resolveImage(activeConfig, photoIndex);
  const nextPhoto = resolveImage(nextConfig, photoIndex);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        *, *::before, *::after {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        html, body {
          height: 100%;
          overflow: hidden;
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          -webkit-tap-highlight-color: transparent;
        }

        .sky-root {
          position: fixed;
          inset: 0;
          overflow: hidden;
        }

        .sky-bg {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          transition: opacity 3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .sky-bg-current {
          opacity: 1;
          z-index: 1;
        }

        .sky-bg-next {
          opacity: 0;
          z-index: 2;
        }

        .sky-bg-next.transitioning {
          opacity: 1;
        }

        .sky-overlay {
          position: absolute;
          inset: 0;
          z-index: 3;
          pointer-events: none;
        }

        .grain {
          position: absolute;
          inset: 0;
          z-index: 4;
          pointer-events: none;
          opacity: 0.08;
          mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 300px 300px;
        }

        .nav-wrap {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 40;
          padding: 18px 4vw 8px;
          pointer-events: auto;
        }

        .nav {
          display: flex;
          align-items: center;
          gap: 0;
          width: 100%;
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 700;
          font-size: 17px;
          letter-spacing: -0.02em;
          text-decoration: none;
          transition: opacity 0.2s;
          flex-shrink: 0;
        }

        .nav-logo:hover {
          opacity: 0.75;
        }

        .nav-logo-img {
          width: 28px;
          height: 28px;
          flex-shrink: 0;
          border-radius: 6px;
          object-fit: cover;
        }

        .nav-spacer {
          flex: 1;
        }

        .nav-time {
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.01em;
          margin-right: 20px;
          opacity: 0.7;
          transition: color 0.6s ease;
        }

        .nav-btn {
          position: relative;
          overflow: hidden;
          border: 0;
          border-radius: 999px;
          padding: 10px 22px;
          height: 38px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: -0.01em;
          cursor: pointer;
          font-family: inherit;
          transition: transform 0.2s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.2s;
          white-space: nowrap;
          text-decoration: none;
        }

        .nav-btn:hover {
          transform: translateY(-1px);
        }

        .hero-wrap {
          position: fixed;
          inset: 0;
          z-index: 10;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }

        .hero-copy {
          text-align: center;
          max-width: min(720px, 90vw);
          pointer-events: auto;
          user-select: text;
        }

        .hero-headline {
          font-weight: 600;
          letter-spacing: -0.035em;
          line-height: 1.08;
          font-size: clamp(32px, 4.2vw, 62px);
          white-space: pre-line;
          transition: color 0.6s ease;
        }

        .hero-subline {
          margin-top: 18px;
          font-size: clamp(14px, 1.4vw, 17px);
          font-weight: 400;
          line-height: 1.6;
          max-width: 460px;
          margin-left: auto;
          margin-right: auto;
          transition: color 0.6s ease;
        }

        .hero-cta {
          margin-top: 36px;
          display: flex;
          justify-content: center;
          pointer-events: auto;
        }

        .cta-btn {
          position: relative;
          overflow: hidden;
          border: 0;
          border-radius: 999px;
          padding: 15px 40px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0;
          font-size: 17px;
          font-weight: 600;
          letter-spacing: -0.01em;
          cursor: pointer;
          font-family: inherit;
          transition: transform 0.2s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.25s;
          box-shadow: 0 4px 24px rgba(0,0,0,0.18);
          white-space: nowrap;
          text-decoration: none;
        }

        .cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.22);
        }

        .cta-arrow {
          display: inline-flex;
          align-items: center;
          justify-content: flex-start;
          overflow: hidden;
          width: 0;
          margin-left: 0;
          opacity: 0;
          transform: translateX(0.6em);
          transition: width 0.28s ease, margin-left 0.28s ease, opacity 0.28s ease, transform 0.28s ease;
        }

        .cta-btn:hover .cta-arrow {
          width: 1.1em;
          margin-left: 0.5em;
          opacity: 1;
          transform: translateX(0);
        }

        .time-badge {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 40;
          padding: 0 4vw;
          padding-bottom: max(20px, env(safe-area-inset-bottom, 20px));
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          pointer-events: auto;
        }

        .footer-links {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          font-weight: 600;
        }

        .footer-link {
          box-sizing: border-box;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          padding: 0 8px;
          text-decoration: none;
          transition: opacity 0.2s;
        }

        .footer-link:hover {
          opacity: 0.75;
        }

        .period-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 999px;
          backdrop-filter: blur(14px) saturate(1.4);
          -webkit-backdrop-filter: blur(14px) saturate(1.4);
          border: 1px solid rgba(255,255,255,0.18);
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.01em;
          pointer-events: none;
        }

        .period-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .hero-copy {
          animation: fadeInUp 0.9s cubic-bezier(0.23, 1, 0.32, 1) both;
        }

        @media (max-width: 600px) {
          .nav-time { display: none; }
          .hero-subline { font-size: 14px; }
        }

        @media (prefers-reduced-motion: reduce) {
          .sky-bg, .cta-btn, .nav-btn, .period-pill {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>

      <div className="sky-root">
        {/* Current background */}
        <div
          className="sky-bg sky-bg-current"
          style={{ backgroundImage: `url(${currentPhoto.url})` }}
          role="img"
          aria-label={currentPhoto.alt} />
        

        {/* Next background (for transition) */}
        {isTransitioning &&
        <div
          className={`sky-bg sky-bg-next ${isTransitioning ? 'transitioning' : ''}`}
          style={{ backgroundImage: `url(${nextPhoto.url})` }}
          aria-hidden="true" />

        }

        {/* Overlay gradient */}
        <div className="sky-overlay" style={{ background: activeConfig.overlayGradient }} aria-hidden="true" />

        {/* Film grain */}
        <div className="grain" aria-hidden="true" />

        {/* Subtle natural motion layer — clouds / stars / shooting stars */}
        <BackgroundAnimation period={activeConfig.label} />

        {/* Navigation */}
        <nav className="nav-wrap" aria-label="Earth AI">
          <div className="nav">
            <a href="#" className="nav-logo" style={{ color: activeConfig.logoColor }} aria-label="Earth AI — Home">
              <Image
                src="/assets/images/h9O7B-1789370942958.jpg"
                alt="Earth AI logo"
                width={28}
                height={28}
                className="nav-logo-img" />
              
              <span>Earth AI</span>
            </a>

            <div className="nav-spacer" />

            {mounted &&
            <span
              className="nav-time"
              style={{ color: activeConfig.logoColor }}
              aria-live="polite"
              aria-label={`Current time: ${currentTime}`}>
              
                {currentTime}
              </span>
            }

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginRight: '12px' }}>
              <a
                href="/about"
                style={{
                  fontSize: '13px', fontWeight: 600, textDecoration: 'none',
                  padding: '6px 12px', borderRadius: '999px',
                  color: activeConfig.logoColor, opacity: 0.75,
                  transition: 'opacity 0.2s'
                }}
                aria-label="About Earth AI">
                
                About
              </a>
              <a
                href="/agriculture"
                style={{
                  fontSize: '13px', fontWeight: 600, textDecoration: 'none',
                  padding: '6px 12px', borderRadius: '999px',
                  color: activeConfig.logoColor, opacity: 0.75,
                  transition: 'opacity 0.2s'
                }}
                aria-label="Agriculture Intelligence">
                
                Agriculture
              </a>
              <a
                href="/finance"
                style={{
                  fontSize: '13px', fontWeight: 600, textDecoration: 'none',
                  padding: '6px 12px', borderRadius: '999px',
                  color: activeConfig.logoColor, opacity: 0.75,
                  transition: 'opacity 0.2s'
                }}
                aria-label="Finance Intelligence">
                
                Finance
              </a>
              <a
                href="/help"
                style={{
                  fontSize: '13px', fontWeight: 600, textDecoration: 'none',
                  padding: '6px 12px', borderRadius: '999px',
                  color: activeConfig.logoColor, opacity: 0.75,
                  transition: 'opacity 0.2s'
                }}
                aria-label="Help and Documentation">
                
                Help
              </a>
            </div>

            <a
              href="/login"
              className="nav-btn"
              style={{
                background: 'rgba(34,197,94,0.85)',
                color: '#fff'
              }}
              aria-label="Try Intelligence E Agriculture">
              
              Try Intelligence E Now
            </a>
          </div>
        </nav>

        {/* Hero content */}
        <div className="hero-wrap" aria-hidden="false">
          <div className="hero-copy">
            <h1 className="hero-headline" style={{ color: activeConfig.textColor }}>
              {activeConfig.headline}
            </h1>
            <p className="hero-subline" style={{ color: activeConfig.textColor, opacity: 0.72 }}>
              {activeConfig.subline}
            </p>
            <div className="hero-cta">
              <a
                href="/login"
                className="cta-btn"
                style={{ background: activeConfig.buttonBg, color: activeConfig.buttonText }}
                aria-label="Try Intelligence E Agriculture">
                
                <span>Try Intelligence E Now</span>
                <span className="cta-arrow" aria-hidden="true">
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ width: '1.05em', height: '1.05em' }}>
                    <path d="M2.5 8h11" />
                    <path d="M9 3.5 13.5 8 9 12.5" />
                  </svg>
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="time-badge">
          <div className="footer-links" style={{ color: activeConfig.linkColor }}>
            <a href="/about" className="footer-link" style={{ color: 'inherit' }} aria-label="About Earth AI">About</a>
            <a href="/agriculture" className="footer-link" style={{ color: 'inherit' }} aria-label="Agriculture Intelligence">Agriculture</a>
            <a href="/finance" className="footer-link" style={{ color: 'inherit' }} aria-label="Finance Intelligence">Finance</a>
            <a href="/help" className="footer-link" style={{ color: 'inherit' }} aria-label="Help and Documentation">Help</a>
            <a href="/privacy" className="footer-link" style={{ color: 'inherit' }} aria-label="Privacy Policy">Privacy</a>
            <a href="/terms" className="footer-link" style={{ color: 'inherit' }} aria-label="Terms of Service">Terms</a>
          </div>

          {/* Period indicator — display only, no manual override */}
          {mounted &&
          <div
            className="period-pill"
            style={{ background: activeConfig.badgeBg, color: activeConfig.badgeText }}
            aria-label={`Current period: ${activeConfig.label}`}>
            
              <span
              className="period-dot"
              style={{
                background: activeConfig.buttonBg === '#F2F6FF' || activeConfig.buttonBg === '#EAF0FF' || activeConfig.buttonBg === '#E8EEFF' || activeConfig.buttonBg === '#F0EAFF' ? 'rgba(150,170,255,0.8)' : activeConfig.buttonBg
              }}
              aria-hidden="true" />
            
              <span>{activeConfig.label}</span>
            </div>
          }
        </div>
      </div>
    </>);

}