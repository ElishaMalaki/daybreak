'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface DocSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  articles: DocArticle[];
}

interface DocArticle {
  title: string;
  content: string;
  tags?: string[];
}

interface FaqItem {
  question: string;
  answer: string;
}

const docSections: DocSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    articles: [
      {
        title: 'Creating your Earth AI account',
        content: 'Navigate to the login page and select "Create Account". Enter your full name, email address, and a secure password (minimum 8 characters). After submission, you will be redirected to the Intelligence E Agriculture dashboard where you can begin exploring your data.',
        tags: ['account', 'setup'],
      },
      {
        title: 'Navigating the dashboard',
        content: 'The main dashboard provides an overview of your farm intelligence metrics, recent AI analyses, and quick-access cards for each module. Use the left sidebar to navigate between Dashboard, Intelligence, Farm Data, Research, and Reports sections.',
        tags: ['navigation', 'dashboard'],
      },
      {
        title: 'Connecting your farm data',
        content: 'Go to Farm Data in the sidebar to begin importing your agricultural data. Earth AI supports manual data entry, CSV uploads, and API integrations with common farm management systems. Your data is encrypted and stored securely.',
        tags: ['data', 'import'],
      },
    ],
  },
  {
    id: 'intelligence',
    title: 'Intelligence E Agriculture',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
        <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
      </svg>
    ),
    articles: [
      {
        title: 'Using the AI chat assistant',
        content: 'The Intelligence module features a conversational AI assistant trained on agricultural science, crop management, and soil health data. Ask questions in natural language such as "What is the optimal irrigation schedule for wheat in dry conditions?" or "Analyze my yield data for anomalies."',
        tags: ['AI', 'chat'],
      },
      {
        title: 'Crop yield predictions',
        content: 'Earth AI analyzes historical yield data, weather patterns, soil composition, and market trends to generate accurate crop yield predictions. Navigate to Intelligence and select "Yield Forecast" to view predictions for your registered fields.',
        tags: ['predictions', 'yield'],
      },
      {
        title: 'Soil health analysis',
        content: 'Upload soil test results or connect a compatible soil sensor to receive AI-powered recommendations for fertilization, pH adjustment, and organic matter improvement. The system tracks soil health trends over time and alerts you to significant changes.',
        tags: ['soil', 'analysis'],
      },
      {
        title: 'Pest and disease detection',
        content: 'Upload field photos to the Intelligence module to receive AI-assisted identification of common crop diseases, pest infestations, and nutrient deficiencies. The system cross-references your location, crop type, and current season to improve accuracy.',
        tags: ['pest', 'disease'],
      },
    ],
  },
  {
    id: 'farm-data',
    title: 'Farm Data Management',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    ),
    articles: [
      {
        title: 'Adding and managing fields',
        content: 'In the Farm Data section, select "Add Field" to register a new agricultural plot. Enter the field name, area in hectares or acres, primary crop type, and GPS coordinates or draw the boundary on the map. Fields can be grouped by farm or region for easier management.',
        tags: ['fields', 'management'],
      },
      {
        title: 'Recording crop cycles',
        content: 'Track planting dates, variety selections, input applications, and harvest records for each field. Earth AI uses this historical data to improve prediction accuracy and generate season-over-season performance comparisons.',
        tags: ['crops', 'records'],
      },
      {
        title: 'Weather data integration',
        content: 'Earth AI automatically pulls weather data for your registered field locations. Historical weather records are used in yield models, while forecast data powers irrigation and spray timing recommendations. You can also manually enter local weather observations.',
        tags: ['weather', 'integration'],
      },
    ],
  },
  {
    id: 'reports',
    title: 'Reports and Analytics',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    articles: [
      {
        title: 'Generating season reports',
        content: 'Navigate to Reports and select "New Report" to generate a comprehensive season summary. Choose the date range, fields to include, and report type (yield summary, input cost analysis, or profitability overview). Reports can be exported as PDF or CSV.',
        tags: ['reports', 'export'],
      },
      {
        title: 'Understanding analytics charts',
        content: 'The analytics dashboard displays yield trends, input cost breakdowns, and weather correlation charts. Hover over data points for detailed values. Use the date range selector to compare different seasons or time periods side by side.',
        tags: ['analytics', 'charts'],
      },
    ],
  },
  {
    id: 'account',
    title: 'Account and Settings',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
    articles: [
      {
        title: 'Updating your profile',
        content: 'Go to Profile in the sidebar to update your full name, contact information, and farm details. Keeping your profile current ensures AI recommendations are calibrated to your specific region and farming context.',
        tags: ['profile', 'account'],
      },
      {
        title: 'Changing your password',
        content: 'In Settings, select "Security" to update your password. You will need to enter your current password before setting a new one. Passwords must be at least 8 characters and should include a mix of letters, numbers, and symbols.',
        tags: ['security', 'password'],
      },
      {
        title: 'Notification preferences',
        content: 'Manage email and in-app notification settings in Settings under "Notifications". You can configure alerts for AI analysis completions, weather warnings, pest risk alerts, and weekly farm summary digests.',
        tags: ['notifications', 'settings'],
      },
    ],
  },
];

const faqItems: FaqItem[] = [
  {
    question: 'What AI models power Earth AI?',
    answer: 'Earth AI uses a combination of leading large language models including OpenAI GPT-4, Anthropic Claude, and Google Gemini, routed intelligently based on the type of query. Agricultural-specific fine-tuning and retrieval-augmented generation ensure responses are grounded in agronomic science.',
  },
  {
    question: 'Is my farm data private and secure?',
    answer: 'Yes. All farm data is encrypted in transit and at rest. Earth AI does not sell or share your data with third parties. Your data is used solely to power your own AI analyses and recommendations. You can export or delete your data at any time from the Settings page.',
  },
  {
    question: 'What crops and regions does Earth AI support?',
    answer: 'Earth AI supports analysis for a wide range of crops including cereals, legumes, vegetables, fruits, and specialty crops. The platform has been trained on agricultural data from major farming regions worldwide. Regional calibration improves over time as more local data is added.',
  },
  {
    question: 'Can I use Earth AI on mobile devices?',
    answer: 'Yes. The Earth AI web application is fully responsive and works on smartphones and tablets. A dedicated mobile app is on the roadmap. For field use, the mobile browser experience provides access to all core features including the AI assistant and data entry.',
  },
  {
    question: 'How accurate are the yield predictions?',
    answer: 'Prediction accuracy improves with more historical data from your specific fields. In general, yield forecasts achieve 85-92% accuracy when at least two full seasons of data are available. The system clearly communicates confidence intervals alongside all predictions.',
  },
  {
    question: 'How do I report a bug or request a feature?',
    answer: 'Use the feedback button in the application sidebar or send an email to support@earthai.com. Feature requests are reviewed by the product team and prioritized based on user demand. You can track the status of your requests in the community roadmap.',
  },
];

