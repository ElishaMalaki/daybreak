'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

interface Report {
  id: string;
  title: string;
  reportType: string;
  status: string;
  summary: string | null;
  createdAt: string;
}

const REPORT_TYPES = [
  {
    value: 'agricultural_intelligence',
    label: 'Agricultural Intelligence Report',
    description: 'Comprehensive agricultural market and production intelligence',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3"/>
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
      </svg>
    ),
    color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0',
  },
  {
    value: 'market_intelligence',
    label: 'Market Intelligence Report',
    description: 'Commodity prices, trade patterns, and market outlook',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
      </svg>
    ),
    color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe',
  },
  {
    value: 'risk_intelligence',
    label: 'Risk Intelligence Report',
    description: 'Weather, pest, disease, and market risk assessment',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
    color: '#d97706', bg: '#fffbeb', border: '#fde68a',
  },
  {
    value: 'research_summary',
    label: 'Agricultural Research Summary',
    description: 'Synthesis of agricultural research and best practices',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
    color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe',
  },
];

function statusBadge(status: string) {
  const map: Record<string, { bg: string; border: string; text: string; label: string }> = {
    completed: { bg: '#f0fdf4', border: '#bbf7d0', text: '#16a34a', label: 'Completed' },
    generating: { bg: '#eff6ff', border: '#bfdbfe', text: '#2563eb', label: 'Generating' },
    failed: { bg: '#fef2f2', border: '#fecaca', text: '#dc2626', label: 'Failed' },
  };
  const s = map[status] || { bg: '#f8fafc', border: '#e2e8f0', text: '#64748b', label: status };
  return (
    <span style={{
      padding: '2px 9px', borderRadius: 999, fontSize: 11, fontWeight: 600,
      background: s.bg, border: `1px solid ${s.border}`, color: s.text,
    }}>{s.label}</span>
  );
}

