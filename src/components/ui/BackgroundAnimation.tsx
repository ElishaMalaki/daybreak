'use client';

import React, { useEffect, useState } from 'react';

type AnimationType = 'night' | 'dawn' | 'sunrise' | 'day' | 'sunset' | 'evening' | 'none';

interface BackgroundAnimationProps {
  period: string;
}

function getAnimationType(period: string): AnimationType {
  switch (period) {
    case 'Night': case 'Late Night':
      return 'night';
    case 'Before Dawn':
      return 'dawn';
    case 'Sunrise':
      return 'sunrise';
    case 'Morning': case 'Midday': case 'Afternoon':
      return 'day';
    case 'Sunset':
      return 'sunset';
    case 'Evening': case 'Dusk':
      return 'evening';
    default:
      return 'none';
  }
}

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
    size: 1.5 + seededRandom(i * 3 + 2) * 2,
    opacity: 0.6 + seededRandom(i * 7) * 0.4,
    twinkleDuration: 3 + seededRandom(i * 5) * 5,
    twinkleDelay: seededRandom(i * 11) * 8,
  }));
}

function generateClouds(count: number): Cloud[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    y: 5 + seededRandom(i * 4) * 40,
    scale: 1.0 + seededRandom(i * 4 + 1) * 1.2,
    // Much higher opacity so clouds are actually visible
    opacity: 0.18 + seededRandom(i * 4 + 2) * 0.18,
    duration: 90 + seededRandom(i * 4 + 3) * 80,
    // Negative delay staggers start positions across the animation cycle
    delay: -(seededRandom(i * 13) * 120),
  }));
}

function generateShootingStars(count: number): ShootingStar[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    startX: 10 + seededRandom(i * 6) * 60,
    startY: 5 + seededRandom(i * 6 + 1) * 25,
    angle: 20 + seededRandom(i * 6 + 2) * 25,
    length: 100 + seededRandom(i * 6 + 3) * 120,
    duration: 2 + seededRandom(i * 6 + 4) * 1.5,
    delay: 5 + seededRandom(i * 6 + 5) * 115,
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

  if (reducedMotion || animType === 'none') return null;

  const isNight = animType === 'night' || animType === 'dawn';
  const isDay = animType === 'day';
  const isSunrise = animType === 'sunrise';
  const isSunset = animType === 'sunset';
  const isEvening = animType === 'evening';

  return (
    <>
      <style>{`
        /* ── Cloud drift: starts off left edge, drifts to right edge ── */
        @keyframes ea-cloud-drift {
          from { transform: translateX(-120%) ; }
          to   { transform: translateX(120vw); }
        }

        .ea-cloud {
          position: absolute;
          pointer-events: none;
          will-change: transform;
          border-radius: 50%;
          filter: blur(40px);
          animation: ea-cloud-drift linear infinite;
        }

        /* ── Star twinkle ── */
        @keyframes ea-star-twinkle {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.2; }
        }

        .ea-star {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          background: #ffffff;
          animation: ea-star-twinkle ease-in-out infinite;
          will-change: opacity;
        }

        /* ── Shooting star ── */
        @keyframes ea-shoot {
          0%   { opacity: 0; transform: translate(0, 0); }
          5%   { opacity: 1; }
          85%  { opacity: 0.8; }
          100% { opacity: 0; transform: translate(var(--ea-dx, 200px), var(--ea-dy, 80px)); }
        }

        .ea-shoot {
          position: absolute;
          pointer-events: none;
          height: 1.5px;
          border-radius: 2px;
          background: linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0) 100%);
          animation: ea-shoot ease-out infinite;
          will-change: transform, opacity;
          opacity: 0;
          transform-origin: left center;
        }

        /* ── Atmospheric glow pulse for sunrise/sunset ── */
        @keyframes ea-atmos-pulse {
          0%, 100% { opacity: 0.02; }
          50%       { opacity: 0.08; }
        }

        .ea-atmos {
          position: absolute;
          inset: 0;
          pointer-events: none;
          animation: ea-atmos-pulse 18s ease-in-out infinite;
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
                opacity: star.opacity,
                animationDuration: `${star.twinkleDuration}s`,
                animationDelay: `${star.twinkleDelay}s`,
              }}
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
                  transform: `rotate(${ss.angle}deg)`,
                  ['--ea-dx' as string]: `${dx}px`,
                  ['--ea-dy' as string]: `${dy}px`,
                  animationDuration: `${ss.duration}s`,
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
                left: 0,
                width: `${280 * cloud.scale}px`,
                height: `${120 * cloud.scale}px`,
                opacity: cloud.opacity,
                background: 'rgba(255,255,255,0.95)',
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
          <div
            className="ea-atmos"
            style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 30%, rgba(255,200,100,0.25) 0%, transparent 70%)' }}
          />
          {CLOUDS_SUNRISE.map(cloud => (
            <div
              key={cloud.id}
              className="ea-cloud"
              style={{
                top: `${cloud.y}%`,
                left: 0,
                width: `${300 * cloud.scale}px`,
                height: `${130 * cloud.scale}px`,
                opacity: cloud.opacity,
                background: 'rgba(255,220,160,0.85)',
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
          <div
            className="ea-atmos"
            style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 60%, rgba(255,140,60,0.20) 0%, transparent 70%)' }}
          />
          {CLOUDS_SUNRISE.map(cloud => (
            <div
              key={cloud.id}
              className="ea-cloud"
              style={{
                top: `${cloud.y}%`,
                left: 0,
                width: `${300 * cloud.scale}px`,
                height: `${130 * cloud.scale}px`,
                opacity: cloud.opacity * 0.9,
                background: 'rgba(255,180,100,0.75)',
                animationDuration: `${cloud.duration * 1.4}s`,
                animationDelay: `${cloud.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* ── Evening / Dusk: faint cloud drift + sparse stars ── */}
      {isEvening && (
        <div
          aria-hidden="true"
          style={{ position: 'absolute', inset: 0, zIndex: 5, pointerEvents: 'none', overflow: 'hidden' }}
        >
          {STARS.slice(0, 40).map(star => (
            <div
              key={star.id}
              className="ea-star"
              style={{
                left: `${star.x}%`,
                top: `${star.y * 0.6}%`,
                width: `${star.size * 0.8}px`,
                height: `${star.size * 0.8}px`,
                opacity: star.opacity * 0.55,
                animationDuration: `${star.twinkleDuration * 1.5}s`,
                animationDelay: `${star.twinkleDelay}s`,
              }}
            />
          ))}
          {CLOUDS_EVENING.map(cloud => (
            <div
              key={cloud.id}
              className="ea-cloud"
              style={{
                top: `${cloud.y}%`,
                left: 0,
                width: `${240 * cloud.scale}px`,
                height: `${100 * cloud.scale}px`,
                opacity: cloud.opacity * 0.8,
                background: 'rgba(180,160,220,0.6)',
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
