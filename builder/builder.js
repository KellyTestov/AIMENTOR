/* ══════════════════════════════════════════════════
   AI-Ментор · Конструктор обучения — builder.js
   ══════════════════════════════════════════════════ */

"use strict";

const BUILDER_KEY = "ai-mentor-builder-data-v1";

/* ── Unit metadata option lists ─────────────────── */
const DIRECTION_MAP = {
  "Доставка":       ["Малый и микро бизнес", "Розничный бизнес"],
  "Урегулирование": ["90-", "90+", "Выездное"],
  "Сервис":         ["ФЛ Chat", "ФЛ Voice", "ЮЛ Chat", "ЮЛ Voice", "СвА", "Эквайринг"],
  "Телемаркетинг":  ["Физ.лица", "Юр.лица"],
};
const UNIT_TOPICS     = ["Продукты банка","Продажи","Коммуникации с клиентами","Кредитование","Карточные продукты","Работа с возражениями","Комплаенс","Управление"];
const UNIT_CATEGORIES = ["Продукты","Коммуникации","Продажи","Экзамены","Операционные процессы"];
const UNIT_FACTORIES  = ["Доставка","Урегулирование","Сервис","Телемаркетинг"];
const UNIT_DURATIONS  = ["15 минут","30 минут","1 час","1.5 часа","2 часа","2.5 часа","3 часа"];

/* ── State ─────────────────────────────────────── */
let unit       = null;   // full unit tree
let selectedId = null;   // selected node id
const expanded = new Set();
let isDirty    = false;  // true when unsaved changes exist
let _initing   = true;   // suppress dirty flag during init

let _seq = Date.now();
function genId(pfx) { return `${pfx || "n"}-${++_seq}`; }

const loadingQueries = new Set();
const MOCK_ABOOK_RESP = `✅ Комиссия за услугу уведомлений по дебетовым картам составляет — 99 рублей.\n\n🚨 По кредитным комиссия составляет — 159 рублей.\n\n❌ Если клиент хочет оспорить списание — направь его на составление обращения «Комиссии»`;

/* ── DOM refs ───────────────────────────────────── */
const dom = {};
function cacheDom() {
  dom.titleInput   = document.getElementById("unit-title-input");
  dom.status       = document.getElementById("unit-status");
  dom.btnCheck     = document.getElementById("btn-check");
  dom.btnSave      = document.getElementById("btn-save");
  dom.btnPublish   = document.getElementById("btn-publish");
  dom.btnMore      = document.getElementById("btn-more");
  dom.dropdown     = document.getElementById("more-dropdown");
  dom.addBlockBtn  = document.getElementById("add-block-btn");
  dom.tree         = document.getElementById("bld-tree");
  dom.center       = document.getElementById("bld-center");
  dom.inspTitle    = document.getElementById("inspector-title");
  dom.inspBody     = document.getElementById("inspector-body");
  dom.toast        = document.getElementById("bld-toast");
}

/* ── Storage ────────────────────────────────────── */
function loadAll()    { try { return JSON.parse(localStorage.getItem(BUILDER_KEY) || "{}"); } catch { return {}; } }
function saveAll(all) { try { localStorage.setItem(BUILDER_KEY, JSON.stringify(all)); } catch(e) { console.warn("localStorage full", e); } }

function persistUnit() {
  unit.updatedAt = new Date().toISOString();
  const all = loadAll();
  all[unit.id] = unit;
  saveAll(all);
  if (!_initing) isDirty = true;
}

/* ── Node helpers ───────────────────────────────── */
const ICONS = {
  unit:         "📋",
  onboarding:   "🚀",
  theory_block: "📚",
  theory:       "📄",
  practice:     "🎯",
  section:      "📁",
  case:         "💼",
  question:     "❓",
  completion:   "🏁",
};

function makeNode(type, title, children, content) {
  return { id: genId(type), type, title,
           children: children || [],
           content:  content  || {},
           settings: {} };
}

/* ── Scaffold ───────────────────────────────────── */
function buildScaffold(meta) {
  const isTrainer = meta.type === "trainer";

  const u = {
    id:               meta.id,
    title:            meta.title,
    type:             meta.type,
    description:      meta.description      || "",
    category:         meta.category         || "",
    factory:          meta.factory          || "",
    topic:            meta.topic            || "",
    direction:        meta.direction        || "",
    durationLabel:    meta.durationLabel     || "",
    coverDataUrl:     meta.coverDataUrl      || null,
    publicationStatus: "private",
    createdAt:        meta.createdAt || new Date().toISOString(),
    updatedAt:        new Date().toISOString(),
    settings: {
      failPolicy:       "retry",
      tov:              "neutral",
      ahtTarget:        120,
      silenceThreshold: 10,
      hintPolicy:       "on_request",
      defaultFeedback:  "text",
    },
    children: [],
  };

  u.children.push(makeNode("onboarding", "Онбординг", [], {
    elements: [{ id: genId("el"), heading: "", text: "" }]
  }));

  if (isTrainer) {
    const q1     = makeNode("question", "Вопрос 1",  [], { text: "", refAnswer: "", hints: [], feedback: "" });
    const case1  = makeNode("case",     "Кейс 1",    [q1],    { description: "" });
    const sec1   = makeNode("section",  "Раздел 1",  [case1], {});
    const prac   = makeNode("practice", "Практический блок", [sec1], {});
    const th1    = makeNode("theory",   "Теория 1",  [], { elements: [{ id: genId("el"), heading: "", text: "" }] });
    const tBlock = makeNode("theory_block", "Теоретический блок", [th1], {});
    u.children.push(tBlock);
    u.children.push(prac);
  } else {
    const mkQ = () => makeNode("question", "Вопрос 1", [], { text: "", refAnswer: "", hints: [], feedback: "" });
    const mkC = (q) => makeNode("case",    "Кейс 1",   [q], { description: "" });
    const s1   = makeNode("section", "Раздел 1", [mkC(mkQ())], {});
    const s2   = makeNode("section", "Раздел 2", [mkC(mkQ())], {});
    const prac = makeNode("practice", "Практический блок", [s1, s2], {});
    u.children.push(prac);
  }

  u.children.push(makeNode("completion", "Завершение", [], { elements: [] }));
  return u;
}

/* ── Tree search ────────────────────────────────── */
function findNode(root, id) {
  if (!root) return null;
  if (root.id === id) return root;
  for (const c of (root.children || [])) {
    const f = findNode(c, id);
    if (f) return f;
  }
  return null;
}

function findParent(root, id) {
  if (!root || !root.children) return null;
  for (const c of root.children) {
    if (c.id === id) return root;
    const p = findParent(c, id);
    if (p) return p;
  }
  return null;
}

function findPath(root, id) {
  if (root.id === id) return [root];
  for (const c of (root.children || [])) {
    const p = findPath(c, id);
    if (p) return [root, ...p];
  }
  return null;
}

function breadcrumbHtml(nodeId) {
  const path = findPath(unit, nodeId);
  if (!path || path.length <= 2) return ""; // skip if only unit→node

  const target = path[path.length - 1];
  let crumbs = path.slice(1); // drop unit root

  // For theory nodes: insert preceding sibling theories as sequential steps
  if (target.type === "theory" && path.length >= 3) {
    const parent  = path[path.length - 2]; // theory_block
    const theories = (parent.children || []).filter(c => c.type === "theory");
    const idx      = theories.findIndex(c => c.id === target.id);
    if (idx > 0) {
      const ancestors = path.slice(1, -1);          // [theory_block, ...]
      const preceding = theories.slice(0, idx);     // theories before current
      crumbs = [...ancestors, ...preceding, target];
    }
  }

  return `<div class="cv-breadcrumbs">${
    crumbs.map((n, i) => {
      const isLast = i === crumbs.length - 1;
      return isLast
        ? `<span class="cv-crumb cv-crumb--current">${esc(n.title)}</span>`
        : `<button class="cv-crumb" data-crumb-id="${esc(n.id)}">${esc(n.title)}</button><span class="cv-crumb__sep">›</span>`;
    }).join("")
  }</div>`;
}

function bindBreadcrumbs() {
  dom.center.querySelectorAll("[data-crumb-id]").forEach(btn => {
    btn.addEventListener("click", () => selectNode(btn.dataset.crumbId));
  });
}

function bindNodeTitleInp(node) {
  document.getElementById("node-title-inp")?.addEventListener("input", e => {
    node.title = e.target.value;
    persistUnit();
    renderTree();
  });
}

function countType(node, type) {
  let n = node.type === type ? 1 : 0;
  for (const c of (node.children || [])) n += countType(c, type);
  return n;
}

/* ── Tree rendering ─────────────────────────────── */
function expandAll(node) {
  expanded.add(node.id);
  for (const c of (node.children || [])) expandAll(c);
}

function chevron(open) {
  const d = open
    ? "M2.5 4.5L5.5 7.5L8.5 4.5"
    : "M4.5 2.5L7.5 5.5L4.5 8.5";
  return `<svg width="10" height="10" viewBox="0 0 11 11" fill="none" aria-hidden="true">
    <path d="${d}" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

function plusSvg() {
  return `<svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
    <path d="M5 1v8M1 5h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`;
}
function xSvg() {
  return `<svg width="9" height="9" viewBox="0 0 9 9" fill="none" aria-hidden="true">
    <path d="M1 1L8 8M8 1L1 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
  </svg>`;
}
function pencilSvg() {
  return `<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>`;
}
function dupSvg() {
  return `<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>`;
}

function renderTree() {
  if (expanded.size === 0) expandAll(unit);
  dom.tree.innerHTML = nodeHtml(unit, 0, true);
  bindTreeEvents();
}

