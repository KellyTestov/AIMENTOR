/**
 * AI-Ментор · Analytics Section
 *
 * Аналитика: фильтры по периоду/статусу/фабрике/сотруднику, метрики, таблица, экспорт.
 */

import { escapeHtml, formatDate } from '../../core/utils.js';
import { FACTORIES, ALL_DIRECTIONS, DIRECTION_MAP } from '../../core/constants.js';

export class AnalyticsSection {
  /**
   * @param {HTMLElement} container — #analytics-section
   * @param {Object} opts
   * @param {Array} opts.sessions — ANALYTICS_SESSIONS
   */
  constructor(container, { sessions }) {
    this.el = container;
    this.sessions = sessions;
    this._activeDD = null;
    this._lastFiltered = [];

    this.state = {
      period: 'month',
      customFrom: '',
      customTo: '',
      status: 'all',
      factories: [],
      directions: [],
      unitSearch: '',
      sortByPopularity: false,
      selectedEmployeeId: null,
      employeeSearchText: '',
    };

    this.dom = {
      periodTabs: document.getElementById('an-period-tabs'),
      dateRange: document.getElementById('an-date-range'),
      dateFrom: document.getElementById('an-date-from'),
      dateTo: document.getElementById('an-date-to'),
      unitSearch: document.getElementById('an-unit-search'),
      sortPopular: document.getElementById('an-sort-popular'),
      resetBtn: document.getElementById('an-reset-btn'),
      exportBtn: document.getElementById('an-export-btn'),
      factoryApply: document.getElementById('an-factory-apply'),
      dirApply: document.getElementById('an-dir-apply'),
      mAvgTime: document.getElementById('an-m-avg-time'),
      mAssigned: document.getElementById('an-m-assigned'),
      mInProgress: document.getElementById('an-m-in-progress'),
      mCompleted: document.getElementById('an-m-completed'),
      mAvgScore: document.getElementById('an-m-avg-score'),
      mAvgAttempts: document.getElementById('an-m-avg-attempts'),
      employeeSearch: document.getElementById('an-employee-search'),
      employeeClear: document.getElementById('an-employee-clear'),
      employeeSuggestions: document.getElementById('an-employee-suggestions'),
      tableBody: document.getElementById('an-table-body'),
      emptyAnalytics: document.getElementById('an-empty-analytics'),
    };

    this._bindEvents();
  }

  /* ── Events ───────────────────────────────────── */

