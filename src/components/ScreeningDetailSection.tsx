import { Sparkles, Target, Users, Euro, Clock, Award, Handshake } from 'lucide-react'
import { type ScreeningResult, type AmpelColor } from '../data/aiScreening'

interface Props {
  result: ScreeningResult
}

const categoryIcons: Record<string, React.ReactNode> = {
  strategic: <Target size={16} />,
  capacity: <Users size={16} />,
  profitability: <Euro size={16} />,
  deadline: <Clock size={16} />,
  expertise: <Award size={16} />,
  relationship: <Handshake size={16} />,
}

function getColorClasses(color: AmpelColor) {
  switch (color) {
    case 'green': return { bg: 'bg-green-500', text: 'text-green-700', ring: 'ring-green-200', bgLight: 'bg-green-50' }
    case 'yellow': return { bg: 'bg-yellow-500', text: 'text-yellow-700', ring: 'ring-yellow-200', bgLight: 'bg-yellow-50' }
    case 'red': return { bg: 'bg-red-500', text: 'text-red-700', ring: 'ring-red-200', bgLight: 'bg-red-50' }
  }
}

function ScreeningDetailSection({ result }: Props) {
  const overallColors = getColorClasses(result.overallColor)

  return (
    <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-5 border border-gray-200">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 bg-purple-100 rounded-lg">
          <Sparkles size={18} className="text-purple-600" />
        </div>
        <h3 className="font-semibold text-gray-900">KI-Screening</h3>
        <span className="text-xs text-gray-400 ml-auto">Regelbasierte Analyse</span>
      </div>

      {/* Overall Score */}
      <div className="flex items-center gap-4 mb-5 pb-4 border-b border-gray-200">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center ring-4 ${overallColors.ring} ${overallColors.bgLight}`}>
          <span className={`text-2xl font-bold ${overallColors.text}`}>{result.overallScore}</span>
        </div>
        <div>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold text-white ${overallColors.bg}`}>
            {result.overallLabel}
          </span>
          <p className="text-xs text-gray-500 mt-1">Gesamtscore von 100</p>
        </div>
      </div>

      {/* Category Rows */}
      <div className="space-y-3">
        {result.categories.map(cat => {
          const colors = getColorClasses(cat.color)
          return (
            <div key={cat.id}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-gray-400">{categoryIcons[cat.id]}</span>
                <span className="text-sm font-medium text-gray-700 flex-1">{cat.name}</span>
                <span className={`text-sm font-semibold ${colors.text}`}>{cat.score}</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-1">
                <div
                  className={`h-full rounded-full transition-all ${colors.bg}`}
                  style={{ width: `${cat.score}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">{cat.explanation}</p>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <p className="text-sm text-gray-600 italic">{result.summary}</p>
      </div>
    </div>
  )
}

export default ScreeningDetailSection
