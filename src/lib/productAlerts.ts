import type {
  InventoryProduct,
  ProductAlertRow,
  StatusLabel,
} from '../types/inventory'

const STATUS_RANK: Record<Exclude<StatusLabel, 'Reviewed'>, number> = {
  Expired: 1,
  'Out of Stock': 2,
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

export type UrgencySectionId =
  | 'requiresActionToday'
  | 'monitorClosely'
  | 'noActionRequired'

export type UrgencySection = {
  id: UrgencySectionId
  title: string
  description: string
  rows: ProductAlertRow[]
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

export function collectStatuses(
  product: InventoryProduct,
  today = startOfToday(),
): StatusLabel[] {
  const qty = product.quantityInStock
  const statuses: StatusLabel[] = []

  if (qty === 0) {
    statuses.push('Out of Stock')
  }

  const expiration = parseExpiration(product.expirationDate)
  if (expiration && expiration < today) {
    statuses.push('Expired')
  }

  if (qty > 0 && qty <= product.minimumStockThreshold) {
    statuses.push('Low Stock')
  }

  if (expiration) {
    const fourteenDays = new Date(today)
    fourteenDays.setDate(today.getDate() + 14)
    if (expiration >= today && expiration <= fourteenDays) {
      statuses.push('Expiring Soon')
    }
  }

  if (
    product.quantitySold !== undefined &&
    product.quantitySold === 0 &&
    qty > 0
  ) {
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
    daysOfInventory: null,
    daysUntilExpiry: daysUntilExpiry(product.expirationDate, today),
    sortRank: STATUS_RANK[primaryKey],
  }
}

function isExpired(row: ProductAlertRow): boolean {
  return row.statuses.includes('Expired')
}

function isOutOfStock(row: ProductAlertRow): boolean {
  return row.quantityInStock === 0
}

function isLowStock(row: ProductAlertRow): boolean {
  return (
    row.quantityInStock > 0 &&
    row.quantityInStock <= row.minimumStockThreshold
  )
}

function isExpiringSoon(row: ProductAlertRow): boolean {
  return row.statuses.includes('Expiring Soon')
}

export function isNearThreshold(row: ProductAlertRow): boolean {
  const threshold = row.minimumStockThreshold
  const qty = row.quantityInStock
  return qty > threshold && qty <= threshold * 1.25
}

function requiresActionRank(row: ProductAlertRow): number {
  if (isExpired(row)) return 0
  if (isOutOfStock(row)) return 1
  if (isLowStock(row)) return 2
  return 3
}

function compareRequiresAction(a: ProductAlertRow, b: ProductAlertRow): number {
  const rankDiff = requiresActionRank(a) - requiresActionRank(b)
  if (rankDiff !== 0) return rankDiff

  if (isExpired(a) && isExpired(b)) {
    return a.daysUntilExpiry - b.daysUntilExpiry
  }

  if (a.quantityInStock !== b.quantityInStock) {
    return a.quantityInStock - b.quantityInStock
  }

  return a.daysUntilExpiry - b.daysUntilExpiry
}

function compareMonitorClosely(a: ProductAlertRow, b: ProductAlertRow): number {
  if (a.daysUntilExpiry !== b.daysUntilExpiry) {
    return a.daysUntilExpiry - b.daysUntilExpiry
  }

  const aDistance = a.quantityInStock - a.minimumStockThreshold
  const bDistance = b.quantityInStock - b.minimumStockThreshold
  if (aDistance !== bDistance) return aDistance - bDistance

  return a.quantityInStock - b.quantityInStock
}

function compareNoActionRequired(a: ProductAlertRow, b: ProductAlertRow): number {
  if (a.daysUntilExpiry !== b.daysUntilExpiry) {
    return a.daysUntilExpiry - b.daysUntilExpiry
  }
  if (a.quantityInStock !== b.quantityInStock) {
    return a.quantityInStock - b.quantityInStock
  }
  return 0
}

function assignUrgencySection(row: ProductAlertRow): UrgencySectionId {
  if (isExpired(row) || isOutOfStock(row) || isLowStock(row)) {
    return 'requiresActionToday'
  }
  if (isExpiringSoon(row) || isNearThreshold(row)) {
    return 'monitorClosely'
  }
  return 'noActionRequired'
}

export function groupProductsByUrgency(
  products: InventoryProduct[],
): UrgencySection[] {
  const buckets: Record<UrgencySectionId, ProductAlertRow[]> = {
    requiresActionToday: [],
    monitorClosely: [],
    noActionRequired: [],
  }

  for (const product of products) {
    const row = buildProductAlertRow(product)
    buckets[assignUrgencySection(row)].push(row)
  }

  buckets.requiresActionToday.sort(compareRequiresAction)
  buckets.monitorClosely.sort(compareMonitorClosely)
  buckets.noActionRequired.sort(compareNoActionRequired)

  return [
    {
      id: 'requiresActionToday',
      title: 'Requires Action Today',
      description:
        'Expired, out-of-stock, and low-stock products requiring immediate review.',
      rows: buckets.requiresActionToday,
    },
    {
      id: 'monitorClosely',
      title: 'Monitor Closely',
      description:
        'Products nearing their stock threshold or expiration date that may require action soon.',
      rows: buckets.monitorClosely,
    },
    {
      id: 'noActionRequired',
      title: 'No Action Required',
      description:
        'Products with healthy stock levels and no upcoming expiration concerns.',
      rows: buckets.noActionRequired,
    },
  ]
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

    if (a.quantityInStock !== b.quantityInStock) {
      return a.quantityInStock - b.quantityInStock
    }

    return 0
  })
}

export function buildSortedProductRows(
  products: InventoryProduct[],
): ProductAlertRow[] {
  return sortProductAlertRows(products.map((p) => buildProductAlertRow(p)))
}
