const STORAGE_KEY = "ai-mentor-catalog-state-v1";

const ADMIN_USERS_STORAGE_KEY = "ai-mentor-access-users-v1";
const WIZARD_STORAGE_KEY = "ai-mentor-wizard-v2";
const ANALYTICS_STATE_KEY = "ai-mentor-analytics-state-v1";

const bootstrap = window.AI_MENTOR_BOOTSTRAP || {};

const currentUser = bootstrap.currentUser || {
  id: "u-101",
  name: "Плишкин Роман Валерьевич",
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

/* ── Слияние единиц из конструктора ─────────────────
   Читает ai-mentor-builder-data-v1 из localStorage и:
   - обновляет publicationStatus для уже существующих единиц
   - добавляет новые опубликованные/созданные единицы в каталог
──────────────────────────────────────────────────── */
function mergeBuilderUnits() {
  try {
    const stored = JSON.parse(localStorage.getItem("ai-mentor-builder-data-v1") || "{}");
    const existingIds = new Set(allUnits.map((u) => u.id));

    for (const bu of Object.values(stored)) {
      if (!bu || !bu.id) continue;

      if (existingIds.has(bu.id)) {
        // Обновляем статус публикации для уже известных единиц
        const idx = allUnits.findIndex((u) => u.id === bu.id);
        if (idx !== -1 && bu.publicationStatus) {
          allUnits[idx].publicationStatus = bu.publicationStatus;
        }
      } else {
        // Добавляем новую единицу из конструктора в каталог
        const typeDisplay = bu.type === "trainer" ? "Обучающая" : "Проверяющая";
        allUnits.push({
          id:                bu.id,
          title:             bu.title        || "Без названия",
          type:              typeDisplay,
          category:          bu.category     || "",
          factory:           bu.factory      || "",
          authorId:          bu.authorId     || currentUser.id,
          authorName:        bu.authorName   || currentUser.name,
          createdAt:         bu.createdAt    || new Date().toISOString(),
          updatedAt:         bu.updatedAt    || new Date().toISOString(),
          durationLabel:     bu.durationLabel || "",
          publicationStatus: bu.publicationStatus || "private",
          coverUrl:          bu.coverDataUrl || bu.coverUrl || null,
          launchUrl:         `https://example.org/alpha-course/learn/${bu.id}`,
          editUrl:           `./builder/index.html?id=${bu.id}`,
        });
        existingIds.add(bu.id);
      }
    }
  } catch (e) {
    console.warn("mergeBuilderUnits:", e);
  }
}

// ─── ANALYTICS MOCK DATA ─────────────────────────────────────────────────────

const ANALYTICS_SESSIONS = bootstrap.analyticsSessions || (function () {
  function s(id, unitId, unitTitle, dir, empId, empName, status, assignedDate, startDate, endDate, activeMin, score, attempts) {
    return { id, unitId, unitTitle, direction: dir, employeeId: empId, employeeName: empName, status, assignedDate, startDate, endDate, activeTimeMinutes: activeMin, score, attempts };
  }
  return [
    // Январь 2026
    s("s01","edu-001","Тренажер по кредитным картам","КЦ","U_QD7RZ","Рожков Александр Игоревич","completed","2026-01-18T08:00:00Z","2026-01-20T09:15:00Z","2026-01-20T10:20:00Z",65,null,1),
    s("s02","edu-003","Экзамен Basic1","ДКЦ","U_W2K9M","Савельева Мария Сергеевна","completed","2026-01-10T08:00:00Z","2026-01-15T10:00:00Z","2026-01-15T10:50:00Z",50,72,2),
    s("s03","edu-004","Экзамен Optimum","SME","U_FH18Q","Игнатов Павел Андреевич","completed","2026-01-05T08:00:00Z","2026-01-08T14:00:00Z","2026-01-08T14:38:00Z",38,91,1),
    s("s04","edu-004","Экзамен Optimum","SME","U_Z8P3D","Новикова Валерия Олеговна","completed","2026-01-22T08:00:00Z","2026-01-25T11:00:00Z","2026-01-25T11:33:00Z",33,85,1),
    s("s05","edu-002","Тренажер по лояльности с клиентами","ТМ","U_J3R8P","Орлова Софья Артёмовна","completed","2026-01-08T08:00:00Z","2026-01-12T09:00:00Z","2026-01-12T09:58:00Z",58,null,1),
    // Февраль 2026
    s("s06","edu-002","Тренажер по лояльности с клиентами","ТМ","U_QD7RZ","Рожков Александр Игоревич","completed","2026-02-10T08:00:00Z","2026-02-14T09:00:00Z","2026-02-14T09:48:00Z",48,null,2),
    s("s07","edu-003","Экзамен Basic1","ДКЦ","U_QD7RZ","Рожков Александр Игоревич","completed","2026-02-16T08:00:00Z","2026-02-20T10:00:00Z","2026-02-20T10:42:00Z",42,88,1),
    s("s08","edu-001","Тренажер по кредитным картам","КЦ","U_W2K9M","Савельева Мария Сергеевна","completed","2026-02-06T08:00:00Z","2026-02-10T09:30:00Z","2026-02-10T10:40:00Z",70,null,1),
    s("s09","edu-001","Тренажер по кредитным картам","КЦ","U_M0T5B","Королев Денис Владимирович","completed","2026-02-04T08:00:00Z","2026-02-08T13:00:00Z","2026-02-08T14:00:00Z",60,null,1),
    s("s10","edu-002","Тренажер по лояльности с клиентами","ТМ","U_K4V1S","Баранов Олег Михайлович","completed","2026-02-12T08:00:00Z","2026-02-16T09:00:00Z","2026-02-16T09:55:00Z",55,null,1),
    s("s11","edu-003","Экзамен Basic1","ДКЦ","U_K4V1S","Баранов Олег Михайлович","completed","2026-02-18T08:00:00Z","2026-02-22T10:00:00Z","2026-02-22T10:51:00Z",51,94,1),
    s("s12","edu-003","Экзамен Basic1","ДКЦ","U_H9C7L","Пахомов Евгений Александрович","completed","2026-02-08T08:00:00Z","2026-02-12T10:00:00Z","2026-02-12T10:46:00Z",46,83,1),
    s("s13","edu-001","Тренажер по кредитным картам","КЦ","U_J3R8P","Орлова Софья Артёмовна","completed","2026-02-14T08:00:00Z","2026-02-18T10:00:00Z","2026-02-18T11:07:00Z",67,null,1),
    s("s14","edu-003","Экзамен Basic1","ДКЦ","U_B5U0K","Елисеев Артем Константинович","completed","2026-02-20T08:00:00Z","2026-02-24T10:00:00Z","2026-02-24T10:44:00Z",44,76,2),
    s("s15","edu-002","Тренажер по лояльности с клиентами","ТМ","U_P7E4J","Егорова Татьяна Борисовна","completed","2026-02-02T08:00:00Z","2026-02-06T09:00:00Z","2026-02-06T09:45:00Z",45,null,1),
    s("s16","edu-001","Тренажер по кредитным картам","КЦ","U_FH18Q","Игнатов Павел Андреевич","in_progress","2026-02-22T08:00:00Z","2026-02-25T11:00:00Z",null,35,null,1),
    // Март 2026 (1–16)
    s("s17","edu-004","Экзамен Optimum","SME","U_QD7RZ","Рожков Александр Игоревич","in_progress","2026-03-08T08:00:00Z","2026-03-10T14:00:00Z",null,20,null,1),
    s("s18","edu-001","Тренажер по кредитным картам","КЦ","U_Q6Y2N","Филатова Наталья Юрьевна","completed","2026-03-01T08:00:00Z","2026-03-03T10:00:00Z","2026-03-03T11:03:00Z",63,null,1),
    s("s19","edu-002","Тренажер по лояльности с клиентами","ТМ","U_M0T5B","Королев Денис Владимирович","completed","2026-03-03T08:00:00Z","2026-03-05T09:00:00Z","2026-03-05T09:52:00Z",52,null,1),
    s("s20","edu-001","Тренажер по кредитным картам","КЦ","U_T1M6V","Громова Ксения Дмитриевна","completed","2026-03-02T08:00:00Z","2026-03-04T10:00:00Z","2026-03-04T11:01:00Z",61,null,1),
    s("s21","edu-001","Тренажер по кредитным картам","КЦ","U_P7E4J","Егорова Татьяна Борисовна","completed","2026-03-04T08:00:00Z","2026-03-06T09:00:00Z","2026-03-06T09:59:00Z",59,null,1),
    s("s22","edu-004","Экзамен Optimum","SME","U_H9C7L","Пахомов Евгений Александрович","completed","2026-03-05T08:00:00Z","2026-03-07T10:00:00Z","2026-03-07T10:40:00Z",40,70,2),
    s("s23","edu-004","Экзамен Optimum","SME","U_P7E4J","Егорова Татьяна Борисовна","completed","2026-03-06T08:00:00Z","2026-03-08T10:00:00Z","2026-03-08T10:41:00Z",41,81,1),
    s("s24","edu-001","Тренажер по кредитным картам","КЦ","U_Z8P3D","Новикова Валерия Олеговна","in_progress","2026-03-06T08:00:00Z","2026-03-08T11:00:00Z",null,28,null,1),
    s("s25","edu-001","Тренажер по кредитным картам","КЦ","U_H9C7L","Пахомов Евгений Александрович","in_progress","2026-03-07T08:00:00Z","2026-03-09T09:00:00Z",null,30,null,1),
    s("s26","edu-001","Тренажер по кредитным картам","КЦ","U_N2A9F","Чернов Роман Евгеньевич","in_progress","2026-03-08T08:00:00Z","2026-03-10T10:00:00Z",null,15,null,1),
    s("s27","edu-004","Экзамен Optimum","SME","U_Q6Y2N","Филатова Наталья Юрьевна","in_progress","2026-03-09T08:00:00Z","2026-03-11T14:00:00Z",null,18,null,1),
    s("s28","edu-002","Тренажер по лояльности с клиентами","ТМ","U_T1M6V","Громова Ксения Дмитриевна","in_progress","2026-03-10T08:00:00Z","2026-03-12T11:00:00Z",null,22,null,1),
    s("s29","edu-003","Экзамен Basic1","ДКЦ","U_M0T5B","Королев Денис Владимирович","assigned","2026-03-14T08:00:00Z",null,null,null,null,0),
    s("s30","edu-003","Экзамен Basic1","ДКЦ","U_J3R8P","Орлова Софья Артёмовна","assigned","2026-03-13T08:00:00Z",null,null,null,null,0),
    s("s31","edu-001","Тренажер по кредитным картам","КЦ","U_K4V1S","Баранов Олег Михайлович","assigned","2026-03-14T08:00:00Z",null,null,null,null,0),
    s("s32","edu-002","Тренажер по лояльности с клиентами","ТМ","U_W2K9M","Савельева Мария Сергеевна","assigned","2026-03-15T08:00:00Z",null,null,null,null,0),
    s("s33","edu-002","Тренажер по лояльности с клиентами","ТМ","U_FH18Q","Игнатов Павел Андреевич","assigned","2026-03-12T08:00:00Z",null,null,null,null,0),
    s("s34","edu-004","Экзамен Optimum","SME","U_N2A9F","Чернов Роман Евгеньевич","assigned","2026-03-16T08:00:00Z",null,null,null,null,0),
    s("s35","edu-002","Тренажер по лояльности с клиентами","ТМ","U_Q6Y2N","Филатова Наталья Юрьевна","assigned","2026-03-16T08:00:00Z",null,null,null,null,0),
    // Текущая неделя (17–23 марта 2026)
    s("s36","edu-003","Экзамен Basic1","ДКЦ","U_R7N4X","Климова Ирина Николаевна","completed","2026-03-16T08:00:00Z","2026-03-18T10:00:00Z","2026-03-18T10:44:00Z",44,65,3),
    s("s37","edu-004","Экзамен Optimum","SME","U_R7N4X","Климова Ирина Николаевна","completed","2026-03-18T08:00:00Z","2026-03-20T10:00:00Z","2026-03-20T10:36:00Z",36,79,1),
    s("s38","edu-003","Экзамен Basic1","ДКЦ","U_Z8P3D","Новикова Валерия Олеговна","completed","2026-03-17T08:00:00Z","2026-03-19T10:00:00Z","2026-03-19T10:48:00Z",48,77,2),
    s("s39","edu-004","Экзамен Optimum","SME","U_B5U0K","Елисеев Артем Константинович","completed","2026-03-19T08:00:00Z","2026-03-21T10:00:00Z","2026-03-21T10:35:00Z",35,88,1),
    s("s40","edu-003","Экзамен Basic1","ДКЦ","U_N2A9F","Чернов Роман Евгеньевич","completed","2026-03-20T08:00:00Z","2026-03-22T10:00:00Z","2026-03-22T10:49:00Z",49,92,1),
  ];
}());

const defaultAnalyticsState = {
  period: "month",
  customFrom: "",
  customTo: "",
  status: "all",
  factories: [],
  directions: [],
  selectedCourses: [],
  sortByPopularity: false,
  selectedEmployeeId: null,
  employeeSearchText: "",
};

let analyticsState = { ...defaultAnalyticsState };

const FACTORIES = ['Доставка', 'Урегулирование', 'Сервис', 'Телемаркетинг'];
const DIRECTION_MAP = {
  'Доставка':       ['Малый и микро бизнес', 'Розничный бизнес', 'Универсал', 'Партнёрка'],
  'Урегулирование': ['90-', '90+', 'Выездное'],
  'Сервис':         ['ФЛ Chat', 'ФЛ Voice', 'ЮЛ Chat', 'ЮЛ Voice', 'СвА', 'Эквайринг'],
  'Телемаркетинг':  ['Физ.лица', 'Юр.лица'],
};
const ALL_DIRECTIONS = [...new Set(Object.values(DIRECTION_MAP).flat())];

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
  // Analytics elements
  anDdPeriod: document.getElementById("an-dd-period"),
  anDdPeriodLabel: document.getElementById("an-dd-period-label"),
  anPickerFrom: document.getElementById("an-picker-from"),
  anPickerTo: document.getElementById("an-picker-to"),
  anCalTitle: document.getElementById("an-cal-title"),
  anCalendar: document.getElementById("an-calendar"),
  anDdStatus: document.getElementById("an-dd-status"),
  anDdStatusLabel: document.getElementById("an-dd-status-label"),
  anDdFactory: document.getElementById("an-dd-factory"),
  anDdFactoryLabel: document.getElementById("an-dd-factory-label"),
  anDdFactoryList: document.getElementById("an-dd-factory-list"),
  anFactoryApply: document.getElementById("an-factory-apply"),
  anDdDirection: document.getElementById("an-dd-direction"),
  anDdDirectionLabel: document.getElementById("an-dd-direction-label"),
  anDirApply: document.getElementById("an-dir-apply"),
  anDdCourse: document.getElementById("an-dd-course"),
  anDdCourseLabel: document.getElementById("an-dd-course-label"),
  anDdCourseList: document.getElementById("an-dd-course-list"),
  anCourseApply: document.getElementById("an-course-apply"),
  anSortPopular: document.getElementById("an-sort-popular"),
  anResetBtn: document.getElementById("an-reset-btn"),
  anExportBtn: document.getElementById("an-export-btn"),
  anMAvgTime: document.getElementById("an-m-avg-time"),
  anMAssigned: document.getElementById("an-m-assigned"),
  anMInProgress: document.getElementById("an-m-in-progress"),
  anMCompleted: document.getElementById("an-m-completed"),
  anMAvgScore: document.getElementById("an-m-avg-score"),
  anMAvgAttempts: document.getElementById("an-m-avg-attempts"),
  anEmployeeSearch: document.getElementById("an-employee-search"),
  anEmployeeClear: document.getElementById("an-employee-clear"),
  anEmployeeSuggestions: document.getElementById("an-employee-suggestions"),
  anTableBody: document.getElementById("an-table-body"),
  anEmptyAnalytics: document.getElementById("an-empty-analytics"),
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
  loadAnalyticsState();

  mergeBuilderUnits();
  renderUserBlock();
  renderNav();
  hydrateFilterOptions();
  bindEvents();
  bindWizardEvents();
  bindCropEvents();
  bindAnalyticsEvents();
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
    updatePeriodLabel();
    refreshAnalytics();
    return;
  }

  dom.sectionTitle.textContent = "Админ-панель";
  dom.sectionSubtitle.textContent = "Пользователи и роли доступа к AI-Ментор";
  refreshAdminPanel();
}

