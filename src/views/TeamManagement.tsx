'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Plus, Pencil, Trash2, Key } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext'
import { useAuth } from '../auth/AuthContext'
import { isTeamAdmin } from '../components/Sidebar'
import { useTeamUsers, type TeamUser } from '../hooks/useTeamUsers'
import Drawer from '../components/Drawer'

function TeamManagement() {
  const { t } = useLanguage()
  const { user, profile } = useAuth()
  const router = useRouter()

  if (!isTeamAdmin(user?.email, profile?.last_name)) {
    router.replace('/')
    return null
  }
  const { users, loading, refetch, createUser, updateProfile, deleteUser } = useTeamUsers()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<TeamUser | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [position, setPosition] = useState('')
  const [errors, setErrors] = useState<Record<string, boolean>>({})

  const openCreate = () => {
    setEditingUser(null)
    setFirstName('')
    setLastName('')
    setEmail('')
    setPassword('')
    setPosition('')
    setErrors({})
    setError(null)
    setDrawerOpen(true)
  }

  const openEdit = (user: TeamUser) => {
    setEditingUser(user)
    setFirstName(user.first_name)
    setLastName(user.last_name)
    setEmail(user.email)
    setPassword('')
    setPosition(user.position || '')
    setErrors({})
    setError(null)
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setEditingUser(null)
    setError(null)
  }

  const validate = () => {
    const e: Record<string, boolean> = {}
    if (!firstName.trim()) e.firstName = true
    if (!lastName.trim()) e.lastName = true
    if (!editingUser) {
      if (!email.trim()) e.email = true
      if (!password.trim()) e.password = true
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSaving(true)
    setError(null)
    try {
      if (editingUser) {
        await updateProfile(editingUser.id, {
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          position: position.trim() || null,
        })
      } else {
        const user = await createUser({
          email: email.trim(),
          password,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        })
        if (position.trim()) {
          await updateProfile(user.id, { position: position.trim() })
        }
      }
      await refetch()
      closeDrawer()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t('team.deleteConfirm'))) return
    setDeleting(id)
    try {
      await deleteUser(id)
      await refetch()
    } catch {
      // silently fail
    } finally {
      setDeleting(null)
    }
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand/10 rounded-lg">
            <Users size={20} className="text-brand" />
          </div>
          <h1 className="text-xl font-semibold text-[#333]">{t('team.title')}</h1>
          <span className="text-sm text-gray-400 ml-1">
            {users.length} {users.length === 1 ? 'Benutzer' : 'Benutzer'}
          </span>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors text-sm font-medium"
        >
          <Plus size={16} />
          {t('team.addUser')}
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Users size={40} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">{t('team.noUsers')}</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">
                  {t('team.name')}
                </th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">
                  {t('team.email')}
                </th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">
                  {t('team.position')}
                </th>
                <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-5 py-3">
                  {t('team.created')}
                </th>
                <th className="w-24 px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center text-sm font-medium text-brand">
                        {user.first_name[0]}{user.last_name[0]}
                      </div>
                      <span className="text-sm font-medium text-[#333]">
                        {user.first_name} {user.last_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">{user.email}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">{user.position || '—'}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-400">{formatDate(user.created_at)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => openEdit(user)}
                        className="p-1.5 text-gray-400 hover:text-brand rounded transition-colors"
                        title={t('modal.edit')}
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={deleting === user.id}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded transition-colors disabled:opacity-50"
                        title={t('offerModal.delete')}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Drawer */}
      {drawerOpen && (
        <Drawer onClose={closeDrawer}>
          <div className="p-6">
            <h2 className="text-lg font-semibold text-[#333] mb-6">
              {editingUser ? t('modal.edit') : t('team.addUser')}
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
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

              {/* Email (only for create) */}
              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-[#333] mb-1.5">
                    {t('team.email')} *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand ${
                      errors.email ? 'border-red-300' : 'border-gray-200'
                    }`}
                    placeholder="name@firma.de"
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-1">{t('team.emailRequired')}</p>
                  )}
                </div>
              )}

              {/* Password (only for create) */}
              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-[#333] mb-1.5">
                    {t('team.password')} *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand ${
                        errors.password ? 'border-red-300' : 'border-gray-200'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setPassword('Ingplan2026!')}
                      className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 hover:bg-gray-50 transition-colors whitespace-nowrap"
                      title="Generate password"
                    >
                      <Key size={14} />
                      Auto
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-500 mt-1">{t('team.passwordRequired')}</p>
                  )}
                </div>
              )}

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
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={closeDrawer}
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
      )}
    </div>
  )
}

export default TeamManagement
