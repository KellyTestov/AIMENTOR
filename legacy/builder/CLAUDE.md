# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Конструктор обучения — отдельный сервис AI-Ментора. Позволяет авторам создавать единицы обучения (тренажёры и экзамены) с AI-оценкой ответов. Чистый статический SPA без сборщика: три файла — `index.html`, `builder.css`, `builder.js`.

## Запуск

```bash
# из корня репозитория
npx serve .
# затем открыть builder/index.html?id=<unitId>
```

Открыть напрямую в браузере через `file://` тоже работает. Конструктор требует `?id=<unitId>` в URL и валидных данных в `localStorage`.

### Создать тестовую единицу без визарда

```js
// В консоли браузера, затем перейти на builder/index.html?id=test-001
localStorage.setItem('ai-mentor-builder-data-v1', JSON.stringify({
  'test-001': {
    _isNew: true, id: 'test-001', title: 'Тест', type: 'trainer',
    description: '', category: 'Продукты', factory: 'КЦ',
    durationLabel: '30 минут', coverDataUrl: null,
    createdAt: new Date().toISOString()
  }
}))
```

## Архитектура

### Жизненный цикл данных

1. **Главная страница** (`../app.js`) — пользователь проходит визард, `submitWizardForm()` сохраняет мета-объект с флагом `_isNew: true` в `localStorage['ai-mentor-builder-data-v1']` и перенаправляет на `builder/index.html?id=<id>`.
2. **Конструктор** — `init()` читает `?id=` из URL, загружает данные из localStorage. Если `_isNew === true` — вызывает `buildScaffold(meta)`, строит полное дерево и сохраняет. Если нет — загружает готовое дерево.
3. Все изменения сохраняются через `persistUnit()` напрямую в localStorage при каждом edit-событии.

### Модель данных — Unit

Корневой объект хранится как `localStorage['ai-mentor-builder-data-v1'][unitId]`:

```js
{
  id, title, type,           // "trainer" | "exam"
  description, category, factory, durationLabel,
  coverDataUrl,              // base64 JPEG data URL или null
  publicationStatus,         // "private" | "published"
  createdAt, updatedAt,
  settings: {
    failPolicy,              // "retry" | "end" | "skip"
    tov,                     // "neutral" | "formal" | "friendly"
    ahtTarget,               // секунды
    silenceThreshold,        // секунды
    hintPolicy,              // "on_request" | "always" | "disabled"
    defaultFeedback,         // "text" | "score" | "none"
  },
  children: [ ...Node ]
}
```

### Модель данных — Node

Каждый узел дерева:

```js
{
  id,       // genId(type) — уникальный строковый ID
  type,     // см. таблицу ниже
  title,
  children: [ ...Node ],
  content:  { /* зависит от type */ },
  settings: { /* локальные переопределения */ }
}
```

| type | children | content |
|------|----------|---------|
| `onboarding` | — | `{ elements: [{ id, type, text }] }` |
| `theory_block` | theory, practice | — |
| `theory` | — | `{ elements: [] }` |
| `practice` | section[] | — |
| `section` | case[] | — |
| `case` | question[] | `{ description }` |
| `question` | — | `{ text, refAnswer, hints[], feedback }` |
| `completion` | — | `{ elements: [] }` |

### Скаффолдинг по умолчанию

`buildScaffold(meta)` строит минимальный каркас:
- **Тренажёр**: Онбординг → Теоретический блок (Теория 1 + Практика → Раздел 1 → Кейс 1 → Вопрос 1) → Завершение
- **Экзамен**: Онбординг → Практика (Раздел 1 + Раздел 2, в каждом по Кейс 1 → Вопрос 1) → Завершение

### Разрешённые дочерние типы (`CHILD_TYPES`)

```
unit → practice
theory_block → theory
practice → section
section → case
case → question
```

`onboarding` и `completion` — защищённые узлы, удалить нельзя.

### Три зоны интерфейса

**Левая панель** — дерево `renderTree()`. Полностью перерисовывается через `innerHTML` при каждом `selectNode()`, `addChildTo()`, `deleteNodeById()`. Hover-действия через `data-tree-add` и `data-tree-del` атрибуты.

**Центральная область** — `renderCenter()` диспетчеризует по `node.type` на отдельные функции `renderC*()`. Каждая функция сама биндит события после записи в `innerHTML`. Обновляется только при смене выбранного узла.

**Правая панель (инспектор)** — `renderInspector()` диспетчеризует на `renderIUnit()`, `renderISection()`, `renderICase()`, `renderIQuestion()`, `renderIPassthrough()`. Группы настроек строятся через хелпер `ig(id, icon, label, bodyHtml, open)`. Значение `"inherit"` в select означает «не переопределять, брать из единицы».

### Паттерн сохранения

Каждое изменение → `persistUnit()` (обновляет `updatedAt` + перезаписывает весь объект в localStorage). Нет batch-сохранения, нет debounce. Для `contenteditable` блоков сохранение происходит на каждый `input`.

### CSS-переменные

Все цвета через CSS custom properties в `:root`. Основные: `--accent: #c91e1e`, `--bg: #f2f4f8`, `--surface: #fff`, `--border: #e0e5ef`, `--muted-lt: #8c9ab3`. Класс-состояния: `.is-open` на `.ig` — раскрывает группу инспектора; `.is-selected` на `.tree-row` — подсвечивает выбранный узел; `.is-vis` на `.bld-toast` — показывает тост.

## Ключевые константы

- `BUILDER_KEY = "ai-mentor-builder-data-v1"` — ключ localStorage
- `ICONS` — маппинг type → emoji-иконка для дерева
- `CHILD_TYPES` — маппинг parent.type → допустимый child.type
- `CHILD_TITLES` — дефолтные заголовки при создании нового узла

## Связь с главной страницей

Конструктор — отдельный сервис. Точки интеграции:
- `../app.js:submitWizardForm()` — единственное место, которое создаёт записи в builder localStorage и выставляет флаг `_isNew`
- `editUrl` на карточках каталога ведёт на `./builder/index.html?id=<id>`
- Кнопка «← Каталог» в хедере ведёт на `../index.html`
