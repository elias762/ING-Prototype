import { useState, useEffect, useRef } from 'react'
import { AlertTriangle } from 'lucide-react'
import { type Project, formatCurrency, calculateBillingProgress } from '../data/mockData'
import { updateProject } from '../services/projectService'
import Drawer from './Drawer'
import CustomSelect from './CustomSelect'
import MultiSelect from './MultiSelect'
import DatePicker from './DatePicker'
import RichTextEditor from './RichTextEditor'
import { useLanguage } from '../i18n/LanguageContext'
import { useProfiles } from '../hooks/useProfiles'

interface Props {
  project: Project
  onClose: () => void
  onUpdate: (updated: Project) => void
}
const disciplines: Project['discipline'][] = ['Straße', 'Wasser', 'RA', 'Vermessung']
const statuses: Project['status'][] = ['In Bearbeitung', 'Warten', 'Überfällig', 'Nicht begonnen', 'Abgeschlossen']

interface FormState {
  title: string
  projectManager: string
  discipline: Project['discipline']
  status: Project['status']
  deadline: string
  progress: string
  projectVolume: string
  invoicedAmount: string
  notes: string
  teamMembers: string[]
}

function projectToForm(p: Project): FormState {
  return {
    title: p.title,
    projectManager: p.projectManager,
    discipline: p.discipline,
    status: p.status,
    deadline: p.deadline,
    progress: String(p.progress),
    projectVolume: String(p.projectVolume),
    invoicedAmount: String(p.invoicedAmount),
    notes: p.notes || '',
    teamMembers: p.teamMembers ?? [],
  }
}

