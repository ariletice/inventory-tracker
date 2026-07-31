import { Fragment, useEffect, useMemo, useState } from 'react'
import {
  ChevronDown,
  CircleCheck,
  Eye,
  Search,
  TriangleAlert,
  Upload,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  groupProductsByUrgency,
  isNearThreshold,
  type UrgencySection,
  type UrgencySectionId,
} from '../../lib/productAlerts'
import type {
  InventoryProduct,
  ProductAlertRow,
  StatusLabel,
} from '../../types/inventory'
import { StatusBadge } from './StatusBadge'
import { StockLevelCell } from './StockLevelCell'

type ReviewFilter = 'unreviewed' | 'all' | 'reviewed'
type PageSize = 10 | 25 | 50

export type SectionFocusRequest = {
  sectionId: UrgencySectionId
  statusFilter: string
}

type AllProductsTableProps = {
  products: InventoryProduct[]
  onToggleReviewed: (id: string) => void
  onUploadClick: () => void
  sectionFocus?: SectionFocusRequest | null
  onSectionFocusApplied?: () => void
}

type StatusFilterOption = {
  value: string
  label: string
}

const PAGE_SIZE_OPTIONS: PageSize[] = [10, 25, 50]

const SELECT_CLASS =
  'h-9 rounded-lg border border-brand-border bg-brand-white px-3 text-sm text-brand-text shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-blue'

const STATUS_OPTIONS: Record<UrgencySectionId, StatusFilterOption[]> = {
  requiresActionToday: [
    { value: 'all', label: 'All Statuses' },
    { value: 'Expired', label: 'Expired' },
    { value: 'Out of Stock', label: 'Out of Stock' },
    { value: 'Low Stock', label: 'Low Stock' },
  ],
  monitorClosely: [
    { value: 'all', label: 'All Statuses' },
    { value: 'Expiring Soon', label: 'Expiring Within 14 Days' },
    { value: 'nearThreshold', label: 'Near Reorder Threshold' },
  ],
  noActionRequired: [
    { value: 'all', label: 'All Statuses' },
    { value: 'In Good Standing', label: 'In Good Standing' },
  ],
}

