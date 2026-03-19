const STORAGE_KEY = "ai-mentor-catalog-state-v1";

const ADMIN_USERS_STORAGE_KEY = "ai-mentor-access-users-v1";
const WIZARD_STORAGE_KEY = "ai-mentor-wizard-v2";

const bootstrap = window.AI_MENTOR_BOOTSTRAP || {};

const currentUser = bootstrap.currentUser || {
  id: "u-101",
  name: "Роман Плишкин",
  roleName: "Команда сервиса",
  rights: {
    canAccessHome: true,
    canViewCatalog: true,
    canViewAnalytics: true,
    canManageUsers: true,
    canCreate: true,
    isAdmin: false,
    allowedUnitIds: ["edu-001", "edu-002", "edu-003", "edu-004"],
  },
};

let allUnits = bootstrap.units || [
  {
    id: "edu-001",
    title: "Тренажер по кредитным картам",
    type: "Обучающая",
    category: "Продукты",
    factory: "КЦ",
    authorId: "u-101",
    authorName: "Роман Плишкин",
    createdAt: "2026-02-12T10:00:00Z",
    updatedAt: "2026-03-09T09:40:00Z",
    durationLabel: "~1 ч 05 мин",
    publicationStatus: "published",
    launchUrl: "https://example.org/alpha-course/learn/edu-001",
    editUrl: "https://example.org/ai-mentor/builder/edit/edu-001",
  },
  {
    id: "edu-002",
    title: "Тренажер по лояльности с клиентами",
    type: "Обучающая",
    category: "Коммуникации",
    factory: "КЦ",
    authorId: "u-101",
    authorName: "Роман Плишкин",
    createdAt: "2026-02-20T11:30:00Z",
    updatedAt: "2026-03-06T15:20:00Z",
    durationLabel: "~1 ч 10 мин",
    publicationStatus: "draft",
    launchUrl: "https://example.org/alpha-course/learn/edu-002",
    editUrl: "https://example.org/ai-mentor/builder/edit/edu-002",
  },
  {
    id: "edu-003",
    title: "Экзамен Basic1",
    type: "Проверяющая",
    category: "Экзамены",
    factory: "ДКЦ",
    authorId: "u-204",
    authorName: "Ирина Платонова",
    createdAt: "2026-01-28T08:10:00Z",
    updatedAt: "2026-03-02T10:10:00Z",
    durationLabel: "~50 мин",
    publicationStatus: "published",
    launchUrl: "https://example.org/alpha-course/learn/edu-003",
    editUrl: "https://example.org/ai-mentor/builder/edit/edu-003",
  },
  {
    id: "edu-004",
    title: "Экзамен Optimum",
    type: "Проверяющая",
    category: "Экзамены",
    factory: "Взыскание",
    authorId: "u-322",
    authorName: "Марина Сизова",
    createdAt: "2026-01-14T13:00:00Z",
    updatedAt: "2026-03-10T07:00:00Z",
    durationLabel: "~45 мин",
    publicationStatus: "draft",
    launchUrl: "https://example.org/alpha-course/learn/edu-004",
    editUrl: "https://example.org/ai-mentor/builder/edit/edu-004",
  },
];

const promptCovers = [
  encodeURI("./premium.jpg"),
  encodeURI("./premium_2.jpg"),
  encodeURI("./MMB-89.png"),
  encodeURI("./RB-34.png"),
];

const REQUIRED_SERVICE_USERS = [
  {
    fullName: "Плишкин Роман Валерьевич",
    userId: "U_DD7RZ",
    role: "Команда сервиса",
    isProtected: true,
    isDeveloper: true,
  },
  {
    fullName: "Голощапов Кирилл Юрьевич",
    userId: "U_KG4H1",
    role: "Команда сервиса",
    isProtected: true,
    isDeveloper: true,
  },
  {
    fullName: "Манафов Дмитрий Русланович",
    userId: "U_DM8Q2",
    role: "Команда сервиса",
    isProtected: true,
    isDeveloper: true,
  },
  {
    fullName: "Ватуева Ирина Алексеевна",
    userId: "U_IV3N5",
    role: "Команда сервиса",
    isProtected: true,
    isDeveloper: false,
  },
];

const defaultAdminUsers = bootstrap.accessUsers || [
  ...REQUIRED_SERVICE_USERS.map((user) => ({ ...user })),
  { fullName: "Рожков Александр Игоревич", userId: "U_QD7RZ", role: "Редактор" },
  { fullName: "Савельева Мария Сергеевна", userId: "U_W2K9M", role: "Редактор" },
  { fullName: "Игнатов Павел Андреевич", userId: "U_FH18Q", role: "Редактор" },
  { fullName: "Климова Ирина Николаевна", userId: "U_R7N4X", role: "Редактор" },
  { fullName: "Королев Денис Владимирович", userId: "U_M0T5B", role: "Редактор" },
  { fullName: "Новикова Валерия Олеговна", userId: "U_Z8P3D", role: "Редактор" },
  { fullName: "Баранов Олег Михайлович", userId: "U_K4V1S", role: "Редактор" },
  { fullName: "Филатова Наталья Юрьевна", userId: "U_Q6Y2N", role: "Редактор" },
  { fullName: "Пахомов Евгений Александрович", userId: "U_H9C7L", role: "Редактор" },
  { fullName: "Орлова Софья Артёмовна", userId: "U_J3R8P", role: "Редактор" },
  { fullName: "Елисеев Артем Константинович", userId: "U_B5U0K", role: "Редактор" },
  { fullName: "Громова Ксения Дмитриевна", userId: "U_T1M6V", role: "Редактор" },
  { fullName: "Чернов Роман Евгеньевич", userId: "U_N2A9F", role: "Редактор" },
  { fullName: "Егорова Татьяна Борисовна", userId: "U_P7E4J", role: "Редактор" },
];

const defaultState = {
  section: "catalog",
  search: "",
  adminSearch: "",
  type: "all",
  category: "all",
  factory: "all",
  sort: "updated_desc",
};

const FILTER_KEYS = ["search", "type", "category", "factory", "sort"];