function nodeHtml(node, depth, isRoot) {
  const sel        = selectedId === node.id;
  const exp        = expanded.has(node.id);
  const hasKids    = node.children && node.children.length > 0;
  const icon       = ICONS[node.type] || "•";
  const indent     = depth * 16 + (isRoot ? 8 : 8);
  const isProtect  = ["onboarding", "completion"].includes(node.type);
  const canAdd     = ["unit", "theory_block", "practice", "section", "case"].includes(node.type);

  let actions = "";
  if (canAdd) {
    actions += `<button class="tree-act-btn" data-tree-add="${node.id}" title="Добавить">${plusSvg()}</button>`;
  }
  if (node.type === "theory") {
    actions += `<button class="tree-act-btn" data-tree-rename="${node.id}" title="Переименовать">${pencilSvg()}</button>`;
  }
  if (!isRoot && !isProtect) {
    actions += `<button class="tree-act-btn" data-tree-dup="${node.id}" title="Дублировать">${dupSvg()}</button>`;
    actions += `<button class="tree-act-btn tree-act-btn--del" data-tree-del="${node.id}" title="Удалить">${xSvg()}</button>`;
  }

  const typeTag = isRoot
    ? `<span class="tree-type-tag">${node.type === "trainer" ? "Тренажёр" : "Экзамен"}</span>` : "";

  const row = `<div class="tree-row${sel ? " is-selected" : ""}" style="padding-left:${indent}px" data-tree-sel="${node.id}">
    ${hasKids
      ? `<button class="tree-toggle" data-tree-tog="${node.id}">${chevron(exp)}</button>`
      : `<span class="tree-toggle tree-toggle--leaf"></span>`}
    <span class="tree-icon">${icon}</span>
    <span class="tree-label" title="${esc(node.title)}">${esc(node.title)}</span>
    ${typeTag}
    ${actions ? `<div class="tree-actions">${actions}</div>` : ""}
  </div>`;

  const children = hasKids && exp
    ? `<ul class="bld-tree">${node.children.map(c => nodeHtml(c, depth + 1, false)).join("")}</ul>`
    : "";

  return `<li class="tree-item" data-id="${node.id}">${row}${children}</li>`;
}

function bindTreeEvents() {
  // Select
  dom.tree.querySelectorAll("[data-tree-sel]").forEach(el => {
    el.addEventListener("click", e => {
      if (e.target.closest("[data-tree-tog],[data-tree-add],[data-tree-del],[data-tree-rename],[data-tree-dup]")) return;
      selectNode(el.dataset.treeSel);
    });
  });
  // Toggle expand
  dom.tree.querySelectorAll("[data-tree-tog]").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const id = btn.dataset.treeTog;
      if (expanded.has(id)) expanded.delete(id); else expanded.add(id);
      renderTree();
    });
  });
  // Add child
  dom.tree.querySelectorAll("[data-tree-add]").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      addChildTo(btn.dataset.treeAdd);
    });
  });
  // Rename (inline)
  dom.tree.querySelectorAll("[data-tree-rename]").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const node = findNode(unit, btn.dataset.treeRename);
      if (!node) return;
      const row   = btn.closest(".tree-row");
      const label = row.querySelector(".tree-label");
      if (!label) return;

      const inp = document.createElement("input");
      inp.type      = "text";
      inp.className = "tree-rename-inp";
      inp.value     = node.title;
      label.replaceWith(inp);
      inp.focus();
      inp.select();

      let saved = false;
      function save() {
        if (saved) return;
        saved = true;
        const val = inp.value.trim();
        if (val) node.title = val;
        persistUnit();
        renderTree();
        if (selectedId === node.id) renderCenter();
      }

      inp.addEventListener("keydown", e => {
        if (e.key === "Enter")  { e.preventDefault(); save(); }
        if (e.key === "Escape") { saved = true; renderTree(); }
      });
      inp.addEventListener("blur", save);
    });
  });
  // Delete
  dom.tree.querySelectorAll("[data-tree-del]").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      deleteNodeById(btn.dataset.treeDel);
    });
  });
  // Duplicate
  dom.tree.querySelectorAll("[data-tree-dup]").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      duplicateNode(btn.dataset.treeDup);
    });
  });
}

/* ── Node operations ────────────────────────────── */
const CHILD_TYPES = {
  unit:         "practice",
  theory_block: "theory",
  practice:     "section",
  section:      "case",
  case:         "question",
};
const CHILD_TITLES = {
  practice: "Практический блок",
  theory:   "Теория",
  section:  "Раздел",
  case:     "Кейс",
  question: "Вопрос",
};

function addChildTo(parentId) {
  const parent = parentId === unit.id ? unit : findNode(unit, parentId);
  if (!parent) return;

  const childType = CHILD_TYPES[parent.type];
  if (!childType) return;

  // theory_block: only theory children, limit 3
  if (parent.type === "theory_block") {
    const theoryKids = parent.children.filter(c => c.type === "theory");
    if (theoryKids.length >= 3) { toast("Максимум 3 теории в одном блоке"); return; }
    const num     = theoryKids.length + 1;
    const newNode = makeNode("theory", `Теория ${num}`, [],
      { elements: [{ id: genId("el"), heading: "", text: "" }] });
    parent.children.push(newNode);
    expanded.add(parentId);
    persistUnit(); renderTree(); selectNode(newNode.id);
    return;
  }

  const num   = parent.children.length + 1;
  const title = `${CHILD_TITLES[childType] || "Элемент"} ${num}`;
  const content = childType === "question"
    ? { text: "", refAnswer: "", hints: [], feedback: "" }
    : childType === "theory"
      ? { elements: [{ id: genId("el"), heading: "", text: "" }] }
      : {};

  const newNode = makeNode(childType, title, [], content);
  parent.children.push(newNode);
  expanded.add(parentId);
  persistUnit();
  renderTree();
  selectNode(newNode.id);
}

function deleteNodeById(id) {
  const parent = findParent(unit, id);
  if (!parent) return;
  const idx = parent.children.findIndex(c => c.id === id);
  if (idx < 0) return;
  parent.children.splice(idx, 1);
  if (selectedId === id) {
    selectedId = parent.id === unit.id ? unit.id : parent.id;
  }
  persistUnit();
  renderTree();
  renderCenter();
  renderInspector();
}

function duplicateNode(id) {
  const parent = findParent(unit, id);
  if (!parent) return;
  const idx = parent.children.findIndex(c => c.id === id);
  if (idx < 0) return;

  function reId(n) {
    n.id = genId(n.type);
    (n.children || []).forEach(reId);
    if (n.content && n.content.elements) {
      n.content.elements.forEach(el => { el.id = genId("el"); });
    }
    if (n.content && n.content.queries) {
      n.content.queries.forEach(q => { q.id = genId("q"); });
    }
  }

  const cloned = JSON.parse(JSON.stringify(parent.children[idx]));
  reId(cloned);
  cloned.title = cloned.title + " (копия)";

  parent.children.splice(idx + 1, 0, cloned);
  expanded.add(parent.id);
  persistUnit();
  renderTree();
  selectNode(cloned.id);
  toast("✓ Дублировано");
}

function addTopBlock() {
  // Insert a new practice block before "completion"
  const num  = unit.children.filter(c => !["onboarding","completion"].includes(c.type)).length + 1;
  const q    = makeNode("question", "Вопрос 1",  [], { text: "", refAnswer: "", hints: [], feedback: "" });
  const c    = makeNode("case",     "Кейс 1",    [q],    { description: "" });
  const s    = makeNode("section",  "Раздел 1",  [c],    {});
  const blk  = makeNode("practice", `Практический блок ${num}`, [s], {});
  const ci   = unit.children.findIndex(ch => ch.type === "completion");
  if (ci >= 0) unit.children.splice(ci, 0, blk);
  else         unit.children.push(blk);
  expanded.add(unit.id);
  expanded.add(blk.id);
  persistUnit();
  renderTree();
  selectNode(blk.id);
}

/* ── Selection ──────────────────────────────────── */
function selectNode(id) {
  selectedId = id;
  renderTree();
  renderCenter();
  renderInspector();
}

/* ══════════════════════════════════════════════════
   CENTER RENDERING
   ══════════════════════════════════════════════════ */
function renderCenter() {
  if (!selectedId) {
    dom.center.innerHTML = `<div style="padding:40px;text-align:center;color:var(--muted-lt)">Выберите элемент в структуре</div>`;
    return;
  }

  if (selectedId === unit.id) return renderCUnit();
  const node = findNode(unit, selectedId);
  if (!node) return;

  switch (node.type) {
    case "onboarding":    return renderCOnboarding(node);
    case "completion":    return renderCBlock(node, "🏁", "Завершающий экран после прохождения");
    case "theory_block":  return renderCTheoryBlock(node);
    case "theory":        return renderCTheory(node);
    case "practice":      return renderCPractice(node);
    case "section":       return renderCSection(node);
    case "case":          return renderCCase(node);
    case "question":      return renderCQuestion(node);
    default:
      dom.center.innerHTML = `<div style="padding:40px;color:var(--muted-lt)">Неизвестный тип</div>`;
  }
}

