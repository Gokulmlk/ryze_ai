// ============================================
// AI AGENT SYSTEM
// Multi-step reasoning: Planner → Generator → Explainer
// ============================================

export interface PlanStep {
  layout: string;
  components: string[];
  reasoning: string;
}

export interface GeneratedCode {
  code: string;
  componentUsage: string[];
}

export interface Explanation {
  decisions: string[];
  componentChoices: string;
  layoutRationale: string;
}

export interface AgentResult {
  plan: PlanStep;
  code: GeneratedCode;
  explanation: Explanation;
}

// ============================================
// STEP 1: PLANNER
// ============================================
export const PLANNER_PROMPT = `You are a UI planner. Your job is to analyze user intent and create a structured plan.

RULES:
1. You can ONLY use these components: Button, Card, Input, Table, Modal, Sidebar, Navbar, Chart
2. NO inline styles, NO custom CSS, NO new components
3. Output ONLY valid JSON

Analyze the user's request and output a JSON plan with this structure:
{
  "layout": "describe the overall layout structure",
  "components": ["list", "of", "component", "names"],
  "reasoning": "explain why this layout and these components"
}

User Request: {userIntent}

Current Code (if editing): {currentCode}

Output ONLY the JSON, nothing else.`;

// ============================================
// STEP 2: GENERATOR
// ============================================
export const GENERATOR_PROMPT = `You are a UI code generator. Convert the plan into React code.

STRICT RULES:
1. ONLY use these components: Button, Card, Input, Table, Modal, Sidebar, Navbar, Chart
2. Import them from './ComponentLibrary'
3. NO inline styles, NO style prop, NO className except those built into components
4. NO creating new components
5. Use React hooks (useState, etc.) as needed
6. Return a VALID React functional component

ALLOWED COMPONENTS AND THEIR PROPS:

Button:
- children, onClick, variant ('primary'|'secondary'|'danger'|'ghost'), size ('small'|'medium'|'large'), disabled

Card:
- children, title, subtitle, footer, variant ('default'|'elevated'|'bordered')

Input:
- label, placeholder, type ('text'|'email'|'password'|'number'), value, onChange, error, disabled

Table:
- headers (string[]), rows (string[][]), striped (boolean)

Modal:
- isOpen, onClose, title, children, footer

Sidebar:
- isOpen, items (Array<{icon: string, label: string, id: string}>), onItemClick

Navbar:
- title, items (Array<{label: string, onClick}>), onMenuClick

Chart:
- type ('line'|'bar'), data (any[]), xKey, yKey, title

PLAN:
{plan}

Current Code (if modifying): {currentCode}

IMPORTANT: 
- If modifying existing code, make MINIMAL changes
- Preserve existing functionality
- Only change what the user requested
- Keep the same component instances where possible

Output ONLY the complete React component code, starting with imports. No explanations, no markdown.`;

// ============================================
// STEP 3: EXPLAINER
// ============================================
export const EXPLAINER_PROMPT = `You are a UI decision explainer. Explain what was done and why.

PLAN: {plan}
GENERATED CODE: {code}

Analyze the plan and code, then output a JSON with this structure:
{
  "decisions": ["key decision 1", "key decision 2", ...],
  "componentChoices": "explain which components were chosen and why",
  "layoutRationale": "explain the overall layout strategy"
}

Output ONLY the JSON, nothing else.`;

// ============================================
// AGENT ORCHESTRATOR
// ============================================
export async function runAgent(
  userIntent: string,
  currentCode: string = '',
  apiKey: string
): Promise<AgentResult> {
  
  // STEP 1: PLANNER
  console.log('🧠 Running Planner...');
  const plannerPrompt = PLANNER_PROMPT
    .replace('{userIntent}', userIntent)
    .replace('{currentCode}', currentCode || 'None - generating from scratch');
  
  const planResponse = await callClaude(plannerPrompt, apiKey);
  const plan: PlanStep = JSON.parse(cleanJsonResponse(planResponse));
  
  console.log('✅ Plan created:', plan);
  
  // STEP 2: GENERATOR
  console.log('🔧 Running Generator...');
  const generatorPrompt = GENERATOR_PROMPT
    .replace('{plan}', JSON.stringify(plan, null, 2))
    .replace('{currentCode}', currentCode || 'None - generating from scratch');
  
  const codeResponse = await callClaude(generatorPrompt, apiKey);
  const code = codeResponse.trim();
  
  // Extract component usage from code
  const componentUsage = extractComponentUsage(code);
  
  console.log('✅ Code generated, components used:', componentUsage);
  
  // Validate components
  validateComponents(componentUsage);
  
  // STEP 3: EXPLAINER
  console.log('📝 Running Explainer...');
  const explainerPrompt = EXPLAINER_PROMPT
    .replace('{plan}', JSON.stringify(plan, null, 2))
    .replace('{code}', code);
  
  const explanationResponse = await callClaude(explainerPrompt, apiKey);
  const explanation: Explanation = JSON.parse(cleanJsonResponse(explanationResponse));
  
  console.log('✅ Explanation generated');
  
  return {
    plan,
    code: {
      code,
      componentUsage
    },
    explanation
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

async function callClaude(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  });
  
  if (!response.ok) {
    throw new Error(`Claude API error: ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.content[0].text;
}

function cleanJsonResponse(response: string): string {
  // Remove markdown code blocks if present
  let cleaned = response.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\n/, '').replace(/\n```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\n/, '').replace(/\n```$/, '');
  }
  return cleaned.trim();
}

function extractComponentUsage(code: string): string[] {
  const allowedComponents = ['Button', 'Card', 'Input', 'Table', 'Modal', 'Sidebar', 'Navbar', 'Chart'];
  const used: Set<string> = new Set();
  
  for (const component of allowedComponents) {
    // Check if component is used in JSX
    const regex = new RegExp(`<${component}[\\s>]`, 'g');
    if (regex.test(code)) {
      used.add(component);
    }
  }
  
  return Array.from(used);
}

function validateComponents(componentUsage: string[]): void {
  const allowedComponents = ['Button', 'Card', 'Input', 'Table', 'Modal', 'Sidebar', 'Navbar', 'Chart'];
  
  for (const component of componentUsage) {
    if (!allowedComponents.includes(component)) {
      throw new Error(`Invalid component used: ${component}. Only allowed: ${allowedComponents.join(', ')}`);
    }
  }
}

// ============================================
// MODIFICATION DETECTOR
// For incremental edits
// ============================================
export function isIncrementalEdit(userIntent: string): boolean {
  const incrementalKeywords = [
    'change', 'modify', 'update', 'add', 'remove', 'delete',
    'make it', 'adjust', 'fix', 'alter', 'edit', 'replace'
  ];
  
  const intent = userIntent.toLowerCase();
  return incrementalKeywords.some(keyword => intent.includes(keyword));
}
