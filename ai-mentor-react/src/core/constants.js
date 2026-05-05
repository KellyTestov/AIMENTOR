/**
 * ══════════════════════════════════════════════════
 * AI-Ментор · Общие константы
 * ══════════════════════════════════════════════════
 * 
 * Единственный источник всех констант для всех бизнес-компонент.
 * Импортируйте отсюда, а не дублируйте в каждом файле.
 */

/* ── Ключи хранилища ───────────────────────────────── */
export const STORAGE_KEYS = {
  CATALOG_STATE: 'ai-mentor-catalog-state-v1',
  ACCESS_USERS: 'ai-mentor-access-users-v1',
  WIZARD: 'ai-mentor-wizard-v2',
  BUILDER_DATA: 'ai-mentor-builder-data-v1',
  SANDBOX_SESSION: 'ai-mentor-sandbox-session-v1',
  ERROR_FLAG: 'sb-error-flag',
};

/* ── Направления по фабрикам ────────────────────────── */
export const DIRECTION_MAP = {
  'Доставка': ['Малый и микро бизнес', 'Розничный бизнес'],
  'Урегулирование': ['90-', '90+', 'Выездное'],
  'Сервис': ['ФЛ Chat', 'ФЛ Voice', 'ЮЛ Chat', 'ЮЛ Voice', 'СвА', 'Эквайринг'],
  'Телемаркетинг': ['Физ.лица', 'Юр.лица'],
};

/* ── Все направления (плоский список) ───────────────── */
export const ALL_DIRECTIONS = [...new Set(Object.values(DIRECTION_MAP).flat())];

/* ── Фабрики ────────────────────────────────────────── */
export const FACTORIES = ['Доставка', 'Урегулирование', 'Сервис', 'Телемаркетинг'];

/* ── Темы обучения ──────────────────────────────────── */
export const UNIT_TOPICS = [
  'Продукты банка',
  'Продажи',
  'Коммуникации с клиентами',
  'Кредитование',
  'Карточные продукты',
  'Работа с возражениями',
  'Комплаенс',
  'Управление',
];

/* ── Категории обучения ─────────────────────────────── */
export const UNIT_CATEGORIES = [
  'Продукты',
  'Коммуникации',
  'Продажи',
  'Экзамены',
  'Операционные процессы',
];

/* ── Длительность обучения ──────────────────────────── */
export const UNIT_DURATIONS = [
  '15 минут',
  '30 минут',
  '1 час',
  '1.5 часа',
  '2 часа',
  '2.5 часа',
  '3 часа',
];

/* ── Типы единиц обучения ───────────────────────────── */
export const UNIT_TYPES = {
  TRAINER: 'trainer',
  EXAM: 'exam',
};

export const UNIT_TYPE_LABELS = {
  [UNIT_TYPES.TRAINER]: 'Обучающая',
  [UNIT_TYPES.EXAM]: 'Проверяющая',
};

/* ── Подтипы тренажёра ───────────────────────────────── */
export const TRAINER_SUBTYPES = {
  SKILL: 'skill',
  DIALOG: 'dialog',
  PRODUCT: 'product',
};

export const TRAINER_SUBTYPE_LABELS = {
  [TRAINER_SUBTYPES.SKILL]: 'Навыковый',
  [TRAINER_SUBTYPES.DIALOG]: 'Диалоговый',
  [TRAINER_SUBTYPES.PRODUCT]: 'Продуктовый',
};

/* ── Статусы публикации ─────────────────────────────── */
export const PUBLICATION_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  PRIVATE: 'private',
};

export const PUBLICATION_STATUS_LABELS = {
  [PUBLICATION_STATUS.DRAFT]: 'Черновик',
  [PUBLICATION_STATUS.PUBLISHED]: 'Опубликовано',
  [PUBLICATION_STATUS.PRIVATE]: 'Приватно',
};

/* ── Статусы сессий обучения ────────────────────────── */
export const SESSION_STATUS = {
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
};

export const SESSION_STATUS_LABELS = {
  [SESSION_STATUS.ASSIGNED]: 'Назначено',
  [SESSION_STATUS.IN_PROGRESS]: 'В процессе',
  [SESSION_STATUS.COMPLETED]: 'Завершено',
};

/* ── Бизнес-линии ───────────────────────────────────── */
export const BUSINESS_LINES = [
  'Розничный бизнес',
  'Корпоративный бизнес',
  'Инвестиционный бизнес',
  'Цифровой бизнес',
  'Операционный блок',
  'HR и развитие персонала',
];

/* ── Роли пользователей ─────────────────────────────── */
export const USER_ROLES = {
  SERVICE_TEAM: 'Команда сервиса',
  EDITOR: 'Редактор',
  ADMIN: 'Администратор',
};

/* ── Права доступа ──────────────────────────────────── */
export const USER_RIGHTS = {
  CAN_ACCESS_HOME: 'canAccessHome',
  CAN_VIEW_CATALOG: 'canViewCatalog',
  CAN_VIEW_ANALYTICS: 'canViewAnalytics',
  CAN_MANAGE_USERS: 'canManageUsers',
  CAN_CREATE: 'canCreate',
  IS_ADMIN: 'isAdmin',
};

