/**
 * ══════════════════════════════════════════════════
 * AI-Ментор — Точка входа
 * ══════════════════════════════════════════════════
 */

import { initApp } from './home/home.js';

// Автоинициализация при DOMContentLoaded
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const page = document.body.dataset.page;
    const bootstrap = window.AI_MENTOR_BOOTSTRAP || {};

    switch (page) {
      case 'home':
        window.app = initApp(bootstrap);
        break;
      // builder и sandbox — отдельные HTML-страницы со своими entry points
      default:
        if (document.querySelector('.app-shell')) {
          window.app = initApp(bootstrap);
        }
    }
  });
}
