import type { Problem, SatProblem } from '@/types'

/**
 * Black-on-white print layout (the blank questions + the SAT bonus question).
 * Shown only when printing — see the #print-area rules in index.css.
 */
export function PrintableWorksheet({ title, problems, sat }: { title: string; problems: Problem[]; sat: SatProblem | null }) {
  return (
    <div className="print-sheet">
      <div className="print-title">MathQuest Worksheet</div>
      <div className="print-topic">{title}</div>
      <div className="print-meta">Name: ______________________________ Date: ________________ Score: ______ / {problems.length}</div>
      <div className="print-instr">Solve each problem. Show your work, then write or circle your answer.</div>
      <ol className="print-list">
        {problems.map((p, i) => (
          <li key={i} className="print-item">
            <div className="print-prompt">
              {p.prompt.split('\n').map((l, j) => (
                <div key={j}>{l}</div>
              ))}
            </div>
            {p.inputType === 'choice' ? (
              <div className="print-choices">
                {(p.choices ?? []).map((c, k) => (
                  <span key={k} className="print-choice">◯ {c}</span>
                ))}
              </div>
            ) : (
              <div className="print-answer">Answer: ____________________</div>
            )}
          </li>
        ))}
      </ol>
      {sat && (
        <div className="print-sat">
          <div className="print-sat-title">★ Bonus (SAT) Question</div>
          <div className="print-prompt">{sat.prompt}</div>
          <div className="print-choices">
            {sat.choices.map((c, k) => (
              <span key={k} className="print-choice">◯ {c}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
