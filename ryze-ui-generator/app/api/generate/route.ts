import { NextRequest, NextResponse } from 'next/server';

interface AgentResult {
  plan: {
    layout: string;
    components: string[];
    reasoning: string;
  };
  code: {
    code: string;
    componentUsage: string[];
  };
  explanation: {
    decisions: string[];
    componentChoices: string;
    layoutRationale: string;
  };
}

/* =========================
   PROMPTS
========================= */

const PLANNER_PROMPT = `You are a UI planner.

RULES:
1. Only use components: Button, Card, Input, Table, Modal, Sidebar, Navbar, Chart
2. Output ONLY valid JSON

User Request: {userIntent}
Current Code: {currentCode}

Return:
{
  "layout": "",
  "components": [],
  "reasoning": ""
}`;


const GENERATOR_PROMPT = `You are a React UI generator.

STRICT RULES:
- Only use: Button, Card, Input, Table, Modal, Sidebar, Navbar, Chart
- Import exactly:
import { Button, Card, Input, Table, Modal, Sidebar, Navbar, Chart } from '@/components/ComponentLibrary';
- No inline styles
- No new components
- Component name must be GeneratedUI
- Export default GeneratedUI

IMPORTANT DATA RULES:
- title, subtitle, label must be strings
- items arrays must contain plain objects
- Sidebar icons must be strings ("home", "user", etc.)
- DO NOT use JSX inside data objects
- JSX allowed only inside component children

PLAN:
{plan}

Current Code:
{currentCode}

Output ONLY the full component code.`;


const EXPLAINER_PROMPT = `Explain the UI decisions.

PLAN: {plan}
CODE: {code}

Return JSON:
{
  "decisions": [],
  "componentChoices": "",
  "layoutRationale": ""
}`;


/* =========================
   AI CALL
========================= */

async function callAI(prompt: string, apiKey: string): Promise<string> {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-120b',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 4000,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`AI Error: ${err}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}


/* =========================
   HELPERS
========================= */

function cleanResponse(text: string) {
  let t = text.trim();
  if (t.startsWith('```')) {
    t = t.replace(/^```[a-z]*\n/, '').replace(/\n```$/, '');
  }
  return t;
}

function extractComponentUsage(code: string): string[] {
  const allowed = [
    'Button',
    'Card',
    'Input',
    'Table',
    'Modal',
    'Sidebar',
    'Navbar',
    'Chart',
  ];

  const used = new Set<string>();

  for (const c of allowed) {
    const regex = new RegExp(`<${c}[\\s>]`);
    if (regex.test(code)) used.add(c);
  }

  return Array.from(used);
}

/**
 * PRODUCTION SAFETY
 * Instead of throwing error,
 * this removes JSX from data fields
 */
function sanitizeGeneratedCode(code: string): string {
  // Replace JSX used in label/title with strings
  code = code.replace(/label:\s*<[^>]+>/g, 'label: "Item"');
  code = code.replace(/title:\s*<[^>]+>/g, 'title: "Title"');
  code = code.replace(/subtitle:\s*<[^>]+>/g, 'subtitle: "Subtitle"');
  code = code.replace(/footer:\s*<[^>]+>/g, 'footer: "Footer"');

  return code;
}


/* =========================
   ROUTE
========================= */

export async function POST(req: NextRequest) {
  try {
    const { userIntent, currentCode, apiKey } = await req.json();

    if (!apiKey) {
      return NextResponse.json({ error: 'API key required' }, { status: 400 });
    }

    if (!userIntent) {
      return NextResponse.json({ error: 'User intent required' }, { status: 400 });
    }

    /* -------- Step 1: Planner -------- */
    const planPrompt = PLANNER_PROMPT
      .replace('{userIntent}', userIntent)
      .replace('{currentCode}', currentCode || 'None');

    const planRaw = await callAI(planPrompt, apiKey);
    const plan = JSON.parse(cleanResponse(planRaw));


    /* -------- Step 2: Generator -------- */
    const genPrompt = GENERATOR_PROMPT
      .replace('{plan}', JSON.stringify(plan, null, 2))
      .replace('{currentCode}', currentCode || 'None');

    let code = cleanResponse(await callAI(genPrompt, apiKey));

    // Sanitize AI mistakes (IMPORTANT)
    code = sanitizeGeneratedCode(code);

    const componentUsage = extractComponentUsage(code);


    /* -------- Step 3: Explainer -------- */
    const explainPrompt = EXPLAINER_PROMPT
      .replace('{plan}', JSON.stringify(plan))
      .replace('{code}', code);

    const explanationRaw = await callAI(explainPrompt, apiKey);
    const explanation = JSON.parse(cleanResponse(explanationRaw));


    const result: AgentResult = {
      plan,
      code: {
        code,
        componentUsage,
      },
      explanation,
    };

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Agent error:', error);
    return NextResponse.json(
      { error: error.message || 'Generation failed' },
      { status: 500 }
    );
  }
}
