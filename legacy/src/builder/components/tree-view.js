/**
 * ══════════════════════════════════════════════════
 * Tree View Component
 * ══════════════════════════════════════════════════
 * 
 * Компонент дерева структуры обучения в конструкторе.
 */

import { NODE_ICONS, NODE_TYPES } from '../../core/constants.js';
import { EventBus, EventTypes } from '../../core/events.js';

/**
 * Класс компонента дерева
 */
export class TreeView {
  /**
   * @param {Object} options
   * @param {HTMLElement} options.container - Контейнер
   * @param {Object} options.unit - Данные unit
   * @param {Function} options.onSelect - Callback при выборе узла
   * @param {Function} options.onAdd - Callback при добавлении узла
   * @param {Function} options.onDelete - Callback при удалении узла
   */
  constructor({ container, unit, onSelect, onAdd, onDelete }) {
    this.container = container;
    this.unit = unit;
    this.onSelect = onSelect;
    this.onAdd = onAdd;
    this.onDelete = onDelete;
    
    this.selectedId = null;
    this.expanded = new Set();
    
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
    this.container.addEventListener('dblclick', this.handleDoubleClick.bind(this));
    
    // События от других компонентов
    EventBus.on(EventTypes.BUILDER_NODE_SELECTED, this.onNodeSelected.bind(this));
    EventBus.on(EventTypes.BUILDER_NODE_UPDATED, this.onNodeUpdated.bind(this));
  }

  /**
   * Обрабатывает клик
   * @param {Event} e
   */
  handleClick(e) {
    const target = e.target;
    const nodeEl = target.closest('.tree-node');
    if (!nodeEl) return;

    const nodeId = nodeEl.dataset.id;
    const action = target.dataset.action;

    if (action === 'toggle') {
      this.toggleNode(nodeId);
    } else if (action === 'add') {
      this.onAdd?.(nodeId);
    } else if (action === 'delete') {
      e.stopPropagation();
      this.onDelete?.(nodeId);
    } else {
      this.selectNode(nodeId);
    }
  }

  /**
   * Обрабатывает двойной клик
   * @param {Event} e
   */
  handleDoubleClick(e) {
    const nodeEl = e.target.closest('.tree-node');
    if (!nodeEl) return;

    const nodeId = nodeEl.dataset.id;
    this.toggleNode(nodeId);
  }

  /**
   * Выбирает узел
   * @param {string} nodeId
   */
  selectNode(nodeId) {
    this.selectedId = nodeId;
    this.render();
    this.onSelect?.(nodeId);
    EventBus.emit(EventTypes.BUILDER_NODE_SELECTED, { nodeId });
  }

  /**
   * Переключает развёрнутость узла
   * @param {string} nodeId
   */
  toggleNode(nodeId) {
    if (this.expanded.has(nodeId)) {
      this.expanded.delete(nodeId);
    } else {
      this.expanded.add(nodeId);
    }
    this.render();
  }

  /**
   * Обработчик выбора узла из другого компонента
   * @param {Object} data
   */
  onNodeSelected(data) {
    if (data.nodeId !== this.selectedId) {
      this.selectedId = data.nodeId;
      this.render();
    }
  }

  /**
   * Обработчик обновления узла
   */
  onNodeUpdated() {
    this.render();
  }

  /**
   * Обновляет данные
   * @param {Object} unit
   */
  update(unit) {
    this.unit = unit;
    this.render();
  }

  /**
   * Рендерит компонент
   */
  render() {
    if (!this.unit) {
      this.container.innerHTML = '<div class="tree-empty">Нет данных</div>';
      return;
    }

    this.container.innerHTML = `
      <div class="tree-root">
        ${this.renderNode(this.unit, 0)}
      </div>
    `;
  }

