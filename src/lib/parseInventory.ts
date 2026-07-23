import * as XLSX from 'xlsx'
import { COLUMN_ALIASES, MAX_FILE_SIZE_BYTES, REQUIRED_COLUMNS } from './constants'
import type { InventoryImportState, InventoryProduct } from '../types/inventory'

export type ParseResult =
  | { ok: true; data: InventoryImportState }
  | { ok: false; error: string }

function normalizeHeader(header: string): string {
  const cleaned = header.trim().toLowerCase().replace(/\s+/g, ' ')
  const compact = cleaned.replace(/[^a-z0-9]/g, '')
  return (
    COLUMN_ALIASES[cleaned] ??
    COLUMN_ALIASES[compact] ??
    header.trim()
  )
}

type NumberParse =
  | { ok: true; value: number }
  | { ok: false; error: string }

function parseNumber(
  value: unknown,
  field: string,
  row: number,
  opts: { min?: number; allowZero?: boolean } = {},
): NumberParse {
  const { min = 0, allowZero = true } = opts
  let n: number | null = null
  if (typeof value === 'number' && !Number.isNaN(value)) n = value
  else if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value.replace(/,/g, '').trim())
    if (!Number.isNaN(parsed)) n = parsed
  }

  if (n === null) {
    return {
      ok: false,
      error: `Row ${row}: ${field} must be a number.`,
    }
  }
  if (n < 0) {
    return {
      ok: false,
      error: `Row ${row}: ${field} cannot be negative.`,
    }
  }
  if (!allowZero && n === 0) {
    return {
      ok: false,
      error: `Row ${row}: ${field} must be greater than zero.`,
    }
  }
  if (n < min) {
    return {
      ok: false,
      error: `Row ${row}: ${field} must be ${min} or greater.`,
    }
  }
  return { ok: true, value: n }
}

type DateParse =
  | { ok: true; value: string }
  | { ok: false; error: string }

function parseDate(value: unknown, row: number): DateParse {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return { ok: true, value: value.toISOString().slice(0, 10) }
  }
  if (typeof value === 'number') {
    const parsed = XLSX.SSF.parse_date_code(value)
    if (parsed) {
      const mm = String(parsed.m).padStart(2, '0')
      const dd = String(parsed.d).padStart(2, '0')
      return { ok: true, value: `${parsed.y}-${mm}-${dd}` }
    }
  }
  if (typeof value === 'string' && value.trim()) {
    const d = new Date(value.trim())
    if (!Number.isNaN(d.getTime())) {
      return { ok: true, value: d.toISOString().slice(0, 10) }
    }
  }
  return {
    ok: false,
    error: `Row ${row}: Expiration Date must be a valid date.`,
  }
}

function findMissingColumn(headers: string[]): string | null {
  const normalized = new Set(headers.map(normalizeHeader))
  for (const required of REQUIRED_COLUMNS) {
    if (!normalized.has(required)) return required
  }
  return null
}

