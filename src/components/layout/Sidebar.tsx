import {
  LayoutDashboard,
  Package,
  Upload,
  BarChart3,
  Settings,
  X,
} from 'lucide-react'
import { USER_PROFILE } from '../../lib/constants'

type NavId = 'dashboard' | 'inventory' | 'upload' | 'reports' | 'settings'

type SidebarProps = {
  activeNav: NavId
  onNavigate: (id: NavId) => void
  mobileOpen: boolean
  onCloseMobile: () => void
}

const navItems: {
  id: NavId
  label: string
  icon: typeof LayoutDashboard
  active: boolean
}[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, active: true },
  { id: 'inventory', label: 'Inventory', icon: Package, active: false },
  { id: 'upload', label: 'Upload Data', icon: Upload, active: true },
  { id: 'reports', label: 'Reports', icon: BarChart3, active: false },
  { id: 'settings', label: 'Settings', icon: Settings, active: false },
]

export function Sidebar({
  activeNav,
  onNavigate,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-brand-navy/40 lg:hidden"
          aria-label="Close navigation"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-brand-border bg-brand-white transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Main navigation"
      >
        <div className="flex h-16 items-center justify-between gap-3 border-b border-brand-border px-5">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-blue text-white shadow-sm"
              aria-hidden
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                <path
                  d="M4 16V8l8-4 8 4v8l-8 4-8-4z"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 4v16M4 8l8 4 8-4"
                  stroke="#F97316"
                  strokeWidth="1.75"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <p className="text-base font-semibold tracking-tight text-brand-navy">
                StockFlow
              </p>
              <p className="text-[11px] text-brand-muted">FreshRoute</p>
            </div>
          </div>
          <button
            type="button"
            className="rounded-lg p-1.5 text-brand-muted hover:bg-brand-bg lg:hidden"
            onClick={onCloseMobile}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isCurrent = item.id === activeNav
            const isEnabled = item.active

            return (
              <button
                key={item.id}
                type="button"
                disabled={!isEnabled}
                aria-disabled={!isEnabled}
                aria-current={isCurrent ? 'page' : undefined}
                onClick={() => {
                  if (!isEnabled) return
                  onNavigate(item.id)
                  onCloseMobile()
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isCurrent
                    ? 'bg-brand-blue-light text-brand-blue'
                    : isEnabled
                      ? 'text-brand-text hover:bg-brand-bg'
                      : 'cursor-not-allowed text-brand-muted/60'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                {item.label}
                {!isEnabled && (
                  <span className="ml-auto text-[10px] font-normal uppercase tracking-wide text-brand-muted/70">
                    Soon
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        <div className="border-t border-brand-border p-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-orange-light text-sm font-semibold text-brand-orange"
              aria-hidden
            >
              AM
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-brand-text">
                {USER_PROFILE.name}
              </p>
              <p className="truncate text-xs text-brand-muted">
                {USER_PROFILE.role}
              </p>
              <p className="truncate text-xs text-brand-muted">
                {USER_PROFILE.company}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
