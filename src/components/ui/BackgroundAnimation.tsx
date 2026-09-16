'use client';

import React, { useEffect, useRef, useState } from 'react';

type AnimationType = 'night' | 'dawn' | 'sunrise' | 'day' | 'sunset' | 'evening' | 'none';

interface BackgroundAnimationProps {
  period: string; // label from timeConfigs
}

function getAnimationType(period: string): AnimationType {
  switch (period) {
    case 'Night': case'Late Night':
      return 'night';
    case 'Before Dawn':
      return 'dawn';
    case 'Sunrise':
      return 'sunrise';
    case 'Morning': case'Midday': case'Afternoon':
      return 'day';
    case 'Sunset':
      return 'sunset';
    case 'Evening': case'Dusk':
      return 'evening';
    default:
      return 'none';
  }
}

// Deterministic pseudo-random using a seed so values are stable across renders
function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleDuration: number;
  twinkleDelay: number;
}

interface Cloud {
  id: number;
  y: number;
  scale: number;
  opacity: number;
  duration: number;
  delay: number;
  startX: number;
}

interface ShootingStar {
  id: number;
  startX: number;
  startY: number;
  angle: number;
  length: number;
  duration: number;
  delay: number;
}

function generateStars(count: number): Star[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: seededRandom(i * 3) * 100,
    y: seededRandom(i * 3 + 1) * 70,
    size: 1 + seededRandom(i * 3 + 2) * 1.5,
    opacity: 0.4 + seededRandom(i * 7) * 0.5,
    twinkleDuration: 3 + seededRandom(i * 5) * 5,
    twinkleDelay: seededRandom(i * 11) * 8,
  }));
}

function generateClouds(count: number): Cloud[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    y: 5 + seededRandom(i * 4) * 45,
    scale: 0.6 + seededRandom(i * 4 + 1) * 0.8,
    opacity: 0.06 + seededRandom(i * 4 + 2) * 0.10,
    duration: 90 + seededRandom(i * 4 + 3) * 80,
    delay: -(seededRandom(i * 13) * 120),
    startX: seededRandom(i * 17) * 100,
  }));
}

function generateShootingStars(count: number): ShootingStar[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    startX: 10 + seededRandom(i * 6) * 70,
    startY: 5 + seededRandom(i * 6 + 1) * 30,
    angle: 20 + seededRandom(i * 6 + 2) * 25,
    length: 80 + seededRandom(i * 6 + 3) * 120,
    duration: 1.8 + seededRandom(i * 6 + 4) * 1.2,
    // Very long delays so they appear rarely — each star fires once every ~60-120s
    delay: seededRandom(i * 6 + 5) * 120,
  }));
}

const STARS = generateStars(120);
const CLOUDS_DAY = generateClouds(5);
const CLOUDS_SUNRISE = generateClouds(4);
const CLOUDS_EVENING = generateClouds(3);
const SHOOTING_STARS = generateShootingStars(4);

