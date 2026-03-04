'use client'

import { usePathname } from 'next/navigation'
import { useLanguage } from '../i18n/LanguageContext'
import type { TranslationKey } from '../i18n/translations'

const pageTitles: Record<string, TranslationKey> = {
  '/': 'nav.dashboard',
  '/projekte': 'nav.projects',
  '/angebote': 'nav.offers',
}

function Topbar() {
  const pathname = usePathname()
  const { t } = useLanguage()
  const titleKey = pageTitles[pathname] || 'nav.dashboard'

  return (
    <header className="bg-white border-b border-gray-100 px-8 py-4">
      <h2 className="text-xl font-semibold text-[#333]">{t(titleKey)}</h2>
    </header>
  )
}

export default Topbar
