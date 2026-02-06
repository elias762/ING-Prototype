import { NavLink, useSearchParams } from 'react-router-dom'
import { LayoutDashboard, FolderKanban, FileText } from 'lucide-react'

const allNavItems = [
  { to: '/', key: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projekte', key: 'projekte', icon: FolderKanban, label: 'Projekte' },
  { to: '/angebote', key: 'angebote', icon: FileText, label: 'Angebote' },
]

function Sidebar() {
  const [searchParams] = useSearchParams()
  const pagesParam = searchParams.get('pages')
  const navItems = pagesParam
    ? allNavItems.filter((item) => pagesParam.split(',').includes(item.key))
    : allNavItems

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col">
      <div className="p-4 bg-white">
        <img src="/logo.png" alt="ING PLAN" className="h-12 w-auto" />
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-sm font-medium">
            M
          </div>
          <div>
            <p className="text-sm font-medium">Max</p>
            <p className="text-xs text-slate-400">Projektleiter</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
