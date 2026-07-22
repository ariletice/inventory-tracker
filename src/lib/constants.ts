export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024

export const REQUIRED_COLUMNS = [
  'Product Name',
  'Category',
  'Brand',
  'Quantity on Hand',
  'Reorder Threshold',
  'Reorder Quantity',
  'Expiration Date',
  'Storage Conditions',
  'Sales Rate',
] as const

export const COLUMN_ALIASES: Record<string, string> = {
  'product name': 'Product Name',
  product: 'Product Name',
  productname: 'Product Name',
  name: 'Product Name',
  category: 'Category',
  brand: 'Brand',
  'quantity on hand': 'Quantity on Hand',
  quantityonhand: 'Quantity on Hand',
  qty: 'Quantity on Hand',
  quantity: 'Quantity on Hand',
  'on hand': 'Quantity on Hand',
  'reorder threshold': 'Reorder Threshold',
  reorderthreshold: 'Reorder Threshold',
  threshold: 'Reorder Threshold',
  'reorder quantity': 'Reorder Quantity',
  reorderquantity: 'Reorder Quantity',
  'reorder qty': 'Reorder Quantity',
  'expiration date': 'Expiration Date',
  expirationdate: 'Expiration Date',
  expiry: 'Expiration Date',
  'expiry date': 'Expiration Date',
  'storage conditions': 'Storage Conditions',
  storageconditions: 'Storage Conditions',
  storage: 'Storage Conditions',
  'sales rate': 'Sales Rate',
  salesrate: 'Sales Rate',
  'units per day': 'Sales Rate',
}

export const USER_PROFILE = {
  name: 'Alicia Morgan',
  role: 'Inventory Coordinator',
  company: 'FreshRoute',
} as const