/* ── Unit center ── */
function renderCUnit() {
  const sections  = countType(unit, "section");
  const cases     = countType(unit, "case");
  const questions = countType(unit, "question");
  const typeLabel = unit.type === "trainer" ? "Тренажёр" : "Экзамен";

  const coverHtml = unit.coverDataUrl
    ? `<img src="${esc(unit.coverDataUrl)}" alt="Обложка" />`
    : `<div class="cu-cover-ph">🖼️</div>`;

  function opts(arr, val, placeholder) {
    const ph = placeholder ? `<option value="">${esc(placeholder)}</option>` : "";
    return ph + arr.map(v => `<option value="${esc(v)}"${val === v ? " selected" : ""}>${esc(v)}</option>`).join("");
  }

  const curFactory = unit.factory || "";
  const dirOptions = (DIRECTION_MAP[curFactory] || []);
  const dirDisabled = dirOptions.length === 0;

  dom.center.innerHTML = `
<div class="cv">
  <div class="cu-cover cu-cover--edit" id="cu-cover-wrap" title="Нажмите для изменения обложки">
    ${coverHtml}
    <div class="cu-cover-overlay">
      <span class="cu-cover-overlay__icon">📷</span>
      <span class="cu-cover-overlay__text">${unit.coverDataUrl ? "Изменить обложку" : "Загрузить обложку"}</span>
    </div>
    <input type="file" id="cu-cover-input" accept="image/*" style="display:none" />
  </div>

  <div class="cu-type-row">
    <span class="cu-badge">${typeLabel}</span>
    <span class="cu-pub-badge cu-pub-badge--${unit.publicationStatus === "published" ? "pub" : "priv"}">
      ${unit.publicationStatus === "published" ? "Опубликовано" : "Черновик"}
    </span>
  </div>

  <div class="cu-edit-section">
    <div class="cu-edit-row">
      <div class="cu-edit-field cu-edit-field--half">
        <label class="cu-edit-lbl" for="cu-factory">Фабрика</label>
        <select class="cu-edit-input" id="cu-factory">
          ${opts(UNIT_FACTORIES, unit.factory || "", "Не выбрана")}
        </select>
      </div>
      <div class="cu-edit-field cu-edit-field--half">
        <label class="cu-edit-lbl" for="cu-direction">Направление</label>
        <select class="cu-edit-input" id="cu-direction"${dirDisabled ? " disabled" : ""}>
          <option value="">Не выбрано</option>
          ${dirOptions.map(d => `<option value="${esc(d)}"${unit.direction === d ? " selected" : ""}>${esc(d)}</option>`).join("")}
        </select>
      </div>
    </div>
    <div class="cu-edit-row">
      <div class="cu-edit-field cu-edit-field--half">
        <label class="cu-edit-lbl" for="cu-category">Категория</label>
        <select class="cu-edit-input" id="cu-category">
          ${opts(UNIT_CATEGORIES, unit.category || "", "Не выбрана")}
        </select>
      </div>
      <div class="cu-edit-field cu-edit-field--half">
        <label class="cu-edit-lbl" for="cu-topic">Тема</label>
        <select class="cu-edit-input" id="cu-topic">
          ${opts(UNIT_TOPICS, unit.topic || "", "Не выбрана")}
        </select>
      </div>
    </div>
    <div class="cu-edit-field">
      <label class="cu-edit-lbl" for="cu-duration">Длительность</label>
      <select class="cu-edit-input" id="cu-duration">
        ${opts(UNIT_DURATIONS, unit.durationLabel || "", "Не выбрана")}
      </select>
    </div>
    <div class="cu-edit-field">
      <label class="cu-edit-lbl" for="cu-desc">Описание</label>
      <textarea class="cu-edit-input cu-edit-textarea" id="cu-desc" rows="3"
        placeholder="Краткое описание единицы обучения...">${esc(unit.description || "")}</textarea>
    </div>
  </div>

  <div class="cu-stats">
    <div class="cu-stat"><span class="cu-stat__num">${sections}</span><span class="cu-stat__label">Разделов</span></div>
    <div class="cu-stat"><span class="cu-stat__num">${cases}</span><span class="cu-stat__label">Кейсов</span></div>
    <div class="cu-stat"><span class="cu-stat__num">${questions}</span><span class="cu-stat__label">Вопросов</span></div>
  </div>
</div>`;

  // Cover — opens crop modal
  const coverWrap  = document.getElementById("cu-cover-wrap");
  const coverInput = document.getElementById("cu-cover-input");
  coverWrap.addEventListener("click", () => coverInput.click());
  coverInput.addEventListener("change", e => {
    const file = e.target.files[0];
    if (!file) return;
    pendingBldCoverFile = file;
    const reader = new FileReader();
    reader.onload = ev => openBldCropModal(ev.target.result);
    reader.readAsDataURL(file);
  });

  document.getElementById("cu-factory").addEventListener("change", e => {
    unit.factory   = e.target.value;
    unit.direction = "";
    persistUnit();
    renderCenter();
  });
  document.getElementById("cu-direction").addEventListener("change", e => {
    unit.direction = e.target.value; persistUnit();
  });
  document.getElementById("cu-category").addEventListener("change", e => {
    unit.category = e.target.value; persistUnit();
  });
  document.getElementById("cu-topic").addEventListener("change", e => {
    unit.topic = e.target.value; persistUnit();
  });
  document.getElementById("cu-duration").addEventListener("change", e => {
    unit.durationLabel = e.target.value; persistUnit();
  });
  document.getElementById("cu-desc").addEventListener("input", e => {
    unit.description = e.target.value; persistUnit();
  });
}

/* ── Block center (onboarding / completion) ── */
function renderCBlock(node, icon, subtitle) {
  const els  = (node.content && node.content.elements) || [];

  const elsHtml = els.length
    ? `<div class="content-els" id="el-list">
        ${els.map(el => `
          <div class="content-el" data-el="${el.id}">
            <div contenteditable="true" class="ce-text" data-el-id="${el.id}"
                 data-ph="Введите текст...">${esc(el.text || "")}</div>
            <button class="content-el__del" data-del-el="${el.id}" title="Удалить элемент">×</button>
          </div>`).join("")}
       </div>`
    : `<div class="cb-empty">
         <div class="cb-empty-icon">📝</div>
         <div class="cb-empty-text">Нет содержимого</div>
       </div>`;

  dom.center.innerHTML = `
<div class="cv">
  <h2 class="cv-heading"><span class="cv-heading-icon">${icon}</span>${esc(node.title)}</h2>
  <p class="cv-subheading">${subtitle}</p>
  <div class="cb-area" id="cb-area">
    ${elsHtml}
    <button class="add-dashed" id="add-el-btn" style="margin-top:10px">
      ${plusSvg()} Добавить элемент
    </button>
  </div>
</div>`;

  document.getElementById("add-el-btn").addEventListener("click", () => {
    if (!node.content.elements) node.content.elements = [];
    node.content.elements.push({ id: genId("el"), type: "text", text: "" });
    persistUnit(); renderCenter();
  });

  dom.center.querySelectorAll(".ce-text[data-el-id]").forEach(el => {
    el.addEventListener("input", () => {
      const d = node.content.elements.find(e => e.id === el.dataset.elId);
      if (d) { d.text = el.innerText; persistUnit(); }
    });
  });

  dom.center.querySelectorAll("[data-del-el]").forEach(btn => {
    btn.addEventListener("click", () => {
      node.content.elements = (node.content.elements || []).filter(e => e.id !== btn.dataset.delEl);
      persistUnit(); renderCenter();
    });
  });
}

/* ── Onboarding center ── */
function renderCOnboarding(node) {
  if (!node.content) node.content = {};
  let els = node.content.elements || [];

  // Migrate old single-text format {id, type, text} → {id, heading, text}
  els = els.map(el => ({ id: el.id, heading: el.heading || "", text: el.text || "" }));
  // Ensure at least one element group
  if (els.length === 0) els.push({ id: genId("el"), heading: "", text: "" });
  node.content.elements = els;
  if (node.content.startBtnText === undefined) node.content.startBtnText = "Начать";

  const canAdd = els.length < 2;

  function infoIco(tip) {
    return `<span class="info-icon" tabindex="0">
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.4"/>
        <path d="M8 7.5v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <circle cx="8" cy="4.5" r=".85" fill="currentColor"/>
      </svg>
      <span class="info-tip">${esc(tip)}</span>
    </span>`;
  }

  const elHtml = els.map((el, idx) => {
    const isFirst = idx === 0;
    return `
    <div class="ob-el-group">
      ${!isFirst ? `<div class="ob-el-group__header">
        <span class="ob-el-group__num">Элемент ${idx + 1}</span>
        <button class="ob-el-del" data-del-el="${el.id}">${xSvg()} Удалить</button>
      </div>` : ""}
      <div class="ob-field-wrap">
        <div class="ob-lbl-row">
          <span class="field-lbl">Заголовок <span class="req-star">*</span></span>
          ${infoIco("Указанный текст будет отображаться в виде заголовка с жирным шрифтом большего размера, чем обычный текст")}
        </div>
        <input type="text" class="ob-inp ob-heading-inp" data-el-id="${el.id}"
               value="${esc(el.heading)}" placeholder="Например: Добро пожаловать в тренажер по кредитной карте" />
      </div>
      <div class="ob-field-wrap ob-field-wrap--last">
        <div class="ob-lbl-row">
          <span class="field-lbl">Текст</span>
        </div>
        <textarea class="cv-textarea ob-text-inp" data-el-id="${el.id}" rows="3"
          placeholder="Например: В данном обучении вы научитесь работать с кредитным картами и льготным периодом, а так же погрузитесь в тему перерасхода по счету">${esc(el.text)}</textarea>
      </div>
    </div>`;
  }).join("");

  dom.center.innerHTML = `
<div class="cv">
  <div class="cv-heading-row">
    <h2 class="cv-heading"><span class="cv-heading-icon">🚀</span>${esc(node.title)}</h2>
    <button class="bld-btn bld-btn--ghost" id="ob-preview-btn" type="button" style="flex-shrink:0;font-size:12px;padding:6px 12px">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="margin-right:5px">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>
      Предпросмотр
    </button>
  </div>
  <p class="cv-subheading">Введение в обучение для пользователя, укажите информацию с которой пользователь будет ознакомлен при его запуске</p>
  <div id="ob-el-list">${elHtml}</div>
  ${canAdd ? `<button class="add-dashed" id="add-ob-el" style="margin-top:4px">${plusSvg()} Добавить еще один элемент</button>` : ""}

  <div class="enrich-section" style="margin-top:20px">
    <div class="enrich-section__title">Кнопка перехода</div>
    <div class="ob-el-group">
      <div class="ob-field-wrap ob-field-wrap--last">
        <div class="ob-lbl-row">
          <span class="field-lbl">Текст кнопки</span>
          ${infoIco("После ознакомления с онбордингом пользователь нажимает эту кнопку, чтобы перейти к обучению. По умолчанию — «Начать»")}
        </div>
        <input type="text" class="ob-inp" id="ob-start-btn"
               value="${esc(node.content.startBtnText)}" placeholder="Начать" maxlength="60" />
      </div>
      <div class="next-btn-preview">
        <span class="next-btn-preview__lbl">Предпросмотр</span>
        <button class="next-btn-demo" disabled>
          <span id="ob-start-btn-preview">${esc(node.content.startBtnText) || "Начать"}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</div>`;

  dom.center.querySelectorAll(".ob-heading-inp").forEach(inp => {
    inp.addEventListener("input", () => {
      const d = node.content.elements.find(e => e.id === inp.dataset.elId);
      if (d) { d.heading = inp.value; persistUnit(); }
    });
  });

  dom.center.querySelectorAll(".ob-text-inp").forEach(ta => {
    ta.addEventListener("input", () => {
      const d = node.content.elements.find(e => e.id === ta.dataset.elId);
      if (d) { d.text = ta.value; persistUnit(); }
    });
  });

  dom.center.querySelectorAll("[data-del-el]").forEach(btn => {
    btn.addEventListener("click", () => {
      node.content.elements = node.content.elements.filter(e => e.id !== btn.dataset.delEl);
      persistUnit(); renderCenter();
    });
  });

  document.getElementById("add-ob-el")?.addEventListener("click", () => {
    if (node.content.elements.length < 2) {
      node.content.elements.push({ id: genId("el"), heading: "", text: "" });
      persistUnit(); renderCenter();
    }
  });

  document.getElementById("ob-start-btn")?.addEventListener("input", e => {
    node.content.startBtnText = e.target.value;
    const preview = document.getElementById("ob-start-btn-preview");
    if (preview) preview.textContent = e.target.value || "Начать";
    persistUnit();
  });

  document.getElementById("ob-preview-btn")?.addEventListener("click", () => openObPreview(node));
}

