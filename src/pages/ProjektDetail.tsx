import { useState, useEffect } from 'react'
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
  getProjects,
  saveProjects,
  type Project,
  formatCurrency,
  calculateBillingProgress,
  getDeadlineStatus,
  initialProjects
} from '../data/mockData'

function ProjektDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [project, setProject] = useState<Project | null>(null)
  const [showInvoiceInput, setShowInvoiceInput] = useState(false)
  const [invoiceAmount, setInvoiceAmount] = useState('')

  useEffect(() => {
    const allProjects = getProjects()
    // Falls alte Daten ohne projectVolume, nutze initialProjects
    const projects = allProjects.length > 0 && allProjects[0].projectVolume !== undefined
      ? allProjects
      : initialProjects

    const found = projects.find(p => p.id === id)
    if (found) {
      setProject(found)
    }
  }, [id])

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Projekt nicht gefunden</p>
          <Link to="/projekte" className="text-blue-600 hover:text-blue-700 font-medium">
            Zurück zur Projektliste
          </Link>
        </div>
      </div>
    )
  }

  const billingProgress = calculateBillingProgress(project)
  const deadlineStatus = getDeadlineStatus(project.deadline)
  const remainingBudget = project.projectVolume - project.invoicedAmount

  // Update project in localStorage
  const updateProject = (updates: Partial<Project>) => {
    const allProjects = getProjects()
    const projects = allProjects.length > 0 && allProjects[0].projectVolume !== undefined
      ? allProjects
      : initialProjects

    const updatedProjects = projects.map(p =>
      p.id === project.id ? { ...p, ...updates } : p
    )
    saveProjects(updatedProjects)
    setProject({ ...project, ...updates })
  }

  // Quick Actions
  const handleCompleteProject = () => {
    updateProject({
      status: 'Abgeschlossen',
      progress: 100
    })
  }

  const handleExtendDeadline = () => {
    const currentDeadline = new Date(project.deadline)
    currentDeadline.setDate(currentDeadline.getDate() + 7)
    updateProject({
      deadline: currentDeadline.toISOString().split('T')[0]
    })
  }

  const handleAddInvoice = () => {
    const amount = parseFloat(invoiceAmount.replace(',', '.'))
    if (!isNaN(amount) && amount > 0) {
      updateProject({
        invoicedAmount: project.invoicedAmount + amount
      })
      setInvoiceAmount('')
      setShowInvoiceInput(false)
    }
  }

  // Helper Functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Bearbeitung': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'Überfällig': return 'bg-red-100 text-red-700 border-red-200'
      case 'Warten': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'Nicht begonnen': return 'bg-gray-100 text-gray-700 border-gray-200'
      case 'Abgeschlossen': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getDisciplineColor = (discipline: string) => {
    switch (discipline) {
      case 'Straße': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'Wasser': return 'bg-cyan-100 text-cyan-700 border-cyan-200'
      case 'RA': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'Vermessung': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getDeadlineBadge = () => {
    if (!project.deadline) return { color: 'bg-gray-100 text-gray-600', label: 'Keine Frist definiert' }

    switch (deadlineStatus) {
      case 'overdue': return { color: 'bg-red-100 text-red-700', label: 'Überfällig' }
      case 'urgent': return { color: 'bg-red-100 text-red-700', label: 'Dringend' }
      case 'soon': return { color: 'bg-yellow-100 text-yellow-700', label: 'Bald fällig' }
      default: return { color: 'bg-green-100 text-green-700', label: 'Im Plan' }
    }
  }

  const getBillingBarColor = () => {
    if (billingProgress > 100) return 'bg-red-500'
    if (billingProgress >= 80) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getProgressBarColor = () => {
    if (project.progress >= 80) return 'bg-green-500'
    if (project.progress >= 50) return 'bg-blue-500'
    return 'bg-yellow-500'
  }

  const deadlineBadge = getDeadlineBadge()

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Navigation */}
      <button
        onClick={() => navigate('/projekte')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
      >
        <ArrowLeft size={20} />
        Zurück zur Projektliste
      </button>

      {/* 1. Projekt Header / Überblick */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className={`px-3 py-1.5 text-sm font-medium rounded-full border ${getDisciplineColor(project.discipline)}`}>
                {project.discipline}
              </span>
              <span className={`px-3 py-1.5 text-sm font-medium rounded-full border ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
            </div>

            <p className="font-mono text-lg text-gray-500 mb-2">{project.projectNumber}</p>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{project.title}</h1>

            <div className="flex items-center gap-2 text-gray-600">
              <User size={18} />
              <span>Projektleiter: <strong>{project.projectManager}</strong></span>
            </div>
          </div>

          {/* Fortschritt Summary */}
          <div className="lg:text-right">
            <p className="text-sm text-gray-500 mb-1">Projektfortschritt</p>
            <p className="text-5xl font-bold text-gray-900">{project.progress}%</p>
            <div className="w-48 h-3 bg-gray-100 rounded-full overflow-hidden mt-3">
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
        {/* 2. Operativer Projektstatus */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-600" />
            Operativer Projektstatus
          </h2>

          <div className="space-y-6">
            {/* Status */}
            <div>
              <p className="text-sm text-gray-500 mb-2">Aktueller Status</p>
              <span className={`inline-block px-4 py-2 text-sm font-semibold rounded-lg border ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
            </div>

            {/* Deadline */}
            <div>
              <p className="text-sm text-gray-500 mb-2">Deadline</p>
              <div className="flex items-center gap-3">
                <Calendar size={20} className="text-gray-400" />
                <span className="text-lg font-semibold text-gray-900">
                  {project.deadline
                    ? new Date(project.deadline).toLocaleDateString('de-DE', {
                        weekday: 'long',
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric'
                      })
                    : 'Keine Frist definiert'
                  }
                </span>
              </div>
              <span className={`inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full ${deadlineBadge.color}`}>
                {deadlineBadge.label}
              </span>
            </div>

            {/* Fortschritt */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-500">Projektfortschritt</p>
                <span className="text-lg font-bold text-gray-900">{project.progress}%</span>
              </div>
              <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${getProgressBarColor()}`}
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Projektcontrolling */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Euro size={20} className="text-green-600" />
            Projektcontrolling
          </h2>

          <div className="space-y-6">
            {/* Projektvolumen */}
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">Projektvolumen</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(project.projectVolume)}</p>
              </div>
            </div>

            {/* Bereits abgerechnet */}
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">Bereits abgerechnet</p>
                <div className="flex items-center gap-3">
                  <p className={`text-2xl font-bold ${billingProgress > 100 ? 'text-red-600' : 'text-gray-900'}`}>
                    {formatCurrency(project.invoicedAmount)}
                  </p>
                  {billingProgress > 100 && (
                    <span className="px-2 py-1 text-xs font-semibold bg-red-100 text-red-700 rounded-full flex items-center gap-1">
                      <AlertTriangle size={12} />
                      Über Budget
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Verbleibendes Budget */}
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500 mb-1">Verbleibendes Budget</p>
                <p className={`text-2xl font-bold ${remainingBudget < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatCurrency(Math.max(0, remainingBudget))}
                  {remainingBudget < 0 && (
                    <span className="text-sm font-normal ml-2">({formatCurrency(remainingBudget)})</span>
                  )}
                </p>
              </div>
            </div>

            {/* Abrechnungsstand */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-500">Abrechnungsstand</p>
                <span className={`text-lg font-bold ${billingProgress > 100 ? 'text-red-600' : 'text-gray-900'}`}>
                  {billingProgress.toFixed(1)}%
                </span>
              </div>
              {project.projectVolume > 0 ? (
                <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${getBillingBarColor()}`}
                    style={{ width: `${Math.min(billingProgress, 100)}%` }}
                  />
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">Noch kein Budget hinterlegt</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Projektbeschreibung & Notizen */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText size={20} className="text-purple-600" />
          Projektbeschreibung & Notizen
        </h2>

        {project.notes ? (
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{project.notes}</p>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 text-center">
            <p className="text-gray-500 italic">Keine weiteren Informationen vorhanden</p>
          </div>
        )}
      </div>

      {/* 5. Demo Quick Actions */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-lg p-6 text-white">
        <h2 className="text-lg font-semibold mb-2">Demo Quick Actions</h2>
        <p className="text-slate-400 text-sm mb-6">Diese Aktionen dienen zur Demonstration und ändern die lokalen Daten.</p>

        <div className="flex flex-wrap gap-4">
          {/* Projekt abschließen */}
          <button
            onClick={handleCompleteProject}
            disabled={project.status === 'Abgeschlossen'}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
              project.status === 'Abgeschlossen'
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 text-white'
            }`}
          >
            <CheckCircle size={20} />
            Projekt abschließen
          </button>

          {/* Deadline verschieben */}
          <button
            onClick={handleExtendDeadline}
            className="flex items-center gap-2 px-5 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl font-medium transition-all"
          >
            <CalendarPlus size={20} />
            Deadline +7 Tage
          </button>

          {/* Rechnung hinzufügen */}
          {!showInvoiceInput ? (
            <button
              onClick={() => setShowInvoiceInput(true)}
              className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all"
            >
              <PlusCircle size={20} />
              Rechnung hinzufügen
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-slate-700 rounded-xl p-2">
              <input
                type="text"
                value={invoiceAmount}
                onChange={(e) => setInvoiceAmount(e.target.value)}
                placeholder="Betrag in €"
                className="w-32 px-3 py-2 bg-slate-600 text-white placeholder-slate-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <button
                onClick={handleAddInvoice}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
              >
                Hinzufügen
              </button>
              <button
                onClick={() => {
                  setShowInvoiceInput(false)
                  setInvoiceAmount('')
                }}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          )}
        </div>

        {project.status === 'Abgeschlossen' && (
          <p className="mt-4 text-green-400 text-sm flex items-center gap-2">
            <CheckCircle size={16} />
            Dieses Projekt wurde erfolgreich abgeschlossen.
          </p>
        )}
      </div>
    </div>
  )
}

export default ProjektDetail
