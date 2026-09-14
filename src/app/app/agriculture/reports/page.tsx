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
  completedAt: string | null;
}

const REPORT_TYPES = [
  { value: 'agricultural_intelligence', label: 'Agricultural Intelligence Report', icon: '🌾', description: 'Comprehensive agricultural market and production intelligence' },
  { value: 'market_intelligence', label: 'Market Intelligence Report', icon: '📈', description: 'Commodity prices, trade patterns, and market outlook' },
  { value: 'risk_intelligence', label: 'Risk Intelligence Report', icon: '⚠️', description: 'Weather, pest, disease, and market risk assessment' },
  { value: 'research_summary', label: 'Agricultural Research Summary', icon: '🔬', description: 'Synthesis of agricultural research and best practices' },
];

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
        .select('id, title, report_type, status, summary, created_at, completed_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      setReports(
        (data || []).map((r) => ({
          id: r.id,
          title: r.title,
          reportType: r.report_type,
          status: r.status,
          summary: r.summary,
          createdAt: r.created_at,
          completedAt: r.completed_at,
        }))
      );
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

    // Create report record
    let reportId: string | null = null;
    try {
      const { data } = await supabase
        .from('reports')
        .insert({
          user_id: user.id,
          title: reportTitle,
          report_type: selectedType,
          status: 'generating',
        })
        .select('id')
        .single();

      reportId = data?.id || null;
    } catch {
      // non-critical
    }

    try {
      const prompt = `Generate a professional ${typeInfo?.label || 'agricultural intelligence report'} on the following topic: "${topic}"

Structure the report with:
1. Executive Summary (2-3 sentences)
2. Key Findings (3-5 bullet points)
3. Detailed Analysis (2-3 paragraphs)
4. Implications & Recommendations (2-3 actionable points)
5. Important Caveats (note data limitations and need for local verification)

This is for agricultural professionals and businesses. Be specific, evidence-based, and practical. Do not fabricate specific statistics or citations — use language like "research indicates", "industry data suggests", or "generally observed" when referencing trends.`;

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
        if (reportId) {
          await supabase.from('reports').update({ status: 'failed' }).eq('id', reportId);
        }
        return;
      }

      // Extract summary (first paragraph)
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
        title: reportTitle,
        reportType: selectedType,
        status: 'completed',
        summary: summary.slice(0, 500),
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString(),
      };

      setReports((prev) => [newReport, ...prev]);
      setActiveReport({ ...newReport, summary: data.content });
      setShowForm(false);
      setReportTopic('');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const statusColor = (status: string) => {
    if (status === 'completed') return { bg: 'rgba(34,197,94,0.10)', border: 'rgba(34,197,94,0.20)', text: '#4ade80' };
    if (status === 'generating') return { bg: 'rgba(59,130,246,0.10)', border: 'rgba(59,130,246,0.20)', text: '#60a5fa' };
    if (status === 'failed') return { bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.20)', text: '#fca5a5' };
    return { bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.10)', text: 'rgba(255,255,255,0.4)' };
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em', marginBottom: 4 }}>Reports</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>AI-generated agricultural intelligence reports</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '9px 18px', borderRadius: 9, border: '1px solid rgba(34,197,94,0.25)',
            background: 'rgba(34,197,94,0.10)', color: '#4ade80', fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Generate Report
        </button>
      </div>

      {/* Generate Form */}
      {showForm && (
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 14, padding: '20px 22px', marginBottom: 24,
        }}>
          <h3 style={{ color: '#fff', fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Generate New Report</h3>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 8 }}>
              Report Type
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {REPORT_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  style={{
                    padding: '10px 14px', borderRadius: 10, border: `1px solid ${selectedType === type.value ? 'rgba(34,197,94,0.30)' : 'rgba(255,255,255,0.10)'}`,
                    background: selectedType === type.value ? 'rgba(34,197,94,0.10)' : 'rgba(255,255,255,0.04)',
                    cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.15s',
                  }}
                >
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{type.icon}</div>
                  <div style={{ color: selectedType === type.value ? '#4ade80' : 'rgba(255,255,255,0.7)', fontSize: 12.5, fontWeight: 600, marginBottom: 2 }}>{type.label}</div>
                  <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>{type.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 6 }}>
              Report Topic / Focus Area
            </label>
            <textarea
              value={reportTopic}
              onChange={(e) => setReportTopic(e.target.value)}
              placeholder="e.g. Maize production outlook for East Africa Q1 2025, Impact of El Niño on smallholder farmers..."
              rows={2}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 10,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                color: '#fff', fontSize: 13, fontFamily: 'inherit', outline: 'none', resize: 'vertical',
              }}
            />
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.20)', borderRadius: 8, padding: '8px 12px', color: '#fca5a5', fontSize: 12.5, marginBottom: 12 }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleGenerateReport}
              disabled={generating || !reportTopic.trim()}
              style={{
                padding: '9px 22px', borderRadius: 9, border: 'none',
                background: generating || !reportTopic.trim() ? 'rgba(34,197,94,0.3)' : '#22c55e',
                color: '#fff', fontSize: 13, fontWeight: 600,
                cursor: generating || !reportTopic.trim() ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 7,
              }}
            >
              {generating && (
                <div style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              )}
              {generating ? 'Generating...' : 'Generate Report'}
            </button>
            <button
              onClick={() => { setShowForm(false); setError(''); }}
              style={{
                padding: '9px 20px', borderRadius: 9, border: '1px solid rgba(255,255,255,0.12)',
                background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Cancel
            </button>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* Active Report View */}
      {activeReport && (
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 14, padding: '20px 22px', marginBottom: 24,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>
                {REPORT_TYPES.find((t) => t.value === activeReport.reportType)?.label || activeReport.reportType}
              </div>
              <div style={{ color: '#fff', fontSize: 15, fontWeight: 700 }}>{activeReport.title}</div>
            </div>
            <button
              onClick={() => setActiveReport(null)}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 4 }}
            >×</button>
          </div>
          <div style={{
            color: 'rgba(255,255,255,0.8)', fontSize: 13.5, lineHeight: 1.75,
            whiteSpace: 'pre-wrap', borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 14,
          }}>
            {activeReport.summary}
          </div>
          <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, marginTop: 14 }}>
            Intelligence E reports are AI-generated based on available knowledge. Verify critical decisions with qualified agricultural professionals and current market data.
          </div>
        </div>
      )}

      {/* Reports List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '48px', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>Loading reports...</div>
      ) : reports.length === 0 ? (
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.10)',
          borderRadius: 14, padding: '48px 24px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 36, marginBottom: 14 }}>📄</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, fontWeight: 600, marginBottom: 8 }}>No reports generated yet</div>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, maxWidth: 380, margin: '0 auto', lineHeight: 1.6, marginBottom: 20 }}>
            Generate your first agricultural intelligence report to get AI-powered insights on markets, risks, and production.
          </div>
          <button
            onClick={() => setShowForm(true)}
            style={{
              padding: '9px 20px', borderRadius: 9, border: '1px solid rgba(34,197,94,0.25)',
              background: 'rgba(34,197,94,0.10)', color: '#4ade80', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Generate First Report
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {reports.map((report) => {
            const sc = statusColor(report.status);
            const typeInfo = REPORT_TYPES.find((t) => t.value === report.reportType);
            return (
              <button
                key={report.id}
                onClick={() => report.status === 'completed' ? setActiveReport(report) : undefined}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
                  background: activeReport?.id === report.id ? 'rgba(34,197,94,0.06)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${activeReport?.id === report.id ? 'rgba(34,197,94,0.18)' : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: 12, cursor: report.status === 'completed' ? 'pointer' : 'default',
                  fontFamily: 'inherit', textAlign: 'left', transition: 'all 0.15s',
                }}
              >
                <div style={{ fontSize: 22, flexShrink: 0 }}>{typeInfo?.icon || '📄'}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3 }}>
                    {report.title}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11.5 }}>
                    {typeInfo?.label || report.reportType} · {new Date(report.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <span style={{
                  padding: '3px 9px', borderRadius: 999, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', flexShrink: 0,
                  background: sc.bg, border: `1px solid ${sc.border}`, color: sc.text,
                }}>
                  {report.status}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
