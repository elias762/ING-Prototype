import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, RotateCcw, FileText, Euro, TrendingUp, FolderOpen, AlertTriangle, ChevronRight } from 'lucide-react'
import {
  getProjects,
  type Project,
  formatCurrency,
  calculateBillingProgress,
  getDeadlineStatus,
  initialProjects
} from '../data/mockData'

type SortOption = 'deadline-asc' | 'deadline-desc' | 'volume-desc' | 'billing-desc' | 'progress-desc'

const disciplines = ['Alle', 'Straße', 'Wasser', 'RA', 'Vermessung'] as const
const statuses = ['Alle', 'In Bearbeitung', 'Warten', 'Nicht begonnen', 'Abgeschlossen', 'Überfällig'] as const

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'deadline-asc', label: 'Deadline aufsteigend' },
  { value: 'deadline-desc', label: 'Deadline absteigend' },
  { value: 'volume-desc', label: 'Projektvolumen absteigend' },
  { value: 'billing-desc', label: 'Abrechnungsstand absteigend' },
  { value: 'progress-desc', label: 'Fortschritt absteigend' },
]

function Projekte() {
  const navigate = useNavigate()

  // Verwende initialProjects direkt um sicherzustellen dass neue Felder da sind
  const [projects] = useState<Project[]>(() => {
    const stored = getProjects()
    // Prüfe ob projectVolume existiert, sonst nutze initialProjects
    if (stored.length > 0 && stored[0].projectVolume !== undefined) {
      return stored
    }
    return initialProjects
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [filterDiscipline, setFilterDiscipline] = useState<string>('Alle')
  const [filterStatus, setFilterStatus] = useState<string>('Alle')
  const [sortOption, setSortOption] = useState<SortOption>('deadline-asc')

  // Filter und Sortierung
  const filteredProjects = useMemo(() => {
    let result = [...projects]

    // Suchfilter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(p =>
        p.projectNumber.toLowerCase().includes(query) ||
        p.title.toLowerCase().includes(query) ||
        p.projectManager.toLowerCase().includes(query) ||
        p.discipline.toLowerCase().includes(query) ||
        p.status.toLowerCase().includes(query)
      )
    }

    // Disziplin Filter
    if (filterDiscipline !== 'Alle') {
      result = result.filter(p => p.discipline === filterDiscipline)
    }

    // Status Filter
    if (filterStatus !== 'Alle') {
      result = result.filter(p => p.status === filterStatus)
    }

    // Sortierung
    result.sort((a, b) => {
      switch (sortOption) {
        case 'deadline-asc':
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        case 'deadline-desc':
          return new Date(b.deadline).getTime() - new Date(a.deadline).getTime()
        case 'volume-desc':
          return b.projectVolume - a.projectVolume
        case 'billing-desc':
          return calculateBillingProgress(b) - calculateBillingProgress(a)
        case 'progress-desc':
          return b.progress - a.progress
        default:
          return 0
      }
    })

    return result
  }, [projects, searchQuery, filterDiscipline, filterStatus, sortOption])

  // Summary Berechnungen
  const summary = useMemo(() => {
    const totalVolume = projects.reduce((sum, p) => sum + p.projectVolume, 0)
    const totalInvoiced = projects.reduce((sum, p) => sum + p.invoicedAmount, 0)
    const avgBilling = totalVolume > 0 ? (totalInvoiced / totalVolume) * 100 : 0
    const overdueCount = projects.filter(p => p.status === 'Überfällig' || getDeadlineStatus(p.deadline) === 'overdue').length

    return { totalVolume, totalInvoiced, avgBilling, overdueCount, totalCount: projects.length }
  }, [projects])

  const resetFilters = () => {
    setSearchQuery('')
    setFilterDiscipline('Alle')
    setFilterStatus('Alle')
    setSortOption('deadline-asc')
  }

  const hasActiveFilters = searchQuery || filterDiscipline !== 'Alle' || filterStatus !== 'Alle'

  // Status Badge Farben
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Bearbeitung': return 'bg-blue-100 text-blue-700'
      case 'Überfällig': return 'bg-red-100 text-red-700'
      case 'Warten': return 'bg-yellow-100 text-yellow-700'
      case 'Nicht begonnen': return 'bg-gray-100 text-gray-700'
      case 'Abgeschlossen': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getDisciplineColor = (discipline: string) => {
    switch (discipline) {
      case 'Straße': return 'bg-orange-100 text-orange-700'
      case 'Wasser': return 'bg-cyan-100 text-cyan-700'
      case 'RA': return 'bg-purple-100 text-purple-700'
      case 'Vermessung': return 'bg-emerald-100 text-emerald-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getDeadlineBadge = (deadline: string) => {
    const status = getDeadlineStatus(deadline)
    switch (status) {
      case 'overdue': return { color: 'bg-red-100 text-red-700', label: 'Überfällig' }
      case 'urgent': return { color: 'bg-red-100 text-red-700', label: 'Dringend' }
      case 'soon': return { color: 'bg-yellow-100 text-yellow-700', label: 'Bald fällig' }
      default: return { color: 'bg-green-100 text-green-700', label: 'Im Plan' }
    }
  }

  const getBillingBarColor = (billingProgress: number) => {
    if (billingProgress > 100) return 'bg-red-500'
    if (billingProgress >= 80) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getProgressBarColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500'
    if (progress >= 50) return 'bg-blue-500'
    return 'bg-yellow-500'
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 rounded-lg">
              <FolderOpen className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Projekte</p>
              <p className="text-2xl font-bold text-gray-900">{summary.totalCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-green-100 rounded-lg">
              <Euro className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Gesamtvolumen</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.totalVolume)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-100 rounded-lg">
              <TrendingUp className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Ø Abrechnung</p>
              <p className="text-2xl font-bold text-gray-900">{summary.avgBilling.toFixed(1)}%</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-100 rounded-lg">
              <AlertTriangle className="text-red-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-500">Überfällig</p>
              <p className="text-2xl font-bold text-gray-900">{summary.overdueCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Suche nach Projektnummer, Projektname, Projektleiter oder Disziplin..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all"
          />
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filterDiscipline}
            onChange={(e) => setFilterDiscipline(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {disciplines.map(d => (
              <option key={d} value={d}>{d === 'Alle' ? 'Alle Disziplinen' : d}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {statuses.map(s => (
              <option key={s} value={s}>{s === 'Alle' ? 'Alle Status' : s}</option>
            ))}
          </select>

          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
            >
              <RotateCcw size={16} />
              Filter zurücksetzen
            </button>
          )}

          <div className="ml-auto text-sm text-gray-500">
            {filteredProjects.length} von {projects.length} Projekten
          </div>
        </div>
      </div>

      {/* Table */}
      {filteredProjects.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider sticky top-0 bg-gray-50">Projekt-Nr.</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider sticky top-0 bg-gray-50">Projektname</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider sticky top-0 bg-gray-50">Disziplin</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider sticky top-0 bg-gray-50">PL</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider sticky top-0 bg-gray-50">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider sticky top-0 bg-gray-50">Deadline</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider sticky top-0 bg-gray-50">Fortschritt</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider sticky top-0 bg-gray-50">Volumen</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider sticky top-0 bg-gray-50">Abgerechnet</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider sticky top-0 bg-gray-50">Abrechnungsstand</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider sticky top-0 bg-gray-50">
                    <FileText size={14} className="inline" />
                  </th>
                  <th className="px-4 py-3 sticky top-0 bg-gray-50"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProjects.map((project) => {
                  const billingProgress = calculateBillingProgress(project)
                  const deadlineBadge = getDeadlineBadge(project.deadline)

                  return (
                    <tr
                      key={project.id}
                      onClick={() => navigate(`/projekte/${project.id}`)}
                      className="hover:bg-blue-50 transition-colors cursor-pointer group"
                    >
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm font-medium text-gray-900">{project.projectNumber}</span>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <p className="font-medium text-gray-900 truncate">{project.title}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDisciplineColor(project.discipline)}`}>
                          {project.discipline}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{project.projectManager}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm text-gray-700">
                            {new Date(project.deadline).toLocaleDateString('de-DE')}
                          </span>
                          <span className={`inline-block w-fit px-1.5 py-0.5 text-xs font-medium rounded ${deadlineBadge.color}`}>
                            {deadlineBadge.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${getProgressBarColor(project.progress)}`}
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600 w-8">{project.progress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-medium text-gray-900">{formatCurrency(project.projectVolume)}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-col items-end">
                          <span className={`text-sm font-medium ${billingProgress > 100 ? 'text-red-600' : 'text-gray-900'}`}>
                            {formatCurrency(project.invoicedAmount)}
                          </span>
                          {billingProgress > 100 && (
                            <span className="text-xs px-1.5 py-0.5 bg-red-100 text-red-700 rounded mt-1">Über Budget</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${getBillingBarColor(billingProgress)}`}
                              style={{ width: `${Math.min(billingProgress, 100)}%` }}
                            />
                          </div>
                          <span className={`text-xs w-10 ${billingProgress > 100 ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                            {billingProgress.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {project.notes && (
                          <span title={project.notes} className="text-gray-400 hover:text-gray-600">
                            <FileText size={16} />
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <FolderOpen className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine Projekte gefunden</h3>
          <p className="text-gray-500 mb-6">Versuche die Filter anzupassen oder setze sie zurück.</p>
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <RotateCcw size={18} />
            Filter zurücksetzen
          </button>
        </div>
      )}
    </div>
  )
}

export default Projekte
