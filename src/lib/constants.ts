export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024

export const REQUIRED_COLUMNS = [
  'Product ID',
  'Product Name',
  'Brand',
  'Quantity in Stock (liters/kg)',
  'Minimum Stock Threshold (liters/kg)',
  'Reorder Quantity (liters/kg)',
  'Production Date',
  'Expiration Date',
] as const

export const OPTIONAL_COLUMNS = [
  'Shelf Life (days)',
  'Quantity Sold (liters/kg)',
  'Storage Condition',
  'Location',
] as const

export const COLUMN_ALIASES: Record<string, string> = {
  'product id': 'Product ID',
  productid: 'Product ID',
  'product name': 'Product Name',
  productname: 'Product Name',
  product: 'Product Name',
  name: 'Product Name',
  brand: 'Brand',
  'quantity in stock (liters/kg)': 'Quantity in Stock (liters/kg)',
  'quantity in stock': 'Quantity in Stock (liters/kg)',
  quantityinstock: 'Quantity in Stock (liters/kg)',
  'quantity on hand': 'Quantity in Stock (liters/kg)',
  'minimum stock threshold (liters/kg)': 'Minimum Stock Threshold (liters/kg)',
  'minimum stock threshold': 'Minimum Stock Threshold (liters/kg)',
  minimumstockthreshold: 'Minimum Stock Threshold (liters/kg)',
  'reorder threshold': 'Minimum Stock Threshold (liters/kg)',
  'reorder quantity (liters/kg)': 'Reorder Quantity (liters/kg)',
  'reorder quantity': 'Reorder Quantity (liters/kg)',
  reorderquantity: 'Reorder Quantity (liters/kg)',
  'production date': 'Production Date',
  productiondate: 'Production Date',
  'expiration date': 'Expiration Date',
  expirationdate: 'Expiration Date',
  expiry: 'Expiration Date',
  'expiry date': 'Expiration Date',
  'shelf life (days)': 'Shelf Life (days)',
  'shelf life': 'Shelf Life (days)',
  shelflife: 'Shelf Life (days)',
  'quantity sold (liters/kg)': 'Quantity Sold (liters/kg)',
  'quantity sold': 'Quantity Sold (liters/kg)',
  quantitysold: 'Quantity Sold (liters/kg)',
  'storage condition': 'Storage Condition',
  storagecondition: 'Storage Condition',
  'storage conditions': 'Storage Condition',
  storage: 'Storage Condition',
  location: 'Location',
}

export const USER_PROFILE = {
  name: 'Alicia Morgan',
  role: 'Inventory Coordinator',
  company: 'FreshRoute',
} as const

export const FILE_REQUIREMENTS_TOOLTIP =
  'Your file must include all required columns. Each row should represent one inventory record or batch. Numeric fields cannot contain negative values, production and expiration dates must be valid, and Product ID cannot be blank. The same Product ID may appear on more than one row.'

export const UPLOAD_CHECKLIST = [
  'One inventory record per row',
  'Product ID included',
  'Required columns included',
  'No negative quantities',
  'Valid production and expiration dates',
  'CSV or XLSX format',
] as const
