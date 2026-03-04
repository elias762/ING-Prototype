import { useState, useEffect, useCallback } from 'react'
import type { Project } from '../data/mockData'
import { fetchProjects, fetchProjectById, updateProject as updateProjectService } from '../services/projectService'

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await fetchProjects()
      setProjects(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const update = useCallback(async (id: string, updates: Partial<Project>) => {
    const updated = await updateProjectService(id, updates)
    setProjects(prev => prev.map(p => p.id === id ? updated : p))
    return updated
  }, [])

  const patch = useCallback((id: string, updated: Project) => {
    setProjects(prev => prev.map(p => p.id === id ? updated : p))
  }, [])

  return { projects, loading, error, refetch: load, update, patch }
}

export function useProject(id: string | undefined) {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setProject(null)
      setLoading(false)
      return
    }

    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchProjectById(id!)
        if (!cancelled) setProject(data)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load project')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [id])

  const update = useCallback(async (updates: Partial<Project>) => {
    if (!id) return
    try {
      const updated = await updateProjectService(id, updates)
      setProject(updated)
      return updated
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project')
    }
  }, [id])

  return { project, loading, error, update }
}
