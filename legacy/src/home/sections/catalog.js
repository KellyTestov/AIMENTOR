/**
 * AI-Ментор · Catalog Section
 *
 * Каталог обучения: фильтры, карточки, сортировка, удаление.
 */

import { storage } from '../../core/storage.js';
import { STORAGE_KEYS, DIRECTION_MAP, ALL_DIRECTIONS, UNIT_CATEGORIES } from '../../core/constants.js';
import { escapeHtml } from '../../core/utils.js';
import { PROMPT_COVERS } from '../../shared/mock/units.js';

const AUTHOR_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="13" height="13" aria-hidden="true"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>`;

const FILTER_KEYS = ['search', 'type', 'category', 'factory', 'direction', 'sort'];

const DEFAULT_FILTER_STATE = {
  search: '',
  type: 'all',
  category: 'all',
  factory: 'all',
  direction: 'all',
  sort: 'updated_desc',
};

export class CatalogSection {
  /**
   * @param {HTMLElement} container — #catalog-section
   * @param {Object} opts
   * @param {Array} opts.units — массив юнитов (мутабельная ссылка)
   * @param {Object} opts.currentUser
   * @param {Function} opts.onDelete — колбэк при удалении (unitId)
   */
  constructor(container, { units, currentUser, onDelete }) {
    this.el = container;
    this.units = units;
    this.currentUser = currentUser;
    this.onDelete = onDelete;
    this.pendingDeleteUnitId = null;
    this._activeDD = null;

    this.state = this._loadState();

    this.dom = {
      grid: document.getElementById('catalog-grid'),
      searchInput: document.getElementById('search-input'),
      emptyState: document.getElementById('empty-state'),
      resetFilters: document.getElementById('reset-filters'),
      typeFilter: document.getElementById('type-filter'),
      categoryFilter: document.getElementById('category-filter'),
      // Модалка удаления
      deleteModalBackdrop: document.getElementById('delete-modal-backdrop'),
      deleteUnitTitle: document.getElementById('delete-unit-title'),
      deleteCancelBtn: document.getElementById('delete-cancel-btn'),
      deleteConfirmBtn: document.getElementById('delete-confirm-btn'),
    };

    this._hydrateFilterOptions();
    this._bindEvents();
    this._applyStateToInputs();
    this._syncResetBtn();
  }

  /* ── State persistence ────────────────────────── */

  _loadState() {
    try {
      const saved = storage.get(STORAGE_KEYS.CATALOG_STATE);
      if (saved) return { ...DEFAULT_FILTER_STATE, ...JSON.parse(saved) };
    } catch (e) {
      console.warn('CatalogSection: failed to load state', e);
    }
    return { ...DEFAULT_FILTER_STATE };
  }

  _saveState() {
    const out = {};
    FILTER_KEYS.forEach(k => { out[k] = this.state[k]; });
    storage.set(STORAGE_KEYS.CATALOG_STATE, JSON.stringify(out));
  }

  /* ── Filter options ───────────────────────────── */

  _hydrateFilterOptions() {
    const types = [...new Set(this.units.map(u => u.type).filter(Boolean))];
    const factories = [...new Set(this.units.map(u => u.factory).filter(Boolean))];

    this._populateSelect('type-filter', types, 'Все типы');
    this._populateDdList('dd-type-list', types);
    this._populateSelect('category-filter', UNIT_CATEGORIES, 'Все категории');
    this._populateDdList('dd-category-list', UNIT_CATEGORIES);
    this._populateDdList('dd-factory-list', factories);
    this._populateDdList('dd-direction-list', ALL_DIRECTIONS);
  }

  _populateSelect(selectId, options, allLabel) {
    const select = document.getElementById(selectId);
    if (!select) return;
    select.innerHTML = `<option value="all">${allLabel}</option>`;
    options.forEach(opt => {
      const o = document.createElement('option');
      o.value = opt; o.textContent = opt;
      select.appendChild(o);
    });
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

  /* ── Events ───────────────────────────────────── */

  _bindEvents() {
    // Карточки (делегирование — один раз, до первого рендера)
    this._bindCardEvents();

    // Поиск
    if (this.dom.searchInput) {
      this.dom.searchInput.addEventListener('input', (e) => {
        this.state.search = e.target.value;
        this._saveState();
        this._syncResetBtn();
        this.render();
      });
    }

    // Dropdown toggle
    this._bindDropdowns();

    // Фильтры: кнопки "Применить"
    const defaultLabels = { type: 'Тип', category: 'Категория', factory: 'Фабрика', direction: 'Направление' };
    ['type', 'category', 'factory', 'direction'].forEach(filter => {
      const applyBtn = document.getElementById(`dd-${filter}-apply`);
      if (applyBtn) {
        applyBtn.addEventListener('click', () => {
          this._readFilterFromDd(filter);
          this._updateDdLabel(filter, defaultLabels[filter]);
          this._saveState();
          this._syncResetBtn();
          this.render();
          this._closeDD(`dd-${filter}`);

          if (filter === 'factory') {
            const checked = [...document.getElementById('dd-factory-list')
              .querySelectorAll('input:checked')].map(c => c.value);
            this._rebuildDirectionList(checked);
          }
        });
      }
    });

    // Сортировка
    document.querySelectorAll('#dd-sort-panel input[name="dd-sort"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        this.state.sort = e.target.value;
        this._saveState();
        this._syncResetBtn();
        this.render();
        document.getElementById('dd-sort-label').textContent = e.target.parentElement.textContent.trim();
        this._closeDD('dd-sort');
      });
    });

    // Сброс
    if (this.dom.resetFilters) {
      this.dom.resetFilters.addEventListener('click', () => this._resetFilters());
    }

    // Модалка удаления
    if (this.dom.deleteCancelBtn) {
      this.dom.deleteCancelBtn.addEventListener('click', () => this._closeDeleteModal());
    }
    if (this.dom.deleteConfirmBtn) {
      this.dom.deleteConfirmBtn.addEventListener('click', () => this._confirmDelete());
    }
  }

  /* ── Dropdown toggle ──────────────────────────── */

  _bindDropdowns() {
    const ddIds = ['dd-type', 'dd-category', 'dd-factory', 'dd-direction', 'dd-sort'];
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

  /* ── Filter helpers ───────────────────────────── */

  _readFilterFromDd(filter) {
    const list = document.getElementById(`dd-${filter}-list`);
    if (!list) return;
    const checked = [...list.querySelectorAll('input:checked')].map(cb => cb.value);
    this.state[filter] = checked.length === 0 ? 'all' : checked.length === 1 ? checked[0] : checked;
  }

  _updateDdLabel(filter, defaultLabel) {
    const labelEl = document.getElementById(`dd-${filter}-label`);
    const list = document.getElementById(`dd-${filter}-list`);
    if (!labelEl || !list) return;
    const checked = [...list.querySelectorAll('input:checked')];
    if (checked.length === 0) {
      labelEl.textContent = defaultLabel;
    } else if (checked.length === 1) {
      labelEl.textContent = checked[0].closest('label').textContent.trim();
    } else {
      labelEl.textContent = `${defaultLabel} (${checked.length})`;
    }
  }

  _rebuildDirectionList(selectedFactories) {
    const dirs = (!selectedFactories || selectedFactories.length === 0)
      ? ALL_DIRECTIONS
      : [...new Set(selectedFactories.flatMap(f => DIRECTION_MAP[f] || []))];
    this._populateDdList('dd-direction-list', dirs);
    document.getElementById('dd-direction-label').textContent = 'Направление';
  }

  _applyStateToInputs() {
    if (this.dom.searchInput) this.dom.searchInput.value = this.state.search;
    const sortRadio = document.querySelector(`#dd-sort-panel input[value="${this.state.sort}"]`);
    if (sortRadio) sortRadio.checked = true;
  }

  _isFiltersDefault() {
    return FILTER_KEYS.every(k => {
      const a = this.state[k];
      const b = DEFAULT_FILTER_STATE[k];
      return Array.isArray(a) ? a.length === 0 : a === b;
    });
  }

  _syncResetBtn() {
    if (this.dom.resetFilters) {
      this.dom.resetFilters.classList.toggle('hidden', this._isFiltersDefault());
    }
  }

  _resetFilters() {
    this.state = { ...DEFAULT_FILTER_STATE };
    this._saveState();
    this._applyStateToInputs();

    document.querySelectorAll('#dd-type-list input, #dd-category-list input, #dd-factory-list input, #dd-direction-list input').forEach(cb => cb.checked = false);
    document.querySelector('#dd-sort-panel input[value="updated_desc"]').checked = true;

    ['dd-type-label', 'dd-category-label', 'dd-factory-label', 'dd-direction-label', 'dd-sort-label'].forEach((id, i) => {
      const el = document.getElementById(id);
      if (el) el.textContent = ['Тип', 'Категория', 'Фабрика', 'Направление', 'Сортировка'][i];
    });

    this._rebuildDirectionList([]);
    this._syncResetBtn();
    this.render();
  }

  /* ── Render ───────────────────────────────────── */

  render() {
    if (!this.dom.grid) return;

    let filtered = this.units.filter(u => {
      if (this.state.search && !u.title.toLowerCase().includes(this.state.search.toLowerCase())) return false;
      if (this.state.type !== 'all') {
        const types = Array.isArray(this.state.type) ? this.state.type : [this.state.type];
        if (!types.includes(u.type)) return false;
      }
      if (this.state.category !== 'all') {
        const cats = Array.isArray(this.state.category) ? this.state.category : [this.state.category];
        if (!cats.includes(u.category)) return false;
      }
      if (this.state.factory !== 'all') {
        const facts = Array.isArray(this.state.factory) ? this.state.factory : [this.state.factory];
        if (!facts.includes(u.factory)) return false;
      }
      if (this.state.direction !== 'all') {
        const dirs = Array.isArray(this.state.direction) ? this.state.direction : [this.state.direction];
        if (!dirs.includes(u.direction)) return false;
      }
      return true;
    });

    filtered.sort((a, b) => {
      switch (this.state.sort) {
        case 'created_desc': return new Date(b.createdAt) - new Date(a.createdAt);
        case 'name_asc': return a.title.localeCompare(b.title, 'ru');
        default: return new Date(b.updatedAt) - new Date(a.updatedAt);
      }
    });

    if (filtered.length === 0) {
      this.dom.grid.innerHTML = '';
      if (this.dom.emptyState) this.dom.emptyState.classList.remove('hidden');
      return;
    }

    if (this.dom.emptyState) this.dom.emptyState.classList.add('hidden');
    this.dom.grid.innerHTML = filtered.map(u => this._renderCard(u)).join('');
  }

  _renderCard(unit) {
    const canEdit = this._canEdit(unit);
    const isMyCourse = unit.authorId === this.currentUser.id;
    const coverUrl = this._resolveCover(unit);
    const coverPosition = this._getCoverPosition(coverUrl);
    const status = this._normalizeStatus(unit.publicationStatus);
    const statusText = status === 'published' ? 'Опубликован' : 'Приватное';
    const statusClass = status === 'published' ? 'is-published' : 'is-private';
    const toggleLabel = status === 'published' ? 'Скрыть' : 'Опубликовать';
    const duration = unit.durationLabel?.trim() || (unit.type === 'Проверяющая' ? '~45 мин' : '~1 час');

    return `
      <article class="card" data-unit-id="${escapeHtml(unit.id)}">
        <details class="card__menu">
          <summary class="card__menu-toggle" aria-label="Действия карточки">...</summary>
          <div class="card__menu-list">
            <button type="button" class="card__menu-item" data-action="open" data-unitid="${escapeHtml(unit.id)}">Открыть обучение</button>
            ${canEdit ? `<button type="button" class="card__menu-item" data-action="edit" data-unitid="${escapeHtml(unit.id)}">Редактировать единицу</button>` : ''}
            ${isMyCourse ? `<button type="button" class="card__menu-item" data-action="toggle-publicity" data-unitid="${escapeHtml(unit.id)}">${toggleLabel}</button>` : ''}
            ${isMyCourse ? `<button type="button" class="card__menu-item card__menu-item--danger" data-action="delete" data-unitid="${escapeHtml(unit.id)}">Удалить</button>` : ''}
          </div>
        </details>
        <figure class="card__media-wrap">
          <img class="card__media" src="${escapeHtml(coverUrl)}" alt="Обложка: ${escapeHtml(unit.title)}" loading="lazy" style="object-position: ${escapeHtml(coverPosition)};" />
        </figure>
        <div class="card__body">
          <h3 class="card__title">${escapeHtml(unit.title)}</h3>
          <div class="card__meta">
            <span class="meta-badge">${escapeHtml(duration)}</span>
            <span class="card__status ${statusClass}">${statusText}</span>
            <span class="author-icon" title="${escapeHtml(unit.authorName || '')}" aria-label="Автор: ${escapeHtml(unit.authorName || '')}">
              ${AUTHOR_ICON_SVG}
              <span class="author-tooltip">${escapeHtml(unit.authorName || '—')}</span>
            </span>
          </div>
        </div>
      </article>`;
  }

  _bindCardEvents() {
    if (!this.dom.grid) return;
    this.dom.grid.addEventListener('click', (e) => {
      // При клике на summary — закрыть остальные открытые меню
      if (e.target.closest('summary.card__menu-toggle')) {
        const thisMenu = e.target.closest('details.card__menu');
        document.querySelectorAll('details.card__menu[open]').forEach(m => {
          if (m !== thisMenu) m.open = false;
        });
        return;
      }

      const btn = e.target.closest('button[data-action]');
      if (!btn) return;

      const action = btn.dataset.action;
      const unitId = btn.dataset.unitid;
      const unit = this.units.find(u => u.id === unitId);
      if (!unit) return;

      if (action === 'open') {
        window.open(unit.launchUrl, '_blank', 'noopener,noreferrer');
      } else if (action === 'edit') {
        this._ensureBuilderData(unit);
        sessionStorage.setItem('bld-pending-id', unit.id);
        window.location.href = unit.editUrl;
      } else if (action === 'toggle-publicity') {
        this._togglePublication(unitId);
      } else if (action === 'delete') {
        this._openDeleteModal(unitId);
      }

      const menu = btn.closest('details.card__menu');
      if (menu) menu.open = false;
    });
  }

  /* ── Card helpers ─────────────────────────────── */

  _canEdit(unit) {
    return this.currentUser.rights.isAdmin || unit.authorId === this.currentUser.id;
  }

  _normalizeStatus(raw) {
    return raw === 'published' ? 'published' : 'private';
  }

  _resolveCover(unit) {
    if (typeof unit.coverUrl === 'string' && unit.coverUrl.trim()) return unit.coverUrl.trim();
    const idx = this.units.findIndex(u => u.id === unit.id);
    return PROMPT_COVERS[(idx < 0 ? 0 : idx) % PROMPT_COVERS.length];
  }

  _getCoverPosition(coverUrl) {
    const n = decodeURIComponent(String(coverUrl || '')).toLowerCase();
    if (n.includes('premium_2.jpg')) return 'center 34%';
    if (n.includes('premium.jpg')) return 'center 45%';
    if (n.includes('mmb-89.png')) return 'center 50%';
    if (n.includes('rb-34.png')) return 'center 52%';
    return 'center center';
  }

  // Убеждается что юнит есть в localStorage перед открытием builder.
  // Если нет — создаёт минимальную запись с _isNew:true, чтобы builder
  // вызвал buildScaffold() и создал дерево.
  _ensureBuilderData(unit) {
    try {
      const stored = storage.getObject(STORAGE_KEYS.BUILDER_DATA, {});
      if (!stored[unit.id]) {
        stored[unit.id] = {
          id: unit.id,
          title: unit.title,
          type: unit.type === 'Обучающая' ? 'trainer' : 'exam',
          category: unit.category || '',
          factory: unit.factory || '',
          durationLabel: unit.durationLabel || '',
          publicationStatus: unit.publicationStatus || 'private',
          coverDataUrl: unit.coverUrl || null,
          createdAt: unit.createdAt || new Date().toISOString(),
          _isNew: true,
        };
        storage.setObject(STORAGE_KEYS.BUILDER_DATA, stored);
      }
    } catch (e) {
      console.warn('CatalogSection: _ensureBuilderData failed', e);
    }
  }

  _togglePublication(unitId) {
    const unit = this.units.find(u => u.id === unitId);
    if (!unit) return;
    const next = this._normalizeStatus(unit.publicationStatus) === 'published' ? 'private' : 'published';
    unit.publicationStatus = next;
    unit.updatedAt = new Date().toISOString();
    this.render();
  }

  /* ── Delete modal ─────────────────────────────── */

  _openDeleteModal(unitId) {
    const unit = this.units.find(u => u.id === unitId);
    if (!unit) return;
    this.pendingDeleteUnitId = unitId;
    if (this.dom.deleteUnitTitle) this.dom.deleteUnitTitle.textContent = unit.title;
    if (this.dom.deleteModalBackdrop) this.dom.deleteModalBackdrop.classList.remove('hidden');
  }

  _closeDeleteModal() {
    this.pendingDeleteUnitId = null;
    if (this.dom.deleteModalBackdrop) this.dom.deleteModalBackdrop.classList.add('hidden');
  }

  _confirmDelete() {
    if (!this.pendingDeleteUnitId) return;
    const id = this.pendingDeleteUnitId;
    const idx = this.units.findIndex(u => u.id === id);
    if (idx !== -1) this.units.splice(idx, 1);

    try {
      const stored = storage.getObject(STORAGE_KEYS.BUILDER_DATA, {});
      delete stored[id];
      storage.setObject(STORAGE_KEYS.BUILDER_DATA, stored);
    } catch (e) {
      console.warn('CatalogSection: delete from storage failed', e);
    }

    this._closeDeleteModal();
    this.render();
    if (this.onDelete) this.onDelete(id);
  }
}
