/**
 * ══════════════════════════════════════════════════
 * Audit logs — mock-данные действий пользователей
 * ══════════════════════════════════════════════════
 *
 * Каждая запись:
 *   id, timestamp (ISO), userId, businessLine, category, type, description
 */

import { MOCK_ACCESS_USERS } from './users.js'

/** Категории для фильтрации. icon — emoji или unicode, рендерится в иконке записи. */
export const LOG_CATEGORIES = [
  { id: 'units',      label: 'Обучения',    icon: '📘', color: '#0284c7', bgColor: '#dbeafe' },
  { id: 'analytics',  label: 'Аналитика',   icon: '📊', color: '#7e22ce', bgColor: '#ede9fe' },
  { id: 'enrollment', label: 'Прохождение', icon: '▶️', color: '#15803d', bgColor: '#dcfce7' },
  { id: 'requests',   label: 'Заявки',      icon: '📩', color: '#c2410c', bgColor: '#ffedd5' },
  { id: 'levels',     label: 'Уровни',      icon: '👤', color: '#b91c1c', bgColor: '#fee2e2' },
  { id: 'system',     label: 'Система',     icon: '⚙️', color: '#475569', bgColor: '#e2e8f0' },
]

export function getLogCategory(id) {
  return LOG_CATEGORIES.find((c) => c.id === id) || LOG_CATEGORIES[0]
}

/** Шаблоны действий, привязанные к уровню (кто может). */
const ACTION_TEMPLATES = [
  // Прохождение (L1+)
  { minLevel: 1, category: 'enrollment', weight: 8, build: () => ({ description: 'Открыл единицу обучения для прохождения' }) },

  // Обучения — свои (L2+)
  { minLevel: 2, category: 'units', weight: 3, build: (ctx) => ({ description: `Создал учебную единицу «${pick(ctx.unitTitles)}»` }) },
  { minLevel: 2, category: 'units', weight: 6, build: (ctx) => ({ description: `Редактировал свою учебную единицу «${pick(ctx.unitTitles)}»` }) },
  { minLevel: 2, category: 'units', weight: 2, build: (ctx) => ({ description: `Удалил свою учебную единицу «${pick(ctx.unitTitles)}»` }) },
  { minLevel: 2, category: 'units', weight: 3, build: (ctx) => ({ description: `Изменил статус публикации своей единицы «${pick(ctx.unitTitles)}» на «Опубликовано»` }) },
  { minLevel: 2, category: 'units', weight: 2, build: (ctx) => ({ description: `Снял с публикации свою единицу «${pick(ctx.unitTitles)}»` }) },

  // Аналитика — свои (L2+)
  { minLevel: 2, category: 'analytics', weight: 4, build: (ctx) => ({ description: `Просмотрел аналитику по своей единице «${pick(ctx.unitTitles)}»` }) },

  // Аналитика — любая (L3+)
  { minLevel: 3, category: 'analytics', weight: 3, build: (ctx) => ({ description: `Просмотрел аналитику по единице «${pick(ctx.unitTitles)}»` }) },

  // Обучения — чужие (L4+)
  { minLevel: 4, category: 'units', weight: 2, build: (ctx) => ({ description: `Редактировал чужую учебную единицу «${pick(ctx.unitTitles)}»` }) },
  { minLevel: 4, category: 'units', weight: 1, build: (ctx) => ({ description: `Удалил чужую учебную единицу «${pick(ctx.unitTitles)}»` }) },
  { minLevel: 4, category: 'units', weight: 1, build: (ctx) => ({ description: `Изменил статус публикации чужой единицы «${pick(ctx.unitTitles)}»` }) },

  // Заявки (L5+)
  { minLevel: 5, category: 'requests', weight: 3, build: (ctx) => ({ description: `Одобрил заявку ${pick(ctx.applicantIds)}, назначил уровень L${1 + Math.floor(Math.random() * 4)}` }) },
  { minLevel: 5, category: 'requests', weight: 1, build: (ctx) => ({ description: `Отклонил заявку ${pick(ctx.applicantIds)}` }) },

  // Уровни (L5+)
  { minLevel: 5, category: 'levels', weight: 2, build: (ctx) => {
      const target = pick(ctx.targetUserIds)
      const from = 1 + Math.floor(Math.random() * 3)
      const to = from + 1
      return { description: `Изменил уровень ${target} с L${from} на L${to}` }
    } },
  { minLevel: 5, category: 'levels', weight: 1, build: (ctx) => ({ description: `Забрал доступ у ${pick(ctx.targetUserIds)}` }) },

  // L6 — глобальные правила и кросс-BL
  { minLevel: 6, category: 'system', weight: 1, build: () => ({ description: 'Изменил глобальные правила прав для админ-уровней' }) },
  { minLevel: 6, category: 'system', weight: 1, build: (ctx) => ({ description: `Открыл администрирование бизнес-линии «${ctx.otherBlName}»` }) },
  { minLevel: 6, category: 'levels',  weight: 1, build: (ctx) => ({ description: `Изменил уровень другого специального администратора ${pick(ctx.targetUserIds)}` }) },
]

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)] || '—'
}

