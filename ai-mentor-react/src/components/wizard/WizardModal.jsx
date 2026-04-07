import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useForm, Controller } from 'react-hook-form'
import Cropper from 'react-easy-crop'
import { useAppStore } from '../../stores/appStore.js'
import StatusBadge from '../shared/StatusBadge.jsx'
import { storage } from '../../core/storage.js'
import { STORAGE_KEYS, FACTORIES, DIRECTION_MAP, UNIT_CATEGORIES, UNIT_TOPICS, UNIT_DURATIONS } from '../../core/constants.js'
import { generateId, initials } from '../../core/utils.js'
import { PROMPT_COVERS } from '../../shared/mock/units.js'
import { Button } from '@alfalab/core-components/button/esm'
import { Input } from '@alfalab/core-components/input/esm'
import { Textarea } from '@alfalab/core-components/textarea/esm'
import { Select } from '@alfalab/core-components/select/esm'
import { Modal } from '@alfalab/core-components/modal/esm'
import { Dropzone } from '@alfalab/core-components/dropzone/esm'

// ── Утилиты кроппера ───────────────────────────────────────

async function getCroppedImg(imageSrc, croppedAreaPixels) {
  const image = await new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.src = imageSrc
  })
  const canvas = document.createElement('canvas')
  canvas.width = croppedAreaPixels.width
  canvas.height = croppedAreaPixels.height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(
    image,
    croppedAreaPixels.x, croppedAreaPixels.y,
    croppedAreaPixels.width, croppedAreaPixels.height,
    0, 0, croppedAreaPixels.width, croppedAreaPixels.height,
  )
  return canvas.toDataURL('image/jpeg', 0.88)
}

// ── Шаг 1: Выбор типа ─────────────────────────────────────

function StepType({ onSelect }) {
  return (
    <div className="wizard__content">
      <h2 className="wizard__heading">Создание обучения</h2>
      <p className="wizard__lead">Выберите тип обучения для создания</p>
      <div className="wizard__type-cards">
        <button className="wizard-type-card" type="button" onClick={() => onSelect('trainer')}>
          <span className="wizard-type-card__icon">🎯</span>
          <span className="wizard-type-card__name">Тренажёр</span>
          <span className="wizard-type-card__hint">Обучающий диалог с теорией и практикой</span>
        </button>
        <button className="wizard-type-card" type="button" onClick={() => onSelect('exam')}>
          <span className="wizard-type-card__icon">📋</span>
          <span className="wizard-type-card__name">Экзамен</span>
          <span className="wizard-type-card__hint">Проверка знаний без теоретической части</span>
        </button>
      </div>
    </div>
  )
}

// ── Шаг 2: Выбор метода ────────────────────────────────────

function StepMethod({ type, onSelect, onShowTemplates }) {
  const typeLabel = type === 'trainer' ? 'тренажёра' : 'экзамена'
  return (
    <div className="wizard__content">
      <h2 className="wizard__heading">Способ создания</h2>
      <p className="wizard__lead">Выберите способ создания {typeLabel}</p>
      <div className="wizard__type-cards">
        <button className="wizard-type-card" type="button" onClick={() => onSelect('new')}>
          <span className="wizard-type-card__icon">✨</span>
          <span className="wizard-type-card__name">Новое</span>
          <span className="wizard-type-card__hint">Создать новый {typeLabel} с нуля</span>
        </button>
        <button className="wizard-type-card" type="button" onClick={onShowTemplates}>
          <span className="wizard-type-card__icon">📂</span>
          <span className="wizard-type-card__name">Из шаблона</span>
          <span className="wizard-type-card__hint">Использовать существующий {typeLabel} как шаблон</span>
        </button>
      </div>
    </div>
  )
}

// ── Шаг 3: Форма ───────────────────────────────────────────

