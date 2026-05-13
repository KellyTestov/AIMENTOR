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
export function getOwnChecks(node, parent = null) {
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
      return [{
        ok: (node.children || []).some((c) => c.type === 'theory'),
        label: 'Минимум одна теория',
      }]

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
      return [{
        ok: (node.children || []).some((c) => c.type === 'section'),
        label: 'Минимум один раздел',
      }]

    case 'section':
      return [{
        ok: (node.children || []).some((c) => c.type === 'case'),
        label: 'Минимум один кейс',
      }]

    case 'case':
      return [
        { ok: !!txt(node.content?.description), label: 'Описание кейса' },
        {
          ok: (node.children || []).some((c) => c.type === 'question'),
          label: 'Минимум один вопрос',
        },
      ]

    case 'question': {
      const c = node.content || {}
      const settings = node.settings || {}
      const criteria = Array.isArray(c.criteria) ? c.criteria : []
      const effectiveHintsMode = settings.hintsMode || parent?.settings?.hintsMode || 'auto'
      const checks = [
        { ok: !!txt(c.text), label: 'Текст вопроса' },
        { ok: criteria.length > 0, label: 'Минимум один пункт чек-листа' },
        {
          ok: criteria.length > 0 && criteria.every((cr) => !!txt(cr.text)),
          label: 'Все пункты чек-листа заполнены',
        },
      ]
      if (effectiveHintsMode === 'manual' && criteria.length > 0) {
        checks.push({
          ok: criteria.every((cr) => !!txt(cr.hint)),
          label: 'Подсказки во всех пунктах заполнены',
        })
      }
      if (settings.noAbook) {
        checks.push({ ok: !!txt(c.manualAnswer), label: 'Эталонный ответ' })
      } else {
        const queries = Array.isArray(c.queries) ? c.queries : []
        checks.push({
          ok: queries.length > 0 && queries.some((q) => !!txt(q.text)),
          label: 'Минимум один запрос в A-Book',
        })
        checks.push({ ok: !!c.queriesApproved, label: 'Запросы в A-Book утверждены' })
      }
      return checks
    }

    case 'completion': {
      const els = node.content?.elements || []
      const firstHeading = els[0]?.heading || ''
      return [
        { ok: !!txt(firstHeading), label: 'Заголовок' },
      ]
    }

    default:
      return []
  }
}

/** Готовность только этого узла (без потомков). */
export function getNodeReadiness(node, parent = null) {
  const checks = getOwnChecks(node, parent)
  return {
    passed: checks.filter((c) => c.ok).length,
    total: checks.length,
    problems: checks.filter((c) => !c.ok).map((c) => c.label),
  }
}

/** Рекурсивная готовность: этот узел + все потомки. */
export function getRecursiveReadiness(node, parent = null) {
  if (!node) return { passed: 0, total: 0 }
  const own = getNodeReadiness(node, parent)
  let passed = own.passed
  let total = own.total
  for (const child of node.children || []) {
    const r = getRecursiveReadiness(child, node)
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
export function hasVisitedProblem(node, visitedSet, parent = null) {
  if (!node || !visitedSet) return false
  if (visitedSet.has(node.id)) {
    const r = getRecursiveReadiness(node, parent)
    if (r.passed < r.total) return true
  }
  for (const child of node.children || []) {
    if (hasVisitedProblem(child, visitedSet, node)) return true
  }
  return false
}

/**
 * Дочерние узлы первого уровня, у которых рекурсивная готовность < 100%.
 * Используется для inspector-сообщения при агрегаторах.
 */
export function getIncompleteChildren(node) {
  if (!node || !node.children) return []
  return node.children
    .map((child) => {
      const r = getRecursiveReadiness(child, node)
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
  return node.children
    .map((child) => {
      const r = getRecursiveReadiness(child, node)
      const progress = getProgress(r.passed, r.total)
      if (progress >= 100) return null

      const nested = []
      function walk(n, p) {
        for (const c of n.children || []) {
          if (CONTENT_TYPES.has(c.type)) {
            const cr = getRecursiveReadiness(c, n)
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