function randomTimestampInPast(days, seed) {
  const now = Date.now()
  const offsetMs = Math.floor(((seed * 9301 + 49297) % 233280) / 233280 * days * 24 * 3600 * 1000)
  return new Date(now - offsetMs).toISOString()
}

/**
 * Сгенерировать логи для конкретной BL.
 * Берёт активных пользователей этой BL + L6 (cross-BL).
 */
export function generateLogsForBL(blId, count = 60) {
  // Users belonging to this BL OR L6 (cross-BL)
  const blUsers = MOCK_ACCESS_USERS.filter((u) => {
    if (u.level === 0) return false
    if (u.level === 6) return true
    return u.businessLine === blId
  })

  if (blUsers.length === 0) return []

  // Context for action templates
  const ctx = {
    unitTitles: [
      'Тренажёр по продажам',
      'Экзамен CLTV',
      'Тренажёр по кредитным картам',
      'Экзамен Optimum',
      'Сервис по обслуживанию VIP',
      'Тренажёр по работе с возражениями',
      'Курс по продуктам банка',
      'Экзамен по комплаенсу',
    ],
    applicantIds: ['U_AR12P', 'U_OM85K', 'U_KZ47N', 'U_DA34F', 'U_TM55W', 'U_JE21Q'],
    targetUserIds: blUsers.filter((u) => u.level < 6).map((u) => u.userId).slice(0, 10),
    otherBlName: 'РБ',
  }

  // Создаём взвешенный пул действий
  const logs = []
  for (let i = 0; i < count; i++) {
    // Pick user (more activity from L2-L4)
    const user = blUsers[Math.floor(Math.random() * blUsers.length)]

    // Find applicable actions for user's level
    const applicable = ACTION_TEMPLATES.filter((t) => user.level >= t.minLevel)
    if (applicable.length === 0) continue

    // Weighted pick
    const totalWeight = applicable.reduce((sum, t) => sum + t.weight, 0)
    let r = Math.random() * totalWeight
    let chosen = applicable[0]
    for (const t of applicable) {
      r -= t.weight
      if (r <= 0) { chosen = t; break }
    }

    const built = chosen.build(ctx)
    const ts = randomTimestampInPast(7, i * 7 + user.adminId)

    logs.push({
      id: `log-${blId}-${i}`,
      timestamp: ts,
      userId: user.userId,
      userLevel: user.level,
      businessLine: blId,
      category: chosen.category,
      description: built.description,
    })
  }

  // Sort by timestamp descending (newest first)
  logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  return logs
}

/**
 * Все логи разом (по всем BL) — для общего хранилища.
 */
export function generateAllMockLogs() {
  const blIds = ['siv', 'rb', 'mmb', 'srb', 'kib']
  return blIds.flatMap((bl) => generateLogsForBL(bl, 40))
}
