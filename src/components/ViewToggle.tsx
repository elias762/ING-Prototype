import { List, LayoutGrid } from 'lucide-react'

interface ViewToggleProps {
  view: 'list' | 'kanban'
  onChange: (view: 'list' | 'kanban') => void
}

export default function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="flex bg-gray-100 rounded-lg p-0.5">
      <button
        onClick={() => onChange('list')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
          view === 'list'
            ? 'bg-white text-brand shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <List size={16} />
      </button>
      <button
        onClick={() => onChange('kanban')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
          view === 'kanban'
            ? 'bg-white text-brand shadow-sm'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <LayoutGrid size={16} />
      </button>
    </div>
  )
}
