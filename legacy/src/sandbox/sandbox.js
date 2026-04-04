/**
 * ══════════════════════════════════════════════════
 * Sandbox Page - Main Entry Point
 * ══════════════════════════════════════════════════
 * 
 * Главная страница песочницы для прохождения юнитов.
 */

import { EventBus, EventTypes } from '../core/events.js';
import { createState } from '../core/state.js';
import { storage } from '../core/storage.js';
import { QUESTION_TYPES, STORAGE_KEYS } from '../core/constants.js';
import { formatDuration, generateId } from '../core/utils.js';

import { QuestionView, createQuestionView } from './components/question-view.js';
import { AnswerInput, createAnswerInput } from './components/answer-input.js';
import { Timer, createTimer } from './components/timer.js';
import { ProgressBar, createProgressBar } from './components/progress-bar.js';
import { ResultScreen, createResultScreen } from './components/result-screen.js';
import { ClientCard, createClientCard } from './components/client-card.js';
import { SessionService } from './services/sessionService.js';

/**
 * Класс страницы песочницы
 */
export class SandboxPage {
  /**
   * @param {Object} options
   * @param {Object} options.bootstrap - Начальные данные
   */
  constructor({ bootstrap = {} } = {}) {
    this.bootstrap = bootstrap;
    this.unit = null;
    this.session = null;
    this.questions = [];
    this.currentIndex = 0;
    this.answers = [];
    this.startTime = null;
    this.endTime = null;
    
    this.components = {
      questionView: null,
      answerInput: null,
      timer: null,
      progressBar: null,
      resultScreen: null,
      clientCard: null,
    };
    
    this.state = createState({
      status: 'idle', // idle, loading, running, completed
      currentQuestion: null,
      progress: 0,
      timeElapsed: 0,
    });
    
    this.sessionService = new SessionService();
    
    this.init();
  }

  /**
   * Инициализирует страницу
   */
  init() {
    this.cacheDom();
    this.loadUnit();
    this.initComponents();
    this.bindEvents();
  }

  /**
   * Кэширует DOM-элементы
   */
  cacheDom() {
    this.dom = {
      container: document.querySelector('.sandbox-container'),
      questionContainer: document.querySelector('.question-container'),
      answerContainer: document.querySelector('.answer-container'),
      timerContainer: document.querySelector('.timer-container'),
      progressContainer: document.querySelector('.progress-container'),
      resultContainer: document.querySelector('.result-container'),
      clientCardContainer: document.querySelector('.client-card-container'),
      navigation: document.querySelector('.sandbox-navigation'),
      btnPrev: document.querySelector('.btn-prev'),
      btnNext: document.querySelector('.btn-next'),
      btnSubmit: document.querySelector('.btn-submit'),
    };
  }

  /**
   * Загружает юнит из bootstrap или storage
   */
  loadUnit() {
    // Пытаемся получить юнит из bootstrap
    if (this.bootstrap.unit) {
      this.unit = this.bootstrap.unit;
    } else {
      // Пытаемся загрузить из storage
      const unitId = storage.get(STORAGE_KEYS.CURRENT_UNIT);
      if (unitId) {
        const units = storage.get(STORAGE_KEYS.UNITS) || [];
        this.unit = units.find(u => u.id === unitId);
      }
    }
    
    if (this.unit) {
      this.questions = this.extractQuestions(this.unit);
      this.createSession();
    }
  }

  /**
   * Извлекает вопросы из юнита
   * @param {Object} unit
   * @returns {Array<Object>}
   */
  extractQuestions(unit) {
    const questions = [];
    
    if (unit.nodes) {
      unit.nodes.forEach(node => {
        if (node.type === 'question' || node.question) {
          questions.push({
            id: node.id || generateId(),
            text: node.question || node.text,
            type: node.questionType || QUESTION_TYPES.SINGLE_CHOICE,
            options: node.options || [],
            correctAnswer: node.correctAnswer || node.answer,
            explanation: node.explanation,
            category: node.category,
            points: node.points || 1,
          });
        }
      });
    }
    
    return questions;
  }

  /**
   * Создаёт сессию прохождения
   */
  createSession() {
    this.session = {
      id: generateId(),
      unitId: this.unit.id,
      startTime: Date.now(),
      status: 'running',
    };
    
    this.startTime = Date.now();
    this.answers = new Array(this.questions.length).fill(null);
  }

  /**
   * Инициализирует компоненты
   */
  initComponents() {
    // Таймер
    if (this.dom.timerContainer) {
      this.components.timer = createTimer({
        container: this.dom.timerContainer,
        duration: this.unit?.timeLimit || 0,
        onTick: (elapsed) => this.handleTick(elapsed),
        onComplete: () => this.handleTimeUp(),
      });
    }
    
    // Прогресс-бар
    if (this.dom.progressContainer) {
      this.components.progressBar = createProgressBar({
        container: this.dom.progressContainer,
        total: this.questions.length,
        current: 0,
      });
    }
    
    // Клиентская карта (для экзаменов)
    if (this.dom.clientCardContainer && this.unit?.showClientCard) {
      this.components.clientCard = createClientCard({
        container: this.dom.clientCardContainer,
        client: this.bootstrap.client,
        sections: this.unit.clientCardSections,
      });
    }
    
    // Показываем первый вопрос
    this.showQuestion(0);
  }

