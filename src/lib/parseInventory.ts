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
  opts: { allowZero?: boolean; positiveOnly?: boolean } = {},
): NumberParse {
  const { allowZero = true, positiveOnly = false } = opts
  let n: number | null = null
  if (typeof value === 'number' && !Number.isNaN(value)) n = value
  else if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value.replace(/,/g, '').trim())
    if (!Number.isNaN(parsed)) n = parsed
  }

  if (n === null) {
    return { ok: false, error: `Row ${row}: ${field} must be a number.` }
  }
  if (n < 0) {
    return { ok: false, error: `Row ${row}: ${field} cannot be negative.` }
  }
  if (positiveOnly && n <= 0) {
    return {
      ok: false,
      error: `Row ${row}: ${field} must be greater than zero.`,
    }
  }
  if (!allowZero && n === 0) {
    return {
      ok: false,
      error: `Row ${row}: ${field} must be greater than zero.`,
    }
  }
  return { ok: true, value: n }
}

type DateParse =
  | { ok: true; value: string }
  | { ok: false; error: string }

function parseDate(value: unknown, field: string, row: number): DateParse {
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
    error: `Row ${row}: ${field} must be a valid date.`,
  }
}

function findMissingColumn(headers: string[]): string | null {
  const normalized = new Set(headers.map(normalizeHeader))
  for (const required of REQUIRED_COLUMNS) {
    if (!normalized.has(required)) return required
  }
  return null
}

function isBlank(value: unknown): boolean {
  return value === null || value === undefined || String(value).trim() === ''
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
        error:
          'This spreadsheet appears to be empty. Please check the file and try again.',
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
        error:
          'This spreadsheet appears to be empty. Please check the file and try again.',
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
    const products: InventoryProduct[] = []
    const batchStamp = Date.now()

    rows.forEach((row, index) => {
      const rowNum = index + 2
      const productId = String(get(row, 'Product ID') ?? '').trim()
      const productName = String(get(row, 'Product Name') ?? '').trim()
      const brand = String(get(row, 'Brand') ?? '').trim()

      if (!productId) {
        errors.push(`Row ${rowNum}: Product ID is missing.`)
      }
      if (!productName) {
        errors.push(`Row ${rowNum}: Product Name is missing.`)
      }
      if (!brand) {
        errors.push(`Row ${rowNum}: Brand is missing.`)
      }

      const qty = parseNumber(
        get(row, 'Quantity in Stock (liters/kg)'),
        'Quantity in Stock',
        rowNum,
      )
      const threshold = parseNumber(
        get(row, 'Minimum Stock Threshold (liters/kg)'),
        'Minimum Stock Threshold',
        rowNum,
      )
      const reorderQty = parseNumber(
        get(row, 'Reorder Quantity (liters/kg)'),
        'Reorder Quantity',
        rowNum,
        { allowZero: false },
      )
      const production = parseDate(
        get(row, 'Production Date'),
        'Production Date',
        rowNum,
      )
      const expiration = parseDate(
        get(row, 'Expiration Date'),
        'Expiration Date',
        rowNum,
      )

      if (!qty.ok) errors.push(qty.error)
      if (!threshold.ok) errors.push(threshold.error)
      if (!reorderQty.ok) errors.push(reorderQty.error)
      if (!production.ok) errors.push(production.error)
      if (!expiration.ok) errors.push(expiration.error)

      if (production.ok && expiration.ok && expiration.value < production.value) {
        errors.push(
          `Row ${rowNum}: Expiration Date cannot be earlier than Production Date.`,
        )
      }

      let shelfLifeDays: number | undefined
      const shelfRaw = get(row, 'Shelf Life (days)')
      if (!isBlank(shelfRaw)) {
        const shelf = parseNumber(shelfRaw, 'Shelf Life', rowNum, {
          positiveOnly: true,
        })
        if (!shelf.ok) errors.push(shelf.error)
        else shelfLifeDays = shelf.value
      }

      let quantitySold: number | undefined
      const soldRaw = get(row, 'Quantity Sold (liters/kg)')
      if (!isBlank(soldRaw)) {
        const sold = parseNumber(soldRaw, 'Quantity Sold', rowNum)
        if (!sold.ok) errors.push(sold.error)
        else quantitySold = sold.value
      }

      const storageCondition = String(
        get(row, 'Storage Condition') ?? '',
      ).trim()
      const location = String(get(row, 'Location') ?? '').trim()

      if (
        productId &&
        productName &&
        brand &&
        qty.ok &&
        threshold.ok &&
        reorderQty.ok &&
        production.ok &&
        expiration.ok &&
        expiration.value >= production.value
      ) {
        products.push({
          recordId: `rec-${batchStamp}-${index}`,
          productId,
          productName,
          brand,
          quantityInStock: qty.value,
          minimumStockThreshold: threshold.value,
          reorderQuantity: reorderQty.value,
          productionDate: production.value,
          expirationDate: expiration.value,
          ...(shelfLifeDays !== undefined ? { shelfLifeDays } : {}),
          ...(quantitySold !== undefined ? { quantitySold } : {}),
          ...(storageCondition ? { storageCondition } : {}),
          ...(location ? { location } : {}),
        })
      }
    })

    if (errors.length > 0) {
      return { ok: false, error: errors[0] }
    }

    return {
      ok: true,
      data: {
        fileName: file.name,
        uploadedAt: new Date().toISOString(),
        rowsFound: rows.length,
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
