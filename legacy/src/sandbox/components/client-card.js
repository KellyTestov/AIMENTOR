/**
 * ══════════════════════════════════════════════════
 * Client Card Component
 * ══════════════════════════════════════════════════
 * 
 * Компонент клиентской карты в песочнице.
 */

import { CLIENT_CARD_SECTIONS } from '../../core/constants.js';
import { escapeHtml } from '../../core/utils.js';

/**
 * Mock-данные клиента
 */
const MOCK_CLIENT = {
  name: "Иванова Мария Петровна",
  phone: "+7 (999) 123-45-67",
  account: "40817810000000001234",
  status: "Активный клиент",
  products: ["Дебетовая карта Альфа-Карта", "Накопительный счёт"],
  request: "Вопрос по комиссии за уведомления по дебетовой карте",
};

/**
 * Класс компонента клиентской карты
 */
export class ClientCard {
  /**
   * @param {Object} options
   * @param {HTMLElement} options.container - Контейнер
   * @param {Object} options.client - Данные клиента
   * @param {Array<string>} options.sections - Отображаемые секции
   */
  constructor({ container, client, sections }) {
    this.container = container;
    this.client = client || MOCK_CLIENT;
    this.sections = sections || [];
    
    this.init();
  }

  /**
   * Инициализирует компонент
   */
  init() {
    this.render();
  }

  /**
   * Устанавливает данные клиента
   * @param {Object} client
   */
  setClient(client) {
    this.client = client;
    this.render();
  }

  /**
   * Генерирует mock-данные для секции
   * @param {Object} section
   * @returns {Object}
   */
  generateSectionData(section) {
    const data = {};
    section.fields.forEach(field => {
      data[field.key] = field.placeholder;
    });
    return data;
  }

  /**
   * Рендерит компонент
   */
  render() {
    const sectionsToShow = this.sections.length > 0 
      ? CLIENT_CARD_SECTIONS.filter(s => this.sections.includes(s.key))
      : CLIENT_CARD_SECTIONS;
    
    this.container.innerHTML = `
      <div class="client-card">
        <div class="client-header">
          <div class="client-avatar">
            ${this.client.name.charAt(0)}
          </div>
          <div class="client-info">
            <div class="client-name">${escapeHtml(this.client.name)}</div>
            <div class="client-status">${escapeHtml(this.client.status)}</div>
          </div>
        </div>
        
        <div class="client-contacts">
          <div class="contact-item">
            <span class="contact-icon">📞</span>
            <span class="contact-value">${escapeHtml(this.client.phone)}</span>
          </div>
          <div class="contact-item">
            <span class="contact-icon">💳</span>
            <span class="contact-value">${escapeHtml(this.client.account)}</span>
          </div>
        </div>
        
        <div class="client-products">
          <div class="products-label">Продукты клиента:</div>
          <div class="products-list">
            ${this.client.products.map(p => `
              <span class="product-tag">${escapeHtml(p)}</span>
            `).join('')}
          </div>
        </div>
        
        <div class="client-request">
          <div class="request-label">Запрос клиента:</div>
          <div class="request-text">${escapeHtml(this.client.request)}</div>
        </div>
        
        ${sectionsToShow.length > 0 ? `
          <div class="client-sections">
            ${sectionsToShow.map(section => this.renderSection(section)).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Рендерит секцию карты
   * @param {Object} section
   * @returns {string}
   */
  renderSection(section) {
    const data = this.generateSectionData(section);
    
    return `
      <div class="card-section">
        <div class="section-header">
          <span class="section-title">${escapeHtml(section.title)}</span>
          <button class="section-toggle" data-section="${section.key}">
            <svg viewBox="0 0 24 24" width="16" height="16">
              <path fill="currentColor" d="M7 10l5 5 5-5z"/>
            </svg>
          </button>
        </div>
        <div class="section-body">
          <div class="section-fields">
            ${section.fields.map(field => `
              <div class="field-item">
                <span class="field-label">${escapeHtml(field.label)}</span>
                <span class="field-value">${escapeHtml(data[field.key] || field.placeholder)}</span>
              </div>
            `).join('')}
          </div>
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
 * Создаёт экземпляр компонента клиентской карты
 * @param {Object} options
 * @returns {ClientCard}
 */
export function createClientCard(options) {
  return new ClientCard(options);
}
