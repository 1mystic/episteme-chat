// lib/algorithms.ts
// Complete implementation of all 7 EPISTEME algorithms

import type { DepthLevel, Domain } from './types'

// ═══════════════════════════════════
// RDSE — Response Depth Signal Extractor
// ═══════════════════════════════════

export const REASONING_CONNECTIVES = [
  'because', 'therefore', 'thus', 'hence', 'consequently', 'as a result',
  'which causes', 'which means', 'this leads to', 'this results in',
  'however', 'but', 'although', 'whereas', 'on the other hand', 'unlike',
  'in contrast', 'nevertheless', 'despite', 'even though',
  'if', 'given that', 'assuming', 'provided that',
  'specifically', 'for example', 'for instance', 'such as',
  'in other words', 'that is', 'to be more precise', 'in particular',
]

export const UNCERTAINTY_MARKERS = [
  'i think', 'i guess', 'maybe', 'perhaps', 'possibly',
  'not sure', 'i believe', 'probably', 'might be', 'could be',
]

export const CONFUSION_MARKERS = [
  "i don't know", "i'm not sure", "i have no idea", "i'm confused",
  "not sure", "no idea", "don't understand", "what do you mean",
  "can you explain", "i'm lost", "i give up", "i don't get it",
]

export const TECHNICAL_TERMS: Record<string, string[]> = {
  ml: [
    'model', 'training', 'gradient', 'loss', 'parameter', 'epoch', 'batch',
    'overfitting', 'regularization', 'feature', 'label', 'weight', 'bias',
    'activation', 'backpropagation', 'optimization', 'learning rate', 'neural',
  ],
  statistics: [
    'distribution', 'probability', 'variance', 'mean', 'hypothesis',
    'p-value', 'confidence', 'regression', 'correlation', 'sample', 'bayesian',
  ],
  economics: [
    'supply', 'demand', 'equilibrium', 'elasticity', 'utility', 'market',
    'price', 'incentive', 'marginal', 'opportunity cost', 'inflation',
  ],
  cs: [
    'algorithm', 'complexity', 'pointer', 'recursion', 'stack', 'queue', 'hash',
    'tree', 'graph', 'node', 'edge', 'time complexity', 'space', 'big-o',
  ],
  general: [
    'evidence', 'argument', 'reasoning', 'claim', 'premise', 'conclusion',
    'cause', 'effect', 'mechanism', 'structure', 'relationship',
  ],
}

export function extractDepthSignals(
  response: string,
  domain: string,
  turnNumber: number
): { qualityScore: number; confusionCount: number } {
  const r = response.toLowerCase()
  const words = r.split(/\s+/).filter((w) => w.length > 0)

  const connectiveHits = REASONING_CONNECTIVES.filter((c) => r.includes(c)).length
  const reasoningConnectives = Math.min(connectiveHits / 3, 1.0)

  const expectedWords = 20 + turnNumber * 8
  const responseLength = Math.min(words.length / expectedWords, 1.0)

  const uncertaintyHits = UNCERTAINTY_MARKERS.filter((m) => r.includes(m)).length
  const uncertaintyLevel = 1.0 - Math.min(uncertaintyHits / 3, 1.0)

  const termList = TECHNICAL_TERMS[domain] || TECHNICAL_TERMS.general
  const termHits = termList.filter((t) => r.includes(t)).length
  const technicalTermDensity = Math.min(termHits / 3, 1.0)

  const sentences = response.split(/[.!?]/).filter((s) => s.trim().length > 5)
  const structureScore = Math.min(sentences.length / 4, 1.0)

  const questionMarks = (response.match(/\?/g) || []).length
  const questionBackPenalty = Math.min(questionMarks / 3, 1.0)

  const qualityScore =
    0.30 * reasoningConnectives +
    0.20 * responseLength +
    0.15 * uncertaintyLevel +
    0.20 * technicalTermDensity +
    0.10 * structureScore +
    0.05 * (1 - questionBackPenalty)

  const confusionCount = Math.min(
    CONFUSION_MARKERS.filter((m) => r.includes(m)).length +
      (words.length < 5 ? 1 : 0) +
      (r.includes('?') && words.length < 8 ? 1 : 0),
    3
  )

  return {
    qualityScore: Math.max(0, Math.min(1, qualityScore)),
    confusionCount,
  }
}