const AUTHOR_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="13" height="13" aria-hidden="true"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>`;

const dom = {
  nav: document.getElementById("main-nav"),
  createBtn: document.getElementById("create-btn"),
  sectionTitle: document.getElementById("section-title"),
  sectionSubtitle: document.getElementById("section-subtitle"),
  catalogSection: document.getElementById("catalog-section"),
  analyticsSection: document.getElementById("analytics-section"),
  adminSection: document.getElementById("admin-section"),
  searchInput: document.getElementById("search-input"),
  adminSearchInput: document.getElementById("admin-search-input"),
  typeFilter: document.getElementById("type-filter"),
  categoryFilter: document.getElementById("category-filter"),
  factoryFilter: document.getElementById("factory-filter"),
  sortSelect: document.getElementById("sort-select"),
  resetFilters: document.getElementById("reset-filters"),
  grid: document.getElementById("catalog-grid"),
  adminUsersBody: document.getElementById("admin-users-body"),
  emptyState: document.getElementById("empty-state"),
  emptyTitle: document.getElementById("empty-title"),
  emptyDescription: document.getElementById("empty-description"),
  userAvatar: document.getElementById("user-avatar"),
  userName: document.getElementById("user-name"),
  userRole: document.getElementById("user-role"),
  metricTotal: document.getElementById("metric-total"),
  metricAssessment: document.getElementById("metric-assessment"),
  metricLearning: document.getElementById("metric-learning"),
  deleteModalBackdrop: document.getElementById("delete-modal-backdrop"),
  deleteUnitTitle: document.getElementById("delete-unit-title"),
  deleteCancelBtn: document.getElementById("delete-cancel-btn"),
  deleteConfirmBtn: document.getElementById("delete-confirm-btn"),
  adminConfirmBackdrop: document.getElementById("admin-confirm-backdrop"),
  adminConfirmTitle: document.getElementById("admin-confirm-title"),
  adminConfirmText: document.getElementById("admin-confirm-text"),
  adminConfirmCancelBtn: document.getElementById("admin-confirm-cancel-btn"),
  adminConfirmOkBtn: document.getElementById("admin-confirm-ok-btn"),
  adminUserCount: document.getElementById("admin-user-count"),
};

const wizardDom = {
  backdrop: document.getElementById("wizard-backdrop"),
  dialog: document.getElementById("wizard-dialog"),
  step1: document.getElementById("wizard-step-1"),
  step2: document.getElementById("wizard-step-2"),
  step3: document.getElementById("wizard-step-3"),
  step2hint: document.getElementById("wizard-step2-hint"),
  form: document.getElementById("wizard-form"),
  fTitle: document.getElementById("wf-title"),
  fDescription: document.getElementById("wf-description"),
  fTopic: document.getElementById("wf-topic"),
  fCategory: document.getElementById("wf-category"),
  fDuration: document.getElementById("wf-duration"),
  fFactory: document.getElementById("wf-factory"),
  fCover: document.getElementById("wf-cover-input"),
  coverLabel: document.getElementById("wf-cover-label"),
  coverPreviewWrap: document.getElementById("wf-cover-preview-wrap"),
  coverPreview: document.getElementById("wf-cover-preview"),
  coverClearBtn: document.getElementById("wf-cover-clear"),
  coverArea: document.getElementById("wf-cover-area"),
  submitBtn: document.getElementById("wizard-submit-btn"),
  tmplBackdrop: document.getElementById("tmpl-backdrop"),
  tmplSubtitle: document.getElementById("tmpl-subtitle"),
  tmplGrid: document.getElementById("tmpl-grid"),
  tmplEmpty: document.getElementById("tmpl-empty"),
  tmplCloseBtn: document.getElementById("tmpl-close-btn"),
  tmplBackBtn: document.getElementById("tmpl-back-btn"),
  previewImg: document.getElementById("wf-preview-img"),
  previewPh: document.getElementById("wf-preview-ph"),
  previewTitle: document.getElementById("wf-preview-title"),
  previewDuration: document.getElementById("wf-preview-duration"),
  previewAuthor: document.getElementById("wf-preview-author"),
};

const wizardDefaultForm = { title: "", description: "", topic: "", category: "", duration: "", factory: "" };
const wizardDefault = { step: 1, type: null, method: null, templateId: null, form: { ...wizardDefaultForm } };

let wizardState = loadWizardState();
let wizardCoverFile = null;
let pendingCoverFile = null;

const cropDom = {
  backdrop: document.getElementById("crop-backdrop"),
  viewport: document.getElementById("crop-viewport"),
  img: document.getElementById("crop-img"),
  zoomRange: document.getElementById("crop-zoom-range"),
  zoomOutBtn: document.getElementById("crop-zoom-out"),
  zoomInBtn: document.getElementById("crop-zoom-in"),
  cancelBtn: document.getElementById("crop-cancel-btn"),
  applyBtn: document.getElementById("crop-apply-btn"),
};

const cropState = {
  scale: 1, minScale: 1, maxScale: 3,
  offsetX: 0, offsetY: 0,
  isDragging: false,
  startMouseX: 0, startMouseY: 0,
  startOffsetX: 0, startOffsetY: 0,
  viewportW: 0, viewportH: 0,
  naturalW: 0, naturalH: 0,
};

let state = loadState();
let adminUsers = ensureAdminUsers(loadAdminUsers());
let pendingDeleteUnitId = null;
let pendingAdminAction = null;

function init() {
  if (!currentUser.rights.canAccessHome) {
    renderNoAccess();
    return;
  }

  renderUserBlock();
  renderNav();
  hydrateFilterOptions();
  bindEvents();
  bindWizardEvents();
  bindCropEvents();
  applyStateToInputs();
  refreshView();
}

function renderNoAccess() {
  document.body.innerHTML = `
    <main style="font-family: Manrope, 'Segoe UI', sans-serif; min-height: 100vh; display: grid; place-items: center; background: #f4f6f8; color: #1f2937;">
      <section style="max-width: 560px; border: 1px solid #e5e7eb; border-radius: 16px; background: #fff; padding: 24px; text-align: center;">
        <h1 style="margin-top: 0;">Доступ ограничен</h1>
        <p style="color: #6b7280; margin: 0;">
          У вас нет прав на открытие главной страницы AI-Ментор. Обратитесь за доступом по универсальной заявке.
        </p>
      </section>
    </main>
  `;
}

function renderUserBlock() {
  dom.userName.textContent = currentUser.name;
  dom.userRole.textContent = currentUser.roleName;
  dom.userAvatar.textContent = initials(currentUser.name);
}

const NAV_ICONS = {
  catalog: "./mortarboard.png",
  analytics: "./analytics.png",
  admin: "./admin-dashboard.png",
};

function renderNav() {
  const items = [
    { id: "catalog", label: "Каталог обучения", visible: currentUser.rights.canViewCatalog !== false },
    { id: "analytics", label: "Аналитика", visible: currentUser.rights.canViewAnalytics === true },
    { id: "admin", label: "Админ-панель", visible: currentUser.rights.canManageUsers === true },
  ].filter((item) => item.visible);

  if (items.length === 0) {
    dom.nav.innerHTML = "";
    return;
  }

  if (!items.some((item) => item.id === state.section)) {
    state.section = items[0].id;
  }

  dom.nav.innerHTML = "";

  items.forEach((item) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `nav-link ${state.section === item.id ? "is-active" : ""}`;
    btn.dataset.section = item.id;

    const iconSrc = NAV_ICONS[item.id];
    btn.innerHTML = iconSrc
      ? `<img class="nav-icon" src="${iconSrc}" alt="" aria-hidden="true" />${escapeHtml(item.label)}`
      : escapeHtml(item.label);

    dom.nav.appendChild(btn);
  });
}

function bindEvents() {
  dom.nav.addEventListener("click", (event) => {
    const target = event.target.closest("button[data-section]");
    if (!target) {
      return;
    }

    const nextSection = target.dataset.section;
    if (nextSection === "analytics" && !currentUser.rights.canViewAnalytics) {
      return;
    }
    if (nextSection === "admin" && !currentUser.rights.canManageUsers) {
      return;
    }

    state.section = nextSection;
    saveState();
    refreshView();
  });

  dom.createBtn.addEventListener("click", openWizard);

  dom.searchInput.addEventListener("input", () => {
    state.search = dom.searchInput.value.trim();
    saveState();
    syncResetBtn();
    refreshCatalog();
  });

  dom.adminSearchInput.addEventListener("input", () => {
    state.adminSearch = dom.adminSearchInput.value.trim();
    saveState();
    refreshAdminPanel();
  });

  dom.typeFilter.addEventListener("change", () => {
    state.type = dom.typeFilter.value;
    saveState();
    syncResetBtn();
    refreshCatalog();
  });

  dom.categoryFilter.addEventListener("change", () => {
    state.category = dom.categoryFilter.value;
    saveState();
    syncResetBtn();
    refreshCatalog();
  });

  dom.factoryFilter.addEventListener("change", () => {
    state.factory = dom.factoryFilter.value;
    saveState();
    syncResetBtn();
    refreshCatalog();
  });

  dom.sortSelect.addEventListener("change", () => {
    state.sort = dom.sortSelect.value;
    saveState();
    syncResetBtn();
    refreshCatalog();
  });

  dom.resetFilters.addEventListener("click", () => {
    FILTER_KEYS.forEach((key) => { state[key] = defaultState[key]; });
    applyStateToInputs();
    saveState();
    refreshCatalog();
  });

  dom.adminUsersBody.addEventListener("change", (event) => {
    const roleSelect = event.target.closest("select[data-userid]");
    if (!roleSelect) {
      return;
    }

    const { userid } = roleSelect.dataset;
    const newRole = roleSelect.value;
    const prevRole = roleSelect.dataset.prevRole || newRole;
    const user = adminUsers.find((u) => u.userId === userid);
    if (!user) return;

    roleSelect.value = prevRole;
    openAdminConfirm({ type: "role", userId: userid, fullName: user.fullName, newRole, prevRole, selectEl: roleSelect });
  });

  dom.adminUsersBody.addEventListener("click", (event) => {
    const revokeButton = event.target.closest("button[data-action='revoke-access'][data-userid]");
    if (!revokeButton) {
      return;
    }

    const { userid } = revokeButton.dataset;
    const user = adminUsers.find((u) => u.userId === userid);
    if (!user) return;

    openAdminConfirm({ type: "revoke", userId: userid, fullName: user.fullName });
  });

  dom.deleteCancelBtn.addEventListener("click", closeDeleteModal);
  dom.deleteModalBackdrop.addEventListener("click", (event) => {
    if (event.target === dom.deleteModalBackdrop) {
      closeDeleteModal();
    }
  });
  dom.deleteConfirmBtn.addEventListener("click", confirmDeleteUnit);

  document.addEventListener("click", (event) => {
    if (event.target.closest(".card__menu")) {
      return;
    }

    document.querySelectorAll(".card__menu[open]").forEach((menu) => {
      menu.open = false;
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    if (!wizardDom.tmplBackdrop.classList.contains("hidden")) {
      closeTmplCatalog();
      return;
    }
    if (!wizardDom.backdrop.classList.contains("hidden")) {
      closeWizard();
      return;
    }
    if (!dom.deleteModalBackdrop.classList.contains("hidden")) {
      closeDeleteModal();
      return;
    }
    if (!dom.adminConfirmBackdrop.classList.contains("hidden")) {
      closeAdminConfirm();
      return;
    }
    if (!cropDom.backdrop.classList.contains("hidden")) {
      closeCropModal();
    }
  });

  dom.adminConfirmCancelBtn.addEventListener("click", closeAdminConfirm);
  dom.adminConfirmOkBtn.addEventListener("click", confirmAdminAction);
  dom.adminConfirmBackdrop.addEventListener("click", (event) => {
    if (event.target === dom.adminConfirmBackdrop) closeAdminConfirm();
  });
}

function refreshView() {
  renderNav();

  const canCreate = currentUser.rights.canCreate === true && state.section === "catalog";
  dom.createBtn.classList.toggle("hidden", !canCreate);

  const isCatalog = state.section === "catalog";
  const isAnalytics = state.section === "analytics";
  const isAdmin = state.section === "admin";
  dom.catalogSection.classList.toggle("hidden", !isCatalog);
  dom.analyticsSection.classList.toggle("hidden", !isAnalytics);
  dom.adminSection.classList.toggle("hidden", !isAdmin);

  if (isCatalog) {
    dom.sectionTitle.textContent = "Каталог обучения";
    dom.sectionSubtitle.textContent = "Единицы обучения, доступные по вашей роли";
    refreshCatalog();
    return;
  }

  if (isAnalytics) {
    dom.sectionTitle.textContent = "Аналитика";
    dom.sectionSubtitle.textContent = "Сводка по единицам обучения";
    refreshAnalytics();
    return;
  }

  dom.sectionTitle.textContent = "Админ-панель";
  dom.sectionSubtitle.textContent = "Пользователи и роли доступа к AI-Ментор";
  refreshAdminPanel();
}

function refreshAnalytics() {
  const visibleUnits = getVisibleUnitsForUser();
  dom.metricTotal.textContent = String(visibleUnits.length);
  dom.metricAssessment.textContent = String(visibleUnits.filter((u) => u.type === "Проверяющая").length);
  dom.metricLearning.textContent = String(visibleUnits.filter((u) => u.type === "Обучающая").length);
}

function refreshCatalog() {
  const accessibleUnits = getVisibleUnitsForUser();

  if (accessibleUnits.length === 0) {
    dom.grid.innerHTML = "";
    showEmpty(
      "Нет доступных единиц обучения",
      "Каталог пуст для текущих прав. После назначения доступа единицы появятся автоматически."
    );
    return;
  }

  const processed = applyCatalogParams(accessibleUnits);

  if (processed.length === 0) {
    dom.grid.innerHTML = "";
    showEmpty(
      "Ничего не найдено",
      "Измените параметры поиска, фильтрации или нажмите «Сбросить», чтобы вернуться к исходному каталогу."
    );
    return;
  }

  hideEmpty();
  dom.grid.innerHTML = "";
  processed.forEach((unit) => {
    dom.grid.appendChild(renderCard(unit));
  });
}

function refreshAdminPanel() {
  dom.adminUsersBody.innerHTML = "";

  const query = String(state.adminSearch || "").toLowerCase();
  const filteredUsers = adminUsers.filter((user) => {
    if (!query) {
      return true;
    }
    const haystack = `${user.fullName} ${user.userId} ${user.role}`.toLowerCase();
    return haystack.includes(query);
  });

  if (dom.adminUserCount) {
    dom.adminUserCount.textContent = query
      ? `${filteredUsers.length} из ${adminUsers.length}`
      : String(adminUsers.length);
  }

  if (filteredUsers.length === 0) {
    const emptyRow = document.createElement("tr");
    emptyRow.innerHTML = `<td colspan="4" class="admin-empty-row">Ничего не найдено по вашему запросу.</td>`;
    dom.adminUsersBody.appendChild(emptyRow);
    return;
  }

  filteredUsers.forEach((user) => {
    const row = document.createElement("tr");
    const roleCell = user.isProtected
      ? `<span class="service-role-badge">${escapeHtml(user.role)}</span>`
      : `
        <select class="admin-role-select" data-userid="${escapeHtml(user.userId)}" data-prev-role="${escapeHtml(user.role)}">
          <option value="Редактор" ${user.role === "Редактор" ? "selected" : ""}>Редактор</option>
          <option value="Аналитик" ${user.role === "Аналитик" ? "selected" : ""}>Аналитик</option>
          <option value="Администратор" ${user.role === "Администратор" ? "selected" : ""}>Администратор</option>
        </select>
      `;

    const devBadge = user.isDeveloper
      ? `
        <button type="button" class="dev-badge" aria-label="Информация о разработчике">
          Dev
          <span class="dev-tooltip">Пользователь является разработчиком, вы не можете влиять на его роли</span>
        </button>
      `
      : "";

    const actionCell = user.isProtected
      ? `<button type="button" class="admin-action-btn" disabled>Забрать доступ</button>`
      : `<button type="button" class="admin-action-btn" data-action="revoke-access" data-userid="${escapeHtml(user.userId)}">Забрать доступ</button>`;

    row.innerHTML = `
      <td>
        <div class="admin-user-cell">
          <span>${escapeHtml(user.fullName)}</span>
          ${devBadge}
        </div>
      </td>
      <td><code>${escapeHtml(user.userId)}</code></td>
      <td>${roleCell}</td>
      <td>${actionCell}</td>
    `;
    dom.adminUsersBody.appendChild(row);
  });
}

function renderCard(unit) {
  const card = document.createElement("article");
  card.className = "card";

  const canEdit = canEditUnit(unit);
  const isMyCourse = unit.authorId === currentUser.id;
  const coverUrl = resolveCover(unit);
  const duration = getUnitDuration(unit);
  const coverPosition = getCoverPosition(coverUrl);
  const publicationStatus = normalizePublicationStatus(unit.publicationStatus);
  const statusText = publicationStatus === "published" ? "Опубликован" : "Приватное";
  const statusClass = publicationStatus === "published" ? "is-published" : "is-private";
  const toggleLabel = publicationStatus === "published" ? "Скрыть" : "Опубликовать";

  card.innerHTML = `
    <details class="card__menu">
      <summary class="card__menu-toggle" aria-label="Действия карточки">...</summary>
      <div class="card__menu-list">
        <button type="button" class="card__menu-item" data-action="open" data-unitid="${escapeHtml(unit.id)}">Открыть обучение</button>
        ${canEdit ? `<button type="button" class="card__menu-item" data-action="edit" data-unitid="${escapeHtml(unit.id)}">Редактировать единицу</button>` : ""}
        ${isMyCourse ? `<button type="button" class="card__menu-item" data-action="toggle-publicity" data-unitid="${escapeHtml(unit.id)}">${toggleLabel}</button>` : ""}
        ${isMyCourse ? `<button type="button" class="card__menu-item card__menu-item--danger" data-action="delete" data-unitid="${escapeHtml(unit.id)}">Удалить</button>` : ""}
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
        <span class="author-icon" title="${escapeHtml(unit.authorName)}" aria-label="Автор: ${escapeHtml(unit.authorName)}">
          ${AUTHOR_ICON_SVG}
          <span class="author-tooltip">${escapeHtml(unit.authorName)}</span>
        </span>
      </div>
    </div>
  `;

  card.addEventListener("click", (event) => {
    const actionButton = event.target.closest("button[data-action]");
    if (!actionButton) {
      return;
    }

    const action = actionButton.dataset.action;

    if (action === "open") {
      window.open(unit.launchUrl, "_blank", "noopener,noreferrer");
    }

    if (action === "edit" && canEdit) {
      window.location.href = unit.editUrl;
    }

    if (action === "toggle-publicity" && isMyCourse) {
      toggleUnitPublication(unit.id);
      refreshCatalog();
    }

    if (action === "delete" && isMyCourse) {
      openDeleteModal(unit.id);
    }

    const menu = actionButton.closest(".card__menu");
    if (menu) {
      menu.open = false;
    }
  });

  return card;
}

function applyCatalogParams(units) {
  let result = [...units];

  if (state.search) {
    const query = state.search.toLowerCase();
    result = result.filter((unit) => unit.title.toLowerCase().includes(query));
  }

  if (state.type !== "all") {
    result = result.filter((unit) => unit.type === state.type);
  }

  if (state.category !== "all") {
    result = result.filter((unit) => unit.category === state.category);
  }

  if (state.factory !== "all") {
    result = result.filter((unit) => unit.factory === state.factory);
  }

  result.sort((left, right) => {
    if (state.sort === "name_asc") {
      return left.title.localeCompare(right.title, "ru");
    }

    if (state.sort === "created_desc") {
      return new Date(right.createdAt) - new Date(left.createdAt);
    }

    return new Date(right.updatedAt) - new Date(left.updatedAt);
  });

  return result;
}

function getVisibleUnitsForUser() {
  if (currentUser.rights.isAdmin) {
    return allUnits;
  }

  const allowed = new Set(currentUser.rights.allowedUnitIds || []);
  return allUnits.filter((unit) => allowed.has(unit.id));
}

function canEditUnit(unit) {
  return currentUser.rights.isAdmin || unit.authorId === currentUser.id;
}

function hydrateFilterOptions() {
  const visibleUnits = getVisibleUnitsForUser();

  const types = uniqueValues(visibleUnits.map((unit) => unit.type));
  const categories = uniqueValues(visibleUnits.map((unit) => unit.category));
  const factories = uniqueValues(visibleUnits.map((unit) => unit.factory));

  fillSelect(dom.typeFilter, types, "Все типы");
  fillSelect(dom.categoryFilter, categories, "Все категории");
  fillSelect(dom.factoryFilter, factories, "Все фабрики");

  // Если сохраненное значение больше не валидно, сбрасываем в all.
  if (!types.includes(state.type)) {
    state.type = "all";
  }
  if (!categories.includes(state.category)) {
    state.category = "all";
  }
  if (!factories.includes(state.factory)) {
    state.factory = "all";
  }
}

function fillSelect(selectElement, values, allLabel) {
  selectElement.innerHTML = `<option value="all">${allLabel}</option>`;
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    selectElement.appendChild(option);
  });
}

function applyStateToInputs() {
  dom.searchInput.value = state.search;
  dom.adminSearchInput.value = state.adminSearch;
  dom.typeFilter.value = state.type;
  dom.categoryFilter.value = state.category;
  dom.factoryFilter.value = state.factory;
  dom.sortSelect.value = state.sort;
  syncResetBtn();
}

function showEmpty(title, description) {
  dom.emptyTitle.textContent = title;
  dom.emptyDescription.textContent = description;
  dom.emptyState.classList.remove("hidden");
}

function hideEmpty() {
  dom.emptyState.classList.add("hidden");
}

function loadState() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { ...defaultState };
    }

    const parsed = JSON.parse(raw);
    return {
      ...defaultState,
      ...parsed,
    };
  } catch (error) {
    return { ...defaultState };
  }
}

function saveState() {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function isFiltersDefault() {
  return FILTER_KEYS.every((key) => state[key] === defaultState[key]);
}

function syncResetBtn() {
  dom.resetFilters.classList.toggle("hidden", isFiltersDefault());
}

function getUnitById(unitId) {
  return allUnits.find((u) => u.id === unitId);
}

function loadAdminUsers() {
  try {
    const raw = sessionStorage.getItem(ADMIN_USERS_STORAGE_KEY);
    if (!raw) {
      return ensureAdminUsers(defaultAdminUsers);
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return ensureAdminUsers(defaultAdminUsers);
    }

    return ensureAdminUsers(parsed);
  } catch (error) {
    return ensureAdminUsers(defaultAdminUsers);
  }
}

function saveAdminUsers() {
  sessionStorage.setItem(ADMIN_USERS_STORAGE_KEY, JSON.stringify(adminUsers));
}

function ensureAdminUsers(inputUsers) {
  const users = Array.isArray(inputUsers) ? inputUsers : [];
  const normalized = users
    .filter((user) => user && typeof user.fullName === "string" && typeof user.userId === "string")
    .map((user) => ({
      fullName: user.fullName.trim(),
      userId: user.userId.trim(),
      role: typeof user.role === "string" && user.role.trim() ? user.role.trim() : "Редактор",
      isProtected: Boolean(user.isProtected),
      isDeveloper: Boolean(user.isDeveloper),
    }))
    .filter((user) => user.fullName && user.userId);

  const requiredIds = new Set(REQUIRED_SERVICE_USERS.map((user) => user.userId.toUpperCase()));
  const withoutRequired = normalized.filter((user) => !requiredIds.has(user.userId.toUpperCase()));
  const result = [...REQUIRED_SERVICE_USERS.map((user) => ({ ...user })), ...withoutRequired];
  return result;
}

function normalizePublicationStatus(rawStatus) {
  return rawStatus === "published" ? "published" : "private";
}

function toggleUnitPublication(unitId) {
  allUnits = allUnits.map((unit) => {
    if (unit.id !== unitId) {
      return unit;
    }

    const currentStatus = normalizePublicationStatus(unit.publicationStatus);
    const nextStatus = currentStatus === "published" ? "private" : "published";
    return {
      ...unit,
      publicationStatus: nextStatus,
      updatedAt: new Date().toISOString(),
    };
  });
}

function openDeleteModal(unitId) {
  pendingDeleteUnitId = unitId;
  const unit = getUnitById(unitId);
  dom.deleteUnitTitle.textContent = unit ? unit.title : unitId;
  dom.deleteModalBackdrop.classList.remove("hidden");
}

function closeDeleteModal() {
  pendingDeleteUnitId = null;
  dom.deleteModalBackdrop.classList.add("hidden");
}

function confirmDeleteUnit() {
  if (!pendingDeleteUnitId) {
    return;
  }

  allUnits = allUnits.filter((unit) => unit.id !== pendingDeleteUnitId);
  closeDeleteModal();
  hydrateFilterOptions();
  refreshView();
}

function openAdminConfirm(action) {
  pendingAdminAction = action;
  const text = action.type === "revoke"
    ? `Вы уверены, что хотите забрать доступ у ${action.fullName}?`
    : `Вы уверены, что хотите изменить роль ${action.fullName} на «${action.newRole}»?`;
  dom.adminConfirmText.textContent = text;
  dom.adminConfirmBackdrop.classList.remove("hidden");
}

function closeAdminConfirm() {
  pendingAdminAction = null;
  dom.adminConfirmBackdrop.classList.add("hidden");
}

function confirmAdminAction() {
  if (!pendingAdminAction) return;

  if (pendingAdminAction.type === "revoke") {
    const { userId } = pendingAdminAction;
    adminUsers = adminUsers.filter((user) => user.userId !== userId || user.isProtected);
  } else if (pendingAdminAction.type === "role") {
    const { userId, newRole, selectEl } = pendingAdminAction;
    adminUsers = adminUsers.map((user) => (user.userId === userId ? { ...user, role: newRole } : user));
    if (selectEl) {
      selectEl.value = newRole;
      selectEl.dataset.prevRole = newRole;
    }
  }

  saveAdminUsers();
  closeAdminConfirm();
  refreshAdminPanel();
}

function getUnitDuration(unit) {
  if (typeof unit.durationLabel === "string" && unit.durationLabel.trim()) {
    return unit.durationLabel.trim();
  }

  return unit.type === "Проверяющая" ? "~45 мин" : "~1 час";
}

function resolveCover(unit) {
  if (typeof unit.coverUrl === "string" && unit.coverUrl.trim()) {
    return unit.coverUrl.trim();
  }

  const index = allUnits.findIndex((item) => item.id === unit.id);
  const coverIndex = index < 0 ? 0 : index % promptCovers.length;
  return promptCovers[coverIndex];
}

function getCoverPosition(coverUrl) {
  const normalized = decodeURIComponent(String(coverUrl || "")).toLowerCase();

  if (normalized.includes("premium_2.jpg")) {
    return "center 34%";
  }
  if (normalized.includes("premium.jpg")) {
    return "center 45%";
  }
  if (normalized.includes("mmb-89.png")) {
    return "center 50%";
  }
  if (normalized.includes("rb-34.png")) {
    return "center 52%";
  }

  return "center center";
}

function initials(fullName) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0].toUpperCase()).join("");
}

function uniqueValues(values) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b, "ru"));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

// ─── WIZARD ──────────────────────────────────────────────────────────────────

function loadWizardState() {
  try {
    const raw = localStorage.getItem(WIZARD_STORAGE_KEY);
    if (!raw) return { ...wizardDefault, form: { ...wizardDefaultForm } };
    const parsed = JSON.parse(raw);
    return { ...wizardDefault, ...parsed, form: { ...wizardDefaultForm, ...(parsed.form || {}) } };
  } catch {
    return { ...wizardDefault, form: { ...wizardDefaultForm } };
  }
}

function saveWizardState() {
  localStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify(wizardState));
}

function clearWizardState() {
  localStorage.removeItem(WIZARD_STORAGE_KEY);
  wizardState = { ...wizardDefault, form: { ...wizardDefaultForm } };
}

function openWizard() {
  if (!currentUser.rights.canCreate) return;
  wizardCoverFile = null;
  renderWizardStep();
  wizardDom.backdrop.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeWizard() {
  wizardDom.backdrop.classList.add("hidden");
  document.body.style.overflow = "";
  saveWizardState();
  closeTmplCatalog();
}

function renderWizardStep() {
  [wizardDom.step1, wizardDom.step2, wizardDom.step3].forEach((el, i) => {
    el.classList.toggle("hidden", i + 1 !== wizardState.step);
  });

  wizardDom.dialog.classList.toggle("wizard--step3", wizardState.step === 3);

  const progSegs = [
    document.getElementById("wizard-prog-1"),
    document.getElementById("wizard-prog-2"),
    document.getElementById("wizard-prog-3"),
  ];
  progSegs.forEach((seg, i) => {
    if (seg) seg.classList.toggle("is-fill", i + 1 <= wizardState.step);
  });

  if (wizardState.step === 2) {
    const label = wizardState.type === "trainer" ? "тренажёры" : "экзамены";
    wizardDom.step2hint.textContent = `Начните с нуля или возьмите за основу существующие ${label}.`;
  }

  if (wizardState.step === 3) {
    fillWizardSelects();
    wizardDom.fTitle.value = wizardState.form.title;
    wizardDom.fDescription.value = wizardState.form.description;
    wizardDom.fTopic.value = wizardState.form.topic;
    wizardDom.fCategory.value = wizardState.form.category;
    wizardDom.fDuration.value = wizardState.form.duration;
    wizardDom.fFactory.value = wizardState.form.factory;

    if (!wizardCoverFile) {
      wizardDom.coverPreviewWrap.classList.add("hidden");
      wizardDom.coverLabel.classList.remove("hidden");
      wizardDom.previewImg.classList.add("hidden");
      wizardDom.previewPh.classList.remove("hidden");
    }

    updateCardPreview();
    validateWizardForm();
  }
}

function goToWizardStep(step) {
  wizardState.step = step;
  saveWizardState();
  renderWizardStep();
}

function handleWizardAction(action, value) {
  if (action === "pick-type") {
    wizardState.type = value;
    goToWizardStep(2);
    return;
  }

  if (action === "pick-method") {
    wizardState.method = value;
    saveWizardState();
    if (value === "new") {
      goToWizardStep(3);
    } else {
      openTmplCatalog();
    }
    return;
  }

  if (action === "go-back") {
    const target = parseInt(value, 10);
    if (target === 1) {
      wizardState.type = null;
      wizardState.method = null;
    }
    if (target === 2) {
      wizardState.method = null;
      wizardState.templateId = null;
    }
    goToWizardStep(target);
    return;
  }

  if (action === "close") {
    closeWizard();
  }
}

function openTmplCatalog() {
  const filterType = wizardState.type === "trainer" ? "Обучающая" : "Проверяющая";
  const typeLabel = wizardState.type === "trainer" ? "тренажеры" : "экзамены";
  const templates = allUnits.filter((u) => u.type === filterType);

  wizardDom.tmplSubtitle.textContent = `Выберите ${typeLabel} для использования в качестве шаблона`;
  wizardDom.tmplGrid.innerHTML = "";

  if (templates.length === 0) {
    wizardDom.tmplEmpty.classList.remove("hidden");
  } else {
    wizardDom.tmplEmpty.classList.add("hidden");
    templates.forEach((unit) => wizardDom.tmplGrid.appendChild(renderTmplCard(unit)));
  }

  wizardDom.tmplBackdrop.classList.remove("hidden");
}

function closeTmplCatalog() {
  wizardDom.tmplBackdrop.classList.add("hidden");
}

function renderTmplCard(unit) {
  const card = document.createElement("article");
  card.className = "card";

  const coverUrl = resolveCover(unit);
  const duration = getUnitDuration(unit);
  const coverPosition = getCoverPosition(coverUrl);
  const publicationStatus = normalizePublicationStatus(unit.publicationStatus);
  const statusText = publicationStatus === "published" ? "Опубликован" : "Приватное";
  const statusClass = publicationStatus === "published" ? "is-published" : "is-private";

  card.innerHTML = `
    <figure class="card__media-wrap">
      <img class="card__media" src="${escapeHtml(coverUrl)}" alt="Обложка: ${escapeHtml(unit.title)}" loading="lazy" style="object-position: ${escapeHtml(coverPosition)};" />
    </figure>
    <div class="card__body">
      <h3 class="card__title">${escapeHtml(unit.title)}</h3>
      <div class="card__meta">
        <span class="meta-badge">${escapeHtml(duration)}</span>
        <span class="card__status ${statusClass}">${statusText}</span>
        <span class="author-icon" title="${escapeHtml(unit.authorName)}" aria-label="Автор: ${escapeHtml(unit.authorName)}">
          ${AUTHOR_ICON_SVG}
          <span class="author-tooltip">${escapeHtml(unit.authorName)}</span>
        </span>
      </div>
      <button type="button" class="btn btn--secondary tmpl-select-btn" data-unitid="${escapeHtml(unit.id)}">Выбрать</button>
    </div>
  `;

  card.querySelector(".tmpl-select-btn").addEventListener("click", () => selectTemplate(unit.id));

  return card;
}

function selectTemplate(unitId) {
  const unit = getUnitById(unitId);
  if (!unit) return;

  wizardState.templateId = unitId;
  wizardState.form = { ...wizardDefaultForm };
  saveWizardState();
  closeTmplCatalog();
  goToWizardStep(3);
}

function validateWizardForm() {
  const { title, description, topic, category, duration, factory } = wizardState.form;
  const allText = [title, description, topic, category, duration, factory].every((v) => v.trim());
  wizardDom.submitBtn.disabled = !(allText && wizardCoverFile !== null);
}

function submitWizardForm() {
  const newId      = `edu-${Date.now()}`;
  const unitType   = wizardState.type === "trainer" ? "Обучающая" : "Проверяющая";
  const coverDataUrl = wizardDom.coverPreview.src || null;

  // Persist meta to builder storage (builder.js builds the full scaffold on first open)
  const builderMeta = {
    id:           newId,
    title:        wizardState.form.title.trim(),
    type:         wizardState.type,
    description:  wizardState.form.description.trim(),
    category:     wizardState.form.category.trim(),
    factory:      wizardState.form.factory.trim(),
    durationLabel: wizardState.form.duration.trim(),
    coverDataUrl,
    createdAt:    new Date().toISOString(),
    _isNew:       true,
  };
  try {
    const all = JSON.parse(localStorage.getItem("ai-mentor-builder-data-v1") || "{}");
    all[newId] = builderMeta;
    localStorage.setItem("ai-mentor-builder-data-v1", JSON.stringify(all));
  } catch (e) {
    console.warn("Не удалось сохранить в localStorage", e);
  }

  // Add unit to catalog (shown when user returns)
  allUnits.push({
    id: newId,
    title: wizardState.form.title.trim(),
    type: unitType,
    category: wizardState.form.category.trim(),
    factory: wizardState.form.factory.trim(),
    authorId: currentUser.id,
    authorName: currentUser.name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    durationLabel: wizardState.form.duration.trim(),
    publicationStatus: "private",
    coverUrl: coverDataUrl,
    launchUrl: `https://example.org/alpha-course/learn/${newId}`,
    editUrl: `./builder/index.html?id=${newId}`,
  });

  clearWizardState();
  window.location.href = `./builder/index.html?id=${newId}`;
}

