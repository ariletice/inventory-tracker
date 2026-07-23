import { useId, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  Check,
  Download,
  FileSpreadsheet,
  Info,
  Loader2,
  Upload,
  X,
} from 'lucide-react'
import { useInventory } from '../context/InventoryContext'
import {
  FILE_REQUIREMENTS_TOOLTIP,
  MAX_FILE_SIZE_BYTES,
  UPLOAD_CHECKLIST,
} from '../lib/constants'
import { parseInventoryFile } from '../lib/parseInventory'

type UiState =
  | { status: 'idle' }
  | { status: 'selected'; file: File }
  | { status: 'loading'; file: File }
  | { status: 'error'; file: File | null; message: string }

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function fileTypeLabel(name: string): string {
  const lower = name.toLowerCase()
  if (lower.endsWith('.csv')) return 'CSV'
  if (lower.endsWith('.xlsx')) return 'XLSX'
  if (lower.endsWith('.xls')) return 'XLS'
  return 'Spreadsheet'
}

function LogoMark() {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-blue text-white shadow-sm"
        aria-hidden
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
          <path
            d="M4 16V8l8-4 8 4v8l-8 4-8-4z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
          <path
            d="M12 4v16M4 8l8 4 8-4"
            stroke="#F97316"
            strokeWidth="1.75"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div>
        <p className="text-lg font-semibold tracking-tight text-brand-navy">
          StockFlow
        </p>
        <p className="text-xs text-brand-muted">Know what needs attention first.</p>
      </div>
    </div>
  )
}

export function UploadPage() {
  const navigate = useNavigate()
  const { setImportState } = useInventory()
  const inputRef = useRef<HTMLInputElement>(null)
  const tipId = useId()
  const [tipOpen, setTipOpen] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [state, setState] = useState<UiState>({ status: 'idle' })

  const selectedFile =
    state.status === 'selected' || state.status === 'loading'
      ? state.file
      : state.status === 'error'
        ? state.file
        : null

  const canSubmit = state.status === 'selected'

  const assignFile = (file: File | undefined) => {
    if (!file) return
    setState({ status: 'selected', file })
  }

  const removeFile = () => {
    setState({ status: 'idle' })
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleUpload = async () => {
    if (state.status !== 'selected') return
    const file = state.file
    setState({ status: 'loading', file })
    await new Promise((r) => setTimeout(r, 450))
    const result = await parseInventoryFile(file)
    if (!result.ok) {
      setState({ status: 'error', file, message: result.error })
      return
    }
    setImportState(result.data)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-full bg-brand-white">
      <div className="mx-auto flex min-h-full max-w-2xl flex-col px-4 py-10 sm:px-6">
        <LogoMark />

        <div className="mt-12 text-center sm:mt-16">
          <h1 className="text-3xl font-semibold tracking-tight text-brand-navy sm:text-4xl">
            Upload Your Inventory File
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-base text-brand-muted">
            Upload a CSV or Excel file to organize your inventory and identify
            which products need attention.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-brand-border bg-brand-white p-5 shadow-sm sm:p-8">
          <div className="mb-4 flex items-center gap-2">
            <p className="text-sm font-medium text-brand-text">File requirements</p>
            <div className="relative">
              <button
                type="button"
                className="rounded-full p-0.5 text-brand-muted hover:text-brand-blue"
                aria-label="File requirements details"
                aria-describedby={tipOpen ? tipId : undefined}
                aria-expanded={tipOpen}
                onMouseEnter={() => setTipOpen(true)}
                onMouseLeave={() => setTipOpen(false)}
                onFocus={() => setTipOpen(true)}
                onBlur={() => setTipOpen(false)}
                onClick={() => setTipOpen((v) => !v)}
              >
                <Info className="h-4 w-4" />
              </button>
              {tipOpen && (
                <div
                  id={tipId}
                  role="tooltip"
                  className="absolute left-1/2 top-full z-20 mt-2 w-72 -translate-x-1/2 rounded-xl border border-brand-border bg-brand-white p-3 text-left text-xs leading-relaxed text-brand-text shadow-lg sm:w-80"
                >
                  {FILE_REQUIREMENTS_TOOLTIP}
                </div>
              )}
            </div>
          </div>

          {state.status === 'loading' ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-brand-border bg-brand-bg px-6 py-16 text-center">
              <Loader2
                className="h-10 w-10 animate-spin text-brand-blue"
                aria-hidden
              />
              <p className="text-sm font-medium text-brand-text">
                Checking your inventory file…
              </p>
            </div>
          ) : selectedFile ? (
            <div className="rounded-2xl border border-brand-border bg-brand-bg px-5 py-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-brand-white p-2.5 text-brand-blue shadow-sm">
                    <FileSpreadsheet className="h-5 w-5" aria-hidden />
                  </div>
                  <div>
                    <p className="font-medium text-brand-text">{selectedFile.name}</p>
                    <p className="mt-1 text-sm text-brand-muted">
                      {fileTypeLabel(selectedFile.name)} ·{' '}
                      {formatBytes(selectedFile.size)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="rounded-lg p-2 text-brand-muted hover:bg-brand-white hover:text-brand-text"
                  aria-label="Remove file"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setDragging(true)
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault()
                setDragging(false)
                assignFile(e.dataTransfer.files[0])
              }}
              className={`flex flex-col items-center rounded-2xl border-2 border-dashed px-6 py-12 text-center transition ${
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
                Accepted formats: CSV and XLSX · Maximum file size:{' '}
                {MAX_FILE_SIZE_BYTES / (1024 * 1024)} MB
              </p>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-brand-border bg-brand-white px-4 py-2 text-sm font-semibold text-brand-text shadow-sm transition hover:bg-white"
              >
                <FileSpreadsheet className="h-4 w-4" aria-hidden />
                Browse Files
              </button>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept=".csv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
            className="sr-only"
            onChange={(e) => {
              assignFile(e.target.files?.[0])
              e.target.value = ''
            }}
          />

          {state.status === 'error' && (
            <div
              role="alert"
              className="mt-4 flex gap-3 rounded-xl border border-red-200 bg-brand-danger-light p-4"
            >
              <AlertCircle
                className="mt-0.5 h-5 w-5 shrink-0 text-brand-danger"
                aria-hidden
              />
              <p className="text-sm text-brand-text">{state.message}</p>
            </div>
          )}

          <ul className="mt-5 grid gap-2 sm:grid-cols-2">
            {UPLOAD_CHECKLIST.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-sm text-brand-muted"
              >
                <Check
                  className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue"
                  aria-hidden
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <a
              href="/sample-inventory-template.csv"
              download
              className="inline-flex items-center gap-2 text-sm font-medium text-brand-blue hover:underline"
            >
              <Download className="h-4 w-4" aria-hidden />
              Download Inventory Template
            </a>
            <button
              type="button"
              disabled={!canSubmit}
              onClick={() => void handleUpload()}
              className="inline-flex items-center justify-center rounded-xl bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-brand-blue/40"
            >
              Upload and View Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
