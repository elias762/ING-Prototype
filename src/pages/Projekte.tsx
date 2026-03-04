import { useState, useMemo } from 'react'
import { Search, RotateCcw, FileText, Euro, TrendingUp, FolderOpen, AlertTriangle, ChevronRight, Plus, BarChart3, Calendar } from 'lucide-react'
import {
  type Project,
  formatCurrency,
  calculateBillingProgress,
  getDeadlineStatus,
} from '../data/mockData'
import { useProjects } from '../hooks/useProjects'
import { createProject } from '../services/projectService'
import LoadingSpinner from '../components/LoadingSpinner'
import CustomSelect from '../components/CustomSelect'
import NewProjectModal from '../components/NewProjectModal'
import ProjectDetailModal from '../components/ProjectDetailModal'
import ViewToggle from '../components/ViewToggle'
import { useLanguage } from '../i18n/LanguageContext'

type SortOption = 'deadline-asc' | 'deadline-desc' | 'volume-desc' | 'billing-desc' | 'progress-desc'

const disciplines = ['Alle', 'Straße', 'Wasser', 'RA', 'Vermessung'] as const
const statuses = ['Alle', 'In Bearbeitung', 'Warten', 'Nicht begonnen', 'Abgeschlossen', 'Überfällig'] as const

const kanbanColumns: { id: Project['status']; title: string; color: string }[] = [
  { id: 'Nicht begonnen', title: 'status.Nicht begonnen', color: 'bg-gray-400' },
  { id: 'In Bearbeitung', title: 'status.In Bearbeitung', color: 'bg-blue-400' },
  { id: 'Warten', title: 'status.Warten', color: 'bg-yellow-400' },
  { id: 'Überfällig', title: 'status.Überfällig', color: 'bg-red-400' },
  { id: 'Abgeschlossen', title: 'status.Abgeschlossen', color: 'bg-green-400' },
]

