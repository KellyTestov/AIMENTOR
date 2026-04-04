/**
 * ══════════════════════════════════════════════════
 * Inspector Component
 * ══════════════════════════════════════════════════
 * 
 * Панель свойств выбранного узла.
 */

import { NODE_ICONS, NODE_TYPES } from '../../core/constants.js';
import { formatDate } from '../../core/utils.js';

/**
 * Класс инспектора
 */
export class Inspector {
  /**
   * @param {Object} options
   * @param {HTMLElement} options.container - Контейнер
   * @param {Object} options.node - Текущий узел
   */
  constructor({ container, node }) {
    this.container = container;
    this.node = node;
    
    this.init();
  }

  /**
   * Инициализирует компонент
   */
  init() {
    this.render();
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
        <div class="inspector-empty">
          <div class="inspector-empty-icon">📋</div>
          <div class="inspector-empty-text">Выберите элемент для просмотра свойств</div>
        </div>
      `;
      return;
    }

    this.container.innerHTML = `
      <div class="inspector-content">
        <div class="inspector-header">
          <span class="inspector-icon">${NODE_ICONS[this.node.type] || '📄'}</span>
          <span class="inspector-type">${this.getTypeLabel(this.node.type)}</span>
        </div>
        
        <div class="inspector-body">
          ${this.renderProperties()}
        </div>
        
        <div class="inspector-footer">
          <div class="inspector-meta">
            <div class="meta-item">
              <span class="meta-label">ID:</span>
              <span class="meta-value">${this.node.id}</span>
            </div>
            ${this.node.createdAt ? `
              <div class="meta-item">
                <span class="meta-label">Создано:</span>
                <span class="meta-value">${formatDate(this.node.createdAt)}</span>
              </div>
            ` : ''}
            ${this.node.updatedAt ? `
              <div class="meta-item">
                <span class="meta-label">Обновлено:</span>
                <span class="meta-value">${formatDate(this.node.updatedAt)}</span>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Возвращает название типа узла
   * @param {string} type
   * @returns {string}
   */
  getTypeLabel(type) {
    const labels = {
      [NODE_TYPES.UNIT]: 'Обучение',
      [NODE_TYPES.MODULE]: 'Модуль',
      [NODE_TYPES.TOPIC]: 'Тема',
      [NODE_TYPES.QUESTION]: 'Вопрос',
      [NODE_TYPES.CONTENT]: 'Контент',
      [NODE_TYPES.CLIENT_CARD]: 'Клиентская карта',
      [NODE_TYPES.CRITERIA]: 'Критерии',
      [NODE_TYPES.HINT]: 'Подсказка',
    };
    return labels[type] || type;
  }

  /**
   * Рендерит свойства узла
   * @returns {string}
   */
  renderProperties() {
    const properties = this.getNodeProperties();
    
    if (properties.length === 0) {
      return '<div class="no-properties">Нет свойств для отображения</div>';
    }
    
    return `
      <div class="properties-list">
        ${properties.map(prop => `
          <div class="property-item">
            <span class="property-label">${prop.label}</span>
            <span class="property-value">${prop.value}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Возвращает свойства узла для отображения
   * @returns {Array<Object>}
   */
  getNodeProperties() {
    const properties = [];
    const node = this.node;
    
    // Общие свойства
    if (node.title) {
      properties.push({ label: 'Название', value: node.title });
    }
    
    if (node.category) {
      properties.push({ label: 'Категория', value: node.category });
    }
    
    if (node.factory) {
      properties.push({ label: 'Фабрика', value: node.factory });
    }
    
    if (node.durationLabel) {
      properties.push({ label: 'Длительность', value: node.durationLabel });
    }
    
    if (node.topic) {
      properties.push({ label: 'Тема', value: node.topic });
    }
    
    // Свойства вопроса
    if (node.questionType) {
      properties.push({ label: 'Тип вопроса', value: this.getQuestionTypeLabel(node.questionType) });
    }
    
    if (node.answers && node.answers.length > 0) {
      const correctCount = node.answers.filter(a => a.correct).length;
      properties.push({ label: 'Вариантов ответов', value: node.answers.length });
      properties.push({ label: 'Правильных', value: correctCount });
    }
    
    // Свойства клиентской карты
    if (node.sections && node.sections.length > 0) {
      properties.push({ label: 'Секций карты', value: node.sections.length });
    }
    
    // Свойства критериев
    if (node.criteria && node.criteria.length > 0) {
      properties.push({ label: 'Критериев', value: node.criteria.length });
    }
    
    // Дочерние элементы
    if (node.nodes && node.nodes.length > 0) {
      properties.push({ label: 'Дочерних элементов', value: node.nodes.length });
    }
    
    return properties;
  }

  /**
   * Возвращает название типа вопроса
   * @param {string} type
   * @returns {string}
   */
  getQuestionTypeLabel(type) {
    const labels = {
      'single': 'Один ответ',
      'multiple': 'Несколько ответов',
      'text': 'Текстовый ответ',
      'order': 'Установление порядка',
      'match': 'Соответствие',
    };
    return labels[type] || type;
  }

  /**
   * Уничтожает компонент
   */
  destroy() {
    // Очистка
  }
}

/**
 * Создаёт экземпляр инспектора
 * @param {Object} options
 * @returns {Inspector}
 */
export function createInspector(options) {
  return new Inspector(options);
}
