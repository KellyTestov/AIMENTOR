/**
 * ══════════════════════════════════════════════════
 * Node Editor Component
 * ══════════════════════════════════════════════════
 * 
 * Компонент редактирования узла в конструкторе.
 */

import { NODE_TYPES, QUESTION_TYPES, QUESTION_TYPE_LABELS, CLIENT_CARD_SECTIONS } from '../../core/constants.js';
import { EventBus, EventTypes } from '../../core/events.js';
import { escapeHtml } from '../../core/utils.js';

/**
 * Класс редактора узла
 */
export class NodeEditor {
  /**
   * @param {Object} options
   * @param {HTMLElement} options.container - Контейнер
   * @param {Object} options.node - Текущий узел
   * @param {Function} options.onChange - Callback при изменении
   */
  constructor({ container, node, onChange }) {
    this.container = container;
    this.node = node;
    this.onChange = onChange;
    
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
    this.container.addEventListener('input', this.handleInput.bind(this));
    this.container.addEventListener('change', this.handleChange.bind(this));
    this.container.addEventListener('click', this.handleClick.bind(this));
  }

  /**
   * Обрабатывает ввод
   * @param {Event} e
   */
  handleInput(e) {
    const { name, value } = e.target;
    this.updateNode({ [name]: value });
  }

  /**
   * Обрабатывает изменение
   * @param {Event} e
   */
  handleChange(e) {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    this.updateNode({ [name]: newValue });
  }

  /**
   * Обрабатывает клик
   * @param {Event} e
   */
  handleClick(e) {
    const action = e.target.dataset.action;
    
    if (action === 'add-answer') {
      this.addAnswer();
    } else if (action === 'remove-answer') {
      this.removeAnswer(e.target.dataset.index);
    } else if (action === 'add-criteria') {
      this.addCriteria();
    } else if (action === 'remove-criteria') {
      this.removeCriteria(e.target.dataset.index);
    }
  }

  /**
   * Обновляет узел
   * @param {Object} updates
   */
  updateNode(updates) {
    this.node = { ...this.node, ...updates };
    this.onChange?.(this.node);
    EventBus.emit(EventTypes.BUILDER_NODE_UPDATED, { node: this.node });
  }

  /**
   * Устанавливает текущий узел
   * @param {Object} node
   */
  setNode(node) {
    this.node = node;
    this.render();
  }

  /**
   * Рендерит компонент
   */
  render() {
    if (!this.node) {
      this.container.innerHTML = `
        <div class="editor-empty">
          <div class="editor-empty-icon">👈</div>
          <div class="editor-empty-text">Выберите элемент в дереве</div>
        </div>
      `;
      return;
    }

    const editorContent = this.renderEditor();
    this.container.innerHTML = `
      <div class="node-editor" data-type="${this.node.type}">
        ${editorContent}
      </div>
    `;
  }

  /**
   * Рендерит редактор в зависимости от типа
   * @returns {string}
   */
  renderEditor() {
    switch (this.node.type) {
      case NODE_TYPES.UNIT:
        return this.renderUnitEditor();
      case NODE_TYPES.MODULE:
        return this.renderModuleEditor();
      case NODE_TYPES.TOPIC:
        return this.renderTopicEditor();
      case NODE_TYPES.QUESTION:
        return this.renderQuestionEditor();
      case NODE_TYPES.CONTENT:
        return this.renderContentEditor();
      case NODE_TYPES.CLIENT_CARD:
        return this.renderClientCardEditor();
      case NODE_TYPES.CRITERIA:
        return this.renderCriteriaEditor();
      case NODE_TYPES.HINT:
        return this.renderHintEditor();
      default:
        return '<div class="editor-unknown">Неизвестный тип узла</div>';
    }
  }

  /**
   * Рендерит редактор unit
   * @returns {string}
   */
  renderUnitEditor() {
    return `
      <div class="editor-section">
        <h3 class="editor-title">Основные настройки</h3>
        
        <div class="form-group">
          <label for="title">Название обучения</label>
          <input type="text" id="title" name="title" value="${escapeHtml(this.node.title || '')}" placeholder="Введите название">
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="category">Категория</label>
            <select id="category" name="category">
              <option value="">Выберите категорию</option>
              ${['Продукты', 'Коммуникации', 'Продажи', 'Экзамены', 'Операционные процессы'].map(cat => `
                <option value="${cat}" ${this.node.category === cat ? 'selected' : ''}>${cat}</option>
              `).join('')}
            </select>
          </div>
          
          <div class="form-group">
            <label for="factory">Фабрика</label>
            <select id="factory" name="factory">
              <option value="">Выберите фабрику</option>
              ${['Доставка', 'Урегулирование', 'Сервис', 'Телемаркетинг'].map(f => `
                <option value="${f}" ${this.node.factory === f ? 'selected' : ''}>${f}</option>
              `).join('')}
            </select>
          </div>
        </div>
        
        <div class="form-group">
          <label for="durationLabel">Длительность</label>
          <select id="durationLabel" name="durationLabel">
            <option value="">Выберите длительность</option>
            ${['15 минут', '30 минут', '1 час', '1.5 часа', '2 часа', '2.5 часа', '3 часа'].map(d => `
              <option value="${d}" ${this.node.durationLabel === d ? 'selected' : ''}>${d}</option>
            `).join('')}
          </select>
        </div>
      </div>
    `;
  }

