/**
 * ══════════════════════════════════════════════════
 * Result Screen Component
 * ══════════════════════════════════════════════════
 * 
 * Компонент экрана результатов в песочнице.
 */

import { EventBus, EventTypes } from '../../core/events.js';
import { formatDuration } from '../../core/utils.js';

/**
 * Класс компонента результатов
 */
export class ResultScreen {
  /**
   * @param {Object} options
   * @param {HTMLElement} options.container - Контейнер
   * @param {Object} options.results - Результаты сессии
   * @param {Function} options.onRestart - Callback при перезапуске
   * @param {Function} options.onExit - Callback при выходе
   */
  constructor({ container, results, onRestart, onExit }) {
    this.container = container;
    this.results = results;
    this.onRestart = onRestart;
    this.onExit = onExit;
    
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
  }

  /**
   * Обрабатывает клик
   * @param {Event} e
   */
  handleClick(e) {
    const action = e.target.dataset.action;
    
    if (action === 'restart') {
      this.onRestart?.();
    } else if (action === 'exit') {
      this.onExit?.();
    } else if (action === 'review') {
      this.showReview();
    }
  }

  /**
   * Показывает обзор ответов
   */
  showReview() {
    // TODO: Показать модальное окно с обзором ответов
  }

  /**
   * Возвращает оценку по шкале
   * @param {number} percentage
   * @returns {Object}
   */
  getGrade(percentage) {
    if (percentage >= 90) {
      return { label: 'Отлично', color: '#22c55e', emoji: '🏆' };
    } else if (percentage >= 75) {
      return { label: 'Хорошо', color: '#3b82f6', emoji: '👍' };
    } else if (percentage >= 60) {
      return { label: 'Удовлетворительно', color: '#f59e0b', emoji: '👌' };
    } else {
      return { label: 'Требуется доработка', color: '#ef4444', emoji: '📚' };
    }
  }

  /**
   * Рендерит компонент
   */
  render() {
    const { correct, total, time, score } = this.results;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;
    const grade = this.getGrade(percentage);
    
    this.container.innerHTML = `
      <div class="result-screen">
        <div class="result-header">
          <div class="result-emoji">${grade.emoji}</div>
          <h2 class="result-title">${grade.label}</h2>
          <div class="result-subtitle">Тестирование завершено</div>
        </div>
        
        <div class="result-stats">
          <div class="stat-card stat-score">
            <div class="stat-value">${percentage}%</div>
            <div class="stat-label">Результат</div>
          </div>
          
          <div class="stat-card stat-correct">
            <div class="stat-value">${correct}/${total}</div>
            <div class="stat-label">Правильных ответов</div>
          </div>
          
          <div class="stat-card stat-time">
            <div class="stat-value">${formatDuration(time)}</div>
            <div class="stat-label">Время прохождения</div>
          </div>
        </div>
        
        <div class="result-chart">
          <div class="chart-ring" style="--percentage: ${percentage}; --color: ${grade.color}">
            <svg viewBox="0 0 100 100">
              <circle class="chart-bg" cx="50" cy="50" r="45"/>
              <circle class="chart-fill" cx="50" cy="50" r="45"/>
            </svg>
            <div class="chart-center">
              <span class="chart-value">${percentage}</span>
              <span class="chart-unit">%</span>
            </div>
          </div>
        </div>
        
        <div class="result-details">
          ${this.renderDetails()}
        </div>
        
        <div class="result-actions">
          <button class="btn btn-secondary" data-action="review">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
            </svg>
            Посмотреть ответы
          </button>
          <button class="btn btn-primary" data-action="restart">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
            Пройти снова
          </button>
          <button class="btn btn-secondary" data-action="exit">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
            </svg>
            Выйти
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Рендерит детали результатов
   * @returns {string}
   */
  renderDetails() {
    const { answers } = this.results;
    
    if (!answers || answers.length === 0) {
      return '';
    }
    
    const categories = this.groupByCategory(answers);
    
    return `
      <div class="result-breakdown">
        <h4>Результаты по категориям</h4>
        ${Object.entries(categories).map(([category, data]) => `
          <div class="breakdown-item">
            <span class="breakdown-label">${category}</span>
            <div class="breakdown-bar">
              <div class="breakdown-fill" style="width: ${data.percentage}%"></div>
            </div>
            <span class="breakdown-value">${data.correct}/${data.total}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Группирует ответы по категориям
   * @param {Array<Object>} answers
   * @returns {Object}
   */
  groupByCategory(answers) {
    const groups = {};
    
    answers.forEach(answer => {
      const category = answer.category || 'Общие вопросы';
      
      if (!groups[category]) {
        groups[category] = { correct: 0, total: 0 };
      }
      
      groups[category].total++;
      if (answer.isCorrect) {
        groups[category].correct++;
      }
    });
    
    Object.keys(groups).forEach(key => {
      const data = groups[key];
      data.percentage = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
    });
    
    return groups;
  }

  /**
   * Уничтожает компонент
   */
  destroy() {
    this.container.removeEventListener('click', this.handleClick);
  }
}

/**
 * Создаёт экземпляр компонента результатов
 * @param {Object} options
 * @returns {ResultScreen}
 */
export function createResultScreen(options) {
  return new ResultScreen(options);
}
