/**
 * ══════════════════════════════════════════════════
 * AI-Ментор · Общие утилиты
 * ══════════════════════════════════════════════════
 * 
 * Общие функции-утилиты для всех бизнес-компонент.
 */

import { DATE_FORMAT } from './constants.js';

/* ── Строковые утилиты ──────────────────────────────── */

/**
 * Экранирование HTML-символов для предотвращения XSS
 * @param {string} str - исходная строка
 * @returns {string} - экранированная строка
 */
export function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Получение инициалов из полного имени
 * @param {string} fullName - полное имя (например, "Иванов Иван Иванович")
 * @returns {string} - инициалы (например, "ИИ")
 */
export function initials(fullName) {
  if (!fullName) return '';
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Сокращение строки до указанной длины
 * @param {string} str - исходная строка
 * @param {number} maxLength - максимальная длина
 * @param {string} suffix - суффикс при обрезке (по умолчанию "...")
 * @returns {string}
 */
export function truncate(str, maxLength, suffix = '...') {
  if (!str || str.length <= maxLength) return str || '';
  return str.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Транслитерация кириллицы в латиницу
 * @param {string} str - строка на кириллице
 * @returns {string} - строка на латинице
 */
export function transliterate(str) {
  const map = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
  };
  return str.toLowerCase().split('').map(c => map[c] || c).join('');
}

/**
 * Генерация slug из строки
 * @param {string} str - исходная строка
 * @returns {string} - slug
 */
export function slugify(str) {
  return transliterate(str)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

/* ── Дата и время ───────────────────────────────────── */

/**
 * Форматирование даты
 * @param {string|Date} date - дата
 * @param {Object} options - опции форматирования
 * @returns {string}
 */
export function formatDate(date, options = DATE_FORMAT.DATE_OPTIONS) {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString(DATE_FORMAT.LOCALE, options);
}

/**
 * Форматирование даты и времени
 * @param {string|Date} date - дата
 * @returns {string}
 */
export function formatDateTime(date) {
  return formatDate(date, DATE_FORMAT.DATETIME_OPTIONS);
}

/**
 * Относительное время (например, "2 дня назад")
 * @param {string|Date} date - дата
 * @returns {string}
 */
export function relativeTime(date) {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  
  const now = new Date();
  const diff = now - d;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  
  if (seconds < 60) return 'только что';
  if (minutes < 60) return `${minutes} мин. назад`;
  if (hours < 24) return `${hours} ч. назад`;
  if (days < 7) return `${days} дн. назад`;
  if (weeks < 4) return `${weeks} нед. назад`;
  if (months < 12) return `${months} мес. назад`;
  return formatDate(d);
}

/**
 * Форматирование длительности в минутах в читаемый вид
 * @param {number} minutes - количество минут
 * @returns {string}
 */
export function formatDuration(minutes) {
  if (!minutes || minutes < 0) return '0 мин';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins} мин`;
  if (mins === 0) return `${hours} ч`;
  return `${hours} ч ${mins} мин`;
}

/* ── Числа ──────────────────────────────────────────── */

/**
 * Форматирование числа с разделителями
 * @param {number} num - число
 * @param {number} decimals - количество знаков после запятой
 * @returns {string}
 */
export function formatNumber(num, decimals = 0) {
  if (num == null || isNaN(num)) return '';
  return num.toLocaleString(DATE_FORMAT.LOCALE, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Форматирование валюты
 * @param {number} amount - сумма
 * @param {string} currency - код валюты (по умолчанию RUB)
 * @returns {string}
 */
export function formatCurrency(amount, currency = 'RUB') {
  if (amount == null || isNaN(amount)) return '';
  return amount.toLocaleString(DATE_FORMAT.LOCALE, {
    style: 'currency',
    currency,
  });
}

/**
 * Процент от числа
 * @param {number} value - значение
 * @param {number} total - общее количество
 * @param {number} decimals - знаки после запятой
 * @returns {string}
 */
export function formatPercent(value, total, decimals = 0) {
  if (!total || total === 0) return '0%';
  const percent = (value / total) * 100;
  return `${percent.toFixed(decimals)}%`;
}

/**
 * Округление до указанного количества знаков
 * @param {number} num - число
 * @param {number} decimals - знаки после запятой
 * @returns {number}
 */
export function round(num, decimals = 2) {
  if (num == null || isNaN(num)) return 0;
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}

/* ── Массивы и объекты ──────────────────────────────── */

/**
 * Группировка массива по ключу
 * @param {Array} arr - массив
 * @param {string|Function} keyFn - ключ или функция для группировки
 * @returns {Object}
 */
export function groupBy(arr, keyFn) {
  if (!Array.isArray(arr)) return {};
  const getKey = typeof keyFn === 'function' ? keyFn : (item) => item[keyFn];
  return arr.reduce((acc, item) => {
    const key = getKey(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

/**
 * Уникальные значения массива
 * @param {Array} arr - массив
 * @returns {Array}
 */
export function unique(arr) {
  if (!Array.isArray(arr)) return [];
  return [...new Set(arr)];
}

/**
 * Сортировка массива объектов по полю
 * @param {Array} arr - массив
 * @param {string} field - поле для сортировки
 * @param {string} direction - направление ('asc' или 'desc')
 * @returns {Array}
 */
export function sortBy(arr, field, direction = 'asc') {
  if (!Array.isArray(arr)) return [];
  const sorted = [...arr].sort((a, b) => {
    const aVal = a[field];
    const bVal = b[field];
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    if (typeof aVal === 'string') return aVal.localeCompare(bVal, 'ru');
    return aVal - bVal;
  });
  return direction === 'desc' ? sorted.reverse() : sorted;
}

/**
 * Deep clone объекта
 * @param {Object} obj - объект
 * @returns {Object}
 */
export function deepClone(obj) {
  if (obj == null || typeof obj !== 'object') return obj;
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Deep merge объектов
 * @param {Object} target - целевой объект
 * @param {Object} source - исходный объект
 * @returns {Object}
 */
export function deepMerge(target, source) {
  if (!source) return target;
  if (!target) return deepClone(source);
  
  const result = deepClone(target);
  for (const key of Object.keys(source)) {
    if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
      result[key] = deepMerge(result[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
}

/* ── DOM утилиты ────────────────────────────────────── */

/**
 * Создание элемента из HTML-строки
 * @param {string} html - HTML-строка
 * @returns {Element}
 */
export function createElement(html) {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstChild;
}

/**
 * Очистка всех дочерних элементов
 * @param {Element} element - родительский элемент
 */
export function clearElement(element) {
  while (element && element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

/**
 * Показ/скрытие элемента
 * @param {Element} element - элемент
 * @param {boolean} visible - видимость
 */
export function setVisible(element, visible) {
  if (!element) return;
  element.style.display = visible ? '' : 'none';
}

/**
 * Добавление/удаление класса
 * @param {Element} element - элемент
 * @param {string} className - класс
 * @param {boolean} add - добавить или удалить
 */
export function toggleClass(element, className, add) {
  if (!element) return;
  if (add === undefined) {
    element.classList.toggle(className);
  } else if (add) {
    element.classList.add(className);
  } else {
    element.classList.remove(className);
  }
}

/* ── Функциональные утилиты ─────────────────────────── */

/**
 * Debounce функции
 * @param {Function} fn - функция
 * @param {number} delay - задержка в мс
 * @returns {Function}
 */
export function debounce(fn, delay = 300) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Throttle функции
 * @param {Function} fn - функция
 * @param {number} limit - лимит в мс
 * @returns {Function}
 */
export function throttle(fn, limit = 100) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      fn.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Генерация уникального ID
 * @param {string} prefix - префикс
 * @returns {string}
 */
let _idCounter = 0;
export function generateId(prefix = 'id') {
  return `${prefix}-${++_idCounter}-${Date.now().toString(36)}`;
}

/* ── Валидация ──────────────────────────────────────── */

/**
 * Проверка email
 * @param {string} email - email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Проверка телефона (российский формат)
 * @param {string} phone - телефон
 * @returns {boolean}
 */
export function isValidPhone(phone) {
  if (!phone) return false;
  const re = /^\+?7[\s\-]?\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}$/;
  return re.test(phone.replace(/\s/g, ''));
}

/**
 * Проверка что строка не пустая
 * @param {string} str - строка
 * @returns {boolean}
 */
export function isNotEmpty(str) {
  return str != null && String(str).trim().length > 0;
}
