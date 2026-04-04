import { useState, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useForm } from 'react-hook-form'
import Cropper from 'react-easy-crop'
import { useAppStore } from '../../stores/appStore.js'
import { storage } from '../../core/storage.js'
import { STORAGE_KEYS, FACTORIES, DIRECTION_MAP, UNIT_CATEGORIES, UNIT_TOPICS, UNIT_DURATIONS } from '../../core/constants.js'
import { generateId, initials } from '../../core/utils.js'
import { PROMPT_COVERS } from '../../shared/mock/units.js'

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
      <h2 className="wizard__heading">Выберите тип обучения</h2>
      <p className="wizard__lead">Определите формат: тренажёр для отработки навыков или экзамен для проверки знаний.</p>
      <div className="wizard__type-cards">
        <button className="wizard-type-card" type="button" onClick={() => onSelect('trainer')}>
          <span className="wizard-type-card__icon">🎯</span>
          <span className="wizard-type-card__name">Тренажёр</span>
          <span className="wizard-type-card__hint">Обучение через диалог с AI-ментором. Сотрудник отрабатывает навыки с подсказками.</span>
        </button>
        <button className="wizard-type-card" type="button" onClick={() => onSelect('exam')}>
          <span className="wizard-type-card__icon">📋</span>
          <span className="wizard-type-card__name">Экзамен</span>
          <span className="wizard-type-card__hint">Проверка знаний в формате диалога. Оценка и отчёт направляются руководителю.</span>
        </button>
      </div>
    </div>
  )
}

// ── Шаг 2: Выбор метода ────────────────────────────────────

function StepMethod({ type, onSelect, onShowTemplates }) {
  return (
    <div className="wizard__content">
      <h2 className="wizard__heading">Как создать обучение?</h2>
      <p className="wizard__lead">Начните с нуля или возьмите готовый шаблон для ускорения работы.</p>
      <div className="wizard__type-cards">
        <button className="wizard-type-card" type="button" onClick={() => onSelect('new')}>
          <span className="wizard-type-card__icon">✏️</span>
          <span className="wizard-type-card__name">С нуля</span>
          <span className="wizard-type-card__hint">Создайте новую единицу обучения самостоятельно.</span>
        </button>
        <button className="wizard-type-card" type="button" onClick={onShowTemplates}>
          <span className="wizard-type-card__icon">📂</span>
          <span className="wizard-type-card__name">Из шаблона</span>
          <span className="wizard-type-card__hint">Выберите существующую единицу как основу и адаптируйте её.</span>
        </button>
      </div>
    </div>
  )
}

// ── Шаг 3: Форма ───────────────────────────────────────────

