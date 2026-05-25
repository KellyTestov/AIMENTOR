/**
 * ══════════════════════════════════════════════════
 * Mock Users Data
 * ══════════════════════════════════════════════════
 *
 * Тестовые данные пользователей и прав доступа.
 * Использует 7-уровневую модель (level: 0..6).
 *
 * Поля:
 *   adminId      — порядковый внутренний ID (1, 2, 3, ...)
 *   userId       — корпоративный ID (U_XXXXX)
 *   fullName     — ФИО
 *   level        — уровень доступа 0..6
 *   registeredAt — дата регистрации ISO
 *   requestedAt  — для L0: дата подачи заявки
 *   isProtected  — защищённый пользователь
 *   isDeveloper  — разработчик сервиса
 */

import { User } from '../models/user.js';
import { ROLE_LEVELS, levelToRights, getRoleLevel } from '../../core/constants.js';

/**
 * Защищённые сервисные пользователи (всегда уровень 6 — Специальный администратор).
 */
export const REQUIRED_SERVICE_USERS = [
  {
    adminId: 1,
    fullName: "Плишкин Роман Валерьевич",
    userId: "U_DD7RZ",
    level: 6,
    role: "Команда сервиса",
    isProtected: true,
    isDeveloper: true,
    registeredAt: "2023-01-15T10:00:00Z",
    businessLine: "global",
  },
  {
    adminId: 2,
    fullName: "Голощапов Кирилл Юрьевич",
    userId: "U_KG4H1",
    level: 6,
    role: "Команда сервиса",
    isProtected: true,
    isDeveloper: true,
    registeredAt: "2023-01-15T10:00:00Z",
    businessLine: "global",
  },
  {
    adminId: 3,
    fullName: "Манафов Дмитрий Русланович",
    userId: "U_DM8Q2",
    level: 6,
    role: "Команда сервиса",
    isProtected: true,
    isDeveloper: true,
    registeredAt: "2023-01-15T10:00:00Z",
    businessLine: "global",
  },
  {
    adminId: 4,
    fullName: "Ватуева Ирина Алексеевна",
    userId: "U_IV3N5",
    level: 6,
    role: "Команда сервиса",
    isProtected: true,
    isDeveloper: false,
    registeredAt: "2023-02-01T10:00:00Z",
  },
];

/**
 * Заявки на доступ (level: 0, ожидают одобрения).
 */
export const MOCK_ACCESS_REQUESTS = [
  { adminId: 80, fullName: "Соколов Артём Викторович",     userId: "U_AR12P", level: 0, requestedAt: "2026-05-08T08:30:00Z", businessLine: "rb"  },
  { adminId: 81, fullName: "Мамонтова Ольга Дмитриевна",   userId: "U_OM85K", level: 0, requestedAt: "2026-05-10T14:15:00Z", businessLine: "kib" },
  { adminId: 82, fullName: "Зуев Кирилл Олегович",         userId: "U_KZ47N", level: 0, requestedAt: "2026-05-11T10:00:00Z", businessLine: "mmb" },
  { adminId: 83, fullName: "Демидова Ангелина Сергеевна",  userId: "U_DA34F", level: 0, requestedAt: "2026-05-12T11:20:00Z", businessLine: "siv" },
  { adminId: 84, fullName: "Тарасов Михаил Юрьевич",       userId: "U_TM55W", level: 0, requestedAt: "2026-05-13T09:00:00Z", businessLine: "srb" },
  { adminId: 85, fullName: "Журавлёва Елена Геннадьевна",  userId: "U_JE21Q", level: 0, requestedAt: "2026-05-14T15:40:00Z", businessLine: "rb"  },
];

/**
 * Список пользователей с доступом (различные уровни и бизнес-линии).
 * Распределение по каждой не-global BL (15 чел.):
 *   1 × L5, 2 × L4, 3 × L3, 4 × L2, 5 × L1
 */
