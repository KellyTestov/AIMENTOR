/**
 * ══════════════════════════════════════════════════
 * Sandbox Module - Public API
 * ══════════════════════════════════════════════════
 * 
 * Публичный API модуля песочницы.
 */

// Main entry point
export { SandboxPage, initSandbox, createSandboxPage } from './sandbox.js';

// Components
export { QuestionView, createQuestionView } from './components/question-view.js';
export { AnswerInput, createAnswerInput } from './components/answer-input.js';
export { Timer, createTimer } from './components/timer.js';
export { ProgressBar, createProgressBar } from './components/progress-bar.js';
export { ResultScreen, createResultScreen } from './components/result-screen.js';
export { ClientCard, createClientCard } from './components/client-card.js';

// Services
export { SessionService } from './services/sessionService.js';
