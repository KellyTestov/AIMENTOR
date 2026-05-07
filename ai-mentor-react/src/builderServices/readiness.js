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
export function getOwnChecks(node) {
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
      const checks = [
        { ok: !!txt(c.text), label: 'Текст вопроса' },
        { ok: criteria.length > 0, label: 'Минимум один пункт чек-листа' },
        {
          ok: criteria.length > 0 && criteria.every((cr) => !!txt(cr.text)),
          label: 'Все пункты чек-листа заполнены',
        },
      ]
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

    case 'completion':
      return []

    default:
      return []
  }
}

/** Готовность только этого узла (без потомков). */
export function getNodeReadiness(node) {
  const checks = getOwnChecks(node)
  return {
    passed: checks.filter((c) => c.ok).length,
    total: checks.length,
    problems: checks.filter((c) => !c.ok).map((c) => c.label),
  }
}

/** Рекурсивная готовность: этот узел + все потомки. */
export function getRecursiveReadiness(node) {
  if (!node) return { passed: 0, total: 0 }
  const own = getNodeReadiness(node)
  let passed = own.passed
  let total = own.total
  for (const child of node.children || []) {
    const r = getRecursiveReadiness(child)
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
 * Дочерние узлы первого уровня, у которых рекурсивная готовность < 100%.
 * Используется для inspector-сообщения при агрегаторах.
 */
export function getIncompleteChildren(node) {
  if (!node || !node.children) return []
  return node.children
    .map((child) => {
      const r = getRecursiveReadiness(child)
      const progress = getProgress(r.passed, r.total)
      return { id: child.id, title: child.title, type: child.type, progress }
    })
    .filter((c) => c.progress < 100)
}
