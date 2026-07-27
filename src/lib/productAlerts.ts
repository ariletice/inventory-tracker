import type {
  InventoryProduct,
  ProductAlertRow,
  StatusLabel,
} from '../types/inventory'

const STATUS_RANK: Record<Exclude<StatusLabel, 'Reviewed'>, number> = {
  'Out of Stock': 1,
  Expired: 2,
  'Low Stock': 3,
  'Expiring Soon': 4,
  'No Recent Sales': 5,
  'In Good Standing': 6,
}

const STATUS_REASONS: Record<Exclude<StatusLabel, 'Reviewed'>, string> = {
  'Out of Stock': 'Product has zero quantity on hand',
  Expired: 'Product is past its expiration date',
  'Low Stock': 'Quantity is at or below the reorder threshold',
  'Expiring Soon': 'Product expires within 14 days',
  'No Recent Sales': 'Sales rate is zero while stock remains',
  'In Good Standing': 'No immediate inventory issues detected',
}

/** Pick action from collected statuses using the coordinator action priority order. */
export function getRecommendedAction(statuses: StatusLabel[]): string {
  const set = new Set(statuses)

  if (set.has('Expired')) return 'Remove from inventory'
  if (set.has('Out of Stock')) return 'Reorder now'
  if (set.has('Low Stock') && set.has('Expiring Soon')) {
    return 'Review stock before reordering'
  }
  if (set.has('Low Stock')) return 'Reorder soon'
  if (set.has('Expiring Soon')) return 'Sell or use soon'
  if (set.has('No Recent Sales')) return 'Review slow-moving stock'
  return 'No action needed'
}

function startOfToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function parseExpiration(dateStr: string): Date | null {
  const d = new Date(dateStr + 'T12:00:00')
  if (Number.isNaN(d.getTime())) return null
  d.setHours(0, 0, 0, 0)
  return d
}

function daysUntilExpiry(dateStr: string, today: Date): number {
  const expiration = parseExpiration(dateStr)
  if (!expiration) return Number.POSITIVE_INFINITY
  return Math.round(
    (expiration.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  )
}

function daysOfInventory(quantity: number, salesRate: number): number | null {
  if (salesRate <= 0) return null
  return Math.round((quantity / salesRate) * 10) / 10
}

export function collectStatuses(
  product: InventoryProduct,
  today = startOfToday(),
): StatusLabel[] {
  const qty = product.quantityOnHand
  const statuses: StatusLabel[] = []

  if (qty === 0) {
    statuses.push('Out of Stock')
  }

  const expiration = parseExpiration(product.expirationDate)
  if (expiration && expiration < today) {
    statuses.push('Expired')
  }

  if (qty > 0 && qty <= product.reorderThreshold) {
    statuses.push('Low Stock')
  }

  if (expiration) {
    const fourteenDays = new Date(today)
    fourteenDays.setDate(today.getDate() + 14)
    if (expiration >= today && expiration <= fourteenDays) {
      statuses.push('Expiring Soon')
    }
  }

  if (product.salesRate === 0 && qty > 0) {
    statuses.push('No Recent Sales')
  }

  if (statuses.length === 0) {
    statuses.push('In Good Standing')
  }

  return statuses.sort(
    (a, b) =>
      STATUS_RANK[a as Exclude<StatusLabel, 'Reviewed'>] -
      STATUS_RANK[b as Exclude<StatusLabel, 'Reviewed'>],
  )
}

export function buildProductAlertRow(
  product: InventoryProduct,
  today = startOfToday(),
): ProductAlertRow {
  const statuses = collectStatuses(product, today)
  const primaryStatus = statuses[0] ?? 'In Good Standing'
  const primaryKey = primaryStatus as Exclude<StatusLabel, 'Reviewed'>

  const reasons = statuses
    .filter((s) => s !== 'In Good Standing')
    .map((s) => STATUS_REASONS[s as Exclude<StatusLabel, 'Reviewed'>])

  return {
    ...product,
    statuses,
    primaryStatus,
    recommendedAction: getRecommendedAction(statuses),
    reasonFlagged:
      reasons.length > 0
        ? reasons.join('. ') + '.'
        : STATUS_REASONS['In Good Standing'],
    daysOfInventory: daysOfInventory(
      product.quantityOnHand,
      product.salesRate,
    ),
    daysUntilExpiry: daysUntilExpiry(product.expirationDate, today),
    sortRank: STATUS_RANK[primaryKey],
  }
}

export function sortProductAlertRows(rows: ProductAlertRow[]): ProductAlertRow[] {
  return [...rows].sort((a, b) => {
    const aReviewed = Boolean(a.reviewed)
    const bReviewed = Boolean(b.reviewed)
    if (aReviewed !== bReviewed) return aReviewed ? 1 : -1

    if (a.sortRank !== b.sortRank) return a.sortRank - b.sortRank

    if (a.daysUntilExpiry !== b.daysUntilExpiry) {
      return a.daysUntilExpiry - b.daysUntilExpiry
    }

    if (a.quantityOnHand !== b.quantityOnHand) {
      return a.quantityOnHand - b.quantityOnHand
    }

    const aDays = a.daysOfInventory ?? Number.POSITIVE_INFINITY
    const bDays = b.daysOfInventory ?? Number.POSITIVE_INFINITY
    return aDays - bDays
  })
}

export function buildSortedProductRows(
  products: InventoryProduct[],
): ProductAlertRow[] {
  return sortProductAlertRows(products.map((p) => buildProductAlertRow(p)))
}
