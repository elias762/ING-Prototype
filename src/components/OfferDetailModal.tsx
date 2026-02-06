import { X, Calendar, User, Clock, FileText, Building, Trash2 } from 'lucide-react'
import { type Offer, getProjects, getOffers } from '../data/mockData'
import { calculateScreening } from '../data/aiScreening'
import ScreeningDetailSection from './ScreeningDetailSection'

interface Props {
  offer: Offer
  onClose: () => void
  onDelete: (id: string) => void
  onUpdatePhase: (id: string, phase: Offer['phase']) => void
}

const phases: Offer['phase'][] = ['Anfrage', 'Analyse', 'Vorbereitung', 'Abgabe']

function OfferDetailModal({ offer, onClose, onDelete, onUpdatePhase }: Props) {
  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'Anfrage': return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'Analyse': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'Vorbereitung': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'Abgabe': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getDeadlineStatus = () => {
    const now = new Date()
    const deadline = new Date(offer.dueDate)
    const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return { color: 'text-red-600 bg-red-50', label: 'Überfällig' }
    if (diffDays <= 7) return { color: 'text-red-600 bg-red-50', label: 'Dringend' }
    if (diffDays <= 14) return { color: 'text-yellow-600 bg-yellow-50', label: 'Bald fällig' }
    return { color: 'text-green-600 bg-green-50', label: 'Im Plan' }
  }

  const deadlineStatus = getDeadlineStatus()

  const screening = offer.phase === 'Anfrage'
    ? calculateScreening(offer, getProjects(), getOffers())
    : null

  const handleDelete = () => {
    if (window.confirm('Angebot wirklich löschen?')) {
      onDelete(offer.id)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-start justify-between">
          <div>
            <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full border mb-2 ${getPhaseColor(offer.phase)}`}>
              {offer.phase}
            </span>
            <h2 className="text-xl font-bold text-gray-900">{offer.title}</h2>
            <p className="text-gray-500 mt-1">{offer.client}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Building size={16} />
                <span className="text-xs font-medium">Auftraggeber</span>
              </div>
              <p className="font-semibold text-gray-900">{offer.client}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <User size={16} />
                <span className="text-xs font-medium">Projektleiter</span>
              </div>
              <p className="font-semibold text-gray-900">{offer.owner}</p>
            </div>
            <div className={`rounded-xl p-4 ${deadlineStatus.color}`}>
              <div className="flex items-center gap-2 mb-1 opacity-75">
                <Calendar size={16} />
                <span className="text-xs font-medium">Abgabefrist</span>
              </div>
              <p className="font-semibold">{new Date(offer.dueDate).toLocaleDateString('de-DE', {
                weekday: 'short',
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}</p>
              <span className="text-xs font-medium">{deadlineStatus.label}</span>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Clock size={16} />
                <span className="text-xs font-medium">Geschätzter Aufwand</span>
              </div>
              <p className="font-semibold text-gray-900">{offer.effortDays} Personentage</p>
            </div>
          </div>

          {/* KI-Screening */}
          {screening && <ScreeningDetailSection result={screening} />}

          {/* Phase Selector */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Phase ändern</p>
            <div className="flex gap-2">
              {phases.map(phase => (
                <button
                  key={phase}
                  onClick={() => onUpdatePhase(offer.id, phase)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    offer.phase === phase
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {phase}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <FileText size={16} />
              <span className="text-sm font-medium">Notizen</span>
            </div>
            {offer.notes ? (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <p className="text-gray-700 whitespace-pre-wrap">{offer.notes}</p>
              </div>
            ) : (
              <p className="text-gray-400 italic">Keine Notizen vorhanden</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-100 px-6 py-4 flex justify-between">
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
          >
            <Trash2 size={18} />
            Löschen
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  )
}

export default OfferDetailModal