function Projekte() {
  const { t, dateLocale } = useLanguage()

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'deadline-asc', label: t('projects.deadlineAsc') },
    { value: 'deadline-desc', label: t('projects.deadlineDesc') },
    { value: 'volume-desc', label: t('projects.volumeDesc') },
    { value: 'billing-desc', label: t('projects.billingDesc') },
    { value: 'progress-desc', label: t('projects.progressDesc') },
  ]

  const { projects, loading, refetch, update, patch } = useProjects()

  const [searchQuery, setSearchQuery] = useState('')
  const [filterDiscipline, setFilterDiscipline] = useState<string>('Alle')
  const [filterStatus, setFilterStatus] = useState<string>('Alle')
  const [sortOption, setSortOption] = useState<SortOption>('deadline-asc')
  const [showStats, setShowStats] = useState(false)
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list')
  const [draggedProject, setDraggedProject] = useState<Project | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)

  const filteredProjects = useMemo(() => {
    let result = [...projects]

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

    if (filterDiscipline !== 'Alle') {
      result = result.filter(p => p.discipline === filterDiscipline)
    }

    if (filterStatus !== 'Alle') {
      result = result.filter(p => p.status === filterStatus)
    }

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

  const summary = useMemo(() => {
    const totalVolume = projects.reduce((sum, p) => sum + p.projectVolume, 0)
    const totalInvoiced = projects.reduce((sum, p) => sum + p.invoicedAmount, 0)
    const avgBilling = totalVolume > 0 ? (totalInvoiced / totalVolume) * 100 : 0
    const overdueCount = projects.filter(p => p.status === 'Überfällig' || getDeadlineStatus(p.deadline) === 'overdue').length

    return { totalVolume, totalInvoiced, avgBilling, overdueCount, totalCount: projects.length }
  }, [projects])

  if (loading) return <LoadingSpinner />

  const resetFilters = () => {
    setSearchQuery('')
    setFilterDiscipline('Alle')
    setFilterStatus('Alle')
    setSortOption('deadline-asc')
  }

  const hasActiveFilters = searchQuery || filterDiscipline !== 'Alle' || filterStatus !== 'Alle'

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Bearbeitung': return 'bg-blue-50 text-blue-600'
      case 'Überfällig': return 'bg-red-50 text-red-600'
      case 'Warten': return 'bg-yellow-50 text-yellow-600'
      case 'Nicht begonnen': return 'bg-gray-100 text-gray-600'
      case 'Abgeschlossen': return 'bg-green-50 text-green-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  const getDisciplineDotColor = (discipline: string) => {
    switch (discipline) {
      case 'Straße': return 'bg-orange-400'
      case 'Wasser': return 'bg-cyan-400'
      case 'RA': return 'bg-purple-400'
      case 'Vermessung': return 'bg-emerald-400'
      default: return 'bg-gray-400'
    }
  }

  const getDeadlineBadge = (deadline: string) => {
    const status = getDeadlineStatus(deadline)
    switch (status) {
      case 'overdue': return { color: 'text-red-500', label: t('deadline.overdue') }
      case 'urgent': return { color: 'text-red-500', label: t('deadline.urgent') }
      case 'soon': return { color: 'text-yellow-600', label: t('deadline.soon') }
      default: return { color: 'text-green-600', label: t('deadline.onTrack') }
    }
  }

  const getBillingBarColor = (billingProgress: number) => {
    if (billingProgress > 100) return 'bg-red-500'
    if (billingProgress >= 80) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getProgressBarColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500'
    if (progress >= 50) return 'bg-brand'
    return 'bg-yellow-500'
  }

  const handleCreateProject = async (projectData: Parameters<typeof createProject>[0]) => {
    await createProject(projectData)
    refetch()
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(dateLocale, {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    })
  }

  // Kanban drag-and-drop handlers
  const handleDragStart = (project: Project) => {
    setDraggedProject(project)
  }

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    setDragOverColumn(columnId)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = (newStatus: Project['status']) => {
    if (!draggedProject || draggedProject.status === newStatus) {
      setDraggedProject(null)
      setDragOverColumn(null)
      return
    }

    const updates: Partial<Project> = { status: newStatus }
    if (newStatus === 'Abgeschlossen') {
      updates.progress = 100
    }

    update(draggedProject.id, updates)
    setDraggedProject(null)
    setDragOverColumn(null)
  }

  return (
    <div className={viewMode === 'kanban' ? 'flex flex-col h-full -m-6' : 'space-y-6'}>
      {/* Stats */}
      {viewMode === 'kanban' ? (
        <div className="px-6 pt-6 pb-4 border-b border-gray-100 space-y-4">
          {showStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white rounded-lg border border-gray-100 px-4 py-2.5 flex items-center gap-2.5">
                <FolderOpen className="text-gray-400 shrink-0" size={16} />
                <p className="text-xs text-gray-500">{t('projects.projects')}</p>
                <p className="text-lg font-semibold text-[#333] ml-auto">{summary.totalCount}</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-100 px-4 py-2.5 flex items-center gap-2.5">
                <Euro className="text-gray-400 shrink-0" size={16} />
                <p className="text-xs text-gray-500">{t('projects.totalVolume')}</p>
                <p className="text-lg font-semibold text-[#333] ml-auto">{formatCurrency(summary.totalVolume)}</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-100 px-4 py-2.5 flex items-center gap-2.5">
                <TrendingUp className="text-gray-400 shrink-0" size={16} />
                <p className="text-xs text-gray-500">{t('projects.avgBilling')}</p>
                <p className="text-lg font-semibold text-[#333] ml-auto">{summary.avgBilling.toFixed(1)}%</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-100 px-4 py-2.5 flex items-center gap-2.5">
                <AlertTriangle className="text-gray-400 shrink-0" size={16} />
                <p className="text-xs text-gray-500">{t('projects.overdue')}</p>
                <p className="text-lg font-semibold text-[#333] ml-auto">{summary.overdueCount}</p>
              </div>
            </div>
          )}

          {/* Search & Filters */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('projects.searchPlaceholder')}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brand/30 focus:border-brand/40 focus:bg-white transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <CustomSelect
                variant="filter"
                value={filterDiscipline}
                onChange={setFilterDiscipline}
                options={disciplines.map(d => ({
                  value: d,
                  label: d === 'Alle' ? t('projects.allDisciplines') : t(`discipline.${d}`),
                }))}
              />

              <CustomSelect
                variant="filter"
                value={filterStatus}
                onChange={setFilterStatus}
                options={statuses.map(s => ({
                  value: s,
                  label: s === 'Alle' ? t('projects.allStatus') : t(`status.${s}`),
                }))}
              />

              <CustomSelect
                variant="filter"
                value={sortOption}
                onChange={(v) => setSortOption(v as SortOption)}
                options={sortOptions}
              />

              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-[#333] hover:bg-gray-50 rounded-lg transition-colors text-sm font-medium"
                >
                  <RotateCcw size={16} />
                  {t('projects.resetFilters')}
                </button>
              )}

              <div className="ml-auto flex items-center gap-3">
                <span className="text-sm text-gray-500">
                  {filteredProjects.length} {t('projects.ofProjects')} {projects.length} {t('projects.projectsLabel')}
                </span>
                <ViewToggle view={viewMode} onChange={setViewMode} />
                <button
                  onClick={() => setShowStats(prev => !prev)}
                  className={`p-2 rounded-lg transition-colors ${showStats ? 'bg-brand/10 text-brand' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                  title="Toggle stats"
                >
                  <BarChart3 size={18} />
                </button>
                <button
                  onClick={() => setShowNewProjectModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors text-sm font-medium"
                >
                  <Plus size={18} />
                  {t('newProject.title')}
                </button>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{t('projects.projects')}</h2>
            <p className="text-sm text-gray-400">{t('projects.dragHint')}</p>
          </div>
        </div>
      ) : (
        <>
          {showStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white rounded-lg border border-gray-100 px-4 py-2.5 flex items-center gap-2.5">
                <FolderOpen className="text-gray-400 shrink-0" size={16} />
                <p className="text-xs text-gray-500">{t('projects.projects')}</p>
                <p className="text-lg font-semibold text-[#333] ml-auto">{summary.totalCount}</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-100 px-4 py-2.5 flex items-center gap-2.5">
                <Euro className="text-gray-400 shrink-0" size={16} />
                <p className="text-xs text-gray-500">{t('projects.totalVolume')}</p>
                <p className="text-lg font-semibold text-[#333] ml-auto">{formatCurrency(summary.totalVolume)}</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-100 px-4 py-2.5 flex items-center gap-2.5">
                <TrendingUp className="text-gray-400 shrink-0" size={16} />
                <p className="text-xs text-gray-500">{t('projects.avgBilling')}</p>
                <p className="text-lg font-semibold text-[#333] ml-auto">{summary.avgBilling.toFixed(1)}%</p>
              </div>
              <div className="bg-white rounded-lg border border-gray-100 px-4 py-2.5 flex items-center gap-2.5">
                <AlertTriangle className="text-gray-400 shrink-0" size={16} />
                <p className="text-xs text-gray-500">{t('projects.overdue')}</p>
                <p className="text-lg font-semibold text-[#333] ml-auto">{summary.overdueCount}</p>
              </div>
            </div>
          )}

          {/* Search & Filters */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('projects.searchPlaceholder')}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-brand/30 focus:border-brand/40 focus:bg-white transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <CustomSelect
                variant="filter"
                value={filterDiscipline}
                onChange={setFilterDiscipline}
                options={disciplines.map(d => ({
                  value: d,
                  label: d === 'Alle' ? t('projects.allDisciplines') : t(`discipline.${d}`),
                }))}
              />

              <CustomSelect
                variant="filter"
                value={filterStatus}
                onChange={setFilterStatus}
                options={statuses.map(s => ({
                  value: s,
                  label: s === 'Alle' ? t('projects.allStatus') : t(`status.${s}`),
                }))}
              />

              <CustomSelect
                variant="filter"
                value={sortOption}
                onChange={(v) => setSortOption(v as SortOption)}
                options={sortOptions}
              />

              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-[#333] hover:bg-gray-50 rounded-lg transition-colors text-sm font-medium"
                >
                  <RotateCcw size={16} />
                  {t('projects.resetFilters')}
                </button>
              )}

              <div className="ml-auto flex items-center gap-3">
                <span className="text-sm text-gray-500">
                  {filteredProjects.length} {t('projects.ofProjects')} {projects.length} {t('projects.projectsLabel')}
                </span>
                <ViewToggle view={viewMode} onChange={setViewMode} />
                <button
                  onClick={() => setShowStats(prev => !prev)}
                  className={`p-2 rounded-lg transition-colors ${showStats ? 'bg-brand/10 text-brand' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
                  title="Toggle stats"
                >
                  <BarChart3 size={18} />
                </button>
                <button
                  onClick={() => setShowNewProjectModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors text-sm font-medium"
                >
                  <Plus size={18} />
                  {t('newProject.title')}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <>
          {filteredProjects.length > 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 overflow-x-auto shadow-sm">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider min-w-[260px] sticky left-0 z-20 bg-gray-50 sticky-shadow">{t('projects.colProjectName')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('projects.colDiscipline')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider min-w-[160px]">{t('projects.colPM')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('projects.colStatus')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('projects.colDeadline')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('projects.colProgress')}</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">{t('projects.colVolume')}</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">{t('projects.colInvoiced')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('projects.colBilling')}</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                        <FileText size={14} className="inline" />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">{t('projects.colProjectNo')}</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredProjects.map((project) => {
                      const billingProgress = calculateBillingProgress(project)
                      const deadlineBadge = getDeadlineBadge(project.deadline)

                      return (
                        <tr
                          key={project.id}
                          onClick={() => setSelectedProject(project)}
                          className="hover:bg-gray-50 transition-colors cursor-pointer group"
                        >
                          <td className="px-4 py-3.5 min-w-[260px] sticky left-0 z-10 bg-white group-hover:bg-gray-50 sticky-shadow border-l-2 border-transparent group-hover:border-brand">
                            <p className="font-medium text-[#333]">{project.title}</p>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className={`w-1.5 h-1.5 rounded-full ${getDisciplineDotColor(project.discipline)}`} />
                              <span className="text-sm text-gray-600">{t(`discipline.${project.discipline}`)}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-sm text-gray-600 whitespace-nowrap">{project.projectManager}</td>
                          <td className="px-4 py-3.5">
                            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusColor(project.status)}`}>
                              {t(`status.${project.status}`)}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex flex-col gap-1">
                              <span className="text-sm text-gray-600">
                                {new Date(project.deadline).toLocaleDateString(dateLocale)}
                              </span>
                              <span className={`text-xs font-medium ${deadlineBadge.color}`}>
                                {deadlineBadge.label}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${getProgressBarColor(project.progress)}`}
                                  style={{ width: `${project.progress}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-600 w-8">{project.progress}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <span className="text-sm font-medium text-[#333]">{formatCurrency(project.projectVolume)}</span>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex flex-col items-end">
                              <span className={`text-sm font-medium ${billingProgress > 100 ? 'text-red-600' : 'text-[#333]'}`}>
                                {formatCurrency(project.invoicedAmount)}
                              </span>
                              {billingProgress > 100 && (
                                <span className="text-xs px-1.5 py-0.5 bg-red-50 text-red-600 rounded mt-1">{t('projects.overBudget')}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
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
                          <td className="px-4 py-3.5 text-center">
                            {project.notes && (
                              <span title={project.notes} className="text-gray-400 hover:text-gray-600">
                                <FileText size={16} />
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="font-mono text-sm font-medium text-[#333]">{project.projectNumber}</span>
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
                <FolderOpen className="text-gray-400" size={32} />
              </div>
              <h3 className="text-lg font-semibold text-[#333] mb-2">{t('projects.noProjectsFound')}</h3>
              <p className="text-gray-500 mb-6">{t('projects.tryAdjustFilters')}</p>
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors font-medium"
              >
                <RotateCcw size={18} />
                {t('projects.resetFilters')}
              </button>
            </div>
          )}
        </>
      )}

      {/* Kanban View */}
      {viewMode === 'kanban' && (
        <div className="flex-1 overflow-x-auto p-6">
          <div className="flex gap-6 min-w-max h-full">
            {kanbanColumns.map((column) => {
              const columnProjects = filteredProjects.filter(p => p.status === column.id)
              const columnVolume = columnProjects.reduce((sum, p) => sum + p.projectVolume, 0)
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
                        <h3 className="font-semibold text-[#333]">{t(column.title as any)}</h3>
                      </div>
                      <span className="text-sm font-medium text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                        {columnProjects.length}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{formatCurrency(columnVolume)}</p>
                  </div>

                  <div
                    className={`flex-1 rounded-b-xl p-3 min-h-[400px] transition-all border-2 ${
                      isDragOver
                        ? 'border-brand bg-brand/5'
                        : 'border-transparent bg-gray-50/50'
                    }`}
                  >
                    <div className="space-y-3">
                      {columnProjects.map((project) => {
                        const deadlineBadge = getDeadlineBadge(project.deadline)

                        return (
                          <div
                            key={project.id}
                            draggable
                            onDragStart={() => handleDragStart(project)}
                            onClick={() => setSelectedProject(project)}
                            className={`bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:border-gray-300 transition-all ${
                              draggedProject?.id === project.id ? 'opacity-50 scale-95' : ''
                            }`}
                          >
                            {/* Row 1: Project number + discipline */}
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-mono text-xs font-semibold text-gray-500">{project.projectNumber}</span>
                              <div className="flex items-center gap-1.5">
                                <div className={`w-2 h-2 rounded-full ${getDisciplineDotColor(project.discipline)}`} />
                                <span className="text-xs text-gray-500">{t(`discipline.${project.discipline}`)}</span>
                              </div>
                            </div>

                            {/* Row 2: Title */}
                            <h4 className="font-semibold text-[#333] text-sm mb-2.5 line-clamp-2">{project.title}</h4>

                            {/* Row 3: Progress bar */}
                            <div className="flex items-center gap-2 mb-3">
                              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${getProgressBarColor(project.progress)}`}
                                  style={{ width: `${project.progress}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium text-gray-600 w-8">{project.progress}%</span>
                            </div>

                            {/* Row 4: Deadline + Volume */}
                            <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                              <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1">
                                  <Calendar size={12} />
                                  {formatDate(project.deadline)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Euro size={12} />
                                  {formatCurrency(project.projectVolume)}
                                </span>
                              </div>
                            </div>

                            {/* Row 5: PM + deadline badge */}
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs font-medium text-gray-600">{project.projectManager}</span>
                              <span className={`text-xs font-medium ${deadlineBadge.color}`}>
                                {deadlineBadge.label}
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {columnProjects.length === 0 && (
                      <div className={`h-32 flex items-center justify-center border-2 border-dashed rounded-lg transition-colors ${
                        isDragOver ? 'border-brand bg-brand/10' : 'border-gray-300'
                      }`}>
                        <p className="text-sm text-gray-400">
                          {isDragOver ? t('projects.dropHere') : t('projects.noProjectsFound')}
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

      {showNewProjectModal && (
        <NewProjectModal
          onClose={() => setShowNewProjectModal(false)}
          onSave={handleCreateProject}
        />
      )}

      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onUpdate={(updated) => {
            setSelectedProject(updated)
            patch(updated.id, updated)
          }}
        />
      )}
    </div>
  )
}

export default Projekte
