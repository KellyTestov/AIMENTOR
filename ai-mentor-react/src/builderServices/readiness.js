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

function hasContentElement(elements) {
  return Array.isArray(elements) && elements.some((e) => txt(e?.heading) || txt(e?.text))
}

function hasRubric(node) {
  const s = node.settings || {}
  return !!s.noAbook || !!s.abookRubric
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

    case 'onboarding':
      return [{ ok: hasContentElement(node.content?.elements), label: 'Текст онбординга' }]

    case 'theory_block':
      return [{
        ok: (node.children || []).some((c) => c.type === 'theory'),
        label: 'Минимум одна теория',
      }]

    case 'theory':
      return [
        { ok: hasContentElement(node.content?.elements), label: 'Содержание теории' },
        { ok: hasRubric(node), label: 'Рубрика A-Book' },
      ]

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
      return [
        { ok: !!txt(c.text), label: 'Текст вопроса' },
        { ok: Array.isArray(c.criteria) && c.criteria.length > 0, label: 'Хотя бы один критерий оценки' },
        { ok: hasRubric(node), label: 'Рубрика A-Book' },
      ]
    }

    case 'completion':
      return [] // блок завершения не обязателен

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

/** Возвращает 'ok' | 'partial' | 'empty' */
export function getStatus(passed, total) {
  if (total === 0) return 'ok'
  if (passed === total) return 'ok'
  if (passed === 0) return 'empty'
  return 'partial'
}

/** Целое число процентов 0..100 */
export function getProgress(passed, total) {
  if (total === 0) return 100
  return Math.round((passed / total) * 100)
}
