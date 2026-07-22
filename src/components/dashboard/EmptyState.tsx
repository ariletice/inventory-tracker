import { FileSpreadsheet, Package } from 'lucide-react'

type EmptyStateProps = {
  onUploadClick: () => void
}

export function EmptyState({ onUploadClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-brand-border bg-brand-white px-6 py-16 text-center shadow-sm">
      <div className="relative mb-6" aria-hidden>
        <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-brand-blue-light text-brand-blue">
          <FileSpreadsheet className="h-12 w-12" strokeWidth={1.5} />
        </div>
        <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-orange-light text-brand-orange shadow-sm">
          <Package className="h-5 w-5" />
        </div>
      </div>
      <h2 className="max-w-md text-xl font-semibold text-brand-navy">
        Upload your inventory to see what needs attention.
      </h2>
      <p className="mt-2 max-w-md text-sm text-brand-muted">
        StockFlow will organize your inventory data and highlight urgent and
        upcoming products.
      </p>
      <button
        type="button"
        onClick={onUploadClick}
        className="mt-6 inline-flex items-center justify-center rounded-xl bg-brand-orange px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
      >
        Upload Inventory File
      </button>
    </div>
  )
}
