/**
 * ══════════════════════════════════════════════════
 * AI-Ментор · Сервис конструктора
 * ══════════════════════════════════════════════════
 * 
 * Бизнес-логика для работы с конструктором обучения.
 */

import { storage } from '../core/storage.js';
import { STORAGE_KEYS } from '../core/constants.js';
import { generateId } from '../core/utils.js';
import { emit, EventTypes } from '../core/events.js';

/**
 * Класс сервиса конструктора
 */
export class BuilderService {
  constructor() {
    this.data = null;
  }

  loadAll() {
    return builderService.loadAll();
  }

  saveAll(data) {
    return builderService.saveAll(data);
  }

  loadUnit(id) {
    return builderService.loadUnit(id);
  }

  saveUnit(unit) {
    return builderService.saveUnit(unit);
  }

  deleteUnit(id) {
    return builderService.deleteUnit(id);
  }

  createUnit(data = {}) {
    return builderService.createUnit(data);
  }

  createNewUnit(data = {}) {
    return builderService.createNewUnit(data);
  }
}

/**
 * Сервис конструктора
 */
export const builderService = {
  /**
   * Загрузить все unit'ы из хранилища
   * @returns {Object}
   */
  loadAll() {
    return storage.getObject(STORAGE_KEYS.BUILDER_DATA, {});
  },

  /**
   * Сохранить все unit'ы
   * @param {Object} data - данные
   */
  saveAll(data) {
    storage.setObject(STORAGE_KEYS.BUILDER_DATA, data);
  },

  /**
   * Загрузить unit по ID
   * @param {string} id - ID unit'а
   * @returns {Object|null}
   */
  loadUnit(id) {
    const all = this.loadAll();
    return all[id] || null;
  },

  /**
   * Сохранить unit
   * @param {Object} unit - unit для сохранения
   */
  saveUnit(unit) {
    const all = this.loadAll();
    unit.updatedAt = new Date().toISOString();
    all[unit.id] = unit;
    this.saveAll(all);
    
    emit(EventTypes.UNIT_UPDATED, { unit });
  },

  /**
   * Создать новый unit
   * @param {Object} data - данные
   * @returns {Object}
   */
  createUnit(data = {}) {
    const id = data.id || `edu-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const unit = {
      id,
      title: data.title || 'Без названия',
      type: data.type || 'trainer',
      category: data.category || '',
      factory: data.factory || '',
      direction: data.direction || '',
      topic: data.topic || '',
      duration: data.duration || '',
      durationLabel: data.durationLabel || '',
      authorId: data.authorId || null,
      authorName: data.authorName || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      publicationStatus: 'draft',
      coverUrl: data.coverUrl || null,
      children: data.children || [],
    };
    
    this.saveUnit(unit);
    emit(EventTypes.UNIT_CREATED, { unit });
    
    return unit;
  },

  /**
   * Создать новый unit (алиас для createUnit)
   * @param {Object} data - данные
   * @returns {Object}
   */
  createNewUnit(data = {}) {
    return this.createUnit(data);
  },

  /**
   * Удалить unit
   * @param {string} id - ID unit'а
   * @returns {boolean}
   */
  deleteUnit(id) {
    const all = this.loadAll();
    if (!all[id]) return false;
    
    delete all[id];
    this.saveAll(all);
    
    emit(EventTypes.UNIT_DELETED, { id });
    return true;
  },

  /**
   * Опубликовать unit
   * @param {string} id - ID unit'а
   * @returns {Object|null}
   */
  publishUnit(id) {
    const unit = this.loadUnit(id);
    if (!unit) return null;
    
    unit.publicationStatus = 'published';
    unit.updatedAt = new Date().toISOString();
    this.saveUnit(unit);
    
    emit(EventTypes.UNIT_PUBLISHED, { unit });
    return unit;
  },

  // ── Работа с деревом ─────────────────────────────

  /**
   * Найти узел в дереве по ID
   * @param {Object} root - корневой узел
   * @param {string} nodeId - ID узла
   * @returns {Object|null}
   */
  findNode(root, nodeId) {
    if (root.id === nodeId) return root;
    
    if (root.children) {
      for (const child of root.children) {
        const found = this.findNode(child, nodeId);
        if (found) return found;
      }
    }
    
    return null;
  },

  /**
   * Найти родителя узла
   * @param {Object} root - корневой узел
   * @param {string} nodeId - ID узла
   * @returns {Object|null}
   */
  findParent(root, nodeId) {
    if (!root.children) return null;
    
    for (const child of root.children) {
      if (child.id === nodeId) return root;
      const found = this.findParent(child, nodeId);
      if (found) return found;
    }
    
    return null;
  },

  /**
   * Добавить дочерний узел
   * @param {Object} root - корневой узел
   * @param {string} parentId - ID родителя
   * @param {Object} child - дочерний узел
   * @returns {boolean}
   */
  addChild(root, parentId, child) {
    const parent = this.findNode(root, parentId);
    if (!parent) return false;
    
    if (!parent.children) parent.children = [];
    parent.children.push(child);
    
    return true;
  },

  /**
   * Удалить узел из дерева
   * @param {Object} root - корневой узел
   * @param {string} nodeId - ID узла
   * @returns {boolean}
   */
  removeNode(root, nodeId) {
    if (!root.children) return false;
    
    const index = root.children.findIndex(c => c.id === nodeId);
    if (index > -1) {
      root.children.splice(index, 1);
      return true;
    }
    
    for (const child of root.children) {
      if (this.removeNode(child, nodeId)) return true;
    }
    
    return false;
  },

  /**
   * Переместить узел
   * @param {Object} root - корневой узел
   * @param {string} nodeId - ID узла
   * @param {string} newParentId - ID нового родителя
   * @param {number} index - индекс для вставки
   * @returns {boolean}
   */
  moveNode(root, nodeId, newParentId, index = -1) {
    const node = this.findNode(root, nodeId);
    if (!node) return false;
    
    // Удаляем из текущего места
    this.removeNode(root, nodeId);
    
    // Добавляем в новое место
    const newParent = newParentId === root.id ? root : this.findNode(root, newParentId);
    if (!newParent) return false;
    
    if (!newParent.children) newParent.children = [];
    
    if (index < 0 || index >= newParent.children.length) {
      newParent.children.push(node);
    } else {
      newParent.children.splice(index, 0, node);
    }
    
    return true;
  },

  // ── Генерация ID ─────────────────────────────────

  /**
   * Сгенерировать ID для узла
   * @param {string} prefix - префикс
   * @returns {string}
   */
  generateNodeId(prefix = 'n') {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  // ── Валидация ────────────────────────────────────

  /**
   * Валидация unit'а
   * @param {Object} unit - unit для проверки
   * @returns {Object} - { valid: boolean, errors: string[] }
   */
  validateUnit(unit) {
    const errors = [];
    
    if (!unit.title || unit.title.trim() === '') {
      errors.push('Название обязательно');
    }
    
    if (!unit.type) {
      errors.push('Тип обязателен');
    }
    
    // Для экзамена проверяем наличие вопросов
    if (unit.type === 'exam') {
      const questions = this.countNodes(unit, 'question');
      if (questions === 0) {
        errors.push('Экзамен должен содержать хотя бы один вопрос');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
    };
  },

  /**
   * Подсчитать узлы определённого типа
   * @param {Object} root - корневой узел
   * @param {string} type - тип узла
   * @returns {number}
   */
  countNodes(root, type) {
    let count = root.type === type ? 1 : 0;
    
    if (root.children) {
      for (const child of root.children) {
        count += this.countNodes(child, type);
      }
    }
    
    return count;
  },
};

export default builderService;
