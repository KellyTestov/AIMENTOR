/**
 * ══════════════════════════════════════════════════
 * Mock Analytics Data
 * ══════════════════════════════════════════════════
 * 
 * Тестовые данные аналитики для отчётов.
 */

/**
 * Создаёт объект сессии аналитики
 * @param {string} id - ID сессии
 * @param {string} unitId - ID единицы обучения
 * @param {string} unitTitle - Название единицы
 * @param {string} direction - Направление
 * @param {string} employeeId - ID сотрудника
 * @param {string} employeeName - Имя сотрудника
 * @param {string} status - Статус
 * @param {string} assignedDate - Дата назначения
 * @param {string} startDate - Дата начала
 * @param {string} endDate - Дата завершения
 * @param {number} activeTimeMinutes - Время в минутах
 * @param {number|null} score - Баллы
 * @param {number} attempts - Попытки
 * @returns {Object} Объект сессии
 */
function createSession(id, unitId, unitTitle, direction, employeeId, employeeName, status, assignedDate, startDate, endDate, activeTimeMinutes, score, attempts) {
  return {
    id,
    unitId,
    unitTitle,
    direction,
    employeeId,
    employeeName,
    status,
    assignedDate,
    startDate,
    endDate,
    activeTimeMinutes,
    score,
    attempts,
  };
}

/**
 * Mock-данные сессий аналитики
 * @type {Array<Object>}
 */
export const MOCK_ANALYTICS_SESSIONS = [
  // Январь 2026
  createSession("s01", "edu-001", "Тренажер по кредитным картам", "КЦ", "U_QD7RZ", "Рожков Александр Игоревич", "completed", "2026-01-18T08:00:00Z", "2026-01-20T09:15:00Z", "2026-01-20T10:20:00Z", 65, null, 1),
  createSession("s02", "edu-003", "Экзамен Basic1", "ДКЦ", "U_W2K9M", "Савельева Мария Сергеевна", "completed", "2026-01-10T08:00:00Z", "2026-01-15T10:00:00Z", "2026-01-15T10:50:00Z", 50, 72, 2),
  createSession("s03", "edu-004", "Экзамен Optimum", "SME", "U_FH18Q", "Игнатов Павел Андреевич", "completed", "2026-01-05T08:00:00Z", "2026-01-08T14:00:00Z", "2026-01-08T14:38:00Z", 38, 91, 1),
  createSession("s04", "edu-004", "Экзамен Optimum", "SME", "U_Z8P3D", "Новикова Валерия Олеговна", "completed", "2026-01-22T08:00:00Z", "2026-01-25T11:00:00Z", "2026-01-25T11:33:00Z", 33, 85, 1),
  createSession("s05", "edu-002", "Тренажер по лояльности с клиентами", "ТМ", "U_J3R8P", "Орлова Софья Артёмовна", "completed", "2026-01-08T08:00:00Z", "2026-01-12T09:00:00Z", "2026-01-12T09:58:00Z", 58, null, 1),
  
  // Февраль 2026
  createSession("s06", "edu-002", "Тренажер по лояльности с клиентами", "ТМ", "U_QD7RZ", "Рожков Александр Игоревич", "completed", "2026-02-10T08:00:00Z", "2026-02-14T09:00:00Z", "2026-02-14T09:48:00Z", 48, null, 2),
  createSession("s07", "edu-003", "Экзамен Basic1", "ДКЦ", "U_QD7RZ", "Рожков Александр Игоревич", "completed", "2026-02-16T08:00:00Z", "2026-02-20T10:00:00Z", "2026-02-20T10:42:00Z", 42, 88, 1),
  createSession("s08", "edu-001", "Тренажер по кредитным картам", "КЦ", "U_W2K9M", "Савельева Мария Сергеевна", "completed", "2026-02-06T08:00:00Z", "2026-02-10T09:30:00Z", "2026-02-10T10:40:00Z", 70, null, 1),
  createSession("s09", "edu-001", "Тренажер по кредитным картам", "КЦ", "U_M0T5B", "Королев Денис Владимирович", "completed", "2026-02-04T08:00:00Z", "2026-02-08T13:00:00Z", "2026-02-08T14:00:00Z", 60, null, 1),
  createSession("s10", "edu-002", "Тренажер по лояльности с клиентами", "ТМ", "U_K4V1S", "Баранов Олег Михайлович", "completed", "2026-02-12T08:00:00Z", "2026-02-16T09:00:00Z", "2026-02-16T09:55:00Z", 55, null, 1),
  createSession("s11", "edu-003", "Экзамен Basic1", "ДКЦ", "U_K4V1S", "Баранов Олег Михайлович", "completed", "2026-02-18T08:00:00Z", "2026-02-22T10:00:00Z", "2026-02-22T10:51:00Z", 51, 94, 1),
  createSession("s12", "edu-003", "Экзамен Basic1", "ДКЦ", "U_H9C7L", "Пахомов Евгений Александрович", "completed", "2026-02-08T08:00:00Z", "2026-02-12T10:00:00Z", "2026-02-12T10:46:00Z", 46, 83, 1),
  createSession("s13", "edu-001", "Тренажер по кредитным картам", "КЦ", "U_J3R8P", "Орлова Софья Артёмовна", "completed", "2026-02-14T08:00:00Z", "2026-02-18T10:00:00Z", "2026-02-18T11:07:00Z", 67, null, 1),
  createSession("s14", "edu-003", "Экзамен Basic1", "ДКЦ", "U_B5U0K", "Елисеев Артем Константинович", "completed", "2026-02-20T08:00:00Z", "2026-02-24T10:00:00Z", "2026-02-24T10:44:00Z", 44, 76, 2),
  createSession("s15", "edu-002", "Тренажер по лояльности с клиентами", "ТМ", "U_P7E4J", "Егорова Татьяна Борисовна", "completed", "2026-02-02T08:00:00Z", "2026-02-06T09:00:00Z", "2026-02-06T09:45:00Z", 45, null, 1),
  createSession("s16", "edu-001", "Тренажер по кредитным картам", "КЦ", "U_FH18Q", "Игнатов Павел Андреевич", "in_progress", "2026-02-22T08:00:00Z", "2026-02-25T11:00:00Z", null, 35, null, 1),
  
  // Март 2026 (1–16)
  createSession("s17", "edu-004", "Экзамен Optimum", "SME", "U_QD7RZ", "Рожков Александр Игоревич", "in_progress", "2026-03-08T08:00:00Z", "2026-03-10T14:00:00Z", null, 20, null, 1),
  createSession("s18", "edu-001", "Тренажер по кредитным картам", "КЦ", "U_Q6Y2N", "Филатова Наталья Юрьевна", "completed", "2026-03-01T08:00:00Z", "2026-03-03T10:00:00Z", "2026-03-03T11:03:00Z", 63, null, 1),
  createSession("s19", "edu-002", "Тренажер по лояльности с клиентами", "ТМ", "U_M0T5B", "Королев Денис Владимирович", "completed", "2026-03-03T08:00:00Z", "2026-03-05T09:00:00Z", "2026-03-05T09:52:00Z", 52, null, 1),
  createSession("s20", "edu-001", "Тренажер по кредитным картам", "КЦ", "U_T1M6V", "Громова Ксения Дмитриевна", "completed", "2026-03-02T08:00:00Z", "2026-03-04T10:00:00Z", "2026-03-04T11:01:00Z", 61, null, 1),
  createSession("s21", "edu-001", "Тренажер по кредитным картам", "КЦ", "U_P7E4J", "Егорова Татьяна Борисовна", "completed", "2026-03-04T08:00:00Z", "2026-03-06T09:00:00Z", "2026-03-06T09:59:00Z", 59, null, 1),
  createSession("s22", "edu-004", "Экзамен Optimum", "SME", "U_H9C7L", "Пахомов Евгений Александрович", "completed", "2026-03-05T08:00:00Z", "2026-03-07T10:00:00Z", "2026-03-07T10:40:00Z", 40, 70, 2),
  createSession("s23", "edu-004", "Экзамен Optimum", "SME", "U_P7E4J", "Егорова Татьяна Борисовна", "completed", "2026-03-06T08:00:00Z", "2026-03-08T10:00:00Z", "2026-03-08T10:41:00Z", 41, 81, 1),
  createSession("s24", "edu-001", "Тренажер по кредитным картам", "КЦ", "U_Z8P3D", "Новикова Валерия Олеговна", "in_progress", "2026-03-06T08:00:00Z", "2026-03-08T11:00:00Z", null, 28, null, 1),
  createSession("s25", "edu-001", "Тренажер по кредитным картам", "КЦ", "U_H9C7L", "Пахомов Евгений Александрович", "in_progress", "2026-03-07T08:00:00Z", "2026-03-09T09:00:00Z", null, 30, null, 1),
  createSession("s26", "edu-001", "Тренажер по кредитным картам", "КЦ", "U_N2A9F", "Чернов Роман Евгеньевич", "in_progress", "2026-03-08T08:00:00Z", "2026-03-10T10:00:00Z", null, 15, null, 1),
  createSession("s27", "edu-004", "Экзамен Optimum", "SME", "U_Q6Y2N", "Филатова Наталья Юрьевна", "in_progress", "2026-03-09T08:00:00Z", "2026-03-11T14:00:00Z", null, 18, null, 1),
  createSession("s28", "edu-002", "Тренажер по лояльности с клиентами", "ТМ", "U_T1M6V", "Громова Ксения Дмитриевна", "in_progress", "2026-03-10T08:00:00Z", "2026-03-12T11:00:00Z", null, 22, null, 1),
  createSession("s29", "edu-003", "Экзамен Basic1", "ДКЦ", "U_M0T5B", "Королев Денис Владимирович", "assigned", "2026-03-14T08:00:00Z", null, null, null, null, 0),
  createSession("s30", "edu-003", "Экзамен Basic1", "ДКЦ", "U_J3R8P", "Орлова Софья Артёмовна", "assigned", "2026-03-13T08:00:00Z", null, null, null, null, 0),
  createSession("s31", "edu-001", "Тренажер по кредитным картам", "КЦ", "U_K4V1S", "Баранов Олег Михайлович", "assigned", "2026-03-14T08:00:00Z", null, null, null, null, 0),
  createSession("s32", "edu-002", "Тренажер по лояльности с клиентами", "ТМ", "U_W2K9M", "Савельева Мария Сергеевна", "assigned", "2026-03-15T08:00:00Z", null, null, null, null, 0),
  createSession("s33", "edu-002", "Тренажер по лояльности с клиентами", "ТМ", "U_FH18Q", "Игнатов Павел Андреевич", "assigned", "2026-03-12T08:00:00Z", null, null, null, null, 0),
  createSession("s34", "edu-004", "Экзамен Optimum", "SME", "U_N2A9F", "Чернов Роман Евгеньевич", "assigned", "2026-03-16T08:00:00Z", null, null, null, null, 0),
  createSession("s35", "edu-002", "Тренажер по лояльности с клиентами", "ТМ", "U_Q6Y2N", "Филатова Наталья Юрьевна", "assigned", "2026-03-16T08:00:00Z", null, null, null, null, 0),
  
  // Текущая неделя (17–23 марта 2026)
  createSession("s36", "edu-003", "Экзамен Basic1", "ДКЦ", "U_R7N4X", "Климова Ирина Николаевна", "completed", "2026-03-16T08:00:00Z", "2026-03-18T10:00:00Z", "2026-03-18T10:44:00Z", 44, 65, 3),
  createSession("s37", "edu-004", "Экзамен Optimum", "SME", "U_R7N4X", "Климова Ирина Николаевна", "completed", "2026-03-18T08:00:00Z", "2026-03-20T10:00:00Z", "2026-03-20T10:36:00Z", 36, 79, 1),
  createSession("s38", "edu-003", "Экзамен Basic1", "ДКЦ", "U_Z8P3D", "Новикова Валерия Олеговна", "completed", "2026-03-17T08:00:00Z", "2026-03-19T10:00:00Z", "2026-03-19T10:48:00Z", 48, 77, 2),
  createSession("s39", "edu-004", "Экзамен Optimum", "SME", "U_B5U0K", "Елисеев Артем Константинович", "completed", "2026-03-19T08:00:00Z", "2026-03-21T10:00:00Z", "2026-03-21T10:35:00Z", 35, 88, 1),
  createSession("s40", "edu-003", "Экзамен Basic1", "ДКЦ", "U_N2A9F", "Чернов Роман Евгеньевич", "completed", "2026-03-20T08:00:00Z", "2026-03-22T10:00:00Z", "2026-03-22T10:49:00Z", 49, 92, 1),
];

/**
 * Статусы сессий
 * @type {Object}
 */
export const SESSION_STATUSES = {
  ASSIGNED: "assigned",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
};

/**
 * Названия статусов на русском
 * @type {Object}
 */
export const SESSION_STATUS_LABELS = {
  [SESSION_STATUSES.ASSIGNED]: "Назначено",
  [SESSION_STATUSES.IN_PROGRESS]: "В процессе",
  [SESSION_STATUSES.COMPLETED]: "Завершено",
};

/**
 * Получить сессии аналитики
 * @param {Object} bootstrap - Bootstrap-данные
 * @returns {Array<Object>} Массив сессий
 */
export function getAnalyticsSessions(bootstrap) {
  return bootstrap?.analyticsSessions || [...MOCK_ANALYTICS_SESSIONS];
}

/**
 * Состояние аналитики по умолчанию
 * @type {Object}
 */
export const DEFAULT_ANALYTICS_STATE = {
  period: "month",
  customFrom: "",
  customTo: "",
  status: "all",
  factories: [],
  directions: [],
  unitSearch: "",
  sortByPopularity: false,
  selectedEmployeeId: null,
  employeeSearchText: "",
};
