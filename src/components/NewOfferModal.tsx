import { useState } from 'react'
import { X } from 'lucide-react'
import { type Offer } from '../data/mockData'

interface Props {
  onClose: () => void
  onSave: (offer: Omit<Offer, 'id' | 'phase'>) => void
}

function NewOfferModal({ onClose, onSave }: Props) {
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

    if (!formData.client.trim()) newErrors.client = 'Auftraggeber ist erforderlich'
    if (!formData.title.trim()) newErrors.title = 'Bezeichnung ist erforderlich'
    if (!formData.owner.trim()) newErrors.owner = 'Projektleiter ist erforderlich'
    if (!formData.dueDate) newErrors.dueDate = 'Abgabefrist ist erforderlich'
    if (!formData.effortDays || parseInt(formData.effortDays) <= 0) {
      newErrors.effortDays = 'Gültiger Aufwand erforderlich'
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Neue Angebotsanfrage</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Auftraggeber */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Auftraggeber <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.client}
              onChange={(e) => handleChange('client', e.target.value)}
              placeholder="z.B. Stadt Bocholt"
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.client ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            />
            {errors.client && <p className="text-red-500 text-xs mt-1">{errors.client}</p>}
          </div>

          {/* Angebotsbezeichnung */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Angebotsbezeichnung <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="z.B. Erschließung Neubaugebiet Nord"
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.title ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Projektleiter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Projektleiter <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.owner}
              onChange={(e) => handleChange('owner', e.target.value)}
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.owner ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
            >
              <option value="">Auswählen...</option>
              <option value="Max">Max</option>
              <option value="Arne">Arne</option>
              <option value="David">David</option>
              <option value="Florian">Florian</option>
              <option value="Thomas">Thomas</option>
              <option value="Stefan">Stefan</option>
            </select>
            {errors.owner && <p className="text-red-500 text-xs mt-1">{errors.owner}</p>}
          </div>

          {/* Abgabefrist & Aufwand */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Abgabefrist <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange('dueDate', e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.dueDate ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              {errors.dueDate && <p className="text-red-500 text-xs mt-1">{errors.dueDate}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Aufwand (PT) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={formData.effortDays}
                onChange={(e) => handleChange('effortDays', e.target.value)}
                placeholder="z.B. 15"
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.effortDays ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
              />
              {errors.effortDays && <p className="text-red-500 text-xs mt-1">{errors.effortDays}</p>}
            </div>
          </div>

          {/* Notizen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notizen <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Zusätzliche Informationen zum Angebot..."
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Anfrage erstellen
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default NewOfferModal
