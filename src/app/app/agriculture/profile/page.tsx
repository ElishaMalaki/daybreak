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
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)',
  color: '#fff', fontSize: 13, fontFamily: 'inherit', outline: 'none',
};

const labelStyle: React.CSSProperties = {
  display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: 10.5, fontWeight: 600,
  letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5,
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
    // Detect browser timezone
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
      // Profile may not exist yet — use auth data
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

      // Also update auth metadata for full_name
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
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 0', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>
        Loading profile...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 4 }}>Profile</h1>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>Manage your account information and preferences</p>
      </div>

      {/* Avatar + account info */}
      <div style={{
        background: '#0D1017', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 12, padding: '20px 22px', marginBottom: 16,
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14, flexShrink: 0,
          background: 'linear-gradient(135deg, #22c55e, #15803d)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: 700, fontSize: 20,
        }}>
          {userInitial}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#fff', fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 3 }}>
            {profile.full_name || 'No name set'}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>{profile.email}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10.5, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 3 }}>Member since</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12.5 }}>{formatDate(profile.created_at)}</div>
        </div>
      </div>

      {/* Profile form */}
      <div style={{
        background: '#0D1017', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 12, padding: '20px 22px',
      }}>
        <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 18 }}>
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
                style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }}
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
                {LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value} style={{ background: '#0D1017' }}>{l.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>
                Timezone
                {detectedTimezone && (
                  <span style={{ color: 'rgba(34,197,94,0.7)', fontWeight: 500, marginLeft: 6, textTransform: 'none', letterSpacing: 0 }}>
                    · detected: {detectedTimezone}
                  </span>
                )}
              </label>
              <select
                value={profile.timezone}
                onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                {/* Show detected timezone first if not in list */}
                {detectedTimezone && !TIMEZONES.includes(detectedTimezone) && (
                  <option value={detectedTimezone} style={{ background: '#0D1017' }}>{detectedTimezone} (detected)</option>
                )}
                {TIMEZONES.map((tz) => (
                  <option key={tz} value={tz} style={{ background: '#0D1017' }}>{tz}</option>
                ))}
              </select>
            </div>
          </div>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)',
              borderRadius: 8, padding: '8px 12px', color: '#fca5a5', fontSize: 12.5, marginBottom: 14,
            }}>
              {error}
            </div>
          )}

          {saveSuccess && (
            <div style={{
              background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.18)',
              borderRadius: 8, padding: '8px 12px', color: '#4ade80', fontSize: 12.5, marginBottom: 14,
              display: 'flex', alignItems: 'center', gap: 7,
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Profile saved successfully
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            style={{
              padding: '9px 22px', borderRadius: 8, border: 'none',
              background: saving ? 'rgba(34,197,94,0.4)' : '#22c55e',
              color: '#fff', fontSize: 13, fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 7,
            }}
          >
            {saving && <div style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />}
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>

      {/* Account info */}
      <div style={{
        background: '#0D1017', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 12, padding: '16px 22px', marginTop: 16,
      }}>
        <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 14 }}>
          Account
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>Plan</span>
            <span style={{
              padding: '2px 8px', borderRadius: 999, fontSize: 10.5, fontWeight: 700,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.10)',
              color: 'rgba(255,255,255,0.5)',
            }}>Free</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>Account ID</span>
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11.5, fontFamily: 'monospace' }}>{user?.id?.slice(0, 8)}...</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>Email verified</span>
            <span style={{ color: user?.email_confirmed_at ? '#4ade80' : '#fca5a5', fontSize: 12.5, fontWeight: 600 }}>
              {user?.email_confirmed_at ? 'Verified' : 'Not verified'}
            </span>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
