import { Fragment, useMemo, useState } from 'react'
import { ChevronDown, Upload } from 'lucide-react'
import { buildSortedProductRows } from '../../lib/productAlerts'
import type { InventoryProduct, ProductAlertRow, StatusLabel } from '../../types/inventory'
import { StatusBadge } from './StatusBadge'

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
  if (row.reviewed) return ['Reviewed']
  return row.statuses.slice(0, 2)
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-brand-muted">{label}</dt>
      <dd className="mt-0.5 text-sm text-brand-text">{value}</dd>
    </div>
  )
}

export function AllProductsTable({
  products,
  onToggleReviewed,
  onUploadClick,
}: AllProductsTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const rows = useMemo(() => buildSortedProductRows(products), [products])

  if (rows.length === 0) {
    return (
      <section className="rounded-2xl border border-brand-border bg-brand-white p-8 text-center shadow-sm">
        <h2 className="text-lg font-semibold text-brand-navy">All Products</h2>
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
    <section className="rounded-2xl border border-brand-border bg-brand-white shadow-sm">
      <div className="border-b border-brand-border px-5 py-5 sm:px-6">
        <h2 className="text-lg font-semibold text-brand-navy">All Products</h2>
        <p className="mt-1 text-sm text-brand-muted">
          Products are ranked from highest to lowest priority. Check an item
          once you’ve reviewed it.
        </p>
      </div>

      <div className="overflow-x-auto">
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
            {rows.map((row) => {
              const isExpanded = expandedId === row.recordId
              const isReviewed = Boolean(row.reviewed)
              const badges = displayStatuses(row)

              return (
                <Fragment key={row.recordId}>
                  <tr
                    className={`border-b border-brand-border transition hover:bg-brand-bg/70 ${
                      isReviewed ? 'bg-gray-50/80 opacity-45' : ''
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
                    <td
                      className={`px-3 py-3 align-middle text-brand-text ${
                        isReviewed ? 'text-brand-muted' : 'font-medium'
                      }`}
                    >
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
                    <tr className={isReviewed ? 'opacity-45' : ''}>
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
          </tbody>
        </table>
      </div>
    </section>
  )
}
