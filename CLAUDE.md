# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI-Ментор — фронтенд прототип LMS (система управления обучением) для Альфа-Банка. React SPA с тремя маршрутами: главная (каталог/аналитика/админ), конструктор обучения, тестовая среда.

**Активный проект:** `ai-mentor-react/`
**Легаси (только для справки):** `legacy/` — старая ванильная JS-версия, не трогать

## Команды

```bash
cd ai-mentor-react

npm run dev      # dev-сервер на http://localhost:5173
npm run build    # сборка в dist/
npm run preview  # превью prod-сборки
npm run lint     # ESLint
```

Деплой: Vercel автоматически при пуше в `main`. Конфиг в `vercel.json` в корне.

## Архитектура

### Маршруты (`src/router.jsx`)

| Маршрут | Страница | Назначение |
|---------|----------|-----------|
| `/` | `HomePage` | Каталог, аналитика, управление доступом |
| `/builder?id=` | `BuilderPage` | Конструктор структуры обучения |
| `/sandbox?id=` | `SandboxPage` | Тестовая среда (тренажёр / экзамен) |

### Стейт-менеджмент (Zustand, `src/stores/`)

| Стор | Содержимое |
|------|-----------|
| `appStore` | `currentUser`, `units[]`, `analyticsSessions[]`, `accessUsers[]` |
| `catalogStore` | фильтры каталога → персистятся в `sessionStorage` |
| `analyticsStore` | фильтры аналитики (период, фабрики, направления, сотрудник) |
| `adminStore` | поиск пользователей, `pendingAction` для confirm-модала |
| `builderStore` | дерево юнита, `selectedId`, scaffold, CRUD узлов |
| `sandboxStore` | сессия диалога, сообщения, таймеры, фаза |

### Bootstrap-контракт

`main.jsx` читает `window.AI_MENTOR_BOOTSTRAP` перед рендером, иначе использует mock-данные из `src/shared/mock/`.

```js
window.AI_MENTOR_BOOTSTRAP = {
  currentUser: { id, name, roleName, rights },
  units: [{ id, title, type, category, factory, authorId, authorName,
            createdAt, updatedAt, durationLabel, publicationStatus,
            launchUrl, editUrl, coverUrl? }],
  accessUsers: [{ fullName, userId, role, isProtected?, isDeveloper? }],
  analyticsSessions: [...],
  createUrl: "https://..."
}
```

Установить до загрузки приложения. Отсутствующие поля заменяются mock-данными.

### localStorage-ключи

| Ключ | Кто пишет | Кто читает |
|------|-----------|-----------|
| `ai-mentor-builder-data-v1` | `builderStore` (save), `WizardModal` (новые юниты) | `sandboxStore`, `CatalogSection` (mergeBuilderUnits) |
| `ai-mentor-sandbox-session-v1` | `sandboxStore` | `sandboxStore` (восстановление сессии) |
| `ai-mentor-catalog-state-v1` | `catalogStore` | `catalogStore` |
| `ai-mentor-wizard-v2` | `WizardModal` | `WizardModal` |

Ключ `bld-pending-id` в `sessionStorage` — передаёт ID юнита с каталога в `BuilderPage` при навигации.
Ключ `sb-pending-id` — аналогично для `SandboxPage`.

### Модель юнита (дерево в builder)

Юнит — дерево узлов. Каждый узел: `{ id, type, title, children[], content{}, settings{} }`.

Типы узлов и их допустимые дочерние:
```
unit → (onboarding, theory_block?, practice, completion)
theory_block → theory[]
practice → section[]
section → case[]
case → question[]
```

`buildScaffold(meta)` в `builderStore` создаёт начальную структуру при `_isNew: true`.

Тип `trainer`: включает `theory_block`. Тип `exam`: только `practice` без теории.

### Права доступа

| Право | Эффект |
|-------|--------|
| `canAccessHome` | Гейт всей страницы |
| `canViewCatalog` | Показывает раздел каталога |
| `canViewAnalytics` | Показывает раздел аналитики |
| `canManageUsers` | Показывает управление доступом |
| `canCreate` | Показывает кнопку «Создать обучение» |
| `isAdmin` | Видит все юниты, может редактировать любой |
| `allowedUnitIds` | Для не-админов: ограничивает видимые юниты |

### Тестовая среда (sandbox)

Вся логика диалога — в `src/components/sandbox/useSandboxEngine.js`. Стор только хранит состояние; движок управляет им через `useSandboxStore.getState()` напрямую (не через хук, т.к. асинхронные цепочки).

Фазы sandbox: `idle → rules → running → done` (exam) или `idle → running → done` (trainer). Фаза `resume` — восстановление прерванного экзамена.

### Константы

Все бизнес-константы в `src/core/constants.js`: `DIRECTION_MAP`, `FACTORIES`, `UNIT_CATEGORIES`, `UNIT_TOPICS`, `STORAGE_KEYS`. При добавлении новой фабрики или направления — обновлять только здесь.

Защищённые сервисные пользователи: `U_DD7RZ`, `U_KG4H1`, `U_DM8Q2`, `U_IV3N5` — захардкожены в `src/shared/mock/users.js`, нельзя отозвать через UI.

### Статические ресурсы

Картинки лежат в `ai-mentor-react/public/` и доступны по `/robot.png`, `/mortarboard.png` и т.д. При добавлении новых — класть туда же, путь всегда от корня (`/filename.ext`), не `./`.

### CSS

Три независимых CSS-файла, каждый импортируется в своей странице:
- `src/index.css` — главная страница
- `src/builder.css` — конструктор
- `src/sandbox.css` — тестовая среда

CSS-переменные (`--accent`, `--muted`, `--border` и др.) определены в каждом файле отдельно с одинаковыми значениями.
