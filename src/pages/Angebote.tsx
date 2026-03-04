import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, FileText, Clock, AlertTriangle, TrendingUp, Calendar, User, Sparkles, BarChart3, ChevronRight } from 'lucide-react'
import { type Offer } from '../data/mockData'
import { calculateScreening, type ScreeningResult } from '../data/aiScreening'
import { useOffers } from '../hooks/useOffers'
import { useProjects } from '../hooks/useProjects'
import LoadingSpinner from '../components/LoadingSpinner'
import OfferDetailModal from '../components/OfferDetailModal'
import NewOfferModal from '../components/NewOfferModal'
import ViewToggle from '../components/ViewToggle'
import { useLanguage } from '../i18n/LanguageContext'

function Angebote() {
  const [searchParams] = useSearchParams()
  const { t, dateLocale } = useLanguage()
  const { offers, loading: loadingOffers, create, update, patch, remove } = useOffers()
  const { projects: allProjects, loading: loadingProjects } = useProjects()
  const [draggedOffer, setDraggedOffer] = useState<Offer | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null)
  const [showNewOfferModal, setShowNewOfferModal] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list')

  const kanbanColumns: { id: Offer['phase']; title: string; color: string }[] = [
    { id: 'Anfrage', title: t('offers.offerRequest'), color: 'bg-gray-400' },
    { id: 'Analyse', title: t('phase.Analyse'), color: 'bg-blue-400' },
    { id: 'Vorbereitung', title: t('phase.Vorbereitung'), color: 'bg-yellow-400' },
    { id: 'Abgabe', title: t('phase.Abgabe'), color: 'bg-green-400' },
  ]

  // Auto-open offer from query param once loaded
  const offerId = searchParams.get('offer')
  if (offerId && !selectedOffer && !loadingOffers) {
    const match = offers.find((o) => o.id === offerId)
    if (match) {
      // Use setTimeout to avoid setState during render
      setTimeout(() => setSelectedOffer(match), 0)
    }
  }

  const totalOffers = offers.length
  const inAnalysis = offers.filter(o => o.phase === 'Analyse').length
  const inPreparation = offers.filter(o => o.phase === 'Vorbereitung').length
  const urgentOffers = offers.filter(o => {
    const diffDays = Math.ceil((new Date(o.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    return diffDays <= 14 && diffDays >= 0
  }).length
  const totalEffort = offers.reduce((sum, o) => sum + o.effortDays, 0)

  const screeningResults = useMemo(() => {
    const results = new Map<string, ScreeningResult>()
    offers
      .filter(o => o.phase === 'Anfrage')
      .forEach(o => results.set(o.id, calculateScreening(o, allProjects, offers)))
    return results
  }, [offers, allProjects])

  if (loadingOffers || loadingProjects) return <LoadingSpinner />

  const getOffersByPhase = (phase: Offer['phase']) => {
    return offers.filter(o => o.phase === phase)
  }

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

    update(draggedOffer.id, { phase: newPhase })
    setDraggedOffer(null)
    setDragOverColumn(null)
  }

  const handleUpdate = (updated: Offer) => {
    patch(updated.id, updated)
    setSelectedOffer(updated)
  }

  const handleDeleteOffer = (id: string) => {
    remove(id)
  }

  const handleCreateOffer = (offerData: Omit<Offer, 'id' | 'phase'>) => {
    const newOffer: Offer = {
      ...offerData,
      id: `b${Date.now()}`,
      phase: 'Anfrage'
    }
    create(newOffer)
  }

  const getDeadlineStatus = (dueDate: string) => {
    const now = new Date()
    const deadline = new Date(dueDate)
    const diffDays = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return { color: 'text-red-500', label: t('deadline.overdue'), urgent: true }
    if (diffDays <= 7) return { color: 'text-red-500', label: t('deadline.urgent'), urgent: true }
    if (diffDays <= 14) return { color: 'text-yellow-600', label: t('deadline.soon'), urgent: false }
    return { color: 'text-green-600', label: t('deadline.onTrack'), urgent: false }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(dateLocale, {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    })
  }

  const getPhaseBadgeColor = (phase: Offer['phase']) => {
    switch (phase) {
      case 'Anfrage': return 'bg-gray-100 text-gray-600'
      case 'Analyse': return 'bg-blue-50 text-blue-600'
      case 'Vorbereitung': return 'bg-yellow-50 text-yellow-600'
      case 'Abgabe': return 'bg-green-50 text-green-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  return (
    <div className={viewMode === 'kanban' ? 'flex flex-col h-full -m-6' : 'space-y-6'}>
      <div className={viewMode === 'kanban' ? 'px-6 pt-6 pb-4 border-b border-gray-100 space-y-4' : 'space-y-4'}>
        {showStats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-white rounded-lg border border-gray-100 px-4 py-2.5 flex items-center gap-2.5">
              <FileText className="text-gray-400 shrink-0" size={16} />
              <p className="text-xs text-gray-500">{t('offers.total')}</p>
              <p className="text-lg font-semibold text-[#333] ml-auto">{totalOffers}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-100 px-4 py-2.5 flex items-center gap-2.5">
              <TrendingUp className="text-gray-400 shrink-0" size={16} />
              <p className="text-xs text-gray-500">{t('offers.inAnalysis')}</p>
              <p className="text-lg font-semibold text-[#333] ml-auto">{inAnalysis}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-100 px-4 py-2.5 flex items-center gap-2.5">
              <Clock className="text-gray-400 shrink-0" size={16} />
              <p className="text-xs text-gray-500">{t('offers.preparation')}</p>
              <p className="text-lg font-semibold text-[#333] ml-auto">{inPreparation}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-100 px-4 py-2.5 flex items-center gap-2.5">
              <AlertTriangle className="text-gray-400 shrink-0" size={16} />
              <p className="text-xs text-gray-500">{t('offers.urgent')}</p>
              <p className="text-lg font-semibold text-[#333] ml-auto">{urgentOffers}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-100 px-4 py-2.5 flex items-center gap-2.5">
              <Calendar className="text-gray-400 shrink-0" size={16} />
              <p className="text-xs text-gray-500">{t('offers.effortPT')}</p>
              <p className="text-lg font-semibold text-[#333] ml-auto">{totalEffort}</p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{t('offers.pipeline')}</h2>
            <p className="text-sm text-gray-400">
              {viewMode === 'kanban' ? t('offers.dragHint') : `${totalOffers} ${t('offers.total')}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ViewToggle view={viewMode} onChange={setViewMode} />
            <button
              onClick={() => setShowStats(prev => !prev)}
              className={`p-2 rounded-lg transition-colors ${showStats ? 'bg-brand/10 text-brand' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
              title="Toggle stats"
            >
              <BarChart3 size={18} />
            </button>
            <button
              onClick={() => setShowNewOfferModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors font-medium"
            >
              <Plus size={20} />
              {t('offers.newRequest')}
            </button>
          </div>
        </div>
      </div>

      {/* Kanban View */}
      {viewMode === 'kanban' && (
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
                  <div className="px-4 py-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${column.color}`}></div>
                        <h3 className="font-semibold text-[#333]">{column.title}</h3>
                      </div>
                      <span className="text-sm font-medium text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                        {columnOffers.length}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{columnEffort} {t('offers.ptEffort')}</p>
                  </div>

                  <div
                    className={`flex-1 rounded-b-xl p-3 min-h-[400px] transition-all border-2 ${
                      isDragOver
                        ? 'border-brand bg-brand/5'
                        : 'border-transparent bg-gray-50/50'
                    }`}
                  >
                    <div className="space-y-3">
                      {columnOffers.map((offer) => {
                        const deadlineStatus = getDeadlineStatus(offer.dueDate)

                        return (
                          <div
                            key={offer.id}
                            draggable
                            onDragStart={() => handleDragStart(offer)}
                            onClick={() => setSelectedOffer(offer)}
                            className={`bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:border-gray-300 transition-all ${
                              draggedOffer?.id === offer.id ? 'opacity-50 scale-95' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                {offer.client}
                              </span>
                              <div className="flex items-center gap-1.5">
                                {(() => {
                                  const screening = screeningResults.get(offer.id)
                                  if (!screening) return null
                                  const colorCls = screening.overallColor === 'green' ? 'bg-green-50 text-green-600 border-green-200'
                                    : screening.overallColor === 'yellow' ? 'bg-yellow-50 text-yellow-600 border-yellow-200'
                                    : 'bg-red-50 text-red-600 border-red-200'
                                  return (
                                    <span
                                      className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold border ${colorCls}`}
                                      title={`${t('screening.title')}: ${screening.overallLabel}`}
                                    >
                                      <Sparkles size={10} />
                                      {screening.overallScore}
                                    </span>
                                  )
                                })()}
                                {deadlineStatus.urgent && (
                                  <span className={`text-xs font-medium ${deadlineStatus.color}`}>
                                    {deadlineStatus.label}
                                  </span>
                                )}
                              </div>
                            </div>

                            <h4 className="font-semibold text-[#333] mb-3 line-clamp-2">{offer.title}</h4>

                            {offer.notes && (
                              <div className="rich-text text-sm text-gray-500 mb-3 line-clamp-2" dangerouslySetInnerHTML={{ __html: offer.notes }} />
                            )}

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
                              <div className="flex items-center gap-1 font-medium text-gray-600">
                                <User size={12} />
                                {offer.owner}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {columnOffers.length === 0 && (
                      <div className={`h-32 flex items-center justify-center border-2 border-dashed rounded-lg transition-colors ${
                        isDragOver ? 'border-brand bg-brand/10' : 'border-gray-300'
                      }`}>
                        <p className="text-sm text-gray-400">
                          {isDragOver ? t('offers.dropHere') : t('offers.noOffers')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <>
          {offers.length > 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto shadow-sm">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider w-[120px] min-w-[120px] sticky left-0 z-20 bg-gray-50">{t('offerModal.client')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider min-w-[260px] sticky left-[120px] z-20 bg-gray-50 sticky-shadow">{t('offers.colTitle')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('offerModal.projectManager')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('offers.colPhase')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('offerModal.dueDate')}</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">{t('offers.colEffort')}</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                        <Sparkles size={14} className="inline" />
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                        <FileText size={14} className="inline" />
                      </th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {offers.map((offer) => {
                      const deadlineStatus = getDeadlineStatus(offer.dueDate)
                      const screening = screeningResults.get(offer.id)

                      return (
                        <tr
                          key={offer.id}
                          onClick={() => setSelectedOffer(offer)}
                          className="hover:bg-gray-50 transition-colors cursor-pointer group"
                        >
                          <td className="px-4 py-3.5 w-[120px] min-w-[120px] sticky left-0 z-10 bg-white group-hover:bg-gray-50 border-l-2 border-transparent group-hover:border-brand">
                            <span className="text-sm font-semibold text-[#333] uppercase">{offer.client}</span>
                          </td>
                          <td className="px-4 py-3.5 min-w-[260px] sticky left-[120px] z-10 bg-white group-hover:bg-gray-50 sticky-shadow">
                            <p className="font-medium text-[#333]">{offer.title}</p>
                          </td>
                          <td className="px-4 py-3.5 text-sm text-gray-600">{offer.owner}</td>
                          <td className="px-4 py-3.5">
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getPhaseBadgeColor(offer.phase)}`}>
                              {t(`phase.${offer.phase}`)}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex flex-col gap-1">
                              <span className="text-sm text-gray-600">
                                {formatDate(offer.dueDate)}
                              </span>
                              <span className={`text-xs font-medium ${deadlineStatus.color}`}>
                                {deadlineStatus.label}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <span className="text-sm font-medium text-[#333]">{offer.effortDays} PT</span>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            {screening ? (
                              <span
                                className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold border ${
                                  screening.overallColor === 'green' ? 'bg-green-50 text-green-600 border-green-200'
                                    : screening.overallColor === 'yellow' ? 'bg-yellow-50 text-yellow-600 border-yellow-200'
                                    : 'bg-red-50 text-red-600 border-red-200'
                                }`}
                                title={`${t('screening.title')}: ${screening.overallLabel}`}
                              >
                                <Sparkles size={10} />
                                {screening.overallScore}
                              </span>
                            ) : (
                              <span className="text-gray-300">&mdash;</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            {offer.notes && (
                              <span title={offer.notes} className="text-gray-400 hover:text-gray-600">
                                <FileText size={16} />
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            <ChevronRight size={18} className="text-gray-300 group-hover:text-brand group-hover:translate-x-0.5 transition-all" />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <FileText className="text-gray-400" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-[#333] mb-2">{t('offers.noOffersFound')}</h3>
            </div>
          )}
        </>
      )}

      {selectedOffer && (
        <OfferDetailModal
          offer={selectedOffer}
          allProjects={allProjects}
          allOffers={offers}
          onClose={() => setSelectedOffer(null)}
          onDelete={handleDeleteOffer}
          onUpdate={handleUpdate}
        />
      )}

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
