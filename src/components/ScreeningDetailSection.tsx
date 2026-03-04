import { useState } from 'react'
import { Sparkles, Target, Users, Euro, Clock, Award, Handshake, ChevronDown } from 'lucide-react'
import { type ScreeningResult, type AmpelColor } from '../data/aiScreening'
import { useLanguage } from '../i18n/LanguageContext'

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
    case 'green': return { bg: 'bg-green-500', text: 'text-green-600', bgLight: 'bg-green-50' }
    case 'yellow': return { bg: 'bg-yellow-500', text: 'text-yellow-600', bgLight: 'bg-yellow-50' }
    case 'red': return { bg: 'bg-red-500', text: 'text-red-600', bgLight: 'bg-red-50' }
  }
}

function ScreeningDetailSection({ result }: Props) {
  const { t } = useLanguage()
  const [open, setOpen] = useState(false)
  const overallColors = getColorClasses(result.overallColor)

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-100">
      {/* Accordion trigger */}
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className="w-full flex items-center gap-2 px-5 py-4 text-left"
      >
        <Sparkles size={18} className="text-gray-400 shrink-0" />
        <h3 className="font-semibold text-[#333]">{t('screening.title')}</h3>
        <span className="ml-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-brand/10 text-brand">
          Coming soon
        </span>
        {/* Mini score preview when collapsed */}
        <div className={`ml-auto flex items-center gap-2 shrink-0`}>
          <div className={`w-7 h-7 rounded-full flex items-center justify-center ${overallColors.bgLight}`}>
            <span className={`text-xs font-bold ${overallColors.text}`}>{result.overallScore}</span>
          </div>
          <ChevronDown
            size={16}
            className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Collapsible content */}
      <div
        className={`grid transition-all duration-200 ease-in-out ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-5 pb-5">
            {/* Overall Score */}
            <div className="flex items-center gap-4 mb-5 pb-4 border-b border-gray-200">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${overallColors.bgLight}`}>
                <span className={`text-xl font-bold ${overallColors.text}`}>{result.overallScore}</span>
              </div>
              <div>
                <span className={`${overallColors.text} text-sm font-semibold`}>
                  {result.overallLabel}
                </span>
                <p className="text-xs text-gray-500 mt-1">{t('screening.totalScore')}</p>
              </div>
              <span className="text-xs text-gray-400 ml-auto">{t('screening.ruleBasedAnalysis')}</span>
            </div>

            {/* Category Rows */}
            <div className="space-y-3">
              {result.categories.map(cat => {
                const colors = getColorClasses(cat.color)
                return (
                  <div key={cat.id}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-gray-400">{categoryIcons[cat.id]}</span>
                      <span className="text-sm font-medium text-gray-600 flex-1">{cat.name}</span>
                      <span className={`text-sm font-semibold ${colors.text}`}>{cat.score}</span>
                    </div>
                    <div className="h-1 bg-gray-200 rounded-full overflow-hidden mb-1">
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
        </div>
      </div>
    </div>
  )
}

export default ScreeningDetailSection
