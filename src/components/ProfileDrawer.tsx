'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '../i18n/LanguageContext'
import { useAuth } from '../auth/AuthContext'
import { supabase } from '../lib/supabase'
import Drawer from './Drawer'

interface Props {
  open: boolean
  onClose: () => void
}

function ProfileDrawer({ open, onClose }: Props) {
  const { t } = useLanguage()
  const { user, profile, refetchProfile } = useAuth()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [position, setPosition] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (open && profile) {
      setFirstName(profile.first_name || '')
      setLastName(profile.last_name || '')
      setPosition(profile.position || '')
      setNewPassword('')
      setConfirmPassword('')
      setError(null)
      setSuccess(false)
      setErrors({})
    }
  }, [open, profile])

  if (!open) return null

  const validate = () => {
    const e: Record<string, boolean> = {}
    if (!firstName.trim()) e.firstName = true
    if (!lastName.trim()) e.lastName = true
    if (newPassword) {
      if (newPassword.length < 6) e.passwordTooShort = true
      if (newPassword !== confirmPassword) e.passwordMismatch = true
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate() || !user) return
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          position: position.trim() || null,
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      if (newPassword) {
        const { error: pwError } = await supabase.auth.updateUser({ password: newPassword })
        if (pwError) throw pwError
      }

      await refetchProfile()
      setSuccess(true)
      setTimeout(() => onClose(), 800)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Drawer onClose={onClose}>
      <div className="p-6">
        <h2 className="text-lg font-semibold text-[#333] mb-6">
          {t('profile.edit')}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-600">
            {t('profile.saved')}
          </div>
        )}

        <div className="space-y-4">
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-[#333] mb-1.5">
              {t('team.firstName')} *
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand ${
                errors.firstName ? 'border-red-300' : 'border-gray-200'
              }`}
            />
            {errors.firstName && (
              <p className="text-xs text-red-500 mt-1">{t('team.firstNameRequired')}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-[#333] mb-1.5">
              {t('team.lastName')} *
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand ${
                errors.lastName ? 'border-red-300' : 'border-gray-200'
              }`}
            />
            {errors.lastName && (
              <p className="text-xs text-red-500 mt-1">{t('team.lastNameRequired')}</p>
            )}
          </div>

          {/* Position */}
          <div>
            <label className="block text-sm font-medium text-[#333] mb-1.5">
              {t('team.position')}
            </label>
            <input
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
              placeholder={t('team.positionPlaceholder')}
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-[#333] mb-1.5">
              {t('team.email')}
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500"
            />
          </div>

          {/* Password section */}
          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-sm font-medium text-[#333] mb-3">
              {t('profile.changePassword')}
            </h3>

            {/* New Password */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-[#333] mb-1.5">
                {t('profile.newPassword')}
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand ${
                  errors.passwordTooShort ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              {errors.passwordTooShort && (
                <p className="text-xs text-red-500 mt-1">{t('profile.passwordTooShort')}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-[#333] mb-1.5">
                {t('profile.confirmPassword')}
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand ${
                  errors.passwordMismatch ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              {errors.passwordMismatch && (
                <p className="text-xs text-red-500 mt-1">{t('profile.passwordMismatch')}</p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            {t('modal.cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 px-4 py-2.5 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand/90 transition-colors disabled:opacity-50"
          >
            {saving ? '...' : t('modal.save')}
          </button>
        </div>
      </div>
    </Drawer>
  )
}

export default ProfileDrawer
