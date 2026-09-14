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

export default function FarmDataPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [farms, setFarms] = useState<Farm[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [livestock, setLivestock] = useState<Livestock[]>([]);
  const [selectedFarm, setSelectedFarm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'farms' | 'crops' | 'livestock'>('farms');

  // Farm form
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
        id: f.id,
        name: f.name,
        country: f.country,
        region: f.region,
        totalAreaHectares: f.total_area_hectares,
        primaryActivity: f.primary_activity,
        isActive: f.is_active,
        createdAt: f.created_at,
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

      if (error) {
        setFormError(error.message);
        return;
      }

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

  const inputStyle = {
    width: '100%', padding: '9px 12px', borderRadius: 8,
    background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
    color: '#fff', fontSize: 13, fontFamily: 'inherit', outline: 'none',
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 4 }}>Farm Data Intelligence</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Manage your farms, crops, and livestock data</p>
        </div>
        <button
          onClick={() => setShowFarmForm(true)}
          style={{
            padding: '9px 18px', borderRadius: 9, border: '1px solid rgba(34,197,94,0.25)',
            background: 'rgba(34,197,94,0.10)', color: '#4ade80', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Farm
        </button>
      </div>

      {/* Add Farm Form */}
      {showFarmForm && (
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 14, padding: '20px 22px', marginBottom: 24,
        }}>
          <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Register New Farm</h3>
          <form onSubmit={handleAddFarm}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 5 }}>Farm Name *</label>
                <input type="text" value={farmForm.name} onChange={(e) => setFarmForm({ ...farmForm, name: e.target.value })} placeholder="e.g. Pelit Farm" required style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 5 }}>Country *</label>
                <input type="text" value={farmForm.country} onChange={(e) => setFarmForm({ ...farmForm, country: e.target.value })} placeholder="e.g. Tanzania" required style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 5 }}>Region / State</label>
                <input type="text" value={farmForm.region} onChange={(e) => setFarmForm({ ...farmForm, region: e.target.value })} placeholder="e.g. Arusha" style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 5 }}>Total Area (hectares)</label>
                <input type="number" value={farmForm.totalAreaHectares} onChange={(e) => setFarmForm({ ...farmForm, totalAreaHectares: e.target.value })} placeholder="e.g. 50" min="0" step="0.01" style={inputStyle} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 5 }}>Primary Activity</label>
              <input type="text" value={farmForm.primaryActivity} onChange={(e) => setFarmForm({ ...farmForm, primaryActivity: e.target.value })} placeholder="e.g. Mixed farming, Dairy, Crop production" style={inputStyle} />
            </div>
            {formError && (
              <div style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.20)', borderRadius: 8, padding: '8px 12px', color: '#fca5a5', fontSize: 12.5, marginBottom: 12 }}>
                {formError}
              </div>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" disabled={savingFarm} style={{
                padding: '9px 20px', borderRadius: 8, border: 'none',
                background: savingFarm ? 'rgba(34,197,94,0.4)' : '#22c55e',
                color: '#fff', fontSize: 13, fontWeight: 600, cursor: savingFarm ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
              }}>
                {savingFarm ? 'Saving...' : 'Save Farm'}
              </button>
              <button type="button" onClick={() => { setShowFarmForm(false); setFormError(''); }} style={{
                padding: '9px 20px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)',
                background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: 4, width: 'fit-content' }}>
        {(['farms', 'crops', 'livestock'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '7px 16px', borderRadius: 7, border: 'none', cursor: 'pointer',
              background: activeTab === tab ? 'rgba(255,255,255,0.10)' : 'transparent',
              color: activeTab === tab ? '#fff' : 'rgba(255,255,255,0.4)',
              fontSize: 13, fontWeight: 600, fontFamily: 'inherit', transition: 'all 0.15s',
              textTransform: 'capitalize',
            }}
          >
            {tab} {tab === 'farms' ? `(${farms.length})` : tab === 'crops' ? `(${filteredCrops.length})` : `(${filteredLivestock.length})`}
          </button>
        ))}
      </div>

      {/* Farm filter */}
      {farms.length > 0 && activeTab !== 'farms' && (
        <div style={{ marginBottom: 16 }}>
          <select
            value={selectedFarm || ''}
            onChange={(e) => setSelectedFarm(e.target.value || null)}
            style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 8, color: 'rgba(255,255,255,0.7)', fontSize: 12.5, padding: '7px 12px',
              fontFamily: 'inherit', cursor: 'pointer', outline: 'none',
            }}
          >
            <option value="" style={{ background: '#1a1f2e' }}>All Farms</option>
            {farms.map((f) => (
              <option key={f.id} value={f.id} style={{ background: '#1a1f2e' }}>{f.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Loading farm data...</div>
      ) : (
        <>
          {activeTab === 'farms' && (
            farms.length === 0 ? (
              <EmptyState
                icon="🌱"
                title="No farms registered yet"
                description="Add your first farm to start tracking agricultural data and get AI-powered insights."
                action={{ label: 'Add Your First Farm', onClick: () => setShowFarmForm(true) }}
              />
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                {farms.map((farm) => (
                  <div key={farm.id} style={{
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 14, padding: '18px 20px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ fontSize: 24 }}>🌾</div>
                      <span style={{
                        padding: '3px 8px', borderRadius: 999,
                        background: farm.isActive ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.06)',
                        border: `1px solid ${farm.isActive ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.10)'}`,
                        color: farm.isActive ? '#4ade80' : 'rgba(255,255,255,0.4)',
                        fontSize: 10, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase',
                      }}>
                        {farm.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <div style={{ color: '#fff', fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{farm.name}</div>
                    <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12.5, marginBottom: 12 }}>
                      {farm.country}{farm.region ? `, ${farm.region}` : ''}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {farm.totalAreaHectares && (
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11.5 }}>📐 {farm.totalAreaHectares} ha</span>
                      )}
                      {farm.primaryActivity && (
                        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11.5 }}>🔧 {farm.primaryActivity}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === 'crops' && (
            filteredCrops.length === 0 ? (
              <EmptyState
                icon="🌽"
                title="No crop records yet"
                description="Add crop records to track planting, growth, and harvest data for AI analysis."
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filteredCrops.map((crop) => (
                  <div key={crop.id} style={{
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14,
                  }}>
                    <div style={{ fontSize: 22 }}>🌱</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>
                        {crop.cropName}{crop.variety ? ` — ${crop.variety}` : ''}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 }}>
                        {crop.fieldName && `Field: ${crop.fieldName} · `}
                        {crop.areaHectares && `${crop.areaHectares} ha · `}
                        {crop.plantingDate && `Planted: ${crop.plantingDate}`}
                      </div>
                    </div>
                    <span style={{
                      padding: '3px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                      background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.20)', color: '#4ade80',
                    }}>
                      {crop.status}
                    </span>
                  </div>
                ))}
              </div>
            )
          )}

          {activeTab === 'livestock' && (
            filteredLivestock.length === 0 ? (
              <EmptyState
                icon="🐄"
                title="No livestock records yet"
                description="Add livestock records to track your animals and get AI-powered management insights."
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filteredLivestock.map((animal) => (
                  <div key={animal.id} style={{
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14,
                  }}>
                    <div style={{ fontSize: 22 }}>🐄</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>
                        {animal.animalType}{animal.breed ? ` — ${animal.breed}` : ''}
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 }}>
                        {animal.count} head
                      </div>
                    </div>
                    <span style={{
                      padding: '3px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                      background: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.20)', color: '#4ade80',
                    }}>
                      {animal.status}
                    </span>
                  </div>
                ))}
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}

function EmptyState({ icon, title, description, action }: {
  icon: string; title: string; description: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.10)',
      borderRadius: 14, padding: '48px 24px', textAlign: 'center',
    }}>
      <div style={{ fontSize: 36, marginBottom: 14 }}>{icon}</div>
      <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, fontWeight: 600, marginBottom: 8 }}>{title}</div>
      <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, maxWidth: 380, margin: '0 auto', lineHeight: 1.6, marginBottom: action ? 20 : 0 }}>
        {description}
      </div>
      {action && (
        <button
          onClick={action.onClick}
          style={{
            padding: '9px 20px', borderRadius: 9, border: '1px solid rgba(34,197,94,0.25)',
            background: 'rgba(34,197,94,0.10)', color: '#4ade80', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
