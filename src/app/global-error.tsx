'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body style={{
        margin: 0,
        padding: 0,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#0F4C5C',
        color: '#fff',
      }}>
        <div style={{ textAlign: 'center', padding: '24px', maxWidth: '400px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(163, 230, 53, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: '28px',
            fontWeight: 700,
            color: '#A3E635',
          }}>
            !
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
            Something went wrong
          </h1>
          <div style={{
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '16px',
            textAlign: 'left',
          }}>
            <p style={{ fontSize: '12px', color: '#A3E635', fontFamily: 'monospace', wordBreak: 'break-all', margin: 0 }}>
              {error?.message || 'Unknown error'}
            </p>
          </div>
          <p style={{ fontSize: '14px', opacity: 0.7, marginBottom: '24px', lineHeight: 1.5 }}>
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={reset}
            style={{
              background: '#A3E635',
              color: '#0A0A0A',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 32px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  )
}