function syncWizardField(el) {
  wizardState.form[el.name] = el.value;
  saveWizardState();
  validateWizardForm();
  updateCardPreview();
}

function updateCardPreview() {
  wizardDom.previewTitle.textContent = wizardState.form.title.trim() || "Название обучения";
  wizardDom.previewDuration.textContent = wizardState.form.duration || "—";
  wizardDom.previewAuthor.innerHTML = `
    ${AUTHOR_ICON_SVG}
    <span class="author-tooltip">${escapeHtml(currentUser.name)}</span>
  `;
  wizardDom.previewAuthor.title = currentUser.name;
  wizardDom.previewAuthor.setAttribute("aria-label", `Автор: ${currentUser.name}`);
}

function fillWizardSelects() {
  const categories = uniqueValues(allUnits.map((u) => u.category));
  const factories = uniqueValues(allUnits.map((u) => u.factory));

  fillWizardSelectOptions(wizardDom.fCategory, categories, "Выберите категорию");
  fillWizardSelectOptions(wizardDom.fFactory, factories, "Выберите фабрику");
}

function fillWizardSelectOptions(selectEl, values, placeholder) {
  const current = selectEl.value;
  selectEl.innerHTML = `<option value="">${placeholder}</option>`;
  values.forEach((v) => {
    const opt = document.createElement("option");
    opt.value = v;
    opt.textContent = v;
    selectEl.appendChild(opt);
  });
  selectEl.value = current;
}