/* ── Theory block center ── */
function dragHandleSvg() {
  return `<svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor" aria-hidden="true">
    <circle cx="2.5" cy="2" r="1.2"/><circle cx="7.5" cy="2" r="1.2"/>
    <circle cx="2.5" cy="7" r="1.2"/><circle cx="7.5" cy="7" r="1.2"/>
    <circle cx="2.5" cy="12" r="1.2"/><circle cx="7.5" cy="12" r="1.2"/>
  </svg>`;
}

function renderCTheoryBlock(node) {
  const theories = (node.children || []).filter(ch => ch.type === "theory");
  const total    = theories.length;

  const seqHtml = theories.map((ch, idx) => `
    <div class="th-seq-item" draggable="true" data-th-id="${ch.id}">
      <div class="th-seq-item__track">
        <div class="th-seq-item__dot"></div>
        ${idx < total - 1 ? `<div class="th-seq-item__line"></div>` : ""}
      </div>
      <div class="item-card th-seq-item__card" data-goto="${ch.id}">
        <button class="th-drag-handle" title="Перетащите для изменения порядка" tabindex="-1">${dragHandleSvg()}</button>
        <span class="item-card__icon">${ICONS[ch.type] || "•"}</span>
        <span class="item-card__title">${esc(ch.title)}</span>
        <span class="item-card__arrow">›</span>
      </div>
    </div>`).join("");

  dom.center.innerHTML = `
<div class="cv">
  ${breadcrumbHtml(node.id)}
  <h2 class="cv-heading"><span class="cv-heading-icon">📚</span>${esc(node.title)}</h2>
  <p class="cv-subheading">Разделы теории следуют друг за другом — перетащите для изменения порядка</p>
  <div class="th-sequence" id="th-seq-list">
    ${seqHtml || noItems("Нет элементов")}
  </div>
  ${total < 3
    ? `<button class="add-dashed" id="add-th-btn">${plusSvg()} Добавить теорию</button>`
    : `<p style="font-size:12px;color:var(--muted-lt);margin:0">Достигнут максимум — 3 теоретических элемента на один блок</p>`}
</div>`;

  gotoCards();
  bindBreadcrumbs();
  document.getElementById("add-th-btn")?.addEventListener("click", () => addChildTo(node.id));
  bindTheoryDrag(node);
}

function bindTheoryDrag(node) {
  const list = document.getElementById("th-seq-list");
  if (!list) return;

  let draggedId = null;

  list.querySelectorAll(".th-seq-item[draggable]").forEach(item => {
    item.addEventListener("dragstart", e => {
      draggedId = item.dataset.thId;
      item.classList.add("th-dragging");
      e.dataTransfer.effectAllowed = "move";
    });
    item.addEventListener("dragend", () => {
      draggedId = null;
      list.querySelectorAll(".th-seq-item").forEach(i =>
        i.classList.remove("th-dragging", "th-drag-over"));
    });
    item.addEventListener("dragover", e => {
      e.preventDefault();
      if (item.dataset.thId === draggedId) return;
      list.querySelectorAll(".th-seq-item").forEach(i => i.classList.remove("th-drag-over"));
      item.classList.add("th-drag-over");
    });
    item.addEventListener("dragleave", () => {
      item.classList.remove("th-drag-over");
    });
    item.addEventListener("drop", e => {
      e.preventDefault();
      const targetId = item.dataset.thId;
      if (!draggedId || draggedId === targetId) return;

      const fromIdx = node.children.findIndex(c => c.id === draggedId);
      const toIdx   = node.children.findIndex(c => c.id === targetId);
      if (fromIdx < 0 || toIdx < 0) return;

      const [moved] = node.children.splice(fromIdx, 1);
      node.children.splice(toIdx, 0, moved);

      persistUnit();
      renderTree();
      renderCenter();
    });
  });
}

/* ── Theory center ── */
function renderCTheory(node) {
  if (!node.content) node.content = {};
  let els = node.content.elements || [];
  els = els.map(el => ({ id: el.id, heading: el.heading || "", text: el.text || "" }));
  if (els.length === 0) els.push({ id: genId("el"), heading: "", text: "" });
  node.content.elements = els;
  if (node.content.nextBtnText === undefined) node.content.nextBtnText = "Ознакомился, далее";

  // Migrate / normalise queries: drop per-query approved, use queriesApproved on content
  if (!node.content.queries || node.content.queries.length === 0) {
    node.content.queries = [{ id: genId("q"), text: "", response: "" }];
  } else {
    node.content.queries = node.content.queries.map(q => ({
      id: q.id || genId("q"), text: q.text || "", response: q.response || "",
    }));
    // Migrate old per-query approved flag → content level flag
    if (node.content.queriesApproved === undefined) {
      node.content.queriesApproved = node.content.queries.some(q => !!q.approved);
    }
  }
  if (node.content.queriesApproved === undefined) node.content.queriesApproved = false;
  if (node.content.queryPrompt === undefined) node.content.queryPrompt = "";

  const el0    = els[0];
  const queries = node.content.queries;

  // Shared state for the whole query group
  const isLoading   = loadingQueries.has(node.id);
  const isApproved  = !!node.content.queriesApproved;
  const isResponded = !isLoading && !isApproved && !!node.content.queryResponse;
  const locked      = isLoading || isResponded || isApproved;
  const allFilled   = queries.every(q => (q.text || "").trim().length > 0);

  function infoIco(tip, wide) {
    return `<span class="info-icon" tabindex="0">
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.4"/>
        <path d="M8 7.5v4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
        <circle cx="8" cy="4.5" r=".85" fill="currentColor"/>
      </svg>
      <span class="info-tip${wide ? " info-tip--wide" : ""}">${esc(tip)}</span>
    </span>`;
  }

  function planeSvg() {
    return `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>`;
  }

  const queryItemsHtml = queries.map((q, i) => `
    <div class="query-item">
      <div class="query-item__header">
        <span class="query-item__label">Запрос ${i + 1}</span>
        ${queries.length > 1 && !locked
          ? `<button class="query-item__del" data-del-q="${q.id}" title="Удалить запрос">${xSvg()}</button>`
          : ""}
      </div>
      <textarea class="query-textarea${locked ? " query-textarea--locked" : ""}"
        ${locked ? "disabled" : ""} data-qid="${q.id}"
        placeholder="Например: Какая комиссия за услугу уведомлений по дебетовой карте">${esc(q.text)}</textarea>
    </div>`).join("");

  const sharedResponseHtml = (isResponded || isApproved) && node.content.queryResponse ? `
    <div class="query-response${isApproved ? " query-response--approved" : ""}">
      <div class="query-response__title">Ответ</div>
      <div class="query-response__text">${esc(node.content.queryResponse)}</div>
    </div>` : "";

  const queryFooterHtml = isLoading
    ? `<div class="query-sending"><span class="query-spinner"></span>Отправляем запросы...</div>`
    : isApproved
      ? `<div class="query-approved-note">
          <svg width="13" height="13" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Все запросы утверждены
        </div>`
      : isResponded
        ? `<div class="query-actions">
            <button class="query-approve-btn" id="approve-all-btn">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Утвердить запросы
            </button>
            <button class="query-change-btn" id="change-all-btn">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Изменить запросы
            </button>
          </div>`
        : `<button class="query-send-btn" id="send-all-btn"${allFilled ? "" : " disabled"}>
            ${planeSvg()} Отправить
          </button>`;

  dom.center.innerHTML = `
<div class="cv">
  ${breadcrumbHtml(node.id)}
  <h2 class="cv-heading"><span class="cv-heading-icon">📄</span>${esc(node.title)}</h2>
  <p class="cv-subheading">Обучение сотрудника. Вы можете настроить теорию, которая будет отображена сотруднику</p>
  <div class="cv-section-lbl">Описание</div>
  <div class="ob-el-group">
    <div class="ob-field-wrap">
      <div class="ob-lbl-row">
        <span class="field-lbl">Заголовок <span class="req-star">*</span></span>
        ${infoIco("Указанный вами заголовок будет отображаться над теорией полученной из A-Book")}
      </div>
      <input type="text" class="ob-inp ob-heading-inp" data-el-id="${el0.id}"
             value="${esc(el0.heading)}" placeholder="Введите заголовок..." />
    </div>
    <div class="ob-field-wrap ob-field-wrap--last">
      <div class="ob-lbl-row">
        <span class="field-lbl">Текст</span>
        ${infoIco("Указанный вами текст будет отображаться над теорией полученной из A-Book")}
      </div>
      <textarea class="cv-textarea ob-text-inp" data-el-id="${el0.id}" rows="3"
        placeholder="Введите описание к теоретическому материалу...">${esc(el0.text)}</textarea>
    </div>
  </div>

  <div class="enrich-section">
    <div class="enrich-section__title-row">
      <span class="enrich-section__title">Обогащение из базы знаний</span>
      ${infoIco("Укажите запросы в A-Book — система будет отправлять их в базу знаний во время прохождения сотрудником обучения. Можно добавить до 5 запросов.", true)}
    </div>
    <div class="query-card${isApproved ? " query-card--approved" : ""}">
      <div class="query-card__header">
        <span class="query-card__title">Тестовые запросы в A-Book</span>
      </div>
      <div class="query-item query-item--prompt">
        <div class="query-item__header">
          <span class="query-item__label">Промпт</span>
        </div>
        <textarea class="query-textarea${locked ? " query-textarea--locked" : ""}"
          id="query-prompt-inp" ${locked ? "disabled" : ""}
          placeholder="Например: Оформи полученную информацию из ABook в виде обучающего текста простым языком">${esc(node.content.queryPrompt)}</textarea>
      </div>
      <div id="query-items-list">${queryItemsHtml}</div>
      ${!locked && queries.length < 5
        ? `<button class="add-dashed add-dashed--sm" id="add-query-btn" style="margin-top:8px;width:100%">${plusSvg()} Добавить запрос</button>`
        : ""}
      ${sharedResponseHtml}
      <div class="query-footer">${queryFooterHtml}</div>
    </div>
  </div>

  <div class="enrich-section">
    <div class="enrich-section__title">Переход к следующему блоку</div>
    <p class="enrich-section__desc">После прочтения теории сотруднику отображается кнопка для перехода к следующему шагу обучения. Здесь вы можете настроить её текст — он будет виден пользователю в чате.</p>
    <div class="ob-el-group">
      <div class="ob-field-wrap ob-field-wrap--last">
        <div class="ob-lbl-row">
          <span class="field-lbl">Текст кнопки</span>
        </div>
        <input type="text" class="ob-inp" id="next-btn-text"
               value="${esc(node.content.nextBtnText)}"
               placeholder="Ознакомился, далее" />
      </div>
      <div class="next-btn-preview">
        <span class="next-btn-preview__lbl">Предпросмотр</span>
        <button class="next-btn-demo" disabled>
          <span id="next-btn-preview-text">${esc(node.content.nextBtnText) || "Ознакомился, далее"}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</div>`;

  // Overlay when rubric not selected yet
  if (!node.settings.abookRubric) {
    const overlay = document.createElement("div");
    overlay.className = "theory-lock-overlay";
    overlay.innerHTML = `
      <div class="theory-lock-msg">
        <div class="theory-lock-msg__icon">🔗</div>
        <div class="theory-lock-msg__title">Выберите рубрику</div>
        <div class="theory-lock-msg__sub">Укажите рубрику A-Book в панели настроек справа, чтобы продолжить настройку блока теории</div>
        <div class="theory-lock-msg__arrow">Настройки →</div>
      </div>`;
    dom.center.appendChild(overlay);
  }

  bindBreadcrumbs();

  document.getElementById("query-prompt-inp")?.addEventListener("input", e => {
    node.content.queryPrompt = e.target.value; persistUnit();
  });

  dom.center.querySelector(".ob-heading-inp")?.addEventListener("input", e => {
    el0.heading = e.target.value; persistUnit();
  });
  dom.center.querySelector(".ob-text-inp")?.addEventListener("input", e => {
    el0.text = e.target.value; persistUnit();
  });

  document.getElementById("next-btn-text")?.addEventListener("input", e => {
    node.content.nextBtnText = e.target.value;
    const preview = document.getElementById("next-btn-preview-text");
    if (preview) preview.textContent = e.target.value || "Ознакомился, далее";
    persistUnit();
  });

  // Query textareas — save + update send button enabled state
  function updateSendBtn() {
    const btn = document.getElementById("send-all-btn");
    if (btn) btn.disabled = !queries.every(q => (q.text || "").trim().length > 0);
  }

  dom.center.querySelectorAll(".query-textarea[data-qid]").forEach(ta => {
    ta.addEventListener("input", () => {
      const q = queries.find(q => q.id === ta.dataset.qid);
      if (q) { q.text = ta.value; persistUnit(); }
      updateSendBtn();
    });
  });

  // Delete a query
  dom.center.querySelectorAll("[data-del-q]").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = queries.findIndex(q => q.id === btn.dataset.delQ);
      if (idx >= 0 && queries.length > 1) {
        queries.splice(idx, 1);
        persistUnit(); renderCenter();
      }
    });
  });

  // Add a query
  document.getElementById("add-query-btn")?.addEventListener("click", () => {
    if (queries.length < 5) {
      queries.push({ id: genId("q"), text: "", response: "" });
      persistUnit(); renderCenter();
    }
  });

  // Send all
  document.getElementById("send-all-btn")?.addEventListener("click", () => {
    // Sync latest textarea values before sending
    dom.center.querySelectorAll(".query-textarea[data-qid]").forEach(ta => {
      const q = queries.find(q => q.id === ta.dataset.qid);
      if (q) q.text = ta.value;
    });
    persistUnit();
    loadingQueries.add(node.id);
    renderCenter();
    setTimeout(() => {
      loadingQueries.delete(node.id);
      node.content.queryResponse = MOCK_ABOOK_RESP;
      persistUnit(); renderCenter();
    }, 3000);
  });

  // Approve all
  document.getElementById("approve-all-btn")?.addEventListener("click", () => {
    node.content.queriesApproved = true;
    persistUnit(); renderCenter();
  });

  // Change all (reset response)
  document.getElementById("change-all-btn")?.addEventListener("click", () => {
    node.content.queryResponse = "";
    node.content.queriesApproved = false;
    persistUnit(); renderCenter();
  });

}

