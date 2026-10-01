'use client';

import type { CSSProperties, FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';

type WorkspaceItem = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  content: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

type FieldConfig = {
  key: string;
  label: string;
  type?: 'text' | 'textarea' | 'number' | 'select';
  rows?: number;
  required?: boolean;
  placeholder?: string;
  options?: string[];
};

type SectionConfig = {
  formTitle: string;
  titleLabel: string;
  titlePlaceholder: string;
  descriptionLabel: string;
  descriptionPlaceholder: string;
  notesLabel: string;
  notesPlaceholder: string;
  emptyText: string;
  submitLabel: string;
  statuses: string[];
  fields: FieldConfig[];
};

const defaultStatuses = ['active', 'testing', 'review', 'disabled', 'archived'];

const sectionConfigs: Record<string, SectionConfig> = {
  intelligence: {
    formTitle: 'Create AI chat test',
    titleLabel: 'Test name',
    titlePlaceholder: 'Example: Maize fertilizer recommendation test',
    descriptionLabel: 'Question or scenario',
    descriptionPlaceholder: 'Describe the agriculture question the model should answer.',
    notesLabel: 'Expected answer quality',
    notesPlaceholder: 'Add expected facts, tone, safety limits, or review notes.',
    emptyText: 'No AI chat tests yet. Add a scenario to evaluate Intelligence E responses.',
    submitLabel: 'Save Chat Test',
    statuses: ['draft', 'testing', 'passed', 'needs improvement', 'archived'],
    fields: [
      { key: 'crop', label: 'Crop or subject', placeholder: 'Maize, rice, tomatoes, irrigation, soil health' },
      { key: 'region', label: 'Region context', placeholder: 'Country, climate zone, or farming system' },
      { key: 'difficulty', label: 'Difficulty', type: 'select', options: ['basic', 'normal', 'advanced', 'expert'] },
    ],
  },
  'crop-doctor': {
    formTitle: 'Create crop doctor case',
    titleLabel: 'Case name',
    titlePlaceholder: 'Example: Tomato leaf yellowing diagnosis',
    descriptionLabel: 'Symptoms',
    descriptionPlaceholder: 'Describe visible symptoms, growth stage, field conditions, and timeline.',
    notesLabel: 'Diagnosis and action notes',
    notesPlaceholder: 'Add confirmed cause, treatment plan, prevention, or expert review notes.',
    emptyText: 'No crop doctor cases yet. Add a diagnosis case for testing and review.',
    submitLabel: 'Save Crop Case',
    statuses: ['new', 'triage', 'diagnosed', 'verified', 'archived'],
    fields: [
      { key: 'crop', label: 'Crop', required: true, placeholder: 'Tomato, maize, coffee, beans' },
      { key: 'suspectedIssue', label: 'Suspected issue', placeholder: 'Disease, pest, nutrient deficiency, water stress' },
      { key: 'severity', label: 'Severity', type: 'select', options: ['low', 'medium', 'high', 'critical'] },
    ],
  },
  'image-analysis': {
    formTitle: 'Create image analysis review',
    titleLabel: 'Image case name',
    titlePlaceholder: 'Example: Cassava leaf disease image review',
    descriptionLabel: 'Image context',
    descriptionPlaceholder: 'Describe the image source, crop, visible issue, and expected analysis.',
    notesLabel: 'Vision model notes',
    notesPlaceholder: 'Record detection quality, false positives, missing details, or expert correction.',
    emptyText: 'No image analysis reviews yet. Add an image case to validate vision behavior.',
    submitLabel: 'Save Image Review',
    statuses: ['queued', 'reviewing', 'accurate', 'needs retraining', 'archived'],
    fields: [
      { key: 'imageType', label: 'Image type', type: 'select', options: ['plant photo', 'field photo', 'soil photo', 'document scan', 'market image'] },
      { key: 'model', label: 'Preferred model', placeholder: 'Gemini vision, future model, manual review' },
      { key: 'confidenceTarget', label: 'Confidence target', type: 'select', options: ['standard', 'high', 'expert review required'] },
    ],
  },
  research: {
    formTitle: 'Create research request',
    titleLabel: 'Research topic',
    titlePlaceholder: 'Example: Drought tolerant maize varieties in East Africa',
    descriptionLabel: 'Research question',
    descriptionPlaceholder: 'State what the research should answer and what sources matter.',
    notesLabel: 'Findings or reviewer notes',
    notesPlaceholder: 'Summarize source quality, open questions, and final guidance.',
    emptyText: 'No research requests yet. Add a topic for agricultural research tracking.',
    submitLabel: 'Save Research Request',
    statuses: ['requested', 'researching', 'reviewing', 'completed', 'archived'],
    fields: [
      { key: 'scope', label: 'Scope', type: 'select', options: ['quick answer', 'standard research', 'deep research', 'policy review'] },
      { key: 'region', label: 'Region', placeholder: 'Global, Kenya, East Africa, specific market' },
      { key: 'sourcePreference', label: 'Preferred sources', placeholder: 'Research papers, extension guides, market data, government sources' },
    ],
  },
  prompts: {
    formTitle: 'Create prompt asset',
    titleLabel: 'Prompt name',
    titlePlaceholder: 'Example: Pest diagnosis safety prompt',
    descriptionLabel: 'Prompt purpose',
    descriptionPlaceholder: 'Explain where this prompt is used and what behavior it controls.',
    notesLabel: 'Prompt text or change notes',
    notesPlaceholder: 'Paste the prompt, review notes, or required model behavior.',
    emptyText: 'No prompt assets yet. Add system prompts, task prompts, or review notes.',
    submitLabel: 'Save Prompt Asset',
    statuses: ['draft', 'testing', 'approved', 'deprecated', 'archived'],
    fields: [
      { key: 'promptType', label: 'Prompt type', type: 'select', options: ['system', 'task', 'evaluation', 'safety', 'routing'] },
      { key: 'modelFamily', label: 'Model family', placeholder: 'EarthAI routed, Gemini, Groq, fallback provider' },
      { key: 'version', label: 'Version', placeholder: 'v1, v2, 2026.10' },
    ],
  },
  models: {
    formTitle: 'Create model evaluation',
    titleLabel: 'Model test name',
    titlePlaceholder: 'Example: Gemini agriculture reasoning benchmark',
    descriptionLabel: 'Evaluation scope',
    descriptionPlaceholder: 'Describe the task, dataset, benchmark, or scenario being tested.',
    notesLabel: 'Result notes',
    notesPlaceholder: 'Record strengths, failures, latency, cost, and recommendation.',
    emptyText: 'No model evaluations yet. Add a model test to track performance decisions.',
    submitLabel: 'Save Model Test',
    statuses: ['planned', 'running', 'passed', 'failed', 'retired'],
    fields: [
      { key: 'provider', label: 'Provider', type: 'select', options: ['EarthAI routed', 'Gemini', 'Groq', 'OpenRouter', 'DeepSeek', 'Other'] },
      { key: 'modelName', label: 'Model name', placeholder: 'Provider model identifier or internal route name' },
      { key: 'latencyTarget', label: 'Latency target', placeholder: 'Example: under 5 seconds for normal questions' },
    ],
  },
  knowledge: {
    formTitle: 'Create knowledge item',
    titleLabel: 'Knowledge title',
    titlePlaceholder: 'Example: Fall armyworm management guide',
    descriptionLabel: 'Knowledge summary',
    descriptionPlaceholder: 'Summarize the agricultural fact, guide, source, or policy.',
    notesLabel: 'Source and validation notes',
    notesPlaceholder: 'Add citation notes, confidence, reviewer, and update requirements.',
    emptyText: 'No knowledge items yet. Add agricultural content that should inform AI behavior.',
    submitLabel: 'Save Knowledge Item',
    statuses: ['draft', 'verified', 'needs review', 'outdated', 'archived'],
    fields: [
      { key: 'category', label: 'Category', type: 'select', options: ['crop', 'pest', 'disease', 'soil', 'weather', 'market', 'policy', 'general'] },
      { key: 'source', label: 'Source', placeholder: 'Institution, paper, extension service, internal review' },
      { key: 'validUntil', label: 'Review date', placeholder: 'YYYY-MM-DD or review cycle' },
    ],
  },
  documents: {
    formTitle: 'Create document intelligence item',
    titleLabel: 'Document name',
    titlePlaceholder: 'Example: Soil test report parser review',
    descriptionLabel: 'Document purpose',
    descriptionPlaceholder: 'Describe document type, extraction goal, and expected output.',
    notesLabel: 'Extraction or review notes',
    notesPlaceholder: 'Record fields to extract, mistakes, document handling rules, or review outcome.',
    emptyText: 'No document intelligence items yet. Add a document analysis workflow or review.',
    submitLabel: 'Save Document Item',
    statuses: ['queued', 'processing', 'validated', 'needs review', 'archived'],
    fields: [
      { key: 'documentType', label: 'Document type', type: 'select', options: ['soil report', 'invoice', 'farm record', 'research paper', 'extension guide', 'other'] },
      { key: 'dataFields', label: 'Fields to extract', placeholder: 'pH, nitrogen, potassium, recommendations, dates' },
      { key: 'sensitivity', label: 'Sensitivity', type: 'select', options: ['normal', 'confidential', 'restricted'] },
    ],
  },
  conversations: {
    formTitle: 'Create conversation review',
    titleLabel: 'Conversation name',
    titlePlaceholder: 'Example: Irrigation planning answer review',
    descriptionLabel: 'Conversation summary',
    descriptionPlaceholder: 'Summarize the user question, model answer, and review purpose.',
    notesLabel: 'Review notes',
    notesPlaceholder: 'Record answer quality, policy issues, missing details, and improvement actions.',
    emptyText: 'No conversation reviews yet. Add conversations that need evaluation.',
    submitLabel: 'Save Conversation Review',
    statuses: ['open', 'reviewing', 'resolved', 'training candidate', 'archived'],
    fields: [
      { key: 'channel', label: 'Channel', type: 'select', options: ['admin test', 'Pelit API', 'internal QA', 'support review'] },
      { key: 'riskLevel', label: 'Risk level', type: 'select', options: ['low', 'medium', 'high'] },
      { key: 'modelRoute', label: 'Model route', placeholder: 'Simple, normal, complex, vision, document, research' },
    ],
  },
  'ai-usage': {
    formTitle: 'Create usage review',
    titleLabel: 'Usage review name',
    titlePlaceholder: 'Example: October Pelit API usage audit',
    descriptionLabel: 'Usage scope',
    descriptionPlaceholder: 'Describe the period, route, customer system, or usage concern.',
    notesLabel: 'Usage findings',
    notesPlaceholder: 'Record token usage, limits, anomalies, and required action.',
    emptyText: 'No usage reviews yet. Add usage audits, quota checks, or operational notes.',
    submitLabel: 'Save Usage Review',
    statuses: ['monitoring', 'normal', 'investigate', 'limited', 'archived'],
    fields: [
      { key: 'period', label: 'Period', placeholder: 'Daily, weekly, monthly, custom range' },
      { key: 'route', label: 'AI route', placeholder: 'chat, crop doctor, image, document, research' },
      { key: 'limitAction', label: 'Limit action', type: 'select', options: ['none', 'warn', 'throttle', 'block', 'upgrade required'] },
    ],
  },
  usage: {
    formTitle: 'Create usage policy item',
    titleLabel: 'Policy name',
    titlePlaceholder: 'Example: Free plan image analysis quota',
    descriptionLabel: 'Policy description',
    descriptionPlaceholder: 'Describe what is limited, who it applies to, and why.',
    notesLabel: 'Enforcement notes',
    notesPlaceholder: 'Record quota, reset period, exception rules, or enforcement behavior.',
    emptyText: 'No usage policy items yet. Add plan limits or enforcement notes.',
    submitLabel: 'Save Usage Policy',
    statuses: ['draft', 'active', 'review', 'disabled', 'archived'],
    fields: [
      { key: 'plan', label: 'Plan or client', placeholder: 'Free, Starter, Professional, Business, Enterprise, Pelit API' },
      { key: 'metric', label: 'Metric', placeholder: 'AI requests, reports, image analysis, documents, research' },
      { key: 'resetPeriod', label: 'Reset period', type: 'select', options: ['daily', 'monthly', 'annual', 'custom'] },
    ],
  },
  costs: {
    formTitle: 'Create cost record',
    titleLabel: 'Cost record name',
    titlePlaceholder: 'Example: Gemini image analysis cost review',
    descriptionLabel: 'Cost scope',
    descriptionPlaceholder: 'Describe provider, model route, feature, or period.',
    notesLabel: 'Cost notes',
    notesPlaceholder: 'Record expected cost, actual cost, optimization ideas, or action required.',
    emptyText: 'No cost records yet. Add provider cost reviews or budget controls.',
    submitLabel: 'Save Cost Record',
    statuses: ['tracking', 'within budget', 'optimize', 'over budget', 'archived'],
    fields: [
      { key: 'provider', label: 'Provider', type: 'select', options: ['Gemini', 'Groq', 'OpenRouter', 'DeepSeek', 'Other'] },
      { key: 'feature', label: 'Feature', placeholder: 'chat, crop doctor, image, document, research' },
      { key: 'budget', label: 'Budget target', placeholder: 'Monthly or feature level target' },
    ],
  },
  performance: {
    formTitle: 'Create performance check',
    titleLabel: 'Performance check name',
    titlePlaceholder: 'Example: Image analysis latency check',
    descriptionLabel: 'What is being measured',
    descriptionPlaceholder: 'Describe endpoint, feature, model route, or workflow.',
    notesLabel: 'Performance findings',
    notesPlaceholder: 'Record latency, error rate, model quality, and next steps.',
    emptyText: 'No performance checks yet. Add model, API, or UI performance reviews.',
    submitLabel: 'Save Performance Check',
    statuses: ['baseline', 'monitoring', 'good', 'degraded', 'resolved'],
    fields: [
      { key: 'metric', label: 'Metric', type: 'select', options: ['latency', 'accuracy', 'cost', 'error rate', 'uptime', 'throughput'] },
      { key: 'target', label: 'Target', placeholder: 'Example: p95 under 8 seconds' },
      { key: 'currentValue', label: 'Current value', placeholder: 'Latest measured value' },
    ],
  },
  errors: {
    formTitle: 'Create error log',
    titleLabel: 'Error name',
    titlePlaceholder: 'Example: Provider timeout during crop analysis',
    descriptionLabel: 'Error summary',
    descriptionPlaceholder: 'Describe what failed, affected feature, and user impact.',
    notesLabel: 'Resolution notes',
    notesPlaceholder: 'Record root cause, fix, prevention, and follow up.',
    emptyText: 'No error logs yet. Add operational incidents or model failures.',
    submitLabel: 'Save Error Log',
    statuses: ['open', 'investigating', 'mitigated', 'resolved', 'archived'],
    fields: [
      { key: 'severity', label: 'Severity', type: 'select', options: ['low', 'medium', 'high', 'critical'] },
      { key: 'feature', label: 'Affected feature', placeholder: 'API, chat, crop doctor, image, document, research' },
      { key: 'owner', label: 'Owner', placeholder: 'Engineering, AI, operations, support' },
    ],
  },
  recommendations: {
    formTitle: 'Create recommendation review',
    titleLabel: 'Recommendation name',
    titlePlaceholder: 'Example: Fertilizer recommendation safety review',
    descriptionLabel: 'Recommendation context',
    descriptionPlaceholder: 'Describe the recommendation, crop, location, and decision impact.',
    notesLabel: 'Review outcome',
    notesPlaceholder: 'Record validation, risks, corrections, and approval decision.',
    emptyText: 'No recommendation reviews yet. Add decision support outputs for validation.',
    submitLabel: 'Save Recommendation Review',
    statuses: ['draft', 'reviewing', 'approved', 'rejected', 'archived'],
    fields: [
      { key: 'decisionArea', label: 'Decision area', type: 'select', options: ['crop management', 'pest control', 'disease control', 'soil fertility', 'irrigation', 'market', 'risk'] },
      { key: 'confidence', label: 'Confidence', type: 'select', options: ['low', 'medium', 'high', 'expert verified'] },
      { key: 'requiresHumanReview', label: 'Human review', type: 'select', options: ['not required', 'recommended', 'required'] },
    ],
  },
  evaluation: {
    formTitle: 'Create evaluation case',
    titleLabel: 'Evaluation name',
    titlePlaceholder: 'Example: Crop disease answer benchmark',
    descriptionLabel: 'Evaluation objective',
    descriptionPlaceholder: 'Describe what capability is being tested and acceptance criteria.',
    notesLabel: 'Evaluation results',
    notesPlaceholder: 'Record score, failures, reviewer notes, and improvement actions.',
    emptyText: 'No evaluation cases yet. Add tests for model and feature quality.',
    submitLabel: 'Save Evaluation Case',
    statuses: ['planned', 'running', 'passed', 'failed', 'archived'],
    fields: [
      { key: 'testType', label: 'Test type', type: 'select', options: ['manual QA', 'model benchmark', 'safety test', 'regression test', 'integration test'] },
      { key: 'acceptanceCriteria', label: 'Acceptance criteria', placeholder: 'Minimum score, required facts, no unsafe advice' },
      { key: 'reviewer', label: 'Reviewer', placeholder: 'Reviewer name or team' },
    ],
  },
  content: {
    formTitle: 'Create content item',
    titleLabel: 'Content title',
    titlePlaceholder: 'Example: Maize planting guide update',
    descriptionLabel: 'Content summary',
    descriptionPlaceholder: 'Describe the article, guide, product text, or help content.',
    notesLabel: 'Editorial notes',
    notesPlaceholder: 'Record draft text, approval notes, publishing notes, or localization needs.',
    emptyText: 'No content items yet. Add agricultural content and publishing tasks.',
    submitLabel: 'Save Content Item',
    statuses: ['draft', 'review', 'approved', 'published', 'archived'],
    fields: [
      { key: 'contentType', label: 'Content type', type: 'select', options: ['guide', 'article', 'prompt support', 'help text', 'policy', 'release note'] },
      { key: 'audience', label: 'Audience', placeholder: 'Farmers, agronomists, admins, Pelit users, partners' },
      { key: 'language', label: 'Language', placeholder: 'English, Swahili, French, other' },
    ],
  },
  'api-keys': {
    formTitle: 'Create integration note',
    titleLabel: 'Integration name',
    titlePlaceholder: 'Example: Pelit production API integration',
    descriptionLabel: 'Integration purpose',
    descriptionPlaceholder: 'Describe what system will use the API and allowed capability.',
    notesLabel: 'Operational notes',
    notesPlaceholder: 'Record key rotation schedule, origin restrictions, and backend owner.',
    emptyText: 'No integration notes yet. Use the API Keys page to create real keys.',
    submitLabel: 'Save Integration Note',
    statuses: ['planned', 'active', 'rotate', 'suspended', 'archived'],
    fields: [
      { key: 'environment', label: 'Environment', type: 'select', options: ['development', 'staging', 'production'] },
      { key: 'owner', label: 'Owner', placeholder: 'Internal team or trusted backend owner' },
      { key: 'scopes', label: 'Allowed scopes', placeholder: 'chat, crop-doctor, image-analysis, document-analysis, research' },
    ],
  },
};

function getSectionConfig(section: string): SectionConfig {
  return sectionConfigs[section] || {
    formTitle: 'Create admin record',
    titleLabel: 'Title',
    titlePlaceholder: 'Record title',
    descriptionLabel: 'Description',
    descriptionPlaceholder: 'Describe the item.',
    notesLabel: 'Notes or configuration',
    notesPlaceholder: 'Add internal notes, configuration, or review details.',
    emptyText: 'No records yet. Add the first internal item for this section.',
    submitLabel: 'Save Record',
    statuses: defaultStatuses,
    fields: [],
  };
}

function createInitialContent(fields: FieldConfig[]) {
  return fields.reduce<Record<string, string>>((current, field) => ({ ...current, [field.key]: field.options?.[0] || '' }), {});
}

export default function AdminWorkspaceClient({ section, title, description }: { section: string; title: string; description: string }) {
  const config = useMemo(() => getSectionConfig(section), [section]);
  const [items, setItems] = useState<WorkspaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', description: '', status: config.statuses[0] || 'active', notes: '', content: createInitialContent(config.fields) });

  useEffect(() => {
    setForm({ title: '', description: '', status: config.statuses[0] || 'active', notes: '', content: createInitialContent(config.fields) });
  }, [config]);

  async function loadItems() {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/admin/workspace?section=${encodeURIComponent(section)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to load records');
      setItems(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load records');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadItems();
  }, [section]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const response = await fetch('/api/admin/workspace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          section,
          title: form.title,
          description: form.description,
          status: form.status,
          content: { ...form.content, notes: form.notes },
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Unable to save record');
      setItems((current) => [data.item, ...current]);
      setForm({ title: '', description: '', status: config.statuses[0] || 'active', notes: '', content: createInitialContent(config.fields) });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save record');
    } finally {
      setSaving(false);
    }
  }

  function updateContent(key: string, value: string) {
    setForm((current) => ({ ...current, content: { ...current.content, [key]: value } }));
  }

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ margin: 0, color: 'var(--text, #0f172a)', fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em' }}>{title}</h1>
        <p style={{ color: 'var(--muted, #64748b)', marginTop: 8, maxWidth: 780, lineHeight: 1.7 }}>{description}</p>
      </div>

      {error && <div style={{ marginBottom: 16, padding: 12, borderRadius: 10, border: '1px solid #fecaca', background: '#fef2f2', color: '#b91c1c', fontSize: 13 }}>{error}</div>}

      <div style={workspaceGridStyle}>
        <form onSubmit={submit} style={{ padding: 18, border: '1px solid var(--border, #e5e7eb)', borderRadius: 12, background: 'var(--surface, #fff)', alignSelf: 'start' }}>
          <h2 style={{ margin: '0 0 14px', color: 'var(--text, #0f172a)', fontSize: 15 }}>{config.formTitle}</h2>
          <label style={labelStyle}>{config.titleLabel}<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={config.titlePlaceholder} style={inputStyle} /></label>
          <label style={labelStyle}>Status<select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} style={inputStyle}>{config.statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></label>
          <label style={labelStyle}>{config.descriptionLabel}<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder={config.descriptionPlaceholder} rows={3} style={inputStyle} /></label>
          {config.fields.map((field) => (
            <label key={field.key} style={labelStyle}>
              {field.label}
              {field.type === 'select' ? (
                <select required={field.required} value={form.content[field.key] || ''} onChange={(e) => updateContent(field.key, e.target.value)} style={inputStyle}>
                  {(field.options || []).map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea required={field.required} value={form.content[field.key] || ''} onChange={(e) => updateContent(field.key, e.target.value)} placeholder={field.placeholder} rows={field.rows || 4} style={inputStyle} />
              ) : (
                <input required={field.required} type={field.type === 'number' ? 'number' : 'text'} value={form.content[field.key] || ''} onChange={(e) => updateContent(field.key, e.target.value)} placeholder={field.placeholder} style={inputStyle} />
              )}
            </label>
          ))}
          <label style={labelStyle}>{config.notesLabel}<textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder={config.notesPlaceholder} rows={6} style={inputStyle} /></label>
          <button disabled={saving} style={buttonStyle}>{saving ? 'Saving...' : config.submitLabel}</button>
        </form>

        <div style={{ display: 'grid', gap: 10 }}>
          {loading ? <div style={emptyStyle}>Loading records...</div> : items.length === 0 ? <div style={emptyStyle}>{config.emptyText}</div> : items.map((item) => (
            <article key={item.id} style={{ padding: 16, border: '1px solid var(--border, #e5e7eb)', borderRadius: 12, background: 'var(--surface, #fff)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 8, alignItems: 'flex-start' }}>
                <h3 style={{ margin: 0, color: 'var(--text, #0f172a)', fontSize: 15 }}>{item.title}</h3>
                <span style={{ color: 'var(--muted, #64748b)', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{item.status}</span>
              </div>
              {item.description && <p style={{ margin: '0 0 10px', color: 'var(--muted, #64748b)', fontSize: 13, lineHeight: 1.6 }}>{item.description}</p>}
              <div style={detailGridStyle}>
                {config.fields.map((field) => {
                  const value = item.content?.[field.key];
                  if (typeof value !== 'string' || !value) return null;
                  return <div key={field.key} style={detailStyle}><strong>{field.label}</strong><span>{value}</span></div>;
                })}
              </div>
              {typeof item.content?.notes === 'string' && item.content.notes && <pre style={{ margin: '10px 0 0', whiteSpace: 'pre-wrap', color: 'var(--muted, #64748b)', fontSize: 12.5, lineHeight: 1.6 }}>{String(item.content.notes)}</pre>}
              <div style={{ marginTop: 12, color: 'var(--muted, #64748b)', fontSize: 11 }}>Updated {new Date(item.updated_at).toLocaleString()}</div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

const workspaceGridStyle: CSSProperties = { display: 'grid', gridTemplateColumns: 'minmax(0, 420px) minmax(0, 1fr)', gap: 18 };
const labelStyle: CSSProperties = { display: 'grid', gap: 7, marginBottom: 12, color: 'var(--muted, #64748b)', fontSize: 12, fontWeight: 800 };
const inputStyle: CSSProperties = { width: '100%', border: '1px solid var(--border, #e5e7eb)', borderRadius: 8, padding: '10px 11px', background: 'var(--surface, #fff)', color: 'var(--text, #0f172a)', font: 'inherit' };
const buttonStyle: CSSProperties = { width: '100%', border: 0, borderRadius: 9, padding: '11px 12px', background: '#111827', color: '#fff', fontWeight: 800, cursor: 'pointer' };
const emptyStyle: CSSProperties = { padding: 18, border: '1px dashed var(--border, #e5e7eb)', borderRadius: 12, color: 'var(--muted, #64748b)', background: 'var(--surface, #fff)', fontSize: 13 };
const detailGridStyle: CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8, marginTop: 10 };
const detailStyle: CSSProperties = { display: 'grid', gap: 3, padding: 10, border: '1px solid var(--border, #e5e7eb)', borderRadius: 8, color: 'var(--muted, #64748b)', fontSize: 12 };
