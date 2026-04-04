/**
 * ══════════════════════════════════════════════════
 * AI-Ментор · Home Page (orchestrator)
 * ══════════════════════════════════════════════════
 *
 * Тонкий оркестратор: инициализирует секции, управляет навигацией.
 */

import { EventBus, EventTypes } from '../core/events.js';
import { NAV_ICONS } from '../core/constants.js';
import { getUnits } from '../shared/mock/units.js';
import { getCurrentUser, getAccessUsers } from '../shared/mock/users.js';
import { getAnalyticsSessions } from '../shared/mock/analytics.js';
import { escapeHtml } from '../core/utils.js';

import { CatalogSection } from './sections/catalog.js';
import { AnalyticsSection } from './sections/analytics.js';
import { AdminSection } from './sections/admin.js';
import { CreationWizard } from './wizard/wizard.js';

export class HomePage {
  constructor({ bootstrap = {} } = {}) {
    this.bootstrap = bootstrap;
    this.currentUser = getCurrentUser(bootstrap);
    this.units = getUnits({ currentUser: this.currentUser, bootstrap });
    this.accessUsers = getAccessUsers(bootstrap);
    this.analyticsSessions = getAnalyticsSessions(bootstrap);
    this.activeSection = 'catalog';

    this.init();
  }

  init() {
    if (!this.currentUser.rights.canAccessHome) {
      this._renderNoAccess();
      return;
    }

    // DOM
    this.dom = {
      nav: document.getElementById('main-nav'),
      createBtn: document.getElementById('create-btn'),
      sectionTitle: document.getElementById('section-title'),
      sectionSubtitle: document.getElementById('section-subtitle'),
      catalogSection: document.getElementById('catalog-section'),
      analyticsSection: document.getElementById('analytics-section'),
      adminSection: document.getElementById('admin-section'),
      userAvatar: document.getElementById('user-avatar'),
      userName: document.getElementById('user-name'),
      userRole: document.getElementById('user-role'),
    };

    // Секции
    this.catalog = new CatalogSection(this.dom.catalogSection, {
      units: this.units,
      currentUser: this.currentUser,
      onDelete: (id) => EventBus.emit(EventTypes.UNIT_DELETED, { id }),
    });

    this.analytics = new AnalyticsSection(this.dom.analyticsSection, {
      sessions: this.analyticsSessions,
    });

    this.admin = new AdminSection(this.dom.adminSection, {
      users: this.accessUsers,
      currentUser: this.currentUser,
    });

    this.wizard = new CreationWizard({
      currentUser: this.currentUser,
      units: this.units,
      onCreated: (unit) => {
        this.units.push(unit);
        this.catalog.render();
        EventBus.emit(EventTypes.UNIT_CREATED, unit);
        this._showToast('Обучение создано', 'success');
      },
    });

    this._renderUserBlock();
    this._renderNav();
    this._bindEvents();
    this._refreshView();
  }

  /* ── User block ───────────────────────────────── */

  _renderUserBlock() {
    if (this.dom.userName) this.dom.userName.textContent = this.currentUser.name;
    if (this.dom.userRole) this.dom.userRole.textContent = this.currentUser.roleName;
    if (this.dom.userAvatar) this.dom.userAvatar.textContent = this._getInitials(this.currentUser.name);
  }

  _getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2);
  }

  /* ── Navigation ───────────────────────────────── */

  _renderNav() {
    const items = [
      { id: 'catalog', label: 'Каталог обучения', visible: this.currentUser.rights.canViewCatalog !== false },
      { id: 'analytics', label: 'Аналитика', visible: this.currentUser.rights.canViewAnalytics === true },
      { id: 'admin', label: 'Админ-панель', visible: this.currentUser.rights.canManageUsers === true },
    ].filter(item => item.visible);

    if (items.length === 0) {
      if (this.dom.nav) this.dom.nav.innerHTML = '';
      return;
    }

    if (!items.some(item => item.id === this.activeSection)) {
      this.activeSection = items[0].id;
    }

    if (this.dom.nav) {
      this.dom.nav.innerHTML = '';
      items.forEach(item => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `nav-link ${this.activeSection === item.id ? 'is-active' : ''}`;
        btn.dataset.section = item.id;

        const iconSrc = NAV_ICONS[item.id];
        btn.innerHTML = iconSrc
          ? `<img class="nav-icon" src="${iconSrc}" alt="" aria-hidden="true" />${escapeHtml(item.label)}`
          : escapeHtml(item.label);

        this.dom.nav.appendChild(btn);
      });
    }
  }

  _bindEvents() {
    // Навигация
    if (this.dom.nav) {
      this.dom.nav.addEventListener('click', (e) => {
        const target = e.target.closest('button[data-section]');
        if (!target) return;
        const next = target.dataset.section;
        if (next === 'analytics' && !this.currentUser.rights.canViewAnalytics) return;
        if (next === 'admin' && !this.currentUser.rights.canManageUsers) return;
        this.activeSection = next;
        this._refreshView();
      });
    }

    // Кнопка создания
    if (this.dom.createBtn) {
      this.dom.createBtn.addEventListener('click', () => this.wizard.open());
    }
  }

  _refreshView() {
    const sections = {
      catalog: { el: this.dom.catalogSection, title: 'Каталог обучения', subtitle: 'Единицы обучения созданные на платформе AI-ментора', render: () => this.catalog.render() },
      analytics: { el: this.dom.analyticsSection, title: 'Аналитика', subtitle: 'Отчёты и статистика прохождения', render: () => this.analytics.render() },
      admin: { el: this.dom.adminSection, title: 'Админ-панель', subtitle: 'Управление доступом', render: () => this.admin.render() },
    };

    Object.values(sections).forEach(s => { if (s.el) s.el.classList.add('hidden'); });

    const active = sections[this.activeSection];
    if (active) {
      if (active.el) active.el.classList.remove('hidden');
      if (this.dom.sectionTitle) this.dom.sectionTitle.textContent = active.title;
      if (this.dom.sectionSubtitle) this.dom.sectionSubtitle.textContent = active.subtitle;
      active.render();
    }

    if (this.dom.createBtn) {
      const show = this.currentUser.rights.canCreate === true && this.activeSection === 'catalog';
      this.dom.createBtn.classList.toggle('hidden', !show);
    }

    this._renderNav();
  }

  /* ── Helpers ──────────────────────────────────── */

  _renderNoAccess() {
    document.body.innerHTML = `
      <main style="font-family: Inter, 'Segoe UI', sans-serif; min-height: 100vh; display: grid; place-items: center; background: #f4f6f8; color: #1f2937;">
        <section style="max-width: 560px; border: 1px solid #e5e7eb; border-radius: 16px; background: #fff; padding: 24px; text-align: center;">
          <h1 style="margin-top: 0;">Доступ ограничен</h1>
          <p style="color: #6b7280; margin: 0;">У вас нет прав на открытие главной страницы AI-Ментор. Обратитесь за доступом по универсальной заявке.</p>
        </section>
      </main>`;
  }

  _showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => { toast.classList.add('is-hiding'); setTimeout(() => toast.remove(), 300); }, 3000);
  }

  destroy() {
    // Cleanup EventBus listeners if needed
  }
}

export function createHomePage(options) {
  return new HomePage(options);
}

export function initApp(bootstrap = {}) {
  return createHomePage({ bootstrap });
}
