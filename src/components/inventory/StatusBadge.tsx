import { Check } from 'lucide-react'
import type { StatusLabel } from '../../types/inventory'

type StatusBadgeProps = {
  label: StatusLabel
}

const styles: Record<Exclude<StatusLabel, 'Reviewed'>, string> = {
  'Out of Stock':
    'bg-brand-danger-light text-brand-danger ring-brand-danger/20',
  Expired: 'bg-brand-danger-light text-brand-danger ring-brand-danger/20',
  'Low Stock': 'bg-brand-orange-light text-brand-orange ring-brand-orange/25',
  'Expiring Soon':
    'bg-brand-orange-light text-orange-700 ring-brand-orange/20',
  'No Recent Sales': 'bg-brand-blue-light text-brand-blue ring-brand-blue/20',
  'In Good Standing': 'bg-brand-blue-light text-brand-blue ring-brand-blue/20',
}

export function StatusBadge({ label }: StatusBadgeProps) {
  if (label === 'Reviewed') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
        <Check className="h-3 w-3" aria-hidden strokeWidth={2.5} />
        Reviewed
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[label]}`}
    >
      {label}
    </span>
  )
}