export default function ReportsPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [selectedType, setSelectedType] = useState('agricultural_intelligence');
  const [reportTopic, setReportTopic] = useState('');
  const [activeReport, setActiveReport] = useState<Report | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadReports();
  }, [user]);

  const loadReports = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('reports')
        .select('id, title, report_type, status, summary, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      setReports((data || []).map((r) => ({
        id: r.id, title: r.title, reportType: r.report_type,
        status: r.status, summary: r.summary, createdAt: r.created_at,
      })));
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!reportTopic.trim() || generating || !user) return;
    const topic = reportTopic.trim();
    const typeInfo = REPORT_TYPES.find((t) => t.value === selectedType);
    const reportTitle = `${typeInfo?.label || 'Report'}: ${topic.slice(0, 50)}`;

    setGenerating(true);
    setError('');

    let reportId: string | null = null;
    try {
      const { data } = await supabase
        .from('reports')
        .insert({ user_id: user.id, title: reportTitle, report_type: selectedType, status: 'generating' })
        .select('id').single();
      reportId = data?.id || null;
    } catch {
      // non-critical
    }

    try {
      const prompt = `Generate a professional ${typeInfo?.label || 'agricultural intelligence report'} on: "${topic}"

Structure the report with:
1. Executive Summary (2-3 sentences)
2. Key Findings (3-5 bullet points)
3. Detailed Analysis (2-3 paragraphs)
4. Implications & Recommendations (2-3 actionable points)
5. Important Caveats (note data limitations and need for local verification)

For agricultural professionals and businesses. Be specific, evidence-based, and practical. Use language like "research indicates" or "industry data suggests" when referencing trends. Do not fabricate specific statistics.`;

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          requestType: selectedType === 'market_intelligence' ? 'market_analysis' : 'research',
        }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Report generation failed. Please try again.');
        if (reportId) await supabase.from('reports').update({ status: 'failed' }).eq('id', reportId);
        return;
      }

      const summary = data.content.split('\n').find((line: string) => line.trim().length > 50) || data.content.slice(0, 200);

      if (reportId) {
        await supabase.from('reports').update({
          content: data.content,
          summary: summary.slice(0, 500),
          status: 'completed',
          completed_at: new Date().toISOString(),
          ai_provider: data.provider,
          model_used: data.model,
          tokens_used: data.tokens,
        }).eq('id', reportId);
      }

      const newReport: Report = {
        id: reportId || `temp-${Date.now()}`,
        title: reportTitle, reportType: selectedType, status: 'completed',
        summary: data.content, createdAt: new Date().toISOString(),
      };
      setReports((prev) => [newReport, ...prev]);
      setActiveReport(newReport);
      setShowForm(false);
      setReportTopic('');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ color: '#0f172a', fontSize: 20, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 4 }}>Reports</h1>
          <p style={{ color: '#64748b', fontSize: 13 }}>AI-generated agricultural intelligence reports</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '9px 18px', borderRadius: 9, border: '1px solid #bbf7d0',
            background: '#f0fdf4', color: '#16a34a', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 7,
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Generate Report
        </button>
      </div>

      {/* Generate Form */}
      {showForm && (
        <div style={{
          background: '#fff', border: '1px solid #e8edf2',
          borderRadius: 14, padding: '22px 24px', marginBottom: 20,
          boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <h3 style={{ color: '#0f172a', fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em' }}>Generate New Report</h3>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 20, lineHeight: 1, padding: 4 }}>×</button>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: '#64748b', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>
              Report Type
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {REPORT_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  style={{
                    padding: '12px 14px', borderRadius: 10,
                    border: `1px solid ${selectedType === type.value ? type.border : '#e2e8f0'}`,
                    background: selectedType === type.value ? type.bg : '#f8fafc',
                    cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.12s',
                  }}
                >
                  <div style={{ color: selectedType === type.value ? type.color : '#94a3b8', marginBottom: 6 }}>{type.icon}</div>
                  <div style={{ color: selectedType === type.value ? type.color : '#374151', fontSize: 12.5, fontWeight: 600, marginBottom: 2 }}>{type.label}</div>
                  <div style={{ color: '#94a3b8', fontSize: 11, lineHeight: 1.4 }}>{type.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: '#64748b', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
              Report Topic
            </label>
            <input
              type="text"
              value={reportTopic}
              onChange={(e) => setReportTopic(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleGenerateReport(); }}
              placeholder="e.g. Maize market outlook in East Africa Q4 2026"
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 9,
                background: '#f8fafc', border: '1px solid #e2e8f0',
                color: '#1e293b', fontSize: 13.5, fontFamily: 'inherit', outline: 'none',
              }}
            />
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '9px 12px', color: '#dc2626', fontSize: 12.5, marginBottom: 14 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={handleGenerateReport}
              disabled={generating || !reportTopic.trim()}
              style={{
                padding: '9px 22px', borderRadius: 8, border: 'none',
                background: generating || !reportTopic.trim() ? '#bbf7d0' : '#16a34a',
                color: '#fff', fontSize: 13, fontWeight: 600,
                cursor: generating || !reportTopic.trim() ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 7,
                boxShadow: generating || !reportTopic.trim() ? 'none' : '0 2px 8px rgba(22,163,74,0.25)',
              }}
            >
              {generating && (
                <div style={{ width: 13, height: 13, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              )}
              {generating ? 'Generating...' : 'Generate Report'}
            </button>
            <button onClick={() => setShowForm(false)} style={{
              padding: '9px 20px', borderRadius: 8, border: '1px solid #e2e8f0',
              background: '#f8fafc', color: '#64748b', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Active Report */}
      {activeReport && (
        <div style={{
          background: '#fff', border: '1px solid #e8edf2',
          borderRadius: 14, padding: '22px 24px', marginBottom: 16,
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                {statusBadge(activeReport.status)}
                <span style={{ color: '#94a3b8', fontSize: 11.5 }}>
                  {REPORT_TYPES.find(t => t.value === activeReport.reportType)?.label || activeReport.reportType}
                </span>
              </div>
              <div style={{ color: '#0f172a', fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em' }}>{activeReport.title}</div>
            </div>
            <button
              onClick={() => setActiveReport(null)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: 4, flexShrink: 0 }}
            >×</button>
          </div>
          <div style={{
            color: '#374151', fontSize: 13.5, lineHeight: 1.75,
            whiteSpace: 'pre-wrap', letterSpacing: '-0.01em',
          }}>
            {activeReport.summary}
          </div>
          <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid #f1f5f9', color: '#94a3b8', fontSize: 11.5 }}>
            Intelligence E Agriculture · Reports are AI-generated. Verify critical decisions with local agricultural experts.
          </div>
        </div>
      )}

      {/* Reports list */}
      {loading ? (
        <div style={{ background: '#fff', border: '1px solid #e8edf2', borderRadius: 14, padding: '40px 24px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
          Loading reports...
        </div>
      ) : reports.length === 0 ? (
        <div style={{
          background: '#fff', border: '1.5px dashed #e2e8f0', borderRadius: 14,
          padding: '48px 24px', textAlign: 'center',
        }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <div style={{ color: '#374151', fontSize: 15, fontWeight: 700, marginBottom: 6 }}>No reports generated</div>
          <div style={{ color: '#94a3b8', fontSize: 13, marginBottom: 20, lineHeight: 1.5 }}>
            Generate your first agricultural intelligence report.
          </div>
          <button
            onClick={() => setShowForm(true)}
            style={{
              padding: '9px 20px', borderRadius: 9, border: 'none',
              background: '#16a34a', color: '#fff', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 2px 8px rgba(22,163,74,0.25)',
            }}
          >
            Generate First Report
          </button>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #e8edf2', borderRadius: 14, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ padding: '12px 20px', borderBottom: '1px solid #f1f5f9', color: '#64748b', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            All Reports ({reports.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {reports.map((report, i) => (
              <button
                key={report.id}
                onClick={() => setActiveReport(report)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
                  borderBottom: i < reports.length - 1 ? '1px solid #f1f5f9' : 'none',
                  background: activeReport?.id === report.id ? '#f8fafc' : 'transparent',
                  cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                  transition: 'background 0.1s', border: 'none',
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                  background: REPORT_TYPES.find(t => t.value === report.reportType)?.bg || '#f8fafc',
                  border: `1px solid ${REPORT_TYPES.find(t => t.value === report.reportType)?.border || '#e2e8f0'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: REPORT_TYPES.find(t => t.value === report.reportType)?.color || '#64748b',
                }}>
                  {REPORT_TYPES.find(t => t.value === report.reportType)?.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: '#0f172a', fontSize: 13.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3 }}>
                    {report.title}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: 11.5 }}>
                    {REPORT_TYPES.find(t => t.value === report.reportType)?.label || report.reportType}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                  {statusBadge(report.status)}
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
