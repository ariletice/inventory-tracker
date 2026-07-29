import { Fragment, useMemo, useState } from 'react'
import { ChevronDown, Upload } from 'lucide-react'
import {
  groupProductsByUrgency,
  type UrgencySection,
  type UrgencySectionId,
} from '../../lib/productAlerts'
import type {
  InventoryProduct,
  ProductAlertRow,
  StatusLabel,
} from '../../types/inventory'
import { StatusBadge } from './StatusBadge'

const SECTION_PAGE_SIZE = 25

type ReviewFilter = 'unreviewed' | 'all' | 'reviewed'

type AllProductsTableProps = {
  products: InventoryProduct[]
  onToggleReviewed: (id: string) => void
  onUploadClick: () => void
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T12:00:00')
  if (Number.isNaN(d.getTime())) return 'Not provided'
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function displayValue(value: unknown): string {
  if (value === null || value === undefined) return 'Not provided'
  if (typeof value === 'number' && Number.isNaN(value)) return 'Not provided'
  const text = String(value).trim()
  if (text === '' || text === 'undefined' || text === 'null' || text === 'NaN') {
    return 'Not provided'
  }
  return text
}

function formatLitersKg(value: number | undefined): string {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return 'Not provided'
  }
  return `${value} liters/kg`
}

function formatDays(value: number | undefined): string {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return 'Not provided'
  }
  return `${value} days`
}

function displayStatuses(row: ProductAlertRow): StatusLabel[] {
  const statuses = row.statuses.slice(0, 2)
  if (row.reviewed) return [...statuses, 'Reviewed']
  return statuses
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-brand-muted">{label}</dt>
      <dd className="mt-0.5 text-sm text-brand-text">{value}</dd>
    </div>
  )
}

function ProductRows({
  rows,
  expandedId,
  setExpandedId,
  onToggleReviewed,
}: {
  rows: ProductAlertRow[]
  expandedId: string | null
  setExpandedId: (id: string | null) => void
  onToggleReviewed: (id: string) => void
}) {
  return (
    <>
      {rows.map((row) => {
        const isExpanded = expandedId === row.recordId
        const isReviewed = Boolean(row.reviewed)
        const badges = displayStatuses(row)

        return (
          <Fragment key={row.recordId}>
            <tr
              className={`border-b border-brand-border transition hover:bg-brand-bg/70 ${
                isReviewed ? 'bg-slate-50' : ''
              } ${isExpanded ? 'border-b-0' : ''}`}
            >
              <td className="px-4 py-3 align-middle">
                <input
                  type="checkbox"
                  checked={isReviewed}
                  onChange={() => onToggleReviewed(row.recordId)}
                  aria-label={`Mark ${row.productName} as reviewed`}
                  className="h-4 w-4 rounded border-brand-border text-brand-blue focus:ring-brand-blue"
                />
              </td>
              <td className="px-3 py-3 align-middle font-medium text-brand-text">
                {row.productName}
              </td>
              <td className="px-3 py-3 align-middle text-brand-muted">
                {row.brand}
              </td>
              <td className="px-3 py-3 align-middle text-brand-muted">
                {row.category?.trim() || 'Dairy'}
              </td>
              <td className="px-3 py-3 align-middle tabular-nums text-brand-text">
                {formatLitersKg(row.quantityInStock)}
              </td>
              <td className="px-3 py-3 align-middle text-brand-muted">
                {formatDate(row.expirationDate)}
              </td>
              <td className="px-3 py-3 align-middle">
                <div className="flex flex-wrap gap-1.5">
                  {badges.map((label) => (
                    <StatusBadge key={label} label={label} />
                  ))}
                </div>
              </td>
              <td className="px-3 py-3 align-middle font-medium text-brand-text">
                {row.recommendedAction}
              </td>
              <td className="px-3 py-3 pr-5 align-middle">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedId(isExpanded ? null : row.recordId)
                  }
                  className="rounded-lg p-1.5 text-brand-muted transition hover:bg-brand-bg hover:text-brand-navy"
                  aria-expanded={isExpanded}
                  aria-label={`${isExpanded ? 'Hide' : 'View'} details for ${row.productName}`}
                >
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </td>
            </tr>
            {isExpanded && (
              <tr className={isReviewed ? 'bg-slate-50' : ''}>
                <td
                  colSpan={9}
                  className="border-b border-brand-border bg-brand-bg px-5 py-4 sm:px-6"
                >
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-4">
                      <DetailItem
                        label="Product ID"
                        value={displayValue(row.productId)}
                      />
                      <DetailItem
                        label="Production Date"
                        value={formatDate(row.productionDate)}
                      />
                      <DetailItem
                        label="Shelf Life"
                        value={formatDays(row.shelfLifeDays)}
                      />
                      <DetailItem
                        label="Reorder Quantity"
                        value={formatLitersKg(row.reorderQuantity)}
                      />
                      <DetailItem
                        label="Storage Condition"
                        value={displayValue(row.storageCondition)}
                      />
                    </div>
                    <div className="space-y-4">
                      <DetailItem
                        label="Minimum Stock Threshold"
                        value={formatLitersKg(row.minimumStockThreshold)}
                      />
                      <DetailItem
                        label="Quantity Sold"
                        value={formatLitersKg(row.quantitySold)}
                      />
                      <DetailItem
                        label="Location"
                        value={displayValue(row.location)}
                      />
                      <DetailItem
                        label="Reason Flagged"
                        value={displayValue(row.reasonFlagged)}
                      />
                    </div>
                  </dl>
                </td>
              </tr>
            )}
          </Fragment>
        )
      })}
    </>
  )
}

