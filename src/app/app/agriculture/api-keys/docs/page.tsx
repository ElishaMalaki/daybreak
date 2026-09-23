'use client';

import React, { useState } from 'react';

const BASE_URL = 'https://daybreak1966.builtwithrocket.new';
const ENDPOINT = `${BASE_URL}/api/v1/agriculture/intelligence`;

const REQUEST_TYPES = [
  { value: 'general', label: 'General', credits: 1, description: 'Simple agricultural questions' },
  { value: 'farm_data_analysis', label: 'Farm Data Analysis', credits: 3, description: 'Crop performance, production optimization' },
  { value: 'decision_support', label: 'Decision Support', credits: 3, description: 'Planting, irrigation, input decisions' },
  { value: 'risk_assessment', label: 'Risk Assessment', credits: 3, description: 'Weather, pest, disease, market risk' },
  { value: 'market_analysis', label: 'Market Analysis', credits: 3, description: 'Commodity pricing, trade patterns' },
  { value: 'research', label: 'Research', credits: 5, description: 'Agronomic research, scientific literature' },
];

const EXAMPLE_REQUEST = `curl -X POST ${ENDPOINT} \\
  -H "Authorization: Bearer eia_live_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "What is the optimal planting window for maize in Tanzania given current rainfall patterns?",
    "request_type": "decision_support",
    "context": {
      "location": "Morogoro, Tanzania",
      "crop_type": "Maize",
      "season": "Long rains (Masika)"
    },
    "metadata": {
      "source_app": "Pelit Farm",
      "reference_id": "farm-001-query-2026"
    }
  }'`;

const EXAMPLE_RESPONSE = `{
  "success": true,
  "intelligence": {
    "response": "Based on historical rainfall patterns for Morogoro...",
    "request_type": "decision_support"
  },
  "usage": {
    "credits_used": 3,
    "credits_remaining": 497
  },
  "meta": {
    "processing_time_ms": 1842,
    "api_version": "v1",
    "reference_id": "farm-001-query-2026"
  }
}`;

const JAVASCRIPT_EXAMPLE = `// Intelligence E Agriculture — JavaScript Integration
const INTELLIGENCE_E_API = '${ENDPOINT}';
const API_KEY = process.env.INTELLIGENCE_E_API_KEY; // Store securely

async function queryAgricultureIntelligence(query, options = {}) {
  const response = await fetch(INTELLIGENCE_E_API, {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${API_KEY}\`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      request_type: options.requestType || 'general',
      context: options.context || {},
      metadata: {
        source_app: 'Your App Name',
        reference_id: options.referenceId,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Intelligence E request failed');
  }

  return response.json();
}

// Usage
const result = await queryAgricultureIntelligence(
  'What fertilizer should I apply for cassava on clay soil?',
  {
    requestType: 'decision_support',
    context: { crop_type: 'Cassava', soil_type: 'Clay', location: 'Uganda' },
  }
);
console.log(result.intelligence.response);
console.log('Credits remaining:', result.usage.credits_remaining);`;

const PYTHON_EXAMPLE = `# Intelligence E Agriculture — Python Integration
import os
import requests

INTELLIGENCE_E_API = '${ENDPOINT}'
API_KEY = os.environ.get('INTELLIGENCE_E_API_KEY')  # Store securely

def query_agriculture_intelligence(query, request_type='general', context=None, reference_id=None):
    headers = {
        'Authorization': f'Bearer {API_KEY}',
        'Content-Type': 'application/json',
    }
    payload = {
        'query': query,
        'request_type': request_type,
        'context': context or {},
        'metadata': {
            'source_app': 'Your App Name',
            'reference_id': reference_id,
        },
    }
    response = requests.post(INTELLIGENCE_E_API, json=payload, headers=headers)
    response.raise_for_status()
    return response.json()

# Usage
result = query_agriculture_intelligence(
    query='What are the signs of fall armyworm infestation in maize?',
    request_type='farm_data_analysis',
    context={'crop_type': 'Maize', 'location': 'Kenya'},
)
print(result['intelligence']['response'])
print(f"Credits remaining: {result['usage']['credits_remaining']}")`;

