import { useState } from 'react'
import { Lock } from 'lucide-react'
import { TEACHER_PASSWORD } from '@/lib/teacher'

export function PasswordPrompt({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const [v, setV] = useState('')
  const [err, setErr] = useState(false)

  const submit = () => {
    if (v === TEACHER_PASSWORD) onSuccess()
    else {
      setErr(true)
      setV('')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-5">
      <div className="w-full max-w-xs rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-center gap-2 text-slate-800">
          <Lock size={20} />
          <span className="font-display text-lg font-black">Teacher password</span>
        </div>
        <p className="mt-1 text-sm font-semibold text-slate-500">Enter the password to turn off the signature requirement.</p>
        <input
          type="password"
          inputMode="numeric"
          value={v}
          autoFocus
          onChange={(e) => {
            setV(e.target.value)
            setErr(false)
          }}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="•••••"
          className={`font-display mt-4 w-full rounded-2xl border-2 bg-slate-50 px-4 py-3 text-center text-2xl tracking-widest text-slate-800 outline-none ${
            err ? 'border-rose-300' : 'border-slate-200 focus:border-indigo-400'
          }`}
        />
        {err && <div className="mt-2 text-center text-sm font-bold text-rose-500">Wrong password</div>}
        <div className="mt-4 flex gap-3">
          <button onClick={onCancel} className="font-display flex-1 rounded-2xl bg-slate-100 py-3 font-extrabold text-slate-500 active:scale-95">
            Cancel
          </button>
          <button onClick={submit} className="font-display flex-[2] rounded-2xl bg-indigo-500 py-3 font-extrabold text-white active:scale-95">
            Unlock
          </button>
        </div>
      </div>
    </div>
  )
}