  _bindEvents() {
    // Dropdown toggles
    this._bindDropdowns();

    // Периоды
    if (this.dom.periodTabs) {
      this.dom.periodTabs.addEventListener('click', (e) => {
        const tab = e.target.closest('.an-period-tab');
        if (!tab) return;
        this.dom.periodTabs.querySelectorAll('.an-period-tab').forEach(t => t.classList.remove('is-active'));
        tab.classList.add('is-active');
        this.state.period = tab.dataset.period;
        if (tab.dataset.period === 'custom') {
          if (this.dom.dateRange) this.dom.dateRange.classList.remove('hidden');
        } else {
          if (this.dom.dateRange) this.dom.dateRange.classList.add('hidden');
          this.render();
        }
      });
    }

    // Даты
    if (this.dom.dateFrom) {
      this.dom.dateFrom.addEventListener('change', () => {
        this.state.customFrom = this.dom.dateFrom.value;
        this.render();
      });
    }
    if (this.dom.dateTo) {
      this.dom.dateTo.addEventListener('change', () => {
        this.state.customTo = this.dom.dateTo.value;
        this.render();
      });
    }

    // Статус
    document.querySelectorAll('#an-dd-status-panel input[name="an-status"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.state.status = e.target.value;
        this.render();
        this._closeDD('an-dd-status');
      });
    });

    // Фабрики — применить
    if (this.dom.factoryApply) {
      this.dom.factoryApply.addEventListener('click', () => {
        const list = document.getElementById('an-dd-factory-list');
        if (list) this.state.factories = [...list.querySelectorAll('input:checked')].map(cb => cb.value);
        this.render();
        this._closeDD('an-dd-factory');
      });
    }

    // Направления — применить
    if (this.dom.dirApply) {
      this.dom.dirApply.addEventListener('click', () => {
        const list = document.getElementById('an-dd-direction-list');
        if (list) this.state.directions = [...list.querySelectorAll('input:checked')].map(cb => cb.value);
        this.render();
        this._closeDD('an-dd-direction');
      });
    }

    // Поиск по юниту
    if (this.dom.unitSearch) {
      this.dom.unitSearch.addEventListener('input', (e) => {
        this.state.unitSearch = e.target.value;
        this.render();
      });
    }

    // По популярности
    if (this.dom.sortPopular) {
      this.dom.sortPopular.addEventListener('change', (e) => {
        this.state.sortByPopularity = e.target.checked;
        this.render();
      });
    }

    // Сброс
    if (this.dom.resetBtn) {
      this.dom.resetBtn.addEventListener('click', () => this._resetFilters());
    }

    // Экспорт
    if (this.dom.exportBtn) {
      this.dom.exportBtn.addEventListener('click', () => this._export());
    }

    // Поиск по сотруднику
    if (this.dom.employeeSearch) {
      this.dom.employeeSearch.addEventListener('input', (e) => {
        this.state.employeeSearchText = e.target.value;
        this._showEmployeeSuggestions(e.target.value);
      });
    }
    if (this.dom.employeeClear) {
      this.dom.employeeClear.addEventListener('click', () => {
        this.state.selectedEmployeeId = null;
        this.state.employeeSearchText = '';
        if (this.dom.employeeSearch) this.dom.employeeSearch.value = '';
        if (this.dom.employeeClear) this.dom.employeeClear.classList.add('hidden');
        if (this.dom.employeeSuggestions) this.dom.employeeSuggestions.classList.add('hidden');
        this.render();
      });
    }

    // Populate analytics dropdown lists
    this._populateDdList('an-dd-factory-list', FACTORIES);
    this._populateDdList('an-dd-direction-list', ALL_DIRECTIONS);
  }

  /* ── Dropdown toggle ──────────────────────────── */

  _bindDropdowns() {
    const ddIds = ['an-dd-status', 'an-dd-factory', 'an-dd-direction'];
    ddIds.forEach(id => {
      const btn = document.getElementById(id + '-btn');
      if (btn) {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          this._activeDD === id ? this._closeDD(id) : this._openDD(id);
        });
      }
    });

    document.addEventListener('click', (e) => {
      if (this._activeDD && !document.getElementById(this._activeDD)?.contains(e.target)) {
        this._closeDD(this._activeDD);
      }
    });
  }

  _openDD(id) {
    if (this._activeDD && this._activeDD !== id) this._closeDD(this._activeDD);
    document.getElementById(id)?.classList.add('dd--open');
    this._activeDD = id;
  }

  _closeDD(id) {
    document.getElementById(id)?.classList.remove('dd--open');
    if (this._activeDD === id) this._activeDD = null;
  }

  _populateDdList(listId, options) {
    const list = document.getElementById(listId);
    if (!list) return;
    list.innerHTML = '';
    options.forEach(opt => {
      const lbl = document.createElement('label');
      lbl.className = 'dd__check-item';
      const cb = document.createElement('input');
      cb.type = 'checkbox'; cb.value = opt;
      lbl.append(cb, document.createTextNode(' ' + opt));
      list.appendChild(lbl);
    });
  }

  /* ── Render ───────────────────────────────────── */

  render() {
    const now = new Date();
    let startDate = new Date();

    switch (this.state.period) {
      case 'week': startDate.setDate(now.getDate() - 7); break;
      case 'month': startDate.setMonth(now.getMonth() - 1); break;
      case 'quarter': startDate.setMonth(now.getMonth() - 3); break;
      case 'year': startDate.setFullYear(now.getFullYear() - 1); break;
      case 'custom':
        if (this.state.customFrom) startDate = new Date(this.state.customFrom);
        break;
    }

    let filtered = this.sessions.filter(s => {
      const d = s.startDate ? new Date(s.startDate) : new Date();
      if (d < startDate) return false;
      if (this.state.status !== 'all' && s.status !== this.state.status) return false;
      if (this.state.unitSearch && !s.unitTitle.toLowerCase().includes(this.state.unitSearch.toLowerCase())) return false;
      if (this.state.selectedEmployeeId && s.employeeId !== this.state.selectedEmployeeId) return false;
      return true;
    });

    if (this.state.sortByPopularity) {
      const counts = {};
      filtered.forEach(s => { counts[s.unitId] = (counts[s.unitId] || 0) + 1; });
      filtered.sort((a, b) => (counts[b.unitId] || 0) - (counts[a.unitId] || 0));
    }

    this._lastFiltered = filtered;

    // Метрики
    const completed = filtered.filter(s => s.status === 'completed');
    const avgTime = completed.length ? Math.round(completed.reduce((sum, s) => sum + (s.activeTimeMinutes || 0), 0) / completed.length) : 0;
    const scored = completed.filter(s => s.score !== null);
    const avgScore = scored.length ? Math.round(scored.reduce((sum, s) => sum + s.score, 0) / scored.length) : 0;
    const avgAttempts = completed.length ? (completed.reduce((sum, s) => sum + (s.attempts || 0), 0) / completed.length).toFixed(1) : 0;

    if (this.dom.mAvgTime) this.dom.mAvgTime.textContent = avgTime ? `${avgTime} мин` : '—';
    if (this.dom.mAssigned) this.dom.mAssigned.textContent = filtered.filter(s => s.status === 'assigned').length;
    if (this.dom.mInProgress) this.dom.mInProgress.textContent = filtered.filter(s => s.status === 'in_progress').length;
    if (this.dom.mCompleted) this.dom.mCompleted.textContent = completed.length;
    if (this.dom.mAvgScore) this.dom.mAvgScore.textContent = avgScore || '—';
    if (this.dom.mAvgAttempts) this.dom.mAvgAttempts.textContent = avgAttempts || '—';

    // Таблица
    if (this.dom.tableBody) {
      if (filtered.length === 0) {
        this.dom.tableBody.innerHTML = '';
        if (this.dom.emptyAnalytics) this.dom.emptyAnalytics.classList.remove('hidden');
      } else {
        if (this.dom.emptyAnalytics) this.dom.emptyAnalytics.classList.add('hidden');
        this.dom.tableBody.innerHTML = filtered.map(s => `
          <tr>
            <td>${escapeHtml(s.employeeName)}</td>
            <td><code>${escapeHtml(s.employeeId)}</code></td>
            <td>${escapeHtml(s.unitTitle)}</td>
            <td>${escapeHtml(s.direction)}</td>
            <td>${s.startDate ? formatDate(s.startDate) : '—'}</td>
            <td>${s.endDate ? formatDate(s.endDate) : '—'}</td>
            <td>${s.activeTimeMinutes ? `${s.activeTimeMinutes} мин` : '—'}</td>
            <td><span class="an-status an-status--${s.status}">${this._statusLabel(s.status)}</span></td>
            <td>${s.score !== null ? s.score : '—'}</td>
            <td>${s.attempts || 0}</td>
          </tr>`).join('');
      }
    }
  }

  _statusLabel(status) {
    return { assigned: 'Назначено', in_progress: 'В процессе', completed: 'Завершено' }[status] || status;
  }

  /* ── Employee suggestions ─────────────────────── */

  _showEmployeeSuggestions(query) {
    if (!query || query.length < 2) {
      if (this.dom.employeeSuggestions) this.dom.employeeSuggestions.classList.add('hidden');
      return;
    }

    const employees = [...new Set(this.sessions.map(s => JSON.stringify({ id: s.employeeId, name: s.employeeName })))].map(JSON.parse);
    const filtered = employees.filter(e =>
      e.name.toLowerCase().includes(query.toLowerCase()) ||
      e.id.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);

    if (filtered.length === 0) {
      if (this.dom.employeeSuggestions) this.dom.employeeSuggestions.classList.add('hidden');
      return;
    }

    if (this.dom.employeeSuggestions) {
      this.dom.employeeSuggestions.innerHTML = filtered.map(e => `
        <button type="button" class="an-suggestion" data-employee-id="${e.id}" data-employee-name="${escapeHtml(e.name)}">
          ${escapeHtml(e.name)} <span class="an-suggestion__id">${e.id}</span>
        </button>`).join('');
      this.dom.employeeSuggestions.classList.remove('hidden');

      this.dom.employeeSuggestions.querySelectorAll('.an-suggestion').forEach(btn => {
        btn.addEventListener('click', () => {
          this.state.selectedEmployeeId = btn.dataset.employeeId;
          if (this.dom.employeeSearch) this.dom.employeeSearch.value = btn.dataset.employeeName;
          if (this.dom.employeeClear) this.dom.employeeClear.classList.remove('hidden');
          if (this.dom.employeeSuggestions) this.dom.employeeSuggestions.classList.add('hidden');
          this.render();
        });
      });
    }
  }

  /* ── Reset / Export ───────────────────────────── */

  _resetFilters() {
    this.state = {
      period: 'month', customFrom: '', customTo: '', status: 'all',
      factories: [], directions: [], unitSearch: '',
      sortByPopularity: false, selectedEmployeeId: null, employeeSearchText: '',
    };

    if (this.dom.periodTabs) {
      this.dom.periodTabs.querySelectorAll('.an-period-tab').forEach(t => t.classList.remove('is-active'));
      this.dom.periodTabs.querySelector('[data-period="month"]')?.classList.add('is-active');
    }
    if (this.dom.dateRange) this.dom.dateRange.classList.add('hidden');
    if (this.dom.unitSearch) this.dom.unitSearch.value = '';
    if (this.dom.sortPopular) this.dom.sortPopular.checked = false;
    document.querySelector('#an-dd-status-panel input[value="all"]')?.click();

    this.render();
  }

  _export() {
    const sessions = this._lastFiltered;
    if (!sessions.length) return;

    const headers = [
      'ФИО', 'User', 'Тренажёр', 'Направление',
      'Дата начала', 'Дата завершения', 'Активное время (мин)',
      'Статус', 'Балл', 'Попытки',
    ];
    const statusMap = { assigned: 'Назначено', in_progress: 'В процессе', completed: 'Завершено' };
    const rows = sessions.map(s => [
      s.employeeName,
      s.employeeId,
      s.unitTitle,
      s.direction || '',
      s.startDate ? formatDate(s.startDate) : '',
      s.endDate ? formatDate(s.endDate) : '',
      s.activeTimeMinutes || 0,
      statusMap[s.status] || s.status,
      s.score !== null && s.score !== undefined ? s.score : '',
      s.attempts || 0,
    ]);

    if (typeof window.XLSX !== 'undefined') {
      const wb = window.XLSX.utils.book_new();
      const ws = window.XLSX.utils.aoa_to_sheet([headers, ...rows]);
      ws['!cols'] = [
        { wch: 30 }, { wch: 12 }, { wch: 35 }, { wch: 10 },
        { wch: 13 }, { wch: 16 }, { wch: 18 }, { wch: 12 },
        { wch: 8 }, { wch: 10 },
      ];
      window.XLSX.utils.book_append_sheet(wb, ws, 'Аналитика');
      window.XLSX.writeFile(wb, 'analytics.xlsx');
    } else {
      // CSV fallback с BOM для корректного открытия в Excel
      const escape = v => `"${String(v).replace(/"/g, '""')}"`;
      const csv = [headers, ...rows].map(r => r.map(escape).join(';')).join('\r\n');
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'analytics.csv';
      a.click();
      URL.revokeObjectURL(url);
    }
  }
}
