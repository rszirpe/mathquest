import { useState } from 'react'
import type { ReactNode } from 'react'
import { usePlayerStore } from '@/store/usePlayerStore'
import { useUiStore } from '@/store/useUiStore'
import { ScreenHeader } from '@/components/ScreenHeader'
import { PasswordPrompt } from '@/components/PasswordPrompt'

function Toggle({ on, disabled, onClick }: { on: boolean; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={disabled ? undefined : onClick}
      className={`relative h-8 w-14 shrink-0 rounded-full transition ${on ? 'bg-emerald-500' : 'bg-slate-300'} ${
        disabled ? 'opacity-60' : 'active:scale-95'
      }`}
    >
      <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition-all ${on ? 'left-7' : 'left-1'}`} />
    </button>
  )
}

function SettingRow({ title, desc, children }: { title: string; desc: string; children: ReactNode }) {
  return (
    <div className="rounded-3xl bg-white p-4 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="font-display text-lg font-black text-slate-800">{title}</div>
          <div className="text-sm font-semibold text-slate-500">{desc}</div>
        </div>
        {children}
      </div>
    </div>
  )
}

export function SettingsScreen() {
  const back = useUiStore((s) => s.back)
  const settings = usePlayerStore((s) => s.settings)
  const updateSettings = usePlayerStore((s) => s.updateSettings)
  const grade = usePlayerStore((s) => s.grade)
  const resetProgress = usePlayerStore((s) => s.resetProgress)
  const [confirming, setConfirming] = useState(false)
  const [pwPrompt, setPwPrompt] = useState(false)

  const satForced = grade === '3' || grade === '4' || grade === '5'

  const toggleSignature = () => {
    if (settings.requireSignature) {
      // Turning OFF requires the teacher password.
      setPwPrompt(true)
    } else {
      updateSettings({ requireSignature: true })
    }
  }

  return (
    <div className="flex min-h-full flex-col bg-gradient-to-b from-slate-600 to-slate-800 p-5">
      <ScreenHeader title="Settings" onBack={back} />

      <div className="mx-auto flex w-full max-w-xl flex-col gap-3">
        <SettingRow
          title="SAT Bonus Challenge"
          desc={satForced ? 'Always on for Grade 3 and up.' : 'Show a bonus SAT question after great scores (for younger kids).'}
        >
          <Toggle
            on={satForced || settings.satForYoungKids}
            disabled={satForced}
            onClick={() => updateSettings({ satForYoungKids: !settings.satForYoungKids })}
          />
        </SettingRow>

        <SettingRow title="Teacher grades by hand" desc="Skip the auto-grader — the teacher types in the final score.">
          <Toggle on={settings.teacherGrading} onClick={() => updateSettings({ teacherGrading: !settings.teacherGrading })} />
        </SettingRow>

        <SettingRow title="Require teacher signature" desc="A graded sheet must be signed before it's finished. Turning this off needs the password.">
          <Toggle on={settings.requireSignature} onClick={toggleSignature} />
        </SettingRow>

        <SettingRow title="Sound effects" desc="Little blips for correct answers and level-ups.">
          <Toggle on={settings.sound} onClick={() => updateSettings({ sound: !settings.sound })} />
        </SettingRow>

        <div className="mt-3">
          {confirming ? (
            <div className="rounded-2xl bg-white/10 p-4 text-center backdrop-blur">
              <div className="mb-3 font-bold text-white">Are you sure you want to reset your whole progress? All history will be gone.</div>
              <div className="flex gap-3">
                <button onClick={() => setConfirming(false)} className="flex-1 rounded-xl bg-white/20 py-3 font-extrabold text-white active:scale-95">
                  Cancel
                </button>
                <button
                  onClick={() => {
                    resetProgress()
                    setConfirming(false)
                  }}
                  className="flex-1 rounded-xl bg-rose-500 py-3 font-extrabold text-white active:scale-95"
                >
                  Yes, reset
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirming(true)}
              className="w-full rounded-2xl bg-white/10 py-3 font-bold text-white/80 backdrop-blur active:scale-95"
            >
              Reset progress
            </button>
          )}
        </div>
      </div>

      {pwPrompt && (
        <PasswordPrompt
          onCancel={() => setPwPrompt(false)}
          onSuccess={() => {
            updateSettings({ requireSignature: false })
            setPwPrompt(false)
          }}
        />
      )}
    </div>
  )
}
