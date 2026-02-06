import { useState, useEffect, useMemo } from 'react'
import { Plus, FileText, Clock, AlertTriangle, TrendingUp, Calendar, User, Sparkles } from 'lucide-react'
import { getOffers, saveOffers, getProjects, type Offer } from '../data/mockData'
import { calculateScreening, type ScreeningResult } from '../data/aiScreening'
import OfferDetailModal from '../components/OfferDetailModal'
import NewOfferModal from '../components/NewOfferModal'

const kanbanColumns: { id: Offer['phase']; title: string; color: string; bgColor: string }[] = [
  { id: 'Anfrage', title: 'Angebotsanfrage', color: 'bg-gray-500', bgColor: 'bg-gray-50' },
  { id: 'Analyse', title: 'Analyse', color: 'bg-blue-500', bgColor: 'bg-blue-50' },
  { id: 'Vorbereitung', title: 'Vorbereitung', color: 'bg-yellow-500', bgColor: 'bg-yellow-50' },
  { id: 'Abgabe', title: 'Abgabe', color: 'bg-green-500', bgColor: 'bg-green-50' },
]

function Angebote() {
  const [offers, setOffers] = useState<Offer[]>([])
  const [draggedOffer, setDraggedOffer] = useState<Offer | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null)
  const [showNewOfferModal, setShowNewOfferModal] = useState(false)

  useEffect(() => {
    setOffers(getOffers())
  }, [])

  // KPI Berechnungen
  const totalOffers = offers.length
  const inAnalysis = offers.filter(o => o.phase === 'Analyse').length
  const inPreparation = offers.filter(o => o.phase === 'Vorbereitung').length
  const urgentOffers = offers.filter(o => {
    const diffDays = Math.ceil((new Date(o.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return diffDays <= 14 && diffDays >= 0
  }).length
  const totalEffort = offers.reduce((sum, o) => sum + o.effortDays, 0)

  // KI-Screening fuer Anfrage-Phase
  const screeningResults = useMemo(() => {
    const projects = getProjects()
    const allOffers = offers
    const results = new Map<string, ScreeningResult>()
    offers
      .filter(o => o.phase === 'Anfrage')
      .forEach(o => results.set(o.id, calculateScreening(o, projects, allOffers)))
    return results
  }, [offers])

  const getOffersByPhase = (phase: Offer['phase']) => {
    return offers.filter(o => o.phase === phase)
  }

  // Drag & Drop
  const handleDragStart = (offer: Offer) => {
    setDraggedOffer(offer)
  }

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    setDragOverColumn(columnId)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = (newPhase: Offer['phase']) => {
    if (!draggedOffer || draggedOffer.phase === newPhase) {
      setDraggedOffer(null)
      setDragOverColumn(null)
      return
    }

    const updatedOffers = offers.map(o =>
      o.id === draggedOffer.id ? { ...o, phase: newPhase } : o
    )

    setOffers(updatedOffers)
    saveOffers(updatedOffers)
    setDraggedOffer(null)
    setDragOverColumn(null)
  }

  // CRUD Operations
  const handleUpdatePhase = (id: string, newPhase: Offer['phase']) => {
    const updatedOffers = offers.map(o =>
      o.id === id ? { ...o, phase: newPhase } : o
    )
    setOffers(updatedOffers)
    saveOffers(updatedOffers)

    // Update selected offer if it's the one being changed
    if (selectedOffer?.id === id) {
      setSelectedOffer({ ...selectedOffer, phase: newPhase })
    }
  }

  const handleDeleteOffer = (id: string) => {
    const updatedOffers = offers.filter(o => o.id !== id)
    setOffers(updatedOffers)
    saveOffers(updatedOffers)
  }

  const handleCreateOffer = (offerData: Omit<Offer, 'id' | 'phase'>) => {
    const newOffer: Offer = {
      ...offerData,
      id: `b${Date.now()}`,
      phase: 'Anfrage'
    }
    const updatedOffers = [...offers, newOffer]
    setOffers(updatedOffers)
    saveOffers(updatedOffers)
  }

  // Helper Functions
  const getDeadlineStatus = (dueDate: string) => {
    const now = new Date()
    const deadline = new Date(dueDate)
    const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return { color: 'bg-red-100 text-red-700', label: 'Überfällig', urgent: true }
    if (diffDays <= 7) return { color: 'bg-red-100 text-red-700', label: 'Dringend', urgent: true }
    if (diffDays <= 14) return { color: 'bg-yellow-100 text-yellow-700', label: 'Bald fällig', urgent: false }
    return { color: 'bg-green-100 text-green-700', label: 'Im Plan', urgent: false }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    })
  }

  return (
    <div className="flex flex-col h-full -m-6">
      {/* Fixed Header Section */}
      <div className="px-6 pt-6 pb-4 bg-gray-50 border-b border-gray-200">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <FileText className="text-gray-600" size={18} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Gesamt</p>
                <p className="text-xl font-bold text-gray-900">{totalOffers}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="text-blue-600" size={18} />
              </div>
              <div>
                <p className="text-xs text-gray-500">In Analyse</p>
                <p className="text-xl font-bold text-gray-900">{inAnalysis}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="text-yellow-600" size={18} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Vorbereitung</p>
                <p className="text-xl font-bold text-gray-900">{inPreparation}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="text-red-600" size={18} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Dringend (&lt;14d)</p>
                <p className="text-xl font-bold text-gray-900">{urgentOffers}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="text-purple-600" size={18} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Aufwand (PT)</p>
                <p className="text-xl font-bold text-gray-900">{totalEffort}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Angebots-Pipeline</h2>
            <p className="text-sm text-gray-500">Ziehe Karten zwischen Spalten, um den Status zu ändern</p>
          </div>
          <button
            onClick={() => setShowNewOfferModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
          >
            <Plus size={20} />
            Neue Angebotsanfrage
          </button>
        </div>
      </div>

      {/* Kanban Board - Scrollable */}
      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-6 min-w-max h-full">
          {kanbanColumns.map((column) => {
            const columnOffers = getOffersByPhase(column.id)
            const columnEffort = columnOffers.reduce((sum, o) => sum + o.effortDays, 0)
            const isDragOver = dragOverColumn === column.id

            return (
              <div
                key={column.id}
                className="flex flex-col w-80 shrink-0"
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDragLeave={handleDragLeave}
                onDrop={() => handleDrop(column.id)}
              >
                {/* Column Header */}
                <div className={`rounded-t-xl px-4 py-3 ${column.bgColor}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${column.color}`}></div>
                      <h3 className="font-semibold text-gray-900">{column.title}</h3>
                    </div>
                    <span className="text-sm font-medium text-gray-600 bg-white px-2.5 py-1 rounded-full shadow-sm">
                      {columnOffers.length}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{columnEffort} PT Aufwand</p>
                </div>

                {/* Column Content */}
                <div
                  className={`flex-1 rounded-b-xl p-3 min-h-[400px] transition-all border-2 ${
                    isDragOver
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-transparent bg-gray-100'
                  }`}
                >
                  {/* Cards */}
                  <div className="space-y-3">
                    {columnOffers.map((offer) => {
                      const deadlineStatus = getDeadlineStatus(offer.dueDate)

                      return (
                        <div
                          key={offer.id}
                          draggable
                          onDragStart={() => handleDragStart(offer)}
                          onClick={() => setSelectedOffer(offer)}
                          className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all ${
                            draggedOffer?.id === offer.id ? 'opacity-50 scale-95' : ''
                          }`}
                        >
                          {/* Card Header */}
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                              {offer.client}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {(() => {
                                const screening = screeningResults.get(offer.id)
                                if (!screening) return null
                                const bgColor = screening.overallColor === 'green' ? 'bg-green-500'
                                  : screening.overallColor === 'yellow' ? 'bg-yellow-500'
                                  : 'bg-red-500'
                                return (
                                  <span
                                    className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold text-white ${bgColor}`}
                                    title={`KI-Screening: ${screening.overallLabel}`}
                                  >
                                    <Sparkles size={10} />
                                    {screening.overallScore}
                                  </span>
                                )
                              })()}
                              {deadlineStatus.urgent && (
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${deadlineStatus.color}`}>
                                  {deadlineStatus.label}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Title */}
                          <h4 className="font-semibold text-gray-900 mb-3 line-clamp-2">{offer.title}</h4>

                          {/* Notes Preview */}
                          {offer.notes && (
                            <p className="text-sm text-gray-500 mb-3 line-clamp-2">{offer.notes}</p>
                          )}

                          {/* Card Footer */}
                          <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <Calendar size={12} />
                                {formatDate(offer.dueDate)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={12} />
                                {offer.effortDays} PT
                              </span>
                            </div>
                            <div className="flex items-center gap-1 font-medium text-gray-700">
                              <User size={12} />
                              {offer.owner}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Empty State / Drop Zone */}
                  {columnOffers.length === 0 && (
                    <div className={`h-32 flex items-center justify-center border-2 border-dashed rounded-xl transition-colors ${
                      isDragOver ? 'border-blue-400 bg-blue-100' : 'border-gray-300'
                    }`}>
                      <p className="text-sm text-gray-400">
                        {isDragOver ? 'Hier ablegen' : 'Keine Angebote'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedOffer && (
        <OfferDetailModal
          offer={selectedOffer}
          onClose={() => setSelectedOffer(null)}
          onDelete={handleDeleteOffer}
          onUpdatePhase={handleUpdatePhase}
        />
      )}

      {/* New Offer Modal */}
      {showNewOfferModal && (
        <NewOfferModal
          onClose={() => setShowNewOfferModal(false)}
          onSave={handleCreateOffer}
        />
      )}
    </div>
  )
}

export default Angebote
