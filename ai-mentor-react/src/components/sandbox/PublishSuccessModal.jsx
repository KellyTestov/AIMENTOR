export default function PublishSuccessModal({ onBackToBuilder, onCatalog }) {
  return (
    <div className="sb-modal-backdrop" id="success-modal">
      <div className="sb-modal sb-modal--compact">
        <div className="sb-modal__icon" aria-hidden="true">🎉</div>
        <h2 className="sb-modal__title">Опубликовано!</h2>
        <p className="sb-modal__desc">Обучение опубликовано и доступно в каталоге.</p>
        <div className="sb-modal__actions" style={{ flexDirection: 'column' }}>
          <button
            className="sb-modal__btn sb-modal__btn--primary sb-modal__btn--full"
            onClick={onBackToBuilder}
            id="success-back-btn"
          >
            Вернуться в конструктор
          </button>
          <button
            className="sb-modal__btn sb-modal__btn--secondary sb-modal__btn--full"
            onClick={onCatalog}
            id="success-catalog-btn"
            style={{ marginTop: 8 }}
          >
            Вернуться в каталог
          </button>
        </div>
      </div>
    </div>
  )
}
