'use client'
import { Idea } from '@idea-vault/types'
import { useState } from 'react'
interface Props {
  ideas: Idea[]
  onCardClick: (idea: Idea) => void
  onDelete: (id: string) => void
}

const DOMAIN_ACCENT: Record<string, string> = {
  DEV:      '#4F46E5',
  DESIGN:   '#059669',
  BUSINESS: '#D97706',
  PERSONAL: '#DB2777',
  RESEARCH: '#B45309',
  CREATIVE: '#7C3AED',
  HEALTH:   '#0F766E',
  TRAVEL:   '#0369A1',
  LEARNING: '#C2410C',
  LIFE:     '#6D28D9',
}

const DOMAIN_BG: Record<string, string> = {
  DEV:      'rgba(79,70,229,0.07)',
  DESIGN:   'rgba(5,150,105,0.07)',
  BUSINESS: 'rgba(217,119,6,0.07)',
  PERSONAL: 'rgba(219,39,119,0.07)',
  RESEARCH: 'rgba(180,83,9,0.07)',
  CREATIVE: 'rgba(124,58,237,0.07)',
  HEALTH:   'rgba(15,118,110,0.07)',
  TRAVEL:   'rgba(3,105,161,0.07)',
  LEARNING: 'rgba(194,65,12,0.07)',
  LIFE:     'rgba(109,40,217,0.07)',
}

export function RecentCaptures({ ideas, onCardClick, onDelete }: Props) {
  const [showAll, setShowAll] = useState(false)
  if (ideas.length === 0) return null

  const recent = [...ideas]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  return (
    <div style={{ marginBottom: 32 }}>
      {/* Section header */}
     {/* Section header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 12,
      }}>
        <p style={{
          fontSize: 11, fontWeight: 500,
          color: 'var(--text-3)',
          textTransform: 'uppercase',
          letterSpacing: '0.7px',
          fontFamily: 'var(--font-mono)',
        }}>
          Recent captures
        </p>
        <button
          onClick={() => setShowAll(p => !p)}
          style={{
            fontSize: 11, color: 'var(--em)',
            background: 'none', border: 'none',
            cursor: 'pointer', padding: 0,
          }}
        >
          {showAll ? 'Show less' : `View all ${ideas.length}`}
        </button>
      </div>

      {/* Horizontal scroll or full grid */}
      {showAll ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 10,
        }}>
          {[...ideas]
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .map(idea => (
              <RecentCard
                key={idea.id}
                idea={idea}
                onClick={() => onCardClick(idea)}
                onDelete={onDelete}
              />
            ))}
        </div>
      ) : (
        <div style={{
          display: 'flex',
          gap: 10,
          overflowX: 'auto',
          paddingBottom: 4,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}>
          {recent.map(idea => (
            <RecentCard
              key={idea.id}
              idea={idea}
              onClick={() => onCardClick(idea)}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function RecentCard({ idea, onClick, onDelete }: {
  idea: Idea
  onClick: () => void
  onDelete: (id: string) => void
}) {
  const enriched = !!idea.enrichment
  const accent = DOMAIN_ACCENT[idea.domain] ?? '#868E96'
  const domainBg = DOMAIN_BG[idea.domain] ?? 'rgba(0,0,0,0.04)'

  const date = new Date(idea.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
  })

  return (
    <div
      onClick={onClick}
      style={{
        flexShrink: 0,
        width: 200,
        background: 'var(--surface)',
        border: '0.5px solid var(--border)',
        borderRadius: 12,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.18s cubic-bezier(0.2,0,0,1)',
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.transform = 'translateY(-2px)'
        el.style.boxShadow = `0 8px 24px ${domainBg}`
        el.style.borderColor = accent + '44'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement
        el.style.transform = 'translateY(0)'
        el.style.boxShadow = 'none'
        el.style.borderColor = 'var(--border)'
      }}
    >
      {/* Accent bar */}
      <div style={{ height: 2, background: accent }} />

      <div style={{ padding: '11px 12px' }}>
        {/* Domain + date row */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: 8,
        }}>
          <span style={{
            fontSize: 8, fontWeight: 600,
            letterSpacing: '0.8px', textTransform: 'uppercase',
            color: accent, opacity: 0.9,
          }}>
            {idea.domain}
          </span>
          <span style={{ fontSize: 9, color: 'var(--text-3)' }}>
            {date}
          </span>
        </div>

        {/* Title */}
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: 12, fontWeight: 500,
          color: 'var(--text-1)', lineHeight: 1.4,
          marginBottom: 6,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {idea.title}
        </p>

        {/* Raw dump */}
        <p style={{
          fontSize: 10, color: 'var(--text-3)',
          lineHeight: 1.6, marginBottom: 10,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {idea.rawDump}
        </p>

        {/* Footer */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 8,
          borderTop: '0.5px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{
              width: 5, height: 5, borderRadius: '50%',
              background: enriched ? '#059669' : '#F59E0B',
              flexShrink: 0,
              animation: enriched ? 'none' : 'pulse 1.5s ease-in-out infinite',
            }} />
            <span style={{ fontSize: 9, color: 'var(--text-3)' }}>
              {enriched ? 'AI enriched' : 'Enriching...'}
            </span>
          </div>
          <button
            onClick={e => { e.stopPropagation(); onDelete(idea.id) }}
            style={{
              fontSize: 9, color: 'var(--text-3)',
              background: 'none', border: 'none',
              cursor: 'pointer', padding: 0,
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#DC2626')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
          >
            delete
          </button>
        </div>
      </div>
    </div>
  )
}