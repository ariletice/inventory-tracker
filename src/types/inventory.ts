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
  | 'Expired'
  | 'Low Stock'
  | 'Expiring Soon'
  | 'No Recent Sales'
  | 'In Good Standing'
  | 'Reviewed'

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

export type ProductAlertRow = InventoryProduct & {
  statuses: StatusLabel[]
  primaryStatus: StatusLabel
  recommendedAction: string
  reasonFlagged: string
  daysOfInventory: number | null
  daysUntilExpiry: number
  sortRank: number
}