export const MOCK_ACCESS_USERS = [
  // L6 — спец администраторы (adminId 1-4), общие для всех BL
  ...REQUIRED_SERVICE_USERS.map((user) => ({ ...user })),

  // ── СиВ (Сервис и взыскание) ─────────────────────────────────
  { adminId:  5, fullName: "Рожков Александр Игоревич",     userId: "U_QD7RZ", level: 5, registeredAt: "2023-03-12T10:00:00Z", businessLine: "siv" },
  { adminId:  6, fullName: "Климова Ирина Николаевна",      userId: "U_R7N4X", level: 4, registeredAt: "2023-05-12T10:00:00Z", businessLine: "siv" },
  { adminId:  7, fullName: "Леонов Артур Викторович",       userId: "U_LA88M", level: 4, registeredAt: "2023-09-04T10:00:00Z", businessLine: "siv" },
  { adminId:  8, fullName: "Новикова Валерия Олеговна",     userId: "U_Z8P3D", level: 3, registeredAt: "2024-01-18T10:00:00Z", businessLine: "siv" },
  { adminId:  9, fullName: "Морозов Денис Алексеевич",      userId: "U_MD43H", level: 3, registeredAt: "2024-03-09T10:00:00Z", businessLine: "siv" },
  { adminId: 10, fullName: "Лазарева Юлия Анатольевна",     userId: "U_LJ29C", level: 3, registeredAt: "2024-06-25T10:00:00Z", businessLine: "siv" },
  { adminId: 11, fullName: "Капустин Игорь Олегович",       userId: "U_KI71B", level: 2, registeredAt: "2024-08-15T10:00:00Z", businessLine: "siv" },
  { adminId: 12, fullName: "Бабаева Алина Сергеевна",       userId: "U_BA52N", level: 2, registeredAt: "2024-10-03T10:00:00Z", businessLine: "siv" },
  { adminId: 13, fullName: "Семёнов Никита Игоревич",       userId: "U_SN64K", level: 2, registeredAt: "2024-12-19T10:00:00Z", businessLine: "siv" },
  { adminId: 14, fullName: "Дроздов Тимур Михайлович",      userId: "U_DT15V", level: 2, registeredAt: "2025-02-08T10:00:00Z", businessLine: "siv" },
  { adminId: 15, fullName: "Чернов Роман Евгеньевич",       userId: "U_N2A9F", level: 1, registeredAt: "2025-03-25T10:00:00Z", businessLine: "siv" },
  { adminId: 16, fullName: "Шарова Кристина Андреевна",     userId: "U_SK87P", level: 1, registeredAt: "2025-05-14T10:00:00Z", businessLine: "siv" },
  { adminId: 17, fullName: "Володин Глеб Викторович",       userId: "U_VG93L", level: 1, registeredAt: "2025-07-22T10:00:00Z", businessLine: "siv" },
  { adminId: 18, fullName: "Минина Полина Дмитриевна",      userId: "U_MP08T", level: 1, registeredAt: "2025-09-30T10:00:00Z", businessLine: "siv" },
  { adminId: 19, fullName: "Рудаков Илья Сергеевич",        userId: "U_RI46Y", level: 1, registeredAt: "2026-01-12T10:00:00Z", businessLine: "siv" },

  // ── РБ (Розничный бизнес) ────────────────────────────────────
  { adminId: 20, fullName: "Беляева Анастасия Игоревна",    userId: "U_BA77G", level: 5, registeredAt: "2023-02-20T10:00:00Z", businessLine: "rb" },
  { adminId: 21, fullName: "Савельева Мария Сергеевна",     userId: "U_W2K9M", level: 4, registeredAt: "2023-05-22T10:00:00Z", businessLine: "rb" },
  { adminId: 22, fullName: "Тимофеев Кирилл Борисович",     userId: "U_TK12J", level: 4, registeredAt: "2023-07-19T10:00:00Z", businessLine: "rb" },
  { adminId: 23, fullName: "Степанова Дарья Викторовна",    userId: "U_SD30R", level: 3, registeredAt: "2023-11-15T10:00:00Z", businessLine: "rb" },
  { adminId: 24, fullName: "Воронин Артём Денисович",       userId: "U_VA61E", level: 3, registeredAt: "2024-02-09T10:00:00Z", businessLine: "rb" },
  { adminId: 25, fullName: "Прохорова Алёна Олеговна",      userId: "U_PA84S", level: 3, registeredAt: "2024-05-04T10:00:00Z", businessLine: "rb" },
  { adminId: 26, fullName: "Баранов Олег Михайлович",       userId: "U_K4V1S", level: 2, registeredAt: "2024-06-11T10:00:00Z", businessLine: "rb" },
  { adminId: 27, fullName: "Филатова Наталья Юрьевна",      userId: "U_Q6Y2N", level: 2, registeredAt: "2024-07-30T10:00:00Z", businessLine: "rb" },
  { adminId: 28, fullName: "Зимин Денис Александрович",     userId: "U_ZD45U", level: 2, registeredAt: "2024-09-22T10:00:00Z", businessLine: "rb" },
  { adminId: 29, fullName: "Куликова Виктория Романовна",   userId: "U_KV09F", level: 2, registeredAt: "2025-01-05T10:00:00Z", businessLine: "rb" },
  { adminId: 30, fullName: "Громова Ксения Дмитриевна",     userId: "U_T1M6V", level: 1, registeredAt: "2025-02-14T10:00:00Z", businessLine: "rb" },
  { adminId: 31, fullName: "Поляков Андрей Игоревич",       userId: "U_PA22D", level: 1, registeredAt: "2025-04-03T10:00:00Z", businessLine: "rb" },
  { adminId: 32, fullName: "Гусев Олег Тимофеевич",         userId: "U_GO58W", level: 1, registeredAt: "2025-06-17T10:00:00Z", businessLine: "rb" },
  { adminId: 33, fullName: "Романова Полина Владимировна",  userId: "U_RP10X", level: 1, registeredAt: "2025-09-08T10:00:00Z", businessLine: "rb" },
  { adminId: 34, fullName: "Жуков Антон Леонидович",        userId: "U_ZA73Z", level: 1, registeredAt: "2026-02-22T10:00:00Z", businessLine: "rb" },

  // ── ММБ (Массовый и микро бизнес) ────────────────────────────
  { adminId: 35, fullName: "Гончаров Тимур Алексеевич",     userId: "U_GT11H", level: 5, registeredAt: "2023-04-08T10:00:00Z", businessLine: "mmb" },
  { adminId: 36, fullName: "Игнатов Павел Андреевич",       userId: "U_FH18Q", level: 4, registeredAt: "2023-08-04T10:00:00Z", businessLine: "mmb" },
  { adminId: 37, fullName: "Тихонова Светлана Геннадьевна", userId: "U_TS40C", level: 4, registeredAt: "2023-10-21T10:00:00Z", businessLine: "mmb" },
  { adminId: 38, fullName: "Богданов Сергей Михайлович",    userId: "U_BS28A", level: 3, registeredAt: "2024-01-15T10:00:00Z", businessLine: "mmb" },
  { adminId: 39, fullName: "Лазарева Дарья Александровна",  userId: "U_LD66Q", level: 3, registeredAt: "2024-04-11T10:00:00Z", businessLine: "mmb" },
  { adminId: 40, fullName: "Кравцов Илья Владимирович",     userId: "U_KI52L", level: 3, registeredAt: "2024-07-29T10:00:00Z", businessLine: "mmb" },
  { adminId: 41, fullName: "Пахомов Евгений Александрович", userId: "U_H9C7L", level: 2, registeredAt: "2024-09-15T10:00:00Z", businessLine: "mmb" },
  { adminId: 42, fullName: "Сидоров Михаил Олегович",       userId: "U_SM37V", level: 2, registeredAt: "2024-11-12T10:00:00Z", businessLine: "mmb" },
  { adminId: 43, fullName: "Жаров Александр Юрьевич",       userId: "U_ZA68P", level: 2, registeredAt: "2025-01-29T10:00:00Z", businessLine: "mmb" },
  { adminId: 44, fullName: "Полищук Ольга Сергеевна",       userId: "U_PO14R", level: 2, registeredAt: "2025-03-21T10:00:00Z", businessLine: "mmb" },
  { adminId: 45, fullName: "Лебедев Сергей Андреевич",      userId: "U_LS92T", level: 1, registeredAt: "2025-08-19T10:00:00Z", businessLine: "mmb" },
  { adminId: 46, fullName: "Денисова Елизавета Олеговна",   userId: "U_DE25M", level: 1, registeredAt: "2025-10-07T10:00:00Z", businessLine: "mmb" },
  { adminId: 47, fullName: "Шилов Григорий Игоревич",       userId: "U_SH59B", level: 1, registeredAt: "2025-11-30T10:00:00Z", businessLine: "mmb" },
  { adminId: 48, fullName: "Маркова Татьяна Львовна",       userId: "U_MT77K", level: 1, registeredAt: "2026-02-04T10:00:00Z", businessLine: "mmb" },
  { adminId: 49, fullName: "Карпов Антон Геннадьевич",      userId: "U_KA34F", level: 1, registeredAt: "2026-03-19T10:00:00Z", businessLine: "mmb" },

  // ── СРБ (Средний и региональный бизнес) ──────────────────────
  { adminId: 50, fullName: "Симонова Алёна Викторовна",     userId: "U_SA51N", level: 5, registeredAt: "2023-03-30T10:00:00Z", businessLine: "srb" },
  { adminId: 51, fullName: "Орлов Никита Сергеевич",        userId: "U_ON72D", level: 4, registeredAt: "2023-06-14T10:00:00Z", businessLine: "srb" },
  { adminId: 52, fullName: "Чернышёва Дарья Михайловна",    userId: "U_CD06Y", level: 4, registeredAt: "2023-09-28T10:00:00Z", businessLine: "srb" },
  { adminId: 53, fullName: "Соловьёв Денис Викторович",     userId: "U_SD83R", level: 3, registeredAt: "2023-12-09T10:00:00Z", businessLine: "srb" },
  { adminId: 54, fullName: "Митина Ольга Анатольевна",      userId: "U_MO47K", level: 3, registeredAt: "2024-03-18T10:00:00Z", businessLine: "srb" },
  { adminId: 55, fullName: "Журавлёв Михаил Алексеевич",    userId: "U_ZM92W", level: 3, registeredAt: "2024-06-02T10:00:00Z", businessLine: "srb" },
  { adminId: 56, fullName: "Орлова Софья Артёмовна",        userId: "U_J3R8P", level: 2, registeredAt: "2024-11-03T10:00:00Z", businessLine: "srb" },
  { adminId: 57, fullName: "Антонов Никита Юрьевич",        userId: "U_AN31L", level: 2, registeredAt: "2024-12-27T10:00:00Z", businessLine: "srb" },
  { adminId: 58, fullName: "Шевцова Маргарита Викторовна",  userId: "U_SM65H", level: 2, registeredAt: "2025-02-15T10:00:00Z", businessLine: "srb" },
  { adminId: 59, fullName: "Калинин Артём Сергеевич",       userId: "U_KA90Q", level: 2, registeredAt: "2025-04-25T10:00:00Z", businessLine: "srb" },
  { adminId: 60, fullName: "Кузнецова Анна Викторовна",     userId: "U_KA38R", level: 1, registeredAt: "2026-01-07T10:00:00Z", businessLine: "srb" },
  { adminId: 61, fullName: "Фомичёв Сергей Игоревич",       userId: "U_FS18V", level: 1, registeredAt: "2025-08-13T10:00:00Z", businessLine: "srb" },
  { adminId: 62, fullName: "Назарова Виктория Денисовна",   userId: "U_NV44B", level: 1, registeredAt: "2025-10-21T10:00:00Z", businessLine: "srb" },
  { adminId: 63, fullName: "Захаров Денис Михайлович",      userId: "U_ZD27S", level: 1, registeredAt: "2025-12-04T10:00:00Z", businessLine: "srb" },
  { adminId: 64, fullName: "Ильина Маргарита Олеговна",     userId: "U_IM83C", level: 1, registeredAt: "2026-03-02T10:00:00Z", businessLine: "srb" },

  // ── КИБ (Корпоративно-инвестиционный бизнес) ─────────────────
  { adminId: 65, fullName: "Кравченко Эдуард Дмитриевич",   userId: "U_KE99M", level: 5, registeredAt: "2023-02-05T10:00:00Z", businessLine: "kib" },
  { adminId: 66, fullName: "Игнатьев Дмитрий Алексеевич",   userId: "U_ID16T", level: 4, registeredAt: "2023-04-19T10:00:00Z", businessLine: "kib" },
  { adminId: 67, fullName: "Лаврова Анастасия Романовна",   userId: "U_LA72X", level: 4, registeredAt: "2023-07-08T10:00:00Z", businessLine: "kib" },
  { adminId: 68, fullName: "Королев Денис Владимирович",    userId: "U_M0T5B", level: 3, registeredAt: "2024-02-09T10:00:00Z", businessLine: "kib" },
  { adminId: 69, fullName: "Анисимов Илья Сергеевич",       userId: "U_AI53J", level: 3, registeredAt: "2024-04-14T10:00:00Z", businessLine: "kib" },
  { adminId: 70, fullName: "Беликова Татьяна Дмитриевна",   userId: "U_BT89D", level: 3, registeredAt: "2024-07-26T10:00:00Z", businessLine: "kib" },
  { adminId: 71, fullName: "Елисеев Артем Константинович",  userId: "U_B5U0K", level: 2, registeredAt: "2025-01-20T10:00:00Z", businessLine: "kib" },
  { adminId: 72, fullName: "Романов Григорий Олегович",     userId: "U_RG41W", level: 2, registeredAt: "2024-08-19T10:00:00Z", businessLine: "kib" },
  { adminId: 73, fullName: "Соколова Кристина Юрьевна",     userId: "U_SK17F", level: 2, registeredAt: "2024-12-13T10:00:00Z", businessLine: "kib" },
  { adminId: 74, fullName: "Власов Михаил Эдуардович",      userId: "U_VM63N", level: 2, registeredAt: "2025-03-09T10:00:00Z", businessLine: "kib" },
  { adminId: 75, fullName: "Егорова Татьяна Борисовна",     userId: "U_P7E4J", level: 1, registeredAt: "2025-04-08T10:00:00Z", businessLine: "kib" },
  { adminId: 76, fullName: "Авдеев Олег Геннадьевич",       userId: "U_AO35P", level: 1, registeredAt: "2025-07-01T10:00:00Z", businessLine: "kib" },
  { adminId: 77, fullName: "Шапошникова Алёна Игоревна",    userId: "U_SH26V", level: 1, registeredAt: "2025-09-17T10:00:00Z", businessLine: "kib" },
  { adminId: 78, fullName: "Маслов Виталий Сергеевич",      userId: "U_MV60K", level: 1, registeredAt: "2025-11-23T10:00:00Z", businessLine: "kib" },
  { adminId: 79, fullName: "Тимошенко Алёна Викторовна",    userId: "U_TA08L", level: 1, registeredAt: "2026-02-11T10:00:00Z", businessLine: "kib" },

  // L0 — заявки (adminId 80-85)
  ...MOCK_ACCESS_REQUESTS.map((user) => ({ ...user })),
];

