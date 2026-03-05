import { useState } from 'react'
import { type Offer } from '../data/mockData'
import Drawer from './Drawer'
import CustomSelect from './CustomSelect'
import DatePicker from './DatePicker'
import RichTextEditor from './RichTextEditor'
import { useLanguage } from '../i18n/LanguageContext'
import { useProfiles } from '../hooks/useProfiles'

interface Props {
  onClose: () => void
  onSave: (offer: Omit<Offer, 'id' | 'phase'>) => void
}

function NewOfferModal({ onClose, onSave }: Props) {
  const { t } = useLanguage()
  const { profiles } = useProfiles()
  const ownerOptions = profiles
    .map(p => `${p.first_name} ${p.last_name}`.trim())
    .filter(Boolean)
    .map(name => ({ value: name, label: name }))

  const [formData, setFormData] = useState({
    client: '',
    title: '',
    owner: '',
    dueDate: '',
    effortDays: '',
    notes: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.client.trim()) newErrors.client = t('newOffer.clientRequired')
    if (!formData.title.trim()) newErrors.title = t('newOffer.titleRequired')
    if (!formData.owner.trim()) newErrors.owner = t('newOffer.pmRequired')
    if (!formData.dueDate) newErrors.dueDate = t('newOffer.dueDateRequired')
    if (!formData.effortDays || parseInt(formData.effortDays) <= 0) {
      newErrors.effortDays = t('newOffer.effortRequired')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    onSave({
      client: formData.client.trim(),
      title: formData.title.trim(),
      owner: formData.owner.trim(),
      dueDate: formData.dueDate,
      effortDays: parseInt(formData.effortDays),
      notes: formData.notes.trim() || undefined
    })

    onClose()
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Drawer onClose={onClose}>
        {/* Header */}
        <div className="border-b border-gray-100 px-6 py-4 pr-14">
          <h2 className="text-xl font-semibold text-[#333]">{t('newOffer.title')}</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              {t('newOffer.client')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.client}
              onChange={(e) => handleChange('client', e.target.value)}
              placeholder={t('newOffer.clientPlaceholder')}
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brand/30 focus:border-brand/40 ${
                errors.client ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            />
            {errors.client && <p className="text-red-500 text-xs mt-1">{errors.client}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              {t('newOffer.offerTitle')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder={t('newOffer.offerTitlePlaceholder')}
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brand/30 focus:border-brand/40 ${
                errors.title ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              {t('newOffer.projectManager')} <span className="text-red-500">*</span>
            </label>
            <CustomSelect
              value={formData.owner}
              onChange={(v) => handleChange('owner', v)}
              placeholder={t('newOffer.select')}
              error={!!errors.owner}
              options={ownerOptions}
            />
            {errors.owner && <p className="text-red-500 text-xs mt-1">{errors.owner}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                {t('newOffer.dueDate')} <span className="text-red-500">*</span>
              </label>
              <DatePicker
                value={formData.dueDate}
                onChange={(v) => handleChange('dueDate', v)}
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brand/30 focus:border-brand/40 ${
                  errors.dueDate ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
                error={!!errors.dueDate}
              />
              {errors.dueDate && <p className="text-red-500 text-xs mt-1">{errors.dueDate}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                {t('newOffer.effortPT')} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={formData.effortDays}
                onChange={(e) => handleChange('effortDays', e.target.value)}
                placeholder={t('newOffer.effortPlaceholder')}
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brand/30 focus:border-brand/40 ${
                  errors.effortDays ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              {errors.effortDays && <p className="text-red-500 text-xs mt-1">{errors.effortDays}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              {t('newOffer.notes')} <span className="text-gray-400">({t('newOffer.optional')})</span>
            </label>
            <RichTextEditor
              value={formData.notes}
              onChange={(v) => handleChange('notes', v)}
              placeholder={t('newOffer.notesPlaceholder')}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              {t('newOffer.cancel')}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors font-medium"
            >
              {t('newOffer.createRequest')}
            </button>
          </div>
        </form>
    </Drawer>
  )
}

export default NewOfferModal
