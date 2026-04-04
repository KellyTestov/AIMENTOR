export default function ResumeModal({ onContinue, onBack }) {
  return (
    <div className="sb-modal-backdrop" id="resume-modal">
      <div className="sb-modal">
        <div className="sb-modal__icon" aria-hidden="true">⏸️</div>
        <h2 className="sb-modal__title">Продолжить экзамен?</h2>
        <p className="sb-modal__desc">
          Сессия была прервана. Вы можете продолжить с того места, где остановились.
        </p>
        <div className="sb-modal__actions">
          <button className="sb-modal__btn sb-modal__btn--secondary" onClick={onBack}>
            ← Вернуться
          </button>
          <button className="sb-modal__btn sb-modal__btn--primary" onClick={onContinue} id="resume-continue-btn">
            Продолжить
          </button>
        </div>
      </div>
    </div>
  )
}
