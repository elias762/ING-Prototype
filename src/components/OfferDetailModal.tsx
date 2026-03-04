import { useState, useEffect, useRef } from 'react'
import { Trash2 } from 'lucide-react'
import { type Offer, type Project } from '../data/mockData'
import { updateOffer } from '../services/offerService'
import { calculateScreening } from '../data/aiScreening'
import ScreeningDetailSection from './ScreeningDetailSection'
import Drawer from './Drawer'
import CustomSelect from './CustomSelect'
import DatePicker from './DatePicker'
import RichTextEditor from './RichTextEditor'
import { useLanguage } from '../i18n/LanguageContext'

interface Props {
  offer: Offer
  allProjects: Project[]
  allOffers: Offer[]
  onClose: () => void
  onDelete: (id: string) => void
  onUpdate: (updated: Offer) => void
}

const phases: Offer['phase'][] = ['Anfrage', 'Analyse', 'Vorbereitung', 'Abgabe']
const teamOptions = ['Max', 'Arne', 'David', 'Florian', 'Thomas', 'Stefan']

interface FormState {
  title: string
  client: string
  owner: string
  phase: Offer['phase']
  dueDate: string
  effortDays: string
  notes: string
}

function offerToForm(o: Offer): FormState {
  return {
    title: o.title,
    client: o.client,
    owner: o.owner,
    phase: o.phase,
    dueDate: o.dueDate,
    effortDays: String(o.effortDays),
    notes: o.notes || '',
  }
}

