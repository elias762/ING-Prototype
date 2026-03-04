import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { X } from 'lucide-react'

/** Provides a portal target inside the Drawer's stacking context (z-50) but outside the overflow-y-auto panel. */
export const DrawerPortalCtx = createContext<HTMLDivElement | null>(null)
export const useDrawerPortal = () => useContext(DrawerPortalCtx)

interface Props {
  children: ReactNode
  onClose: () => void
  wide?: boolean
}

function Drawer({ children, onClose, wide }: Props) {
  const [open, setOpen] = useState(false)
  const [portalEl, setPortalEl] = useState<HTMLDivElement | null>(null)
  const portalRef = useCallback((el: HTMLDivElement | null) => setPortalEl(el), [])

  useEffect(() => {
    // Trigger enter animation on next frame
    requestAnimationFrame(() => setOpen(true))
  }, [])

  const handleClose = () => {
    setOpen(false)
    setTimeout(onClose, 200)
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/30 backdrop-blur-[2px] transition-opacity duration-200 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Panel */}
      <div
        className={`absolute right-0 top-0 h-full w-full ${
          wide ? 'max-w-4xl' : 'max-w-2xl'
        } bg-white shadow-lg overflow-y-auto transition-transform duration-200 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-2 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <X size={20} className="text-gray-500" />
        </button>

        <DrawerPortalCtx.Provider value={portalEl}>
          {children}
        </DrawerPortalCtx.Provider>
      </div>

      {/* Dropdown portal target — inside z-50 stacking context, outside overflow-y-auto panel */}
      <div ref={portalRef} />
    </div>
  )
}

export default Drawer
