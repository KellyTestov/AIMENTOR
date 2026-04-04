/**
 * ══════════════════════════════════════════════════
 * Toolbar Component
 * ══════════════════════════════════════════════════
 * 
 * Панель инструментов конструктора.
 */

import { PUBLICATION_STATUS_LABELS, PUBLICATION_STATUS } from '../../core/constants.js';
import { EventBus, EventTypes } from '../../core/events.js';
import { Dropdown } from '../../shared/ui/base/dropdown.js';
import { Toast } from '../../shared/ui/base/toast.js';
import { Modal } from '../../shared/ui/base/modal.js';

/**
 * Класс панели инструментов
 */
export class Toolbar {
  /**
   * @param {Object} options
   * @param {HTMLElement} options.container - Контейнер
   * @param {Object} options.unit - Данные unit
   * @param {Object} options.currentUser - Текущий пользователь
   * @param {Function} options.onSave - Callback при сохранении
   * @param {Function} options.onPublish - Callback при публикации
   * @param {Function} options.onPreview - Callback при предпросмотре
   */
  constructor({ container, unit, currentUser, onSave, onPublish, onPreview }) {
    this.container = container;
    this.unit = unit;
    this.currentUser = currentUser;
    this.onSave = onSave;
    this.onPublish = onPublish;
    this.onPreview = onPreview;
    
    this.isDirty = false;
    this.dropdown = null;
    
    this.init();
  }

  /**
   * Инициализирует компонент
   */
  init() {
    this.render();
    this.bindEvents();
  }

  /**
   * Привязывает обработчики событий
   */
  bindEvents() {
    this.container.addEventListener('click', this.handleClick.bind(this));
    
    // События от других компонентов
    EventBus.on(EventTypes.BUILDER_DIRTY_CHANGED, this.onDirtyChanged.bind(this));
  }

  /**
   * Обрабатывает клик
   * @param {Event} e
   */
  handleClick(e) {
    const action = e.target.closest('[data-action]')?.dataset.action;
    
    switch (action) {
      case 'save':
        this.save();
        break;
      case 'publish':
        this.publish();
        break;
      case 'preview':
        this.preview();
        break;
      case 'more':
        this.toggleMoreDropdown();
        break;
      case 'export':
        this.exportUnit();
        break;
      case 'delete':
        this.confirmDelete();
        break;
    }
  }

  /**
   * Сохраняет unit
   */
  async save() {
    try {
      await this.onSave?.();
      this.isDirty = false;
      this.updateDirtyIndicator();
      Toast.show('Сохранено', 'success');
      EventBus.emit(EventTypes.BUILDER_SAVED, { unit: this.unit });
    } catch (error) {
      console.error('Save error:', error);
      Toast.show('Ошибка сохранения', 'error');
    }
  }

  /**
   * Публикует unit
   */
  async publish() {
    const modal = new Modal({
      title: 'Публикация обучения',
      content: `
        <p>Вы уверены, что хотите опубликовать обучение "${this.unit.title}"?</p>
        <p class="text-muted">После публикации обучение станет доступно для прохождения.</p>
      `,
      buttons: [
        { text: 'Отмена', class: 'btn-secondary', action: () => modal.close() },
        { text: 'Опубликовать', class: 'btn-primary', action: async () => {
          try {
            await this.onPublish?.();
            modal.close();
            Toast.show('Обучение опубликовано', 'success');
            EventBus.emit(EventTypes.BUILDER_PUBLISHED, { unit: this.unit });
          } catch (error) {
            console.error('Publish error:', error);
            Toast.show('Ошибка публикации', 'error');
          }
        }},
      ],
    });
    modal.open();
  }

  /**
   * Открывает предпросмотр
   */
  preview() {
    this.onPreview?.();
  }

  /**
   * Переключает выпадающее меню
   */
  toggleMoreDropdown() {
    const dropdown = this.container.querySelector('#more-dropdown');
    if (dropdown) {
      dropdown.classList.toggle('hidden');
    }
  }