function OfferDetailModal({ offer, allProjects, allOffers, onClose, onDelete, onUpdate }: Props) {
  const { t } = useLanguage()
  const [form, setForm] = useState<FormState>(() => offerToForm(offer))

  const prevOfferIdRef = useRef(offer.id)
  useEffect(() => {
    if (offer.id !== prevOfferIdRef.current) {
      setForm(offerToForm(offer))
      prevOfferIdRef.current = offer.id
    }
  }, [offer.id])

  const screening = calculateScreening(offer, allProjects, allOffers)

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'Anfrage': return 'bg-gray-100 text-gray-600 border-gray-200'
      case 'Analyse': return 'bg-blue-50 text-blue-600 border-blue-200'
      case 'Vorbereitung': return 'bg-yellow-50 text-yellow-600 border-yellow-200'
      case 'Abgabe': return 'bg-green-50 text-green-600 border-green-200'
      default: return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  const doUpdate = async (updates: Partial<Offer>) => {
    try {
      const updated = await updateOffer(offer.id, updates)
      onUpdate(updated)
    } catch {
      // silently fail for demo
    }
  }

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  /* ---- Auto-save helpers ---- */

  const handleBlurSave = (field: keyof FormState) => {
    const fieldMap: Record<string, () => { changed: boolean; updates: Partial<Offer> }> = {
      title: () => ({
        changed: form.title !== offer.title,
        updates: { title: form.title },
      }),
      client: () => ({
        changed: form.client !== offer.client,
        updates: { client: form.client },
      }),
      dueDate: () => ({
        changed: form.dueDate !== offer.dueDate,
        updates: { dueDate: form.dueDate },
      }),
      effortDays: () => {
        const val = Math.max(0, parseInt(form.effortDays) || 0)
        return { changed: val !== offer.effortDays, updates: { effortDays: val } }
      },
      notes: () => ({
        changed: form.notes !== (offer.notes || ''),
        updates: { notes: form.notes },
      }),
    }

    const check = fieldMap[field]
    if (check) {
      const { changed, updates } = check()
      if (changed) doUpdate(updates)
    }
  }

  const handleSelectChange = (field: 'owner' | 'phase', value: string) => {
    setField(field, value as any)
    const current = offer[field]
    if (value !== current) {
      if (field === 'phase') doUpdate({ phase: value as Offer['phase'] })
      else doUpdate({ [field]: value })
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      ;(e.target as HTMLElement).blur()
    }
  }

  const handleDelete = () => {
    if (window.confirm(t('offerModal.confirmDelete'))) {
      onDelete(offer.id)
      onClose()
    }
  }

  /* ---- Select options ---- */
  const pmOptions = teamOptions.map(n => ({ value: n, label: n }))
  const phaseOptions = phases.map(p => ({ value: p, label: t(`phase.${p}`) }))

  const inputClasses = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand/30 focus:border-brand/40 transition-colors'

  return (
    <Drawer onClose={onClose}>
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 pr-14 z-10">
        <div>
          <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full border mb-2 ${getPhaseColor(offer.phase)}`}>
            {t(`phase.${offer.phase}`)}
          </span>
          <h2 className="text-xl font-semibold text-[#333]">{offer.title}</h2>
          <p className="text-gray-500 mt-1">{offer.client}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 pt-4 space-y-0">
        {/* AI Screening */}
        <div className="mb-4">
          <ScreeningDetailSection result={screening} />
        </div>

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

        {/* Client */}
        <div className="flex items-center gap-3 py-3 border-b border-gray-100">
          <label className="text-sm text-gray-500 w-36 shrink-0">{t('offerModal.client')}</label>
          <input
            type="text"
            value={form.client}
            onChange={e => setField('client', e.target.value)}
            onBlur={() => handleBlurSave('client')}
            onKeyDown={handleKeyDown}
            className={inputClasses}
          />
        </div>

        {/* Owner (PM) */}
        <div className="flex items-center gap-3 py-3 border-b border-gray-100">
          <label className="text-sm text-gray-500 w-36 shrink-0">{t('offerModal.projectManager')}</label>
          <div className="flex-1">
            <CustomSelect
              variant="form"
              options={pmOptions}
              value={form.owner}
              onChange={v => handleSelectChange('owner', v)}
            />
          </div>
        </div>

        {/* Phase */}
        <div className="flex items-center gap-3 py-3 border-b border-gray-100">
          <label className="text-sm text-gray-500 w-36 shrink-0">{t('offerModal.changePhase')}</label>
          <div className="flex-1">
            <CustomSelect
              variant="form"
              options={phaseOptions}
              value={form.phase}
              onChange={v => handleSelectChange('phase', v)}
            />
          </div>
        </div>

        {/* Due Date */}
        <div className="flex items-center gap-3 py-3 border-b border-gray-100">
          <label className="text-sm text-gray-500 w-36 shrink-0">{t('offerModal.dueDate')}</label>
          <DatePicker
            value={form.dueDate}
            onChange={v => setField('dueDate', v)}
            onBlur={() => handleBlurSave('dueDate')}
            className={inputClasses}
          />
        </div>

        {/* Effort (PT) */}
        <div className="flex items-center gap-3 py-3 border-b border-gray-100">
          <label className="text-sm text-gray-500 w-36 shrink-0">{t('offerModal.estimatedEffort')}</label>
          <div className="flex items-center gap-2 flex-1">
            <input
              type="number"
              min={0}
              value={form.effortDays}
              onChange={e => setField('effortDays', e.target.value)}
              onBlur={() => handleBlurSave('effortDays')}
              onKeyDown={handleKeyDown}
              className={inputClasses}
            />
            <span className="text-sm text-gray-500 shrink-0">PT</span>
          </div>
        </div>

        {/* Notes */}
        <div className="flex items-start gap-3 py-3 border-b border-gray-100">
          <label className="text-sm text-gray-500 w-36 shrink-0 pt-2">{t('offerModal.notes')}</label>
          <RichTextEditor
            value={form.notes}
            onChange={v => setField('notes', v)}
            onBlur={() => handleBlurSave('notes')}
            placeholder={t('offerModal.noNotes')}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-between">
        <button
          onClick={handleDelete}
          className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
        >
          <Trash2 size={18} />
          {t('offerModal.delete')}
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 text-white bg-[#333] rounded-lg hover:bg-[#222] transition-colors font-medium"
        >
          {t('offerModal.close')}
        </button>
      </div>
    </Drawer>
  )
}

export default OfferDetailModal
