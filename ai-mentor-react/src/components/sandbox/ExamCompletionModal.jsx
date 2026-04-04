export default function ExamCompletionModal({ onBack, onPublish }) {
  return (
    <div className="sb-modal-backdrop" id="completion-modal">
      <div className="sb-modal" id="completion-modal-inner">
        <div className="sb-modal__icon" aria-hidden="true">📬</div>
        <h2 className="sb-modal__title">Экзамен завершён</h2>
        <p className="sb-modal__desc">
          Ваши результаты будут направлены руководителю.<br/>
          <strong>Результат отображается с задержкой 10 минут.</strong>
        </p>
        <div className="sb-modal__actions">
          <button
            className="sb-modal__btn sb-modal__btn--secondary"
            onClick={onBack}
            id="exam-completion-back-btn"
          >
            Вернуться в конструктор
          </button>
          <button
            className="sb-modal__btn sb-modal__btn--primary"
            onClick={onPublish}
            id="exam-completion-publish-btn"
          >
            Опубликовать
          </button>
        </div>
      </div>
    </div>
  )
}
