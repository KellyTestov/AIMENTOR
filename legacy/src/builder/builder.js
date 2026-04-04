/**
 * ══════════════════════════════════════════════════
 * AI-Ментор · Builder Page
 * ══════════════════════════════════════════════════
 * 
 * Страница конструктора обучения.
 */

import { TreeView, createTreeView } from './components/tree-view.js';
import { NodeEditor, createNodeEditor } from './components/node-editor.js';
import { Inspector, createInspector } from './components/inspector.js';
import { Toolbar, createToolbar } from './components/toolbar.js';
import { BuilderService } from './services/builderService.js';
import { EventBus, EventTypes } from '../core/events.js';
import { storage } from '../core/storage.js';
import { STORAGE_KEYS, NODE_TYPES } from '../core/constants.js';
import { generateId } from '../core/utils.js';
import { getCurrentUser } from '../shared/mock/users.js';

/**
 * Класс страницы конструктора
 */
export class BuilderPage {
  /**
   * @param {Object} options
   * @param {Object} options.bootstrap - Bootstrap-данные
   */
  constructor({ bootstrap = {} } = {}) {
    this.bootstrap = bootstrap;
    this.currentUser = getCurrentUser(bootstrap);
    
    this.unit = null;
    this.selectedId = null;
    this.isDirty = false;
    this.isIniting = true;
    
    this.service = new BuilderService();
    this.components = {};
    this.dom = {};
    
    this.init();
  }

  /**
   * Инициализирует страницу
   */
  init() {
    this.cacheDom();
    this.loadUnit();
    this.initComponents();
    this.bindEvents();
    this.isIniting = false;
  }

  /**
   * Кэширует DOM-элементы
   */
  cacheDom() {
    this.dom = {
      toolbar: document.getElementById('builder-toolbar'),
      tree: document.getElementById('bld-tree'),
      center: document.getElementById('bld-center'),
      inspector: document.getElementById('bld-inspector'),
      addBlockBtn: document.getElementById('add-block-btn'),
    };
  }

  /**
   * Загружает unit из URL или localStorage
   */
  loadUnit() {
    // Получаем ID из URL
    const urlParams = new URLSearchParams(window.location.search);
    const unitId = urlParams.get('id');
    
    if (unitId) {
      // Загружаем существующий unit
      this.unit = this.service.loadUnit(unitId);
    }
    
    if (!this.unit) {
      // Создаём новый unit
      this.unit = this.service.createNewUnit({
        authorId: this.currentUser.id,
        authorName: this.currentUser.name,
      });
    }
  }

  /**
   * Инициализирует компоненты
   */
  initComponents() {
    // Панель инструментов
    if (this.dom.toolbar) {
      this.components.toolbar = new Toolbar({
        container: this.dom.toolbar,
        unit: this.unit,
        currentUser: this.currentUser,
        onSave: () => this.save(),
        onPublish: () => this.publish(),
        onPreview: () => this.preview(),
      });
    }

    // Дерево структуры
    if (this.dom.tree) {
      this.components.tree = new TreeView({
        container: this.dom.tree,
        unit: this.unit,
        onSelect: (nodeId) => this.selectNode(nodeId),
        onAdd: (parentId) => this.addNode(parentId),
        onDelete: (nodeId) => this.deleteNode(nodeId),
      });
    }

    // Редактор узла
    if (this.dom.center) {
      this.components.editor = new NodeEditor({
        container: this.dom.center,
        node: null,
        onChange: (node) => this.updateNode(node),
      });
    }

    // Инспектор
    if (this.dom.inspector) {
      this.components.inspector = new Inspector({
        container: this.dom.inspector,
        node: null,
      });
    }
  }

