import { useBuilderStore } from '../../stores/builderStore.js'
import { builderService } from '../../builderServices/builderService.js'
import UnitEditor from './nodes/UnitEditor.jsx'
import OnboardingEditor from './nodes/OnboardingEditor.jsx'
import CompletionEditor from './nodes/CompletionEditor.jsx'
import TheoryBlockEditor from './nodes/TheoryBlockEditor.jsx'
import TheoryEditor from './nodes/TheoryEditor.jsx'
import PracticeEditor from './nodes/PracticeEditor.jsx'
import SectionEditor from './nodes/SectionEditor.jsx'
import CaseEditor from './nodes/CaseEditor.jsx'
import QuestionEditor from './nodes/QuestionEditor.jsx'
import BuilderNav from './BuilderNav.jsx'

export default function NodeEditor() {
  const { unit, selectedId } = useBuilderStore()

  if (!unit) return null

  let body
  if (!selectedId || selectedId === unit.id) {
    body = <UnitEditor unit={unit} />
  } else {
    const node = builderService.findNode(unit, selectedId)
    if (!node) {
      return (
        <main id="bld-center" className="bld-center">
          <div className="bld-center__scroll">
            <p style={{ padding: 40, color: 'var(--muted)' }}>Узел не найден</p>
          </div>
        </main>
      )
    }

    let Editor = null
    switch (node.type) {
      case 'onboarding':   Editor = OnboardingEditor;   break
      case 'completion':   Editor = CompletionEditor;   break
      case 'theory_block': Editor = TheoryBlockEditor;  break
      case 'theory':       Editor = TheoryEditor;       break
      case 'practice':     Editor = PracticeEditor;     break
      case 'section':      Editor = SectionEditor;      break
      case 'case':         Editor = CaseEditor;         break
      case 'question':     Editor = QuestionEditor;     break
      default:
        body = (
          <div className="cv">
            <h2 className="cv-heading">{node.title}</h2>
            <p style={{ color: 'var(--muted-lt)' }}>Редактор для типа «{node.type}» не реализован</p>
          </div>
        )
    }
    if (Editor) body = <Editor node={node} />
  }

  return (
    <main id="bld-center" className="bld-center">
      <div className="bld-center__scroll">{body}</div>
      <BuilderNav />
    </main>
  )
}
