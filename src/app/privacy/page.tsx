'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getPublicSkyPhoto, isPublicSkyDaytime } from '@/lib/public-sky-background';

const sections = [
  ['1. Who We Are', 'Earth AI develops specialized artificial intelligence products for real world industries. This Privacy Policy explains how we collect, use, disclose, and protect information when people visit our website, use approved Earth AI services, or interact with Intelligence E through authorized applications and integrations.'],
  ['2. Information We Collect', 'Depending on how you interact with Earth AI, we may collect website information, contact information, account information for authorized users, usage information related to AI requests and API calls, diagnostics, and content submitted to approved workflows such as text, documents, images, agricultural context, or integration data.'],
  ['3. How We Use Information', 'We use information to operate, secure, maintain, and improve Earth AI products. This includes delivering AI responses, supporting integrations, monitoring reliability, preventing misuse, improving product quality, responding to inquiries, enforcing terms, and meeting legal obligations.'],
  ['4. AI and Submitted Content', 'When you submit text, images, documents, or agricultural context to Intelligence E through an approved product or integration, that content may be processed to generate analysis, summaries, recommendations, or other AI assisted outputs. We use reasonable safeguards to protect submitted content and restrict access based on role, purpose, and authorization.'],
  ['5. Sharing Information', 'We do not sell personal information. We may share information with trusted service providers, infrastructure providers, analytics providers, security tools, approved integration partners, legal authorities when required, or parties involved in a business transaction, subject to appropriate confidentiality and security obligations.'],
  ['6. Security', 'We use technical and organizational safeguards designed to protect information, including access controls, encryption in transit, monitoring, and restricted administrative access. No system can be guaranteed completely secure, but security is treated as a core product requirement.'],
  ['7. Data Retention', 'We retain information for as long as needed to provide the Services, comply with legal obligations, resolve disputes, enforce agreements, secure the platform, and improve reliability. Retention periods may vary by data type, legal requirement, and product context.'],
  ['8. Your Choices and Rights', 'Depending on your location, you may have rights to access, correct, delete, restrict, object to processing, or request portability of personal information. You may also choose not to provide certain information, though some Services may not function without it.'],
  ['9. Cookies and Similar Technologies', 'We may use cookies and similar technologies to operate the website, remember preferences, improve performance, and understand usage. You can manage cookies through your browser settings, but disabling some cookies may affect functionality.'],
  ['10. International Use', 'Earth AI may be accessed from different countries. Information may be processed in countries other than where you are located, subject to appropriate safeguards where required by law.'],
  ['11. Changes to This Policy', 'We may update this Privacy Policy as our products, legal obligations, or data practices change. The updated version will be posted on this page with a revised date.'],
  ['12. Contact', 'For privacy questions or requests, contact Earth AI through the official contact channels listed on our website.'],
];

export default function PrivacyPage() {
  const [hour, setHour] = useState(12);
  const [photoIndex, setPhotoIndex] = useState(0);
  const photo = useMemo(() => getPublicSkyPhoto(hour, photoIndex), [hour, photoIndex]);
  const daytime = isPublicSkyDaytime(hour);

  useEffect(() => {
    const updateTime = () => setHour(new Date().getHours());
    updateTime();
    const timeTimer = window.setInterval(updateTime, 60000);
    const photoTimer = window.setInterval(() => setPhotoIndex((value) => value + 1), 22000);
    return () => {
      window.clearInterval(timeTimer);
      window.clearInterval(photoTimer);
    };
  }, []);

  return (
    <>
      <style>{styles}</style>
      <main
        className="legal-root"
        style={{
          '--legal-photo': `url(${photo.url})`,
          '--legal-overlay': daytime
            ? 'linear-gradient(180deg, rgba(3,7,18,0.42), rgba(3,7,18,0.76))'
            : 'linear-gradient(180deg, rgba(3,7,18,0.64), rgba(3,7,18,0.88))',
        } as React.CSSProperties}
      >
        <div className="legal-bg" role="img" aria-label={photo.alt} />
        <nav className="legal-nav" aria-label="Earth AI">
          <Link href="/" className="brand"><Image src="/assets/images/h9O7B-1789370942958.jpg" alt="Earth AI logo" width={34} height={34} priority />Earth AI</Link>
          <div><Link href="/agriculture">Agriculture</Link><Link href="/finance">Finance</Link><Link href="/terms">Terms</Link></div>
        </nav>
        <section className="legal-card">
          <p className="eyebrow">Legal</p>
          <h1>Privacy Policy</h1>
          <p className="updated">Last updated: September 30, 2026</p>
          {sections.map(([title, body]) => <section key={title}><h2>{title}</h2><p>{body}</p></section>)}
        </section>
      </main>
    </>
  );
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  .legal-root { min-height: 100vh; position: relative; padding: 24px 18px 64px; color: #fff; background: #050816; }
  .legal-bg { position: fixed; inset: 0; background-image: var(--legal-overlay), var(--legal-photo); background-size: cover; background-position: center; }
  .legal-nav, .legal-card { position: relative; z-index: 1; }
  .legal-nav { width: min(980px, 100%); margin: 0 auto 40px; display: flex; align-items: center; justify-content: space-between; gap: 18px; }
  .brand { display: inline-flex; align-items: center; gap: 10px; color: #fff; text-decoration: none; font-weight: 800; }
  .brand img { border-radius: 9px; object-fit: cover; }
  .legal-nav div { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
  .legal-nav a { color: rgba(255,255,255,0.78); text-decoration: none; font-size: 13px; font-weight: 700; padding: 8px 10px; border-radius: 999px; }
  .legal-nav a:hover { background: rgba(255,255,255,0.12); color: #fff; }
  .legal-card { width: min(820px, 100%); margin: 0 auto; padding: clamp(24px, 5vw, 48px); border: 1px solid rgba(255,255,255,0.16); border-radius: 22px; background: rgba(8,13,24,0.76); backdrop-filter: blur(18px); box-shadow: 0 24px 70px rgba(0,0,0,0.26); }
  .eyebrow { margin: 0 0 10px; color: rgba(255,255,255,0.62); font-size: 12px; font-weight: 800; letter-spacing: 0.12em; text-transform: uppercase; }
  h1 { margin: 0; font-size: clamp(32px, 5vw, 48px); letter-spacing: -0.05em; line-height: 1.05; }
  .updated { margin: 10px 0 34px; color: rgba(255,255,255,0.58); font-size: 13px; }
  section { padding: 22px 0; border-top: 1px solid rgba(255,255,255,0.14); }
  h2 { margin: 0 0 10px; font-size: 16px; letter-spacing: -0.02em; }
  section p { margin: 0; color: rgba(255,255,255,0.76); font-size: 14px; line-height: 1.78; }
  @media (max-width: 560px) { .legal-nav { align-items: flex-start; flex-direction: column; } .legal-card { border-radius: 18px; } }
`;