const SECTION_HEADER_STYLES: Record<
  UrgencySectionId,
  { header: string; title: string; description: string; icon: string }
> = {
  requiresActionToday: {
    header: 'bg-brand-danger',
    title: 'text-white',
    description: 'text-white/90',
    icon: 'text-white',
  },
  monitorClosely: {
    header: 'bg-brand-orange',
    title: 'text-white',
    description: 'text-white/90',
    icon: 'text-white',
  },
  noActionRequired: {
    header: 'bg-emerald-700',
    title: 'text-white',
    description: 'text-white/90',
    icon: 'text-white',
  },
}

const REVIEW_FILTERS: { value: ReviewFilter; label: string }[] = [
  { value: 'unreviewed', label: 'Unreviewed' },
  { value: 'all', label: 'All' },
  { value: 'reviewed', label: 'Reviewed' },
]

function filterRowsByReview(
  rows: ProductAlertRow[],
  filter: ReviewFilter,
): ProductAlertRow[] {
  if (filter === 'unreviewed') return rows.filter((row) => !row.reviewed)
  if (filter === 'reviewed') return rows.filter((row) => Boolean(row.reviewed))
  return rows
}

function UrgencySectionBlock({
  section,
  defaultOpen,
  expandedId,
  setExpandedId,
  onToggleReviewed,
}: {
  section: UrgencySection
  defaultOpen: boolean
  expandedId: string | null
  setExpandedId: (id: string | null) => void
  onToggleReviewed: (id: string) => void
}) {
  const [open, setOpen] = useState(defaultOpen)
  const [showAll, setShowAll] = useState(false)
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>('unreviewed')

  const filteredRows = useMemo(
    () => filterRowsByReview(section.rows, reviewFilter),
    [section.rows, reviewFilter],
  )

  const visibleRows = showAll
    ? filteredRows
    : filteredRows.slice(0, SECTION_PAGE_SIZE)
  const hasMore = filteredRows.length > SECTION_PAGE_SIZE
  const styles = SECTION_HEADER_STYLES[section.id]

  const emptyFilterMessage =
    reviewFilter === 'unreviewed'
      ? 'No unreviewed products in this section.'
      : reviewFilter === 'reviewed'
        ? 'No reviewed products in this section.'
        : 'None right now.'

  return (
    <section className="overflow-hidden rounded-2xl border border-brand-border bg-brand-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex w-full items-start justify-between gap-4 px-5 py-5 text-left sm:px-6 ${styles.header}`}
        aria-expanded={open}
      >
        <div className="min-w-0">
          <h2 className={`text-lg font-semibold ${styles.title}`}>
            {section.title}
            <span className={`ml-2 text-sm font-medium ${styles.description}`}>
              ({section.rows.length})
            </span>
          </h2>
          <p className={`mt-1 text-sm ${styles.description}`}>
            {section.description}
          </p>
        </div>
        <ChevronDown
          className={`mt-1 h-5 w-5 shrink-0 transition-transform ${styles.icon} ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden
        />
      </button>

      {open && (
        <>
          {section.rows.length === 0 ? (
            <p className="border-t border-brand-border bg-brand-white px-5 py-4 text-sm text-brand-muted sm:px-6">
              None right now.
            </p>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2 border-t border-brand-border bg-brand-white px-5 py-3 sm:px-6">
                <span className="text-xs font-medium uppercase tracking-wide text-brand-muted">
                  Show
                </span>
                <div
                  className="inline-flex rounded-lg border border-brand-border p-0.5"
                  role="group"
                  aria-label={`Filter ${section.title} by review status`}
                >
                  {REVIEW_FILTERS.map((option) => {
                    const isActive = reviewFilter === option.value
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setReviewFilter(option.value)
                          setShowAll(false)
                        }}
                        className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
                          isActive
                            ? 'bg-brand-navy text-white'
                            : 'text-brand-muted hover:bg-brand-bg hover:text-brand-text'
                        }`}
                        aria-pressed={isActive}
                      >
                        {option.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {filteredRows.length === 0 ? (
                <p className="border-t border-brand-border bg-brand-white px-5 py-4 text-sm text-brand-muted sm:px-6">
                  {emptyFilterMessage}
                </p>
              ) : (
                <>
                  <div className="overflow-x-auto border-t border-brand-border bg-brand-white">
                    <table className="w-full min-w-[960px] text-left text-sm">
                      <thead className="sticky top-0 z-10 bg-brand-bg">
                        <tr className="border-b border-brand-border text-xs font-semibold uppercase tracking-wide text-brand-muted">
                          <th scope="col" className="w-20 px-4 py-3">
                            Reviewed
                          </th>
                          <th scope="col" className="px-3 py-3">
                            Product
                          </th>
                          <th scope="col" className="px-3 py-3">
                            Brand
                          </th>
                          <th scope="col" className="px-3 py-3">
                            Category
                          </th>
                          <th scope="col" className="px-3 py-3">
                            Stock
                          </th>
                          <th scope="col" className="px-3 py-3">
                            Expiration
                          </th>
                          <th scope="col" className="px-3 py-3">
                            Status
                          </th>
                          <th scope="col" className="px-3 py-3">
                            Recommended Action
                          </th>
                          <th scope="col" className="w-14 px-3 py-3 pr-5">
                            Details
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <ProductRows
                          rows={visibleRows}
                          expandedId={expandedId}
                          setExpandedId={setExpandedId}
                          onToggleReviewed={onToggleReviewed}
                        />
                      </tbody>
                    </table>
                  </div>
                  {hasMore && (
                    <div className="border-t border-brand-border bg-brand-white px-5 py-3 sm:px-6">
                      <button
                        type="button"
                        onClick={() => setShowAll((prev) => !prev)}
                        className="text-sm font-semibold text-brand-blue hover:text-blue-700"
                      >
                        {showAll
                          ? 'Show less'
                          : `View all ${filteredRows.length} records`}
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </>
      )}
    </section>
  )
}

const DEFAULT_OPEN: Record<UrgencySectionId, boolean> = {
  requiresActionToday: true,
  monitorClosely: true,
  noActionRequired: false,
}

export function AllProductsTable({
  products,
  onToggleReviewed,
  onUploadClick,
}: AllProductsTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const sections = useMemo(() => groupProductsByUrgency(products), [products])

  if (products.length === 0) {
    return (
      <section className="rounded-2xl border border-brand-border bg-brand-white p-8 text-center shadow-sm">
        <h2 className="text-lg font-semibold text-brand-navy">Products</h2>
        <p className="mt-2 text-sm text-brand-muted">
          No products are available to display.
        </p>
        <button
          type="button"
          onClick={onUploadClick}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Upload className="h-4 w-4" aria-hidden />
          Upload Inventory File
        </button>
      </section>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {sections.map((section) => (
        <UrgencySectionBlock
          key={section.id}
          section={section}
          defaultOpen={DEFAULT_OPEN[section.id]}
          expandedId={expandedId}
          setExpandedId={setExpandedId}
          onToggleReviewed={onToggleReviewed}
        />
      ))}
    </div>
  )
}
