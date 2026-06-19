import { useState } from 'react'

export function TeacherScoreEntry({
  total,
  onSubmit,
  onCancel,
}: {
  total: number
  onSubmit: (correct: number) => void
  onCancel: () => void
}) {
  const [v, setV] = useState('')
  const n = Number(v)
  const valid = v !== '' && Number.isInteger(n) && n >= 0 && n <= total

  return (
    <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
      <div className="font-display text-xl font-black text-slate-800">Teacher grading</div>
      <p className="mt-1 text-sm font-semibold text-slate-500">How many did the student get correct out of {total}?</p>
      <input
        value={v}
        onChange={(e) => setV(e.target.value.replace(/[^0-9]/g, '').slice(0, 2))}
        inputMode="numeric"
        placeholder="0"
        autoFocus
        className="font-display mt-4 w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-3 text-center text-4xl font-extrabold text-slate-800 outline-none focus:border-indigo-400"
      />
      <div className="mt-1 text-center text-xs font-semibold text-slate-400">out of {total}</div>
      <div className="mt-4 flex gap-3">
        <button onClick={onCancel} className="font-display flex-1 rounded-2xl bg-slate-100 py-3 font-extrabold text-slate-500 active:scale-95">
          Cancel
        </button>
        <button
          disabled={!valid}
          onClick={() => onSubmit(n)}
          className="font-display flex-[2] rounded-2xl bg-emerald-500 py-3 text-lg font-extrabold text-white shadow-lg active:scale-95 disabled:opacity-40"
        >
          Grade ✓
        </button>
      </div>
    </div>
  )
}
