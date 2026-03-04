import { supabase } from '../lib/supabase'
import { mapProjectRow, mapProjectToRow } from '../lib/mappers'
import type { Project } from '../data/mockData'

export async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('deadline', { ascending: true })

  if (error) throw error
  return (data ?? []).map(mapProjectRow)
}

export async function fetchProjectById(id: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }
  return data ? mapProjectRow(data) : null
}

export async function createProject(project: Project): Promise<Project> {
  const row = mapProjectToRow(project)
  const { data, error } = await supabase
    .from('projects')
    .insert(row)
    .select()
    .single()

  if (error) throw error
  return mapProjectRow(data)
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project> {
  const row = mapProjectToRow(updates)
  const { data, error } = await supabase
    .from('projects')
    .update(row)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return mapProjectRow(data)
}
