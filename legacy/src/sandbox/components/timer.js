/**
 * ══════════════════════════════════════════════════
 * Timer Component
 * ══════════════════════════════════════════════════
 * 
 * Компонент таймера в песочнице.
 */

import { EventBus, EventTypes } from '../../core/events.js';

/**
 * Класс компонента таймера
 */
export class Timer {
  /**
   * @param {Object} options
   * @param {HTMLElement} options.container - Контейнер
   * @param {number} options.duration - Длительность в секундах (0 = без ограничений)
   * @param {Function} options.onTimeUp - Callback при истечении времени
   */
  constructor({ container, duration = 0, onTimeUp }) {
    this.container = container;
    this.duration = duration;
    this.onTimeUp = onTimeUp;
    
    this.elapsed = 0;
    this.interval = null;
    this.isRunning = false;
    
    this.init();
  }

  /**
   * Инициализирует компонент
   */
  init() {
    this.render();
  }

  /**
   * Запускает таймер
   */
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.interval = setInterval(() => {
      this.elapsed++;
      this.render();
      
      EventBus.emit(EventTypes.SANDBOX_TIME_UPDATE, { elapsed: this.elapsed });
      
      if (this.duration > 0 && this.elapsed >= this.duration) {
        this.stop();
        this.onTimeUp?.();
      }
    }, 1000);
  }

  /**
   * Останавливает таймер
   */
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isRunning = false;
  }

  /**
   * Сбрасывает таймер
   */
  reset() {
    this.stop();
    this.elapsed = 0;
    this.render();
  }

  /**
   * Устанавливает длительность
   * @param {number} duration
   */
  setDuration(duration) {
    this.duration = duration;
    this.render();
  }

  /**
   * Форматирует время
   * @param {number} seconds
   * @returns {string}
   */
  formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * Рендерит компонент
   */
  render() {
    const remaining = this.duration > 0 ? Math.max(0, this.duration - this.elapsed) : 0;
    const isWarning = this.duration > 0 && remaining < 60;
    const isCritical = this.duration > 0 && remaining < 30;
    
    this.container.innerHTML = `
      <div class="timer ${isWarning ? 'timer-warning' : ''} ${isCritical ? 'timer-critical' : ''}">
        <div class="timer-icon">
          <svg viewBox="0 0 24 24" width="20" height="20">
            <path fill="currentColor" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
          </svg>
        </div>
        <div class="timer-display">
          ${this.duration > 0 ? `
            <span class="timer-remaining">${this.formatTime(remaining)}</span>
            <span class="timer-separator">/</span>
          ` : ''}
          <span class="timer-elapsed">${this.formatTime(this.elapsed)}</span>
        </div>
      </div>
    `;
  }

  /**
   * Уничтожает компонент
   */
  destroy() {
    this.stop();
  }
}

/**
 * Создаёт экземпляр компонента таймера
 * @param {Object} options
 * @returns {Timer}
 */
export function createTimer(options) {
  return new Timer(options);
}
