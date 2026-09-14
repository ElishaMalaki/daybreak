'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const supabase = createClient();
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
    },
  ];

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 4 }}>Settings</h1>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>Manage your account settings and preferences</p>
      </div>

      {/* Settings sections */}
      <div style={{ background: '#0D1017', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase' }}>
          Account Settings
        </div>
        {sections?.map((section, i) => (
          <Link
            key={section?.label}
            href={section?.href}
            style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
              borderBottom: i < sections?.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              textDecoration: 'none', transition: 'background 0.12s',
            }}
          >
            <div style={{
              width: 34, height: 34, borderRadius: 9, flexShrink: 0,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,255,255,0.4)',
            }}>
              {section?.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em', marginBottom: 2 }}>{section?.label}</div>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, lineHeight: 1.4 }}>{section?.description}</div>
            </div>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </Link>
        ))}
      </div>

      {/* Platform info */}
      <div style={{ background: '#0D1017', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '16px 18px', marginBottom: 16 }}>
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 14 }}>
          Platform
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>Product</span>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600 }}>Intelligence E Agriculture</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>Platform</span>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600 }}>Earth AI</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>AI Architecture</span>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600 }}>Multi-provider (Intelligence E Router)</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>Finance Intelligence</span>
            <span style={{
              padding: '2px 8px', borderRadius: 999, fontSize: 10.5, fontWeight: 700,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.35)',
            }}>Coming Soon</span>
          </div>
        </div>
      </div>

      {/* Sign out */}
      <div style={{ background: '#0D1017', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '16px 18px' }}>
        <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 14 }}>
          Session
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600, marginBottom: 2 }}>Sign out</div>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>End your current session</div>
          </div>
          <button
            onClick={() => signOut()}
            style={{
              padding: '7px 16px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.10)',
              background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: 12.5, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6,
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
