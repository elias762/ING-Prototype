import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Euro,
  FolderOpen,
  FileText,
  AlertTriangle,
  TrendingUp,
  Clock,
  ChevronRight,
  Filter
} from 'lucide-react'
import {
  getProjects,
  getOffers,
  initialProjects,
  formatCurrency,
  getDeadlineStatus,
  type Project,
  type Offer
} from '../data/mockData'

type QuickFilter = 'all' | 'critical' | 'my-projects'

function Dashboard() {
  const navigate = useNavigate()
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all')

  // Daten laden
  const storedProjects = getProjects()
  const allProjects = storedProjects.length > 0 && storedProjects[0].projectVolume !== undefined
    ? storedProjects
    : initialProjects
  const allOffers = getOffers()

  // Quick Filter anwenden
  const projects = useMemo(() => {
    switch (quickFilter) {
      case 'critical':
        return allProjects.filter(p => {
          const status = getDeadlineStatus(p.deadline)
          return status === 'overdue' || status === 'urgent' || status === 'soon'
        })
      case 'my-projects':
        return allProjects.filter(p => p.projectManager === 'Max')
      default:
        return allProjects
    }
  }, [allProjects, quickFilter])

  const offers = useMemo(() => {
    if (quickFilter === 'critical') {
      return allOffers.filter(o => {
        const diffDays = Math.ceil((new Date(o.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        return diffDays <= 30
      })
    }
    return allOffers
  }, [allOffers, quickFilter])

  // KPI Berechnungen
  const kpis = useMemo(() => {
    const totalVolume = allProjects.reduce((sum, p) => sum + p.projectVolume, 0)
    const totalInvoiced = allProjects.reduce((sum, p) => sum + p.invoicedAmount, 0)
    const invoicedPercent = totalVolume > 0 ? (totalInvoiced / totalVolume) * 100 : 0
    const activeProjects = allProjects.filter(p => p.status !== 'Abgeschlossen').length
    const totalOffers = allOffers.length
    const avgProgress = allProjects.length > 0
      ? Math.round(allProjects.reduce((sum, p) => sum + p.progress, 0) / allProjects.length)
      : 0

    // Kritische Deadlines (Projekte + Angebote)
    const criticalProjects = allProjects.filter(p => {
      const status = getDeadlineStatus(p.deadline)
      return status === 'overdue' || status === 'urgent'
    }).length

    const criticalOffers = allOffers.filter(o => {
      const diffDays = Math.ceil((new Date(o.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      return diffDays <= 14
    }).length

    return {
      totalVolume,
      totalInvoiced,
      invoicedPercent,
      activeProjects,
      totalOffers,
      criticalDeadlines: criticalProjects + criticalOffers,
      avgProgress
    }
  }, [allProjects, allOffers])

  // Projekte nach Disziplin
  const projectsByDiscipline = useMemo(() => {
    const disciplines = ['Straße', 'Wasser', 'RA', 'Vermessung']
    return disciplines.map(d => ({
      name: d,
      count: projects.filter(p => p.discipline === d).length,
      volume: projects.filter(p => p.discipline === d).reduce((sum, p) => sum + p.projectVolume, 0)
    }))
  }, [projects])

  const maxDisciplineCount = Math.max(...projectsByDiscipline.map(d => d.count), 1)

  // Angebote nach Phase
  const offersByPhase = useMemo(() => {
    const phases = [
      { id: 'Anfrage', label: 'Anfrage', color: 'bg-gray-400' },
      { id: 'Analyse', label: 'Analyse', color: 'bg-blue-500' },
      { id: 'Vorbereitung', label: 'Vorbereitung', color: 'bg-yellow-500' },
      { id: 'Abgabe', label: 'Abgabe', color: 'bg-green-500' }
    ]
    return phases.map(p => ({
      ...p,
      count: offers.filter(o => o.phase === p.id).length
    }))
  }, [offers])

  const maxPhaseCount = Math.max(...offersByPhase.map(p => p.count), 1)

  // Nächste Projekt-Deadlines
  const upcomingDeadlines = useMemo(() => {
    return [...projects]
      .filter(p => p.status !== 'Abgeschlossen')
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
      .slice(0, 6)
  }, [projects])

  // Kritische Angebote
  const criticalOffers = useMemo(() => {
    return [...offers]
      .filter(o => {
        if (o.phase === 'Abgabe') return false
        const diffDays = Math.ceil((new Date(o.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        return diffDays <= 30
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 6)
  }, [offers])

  // Helper Functions
  const getDeadlineBadge = (deadline: string) => {
    const status = getDeadlineStatus(deadline)
    switch (status) {
      case 'overdue': return { color: 'bg-red-100 text-red-700', label: 'Überfällig' }
      case 'urgent': return { color: 'bg-red-100 text-red-700', label: 'Dringend' }
      case 'soon': return { color: 'bg-yellow-100 text-yellow-700', label: 'Bald fällig' }
      default: return { color: 'bg-green-100 text-green-700', label: 'Im Plan' }
    }
  }

  const getOfferDeadlineBadge = (dueDate: string) => {
    const diffDays = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays < 0) return { color: 'bg-red-100 text-red-700', label: 'Überfällig' }
    if (diffDays <= 7) return { color: 'bg-red-100 text-red-700', label: 'Dringend' }
    if (diffDays <= 30) return { color: 'bg-yellow-100 text-yellow-700', label: 'Bald fällig' }
    return { color: 'bg-green-100 text-green-700', label: 'Im Plan' }
  }

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'Anfrage': return 'bg-gray-100 text-gray-700'
      case 'Analyse': return 'bg-blue-100 text-blue-700'
      case 'Vorbereitung': return 'bg-yellow-100 text-yellow-700'
      case 'Abgabe': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getDisciplineColor = (discipline: string) => {
    switch (discipline) {
      case 'Straße': return 'bg-orange-500'
      case 'Wasser': return 'bg-cyan-500'
      case 'RA': return 'bg-purple-500'
      case 'Vermessung': return 'bg-emerald-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Quick Filters */}
      <div className="flex items-center gap-3">
        <Filter size={18} className="text-gray-400" />
        <div className="flex gap-2">
          {[
            { id: 'all', label: 'Alle Projekte' },
            { id: 'my-projects', label: 'Meine Projekte' },
            { id: 'critical', label: 'Nur kritische' }
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => setQuickFilter(filter.id as QuickFilter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                quickFilter === filter.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        {quickFilter !== 'all' && (
          <span className="text-sm text-gray-500 ml-2">
            {projects.length} Projekte, {offers.length} Angebote
          </span>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Gesamt Projektvolumen */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-3 opacity-90">
            <Euro size={18} />
            <span className="text-sm font-medium">Projektvolumen</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(kpis.totalVolume)}</p>
          <p className="text-xs opacity-75 mt-1">Summe aller Projekte</p>
        </div>

        {/* Bereits abgerechnet */}
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-2 mb-3 opacity-90">
            <TrendingUp size={18} />
            <span className="text-sm font-medium">Abgerechnet</span>
          </div>
          <p className="text-2xl font-bold">{formatCurrency(kpis.totalInvoiced)}</p>
          <p className="text-xs opacity-75 mt-1">{kpis.invoicedPercent.toFixed(1)}% des Volumens</p>
        </div>

        {/* Laufende Projekte */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-3 text-gray-500">
            <FolderOpen size={18} />
            <span className="text-sm font-medium">Laufende Projekte</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{kpis.activeProjects}</p>
          <p className="text-xs text-gray-500 mt-1">von {allProjects.length} gesamt</p>
        </div>

        {/* Angebots-Pipeline */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-3 text-gray-500">
            <FileText size={18} />
            <span className="text-sm font-medium">Angebots-Pipeline</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{kpis.totalOffers}</p>
          <p className="text-xs text-gray-500 mt-1">offene Angebote</p>
        </div>

        {/* Kritische Deadlines */}
        <div className={`rounded-2xl p-5 ${kpis.criticalDeadlines > 0 ? 'bg-gradient-to-br from-red-500 to-red-600 text-white' : 'bg-white shadow-sm border border-gray-100'}`}>
          <div className={`flex items-center gap-2 mb-3 ${kpis.criticalDeadlines > 0 ? 'opacity-90' : 'text-gray-500'}`}>
            <AlertTriangle size={18} />
            <span className="text-sm font-medium">Kritisch</span>
          </div>
          <p className={`text-3xl font-bold ${kpis.criticalDeadlines > 0 ? '' : 'text-gray-900'}`}>{kpis.criticalDeadlines}</p>
          <p className={`text-xs mt-1 ${kpis.criticalDeadlines > 0 ? 'opacity-75' : 'text-gray-500'}`}>Deadlines &lt; 14 Tage</p>
        </div>

        {/* Durchschnittlicher Fortschritt */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-3 text-gray-500">
            <Clock size={18} />
            <span className="text-sm font-medium">Ø Fortschritt</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{kpis.avgProgress}%</p>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden mt-2">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${kpis.avgProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Projekte nach Disziplin */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Projekte nach Disziplin</h3>
            <Link to="/projekte" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Alle anzeigen
            </Link>
          </div>
          <div className="space-y-4">
            {projectsByDiscipline.map(d => (
              <div key={d.name}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getDisciplineColor(d.name)}`} />
                    <span className="text-sm font-medium text-gray-700">{d.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-gray-900">{d.count}</span>
                    <span className="text-xs text-gray-500 ml-2">{formatCurrency(d.volume)}</span>
                  </div>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${getDisciplineColor(d.name)}`}
                    style={{ width: `${(d.count / maxDisciplineCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Angebots-Pipeline Status */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Angebots-Pipeline Status</h3>
            <Link to="/angebote" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Pipeline öffnen
            </Link>
          </div>
          <div className="space-y-4">
            {offersByPhase.map(p => (
              <div key={p.id}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${p.color}`} />
                    <span className="text-sm font-medium text-gray-700">{p.label}</span>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{p.count}</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${p.color}`}
                    style={{ width: `${(p.count / maxPhaseCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Pipeline Summary */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Gesamt Aufwand</span>
              <span className="font-bold text-gray-900">
                {offers.reduce((sum, o) => sum + o.effortDays, 0)} PT
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Operative Listen */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Nächste Projekt-Deadlines */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Nächste Projekt-Deadlines</h3>
            <Link to="/projekte" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              Alle <ChevronRight size={16} />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {upcomingDeadlines.length > 0 ? upcomingDeadlines.map(project => {
              const badge = getDeadlineBadge(project.deadline)
              return (
                <div
                  key={project.id}
                  onClick={() => navigate(`/projekte/${project.id}`)}
                  className="px-6 py-4 hover:bg-blue-50 cursor-pointer transition-colors group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-gray-500">{project.projectNumber}</span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${badge.color}`}>
                          {badge.label}
                        </span>
                      </div>
                      <p className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {project.title}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">{project.projectManager}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(project.deadline).toLocaleDateString('de-DE')}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{project.progress}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            }) : (
              <div className="px-6 py-8 text-center text-gray-500">
                Keine anstehenden Deadlines
              </div>
            )}
          </div>
        </div>

        {/* Kritische Angebotsanfragen */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Kritische Angebotsanfragen</h3>
            <Link to="/angebote" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              Pipeline <ChevronRight size={16} />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {criticalOffers.length > 0 ? criticalOffers.map(offer => {
              const badge = getOfferDeadlineBadge(offer.dueDate)
              return (
                <div
                  key={offer.id}
                  onClick={() => navigate('/angebote')}
                  className="px-6 py-4 hover:bg-blue-50 cursor-pointer transition-colors group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-gray-500 uppercase">{offer.client}</span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getPhaseColor(offer.phase)}`}>
                          {offer.phase}
                        </span>
                      </div>
                      <p className="font-medium text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {offer.title}
                      </p>
                      <p className="text-sm text-gray-500 mt-0.5">{offer.owner} · {offer.effortDays} PT</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm font-semibold text-gray-900">
                        {new Date(offer.dueDate).toLocaleDateString('de-DE')}
                      </p>
                      <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>
                  </div>
                </div>
              )
            }) : (
              <div className="px-6 py-8 text-center text-gray-500">
                Keine kritischen Angebote
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Financial Summary Footer */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-2xl p-6 text-white">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-slate-400 text-sm mb-1">Projektvolumen Gesamt</p>
            <p className="text-2xl font-bold">{formatCurrency(kpis.totalVolume)}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-1">Bereits abgerechnet</p>
            <p className="text-2xl font-bold">{formatCurrency(kpis.totalInvoiced)}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-1">Noch offen</p>
            <p className="text-2xl font-bold">{formatCurrency(kpis.totalVolume - kpis.totalInvoiced)}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm mb-1">Abrechnungsquote</p>
            <div className="flex items-center gap-3">
              <p className="text-2xl font-bold">{kpis.invoicedPercent.toFixed(1)}%</p>
              <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${Math.min(kpis.invoicedPercent, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
