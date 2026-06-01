import { useBuilderStore } from '../../../stores/builderStore.js'
import InfoTip from '../../shared/InfoTip.jsx'

function countType(node, type) {
  let n = node.type === type ? 1 : 0
  for (const c of (node.children || [])) n += countType(c, type)
  return n
}

function sumQuestionMaxScores(node) {
  let sum = 0
  function walk(n) {
    if (n.type === 'question') {
      sum += parseInt(n.content?.maxScore || 0) || 0
    }
    ;(n.children || []).forEach(walk)
  }
  ;(node.children || []).forEach(walk)
  return sum
}

export default function PracticeEditor({ node }) {
  const { selectNode, addChild, reorderChildren, updateNodeContent } = useBuilderStore()
  const sections = (node.children || []).filter(c => c.type === 'section')
  const total    = sections.length

  const content        = node.content || {}
  const maxScore       = content.maxScore       ?? ''
  const passingScore   = content.passingScore   ?? ''
  const onFail         = content.onFail         || 'fail'
  const retryTitle     = content.retryTitle     ?? ''
  const retryText      = content.retryText      ?? ''

  const totalQScore  = sumQuestionMaxScores(node)
  const maxScoreNum  = parseInt(maxScore) || 0
  const showOverflow = maxScoreNum > 0 && totalQScore > maxScoreNum

  function save(patch) {
    updateNodeContent(node.id, patch)
  }

  function handleDragStart(e, idx) {
    e.dataTransfer.setData('text/plain', String(idx))
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDrop(e, toIdx) {
    e.preventDefault()
    const fromIdx = parseInt(e.dataTransfer.getData('text/plain'))
    if (isNaN(fromIdx) || fromIdx === toIdx) return
    reorderChildren(node.id, fromIdx, toIdx)
  }

  return (
    <div className="cv">
      <h2 className="cv-heading">
        <span className="cv-heading-icon">🎯</span>{node.title}
      </h2>
      <p className="cv-subheading">Разделы следуют друг за другом — перетащите для изменения порядка</p>

      {/* Scoring settings */}
      <div className="prac-scoring">
        <div className="prac-scoring__head">
          <span className="prac-scoring__title">Система оценивания</span>
          <InfoTip wide>
            Задайте максимальный балл за всю единицу обучения и минимальный порог для прохождения.
            Максимальный балл за каждый вопрос устанавливается в карточке вопроса — там же распределяется по критериям.
          </InfoTip>
        </div>

        <div className="prac-scoring__fields">
          <div className="prac-scoring__field">
            <label className="field-lbl">Максимальный балл</label>
            <div className="prac-scoring__inp-wrap">
              <input
                type="number"
                className="cv-inp prac-scoring__inp"
                min="0"
                max="9999"
                value={maxScore}
                placeholder="Не задан"
                onChange={e => save({ maxScore: parseInt(e.target.value) || '' })}
              />
              <span className="prac-scoring__unit">б.</span>
            </div>
            {maxScoreNum > 0 && totalQScore > 0 && (
              <span className="prac-scoring__sub">
                По вопросам: {totalQScore} б.
              </span>
            )}
          </div>

          <div className="prac-scoring__field">
            <label className="field-lbl">Минимальный балл для прохождения</label>
            <div className="prac-scoring__inp-wrap">
              <input
                type="number"
                className="cv-inp prac-scoring__inp"
                min="0"
                max="9999"
                value={passingScore}
                placeholder="Не задан"
                onChange={e => save({ passingScore: parseInt(e.target.value) || '' })}
              />
              <span className="prac-scoring__unit">б.</span>
            </div>
          </div>
        </div>

        {showOverflow && (
          <div className="prac-scoring__warn">
            ⚠️ Сумма максимальных баллов по вопросам ({totalQScore} б.) превышает
            максимальный балл за единицу обучения ({maxScoreNum} б.). Скорректируйте баллы в вопросах
            или увеличьте максимум.
          </div>
        )}

        {(passingScore !== '') && (
          <>
            <label className="field-lbl" style={{ marginTop: 16 }}>При недостаточном балле</label>
            <div className="compl-expire-options">
              <label className="compl-radio">
                <input
                  type="radio"
                  name={`prac-onFail-${node.id}`}
                  value="fail"
                  checked={onFail === 'fail'}
                  onChange={() => save({ onFail: 'fail' })}
                />
                <span>Завершить единицу обучения как «Неуспешную»</span>
              </label>
              <label className="compl-radio">
                <input
                  type="radio"
                  name={`prac-onFail-${node.id}`}
                  value="retry"
                  checked={onFail === 'retry'}
                  onChange={() => save({ onFail: 'retry' })}
                />
                <span>
                  Предложить пройти ещё раз — показать модальное окно с кнопками
                  «Пройти ещё раз» и «Завершить»
                </span>
              </label>
            </div>

            {onFail === 'retry' && (
              <div className="prac-retry-fields">
                <label className="field-lbl">Заголовок модального окна</label>
                <input
                  className="cv-inp"
                  value={retryTitle}
                  placeholder="Недостаточный балл"
                  onChange={e => save({ retryTitle: e.target.value })}
                />
                <label className="field-lbl" style={{ marginTop: 10 }}>Текст сообщения</label>
                <textarea
                  className="cv-textarea"
                  rows={2}
                  value={retryText}
                  placeholder="К сожалению, вы не набрали минимальный балл. Хотите пройти обучение ещё раз?"
                  onChange={e => save({ retryText: e.target.value })}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Sections list */}
      <div className="th-sequence">
        {sections.length === 0 && (
          <p style={{ color: 'var(--muted-lt)', fontSize: 13, margin: '4px 0' }}>Нет разделов</p>
        )}
        {sections.map((s, idx) => (
          <div
            key={s.id}
            className="th-seq-item"
            draggable
            onDragStart={e => handleDragStart(e, idx)}
            onDragOver={e => e.preventDefault()}
            onDrop={e => handleDrop(e, idx)}
          >
            <div className="th-seq-item__track">
              <div className="th-seq-item__dot" />
              {idx < total - 1 && <div className="th-seq-item__line" />}
            </div>
            <div className="item-card th-seq-item__card" onClick={() => selectNode(s.id)} style={{ cursor: 'pointer' }}>
              <span className="item-card__icon">📁</span>
              <span className="item-card__title">{s.title}</span>
              <span className="item-card__meta">
                {countType(s, 'case')} кейс · {countType(s, 'question')} вопр.
              </span>
              <span className="item-card__arrow">›</span>
            </div>
          </div>
        ))}
      </div>

      <button className="add-dashed" onClick={() => addChild(node.id)}>
        + Добавить раздел
      </button>
    </div>
  )
}
