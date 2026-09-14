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
        <h1 style={{ color: '#fff', fontSize: 20, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 4 }}>
          Agricultural Research Assistant
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>
          Evidence-based agricultural research and intelligence
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16 }}>
        {/* Main area */}
        <div>
          {/* Research Input */}
          <div style={{
            background: '#0D1017', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 12, padding: '18px 20px', marginBottom: 16,
          }}>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.35)', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 10 }}>
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
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)',
                color: '#fff', fontSize: 13.5, fontFamily: 'inherit', outline: 'none',
                resize: 'vertical', lineHeight: 1.55, marginBottom: 12,
                transition: 'border-color 0.15s',
              }}
            />
            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)',
                borderRadius: 8, padding: '8px 12px', color: '#fca5a5', fontSize: 12.5, marginBottom: 12,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11 }}>Ctrl+Enter to submit</span>
              <button
                onClick={handleResearch}
                disabled={researching || !query.trim()}
                style={{
                  padding: '8px 20px', borderRadius: 8, border: 'none',
                  background: researching || !query.trim() ? 'rgba(34,197,94,0.25)' : '#22c55e',
                  color: '#fff', fontSize: 13, fontWeight: 600, cursor: researching || !query.trim() ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 7,
                }}
              >
                {researching && (
                  <div style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                )}
                {researching ? 'Researching...' : 'Research'}
              </button>
            </div>
          </div>

          {/* Active Result */}
          {activeResult && (
            <div style={{
              background: '#0D1017', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 12, padding: '18px 20px', marginBottom: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <div>
                  <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Research Result</div>
                  <div style={{ color: '#fff', fontSize: 13.5, fontWeight: 600, letterSpacing: '-0.01em' }}>{activeResult.query}</div>
                </div>
                <button
                  onClick={() => setActiveResult(null)}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 4, flexShrink: 0 }}
                >×</button>
              </div>
              <div style={{
                color: 'rgba(255,255,255,0.75)', fontSize: 13.5, lineHeight: 1.7,
                whiteSpace: 'pre-wrap', letterSpacing: '-0.01em',
              }}>
                {activeResult.result}
              </div>
              <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.2)', fontSize: 11 }}>
                Intelligence E Agriculture · Research results are AI-generated. Verify critical findings with local agricultural experts.
              </div>
            </div>
          )}

          {/* Empty state */}
          {!activeResult && !researching && (
            <div style={{
              background: '#0D1017', border: '1px dashed rgba(255,255,255,0.07)',
              borderRadius: 12, padding: '40px 24px', textAlign: 'center',
            }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
              </div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13.5, fontWeight: 600, marginBottom: 5 }}>Agricultural Research Assistant</div>
              <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12.5, lineHeight: 1.6 }}>
                Enter a research question above or select a suggested topic to begin.
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Suggested topics */}
          <div style={{ background: '#0D1017', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '16px 16px' }}>
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 12 }}>
              Suggested Topics
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
              {RESEARCH_TOPICS.map((topic) => (
                <button
                  key={topic}
                  onClick={() => setQuery(topic)}
                  style={{
                    padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.07)',
                    background: 'rgba(255,255,255,0.02)', color: 'rgba(255,255,255,0.5)',
                    fontSize: 11.5, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                    lineHeight: 1.4, transition: 'all 0.12s',
                  }}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {/* Research history */}
          {history.length > 0 && (
            <div style={{ background: '#0D1017', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '16px 16px' }}>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 12 }}>
                Recent Research
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {history.slice(0, 8).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => item.result && setActiveResult(item)}
                    style={{
                      padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.06)',
                      background: activeResult?.id === item.id ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.02)',
                      color: 'rgba(255,255,255,0.5)', fontSize: 11.5, cursor: item.result ? 'pointer' : 'default',
                      fontFamily: 'inherit', textAlign: 'left', lineHeight: 1.4,
                    }}
                  >
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.query}</div>
                    <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, marginTop: 2 }}>{item.status}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
