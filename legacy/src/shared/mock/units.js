/**
 * ══════════════════════════════════════════════════
 * Mock Units Data
 * ══════════════════════════════════════════════════
 * 
 * Тестовые данные единиц обучения для каталога.
 */

/**
 * Создаёт объект единицы обучения из параметров
 * @param {Object} params - Параметры единицы
 * @returns {Object} Объект единицы
 */
function createUnit(params) {
  return {
    id: params.id,
    title: params.title,
    type: params.type,
    category: params.category,
    factory: params.factory,
    authorId: params.authorId,
    authorName: params.authorName,
    createdAt: params.createdAt,
    updatedAt: params.updatedAt,
    durationLabel: params.durationLabel,
    publicationStatus: params.publicationStatus,
    launchUrl: params.launchUrl,
    editUrl: params.editUrl,
    coverUrl: params.coverUrl || null,
  };
}

/**
 * Mock-данные единиц обучения
 * @type {Array<Object>}
 */
export const MOCK_UNITS = [
  createUnit({
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
    launchUrl: "./sandbox/?id=edu-001",
    editUrl: "./builder/?id=edu-001",
  }),
  createUnit({
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
    launchUrl: "./sandbox/?id=edu-002",
    editUrl: "./builder/?id=edu-002",
  }),
  createUnit({
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
    launchUrl: "./sandbox/?id=edu-003",
    editUrl: "./builder/?id=edu-003",
  }),
  createUnit({
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
    launchUrl: "./sandbox/?id=edu-004",
    editUrl: "./builder/?id=edu-004",
  }),
];

/**
 * Получить mock-единицы с возможностью слияния с данными из конструктора
 * @param {Object} options - Опции
 * @param {Object} options.currentUser - Текущий пользователь
 * @param {Object} options.bootstrap - Bootstrap-данные
 * @returns {Array<Object>} Массив единиц
 */
export function getUnits({ currentUser, bootstrap } = {}) {
  const bootstrapUnits = bootstrap?.units || [];
  let units = bootstrapUnits.length > 0 ? bootstrapUnits : [...MOCK_UNITS];
  
  // Слияние с данными из конструктора
  units = mergeBuilderUnits(units, currentUser);
  
  return units;
}

/**
 * Сливает единицы из конструктора с существующим списком
 * @param {Array<Object>} units - Существующие единицы
 * @param {Object} currentUser - Текущий пользователь
 * @returns {Array<Object>} Обновлённый массив единиц
 */
export function mergeBuilderUnits(units, currentUser) {
  try {
    const stored = JSON.parse(localStorage.getItem("ai-mentor-builder-data-v1") || "{}");
    const existingIds = new Set(units.map((u) => u.id));
    const result = [...units];

    for (const bu of Object.values(stored)) {
      if (!bu || !bu.id) continue;

      if (existingIds.has(bu.id)) {
        // Обновляем статус публикации для уже известных единиц
        const idx = result.findIndex((u) => u.id === bu.id);
        if (idx !== -1 && bu.publicationStatus) {
          result[idx].publicationStatus = bu.publicationStatus;
        }
      } else {
        // Добавляем новую единицу из конструктора в каталог
        const typeDisplay = bu.type === "trainer" ? "Обучающая" : "Проверяющая";
        result.push(createUnit({
          id: bu.id,
          title: bu.title || "Без названия",
          type: typeDisplay,
          category: bu.category || "",
          factory: bu.factory || "",
          direction: bu.direction || "",
          authorId: bu.authorId || currentUser?.id,
          authorName: bu.authorName || currentUser?.name,
          createdAt: bu.createdAt || new Date().toISOString(),
          updatedAt: bu.updatedAt || new Date().toISOString(),
          durationLabel: bu.durationLabel || "",
          publicationStatus: bu.publicationStatus || "private",
          coverUrl: bu.coverDataUrl || bu.coverUrl || null,
          launchUrl: `https://example.org/alpha-course/learn/${bu.id}`,
          editUrl: `./builder/index.html?id=${bu.id}`,
        }));
        existingIds.add(bu.id);
      }
    }
    
    return result;
  } catch (e) {
    console.warn("mergeBuilderUnits:", e);
    return units;
  }
}

/**
 * URL-адреса обложек для мастера создания
 * @type {Array<string>}
 */
export const PROMPT_COVERS = [
  encodeURI("./premium.jpg"),
  encodeURI("./premium_2.jpg"),
  encodeURI("./MMB-89.png"),
  encodeURI("./RB-34.png"),
];
