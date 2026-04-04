/**
 * ══════════════════════════════════════════════════
 * AI-Ментор · Сервис сессий песочницы
 * ══════════════════════════════════════════════════
 * 
 * Бизнес-логика для работы с сессиями тестирования.
 */

import { storage } from '../core/storage.js';
import { STORAGE_KEYS, SESSION_STATUS } from '../core/constants.js';
import { emit, EventTypes } from '../core/events.js';

/**
 * Класс сервиса сессий
 */
export class SessionService {
  constructor() {
    this.session = null;
  }

  loadSession() {
    return sessionService.loadSession();
  }

  saveSession(session) {
    return sessionService.saveSession(session);
  }

  clearSession() {
    return sessionService.clearSession();
  }

  createSession(unit, options = {}) {
    this.session = sessionService.createSession(unit, options);
    return this.session;
  }

  completeSession(session, results = {}) {
    return sessionService.completeSession(session, results);
  }
}

/**
 * Сервис сессий
 */
export const sessionService = {
  /**
   * Загрузить сессию
   * @returns {Object|null}
   */
  loadSession() {
    return storage.getObject(STORAGE_KEYS.SANDBOX_SESSION, null);
  },

  /**
   * Сохранить сессию
   * @param {Object} session - сессия
   */
  saveSession(session) {
    storage.setObject(STORAGE_KEYS.SANDBOX_SESSION, session);
  },

  /**
   * Очистить сессию
   */
  clearSession() {
    storage.remove(STORAGE_KEYS.SANDBOX_SESSION);
  },

  /**
   * Создать новую сессию
   * @param {Object} unit - unit для тестирования
   * @param {Object} options - опции
   * @returns {Object}
   */
  createSession(unit, options = {}) {
    const session = {
      id: `session-${Date.now()}`,
      unitId: unit.id,
      unitTitle: unit.title,
      type: unit.type, // trainer или exam
      mode: options.mode || unit.type, // trainer или exam
      status: SESSION_STATUS.IN_PROGRESS,
      startedAt: new Date().toISOString(),
      completedAt: null,
      
      // Прогресс
      currentQuestionIndex: 0,
      questions: this.extractQuestions(unit),
      answers: [],
      
      // Результаты
      score: null,
      correctCount: 0,
      incorrectCount: 0,
      totalTime: 0,
      
      // Для экзамена
      timeLimit: options.timeLimit || null, // в минутах
      timeRemaining: options.timeLimit ? options.timeLimit * 60 : null,
      
      // Метаданные
      employeeId: options.employeeId || null,
      employeeName: options.employeeName || null,
    };
    
    this.saveSession(session);
    emit(EventTypes.SANDBOX_SESSION_STARTED, { session });
    
    return session;
  },

  /**
   * Извлечь вопросы из unit'а
   * @param {Object} unit - unit
   * @returns {Object[]}
   */
  extractQuestions(unit) {
    const questions = [];
    
    function walk(node) {
      if (node.type === 'question') {
        questions.push({
          id: node.id,
          text: this.getQuestionText(node),
          type: node.questionType || 'open', // open, choice, multi
          criteria: this.getCriteria(node),
          hints: this.getHints(node),
          weight: node.weight || 1,
        });
      }
      if (node.children) {
        node.children.forEach(walk, this);
      }
    }
    
    if (unit.children) {
      unit.children.forEach(walk, this);
    }
    
    return questions;
  },

  /**
   * Получить текст вопроса
   * @param {Object} node - узел вопроса
   * @returns {string}
   */
  getQuestionText(node) {
    if (!node.content || !node.content.elements) return '';
    
    const textElements = node.content.elements.filter(el => el.text);
    return textElements.map(el => el.text).join('\n\n');
  },

  /**
   * Получить критерии оценки
   * @param {Object} node - узел вопроса
   * @returns {Object[]}
   */
  getCriteria(node) {
    const criteria = [];
    
    if (node.children) {
      for (const child of node.children) {
        if (child.type === 'criteria') {
          criteria.push({
            id: child.id,
            text: child.text || child.content?.text || '',
            weight: child.weight || 1,
          });
        }
      }
    }
    
    return criteria;
  },

  /**
   * Получить подсказки
   * @param {Object} node - узел вопроса
   * @returns {Object[]}
   */
  getHints(node) {
    const hints = [];
    
    if (node.children) {
      for (const child of node.children) {
        if (child.type === 'hint') {
          hints.push({
            id: child.id,
            text: child.text || child.content?.text || '',
          });
        }
      }
    }
    
    return hints;
  },

  /**
   * Сохранить ответ
   * @param {Object} session - сессия
   * @param {number} questionIndex - индекс вопроса
   * @param {string} answer - ответ
   * @param {number} timeSpent - время в секундах
   */
  saveAnswer(session, questionIndex, answer, timeSpent) {
    if (!session.answers) session.answers = [];
    
    session.answers[questionIndex] = {
      questionId: session.questions[questionIndex].id,
      answer,
      timeSpent,
      timestamp: new Date().toISOString(),
    };
    
    session.totalTime += timeSpent;
    this.saveSession(session);
    
    emit(EventTypes.SANDBOX_QUESTION_ANSWERED, {
      session,
      questionIndex,
      answer,
    });
  },

  /**
   * Перейти к следующему вопросу
   * @param {Object} session - сессия
   * @returns {boolean} - есть ли следующий вопрос
   */
  nextQuestion(session) {
    if (session.currentQuestionIndex < session.questions.length - 1) {
      session.currentQuestionIndex++;
      this.saveSession(session);
      return true;
    }
    return false;
  },

  /**
   * Перейти к предыдущему вопросу
   * @param {Object} session - сессия
   * @returns {boolean} - есть ли предыдущий вопрос
   */
  prevQuestion(session) {
    if (session.currentQuestionIndex > 0) {
      session.currentQuestionIndex--;
      this.saveSession(session);
      return true;
    }
    return false;
  },

  /**
   * Завершить сессию
   * @param {Object} session - сессия
   * @param {Object} results - результаты
   * @returns {Object}
   */
  completeSession(session, results = {}) {
    session.status = SESSION_STATUS.COMPLETED;
    session.completedAt = new Date().toISOString();
    session.score = results.score || null;
    session.correctCount = results.correctCount || 0;
    session.incorrectCount = results.incorrectCount || 0;
    
    this.saveSession(session);
    emit(EventTypes.SANDBOX_SESSION_COMPLETED, { session });
    
    return session;
  },

  /**
   * Вычислить результат
   * @param {Object} session - сессия
   * @returns {Object}
   */
  calculateResults(session) {
    const totalQuestions = session.questions.length;
    const answeredQuestions = session.answers.filter(a => a && a.answer).length;
    
    // Для тренажёра - просто количество отвеченных
    // Для экзамена - нужен скоринг
    
    return {
      totalQuestions,
      answeredQuestions,
      unansweredQuestions: totalQuestions - answeredQuestions,
      totalTime: session.totalTime,
      score: session.score,
      correctCount: session.correctCount,
      incorrectCount: session.incorrectCount,
    };
  },
};

export default sessionService;
