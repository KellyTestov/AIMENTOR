/**
 * ══════════════════════════════════════════════════
 * Progress Bar Component
 * ══════════════════════════════════════════════════
 * 
 * Компонент прогресса прохождения в песочнице.
 */

/**
 * Класс компонента прогресса
 */
export class ProgressBar {
  /**
   * @param {Object} options
   * @param {HTMLElement} options.container - Контейнер
   * @param {number} options.current - Текущий вопрос
   * @param {number} options.total - Общее количество вопросов
   * @param {Array<Object>} options.answers - Массив ответов
   */
  constructor({ container, current, total, answers }) {
    this.container = container;
    this.current = current;
    this.total = total;
    this.answers = answers || [];
    
    this.init();
  }

  /**
   * Инициализирует компонент
   */
  init() {
    this.render();
  }

  /**
   * Устанавливает прогресс
   * @param {number} current
   * @param {Array<Object>} answers
   */
  setProgress(current, answers) {
    this.current = current;
    this.answers = answers || [];
    this.render();
  }

  /**
   * Возвращает процент прогресса
   * @returns {number}
   */
  getPercentage() {
    if (this.total === 0) return 0;
    return Math.round((this.current / this.total) * 100);
  }

  /**
   * Возвращает количество правильных ответов
   * @returns {number}
   */
  getCorrectCount() {
    return this.answers.filter(a => a.isCorrect).length;
  }

  /**
   * Рендерит компонент
   */
  render() {
    const percentage = this.getPercentage();
    const correctCount = this.getCorrectCount();
    
    this.container.innerHTML = `
      <div class="progress-bar">
        <div class="progress-header">
          <span class="progress-text">Прогресс: ${this.current} из ${this.total}</span>
          <span class="progress-percentage">${percentage}%</span>
        </div>
        
        <div class="progress-track">
          <div class="progress-fill" style="width: ${percentage}%"></div>
          <div class="progress-markers">
            ${this.renderMarkers()}
          </div>
        </div>
        
        <div class="progress-stats">
          <span class="stat-correct">
            <span class="stat-icon">✓</span>
            ${correctCount} правильных
          </span>
          <span class="stat-remaining">
            ${this.total - this.current} осталось
          </span>
        </div>
      </div>
    `;
  }

  /**
   * Рендерит маркеры вопросов
   * @returns {string}
   */
  renderMarkers() {
    let markers = '';
    
    for (let i = 0; i < this.total; i++) {
      const answer = this.answers[i];
      let className = 'marker';
      
      if (answer) {
        className += answer.isCorrect ? ' marker-correct' : ' marker-incorrect';
      }
      
      if (i === this.current) {
        className += ' marker-current';
      }
      
      markers += `<div class="${className}" data-index="${i}"></div>`;
    }
    
    return markers;
  }

  /**
   * Уничтожает компонент
   */
  destroy() {
    // Очистка
  }
}

/**
 * Создаёт экземпляр компонента прогресса
 * @param {Object} options
 * @returns {ProgressBar}
 */
export function createProgressBar(options) {
  return new ProgressBar(options);
}