function ProjectDetailModal({ project, onClose, onUpdate }: Props) {
  const { t } = useLanguage()
  const { profiles } = useProfiles()
  const teamOptions = profiles.map(p => `${p.first_name} ${p.last_name}`.trim()).filter(Boolean)
  const [form, setForm] = useState<FormState>(() => projectToForm(project))

  // Only reset form when a different project is opened
  const prevProjectIdRef = useRef(project.id)
  useEffect(() => {
    if (project.id !== prevProjectIdRef.current) {
      setForm(projectToForm(project))
      prevProjectIdRef.current = project.id
    }
  }, [project.id])

  const billingProgress = calculateBillingProgress(project)
  const remainingBudget = project.projectVolume - project.invoicedAmount

  const doUpdate = async (updates: Partial<Project>) => {
    try {
      const updated = await updateProject(project.id, updates)
      onUpdate(updated)
    } catch {
      // silently fail for demo
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Bearbeitung': return 'bg-blue-50 text-blue-600 border-blue-200'
      case 'Überfällig': return 'bg-red-50 text-red-600 border-red-200'
      case 'Warten': return 'bg-yellow-50 text-yellow-600 border-yellow-200'
      case 'Nicht begonnen': return 'bg-gray-100 text-gray-600 border-gray-200'
      case 'Abgeschlossen': return 'bg-green-50 text-green-600 border-green-200'
      default: return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  const getDisciplineColor = (discipline: string) => {
    switch (discipline) {
      case 'Straße': return 'bg-orange-50 text-orange-600 border-orange-200'
      case 'Wasser': return 'bg-cyan-50 text-cyan-600 border-cyan-200'
      case 'RA': return 'bg-purple-50 text-purple-600 border-purple-200'
      case 'Vermessung': return 'bg-emerald-50 text-emerald-600 border-emerald-200'
      default: return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  const getBillingBarColor = () => {
    if (billingProgress > 100) return 'bg-red-500'
    if (billingProgress >= 80) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getProgressBarColor = () => {
    const val = parseInt(form.progress) || 0
    if (val >= 80) return 'bg-green-500'
    if (val >= 50) return 'bg-brand'
    return 'bg-yellow-500'
  }

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  /* ---- Auto-save helpers ---- */

  const handleBlurSave = (field: keyof FormState) => {
    const fieldMap: Record<string, () => { changed: boolean; updates: Partial<Project> }> = {
      title: () => ({
        changed: form.title !== project.title,
        updates: { title: form.title },
      }),
      deadline: () => ({
        changed: form.deadline !== project.deadline,
        updates: { deadline: form.deadline },
      }),
      progress: () => {
        const val = Math.min(100, Math.max(0, parseInt(form.progress) || 0))
        return { changed: val !== project.progress, updates: { progress: val } }
      },
      projectVolume: () => {
        const val = parseFloat(form.projectVolume) || 0
        return { changed: val !== project.projectVolume, updates: { projectVolume: val } }
      },
      invoicedAmount: () => {
        const val = parseFloat(form.invoicedAmount) || 0
        return { changed: val !== project.invoicedAmount, updates: { invoicedAmount: val } }
      },
      notes: () => ({
        changed: form.notes !== (project.notes || ''),
        updates: { notes: form.notes },
      }),
    }

    const check = fieldMap[field]
    if (check) {
      const { changed, updates } = check()
      if (changed) doUpdate(updates)
    }
  }

  const handleSelectChange = (field: 'projectManager' | 'discipline' | 'status', value: string) => {
    setField(field, value as any)
    const current = project[field]
    if (value !== current) {
      if (field === 'discipline') doUpdate({ discipline: value as Project['discipline'] })
      else if (field === 'status') doUpdate({ status: value as Project['status'] })
      else doUpdate({ [field]: value })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      ;(e.target as HTMLElement).blur()
    }
  }

  /* ---- Select options ---- */
  const pmOptions = teamOptions.map(n => ({ value: n, label: n }))
  const disciplineOptions = disciplines.map(d => ({ value: d, label: t(`discipline.${d}`) }))
  const statusOptions = statuses.map(s => ({ value: s, label: t(`status.${s}`) }))

  const progressVal = Math.min(100, Math.max(0, parseInt(form.progress) || 0))

  const inputClasses = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand/30 focus:border-brand/40 transition-colors'

  return (
    <Drawer onClose={onClose}>
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 pr-14 z-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="font-mono text-sm font-medium text-gray-500">{project.projectNumber}</span>
          <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getDisciplineColor(project.discipline)}`}>
            {t(`discipline.${project.discipline}`)}
          </span>
          <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusColor(project.status)}`}>
            {t(`status.${project.status}`)}
          </span>
        </div>
        <h2 className="text-xl font-bold text-gray-900">{project.title}</h2>
      </div>

      {/* Compact overview bars */}
      <div className="px-6 pt-5 pb-2 flex gap-5">
        {/* Progress */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-500">{t('modal.projectProgress')}</span>
            <span className="text-xs font-semibold text-gray-900">{project.progress}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${getProgressBarColor()}`}
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>
        {/* Billing */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-500">{t('modal.billingStatus')}</span>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-gray-900">{billingProgress.toFixed(1)}%</span>
              {billingProgress > 100 && (
                <AlertTriangle size={12} className="text-red-500" />
              )}
            </div>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${getBillingBarColor()}`}
              style={{ width: `${Math.min(billingProgress, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="p-6 pt-4 space-y-0">
        {/* Title */}
        <div className="flex items-center gap-3 py-3 border-b border-gray-100">
          <label className="text-sm text-gray-500 w-36 shrink-0">{t('modal.title')}</label>
          <input
            type="text"
            value={form.title}
            onChange={e => setField('title', e.target.value)}
            onBlur={() => handleBlurSave('title')}
            onKeyDown={handleKeyDown}
            className={inputClasses}
          />
        </div>

        {/* Project Manager */}
        <div className="flex items-center gap-3 py-3 border-b border-gray-100">
          <label className="text-sm text-gray-500 w-36 shrink-0">{t('modal.projectManager')}</label>
          <div className="flex-1">
            <CustomSelect
              variant="form"
              options={pmOptions}
              value={form.projectManager}
              onChange={v => handleSelectChange('projectManager', v)}
            />
          </div>
        </div>

        {/* Team Members */}
        <div className="flex items-start gap-3 py-3 border-b border-gray-100">
          <label className="text-sm text-gray-500 w-36 shrink-0 pt-2">{t('modal.teamMembers')}</label>
          <div className="flex-1">
            <MultiSelect
              options={teamOptions.map(name => ({ value: name, label: name }))}
              value={form.teamMembers}
              onChange={(members) => {
                setField('teamMembers', members)
                doUpdate({ teamMembers: members.length > 0 ? members : undefined })
              }}
            />
          </div>
        </div>

        {/* Discipline */}
        <div className="flex items-center gap-3 py-3 border-b border-gray-100">
          <label className="text-sm text-gray-500 w-36 shrink-0">{t('modal.discipline')}</label>
          <div className="flex-1">
            <CustomSelect
              variant="form"
              options={disciplineOptions}
              value={form.discipline}
              onChange={v => handleSelectChange('discipline', v)}
            />
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-3 py-3 border-b border-gray-100">
          <label className="text-sm text-gray-500 w-36 shrink-0">{t('modal.status')}</label>
          <div className="flex-1">
            <CustomSelect
              variant="form"
              options={statusOptions}
              value={form.status}
              onChange={v => handleSelectChange('status', v)}
            />
          </div>
        </div>

        {/* Deadline */}
        <div className="flex items-center gap-3 py-3 border-b border-gray-100">
          <label className="text-sm text-gray-500 w-36 shrink-0">{t('modal.deadline')}</label>
          <DatePicker
            value={form.deadline}
            onChange={v => setField('deadline', v)}
            onBlur={() => handleBlurSave('deadline')}
            className={inputClasses}
          />
        </div>

        {/* Progress */}
        <div className="flex items-start gap-3 py-3 border-b border-gray-100">
          <label className="text-sm text-gray-500 w-36 shrink-0 pt-2">{t('modal.progress')}</label>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={100}
                value={form.progress}
                onChange={e => setField('progress', e.target.value)}
                onBlur={() => handleBlurSave('progress')}
                onKeyDown={handleKeyDown}
                className={inputClasses}
              />
              <span className="text-sm text-gray-500 shrink-0">%</span>
            </div>
            <div className="mt-1.5 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${getProgressBarColor()}`}
                style={{ width: `${progressVal}%` }}
              />
            </div>
          </div>
        </div>

        {/* Project Volume */}
        <div className="flex items-center gap-3 py-3 border-b border-gray-100">
          <label className="text-sm text-gray-500 w-36 shrink-0">{t('modal.projectVolume')}</label>
          <div className="flex items-center gap-2 flex-1">
            <span className="text-sm text-gray-500 shrink-0">&euro;</span>
            <input
              type="number"
              min={0}
              value={form.projectVolume}
              onChange={e => setField('projectVolume', e.target.value)}
              onBlur={() => handleBlurSave('projectVolume')}
              onKeyDown={handleKeyDown}
              className={inputClasses}
            />
          </div>
        </div>

        {/* Invoiced Amount */}
        <div className="flex items-center gap-3 py-3 border-b border-gray-100">
          <label className="text-sm text-gray-500 w-36 shrink-0">{t('modal.invoicedAmount')}</label>
          <div className="flex items-center gap-2 flex-1">
            <span className="text-sm text-gray-500 shrink-0">&euro;</span>
            <input
              type="number"
              min={0}
              value={form.invoicedAmount}
              onChange={e => setField('invoicedAmount', e.target.value)}
              onBlur={() => handleBlurSave('invoicedAmount')}
              onKeyDown={handleKeyDown}
              className={inputClasses}
            />
          </div>
        </div>

        {/* Notes */}
        <div className="flex items-start gap-3 py-3 border-b border-gray-100">
          <label className="text-sm text-gray-500 w-36 shrink-0 pt-2">{t('modal.notes')}</label>
          <RichTextEditor
            value={form.notes}
            onChange={v => setField('notes', v)}
            onBlur={() => handleBlurSave('notes')}
          />
        </div>

        {/* Compact billing summary */}
        <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 px-1">
          <span>{t('modal.financials')}:</span>
          <span className="font-medium text-gray-700">{formatCurrency(project.projectVolume)}</span>
          <span className="text-gray-300">|</span>
          <span>{t('modal.invoiced')}: {formatCurrency(project.invoicedAmount)}</span>
          <span className="text-gray-300">|</span>
          <span>{t('modal.open')}: {formatCurrency(Math.max(0, remainingBudget))}</span>
          {billingProgress > 100 && (
            <span className="flex items-center gap-1 text-red-600 font-medium ml-1">
              <AlertTriangle size={12} />
              {t('modal.overBudget')}
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 text-white bg-[#333] rounded-lg hover:bg-[#222] transition-colors font-medium"
        >
          {t('modal.close')}
        </button>
      </div>
    </Drawer>
  )
}

export default ProjectDetailModal
