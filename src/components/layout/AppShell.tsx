import type { ReactNode } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

type NavId = 'dashboard' | 'inventory' | 'upload' | 'reports' | 'settings'

type AppShellProps = {
  children: ReactNode
  activeNav: NavId
  onNavigate: (id: NavId) => void
  onUploadClick: () => void
  mobileOpen: boolean
  onMenuClick: () => void
  onCloseMobile: () => void
  fileName?: string
  uploadedAt?: string
}

export function AppShell({
  children,
  activeNav,
  onNavigate,
  onUploadClick,
  mobileOpen,
  onMenuClick,
  onCloseMobile,
  fileName,
  uploadedAt,
}: AppShellProps) {
  return (
    <div className="flex min-h-full bg-brand-bg">
      <Sidebar
        activeNav={activeNav}
        onNavigate={onNavigate}
        mobileOpen={mobileOpen}
        onCloseMobile={onCloseMobile}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          onUploadClick={onUploadClick}
          onMenuClick={onMenuClick}
          fileName={fileName}
          uploadedAt={uploadedAt}
        />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}
