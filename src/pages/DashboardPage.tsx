import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload } from 'lucide-react'
import { AppShell } from '../components/layout/AppShell'
import {
  SummaryCards,
  type SummaryCardKey,
} from '../components/dashboard/SummaryCards'
import {
  AllProductsTable,
  type SectionFocusRequest,
} from '../components/inventory/AllProductsTable'
import { useInventory } from '../context/InventoryContext'
import { getAlertCounts } from '../lib/priority'

type NavId = 'dashboard' | 'inventory' | 'upload' | 'reports' | 'settings'

const CARD_FOCUS: Record<SummaryCardKey, SectionFocusRequest> = {
  expired: {
    sectionId: 'requiresActionToday',
    statusFilter: 'Expired',
  },
  outOfStock: {
    sectionId: 'requiresActionToday',
    statusFilter: 'Out of Stock',
  },
  lowStock: {
    sectionId: 'requiresActionToday',
    statusFilter: 'Low Stock',
  },
  expiringWithin14Days: {
    sectionId: 'monitorClosely',
    statusFilter: 'Expiring Soon',
  },
}

export function DashboardPage() {
  const navigate = useNavigate()
  const { importState, toggleReviewed, resetToUpload } = useInventory()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeNav, setActiveNav] = useState<NavId>('dashboard')
  const [sectionFocus, setSectionFocus] = useState<SectionFocusRequest | null>(
    null,
  )

  const hasData = Boolean(importState && importState.products.length > 0)
  const products = importState?.products ?? []

  const alertCounts = useMemo(() => getAlertCounts(products), [products])

  const goUpload = () => {
    resetToUpload()
    setActiveNav('upload')
    navigate('/upload')
  }

  const handleNavigate = (id: NavId) => {
    if (id === 'upload') {
      goUpload()
      return
    }
    setActiveNav(id)
  }

  if (!hasData) {
    return (
      <div className="flex min-h-full items-center justify-center bg-brand-bg px-4">
        <div className="w-full max-w-md rounded-2xl border border-brand-border bg-brand-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold text-brand-navy">
            No inventory data is available yet.
          </h1>
          <p className="mt-2 text-sm text-brand-muted">
            Upload a valid inventory spreadsheet to see which products need
            attention.
          </p>
          <button
            type="button"
            onClick={() => navigate('/upload')}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            <Upload className="h-4 w-4" aria-hidden />
            Upload Inventory File
          </button>
        </div>
      </div>
    )
  }

  return (
    <AppShell
      activeNav={activeNav}
      onNavigate={handleNavigate}
      onUploadClick={goUpload}
      mobileOpen={mobileOpen}
      onMenuClick={() => setMobileOpen(true)}
      onCloseMobile={() => setMobileOpen(false)}
      fileName={importState?.fileName}
      uploadedAt={importState?.uploadedAt}
      totalProducts={alertCounts.totalRecords}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section>
          <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-brand-muted">
            Needs Attention Today
          </h2>
          <p className="mb-3 text-sm text-brand-muted">
            Counts of products needing action based on stock and expiration.
          </p>
          <SummaryCards
            expired={alertCounts.expired}
            outOfStock={alertCounts.outOfStock}
            lowStock={alertCounts.lowStock}
            expiringWithin14Days={alertCounts.expiringWithin14Days}
            onCardClick={(key) => setSectionFocus(CARD_FOCUS[key])}
          />
        </section>

        <section>
          <h2 className="mb-1 text-lg font-semibold text-brand-navy">
            Inventory by priority
          </h2>
          <p className="mb-3 text-sm text-brand-muted">
            Work through each section; filters apply only within that section.
          </p>
          <AllProductsTable
            products={products}
            onToggleReviewed={toggleReviewed}
            onUploadClick={goUpload}
            sectionFocus={sectionFocus}
            onSectionFocusApplied={() => setSectionFocus(null)}
          />
        </section>
      </div>
    </AppShell>
  )
}
