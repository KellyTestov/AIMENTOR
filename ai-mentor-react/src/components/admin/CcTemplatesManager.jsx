import { useState, useMemo } from 'react'
import { Button } from '@alfalab/core-components/button/esm'
import { Input } from '@alfalab/core-components/input/esm'
import { ModalDesktop } from '@alfalab/core-components/modal/esm/desktop'
import { useCcTemplatesStore, genTemplateId } from '../../stores/ccTemplatesStore.js'
import ConfirmModal from '../shared/ConfirmModal.jsx'

function newField() {
  return { id: genTemplateId('fld'), label: '', placeholder: '' }
}
function newSection() {
  return {
    id: genTemplateId('sec'),
    title: 'Новый раздел',
    collapsible: true,
    fields: [newField()],
  }
}

/**
 * Менеджер шаблонов карточки клиента для админки бизнес-линии.
 * Создание / редактирование / удаление кастомных шаблонов BL.
 * Шаблоны затем доступны методологам в конструкторе.
 *
 * Props:
 *   businessLine: string (id BL — например 'rb')
 *   blName: string (полное имя BL)
 */
export default function CcTemplatesManager({ businessLine, blName }) {
  const templates = useCcTemplatesStore((s) =>
    s.templates.filter((t) => t.businessLine === businessLine)
  )
  const add = useCcTemplatesStore((s) => s.add)
  const update = useCcTemplatesStore((s) => s.update)
  const remove = useCcTemplatesStore((s) => s.remove)

  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState(null) // template object or null
  const [confirmDelete, setConfirmDelete] = useState(null)

  function startCreate() {
    setEditing({
      id: null,
      name: '',
      description: '',
      icon: '📋',
      businessLine,
      sections: [newSection()],
    })
    setEditorOpen(true)
  }

  function startEdit(tpl) {
    setEditing(JSON.parse(JSON.stringify(tpl)))
    setEditorOpen(true)
  }

  function saveTemplate() {
    if (!editing.name.trim()) return
    if (editing.id) {
      update(editing.id, editing)
    } else {
      add(editing)
    }
    setEditorOpen(false)
    setEditing(null)
  }

  return (
    <div className="cct-mgr">
      <div className="cct-mgr__head">
        <div>
          <h2 className="cct-mgr__title">Шаблоны карточки клиента</h2>
          <p className="cct-mgr__desc">
            Готовые структуры карточек для бизнес-линии {blName}.
            Появляются у методологов в конструкторе при создании кейса.
          </p>
        </div>
        <Button view="accent" size={40} onClick={startCreate}>
          + Создать шаблон
        </Button>
      </div>

      {templates.length === 0 ? (
        <div className="cct-mgr__empty">
          <div className="cct-mgr__empty-icon">📋</div>
          <div className="cct-mgr__empty-title">Шаблонов ещё нет</div>
          <div className="cct-mgr__empty-desc">
            Создайте первый шаблон карточки клиента, чтобы методологи могли его использовать.
          </div>
        </div>
      ) : (
        <div className="cct-mgr__list">
          {templates.map((tpl) => (
            <div key={tpl.id} className="cct-mgr__card">
              <div className="cct-mgr__card-icon">{tpl.icon}</div>
              <div className="cct-mgr__card-body">
                <div className="cct-mgr__card-title">{tpl.name}</div>
                {tpl.description && (
                  <div className="cct-mgr__card-desc">{tpl.description}</div>
                )}
                <div className="cct-mgr__card-meta">
                  {tpl.sections.length} разделов ·{' '}
                  {tpl.sections.reduce((acc, s) => acc + s.fields.length, 0)} полей
                </div>
              </div>
              <div className="cct-mgr__card-actions">
                <button type="button" className="cct-mgr__btn" onClick={() => startEdit(tpl)}>
                  Редактировать
                </button>
                <button
                  type="button"
                  className="cct-mgr__btn cct-mgr__btn--danger"
                  onClick={() => setConfirmDelete(tpl)}
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor modal */}
      {editing && (
        <CcTemplateEditor
          open={editorOpen}
          template={editing}
          onChange={setEditing}
          onSave={saveTemplate}
          onCancel={() => { setEditorOpen(false); setEditing(null) }}
        />
      )}

      <ConfirmModal
        open={!!confirmDelete}
        title="Удалить шаблон?"
        description={confirmDelete ? `Шаблон <strong>${confirmDelete.name}</strong> будет удалён. У существующих кейсов он останется, но больше не будет доступен в выборе.` : ''}
        confirmLabel="Удалить"
        onConfirm={() => { remove(confirmDelete.id); setConfirmDelete(null) }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  )
}

// ──────────────────────────────────────
// Editor modal: name + description + sections/fields tree
// ──────────────────────────────────────
function CcTemplateEditor({ open, template, onChange, onSave, onCancel }) {
  const t = template

  function patch(p) { onChange({ ...t, ...p }) }
  function patchSection(secId, sp) {
    onChange({ ...t, sections: t.sections.map((s) => s.id === secId ? { ...s, ...sp } : s) })
  }
  function addSection() {
    onChange({ ...t, sections: [...t.sections, newSection()] })
  }
  function removeSection(secId) {
    onChange({ ...t, sections: t.sections.filter((s) => s.id !== secId) })
  }
  function patchField(secId, fldId, fp) {
    onChange({ ...t, sections: t.sections.map((s) =>
      s.id !== secId ? s :
        { ...s, fields: s.fields.map((f) => f.id === fldId ? { ...f, ...fp } : f) })
    })
  }
  function addField(secId) {
    onChange({ ...t, sections: t.sections.map((s) =>
      s.id !== secId ? s : { ...s, fields: [...s.fields, newField()] })
    })
  }
  function removeField(secId, fldId) {
    onChange({ ...t, sections: t.sections.map((s) =>
      s.id !== secId ? s : { ...s, fields: s.fields.filter((f) => f.id !== fldId) })
    })
  }

  return (
    <ModalDesktop open={open} onClose={onCancel} size={800} hasCloser={false}>
      <ModalDesktop.Header title={t.id ? 'Редактирование шаблона' : 'Создание шаблона'} hasCloser={false} />
      <ModalDesktop.Content>
        <div className="cct-editor">
          <div className="cct-editor__row">
            <div className="cct-editor__field" style={{ flex: 2 }}>
              <label className="cct-editor__label">Название шаблона *</label>
              <Input
                size={40}
                value={t.name}
                onChange={(_, { value }) => patch({ name: value })}
                placeholder="Например: Клиент розничного бизнеса"
                block
              />
            </div>
            <div className="cct-editor__field" style={{ flex: 0, minWidth: 80 }}>
              <label className="cct-editor__label">Иконка</label>
              <Input
                size={40}
                value={t.icon}
                onChange={(_, { value }) => patch({ icon: value || '📋' })}
                placeholder="📋"
                style={{ textAlign: 'center', width: 70 }}
              />
            </div>
          </div>
          <div className="cct-editor__field">
            <label className="cct-editor__label">Описание</label>
            <Input
              size={40}
              value={t.description}
              onChange={(_, { value }) => patch({ description: value })}
              placeholder="Кратко: для какого сценария этот шаблон"
              block
            />
          </div>

          <div className="cct-editor__sections-head">
            <span>Структура карточки</span>
            <button type="button" className="cct-editor__add-btn" onClick={addSection}>
              + Раздел
            </button>
          </div>

          <div className="cct-editor__sections">
            {t.sections.map((sec) => (
              <div key={sec.id} className="cct-editor__sec">
                <div className="cct-editor__sec-head">
                  <Input
                    size={40}
                    value={sec.title}
                    onChange={(_, { value }) => patchSection(sec.id, { title: value })}
                    placeholder="Название раздела"
                    block
                  />
                  <button
                    type="button"
                    className="cct-editor__del-btn"
                    onClick={() => removeSection(sec.id)}
                    title="Удалить раздел"
                  >×</button>
                </div>
                <div className="cct-editor__fields">
                  {sec.fields.map((f) => (
                    <div key={f.id} className="cct-editor__field-row">
                      <Input
                        size={40}
                        value={f.label}
                        onChange={(_, { value }) => patchField(sec.id, f.id, { label: value })}
                        placeholder="Название поля"
                        style={{ flex: 1 }}
                      />
                      <Input
                        size={40}
                        value={f.placeholder}
                        onChange={(_, { value }) => patchField(sec.id, f.id, { placeholder: value })}
                        placeholder="Пример значения (плейсхолдер)"
                        style={{ flex: 1 }}
                      />
                      <button
                        type="button"
                        className="cct-editor__del-btn"
                        onClick={() => removeField(sec.id, f.id)}
                        title="Удалить поле"
                      >×</button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="cct-editor__add-field"
                    onClick={() => addField(sec.id)}
                  >
                    + поле
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 18 }}>
            <Button view="secondary" size={40} onClick={onCancel}>Отмена</Button>
            <Button view="accent" size={40} onClick={onSave} disabled={!t.name.trim()}>
              {t.id ? 'Сохранить' : 'Создать'}
            </Button>
          </div>
        </div>
      </ModalDesktop.Content>
    </ModalDesktop>
  )
}
