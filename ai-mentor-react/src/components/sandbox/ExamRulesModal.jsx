export default function ExamRulesModal({ unitTitle, onStart, onBack }) {
  return (
    <div className="sb-modal-backdrop">
      <div className="sb-modal sb-modal--wide" id="exam-rules-modal">
        <div className="sb-modal__icon" aria-hidden="true">📋</div>
        <h2 className="sb-modal__title">Правила экзамена</h2>
        <div className="sb-rules-body">
          <ul className="sb-rules-list">
            <li>Экзамен проводится в формате диалога с клиентом. Отвечайте на вопросы развёрнуто и по существу.</li>
            <li>Таймер запускается с первого вопроса и не останавливается до конца экзамена.</li>
            <li>На каждый вопрос отводится ограниченное время. Следите за таймером вопроса.</li>
            <li>Результаты экзамена будут направлены руководителю после завершения.</li>
            <li>Не закрывайте и не обновляйте страницу во время экзамена.</li>
          </ul>
        </div>
        <p className="sb-modal__desc">Вы готовы начать экзамен по теме <strong>«{unitTitle}»</strong>?</p>
        <div className="sb-modal__actions">
          <button className="sb-modal__btn sb-modal__btn--secondary" onClick={onBack} id="exam-rules-back-btn">
            ← Назад
          </button>
          <button className="sb-modal__btn sb-modal__btn--primary" onClick={onStart} id="exam-rules-start-btn">
            Начать экзамен
          </button>
        </div>
      </div>
    </div>
  )
}