function refreshAnalytics() {
  if (!currentUser.rights.canViewAnalytics) {
    dom.analyticsSection.innerHTML = `<div class="an-access-denied"><p>Недостаточно прав для просмотра аналитики.</p></div>`;
    return;
  }

  const sessions = filterAnalyticsSessions();
  const metrics = computeAnalyticsMetrics(sessions);

  dom.anMAvgTime.textContent = formatMinutes(metrics.avgTime);
  dom.anMAssigned.textContent = String(metrics.assigned);
  dom.anMInProgress.textContent = String(metrics.inProgress);
  dom.anMCompleted.textContent = String(metrics.completed);
  dom.anMAvgScore.textContent = metrics.avgScore != null ? String(metrics.avgScore) : "—";
  dom.anMAvgAttempts.textContent = metrics.avgAttempts != null ? String(metrics.avgAttempts) : "—";

  saveAnalyticsState();

  renderAnalyticsTable(sessions);
  syncAnalyticsResetBtn();
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
  return allUnits.filter((unit) => allowed.has(unit.id) || unit.authorId === currentUser.id);
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

// ─── ANALYTICS ───────────────────────────────────────────────────────────────

function getAnalyticsDateRange() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const to = new Date(today);
  to.setHours(23, 59, 59, 999);

  if (analyticsState.period === "custom") {
    const from = analyticsState.customFrom ? new Date(analyticsState.customFrom) : null;
    const toCustom = analyticsState.customTo ? new Date(analyticsState.customTo + "T23:59:59") : null;
    return { from, to: toCustom };
  }

  let from;
  switch (analyticsState.period) {
    case "week": {
      const dow = today.getDay() === 0 ? 6 : today.getDay() - 1; // Пн=0…Вс=6
      from = new Date(today);
      from.setDate(today.getDate() - dow);
      break;
    }
    case "month":
      from = new Date(today.getFullYear(), today.getMonth(), 1);
      break;
    case "quarter": {
      const q = Math.floor(today.getMonth() / 3);
      from = new Date(today.getFullYear(), q * 3, 1);
      break;
    }
    case "year":
      from = new Date(today.getFullYear(), 0, 1);
      break;
    default:
      from = null;
  }
  return { from, to };
}

