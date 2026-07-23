import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload } from 'lucide-react'
import { AppShell } from '../components/layout/AppShell'
import { SummaryCards } from '../components/dashboard/SummaryCards'
import { PriorityTable } from '../components/inventory/PriorityTable'
import { ProductDetailDrawer } from '../components/inventory/ProductDetailDrawer'
import { useInventory } from '../context/InventoryContext'
import {
  getSummaryCounts,
  prioritizeInventory,
  sortPrioritized,
} from '../lib/priority'
import type { PrioritizedProduct, SortOption } from '../types/inventory'

type NavId = 'dashboard' | 'inventory' | 'upload' | 'reports' | 'settings'

export function DashboardPage() {
  const navigate = useNavigate()
  const { importState, markReviewed, resetToUpload } = useInventory()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeNav, setActiveNav] = useState<NavId>('dashboard')
  const [sortBy, setSortBy] = useState<SortOption>('urgency')
  const [selected, setSelected] = useState<PrioritizedProduct | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const hasData = Boolean(importState && importState.products.length > 0)
  const products = importState?.products ?? []

  const prioritized = useMemo(
    () => prioritizeInventory(products),
    [products],
  )

  const needsAttention = useMemo(
    () =>
      sortPrioritized(
        prioritized.filter((p) => p.tier === 'needsAttention'),
        sortBy,
      ),
    [prioritized, sortBy],
  )

  const topNeedsAttention = useMemo(
    () => needsAttention.slice(0, 5),
    [needsAttention],
  )

  const comingUpNext = useMemo(
    () =>
      sortPrioritized(
        prioritized.filter((p) => p.tier === 'nextInQueue'),
        'urgency',
      ),
    [prioritized],
  )

  const allByPriority = useMemo(
    () => sortPrioritized(prioritized, 'urgency'),
    [prioritized],
  )

  const summary = useMemo(() => getSummaryCounts(prioritized), [prioritized])

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
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-brand-muted">
            Inventory Overview
          </h2>
          <SummaryCards
            totalProducts={summary.totalProducts}
            needsAttention={summary.needsAttention}
            nextInQueue={summary.nextInQueue}
            noAction={summary.noAction}
          />
        </section>

        <PriorityTable
          title="Needs Attention"
          description="The five highest-priority products that need review first."
          products={topNeedsAttention}
          tone="urgent"
          showSort
          sortBy={sortBy}
          onSortChange={setSortBy}
          onSelect={(product) => {
            setSelected(product)
            setDrawerOpen(true)
          }}
        />

        <PriorityTable
          title="Coming Up Next"
          description="These products may need attention soon."
          products={comingUpNext}
          tone="queue"
          showReviewTiming
          onSelect={(product) => {
            setSelected(product)
            setDrawerOpen(true)
          }}
        />

        <PriorityTable
          title="All Products by Priority"
          description="Every uploaded product ranked from highest priority to lowest."
          products={allByPriority}
          tone="queue"
          onSelect={(product) => {
            setSelected(product)
            setDrawerOpen(true)
          }}
        />
      </div>

      <ProductDetailDrawer
        product={
          selected
            ? prioritized.find((p) => p.id === selected.id) ?? selected
            : null
        }
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onMarkReviewed={markReviewed}
      />
    </AppShell>
  )
}