/* ── Generic list drag-to-reorder ── */
function bindItemListDrag(node, listId) {
  const list = document.getElementById(listId);
  if (!list) return;
  let draggedId = null;

  list.querySelectorAll(".th-seq-item[draggable]").forEach(item => {
    item.addEventListener("dragstart", e => {
      draggedId = item.dataset.itemId;
      item.classList.add("th-dragging");
      e.dataTransfer.effectAllowed = "move";
    });
    item.addEventListener("dragend", () => {
      draggedId = null;
      list.querySelectorAll(".th-seq-item").forEach(i =>
        i.classList.remove("th-dragging", "th-drag-over"));
    });
    item.addEventListener("dragover", e => {
      e.preventDefault();
      if (item.dataset.itemId === draggedId) return;
      list.querySelectorAll(".th-seq-item").forEach(i => i.classList.remove("th-drag-over"));
      item.classList.add("th-drag-over");
    });
    item.addEventListener("dragleave", () => item.classList.remove("th-drag-over"));
    item.addEventListener("drop", e => {
      e.preventDefault();
      const targetId = item.dataset.itemId;
      if (!draggedId || draggedId === targetId) return;
      const fromIdx = node.children.findIndex(c => c.id === draggedId);
      const toIdx   = node.children.findIndex(c => c.id === targetId);
      if (fromIdx < 0 || toIdx < 0) return;
      const [moved] = node.children.splice(fromIdx, 1);
      node.children.splice(toIdx, 0, moved);
      persistUnit();
      renderTree();
      renderCenter();
    });
  });
}

/* ── Practice center ── */
function renderCPractice(node) {
  const total = (node.children || []).length;
  const seqHtml = (node.children || []).map((s, idx) => `
    <div class="th-seq-item" draggable="true" data-item-id="${s.id}">
      <div class="th-seq-item__track">
        <div class="th-seq-item__dot"></div>
        ${idx < total - 1 ? `<div class="th-seq-item__line"></div>` : ""}
      </div>
      <div class="item-card th-seq-item__card" data-goto="${s.id}">
        <button class="th-drag-handle" title="Перетащите для изменения порядка" tabindex="-1">${dragHandleSvg()}</button>
        <span class="item-card__icon">📁</span>
        <span class="item-card__title">${esc(s.title)}</span>
        <span class="item-card__meta">${countType(s,"case")} кейс · ${countType(s,"question")} вопр.</span>
        <span class="item-card__arrow">›</span>
      </div>
    </div>`).join("");

  dom.center.innerHTML = `
<div class="cv">
  ${breadcrumbHtml(node.id)}
  <h2 class="cv-heading"><span class="cv-heading-icon">🎯</span>${esc(node.title)}</h2>
  <p class="cv-subheading">Разделы следуют друг за другом — перетащите для изменения порядка</p>
  <div class="th-sequence" id="prac-seq-list">${seqHtml || noItems("Нет разделов")}</div>
  <button class="add-dashed" id="add-sec-btn">${plusSvg()} Добавить раздел</button>
</div>`;

  gotoCards();
  bindBreadcrumbs();
  document.getElementById("add-sec-btn").addEventListener("click", () => addChildTo(node.id));
  bindItemListDrag(node, "prac-seq-list");
}

/* ── Section center ── */
function renderCSection(node) {
  const total = (node.children || []).length;
  const seqHtml = (node.children || []).map((c, idx) => `
    <div class="th-seq-item" draggable="true" data-item-id="${c.id}">
      <div class="th-seq-item__track">
        <div class="th-seq-item__dot"></div>
        ${idx < total - 1 ? `<div class="th-seq-item__line"></div>` : ""}
      </div>
      <div class="item-card th-seq-item__card" data-goto="${c.id}">
        <button class="th-drag-handle" title="Перетащите для изменения порядка" tabindex="-1">${dragHandleSvg()}</button>
        <span class="item-card__icon">💼</span>
        <span class="item-card__title">${esc(c.title)}</span>
        <span class="item-card__meta">${countType(c,"question")} вопр.</span>
        <span class="item-card__arrow">›</span>
      </div>
    </div>`).join("");

  dom.center.innerHTML = `
<div class="cv">
  ${breadcrumbHtml(node.id)}
  <div class="cv-title-row">
    <span class="cv-heading-icon">📁</span>
    <input class="cv-title-inp" id="node-title-inp" type="text"
           value="${esc(node.title)}" maxlength="120" autocomplete="off" />
  </div>
  <p class="cv-subheading">Кейсы следуют друг за другом — перетащите для изменения порядка</p>
  <div class="th-sequence" id="sec-seq-list">${seqHtml || noItems("Нет кейсов")}</div>
  <button class="add-dashed" id="add-case-btn">${plusSvg()} Добавить кейс</button>
</div>`;

  gotoCards();
  bindBreadcrumbs();
  bindNodeTitleInp(node);
  document.getElementById("add-case-btn").addEventListener("click", () => addChildTo(node.id));
  bindItemListDrag(node, "sec-seq-list");
}

/* ── Case center ── */
function renderCCase(node) {
  const desc = (node.content && node.content.description) || "";
  const qs   = (node.children || []);

  const qHtml = qs.map((q, i) => `
    <div class="q-item" data-goto="${q.id}">
      <span class="q-item__num">${i + 1}</span>
      <span class="q-item__title">${esc(q.title)}</span>
      <span class="q-item__check">${q.content && q.content.text ? "✓" : "—"}</span>
    </div>`).join("");

  dom.center.innerHTML = `
<div class="cv">
  ${breadcrumbHtml(node.id)}
  <div class="cv-title-row">
    <span class="cv-heading-icon">💼</span>
    <input class="cv-title-inp" id="node-title-inp" type="text"
           value="${esc(node.title)}" maxlength="120" autocomplete="off" />
  </div>
  <p class="cv-subheading">Сценарий кейса и список вопросов</p>
  <div class="field-block">
    <label class="field-lbl" for="case-desc">Описание кейса</label>
    <textarea class="cv-textarea" id="case-desc" rows="3"
      placeholder="Опишите контекст или сценарий для этого кейса...">${esc(desc)}</textarea>
  </div>
  <div class="field-block">
    <div class="field-lbl" style="margin-bottom:10px">Вопросы (${qs.length})</div>
    <div class="q-list">${qHtml || noItems("Нет вопросов")}</div>
    <div class="btn-row">
      <button class="add-dashed add-dashed--sm" id="add-q-btn">${plusSvg()} Добавить вопрос</button>
      <button class="add-dashed add-dashed--sm" id="add-5q-btn">${plusSvg()} Добавить 5 вопросов</button>
    </div>
  </div>
</div>`;

  bindNodeTitleInp(node);

  document.getElementById("case-desc").addEventListener("input", e => {
    if (!node.content) node.content = {};
    node.content.description = e.target.value;
    persistUnit();
  });

  gotoCards();
  bindBreadcrumbs();

  document.getElementById("add-q-btn").addEventListener("click", () => addChildTo(node.id));

  document.getElementById("add-5q-btn").addEventListener("click", () => {
    for (let i = 0; i < 5; i++) {
      const num = node.children.length + 1;
      node.children.push(makeNode("question", `Вопрос ${num}`, [], { text: "", refAnswer: "", hints: [], feedback: "" }));
    }
    expanded.add(node.id);
    persistUnit(); renderTree(); renderCenter();
  });
}

