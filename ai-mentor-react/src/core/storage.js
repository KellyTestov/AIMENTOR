/**
 * ══════════════════════════════════════════════════
 * AI-Ментор · Абстракция хранилища
 * ══════════════════════════════════════════════════
 * 
 * Единый интерфейс для работы с хранилищем данных.
 * Сейчас использует localStorage, но легко переключается на API.
 */

/* ── Конфигурация ───────────────────────────────────── */

/**
 * Режим работы хранилища
 * - 'local' — localStorage (по умолчанию)
 * - 'api' — REST API (будущее)
 * - 'mock' — in-memory для тестов
 */
let storageMode = 'local';

/**
 * Базовый URL для API (будущее)
 */
let apiBaseUrl = '/api/v1';

/**
 * In-memory хранилище для режима mock
 */
const mockStorage = new Map();

/* ── Публичный API ──────────────────────────────────── */

/**
 * Установка режима хранилища
 * @param {'local'|'api'|'mock'} mode - режим
 * @param {Object} options - опции (apiBaseUrl для режима api)
 */
export function configureStorage(mode, options = {}) {
  storageMode = mode;
  if (options.apiBaseUrl) {
    apiBaseUrl = options.apiBaseUrl;
  }
}

/**
 * Получение значения
 * @param {string} key - ключ
 * @returns {any} - значение или null
 */
export function get(key) {
  switch (storageMode) {
    case 'local':
      return getFromLocalStorage(key);
    case 'api':
      console.warn('Storage API mode not implemented yet, falling back to localStorage');
      return getFromLocalStorage(key);
    case 'mock':
      return mockStorage.get(key) || null;
    default:
      return getFromLocalStorage(key);
  }
}

/**
 * Сохранение значения
 * @param {string} key - ключ
 * @param {any} value - значение
 */
export function set(key, value) {
  switch (storageMode) {
    case 'local':
      setToLocalStorage(key, value);
      break;
    case 'api':
      console.warn('Storage API mode not implemented yet, falling back to localStorage');
      setToLocalStorage(key, value);
      break;
    case 'mock':
      mockStorage.set(key, value);
      break;
    default:
      setToLocalStorage(key, value);
  }
}

/**
 * Удаление значения
 * @param {string} key - ключ
 */
export function remove(key) {
  switch (storageMode) {
    case 'local':
      localStorage.removeItem(key);
      break;
    case 'api':
      console.warn('Storage API mode not implemented yet, falling back to localStorage');
      localStorage.removeItem(key);
      break;
    case 'mock':
      mockStorage.delete(key);
      break;
    default:
      localStorage.removeItem(key);
  }
}

/**
 * Очистка всего хранилища (только ключи приложения)
 * @param {string[]} appKeys - массив ключей приложения
 */
export function clear(appKeys = []) {
  if (appKeys.length === 0) {
    // Если ключи не указаны, очищаем всё
    switch (storageMode) {
      case 'local':
        localStorage.clear();
        break;
      case 'mock':
        mockStorage.clear();
        break;
    }
    return;
  }
  
  // Удаляем только указанные ключи
  for (const key of appKeys) {
    remove(key);
  }
}

/**
 * Проверка существования ключа
 * @param {string} key - ключ
 * @returns {boolean}
 */
export function has(key) {
  switch (storageMode) {
    case 'local':
      return localStorage.getItem(key) !== null;
    case 'mock':
      return mockStorage.has(key);
    default:
      return localStorage.getItem(key) !== null;
  }
}

/**
 * Получение всех ключей хранилища
 * @returns {string[]}
 */
export function keys() {
  switch (storageMode) {
    case 'local':
      return Object.keys(localStorage);
    case 'mock':
      return Array.from(mockStorage.keys());
    default:
      return Object.keys(localStorage);
  }
}

/* ── Специализированные методы ──────────────────────── */

/**
 * Получение объекта из хранилища
 * @param {string} key - ключ
 * @param {any} defaultValue - значение по умолчанию
 * @returns {Object}
 */
export function getObject(key, defaultValue = {}) {
  const value = get(key);
  if (value === null) return defaultValue;
  try {
    return JSON.parse(value);
  } catch {
    return defaultValue;
  }
}

/**
 * Сохранение объекта в хранилище
 * @param {string} key - ключ
 * @param {Object} value - объект
 */
export function setObject(key, value) {
  try {
    set(key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage setObject error:', e);
  }
}

/**
 * Получение массива из хранилища
 * @param {string} key - ключ
 * @param {any[]} defaultValue - значение по умолчанию
 * @returns {Array}
 */
export function getArray(key, defaultValue = []) {
  const value = get(key);
  if (value === null) return defaultValue;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Добавление элемента в массив в хранилище
 * @param {string} key - ключ
 * @param {any} item - элемент
 */
export function pushToArray(key, item) {
  const arr = getArray(key);
  arr.push(item);
  setObject(key, arr);
}

/* ── Внутренние методы ──────────────────────────────── */

function getFromLocalStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.error('Storage get error:', e);
    return null;
  }
}

function setToLocalStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.error('Storage set error:', e);
    // Возможно, хранилище переполнено
    if (e.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded, consider clearing old data');
    }
  }
}

/* ── Экспорт объекта storage для удобства ───────────── */

export const storage = {
  get,
  set,
  remove,
  clear,
  has,
  keys,
  getObject,
  setObject,
  getArray,
  pushToArray,
  configure: configureStorage,
};

export default storage;
