import { createContext, useContext, useState, type ReactNode } from 'react'
import { type Language, t as translate, type TranslationKey } from './translations'

interface LanguageContextType {
  lang: Language
  setLang: (lang: Language) => void
  t: (key: TranslationKey) => string
  dateLocale: string
}

const LanguageContext = createContext<LanguageContextType | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'de'
    const stored = localStorage.getItem('ing-plan-lang')
    return (stored === 'en' || stored === 'de') ? stored : 'de'
  })

  const handleSetLang = (newLang: Language) => {
    setLang(newLang)
    localStorage.setItem('ing-plan-lang', newLang)
  }

  const t = (key: TranslationKey) => translate(key, lang)
  const dateLocale = lang === 'de' ? 'de-DE' : 'en-US'

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang, t, dateLocale }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
