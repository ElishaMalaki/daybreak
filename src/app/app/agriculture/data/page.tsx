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
  background: '#f8fafc', border: '1px solid #e2e8f0',
  color: '#1e293b', fontSize: 13, fontFamily: 'inherit', outline: 'none',
  transition: 'border-color 0.15s',
};

const labelStyle: React.CSSProperties = {
  display: 'block', color: '#64748b', fontSize: 11, fontWeight: 600,
  letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 5,
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
          <h1 style={{ color: '#0f172a', fontSize: 20, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 4 }}>Farm Data</h1>
          <p style={{ color: '#64748b', fontSize: 13 }}>Manage farms, crops, and livestock records</p>
        </div>
        <button
          onClick={() => setShowFarmForm(true)}
          style={{
            padding: '9px 18px', borderRadius: 9, border: '1px solid #bbf7d0',
            background: '#f0fdf4', color: '#16a34a', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 7,
            transition: 'all 0.12s',
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
          background: '#fff', border: '1px solid #e8edf2',
          borderRadius: 14, padding: '22px 24px', marginBottom: 20,
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h3 style={{ color: '#0f172a', fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em' }}>Register New Farm</h3>
            <button onClick={() => { setShowFarmForm(false); setFormError(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 20, lineHeight: 1, padding: 4 }}>×</button>
          </div>
          <form onSubmit={handleAddFarm}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
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
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Primary Activity</label>
              <input type="text" value={farmForm.primaryActivity} onChange={(e) => setFarmForm({ ...farmForm, primaryActivity: e.target.value })} placeholder="e.g. Mixed farming, Dairy, Crop production" style={inputStyle} />
            </div>
            {formError && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '9px 12px', color: '#dc2626', fontSize: 12.5, marginBottom: 14 }}>
                {formError}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" disabled={savingFarm} style={{
                padding: '9px 20px', borderRadius: 8, border: 'none',
                background: savingFarm ? '#bbf7d0' : '#16a34a',
                color: '#fff', fontSize: 13, fontWeight: 600, cursor: savingFarm ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                boxShadow: savingFarm ? 'none' : '0 2px 8px rgba(22,163,74,0.25)',
              }}>
                {savingFarm ? 'Saving...' : 'Save Farm'}
              </button>
              <button type="button" onClick={() => { setShowFarmForm(false); setFormError(''); }} style={{
                padding: '9px 20px', borderRadius: 8, border: '1px solid #e2e8f0',
                background: '#f8fafc', color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 16, background: '#f1f5f9', borderRadius: 10, padding: 3, width: 'fit-content' }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '7px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: activeTab === tab.key ? '#fff' : 'transparent',
              color: activeTab === tab.key ? '#0f172a' : '#64748b',
              fontSize: 13, fontWeight: activeTab === tab.key ? 600 : 500,
              fontFamily: 'inherit', transition: 'all 0.12s',
              boxShadow: activeTab === tab.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            {tab.label} <span style={{ opacity: 0.6, fontSize: 11.5 }}>({tab.count})</span>
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
              background: '#f8fafc', border: '1px solid #e2e8f0',
              borderRadius: 8, color: '#374151', fontSize: 13, padding: '8px 12px',
              fontFamily: 'inherit', cursor: 'pointer', outline: 'none',
            }}
          >
            <option value="">All Farms</option>
            {farms.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div style={{ background: '#fff', border: '1px solid #e8edf2', borderRadius: 14, padding: '40px 24px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
          Loading farm data...
        </div>
      ) : (
        <>
          {/* Farms tab */}
          {activeTab === 'farms' && (
            <div>
              {farms.length === 0 ? (
                <div style={{
                  background: '#fff', border: '1.5px dashed #e2e8f0', borderRadius: 14,
                  padding: '48px 24px', textAlign: 'center',
                }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <ellipse cx="12" cy="5" rx="9" ry="3"/>
                      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
                    </svg>
                  </div>
                  <div style={{ color: '#374151', fontSize: 15, fontWeight: 700, marginBottom: 6 }}>No farms registered</div>
                  <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 20, lineHeight: 1.5 }}>
                    Register your first farm to start tracking agricultural data.
                  </div>
                  <button
                    onClick={() => setShowFarmForm(true)}
                    style={{
                      padding: '9px 20px', borderRadius: 9, border: 'none',
                      background: '#16a34a', color: '#fff', fontSize: 13, fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'inherit',
                      boxShadow: '0 2px 8px rgba(22,163,74,0.25)',
                    }}
                  >
                    Register First Farm
                  </button>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                  {farms.map((farm) => (
                    <div key={farm.id} style={{
                      background: '#fff', border: '1px solid #e8edf2', borderRadius: 12,
                      padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 9, background: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <ellipse cx="12" cy="5" rx="9" ry="3"/>
                              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
                              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
                            </svg>
                          </div>
                          <div>
                            <div style={{ color: '#0f172a', fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>{farm.name}</div>
                            <div style={{ color: '#64748b', fontSize: 12 }}>{farm.country}{farm.region ? `, ${farm.region}` : ''}</div>
                          </div>
                        </div>
                        <span style={{
                          padding: '2px 8px', borderRadius: 999, fontSize: 10.5, fontWeight: 600,
                          background: farm.isActive ? '#f0fdf4' : '#f8fafc',
                          border: `1px solid ${farm.isActive ? '#bbf7d0' : '#e2e8f0'}`,
                          color: farm.isActive ? '#16a34a' : '#94a3b8',
                        }}>
                          {farm.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 16 }}>
                        {farm.totalAreaHectares && (
                          <div>
                            <div style={{ color: '#94a3b8', fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Area</div>
                            <div style={{ color: '#374151', fontSize: 13, fontWeight: 600 }}>{farm.totalAreaHectares} ha</div>
                          </div>
                        )}
                        {farm.primaryActivity && (
                          <div>
                            <div style={{ color: '#94a3b8', fontSize: 10.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>Activity</div>
                            <div style={{ color: '#374151', fontSize: 13, fontWeight: 600 }}>{farm.primaryActivity}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Crops tab */}
          {activeTab === 'crops' && (
            <div>
              {filteredCrops.length === 0 ? (
                <div style={{
                  background: '#fff', border: '1.5px dashed #e2e8f0', borderRadius: 14,
                  padding: '48px 24px', textAlign: 'center',
                }}>
                  <div style={{ color: '#374151', fontSize: 15, fontWeight: 700, marginBottom: 6 }}>No crop records</div>
                  <div style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.5 }}>
                    {farms.length === 0 ? 'Register a farm first, then add crop records.' : 'No crops have been recorded for the selected farm.'}
                  </div>
                </div>
              ) : (
                <div style={{ background: '#fff', border: '1px solid #e8edf2', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e8edf2' }}>
                        {['Crop', 'Variety', 'Field', 'Area (ha)', 'Planting Date', 'Status'].map((h) => (
                          <th key={h} style={{ padding: '11px 16px', textAlign: 'left', color: '#64748b', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCrops.map((crop, i) => (
                        <tr key={crop.id} style={{ borderBottom: i < filteredCrops.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                          <td style={{ padding: '12px 16px', color: '#0f172a', fontSize: 13, fontWeight: 600 }}>{crop.cropName}</td>
                          <td style={{ padding: '12px 16px', color: '#64748b', fontSize: 13 }}>{crop.variety || '—'}</td>
                          <td style={{ padding: '12px 16px', color: '#64748b', fontSize: 13 }}>{crop.fieldName || '—'}</td>
                          <td style={{ padding: '12px 16px', color: '#64748b', fontSize: 13 }}>{crop.areaHectares ?? '—'}</td>
                          <td style={{ padding: '12px 16px', color: '#64748b', fontSize: 13 }}>{crop.plantingDate || '—'}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{
                              padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                              background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a',
                            }}>{crop.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Livestock tab */}
          {activeTab === 'livestock' && (
            <div>
              {filteredLivestock.length === 0 ? (
                <div style={{
                  background: '#fff', border: '1.5px dashed #e2e8f0', borderRadius: 14,
                  padding: '48px 24px', textAlign: 'center',
                }}>
                  <div style={{ color: '#374151', fontSize: 15, fontWeight: 700, marginBottom: 6 }}>No livestock records</div>
                  <div style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.5 }}>
                    {farms.length === 0 ? 'Register a farm first, then add livestock records.' : 'No livestock have been recorded for the selected farm.'}
                  </div>
                </div>
              ) : (
                <div style={{ background: '#fff', border: '1px solid #e8edf2', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e8edf2' }}>
                        {['Animal Type', 'Breed', 'Count', 'Status'].map((h) => (
                          <th key={h} style={{ padding: '11px 16px', textAlign: 'left', color: '#64748b', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLivestock.map((animal, i) => (
                        <tr key={animal.id} style={{ borderBottom: i < filteredLivestock.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                          <td style={{ padding: '12px 16px', color: '#0f172a', fontSize: 13, fontWeight: 600 }}>{animal.animalType}</td>
                          <td style={{ padding: '12px 16px', color: '#64748b', fontSize: 13 }}>{animal.breed || '—'}</td>
                          <td style={{ padding: '12px 16px', color: '#374151', fontSize: 13, fontWeight: 600 }}>{animal.count}</td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{
                              padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600,
                              background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a',
                            }}>{animal.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
