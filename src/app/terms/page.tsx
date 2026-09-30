'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getPublicSkyPhoto, isPublicSkyDaytime } from '@/lib/public-sky-background';

const sections = [
  ['1. Acceptance of Terms', 'By accessing Earth AI\'s website, public product pages, administrative portal, APIs, or related services, you agree to these Terms of Service. If you do not agree, do not use the Services.'],
  ['2. Services', 'Earth AI develops specialized artificial intelligence products for real world industries. Intelligence E for Agriculture is an agricultural intelligence platform that may be accessed through approved applications, integrations, APIs, and internal administrative tools. Customer facing farm management and operational workflows may be delivered through connected products such as Pelit.'],
  ['3. Authorized Access', 'Some areas of the Services are restricted to authorized personnel, approved partners, or permitted integrations. You must not attempt to access restricted systems, private APIs, confidential data, or tools that you are not authorized to use.'],
  ['4. User Responsibilities', 'You must use the Services lawfully and responsibly. You must not misuse the Services, interfere with their operation, submit unlawful content, expose credentials, scrape without permission, reverse engineer the platform, or rely on AI output as the sole basis for high impact agricultural, financial, legal, medical, or safety decisions.'],
  ['5. AI Outputs', 'Earth AI provides analysis, explanations, summaries, forecasts, research support, and decision assistance. AI outputs may be incomplete, outdated, or inaccurate. They are not a substitute for professional advice, field inspection, financial review, legal advice, or expert judgment. You remain responsible for decisions made using the Services.'],
  ['6. Data and Integrations', 'Where the Services connect with third party applications, farm management systems, APIs, or external data sources, you are responsible for ensuring that you have the right to provide and process that data. Integrations must be implemented securely and must not expose private credentials in client applications.'],
  ['7. Intellectual Property', 'Earth AI and its licensors retain all rights in the Services, including software, designs, models, prompts, workflows, documentation, branding, and other intellectual property. These Terms do not grant ownership of Earth AI technology or content.'],
  ['8. Availability and Changes', 'We may update, modify, limit, suspend, or discontinue parts of the Services as products evolve. We aim to operate reliable services, but we do not guarantee uninterrupted availability or error free operation.'],
  ['9. Limitation of Liability', 'To the maximum extent permitted by law, Earth AI is not liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or for losses arising from reliance on AI outputs, data inaccuracies, service interruption, or third party integrations.'],
  ['10. Termination', 'We may suspend or terminate access to the Services if we believe these Terms have been violated, if continued access may create risk, or if required by law. You may stop using the Services at any time.'],
  ['11. Governing Law', 'These Terms are governed by applicable law. Any dispute will be handled through the appropriate legal process in a court or forum with proper jurisdiction.'],
  ['12. Contact', 'For questions about these Terms, contact Earth AI through the official contact channels listed on our website.'],
];

export default function TermsPage() {
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
          <div><Link href="/agriculture">Agriculture</Link><Link href="/finance">Finance</Link><Link href="/privacy">Privacy</Link></div>
        </nav>
        <section className="legal-card">
          <p className="eyebrow">Legal</p>
          <h1>Terms of Service</h1>
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