function getSessionDate(session) {
  if (session.startDate) return new Date(session.startDate);
  if (session.assignedDate) return new Date(session.assignedDate);
  return null;
}

function filterAnalyticsSessions() {
  let sessions = ANALYTICS_SESSIONS.slice();
  const { from, to } = getAnalyticsDateRange();

  if (from || to) {
    sessions = sessions.filter((s) => {
      const d = getSessionDate(s);
      if (!d) return false;
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    });
  }

  if (analyticsState.status !== "all") {
    sessions = sessions.filter((s) => s.status === analyticsState.status);
  }

  if (analyticsState.factories.length > 0) {
    const unitIdsInFactory = allUnits
      .filter((u) => analyticsState.factories.includes(u.factory))
      .map((u) => u.id);
    sessions = sessions.filter((s) => unitIdsInFactory.includes(s.unitId));
  }

  if (analyticsState.directions.length > 0) {
    sessions = sessions.filter((s) => analyticsState.directions.includes(s.direction));
  }

  if (analyticsState.selectedCourses.length > 0) {
    sessions = sessions.filter((s) => analyticsState.selectedCourses.includes(s.unitTitle));
  }

  if (analyticsState.selectedEmployeeId) {
    sessions = sessions.filter((s) => s.employeeId === analyticsState.selectedEmployeeId);
  }

  if (analyticsState.sortByPopularity) {
    const popularity = {};
    ANALYTICS_SESSIONS.forEach((s) => {
      popularity[s.unitId] = (popularity[s.unitId] || 0) + (s.attempts || 0);
    });
    sessions.sort((a, b) => (popularity[b.unitId] || 0) - (popularity[a.unitId] || 0));
  }

  return sessions;
}

