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

function daysOfInventory(quantity: number, salesRate: number): number | null {
  if (salesRate <= 0) return quantity > 0 ? Infinity : 0
  return quantity / salesRate
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
  const qty = product.quantityOnHand
  const threshold = product.reorderThreshold
  const doi = daysOfInventory(qty, product.salesRate)
  const daysLeft = doi === Infinity ? Number.POSITIVE_INFINITY : (doi ?? 0)
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
      statusLabel: 'Expiring Soon',
      reasonFlagged: 'Product is already expired',
      recommendedAction: 'Remove expired inventory',
      urgencyScore: 95,
    }
  }

  if (qty <= threshold) {
    return {
      tier: 'needsAttention',
      statusLabel: 'Reorder Now',
      reasonFlagged: 'Quantity on hand is at or below the reorder threshold',
      recommendedAction: `Reorder ${product.reorderQuantity} units`,
      urgencyScore: 85 + Math.max(0, 10 - (qty / Math.max(threshold, 1)) * 10),
    }
  }

  if (daysLeft <= 3) {
    return {
      tier: 'needsAttention',
      statusLabel: 'Reorder Now',
      reasonFlagged: 'Expected to run out within three days based on sales rate',
      recommendedAction: `Reorder ${product.reorderQuantity} units`,
      urgencyScore: 80 + (3 - daysLeft) * 3,
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
      statusLabel: 'Monitor Stock',
      reasonFlagged: 'Approaching reorder threshold',
      recommendedAction: 'Confirm incoming shipment',
      urgencyScore: 45,
      reviewTiming: 'Review tomorrow',
    }
  }

  if (daysLeft >= 4 && daysLeft <= 7) {
    return {
      tier: 'nextInQueue',
      statusLabel: 'Monitor Stock',
      reasonFlagged: 'May run out within four to seven days',
      recommendedAction: 'Confirm incoming shipment',
      urgencyScore: 40 + (7 - daysLeft),
      reviewTiming: daysLeft <= 5 ? 'Review within 3 days' : 'Review this week',
    }
  }

  if (daysUntilExpiry >= 8 && daysUntilExpiry <= 14) {
    return {
      tier: 'nextInQueue',
      statusLabel: 'Upcoming Expiration',
      reasonFlagged: 'Expires within eight to fourteen days',
      recommendedAction: 'Prioritize distribution',
      urgencyScore: 30 + (14 - daysUntilExpiry),
      reviewTiming:
        daysUntilExpiry <= 10 ? 'Review within 3 days' : 'Review this week',
    }
  }

  return {
    tier: 'none',
    statusLabel: null,
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
    const doi = daysOfInventory(product.quantityOnHand, product.salesRate)

    return {
      ...product,
      ...evaluation,
      daysOfInventory:
        doi === Infinity ? null : doi === null ? null : Math.round(doi * 10) / 10,
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
      return sorted.sort((a, b) => a.quantityOnHand - b.quantityOnHand)
    case 'expiration':
      return sorted.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry)
    case 'salesRate':
      return sorted.sort((a, b) => b.salesRate - a.salesRate)
    case 'urgency':
    default:
      return sorted.sort((a, b) => b.urgencyScore - a.urgencyScore)
  }
}

export function getSummaryCounts(products: PrioritizedProduct[]) {
  const needsAttention = products.filter((p) => p.tier === 'needsAttention').length
  const nextInQueue = products.filter((p) => p.tier === 'nextInQueue').length
  const lowStock = products.filter(
    (p) => p.quantityOnHand <= p.reorderThreshold,
  ).length
  const expiringSoon = products.filter(
    (p) => p.daysUntilExpiry >= 0 && p.daysUntilExpiry <= 14,
  ).length

  return { needsAttention, nextInQueue, lowStock, expiringSoon }
}
