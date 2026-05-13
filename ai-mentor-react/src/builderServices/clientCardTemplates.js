/**
 * Шаблоны карточек клиента.
 * Каждый шаблон — фиксированная структура секций и полей.
 * Пользователь подставляет значения, а лейблы/секции не редактирует.
 */

export const CLIENT_CARD_TEMPLATES = [
  {
    id: 'mass-default',
    name: 'Mass — клиент с кредитной картой',
    description: 'Личные данные, детализация по КК, ставки и условия договора. Подходит для большинства сценариев розничного бизнеса.',
    icon: '📋',
    sections: [
      {
        id: 'personal',
        title: 'Личные данные клиента',
        collapsible: false,
        fields: [
          { id: 'name',     label: 'ФИО клиента',                  placeholder: 'Иванова Мария Петровна' },
          { id: 'phone',    label: 'Телефон',                      placeholder: '+7 (999) 123-45-67' },
          { id: 'account',  label: 'Номер счёта',                  placeholder: '40817810000000001234' },
          { id: 'status',   label: 'Статус',                       placeholder: 'Активный клиент' },
          { id: 'products', label: 'Продукты (через запятую)',     placeholder: 'Дебетовая карта, Накопительный счёт' },
          { id: 'request',  label: 'Запрос клиента',               placeholder: 'Вопрос по комиссии за уведомления' },
        ],
      },
      {
        id: 'creditDetails',
        title: 'Детализация по кредитной карте клиента',
        collapsible: true,
        fields: [
          { id: 'nearestPayment',  label: 'Ближайший платёж',                       placeholder: '2 200 ₽ до 20.12.2024' },
          { id: 'paymentSkip',     label: 'Пропуск платежа',                         placeholder: 'Не подключен' },
          { id: 'totalDebt',       label: 'Общая задолженность на сегодня',          placeholder: '3 140 ₽' },
          { id: 'purchases30',     label: 'Покупки в первые 30 дней',                placeholder: 'Льготный период не начался' },
          { id: 'purchasesFrom31', label: 'Покупки с 31 дня и снятие наличных',      placeholder: 'Льготный период до 28.01.2026' },
          { id: 'repayOther',      label: 'Погашение КК в другом банке',             placeholder: 'Льготный период не начался' },
          { id: 'availableLimit',  label: 'Доступный лимит',                         placeholder: '7 860 ₽' },
          { id: 'overdueDebt',     label: 'Просроченная задолженность',              placeholder: '0 ₽' },
          { id: 'fines',           label: 'Штрафы и неустойки',                      placeholder: '0 ₽' },
        ],
      },
      {
        id: 'contractTerms',
        title: 'Общие условия договора',
        collapsible: true,
        fields: [
          { id: 'totalCredit',   label: 'Общая сумма кредита',                    placeholder: '11 000 ₽' },
          { id: 'agreementDate', label: 'Подписание ДС о беспроцентном периоде',  placeholder: '16 ноября 2023' },
          { id: 'issueDate',     label: 'Дата выдачи',                            placeholder: '30 ноября 2023' },
        ],
      },
      {
        id: 'interestRates',
        title: 'Текущие процентные ставки',
        collapsible: true,
        fields: [
          { id: 'rate30',     label: 'Покупки в первые 30 дней',     placeholder: '39,99% годовых' },
          { id: 'rateFrom31', label: 'Покупки с 31 дня',             placeholder: '39,99% годовых' },
          { id: 'rateCash',   label: 'Снятие наличных',              placeholder: '49,99% годовых' },
          { id: 'rateRepay',  label: 'Погашение КК в другом банке',  placeholder: '49,99% годовых' },
        ],
      },
      {
        id: 'cardInfo',
        title: 'Информация по кредитной карте',
        collapsible: true,
        fields: [
          { id: 'balance',     label: 'Баланс',                                           placeholder: '7 860 ₽' },
          { id: 'serviceCost', label: 'Стоимость обслуживания',                           placeholder: '0 ₽' },
          { id: 'cashLimit',   label: 'Лимит на снятие наличных без комиссии',            placeholder: 'до 50 000 ₽/мес' },
          { id: 'commAlfa',    label: 'Комиссия за снятие в банкоматах Альфа-Банка',      placeholder: '3,9% + 390 ₽' },
          { id: 'commOther',   label: 'Комиссия за снятие в сторонних банкоматах',        placeholder: '3,9% + 390 ₽' },
        ],
      },
    ],
  },
]

export function getTemplate(id) {
  return CLIENT_CARD_TEMPLATES.find((t) => t.id === id) || null
}

/**
 * Создать «свежие» секции из шаблона — клонирование структуры с пустыми value.
 */
export function instantiateTemplate(templateId) {
  const tpl = getTemplate(templateId)
  if (!tpl) return []
  return tpl.sections.map((sec) => ({
    id: sec.id,
    title: sec.title,
    collapsible: sec.collapsible !== false,
    fields: sec.fields.map((f) => ({
      id: f.id,
      label: f.label,
      placeholder: f.placeholder || '',
      value: '',
    })),
  }))
}

/**
 * Миграция старого формата clientCard в новую структуру.
 * Старый формат: плоские поля (name/phone/...) + вложенные объекты по ключам секций.
 * Возвращает clientCard в новом формате.
 */
export function migrateLegacyClientCard(legacy) {
  if (!legacy || typeof legacy !== 'object') {
    return { source: null, templateId: null, sections: [] }
  }
  // Уже новый формат
  if (Array.isArray(legacy.sections)) {
    // Явный null source = пустое состояние (после Сброса)
    const explicitSource = Object.prototype.hasOwnProperty.call(legacy, 'source')
    const source = explicitSource
      ? legacy.source
      : (legacy.templateId ? 'template' : (legacy.sections.length > 0 ? 'custom' : null))
    return {
      source,
      templateId: legacy.templateId || null,
      sections: legacy.sections,
    }
  }

  // Определяем — есть ли что-то от старого формата (старые ключи)
  const LEGACY_PERSONAL_KEYS = ['name', 'phone', 'account', 'status', 'products', 'request']
  const LEGACY_SECTION_KEYS = ['creditDetails', 'contractTerms', 'interestRates', 'cardInfo']
  const hasLegacyData =
    LEGACY_PERSONAL_KEYS.some((k) => legacy[k]) ||
    LEGACY_SECTION_KEYS.some((k) => legacy[k] && Object.values(legacy[k]).some(Boolean))

  if (!hasLegacyData) {
    return { source: null, templateId: null, sections: [] }
  }

  // Превращаем старые данные в шаблон mass-default с подставленными значениями
  const tpl = getTemplate('mass-default')
  if (!tpl) return { source: null, templateId: null, sections: [] }

  const sections = tpl.sections.map((sec) => ({
    id: sec.id,
    title: sec.title,
    collapsible: sec.collapsible !== false,
    fields: sec.fields.map((f) => {
      let value = ''
      if (sec.id === 'personal') {
        value = legacy[f.id] || ''
      } else {
        value = legacy[sec.id]?.[f.id] || ''
      }
      return { id: f.id, label: f.label, placeholder: f.placeholder, value }
    }),
  }))

  return { source: 'template', templateId: 'mass-default', sections }
}