export default function HelpPage() {
  const [activeSection, setActiveSection] = useState<string>('getting-started');
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const currentSection = docSections.find((s) => s.id === activeSection);

  const filteredArticles = searchQuery.trim()
    ? docSections.flatMap((s) =>
        s.articles
          .filter(
            (a) =>
              a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              a.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
              a.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
          )
          .map((a) => ({ ...a, sectionTitle: s.title }))
      )
    : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        html, body { height: 100%; font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; }
        @keyframes helpFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes twinkleSlow {
          0%, 100% { opacity: 0.1; transform: scale(0.9); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
        @keyframes auroraShift {
          0%, 100% { opacity: 0.10; transform: scaleX(1) scaleY(1); }
          50% { opacity: 0.20; transform: scaleX(1.08) scaleY(1.12); }
        }
        @keyframes moonGlow {
          0%, 100% { box-shadow: 0 0 40px 12px rgba(200,220,255,0.18), 0 0 80px 30px rgba(160,190,255,0.10); }
          50% { box-shadow: 0 0 60px 20px rgba(200,220,255,0.28), 0 0 120px 50px rgba(160,190,255,0.16); }
        }
        @keyframes shootingStar {
          0% { transform: translateX(0) translateY(0) rotate(-35deg); opacity: 1; width: 0; }
          30% { width: 100px; opacity: 1; }
          100% { transform: translateX(350px) translateY(180px) rotate(-35deg); opacity: 0; width: 100px; }
        }
        .help-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: 9px;
          cursor: pointer;
          font-size: 13.5px;
          font-weight: 500;
          letter-spacing: -0.01em;
          transition: all 0.12s;
          color: rgba(246,247,251,0.5);
          background: transparent;
          border: none;
          width: 100%;
          text-align: left;
          font-family: inherit;
        }
        .help-nav-item:hover {
          background: rgba(255,255,255,0.05);
          color: rgba(246,247,251,0.8);
        }
        .help-nav-item.active {
          background: rgba(34,197,94,0.10);
          color: #4ade80;
        }
        .help-nav-item.active svg {
          stroke: #4ade80;
        }
        .help-article-btn {
          width: 100%;
          text-align: left;
          background: none;
          border: none;
          cursor: pointer;
          font-family: inherit;
          padding: 0;
        }
        .help-faq-btn {
          width: 100%;
          text-align: left;
          background: none;
          border: none;
          cursor: pointer;
          font-family: inherit;
          padding: 0;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }
        .help-search-input::placeholder {
          color: rgba(246,247,251,0.3);
        }
        .help-search-input {
          background: transparent;
          border: none;
          outline: none;
          color: #f6f7fb;
          font-size: 14px;
          font-family: inherit;
          letter-spacing: -0.005em;
          flex: 1;
        }
        .help-tag {
          display: inline-flex;
          align-items: center;
          padding: 2px 8px;
          border-radius: 999px;
          background: rgba(34,197,94,0.08);
          border: 1px solid rgba(34,197,94,0.15);
          color: rgba(74,222,128,0.8);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.01em;
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #020510 0%, #060c1a 30%, #0a1228 60%, #0d1830 100%)',
        fontFamily: "'Plus Jakarta Sans', -apple-system, sans-serif",
        color: '#f6f7fb',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Night sky background layer */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          {/* Stars */}
          {[
            { top: '3%', left: '6%', size: 2, delay: '0s', dur: '3.2s' },
            { top: '6%', left: '20%', size: 1.5, delay: '0.4s', dur: '2.8s' },
            { top: '2%', left: '36%', size: 2.5, delay: '1.1s', dur: '4s' },
            { top: '8%', left: '53%', size: 1, delay: '0.7s', dur: '3.5s' },
            { top: '4%', left: '68%', size: 2, delay: '1.8s', dur: '2.6s' },
            { top: '1%', left: '84%', size: 1.5, delay: '0.3s', dur: '3.8s' },
            { top: '11%', left: '12%', size: 1, delay: '2.1s', dur: '3s' },
            { top: '14%', left: '28%', size: 2, delay: '0.9s', dur: '4.2s' },
            { top: '10%', left: '46%', size: 1.5, delay: '1.5s', dur: '2.9s' },
            { top: '17%', left: '60%', size: 2.5, delay: '0.2s', dur: '3.6s' },
            { top: '12%', left: '76%', size: 1, delay: '1.3s', dur: '2.7s' },
            { top: '19%', left: '91%', size: 2, delay: '2.4s', dur: '3.3s' },
            { top: '24%', left: '4%', size: 1.5, delay: '0.6s', dur: '4.1s' },
            { top: '27%', left: '17%', size: 1, delay: '1.7s', dur: '3s' },
            { top: '21%', left: '33%', size: 2, delay: '0.8s', dur: '2.5s' },
            { top: '29%', left: '50%', size: 1.5, delay: '2.2s', dur: '3.7s' },
            { top: '25%', left: '66%', size: 2.5, delay: '0.5s', dur: '4.4s' },
            { top: '31%', left: '80%', size: 1, delay: '1.9s', dur: '3.1s' },
            { top: '37%', left: '9%', size: 2, delay: '1.2s', dur: '2.8s' },
            { top: '34%', left: '24%', size: 1.5, delay: '0.1s', dur: '3.9s' },
            { top: '41%', left: '41%', size: 1, delay: '2.6s', dur: '3.4s' },
            { top: '39%', left: '57%', size: 2, delay: '0.4s', dur: '2.6s' },
            { top: '44%', left: '73%', size: 1.5, delay: '1.4s', dur: '4s' },
            { top: '47%', left: '87%', size: 2.5, delay: '0.7s', dur: '3.2s' },
            { top: '54%', left: '2%', size: 1, delay: '2s', dur: '2.9s' },
            { top: '51%', left: '19%', size: 2, delay: '1.6s', dur: '3.6s' },
            { top: '57%', left: '36%', size: 1.5, delay: '0.3s', dur: '4.3s' },
            { top: '59%', left: '54%', size: 1, delay: '2.3s', dur: '3s' },
            { top: '55%', left: '71%', size: 2, delay: '0.9s', dur: '2.7s' },
            { top: '61%', left: '89%', size: 1.5, delay: '1.1s', dur: '3.8s' },
            { top: '67%', left: '11%', size: 2.5, delay: '0.5s', dur: '4.1s' },
            { top: '64%', left: '27%', size: 1, delay: '1.8s', dur: '3.3s' },
            { top: '71%', left: '44%', size: 2, delay: '2.5s', dur: '2.8s' },
            { top: '69%', left: '61%', size: 1.5, delay: '0.2s', dur: '3.5s' },
            { top: '74%', left: '79%', size: 1, delay: '1.3s', dur: '4.2s' },
            { top: '79%', left: '6%', size: 2, delay: '0.6s', dur: '3s' },
            { top: '77%', left: '22%', size: 1.5, delay: '2.1s', dur: '2.6s' },
            { top: '84%', left: '39%', size: 2.5, delay: '0.8s', dur: '3.7s' },
            { top: '81%', left: '56%', size: 1, delay: '1.5s', dur: '4.4s' },
            { top: '87%', left: '73%', size: 2, delay: '0.4s', dur: '3.1s' },
            { top: '89%', left: '91%', size: 1.5, delay: '1.9s', dur: '2.9s' },
            { top: '94%', left: '14%', size: 1, delay: '2.7s', dur: '3.6s' },
            { top: '92%', left: '32%', size: 2, delay: '0.1s', dur: '4s' },
            { top: '96%', left: '49%', size: 1.5, delay: '1.2s', dur: '3.3s' },
            { top: '93%', left: '66%', size: 2.5, delay: '2.4s', dur: '2.7s' },
            { top: '5%', left: '94%', size: 1, delay: '0.7s', dur: '3.9s' },
            { top: '32%', left: '95%', size: 2, delay: '1.6s', dur: '3.2s' },
            { top: '49%', left: '96%', size: 1.5, delay: '0.3s', dur: '4.1s' },
            { top: '15%', left: '0.5%', size: 2, delay: '2.2s', dur: '2.8s' },
            { top: '43%', left: '1.5%', size: 1, delay: '0.9s', dur: '3.5s' },
          ].map((star, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: star.top,
                left: star.left,
                width: star.size,
                height: star.size,
                borderRadius: '50%',
                background: i % 5 === 0 ? '#b8d4ff' : i % 3 === 0 ? '#e8f0ff' : '#ffffff',
                animation: `${i % 2 === 0 ? 'twinkle' : 'twinkleSlow'} ${star.dur} ${star.delay} ease-in-out infinite`,
              }}
            />
          ))}

          {/* Moon */}
          <div style={{
            position: 'absolute',
            top: '6%',
            right: '8%',
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 38% 38%, #f0f4ff 0%, #d8e4ff 40%, #b8ccff 100%)',
            animation: 'moonGlow 6s ease-in-out infinite',
          }}>
            <div style={{ position: 'absolute', top: '22%', left: '28%', width: 7, height: 7, borderRadius: '50%', background: 'rgba(160,180,220,0.35)' }} />
            <div style={{ position: 'absolute', top: '55%', left: '55%', width: 4, height: 4, borderRadius: '50%', background: 'rgba(160,180,220,0.28)' }} />
            <div style={{ position: 'absolute', top: '38%', left: '62%', width: 5, height: 5, borderRadius: '50%', background: 'rgba(160,180,220,0.22)' }} />
          </div>

          {/* Aurora borealis */}
          <div style={{
            position: 'absolute',
            top: '10%',
            left: '-10%',
            width: '65%',
            height: '22%',
            background: 'radial-gradient(ellipse at center, rgba(32,178,120,0.15) 0%, rgba(32,100,200,0.10) 50%, transparent 80%)',
            borderRadius: '50%',
            filter: 'blur(45px)',
            animation: 'auroraShift 9s ease-in-out infinite',
          }} />
          <div style={{
            position: 'absolute',
            top: '3%',
            right: '-5%',
            width: '45%',
            height: '18%',
            background: 'radial-gradient(ellipse at center, rgba(80,60,200,0.12) 0%, rgba(140,60,200,0.08) 50%, transparent 80%)',
            borderRadius: '50%',
            filter: 'blur(55px)',
            animation: 'auroraShift 11s 2s ease-in-out infinite',
          }} />

          {/* Shooting stars */}
          <div style={{
            position: 'absolute',
            top: '15%',
            left: '8%',
            height: 1.5,
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)',
            borderRadius: 2,
            animation: 'shootingStar 9s 4s ease-in infinite',
          }} />
          <div style={{
            position: 'absolute',
            top: '40%',
            left: '55%',
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(200,220,255,0.8), transparent)',
            borderRadius: 2,
            animation: 'shootingStar 13s 8s ease-in infinite',
          }} />

          {/* Milky way band */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(125deg, transparent 20%, rgba(100,120,200,0.03) 40%, rgba(140,160,240,0.06) 50%, rgba(100,120,200,0.03) 60%, transparent 80%)',
          }} />
        </div>

        {/* Top navigation bar */}
        <div style={{
          height: 56,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          gap: 16,
          background: 'rgba(6,12,26,0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}>
          <Link href="/app/agriculture" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            textDecoration: 'none',
            color: 'rgba(246,247,251,0.5)',
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: '-0.005em',
            transition: 'color 0.12s',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to App
          </Link>
          <div style={{ flex: 1 }} />
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: 'rgba(246,247,251,0.35)',
            fontSize: 13,
            fontWeight: 500,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Help Center
          </div>
        </div>

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px 80px', position: 'relative', zIndex: 1 }}>
          {/* Page header */}
          <div style={{ marginBottom: 40, animation: 'helpFadeIn 0.5s cubic-bezier(0.23,1,0.32,1) both' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 12px',
              borderRadius: 999,
              background: 'rgba(34,197,94,0.08)',
              border: '1px solid rgba(34,197,94,0.15)',
              color: '#4ade80',
              fontSize: 11.5,
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: 16,
            }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ade80' }} />
              Earth AI Documentation
            </div>
            <h1 style={{
              fontSize: 36,
              fontWeight: 700,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              color: '#f6f7fb',
              marginBottom: 12,
            }}>
              Help and Documentation
            </h1>
            <p style={{
              fontSize: 16,
              color: 'rgba(246,247,251,0.52)',
              lineHeight: 1.6,
              letterSpacing: '-0.005em',
              maxWidth: 520,
            }}>
              Everything you need to get the most out of Intelligence E Agriculture. Browse guides, explore features, and find answers.
            </p>
          </div>

          {/* Search bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            height: 48,
            borderRadius: 12,
            border: searchFocused ? '1px solid rgba(255,255,255,0.36)' : '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(13,16,23,0.85)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            padding: '0 16px',
            marginBottom: 40,
            transition: 'border-color 0.15s',
            maxWidth: 560,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'rgba(246,247,251,0.3)', flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search documentation..."
              className="help-search-input"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'rgba(246,247,251,0.3)',
                  padding: 2,
                  display: 'flex',
                  alignItems: 'center',
                  flexShrink: 0,
                }}
                aria-label="Clear search"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>

          {/* Search results */}
          {filteredArticles !== null ? (
            <div style={{ animation: 'helpFadeIn 0.3s ease both' }}>
              <div style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'rgba(246,247,251,0.35)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                marginBottom: 16,
              }}>
                {filteredArticles.length} result{filteredArticles.length !== 1 ? 's' : ''} for "{searchQuery}"
              </div>
              {filteredArticles.length === 0 ? (
                <div style={{
                  padding: '40px 24px',
                  textAlign: 'center',
                  color: 'rgba(246,247,251,0.35)',
                  fontSize: 14,
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 14,
                  background: 'rgba(13,16,23,0.75)',
                  backdropFilter: 'blur(8px)',
                }}>
                  No articles found. Try a different search term.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {filteredArticles.map((article, idx) => (
                    <div
                      key={idx}
                      style={{
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: 12,
                        background: 'rgba(13,16,23,0.80)',
                        backdropFilter: 'blur(8px)',
                        padding: '18px 20px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <span style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: 'rgba(246,247,251,0.3)',
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                        }}>
                          {article.sectionTitle}
                        </span>
                      </div>
                      <div style={{
                        fontSize: 14.5,
                        fontWeight: 600,
                        color: '#f6f7fb',
                        letterSpacing: '-0.01em',
                        marginBottom: 8,
                      }}>
                        {article.title}
                      </div>
                      <div style={{
                        fontSize: 13.5,
                        color: 'rgba(246,247,251,0.52)',
                        lineHeight: 1.6,
                        letterSpacing: '-0.005em',
                      }}>
                        {article.content}
                      </div>
                      {article.tags && article.tags.length > 0 && (
                        <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
                          {article.tags.map((tag) => (
                            <span key={tag} className="help-tag">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Main content layout */
            <div style={{
              display: 'grid',
              gridTemplateColumns: '220px 1fr',
              gap: 32,
              alignItems: 'start',
            }}>
              {/* Sidebar navigation */}
              <div style={{
                position: 'sticky',
                top: 80,
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 14,
                background: 'rgba(13,16,23,0.80)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                padding: '12px 8px',
              }}>
                <div style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: 'rgba(246,247,251,0.25)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  padding: '4px 12px 8px',
                }}>
                  Documentation
                </div>
                {docSections.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    className={`help-nav-item${activeSection === section.id ? ' active' : ''}`}
                    onClick={() => setActiveSection(section.id)}
                  >
                    {section.icon}
                    {section.title}
                  </button>
                ))}
                <div style={{
                  marginTop: 12,
                  paddingTop: 12,
                  borderTop: '1px solid rgba(255,255,255,0.05)',
                }}>
                  <div style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: 'rgba(246,247,251,0.25)',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    padding: '4px 12px 8px',
                  }}>
                    Support
                  </div>
                  <button
                    type="button"
                    className={`help-nav-item${activeSection === 'faq' ? ' active' : ''}`}
                    onClick={() => setActiveSection('faq')}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    FAQ
                  </button>
                  <button
                    type="button"
                    className={`help-nav-item${activeSection === 'contact' ? ' active' : ''}`}
                    onClick={() => setActiveSection('contact')}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    Contact Support
                  </button>
                </div>
              </div>

              {/* Content area */}
              <div style={{ animation: 'helpFadeIn 0.35s cubic-bezier(0.23,1,0.32,1) both' }}>
                {activeSection === 'faq' ? (
                  <div>
                    <h2 style={{
                      fontSize: 22,
                      fontWeight: 700,
                      letterSpacing: '-0.025em',
                      color: '#f6f7fb',
                      marginBottom: 6,
                    }}>
                      Frequently Asked Questions
                    </h2>
                    <p style={{
                      fontSize: 14,
                      color: 'rgba(246,247,251,0.45)',
                      letterSpacing: '-0.005em',
                      lineHeight: 1.55,
                      marginBottom: 28,
                    }}>
                      Quick answers to the most common questions about Earth AI.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {faqItems.map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            border: '1px solid rgba(255,255,255,0.07)',
                            borderRadius: 12,
                            background: 'rgba(13,16,23,0.80)',
                            backdropFilter: 'blur(8px)',
                            overflow: 'hidden',
                            transition: 'border-color 0.15s',
                          }}
                        >
                          <button
                            type="button"
                            className="help-faq-btn"
                            onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                            style={{ padding: '16px 20px' }}
                          >
                            <span style={{
                              fontSize: 14.5,
                              fontWeight: 600,
                              color: '#f6f7fb',
                              letterSpacing: '-0.01em',
                              lineHeight: 1.4,
                            }}>
                              {item.question}
                            </span>
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              style={{
                                color: 'rgba(246,247,251,0.35)',
                                flexShrink: 0,
                                marginTop: 2,
                                transform: expandedFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s',
                              }}
                            >
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </button>
                          {expandedFaq === idx && (
                            <div style={{
                              padding: '0 20px 18px',
                              fontSize: 13.5,
                              color: 'rgba(246,247,251,0.55)',
                              lineHeight: 1.65,
                              letterSpacing: '-0.005em',
                              borderTop: '1px solid rgba(255,255,255,0.05)',
                              paddingTop: 14,
                            }}>
                              {item.answer}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : activeSection === 'contact' ? (
                  <div>
                    <h2 style={{
                      fontSize: 22,
                      fontWeight: 700,
                      letterSpacing: '-0.025em',
                      color: '#f6f7fb',
                      marginBottom: 6,
                    }}>
                      Contact Support
                    </h2>
                    <p style={{
                      fontSize: 14,
                      color: 'rgba(246,247,251,0.45)',
                      letterSpacing: '-0.005em',
                      lineHeight: 1.55,
                      marginBottom: 32,
                    }}>
                      Our team is here to help. Reach out through any of the channels below.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
                      {[
                        {
                          icon: (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                              <polyline points="22,6 12,13 2,6" />
                            </svg>
                          ),
                          label: 'Email Support',
                          value: 'support@earthai.com',
                          description: 'Response within 24 hours',
                        },
                        {
                          icon: (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                          ),
                          label: 'Live Chat',
                          value: 'Available in-app',
                          description: 'Mon-Fri, 9am-6pm UTC',
                        },
                        {
                          icon: (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                              <circle cx="9" cy="7" r="4" />
                              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                          ),
                          label: 'Community Forum',
                          value: 'community.earthai.com',
                          description: 'Connect with other farmers',
                        },
                      ].map((channel, idx) => (
                        <div
                          key={idx}
                          style={{
                            border: '1px solid rgba(255,255,255,0.07)',
                            borderRadius: 14,
                            background: 'rgba(13,16,23,0.80)',
                            backdropFilter: 'blur(8px)',
                            padding: '20px',
                          }}
                        >
                          <div style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            background: 'rgba(34,197,94,0.08)',
                            border: '1px solid rgba(34,197,94,0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#4ade80',
                            marginBottom: 14,
                          }}>
                            {channel.icon}
                          </div>
                          <div style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: '#f6f7fb',
                            letterSpacing: '-0.01em',
                            marginBottom: 4,
                          }}>
                            {channel.label}
                          </div>
                          <div style={{
                            fontSize: 13.5,
                            color: 'rgba(74,222,128,0.8)',
                            fontWeight: 500,
                            letterSpacing: '-0.005em',
                            marginBottom: 4,
                          }}>
                            {channel.value}
                          </div>
                          <div style={{
                            fontSize: 12,
                            color: 'rgba(246,247,251,0.35)',
                            letterSpacing: '-0.005em',
                          }}>
                            {channel.description}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Status indicator */}
                    <div style={{
                      marginTop: 28,
                      padding: '16px 20px',
                      borderRadius: 12,
                      border: '1px solid rgba(34,197,94,0.15)',
                      background: 'rgba(34,197,94,0.05)',
                      backdropFilter: 'blur(8px)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                    }}>
                      <div style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: '#4ade80',
                        flexShrink: 0,
                        boxShadow: '0 0 8px rgba(74,222,128,0.6)',
                      }} />
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 600, color: '#4ade80', letterSpacing: '-0.01em' }}>
                          All systems operational
                        </div>
                        <div style={{ fontSize: 12, color: 'rgba(246,247,251,0.4)', marginTop: 2, letterSpacing: '-0.005em' }}>
                          Earth AI platform is running normally. No incidents reported.
                        </div>
                      </div>
                    </div>
                  </div>
                ) : currentSection ? (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: 9,
                        background: 'rgba(34,197,94,0.08)',
                        border: '1px solid rgba(34,197,94,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#4ade80',
                        flexShrink: 0,
                      }}>
                        {currentSection.icon}
                      </div>
                      <h2 style={{
                        fontSize: 22,
                        fontWeight: 700,
                        letterSpacing: '-0.025em',
                        color: '#f6f7fb',
                      }}>
                        {currentSection.title}
                      </h2>
                    </div>
                    <p style={{
                      fontSize: 14,
                      color: 'rgba(246,247,251,0.45)',
                      letterSpacing: '-0.005em',
                      lineHeight: 1.55,
                      marginBottom: 28,
                    }}>
                      {currentSection.articles.length} article{currentSection.articles.length !== 1 ? 's' : ''} in this section
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {currentSection.articles.map((article, idx) => (
                        <div
                          key={idx}
                          style={{
                            border: '1px solid rgba(255,255,255,0.07)',
                            borderRadius: 12,
                            background: 'rgba(13,16,23,0.80)',
                            backdropFilter: 'blur(8px)',
                            overflow: 'hidden',
                          }}
                        >
                          <button
                            type="button"
                            className="help-article-btn"
                            onClick={() => setExpandedArticle(expandedArticle === `${activeSection}-${idx}` ? null : `${activeSection}-${idx}`)}
                          >
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: 16,
                              padding: '16px 20px',
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <div style={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: 7,
                                  background: 'rgba(255,255,255,0.04)',
                                  border: '1px solid rgba(255,255,255,0.07)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                  color: 'rgba(246,247,251,0.4)',
                                  fontSize: 11,
                                  fontWeight: 700,
                                }}>
                                  {idx + 1}
                                </div>
                                <span style={{
                                  fontSize: 14.5,
                                  fontWeight: 600,
                                  color: '#f6f7fb',
                                  letterSpacing: '-0.01em',
                                  textAlign: 'left',
                                }}>
                                  {article.title}
                                </span>
                              </div>
                              <svg
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={{
                                  color: 'rgba(246,247,251,0.3)',
                                  flexShrink: 0,
                                  transform: expandedArticle === `${activeSection}-${idx}` ? 'rotate(180deg)' : 'rotate(0deg)',
                                  transition: 'transform 0.2s',
                                }}
                              >
                                <polyline points="6 9 12 15 18 9" />
                              </svg>
                            </div>
                          </button>

                          {expandedArticle === `${activeSection}-${idx}` && (
                            <div style={{
                              padding: '0 20px 20px',
                              borderTop: '1px solid rgba(255,255,255,0.05)',
                            }}>
                              <p style={{
                                fontSize: 13.5,
                                color: 'rgba(246,247,251,0.58)',
                                lineHeight: 1.7,
                                letterSpacing: '-0.005em',
                                paddingTop: 16,
                              }}>
                                {article.content}
                              </p>
                              {article.tags && article.tags.length > 0 && (
                                <div style={{ display: 'flex', gap: 6, marginTop: 14, flexWrap: 'wrap' }}>
                                  {article.tags.map((tag) => (
                                    <span key={tag} className="help-tag">{tag}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