// ═══════════════════════════════════
// SDSM — Socratic Dialogue State Machine
// ═══════════════════════════════════

export type SocraticState =
  | 'PROBE'
  | 'DEEPEN'
  | 'REDIRECT'
  | 'SCAFFOLD'
  | 'RECTIFY'
  | 'CONSOLIDATE'
  | 'COMPLETE'

export function determineNextState(
  turnNumber: number,
  qualityScore: number,
  semanticAccuracy: number,
  confusionCount: number,
  consecutiveScaffolds: number
): SocraticState {
  if (turnNumber >= 9) return 'COMPLETE'
  if (turnNumber >= 7) return 'CONSOLIDATE'
  if (turnNumber === 1) return 'PROBE'

  if (confusionCount >= 2 || qualityScore < 0.15) {
    return consecutiveScaffolds >= 2 ? 'RECTIFY' : 'SCAFFOLD'
  }
  if (semanticAccuracy < 0.25 && qualityScore > 0.3) return 'RECTIFY'
  if (semanticAccuracy < 0.4 && qualityScore > 0.2) return 'REDIRECT'
  if (qualityScore >= 0.55 && semanticAccuracy >= 0.55) return 'DEEPEN'
  return 'PROBE'
}

export const STATE_INSTRUCTIONS: Record<SocraticState, string> = {
  PROBE: `STATE: PROBE. Ask the user what they already think or know. Do NOT explain anything. Ask ONE focused question about their prior understanding. Begin: "Before I respond..." or "What's your intuition about..."`,
  DEEPEN: `STATE: DEEPEN. User gave a good response. Acknowledge in ONE sentence what they got right, then probe deeper toward the next cognitive level. Push them to think about edge cases or mechanisms.`,
  REDIRECT: `STATE: REDIRECT. User answered a slightly different question. Don't correct — steer back. "Interesting — how does that relate to [original concept]?" Keep them engaged while refocusing.`,
  SCAFFOLD: `STATE: SCAFFOLD. User is confused. Give ONE minimal conceptual foothold — just enough to unlock the next step. Format: "Let me give you a starting point: [hint]. Given that, what do you think follows?"`,
  RECTIFY: `STATE: RECTIFY. User has a specific misconception. Address gently: "There's a subtle thing here — [rephrase their idea]. The part that needs adjusting is [element]. Does your reasoning still hold given that?" NEVER say "you're wrong".`,
  CONSOLIDATE: `STATE: CONSOLIDATE. We've had a rich discussion. Offer to summarize: "We've covered a lot of ground. Want me to put together what you've figured out — including where you're strong and where there's more to explore?"`,
  COMPLETE: `STATE: COMPLETE. The session has reached natural completion. Warm closing emphasizing what the user discovered themselves. Offer to generate their insight card.`,
}

// ═══════════════════════════════════
// CBKT-CS — Bayesian Knowledge Tracing Clarity Scorer
// ═══════════════════════════════════

export interface BKTState {
  pL: number
  pT: number
  pS: number
  pG: number
}

export const DOMAIN_BKT_PRIORS: Record<string, BKTState> = {
  ml:         { pL: 0.20, pT: 0.12, pS: 0.10, pG: 0.08 },
  statistics: { pL: 0.18, pT: 0.10, pS: 0.12, pG: 0.06 },
  economics:  { pL: 0.25, pT: 0.14, pS: 0.08, pG: 0.10 },
  cs:         { pL: 0.22, pT: 0.13, pS: 0.09, pG: 0.07 },
  general:    { pL: 0.30, pT: 0.15, pS: 0.10, pG: 0.12 },
}

export function updateBKT(state: BKTState, qualitySignal: number): BKTState {
  const { pL, pT, pS, pG } = state
  const pCGK = (1 - pS) * qualitySignal + pS * (1 - qualitySignal)
  const pCGU = pG * qualitySignal + (1 - pG) * (1 - qualitySignal)
  const pTotal = pL * pCGK + (1 - pL) * pCGU
  const pLPost = (pL * pCGK) / (pTotal || 0.0001)
  const pLNext = pLPost + (1 - pLPost) * pT
  return {
    pL: Math.max(0, Math.min(1, pLNext)),
    pT: Math.min(pT + 0.004 * qualitySignal, 0.35),
    pS,
    pG,
  }
}

