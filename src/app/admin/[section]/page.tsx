const featureCopy: Record<string, { title: string; description: string }> = {
  intelligence: { title: 'AI Chat Testing', description: 'Internal console for testing Agriculture AI answers, routing, formatting, and safety behavior.' },
  'crop-doctor': { title: 'Crop Doctor Testing', description: 'Internal test bench for crop health, pest, disease, nutrient, and field issue workflows.' },
  'image-analysis': { title: 'Image Analysis', description: 'Internal image intelligence area for testing plant, crop, pest, disease, and field photo analysis.' },
  research: { title: 'Agricultural Research', description: 'Internal research workspace for agriculture intelligence checks and response review.' },
  prompts: { title: 'AI Prompts', description: 'Internal prompt governance for system instructions, safety rules, response format, and product behavior.' },
  models: { title: 'Model Selection', description: 'Internal model routing and provider control without exposing provider names to external users.' },
  knowledge: { title: 'Agricultural Knowledge', description: 'Internal knowledge management for Agriculture references, decision support, and domain intelligence.' },
  documents: { title: 'Documents', description: 'Internal document intelligence area for reviewing agricultural documents and extracted context.' },
  conversations: { title: 'Testing Conversations', description: 'Internal archive for AI test conversations, response review, and regression checks.' },
  costs: { title: 'AI Costs', description: 'Internal cost monitoring for model calls, provider usage, feature usage, and API consumption.' },
  performance: { title: 'Model Performance', description: 'Internal performance review for latency, quality, failure rate, model routing, and response consistency.' },
  errors: { title: 'Error Logs', description: 'Internal error review for AI calls, API integration, authentication, provider failures, and operational incidents.' },
  recommendations: { title: 'Recommendations', description: 'Internal review area for generated agriculture recommendations before reuse in Pelit workflows.' },
  evaluation: { title: 'Evaluation and Testing', description: 'Internal Agriculture AI evaluation area for test sets, answer quality, regression review, and release readiness.' },
  content: { title: 'Agricultural Content Management', description: 'Internal content management for agriculture copy, product guidance, and domain materials.' },
};

export default async function AdminFeaturePage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const feature = featureCopy[section] || { title: 'Admin Feature', description: 'Internal Earth AI administration section.' };

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h1 style={{ margin: 0, color: 'var(--text, #0f172a)', fontSize: 24, fontWeight: 800, letterSpacing: '-0.03em' }}>{feature.title}</h1>
        <p style={{ color: 'var(--muted, #64748b)', marginTop: 8, maxWidth: 760, lineHeight: 1.7 }}>{feature.description}</p>
      </div>
      <div style={{ padding: 22, border: '1px solid var(--border, #e5e7eb)', borderRadius: 12, background: 'var(--surface, #fff)' }}>
        <div style={{ color: 'var(--text, #0f172a)', fontWeight: 800, marginBottom: 10 }}>Internal control surface</div>
        <p style={{ margin: 0, color: 'var(--muted, #64748b)', fontSize: 13, lineHeight: 1.7 }}>
          This section is reserved for Earth AI administrators. It is not exposed as a customer workflow in the web app. Production data should be connected through secured APIs, audit logging, role checks, and server side Pelit integration.
        </p>
      </div>
    </div>
  );
}
