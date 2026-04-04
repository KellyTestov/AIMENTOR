/**
 * ══════════════════════════════════════════════════
 * Question View Component
 * ══════════════════════════════════════════════════
 * 
 * Компонент отображения вопроса в песочнице.
 */

import { QUESTION_TYPE_LABELS } from '../../core/constants.js';
import { escapeHtml } from '../../core/utils.js';

/**
 * Класс компонента вопроса
 */
export class QuestionView {
  /**
   * @param {Object} options
   * @param {HTMLElement} options.container - Контейнер
   * @param {Object} options.question - Данные вопроса
   * @param {number} options.index - Индекс вопроса
   * @param {number} options.total - Общее количество вопросов
   */
  constructor({ container, question, index, total }) {
    this.container = container;
    this.question = question;
    this.index = index;
    this.total = total;
    
    this.init();
  }

  /**
   * Инициализирует компонент
   */
  init() {
    this.render();
  }

  /**
   * Устанавливает вопрос
   * @param {Object} question
   * @param {number} index
   */
  setQuestion(question, index) {
    this.question = question;
    this.index = index;
    this.render();
  }

  /**
   * Рендерит компонент
   */
  render() {
    if (!this.question) {
      this.container.innerHTML = `
        <div class="question-empty">
          Нет вопросов для отображения
        </div>
      `;
      return;
    }

    this.container.innerHTML = `
      <div class="question-view">
        <div class="question-header">
          <div class="question-number">
            Вопрос ${this.index + 1} из ${this.total}
          </div>
          <div class="question-type">
            ${QUESTION_TYPE_LABELS[this.question.questionType] || 'Вопрос'}
          </div>
        </div>
        
        <div class="question-body">
          <div class="question-text">
            ${escapeHtml(this.question.question || '')}
          </div>
          
          ${this.question.mediaUrl ? `
            <div class="question-media">
              <img src="${this.question.mediaUrl}" alt="Изображение к вопросу">
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Уничтожает компонент
   */
  destroy() {
    // Очистка
  }
}

/**
 * Создаёт экземпляр компонента вопроса
 * @param {Object} options
 * @returns {QuestionView}
 */
export function createQuestionView(options) {
  return new QuestionView(options);
}
