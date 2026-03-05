import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export interface TeamUser {
  id: string
  first_name: string
  last_name: string
  position: string | null
  email: string
  created_at: string
}

export function useTeamUsers() {
  const [users, setUsers] = useState<TeamUser[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name, position, email, created_at')
        .order('first_name')

      if (error) throw error
      setUsers(data ?? [])
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const createUser = async (payload: {
    email: string
    password: string
    first_name: string
    last_name: string
  }) => {
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error)
    return json.user
  }

  const updateProfile = async (
    id: string,
    updates: { first_name?: string; last_name?: string; position?: string | null }
  ) => {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
    if (error) throw error
  }

  const deleteUser = async (id: string) => {
    const res = await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error)
  }

  return { users, loading, refetch: fetchUsers, createUser, updateProfile, deleteUser }
}
