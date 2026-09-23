'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const sections = [
    {
      label: 'Profile',
      description: 'Update your name, country, organization, and language preferences',
      href: '/app/agriculture/profile',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
        </svg>
      ),
      color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0',
    },
    {
      label: 'Timezone',
      description: 'Set your timezone for accurate date and time display throughout the platform',
      href: '/app/agriculture/profile',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
      color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe',
    },
    {
      label: 'Language',
      description: 'Choose between English and Swahili for the application interface',
      href: '/app/agriculture/profile',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 8l6 6"/><path d="M4 14l6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="M22 22l-5-10-5 10"/><path d="M14 18h6"/>
        </svg>
      ),
      color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe',
    },
  ];

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: '#0f172a', fontSize: 20, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 4 }}>Settings</h1>
        <p style={{ color: '#64748b', fontSize: 13 }}>Manage your account settings and preferences</p>
      </div>

      {/* Settings sections */}
      <div style={{ background: '#fff', border: '1px solid #e8edf2', borderRadius: 14, overflow: 'hidden', marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ padding: '13px 20px', borderBottom: '1px solid #f1f5f9', color: '#64748b', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
          Account Settings
        </div>
        {sections?.map((section, i) => (
          <Link
            key={section?.label}
            href={section?.href}
            style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '15px 20px',
              borderBottom: i < sections?.length - 1 ? '1px solid #f1f5f9' : 'none',
              textDecoration: 'none', transition: 'background 0.12s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <div style={{
              width: 36, height: 36, borderRadius: 9, flexShrink: 0,
              background: section?.bg, border: `1px solid ${section?.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: section?.color,
            }}>
              {section?.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: '#0f172a', fontSize: 13.5, fontWeight: 600, letterSpacing: '-0.01em', marginBottom: 2 }}>{section?.label}</div>
              <div style={{ color: '#64748b', fontSize: 12.5, lineHeight: 1.4 }}>{section?.description}</div>
            </div>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </Link>
        ))}
      </div>

      {/* Platform info */}
      <div style={{ background: '#fff', border: '1px solid #e8edf2', borderRadius: 14, padding: '18px 20px', marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ color: '#64748b', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 16 }}>
          Platform
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: 'Product', value: 'Intelligence E Agriculture' },
            { label: 'Platform', value: 'Earth AI' },
            { label: 'AI Architecture', value: 'Multi-provider (Intelligence E Router)' },
          ]?.map((item) => (
            <div key={item?.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#64748b', fontSize: 13 }}>{item?.label}</span>
              <span style={{ color: '#374151', fontSize: 13, fontWeight: 600 }}>{item?.value}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#64748b', fontSize: 13 }}>Finance Intelligence</span>
            <span style={{
              padding: '2px 9px', borderRadius: 999, fontSize: 10.5, fontWeight: 700,
              background: '#f8fafc', border: '1px solid #e2e8f0', color: '#94a3b8',
            }}>Coming Soon</span>
          </div>
        </div>
      </div>

      {/* Sign out */}
      <div style={{ background: '#fff', border: '1px solid #e8edf2', borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ color: '#64748b', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 16 }}>
          Session
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: '#0f172a', fontSize: 13.5, fontWeight: 600, marginBottom: 2 }}>Sign out</div>
            <div style={{ color: '#64748b', fontSize: 12.5 }}>End your current session</div>
          </div>
          <button
            onClick={() => signOut()}
            style={{
              padding: '8px 18px', borderRadius: 8, border: '1px solid #fecaca',
              background: '#fef2f2', color: '#dc2626', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 7,
              transition: 'all 0.12s',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
