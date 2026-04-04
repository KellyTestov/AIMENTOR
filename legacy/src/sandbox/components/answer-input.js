/**
 * ══════════════════════════════════════════════════
 * Answer Input Component
 * ══════════════════════════════════════════════════
 * 
 * Компонент ввода ответа в песочнице.
 */

import { QUESTION_TYPES } from '../../core/constants.js';
import { escapeHtml } from '../../core/utils.js';
import { EventBus, EventTypes } from '../../core/events.js';

/**
 * Класс компонента ввода ответа
 */
export class AnswerInput {
  /**
   * @param {Object} options
   * @param {HTMLElement} options.container - Контейнер
   * @param {Object} options.question - Данные вопроса
   * @param {Function} options.onSubmit - Callback при отправке ответа
   */
  constructor({ container, question, onSubmit }) {
    this.container = container;
    this.question = question;
    this.onSubmit = onSubmit;
    
    this.selectedAnswers = [];
    this.textAnswer = '';
    
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
    this.container.addEventListener('change', this.handleChange.bind(this));
    this.container.addEventListener('input', this.handleInput.bind(this));
  }

  /**
   * Обрабатывает клик
   * @param {Event} e
   */
  handleClick(e) {
    const action = e.target.dataset.action;
    
    if (action === 'submit') {
      this.submitAnswer();
    } else if (action === 'hint') {
      this.showHint();
    }
  }

  /**
   * Обрабатывает изменение
   * @param {Event} e
   */
  handleChange(e) {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox' || type === 'radio') {
      if (checked) {
        if (type === 'radio') {
          this.selectedAnswers = [value];
        } else {
          if (!this.selectedAnswers.includes(value)) {
            this.selectedAnswers.push(value);
          }
        }
      } else {
        this.selectedAnswers = this.selectedAnswers.filter(a => a !== value);
      }
    }
  }

  /**
   * Обрабатывает ввод текста
   * @param {Event} e
   */
  handleInput(e) {
    if (e.target.name === 'textAnswer') {
      this.textAnswer = e.target.value;
    }
  }

  /**
   * Устанавливает вопрос
   * @param {Object} question
   */
  setQuestion(question) {
    this.question = question;
    this.selectedAnswers = [];
    this.textAnswer = '';
    this.render();
  }

  /**
   * Отправляет ответ
   */
  submitAnswer() {
    const answer = this.getAnswer();
    
    if (!this.validateAnswer()) {
      return;
    }
    
    this.onSubmit?.(answer);
    EventBus.emit(EventTypes.SANDBOX_QUESTION_ANSWERED, { answer });
  }

  /**
   * Возвращает ответ
   * @returns {Object}
   */
  getAnswer() {
    const questionType = this.question.questionType;
    
    switch (questionType) {
      case QUESTION_TYPES.SINGLE:
      case QUESTION_TYPES.MULTIPLE:
        return {
          type: questionType,
          selected: this.selectedAnswers,
        };
      case QUESTION_TYPES.TEXT:
        return {
          type: questionType,
          text: this.textAnswer,
        };
      case QUESTION_TYPES.ORDER:
        return {
          type: questionType,
          order: this.selectedAnswers,
        };
      default:
        return { type: questionType };
    }
  }

  /**
   * Валидирует ответ
   * @returns {boolean}
   */
  validateAnswer() {
    const questionType = this.question.questionType;
    
    switch (questionType) {
      case QUESTION_TYPES.SINGLE:
        return this.selectedAnswers.length === 1;
      case QUESTION_TYPES.MULTIPLE:
        return this.selectedAnswers.length > 0;
      case QUESTION_TYPES.TEXT:
        return this.textAnswer.trim().length > 0;
      default:
        return true;
    }
  }

  /**
   * Показывает подсказку
   */
  showHint() {
    const hint = this.question.hint || 'Подсказка недоступна';
    EventBus.emit(EventTypes.TOAST_SHOW, { message: hint, type: 'info' });
  }

  /**
   * Рендерит компонент
   */
  render() {
    if (!this.question) {
      this.container.innerHTML = '';
      return;
    }

    this.container.innerHTML = `
      <div class="answer-input">
        ${this.renderAnswerOptions()}
        
        <div class="answer-actions">
          ${this.question.hint ? `
            <button class="btn btn-secondary" data-action="hint">
              💡 Подсказка
            </button>
          ` : ''}
          <button class="btn btn-primary" data-action="submit">
            Ответить
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Рендерит варианты ответов
   * @returns {string}
   */
  renderAnswerOptions() {
    const questionType = this.question.questionType;
    
    switch (questionType) {
      case QUESTION_TYPES.SINGLE:
        return this.renderSingleChoice();
      case QUESTION_TYPES.MULTIPLE:
        return this.renderMultipleChoice();
      case QUESTION_TYPES.TEXT:
        return this.renderTextInput();
      case QUESTION_TYPES.ORDER:
        return this.renderOrderInput();
      default:
        return '<div class="answer-unknown">Неизвестный тип вопроса</div>';
    }
  }

  /**
   * Рендерит выбор одного варианта
   * @returns {string}
   */
  renderSingleChoice() {
    const answers = this.question.answers || [];
    
    return `
      <div class="answer-options answer-single">
        ${answers.map((answer, index) => `
          <label class="answer-option">
            <input type="radio" name="answer" value="${index}">
            <span class="answer-label">${escapeHtml(answer.text || '')}</span>
          </label>
        `).join('')}
      </div>
    `;
  }

  /**
   * Рендерит выбор нескольких вариантов
   * @returns {string}
   */
  renderMultipleChoice() {
    const answers = this.question.answers || [];
    
    return `
      <div class="answer-options answer-multiple">
        <div class="answer-hint">Выберите все подходящие варианты</div>
        ${answers.map((answer, index) => `
          <label class="answer-option">
            <input type="checkbox" name="answer" value="${index}">
            <span class="answer-label">${escapeHtml(answer.text || '')}</span>
          </label>
        `).join('')}
      </div>
    `;
  }

  /**
   * Рендерит текстовый ввод
   * @returns {string}
   */
  renderTextInput() {
    return `
      <div class="answer-text">
        <textarea 
          name="textAnswer" 
          placeholder="Введите ваш ответ..."
          rows="4"
        >${escapeHtml(this.textAnswer)}</textarea>
      </div>
    `;
  }

  /**
   * Рендерит ввод порядка
   * @returns {string}
   */
  renderOrderInput() {
    const answers = this.question.answers || [];
    
    return `
      <div class="answer-order">
        <div class="answer-hint">Расположите элементы в правильном порядке</div>
        <div class="order-list">
          ${answers.map((answer, index) => `
            <div class="order-item" draggable="true" data-index="${index}">
              <span class="order-number">${index + 1}</span>
              <span class="order-text">${escapeHtml(answer.text || '')}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Уничтожает компонент
   */
  destroy() {
    this.container.removeEventListener('click', this.handleClick);
    this.container.removeEventListener('change', this.handleChange);
    this.container.removeEventListener('input', this.handleInput);
  }
}

/**
 * Создаёт экземпляр компонента ввода ответа
 * @param {Object} options
 * @returns {AnswerInput}
 */
export function createAnswerInput(options) {
  return new AnswerInput(options);
}
