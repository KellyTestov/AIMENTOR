import { useEffect, useState } from 'react'

let toastCallback = null
export function showToast(message) {
  toastCallback?.(message)
}

export default function Toast() {
  const [msg, setMsg] = useState('')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    toastCallback = (message) => {
      setMsg(message)
      setVisible(true)
      setTimeout(() => setVisible(false), 3000)
    }
    return () => { toastCallback = null }
  }, [])

  return (
    <div
      role="status"
      aria-live="polite"
      aria-hidden={!visible}
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#1a1e2a',
        color: '#edf0f7',
        padding: '10px 20px',
        borderRadius: 10,
        fontSize: 14,
        fontWeight: 500,
        boxShadow: 'var(--shadow-md)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.25s ease',
        pointerEvents: 'none',
        zIndex: 100,
        whiteSpace: 'nowrap',
      }}
    >
      {msg}
    </div>
  )
}