function bindWizardEvents() {
  wizardDom.backdrop.addEventListener("click", (event) => {
    if (event.target === wizardDom.backdrop) {
      closeWizard();
      return;
    }
    const btn = event.target.closest("[data-wizard-action]");
    if (btn) handleWizardAction(btn.dataset.wizardAction, btn.dataset.value);
  });

  [wizardDom.fTitle, wizardDom.fDescription].forEach((input) => {
    input.addEventListener("input", () => syncWizardField(input));
  });

  [wizardDom.fTopic, wizardDom.fCategory, wizardDom.fDuration, wizardDom.fFactory].forEach((sel) => {
    sel.addEventListener("change", () => syncWizardField(sel));
  });

  wizardDom.fCover.addEventListener("change", () => {
    const file = wizardDom.fCover.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      wizardDom.fCover.value = "";
      return;
    }

    pendingCoverFile = file;
    const reader = new FileReader();
    reader.onload = (e) => openCropModal(e.target.result);
    reader.readAsDataURL(file);
  });

  wizardDom.coverClearBtn.addEventListener("click", () => {
    wizardCoverFile = null;
    wizardDom.fCover.value = "";
    wizardDom.coverPreviewWrap.classList.add("hidden");
    wizardDom.coverLabel.classList.remove("hidden");
    wizardDom.coverPreview.src = "";
    wizardDom.previewImg.classList.add("hidden");
    wizardDom.previewPh.classList.remove("hidden");
    validateWizardForm();
  });

  wizardDom.coverArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    wizardDom.coverArea.classList.add("is-drag-over");
  });

  wizardDom.coverArea.addEventListener("dragleave", (e) => {
    if (!wizardDom.coverArea.contains(e.relatedTarget)) {
      wizardDom.coverArea.classList.remove("is-drag-over");
    }
  });

  wizardDom.coverArea.addEventListener("drop", (e) => {
    e.preventDefault();
    wizardDom.coverArea.classList.remove("is-drag-over");
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    if (file.size > 10 * 1024 * 1024) return;
    pendingCoverFile = file;
    const reader = new FileReader();
    reader.onload = (ev) => openCropModal(ev.target.result);
    reader.readAsDataURL(file);
  });

  wizardDom.form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!wizardDom.submitBtn.disabled) submitWizardForm();
  });

  wizardDom.tmplCloseBtn.addEventListener("click", closeTmplCatalog);
  wizardDom.tmplBackBtn.addEventListener("click", closeTmplCatalog);

  wizardDom.tmplBackdrop.addEventListener("click", (event) => {
    if (event.target === wizardDom.tmplBackdrop) closeTmplCatalog();
  });
}