/* ── Question center ── */
function renderCQuestion(node) {
  const c      = node.content || {};
  const hints  = c.hints || [];

  const hintsHtml = hints.map((h, i) => `
    <div class="hint-item">
      <span class="hint-item__num">${i + 1}.</span>
      <input type="text" class="hint-input" data-hi="${i}" value="${esc(h)}"
             placeholder="Подсказка ${i + 1}..." />
      <button class="hint-item__del" data-del-hint="${i}" title="Удалить">×</button>
    </div>`).join("");

  dom.center.innerHTML = `
<div class="cv">
  ${breadcrumbHtml(node.id)}
  <div class="cv-title-row">
    <span class="cv-heading-icon">❓</span>
    <input class="cv-title-inp" id="node-title-inp" type="text"
           value="${esc(node.title)}" maxlength="120" autocomplete="off" />
  </div>
  <p class="cv-subheading">Вопрос к участнику и эталонный ответ</p>

  <div class="field-block">
    <label class="field-lbl">Текст вопроса</label>
    <div contenteditable="true" id="q-text" class="cv-editor"
         data-ph="Сформулируйте вопрос для участника...">${esc(c.text || "")}</div>
  </div>

  <div class="field-block">
    <label class="field-lbl">Эталонный ответ</label>
    <div contenteditable="true" id="q-ref" class="cv-editor"
         data-ph="Образцовый ответ — ориентир для ИИ при оценке...">${esc(c.refAnswer || "")}</div>
  </div>

  <div class="field-block">
    <div class="field-lbl" style="margin-bottom:10px">Подсказки</div>
    <div class="hint-list" id="hint-list">${hintsHtml}</div>
    <button class="add-dashed add-dashed--sm" id="add-hint-btn">${plusSvg()} Добавить подсказку</button>
  </div>
</div>`;

  bindBreadcrumbs();
  bindNodeTitleInp(node);

  document.getElementById("q-text").addEventListener("input", e => {
    if (!node.content) node.content = {};
    node.content.text = e.currentTarget.innerText;
    persistUnit();
  });

  document.getElementById("q-ref").addEventListener("input", e => {
    if (!node.content) node.content = {};
    node.content.refAnswer = e.currentTarget.innerText;
    persistUnit();
  });

  dom.center.querySelectorAll(".hint-input").forEach(inp => {
    inp.addEventListener("input", () => {
      const idx = parseInt(inp.dataset.hi);
      if (!node.content.hints) node.content.hints = [];
      node.content.hints[idx] = inp.value;
      persistUnit();
    });
  });

  dom.center.querySelectorAll("[data-del-hint]").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.delHint);
      (node.content.hints || []).splice(idx, 1);
      persistUnit(); renderCenter();
    });
  });

  document.getElementById("add-hint-btn").addEventListener("click", () => {
    if (!node.content) node.content = {};
    if (!node.content.hints) node.content.hints = [];
    node.content.hints.push("");
    persistUnit(); renderCenter();
  });
}

/* ── Center helpers ── */
function gotoCards() {
  dom.center.querySelectorAll("[data-goto]").forEach(el => {
    el.addEventListener("click", () => selectNode(el.dataset.goto));
  });
}

function noItems(text) {
  return `<p style="color:var(--muted-lt);font-size:13px;margin:4px 0">${text}</p>`;
}

/* ══════════════════════════════════════════════════
   INSPECTOR RENDERING
   ══════════════════════════════════════════════════ */
function renderInspector() {
  if (!selectedId) {
    dom.inspTitle.textContent = "Инспектор";
    dom.inspBody.innerHTML = emptyInsp("Выберите элемент в структуре, чтобы увидеть его настройки");
    return;
  }

  if (selectedId === unit.id) return renderIUnit();
  const node = findNode(unit, selectedId);
  if (!node) return;

  switch (node.type) {
    case "question":    return renderIQuestion(node);
    case "case":        return renderICase(node);
    case "section":     return renderISection(node);
    case "theory":      return renderITheory(node);
    default:            return renderIPassthrough(node);
  }
}

/* ── Inspector group builder ── */
function ig(id, icon, label, bodyHtml, open) {
  return `<div class="ig${open ? " is-open" : ""}" id="ig-${id}">
  <button class="ig__head" type="button">
    <span class="ig__icon">${icon}</span>
    <span class="ig__label">${label}</span>
    <svg class="ig__chev" width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path d="M2.5 4L5 6.5L7.5 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </button>
  <div class="ig__body">${bodyHtml}</div>
</div>`;
}

function igField(label, html, inherited) {
  const badge = inherited ? `<span class="igf__inh">унаследовано</span>` : "";
  return `<div class="igf">
  <div class="igf__label">${label} ${badge}</div>
  ${html}
</div>`;
}

function igSelect(id, opts, val) {
  const options = opts.map(([v, l]) => `<option value="${v}"${v === val ? " selected" : ""}>${l}</option>`).join("");
  return `<select id="${id}">${options}</select>`;
}

/* ── Unit inspector ── */
function renderIUnit() {
  dom.inspTitle.textContent = "Единица обучения";
  const s = unit.settings || {};

  dom.inspBody.innerHTML =
    ig("fail", "📊", "Продуктовая оценка", igField("Политика при провале", igSelect("ig-fail", [
      ["retry", "Повторная попытка"],
      ["end",   "Завершить сессию"],
      ["skip",  "Перейти к следующему"],
    ], s.failPolicy)), true) +

    ig("tov", "🗣️", "TOV — тональность", igField("Стиль общения", igSelect("ig-tov", [
      ["neutral",  "Нейтральный"],
      ["formal",   "Официальный"],
      ["friendly", "Дружелюбный"],
    ], s.tov)), true) +

    ig("aht", "⏱️", "AHT — время ответа", igField("Таргет (сек)",
      `<input type="number" id="ig-aht" value="${s.ahtTarget || 120}" min="10" max="600" />`)) +

    ig("silence", "🔇", "Молчание", igField("Порог тишины (сек)",
      `<input type="number" id="ig-silence" value="${s.silenceThreshold || 10}" min="5" max="120" />`)) +

    ig("hints", "💡", "Подсказки", igField("Политика подсказок", igSelect("ig-hints", [
      ["on_request", "По запросу"],
      ["always",     "Всегда показывать"],
      ["disabled",   "Отключено"],
    ], s.hintPolicy))) +

    ig("fb", "💬", "Обратная связь", igField("Тип по умолчанию", igSelect("ig-fb", [
      ["text",  "Текстовая"],
      ["score", "Оценка (баллы)"],
      ["none",  "Без обратной связи"],
    ], s.defaultFeedback)));

  bindIToggles();

  const bind = (id, key, parse) => {
    document.getElementById(id)?.addEventListener("change", e => {
      unit.settings[key] = parse ? parseInt(e.target.value) : e.target.value;
      persistUnit();
    });
  };
  bind("ig-fail",    "failPolicy");
  bind("ig-tov",     "tov");
  bind("ig-aht",     "ahtTarget",        true);
  bind("ig-silence", "silenceThreshold", true);
  bind("ig-hints",   "hintPolicy");
  bind("ig-fb",      "defaultFeedback");
}

/* ── Section inspector ── */
function renderISection(node) {
  dom.inspTitle.textContent = "Раздел";
  const us = unit.settings || {};

  dom.inspBody.innerHTML =
    ig("fail", "📊", "Оценка", igField("Политика при провале",
      igSelect("ig-sec-fail", [
        ["inherit", `По умолчанию (${failLbl(us.failPolicy)})`],
        ["retry",   "Повторная попытка"],
        ["end",     "Завершить сессию"],
        ["skip",    "Перейти к следующему"],
      ], node.settings.failPolicy || "inherit"), true), true) +

    ig("hints", "💡", "Подсказки", igField("Политика",
      igSelect("ig-sec-hints", [
        ["inherit",    `По умолчанию (${hintLbl(us.hintPolicy)})`],
        ["on_request", "По запросу"],
        ["always",     "Всегда"],
        ["disabled",   "Отключено"],
      ], node.settings.hintPolicy || "inherit"), true)) +

    ig("fb", "💬", "Обратная связь", igField("Тип",
      igSelect("ig-sec-fb", [
        ["inherit", "По умолчанию"],
        ["text",    "Текстовая"],
        ["score",   "Баллы"],
        ["none",    "Без обратной связи"],
      ], node.settings.defaultFeedback || "inherit"), true));

  bindIToggles();

  const bind = (id, key) => {
    document.getElementById(id)?.addEventListener("change", e => {
      const v = e.target.value;
      node.settings[key] = v === "inherit" ? undefined : v;
      persistUnit();
    });
  };
  bind("ig-sec-fail",  "failPolicy");
  bind("ig-sec-hints", "hintPolicy");
  bind("ig-sec-fb",    "defaultFeedback");
}

/* ── Case inspector ── */
function renderICase(node) {
  dom.inspTitle.textContent = "Кейс";
  const rags = node.settings.ragSources || [];

  const ragHtml = rags.map((src, i) => `
    <div class="rag-item">
      <span class="rag-item__name">${esc(src)}</span>
      <button class="rag-item__del" data-del-rag="${i}" title="Удалить">×</button>
    </div>`).join("");

  dom.inspBody.innerHTML =
    ig("rag", "🔗", "Привязка к знаниям",
      `<div class="rag-list" id="rag-list">${ragHtml}</div>
       <button class="add-dashed add-dashed--sm" id="add-rag" style="width:100%">${plusSvg()} Добавить источник</button>`, true) +

    ig("aht", "⏱️", "AHT — время", igField("Таргет (сек)",
      `<input type="number" id="ig-case-aht" value="${node.settings.ahtTarget || ""}" min="10" max="600" placeholder="Из единицы" />`, true)) +

    ig("hints-max", "💡", "Подсказки", igField("Максимум подсказок",
      `<input type="number" id="ig-case-hmax" value="${node.settings.hintsMax || ""}" min="0" max="10" placeholder="Из единицы" />`, true));

  bindIToggles();
  bindRagList(node);

  document.getElementById("ig-case-aht")?.addEventListener("change", e => {
    node.settings.ahtTarget = parseInt(e.target.value) || undefined;
    persistUnit();
  });
  document.getElementById("ig-case-hmax")?.addEventListener("change", e => {
    node.settings.hintsMax = parseInt(e.target.value) || undefined;
    persistUnit();
  });
}