export async function parseInventoryFile(file: File): Promise<ParseResult> {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      ok: false,
      error:
        'This file is larger than 10 MB. Please upload a smaller spreadsheet and try again.',
    }
  }

  const name = file.name.toLowerCase()
  if (!name.endsWith('.csv') && !name.endsWith('.xlsx') && !name.endsWith('.xls')) {
    return {
      ok: false,
      error:
        'We could not process this file. Please upload a CSV or XLSX spreadsheet.',
    }
  }

  try {
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'array', cellDates: true })
    const sheetName = workbook.SheetNames[0]
    if (!sheetName) {
      return {
        ok: false,
        error: 'This spreadsheet appears to be empty. Please check the file and try again.',
      }
    }

    const sheet = workbook.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: '',
      raw: true,
    })

    if (rows.length === 0) {
      return {
        ok: false,
        error: 'This spreadsheet appears to be empty. Please check the file and try again.',
      }
    }

    const originalHeaders = Object.keys(rows[0])
    const missing = findMissingColumn(originalHeaders)
    if (missing) {
      return {
        ok: false,
        error: `The ${missing} column is missing.`,
      }
    }

    const headerMap = new Map<string, string>()
    for (const h of originalHeaders) {
      headerMap.set(normalizeHeader(h), h)
    }

    const get = (row: Record<string, unknown>, col: string) =>
      row[headerMap.get(col) ?? col]

    const errors: string[] = []
    const skuFirstRow = new Map<string, number>()
    const draft: Array<{
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
    }> = []

    rows.forEach((row, index) => {
      const rowNum = index + 2
      const sku = String(get(row, 'SKU') ?? '').trim()
      const productName = String(get(row, 'Product Name') ?? '').trim()
      const brand = String(get(row, 'Brand') ?? '').trim()
      const category = String(get(row, 'Category') ?? '').trim()
      const storageConditions = String(
        get(row, 'Storage Conditions') ?? '',
      ).trim()

      if (!sku) {
        errors.push(`Row ${rowNum}: SKU is missing.`)
      } else if (skuFirstRow.has(sku)) {
        errors.push(`Row ${rowNum}: Duplicate SKU ${sku}.`)
      } else {
        skuFirstRow.set(sku, rowNum)
      }

      if (!productName) {
        errors.push(`Row ${rowNum}: Product Name is missing.`)
      }
      if (!brand) {
        errors.push(`Row ${rowNum}: Brand is missing.`)
      }
      if (!category) {
        errors.push(`Row ${rowNum}: Category is missing.`)
      }
      if (!storageConditions) {
        errors.push(`Row ${rowNum}: Storage Conditions is missing.`)
      }

      const qty = parseNumber(get(row, 'Quantity on Hand'), 'Quantity On Hand', rowNum)
      const threshold = parseNumber(
        get(row, 'Reorder Threshold'),
        'Reorder Threshold',
        rowNum,
      )
      const reorderQty = parseNumber(
        get(row, 'Reorder Quantity'),
        'Reorder Quantity',
        rowNum,
        { allowZero: false },
      )
      const salesRate = parseNumber(get(row, 'Sales Rate'), 'Sales Rate', rowNum)
      const expiration = parseDate(get(row, 'Expiration Date'), rowNum)

      if (!qty.ok) errors.push(qty.error)
      if (!threshold.ok) errors.push(threshold.error)
      if (!reorderQty.ok) errors.push(reorderQty.error)
      if (!salesRate.ok) errors.push(salesRate.error)
      if (!expiration.ok) errors.push(expiration.error)

      if (
        sku &&
        !errors.some((e) => e.includes(`Duplicate SKU ${sku}`)) &&
        productName &&
        brand &&
        category &&
        storageConditions &&
        qty.ok &&
        threshold.ok &&
        reorderQty.ok &&
        salesRate.ok &&
        expiration.ok
      ) {
        draft.push({
          sku,
          productName,
          brand,
          category,
          storageConditions,
          quantityOnHand: qty.value,
          reorderThreshold: threshold.value,
          reorderQuantity: reorderQty.value,
          salesRate: salesRate.value,
          expirationDate: expiration.value,
        })
      }
    })

    if (errors.length > 0) {
      return { ok: false, error: errors[0] }
    }

    const products: InventoryProduct[] = draft.map((item) => ({
      id: item.sku,
      sku: item.sku,
      productName: item.productName,
      brand: item.brand,
      category: item.category,
      storageConditions: item.storageConditions,
      quantityOnHand: item.quantityOnHand,
      reorderThreshold: item.reorderThreshold,
      reorderQuantity: item.reorderQuantity,
      salesRate: item.salesRate,
      expirationDate: item.expirationDate,
    }))

    return {
      ok: true,
      data: {
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
        rowsFound: rows.length,
        uniqueSkus: products.length,
        products,
        validationErrors: [],
      },
    }
  } catch {
    return {
      ok: false,
      error:
        'We could not process this file. Please check the format and upload it again.',
    }
  }
}