  /**
   * Рендерит редактор модуля
   * @returns {string}
   */
  renderModuleEditor() {
    return `
      <div class="editor-section">
        <h3 class="editor-title">Модуль</h3>
        
        <div class="form-group">
          <label for="title">Название модуля</label>
          <input type="text" id="title" name="title" value="${escapeHtml(this.node.title || '')}" placeholder="Введите название модуля">
        </div>
        
        <div class="form-group">
          <label for="description">Описание</label>
          <textarea id="description" name="description" rows="3" placeholder="Краткое описание модуля">${escapeHtml(this.node.description || '')}</textarea>
        </div>
      </div>
    `;
  }

  /**
   * Рендерит редактор темы
   * @returns {string}
   */
  renderTopicEditor() {
    return `
      <div class="editor-section">
        <h3 class="editor-title">Тема</h3>
        
        <div class="form-group">
          <label for="title">Название темы</label>
          <input type="text" id="title" name="title" value="${escapeHtml(this.node.title || '')}" placeholder="Введите название темы">
        </div>
        
        <div class="form-group">
          <label for="topic">Тема обучения</label>
          <select id="topic" name="topic">
            <option value="">Выберите тему</option>
            ${['Продукты банка', 'Продажи', 'Коммуникации с клиентами', 'Кредитование', 'Карточные продукты', 'Работа с возражениями', 'Комплаенс', 'Управление'].map(t => `
              <option value="${t}" ${this.node.topic === t ? 'selected' : ''}>${t}</option>
            `).join('')}
          </select>
        </div>
      </div>
    `;
  }

  /**
   * Рендерит редактор вопроса
   * @returns {string}
   */
  renderQuestionEditor() {
    const answers = this.node.answers || [];
    
    return `
      <div class="editor-section">
        <h3 class="editor-title">Вопрос</h3>
        
        <div class="form-group">
          <label for="questionType">Тип вопроса</label>
          <select id="questionType" name="questionType">
            ${Object.entries(QUESTION_TYPE_LABELS).map(([value, label]) => `
              <option value="${value}" ${this.node.questionType === value ? 'selected' : ''}>${label}</option>
            `).join('')}
          </select>
        </div>
        
        <div class="form-group">
          <label for="question">Текст вопроса</label>
          <textarea id="question" name="question" rows="3" placeholder="Введите текст вопроса">${escapeHtml(this.node.question || '')}</textarea>
        </div>
        
        <div class="form-group">
          <label>Варианты ответов</label>
          <div class="answers-list">
            ${answers.map((answer, index) => `
              <div class="answer-item">
                <input type="text" name="answer-${index}" value="${escapeHtml(answer.text || '')}" placeholder="Вариант ответа" data-answer-index="${index}">
                <label class="answer-correct">
                  <input type="checkbox" name="answer-correct-${index}" ${answer.correct ? 'checked' : ''} data-answer-correct="${index}">
                  Верный
                </label>
                <button type="button" class="btn btn-icon" data-action="remove-answer" data-index="${index}">
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              </div>
            `).join('')}
          </div>
          <button type="button" class="btn btn-secondary" data-action="add-answer">Добавить вариант</button>
        </div>
        
        <div class="form-group">
          <label for="explanation">Объяснение</label>
          <textarea id="explanation" name="explanation" rows="2" placeholder="Объяснение правильного ответа">${escapeHtml(this.node.explanation || '')}</textarea>
        </div>
      </div>
    `;
  }

  /**
   * Рендерит редактор контента
   * @returns {string}
   */
  renderContentEditor() {
    return `
      <div class="editor-section">
        <h3 class="editor-title">Контент</h3>
        
        <div class="form-group">
          <label for="title">Заголовок</label>
          <input type="text" id="title" name="title" value="${escapeHtml(this.node.title || '')}" placeholder="Заголовок контента">
        </div>
        
        <div class="form-group">
          <label for="text">Текст</label>
          <textarea id="text" name="text" rows="6" placeholder="Основной текст контента">${escapeHtml(this.node.text || '')}</textarea>
        </div>
        
        <div class="form-group">
          <label for="mediaUrl">URL медиа</label>
          <input type="text" id="mediaUrl" name="mediaUrl" value="${escapeHtml(this.node.mediaUrl || '')}" placeholder="Ссылка на изображение или видео">
        </div>
      </div>
    `;
  }