const DEFAULT_REVIEW_FILTER: Record<UrgencySectionId, ReviewFilter> = {
  requiresActionToday: 'unreviewed',
  monitorClosely: 'unreviewed',
  noActionRequired: 'all',
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

function matchesStatusFilter(row: ProductAlertRow, statusFilter: string): boolean {
  if (statusFilter === 'all') return true
  if (statusFilter === 'nearThreshold') return isNearThreshold(row)
  return row.statuses.includes(statusFilter as StatusLabel)
}

function matchesSearch(row: ProductAlertRow, searchQuery: string): boolean {
  const query = searchQuery.trim().toLowerCase()
  if (!query) return true
  return (
    row.productName.toLowerCase().includes(query) ||
    row.brand.toLowerCase().includes(query)
  )
}

function matchesReviewFilter(row: ProductAlertRow, filter: ReviewFilter): boolean {
  if (filter === 'unreviewed') return !row.reviewed
  if (filter === 'reviewed') return Boolean(row.reviewed)
  return true
}

function getPageNumbers(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages = new Set<number>()
  pages.add(1)
  pages.add(total)
  for (let p = current - 1; p <= current + 1; p += 1) {
    if (p >= 1 && p <= total) pages.add(p)
  }

  const sorted = [...pages].sort((a, b) => a - b)
  const result: (number | 'ellipsis')[] = []
  for (let i = 0; i < sorted.length; i += 1) {
    const page = sorted[i]
    if (i > 0 && page - sorted[i - 1] > 1) result.push('ellipsis')
    result.push(page)
  }
  return result
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
                isReviewed ? 'bg-brand-blue-light/40' : 'bg-brand-white'
              } ${isExpanded ? 'border-b-0' : ''}`}
            >
              <td
                className={`sticky left-0 z-[1] px-4 py-3 align-middle ${
                  isReviewed ? 'bg-brand-blue-light/40' : 'bg-brand-white'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isReviewed}
                  onChange={() => onToggleReviewed(row.recordId)}
                  aria-label={`Mark ${row.productName} as reviewed`}
                  className="h-4 w-4 rounded border-brand-border text-brand-blue focus:ring-brand-blue"
                />
              </td>
              <td
                className={`sticky left-12 z-[1] px-3 py-3 align-middle font-medium text-brand-text shadow-[2px_0_4px_-2px_rgba(16,42,67,0.12)] ${
                  isReviewed ? 'bg-brand-blue-light/40' : 'bg-brand-white'
                }`}
              >
                {row.productName}
              </td>
              <td className="px-3 py-3 align-middle text-brand-muted">
                {row.brand}
              </td>
              <td className="hidden px-3 py-3 align-middle text-brand-muted lg:table-cell">
                {row.category?.trim() || 'Dairy'}
              </td>
              <td className="px-3 py-3 align-middle">
                <StockLevelCell
                  quantityInStock={row.quantityInStock}
                  minimumStockThreshold={row.minimumStockThreshold}
                />
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
              <tr className={isReviewed ? 'bg-brand-blue-light/40' : ''}>
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
                        label="Category"
                        value={row.category?.trim() || 'Dairy'}
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
  {
    header: string
    title: string
    description: string
    icon: string
    StatusIcon: LucideIcon
  }
> = {
  requiresActionToday: {
    header: 'bg-brand-danger',
    title: 'text-white',
    description: 'text-white/80',
    icon: 'text-white',
    StatusIcon: TriangleAlert,
  },
  monitorClosely: {
    header: 'bg-brand-orange',
    title: 'text-white',
    description: 'text-white/80',
    icon: 'text-white',
    StatusIcon: Eye,
  },
  noActionRequired: {
    header: 'bg-brand-success',
    title: 'text-white',
    description: 'text-white/80',
    icon: 'text-white',
    StatusIcon: CircleCheck,
  },
}

function UrgencySectionBlock({
  section,
  defaultOpen,
  expandedId,
  setExpandedId,
  onToggleReviewed,
  sectionFocus,
  onSectionFocusApplied,
}: {
  section: UrgencySection
  defaultOpen: boolean
  expandedId: string | null
  setExpandedId: (id: string | null) => void
  onToggleReviewed: (id: string) => void
  sectionFocus?: SectionFocusRequest | null
  onSectionFocusApplied?: () => void
}) {
  const defaultReview = DEFAULT_REVIEW_FILTER[section.id]

  const [open, setOpen] = useState(defaultOpen)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [brandFilter, setBrandFilter] = useState('all')
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>(defaultReview)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<PageSize>(10)

  useEffect(() => {
    if (!sectionFocus || sectionFocus.sectionId !== section.id) return
    setOpen(true)
    setStatusFilter(sectionFocus.statusFilter)
    setReviewFilter('all')
    setPage(1)
    requestAnimationFrame(() => {
      document
        .getElementById(`section-${section.id}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
    onSectionFocusApplied?.()
  }, [sectionFocus, section.id, onSectionFocusApplied])

  const brandOptions = useMemo(() => {
    const brands = [
      ...new Set(section.rows.map((row) => row.brand).filter(Boolean)),
    ]
    return brands.sort((a, b) => a.localeCompare(b))
  }, [section.rows])

  const filteredRows = useMemo(() => {
    return section.rows.filter(
      (row) =>
        matchesSearch(row, searchQuery) &&
        matchesStatusFilter(row, statusFilter) &&
        (brandFilter === 'all' || row.brand === brandFilter) &&
        matchesReviewFilter(row, reviewFilter),
    )
  }, [section.rows, searchQuery, statusFilter, brandFilter, reviewFilter])

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const startIndex = filteredRows.length === 0 ? 0 : (currentPage - 1) * pageSize
  const endIndex =
    filteredRows.length === 0
      ? 0
      : Math.min(startIndex + pageSize, filteredRows.length)
  const visibleRows = filteredRows.slice(startIndex, endIndex)
  const pageNumbers = getPageNumbers(currentPage, totalPages)

  const styles = SECTION_HEADER_STYLES[section.id]
  const StatusIcon = styles.StatusIcon
  const statusOptions = STATUS_OPTIONS[section.id]

  const filtersAreDirty =
    searchQuery.trim() !== '' ||
    statusFilter !== 'all' ||
    brandFilter !== 'all' ||
    reviewFilter !== defaultReview ||
    pageSize !== 10

  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setBrandFilter('all')
    setReviewFilter(defaultReview)
    setPageSize(10)
    setPage(1)
  }

  const updateSearch = (value: string) => {
    setSearchQuery(value)
    setPage(1)
  }

  const updateStatus = (value: string) => {
    setStatusFilter(value)
    setPage(1)
  }

  const updateBrand = (value: string) => {
    setBrandFilter(value)
    setPage(1)
  }

  const updateReview = (value: ReviewFilter) => {
    setReviewFilter(value)
    setPage(1)
  }

  const updatePageSize = (value: PageSize) => {
    setPageSize(value)
    setPage(1)
  }

  return (
    <section
      id={`section-${section.id}`}
      className="overflow-hidden rounded-2xl border border-brand-border bg-brand-white shadow-sm scroll-mt-4"
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex w-full items-start justify-between gap-4 px-5 py-5 text-left sm:px-6 ${styles.header}`}
        aria-expanded={open}
      >
        <div className="flex min-w-0 items-start gap-3">
          <StatusIcon
            className={`mt-0.5 h-5 w-5 shrink-0 ${styles.icon}`}
            aria-hidden="true"
          />
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
        </div>
        <ChevronDown
          className={`mt-1 h-5 w-5 shrink-0 transition-transform ${styles.icon} ${
            open ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
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
              <div className="flex flex-wrap items-center gap-3 border-t border-brand-border bg-brand-white px-5 py-3 sm:px-6">
                <div className="relative min-w-[220px] flex-[1.5]">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => updateSearch(e.target.value)}
                    placeholder="Search products or brands..."
                    aria-label={`Search ${section.title}`}
                    className={`w-full pl-9 ${SELECT_CLASS}`}
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => updateStatus(e.target.value)}
                  aria-label={`Filter ${section.title} by status`}
                  className={`min-w-[10rem] flex-none ${SELECT_CLASS}`}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <select
                  value={brandFilter}
                  onChange={(e) => updateBrand(e.target.value)}
                  aria-label={`Filter ${section.title} by brand`}
                  className={`min-w-[9rem] flex-none ${SELECT_CLASS}`}
                >
                  <option value="all">All Brands</option>
                  {brandOptions.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
                <select
                  value={reviewFilter}
                  onChange={(e) =>
                    updateReview(e.target.value as ReviewFilter)
                  }
                  aria-label={`Filter ${section.title} by review status`}
                  className={`min-w-[8rem] flex-none ${SELECT_CLASS}`}
                >
                  <option value="unreviewed">Unreviewed</option>
                  <option value="all">All</option>
                  <option value="reviewed">Reviewed</option>
                </select>
                {filtersAreDirty && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="ml-auto text-sm font-semibold text-brand-blue hover:text-blue-700"
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              {filteredRows.length === 0 ? (
                <p className="border-t border-brand-border bg-brand-white px-5 py-4 text-sm text-brand-muted sm:px-6">
                  No products match the selected filters.
                </p>
              ) : (
                <>
                  <div className="overflow-x-auto border-t border-brand-border bg-brand-white">
                    <table className="w-full min-w-[960px] text-left text-sm">
                      <thead className="sticky top-0 z-10 bg-brand-bg">
                        <tr className="border-b border-brand-border text-xs font-semibold uppercase tracking-wide text-brand-muted">
                          <th
                            scope="col"
                            className="sticky left-0 z-[2] w-20 bg-brand-bg px-4 py-3"
                          >
                            Reviewed
                          </th>
                          <th
                            scope="col"
                            className="sticky left-12 z-[2] bg-brand-bg px-3 py-3 shadow-[2px_0_4px_-2px_rgba(16,42,67,0.12)]"
                          >
                            Product
                          </th>
                          <th scope="col" className="px-3 py-3">
                            Brand
                          </th>
                          <th
                            scope="col"
                            className="hidden px-3 py-3 lg:table-cell"
                          >
                            Category
                          </th>
                          <th scope="col" className="px-3 py-3">
                            Stock Level (liters/kg)
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

                  <div className="flex flex-col gap-3 border-t border-brand-border bg-brand-white px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div className="flex flex-wrap items-center gap-3 text-sm text-brand-muted">
                      <span>
                        Showing {startIndex + 1}–{endIndex} of{' '}
                        {filteredRows.length} results
                      </span>
                      <label className="flex items-center gap-2">
                        Rows per page
                        <select
                          value={pageSize}
                          onChange={(e) =>
                            updatePageSize(Number(e.target.value) as PageSize)
                          }
                          className={SELECT_CLASS}
                          aria-label={`Rows per page for ${section.title}`}
                        >
                          {PAGE_SIZE_OPTIONS.map((size) => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <div className="flex flex-wrap items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage <= 1}
                        className="rounded-lg border border-brand-border px-3 py-1.5 text-sm font-medium text-brand-text transition hover:bg-brand-bg disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Previous
                      </button>
                      {pageNumbers.map((item, index) =>
                        item === 'ellipsis' ? (
                          <span
                            key={`ellipsis-${index}`}
                            className="px-2 text-sm text-brand-muted"
                          >
                            …
                          </span>
                        ) : (
                          <button
                            key={item}
                            type="button"
                            onClick={() => setPage(item)}
                            aria-current={
                              item === currentPage ? 'page' : undefined
                            }
                            className={`min-w-9 rounded-lg px-2.5 py-1.5 text-sm font-medium transition ${
                              item === currentPage
                                ? 'bg-brand-navy text-white'
                                : 'border border-brand-border text-brand-text hover:bg-brand-bg'
                            }`}
                          >
                            {item}
                          </button>
                        ),
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setPage((p) => Math.min(totalPages, p + 1))
                        }
                        disabled={currentPage >= totalPages}
                        className="rounded-lg border border-brand-border px-3 py-1.5 text-sm font-medium text-brand-text transition hover:bg-brand-bg disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Next
                      </button>
                      <span className="ml-2 text-sm text-brand-muted">
                        Page {currentPage} of {totalPages}
                      </span>
                    </div>
                  </div>
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
  sectionFocus = null,
  onSectionFocusApplied,
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
          sectionFocus={sectionFocus}
          onSectionFocusApplied={onSectionFocusApplied}
        />
      ))}
    </div>
  )
}
