import { useSandboxStore, flattenQuestions } from '../../stores/sandboxStore.js'

export default function TrainerReportModal({ onBack }) {
  const { unit, session } = useSandboxStore()

  const questions  = unit ? flattenQuestions(unit) : []
  const total      = questions.length
  const errorCount = (session?.errors || []).length
  const correct    = total - errorCount
  const pct        = total > 0 ? Math.round((correct / total) * 100) : 100

  return (
    <div className="sb-modal-backdrop" id="report-modal">
      <div className="sb-modal">
        <div className="sb-modal__icon" aria-hidden="true">📊</div>
        <h2 className="sb-modal__title">Результаты тренировки</h2>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <div className="sb-report-score__circle" style={{ '--pct': pct }}>
            <span className="sb-report-score__val">{pct}%</span>
          </div>
        </div>

        <div className="sb-modal__actions">
          <button className="sb-modal__btn sb-modal__btn--primary sb-modal__btn--full" onClick={onBack}>
            Вернуться в траекторию развития
          </button>
        </div>
      </div>
    </div>
  )
}
