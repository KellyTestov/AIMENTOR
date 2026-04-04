/**
 * AI-Ментор · Creation Wizard
 *
 * Мастер создания обучения: выбор типа → метод → форма → кроппер обложки → сабмит.
 */

import { storage } from '../../core/storage.js';
import { STORAGE_KEYS, FACTORIES, DIRECTION_MAP, UNIT_CATEGORIES, UNIT_TOPICS, UNIT_DURATIONS } from '../../core/constants.js';
import { escapeHtml, generateId } from '../../core/utils.js';
import { PROMPT_COVERS } from '../../shared/mock/units.js';

export class CreationWizard {
  /**
   * @param {Object} opts
   * @param {Object} opts.currentUser
   * @param {Array} opts.units — ссылка на массив юнитов (для шаблонов)
   * @param {Function} opts.onCreated — колбэк (newUnit)
   */
  constructor({ currentUser, units, onCreated }) {
    this.currentUser = currentUser;
    this.units = units;
    this.onCreated = onCreated;

    this.wizardState = { step: 1, type: null, method: null, templateId: null };
    this.wizardCoverFile = null;
    this.pendingCoverFile = null;
    this.cropState = {
      scale: 1, minScale: 1, maxScale: 3,
      offsetX: 0, offsetY: 0,
      isDragging: false,
      startMouseX: 0, startMouseY: 0,
      startOffsetX: 0, startOffsetY: 0,
      viewportW: 0, viewportH: 0,
      naturalW: 0, naturalH: 0,
    };

    this._cacheWizardDom();
    this._cacheCropDom();
    this._bindWizardEvents();
    this._bindCropEvents();
    this._bindWizardDropdowns();
  }

  /* ── DOM cache ────────────────────────────────── */

  _cacheWizardDom() {
    this.wDom = {
      backdrop: document.getElementById('wizard-backdrop'),
      dialog: document.getElementById('wizard-dialog'),
      step1: document.getElementById('wizard-step-1'),
      step2: document.getElementById('wizard-step-2'),
      step3: document.getElementById('wizard-step-3'),
      step2hint: document.getElementById('wizard-step2-hint'),
      form: document.getElementById('wizard-form'),
      fTitle: document.getElementById('wf-title'),
      fDescription: document.getElementById('wf-description'),
      fTopic: document.getElementById('wf-topic'),
      fCategory: document.getElementById('wf-category'),
      fDuration: document.getElementById('wf-duration'),
      fFactory: document.getElementById('wf-factory'),
      fCover: document.getElementById('wf-cover-input'),
      coverLabel: document.getElementById('wf-cover-label'),
      coverPreviewWrap: document.getElementById('wf-cover-preview-wrap'),
      coverPreview: document.getElementById('wf-cover-preview'),
      coverClearBtn: document.getElementById('wf-cover-clear'),
      coverArea: document.getElementById('wf-cover-area'),
      submitBtn: document.getElementById('wizard-submit-btn'),
      tmplBackdrop: document.getElementById('tmpl-backdrop'),
      tmplSubtitle: document.getElementById('tmpl-subtitle'),
      tmplGrid: document.getElementById('tmpl-grid'),
      tmplEmpty: document.getElementById('tmpl-empty'),
      tmplCloseBtn: document.getElementById('tmpl-close-btn'),
      tmplBackBtn: document.getElementById('tmpl-back-btn'),
      previewImg: document.getElementById('wf-preview-img'),
      previewPh: document.getElementById('wf-preview-ph'),
      previewTitle: document.getElementById('wf-preview-title'),
      previewDuration: document.getElementById('wf-preview-duration'),
      previewAuthor: document.getElementById('wf-preview-author'),
    };
  }

  _cacheCropDom() {
    this.cDom = {
      backdrop: document.getElementById('crop-backdrop'),
      viewport: document.getElementById('crop-viewport'),
      img: document.getElementById('crop-img'),
      zoomRange: document.getElementById('crop-zoom-range'),
      zoomOutBtn: document.getElementById('crop-zoom-out'),
      zoomInBtn: document.getElementById('crop-zoom-in'),
      cancelBtn: document.getElementById('crop-cancel-btn'),
      applyBtn: document.getElementById('crop-apply-btn'),
    };
  }

  /* ── Wizard events ────────────────────────────── */

