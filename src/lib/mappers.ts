import type { Project, Offer } from '../data/mockData'
import type { Tables } from './database.types'

type ProjectRow = Tables<'projects'>
type OfferRow = Tables<'offers'>

export function mapProjectRow(row: ProjectRow): Project {
  return {
    id: row.id,
    projectNumber: row.project_number,
    title: row.title,
    discipline: row.discipline as Project['discipline'],
    projectManager: row.project_manager,
    status: row.status as Project['status'],
    deadline: row.deadline ?? '',
    progress: row.progress,
    projectVolume: Number(row.project_volume),
    invoicedAmount: Number(row.invoiced_amount),
    notes: row.notes ?? undefined,
    client: row.client ?? undefined,
    serviceScope: row.service_scope ?? undefined,
    commissionedServices: row.commissioned_services ?? undefined,
    teamMembers: row.team_members ?? undefined,
    plannedDurationDays: row.planned_duration_days ?? undefined,
    plannedEffortDays: row.planned_effort_days != null ? Number(row.planned_effort_days) : undefined,
    lastInvoiceDate: row.last_invoice_date ?? undefined,
  }
}

export function mapProjectToRow(project: Partial<Project>): Record<string, unknown> {
  const row: Record<string, unknown> = {}

  if (project.id !== undefined) row.id = project.id
  if (project.projectNumber !== undefined) row.project_number = project.projectNumber
  if (project.title !== undefined) row.title = project.title
  if (project.discipline !== undefined) row.discipline = project.discipline
  if (project.projectManager !== undefined) row.project_manager = project.projectManager
  if (project.status !== undefined) row.status = project.status
  if (project.deadline !== undefined) row.deadline = project.deadline || null
  if (project.progress !== undefined) row.progress = project.progress
  if (project.projectVolume !== undefined) row.project_volume = project.projectVolume
  if (project.invoicedAmount !== undefined) row.invoiced_amount = project.invoicedAmount
  if (project.notes !== undefined) row.notes = project.notes || null
  if (project.client !== undefined) row.client = project.client || null
  if (project.serviceScope !== undefined) row.service_scope = project.serviceScope || null
  if (project.commissionedServices !== undefined) row.commissioned_services = project.commissionedServices || null
  if (project.teamMembers !== undefined) row.team_members = project.teamMembers || null
  if (project.plannedDurationDays !== undefined) row.planned_duration_days = project.plannedDurationDays || null
  if (project.plannedEffortDays !== undefined) row.planned_effort_days = project.plannedEffortDays || null
  if (project.lastInvoiceDate !== undefined) row.last_invoice_date = project.lastInvoiceDate || null

  return row
}

export function mapOfferRow(row: OfferRow): Offer {
  return {
    id: row.id,
    client: row.client,
    title: row.title,
    owner: row.owner,
    phase: row.phase as Offer['phase'],
    dueDate: row.due_date,
    effortDays: row.effort_days,
    notes: row.notes ?? undefined,
  }
}

export function mapOfferToRow(offer: Partial<Offer>): Record<string, unknown> {
  const row: Record<string, unknown> = {}

  if (offer.id !== undefined) row.id = offer.id
  if (offer.client !== undefined) row.client = offer.client
  if (offer.title !== undefined) row.title = offer.title
  if (offer.owner !== undefined) row.owner = offer.owner
  if (offer.phase !== undefined) row.phase = offer.phase
  if (offer.dueDate !== undefined) row.due_date = offer.dueDate
  if (offer.effortDays !== undefined) row.effort_days = offer.effortDays
  if (offer.notes !== undefined) row.notes = offer.notes || null

  return row
}
