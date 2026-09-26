'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { getPublicSkyPhoto, isPublicSkyDaytime } from '@/lib/public-sky-background';

const PUBLIC_PATHS = new Set(['/', '/about', '/agriculture', '/finance', '/waitlist', '/login', '/privacy', '/terms']);

function isPublicWebsitePath(pathname: string | null) {
  if (!pathname) return false;
  return PUBLIC_PATHS.has(pathname);
}

export default function PublicSkyBackgroundController() {
  const pathname = usePathname();
  const [hour, setHour] = useState(12);
  const [photoIndex, setPhotoIndex] = useState(0);
  const enabled = isPublicWebsitePath(pathname);
  const photo = useMemo(() => getPublicSkyPhoto(hour, photoIndex), [hour, photoIndex]);
  const daytime = isPublicSkyDaytime(hour);

  useEffect(() => {
    if (!enabled) return;
    const updateTime = () => setHour(new Date().getHours());
    updateTime();
    const timeTimer = window.setInterval(updateTime, 60000);
    const photoTimer = window.setInterval(() => setPhotoIndex((value) => value + 1), 22000);
    return () => {
      window.clearInterval(timeTimer);
      window.clearInterval(photoTimer);
    };
  }, [enabled]);

  useEffect(() => {
    const body = document.body;
    if (!enabled) {
      body.removeAttribute('data-public-sky-page');
      body.style.removeProperty('--earth-public-sky-background');
      body.style.removeProperty('--earth-public-sky-overlay');
      return;
    }

    body.setAttribute('data-public-sky-page', daytime ? 'day' : 'night');
    body.style.setProperty('--earth-public-sky-background', `url(${photo.url})`);
    body.style.setProperty(
      '--earth-public-sky-overlay',
      daytime
        ? 'linear-gradient(180deg, rgba(3,7,18,0.34), rgba(3,7,18,0.68))'
        : 'linear-gradient(180deg, rgba(3,7,18,0.56), rgba(3,7,18,0.82))'
    );
  }, [enabled, daytime, photo.url]);

  if (!enabled) return null;

  return (
    <style>{`
      body[data-public-sky-page] .home-bg,
      body[data-public-sky-page] .about-bg,
      body[data-public-sky-page] .wait-bg,
      body[data-public-sky-page] .auth-bg,
      body[data-public-sky-page] .pp-bg,
      body[data-public-sky-page] .tc-bg,
      body[data-public-sky-page] [class*="hero-bg"],
      body[data-public-sky-page] [class*="page-bg"],
      body[data-public-sky-page] [class*="background"] {
        background-image: var(--earth-public-sky-overlay), var(--earth-public-sky-background) !important;
        background-size: cover !important;
        background-position: center !important;
        background-repeat: no-repeat !important;
      }
    `}</style>
  );
}
