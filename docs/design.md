# MathQuest — Design

## Links

- https://github.com/rszirpe/mathquest

## TL;DR mental model

Grade → Topic World → 7 Sub-levels (difficulty rises each step). Each sub-level: **teach
together** (guided, no XP) → **test alone** (20-Q worksheet, one Grade button) → **tiered XP**
(0% below 80%, scaling up, bonus at 100%) → optional SAT bonus at ≥90%. Wrapped in a game-y meta
layer (avatar/shop, non-repeating bonus challenges, Summer Break auto-curriculum) and a classroom
layer (print, manual grade, password-gated signature requirement, full history). 100% client-side
— Zustand state persisted to `localStorage`, no backend.

## Project north star

- K–5 video-game-style math app. Core fantasy: solve → XP → level up → customize avatar.
- Four modes: Adventure (level path), Quick Play (topic drill), Time Attack (timed),
  Summer Break (auto full-year curriculum).
- Teach before testing — never just "wrong"; visual step-by-step help always available.
- Difficulty ramp is structural, not tuned numbers alone — locked, ordered sub-levels,
  never "a whole subject in one minute."
- Real homework: 20-Q worksheets, solved on paper, graded all at once — not per-tap judgment.
- Mastery has a bar (80%) but never blocks progress — retry anytime; SAT bonus rewards top scores.
- A separate bonus-challenges section for extra XP, kept varied and non-repetitive.
- Genuinely classroom-usable: printable, hand-gradable, signable (password-gated toggle),
  fully logged history.
- Persistent local save, no login. Fluid across devices — phone to desktop, no fixed breakpoints.
- **Next direction — mastery over answers:** understanding the *method* matters more than getting
  the final number right.
  - Student attempts each problem cold first (no hints up front) — that attempt **is** the
    assessment.
  - The method is checked **locally first** (cheap); only escalate to Gemini when the local check
    is unsure — keeps Gemini's usage-based billing low.
  - Correct method, wrong final answer → don't just fail them: reveal the right answer and the
    exact step they missed, then give a couple of comprehension problems on that concept.
  - Wrong method → a Gemini-written hint, then retry — up to **5 attempts** total.
  - Still stuck after 5 attempts → reveal the full step-by-step answer (today's "Show me how").
  - Passes the assessment → straight into plain practice problems, no interruptions.
- **Premium tier (future):** a Gemini-driven placement test (a few questions auto-place the
  student's level), and a "help with my classwork" mode (show outside classwork, get hints,
  answer, then comprehension problems).
- SAT bonus questions must be *real* SAT questions — pull from the official SAT site and pick the
  easiest ones appropriate to the grade being taught, not invented puzzles.
- Keep problems from repeating often — already solved for the worksheet engine; don't regress it.

## User flow

```
Grade select -> Mode select -> {Adventure | Quick Play | Time Attack | Summer Break}
                                            |
                                            v
                          Guided practice (10 Q, together, unlimited help, 0 XP)
                                            |          (skipped: Review / Quick Play / Time Attack)
                                            v
                          Worksheet (20 Q, 1 hint total, solved alone)
                                            |
                                            v
                          Grade (one button)
                            < 80%   -> 0 XP, logged to "Needs practice" (retryable)
                            80-99%  -> XP scales with score
                            100%    -> XP + full-marks bonus
                                            |
                                            v
                          Score >= 90%? --> SAT bonus (3 tries, limited extends,
                                             consolation XP if unsolved)
                                            |
                                            v
                          Teacher mode on? --> manual score entry + signature
                                             (disabling signature needs fixed password)
                                            |
                                            v
                          Done -> XP/coins applied -> avatar shop, challenges, stats/history
```

## Technical design

- **Vite + React + TypeScript**, static site, no server.
- **Zustand + `persist`** — two stores, one screen-state machine (no router).
- **Tailwind v4** (fluid `auto-fit` grids), **framer-motion** + **canvas-confetti** (feel).
- Deployed to GitHub Pages via GitHub Actions (`base: './'` for sub-path hosting).

```
+-------------------+          +----------------------+         +----------------+
| React Screens     |          | Zustand Stores       |         |                |
| screens/*.tsx     |          | usePlayerStore: data |         | localStorage   |
| (Home, Adventure, |   <-->   | xp/coins/avatar/     |   -->   | autosave       |
| Worksheet, Shop,  |          | progress/history     |         | key:           |
| Challenges, ...)  |          | useUiStore: nav/     |         | mathquest-save |
|                   |          | session (transient)  |         |                |
+-------------------+          +----------------------+         +----------------+
```

```
                +-------------------------+
                |    Curriculum Engine    |
                |  curriculum.ts (worlds) |
                | problems/* (generators) |
                |   explain.ts (visuals)  |
                +-------------------------+
                             |
        +--------------------+---------------------+
        v                    v                     v
+--------------+     +---------------+     +---------------+
|  Game modes  |     |  Meta systems |     | Teacher tools |
|  Adventure   |     |  Avatar/Shop  |     |     Print     |
|  Quick Play  |     |   Challenges  |     |  Manual grade |
| Time Attack  |     | Stats/History |     |   Signature   |
| Summer Break |     |               |     |   (password)  |
+--------------+     +---------------+     +---------------+
```

## Handoff

- Everything above (through Challenges) is built, wired, typechecked clean, and live at
  https://rszirpe.github.io/mathquest/. No uncommitted app-code changes.
- Nothing in flight — Challenges (bonus XP) was the last completed unit of work.
- Not started: the "Next direction" / "Premium tier" bullets in Project north star (local-model +
  Gemini mastery-checking loop) — pure vision, zero code exists for it yet.
- Repo: `rszirpe/mathquest`, local checkout at `/Users/rishi/mathquest`.
