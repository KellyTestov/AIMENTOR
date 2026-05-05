import { useSandboxStore, flattenQuestions } from '../../stores/sandboxStore.js'

export default function TrainerReportModal({ onBack, onPublish }) {
  const { unit, session } = useSandboxStore()

  const questions  = unit ? flattenQuestions(unit) : []
  const total      = questions.length
  const errorCount = (session?.errors || []).length
  const correct    = total - errorCount
  const pct        = total > 0 ? Math.round((correct / total) * 100) : 100

  return (
    <div className="sb-modal-backdrop" id="report-modal">
      <div className="sb-modal sb-modal--wide sb-modal--scroll">
        <div className="sb-modal__icon" aria-hidden="true">📊</div>
        <h2 className="sb-modal__title">Результаты тренировки</h2>

        <div className="sb-report-body" id="report-body">
          <div className="sb-report-score">
            <div
              className="sb-report-score__circle"
              style={{ '--pct': pct }}
            >
              <span className="sb-report-score__val">{pct}%</span>
            </div>
            <div className="sb-report-score__legend">
              <p><strong>Правильных ответов:</strong> {correct} из {total}</p>
              <p><strong>Ошибок:</strong> {errorCount}</p>
            </div>
          </div>

          {errorCount > 0 && (
            <div className="sb-report-section">
              <p className="sb-report-section__title">Вопросы с ошибками:</p>
              <ul className="sb-report-errs">
                {(session?.errors || []).map(idx => {
                  const q = questions[idx]
                  return q ? (
                    <li key={idx}>{q.content?.text || `Вопрос ${idx + 1}`}</li>
                  ) : null
                })}
              </ul>
            </div>
          )}

          <div className="sb-report-section">
            <p className="sb-report-section__title">Рекомендации:</p>
            <p className="sb-report-section__text">
              {pct >= 80
                ? 'Отличный результат! Материал освоен хорошо. Рекомендуем периодически возвращаться к теоретическому блоку для закрепления знаний.'
                : 'Рекомендуем повторить теоретический блок, уделив особое внимание разделам, связанным с вопросами, в которых были допущены ошибки.'}
            </p>
          </div>
        </div>

        <div className="sb-modal__actions">
          <button className="sb-modal__btn sb-modal__btn--secondary" onClick={onBack} id="report-back-btn">
            Вернуться в конструктор
          </button>
          <button className="sb-modal__btn sb-modal__btn--primary" onClick={onPublish} id="report-publish-btn">
            Опубликовать
          </button>
        </div>
      </div>
    </div>
  )
}
