// ============================================
// AI AGENT SYSTEM
// Planner → Generator → Explainer (Production Safe)
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

export const PLANNER_PROMPT = `You are a UI planner.

RULES:
1. Allowed components only:
Button, Card, Input, Table, Modal, Sidebar, Navbar, Chart
2. No custom CSS
3. Output JSON only

User Request: {userIntent}
Current Code: {currentCode}

Output:
{
  "layout": "",
  "components": [],
  "reasoning": ""
}
`;

// ============================================
// STEP 2: GENERATOR (Production Safe)
// ============================================

export const GENERATOR_PROMPT = `
You are a strict React UI generator for Ryze.

Your code runs inside a sandbox preview.
If the code crashes, the preview will fail.

STRICT RULES:

IMPORTS (exactly):

import React, { useState, useEffect } from 'react';
import { Button, Card, Input, Table, Modal, Sidebar, Navbar, Chart } from '@/components/ComponentLibrary';

COMPONENT:

export default function GeneratedUI() {
  return (...);
}

SAFETY RULES:

1. Allowed components only:
Button, Card, Input, Table, Modal, Sidebar, Navbar, Chart

2. children must be:
- string
- JSX
- array
NEVER plain object

WRONG:
<Card>{ {text:"Hi"} }</Card>

CORRECT:
<Card>Hi</Card>

3. ReactNode props must NOT receive objects:
- children
- footer
- title
- subtitle

Correct:
<Card footer={<Button>Save</Button>} />

4. Always return a single root element.

5. When mapping arrays → always add key.

6. No inline styles.
No custom className.

7. Chart data must be array:
const data = [{ name:"Jan", value:100 }]

8. Sidebar items format:
[{ id:'home', label:'Home', icon:'home' }]

9. Navbar items format:
[{ label:'Home', onClick:()=>{} }]

OUTPUT RULES:

- ONLY React code
- No markdown
- No backticks
- No explanation
- No comments

PLAN:
{plan}

Current Code:
{currentCode}
`;

// ============================================
// STEP 3: EXPLAINER
// ============================================

export const EXPLAINER_PROMPT = `Explain the UI decisions.

PLAN: {plan}
CODE: {code}

Return JSON:
{
  "decisions": [],
  "componentChoices": "",
  "layoutRationale": ""
}
`;

// ============================================
// AGENT ORCHESTRATOR
// ============================================

export async function runAgent(
  userIntent: string,
  currentCode: string = "",
  apiKey: string
): Promise<AgentResult> {

  // ---------- Planner ----------
  const plannerPrompt = PLANNER_PROMPT
    .replace("{userIntent}", userIntent)
    .replace("{currentCode}", currentCode || "None");

  const planResponse = await callClaude(plannerPrompt, apiKey);
  const plan: PlanStep = JSON.parse(cleanJsonResponse(planResponse));

  // ---------- Generator ----------
  const generatorPrompt = GENERATOR_PROMPT
    .replace("{plan}", JSON.stringify(plan, null, 2))
    .replace("{currentCode}", currentCode || "None");

  let codeResponse = await callClaude(generatorPrompt, apiKey);
  let code = sanitizeCode(codeResponse);

  const componentUsage = extractComponentUsage(code);
  validateComponents(componentUsage);

  // ---------- Explainer ----------
  const explainerPrompt = EXPLAINER_PROMPT
    .replace("{plan}", JSON.stringify(plan, null, 2))
    .replace("{code}", code);

  const explanationResponse = await callClaude(explainerPrompt, apiKey);
  const explanation: Explanation = JSON.parse(
    cleanJsonResponse(explanationResponse)
  );

  return {
    plan,
    code: {
      code,
      componentUsage,
    },
    explanation,
  };
}

// ============================================
// API CALL
// ============================================

async function callClaude(prompt: string, apiKey: string): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      temperature: 0.2,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error(`Claude API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

// ============================================
// CLEAN / SANITIZE AI CODE
// ============================================

function sanitizeCode(response: string): string {
  let code = response.trim();

  // Remove markdown
  if (code.startsWith("```")) {
    code = code.replace(/^```[a-z]*\n/, "").replace(/\n```$/, "");
  }

  // Ensure default export exists
  if (!code.includes("export default")) {
    code += "\nexport default GeneratedUI;";
  }

  return code;
}

function cleanJsonResponse(response: string): string {
  let cleaned = response.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```json?\n/, "").replace(/\n```$/, "");
  }
  return cleaned;
}

// ============================================
// VALIDATION
// ============================================

function extractComponentUsage(code: string): string[] {
  const allowed = [
    "Button",
    "Card",
    "Input",
    "Table",
    "Modal",
    "Sidebar",
    "Navbar",
    "Chart",
  ];

  const used = new Set<string>();

  for (const comp of allowed) {
    const regex = new RegExp(`<${comp}[\\s>]`, "g");
    if (regex.test(code)) used.add(comp);
  }

  return Array.from(used);
}

function validateComponents(usage: string[]) {
  const allowed = [
    "Button",
    "Card",
    "Input",
    "Table",
    "Modal",
    "Sidebar",
    "Navbar",
    "Chart",
  ];

  for (const c of usage) {
    if (!allowed.includes(c)) {
      throw new Error(`Invalid component: ${c}`);
    }
  }
}

// ============================================
// EDIT DETECTOR
// ============================================

export function isIncrementalEdit(userIntent: string): boolean {
  const words = [
    "change",
    "modify",
    "update",
    "add",
    "remove",
    "delete",
    "edit",
    "fix",
  ];
  const text = userIntent.toLowerCase();
  return words.some((w) => text.includes(w));
}
