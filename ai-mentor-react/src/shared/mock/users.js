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
  { adminId: 23, fullName: "Соколов Артём Викторович",   userId: "U_AR12P", level: 0, requestedAt: "2026-05-10T08:30:00Z", businessLine: "rb" },
  { adminId: 24, fullName: "Мамонтова Ольга Дмитриевна", userId: "U_OM85K", level: 0, requestedAt: "2026-05-12T14:15:00Z", businessLine: "kib" },
  { adminId: 25, fullName: "Зуев Кирилл Олегович",       userId: "U_KZ47N", level: 0, requestedAt: "2026-05-13T10:00:00Z", businessLine: "mmb" },
];

/**
 * Список пользователей с доступом (различные уровни).
 */
export const MOCK_ACCESS_USERS = [
  // L6 — защищённые сервисные (adminId 1-4)
  ...REQUIRED_SERVICE_USERS.map((user) => ({ ...user })),

  // L5 — Главный администратор
  { adminId: 5,  fullName: "Рожков Александр Игоревич", userId: "U_QD7RZ", level: 5, registeredAt: "2023-03-12T10:00:00Z", businessLine: "rb" },

  // L4 — Администраторы
  { adminId: 6,  fullName: "Савельева Мария Сергеевна", userId: "U_W2K9M", level: 4, registeredAt: "2023-05-22T10:00:00Z", businessLine: "kib" },
  { adminId: 7,  fullName: "Игнатов Павел Андреевич",   userId: "U_FH18Q", level: 4, registeredAt: "2023-08-04T10:00:00Z", businessLine: "mmb" },

  // L3 — Аналитики обучения
  { adminId: 8,  fullName: "Климова Ирина Николаевна",   userId: "U_R7N4X", level: 3, registeredAt: "2024-01-18T10:00:00Z", businessLine: "rb" },
  { adminId: 9,  fullName: "Королев Денис Владимирович", userId: "U_M0T5B", level: 3, registeredAt: "2024-02-09T10:00:00Z", businessLine: "kib" },
  { adminId: 10, fullName: "Новикова Валерия Олеговна",  userId: "U_Z8P3D", level: 3, registeredAt: "2024-04-26T10:00:00Z", businessLine: "siv" },

  // L2 — Создатели обучения
  { adminId: 11, fullName: "Баранов Олег Михайлович",        userId: "U_K4V1S", level: 2, registeredAt: "2024-06-11T10:00:00Z", businessLine: "rb" },
  { adminId: 12, fullName: "Филатова Наталья Юрьевна",       userId: "U_Q6Y2N", level: 2, registeredAt: "2024-07-30T10:00:00Z", businessLine: "rb" },
  { adminId: 13, fullName: "Пахомов Евгений Александрович",  userId: "U_H9C7L", level: 2, registeredAt: "2024-09-15T10:00:00Z", businessLine: "mmb" },
  { adminId: 14, fullName: "Орлова Софья Артёмовна",         userId: "U_J3R8P", level: 2, registeredAt: "2024-11-03T10:00:00Z", businessLine: "srb" },
  { adminId: 15, fullName: "Елисеев Артем Константинович",   userId: "U_B5U0K", level: 2, registeredAt: "2025-01-20T10:00:00Z", businessLine: "kib" },

  // L1 — Гости
  { adminId: 16, fullName: "Громова Ксения Дмитриевна",  userId: "U_T1M6V", level: 1, registeredAt: "2025-02-14T10:00:00Z", businessLine: "rb" },
  { adminId: 17, fullName: "Чернов Роман Евгеньевич",    userId: "U_N2A9F", level: 1, registeredAt: "2025-03-25T10:00:00Z", businessLine: "siv" },
  { adminId: 18, fullName: "Егорова Татьяна Борисовна",  userId: "U_P7E4J", level: 1, registeredAt: "2025-04-08T10:00:00Z", businessLine: "kib" },
  { adminId: 19, fullName: "Лебедев Сергей Андреевич",   userId: "U_LS92T", level: 1, registeredAt: "2025-08-19T10:00:00Z", businessLine: "mmb" },
  { adminId: 20, fullName: "Кузнецова Анна Викторовна",  userId: "U_KA38R", level: 1, registeredAt: "2026-01-07T10:00:00Z", businessLine: "srb" },

  // L0 — заявки (adminId 23-25)
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
