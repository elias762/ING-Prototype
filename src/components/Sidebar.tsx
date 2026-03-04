'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { LayoutDashboard, FolderKanban, FileText, Globe, LogOut } from 'lucide-react'
import { useLanguage } from '../i18n/LanguageContext'
import { useAuth } from '../auth/AuthContext'

const allNavItems = [
  { href: '/', key: 'dashboard', icon: LayoutDashboard, labelKey: 'nav.dashboard' as const },
  { href: '/projekte', key: 'projekte', icon: FolderKanban, labelKey: 'nav.projects' as const },
  { href: '/angebote', key: 'angebote', icon: FileText, labelKey: 'nav.offers' as const },
]

function Sidebar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { lang, setLang, t } = useLanguage()
  const { user, profile, signOut } = useAuth()
  const pagesParam = searchParams.get('pages')
  const navItems = pagesParam
    ? allNavItems.filter((item) => pagesParam.split(',').includes(item.key))
    : allNavItems

  // Preserve pages param when navigating
  const withPages = (path: string) =>
    pagesParam ? `${path}?pages=${pagesParam}` : path

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <aside className="w-56 bg-white border-r border-gray-200/60 flex flex-col">
      <div className="p-4">
        <img src="/logo.png" alt="ING PLAN" className="h-12 w-auto" />
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={withPages(item.href)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? 'bg-brand/10 text-brand font-semibold border-l-2 border-brand -ml-[2px]'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-[#333]'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{t(item.labelKey)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Language Switch */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-2 px-4 py-2 text-gray-400 text-xs font-medium mb-1">
          <Globe size={14} />
          <span>{t('language.label')}</span>
        </div>
        <div className="flex mx-4 bg-gray-100 rounded-lg overflow-hidden">
          <button
            onClick={() => setLang('de')}
            className={`flex-1 py-1.5 text-xs font-medium transition-colors ${
              lang === 'de'
                ? 'bg-white text-[#333] shadow-sm'
                : 'text-gray-400 hover:text-[#333]'
            }`}
          >
            DE
          </button>
          <button
            onClick={() => setLang('en')}
            className={`flex-1 py-1.5 text-xs font-medium transition-colors ${
              lang === 'en'
                ? 'bg-white text-[#333] shadow-sm'
                : 'text-gray-400 hover:text-[#333]'
            }`}
          >
            EN
          </button>
        </div>
      </div>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center text-sm font-medium text-white">
            {(profile?.first_name || user?.email || '?')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#333] truncate">
              {profile?.first_name && profile?.last_name
                ? `${profile.first_name} ${profile.last_name}`
                : user?.email?.split('@')[0] || '?'}
            </p>
            <p className="text-xs text-gray-400 truncate">
              {profile?.position || user?.email}
            </p>
          </div>
          <button
            onClick={signOut}
            title={t('auth.logout')}
            className="p-1.5 text-gray-400 hover:text-red-500 rounded transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
