/**
 * ══════════════════════════════════════════════════
 * AI-Ментор · Модель пользователя
 * ══════════════════════════════════════════════════
 */

import { initials } from '../../core/utils.js';
import { USER_RIGHTS, USER_ROLES, getRoleLevel, levelToRights } from '../../core/constants.js';

/**
 * Класс пользователя
 */
export class User {
  constructor(data = {}) {
    this.id = data.id || null;
    this.name = data.name || data.fullName || '';
    this.fullName = data.fullName || data.name || '';
    this.level = typeof data.level === 'number' ? data.level : null;
    // Если есть level — выводим название из ROLE_LEVELS, иначе берём legacy role
    const roleByLevel = this.level !== null ? getRoleLevel(this.level).name : '';
    this.roleName = data.roleName || roleByLevel || data.role || '';
    this.role = data.role || roleByLevel || data.roleName || '';
    // rights — либо явные, либо выводим из level
    this.rights = data.rights || (this.level !== null ? levelToRights(this.level) : {});
    this.isProtected = data.isProtected || false;
    this.isDeveloper = data.isDeveloper || false;
    this.allowedUnitIds = data.allowedUnitIds || [];
  }

  /**
   * Инициалы пользователя
   */
  get initials() {
    return initials(this.name || this.fullName);
  }

  /**
   * Отображаемое имя
   */
  get displayName() {
    return this.name || this.fullName || 'Пользователь';
  }

  /**
   * Проверка права доступа
   * @param {string} rightName - название права
   * @returns {boolean}
   */
  hasRight(rightName) {
    return this.rights[rightName] === true;
  }

  /**
   * Доступ к главной странице
   */
  get canAccessHome() {
    return this.hasRight(USER_RIGHTS.CAN_ACCESS_HOME);
  }

  /**
   * Доступ к каталогу
   */
  get canViewCatalog() {
    return this.hasRight(USER_RIGHTS.CAN_VIEW_CATALOG);
  }

  /**
   * Доступ к аналитике
   */
  get canViewAnalytics() {
    return this.hasRight(USER_RIGHTS.CAN_VIEW_ANALYTICS);
  }

  /**
   * Доступ к управлению пользователями
   */
  get canManageUsers() {
    return this.hasRight(USER_RIGHTS.CAN_MANAGE_USERS);
  }

  /**
   * Может создавать обучения
   */
  get canCreate() {
    return this.hasRight(USER_RIGHTS.CAN_CREATE);
  }

  /**
   * Администратор
   */
  get isAdmin() {
    return this.hasRight(USER_RIGHTS.IS_ADMIN);
  }

  /**
   * Из команды сервиса
   */
  get isServiceTeam() {
    return this.role === USER_ROLES.SERVICE_TEAM || this.roleName === USER_ROLES.SERVICE_TEAM;
  }

  /**
   * Редактор
   */
  get isEditor() {
    return this.role === USER_ROLES.EDITOR || this.roleName === USER_ROLES.EDITOR;
  }

  /**
   * Метка уровня (например «L4 · Администратор»)
   */
  get levelLabel() {
    if (this.level === null) return this.roleName || 'Без уровня';
    const r = getRoleLevel(this.level);
    return `L${r.level} · ${r.name}`;
  }

  /**
   * Может ли текущий пользователь менять уровень другого пользователя.
   * Правила по матрице:
   *   L5 (Главный)        — может менять уровни 0..4 (ниже себя)
   *   L6 (Специальный)    — может менять любые уровни, включая других L6
   *   Прочие              — не могут
   * Также: никто не может менять собственный уровень через эту таблицу.
   */
  canManageUserLevel(targetUser) {
    if (!targetUser) return false;
    if (targetUser.userId === this.id || targetUser.id === this.id) return false;
    const myLevel = this.level ?? 0;
    const targetLevel = targetUser.level ?? 0;
    if (myLevel >= 6) return true;
    if (myLevel >= 5) return targetLevel < myLevel;
    return false;
  }

  /**
   * Максимальный уровень, который текущий пользователь может назначить.
   */
  get maxAssignableLevel() {
    const myLevel = this.level ?? 0;
    if (myLevel >= 6) return 6;
    if (myLevel >= 5) return 4;   // L5 не может назначать L5 или L6
    return -1;
  }

  /**
   * Проверка доступа к единице обучения
   * @param {Object} unit - единица обучения
   * @returns {boolean}
   */
  canAccessUnit(unit) {
    // Админы имеют доступ ко всему
    if (this.isAdmin) return true;
    
    // Автор имеет доступ к своим единицам
    if (unit.authorId === this.id) return true;
    
    // Проверка по списку разрешённых
    if (this.allowedUnitIds.length > 0) {
      return this.allowedUnitIds.includes(unit.id);
    }
    
    // По умолчанию доступ есть
    return true;
  }

  /**
   * Проверка возможности редактирования единицы
   * @param {Object} unit - единица обучения
   * @returns {boolean}
   */
  canEditUnit(unit) {
    // Админы могут редактировать всё
    if (this.isAdmin) return true;
    
    // Авторы могут редактировать свои единицы
    if (unit.authorId === this.id) return true;
    
    // Редакторы могут редактировать
    if (this.isEditor) return true;
    
    return false;
  }

  /**
   * Проверка возможности удаления единицы
   * @param {Object} unit - единица обучения
   * @returns {boolean}
   */
  canDeleteUnit(unit) {
    // Админы могут удалять всё
    if (this.isAdmin) return true;
    
    // Авторы могут удалять свои единицы
    if (unit.authorId === this.id) return true;
    
    return false;
  }

  /**
   * Преобразование в объект для хранения
   */
  toStorage() {
    return {
      id: this.id,
      name: this.name,
      fullName: this.fullName,
      level: this.level,
      roleName: this.roleName,
      role: this.role,
      rights: this.rights,
      isProtected: this.isProtected,
      isDeveloper: this.isDeveloper,
      allowedUnitIds: this.allowedUnitIds,
    };
  }

  /**
   * Создание из объекта хранилища
   */
  static fromStorage(data) {
    return new User(data);
  }

  /**
   * Создание гостевого пользователя
   */
  static createGuest() {
    return new User({
      id: 'guest',
      name: 'Гость',
      roleName: 'Гость',
      rights: {
        canAccessHome: true,
        canViewCatalog: true,
        canViewAnalytics: false,
        canManageUsers: false,
        canCreate: false,
        isAdmin: false,
      },
    });
  }

  /**
   * Создание администратора
   */
  static createAdmin(data = {}) {
    return new User({
      ...data,
      roleName: USER_ROLES.ADMIN,
      rights: {
        canAccessHome: true,
        canViewCatalog: true,
        canViewAnalytics: true,
        canManageUsers: true,
        canCreate: true,
        isAdmin: true,
        ...data.rights,
      },
    });
  }
}

export default User;