export default function ApiDocsPage() {
  const [activeTab, setActiveTab] = useState<'curl' | 'javascript' | 'python'>('curl');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function copy(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch { /* ignore */ }
  }

  const tabStyle = (tab: string) => ({
    padding: '8px 16px',
    borderRadius: '6px 6px 0 0',
    border: 'none',
    background: activeTab === tab ? '#0f172a' : 'transparent',
    color: activeTab === tab ? '#fff' : '#64748b',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  });

  const codeBlockStyle: React.CSSProperties = {
    background: '#0f172a',
    borderRadius: '0 8px 8px 8px',
    padding: '20px 24px',
    overflowX: 'auto',
    fontSize: 12.5,
    lineHeight: 1.7,
    color: '#e2e8f0',
    fontFamily: 'monospace',
    whiteSpace: 'pre',
    position: 'relative',
  };

  return (
    <div style={{ padding: '32px', maxWidth: 860, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <a
            href="/app/agriculture/api-keys"
            style={{ fontSize: 13, color: '#16a34a', textDecoration: 'none', fontWeight: 600 }}
          >
            ← API Keys
          </a>
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', marginBottom: 8 }}>
          Integration Guide
        </h1>
        <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7, maxWidth: 600 }}>
          Integrate Intelligence E Agriculture into your applications using our REST API.
          Available for Business and Enterprise subscribers.
        </p>
      </div>

      {/* Endpoint */}
      <section style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
          Endpoint
        </h2>
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <span style={{
            background: '#16a34a',
            color: '#fff',
            fontSize: 11,
            fontWeight: 700,
            padding: '3px 8px',
            borderRadius: 4,
            flexShrink: 0,
          }}>POST</span>
          <code style={{ fontFamily: 'monospace', fontSize: 13, color: '#0f172a', wordBreak: 'break-all' }}>
            {ENDPOINT}
          </code>
          <button
            onClick={() => copy(ENDPOINT, 'endpoint')}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: '1px solid #cbd5e1',
              borderRadius: 6,
              padding: '4px 10px',
              fontSize: 12,
              color: '#64748b',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            {copiedId === 'endpoint' ? 'Copied' : 'Copy'}
          </button>
        </div>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 8 }}>
          Also available: <code style={{ fontFamily: 'monospace', background: '#f1f5f9', padding: '1px 5px', borderRadius: 3 }}>GET</code> for health check / API info.
        </p>
      </section>

      {/* Authentication */}
      <section style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
          Authentication
        </h2>
        <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7, marginBottom: 12 }}>
          Include your API key in the <code style={{ fontFamily: 'monospace', background: '#f1f5f9', padding: '1px 5px', borderRadius: 3 }}>Authorization</code> header:
        </p>
        <div style={{ background: '#0f172a', borderRadius: 8, padding: '14px 18px', fontFamily: 'monospace', fontSize: 13, color: '#e2e8f0' }}>
          Authorization: Bearer eia_live_your_api_key_here
        </div>
        <p style={{ fontSize: 13, color: '#64748b', marginTop: 10 }}>
          Generate API keys in your{' '}
          <a href="/app/agriculture/api-keys" style={{ color: '#16a34a', fontWeight: 600 }}>API Keys dashboard</a>.
          Keep keys secure — never expose them in client-side code.
        </p>
      </section>

      {/* Request body */}
      <section style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
          Request Body
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Field</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Type</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Required</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Description</th>
              </tr>
            </thead>
            <tbody>
              {[
                { field: 'query', type: 'string', required: 'Yes', desc: 'The agricultural question or request. Max 6,000 characters.' },
                { field: 'request_type', type: 'string', required: 'No', desc: 'Type of request (see below). Default: general.' },
                { field: 'context', type: 'object', required: 'No', desc: 'Agricultural context: location, crop_type, season, farm_name, etc.' },
                { field: 'conversation_history', type: 'array', required: 'No', desc: 'Previous turns [{role, content}]. Max 10 turns. Enables multi-turn conversations.' },
                { field: 'metadata', type: 'object', required: 'No', desc: 'source_app, reference_id — passed back in the response for tracking.' },
              ].map(row => (
                <tr key={row.field} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 14px' }}>
                    <code style={{ fontFamily: 'monospace', color: '#0f172a', background: '#f1f5f9', padding: '1px 5px', borderRadius: 3 }}>{row.field}</code>
                  </td>
                  <td style={{ padding: '10px 14px', color: '#6366f1' }}>{row.type}</td>
                  <td style={{ padding: '10px 14px', color: row.required === 'Yes' ? '#dc2626' : '#64748b' }}>{row.required}</td>
                  <td style={{ padding: '10px 14px', color: '#475569', lineHeight: 1.5 }}>{row.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Request types */}
      <section style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
          Request Types &amp; Credit Costs
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
          {REQUEST_TYPES.map(rt => (
            <div key={rt.value} style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              padding: '12px 14px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <code style={{ fontFamily: 'monospace', fontSize: 12, color: '#0f172a', background: '#e2e8f0', padding: '2px 6px', borderRadius: 4 }}>
                  {rt.value}
                </code>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#16a34a' }}>{rt.credits} credit{rt.credits > 1 ? 's' : ''}</span>
              </div>
              <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>{rt.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Code examples */}
      <section style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
          Code Examples
        </h2>
        <div style={{ display: 'flex', gap: 0, marginBottom: 0 }}>
          <button style={tabStyle('curl')} onClick={() => setActiveTab('curl')}>cURL</button>
          <button style={tabStyle('javascript')} onClick={() => setActiveTab('javascript')}>JavaScript</button>
          <button style={tabStyle('python')} onClick={() => setActiveTab('python')}>Python</button>
        </div>
        <div style={{ position: 'relative' }}>
          <div style={codeBlockStyle}>
            {activeTab === 'curl' && EXAMPLE_REQUEST}
            {activeTab === 'javascript' && JAVASCRIPT_EXAMPLE}
            {activeTab === 'python' && PYTHON_EXAMPLE}
          </div>
          <button
            onClick={() => copy(
              activeTab === 'curl' ? EXAMPLE_REQUEST : activeTab === 'javascript' ? JAVASCRIPT_EXAMPLE : PYTHON_EXAMPLE,
              'code'
            )}
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: copiedId === 'code' ? '#16a34a' : 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: 6,
              padding: '5px 12px',
              fontSize: 12,
              color: '#e2e8f0',
              cursor: 'pointer',
            }}
          >
            {copiedId === 'code' ? 'Copied' : 'Copy'}
          </button>
        </div>
      </section>

      {/* Response format */}
      <section style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
          Response Format
        </h2>
        <div style={{ position: 'relative' }}>
          <div style={codeBlockStyle}>{EXAMPLE_RESPONSE}</div>
          <button
            onClick={() => copy(EXAMPLE_RESPONSE, 'response')}
            style={{
              position: 'absolute',
              top: 12,
              right: 12,
              background: copiedId === 'response' ? '#16a34a' : 'rgba(255,255,255,0.1)',
              border: 'none',
              borderRadius: 6,
              padding: '5px 12px',
              fontSize: 12,
              color: '#e2e8f0',
              cursor: 'pointer',
            }}
          >
            {copiedId === 'response' ? 'Copied' : 'Copy'}
          </button>
        </div>
      </section>

      {/* Error codes */}
      <section style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
          Error Codes
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>HTTP</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Code</th>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#374151' }}>Meaning</th>
              </tr>
            </thead>
            <tbody>
              {[
                { http: '401', code: 'MISSING_API_KEY', meaning: 'No API key provided in the request.' },
                { http: '401', code: 'INVALID_API_KEY', meaning: 'The API key is not recognized.' },
                { http: '401', code: 'KEY_REVOKED', meaning: 'The API key has been revoked.' },
                { http: '401', code: 'KEY_EXPIRED', meaning: 'The API key has expired.' },
                { http: '403', code: 'PLAN_UPGRADE_REQUIRED', meaning: 'Your subscription plan does not include API access.' },
                { http: '400', code: 'MISSING_QUERY', meaning: 'The query field is missing or empty.' },
                { http: '400', code: 'INPUT_TOO_LONG', meaning: 'The query exceeds the 6,000 character limit.' },
                { http: '429', code: 'CREDIT_LIMIT_EXCEEDED', meaning: 'Monthly AI credit limit reached. Upgrade or wait for reset.' },
                { http: '503', code: 'AI_UNAVAILABLE', meaning: 'Intelligence E is temporarily unavailable. Retry with backoff.' },
              ].map(row => (
                <tr key={row.code} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 14px', fontFamily: 'monospace', color: parseInt(row.http) >= 400 ? '#dc2626' : '#0f172a' }}>{row.http}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <code style={{ fontFamily: 'monospace', fontSize: 12, background: '#f1f5f9', padding: '1px 5px', borderRadius: 3 }}>{row.code}</code>
                  </td>
                  <td style={{ padding: '10px 14px', color: '#475569' }}>{row.meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Rate limits */}
      <section style={{ marginBottom: 36 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
          Rate Limits
        </h2>
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 8,
          padding: '16px 20px',
          fontSize: 13,
          color: '#475569',
          lineHeight: 1.8,
        }}>
          <p>Limits are shared between your Intelligence E web app and API usage.</p>
          <ul style={{ paddingLeft: 20, marginTop: 8 }}>
            <li><strong>Business:</strong> 2,000 AI credits/month, 2,000 requests/month</li>
            <li><strong>Enterprise:</strong> Custom limits — contact Earth AI</li>
            <li>All limits reset at the start of your billing period</li>
            <li>Limits are enforced server-side and cannot be bypassed</li>
          </ul>
        </div>
      </section>

      {/* Support */}
      <section>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
          Support
        </h2>
        <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7 }}>
          For integration support, Enterprise plans, or custom requirements, contact the Earth AI team.
          Include your organization name and use case when reaching out.
        </p>
      </section>
    </div>
  );
}
