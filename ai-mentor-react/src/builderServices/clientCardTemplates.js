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
    icon: '💳',
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
  {
    id: 'mass-credit-cash',
    name: 'Mass — клиент с кредитом наличными',
    description: 'Личные данные и детализация по потребительскому кредиту: задолженность, ПДП, срок, ставка, счёт.',
    icon: '💵',
    sections: [
      {
        id: 'personal',
        title: 'Личные данные клиента',
        collapsible: false,
        fields: [
          { id: 'name',     label: 'ФИО клиента',              placeholder: 'Иванова Мария Петровна' },
          { id: 'phone',    label: 'Телефон',                  placeholder: '+7 (999) 123-45-67' },
          { id: 'account',  label: 'Номер счёта',              placeholder: '40817810000000001234' },
          { id: 'status',   label: 'Статус',                   placeholder: 'Активный клиент' },
          { id: 'products', label: 'Продукты (через запятую)', placeholder: 'Кредит наличными' },
          { id: 'request',  label: 'Запрос клиента',           placeholder: 'Вопрос по досрочному погашению' },
        ],
      },
      {
        id: 'cashLoanDetails',
        title: 'Детализация по кредиту наличными',
        collapsible: true,
        fields: [
          { id: 'nearestPayment',  label: 'Ближайший платёж',               placeholder: '5 400 ₽ до 15.01.2025' },
          { id: 'totalDebt',       label: 'Общая задолженность на сегодня', placeholder: '48 200 ₽' },
          { id: 'overdueDebt',     label: 'Просроченная задолженность',     placeholder: '0 ₽' },
          { id: 'fines',           label: 'Штрафы и неустойки',             placeholder: '0 ₽' },
          { id: 'pdpAmount',       label: 'Сумма ПДП',                      placeholder: '250 000 ₽' },
          { id: 'contractAmount',  label: 'Сумма договора',                 placeholder: '300 000 ₽' },
          { id: 'loanTerm',        label: 'Срок кредита',                   placeholder: '36 месяцев' },
          { id: 'paymentDate',     label: 'Дата ежемесячного платежа',      placeholder: '15-е число каждого месяца' },
          { id: 'interestRate',    label: 'Процентная ставка',              placeholder: '14,9% годовых' },
          { id: 'contractNumber',  label: 'Номер договора',                 placeholder: '№ КН-2023-456789' },
          { id: 'loanAccount',     label: 'Счёт кредита',                   placeholder: '45506810000000001234' },
          { id: 'issueDate',       label: 'Дата выдачи',                    placeholder: '15 марта 2023' },
        ],
      },
    ],
  },
  {
    id: 'mass-savings-daily',
    name: 'Mass — клиент с накопительным счётом (ежедневный остаток)',
    description: 'Личные данные и параметры накопительного счёта с начислением на ежедневный остаток: ставки, надбавки, прогноз дохода.',
    icon: '📈',
    sections: [
      {
        id: 'personal',
        title: 'Личные данные клиента',
        collapsible: false,
        fields: [
          { id: 'name',     label: 'ФИО клиента',              placeholder: 'Иванова Мария Петровна' },
          { id: 'phone',    label: 'Телефон',                  placeholder: '+7 (999) 123-45-67' },
          { id: 'account',  label: 'Номер счёта',              placeholder: '40817810000000001234' },
          { id: 'status',   label: 'Статус',                   placeholder: 'Активный клиент' },
          { id: 'products', label: 'Продукты (через запятую)', placeholder: 'Накопительный счёт' },
          { id: 'request',  label: 'Запрос клиента',           placeholder: 'Вопрос по начислению процентов' },
        ],
      },
      {
        id: 'savingsDetails',
        title: 'Детализация по накопительному счёту',
        collapsible: true,
        fields: [
          { id: 'rateThisMonth',   label: 'Ставка в этом месяце',                       placeholder: '14% годовых' },
          { id: 'baseRate',        label: 'Базовая ставка',                              placeholder: '12% годовых' },
          { id: 'effectiveRate',   label: 'Эффективная ставка',                         placeholder: '14,93% годовых' },
          { id: 'smartBonus',      label: 'Надбавка за Альфа-Смарт',                    placeholder: '1%' },
          { id: 'bonus30kLabel',   label: 'Надбавка 2,5% за операции от 30 000 ₽',      placeholder: 'Активна' },
          { id: 'bonus30kLeft',    label: 'Осталось совершить операций на',              placeholder: '12 500 ₽' },
          { id: 'accrualMethod',   label: 'Способ начисления',                          placeholder: 'На ежедневный остаток' },
          { id: 'avgBalance',      label: 'Средний остаток за текущий месяц',           placeholder: '85 000 ₽' },
          { id: 'forecastIncome',  label: 'Прогноз дохода за месяц',                   placeholder: '993 ₽' },
        ],
      },
    ],
  },
  {
    id: 'mass-cashback-reverse',
    name: 'Mass — клиент с Реверсивным Кэшбэком',
    description: 'Личные данные, лимиты кэшбэка, выбранные категории, барабаны и история по бонусному счёту.',
    icon: '🔄',
    sections: [
      {
        id: 'personal',
        title: 'Личные данные клиента',
        collapsible: false,
        fields: [
          { id: 'name',     label: 'ФИО клиента',              placeholder: 'Иванова Мария Петровна' },
          { id: 'phone',    label: 'Телефон',                  placeholder: '+7 (999) 123-45-67' },
          { id: 'account',  label: 'Номер счёта',              placeholder: '40817810000000001234' },
          { id: 'status',   label: 'Статус',                   placeholder: 'Активный клиент' },
          { id: 'products', label: 'Продукты (через запятую)', placeholder: 'Кредитная карта с Реверсивным Кэшбэком' },
          { id: 'request',  label: 'Запрос клиента',           placeholder: 'Вопрос по начислению кэшбэка' },
        ],
      },
      {
        id: 'cashbackLimits',
        title: 'Карты и лимиты кэшбэка',
        collapsible: true,
        fields: [
          { id: 'cards',           label: 'Карты',                           placeholder: '**** 1234' },
          { id: 'limitCategories', label: 'Лимиты кэшбэка на категории',    placeholder: '3 000 ₽/мес' },
          { id: 'limitServices',   label: 'Лимиты кэшбэка на сервисы',      placeholder: '1 500 ₽/мес' },
        ],
      },
      {
        id: 'selectedCategories',
        title: 'Выбранные категории',
        collapsible: true,
        fields: [
          { id: 'selectedCount',   label: 'Выбрано категорий',              placeholder: '3' },
          { id: 'category1Name',   label: 'Категория 1 — название',         placeholder: 'Рестораны' },
          { id: 'category1Status', label: 'Категория 1 — статус',           placeholder: 'Активна' },
          { id: 'category1Date',   label: 'Категория 1 — дата выбора',      placeholder: '01.11.2024' },
          { id: 'category1Terms',  label: 'Категория 1 — условия получения',placeholder: '5% при покупках от 500 ₽' },
          { id: 'category2Name',   label: 'Категория 2 — название',         placeholder: 'АЗС' },
          { id: 'category2Status', label: 'Категория 2 — статус',           placeholder: 'Активна' },
          { id: 'category2Date',   label: 'Категория 2 — дата выбора',      placeholder: '01.11.2024' },
          { id: 'category2Terms',  label: 'Категория 2 — условия получения',placeholder: '5% при покупках от 200 ₽' },
        ],
      },
      {
        id: 'drums',
        title: 'Барабаны',
        collapsible: true,
        fields: [
          { id: 'drum1Prize',    label: 'Приз',                  placeholder: 'Смартфон' },
          { id: 'drum1DrawDate', label: 'Дата розыгрыша',        placeholder: '31.12.2024' },
          { id: 'drum1Status',   label: 'Статус',                placeholder: 'Активен' },
          { id: 'drum1Left',     label: 'Осталось кручений',     placeholder: '3' },
          { id: 'drum1Expires',  label: 'Срок действия',         placeholder: '31.12.2024' },
        ],
      },
      {
        id: 'bonusHistory',
        title: 'История по бонусному счёту',
        collapsible: true,
        fields: [
          { id: 'hist1Date',      label: 'Дата операции',    placeholder: '15.11.2024' },
          { id: 'hist1Source',    label: 'Источник',         placeholder: 'Покупка' },
          { id: 'hist1Point',     label: 'Торговая точка',   placeholder: 'Пятёрочка' },
          { id: 'hist1EventType', label: 'Тип события',      placeholder: 'Начисление' },
          { id: 'hist1MoveDate',  label: 'Дата движения',    placeholder: '16.11.2024' },
          { id: 'hist1Status',    label: 'Статус',           placeholder: 'Выполнено' },
          { id: 'hist1Amount',    label: 'Сумма кэшбэка',    placeholder: '250 ₽' },
        ],
      },
    ],
  },
  {
    id: 'mass-savings-min',
    name: 'Mass — клиент с накопительным счётом (минимальный остаток)',
    description: 'Личные данные и параметры накопительного счёта с начислением на минимальный остаток: ставки, надбавки, текущий остаток, доход.',
    icon: '🏦',
    sections: [
      {
        id: 'personal',
        title: 'Личные данные клиента',
        collapsible: false,
        fields: [
          { id: 'name',     label: 'ФИО клиента',              placeholder: 'Иванова Мария Петровна' },
          { id: 'phone',    label: 'Телефон',                  placeholder: '+7 (999) 123-45-67' },
          { id: 'account',  label: 'Номер счёта',              placeholder: '40817810000000001234' },
          { id: 'status',   label: 'Статус',                   placeholder: 'Активный клиент' },
          { id: 'products', label: 'Продукты (через запятую)', placeholder: 'Накопительный счёт' },
          { id: 'request',  label: 'Запрос клиента',           placeholder: 'Вопрос по начислению процентов' },
        ],
      },
      {
        id: 'savingsMinDetails',
        title: 'Детализация по накопительному счёту',
        collapsible: true,
        fields: [
          { id: 'rateThisMonth',    label: 'Ставка в этом месяце',                        placeholder: '13% годовых' },
          { id: 'baseRate',         label: 'Базовая ставка',                               placeholder: '10% годовых' },
          { id: 'effectiveRate',    label: 'Эффективная ставка',                          placeholder: '13,80% годовых' },
          { id: 'bonus20kStatus',   label: 'Надбавка 4,5% за операции от 20 000 ₽',       placeholder: 'Надбавка активна' },
          { id: 'bonus100kLabel',   label: 'Надбавка 5% за операции от 100 000 ₽',        placeholder: 'Не активна' },
          { id: 'bonus100kLeft',    label: 'Осталось совершить операций на',               placeholder: '75 000 ₽' },
          { id: 'accrualMethod',    label: 'Способ начисления',                           placeholder: 'На минимальный остаток' },
          { id: 'minBalance',       label: 'Текущий минимальный остаток на счёте',        placeholder: '50 000 ₽' },
          { id: 'forecastIncome',   label: 'Прогноз дохода за месяц',                    placeholder: '542 ₽' },
          { id: 'totalIncome',      label: 'Доход за всё время',                          placeholder: '3 240 ₽' },
        ],
      },
    ],
  },
  {
    id: 'mass-deposit-max',
    name: 'Mass — клиент с Альфа-Вкладом Максимальный',
    description: 'Личные данные и полная информация по депозиту: сроки, пролонгация, ставки, суммы, доход.',
    icon: '🏧',
    sections: [
      {
        id: 'personal',
        title: 'Личные данные клиента',
        collapsible: false,
        fields: [
          { id: 'name',     label: 'ФИО клиента',              placeholder: 'Иванова Мария Петровна' },
          { id: 'phone',    label: 'Телефон',                  placeholder: '+7 (999) 123-45-67' },
          { id: 'account',  label: 'Номер счёта',              placeholder: '40817810000000001234' },
          { id: 'status',   label: 'Статус',                   placeholder: 'Активный клиент' },
          { id: 'products', label: 'Продукты (через запятую)', placeholder: 'Альфа-Вклад Максимальный' },
          { id: 'request',  label: 'Запрос клиента',           placeholder: 'Вопрос по условиям вклада' },
        ],
      },
      {
        id: 'depositDetails',
        title: 'Детализация по вкладу',
        collapsible: true,
        fields: [
          { id: 'mainInfo',          label: 'Основная информация',                         placeholder: 'Альфа-Вклад Максимальный' },
          { id: 'openDate',          label: 'Дата открытия',                               placeholder: '01.04.2024' },
          { id: 'closeDate',         label: 'Дата окончания срока',                        placeholder: '01.04.2025' },
          { id: 'lastProlongDate',   label: 'Дата последней пролонгации',                  placeholder: '01.04.2024' },
          { id: 'nextProlongDate',   label: 'Дата следующей пролонгации',                  placeholder: '01.04.2025' },
          { id: 'rateChangeDate',    label: 'Дата изменения процентной ставки',            placeholder: 'Без изменений' },
          { id: 'contractName',      label: 'Наименование депозитного договора',           placeholder: 'Альфа-Вклад Максимальный 365' },
          { id: 'returnAccount',     label: 'Счёт возврата депозита',                      placeholder: '40817810000000001234' },
          { id: 'depositAccount',    label: 'Номер счёта депозита',                        placeholder: '42301810000000005678' },
          { id: 'partialWithdraw',   label: 'Возможность частичного снятия',               placeholder: 'Нет' },
          { id: 'capitalization',    label: 'Капитализация процентов',                     placeholder: 'Да' },
          { id: 'refill',            label: 'Возможность пополнения',                      placeholder: 'Нет' },
          { id: 'baseRate',          label: 'Базовая ставка',                              placeholder: '18% годовых' },
          { id: 'effectiveRate',     label: 'Процентная ставка с учётом капитализации',   placeholder: '19,56% годовых' },
          { id: 'openAmount',        label: 'Сумма депозита на дату открытия',             placeholder: '100 000 ₽' },
          { id: 'paidInterest',      label: 'Сумма выплаченных процентов на текущий момент', placeholder: '14 700 ₽' },
          { id: 'totalIncome',       label: 'Доход за весь срок',                          placeholder: '19 560 ₽' },
          { id: 'finalAmount',       label: 'Сумма в конце срока',                         placeholder: '119 560 ₽' },
        ],
      },
    ],
  },
  {
    id: 'mass-referral',
    name: 'Mass — клиент с Реферальной программой',
    description: 'Личные данные, реферальные показатели, детали рекомендаций и статусы выполнения условий для клиента и друга.',
    icon: '🤝',
    sections: [
      {
        id: 'personal',
        title: 'Личные данные клиента',
        collapsible: false,
        fields: [
          { id: 'name',     label: 'ФИО клиента',              placeholder: 'Иванова Мария Петровна' },
          { id: 'phone',    label: 'Телефон',                  placeholder: '+7 (999) 123-45-67' },
          { id: 'account',  label: 'Номер счёта',              placeholder: '40817810000000001234' },
          { id: 'status',   label: 'Статус',                   placeholder: 'Активный клиент' },
          { id: 'products', label: 'Продукты (через запятую)', placeholder: 'Реферальная программа' },
          { id: 'request',  label: 'Запрос клиента',           placeholder: 'Вопрос по реферальному вознаграждению' },
        ],
      },
      {
        id: 'referralStats',
        title: 'Статистика рекомендаций',
        collapsible: true,
        fields: [
          { id: 'sentToFriend',    label: 'Отправлено другу (кол-во)',    placeholder: '3' },
          { id: 'receivedFromFriend', label: 'Принято от друга (кол-во)', placeholder: '1' },
        ],
      },
      {
        id: 'referralDetails',
        title: 'Детали рекомендации',
        collapsible: true,
        fields: [
          { id: 'friendName',      label: 'ФИО друга',                              placeholder: 'Петров Иван Сергеевич' },
          { id: 'referralTo',      label: 'Рекомендация другу',                     placeholder: 'Кредитная карта' },
          { id: 'clientReceives',  label: 'Получит ФИО клиента',                    placeholder: 'Иванова Мария Петровна' },
          { id: 'friendPhone',     label: 'Номер телефона друга',                   placeholder: '+7 (999) 987-65-43' },
          { id: 'productName',     label: 'Название продукта',                      placeholder: 'Alfa Travel' },
          { id: 'rewardAmount',    label: 'Сумма вознаграждения',                   placeholder: '1 000 ₽' },
          { id: 'referralDate',    label: 'Дата рекомендации',                      placeholder: '10.10.2024' },
          { id: 'referralStatus',  label: 'Рекомендация сработала (статус)',        placeholder: 'Успешно' },
          { id: 'rewardAccount',   label: 'Вознаграждение начислено на счёт 408',   placeholder: '40817810000000001234' },
        ],
      },
      {
        id: 'clientConditions',
        title: 'Статусы условий — Клиент',
        collapsible: true,
        fields: [
          { id: 'clientPeriod',      label: 'Период выполнения условий (клиент)',        placeholder: '01.10.2024 — 31.10.2024' },
          { id: 'clientStatus',      label: 'Условия выполнены (клиент)',               placeholder: 'Да' },
          { id: 'clientTxAmount',    label: 'Сумма транзакций (из 3 000 ₽)',            placeholder: '3 000 ₽' },
          { id: 'clientTxAmtResult', label: 'Результат по сумме транзакций',            placeholder: 'Успешно завершено' },
          { id: 'clientTxCount',     label: 'Количество транзакций (из 5)',             placeholder: '5' },
          { id: 'clientTxCntResult', label: 'Результат по количеству транзакций',       placeholder: 'Результат не влияет' },
        ],
      },
      {
        id: 'friendConditions',
        title: 'Статусы условий — Друг',
        collapsible: true,
        fields: [
          { id: 'friendPeriod',     label: 'Период выполнения условий (друг)',          placeholder: '01.10.2024 — 31.10.2024' },
          { id: 'friendStatus',     label: 'Условия выполнены (друг)',                 placeholder: 'Да' },
          { id: 'friendTxAmount',   label: 'Сумма транзакций (из 1 ₽)',                placeholder: '1 ₽' },
          { id: 'friendTxResult',   label: 'Результат по сумме транзакций',            placeholder: 'Успешно завершено' },
          { id: 'friendIdentified', label: 'Идентифицированный клиент',                placeholder: 'Да' },
          { id: 'friendIdResult',   label: 'Результат по идентификации',               placeholder: 'Успешно завершено' },
        ],
      },
    ],
  },
  {
    id: 'mass-limits',
    name: 'Mass — клиент Лимиты',
    description: 'Личные данные и лимиты на снятие наличных: по дебетовым и кредитным картам, доступный и использованный лимит.',
    icon: '🔐',
    sections: [
      {
        id: 'personal',
        title: 'Личные данные клиента',
        collapsible: false,
        fields: [
          { id: 'name',     label: 'ФИО клиента',              placeholder: 'Иванова Мария Петровна' },
          { id: 'phone',    label: 'Телефон',                  placeholder: '+7 (999) 123-45-67' },
          { id: 'account',  label: 'Номер счёта',              placeholder: '40817810000000001234' },
          { id: 'status',   label: 'Статус',                   placeholder: 'Активный клиент' },
          { id: 'products', label: 'Продукты (через запятую)', placeholder: 'Дебетовая карта, Кредитная карта' },
          { id: 'request',  label: 'Запрос клиента',           placeholder: 'Вопрос по лимитам на снятие' },
        ],
      },
      {
        id: 'withdrawLimits',
        title: 'Снятие наличных',
        collapsible: true,
        fields: [
          { id: 'debitAtmAvailable',  label: 'Доступно по дебетовым картам и счетам',         placeholder: '500 000 ₽' },
          { id: 'debitAtmUsed',       label: 'Использовано по дебетовым картам и счетам',     placeholder: '15 000 ₽' },
          { id: 'debitValidUntil',    label: 'Лимит действует до',                            placeholder: '31.05.2026' },
          { id: 'creditFreeAtm',      label: 'Бесплатное снятие в банкоматах с карты',        placeholder: '**** 5678' },
          { id: 'creditAtmAvailable', label: 'Доступно по кредитным картам (беспл.)',         placeholder: '50 000 ₽' },
          { id: 'creditAtmUsed',      label: 'Использовано по кредитным картам (беспл.)',     placeholder: '0 ₽' },
        ],
      },
    ],
  },
  {
    id: 'mass-credit-card-plastic',
    name: 'Mass — клиент с Кредитной картой (условия по пластику)',
    description: 'Личные данные, параметры счёта и карты (ПИН, контракт, Plastic ID) и информация о комиссии.',
    icon: '🪪',
    sections: [
      {
        id: 'personal',
        title: 'Личные данные клиента',
        collapsible: false,
        fields: [
          { id: 'name',     label: 'ФИО клиента',              placeholder: 'Иванова Мария Петровна' },
          { id: 'phone',    label: 'Телефон',                  placeholder: '+7 (999) 123-45-67' },
          { id: 'account',  label: 'Номер счёта',              placeholder: '40817810000000001234' },
          { id: 'status',   label: 'Статус',                   placeholder: 'Активный клиент' },
          { id: 'products', label: 'Продукты (через запятую)', placeholder: 'Кредитная карта' },
          { id: 'request',  label: 'Запрос клиента',           placeholder: 'Вопрос по условиям карты' },
        ],
      },
      {
        id: 'accountInfo',
        title: 'Счёт',
        collapsible: true,
        fields: [
          { id: 'balance',       label: 'Баланс',           placeholder: '****,** ₽' },
          { id: 'hold',          label: 'Холд',             placeholder: '****,** ₽' },
          { id: 'accountOwner',  label: 'Владелец счёта',   placeholder: 'Иванова Мария Петровна' },
        ],
      },
      {
        id: 'cardInfo',
        title: 'Карта',
        collapsible: true,
        fields: [
          { id: 'bonusProgramNumber', label: 'Номер в бонусной программе',    placeholder: '-' },
          { id: 'wrongPinCount',      label: 'Количество неверных ПИН',       placeholder: '* из 5' },
          { id: 'cardValidPeriod',    label: 'Период действия карты',         placeholder: 'дд.мм.гггг — дд.мм.гггг' },
          { id: 'autoReissue',        label: 'Автоматический перевыпуск',     placeholder: '-' },
          { id: 'pinOnChip',          label: 'ПИН записан на Чип',            placeholder: 'Да' },
          { id: 'pinSetByCard',       label: 'ПИН установлен по карте',       placeholder: 'Да' },
          { id: 'cardContract',       label: 'Карточный контракт',            placeholder: 'PCCYG0-KK Classic, YG+60 дн_0 p_new чек_50к беспл, 4,9%+490' },
          { id: 'plasticId',          label: 'Plastic ID',                    placeholder: '********' },
        ],
      },
      {
        id: 'commissionInfo',
        title: 'Информация о комиссии',
        collapsible: true,
        fields: [
          { id: 'serviceChargeDate',  label: 'Дата списания стоимости обслуживания',              placeholder: 'дд.мм.гггг' },
          { id: 'serviceCost',        label: 'Стоимость обслуживания',                            placeholder: '*** руб' },
          { id: 'cashLimitFree',      label: 'Лимит на снятие наличных без комиссии',             placeholder: 'до ***** ₽ в календарный месяц' },
          { id: 'commAlfa',           label: 'Комиссия за снятие в банкоматах Альфа-Банка и партнёров', placeholder: '*,*% от суммы + *** руб' },
          { id: 'commOther',          label: 'Комиссия за снятие в сторонних банкоматах',         placeholder: '*,*% от суммы + *** руб' },
        ],
      },
    ],
  },
  {
    id: 'delivery-debit',
    name: 'Доставка — клиент с дебетовой картой',
    description: 'Карточка встречи по доставке дебетовой карты: обслуживание, кэшбэк, снятие, переводы, СМС, возраст выдачи, Альфа-Смарт.',
    icon: '🚚',
    sections: [
      {
        id: 'meetingInfo',
        title: 'Информация о встрече',
        collapsible: false,
        fields: [
          { id: 'name',        label: 'ФИО',           placeholder: 'Антонов Аркадий Сергеевич' },
          { id: 'meetingDate', label: 'Дата встречи',  placeholder: '28.12.2025' },
        ],
      },
      {
        id: 'productDetails',
        title: 'Условия по продукту',
        collapsible: true,
        fields: [
          { id: 'service',    label: 'Обслуживание',      placeholder: 'Бесплатно' },
          { id: 'cashback',   label: 'Кэшбэк',            placeholder: '5% в 3х категориях / 5% в 2х категориях +1% на все, барабан до 100%, максимум 5000' },
          { id: 'withdrawal', label: 'Снятие',             placeholder: '1 млн ₽ в месяц' },
          { id: 'transfers',  label: 'Переводы',           placeholder: 'СБП до 100 тыс. руб' },
          { id: 'sms',        label: 'Смс уведомление',   placeholder: '99 ₽' },
          { id: 'minAge',     label: 'Возраст выдачи',    placeholder: 'с 14 лет' },
          { id: 'alfaSmart',  label: 'Пакет Альфа-Смарт', placeholder: '9 привилегий' },
        ],
      },
    ],
  },
  {
    id: 'delivery-credit',
    name: 'Доставка — клиент с кредитной картой',
    description: 'Карточка встречи по доставке кредитной карты: обслуживание, кэшбэк, льготный период, переводы, комиссия снятия, минимальный платёж.',
    icon: '🚚',
    sections: [
      {
        id: 'meetingInfo',
        title: 'Информация о встрече',
        collapsible: false,
        fields: [
          { id: 'name',        label: 'ФИО',           placeholder: 'Петров Василий Семёнович' },
          { id: 'meetingDate', label: 'Дата встречи',  placeholder: '29.12.2025' },
        ],
      },
      {
        id: 'productDetails',
        title: 'Условия по продукту',
        collapsible: true,
        fields: [
          { id: 'service',       label: 'Обслуживание',      placeholder: '1 год бесплатно, второй год 990 ₽' },
          { id: 'cashback',      label: 'Кэшбэк',            placeholder: '5% в 3х категориях / 5% в 2х категориях +1% на все, барабан до 100%, максимум 5000' },
          { id: 'graceperiod',   label: 'Льготный период',   placeholder: '60 дней на покупки, снятие наличных и переводы; 100 дней на Balance Transfer' },
          { id: 'transfers',     label: 'Переводы',           placeholder: 'Комиссия 5,9%+390 рублей по номеру карты. Переводы по СБП, между своими счетами 5,9% + 150 рублей' },
          { id: 'commWithdraw',  label: 'Комиссия снятие',   placeholder: '50 000 тыс. руб. без комиссии далее 4,9% + 490 руб' },
          { id: 'minPayment',    label: 'Минимальный платёж', placeholder: 'от 0% до 10% от суммы задолженности (мин 300 руб.)' },
        ],
      },
    ],
  },
  {
    id: 'delivery-credit-120',
    name: 'Доставка — клиент с кредитной картой (120 дней без %)',
    description: 'Карточка встречи по доставке кредитной карты с льготным периодом 120 дней на покупки.',
    icon: '🚚',
    sections: [
      {
        id: 'meetingInfo',
        title: 'Информация о встрече',
        collapsible: false,
        fields: [
          { id: 'name',        label: 'ФИО',           placeholder: 'Иванов Евгений Антонович' },
          { id: 'meetingDate', label: 'Дата встречи',  placeholder: '30.12.2025' },
        ],
      },
      {
        id: 'productDetails',
        title: 'Условия по продукту',
        collapsible: true,
        fields: [
          { id: 'service',      label: 'Обслуживание',       placeholder: '1 год бесплатно, второй год 1 290 ₽' },
          { id: 'cashback',     label: 'Кэшбэк',             placeholder: '+1% на все, барабан до 100%, максимум 5000' },
          { id: 'graceperiod',  label: 'Льготный период',    placeholder: '120 дней на покупки, 100 дней на Balance Transfer' },
          { id: 'transfers',    label: 'Переводы',            placeholder: 'с комиссией 5,9%+390 рублей по номеру карты. Переводы по СБП, между своими счетами 5,9% + 150 рублей' },
          { id: 'commWithdraw', label: 'Комиссия снятие',    placeholder: 'сразу же с комиссией 4,9% + 490 руб.' },
          { id: 'minPayment',   label: 'Минимальный платёж', placeholder: 'от 0% до 10% от суммы задолженности (мин 300 руб.)' },
          { id: 'minAge',       label: 'Возраст выдачи',     placeholder: 'с 18 лет' },
        ],
      },
    ],
  },
  {
    id: 'delivery-debit-alfa-only',
    name: 'Доставка — клиент с дебетовой картой (Alfa Only)',
    description: 'Карточка встречи по доставке дебетовой карты пакета Alfa Only: расширенные условия обслуживания, кэшбэк до 30 000 ₽/мес.',
    icon: '🚚',
    sections: [
      {
        id: 'meetingInfo',
        title: 'Информация о встрече',
        collapsible: false,
        fields: [
          { id: 'name',        label: 'ФИО',           placeholder: 'Безруков Арнольд Васильевич' },
          { id: 'meetingDate', label: 'Дата встречи',  placeholder: '31.12.2025' },
        ],
      },
      {
        id: 'productDetails',
        title: 'Условия по продукту',
        collapsible: true,
        fields: [
          { id: 'service',    label: 'Обслуживание',     placeholder: 'условия одного и тогда карта бесплатная: 1. остаток 2 млн ₽ и траты от 200 000 ₽ в месяц по картам Альфа-Банка; 2. ежемесячный остаток по счетам — от 3 млн ₽; 3. зарплата от 400 000 ₽ в месяц.' },
          { id: 'cashback',   label: 'Кэшбэк',           placeholder: '5 категорий по 7% или 4 категории по 7% + 1% на всё, 2 барабана супер кэшбека где может выпасть до 100% до 30 000 руб. в месяц' },
          { id: 'withdrawal', label: 'Снятие',            placeholder: 'Без ограничений в любых банкоматах' },
          { id: 'transfers',  label: 'Переводы',          placeholder: 'Бесплатно переводы с карты на карту. До 100 000 ₽ в месяц. На любую сумму при остатках от 12 млн' },
          { id: 'sms',        label: 'Смс уведомление',  placeholder: 'Бесплатно' },
          { id: 'minAge',     label: 'Возраст выдачи',   placeholder: 'ДК ПЭП (без бумажной анкеты) — с 18 лет; Семейный банк Alfa Only — с 20 лет; Зарплатная карта Alfa Only/TOP — с 18 лет' },
        ],
      },
    ],
  },
  {
    id: 'delivery-rko',
    name: 'Доставка — Расчётно-кассовое обслуживание',
    description: 'Карточка встречи по РКО: услуги, тариф, подписки, нефинансовые сервисы.',
    icon: '🚚',
    sections: [
      {
        id: 'meetingInfo',
        title: 'Информация о встрече',
        collapsible: false,
        fields: [
          { id: 'name',        label: 'ФИО',           placeholder: 'Смирнов Анатолий Валерьевич' },
          { id: 'meetingDate', label: 'Дата встречи',  placeholder: '20.04.2026' },
        ],
      },
      {
        id: 'productDetails',
        title: 'Условия по продукту',
        collapsible: true,
        fields: [
          { id: 'services',    label: 'Услуги',                placeholder: 'Торговый эквайринг' },
          { id: 'tariff',      label: 'Тариф',                 placeholder: 'Быстрое развитие' },
          { id: 'subs',        label: 'Подписки',              placeholder: 'Бесплатные переводы' },
          { id: 'nonFinance',  label: 'Нефинансовые сервисы', placeholder: 'Альфа-Безопасность' },
        ],
      },
    ],
  },
  {
    id: 'delivery-corporate-card',
    name: 'Доставка — Корпоративная карта для лиц, принимающих решения',
    description: 'Карточка встречи по доставке корпоративной карты: обслуживание, кэшбэк, снятие, переводы, СМС.',
    icon: '🚚',
    sections: [
      {
        id: 'meetingInfo',
        title: 'Информация о встрече',
        collapsible: false,
        fields: [
          { id: 'name',        label: 'ФИО',           placeholder: 'Смолина Виталина Андреевна' },
          { id: 'meetingDate', label: 'Дата встречи',  placeholder: '24.01.2026' },
        ],
      },
      {
        id: 'productDetails',
        title: 'Условия по продукту',
        collapsible: true,
        fields: [
          { id: 'service',    label: 'Обслуживание',      placeholder: 'Бесплатно' },
          { id: 'cashback',   label: 'Кэшбэк',            placeholder: '7% в 4х категориях / 7% в 3х категориях +1% на все, 2 прокрутки барабана до 100%, максимум 30 000' },
          { id: 'withdrawal', label: 'Снятие',             placeholder: '2 млн в месяц, далее комиссия — 1,99%' },
          { id: 'transfers',  label: 'Переводы',           placeholder: 'Без комиссии' },
          { id: 'sms',        label: 'Смс уведомления',   placeholder: 'Бесплатно' },
        ],
      },
    ],
  },
]

export function getTemplate(id) {
  const builtIn = CLIENT_CARD_TEMPLATES.find((t) => t.id === id)
  if (builtIn) return builtIn
  // Также ищем среди кастомных (сохранённых в localStorage)
  try {
    const raw = localStorage.getItem('ai-mentor-cc-templates-v1')
    if (!raw) return null
    const custom = JSON.parse(raw)
    return Array.isArray(custom) ? (custom.find((t) => t.id === id) || null) : null
  } catch { return null }
}

/** Все шаблоны (встроенные + кастомные из localStorage). */
export function getAllTemplates() {
  let custom = []
  try {
    const raw = localStorage.getItem('ai-mentor-cc-templates-v1')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) custom = parsed
    }
  } catch {}
  return [...CLIENT_CARD_TEMPLATES, ...custom]
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