  /**
   * Привязывает обработчики событий
   */
  bindEvents() {
    // Кнопка добавления блока
    if (this.dom.addBlockBtn) {
      this.dom.addBlockBtn.addEventListener('click', () => this.showAddBlockMenu());
    }

    // Изменение названия в toolbar
    const titleInput = document.getElementById('unit-title-input');
    if (titleInput) {
      titleInput.addEventListener('input', (e) => {
        this.unit.title = e.target.value;
        this.setDirty();
      });
    }

    // События от компонентов
    EventBus.on(EventTypes.BUILDER_NODE_SELECTED, this.onNodeSelected.bind(this));
    EventBus.on(EventTypes.BUILDER_NODE_UPDATED, this.onNodeUpdated.bind(this));

    // Предупреждение при уходе со страницы
    window.addEventListener('beforeunload', (e) => {
      if (this.isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    });

    // Горячие клавиши
    document.addEventListener('keydown', (e) => {
      // Ctrl+S - сохранить
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        this.save();
      }
      // Ctrl+P - предпросмотр
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        this.preview();
      }
      // Delete - удалить выбранный узел
      if (e.key === 'Delete' && this.selectedId) {
        e.preventDefault();
        this.deleteNode(this.selectedId);
      }
    });
  }

  /**
   * Выбирает узел
   * @param {string} nodeId
   */
  selectNode(nodeId) {
    this.selectedId = nodeId;
    
    const node = this.findNode(nodeId, this.unit);
    
    // Обновляем редактор
    this.components.editor?.setNode(node);
    
    // Обновляем инспектор
    this.components.inspector?.setNode(node);
    
    // Разворачиваем дерево к узлу
    this.components.tree?.expandToNode(nodeId);
  }

  /**
   * Обработчик выбора узла
   * @param {Object} data
   */
  onNodeSelected(data) {
    if (data.nodeId !== this.selectedId) {
      this.selectNode(data.nodeId);
    }
  }

  /**
   * Обработчик обновления узла
   * @param {Object} data
   */
  onNodeUpdated(data) {
    this.updateNodeInTree(data.node);
    this.setDirty();
  }

  /**
   * Обновляет узел в дереве
   * @param {Object} updatedNode
   */
  updateNodeInTree(updatedNode) {
    const node = this.findNode(updatedNode.id, this.unit);
    if (node) {
      Object.assign(node, updatedNode);
    }
    this.components.tree?.update(this.unit);
    this.components.inspector?.setNode(updatedNode);
  }

  /**
   * Добавляет узел
   * @param {string} parentId
   */
  addNode(parentId) {
    const parent = this.findNode(parentId, this.unit);
    if (!parent) return;

    const nodeType = this.getDefaultChildType(parent.type);
    if (!nodeType) return;

    const newNode = {
      id: generateId('n-'),
      type: nodeType,
      title: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!parent.nodes) {
      parent.nodes = [];
    }
    parent.nodes.push(newNode);

    this.setDirty();
    this.components.tree?.update(this.unit);
    this.selectNode(newNode.id);
  }

  /**
   * Возвращает тип дочернего узла по умолчанию
   * @param {string} parentType
   * @returns {string|null}
   */
  getDefaultChildType(parentType) {
    const childTypes = {
      [NODE_TYPES.UNIT]: NODE_TYPES.MODULE,
      [NODE_TYPES.MODULE]: NODE_TYPES.TOPIC,
      [NODE_TYPES.TOPIC]: NODE_TYPES.QUESTION,
      [NODE_TYPES.QUESTION]: NODE_TYPES.CRITERIA,
    };
    return childTypes[parentType] || null;
  }

  /**
   * Удаляет узел
   * @param {string} nodeId
   */
  deleteNode(nodeId) {
    if (nodeId === this.unit.id) {
      // Нельзя удалить корневой узел
      return;
    }

    const result = this.removeNodeFromTree(nodeId, this.unit);
    if (result) {
      this.setDirty();
      this.components.tree?.update(this.unit);
      
      if (this.selectedId === nodeId) {
        this.selectedId = null;
        this.components.editor?.setNode(null);
        this.components.inspector?.setNode(null);
      }
    }
  }

  /**
   * Удаляет узел из дерева рекурсивно
   * @param {string} nodeId
   * @param {Object} node
   * @returns {boolean}
   */
  removeNodeFromTree(nodeId, node) {
    if (!node.nodes) return false;

    const index = node.nodes.findIndex(n => n.id === nodeId);
    if (index !== -1) {
      node.nodes.splice(index, 1);
      return true;
    }

    for (const child of node.nodes) {
      if (this.removeNodeFromTree(nodeId, child)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Обновляет узел
   * @param {Object} updatedNode
   */
  updateNode(updatedNode) {
    const node = this.findNode(updatedNode.id, this.unit);
    if (node) {
      Object.assign(node, updatedNode);
      this.setDirty();
      this.components.tree?.update(this.unit);
    }
  }

  /**
   * Находит узел по ID
   * @param {string} nodeId
   * @param {Object} node
   * @returns {Object|null}
   */
  findNode(nodeId, node) {
    if (node.id === nodeId) {
      return node;
    }

    if (node.nodes) {
      for (const child of node.nodes) {
        const found = this.findNode(nodeId, child);
        if (found) return found;
      }
    }

    return null;
  }

  /**
   * Показывает меню добавления блока
   */
  showAddBlockMenu() {
    // Меню добавления блока - показываем доступные типы
    const menu = document.createElement('div');
    menu.className = 'add-block-menu';
    menu.innerHTML = `
      <div class="menu-item" data-type="module">📁 Модуль</div>
      <div class="menu-item" data-type="topic">📖 Тема</div>
      <div class="menu-item" data-type="question">❓ Вопрос</div>
      <div class="menu-item" data-type="content">📝 Контент</div>
      <div class="menu-item" data-type="clientCard">💳 Клиентская карта</div>
    `;

    // Позиционируем меню
    const btn = this.dom.addBlockBtn;
    const rect = btn.getBoundingClientRect();
    menu.style.position = 'absolute';
    menu.style.top = `${rect.bottom + 5}px`;
    menu.style.left = `${rect.left}px`;

    // Обрабатываем клики
    menu.addEventListener('click', (e) => {
      const type = e.target.dataset.type;
      if (type) {
        this.addBlockToRoot(type);
        menu.remove();
      }
    });

    document.body.appendChild(menu);

    // Закрываем при клике вне меню
    const closeMenu = (e) => {
      if (!menu.contains(e.target)) {
        menu.remove();
        document.removeEventListener('click', closeMenu);
      }
    };
    setTimeout(() => document.addEventListener('click', closeMenu), 0);
  }

  /**
   * Добавляет блок в корень unit
   * @param {string} type
   */
  addBlockToRoot(type) {
    if (!this.unit.nodes) {
      this.unit.nodes = [];
    }

    const newNode = {
      id: generateId('n-'),
      type,
      title: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.unit.nodes.push(newNode);
    this.setDirty();
    this.components.tree?.update(this.unit);
    this.selectNode(newNode.id);
  }

  /**
   * Устанавливает флаг изменений
   */
  setDirty() {
    if (this.isIniting) return;
    
    this.isDirty = true;
    EventBus.emit(EventTypes.BUILDER_DIRTY_CHANGED, { isDirty: true });
  }

  /**
   * Сохраняет unit
   */
  async save() {
    this.unit.updatedAt = new Date().toISOString();
    this.service.saveUnit(this.unit);
    this.isDirty = false;
    EventBus.emit(EventTypes.BUILDER_DIRTY_CHANGED, { isDirty: false });
    EventBus.emit(EventTypes.BUILDER_SAVED, { unit: this.unit });
  }

  /**
   * Публикует unit
   */
  async publish() {
    this.unit.publicationStatus = 'published';
    await this.save();
    this.components.toolbar?.setUnit(this.unit);
  }

  /**
   * Открывает предпросмотр
   */
  preview() {
    // Сохраняем перед предпросмотром
    this.save().then(() => {
      const url = `./sandbox/index.html?id=${this.unit.id}&mode=preview`;
      window.open(url, '_blank');
    });
  }

  /**
   * Уничтожает страницу
   */
  destroy() {
    Object.values(this.components).forEach(comp => comp.destroy?.());
    EventBus.off(EventTypes.BUILDER_NODE_SELECTED, this.onNodeSelected);
    EventBus.off(EventTypes.BUILDER_NODE_UPDATED, this.onNodeUpdated);
  }
}

/**
 * Создаёт экземпляр страницы конструктора
 * @param {Object} options
 * @returns {BuilderPage}
 */
export function createBuilderPage(options) {
  return new BuilderPage(options);
}

/**
 * Инициализирует конструктор
 * @param {Object} bootstrap
 * @returns {BuilderPage}
 */
export function initBuilder(bootstrap = {}) {
  window.AI_MENTOR_BOOTSTRAP = bootstrap;
  return createBuilderPage({ bootstrap });
}

// Автоинициализация
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const bootstrap = window.AI_MENTOR_BOOTSTRAP || {};
    window.builder = initBuilder(bootstrap);
  });
}
