/**
 * Readiness — расчёт готовности узлов конструктора.
 *
 * Каждый тип узла имеет свой набор «проверок» (checks). Готовность узла —
 * это доля выполненных проверок. Для узла-агрегатора (и для дерева в целом)
 * считается рекурсивная готовность по всем потомкам.
 */

function txt(v) {
  return typeof v === 'string' ? v.trim() : ''
}

/**
 * Собственные проверки узла (без учёта детей).
 * Возвращает массив { ok: boolean, label: string }.
 */
export function getOwnChecks(node, parent = null, unitType = null) {
  if (!node) return []
  switch (node.type) {
    case 'trainer':
    case 'exam':
      return [{ ok: !!txt(node.title), label: 'Название обучения' }]

    case 'onboarding': {
      const els = node.content?.elements || []
      const firstHeading = els[0]?.heading || ''
      const btn = node.content?.startBtnText || ''
      return [
        { ok: !!txt(firstHeading), label: 'Заголовок' },
        { ok: !!txt(btn), label: 'Текст кнопки перехода' },
      ]
    }

    case 'theory_block':
      return []

    case 'theory': {
      const c = node.content || {}
      const settings = node.settings || {}
      const els = c.elements || []
      const firstHeading = els[0]?.heading || ''
      const btn = c.nextBtnText || ''
      const checks = [
        { ok: !!txt(firstHeading), label: 'Заголовок описания' },
        { ok: !!txt(btn), label: 'Текст кнопки перехода' },
      ]
      if (settings.noAbook) {
        checks.push({ ok: !!txt(c.manualContent), label: 'Содержание (ручной ввод)' })
      } else {
        checks.push({ ok: !!txt(c.prompt), label: 'Промпт A-Book' })
        const queries = c.queries || []
        checks.push({
          ok: queries.length > 0 && queries.every((q) => !!txt(q.text)),
          label: 'Запросы в A-Book заполнены',
        })
      }
      return checks
    }

    case 'practice':
      return []

    case 'section':
      return []

    case 'case': {
      const c = node.content || {}
      const cc = c.clientCard
      const checks = [
        { ok: !!txt(c.description), label: 'Описание кейса' },
        { ok: !!cc?.source, label: 'Карточка клиента создана' },
      ]
      if (cc?.source) {
        const sections = Array.isArray(cc.sections) ? cc.sections : []
        if (cc.source === 'custom') {
          const hasAnyField = sections.some((s) => Array.isArray(s.fields) && s.fields.length > 0)
          const allValuesFilled = hasAnyField && sections.every((s) =>
            (s.fields || []).every((f) => !!txt(f.value))
          )
          const allTitlesFilled = sections.every((s) =>
            !!txt(s.title) && (s.fields || []).every((f) => !!txt(f.label))
          )
          checks.push({ ok: allValuesFilled, label: 'Все поля карточки клиента заполнены' })
          checks.push({ ok: allTitlesFilled, label: 'Все названия разделов и полей карточки заполнены' })
        } else {
          // Шаблон: достаточно заполнить хотя бы одно поле
          const someValueFilled = sections.some((s) =>
            (s.fields || []).some((f) => !!txt(f.value))
          )
          checks.push({ ok: someValueFilled, label: 'Карточка клиента — хотя бы одно поле' })
        }
      }
      return checks
    }

    case 'question': {
      const c = node.content || {}
      const settings = node.settings || {}
      const criteria = Array.isArray(c.criteria) ? c.criteria : []
      const isExam = unitType === 'exam'
      const effectiveHintsMode = isExam
        ? 'none'
        : (settings.hintsMode || parent?.settings?.hintsMode || 'auto')
      const checks = [
        { ok: !!txt(c.text), label: 'Текст вопроса' },
        {
          ok: criteria.length > 0 && criteria.every((cr) => !!txt(cr.text)),
          label: 'Чек-лист оценки заполнен',
        },
      ]
      if (effectiveHintsMode === 'manual') {
        checks.push({
          ok: criteria.length > 0 && criteria.every((cr) => !!txt(cr.hint)),
          label: 'Подсказки во всех пунктах заполнены',
        })
      }
      if (settings.noAbook) {
        checks.push({ ok: !!txt(c.manualAnswer), label: 'Эталонный ответ' })
      } else {
        const queries = Array.isArray(c.queries) ? c.queries : []
        checks.push({
          ok: !!c.queriesApproved && queries.some((q) => !!txt(q.text)),
          label: 'Запрос в A-Book заполнен и утверждён',
        })
      }
      return checks
    }

    case 'completion': {
      const c = node.content || {}
      const els = c.elements || []
      const firstHeading = els[0]?.heading || ''
      const checks = [
        { ok: !!txt(firstHeading), label: 'Заголовок финального экрана' },
      ]
      if (c.aiFeedback?.enabled) {
        checks.push({ ok: !!txt(c.aiFeedback?.prompt), label: 'Промпт AI-обратной связи' })
      }
      return checks
    }

    default:
      return []
  }
}

