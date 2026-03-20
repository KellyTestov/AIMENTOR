/* ══════════════════════════════════════════════════
   AI-Ментор · Тестовая среда — sandbox.js
   ══════════════════════════════════════════════════ */

"use strict";

const BUILDER_KEY     = "ai-mentor-builder-data-v1";
const SESSION_KEY     = "ai-mentor-sandbox-session-v1";

const BUSINESS_LINES = [
  "Розничный бизнес",
  "Корпоративный бизнес",
  "Инвестиционный бизнес",
  "Цифровой бизнес",
  "Операционный блок",
  "HR и развитие персонала",
];

/* Эталонные фразы оценки (mock AI) */
const MOCK_EVAL = [
  "✅ Верно! Ответ соответствует эталонному сценарию.",
  "✅ Хороший ответ! Вы точно описали ключевые моменты.",
  "✅ Отлично! Ваш ответ полный и корректный.",
  "⚠️ Частично верно. Обратите внимание на детали сценария.",
];

/* ── Переменные состояния ─────────────────────── */
let unit    = null;   // единица обучения из localStorage
let session = null;   // текущая сессия
let unitId  = null;
let isBusy  = false;  // блокировка ввода во время "печатает..."
let selectedBizLine = null;

/* ── Утилиты ──────────────────────────────────── */
function esc(s) {
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/* ── Хранилище ────────────────────────────────── */
function loadUnit(id) {
  try {
    const all = JSON.parse(localStorage.getItem(BUILDER_KEY) || "{}");
    return all[id] || null;
  } catch { return null; }
}

function markUnitPublished(id) {
  try {
    const all = JSON.parse(localStorage.getItem(BUILDER_KEY) || "{}");
    if (all[id]) {
      all[id].publicationStatus = "published";
      all[id].updatedAt = new Date().toISOString();
      localStorage.setItem(BUILDER_KEY, JSON.stringify(all));
    }
  } catch (e) { console.warn("publish error", e); }
}

function saveSession() {
  try { localStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch (e) {}
}

function loadSavedSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); } catch { return null; }
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

/* ── Извлечение данных из дерева ──────────────── */
function flattenQuestions(u) {
  const list = [];
  function walk(node) {
    if (node.type === "question") list.push(node);
    (node.children || []).forEach(walk);
  }
  (u.children || []).forEach(walk);
  return list;
}

function getOnboardingHtml(u) {
  const ob = (u.children || []).find(c => c.type === "onboarding");
  if (!ob) return null;
  const els = (ob.content && ob.content.elements || [])
    .filter(el => el.text && el.text.trim());
  if (!els.length) return null;
  return els.map(el =>
    el.heading
      ? `<p><strong>${esc(el.heading)}</strong></p><p>${esc(el.text)}</p>`
      : `<p>${esc(el.text)}</p>`
  ).join("");
}

function getCompletionHtml(u) {
  const comp = (u.children || []).find(c => c.type === "completion");
  if (!comp) return null;
  const els = (comp.content && comp.content.elements || [])
    .filter(el => el.text && el.text.trim());
  if (!els.length) return null;
  return els.map(el =>
    el.heading
      ? `<p><strong>${esc(el.heading)}</strong></p><p>${esc(el.text)}</p>`
      : `<p>${esc(el.text)}</p>`
  ).join("");
}

function findParentOfNode(targetId, root) {
  if (!root || !root.children) return null;
  for (const child of root.children) {
    if (child.id === targetId) return root;
    const found = findParentOfNode(targetId, child);
    if (found) return found;
  }
  return null;
}

/* ── Чат ──────────────────────────────────────── */
function appendMessage(role, html, persist = true) {
  const chat = document.getElementById("sb-chat");
  const div  = document.createElement("div");
  div.className = `sb-msg sb-msg--${role}`;
  div.innerHTML = html;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
  if (persist) {
    session.messages.push({ role, html });
    saveSession();
  }
}

