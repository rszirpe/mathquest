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
- **Next goal — SAT Stars economy:** a new currency, separate from XP/coins — earned by solving
  problems, or purchased directly — spent to unlock SAT Star tests.
  - Not a rehash of the drill — you already learned the skill, this is "now use it in the real
    world": real-world-style application problems, not the same practice questions again.
  - Each question includes an "explain how you got this answer" field — but it is **not graded**.
    It's just there for parents/teachers to see the student's thinking, for fun/visibility only.
  - Wrong answer → no Gemini check here, just "try again" — **2 attempts** per problem (not 5).
  - Graded **per problem, immediately on submit** — not batched at the end like the 20-Q
    worksheet.
  - Any problem missed sends the student back to redo the sub-level where that concept was
    originally taught — fundamentals come first.
  - Redo levels (from missed SAT Star problems) are reachable from the Stats screen.
  - Finishing a SAT Star test pays out more SAT Stars by score, on top of any redo requirement:
    below 80% → 10, 80–90% → 25, 91–95% → 50, 96–100% → 75.
- SAT bonus questions must be *real* SAT questions — pull from the official SAT site and pick the
  easiest ones appropriate to the grade being taught, not invented puzzles.
- Keep problems from repeating often — already solved for the worksheet engine; don't regress it.
- **Grade intro videos:** when a child opens a grade they have *zero progress* on, a short
  per-grade orientation clip plays over the Home screen before they start — one video per
  grade (K-5).
  - Replays on every zero-progress visit (and on reload); it stops for good once they complete
    any worksheet for that grade (progress > 0).
  - Dismissible with a "Continue" button; gated to the Home screen so it never covers the grade
    picker, mode select, or a worksheet.
  - Files are bundled in the app under `public/videos/`, mapped grade -> filename. No save-state
    or persistence changes are needed (dismissal is transient), so no save-version bump.
  - A "Grade Videos" button on Home opens a K-5 picker to re-watch any grade's intro on demand
    (plays in the same overlay, independent of progress or the currently selected grade).

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
