'use client'
import { useState } from 'react'
import { Idea } from '@idea-vault/types'
import { IdeaFocusOverlay } from './IdeaFocusOverlay'

const COLUMNS = [
  { status: 'ACTIVE',   label: 'Active',   dot: '#059669' },
  { status: 'PARKED',   label: 'Parked',   dot: '#4f70f6' },
  { status: 'ARCHIVED', label: 'Archived', dot: '#9CA3AF' },
] as const

const EMPTY_COPY: Record<string, { title: string; sub: string }> = {
  ACTIVE:   { title: 'Nothing active yet',   sub: 'Open an idea and set it to Active' },
  PARKED:   { title: 'Nothing parked',        sub: 'Park ideas you want to revisit later' },
  ARCHIVED: { title: 'Nothing archived',      sub: 'Archive ideas you\'re done with' },
}

interface Props {
  ideas: Idea[]
  loading: boolean
  onCardClick: (idea: Idea) => void
  onStatusChange: (id: string, status: string) => void
  onDelete: (id: string) => void
  onCaptureClick: () => void
}

export function KanbanBoard({
  ideas, loading, onDelete, onStatusChange,
}: Props) {
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null)

  if (loading) return <KanbanSkeleton />

  return (
    <>
      {/* Section header */}
      <div style={{ marginBottom: 12 }}>
        <p style={{
          fontSize: 11, fontWeight: 500,
          color: 'var(--text-3)',
          textTransform: 'uppercase',
          letterSpacing: '0.7px',
          fontFamily: 'var(--font-mono)',
        }}>
          Workspace
        </p>
        
      </div>

      <div className="grid grid-cols-3 items-start gap-3">
        {COLUMNS.map(col => {
          const colIdeas = ideas.filter(i => i.status === col.status)
          const empty = EMPTY_COPY[col.status]

          return (
            <div
              key={col.status}
              className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-2)] p-3"
            >
              {/* Column header */}
              <div className="mb-3 flex items-center justify-between border-b border-[var(--border)] pb-2">
                <div className="flex items-center gap-2">
                  <div
                    style={{ background: col.dot }}
                    className="h-1.5 w-1.5 rounded-full"
                  />
                  <span className="text-[11px] font-medium text-[var(--text-2)]">
                    {col.label}
                  </span>
                </div>
                <span className="rounded-full bg-[var(--surface)] px-2 py-0.5 text-[10px] text-[var(--text-3)]">
                  {colIdeas.length}
                </span>
              </div>

              {/* Cards */}
              {colIdeas.map(idea => (
                <KanbanCard
                  key={idea.id}
                  idea={idea}
                  onClick={() => setSelectedIdea(idea)}
                  onDelete={onDelete}
                />
              ))}

              {/* Empty state */}
              {colIdeas.length === 0 && (
                <div style={{
                  padding: '24px 12px',
                  textAlign: 'center',
                  borderRadius: 8,
                  border: '0.5px dashed var(--border)',
                  margin: '4px 0',
                }}>
                  <p style={{
                    fontSize: 11, fontWeight: 500,
                    color: 'var(--text-3)', marginBottom: 4,
                  }}>
                    {empty.title}
                  </p>
                  <p style={{ fontSize: 10, color: 'var(--text-3)', opacity: 0.7 }}>
                    {empty.sub}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {selectedIdea && (
        <IdeaFocusOverlay
          idea={selectedIdea}
          onClose={() => setSelectedIdea(null)}
          onDelete={onDelete}
          onStatusChange={(id, status) => {
            onStatusChange(id, status)
            setSelectedIdea(prev =>
              prev?.id === id ? { ...prev, status: status as any } : prev
            )
          }}
        />
      )}
    </>
  )
}

function KanbanCard({ idea, onClick, onDelete }: {
  idea: Idea
  onClick: () => void
  onDelete: (id: string) => void
}) {
  const enriched = !!idea.enrichment
  const date = new Date(idea.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric',
  })

  return (
    <div
      onClick={onClick}
      className="mb-2 cursor-pointer rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--border-2)] hover:shadow-md"
    >
      <div className="mb-3 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 rounded-full bg-[var(--surface-2)] px-2 py-1">
          <div className="h-1.5 w-1.5 rounded-full bg-[var(--em)]" />
          <span className="font-mono text-[9px] font-semibold uppercase tracking-[1px] text-[var(--text-2)]">
            {idea.domain}
          </span>
        </div>
        <span className="text-[10px] text-[var(--text-3)]">{date}</span>
      </div>

      <p className="mb-2 text-sm font-medium text-[var(--text-1)]">
        {idea.title}
      </p>

      <p className="mb-3 line-clamp-2 text-xs leading-5 text-[var(--text-3)]">
        {idea.rawDump}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`h-1.5 w-1.5 rounded-full ${enriched ? 'bg-[var(--em)]' : 'bg-[var(--text-3)]'}`} />
          <span className="text-[10px] text-[var(--text-3)]">
            {enriched ? 'AI enriched' : 'Enriching...'}
          </span>
        </div>
        <button
          onClick={e => { e.stopPropagation(); onDelete(idea.id) }}
          className="text-[10px] text-[var(--text-3)] transition-colors hover:text-red-500"
        >
          delete
        </button>
      </div>
    </div>
  )
}

function KanbanSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-3">
      {[2, 1, 0].map((count, i) => (
        <div key={i} className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-2)] p-3">
          <div className="skeleton-shimmer mb-4 h-3 w-[55%] rounded-md bg-[var(--border)]" />
          {Array.from({ length: count }).map((_, j) => (
            <div key={j} className="skeleton-shimmer mb-2 h-[90px] rounded-xl border border-[var(--border)] bg-[var(--surface)]" />
          ))}
        </div>
      ))}
    </div>
  )
}