// ─── Date helpers ──────────────────────────────────────────────────────────────

function dateToStr(date) {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function strToDate(str) {
  if (!str) return null;
  const parts = str.split("-").map(Number);
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  d.setHours(0, 0, 0, 0);
  return d;
}

// ─── Period picker state & functions ──────────────────────────────────────────

const PERIOD_LABELS = {
  week: "Текущая неделя",
  month: "Текущий месяц",
  quarter: "Текущий квартал",
  year: "Текущий год",
};

const CAL_MONTH_NAMES = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];

let periodPickerState = {
  period: "month",
  customFrom: "",
  customTo: "",
  calYear: new Date().getFullYear(),
  calMonth: new Date().getMonth(),
  isSelecting: false,
};

function getPickerRange() {
  if (periodPickerState.period === "custom") {
    return { from: strToDate(periodPickerState.customFrom), to: strToDate(periodPickerState.customTo) };
  }
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let from;
  switch (periodPickerState.period) {
    case "week": {
      const dow = today.getDay() === 0 ? 6 : today.getDay() - 1;
      from = new Date(today);
      from.setDate(today.getDate() - dow);
      break;
    }
    case "month":
      from = new Date(today.getFullYear(), today.getMonth(), 1);
      break;
    case "quarter": {
      const q = Math.floor(today.getMonth() / 3);
      from = new Date(today.getFullYear(), q * 3, 1);
      break;
    }
    case "year":
      from = new Date(today.getFullYear(), 0, 1);
      break;
    default:
      return { from: null, to: null };
  }
  return { from, to: new Date(today) };
}

function renderCalendar() {
  const year = periodPickerState.calYear;
  const month = periodPickerState.calMonth;
  const { from, to } = getPickerRange();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  dom.anCalTitle.textContent = `${CAL_MONTH_NAMES[month]} ${year}`;

  const firstDay = new Date(year, month, 1);
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const DOW_SHORT = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];
  let html = `<div class="an-cal-grid">`;
  html += DOW_SHORT.map((d) => `<div class="an-cal-dow">${d}</div>`).join("");
  for (let i = 0; i < startDow; i++) html += `<div></div>`;

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateStr = dateToStr(date);
    const toDay0 = to ? new Date(to.getFullYear(), to.getMonth(), to.getDate()) : null;
    const isToday = date.getTime() === today.getTime();
    const isStart = from && date.getTime() === from.getTime();
    const isEnd = toDay0 && date.getTime() === toDay0.getTime();
    const inRange = from && toDay0 && date > from && date < toDay0;

    let cls = "an-cal-day";
    if (isToday) cls += " an-cal-day--today";
    if (isStart) cls += " an-cal-day--start";
    if (isEnd && !isStart) cls += " an-cal-day--end";
    if (inRange) cls += " an-cal-day--in-range";
    html += `<button type="button" class="${cls}" data-date="${dateStr}">${day}</button>`;
  }
  html += `</div>`;
  dom.anCalendar.innerHTML = html;
}

function updatePickerPresets() {
  document.querySelectorAll(".an-preset-btn").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.preset === periodPickerState.period);
  });
}

function updatePickerInputs() {
  const { from, to } = getPickerRange();
  dom.anPickerFrom.value = from ? dateToStr(from) : "";
  dom.anPickerTo.value = to ? dateToStr(to) : "";
}

function updatePeriodPickerUI() {
  updatePickerPresets();
  updatePickerInputs();
  renderCalendar();
}

function openPeriodPicker() {
  periodPickerState.period = analyticsState.period;
  periodPickerState.customFrom = analyticsState.customFrom;
  periodPickerState.customTo = analyticsState.customTo;
  periodPickerState.isSelecting = false;
  const { from } = getPickerRange();
  if (from) {
    periodPickerState.calYear = from.getFullYear();
    periodPickerState.calMonth = from.getMonth();
  } else {
    const now = new Date();
    periodPickerState.calYear = now.getFullYear();
    periodPickerState.calMonth = now.getMonth();
  }
  updatePeriodPickerUI();
  closeAllAnalyticsDds();
  dom.anDdPeriod.classList.add("dd--open");
}

