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

  const { unit, phase, error, client, clearSession, publishUnit, loadUnit, setPhase } = useSandboxStore()
  const { handleInput, startTrainer, startExam, resumeExam } = useSandboxEngine()

  const [showClient,  setShowClient]  = useState(false)
  const [publishing,  setPublishing]  = useState(false)
  const [published,   setPublished]   = useState(false)
  const [origin,      setOrigin]      = useState('catalog')  // 'catalog' | 'builder'

  // Load unit
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

  // Auto-start trainer greeting once unit loaded
  useEffect(() => {
    if (unit && unit.type === 'trainer' && phase === 'idle') {
      startTrainer()
    }
  }, [unit, phase, startTrainer])

  // Navigation helpers
  function goToBuilder() {
    if (unit) {
      navigate(`/builder?id=${unit.id}`)
    } else {
      navigate('/')
    }
  }

  function handleBack() {
    clearSession()
    if (origin === 'builder') {
      goToBuilder()
    } else {
      navigate('/')
    }
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

  // ── Error state ────────────────────────────────
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

  const isExam    = unit.type !== 'trainer'
  const modeLbl   = isExam ? 'Тестовая среда · Экзамен' : 'Тестовая среда · Тренажёр'

  return (
    <div className={`sb-shell${isExam ? ' mode-exam' : ' mode-trainer'}`} style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

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
          {isExam && phase === 'running' && (
            <>
              <ElapsedTimer />
              <QuestionTimer />
              <button className="sb-client-btn" onClick={() => setShowClient(true)} id="btn-show-client">
                👤 Данные клиента
              </button>
            </>
          )}
          <span className="sb-header__badge" id="sb-mode-badge">{modeLbl}</span>
        </div>
      </header>

      {/* Body */}
      <div className="sb-body">
        <div className="sb-chat-wrap">
          {isExam && phase === 'running' && (
            <div className="sb-role-bar" id="sb-role-bar">
              <span className="sb-role-bar__client" id="sb-role-client-label">
                💬 {client.name}
              </span>
              <span className="sb-role-bar__sep">·</span>
              <span>Сотрудник</span>
            </div>
          )}
          <ChatWindow />
          <AnswerInput onSend={handleInput} />
        </div>
      </div>

      {/* Modals */}

      {/* Exam rules — shown before exam starts */}
      {phase === 'rules' && (
        <ExamRulesModal
          unitTitle={unit.title}
          onStart={startExam}
          onBack={handleBack}
        />
      )}

      {/* Resume after crash */}
      {phase === 'resume' && (
        <ResumeModal
          onContinue={resumeExam}
          onBack={handleBack}
        />
      )}

      {/* Trainer report — shown when done */}
      {phase === 'done' && !isExam && (
        <TrainerReportModal
          onBack={handleBack}
          onPublish={handlePublish}
        />
      )}

      {/* Exam completion */}
      {phase === 'done' && isExam && (
        <ExamCompletionModal
          onBack={handleBack}
          onPublish={handlePublish}
        />
      )}

      {/* Publishing spinner */}
      {publishing && (
        <div className="sb-modal-backdrop" id="loading-modal">
          <div className="sb-modal sb-modal--compact">
            <div className="sb-loader">
              <div className="sb-loader__ring" />
            </div>
            <p className="sb-modal__desc">Публикуем обучение...</p>
          </div>
        </div>
      )}

      {/* Published success */}
      {published && (
        <PublishSuccessModal
          onBackToBuilder={goToBuilder}
          onCatalog={() => navigate('/')}
        />
      )}

      {/* Client data modal */}
      {showClient && (
        <ClientCard onClose={() => setShowClient(false)} />
      )}
    </div>
  )
}
