'use client'

import { LanguageProvider } from '../i18n/LanguageContext'
import { AuthProvider } from '../auth/AuthContext'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        {children}
      </AuthProvider>
    </LanguageProvider>
  )
}