export default function BackgroundAnimation({ period }: BackgroundAnimationProps) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  if (!mounted) return null;

  const animType = getAnimationType(period);

  // Reduced motion: render nothing (static background already shown)
  if (reducedMotion) return null;

  const isNight = animType === 'night' || animType === 'dawn';
  const isDay = animType === 'day';
  const isSunrise = animType === 'sunrise';
  const isSunset = animType === 'sunset';
  const isEvening = animType === 'evening';

  if (animType === 'none') return null;

  return (
    <>
      <style>{`
        /* ── Cloud drift ── */
        @keyframes cloud-drift {
          from { transform: translateX(0) scaleX(var(--cs, 1)) scaleY(var(--cs, 1)); }
          to   { transform: translateX(110vw) scaleX(var(--cs, 1)) scaleY(var(--cs, 1)); }
        }

        .ea-cloud {
          position: absolute;
          pointer-events: none;
          will-change: transform;
          border-radius: 50%;
          filter: blur(28px);
          animation: cloud-drift linear infinite;
        }

        /* ── Star twinkle ── */
        @keyframes star-twinkle {
          0%, 100% { opacity: var(--so, 0.6); }
          50%       { opacity: calc(var(--so, 0.6) * 0.35); }
        }

        .ea-star {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          background: #fff;
          animation: star-twinkle ease-in-out infinite;
          will-change: opacity;
        }

        /* ── Shooting star ── */
        @keyframes shoot {
          0%   { opacity: 0; transform: translate(0, 0) rotate(var(--sa, 30deg)); }
          8%   { opacity: 0.9; }
          80%  { opacity: 0.7; }
          100% { opacity: 0; transform: translate(var(--sx, 200px), var(--sy, 80px)) rotate(var(--sa, 30deg)); }
        }

        .ea-shoot {
          position: absolute;
          pointer-events: none;
          height: 1px;
          border-radius: 1px;
          background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.85) 60%, rgba(255,255,255,0) 100%);
          animation: shoot ease-out infinite;
          will-change: transform, opacity;
          opacity: 0;
        }

        /* ── Subtle brightness pulse for sunrise/sunset ── */
        @keyframes atmos-pulse {
          0%, 100% { opacity: 0; }
          50%       { opacity: 0.04; }
        }

        .ea-atmos {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: radial-gradient(ellipse 80% 50% at 50% 30%, rgba(255,200,100,0.18) 0%, transparent 70%);
          animation: atmos-pulse 18s ease-in-out infinite;
          will-change: opacity;
        }

        @media (prefers-reduced-motion: reduce) {
          .ea-cloud, .ea-star, .ea-shoot, .ea-atmos {
            animation: none !important;
            display: none !important;
          }
        }
      `}</style>

      {/* ── Night / Before Dawn: stars + shooting stars ── */}
      {isNight && (
        <div
          aria-hidden="true"
          style={{ position: 'absolute', inset: 0, zIndex: 5, pointerEvents: 'none', overflow: 'hidden' }}
        >
          {STARS.map(star => (
            <div
              key={star.id}
              className="ea-star"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: `${star.size}px`,
                height: `${star.size}px`,
                // @ts-ignore CSS custom property
                '--so': star.opacity,
                opacity: star.opacity,
                animationDuration: `${star.twinkleDuration}s`,
                animationDelay: `${star.twinkleDelay}s`,
              } as React.CSSProperties}
            />
          ))}

          {SHOOTING_STARS.map(ss => {
            const angleRad = (ss.angle * Math.PI) / 180;
            const dx = Math.cos(angleRad) * ss.length;
            const dy = Math.sin(angleRad) * ss.length;
            return (
              <div
                key={ss.id}
                className="ea-shoot"
                style={{
                  left: `${ss.startX}%`,
                  top: `${ss.startY}%`,
                  width: `${ss.length}px`,
                  // @ts-ignore CSS custom property
                  '--sa': `${ss.angle}deg`,
                  '--sx': `${dx}px`,
                  '--sy': `${dy}px`,
                  animationDuration: `${ss.duration}s`,
                  // Each shooting star has a long delay then repeats — feels rare
                  animationDelay: `${ss.delay}s`,
                  animationIterationCount: 'infinite',
                } as React.CSSProperties}
              />
            );
          })}
        </div>
      )}

      {/* ── Daytime: slow cloud drift ── */}
      {isDay && (
        <div
          aria-hidden="true"
          style={{ position: 'absolute', inset: 0, zIndex: 5, pointerEvents: 'none', overflow: 'hidden' }}
        >
          {CLOUDS_DAY.map(cloud => (
            <div
              key={cloud.id}
              className="ea-cloud"
              style={{
                top: `${cloud.y}%`,
                left: `${cloud.startX - 110}%`,
                width: `${180 * cloud.scale}px`,
                height: `${80 * cloud.scale}px`,
                opacity: cloud.opacity,
                background: 'rgba(255,255,255,0.9)',
                animationDuration: `${cloud.duration}s`,
                animationDelay: `${cloud.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* ── Sunrise: slow cloud drift + atmospheric glow ── */}
      {isSunrise && (
        <div
          aria-hidden="true"
          style={{ position: 'absolute', inset: 0, zIndex: 5, pointerEvents: 'none', overflow: 'hidden' }}
        >
          <div className="ea-atmos" />
          {CLOUDS_SUNRISE.map(cloud => (
            <div
              key={cloud.id}
              className="ea-cloud"
              style={{
                top: `${cloud.y}%`,
                left: `${cloud.startX - 110}%`,
                width: `${200 * cloud.scale}px`,
                height: `${90 * cloud.scale}px`,
                opacity: cloud.opacity * 0.9,
                background: 'rgba(255,220,160,0.7)',
                animationDuration: `${cloud.duration * 1.3}s`,
                animationDelay: `${cloud.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* ── Sunset: slow cloud drift + warm atmospheric glow ── */}
      {isSunset && (
        <div
          aria-hidden="true"
          style={{ position: 'absolute', inset: 0, zIndex: 5, pointerEvents: 'none', overflow: 'hidden' }}
        >
          <div className="ea-atmos" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 60%, rgba(255,140,60,0.15) 0%, transparent 70%)' }} />
          {CLOUDS_SUNRISE.map(cloud => (
            <div
              key={cloud.id}
              className="ea-cloud"
              style={{
                top: `${cloud.y}%`,
                left: `${cloud.startX - 110}%`,
                width: `${200 * cloud.scale}px`,
                height: `${90 * cloud.scale}px`,
                opacity: cloud.opacity * 0.85,
                background: 'rgba(255,180,100,0.6)',
                animationDuration: `${cloud.duration * 1.4}s`,
                animationDelay: `${cloud.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* ── Evening / Dusk: very faint cloud drift + sparse stars ── */}
      {isEvening && (
        <div
          aria-hidden="true"
          style={{ position: 'absolute', inset: 0, zIndex: 5, pointerEvents: 'none', overflow: 'hidden' }}
        >
          {/* A handful of early stars */}
          {STARS.slice(0, 40).map(star => (
            <div
              key={star.id}
              className="ea-star"
              style={{
                left: `${star.x}%`,
                top: `${star.y * 0.6}%`,
                width: `${star.size * 0.8}px`,
                height: `${star.size * 0.8}px`,
                // @ts-ignore CSS custom property
                '--so': star.opacity * 0.5,
                opacity: star.opacity * 0.5,
                animationDuration: `${star.twinkleDuration * 1.5}s`,
                animationDelay: `${star.twinkleDelay}s`,
              } as React.CSSProperties}
            />
          ))}
          {CLOUDS_EVENING.map(cloud => (
            <div
              key={cloud.id}
              className="ea-cloud"
              style={{
                top: `${cloud.y}%`,
                left: `${cloud.startX - 110}%`,
                width: `${160 * cloud.scale}px`,
                height: `${70 * cloud.scale}px`,
                opacity: cloud.opacity * 0.7,
                background: 'rgba(180,160,220,0.5)',
                animationDuration: `${cloud.duration * 1.5}s`,
                animationDelay: `${cloud.delay}s`,
              }}
            />
          ))}
        </div>
      )}
    </>
  );
}
