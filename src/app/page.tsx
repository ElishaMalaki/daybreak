'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const samplePrompts = [
    'How do I calculate TRA VAT for small business?',
    'What are withholding tax rates in Tanzania?',
    'Help me prepare monthly P&L and cashflow',
    'Explain corporate income tax compliance deadlines',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/waitlist?q=${encodeURIComponent(query.trim())}`);
  };

  const handlePromptClick = (text: string) => {
    setQuery(text);
  };

  return (
    <div className="ie-hero-root">
      <style>{heroStyles}</style>

      {/* Floating Realistic Background Clouds (Soft Unsplash Photography) */}
      <div className="ie-real-clouds-wrap" aria-hidden="true">
        {/* Floating Cloud 1 - Top Left */}
        <div className="ie-float-cloud ie-fc-left">
          <Image
            src="https://images.unsplash.com/photo-1539643973272-3c845cfb223a?auto=format&fit=crop&w=1200&q=80"
            alt="Soft drifting white cloud"
            fill
            sizes="(max-width: 768px) 240px, 480px"
            className="ie-cloud-img"
          />
        </div>

        {/* Floating Cloud 2 - Mid Right */}
        <div className="ie-float-cloud ie-fc-right">
          <Image
            src="https://images.unsplash.com/photo-1669988022776-d3349a323b4a?auto=format&fit=crop&w=1200&q=80"
            alt="Soft white cloud drifting gently"
            fill
            sizes="(max-width: 768px) 260px, 520px"
            className="ie-cloud-img"
          />
        </div>

        {/* Floating Cloud 3 - Upper Center/Right subtle ambient */}
        <div className="ie-float-cloud ie-fc-top">
          <Image
            src="https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1000&q=80"
            alt="Soft white puffy cloud"
            fill
            sizes="360px"
            className="ie-cloud-img"
          />
        </div>
      </div>

      {/* Top Navigation Bar */}
      <header className="ie-top-nav-container">
        <div className="ie-top-nav-inner">
          {/* Logo & Brand on Left */}
          <Link href="/" className="ie-brand-logo-link">
            <div className="ie-logo-wrapper">
              <Image
                src="/assets/images/h9O7B-1789370942958.jpg"
                alt="Earth AI Logo"
                width={34}
                height={34}
                className="ie-brand-logo-img"
              />
            </div>
            <div className="ie-brand-name-group">
              <span className="ie-brand-name">Intelligence E</span>
              <span className="ie-brand-badge">by Earth AI</span>
            </div>
          </Link>

          {/* Links in the Middle (Desktop) */}
          <nav className="ie-nav-links" aria-label="Main Navigation">
            <Link href="/finance" className="ie-nav-link active">
              Finance
            </Link>
            <Link href="/agriculture" className="ie-nav-link">
              Agriculture
            </Link>
            <Link href="/about" className="ie-nav-link">
              About
            </Link>
            <Link href="/help" className="ie-nav-link">
              Help
            </Link>
          </nav>

          {/* Login + Start Free on the Right */}
          <div className="ie-nav-actions">
            <Link href="/login" className="ie-login-btn">
              Login
            </Link>
            <Link href="/waitlist" className="ie-start-free-btn">
              <span>Start free</span>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M6 12L10 8L6 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              className="ie-mobile-hamburger"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                {mobileMenuOpen ? (
                  <path
                    d="M6 18L18 6M6 6L18 18"
                    stroke="#0F172A"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ) : (
                  <path
                    d="M4 6H20M4 12H20M4 18H20"
                    stroke="#0F172A"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="ie-mobile-menu">
            <Link href="/finance" className="ie-mobile-link" onClick={() => setMobileMenuOpen(false)}>
              Finance
            </Link>
            <Link href="/agriculture" className="ie-mobile-link" onClick={() => setMobileMenuOpen(false)}>
              Agriculture
            </Link>
            <Link href="/about" className="ie-mobile-link" onClick={() => setMobileMenuOpen(false)}>
              About
            </Link>
            <Link href="/help" className="ie-mobile-link" onClick={() => setMobileMenuOpen(false)}>
              Help
            </Link>
            <div className="ie-mobile-divider" />
            <Link href="/login" className="ie-mobile-link" onClick={() => setMobileMenuOpen(false)}>
              Login
            </Link>
            <Link href="/waitlist" className="ie-mobile-btn" onClick={() => setMobileMenuOpen(false)}>
              Start free
            </Link>
          </div>
        )}
      </header>

      {/* Main Hero Content (Center Aligned) */}
      <main className="ie-hero-center-main">
        {/* Cute White Cloud Character with Smiling Face (Soft 3D style) */}
        <div className="ie-mascot-container">
          <div className="ie-mascot-bobbing">
            <svg
              className="ie-mascot-svg"
              viewBox="0 0 160 110"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="Cute smiling cloud character"
              role="img"
            >
              <defs>
                {/* 3D soft volumetric body gradient */}
                <linearGradient id="cloudBodyGrad" x1="80" y1="6" x2="80" y2="104" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FFFFFF" />
                  <stop offset="65%" stopColor="#F8FAFC" />
                  <stop offset="100%" stopColor="#E2EDF8" />
                </linearGradient>

                {/* Soft top-left 3D highlight */}
                <radialGradient
                  id="cloudHighlight"
                  cx="55"
                  cy="25"
                  r="45"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                </radialGradient>

                {/* Ambient cloud bottom bounce light */}
                <linearGradient id="cloudUnderShade" x1="80" y1="70" x2="80" y2="105" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#CBDDF2" stopOpacity="0" />
                  <stop offset="100%" stopColor="#B3CFEC" stopOpacity="0.45" />
                </linearGradient>

                {/* Soft 3D drop shadow filter */}
                <filter id="mascotShadow" x="-15%" y="-15%" width="135%" height="135%" filterUnits="userSpaceOnUse">
                  <feDropShadow dx="0" dy="10" stdDeviation="9" floodColor="#28567F" floodOpacity="0.14" />
                </filter>
              </defs>

              {/* Main Cloud Form with Soft 3D Filter */}
              <g filter="url(#mascotShadow)">
                {/* Unified Cloud Silhouette using Smooth Overlapping Puffs */}
                <path
                  d="M48 92C32 92 18 79 18 63C18 48 30 36 44 35C48 22 61 12 77 12C94 12 108 23 112 37C115 36 118 35 122 35C136 35 148 47 148 61C148 76 135 88 120 89C115 91 106 92 98 92L48 92Z"
                  fill="url(#cloudBodyGrad)"
                />

                {/* Bottom bounce shadow */}
                <path
                  d="M48 92C32 92 18 79 18 63C18 58 20 53 24 49C24 67 42 88 78 88C110 88 135 73 144 58C146 62 148 66 148 71C148 83 135 92 120 92L48 92Z"
                  fill="url(#cloudUnderShade)"
                />

                {/* Top specular soft sheen */}
                <ellipse cx="65" cy="30" rx="36" ry="18" fill="url(#cloudHighlight)" />
                <ellipse cx="112" cy="42" rx="18" ry="11" fill="url(#cloudHighlight)" />
              </g>

              {/* Friendly Smiling Face (Minimal & Soft) */}
              <g className="ie-mascot-face">
                {/* Left Eye */}
                <circle cx="62" cy="58" r="4.2" fill="#1E293B" />
                <circle cx="60.8" cy="56.5" r="1.5" fill="#FFFFFF" />

                {/* Right Eye */}
                <circle cx="98" cy="58" r="4.2" fill="#1E293B" />
                <circle cx="96.8" cy="56.5" r="1.5" fill="#FFFFFF" />

                {/* Rosy Cheeks (Blush) */}
                <ellipse cx="52" cy="65" rx="5.5" ry="3.5" fill="#FFB1B8" opacity="0.65" />
                <ellipse cx="108" cy="65" rx="5.5" ry="3.5" fill="#FFB1B8" opacity="0.65" />

                {/* Sweet Curved Smile */}
                <path
                  d="M74 65C76 70 84 70 86 65"
                  stroke="#1E293B"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                />
              </g>
            </svg>

            {/* Subtle Grounding Cloud Shadow on Atmosphere */}
            <div className="ie-mascot-cast-shadow" />
          </div>
        </div>

        {/* Center Headline */}
        <h1 className="ie-hero-headline">
          Your AI finance assistant for Tanzanian businesses.
        </h1>

        {/* Gray Subheadline */}
        <p className="ie-hero-subheadline">
          Meet Intelligence E — understand tax, accounting, reports and compliance in simple language.
        </p>

        {/* Large White Rounded Chat / Search Box */}
        <div className="ie-chatbox-wrapper">
          <form onSubmit={handleSubmit} className="ie-chatbox-form">
            <div className="ie-chatbox-input-group">
              {/* Document/Search Icon */}
              <div className="ie-chatbox-leading-icon" aria-hidden="true">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
                    stroke="#94A3B8"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M14 2V8H20"
                    stroke="#94A3B8"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 13H16M8 17H13"
                    stroke="#94A3B8"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              {/* Chat Input Field */}
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about tax, accounting, or upload a document..."
                className="ie-chatbox-input"
                aria-label="Ask about tax, accounting, or upload a document"
              />

              {/* Small Upward Arrow Button on Right */}
              <button
                type="submit"
                className="ie-chatbox-submit-btn"
                aria-label="Send message"
                title="Send message"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 19V5M12 5L5 12M12 5L19 12"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </form>

          {/* Quick Prompt Suggestions */}
          <div className="ie-prompt-chips">
            {samplePrompts.map((promptText, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePromptClick(promptText)}
                className="ie-prompt-chip"
              >
                <span>{promptText}</span>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Realistic White Fluffy Clouds Scattered at Bottom (Real Unsplash Photography) */}
      <div className="ie-bottom-clouds-container" aria-hidden="true">
        {/* Main High-Resolution White Cumulus Clouds Panorama */}
        <div className="ie-bottom-clouds-panorama">
          <Image
            src="https://images.unsplash.com/photo-1666068510008-f44c3637d3c5?auto=format&fit=crop&w=2400&q=85"
            alt="Realistic soft white fluffy clouds panorama"
            fill
            priority
            sizes="100vw"
            className="ie-bottom-cloud-img-main"
          />
        </div>

        {/* Secondary Soft Layer for Fluffy Edge Blending */}
        <div className="ie-bottom-clouds-secondary">
          <Image
            src="https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=2000&q=80"
            alt="Soft fluffy white cloud layers"
            fill
            sizes="100vw"
            className="ie-bottom-cloud-img-soft"
          />
        </div>
      </div>

      {/* Minimal Clean Footer */}
      <footer className="ie-minimal-footer">
        <div className="ie-footer-inner">
          <p>© {new Date().getFullYear()} Earth AI. Built with care for Tanzania.</p>
          <div className="ie-footer-links">
            <Link href="/privacy">Privacy</Link>
            <span className="ie-footer-dot">•</span>
            <Link href="/terms">Terms</Link>
            <span className="ie-footer-dot">•</span>
            <Link href="/help">Help & Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

const heroStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');

  /* Root Page Styles - Light Blue Sky Gradient as specified (#A8D4F0 to #E8F4FC) */
  .ie-hero-root {
    position: relative;
    min-height: 100vh;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: linear-gradient(180deg, #A8D4F0 0%, #C4E4F8 32%, #E0F0FB 65%, #E8F4FC 100%);
    overflow-x: hidden;
    font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    color: #0F172A;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Real Floating Background Clouds Wrap */
  .ie-real-clouds-wrap {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
    z-index: 1;
  }

  .ie-float-cloud {
    position: absolute;
    border-radius: 9999px;
    overflow: hidden;
    pointer-events: none;
  }

  /* Cloud 1 - Drifting on Left */
  .ie-fc-left {
    top: 14%;
    left: -4%;
    width: 440px;
    height: 240px;
    opacity: 0.82;
    mask-image: radial-gradient(ellipse at 50% 50%, rgba(0,0,0,1) 25%, rgba(0,0,0,0.6) 55%, transparent 72%);
    -webkit-mask-image: radial-gradient(ellipse at 50% 50%, rgba(0,0,0,1) 25%, rgba(0,0,0,0.6) 55%, transparent 72%);
    animation: ieDriftLeft 48s ease-in-out infinite alternate;
  }

  /* Cloud 2 - Drifting on Right */
  .ie-fc-right {
    top: 22%;
    right: -5%;
    width: 480px;
    height: 270px;
    opacity: 0.85;
    mask-image: radial-gradient(ellipse at 50% 50%, rgba(0,0,0,1) 25%, rgba(0,0,0,0.55) 55%, transparent 70%);
    -webkit-mask-image: radial-gradient(ellipse at 50% 50%, rgba(0,0,0,1) 25%, rgba(0,0,0,0.55) 55%, transparent 70%);
    animation: ieDriftRight 54s ease-in-out infinite alternate;
  }

  /* Cloud 3 - Upper Center Ambient */
  .ie-fc-top {
    top: 3%;
    right: 28%;
    width: 320px;
    height: 180px;
    opacity: 0.55;
    mask-image: radial-gradient(ellipse at 50% 50%, rgba(0,0,0,1) 20%, transparent 68%);
    -webkit-mask-image: radial-gradient(ellipse at 50% 50%, rgba(0,0,0,1) 20%, transparent 68%);
    animation: ieDriftGentle 60s ease-in-out infinite alternate;
  }

  .ie-cloud-img {
    object-fit: cover;
    mix-blend-mode: normal;
  }

  /* Realistic Bottom Cloud Panorama */
  .ie-bottom-clouds-container {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 380px;
    pointer-events: none;
    z-index: 2;
    overflow: hidden;
  }

  .ie-bottom-clouds-panorama {
    position: absolute;
    inset: 0;
    mask-image: linear-gradient(to top, rgba(0, 0, 0, 1) 35%, rgba(0, 0, 0, 0.8) 65%, rgba(0, 0, 0, 0) 100%);
    -webkit-mask-image: linear-gradient(to top, rgba(0, 0, 0, 1) 35%, rgba(0, 0, 0, 0.8) 65%, rgba(0, 0, 0, 0) 100%);
  }

  .ie-bottom-cloud-img-main {
    object-fit: cover;
    object-position: center 72%;
    filter: brightness(1.04) contrast(1.02);
  }

  .ie-bottom-clouds-secondary {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 280px;
    opacity: 0.45;
    mix-blend-mode: screen;
    mask-image: linear-gradient(to top, rgba(0, 0, 0, 0.9) 20%, rgba(0, 0, 0, 0) 90%);
    -webkit-mask-image: linear-gradient(to top, rgba(0, 0, 0, 0.9) 20%, rgba(0, 0, 0, 0) 90%);
  }

  .ie-bottom-cloud-img-soft {
    object-fit: cover;
    object-position: center bottom;
  }

  /* Top Navigation */
  .ie-top-nav-container {
    position: relative;
    z-index: 30;
    width: 100%;
    padding: 20px 32px;
  }

  .ie-top-nav-inner {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .ie-brand-logo-link {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    transition: opacity 0.2s ease;
  }

  .ie-brand-logo-link:hover {
    opacity: 0.88;
  }

  .ie-logo-wrapper {
    position: relative;
    width: 34px;
    height: 34px;
    border-radius: 9px;
    overflow: hidden;
    box-shadow: 0 4px 10px rgba(15, 23, 42, 0.12);
  }

  .ie-brand-logo-img {
    object-fit: cover;
  }

  .ie-brand-name-group {
    display: flex;
    flex-direction: column;
    line-height: 1.1;
  }

  .ie-brand-name {
    font-size: 1.02rem;
    font-weight: 700;
    color: #0F172A;
    letter-spacing: -0.01em;
  }

  .ie-brand-badge {
    font-size: 0.68rem;
    font-weight: 600;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  /* Nav Links in Center */
  .ie-nav-links {
    display: flex;
    align-items: center;
    gap: 32px;
  }

  .ie-nav-link {
    font-size: 0.95rem;
    font-weight: 500;
    color: #334155;
    text-decoration: none;
    transition: color 0.18s ease;
  }

  .ie-nav-link:hover {
    color: #0F172A;
  }

  .ie-nav-link.active {
    font-weight: 600;
    color: #0F172A;
  }

  /* Nav Actions on Right */
  .ie-nav-actions {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .ie-login-btn {
    font-size: 0.92rem;
    font-weight: 600;
    color: #1E293B;
    text-decoration: none;
    padding: 8px 14px;
    border-radius: 9999px;
    transition: all 0.18s ease;
  }

  .ie-login-btn:hover {
    color: #0F172A;
    background: rgba(255, 255, 255, 0.45);
  }

  .ie-start-free-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.92rem;
    font-weight: 600;
    color: #FFFFFF;
    background: #0F172A;
    text-decoration: none;
    padding: 9px 20px;
    border-radius: 9999px;
    box-shadow: 0 4px 14px rgba(15, 23, 42, 0.18);
    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .ie-start-free-btn:hover {
    background: #1E293B;
    transform: translateY(-1px);
    box-shadow: 0 6px 18px rgba(15, 23, 42, 0.22);
  }

  .ie-mobile-hamburger {
    display: none;
    background: none;
    border: none;
    padding: 6px;
    cursor: pointer;
    border-radius: 8px;
  }

  /* Mobile Menu */
  .ie-mobile-menu {
    display: none;
  }

  /* Center Hero Main */
  .ie-hero-center-main {
    position: relative;
    z-index: 10;
    max-width: 860px;
    width: 100%;
    margin: 0 auto;
    padding: 40px 24px 80px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  /* Cute Cloud Character Mascot */
  .ie-mascot-container {
    margin-bottom: 24px;
  }

  .ie-mascot-bobbing {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    animation: ieMascotFloat 4.8s ease-in-out infinite;
  }

  .ie-mascot-svg {
    width: 128px;
    height: 88px;
    overflow: visible;
  }

  .ie-mascot-cast-shadow {
    width: 74px;
    height: 10px;
    margin-top: 6px;
    background: radial-gradient(ellipse at center, rgba(37, 85, 126, 0.18) 0%, rgba(37, 85, 126, 0.05) 55%, transparent 75%);
    border-radius: 9999px;
    animation: ieMascotShadow 4.8s ease-in-out infinite;
  }

  /* Hero Headline */
  .ie-hero-headline {
    font-size: clamp(2.25rem, 4.6vw, 3.6rem);
    font-weight: 800;
    color: #0F172A;
    line-height: 1.15;
    letter-spacing: -0.035em;
    margin: 0 0 16px 0;
    max-width: 780px;
  }

  /* Hero Subheadline */
  .ie-hero-subheadline {
    font-size: clamp(1.05rem, 1.8vw, 1.25rem);
    font-weight: 450;
    color: #475569;
    line-height: 1.55;
    margin: 0 auto 36px auto;
    max-width: 620px;
  }

  /* Large White Rounded Chat / Search Box */
  .ie-chatbox-wrapper {
    width: 100%;
    max-width: 680px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .ie-chatbox-form {
    width: 100%;
  }

  .ie-chatbox-input-group {
    position: relative;
    display: flex;
    align-items: center;
    background: #FFFFFF;
    border-radius: 20px;
    padding: 7px 8px 7px 18px;
    box-shadow: 
      0 20px 40px -12px rgba(23, 58, 94, 0.12),
      0 8px 18px -4px rgba(23, 58, 94, 0.05),
      0 0 0 1px rgba(255, 255, 255, 0.9) inset;
    transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .ie-chatbox-input-group:focus-within {
    box-shadow: 
      0 24px 50px -12px rgba(23, 58, 94, 0.18),
      0 10px 22px -4px rgba(23, 58, 94, 0.08),
      0 0 0 2px rgba(15, 23, 42, 0.85);
    transform: translateY(-2px);
  }

  .ie-chatbox-leading-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94A3B8;
    margin-right: 12px;
    flex-shrink: 0;
  }

  .ie-chatbox-input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-family: inherit;
    font-size: 1.05rem;
    color: #0F172A;
    font-weight: 500;
    min-width: 0;
  }

  .ie-chatbox-input::placeholder {
    color: #94A3B8;
    font-weight: 400;
  }

  .ie-chatbox-submit-btn {
    width: 44px;
    height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #0F172A;
    color: #FFFFFF;
    border: none;
    border-radius: 14px;
    cursor: pointer;
    flex-shrink: 0;
    transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .ie-chatbox-submit-btn:hover {
    background: #1E293B;
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.28);
  }

  .ie-chatbox-submit-btn:active {
    transform: scale(0.96);
  }

  /* Quick Suggestion Chips */
  .ie-prompt-chips {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 8px;
    max-width: 640px;
  }

  .ie-prompt-chip {
    background: rgba(255, 255, 255, 0.65);
    border: 1px solid rgba(255, 255, 255, 0.85);
    border-radius: 9999px;
    padding: 6px 14px;
    font-size: 0.82rem;
    font-weight: 500;
    color: #334155;
    cursor: pointer;
    backdrop-filter: blur(8px);
    transition: all 0.18s ease;
  }

  .ie-prompt-chip:hover {
    background: #FFFFFF;
    color: #0F172A;
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(15, 23, 42, 0.06);
  }

  /* Minimal Footer */
  .ie-minimal-footer {
    position: relative;
    z-index: 10;
    width: 100%;
    padding: 16px 24px;
  }

  .ie-footer-inner {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.84rem;
    color: #475569;
  }

  .ie-footer-links {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .ie-footer-links a {
    color: #475569;
    text-decoration: none;
    transition: color 0.18s ease;
  }

  .ie-footer-links a:hover {
    color: #0F172A;
  }

  .ie-footer-dot {
    opacity: 0.4;
  }

  /* Animations */
  @keyframes ieMascotFloat {
    0%, 100% {
      transform: translateY(0px) rotate(0deg);
    }
    50% {
      transform: translateY(-10px) rotate(1.2deg);
    }
  }

  @keyframes ieMascotShadow {
    0%, 100% {
      transform: scale(1);
      opacity: 0.85;
    }
    50% {
      transform: scale(0.82);
      opacity: 0.45;
    }
  }

  @keyframes ieDriftLeft {
    0% {
      transform: translateX(0px) translateY(0px);
    }
    100% {
      transform: translateX(35px) translateY(-14px);
    }
  }

  @keyframes ieDriftRight {
    0% {
      transform: translateX(0px) translateY(0px);
    }
    100% {
      transform: translateX(-40px) translateY(-18px);
    }
  }

  @keyframes ieDriftGentle {
    0% {
      transform: translateX(0px) translateY(0px);
    }
    100% {
      transform: translateX(-25px) translateY(12px);
    }
  }

  /* Responsive Breakpoints */
  @media (max-width: 860px) {
    .ie-nav-links {
      display: none;
    }

    .ie-mobile-hamburger {
      display: flex;
    }

    .ie-mobile-menu {
      display: flex;
      flex-direction: column;
      gap: 12px;
      position: absolute;
      top: 100%;
      left: 20px;
      right: 20px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(14px);
      border-radius: 18px;
      padding: 18px 20px;
      box-shadow: 0 16px 36px rgba(15, 23, 42, 0.12);
      border: 1px solid rgba(255, 255, 255, 0.8);
      z-index: 50;
    }

    .ie-mobile-link {
      font-size: 1rem;
      font-weight: 600;
      color: #1E293B;
      text-decoration: none;
      padding: 6px 0;
    }

    .ie-mobile-divider {
      height: 1px;
      background: #E2E8F0;
      margin: 4px 0;
    }

    .ie-mobile-btn {
      display: block;
      text-align: center;
      background: #0F172A;
      color: #FFFFFF;
      font-weight: 600;
      padding: 10px 18px;
      border-radius: 9999px;
      text-decoration: none;
    }

    .ie-hero-center-main {
      padding: 30px 20px 60px;
    }

    .ie-chatbox-input {
      font-size: 0.95rem;
    }

    .ie-prompt-chips {
      display: none;
    }

    .ie-footer-inner {
      flex-direction: column;
      gap: 8px;
      text-align: center;
    }

    .ie-bottom-clouds-container {
      height: 280px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .ie-mascot-bobbing,
    .ie-mascot-cast-shadow,
    .ie-fc-left,
    .ie-fc-right,
    .ie-fc-top {
      animation: none !important;
    }
  }
`;
