import { Menu, Upload } from 'lucide-react'

type HeaderProps = {
  onUploadClick: () => void
  onMenuClick: () => void
}

export function Header({ onUploadClick, onMenuClick }: HeaderProps) {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

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
          </div>
        </div>

        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
          <time
            dateTime={new Date().toISOString().slice(0, 10)}
            className="text-sm text-brand-muted sm:text-right"
          >
            {today}
          </time>
          <button
            type="button"
            onClick={onUploadClick}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-orange px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 focus-visible:outline-offset-2"
          >
            <Upload className="h-4 w-4" aria-hidden />
            Upload Inventory File
          </button>
        </div>
      </div>
    </header>
  )
}
