import { useCallback, useEffect, useRef, useState } from 'react'
import {
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  Upload,
  X,
  AlertCircle,
  Download,
} from 'lucide-react'
import { MAX_FILE_SIZE_BYTES } from '../../lib/constants'
import { parseInventoryFile } from '../../lib/parseInventory'
import type { InventoryProduct } from '../../types/inventory'

type UploadModalProps = {
  open: boolean
  onClose: () => void
  onSuccess: (products: InventoryProduct[]) => void
}

type UploadState =
  | { status: 'idle' }
  | { status: 'loading'; fileName: string }
  | { status: 'success'; fileName: string; count: number }
  | { status: 'error'; message: string }

export function UploadModal({ open, onClose, onSuccess }: UploadModalProps) {
  const [state, setState] = useState<UploadState>({ status: 'idle' })
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    setState({ status: 'idle' })
    closeRef.current?.focus()
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && state.status !== 'loading') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose, state.status])

  const processFile = useCallback(
    async (file: File) => {
      setState({ status: 'loading', fileName: file.name })
      // Brief delay so loading state is visible
      await new Promise((r) => setTimeout(r, 400))
      const result = await parseInventoryFile(file)

      if (!result.ok) {
        setState({ status: 'error', message: result.error })
        return
      }

      setState({
        status: 'success',
        fileName: file.name,
        count: result.products.length,
      })

      await new Promise((r) => setTimeout(r, 900))
      onSuccess(result.products)
      onClose()
    },
    [onClose, onSuccess],
  )

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) void processFile(file)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-brand-navy/40"
        aria-label="Close upload dialog"
        onClick={() => {
          if (state.status !== 'loading') onClose()
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-modal-title"
        className="relative w-full max-w-lg rounded-2xl border border-brand-border bg-brand-white shadow-xl"
      >
        <div className="flex items-start justify-between gap-3 border-b border-brand-border px-5 py-4">
          <div>
            <h2
              id="upload-modal-title"
              className="text-lg font-semibold text-brand-navy"
            >
              Upload Inventory File
            </h2>
            <p className="mt-1 text-sm text-brand-muted">
              Import a CSV or Excel spreadsheet to refresh your priority lists.
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            disabled={state.status === 'loading'}
            className="rounded-lg p-2 text-brand-muted hover:bg-brand-bg disabled:opacity-50"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 px-5 py-5">
          {state.status === 'idle' && (
            <>
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragging(true)
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className={`flex flex-col items-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition ${
                  dragging
                    ? 'border-brand-blue bg-brand-blue-light'
                    : 'border-brand-border bg-brand-bg'
                }`}
              >
                <div className="mb-3 rounded-xl bg-brand-white p-3 text-brand-blue shadow-sm">
                  <Upload className="h-6 w-6" aria-hidden />
                </div>
                <p className="text-sm font-medium text-brand-text">
                  Drag and drop your inventory file here
                </p>
                <p className="mt-1 text-xs text-brand-muted">
                  Accepted formats: CSV and XLSX · Max size{' '}
                  {MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB
                </p>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border border-brand-border bg-brand-white px-4 py-2 text-sm font-semibold text-brand-text shadow-sm transition hover:bg-brand-bg"
                >
                  <FileSpreadsheet className="h-4 w-4" aria-hidden />
                  Browse files
                </button>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
                  className="sr-only"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) void processFile(file)
                    e.target.value = ''
                  }}
                />
              </div>

              <a
                href="/sample-inventory-template.csv"
                download
                className="inline-flex items-center gap-2 text-sm font-medium text-brand-blue hover:underline"
              >
                <Download className="h-4 w-4" aria-hidden />
                Download sample template
              </a>
            </>
          )}

          {state.status === 'loading' && (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Loader2
                className="h-10 w-10 animate-spin text-brand-blue"
                aria-hidden
              />
              <p className="text-sm font-medium text-brand-text">
                Processing {state.fileName}…
              </p>
              <p className="text-xs text-brand-muted">
                Organizing products and ranking by urgency.
              </p>
            </div>
          )}

          {state.status === 'success' && (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <CheckCircle2
                className="h-10 w-10 text-green-600"
                aria-hidden
              />
              <p className="text-sm font-semibold text-brand-text">
                Upload successful
              </p>
              <p className="text-sm text-brand-muted">
                {state.count} products imported from {state.fileName}.
              </p>
            </div>
          )}

          {state.status === 'error' && (
            <div className="space-y-4">
              <div
                role="alert"
                className="flex gap-3 rounded-xl border border-red-200 bg-brand-danger-light p-4"
              >
                <AlertCircle
                  className="mt-0.5 h-5 w-5 shrink-0 text-brand-danger"
                  aria-hidden
                />
                <p className="text-sm text-brand-text">{state.message}</p>
              </div>
              <button
                type="button"
                onClick={() => setState({ status: 'idle' })}
                className="w-full rounded-xl bg-brand-orange px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
