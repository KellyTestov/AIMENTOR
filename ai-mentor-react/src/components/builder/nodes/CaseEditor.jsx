import { useBuilderStore, makeNode } from '../../../stores/builderStore.js'
import ClientCard from '../ClientCard.jsx'
import InfoTip from '../../shared/InfoTip.jsx'

export default function CaseEditor({ node }) {
  const { updateNodeFull, updateNode, addChild, selectNode } = useBuilderStore()

  const content    = node.content || {}
  const questions  = (node.children || []).filter(c => c.type === 'question')

  function save(patch) {
    updateNodeFull(node.id, { ...content, ...patch })
  }

  function updateClientCard(nextCC) {
    updateNodeFull(node.id, { ...content, clientCard: nextCC })
  }

  function add5Questions() {
    for (let i = 0; i < 5; i++) {
      const num = node.children.length + 1
      node.children.push(makeNode('question', `Вопрос ${num}`, [], { text: '', criteria: [], hints: [], feedback: '' }))
    }
    save({})
  }

  return (
    <div className="cv">
      <div className="cv-title-row">
        <span className="cv-heading-icon">💼</span>
        <input
          className="cv-title-inp"
          value={node.title}
          maxLength={120}
          onChange={e => updateNode(node.id, { title: e.target.value })}
          placeholder="Название кейса..."
        />
      </div>
      <p className="cv-subheading">Сценарий кейса и список вопросов</p>

      <div className="field-block">
        <div className="enrich-section__title">Описание кейса</div>
        <p className="enrich-section__desc">
          Опишите, с какой темой связан данный кейс, сотрудник не увидит эту информацию
        </p>
        <textarea
          className="cv-textarea"
          id="case-desc"
          rows={3}
          value={content.description || ''}
          onChange={e => save({ description: e.target.value })}
          placeholder="Проработка льготного периода по кредитной карте"
        />
      </div>

      <div className="field-block">
        <div className="field-lbl" style={{ marginBottom: 10, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          Карточка клиента
          <InfoTip wide>Настройте карточку клиента, сотрудник проходящий обучения будет видеть ее когда получит сообщение от клиента</InfoTip>
        </div>
        <ClientCard clientCard={content.clientCard} onChange={updateClientCard} />
      </div>

      <div className="field-block">
        <div className="field-lbl" style={{ marginBottom: 10 }}>Вопросы ({questions.length})</div>
        <div className="q-list">
          {questions.length === 0 && (
            <p style={{ color: 'var(--muted-lt)', fontSize: 13, margin: '4px 0' }}>Нет вопросов</p>
          )}
          {questions.map((q, i) => (
            <div key={q.id} className="q-item" onClick={() => selectNode(q.id)} style={{ cursor: 'pointer' }}>
              <span className="q-item__num">{i + 1}</span>
              <span className="q-item__title">{q.title}</span>
              <span className="q-item__check">{q.content && q.content.text ? '✓' : '—'}</span>
            </div>
          ))}
        </div>
        <div className="btn-row" style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button className="add-dashed add-dashed--sm" onClick={() => addChild(node.id)}>
            + Добавить вопрос
          </button>
          <button className="add-dashed add-dashed--sm" onClick={add5Questions}>
            + Добавить 5 вопросов
          </button>
        </div>
      </div>
    </div>
  )
}