  /**
   * Показывает вопрос по индексу
   * @param {number} index
   */
  showQuestion(index) {
    if (index < 0 || index >= this.questions.length) return;
    
    this.currentIndex = index;
    const question = this.questions[index];
    
    // Обновляем состояние
    this.state.currentQuestion = question;
    this.state.progress = ((index + 1) / this.questions.length) * 100;
    
    // Компонент вопроса
    if (this.dom.questionContainer) {
      if (this.components.questionView) {
        this.components.questionView.destroy();
      }
      this.components.questionView = createQuestionView({
        container: this.dom.questionContainer,
        question: question,
        index: index + 1,
        total: this.questions.length,
      });
    }
    
    // Компонент ответа
    if (this.dom.answerContainer) {
      if (this.components.answerInput) {
        this.components.answerInput.destroy();
      }
      this.components.answerInput = createAnswerInput({
        container: this.dom.answerContainer,
        question: question,
        answer: this.answers[index],
        onChange: (answer) => this.handleAnswerChange(answer),
      });
    }
    
    // Обновляем прогресс-бар
    if (this.components.progressBar) {
      this.components.progressBar.setCurrent(index + 1);
    }
    
    // Обновляем навигацию
    this.updateNavigation();
    
    // Отправляем событие
    EventBus.emit(EventTypes.SANDBOX_QUESTION_SHOWN, { question, index });
  }

  /**
   * Обновляет состояние навигации
   */
  updateNavigation() {
    if (this.dom.btnPrev) {
      this.dom.btnPrev.disabled = this.currentIndex === 0;
    }
    
    if (this.dom.btnNext) {
      this.dom.btnNext.disabled = this.currentIndex === this.questions.length - 1;
    }
    
    if (this.dom.btnSubmit) {
      this.dom.btnSubmit.style.display = 
        this.currentIndex === this.questions.length - 1 ? 'block' : 'none';
    }
  }

  /**
   * Обрабатывает изменение ответа
   * @param {Object} answer
   */
  handleAnswerChange(answer) {
    this.answers[this.currentIndex] = answer;
    
    EventBus.emit(EventTypes.SANDBOX_ANSWER_CHANGED, {
      questionIndex: this.currentIndex,
      answer,
    });
  }

  /**
   * Обрабатывает тик таймера
   * @param {number} elapsed
   */
  handleTick(elapsed) {
    this.state.timeElapsed = elapsed;
  }

  /**
   * Обрабатывает окончание времени
   */
  handleTimeUp() {
    this.completeSession();
  }

  /**
   * Переходит к следующему вопросу
   */
  nextQuestion() {
    if (this.currentIndex < this.questions.length - 1) {
      this.showQuestion(this.currentIndex + 1);
    }
  }

  /**
   * Переходит к предыдущему вопросу
   */
  prevQuestion() {
    if (this.currentIndex > 0) {
      this.showQuestion(this.currentIndex - 1);
    }
  }

  /**
   * Завершает сессию и показывает результаты
   */
  completeSession() {
    this.endTime = Date.now();
    this.state.status = 'completed';
    
    // Останавливаем таймер
    if (this.components.timer) {
      this.components.timer.stop();
    }
    
    // Вычисляем результаты
    const results = this.calculateResults();
    
    // Сохраняем сессию
    this.saveSession(results);
    
    // Показываем экран результатов
    this.showResults(results);
    
    // Отправляем событие
    EventBus.emit(EventTypes.SANDBOX_SESSION_COMPLETED, { results });
  }

  /**
   * Вычисляет результаты
   * @returns {Object}
   */
  calculateResults() {
    let correct = 0;
    let totalPoints = 0;
    let earnedPoints = 0;
    
    const detailedAnswers = this.questions.map((question, index) => {
      const answer = this.answers[index];
      const isCorrect = this.checkAnswer(question, answer);
      
      if (isCorrect) {
        correct++;
        earnedPoints += question.points;
      }
      totalPoints += question.points;
      
      return {
        questionId: question.id,
        question: question.text,
        userAnswer: answer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        points: question.points,
        category: question.category,
      };
    });
    
    return {
      correct,
      total: this.questions.length,
      score: earnedPoints,
      maxScore: totalPoints,
      time: this.endTime - this.startTime,
      answers: detailedAnswers,
      percentage: totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0,
    };
  }

