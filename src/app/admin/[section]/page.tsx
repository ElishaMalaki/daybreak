import AdminWorkspaceClient from '../AdminWorkspaceClient';

const featureCopy: Record<string, { title: string; description: string }> = {
  intelligence: { title: 'AI Chat Testing', description: 'Create and review Agriculture AI chat tests, response examples, routing checks, and safety observations.' },
  'crop-doctor': { title: 'Crop Doctor Testing', description: 'Track crop health, pest, disease, nutrient, and field issue test cases before they are used through Pelit.' },
  'image-analysis': { title: 'Image Analysis', description: 'Manage image intelligence test cases for plant, crop, pest, disease, and field photo analysis.' },
  research: { title: 'Agricultural Research', description: 'Maintain internal agricultural research checks, source review notes, and response quality observations.' },
  prompts: { title: 'AI Prompts', description: 'Manage internal prompt instructions, answer style rules, safety guidance, and Agriculture AI behavior notes.' },
  models: { title: 'Model Selection', description: 'Track model routing decisions, fallback behavior, provider performance observations, and model test notes.' },
  knowledge: { title: 'Agricultural Knowledge', description: 'Organize domain knowledge, crop guidance, pest and disease material, and decision support references.' },
  documents: { title: 'Documents', description: 'Track document intelligence tests, extracted context reviews, and agricultural document analysis notes.' },
  conversations: { title: 'Testing Conversations', description: 'Record AI testing conversations, response quality reviews, and regression examples.' },
  'ai-usage': { title: 'AI Usage', description: 'Track AI usage observations from admin testing and Pelit API integrations.' },
  usage: { title: 'AI Usage', description: 'Track AI usage observations from admin testing and Pelit API integrations.' },
  costs: { title: 'AI Costs', description: 'Track AI cost observations by provider, route, feature, and period.' },
  performance: { title: 'Model Performance', description: 'Review latency, quality, failure rate, response consistency, and routing accuracy.' },
  errors: { title: 'Error Logs', description: 'Record AI, API, integration, provider, and operational errors for internal review.' },
  recommendations: { title: 'Recommendations', description: 'Review generated agriculture recommendations before reuse in Pelit workflows.' },
  evaluation: { title: 'Evaluation and Testing', description: 'Run and record Agriculture AI test sets, answer quality reviews, regression checks, and release readiness notes.' },
  content: { title: 'Agricultural Content Management', description: 'Manage agriculture content, product guidance, support copy, and domain materials used by Intelligence E.' },
};

export default async function AdminFeaturePage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const feature = featureCopy[section] || { title: 'Admin Feature', description: 'Internal Earth AI administration section.' };
  return <AdminWorkspaceClient section={section} title={feature.title} description={feature.description} />;
}
