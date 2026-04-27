'use client'

import { useEffect, useState } from 'react'

export function ErrorCapture() {
  const [errors, setErrors] = useState<Array<{ type: string; message: string; stack?: string | null }>>([])

  useEffect(() => {
    // Check for errors caught by the global listener
    const check = () => {
      const globalErrors = (window as unknown as Record<string, unknown[]>).__CHATLINGO_ERRORS as Array<{ type: string; message: string; stack?: string | null }> | undefined
      if (globalErrors && globalErrors.length > 0) {
        setErrors([...globalErrors])
      }
    }

    // Check immediately and periodically
    check()
    const interval = setInterval(check, 1000)
    return () => clearInterval(interval)
  }, [])

  // Only show if there are errors
  if (errors.length === 0) return null

  return (
    <div
      id="chatlingo-error-debug"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 99999,
        background: '#0A0A0A',
        color: '#A3E635',
        padding: '12px 16px',
        fontSize: '11px',
        fontFamily: 'monospace',
        maxHeight: '40vh',
        overflow: 'auto',
        borderTop: '2px solid #A3E635',
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#fff' }}>
        ChatLingo Debug — {errors.length} error(s) captured:
      </div>
      {errors.map((err, i) => (
        <div key={i} style={{ marginBottom: '8px', borderBottom: '1px solid #333', paddingBottom: '8px' }}>
          <div style={{ color: '#ff6b6b' }}>[{err.type}] {err.message}</div>
          {err.stack && (
            <pre style={{ fontSize: '10px', color: '#888', whiteSpace: 'pre-wrap', marginTop: '4px' }}>
              {err.stack.substring(0, 500)}
            </pre>
          )}
        </div>
      ))}
    </div>
  )
}