export function bktToScore(state: BKTState): number {
  return Math.round(state.pL * 100)
}

// ═══════════════════════════════════
// SUV — Semantic Understanding Verifier
// ═══════════════════════════════════

export async function semanticUnderstandingVerify(
  concept: string,
  userResponse: string,
  depthLevel: DepthLevel
): Promise<{
  semanticAccuracy: number
  reasoning: string
  misconception: string | null
}> {
  const prompt = `You are evaluating a student's response during a Socratic tutoring session.

Concept being explored: "${concept}"
Student's response: "${userResponse}"
Expected depth level: ${depthLevel}

Evaluate on TWO dimensions:
1. SEMANTIC ACCURACY (0.0–1.0): Is the student's reasoning correct? Not complete — correct.
   - 0.0 = fundamentally wrong / harmful misconception
   - 0.3 = partially correct, significant errors
   - 0.6 = mostly correct, minor gaps
   - 0.9 = correct reasoning, well expressed

2. MISCONCEPTION: If there's a specific wrong belief in their response, name it precisely.
   Null if no misconception detected.

Respond ONLY with valid JSON, no markdown:
{"semanticAccuracy": 0.65, "reasoning": "...", "misconception": null}`

  try {
    const { default: anthropic } = await import('./anthropic')
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 150,
      messages: [{ role: 'user', content: prompt }],
    })
    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const clean = text.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  } catch {
    return { semanticAccuracy: 0.5, reasoning: 'Unable to evaluate', misconception: null }
  }
}

// ═══════════════════════════════════
// BGDC — Bloom-Grounded Depth Classifier
// ═══════════════════════════════════

export const BLOOM_VERB_MAP: Record<string, string[]> = {
  SURFACE:    ['what is', 'what are', 'define', 'list', 'describe', 'explain', 'name', 'identify', 'state', 'tell me', 'summarize'],
  CONCEPTUAL: ['how does', 'how do', 'how is', 'how can', 'show how', 'demonstrate', 'illustrate', 'interpret', 'apply', 'paraphrase'],
  ANALYTICAL: ['why does', 'why is', 'why', 'compare', 'contrast', 'differentiate', 'analyze', 'examine', 'investigate', 'break down', 'what causes', 'what happens when', 'when does'],
  SYNTHESIS:  ['when would', 'design', 'create', 'construct', 'formulate', 'develop', 'propose', 'evaluate', 'judge', 'justify', 'defend', 'would you choose', 'how would you decide', 'trade-off'],
}

export function keywordClassify(question: string): { depth: DepthLevel; confidence: number } {
  const q = question.toLowerCase()
  const order: DepthLevel[] = ['SYNTHESIS', 'ANALYTICAL', 'CONCEPTUAL', 'SURFACE']

  for (const level of order) {
    const verbs = BLOOM_VERB_MAP[level]
    const matchedVerb = verbs.find((v) => q.startsWith(v) || q.includes(` ${v} `))
    if (matchedVerb) {
      const confidence = q.startsWith(matchedVerb) ? 0.85 : 0.70
      return { depth: level, confidence }
    }
  }
  return { depth: 'SURFACE', confidence: 0.45 }
}

// ═══════════════════════════════════
// SDSM → Bloom Depth mapper
// ═══════════════════════════════════

export function sdsmToDepthLevel(state: SocraticState, qualityScore: number): DepthLevel {
  if (state === 'COMPLETE') return 'SYNTHESIS'
  if (state === 'CONSOLIDATE') return qualityScore >= 0.55 ? 'SYNTHESIS' : 'ANALYTICAL'
  if (state === 'DEEPEN') return 'ANALYTICAL'
  if (state === 'SCAFFOLD' || state === 'RECTIFY') return 'SURFACE'
  return 'CONCEPTUAL' // PROBE, REDIRECT
}

// ═══════════════════════════════════
// CPGAB — Concept-Performance Gap Analyser (Bloom-based)
// ═══════════════════════════════════

