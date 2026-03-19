# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI-Ментор — a frontend prototype of the main page for an AI-based learning management system. Pure static web app (no build step, no bundler) plus a Python-based desktop launcher that packages the app as a Windows executable.

## Running Locally

```bash
npx serve .
```

Or open `index.html` directly in a browser.

## Building the Windows Executable

```bash
pip install pyinstaller
pyinstaller AIMentorDemo.spec
```

Output: `dist/AIMentorDemo.exe`. Launcher copies assets to `%LOCALAPPDATA%\AIMentorDemo\` and opens `index.html` in the default browser. Log at `%TEMP%\AIMentorDemo_run.log`.

When adding new static assets (images etc.), add them to the `datas` list in `AIMentorDemo.spec`.

## Architecture

Three files are the entire frontend:

- **`index.html`** — all HTML: sidebar, catalog grid, analytics, admin panel, wizard modal (3 steps), delete confirm modal, admin confirm modal, cover crop modal
- **`styles.css`** — all styling and responsive layout
- **`app.js`** — all logic (no framework, no dependencies)

### Data flow

`app.js` reads `window.AI_MENTOR_BOOTSTRAP` at startup or falls back to hardcoded demo data. All runtime state is plain JS variables; UI is re-rendered imperatively via `innerHTML` / DOM manipulation.

### State persistence

| Storage | Key | Contents |
|---------|-----|----------|
| `sessionStorage` | `ai-mentor-catalog-state-v1` | Active section, search/filter/sort params |
| `sessionStorage` | `ai-mentor-access-users-v1` | Admin panel user list |
| `localStorage` | `ai-mentor-wizard-v2` | In-progress wizard draft |

### Rights model

| Right | Effect |
|-------|--------|
| `canAccessHome` | Gate for the entire page |
| `canViewCatalog` | Shows catalog nav item |
| `canViewAnalytics` | Shows analytics nav item |
| `canManageUsers` | Shows admin panel nav item |
| `canCreate` | Shows "Создать обучение" button |
| `isAdmin` | Sees all units; can edit any unit |
| `allowedUnitIds` | For non-admins: restricts visible units |

### Integration contract (`window.AI_MENTOR_BOOTSTRAP`)

```js
window.AI_MENTOR_BOOTSTRAP = {
  currentUser: { id, name, roleName, rights },
  units: [{ id, title, type, category, factory, authorId, authorName,
             createdAt, updatedAt, durationLabel, publicationStatus,
             launchUrl, editUrl, coverUrl? }],
  accessUsers: [{ fullName, userId, role, isProtected?, isDeveloper? }],
  createUrl: "https://..."
}
```

Set this before loading `app.js`. Missing fields fall back to demo data.

### Key constants and helpers

- **`FILTER_KEYS`** — `["search","type","category","factory","sort"]`. Used in `isFiltersDefault()` and the reset handler. Add new catalog filters here.
- **`AUTHOR_ICON_SVG`** — inline SVG string for the person icon used in card author tooltips.
- **`NAV_ICONS`** — maps section ids (`catalog`, `analytics`, `admin`) to image paths (`./mortarboard.png`, `./analytics.png`, `./admin-dashboard.png`).
- **`getUnitById(id)`** — `allUnits.find()` helper; use instead of inline `.find()`.
- **`syncResetBtn()`** — shows/hides the reset button; call only from filter event handlers and `applyStateToInputs()`, not from `saveState()`.

### Publication status

`publicationStatus` field on units normalizes to `"published"` or `"private"` (via `normalizePublicationStatus()`). Raw demo data may contain `"draft"` — it normalizes to `"private"`. UI shows "Опубликован" / "Приватное". Card menu shows "Скрыть" when published, "Опубликовать" when private.

### Admin panel confirmation pattern

Destructive/sensitive admin actions (role change, revoke access) go through a confirm modal. `pendingAdminAction` stores `{ type: "revoke"|"role", userId, fullName, newRole?, prevRole?, selectEl? }`. On role change the select is reverted in DOM until confirmed. Functions: `openAdminConfirm()`, `closeAdminConfirm()`, `confirmAdminAction()`.

### Cover crop system

When a user uploads a cover image in wizard step 3, `openCropModal(dataUrl)` is called instead of directly applying the image. The modal shows a 16:9 viewport with drag-to-reposition and scroll/slider zoom. On apply, `HTMLCanvasElement.drawImage()` exports a JPEG data URL which is set as the preview. Key state: `cropState` object, `pendingCoverFile` (the raw File, set before modal opens), `wizardCoverFile` (set on apply only). `bindCropEvents()` is called from `init()`.

### `REQUIRED_SERVICE_USERS`

Four hardcoded service-team accounts (`U_DD7RZ`, `U_KG4H1`, `U_DM8Q2`, `U_IV3N5`) are always prepended to the admin user list and cannot be revoked. `fullName` format is ФИО (Фамилия Имя Отчество). `ensureAdminUsers()` strips any incoming data that duplicates these IDs.

### Static image assets

| File | Usage |
|------|-------|
| `robot.png` | Sidebar brand logo |
| `mortarboard.png` | Nav icon — Каталог обучения |
| `analytics.png` | Nav icon — Аналитика |
| `admin-dashboard.png` | Nav icon — Админ-панель |
| `premium.jpg`, `premium_2.jpg`, `MMB-89.png`, `RB-34.png` | Rotating card cover placeholders |
