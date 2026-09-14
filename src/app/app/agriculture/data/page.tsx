'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

interface Farm {
  id: string;
  name: string;
  country: string;
  region: string | null;
  totalAreaHectares: number | null;
  primaryActivity: string | null;
  isActive: boolean;
  createdAt: string;
}

interface Crop {
  id: string;
  farmId: string;
  cropName: string;
  variety: string | null;
  fieldName: string | null;
  areaHectares: number | null;
  plantingDate: string | null;
  status: string;
}

interface Livestock {
  id: string;
  farmId: string;
  animalType: string;
  breed: string | null;
  count: number;
  status: string;
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', borderRadius: 8,
  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)',
  color: '#fff', fontSize: 13, fontFamily: 'inherit', outline: 'none',
};

const labelStyle: React.CSSProperties = {
  display: 'block', color: 'rgba(255,255,255,0.4)', fontSize: 10.5, fontWeight: 600,
  letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 5,
};

export default function FarmDataPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [farms, setFarms] = useState<Farm[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [livestock, setLivestock] = useState<Livestock[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'farms' | 'crops' | 'livestock'>('farms');
  const [showFarmForm, setShowFarmForm] = useState(false);
  const [farmForm, setFarmForm] = useState({ name: '', country: '', region: '', totalAreaHectares: '', primaryActivity: '' });
  const [savingFarm, setSavingFarm] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: farmData } = await supabase
        .from('farms')
        .select('id, name, country, region, total_area_hectares, primary_activity, is_active, created_at')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      const mappedFarms: Farm[] = (farmData || []).map((f) => ({
        id: f.id, name: f.name, country: f.country, region: f.region,
        totalAreaHectares: f.total_area_hectares, primaryActivity: f.primary_activity,
        isActive: f.is_active, createdAt: f.created_at,
      }));
      setFarms(mappedFarms);

      if (mappedFarms.length > 0) {
        const farmIds = mappedFarms.map((f) => f.id);
        const [cropData, livestockData] = await Promise.all([
          supabase.from('crops').select('id, farm_id, crop_name, variety, field_name, area_hectares, planting_date, status').in('farm_id', farmIds).eq('user_id', user.id),
          supabase.from('livestock').select('id, farm_id, animal_type, breed, count, status').in('farm_id', farmIds).eq('user_id', user.id),
        ]);
        setCrops((cropData.data || []).map((c) => ({
          id: c.id, farmId: c.farm_id, cropName: c.crop_name, variety: c.variety,
          fieldName: c.field_name, areaHectares: c.area_hectares, plantingDate: c.planting_date, status: c.status,
        })));
        setLivestock((livestockData.data || []).map((l) => ({
          id: l.id, farmId: l.farm_id, animalType: l.animal_type, breed: l.breed, count: l.count, status: l.status,
        })));
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleAddFarm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !farmForm.name.trim() || !farmForm.country.trim()) return;
    setSavingFarm(true);
    setFormError('');
    try {
      const { error } = await supabase.from('farms').insert({
        owner_id: user.id,
        name: farmForm.name.trim(),
        country: farmForm.country.trim(),
        region: farmForm.region.trim() || null,
        total_area_hectares: farmForm.totalAreaHectares ? parseFloat(farmForm.totalAreaHectares) : null,
        primary_activity: farmForm.primaryActivity.trim() || null,
      });
      if (error) { setFormError(error.message); return; }
      setFarmForm({ name: '', country: '', region: '', totalAreaHectares: '', primaryActivity: '' });
      setShowFarmForm(false);
      loadData();
    } catch (err: any) {
      setFormError(err?.message || 'Failed to add farm');
    } finally {
      setSavingFarm(false);
    }
  };

  const filteredCrops = selectedFarm ? crops.filter((c) => c.farmId === selectedFarm) : crops;
  const filteredLivestock = selectedFarm ? livestock.filter((l) => l.farmId === selectedFarm) : livestock;

  const tabs = [
    { key: 'farms', label: 'Farms', count: farms.length },
    { key: 'crops', label: 'Crops', count: filteredCrops.length },
    { key: 'livestock', label: 'Livestock', count: filteredLivestock.length },
  ] as const;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 4 }}>Farm Data Intelligence</h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>Manage farms, crops, and livestock records</p>
        </div>
        <button
          onClick={() => setShowFarmForm(true)}
          style={{
            padding: '8px 16px', borderRadius: 8, border: '1px solid rgba(34,197,94,0.2)',
            background: 'rgba(34,197,94,0.08)', color: '#4ade80', fontSize: 12.5, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Farm
        </button>
      </div>

      {/* Add Farm Form */}
      {showFarmForm && (
        <div style={{
          background: '#0D1017', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 12, padding: '20px 22px', marginBottom: 20,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ color: '#fff', fontSize: 14, fontWeight: 700, letterSpacing: '-0.02em' }}>Register New Farm</h3>
            <button onClick={() => { setShowFarmForm(false); setFormError(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', fontSize: 18, lineHeight: 1, padding: 4 }}>×</button>
          </div>
          <form onSubmit={handleAddFarm}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>Farm Name *</label>
                <input type="text" value={farmForm.name} onChange={(e) => setFarmForm({ ...farmForm, name: e.target.value })} placeholder="e.g. Pelit Farm" required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Country *</label>
                <input type="text" value={farmForm.country} onChange={(e) => setFarmForm({ ...farmForm, country: e.target.value })} placeholder="e.g. Tanzania" required style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Region / State</label>
                <input type="text" value={farmForm.region} onChange={(e) => setFarmForm({ ...farmForm, region: e.target.value })} placeholder="e.g. Arusha" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Total Area (hectares)</label>
                <input type="number" value={farmForm.totalAreaHectares} onChange={(e) => setFarmForm({ ...farmForm, totalAreaHectares: e.target.value })} placeholder="e.g. 50" min="0" step="0.01" style={inputStyle} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Primary Activity</label>
              <input type="text" value={farmForm.primaryActivity} onChange={(e) => setFarmForm({ ...farmForm, primaryActivity: e.target.value })} placeholder="e.g. Mixed farming, Dairy, Crop production" style={inputStyle} />
            </div>
            {formError && (
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', borderRadius: 8, padding: '8px 12px', color: '#fca5a5', fontSize: 12.5, marginBottom: 12 }}>
                {formError}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" disabled={savingFarm} style={{
                padding: '8px 18px', borderRadius: 8, border: 'none',
                background: savingFarm ? 'rgba(34,197,94,0.4)' : '#22c55e',
                color: '#fff', fontSize: 13, fontWeight: 600, cursor: savingFarm ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
              }}>
                {savingFarm ? 'Saving...' : 'Save Farm'}
              </button>
              <button type="button" onClick={() => { setShowFarmForm(false); setFormError(''); }} style={{
                padding: '8px 18px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.10)',
                background: 'transparent', color: 'rgba(255,255,255,0.45)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 16, background: 'rgba(255,255,255,0.04)', borderRadius: 9, padding: 3, width: 'fit-content' }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '6px 14px', borderRadius: 7, border: 'none', cursor: 'pointer',
              background: activeTab === tab.key ? 'rgba(255,255,255,0.09)' : 'transparent',
              color: activeTab === tab.key ? '#fff' : 'rgba(255,255,255,0.35)',
              fontSize: 12.5, fontWeight: 600, fontFamily: 'inherit', transition: 'all 0.12s',
            }}
          >
            {tab.label} <span style={{ opacity: 0.6, fontSize: 11 }}>({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Farm filter for crops/livestock */}
      {farms.length > 0 && activeTab !== 'farms' && (
        <div style={{ marginBottom: 14 }}>
          <select
            value={selectedFarm || ''}
            onChange={(e) => setSelectedFarm(e.target.value || null)}
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: 8, color: 'rgba(255,255,255,0.6)', fontSize: 12.5, padding: '7px 12px',
              fontFamily: 'inherit', cursor: 'pointer', outline: 'none',
            }}
          >
            <option value="" style={{ background: '#0D1017' }}>All farms</option>
            {farms.map((f) => (
              <option key={f.id} value={f.id} style={{ background: '#0D1017' }}>{f.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div style={{ padding: '32px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>Loading farm data...</div>
      ) : (
        <>
          {/* Farms tab */}
          {activeTab === 'farms' && (
            farms.length === 0 ? (
              <div style={{
                background: '#0D1017', border: '1px dashed rgba(255,255,255,0.08)',
                borderRadius: 12, padding: '48px 24px', textAlign: 'center',
              }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <ellipse cx="12" cy="5" rx="9" ry="3"/>
                    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
                  </svg>
                </div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>No farms registered yet</div>
                <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12.5, marginBottom: 20, lineHeight: 1.6, maxWidth: 320, margin: '0 auto 20px' }}>
                  Add your first farm to begin building your agricultural intelligence profile.
                </div>
                <button
                  onClick={() => setShowFarmForm(true)}
                  style={{
                    padding: '8px 18px', borderRadius: 8, border: '1px solid rgba(34,197,94,0.2)',
                    background: 'rgba(34,197,94,0.08)', color: '#4ade80', fontSize: 12.5, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  Register First Farm
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                {farms.map((farm) => (
                  <div key={farm.id} style={{
                    background: '#0D1017', border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 12, padding: '16px 18px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div>
                        <div style={{ color: '#fff', fontSize: 14, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 2 }}>{farm.name}</div>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{farm.country}{farm.region ? `, ${farm.region}` : ''}</div>
                      </div>
                      <div style={{
                        padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase',
                        background: farm.isActive ? 'rgba(34,197,94,0.10)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${farm.isActive ? 'rgba(34,197,94,0.20)' : 'rgba(255,255,255,0.08)'}`,
                        color: farm.isActive ? '#4ade80' : 'rgba(255,255,255,0.3)',
                      }}>
                        {farm.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 16 }}>
                      {farm.totalAreaHectares && (
                        <div>
                          <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 2 }}>Area</div>
                          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600 }}>{farm.totalAreaHectares} ha</div>
                        </div>
                      )}
                      {farm.primaryActivity && (
                        <div>
                          <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 2 }}>Activity</div>
                          <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600 }}>{farm.primaryActivity}</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Crops tab */}
          {activeTab === 'crops' && (
            filteredCrops.length === 0 ? (
              <div style={{
                background: '#0D1017', border: '1px dashed rgba(255,255,255,0.08)',
                borderRadius: 12, padding: '48px 24px', textAlign: 'center',
              }}>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>No crop records yet</div>
                <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12.5, lineHeight: 1.6 }}>
                  {farms.length === 0 ? 'Register a farm first, then add crop records.' : 'Add crop records to track your agricultural production.'}
                </div>
              </div>
            ) : (
              <div style={{ background: '#0D1017', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                      {['Crop', 'Variety', 'Field', 'Area (ha)', 'Planting Date', 'Status'].map((h) => (
                        <th key={h} style={{ padding: '11px 16px', textAlign: 'left', color: 'rgba(255,255,255,0.3)', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCrops.map((crop, i) => (
                      <tr key={crop.id} style={{ borderBottom: i < filteredCrops.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                        <td style={{ padding: '11px 16px', color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 600 }}>{crop.cropName}</td>
                        <td style={{ padding: '11px 16px', color: 'rgba(255,255,255,0.45)', fontSize: 12.5 }}>{crop.variety || '—'}</td>
                        <td style={{ padding: '11px 16px', color: 'rgba(255,255,255,0.45)', fontSize: 12.5 }}>{crop.fieldName || '—'}</td>
                        <td style={{ padding: '11px 16px', color: 'rgba(255,255,255,0.45)', fontSize: 12.5 }}>{crop.areaHectares || '—'}</td>
                        <td style={{ padding: '11px 16px', color: 'rgba(255,255,255,0.45)', fontSize: 12.5 }}>{crop.plantingDate || '—'}</td>
                        <td style={{ padding: '11px 16px' }}>
                          <span style={{
                            padding: '2px 8px', borderRadius: 999, fontSize: 10.5, fontWeight: 600,
                            background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.18)', color: '#4ade80',
                          }}>{crop.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}

          {/* Livestock tab */}
          {activeTab === 'livestock' && (
            filteredLivestock.length === 0 ? (
              <div style={{
                background: '#0D1017', border: '1px dashed rgba(255,255,255,0.08)',
                borderRadius: 12, padding: '48px 24px', textAlign: 'center',
              }}>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>No livestock records yet</div>
                <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12.5, lineHeight: 1.6 }}>
                  {farms.length === 0 ? 'Register a farm first, then add livestock records.' : 'Add livestock records to track your animals.'}
                </div>
              </div>
            ) : (
              <div style={{ background: '#0D1017', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                      {['Animal Type', 'Breed', 'Count', 'Status'].map((h) => (
                        <th key={h} style={{ padding: '11px 16px', textAlign: 'left', color: 'rgba(255,255,255,0.3)', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLivestock.map((animal, i) => (
                      <tr key={animal.id} style={{ borderBottom: i < filteredLivestock.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                        <td style={{ padding: '11px 16px', color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 600 }}>{animal.animalType}</td>
                        <td style={{ padding: '11px 16px', color: 'rgba(255,255,255,0.45)', fontSize: 12.5 }}>{animal.breed || '—'}</td>
                        <td style={{ padding: '11px 16px', color: 'rgba(255,255,255,0.45)', fontSize: 12.5 }}>{animal.count.toLocaleString()}</td>
                        <td style={{ padding: '11px 16px' }}>
                          <span style={{
                            padding: '2px 8px', borderRadius: 999, fontSize: 10.5, fontWeight: 600,
                            background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.18)', color: '#4ade80',
                          }}>{animal.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}
