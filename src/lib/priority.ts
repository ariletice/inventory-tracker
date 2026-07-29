import type {
  InventoryProduct,
  PrioritizedProduct,
  PriorityTier,
  SortOption,
  StatusLabel,
} from '../types/inventory'

function startOfToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function daysUntil(dateStr: string, today = startOfToday()): number {
  const target = new Date(dateStr + 'T12:00:00')
  target.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

type Evaluation = {
  tier: PriorityTier
  statusLabel: StatusLabel | null
  reasonFlagged: string
  recommendedAction: string
  urgencyScore: number
  reviewTiming?: string
}

function evaluateProduct(product: InventoryProduct, today: Date): Evaluation {
  const qty = product.quantityInStock
  const threshold = product.minimumStockThreshold
  const daysUntilExpiry = daysUntil(product.expirationDate, today)

  // Needs Attention Today
  if (qty <= 0) {
    return {
      tier: 'needsAttention',
      statusLabel: 'Out of Stock',
      reasonFlagged: 'Product is out of stock',
      recommendedAction: 'Review supplier availability',
      urgencyScore: 100,
    }
  }

  if (daysUntilExpiry <= 0) {
    return {
      tier: 'needsAttention',
      statusLabel: 'Expired',
      reasonFlagged: 'Product is already expired',
      recommendedAction: 'Remove expired inventory',
      urgencyScore: 95,
    }
  }

  if (qty <= threshold) {
    return {
      tier: 'needsAttention',
      statusLabel: 'Low Stock',
      reasonFlagged: 'Quantity on hand is at or below the reorder threshold',
      recommendedAction: `Reorder ${product.reorderQuantity} liters/kg`,
      urgencyScore: 85 + Math.max(0, 10 - (qty / Math.max(threshold, 1)) * 10),
    }
  }

  if (daysUntilExpiry <= 7) {
    return {
      tier: 'needsAttention',
      statusLabel: 'Expiring Soon',
      reasonFlagged: 'Expires within seven days',
      recommendedAction: 'Prioritize distribution',
      urgencyScore: 70 + (7 - daysUntilExpiry),
    }
  }

  // Next in Queue
  const approachingThreshold = qty <= threshold * 1.25

  if (approachingThreshold) {
    return {
      tier: 'nextInQueue',
      statusLabel: 'Low Stock',
      reasonFlagged: 'Approaching reorder threshold',
      recommendedAction: 'Confirm incoming shipment',
      urgencyScore: 45,
      reviewTiming: 'Review tomorrow',
    }
  }

  if (daysUntilExpiry >= 8 && daysUntilExpiry <= 14) {
    return {
      tier: 'nextInQueue',
      statusLabel: 'Expiring Soon',
      reasonFlagged: 'Expires within eight to fourteen days',
      recommendedAction: 'Prioritize distribution',
      urgencyScore: 30 + (14 - daysUntilExpiry),
      reviewTiming:
        daysUntilExpiry <= 10 ? 'Review within 3 days' : 'Review this week',
    }
  }

  return {
    tier: 'none',
    statusLabel: 'In Good Standing',
    reasonFlagged: '',
    recommendedAction: '',
    urgencyScore: 0,
  }
}

export function prioritizeInventory(
  products: InventoryProduct[],
  asOf: Date = new Date(),
): PrioritizedProduct[] {
  const today = new Date(asOf)
  today.setHours(0, 0, 0, 0)

  return products.map((product) => {
    const evaluation = evaluateProduct(product, today)

    return {
      ...product,
      ...evaluation,
      daysOfInventory: null,
      daysUntilExpiry: daysUntil(product.expirationDate, today),
    }
  })
}

export function sortPrioritized(
  products: PrioritizedProduct[],
  sortBy: SortOption,
): PrioritizedProduct[] {
  const sorted = [...products]
  switch (sortBy) {
    case 'quantity':
      return sorted.sort((a, b) => a.quantityInStock - b.quantityInStock)
    case 'expiration':
      return sorted.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry)
    case 'salesRate':
      return sorted.sort(
        (a, b) => (b.quantitySold ?? 0) - (a.quantitySold ?? 0),
      )
    case 'urgency':
    default:
      return sorted.sort((a, b) => b.urgencyScore - a.urgencyScore)
  }
}

export function getAlertCounts(products: InventoryProduct[]) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const fourteenDaysFromToday = new Date(today)
  fourteenDaysFromToday.setDate(today.getDate() + 14)

  const expired = products.filter((product) => {
    const expirationDate = new Date(product.expirationDate + 'T12:00:00')
    if (Number.isNaN(expirationDate.getTime())) return false
    expirationDate.setHours(0, 0, 0, 0)
    return expirationDate < today
  }).length

  const outOfStock = products.filter(
    (product) => product.quantityInStock === 0,
  ).length

  const lowStock = products.filter(
    (product) =>
      product.quantityInStock > 0 &&
      product.quantityInStock <= product.minimumStockThreshold,
  ).length

  const expiringWithin14Days = products.filter((product) => {
    const expirationDate = new Date(product.expirationDate + 'T12:00:00')
    if (Number.isNaN(expirationDate.getTime())) return false

    expirationDate.setHours(0, 0, 0, 0)

    return (
      expirationDate >= today && expirationDate <= fourteenDaysFromToday
    )
  }).length

  return {
    expired,
    outOfStock,
    lowStock,
    expiringWithin14Days,
    totalRecords: products.length,
  }
}