function closePeriodPicker(save) {
  if (save) {
    analyticsState.period = periodPickerState.period;
    analyticsState.customFrom = periodPickerState.customFrom;
    analyticsState.customTo = periodPickerState.customTo;
    updatePeriodLabel();
    refreshAnalytics();
    syncAnalyticsResetBtn();
  }
  dom.anDdPeriod.classList.remove("dd--open");
}

function updatePeriodLabel() {
  if (analyticsState.period === "custom" && analyticsState.customFrom && analyticsState.customTo) {
    const f = strToDate(analyticsState.customFrom);
    const t = strToDate(analyticsState.customTo);
    const fmt = (d) => `${String(d.getDate()).padStart(2,"0")}.${String(d.getMonth()+1).padStart(2,"0")}`;
    dom.anDdPeriodLabel.textContent = `${fmt(f)} — ${fmt(t)}`;
  } else {
    dom.anDdPeriodLabel.textContent = PERIOD_LABELS[analyticsState.period] || "Период";
  }
}

// ─── Analytics state persistence ─────────────────────────────────────────────

function saveAnalyticsState() {
  try { sessionStorage.setItem(ANALYTICS_STATE_KEY, JSON.stringify(analyticsState)); } catch (e) { /* ignore */ }
}

function loadAnalyticsState() {
  try {
    const raw = sessionStorage.getItem(ANALYTICS_STATE_KEY);
    if (raw) analyticsState = { ...defaultAnalyticsState, ...JSON.parse(raw) };
  } catch (e) { /* ignore */ }
}

function restoreAnalyticsUI() {
  updatePeriodLabel();

  const statusRadio = document.querySelector(`input[name="an-status"][value="${analyticsState.status}"]`);
  if (statusRadio) statusRadio.checked = true;
  const statusLabels = { all: "Статус", assigned: "Назначен", in_progress: "В процессе", completed: "Завершён" };
  dom.anDdStatusLabel.textContent = statusLabels[analyticsState.status] || "Статус";

  document.querySelectorAll('input[name="an-factory"]').forEach((cb) => { cb.checked = analyticsState.factories.includes(cb.value); });
  const fLabel = analyticsState.factories.length > 0 ? analyticsState.factories.join(", ") : "Фабрика";
  dom.anDdFactoryLabel.textContent = fLabel.length > 15 ? fLabel.slice(0, 13) + "…" : fLabel;

  populateAnDirectionList(analyticsState.factories);
  document.querySelectorAll('input[name="an-dir"]').forEach((cb) => { cb.checked = analyticsState.directions.includes(cb.value); });
  const dLabel = analyticsState.directions.length > 0 ? analyticsState.directions.join(", ") : "Направление";
  dom.anDdDirectionLabel.textContent = dLabel.length > 15 ? dLabel.slice(0, 13) + "…" : dLabel;

  // Курсы перестраиваем уже с учётом восстановленных фабрик/направлений
  populateAnCourseList();
  // Метка курса (selectedCourses мог быть скорректирован внутри populateAnCourseList)
  const cLabel = analyticsState.selectedCourses.length > 0 ? analyticsState.selectedCourses.join(", ") : "Обучение";
  dom.anDdCourseLabel.textContent = cLabel.length > 18 ? cLabel.slice(0, 16) + "…" : cLabel;

  dom.anSortPopular.checked = analyticsState.sortByPopularity;

  if (analyticsState.employeeSearchText) {
    dom.anEmployeeSearch.value = analyticsState.employeeSearchText;
    dom.anEmployeeClear.classList.remove("hidden");
  }

  syncAnalyticsResetBtn();
}

function computeAnalyticsMetrics(sessions) {
  const assigned = sessions.filter((s) => s.status === "assigned").length;
  const inProgress = sessions.filter((s) => s.status === "in_progress").length;
  const completed = sessions.filter((s) => s.status === "completed").length;

  const activeSessions = sessions.filter((s) => s.activeTimeMinutes != null && s.activeTimeMinutes > 0);
  const avgTime = activeSessions.length > 0
    ? activeSessions.reduce((sum, s) => sum + s.activeTimeMinutes, 0) / activeSessions.length
    : null;

  const scoredSessions = sessions.filter((s) => s.score != null);
  const avgScore = scoredSessions.length > 0
    ? Math.round(scoredSessions.reduce((sum, s) => sum + s.score, 0) / scoredSessions.length)
    : null;

  const attemptedSessions = sessions.filter((s) => s.attempts != null && s.attempts > 0);
  const avgAttempts = attemptedSessions.length > 0
    ? (attemptedSessions.reduce((sum, s) => sum + s.attempts, 0) / attemptedSessions.length).toFixed(1)
    : null;

  return { assigned, inProgress, completed, avgTime, avgScore, avgAttempts };
}

function formatMinutes(minutes) {
  if (minutes == null) return "—";
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h > 0) return m > 0 ? `${h} ч ${m} мин` : `${h} ч`;
  return `${m} мин`;
}