  /**
   * Рендерит узел дерева
   * @param {Object} node - Узел
   * @param {number} level - Уровень вложенности
   * @returns {string}
   */
  renderNode(node, level) {
    const hasChildren = node.nodes && node.nodes.length > 0;
    const isExpanded = this.expanded.has(node.id);
    const isSelected = this.selectedId === node.id;
    const icon = NODE_ICONS[node.type] || '📄';
    
    return `
      <div class="tree-node ${isSelected ? 'selected' : ''}" 
           data-id="${node.id}" 
           style="--level: ${level}">
        <div class="tree-node-content">
          ${hasChildren ? `
            <button class="tree-toggle" data-action="toggle">
              ${isExpanded ? '▼' : '▶'}
            </button>
          ` : '<span class="tree-toggle-placeholder"></span>'}
          
          <span class="tree-icon">${icon}</span>
          
          <span class="tree-label">${this.getNodeLabel(node)}</span>
          
          <div class="tree-actions">
            ${this.canAddChild(node) ? `
              <button class="tree-action-btn" data-action="add" title="Добавить">
                <svg viewBox="0 0 24 24" width="14" height="14">
                  <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
              </button>
            ` : ''}
            ${level > 0 ? `
              <button class="tree-action-btn tree-action-delete" data-action="delete" title="Удалить">
                <svg viewBox="0 0 24 24" width="14" height="14">
                  <path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                </svg>
              </button>
            ` : ''}
          </div>
        </div>
        
        ${hasChildren && isExpanded ? `
          <div class="tree-children">
            ${node.nodes.map(child => this.renderNode(child, level + 1)).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Возвращает метку узла
   * @param {Object} node
   * @returns {string}
   */
  getNodeLabel(node) {
    if (node.title) return node.title;
    if (node.question) return this.truncate(node.question, 50);
    if (node.text) return this.truncate(node.text, 50);
    return 'Без названия';
  }

  /**
   * Обрезает строку
   * @param {string} str
   * @param {number} maxLength
   * @returns {string}
   */
  truncate(str, maxLength) {
    if (!str) return '';
    return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
  }

  /**
   * Проверяет, можно ли добавить дочерний узел
   * @param {Object} node
   * @returns {boolean}
   */
  canAddChild(node) {
    const allowedChildren = {
      [NODE_TYPES.UNIT]: [NODE_TYPES.MODULE],
      [NODE_TYPES.MODULE]: [NODE_TYPES.TOPIC],
      [NODE_TYPES.TOPIC]: [NODE_TYPES.QUESTION, NODE_TYPES.CONTENT, NODE_TYPES.CLIENT_CARD],
      [NODE_TYPES.QUESTION]: [NODE_TYPES.CRITERIA, NODE_TYPES.HINT],
      [NODE_TYPES.CONTENT]: [],
      [NODE_TYPES.CLIENT_CARD]: [],
      [NODE_TYPES.CRITERIA]: [],
      [NODE_TYPES.HINT]: [],
    };
    
    return (allowedChildren[node.type] || []).length > 0;
  }

  /**
   * Разворачивает путь к узлу
   * @param {string} nodeId
   */
  expandToNode(nodeId) {
    const path = this.findNodePath(nodeId, this.unit);
    if (path) {
      path.forEach(id => this.expanded.add(id));
      this.render();
    }
  }

  /**
   * Находит путь к узлу
   * @param {string} nodeId
   * @param {Object} node
   * @param {Array<string>} path
   * @returns {Array<string>|null}
   */
  findNodePath(nodeId, node, path = []) {
    if (node.id === nodeId) {
      return path;
    }
    
    if (node.nodes) {
      for (const child of node.nodes) {
        const result = this.findNodePath(nodeId, child, [...path, node.id]);
        if (result) return result;
      }
    }
    
    return null;
  }

  /**
   * Уничтожает компонент
   */
  destroy() {
    this.container.removeEventListener('click', this.handleClick);
    this.container.removeEventListener('dblclick', this.handleDoubleClick);
    EventBus.off(EventTypes.BUILDER_NODE_SELECTED, this.onNodeSelected);
    EventBus.off(EventTypes.BUILDER_NODE_UPDATED, this.onNodeUpdated);
  }
}

/**
 * Создаёт экземпляр компонента дерева
 * @param {Object} options
 * @returns {TreeView}
 */
export function createTreeView(options) {
  return new TreeView(options);
}
