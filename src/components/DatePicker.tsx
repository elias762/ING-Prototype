import { useState, useRef, useEffect } from 'react'
import { DayPicker } from 'react-day-picker'
import { format, parse, isValid } from 'date-fns'
import { de, enUS } from 'date-fns/locale'
import { Calendar } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext'

interface DatePickerProps {
  value: string
  onChange: (date: string) => void
  onBlur?: () => void
  className?: string
  error?: boolean
}

function DatePicker({ value, onChange, onBlur, className, error }: DatePickerProps) {
  const { lang } = useLanguage()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const locale = lang === 'de' ? de : enUS

  const parsed = value ? parse(value, 'yyyy-MM-dd', new Date()) : undefined
  const selected = parsed && isValid(parsed) ? parsed : undefined

  const displayValue = selected
    ? format(selected, 'dd.MM.yyyy')
    : ''

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
        onBlur?.()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open, onBlur])

  const handleSelect = (day: Date | undefined) => {
    if (day) {
      onChange(format(day, 'yyyy-MM-dd'))
    }
    setOpen(false)
    onBlur?.()
  }

  const inputClasses = className || 'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand/30 focus:border-brand/40 transition-colors'

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className={`${inputClasses} text-left flex items-center gap-2 ${error ? 'border-red-300 bg-red-50' : ''}`}
      >
        <Calendar size={14} className="text-gray-400 shrink-0" />
        <span className={displayValue ? 'text-gray-900' : 'text-gray-400'}>
          {displayValue || 'dd.mm.yyyy'}
        </span>
      </button>

      {open && (
        <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-3">
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            defaultMonth={selected}
            locale={locale}
            classNames={{
              root: 'text-sm',
              months: 'flex flex-col',
              month_caption: 'flex justify-center items-center h-8 mb-1',
              caption_label: 'text-sm font-semibold text-gray-900',
              nav: 'flex items-center justify-between absolute top-3 left-3 right-3',
              button_previous: 'p-1 rounded hover:bg-gray-100 text-gray-500',
              button_next: 'p-1 rounded hover:bg-gray-100 text-gray-500',
              weekdays: 'flex',
              weekday: 'w-9 text-center text-xs font-medium text-gray-400 pb-2',
              week: 'flex',
              day: 'w-9 h-9 flex items-center justify-center',
              day_button: 'w-8 h-8 rounded-lg text-sm hover:bg-brand/10 hover:text-brand transition-colors cursor-pointer',
              selected: '!bg-brand !text-white !rounded-lg !hover:bg-brand',
              today: 'font-bold text-brand',
              outside: 'text-gray-300',
              disabled: 'text-gray-300 cursor-default',
            }}
          />
        </div>
      )}
    </div>
  )
}

export default DatePicker
