import type { PrioritizedProduct, SortOption } from '../../types/inventory'
import { StatusBadge } from './StatusBadge'

type PriorityTableProps = {
  title: string
  description: string
  products: PrioritizedProduct[]
  tone: 'urgent' | 'queue'
  showSort?: boolean
  sortBy?: SortOption
  onSortChange?: (sort: SortOption) => void
  onSelect: (product: PrioritizedProduct) => void
  showReviewTiming?: boolean
}

function formatDate(iso: string): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'urgency', label: 'Highest urgency' },
  { value: 'quantity', label: 'Lowest quantity' },
  { value: 'expiration', label: 'Earliest expiration' },
  { value: 'salesRate', label: 'Fastest sales rate' },
]

export function PriorityTable({
  title,
  description,
  products,
  tone,
  showSort = false,
  sortBy = 'urgency',
  onSortChange,
  onSelect,
  showReviewTiming = false,
}: PriorityTableProps) {
  const accentBorder =
    tone === 'urgent' ? 'border-l-brand-orange' : 'border-l-brand-blue'

  return (
    <section className="rounded-2xl border border-brand-border bg-brand-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-brand-border px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div>
          <h2 className="text-lg font-semibold text-brand-navy">{title}</h2>
          <p className="mt-1 max-w-2xl text-sm text-brand-muted">
            {description}
          </p>
        </div>
        {showSort && onSortChange && (
          <div className="flex items-center gap-2">
            <label
              htmlFor={`${title}-sort`}
              className="text-xs font-medium text-brand-muted"
            >
              Sort by
            </label>
            <select
              id={`${title}-sort`}
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="rounded-lg border border-brand-border bg-brand-white px-3 py-2 text-sm text-brand-text shadow-sm"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {products.length === 0 ? (
        <p className="px-6 py-10 text-center text-sm text-brand-muted">
          No products in this list right now.
        </p>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[960px] text-left text-sm">
              <thead>
                <tr className="border-b border-brand-border bg-brand-bg/80 text-xs font-semibold uppercase tracking-wide text-brand-muted">
                  <th scope="col" className="px-6 py-3">
                    Product
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Brand
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Category
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Qty on hand
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Reorder at
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Sales rate
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Expiration
                  </th>
                  <th scope="col" className="px-4 py-3">
                    Reason flagged
                  </th>
                  <th scope="col" className="px-4 py-3 pr-6">
                    Recommended action
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className={`cursor-pointer border-b border-brand-border last:border-0 transition hover:bg-brand-bg/60 ${
                      product.reviewed ? 'opacity-55' : ''
                    }`}
                    onClick={() => onSelect(product)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onSelect(product)
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`View details for ${product.productName}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <span className="font-medium text-brand-text">
                          {product.productName}
                        </span>
                        {product.statusLabel && (
                          <StatusBadge
                            label={product.statusLabel}
                            tone={tone}
                          />
                        )}
                        {showReviewTiming && product.reviewTiming && (
                          <span className="text-xs text-brand-blue">
                            {product.reviewTiming}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-brand-muted">
                      {product.brand}
                    </td>
                    <td className="px-4 py-4 text-brand-muted">
                      {product.category}
                    </td>
                    <td className="px-4 py-4 font-medium tabular-nums text-brand-text">
                      {product.quantityOnHand}
                    </td>
                    <td className="px-4 py-4 tabular-nums text-brand-muted">
                      {product.reorderThreshold}
                    </td>
                    <td className="px-4 py-4 tabular-nums text-brand-muted">
                      {product.salesRate}/day
                    </td>
                    <td className="px-4 py-4 text-brand-muted">
                      {formatDate(product.expirationDate)}
                    </td>
                    <td className="max-w-[180px] px-4 py-4 text-brand-muted">
                      {product.reasonFlagged}
                    </td>
                    <td className="px-4 py-4 pr-6 font-medium text-brand-text">
                      {product.recommendedAction}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="divide-y divide-brand-border lg:hidden">
            {products.map((product) => (
              <li key={product.id}>
                <button
                  type="button"
                  onClick={() => onSelect(product)}
                  className={`w-full border-l-4 px-5 py-4 text-left transition hover:bg-brand-bg/60 ${accentBorder} ${
                    product.reviewed ? 'opacity-55' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-brand-text">
                        {product.productName}
                      </p>
                      <p className="mt-0.5 text-sm text-brand-muted">
                        {product.brand} · {product.category}
                      </p>
                    </div>
                    {product.statusLabel && (
                      <StatusBadge label={product.statusLabel} tone={tone} />
                    )}
                  </div>
                  <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <dt className="text-xs text-brand-muted">Qty on hand</dt>
                      <dd className="font-medium tabular-nums">
                        {product.quantityOnHand}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-brand-muted">Reorder at</dt>
                      <dd className="tabular-nums">
                        {product.reorderThreshold}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs text-brand-muted">Sales rate</dt>
                      <dd>{product.salesRate}/day</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-brand-muted">Expiration</dt>
                      <dd>{formatDate(product.expirationDate)}</dd>
                    </div>
                  </dl>
                  <p className="mt-3 text-sm text-brand-muted">
                    {product.reasonFlagged}
                  </p>
                  <p className="mt-1 text-sm font-medium text-brand-text">
                    {product.recommendedAction}
                  </p>
                  {showReviewTiming && product.reviewTiming && (
                    <p className="mt-2 text-xs font-medium text-brand-blue">
                      {product.reviewTiming}
                    </p>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