  _bindWizardEvents() {
    // Закрытие
    document.querySelectorAll('[data-wizard-action="close"]').forEach(btn => {
      btn.addEventListener('click', () => this.close());
    });

    // Назад
    document.querySelectorAll('[data-wizard-action="go-back"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this._showStep(parseInt(e.target.dataset.value));
      });
    });

    // Выбор типа
    document.querySelectorAll('[data-wizard-action="pick-type"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.wizardState.type = e.currentTarget.dataset.value;
        this._showStep(2);
      });
    });

    // Выбор метода
    document.querySelectorAll('[data-wizard-action="pick-method"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const method = e.currentTarget.dataset.value;
        this.wizardState.method = method;
        method === 'new' ? this._showStep(3) : this._showTemplateCatalog();
      });
    });

    // Форма
    if (this.wDom.form) {
      this.wDom.form.addEventListener('input', () => this._updatePreview());
      this.wDom.form.addEventListener('submit', (e) => { e.preventDefault(); this._submit(); });
    }

    // Обложка
    if (this.wDom.fCover) {
      this.wDom.fCover.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) this._processCoverFile(file);
      });
    }
    if (this.wDom.coverClearBtn) {
      this.wDom.coverClearBtn.addEventListener('click', () => this._clearCover());
    }

    // Drag & drop
    if (this.wDom.coverArea) {
      this.wDom.coverArea.addEventListener('dragover', (e) => {
        e.preventDefault(); this.wDom.coverArea.classList.add('is-dragover');
      });
      this.wDom.coverArea.addEventListener('dragleave', () => {
        this.wDom.coverArea.classList.remove('is-dragover');
      });
      this.wDom.coverArea.addEventListener('drop', (e) => {
        e.preventDefault(); this.wDom.coverArea.classList.remove('is-dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) this._processCoverFile(file);
      });
    }

    // Шаблоны
    if (this.wDom.tmplCloseBtn) {
      this.wDom.tmplCloseBtn.addEventListener('click', () => this._closeTemplateCatalog());
    }
    if (this.wDom.tmplBackBtn) {
      this.wDom.tmplBackBtn.addEventListener('click', () => {
        this._closeTemplateCatalog();
        this._showStep(2);
      });
    }
  }

  /* ── Wizard dropdown'ы (wf-dd) ────────────────── */

  _bindWizardDropdowns() {
    this._wfDDs = {};

    const closeAll = () => {
      Object.values(this._wfDDs).forEach(dd => dd.el.classList.remove('wf-dd--open'));
    };

    document.addEventListener('click', (e) => {
      if (!Object.values(this._wfDDs).some(dd => dd.el.contains(e.target))) closeAll();
    });

    const initDD = (key) => {
      const el = document.getElementById('wfd-' + key);
      const btn = document.getElementById('wfd-' + key + '-btn');
      const valEl = document.getElementById('wfd-' + key + '-val');
      const sel = document.getElementById('wf-' + key);
      if (!el || !btn) return;
      this._wfDDs[key] = { el, valEl, sel, value: '' };
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = el.classList.contains('wf-dd--open');
        closeAll();
        if (!isOpen) el.classList.add('wf-dd--open');
      });
    };

    const pick = (key, value, label) => {
      const dd = this._wfDDs[key];
      if (!dd) return;
      dd.value = value;
      dd.valEl.textContent = label;
      dd.valEl.classList.remove('wf-dd__placeholder');
      if (dd.sel) {
        if (!Array.from(dd.sel.options).some(o => o.value === value)) {
          const opt = document.createElement('option');
          opt.value = value; opt.text = label;
          dd.sel.appendChild(opt);
        }
        dd.sel.value = value;
        dd.sel.dispatchEvent(new Event('change'));
      }
      dd.el.classList.remove('wf-dd--open');

      if (key === 'factory') {
        const dirs = DIRECTION_MAP[value] || [];
        buildItems('direction', dirs.map(d => ({ value: d, label: d })),
          dirs.length === 0 ? 'Нет доступных направлений' : undefined);
        const dirDD = this._wfDDs['direction'];
        if (dirDD) {
          dirDD.value = '';
          dirDD.valEl.textContent = 'Выберите направление';
          dirDD.valEl.classList.add('wf-dd__placeholder');
          if (dirDD.sel) dirDD.sel.value = '';
        }
      }
      this._updatePreview();
    };

    const buildItems = (key, items, emptyMsg) => {
      const list = document.getElementById('wfd-' + key + '-list');
      if (!list) return;
      list.innerHTML = '';
      if (!items || items.length === 0) {
        const msg = document.createElement('div');
        msg.className = 'wf-dd__empty';
        msg.textContent = emptyMsg || 'Сначала выберите фабрику';
        list.appendChild(msg);
        return;
      }
      items.forEach(({ value, label }) => {
        const btn = document.createElement('button');
        btn.type = 'button'; btn.className = 'wf-dd__item';
        btn.textContent = label;
        btn.addEventListener('click', () => pick(key, value, label));
        list.appendChild(btn);
      });
    };

    ['topic', 'category', 'duration', 'factory', 'direction'].forEach(initDD);
    buildItems('topic', UNIT_TOPICS.map(t => ({ value: t, label: t })));
    buildItems('duration', UNIT_DURATIONS.map(t => ({ value: t, label: t })));
    buildItems('factory', FACTORIES.map(f => ({ value: f, label: f })));
    buildItems('category', UNIT_CATEGORIES.map(c => ({ value: c, label: c })));
    buildItems('direction', []);
  }

  /* ── Open / Close ─────────────────────────────── */

  open() {
    this.wizardState = { step: 1, type: null, method: null, templateId: null };
    this.wizardCoverFile = null;
    this._showStep(1);
    if (this.wDom.backdrop) this.wDom.backdrop.classList.remove('hidden');
  }

  close() {
    if (this.wDom.backdrop) this.wDom.backdrop.classList.add('hidden');
    this.wizardState = { step: 1, type: null, method: null, templateId: null };
  }

  _showStep(step) {
    [this.wDom.step1, this.wDom.step2, this.wDom.step3].forEach(el => {
      if (el) el.classList.add('hidden');
    });
    const stepEl = this.wDom[`step${step}`];
    if (stepEl) stepEl.classList.remove('hidden');

    [1, 2, 3].forEach(i => {
      const seg = document.getElementById(`wizard-prog-${i}`);
      if (seg) seg.classList.toggle('is-fill', i <= step);
    });

    // Шаг 3 требует расширенного диалога
    if (this.wDom.dialog) {
      this.wDom.dialog.classList.toggle('wizard--step3', step === 3);
    }

    this.wizardState.step = step;
  }

  /* ── Templates ────────────────────────────────── */

  _showTemplateCatalog() {
    const filterType = this.wizardState.type === 'trainer' ? 'Обучающая' : 'Проверяющая';
    const templates = this.units.filter(u => u.type === filterType);

    if (this.wDom.tmplGrid) {
      if (templates.length === 0) {
        this.wDom.tmplGrid.innerHTML = '';
        if (this.wDom.tmplEmpty) this.wDom.tmplEmpty.classList.remove('hidden');
      } else {
        if (this.wDom.tmplEmpty) this.wDom.tmplEmpty.classList.add('hidden');
        this.wDom.tmplGrid.innerHTML = templates.map((u, idx) => {
          const cover = u.coverUrl?.trim() || PROMPT_COVERS[idx % PROMPT_COVERS.length];
          return `
          <article class="card" data-template-id="${escapeHtml(u.id)}">
            <figure class="card__media-wrap">
              <img class="card__media" src="${escapeHtml(cover)}" alt="Обложка: ${escapeHtml(u.title)}" loading="lazy" />
            </figure>
            <div class="card__body">
              <h3 class="card__title">${escapeHtml(u.title)}</h3>
              <div class="card__meta"><span class="meta-badge">${escapeHtml(u.type)}</span></div>
            </div>
          </article>`;
        }).join('');

        this.wDom.tmplGrid.querySelectorAll('.card').forEach(card => {
          card.addEventListener('click', () => {
            this.wizardState.templateId = card.dataset.templateId;
            this._closeTemplateCatalog();
            this._showStep(3);
            this._loadTemplateData(this.wizardState.templateId);
          });
        });
      }
    }
    if (this.wDom.tmplBackdrop) this.wDom.tmplBackdrop.classList.remove('hidden');
  }

  _closeTemplateCatalog() {
    if (this.wDom.tmplBackdrop) this.wDom.tmplBackdrop.classList.add('hidden');
  }

  _loadTemplateData(templateId) {
    const t = this.units.find(u => u.id === templateId);
    if (!t) return;
    if (this.wDom.fTitle) this.wDom.fTitle.value = `Копия: ${t.title}`;
    this._updatePreview();
  }

  /* ── Cover ────────────────────────────────────── */

  _processCoverFile(file) {
    this.pendingCoverFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (this.cDom.img) {
        this.cDom.img.src = e.target.result;
        this.cDom.img.onload = () => {
          this._initCrop();
          if (this.cDom.backdrop) this.cDom.backdrop.classList.remove('hidden');
        };
      }
    };
    reader.readAsDataURL(file);
  }

  _clearCover() {
    this.wizardCoverFile = null;
    if (this.wDom.coverPreviewWrap) this.wDom.coverPreviewWrap.classList.add('hidden');
    if (this.wDom.coverLabel) this.wDom.coverLabel.classList.remove('hidden');
    if (this.wDom.previewImg) this.wDom.previewImg.classList.add('hidden');
    if (this.wDom.previewPh) this.wDom.previewPh.classList.remove('hidden');
    if (this.wDom.fCover) this.wDom.fCover.value = '';
    this._updatePreview();
  }

  /* ── Crop ─────────────────────────────────────── */

  _initCrop() {
    this.cropState = {
      scale: 1, minScale: 1, maxScale: 3,
      offsetX: 0, offsetY: 0,
      isDragging: false,
      startMouseX: 0, startMouseY: 0,
      startOffsetX: 0, startOffsetY: 0,
      viewportW: this.cDom.viewport?.offsetWidth || 400,
      viewportH: this.cDom.viewport?.offsetHeight || 225,
      naturalW: this.cDom.img?.naturalWidth || 0,
      naturalH: this.cDom.img?.naturalHeight || 0,
    };
    if (this.cDom.zoomRange) this.cDom.zoomRange.value = 0;
    this._applyCropTransform();
  }

  _applyCropTransform() {
    if (!this.cDom.img) return;
    this.cDom.img.style.transform = `scale(${this.cropState.scale}) translate(${this.cropState.offsetX}px, ${this.cropState.offsetY}px)`;
  }

  _bindCropEvents() {
    if (this.cDom.cancelBtn) {
      this.cDom.cancelBtn.addEventListener('click', () => {
        if (this.cDom.backdrop) this.cDom.backdrop.classList.add('hidden');
        this.pendingCoverFile = null;
      });
    }

    if (this.cDom.applyBtn) {
      this.cDom.applyBtn.addEventListener('click', () => this._applyCrop());
    }

    if (this.cDom.zoomRange) {
      this.cDom.zoomRange.addEventListener('input', (e) => {
        this.cropState.scale = 1 + (e.target.value / 100) * 2;
        this._applyCropTransform();
      });
    }

    if (this.cDom.zoomOutBtn) {
      this.cDom.zoomOutBtn.addEventListener('click', () => {
        if (this.cDom.zoomRange) {
          this.cDom.zoomRange.value = Math.max(0, parseInt(this.cDom.zoomRange.value) - 10);
          this.cDom.zoomRange.dispatchEvent(new Event('input'));
        }
      });
    }

    if (this.cDom.zoomInBtn) {
      this.cDom.zoomInBtn.addEventListener('click', () => {
        if (this.cDom.zoomRange) {
          this.cDom.zoomRange.value = Math.min(100, parseInt(this.cDom.zoomRange.value) + 10);
          this.cDom.zoomRange.dispatchEvent(new Event('input'));
        }
      });
    }

    if (this.cDom.viewport) {
      this.cDom.viewport.addEventListener('mousedown', (e) => {
        this.cropState.isDragging = true;
        this.cropState.startMouseX = e.clientX;
        this.cropState.startMouseY = e.clientY;
        this.cropState.startOffsetX = this.cropState.offsetX;
        this.cropState.startOffsetY = this.cropState.offsetY;
      });

      document.addEventListener('mousemove', (e) => {
        if (!this.cropState.isDragging) return;
        this.cropState.offsetX = this.cropState.startOffsetX + (e.clientX - this.cropState.startMouseX) / this.cropState.scale;
        this.cropState.offsetY = this.cropState.startOffsetY + (e.clientY - this.cropState.startMouseY) / this.cropState.scale;
        this._applyCropTransform();
      });

      document.addEventListener('mouseup', () => { this.cropState.isDragging = false; });
    }
  }

  _applyCrop() {
    if (!this.pendingCoverFile || !this.cDom.img) return;

    const canvas = document.createElement('canvas');
    canvas.width = 800; canvas.height = 450;
    const ctx = canvas.getContext('2d');
    const img = this.cDom.img;
    const s = this.cropState.scale;

    ctx.drawImage(img,
      -this.cropState.offsetX * s - (canvas.width / 2 - img.naturalWidth * s / 2),
      -this.cropState.offsetY * s - (canvas.height / 2 - img.naturalHeight * s / 2),
      img.naturalWidth * s,
      img.naturalHeight * s
    );

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    this.wizardCoverFile = dataUrl;

    if (this.wDom.coverPreview) this.wDom.coverPreview.src = dataUrl;
    if (this.wDom.coverPreviewWrap) this.wDom.coverPreviewWrap.classList.remove('hidden');
    if (this.wDom.coverLabel) this.wDom.coverLabel.classList.add('hidden');
    if (this.wDom.previewImg) { this.wDom.previewImg.src = dataUrl; this.wDom.previewImg.classList.remove('hidden'); }
    if (this.wDom.previewPh) this.wDom.previewPh.classList.add('hidden');

    if (this.cDom.backdrop) this.cDom.backdrop.classList.add('hidden');
    this.pendingCoverFile = null;
    this._updatePreview();
  }

  /* ── Preview / Validation ─────────────────────── */

  _getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2);
  }

  _updatePreview() {
    const title = this.wDom.fTitle?.value || 'Название обучения';
    const duration = this.wDom.fDuration?.value || '—';

    if (this.wDom.previewTitle) this.wDom.previewTitle.textContent = title;
    if (this.wDom.previewDuration) this.wDom.previewDuration.textContent = duration;
    if (this.wDom.previewAuthor) this.wDom.previewAuthor.textContent = this._getInitials(this.currentUser.name);

    const isValid = this._validate();
    if (this.wDom.submitBtn) this.wDom.submitBtn.disabled = !isValid;
  }

  _validate() {
    const title = this.wDom.fTitle?.value?.trim();
    const topic = this.wDom.fTopic?.value;
    const category = this.wDom.fCategory?.value;
    const duration = this.wDom.fDuration?.value;
    const factory = this.wDom.fFactory?.value;
    return !!(title && topic && category && duration && factory && this.wizardCoverFile);
  }

  /* ── Submit ───────────────────────────────────── */

  _submit() {
    if (!this._validate()) return;

    const id = generateId('edu');

    const newUnit = {
      id,
      title:             this.wDom.fTitle?.value?.trim(),
      description:       this.wDom.fDescription?.value?.trim() || '',
      type:              this.wizardState.type === 'trainer' ? 'Обучающая' : 'Проверяющая',
      topic:             this.wDom.fTopic?.value,
      category:          this.wDom.fCategory?.value,
      durationLabel:     this.wDom.fDuration?.value,
      factory:           this.wDom.fFactory?.value,
      direction:         this._wfDDs['direction']?.value || '',
      coverUrl:          this.wizardCoverFile,
      authorId:          this.currentUser.id,
      authorName:        this.currentUser.name,
      createdAt:         new Date().toISOString(),
      updatedAt:         new Date().toISOString(),
      publicationStatus: 'private',
      launchUrl:         `./sandbox/?id=${id}`,
      editUrl:           `./builder/?id=${id}`,
    };

    // Сохраняем в localStorage в формате, который ожидает builder/builder.js
    try {
      const stored = storage.getObject(STORAGE_KEYS.BUILDER_DATA, {});
      stored[id] = {
        ...newUnit,
        type:         this.wizardState.type,  // 'trainer' | 'exam' для buildScaffold()
        _isNew:       true,                   // триггер для buildScaffold() в builder
        durationLabel: this.wDom.fDuration?.value,
        coverDataUrl:  this.wizardCoverFile,  // builder ожидает coverDataUrl, не coverUrl
      };
      storage.setObject(STORAGE_KEYS.BUILDER_DATA, stored);
    } catch (e) {
      console.warn('CreationWizard: save failed', e);
    }

    this.close();
    if (this.onCreated) this.onCreated(newUnit);
    sessionStorage.setItem('bld-pending-id', id);
    window.location.href = newUnit.editUrl;
  }
}
