/**
 * AI-Ментор · Admin Section
 *
 * Админ-панель: таблица пользователей, смена ролей, удаление доступа.
 */

import { storage } from '../../core/storage.js';
import { STORAGE_KEYS } from '../../core/constants.js';
import { escapeHtml } from '../../core/utils.js';

const ROLE_OPTIONS = ['Редактор', 'Аналитик', 'Администратор'];

export class AdminSection {
  /**
   * @param {HTMLElement} container — #admin-section
   * @param {Object} opts
   * @param {Array} opts.users — accessUsers (мутабельная ссылка)
   * @param {Object} opts.currentUser
   */
  constructor(container, { users, currentUser }) {
    this.el = container;
    this.users = users;
    this.currentUser = currentUser;
    this.searchText = '';
    this.pendingAdminAction = null;

    this.dom = {
      searchInput: document.getElementById('admin-search-input'),
      usersBody: document.getElementById('admin-users-body'),
      userCount: document.getElementById('admin-user-count'),
      confirmBackdrop: document.getElementById('admin-confirm-backdrop'),
      confirmTitle: document.getElementById('admin-confirm-title'),
      confirmText: document.getElementById('admin-confirm-text'),
      confirmCancelBtn: document.getElementById('admin-confirm-cancel-btn'),
      confirmOkBtn: document.getElementById('admin-confirm-ok-btn'),
    };

    this._bindEvents();
  }

  _bindEvents() {
    if (this.dom.searchInput) {
      this.dom.searchInput.addEventListener('input', (e) => {
        this.searchText = e.target.value;
        this.render();
      });
    }

    if (this.dom.confirmCancelBtn) {
      this.dom.confirmCancelBtn.addEventListener('click', () => this._closeAdminConfirm(false));
    }
    if (this.dom.confirmOkBtn) {
      this.dom.confirmOkBtn.addEventListener('click', () => this._closeAdminConfirm(true));
    }
  }

  /* ── Render ───────────────────────────────────── */

  render() {
    const search = this.searchText.toLowerCase();
    const filtered = this.users.filter(u => {
      if (!search) return true;
      return u.fullName?.toLowerCase().includes(search) ||
             u.userId?.toLowerCase().includes(search) ||
             u.role?.toLowerCase().includes(search);
    });

    if (this.dom.userCount) this.dom.userCount.textContent = filtered.length;

    if (!this.dom.usersBody) return;

    this.dom.usersBody.innerHTML = filtered.map(u => {
      const devBadge = u.isDeveloper
        ? `<button type="button" class="dev-badge">Dev<span class="dev-tooltip">Разработчик сервиса AI-Ментор</span></button>`
        : '';

      const roleCell = u.isProtected
        ? `<span class="service-role-badge">${escapeHtml(u.role || 'Команда сервиса')}</span>`
        : `<select class="admin-role-select" data-user-id="${escapeHtml(u.userId)}" data-prev-role="${escapeHtml(u.role || '')}">
            ${ROLE_OPTIONS.map(r => `<option value="${escapeHtml(r)}"${u.role === r ? ' selected' : ''}>${escapeHtml(r)}</option>`).join('')}
           </select>`;

      const actionCell = u.isProtected
        ? `<button type="button" class="admin-action-btn" disabled>Забрать доступ</button>`
        : `<button type="button" class="admin-action-btn" data-action="revoke-access" data-user-id="${escapeHtml(u.userId)}">Забрать доступ</button>`;

      return `
        <tr data-user-id="${escapeHtml(u.userId)}">
          <td>${escapeHtml(u.fullName)}${devBadge}</td>
          <td><code>${escapeHtml(u.userId)}</code></td>
          <td>${roleCell}</td>
          <td>${actionCell}</td>
        </tr>`;
    }).join('');

    // Смена роли — с подтверждением
    this.dom.usersBody.querySelectorAll('.admin-role-select').forEach(select => {
      select.addEventListener('change', (e) => {
        const userId = e.target.dataset.userId;
        const prevRole = e.target.dataset.prevRole;
        const newRole = e.target.value;
        const user = this.users.find(u => u.userId === userId);
        if (!user) return;

        // Откатываем значение до подтверждения
        e.target.value = prevRole;

        this._openAdminConfirm({
          type: 'role',
          userId,
          fullName: user.fullName,
          newRole,
          prevRole,
          selectEl: e.target,
        });
      });
    });

    // Забрать доступ
    this.dom.usersBody.querySelectorAll('[data-action="revoke-access"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const userId = btn.dataset.userId;
        const user = this.users.find(u => u.userId === userId);
        if (!user) return;
        this._openAdminConfirm({ type: 'revoke', userId, fullName: user.fullName });
      });
    });
  }

  /* ── Confirm modal ────────────────────────────── */

  _openAdminConfirm({ type, userId, fullName, newRole, prevRole, selectEl }) {
    this.pendingAdminAction = { type, userId, fullName, newRole, prevRole, selectEl };

    if (this.dom.confirmTitle) {
      this.dom.confirmTitle.textContent = type === 'role' ? 'Изменение роли' : 'Отзыв доступа';
    }
    if (this.dom.confirmText) {
      this.dom.confirmText.textContent = type === 'role'
        ? `Вы уверены, что хотите изменить роль пользователя «${fullName}» на «${newRole}»?`
        : `Вы уверены, что хотите забрать доступ у пользователя «${fullName}»?`;
    }
    if (this.dom.confirmBackdrop) this.dom.confirmBackdrop.classList.remove('hidden');
  }

  _closeAdminConfirm(confirmed) {
    const action = this.pendingAdminAction;
    this.pendingAdminAction = null;
    if (this.dom.confirmBackdrop) this.dom.confirmBackdrop.classList.add('hidden');

    if (!action || !confirmed) return;

    if (action.type === 'role') {
      const user = this.users.find(u => u.userId === action.userId);
      if (user) {
        user.role = action.newRole;
        if (action.selectEl) {
          action.selectEl.value = action.newRole;
          action.selectEl.dataset.prevRole = action.newRole;
        }
        this._saveUsers();
        this._showToast(`Роль «${action.fullName}» изменена на «${action.newRole}»`, 'success');
      }
    } else if (action.type === 'revoke') {
      const idx = this.users.findIndex(u => u.userId === action.userId);
      if (idx !== -1) {
        this.users.splice(idx, 1);
        this._saveUsers();
        this.render();
        this._showToast(`Доступ пользователя «${action.fullName}» отозван`, 'success');
      }
    }
  }

  /* ── Helpers ──────────────────────────────────── */

  _saveUsers() {
    storage.set(STORAGE_KEYS.ACCESS_USERS, JSON.stringify(this.users));
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
}
