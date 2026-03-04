import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export interface Profile {
  id: string
  first_name: string
  last_name: string
}

export function useProfiles() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .order('first_name')

        if (error) throw error
        if (!cancelled) setProfiles(data ?? [])
      } catch {
        // silently fail for demo
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  return { profiles, loading }
}