/**
 * Текущий пользователь (по умолчанию L6 — для демо доступны все вкладки).
 */
export const MOCK_CURRENT_USER = {
  id: "U_DD7RZ",
  name: "Плишкин Роман Валерьевич",
  roleName: "Специальный администратор",
  level: 6,
  rights: levelToRights(6),
  allowedUnitIds: ["edu-001", "edu-002", "edu-003", "edu-004"],
};

/**
 * Получить текущего пользователя.
 */
export function getCurrentUser(bootstrap) {
  const userData = bootstrap?.currentUser || MOCK_CURRENT_USER;
  if (!userData.rights && typeof userData.level === 'number') {
    userData.rights = levelToRights(userData.level);
  }
  return new User(userData);
}

/**
 * Получить список пользователей с доступом.
 */
export function getAccessUsers(bootstrap) {
  return bootstrap?.accessUsers || [...MOCK_ACCESS_USERS];
}

/**
 * Получить отображаемое имя роли по уровню.
 */
export function roleNameByLevel(level) {
  return getRoleLevel(level).name;
}

/**
 * Роли пользователей (legacy — для обратной совместимости).
 */
export const USER_ROLES = {
  SERVICE_TEAM: "Команда сервиса",
  EDITOR: "Редактор",
  ADMIN: "Администратор",
};

/**
 * Проверить, является ли пользователь защищённым.
 */
export function isProtectedUser(userId) {
  return REQUIRED_SERVICE_USERS.some(u => u.userId === userId);
}

/**
 * Проверить, является ли пользователь разработчиком.
 */
export function isDeveloperUser(userId) {
  const user = REQUIRED_SERVICE_USERS.find(u => u.userId === userId);
  return user?.isDeveloper || false;
}

export { ROLE_LEVELS, levelToRights, getRoleLevel };
