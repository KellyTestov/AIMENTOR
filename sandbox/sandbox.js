/* ══════════════════════════════════════════════════
   AI-Ментор · Тестовая среда — sandbox.js
   ══════════════════════════════════════════════════ */

"use strict";

/* ── Константы ────────────────────────────────────── */
const BUILDER_KEY  = "ai-mentor-builder-data-v1";
const SESSION_KEY  = "ai-mentor-sandbox-session-v1";
const ERROR_SESSION_FLAG = "sb-error-flag";   // sessionStorage — признак ошибки в текущей вкладке

const BUSINESS_LINES = [
  "Розничный бизнес",
  "Корпоративный бизнес",
  "Инвестиционный бизнес",
  "Цифровой бизнес",
  "Операционный блок",
  "HR и развитие персонала",
];

/* Mock-данные клиента для экзамена */
const MOCK_CLIENT = {
  name:     "Иванова Мария Петровна",
  phone:    "+7 (999) 123-45-67",
  account:  "40817810000000001234",
  status:   "Активный клиент",
  products: ["Дебетовая карта Альфа-Карта", "Накопительный счёт"],
  request:  "Вопрос по комиссии за уведомления по дебетовой карте",
};

/* Mock-оценки для тренажёра */
const MOCK_CORRECT = [
  "✅ Верно! Ваш ответ соответствует стандарту обслуживания.",
  "✅ Хорошо! Ответ точный и полный.",
  "✅ Отлично! Именно так нужно отвечать клиенту.",
];
const MOCK_HINTS = [
  "💡 Подсказка: уточните тип карты клиента — тарифы для дебетовых и кредитных карт различаются.",
  "💡 Подсказка: проверьте информацию в разделе A-Book «Комиссии и тарифы».",
  "💡 Подсказка: предложите клиенту уточняющий вопрос для выявления его потребности.",
];

/* ── Состояние ───────────────────────────────────── */
let unit    = null;
let session = null;
let unitId  = null;
let isBusy  = false;
let timerInterval     = null;

