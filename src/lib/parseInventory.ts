import * as XLSX from 'xlsx'
import { COLUMN_ALIASES, MAX_FILE_SIZE_BYTES, REQUIRED_COLUMNS } from './constants'
import type { InventoryProduct } from '../types/inventory'

export type ParseResult =
  | { ok: true; products: InventoryProduct[] }
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

function parseNumber(value: unknown, field: string, row: number): number {
  if (typeof value === 'number' && !Number.isNaN(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number(value.replace(/,/g, '').trim())
    if (!Number.isNaN(n)) return n
  }
  throw new Error(
    `Row ${row}: “${field}” must be a number. Please update the spreadsheet and upload it again.`,
  )
}

function parseDate(value: unknown, row: number): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10)
  }
  if (typeof value === 'number') {
    const parsed = XLSX.SSF.parse_date_code(value)
    if (parsed) {
      const mm = String(parsed.m).padStart(2, '0')
      const dd = String(parsed.d).padStart(2, '0')
      return `${parsed.y}-${mm}-${dd}`
    }
  }
  if (typeof value === 'string' && value.trim()) {
    const d = new Date(value.trim())
    if (!Number.isNaN(d.getTime())) {
      return d.toISOString().slice(0, 10)
    }
  }
  throw new Error(
    `Row ${row}: “Expiration Date” is invalid. Please update the spreadsheet and upload it again.`,
  )
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
        'This file is larger than 5 MB. Please upload a smaller spreadsheet and try again.',
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
        error: `We could not process this file because the “${missing}” column is missing. Please update the spreadsheet and upload it again.`,
      }
    }

    const headerMap = new Map<string, string>()
    for (const h of originalHeaders) {
      headerMap.set(normalizeHeader(h), h)
    }

    const get = (row: Record<string, unknown>, col: string) =>
      row[headerMap.get(col) ?? col]

    const products: InventoryProduct[] = rows.map((row, index) => {
      const rowNum = index + 2
      const productName = String(get(row, 'Product Name') ?? '').trim()
      if (!productName) {
        throw new Error(
          `Row ${rowNum}: “Product Name” is required. Please update the spreadsheet and upload it again.`,
        )
      }

      return {
        id: `upload-${Date.now()}-${index}`,
        productName,
        category: String(get(row, 'Category') ?? '').trim() || 'Uncategorized',
        brand: String(get(row, 'Brand') ?? '').trim() || 'Unknown',
        quantityOnHand: parseNumber(get(row, 'Quantity on Hand'), 'Quantity on Hand', rowNum),
        reorderThreshold: parseNumber(
          get(row, 'Reorder Threshold'),
          'Reorder Threshold',
          rowNum,
        ),
        reorderQuantity: parseNumber(
          get(row, 'Reorder Quantity'),
          'Reorder Quantity',
          rowNum,
        ),
        expirationDate: parseDate(get(row, 'Expiration Date'), rowNum),
        storageConditions:
          String(get(row, 'Storage Conditions') ?? '').trim() || 'Not specified',
        salesRate: parseNumber(get(row, 'Sales Rate'), 'Sales Rate', rowNum),
      }
    })

    return { ok: true, products }
  } catch (err) {
    if (err instanceof Error) {
      return { ok: false, error: err.message }
    }
    return {
      ok: false,
      error:
        'We could not process this file. Please check the format and upload it again.',
    }
  }
}