function StepForm({ type, currentUser, units, onSubmit }) {
  const { register, handleSubmit, watch, formState: { isValid } } = useForm({ mode: 'onChange' })

  const [coverSrc, setCoverSrc] = useState(null)       // base64 для отображения
  const [cropSrc, setCropSrc] = useState(null)          // исходник для кроппера
  const [showCropper, setShowCropper] = useState(false)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)

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
                  <label className="wf-label">Название <span className="wf-req">*</span></label>
                  <input className="wf-input" type="text" placeholder="Введите название обучения" maxLength={200}
                    {...register('title', { required: true, validate: (v) => v.trim().length > 0 })} />
                </div>
                {/* Описание */}
                <div className="wf-field wf-field--span2">
                  <label className="wf-label">Описание</label>
                  <textarea className="wf-input wf-textarea" placeholder="Краткое описание (необязательно)" {...register('description')} />
                </div>
                {/* Тема */}
                <div className="wf-field">
                  <label className="wf-label">Тема <span className="wf-req">*</span></label>
                  <select className="wf-input wf-select" {...register('topic', { required: true })}>
                    <option value="">Выберите тему</option>
                    {UNIT_TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                {/* Категория */}
                <div className="wf-field">
                  <label className="wf-label">Категория <span className="wf-req">*</span></label>
                  <select className="wf-input wf-select" {...register('category', { required: true })}>
                    <option value="">Выберите категорию</option>
                    {UNIT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                {/* Длительность */}
                <div className="wf-field">
                  <label className="wf-label">Длительность <span className="wf-req">*</span></label>
                  <select className="wf-input wf-select" {...register('duration', { required: true })}>
                    <option value="">Выберите длительность</option>
                    {UNIT_DURATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                {/* Фабрика */}
                <div className="wf-field">
                  <label className="wf-label">Фабрика <span className="wf-req">*</span></label>
                  <select className="wf-input wf-select" {...register('factory', { required: true })}>
                    <option value="">Выберите фабрику</option>
                    {FACTORIES.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                {/* Направление */}
                <div className="wf-field">
                  <label className="wf-label">Направление</label>
                  <select className="wf-input wf-select" {...register('direction')} disabled={directions.length === 0}>
                    <option value="">Выберите направление</option>
                    {directions.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                {/* Обложка */}
                <div className="wf-field wf-field--span2">
                  <label className="wf-label">Обложка <span className="wf-req">*</span></label>
                  <div
                    className={`wf-cover${isDragOver ? ' is-drag-over' : ''}`}
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setIsDragOver(false); handleFile(e.dataTransfer.files[0]) }}
                  >
                    {coverSrc ? (
                      <div className="wf-cover__preview-wrap">
                        <img src={coverSrc} alt="Обложка" className="wf-cover__preview" />
                        <button className="wf-cover__clear" type="button" onClick={() => setCoverSrc(null)}>×</button>
                      </div>
                    ) : (
                      <label className="wf-cover__label" style={{ cursor: 'pointer' }}>
                        <svg className="wf-cover__upload-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        <div className="wf-cover__label-text">
                          <span className="wf-cover__text">Загрузить обложку</span>
                          <span className="wf-cover__subtext">PNG, JPG, WEBP до 10 МБ · Рекомендуется 16:9</span>
                        </div>
                        <input
                          ref={coverInputRef}
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => handleFile(e.target.files[0])}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <div className="wf-footer">
                <p className="wf-note">* Обязательные поля</p>
                <button
                  className="btn btn--primary wf-submit"
                  type="submit"
                  form="wizard-form"
                  disabled={!isValid || !coverSrc}
                >
                  Создать и открыть конструктор
                </button>
              </div>
            </div>

            {/* Превью */}
            <div className="wf-preview">
              <p className="wf-preview__label">Превью карточки</p>
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
              <button className="btn btn--ghost" type="button" onClick={() => setShowCropper(false)}>Отмена</button>
              <button className="btn btn--primary" type="button" onClick={applyCrop}>Применить</button>
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
  const available = units.filter((u) => u.type === typeLabel)

  return createPortal(
    <div className="modal-backdrop tmpl-backdrop" style={{ zIndex: 40 }}>
      <div className="tmpl-catalog">
        <div className="tmpl-catalog__header">
          <button className="btn btn--ghost" type="button" onClick={onClose}>← Назад</button>
          <div className="tmpl-catalog__titles">
            <h2 className="tmpl-catalog__title">Выберите шаблон</h2>
            <p className="tmpl-catalog__sub">Тип: {typeLabel}</p>
          </div>
          <button className="wizard__close-btn" type="button" onClick={onClose} aria-label="Закрыть">×</button>
        </div>
        {available.length === 0 ? (
          <div className="empty-state" style={{ margin: '20px 22px' }}>
            <h2>Нет шаблонов</h2>
            <p>Пока нет опубликованных единиц данного типа.</p>
          </div>
        ) : (
          <div className="catalog-grid" style={{ overflow: 'auto', padding: '20px 22px 24px', flex: 1 }}>
            {available.map((u) => (
              <article key={u.id} className="card" style={{ cursor: 'pointer' }} onClick={() => onSelect(u)}>
                <div className="card__media-wrap">
                  <img src={u.coverUrl || PROMPT_COVERS[0]} alt="" className="card__media" />
                </div>
                <div className="card__body">
                  <h3 className="card__title">{u.title}</h3>
                  <button className="btn btn--ghost tmpl-select-btn" type="button">Использовать</button>
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

  if (!open) return null

  return createPortal(
    <div className="modal-backdrop wizard-backdrop" style={{ zIndex: 30 }}>
      <div className={`wizard${step === 3 ? ' wizard--step3' : ''}`}>
        {/* Шапка */}
        <div className={`wizard__top${step === 3 ? ' wizard__top--form' : ''}`}>
          {step > 1 ? (
            <button className="wizard__back-btn" type="button" onClick={() => setStep((s) => s - 1)}>← Назад</button>
          ) : (
            <div />
          )}
          <h2 className="wizard__heading-inline">
            {step === 1 ? 'Создать обучение' : step === 2 ? 'Способ создания' : 'Настройки обучения'}
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

      {/* Каталог шаблонов */}
      {showTemplates && (
        <TemplateCatalog
          type={unitType}
          units={units}
          onSelect={(u) => { setShowTemplates(false); setStep(3) }}
          onClose={() => setShowTemplates(false)}
        />
      )}
    </div>,
    document.body,
  )
}
