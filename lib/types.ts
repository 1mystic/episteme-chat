// lib/types.ts

export type DepthLevel = 'SURFACE' | 'CONCEPTUAL' | 'ANALYTICAL' | 'SYNTHESIS'
export type Domain = 'ml' | 'statistics' | 'economics' | 'cs' | 'general'
export type MessageRole = 'user' | 'assistant'

export interface Message {
  id: string
  session_id: string
  role: MessageRole
  content: string
  turn_number: number
  created_at: string
}

export interface Session {
  id: string
  domain: Domain
  created_at: string
  updated_at: string
  turns_count: number
  is_complete: boolean
  session_state?: {
    lastState?: string
    semanticAccuracy?: number
    consecutiveScaffolds?: number
    misconception?: string | null
  } | null
}

export interface Concept {
  id: string
  session_id: string
  name: string
  depth_reached: DepthLevel
  clarity_score: number
  created_at: string
}

export interface InsightCard {
  id: string
  session_id: string
  concept: string
  insight: string
  gaps: string[]
  clarity_score: number
  created_at: string
  next_starter?: string | null
}

export interface ClassifyResponse {
  depth: DepthLevel
  confidence: number
  keywords: string[]
}

export interface ChatRequest {
  sessionId: string
  message: string
  turnNumber: number
  domain: Domain
  conversationHistory: { role: MessageRole; content: string }[]
  conceptsCovered: string[]
}

export interface InsightRequest {
  sessionId: string
  domain: Domain
  conversationHistory: { role: MessageRole; content: string }[]
  mainConcept: string
}

export interface ChatState {
  messages: Message[]
  isStreaming: boolean
  currentStreamContent: string
  sessionId: string | null
  domain: Domain | null
  clarityScore: number
  depthLevel: DepthLevel | null
  conceptsCovered: string[]
  isComplete: boolean
  insightCard: InsightCard | null
}

export interface SidePanelState {
  concepts: Concept[]
  clarityHistory: number[]
  depthHistory: DepthLevel[]
}
