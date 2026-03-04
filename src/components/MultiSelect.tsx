import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, X } from 'lucide-react'
import { useDrawerPortal } from './Drawer'

interface Option {
  value: string
  label: string
}

interface Props {
  options: Option[]
  value: string[]
  onChange: (value: string[]) => void
  placeholder?: string
  error?: boolean
}

function MultiSelect({ options, value, onChange, placeholder, error }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const portalTarget = useDrawerPortal()
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 })

  const updatePos = useCallback(() => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    setPos({ top: rect.bottom + 4, left: rect.left, width: rect.width })
  }, [])

  useEffect(() => {
    if (!open) return

    updatePos()

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        ref.current && !ref.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setOpen(false)
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }

    const scrollParent = ref.current?.closest('[class*="overflow"]') as HTMLElement | null
    scrollParent?.addEventListener('scroll', updatePos)
    window.addEventListener('resize', updatePos)

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      scrollParent?.removeEventListener('scroll', updatePos)
      window.removeEventListener('resize', updatePos)
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open, updatePos])

  const toggle = (optionValue: string) => {
    const next = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue]
    onChange(next)
  }

  const remove = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onChange(value.filter(v => v !== optionValue))
  }

  const selectedLabels = value
    .map(v => options.find(o => o.value === v))
    .filter(Boolean) as Option[]

  const dropdownContent = (
    <div
      ref={dropdownRef}
      style={portalTarget ? { position: 'fixed', top: pos.top, left: pos.left, width: pos.width } : undefined}
      className={
        portalTarget
          ? 'bg-white border border-gray-200 rounded-lg shadow-lg z-[60] overflow-hidden max-h-60 overflow-y-auto'
          : `absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[60] overflow-hidden max-h-60 overflow-y-auto transition-all duration-150 origin-top ${
              open
                ? 'opacity-100 scale-y-100 pointer-events-auto'
                : 'opacity-0 scale-y-95 pointer-events-none'
            }`
      }
    >
      {options.map(option => {
        const checked = value.includes(option.value)
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => toggle(option.value)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${
              checked ? 'bg-brand/5' : 'hover:bg-gray-50'
            }`}
          >
            <span
              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                checked
                  ? 'bg-brand border-brand'
                  : 'border-gray-300'
              }`}
            >
              {checked && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            <span className={checked ? 'text-brand font-medium' : 'text-[#333]'}>
              {option.label}
            </span>
          </button>
        )
      })}
    </div>
  )

  const dropdown = portalTarget
    ? open ? createPortal(dropdownContent, portalTarget) : null
    : dropdownContent

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className={`w-full min-h-[42px] px-3 py-2 border rounded-lg text-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand/30 focus:border-brand/40 flex items-center gap-1.5 flex-wrap ${
          error ? 'border-red-300 bg-red-50' : 'border-gray-200'
        }`}
      >
        {selectedLabels.length > 0 ? (
          <>
            {selectedLabels.map(opt => (
              <span
                key={opt.value}
                className="inline-flex items-center gap-1 bg-brand/10 text-brand text-xs font-medium px-2 py-0.5 rounded-md"
              >
                {opt.label}
                <span
                  role="button"
                  tabIndex={-1}
                  onClick={(e) => remove(opt.value, e)}
                  className="hover:bg-brand/20 rounded-sm p-0.5 -mr-0.5 cursor-pointer"
                >
                  <X size={12} />
                </span>
              </span>
            ))}
          </>
        ) : (
          <span className="text-gray-400">{placeholder || '\u00A0'}</span>
        )}
        <ChevronDown
          size={16}
          className={`text-gray-400 shrink-0 ml-auto transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {dropdown}
    </div>
  )
}

export default MultiSelect
