export type Domain = 'DEV' | 'BUSINESS' | 'CREATIVE' | 'HEALTH' | 'TRAVEL' | 'LEARNING' | 'LIFE'
export type IdeaStatus = 'PENDING' | 'ENRICHED' | 'ACTIVE' | 'PARKED' | 'ARCHIVED'

export interface Enrichment{
    id: string;
    ideaId: string
    category: string
    summary: string
    viabilityNote: string
    phases: any[]
    estimatedHours?: number
    nextSteps: any[]
    domainMeta?: any
}

export interface Idea {
  id: string
  userId: string
  title: string
  rawDump: string
  domain: Domain
  status: IdeaStatus
  createdAt: string
  updatedAt: string
  enrichment: Enrichment | null
}

export const DOMAINS: Domain[] = ['DEV', 'BUSINESS', 'CREATIVE', 'HEALTH', 'TRAVEL', 'LEARNING', 'LIFE']

export const DOMAIN_COLORS: Record<Domain, { accent: string; bg: string; text: string }> = {
  DEV:      { accent: '#5b5bd6', bg: '#ededfc', text: '#3d3d9e' },
  BUSINESS: { accent: '#d85a30', bg: '#fef0ed', text: '#9b3a25' },
  CREATIVE: { accent: '#a855c9', bg: '#f8edfc', text: '#7c3a94' },
  HEALTH:   { accent: '#d6415b', bg: '#fdedf0', text: '#9e2d43' },
  TRAVEL:   { accent: '#c99b1d', bg: '#fbf3de', text: '#8f6b0f' },
  LEARNING: { accent: '#d6821d', bg: '#fdf1de', text: '#9e5e12' },
  LIFE:     { accent: '#d6538f', bg: '#fdedf3', text: '#9e3a66' },
}