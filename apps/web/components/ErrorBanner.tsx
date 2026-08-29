import { ApiError } from '@/hooks/useApiError'

const ICONS: Record<ApiError['type'], string> = {
  rate_limit: '⏱',
  server:     '⚠',
  network:    '↻',
  auth:       '🔒',
  unknown:    '⚠',
}

const COLORS: Record<ApiError['type'], { bg: string; border: string; text: string }> = {
  rate_limit: {
    bg:     'rgba(217,119,6,0.06)',
    border: 'rgba(217,119,6,0.2)',
    text:   '#92400E',
  },
  server: {
    bg:     'rgba(220,38,38,0.06)',
    border: 'rgba(220,38,38,0.2)',
    text:   '#991B1B',
  },
  network: {
    bg:     'rgba(220,38,38,0.06)',
    border: 'rgba(220,38,38,0.2)',
    text:   '#991B1B',
  },
  auth: {
    bg:     'rgba(79,70,229,0.06)',
    border: 'rgba(79,70,229,0.2)',
    text:   '#3730A3',
  },
  unknown: {
    bg:     'rgba(220,38,38,0.06)',
    border: 'rgba(220,38,38,0.2)',
    text:   '#991B1B',
  },
}

interface Props {
  error: ApiError
  onDismiss?: () => void
}

export function ErrorBanner({ error, onDismiss }: Props) {
  const c = COLORS[error.type]

  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
      background: c.bg,
      border: `0.5px solid ${c.border}`,
      borderRadius: 10,
      padding: '10px 14px',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <span style={{ fontSize: 13, flexShrink: 0, marginTop: 1 }}>
          {ICONS[error.type]}
        </span>
        <p style={{ fontSize: 12, color: c.text, lineHeight: 1.6 }}>
          {error.message}
        </p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{
            background: 'none', border: 'none',
            cursor: 'pointer', color: c.text,
            fontSize: 12, opacity: 0.6,
            flexShrink: 0, padding: 0,
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={e => (e.currentTarget.style.opacity = '0.6')}
        >
          ✕
        </button>
      )}
    </div>
  )
}