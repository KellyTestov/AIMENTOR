/**
 * ══════════════════════════════════════════════════
 * AI-Ментор · Event Bus
 * ══════════════════════════════════════════════════
 * 
 * Централизованная шина событий для коммуникации между
 * бизнес-компонентами без прямой зависимости.
 */

/* ── Типы событий ───────────────────────────────────── */

export const EventTypes = {
  // События каталога
  CATALOG_FILTER_CHANGED: 'catalog:filter:changed',
  CATALOG_SEARCH_CHANGED: 'catalog:search:changed',
  CATALOG_SORT_CHANGED: 'catalog:sort:changed',
  CATALOG_REFRESH: 'catalog:refresh',
  
  // События единиц обучения
  UNIT_CREATED: 'unit:created',
  UNIT_UPDATED: 'unit:updated',
  UNIT_DELETED: 'unit:deleted',
  UNIT_PUBLISHED: 'unit:published',
  
  // События конструктора
  BUILDER_NODE_SELECTED: 'builder:node:selected',
  BUILDER_NODE_UPDATED: 'builder:node:updated',
  BUILDER_NODE_ADDED: 'builder:node:added',
  BUILDER_NODE_DELETED: 'builder:node:deleted',
  BUILDER_SAVED: 'builder:saved',
  BUILDER_PUBLISHED: 'builder:published',
  BUILDER_DELETED: 'builder:deleted',
  BUILDER_PREVIEW: 'builder:preview',
  BUILDER_DIRTY_CHANGED: 'builder:dirty:changed',
  
  // События песочницы
  SANDBOX_SESSION_STARTED: 'sandbox:session:started',
  SANDBOX_SESSION_COMPLETED: 'sandbox:session:completed',
  SANDBOX_QUESTION_ANSWERED: 'sandbox:question:answered',
  SANDBOX_TIME_UPDATE: 'sandbox:time:update',
  
  // События аналитики
  ANALYTICS_FILTER_CHANGED: 'analytics:filter:changed',
  ANALYTICS_DATA_UPDATED: 'analytics:data:updated',
  
  // События пользователя
  USER_CHANGED: 'user:changed',
  USER_RIGHTS_CHANGED: 'user:rights:changed',
  USER_CREATED: 'user:created',
  USER_UPDATED: 'user:updated',
  USER_DELETED: 'user:deleted',
  
  // UI события
  MODAL_OPENED: 'ui:modal:opened',
  MODAL_CLOSED: 'ui:modal:closed',
  TOAST_SHOW: 'ui:toast:show',
  NAVIGATION_CHANGED: 'ui:navigation:changed',
};

/* ── Event Bus класс ────────────────────────────────── */

class EventBusClass {
  constructor() {
    this.listeners = new Map();
    this.onceListeners = new Map();
    this.history = [];
    this.maxHistorySize = 100;
  }

  /**
   * Подписка на событие
   * @param {string} eventType - тип события
   * @param {Function} callback - обработчик
   * @param {Object} options - опции
   * @returns {Function} - функция отписки
   */
  on(eventType, callback, options = {}) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    
    const listener = {
      callback,
      priority: options.priority || 0,
      context: options.context || null,
    };
    
    this.listeners.get(eventType).add(listener);
    
    // Возвращаем функцию отписки
    return () => this.off(eventType, callback);
  }

  /**
   * Одноразовая подписка на событие
   * @param {string} eventType - тип события
   * @param {Function} callback - обработчик
   * @returns {Function} - функция отписки
   */
  once(eventType, callback) {
    if (!this.onceListeners.has(eventType)) {
      this.onceListeners.set(eventType, new Set());
    }
    
    this.onceListeners.get(eventType).add(callback);
    
    return () => {
      const listeners = this.onceListeners.get(eventType);
      if (listeners) {
        listeners.delete(callback);
      }
    };
  }

  /**
   * Отписка от события
   * @param {string} eventType - тип события
   * @param {Function} callback - обработчик
   */
  off(eventType, callback) {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      for (const listener of listeners) {
        if (listener.callback === callback) {
          listeners.delete(listener);
          break;
        }
      }
    }
    
    const onceListeners = this.onceListeners.get(eventType);
    if (onceListeners) {
      onceListeners.delete(callback);
    }
  }

  /**
   * Отправка события
   * @param {string} eventType - тип события
   * @param {any} data - данные события
   */
  emit(eventType, data = null) {
    // Сохраняем в историю
    this.addToHistory(eventType, data);
    
    // Обычные обработчики
    const listeners = this.listeners.get(eventType);
    if (listeners && listeners.size > 0) {
      // Сортируем по приоритету
      const sorted = [...listeners].sort((a, b) => b.priority - a.priority);
      
      for (const listener of sorted) {
        try {
          if (listener.context) {
            listener.callback.call(listener.context, data);
          } else {
            listener.callback(data);
          }
        } catch (e) {
          console.error(`EventBus error in handler for "${eventType}":`, e);
        }
      }
    }
    
    // Одноразовые обработчики
    const onceListeners = this.onceListeners.get(eventType);
    if (onceListeners && onceListeners.size > 0) {
      const callbacks = [...onceListeners];
      this.onceListeners.delete(eventType);
      
      for (const callback of callbacks) {
        try {
          callback(data);
        } catch (e) {
          console.error(`EventBus error in once handler for "${eventType}":`, e);
        }
      }
    }
  }

  /**
   * Асинхронная отправка события
   * @param {string} eventType - тип события
   * @param {any} data - данные события
   */
  async emitAsync(eventType, data = null) {
    // Используем setTimeout для асинхронности
    return new Promise((resolve) => {
      setTimeout(() => {
        this.emit(eventType, data);
        resolve();
      }, 0);
    });
  }

  /**
   * Ожидание события (Promise)
   * @param {string} eventType - тип события
   * @param {number} timeout - таймаут в мс (0 = без таймаута)
   * @returns {Promise}
   */
  waitFor(eventType, timeout = 0) {
    return new Promise((resolve, reject) => {
      let timeoutId;
      
      const unsubscribe = this.once(eventType, (data) => {
        if (timeoutId) clearTimeout(timeoutId);
        resolve(data);
      });
      
      if (timeout > 0) {
        timeoutId = setTimeout(() => {
          unsubscribe();
          reject(new Error(`Event "${eventType}" timeout`));
        }, timeout);
      }
    });
  }

  /**
   * Добавление в историю событий
   * @param {string} eventType - тип события
   * @param {any} data - данные
   */
  addToHistory(eventType, data) {
    this.history.push({
      type: eventType,
      data,
      timestamp: Date.now(),
    });
    
    // Ограничиваем размер истории
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  /**
   * Получение истории событий
   * @param {string} eventType - тип события (опционально)
   * @returns {Array}
   */
  getHistory(eventType = null) {
    if (eventType) {
      return this.history.filter(e => e.type === eventType);
    }
    return [...this.history];
  }

  /**
   * Очистка истории
   */
  clearHistory() {
    this.history = [];
  }

  /**
   * Удаление всех подписчиков для события
   * @param {string} eventType - тип события
   */
  clearListeners(eventType) {
    if (eventType) {
      this.listeners.delete(eventType);
      this.onceListeners.delete(eventType);
    } else {
      this.listeners.clear();
      this.onceListeners.clear();
    }
  }

  /**
   * Проверка наличия подписчиков
   * @param {string} eventType - тип события
   * @returns {boolean}
   */
  hasListeners(eventType) {
    const listeners = this.listeners.get(eventType);
    const onceListeners = this.onceListeners.get(eventType);
    return (listeners && listeners.size > 0) || (onceListeners && onceListeners.size > 0);
  }
}

/* ── Создание singleton экземпляра ──────────────────── */

const eventBusInstance = new EventBusClass();

// Экспортируем класс
export { EventBusClass };
// Экспортируем singleton как EventBus для удобства использования
export const EventBus = eventBusInstance;
export const eventBus = eventBusInstance;
export const EventBusInstance = eventBusInstance;

/* ── Удобные функции-хелперы ───────────────────────── */

export const on = eventBusInstance.on.bind(eventBusInstance);
export const once = eventBusInstance.once.bind(eventBusInstance);
export const off = eventBusInstance.off.bind(eventBusInstance);
export const emit = eventBusInstance.emit.bind(eventBusInstance);
export const emitAsync = eventBusInstance.emitAsync.bind(eventBusInstance);
export const waitFor = eventBusInstance.waitFor.bind(eventBusInstance);

// Для обратной совместимости - экспортируем eventBusInstance как default
export default eventBusInstance;
