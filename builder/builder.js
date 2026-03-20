/* ══════════════════════════════════════════════════
   AI-Ментор · Конструктор обучения — builder.js
   ══════════════════════════════════════════════════ */

"use strict";

const BUILDER_KEY = "ai-mentor-builder-data-v1";

/* ── State ─────────────────────────────────────── */
let unit       = null;   // full unit tree
let selectedId = null;   // selected node id
const expanded = new Set();

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
    const prac   = makeNode("practice", "Практика",  [sec1],  {});
    const th1    = makeNode("theory",   "Теория 1",  [], { elements: [{ id: genId("el"), heading: "", text: "" }] });
    const tBlock = makeNode("theory_block", "Теоретический блок", [th1, prac], {});
    u.children.push(tBlock);
  } else {
    const mkQ = () => makeNode("question", "Вопрос 1", [], { text: "", refAnswer: "", hints: [], feedback: "" });
    const mkC = (q) => makeNode("case",    "Кейс 1",   [q], { description: "" });
    const s1   = makeNode("section", "Раздел 1", [mkC(mkQ())], {});
    const s2   = makeNode("section", "Раздел 2", [mkC(mkQ())], {});
    const prac = makeNode("practice", "Практика", [s1, s2], {});
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

function renderTree() {
  if (expanded.size === 0) expandAll(unit);
  dom.tree.innerHTML = nodeHtml(unit, 0, true);
  bindTreeEvents();
}

function nodeHtml(node, depth, isRoot) {
  const isUnit     = isRoot;
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
      if (e.target.closest("[data-tree-tog],[data-tree-add],[data-tree-del],[data-tree-rename]")) return;
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
  practice: "Практика",
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

  // theory_block: count only theory children, limit 3, insert before practice
  if (parent.type === "theory_block") {
    const theoryKids = parent.children.filter(c => c.type === "theory");
    if (theoryKids.length >= 3) { toast("Максимум 3 теории в одном блоке"); return; }
    const num     = theoryKids.length + 1;
    const newNode = makeNode("theory", `Теория ${num}`, [],
      { elements: [{ id: genId("el"), heading: "", text: "" }] });
    const practiceIdx = parent.children.findIndex(c => c.type === "practice");
    if (practiceIdx >= 0) parent.children.splice(practiceIdx, 0, newNode);
    else                  parent.children.push(newNode);
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

function addTopBlock() {
  // Insert a new practice block before "completion"
  const num  = unit.children.filter(c => !["onboarding","completion"].includes(c.type)).length + 1;
  const q    = makeNode("question", "Вопрос 1",  [], { text: "", refAnswer: "", hints: [], feedback: "" });
  const c    = makeNode("case",     "Кейс 1",    [q],    { description: "" });
  const s    = makeNode("section",  "Раздел 1",  [c],    {});
  const blk  = makeNode("practice", `Практика ${num}`, [s], {});
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
    ? `<img src="${esc(unit.coverDataUrl)}" alt="Обложка ${esc(unit.title)}" />`
    : `<div class="cu-cover-ph">🖼️</div>`;

  dom.center.innerHTML = `
<div class="cv">
  <div class="cu-cover">${coverHtml}</div>
  <h1 class="cu-title">${esc(unit.title)}</h1>
  <div class="cu-meta">
    <span class="cu-badge">${typeLabel}</span>
    ${unit.category    ? `<span class="cu-badge">${esc(unit.category)}</span>` : ""}
    ${unit.factory     ? `<span class="cu-badge">Фабрика: ${esc(unit.factory)}</span>` : ""}
    ${unit.durationLabel ? `<span class="cu-badge">${esc(unit.durationLabel)}</span>` : ""}
  </div>
  ${unit.description ? `
  <div class="cu-card">
    <div class="cu-card__lbl">Описание</div>
    <p class="cu-card__text">${esc(unit.description)}</p>
  </div>` : ""}
  <div class="cu-stats">
    <div class="cu-stat"><span class="cu-stat__num">${sections}</span><span class="cu-stat__label">Разделов</span></div>
    <div class="cu-stat"><span class="cu-stat__num">${cases}</span><span class="cu-stat__label">Кейсов</span></div>
    <div class="cu-stat"><span class="cu-stat__num">${questions}</span><span class="cu-stat__label">Вопросов</span></div>
  </div>
</div>`;
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
  <h2 class="cv-heading"><span class="cv-heading-icon">🚀</span>${esc(node.title)}</h2>
  <p class="cv-subheading">Введение в обучение для пользователя, укажите информацию с которой пользователь будет ознакомлен при его запуске</p>
  <div id="ob-el-list">${elHtml}</div>
  ${canAdd ? `<button class="add-dashed" id="add-ob-el" style="margin-top:4px">${plusSvg()} Добавить еще один элемент</button>` : ""}
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
}

/* ── Theory block center ── */
function renderCTheoryBlock(node) {
  const theories = (node.children || []).filter(ch => ch.type === "theory");
  const items = theories.map(ch => `
    <div class="item-card" data-goto="${ch.id}">
      <span class="item-card__icon">${ICONS[ch.type] || "•"}</span>
      <span class="item-card__title">${esc(ch.title)}</span>
      <span class="item-card__arrow">›</span>
    </div>`).join("");

  dom.center.innerHTML = `
<div class="cv">
  <h2 class="cv-heading"><span class="cv-heading-icon">📚</span>${esc(node.title)}</h2>
  <p class="cv-subheading">Структура теоретического блока</p>
  <div class="item-list">${items || noItems("Нет элементов")}</div>
  ${theories.length < 3 ? `<button class="add-dashed" id="add-th-btn">${plusSvg()} Добавить теорию</button>` : `<p style="font-size:12px;color:var(--muted-lt);margin:0">Достигнут максимум — 3 теоретических элемента на один блок</p>`}
</div>`;

  gotoCards();
  document.getElementById("add-th-btn").addEventListener("click", () => addChildTo(node.id));
}

/* ── Theory center ── */
function renderCTheory(node) {
  if (!node.content) node.content = {};
  let els = node.content.elements || [];
  els = els.map(el => ({ id: el.id, heading: el.heading || "", text: el.text || "" }));
  if (els.length === 0) els.push({ id: genId("el"), heading: "", text: "" });
  node.content.elements = els;
  if (!node.content.queries || node.content.queries.length === 0) {
    node.content.queries = [{ id: genId("q"), text: "", response: "", approved: false }];
  }
  if (node.content.nextBtnText === undefined) node.content.nextBtnText = "Ознакомился, далее";

  const el0    = els[0];
  const queries = node.content.queries;

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

  function planeSvg() {
    return `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>`;
  }

  // State per query: idle → loading → responded → approved (or back to idle via "Изменить")
  const queryHtml = queries.map(q => {
    const isLoading   = loadingQueries.has(q.id);
    const isApproved  = !!q.approved;
    const isResponded = !!q.response && !isLoading && !isApproved;
    const locked      = isLoading || isResponded || isApproved;

    return `
    <div class="query-card${isApproved ? " query-card--approved" : ""}">
      <div class="query-card__header">
        <span class="query-card__title">Тестовый запрос в A-Book ${infoIco("Укажите запрос, который система отправит в A-Book, чтобы получить актуальную информацию для блока теории. После отправки вы сможете посмотреть ответ, затем либо утвердить запрос, либо изменить его. Пока решение по текущему ответу не принято, редактирование запроса будет недоступно.")}</span>
        ${isApproved ? `<span class="query-approved-badge">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Утверждён</span>` : ""}
      </div>
      <div class="query-textarea-wrap">
        <textarea class="query-textarea${locked ? " query-textarea--locked" : ""}"
          ${locked ? "disabled" : ""} data-qid="${q.id}"
          placeholder="Например: Какая комиссия за услугу уведомлений по дебетовой карте">${esc(q.text || "")}</textarea>
        ${isLoading
          ? `<div class="query-sending"><span class="query-spinner"></span>Отправляем...</div>`
          : (!locked ? `<button class="query-send-btn" data-send-q="${q.id}">${planeSvg()} Отправить</button>` : "")}
      </div>
      ${(isResponded || isApproved) ? `
      <div class="query-response${isApproved ? " query-response--approved" : ""}">
        <div class="query-response__title">Ответ</div>
        <div class="query-response__text">${esc(q.response)}</div>
        ${isResponded ? `
        <div class="query-actions">
          <button class="query-approve-btn" data-approve-q="${q.id}">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Утвердить запрос
          </button>
          <button class="query-change-btn" data-change-q="${q.id}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Изменить запрос
          </button>
        </div>` : ""}
      </div>` : ""}
    </div>`;
  }).join("");

  dom.center.innerHTML = `
<div class="cv">
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
    <div class="enrich-section__title">Обогащение из базы знаний</div>
    <p class="enrich-section__desc">В данном элементе настраивается получение информации из A-Book. Вы задаёте запрос, который система будет отправлять в базу знаний во время прохождения сотрудником обучения. Ответ формируется на основе актуальных данных, поэтому может со временем меняться — это позволяет всегда использовать свежую информацию из базы знаний.</p>
    <div id="query-list">${queryHtml}</div>
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

  dom.center.querySelectorAll(".query-textarea[data-qid]").forEach(ta => {
    ta.addEventListener("input", () => {
      const q = node.content.queries.find(q => q.id === ta.dataset.qid);
      if (q) { q.text = ta.value; persistUnit(); }
    });
  });

  dom.center.querySelectorAll("[data-send-q]").forEach(btn => {
    btn.addEventListener("click", () => {
      const q = node.content.queries.find(q => q.id === btn.dataset.sendQ);
      if (!q) return;
      const ta = btn.closest(".query-textarea-wrap").querySelector(".query-textarea");
      if (ta) { q.text = ta.value; persistUnit(); }
      loadingQueries.add(q.id);
      renderCenter();
      setTimeout(() => {
        loadingQueries.delete(q.id);
        q.response = MOCK_ABOOK_RESP;
        persistUnit(); renderCenter();
      }, 3000);
    });
  });

  dom.center.querySelectorAll("[data-approve-q]").forEach(btn => {
    btn.addEventListener("click", () => {
      const q = node.content.queries.find(q => q.id === btn.dataset.approveQ);
      if (q) { q.approved = true; persistUnit(); renderCenter(); }
    });
  });

  dom.center.querySelectorAll("[data-change-q]").forEach(btn => {
    btn.addEventListener("click", () => {
      const q = node.content.queries.find(q => q.id === btn.dataset.changeQ);
      if (q) { q.response = ""; q.approved = false; persistUnit(); renderCenter(); }
    });
  });

}

/* ── Practice center ── */
function renderCPractice(node) {
  const items = (node.children || []).map(s => `
    <div class="item-card" data-goto="${s.id}">
      <span class="item-card__icon">📁</span>
      <span class="item-card__title">${esc(s.title)}</span>
      <span class="item-card__meta">${countType(s,"case")} кейс · ${countType(s,"question")} вопр.</span>
      <span class="item-card__arrow">›</span>
    </div>`).join("");

  dom.center.innerHTML = `
<div class="cv">
  <h2 class="cv-heading"><span class="cv-heading-icon">🎯</span>${esc(node.title)}</h2>
  <p class="cv-subheading">Практические задания</p>
  <div class="item-list">${items || noItems("Нет разделов")}</div>
  <button class="add-dashed" id="add-sec-btn">${plusSvg()} Добавить раздел</button>
</div>`;

  gotoCards();
  document.getElementById("add-sec-btn").addEventListener("click", () => addChildTo(node.id));
}

/* ── Section center ── */
function renderCSection(node) {
  const items = (node.children || []).map(c => `
    <div class="item-card" data-goto="${c.id}">
      <span class="item-card__icon">💼</span>
      <span class="item-card__title">${esc(c.title)}</span>
      <span class="item-card__meta">${countType(c,"question")} вопр.</span>
      <span class="item-card__arrow">›</span>
    </div>`).join("");

  dom.center.innerHTML = `
<div class="cv">
  <h2 class="cv-heading"><span class="cv-heading-icon">📁</span>${esc(node.title)}</h2>
  <p class="cv-subheading">Раздел практической части</p>
  <div class="item-list">${items || noItems("Нет кейсов")}</div>
  <button class="add-dashed" id="add-case-btn">${plusSvg()} Добавить кейс</button>
</div>`;

  gotoCards();
  document.getElementById("add-case-btn").addEventListener("click", () => addChildTo(node.id));
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
  <h2 class="cv-heading"><span class="cv-heading-icon">💼</span>${esc(node.title)}</h2>
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

  document.getElementById("case-desc").addEventListener("input", e => {
    if (!node.content) node.content = {};
    node.content.description = e.target.value;
    persistUnit();
  });

  gotoCards();

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
  <h2 class="cv-heading"><span class="cv-heading-icon">❓</span>${esc(node.title)}</h2>
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

/* ── Event binding ──────────────────────────────── */
function bindEvents() {
  dom.titleInput.addEventListener("input", () => {
    unit.title = dom.titleInput.value;
    persistUnit(); renderTree();
  });

  dom.btnSave.addEventListener("click", () => { persistUnit(); toast("✓ Сохранено"); });
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
  bindEvents();
}

document.addEventListener("DOMContentLoaded", init);