// ─── COVER CROP ──────────────────────────────────────────────────────────────

function openCropModal(dataUrl) {
  // Show first so getBoundingClientRect() returns real dimensions
  cropDom.backdrop.classList.remove("hidden");
  document.body.style.overflow = "hidden";

  const img = cropDom.img;
  img.onload = () => {
    const vp = cropDom.viewport.getBoundingClientRect();
    cropState.viewportW = vp.width;
    cropState.viewportH = vp.height;
    cropState.naturalW = img.naturalWidth;
    cropState.naturalH = img.naturalHeight;

    const minScale = Math.max(
      cropState.viewportW / cropState.naturalW,
      cropState.viewportH / cropState.naturalH,
    );
    cropState.minScale = minScale;
    cropState.maxScale = minScale * 3;
    cropState.scale = minScale;

    cropState.offsetX = (cropState.viewportW - cropState.naturalW * minScale) / 2;
    cropState.offsetY = (cropState.viewportH - cropState.naturalH * minScale) / 2;
    clampCropOffset();
    applyCropTransform();

    cropDom.zoomRange.value = 0;
  };
  img.src = dataUrl;
}

function closeCropModal() {
  cropDom.backdrop.classList.add("hidden");
  document.body.style.overflow = "";
  pendingCoverFile = null;
  wizardDom.fCover.value = "";
}

