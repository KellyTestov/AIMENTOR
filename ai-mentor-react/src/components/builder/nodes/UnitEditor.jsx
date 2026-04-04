import { useRef } from 'react'
import { useBuilderStore } from '../../../stores/builderStore.js'

const DIRECTION_MAP = {
  'Доставка':       ['Малый и микро бизнес', 'Розничный бизнес'],
  'Урегулирование': ['90-', '90+', 'Выездное'],
  'Сервис':         ['ФЛ Chat', 'ФЛ Voice', 'ЮЛ Chat', 'ЮЛ Voice', 'СвА', 'Эквайринг'],
  'Телемаркетинг':  ['Физ.лица', 'Юр.лица'],
}
const UNIT_FACTORIES  = ['Доставка', 'Урегулирование', 'Сервис', 'Телемаркетинг']
const UNIT_CATEGORIES = ['Продукты', 'Коммуникации', 'Продажи', 'Экзамены', 'Операционные процессы']
const UNIT_TOPICS     = ['Продукты банка', 'Продажи', 'Коммуникации с клиентами', 'Кредитование', 'Карточные продукты', 'Работа с возражениями', 'Комплаенс', 'Управление']
const UNIT_DURATIONS  = ['15 минут', '30 минут', '1 час', '1.5 часа', '2 часа', '2.5 часа', '3 часа']

function countType(node, type) {
  let n = node.type === type ? 1 : 0
  for (const c of (node.children || [])) n += countType(c, type)
  return n
}

async function getCroppedDataUrl(imageSrc) {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width  = 800
      canvas.height = 450
      const ctx = canvas.getContext('2d')
      const scale = Math.max(canvas.width / img.width, canvas.height / img.height)
      const w = img.width  * scale
      const h = img.height * scale
      const x = (canvas.width  - w) / 2
      const y = (canvas.height - h) / 2
      ctx.drawImage(img, x, y, w, h)
      resolve(canvas.toDataURL('image/jpeg', 0.88))
    }
    img.src = imageSrc
  })
}

export default function UnitEditor({ unit }) {
  const { updateUnit } = useBuilderStore()
  const fileRef = useRef(null)

  const sections  = countType(unit, 'section')
  const cases     = countType(unit, 'case')
  const questions = countType(unit, 'question')
  const typeLabel = unit.type === 'trainer' ? 'Тренажёр' : 'Экзамен'
  const curFactory = unit.factory || ''
  const dirOptions = DIRECTION_MAP[curFactory] || []

  function handleCoverFile(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async ev => {
      const dataUrl = await getCroppedDataUrl(ev.target.result)
      updateUnit({ coverDataUrl: dataUrl })
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  function handleFactoryChange(e) {
    updateUnit({ factory: e.target.value, direction: '' })
  }

  return (
    <div className="cv">
      {/* Cover */}
      <div
        className="cu-cover cu-cover--edit"
        onClick={() => fileRef.current?.click()}
        title="Нажмите для изменения обложки"
        style={{ cursor: 'pointer' }}
      >
        {unit.coverDataUrl
          ? <img src={unit.coverDataUrl} alt="Обложка" />
          : <div className="cu-cover-ph">🖼️</div>
        }
        <div className="cu-cover-overlay">
          <span className="cu-cover-overlay__icon">📷</span>
          <span className="cu-cover-overlay__text">
            {unit.coverDataUrl ? 'Изменить обложку' : 'Загрузить обложку'}
          </span>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleCoverFile}
        />
      </div>

      {/* Type + status badges */}
      <div className="cu-type-row">
        <span className="cu-badge">{typeLabel}</span>
        <span className={`cu-pub-badge cu-pub-badge--${unit.publicationStatus === 'published' ? 'pub' : 'priv'}`}>
          {unit.publicationStatus === 'published' ? 'Опубликовано' : 'Черновик'}
        </span>
      </div>

      {/* Metadata selects */}
      <div className="cu-edit-section">
        <div className="cu-edit-row">
          <div className="cu-edit-field cu-edit-field--half">
            <label className="cu-edit-lbl" htmlFor="cu-factory">Фабрика</label>
            <select className="cu-edit-input" id="cu-factory" value={unit.factory || ''} onChange={handleFactoryChange}>
              <option value="">Не выбрана</option>
              {UNIT_FACTORIES.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="cu-edit-field cu-edit-field--half">
            <label className="cu-edit-lbl" htmlFor="cu-direction">Направление</label>
            <select
              className="cu-edit-input" id="cu-direction"
              disabled={dirOptions.length === 0}
              value={unit.direction || ''}
              onChange={e => updateUnit({ direction: e.target.value })}
            >
              <option value="">Не выбрано</option>
              {dirOptions.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>
        <div className="cu-edit-row">
          <div className="cu-edit-field cu-edit-field--half">
            <label className="cu-edit-lbl" htmlFor="cu-category">Категория</label>
            <select className="cu-edit-input" id="cu-category" value={unit.category || ''} onChange={e => updateUnit({ category: e.target.value })}>
              <option value="">Не выбрана</option>
              {UNIT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="cu-edit-field cu-edit-field--half">
            <label className="cu-edit-lbl" htmlFor="cu-topic">Тема</label>
            <select className="cu-edit-input" id="cu-topic" value={unit.topic || ''} onChange={e => updateUnit({ topic: e.target.value })}>
              <option value="">Не выбрана</option>
              {UNIT_TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="cu-edit-field">
          <label className="cu-edit-lbl" htmlFor="cu-duration">Длительность</label>
          <select className="cu-edit-input" id="cu-duration" value={unit.durationLabel || ''} onChange={e => updateUnit({ durationLabel: e.target.value })}>
            <option value="">Не выбрана</option>
            {UNIT_DURATIONS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="cu-edit-field">
          <label className="cu-edit-lbl" htmlFor="cu-desc">Описание</label>
          <textarea
            className="cu-edit-input cu-edit-textarea"
            id="cu-desc"
            rows={3}
            value={unit.description || ''}
            onChange={e => updateUnit({ description: e.target.value })}
            placeholder="Краткое описание единицы обучения..."
          />
        </div>
      </div>

      {/* Stats */}
      <div className="cu-stats">
        <div className="cu-stat">
          <span className="cu-stat__num">{sections}</span>
          <span className="cu-stat__label">Разделов</span>
        </div>
        <div className="cu-stat">
          <span className="cu-stat__num">{cases}</span>
          <span className="cu-stat__label">Кейсов</span>
        </div>
        <div className="cu-stat">
          <span className="cu-stat__num">{questions}</span>
          <span className="cu-stat__label">Вопросов</span>
        </div>
      </div>
    </div>
  )
}
