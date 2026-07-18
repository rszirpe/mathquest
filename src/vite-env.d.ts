/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Gemini API key for the mastery loop's live AI escalation. Unset -> falls back to the stub client. */
  readonly VITE_GEMINI_API_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
