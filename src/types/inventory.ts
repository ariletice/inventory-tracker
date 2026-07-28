export type InventoryProduct = {
  recordId: string
  productId: string
  productName: string
  brand: string
  quantityInStock: number
  minimumStockThreshold: number
  reorderQuantity: number
  productionDate: string
  expirationDate: string
  category?: string
  shelfLifeDays?: number
  quantitySold?: number
  storageCondition?: string
  location?: string
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
