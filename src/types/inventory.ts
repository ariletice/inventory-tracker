export type InventoryProduct = {
  id: string
  sku: string
  productName: string
  category: string
  brand: string
  quantityOnHand: number
  reorderThreshold: number
  reorderQuantity: number
  expirationDate: string
  storageConditions: string
  salesRate: number
  reviewed?: boolean
}

export type PriorityTier = 'needsAttention' | 'nextInQueue' | 'none'

export type StatusLabel =
  | 'Out of Stock'
  | 'Reorder Now'
  | 'Expiring Soon'
  | 'Monitor Stock'
  | 'Upcoming Expiration'

export type SortOption =
  | 'urgency'
  | 'quantity'
  | 'expiration'
  | 'salesRate'

export type PrioritizedProduct = InventoryProduct & {
  tier: PriorityTier
  statusLabel: StatusLabel | null
  reasonFlagged: string
  recommendedAction: string
  urgencyScore: number
  daysOfInventory: number | null
  daysUntilExpiry: number
  reviewTiming?: string
}

export type ValidationError = {
  row?: number
  field?: string
  message: string
}

export type InventoryImportState = {
  fileName: string
  uploadedAt: string
  rowsFound: number
  uniqueSkus: number
  products: InventoryProduct[]
  validationErrors: ValidationError[]
}
