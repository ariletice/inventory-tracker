import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import type { PrioritizedProduct } from '../../types/inventory'
import { StatusBadge } from './StatusBadge'

type ProductDetailDrawerProps = {
  product: PrioritizedProduct | null
  open: boolean
  onClose: () => void
  onMarkReviewed: (id: string) => void
}

function formatDate(iso: string): string {
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-brand-border py-3 last:border-0">
      <dt className="text-sm text-brand-muted">{label}</dt>
      <dd className="text-right text-sm font-medium text-brand-text">{value}</dd>
    </div>
  )
}

export function ProductDetailDrawer({
  product,
  open,
  onClose,
  onMarkReviewed,
}: ProductDetailDrawerProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return

    closeRef.current?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open || !product) return null

  const daysInventory =
    product.daysOfInventory === null
      ? product.salesRate <= 0 && product.quantityOnHand > 0
        ? 'Stable (no sales rate)'
        : '—'
      : `${product.daysOfInventory} days`

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-brand-navy/40"
        aria-label="Close product details"
        onClick={onClose}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-drawer-title"
        className="relative flex h-full w-full max-w-md flex-col bg-brand-white shadow-xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-brand-border px-5 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-brand-muted">
              Product details
            </p>
            <h2
              id="product-drawer-title"
              className="mt-1 text-xl font-semibold text-brand-navy"
            >
              {product.productName}
            </h2>
            <p className="mt-1 text-sm text-brand-muted">
              {product.sku} · {product.brand} · {product.category}
            </p>
            {product.statusLabel && (
              <div className="mt-3">
                <StatusBadge label={product.statusLabel} />
              </div>
            )}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-brand-muted hover:bg-brand-bg"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          <dl>
            <DetailRow label="SKU" value={product.sku} />
            <DetailRow
              label="Quantity on hand"
              value={String(product.quantityOnHand)}
            />
            <DetailRow
              label="Reorder threshold"
              value={String(product.reorderThreshold)}
            />
            <DetailRow
              label="Reorder quantity"
              value={String(product.reorderQuantity)}
            />
            <DetailRow
              label="Expiration date"
              value={formatDate(product.expirationDate)}
            />
            <DetailRow
              label="Storage conditions"
              value={product.storageConditions}
            />
            <DetailRow
              label="Sales rate"
              value={`${product.salesRate} units/day`}
            />
            <DetailRow
              label="Est. days of inventory"
              value={daysInventory}
            />
          </dl>

          <div className="mt-6 rounded-xl bg-brand-bg p-4">
            <h3 className="text-sm font-semibold text-brand-navy">
              Why this was flagged
            </h3>
            <p className="mt-1 text-sm text-brand-muted">
              {product.reasonFlagged}
            </p>
            <h3 className="mt-4 text-sm font-semibold text-brand-navy">
              Recommended next step
            </h3>
            <p className="mt-1 text-sm font-medium text-brand-text">
              {product.recommendedAction}
            </p>
            {product.reviewTiming && (
              <p className="mt-3 text-xs font-medium text-brand-blue">
                {product.reviewTiming}
              </p>
            )}
          </div>
        </div>

        <div className="flex gap-3 border-t border-brand-border p-5">
          <button
            type="button"
            onClick={() => {
              onMarkReviewed(product.id)
              onClose()
            }}
            className="flex-1 rounded-xl bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Mark as Reviewed
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-brand-border bg-brand-white px-4 py-2.5 text-sm font-semibold text-brand-text transition hover:bg-brand-bg"
          >
            Close
          </button>
        </div>
      </aside>
    </div>
  )
}
