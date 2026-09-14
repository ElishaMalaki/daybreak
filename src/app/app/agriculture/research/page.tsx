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
  completedAt: string | null;
}

const RESEARCH_TOPICS = [
  'What are the latest advances in drought-resistant crop varieties?',
  'How does climate change affect smallholder farming in Sub-Saharan Africa?',
  'What are best practices for integrated pest management in maize production?',
  'Explain the role of soil microbiome in sustainable agriculture',
  'What are the economic impacts of precision agriculture adoption?',
  'How can agroforestry improve farm resilience and income?',
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
        .select('id, query, result, status, created_at, completed_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      setHistory(
        (data || []).map((r) => ({
          id: r.id,
          query: r.query,
          result: r.result,
          status: r.status,
          createdAt: r.created_at,
          completedAt: r.completed_at,
        }))
      );
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

    // Create research request record
    let requestId: string | null = null;
    try {
      const { data } = await supabase
        .from('research_requests')
        .insert({
          user_id: user.id,
          query: researchQuery,
          status: 'pending',
        })
        .select('id')
        .single();

      requestId = data?.id || null;
    } catch {
      // non-critical
    }

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Agricultural Research Query: ${researchQuery}\n\nPlease provide a comprehensive, evidence-based response. Include relevant scientific context, practical implications for farmers, and note any important caveats or regional variations. If citing specific studies or data, clearly indicate the source type (e.g., "research suggests", "studies indicate") rather than fabricating specific citations.`,
            },
          ],
          requestType: 'research',
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Research query failed. Please try again.');
        if (requestId) {
          await supabase.from('research_requests').update({ status: 'failed' }).eq('id', requestId);
        }
        return;
      }

      // Update research request with result
      if (requestId) {
        await supabase.from('research_requests').update({
          result: data.content,
          status: 'completed',
          completed_at: new Date().toISOString(),
        }).eq('id', requestId);
      }

      const newRequest: ResearchRequest = {
        id: requestId || `temp-${Date.now()}`,
        query: researchQuery,
        result: data.content,
        status: 'completed',
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
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
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 4 }}>
          Agricultural Research Assistant
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
          AI-powered agricultural research and intelligence — evidence-based, domain-specific
        </p>
      </div>

      {/* Research Input */}
      <div style={{
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14, padding: '20px 22px', marginBottom: 24,
      }}>
        <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>
          Research Query
        </label>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) handleResearch(); }}
          placeholder="Enter your agricultural research question..."
          rows={3}
          style={{
            width: '100%', padding: '10px 14px', borderRadius: 10,
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
            color: '#fff', fontSize: 13.5, fontFamily: 'inherit', outline: 'none',
            resize: 'vertical', lineHeight: 1.55, marginBottom: 12,
          }}
        />

        {error && (
          <div style={{
            background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.20)',
            borderRadius: 8, padding: '8px 12px', color: '#fca5a5', fontSize: 12.5, marginBottom: 12,
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11.5 }}>Ctrl+Enter to submit</span>
          <button
            onClick={handleResearch}
            disabled={researching || !query.trim()}
            style={{
              padding: '9px 22px', borderRadius: 9, border: 'none',
              background: researching || !query.trim() ? 'rgba(34,197,94,0.3)' : '#22c55e',
              color: '#fff', fontSize: 13, fontWeight: 600, cursor: researching || !query.trim() ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 7,
            }}
          >
            {researching && (
              <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            )}
            {researching ? 'Researching...' : 'Research'}
          </button>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>

      {/* Suggested Topics */}
      {!activeResult && (
        <div style={{ marginBottom: 28 }}>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>
            Suggested Research Topics
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {RESEARCH_TOPICS.map((topic) => (
              <button
                key={topic}
                onClick={() => setQuery(topic)}
                style={{
                  padding: '7px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.10)',
                  background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.55)',
                  fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                  textAlign: 'left',
                }}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active Result */}
      {activeResult && (
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 14, padding: '20px 22px', marginBottom: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>Research Result</div>
              <div style={{ color: '#fff', fontSize: 14, fontWeight: 600 }}>{activeResult.query}</div>
            </div>
            <button
              onClick={() => setActiveResult(null)}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 4 }}
            >×</button>
          </div>
          <div style={{
            color: 'rgba(255,255,255,0.8)', fontSize: 13.5, lineHeight: 1.7,
            whiteSpace: 'pre-wrap', borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 14,
          }}>
            {activeResult.result}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, marginTop: 12 }}>
            Intelligence E provides research guidance based on available knowledge. Verify critical decisions with qualified agricultural experts.
          </div>
        </div>
      )}

      {/* Research History */}
      <div>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
          Research History
        </div>

        {loadingHistory ? (
          <div style={{ textAlign: 'center', padding: '24px', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Loading...</div>
        ) : history.length === 0 ? (
          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.10)',
            borderRadius: 12, padding: '32px 20px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>🔬</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>No research queries yet</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {history.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveResult(item)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                  background: activeResult?.id === item.id ? 'rgba(34,197,94,0.08)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${activeResult?.id === item.id ? 'rgba(34,197,94,0.20)' : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: 18, flexShrink: 0 }}>🔬</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.query}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11.5, marginTop: 2 }}>
                    {item.status === 'completed' ? 'Completed' : item.status} · {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
