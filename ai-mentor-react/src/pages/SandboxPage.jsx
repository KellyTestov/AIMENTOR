import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useSandboxStore } from '../stores/sandboxStore.js'
import { useSandboxEngine } from '../components/sandbox/useSandboxEngine.js'
import ChatWindow from '../components/sandbox/ChatWindow.jsx'
import AnswerInput from '../components/sandbox/AnswerInput.jsx'
import { ElapsedTimer, QuestionTimer } from '../components/sandbox/ExamTimer.jsx'
import ClientCard from '../components/sandbox/ClientCard.jsx'
import ExamRulesModal from '../components/sandbox/ExamRulesModal.jsx'
import ResumeModal from '../components/sandbox/ResumeModal.jsx'
import TrainerReportModal from '../components/sandbox/TrainerReportModal.jsx'
import ExamCompletionModal from '../components/sandbox/ExamCompletionModal.jsx'
import PublishSuccessModal from '../components/sandbox/PublishSuccessModal.jsx'
import '../sandbox.css'

export default function SandboxPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const { unit, phase, error, client, session, isBusy, clearSession, publishUnit, loadUnit, cases, activeCaseId, setActiveCaseId, closedCaseIds, timerExpired, setTimerExpired } = useSandboxStore()
  const { handleInput, handleStartButton, handleNextButton, startTrainer, startExam, resumeExam, handleFinish, forceFinish } = useSandboxEngine()

  const [publishing, setPublishing] = useState(false)
  const [published,  setPublished]  = useState(false)
  const [origin,     setOrigin]     = useState('catalog')

  useEffect(() => {
    const id = searchParams.get('id') || sessionStorage.getItem('sb-pending-id') || ''
    if (id) {
      sessionStorage.removeItem('sb-pending-id')
      loadUnit(id)
    }
    const src = sessionStorage.getItem('sb-origin') || 'catalog'
    sessionStorage.removeItem('sb-origin')
    setOrigin(src)
  }, [searchParams, loadUnit])

  useEffect(() => {
    if (unit && unit.type === 'trainer' && phase === 'idle') {
      startTrainer()
    }
  }, [unit, phase, startTrainer])

  function goToBuilder() {
    navigate(unit ? `/builder?id=${unit.id}` : '/')
  }

  function handleBack() {
    clearSession()
    origin === 'builder' ? goToBuilder() : navigate('/')
  }

  function handlePublish() {
    setPublishing(true)
    publishUnit()
    setTimeout(() => {
      setPublishing(false)
      setPublished(true)
      clearSession()
    }, 1500)
  }

  if (error || phase === 'error') {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', minHeight: '100vh', gap: 16, padding: 32,
        background: 'var(--bg)', fontFamily: 'Manrope, sans-serif', textAlign: 'center',
      }}>
        <div style={{ fontSize: 48 }}>⚠️</div>
        <p style={{ maxWidth: 380, fontSize: 14, lineHeight: 1.6, color: 'var(--muted)' }}>
          {error || 'Ошибка загрузки обучения'}
        </p>
        <button className="sb-back-btn" onClick={() => navigate('/')}>← Каталог</button>
      </div>
    )
  }

  if (!unit) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>Загрузка...</div>
  }

  const isExam      = unit.type !== 'trainer'
  const showSidebar = isExam && phase === 'running'

  return (
    <div className={`sb-shell${isExam ? ' mode-exam' : ' mode-trainer'}`}>

      {/* Header */}
      <header className="sb-header">
        <div className="sb-header__left">
          <button className="sb-back-btn" onClick={handleBack}>
            {origin === 'builder' ? '← Вернуться в конструктор' : '← В каталог'}
          </button>
        </div>
        <div className="sb-header__center">
          <span className="sb-header__unit-label">Тестовая среда</span>
          <span className="sb-header__title" id="sb-unit-title">{unit.title}</span>
        </div>
        <div className="sb-header__right">
          {phase === 'running' && <ElapsedTimer />}
        </div>
      </header>

      {/* Exam subheader — client name + request */}
      {showSidebar && (
        <div className="sb-exam-bar">
          <span className="sb-exam-bar__label">Чат с клиентом</span>
          <span className="sb-exam-bar__name">{client.name}</span>
          {client.request && (
            <>
              <span className="sb-exam-bar__sep">·</span>
              <span className="sb-exam-bar__req">{client.request}</span>
            </>
          )}
        </div>
      )}

      {/* Client tabs (exam) */}
      {isExam && cases.length > 0 && (
        <div className="sb-tabs">
          {cases.map(c => {
            const isActive = c.id === activeCaseId
            const isClosed = closedCaseIds.includes(c.id)
            return (
              <button
                key={c.id}
                className={`sb-tab${isActive ? ' is-active' : ''}${isClosed ? ' is-closed' : ''}`}
                onClick={() => setActiveCaseId(c.id)}
                disabled={isClosed}
              >
                <span>👤 {c.clientName}</span>
                {isActive && <QuestionTimer />}
              </button>
            )
          })}
        </div>
      )}

      {/* Body */}
      <div className={`sb-body${showSidebar ? ' sb-body--with-sidebar' : ''}`}>

        {/* Chat area */}
        <div className="sb-chat-wrap">
          <ChatWindow />
          {session?.phase === 'greeting' ? (
            <div className="sb-theory-actions">
              <button className="sb-theory-btn" onClick={handleStartButton} disabled={isBusy}>
                Старт
              </button>
            </div>
          ) : session?.phase === 'theory' ? (
            <div className="sb-theory-actions">
              <button className="sb-theory-btn" onClick={handleNextButton} disabled={isBusy}>
                Дальше →
              </button>
            </div>
          ) : phase === 'finished' ? (
            <div className="sb-theory-actions">
              <button className="sb-theory-btn" onClick={handleFinish}>
                Завершить тренировку
              </button>
            </div>
          ) : (
            <AnswerInput onSend={handleInput} />
          )}
        </div>

        {/* Right sidebar — client card (exam only) */}
        {showSidebar && (
          <aside className="sb-sidebar">
            <ClientCard sidebar />
          </aside>
        )}
      </div>

      {/* Modals */}
      {phase === 'rules' && (
        <ExamRulesModal unitTitle={unit.title} onStart={startExam} onBack={handleBack} />
      )}
      {phase === 'resume' && (
        <ResumeModal onContinue={resumeExam} onBack={handleBack} />
      )}
      {phase === 'done' && !isExam && (
        <TrainerReportModal onBack={handleBack} />
      )}
      {phase === 'done' && isExam && (
        <ExamCompletionModal onBack={handleBack} onPublish={handlePublish} />
      )}
      {publishing && (
        <div className="sb-modal-backdrop" id="loading-modal">
          <div className="sb-modal sb-modal--compact">
            <div className="sb-loader"><div className="sb-loader__ring" /></div>
            <p className="sb-modal__desc">Публикуем обучение...</p>
          </div>
        </div>
      )}
      {published && (
        <PublishSuccessModal onBackToBuilder={goToBuilder} onCatalog={() => navigate('/')} />
      )}

      {/* Timer expired modal */}
      {timerExpired && phase === 'running' && (() => {
        const cn = (unit?.children || []).find(c => c.type === 'completion')
        const tc = cn?.content?.timer || {}
        const title = tc.expireTitle?.trim() || 'Время истекло'
        const text  = tc.expireText?.trim()  || 'К сожалению, время, отведённое на прохождение, истекло. Результаты будут зафиксированы автоматически.'
        return (
          <div className="sb-modal-backdrop">
            <div className="sb-modal sb-modal--timer-expired">
              <div className="sb-modal__timer-icon">⏱</div>
              <h2 className="sb-modal__title">{title}</h2>
              <p className="sb-modal__desc">{text}</p>
              <div className="sb-modal__actions">
                <button
                  className="sb-modal__btn sb-modal__btn--primary"
                  onClick={async () => {
                    setTimerExpired(false)
                    await forceFinish()
                  }}
                >
                  Завершить
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
