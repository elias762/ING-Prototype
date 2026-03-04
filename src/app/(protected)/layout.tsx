'use client'

import ProtectedRoute from '../../auth/ProtectedRoute'
import MainLayout from '../../layouts/MainLayout'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <MainLayout>{children}</MainLayout>
    </ProtectedRoute>
  )
}
