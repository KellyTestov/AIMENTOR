/**
 * ══════════════════════════════════════════════════
 * Mock Users Data
 * ══════════════════════════════════════════════════
 * 
 * Тестовые данные пользователей и прав доступа.
 */

import { User } from '../models/user.js';

/**
 * Обязательные пользователи сервиса (защищённые)
 * @type {Array<Object>}
 */
export const REQUIRED_SERVICE_USERS = [
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

/**
 * Mock-данные пользователей с доступом
 * @type {Array<Object>}
 */
export const MOCK_ACCESS_USERS = [
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

/**
 * Mock-данные текущего пользователя
 * @type {Object}
 */
export const MOCK_CURRENT_USER = {
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

/**
 * Получить текущего пользователя
 * @param {Object} bootstrap - Bootstrap-данные
 * @returns {User} Инстанс пользователя
 */
export function getCurrentUser(bootstrap) {
  const userData = bootstrap?.currentUser || MOCK_CURRENT_USER;
  return new User(userData);
}

/**
 * Получить список пользователей с доступом
 * @param {Object} bootstrap - Bootstrap-данные
 * @returns {Array<Object>} Массив пользователей
 */
export function getAccessUsers(bootstrap) {
  return bootstrap?.accessUsers || [...MOCK_ACCESS_USERS];
}

/**
 * Роли пользователей
 * @type {Object}
 */
export const USER_ROLES = {
  SERVICE_TEAM: "Команда сервиса",
  EDITOR: "Редактор",
  ADMIN: "Администратор",
};

/**
 * Проверить, является ли пользователь защищённым
 * @param {string} userId - ID пользователя
 * @returns {boolean}
 */
export function isProtectedUser(userId) {
  return REQUIRED_SERVICE_USERS.some(u => u.userId === userId);
}

/**
 * Проверить, является ли пользователь разработчиком
 * @param {string} userId - ID пользователя
 * @returns {boolean}
 */
export function isDeveloperUser(userId) {
  const user = REQUIRED_SERVICE_USERS.find(u => u.userId === userId);
  return user?.isDeveloper || false;
}
