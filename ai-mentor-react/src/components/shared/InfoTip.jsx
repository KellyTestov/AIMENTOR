export default function InfoTip({ children, wide = false }) {
  return (
    <span className="info-icon" tabIndex={0} role="img" aria-label="Подсказка">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
      <span className={`info-tip${wide ? ' info-tip--wide' : ''}`}>{children}</span>
    </span>
  )
}
