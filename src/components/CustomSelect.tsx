import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Check } from 'lucide-react'
import { useDrawerPortal } from './Drawer'

interface Option {
  value: string
  label: string
}

interface Props {
  options: Option[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  variant?: 'filter' | 'form'
  error?: boolean
}

function CustomSelect({ options, value, onChange, placeholder, variant = 'form', error }: Props) {
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

    // Reposition on scroll / resize (drawer scrolls)
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

  const selectedLabel = options.find(o => o.value === value)?.label

  const isFilter = variant === 'filter'

  const triggerClasses = isFilter
    ? 'px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand/30'
    : `w-full px-4 py-2.5 border rounded-lg text-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-brand/30 focus:border-brand/40 ${
        error ? 'border-red-300 bg-red-50' : 'border-gray-200'
      }`

  const dropdownContent = (
    <div
      ref={dropdownRef}
      style={portalTarget ? { position: 'fixed', top: pos.top, left: pos.left, width: pos.width } : undefined}
      className={
        portalTarget
          ? 'bg-white border border-gray-200 rounded-lg shadow-lg z-[60] overflow-hidden'
          : `absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-[60] overflow-hidden transition-all duration-150 origin-top ${
              open
                ? 'opacity-100 scale-y-100 pointer-events-auto'
                : 'opacity-0 scale-y-95 pointer-events-none'
            }`
      }
    >
      {options.map(option => (
        <button
          key={option.value}
          type="button"
          onClick={() => {
            onChange(option.value)
            setOpen(false)
          }}
          className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors ${
            option.value === value
              ? 'text-brand font-medium bg-brand/5'
              : 'text-[#333] hover:bg-gray-50'
          }`}
        >
          {option.label}
          {option.value === value && <Check size={16} className="text-brand shrink-0" />}
        </button>
      ))}
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
        className={`${triggerClasses} flex items-center justify-between gap-2 text-left`}
      >
        <span className={selectedLabel ? 'text-[#333]' : 'text-gray-400'}>
          {selectedLabel || placeholder || '\u00A0'}
        </span>
        <ChevronDown
          size={16}
          className={`text-gray-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {dropdown}
    </div>
  )
}

export default CustomSelect
