'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

interface ResearchRequest {
  id: string;
  query: string;
  result: string | null;
  status: string;
  createdAt: string;
}

const RESEARCH_TOPICS = [
  'Drought-resistant crop varieties for smallholder farmers',
  'Climate change impacts on Sub-Saharan African agriculture',
  'Integrated pest management in maize production',
  'Soil microbiome and sustainable agriculture',
  'Economic impacts of precision agriculture adoption',
  'Agroforestry for farm resilience and income diversification',
];

export default function ResearchPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [query, setQuery] = useState('');
  const [researching, setResearching] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<ResearchRequest[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [activeResult, setActiveResult] = useState<ResearchRequest | null>(null);

  useEffect(() => {
    if (!user) return;
    loadHistory();
  }, [user]);

  const loadHistory = async () => {
    if (!user) return;
    setLoadingHistory(true);
    try {
      const { data } = await supabase
        .from('research_requests')
        .select('id, query, result, status, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      setHistory((data || []).map((r) => ({
        id: r.id, query: r.query, result: r.result, status: r.status, createdAt: r.created_at,
      })));
    } catch {
      // silent
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleResearch = async () => {
    if (!query.trim() || researching || !user) return;
    const researchQuery = query.trim();
    setQuery('');
    setError('');
    setResearching(true);

    let requestId: string | null = null;
    try {
      const { data } = await supabase
        .from('research_requests')
        .insert({ user_id: user.id, query: researchQuery, status: 'pending' })
        .select('id').single();
      requestId = data?.id || null;
    } catch {
      // non-critical
    }

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Agricultural Research Query: ${researchQuery}\n\nProvide a comprehensive, evidence-based response. Include scientific context, practical implications for farmers, and note important caveats or regional variations. Use language like "research suggests" or "studies indicate" rather than fabricating specific citations.`,
          }],
          requestType: 'research',
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Research query failed. Please try again.');
        if (requestId) await supabase.from('research_requests').update({ status: 'failed' }).eq('id', requestId);
        return;
      }

      if (requestId) {
        await supabase.from('research_requests').update({
          result: data.content, status: 'completed', completed_at: new Date().toISOString(),
        }).eq('id', requestId);
      }

      const newRequest: ResearchRequest = {
        id: requestId || `temp-${Date.now()}`,
        query: researchQuery, result: data.content, status: 'completed',
        createdAt: new Date().toISOString(),
      };
      setHistory((prev) => [newRequest, ...prev]);
      setActiveResult(newRequest);
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setResearching(false);
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ color: '#0f172a', fontSize: 20, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 4 }}>
          Agricultural Research
        </h1>
        <p style={{ color: '#64748b', fontSize: 13 }}>
          Evidence-based agricultural research and intelligence
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16 }}>
        {/* Main area */}
        <div>
          {/* Research Input */}
          <div style={{
            background: '#fff', border: '1px solid #e8edf2',
            borderRadius: 14, padding: '20px 22px', marginBottom: 16,
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <label style={{ display: 'block', color: '#64748b', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>
              Research Query
            </label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) handleResearch(); }}
              placeholder="Enter your agricultural research question..."
              rows={3}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 9,
                background: '#f8fafc', border: '1px solid #e2e8f0',
                color: '#1e293b', fontSize: 13.5, fontFamily: 'inherit', outline: 'none',
                resize: 'vertical', lineHeight: 1.55, marginBottom: 12,
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
              onFocus={(e) => { e.target.style.borderColor = '#16a34a'; e.target.style.boxShadow = '0 0 0 3px rgba(22,163,74,0.08)'; e.target.style.background = '#fff'; }}
              onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; e.target.style.background = '#f8fafc'; }}
            />
            {error && (
              <div style={{
                background: '#fef2f2', border: '1px solid #fecaca',
                borderRadius: 8, padding: '9px 12px', color: '#dc2626', fontSize: 12.5, marginBottom: 12,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: '#94a3b8', fontSize: 11.5 }}>Ctrl+Enter to submit</span>
              <button
                onClick={handleResearch}
                disabled={researching || !query.trim()}
                style={{
                  padding: '9px 22px', borderRadius: 8, border: 'none',
                  background: researching || !query.trim() ? '#bbf7d0' : '#16a34a',
                  color: '#fff', fontSize: 13, fontWeight: 600,
                  cursor: researching || !query.trim() ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 7,
                  boxShadow: researching || !query.trim() ? 'none' : '0 2px 8px rgba(22,163,74,0.25)',
                }}
              >
                {researching && (
                  <div style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                )}
                {researching ? 'Researching...' : 'Research'}
              </button>
            </div>
          </div>

          {/* Active Result */}
          {activeResult && (
            <div style={{
              background: '#fff', border: '1px solid #e8edf2',
              borderRadius: 14, padding: '20px 22px', marginBottom: 16,
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                  <div style={{ color: '#94a3b8', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 4 }}>Research Result</div>
                  <div style={{ color: '#0f172a', fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>{activeResult.query}</div>
                </div>
                <button
                  onClick={() => setActiveResult(null)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: 4, flexShrink: 0 }}
                >×</button>
              </div>
              <div style={{
                color: '#374151', fontSize: 13.5, lineHeight: 1.75,
                whiteSpace: 'pre-wrap', letterSpacing: '-0.01em',
              }}>
                {activeResult.result}
              </div>
              <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #f1f5f9', color: '#94a3b8', fontSize: 11.5 }}>
                Intelligence E Agriculture · Research results are AI-generated. Verify critical findings with local agricultural experts.
              </div>
            </div>
          )}

          {/* Empty state */}
          {!activeResult && !researching && (
            <div style={{
              background: '#fff', border: '1.5px dashed #e2e8f0',
              borderRadius: 14, padding: '48px 24px', textAlign: 'center',
            }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>
              <div style={{ color: '#374151', fontSize: 15, fontWeight: 700, marginBottom: 5 }}>Agricultural Research Assistant</div>
              <div style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.6 }}>
                Enter a research question above or select a suggested topic to begin.
              </div>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div style={{ background: '#fff', border: '1px solid #e8edf2', borderRadius: 14, padding: '18px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ color: '#64748b', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 12 }}>
                Research History
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveResult(item)}
                    style={{
                      padding: '10px 12px', borderRadius: 9, border: '1px solid #e8edf2',
                      background: activeResult?.id === item.id ? '#f0fdf4' : '#f8fafc',
                      cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                      transition: 'all 0.12s',
                    }}
                  >
                    <div style={{ color: '#0f172a', fontSize: 13, fontWeight: 600, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.query}
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: 11.5 }}>
                      {item.status === 'completed' ? 'Completed' : item.status}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Suggested topics */}
          <div style={{ background: '#fff', border: '1px solid #e8edf2', borderRadius: 14, padding: '18px 18px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ color: '#64748b', fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 12 }}>
              Suggested Topics
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {RESEARCH_TOPICS.map((topic) => (
                <button
                  key={topic}
                  onClick={() => setQuery(topic)}
                  style={{
                    padding: '9px 11px', borderRadius: 8, border: '1px solid #e8edf2',
                    background: '#f8fafc', color: '#374151',
                    fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                    lineHeight: 1.45, transition: 'all 0.12s',
                  }}
                  onMouseEnter={(e) => { (e.target as HTMLButtonElement).style.background = '#f0fdf4'; (e.target as HTMLButtonElement).style.borderColor = '#bbf7d0'; (e.target as HTMLButtonElement).style.color = '#16a34a'; }}
                  onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.background = '#f8fafc'; (e.target as HTMLButtonElement).style.borderColor = '#e8edf2'; (e.target as HTMLButtonElement).style.color = '#374151'; }}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {/* Info card */}
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 14, padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span style={{ color: '#16a34a', fontSize: 12.5, fontWeight: 700 }}>About Research</span>
            </div>
            <div style={{ color: '#166534', fontSize: 12, lineHeight: 1.55 }}>
              Research results are generated by Intelligence E AI. Always verify critical agricultural decisions with local experts and extension services.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