/* ── Иконки навигации ───────────────────────────────── */
export const NAV_ICONS = {
  catalog: '/mortarboard.png',
  analytics: '/analytics.png',
  admin: '/admin-dashboard.png',
};

/* ── Иконки для дерева конструктора ─────────────────── */
export const NODE_ICONS = {
  unit: '📋',
  module: '📁',
  topic: '📖',
  question: '❓',
  content: '📝',
  clientCard: '💳',
  criteria: '✓',
  hint: '💡',
};

/* ── Обложки по умолчанию ───────────────────────────── */
export const DEFAULT_COVERS = [
  '/premium.jpg',
  '/premium_2.jpg',
  '/MMB-89.png',
  '/RB-34.png',
];

/* ── Периоды аналитики ──────────────────────────────── */
export const ANALYTICS_PERIODS = {
  WEEK: 'week',
  MONTH: 'month',
  QUARTER: 'quarter',
  YEAR: 'year',
  CUSTOM: 'custom',
};

/* ── Форматирование ─────────────────────────────────── */
export const DATE_FORMAT = {
  LOCALE: 'ru-RU',
  DATE_OPTIONS: {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  },
  DATETIME_OPTIONS: {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  },
};

/* ── Секции клиентской карты ────────────────────────── */
export const CLIENT_CARD_SECTIONS = [
  { 
    key: "creditDetails", 
    title: "Детализация по кредитной карте клиента", 
    fields: [
      { key: "nearestPayment", label: "Ближайший платёж", placeholder: "2 200 ₽ до 20.12.2024" },
      { key: "paymentSkip", label: "Пропуск платежа", placeholder: "Не подключен" },
      { key: "totalDebt", label: "Общая задолженность на сегодня", placeholder: "3 140 ₽" },
      { key: "purchases30", label: "Покупки в первые 30 дней", placeholder: "Льготный период не начался" },
      { key: "purchasesFrom31", label: "Покупки с 31 дня и снятие наличных", placeholder: "Льготный период до 28.01.2026" },
      { key: "repayOther", label: "Погашение КК в другом банке", placeholder: "Льготный период не начался" },
      { key: "availableLimit", label: "Доступный лимит", placeholder: "7 860 ₽" },
      { key: "overdueDebt", label: "Просроченная задолженность", placeholder: "0 ₽" },
      { key: "fines", label: "Штрафы и неустойки", placeholder: "0 ₽" },
    ]
  },
  { 
    key: "contractTerms", 
    title: "Общие условия договора", 
    fields: [
      { key: "totalCredit", label: "Общая сумма кредита", placeholder: "11 000 ₽" },
      { key: "agreementDate", label: "Подписание ДС о беспроцентном периоде", placeholder: "16 ноября 2023" },
      { key: "issueDate", label: "Дата выдачи", placeholder: "30 ноября 2023" },
    ]
  },
  { 
    key: "interestRates", 
    title: "Текущие процентные ставки", 
    fields: [
      { key: "rate30", label: "Покупки в первые 30 дней", placeholder: "39,99% годовых" },
      { key: "rateFrom31", label: "Покупки с 31 дня", placeholder: "39,99% годовых" },
      { key: "rateCash", label: "Снятие наличных", placeholder: "49,99% годовых" },
      { key: "rateRepay", label: "Погашение КК в другом банке", placeholder: "49,99% годовых" },
    ]
  },
  { 
    key: "cardInfo", 
    title: "Информация по кредитной карте", 
    fields: [
      { key: "balance", label: "Баланс", placeholder: "7 860 ₽" },
      { key: "serviceCost", label: "Стоимость обслуживания", placeholder: "0 ₽" },
      { key: "cashLimit", label: "Лимит на снятие наличных без комиссии", placeholder: "до 50 000 ₽/мес" },
      { key: "commAlfa", label: "Комиссия за снятие в банкоматах Альфа-Банка", placeholder: "3,9% + 390 ₽" },
      { key: "commOther", label: "Комиссия за снятие в сторонних банкоматах", placeholder: "3,9% + 390 ₽" },
    ]
  },
];

/* ── Типы узлов конструктора ─────────────────────────── */
export const NODE_TYPES = {
  UNIT: 'unit',
  MODULE: 'module',
  TOPIC: 'topic',
  QUESTION: 'question',
  CONTENT: 'content',
  CLIENT_CARD: 'clientCard',
  CRITERIA: 'criteria',
  HINT: 'hint',
};

/* ── Типы вопросов ───────────────────────────────────── */
export const QUESTION_TYPES = {
  SINGLE: 'single',
  MULTIPLE: 'multiple',
  TEXT: 'text',
  ORDER: 'order',
  MATCH: 'match',
};

export const QUESTION_TYPE_LABELS = {
  [QUESTION_TYPES.SINGLE]: 'Один ответ',
  [QUESTION_TYPES.MULTIPLE]: 'Несколько ответов',
  [QUESTION_TYPES.TEXT]: 'Текстовый ответ',
  [QUESTION_TYPES.ORDER]: 'Установление порядка',
  [QUESTION_TYPES.MATCH]: 'Соответствие',
};