/* ── Question inspector ── */
function renderIQuestion(node) {
  dom.inspTitle.textContent = "Вопрос";
  const rags = node.settings.ragSources || [];

  const ragHtml = rags.map((src, i) => `
    <div class="rag-item">
      <span class="rag-item__name">${esc(src)}</span>
      <button class="rag-item__del" data-del-rag="${i}" title="Удалить">×</button>
    </div>`).join("");

  dom.inspBody.innerHTML =
    ig("fb", "💬", "Обратная связь", igField("Тип",
      igSelect("ig-q-fb", [
        ["inherit", "По умолчанию"],
        ["text",    "Текстовая"],
        ["score",   "Баллы"],
        ["none",    "Без обратной связи"],
      ], node.settings.feedbackType || "inherit"), true), true) +

    ig("criteria", "✅", "Критерии оценки",
      `<div class="igf">
        <textarea id="ig-criteria" placeholder="Опишите критерии для ИИ-оценки ответа...">${esc(node.settings.criteria || "")}</textarea>
       </div>`) +

    ig("rag", "🔗", "Привязка к знаниям",
      `<div class="rag-list" id="rag-list">${ragHtml}</div>
       <button class="add-dashed add-dashed--sm" id="add-rag" style="width:100%">${plusSvg()} Добавить источник</button>`) +

    ig("hint-type", "💡", "Тип подсказок", igField("Вид",
      igSelect("ig-hint-type", [
        ["text",    "Текстовые"],
        ["partial", "Частичный ответ"],
        ["context", "Контекстная помощь"],
      ], node.settings.hintType || "text")));

  bindIToggles();
  bindRagList(node);

  document.getElementById("ig-q-fb")?.addEventListener("change", e => {
    node.settings.feedbackType = e.target.value === "inherit" ? undefined : e.target.value;
    persistUnit();
  });
  document.getElementById("ig-criteria")?.addEventListener("input", e => {
    node.settings.criteria = e.target.value;
    persistUnit();
  });
  document.getElementById("ig-hint-type")?.addEventListener("change", e => {
    node.settings.hintType = e.target.value;
    persistUnit();
  });
}

/* ── Theory inspector ── */
function renderITheory(node) {
  dom.inspTitle.textContent = "Теория";
  if (!node.settings) node.settings = {};
  const s = node.settings;

  const rubrics = [
    ["", "Выберите рубрику..."],
    ["retail",    "Розничный бизнес"],
    ["corporate", "Корпоративный бизнес"],
    ["digital",   "Цифровые продукты"],
    ["sme",       "МСБ"],
  ];
  const sections = [
    ["", "Выберите раздел..."],
    ["credits",   "Кредитование"],
    ["debit",     "Дебетовые карты"],
    ["deposits",  "Вклады"],
    ["insurance", "Страхование"],
  ];
  const articles = [
    ["", "Статьи раздела"],
  ];

  const restrict = !!s.abookRestrict;

  dom.inspBody.innerHTML = ig("abook", "🔗", "Информация из A-Book", `
    <p class="ig-desc">Выберите из какой рубрики получать информацию</p>
    <div class="igf">
      <div class="igf__label">Область поиска</div>
      <select id="ig-th-rubric">
        ${rubrics.map(([v, l]) => `<option value="${v}"${v === (s.abookRubric || "") ? " selected" : ""}>${l}</option>`).join("")}
      </select>
    </div>
    <div class="igf ig-toggle-row">
      <label class="ig-toggle">
        <input type="checkbox" id="ig-th-restrict" ${restrict ? "checked" : ""} />
        <span class="ig-toggle__track"></span>
        <span class="ig-toggle__label">Ограничить поиск по разделам рубрики</span>
      </label>
    </div>
    <div id="ig-section-block"${!restrict ? ' style="display:none"' : ""}>
      <div class="igf">
        <div class="igf__label">Раздел</div>
        <select id="ig-th-section">
          ${sections.map(([v, l]) => `<option value="${v}"${v === (s.abookSection || "") ? " selected" : ""}>${l}</option>`).join("")}
        </select>
        <select id="ig-th-articles" style="margin-top:8px">
          ${articles.map(([v, l]) => `<option value="${v}"${v === (s.abookArticles || "") ? " selected" : ""}>${l}</option>`).join("")}
        </select>
        <div class="ig-hint">При выборе статей поиск будет осуществляться только по ним</div>
      </div>
    </div>
  `, true);

  bindIToggles();

  document.getElementById("ig-th-rubric")?.addEventListener("change", e => {
    s.abookRubric = e.target.value; persistUnit(); renderCenter();
  });
  document.getElementById("ig-th-restrict")?.addEventListener("change", e => {
    s.abookRestrict = e.target.checked;
    document.getElementById("ig-section-block").style.display = e.target.checked ? "" : "none";
    persistUnit();
  });
  document.getElementById("ig-th-section")?.addEventListener("change", e => {
    s.abookSection = e.target.value; persistUnit();
  });
  document.getElementById("ig-th-articles")?.addEventListener("change", e => {
    s.abookArticles = e.target.value; persistUnit();
  });
}

/* ── Pass-through inspector ── */
function renderIPassthrough(node) {
  dom.inspTitle.textContent = node.title;
  dom.inspBody.innerHTML = `
<div class="insp-empty">
  <div class="insp-empty__icon">${ICONS[node.type] || "•"}</div>
  Настройки этого элемента управляются на уровне родительских сущностей.
  <br><br>
  Выберите <strong>Вопрос</strong>, <strong>Кейс</strong> или <strong>Раздел</strong>,
  чтобы настроить параметры.
</div>`;
}

/* ── Inspector helpers ── */
function emptyInsp(text) {
  return `<div class="insp-empty"><div class="insp-empty__icon">🎛️</div>${text}</div>`;
}

function bindIToggles() {
  dom.inspBody.querySelectorAll(".ig__head").forEach(btn => {
    btn.addEventListener("click", () => btn.closest(".ig").classList.toggle("is-open"));
  });
}

function bindRagList(node) {
  dom.inspBody.querySelectorAll("[data-del-rag]").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.delRag);
      (node.settings.ragSources || []).splice(idx, 1);
      persistUnit(); renderInspector();
    });
  });

  document.getElementById("add-rag")?.addEventListener("click", () => {
    const src = prompt("Введите название источника знаний (документ, раздел базы знаний):");
    if (src && src.trim()) {
      if (!node.settings.ragSources) node.settings.ragSources = [];
      node.settings.ragSources.push(src.trim());
      persistUnit(); renderInspector();
    }
  });
}

function failLbl(v) { return { retry: "Повтор", end: "Завершение", skip: "Пропуск" }[v] || "—"; }
function hintLbl(v) { return { on_request: "По запросу", always: "Всегда", disabled: "Откл." }[v] || "—"; }