const CORE_CONCEPTS: Record<string, string[]> = {
  ml:         ['gradient descent', 'loss functions', 'overfitting', 'backpropagation', 'regularisation', 'cross-validation', 'feature engineering', 'bias-variance tradeoff', 'attention mechanism'],
  statistics: ['hypothesis testing', 'confidence intervals', 'p-values', 'bayesian inference', 'regression', 'central limit theorem', 'sampling bias', 'effect size'],
  economics:  ['supply and demand', 'equilibrium', 'elasticity', 'opportunity cost', 'market failure', 'externalities', 'game theory', 'comparative advantage'],
  cs:         ['time complexity', 'recursion', 'dynamic programming', 'graph algorithms', 'hash tables', 'memory management', 'concurrency', 'divide and conquer'],
  general:    ['causal reasoning', 'logical fallacies', 'evidence evaluation', 'systems thinking', 'first principles', 'mental models'],
}

export function inferKnowledgeGaps(conceptsCovered: string[], domain: string): string[] {
  const core = CORE_CONCEPTS[domain] ?? CORE_CONCEPTS.general
  if (conceptsCovered.length === 0) return []
  const coveredLower = conceptsCovered.map((c) => c.toLowerCase())
  return core
    .filter((c) => !coveredLower.some((covered) =>
      covered.includes(c.split(' ')[0]) || c.includes(covered.split(' ')[0])
    ))
    .slice(0, 5)
}

// ═══════════════════════════════════
// EGP — Ebbinghaus Gap Prioritizer
// ═══════════════════════════════════

export function calculateRetention(
  clarityScore: number,
  timesExplored: number,
  hoursElapsed: number
): number {
  const S = 2 * Math.exp(4 * (clarityScore / 100) + 0.5 * Math.log(timesExplored + 1))
  return Math.max(0, Math.min(1, Math.exp(-hoursElapsed / S)))
}

export function calculateGapUrgency(
  clarityScore: number,
  timesExplored: number,
  lastExploredAt: Date
): number {
  const hoursElapsed = (Date.now() - lastExploredAt.getTime()) / (1000 * 60 * 60)
  const retention = calculateRetention(clarityScore, timesExplored, hoursElapsed)
  return (1 - retention) * (1 - clarityScore / 100)
}

export function calculateSM2Interval(
  clarityScore: number,
  timesReviewed: number,
  prevInterval = 24
): number {
  if (timesReviewed <= 1) return 24
  if (timesReviewed === 2) return 72
  const easiness = 1.3 + 0.1 * (clarityScore / 20)
  return Math.round(prevInterval * easiness)
}

// ═══════════════════════════════════
// Algorithm-enriched system prompt builder
// ═══════════════════════════════════

export function buildAlgorithmEnrichedSystemPrompt(
  domain: string,
  turnNumber: number,
  nextState: SocraticState,
  clarityScore: number,
  bktState: BKTState,
  misconception: string | null,
  conceptsCovered: string[],
  topGaps: string[]
): string {
  return `You are Episteme — a Socratic AI tutor. Your singular purpose is to build genuine understanding, not provide answers.

DOMAIN: ${domain}
TURN: ${turnNumber}
CURRENT CLARITY SCORE: ${clarityScore}/100 (Bayesian mastery estimate)
BKT MASTERY PROBABILITY: ${(bktState.pL * 100).toFixed(1)}%

${STATE_INSTRUCTIONS[nextState]}

${misconception ? `⚠️ DETECTED MISCONCEPTION: "${misconception}"\nAddress this misconception using the RECTIFY protocol.` : ''}

CONCEPTS COVERED: ${conceptsCovered.join(', ') || 'session just started'}
KNOWLEDGE GAPS IDENTIFIED: ${topGaps.join(', ') || 'none yet detected'}

ABSOLUTE RULES:
1. NEVER directly answer the original question until CONSOLIDATE or COMPLETE state
2. Every response MUST end with a question (except COMPLETE state)
3. Never say "Great question!" or give hollow praise
4. Acknowledge the user's reasoning before redirecting it
5. Keep responses under 120 words — density over volume

TONE: Warm, intellectually rigorous, patient. Wrong answers are treated as data, not failures.`
}