function clampCropOffset() {
  const imgW = cropState.naturalW * cropState.scale;
  const imgH = cropState.naturalH * cropState.scale;
  cropState.offsetX = Math.min(0, Math.max(cropState.viewportW - imgW, cropState.offsetX));
  cropState.offsetY = Math.min(0, Math.max(cropState.viewportH - imgH, cropState.offsetY));
}

function applyCropTransform() {
  cropDom.img.style.transform = `translate(${cropState.offsetX}px, ${cropState.offsetY}px) scale(${cropState.scale})`;
}

function zoomCropCentered(newScale) {
  const vpCX = cropState.viewportW / 2;
  const vpCY = cropState.viewportH / 2;
  const imgX = (vpCX - cropState.offsetX) / cropState.scale;
  const imgY = (vpCY - cropState.offsetY) / cropState.scale;
  cropState.scale = Math.max(cropState.minScale, Math.min(cropState.maxScale, newScale));
  cropState.offsetX = vpCX - imgX * cropState.scale;
  cropState.offsetY = vpCY - imgY * cropState.scale;
  clampCropOffset();
  applyCropTransform();
}

function zoomCropAtPoint(newScale, vpX, vpY) {
  const imgX = (vpX - cropState.offsetX) / cropState.scale;
  const imgY = (vpY - cropState.offsetY) / cropState.scale;
  cropState.scale = Math.max(cropState.minScale, Math.min(cropState.maxScale, newScale));
  cropState.offsetX = vpX - imgX * cropState.scale;
  cropState.offsetY = vpY - imgY * cropState.scale;
  clampCropOffset();
  applyCropTransform();
  const pct = ((cropState.scale - cropState.minScale) / (cropState.maxScale - cropState.minScale)) * 100;
  cropDom.zoomRange.value = Math.round(pct);
}

