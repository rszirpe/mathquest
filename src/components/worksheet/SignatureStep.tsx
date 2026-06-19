import { useState } from 'react'
import { PenLine } from 'lucide-react'

export function SignatureStep({ onSign }: { onSign: (name: string) => void }) {
  const [v, setV] = useState('')
  return (
    <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
      <div className="flex items-center gap-2 text-indigo-500">
        <PenLine size={20} />
        <span className="font-display text-xl font-black">Teacher signature</span>
      </div>
      <p className="mt-1 text-sm font-semibold text-slate-500">Type your name or initials to sign off on this sheet.</p>
      <input
        value={v}
        onChange={(e) => setV(e.target.value.slice(0, 40))}
        placeholder="e.g. Ms. Lee"
        autoFocus
        style={{ fontFamily: 'cursive' }}
        className="mt-4 w-full rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-center text-2xl text-slate-800 outline-none focus:border-indigo-400"
      />
      <button
        disabled={v.trim() === ''}
        onClick={() => onSign(v.trim())}
        className="font-display mt-4 w-full rounded-2xl bg-indigo-500 py-3 text-lg font-extrabold text-white shadow-lg active:scale-95 disabled:opacity-40"
      >
        Sign &amp; finish
      </button>
    </div>
  )
}