function StepForm({ type, currentUser, units, onSubmit }) {
  const { register, handleSubmit, watch, control, formState: { isValid } } = useForm({ mode: 'onChange' })

  const [coverSrc, setCoverSrc] = useState(null)       // base64 для отображения
  const [cropSrc, setCropSrc] = useState(null)          // исходник для кроппера
  const [showCropper, setShowCropper] = useState(false)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const selectedFactory = watch('factory')
  const directions = selectedFactory ? DIRECTION_MAP[selectedFactory] || [] : []

  const coverInputRef = useRef(null)

  function handleFile(file) {
    if (!file || !file.type.startsWith('image/')) return
    if (file.size > 10 * 1024 * 1024) { alert('Файл слишком большой (макс. 10 МБ)'); return }
    const reader = new FileReader()
    reader.onload = () => {
      setCropSrc(reader.result)
      setShowCropper(true)
    }
    reader.readAsDataURL(file)
  }

  async function applyCrop() {
    if (!cropSrc || !croppedAreaPixels) return
    const dataUrl = await getCroppedImg(cropSrc, croppedAreaPixels)
    setCoverSrc(dataUrl)
    setShowCropper(false)
  }

  function submit(data) {
    if (!coverSrc) { alert('Добавьте обложку'); return }
    onSubmit({ ...data, coverSrc, type })
  }

  const title = watch('title') || ''
  const duration = watch('duration') || ''
  const previewCover = coverSrc || PROMPT_COVERS[0]

  return (
    <>
      <div className="wizard__form-scroll">
        <form id="wizard-form" onSubmit={handleSubmit(submit)}>
          <div className="wf-layout">
            <div>
              <div className="wf-grid">
                {/* Название */}
                <div className="wf-field wf-field--span2">
                  <Input
                    label="Название обучения *"
                    labelView="outer"
                    size={48}
                    block
                    placeholder="Введите название"
                    maxLength={200}
                    {...register('title', { required: true, validate: (v) => v.trim().length > 0 })}
                    onChange={(e) => register('title').onChange(e)}
                  />
                </div>
                {/* Описание */}
                <div className="wf-field wf-field--span2">
                  <Textarea
                    label="Описание обучения *"
                    labelView="outer"
                    size={48}
                    block
                    placeholder="Краткое описание содержания"
                    {...register('description', { required: true, validate: (v) => v.trim().length > 0 })}
                    onChange={(e) => register('description').onChange(e)}
                  />
                </div>
                {/* Тема */}
                <div className="wf-field">
                  <Controller control={control} name="topic" rules={{ required: true }} render={({ field }) => (
                    <Select
                      label="Тема обучения *"
                      size={48}
                      block
                      options={UNIT_TOPICS.map((t) => ({ key: t, content: t }))}
                      selected={field.value ? { key: field.value, content: field.value } : null}
                      onChange={({ selected }) => field.onChange(selected?.key || '')}
                      optionsListWidth="field"
                    />
                  )} />
                </div>
                {/* Категория */}
                <div className="wf-field">
                  <Controller control={control} name="category" rules={{ required: true }} render={({ field }) => (
                    <Select
                      label="Категория обучения *"
                      size={48}
                      block
                      options={UNIT_CATEGORIES.map((c) => ({ key: c, content: c }))}
                      selected={field.value ? { key: field.value, content: field.value } : null}
                      onChange={({ selected }) => field.onChange(selected?.key || '')}
                      optionsListWidth="field"
                    />
                  )} />
                </div>
                {/* Длительность */}
                <div className="wf-field">
                  <Controller control={control} name="duration" rules={{ required: true }} render={({ field }) => (
                    <Select
                      label="Время прохождения *"
                      size={48}
                      block
                      options={UNIT_DURATIONS.map((d) => ({ key: d, content: d }))}
                      selected={field.value ? { key: field.value, content: field.value } : null}
                      onChange={({ selected }) => field.onChange(selected?.key || '')}
                      optionsListWidth="field"
                    />
                  )} />
                </div>
                {/* Фабрика */}
                <div className="wf-field">
                  <Controller control={control} name="factory" rules={{ required: true }} render={({ field }) => (
                    <Select
                      label="Фабрика *"
                      size={48}
                      block
                      options={FACTORIES.map((f) => ({ key: f, content: f }))}
                      selected={field.value ? { key: field.value, content: field.value } : null}
                      onChange={({ selected }) => field.onChange(selected?.key || '')}
                      optionsListWidth="field"
                    />
                  )} />
                </div>
                {/* Направление */}
                <div className="wf-field">
                  <Controller control={control} name="direction" render={({ field }) => (
                    <Select
                      label="Направление"
                      size={48}
                      block
                      disabled={directions.length === 0}
                      options={directions.map((d) => ({ key: d, content: d }))}
                      selected={field.value ? { key: field.value, content: field.value } : null}
                      onChange={({ selected }) => field.onChange(selected?.key || '')}
                      optionsListWidth="field"
                    />
                  )} />
                </div>
                {/* Обложка */}
                <div className="wf-field wf-field--span2">
                  <label className="wf-label">Обложка <span className="wf-req">*</span></label>
                  {coverSrc ? (
                    <div className="wf-cover__preview-wrap">
                      <img src={coverSrc} alt="Обложка" className="wf-cover__preview" />
                      <button className="wf-cover__clear" type="button" onClick={() => setCoverSrc(null)}>×</button>
                    </div>
                  ) : (
                    <Dropzone
                      block
                      text="Перетащите изображение сюда"
                      className="wf-dropzone"
                      onDrop={(files) => handleFile(files[0])}
                    >
                      <label className="wf-cover__label" style={{ cursor: 'pointer' }}>
                        <svg className="wf-cover__upload-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        <div className="wf-cover__label-text">
                          <span className="wf-cover__text">Перетащите изображение сюда</span>
                          <span className="wf-cover__subtext">или нажмите для выбора файла</span>
                          <span className="wf-cover__subtext">PNG, JPG · до 10 МБ</span>
                        </div>
                        <input
                          ref={coverInputRef}
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => handleFile(e.target.files[0])}
                        />
                      </label>
                    </Dropzone>
                  )}
                </div>
              </div>

              <div className="wf-footer">
                <p className="wf-note">* — обязательные поля</p>
                <Button
                  view="accent"
                  size={48}
                  type="submit"
                  form="wizard-form"
                  disabled={!isValid || !coverSrc}
                >
                  Подтвердить
                </Button>
              </div>
            </div>

            {/* Превью */}
            <div className="wf-preview">
              <p className="wf-preview__label">Предпросмотр карточки</p>
              <div className="wf-preview__card">
                <div className="card" style={{ pointerEvents: 'none' }}>
                  <div className="card__media-wrap">
                    <img src={previewCover} alt="" className="card__media" />
                  </div>
                  <div className="card__body">
                    <h3 className="card__title">{title || 'Название обучения'}</h3>
                    <div className="card__meta">
                      {duration && <span className="meta-badge">{duration}</span>}
                      <span className="meta-badge" style={{ marginLeft: 'auto' }}>Приватное</span>
                      {currentUser && (
                        <span className="author-icon" title={currentUser.name}>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="13" height="13" aria-hidden="true">
                            <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                          </svg>
                          <span className="author-tooltip">{currentUser.name}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Кроппер */}
      {showCropper && createPortal(
        <div className="modal-backdrop" style={{ zIndex: 50 }}>
          <div className="crop-dialog">
            <div className="crop-dialog__head">
              <h3 className="crop-dialog__title">Обложка обучения</h3>
              <p className="crop-dialog__hint">Выберите область для обложки (16:9)</p>
            </div>
            <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#0d0f18', borderRadius: 10, overflow: 'hidden' }}>
              <Cropper
                image={cropSrc}
                crop={crop}
                zoom={zoom}
                aspect={16 / 9}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
              />
            </div>
            <div className="crop-zoom-bar">
              <button className="crop-zoom-btn" type="button" onClick={() => setZoom((z) => Math.max(1, z - 0.1))}>−</button>
              <input className="crop-zoom-range" type="range" min={1} max={3} step={0.01} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} />
              <button className="crop-zoom-btn" type="button" onClick={() => setZoom((z) => Math.min(3, z + 0.1))}>+</button>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <Button view="outlined" size={40} onClick={() => setShowCropper(false)}>Отмена</Button>
              <Button view="accent" size={40} onClick={applyCrop}>Применить</Button>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}

// ── Каталог шаблонов ───────────────────────────────────────

function TemplateCatalog({ type, units, onSelect, onClose }) {
  const typeLabel = type === 'trainer' ? 'Обучающая' : 'Проверяющая'
  const typePlural = type === 'trainer' ? 'тренажеры' : 'экзамены'
  const available = units.filter((u) => u.type === typeLabel)

  return createPortal(
    <div className="modal-backdrop tmpl-backdrop" style={{ zIndex: 40 }}>
      <div className="tmpl-catalog">
        <div className="tmpl-catalog__header">
          <Button view="outlined" size={40} onClick={onClose}>← Назад</Button>
          <div className="tmpl-catalog__titles">
            <h2 className="tmpl-catalog__title">Выбор шаблона</h2>
            <p className="tmpl-catalog__sub">Выберите {typePlural} для использования в качестве шаблона</p>
          </div>
          <button className="wizard__close-btn" type="button" onClick={onClose} aria-label="Закрыть">×</button>
        </div>
        {available.length === 0 ? (
          <div className="empty-state" style={{ margin: '20px 22px' }}>
            <h2>Нет доступных шаблонов</h2>
            <p>Для выбранного типа обучений пока нет созданных единиц.</p>
          </div>
        ) : (
          <div className="catalog-grid" style={{ overflow: 'auto', padding: '20px 22px 24px', flex: 1 }}>
            {available.map((u) => (
              <article key={u.id} className="card">
                <div className="card__media-wrap">
                  <img src={u.coverUrl || PROMPT_COVERS[0]} alt="" className="card__media" />
                </div>
                <div className="card__body">
                  <h3 className="card__title">{u.title}</h3>
                  <div className="card__meta">
                    {u.durationLabel && <span className="meta-badge">{u.durationLabel}</span>}
                    <StatusBadge status={u.publicationStatus} />
                    {u.authorName && (
                      <span className="author-icon" title={u.authorName}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="13" height="13" aria-hidden="true">
                          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                        </svg>
                        <span className="author-tooltip">{u.authorName}</span>
                      </span>
                    )}
                  </div>
                  <Button view="secondary" size={40} onClick={() => onSelect(u)}>Выбрать</Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}

// ── Главный компонент ──────────────────────────────────────

export default function WizardModal({ open, onClose }) {
  const currentUser = useAppStore((s) => s.currentUser)
  const units = useAppStore((s) => s.units)
  const addUnit = useAppStore((s) => s.addUnit)

  const [step, setStep] = useState(1)
  const [unitType, setUnitType] = useState(null)  // 'trainer' | 'exam'
  const [showTemplates, setShowTemplates] = useState(false)

  function handleClose() {
    setStep(1)
    setUnitType(null)
    setShowTemplates(false)
    onClose()
  }

  function selectType(type) {
    setUnitType(type)
    setStep(2)
  }

  function selectMethod(method) {
    if (method === 'new') setStep(3)
  }

  function handleSubmitForm(data) {
    const id = generateId('edu')
    const newUnit = {
      id,
      title:             data.title.trim(),
      description:       data.description?.trim() || '',
      type:              unitType === 'trainer' ? 'Обучающая' : 'Проверяющая',
      topic:             data.topic,
      category:          data.category,
      durationLabel:     data.duration,
      factory:           data.factory,
      direction:         data.direction || '',
      coverUrl:          data.coverSrc,
      authorId:          currentUser.id,
      authorName:        currentUser.name,
      createdAt:         new Date().toISOString(),
      updatedAt:         new Date().toISOString(),
      publicationStatus: 'private',
      launchUrl:         `/sandbox?id=${id}`,
      editUrl:           `/builder?id=${id}`,
    }

    // Сохраняем для builder/builder.js (монолит)
    const stored = storage.getObject(STORAGE_KEYS.BUILDER_DATA, {})
    stored[id] = {
      ...newUnit,
      type:          unitType,
      _isNew:        true,
      durationLabel: data.duration,
      coverDataUrl:  data.coverSrc,
    }
    storage.setObject(STORAGE_KEYS.BUILDER_DATA, stored)

    addUnit(newUnit)
    handleClose()
    sessionStorage.setItem('bld-pending-id', id)
    window.location.href = newUnit.editUrl
  }

  return (
    <>
      <Modal open={open} onClose={handleClose} size={step === 3 ? 800 : 500} hasCloser={false}>
          <div className={`wizard${step === 3 ? ' wizard--step3' : ''}`}>
            {/* Шапка */}
            <div className={`wizard__top${step === 3 ? ' wizard__top--form' : ''}`}>
              {step > 1 ? (
                <Button view="text" size={40} onClick={() => setStep((s) => s - 1)}>← Назад</Button>
              ) : (
                <div />
              )}
              <h2 className="wizard__heading-inline">
                {step === 1 ? 'Создать обучение' : step === 2 ? 'Способ создания' : 'Настройка обучения'}
              </h2>
              <button className="wizard__close-btn" type="button" onClick={handleClose} aria-label="Закрыть">×</button>
            </div>

            {/* Прогресс */}
            <div className="wizard__progress">
              {[1, 2, 3].map((n) => (
                <div key={n} className={`wizard__progress-seg${step >= n ? ' is-fill' : ''}`} />
              ))}
            </div>

            {/* Контент */}
            {step === 1 && <StepType onSelect={selectType} />}
            {step === 2 && <StepMethod type={unitType} onSelect={selectMethod} onShowTemplates={() => setShowTemplates(true)} />}
            {step === 3 && (
              <StepForm
                type={unitType}
                currentUser={currentUser}
                units={units}
                onSubmit={handleSubmitForm}
              />
            )}
          </div>
      </Modal>

      {/* Каталог шаблонов */}
      {showTemplates && (
        <TemplateCatalog
          type={unitType}
          units={units}
          onSelect={() => { setShowTemplates(false); setStep(3) }}
          onClose={() => setShowTemplates(false)}
        />
      )}
    </>
  )
}
