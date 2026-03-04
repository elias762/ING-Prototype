import { useState } from 'react'
import { type Project } from '../data/mockData'
import Drawer from './Drawer'
import CustomSelect from './CustomSelect'
import MultiSelect from './MultiSelect'
import DatePicker from './DatePicker'
import RichTextEditor from './RichTextEditor'
import { useLanguage } from '../i18n/LanguageContext'
import { useProfiles } from '../hooks/useProfiles'

interface Props {
  onClose: () => void
  onSave: (project: Project) => void
}
const disciplineOptions: Project['discipline'][] = ['Straße', 'Wasser', 'RA', 'Vermessung']

function NewProjectModal({ onClose, onSave }: Props) {
  const { t } = useLanguage()
  const { profiles } = useProfiles()
  const teamOptions = profiles.map(p => `${p.first_name} ${p.last_name}`.trim()).filter(Boolean)

  const [formData, setFormData] = useState({
    projectNumber: '',
    title: '',
    client: '',
    discipline: '' as string,
    projectManager: '',
    deadline: '',
    projectVolume: '',
    serviceScope: '',
    commissionedServicesInput: '',
    teamMembers: [] as string[],
    plannedDurationDays: '',
    plannedEffortDays: '',
    notes: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.projectNumber.trim()) newErrors.projectNumber = t('newProject.projectNumberRequired')
    if (!formData.title.trim()) newErrors.title = t('newProject.titleRequired')
    if (!formData.client.trim()) newErrors.client = t('newProject.clientRequired')
    if (!formData.discipline) newErrors.discipline = t('newProject.disciplineRequired')
    if (!formData.projectManager) newErrors.projectManager = t('newProject.pmRequired')
    if (!formData.deadline) newErrors.deadline = t('newProject.deadlineRequired')
    if (!formData.projectVolume || parseFloat(formData.projectVolume) < 0) {
      newErrors.projectVolume = t('newProject.volumeRequired')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const commissionedServices = formData.commissionedServicesInput.trim()
      ? formData.commissionedServicesInput.split(',').map(s => s.trim()).filter(Boolean)
      : undefined

    const project: Project = {
      id: `p${Date.now()}`,
      projectNumber: formData.projectNumber.trim(),
      title: formData.title.trim(),
      discipline: formData.discipline as Project['discipline'],
      projectManager: formData.projectManager,
      status: 'Nicht begonnen',
      deadline: formData.deadline,
      progress: 0,
      projectVolume: parseFloat(formData.projectVolume),
      invoicedAmount: 0,
      notes: formData.notes.trim() || undefined,
      client: formData.client.trim() || undefined,
      serviceScope: formData.serviceScope.trim() || undefined,
      commissionedServices,
      teamMembers: formData.teamMembers.length > 0 ? formData.teamMembers : undefined,
      plannedDurationDays: formData.plannedDurationDays ? parseInt(formData.plannedDurationDays) : undefined,
      plannedEffortDays: formData.plannedEffortDays ? parseFloat(formData.plannedEffortDays) : undefined,
    }

    onSave(project)
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
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 pr-14 z-10">
          <h2 className="text-xl font-semibold text-[#333]">{t('newProject.title')}</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Required fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                {t('newProject.projectNumber')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.projectNumber}
                onChange={(e) => handleChange('projectNumber', e.target.value)}
                placeholder={t('newProject.projectNumberPlaceholder')}
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brand/30 focus:border-brand/40 ${
                  errors.projectNumber ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              {errors.projectNumber && <p className="text-red-500 text-xs mt-1">{errors.projectNumber}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                {t('newProject.client')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.client}
                onChange={(e) => handleChange('client', e.target.value)}
                placeholder={t('newProject.clientPlaceholder')}
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brand/30 focus:border-brand/40 ${
                  errors.client ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              {errors.client && <p className="text-red-500 text-xs mt-1">{errors.client}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              {t('newProject.projectTitle')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder={t('newProject.projectTitlePlaceholder')}
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brand/30 focus:border-brand/40 ${
                errors.title ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                {t('newProject.discipline')} <span className="text-red-500">*</span>
              </label>
              <CustomSelect
                value={formData.discipline}
                onChange={(v) => handleChange('discipline', v)}
                placeholder={t('newOffer.select')}
                error={!!errors.discipline}
                options={disciplineOptions.map(d => ({ value: d, label: t(`discipline.${d}`) }))}
              />
              {errors.discipline && <p className="text-red-500 text-xs mt-1">{errors.discipline}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                {t('newProject.projectManager')} <span className="text-red-500">*</span>
              </label>
              <CustomSelect
                value={formData.projectManager}
                onChange={(v) => handleChange('projectManager', v)}
                placeholder={t('newOffer.select')}
                error={!!errors.projectManager}
                options={teamOptions.map(name => ({ value: name, label: name }))}
              />
              {errors.projectManager && <p className="text-red-500 text-xs mt-1">{errors.projectManager}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                {t('projectDetail.deadline')} <span className="text-red-500">*</span>
              </label>
              <DatePicker
                value={formData.deadline}
                onChange={(v) => handleChange('deadline', v)}
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brand/30 focus:border-brand/40 ${
                  errors.deadline ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
                error={!!errors.deadline}
              />
              {errors.deadline && <p className="text-red-500 text-xs mt-1">{errors.deadline}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                {t('newProject.projectVolume')} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="1000"
                value={formData.projectVolume}
                onChange={(e) => handleChange('projectVolume', e.target.value)}
                placeholder={t('newProject.projectVolumePlaceholder')}
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brand/30 focus:border-brand/40 ${
                  errors.projectVolume ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              {errors.projectVolume && <p className="text-red-500 text-xs mt-1">{errors.projectVolume}</p>}
            </div>
          </div>

          {/* Optional fields */}
          <div className="border-t border-gray-100 pt-4 mt-4">
            <p className="text-sm font-medium text-gray-500 mb-3">{t('newProject.optionalFields')}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              {t('newProject.serviceScope')} <span className="text-gray-400">({t('newOffer.optional')})</span>
            </label>
            <input
              type="text"
              value={formData.serviceScope}
              onChange={(e) => handleChange('serviceScope', e.target.value)}
              placeholder={t('newProject.serviceScopePlaceholder')}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brand/30 focus:border-brand/40"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              {t('newProject.commissionedServices')} <span className="text-gray-400">({t('newOffer.optional')})</span>
            </label>
            <input
              type="text"
              value={formData.commissionedServicesInput}
              onChange={(e) => handleChange('commissionedServicesInput', e.target.value)}
              placeholder={t('newProject.commissionedServicesPlaceholder')}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brand/30 focus:border-brand/40"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              {t('newProject.teamMembers')} <span className="text-gray-400">({t('newOffer.optional')})</span>
            </label>
            <MultiSelect
              options={teamOptions.map(name => ({ value: name, label: name }))}
              value={formData.teamMembers}
              onChange={(members) => setFormData(prev => ({ ...prev, teamMembers: members }))}
              placeholder={t('newOffer.select')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                {t('newProject.plannedDuration')} <span className="text-gray-400">({t('newOffer.optional')})</span>
              </label>
              <input
                type="number"
                min="1"
                value={formData.plannedDurationDays}
                onChange={(e) => handleChange('plannedDurationDays', e.target.value)}
                placeholder={t('newProject.plannedDurationPlaceholder')}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brand/30 focus:border-brand/40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                {t('newProject.plannedEffort')} <span className="text-gray-400">({t('newOffer.optional')})</span>
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={formData.plannedEffortDays}
                onChange={(e) => handleChange('plannedEffortDays', e.target.value)}
                placeholder={t('newProject.plannedEffortPlaceholder')}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brand/30 focus:border-brand/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              {t('newOffer.notes')} <span className="text-gray-400">({t('newOffer.optional')})</span>
            </label>
            <RichTextEditor
              value={formData.notes}
              onChange={(v) => handleChange('notes', v)}
              placeholder={t('newProject.notesPlaceholder')}
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
              {t('newProject.createProject')}
            </button>
          </div>
        </form>
    </Drawer>
  )
}

export default NewProjectModal