/* ── Утилиты ─────────────────────────────────────── */
function esc(s) {
  return String(s || "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/* ── localStorage / sessionStorage ──────────────── */
function loadUnit(id) {
  try {
    return JSON.parse(localStorage.getItem(BUILDER_KEY) || "{}")[id] || null;
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
function clearSession() { localStorage.removeItem(SESSION_KEY); }

/* ── Дерево единицы ──────────────────────────────── */
function flattenQuestions(u) {
  const list = [];
  function walk(node) {
    if (node.type === "question") list.push(node);
    (node.children || []).forEach(walk);
  }
  (u.children || []).forEach(walk);
  return list;
}

function getNodeHtml(u, type) {
  const node = (u.children || []).find(c => c.type === type);
  if (!node) return null;
  const els = (node.content && node.content.elements || []).filter(el => el.text && el.text.trim());
  if (!els.length) return null;
  return els.map(el =>
    el.heading
      ? `<p><strong>${esc(el.heading)}</strong></p><p>${esc(el.text)}</p>`
      : `<p>${esc(el.text)}</p>`
  ).join("");
}

function findParentCase(questionNode) {
  function search(node) {
    if (!node.children) return null;
    for (const child of node.children) {
      if (child.id === questionNode.id) return node;
      const found = search(child);
      if (found) return found;
    }
    return null;
  }
  return search(unit);
}

/* ─────────────────────────────────────────────────
   TIMER (только для экзамена)
───────────────────────────────────────────────── */
function startTimer() {
  stopTimer();
  timerInterval = setInterval(() => {
    session.elapsedSeconds++;
    saveSession();
    renderTimer(session.elapsedSeconds);
  }, 1000);
}

function stopTimer() {
  if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
}

function renderTimer(sec) {
  const h   = Math.floor(sec / 3600);
  const m   = Math.floor((sec % 3600) / 60);
  const s   = sec % 60;
  const fmt = `${pad(h)}:${pad(m)}:${pad(s)}`;
  const el  = document.getElementById("sb-timer-val");
  const wrap = document.getElementById("sb-timer");
  if (el) el.textContent = fmt;

  // Цвет: 0-20 мин = зелёный, 21-40 мин = синий, 41+ = красный (FR-08)
  if (wrap) {
    wrap.className = "sb-timer " +
      (sec < 1201 ? "sb-timer--green" : sec < 2401 ? "sb-timer--blue" : "sb-timer--red");
  }
}
function pad(n) { return String(n).padStart(2, "0"); }

/* ─────────────────────────────────────────────────
   ЧАТ — общие функции
───────────────────────────────────────────────── */
function appendMessage(role, html, persist = true) {
  const chat = document.getElementById("sb-chat");
  const div  = document.createElement("div");
  // для экзамена: bot → "client" (визуально другой цвет/лейбл)
  const cssRole = (unit && unit.type === "exam" && role === "bot") ? "client" : role;
  div.className = `sb-msg sb-msg--${cssRole}`;
  div.innerHTML  = html;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
  if (persist) {
    session.messages.push({ role, html });
    saveSession();
  }
}

function showTyping() {
  const chat = document.getElementById("sb-chat");
  const div  = document.createElement("div");
  const cssRole = unit && unit.type === "exam" ? "client" : "bot";
  div.id = "sb-typing";
  div.className = `sb-msg sb-msg--${cssRole} sb-msg--typing`;
  div.innerHTML = "<span></span><span></span><span></span>";
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function hideTyping() {
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
    showTyping();
    setTimeout(() => {
      hideTyping();
      appendMessage("bot", html);
      isBusy = false;
      setInputLocked(false);
      resolve();
    }, delay);
  });
}

function restoreMessages() {
  const chat = document.getElementById("sb-chat");
  for (const m of session.messages) {
    const div = document.createElement("div");
    const cssRole = (unit.type === "exam" && m.role === "bot") ? "client" : m.role;
    div.className = `sb-msg sb-msg--${cssRole}`;
    div.innerHTML  = m.html;
    chat.appendChild(div);
  }
  chat.scrollTop = chat.scrollHeight;
}

/* ─────────────────────────────────────────────────
   ТРЕНАЖЁР — логика
───────────────────────────────────────────────── */
async function trainerGreeting() {
  const obHtml = getNodeHtml(unit, "onboarding");
  let html = `<p>Добро пожаловать в тестовую среду тренажёра!</p>
<p>Вы проверяете тренажёр <strong>«${esc(unit.title)}»</strong>.</p>`;
  if (obHtml) html += `<div class="sb-msg__block">${obHtml}</div>`;
  html += `<p>Для начала тренировки введите <strong>«Старт»</strong>.</p>`;
  await botSay(html, 400);
  session.phase = "greeting";
  saveSession();
}

async function trainerStart() {
  session.phase = "running";
  session.questionIndex = 0;
  session.errors = [];
  saveSession();
  await botSay(`<p>Начинаем тренировку! Отвечайте на вопросы в формате диалога с клиентом.</p>`, 500);
  await trainerAskQuestion();
}

async function trainerAskQuestion() {
  const questions = flattenQuestions(unit);
  const idx = session.questionIndex;
  if (idx >= questions.length) { await trainerFinish(); return; }

  const q      = questions[idx];
  const parent = findParentCase(q);
  let html     = "";

  if (parent && parent.type === "case" && parent.content && parent.content.description &&
      parent.content.description.trim()) {
    html += `<div class="sb-msg__case"><em>Кейс: ${esc(parent.content.description)}</em></div>`;
  }
  html += `<div class="sb-msg__qnum">Вопрос ${idx + 1} из ${questions.length}</div>`;
  html += `<p>${esc(q.content && q.content.text || "(текст вопроса не заполнен)")}</p>`;

  // Показываем подсказку если есть (FR-11)
  const hints = q.content && q.content.hints && q.content.hints.filter(h => h && h.trim());
  if (hints && hints.length) {
    html += `<div class="sb-msg__hint">💡 ${esc(hints[0])}</div>`;
  }

  await botSay(html, 600);
}

async function trainerHandleAnswer(text) {
  const questions = flattenQuestions(unit);
  const idx = session.questionIndex;
  const q   = questions[idx];

  // Простая эвристика: считаем "неверным", если ответ слишком короткий
  const isError = text.trim().length < 10;

  let evalHtml = "";
  if (q.content && q.content.feedback && q.content.feedback.trim()) {
    evalHtml = `<p>${esc(q.content.feedback)}</p>`;
  } else if (isError) {
    // FR-09/10: ошибки не завершают сессию, дать пояснение
    const hintIdx = idx % MOCK_HINTS.length;
    evalHtml = `<p>⚠️ Ответ можно дополнить.</p><p>${MOCK_HINTS[hintIdx]}</p>`;
    session.errors.push(idx);
    saveSession();
  } else {
    const corrIdx = idx % MOCK_CORRECT.length;
    evalHtml = `<p>${MOCK_CORRECT[corrIdx]}</p>`;
    if (q.content && q.content.refAnswer && q.content.refAnswer.trim()) {
      evalHtml += `<div class="sb-msg__ref">
        <span class="sb-msg__ref-label">Эталонный ответ:</span>
        <span>${esc(q.content.refAnswer)}</span>
      </div>`;
    }
  }

  await botSay(evalHtml, 650);
  session.questionIndex++;
  saveSession();
  await trainerAskQuestion();
}

async function trainerFinish() {
  session.phase = "done";
  saveSession();

  const compHtml = getNodeHtml(unit, "completion");
  let html = `<p>🏁 <strong>Тренировка завершена!</strong></p>`;
  if (compHtml) html += `<div class="sb-msg__block">${compHtml}</div>`;
  await botSay(html, 600);

  setTimeout(() => showTrainerReport(), 800);
}

function showTrainerReport() {
  const questions  = flattenQuestions(unit);
  const total      = questions.length;
  const errorCount = (session.errors || []).length;
  const correct    = total - errorCount;
  const pct        = total > 0 ? Math.round((correct / total) * 100) : 100;

  let reportHtml = `
    <div class="sb-report-score">
      <div class="sb-report-score__circle" style="--pct:${pct}">
        <span class="sb-report-score__val">${pct}%</span>
      </div>
      <div class="sb-report-score__legend">
        <p><strong>Правильных ответов:</strong> ${correct} из ${total}</p>
        <p><strong>Ошибок:</strong> ${errorCount}</p>
      </div>
    </div>`;

  if (errorCount > 0) {
    reportHtml += `<div class="sb-report-section"><p class="sb-report-section__title">Вопросы с ошибками:</p><ul class="sb-report-errs">`;
    (session.errors || []).forEach(idx => {
      const q = questions[idx];
      if (q) reportHtml += `<li>${esc(q.content && q.content.text || `Вопрос ${idx + 1}`)}</li>`;
    });
    reportHtml += `</ul></div>`;
  }

  reportHtml += `<div class="sb-report-section">
    <p class="sb-report-section__title">Рекомендации:</p>
    <p class="sb-report-section__text">
      ${pct >= 80
        ? "Отличный результат! Материал освоен хорошо. Рекомендуем периодически возвращаться к теоретическому блоку для закрепления знаний."
        : "Рекомендуем повторить теоретический блок, уделив особое внимание разделам, связанным с вопросами, в которых были допущены ошибки."}
    </p>
  </div>`;

  document.getElementById("report-body").innerHTML = reportHtml;
  document.getElementById("report-modal").classList.remove("hidden");
}

/* ─────────────────────────────────────────────────
   ЭКЗАМЕН — логика
───────────────────────────────────────────────── */
function showExamRulesModal() {
  document.getElementById("exam-rules-modal").classList.remove("hidden");
}

function startExam() {
  document.getElementById("exam-rules-modal").classList.add("hidden");
  document.getElementById("sb-timer").classList.remove("hidden");
  document.getElementById("btn-show-client").classList.remove("hidden");
  document.getElementById("sb-role-bar").classList.remove("hidden");
  document.getElementById("sb-role-client-label").textContent = "💬 " + MOCK_CLIENT.name;
  document.getElementById("sb-mode-badge").textContent = "Экзамен";

  if (!session.elapsedSeconds) session.elapsedSeconds = 0;
  session.phase = "running";
  session.questionIndex = 0;
  saveSession();

  startTimer();
  renderTimer(session.elapsedSeconds);
  examAskQuestion();
}

function resumeExam() {
  document.getElementById("resume-modal").classList.add("hidden");
  document.getElementById("sb-timer").classList.remove("hidden");
  document.getElementById("btn-show-client").classList.remove("hidden");
  document.getElementById("sb-role-bar").classList.remove("hidden");
  document.getElementById("sb-role-client-label").textContent = "💬 " + MOCK_CLIENT.name;
  document.getElementById("sb-mode-badge").textContent = "Экзамен";

  // Сброс флага ошибки — продолжаем
  session.errorOccurred = false;
  saveSession();

  startTimer();
  renderTimer(session.elapsedSeconds || 0);
  setInputLocked(false);
  examAskQuestion();
}

async function examAskQuestion() {
  const questions = flattenQuestions(unit);
  const idx = session.questionIndex;
  if (idx >= questions.length) { await examFinish(); return; }

  const q      = questions[idx];
  const parent = findParentCase(q);
  let html     = "";

  // Кейс — описание ситуации клиента
  if (parent && parent.type === "case" && parent.content && parent.content.description &&
      parent.content.description.trim()) {
    html += `<div class="sb-msg__case">${esc(parent.content.description)}</div>`;
  }
  html += `<p>${esc(q.content && q.content.text || "(вопрос не заполнен)")}</p>`;

  await botSay(html, 600);
}

async function examHandleAnswer(text) {
  // Экзамен: просто переходим к следующему вопросу, без обратной связи (FR-04)
  session.questionIndex++;
  saveSession();
  await examAskQuestion();
}

async function examFinish() {
  stopTimer();
  session.phase = "done";
  saveSession();

  const compHtml = getNodeHtml(unit, "completion");
  let html = `<p>✅ <strong>Экзамен завершён.</strong></p>`;
  if (compHtml) html += `<div class="sb-msg__block">${compHtml}</div>`;
  await botSay(html, 600);

  setTimeout(() => showExamCompletionModal(), 800);
}

function showExamCompletionModal() {
  const inner = document.getElementById("completion-modal-inner");
  inner.innerHTML = `
    <div class="sb-modal__icon" aria-hidden="true">📬</div>
    <h2 class="sb-modal__title">Экзамен завершён</h2>
    <p class="sb-modal__desc">Ваши результаты будут направлены руководителю.<br>
      <strong>Результат отображается с задержкой 10 минут.</strong></p>
    <div class="sb-modal__actions">
      <button class="sb-modal__btn sb-modal__btn--secondary" id="exam-completion-back-btn" type="button">
        Вернуться в конструктор
      </button>
      <button class="sb-modal__btn sb-modal__btn--primary" id="exam-completion-publish-btn" type="button">
        Опубликовать
      </button>
    </div>`;
  document.getElementById("completion-modal").classList.remove("hidden");

  document.getElementById("exam-completion-back-btn").addEventListener("click", () => {
    clearSession();
    goBackToBuilder();
  });
  document.getElementById("exam-completion-publish-btn").addEventListener("click", () => {
    document.getElementById("completion-modal").classList.add("hidden");
    doPublish();
  });
}

/* ─────────────────────────────────────────────────
   ТРЕНАЖЁР — обработка ввода
───────────────────────────────────────────────── */
async function handleTrainerInput(text) {
  appendMessage("user", `<p>${esc(text)}</p>`);
  if (session.phase === "greeting") {
    if (/^старт$/i.test(text)) {
      await trainerStart();
    } else {
      await botSay(`<p>Введите <strong>«Старт»</strong>, чтобы начать тренировку.</p>`, 350);
    }
  } else if (session.phase === "running") {
    await trainerHandleAnswer(text);
  }
}

/* ─────────────────────────────────────────────────
   ЭКЗАМЕН — обработка ввода
───────────────────────────────────────────────── */
async function handleExamInput(text) {
  if (session.phase !== "running") return;
  appendMessage("user", `<p>${esc(text)}</p>`);
  await examHandleAnswer(text);
}

/* ─────────────────────────────────────────────────
   ОБЩИЙ ОБРАБОТЧИК ВВОДА
───────────────────────────────────────────────── */
async function handleInput() {
  const inp  = document.getElementById("sb-input");
  const text = inp.value.trim();
  if (!text || isBusy) return;
  inp.value = "";
  inp.style.height = "";

  if (unit.type === "trainer") {
    await handleTrainerInput(text);
  } else {
    await handleExamInput(text);
  }
}

/* ─────────────────────────────────────────────────
   ПУБЛИКАЦИЯ
───────────────────────────────────────────────── */
function doPublish() {
  document.getElementById("loading-modal").classList.remove("hidden");
  markUnitPublished(unitId);
  setTimeout(() => {
    clearSession();
    document.getElementById("loading-modal").classList.add("hidden");
    document.getElementById("success-modal").classList.remove("hidden");
  }, 1800);
}

function goBackToBuilder() {
  window.location.href = `../builder/index.html?id=${encodeURIComponent(unitId)}`;
}

/* ─────────────────────────────────────────────────
   ИНИЦИАЛИЗАЦИЯ
───────────────────────────────────────────────── */
function init() {
  const params = new URLSearchParams(window.location.search);
  unitId = params.get("id");

  if (!unitId) { showFatalError("Не указан идентификатор обучения."); return; }

  unit = loadUnit(unitId);
  if (!unit) { showFatalError(`Обучение с ID «${esc(unitId)}» не найдено.`); return; }

  const isExam    = unit.type !== "trainer";
  const isTrainer = unit.type === "trainer";

  document.getElementById("sb-unit-title").textContent = unit.title;
  document.title = `Тест: ${unit.title} — AI-Ментор`;

  if (isExam) {
    document.getElementById("sb-mode-badge").textContent = "Тестовая среда · Экзамен";
    document.body.classList.add("mode-exam");
  } else {
    document.getElementById("sb-mode-badge").textContent = "Тестовая среда · Тренажёр";
    document.body.classList.add("mode-trainer");
  }

  /* ── Восстановление сессии ── */
  const saved = loadSavedSession();
  const inSameTab = sessionStorage.getItem(ERROR_SESSION_FLAG);

  if (saved && saved.unitId === unitId) {
    session = saved;

    if (session.phase === "done") {
      /* Оба режима: сессия завершена → восстанавливаем и показываем финал */
      restoreMessages();
      if (isExam) {
        setTimeout(() => showExamCompletionModal(), 150);
      } else {
        setTimeout(() => showTrainerReport(), 150);
      }
      return bindEvents(isExam, isTrainer);
    }

    if (isExam && session.phase === "running") {
      if (session.errorOccurred && !inSameTab) {
        /* UC 8.5: ошибка + закрытие браузера → показать "Продолжить экзамен" */
        restoreMessages();
        document.getElementById("resume-modal").classList.remove("hidden");
      } else {
        /* UC 8.4: ошибка + обновление страницы (inSameTab) → тихое восстановление */
        restoreMessages();
        session.errorOccurred = false;
        saveSession();
        document.getElementById("sb-timer").classList.remove("hidden");
        document.getElementById("btn-show-client").classList.remove("hidden");
        document.getElementById("sb-role-bar").classList.remove("hidden");
        document.getElementById("sb-role-client-label").textContent = "💬 " + MOCK_CLIENT.name;
        document.getElementById("sb-mode-badge").textContent = "Экзамен";
        renderTimer(session.elapsedSeconds || 0);
        startTimer();
        setInputLocked(false);
        examAskQuestion();
      }
      return bindEvents(isExam, isTrainer);
    }

    if (isTrainer) {
      /* FR-04 тренажёра: всегда восстанавливаем с того места */
      restoreMessages();
      if (session.phase === "running") {
        setInputLocked(false);
        trainerAskQuestion();
      } else {
        setInputLocked(false);
      }
      return bindEvents(isExam, isTrainer);
    }
  }

  /* ── Новая сессия ── */
  session = {
    unitId,
    phase: "greeting",
    questionIndex: 0,
    messages: [],
    errors: [],
    elapsedSeconds: 0,
    errorOccurred: false,
  };
  saveSession();

  if (isExam) {
    showExamRulesModal();
  } else {
    trainerGreeting();
    setInputLocked(false);
  }

  bindEvents(isExam, isTrainer);
}

function bindEvents(isExam, isTrainer) {
  /* ── Вернуться в конструктор (FR-05) ── */
  document.getElementById("btn-back-to-builder").addEventListener("click", () => {
    stopTimer();
    clearSession();
    goBackToBuilder();
  });

  /* ── Ввод текста ── */
  const inp = document.getElementById("sb-input");
  const btn = document.getElementById("sb-send-btn");

  btn.addEventListener("click", handleInput);
  inp.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleInput(); }
  });
  inp.addEventListener("input", () => {
    inp.style.height = "";
    inp.style.height = Math.min(inp.scrollHeight, 140) + "px";
  });

  /* ── Правила экзамена ── */
  if (isExam) {
    document.getElementById("exam-rules-start-btn").addEventListener("click", startExam);
    document.getElementById("exam-rules-back-btn").addEventListener("click", () => {
      clearSession();
      goBackToBuilder();
    });

    /* Возобновление после ошибки (UC 8.5) */
    document.getElementById("resume-continue-btn").addEventListener("click", resumeExam);

    /* Данные клиента */
    document.getElementById("btn-show-client").addEventListener("click", () => {
      renderClientCard();
      document.getElementById("client-modal").classList.remove("hidden");
    });
    document.getElementById("client-modal-close").addEventListener("click", () => {
      document.getElementById("client-modal").classList.add("hidden");
    });
    document.getElementById("client-modal").addEventListener("click", e => {
      if (e.target === e.currentTarget)
        document.getElementById("client-modal").classList.add("hidden");
    });
  }

  /* ── Отчёт тренажёра ── */
  if (isTrainer) {
    document.getElementById("report-back-btn").addEventListener("click", () => {
      clearSession();
      goBackToBuilder();
    });
    document.getElementById("report-publish-btn").addEventListener("click", () => {
      document.getElementById("report-modal").classList.add("hidden");
      doPublish();
    });
  }

  /* ── Ошибка системы ── */
  document.getElementById("error-refresh-btn").addEventListener("click", () => {
    location.reload();
  });

  document.getElementById("success-back-btn").addEventListener("click", () => {
    goBackToBuilder();
  });

  document.getElementById("success-catalog-btn").addEventListener("click", () => {
    window.location.href = "../index.html";
  });
}

/* ── Карточка клиента ────────────────────────────── */
function renderClientCard() {
  const c   = MOCK_CLIENT;
  const el  = document.getElementById("sb-client-card");
  el.innerHTML = `
    <div class="sb-client-row"><span class="sb-client-label">ФИО</span><span>${esc(c.name)}</span></div>
    <div class="sb-client-row"><span class="sb-client-label">Телефон</span><span>${esc(c.phone)}</span></div>
    <div class="sb-client-row"><span class="sb-client-label">Счёт</span><span>${esc(c.account)}</span></div>
    <div class="sb-client-row"><span class="sb-client-label">Статус</span><span>${esc(c.status)}</span></div>
    <div class="sb-client-row"><span class="sb-client-label">Продукты</span>
      <span>${c.products.map(p => esc(p)).join("<br>")}</span>
    </div>
    <div class="sb-client-row sb-client-row--highlight">
      <span class="sb-client-label">Запрос</span><span>${esc(c.request)}</span>
    </div>`;
}

/* ── Ошибка ──────────────────────────────────────── */
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
