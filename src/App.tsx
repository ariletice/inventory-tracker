import { useMemo, useState } from 'react'
import { AppShell } from './components/layout/AppShell'
import { SummaryCards } from './components/dashboard/SummaryCards'
import { EmptyState } from './components/dashboard/EmptyState'
import { PriorityTable } from './components/inventory/PriorityTable'
import { ProductDetailDrawer } from './components/inventory/ProductDetailDrawer'
import { UploadModal } from './components/upload/UploadModal'
import { sampleInventory } from './data/sampleInventory'
import {
  getSummaryCounts,
  prioritizeInventory,
  sortPrioritized,
} from './lib/priority'
import type {
  InventoryProduct,
  PrioritizedProduct,
  SortOption,
} from './types/inventory'

type NavId = 'dashboard' | 'inventory' | 'upload' | 'reports' | 'settings'

export default function App() {
  const [inventory, setInventory] =
    useState<InventoryProduct[]>(sampleInventory)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeNav, setActiveNav] = useState<NavId>('dashboard')
  const [sortBy, setSortBy] = useState<SortOption>('urgency')
  const [selected, setSelected] = useState<PrioritizedProduct | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const prioritized = useMemo(
    () => prioritizeInventory(inventory),
    [inventory],
  )

  const needsAttention = useMemo(
    () =>
      sortPrioritized(
        prioritized.filter((p) => p.tier === 'needsAttention'),
        sortBy,
      ),
    [prioritized, sortBy],
  )

  const nextInQueue = useMemo(
    () =>
      sortPrioritized(
        prioritized.filter((p) => p.tier === 'nextInQueue'),
        'urgency',
      ),
    [prioritized],
  )

  const summary = useMemo(() => getSummaryCounts(prioritized), [prioritized])

  const openUpload = () => {
    setUploadOpen(true)
    setActiveNav('upload')
  }

  const handleNavigate = (id: NavId) => {
    if (id === 'upload') {
      openUpload()
      return
    }
    setActiveNav(id)
  }

  const handleSelect = (product: PrioritizedProduct) => {
    setSelected(product)
    setDrawerOpen(true)
  }

  const handleMarkReviewed = (id: string) => {
    setInventory((prev) =>
      prev.map((p) => (p.id === id ? { ...p, reviewed: true } : p)),
    )
  }

  return (
    <AppShell
      activeNav={uploadOpen ? 'upload' : activeNav}
      onNavigate={handleNavigate}
      onUploadClick={openUpload}
      mobileOpen={mobileOpen}
      onMenuClick={() => setMobileOpen(true)}
      onCloseMobile={() => setMobileOpen(false)}
    >
      {inventory.length === 0 ? (
        <EmptyState onUploadClick={openUpload} />
      ) : (
        <div className="mx-auto flex max-w-7xl flex-col gap-6">
          <SummaryCards
            needsAttention={summary.needsAttention}
            nextInQueue={summary.nextInQueue}
            lowStock={summary.lowStock}
            expiringSoon={summary.expiringSoon}
          />

          <PriorityTable
            title="Needs Attention Today"
            description="These products require immediate review based on stock level, sales rate, or expiration date."
            products={needsAttention}
            tone="urgent"
            showSort
            sortBy={sortBy}
            onSortChange={setSortBy}
            onSelect={handleSelect}
          />

          <PriorityTable
            title="Next in Queue"
            description="These products do not require immediate action but should be reviewed soon."
            products={nextInQueue}
            tone="queue"
            showReviewTiming
            onSelect={handleSelect}
          />
        </div>
      )}

      <UploadModal
        open={uploadOpen}
        onClose={() => {
          setUploadOpen(false)
          setActiveNav('dashboard')
        }}
        onSuccess={(products) => {
          setInventory(products)
          setActiveNav('dashboard')
        }}
      />

      <ProductDetailDrawer
        product={
          selected
            ? prioritized.find((p) => p.id === selected.id) ?? selected
            : null
        }
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onMarkReviewed={handleMarkReviewed}
      />
    </AppShell>
  )
}
