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

export default function NodeEditor() {
  const { unit, selectedId } = useBuilderStore()

  if (!unit) return null

  // Unit root selected
  if (!selectedId || selectedId === unit.id) {
    return (
      <main id="bld-center" className="bld-center">
        <UnitEditor unit={unit} />
      </main>
    )
  }

  const node = builderService.findNode(unit, selectedId)
  if (!node) return (
    <main id="bld-center" className="bld-center">
      <p style={{ padding: 40, color: 'var(--muted)' }}>Узел не найден</p>
    </main>
  )

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
      return (
        <main id="bld-center" className="bld-center">
          <div className="cv">
            <h2 className="cv-heading">{node.title}</h2>
            <p style={{ color: 'var(--muted-lt)' }}>Редактор для типа «{node.type}» не реализован</p>
          </div>
        </main>
      )
  }

  return (
    <main id="bld-center" className="bld-center">
      <Editor node={node} />
    </main>
  )
}