  /**
   * Экспортирует unit
   */
  exportUnit() {
    const data = JSON.stringify(this.unit, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.unit.id || 'unit'}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
    Toast.show('Экспорт завершён', 'success');
    
    // Закрываем dropdown
    this.container.querySelector('#more-dropdown')?.classList.add('hidden');
  }

  /**
   * Подтверждает удаление
   */
  confirmDelete() {
    const modal = new Modal({
      title: 'Удаление обучения',
      content: `
        <p>Вы уверены, что хотите удалить обучение "${this.unit.title}"?</p>
        <p class="text-muted text-danger">Это действие нельзя отменить.</p>
      `,
      buttons: [
        { text: 'Отмена', class: 'btn-secondary', action: () => modal.close() },
        { text: 'Удалить', class: 'btn-danger', action: () => {
          // Удаление
          EventBus.emit(EventTypes.BUILDER_DELETED, { unitId: this.unit.id });
          modal.close();
          // Возврат на главную
          window.location.href = './index.html';
        }},
      ],
    });
    modal.open();
  }

  /**
   * Обработчик изменения состояния dirty
   * @param {Object} data
   */
  onDirtyChanged(data) {
    this.isDirty = data.isDirty;
    this.updateDirtyIndicator();
  }

  /**
   * Обновляет индикатор несохранённых изменений
   */
  updateDirtyIndicator() {
    const indicator = this.container.querySelector('.dirty-indicator');
    if (indicator) {
      indicator.classList.toggle('visible', this.isDirty);
    }
    
    const saveBtn = this.container.querySelector('[data-action="save"]');
    if (saveBtn) {
      saveBtn.classList.toggle('btn-highlight', this.isDirty);
    }
  }

  /**
   * Устанавливает unit
   * @param {Object} unit
   */
  setUnit(unit) {
    this.unit = unit;
    this.render();
  }

  /**
   * Рендерит компонент
   */
  render() {
    const statusLabel = PUBLICATION_STATUS_LABELS[this.unit?.publicationStatus] || 'Черновик';
    
    this.container.innerHTML = `
      <div class="toolbar-content">
        <div class="toolbar-left">
          <a href="./index.html" class="toolbar-back" title="На главную">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
            </svg>
          </a>
          
          <div class="toolbar-title">
            <input type="text" id="unit-title-input" value="${this.escapeHtml(this.unit?.title || '')}" placeholder="Название обучения">
            <span class="dirty-indicator ${this.isDirty ? 'visible' : ''}">●</span>
          </div>
          
          <div class="toolbar-status">
            <span class="status-badge status-${this.unit?.publicationStatus || 'draft'}">${statusLabel}</span>
          </div>
        </div>
        
        <div class="toolbar-right">
          <button class="btn btn-secondary" data-action="preview" title="Предпросмотр">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
            </svg>
            <span>Предпросмотр</span>
          </button>
          
          <button class="btn btn-primary ${this.isDirty ? 'btn-highlight' : ''}" data-action="save">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
            </svg>
            <span>Сохранить</span>
          </button>
          
          <button class="btn btn-success" data-action="publish">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            <span>Опубликовать</span>
          </button>
          
          <div class="toolbar-more">
            <button class="btn btn-icon" data-action="more" title="Дополнительно">
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path fill="currentColor" d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </button>
            
            <div id="more-dropdown" class="dropdown-menu hidden">
              <button class="dropdown-item" data-action="export">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                </svg>
                Экспортировать
              </button>
              <button class="dropdown-item dropdown-item-danger" data-action="delete">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
                Удалить
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Экранирует HTML
   * @param {string} str
   * @returns {string}
   */
  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .replace(/'/g, '&#039;');
  }

  /**
   * Уничтожает компонент
   */
  destroy() {
    this.container.removeEventListener('click', this.handleClick);
    EventBus.off(EventTypes.BUILDER_DIRTY_CHANGED, this.onDirtyChanged);
  }
}

/**
 * Создаёт экземпляр панели инструментов
 * @param {Object} options
 * @returns {Toolbar}
 */
export function createToolbar(options) {
  return new Toolbar(options);
}