function showTypingIndicator() {
  const chat = document.getElementById("sb-chat");
  const div  = document.createElement("div");
  div.id = "sb-typing";
  div.className = "sb-msg sb-msg--bot sb-msg--typing";
  div.innerHTML = "<span></span><span></span><span></span>";
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function hideTypingIndicator() {
  const el = document.getElementById("sb-typing");
  if (el) el.remove();
}

function setInputLocked(locked) {
  const inp = document.getElementById("sb-input");
  const btn = document.getElementById("sb-send-btn");
  inp.disabled = locked;
  btn.disabled = locked;
  if (!locked) inp.focus();
}

function botSay(html, delay = 750) {
  return new Promise(resolve => {
    isBusy = true;
    setInputLocked(true);
    showTypingIndicator();
    setTimeout(() => {
      hideTypingIndicator();
      appendMessage("bot", html);
      isBusy = false;
      setInputLocked(false);
      resolve();
    }, delay);
  });
}

/* ── Сценарий ─────────────────────────────────── */
async function runGreeting() {
  const typeLabel = unit.type === "trainer" ? "тренажёр" : "экзамен";
  const obHtml    = getOnboardingHtml(unit);

  let html = `<p>Добро пожаловать в тестовую среду AI-Ментора!</p>
<p>Вы тестируете <strong>${typeLabel}: «${esc(unit.title)}»</strong>.</p>`;

  if (obHtml) {
    html += `<div class="sb-msg__block">${obHtml}</div>`;
  }

  html += `<p>Для начала отправьте фразу-триггер <strong>«Старт»</strong>.</p>`;

  await botSay(html, 400);
  session.phase = "greeting";
  saveSession();
}

async function runStart() {
  session.phase   = "running";
  session.questionIndex = 0;
  saveSession();

  const typeLabel = unit.type === "trainer" ? "тренировку" : "экзамен";
  await botSay(`<p>Начинаем ${typeLabel}! Отвечайте на каждый вопрос в свободной форме.</p>`, 500);
  await askQuestion();
}

async function askQuestion() {
  const questions = flattenQuestions(unit);
  const idx       = session.questionIndex;

  if (idx >= questions.length) {
    await runCompletion();
    return;
  }

  const q      = questions[idx];
  const parent = findParentOfNode(q.id, unit);  // case node
  let html     = "";

  if (parent && parent.type === "case" &&
      parent.content && parent.content.description &&
      parent.content.description.trim()) {
    html += `<div class="sb-msg__case"><em>Кейс: ${esc(parent.content.description)}</em></div>`;
  }

  html += `<div class="sb-msg__qnum">Вопрос ${idx + 1} из ${questions.length}</div>`;
  html += `<p>${esc(q.content && q.content.text ? q.content.text : "(текст вопроса не заполнен)")}</p>`;

  await botSay(html, 600);
}

async function handleAnswer(text) {
  const questions = flattenQuestions(unit);
  const idx       = session.questionIndex;
  const q         = questions[idx];

  let evalHtml = "";

  if (q.content && q.content.feedback && q.content.feedback.trim()) {
    evalHtml = `<p>${esc(q.content.feedback)}</p>`;
  } else {
    const mockIdx = idx % MOCK_EVAL.length;
    evalHtml = `<p>${MOCK_EVAL[mockIdx]}</p>`;
  }

  if (q.content && q.content.refAnswer && q.content.refAnswer.trim()) {
    evalHtml += `<div class="sb-msg__ref">
      <span class="sb-msg__ref-label">Эталонный ответ:</span>
      <span>${esc(q.content.refAnswer)}</span>
    </div>`;
  }

  await botSay(evalHtml, 700);

  session.questionIndex++;
  saveSession();
  await askQuestion();
}

async function runCompletion() {
  session.phase = "done";
  saveSession();

  const compHtml  = getCompletionHtml(unit);
  const typeLabel = unit.type === "trainer" ? "Тренировка" : "Экзамен";
  const endLabel  = unit.type === "trainer" ? "завершена" : "завершён";

  let html = `<p>🏁 <strong>${typeLabel} ${endLabel}!</strong></p>`;
  if (compHtml) {
    html += `<div class="sb-msg__block">${compHtml}</div>`;
  }

  await botSay(html, 600);

  setTimeout(() => {
    document.getElementById("completion-modal").classList.remove("hidden");
  }, 800);
}

/* ── Обработка ввода ──────────────────────────── */
async function handleUserInput() {
  const inp  = document.getElementById("sb-input");
  const text = inp.value.trim();
  if (!text || isBusy) return;

  inp.value = "";
  inp.style.height = "";
  appendMessage("user", `<p>${esc(text)}</p>`);

  if (session.phase === "greeting") {
    if (/^старт$/i.test(text)) {
      await runStart();
    } else {
      await botSay(`<p>Для начала отправьте фразу-триггер <strong>«Старт»</strong>.</p>`, 350);
    }
  } else if (session.phase === "running") {
    await handleAnswer(text);
  }
}

/* ── Восстановление сессии ────────────────────── */
function restoreSession() {
  const chat = document.getElementById("sb-chat");
  for (const m of session.messages) {
    const div = document.createElement("div");
    div.className = `sb-msg sb-msg--${m.role}`;
    div.innerHTML  = m.html;
    chat.appendChild(div);
  }
  chat.scrollTop = chat.scrollHeight;
}

/* ── Бизнес-линия / публикация ────────────────── */
function openBizlineModal() {
  document.getElementById("completion-modal").classList.add("hidden");
  document.getElementById("bizline-modal").classList.remove("hidden");
}

function openLoadingModal() {
  document.getElementById("bizline-modal").classList.add("hidden");
  document.getElementById("loading-modal").classList.remove("hidden");
}

function openSuccessModal() {
  document.getElementById("loading-modal").classList.add("hidden");
  document.getElementById("success-modal").classList.remove("hidden");
}

/* ── Инициализация ────────────────────────────── */
function init() {
  const params = new URLSearchParams(window.location.search);
  unitId = params.get("id");

  if (!unitId) {
    showFatalError("Не указан идентификатор обучения.");
    return;
  }

  unit = loadUnit(unitId);
  if (!unit) {
    showFatalError(`Обучение с ID «${esc(unitId)}» не найдено.`);
    return;
  }

  document.getElementById("sb-unit-title").textContent = unit.title;
  document.title = `Тест: ${unit.title} — AI-Ментор`;

  /* ── Сессия: восстановление или новая ── */
  const saved = loadSavedSession();

  if (saved && saved.unitId === unitId) {
    session = saved;
    restoreSession();

    if (session.phase === "done") {
      // Ошибка случилась уже после завершения — показать модал
      setTimeout(() => {
        document.getElementById("completion-modal").classList.remove("hidden");
      }, 150);
    } else if (session.phase === "running") {
      // Возобновляем с текущего вопроса
      setInputLocked(false);
      askQuestion();
    } else {
      // greeting phase — ждём ввода
      setInputLocked(false);
    }
  } else {
    session = { unitId, phase: "greeting", questionIndex: 0, messages: [] };
    saveSession();
    runGreeting();
  }

  /* ── Кнопка "Вернуться в конструктор" (FR-05) ── */
  document.getElementById("btn-back-to-builder").addEventListener("click", () => {
    clearSession();  // FR-05: не сохранять контекст диалога
    window.location.href = `../builder/index.html?id=${encodeURIComponent(unitId)}`;
  });

  /* ── Ввод текста ── */
  const inp = document.getElementById("sb-input");
  const btn = document.getElementById("sb-send-btn");

  btn.addEventListener("click", handleUserInput);
  inp.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleUserInput(); }
  });
  inp.addEventListener("input", () => {
    inp.style.height = "";
    inp.style.height = Math.min(inp.scrollHeight, 140) + "px";
  });

  /* ── Модал завершения ── */
  document.getElementById("completion-back-btn").addEventListener("click", () => {
    clearSession();
    window.location.href = `../builder/index.html?id=${encodeURIComponent(unitId)}`;
  });

  document.getElementById("completion-publish-btn").addEventListener("click", openBizlineModal);

  /* ── Бизнес-линия ── */
  const list = document.getElementById("bizline-list");
  BUSINESS_LINES.forEach(bl => {
    const btn = document.createElement("button");
    btn.className = "sb-bizline-btn";
    btn.type = "button";
    btn.textContent = bl;
    btn.setAttribute("role", "option");
    btn.addEventListener("click", () => {
      list.querySelectorAll(".sb-bizline-btn").forEach(b => {
        b.classList.remove("is-selected");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-selected");
      btn.setAttribute("aria-selected", "true");
      selectedBizLine = bl;
      document.getElementById("bizline-confirm-btn").disabled = false;
    });
    list.appendChild(btn);
  });

  document.getElementById("bizline-close-btn").addEventListener("click", () => {
    document.getElementById("bizline-modal").classList.add("hidden");
    document.getElementById("completion-modal").classList.remove("hidden");
  });

  document.getElementById("bizline-confirm-btn").addEventListener("click", () => {
    if (!selectedBizLine) return;
    openLoadingModal();
    markUnitPublished(unitId);
    setTimeout(() => {
      clearSession();
      openSuccessModal();
    }, 1800);
  });

  document.getElementById("success-back-btn").addEventListener("click", () => {
    window.location.href = `../builder/index.html?id=${encodeURIComponent(unitId)}`;
  });
}

function showFatalError(msg) {
  document.body.innerHTML = `
<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;
            min-height:100vh;font-family:Manrope,sans-serif;color:#596070;text-align:center;
            gap:16px;padding:32px;background:#f2f4f8">
  <div style="font-size:48px">⚠️</div>
  <p style="max-width:380px;font-size:14px;line-height:1.6">${esc(msg)}</p>
  <a href="../builder/" style="color:#c91e1e;font-weight:700;text-decoration:none;font-size:14px">
    ← Вернуться в конструктор
  </a>
</div>`;
}

document.addEventListener("DOMContentLoaded", init);
