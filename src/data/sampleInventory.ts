import type { InventoryProduct } from '../types/inventory'

/** Helper: ISO date relative to today */
function daysFromNow(days: number): string {
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export const sampleInventory: InventoryProduct[] = [
  {
    recordId: 'sample-1',
    productId: 'FR-MLK-001',
    productName: 'Whole Milk',
    category: 'Milk',
    brand: 'FreshRoute Dairy',
    quantityInStock: 8,
    minimumStockThreshold: 24,
    reorderQuantity: 48,
    productionDate: daysFromNow(-10),
    expirationDate: daysFromNow(4),
    shelfLifeDays: 14,
    quantitySold: 12,
    storageCondition: 'Refrigerated 34–38°F',
    location: 'Cooler A',
  },
  {
    recordId: 'sample-2',
    productId: 'FR-MLK-002',
    productName: '2% Milk',
    category: 'Milk',
    brand: 'FreshRoute Dairy',
    quantityInStock: 36,
    minimumStockThreshold: 30,
    reorderQuantity: 48,
    productionDate: daysFromNow(-5),
    expirationDate: daysFromNow(10),
    shelfLifeDays: 14,
    quantitySold: 10,
    storageCondition: 'Refrigerated 34–38°F',
    location: 'Cooler A',
  },
  {
    recordId: 'sample-3',
    productId: 'VC-MLK-003',
    productName: 'Skim Milk',
    category: 'Milk',
    brand: 'Valley Cream',
    quantityInStock: 0,
    minimumStockThreshold: 18,
    reorderQuantity: 36,
    productionDate: daysFromNow(-12),
    expirationDate: daysFromNow(2),
    shelfLifeDays: 14,
    quantitySold: 6,
    storageCondition: 'Refrigerated 34–38°F',
    location: 'Cooler B',
  },
  {
    recordId: 'sample-4',
    productId: 'OF-YOG-005',
    productName: 'Greek Yogurt',
    category: 'Yogurt',
    brand: 'Orchard Farms',
    quantityInStock: 22,
    minimumStockThreshold: 20,
    reorderQuantity: 40,
    productionDate: daysFromNow(-8),
    expirationDate: daysFromNow(12),
    shelfLifeDays: 21,
    quantitySold: 0,
    storageCondition: 'Refrigerated 34–38°F',
    location: 'Cooler C',
  },
]
