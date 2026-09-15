'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

interface ProfileData {
  full_name: string;
  email: string;
  country: string;
  preferred_language: string;
  timezone: string;
  organization: string;
  created_at: string;
}

const TIMEZONES = [
  'Africa/Nairobi', 'Africa/Dar_es_Salaam', 'Africa/Lagos', 'Africa/Cairo',
  'Africa/Johannesburg', 'Africa/Accra', 'Africa/Addis_Ababa',
  'Europe/London', 'Europe/Paris', 'Europe/Berlin', 'Europe/Moscow',
  'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Sao_Paulo', 'Asia/Dubai', 'Asia/Kolkata', 'Asia/Singapore',
  'Asia/Tokyo', 'Asia/Shanghai', 'Australia/Sydney', 'Pacific/Auckland',
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'sw', label: 'Swahili' },
];

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 8,
  background: '#f8fafc', border: '1px solid #e2e8f0',
  color: '#1e293b', fontSize: 13, fontFamily: 'inherit', outline: 'none',
  transition: 'border-color 0.15s',
};

const labelStyle: React.CSSProperties = {
  display: 'block', color: '#64748b', fontSize: 11, fontWeight: 600,
  letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 5,
};

export default function ProfilePage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [profile, setProfile] = useState<ProfileData>({
    full_name: '', email: '', country: '', preferred_language: 'en',
    timezone: '', organization: '', created_at: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');
  const [detectedTimezone, setDetectedTimezone] = useState('');

  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setDetectedTimezone(tz);
    } catch {
      // fallback
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('full_name, country, preferred_language, timezone, organization, created_at')
        .eq('id', user.id)
        .single();

      const tz = data?.timezone || detectedTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

      setProfile({
        full_name: data?.full_name || user?.user_metadata?.full_name || '',
        email: user?.email || '',
        country: data?.country || '',
        preferred_language: data?.preferred_language || 'en',
        timezone: tz,
        organization: data?.organization || '',
        created_at: data?.created_at || user?.created_at || '',
      });
    } catch {
      setProfile((prev) => ({
        ...prev,
        full_name: user?.user_metadata?.full_name || '',
        email: user?.email || '',
        timezone: detectedTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
        created_at: user?.created_at || '',
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError('');
    setSaveSuccess(false);

    try {
      const { error: upsertError } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          full_name: profile.full_name.trim(),
          country: profile.country.trim(),
          preferred_language: profile.preferred_language,
          timezone: profile.timezone,
          organization: profile.organization.trim(),
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      if (upsertError) {
        setError(upsertError.message);
        return;
      }

      if (profile.full_name.trim()) {
        await supabase.auth.updateUser({
          data: { full_name: profile.full_name.trim() },
        });
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const userInitial = profile.full_name?.[0] || profile.email?.[0]?.toUpperCase() || 'U';

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return '—';
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 0', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
        Loading profile...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: '#0f172a', fontSize: 20, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 4 }}>Profile</h1>
        <p style={{ color: '#64748b', fontSize: 13 }}>Manage your account information and preferences</p>
      </div>

      {/* Avatar + account info */}
      <div style={{
        background: '#fff', border: '1px solid #e8edf2',
        borderRadius: 14, padding: '22px 24px', marginBottom: 16,
        display: 'flex', alignItems: 'center', gap: 16,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14, flexShrink: 0,
          background: 'linear-gradient(135deg, #16a34a, #166534)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: 22,
          boxShadow: '0 2px 8px rgba(22,163,74,0.25)',
        }}>
          {userInitial}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#0f172a', fontSize: 16, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 3 }}>
            {profile.full_name || 'No name set'}
          </div>
          <div style={{ color: '#64748b', fontSize: 13 }}>{profile.email}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#94a3b8', fontSize: 10.5, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 3 }}>Member since</div>
          <div style={{ color: '#374151', fontSize: 13, fontWeight: 600 }}>{formatDate(profile.created_at)}</div>
        </div>
      </div>

      {/* Profile form */}
      <div style={{
        background: '#fff', border: '1px solid #e8edf2',
        borderRadius: 14, padding: '22px 24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}>
        <div style={{ color: '#64748b', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 20 }}>
          Profile Information
        </div>

        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input
                type="text"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                placeholder="Your full name"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={profile.email}
                disabled
                style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed', background: '#f1f5f9' }}
              />
            </div>
            <div>
              <label style={labelStyle}>Country</label>
              <input
                type="text"
                value={profile.country}
                onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                placeholder="e.g. Tanzania"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Organization</label>
              <input
                type="text"
                value={profile.organization}
                onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
                placeholder="e.g. Pelit Farm Ltd"
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
            <div>
              <label style={labelStyle}>Preferred Language</label>
              <select
                value={profile.preferred_language}
                onChange={(e) => setProfile({ ...profile, preferred_language: e.target.value })}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value}>{lang.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Timezone</label>
              <select
                value={profile.timezone}
                onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>
          </div>

          {saveSuccess && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '9px 12px', color: '#16a34a', fontSize: 12.5, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 7 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Profile saved successfully
            </div>
          )}

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '9px 12px', color: '#dc2626', fontSize: 12.5, marginBottom: 14 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '9px 22px', borderRadius: 8, border: 'none',
              background: saving ? '#bbf7d0' : '#16a34a',
              color: '#fff', fontSize: 13, fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
              boxShadow: saving ? 'none' : '0 2px 8px rgba(22,163,74,0.25)',
            }}
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