/** Готовность только этого узла (без потомков). */
export function getNodeReadiness(node, parent = null, unitType = null) {
  const checks = getOwnChecks(node, parent, unitType)
  return {
    passed: checks.filter((c) => c.ok).length,
    total: checks.length,
    problems: checks.filter((c) => !c.ok).map((c) => c.label),
  }
}

/** Рекурсивная готовность: этот узел + все потомки. */
export function getRecursiveReadiness(node, parent = null, unitType = null) {
  if (!node) return { passed: 0, total: 0 }
  const ut = unitType || ((node.type === 'trainer' || node.type === 'exam') ? node.type : null)
  const own = getNodeReadiness(node, parent, ut)
  let passed = own.passed
  let total = own.total
  for (const child of node.children || []) {
    const r = getRecursiveReadiness(child, node, ut)
    passed += r.passed
    total += r.total
  }
  return { passed, total }
}

export function getStatus(passed, total) {
  if (total === 0) return 'ok'
  if (passed === total) return 'ok'
  if (passed === 0) return 'empty'
  return 'partial'
}

export function getProgress(passed, total) {
  if (total === 0) return 100
  return Math.round((passed / total) * 100)
}

/**
 * Был ли в поддереве (включая сам узел) хотя бы один visited-узел
 * с незавершённой рекурсивной готовностью.
 */
export function hasVisitedProblem(node, visitedSet, parent = null, unitType = null) {
  if (!node || !visitedSet) return false
  const ut = unitType || ((node.type === 'trainer' || node.type === 'exam') ? node.type : null)
  if (visitedSet.has(node.id)) {
    const r = getRecursiveReadiness(node, parent, ut)
    if (r.passed < r.total) return true
  }
  for (const child of node.children || []) {
    if (hasVisitedProblem(child, visitedSet, node, ut)) return true
  }
  return false
}

/**
 * Дочерние узлы первого уровня, у которых рекурсивная готовность < 100%.
 * Используется для inspector-сообщения при агрегаторах.
 */
export function getIncompleteChildren(node, unitType = null) {
  if (!node || !node.children) return []
  return node.children
    .map((child) => {
      const r = getRecursiveReadiness(child, node, unitType)
      const progress = getProgress(r.passed, r.total)
      return { id: child.id, title: child.title, type: child.type, progress }
    })
    .filter((c) => c.progress < 100)
}

/**
 * Все незавершённые «контентные» блоки в поддереве (значимые для пользователя).
 * Пропускает агрегаторы (theory_block, practice, section), которые сами по себе
 * не несут контента — рекурсивно идёт глубже до значимых узлов.
 */
const CONTENT_TYPES = new Set(['onboarding', 'theory', 'case', 'question', 'completion'])

export function getIncompleteContentBlocks(node, parent = null) {
  const results = []
  if (!node) return results

  function walk(n, p) {
    if (!n) return
    if (n !== node && CONTENT_TYPES.has(n.type)) {
      const r = getRecursiveReadiness(n, p)
      const progress = getProgress(r.passed, r.total)
      if (progress < 100) {
        results.push({ id: n.id, title: n.title, type: n.type, progress })
      }
    }
    for (const c of n.children || []) walk(c, n)
  }

  walk(node, parent)
  return results
}

/**
 * Иерархический список незаполненности для unit-уровня:
 * каждый верхнеуровневый ребёнок (онбординг / теор. блок / практика / завершение)
 * с массивом вложенных контентных потомков, у которых готовность < 100%.
 */
export function getIncompleteHierarchy(node) {
  if (!node || !node.children) return []
  const unitType = (node.type === 'trainer' || node.type === 'exam') ? node.type : null
  return node.children
    .map((child) => {
      const r = getRecursiveReadiness(child, node, unitType)
      const progress = getProgress(r.passed, r.total)
      if (progress >= 100) return null

      const nested = []
      function walk(n, p) {
        for (const c of n.children || []) {
          if (CONTENT_TYPES.has(c.type)) {
            const cr = getRecursiveReadiness(c, n, unitType)
            const cp = getProgress(cr.passed, cr.total)
            if (cp < 100) {
              nested.push({ id: c.id, title: c.title, type: c.type, progress: cp })
            }
          }
          walk(c, n)
        }
      }
      walk(child, node)

      return {
        id: child.id,
        title: child.title,
        type: child.type,
        progress,
        nested,
      }
    })
    .filter(Boolean)
}
