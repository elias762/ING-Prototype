import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  User,
  FileText,
  TrendingUp,
  Euro,
  AlertTriangle,
  CheckCircle,
  CalendarPlus,
  PlusCircle,
  X
} from 'lucide-react'
import {
  formatCurrency,
  calculateBillingProgress,
  getDeadlineStatus,
} from '../data/mockData'
import { useProject } from '../hooks/useProjects'
import LoadingSpinner from '../components/LoadingSpinner'
import { useLanguage } from '../i18n/LanguageContext'

function ProjektDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t, dateLocale } = useLanguage()

  const { project, loading, update } = useProject(id)
  const [showInvoiceInput, setShowInvoiceInput] = useState(false)
  const [invoiceAmount, setInvoiceAmount] = useState('')

  if (loading) return <LoadingSpinner />

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-500 mb-4">{t('projectDetail.projectNotFound')}</p>
          <Link to="/projekte" className="text-brand hover:text-brand-hover font-medium">
            {t('projectDetail.backToList')}
          </Link>
        </div>
      </div>
    )
  }

  const billingProgress = calculateBillingProgress(project)
  const deadlineStatus = getDeadlineStatus(project.deadline)
  const remainingBudget = project.projectVolume - project.invoicedAmount

  const handleCompleteProject = () => {
    update({
      status: 'Abgeschlossen',
      progress: 100
    })
  }

  const handleExtendDeadline = () => {
    const currentDeadline = new Date(project.deadline)
    currentDeadline.setDate(currentDeadline.getDate() + 7)
    update({
      deadline: currentDeadline.toISOString().split('T')[0]
    })
  }

  const handleAddInvoice = () => {
    const amount = parseFloat(invoiceAmount.replace(',', '.'))
    if (!isNaN(amount) && amount > 0) {
      update({
        invoicedAmount: project.invoicedAmount + amount
      })
      setInvoiceAmount('')
      setShowInvoiceInput(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Bearbeitung': return 'bg-blue-50 text-blue-600 border-blue-200'
      case 'Überfällig': return 'bg-red-50 text-red-600 border-red-200'
      case 'Warten': return 'bg-yellow-50 text-yellow-600 border-yellow-200'
      case 'Nicht begonnen': return 'bg-gray-100 text-gray-600 border-gray-200'
      case 'Abgeschlossen': return 'bg-green-50 text-green-600 border-green-200'
      default: return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  const getDisciplineColor = (discipline: string) => {
    switch (discipline) {
      case 'Straße': return 'bg-orange-50 text-orange-600 border-orange-200'
      case 'Wasser': return 'bg-cyan-50 text-cyan-600 border-cyan-200'
      case 'RA': return 'bg-purple-50 text-purple-600 border-purple-200'
      case 'Vermessung': return 'bg-emerald-50 text-emerald-600 border-emerald-200'
      default: return 'bg-gray-100 text-gray-600 border-gray-200'
    }
  }

  const getDeadlineBadge = () => {
    if (!project.deadline) return { color: 'bg-gray-100 text-gray-600', label: t('deadline.noDefined') }

    switch (deadlineStatus) {
      case 'overdue': return { color: 'text-red-500', label: t('deadline.overdue') }
      case 'urgent': return { color: 'text-red-500', label: t('deadline.urgent') }
      case 'soon': return { color: 'text-yellow-600', label: t('deadline.soon') }
      default: return { color: 'text-green-600', label: t('deadline.onTrack') }
    }
  }

  const getBillingBarColor = () => {
    if (billingProgress > 100) return 'bg-red-500'
    if (billingProgress >= 80) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getProgressBarColor = () => {
    if (project.progress >= 80) return 'bg-green-500'
    if (project.progress >= 50) return 'bg-brand'
    return 'bg-yellow-500'
  }

  const deadlineBadge = getDeadlineBadge()

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <button
        onClick={() => navigate('/projekte')}
        className="flex items-center gap-2 text-gray-600 hover:text-[#333] transition-colors font-medium"
      >
        <ArrowLeft size={20} />
        {t('projectDetail.backToList')}
      </button>

      {/* Project Header */}
      <div className="bg-white rounded-xl border border-gray-100 p-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className={`px-3 py-1.5 text-sm font-medium rounded-full border ${getDisciplineColor(project.discipline)}`}>
                {t(`discipline.${project.discipline}`)}
              </span>
              <span className={`px-3 py-1.5 text-sm font-medium rounded-full border ${getStatusColor(project.status)}`}>
                {t(`status.${project.status}`)}
              </span>
            </div>

            <p className="font-mono text-lg text-gray-500 mb-2">{project.projectNumber}</p>
            <h1 className="text-2xl font-semibold text-[#333] mb-4">{project.title}</h1>

            <div className="flex items-center gap-2 text-gray-600">
              <User size={18} />
              <span>{t('projectDetail.projectManager')}: <strong>{project.projectManager}</strong></span>
            </div>
          </div>

          <div className="lg:text-right">
            <p className="text-sm text-gray-500 mb-1">{t('projectDetail.projectProgress')}</p>
            <p className="text-4xl font-semibold text-[#333]">{project.progress}%</p>
            <div className="w-48 h-1.5 bg-gray-100 rounded-full overflow-hidden mt-3">
              <div
                className={`h-full rounded-full transition-all ${getProgressBarColor()}`}
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Operational Status */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-6 flex items-center gap-2">
            <TrendingUp size={16} className="text-gray-400" />
            {t('projectDetail.operationalStatus')}
          </h2>

          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-500 mb-2">{t('projectDetail.currentStatus')}</p>
              <span className={`inline-block px-4 py-2 text-sm font-semibold rounded-lg border ${getStatusColor(project.status)}`}>
                {t(`status.${project.status}`)}
              </span>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-2">{t('projectDetail.deadline')}</p>
              <div className="flex items-center gap-3">
                <Calendar size={20} className="text-gray-400" />
                <span className="text-lg font-semibold text-[#333]">
                  {project.deadline
                    ? new Date(project.deadline).toLocaleDateString(dateLocale, {
                        weekday: 'long',
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })
                    : t('deadline.noDefined')
                  }
                </span>
              </div>
              <span className={`inline-block mt-2 text-xs font-semibold ${deadlineBadge.color}`}>
                {deadlineBadge.label}
              </span>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-500">{t('projectDetail.projectProgress')}</p>
                <span className="text-lg font-bold text-[#333]">{project.progress}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${getProgressBarColor()}`}
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Project Controlling */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-6 flex items-center gap-2">
            <Euro size={16} className="text-gray-400" />
            {t('projectDetail.projectControlling')}
          </h2>

          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">{t('projectDetail.projectVolume')}</p>
                <p className="text-2xl font-bold text-[#333]">{formatCurrency(project.projectVolume)}</p>
              </div>
            </div>

            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">{t('projectDetail.alreadyInvoiced')}</p>
                <div className="flex items-center gap-3">
                  <p className={`text-2xl font-bold ${billingProgress > 100 ? 'text-red-600' : 'text-[#333]'}`}>
                    {formatCurrency(project.invoicedAmount)}
                  </p>
                  {billingProgress > 100 && (
                    <span className="px-2 py-1 text-xs font-semibold bg-red-50 text-red-600 rounded-full flex items-center gap-1">
                      <AlertTriangle size={12} />
                      {t('projectDetail.overBudget')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">{t('projectDetail.remainingBudget')}</p>
                <p className={`text-2xl font-bold ${remainingBudget < 0 ? 'text-red-600' : 'text-[#333]'}`}>
                  {formatCurrency(Math.max(0, remainingBudget))}
                  {remainingBudget < 0 && (
                    <span className="text-sm font-normal ml-2">({formatCurrency(remainingBudget)})</span>
                  )}
                </p>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-500">{t('projectDetail.billingStatus')}</p>
                <span className={`text-lg font-bold ${billingProgress > 100 ? 'text-red-600' : 'text-[#333]'}`}>
                  {billingProgress.toFixed(1)}%
                </span>
              </div>
              {project.projectVolume > 0 ? (
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${getBillingBarColor()}`}
                    style={{ width: `${Math.min(billingProgress, 100)}%` }}
                  />
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">{t('projectDetail.noBudget')}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Description & Notes */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-4 flex items-center gap-2">
          <FileText size={16} className="text-gray-400" />
          {t('projectDetail.descriptionNotes')}
        </h2>

        {project.notes ? (
          <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
            <div className="rich-text text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: project.notes }} />
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-5 border border-gray-100 text-center">
            <p className="text-gray-500 italic">{t('projectDetail.noInfo')}</p>
          </div>
        )}
      </div>

      {/* Demo Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-2">{t('projectDetail.demoActions')}</h2>
        <p className="text-gray-500 text-sm mb-6">{t('projectDetail.demoDescription')}</p>

        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleCompleteProject}
            disabled={project.status === 'Abgeschlossen'}
            className={`flex items-center gap-2 px-5 py-3 rounded-lg font-medium transition-all ${
              project.status === 'Abgeschlossen'
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle size={20} />
            {t('projectDetail.completeProject')}
          </button>

          <button
            onClick={handleExtendDeadline}
            className="flex items-center gap-2 px-5 py-3 bg-yellow-50 text-yellow-600 border border-yellow-200 hover:bg-yellow-100 rounded-lg font-medium transition-all"
          >
            <CalendarPlus size={20} />
            {t('projectDetail.extendDeadline')}
          </button>

          {!showInvoiceInput ? (
            <button
              onClick={() => setShowInvoiceInput(true)}
              className="flex items-center gap-2 px-5 py-3 bg-brand/10 text-brand border border-brand/20 hover:bg-brand/20 rounded-lg font-medium transition-all"
            >
              <PlusCircle size={20} />
              {t('projectDetail.addInvoice')}
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-2">
              <input
                type="text"
                value={invoiceAmount}
                onChange={(e) => setInvoiceAmount(e.target.value)}
                placeholder={t('projectDetail.amountEur')}
                className="w-32 px-3 py-2 bg-white text-[#333] placeholder-gray-400 rounded-lg text-sm border border-gray-200 focus:outline-none focus:ring-1 focus:ring-brand/30"
                autoFocus
              />
              <button
                onClick={handleAddInvoice}
                className="px-4 py-2 bg-brand hover:bg-brand-hover text-white rounded-lg font-medium transition-all"
              >
                {t('projectDetail.add')}
              </button>
              <button
                onClick={() => {
                  setShowInvoiceInput(false)
                  setInvoiceAmount('')
                }}
                className="p-2 text-gray-400 hover:text-[#333] transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          )}
        </div>

        {project.status === 'Abgeschlossen' && (
          <p className="mt-4 text-green-600 text-sm flex items-center gap-2">
            <CheckCircle size={16} />
            {t('projectDetail.projectCompleted')}
          </p>
        )}
      </div>
    </div>
  )
}

export default ProjektDetail
