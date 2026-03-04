import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Euro,
  FolderOpen,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  Filter,
  Calendar,
  User
} from 'lucide-react'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, RadialBarChart, RadialBar, Legend
} from 'recharts'
import {
  formatCurrency,
  getDeadlineStatus
} from '../data/mockData'
import { useProjects } from '../hooks/useProjects'
import { useOffers } from '../hooks/useOffers'
import LoadingSpinner from '../components/LoadingSpinner'
import { useLanguage } from '../i18n/LanguageContext'

type QuickFilter = 'all' | 'critical' | 'my-projects'

const STATUS_COLORS: Record<string, string> = {
  'In Bearbeitung': '#3B82F6',
  'Warten': '#F59E0B',
  'Überfällig': '#EF4444',
  'Nicht begonnen': '#9CA3AF',
  'Abgeschlossen': '#01B593',
}

const DISCIPLINE_COLORS: Record<string, string> = {
  'Straße': '#FB923C',
  'Wasser': '#22D3EE',
  'RA': '#A78BFA',
  'Vermessung': '#34D399',
}

const PHASE_COLORS: Record<string, string> = {
  'Anfrage': '#9CA3AF',
  'Analyse': '#60A5FA',
  'Vorbereitung': '#FBBF24',
  'Abgabe': '#34D399',
}

