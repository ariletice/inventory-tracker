import { Menu, Upload } from 'lucide-react'

type HeaderProps = {
  onUploadClick: () => void
  onMenuClick: () => void
  fileName?: string
  uploadedAt?: string
}

export function Header({
  onUploadClick,
  onMenuClick,
  fileName,
  uploadedAt,
}: HeaderProps) {
  const uploadedLabel = uploadedAt
    ? new Date(uploadedAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : null

  return (
    <header className="border-b border-brand-border bg-brand-white">
      <div className="flex flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex items-start gap-3">
          <button
            type="button"
            className="mt-0.5 rounded-lg p-2 text-brand-muted hover:bg-brand-bg lg:hidden"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-brand-navy sm:text-2xl">
              Inventory Priority Dashboard
            </h1>
            <p className="mt-1 max-w-xl text-sm text-brand-muted">
              Review the products that need attention today and what is coming
              next.
            </p>
            {fileName && (
              <p className="mt-2 text-xs text-brand-muted">
                Uploaded file:{' '}
                <span className="font-medium text-brand-text">{fileName}</span>
                {uploadedLabel ? ` · ${uploadedLabel}` : ''}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={onUploadClick}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-orange px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 focus-visible:outline-offset-2"
          >
            <Upload className="h-4 w-4" aria-hidden />
            Upload New File
          </button>
        </div>
      </div>
    </header>
  )
}