  /**
   * Рендерит редактор клиентской карты
   * @returns {string}
   */
  renderClientCardEditor() {
    return `
      <div class="editor-section">
        <h3 class="editor-title">Клиентская карта</h3>
        
        <div class="form-group">
          <label for="title">Название</label>
          <input type="text" id="title" name="title" value="${escapeHtml(this.node.title || '')}" placeholder="Название клиентской карты">
        </div>
        
        <div class="form-group">
          <label>Отображаемые секции</label>
          <div class="checkbox-group">
            ${CLIENT_CARD_SECTIONS.map(section => `
              <label class="checkbox-item">
                <input type="checkbox" name="section-${section.key}" ${(this.node.sections || []).includes(section.key) ? 'checked' : ''} data-section="${section.key}">
                ${section.title}
              </label>
            `).join('')}
          </div>
        </div>
        
        <div class="form-group">
          <label for="scenario">Сценарий</label>
          <textarea id="scenario" name="scenario" rows="4" placeholder="Описание сценария работы с клиентской картой">${escapeHtml(this.node.scenario || '')}</textarea>
        </div>
      </div>
    `;
  }

  /**
   * Рендерит редактор критерия
   * @returns {string}
   */
  renderCriteriaEditor() {
    const criteria = this.node.criteria || [];
    
    return `
      <div class="editor-section">
        <h3 class="editor-title">Критерии оценки</h3>
        
        <div class="form-group">
          <label>Критерии</label>
          <div class="criteria-list">
            ${criteria.map((c, index) => `
              <div class="criteria-item">
                <input type="text" name="criteria-${index}" value="${escapeHtml(c.text || '')}" placeholder="Критерий" data-criteria-index="${index}">
                <input type="number" name="criteria-weight-${index}" value="${c.weight || 1}" min="1" max="10" class="criteria-weight" data-criteria-weight="${index}">
                <button type="button" class="btn btn-icon" data-action="remove-criteria" data-index="${index}">
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
              </div>
            `).join('')}
          </div>
          <button type="button" class="btn btn-secondary" data-action="add-criteria">Добавить критерий</button>
        </div>
      </div>
    `;
  }

  /**
   * Рендерит редактор подсказки
   * @returns {string}
   */
  renderHintEditor() {
    return `
      <div class="editor-section">
        <h3 class="editor-title">Подсказка</h3>
        
        <div class="form-group">
          <label for="text">Текст подсказки</label>
          <textarea id="text" name="text" rows="4" placeholder="Текст подсказки для обучающегося">${escapeHtml(this.node.text || '')}</textarea>
        </div>
        
        <div class="form-group">
          <label for="trigger">Условие показа</label>
          <select id="trigger" name="trigger">
            <option value="manual" ${this.node.trigger === 'manual' ? 'selected' : ''}>По запросу</option>
            <option value="wrong" ${this.node.trigger === 'wrong' ? 'selected' : ''}>При неверном ответе</option>
            <option value="timeout" ${this.node.trigger === 'timeout' ? 'selected' : ''}>По таймеру</option>
          </select>
        </div>
      </div>
    `;
  }

  /**
   * Добавляет вариант ответа
   */
  addAnswer() {
    const answers = this.node.answers || [];
    answers.push({ text: '', correct: false });
    this.updateNode({ answers });
    this.render();
  }

  /**
   * Удаляет вариант ответа
   * @param {number} index
   */
  removeAnswer(index) {
    const answers = [...(this.node.answers || [])];
    answers.splice(index, 1);
    this.updateNode({ answers });
    this.render();
  }

  /**
   * Добавляет критерий
   */
  addCriteria() {
    const criteria = this.node.criteria || [];
    criteria.push({ text: '', weight: 1 });
    this.updateNode({ criteria });
    this.render();
  }

  /**
   * Удаляет критерий
   * @param {number} index
   */
  removeCriteria(index) {
    const criteria = [...(this.node.criteria || [])];
    criteria.splice(index, 1);
    this.updateNode({ criteria });
    this.render();
  }

  /**
   * Уничтожает компонент
   */
  destroy() {
    this.container.removeEventListener('input', this.handleInput);
    this.container.removeEventListener('change', this.handleChange);
    this.container.removeEventListener('click', this.handleClick);
  }
}

/**
 * Создаёт экземпляр редактора узла
 * @param {Object} options
 * @returns {NodeEditor}
 */
export function createNodeEditor(options) {
  return new NodeEditor(options);
}