function Dashboard() {
  const navigate = useNavigate()
  const { t, dateLocale } = useLanguage()
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all')

  const { projects: allProjects, loading: loadingProjects } = useProjects()
  const { offers: allOffers, loading: loadingOffers } = useOffers()

  if (loadingProjects || loadingOffers) return <LoadingSpinner />

  const projects = (() => {
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
  })()

  const offers = quickFilter === 'critical'
    ? allOffers.filter(o => {
        const diffDays = Math.ceil((new Date(o.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
        return diffDays <= 30
      })
    : allOffers

  // KPIs — always computed from allProjects/allOffers
  const totalVolume = allProjects.reduce((sum, p) => sum + p.projectVolume, 0)
  const totalInvoiced = allProjects.reduce((sum, p) => sum + p.invoicedAmount, 0)
  const invoicedPercent = totalVolume > 0 ? (totalInvoiced / totalVolume) * 100 : 0
  const activeProjects = allProjects.filter(p => p.status !== 'Abgeschlossen').length

  const criticalDeadlines = (() => {
    const critProjects = allProjects.filter(p => {
      const s = getDeadlineStatus(p.deadline)
      return s === 'overdue' || s === 'urgent'
    }).length
    const critOffers = allOffers.filter(o => {
      const diffDays = Math.ceil((new Date(o.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      return diffDays <= 14
    }).length
    return critProjects + critOffers
  })()

  // Chart data — status distribution
  const statusData = (() => {
    const statuses = ['In Bearbeitung', 'Warten', 'Überfällig', 'Nicht begonnen', 'Abgeschlossen'] as const
    return statuses.map(s => ({
      name: t(`status.${s}`),
      value: projects.filter(p => p.status === s).length,
      fill: STATUS_COLORS[s],
    })).filter(d => d.value > 0)
  })()

  // Chart data — discipline volume
  const disciplineData = (() => {
    const disciplines = ['Straße', 'Wasser', 'RA', 'Vermessung'] as const
    return disciplines.map(d => ({
      name: t(`discipline.${d}`),
      volume: Math.round(projects.filter(p => p.discipline === d).reduce((sum, p) => sum + p.projectVolume, 0) / 1000),
      fill: DISCIPLINE_COLORS[d],
    })).filter(d => d.volume > 0)
  })()

  // Chart data — offer pipeline
  const pipelineData = (() => {
    const phases = ['Anfrage', 'Analyse', 'Vorbereitung', 'Abgabe'] as const
    return phases.map(p => ({
      name: t(`phase.${p}`),
      count: offers.filter(o => o.phase === p).length,
      fill: PHASE_COLORS[p],
    }))
  })()

  // Upcoming deadlines
  const upcomingDeadlines = [...projects]
    .filter(p => p.status !== 'Abgeschlossen')
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 6)

  // Critical offers
  const criticalOffers = [...offers]
    .filter(o => {
      if (o.phase === 'Abgabe') return false
      const diffDays = Math.ceil((new Date(o.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      return diffDays <= 30
    })
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 6)

  const getDeadlineBadge = (deadline: string) => {
    const status = getDeadlineStatus(deadline)
    switch (status) {
      case 'overdue': return { color: 'text-red-500', bg: 'bg-red-50', label: t('deadline.overdue') }
      case 'urgent': return { color: 'text-red-500', bg: 'bg-red-50', label: t('deadline.urgent') }
      case 'soon': return { color: 'text-yellow-600', bg: 'bg-yellow-50', label: t('deadline.soon') }
      default: return { color: 'text-green-600', bg: 'bg-green-50', label: t('deadline.onTrack') }
    }
  }

  const getOfferDeadlineBadge = (dueDate: string) => {
    const diffDays = Math.ceil((new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays < 0) return { color: 'text-red-500', label: t('deadline.overdue') }
    if (diffDays <= 7) return { color: 'text-red-500', label: t('deadline.urgent') }
    if (diffDays <= 30) return { color: 'text-yellow-600', label: t('deadline.soon') }
    return { color: 'text-green-600', label: t('deadline.onTrack') }
  }

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'Anfrage': return 'bg-gray-100 text-gray-600'
      case 'Analyse': return 'bg-blue-50 text-blue-600'
      case 'Vorbereitung': return 'bg-yellow-50 text-yellow-600'
      case 'Abgabe': return 'bg-green-50 text-green-600'
      default: return 'bg-gray-100 text-gray-600'
    }
  }

  // Billing gauge data for radial chart
  const billingGaugeData = [
    { name: t('dashboard.billingRate'), value: Math.round(invoicedPercent), fill: '#01B593' },
  ]

  return (
    <div className="space-y-6">
      {/* Row 0 — Quick Filters */}
      <div className="bg-white rounded-xl border border-gray-100 px-5 py-3 flex items-center gap-3">
        <Filter size={18} className="text-gray-400" />
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 mr-1">{t('dashboard.quickFilter')}</span>
        <div className="flex gap-2">
          {([
            { id: 'all' as const, label: t('dashboard.allProjects') },
            { id: 'my-projects' as const, label: t('dashboard.myProjects') },
            { id: 'critical' as const, label: t('dashboard.criticalOnly') },
          ]).map(filter => (
            <button
              key={filter.id}
              onClick={() => setQuickFilter(filter.id)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                quickFilter === filter.id
                  ? 'bg-brand text-white'
                  : 'text-gray-500 hover:text-[#333] hover:bg-gray-50'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        {quickFilter !== 'all' && (
          <span className="text-sm text-gray-500 ml-auto">
            {projects.length} {t('dashboard.projectsCount')}, {offers.length} {t('dashboard.offersCount')}
          </span>
        )}
      </div>

      {/* Row 1 — 4 KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Project Volume */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 border-l-4 border-l-brand">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
              <Euro size={16} className="text-brand" />
            </div>
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400">{t('dashboard.projectVolume')}</span>
          </div>
          <p className="text-2xl font-semibold text-[#333]">{formatCurrency(totalVolume)}</p>
          <p className="text-xs text-gray-400 mt-1">{t('dashboard.sumAllProjects')}</p>
        </div>

        {/* Invoiced */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 border-l-4 border-l-green-500">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <TrendingUp size={16} className="text-green-500" />
            </div>
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400">{t('dashboard.invoiced')}</span>
          </div>
          <p className="text-2xl font-semibold text-[#333]">{formatCurrency(totalInvoiced)}</p>
          <p className="text-xs text-gray-400 mt-1">{invoicedPercent.toFixed(1)}% {t('dashboard.ofVolume')}</p>
        </div>

        {/* Active Projects */}
        <div className="bg-white rounded-xl border border-gray-100 p-5 border-l-4 border-l-blue-500">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <FolderOpen size={16} className="text-blue-500" />
            </div>
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400">{t('dashboard.activeProjects')}</span>
          </div>
          <p className="text-2xl font-semibold text-[#333]">{activeProjects} <span className="text-base font-normal text-gray-400">/ {allProjects.length}</span></p>
          <p className="text-xs text-gray-400 mt-1">{t('dashboard.ofTotal')}</p>
        </div>

        {/* Critical Deadlines */}
        <div className={`bg-white rounded-xl border border-gray-100 p-5 border-l-4 ${criticalDeadlines > 0 ? 'border-l-red-500' : 'border-l-gray-200'}`}>
          <div className="flex items-center gap-2 mb-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${criticalDeadlines > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
              <AlertTriangle size={16} className={criticalDeadlines > 0 ? 'text-red-500' : 'text-gray-400'} />
            </div>
            <span className="text-xs font-medium uppercase tracking-wide text-gray-400">{t('dashboard.critical')}</span>
          </div>
          <p className={`text-2xl font-semibold ${criticalDeadlines > 0 ? 'text-red-500' : 'text-[#333]'}`}>{criticalDeadlines}</p>
          <p className="text-xs text-gray-400 mt-1">{t('dashboard.deadlinesLess14')}</p>
        </div>
      </div>

      {/* Row 2 — 3 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut — Project Status */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-4">{t('dashboard.projectStatusDistribution')}</h3>
          <div className="relative">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px' }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Center label */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ marginBottom: 30 }}>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#333]">{projects.length}</p>
                <p className="text-xs text-gray-400">{t('dashboard.projectsCount')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Vertical Bar — Discipline Volume */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{t('dashboard.projectsByDiscipline')}</h3>
            <span className="text-xs text-gray-400">in k&euro;</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={disciplineData} barCategoryGap="25%">
              <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px' }}
                formatter={(value: number | undefined) => [`${value ?? 0}k`, 'Volume']}
              />
              <Bar dataKey="volume" radius={[6, 6, 0, 0]}>
                {disciplineData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Horizontal Bar — Offer Pipeline */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{t('dashboard.offerPipelineStatus')}</h3>
            <Link to="/angebote" className="text-sm text-brand hover:text-brand-hover font-medium">
              {t('dashboard.openPipeline')}
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={pipelineData} layout="vertical" barCategoryGap="25%">
              <XAxis type="number" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={90} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '13px' }}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                {pipelineData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 3 — Deadlines + Billing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Deadlines — 2 cols */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{t('dashboard.upcomingDeadlines')}</h3>
            <Link to="/projekte" className="text-sm text-brand hover:text-brand-hover font-medium flex items-center gap-1">
              {t('dashboard.all')} <ChevronRight size={16} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-medium uppercase tracking-wide text-gray-400 border-b border-gray-100">
                  <th className="px-6 py-3">{t('projects.colProjectNo')}</th>
                  <th className="px-3 py-3">{t('projects.colProjectName')}</th>
                  <th className="px-3 py-3">{t('projects.colPM')}</th>
                  <th className="px-3 py-3">{t('projects.colDeadline')}</th>
                  <th className="px-6 py-3 text-right">{t('projects.colProgress')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {upcomingDeadlines.length > 0 ? upcomingDeadlines.map(project => {
                  const badge = getDeadlineBadge(project.deadline)
                  return (
                    <tr
                      key={project.id}
                      onClick={() => navigate('/projekte')}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">{project.projectNumber}</td>
                      <td className="px-3 py-3 font-medium text-[#333] max-w-[200px] truncate">{project.title}</td>
                      <td className="px-3 py-3 text-gray-500">{project.projectManager}</td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.bg} ${badge.color}`}>
                          {new Date(project.deadline).toLocaleDateString(dateLocale)}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-brand rounded-full"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-8 text-right">{project.progress}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                }) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      {t('dashboard.noDeadlines')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Billing Overview — 1 col */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 flex flex-col">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">{t('dashboard.billingOverview')}</h3>
          <div className="flex-1 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={160}>
              <RadialBarChart
                cx="50%"
                cy="100%"
                innerRadius="80%"
                outerRadius="100%"
                startAngle={180}
                endAngle={0}
                data={billingGaugeData}
                barSize={14}
              >
                <RadialBar
                  dataKey="value"
                  cornerRadius={8}
                  background={{ fill: '#f3f4f6' }}
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center -mt-6 mb-4">
            <p className="text-3xl font-bold text-[#333]">{invoicedPercent.toFixed(1)}%</p>
            <p className="text-xs text-gray-400">{t('dashboard.billingRate')}</p>
          </div>
          <div className="space-y-2 pt-4 border-t border-gray-100">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{t('dashboard.totalProjectVolume')}</span>
              <span className="font-semibold text-[#333]">{formatCurrency(totalVolume)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{t('dashboard.alreadyInvoiced')}</span>
              <span className="font-semibold text-green-600">{formatCurrency(totalInvoiced)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{t('dashboard.stillOpen')}</span>
              <span className="font-semibold text-yellow-600">{formatCurrency(totalVolume - totalInvoiced)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 4 — Critical Offers */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{t('dashboard.criticalOffers')}</h3>
          <Link to="/angebote" className="text-sm text-brand hover:text-brand-hover font-medium flex items-center gap-1">
            {t('dashboard.pipeline')} <ChevronRight size={16} />
          </Link>
        </div>
        {criticalOffers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {criticalOffers.map(offer => {
              const badge = getOfferDeadlineBadge(offer.dueDate)
              return (
                <div
                  key={offer.id}
                  onClick={() => navigate('/angebote')}
                  className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-md cursor-pointer transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-gray-500 uppercase">{offer.client}</span>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getPhaseColor(offer.phase)}`}>
                      {t(`phase.${offer.phase}`)}
                    </span>
                  </div>
                  <p className="font-medium text-[#333] group-hover:text-brand transition-colors mb-3 truncate">
                    {offer.title}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <User size={12} />
                      {offer.owner}
                    </span>
                    <span>{offer.effortDays} PT</span>
                    <span className="ml-auto flex items-center gap-1">
                      <Calendar size={12} />
                      <span className={`font-medium ${badge.color}`}>
                        {new Date(offer.dueDate).toLocaleDateString(dateLocale)}
                      </span>
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 px-6 py-8 text-center text-gray-500">
            {t('dashboard.noCriticalOffers')}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