function syncCropSlider() {
  const pct = ((cropState.scale - cropState.minScale) / (cropState.maxScale - cropState.minScale)) * 100;
  cropDom.zoomRange.value = Math.round(pct);
}

function applyCrop() {
  const canvas = document.createElement("canvas");
  canvas.width = cropState.viewportW;
  canvas.height = cropState.viewportH;
  const ctx = canvas.getContext("2d");

  const sx = -cropState.offsetX / cropState.scale;
  const sy = -cropState.offsetY / cropState.scale;
  const sw = cropState.viewportW / cropState.scale;
  const sh = cropState.viewportH / cropState.scale;
  ctx.drawImage(cropDom.img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

  const croppedDataUrl = canvas.toDataURL("image/jpeg", 0.92);

  wizardCoverFile = pendingCoverFile;
  pendingCoverFile = null;
  wizardDom.fCover.value = "";

  wizardDom.coverPreview.src = croppedDataUrl;
  wizardDom.coverPreviewWrap.classList.remove("hidden");
  wizardDom.coverLabel.classList.add("hidden");
  wizardDom.previewImg.src = croppedDataUrl;
  wizardDom.previewImg.classList.remove("hidden");
  wizardDom.previewPh.classList.add("hidden");

  cropDom.backdrop.classList.add("hidden");
  document.body.style.overflow = "";
  validateWizardForm();
}

function bindCropEvents() {
  cropDom.viewport.addEventListener("mousedown", (e) => {
    e.preventDefault();
    cropState.isDragging = true;
    cropState.startMouseX = e.clientX;
    cropState.startMouseY = e.clientY;
    cropState.startOffsetX = cropState.offsetX;
    cropState.startOffsetY = cropState.offsetY;
    cropDom.viewport.classList.add("is-dragging");
  });

  window.addEventListener("mousemove", (e) => {
    if (!cropState.isDragging) return;
    cropState.offsetX = cropState.startOffsetX + (e.clientX - cropState.startMouseX);
    cropState.offsetY = cropState.startOffsetY + (e.clientY - cropState.startMouseY);
    clampCropOffset();
    applyCropTransform();
  });

  window.addEventListener("mouseup", () => {
    if (!cropState.isDragging) return;
    cropState.isDragging = false;
    cropDom.viewport.classList.remove("is-dragging");
  });

  cropDom.viewport.addEventListener("wheel", (e) => {
    e.preventDefault();
    const rect = cropDom.viewport.getBoundingClientRect();
    const vpX = e.clientX - rect.left;
    const vpY = e.clientY - rect.top;
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    zoomCropAtPoint(cropState.scale + delta * cropState.minScale, vpX, vpY);
  }, { passive: false });

  cropDom.zoomRange.addEventListener("input", () => {
    const pct = Number(cropDom.zoomRange.value) / 100;
    const newScale = cropState.minScale + pct * (cropState.maxScale - cropState.minScale);
    zoomCropCentered(newScale);
  });

  cropDom.zoomOutBtn.addEventListener("click", () => {
    zoomCropCentered(cropState.scale - 0.1 * cropState.minScale);
    syncCropSlider();
  });

  cropDom.zoomInBtn.addEventListener("click", () => {
    zoomCropCentered(cropState.scale + 0.1 * cropState.minScale);
    syncCropSlider();
  });

  cropDom.cancelBtn.addEventListener("click", closeCropModal);
  cropDom.applyBtn.addEventListener("click", applyCrop);
  cropDom.backdrop.addEventListener("click", (e) => {
    if (e.target === cropDom.backdrop) closeCropModal();
  });
}

init();