  /**
   * Проверяет ответ
   * @param {Object} question
   * @param {Object} answer
   * @returns {boolean}
   */
  checkAnswer(question, answer) {
    if (!answer) return false;
    
    switch (question.type) {
      case QUESTION_TYPES.SINGLE_CHOICE:
        return answer.value === question.correctAnswer;
        
      case QUESTION_TYPES.MULTIPLE_CHOICE:
        const correct = new Set(question.correctAnswer);
        const given = new Set(answer.values || []);
        if (correct.size !== given.size) return false;
        for (const val of correct) {
          if (!given.has(val)) return false;
        }
        return true;
        
      case QUESTION_TYPES.TEXT_INPUT:
        return answer.value?.toLowerCase().trim() === 
               question.correctAnswer?.toLowerCase().trim();
        
      case QUESTION_TYPES.MATCHING:
        // TODO: Реализовать проверку matching
        return false;
        
      default:
        return false;
    }
  }

  /**
   * Сохраняет сессию
   * @param {Object} results
   */
  saveSession(results) {
    const session = {
      ...this.session,
      endTime: this.endTime,
      results,
      status: 'completed',
    };
    
    this.sessionService.saveSession(session);
  }

  /**
   * Показывает экран результатов
   * @param {Object} results
   */
  showResults(results) {
    // Скрываем контейнеры вопросов
    if (this.dom.questionContainer) {
      this.dom.questionContainer.style.display = 'none';
    }
    if (this.dom.answerContainer) {
      this.dom.answerContainer.style.display = 'none';
    }
    if (this.dom.navigation) {
      this.dom.navigation.style.display = 'none';
    }
    
    // Показываем результаты
    if (this.dom.resultContainer) {
      this.dom.resultContainer.style.display = 'block';
      this.components.resultScreen = createResultScreen({
        container: this.dom.resultContainer,
        results,
        onRestart: () => this.restart(),
        onExit: () => this.exit(),
      });
    }
  }

  /**
   * Перезапускает сессию
   */
  restart() {
    this.currentIndex = 0;
    this.answers = new Array(this.questions.length).fill(null);
    this.startTime = Date.now();
    this.endTime = null;
    this.state.status = 'running';
    
    // Показываем контейнеры
    if (this.dom.questionContainer) {
      this.dom.questionContainer.style.display = 'block';
    }
    if (this.dom.answerContainer) {
      this.dom.answerContainer.style.display = 'block';
    }
    if (this.dom.navigation) {
      this.dom.navigation.style.display = 'flex';
    }
    if (this.dom.resultContainer) {
      this.dom.resultContainer.style.display = 'none';
    }
    
    // Перезапускаем таймер
    if (this.components.timer) {
      this.components.timer.reset();
      this.components.timer.start();
    }
    
    // Показываем первый вопрос
    this.showQuestion(0);
  }

  /**
   * Выходит из песочницы
   */
  exit() {
    EventBus.emit(EventTypes.SANDBOX_EXIT, { unit: this.unit });
    
    // Возвращаемся на главную страницу
    window.location.href = '/';
  }

  /**
   * Привязывает обработчики событий
   */
  bindEvents() {
    // Навигация
    if (this.dom.btnNext) {
      this.dom.btnNext.addEventListener('click', () => this.nextQuestion());
    }
    
    if (this.dom.btnPrev) {
      this.dom.btnPrev.addEventListener('click', () => this.prevQuestion());
    }
    
    if (this.dom.btnSubmit) {
      this.dom.btnSubmit.addEventListener('click', () => this.completeSession());
    }
    
    // Клавиатурная навигация
    document.addEventListener('keydown', (e) => this.handleKeydown(e));
    
    // Подписываемся на события
    EventBus.on(EventTypes.SANDBOX_QUESTION_ANSWERED, (data) => {
      this.handleAnswerChange(data.answer);
    });
  }

  /**
   * Обрабатывает нажатия клавиш
   * @param {KeyboardEvent} e
   */
  handleKeydown(e) {
    if (this.state.status !== 'running') return;
    
    switch (e.key) {
      case 'ArrowRight':
      case 'Enter':
        if (!e.target.matches('input, textarea')) {
          e.preventDefault();
          this.nextQuestion();
        }
        break;
      case 'ArrowLeft':
        if (!e.target.matches('input, textarea')) {
          e.preventDefault();
          this.prevQuestion();
        }
        break;
    }
  }

  /**
   * Уничтожает страницу
   */
  destroy() {
    // Уничтожаем компоненты
    Object.values(this.components).forEach(component => {
      if (component && typeof component.destroy === 'function') {
        component.destroy();
      }
    });
    
    // Удаляем обработчики
    document.removeEventListener('keydown', this.handleKeydown);
  }
}

/**
 * Создаёт и инициализирует страницу песочницы
 * @param {Object} options
 * @returns {SandboxPage}
 */
export function initSandbox(options = {}) {
  const bootstrap = window.AI_MENTOR_BOOTSTRAP || options.bootstrap || {};
  return new SandboxPage({ bootstrap });
}

/**
 * Создаёт страницу песочницы
 * @param {Object} options
 * @returns {SandboxPage}
 */
export function createSandboxPage(options) {
  return new SandboxPage(options);
}

// Автоинициализация при загрузке
if (typeof window !== 'undefined') {
  window.initSandbox = initSandbox;
}