/* ── HTML escape ────────────────────────────────── */
function esc(s) {
  return String(s || "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/* ── Toast ──────────────────────────────────────── */
let toastTm = null;
function toast(msg, ms) {
  clearTimeout(toastTm);
  dom.toast.textContent = msg;
  dom.toast.removeAttribute("aria-hidden");
  dom.toast.classList.add("is-vis");
  toastTm = setTimeout(() => {
    dom.toast.classList.remove("is-vis");
    setTimeout(() => dom.toast.setAttribute("aria-hidden", "true"), 280);
  }, ms || 2600);
}

/* ── Validation ─────────────────────────────────── */
function checkUnit() {
  const problems = [];
  function walk(n) {
    if (n.type === "question" && !(n.content && n.content.text && n.content.text.trim())) {
      problems.push(`Вопрос «${n.title}» — пустой текст вопроса`);
    }
    (n.children || []).forEach(walk);
  }
  (unit.children || []).forEach(walk);

  if (!problems.length) {
    toast("✓ Проверка пройдена — ошибок не найдено");
  } else {
    alert(`Найдено проблем: ${problems.length}\n\n` + problems.slice(0, 12).join("\n"));
  }
}

/* ── Header sync ────────────────────────────────── */
function syncStatus() {
  const pub = unit.publicationStatus === "published";
  dom.btnPublish.textContent = pub ? "Снять с публикации" : "Опубликовать";
}

/* ── Publish modal ──────────────────────────────── */
const SANDBOX_SESSION_KEY = "ai-mentor-sandbox-session-v1";

function openPublishModal() {
  document.getElementById("publish-modal-backdrop").classList.remove("hidden");
}

function closePublishModal() {
  document.getElementById("publish-modal-backdrop").classList.add("hidden");
}

function bindPublishModal() {
  document.getElementById("publish-modal-close").addEventListener("click", closePublishModal);

  document.getElementById("publish-modal-backdrop").addEventListener("click", e => {
    if (e.target === e.currentTarget) closePublishModal();
  });

  document.getElementById("publish-modal-direct").addEventListener("click", () => {
    closePublishModal();
    unit.publicationStatus = "published";
    persistUnit();
    isDirty = false;
    syncStatus();
    toast("✓ Опубликовано");
  });

  document.getElementById("publish-modal-test").addEventListener("click", () => {
    closePublishModal();
    persistUnit();
    // Clear any old sandbox session so fresh start (error-recovery sessions
    // are preserved only if they already exist for THIS unit in localStorage)
    const existing = (() => {
      try { return JSON.parse(localStorage.getItem(SANDBOX_SESSION_KEY) || "null"); } catch { return null; }
    })();
    // Only keep session if it belongs to the current unit
    if (!existing || existing.unitId !== unit.id) {
      localStorage.removeItem(SANDBOX_SESSION_KEY);
    }
    window.location.href = `../sandbox/index.html?id=${encodeURIComponent(unit.id)}`;
  });
}

/* ══════════════════════════════════════════════════
   ONBOARDING PREVIEW
   ══════════════════════════════════════════════════ */
function openObPreview(node) {
  const frame   = document.getElementById("ob-preview-frame");
  const els     = (node.content && node.content.elements) || [];
  const btnText = (node.content && node.content.startBtnText) || "Начать";

  frame.innerHTML = `
<div class="ob-pv-content">
  ${els.map(el => `
    ${el.heading ? `<div class="ob-pv-heading">${esc(el.heading)}</div>` : ""}
    ${el.text    ? `<div class="ob-pv-text">${esc(el.text)}</div>` : ""}
  `).join("")}
  <button class="ob-pv-btn" disabled>${esc(btnText)}
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
    </svg>
  </button>
</div>`;

  document.getElementById("ob-preview-backdrop").classList.remove("hidden");
}

function closeObPreview() {
  document.getElementById("ob-preview-backdrop").classList.add("hidden");
}

function bindObPreviewEvents() {
  document.getElementById("ob-preview-close").addEventListener("click", closeObPreview);
  document.getElementById("ob-preview-backdrop").addEventListener("click", e => {
    if (e.target === e.currentTarget) closeObPreview();
  });
}

/* ══════════════════════════════════════════════════
   BUILDER CROP MODAL
   ══════════════════════════════════════════════════ */
let pendingBldCoverFile = null;

const bldCropState = {
  scale: 1, ox: 0, oy: 0,
  dragging: false, startX: 0, startY: 0, startOx: 0, startOy: 0,
  naturalW: 0, naturalH: 0, viewW: 0, viewH: 0,
};

function openBldCropModal(dataUrl) {
  const vp  = document.getElementById("bld-crop-viewport");
  const img = document.getElementById("bld-crop-img");
  const rng = document.getElementById("bld-crop-zoom-range");
  document.getElementById("bld-crop-backdrop").classList.remove("hidden");

  bldCropState.scale = 1; bldCropState.ox = 0; bldCropState.oy = 0;
  rng.value = "1";
  img.onload = () => {
    bldCropState.naturalW = img.naturalWidth;
    bldCropState.naturalH = img.naturalHeight;
    bldCropState.viewW    = vp.clientWidth;
    bldCropState.viewH    = vp.clientHeight;

    // Fit image to cover the viewport
    const scaleX = bldCropState.viewW / bldCropState.naturalW;
    const scaleY = bldCropState.viewH / bldCropState.naturalH;
    bldCropState.scale = Math.max(scaleX, scaleY);
    rng.min = String(bldCropState.scale);
    rng.max = String(bldCropState.scale * 3);
    rng.value = String(bldCropState.scale);
    clampBldCrop();
    applyBldCropTransform();
  };
  img.src = dataUrl;
}

function closeBldCropModal() {
  document.getElementById("bld-crop-backdrop").classList.add("hidden");
  pendingBldCoverFile = null;
}

function clampBldCrop() {
  const s = bldCropState;
  const scaledW = s.naturalW * s.scale;
  const scaledH = s.naturalH * s.scale;
  const minOx = s.viewW - scaledW;
  const minOy = s.viewH - scaledH;
  s.ox = Math.min(0, Math.max(minOx, s.ox));
  s.oy = Math.min(0, Math.max(minOy, s.oy));
}

function applyBldCropTransform() {
  const img = document.getElementById("bld-crop-img");
  if (!img) return;
  const s = bldCropState;
  img.style.transform = `translate(${s.ox}px, ${s.oy}px) scale(${s.scale})`;
  img.style.transformOrigin = "0 0";
  img.style.width  = s.naturalW + "px";
  img.style.height = s.naturalH + "px";
}

function zoomBldCropCentered(newScale) {
  const s = bldCropState;
  const cx = s.viewW / 2;
  const cy = s.viewH / 2;
  const ratio = newScale / s.scale;
  s.ox = cx - ratio * (cx - s.ox);
  s.oy = cy - ratio * (cy - s.oy);
  s.scale = newScale;
  clampBldCrop();
  applyBldCropTransform();
}

function applyBldCrop() {
  const img    = document.getElementById("bld-crop-img");
  const s      = bldCropState;
  const canvas = document.createElement("canvas");
  const W = 1280, H = 720;
  canvas.width = W; canvas.height = H;
  const ctx    = canvas.getContext("2d");
  // Map viewport crop region back to natural image coords
  const sx = (-s.ox) / s.scale;
  const sy = (-s.oy) / s.scale;
  const sw = s.viewW  / s.scale;
  const sh = s.viewH  / s.scale;
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H);
  const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
  unit.coverDataUrl = dataUrl;
  persistUnit();
  closeBldCropModal();
  renderCenter();
}

function bindBldCropEvents() {
  const vp  = document.getElementById("bld-crop-viewport");
  const rng = document.getElementById("bld-crop-zoom-range");

  document.getElementById("bld-crop-close").addEventListener("click", closeBldCropModal);
  document.getElementById("bld-crop-cancel").addEventListener("click", closeBldCropModal);
  document.getElementById("bld-crop-backdrop").addEventListener("click", e => {
    if (e.target === e.currentTarget) closeBldCropModal();
  });
  document.getElementById("bld-crop-apply").addEventListener("click", applyBldCrop);

  document.getElementById("bld-crop-zoom-in").addEventListener("click", () => {
    const rngEl = document.getElementById("bld-crop-zoom-range");
    const newS = Math.min(parseFloat(rngEl.max), bldCropState.scale * 1.15);
    rngEl.value = String(newS);
    zoomBldCropCentered(newS);
  });
  document.getElementById("bld-crop-zoom-out").addEventListener("click", () => {
    const rngEl = document.getElementById("bld-crop-zoom-range");
    const newS = Math.max(parseFloat(rngEl.min), bldCropState.scale / 1.15);
    rngEl.value = String(newS);
    zoomBldCropCentered(newS);
  });

  rng.addEventListener("input", () => {
    zoomBldCropCentered(parseFloat(rng.value));
  });

  // Drag to pan
  vp.addEventListener("mousedown", e => {
    bldCropState.dragging = true;
    bldCropState.startX   = e.clientX;
    bldCropState.startY   = e.clientY;
    bldCropState.startOx  = bldCropState.ox;
    bldCropState.startOy  = bldCropState.oy;
    vp.classList.add("bld-crop-viewport--dragging");
    e.preventDefault();
  });
  document.addEventListener("mousemove", e => {
    if (!bldCropState.dragging) return;
    bldCropState.ox = bldCropState.startOx + (e.clientX - bldCropState.startX);
    bldCropState.oy = bldCropState.startOy + (e.clientY - bldCropState.startY);
    clampBldCrop();
    applyBldCropTransform();
  });
  document.addEventListener("mouseup", () => {
    if (!bldCropState.dragging) return;
    bldCropState.dragging = false;
    document.getElementById("bld-crop-viewport")?.classList.remove("bld-crop-viewport--dragging");
  });

  // Scroll to zoom
  vp.addEventListener("wheel", e => {
    e.preventDefault();
    const rngEl = document.getElementById("bld-crop-zoom-range");
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    const newS  = Math.min(parseFloat(rngEl.max), Math.max(parseFloat(rngEl.min), bldCropState.scale + delta * bldCropState.scale));
    const rect  = vp.getBoundingClientRect();
    const cx    = e.clientX - rect.left;
    const cy    = e.clientY - rect.top;
    const ratio = newS / bldCropState.scale;
    bldCropState.ox = cx - ratio * (cx - bldCropState.ox);
    bldCropState.oy = cy - ratio * (cy - bldCropState.oy);
    bldCropState.scale = newS;
    rngEl.value = String(newS);
    clampBldCrop();
    applyBldCropTransform();
  }, { passive: false });
}

/* ── Event binding ──────────────────────────────── */
function bindEvents() {
  dom.titleInput.addEventListener("input", () => {
    unit.title = dom.titleInput.value;
    persistUnit(); renderTree();
  });

  dom.btnSave.addEventListener("click", () => { persistUnit(); isDirty = false; toast("✓ Сохранено"); });
  dom.btnCheck.addEventListener("click", checkUnit);

  dom.btnPublish.addEventListener("click", () => {
    if (unit.publicationStatus === "published") {
      // Unpublish directly
      unit.publicationStatus = "private";
      persistUnit(); syncStatus();
      toast("✓ Снято с публикации");
    } else {
      openPublishModal();
    }
  });

  bindPublishModal();

  dom.btnMore.addEventListener("click", e => {
    e.stopPropagation();
    const open = !dom.dropdown.classList.contains("hidden");
    dom.dropdown.classList.toggle("hidden", open);
    dom.btnMore.setAttribute("aria-expanded", String(!open));
  });
  document.addEventListener("click", () => dom.dropdown.classList.add("hidden"));

  dom.dropdown.querySelectorAll("[data-more-action]").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      dom.dropdown.classList.add("hidden");
      if (btn.dataset.moreAction === "history")   toast("История версий пока недоступна");
      if (btn.dataset.moreAction === "duplicate")  toast("Дублирование пока недоступно");
    });
  });

  dom.addBlockBtn.addEventListener("click", addTopBlock);

  // Back link — warn if dirty
  const backLink = document.getElementById("back-link");
  backLink.addEventListener("click", e => {
    if (!isDirty) return; // let default navigation proceed
    e.preventDefault();
    document.getElementById("unsaved-modal-backdrop").classList.remove("hidden");
  });
  document.getElementById("unsaved-modal-stay").addEventListener("click", () => {
    document.getElementById("unsaved-modal-backdrop").classList.add("hidden");
  });
  document.getElementById("unsaved-modal-leave").addEventListener("click", () => {
    window.location.href = backLink.getAttribute("data-catalog-href");
  });

  // Keyboard shortcuts
  document.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault(); persistUnit(); toast("✓ Сохранено");
    }
  });
}

/* ── Error screen ───────────────────────────────── */
function showError(msg) {
  document.body.innerHTML = `
<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;
            min-height:100vh;font-family:Manrope,sans-serif;color:#596070;text-align:center;
            gap:16px;padding:32px;background:#f2f4f8">
  <div style="font-size:48px">⚠️</div>
  <p style="max-width:380px;font-size:14px;line-height:1.6">${msg}</p>
  <a href="../" style="color:#c91e1e;font-weight:700;text-decoration:none;font-size:14px">
    ← Вернуться в каталог
  </a>
</div>`;
}

/* ── Init ───────────────────────────────────────── */
function init() {
  cacheDom();

  const params = new URLSearchParams(window.location.search);
  const unitId = params.get("id");

  if (!unitId) { showError("Не указан идентификатор обучения."); return; }

  const all    = loadAll();
  const stored = all[unitId];

  if (!stored) { showError(`Обучение с ID «${esc(unitId)}» не найдено.`); return; }

  // First load: build scaffold from meta
  if (stored._isNew) {
    unit = buildScaffold(stored);
    all[unitId] = unit;
    saveAll(all);
  } else {
    unit = stored;
  }

  dom.titleInput.value = unit.title;
  syncStatus();

  // Select root node
  selectNode(unit.id);
  _initing = false;
  bindEvents();
  bindBldCropEvents();
  bindObPreviewEvents();
}

document.addEventListener("DOMContentLoaded", init);
