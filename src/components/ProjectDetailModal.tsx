import { X, Calendar, User, FileText, TrendingUp, Euro, AlertTriangle } from 'lucide-react'
import { type Project, formatCurrency, calculateBillingProgress, getDeadlineStatus } from '../data/mockData'

interface Props {
  project: Project
  onClose: () => void
}

function ProjectDetailModal({ project, onClose }: Props) {
  const billingProgress = calculateBillingProgress(project)
  const deadlineStatus = getDeadlineStatus(project.deadline)

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

  const getDeadlineBadge = () => {
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

  const deadlineBadge = getDeadlineBadge()

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-sm font-medium text-gray-500">{project.projectNumber}</span>
              <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getDisciplineColor(project.discipline)}`}>
                {project.discipline}
              </span>
              <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">{project.title}</h2>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <User size={16} />
                <span className="text-xs font-medium">Projektleiter</span>
              </div>
              <p className="font-semibold text-gray-900">{project.projectManager}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Calendar size={16} />
                <span className="text-xs font-medium">Deadline</span>
              </div>
              <p className="font-semibold text-gray-900">{new Date(project.deadline).toLocaleDateString('de-DE')}</p>
              <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded ${deadlineBadge.color}`}>
                {deadlineBadge.label}
              </span>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <TrendingUp size={16} />
                <span className="text-xs font-medium">Fortschritt</span>
              </div>
              <p className="font-semibold text-gray-900">{project.progress}%</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Euro size={16} />
                <span className="text-xs font-medium">Volumen</span>
              </div>
              <p className="font-semibold text-gray-900">{formatCurrency(project.projectVolume)}</p>
            </div>
          </div>

          {/* Progress Bars */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 font-medium">Projektfortschritt</span>
                <span className="font-semibold">{project.progress}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${project.progress >= 80 ? 'bg-green-500' : project.progress >= 50 ? 'bg-blue-500' : 'bg-yellow-500'}`}
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 font-medium">Abrechnungsstand</span>
                <span className="font-semibold">{billingProgress.toFixed(1)}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${getBillingBarColor()}`}
                  style={{ width: `${Math.min(billingProgress, 100)}%` }}
                />
              </div>
              {billingProgress > 100 && (
                <div className="flex items-center gap-1 mt-2 text-red-600 text-sm">
                  <AlertTriangle size={14} />
                  <span>Über Budget</span>
                </div>
              )}
            </div>
          </div>

          {/* Financial Details */}
          <div className="bg-slate-50 rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Finanzdaten</h3>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Projektvolumen</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(project.projectVolume)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Abgerechnet</p>
                <p className={`text-xl font-bold ${billingProgress > 100 ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatCurrency(project.invoicedAmount)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Offen</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatCurrency(Math.max(0, project.projectVolume - project.invoicedAmount))}
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          {project.notes && (
            <div>
              <div className="flex items-center gap-2 text-gray-500 mb-2">
                <FileText size={16} />
                <span className="text-sm font-medium">Notizen</span>
              </div>
              <p className="text-gray-700 bg-gray-50 rounded-lg p-4">{project.notes}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-100 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Schließen
          </button>
          <button className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Bearbeiten
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProjectDetailModal
