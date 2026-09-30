import Link from 'next/link';

const tools = [
  ['AI Chat Testing', '/admin/intelligence', 'Test Agriculture answers, model routing, response formatting, and safety behavior.'],
  ['Crop Doctor Testing', '/admin/crop-doctor', 'Validate crop health, pest, disease, nutrient, and field issue workflows.'],
  ['Image Analysis', '/admin/image-analysis', 'Test plant and field image interpretation through the Intelligence E AI layer.'],
  ['Agricultural Research', '/admin/research', 'Run agricultural research checks and review response quality.'],
  ['AI Prompts', '/admin/prompts', 'Manage system instructions, safety rules, and answer style for Agriculture AI.'],
  ['Model Selection', '/admin/models', 'Review provider routing, fallback behavior, latency, and model choices.'],
  ['Agricultural Knowledge', '/admin/knowledge', 'Organize domain knowledge used by Intelligence E Agriculture.'],
  ['Documents', '/admin/documents', 'Review document intelligence and agriculture document analysis behavior.'],
  ['Testing Conversations', '/admin/conversations', 'Inspect AI testing conversations and quality outcomes.'],
  ['AI Usage', '/admin/ai-usage', 'Monitor AI usage volume from admin testing and Pelit API integrations.'],
  ['AI Costs', '/admin/costs', 'Track AI spend by provider, route, feature, and period.'],
  ['Model Performance', '/admin/performance', 'Evaluate latency, quality, failure rate, and routing accuracy.'],
  ['Error Logs', '/admin/errors', 'Review AI, API, auth, provider, and operational errors.'],
  ['Recommendations', '/admin/recommendations', 'Review generated agriculture recommendations before reuse.'],
  ['Evaluation', '/admin/evaluation', 'Run regression tests and quality checks for Agriculture AI.'],
  ['Content Management', '/admin/content', 'Manage agriculture content and support materials used by Intelligence E.'],
];

export default function AdminDashboard() {
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ color: 'var(--text, #0f172a)', fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em', margin: 0 }}>Intelligence E Agriculture Admin</h1>
        <p style={{ color: 'var(--muted, #64748b)', fontSize: 13.5, lineHeight: 1.7, maxWidth: 820, marginTop: 8 }}>
          This web application is now an internal Earth AI administration portal. Customer and normal user access belongs in Pelit through secured server side API integration.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 14 }}>
        {tools.map(([label, href, desc]) => (
          <Link key={href} href={href} style={{ display: 'block', padding: 18, borderRadius: 12, border: '1px solid var(--border, #e5e7eb)', background: 'var(--surface, #fff)', textDecoration: 'none' }}>
            <div style={{ color: 'var(--text, #0f172a)', fontSize: 14, fontWeight: 800, marginBottom: 7 }}>{label}</div>
            <div style={{ color: 'var(--muted, #64748b)', fontSize: 12.5, lineHeight: 1.55 }}>{desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
