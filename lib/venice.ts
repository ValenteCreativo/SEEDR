/**
 * SEEDR — Venice AI Integration
 * Agent-powered milestone evaluation for builder accountability
 * Zero simulation — real inference only
 */

const VENICE_ENDPOINT = 'https://api.venice.ai/api/v1/chat/completions'
const VENICE_MODEL = 'llama-3.3-70b'

const SYSTEM_PROMPT = `You are SeedrAgent, an autonomous accountability agent evaluating Web3 project milestones.
You analyze builder commitments and evidence to determine if milestones were delivered.
You are fair, precise, and protect backers from unaccountable builders.
Respond ONLY with valid JSON — no markdown, no explanation, no preamble.`

export interface MilestoneEvaluation {
  milestone_title: string
  status: 'delivered' | 'partial' | 'missed' | 'pending'
  confidence: number
  evidence_found: string
  agent_note: string
}

export interface AgentEvaluation {
  project_id: string
  project_title: string
  overall_score: number        // 0-100
  seed_score_delta: number     // how much seed score changes
  milestones: MilestoneEvaluation[]
  verdict: string              // one-line summary
  recommendation: 'continue_backing' | 'hold' | 'withdraw'
  evaluated_at: string
  model_used: 'venice-llama-3.3-70b'
  simulated: false
}

export async function evaluateProject(project: {
  id: string
  title: string
  tagline: string
  category: string
  current_backed_sol: number
  funding_goal_sol: number
  milestones: Array<{ title: string; due_date: string; criteria: string; evidence?: string }>
}): Promise<AgentEvaluation> {
  const apiKey = process.env.VENICE_API_KEY
  if (!apiKey) throw new Error('[SEEDR] VENICE_API_KEY not set — agent evaluation requires real inference')

  const now = new Date().toISOString()
  const prompt = `Evaluate this Web3 project's milestone delivery:

Project: "${project.title}" (${project.category})
Tagline: ${project.tagline}
Funded: ${project.current_backed_sol} / ${project.funding_goal_sol} SOL (${Math.round(project.current_backed_sol/project.funding_goal_sol*100)}%)
Evaluated at: ${now}

Milestones:
${project.milestones.map((m, i) => `${i+1}. "${m.title}" — Due: ${m.due_date} — Criteria: ${m.criteria}${m.evidence ? ` — Evidence: ${m.evidence}` : ' — Evidence: none provided'}`).join('\n')}

Return this JSON exactly:
{
  "overall_score": 0-100,
  "seed_score_delta": -20 to +20,
  "milestones": [
    {
      "milestone_title": "exact title from input",
      "status": "delivered"|"partial"|"missed"|"pending",
      "confidence": 0.0-1.0,
      "evidence_found": "what you found or did not find",
      "agent_note": "one sentence evaluation"
    }
  ],
  "verdict": "one sentence overall verdict",
  "recommendation": "continue_backing"|"hold"|"withdraw"
}`

  const response = await fetch(VENICE_ENDPOINT, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: VENICE_MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      max_tokens: 600,
    })
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`[SEEDR] Venice API error ${response.status}: ${err}`)
  }

  const data = await response.json()
  const raw = data.choices?.[0]?.message?.content || ''
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const parsed = JSON.parse(cleaned)

  return {
    project_id: project.id,
    project_title: project.title,
    overall_score: parsed.overall_score,
    seed_score_delta: parsed.seed_score_delta,
    milestones: parsed.milestones,
    verdict: parsed.verdict,
    recommendation: parsed.recommendation,
    evaluated_at: now,
    model_used: 'venice-llama-3.3-70b',
    simulated: false,
  }
}