function formatDate(isoString) {
  if (!isoString) return "—";
  return new Date(isoString).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function getStatusLabel(status) {
  const map = { assigned: "Назначен", in_progress: "В процессе", completed: "Завершён" };
  return map[status] || status;
}

function getStatusClass(status) {
  const map = { assigned: "an-status--assigned", in_progress: "an-status--progress", completed: "an-status--done" };
  return map[status] || "";
}

function renderAnalyticsTable(sessions) {
  dom.anTableBody.innerHTML = "";

  if (sessions.length === 0) {
    dom.anEmptyAnalytics.classList.remove("hidden");
    return;
  }
  dom.anEmptyAnalytics.classList.add("hidden");

  // Group by unitId, preserving order of first occurrence
  const order = [];
  const groups = {};
  sessions.forEach((s) => {
    if (!groups[s.unitId]) {
      order.push(s.unitId);
      const unit = allUnits.find((u) => u.id === s.unitId);
      groups[s.unitId] = {
        unitId: s.unitId,
        unitTitle: s.unitTitle,
        factory: unit ? (unit.factory || "—") : "—",
        sessions: [],
        directions: new Set(),
      };
    }
    groups[s.unitId].sessions.push(s);
    if (s.direction) groups[s.unitId].directions.add(s.direction);
  });

  order.forEach((unitId) => {
    const g = groups[unitId];
    const dirs = [...g.directions].join(", ") || "—";

    // ── Unit row ──────────────────────────────────────────────
    const unitTr = document.createElement("tr");
    unitTr.className = "an-unit-row";
    unitTr.dataset.unitId = unitId;
    unitTr.innerHTML = `
      <td><button type="button" class="an-expand-btn" aria-expanded="false">▶</button></td>
      <td class="an-unit-cell">${escapeHtml(g.unitTitle)}</td>
      <td><span class="an-factory-badge">${escapeHtml(g.factory)}</span></td>
      <td><span class="an-direction-badge">${escapeHtml(dirs)}</span></td>
      <td>${g.sessions.length}<span class="an-session-count"> сес.</span></td>
    `;
    dom.anTableBody.appendChild(unitTr);

    // ── Detail row (hidden) ───────────────────────────────────
    const detailTr = document.createElement("tr");
    detailTr.className = "an-detail-row hidden";
    detailTr.dataset.unitId = unitId;

    const detailRows = g.sessions.map((s) => `
      <tr>
        <td>${escapeHtml(s.employeeName)}</td>
        <td><code>${escapeHtml(s.employeeId)}</code></td>
        <td>${s.startDate ? formatDate(s.startDate) : (s.assignedDate ? formatDate(s.assignedDate) : "—")}</td>
        <td>${s.endDate ? formatDate(s.endDate) : "—"}</td>
        <td>${s.activeTimeMinutes != null && s.activeTimeMinutes > 0 ? formatMinutes(s.activeTimeMinutes) : "—"}</td>
        <td><span class="an-status ${getStatusClass(s.status)}">${escapeHtml(getStatusLabel(s.status))}</span></td>
        <td>${s.score != null ? s.score : "—"}</td>
        <td>${s.attempts != null && s.attempts > 0 ? s.attempts : "—"}</td>
      </tr>
    `).join("");

    detailTr.innerHTML = `
      <td colspan="5">
        <div class="an-detail-wrap">
          <table class="an-detail-table">
            <thead>
              <tr>
                <th>ФИО</th><th>User</th><th>Дата начала</th><th>Дата завершения</th>
                <th>Активное время</th><th>Статус</th><th>Балл</th><th>Попытки</th>
              </tr>
            </thead>
            <tbody>${detailRows}</tbody>
          </table>
        </div>
      </td>
    `;
    dom.anTableBody.appendChild(detailTr);

    // Toggle expand on click
    unitTr.addEventListener("click", () => {
      const btn = unitTr.querySelector(".an-expand-btn");
      const opening = !btn.classList.contains("is-open");
      btn.classList.toggle("is-open", opening);
      btn.textContent = opening ? "▼" : "▶";
      btn.setAttribute("aria-expanded", String(opening));
      detailTr.classList.toggle("hidden", !opening);
    });
  });
}

function isAnalyticsDefault() {
  return analyticsState.period === "month" &&
    analyticsState.status === "all" &&
    analyticsState.factories.length === 0 &&
    analyticsState.directions.length === 0 &&
    analyticsState.selectedCourses.length === 0 &&
    !analyticsState.sortByPopularity &&
    !analyticsState.selectedEmployeeId;
}

function syncAnalyticsResetBtn() {
  dom.anResetBtn.classList.toggle("hidden", isAnalyticsDefault());
}

function resetAnalytics() {
  analyticsState = { ...defaultAnalyticsState };

  updatePeriodLabel();

  const allRadio = document.querySelector('input[name="an-status"][value="all"]');
  if (allRadio) allRadio.checked = true;
  dom.anDdStatusLabel.textContent = "Статус";

  document.querySelectorAll('#an-dd-factory-list input').forEach((cb) => { cb.checked = false; });
  dom.anDdFactoryLabel.textContent = "Фабрика";

  populateAnDirectionList([]);
  dom.anDdDirectionLabel.textContent = "Направление";

  populateAnCourseList();
  dom.anDdCourseLabel.textContent = "Обучение";
  dom.anSortPopular.checked = false;

  dom.anEmployeeSearch.value = "";
  dom.anEmployeeClear.classList.add("hidden");
  dom.anEmployeeSuggestions.classList.add("hidden");

  closeAllAnalyticsDds();
  closePeriodPicker(false);
  refreshAnalytics();
  saveAnalyticsState();
}

function exportAnalyticsExcel() {
  const sessions = filterAnalyticsSessions();

  if (sessions.length === 0) {
    // eslint-disable-next-line no-alert
    alert("Нет данных для экспорта по текущим фильтрам.");
    return;
  }

  const headers = ["ФИО", "User", "Тренажёр", "Направление", "Дата начала", "Дата завершения", "Активное время (мин)", "Статус", "Балл", "Попытки"];
  const rows = sessions.map((s) => [
    s.employeeName,
    s.employeeId,
    s.unitTitle,
    s.direction,
    s.startDate ? formatDate(s.startDate) : (s.assignedDate ? formatDate(s.assignedDate) : ""),
    s.endDate ? formatDate(s.endDate) : "",
    s.activeTimeMinutes != null && s.activeTimeMinutes > 0 ? s.activeTimeMinutes : "",
    getStatusLabel(s.status),
    s.score != null ? s.score : "",
    s.attempts != null && s.attempts > 0 ? s.attempts : "",
  ]);

  if (typeof XLSX !== "undefined") {
    const wsData = [headers, ...rows];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws["!cols"] = [
      { wch: 30 }, { wch: 12 }, { wch: 35 }, { wch: 10 },
      { wch: 13 }, { wch: 16 }, { wch: 18 }, { wch: 12 },
      { wch: 8 }, { wch: 10 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, "Аналитика");
    XLSX.writeFile(wb, "analytics.xlsx");
  } else {
    // Fallback: CSV with UTF-8 BOM
    const csvRows = [headers, ...rows].map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    );
    const blob = new Blob(["\uFEFF" + csvRows.join("\r\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "analytics.csv";
    a.click();
    URL.revokeObjectURL(url);
  }
}

function getAnalyticsEmployeeSuggestions(query) {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  const seen = new Set();
  const results = [];
  ANALYTICS_SESSIONS.forEach((s) => {
    if (!seen.has(s.employeeId) &&
        (s.employeeName.toLowerCase().includes(q) || s.employeeId.toLowerCase().includes(q))) {
      seen.add(s.employeeId);
      results.push({ id: s.employeeId, name: s.employeeName });
    }
  });
  return results.slice(0, 6);
}

function showEmployeeSuggestions(suggestions) {
  if (suggestions.length === 0) {
    dom.anEmployeeSuggestions.classList.add("hidden");
    return;
  }
  dom.anEmployeeSuggestions.innerHTML = suggestions.map((emp) =>
    `<button type="button" class="an-suggestion-item" data-empid="${escapeHtml(emp.id)}">${escapeHtml(emp.name)}<span class="an-sug-userid">${escapeHtml(emp.id)}</span></button>`
  ).join("");
  dom.anEmployeeSuggestions.classList.remove("hidden");
}

function selectAnalyticsEmployee(empId) {
  const session = ANALYTICS_SESSIONS.find((s) => s.employeeId === empId);
  if (!session) return;
  analyticsState.selectedEmployeeId = empId;
  analyticsState.employeeSearchText = session.employeeName;
  dom.anEmployeeSearch.value = session.employeeName;
  dom.anEmployeeSuggestions.classList.add("hidden");
  dom.anEmployeeClear.classList.remove("hidden");
  refreshAnalytics();
  saveAnalyticsState();
}

function clearAnalyticsEmployee() {
  analyticsState.selectedEmployeeId = null;
  analyticsState.employeeSearchText = "";
  dom.anEmployeeSearch.value = "";
  dom.anEmployeeClear.classList.add("hidden");
  dom.anEmployeeSuggestions.classList.add("hidden");
  refreshAnalytics();
  saveAnalyticsState();
}

function closeAllAnalyticsDds() {
  document.querySelectorAll("#an-toolbar .dd--open").forEach((d) => d.classList.remove("dd--open"));
}

function bindAnalyticsDd(ddEl) {
  const trigger = ddEl.querySelector(".dd__trigger");
  if (!trigger) return;
  trigger.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = ddEl.classList.contains("dd--open");
    closeAllAnalyticsDds();
    if (!isOpen) ddEl.classList.add("dd--open");
  });
}

function populateAnFactoryList() {
  dom.anDdFactoryList.innerHTML = FACTORIES.map((f) =>
    `<label class="dd__check-item"><input type="checkbox" name="an-factory" value="${escapeHtml(f)}" /> ${escapeHtml(f)}</label>`
  ).join("");
}

function populateAnDirectionList(selectedFactories) {
  const dirs = (!selectedFactories || selectedFactories.length === 0)
    ? ALL_DIRECTIONS
    : [...new Set(selectedFactories.flatMap((f) => DIRECTION_MAP[f] || []))];
  const list = document.getElementById("an-dd-direction-list");
  if (!list) return;
  list.innerHTML = dirs.map((d) =>
    `<label class="dd__check-item"><input type="checkbox" name="an-dir" value="${escapeHtml(d)}" /> ${escapeHtml(d)}</label>`
  ).join("");
}

function populateAnCourseList() {
  let units = allUnits.slice();

  if (analyticsState.factories.length > 0) {
    units = units.filter((u) => analyticsState.factories.includes(u.factory));
  }

  if (analyticsState.directions.length > 0) {
    const unitIdsWithDir = new Set(
      ANALYTICS_SESSIONS
        .filter((s) => analyticsState.directions.includes(s.direction))
        .map((s) => s.unitId)
    );
    units = units.filter((u) => unitIdsWithDir.has(u.id));
  }

  const titles = [...new Set(units.map((u) => u.title))].sort((a, b) => a.localeCompare(b, "ru"));

  dom.anDdCourseList.innerHTML = titles.length > 0
    ? titles.map((t) =>
        `<label class="dd__check-item"><input type="checkbox" name="an-course" value="${escapeHtml(t)}" /> ${escapeHtml(t)}</label>`
      ).join("")
    : `<p style="padding:10px 12px;font-size:13px;color:var(--muted)">Нет обучений по выбранным фильтрам</p>`;

  // Убираем ранее выбранные курсы, которые больше не входят в список
  if (analyticsState.selectedCourses.length > 0) {
    analyticsState.selectedCourses = analyticsState.selectedCourses.filter((c) => titles.includes(c));
    const cLabel = analyticsState.selectedCourses.length > 0 ? analyticsState.selectedCourses.join(", ") : "Обучение";
    dom.anDdCourseLabel.textContent = cLabel.length > 18 ? cLabel.slice(0, 16) + "…" : cLabel;
  }

  // Восстанавливаем чекбоксы для ранее выбранных (если они ещё в списке)
  if (analyticsState.selectedCourses.length > 0) {
    document.querySelectorAll('input[name="an-course"]').forEach((cb) => {
      cb.checked = analyticsState.selectedCourses.includes(cb.value);
    });
  }
}

function bindAnalyticsEvents() {
  [dom.anDdStatus, dom.anDdFactory, dom.anDdDirection, dom.anDdCourse].forEach(bindAnalyticsDd);

  populateAnFactoryList();
  populateAnDirectionList([]);
  populateAnCourseList();
  restoreAnalyticsUI();

  // ── Period picker ──────────────────────────────────────────
  dom.anDdPeriod.querySelector(".dd__trigger").addEventListener("click", (e) => {
    e.stopPropagation();
    if (dom.anDdPeriod.classList.contains("dd--open")) {
      closePeriodPicker(false);
    } else {
      openPeriodPicker();
    }
  });

  document.querySelectorAll(".an-preset-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      periodPickerState.period = btn.dataset.preset;
      periodPickerState.customFrom = "";
      periodPickerState.customTo = "";
      periodPickerState.isSelecting = false;
      updatePeriodPickerUI();
    });
  });

  dom.anPickerFrom.addEventListener("change", () => {
    periodPickerState.customFrom = dom.anPickerFrom.value;
    if (periodPickerState.customFrom) { periodPickerState.period = "custom"; updatePickerPresets(); }
    renderCalendar();
  });

  dom.anPickerTo.addEventListener("change", () => {
    periodPickerState.customTo = dom.anPickerTo.value;
    if (periodPickerState.customTo) { periodPickerState.period = "custom"; updatePickerPresets(); }
    renderCalendar();
  });

  document.getElementById("an-cal-prev").addEventListener("click", () => {
    periodPickerState.calMonth--;
    if (periodPickerState.calMonth < 0) { periodPickerState.calMonth = 11; periodPickerState.calYear--; }
    renderCalendar();
  });

  document.getElementById("an-cal-next").addEventListener("click", () => {
    periodPickerState.calMonth++;
    if (periodPickerState.calMonth > 11) { periodPickerState.calMonth = 0; periodPickerState.calYear++; }
    renderCalendar();
  });

  dom.anCalendar.addEventListener("click", (e) => {
    const dayBtn = e.target.closest(".an-cal-day");
    if (!dayBtn) return;
    const dateStr = dayBtn.dataset.date;
    if (!periodPickerState.isSelecting) {
      periodPickerState.customFrom = dateStr;
      periodPickerState.customTo = "";
      periodPickerState.period = "custom";
      periodPickerState.isSelecting = true;
    } else {
      const from = strToDate(periodPickerState.customFrom);
      const clicked = strToDate(dateStr);
      if (clicked < from) {
        periodPickerState.customTo = periodPickerState.customFrom;
        periodPickerState.customFrom = dateStr;
      } else {
        periodPickerState.customTo = dateStr;
      }
      periodPickerState.isSelecting = false;
    }
    updatePeriodPickerUI();
  });

  document.getElementById("an-period-save").addEventListener("click", () => closePeriodPicker(true));
  document.getElementById("an-period-close").addEventListener("click", () => closePeriodPicker(false));

  document.addEventListener("click", (e) => {
    if (!e.target.closest("#an-dd-period")) closePeriodPicker(false);
    if (!e.target.closest("#an-toolbar .dd")) closeAllAnalyticsDds();
  });

  // ── Factory ────────────────────────────────────────────────
  dom.anFactoryApply.addEventListener("click", () => {
    analyticsState.factories = [...document.querySelectorAll('input[name="an-factory"]:checked')].map((cb) => cb.value);
    const label = analyticsState.factories.length > 0 ? analyticsState.factories.join(", ") : "Фабрика";
    dom.anDdFactoryLabel.textContent = label.length > 15 ? label.slice(0, 13) + "…" : label;
    populateAnDirectionList(analyticsState.factories);
    analyticsState.directions = [];
    dom.anDdDirectionLabel.textContent = "Направление";
    populateAnCourseList();
    closeAllAnalyticsDds();
    refreshAnalytics();
    syncAnalyticsResetBtn();
    saveAnalyticsState();
  });

  // ── Status ─────────────────────────────────────────────────
  document.querySelectorAll('input[name="an-status"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      analyticsState.status = radio.value;
      const labels = { all: "Статус", assigned: "Назначен", in_progress: "В процессе", completed: "Завершён" };
      dom.anDdStatusLabel.textContent = labels[radio.value] || "Статус";
      closeAllAnalyticsDds();
      refreshAnalytics();
      saveAnalyticsState();
    });
  });

  // ── Direction ──────────────────────────────────────────────
  dom.anDirApply.addEventListener("click", () => {
    analyticsState.directions = [...document.querySelectorAll('input[name="an-dir"]:checked')].map((cb) => cb.value);
    const label = analyticsState.directions.length > 0 ? analyticsState.directions.join(", ") : "Направление";
    dom.anDdDirectionLabel.textContent = label.length > 15 ? label.slice(0, 13) + "…" : label;
    populateAnCourseList();
    closeAllAnalyticsDds();
    refreshAnalytics();
    syncAnalyticsResetBtn();
    saveAnalyticsState();
  });

  // ── Course ─────────────────────────────────────────────────
  dom.anCourseApply.addEventListener("click", () => {
    analyticsState.selectedCourses = [...document.querySelectorAll('input[name="an-course"]:checked')].map((cb) => cb.value);
    const label = analyticsState.selectedCourses.length > 0 ? analyticsState.selectedCourses.join(", ") : "Обучение";
    dom.anDdCourseLabel.textContent = label.length > 18 ? label.slice(0, 16) + "…" : label;
    closeAllAnalyticsDds();
    refreshAnalytics();
    syncAnalyticsResetBtn();
    saveAnalyticsState();
  });

  // ── Popularity sort ────────────────────────────────────────
  dom.anSortPopular.addEventListener("change", () => {
    analyticsState.sortByPopularity = dom.anSortPopular.checked;
    refreshAnalytics();
    saveAnalyticsState();
  });

  dom.anResetBtn.addEventListener("click", resetAnalytics);
  dom.anExportBtn.addEventListener("click", exportAnalyticsExcel);

  // ── Employee search ────────────────────────────────────────
  dom.anEmployeeSearch.addEventListener("input", () => {
    const q = dom.anEmployeeSearch.value.trim();
    if (!q) { clearAnalyticsEmployee(); return; }
    analyticsState.employeeSearchText = q;
    showEmployeeSuggestions(getAnalyticsEmployeeSuggestions(q));
    dom.anEmployeeClear.classList.toggle("hidden", !q);
  });

  dom.anEmployeeSuggestions.addEventListener("click", (e) => {
    const item = e.target.closest(".an-suggestion-item");
    if (!item) return;
    selectAnalyticsEmployee(item.dataset.empid);
  });

  dom.anEmployeeClear.addEventListener("click", clearAnalyticsEmployee);

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".an-employee-bar")) dom.anEmployeeSuggestions.classList.add("hidden");
  });

  dom.anEmptyAnalytics.addEventListener("click", (e) => {
    if (e.target.closest(".an-inline-reset")) resetAnalytics();
  });
}

init();
